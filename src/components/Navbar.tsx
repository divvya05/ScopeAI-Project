import { Menu, X, ArrowRight, Activity } from "lucide-react";
import { useState } from "react";

import { useApp } from "../AppContext";
import { cn } from "../lib/format";

export function Navbar() {
  const { route, navigate, scrollToSection, results } = useApp();
  const [open, setOpen] = useState(false);

  const links: { label: string; onClick: () => void; active?: boolean }[] = [
    { label: "How it works", onClick: () => scrollToSection("how") },
    { label: "Dimensions", onClick: () => scrollToSection("dimensions") },
    { label: "Why it matters", onClick: () => scrollToSection("why") },
    ...(results
      ? [
          { label: "Results", onClick: () => navigate("results"), active: route === "results" },
          { label: "Capability plan", onClick: () => navigate("plan"), active: route === "plan" },
        ]
      : []),
  ];

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="scope-container flex h-16 items-center justify-between" aria-label="Main">
        <button
          onClick={() => {
            close();
            navigate("landing");
          }}
          className="group flex items-center gap-2"
          aria-label="ScopeAI home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Scope<span className="text-blue-700">AI</span>
          </span>
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => {
                l.onClick();
              }}
              className={cn(
                "text-sm font-medium text-slate-600 transition-colors hover:text-slate-900",
                l.active && "text-blue-700"
              )}
            >
              {l.label}
            </button>
          ))}
          <button onClick={() => navigate("setup")} className="scope-btn-primary !px-5 !py-2.5">
            Start assessment
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="scope-container flex flex-col gap-4 py-4">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => {
                  close();
                  l.onClick();
                }}
                className={cn(
                  "rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50",
                  l.active && "text-blue-700"
                )}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => {
                close();
                navigate("setup");
              }}
              className="scope-btn-primary w-full"
            >
              Start assessment
            </button>
          </div>
        </div>
      )}
    </header>
  );
}