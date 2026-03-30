import { Router } from 'express';

import {
  humanizeTextWithLlm,
  MISTRAL_CONNECTION_ERROR,
} from '../services/humanize.js';

export const humanizeRouter = Router();

const MAX_LEN = 50_000;

/**
 * POST /api/humanize
 * Body: { text: string }
 * Response: { rewritten: string }
 */
humanizeRouter.post('/', async (req, res) => {
  const text = (req.body?.text ?? '').toString();
  const trimmed = text.trim();

  if (!trimmed) {
    return res.status(400).json({ error: 'text is required' });
  }
  if (trimmed.length > MAX_LEN) {
    return res.status(400).json({ error: `text must be at most ${MAX_LEN} characters` });
  }

  try {
    const rewritten = await humanizeTextWithLlm(trimmed);
    return res.json({ rewritten });
  } catch (e) {
    const code = e?.statusCode;
    if (code === 401 || code === 429 || e?.message === MISTRAL_CONNECTION_ERROR) {
      console.error('[humanize]', MISTRAL_CONNECTION_ERROR, code ?? '');
      return res.status(503).json({ error: MISTRAL_CONNECTION_ERROR });
    }
    console.error('[humanize]', e?.message || e);
    return res.status(503).json({ error: 'Humanization service is currently busy.' });
  }
});
