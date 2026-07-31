import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  name?: string | null;
};

export function useAuth() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        return await api<AuthUser>("/api/auth-local/me");
      } catch {
        return null as unknown as AuthUser;
      }
    },
    retry: false,
  });

  async function login(email: string, password: string) {
    await api<AuthUser>("/api/auth-local/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await qc.invalidateQueries({ queryKey: ["auth", "me"] });
  }

  async function logout() {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    await api("/api/auth-local/logout", { method: "POST" });
    qc.setQueryData(["auth", "me"], null);
    await qc.invalidateQueries({ queryKey: ["auth", "me"] });
  }

  return {
    user: query.data ?? undefined,
    isLoading: query.isLoading,
    isAdmin: query.data?.role === "ADMIN",
    login,
    logout,
  };
}
