"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/app/context/AuthModalContext";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";

/** Ouvre la même modale de connexion que le bouton du header */
export default function SigninPage() {
  const { openSignIn } = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    openSignIn();
    router.replace("/");
  }, [openSignIn, router]);

  return (
    <main className="min-h-[50vh] flex items-center justify-center">
      <SpinnerScreen />
    </main>
  );
}
