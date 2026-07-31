import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";

type Article = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
  category?: { name: string } | null;
};

export default function BlogArticlePage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => api<Article>(`/api/blog/articles/${slug}`),
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
        title={data.seoTitle || data.title}
        description={data.seoDescription || data.excerpt}
        path={`/blog/${data.slug}`}
        image={data.coverImage ?? undefined}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: data.title,
          description: data.excerpt,
          image: data.coverImage,
          datePublished: data.publishedAt,
          author: { "@type": "Organization", name: "RC Consulting" },
        }}
      />
      <PageHero title={data.title} subtitle={data.category?.name} />
      <article className="section-pad">
        <div className="container-rc max-w-3xl">
          {data.coverImage && (
            <img
              src={data.coverImage}
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
            <Link to="/blog" className="self-center text-sm text-gold uppercase tracking-wide">
              ← Retour au blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
