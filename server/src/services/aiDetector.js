/**
 * Content authenticity signals via Proofly Intelligence Engine.
 */

export const HF_DETECTOR_MODEL = 'Proofly Intelligence Engine';

const MAX_CHARS = 4000;

function requireHuggingFaceToken() {
  const token = process.env.HUGGING_FACE_TOKEN?.trim();
  if (!token) {
    throw new Error('HUGGING_FACE_TOKEN is not configured');
  }
  return token;
}

/**
 * @param {unknown} data
 * @returns {{ real: number, fake: number }}
 */
function extractRealFakeScores(data) {
  let list = data;
  if (Array.isArray(data) && data.length && Array.isArray(data[0])) {
    list = data[0];
  }
  if (!Array.isArray(list)) {
    throw new Error('Unexpected classification response shape');
  }

  let real = null;
  let fake = null;
  for (const item of list) {
    const label = String(item?.label ?? '');
    const s = Number(item?.score);
    if (!Number.isFinite(s)) continue;
    const L = label.toLowerCase();
    if (L === 'real') real = s;
    else if (L === 'fake') fake = s;
  }

  if (real != null && fake == null) fake = 1 - real;
  else if (fake != null && real == null) real = 1 - fake;

  if (real == null || fake == null) {
    throw new Error('Could not read Real/Fake scores from model output');
  }

  return { real, fake };
}

/**
 * @param {string} text
 */
async function classifyWithHuggingFace(text) {
  const token = requireHuggingFaceToken();
  const url = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(HF_DETECTOR_MODEL)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text }),
  });

  const bodyText = await res.text();
  let data;
  try {
    data = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    throw new Error(
      `Proofly Intelligence Engine returned non-JSON (${res.status}): ${bodyText?.slice(0, 300) ?? ''}`
    );
  }

  if (!res.ok) {
    const msg =
      (typeof data?.error === 'string' ? data.error : null) ||
      (typeof data?.message === 'string' ? data.message : null) ||
      bodyText ||
      res.statusText;
    throw new Error(`Proofly Intelligence Engine error (${res.status}): ${msg}`);
  }

  return data;
}

/**
 * @param {string} text
 */
export async function detectAiTextSignals(text) {
  const body = (text || '').trim();
  if (!body) {
    throw new Error('No text to analyze');
  }

  const snippet = body.length > MAX_CHARS ? body.slice(0, MAX_CHARS) : body;
  const truncated = body.length > MAX_CHARS;

  const raw = await classifyWithHuggingFace(snippet);
  const { real, fake } = extractRealFakeScores(raw);

  const realPercent = Math.max(0, Math.min(100, Math.round(real * 100)));
  const fakePercent = Math.max(0, Math.min(100, Math.round(fake * 100)));

  /** Human-likeness score for the existing UI (higher = more human). */
  const score = realPercent;

  const explanation =
    `Proofly Intelligence Engine: about ${realPercent}% Real (human-like) vs ${fakePercent}% Synthetic. ` +
    `Analysis uses deep-learning linguistic modeling to estimate human vs. synthetic probability. Accuracy may vary based on text length.` +
    (truncated ? ` Analysis used the first ${MAX_CHARS} characters of the input.` : '');

  const highlights = [];
  if (fake > real && body.length > 0) {
    highlights.push({
      start: 0,
      end: body.length,
      label: 'Linguistic Anomalies',
    });
  }

  return {
    score,
    explanation,
    highlights,
    realPercent,
    fakePercent,
  };
}
