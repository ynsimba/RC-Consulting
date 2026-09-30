import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getAdminToken, setAdminToken } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  name?: string | null;
};

type Me = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

async function fetchMe(): Promise<Me | null> {
  if (!getAdminToken()) return null;
  try {
    return await api<Me>("/api/me");
  } catch {
    setAdminToken(null);
    return null;
  }
}

export function useAuth() {
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 30_000,
  });

  const profile = profileQuery.data;
  const user: AuthUser | undefined = profile
    ? {
        id: profile.id,
        email: profile.email,
        role: profile.role === "admin" ? "ADMIN" : "CLIENT",
        name:
          [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
          null,
      }
    : undefined;

  async function login(loginEmail: string, password: string) {
    const data = await api<{ token: string; user: Me }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: loginEmail, password }),
    });
    setAdminToken(data.token);
    qc.setQueryData(["auth", "me"], data.user);
  }

  async function logout() {
    try {
      await api("/api/logout", { method: "POST" });
    } catch {
      // Le jeton local est retiré même si l'API est injoignable.
    }
    setAdminToken(null);
    qc.setQueryData(["auth", "me"], null);
  }

  return {
    user,
    isLoading: profileQuery.isLoading,
    isAdmin: profile?.role === "admin",
    login,
    logout,
  };
}
