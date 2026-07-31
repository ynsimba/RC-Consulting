import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  categoryId?: string | null;
};

type Category = { id: string; name: string; slug: string };

export default function BlogAdminPage() {
  const qc = useQueryClient();
  const { data: articles = [] } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () => api<Article[]>("/api/blog/admin/articles"),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => api<Category[]>("/api/blog/categories"),
  });

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    published: true,
    categoryId: "",
  });

  const create = useMutation({
    mutationFn: () =>
      api("/api/blog/admin/articles", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
          coverImage: "",
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      setForm({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        published: true,
        categoryId: "",
      });
    },
  });

  const del = useMutation({
    mutationFn: (id: string) =>
      api(`/api/blog/admin/articles/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-articles"] }),
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide">Blog</h1>
        <p className="mt-2 text-muted">CRUD des articles.</p>
      </div>

      <form
        className="grid gap-3 border border-line bg-white p-6 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <h2 className="md:col-span-2 font-semibold uppercase tracking-wide">
          Nouvel article
        </h2>
        <input
          className="border border-line px-3 py-2"
          placeholder="Titre"
          value={form.title}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              title: e.target.value,
              slug: e.target.value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
            }))
          }
          required
        />
        <input
          className="border border-line px-3 py-2"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          required
        />
        <select
          className="border border-line px-3 py-2"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">Sans catégorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Publié
        </label>
        <textarea
          className="md:col-span-2 border border-line px-3 py-2"
          placeholder="Extrait"
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          required
        />
        <textarea
          className="md:col-span-2 border border-line px-3 py-2"
          placeholder="Contenu HTML"
          rows={6}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          required
        />
        <div className="md:col-span-2">
          <Button type="submit" disabled={create.isPending}>
            Créer
          </Button>
        </div>
      </form>

      <ul className="space-y-3">
        {articles.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-line bg-white p-4"
          >
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-muted">
                /{a.slug} — {a.published ? "Publié" : "Brouillon"}
              </p>
            </div>
            <button
              type="button"
              className="text-xs text-red-600 uppercase"
              onClick={() => del.mutate(a.id)}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
