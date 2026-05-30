/** @format */

"use client";

import { useEffect, useState } from "react";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import ProfileCompletionCard from "@/components/Auth/ProfileCompletionCard";
import { ProfileRecord } from "@/hooks/useSupabaseProfile";
import { useRouter } from "next/navigation";
import HeroSub from "@/components/SharedComponent/HeroSub";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, profileCompletion, loading, signOut, saveProfile } =
    useAuthProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const breadcrumbLinks = [
    { href: "/", text: "Accueil" },
    { href: "/profile", text: "Profil" }
  ];

  useEffect(() => {
    if (profile) {
      setDraft({ ...profile, email: profile.email || user?.email || "" });
    }
  }, [profile, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-section px-6 py-16 text-midnight_text dark:bg-darkmode dark:text-white">
        Chargement du profil…
      </main>
    );
  }

  if (!user) {
      return (
        <>
          <HeroSub
            title="Actualités & Vie de la communauté"
            description="Retrouvez les nouvelles de l’amicale, les événements, les témoignages d’anciens élèves, les parcours inspirants et les souvenirs qui continuent de faire vivre la communauté du CEG 2 Ouidah."
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

  const updateDraft = (field: keyof ProfileRecord, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!draft || !user?.id) return;
    setSaving(true);
    try {
      await saveProfile({
        ...draft,
        id: user.id,
        email: draft.email || user.email || ""
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossible d’uploader l’image.");
      }

      updateDraft("photo", data.url);
    } catch (error: any) {
      alert(error?.message || "Impossible d’uploader l’image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const renderField = (
    label: string,
    value: string | undefined,
    field: keyof ProfileRecord,
    type = "text"
  ) => (
    <label className="grid gap-1 text-sm font-medium text-midnight_text dark:text-white">
      {label}
      {editing ?
        <input
          type={type}
          value={String(draft?.[field] ?? "")}
          onChange={(event) => updateDraft(field, event.target.value)}
          className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
        />
      : <span className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-grey dark:border-dark_border dark:bg-dark_border/30 dark:text-white/80">
          {value || "—"}
        </span>
      }
    </label>
  );

  return (
    <>
      <HeroSub
        title="Actualités & Vie de la communauté"
        description="Retrouvez les nouvelles de l’amicale, les événements, les témoignages d’anciens élèves, les parcours inspirants et les souvenirs qui continuent de faire vivre la communauté du CEG 2 Ouidah."
        breadcrumbLinks={breadcrumbLinks}
      />

      <main className="min-h-screen bg-section px-6 py-16 text-midnight_text dark:bg-darkmode dark:text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-3xl border border-border bg-white p-8 shadow-service dark:border-dark_border dark:bg-darkmode/90">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-primary">
                  Mon profil
                </p>
                <h1 className="mt-3 text-3xl font-semibold">
                  Bonjour {profile?.full_name || user.email}
                </h1>
                <p className="mt-3 text-grey dark:text-white/70">
                  Gérez votre identité, votre parcours scolaire, votre vie
                  professionnelle et vos contacts depuis un seul espace.
                </p>
              </div>
              {editing ?
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold">
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              : <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
                  Modifier
                </button>
              }
            </div>

            <div className="mt-8 space-y-6">
              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Identité</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField("Nom complet", draft?.full_name, "full_name")}
                  {renderField("Prénom", draft?.first_name, "first_name")}
                  {renderField("Nom", draft?.last_name, "last_name")}
                  {renderField("Sexe", draft?.sexe, "sexe")}
                  {renderField(
                    "Date de naissance",
                    draft?.date_naissance,
                    "date_naissance",
                    "date"
                  )}
                  {renderField(
                    "Nationalité",
                    draft?.nationalite,
                    "nationalite"
                  )}
                  {renderField("Email", draft?.email, "email", "email")}
                  {renderField("Téléphone", draft?.phone, "phone")}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Scolarité</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField(
                    "Année d’entrée",
                    draft?.annee_entree,
                    "annee_entree"
                  )}
                  {renderField(
                    "Année de sortie",
                    draft?.annee_sortie,
                    "annee_sortie"
                  )}
                  {renderField(
                    "Série / Filière",
                    draft?.serie_filiere,
                    "serie_filiere"
                  )}
                  {renderField(
                    "Dernière classe",
                    draft?.derniere_classe,
                    "derniere_classe"
                  )}
                  {renderField(
                    "Diplôme obtenu",
                    draft?.diplome_obtenu,
                    "diplome_obtenu"
                  )}
                  {renderField(
                    "Promotion / génération",
                    draft?.promotion_generation,
                    "promotion_generation"
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Profession</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField("Profession", draft?.profession, "profession")}
                  {renderField(
                    "Fonction actuelle",
                    draft?.fonction_actuelle,
                    "fonction_actuelle"
                  )}
                  {renderField(
                    "Employeur / structure",
                    draft?.employeur_structure,
                    "employeur_structure"
                  )}
                  {renderField(
                    "Domaine d’activité",
                    draft?.domaine_activite,
                    "domaine_activite"
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Contact & réseaux</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField(
                    "Téléphone principal",
                    draft?.telephone_principal,
                    "telephone_principal"
                  )}
                  {renderField(
                    "Téléphone secondaire",
                    draft?.telephone_secondaire,
                    "telephone_secondaire"
                  )}
                  {renderField(
                    "Ville de résidence",
                    draft?.ville_residence,
                    "ville_residence"
                  )}
                  {renderField(
                    "Pays de résidence",
                    draft?.pays_residence,
                    "pays_residence"
                  )}
                  {renderField(
                    "Adresse complète",
                    draft?.adresse_complete,
                    "adresse_complete"
                  )}
                  {renderField(
                    "Email secondaire",
                    draft?.email_secondaire,
                    "email_secondaire",
                    "email"
                  )}
                  {renderField("WhatsApp", draft?.whatsapp, "whatsapp")}
                  {renderField("Facebook", draft?.facebook, "facebook")}
                  {renderField("LinkedIn", draft?.linkedin, "linkedin")}
                  {renderField(
                    "Autres réseaux",
                    draft?.autres_reseaux,
                    "autres_reseaux"
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">
                  Vie amicale & observations
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderField(
                    "Date d’adhésion",
                    draft?.date_adhesion_amicale,
                    "date_adhesion_amicale",
                    "date"
                  )}
                  {renderField(
                    "Statut membre",
                    draft?.statut_membre,
                    "statut_membre"
                  )}
                  {renderField(
                    "Situation cotisations",
                    draft?.situation_cotisations,
                    "situation_cotisations"
                  )}
                  {renderField(
                    "Poste amicale",
                    draft?.poste_amicale,
                    "poste_amicale"
                  )}
                  {renderField(
                    "Disponibilité bénévolat",
                    draft?.disponibilite_benevolat,
                    "disponibilite_benevolat"
                  )}
                  {renderField(
                    "Compétences particulières",
                    draft?.competences_particulieres,
                    "competences_particulieres"
                  )}
                  {renderField(
                    "Contribution possible",
                    draft?.contribution_possible,
                    "contribution_possible"
                  )}
                  {renderField(
                    "Besoins / attentes",
                    draft?.besoins_attentes,
                    "besoins_attentes"
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-border p-5 dark:border-dark_border">
                <h2 className="text-lg font-semibold">Photo</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px] items-start">
                  <label className="grid gap-2 text-sm font-medium text-midnight_text dark:text-white">
                    Télécharger une photo Cloudinary
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingImage}
                      className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    />
                    <span className="text-xs text-grey dark:text-white/70">
                      L’image sera envoyée vers Cloudinary et l’URL sera
                      enregistrée dans votre profil.
                    </span>
                  </label>

                  <div className="rounded-2xl border border-border p-3 text-center dark:border-dark_border">
                    {draft?.photo ?
                      <img
                        src={draft.photo}
                        alt="Photo de profil"
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    : <div className="flex h-32 items-center justify-center rounded-xl bg-slate-100 text-sm text-grey dark:bg-dark_border/40 dark:text-white/70">
                        Aucune photo
                      </div>
                    }
                  </div>
                </div>
              </article>
            </div>
          </section>

          <aside className="space-y-6">
            <ProfileCompletionCard
              percent={profileCompletion}
              onComplete={() => router.push("/onboarding?step=identity")}
            />

            <section className="rounded-3xl border border-border bg-white p-6 shadow-service dark:border-dark_border dark:bg-darkmode">
              <h2 className="text-xl font-semibold text-midnight_text dark:text-white">
                Actions
              </h2>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600">
                Se déconnecter
              </button>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
