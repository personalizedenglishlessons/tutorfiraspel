-- ============================================================
-- 004 · Live class credits + request system
-- Builds on the existing credit infra from 001 (profiles.live_class_credits,
-- credit_ledger, admin_adjust_credits). Adds services + cities + requests
-- tables, the student request RPC, the admin decide RPC, an overview RPC,
-- an admin plan/level setter, and a welcome-seen marker.
-- ============================================================

-- ---------- 0. welcome_seen_at on profiles ----------
alter table public.profiles
  add column if not exists welcome_seen_at timestamptz;

-- ---------- 1. live_class_services (the credit-cost catalog) ----------
create table if not exists public.live_class_services (
  code text primary key,
  duration_minutes int not null default 40,
  credit_cost int not null,
  requires_in_person_city boolean not null default false,
  label_en text not null,
  label_ar text not null,
  desc_en text,
  desc_ar text,
  active boolean not null default true,
  sort_order int not null default 0
);

insert into public.live_class_services
  (code, duration_minutes, credit_cost, requires_in_person_city, label_en, label_ar, desc_en, desc_ar, active, sort_order)
values
  ('group_online_40',  40, 1, false,
   'Group live class (40 min)', 'حصة جماعية اونلاين (40 دقيقة)',
   'Live group session with a teacher and other students.', 'حصة مباشرة مع المعلم وطلاب ثانين.',
   true, 1),
  ('private_online_40', 40, 2, false,
   'Private live class (40 min)', 'حصة خاصة اونلاين (40 دقيقة)',
   'One-to-one live session with your teacher.', 'حصة فردية مباشرة مع معلمك.',
   true, 2),
  ('in_person_40', 40, 4, true,
   'In-person class (40 min)', 'حصة حضورية (40 دقيقة)',
   'Face-to-face class. Currently available in Al Namas only.', 'حصة حضورية. متوفرة حاليا في النماص فقط.',
   true, 3)
on conflict (code) do update
  set credit_cost = excluded.credit_cost,
      requires_in_person_city = excluded.requires_in_person_city,
      label_en = excluded.label_en,
      label_ar = excluded.label_ar,
      desc_en = excluded.desc_en,
      desc_ar = excluded.desc_ar,
      active = excluded.active,
      sort_order = excluded.sort_order;

-- ---------- 2. live_class_cities (where in-person is available) ----------
create table if not exists public.live_class_cities (
  id uuid primary key default gen_random_uuid(),
  city_name text not null,
  city_normalized text not null unique,
  in_person_available boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- helper: normalize a city string (trim, lowercase, collapse + unify whitespace,
-- hyphens and underscores so "Al-Namas" / "al_namas" / "Al Namas" all match).
create or replace function public._norm_city(p text) returns text
  language sql immutable as $$
  select lower(regexp_replace(
    regexp_replace(trim(coalesce(p, '')), '[-_]+', ' ', 'g'),
    '\s+', ' ', 'g'));
$$;

-- seed Al Namas (EN + AR spellings + common variants) as available.
-- Each distinct normalized form is its own row; the UI dedups for display.
insert into public.live_class_cities (city_name, city_normalized, in_person_available, active)
values
  ('Al Namas', 'al namas', true, true),
  ('النماص', 'النماص', true, true),
  ('Namas', 'namas', true, true)
on conflict (city_normalized) do update
  set in_person_available = true, active = true;

-- ---------- 3. live_class_requests (student -> admin) ----------
create table if not exists public.live_class_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  service_code text not null references public.live_class_services(code),
  duration_minutes int not null,
  credit_cost int not null,
  city_raw text,
  city_normalized text,
  preferred_times text,
  student_notes text,
  status text not null default 'pending' check (status in ('pending','approved','declined','cancelled')),
  decision_note text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_lcr_student on public.live_class_requests (student_id, created_at desc);
create index if not exists idx_lcr_status on public.live_class_requests (status, created_at desc);

-- ============================================================
-- RPCs (all SECURITY DEFINER; atomic credit operations server-side)
-- ============================================================

-- ---------- 4. student_live_class_overview() ----------
-- One round-trip: balance + service catalog + available cities + my requests
create or replace function public.student_live_class_overview()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_uid uuid := auth.uid(); v_credits int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select coalesce(p.live_class_credits, 0) into v_credits from public.profiles p where p.user_id = v_uid;
  return jsonb_build_object(
    'credits', v_credits,
    'welcome_seen', exists (select 1 from public.profiles where user_id = v_uid and welcome_seen_at is not null),
    'has_level', exists (select 1 from public.profiles where user_id = v_uid and assessed_cefr_level is not null),
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', s.code, 'duration_minutes', s.duration_minutes, 'credit_cost', s.credit_cost,
        'requires_in_person_city', s.requires_in_person_city, 'label_en', s.label_en, 'label_ar', s.label_ar,
        'desc_en', s.desc_en, 'desc_ar', s.desc_ar) order by s.sort_order)
      from public.live_class_services s where s.active), '[]'::jsonb),
    'cities', coalesce((
      select jsonb_agg(jsonb_build_object('city_name', c.city_name) order by c.city_name)
      from public.live_class_cities c where c.active and c.in_person_available), '[]'::jsonb),
    'my_requests', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'service_code', r.service_code, 'duration_minutes', r.duration_minutes,
        'credit_cost', r.credit_cost, 'city_raw', r.city_raw, 'preferred_times', r.preferred_times,
        'student_notes', r.student_notes, 'status', r.status, 'decision_note', r.decision_note,
        'created_at', r.created_at, 'decided_at', r.decided_at
      ) order by r.created_at desc)
      from public.live_class_requests r where r.student_id = v_uid), '[]'::jsonb)
  );
