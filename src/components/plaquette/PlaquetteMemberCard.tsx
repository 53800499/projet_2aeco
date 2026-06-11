"use client";

import { PlaquetteMember, getMemberDisplayName } from "@/lib/plaquette";
import { GraduationCap, MapPin, PhoneCall } from "lucide-react";

export default function PlaquetteMemberCard({ member }: { member: PlaquetteMember }) {
  const name = getMemberDisplayName(member);

  return (
    <article className="plaquette-card break-inside-avoid rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-dark_border dark:bg-darklight">
      <div className="plaquette-card__header flex gap-4">
        <div className="plaquette-card__photo h-41 w-41 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-dark_border">
          {member.photo ?
            <img
              src={member.photo}
              alt={name}
              className="h-full w-full object-cover"
            />
          : <div className="plaquette-card__initial flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
              {name[0]?.toUpperCase()}
            </div>
          }
        </div>
        <div className="plaquette-card__identity min-w-0 flex-1 border-l border-slate-200 pl-4 dark:border-dark_border">
          <h6 className="plaquette-card__name text-lg font-bold text-midnight_text dark:text-white">
            {name}
          </h6>
          {member.promo && (
            <p className="plaquette-card__promo text-xs font-semibold uppercase tracking-wide text-primary">
              Promo {member.promo}
            </p>
          )}
          {(member.ville_residence || member.pays_residence) && (
            <p className="plaquette-card__job mt-1 text-sm font-medium text-midnight_text dark:text-white/90">
              {[member.ville_residence, member.pays_residence]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}

          {member.whatsapp && (
            <p className="plaquette-card__job mt-1 text-sm font-medium text-midnight_text dark:text-white/90">
              {member.whatsapp}
            </p>
          )}

          {member.serie_filiere && (
            <p className="plaquette-card__job mt-1 text-sm font-medium text-midnight_text dark:text-white/90">
              {[
                member.derniere_classe,
                member.serie_filiere,
                member.diplome_obtenu
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {member.profession && (
            <p className="plaquette-card__job mt-1 text-sm font-medium text-midnight_text dark:text-white/90">
              {member.profession}
              {member.fonction_actuelle ? ` — ${member.fonction_actuelle}` : ""}
            </p>
          )}
          {member.employeur_structure && (
            <p className="plaquette-card__employer text-xs text-grey dark:text-white/60">
              {member.employeur_structure}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
