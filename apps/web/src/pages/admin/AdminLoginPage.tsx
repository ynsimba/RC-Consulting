import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const { user, isAdmin, login, isLoading } = useAuth();
  const [error, setError] = useState("");

  if (!isLoading && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-soft px-4 py-8">
      <form
        className="w-full max-w-md space-y-4 border border-line bg-white p-5 sm:p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          try {
            setError("");
            await login(String(fd.get("email")), String(fd.get("password")));
          } catch {
            setError("Identifiants invalides");
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
          className="w-full border border-line px-3 py-2.5 sm:px-4 sm:py-3"
          placeholder="Email"
        />
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-line px-3 py-2.5 sm:px-4 sm:py-3"
          placeholder="Mot de passe"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full sm:w-auto">
          Se connecter
        </Button>
      </form>
    </div>
  );
}
