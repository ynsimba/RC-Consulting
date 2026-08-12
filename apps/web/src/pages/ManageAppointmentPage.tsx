import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAvailableSlots,
  getAppointmentByToken,
  manageAppointmentByToken,
} from "@/lib/bookings";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";

export default function ManageAppointmentPage() {
  const { token } = useParams();
  const qc = useQueryClient();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["manage", token],
    queryFn: () => getAppointmentByToken(token!),
    enabled: !!token,
  });

  const slotsQuery = useQuery({
    queryKey: ["manage-slots", date, data?.duration],
    queryFn: () => fetchAvailableSlots(date, data!.duration),
    enabled: !!date && !!data,
  });

  const cancelMutation = useMutation({
    mutationFn: () => manageAppointmentByToken(token!, "cancel"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manage", token] }),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      manageAppointmentByToken(
        token!,
        "reschedule",
        new Date(`${date}T${time}:00`).toISOString(),
        data?.duration,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manage", token] }),
  });

  if (isLoading) return <div className="container-rc py-24">Chargement…</div>;
  if (isError || !data) {
    return <div className="container-rc py-24">Rendez-vous introuvable.</div>;
  }

  const locked = ["cancelled", "refused", "completed"].includes(data.status);

  return (
    <>
      <Seo
        title="Gérer mon rendez-vous"
        description="Annuler ou modifier votre rendez-vous RC Consulting."
        path={`/rendez-vous/gerer/${token}`}
      />
      <PageHero compact title="Gérer mon rendez-vous" />
      <section className="section-pad">
        <div className="container-rc max-w-2xl space-y-8">
          <div className="border border-line p-6">
            <p className="text-sm tracking-wide text-gold uppercase">{data.status}</p>
            <h2 className="mt-2 text-xl font-bold uppercase">{data.subject}</h2>
            <p className="mt-3 text-muted">
              {new Date(data.starts_at).toLocaleString("fr-FR", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
            <p className="mt-1 text-sm text-muted">
              {data.type} — {data.duration} min
            </p>
            <p className="mt-4 text-muted">{data.description}</p>
          </div>

          {!locked && (
            <>
              <div className="space-y-4 border border-line p-6">
                <h3 className="font-bold tracking-wide uppercase">
                  Modifier le créneau
                </h3>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime("");
                  }}
                  className="w-full border border-line px-3 py-2"
                />
                <div className="flex flex-wrap gap-2">
                  {(slotsQuery.data ?? []).map((slot: string) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`border px-3 py-2 text-sm ${
                        time === slot
                          ? "border-gold bg-gold text-white"
                          : "border-line"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  disabled={!date || !time || updateMutation.isPending}
                  onClick={() => updateMutation.mutate()}
                >
                  Enregistrer
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  if (confirm("Annuler ce rendez-vous ?")) cancelMutation.mutate();
                }}
              >
                Annuler le rendez-vous
              </Button>
            </>
          )}
        </div>
      </section>
    </>
  );
}
