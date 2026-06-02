-- Promouvoir un admin par email (à adapter si besoin)
-- Exécuter après 20260602_admin_role.sql

update public.users
set role = 'admin', updated_at = now()
where lower(email) = lower('bassirousikirou59@gmail.com');
