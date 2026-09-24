-- ============================================================
-- Add "online now" student count to admin_overview RPC
--
-- Pending item from NEXT_STEPS.md: "Admin overview: add online
-- student count to admin_overview RPC"
--
-- An "online" student is one whose student_presence.status = 'online'
-- AND last_seen_at >= now() - interval '5 minutes' (heartbeats fire
-- every ~60s, so 5 min is a safe stale threshold).
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_ids uuid[] := public._visible_student_ids();
  v_students bigint;
  v_online bigint;
  v_active bigint;
  v_new_30 bigint;
  v_stalled bigint;
  v_avg_progress numeric;
  v_certs bigint;
  v_certs_30 bigint;
  v_teachers bigint;
  v_groups bigint;
  v_upcoming bigint;
  v_expiring bigint;
  v_result jsonb;
begin
  if not public.has_permission('students.read') then
    raise exception 'Insufficient permission: students.read';
  end if;

  select count(*) into v_students
    from auth.users u
    left join public.user_roles ur on ur.user_id = u.id
   where (v_ids is null or u.id = any(v_ids))
     and coalesce(ur.role,'student') not in ('teacher','admin','super_admin');

  -- Online now: presence row updated within last 5 minutes
  select count(*) into v_online
    from public.student_presence sp
    join auth.users u on u.id = sp.user_id
    left join public.user_roles ur on ur.user_id = u.id
   where (v_ids is null or sp.user_id = any(v_ids))
     and coalesce(ur.role,'student') not in ('teacher','admin','super_admin')
     and sp.status = 'online'
     and sp.last_seen_at >= now() - interval '5 minutes';

  select count(*) into v_active
    from auth.users u
    left join public.user_roles ur on ur.user_id = u.id
    left join public.student_state ss on ss.user_id = u.id
   where (v_ids is null or u.id = any(v_ids))
     and coalesce(ur.role,'student') not in ('teacher','admin','super_admin')
     and greatest(coalesce(ss.updated_at, u.created_at), coalesce(ss.last_study_date, u.created_at)) >= now() - interval '7 days';

  select count(*) into v_new_30
    from auth.users u
    left join public.user_roles ur on ur.user_id = u.id
   where (v_ids is null or u.id = any(v_ids))
     and coalesce(ur.role,'student') not in ('teacher','admin','super_admin')
     and u.created_at >= now() - interval '30 days';

  select count(*) into v_stalled
    from auth.users u
    left join public.user_roles ur on ur.user_id = u.id
    left join public.student_state ss on ss.user_id = u.id
   where (v_ids is null or u.id = any(v_ids))
     and coalesce(ur.role,'student') not in ('teacher','admin','super_admin')
     and greatest(coalesce(ss.updated_at, u.created_at), coalesce(ss.last_study_date, u.created_at)) < now() - interval '7 days';

  select round(avg(coalesce(array_length(ss.completed_lessons,1),0)), 1) into v_avg_progress
    from auth.users u
    left join public.user_roles ur on ur.user_id = u.id
    left join public.student_state ss on ss.user_id = u.id
   where (v_ids is null or u.id = any(v_ids))
     and coalesce(ur.role,'student') not in ('teacher','admin','super_admin');

  select count(*) into v_certs from public.certificates;
  select count(*) into v_certs_30 from public.certificates where created_at >= now() - interval '30 days';

  select count(*) into v_teachers from public.user_roles where role = 'teacher';
  select count(*) into v_groups from public.groups where status = 'active';
  select count(*) into v_upcoming from public.live_classes
   where status = 'scheduled' and scheduled_date >= current_date;
  select count(*) into v_expiring from public.subscriptions
   where status in ('active','expiring') and end_date between current_date and current_date + 14;

  select jsonb_build_object(
    'totals', jsonb_build_object(
      'students', v_students, 'online', v_online, 'active', v_active, 'new_30', v_new_30, 'stalled', v_stalled,
      'avg_progress', v_avg_progress, 'certificates', v_certs, 'certificates_30', v_certs_30,
      'teachers', v_teachers, 'groups', v_groups, 'upcoming_classes', v_upcoming, 'expiring', v_expiring),
    'attention', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', b.user_id, 'full_name', b.full_name, 'email', b.email,
        'days_inactive', b.days_inactive, 'recent_absences', b.recent_absences,
        'expiring_days', b.expiring_days, 'reasons', b.reasons))
      from (
        select u.id as user_id,
               coalesce(sp.full_name, u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)) as full_name,
               u.email,
               extract(day from (now() - greatest(coalesce(ss.updated_at, u.created_at), coalesce(ss.last_study_date, u.created_at))))::integer as days_inactive,
               (select count(*)::integer from public.attendance a2 join public.live_classes lc2 on lc2.id=a2.live_class_id
                 where a2.user_id = u.id and a2.status='absent' and lc2.scheduled_date >= current_date - 30) as recent_absences,
               (select (s3.end_date - current_date)::integer from public.subscriptions s3
                 where s3.user_id = u.id and s3.status in ('active','expiring')
                 order by s3.end_date desc limit 1) as expiring_days,
               array[
                 case when extract(day from (now() - greatest(coalesce(ss.updated_at, u.created_at), coalesce(ss.last_study_date, u.created_at))))::integer >= 7
                      then 'inactive' else null end,
                 case when (select count(*)::integer from public.attendance a2 join public.live_classes lc2 on lc2.id=a2.live_class_id
                             where a2.user_id = u.id and a2.status='absent' and lc2.scheduled_date >= current_date - 30) >= 2
                      then 'missed_live' else null end,
                 case when (select (s3.end_date - current_date)::integer from public.subscriptions s3
                             where s3.user_id = u.id and s3.status in ('active','expiring')
                             order by s3.end_date desc limit 1) between 0 and 14
                      then 'expiring' else null end
               ] as reasons
        from auth.users u
        left join public.user_roles ur on ur.user_id = u.id
        left join public.student_state ss on ss.user_id = u.id
        left join public.student_profiles sp on sp.user_id = u.id
        where (v_ids is null or u.id = any(v_ids))
          and coalesce(ur.role,'student') not in ('teacher','admin','super_admin')
          and (extract(day from (now() - greatest(coalesce(ss.updated_at, u.created_at), coalesce(ss.last_study_date, u.created_at))))::integer >= 7
               or (select count(*)::integer from public.attendance a2 join public.live_classes lc2 on lc2.id=a2.live_class_id
                    where a2.user_id = u.id and a2.status='absent' and lc2.scheduled_date >= current_date - 30) >= 2
               or (select (s3.end_date - current_date)::integer from public.subscriptions s3
                    where s3.user_id = u.id and s3.status in ('active','expiring')
                    order by s3.end_date desc limit 1) between 0 and 14)
        order by days_inactive desc
        limit 12
      ) b
    ), '[]'::jsonb),
    'recent_completions', coalesce((
      select jsonb_agg(jsonb_build_object('full_name', x.full_name, 'lesson', x.lesson, 'when', x.when))
      from (
        select coalesce(sp.full_name, u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)) as full_name,
               ss.completed_lessons[array_length(ss.completed_lessons,1)] as lesson,
               ss.updated_at as when
        from auth.users u
        left join public.user_roles ur on ur.user_id = u.id
        left join public.student_state ss on ss.user_id = u.id
        left join public.student_profiles sp on sp.user_id = u.id
        where (v_ids is null or u.id = any(v_ids))
          and coalesce(ur.role,'student') not in ('teacher','admin','super_admin')
          and ss.completed_lessons is not null and array_length(ss.completed_lessons,1) > 0
        order by ss.updated_at desc
        limit 8
      ) x
    ), '[]'::jsonb),
    'recent_certificates', coalesce((
      select jsonb_agg(jsonb_build_object('cert_id', cert_id, 'student_name', student_name, 'academy_en', academy_en, 'created_at', created_at, 'status', status))
      from (select * from public.certificates order by created_at desc limit 8) c
    ), '[]'::jsonb),
    'upcoming_classes', coalesce((
      select jsonb_agg(jsonb_build_object('id', x.id, 'topic', x.topic, 'group_name', x.group_name, 'teacher_name', x.teacher_name,
                                          'scheduled_date', x.scheduled_date, 'start_time', x.start_time, 'status', x.status))
      from (
        select lc.id, lc.topic, g.name as group_name, t.raw_user_meta_data->>'full_name' as teacher_name,
               lc.scheduled_date, lc.start_time, lc.status
        from public.live_classes lc
        left join public.groups g on g.id = lc.group_id
        left join auth.users t on t.id = lc.teacher_id
        where lc.status = 'scheduled' and lc.scheduled_date >= current_date
        order by lc.scheduled_date, lc.start_time
        limit 8
      ) x
    ), '[]'::jsonb),
    'recent_audit', coalesce((
      select jsonb_agg(jsonb_build_object('id', al.id, 'actor', a.email, 'action', al.action, 'target_type', al.target_type, 'target_id', al.target_id, 'created_at', al.created_at))
      from (select * from public.audit_log order by created_at desc limit 10) al
      left join auth.users a on a.id = al.actor_user_id
    ), '[]'::jsonb),
    'course_distribution', coalesce((
      select jsonb_agg(jsonb_build_object('academy', split_part(lesson, '::', 1), 'count', cnt))
      from (
        select ss.completed_lessons[array_length(ss.completed_lessons,1)] as lesson, count(*) as cnt
        from auth.users u
        left join public.user_roles ur on ur.user_id = u.id
        left join public.student_state ss on ss.user_id = u.id
        where (v_ids is null or u.id = any(v_ids))
          and coalesce(ur.role,'student') not in ('teacher','admin','super_admin')
          and ss.completed_lessons is not null and array_length(ss.completed_lessons,1) > 0
        group by 1 order by cnt desc limit 10
      ) d
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$function$;
