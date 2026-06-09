"use client";
/** @format */

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useAuthModal } from "@/app/context/AuthModalContext";
import { useAuthFeedback } from "@/hooks/useAuthFeedback";
import { AUTH_MESSAGES, formatAuthError } from "@/lib/auth-messages";
import Loader from "@/components/Common/Loader";
import { associationObjectives } from "@/app/api/data";
import { Eye, EyeOff } from "lucide-react";

const Contactform = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, signUp } = useAuthProfile();
  const { openSignIn } = useAuthModal();
  const { showSuccess, showError } = useAuthFeedback();
  const [showPassword, setShowPassword] = useState(false);

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

      if (result?.session) {
        showSuccess(AUTH_MESSAGES.registerSuccess);
        router.push("/profile");
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

  if (user) return null;

  return (
    <section
      className="overflow-x-hidden bg-darkmode dark:bg-darklight"
      id="inscription">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-12 grid-cols-1 md:gap-7 gap-0">
          {/* INFORMATIONS */}
          <div
            className="row-start-1 col-start-1 row-end-2 md:col-end-7 col-end-12"
            data-aos="fade-left"
            data-aos-delay="200"
            data-aos-duration="1000">
            <div className="flex gap-2 items-center justify-start">
              <span className="w-3 h-3 rounded-full bg-success"></span>
              <span className="font-medium text-sm text-white">
                communauté CEG 2 Ouidah
              </span>
            </div>

            <h2 className="sm:text-4xl text-[28px] leading-tight font-bold text-white py-12">
              Rejoignez le répertoire des anciens élèves du CEG 2 de Ouidah
            </h2>

            <div className="grid grid-cols-6 pb-12 border-b border-dark_border">
              <div className="col-span-3">
                <span className="text-white/50 text-lg">Téléphone</span>
                <p className="text-white text-lg">+229 00 00 00 00</p>
              </div>

              <div className="col-span-3">
                <span className="text-white/50 text-lg">Email</span>
                <p className="text-white text-lg">contact@ceg2ouidah.com</p>
              </div>

              <div className="col-span-6 pt-8">
                <span className="text-white/50 text-lg">Objectifs</span>
                <p className="text-white text-lg mt-2">
                  {associationObjectives.intro}
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside text-white/90 text-base">
                  {associationObjectives.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* <div className="pt-12">
              <p className="text-white/50 pb-4 text-base">
                {associationObjectives.intro}
              </p>

              <div className="flex items-center flex-wrap md:gap-14 gap-7">
                <Image
                  src="/images/contact/google-pay.png"
                  alt="logo"
                  width={100}
                  height={20}
                />
                <Image
                  src="/images/contact/stripe.png"
                  alt="logo"
                  width={100}
                  height={20}
                />
              </div>
            </div> */}
          </div>

          {/* FORMULAIRE */}
          <div
            data-aos="fade-right"
            data-aos-delay="200"
            data-aos-duration="1000"
            className="relative md:row-start-1 row-start-2 md:col-start-8 col-start-1 col-end-13">
            <div className="lg:mt-0 mt-8 bg-white dark:bg-darkmode max-w-[50rem] m-auto pt-[2.1875rem] pb-8 px-[2.375rem] rounded-md relative z-10">
              <h2 className="sm:text-3xl text-lg font-bold text-midnight_text mb-3 dark:text-white">
                Rejoindre le répertoire des anciens élèves
              </h2>
              <p className="text-sm text-gray-500 dark:text-white/60 mb-6">
                CEG 2 Ouidah — Crée ton profil et reconnecte-toi à ta promotion
                🎓
              </p>

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

                <div className="mb-6 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Mot de passe"
                    className="w-full rounded-md border px-5 py-3 bg-transparent dark:text-white pr-12"
                  />

                  {/* bouton toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ?
                      <EyeOff size={20} />
                    : <Eye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-md hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ?
                    "Création du compte..."
                  : "Rejoindre le répertoire"}{" "}
                  {loading && <Loader />}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4 text-center dark:text-white/50">
                En rejoignant, tu pourras être visible dans l’annuaire des
                anciens élèves du CEG 2 Ouidah.
              </p>

              <p className="text-center mt-4 text-sm dark:text-white/80">
                Déjà inscrit ?
                <button
                  type="button"
                  onClick={() => openSignIn()}
                  className="text-primary ml-2 hover:underline">
                  Se connecter
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contactform;
