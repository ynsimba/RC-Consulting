import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";

export function Method() {
  const { t } = useLanguage();
  const steps = [
    { title: t.home.step1Title, text: t.home.step1Text },
    { title: t.home.step2Title, text: t.home.step2Text },
    { title: t.home.step3Title, text: t.home.step3Text },
  ];

  return (
    <section className="section-pad">
      <div className="container-rc">
        <SectionHeading
          eyebrow={t.home.methodEyebrow}
          title={t.home.methodTitle}
          subtitle={t.home.methodSubtitle}
        />
        <div className="grid items-stretch gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.08} className="h-full">
              <div className="flex h-full flex-col border border-line p-6">
                <div className="mb-4 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold font-serif text-lg text-gold">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-sm font-bold tracking-[0.12em] uppercase">
                  {step.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
