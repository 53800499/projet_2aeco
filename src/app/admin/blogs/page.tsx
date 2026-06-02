"use client";

import { useCallback, useEffect, useState } from "react";
import { BlogPost, useAdminApi } from "@/hooks/useAdminApi";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { formatAuthError } from "@/lib/auth-messages";

const emptyDraft = {
  title: "",
  slug: "",
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
  const [draft, setDraft] = useState(emptyDraft);

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
    setSaving(true);
    try {
      if (editing) {
        await updateBlog(editing.id, draft);
        showSuccess("Article mis a jour.");
      } else {
        await createBlog(draft);
        showSuccess("Article cree.");
      }
      resetForm();
      void load();
    } catch (e) {
      showError(formatAuthError(e, "Enregistrement impossible."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-midnight_text dark:text-white">Gestion des blogs</h2>
          <p className="text-sm text-grey dark:text-white/70">
            CRUD complet des articles affiches sur la landing page.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark_border dark:bg-darklight">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            placeholder="Titre"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode"
          />
          <input
            value={draft.slug}
            onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
            placeholder="Slug (optionnel)"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode"
          />
          <input
            value={draft.cover_image}
            onChange={(e) => setDraft((p) => ({ ...p, cover_image: e.target.value }))}
            placeholder="URL image de couverture"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode md:col-span-2"
          />
          <textarea
            value={draft.excerpt}
            onChange={(e) => setDraft((p) => ({ ...p, excerpt: e.target.value }))}
            placeholder="Resume court"
            className="min-h-20 rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode md:col-span-2"
          />
          <textarea
            value={draft.content}
            onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
            placeholder="Contenu (texte/HTML)"
            className="min-h-40 rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode md:col-span-2"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft((p) => ({ ...p, published: e.target.checked }))}
            />
            Publie
          </label>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Enregistrement..." : editing ? "Mettre a jour" : "Creer"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border px-4 py-2 text-sm">
              Annuler
            </button>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-dark_border dark:bg-darklight">
        <table className="w-full text-left text-sm">
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
                <td colSpan={4} className="px-4 py-8 text-center text-grey">Chargement...</td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-grey">Aucun article.</td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id} className="border-t dark:border-dark_border/40">
                  <td className="px-4 py-3">{blog.title}</td>
                  <td className="px-4 py-3 text-grey">{blog.slug}</td>
                  <td className="px-4 py-3">{blog.published ? "Publie" : "Brouillon"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => {
                          setEditing(blog);
                          setDraft({
                            title: blog.title,
                            slug: blog.slug,
                            excerpt: blog.excerpt || "",
                            content: blog.content || "",
                            cover_image: blog.cover_image || "",
                            published: blog.published,
                          });
                        }}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={async () => {
                          if (!confirm("Supprimer cet article ?")) return;
                          try {
                            await deleteBlog(blog.id);
                            showSuccess("Article supprime.");
                            void load();
                          } catch (e) {
                            showError(formatAuthError(e, "Suppression impossible."));
                          }
                        }}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
