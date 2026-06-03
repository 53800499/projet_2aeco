import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/admin-users";
import { getSupabaseAdmin, hasAdminConfig } from "@/lib/supabase-admin";

/** Statistiques publiques pour la section compteurs (accessible sans connexion). */
export async function GET() {
  if (!hasAdminConfig) {
    return NextResponse.json(
      { error: "Service temporairement indisponible." },
      { status: 503 }
    );
  }

  try {
    const admin = getSupabaseAdmin();
    const stats = await getPublicStats(admin);
    return NextResponse.json(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
