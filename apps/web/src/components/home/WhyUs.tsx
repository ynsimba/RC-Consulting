import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";

export function WhyUs() {
  const { t } = useLanguage();
  const items = [
    { title: t.home.why1Title, text: t.home.why1Text },
    { title: t.home.why2Title, text: t.home.why2Text },
    { title: t.home.why3Title, text: t.home.why3Text },
    { title: t.home.why4Title, text: t.home.why4Text },
  ];

  return (
    <section className="section-pad bg-soft">
      <div className="container-rc">
        <SectionHeading
          eyebrow={t.home.whyEyebrow}
          title={t.home.whyTitle}
          subtitle={t.home.whySubtitle}
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <div className="border-t-2 border-gold pt-6">
                <p className="mb-3 font-serif text-3xl text-gold">
                  0{i + 1}
                </p>
                <h3 className="mb-3 text-sm font-bold tracking-[0.14em] uppercase">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
