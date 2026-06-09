/** @format */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PlaquetteMemberCard from "@/components/plaquette/PlaquetteMemberCard";
import { PlaquetteMember } from "@/lib/plaquette";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";
import { exportElementToPdf } from "@/lib/export-pdf";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";

export default function PlaquettePage() {
  const [members, setMembers] = useState<PlaquetteMember[]>([]);
  const [promos, setPromos] = useState<string[]>([]);
  const [promoFilter, setPromoFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useAuthFeedback();

  useEffect(() => {
    const load = async () => {
      try {
        const qs =
          promoFilter ? `?promo=${encodeURIComponent(promoFilter)}` : "";
        const res = await fetch(`/api/plaquette/members${qs}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setMembers(data.members);
        setPromos(data.promos || []);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Impossible de charger la plaquette."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [promoFilter]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const nameA = `${a.first_name ?? ""} ${a.last_name ?? ""}`.toLowerCase();
      const nameB = `${b.first_name ?? ""} ${b.last_name ?? ""}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [members]);

  const exportPDF = async () => {
    if (!printRef.current || sortedMembers.length === 0) return;

    setExporting(true);
    try {
      const promoSuffix =
        promoFilter ?
          `-${promoFilter.replace(/\s+/g, "-").toLowerCase()}`
        : "";
      await exportElementToPdf(printRef.current, {
        filename: `plaquette-ceg2-ouidah${promoSuffix}.pdf`,
        margin: 0.5,
        orientation: "portrait",
      });
      showSuccess("Plaquette exportée en PDF.");
    } catch (e: unknown) {
      showError(
        e instanceof Error ?
          e.message
        : "Impossible de générer le PDF. Réessayez."
      );
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <SpinnerScreen />
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-50 to-white dark:from-darkmode dark:to-darklight mt-24">
      <header className="plaquette-no-print border-b border-slate-200 bg-white/90 backdrop-blur dark:border-dark_border dark:bg-darklight/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Accueil
            </Link>

            <h1 className="mt-1 text-2xl font-bold text-midnight_text dark:text-white">
              Plaquette numérique des membres
            </h1>

            <p className="text-sm text-grey dark:text-white/70">
              CEG 2 Ouidah — Répertoire des anciens élèves ({members.length}{" "}
              fiche
              {members.length > 1 ? "s" : ""})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filtrer par promotion"
              value={promoFilter}
              onChange={(e) => {
                setLoading(true);
                setPromoFilter(e.target.value);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-dark_border dark:bg-darkmode dark:text-white">
              <option value="">Toutes les promotions</option>
              {promos.map((p) => (
                <option key={p} value={p === "Non renseigné" ? "" : p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void exportPDF()}
              disabled={exporting || sortedMembers.length === 0}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">
              {exporting ? "Génération…" : "Exporter PDF"}
            </button>
          </div>
        </div>
      </header>

      <div
        ref={printRef}
        className="plaquette-pdf-root bg-white text-midnight_text">
        <section className="plaquette-cover mx-auto max-w-6xl px-6 py-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            CEG 2 Ouidah
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Plaquette des anciens élèves
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-grey">
            Annuaire numérique — listing alphabétique des membres
            {promoFilter ? ` — Promotion ${promoFilter}` : ""}
          </p>

          <p className="mt-2 text-xs text-grey">
            {sortedMembers.length} fiche{sortedMembers.length > 1 ? "s" : ""} —
            export du{" "}
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </section>

        {error && (
          <p className="mx-auto max-w-6xl px-6 text-center text-red-600">
            {error}
          </p>
        )}

        <div className="mx-auto max-w-6xl px-6 pb-20">
          {sortedMembers.length === 0 ?
            <p className="py-16 text-center text-grey">
              Aucun membre publié dans la plaquette pour le moment.
            </p>
          : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedMembers.map((m) => (
                <PlaquetteMemberCard key={m.id} member={m} />
              ))}
            </div>
          }
        </div>
      </div>
    </main>
  );
}
