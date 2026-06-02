import { NextResponse } from "next/server";
import { getSupabaseAdmin, hasAdminConfig } from "@/lib/supabase-admin";
import { getPublicBlogBySlug } from "@/lib/blogs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!hasAdminConfig) {
    return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 });
  }

  const { slug } = await context.params;

  try {
    const admin = getSupabaseAdmin();
    const blog = await getPublicBlogBySlug(admin, slug);
    if (!blog) {
      return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
    }
    return NextResponse.json({ blog });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
