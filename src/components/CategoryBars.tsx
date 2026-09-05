import { useEffect, useRef, useState } from "react";

import { categories } from "../config/assessmentConfig";

interface CategoryBarsProps {
  categoryScores: Record<string, number>;
  compact?: boolean;
}

const barColors: Record<string, string> = {
  awareness: "#2563EB",
  tools: "#06B6D4",
  digital: "#8B5CF6",
  problem: "#F59E0B",
  adaptable: "#10B981",
  collaboration: "#EC4899",
  responsible: "#6366F1",
  role: "#0EA5E9",
};

export function CategoryBars({ categoryScores, compact }: CategoryBarsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid gap-4" style={{ gap: compact ? "0.5rem" : "1rem" }}>
      {categories.map((cat) => {
        const score = categoryScores[cat.id] ?? 0;
        return (
          <div key={cat.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">{cat.short}</span>
              <span className="text-sm font-bold text-slate-900">{score}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: visible ? `${score}%` : "0%",
                  backgroundColor: barColors[cat.id] ?? "#64748b",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}