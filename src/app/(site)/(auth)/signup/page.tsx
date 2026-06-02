"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/app/context/AuthModalContext";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";

/** Ouvre la même modale d'inscription que le bouton du header */
export default function SignupPage() {
  const { openSignUp } = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    openSignUp();
    router.replace("/");
  }, [openSignUp, router]);

  return (
    <main className="min-h-[50vh] flex items-center justify-center">
      <SpinnerScreen />
    </main>
  );
}
