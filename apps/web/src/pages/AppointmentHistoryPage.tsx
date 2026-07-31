import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";

type Appointment = {
  id: string;
  subject: string;
  startsAt: string;
  status: string;
  type: string;
  duration: number;
  manageToken: string;
};

export default function AppointmentHistoryPage() {
  const { user, isLoading: authLoading, login } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["appointments-me"],
    queryFn: () => api<Appointment[]>("/api/appointments/me"),
    enabled: !!user,
  });

  return (
    <>
      <Seo
        title="Historique des rendez-vous"
        description="Consultez l'historique de vos rendez-vous."
        path="/rendez-vous/historique"
      />
      <PageHero title="Historique" subtitle="Vos rendez-vous RC Consulting." />
      <section className="section-pad">
        <div className="container-rc max-w-3xl">
          {authLoading && <p>Chargement…</p>}
          {!authLoading && !user && (
            <LoginForm
              onSubmit={async (email, password) => {
                await login(email, password);
              }}
            />
          )}
          {user && (
            <>
              {isLoading && <p className="text-muted">Chargement…</p>}
              <ul className="space-y-4">
                {data.map((a) => (
                  <li key={a.id} className="border border-line p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs tracking-wide text-gold uppercase">
                          {a.status}
                        </p>
                        <h2 className="mt-1 font-bold uppercase">{a.subject}</h2>
                        <p className="mt-2 text-sm text-muted">
                          {new Date(a.startsAt).toLocaleString("fr-FR")} — {a.type} —{" "}
                          {a.duration} min
                        </p>
                      </div>
                      <Link
                        to={`/rendez-vous/gerer/${a.manageToken}`}
                        className="text-sm text-gold uppercase tracking-wide"
                      >
                        Gérer
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              {!isLoading && data.length === 0 && (
                <p className="text-muted">Aucun rendez-vous pour le moment.</p>
              )}
              <div className="mt-8">
                <Button to="/rendez-vous">Nouveau rendez-vous</Button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function LoginForm({
  onSubmit,
}: {
  onSubmit: (email: string, password: string) => Promise<void>;
}) {
  const [error, setError] = useState("");
  return (
    <form
      className="mx-auto max-w-md space-y-4 border border-line p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
          setError("");
          await onSubmit(String(fd.get("email")), String(fd.get("password")));
        } catch {
          setError("Identifiants invalides");
        }
      }}
    >
      <h2 className="text-lg font-bold uppercase tracking-wide">Connexion</h2>
      <p className="text-sm text-muted">
        Connectez-vous pour consulter votre historique.
      </p>
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full border border-line px-4 py-3"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Mot de passe"
        className="w-full border border-line px-4 py-3"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit">Se connecter</Button>
    </form>
  );
}
