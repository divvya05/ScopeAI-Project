import { Sparkles, TrendingUp, Wrench, ArrowUpRight } from "lucide-react";

import { cn } from "../lib/format";

import { CategoryBars } from "./CategoryBars";
import { ScoreRing } from "./ScoreRing";

const mockScores = {
  awareness: 84,
  tools: 62,
  digital: 48,
  problem: 71,
  adaptable: 66,
  collaboration: 58,
  responsible: 74,
  role: 69,
};

export function MockDashboard() {
  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-blue-600/10 via-teal-500/10 to-violet-500/10 blur-2xl" />
      <div className="scope-card relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-800">AI Readiness Report</span>
          </div>
          <span className="scope-chip bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <TrendingUp className="h-3.5 w-3.5" /> Ready
          </span>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto sm:mx-0">
            <ScoreRing score={67} size={180} stroke={14} color="#06B6D4" label="Overall readiness" animated={false} />
          </div>

          <div className="min-w-0">
            <CategoryBars categoryScores={mockScores} compact />
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skill focus</span>
            {["Prompt design", "Data literacy", "Workflow automation", "Responsible AI"].map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
              >
                <Wrench className="h-3 w-3 text-slate-400" /> {s}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
              View report <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute -right-4 -top-4 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg lg:block"
        )}
      >
        <div className="text-xs font-semibold text-slate-500">Biggest gap</div>
        <div className="text-sm font-bold text-slate-900">Digital fluency · 48</div>
      </div>
      <div
        className={cn(
          "absolute -bottom-5 -left-3 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg lg:block"
        )}
      >
        <div className="text-xs font-semibold text-slate-500">Strongest area</div>
        <div className="text-sm font-bold text-slate-900">AI awareness · 84</div>
      </div>
    </div>
  );
}