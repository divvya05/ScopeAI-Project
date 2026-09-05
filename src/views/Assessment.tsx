import { ArrowLeft, ArrowRight, Cloud, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useApp } from "../AppContext";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { QuestionCard } from "../components/QuestionCard";
import { categories, questions, questionsByCategory } from "../config/assessmentConfig";
import { saveDraft, submitAssessment } from "../lib/api";
import { cn } from "../lib/format";
import type { Question } from "../types";

export function Assessment() {
  const { userInfo, answers, setAnswers, setResults, navigate, setSaving, saving, error, setError } = useApp();
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [draftOk, setDraftOk] = useState(false);

  const steps: { id: string; label: string; blurb: string; questions: Question[] }[] = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        label: cat.short,
        blurb: cat.blurb,
        questions: questionsByCategory(cat.id),
      })),
    []
  );

  const current = steps[step];

  const requiredMissing = (stepQuestions: Question[]) =>
    stepQuestions.filter((q) => q.type !== "text" && !q.optional && !answers[q.id]);

  const totalRequired = questions.filter((q) => q.type !== "text" && !q.optional).length;
  const answeredCount = questions.filter((q) => q.type !== "text" && !q.optional && answers[q.id]).length;

  const persistDraft = async (nextStep: number) => {
    setDraftOk(false);
    try {
      await saveDraft(nextStep, answers);
      setDraftOk(true);
    } catch {
      setDraftOk(false);
    }
  };

  const goNext = () => {
    const missing = requiredMissing(current.questions);
    if (missing.length) {
      setStepError(`Please answer ${missing.length > 1 ? "all questions" : "the question"} in this step before continuing.`);
      return;
    }
    setStepError(null);
    if (step < steps.length - 1) {
      const next = step + 1;
      setStep(next);
      void persistDraft(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      void submitAll();
    }
  };

  const submitAll = async () => {
    const missingGlobal = requiredMissing(questions);
    if (missingGlobal.length) {
      setStepError("Please complete every required question before submitting.");
      return;
    }
    setError(null);
    setSaving(true);
    setStepError(null);
    try {
      const payload = await submitAssessment(userInfo, answers);
      setResults(payload);
      navigate("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again; your answers remain saved locally.");
    } finally {
      setSaving(false);
    }
  };

  const changeAnswer = (id: string, value: string) => {
    setAnswers({ ...answers, [id]: value });
    if (stepError) setStepError(null);
    setDraftOk(false);
  };

  return (
    <section className="py-10 lg:py-14">
      <div className="scope-container max-w-3xl">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="scope-eyebrow">AI Era Readiness Calculator</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {current.label}
              </h1>
            </div>
            <div className="scope-chip bg-slate-100 text-slate-700">
              <Cloud className="h-3.5 w-3.5" aria-hidden />
              {saving ? "Submitting…" : `${answeredCount}/${totalRequired} answered`}
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">{current.blurb}</p>
          <ProgressIndicator
            stepIndex={step}
            totalSteps={steps.length}
            onJump={(i) => {
              setStepError(null);
              setStep(i);
              void persistDraft(i);
            }}
          />
        </div>

        {(stepError || error) && (
          <div
            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
            <p className="text-sm text-rose-700">{stepError ?? error}</p>
          </div>
        )}

        <div className="grid gap-5">
          {current.questions.map((q, i) => (
            <QuestionCard key={q.id} question={q} value={answers[q.id] ?? ""} onChange={changeAnswer} index={i + 1} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => {
              if (step === 0) {
                navigate("setup");
                return;
              }
              const prev = step - 1;
              setStep(prev);
              void persistDraft(prev);
            }}
            className="scope-btn-ghost"
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>

          <button
            onClick={goNext}
            disabled={saving}
            className={cn("scope-btn-primary !px-8", saving && "pointer-events-none opacity-70")}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving your results…
              </>
            ) : step === steps.length - 1 ? (
              <>
                See my results
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
          {draftOk ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
              Progress synced to Neon.
            </>
          ) : (
            <>
              <Cloud className="h-3.5 w-3.5" aria-hidden />
              Progress is saved locally as you answer.
            </>
          )}
        </div>
      </div>
    </section>
  );
}