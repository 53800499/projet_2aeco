/** @format */

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlaquetteMemberCard from "@/components/plaquette/PlaquetteMemberCard";
import { PlaquetteMember } from "@/lib/plaquette";
import { printPlaquetteDocument } from "@/lib/plaquette-print";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";
import "@/styles/plaquette-print.css";
import "@/styles/plaquette-mobile.css";

export default function PlaquettePage() {
  const [members, setMembers] = useState<PlaquetteMember[]>([]);
  const [promos, setPromos] = useState<string[]>([]);
  const [promoFilter, setPromoFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const exportDate = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const handlePrint = () => {
    if (sortedMembers.length === 0) return;
    printPlaquetteDocument({ promoFilter });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <SpinnerScreen />
      </main>
    );
  }

  return (
    <main className="plaquette-page bg-gradient-to-b from-slate-50 to-white dark:from-darkmode dark:to-darklight mt-24">
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
              onClick={handlePrint}
              disabled={sortedMembers.length === 0}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">
              Exporter PDF
            </button>
          </div>
        </div>
      </header>

      <article
        className="plaquette-document mx-auto max-w-6xl bg-white text-midnight_text"
        aria-label="Plaquette des anciens élèves CEG 2 Ouidah">
        <header className="plaquette-cover px-6 pt-10 text-center">
          <p className="plaquette-cover__org text-sm uppercase tracking-[0.3em] text-primary">
            CEG 2 Ouidah
          </p>

          <h2 className="plaquette-cover__title mt-4 text-4xl font-bold md:text-5xl">
            Plaquette des anciens élèves
          </h2>

          <p className="plaquette-cover__subtitle mx-auto mt-4 max-w-xl text-grey dark:text-white/70">
            Annuaire numérique — listing alphabétique des membres
            {promoFilter ? ` — Promotion ${promoFilter}` : ""}
          </p>

          <p className="plaquette-cover__meta mt-2 text-xs text-grey dark:text-white/60">
            {sortedMembers.length} fiche{sortedMembers.length > 1 ? "s" : ""} —
            édition du {exportDate}
          </p>
        </header>

        {error && (
          <p className="plaquette-no-print mx-auto max-w-6xl px-6 text-center text-red-600">
            {error}
          </p>
        )}

        <section
          className="plaquette-members px-6 pb-10"
          aria-label="Liste des membres">
          {sortedMembers.length === 0 ?
            <p className="py-16 text-center text-grey">
              Aucun membre publié dans la plaquette pour le moment.
            </p>
          : <ul className="grid gap-4 ">
              {sortedMembers.map((m) => (
                <li key={m.id}>
                  <PlaquetteMemberCard member={m} />
                </li>
              ))}
            </ul>
          }
        </section>
      </article>
    </main>
  );
}
