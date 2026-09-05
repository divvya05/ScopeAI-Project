import {
  Brain,
  Wrench,
  BarChart3,
  Lightbulb,
  Sprout,
  Users,
  ShieldCheck,
  Target,
  ArrowRight,
  Gauge,
  FileText,
  Compass,
} from "lucide-react";
import type { ComponentType } from "react";

import { useApp } from "../AppContext";
import { HeroSection } from "../components/HeroSection";
import { TaglineStrip } from "../components/TaglineStrip";
import { copy, categories } from "../config/assessmentConfig";

const dimensionIcons: Record<string, ComponentType<{ className?: string }>> = {
  awareness: Brain,
  tools: Wrench,
  digital: BarChart3,
  problem: Lightbulb,
  adaptable: Sprout,
  collaboration: Users,
  responsible: ShieldCheck,
  role: Target,
};

const whyCards = [
  {
    title: "Readiness, not fear",
    body: "AI adoption rarely fails on technology. It fails when people aren't sure how AI helps their work. ScopeAI keeps the conversation focused on capability growth.",
  },
  {
    title: "A common language",
    body: "Teams that share one framework for AI literacy can plan together — training, pilots and hiring all start from the same honest baseline.",
  },
  {
    title: "Targeted upskilling",
    body: "A single score hides the real story. Seeing exactly which dimensions need work lets teams spend budget where it moves the needle.",
  },
  {
    title: "Clear direction on roles",
    body: "Match the right talent to the right AI role — from business analysts to transformation leads — based on demonstrated readiness patterns.",
  },
];

const deliverables = [
  {
    icon: Gauge,
    title: "A real readiness score",
    body: "A 0–100 overall score with a clear level — Emerging, Developing, Ready or Leading — computed from your answers across eight dimensions.",
  },
  {
    icon: BarChart3,
    title: "A dimensional breakdown",
    body: "See strengths and gaps per dimension, so the 'where do I even start?' question has an honest, specific answer.",
  },
  {
    icon: FileText,
    title: "Actionable recommendations",
    body: "Personalized courses, skills, example projects and next steps — refined by an open-source model when available, deterministic otherwise.",
  },
  {
    icon: Compass,
    title: "Role matches and a plan",
    body: "Suggestions for AI-related roles that fit your profile, plus a phased 0–3 / 3–12 / 12+ month capability plan you can track.",
  },
];

export function Landing() {
  const { navigate } = useApp();

  return (
    <>
      <HeroSection />
      <TaglineStrip />

      {/* What ScopeAI measures */}
      <section id="dimensions" className="scroll-mt-24 py-20">
        <div className="scope-container">
          <div className="max-w-2xl">
            <p className="scope-eyebrow">Dimensions</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {copy.sections.whatItMeasures}
            </h2>
            <p className="mt-3 text-slate-600">
              Eight practical dimensions of AI literacy — kept simple and non-technical so every
              professional, from operator to executive, can answer honestly.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = dimensionIcons[cat.id] ?? Brain;
              return (
                <div key={cat.id} className="scope-card scope-card-hover p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{cat.short}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{cat.blurb}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section id="why" className="scroll-mt-24 bg-white py-20">
        <div className="scope-container">
          <div className="max-w-2xl">
            <p className="scope-eyebrow">Perspective</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {copy.sections.whyItMatters}
            </h2>
            <p className="mt-3 text-slate-600">
              {copy.taglines[1]}
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {whyCards.map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-7">
                <h3 className="text-lg font-bold text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-24 py-20">
        <div className="scope-container">
          <div className="max-w-2xl">
            <p className="scope-eyebrow">The flow</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {copy.sections.howItWorks}
            </h2>
          </div>

          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { n: "01", title: "Tell us who you're assessing", body: "Yourself, your team, or your whole organization — with role, industry and AI experience for context." },
              { n: "02", title: "Answer ~24 honest, non-technical questions", body: "Five minutes, eight dimensions, no jargon. Answers persist to Neon as you move between steps." },
              { n: "03", title: "Get a score, matches and a plan", body: "A clear readiness level, role suggestions, prioritized skills and a phased capability plan — plus a CSV report." },
            ].map((s) => (
              <li key={s.n} className="scope-card p-7">
                <span className="text-3xl font-bold tracking-tight text-blue-100">{s.n}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-slate-950 py-20">
        <div className="scope-container">
          <div className="max-w-2xl">
            <p className="scope-eyebrow !text-teal-300">What you get</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              {copy.sections.whatYouGet}
            </h2>
            <p className="mt-3 text-slate-400">
              {copy.taglines[2]} And with {copy.taglines[3].toLowerCase()}.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deliverables.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-teal-400/40 hover:bg-white/10"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-400/15 text-teal-300">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-white">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{d.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="scope-container">
          <div className="scope-card relative overflow-hidden px-8 py-14 text-center sm:px-14">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />
            <h2 className="relative text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {copy.ctaFinal.headline}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-slate-600">{copy.ctaFinal.sub}</p>
            <button
              onClick={() => navigate("setup")}
              className="scope-btn-primary relative mt-8 !px-8 !py-3.5 !text-base"
            >
              {copy.ctaFinal.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}