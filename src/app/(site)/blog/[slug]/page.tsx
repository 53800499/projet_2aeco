import { getPublicBlogBySlug } from "@/lib/blogs";
import { getSupabaseAdmin, hasAdminConfig } from "@/lib/supabase-admin";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  if (!hasAdminConfig) return { title: "Actualites | 2aeco" };
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(getSupabaseAdmin(), slug);
  return { title: blog ? `${blog.title} | 2aeco` : "Article introuvable | 2aeco" };
}

export default async function Post({ params }: Props) {
  if (!hasAdminConfig) notFound();

  const { slug } = await params;
  const post = await getPublicBlogBySlug(getSupabaseAdmin(), slug);
  if (!post) notFound();

  return (
    <section className="relative pt-44 pb-20 dark:bg-darkmode">
      <div className="container mx-auto max-w-4xl">
        <p className="text-sm text-grey dark:text-white/70">
          {new Date(post.published_at || post.created_at).toLocaleDateString("fr-FR")}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-midnight_text dark:text-white">{post.title}</h1>
        {post.cover_image && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <Image src={post.cover_image} alt={post.title} width={1200} height={700} className="h-full w-full object-cover" />
          </div>
        )}
        {post.excerpt && <p className="mt-6 text-lg text-grey dark:text-white/70">{post.excerpt}</p>}
        <article
          className="blog-details mt-8 text-base text-midnight_text dark:text-white/80"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />
      </div>
    </section>
  );
}
