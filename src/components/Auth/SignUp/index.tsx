/** @format */

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loader from "@/components/Common/Loader";
import { useAuthModal } from "@/app/context/AuthModalContext";
import Logo from "@/components/Layout/Header/Logo";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { AUTH_MESSAGES, formatAuthError } from "@/lib/auth-messages";

const SignUp = ({ signUpOpen }: { signUpOpen?: (open: boolean) => void }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { openSignIn, closeSignUp } = useAuthModal();
  const { signUp } = useAuthProfile();
  const { showSuccess, showError } = useAuthFeedback();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData(e.currentTarget);
      const value = Object.fromEntries(data.entries()) as Record<string, string>;

      const result = await signUp({
        email: value.email,
        password: value.password,
        full_name: value.name,
        phone: value.phone,
        promo: value.promo,
      });

      signUpOpen?.(false);
      closeSignUp();

      if (result?.session) {
        showSuccess(AUTH_MESSAGES.registerSuccess);
        router.push("/onboarding?step=identity");
        return;
      }

      const msg = formatAuthError(
        "Email not confirmed",
        "Compte créé mais connexion impossible. Désactivez la confirmation email dans Supabase (Auth → Email) pour un accès immédiat."
      );
      setError(msg);
      showError(msg);
    } catch (err: unknown) {
      const msg = formatAuthError(err, "Impossible de créer votre compte.");
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center">
          <Logo logoColor="/images/logo/Logo.png" />
        </div>
        <h2 className="text-xl font-bold mt-4 text-midnight_text dark:text-white">
          Rejoindre le répertoire des anciens élèves
        </h2>
        <p className="text-sm text-gray-500 dark:text-white/60 mt-2">
          CEG 2 Ouidah — Crée ton profil et reconnecte-toi à ta promotion 🎓
        </p>
      </div>
      {error && (
        <div className="mb-4 text-red-600 text-center bg-red-100 dark:bg-red-900 w-full rounded-md border px-5 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-[18px]">
          <input
            type="text"
            name="name"
            required
            placeholder="Nom complet"
            className="w-full rounded-md border px-5 py-3 bg-transparent dark:text-white"
          />
        </div>

        <div className="mb-[18px]">
          <input
            type="email"
            name="email"
            required
            placeholder="Adresse email"
            className="w-full rounded-md border px-5 py-3 bg-transparent dark:text-white"
          />
        </div>

        <div className="mb-[18px]">
          <input
            type="tel"
            name="phone"
            required
            placeholder="Numéro WhatsApp"
            className="w-full rounded-md border px-5 py-3 bg-transparent dark:text-white"
          />
        </div>

        <div className="mb-[18px]">
          <input
            type="text"
            name="promo"
            required
            placeholder="Année ou promotion (ex: 2018-2019)"
            className="w-full rounded-md border px-5 py-3 bg-transparent dark:text-white"
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            name="password"
            required
            placeholder="Mot de passe"
            className="w-full rounded-md border px-5 py-3 bg-transparent dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Création du compte..." : "Rejoindre le répertoire"}{" "}
          {loading && <Loader />}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center dark:text-white/50">
        En rejoignant, tu pourras être visible dans l’annuaire des anciens
        élèves du CEG 2 Ouidah.
      </p>

      <p className="text-center mt-4 text-sm">
        Déjà inscrit ?
        <button
          type="button"
          onClick={() => {
            signUpOpen?.(false);
            closeSignUp();
            openSignIn();
          }}
          className="text-primary ml-2 hover:underline">
          Se connecter
        </button>
      </p>
    </div>
  );
};

export default SignUp;
