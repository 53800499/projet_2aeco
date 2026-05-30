"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ProfileCompletionCard from "@/components/Auth/ProfileCompletionCard";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useAuthModal } from "@/app/context/AuthModalContext";
import { getProfileCompletion } from "@/hooks/useSupabaseProfile";
import Loader from "@/components/Common/Loader";

const stepLabels = [
  { key: "identity", title: "STEP 1 — Identité" },
  { key: "scholarship", title: "STEP 2 — Scolarité" },
  { key: "contact", title: "STEP 3 — Contact" }
];

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-section px-6 py-16 text-midnight_text dark:bg-darkmode dark:text-white">
          <Loader />
        </main>
      }>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    profile: profileFromContext,
    refreshSession,
    saveProfile
  } = useAuthProfile();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [formProfile, setFormProfile] = useState({
    sexe: "",
    date_naissance: "",
    nationalite: "",
    photo: "",
    annee_entree: "",
    derniere_classe: "",
    serie: "",
    diplome: "",
    ville: "",
    pays: "",
    whatsapp: "",
    email_secondaire: ""
  });

  const currentStep = useMemo(() => stepLabels[step] ?? stepLabels[0], [step]);

  useEffect(() => {
    const desiredStep = searchParams.get("step") || "identity";
    const index = stepLabels.findIndex((item) => item.key === desiredStep);
    setStep(index >= 0 ? index : 0);
  }, [searchParams]);

  const { openSignIn } = useAuthModal();

  useEffect(() => {
    const init = async () => {
      await refreshSession();
      if (!user) {
        openSignIn();
        return;
      }

      setUserId(user.id);
      if (profileFromContext) {
        setFormProfile((prev) => ({ ...prev, ...profileFromContext }));
        setCompletion(getProfileCompletion(profileFromContext));
      }

      setLoading(false);
    };

    init();
  }, [profileFromContext, refreshSession, openSignIn, user]);

  const handleFieldChange = (field: string, value: string) => {
    setFormProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId) {
      toast.error("Vous devez être connecté pour enregistrer votre profil.");
      return;
    }

    setSaving(true);

    try {
      const nextProfile = {
        id: userId,
        ...formProfile,
        onboarding_completed: step === 2
      };

      await saveProfile(nextProfile);
      setCompletion(getProfileCompletion(nextProfile));

      if (step < 2) {
        const nextKey = stepLabels[step + 1].key;
        router.push(`/onboarding?step=${nextKey}`);
        setStep((prev) => prev + 1);
        toast.success("Étape enregistrée avec succès.");
        return;
      }

      toast.success(
        "Profil créé avec succès. Vous êtes désormais dans le répertoire."
      );
    } catch (error: any) {
      toast.error(error?.message || "Impossible d’enregistrer votre profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-section px-6 py-16 text-midnight_text dark:bg-darkmode dark:text-white">
        <Loader />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-section px-6 py-16 text-midnight_text dark:bg-darkmode dark:text-white">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-border bg-white p-8 shadow-service dark:border-dark_border dark:bg-darkmode/90">
          <p className="text-sm uppercase tracking-[0.25em] text-primary">
            ONBOARDING
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Complétez votre profil en 3 écrans
          </h1>
          <p className="mt-3 max-w-2xl text-grey dark:text-white/70">
            Après votre inscription, nous vous guidons vers un parcours simple
            pour créer votre profil au sein du répertoire des anciens élèves.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-dark_border/60">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              {currentStep.title}
            </span>
            <span className="text-sm text-grey dark:text-white/70">
              Étape {step + 1} sur 3
            </span>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {step === 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Sexe
                  <input
                    value={formProfile.sexe}
                    onChange={(event) =>
                      handleFieldChange("sexe", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="Masculin / Féminin"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Date de naissance
                  <input
                    type="date"
                    value={formProfile.date_naissance}
                    onChange={(event) =>
                      handleFieldChange("date_naissance", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Nationalité
                  <input
                    value={formProfile.nationalite}
                    onChange={(event) =>
                      handleFieldChange("nationalite", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="Béninoise"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Photo
                  <input
                    value={formProfile.photo}
                    onChange={(event) =>
                      handleFieldChange("photo", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="URL de la photo"
                  />
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Année d’entrée
                  <input
                    value={formProfile.annee_entree}
                    onChange={(event) =>
                      handleFieldChange("annee_entree", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="2018"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Dernière classe
                  <input
                    value={formProfile.derniere_classe}
                    onChange={(event) =>
                      handleFieldChange("derniere_classe", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="Terminale"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Série
                  <input
                    value={formProfile.serie}
                    onChange={(event) =>
                      handleFieldChange("serie", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="C"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Diplôme
                  <input
                    value={formProfile.diplome}
                    onChange={(event) =>
                      handleFieldChange("diplome", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="BAC"
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Ville
                  <input
                    value={formProfile.ville}
                    onChange={(event) =>
                      handleFieldChange("ville", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="Ouidah"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Pays
                  <input
                    value={formProfile.pays}
                    onChange={(event) =>
                      handleFieldChange("pays", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="Bénin"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  WhatsApp
                  <input
                    value={formProfile.whatsapp}
                    onChange={(event) =>
                      handleFieldChange("whatsapp", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="+229 ..."
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Email secondaire
                  <input
                    type="email"
                    value={formProfile.email_secondaire}
                    onChange={(event) =>
                      handleFieldChange("email_secondaire", event.target.value)
                    }
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-dark_border dark:bg-transparent dark:text-white"
                    placeholder="secondaire@email.com"
                  />
                </label>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (step > 0) {
                    const previousKey = stepLabels[step - 1].key;
                    router.push(`/onboarding?step=${previousKey}`);
                    setStep((prev) => prev - 1);
                  }
                }}
                className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-midnight_text hover:bg-slate-100 dark:border-dark_border dark:text-white dark:hover:bg-dark_border/70">
                Précédent
              </button>

              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                {saving ?
                  "Enregistrement..."
                : step === 2 ?
                  "Terminer"
                : "Continuer"}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <ProfileCompletionCard
            percent={completion}
            onComplete={() => router.push("/onboarding?step=identity")}
          />

          <section className="rounded-3xl border border-border bg-white p-6 shadow-service dark:border-dark_border dark:bg-darkmode">
            <h2 className="text-xl font-semibold text-midnight_text dark:text-white">
              Résumé
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-grey dark:text-white/70">
              <li>✔ Profil créé dans le répertoire</li>
              <li>✔ Profil complété au fil des 3 écrans</li>
              <li>
                ✔ Redirection directe vers la page d’onboarding après
                inscription
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
