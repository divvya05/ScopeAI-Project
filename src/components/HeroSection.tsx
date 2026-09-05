import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { useApp } from "../AppContext";
import { copy } from "../config/assessmentConfig";

import { MockDashboard } from "./MockDashboard";

export function HeroSection() {
  const { navigate, scrollToSection } = useApp();

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[420px] rounded-full bg-teal-500/10 blur-[100px]" aria-hidden />

      <div className="scope-container relative py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" aria-hidden />
              AI Era Readiness Calculator
            </span>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              {copy.hero.headline}
            </h1>

            <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-slate-300">
              {copy.hero.sub}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate("setup")}
                className="scope-btn bg-white px-7 text-slate-900 shadow-lg hover:bg-slate-100 sm:px-8 sm:py-3.5 sm:text-base"
              >
                {copy.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <button
                onClick={() => scrollToSection("how")}
                className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white transition-colors hover:text-teal-300"
              >
                <PlayCircle className="h-6 w-6" aria-hidden />
                {copy.hero.ctaSecondary}
              </button>
            </div>

            <p className="mt-8 max-w-md text-sm leading-relaxed text-slate-400">
              {copy.taglines[0]}
            </p>
          </div>

          <div className="mx-auto w-full max-w-[540px] [animation:float_7s_ease-in-out_infinite]">
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}