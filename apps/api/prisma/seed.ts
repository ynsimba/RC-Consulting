import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (
    process.env.ADMIN_EMAIL ?? "admin@rc-consulting-legal.com"
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "RC",
    },
  });

  const windows = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "12:30" },
    { dayOfWeek: 1, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 2, startTime: "09:00", endTime: "12:30" },
    { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 3, startTime: "09:00", endTime: "12:30" },
    { dayOfWeek: 3, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 4, startTime: "09:00", endTime: "12:30" },
    { dayOfWeek: 4, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 5, startTime: "09:00", endTime: "12:30" },
    { dayOfWeek: 5, startTime: "14:00", endTime: "17:00" },
  ];

  for (const w of windows) {
    await prisma.availability.upsert({
      where: {
        dayOfWeek_startTime_endTime: {
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
        },
      },
      update: { isActive: true },
      create: { ...w, isActive: true },
    });
  }

  const categories = [
    { name: "Droit belge", slug: "droit-belge" },
    { name: "Droit OHADA", slug: "droit-ohada" },
    { name: "Médiation & Arbitrage", slug: "mediation-arbitrage" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  const belge = await prisma.category.findUnique({
    where: { slug: "droit-belge" },
  });
  const ohada = await prisma.category.findUnique({
    where: { slug: "droit-ohada" },
  });
  const mard = await prisma.category.findUnique({
    where: { slug: "mediation-arbitrage" },
  });

  const articles = [
    {
      title: "Investir entre la Belgique et la RDC : sécuriser le cadre juridique",
      slug: "investir-belgique-rdc",
      excerpt:
        "Les points essentiels pour structurer un projet d'investissement entre la Belgique et la République démocratique du Congo.",
      content: `<p>Les opérations entre la Belgique et la RDC mobilisent à la fois le droit belge et le droit OHADA.</p>
<p>RC Consulting accompagne entrepreneurs et investisseurs dans la sécurisation contractuelle et institutionnelle de leurs projets.</p>`,
      categoryId: belge?.id,
      published: true,
    },
    {
      title: "Droit OHADA : ce que les entreprises doivent anticiper",
      slug: "droit-ohada-entreprises",
      excerpt:
        "Comprendre les enjeux du droit des affaires OHADA pour sécuriser vos opérations en RDC et dans l'espace OHADA.",
      content: `<p>Le droit OHADA harmonise une part importante du droit des affaires en Afrique.</p>
<p>Notre cabinet vous aide à anticiper les risques juridiques et à structurer vos contrats avec rigueur.</p>`,
      categoryId: ohada?.id,
      published: true,
    },
    {
      title: "Médiation et arbitrage : prévenir et résoudre autrement",
      slug: "mediation-arbitrage-mard",
      excerpt:
        "Les modes alternatifs de règlement des différends comme levier de prévention et de résolution des litiges civils ou commerciaux.",
      content: `<p>La médiation et l'arbitrage offrent des voies confidentielles, rapides et adaptées aux relations d'affaires.</p>
<p>RC Consulting intervient pour prévenir les conflits et accompagner leur résolution alternative.</p>`,
      categoryId: mard?.id,
      published: true,
    },
  ];

  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        published: true,
        publishedAt: new Date(),
        categoryId: a.categoryId ?? null,
      },
      create: {
        ...a,
        publishedAt: new Date(),
        seoTitle: a.title,
        seoDescription: a.excerpt,
        coverImage:
          "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      },
    });
  }

  await prisma.faq.deleteMany();
  await prisma.faq.createMany({
    data: [
      {
        question: "Dans quels pays intervenez-vous ?",
        answer:
          "RC Consulting exerce ses activités principalement en Belgique et en République démocratique du Congo.\n\nPour d'autres litiges internationaux, n'hésitez pas à nous contacter pour une solution sur mesure.",
        questionEn: "In which countries do you operate?",
        answerEn:
          "RC Consulting operates primarily in Belgium and in the Democratic Republic of the Congo.\n\nFor other international disputes, please contact us for a tailored solution.",
        order: 1,
        published: true,
        category: "Général",
      },
      {
        question: "Quels droits pratiquez-vous ?",
        answer:
          "RC Consulting pratique le droit belge et le droit OHADA.\n\nPour d'autres litiges concernant le droit congolais ou d'autres droits nationaux, n'hésitez pas à nous contacter.",
        questionEn: "Which areas of law do you practise?",
        answerEn:
          "RC Consulting practises Belgian law and OHADA law.\n\nFor other disputes involving Congolese law or other national laws, please contact us.",
        order: 2,
        published: true,
        category: "Général",
      },
      {
        question: "Proposez-vous la médiation et l'arbitrage ?",
        answer:
          "Me Charlotte Richard intervient en tant que Médiateur et Arbitre dans vos litiges civils et commerciaux.\n\nLa négociation et la rédaction d'accords ou de clauses compromissoires fait partie de nos services.\n\nNous intervenons également pour l'homologation de vos accords de médiation ou l'exéquatur de vos sentences arbitrales.",
        questionEn: "Do you offer mediation and arbitration?",
        answerEn:
          "Me Charlotte Richard acts as Mediator and Arbitrator in your civil and commercial disputes.\n\nNegotiating and drafting agreements or arbitration clauses is part of our services.\n\nWe also act for the homologation of your mediation agreements or the enforcement of your arbitral awards.",
        order: 3,
        published: true,
        category: "MARD",
      },
      {
        question: "Accompagnez-vous les entrepreneurs et investisseurs ?",
        answer:
          "RC Consulting accompagne tant les particuliers que les investisseurs et entrepreneurs.\n\nNous offrons aux professionnels une prise en charge globale depuis l'élaboration des projets jusqu'à leur concrétisation, du point de vue juridique mais aussi institutionnel et pratique.",
        questionEn: "Do you support entrepreneurs and investors?",
        answerEn:
          "RC Consulting supports individuals as well as investors and entrepreneurs.\n\nWe offer professionals comprehensive support from the design of projects through to their completion, from a legal standpoint as well as an institutional and practical one.",
        order: 4,
        published: true,
        category: "Affaires",
      },
      {
        question: "Conseillez-vous les autorités publiques ?",
        answer:
          "RC Consulting intervient comme consultant pour les autorités publiques en Belgique et en République démocratique du Congo dans le cadre de la gestion de projets institutionnels et de l'amélioration des politiques publiques.",
        questionEn: "Do you advise public authorities?",
        answerEn:
          "RC Consulting acts as a consultant for public authorities in Belgium and the Democratic Republic of the Congo in the management of institutional projects and the improvement of public policies.",
        order: 5,
        published: true,
        category: "Institutions",
      },
    ],
  });

  console.log("Seed OK — admin:", adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
