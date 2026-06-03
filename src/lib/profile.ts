/** Types et helpers profil — utilisables côté serveur ET client (sans "use client") */

export interface ProfileRecord {
  id?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  promo?: string;
  first_name?: string;
  last_name?: string;
  email_secondaire?: string;
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
  cip_ifu?: string;
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
  telephone_principal?: string;
  telephone_secondaire?: string;
  ville_residence?: string;
  pays_residence?: string;
  adresse_complete?: string;
  date_adhesion_amicale?: string;
  statut_membre?: string;
  situation_cotisations?: string;
  poste_amicale?: string;
  disponibilite_benevolat?: string;
  whatsapp?: string;
  facebook?: string;
  linkedin?: string;
  autres_reseaux?: string;
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
  "cip_ifu",
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
  "telephone_principal",
  "telephone_secondaire",
  "email",
  "ville_residence",
  "pays_residence",
  "adresse_complete",
  "date_adhesion_amicale",
  "statut_membre",
  "situation_cotisations",
  "poste_amicale",
  "disponibilite_benevolat",
  "whatsapp",
  "facebook",
  "linkedin",
  "autres_reseaux",
  "competences_particulieres",
  "contribution_possible",
  "besoins_attentes",
] as const satisfies readonly (keyof ProfileRecord)[];

export const COTISATION_SITUATION_OPTIONS = ["Ajout", "Non ajout"] as const;
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
  cip_ifu: "CIP / IFU",
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
  telephone_principal: "Téléphone principal",
  telephone_secondaire: "Téléphone secondaire",
  email: "Email",
  ville_residence: "Ville de résidence",
  pays_residence: "Pays de résidence",
  adresse_complete: "Adresse complète",
  date_adhesion_amicale: "Date d’adhésion amicale",
  statut_membre: "Statut du membre",
  situation_cotisations: "Situation de cotisation",
  poste_amicale: "Poste à l’amicale",
  disponibilite_benevolat: "Disponibilité bénévolat",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  autres_reseaux: "Autres réseaux",
  competences_particulieres: "Compétences particulières",
  contribution_possible: "Contribution possible",
  besoins_attentes: "Besoins / attentes",
};

/** Groupes pour l’affichage des sections du profil */
export const PROFILE_COMPLETION_STEP_GROUPS: (keyof ProfileRecord)[][] = [
  ["sexe", "date_naissance", "nationalite", "cip_ifu", "photo"],
  [
    "annee_entree",
    "annee_sortie",
    "serie_filiere",
    "derniere_classe",
    "diplome_obtenu",
    "promotion_generation",
  ],
  [
    "telephone_principal",
    "telephone_secondaire",
    "email",
    "ville_residence",
    "pays_residence",
    "whatsapp",
    "email_secondaire",
  ],
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
    telephone_principal: p.telephone_principal || p.phone || p.whatsapp || "",
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
    whatsapp: p.whatsapp || p.telephone_principal || p.phone || "",
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
    telephone_principal: normalized.telephone_principal,
    whatsapp: normalized.whatsapp,
  };
};

const getFieldValue = (profile: ProfileRecord, key: keyof ProfileRecord): unknown => {
  if (key === "first_name" || key === "last_name") {
    const n = normalizeProfile(profile);
    return key === "first_name" ? n.first_name : n.last_name;
  }
  return profile[key];
};

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
