"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BlogPost, useAdminApi } from "@/hooks/useAdminApi";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { formatAuthError } from "@/lib/auth-messages";
import { slugifyBlogTitle } from "@/lib/blogs";
import ImageFileInput from "@/components/Common/ImageFileInput";

type BlogDraft = {
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published: boolean;
};

const emptyDraft: BlogDraft = {
  title: "",
  excerpt: "",
  content: "",
  cover_image: "",
  published: true,
};

export default function AdminBlogsPage() {
  const { fetchBlogs, createBlog, updateBlog, deleteBlog } = useAdminApi();
  const { showError, showSuccess } = useAuthFeedback();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [draft, setDraft] = useState<BlogDraft>(emptyDraft);

  const previewSlug = useMemo(
    () => (draft.title.trim() ? slugifyBlogTitle(draft.title) : ""),
    [draft.title]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBlogs();
      setBlogs(data.blogs);
    } catch (e) {
      showError(formatAuthError(e, "Impossible de charger les articles."));
    } finally {
      setLoading(false);
    }
  }, [fetchBlogs, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setEditing(null);
    setDraft(emptyDraft);
  };

  const handleSave = async () => {
    if (!draft.title.trim()) {
      showError("Le titre est obligatoire.");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateBlog(editing.id, draft);
        showSuccess("Article mis à jour.");
      } else {
        await createBlog(draft);
        showSuccess("Article créé.");
      }
      resetForm();
      void load();
    } catch (e) {
      showError(formatAuthError(e, "Enregistrement impossible."));
    } finally {
      setSaving(false);
    }
  };

  const editBlog = (blog: BlogPost) => {
    setEditing(blog);
    setDraft({
      title: blog.title,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      cover_image: blog.cover_image || "",
      published: blog.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-midnight_text sm:text-2xl dark:text-white">
          Gestion des blogs
        </h2>
        <p className="mt-1 text-sm text-grey dark:text-white/70">
          CRUD complet des articles affichés sur la landing page.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-dark_border dark:bg-darklight">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <input
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="Titre *"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode"
            />
            {previewSlug && (
              <p className="mt-2 text-xs text-grey dark:text-white/60">
                URL générée automatiquement :{" "}
                <span className="font-mono text-midnight_text dark:text-white/80">
                  /blog/{previewSlug}
                </span>
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <ImageFileInput
              label="Image de couverture"
              value={draft.cover_image}
              onChange={(url) => setDraft((p) => ({ ...p, cover_image: url }))}
              onError={(msg) => showError(msg)}
              hint="JPG, PNG ou WebP — max. 5 Mo"
            />
          </div>

          <textarea
            value={draft.excerpt}
            onChange={(e) => setDraft((p) => ({ ...p, excerpt: e.target.value }))}
            placeholder="Résumé court"
            className="min-h-20 rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode md:col-span-2"
          />
          <textarea
            value={draft.content}
            onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
            placeholder="Contenu (texte/HTML)"
            className="min-h-40 rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode md:col-span-2"
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft((p) => ({ ...p, published: e.target.checked }))}
            />
            Publié
          </label>
          <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Enregistrement..." : editing ? "Mettre à jour" : "Créer"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-xl border px-4 py-2.5 text-sm sm:w-auto"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:hidden">
        {loading ? (
          <p className="py-8 text-center text-grey">Chargement...</p>
        ) : blogs.length === 0 ? (
          <p className="py-8 text-center text-grey">Aucun article.</p>
        ) : (
          blogs.map((blog) => (
            <article
              key={blog.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark_border dark:bg-darklight"
            >
              <h3 className="font-semibold text-midnight_text dark:text-white">{blog.title}</h3>
              <p className="mt-1 truncate font-mono text-xs text-grey">/blog/{blog.slug}</p>
              <p className="mt-2 text-xs">
                {blog.published ? (
                  <span className="text-emerald-600">Publié</span>
                ) : (
                  <span className="text-amber-600">Brouillon</span>
                )}
              </p>
              <div className="mt-3 flex gap-4 border-t pt-3 dark:border-dark_border">
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => editBlog(blog)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-red-600 hover:underline"
                  onClick={async () => {
                    if (!confirm("Supprimer cet article ?")) return;
                    try {
                      await deleteBlog(blog.id);
                      showSuccess("Article supprimé.");
                      void load();
                    } catch (e) {
                      showError(formatAuthError(e, "Suppression impossible."));
                    }
                  }}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block dark:border-dark_border dark:bg-darklight">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-dark_border/30">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-grey">
                    Chargement...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-grey">
                    Aucun article.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="border-t dark:border-dark_border/40">
                    <td className="max-w-[200px] truncate px-4 py-3">{blog.title}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-grey">{blog.slug}</td>
                    <td className="px-4 py-3">{blog.published ? "Publié" : "Brouillon"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => editBlog(blog)}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={async () => {
                            if (!confirm("Supprimer cet article ?")) return;
                            try {
                              await deleteBlog(blog.id);
                              showSuccess("Article supprimé.");
                              void load();
                            } catch (e) {
                              showError(formatAuthError(e, "Suppression impossible."));
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
