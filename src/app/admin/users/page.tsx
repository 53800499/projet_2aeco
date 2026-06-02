"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAdminApi, AdminUserRow, UserListStatus } from "@/hooks/useAdminApi";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { AUTH_MESSAGES, formatAuthError } from "@/lib/auth-messages";
import AdminUserCreateModal from "@/components/admin/AdminUserCreateModal";

const statusTabs: { key: UserListStatus; label: string }[] = [
  { key: "active", label: "Actifs" },
  { key: "deleted", label: "Supprimés" },
  { key: "all", label: "Tous" },
];

export default function AdminUsersPage() {
  const { fetchUsers, createUser, softDeleteUser, restoreUser } = useAdminApi();
  const { showError, showSuccess } = useAuthFeedback();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserListStatus>("active");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsers({ search: query, page, limit: 15, status });
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) {
      showError(formatAuthError(e));
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, query, page, status, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSoftDelete = async (id: string, name: string) => {
    if (!confirm(`Archiver (suppression logique) : ${name} ?`)) return;
    try {
      await softDeleteUser(id);
      showSuccess("Membre archivé. Il n’apparaîtra plus dans la plaquette.");
      void load();
    } catch (e) {
      showError(formatAuthError(e));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreUser(id);
      showSuccess("Membre restauré.");
      void load();
    } catch (e) {
      showError(formatAuthError(e));
    }
  };

  return (
    <div className="space-y-6">
      <AdminUserCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (data) => {
          await createUser(data);
          showSuccess("Membre créé avec succès.");
          void load();
        }}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-midnight_text dark:text-white">
            Gestion des utilisateurs
          </h2>
          <p className="text-sm text-grey dark:text-white/70">
            Créer, lire, modifier, archiver (suppression logique) et restaurer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          + Nouveau membre
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setStatus(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              status === tab.key
                ? "bg-primary text-white"
                : "bg-slate-100 text-grey dark:bg-dark_border dark:text-white/70"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search);
        }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-dark_border dark:bg-darklight dark:text-white"
        />
        <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white dark:bg-primary">
          Rechercher
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-dark_border dark:bg-darklight">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-slate-50 dark:bg-dark_border/30">
              <tr>
                <th className="px-4 py-3 font-semibold">Membre</th>
                <th className="px-4 py-3 font-semibold">Promotion</th>
                <th className="px-4 py-3 font-semibold">Profil</th>
                <th className="px-4 py-3 font-semibold">Plaquette</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-grey">
                    Chargement…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-grey">
                    Aucun utilisateur.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b dark:border-dark_border/50 ${
                      u.deleted_at ? "bg-slate-50/80 opacity-75 dark:bg-dark_border/20" : ""
                    }`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.photo ? (
                          <img src={u.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {(u.full_name || u.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{u.full_name || "—"}</p>
                          <p className="text-xs text-grey">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{u.promo || "—"}</td>
                    <td className="px-4 py-3">{u.profile_completion}%</td>
                    <td className="px-4 py-3">
                      {u.deleted_at ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : u.visible_in_plaquette && u.onboarding_completed ? (
                        <span className="text-xs text-emerald-600">Oui</span>
                      ) : (
                        <span className="text-xs text-amber-600">Non</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.deleted_at ? (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">Archivé</span>
                      ) : u.onboarding_completed ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          Actif
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          Incomplet
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-primary hover:underline text-xs font-medium">
                          Modifier
                        </Link>
                        {u.deleted_at ? (
                          <button
                            type="button"
                            onClick={() => handleRestore(u.id)}
                            className="text-xs font-medium text-emerald-600 hover:underline">
                            Restaurer
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSoftDelete(u.id, u.full_name || u.email)}
                            className="text-xs font-medium text-red-600 hover:underline">
                            Archiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > 15 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">
            Précédent
          </button>
          <span className="flex items-center px-4 text-sm">Page {page} — {total} résultat(s)</span>
          <button
            type="button"
            disabled={page * 15 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
