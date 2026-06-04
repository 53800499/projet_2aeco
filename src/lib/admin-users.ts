import {
  getProfileCompletion,
  isPlaquetteEligible,
  normalizeProfile,
  PLAQUETTE_MIN_PROFILE_COMPLETION,
  ProfileRecord,
  withProfileCompletion,
} from "@/lib/profile";
import { PlaquetteMember } from "@/lib/plaquette";
import { SupabaseClient } from "@supabase/supabase-js";

export type UserListStatus = "active" | "deleted" | "all";

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  promo: string | null;
  role: string;
  onboarding_completed: boolean;
  visible_in_plaquette: boolean;
  profile_completion: number;
  photo: string | null;
  ville_residence: string | null;
  pays_residence: string | null;
  profession: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminDashboardStats {
  overview: {
    totalActive: number;
    totalDeleted: number;
    totalAll: number;
    newThisMonth: number;
    profileComplete100: number;
    profileIncomplete: number;
    admins: number;
    avgCompletion: number;
    profileCompleteRate: number;
    plaquetteEligible: number;
    visibleInPlaquette: number;
  };
  byRole: { role: string; count: number }[];
  byProfileStatus: { status: string; count: number }[];
  byStatutMembre: { statut: string; count: number }[];
  byCotisation: { situation: string; count: number }[];
  byPromo: { promo: string; count: number }[];
  bySexe: { sexe: string; count: number }[];
  byCompletion: { range: string; count: number }[];
  byMonth: { month: string; label: string; count: number }[];
  byVisibility: { visible: boolean; count: number }[];
}

/** Statistiques agrégées exposées sur le site public (sans données personnelles). */
export interface PublicStats {
  totalActive: number;
  promoCount: number;
  countryCount: number;
  photoCompletionRate: number;
}

type DbUserRow = Record<string, unknown> & { id: string };

type ProfileBatchMode = "full" | "light";

const USER_LIST_COLUMNS =
  "id, email, full_name, first_name, last_name, phone, promo, role, onboarding_completed, visible_in_plaquette, created_at, updated_at, deleted_at, sexe";

const USER_STATS_COLUMNS =
  "id, email, first_name, last_name, sexe, date_naissance, nationalite, cip_ifu, phone, promo, role, created_at, visible_in_plaquette, deleted_at";

const LINKED_BATCH_SELECT: Record<ProfileBatchMode, Record<string, string>> = {
  light: {
    academic:
      "user_id,annee_entree,annee_sortie,serie_filiere,derniere_classe,diplome_obtenu,promotion_generation",
    professional: "user_id,profession,fonction_actuelle,employeur_structure,domaine_activite",
    locations:
      "user_id,telephone_principal,telephone_secondaire,ville_residence,pays_residence,adresse_complete",
    amicale:
      "user_id,date_adhesion_amicale,statut_membre,situation_cotisations,poste_amicale,disponibilite_benevolat",
    social: "user_id,whatsapp,facebook,linkedin,autres_reseaux",
    observations: "user_id,competences_particulieres,contribution_possible,besoins_attentes",
    media: "user_id,photo",
  },
  full: {
    academic: "*",
    professional: "*",
    locations: "*",
    amicale: "*",
    social: "*",
    observations: "*",
    media: "*",
  },
};

let adminStatsCache: { data: AdminDashboardStats; at: number } | null = null;
const ADMIN_STATS_CACHE_MS = 30_000;

export const invalidateAdminStatsCache = () => {
  adminStatsCache = null;
};

const indexRowsByUserId = (rows: Array<{ user_id: string } & Record<string, unknown>> | null) => {
  const map = new Map<string, Record<string, unknown>>();
  (rows || []).forEach((row) => {
    if (row.user_id) map.set(row.user_id, row);
  });
  return map;
};

