"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminApi, AdminDashboardStats } from "@/hooks/useAdminApi";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { formatAuthError } from "@/lib/auth-messages";
import StatBarChart from "@/components/admin/StatBarChart";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";

export default function AdminDashboardPage() {
  const { fetchStats } = useAdminApi();
  const { showError } = useAuthFeedback();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await fetchStats());
      } catch (e) {
        console.error("admin stats:", e);
        showError(formatAuthError(e, "Impossible de charger les statistiques. Vérifiez SUPABASE_SERVICE_ROLE_KEY et les migrations SQL."));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [fetchStats, showError]);

  if (loading) return <p className="text-grey"><SpinnerScreen /></p>;
  if (!stats) return <p className="text-grey">Aucune donnée.</p>;

  const o = stats.overview;

  const overviewCards = [
    { label: "Membres actifs", value: o.totalActive, accent: "bg-primary" },
    { label: "Supprimés (logique)", value: o.totalDeleted, accent: "bg-slate-400" },
    { label: "Total historique", value: o.totalAll, accent: "bg-slate-600" },
    { label: "Nouveaux (30 j)", value: o.newThisMonth, accent: "bg-emerald-500" },
    { label: "Profils complets (100%)", value: o.profileComplete100, accent: "bg-green-500" },
    { label: "Profils à compléter", value: o.profileIncomplete, accent: "bg-amber-500" },
    { label: "Éligibles plaquette", value: o.plaquetteEligible, accent: "bg-violet-500" },
    { label: "Visibles plaquette", value: o.visibleInPlaquette, accent: "bg-indigo-500" },
    { label: "Complétion moyenne", value: `${o.avgCompletion}%`, accent: "bg-rose-500" },
    { label: "Taux profils complets", value: `${o.profileCompleteRate}%`, accent: "bg-cyan-500" },
    { label: "Administrateurs", value: o.admins, accent: "bg-orange-500" },
  ];

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-midnight_text sm:text-2xl dark:text-white">
            Statistiques — tous les axes
          </h2>
          <p className="mt-1 text-sm text-grey dark:text-white/70">
            Vue complète des membres : actifs, supprimés, complétion profil, plaquette, promotions.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href="/admin/users"
            className="inline-flex justify-center rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700"
          >
            Gérer les utilisateurs
          </Link>
          <Link
            href="/plaquette"
            target="_blank"
            className="inline-flex justify-center rounded-xl border border-primary px-4 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/5"
          >
            Voir la plaquette →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark_border dark:bg-darklight">
            <div className={`mb-2 h-1 w-10 rounded-full ${card.accent}`} />
            <p className="text-2xl font-bold text-midnight_text dark:text-white">{card.value}</p>
            <p className="mt-1 text-xs text-grey dark:text-white/60">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <StatBarChart
          title="Par promotion"
          items={stats.byPromo.map((p) => ({ label: p.promo, count: p.count }))}
          total={o.totalActive}
        />
        <StatBarChart
          title="Par statut de profil"
          items={stats.byProfileStatus.map((x) => ({ label: x.status, count: x.count }))}
          barClass="bg-green-500"
        />
        <StatBarChart
          title="Par statut membre"
          items={stats.byStatutMembre.map((x) => ({ label: x.statut, count: x.count }))}
          barClass="bg-teal-500"
        />
        <StatBarChart
          title="Par situation de cotisation"
          items={stats.byCotisation.map((x) => ({ label: x.situation, count: x.count }))}
          barClass="bg-sky-500"
        />
        <StatBarChart
          title="Par rôle"
          items={stats.byRole.map((r) => ({ label: r.role, count: r.count }))}
          barClass="bg-orange-500"
        />
        <StatBarChart
          title="Par sexe"
          items={stats.bySexe.map((s) => ({ label: s.sexe, count: s.count }))}
          barClass="bg-violet-500"
        />
        <StatBarChart
          title="Par niveau de complétion du profil"
          items={stats.byCompletion.map((c) => ({ label: c.range, count: c.count }))}
          barClass="bg-emerald-500"
        />
        <StatBarChart
          title="Visibilité plaquette"
          items={stats.byVisibility.map((v) => ({
            label: v.visible ? "Visible" : "Masqué",
            count: v.count,
          }))}
          barClass="bg-indigo-500"
        />
      </div>

      <StatBarChart
        title="Inscriptions par mois (12 derniers mois)"
        items={stats.byMonth.map((m) => ({ label: m.label, count: m.count }))}
        barClass="bg-primary"
      />
    </div>
  );
}
