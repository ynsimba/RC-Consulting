import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { useLanguage } from "@/i18n/LanguageContext";

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-sans text-xl font-bold tracking-wide text-ink uppercase">
        {title}
      </h2>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">
        {body}
      </p>
    </div>
  );
}

export default function PrivacyPage() {
  const { t } = useLanguage();
  const p = t.privacyPage;

  return (
    <>
      <Seo
        title={p.seoTitle}
        description={p.seoDesc}
        path="/politique-de-confidentialite"
      />
      <PageHero title={p.heroTitle} />
      <section className="section-pad">
        <div className="container-rc max-w-3xl space-y-10">
          <Block title={p.controllerTitle} body={p.controllerBody} />
          <Block title={p.dataTitle} body={p.dataBody} />
          <Block title={p.purposeTitle} body={p.purposeBody} />
          <Block title={p.rightsTitle} body={p.rightsBody} />
          <Block title={p.retentionTitle} body={p.retentionBody} />
        </div>
      </section>
    </>
  );
}
