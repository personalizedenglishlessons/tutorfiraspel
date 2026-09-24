-- Student Presence & Activity Tracking
-- Creates: student_presence (upsertable summary), student_activity_events (append-only log),
-- student_touch() RPC for student app writes, updates admin_students + admin_student_360 to
-- expose presence data (online/offline, last login, last action, session duration).

-- ============================================================
-- 1. TABLES
-- ============================================================

create table if not exists public.student_presence (
  user_id uuid not null primary key references auth.users(id) on delete cascade,
  session_id text,
  status text not null default 'online',
  last_seen_at timestamptz not null default now(),
  last_login_at timestamptz,
  current_page text,
  current_lesson_id text,
  current_academy_id text,
  last_action text,
  last_action_at timestamptz,
  session_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_activity_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text,
  event_type text not null,
  page text,
  academy_id text,
  lesson_id text,
  activity_idx integer,
  action_label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_user on public.student_activity_events (user_id, created_at desc);
create index if not exists idx_activity_events_type on public.student_activity_events (event_type, created_at desc);

-- RLS: students touch via SECURITY DEFINER RPC, but enable RLS for safety
alter table public.student_presence enable row level security;
alter table public.student_activity_events enable row level security;

-- Students can read their own presence (for potential future features)
drop policy if exists "student reads own presence" on public.student_presence;
create policy "student reads own presence"
  on public.student_presence for select
  using (auth.uid() = user_id);

-- Students can read their own activity events
drop policy if exists "student reads own activity" on public.student_activity_events;
create policy "student reads own activity"
  on public.student_activity_events for select
  using (auth.uid() = user_id);

-- No direct INSERT/UPDATE/DELETE via RLS - all writes go through student_touch() RPC

-- ============================================================
-- 2. student_touch() RPC - called by student app
-- ============================================================

create or replace function public.student_touch(
  p_session_id text default null,
  p_event_type text default 'heartbeat',
  p_page text default null,
  p_academy_id text default null,
  p_lesson_id text default null,
  p_activity_idx integer default null,
  p_action_label text default null,
  p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
  v_existing record;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Check if session changed (new login / new tab)
  select session_id, session_started_at into v_existing
    from public.student_presence where user_id = v_uid;

  -- Upsert presence row
  insert into public.student_presence (
    user_id, session_id, status, last_seen_at,
    last_login_at, current_page, current_academy_id, current_lesson_id,
    last_action, last_action_at, session_started_at, updated_at
  ) values (
    v_uid, p_session_id, 'online', v_now,
    case when p_event_type = 'login' then v_now else null end,
    p_page, p_academy_id, p_lesson_id,
    p_action_label, case when p_action_label is not null then v_now else null end,
    v_now, v_now
  )
  on conflict (user_id) do update set
    session_id = coalesce(p_session_id, student_presence.session_id),
    status = 'online',
    last_seen_at = v_now,
    last_login_at = case
      when p_event_type = 'login' then v_now
      else coalesce(student_presence.last_login_at, v_now)
    end,
    current_page = coalesce(p_page, student_presence.current_page),
    current_academy_id = coalesce(p_academy_id, student_presence.current_academy_id),
    current_lesson_id = coalesce(p_lesson_id, student_presence.current_lesson_id),
    last_action = coalesce(p_action_label, student_presence.last_action),
    last_action_at = case
      when p_action_label is not null then v_now
      else student_presence.last_action_at
    end,
    session_started_at = case
      when p_session_id is not null
       and v_existing.session_id is not null
       and v_existing.session_id is distinct from p_session_id
      then v_now
      when v_existing.session_id is null and p_session_id is not null
      then v_now
      else student_presence.session_started_at
    end,
    updated_at = v_now;

  -- Insert activity event (skip heartbeats to reduce volume)
  if p_event_type <> 'heartbeat' then
    insert into public.student_activity_events (
      user_id, session_id, event_type, page, academy_id, lesson_id,
      activity_idx, action_label, metadata
    ) values (
      v_uid, p_session_id, p_event_type, p_page, p_academy_id, p_lesson_id,
      p_activity_idx, p_action_label, p_metadata
    );
  end if;
end;
$function$;

-- Grant execute to authenticated users (students call this)
grant execute on function public.student_touch(text, text, text, text, text, integer, text, jsonb) to authenticated;

-- Table grants: RLS policies alone do not confer table privileges.
-- authenticated needs SELECT for the "own presence/activity" RLS policies;
-- service_role bypasses RLS but still needs table-level grants for Data API.
grant select on public.student_presence to authenticated;
grant select on public.student_activity_events to authenticated;
grant all on public.student_presence to service_role;
grant all on public.student_activity_events to service_role;
grant usage, select on sequence public.student_activity_events_id_seq to service_role;

-- ============================================================
-- 3. Update admin_students to include presence data
-- ============================================================

create or replace function public.admin_students(
  p_limit integer default 25,
  p_offset integer default 0,
  p_search text default null,
  p_filters jsonb default '{}'::jsonb,
  p_sort text default 'last_active:desc'
) returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare
  v_ids uuid[] := public._visible_student_ids();
  v_sort text := coalesce(p_sort, 'last_active:desc');
  v_col text := split_part(v_sort, ':', 1);
  v_dir text := coalesce(nullif(split_part(v_sort, ':', 2), ''), 'desc');
begin
  if not public.has_permission('students.read') then
    raise exception 'Insufficient permission: students.read';
  end if;

  return coalesce((
    with base as (
      select
        u.id as user_id,
        coalesce(sp.full_name, u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as full_name,
        u.email,
        sp.phone,
        coalesce(sp.status, 'new') as status,
        coalesce(pr.level, 'A1') as level,
        coalesce(ss.xp, 0)::integer as xp,
        coalesce(ss.streak, 0)::integer as streak,
        greatest(coalesce(ss.updated_at, u.created_at), coalesce(ss.last_study_date, u.created_at)) as last_active,
        coalesce(array_length(ss.completed_lessons, 1), 0)::integer as completed_lessons,
        extract(day from (now() - greatest(coalesce(ss.updated_at, u.created_at), coalesce(ss.last_study_date, u.created_at))))::integer as days_inactive,
        (select count(*)::integer from public.certificates c2 where c2.user_id = u.id and c2.status = 'issued') as cert_count,
        (select p3.id from public.subscriptions s3 join public.programs p3 on p3.id = s3.program_id
          where s3.user_id = u.id and s3.status in ('active','expiring') order by s3.end_date desc limit 1) as program_id,
        (select p3.name_en from public.subscriptions s3 join public.programs p3 on p3.id = s3.program_id
          where s3.user_id = u.id and s3.status in ('active','expiring') order by s3.end_date desc limit 1) as program_name,
        (select s3.status from public.subscriptions s3
          where s3.user_id = u.id and s3.status in ('active','expiring') order by s3.end_date desc limit 1) as subscription_status,
        (select s3.end_date from public.subscriptions s3
          where s3.user_id = u.id and s3.status in ('active','expiring') order by s3.end_date desc limit 1) as subscription_end,
        (select count(*)::integer from public.attendance a2
          join public.live_classes lc2 on lc2.id = a2.live_class_id
          where a2.user_id = u.id and a2.status = 'absent'
            and lc2.scheduled_date >= current_date - 30) as recent_absences,
        coalesce(array(
          select g.name from public.groups g
          join public.group_members gm on gm.group_id = g.id
          where gm.user_id = u.id and g.status = 'active'
        ), '{}') as group_names,
        coalesce(pr.skill_scores, '{}'::jsonb) as skill_scores,
        coalesce(pr.snapshot_date, null::date) as snapshot_date,
        ps->>'status' as plan_eff_status,
        coalesce((ps->>'days_remaining')::int, 0) as plan_days_left,
        -- Presence fields
        spr.status as presence_status,
        spr.last_seen_at,
        spr.last_login_at,
        spr.current_page,
        spr.current_lesson_id,
        spr.current_academy_id,
        spr.last_action,
        spr.last_action_at,
        spr.session_started_at,
        (spr.last_seen_at is not null and spr.last_seen_at > now() - interval '2 minutes') as is_online,
        case when spr.session_started_at is not null
          then extract(epoch from (coalesce(spr.last_seen_at, now()) - spr.session_started_at))::integer
          else null end as session_duration_seconds
      from auth.users u
      left join public.student_state ss on ss.user_id = u.id
      left join public.student_profiles sp on sp.user_id = u.id
      left join public.user_roles ur on ur.user_id = u.id
      left join public.student_presence spr on spr.user_id = u.id
      left join lateral (
        select s.level, s.skill_scores, s.snapshot_date
          from public.learning_snapshots s
         where s.user_id = u.id
         order by s.snapshot_date desc
         limit 1
      ) pr on true
      left join lateral public._plan_status_for(u.id) ps on true
      where (v_ids is null or u.id = any(v_ids))
        and coalesce(ur.role, 'student') <> 'teacher'
        and coalesce(ur.role, 'student') <> 'admin'
        and coalesce(ur.role, 'student') <> 'super_admin'
    )
    select jsonb_agg(jsonb_build_object(
      'id', b.user_id,
      'full_name', b.full_name,
      'email', b.email,
      'phone', b.phone,
      'status', b.status,
      'level', b.level,
      'xp', b.xp,
      'streak', b.streak,
      'last_active', b.last_active,
      'completed_lessons', b.completed_lessons,
      'days_inactive', b.days_inactive,
      'needs_attention', (b.days_inactive >= 7 or b.recent_absences >= 2
          or (b.subscription_status in ('active','expiring') and b.subscription_end is not null
              and b.subscription_end - current_date <= 14)),
      'attention_reasons', (case when b.days_inactive >= 7 then array['inactive_' || b.days_inactive]::text[] else '{}'::text[] end
       || case when b.recent_absences >= 2 then array['missed_live_' || b.recent_absences]::text[] else '{}'::text[] end
       || case when b.subscription_end is not null and b.subscription_end - current_date between 0 and 14
               then array['expiring_' || (b.subscription_end - current_date)]::text[] else '{}'::text[] end),
      'program_id', b.program_id,
      'program_name', b.program_name,
      'subscription_status', b.subscription_status,
      'subscription_end', b.subscription_end,
      'plan_status', b.plan_eff_status,
      'plan_days_left', b.plan_days_left,
      'cert_count', b.cert_count,
      'group_names', b.group_names,
      'is_online', b.is_online,
      'last_seen', b.last_seen_at,
      'last_login', b.last_login_at,
      'current_page', b.current_page,
      'current_lesson', b.current_lesson_id,
      'current_academy', b.current_academy_id,
      'last_action', b.last_action,
      'last_action_at', b.last_action_at,
      'session_duration', b.session_duration_seconds)
      order by
        case when v_col = 'name' and v_dir = 'asc' then b.full_name end asc,
        case when v_col = 'name' then b.full_name end desc,
        case when v_col = 'enrolled' and v_dir = 'asc' then b.last_active end asc,
        case when v_col = 'enrolled' then b.last_active end desc,
        case when v_col = 'progress' then b.completed_lessons end desc,
        case when v_col = 'progress' then b.completed_lessons end asc,
        case when v_col = 'xp' then b.xp end desc,
        case when v_col = 'xp' then b.xp end asc,
        case when v_col = 'streak' then b.streak end desc,
        case when v_col = 'streak' then b.streak end asc,
        case when v_col = 'expiry' then b.subscription_end end asc nulls last,
        case when v_col = 'last_active' then b.last_active end desc nulls last,
        case when v_col = 'last_active' then b.last_active end asc nulls last,
        b.full_name asc)
    from base b
    where (p_search is null or p_search = ''
           or b.full_name ilike '%' || p_search || '%'
           or b.email ilike '%' || p_search || '%'
           or b.phone ilike '%' || p_search || '%'
           or b.user_id::text like '%' || p_search || '%')
      and (p_filters->>'status' is null or p_filters->>'status' = '' or b.status = p_filters->>'status')
      and (p_filters->>'level' is null or p_filters->>'level' = '' or b.level = p_filters->>'level')
      and (p_filters->>'program_id' is null or p_filters->>'program_id' = '' or b.program_id::text = p_filters->>'program_id')
      and (p_filters->>'group_id' is null or p_filters->>'group_id' = '' or exists(
            select 1 from public.group_members gm3 where gm3.user_id = b.user_id and gm3.group_id = (p_filters->>'group_id')::uuid))
      and (p_filters->>'teacher_id' is null or p_filters->>'teacher_id' = '' or exists(
            select 1 from public.groups g2 join public.group_members gm2 on gm2.group_id = g2.id
             where gm2.user_id = b.user_id and g2.teacher_id = (p_filters->>'teacher_id')::uuid))
      and (p_filters->>'cert_status' is null or p_filters->>'cert_status' = ''
           or (p_filters->>'cert_status' = 'issued' and b.cert_count > 0)
           or (p_filters->>'cert_status' = 'none' and b.cert_count = 0))
      and (p_filters->>'needs_attention' is null or p_filters->>'needs_attention' <> 'true'
           or b.days_inactive >= 7 or b.recent_absences >= 2
           or (b.subscription_end is not null and b.subscription_end - current_date <= 14))
      and (p_filters->>'entitlement' is null or p_filters->>'entitlement' = ''
           or (p_filters->>'entitlement' = 'no_plan'    and coalesce(b.plan_eff_status, 'none') = 'none')
           or (p_filters->>'entitlement' = 'expiring7'  and b.plan_eff_status = 'expiring')
           or (p_filters->>'entitlement' = 'expiring30' and b.plan_eff_status in ('active','expiring')
                and b.plan_days_left <= 30)
           or (p_filters->>'entitlement' = 'expired'    and b.plan_eff_status = 'expired')
           or (p_filters->>'entitlement' = 'suspended'  and b.plan_eff_status = 'suspended'))
    limit p_limit offset p_offset
  ), '[]'::jsonb);
end;
$function$;

-- ============================================================
-- 4. Update admin_student_360 to include presence + recent activity
-- ============================================================

create or replace function public.admin_student_360(p_user_id uuid)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare
  v_ids uuid[] := public._visible_student_ids();
  v_result jsonb;
begin
  if not public.has_permission('students.read') then
    raise exception 'Insufficient permission: students.read';
  end if;
  if v_ids is not null and not (p_user_id = any(v_ids)) then
    raise exception 'Student is outside your assigned scope.';
  end if;

  select jsonb_build_object(
    'profile', (select public.admin_student_profile(p_user_id)),
    'state', (
      select jsonb_build_object(
        'xp', xp, 'streak', streak, 'longest_streak', longest_streak,
        'last_study_date', last_study_date, 'updated_at', updated_at,
        'completed_lessons', coalesce(completed_lessons, '{}'),
        'favorites', coalesce(favorites, '{}'),
        'bookmarks', coalesce(bookmarks, '[]'),
        'student_prefs', coalesce(student_prefs, '{}'::jsonb),
        'vocab_store', coalesce(vocab_store, '[]'),
        'notes_store', coalesce(notes_store, '[]'))
      from public.student_state where user_id = p_user_id),
    'kv', (
      select jsonb_object_agg(key, value) from public.student_data
      where user_id = p_user_id and key in
        ('pel_plan','pel_plan_snapshot','pel_completion_dates','pel_review_queue','pel_study_days','pel_account_prefs')),
    'lesson_stats', jsonb_build_object(
      'totals', (select jsonb_build_object(
        'rec_ok', coalesce(sum(rec_ok),0), 'rec_total', coalesce(sum(rec_total),0),
        'prod_ok', coalesce(sum(prod_ok),0), 'prod_total', coalesce(sum(prod_total),0),
        'prod_first_ok', coalesce(sum(prod_first_ok),0),
        'lessons', count(*))
        from public.lesson_progress where user_id = p_user_id),
      'recent', coalesce((
        select jsonb_agg(jsonb_build_object(
          'lesson_id', lp.lesson_id, 'academy_id', lp.academy_id,
          'title', l.title_en, 'title_ar', l.title_ar,
          'score', lp.score, 'completed_at', lp.completed_at,
          'rec_ok', lp.rec_ok, 'rec_total', lp.rec_total,
          'prod_ok', lp.prod_ok, 'prod_total', lp.prod_total,
          'prod_first_ok', lp.prod_first_ok) order by lp.completed_at desc)
        from (select * from public.lesson_progress
              where user_id = p_user_id order by completed_at desc limit 12) lp
        left join public.lessons l on l.id = lp.lesson_id), '[]'::jsonb)),
    'certificates', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'cert_id', cert_id, 'code', code, 'student_name', student_name,
        'academy_en', academy_en, 'academy_ar', academy_ar, 'level', level,
        'program_name', program_name, 'completed_at', completed_at, 'created_at', created_at,
        'status', status, 'revoke_reason', revoke_reason, 'revoked_at', revoked_at,
        'replaced_by', replaced_by, 'verification_count', verification_count) order by created_at desc)
      from public.certificates c where c.user_id = p_user_id), '[]'::jsonb),
    'subscriptions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'program_id', s.program_id, 'program_en', p.name_en, 'program_ar', p.name_ar,
        'included', p.included_live_sessions, 'start_date', s.start_date, 'end_date', s.end_date,
        'status', s.status, 'sessions_used', s.sessions_used, 'days_left', (s.end_date - current_date)) order by s.end_date desc)
      from public.subscriptions s join public.programs p on p.id = s.program_id
      where s.user_id = p_user_id), '[]'::jsonb),
    'groups', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', g.id, 'name', g.name, 'course_id', g.course_id, 'level', g.level,
        'schedule', g.schedule, 'status', g.status, 'capacity', g.capacity,
        'teacher_name', t.raw_user_meta_data->>'full_name', 'joined_at', gm.joined_at) order by gm.joined_at desc)
      from public.group_members gm
      join public.groups g on g.id = gm.group_id
      left join auth.users t on t.id = g.teacher_id
      where gm.user_id = p_user_id), '[]'::jsonb),
    'attendance', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'status', a.status, 'topic', lc.topic, 'date', lc.scheduled_date,
        'time', lc.start_time, 'class_id', lc.id, 'marked_by', a.marked_by, 'created_at', a.created_at) order by lc.scheduled_date desc)
      from public.attendance a
      join public.live_classes lc on lc.id = a.live_class_id
      where a.user_id = p_user_id), '[]'::jsonb),
    'interventions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'type', i.type, 'title_en', i.title_en, 'title_ar', i.title_ar,
        'reason_en', i.reason_en, 'reason_ar', i.reason_ar, 'status', i.status,
        'created_by', i.created_by, 'created_at', i.created_at, 'resolved_at', i.resolved_at) order by i.created_at desc)
      from public.interventions i where i.user_id = p_user_id), '[]'::jsonb),
    'recommendations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'academy_id', r.academy_id, 'lesson_id', r.lesson_id,
        'reason_en', r.reason_en, 'reason_ar', r.reason_ar, 'signals', r.signals,
        'status', r.status, 'created_by', r.created_by, 'created_at', r.created_at) order by r.created_at desc)
      from public.recommendations r where r.user_id = p_user_id), '[]'::jsonb),
    'overrides', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id, 'original_academy_id', o.original_academy_id, 'original_lesson_id', o.original_lesson_id,
        'replaced_academy_id', o.replaced_academy_id, 'replaced_lesson_id', o.replaced_lesson_id,
        'reason', o.reason, 'created_by', o.created_by, 'created_at', o.created_at) order by o.created_at desc)
      from public.teacher_overrides o where o.user_id = p_user_id), '[]'::jsonb),
    'notes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', n.id, 'category', n.category, 'body', n.body,
        'author_name', a.raw_user_meta_data->>'full_name', 'created_at', n.created_at) order by n.created_at desc)
      from public.student_notes n left join auth.users a on a.id = n.author_user_id
      where n.user_id = p_user_id), '[]'::jsonb),
    'snapshots', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'snapshot_date', s.snapshot_date, 'level', s.level,
        'skill_scores', s.skill_scores, 'xp', s.xp, 'completed_lessons', s.completed_lessons) order by s.snapshot_date desc)
      from public.learning_snapshots s where s.user_id = p_user_id), '[]'::jsonb),
    'audit', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'action', a.action, 'target_type', a.target_type, 'target_id', a.target_id,
        'metadata', a.metadata, 'actor', ac.raw_user_meta_data->>'full_name', 'created_at', a.created_at) order by a.created_at desc)
      from public.audit_log a left join auth.users ac on ac.id = a.actor_user_id
      where a.target_type = 'student' and a.target_id = p_user_id::text
        or (a.metadata->>'user_id')::uuid = p_user_id
      ), '[]'::jsonb),
    'presence', coalesce((
      select jsonb_build_object(
        'status', spr.status,
        'is_online', (spr.last_seen_at is not null and spr.last_seen_at > now() - interval '2 minutes'),
        'last_seen_at', spr.last_seen_at,
        'last_login_at', spr.last_login_at,
        'current_page', spr.current_page,
        'current_lesson_id', spr.current_lesson_id,
        'current_academy_id', spr.current_academy_id,
        'last_action', spr.last_action,
        'last_action_at', spr.last_action_at,
        'session_started_at', spr.session_started_at,
        'session_duration_seconds',
          case when spr.session_started_at is not null
            then extract(epoch from (coalesce(spr.last_seen_at, now()) - spr.session_started_at))::integer
            else null end
      ) from public.student_presence spr where spr.user_id = p_user_id
    ), 'null'::jsonb),
    'recent_activity', coalesce((
      select jsonb_agg(jsonb_build_object(
        'event_type', e.event_type, 'page', e.page, 'academy_id', e.academy_id,
        'lesson_id', e.lesson_id, 'activity_idx', e.activity_idx,
        'action_label', e.action_label, 'created_at', e.created_at
      ) order by e.created_at desc)
      from (select * from public.student_activity_events where user_id = p_user_id order by created_at desc limit 30) e
    ), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$function$;
