import type { FaqRecord } from "@/lib/localizeFaq";

/** FAQ de secours quand l'API n'est pas disponible (hébergement front seul). */
export const STATIC_FAQ: FaqRecord[] = [
  {
    id: "static-1",
    question: "Dans quels pays intervenez-vous ?",
    answer:
      "RC Consulting exerce ses activités principalement en Belgique et en République démocratique du Congo.\n\nPour d'autres litiges internationaux, n'hésitez pas à nous contacter pour une solution sur mesure.",
    questionEn: "In which countries do you operate?",
    answerEn:
      "RC Consulting operates primarily in Belgium and in the Democratic Republic of the Congo.\n\nFor other international disputes, please contact us for a tailored solution.",
  },
  {
    id: "static-2",
    question: "Quels droits pratiquez-vous ?",
    answer:
      "RC Consulting pratique le droit belge et le droit OHADA.\n\nPour d'autres litiges concernant le droit congolais ou d'autres droits nationaux, n'hésitez pas à nous contacter.",
    questionEn: "Which areas of law do you practise?",
    answerEn:
      "RC Consulting practises Belgian law and OHADA law.\n\nFor other disputes involving Congolese law or other national laws, please contact us.",
  },
  {
    id: "static-3",
    question: "Proposez-vous la médiation et l'arbitrage ?",
    answer:
      "Me Charlotte Richard intervient en tant que Médiateur et Arbitre dans vos litiges civils et commerciaux.\n\nLa négociation et la rédaction d'accords ou de clauses compromissoires fait partie de nos services.\n\nNous intervenons également pour l'homologation de vos accords de médiation ou l'exéquatur de vos sentences arbitrales.",
    questionEn: "Do you offer mediation and arbitration?",
    answerEn:
      "Me Charlotte Richard acts as Mediator and Arbitrator in your civil and commercial disputes.\n\nNegotiating and drafting agreements or arbitration clauses is part of our services.\n\nWe also act for the homologation of your mediation agreements or the enforcement of your arbitral awards.",
  },
  {
    id: "static-4",
    question: "Accompagnez-vous les entrepreneurs et investisseurs ?",
    answer:
      "RC Consulting accompagne tant les particuliers que les investisseurs et entrepreneurs.\n\nNous offrons aux professionnels une prise en charge globale depuis l'élaboration des projets jusqu'à leur concrétisation, du point de vue juridique mais aussi institutionnel et pratique.",
    questionEn: "Do you support entrepreneurs and investors?",
    answerEn:
      "RC Consulting supports individuals as well as investors and entrepreneurs.\n\nWe offer professionals comprehensive support from the design of projects through to their completion, from a legal standpoint as well as an institutional and practical one.",
  },
  {
    id: "static-5",
    question: "Conseillez-vous les autorités publiques ?",
    answer:
      "RC Consulting intervient comme consultant pour les autorités publiques en Belgique et en République démocratique du Congo dans le cadre de la gestion de projets institutionnels et de l'amélioration des politiques publiques.",
    questionEn: "Do you advise public authorities?",
    answerEn:
      "RC Consulting acts as a consultant for public authorities in Belgium and the Democratic Republic of the Congo in the management of institutional projects and the improvement of public policies.",
  },
];
