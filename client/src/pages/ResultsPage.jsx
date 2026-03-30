import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { fetchAnalysis, humanizeSourceText } from '../api/proofly.js';
import { HighlightedText } from '../components/HighlightedText.jsx';
import { ScoreBadge } from '../components/ScoreBadge.jsx';

function SparklesIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.25 2.25 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.25 2.25 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.272 17.272a.75.75 0 0 1 .593.672l.137 1.224a.375.375 0 0 0 .498.355l1.155-.384a.75.75 0 0 1 .948.948l-.384 1.155a.375.375 0 0 0 .355.498l1.224.137a.75.75 0 0 1 .43 1.272l-.858.858a.375.375 0 0 0-.108.318l.137 1.224a.75.75 0 0 1-1.272.43l-.858-.858a.375.375 0 0 0-.318-.108l-1.224.137a.75.75 0 0 1-.948-.948l.384-1.155a.375.375 0 0 0-.355-.498l-1.224-.137a.75.75 0 0 1-.43-1.272l.858-.858a.375.375 0 0 0 .108-.318l-.137-1.224a.75.75 0 0 1 .672-.593h.001Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Results surface: fetch persisted record and render score + rationale + highlights.
 */
export function ResultsPage() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [humanizedText, setHumanizedText] = useState('');
  const [humanizeToast, setHumanizeToast] = useState('');
  const humanizeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAnalysis(id);
        if (!cancelled) setRow(data);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setHumanizedText('');
    setHumanizeToast('');
  }, [id]);

  useEffect(() => {
    if (!humanizedText) return;
    setTimeout(() => {
      humanizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }, [humanizedText]);

  useEffect(() => {
    if (!humanizeToast) return undefined;
    const t = window.setTimeout(() => setHumanizeToast(''), 4800);
    return () => window.clearTimeout(t);
  }, [humanizeToast]);

  /** If the model/store returns plain text or nested JSON in explanation, avoid crashes and show raw text when parse fails. */
  const safeDisplay = useMemo(() => {
    if (!row) {
      return { text: '', highlights: [], explanation: '', score: 0 };
    }
    try {
      const text = typeof row.text === 'string' ? row.text : '';
      const highlights = Array.isArray(row.highlights) ? row.highlights : [];

      let score = row.score;
      if (!Number.isFinite(Number(score)) && row.meta?.realPercent != null) {
        score = row.meta.realPercent;
      }
      let explanation =
        typeof row.explanation === 'string'
          ? row.explanation
          : row.explanation != null
            ? String(row.explanation)
            : '';

      const trimmed = explanation.trim();
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object') {
            if (typeof parsed.explanation === 'string') {
              explanation = parsed.explanation;
            }
            const n = Number(parsed.score);
            if (Number.isFinite(n)) {
              score = n;
            }
          }
        } catch {
          explanation = trimmed;
        }
      }

      const safeScore = Number.isFinite(Number(score)) ? Number(score) : 0;

      return { text, highlights, explanation, score: safeScore };
    } catch (e) {
      console.warn('ResultsPage: failed to normalize analysis row', e);
      return {
        text: typeof row.text === 'string' ? row.text : '',
        highlights: [],
        explanation:
          typeof row.explanation === 'string'
            ? row.explanation
            : String(row?.explanation ?? 'Unexpected report shape; showing raw fields where possible.'),
        score: 0,
      };
    }
  }, [row]);

  const handleHumanize = useCallback(async () => {
    const source = row?.text?.trim();
    if (!source) return;
    setIsHumanizing(true);
    setHumanizeToast('');
    try {
      const data = await humanizeSourceText(source);
      const rewritten = data?.rewritten;
      if (typeof rewritten === 'string') {
        setHumanizedText(rewritten);
      } else if (rewritten != null) {
        try {
          setHumanizedText(JSON.stringify(rewritten));
        } catch {
          setHumanizedText(String(rewritten));
        }
      } else {
        setHumanizedText('');
      }
    } catch (e) {
      setHumanizeToast(e?.message || 'Humanization service is currently busy.');
      setHumanizedText('');
    } finally {
      setIsHumanizing(false);
    }
  }, [row?.text]);

  const handleCopyHumanized = useCallback(async () => {
    if (!humanizedText) return;
    try {
      await navigator.clipboard.writeText(humanizedText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = humanizedText;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
    }
  }, [humanizedText]);

  const chips = useMemo(() => {
    if (!row) return [];
    return [
      row.inputType === 'url'
        ? 'URL (simulated fetch)'
        : row.inputType === 'image'
          ? 'Image (OCR)'
          : 'Free text',
      
    ].filter(Boolean);
  }, [row]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <span className="size-5 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
          Loading analysis…
        </div>
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-50">
        <div className="text-lg font-semibold">We couldn’t load that report</div>
        <p className="mt-2 text-sm text-rose-100/90">{error || 'Unknown error'}</p>
        <Link className="mt-6 inline-flex rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15" to="/">
          Start over
        </Link>
      </div>
    );
  }

  const isHighRisk = safeDisplay.score >= 70;

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scaleY: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      transition: { type: 'spring', stiffness: 220, damping: 26 },
    },
  };

  return (
    <motion.div
      className="relative space-y-8"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <AnimatePresence>
        {humanizeToast ? (
          <motion.div
            key="toast"
            role="alert"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-2xl border border-rose-400/35 bg-rose-950/95 px-5 py-3 text-center text-sm font-medium text-rose-100 shadow-[0_0_40px_rgba(244,63,94,0.25)] backdrop-blur-xl"
          >
            {humanizeToast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        variants={cardVariants}
      >
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Analysis</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white font-mono">Content Authenticity Report</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Analysis uses deep-learning linguistic modeling to estimate human vs. synthetic probability. Accuracy may vary based on text length.
            "Real" %). Humanize uses Mistral. Estimates only—pair with context and judgment.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={isHumanizing || !row.text?.trim()}
            onClick={handleHumanize}
            className="group relative inline-flex items-center justify-center gap-2 rounded-2xl p-[1px] text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.15)] transition hover:shadow-[0_0_32px_rgba(139,92,246,0.25)] disabled:pointer-events-none disabled:opacity-45"
          >
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 opacity-90 transition group-hover:opacity-100" />
            <span className="relative flex w-full items-center justify-center gap-2 rounded-[0.9rem] bg-slate-950/95 px-4 py-2.5 ring-1 ring-white/10 backdrop-blur-sm">
              {isHumanizing ? (
                <span className="size-4 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
              ) : (
                <SparklesIcon className="size-4 text-cyan-200" />
              )}
              Humanize text
            </span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
          >
            New check
          </Link>
        </div>
      </motion.div>

      <motion.div className="grid gap-6 lg:grid-cols-5" variants={cardVariants}>
        <motion.section
          className="rounded-3xl bg-slate-950/35 p-8 shadow-[var(--shadow-glow)] backdrop-blur-xl lg:col-span-2"
          style={{ originY: 0 }}
          animate={
            isHighRisk
              ? {
                  boxShadow: [
                    '0 0 0 1px rgba(248,113,113,0.15), 0 20px 60px rgba(2,6,23,0.65)',
                    '0 0 0 1px rgba(248,113,113,0.55), 0 0 28px 4px rgba(248,113,113,0.18), 0 20px 60px rgba(2,6,23,0.65)',
                    '0 0 0 1px rgba(248,113,113,0.15), 0 20px 60px rgba(2,6,23,0.65)',
                  ],
                }
              : { boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(2,6,23,0.65)' }
          }
          transition={
            isHighRisk
              ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        >
          <ScoreBadge score={safeDisplay.score} />
          {row.meta?.realPercent != null && row.meta?.fakePercent != null ? (
            <p className="mt-3 text-sm text-slate-400">
              Detector:{' '}
              <span className="font-medium text-emerald-200/90">{row.meta.realPercent}% Real</span>
              <span className="text-slate-500"> · </span>
              <span className="font-medium text-rose-200/85">{row.meta.fakePercent}% Fake</span>
            </p>
          ) : null}
          {safeDisplay.explanation ? (
            <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
              {safeDisplay.explanation}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-white/10">
                {c}
              </span>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="rounded-3xl bg-slate-950/35 p-8 shadow-[var(--shadow-glow)] ring-1 ring-white/10 backdrop-blur-xl lg:col-span-3"
          style={{ originY: 0 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Source text</div>
              <div className="mt-2 text-sm text-slate-400">
                When flagged, the full passage is highlighted as a <span className="font-mono">Linguistic Anomaly</span> (no phrase-level
                attribution from the model).
              </div>
            </div>
            {row.sourceUrl ? (
              <a
                className="max-w-[14rem] truncate text-xs font-medium text-cyan-200 hover:text-white"
                href={row.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {row.sourceUrl}
              </a>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/25 p-5">
            <HighlightedText text={safeDisplay.text} highlights={safeDisplay.highlights} />
          </div>

          {Array.isArray(safeDisplay.highlights) && safeDisplay.highlights.length ? (
            <div className="mt-6">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Flagged patterns</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {safeDisplay.highlights.map((h, idx) => (
                  <li key={`${h.start}-${h.end}-${idx}`} className="flex gap-3">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-300/70" />
                    <span>
                      <span className="font-medium text-slate-100">
                        "{safeDisplay.text.slice(h.start, h.end)}"
                      </span>
                      <span className="text-slate-500"> — </span>
                      <span className="text-slate-400">{h.label}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-6 text-sm text-slate-400">No full-passage synthetic highlight for this run (estimate below the highlight threshold).</div>
          )}
        </motion.section>
      </motion.div>

      <AnimatePresence>
        {humanizedText ? (
          <motion.section
            key="humanized"
            ref={humanizeRef}
            initial={{ opacity: 0, scaleY: 0.92, y: 20 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            style={{ originY: 0 }}
            className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-violet-950/40 p-8 shadow-[0_0_60px_rgba(34,211,238,0.12),0_0_80px_rgba(139,92,246,0.08)] ring-1 ring-cyan-400/15 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/90">
                  <SparklesIcon className="size-3.5 text-violet-300" />
                  Refined Version
                </div>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Mistral humanization pass—same meaning, more natural rhythm. Review before publishing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyHumanized}
                className="relative inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-cyan-400/30 transition hover:bg-white/15 hover:ring-cyan-400/50"
              >
                Copy to clipboard
              </button>
            </div>
            <div className="relative mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-sm leading-relaxed text-slate-100 shadow-inner">
              <p className="whitespace-pre-wrap">{humanizedText}</p>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
