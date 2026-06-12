/** Types et helpers profil — utilisables côté serveur ET client (sans "use client") */

export interface ProfileRecord {
  id?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  promo?: string;
  first_name?: string;
  last_name?: string;
  diplome?: string;
  serie?: string;
  ville?: string;
  pays?: string;
  document_url?: string;
  media_type?: string;
  created_at?: string;
  sexe?: string;
  date_naissance?: string;
  nationalite?: string;
  matricule?: string;
  photo?: string;
  annee_entree?: string;
  annee_sortie?: string;
  serie_filiere?: string;
  derniere_classe?: string;
  diplome_obtenu?: string;
  promotion_generation?: string;
  profession?: string;
  fonction_actuelle?: string;
  employeur_structure?: string;
  domaine_activite?: string;
  /** @deprecated Lecture legacy — utiliser `phone` */
  telephone_principal?: string;
  ville_residence?: string;
  pays_residence?: string;
  adresse_complete?: string;
  date_adhesion_amicale?: string;
  statut_membre?: string;
  situation_cotisations?: string;
  poste_amicale?: string;
  disponibilite_benevolat?: string;
  competences_particulieres?: string;
  contribution_possible?: string;
  besoins_attentes?: string;
  /** @deprecated Conservé en base ; la complétion du profil remplace l’onboarding. */
  onboarding_completed?: boolean;
  visible_in_plaquette?: boolean;
  deleted_at?: string | null;
  role?: string;
  profile_completion?: number;
  updated_at?: string;
}

/** Champs pris en compte pour le % — unique source de vérité dans toute l’application */
export const PROFILE_COMPLETION_FIELD_KEYS = [
  "first_name",
  "last_name",
  "sexe",
  "date_naissance",
  "nationalite",
  "photo",
  "annee_entree",
  "annee_sortie",
  "serie_filiere",
  "derniere_classe",
  "diplome_obtenu",
  "promotion_generation",
  "profession",
  "fonction_actuelle",
  "employeur_structure",
  "domaine_activite",
  "phone",
  "email",
  "ville_residence",
  "pays_residence",
  "adresse_complete",
  "date_adhesion_amicale",
  "statut_membre",
  "situation_cotisations",
  "poste_amicale",
  "disponibilite_benevolat",
  "competences_particulieres",
  "contribution_possible",
  "besoins_attentes",
] as const satisfies readonly (keyof ProfileRecord)[];

/**
 * Colonnes `users` à charger pour que le % soit identique au profil connecté (site public).
 * Ne pas réduire cette liste dans le back-office (batch « light »).
 */
export const USER_SELECT_FOR_PROFILE_COMPLETION =
  "id, email, full_name, first_name, last_name, sexe, date_naissance, nationalite, matricule, phone, promo, role, onboarding_completed, visible_in_plaquette, created_at, updated_at, deleted_at";

/** Colonnes des tables liées — toutes les clés utilisées par PROFILE_COMPLETION_FIELD_KEYS */
export const LINKED_SELECT_FOR_PROFILE_COMPLETION = {
  academic_profiles:
    "user_id,annee_entree,annee_sortie,serie_filiere,derniere_classe,diplome_obtenu,promotion_generation",
  professional_profiles:
    "user_id,profession,fonction_actuelle,employeur_structure,domaine_activite",
  locations:
    "user_id,telephone_principal,ville_residence,pays_residence,adresse_complete",
  amicale_memberships:
    "user_id,date_adhesion_amicale,statut_membre,situation_cotisations,poste_amicale,disponibilite_benevolat",
  observations: "user_id,competences_particulieres,contribution_possible,besoins_attentes",
  media: "user_id,photo",
} as const;

export const COTISATION_SITUATION_OPTIONS = ["A jour", "Non à jour"] as const;
export const MEMBER_STATUS_OPTIONS = ["Actif", "Sympathisant", "Honoraire"] as const;

/** % minimum pour apparaître dans la plaquette numérique */
export const PLAQUETTE_MIN_PROFILE_COMPLETION = 40;

export type ProfileCompletionFieldKey = (typeof PROFILE_COMPLETION_FIELD_KEYS)[number];

export const PROFILE_FIELD_LABELS: Record<ProfileCompletionFieldKey, string> = {
  first_name: "Prénom",
  last_name: "Nom",
  sexe: "Sexe",
  date_naissance: "Date de naissance",
  nationalite: "Nationalité",
  photo: "Photo de profil",
  annee_entree: "Année d’entrée",
  annee_sortie: "Année de sortie",
  serie_filiere: "Série / filière",
  derniere_classe: "Dernière classe",
  diplome_obtenu: "Diplôme obtenu",
  promotion_generation: "Promotion / génération",
  profession: "Profession",
  fonction_actuelle: "Fonction actuelle",
  employeur_structure: "Employeur / structure",
  domaine_activite: "Domaine d’activité",
  phone: "Téléphone / contact",
  email: "Email",
  ville_residence: "Ville de résidence",
  pays_residence: "Pays de résidence",
  adresse_complete: "Adresse complète",
  date_adhesion_amicale: "Date d’adhésion amicale",
  statut_membre: "Statut du membre",
  situation_cotisations: "Situation de cotisation",
  poste_amicale: "Poste à l’amicale",
  disponibilite_benevolat: "Disponibilité bénévolat",
  competences_particulieres: "Compétences particulières",
  contribution_possible: "Contribution possible",
  besoins_attentes: "Besoins / attentes",
};

