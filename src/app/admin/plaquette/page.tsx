"use client";

import Link from "next/link";

export default function AdminPlaquettePage() {
  return (
    <div className="min-w-0 space-y-6">
      <h2 className="text-xl font-bold text-midnight_text sm:text-2xl dark:text-white">
        Plaquette numérique
      </h2>
      <p className="text-sm text-grey dark:text-white/70">
        Seuls les membres avec un profil suffisamment complété (≥ 40%), marqués
        « visibles dans la plaquette » et non archivés apparaissent dans l’annuaire public.
      </p>
      <ul className="list-inside list-disc space-y-2 text-sm text-grey dark:text-white/70">
        <li>Le % de complétion affiché est identique partout (profil, admin, plaquette).</li>
        <li>Publication : profil ≥ 40% + visible dans la plaquette + non archivé.</li>
        <li>Archiver un membre le retire automatiquement de la plaquette.</li>
        <li>Décochez « Visible plaquette » dans la fiche pour masquer sans archiver.</li>
      </ul>
      <Link
        href="/plaquette"
        target="_blank"
        className="inline-flex w-full justify-center rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-white hover:bg-green-700 sm:w-auto"
      >
        Ouvrir la plaquette publique →
      </Link>
    </div>
  );
}
