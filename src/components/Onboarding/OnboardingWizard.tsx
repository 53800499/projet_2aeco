"use client";

import { FormEvent, ReactNode } from "react";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import Logo from "../Logo";
import Link from "next/link";

interface OnboardingWizardProps {
  step: number;
  globalPercent: number;
  stepPercents: number[];
  completedSteps: boolean[];
  saving: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  onSkip?: () => void;
  children: ReactNode;
}

const stepDescriptions = [
  "Qui êtes-vous ? Identité et photo pour le répertoire.",
  "Votre parcours au CEG 2 Ouidah.",
  "Comment vous joindre ? Coordonnées et réseaux.",
];

export default function OnboardingWizard({
  step,
  globalPercent,
  stepPercents,
  completedSteps,
  saving,
  onSubmit,
  onBack,
  onSkip,
  children,
}: OnboardingWizardProps) {
  const isLast = step === ONBOARDING_STEPS.length - 1;
  const current = ONBOARDING_STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-darkmode dark:via-darkmode dark:to-darklight">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        {/* Panneau gauche — navigation */}
        <aside className="flex flex-col border-b border-slate-200/80 bg-white/80 px-6 py-8 backdrop-blur dark:border-dark_border dark:bg-darklight/90 lg:w-[340px] lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <Link href="/" className="block mb-8 hover:opacity-80">
            <Logo logoColor="/images/logo/logo.png" />
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              CEG 2 Ouidah
            </p>
            <h1 className="mt-2 text-2xl font-bold text-midnight_text dark:text-white">
              Bienvenue dans le répertoire
            </h1>
            <p className="mt-2 text-sm text-grey dark:text-white/70">
              Quelques minutes pour créer votre fiche d’ancien élève.
            </p>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs font-medium text-grey dark:text-white/60">
              <span>Profil complété</span>
              <span className="text-primary">{globalPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-dark_border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${globalPercent}%` }}
              />
            </div>
          </div>

          <ol className="flex flex-1 flex-col gap-2">
            {ONBOARDING_STEPS.map((s, index) => {
              const active = index === step;
              const done = completedSteps[index] || index < step;

              return (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl px-4 py-3 transition",
                    active && "bg-primary/10 ring-1 ring-primary/30",
                    done && !active && "opacity-80"
                  )}>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      done
                        ? "bg-primary text-white"
                        : active
                          ? "border-2 border-primary text-primary"
                          : "bg-slate-100 text-grey dark:bg-dark_border"
                    )}>
                    {done ? "✓" : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        active
                          ? "text-primary"
                          : "text-midnight_text dark:text-white"
                      )}>
                      {s.title}
                    </p>
                    <p className="mt-0.5 text-xs text-grey dark:text-white/50">
                      {stepPercents[index]}% — {stepDescriptions[index]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 hidden text-xs text-grey dark:text-white/50 lg:block">
            Vous pourrez modifier ces informations depuis votre profil à tout moment.
          </p>
        </aside>

        {/* Panneau droit — formulaire */}
        <div className="flex flex-1 flex-col px-6 py-8 lg:px-10 lg:py-12">
          <div className="mb-6 lg:hidden">
            <p className="text-sm font-medium text-primary">
              Étape {step + 1} / {ONBOARDING_STEPS.length}
            </p>
            <h2 className="text-xl font-bold text-midnight_text dark:text-white">
              {current.title}
            </h2>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-medium text-primary">{current.shortTitle}</p>
            <h2 className="mt-1 text-2xl font-bold text-midnight_text dark:text-white">
              {current.title}
            </h2>
            <p className="mt-2 text-sm text-grey dark:text-white/70">
              {stepDescriptions[step]}
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="mt-8 flex flex-1 flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40 dark:border-dark_border dark:bg-darklight dark:shadow-none lg:p-8">
            <div className="flex-1">{children}</div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6 dark:border-dark_border">
              <button
                type="button"
                onClick={onBack}
                disabled={step === 0 || saving}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-midnight_text transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark_border dark:text-white">
                Retour
              </button>

              <div className="flex flex-wrap gap-2">
                {!isLast && onSkip && (
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={saving}
                    className="rounded-full px-5 py-2.5 text-sm font-medium text-grey hover:text-primary dark:text-white/70">
                    Passer
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-blue-700 disabled:opacity-60">
                  {saving
                    ? "Enregistrement…"
                    : isLast
                      ? "Terminer et accéder au répertoire"
                      : "Continuer"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
