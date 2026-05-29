"use client";

import { useMemo, useCallback } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";

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
  onboarding_completed?: boolean;
  profile_completion?: number;
  updated_at?: string;
}
const normalizeProfile = (profile: Record<string, any> = {}) => ({
  ...profile,
  full_name: profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.full_name || "",
  email: profile.email || profile.user_email || "",
  phone: profile.phone || profile.telephone_principal || "",
});

const fetchLinkedProfile = async (supabase: any, userId: string) => {
  const [userData, academicData, professionalData, locationData, amicaleData, socialData, observationData, mediaData] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase.from("academic_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("professional_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("locations").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("amicale_memberships").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("social_links").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("observations").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("media").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  return normalizeProfile({
    ...(userData.data || {}),
    ...(academicData.data || {}),
    ...(professionalData.data || {}),
    ...(locationData.data || {}),
    ...(amicaleData.data || {}),
    ...(socialData.data || {}),
    ...(observationData.data || {}),
    ...(mediaData.data || {}),
  });
};

const upsertLinkedRow = async (supabase: any, table: string, userId: string, payload: Record<string, any>) => {
  const { data: existingRow } = await supabase.from(table).select("id").eq("user_id", userId).maybeSingle();

  if (existingRow?.id) {
    return supabase.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existingRow.id);
  }

  return supabase.from(table).insert({ ...payload, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
};


export const useSupabaseProfile = () => {
  const supabase = useMemo(() => {
    if (!hasSupabaseConfig) {
      return null;
    }

    try {
      return getSupabaseBrowserClient();
    } catch (error) {
      console.error("Supabase profile client init failed", error);
      return null;
    }
  }, []);

  const loadProfile = useCallback(async (userId?: string) => {
    if (!supabase || !userId) {
      return { data: null, error: new Error("Profil indisponible") };
    }

    const [userResponse, academicResponse, professionalResponse, locationResponse, amicaleResponse, socialResponse, observationResponse, mediaResponse] = await Promise.all([
      supabase.from("users").select("*").eq("id", userId).maybeSingle(),
      supabase.from("academic_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("professional_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("locations").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("amicale_memberships").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("social_links").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("observations").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("media").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    if (userResponse.error) {
      return { data: null, error: userResponse.error };
    }

    const baseProfile = userResponse.data || { id: userId, email: "" };
    const profile = {
      ...baseProfile,
      ...(academicResponse.data || {}),
      ...(professionalResponse.data || {}),
      ...(locationResponse.data || {}),
      ...(amicaleResponse.data || {}),
      ...(socialResponse.data || {}),
      ...(observationResponse.data || {}),
      ...(mediaResponse.data || {}),
      onboarding_completed: Boolean(baseProfile.onboarding_completed),
    };

    return { data: { ...profile, profile_completion: getProfileCompletion(profile) }, error: null };
  }, [supabase]);

  const saveProfile = useCallback(async (profile: ProfileRecord) => {
    if (!supabase) {
      throw new Error("La configuration Supabase n’est pas disponible.");
    }

    const userId = profile.id;
    if (!userId) {
      throw new Error("L’identifiant utilisateur est requis pour enregistrer le profil.");
    }

    const profileCompletion = getProfileCompletion(profile);
    const timestamp = new Date().toISOString();

    const userPayload = {
      id: userId,
      email: profile.email || "",
      full_name: profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      sexe: profile.sexe || "",
      date_naissance: profile.date_naissance || null,
      nationalite: profile.nationalite || "",
      cip_ifu: profile.cip_ifu || "",
      phone: profile.phone || profile.telephone_principal || "",
      promo: profile.promo || "",
      onboarding_completed: Boolean(profile.onboarding_completed),
      updated_at: timestamp,
    };

    const upsertLinkedRow = async (table: string, payload: Record<string, any>) => {
      const { data: existing } = await supabase.from(table).select("id").eq("user_id", userId).maybeSingle();
      if (existing?.id) {
        return supabase.from(table).update({ ...payload, updated_at: timestamp }).eq("id", existing.id);
      }
      return supabase.from(table).insert({ ...payload, user_id: userId, created_at: timestamp, updated_at: timestamp });
    };

    await supabase.from("users").upsert({ ...userPayload, created_at: profile.created_at || timestamp }, { onConflict: "id" });
    await Promise.all([
      upsertLinkedRow("academic_profiles", {
        annee_entree: profile.annee_entree || null,
        annee_sortie: profile.annee_sortie || null,
        serie_filiere: profile.serie_filiere || null,
        derniere_classe: profile.derniere_classe || null,
        diplome_obtenu: profile.diplome_obtenu || null,
        promotion_generation: profile.promotion_generation || null,
      }),
      upsertLinkedRow("professional_profiles", {
        profession: profile.profession || null,
        fonction_actuelle: profile.fonction_actuelle || null,
        employeur_structure: profile.employeur_structure || null,
        domaine_activite: profile.domaine_activite || null,
      }),
      upsertLinkedRow("locations", {
        telephone_principal: profile.telephone_principal || profile.phone || null,
        telephone_secondaire: profile.telephone_secondaire || null,
        ville_residence: profile.ville_residence || null,
        pays_residence: profile.pays_residence || null,
        adresse_complete: profile.adresse_complete || null,
      }),
      upsertLinkedRow("amicale_memberships", {
        date_adhesion_amicale: profile.date_adhesion_amicale || null,
        statut_membre: profile.statut_membre || null,
        situation_cotisations: profile.situation_cotisations || null,
        poste_amicale: profile.poste_amicale || null,
        disponibilite_benevolat: profile.disponibilite_benevolat || null,
      }),
      upsertLinkedRow("social_links", {
        whatsapp: profile.whatsapp || null,
        facebook: profile.facebook || null,
        linkedin: profile.linkedin || null,
        autres_reseaux: profile.autres_reseaux || null,
      }),
      upsertLinkedRow("observations", {
        competences_particulieres: profile.competences_particulieres || null,
        contribution_possible: profile.contribution_possible || null,
        besoins_attentes: profile.besoins_attentes || null,
      }),
      upsertLinkedRow("media", {
        photo: profile.photo || null,
        document_url: profile.document_url || null,
        media_type: profile.media_type || "photo",
      }),
    ]);

    const { data, error } = await loadProfile(userId);

    if (error) {
      throw error;
    }

    return { data: { ...(data || profile), profile_completion: profileCompletion, onboarding_completed: Boolean(profile.onboarding_completed) }, error: null };
  }, [supabase]);

  return {
    supabase,
    loadProfile,
    saveProfile,
  };
};

export const getProfileCompletion = (profile: Partial<ProfileRecord>) => {
  const fields = [
    profile.first_name,
    profile.last_name,
    profile.sexe,
    profile.date_naissance,
    profile.nationalite,
    profile.cip_ifu,
    profile.photo,
    profile.annee_entree,
    profile.annee_sortie,
    profile.serie_filiere,
    profile.derniere_classe,
    profile.diplome_obtenu,
    profile.promotion_generation,
    profile.profession,
    profile.fonction_actuelle,
    profile.employeur_structure,
    profile.domaine_activite,
    profile.telephone_principal,
    profile.telephone_secondaire,
    profile.email,
    profile.ville_residence,
    profile.pays_residence,
    profile.adresse_complete,
    profile.date_adhesion_amicale,
    profile.statut_membre,
    profile.situation_cotisations,
    profile.poste_amicale,
    profile.disponibilite_benevolat,
    profile.whatsapp,
    profile.facebook,
    profile.linkedin,
    profile.autres_reseaux,
    profile.competences_particulieres,
    profile.contribution_possible,
    profile.besoins_attentes,
  ];

  const completedFields = fields.filter((value) => String(value || "").trim().length > 0).length;

  return Math.round((completedFields / fields.length) * 100);
};
