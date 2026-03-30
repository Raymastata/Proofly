import { GoogleGenerativeAI } from '@google/generative-ai';

/** Default matches stable Generative Language API model IDs (v1). Override with GEMINI_MODEL. */
export const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();

/** Use stable v1 instead of the SDK default v1beta. */
export const GEMINI_REQUEST_OPTIONS = { apiVersion: 'v1' };

let loggedGeminiInit = false;

export function requireGeminiClient() {
  const key = process.env.GOOGLE_API_KEY?.trim();
  if (!key) {
    throw new Error('GOOGLE_API_KEY is not configured');
  }
  const client = new GoogleGenerativeAI(key);
  if (!loggedGeminiInit) {
    console.log('Gemini initialized successfully');
    loggedGeminiInit = true;
  }
  return client;
}

/**
 * Logs everything useful from Google AI SDK errors (HTTP body details, stack, etc.).
 * @param {string} context
 * @param {unknown} err
 */
export function logGeminiErrorFull(context, err) {
  console.log(`[Gemini] ${context}`);
  if (err instanceof Error) {
    console.log('message:', err.message);
    console.log('stack:', err.stack);
    console.log('name:', err.name);
  } else {
    console.log('non-Error thrown:', err);
  }
  if (err && typeof err === 'object') {
    if ('status' in err) {
      console.log('HTTP status:', err.status, err.statusText ?? '');
    }
    if ('errorDetails' in err && err.errorDetails != null) {
      try {
        console.log('errorDetails:', JSON.stringify(err.errorDetails, null, 2));
      } catch {
        console.log('errorDetails:', err.errorDetails);
      }
    }
    if ('response' in err && err.response != null) {
      console.log('response:', err.response);
    }
    if ('cause' in err && err.cause != null) {
      console.log('cause:', err.cause);
    }
  }
  console.log('full error object:', err);
}
