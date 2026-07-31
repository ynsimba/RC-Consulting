import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFaq } from "@/hooks/useFaq";
import { localizeFaq } from "@/lib/localizeFaq";

export function FaqPreview() {
  const { lang, t } = useLanguage();
  const { data = [] } = useFaq();
  const items = localizeFaq(data, lang).slice(0, 5);

  return (
    <section className="section-pad">
      <div className="container-rc max-w-3xl">
        <SectionHeading
          eyebrow={t.home.faqEyebrow}
          title={t.home.faqTitle}
          subtitle={t.home.faqSubtitle}
        />
        <Accordion items={items} />
        <div className="mt-10 text-center">
          <Button to="/faq" variant="outline">
            {t.home.faqCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
