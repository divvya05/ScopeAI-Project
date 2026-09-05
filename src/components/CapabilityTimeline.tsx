import { Clock, CalendarRange, Compass, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "../lib/format";
import type { CapabilityPlan } from "../types";

interface CapabilityTimelineProps {
  plan: CapabilityPlan;
  assessmentKey: string;
}

const phaseIcons = {
  short: Clock,
  medium: CalendarRange,
  long: Compass,
};

const phaseColors = {
  short: "text-blue-700",
  medium: "text-teal-600",
  long: "text-violet-600",
};

export function CapabilityTimeline({ plan, assessmentKey }: CapabilityTimelineProps) {
  const storageKey = `scopeai_plan_done_${assessmentKey}`;
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(done));
  }, [done, storageKey]);

  const totalItems = useMemo(() => plan.phases.reduce((n, p) => n + p.items.length, 0), [plan]);
  const pct = totalItems ? Math.round((done.length / totalItems) * 100) : 0;

  const toggle = (id: string) =>
    setDone((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-slate-600">{plan.overview}</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
            <span className="block h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
          </span>
          {done.length}/{totalItems} done
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plan.phases.map((phase) => {
          const Icon = phaseIcons[phase.id as keyof typeof phaseIcons] ?? Clock;
          const color = phaseColors[phase.id as keyof typeof phaseColors] ?? "text-slate-700";
          return (
            <section key={phase.id} className="scope-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Icon className={cn("h-4 w-4", color)} aria-hidden />
                <h3 className="text-sm font-bold text-slate-900">{phase.label}</h3>
              </div>
              <ul className="space-y-2.5" role="list">
                {phase.items.map((item) => {
                  const checked = done.includes(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        aria-pressed={checked}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                          checked ? "bg-slate-50" : "hover:bg-slate-50"
                        )}
                      >
                        {checked ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
                        )}
                        <span className={cn("text-sm leading-relaxed text-slate-700", checked && "text-slate-400 line-through")}>
                          {item.text}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}