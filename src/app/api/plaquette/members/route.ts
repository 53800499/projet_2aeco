import { NextResponse } from "next/server";
import { getSupabaseAdmin, hasAdminConfig } from "@/lib/supabase-admin";
import { getPlaquetteMembers } from "@/lib/admin-users";

/** Liste publique des membres pour la plaquette numérique */
export async function GET(request: Request) {
  if (!hasAdminConfig) {
    return NextResponse.json(
      { error: "Service temporairement indisponible." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const promoParam = searchParams.get("promo");
  const promo = promoParam === null ? undefined : promoParam;

  try {
    const admin = getSupabaseAdmin();
    const members = await getPlaquetteMembers(admin, promo);
    const promos = [...new Set(members.map((m) => m.promo || "Non renseigné"))].sort();

    return NextResponse.json({
      members,
      total: members.length,
      promos,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
