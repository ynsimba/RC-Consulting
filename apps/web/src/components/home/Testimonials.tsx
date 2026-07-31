import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";

const reviewsFr = [
  {
    name: "Marc D.",
    role: "Investisseur — Belgique / RDC",
    text: "Un accompagnement précis sur le cadre OHADA et les relations institutionnelles. Une vraie sécurité pour notre implantation.",
  },
  {
    name: "Amina K.",
    role: "Dirigeante",
    text: "La médiation proposée par le cabinet a permis de dénouer un litige commercial rapidement, sans dégrader la relation d'affaires.",
  },
  {
    name: "Pauline V.",
    role: "Responsable de projet public",
    text: "Conseil clair et stratégique pour coordonner un projet transversal et promouvoir les modes alternatifs de règlement des différends.",
  },
];

const reviewsEn = [
  {
    name: "Marc D.",
    role: "Investor — Belgium / DRC",
    text: "Precise support on the OHADA framework and institutional relations. Real security for our market entry.",
  },
  {
    name: "Amina K.",
    role: "CEO",
    text: "The mediation proposed by the firm helped resolve a commercial dispute quickly, without damaging the business relationship.",
  },
  {
    name: "Pauline V.",
    role: "Public project lead",
    text: "Clear and strategic advice to coordinate a cross-cutting project and promote alternative dispute resolution.",
  },
];

export function Testimonials() {
  const { lang, t } = useLanguage();
  const reviews = lang === "en" ? reviewsEn : reviewsFr;

  return (
    <section className="section-pad bg-soft">
      <div className="container-rc">
        <SectionHeading
          eyebrow={t.home.testimonialsEyebrow}
          title={t.home.testimonialsTitle}
          subtitle={t.home.testimonialsSubtitle}
        />
        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.08}>
              <blockquote className="h-full border border-line bg-white p-8">
                <p className="font-serif text-lg leading-relaxed text-ink italic">
                  “{r.text}”
                </p>
                <footer className="mt-6">
                  <p className="text-sm font-bold tracking-wide uppercase">
                    {r.name}
                  </p>
                  <p className="text-xs text-gold">{r.role}</p>
                </footer>
              </blockquote>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
