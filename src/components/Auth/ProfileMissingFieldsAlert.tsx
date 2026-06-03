"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getMissingProfileFields, ProfileRecord } from "@/lib/profile";

interface ProfileMissingFieldsAlertProps {
  profile: Partial<ProfileRecord> | null;
  percent: number;
  maxItems?: number;
  className?: string;
}

export default function ProfileMissingFieldsAlert({
  profile,
  percent,
  maxItems = 8,
  className = "",
}: ProfileMissingFieldsAlertProps) {
  if (!profile || percent >= 100) return null;

  const missing = getMissingProfileFields(profile);
  if (missing.length === 0) return null;

  const shown = missing.slice(0, maxItems);
  const rest = missing.length - shown.length;

  return (
    <div
      role="alert"
      className={`rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm dark:border-amber-500/60 dark:bg-amber-950/40 ${className}`}
    >
      <div className="flex gap-3">
        <AlertCircle
          className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            {missing.length} champ{missing.length > 1 ? "s" : ""} à compléter
          </p>
          <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/80">
            Profil à {percent}% — renseignez les éléments ci-dessous pour apparaître
            dans le répertoire et la plaquette.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {shown.map(({ key, label }) => (
              <li key={key}>
                <Link
                  href={`/profile#field-${key}`}
                  className="inline-block rounded-full border border-amber-500/50 bg-white px-3 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-100 dark:bg-darkmode dark:text-amber-100 dark:hover:bg-amber-900/50"
                >
                  {label}
                </Link>
              </li>
            ))}
            {rest > 0 && (
              <li className="self-center text-xs font-medium text-amber-700 dark:text-amber-300">
                +{rest} autre{rest > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
