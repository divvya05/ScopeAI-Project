import {
  Download,
  Compass,
  ListChecks,
  Sparkles,
  Wrench,
  BookOpen,
  FlaskConical,
  ShieldAlert,
} from "lucide-react";
import { useMemo } from "react";

import { useApp } from "../AppContext";
import { CategoryBars } from "../components/CategoryBars";
import { ScoreRing } from "../components/ScoreRing";
import { StrengthsGapsPanel } from "../components/StrengthsGapsPanel";
import { categories, disclaimers } from "../config/assessmentConfig";
import { downloadCsv } from "../lib/format";
import { strengthsAndGaps } from "../lib/scoring";

export function Results() {
  const { results, navigate, userInfo } = useApp();

  const sg = useMemo(
    () => strengthsAndGaps(results!.results.categoryScores, categories),
    [results]
  );

  const { results: r, recommendations: rec } = results!;
  const level = r.level;

  const allRoles = rec.roleMatches?.map((m) => m.role?.title).filter(Boolean) ?? [];

  const downloadReport = () => {
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `scopeai_report_${(userInfo.name || "assessment").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_${today}.csv`,
      [
        "name",
        "email",
        "role",
        "organization",
        "industry",
        "ai_experience_level",
        "assessment_type",
        "overall_score",
        "readiness_level",
        ...categories.map((c) => `score_${c.id}`),
        "summary",
        "next_steps",
        "recommended_roles",
        "skill_focus",
        "generated_on",
      ],
      [
        [
          userInfo.name,
          userInfo.email,
          userInfo.role,
          userInfo.organization,
          userInfo.industry,
          userInfo.aiExperienceLevel,
          userInfo.type,
          r.overall,
          level.label,
          ...categories.map((c) => r.categoryScores[c.id]),
          rec.summary,
          rec.nextSteps,
          allRoles.join(" | "),
          rec.skillFocus.join(" | "),
          new Date().toISOString(),
        ],
      ]
    );
  };

  return (
    <section className="py-10 lg:py-16">
      <div className="scope-container">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <p className="scope-eyebrow">Your readiness report</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {userInfo.type === "self" ? userInfo.name : userInfo.type === "team" ? userInfo.organization || userInfo.name : userInfo.organization}
          </h1>
          <p className="mt-2 max-w-xl text-slate-600">
            {userInfo.role}
            {userInfo.industry ? ` · ${userInfo.industry}` : ""} — {userInfo.type === "self" ? "individual" : userInfo.type === "team" ? "team" : "organization"} assessment
          </p>
          <span className={`scope-chip mt-4 ring-1 ring-inset ring-slate-200`} style={{ backgroundColor: `${level.color}1a`, color: level.color }}>
            {rec.engine !== "rule-based" ? (
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Wrench className="h-3.5 w-3.5" aria-hidden />
            )}
            {level.label} · {rec.engine === "ai" ? "AI-refined summary" : rec.engine === "rule-based-fallback" ? "fallback summary" : "deterministic summary"}
          </span>
        </div>

        {/* Score + categories */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[auto_1fr]">
          <div className="scope-card p-8">
            <ScoreRing score={r.overall} color={level.color} label={level.label} />
            <p className="mt-6 max-w-[16rem] text-sm leading-relaxed text-slate-600">{level.description}</p>
          </div>
          <div className="scope-card p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Readiness by dimension</h2>
              <span className="text-sm font-medium text-slate-500">Out of 100</span>
            </div>
            <CategoryBars categoryScores={r.categoryScores} />
          </div>
        </div>

        {/* Strengths / watch / gaps */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Where you stand</h2>
          <StrengthsGapsPanel data={sg} />
        </div>

        {/* Summary + recommendations */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="scope-card p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Sparkles className="h-5 w-5 text-blue-700" aria-hidden />
              Summary
            </h2>
            <div className="mt-4 space-y-4">
              <p className="text-[15px] leading-relaxed text-slate-700">{rec.summary}</p>
              <div className="rounded-2xl bg-blue-50/70 p-4">
                <p className="text-sm font-semibold text-blue-900">Suggested next step</p>
                <p className="mt-1 text-sm text-blue-900/80">{rec.nextSteps}</p>
              </div>
            </div>
          </div>

          <div className="scope-card p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Wrench className="h-5 w-5 text-teal-600" aria-hidden />
              Skills to build
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {rec.skillFocus.slice(0, 6).map((s) => (
                <span key={s} className="scope-chip bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-800">Recommended resources</p>
              <ul className="mt-3 space-y-3">
                {rec.capabilityPlan.themes.slice(0, 2).flatMap((t) =>
                  t.courses.slice(0, 2).map((course) => (
                    <li key={course} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      {course}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Starter projects */}
        {rec.capabilityPlan.themes.length > 0 && (
          <div className="mt-6">
            <div className="scope-card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FlaskConical className="h-5 w-5 text-violet-600" aria-hidden />
                Example projects to start with
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {rec.capabilityPlan.themes.slice(0, 3).map((t) => (
                  <li key={t.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">{t.label}</span>
                    {t.project}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <button onClick={downloadReport} className="scope-btn-ghost justify-center !py-3.5">
            <Download className="h-4 w-4" aria-hidden />
            Download report (CSV/Excel)
          </button>
          <button onClick={() => navigate("roles")} className="scope-btn-secondary justify-center !py-3.5">
            <Compass className="h-4 w-4" aria-hidden />
            Explore role matches
          </button>
          <button onClick={() => navigate("plan")} className="scope-btn-primary justify-center !py-3.5">
            <ListChecks className="h-4 w-4" aria-hidden />
            Build capability plan
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <p className="text-xs leading-relaxed text-slate-500">
            {disclaimers.results} {disclaimers.matching}
          </p>
        </div>
      </div>
    </section>
  );
}