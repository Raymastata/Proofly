/**
 * Full-viewport loading — gives the mock "AI" time to feel substantial.
 */
export function LoadingOverlay({ title = 'Analyzing content…', subtitle = 'Running credibility heuristics' }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 px-6 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-md rounded-2xl bg-slate-950/60 p-8 shadow-[var(--shadow-glow)] ring-1 ring-white/10">
        <div className="flex items-center gap-4">
          <span className="relative grid size-14 place-items-center">
            <span className="absolute size-14 rounded-2xl bg-gradient-to-br from-cyan-400/25 to-violet-500/25 blur-[2px]" />
            <span className="relative size-12 rounded-2xl bg-slate-950 ring-1 ring-white/10" />
            <span className="absolute size-8 rounded-full border-2 border-cyan-300/70 border-t-transparent animate-spin" />
          </span>
          <div className="min-w-0">
            <div className="text-base font-semibold text-white">{title}</div>
            <div className="mt-1 text-sm text-slate-400">{subtitle}</div>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
          <div className="proofly-indeterminate h-full w-2/5 bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 opacity-90" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">Source cues</span>
          <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">Claim detection</span>
          <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">Manipulation language</span>
        </div>
      </div>
    </div>
  );
}
