"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProfileCompletion, ProfileRecord, withProfileCompletion } from "@/lib/profile";
import { useSupabaseProfile } from "@/hooks/useSupabaseProfile";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { formatAuthError } from "@/lib/auth-messages";

interface AuthProfileContextType {
  user: any | null;
  profile: ProfileRecord | null;
  loading: boolean;
  error: string | null;
  signIn: (input: { email: string; password: string }) => Promise<any>;
  signUp: (input: {
    email: string;
    password: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    promo?: string;
    profession?: string;
    parcours?: string;
  }) => Promise<any>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<any | null>;
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
      setProfile(withProfileCompletion(data));
    } else {
      setProfile(withProfileCompletion({ id: currentUser.id, email: currentUser.email }));
    }
  }, [loadProfileFromHook]);

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !data.session?.user) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return null;
    }

    setUser(data.session.user);
    await syncProfile(data.session.user);
    setLoading(false);
    return data.session.user;
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
      const message = formatAuthError(signInError);
      setError(message);
      setLoading(false);
      throw new Error(message);
    }

    setUser(data.user);
    await syncProfile(data.user);
    setLoading(false);
    return data;
  }, [supabase, syncProfile]);

  const signUp = useCallback(async ({
    email,
    password,
    full_name,
    first_name,
    last_name,
    phone,
    promo,
    profession,
    parcours,
  }: {
    email: string;
    password: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    promo?: string;
    profession?: string;
    parcours?: string;
  }) => {
    if (!supabase) throw new Error("La configuration Supabase n’est pas disponible.");

    setLoading(true);
    setError(null);

    /* const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/onboarding?step=identity`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/onboarding?step=identity`; */

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone: phone || "", promo: promo || "" },
      },
    });

    if (signUpError) {
      const message = formatAuthError(signUpError);
      setError(message);
      setLoading(false);
      throw new Error(message);
    }

    let session = signUpData.session;
    let activeUser = signUpData.user;

    // Connexion immédiate si la confirmation email est désactivée dans Supabase
    if (activeUser && !session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && signInData.session) {
        session = signInData.session;
        activeUser = signInData.user;
      }
    }

    if (activeUser && session) {
      const { error: profileError } = await supabase.from("users").upsert(
        {
          id: activeUser.id,
          email,
          full_name,
          first_name: first_name || full_name.split(" ")[0] || "",
          last_name: last_name || full_name.split(" ").slice(1).join(" ") || "",
          phone: phone || "",
          promo: promo || "",
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (profileError) {
        const message = formatAuthError(profileError, "Impossible d’enregistrer votre profil.");
        setError(message);
        setLoading(false);
        throw new Error(message);
      }

      if (profession) {
        await supabase.from("professional_profiles").upsert(
          { user_id: activeUser.id, profession },
          { onConflict: "user_id" }
        );
      }

      if (parcours) {
        await supabase.from("observations").upsert(
          { user_id: activeUser.id, contribution_possible: parcours },
          { onConflict: "user_id" }
        );
      }

      setUser(activeUser);
      await syncProfile(activeUser);
    }

    setLoading(false);
    return { ...signUpData, user: activeUser, session };
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
    setProfile(withProfileCompletion(data || nextProfile));
    return { data };
  }, [saveProfileFromHook]);

  const profileCompletion = useMemo(
    () => getProfileCompletion(profile ?? {}),
    [profile]
  );

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
