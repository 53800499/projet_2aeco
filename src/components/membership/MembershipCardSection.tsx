"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import MembershipCard from "@/components/membership/MembershipCard";
import {
  getMembershipCardDisplayName,
  getMissingMembershipCardFields,
  isMembershipCardEligible,
} from "@/lib/membership-card";
import { downloadMembershipCard } from "@/lib/membership-card-print";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { ProfileRecord } from "@/lib/profile";
import "@/styles/membership-card-print.css";

interface MembershipCardSectionProps {
  profile: Partial<ProfileRecord>;
}

export default function MembershipCardSection({ profile }: MembershipCardSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { showSuccess, showError } = useAuthFeedback();
  const eligible = isMembershipCardEligible(profile);
  const missing = getMissingMembershipCardFields(profile);
  const displayName = getMembershipCardDisplayName(profile);

  const handleDownload = async () => {
    const cardNode = cardRef.current;
    if (!cardNode || downloading) return;

    setDownloading(true);
    try {
      await downloadMembershipCard(cardNode, {
        memberName: displayName,
        matricule: profile.matricule,
      });
      showSuccess("Votre carte a été téléchargée.");
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Le téléchargement de la carte a échoué."
      );
    } finally {
      setDownloading(false);
    }
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
            Un clic suffit : la carte s&apos;enregistre automatiquement sur votre
            appareil au format image (PNG).
          </p>

          <div
            ref={cardRef}
            className="membership-card-preview mt-5 flex justify-center"
          >
            <MembershipCard profile={profile} />
          </div>

          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={downloading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-wait disabled:opacity-70"
          >
            <Download className="h-4 w-4" aria-hidden />
            {downloading ? "Téléchargement en cours…" : "Télécharger ma carte de membre"}
          </button>
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
