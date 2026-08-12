import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function AdminLoginPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!isLoading && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-soft px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <form
          className="w-full space-y-4 border border-line bg-white p-5 sm:p-8"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            const email = String(fd.get("email") ?? "").trim();
            const password = String(fd.get("password") ?? "");

            setPending(true);
            setError("");

            try {
              const { data, error: authError } =
                await supabase.auth.signInWithPassword({ email, password });

              if (authError) {
                setError(
                  authError.message.includes("Invalid login")
                    ? "Identifiants invalides"
                    : authError.message,
                );
                return;
              }

              const uid = data.user?.id;
              if (!uid) {
                setError("Connexion impossible (session vide).");
                return;
              }

              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", uid)
                .maybeSingle();

              if (profileError) {
                setError(`Profil inaccessible : ${profileError.message}`);
                await supabase.auth.signOut();
                return;
              }

              if (profile?.role !== "admin") {
                await supabase.auth.signOut();
                setError(
                  "Ce compte n'a pas les droits administrateur. Dans Supabase SQL : update profiles set role = 'admin' where email = '…';",
                );
                return;
              }

              navigate("/admin", { replace: true });
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Erreur de connexion",
              );
            } finally {
              setPending(false);
            }
          }}
        >
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
              Administration
            </p>
            <h1 className="mt-1 font-sans text-xl font-bold tracking-wide uppercase sm:text-2xl">
              Connexion
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Accès sécurisé au dashboard.
            </p>
          </div>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            disabled={pending}
            className="w-full border border-line px-3 py-2.5 sm:px-4 sm:py-3 disabled:opacity-60"
            placeholder="Email"
          />
          <PasswordInput
            name="password"
            required
            autoComplete="current-password"
            disabled={pending}
            placeholder="Mot de passe"
          />
          {error && (
            <p className="text-sm leading-relaxed text-red-700 whitespace-pre-wrap">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
            {pending ? "Connexion…" : "Se connecter"}
          </Button>
        </form>

        <p className="text-center">
          <Link
            to="/"
            className="text-xs font-semibold tracking-wide text-muted uppercase transition hover:text-gold"
          >
            ← Revenir à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
