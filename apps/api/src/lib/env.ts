import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.API_PORT ?? 4000),
  apiUrl: required("API_URL", "http://localhost:4000"),
  webUrl: required("WEB_URL", "http://localhost:5173"),
  authSecret: required("AUTH_SECRET", "dev-secret"),
  databaseUrl: required("DATABASE_URL"),
  adminEmail: required("ADMIN_EMAIL", "admin@rcconsulting.fr"),
  adminPassword: required("ADMIN_PASSWORD", "Admin123!"),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "RC Consulting <noreply@rcconsulting.fr>",
  adminNotifyEmail:
    process.env.ADMIN_NOTIFY_EMAIL ?? "yvesnsimba01@gmail.com",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },
  contact: {
    phone: process.env.CONTACT_PHONE ?? "+32476950655",
    email: process.env.CONTACT_EMAIL ?? "rc.consulting.pro@gmail.com",
    whatsapp: process.env.CONTACT_WHATSAPP ?? "32476950655",
    address:
      process.env.CONTACT_ADDRESS ??
      "Belgique · République démocratique du Congo",
    mapsEmbed:
      process.env.GOOGLE_MAPS_EMBED_URL ??
      "https://maps.google.com/maps?q=Bruxelles%20Belgique&t=&z=12&ie=UTF8&iwloc=&output=embed",
  },
};
