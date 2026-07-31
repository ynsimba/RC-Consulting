import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Appointment = {
  id: string;
  subject: string;
  startsAt: string;
  status: string;
  client: { firstName: string; lastName: string };
};

export default function AgendaPage() {
  const { data = [] } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: () => api<Appointment[]>("/api/appointments"),
  });

  const upcoming = useMemo(
    () =>
      data
        .filter(
          (a) =>
            new Date(a.startsAt) >= new Date() &&
            ["PENDING", "CONFIRMED"].includes(a.status),
        )
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        ),
    [data],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wide">Agenda</h1>
      <p className="mt-2 text-muted">Prochains rendez-vous confirmés ou en attente.</p>
      <ul className="mt-8 space-y-3">
        {upcoming.map((a) => (
          <li key={a.id} className="border border-line bg-white p-5">
            <p className="text-xs text-gold uppercase tracking-wide">{a.status}</p>
            <p className="mt-1 font-semibold">
              {new Date(a.startsAt).toLocaleString("fr-FR")} — {a.subject}
            </p>
            <p className="text-sm text-muted">
              {a.client.firstName} {a.client.lastName}
            </p>
          </li>
        ))}
        {upcoming.length === 0 && (
          <li className="text-muted">Aucun rendez-vous à venir.</li>
        )}
      </ul>
    </div>
  );
}
