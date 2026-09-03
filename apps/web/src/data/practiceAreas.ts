import type { PracticeAreaSlug } from "@rc/shared";

export type PracticeContent = {
  slug: PracticeAreaSlug;
  title: string;
  intro: string;
  /** Points affichés sous la présentation (ex. arbitrage). */
  highlights?: string[];
  situations: string[];
  accompaniment: string[];
  faqs: { question: string; answer: string }[];
};

export const practiceContents: PracticeContent[] = [
  {
    slug: "droit-belge",
    title: "Droit belge",
    intro:
      "RC Consulting conseille et accompagne ses clients en droit belge, avec une approche stratégique adaptée aux enjeux civils, commerciaux et institutionnels.",
    situations: [
      "Conseil juridique aux particuliers et aux entreprises",
      "Contrats et relations commerciales",
      "Interface juridique Belgique–RDC",
    ],
    accompaniment: [
      "Analyse de votre situation au regard du droit belge",
      "Conseil juridique et rédaction d'actes",
    ],
    faqs: [
      {
        question: "Intervenez-vous uniquement en Belgique ?",
        answer:
          "Nous exerçons en Belgique et en République démocratique du Congo, avec une expertise croisée en droit belge et en droit OHADA.",
      },
    ],
  },
  {
    slug: "droit-ohada",
    title: "Droit OHADA",
    intro:
      "Le cabinet accompagne entrepreneurs et investisseurs dans l'application du droit OHADA, notamment pour les activités liées à la RDC.",
    situations: [
      "Structuration d'opérations commerciales",
      "Sociétés et gouvernance",
      "Application générale du droit OHADA",
    ],
    accompaniment: [
      "Diagnostic juridique OHADA",
      "Sécurisation des opérations et contrats",
      "Constitution de sociétés et suivi des obligations applicables",
      "Conseil aux investisseurs belges et congolais",
    ],
    faqs: [
      {
        question: "Qu'est-ce que le droit OHADA ?",
        answer:
          "L'OHADA unifie une grande partie du droit des affaires dans plusieurs États africains, dont la RDC. Notre cabinet vous guide dans ce cadre juridique harmonisé.",
      },
    ],
  },
  {
    slug: "mediation",
    title: "Médiation",
    intro:
      "Intervention en tant que médiateur, en droit belge et en droit OHADA, pour prévenir et résoudre les différends civils ou commerciaux de manière confidentielle, rapide et durable.",
    situations: [],
    accompaniment: [],
    faqs: [
      {
        question: "La médiation remplace-t-elle toujours un procès ?",
        answer:
          "Pas nécessairement. Elle constitue souvent une alternative efficace, plus rapide et moins coûteuse, tout en préservant les relations entre parties.",
      },
    ],
  },
  {
    slug: "arbitrage",
    title: "Arbitrage",
    intro:
      "RC Consulting accompagne ses clients dans le recours à l'arbitrage pour le règlement alternatif des litiges commerciaux selon tout règlement arbitral applicable, également en droit belge et en droit OHADA.",
    highlights: [
      "Rédaction de clauses compromissoires",
      "Intervention en tant qu'arbitre",
      "Exequatur des sentences arbitrales",
    ],
    situations: [],
    accompaniment: [],
    faqs: [
      {
        question: "Pourquoi choisir l'arbitrage ?",
        answer:
          "Confidentialité, spécialisation des arbitres, flexibilité procédurale et efficacité dans les relations d'affaires internationales.",
      },
    ],
  },
  {
    slug: "consultance-accompagnement",
    title: "Consultance & Accompagnement",
    intro:
      "Assistance à la négociation d'accords et de contrats pour sécuriser vos engagements et prévenir les litiges. Accompagnement institutionnel des entrepreneurs et investisseurs entre la Belgique et la République démocratique du Congo. Conseil des autorités publiques pour la coordination de projets transversaux et l'élaboration de politiques publiques.",
    situations: [
      "Contrats",
      "Investissements",
      "Élaboration de politiques publiques",
      "Coordination de projets",
    ],
    accompaniment: [
      "Négociation d'accords et rédaction de contrats",
      "Sécurisation juridique des investissements",
      "Relations avec les institutions",
      "Prévention des risques juridiques",
      "Coordination de projet et mise en place de politiques publiques",
    ],
    faqs: [
      {
        question: "Qui peut bénéficier de cet accompagnement ?",
        answer:
          "Entrepreneurs, investisseurs et autorités publiques actifs entre la Belgique et la RDC, pour sécuriser contrats, projets et relations institutionnelles.",
      },
    ],
  },
];

export function getPractice(slug: string) {
  return practiceContents.find((p) => p.slug === slug);
}
