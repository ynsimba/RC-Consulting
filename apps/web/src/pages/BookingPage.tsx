import { forwardRef, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  createAppointmentSchema,
  type AppointmentDuration,
} from "@rc/shared";
import {
  createPublicAppointment,
  fetchAvailableSlots,
  fetchSettings,
} from "@/lib/bookings";
import {
  brusselsWallToIso,
  nextWeekday,
  startOfLocalDay,
  toLocalYmd,
} from "@/lib/datetime";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { useLanguage } from "@/i18n/LanguageContext";

const FALLBACK_DURATIONS: AppointmentDuration[] = [30, 60, 90];
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
      .min(8, "Numéro de téléphone incomplet")
      .max(30)
      .refine(
        (v) => /^\+[1-9]\d{7,14}$/.test(v.replace(/[\s().-]/g, "")),
        "Numéro de téléphone invalide",
      ),
    description: z
      .string()
      .min(5, "Description trop courte (5 caractères min.)")
      .max(5000),
  });
type BookingFormValues = z.infer<typeof bookingFormSchema>;

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-0.5 block text-[10px] font-semibold tracking-wide text-muted uppercase">
      {children}
    </span>
  );
}

export default function BookingPage() {
  const { lang, t } = useLanguage();
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const minDate = useMemo(() => nextWeekday(today, 1), [today]);
  const maxDate = useMemo(() => {
    const d = new Date(
      today.getFullYear(),
      today.getMonth() + MAX_MONTHS_AHEAD,
      today.getDate(),
    );
    return startOfLocalDay(d);
  }, [today]);

  const [duration, setDuration] = useState<AppointmentDuration>(60);
  const [date, setDate] = useState(toLocalYmd(minDate));
  const [viewYear, setViewYear] = useState(minDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(minDate.getMonth());
  const [time, setTime] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["booking-settings"],
    queryFn: fetchSettings,
  });

  const durations = (settingsQuery.data?.allowed_durations?.length
    ? settingsQuery.data.allowed_durations
    : FALLBACK_DURATIONS) as AppointmentDuration[];

  const monthCells = useMemo(
    () => getMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const weekdayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, 1 + i);
      return d.toLocaleDateString(locale, { weekday: "narrow" });
    });
  }, [locale]);

  const canGoPrev =
    monthKey(viewYear, viewMonth) >
    monthKey(minDate.getFullYear(), minDate.getMonth());
  const canGoNext =
    monthKey(viewYear, viewMonth) <
    monthKey(maxDate.getFullYear(), maxDate.getMonth());

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function isSelectable(d: Date) {
    const day = d.getDay();
    if (day === 0 || day === 6) return false;
    const t0 = startOfLocalDay(d).getTime();
    return t0 >= minDate.getTime() && t0 <= maxDate.getTime();
  }

  const slotsQuery = useQuery({
    queryKey: ["slots", date, duration],
    queryFn: () => fetchAvailableSlots(date, duration),
  });

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      description: "",
    },
  });

  const fieldErrors = form.formState.errors;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const showFormErrorBanner =
    form.formState.isSubmitted && (hasFieldErrors || Boolean(slotError));

  const mutation = useMutation({
    mutationFn: async (data: BookingFormValues & { startsAt: string }) => {
      const appt = await createPublicAppointment({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        description: data.description,
        duration,
        startsAt: data.startsAt,
      });
      return {
        manageToken: appt.manage_token,
        startsAt: appt.starts_at,
      };
    },
    onSuccess: () => {
      setConfirmed(true);
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
      startsAt: brusselsWallToIso(date, time),
    });
  }

  function onInvalid() {
    if (!time) setSlotError(t.booking.selectSlot);
  }

  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }, [date, locale]);

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
      <PageHero compact title={t.booking.heroTitle} subtitle={t.booking.heroSubtitle} />

      <section className="bg-soft/40 py-4 md:py-6">
        <div className="container-rc max-w-5xl">
          <div className="border border-line bg-white">
            {/* Barre résumé + durée */}
            <div className="flex flex-col gap-3 border-b border-line px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <div
                className="flex w-full rounded-sm border border-line p-0.5 sm:inline-flex sm:w-auto"
                role="group"
                aria-label={t.booking.step1}
              >
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDuration(d);
                      setTime(null);
                      setSlotError(null);
                    }}
                    className={`min-h-10 flex-1 px-2 py-2 text-xs font-semibold tracking-wide transition sm:min-w-[4.25rem] sm:flex-none sm:px-3 sm:py-1.5 ${
                      duration === d
                        ? "bg-gold text-white"
                        : "text-ink hover:bg-soft"
                    }`}
                  >
                    {d} {t.booking.minutes}
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-muted sm:text-right">
                <span className="font-semibold text-ink">{selectedDateLabel}</span>
                {time ? (
                  <>
                    {" · "}
                    <span className="font-semibold text-gold">{time}</span>
                  </>
                ) : (
                  <span className="text-muted"> · —:—</span>
                )}
                {" · "}
                <span className="font-semibold text-ink">
                  {duration} {t.booking.minutes}
                </span>
              </p>
            </div>

            {/* Planning + formulaire */}
            <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
              {/* Colonne planning */}
              <div className="grid gap-0 border-b border-line sm:grid-cols-2 lg:border-r lg:border-b-0">
                {/* Calendrier */}
                <div className="border-b border-line p-3 sm:border-r sm:border-b-0 sm:p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => shiftMonth(-1)}
                      disabled={!canGoPrev}
                      aria-label={t.booking.prevMonth}
                      className="inline-flex h-7 w-7 items-center justify-center border border-line text-sm text-ink transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <p className="font-sans text-[11px] font-bold tracking-wide text-ink uppercase">
                      {new Date(viewYear, viewMonth, 1).toLocaleDateString(
                        locale,
                        { month: "long", year: "numeric" },
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => shiftMonth(1)}
                      disabled={!canGoNext}
                      aria-label={t.booking.nextMonth}
                      className="inline-flex h-7 w-7 items-center justify-center border border-line text-sm text-ink transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-px">
                    {weekdayLabels.map((label, i) => (
                      <div
                        key={`${label}-${i}`}
                        className="py-0.5 text-center text-[9px] font-semibold tracking-wide text-muted uppercase"
                      >
                        {label}
                      </div>
                    ))}
                    {monthCells.map((d, i) => {
                      if (!d) {
                        return <div key={`empty-${i}`} className="h-7" />;
                      }
                      const ymd = toLocalYmd(d);
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
                          className={`h-7 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-25 ${
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

                {/* Créneaux */}
                <div className="flex min-h-[11rem] flex-col p-3 sm:p-3.5">
                  <p className="mb-2 text-[10px] font-semibold tracking-wide text-muted uppercase">
                    {t.booking.step3}
                  </p>
                  {slotsQuery.isLoading && (
                    <p className="text-xs text-muted">{t.booking.loadingSlots}</p>
                  )}
                  {slotsQuery.isError && (
                    <p className="text-xs leading-relaxed text-red-700" role="alert">
                      {t.booking.slotsError}
                    </p>
                  )}
                  {!slotsQuery.isLoading &&
                    !slotsQuery.isError &&
                    (slotsQuery.data?.length ?? 0) === 0 && (
                      <p className="text-xs leading-relaxed text-muted">
                        {t.booking.noSlots}
                      </p>
                    )}
                  <div className="flex max-h-[16rem] flex-col gap-1.5 overflow-y-auto overscroll-contain pr-0.5 sm:grid sm:max-h-[12.5rem] sm:grid-cols-2 sm:gap-1.5 lg:grid-cols-3">
                    {(slotsQuery.data ?? []).map((slot: string) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setTime(slot);
                          setSlotError(null);
                        }}
                        className={`min-h-11 w-full border px-3 py-2.5 text-left text-sm font-semibold transition sm:min-h-0 sm:px-1.5 sm:py-1.5 sm:text-center sm:text-xs ${
                          time === slot
                            ? "border-gold bg-gold text-white"
                            : "border-line hover:border-gold"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {slotError && (
                    <p className="mt-2 text-xs text-red-700" role="alert">
                      {slotError}
                    </p>
                  )}
                </div>
              </div>

              {/* Colonne formulaire */}
              <div className="border-t border-line p-4 sm:border-t-0 sm:p-3.5 md:p-5">
                <p className="mb-3 text-[10px] font-semibold tracking-wide text-muted uppercase sm:mb-2">
                  {t.booking.step4}
                </p>
                <form
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-2.5 sm:gap-y-2.5"
                  onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                  noValidate
                >
                  <Input
                    label={t.booking.firstName}
                    autoComplete="given-name"
                    error={form.formState.errors.firstName?.message}
                    {...form.register("firstName")}
                  />
                  <Input
                    label={t.booking.lastName}
                    autoComplete="family-name"
                    error={form.formState.errors.lastName?.message}
                    {...form.register("lastName")}
                  />
                  <Input
                    label={t.booking.email}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
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
                        compact
                      />
                    )}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label={t.booking.subject}
                      error={form.formState.errors.subject?.message}
                      {...form.register("subject")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm">
                      <FieldLabel>{t.booking.description}</FieldLabel>
                      <textarea
                        rows={3}
                        className="min-h-[5.5rem] w-full border border-line px-3 py-2.5 text-base leading-relaxed focus:border-gold focus:outline-none sm:min-h-0 sm:px-2.5 sm:py-1.5 sm:text-sm"
                        {...form.register("description")}
                      />
                      {form.formState.errors.description && (
                        <span className="mt-1 block text-[11px] text-red-600">
                          {form.formState.errors.description.message}
                        </span>
                      )}
                    </label>
                  </div>
                  {showFormErrorBanner && (
                    <p
                      className="text-xs leading-relaxed text-red-700 sm:col-span-2"
                      role="alert"
                    >
                      {hasFieldErrors ? t.booking.formInvalid : slotError}
                    </p>
                  )}
                  {mutation.isError && (
                    <p
                      className="text-xs leading-relaxed text-red-700 sm:col-span-2"
                      role="alert"
                    >
                      {(mutation.error as Error).message ===
                      "Créneau indisponible"
                        ? t.booking.slotTaken
                        : (mutation.error as Error).message}
                    </p>
                  )}
                  <div className="sticky bottom-0 -mx-4 mt-1 border-t border-line bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:col-span-2 sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0.5 sm:pb-0">
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="min-h-12 w-full text-sm sm:min-h-0 sm:w-auto sm:text-xs"
                    >
                      {mutation.isPending
                        ? t.booking.confirming
                        : t.booking.confirm}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
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
>(function Input({ label, error, className = "", ...props }, ref) {
  return (
    <label className="block text-sm">
      <FieldLabel>{label}</FieldLabel>
      <input
        ref={ref}
        className={`min-h-11 w-full border border-line px-3 py-2.5 text-base focus:border-gold focus:outline-none sm:min-h-0 sm:px-2.5 sm:py-1.5 sm:text-sm ${className}`}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-[11px] text-red-600">{error}</span>
      )}
    </label>
  );
});
