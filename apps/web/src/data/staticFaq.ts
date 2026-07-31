import type { FaqRecord } from "@/lib/localizeFaq";

/** FAQ de secours quand l'API n'est pas disponible (hébergement front seul). */
export const STATIC_FAQ: FaqRecord[] = [
  {
    id: "static-1",
    question: "Dans quels pays intervenez-vous ?",
    answer:
      "RC Consulting exerce ses activités en Belgique et en République démocratique du Congo.",
    questionEn: "In which countries do you operate?",
    answerEn:
      "RC Consulting operates in Belgium and in the Democratic Republic of the Congo.",
  },
  {
    id: "static-2",
    question: "Quels droits pratiquez-vous ?",
    answer:
      "Nous intervenons en droit belge et en droit OHADA, ainsi qu'en médiation et en arbitrage.",
    questionEn: "Which areas of law do you practise?",
    answerEn:
      "We practise Belgian law and OHADA law, as well as mediation and arbitration.",
  },
  {
    id: "static-3",
    question: "Proposez-vous la médiation et l'arbitrage ?",
    answer:
      "Oui. Nous agissons pour la prévention et le règlement alternatif des différends civils ou commerciaux.",
    questionEn: "Do you offer mediation and arbitration?",
    answerEn:
      "Yes. We act in the prevention and alternative resolution of civil or commercial disputes.",
  },
  {
    id: "static-4",
    question: "Accompagnez-vous les entrepreneurs et investisseurs ?",
    answer:
      "Oui. Nous proposons un accompagnement institutionnel entre la Belgique et la RDC, ainsi qu'une assistance à la négociation d'accords et de contrats.",
    questionEn: "Do you support entrepreneurs and investors?",
    answerEn:
      "Yes. We provide institutional support between Belgium and the DRC, as well as assistance with negotiating agreements and contracts.",
  },
  {
    id: "static-5",
    question: "Conseillez-vous les autorités publiques ?",
    answer:
      "Oui. Nous accompagnons les autorités publiques en Belgique et en RDC pour la coordination de projets transversaux et la promotion des MARD.",
    questionEn: "Do you advise public authorities?",
    answerEn:
      "Yes. We support public authorities in Belgium and the DRC with cross-cutting project coordination and the promotion of ADR.",
  },
];
