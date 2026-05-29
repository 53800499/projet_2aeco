"use client";

import React from "react";

interface ProfileCompletionCardProps {
  percent: number;
  onComplete: () => void;
}

const ProfileCompletionCard = ({ percent, onComplete }: ProfileCompletionCardProps) => {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-service dark:border-dark_border dark:bg-darkmode">
      <p className="text-sm uppercase tracking-[0.25em] text-primary">Profil</p>
      <h3 className="mt-2 text-2xl font-semibold text-midnight_text dark:text-white">Votre profil est à {percent}%</h3>
      <p className="mt-3 text-sm text-grey dark:text-white/70">
        Complétez vos informations pour apparaître pleinement dans le répertoire et améliorer votre visibilité.
      </p>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-dark_border">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Compléter mon profil
      </button>
    </section>
  );
};

export default ProfileCompletionCard;
