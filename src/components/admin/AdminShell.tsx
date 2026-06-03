"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import { useIsAdmin } from "@/hooks/useAdminApi";
import { useAuthModal } from "@/app/context/AuthModalContext";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";
import { cn } from "@/lib/utils";
import Logo from "../Logo";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: "📊", match: (p: string) => p === "/admin" },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: "👥",
    match: (p: string) => p.startsWith("/admin/users"),
  },
  { href: "/admin/blogs", label: "Blogs", icon: "📝", match: (p: string) => p.startsWith("/admin/blogs") },
  {
    href: "/admin/plaquette",
    label: "Plaquette",
    icon: "📖",
    match: (p: string) => p.startsWith("/admin/plaquette"),
  },
];

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
              active
                ? "bg-primary text-white"
                : "text-midnight_text hover:bg-slate-100 dark:text-white dark:hover:bg-dark_border"
            )}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, refreshSession } = useAuthProfile();
  const isAdmin = useIsAdmin(profile);
  const { openSignIn } = useAuthModal();
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pageTitle =
    navItems.find((item) => item.match(pathname ?? ""))?.label ?? "Administration";

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen min-w-0 bg-slate-100 dark:bg-darkmode">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-6 dark:border-dark_border dark:bg-darklight lg:flex">
        <Link href="/" className="mb-8 block">
          <Logo className="justify-center" />
          <span className="mt-1 block text-center text-xl text-grey dark:text-white/60">
            Backoffice
          </span>
        </Link>
        <NavLinks pathname={pathname ?? ""} className="flex-1" />
        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-dark_border">
          <p className="truncate text-xs text-grey dark:text-white/60">{profile?.email}</p>
          <Link href="/profile" className="mt-2 block text-sm text-primary hover:underline">
            Mon profil
          </Link>
        </div>
      </aside>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer le menu"
            onClick={closeMenu}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100vw-3rem,18rem)] flex-col border-r border-slate-200 bg-white p-5 shadow-xl dark:border-dark_border dark:bg-darklight">
            <div className="mb-6 flex items-center justify-between gap-2">
              <Link href="/" onClick={closeMenu} className="min-w-0 flex-1">
                <Logo className="justify-start" />
                <span className="mt-1 block text-sm text-grey dark:text-white/60">
                  Backoffice
                </span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded-lg p-2 text-grey hover:bg-slate-100 dark:hover:bg-dark_border"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>
            <NavLinks pathname={pathname ?? ""} onNavigate={closeMenu} className="flex-1" />
            <div className="mt-auto border-t border-slate-200 pt-4 dark:border-dark_border">
              <p className="truncate text-xs text-grey dark:text-white/60">{profile?.email}</p>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="mt-2 block text-sm text-primary hover:underline"
              >
                Mon profil
              </Link>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-dark_border dark:bg-darklight sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-midnight_text hover:bg-slate-50 dark:border-dark_border dark:text-white dark:hover:bg-dark_border lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-midnight_text dark:text-white sm:text-lg">
              {pageTitle}
            </h1>
            <p className="hidden text-xs text-grey dark:text-white/60 sm:block">
              Administration — Répertoire alumni CEG2 Ouidah
            </p>
          </div>

          <Link
            href="/"
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5 dark:border-dark_border sm:text-sm"
          >
            <span className="hidden sm:inline">← Retour au site</span>
            <span className="sm:hidden">Site</span>
          </Link>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
