
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

let workerPromise;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng');
  }
  return workerPromise;
}

/**
 * Extracts text from an image buffer using Tesseract.js OCR.
 * Used for both analyze and upload endpoints.
 * @param {Buffer} buffer Raw image bytes (png, jpeg, webp, etc.)
 * @returns {Promise<string>} Extracted text or empty string if none found.
 */
export async function extractTextFromImage(buffer) {
  // Preprocess: upscale, grayscale, and threshold for better OCR
  let processed = buffer;
  try {
    processed = await sharp(buffer)
      .resize({ width: 1800, withoutEnlargement: false })
      .grayscale()
      .threshold(180)
      .toBuffer();
  } catch (e) {
    // fallback to original if sharp fails
  }
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(processed);
  return text || '';
}
