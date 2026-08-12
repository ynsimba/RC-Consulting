// Supabase Edge Function — envoi emails RDV (Resend)
// Secrets: RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO, ADMIN_NOTIFY_EMAIL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type AppointmentEmailType = "confirm" | "refuse" | "modify" | "new_request";

type AppointmentEmailVars = {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  modality: string;
  location: string;
  subject: string;
  staffName: string;
  description?: string;
  duration?: string;
  oldDate?: string;
  oldTime?: string;
  reason?: string;
};

const GOLD = "#b09060";
const INK = "#1a1a1a";
const MUTED = "#5c5c5c";
const LINE = "#e6e0d6";
const BG = "#f7f5f1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title: string, bodyHtml: string) {
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
              <p style="margin:16px 0 0;font-size:12px;color:${MUTED};">
                Cabinet d'arbitrage et de médiation · Belgique / RDC<br/>
                Cet email est envoyé automatiquement (ne pas répondre à l'adresse technique).
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailsList(items: Array<[string, string]>) {
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

function subjectFor(type: AppointmentEmailType, vars?: AppointmentEmailVars) {
  if (type === "confirm") {
    return "Confirmation de votre rendez-vous – RC Consulting";
  }
  if (type === "refuse") {
    return "Votre demande de rendez-vous – RC Consulting";
  }
  if (type === "new_request") {
    const who = vars?.visitorName?.trim() || "Nouveau client";
    const topic = vars?.subject?.trim() || "RDV";
    return `Nouvelle demande de RDV — ${who} — ${topic}`;
  }
  return "Modification de votre rendez-vous – RC Consulting";
}

function htmlFor(type: AppointmentEmailType, vars: AppointmentEmailVars) {
  const name = vars.visitorName.trim() || "Madame, Monsieur";

  if (type === "new_request") {
    return layout(
      "Nouvelle demande de rendez-vous",
      `
      <p style="margin:0 0 14px;">Bonjour,</p>
      <p style="margin:0 0 14px;">
        Une nouvelle demande de rendez-vous a été soumise sur le site RC Consulting.
        Statut actuel : <strong>en attente de confirmation</strong>.
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${GOLD};">
        Détails
      </p>
      ${detailsList([
        ["Client", name],
        ["Email", vars.visitorEmail],
        ["Téléphone", vars.visitorPhone?.trim() || "—"],
        ["Date", vars.appointmentDate],
        ["Heure", vars.appointmentTime],
        ["Durée", vars.duration?.trim() || "—"],
        ["Modalité", vars.modality],
        ["Objet", vars.subject],
      ])}
      ${
        vars.description?.trim()
          ? `<p style="margin:0 0 8px;font-size:14px;color:${MUTED};">Message</p>
             <p style="margin:0;white-space:pre-wrap;">${escapeHtml(vars.description.trim())}</p>`
          : ""
      }
      <p style="margin:16px 0 0;">
        Connectez-vous à l'administration pour confirmer, refuser ou modifier ce créneau.
      </p>
      `,
    );
  }

  if (type === "confirm") {
    return layout(
      "Confirmation de rendez-vous",
      `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(name)},</p>
      <p style="margin:0 0 14px;">
        Nous avons le plaisir de vous confirmer votre rendez-vous auprès de RC Consulting,
        cabinet d'arbitrage et de médiation.
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${GOLD};">
        Détails du rendez-vous
      </p>
      ${detailsList([
        ["Date", vars.appointmentDate],
        ["Heure", vars.appointmentTime],
        ["Modalité", vars.modality],
        ["Lieu ou lien de connexion", vars.location],
        ["Objet", vars.subject],
        ["Interlocuteur", vars.staffName],
      ])}
      <p style="margin:0 0 14px;">
        Merci de vous présenter quelques minutes avant l'heure prévue et de vous munir
        des documents utiles à votre dossier.
      </p>
      <p style="margin:0;">
        Si vous deviez modifier ou annuler ce rendez-vous, merci de nous en informer au plus tôt.
      </p>
      `,
    );
  }

  if (type === "refuse") {
    const reasonBlock = vars.reason?.trim()
      ? ` ${escapeHtml(vars.reason.trim())}`
      : "";
    return layout(
      "Demande de rendez-vous",
      `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(name)},</p>
      <p style="margin:0 0 14px;">
        Nous vous remercions pour votre demande de rendez-vous auprès de RC Consulting.
      </p>
      <p style="margin:0 0 14px;">
        Après vérification, nous ne sommes malheureusement pas en mesure de confirmer ce créneau.${reasonBlock}
      </p>
      <p style="margin:0;">
        Nous vous invitons à nous soumettre une nouvelle demande avec un autre créneau,
        ou à nous contacter directement.
      </p>
      `,
    );
  }

  return layout(
    "Modification de rendez-vous",
    `
    <p style="margin:0 0 14px;">Bonjour ${escapeHtml(name)},</p>
    <p style="margin:0 0 14px;">
      Nous vous informons qu'une modification a été apportée à votre rendez-vous
      initialement prévu le ${escapeHtml(vars.oldDate ?? "—")} à ${escapeHtml(vars.oldTime ?? "—")}.
    </p>
    <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${GOLD};">
      Nouveau créneau
    </p>
    ${detailsList([
      ["Date", vars.appointmentDate],
      ["Heure", vars.appointmentTime],
      ["Modalité", vars.modality],
      ["Lieu ou lien de connexion", vars.location],
      ["Interlocuteur", vars.staffName],
    ])}
    <p style="margin:0;">
      Merci de bien vouloir confirmer votre disponibilité en répondant à cet email.
    </p>
    `,
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const type = body?.type as AppointmentEmailType;
    const vars = body?.vars as AppointmentEmailVars;

    if (
      !type ||
      !["confirm", "refuse", "modify", "new_request"].includes(type)
    ) {
      return new Response(JSON.stringify({ error: "type invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!vars?.visitorEmail) {
      return new Response(JSON.stringify({ error: "visitorEmail manquant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // new_request : public (après prise de RDV). Autres types : admin uniquement.
    if (type !== "new_request") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Non authentifié" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Session invalide" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Accès réservé aux admins" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from =
      Deno.env.get("EMAIL_FROM") ??
      "RC Consulting <noreply@resend.dev>";
    const adminNotify =
      Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "yvesnsimba01@gmail.com";
    const defaultReplyTo = Deno.env.get("EMAIL_REPLY_TO") ?? undefined;

    const subject = subjectFor(type, vars);
    const html = htmlFor(type, vars);

    // Destinataire : admin pour new_request, client pour les autres.
    // Reply-To client pour new_request → l'admin peut répondre directement.
    const to =
      type === "new_request" ? [adminNotify] : [vars.visitorEmail];
    const replyTo =
      type === "new_request"
        ? vars.visitorEmail
        : defaultReplyTo;

    if (!apiKey) {
      console.log("[email:dev]", subject, "→", to);
      console.log(html);
      return new Response(
        JSON.stringify({ id: "dev-log", warning: "RESEND_API_KEY manquant" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const resendPayload: Record<string, unknown> = {
      from,
      to,
      subject,
      html,
    };
    if (replyTo) resendPayload.reply_to = replyTo;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resendJson = await resendRes.json();
    if (!resendRes.ok) {
      const msg =
        resendJson?.message ??
        resendJson?.error?.message ??
        "Échec Resend";
      console.error("[email] resend error", resendJson);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ id: resendJson.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[email] unexpected", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erreur serveur",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
