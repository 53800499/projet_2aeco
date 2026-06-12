"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useState } from "react";
import ProfileMissingFieldsAlert from "@/components/Auth/ProfileMissingFieldsAlert";

interface ProfileCompletionBannerProps {
  onClose?: () => void;
}

export default function ProfileCompletionBanner({
  onClose,
}: ProfileCompletionBannerProps) {
  const { user, profile, profileCompletion } = useAuthProfile();
  const [closed, setClosed] = useState(false);

  const percent = profileCompletion;

  if (!user || closed || percent >= 100) {
    return null;
  }

  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  return (
    <div className="mb-3 w-full overflow-hidden rounded-xl border-2 border-amber-400 bg-amber-50 shadow-md dark:border-amber-500/50 dark:bg-amber-950/30">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex-1 space-y-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                Profil incomplet
              </div>
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {percent}% complété
              </span>
            </div>

            <h3 className="text-lg font-semibold text-amber-950 dark:text-amber-50">
              Complétez votre profil pour le répertoire
            </h3>
            <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
              Les champs manquants sont listés ci-dessous. Cliquez sur un
              libellé pour accéder directement au formulaire.
            </p>
          </div>

          <ProfileMissingFieldsAlert
            profile={profile}
            percent={percent}
            className="hidden md:block border-amber-300 bg-white/80 dark:border-amber-600/40 dark:bg-darkmode/80"
          />

          <div>
            <div className="mb-2 flex justify-between text-xs font-medium text-amber-900 dark:text-amber-200">
              <span>Progression</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900/50">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700">
            Mettre à jour mon profil
          </Link>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="rounded-md p-2 text-amber-700 transition hover:bg-amber-200/80 dark:text-amber-300 dark:hover:bg-amber-900/50"
          aria-label="Fermer">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
