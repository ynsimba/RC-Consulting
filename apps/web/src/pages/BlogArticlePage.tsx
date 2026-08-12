import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";

type Article = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  category?: { name: string } | null;
};

export default function BlogArticlePage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "title, slug, excerpt, content, cover_image, seo_title, seo_description, published_at, category:categories(name)",
        )
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("not found");
      return data as unknown as Article;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="container-rc py-24 text-muted">Chargement…</div>;
  }

  if (isError || !data) {
    return (
      <div className="container-rc py-24">
        <p>Article introuvable.</p>
        <Link to="/blog" className="mt-4 inline-block text-gold">
          ← Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={data.seo_title || data.title}
        description={data.seo_description || data.excerpt}
        path={`/blog/${data.slug}`}
        image={data.cover_image ?? undefined}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: data.title,
          description: data.excerpt,
          image: data.cover_image,
          datePublished: data.published_at,
          author: { "@type": "Organization", name: "RC Consulting" },
        }}
      />
      <PageHero title={data.title} subtitle={data.category?.name} />
      <article className="section-pad">
        <div className="container-rc max-w-3xl">
          {data.cover_image && (
            <img
              src={data.cover_image}
              alt=""
              className="mb-10 w-full object-cover"
              loading="eager"
            />
          )}
          <div
            className="space-y-4 text-lg leading-relaxed text-muted [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
          <div className="mt-12 flex flex-wrap gap-4">
            <Button to="/rendez-vous">Prendre rendez-vous</Button>
            <Link
              to="/blog"
              className="self-center text-sm tracking-wide text-gold uppercase"
            >
              ← Retour au blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
