import { User, Users, Building2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { useApp } from "../AppContext";
import { industries, experienceLevels } from "../config/assessmentConfig";
import { saveSession } from "../lib/api";
import { cn } from "../lib/format";
import type { AssessmentType } from "../types";

const modeOptions: { value: AssessmentType; label: string; blurb: string; icon: typeof User }[] = [
  { value: "self", label: "Assess myself", blurb: "A personal AI readiness profile and plan.", icon: User },
  { value: "team", label: "Assess my team", blurb: "A team-level profile for planning and training.", icon: Users },
  { value: "org", label: "Assess my organization", blurb: "An organization-wide view for strategy.", icon: Building2 },
];

export function Setup() {
  const { userInfo, setUserInfo, navigate, setError } = useApp();
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const isTeamOrOrg = userInfo.type === "team" || userInfo.type === "org";

  const validate = () => {
    const e: string[] = [];
    const nameField = userInfo.type === "self" ? "Your name" : userInfo.type === "team" ? "Team name" : "Organization name";
    if (!userInfo.name.trim()) e.push(`${nameField} is required.`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())) e.push("Please enter a valid email address.");
    if (!userInfo.role.trim()) e.push("Please enter your role or department.");
    if (!userInfo.industry) e.push("Please select an industry.");
    if (!userInfo.aiExperienceLevel) e.push("Please select your AI experience level.");
    if (isTeamOrOrg && (!userInfo.teamSize || Number(userInfo.teamSize) < 1 || Number(userInfo.teamSize) > 10000)) {
      e.push("Please enter a team size between 1 and 10,000.");
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (e.length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try {
      await saveSession(userInfo);
      setSaved(true);
      setError(null);
      navigate("assessment");
    } catch {
      // Neon may be unreachable (e.g. DATABASE_URL not set locally).
      // Let the user proceed; submission will fail gracefully with a clear message.
      setError("We couldn't reach the database, so your details will be kept locally for now.");
      navigate("assessment");
    }
  };

  return (
    <section className="py-14 lg:py-20">
      <div className="scope-container max-w-3xl">
        <div className="text-center">
          <p className="scope-eyebrow">Assessment setup</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Who are we assessing?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Choose the level, then answer a few quick questions. The assessment itself takes about 5 minutes.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
            <ul className="space-y-1 text-sm text-rose-700">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {saved && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Details saved. Let's begin.
          </div>
        )}

        {/* Mode selector */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Assessment level">
          {modeOptions.map((m) => {
            const Icon = m.icon;
            const active = userInfo.type === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setUserInfo({ ...userInfo, type: m.value })}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all",
                  active
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                    : "border-slate-200 bg-white hover:border-blue-300"
                )}
              >
                <Icon className={cn("h-6 w-6", active ? "text-blue-700" : "text-slate-400")} aria-hidden />
                <span className={cn("mt-3 block font-bold", active ? "text-blue-900" : "text-slate-900")}>{m.label}</span>
                <span className="mt-1 block text-sm text-slate-600">{m.blurb}</span>
              </button>
            );
          })}
        </div>

        {/* Basic info */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="scope-label" htmlFor="name">
              {userInfo.type === "self" ? "Your name" : userInfo.type === "team" ? "Team name" : "Organization name"}
            </label>
            <input
              id="name"
              className="scope-input"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              placeholder={userInfo.type === "self" ? "e.g. Alex Chen" : "e.g. Product & Design"}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="scope-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="scope-input"
              value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              placeholder="alex@company.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="scope-label" htmlFor="role">
              Role / department
            </label>
            <input
              id="role"
              className="scope-input"
              value={userInfo.role}
              onChange={(e) => setUserInfo({ ...userInfo, role: e.target.value })}
              placeholder={userInfo.type === "self" ? "e.g. Operations manager" : "e.g. Marketing department"}
            />
          </div>

          <div>
            <label className="scope-label" htmlFor="industry">
              Industry
            </label>
            <select
              id="industry"
              className="scope-input"
              value={userInfo.industry}
              onChange={(e) => setUserInfo({ ...userInfo, industry: e.target.value })}
            >
              <option value="">Select an industry…</option>
              {industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {isTeamOrOrg && (
            <div>
              <label className="scope-label" htmlFor="teamSize">
                Team / organization size
              </label>
              <input
                id="teamSize"
                type="number"
                min={1}
                max={10000}
                className="scope-input"
                value={userInfo.teamSize}
                onChange={(e) => setUserInfo({ ...userInfo, teamSize: e.target.value })}
                placeholder="e.g. 45"
              />
            </div>
          )}
        </div>

        {/* Experience level */}
        <div className="mt-8">
          <span className="scope-label">Your self-reported AI experience</span>
          <div className="grid gap-3 sm:grid-cols-4" role="radiogroup" aria-label="AI experience level">
            {experienceLevels.map((lv) => {
              const active = userInfo.aiExperienceLevel === lv.label;
              return (
                <button
                  key={lv.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setUserInfo({ ...userInfo, aiExperienceLevel: lv.label })}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition-all",
                    active
                      ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600"
                      : "border-slate-200 bg-white hover:border-teal-300"
                  )}
                >
                  <span className={cn("block text-sm font-bold", active ? "text-teal-900" : "text-slate-900")}>{lv.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{lv.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button onClick={handleSubmit} className="scope-btn-primary w-full !py-3.5 sm:w-auto sm:!px-10 sm:!text-base">
            Continue to assessment
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <p className="text-xs text-slate-400">
            Your answers are saved to Neon Postgres as you go and you keep a local copy.
          </p>
        </div>
      </div>
    </section>
  );
}