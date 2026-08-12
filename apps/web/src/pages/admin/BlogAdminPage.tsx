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
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
          Blog
        </h1>
        <p className="mt-0.5 text-xs text-muted sm:text-sm">CRUD des articles.</p>
      </div>

      <form
        className="grid gap-2.5 border border-line bg-white p-3 sm:gap-3 sm:p-5 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <h2 className="text-sm font-semibold tracking-wide uppercase md:col-span-2">
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

      <ul className="space-y-2">
        {articles.map((a) => (
          <li
            key={a.id}
            className="flex items-start justify-between gap-2 border border-line bg-white p-3 sm:items-center sm:gap-3 sm:p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug sm:text-base">
                {a.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted sm:text-xs">
                /{a.slug} — {a.published ? "Publié" : "Brouillon"}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-[10px] font-semibold tracking-wide text-red-600 uppercase sm:text-xs"
              onClick={() => del.mutate(a.id)}
            >
              Suppr.
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
