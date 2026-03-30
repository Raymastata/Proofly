import { Mistral } from '@mistralai/mistralai';
import { MistralError } from '@mistralai/mistralai/models/errors';

/** Default: fast tier; override with MISTRAL_HUMANIZE_MODEL e.g. mistral-medium-latest */
const HUMANIZE_MODEL = (process.env.MISTRAL_HUMANIZE_MODEL || 'mistral-small-latest').trim();

export const MISTRAL_CONNECTION_ERROR =
  'Mistral API connection failed. Check your API key.';

function buildHumanizePrompt(userText) {
  return (
    'System: You are a world-class editor. Rewrite the following text to bypass AI detection perfectly. ' +
    "Use 'human-like' variance in sentence structure, add subtle nuance, and avoid predictable AI transition words. " +
    'Maintain the original meaning and professional tone. User Text: ' +
    (userText ?? '').toString()
  );
}

function assistantContentToString(content) {
  if (typeof content === 'string') return content;
  if (content == null) return '';
  if (!Array.isArray(content)) return String(content);
  return content
    .map((chunk) => {
      if (typeof chunk === 'string') return chunk;
      if (chunk && typeof chunk === 'object' && chunk.type === 'text' && chunk.text) {
        return String(chunk.text);
      }
      return '';
    })
    .join('');
}

/**
 * Rewrites text via Mistral.
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function humanizeTextWithLlm(text) {
  const apiKey = process.env.MISTRAL_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error(MISTRAL_CONNECTION_ERROR);
    err.statusCode = 401;
    throw err;
  }

  const client = new Mistral({ apiKey });
  const prompt = buildHumanizePrompt(text);

  let res;
  try {
    res = await client.chat.complete({
      model: HUMANIZE_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
  } catch (e) {
    if (e instanceof MistralError && (e.statusCode === 401 || e.statusCode === 429)) {
      const err = new Error(MISTRAL_CONNECTION_ERROR);
      err.statusCode = e.statusCode;
      throw err;
    }
    throw e;
  }

  let raw = assistantContentToString(res?.choices?.[0]?.message?.content);
  let rewritten = (raw || '').trim();
  if (rewritten.startsWith('```')) {
    rewritten = rewritten.replace(/^```(?:\w+)?\s*/i, '').replace(/\s*```$/u, '').trim();
  }
  if (!rewritten) {
    throw new Error('Empty response from language model');
  }
  return rewritten;
}
