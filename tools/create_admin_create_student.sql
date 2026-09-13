create extension if not exists pgcrypto with schema extensions;

create or replace function public.admin_create_student(
  p_email text,
  p_password text,
  p_full_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
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

  if not exists (
    select 1 from public.profiles
    where user_id = v_admin and coalesce(is_admin, false) = true
  ) then
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
    encrypted_password, email_confirmed_at, confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user, is_anonymous
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
    now(), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', v_name, 'email_verified', true),
    now(), now(), false, false
  );

  insert into auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at, email, id
  )
  values (
    v_user_id::text, v_user_id, v_identity_data, 'email',
    now(), now(), now(), v_email, gen_random_uuid()
  );

  insert into public.profiles (user_id, is_admin, level)
  values (v_user_id, false, 'A0')
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
$$;

grant execute on function public.admin_create_student(text, text, text) to authenticated;
