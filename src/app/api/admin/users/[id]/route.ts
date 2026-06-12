import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  fetchFullProfile,
  invalidateAdminStatsCache,
  softDeleteUser,
} from "@/lib/admin-users";
import { normalizeProfileForSave, ProfileRecord } from "@/lib/profile";

export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const profile = await fetchFullProfile(auth.admin, id, true);
    if (!profile) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = (await request.json()) as ProfileRecord & {
    role?: string;
    visible_in_plaquette?: boolean;
  };

  try {
    const normalized = normalizeProfileForSave({ ...body, id });
    const timestamp = new Date().toISOString();
    const { admin } = auth;

    const { error: userError } = await admin
      .from("users")
      .update({
        email: normalized.email,
        full_name: normalized.full_name,
        first_name: normalized.first_name,
        last_name: normalized.last_name,
        sexe: normalized.sexe,
        date_naissance: normalized.date_naissance || null,
        nationalite: normalized.nationalite,
        phone: normalized.phone,
        promo: normalized.promo,
        onboarding_completed: Boolean(normalized.onboarding_completed),
        visible_in_plaquette: body.visible_in_plaquette !== false,
        role: body.role === "admin" ? "admin" : "member",
        updated_at: timestamp,
      })
      .eq("id", id);

    if (userError) throw userError;

    const upsertLinked = (table: string, payload: Record<string, unknown>) =>
      admin.from(table).upsert(
        {
          user_id: id,
          ...payload,
          created_at: timestamp,
          updated_at: timestamp,
        },
        { onConflict: "user_id" }
      );

    const { data: existingMedia } = await admin
      .from("media")
      .select("id")
      .eq("user_id", id)
      .limit(1)
      .maybeSingle();

    const mediaWrite = existingMedia?.id
      ? admin
          .from("media")
          .update({
            photo: normalized.photo,
            document_url: normalized.document_url,
            media_type: normalized.media_type || "photo",
            updated_at: timestamp,
          })
          .eq("id", existingMedia.id)
      : admin.from("media").insert({
          user_id: id,
          photo: normalized.photo,
          document_url: normalized.document_url,
          media_type: normalized.media_type || "photo",
          created_at: timestamp,
          updated_at: timestamp,
        });

    await Promise.all([
      upsertLinked("academic_profiles", {
        annee_entree: normalized.annee_entree,
        annee_sortie: normalized.annee_sortie,
        serie_filiere: normalized.serie_filiere,
        derniere_classe: normalized.derniere_classe,
        diplome_obtenu: normalized.diplome_obtenu,
        promotion_generation: normalized.promotion_generation,
      }),
      upsertLinked("professional_profiles", {
        profession: normalized.profession,
        fonction_actuelle: normalized.fonction_actuelle,
        employeur_structure: normalized.employeur_structure,
        domaine_activite: normalized.domaine_activite,
      }),
      upsertLinked("locations", {
        telephone_principal: normalized.phone || null,
        ville_residence: normalized.ville_residence,
        pays_residence: normalized.pays_residence,
        adresse_complete: normalized.adresse_complete,
      }),
      upsertLinked("amicale_memberships", {
        date_adhesion_amicale: normalized.date_adhesion_amicale,
        statut_membre: normalized.statut_membre,
        situation_cotisations: normalized.situation_cotisations,
        poste_amicale: normalized.poste_amicale,
        disponibilite_benevolat: normalized.disponibilite_benevolat,
      }),
      upsertLinked("observations", {
        competences_particulieres: normalized.competences_particulieres,
        contribution_possible: normalized.contribution_possible,
        besoins_attentes: normalized.besoins_attentes,
      }),
      mediaWrite,
    ]);

    invalidateAdminStatsCache();
    const profile = await fetchFullProfile(admin, id, true);
    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Suppression logique */
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;

  if (id === auth.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte." },
      { status: 400 }
    );
  }

  try {
    await softDeleteUser(auth.admin, id);
    return NextResponse.json({ success: true, softDeleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
