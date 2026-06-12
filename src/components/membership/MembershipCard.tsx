/** @format */

"use client";

import {
  formatMembershipRegistrationDate,
  getMembershipCardDisplayName
} from "@/lib/membership-card";
import { ProfileRecord } from "@/lib/profile";

const LOGO_SRC = "/images/logo/Logo1.png";

interface MembershipCardProps {
  profile: Partial<ProfileRecord>;
  className?: string;
  documentRoot?: boolean;
}

export default function MembershipCard({
  profile,
  className = "",
  documentRoot = false
}: MembershipCardProps) {
  const name = getMembershipCardDisplayName(profile);
  const registrationDate = formatMembershipRegistrationDate(profile.created_at);
  const matricule = profile.matricule?.trim() || "—";

  const rootClass =
    documentRoot ? `membership-card-document ${className}`.trim() : className;

  return (
    <div className={rootClass}>
      <article className="" aria-label={`Carte de membre de ${name}`}>
        <div className="membership-card">
          <div className="membership-card__photo-wrap">
            {profile.photo ?
              <img
                src={profile.photo}
                alt={`Photo de ${name}`}
                className="membership-card__photo"
              />
            : <div className="membership-card__photo-placeholder">Photo</div>}
          </div>

          <div className="membership-card__body">
            <header className="membership-card__header">
              <img
                src={LOGO_SRC}
                alt="Logo 2AECO"
                className="membership-card__logo"
              />
            </header>
            <p className="membership-card__org">
              Amicale des anciens élèves du CEG2 — Ouidah
            </p>

            <dl className="membership-card__fields">
              <div className="membership-card__field">
                <dt className="membership-card__label">Nom et prénom :</dt>
                <dd className="membership-card__value">{name}</dd>
              </div>
              <div className="membership-card__field">
                <dt className="membership-card__label">
                  Date d&apos;inscription :
                </dt>
                <dd className="membership-card__value">{registrationDate}</dd>
              </div>
              <div className="membership-card__field">
                <dt className="membership-card__label">N° matricule :</dt>
                <dd className="membership-card__value">{matricule}</dd>
              </div>
            </dl>
          </div>
        </div>
        
      </article>
    </div>
  );
}
