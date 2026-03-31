import { Mistral } from '@mistralai/mistralai';

const OCR_MODEL = 'mistral-ocr-latest';

/**
 * Converts a raw buffer + mimetype into a Mistral OCR document descriptor.
 * Supports image/* and application/pdf.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {{ type: string, imageUrl?: string, documentUrl?: string }}
 */
function buildDocument(buffer, mimetype) {
  const b64 = buffer.toString('base64');
  if (mimetype === 'application/pdf') {
    return { type: 'document_url', documentUrl: `data:application/pdf;base64,${b64}` };
  }
  const safe = mimetype?.startsWith('image/') ? mimetype : 'image/jpeg';
  return { type: 'image_url', imageUrl: `data:${safe};base64,${b64}` };
}

/**
 * Extracts structured Markdown text from an image or PDF using Mistral OCR.
 * Preserves headings, lists, and paragraph structure.
 *
 * @param {Buffer} buffer   Raw file bytes
 * @param {string} mimetype e.g. 'image/jpeg' | 'application/pdf'
 * @returns {Promise<string>} Extracted Markdown text
 */
export async function extractTextWithMistral(buffer, mimetype) {
  const apiKey = process.env.MISTRAL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  if (!buffer || buffer.length === 0) {
    throw new Error('Empty file buffer received');
  }

  const client = new Mistral({ apiKey });
  const document = buildDocument(buffer, mimetype);

  let response;
  try {
    response = await client.ocr.process({ model: OCR_MODEL, document });
  } catch (e) {
    const msg = e?.message || String(e);
    if (msg.includes('413') || msg.toLowerCase().includes('too large')) {
      throw new Error('Document processing failed, please try a smaller file.');
    }
    if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
      throw new Error('Mistral API key is invalid or missing.');
    }
    throw new Error(`Mistral OCR failed: ${msg}`);
  }

  const pages = response?.pages ?? [];
  if (!pages.length) {
    return '';
  }

  return pages
    .map((p) => (p.markdown ?? '').trim())
    .filter(Boolean)
    .join('\n\n');
}
