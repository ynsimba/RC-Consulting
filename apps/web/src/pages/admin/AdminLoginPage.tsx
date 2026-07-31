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
    <div className="grid min-h-screen place-items-center bg-soft px-4">
      <form
        className="w-full max-w-md space-y-4 border border-line bg-white p-8"
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
        <h1 className="font-sans text-2xl font-bold uppercase tracking-wide">
          Admin
        </h1>
        <p className="text-sm text-muted">Connexion sécurisée au dashboard.</p>
        <input
          name="email"
          type="email"
          required
          defaultValue="admin@rcconsulting.fr"
          className="w-full border border-line px-4 py-3"
          placeholder="Email"
        />
        <input
          name="password"
          type="password"
          required
          className="w-full border border-line px-4 py-3"
          placeholder="Mot de passe"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit">Se connecter</Button>
      </form>
    </div>
  );
}
