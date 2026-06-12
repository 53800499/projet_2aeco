-- Matricule membre : génération automatique à l'inscription

alter table public.users
  add column if not exists matricule text;

create unique index if not exists idx_users_matricule_unique
  on public.users (matricule)
  where matricule is not null and matricule <> '';

create sequence if not exists public.membership_matricule_seq start 1;

create or replace function public.next_matricule()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_val bigint;
  year_part text := to_char(now(), 'YYYY');
begin
  seq_val := nextval('public.membership_matricule_seq');
  return '2AECO-' || year_part || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

create or replace function public.assign_user_matricule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.matricule is null or btrim(new.matricule) = '' then
    new.matricule := public.next_matricule();
  end if;
  return new;
end;
$$;

drop trigger if exists assign_matricule_before_insert on public.users;
create trigger assign_matricule_before_insert
  before insert on public.users
  for each row
  execute function public.assign_user_matricule();

drop trigger if exists assign_matricule_before_update on public.users;
create trigger assign_matricule_before_update
  before update on public.users
  for each row
  when (new.matricule is null or btrim(new.matricule) = '')
  execute function public.assign_user_matricule();

-- Attribuer un matricule aux comptes existants
do $$
declare
  rec record;
begin
  for rec in
    select id
    from public.users
    where matricule is null or btrim(matricule) = ''
    order by created_at nulls last, id
  loop
    update public.users
    set matricule = public.next_matricule()
    where id = rec.id;
  end loop;
end;
$$;
