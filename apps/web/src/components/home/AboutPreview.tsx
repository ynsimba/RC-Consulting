import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";

export function AboutPreview() {
  const { t } = useLanguage();

  return (
    <section className="section-pad">
      <div className="container-rc grid items-center gap-12 lg:grid-cols-2">
        <FadeIn>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80"
              alt="RC Consulting"
              className="h-[480px] w-full object-cover grayscale"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -right-2 hidden max-w-[14rem] bg-gold px-6 py-5 text-white md:block">
              <p className="text-sm font-bold leading-snug tracking-wide uppercase">
                {t.home.dualBelgium}
              </p>
              <p className="mt-1 text-sm font-bold leading-snug tracking-wide uppercase">
                {t.home.dualDrc}
              </p>
              <p className="mt-2 text-[10px] tracking-[0.18em] uppercase opacity-90">
                {t.home.dualAnchor}
              </p>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <SectionHeading
            align="left"
            eyebrow={t.home.aboutEyebrow}
            title={t.home.aboutTitle}
            subtitle={t.home.aboutSubtitle}
          />
          <p className="leading-relaxed text-muted">{t.home.aboutP1}</p>
          <p className="mt-4 leading-relaxed text-muted">{t.home.aboutP2}</p>
          <p className="mt-4 leading-relaxed text-muted">{t.home.aboutP3}</p>
          <p className="mt-4 leading-relaxed text-muted">{t.home.aboutP4}</p>
          <ul className="mt-6 space-y-3 text-sm text-ink">
            {[t.home.aboutBullet1, t.home.aboutBullet2, t.home.aboutBullet3].map(
              (item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-gold">▸</span>
                  {item}
                </li>
              ),
            )}
          </ul>
          <div className="mt-8">
            <Button to="/a-propos" variant="outline">
              {t.home.aboutCta}
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
