import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFaq } from "@/hooks/useFaq";
import { localizeFaq } from "@/lib/localizeFaq";

export default function FaqPage() {
  const { lang, t } = useLanguage();
  const { data = [], isLoading } = useFaq();
  const items = localizeFaq(data, lang);

  return (
    <>
      <Seo
        title={t.faqPage.seoTitle}
        description={t.faqPage.seoDesc}
        path="/faq"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <PageHero
        title={t.faqPage.heroTitle}
        subtitle={t.faqPage.heroSubtitle}
      />
      <section className="section-pad">
        <div className="container-rc max-w-3xl">
          <SectionHeading
            eyebrow={t.faqPage.eyebrow}
            title={t.faqPage.title}
          />
          {isLoading ? (
            <p className="text-muted">{t.faqPage.loading}</p>
          ) : (
            <Accordion items={items} />
          )}
        </div>
      </section>
    </>
  );
}
