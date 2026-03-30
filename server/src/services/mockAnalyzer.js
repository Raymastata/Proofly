/**
 * Fake "AI" analysis — deterministic enough to feel real, cheap to run.
 * Signals: hype language, missing attribution, urgency tricks, vs. hedging and citations.
 */

const SUSPICIOUS_PATTERNS = [
  { re: /\b100%\s*(cure|guarantee|effective)\b/gi, label: 'Absolute medical/financial claim' },
  { re: /\b(doctors hate|one weird trick|miracle)\b/gi, label: 'Clickbait-style phrasing' },
  { re: /\b(shocking|secret they don'?t want you to know)\b/gi, label: 'Sensational framing' },
  { re: /\b(act now|limited time|don'?t miss out)\b/gi, label: 'Urgency / pressure language' },
  { re: /\b(proven|studies show)\b(?![^.]{0,80}(doi\.|http|published in|journal))/gi, label: 'Claim without clear source' },
  { re: /!!!|‼️/g, label: 'Excessive emphasis' },
];

const TRUST_BOOSTERS = [
  /\bpeer[- ]reviewed\b/i,
  /\bcitations?\b/i,
  /\bdoi:\s*\S+/i,
  /\bhttps?:\/\/\S+/i,
  /\baccording to [^,.]{5,80}(study|paper|report)\b/i,
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Collect non-overlapping highlight spans from regex matches (first-wins merge).
 */
function buildHighlights(text) {
  const raw = [];
  for (const { re, label } of SUSPICIOUS_PATTERNS) {
    const r = new RegExp(re.source, re.flags.replace('g', '') + 'g');
    let m;
    while ((m = r.exec(text)) !== null) {
      raw.push({ start: m.index, end: m.index + m[0].length, label });
    }
  }
  raw.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged = [];
  for (const span of raw) {
    const last = merged[merged.length - 1];
    if (last && span.start < last.end) {
      // Overlap: extend and combine labels
      last.end = Math.max(last.end, span.end);
      if (!last.label.includes(span.label)) last.label = `${last.label}; ${span.label}`;
      continue;
    }
    merged.push({ ...span });
  }
  return merged;
}

function countTrustSignals(text) {
  return TRUST_BOOSTERS.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
}

export function mockAnalyze({ text, inputType, sourceUrl }) {
  const body = (text || '').trim();
  const highlights = buildHighlights(body);
  const trust = countTrustSignals(body);
  const hypeHits = highlights.length;

  // Base score from "structure": length implies some effort (weak but demo-friendly).
  let score = 58 + Math.min(12, Math.floor(body.length / 400));

  score += trust * 6;
  score -= hypeHits * 11;
  score -= body.split(/\s+/).filter((w) => w.length > 14).length > 0 ? 4 : 0;

  const noise = (hashString(body) % 9) - 4; // ±4 deterministic jitter
  score += noise;

  score = Math.max(8, Math.min(96, Math.round(score)));

  let explanation =
    'The passage mixes ordinary statements with a few credibility weak points. ' +
    'Nothing here is definitive proof either way—treat it as a quick triage, not a verdict.';

  if (score >= 80) {
    explanation =
      'Tone and structure look measured, with fewer hype markers. ' +
      'If primary sources are present, they substantially support credibility—still verify claims that matter to you.';
  } else if (score <= 35) {
    explanation =
      'Multiple red-flag patterns appear (absolute claims, urgency, or unsourced assertions). ' +
      'Cross-check with independent reporting or primary documents before trusting consequential details.';
  }

  if (inputType === 'url') {
    explanation += ` We simulated page text for this demo; live crawling would run here for ${sourceUrl}.`;
  }

  return {
    score,
    explanation,
    highlights,
  };
}

/**
 * If the user pasted a URL, we don't fetch the network in MVP mode—
 * we generate plausible article-like text so the UI flow still works.
 */
export function materializeInput(rawInput) {
  const raw = (rawInput || '').trim();
  const looksLikeUrl = /^https?:\/\//i.test(raw);
  if (!looksLikeUrl) {
    return { inputType: 'text', sourceUrl: null, text: raw };
  }

  const simulated = [
    'Headline: "Breaking discovery changes everything overnight."',
    '',
    'The story leans on unnamed insiders and promises dramatic results without links to primary studies.',
    'Phrases like "miracle breakthrough" and "doctors hate this" appear near the top.',
    '',
    `Source URL (demo): ${raw}`,
  ].join('\n');

  return { inputType: 'url', sourceUrl: raw, text: simulated };
}
