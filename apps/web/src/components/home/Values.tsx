import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";

export function Values() {
  const { t } = useLanguage();
  const values = [
    { title: t.home.value1, text: t.home.value1Text },
    { title: t.home.value2, text: t.home.value2Text },
    { title: t.home.value3, text: t.home.value3Text },
    { title: t.home.value4, text: t.home.value4Text },
    { title: t.home.value5, text: t.home.value5Text },
  ];

  return (
    <section className="section-pad">
      <div className="container-rc">
        <SectionHeading
          eyebrow={t.home.valuesEyebrow}
          title={t.home.valuesTitle}
          subtitle={t.home.valuesSubtitle}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((value, i) => (
            <FadeIn key={value.title} delay={i * 0.06}>
              <div className="h-full border border-line p-6 transition hover:border-gold">
                <p className="mb-4 font-serif text-2xl text-gold">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-3 text-sm font-bold tracking-[0.14em] uppercase">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{value.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