/** Profils liés en 7 requêtes groupées (évite N×8 appels et les timeouts). */
export const loadProfilesBatch = async (
  admin: SupabaseClient,
  users: DbUserRow[],
  mode: ProfileBatchMode = "full"
): Promise<Map<string, ProfileRecord>> => {
  const result = new Map<string, ProfileRecord>();
  if (users.length === 0) return result;

  const ids = users.map((u) => u.id);
  const sel = LINKED_BATCH_SELECT[mode];

  const [academic, professional, locations, amicale, social, observations, media] =
    await Promise.all([
      admin.from("academic_profiles").select(sel.academic).in("user_id", ids),
      admin.from("professional_profiles").select(sel.professional).in("user_id", ids),
      admin.from("locations").select(sel.locations).in("user_id", ids),
      admin.from("amicale_memberships").select(sel.amicale).in("user_id", ids),
      admin.from("social_links").select(sel.social).in("user_id", ids),
      admin.from("observations").select(sel.observations).in("user_id", ids),
      admin.from("media").select(sel.media).in("user_id", ids),
    ]);

  type LinkedRow = { user_id: string } & Record<string, unknown>;
  const asLinked = (rows: unknown) => rows as LinkedRow[] | null;

  const academicMap = indexRowsByUserId(asLinked(academic.data));
  const professionalMap = indexRowsByUserId(asLinked(professional.data));
  const locationsMap = indexRowsByUserId(asLinked(locations.data));
  const amicaleMap = indexRowsByUserId(asLinked(amicale.data));
  const socialMap = indexRowsByUserId(asLinked(social.data));
  const observationsMap = indexRowsByUserId(asLinked(observations.data));
  const mediaMap = indexRowsByUserId(asLinked(media.data));

  users.forEach((u) => {
    const merged = normalizeProfile({
      ...(u as ProfileRecord),
      ...(academicMap.get(u.id) || {}),
      ...(professionalMap.get(u.id) || {}),
      ...(locationsMap.get(u.id) || {}),
      ...(amicaleMap.get(u.id) || {}),
      ...(socialMap.get(u.id) || {}),
      ...(observationsMap.get(u.id) || {}),
      ...(mediaMap.get(u.id) || {}),
    });
    result.set(u.id, merged);
  });

  return result;
};

export const fetchFullProfile = async (
  admin: SupabaseClient,
  userId: string,
  includeDeleted = true
): Promise<ProfileRecord | null> => {
  let userQuery = admin.from("users").select("*").eq("id", userId);
  if (!includeDeleted) userQuery = userQuery.is("deleted_at", null);

  const { data: userRow, error } = await userQuery.maybeSingle();
  if (error) throw error;
  if (!userRow) return null;

  const profileMap = await loadProfilesBatch(admin, [userRow as DbUserRow], "full");
  const merged = profileMap.get(userId);
  return merged ? withProfileCompletion(merged) : null;
};

const mapUserRowFromProfile = (
  u: Record<string, unknown>,
  profile: ProfileRecord | undefined
): AdminUserRow => {
  const id = u.id as string;
  const merged = profile ?? normalizeProfile(u);

  return {
    id,
    email: (u.email as string) || "",
    full_name: (u.full_name as string) || null,
    phone: (u.phone as string) || null,
    promo: (u.promo as string) || null,
    role: (u.role as string) || "member",
    onboarding_completed: Boolean(u.onboarding_completed),
    visible_in_plaquette: u.visible_in_plaquette !== false,
    profile_completion: getProfileCompletion(merged),
    photo: merged.photo ?? null,
    ville_residence: merged.ville_residence ?? null,
    pays_residence: merged.pays_residence ?? null,
    profession: merged.profession ?? null,
    created_at: (u.created_at as string) || "",
    updated_at: (u.updated_at as string) || "",
    deleted_at: (u.deleted_at as string) || null,
  };
};

const escapeIlike = (term: string) => term.replace(/[%_\\]/g, " ").trim();

export const listUsersForAdmin = async (
  admin: SupabaseClient,
  options: {
    search?: string;
    page?: number;
    limit?: number;
    status?: UserListStatus;
  } = {}
) => {
  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 20, 100);
  const status = options.status ?? "active";
  const searchTerm = escapeIlike(options.search || "").toLowerCase();

  let query = admin.from("users").select(USER_LIST_COLUMNS, { count: "exact" });

  if (status === "active") {
    query = query.is("deleted_at", null);
  } else if (status === "deleted") {
    query = query.not("deleted_at", "is", null);
  }

  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    query = query.or(
      `email.ilike.${pattern},full_name.ilike.${pattern},phone.ilike.${pattern},promo.ilike.${pattern}`
    );
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: paged, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const rows = (paged || []) as DbUserRow[];
  const profileMap = await loadProfilesBatch(admin, rows, "light");

  return {
    users: rows.map((u) => mapUserRowFromProfile(u, profileMap.get(u.id))),
    total: count ?? 0,
    page,
    limit,
  };
};

