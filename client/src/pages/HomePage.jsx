import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { analyzeInput, uploadImageForOcr } from '../api/proofly.js';
import { Dropzone } from '../components/Dropzone.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

function StatusBadge({ icon, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="inline-flex items-center gap-2 rounded-full bg-cyan-400/8 px-3 py-1.5 text-xs font-medium text-cyan-200 ring-1 ring-cyan-400/20"
    >
      <span className="size-1.5 animate-pulse rounded-full bg-cyan-400" />
      {icon && <span>{icon}</span>}
      {label}
    </motion.div>
  );
}

export function HomePage() {
  const nav = useNavigate();
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ocrSnippet, setOcrSnippet] = useState('');
  const [scanPhase, setScanPhase] = useState(null);
  const [error, setError] = useState('');
  const prevObjectUrl = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      prevObjectUrl.current = url;
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
    };
  }, [file]);

  const busy = scanPhase !== null;

  const canSubmit = useMemo(
    () => (input.trim().length > 0 || file instanceof File) && !busy,
    [input, file, busy],
  );

  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
  }, []);

  async function handleDropzoneFile(selectedFile) {
    setFile(selectedFile);
    setOcrSnippet('');
    setError('');
    setScanPhase('scanning');
    try {
      const data = await uploadImageForOcr(selectedFile);
      setInput(data.text ?? '');
      setOcrSnippet(data.text ?? '');
    } catch (err) {
      setError(err?.message || 'OCR failed');
    } finally {
      setScanPhase(null);
      scrollToResults();
    }
  }

  async function onAnalyze(e) {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;
    setScanPhase('analyzing');
    try {
      const row = await analyzeInput({ text: input, file });
      nav(`/results/${row.id}`);
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setScanPhase(null);
    }
  }

  return (
    <motion.div
      className="space-y-14"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        className="mx-auto max-w-3xl text-center"
        variants={fadeUp}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <h1
          className="text-balance text-4xl sm:text-5xl font-heading tracking-tighter bg-gradient-to-b from-white via-slate-200 to-slate-400/70 bg-clip-text text-transparent"
          style={{ letterSpacing: '-0.03em' }}
        >
          Run a credibility check
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
          Paste text or upload an image—then analyze with Proofly.
        </p>
      </motion.section>

      <motion.section
        className="mx-auto max-w-5xl"
        variants={fadeUp}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <form onSubmit={onAnalyze} className="flex flex-col gap-14">
          {/* Text input card */}
          <motion.div
            className="flex flex-col h-full w-full rounded-[20px] bg-slate-950/50 border border-white/[0.08] p-8 shadow-[0_0_0_1px_rgba(148,163,184,0.06),0_24px_64px_rgba(2,6,23,0.7)] backdrop-blur-xl"
            whileHover={{ scale: 1.008, boxShadow: '0 0 0 1px rgba(148,163,184,0.1), 0 24px 64px rgba(2,6,23,0.75)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <label htmlFor="content" className="text-sm font-medium text-slate-200 mb-2">
              Paste text (optional if you attach an image)
            </label>
            <textarea
              id="content"
              name="content"
              value={input}
              onChange={(ev) => setInput(ev.target.value)}
              rows={10}
              placeholder="Drop an article snippet…"
              className="w-full flex-1 resize-y rounded-[14px] border border-white/8 bg-slate-950/25 px-4 py-3 text-base leading-[1.6] text-slate-100 outline-none ring-0 transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/15 font-sans"
              style={{ minHeight: 220 }}
            />

            <div className="mt-4 flex flex-col gap-3">
              {/* Analyze button */}
              <motion.button
                type="submit"
                disabled={!canSubmit}
                className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-[0_0_32px_rgba(139,92,246,0.25),0_0_12px_rgba(34,211,238,0.15)] transition focus:ring-4 focus:ring-violet-400/30 disabled:cursor-not-allowed disabled:opacity-40"
                whileHover={canSubmit ? { scale: 1.03, filter: 'brightness(1.08)' } : {}}
                whileTap={canSubmit ? { scale: 0.965 } : {}}
                animate={
                  scanPhase === 'analyzing'
                    ? {
                        boxShadow: [
                          '0 0 12px 2px rgba(139,92,246,0.2), 0 0 4px 1px rgba(34,211,238,0.1)',
                          '0 0 40px 10px rgba(139,92,246,0.45), 0 0 20px 4px rgba(34,211,238,0.3)',
                          '0 0 12px 2px rgba(139,92,246,0.2), 0 0 4px 1px rgba(34,211,238,0.1)',
                        ],
                      }
                    : { boxShadow: '0 0 32px rgba(139,92,246,0.25), 0 0 12px rgba(34,211,238,0.15)' }
                }
                transition={
                  scanPhase === 'analyzing'
                    ? { duration: 1.3, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.25 }
                }
              >
                {/* Button shine */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                >
                  <span
                    className="absolute -inset-y-1 w-1/3 -translate-x-full bg-gradient-to-r from-white/0 via-white/50 to-white/0 opacity-40"
                    style={{
                      animation: 'prooflyButtonShine 9s cubic-bezier(0.4,0.0,0.2,1) infinite',
                    }}
                  />
                </span>
                {scanPhase === 'analyzing' ? (
                  <>
                    <span className="size-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    Analyze
                    <span aria-hidden>→</span>
                  </>
                )}
              </motion.button>

              {/* Analyzing status line */}
              <AnimatePresence>
                {scanPhase === 'analyzing' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <p className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
                      <span className="size-3 animate-spin rounded-full border border-cyan-300/40 border-t-cyan-300" />
                      Running credibility analysis…
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-50">
                {error}
              </div>
            ) : null}
          </motion.div>

          {/* Magic Scan card */}
          <motion.div
            className="flex flex-col h-full w-full rounded-[20px] bg-slate-950/50 border border-white/[0.08] p-8 shadow-[0_0_0_1px_rgba(148,163,184,0.06),0_24px_64px_rgba(2,6,23,0.7)] backdrop-blur-xl items-center justify-center"
            variants={fadeUp}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            whileHover={!file ? { scale: 1.012 } : {}}
          >
            <label className="text-sm font-medium text-slate-200 mb-1 text-center">
              <span className="text-cyan-400 font-semibold">TruthLens™ — Forensic OCR</span>
            </label>
            <p className="text-xs text-slate-500 mb-3 text-center">AI-powered deep-scan for document integrity.</p>

            <Dropzone onFile={handleDropzoneFile} className="w-full max-w-md mx-auto" />

            {/* Image preview with laser */}
            <AnimatePresence>
              {previewUrl && (
                <motion.div
                  key={previewUrl}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative mt-5 w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-slate-950/40"
                >
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="w-full max-h-52 object-contain"
                    draggable={false}
                  />

                  {/* Laser scan overlay */}
                  <AnimatePresence>
                    {scanPhase === 'scanning' && (
                      <motion.div
                        key="laser"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-slate-950/40 rounded-xl" />
                        <motion.div
                          className="absolute left-0 right-0 h-px"
                          style={{
                            background:
                              'linear-gradient(to right, transparent 0%, rgba(34,211,238,0.15) 15%, rgba(34,211,238,0.9) 50%, rgba(34,211,238,0.15) 85%, transparent 100%)',
                            boxShadow:
                              '0 0 8px 3px rgba(34,211,238,0.5), 0 0 20px 6px rgba(34,211,238,0.2)',
                          }}
                          animate={{ top: ['4%', '92%', '4%'] }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status badges during scanning */}
            <AnimatePresence>
              {scanPhase === 'scanning' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <StatusBadge label="Extracting text via OCR…" />
                    <StatusBadge label="Preparing results…" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skeleton placeholder while OCR runs */}
            <AnimatePresence>
              {scanPhase === 'scanning' && (
                <motion.div
                  key="scan-skeletons"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden mt-6 w-full"
                >
                  <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 space-y-3">
                    <div className="h-2.5 w-24 rounded-full bg-white/8 animate-pulse" />
                    <div className="h-6 w-20 rounded-lg bg-white/6 animate-pulse" />
                    <div className="h-2 w-full rounded-full bg-white/5 animate-pulse" />
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-cyan-400/30"
                        animate={{ width: ['0%', '70%', '40%', '90%'] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OCR scan results */}
            <AnimatePresence>
              {scanPhase === null && ocrSnippet && (
                <motion.div
                  key="scan-results"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ duration: 0.5, ease: 'cubic-bezier(0.4,0.0,0.2,1)' }}
                  className="mt-6 w-full"
                >
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="size-1.5 rounded-full bg-cyan-400" />
                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Extracted Text
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4 max-h-[22rem] overflow-auto">
                      <pre className="m-0 text-sm text-slate-200 whitespace-pre-wrap break-words font-mono leading-[1.55]">
                        {ocrSnippet}
                      </pre>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono">{ocrSnippet.length.toLocaleString()} chars</span>
                      <span>·</span>
                      <span className="font-mono">
                        {ocrSnippet.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words
                      </span>
                      <span>·</span>
                      <span className="text-cyan-400/70">extracted via OCR</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(ocrSnippet)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/30 hover:text-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        </svg>
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([ocrSnippet], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'extracted-text.txt';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/30 hover:text-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                        Download .txt
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filename */}
            <AnimatePresence>
              {file && scanPhase === null && (
                <motion.p
                  key={file.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 text-xs text-slate-600 font-mono text-center"
                >
                  {file.name}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Empty state — shown when no result and not scanning */}
            <AnimatePresence>
              {!ocrSnippet && scanPhase === null && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-6 w-full"
                >
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-slate-950/20 py-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-9 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>
                    </svg>
                    <span className="text-xs text-slate-600">Results will appear here after analysis.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll anchor — targeted after scan completes */}
            <div ref={resultsRef} />
          </motion.div>
        </form>
      </motion.section>

      <style>
        {`
          @keyframes prooflyButtonShine {
            0% { transform: translateX(-120%); opacity: 0; }
            5% { opacity: 0.8; }
            12% { transform: translateX(140%); opacity: 0; }
            100% { transform: translateX(140%); opacity: 0; }
          }
        `}
      </style>
    </motion.div>
  );
}
