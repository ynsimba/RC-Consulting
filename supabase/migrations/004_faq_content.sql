-- Textes officiels de la FAQ
-- À exécuter dans le SQL Editor Supabase

update public.faqs
set
  answer = 'RC Consulting exerce ses activités principalement en Belgique et en République démocratique du Congo.

Pour d''autres litiges internationaux, n''hésitez pas à nous contacter pour une solution sur mesure.',
  answer_en = 'RC Consulting operates primarily in Belgium and in the Democratic Republic of the Congo.

For other international disputes, please contact us for a tailored solution.',
  updated_at = now()
where question = 'Dans quels pays intervenez-vous ?';

update public.faqs
set
  answer = 'RC Consulting pratique le droit belge et le droit OHADA.

Pour d''autres litiges concernant le droit congolais ou d''autres droits nationaux, n''hésitez pas à nous contacter.',
  answer_en = 'RC Consulting practises Belgian law and OHADA law.

For other disputes involving Congolese law or other national laws, please contact us.',
  updated_at = now()
where question = 'Quels droits pratiquez-vous ?';

update public.faqs
set
  answer = 'Me Charlotte Richard intervient en tant que Médiateur et Arbitre dans vos litiges civils et commerciaux.

La négociation et la rédaction d''accords ou de clauses compromissoires fait partie de nos services.

Nous intervenons également pour l''homologation de vos accords de médiation ou l''exéquatur de vos sentences arbitrales.',
  answer_en = 'Me Charlotte Richard acts as Mediator and Arbitrator in your civil and commercial disputes.

Negotiating and drafting agreements or arbitration clauses is part of our services.

We also act for the homologation of your mediation agreements or the enforcement of your arbitral awards.',
  updated_at = now()
where question = 'Proposez-vous la médiation et l''arbitrage ?';

update public.faqs
set
  answer = 'RC Consulting accompagne tant les particuliers que les investisseurs et entrepreneurs.

Nous offrons aux professionnels une prise en charge globale depuis l''élaboration des projets jusqu''à leur concrétisation, du point de vue juridique mais aussi institutionnel et pratique.',
  answer_en = 'RC Consulting supports individuals as well as investors and entrepreneurs.

We offer professionals comprehensive support from the design of projects through to their completion, from a legal standpoint as well as an institutional and practical one.',
  updated_at = now()
where question = 'Accompagnez-vous les entrepreneurs et investisseurs ?';

update public.faqs
set
  answer = 'RC Consulting intervient comme consultant pour les autorités publiques en Belgique et en République démocratique du Congo dans le cadre de la gestion de projets institutionnels et de l''amélioration des politiques publiques.',
  answer_en = 'RC Consulting acts as a consultant for public authorities in Belgium and the Democratic Republic of the Congo in the management of institutional projects and the improvement of public policies.',
  updated_at = now()
where question = 'Conseillez-vous les autorités publiques ?';
