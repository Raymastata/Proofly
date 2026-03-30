const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Upload an image: OCR + pixel AI art score + text AI signals.
 * @param {File} file
 * @returns {Promise<{ text: string, imageAnalysis: object, textAnalysis: object }>}
 */
export async function uploadImageForOcr(file) {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || 'OCR failed');
  }
  return data;
}
/**
 * Thin fetch wrapper — swap base URL for production behind the same origin.
 */
async function parseJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { error: text || 'Invalid JSON' };
  }
}

/**
 * @param {string | { input?: string; file?: File | null }} payload Plain string (text/URL) or { input, file } for multipart
 */
export async function analyzeInput(payload) {
  const isString = typeof payload === 'string';
  const textInput = isString ? payload : (payload?.text ?? '');
  const file = isString ? null : (payload?.file ?? null);

  const init =
    file instanceof File
      ? (() => {
          const body = new FormData();
          body.append('text', textInput);
          body.append('file', file, file.name);
          return { method: 'POST', body };
        })()
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textInput }),
        };

  const res = await fetch(`${API_URL}/api/analyze`, init);
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || 'Analysis failed');
  }
  return data;
}

export async function fetchAnalysis(id) {
  const res = await fetch(`${API_URL}/api/analyses/${encodeURIComponent(id)}`);
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || 'Could not load analysis');
  }
  return data;
}

/**
 * @param {string} text Source passage to humanize
 * @returns {Promise<{ rewritten: string }>}
 */
export async function humanizeSourceText(text) {
  const res = await fetch(`${API_URL}/api/humanize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || 'Humanization failed');
  }
  return data;
}
