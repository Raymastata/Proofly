import { Router } from 'express';

import { getAnalysis } from '../store/memoryStore.js';

export const analysesRouter = Router();

/**
 * GET /api/analyses/:id
 * Hydrates the results screen after navigation or refresh.
 */
analysesRouter.get('/:id', async (req, res) => {
  const row = await getAnalysis(req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(row);
});
