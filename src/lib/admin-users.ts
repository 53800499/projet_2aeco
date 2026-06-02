import { getProfileCompletion, ProfileRecord, withProfileCompletion } from "@/lib/profile";
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
    onboardingComplete: number;
    onboardingPending: number;
    admins: number;
    avgCompletion: number;
    completionRate: number;
    plaquetteEligible: number;
    visibleInPlaquette: number;
  };
  byRole: { role: string; count: number }[];
  byOnboarding: { status: string; count: number }[];
  byPromo: { promo: string; count: number }[];
  bySexe: { sexe: string; count: number }[];
  byCompletion: { range: string; count: number }[];
  byMonth: { month: string; label: string; count: number }[];
  byVisibility: { visible: boolean; count: number }[];
}


export const fetchFullProfile = async (
  admin: SupabaseClient,
  userId: string,
  includeDeleted = true
): Promise<ProfileRecord | null> => {
  let userQuery = admin.from("users").select("*").eq("id", userId);
  if (!includeDeleted) userQuery = userQuery.is("deleted_at", null);

  const [userRes, academic, professional, location, amicale, social, observation, media] =
    await Promise.all([
      userQuery.maybeSingle(),
      admin.from("academic_profiles").select("*").eq("user_id", userId).maybeSingle(),
      admin.from("professional_profiles").select("*").eq("user_id", userId).maybeSingle(),
      admin.from("locations").select("*").eq("user_id", userId).maybeSingle(),
      admin.from("amicale_memberships").select("*").eq("user_id", userId).maybeSingle(),
      admin.from("social_links").select("*").eq("user_id", userId).maybeSingle(),
      admin.from("observations").select("*").eq("user_id", userId).maybeSingle(),
      admin.from("media").select("*").eq("user_id", userId).maybeSingle(),
    ]);

  if (!userRes.data) return null;

  const merged: ProfileRecord = {
    ...userRes.data,
    ...(academic.data || {}),
    ...(professional.data || {}),
    ...(location.data || {}),
    ...(amicale.data || {}),
    ...(social.data || {}),
    ...(observation.data || {}),
    ...(media.data || {}),
  };

  return withProfileCompletion(merged);
};

const mapUserRow = async (
  admin: SupabaseClient,
  u: Record<string, unknown>
): Promise<AdminUserRow> => {
  const id = u.id as string;
  const [loc, pro, media] = await Promise.all([
    admin.from("locations").select("ville_residence, pays_residence").eq("user_id", id).maybeSingle(),
    admin.from("professional_profiles").select("profession").eq("user_id", id).maybeSingle(),
    admin.from("media").select("photo").eq("user_id", id).maybeSingle(),
  ]);

  const partial: ProfileRecord = {
    ...(u as ProfileRecord),
    ville_residence: loc.data?.ville_residence,
    pays_residence: loc.data?.pays_residence,
    profession: pro.data?.profession,
    photo: media.data?.photo,
  };

  return {
    id,
    email: (u.email as string) || "",
    full_name: (u.full_name as string) || null,
    phone: (u.phone as string) || null,
    promo: (u.promo as string) || null,
    role: (u.role as string) || "member",
    onboarding_completed: Boolean(u.onboarding_completed),
    visible_in_plaquette: u.visible_in_plaquette !== false,
    profile_completion: getProfileCompletion(partial),
    photo: media.data?.photo ?? null,
    ville_residence: loc.data?.ville_residence ?? null,
    pays_residence: loc.data?.pays_residence ?? null,
    profession: pro.data?.profession ?? null,
    created_at: (u.created_at as string) || "",
    updated_at: (u.updated_at as string) || "",
    deleted_at: (u.deleted_at as string) || null,
  };
};

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

  const { data: usersRaw, error } = await admin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const searchTerm = options.search?.trim().toLowerCase();
  let users = usersRaw || [];

  if (status === "active") {
    users = users.filter((u) => !u.deleted_at);
  } else if (status === "deleted") {
    users = users.filter((u) => Boolean(u.deleted_at));
  }

  if (searchTerm) {
    users = users.filter(
      (u) =>
        u.email?.toLowerCase().includes(searchTerm) ||
        u.full_name?.toLowerCase().includes(searchTerm) ||
        u.phone?.toLowerCase().includes(searchTerm) ||
        u.promo?.toLowerCase().includes(searchTerm)
    );
  }

  const total = users.length;
  const from = (page - 1) * limit;
  const paged = users.slice(from, from + limit);

  const rows = await Promise.all(paged.map((u) => mapUserRow(admin, u)));

  return { users: rows, total, page, limit };
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
    onboarding_completed: false,
    visible_in_plaquette: true,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (profileError) throw profileError;
  return fetchFullProfile(admin, authData.user.id);
};

export const getPlaquetteMembers = async (
  admin: SupabaseClient,
  promoFilter?: string
): Promise<PlaquetteMember[]> => {
  const { data, error } = await admin
    .from("users")
    .select("id")
    .is("deleted_at", null)
    .eq("onboarding_completed", true)
    .eq("visible_in_plaquette", true);

  if (error) throw error;

  const members: PlaquetteMember[] = [];

  for (const row of data || []) {
    const profile = await fetchFullProfile(admin, row.id);
    if (!profile) continue;
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

export const getAdminStats = async (admin: SupabaseClient): Promise<AdminDashboardStats> => {
  const { data: allUsers, error } = await admin.from("users").select("*");

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

  const onboardingComplete = active.filter((u) => u.onboarding_completed).length;
  const plaquetteEligible = active.filter(
    (u) => u.onboarding_completed && u.visible_in_plaquette !== false
  ).length;

  const byPromo: Record<string, number> = {};
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

  const completionSamples = await Promise.all(
    active.slice(0, 30).map(async (u) => {
      try {
        const p = await fetchFullProfile(admin, u.id);
        return p ? getProfileCompletion(p) : 0;
      } catch {
        return 0;
      }
    })
  );

  completionSamples.forEach((pct) => {
    byCompletion[completionBucket(pct)] += 1;
  });

  const avgCompletion =
    completionSamples.length > 0
      ? Math.round(completionSamples.reduce((a, b) => a + b, 0) / completionSamples.length)
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
      onboardingComplete,
      onboardingPending: active.length - onboardingComplete,
      admins: active.filter((u) => u.role === "admin").length,
      avgCompletion,
      completionRate:
        active.length > 0 ? Math.round((onboardingComplete / active.length) * 100) : 0,
      plaquetteEligible,
      visibleInPlaquette: active.filter((u) => u.visible_in_plaquette !== false).length,
    },
    byRole: Object.entries(byRole).map(([role, count]) => ({ role, count })),
    byOnboarding: [
      { status: "Terminé", count: onboardingComplete },
      { status: "En cours", count: active.length - onboardingComplete },
    ],
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
