-- Fix the admin students "Enrolled" sort: it ordered by last_active
-- (activity), so choosing Enrolled returned an activity-sorted roster.
-- admin_students now returns enrolled_at (auth.users.created_at) and the
-- 'enrolled' sort key orders by it. last_active remains its own sort key.
--
-- Full function replacement of admin_students from migration
-- 202609150003_student_presence_tracking.sql with those three changes.

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
        u.created_at as enrolled_at,
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
      'enrolled_at', b.enrolled_at,
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
        case when v_col = 'enrolled' and v_dir = 'asc' then b.enrolled_at end asc,
        case when v_col = 'enrolled' then b.enrolled_at end desc,
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
