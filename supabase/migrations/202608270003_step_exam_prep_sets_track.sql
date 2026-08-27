CREATE OR REPLACE FUNCTION public.admin_set_student_plan_level(p_user_id uuid, p_tier text, p_level text, p_track text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_existing_stage text;
  v_stage_level text;
  v_track text;
begin
  if not has_permission('subscriptions.manage'::text) then
    raise exception 'Insufficient permission: subscriptions.manage';
  end if;
  p_level := upper(coalesce(nullif(trim(p_level), ''), 'A1'));
  if p_level not in ('A0','A1','A2','B1','B2','C1','C2') then
    raise exception 'Invalid CEFR level: %', p_level;
  end if;
  v_track := lower(coalesce(nullif(trim(p_track), ''), ''));
  -- The exam_prep plan is the STEP track. Treat its tier as track='step' so
  -- student_route() filters to the step academies (step-exam-prep) regardless of
  -- whether the caller passed p_track explicitly.
  if v_track = 'step' or p_tier = 'exam_prep' then
    p_level := coalesce(nullif(p_level, ''), 'B1');
  end if;
  if p_tier is not null and not exists (select 1 from public.plan_pricing where tier = p_tier) then
    raise exception 'Unknown plan tier: %', p_tier;
  end if;
  update public.profiles
     set subscription_tier = p_tier,
         assessed_track = case when v_track = 'step' or p_tier = 'exam_prep' then 'step' else p_tier end,
         assessed_cefr_level = p_level,
         assessed_at = coalesce(assessed_at, now()),
         updated_at = now()
   where user_id = p_user_id;
  select current_stage into v_existing_stage
    from public.student_progression where user_id = p_user_id;
  if v_existing_stage is not null then
    select a.level into v_stage_level
      from public.academies a where a.id = v_existing_stage;
  end if;
  insert into public.student_progression (user_id, current_level)
  values (p_user_id, p_level)
  on conflict (user_id) do update
    set current_level = excluded.current_level,
        current_stage = case when coalesce(lower(v_stage_level), '') = lower(p_level)
                             then student_progression.current_stage
                             else null end,
        updated_at = now();
end;
$function$;

-- Above: the exam_prep plan is the STEP track. The admin "assign plan" modal
-- (admin.js) passes p_tier='exam_prep' but not p_track, so assessed_track was
-- being stored as 'exam_prep' and student_route() (which checks track='step')
-- never filtered to the step academies -> exam-prep students were routed to
-- regular level lessons instead of step-exam-prep. Now assigning the exam_prep
-- tier sets assessed_track='step', so STEP students route to step-exam-prep.
