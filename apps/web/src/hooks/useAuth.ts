import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  name?: string | null;
};

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useAuth() {
  const qc = useQueryClient();
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user.id ?? null);
      setEmail(data.session?.user.email ?? null);
      setSessionReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      setSessionReady(true);
      void qc.invalidateQueries({ queryKey: ["auth", "profile"] });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [qc]);

  const profileQuery = useQuery({
    queryKey: ["auth", "profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: sessionReady && !!userId,
    retry: false,
  });

  const profile = profileQuery.data;
  const user: AuthUser | undefined =
    userId && email
      ? {
          id: userId,
          email,
          role: profile?.role === "admin" ? "ADMIN" : "CLIENT",
          name:
            [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
            null,
        }
      : undefined;

  async function login(loginEmail: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    if (error) throw error;
    await qc.invalidateQueries({ queryKey: ["auth"] });
  }

  async function logout() {
    await supabase.auth.signOut();
    qc.setQueryData(["auth", "profile", userId], null);
    await qc.invalidateQueries({ queryKey: ["auth"] });
  }

  return {
    user,
    isLoading: !sessionReady || (!!userId && profileQuery.isLoading),
    isAdmin: profile?.role === "admin",
    login,
    logout,
  };
}
