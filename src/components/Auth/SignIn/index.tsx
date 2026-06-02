/** @format */

"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/Layout/Header/Logo";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useAuthModal } from "@/app/context/AuthModalContext";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { AUTH_MESSAGES, formatAuthError } from "@/lib/auth-messages";
import Loader from "@/components/Common/Loader";

const Signin = ({ signInOpen }: { signInOpen?: (open: boolean) => void }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuthProfile();
  const { openSignUp, closeSignIn } = useAuthModal();
  const { showSuccess, showError } = useAuthFeedback();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn({
        email: identifier.trim(),
        password,
      });

      if (!result?.session) {
        const msg = AUTH_MESSAGES.loginFailed;
        setError(msg);
        showError(msg);
        return;
      }

      signInOpen?.(false);
      closeSignIn();
      showSuccess(AUTH_MESSAGES.loginSuccess);
    } catch (err: unknown) {
      const msg = formatAuthError(err, AUTH_MESSAGES.loginFailed);
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center mx-auto inline-block max-w-[180px]">
        <Logo logoColor="/images/logo/Logo.png" />
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold dark:text-white">Bon retour 👋</h2>
        <p className="text-gray dark:text-white/60 mt-3">
          Connectez-vous pour retrouver vos anciens camarades, consulter les
          promotions et rejoindre la communauté des anciens élèves du CEG 2
          Ouidah.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <input
            type="text"
            placeholder="Email ou numéro de téléphone"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-5 py-3 text-base dark:text-white focus:border-primary outline-none"
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-5 py-3 text-base dark:text-white focus:border-primary outline-none"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6 text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary py-3 text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Connexion..." : "Accéder à mon espace ancien élève"}{" "}
          {loading && <Loader />}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-base dark:text-white/70">
          Vous n’êtes pas encore inscrit ?
        </p>
        <button
          type="button"
          onClick={() => {
            signInOpen?.(false);
            closeSignIn();
            openSignUp();
          }}
          className="text-primary font-medium hover:underline">
          Rejoindre le répertoire des anciens élèves
        </button>
      </div>
    </>
  );
};

export default Signin;
