"use client";

import { useMemo } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";

interface SignUpInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  promo?: string;
}

interface SignInInput {
  email: string;
  password: string;
}

export const useSupabaseAuth = () => {
  const supabase = useMemo(() => {
    if (!hasSupabaseConfig) {
      return null;
    }

    try {
      return getSupabaseBrowserClient();
    } catch (error) {
      console.error("Supabase client initialization failed", error);
      return null;
    }
  }, []);

  const signUp = async ({ email, password, full_name, phone, promo }: SignUpInput) => {
    if (!supabase) {
      throw new Error("La configuration Supabase n’est pas disponible.");
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/profile`
        : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/profile`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name,
          phone: phone || "",
          promo: promo || "",
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("users").upsert(
        {
          id: data.user.id,
          email,
          full_name,
          first_name: full_name.split(" ")[0] || "",
          last_name: full_name.split(" ").slice(1).join(" ") || "",
          phone: phone || "",
          promo: promo || "",
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.warn("Profile upsert warning", profileError);
      }
    }

    return data;
  };

  const signIn = async ({ email, password }: SignInInput) => {
    if (!supabase) {
      throw new Error("La configuration Supabase n’est pas disponible.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const getSession = async () => {
    if (!supabase) {
      return { data: { session: null }, error: new Error("La configuration Supabase n’est pas disponible.") };
    }

    return supabase.auth.getSession();
  };

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error("La configuration Supabase n’est pas disponible.") };
    }

    return supabase.auth.signOut();
  };

  return {
    supabase,
    signUp,
    signIn,
    getSession,
    signOut,
  };
};
