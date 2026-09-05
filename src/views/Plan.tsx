import { ArrowLeft, ShieldAlert } from "lucide-react";

import { useApp } from "../AppContext";
import { CapabilityTimeline } from "../components/CapabilityTimeline";
import { disclaimers } from "../config/assessmentConfig";

export function Plan() {
  const { results, navigate } = useApp();
  const plan = results!.recommendations.capabilityPlan;
  const assessmentKey = results!.assessmentId ?? "local";

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
          <p className="scope-eyebrow">Capability plan</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Bridge the gap to AI capability.
          </h1>
          <p className="mt-3 text-slate-600">
            A phased plan built from your profile. Check things off as you go — your progress stays on this device.
          </p>
        </div>

        <div className="mt-8">
          <CapabilityTimeline plan={plan} assessmentKey={assessmentKey} />
        </div>

        {plan.themes.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Prioritized skill areas</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {plan.themes.map((t, i) => (
                <div key={t.id} className="scope-card p-5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Priority {i + 1}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-slate-900">{t.skill}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.label}</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                    {t.courses.slice(0, 2).map((c) => (
                      <li key={c} className="leading-relaxed">• {c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <p className="text-xs leading-relaxed text-slate-500">
            {disclaimers.results} Course and project suggestions are starting points, matched to your
            profile by simple rules or an open-source model.
          </p>
        </div>
      </div>
    </section>
  );
}