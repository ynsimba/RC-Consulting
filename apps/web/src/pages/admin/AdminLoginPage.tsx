import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Icon } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const { user, isAdmin, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!isLoading && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="grid min-h-screen bg-[#f7f3ec] lg:grid-cols-[1fr_1.1fr]">
      {/* Panneau de marque */}
      <aside className="relative hidden overflow-hidden bg-brown-deep bg-[radial-gradient(90%_70%_at_10%_0%,rgba(196,163,90,0.22),transparent_60%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-gold-light to-gold-dark font-serif text-base font-semibold text-white">
            RC
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-wide">RC Consulting</p>
            <p className="text-[11px] font-medium tracking-[0.18em] text-gold uppercase">
              Back-office
            </p>
          </div>
        </div>
        <div className="max-w-md">
          <p className="font-serif text-4xl leading-tight">
            Gérez votre cabinet <span className="text-gold">en toute sérénité.</span>
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-white/60">
            Rendez-vous, agenda, clients et messages réunis dans un espace
            unique et sécurisé.
          </p>
        </div>
        <p className="text-[13px] text-white/35">
          © {new Date().getFullYear()} RC Consulting
        </p>
      </aside>

      {/* Formulaire */}
      <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-gold-light to-gold-dark font-serif text-base font-semibold text-white">
              RC
            </span>
            <p className="text-[15px] font-semibold text-ink">RC Consulting</p>
          </div>

          <p className="adm-eyebrow">Administration</p>
          <h1 className="mt-1 font-serif text-3xl text-ink">Connexion</h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Accédez à votre espace sécurisé.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const fd = new FormData(form);
              const email = String(fd.get("email") ?? "").trim();
              const password = String(fd.get("password") ?? "");

              setPending(true);
              setError("");

              try {
                await login(email, password);
                navigate("/admin", { replace: true });
              } catch (err) {
                setError(
                  err instanceof ApiError
                    ? err.message
                    : err instanceof Error
                      ? err.message
                      : "Erreur de connexion",
                );
              } finally {
                setPending(false);
              }
            }}
          >
            <label className="block">
              <span className="adm-label">Adresse email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                disabled={pending}
                className="adm-input !py-2.5"
                placeholder="vous@exemple.com"
              />
            </label>
            <div>
              <label htmlFor="admin-password" className="adm-label">
                Mot de passe
              </label>
              <PasswordInput
                id="admin-password"
                name="password"
                required
                autoComplete="current-password"
                disabled={pending}
                placeholder="••••••••"
                className="rounded-lg bg-white text-[15px] !py-2.5 outline-none transition focus:border-gold focus:ring-3 focus:ring-gold/20"
              />
            </div>
            {error && (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[15px] leading-relaxed whitespace-pre-wrap text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              className="adm-btn-primary w-full !py-2.5"
              disabled={pending}
            >
              {pending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <Icon name="arrowRight" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition hover:text-gold-dark"
            >
              <Icon name="chevronLeft" className="h-3.5 w-3.5" />
              Revenir au site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
