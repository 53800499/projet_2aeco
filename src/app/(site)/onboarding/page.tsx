"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** L’onboarding a été remplacé par la complétion du profil. */
export default function OnboardingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return null;
}
