import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { FadeIn } from "@/components/ui/FadeIn";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string | null;
  published_at?: string | null;
  category?: { name: string; slug: string } | null;
};

type Category = { id: string; name: string; slug: string };

export default function BlogPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const page = Number(params.get("page") ?? "1");
  const pageSize = 9;

  const { data, isLoading } = useQuery({
    queryKey: ["blog", q, category, page],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image, published_at, category:categories(name, slug)", {
          count: "exact",
        })
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
      if (category) query = query.eq("category.slug", category);

      const from = (page - 1) * pageSize;
      const { data, error, count } = await query.range(from, from + pageSize - 1);
      if (error) throw error;
      return {
        items: (data ?? []) as unknown as Article[],
        page,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      };
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  return (
    <>
      <Seo
        title="Blog"
        description="Actualités et analyses juridiques du cabinet RC Consulting."
        path="/blog"
      />
      <PageHero
        title="Blog"
        subtitle="Analyses, conseils et décryptages juridiques."
      />

      <section className="section-pad">
        <div className="container-rc">
          <form
            className="mb-10 flex flex-col gap-4 md:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const next = new URLSearchParams(params);
              next.set("q", String(fd.get("q") ?? ""));
              next.set("page", "1");
              setParams(next);
            }}
          >
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher un article…"
              className="flex-1 border border-line px-4 py-3"
              aria-label="Recherche"
            />
            <select
              value={category}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value) next.set("category", e.target.value);
                else next.delete("category");
                next.set("page", "1");
                setParams(next);
              }}
              className="border border-line px-4 py-3"
              aria-label="Catégorie"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-gold">
              Rechercher
            </button>
          </form>

          {isLoading && <p className="text-muted">Chargement…</p>}

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((article, i) => (
              <FadeIn key={article.id} delay={i * 0.05}>
                <article className="group border border-line">
                  <Link to={`/blog/${article.slug}`}>
                    <img
                      src={
                        article.cover_image ??
                        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
                      }
                      alt=""
                      className="h-48 w-full object-cover grayscale transition group-hover:grayscale-0"
                      loading="lazy"
                    />
                    <div className="p-6">
                      {article.category && (
                        <p className="mb-2 text-xs tracking-[0.16em] text-gold uppercase">
                          {article.category.name}
                        </p>
                      )}
                      <h2 className="text-lg font-bold tracking-wide uppercase group-hover:text-gold">
                        {article.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {article.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              </FadeIn>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-3">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(params);
                      next.set("page", String(p));
                      setParams(next);
                    }}
                    className={`h-10 w-10 border text-sm ${
                      p === page
                        ? "border-gold bg-gold text-white"
                        : "border-line hover:border-gold"
                    }`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
