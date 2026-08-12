#!/usr/bin/env node
/**
 * Script manuel : génère / envoie les 3 emails RDV avec données factices.
 *
 * Usage :
 *   node scripts/send-test-appointment-emails.mjs           # dry-run (stdout)
 *   RESEND_API_KEY=re_xxx node scripts/send-test-appointment-emails.mjs --send
 *
 * Variables :
 *   RESEND_API_KEY   (requis avec --send)
 *   EMAIL_FROM       (défaut: RC Consulting <onboarding@resend.dev>)
 *   EMAIL_REPLY_TO   (optionnel)
 *   TEST_TO          (destinataire, défaut: EMAIL_REPLY_TO ou votre boîte)
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "tmp", "email-previews");

const GOLD = "#b09060";
const INK = "#1a1a1a";
const MUTED = "#5c5c5c";
const LINE = "#e6e0d6";
const BG = "#f7f5f1";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Georgia,'Times New Roman',serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${LINE};">
          <tr>
            <td style="padding:28px 28px 12px;border-bottom:1px solid ${LINE};">
              <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${GOLD};font-weight:700;">RC Consulting</p>
              <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;font-weight:700;color:${INK};">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;font-size:16px;line-height:1.65;color:${INK};">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-size:14px;line-height:1.6;color:${MUTED};">
              <p style="margin:0;">Cordialement,<br/>L'équipe RC Consulting</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailsList(items) {
  const rows = items
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:6px 0;vertical-align:top;width:42%;font-size:14px;color:${MUTED};">${escapeHtml(label)}</td>
          <td style="padding:6px 0;vertical-align:top;font-size:14px;color:${INK};font-weight:600;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};">${rows}</table>`;
}

const sample = {
  visitorName: "Jean Dupont",
  appointmentDate: "lundi 20 avril 2026",
  appointmentTime: "10:30",
  modality: "présentiel",
  location: "Clos des Rosacées, 4 – 1080 Bruxelles",
  subject: "Médiation commerciale",
  staffName: "Me Charlotte Richard",
  oldDate: "vendredi 17 avril 2026",
  oldTime: "14:00",
  reason: "Le créneau demandé n'est plus disponible.",
};

const emails = [
  {
    type: "confirm",
    subject: "Confirmation de votre rendez-vous – RC Consulting",
    html: layout(
      "Confirmation de rendez-vous",
      `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(sample.visitorName)},</p>
      <p style="margin:0 0 14px;">
        Nous avons le plaisir de vous confirmer votre rendez-vous auprès de RC Consulting,
        cabinet d'arbitrage et de médiation.
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${GOLD};">
        Détails du rendez-vous
      </p>
      ${detailsList([
        ["Date", sample.appointmentDate],
        ["Heure", sample.appointmentTime],
        ["Modalité", sample.modality],
        ["Lieu ou lien de connexion", sample.location],
        ["Objet", sample.subject],
        ["Interlocuteur", sample.staffName],
      ])}
      <p style="margin:0 0 14px;">
        Merci de vous présenter quelques minutes avant l'heure prévue et de vous munir
        des documents utiles à votre dossier.
      </p>
      <p style="margin:0;">
        Si vous deviez modifier ou annuler ce rendez-vous, merci de nous en informer au plus tôt.
      </p>
      `,
    ),
  },
  {
    type: "refuse",
    subject: "Votre demande de rendez-vous – RC Consulting",
    html: layout(
      "Demande de rendez-vous",
      `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(sample.visitorName)},</p>
      <p style="margin:0 0 14px;">
        Nous vous remercions pour votre demande de rendez-vous auprès de RC Consulting.
      </p>
      <p style="margin:0 0 14px;">
        Après vérification, nous ne sommes malheureusement pas en mesure de confirmer ce créneau. ${escapeHtml(sample.reason)}
      </p>
      <p style="margin:0;">
        Nous vous invitons à nous soumettre une nouvelle demande avec un autre créneau,
        ou à nous contacter directement.
      </p>
      `,
    ),
  },
  {
    type: "modify",
    subject: "Modification de votre rendez-vous – RC Consulting",
    html: layout(
      "Modification de rendez-vous",
      `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(sample.visitorName)},</p>
      <p style="margin:0 0 14px;">
        Nous vous informons qu'une modification a été apportée à votre rendez-vous
        initialement prévu le ${escapeHtml(sample.oldDate)} à ${escapeHtml(sample.oldTime)}.
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${GOLD};">
        Nouveau créneau
      </p>
      ${detailsList([
        ["Date", sample.appointmentDate],
        ["Heure", sample.appointmentTime],
        ["Modalité", sample.modality],
        ["Lieu ou lien de connexion", sample.location],
        ["Interlocuteur", sample.staffName],
      ])}
      <p style="margin:0;">
        Merci de bien vouloir confirmer votre disponibilité en répondant à cet email.
      </p>
      `,
    ),
  },
];

function loadDotEnv() {
  for (const rel of [".env", "apps/web/.env", "apps/api/.env"]) {
    try {
      const raw = readFileSync(join(root, rel), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (!m || process.env[m[1]]) continue;
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      /* ignore */
    }
  }
}

async function sendViaResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY manquant");
  const from =
    process.env.EMAIL_FROM || "RC Consulting <onboarding@resend.dev>";
  const replyTo = process.env.EMAIL_REPLY_TO;
  const payload = { from, to: [to], subject, html };
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || JSON.stringify(json));
  }
  return json;
}

async function main() {
  loadDotEnv();
  const doSend = process.argv.includes("--send");
  mkdirSync(outDir, { recursive: true });

  for (const email of emails) {
    const file = join(outDir, `${email.type}.html`);
    writeFileSync(file, email.html, "utf8");
    console.log(`[preview] ${email.type} → ${file}`);
    console.log(`          sujet: ${email.subject}`);
  }

  if (!doSend) {
    console.log("\nDry-run OK. Relancez avec --send pour envoyer via Resend.");
    return;
  }

  const to =
    process.env.TEST_TO ||
    process.env.EMAIL_REPLY_TO ||
    process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) {
    throw new Error("Définissez TEST_TO (destinataire de test)");
  }

  for (const email of emails) {
    const result = await sendViaResend({
      to,
      subject: `[TEST ${email.type}] ${email.subject}`,
      html: email.html,
    });
    console.log(`[sent] ${email.type} → ${to} id=${result.id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
