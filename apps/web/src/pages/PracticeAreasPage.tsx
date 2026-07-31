import { Link } from "react-router-dom";
import { PRACTICE_AREAS } from "@rc/shared";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/ui/FadeIn";
import { useLanguage } from "@/i18n/LanguageContext";

export default function PracticeAreasPage() {
  const { t } = useLanguage();

  return (
    <>
      <Seo
        title={t.expertise.seoTitle}
        description={t.expertise.seoDesc}
        path="/nos-expertises"
      />
      <PageHero
        title={t.expertise.heroTitle}
        subtitle={t.expertise.heroSubtitle}
      />
      <section className="section-pad">
        <div className="container-rc">
          <SectionHeading
            eyebrow={t.expertise.eyebrow}
            title={t.expertise.title}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRACTICE_AREAS.map((area, i) => (
              <FadeIn key={area.slug} delay={i * 0.05}>
                <Link
                  to={`/nos-expertises/${area.slug}`}
                  className="group block border border-line p-8 transition hover:border-gold"
                >
                  <h2 className="mb-3 text-sm font-bold tracking-[0.14em] uppercase group-hover:text-gold">
                    {t.areas[area.slug].title}
                  </h2>
                  <p className="text-sm text-muted">{t.areas[area.slug].short}</p>
                  <span className="mt-5 inline-block text-xs tracking-[0.16em] text-gold uppercase">
                    {t.expertise.more}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
