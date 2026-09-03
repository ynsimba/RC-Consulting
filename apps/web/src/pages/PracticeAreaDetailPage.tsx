import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/lib/seo";
import { getPractice } from "@/data/practiceAreas";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { useLanguage } from "@/i18n/LanguageContext";

export default function PracticeAreaDetailPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const practice = slug ? getPractice(slug) : undefined;

  if (!practice) return <Navigate to="/nos-expertises" replace />;

  const title = t.areas[practice.slug].title;
  const short = t.areas[practice.slug].short;
  const hasSituations = practice.situations.length > 0;
  const hasAccompaniment = practice.accompaniment.length > 0;
  const hasHighlights = (practice.highlights?.length ?? 0) > 0;
  const showMethodBlock = hasSituations || hasAccompaniment;

  return (
    <>
      <Seo
        title={title}
        description={short}
        path={`/nos-expertises/${practice.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: title,
          provider: { "@type": "LegalService", name: "RC Consulting" },
          description: short,
        }}
      />
      <PageHero title={title} subtitle={short} />

      <section className="section-pad">
        <div className="container-rc max-w-4xl">
          <FadeIn>
            <SectionHeading
              align="left"
              eyebrow={t.expertise.presentation}
              title={title}
              subtitle={practice.intro}
            />
            {hasHighlights && (
              <ul className="mt-2 space-y-3">
                {practice.highlights!.map((s) => (
                  <li key={s} className="flex gap-3 text-muted">
                    <span className="text-gold">▸</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </FadeIn>
        </div>
      </section>

      {showMethodBlock && (
        <section className="section-pad bg-soft">
          <div
            className={`container-rc grid gap-12 ${
              hasSituations && hasAccompaniment ? "lg:grid-cols-2" : "max-w-4xl"
            }`}
          >
            {hasSituations && (
              <FadeIn>
                <SectionHeading
                  align="left"
                  eyebrow={t.expertise.situationsEyebrow}
                  title={t.expertise.situations}
                />
                <ul className="space-y-3">
                  {practice.situations.map((s) => (
                    <li key={s} className="flex gap-3 text-muted">
                      <span className="text-gold">▸</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            )}
            {hasAccompaniment && (
              <FadeIn delay={hasSituations ? 0.1 : 0}>
                <SectionHeading
                  align="left"
                  eyebrow={t.expertise.accompanimentEyebrow}
                  title={t.expertise.accompaniment}
                />
                <ul className="space-y-3">
                  {practice.accompaniment.map((s) => (
                    <li key={s} className="flex gap-3 text-muted">
                      <span className="text-gold">▸</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            )}
          </div>
        </section>
      )}

      <section className="section-pad">
        <div className="container-rc max-w-3xl">
          <SectionHeading eyebrow="FAQ" title={t.expertise.faq} />
          <Accordion
            items={practice.faqs.map((f, i) => ({
              id: `${practice.slug}-${i}`,
              question: f.question,
              answer: f.answer,
            }))}
          />
          <div className="mt-12 flex flex-wrap gap-4">
            <Button to="/rendez-vous">{t.expertise.cta}</Button>
            <Link
              to="/nos-expertises"
              className="self-center text-sm tracking-wide text-gold uppercase"
            >
              {t.expertise.back}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
