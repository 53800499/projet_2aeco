"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlaquetteMemberCard from "@/components/plaquette/PlaquetteMemberCard";
import { PlaquetteMember, groupMembersByPromo } from "@/lib/plaquette";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";
import HeroSub from "@/components/SharedComponent/HeroSub";

export default function PlaquettePage() {
  const [members, setMembers] = useState<PlaquetteMember[]>([]);
  const [promos, setPromos] = useState<string[]>([]);
  const [promoFilter, setPromoFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const qs = promoFilter ? `?promo=${encodeURIComponent(promoFilter)}` : "";
        const res = await fetch(`/api/plaquette/members${qs}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setMembers(data.members);
        setPromos(data.promos || []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Impossible de charger la plaquette.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [promoFilter]);

  const grouped = useMemo(() => groupMembersByPromo(members), [members]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <SpinnerScreen />
      </main>
    );
  }
  const breadcrumbLinks = [
    { href: "/", text: "Accueil" },
    { href: "/plaquette", text: "Plaquette" },
  ];

  return (
    <>
    <main className="bg-gradient-to-b from-slate-50 to-white dark:from-darkmode dark:to-darklight mt-24">
      {/* En-tête — masqué à l'impression */}
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
              CEG 2 Ouidah — Répertoire des anciens élèves ({members.length} fiche
              {members.length > 1 ? "s" : ""})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
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
            </select>{/* 
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Imprimer / PDF
            </button> */}
          </div>
        </div>
      </header>

      {/* Couverture imprimable */}
      <section className="plaquette-cover mx-auto max-w-6xl px-6 py-12 text-center print:py-24">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">CEG 2 Ouidah</p>
        <h2 className="mt-4 text-4xl font-bold text-midnight_text dark:text-white md:text-5xl">
          Plaquette des anciens élèves
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-grey dark:text-white/70">
          Annuaire numérique — promotion par promotion
        </p>
      </section>

      {error && (
        <p className="mx-auto max-w-6xl px-6 text-center text-red-600">{error}</p>
      )}

      <div className="mx-auto max-w-6xl space-y-12 px-6 pb-20">
        {grouped.length === 0 ? (
          <p className="text-center text-grey py-16">
            Aucun membre publié dans la plaquette pour le moment.
          </p>
        ) : (
          grouped.map(([promo, list]) => (
            <section key={promo} className="plaquette-section break-before-page">
              <div className="mb-6 flex items-end justify-between border-b-2 border-primary pb-3">
                <h3 className="text-2xl font-bold text-midnight_text dark:text-white">
                  Promotion {promo}
                </h3>
                <span className="text-sm text-grey">{list.length} membre(s)</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => (
                  <PlaquetteMemberCard key={m.id} member={m} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
    </>
  );
}
