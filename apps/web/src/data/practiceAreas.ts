import type { PracticeAreaSlug } from "@rc/shared";

export type PracticeContent = {
  slug: PracticeAreaSlug;
  title: string;
  intro: string;
  situations: string[];
  accompaniment: string[];
  faqs: { question: string; answer: string }[];
};

export const practiceContents: PracticeContent[] = [
  {
    slug: "droit-belge",
    title: "Droit belge",
    intro:
      "RC Consulting conseille et accompagne ses clients en droit belge, en Belgique, avec une approche stratégique adaptée aux enjeux civils, commerciaux et institutionnels.",
    situations: [
      "Conseil juridique aux entreprises et particuliers",
      "Contrats et relations commerciales",
      "Prévention des litiges",
      "Accompagnement de projets transversaux",
      "Interface juridique Belgique–RDC",
    ],
    accompaniment: [
      "Analyse de votre situation au regard du droit belge",
      "Conseil stratégique et rédaction d'actes",
      "Assistance à la négociation",
      "Orientation vers la médiation ou l'arbitrage lorsque pertinent",
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
      "Le cabinet accompagne entrepreneurs, investisseurs et institutions dans l'application du droit OHADA, notamment pour les activités liées à la RDC.",
    situations: [
      "Structuration d'opérations commerciales",
      "Sociétés et gouvernance",
      "Sûretés et recouvrement",
      "Contrats d'affaires régionaux",
      "Contentieux et modes alternatifs de règlement",
    ],
    accompaniment: [
      "Diagnostic juridique OHADA",
      "Sécurisation des montages et contrats",
      "Conseil aux investisseurs belges et congolais",
      "Coordination avec les acteurs locaux",
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
      "Nous intervenons en médiation pour prévenir et résoudre les différends civils ou commerciaux de manière confidentielle, rapide et durable.",
    situations: [
      "Conflits commerciaux entre partenaires",
      "Différends civils",
      "Tensions contractuelles",
      "Prévention d'un contentieux judiciaire",
      "Relations d'affaires Belgique–RDC",
    ],
    accompaniment: [
      "Évaluation de l'opportunité d'une médiation",
      "Organisation du processus",
      "Facilitation des échanges",
      "Formalisation des accords",
    ],
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
      "RC Consulting accompagne ses clients dans le recours à l'arbitrage pour le règlement alternatif des litiges commerciaux.",
    situations: [
      "Clauses compromissoires",
      "Litiges commerciaux nationaux ou internationaux",
      "Exécution de sentences arbitrales",
      "Différends d'investissement",
      "Contentieux OHADA ou belgo-congolais",
    ],
    accompaniment: [
      "Conseil sur la stratégie arbitrale",
      "Rédaction et analyse de clauses",
      "Assistance pendant la procédure",
      "Suivi jusqu'à l'exécution",
    ],
    faqs: [
      {
        question: "Pourquoi choisir l'arbitrage ?",
        answer:
          "Confidentialité, spécialisation des arbitres, flexibilité procédurale et efficacité dans les relations d'affaires internationales.",
      },
    ],
  },
  {
    slug: "negociation-contrats",
    title: "Négociation & contrats",
    intro:
      "Nous assistons à la négociation d'accords et de contrats pour sécuriser vos engagements et prévenir les litiges futurs.",
    situations: [
      "Contrats commerciaux",
      "Partenariats et joint-ventures",
      "Accords d'investissement",
      "Conventions institutionnelles",
      "Renégociation de clauses sensibles",
    ],
    accompaniment: [
      "Préparation de la négociation",
      "Analyse des risques juridiques",
      "Rédaction et relecture contractuelle",
      "Appui jusqu'à la signature",
    ],
    faqs: [
      {
        question: "Intervenez-vous avant la signature d'un contrat ?",
        answer:
          "Oui. Une intervention en amont permet souvent d'éviter des déséquilibres et des contentieux coûteux.",
      },
    ],
  },
  {
    slug: "accompagnement-entrepreneurs-investisseurs",
    title: "Entrepreneurs & investisseurs",
    intro:
      "Le cabinet propose un accompagnement institutionnel des entrepreneurs et investisseurs entre la Belgique et la République démocratique du Congo.",
    situations: [
      "Implantation ou expansion entre BE et RDC",
      "Sécurisation juridique des investissements",
      "Relations avec les administrations",
      "Partenariats commerciaux bilatéraux",
      "Prévention des risques juridiques locaux",
    ],
    accompaniment: [
      "Cartographie des enjeux juridiques",
      "Interface institutionnelle",
      "Conseil en droit belge et OHADA",
      "Suivi opérationnel du projet",
    ],
    faqs: [
      {
        question: "Accompagnez-vous les deux flux d'investissement ?",
        answer:
          "Oui. Nous intervenons pour les acteurs belges en RDC comme pour les acteurs congolais en Belgique.",
      },
    ],
  },
  {
    slug: "conseil-autorites-publiques",
    title: "Autorités publiques",
    intro:
      "RC Consulting conseille les autorités publiques en Belgique et en RDC pour la coordination de projets transversaux et la promotion des modes alternatifs de règlement des différends.",
    situations: [
      "Coordination de projets transversaux",
      "Promotion de la médiation et de l'arbitrage",
      "Appui à la gouvernance juridique",
      "Partenariats institutionnels",
      "Politiques publiques liées au règlement des différends",
    ],
    accompaniment: [
      "Conseil stratégique",
      "Appui à la conception de dispositifs",
      "Coordination multi-acteurs",
      "Formation et sensibilisation aux MARD",
    ],
    faqs: [
      {
        question: "Travaillez-vous avec des institutions publiques ?",
        answer:
          "Oui. Nous accompagnons des autorités publiques belges et congolaises sur des projets transversaux et la promotion des MARD.",
      },
    ],
  },
];

export function getPractice(slug: string) {
  return practiceContents.find((p) => p.slug === slug);
}
