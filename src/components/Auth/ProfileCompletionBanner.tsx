"use client";

import Link from "next/link";
import { useAuthProfile } from "@/app/context/AuthProfileContext";

const ProfileCompletionBanner = () => {
  const { user, profileCompletion } = useAuthProfile();

  if (!user || profileCompletion >= 100) return null;

  return (
    <section className="mx-auto mt-24 w-full max-w-6xl px-6">
      <div className="rounded-3xl border border-primary/20 bg-white p-5 shadow-service dark:border-dark_border dark:bg-darkmode/95">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary">Profil incomplet</p>
            <h3 className="mt-1 text-xl font-semibold text-midnight_text dark:text-white">Votre profil est à {profileCompletion}%</h3>
            <p className="mt-2 text-sm text-grey dark:text-white/70">Complétez vos informations pour apparaître pleinement dans le répertoire.</p>
          </div>
          <Link
            href="/onboarding?step=identity"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Compléter mon profil
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProfileCompletionBanner;
