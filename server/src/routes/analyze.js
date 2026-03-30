import { Router } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';

import { detectAiTextSignals, HF_DETECTOR_MODEL } from '../services/aiDetector.js';
import { materializeInput, mockAnalyze } from '../services/mockAnalyzer.js';
import { extractTextFromImage } from '../services/ocr.js';
import { saveAnalysis } from '../store/memoryStore.js';

const analyzeRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image uploads are supported'));
    }
  },
});

/**
 * Helper to parse multipart if present
 */
function multipartIfNeeded(req, res, next) {
  if (req.is('multipart/form-data')) {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message || 'Invalid file upload',
        });
      }
      next();
    });
  } else {
    next();
  }
}

/**
 * POST /api/analyze
 * OCR-only when a file is uploaded without `text` in the body:
 * - Request: multipart/form-data with field `file`
 * - Response: { text: extractedText }
 *
 * Otherwise, falls back to the existing text authenticity analysis.
 */
analyzeRouter.post('/', multipartIfNeeded, async (req, res) => {
  const rawIncomingText = req.body?.text;
  const hasImageFile = Boolean(req.file?.buffer);

  // OCR-only mode: uploaded image with no `text` provided.
  if (hasImageFile && (rawIncomingText == null || String(rawIncomingText).trim().length === 0)) {
    try {
      const extractedText = (await extractTextFromImage(req.file.buffer)).trim();
      if (!extractedText) {
        return res.status(400).json({
          error: 'Could not extract readable text from this image. Try a clearer photo.',
        });
      }
      return res.status(200).json({ text: extractedText });
    } catch (e) {
      return res.status(400).json({
        error: e?.message || 'OCR failed for this image',
      });
    }
  }

  console.log('Received body:', req.body);
  const userInput = (req.body?.text ?? '').toString().trim();
  const parts = [];
  let inputType = 'text';
  let sourceUrl = null;

  if (userInput) {
    const materialized = materializeInput(userInput);
    inputType = materialized.inputType;
    sourceUrl = materialized.sourceUrl;
    parts.push(materialized.text);
  }

  if (req.file?.buffer) {
    try {
      const ocrText = (await extractTextFromImage(req.file.buffer)).trim();
      if (ocrText) parts.push(ocrText);
      else if (!userInput) {
        return res.status(400).json({
          error: 'Could not extract readable text from this image. Try a clearer photo or paste text.',
        });
      }
    } catch (e) {
      return res.status(400).json({
        error: e?.message || 'OCR failed for this image',
      });
    }
    if (!userInput && parts.length) {
      inputType = 'image';
      sourceUrl = null;
    }
  }

  const analyzedText = parts.join('\n\n').trim();

  if (!analyzedText) {
    return res.status(400).json({ error: 'Provide text, a URL, or an image with readable text.' });
  }

  const started = Date.now();
  let analysis;
  try {
    console.log('Starting AI detection for text:', analyzedText.slice(0, 100) + '...');
    analysis = await detectAiTextSignals(analyzedText);
    console.log('Detection complete:', analysis);
  } catch (e) {
    console.error('AI Detection Error:', e.message);
    try {
      console.log('Falling back to mock analysis...');
      const mockResult = mockAnalyze({
        text: analyzedText,
        inputType: inputType,
        sourceUrl: sourceUrl,
      });
      analysis = {
        score: mockResult.score,
        explanation: mockResult.explanation + ' (Mock Fallback)',
        highlights: mockResult.highlights,
        realPercent: mockResult.score,
        fakePercent: 100 - mockResult.score,
      };
      console.log('Mock fallback complete:', analysis);
    } catch (mockError) {
      return res.status(500).json({
        error: `AI detection failed (${e.message}) and mock fallback also failed (${mockError.message})`,
      });
    }
  }

  const id = nanoid(12);
  const originalInput =
    userInput || (req.file ? `[Image: ${req.file.originalname || 'upload'}]` : analyzedText.slice(0, 200));

  const record = {
    id,
    inputType,
    sourceUrl,
    originalInput,
    text: analyzedText,
    score: analysis.score,
    explanation: analysis.explanation,
    highlights: analysis.highlights,
    meta: {
      detectorModel: HF_DETECTOR_MODEL,
      realPercent: analysis.realPercent,
      fakePercent: analysis.fakePercent,
      latencyMs: Date.now() - started,
    },
  };

  await saveAnalysis(record);
  res.status(201).json(record);
});

export { analyzeRouter };
