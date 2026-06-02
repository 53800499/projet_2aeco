"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useState } from "react";
import { getOnboardingProgress, isProfileOnboardingDone } from "@/lib/onboarding";

interface ProfileCompletionBannerProps {
  onClose?: () => void;
}

export default function ProfileCompletionBanner({
  onClose,
}: ProfileCompletionBannerProps) {
  const { user, profile, profileCompletion } = useAuthProfile();
  const [closed, setClosed] = useState(false);

  const percent = profileCompletion;
  const onboardingDone = isProfileOnboardingDone(profile);
  const { recommendedStep } = getOnboardingProgress(profile || {});

  if (!user || closed || percent >= 100) {
    return null;
  }

  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  const resumeStepKey =
    ["identity", "scholarship", "contact"][recommendedStep] ?? "identity";

  const title = onboardingDone
    ? "Complétez votre profil dans le répertoire"
    : "Finalisez votre inscription — CEG 2 Ouidah";
  const description = onboardingDone
    ? "Votre profil est à compléter pour apparaître dans la plaquette numérique des anciens élèves."
    : "Terminez l’onboarding pour rejoindre le répertoire et la plaquette des alumni.";
  const ctaHref = onboardingDone ? "/profile" : `/onboarding?step=${resumeStepKey}`;
  const ctaLabel = onboardingDone ? "Compléter mon profil" : "Continuer l’onboarding";

  return (
    <div className="mx-auto mb-6 w-full max-w-6xl overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm dark:border-dark_border dark:bg-darkmode">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20">
              {onboardingDone ? "Profil à compléter" : "Onboarding en cours"}
            </div>
            <span className="text-sm font-medium text-primary">{percent}% complété</span>
          </div>

          <h3 className="text-lg font-semibold text-midnight_text dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-grey dark:text-white/70">{description}</p>

          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs text-grey dark:text-white/60">
              <span>Progression du profil</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark_border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="mt-5">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              {ctaLabel}
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="rounded-md p-2 text-red-400 transition hover:bg-red-100 hover:text-red-600"
          aria-label="Fermer">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
