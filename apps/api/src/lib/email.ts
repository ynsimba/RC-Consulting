import { Resend } from "resend";
import { env } from "./env.js";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  bcc?: string | string[];
}) {
  if (!resend) {
    console.log("[email:dev]", options.subject, "→", options.to, options.bcc ? `bcc:${options.bcc}` : "");
    console.log(options.html);
    return { id: "dev-log" };
  }

  const result = await resend.emails.send({
    from: env.emailFrom,
    to: options.to,
    bcc: options.bcc,
    subject: options.subject,
    html: options.html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function appointmentConfirmationHtml(data: {
  name: string;
  startsAt: Date;
  type: string;
  duration: number;
  manageUrl: string;
}) {
  const when = data.startsAt.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  });
  return `
    <div style="font-family:Georgia,serif;color:#222">
      <h1 style="color:#b09060">RC Consulting</h1>
      <p>Bonjour ${data.name},</p>
      <p>Votre rendez-vous est confirmé :</p>
      <ul>
        <li><strong>Date :</strong> ${when}</li>
        <li><strong>Type :</strong> ${data.type}</li>
        <li><strong>Durée :</strong> ${data.duration} minutes</li>
      </ul>
      <p>
        <a href="${data.manageUrl}" style="background:#b09060;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px">
          Gérer mon rendez-vous
        </a>
      </p>
      <p>Cordialement,<br/>Le cabinet RC Consulting</p>
    </div>
  `;
}
