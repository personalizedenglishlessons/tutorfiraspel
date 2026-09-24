-- 005: Globally granular route + clear stage on plan assignment
-- Makes the granular-lesson priority apply per ACADEMY's own level (not just the
-- student's current level), so when a student reaches A2/B1/B2 content the route
-- still puts granular academies (a2-past-simple, b1-connectors-opinions,
-- b2-professional-comm) before thematic/overview ones (a2-complete-course,
-- american-conversations, writing-workshop, b2-complete-course).
-- Also clears the stage/lesson pointer when a plan is (re)assigned so the student
-- is reseated at their assigned level's granular first lesson via student_route()
-- instead of lingering on a leftover thematic/overview academy. completed_lessons
-- is a separate set and is preserved, so no progress is lost.

create or replace function public.student_route(p_profile jsonb DEFAULT '{}'::jsonb)
returns jsonb language plpgsql stable security definer set search_path to 'public'
as $function$
declare
  v_level text := lower(coalesce(p_profile->>'level', 'a1'));
  v_track text := lower(coalesce(p_profile->>'track', ''));
  v_goals text[] := (
    select coalesce(array_agg(lower(g)), '{}')
    from jsonb_array_elements_text(coalesce(p_profile->'goals', '[]'::jsonb)) g
  );
  v_contexts text[] := (
    select coalesce(array_agg(lower(c)), '{}')
    from jsonb_array_elements_text(coalesce(p_profile->'contexts', '[]'::jsonb)) c
  );
  v_skills text[] := (
    select coalesce(array_agg(lower(s)), '{}')
    from jsonb_array_elements_text(coalesce(p_profile->'skills', '[]'::jsonb)) s
  );
  v_level_rank int;
begin
  select min(x.rk) into v_level_rank
    from (values ('a0',0),('a1',1),('a2',2),('b1',3),('b2',4),('c1',5),('c2',6),('step',6)) x(lv, rk)
    where x.lv = v_level;
  v_level_rank := coalesce(v_level_rank, 1);

  return coalesce((
    with granular_seq(level_pref, academy_id, seq) as (
      values
        ('a0','a0-sentence-building',0),('a0','a0-question-words',1),('a0','a0-spelling-sounds',2),('a0','a0-error-clinic',3),('a0','a0-social-english',4),
        ('a1','a1-core-words',0),('a1','a1-present-simple',1),('a1','a1-daily-verbs',2),('a1','a1-can-requests',3),('a1','a1-place-time',4),('a1','a1-possession',5),('a1','a1-time-numbers',6),('a1','a1-vocab-context',7),
        ('a2','a2-past-simple',0),('a2','a2-future-plans',1),
        ('b1','b1-connectors-opinions',0),
        ('b2','b2-professional-comm',0),
        ('c1','c1-advanced-english',0),
        ('c2','c2-near-native',0),
        ('step','step-exam-prep',0)
    ),
    scored as (
      select a.id,
        greatest(0, 3 - abs(coalesce(
          (select x.rk from (values ('a0',0),('a1',1),('a2',2),('b1',3),('b2',4),('c1',5),('c2',6),('step',6)) x(lv, rk)
           where x.lv = lower(a.level)), 1) - v_level_rank)) as level_fit,
        (
          select count(*) from public.academy_tags t
          where t.academy_id = a.id
            and ((t.tag_type = 'goal' and lower(t.tag_value) = any(v_goals))
              or (t.tag_type = 'context' and lower(t.tag_value) = any(v_contexts))
              or (t.tag_type = 'skill' and lower(t.tag_value) = any(v_skills)))
        ) as tag_hits,
        a.sort_order, a.id as tiebreak,
        coalesce(gs.seq, 1000) as route_priority
      from public.academies a
      left join granular_seq gs on gs.academy_id = a.id and gs.level_pref = lower(a.level)
      where a.active = true
        and (
          (v_track = 'step' and exists (
            select 1 from public.track_academies ta
            where ta.track_id = 'track-step-exam' and ta.academy_id = a.id
          ))
          or
          (coalesce(v_track,'') <> 'step' and not exists (
            select 1 from public.track_academies ta
            where ta.track_id = 'track-step-exam' and ta.academy_id = a.id
          ))
        )
    )
    select jsonb_agg(jsonb_build_object('id', id, 'score', level_fit * 10 + tag_hits)
      order by level_fit desc, route_priority asc, tag_hits desc, sort_order asc, tiebreak asc)
    from scored
  ), '[]'::jsonb);
end;
$function$;

drop function if exists public.admin_set_student_plan_level(uuid, text, text, text);
create or replace function public.admin_set_student_plan_level(p_user_id uuid, p_tier text, p_level text, p_track text default null)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_stage_level text;
  v_valid boolean;
begin
  if not public._prog_is_admin() then
    return jsonb_build_object('ok',false,'reason','Admin only.');
  end if;

  -- A STEP / exam-prep plan implies the STEP track. Accept either the explicit
  -- p_track or a p_tier of 'exam_prep' (admin.js calls with p_tier='exam_prep'
  -- and no p_track), so the assigned student is routed to step-exam-prep rather
  -- than the normal A-level academies.
  if lower(coalesce(p_tier,'')) = 'exam_prep' or lower(coalesce(p_track,'')) = 'step' then
    p_track := 'step';
  end if;

  if lower(coalesce(p_track,'')) = 'step' then
    select exists(select 1 from public.academies a where a.id = 'step-exam-prep' and a.active = true) into v_valid;
    if not v_valid then
      return jsonb_build_object('ok',false,'reason','STEP exam-prep academy is not configured.');
    end if;
    update public.profiles set assessed_track = 'step', updated_at = now() where user_id = p_user_id;
  end if;

  select exists (select 1 from public.plan_pricing where tier = p_tier) into v_valid;
  if not v_valid then
    return jsonb_build_object('ok',false,'reason','Unknown plan tier: ' || coalesce(p_tier,''));
  end if;

  insert into public.student_progression (user_id, current_level)
  values (p_user_id, p_level)
  on conflict (user_id) do update
    set current_level = excluded.current_level,
        -- Clear the stage/lesson pointer on (re)assignment so _prog_for reseats
        -- the student at their assigned level's granular first lesson via
        -- student_route(), not a leftover thematic/overview academy. completed_lessons
        -- is a separate set and is preserved, so no progress is lost.
        current_stage = null,
        current_lesson = null,
        updated_at = now();

  update public.profiles set
    subscription_tier = p_tier,
    updated_at = now()
  where user_id = p_user_id;

  if lower(coalesce(p_track,'')) = 'step' then
    perform public._prog_for(p_user_id);
  end if;

  return jsonb_build_object('ok',true);
end;
$function$;
