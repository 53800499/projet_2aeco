import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createUserForAdmin, listUsersForAdmin, UserListStatus } from "@/lib/admin-users";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const status = (searchParams.get("status") || "active") as UserListStatus;

  try {
    const result = await listUsersForAdmin(auth.admin, { search, page, limit, status });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const profile = await createUserForAdmin(auth.admin, {
      email: body.email,
      password: body.password,
      full_name: body.full_name,
      phone: body.phone,
      promo: body.promo,
      role: body.role,
    });
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
