  -- Admin role & policies for backoffice

  alter table public.users
    add column if not exists role text not null default 'member';

  alter table public.users
    drop constraint if exists users_role_check;

  alter table public.users
    add constraint users_role_check check (role in ('member', 'admin'));

  create index if not exists idx_users_role on public.users(role);
  create index if not exists idx_users_onboarding on public.users(onboarding_completed);
  create index if not exists idx_users_created_at on public.users(created_at desc);

  create or replace function public.is_admin()
  returns boolean
  language sql
  security definer
  set search_path = public
  stable
  as $$
    select exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    );
  $$;

  -- Admins can read/update/delete all profiles
  drop policy if exists users_admin_select on public.users;
  create policy users_admin_select on public.users
    for select using (public.is_admin());

  drop policy if exists users_admin_update on public.users;
  create policy users_admin_update on public.users
    for update using (public.is_admin()) with check (public.is_admin());

  drop policy if exists users_admin_delete on public.users;
  create policy users_admin_delete on public.users
    for delete using (public.is_admin());

  -- Linked tables: admin read/write
  do $$
  declare
    t text;
  begin
    foreach t in array array[
      'academic_profiles', 'professional_profiles', 'locations',
      'amicale_memberships', 'social_links', 'observations', 'media'
    ]
    loop
      execute format('drop policy if exists %I_admin_all on public.%I', t, t);
      execute format(
        'create policy %I_admin_all on public.%I for all using (public.is_admin()) with check (public.is_admin())',
        t, t
      );
    end loop;
  end $$;
