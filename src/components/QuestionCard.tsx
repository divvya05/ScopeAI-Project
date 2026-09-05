import { cn } from "../lib/format";
import type { Question } from "../types";

interface QuestionCardProps {
  question: Question;
  value: string;
  onChange: (id: string, value: string) => void;
  index?: number;
}

export function QuestionCard({ question, value, onChange, index }: QuestionCardProps) {
  const required = !question.optional && question.type !== "text";
  const answered = value !== undefined && value !== "";

  return (
    <fieldset className="scope-card p-6 sm:p-7">
      <legend className="sr-only">{question.prompt}</legend>
      <div className="flex items-start justify-between gap-4">
        <div>
          {typeof index === "number" && (
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-wide text-slate-400">
              Question {index}
            </span>
          )}
          <h3 className="text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
            {question.prompt}
            {required && <span className="ml-1 text-rose-500" aria-hidden>*</span>}
          </h3>
          {question.help && <p className="mt-1.5 text-sm text-slate-500">{question.help}</p>}
        </div>
        {!question.optional && question.type !== "text" && (
          <span
            className={cn(
              "mt-1 hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-block",
              answered ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            )}
          >
            {answered ? "Answered" : "Required"}
          </span>
        )}
      </div>

      <div className="mt-5">
        {question.type === "likert" && <Likert question={question} value={value} onChange={onChange} />}
        {question.type === "choice" && <ChoiceList question={question} value={value} onChange={onChange} />}
        {question.type === "cards" && <CardGrid question={question} value={value} onChange={onChange} />}
        {question.type === "text" && <TextField question={question} value={value} onChange={onChange} />}
      </div>
    </fieldset>
  );
}

function Likert({ question, value, onChange }: QuestionCardProps) {
  const levels = [
    { n: 1, label: question.lowLabel ?? "Strongly disagree" },
    { n: 2, label: "" },
    { n: 3, label: "" },
    { n: 4, label: "" },
    { n: 5, label: question.highLabel ?? "Strongly agree" },
  ];

  return (
    <div>
      <div className="flex gap-2" role="radiogroup" aria-label={question.prompt}>
        {levels.map((l) => {
          const active = value === String(l.n);
          return (
            <button
              key={l.n}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(question.id, String(l.n))}
              className={cn(
                "flex-1 rounded-xl border py-3 text-sm font-semibold transition-all",
                active
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50",
                l.label === question.lowLabel || l.label === question.highLabel ? "min-w-[3.5rem]" : ""
              )}
            >
              {l.n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{levels[0].label}</span>
        <span>{levels[4].label}</span>
      </div>
    </div>
  );
}

function ChoiceList({ question, value, onChange }: QuestionCardProps) {
  return (
    <div role="radiogroup" aria-label={question.prompt} className="grid gap-2.5">
      {question.options?.map((opt) => {
        const active = value === opt.label;
        return (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(question.id, opt.label)}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
              active
                ? "border-blue-600 bg-blue-50 text-slate-900 ring-2 ring-blue-600"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                active ? "border-blue-600 bg-blue-600" : "border-slate-300"
              )}
              aria-hidden
            >
              {active && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function CardGrid({ question, value, onChange }: QuestionCardProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label={question.prompt}>
      {question.options?.map((opt) => {
        const active = value === opt.label;
        return (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(question.id, opt.label)}
            className={cn(
              "rounded-xl border px-4 py-4 text-left text-sm transition-all",
              active
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
            )}
          >
            <span
              className={cn(
                "mb-2 inline-block h-3 w-3 rounded-full border-2 align-middle",
                active ? "border-blue-600 bg-blue-600" : "border-slate-300"
              )}
              aria-hidden
            />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TextField({ question, value, onChange }: QuestionCardProps) {
  return (
    <textarea
      rows={3}
      value={value ?? ""}
      onChange={(e) => onChange(question.id, e.target.value)}
      placeholder={question.placeholder ?? "Your answer (optional)"}
      aria-label={question.prompt}
      className="scope-input resize-y"
    />
  );
}