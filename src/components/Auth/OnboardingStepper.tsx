"use client";

import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

interface OnboardingStepperProps {
  currentStep: number;
  stepPercents: number[];
  completedSteps: boolean[];
}

export default function OnboardingStepper({
  currentStep,
  stepPercents,
  completedSteps,
}: OnboardingStepperProps) {
  return (
    <nav aria-label="Progression onboarding" className="mt-6">
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {ONBOARDING_STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = completedSteps[index] || index < currentStep;
          const percent = stepPercents[index] ?? 0;

          return (
            <li
              key={step.key}
              className={cn(
                "flex flex-1 flex-col gap-2 rounded-2xl border p-4 transition",
                isActive
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-border bg-white dark:border-dark_border dark:bg-darkmode/50",
                isDone && !isActive && "opacity-90"
              )}>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    isDone
                      ? "bg-primary text-white"
                      : isActive
                        ? "border-2 border-primary text-primary"
                        : "bg-slate-100 text-grey dark:bg-dark_border dark:text-white/60"
                  )}>
                  {isDone ? "✓" : index + 1}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-grey dark:text-white/60">
                    {step.shortTitle}
                  </p>
                  <p className="text-sm font-semibold text-midnight_text dark:text-white">
                    {step.title}
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-dark_border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-grey dark:text-white/60">{percent}%</p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
