"use client";

import Link from "next/link";

export default function AdminPlaquettePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-midnight_text dark:text-white">
        Plaquette numérique
      </h2>
      <p className="text-sm text-grey dark:text-white/70">
        Seuls les membres <strong>actifs</strong>, ayant terminé l’onboarding et marqués
        « visibles dans la plaquette » apparaissent dans l’annuaire public.
      </p>
      <ul className="list-inside list-disc space-y-2 text-sm text-grey dark:text-white/70">
        <li>Le % de complétion affiché est identique partout (profil, admin, onboarding).</li>
        <li>Publication : onboarding terminé + visible dans la plaquette + non archivé.</li>
        <li>Archiver un membre le retire automatiquement de la plaquette.</li>
        <li>Décochez « Visible plaquette » dans la fiche pour masquer sans archiver.</li>
      </ul>
      <Link
        href="/plaquette"
        target="_blank"
        className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
        Ouvrir la plaquette publique →
      </Link>
    </div>
  );
}
