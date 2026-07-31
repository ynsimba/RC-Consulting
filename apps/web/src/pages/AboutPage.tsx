import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <>
      <Seo
        title={t.about.seoTitle}
        description={t.about.seoDesc}
        path="/a-propos"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Charlotte Richard",
          honorificPrefix: "Me",
          jobTitle: "Legal advisor, Mediator and Arbitrator",
          worksFor: {
            "@type": "LegalService",
            name: "RC Consulting",
          },
        }}
      />
      <PageHero title={t.about.heroTitle} subtitle={t.about.heroSubtitle} />

      <section className="section-pad">
        <div className="container-rc grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="relative">
              <img
                src="/rc.jpg"
                alt="Me Charlotte Richard"
                className="h-[520px] w-full object-cover object-top grayscale"
                loading="eager"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brown-deep/90 to-transparent p-6 text-white">
                <p className="font-serif text-sm tracking-[0.2em] text-gold uppercase">
                  {t.about.founderLabel}
                </p>
                <p className="mt-1 text-xl font-bold tracking-wide uppercase">
                  Me Charlotte Richard
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <SectionHeading
              align="left"
              eyebrow={t.about.founderEyebrow}
              title={t.about.founderTitle}
              subtitle={t.about.founderSubtitle}
            />
            <p className="leading-relaxed text-muted">{t.about.p1}</p>
            <p className="mt-4 leading-relaxed text-muted">{t.about.p2}</p>
            <p className="mt-4 leading-relaxed text-muted">{t.about.p3}</p>
            <ul className="mt-8 space-y-3 text-sm text-ink">
              {[
                t.about.bullet1,
                t.about.bullet2,
                t.about.bullet3,
                t.about.bullet4,
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-gold">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      <section className="section-pad bg-soft">
        <div className="container-rc max-w-4xl">
          <SectionHeading
            eyebrow={t.about.firmEyebrow}
            title={t.about.firmTitle}
            subtitle={t.about.firmSubtitle}
          />
          <div className="space-y-6 text-muted leading-relaxed">
            <p>{t.about.firmP1}</p>
            <p>{t.about.firmP2}</p>
            <p>{t.about.firmP3}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              [t.about.cardBe, t.about.cardBeText],
              [t.about.cardRdc, t.about.cardRdcText],
              [t.about.cardMed, t.about.cardMedText],
              [t.about.cardArb, t.about.cardArbText],
            ].map(([title, text], i) => (
              <FadeIn key={title} delay={i * 0.06}>
                <div className="border-t-2 border-gold bg-white p-6">
                  <h3 className="mb-2 text-sm font-bold tracking-[0.14em] uppercase">
                    {title}
                  </h3>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button to="/rendez-vous">{t.about.cta}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
