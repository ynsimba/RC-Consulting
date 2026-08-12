import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey || url.includes("YOUR_PROJECT_REF")) {
  console.warn(
    "[supabase] Configure VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans apps/web/.env",
  );
}

export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
