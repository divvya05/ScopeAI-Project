import { Activity } from "lucide-react";

import { useApp } from "../AppContext";
import { disclaimers } from "../config/assessmentConfig";

const productLinks = [
  { label: "How it works", anchor: "how" },
  { label: "What we measure", anchor: "dimensions" },
  { label: "Why readiness matters", anchor: "why" },
  { label: "Start assessment", action: "setup" as const },
];

export function Footer() {
  const { navigate, scrollToSection } = useApp();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="scope-container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                <Activity className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Scope<span className="text-blue-700">AI</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              AI Era Readiness Calculator for individuals, teams, and organizations.
              Clear insights into AI readiness — and a bridge to AI capability.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              Built with free, open-source models and Neon Postgres.
            </p>
          </div>

          <nav aria-label="Product">
            <h3 className="text-sm font-semibold text-slate-900">Product</h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <button
                    className="footer-link"
                    onClick={() => (l.action ? navigate(l.action) : scrollToSection(l.anchor))}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Resources">
            <h3 className="text-sm font-semibold text-slate-900">Explore</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <button className="footer-link" onClick={() => navigate("assessment")}>
                  Take the assessment
                </button>
              </li>
              <li>
                <span className="text-sm text-slate-400">Role matching</span>
              </li>
              <li>
                <span className="text-sm text-slate-400">Capability plans</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-slate-400">
            {disclaimers.results} Role matches are directional suggestions based on assessment
            responses — not a guarantee of fit, hireability or job performance.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} ScopeAI. An independent concept study.
          </p>
        </div>
      </div>
    </footer>
  );
}