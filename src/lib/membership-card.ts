import { normalizeProfile, ProfileRecord } from "@/lib/profile";

/** Champs requis pour afficher et télécharger la carte de membre */
export const MEMBERSHIP_CARD_REQUIRED_FIELDS = [
  "first_name",
  "last_name",
  "photo",
] as const satisfies readonly (keyof ProfileRecord)[];

export type MembershipCardFieldKey = (typeof MEMBERSHIP_CARD_REQUIRED_FIELDS)[number];

export const MEMBERSHIP_CARD_FIELD_LABELS: Record<MembershipCardFieldKey, string> = {
  first_name: "Prénom",
  last_name: "Nom",
  photo: "Photo de profil",
};

const isFilled = (value: unknown): boolean =>
  String(value ?? "").trim().length > 0;

export const getMembershipCardDisplayName = (profile: Partial<ProfileRecord>): string => {
  const p = normalizeProfile(profile);
  return (
    p.full_name?.trim() ||
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
    "Membre"
  );
};

export const formatMembershipRegistrationDate = (createdAt?: string | null): string => {
  if (!createdAt) return "—";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const getMissingMembershipCardFields = (
  profile: Partial<ProfileRecord>
): { key: MembershipCardFieldKey; label: string }[] => {
  const normalized = normalizeProfile(profile);
  return MEMBERSHIP_CARD_REQUIRED_FIELDS.filter(
    (key) => !isFilled(normalized[key])
  ).map((key) => ({
    key,
    label: MEMBERSHIP_CARD_FIELD_LABELS[key],
  }));
};

/** Carte disponible : matricule attribué + données carte complètes */
export const isMembershipCardEligible = (profile: Partial<ProfileRecord>): boolean => {
  const normalized = normalizeProfile(profile);
  if (!isFilled(normalized.matricule)) return false;
  return getMissingMembershipCardFields(normalized).length === 0;
};
