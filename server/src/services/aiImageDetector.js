const HF_ART_MODEL = 'umm-maybe/AI-image-detector';
const HF_ART_API = `https://api-inference.huggingface.co/models/${HF_ART_MODEL}`;

/**
 * @param {unknown} data  Raw classification array from HF
 * @returns {{ artificial: number, human: number }}
 */
function extractArtScores(data) {
  let list = data;
  if (Array.isArray(data) && data.length && Array.isArray(data[0])) {
    list = data[0];
  }
  if (!Array.isArray(list)) {
    throw new Error('Unexpected image classifier response shape');
  }

  let artificial = null;
  let human = null;

  for (const item of list) {
    const label = String(item?.label ?? '').toLowerCase();
    const score = Number(item?.score);
    if (!Number.isFinite(score)) continue;
    if (label === 'artificial') artificial = score;
    else if (label === 'human') human = score;
  }

  if (artificial != null && human == null) human = 1 - artificial;
  else if (human != null && artificial == null) artificial = 1 - human;

  if (artificial == null || human == null) {
    throw new Error('Could not parse artificial/human scores from image model');
  }

  return { artificial, human };
}

/**
 * Sends raw image bytes to umm-maybe/AI-image-detector on Hugging Face
 * and returns pixel-level AI art probability (not text-based).
 *
 * Endpoint: https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector
 *
 * @param {Buffer} buffer   Raw image bytes
 * @param {string} [mimetype]  e.g. 'image/jpeg'
 * @returns {Promise<{ aiPercent: number, humanPercent: number, label: 'AI-Generated' | 'Human-Made' }>}
 */
export async function detectAiArt(buffer, mimetype = 'application/octet-stream') {
  const token = (process.env.HUGGINGFACE_API_KEY ?? '').trim();
  if (!token) {
    throw new Error('HUGGINGFACE_API_KEY is not configured');
  }

  console.log(
    "Sending request to HF with key:",
    process.env.HUGGINGFACE_API_KEY ? 'Present' : 'MISSING'
  );

  const res = await fetch(HF_ART_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': mimetype,
    },
    body: buffer,
  });

  const bodyText = await res.text();
  let data;
  try {
    data = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    throw new Error(
      `AI art detector returned non-JSON (${res.status}): ${bodyText?.slice(0, 200) ?? ''}`
    );
  }

  if (!res.ok) {
    const msg =
      (typeof data?.error === 'string' ? data.error : null) ||
      (typeof data?.message === 'string' ? data.message : null) ||
      bodyText ||
      res.statusText;
    throw new Error(`AI art detector error (${res.status}): ${msg}`);
  }

  const { artificial, human } = extractArtScores(data);

  const aiPercent = Math.max(0, Math.min(100, Math.round(artificial * 100)));
  const humanPercent = Math.max(0, Math.min(100, Math.round(human * 100)));
  const label = aiPercent >= 50 ? 'AI-Generated' : 'Human-Made';

  return { aiPercent, humanPercent, label };
}
