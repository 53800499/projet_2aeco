/** Messages utilisateur en français pour l'authentification et le profil */

const AUTH_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials":
    "Email ou mot de passe incorrect. Vérifiez vos identifiants.",
  "Email not confirmed":
    "Votre email n’est pas encore confirmé. Désactivez la confirmation email dans Supabase (Auth → Providers → Email) ou confirmez votre boîte mail.",
  "User already registered":
    "Un compte existe déjà avec cet email. Connectez-vous ou utilisez un autre email.",
  "Password should be at least 6 characters":
    "Le mot de passe doit contenir au moins 6 caractères.",
  "Signup requires a valid password":
    "Veuillez saisir un mot de passe valide.",
  "Unable to validate email address: invalid format":
    "L’adresse email n’est pas valide.",
  "Email rate limit exceeded":
    "Trop de tentatives. Réessayez dans quelques minutes.",
};

export const formatAuthError = (
  error: unknown,
  fallback = "Une erreur est survenue. Réessayez."
): string => {
  if (!error) return fallback;

  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : (error as { message?: string })?.message || fallback;

  for (const [key, value] of Object.entries(AUTH_ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return message || fallback;
};

export const AUTH_MESSAGES = {
  registerSuccess:
    "Inscription réussie ! Bienvenue dans le répertoire des anciens élèves.",
  loginSuccess: "Connexion réussie. Bon retour parmi nous !",
  loginFailed: "Connexion impossible. Vérifiez votre email et mot de passe.",
  profileSaved: "Profil enregistré avec succès.",
  profileSaveFailed: "Impossible d’enregistrer votre profil.",
  onboardingStepSaved: "Étape enregistrée avec succès.",
  onboardingComplete:
    "Profil complété ! Vous êtes désormais dans le répertoire.",
  logoutSuccess: "Vous êtes déconnecté.",
  sessionRequired: "Connectez-vous pour continuer.",
  configMissing: "Service indisponible. Configuration Supabase manquante.",
  imageUploaded:
    "Image envoyée avec succès. Enregistrez votre profil pour la conserver.",
} as const;
