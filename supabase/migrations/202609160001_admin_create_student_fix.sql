-- Fix: admin_create_student checked the legacy profiles.is_admin flag
-- (always false in this project) instead of the real role system
-- (user_roles + role_permissions, same authority the admin UI uses).
-- Result: 'Permission denied' for every real admin. Now uses
-- has_permission('students.manage') like the rest of the admin RPCs.
BEGIN;
CREATE OR REPLACE FUNCTION public.admin_create_student(p_email text, p_password text, p_full_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
declare
  v_admin uuid := auth.uid();
  v_user_id uuid := gen_random_uuid();
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name text := trim(coalesce(p_full_name, ''));
  v_identity_data jsonb;
begin
  if v_admin is null then
    raise exception 'Not authenticated';
  end if;

  if not public.has_permission('students.manage') then
    raise exception 'Permission denied';
  end if;

  if v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Invalid email';
  end if;

  if length(coalesce(p_password, '')) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  if v_name = '' then
    raise exception 'Full name is required';
  end if;

  if exists (
    select 1 from auth.users
    where lower(email) = v_email and deleted_at is null
  ) then
    raise exception 'Email already exists';
  end if;

  v_identity_data := jsonb_build_object(
    'sub', v_user_id::text,
    'email', v_email,
    'email_verified', true,
    'phone_verified', false
  );

  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user, is_anonymous,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current, phone_change,
    phone_change_token, reauthentication_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', v_name, 'email_verified', true),
    now(), now(), false, false,
    '', '', '', '', '', '', '', ''
  );

  insert into auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at, id
  )
  values (
    v_user_id::text, v_user_id, v_identity_data, 'email',
    now(), now(), now(), gen_random_uuid()
  );

  insert into public.profiles (user_id, is_admin, level)
  values (v_user_id, false, 1)
  on conflict (user_id) do nothing;

  insert into public.student_profiles (user_id, full_name, status, enrollment_date)
  values (v_user_id, v_name, 'active', current_date)
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        status = excluded.status,
        updated_at = now();

  return jsonb_build_object(
    'ok', true,
    'user_id', v_user_id,
    'email', v_email,
    'full_name', v_name
  );
end;
$function$

-- Keep profiles.is_admin in sync with the role system so any other
-- legacy code paths that still read it see the truth.
UPDATE public.profiles p
   SET is_admin = true
 WHERE NOT coalesce(p.is_admin, false)
   AND EXISTS (SELECT 1 FROM public.user_roles ur
                WHERE ur.user_id = p.user_id
                  AND ur.role IN ('admin','super_admin'));

COMMIT;
