import { motion } from 'framer-motion';

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

  const barColor =
    safe >= 72
      ? 'from-emerald-400 via-teal-400 to-cyan-400'
      : safe >= 45
        ? 'from-amber-400 via-orange-400 to-yellow-400'
        : 'from-rose-400 via-fuchsia-400 to-orange-400';

  const label =
    safe >= 72 ? 'More human-like' : safe >= 45 ? 'Uncertain / mixed' : 'Synthetic Patterns Detected';

  const dotColor =
    safe >= 72 ? 'bg-emerald-400' : safe >= 45 ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Human-writing estimate</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className={`bg-gradient-to-br ${tone} bg-clip-text text-5xl font-black tracking-tight text-transparent`}>
              {safe}
            </div>
            <div className="pb-2 text-lg text-slate-400 font-medium">/100</div>
          </div>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
            <span className={`size-1.5 rounded-full ${dotColor}`} />
            {label}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-white/5 ring-1 ring-white/[0.06] overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
            initial={{ width: '0%' }}
            animate={{ width: `${safe}%` }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-600">
          <span>0 — Synthetic</span>
          <span>100 — Human</span>
        </div>
      </div>
    </div>
  );
}
