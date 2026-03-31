/**
 * Proofly API entry: boots Express and wires middleware + routes.
 * Replace mock analysis with a real model/crawler without changing the HTTP shape.
 */
import cors from 'cors';
// Add CORS for safety in dev (must be first)
const corsMiddleware = cors();

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
console.log('--- Proofly API Key Check ---');
console.log('Mistral AI (OCR + Analysis):', process.env.MISTRAL_API_KEY ? '✅ Configured' : '❌ Missing — set MISTRAL_API_KEY in .env');
console.log('Google Gemini (optional):', process.env.GOOGLE_API_KEY ? '✅ Configured' : '⚠️  Not set');
console.log('-----------------------------');

import express from 'express';
import { analyzeRouter } from './routes/analyze.js';
import { analysesRouter } from './routes/analyses.js';
import { humanizeRouter } from './routes/humanize.js';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(corsMiddleware);
app.use(express.json());

// API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/analyses', analysesRouter);
app.use('/api/humanize', humanizeRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'proofly-api' });
});

app.listen(PORT, () => console.log(`Proofly API listening on http://localhost:${PORT}`));
