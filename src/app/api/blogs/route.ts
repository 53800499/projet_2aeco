import { NextResponse } from "next/server";
import { getSupabaseAdmin, hasAdminConfig } from "@/lib/supabase-admin";
import { listPublicBlogs } from "@/lib/blogs";

export async function GET(request: Request) {
  if (!hasAdminConfig) {
    return NextResponse.json({ blogs: [] });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || "0");

  try {
    const admin = getSupabaseAdmin();
    const blogs = await listPublicBlogs(admin, Number.isNaN(limit) ? undefined : limit);
    return NextResponse.json({ blogs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
