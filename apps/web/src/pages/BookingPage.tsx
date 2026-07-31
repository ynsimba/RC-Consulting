import { forwardRef, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  createAppointmentSchema,
  type AppointmentDuration,
} from "@rc/shared";
import { api } from "@/lib/api";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { useLanguage } from "@/i18n/LanguageContext";

const APPOINTMENT_TYPE = "CABINET" as const;
const durations: AppointmentDuration[] = [30, 60, 90];
const MAX_MONTHS_AHEAD = 6;

const bookingFormSchema = createAppointmentSchema
  .omit({
    type: true,
    duration: true,
    startsAt: true,
  })
  .extend({
    phone: z
      .string()
      .min(10, "Numéro de téléphone incomplet")
      .max(30)
      .regex(/^\+[1-9]\d{7,14}$/, "Numéro de téléphone invalide"),
    description: z
      .string()
      .min(5, "Description trop courte (5 caractères min.)")
      .max(5000),
  });
type BookingFormValues = z.infer<typeof bookingFormSchema>;

function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthKey(year: number, month: number) {
  return year * 12 + month;
}

/** Cells for a Mon–Sun calendar grid (null = empty padding). */
function getMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: startOffset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function StepTitle({ step, title }: { step: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-serif text-sm tracking-[0.2em] text-gold uppercase">
        {step}
      </span>
      <h2 className="font-sans text-lg font-bold tracking-wide text-ink uppercase md:text-xl">
        {title}
      </h2>
    </div>
  );
}

