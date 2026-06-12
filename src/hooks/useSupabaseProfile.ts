"use client";

import { useMemo, useCallback } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import {
  ProfileRecord,
  normalizeProfile,
  normalizeProfileForSave,
  getProfileCompletion,
  withProfileCompletion,
} from "@/lib/profile";

export type { ProfileRecord };
export { normalizeProfileForSave, getProfileCompletion, withProfileCompletion };

const assertNoError = (label: string, result: { error: { message: string } | null }) => {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
};

const fetchLinkedProfile = async (supabase: any, userId: string) => {
  const [userData, academicData, professionalData, locationData, amicaleData, observationData, mediaData] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase.from("academic_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("professional_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("locations").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("amicale_memberships").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("observations").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("media").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  return normalizeProfile({
    ...(userData.data || {}),
    ...(academicData.data || {}),
    ...(professionalData.data || {}),
    ...(locationData.data || {}),
    ...(amicaleData.data || {}),
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

    const [userResponse, academicResponse, professionalResponse, locationResponse, amicaleResponse, observationResponse, mediaResponse] = await Promise.all([
      supabase.from("users").select("*").eq("id", userId).maybeSingle(),
      supabase.from("academic_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("professional_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("locations").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("amicale_memberships").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("observations").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("media").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    if (userResponse.error) {
      return { data: null, error: userResponse.error };
    }

    const baseProfile = userResponse.data || { id: userId, email: "" };
    const profile = normalizeProfile({
      ...baseProfile,
      ...(academicResponse.data || {}),
      ...(professionalResponse.data || {}),
      ...(locationResponse.data || {}),
      ...(amicaleResponse.data || {}),
      ...(observationResponse.data || {}),
      ...(mediaResponse.data || {}),
      onboarding_completed: Boolean(baseProfile.onboarding_completed),
    });

    return { data: withProfileCompletion(profile), error: null };
  }, [supabase]);

  const saveProfile = useCallback(async (profile: ProfileRecord) => {
    if (!supabase) {
      throw new Error("La configuration Supabase n’est pas disponible.");
    }

    const userId = profile.id;
    if (!userId) {
      throw new Error("L’identifiant utilisateur est requis pour enregistrer le profil.");
    }

    const normalized = normalizeProfileForSave(profile);
    const profileCompletion = getProfileCompletion(normalized);
    const timestamp = new Date().toISOString();

    const userPayload = {
      id: userId,
      email: normalized.email || "",
      full_name: normalized.full_name || `${normalized.first_name || ""} ${normalized.last_name || ""}`.trim(),
      first_name: normalized.first_name || "",
      last_name: normalized.last_name || "",
      sexe: normalized.sexe || "",
      date_naissance: normalized.date_naissance || null,
      nationalite: normalized.nationalite || "",
      phone: normalized.phone || "",
      promo: normalized.promo || normalized.promotion_generation || "",
      onboarding_completed: true,
      updated_at: timestamp,
    };

    const upsertLinkedRow = async (table: string, payload: Record<string, any>) => {
      const { data: existing, error: selectError } = await supabase.from(table).select("id").eq("user_id", userId).maybeSingle();
      if (selectError) {
        throw new Error(`${table}: ${selectError.message}`);
      }
      if (existing?.id) {
        return supabase.from(table).update({ ...payload, updated_at: timestamp }).eq("id", existing.id);
      }
      return supabase.from(table).insert({ ...payload, user_id: userId, created_at: timestamp, updated_at: timestamp });
    };

    assertNoError("users", await supabase.from("users").upsert(
      { ...userPayload, created_at: normalized.created_at || timestamp },
      { onConflict: "id" }
    ));

    const linkedResults = await Promise.all([
      upsertLinkedRow("academic_profiles", {
        annee_entree: normalized.annee_entree || null,
        annee_sortie: normalized.annee_sortie || null,
        serie_filiere: normalized.serie_filiere || null,
        derniere_classe: normalized.derniere_classe || null,
        diplome_obtenu: normalized.diplome_obtenu || null,
        promotion_generation: normalized.promotion_generation || null,
      }),
      upsertLinkedRow("professional_profiles", {
        profession: normalized.profession || null,
        fonction_actuelle: normalized.fonction_actuelle || null,
        employeur_structure: normalized.employeur_structure || null,
        domaine_activite: normalized.domaine_activite || null,
      }),
      upsertLinkedRow("locations", {
        telephone_principal: normalized.phone || null,
        ville_residence: normalized.ville_residence || null,
        pays_residence: normalized.pays_residence || null,
        adresse_complete: normalized.adresse_complete || null,
      }),
      upsertLinkedRow("amicale_memberships", {
        date_adhesion_amicale: normalized.date_adhesion_amicale || null,
        statut_membre: normalized.statut_membre || null,
        situation_cotisations: normalized.situation_cotisations || null,
        poste_amicale: normalized.poste_amicale || null,
        disponibilite_benevolat: normalized.disponibilite_benevolat || null,
      }),
      upsertLinkedRow("observations", {
        competences_particulieres: normalized.competences_particulieres || null,
        contribution_possible: normalized.contribution_possible || null,
        besoins_attentes: normalized.besoins_attentes || null,
      }),
      upsertLinkedRow("media", {
        photo: normalized.photo || null,
        document_url: normalized.document_url || null,
        media_type: normalized.media_type || "photo",
      }),
    ]);

    linkedResults.forEach((result, index) => {
      const tables = ["academic_profiles", "professional_profiles", "locations", "amicale_memberships", "observations", "media"];
      assertNoError(tables[index], result);
    });

    const { data, error } = await loadProfile(userId);

    if (error) {
      throw error;
    }

    return {
      data: withProfileCompletion({
        ...(data || normalized),
        onboarding_completed: true,
      }),
      error: null,
    };
  }, [supabase, loadProfile]);

  return {
    supabase,
    loadProfile,
    saveProfile,
  };
};
