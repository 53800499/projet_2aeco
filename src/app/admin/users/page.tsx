"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAdminApi, AdminUserRow, UserListStatus } from "@/hooks/useAdminApi";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { formatAuthError } from "@/lib/auth-messages";
import { PLAQUETTE_MIN_PROFILE_COMPLETION } from "@/lib/profile";
import AdminUserCreateModal from "@/components/admin/AdminUserCreateModal";

const statusTabs: { key: UserListStatus; label: string }[] = [
  { key: "active", label: "Actifs" },
  { key: "deleted", label: "Supprimés" },
  { key: "all", label: "Tous" },
];

function UserCard({
  u,
  onArchive,
  onRestore,
}: {
  u: AdminUserRow;
  onArchive: () => void;
  onRestore: () => void;
}) {
  const plaquetteOk =
    !u.deleted_at &&
    u.visible_in_plaquette &&
    u.profile_completion >= PLAQUETTE_MIN_PROFILE_COMPLETION;

  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark_border dark:bg-darklight ${
        u.deleted_at ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {u.photo ? (
          <img src={u.photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {(u.full_name || u.email)[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-midnight_text dark:text-white">
            {u.full_name || "—"}
          </p>
          <p className="truncate text-xs text-grey">{u.email}</p>
          <p className="mt-1 text-xs text-grey">Promo : {u.promo || "—"}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs dark:bg-dark_border">
          Profil {u.profile_completion}%
        </span>
        {u.deleted_at ? (
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs">Archivé</span>
        ) : u.profile_completion >= 100 ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-700">
            Complet
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700">
            À compléter
          </span>
        )}
        {!u.deleted_at && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs ${
              plaquetteOk ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            Plaquette {plaquetteOk ? "Oui" : "Non"}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 dark:border-dark_border">
        <Link href={`/admin/users/${u.id}`} className="text-sm font-medium text-primary hover:underline">
          Modifier
        </Link>
        {u.deleted_at ? (
          <button type="button" onClick={onRestore} className="text-sm font-medium text-emerald-600 hover:underline">
            Restaurer
          </button>
        ) : (
          <button type="button" onClick={onArchive} className="text-sm font-medium text-red-600 hover:underline">
            Archiver
          </button>
        )}
      </div>
    </article>
  );
}

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
    <div className="min-w-0 space-y-6">
      <AdminUserCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (data) => {
          await createUser(data);
          showSuccess("Membre créé avec succès.");
          void load();
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-midnight_text sm:text-2xl dark:text-white">
            Gestion des utilisateurs
          </h2>
          <p className="text-sm text-grey dark:text-white/70">
            Créer, lire, modifier, archiver (suppression logique) et restaurer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 sm:w-auto"
        >
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
            className={`rounded-full px-3 py-2 text-sm font-medium transition sm:px-4 ${
              status === tab.key
                ? "bg-primary text-white"
                : "bg-slate-100 text-grey dark:bg-dark_border dark:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search);
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darklight dark:text-white"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm text-white dark:bg-primary sm:w-auto"
        >
          Rechercher
        </button>
      </form>

      {/* Mobile : cartes */}
      <div className="grid gap-3 md:hidden">
        {loading ? (
          <p className="py-8 text-center text-grey">Chargement…</p>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-grey">Aucun utilisateur.</p>
        ) : (
          users.map((u) => (
            <UserCard
              key={u.id}
              u={u}
              onArchive={() => handleSoftDelete(u.id, u.full_name || u.email)}
              onRestore={() => handleRestore(u.id)}
            />
          ))
        )}
      </div>

      {/* Desktop : tableau */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block dark:border-dark_border dark:bg-darklight">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
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
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.photo ? (
                          <img src={u.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {(u.full_name || u.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.full_name || "—"}</p>
                          <p className="truncate text-xs text-grey">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{u.promo || "—"}</td>
                    <td className="px-4 py-3">{u.profile_completion}%</td>
                    <td className="px-4 py-3">
                      {u.deleted_at ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : u.visible_in_plaquette &&
                        u.profile_completion >= PLAQUETTE_MIN_PROFILE_COMPLETION ? (
                        <span className="text-xs text-emerald-600">Oui</span>
                      ) : (
                        <span className="text-xs text-amber-600">Non</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.deleted_at ? (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">Archivé</span>
                      ) : u.profile_completion >= 100 ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          Complet
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          À compléter
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Modifier
                        </Link>
                        {u.deleted_at ? (
                          <button
                            type="button"
                            onClick={() => handleRestore(u.id)}
                            className="text-xs font-medium text-emerald-600 hover:underline"
                          >
                            Restaurer
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSoftDelete(u.id, u.full_name || u.email)}
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
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
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-4 py-2.5 text-sm disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-center text-sm text-grey">
            Page {page} — {total} résultat(s)
          </span>
          <button
            type="button"
            disabled={page * 15 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-4 py-2.5 text-sm disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
