/** URL de gestion RDV : token dans le fragment (non envoyé aux logs serveur). */
export function manageAppointmentHref(token: string): string {
  return `/rendez-vous/gerer#${token}`;
}

export function readManageTokenFromLocation(
  hash = typeof window !== "undefined" ? window.location.hash : "",
): string | null {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw) return null;
  if (raw.startsWith("t=")) return raw.slice(2) || null;
  // Ignore query-like hashes
  if (raw.includes("=") && !raw.startsWith("t=")) return null;
  return raw || null;
}
