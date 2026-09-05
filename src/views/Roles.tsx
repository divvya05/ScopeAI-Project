import { ArrowLeft, ShieldAlert, MapPin, Compass } from "lucide-react";
import { useMemo } from "react";

import { useApp } from "../AppContext";
import { RoleCard } from "../components/RoleCard";
import { categories, disclaimers } from "../config/assessmentConfig";
import { strengthsAndGaps } from "../lib/scoring";

export function Roles() {
  const { results, navigate, userInfo } = useApp();

  const sg = useMemo(
    () => strengthsAndGaps(results!.results.categoryScores, categories),
    [results]
  );

  const matches = results!.recommendations.roleMatches ?? [];
  const top3 = matches.slice(0, 3);
  const rest = matches.slice(3);

  return (
    <section className="py-10 lg:py-16">
      <div className="scope-container">
        <button
          onClick={() => navigate("results")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to results
        </button>

        <div className="mt-6 max-w-2xl">
          <p className="scope-eyebrow">Role matching</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Match the right talent to the right AI role.
          </h1>
          <p className="mt-3 text-slate-600">
            Based on {userInfo.type === "self" ? "your" : "the"} readiness profile for{" "}
            {userInfo.name || "this team"}, here are AI-related roles with the strongest directional fit.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {top3.map((m, i) => (
            <RoleCard key={m.role?.id ?? m.role?.title ?? i} match={m} rank={i + 1} highlighted={i === 0} />
          ))}
        </div>

        {rest.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-slate-900">Also worth exploring</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {rest.map((m, i) => (
                <RoleCard key={m.role?.id ?? m.role?.title ?? i} match={m} rank={i + 4} />
              ))}
            </div>
          </div>
        )}

        {sg.gaps.length > 0 && (
          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <p className="text-sm text-amber-800">
              Your top opportunity is <strong>{sg.gaps[0].category.short.toLowerCase()}</strong>.
              Building here tends to open the most role options — see the{" "}
              <button onClick={() => navigate("plan")} className="font-semibold underline underline-offset-2">
                capability plan
              </button>{" "}
              for exactly how.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <p className="text-xs leading-relaxed text-slate-500">{disclaimers.matching}</p>
        </div>

        <button onClick={() => navigate("plan")} className="scope-btn-primary mt-8">
          <Compass className="h-4 w-4" aria-hidden />
          Build capability plan
        </button>
      </div>
    </section>
  );
}