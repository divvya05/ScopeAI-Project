import { copy } from "../config/assessmentConfig";

export function TaglineStrip() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="scope-container flex flex-col items-center gap-6 py-10 md:flex-row md:justify-between">
        {copy.taglines.slice(0, 3).map((tagline, i) => (
          <div key={tagline} className="flex max-w-xs items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700"
            >
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-slate-600">{tagline}</p>
          </div>
        ))}
      </div>
    </section>
  );
}