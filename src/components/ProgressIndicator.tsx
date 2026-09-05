import { categories } from "../config/assessmentConfig";
import { cn } from "../lib/format";

interface ProgressIndicatorProps {
  stepIndex: number;
  totalSteps: number;
  offset?: number; // categories advance first; offset steps the composed list
  onJump?: (index: number) => void;
}

/**
 * Category-level progress for the assessment wizard.
 * Slices are pressable when a matching slice folder jump is enabled.
 */
export function ProgressIndicator({ stepIndex, totalSteps, onJump }: ProgressIndicatorProps) {
  const percent = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <span className="tabular-nums">{Math.round(percent)}%</span>
      </div>
      <ol className="flex items-center gap-1.5" aria-hidden>
        {categories.slice(0, totalSteps).map((cat, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={cat.id} className="flex-1">
              {onJump ? (
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  tabIndex={-1}
                  title={cat.short}
                  className={cn(
                    "h-1.5 w-full rounded-full transition-colors",
                    done && "bg-blue-600",
                    current && "bg-teal-500",
                    !done && !current && "bg-slate-200 hover:bg-slate-300"
                  )}
                />
              ) : (
                <span
                  className={cn(
                    "block h-1.5 w-full rounded-full transition-colors",
                    done && "bg-blue-600",
                    current && "bg-teal-500",
                    !done && !current && "bg-slate-200"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}