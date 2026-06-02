"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useIsAdmin } from "@/hooks/useAdminApi";
import { useAuthModal } from "@/app/context/AuthModalContext";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";
import { cn } from "@/lib/utils";
import Logo from "../Logo";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: "📊" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { href: "/admin/blogs", label: "Blogs", icon: "📝" },
  { href: "/admin/plaquette", label: "Plaquette", icon: "📖" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, refreshSession } = useAuthProfile();
  const isAdmin = useIsAdmin(profile);
  const { openSignIn } = useAuthModal();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const verify = async () => {
      await refreshSession();
      setChecked(true);
    };
    void verify();
  }, [refreshSession]);

  useEffect(() => {
    if (!checked || loading) return;
    if (!user) openSignIn();
    else if (!isAdmin) router.replace("/");
  }, [checked, loading, user, isAdmin, openSignIn, router]);

  if (!checked || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-darkmode">
        <SpinnerScreen />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-darkmode">
        <p className="text-center text-grey dark:text-white/70">
          Accès administrateur requis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-darkmode">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-6 dark:border-dark_border dark:bg-darklight lg:flex">
        <Link href="/" className="mb-8 block">
          <Logo logoColor="/images/logo/Logo.png" />
          <span className="mt-1 block text-xl text-center text-grey dark:text-white/60">
            Backoffice
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  ? "bg-primary text-white"
                  : "text-midnight_text hover:bg-slate-100 dark:text-white dark:hover:bg-dark_border"
              )}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-dark_border">
          <p className="truncate text-xs text-grey dark:text-white/60">
            {profile?.email}
          </p>
          <Link
            href="/profile"
            className="mt-2 block text-sm text-primary hover:underline">
            Mon profil
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-dark_border dark:bg-darklight lg:px-8">
          <div className="flex gap-2 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  pathname.startsWith(item.href)
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-dark_border"
                )}>
                {item.label}
              </Link>
            ))}
          </div>
          <h1 className="hidden text-lg font-semibold text-midnight_text dark:text-white lg:block">
            Administration — Répertoire alumni
          </h1>
          <Link
            href="/"
            className="text-sm text-primary hover:underline">
            ← Retour au site
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
