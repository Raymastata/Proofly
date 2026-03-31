import { motion } from 'framer-motion';

export function ProgressCircle({ score = 0, size = 180 }) {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score < 20) return '#10b981';
    if (score < 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 12px ${getColor()}40)`,
            }}
          />
        </svg>

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center">
            <motion.div
              className="font-black text-5xl text-white"
              style={{ color: getColor() }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {Math.round(score)}%
            </motion.div>
            <div className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
              {score < 20 ? 'Human' : score < 70 ? 'Mixed' : 'AI Generated'}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
