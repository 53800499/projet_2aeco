"use client";

import { FormEvent, useState } from "react";

interface AdminUserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    promo?: string;
    role?: string;
  }) => Promise<void>;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-dark_border dark:bg-darkmode dark:text-white";

export default function AdminUserCreateModal({
  open,
  onClose,
  onCreate,
}: AdminUserCreateModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await onCreate({
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        full_name: String(fd.get("full_name")),
        phone: String(fd.get("phone") || ""),
        promo: String(fd.get("promo") || ""),
        role: String(fd.get("role") || "member"),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-darklight">
        <h3 className="text-lg font-bold text-midnight_text dark:text-white">
          Créer un membre
        </h3>
        <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
          <input name="full_name" required placeholder="Nom complet" className={inputClass} />
          <input name="email" type="email" required placeholder="Email" className={inputClass} />
          <input name="password" type="password" required minLength={6} placeholder="Mot de passe" className={inputClass} />
          <input name="phone" placeholder="Téléphone" className={inputClass} />
          <input name="promo" placeholder="Promotion" className={inputClass} />
          <select name="role" className={inputClass}>
            <option value="member">Membre</option>
            <option value="admin">Administrateur</option>
          </select>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2 text-sm">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? "Création…" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