export default function BookingPage() {
  const { lang, t } = useLanguage();
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => addDays(today, 1), [today]);
  const maxDate = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + MAX_MONTHS_AHEAD, today.getDate());
    return startOfDay(d);
  }, [today]);

  const [duration, setDuration] = useState<AppointmentDuration>(60);
  const [date, setDate] = useState(toYmd(minDate));
  const [viewYear, setViewYear] = useState(minDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(minDate.getMonth());
  const [time, setTime] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    manageToken: string;
    startsAt: string;
  } | null>(null);

  const monthCells = useMemo(
    () => getMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const weekdayLabels = useMemo(() => {
    // Monday → Sunday labels for the current locale
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, 1 + i); // Mon 1 Jan 2024
      return d.toLocaleDateString(locale, { weekday: "short" });
    });
  }, [locale]);

  const canGoPrev =
    monthKey(viewYear, viewMonth) > monthKey(minDate.getFullYear(), minDate.getMonth());
  const canGoNext =
    monthKey(viewYear, viewMonth) < monthKey(maxDate.getFullYear(), maxDate.getMonth());

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function isSelectable(d: Date) {
    const day = d.getDay();
    if (day === 0 || day === 6) return false;
    const t = startOfDay(d).getTime();
    return t >= minDate.getTime() && t <= maxDate.getTime();
  }

  const slotsQuery = useQuery({
    queryKey: ["slots", date, duration],
    queryFn: () =>
      api<{ slots: string[] }>(
        `/api/appointments/availability?date=${date}&duration=${duration}&type=${APPOINTMENT_TYPE}`,
      ),
  });

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: BookingFormValues & { startsAt: string }) =>
      api<{ manageToken: string; startsAt: string }>("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          type: APPOINTMENT_TYPE,
          duration,
        }),
      }),
    onSuccess: (data) => {
      setConfirmed(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  function onSubmit(values: BookingFormValues) {
    if (!time) {
      setSlotError(t.booking.selectSlot);
      return;
    }
    setSlotError(null);
    mutation.mutate({
      ...values,
      phone: values.phone.replace(/\s/g, ""),
      startsAt: `${date}T${time}:00`,
    });
  }

  function onInvalid() {
    if (!time) setSlotError(t.booking.selectSlot);
  }

  if (confirmed) {
    return (
      <>
        <Seo
          title={t.booking.confirmedTitle}
          description={t.booking.confirmedSubtitle}
          path="/rendez-vous"
        />
        <PageHero
          compact
          title={t.booking.confirmedTitle}
          subtitle={t.booking.confirmedSubtitle}
        />
        <section className="py-10 md:py-14">
          <div className="container-rc max-w-xl text-center">
            <p className="text-lg text-muted">{t.booking.confirmedText}</p>
            <p className="mt-4 font-semibold">
              {new Date(confirmed.startsAt).toLocaleString(locale, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
            <div className="mt-8">
              <Button to={`/rendez-vous/gerer/${confirmed.manageToken}`}>
                {t.booking.manage}
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title={t.booking.seoTitle}
        description={t.booking.seoDesc}
        path="/rendez-vous"
      />
      <PageHero
        compact
        title={t.booking.heroTitle}
        subtitle={t.booking.heroSubtitle}
      />

      <section className="py-10 md:py-14">
        <div className="container-rc max-w-4xl space-y-8">
          <div>
            <StepTitle step="01" title={t.booking.step1} />
            <div className="flex flex-wrap gap-2.5">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDuration(d);
                    setTime(null);
                    setSlotError(null);
                  }}
                  className={`min-w-[92px] border px-4 py-2.5 text-sm font-semibold ${
                    duration === d
                      ? "border-gold bg-gold text-white"
                      : "border-line hover:border-gold"
                  }`}
                >
                  {d} {t.booking.minutes}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-6">
            <div>
              <StepTitle step="02" title={t.booking.step2} />
              <div className="border border-line bg-white p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    disabled={!canGoPrev}
                    aria-label={t.booking.prevMonth}
                    className="inline-flex h-9 w-9 items-center justify-center border border-line text-ink transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <p className="font-sans text-sm font-bold tracking-wide text-ink uppercase">
                    {new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    disabled={!canGoNext}
                    aria-label={t.booking.nextMonth}
                    className="inline-flex h-9 w-9 items-center justify-center border border-line text-ink transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weekdayLabels.map((label) => (
                    <div
                      key={label}
                      className="py-1 text-center text-[10px] font-semibold tracking-wide text-muted uppercase"
                    >
                      {label}
                    </div>
                  ))}
                  {monthCells.map((d, i) => {
                    if (!d) {
                      return <div key={`empty-${i}`} className="h-9" />;
                    }
                    const ymd = toYmd(d);
                    const selectable = isSelectable(d);
                    const selected = date === ymd;
                    return (
                      <button
                        key={ymd}
                        type="button"
                        disabled={!selectable}
                        onClick={() => {
                          setDate(ymd);
                          setTime(null);
                          setSlotError(null);
                        }}
                        className={`h-9 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${
                          selected
                            ? "bg-gold text-white"
                            : selectable
                              ? "text-ink hover:bg-gold/15"
                              : "text-muted"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <StepTitle step="03" title={t.booking.step3} />
              <div className="border border-line bg-white p-3 sm:p-4">
                {slotsQuery.isLoading && (
                  <p className="text-sm text-muted">{t.booking.loadingSlots}</p>
                )}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {(slotsQuery.data?.slots ?? []).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setTime(slot);
                        setSlotError(null);
                      }}
                      className={`border px-2 py-2.5 text-sm font-semibold ${
                        time === slot
                          ? "border-gold bg-gold text-white"
                          : "border-line hover:border-gold"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {!slotsQuery.isLoading &&
                  (slotsQuery.data?.slots.length ?? 0) === 0 && (
                    <p className="text-sm text-muted">{t.booking.noSlots}</p>
                  )}
                {slotError && (
                  <p className="mt-2 text-sm text-red-700" role="alert">
                    {slotError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <StepTitle step="04" title={t.booking.step4} />
            <form
              className="grid gap-3 md:grid-cols-2"
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}
              noValidate
            >
              <Input
                label={t.booking.firstName}
                error={form.formState.errors.firstName?.message}
                {...form.register("firstName")}
              />
              <Input
                label={t.booking.lastName}
                error={form.formState.errors.lastName?.message}
                {...form.register("lastName")}
              />
              <Input
                label={t.booking.email}
                type="email"
                error={form.formState.errors.email?.message}
                {...form.register("email")}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <PhoneInput
                    label={t.booking.phone}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={form.formState.errors.phone?.message}
                  />
                )}
              />
              <div className="md:col-span-2">
                <Input
                  label={t.booking.subject}
                  error={form.formState.errors.subject?.message}
                  {...form.register("subject")}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide">
                    {t.booking.description}
                  </span>
                  <textarea
                    rows={3}
                    className="w-full border border-line px-3 py-2.5 focus:border-gold focus:outline-none"
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <span className="mt-1 block text-xs text-red-600">
                      {form.formState.errors.description.message}
                    </span>
                  )}
                </label>
              </div>
              {(form.formState.isSubmitted && !form.formState.isValid) && (
                <p className="md:col-span-2 text-sm text-red-700" role="alert">
                  {t.booking.formInvalid}
                </p>
              )}
              {mutation.isError && (
                <p className="md:col-span-2 text-sm text-red-700" role="alert">
                  {(mutation.error as Error).message === "Créneau indisponible"
                    ? t.booking.slotTaken
                    : (mutation.error as Error).message}
                </p>
              )}
              <div className="md:col-span-2 pt-1">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending
                    ? t.booking.confirming
                    : t.booking.confirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(function Input({ label, error, ...props }, ref) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
      <input
        ref={ref}
        className="w-full border border-line px-3 py-2.5 focus:border-gold focus:outline-none"
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
