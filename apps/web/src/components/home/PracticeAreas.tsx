import { Link } from "react-router-dom";
import { PRACTICE_AREAS } from "@rc/shared";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";

export function PracticeAreas() {
  const { t } = useLanguage();

  return (
    <section className="section-pad bg-soft">
      <div className="container-rc">
        <SectionHeading
          eyebrow={t.home.areasEyebrow}
          title={t.home.areasTitle}
          subtitle={t.home.areasSubtitle}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_AREAS.map((area, i) => (
            <FadeIn key={area.slug} delay={i * 0.05} className="h-full">
              <Link
                to={`/nos-expertises/${area.slug}`}
                className="group flex h-full flex-col border border-line bg-white p-7 transition hover:border-gold"
              >
                <p className="mb-4 font-serif text-2xl text-gold">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-3 text-sm font-bold tracking-[0.14em] uppercase transition group-hover:text-gold">
                  {t.areas[area.slug].title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-muted">
                  {t.areas[area.slug].short}
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button to="/nos-expertises" variant="outline">
            {t.home.areasCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