end;
$$;

-- ---------- 5. request_live_class(p_service_code, p_city_raw, p_preferred_times, p_student_notes) ----------
-- Atomic: validates service + city, deducts credit only if balance >= cost,
-- inserts the pending request, writes the ledger. Raises on insufficient credits
-- or unsupported city so the app can show the exact reason.
create or replace function public.request_live_class(
  p_service_code text, p_city_raw text, p_preferred_times text, p_student_notes text
) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_uid uuid := auth.uid();
  v_svc record; v_city_norm text; v_cost int; v_newbal int; v_reqid uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select * into v_svc from public.live_class_services s where s.code = p_service_code and s.active;
  if not found then raise exception 'Unknown or inactive class type'; end if;
  v_cost := v_svc.credit_cost;
  v_city_norm := public._norm_city(p_city_raw);

  if v_svc.requires_in_person_city then
    if v_city_norm = '' then raise exception 'In-person classes need a city'; end if;
    if not exists (
      select 1 from public.live_class_cities c
       where c.active and c.in_person_available and c.city_normalized = v_city_norm
    ) then
      raise exception 'In-person classes are not available in this city yet';
    end if;
  end if;

  -- atomic deduction: only updates if the student can afford it
  update public.profiles
     set live_class_credits = live_class_credits - v_cost, updated_at = now()
   where user_id = v_uid and live_class_credits >= v_cost
   returning live_class_credits into v_newbal;
  if not found then raise exception 'You do not have enough credits for this class'; end if;

  insert into public.live_class_requests
    (student_id, service_code, duration_minutes, credit_cost, city_raw, city_normalized, preferred_times, student_notes, status)
  values (v_uid, v_svc.code, v_svc.duration_minutes, v_cost, nullif(trim(p_city_raw), ''), v_city_norm, p_preferred_times, p_student_notes, 'pending')
  returning id into v_reqid;

  insert into public.credit_ledger (user_id, delta, balance_after, reason, created_by)
  values (v_uid, -v_cost, v_newbal, 'live_class_request:' || v_reqid, v_uid);

  return jsonb_build_object('id', v_reqid, 'credit_cost', v_cost, 'balance_after', v_newbal, 'status', 'pending');
end;
$$;

-- ---------- 6. admin_decide_live_class_request(p_request_id, p_approve, p_note) ----------
-- Approve (no refund) or decline (idempotent refund). Refuses to act on a
-- request that is already decided, so double-clicks are safe.
create or replace function public.admin_decide_live_class_request(
  p_request_id uuid, p_approve boolean, p_note text
) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_req record; v_newbal int;
begin
  if not has_permission('subscriptions.manage'::text) then
    raise exception 'Insufficient permission: subscriptions.manage';
  end if;
  select * into v_req from public.live_class_requests where id = p_request_id for update;
  if not found then raise exception 'Request not found'; end if;
  if v_req.status <> 'pending' then raise exception 'This request was already %', v_req.status; end if;

  if p_approve then
    update public.live_class_requests
       set status = 'approved', decision_note = p_note, decided_by = auth.uid(),
           decided_at = now(), updated_at = now()
     where id = p_request_id;
  else
    update public.live_class_requests
       set status = 'declined', decision_note = p_note, decided_by = auth.uid(),
           decided_at = now(), updated_at = now()
     where id = p_request_id;
    -- refund the credit once
    update public.profiles
       set live_class_credits = live_class_credits + v_req.credit_cost, updated_at = now()
     where user_id = v_req.student_id
     returning live_class_credits into v_newbal;
    insert into public.credit_ledger (user_id, delta, balance_after, reason, created_by)
    values (v_req.student_id, v_req.credit_cost, v_newbal, 'refund:' || p_request_id, auth.uid());
  end if;

  return jsonb_build_object('id', p_request_id, 'status', case when p_approve then 'approved' else 'declined' end);
end;
$$;

