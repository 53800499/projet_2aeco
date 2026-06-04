import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listAdminBlogs, normalizeBlogInput } from "@/lib/blogs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const blogs = await listAdminBlogs(auth.admin);
    return NextResponse.json({ blogs });
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
    const payload = normalizeBlogInput(body);
    const timestamp = new Date().toISOString();

    const { data, error } = await auth.admin
      .from("blogs")
      .insert({
        ...payload,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ blog: data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
