"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ProfileRecord } from "@/hooks/useSupabaseProfile";
import ImageFileInput from "@/components/Common/ImageFileInput";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { AUTH_MESSAGES, formatAuthError } from "@/lib/auth-messages";
import {
  COTISATION_SITUATION_OPTIONS,
  getProfileCompletion,
  isPlaquetteEligible,
  MEMBER_STATUS_OPTIONS,
  PLAQUETTE_MIN_PROFILE_COMPLETION,
} from "@/lib/profile";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode dark:text-white";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchUser, updateUser, softDeleteUser, restoreUser } = useAdminApi();
  const { showSuccess, showError } = useAuthFeedback();
  const [draft, setDraft] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { profile } = await fetchUser(id);
      setDraft(profile);
    } catch (e) {
      showError(formatAuthError(e));
    } finally {
      setLoading(false);
    }
  }, [id, fetchUser, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = <K extends keyof ProfileRecord>(
    field: K,
    value: ProfileRecord[K]
  ) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!draft || !id) return;
    setSaving(true);
    try {
      await updateUser(id, {
        ...draft,
        visible_in_plaquette: draft.visible_in_plaquette !== false,
      });
      showSuccess(AUTH_MESSAGES.profileSaved);
      void load();
    } catch (e) {
      showError(formatAuthError(e, AUTH_MESSAGES.profileSaveFailed));
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!id || !confirm("Archiver ce membre (suppression logique) ?")) return;
    try {
      await softDeleteUser(id);
      showSuccess("Membre archivé.");
      router.push("/admin/users");
    } catch (e) {
      showError(formatAuthError(e));
    }
  };

  const handleRestore = async () => {
    if (!id) return;
    try {
      await restoreUser(id);
      showSuccess("Membre restauré.");
      void load();
    } catch (e) {
      showError(formatAuthError(e));
    }
  };

  if (loading || !draft) {
    return <p className="text-grey">Chargement de la fiche…</p>;
  }

  const isArchived = Boolean(draft.deleted_at);

  return (
    <div className="mx-auto min-w-0 max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Link href="/admin/users" className="text-sm text-primary hover:underline">
            ← Liste des utilisateurs
          </Link>
          <h2 className="mt-2 break-words text-xl font-bold text-midnight_text sm:text-2xl dark:text-white">
            {draft.full_name || draft.email}
          </h2>
          {isArchived && (
            <span className="mt-2 inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-medium">
              Archivé le {new Date(draft.deleted_at!).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {isArchived ? (
            <button
              type="button"
              onClick={handleRestore}
              className="w-full rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 sm:w-auto"
            >
              Restaurer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleArchive}
              className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 sm:w-auto"
            >
              Archiver
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-dark_border dark:bg-darklight">
        <h3 className="mb-4 font-semibold">Compte & publication</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Email
            <input className={inputClass} value={draft.email || ""} onChange={(e) => update("email", e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Rôle
            <select
              className={inputClass}
              value={draft.role || "member"}
              onChange={(e) => update("role", e.target.value)}>
              <option value="member">Membre</option>
              <option value="admin">Administrateur</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            Statut du membre
            <select
              className={inputClass}
              value={draft.statut_membre || ""}
              onChange={(e) => update("statut_membre", e.target.value)}
            >
              <option value="">— Sélectionner —</option>
              {MEMBER_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            Situation de cotisation
            <select
              className={inputClass}
              value={draft.situation_cotisations || ""}
              onChange={(e) => update("situation_cotisations", e.target.value)}
            >
              <option value="">— Sélectionner —</option>
              {COTISATION_SITUATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.visible_in_plaquette !== false}
              onChange={(e) => update("visible_in_plaquette", e.target.checked)}
              disabled={isArchived}
            />
            Visible dans la plaquette numérique
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-dark_border dark:bg-darklight">
        <h3 className="mb-4 font-semibold">Identité</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Nom complet
            <input className={inputClass} value={draft.full_name || ""} onChange={(e) => update("full_name", e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Promotion
            <input className={inputClass} value={draft.promo || ""} onChange={(e) => update("promo", e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Sexe
            <input className={inputClass} value={draft.sexe || ""} onChange={(e) => update("sexe", e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            N° matricule
            <input
              className={`${inputClass} bg-slate-50 dark:bg-dark_border/30`}
              value={draft.matricule || ""}
              readOnly
              aria-readonly
            />
          </label>
          <div className="md:col-span-2">
            <ImageFileInput
              label="Photo"
              value={draft.photo || ""}
              onChange={(url) => update("photo", url)}
              onError={(msg) => showError(msg)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-dark_border dark:bg-darklight">
        <h3 className="mb-4 font-semibold">Scolarité & contact</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Année d’entrée
            <input className={inputClass} value={draft.annee_entree || ""} onChange={(e) => update("annee_entree", e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Série / filière
            <input className={inputClass} value={draft.serie_filiere || ""} onChange={(e) => update("serie_filiere", e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Ville
            <input className={inputClass} value={draft.ville_residence || ""} onChange={(e) => update("ville_residence", e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Téléphone / contact
            <input className={inputClass} value={draft.phone || ""} onChange={(e) => update("phone", e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Profession
            <input className={inputClass} value={draft.profession || ""} onChange={(e) => update("profession", e.target.value)} />
          </label>
        </div>
      </section>

      <p className="text-xs text-grey">
        Complétion : {getProfileCompletion(draft)}% —{" "}
        {!isArchived && isPlaquetteEligible(draft)
          ? "Éligible plaquette"
          : `Non publié (min. ${PLAQUETTE_MIN_PROFILE_COMPLETION}% + visible)`}
      </p>
    </div>
  );
}