-- ---------- 7. admin_live_class_requests(p_status) ----------
-- Admin list of requests (with student email) for the Live Classes view.
create or replace function public.admin_live_class_requests(p_status text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
begin
  if not has_permission('subscriptions.manage'::text) then
    raise exception 'Insufficient permission: subscriptions.manage';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id, 'student_id', r.student_id, 'service_code', r.service_code,
      'duration_minutes', r.duration_minutes, 'credit_cost', r.credit_cost,
      'city_raw', r.city_raw, 'preferred_times', r.preferred_times, 'student_notes', r.student_notes,
      'status', r.status, 'decision_note', r.decision_note, 'created_at', r.created_at, 'decided_at', r.decided_at,
      'student_email', u.email
    ) order by r.created_at desc)
    from public.live_class_requests r
    join auth.users u on u.id = r.student_id
    where p_status is null or r.status = p_status
  ), '[]'::jsonb);
end;
$$;

-- ---------- 8. admin_manage_live_class_city(p_city_name, p_available) ----------
-- Add or toggle a city. Admin types the city name freely; we normalize.
create or replace function public.admin_manage_live_class_city(
  p_city_name text, p_available boolean
) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_norm text := public._norm_city(p_city_name); v_id uuid;
begin
  if not has_permission('subscriptions.manage'::text) then
    raise exception 'Insufficient permission: subscriptions.manage';
  end if;
  if v_norm = '' then raise exception 'City name is empty'; end if;
  insert into public.live_class_cities (city_name, city_normalized, in_person_available, active)
  values (trim(p_city_name), v_norm, p_available, true)
  on conflict (city_normalized) do update
    set in_person_available = excluded.in_person_available,
        city_name = excluded.city_name,
        active = true
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'city_name', trim(p_city_name), 'city_normalized', v_norm, 'in_person_available', p_available);
end;
$$;

-- ---------- 9. admin_list_live_class_cities() ----------
create or replace function public.admin_list_live_class_cities()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
begin
  if not has_permission('subscriptions.manage'::text) then
    raise exception 'Insufficient permission: subscriptions.manage';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id, 'city_name', c.city_name, 'in_person_available', c.in_person_available, 'active', c.active
    ) order by c.in_person_available desc, c.city_name)
    from public.live_class_cities c
  ), '[]'::jsonb);
end;
$$;

-- ---------- 10. admin_set_student_plan_level(p_user_id, p_tier, p_level) ----------
-- Lets the admin assign a student's plan (subscription_tier) and CEFR level.
-- The level drives lesson routing (the app serves the lessons a C1 user
-- gets, etc.). Keeps student_progression in sync.
create or replace function public.admin_set_student_plan_level(
  p_user_id uuid, p_tier text, p_level text
) returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not has_permission('subscriptions.manage'::text) then
    raise exception 'Insufficient permission: subscriptions.manage';
  end if;
  -- upper-case the level so it matches the routing convention (C1, A2, ...)
  p_level := upper(coalesce(nullif(trim(p_level), ''), 'A1'));
  -- validate CEFR level against the known set
  if p_level not in ('A1','A2','B1','B2','C1','C2') then
    raise exception 'Invalid CEFR level: %', p_level;
  end if;
  -- validate tier against the plan catalog when one is provided
  if p_tier is not null and not exists (select 1 from public.plan_pricing where tier = p_tier) then
    raise exception 'Unknown plan tier: %', p_tier;
  end if;
  update public.profiles
     set subscription_tier = p_tier,
         assessed_track = p_tier,
         assessed_cefr_level = p_level,
         assessed_at = coalesce(assessed_at, now()),
         updated_at = now()
   where user_id = p_user_id;
  insert into public.student_progression (user_id, current_level)
  values (p_user_id, p_level)
  on conflict (user_id) do update
    set current_level = excluded.current_level, updated_at = now();
end;
$$;

-- ---------- 11. mark_welcome_seen() ----------
create or replace function public.mark_welcome_seen()
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  update public.profiles set welcome_seen_at = now()
   where user_id = auth.uid() and welcome_seen_at is null;
end;
$$;

-- ============================================================
-- RLS + grants
-- ============================================================
alter table public.live_class_services enable row level security;
alter table public.live_class_cities   enable row level security;
alter table public.live_class_requests enable row level security;

-- Services + cities: public catalog (read-only).
drop policy if exists lcs_public_read on public.live_class_services;
create policy lcs_public_read on public.live_class_services
  for select to anon, authenticated using (true);

drop policy if exists lcc_public_read on public.live_class_cities;
create policy lcc_public_read on public.live_class_cities
  for select to anon, authenticated using (true);

-- Requests: a student reads only their own; admins (subscriptions.manage) read all.
drop policy if exists lcr_owner_read on public.live_class_requests;
create policy lcr_owner_read on public.live_class_requests
  for select to authenticated
  using (auth.uid() = student_id or has_permission('subscriptions.manage'::text));

GRANT SELECT ON public.live_class_services TO anon, authenticated;
GRANT SELECT ON public.live_class_cities   TO anon, authenticated;
GRANT SELECT ON public.live_class_requests TO authenticated;

-- Function execute grants (match the pattern from 001).
GRANT EXECUTE ON FUNCTION public.student_live_class_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_live_class(text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_decide_live_class_request(uuid,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_live_class_requests(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_live_class_city(text,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_live_class_cities() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_student_plan_level(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_welcome_seen() TO authenticated;
