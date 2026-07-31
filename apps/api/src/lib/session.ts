import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { env } from "./env.js";

const COOKIE = "rc_session";

export type SessionPayload = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  name?: string | null;
  exp: number;
};

function sign(payload: string) {
  return createHmac("sha256", env.authSecret).update(payload).digest("base64url");
}

export function createSessionToken(user: Omit<SessionPayload, "exp">, days = 7) {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE, { path: "/" });
}

export function readSession(req: Request): SessionPayload | null {
  const token = req.cookies?.[COOKIE];
  if (!token || typeof token !== "string") return null;
  return verifySessionToken(token);
}
