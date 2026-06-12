"use client";

import MembershipCard from "@/components/membership/MembershipCard";
import {
  getMembershipCardDisplayName,
  getMissingMembershipCardFields,
  isMembershipCardEligible,
} from "@/lib/membership-card";
import { printMembershipCard } from "@/lib/membership-card-print";
import { ProfileRecord } from "@/lib/profile";
import "@/styles/membership-card-print.css";

interface MembershipCardSectionProps {
  profile: Partial<ProfileRecord>;
}

export default function MembershipCardSection({ profile }: MembershipCardSectionProps) {
  const eligible = isMembershipCardEligible(profile);
  const missing = getMissingMembershipCardFields(profile);
  const displayName = getMembershipCardDisplayName(profile);

  const handleDownload = () => {
    printMembershipCard({
      memberName: displayName,
      matricule: profile.matricule,
    });
  };

  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-service dark:border-dark_border dark:bg-darkmode">
      <p className="text-sm uppercase tracking-[0.25em] text-primary">Carte membre</p>
      <h2 className="mt-2 text-xl font-semibold text-midnight_text dark:text-white">
        Carte d&apos;adhérent
      </h2>

      {eligible ? (
        <>
          <p className="mt-3 text-sm text-grey dark:text-white/70">
            Votre profil est à jour. Téléchargez votre carte de membre au format PDF
            (via l&apos;impression du navigateur).
          </p>

          <div className="mt-5 flex justify-center">
            <MembershipCard profile={profile} />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Télécharger ma carte de membre
          </button>

          <MembershipCard profile={profile} documentRoot />
        </>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-grey dark:text-white/70">
          <p>
            Complétez les informations ci-dessous pour débloquer le téléchargement de
            votre carte de membre.
          </p>
          {profile.matricule && (
            <p>
              <span className="font-semibold text-midnight_text dark:text-white">
                Matricule :
              </span>{" "}
              {profile.matricule}
            </p>
          )}
          {missing.length > 0 && (
            <ul className="list-inside list-disc space-y-1">
              {missing.map((item) => (
                <li key={item.key}>{item.label}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
