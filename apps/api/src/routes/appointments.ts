import { Router } from "express";
import {
  availabilityQuerySchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from "@rc/shared";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import {
  appointmentConfirmationHtml,
  sendEmail,
} from "../lib/email.js";
import {
  assertSlotAvailable,
  getAvailableSlots,
} from "../services/availability.js";
import { HttpError } from "../middleware/error.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const appointmentsRouter = Router();

appointmentsRouter.get("/availability", async (req, res, next) => {
  try {
    const query = availabilityQuerySchema.parse(req.query);
    const slots = await getAvailableSlots(query.date, query.duration);
    res.json({ date: query.date, duration: query.duration, slots });
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.post("/", async (req, res, next) => {
  try {
    const data = createAppointmentSchema.parse(req.body);
    const startsAt = new Date(data.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      throw new HttpError(400, "Date invalide");
    }

    await assertSlotAvailable(startsAt, data.duration);
    const endsAt = new Date(startsAt.getTime() + data.duration * 60_000);

    let client = await prisma.client.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.toLowerCase(),
          phone: data.phone,
          userId: req.user?.role === "CLIENT" ? req.user.id : undefined,
        },
      });
    } else {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        type: data.type,
        duration: data.duration,
        startsAt,
        endsAt,
        subject: data.subject,
        description: data.description,
        status: "CONFIRMED",
      },
      include: { client: true },
    });

    const manageUrl = `${env.webUrl}/rendez-vous/gerer#${appointment.manageToken}`;
    const notify = env.adminNotifyEmails;
    const recipients = [...new Set([client.email, ...notify])];

    try {
      await sendEmail({
        to: recipients,
        subject: "Confirmation de votre rendez-vous — RC Consulting",
        html: appointmentConfirmationHtml({
          name: `${client.firstName} ${client.lastName}`,
          startsAt,
          type: data.type,
          duration: data.duration,
          manageUrl,
        }),
      });

      await sendEmail({
        to: notify,
        subject: `Nouveau RDV — ${data.subject}`,
        html: `<p>Nouveau rendez-vous de ${client.firstName} ${client.lastName} (${client.email}, ${client.phone ?? "—"}) le ${startsAt.toLocaleString("fr-FR")}.</p>
      <p><strong>Sujet :</strong> ${data.subject}</p>
      <p>${data.description}</p>`,
      });
    } catch (mailError) {
      console.error("Email RDV non envoyé:", mailError);
    }

    try {
      await prisma.notification.create({
        data: {
          title: "Nouveau rendez-vous",
          body: `${client.firstName} ${client.lastName} — ${data.subject}`,
          link: `/admin/rendez-vous`,
        },
      });
    } catch (notifError) {
      console.error("Notification RDV non créée:", notifError);
    }

    res.status(201).json(appointment);
  } catch (error) {
    if (error instanceof Error && error.message === "Créneau indisponible") {
      return next(new HttpError(409, error.message));
    }
    next(error);
  }
});

appointmentsRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        OR: [{ userId: req.user!.id }, { email: req.user!.email }],
      },
    });
    if (!client) return res.json([]);

    const items = await prisma.appointment.findMany({
      where: { clientId: client.id },
      orderBy: { startsAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.get("/manage/:token", async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { manageToken: req.params.token },
      include: { client: true },
    });
    if (!appointment) throw new HttpError(404, "Rendez-vous introuvable");
    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.patch("/manage/:token", async (req, res, next) => {
  try {
    const existing = await prisma.appointment.findUnique({
      where: { manageToken: req.params.token },
      include: { client: true },
    });
    if (!existing) throw new HttpError(404, "Rendez-vous introuvable");

    const data = updateAppointmentSchema.parse(req.body);

    if (data.status === "CANCELLED") {
      const updated = await prisma.appointment.update({
        where: { id: existing.id },
        data: { status: "CANCELLED" },
        include: { client: true },
      });
      await sendEmail({
        to: [...new Set([existing.client.email, ...env.adminNotifyEmails])],
        subject: "Annulation de rendez-vous — RC Consulting",
        html: `<p>Votre rendez-vous du ${existing.startsAt.toLocaleString("fr-FR")} a été annulé.</p>`,
      });
      return res.json(updated);
    }

    const startsAt = data.startsAt ? new Date(data.startsAt) : existing.startsAt;
    const duration = data.duration ?? existing.duration;
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);

    if (data.startsAt || data.duration) {
      await assertSlotAvailable(startsAt, duration, existing.id);
    }

    const updated = await prisma.appointment.update({
      where: { id: existing.id },
      data: {
        type: data.type,
        duration,
        startsAt,
        endsAt,
        subject: data.subject,
        description: data.description,
        status: data.status,
      },
      include: { client: true },
    });

    await sendEmail({
      to: [...new Set([existing.client.email, ...env.adminNotifyEmails])],
      subject: "Modification de rendez-vous — RC Consulting",
      html: `<p>Votre rendez-vous a été modifié : ${startsAt.toLocaleString("fr-FR")}.</p>`,
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "Créneau indisponible") {
      return next(new HttpError(409, error.message));
    }
    next(error);
  }
});

appointmentsRouter.get("/", requireAdmin, async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const items = await prisma.appointment.findMany({
      where: status ? { status: status as never } : undefined,
      include: { client: true },
      orderBy: { startsAt: "asc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const data = updateAppointmentSchema.parse(req.body);
    const existing = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new HttpError(404, "Rendez-vous introuvable");

    const startsAt = data.startsAt ? new Date(data.startsAt) : existing.startsAt;
    const duration = data.duration ?? existing.duration;
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);

    const updated = await prisma.appointment.update({
      where: { id: existing.id },
      data: {
        type: data.type,
        duration,
        startsAt,
        endsAt,
        subject: data.subject,
        description: data.description,
        status: data.status,
      },
      include: { client: true },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
