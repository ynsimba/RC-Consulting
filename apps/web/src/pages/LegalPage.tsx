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

export default function LegalPage() {
  const { t } = useLanguage();
  const p = t.legalPage;

  return (
    <>
      <Seo title={p.seoTitle} description={p.seoDesc} path="/mentions-legales" />
      <PageHero title={p.heroTitle} />
      <section className="section-pad">
        <div className="container-rc max-w-3xl space-y-10">
          <Block title={p.editorTitle} body={p.editorBody} />
          <Block title={p.hostTitle} body={p.hostBody} />
          <Block title={p.ipTitle} body={p.ipBody} />
        </div>
      </section>
    </>
  );
}
