export interface PlaquetteMember {
  id: string;
  profile_completion?: number;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  promo: string | null;
  phone: string | null;
  sexe: string | null;
  serie_filiere: string | null;
  derniere_classe: string | null;
  diplome_obtenu: string | null;
  annee_entree: string | null;
  annee_sortie: string | null;
  profession: string | null;
  fonction_actuelle: string | null;
  employeur_structure: string | null;
  ville_residence: string | null;
  pays_residence: string | null;
  whatsapp: string | null;
  linkedin: string | null;
  photo: string | null;
}

export const getMemberDisplayName = (m: PlaquetteMember) =>
  m.full_name?.trim() ||
  [m.first_name, m.last_name].filter(Boolean).join(" ") ||
  "Membre";

export const groupMembersByPromo = (members: PlaquetteMember[]) => {
  const groups: Record<string, PlaquetteMember[]> = {};
  members.forEach((m) => {
    const key = m.promo?.trim() || "Promotion non renseignée";
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, "fr"));
};
