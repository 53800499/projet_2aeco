import { SupabaseClient } from "@supabase/supabase-js";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const toSlug = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeBlogInput = (input: Partial<BlogPost>) => {
  const title = (input.title || "").trim();
  const slug = (input.slug || "").trim() || toSlug(title);
  if (!title) throw new Error("Le titre est obligatoire.");
  if (!slug) throw new Error("Le slug est obligatoire.");

  return {
    title,
    slug,
    excerpt: input.excerpt?.trim() || null,
    content: input.content?.trim() || null,
    cover_image: input.cover_image?.trim() || null,
    published: input.published !== false,
    published_at: input.published
      ? input.published_at || new Date().toISOString()
      : input.published_at || null,
  };
};

export const listPublicBlogs = async (
  admin: SupabaseClient,
  limit?: number
): Promise<BlogPost[]> => {
  let query = admin
    .from("blogs")
    .select("*")
    .eq("published", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (limit && limit > 0) query = query.limit(Math.min(limit, 50));
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as BlogPost[];
};

export const getPublicBlogBySlug = async (
  admin: SupabaseClient,
  slug: string
): Promise<BlogPost | null> => {
  const { data, error } = await admin
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as BlogPost | null) ?? null;
};

export const listAdminBlogs = async (admin: SupabaseClient): Promise<BlogPost[]> => {
  const { data, error } = await admin
    .from("blogs")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as BlogPost[];
};
