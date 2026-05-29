-- Alumni schema: users + 7 linked tables
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  first_name text,
  last_name text,
  sexe text,
  date_naissance date,
  nationalite text,
  cip_ifu text,
  phone text,
  promo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.academic_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  annee_entree text,
  annee_sortie text,
  serie_filiere text,
  derniere_classe text,
  diplome_obtenu text,
  promotion_generation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profession text,
  fonction_actuelle text,
  employeur_structure text,
  domaine_activite text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  telephone_principal text,
  telephone_secondaire text,
  ville_residence text,
  pays_residence text,
  adresse_complete text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.amicale_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date_adhesion_amicale date,
  statut_membre text,
  situation_cotisations text,
  poste_amicale text,
  disponibilite_benevolat text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  whatsapp text,
  facebook text,
  linkedin text,
  autres_reseaux text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  competences_particulieres text,
  contribution_possible text,
  besoins_attentes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  photo text,
  document_url text,
  media_type text default 'photo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_academic_profiles_user on public.academic_profiles (user_id);
create index if not exists idx_professional_profiles_user on public.professional_profiles (user_id);
create index if not exists idx_locations_user on public.locations (user_id);
create index if not exists idx_amicale_memberships_user on public.amicale_memberships (user_id);
create index if not exists idx_social_links_user on public.social_links (user_id);
create index if not exists idx_observations_user on public.observations (user_id);
create index if not exists idx_media_user on public.media (user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.handle_updated_at();

create trigger trg_academic_profiles_updated_at
before update on public.academic_profiles
for each row execute function public.handle_updated_at();

create trigger trg_professional_profiles_updated_at
before update on public.professional_profiles
for each row execute function public.handle_updated_at();

create trigger trg_locations_updated_at
before update on public.locations
for each row execute function public.handle_updated_at();

create trigger trg_amicale_memberships_updated_at
before update on public.amicale_memberships
for each row execute function public.handle_updated_at();

create trigger trg_social_links_updated_at
before update on public.social_links
for each row execute function public.handle_updated_at();

create trigger trg_observations_updated_at
before update on public.observations
for each row execute function public.handle_updated_at();

create trigger trg_media_updated_at
before update on public.media
for each row execute function public.handle_updated_at();

alter table public.users enable row level security;
alter table public.academic_profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.locations enable row level security;
alter table public.amicale_memberships enable row level security;
alter table public.social_links enable row level security;
alter table public.observations enable row level security;
alter table public.media enable row level security;

create policy if not exists users_self_select on public.users
for select using (auth.uid() = id);
create policy if not exists users_self_update on public.users
for update using (auth.uid() = id) with check (auth.uid() = id);
create policy if not exists users_self_insert on public.users
for insert with check (auth.uid() = id);

create policy if not exists linked_self_select on public.academic_profiles for select using (auth.uid() = user_id);
create policy if not exists linked_self_update on public.academic_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists linked_self_insert on public.academic_profiles for insert with check (auth.uid() = user_id);

create policy if not exists linked_self_select_prof on public.professional_profiles for select using (auth.uid() = user_id);
create policy if not exists linked_self_update_prof on public.professional_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists linked_self_insert_prof on public.professional_profiles for insert with check (auth.uid() = user_id);

create policy if not exists linked_self_select_loc on public.locations for select using (auth.uid() = user_id);
create policy if not exists linked_self_update_loc on public.locations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists linked_self_insert_loc on public.locations for insert with check (auth.uid() = user_id);

create policy if not exists linked_self_select_am on public.amicale_memberships for select using (auth.uid() = user_id);
create policy if not exists linked_self_update_am on public.amicale_memberships for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists linked_self_insert_am on public.amicale_memberships for insert with check (auth.uid() = user_id);

create policy if not exists linked_self_select_soc on public.social_links for select using (auth.uid() = user_id);
create policy if not exists linked_self_update_soc on public.social_links for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists linked_self_insert_soc on public.social_links for insert with check (auth.uid() = user_id);

create policy if not exists linked_self_select_obs on public.observations for select using (auth.uid() = user_id);
create policy if not exists linked_self_update_obs on public.observations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists linked_self_insert_obs on public.observations for insert with check (auth.uid() = user_id);

create policy if not exists linked_self_select_med on public.media for select using (auth.uid() = user_id);
create policy if not exists linked_self_update_med on public.media for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists linked_self_insert_med on public.media for insert with check (auth.uid() = user_id);
