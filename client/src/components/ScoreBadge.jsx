/**
 * Big numeric score + qualitative label for fast scanning.
 */
export function ScoreBadge({ score }) {
  const safe = Math.max(0, Math.min(100, Number(score) || 0));
  const tone =
    safe >= 72
      ? 'from-emerald-200 via-teal-200 to-cyan-200'
      : safe >= 45
        ? 'from-amber-200 via-orange-200 to-yellow-100'
        : 'from-rose-200 via-fuchsia-200 to-orange-200';

  const label =
    safe >= 72 ? 'More human-like' : safe >= 45 ? 'Uncertain / mixed' : 'Synthetic Patterns Detected';

  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Human-writing estimate</div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className={`bg-gradient-to-br ${tone} bg-clip-text text-5xl font-score tracking-tight text-transparent`}>
            {safe}
          </div>
          <div className="pb-2 text-lg text-slate-400 font-mono">/100</div>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-mono font-medium text-slate-200 ring-1 ring-white/10">
          <span className="size-1.5 rounded-full bg-slate-200" />
          {label}
        </div>
      </div>

      <div className="hidden w-40 sm:block">
        <div className="h-2 rounded-full bg-white/5 ring-1 ring-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-300"
            style={{ width: `${safe}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}