export const softDeleteUser = async (admin: SupabaseClient, userId: string) => {
  const { error } = await admin
    .from("users")
    .update({
      deleted_at: new Date().toISOString(),
      visible_in_plaquette: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;
  invalidateAdminStatsCache();
};

export const restoreUser = async (admin: SupabaseClient, userId: string) => {
  const { error } = await admin
    .from("users")
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;
  invalidateAdminStatsCache();
};

export const createUserForAdmin = async (
  admin: SupabaseClient,
  input: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    promo?: string;
    role?: string;
  }
) => {
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.full_name,
      phone: input.phone || "",
      promo: input.promo || "",
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Création utilisateur échouée.");

  const parts = input.full_name.trim().split(" ");
  const { error: profileError } = await admin.from("users").upsert({
    id: authData.user.id,
    email: input.email,
    full_name: input.full_name,
    first_name: parts[0] || "",
    last_name: parts.slice(1).join(" ") || "",
    phone: input.phone || "",
    promo: input.promo || "",
    role: input.role === "admin" ? "admin" : "member",
    onboarding_completed: true,
    visible_in_plaquette: true,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (profileError) throw profileError;
  invalidateAdminStatsCache();
  return fetchFullProfile(admin, authData.user.id);
};

export const getPlaquetteMembers = async (
  admin: SupabaseClient,
  promoFilter?: string
): Promise<PlaquetteMember[]> => {
  const { data, error } = await admin
    .from("users")
    .select("id, visible_in_plaquette, deleted_at")
    .is("deleted_at", null)
    .eq("visible_in_plaquette", true);

  if (error) throw error;

  const rows = (data || []) as DbUserRow[];
  const profileMap = await loadProfilesBatch(admin, rows);

  const members: PlaquetteMember[] = [];

  for (const row of rows) {
    const profile = profileMap.get(row.id);
    if (!profile) continue;
    if (!isPlaquetteEligible(profile)) continue;
    if (promoFilter === "__none__" && profile.promo?.trim()) continue;
    if (promoFilter && promoFilter !== "__none__" && profile.promo !== promoFilter) continue;

    const completion = getProfileCompletion(profile);

    members.push({
      id: profile.id!,
      profile_completion: completion,
      full_name: profile.full_name ?? null,
      first_name: profile.first_name ?? null,
      last_name: profile.last_name ?? null,
      promo: profile.promo ?? null,
      phone: profile.phone ?? profile.telephone_principal ?? null,
      sexe: profile.sexe ?? null,
      serie_filiere: profile.serie_filiere ?? null,
      derniere_classe: profile.derniere_classe ?? null,
      diplome_obtenu: profile.diplome_obtenu ?? null,
      annee_entree: profile.annee_entree ?? null,
      annee_sortie: profile.annee_sortie ?? null,
      profession: profile.profession ?? null,
      fonction_actuelle: profile.fonction_actuelle ?? null,
      employeur_structure: profile.employeur_structure ?? null,
      ville_residence: profile.ville_residence ?? null,
      pays_residence: profile.pays_residence ?? null,
      whatsapp: profile.whatsapp ?? null,
      linkedin: profile.linkedin ?? null,
      photo: profile.photo ?? null,
    });
  }

  return members.sort((a, b) =>
    (a.full_name || "").localeCompare(b.full_name || "", "fr")
  );
};

const completionBucket = (pct: number) => {
  if (pct >= 76) return "76-100%";
  if (pct >= 51) return "51-75%";
  if (pct >= 26) return "26-50%";
  return "0-25%";
};

export const getPublicStats = async (admin: SupabaseClient): Promise<PublicStats> => {
  const { data: activeUsers, error } = await admin
    .from("users")
    .select("id, promo")
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Lecture des utilisateurs impossible : ${error.message}`);
  }

  const users = activeUsers || [];
  const totalActive = users.length;

  if (totalActive === 0) {
    return { totalActive: 0, promoCount: 0, countryCount: 0, photoCompletionRate: 0 };
  }

  const promoCount = new Set(
    users.map((u) => u.promo?.trim()).filter((p): p is string => Boolean(p))
  ).size;

  const userIds = users.map((u) => u.id);

  const [{ data: locations }, { data: media }] = await Promise.all([
    admin.from("locations").select("pays_residence").in("user_id", userIds),
    admin.from("media").select("photo").in("user_id", userIds),
  ]);

  const countryCount = new Set(
    (locations || [])
      .map((l) => l.pays_residence?.trim())
      .filter((p): p is string => Boolean(p))
  ).size;

  const withPhoto = (media || []).filter((m) => Boolean(m.photo?.trim())).length;
  const photoCompletionRate =
    totalActive > 0 ? Math.round((withPhoto / totalActive) * 100) : 0;

  return { totalActive, promoCount, countryCount, photoCompletionRate };
};

export const getAdminStats = async (admin: SupabaseClient): Promise<AdminDashboardStats> => {
  if (adminStatsCache && Date.now() - adminStatsCache.at < ADMIN_STATS_CACHE_MS) {
    return adminStatsCache.data;
  }

  const stats = await computeAdminStats(admin);
  adminStatsCache = { data: stats, at: Date.now() };
  return stats;
};

const computeAdminStats = async (admin: SupabaseClient): Promise<AdminDashboardStats> => {
  const { data: allUsers, error } = await admin.from("users").select(USER_STATS_COLUMNS);

  if (error) {
    throw new Error(`Lecture des utilisateurs impossible : ${error.message}`);
  }

  const users = allUsers || [];
  const active = users.filter((u) => !u.deleted_at);
  const deleted = users.filter((u) => Boolean(u.deleted_at));

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newThisMonth = active.filter(
    (u) => u.created_at && new Date(u.created_at) >= thirtyDaysAgo
  ).length;

  const byPromo: Record<string, number> = {};
  const byStatutMembre: Record<string, number> = {};
  const byCotisation: Record<string, number> = {};
  const bySexe: Record<string, number> = {};
  const byRole: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byCompletion: Record<string, number> = {
    "0-25%": 0,
    "26-50%": 0,
    "51-75%": 0,
    "76-100%": 0,
  };

  active.forEach((u) => {
    const promoKey = u.promo?.trim() || "Non renseigné";
    byPromo[promoKey] = (byPromo[promoKey] || 0) + 1;
    const sexeKey = u.sexe?.trim() || "Non renseigné";
    bySexe[sexeKey] = (bySexe[sexeKey] || 0) + 1;
    const roleKey = u.role || "member";
    byRole[roleKey] = (byRole[roleKey] || 0) + 1;
    if (u.created_at) {
      const d = new Date(u.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    }
  });

  const profileMap = await loadProfilesBatch(admin, active as DbUserRow[], "light");
  const completionByUser = active.map((u) =>
    getProfileCompletion(profileMap.get(u.id as string) ?? normalizeProfile(u))
  );

  completionByUser.forEach((pct) => {
    byCompletion[completionBucket(pct)] += 1;
  });

  profileMap.forEach((profile) => {
    const statutKey = profile.statut_membre?.trim() || "Non renseigné";
    byStatutMembre[statutKey] = (byStatutMembre[statutKey] || 0) + 1;
    const cotKey = profile.situation_cotisations?.trim() || "Non renseigné";
    byCotisation[cotKey] = (byCotisation[cotKey] || 0) + 1;
  });

  const profileComplete100 = completionByUser.filter((p) => p >= 100).length;
  const plaquetteEligible = active.filter(
    (u, i) =>
      u.visible_in_plaquette !== false &&
      (completionByUser[i] ?? 0) >= PLAQUETTE_MIN_PROFILE_COMPLETION
  ).length;

  const avgCompletion =
    completionByUser.length > 0
      ? Math.round(completionByUser.reduce((a, b) => a + b, 0) / completionByUser.length)
      : 0;

  const monthLabels: Record<string, string> = {};
  Object.keys(byMonth)
    .sort()
    .slice(-12)
    .forEach((key) => {
      const [y, m] = key.split("-");
      monthLabels[key] = new Date(Number(y), Number(m) - 1).toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });
    });

  return {
    overview: {
      totalActive: active.length,
      totalDeleted: deleted.length,
      totalAll: users.length,
      newThisMonth,
      profileComplete100,
      profileIncomplete: active.length - profileComplete100,
      admins: active.filter((u) => u.role === "admin").length,
      avgCompletion,
      profileCompleteRate:
        active.length > 0 ? Math.round((profileComplete100 / active.length) * 100) : 0,
      plaquetteEligible,
      visibleInPlaquette: active.filter((u) => u.visible_in_plaquette !== false).length,
    },
    byRole: Object.entries(byRole).map(([role, count]) => ({ role, count })),
    byProfileStatus: [
      { status: "Profil complet (100%)", count: profileComplete100 },
      { status: "Profil à compléter", count: active.length - profileComplete100 },
    ],
    byStatutMembre: Object.entries(byStatutMembre)
      .map(([statut, count]) => ({ statut, count }))
      .sort((a, b) => b.count - a.count),
    byCotisation: Object.entries(byCotisation)
      .map(([situation, count]) => ({ situation, count }))
      .sort((a, b) => b.count - a.count),
    byPromo: Object.entries(byPromo)
      .map(([promo, count]) => ({ promo, count }))
      .sort((a, b) => b.count - a.count),
    bySexe: Object.entries(bySexe).map(([sexe, count]) => ({ sexe, count })),
    byCompletion: Object.entries(byCompletion).map(([range, count]) => ({ range, count })),
    byMonth: Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({
        month,
        label: monthLabels[month] || month,
        count,
      })),
    byVisibility: [
      {
        visible: true,
        count: active.filter((u) => u.visible_in_plaquette !== false).length,
      },
      {
        visible: false,
        count: active.filter((u) => u.visible_in_plaquette === false).length,
      },
    ],
  };
};