/** Groupes pour l’affichage des sections du profil */
export const PROFILE_COMPLETION_STEP_GROUPS: (keyof ProfileRecord)[][] = [
  ["sexe", "date_naissance", "nationalite", "photo"],
  [
    "annee_entree",
    "annee_sortie",
    "serie_filiere",
    "derniere_classe",
    "diplome_obtenu",
    "promotion_generation",
  ],
  ["phone", "email", "ville_residence", "pays_residence", "adresse_complete"],
];

const isFilled = (value: unknown): boolean =>
  String(value ?? "").trim().length > 0;

/** Normalise les alias de champs (onboarding / tables liées) */
export const normalizeProfile = (profile: unknown = {}): ProfileRecord => {
  const p = (profile ?? {}) as ProfileRecord;
  const raw = profile as Record<string, unknown>;
  const full_name =
    p.full_name ||
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
    "";

  return {
    ...p,
    full_name,
    first_name: p.first_name || full_name.split(" ")[0] || "",
    last_name: p.last_name || full_name.split(" ").slice(1).join(" ") || "",
    email: p.email || (raw.user_email as string) || "",
    phone: p.phone || p.telephone_principal || "",
    serie_filiere: p.serie_filiere || p.serie || "",
    serie: p.serie || p.serie_filiere || "",
    diplome_obtenu: p.diplome_obtenu || p.diplome || "",
    diplome: p.diplome || p.diplome_obtenu || "",
    ville_residence: p.ville_residence || p.ville || "",
    ville: p.ville || p.ville_residence || "",
    pays_residence: p.pays_residence || p.pays || "",
    pays: p.pays || p.pays_residence || "",
    promotion_generation: p.promotion_generation || p.promo || "",
    promo: p.promo || p.promotion_generation || "",
  };
};

export const normalizeProfileForSave = (profile: ProfileRecord): ProfileRecord => {
  const normalized = normalizeProfile(profile);
  return {
    ...normalized,
    ...profile,
    serie_filiere: normalized.serie_filiere,
    diplome_obtenu: normalized.diplome_obtenu,
    ville_residence: normalized.ville_residence,
    pays_residence: normalized.pays_residence,
    promotion_generation: normalized.promotion_generation,
    phone: normalized.phone,
  };
};

/** Valeur d’un champ après normalisation (alias phone → telephone_principal, promo → promotion_generation, etc.) */
export const getProfileFieldValue = (
  profile: Partial<ProfileRecord>,
  key: ProfileCompletionFieldKey
): unknown => {
  const normalized = normalizeProfile(profile);
  return normalized[key];
};

const getFieldValue = (profile: ProfileRecord, key: keyof ProfileRecord): unknown =>
  getProfileFieldValue(profile, key as ProfileCompletionFieldKey);

/** % sur une liste de champs (même logique que le profil global) */
export const getFieldsCompletionPercent = (
  profile: Partial<ProfileRecord>,
  fieldKeys: (keyof ProfileRecord)[]
): number => {
  if (fieldKeys.length === 0) return 0;
  const normalized = normalizeProfile(profile);
  const filled = fieldKeys.filter((key) => isFilled(getFieldValue(normalized, key))).length;
  return Math.round((filled / fieldKeys.length) * 100);
};

/** Pourcentage de complétion du profil — identique partout (profil, admin, plaquette, bannière). */
export const getProfileCompletion = (profile: Partial<ProfileRecord>): number => {
  return getFieldsCompletionPercent(profile, [...PROFILE_COMPLETION_FIELD_KEYS]);
};

export const getMissingProfileFields = (
  profile: Partial<ProfileRecord>
): { key: ProfileCompletionFieldKey; label: string }[] => {
  const normalized = normalizeProfile(profile);
  return PROFILE_COMPLETION_FIELD_KEYS.filter(
    (key) => !isFilled(getFieldValue(normalized, key))
  ).map((key) => ({
    key,
    label: PROFILE_FIELD_LABELS[key] || String(key),
  }));
};

export const isPlaquetteEligible = (profile: Partial<ProfileRecord>): boolean => {
  const p = profile as ProfileRecord;
  if (p.deleted_at) return false;
  if (p.visible_in_plaquette === false) return false;
  return getProfileCompletion(profile) >= PLAQUETTE_MIN_PROFILE_COMPLETION;
};

/** Attache le % calculé au profil (à persister ou afficher) */
export const withProfileCompletion = <T extends Partial<ProfileRecord>>(profile: T): T & {
  profile_completion: number;
} => ({
  ...profile,
  profile_completion: getProfileCompletion(profile),
});
