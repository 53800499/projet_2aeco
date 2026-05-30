"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProfileCompletion, ProfileRecord, useSupabaseProfile } from "@/hooks/useSupabaseProfile";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";

interface AuthProfileContextType {
  user: any | null;
  profile: ProfileRecord | null;
  loading: boolean;
  error: string | null;
  signIn: (input: { email: string; password: string }) => Promise<any>;
  signUp: (input: { email: string; password: string; full_name: string; phone?: string; promo?: string }) => Promise<any>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loadProfile: (userId?: string) => Promise<any>;
  saveProfile: (profile: ProfileRecord) => Promise<any>;
  profileCompletion: number;
}

const AuthProfileContext = createContext<AuthProfileContextType | null>(null);

export const AuthProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { loadProfile: loadProfileFromHook, saveProfile: saveProfileFromHook } = useSupabaseProfile();
  const supabase = useMemo(() => (hasSupabaseConfig ? getSupabaseBrowserClient() : null), []);

  const syncProfile = useCallback(async (currentUser: any) => {
    if (!currentUser?.id) return;

    const { data } = await loadProfileFromHook(currentUser.id);
    if (data) {
      setProfile(data);
    } else {
      setProfile({ id: currentUser.id, email: currentUser.email });
    }
  }, [loadProfileFromHook]);

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !data.session?.user) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser(data.session.user);
    await syncProfile(data.session.user);
    setLoading(false);
  }, [supabase, syncProfile]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    if (!supabase) throw new Error("La configuration Supabase n’est pas disponible.");

    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      throw signInError;
    }

    setUser(data.user);
    await syncProfile(data.user);
    setLoading(false);
    return data;
  }, [supabase, syncProfile]);

  const signUp = useCallback(async ({ email, password, full_name, phone, promo }: { email: string; password: string; full_name: string; phone?: string; promo?: string }) => {
    if (!supabase) throw new Error("La configuration Supabase n’est pas disponible.");

    setLoading(true);
    setError(null);

    /* const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/onboarding?step=identity`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/onboarding?step=identity`; */

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo: redirectTo,
        data: { full_name, phone: phone || "", promo: promo || "" },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      throw signUpError;
    }

    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        email,
        full_name,
        first_name: full_name.split(" ")[0] || "",
        last_name: full_name.split(" ").slice(1).join(" ") || "",
        phone: phone || "",
        promo: promo || "",
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      setUser(data.user);
      await syncProfile(data.user);
    }

    setLoading(false);
    return data;
  }, [supabase, syncProfile]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const loadProfile = useCallback(async (userId?: string) => {
    return loadProfileFromHook(userId);
  }, [loadProfileFromHook]);

  const saveProfile = useCallback(async (nextProfile: ProfileRecord) => {
    const { data } = await saveProfileFromHook(nextProfile);
    setProfile(data || nextProfile);
    return { data };
  }, [saveProfileFromHook]);

  const profileCompletion = useMemo(() => getProfileCompletion(profile || {}), [profile]);

  return (
    <AuthProfileContext.Provider value={{
      user,
      profile,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      refreshSession,
      loadProfile,
      saveProfile,
      profileCompletion,
    }}>
      {children}
    </AuthProfileContext.Provider>
  );
};

export const useAuthProfile = () => {
  const context = useContext(AuthProfileContext);
  if (!context) throw new Error("useAuthProfile must be used inside AuthProfileProvider");
  return context;
};
