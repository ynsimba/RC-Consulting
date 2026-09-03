import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { contactMessageSchema, type ContactMessageInput } from "@rc/shared";
import { supabase } from "@/lib/supabase";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { PhoneInput } from "@/components/ui/PhoneInput";
import {
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWhatsApp,
} from "@/components/ui/ContactIcons";
import { useLanguage } from "@/i18n/LanguageContext";

const CONTACT_EMAIL = "contact@rc-consulting-legal.com";
const WHATSAPP_URL = "https://wa.me/32476950655";

async function sendContactMessage(data: ContactMessageInput) {
  try {
    const { error } = await supabase.from("messages").insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw error;
    return { ok: true };
  } catch {
    // Secours si Supabase n'est pas encore branché
    const res = await fetch(
      `https://formsubmit.co/ajax/${CONTACT_EMAIL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone ?? "",
          subject: data.subject,
          message: data.message,
          _subject: `Contact RC Consulting — ${data.subject}`,
          _template: "table",
        }),
      },
    );
    if (!res.ok) throw new Error("send failed");
    return res.json();
  }
}

export default function ContactPage() {
  const { t } = useLanguage();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => reset(),
  });

  return (
    <>
      <Seo
        title={t.contact.seoTitle}
        description={t.contact.seoDesc}
        path="/contact"
      />
      <PageHero
        title={t.contact.heroTitle}
        subtitle={t.contact.heroSubtitle}
      />

      <section className="section-pad">
        <div className="container-rc grid gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionHeading
              align="left"
              eyebrow={t.contact.coordsEyebrow}
              title={t.contact.coordsTitle}
            />
            <ul className="space-y-5 text-muted">
              <li className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-gold">
                  <IconMapPin />
                </span>
                <div>
                  <strong className="text-ink">{t.contact.location}</strong>
                  <p className="mt-1 whitespace-pre-line">
                    {t.contact.locationValue}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-gold">
                  <IconPhone />
                </span>
                <div>
                  <strong className="text-ink">{t.contact.phone}</strong>
                  <p className="mt-1">
                    <a href="tel:+32476950655" className="hover:text-gold">
                      {t.contact.phoneValue}
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-gold">
                  <IconMail />
                </span>
                <div>
                  <strong className="text-ink">{t.contact.email}</strong>
                  <p className="mt-1">
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="hover:text-gold"
                    >
                      {t.contact.emailValue}
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-gold">
                  <IconWhatsApp />
                </span>
                <div>
                  <strong className="text-ink">{t.contact.whatsapp}</strong>
                  <p className="mt-1">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-gold"
                    >
                      {t.contact.whatsappValue}
                    </a>
                  </p>
                  <p className="mt-1">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold tracking-wide text-gold uppercase hover:underline"
                    >
                      {t.contact.whatsappCta} →
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-gold">
                  <IconClock />
                </span>
                <div>
                  <strong className="text-ink">{t.contact.hours}</strong>
                  <p className="mt-1">{t.contact.hoursValue}</p>
                </div>
              </li>
            </ul>
          </FadeIn>

          <FadeIn delay={0.1}>
            <SectionHeading
              align="left"
              eyebrow={t.contact.formEyebrow}
              title={t.contact.formTitle}
            />
            <form
              onSubmit={handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t.contact.firstName}
                  error={errors.firstName?.message}
                >
                  <input {...register("firstName")} className="field" />
                </Field>
                <Field
                  label={t.contact.lastName}
                  error={errors.lastName?.message}
                >
                  <input {...register("lastName")} className="field" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.contact.email} error={errors.email?.message}>
                  <input
                    type="email"
                    {...register("email")}
                    className="field"
                  />
                </Field>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      label={t.contact.phone}
                      name={field.name}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.phone?.message}
                    />
                  )}
                />
              </div>
              <Field label={t.contact.subject} error={errors.subject?.message}>
                <input {...register("subject")} className="field" />
              </Field>
              <Field label={t.contact.message} error={errors.message?.message}>
                <textarea rows={6} {...register("message")} className="field" />
              </Field>
              {mutation.isSuccess && (
                <p className="text-sm text-green-700" role="status">
                  {t.contact.success}
                </p>
              )}
              {mutation.isError && (
                <p className="text-sm text-red-700" role="alert">
                  {t.contact.error}
                </p>
              )}
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t.contact.sending : t.contact.send}
              </Button>
            </form>
          </FadeIn>
        </div>
      </section>

      <style>{`
        .field {
          width: 100%;
          border: 1px solid #e2d6c6;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          outline: none;
          background: #fff;
        }
        .field:focus {
          border-color: #c4a35a;
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-semibold tracking-wide text-ink uppercase">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
