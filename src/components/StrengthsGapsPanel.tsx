import { TrendingUp, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";

import { cn } from "../lib/format";
import type { StrengthsGaps } from "../types";

interface StrengthsGapsPanelProps {
  data: StrengthsGaps;
}

export function StrengthsGapsPanel({ data }: StrengthsGapsPanelProps) {
  const columns = [
    { key: "strengths" as const, title: "Strengths", icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", note: "Build on these to lead." },
    { key: "watch" as const, title: "Watch", icon: Minus, color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", note: "Steady — compound the progress." },
    { key: "gaps" as const, title: "Opportunities", icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", note: "Highest-growth focus areas." },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const items = data[col.key];
        const Icon = col.icon;
        return (
          <div key={col.key} className={cn("rounded-2xl border p-5", col.border, col.bg.replace("50", "50/50"))}>
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", col.color)} aria-hidden />
              <h4 className="text-sm font-bold text-slate-900">{col.title}</h4>
            </div>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No dimensions in this band.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {items.map((e) => (
                  <li key={e.category.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700">{e.category.short}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{e.score}</span>
                      <span className={cn("h-1.5 w-14 overflow-hidden rounded-full bg-slate-200/70")}>
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            col.key === "strengths" ? "bg-emerald-500" : col.key === "watch" ? "bg-teal-400" : "bg-amber-400"
                          )}
                          style={{ width: `${e.score}%` }}
                        />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" /> {col.note}
            </p>
          </div>
        );
      })}
    </div>
  );
}