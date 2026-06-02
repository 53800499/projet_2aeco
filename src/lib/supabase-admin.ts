import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const hasAdminConfig = Boolean(supabaseUrl && serviceRoleKey);

/** Client serveur avec droits élevés — jamais exposé au navigateur */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!hasAdminConfig) {
    throw new Error(
      "Configuration admin manquante : SUPABASE_SERVICE_ROLE_KEY requis."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

/** Vérifie le JWT utilisateur (anon key) */
export const getSupabaseUserClient = (accessToken: string) => {
  if (!supabaseUrl || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Configuration Supabase manquante.");
  }

  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
