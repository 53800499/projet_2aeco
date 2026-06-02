"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OnboardingWizard from "@/components/Onboarding/OnboardingWizard";
import ImageFileInput from "@/components/Common/ImageFileInput";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { AUTH_MESSAGES, formatAuthError } from "@/lib/auth-messages";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useAuthModal } from "@/app/context/AuthModalContext";
import {
  getOnboardingProgress,
  isProfileOnboardingDone,
  ONBOARDING_STEPS,
  resolveOnboardingStepFromUrl,
  shouldMarkOnboardingComplete,
} from "@/lib/onboarding";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark_border dark:bg-darkmode dark:text-white";

const initialForm = {
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
  email_secondaire: "",
};

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <SpinnerScreen />
        </div>
      }>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile: profileFromContext, refreshSession, saveProfile } =
    useAuthProfile();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [formProfile, setFormProfile] = useState(initialForm);

  const onboardingProgress = useMemo(
    () => getOnboardingProgress(formProfile),
    [formProfile]
  );

  const { openSignIn } = useAuthModal();
  const { showSuccess, showError } = useAuthFeedback();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const stepKey = searchParams.get("step");
    if (stepKey) setStep(resolveOnboardingStepFromUrl(stepKey));
  }, [searchParams]);

  useEffect(() => {
    if (hasInitialized.current) return;

    const init = async () => {
      const currentUser = await refreshSession();
      if (!currentUser) {
        openSignIn();
        setLoading(false);
        return;
      }

      if (isProfileOnboardingDone(profileFromContext)) {
        router.replace("/profile");
        hasInitialized.current = true;
        setLoading(false);
        return;
      }

      setUserId(currentUser.id);
      const merged = {
        ...initialForm,
        ...(profileFromContext || {}),
        serie: profileFromContext?.serie_filiere || profileFromContext?.serie || "",
        diplome: profileFromContext?.diplome_obtenu || profileFromContext?.diplome || "",
        ville: profileFromContext?.ville_residence || profileFromContext?.ville || "",
        pays: profileFromContext?.pays_residence || profileFromContext?.pays || "",
      };
      setFormProfile(merged);

      const stepKey = searchParams.get("step");
      const startStep = stepKey
        ? resolveOnboardingStepFromUrl(stepKey)
        : getOnboardingProgress(merged).recommendedStep;

      setStep(startStep);
      if (!stepKey) {
        router.replace(`/onboarding?step=${ONBOARDING_STEPS[startStep].key}`);
      }

      hasInitialized.current = true;
      setLoading(false);
    };

    void init();
  }, [profileFromContext, refreshSession, openSignIn, router, searchParams]);

  const handleFieldChange = (field: string, value: string) => {
    setFormProfile((prev) => ({ ...prev, [field]: value }));
  };

  const goToStep = (index: number) => {
    const key = ONBOARDING_STEPS[index]?.key ?? "identity";
    router.push(`/onboarding?step=${key}`);
    setStep(index);
  };

  const persistStep = async (markComplete: boolean) => {
    if (!userId) throw new Error(AUTH_MESSAGES.sessionRequired);

    await saveProfile({
      id: userId,
      email: profileFromContext?.email || user?.email || "",
      ...formProfile,
      serie_filiere: formProfile.serie,
      diplome_obtenu: formProfile.diplome,
      ville_residence: formProfile.ville,
      pays_residence: formProfile.pays,
      onboarding_completed: markComplete,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      showError(AUTH_MESSAGES.sessionRequired);
      openSignIn();
      return;
    }

    setSaving(true);
    try {
      const markComplete = shouldMarkOnboardingComplete(formProfile, step);
      await persistStep(markComplete);

      if (markComplete) {
        showSuccess(AUTH_MESSAGES.onboardingComplete);
        router.push("/profile");
        return;
      }

      if (step < ONBOARDING_STEPS.length - 1) {
        goToStep(step + 1);
        showSuccess(AUTH_MESSAGES.onboardingStepSaved);
        return;
      }

      showError(
        "Indiquez au minimum votre ville ou votre numéro WhatsApp pour terminer."
      );
    } catch (error: unknown) {
      showError(formatAuthError(error, AUTH_MESSAGES.profileSaveFailed));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SpinnerScreen />
      </div>
    );
  }

  return (
    <OnboardingWizard
      step={step}
      globalPercent={onboardingProgress.globalPercent}
      stepPercents={onboardingProgress.stepPercents}
      completedSteps={onboardingProgress.completedSteps}
      saving={saving}
      onSubmit={handleSubmit}
      onBack={() => goToStep(Math.max(0, step - 1))}
      onSkip={() => goToStep(step + 1)}>
      {step === 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Sexe
            <select
              value={formProfile.sexe}
              onChange={(e) => handleFieldChange("sexe", e.target.value)}
              className={inputClass}>
              <option value="">Choisir…</option>
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Date de naissance
            <input
              type="date"
              value={formProfile.date_naissance}
              onChange={(e) => handleFieldChange("date_naissance", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Nationalité
            <input
              value={formProfile.nationalite}
              onChange={(e) => handleFieldChange("nationalite", e.target.value)}
              className={inputClass}
              placeholder="Ex. Béninoise"
            />
          </label>
          <div className="sm:col-span-2">
            <ImageFileInput
              label="Photo de profil"
              value={formProfile.photo}
              onChange={(url) => {
                handleFieldChange("photo", url);
                if (url) showSuccess(AUTH_MESSAGES.imageUploaded);
              }}
              onError={(msg) => showError(msg)}
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Année d’entrée
            <input
              value={formProfile.annee_entree}
              onChange={(e) => handleFieldChange("annee_entree", e.target.value)}
              className={inputClass}
              placeholder="2018"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Dernière classe
            <input
              value={formProfile.derniere_classe}
              onChange={(e) => handleFieldChange("derniere_classe", e.target.value)}
              className={inputClass}
              placeholder="Terminale"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Série
            <input
              value={formProfile.serie}
              onChange={(e) => handleFieldChange("serie", e.target.value)}
              className={inputClass}
              placeholder="C, D…"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Diplôme obtenu
            <input
              value={formProfile.diplome}
              onChange={(e) => handleFieldChange("diplome", e.target.value)}
              className={inputClass}
              placeholder="BAC"
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Ville de résidence
            <input
              value={formProfile.ville}
              onChange={(e) => handleFieldChange("ville", e.target.value)}
              className={inputClass}
              placeholder="Ouidah"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Pays
            <input
              value={formProfile.pays}
              onChange={(e) => handleFieldChange("pays", e.target.value)}
              className={inputClass}
              placeholder="Bénin"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            WhatsApp
            <input
              type="tel"
              value={formProfile.whatsapp}
              onChange={(e) => handleFieldChange("whatsapp", e.target.value)}
              className={inputClass}
              placeholder="+229 …"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Email secondaire
            <input
              type="email"
              value={formProfile.email_secondaire}
              onChange={(e) => handleFieldChange("email_secondaire", e.target.value)}
              className={inputClass}
              placeholder="optionnel"
            />
          </label>
          <p className="text-xs text-grey dark:text-white/50 sm:col-span-2">
            * Au moins la ville ou le WhatsApp est requis pour finaliser votre inscription.
          </p>
        </div>
      )}
    </OnboardingWizard>
  );
}
