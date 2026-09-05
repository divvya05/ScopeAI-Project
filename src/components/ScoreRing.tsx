import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  color: string;
  label: string;
  sublabel?: string;
  animated?: boolean;
}

export function ScoreRing({
  score,
  size = 220,
  stroke = 16,
  color,
  label,
  sublabel,
  animated = true,
}: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setShown(score);
      return;
    }
    const t = setTimeout(() => setShown(score), 80);
    return () => clearTimeout(t);
  }, [score, animated]);

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label} score: ${score} out of 100`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (shown / 100) * c}
          style={{ transition: animated ? "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" : "none" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-5xl font-bold tracking-tight text-slate-900">
            {Math.round(shown)}
            <span className="text-2xl text-slate-400">/100</span>
          </div>
          <div className="mt-1 text-sm font-semibold" style={{ color }}>
            {label}
          </div>
          {sublabel && <div className="mt-0.5 text-xs text-slate-500">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}