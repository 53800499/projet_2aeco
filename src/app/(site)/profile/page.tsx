/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { AUTH_MESSAGES, formatAuthError } from "@/lib/auth-messages";
import ProfileCompletionCard from "@/components/Auth/ProfileCompletionCard";
import ProfileMissingFieldsAlert from "@/components/Auth/ProfileMissingFieldsAlert";
import { ProfileRecord } from "@/hooks/useSupabaseProfile";
import { useRouter } from "next/navigation";
import HeroSub from "@/components/SharedComponent/HeroSub";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";
import ImageFileInput from "@/components/Common/ImageFileInput";
import {
  COTISATION_SITUATION_OPTIONS,
  getMissingProfileFields,
  MEMBER_STATUS_OPTIONS,
  PROFILE_FIELD_LABELS,
  ProfileCompletionFieldKey,
} from "@/lib/profile";

const buildDraftFromProfile = (
  profile: ProfileRecord,
  email?: string | null
): ProfileRecord => ({
  ...profile,
  email: profile.email || email || "",
});

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, profileCompletion, loading, signOut, saveProfile } =
    useAuthProfile();
  const { showSuccess, showError } = useAuthFeedback();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const breadcrumbLinks = [
    { href: "/", text: "Accueil" },
    { href: "/profile", text: "Profil" },
  ];

  useEffect(() => {
    if (profile && !editing) {
      setDraft(buildDraftFromProfile(profile, user?.email));
    }
  }, [profile, user?.email, editing]);

  useEffect(() => {
    if (!editing) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editing]);

  const startEditing = useCallback(() => {
    if (profile) {
      setDraft(buildDraftFromProfile(profile, user?.email));
    }
    setEditing(true);
  }, [profile, user?.email]);

  const cancelEditing = useCallback(() => {
    if (profile) {
      setDraft(buildDraftFromProfile(profile, user?.email));
    }
    setEditing(false);
  }, [profile, user?.email]);

  const updateDraft = (field: keyof ProfileRecord, value: string) => {
    if (!editing) return;
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!draft || !user?.id || !editing) return;
    setSaving(true);
    try {
      await saveProfile({
        ...draft,
        id: user.id,
        email: draft.email || user.email || "",
      });
      setEditing(false);
      showSuccess(AUTH_MESSAGES.profileSaved);
    } catch (error: unknown) {
      showError(formatAuthError(error, AUTH_MESSAGES.profileSaveFailed));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-section px-6 py-16 text-midnight_text dark:bg-darkmode dark:text-white">
        <SpinnerScreen />
      </main>
    );
  }

  if (!user) {
    return (
      <>
        <HeroSub
          title="Mon Profil"
          description="Consultez et mettez à jour vos informations personnelles, votre parcours académique et professionnel, ainsi que vos coordonnées afin de rester connecté à la communauté des anciens élèves du CEG 2 Ouidah."
          breadcrumbLinks={breadcrumbLinks}
        />
        <main className="min-h-screen bg-section px-6 py-16 text-midnight_text dark:bg-darkmode dark:text-white">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white p-8 shadow-service dark:border-dark_border dark:bg-darkmode/90">
            <h1 className="text-3xl font-semibold">Connexion requise</h1>
            <p className="mt-3 text-grey dark:text-white/70">
              Veuillez vous connecter pour afficher votre profil.
            </p>
          </div>
        </main>
      </>
    );
  }

  const view = editing ? draft : profile;
  const missingKeys = new Set(
    getMissingProfileFields(view || {}).map((m) => m.key)
  );

  const fieldHighlight = (field: ProfileCompletionFieldKey) =>
    missingKeys.has(field)
      ? "ring-2 ring-amber-400 border-amber-400 dark:ring-amber-500"
      : "";

  const readOnlyBoxClass = (field: ProfileCompletionFieldKey) =>
    `rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-grey dark:border-dark_border dark:bg-dark_border/30 dark:text-white/80 min-h-[46px] ${fieldHighlight(field)}`;

  const inputClass = (field: ProfileCompletionFieldKey) =>
    `rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white w-full ${fieldHighlight(field)}`;

  const renderLabel = (field: ProfileCompletionFieldKey, label?: string) => (
    <span className="flex items-center gap-2">
      {label ?? PROFILE_FIELD_LABELS[field]}
      {missingKeys.has(field) && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
          À compléter
        </span>
      )}
    </span>
  );

  const renderField = (
    field: ProfileCompletionFieldKey | keyof ProfileRecord,
    type = "text",
    label?: string
  ) => {
    const key = field as keyof ProfileRecord;
    const value = view?.[key];
    const display = String(value ?? "").trim();

    return (
      <label
        id={`field-${key}`}
        className="grid gap-1 text-sm font-medium text-midnight_text dark:text-white scroll-mt-28"
      >
        {renderLabel(key as ProfileCompletionFieldKey, label)}
        {editing ? (
          <input
            type={type}
            value={String(draft?.[key] ?? "")}
            onChange={(e) => updateDraft(key, e.target.value)}
            disabled={saving}
            className={inputClass(key as ProfileCompletionFieldKey)}
          />
        ) : (
          <div className={readOnlyBoxClass(key as ProfileCompletionFieldKey)}>
            {display || "—"}
          </div>
        )}
      </label>
    );
  };

  const renderTextarea = (field: ProfileCompletionFieldKey, rows = 3) => {
    const value = view?.[field];
    const display = String(value ?? "").trim();

    return (
      <label
        id={`field-${field}`}
        className="grid gap-1 text-sm font-medium text-midnight_text dark:text-white scroll-mt-28 md:col-span-2"
      >
        {renderLabel(field)}
        {editing ? (
          <textarea
            rows={rows}
            value={String(draft?.[field] ?? "")}
            onChange={(e) => updateDraft(field, e.target.value)}
            disabled={saving}
            className={inputClass(field)}
          />
        ) : (
          <div
            className={`${readOnlyBoxClass(field)} whitespace-pre-wrap`}
          >
            {display || "—"}
          </div>
        )}
      </label>
    );
  };

  const renderSelectField = (
    field: "statut_membre" | "situation_cotisations",
    options: readonly string[]
  ) => {
    const value = view?.[field];
    const display = String(value ?? "").trim();

    return (
      <label
        id={`field-${field}`}
        className="grid gap-1 text-sm font-medium text-midnight_text dark:text-white scroll-mt-28"
      >
        {renderLabel(field)}
        {editing ? (
          <select
            value={String(draft?.[field] ?? "")}
            onChange={(e) => updateDraft(field, e.target.value)}
            disabled={saving}
            className={inputClass(field)}
          >
            <option value="">— Sélectionner —</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <div className={readOnlyBoxClass(field)}>{display || "—"}</div>
        )}
      </label>
    );
  };

  return (
    <>
      <HeroSub
        title="Mon Profil"
        description="Consultez et mettez à jour vos informations personnelles, votre parcours académique et professionnel, ainsi que vos coordonnées afin de rester connecté à la communauté des anciens élèves du CEG 2 Ouidah."
        breadcrumbLinks={breadcrumbLinks}
      />

      <main className="min-h-screen bg-section px-6 py-16 pb-28 text-midnight_text dark:bg-darkmode dark:text-white">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section
            className={`rounded-3xl border bg-white p-8 shadow-service dark:bg-darkmode/90 ${
              editing
                ? "border-primary/40 ring-2 ring-primary/20"
                : "border-border dark:border-dark_border"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm uppercase tracking-[0.25em] text-primary">
                    Mon profil
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      editing
                        ? "bg-primary/15 text-primary"
                        : "bg-slate-100 text-grey dark:bg-dark_border dark:text-white/60"
                    }`}
                  >
                    {editing ? "Mode édition" : "Mode consultation"}
                  </span>
                </div>
                <h1 className="mt-3 text-3xl font-semibold">
                  Bonjour {profile?.full_name || user.email}
                </h1>
                <p className="mt-3 text-grey dark:text-white/70">
                  {editing
                    ? "Modifiez vos informations puis cliquez sur Enregistrer pour les sauvegarder."
                    : "Consultez votre fiche. Cliquez sur Modifier pour mettre à jour un champ."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {editing ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </div>

            {profileCompletion < 100 && !editing && (
              <ProfileMissingFieldsAlert
                profile={profile}
                percent={profileCompletion}
                className="mt-6"
              />
            )}

            {editing && (
              <p className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-midnight_text dark:text-white/90">
                Les changements ne seront enregistrés qu’après avoir cliqué sur{" "}
                <strong>Enregistrer</strong>. Annuler restaure vos données actuelles.
              </p>
            )}

            <fieldset
              disabled={!editing}
              className="mt-8 space-y-6 disabled:opacity-100"
            >
              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Identité</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField("full_name", "text", "Nom complet")}
                  {renderField("first_name")}
                  {renderField("last_name")}
                  {renderField("sexe")}
                  {renderField("date_naissance", "date")}
                  {renderField("nationalite")}
                  {renderField("cip_ifu", "text", "CIP / IFU")}
                  {renderField("email", "email")}
                  {renderField("phone", "tel", "Téléphone")}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Scolarité</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField("promo", "text", "Promotion (inscription)")}
                  {renderField("annee_entree")}
                  {renderField("annee_sortie")}
                  {renderField("serie_filiere")}
                  {renderField("derniere_classe")}
                  {renderField("diplome_obtenu")}
                  {renderField("promotion_generation")}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Profession</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField("profession")}
                  {renderField("fonction_actuelle")}
                  {renderField("employeur_structure")}
                  {renderField("domaine_activite")}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Contact & réseaux</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField("telephone_principal", "tel")}
                  {renderField("telephone_secondaire", "tel")}
                  {renderField("ville_residence")}
                  {renderField("pays_residence")}
                  {renderTextarea("adresse_complete", 2)}
                  {renderField("email_secondaire", "email")}
                  {renderField("whatsapp", "tel")}
                  {renderField("facebook")}
                  {renderField("linkedin")}
                  {renderField("autres_reseaux")}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">
                  Vie amicale & observations
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField("date_adhesion_amicale", "date")}
                  {renderSelectField("statut_membre", MEMBER_STATUS_OPTIONS)}
                  {renderSelectField(
                    "situation_cotisations",
                    COTISATION_SITUATION_OPTIONS
                  )}
                  {renderField("poste_amicale")}
                  {renderField("disponibilite_benevolat")}
                  {renderTextarea("competences_particulieres", 3)}
                  {renderTextarea("contribution_possible", 3)}
                  {renderTextarea("besoins_attentes", 3)}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Photo</h2>
                <div className="mt-4">
                  {editing ? (
                    <ImageFileInput
                      label="Photo de profil"
                      value={draft?.photo || ""}
                      onChange={(url) => updateDraft("photo", url)}
                      onError={(msg) => showError(msg)}
                      disabled={saving}
                      hint="JPG, PNG ou WebP — max. 5 Mo. Cliquez sur Enregistrer après l’upload."
                    />
                  ) : (
                    <div className="flex justify-center">
                      <div className="h-36 w-36 overflow-hidden rounded-2xl border border-border bg-slate-100 dark:border-dark_border dark:bg-dark_border/40">
                        {view?.photo ? (
                          <img
                            src={view.photo}
                            alt="Photo de profil"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-grey dark:text-white/60">
                            Aucune photo
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </fieldset>
          </section>

          <aside className="w-full space-y-6">
            <ProfileCompletionCard
              percent={profileCompletion}
              profile={profile}
              hideButton={editing}
              onComplete={() => {
                startEditing();
                const first = getMissingProfileFields(profile || {})[0];
                if (first) {
                  document
                    .getElementById(`field-${first.key}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            />

            <section className="rounded-3xl border border-border bg-white p-6 shadow-service dark:border-dark_border dark:bg-darkmode">
              <h2 className="text-xl font-semibold text-midnight_text dark:text-white">
                Actions
              </h2>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  showSuccess(AUTH_MESSAGES.logoutSuccess);
                  router.push("/");
                }}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600"
              >
                Se déconnecter
              </button>
            </section>
          </aside>
        </div>

        {editing && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-dark_border dark:bg-darkmode/95">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-grey dark:text-white/70">
                <span className="font-semibold text-midnight_text dark:text-white">
                  Modifications en cours
                </span>{" "}
                — enregistrez pour les appliquer
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
