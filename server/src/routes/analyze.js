import { Router } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';

import { analyzeWithMistral, ANALYZER_MODEL } from '../services/mistralAnalyzer.js';
import { extractTextWithMistral } from '../services/mistralOcr.js';
import { materializeInput, mockAnalyze } from '../services/mockAnalyzer.js';
import { saveAnalysis } from '../store/memoryStore.js';

const analyzeRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype?.startsWith('image/') || file.mimetype === 'application/pdf';
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF uploads are supported.'));
    }
  },
});

function multipartIfNeeded(req, res, next) {
  if (req.is('multipart/form-data')) {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'Document processing failed, please try a smaller file.',
        });
      }
      if (err) {
        return res.status(400).json({ error: err.message || 'Invalid file upload.' });
      }
      next();
    });
  } else {
    next();
  }
}

/**
 * Detect input type from request.
 * @returns {'text' | 'image' | 'pdf' | 'url'}
 */
function detectInputType(rawText, file) {
  if (file) {
    return file.mimetype === 'application/pdf' ? 'pdf' : 'image';
  }
  if (/^https?:\/\//i.test((rawText || '').trim())) return 'url';
  return 'text';
}

/**
 * Run OCR on an uploaded file using Mistral.
 * Returns the extracted Markdown text.
 */
async function runOcr(file) {
  const text = await extractTextWithMistral(file.buffer, file.mimetype);
  if (!text) {
    const type = file.mimetype === 'application/pdf' ? 'PDF' : 'image';
    throw new Error(
      `Could not extract readable text from this ${type}. Try a clearer file or paste the text directly.`
    );
  }
  return text;
}

/**
 * Run AI-content analysis. Tries Mistral first, falls back to mock.
 */
async function runAnalysis(text, inputType, sourceUrl) {
  try {
    return await analyzeWithMistral(text);
  } catch (primaryErr) {
    console.error('[analyze] Mistral analysis failed, falling back to mock:', primaryErr.message);
    try {
      const mock = mockAnalyze({ text, inputType, sourceUrl });
      return {
        score: mock.score,
        aiScore: 100 - mock.score,
        explanation: mock.explanation + ' (Mock Fallback — Mistral unavailable)',
        highlights: mock.highlights,
        realPercent: mock.score,
        fakePercent: 100 - mock.score,
        roboticPhrases: [],
      };
    } catch (mockErr) {
      throw new Error(
        `Analysis failed: ${primaryErr.message} (fallback also failed: ${mockErr.message})`
      );
    }
  }
}

/**
 * POST /api/analyze
 *
 * Universal Pipeline:
 *   1. Detect input: raw text | image | PDF | URL
 *   2. OCR (Mistral) if image or PDF
 *   3. Seamlessly hand extracted text to Mistral Forensic Analyst
 *   4. Return standardized record with extractedText, aiScore, reasoning
 *
 * OCR-only mode (no `text` field sent):
 *   Returns { text } so the client can preview extracted content before analysis.
 */
analyzeRouter.post('/', multipartIfNeeded, async (req, res) => {
  const rawText = (req.body?.text ?? '').toString().trim();
  const hasFile = Boolean(req.file?.buffer);
  const inputType = detectInputType(rawText, req.file);

  // ── OCR-only mode ────────────────────────────────────────────────────────
  // File uploaded with no text body → extract text, return preview to client.
  if (hasFile && !rawText) {
    try {
      const extractedText = await runOcr(req.file);
      return res.status(200).json({ text: extractedText });
    } catch (e) {
      const msg = e?.message || 'Document processing failed, please try a smaller file.';
      console.error('[analyze/ocr-only]', msg);
      return res.status(400).json({ error: msg });
    }
  }

  // ── Full analysis pipeline ───────────────────────────────────────────────
  const parts = [];
  let resolvedType = inputType;
  let sourceUrl = null;
  let extractedText = null;

  // 1. Materialize text / URL input
  if (rawText) {
    const materialized = materializeInput(rawText);
    resolvedType = materialized.inputType;
    sourceUrl = materialized.sourceUrl;
    parts.push(materialized.text);
  }

  // 2. OCR the file if present (Mistral OCR → Markdown)
  if (hasFile) {
    try {
      extractedText = await runOcr(req.file);
      parts.push(extractedText);
      if (!rawText) {
        resolvedType = inputType;
      }
    } catch (e) {
      if (!rawText) {
        return res.status(400).json({
          error: e?.message || 'Document processing failed, please try a smaller file.',
        });
      }
      console.warn('[analyze] OCR failed but text is present, continuing:', e.message);
    }
  }

  const analyzedText = parts.join('\n\n').trim();

  if (!analyzedText) {
    return res.status(400).json({
      error: 'Provide text, a URL, or a document with readable content.',
    });
  }

  // 3. Run Forensic Analysis
  const started = Date.now();
  let analysis;
  try {
    analysis = await runAnalysis(analyzedText, resolvedType, sourceUrl);
  } catch (e) {
    console.error('[analyze] Fatal analysis error:', e.message);
    return res.status(502).json({
      error: e?.message || 'Analysis service unavailable. Please try again.',
    });
  }

  // 4. Persist and respond
  const id = nanoid(12);
  const originalInput =
    rawText || (req.file ? `[${resolvedType.toUpperCase()}: ${req.file.originalname || 'upload'}]` : analyzedText.slice(0, 200));

  const record = {
    id,
    inputType: resolvedType,
    sourceUrl,
    originalInput,
    text: analyzedText,
    extractedText: extractedText ?? null,
    score: analysis.score,
    aiScore: analysis.aiScore,
    explanation: analysis.explanation,
    highlights: analysis.highlights,
    roboticPhrases: analysis.roboticPhrases ?? [],
    meta: {
      detectorModel: ANALYZER_MODEL,
      realPercent: analysis.realPercent,
      fakePercent: analysis.fakePercent,
      latencyMs: Date.now() - started,
    },
  };

  await saveAnalysis(record);
  res.status(201).json(record);
});

export { analyzeRouter };
