import {
  ProfileRecord,
  getProfileCompletion,
  getFieldsCompletionPercent,
  PROFILE_COMPLETION_STEP_GROUPS,
  normalizeProfile,
} from "@/lib/profile";

export const ONBOARDING_STEPS = [
  { key: "identity", title: "Identité", shortTitle: "Étape 1" },
  { key: "scholarship", title: "Scolarité", shortTitle: "Étape 2" },
  { key: "contact", title: "Contact", shortTitle: "Étape 3" },
] as const;

export type OnboardingField =
  | "sexe"
  | "date_naissance"
  | "nationalite"
  | "photo"
  | "annee_entree"
  | "derniere_classe"
  | "serie"
  | "diplome"
  | "ville"
  | "pays"
  | "whatsapp"
  | "email_secondaire";

export type OnboardingFormData = Partial<Record<OnboardingField, string>> & ProfileRecord;

/**
 * Progression onboarding : le % global = getProfileCompletion (même que profil / admin).
 * Les % par étape sont des sous-scores sur les mêmes règles de remplissage.
 */
export const getOnboardingProgress = (profile: OnboardingFormData) => {
  const normalized = normalizeProfile(profile);
  const globalPercent = getProfileCompletion(normalized);

  const stepPercents = PROFILE_COMPLETION_STEP_GROUPS.map((keys) =>
    getFieldsCompletionPercent(normalized, keys)
  );

  return {
    stepPercents,
    globalPercent,
    completedSteps: stepPercents.map((p) => p >= 50),
    recommendedStep: getFirstIncompleteStep(stepPercents),
  };
};

const isFilled = (value: unknown) => String(value ?? "").trim().length > 0;

const getFirstIncompleteStep = (stepPercents: number[]): number => {
  const index = stepPercents.findIndex((p) => p < 40);
  return index >= 0 ? index : ONBOARDING_STEPS.length - 1;
};

/** Terminer l’onboarding : dernière étape + contact minimal + 40 % du profil global */
export const shouldMarkOnboardingComplete = (
  profile: OnboardingFormData,
  currentStepIndex: number
): boolean => {
  if (currentStepIndex !== ONBOARDING_STEPS.length - 1) return false;

  const normalized = normalizeProfile(profile);
  const contactOk =
    isFilled(normalized.ville_residence || normalized.ville) ||
    isFilled(normalized.whatsapp || normalized.telephone_principal);

  return contactOk && getProfileCompletion(normalized) >= 40;
};

export const resolveOnboardingStepFromUrl = (stepKey: string | null): number => {
  if (!stepKey) return 0;
  const index = ONBOARDING_STEPS.findIndex((s) => s.key === stepKey);
  return index >= 0 ? index : 0;
};

export const isProfileOnboardingDone = (profile: ProfileRecord | null): boolean =>
  Boolean(profile?.onboarding_completed);
