import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { fetchFullProfile, restoreUser } from "@/lib/admin-users";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    await restoreUser(auth.admin, id);
    const profile = await fetchFullProfile(auth.admin, id, true);
    return NextResponse.json({ profile, restored: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
