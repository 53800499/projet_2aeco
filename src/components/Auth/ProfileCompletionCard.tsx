"use client";

import React from "react";
import { ProfileRecord } from "@/lib/profile";
import ProfileMissingFieldsAlert from "@/components/Auth/ProfileMissingFieldsAlert";

interface ProfileCompletionCardProps {
  percent: number;
  profile?: Partial<ProfileRecord> | null;
  onComplete?: () => void;
  subtitle?: string;
  hideButton?: boolean;
}

const ProfileCompletionCard = ({
  percent,
  profile,
  onComplete,
  subtitle,
  hideButton = false,
}: ProfileCompletionCardProps) => {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-service dark:border-dark_border dark:bg-darkmode">
      <p className="text-sm uppercase tracking-[0.25em] text-primary">Profil</p>
      <h3 className="mt-2 text-2xl font-semibold text-midnight_text dark:text-white">
        Votre profil est à {percent}%
      </h3>
      <p className="mt-3 text-sm text-grey dark:text-white/70">
        {subtitle ||
          "Ce pourcentage est le même sur votre profil, l’administration et la plaquette numérique du CEG 2 Ouidah."}
      </p>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-dark_border">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {profile && percent < 100 && (
        <ProfileMissingFieldsAlert
          profile={profile}
          percent={percent}
          maxItems={6}
          className="mt-5"
        />
      )}

      {!hideButton && percent < 100 && onComplete && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Compléter mon profil
        </button>
      )}
    </section>
  );
};

export default ProfileCompletionCard;
