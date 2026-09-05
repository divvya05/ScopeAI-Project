import { Target, BadgeCheck } from "lucide-react";

import { cn } from "../lib/format";
import type { RoleMatch } from "../types";

interface RoleCardProps {
  match: RoleMatch;
  rank?: number;
  highlighted?: boolean;
}

const fitColor = (fit: number) =>
  fit >= 70 ? "text-emerald-700 bg-emerald-50" : fit >= 50 ? "text-teal-700 bg-teal-50" : "text-amber-700 bg-amber-50";

export function RoleCard({ match, rank, highlighted }: RoleCardProps) {
  const { role, fit, why } = match;
  return (
    <article
      className={cn(
        "scope-card scope-card-hover flex flex-col p-6",
        highlighted && "ring-2 ring-blue-600"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {typeof rank === "number" && (
            <span className="mb-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
              #{rank}
            </span>
          )}
          <h3 className="text-lg font-bold leading-snug text-slate-900">{role.title}</h3>
        </div>
        <span className={cn("scope-chip shrink-0", fitColor(fit))}>
          <Target className="h-3.5 w-3.5" aria-hidden />
          {fit}% fit
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{role.summary}</p>

      {why && (
        <p className="mt-3 rounded-xl bg-blue-50/70 px-3 py-2.5 text-sm text-slate-700">
          <span className="font-semibold text-blue-800">Why it fits: </span>
          {why}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {role.focus.map((f) => (
          <span
            key={f}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            <BadgeCheck className="h-3 w-3 text-slate-400" aria-hidden />
            {f}
          </span>
        ))}
      </div>
    </article>
  );
}