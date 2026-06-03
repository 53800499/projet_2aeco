-- Plaquette : éligibilité basée sur visibilité (plus sur onboarding_completed)

create or replace view public.plaquette_members as
select
  u.id,
  u.full_name,
  u.first_name,
  u.last_name,
  u.promo,
  u.phone,
  u.sexe,
  ap.serie_filiere,
  ap.derniere_classe,
  ap.diplome_obtenu,
  ap.annee_entree,
  ap.annee_sortie,
  pp.profession,
  pp.fonction_actuelle,
  pp.employeur_structure,
  l.ville_residence,
  l.pays_residence,
  sl.whatsapp,
  sl.linkedin,
  m.photo
from public.users u
left join public.academic_profiles ap on ap.user_id = u.id
left join public.professional_profiles pp on pp.user_id = u.id
left join public.locations l on l.user_id = u.id
left join public.social_links sl on sl.user_id = u.id
left join public.media m on m.user_id = u.id
where u.deleted_at is null
  and u.visible_in_plaquette = true;
