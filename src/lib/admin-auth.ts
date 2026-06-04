import { NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseUserClient } from "@/lib/supabase-admin";

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email?: string | null) =>
  Boolean(email && adminEmails.includes(email.toLowerCase()));

export async function requireAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      ),
    };
  }

  try {
    const userClient = getSupabaseUserClient(token);
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return {
        error: NextResponse.json(
          { error: "Session invalide ou expirée." },
          { status: 401 }
        ),
      };
    }

    const admin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await admin
      .from("users")
      .select("id, role, email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("admin profile lookup:", profileError.message);
    }

    const isAdmin =
      profile?.role === "admin" || isAdminEmail(user.email ?? profile?.email);

    if (!isAdmin) {
      return {
        error: NextResponse.json(
          { error: "Accès réservé aux administrateurs." },
          { status: 403 }
        ),
      };
    }

    return { user, profile, admin };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Erreur de vérification administrateur." },
        { status: 500 }
      ),
    };
  }
}
