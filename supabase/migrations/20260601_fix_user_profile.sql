-- Fix profile persistence: missing columns + auto-create public.users on signup

alter table public.users
  add column if not exists onboarding_completed boolean not null default false;

alter table public.users
  add column if not exists email_secondaire text;

-- Create public.users row from auth metadata (works even before email confirmation session)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name text := coalesce(meta->>'full_name', '');
  name_parts text[];
begin
  name_parts := string_to_array(trim(full_name), ' ');

  insert into public.users (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    promo,
    onboarding_completed,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    full_name,
    coalesce(name_parts[1], ''),
    coalesce(array_to_string(name_parts[2:array_length(name_parts, 1)], ' '), ''),
    coalesce(meta->>'phone', ''),
    coalesce(meta->>'promo', ''),
    false,
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when excluded.full_name <> '' then excluded.full_name else public.users.full_name end,
    first_name = case when excluded.first_name <> '' then excluded.first_name else public.users.first_name end,
    last_name = case when excluded.last_name <> '' then excluded.last_name else public.users.last_name end,
    phone = case when excluded.phone <> '' then excluded.phone else public.users.phone end,
    promo = case when excluded.promo <> '' then excluded.promo else public.users.promo end,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
