-- ============================================================
-- 202608270004 · Route priority beats tag hits; assigned plan beats onboarding
-- ------------------------------------------------------------
-- Two correctness fixes on top of 202608270002:
-- 1) student_route() order by changed from
--      (level_fit*10+tag_hits) desc, route_priority, sort_order, tiebreak
--    to  level_fit desc, route_priority asc, tag_hits desc, sort_order, tiebreak.
--    Previously a same-level thematic academy with tag_hits=1 could outrank the
--    granular start (tag_hits=0). Now the assigned level's granular first lesson
--    always wins before goals/contexts. (score payload unchanged for the UI.)
-- 2) _prog_for() onboarding goal/context override is now gated by
--    if not can_access_pel(p_uid): paid/assigned students (active subscription
--    or admin) skip the onboarding override and are seated from their route's
--    first academy (granular start), so an assigned plan always wins over
--    onboarding prefs. Free/unassigned students keep the goal/context behavior.
-- ============================================================

CREATE OR REPLACE FUNCTION public.student_route(p_profile jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      left join granular_seq gs on gs.academy_id = a.id and gs.level_pref = v_level
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

CREATE OR REPLACE FUNCTION public._prog_for(p_uid uuid)
 RETURNS student_progression
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  r public.student_progression%rowtype;
  v_hint text;
  v_track text;
  v_route jsonb;
  v_route_ids text[];
  v_first_lesson text;
  v_pref jsonb; v_goal text;
begin
  select * into r from public.student_progression where user_id = p_uid;

  if not found then
    select coalesce(
             nullif(s.student_prefs->>'startingLevel',''),
             nullif(s.student_prefs->>'estimatedStartingLevel',''),
             nullif(s.student_prefs->>'level',''))
      into v_hint
    from public.student_state s where s.user_id = p_uid;

    insert into public.student_progression(user_id, current_level)
    values (p_uid, upper(coalesce(v_hint,'A1')))
    on conflict (user_id) do nothing;

    select * into r from public.student_progression where user_id = p_uid;

    -- starting stage: for FREE / unassigned students, honor the onboarding
    -- goal choice FIRST (active academy), then best level fit. For PAID /
    -- assigned students (active subscription or admin) the assigned plan wins —
    -- skip the onboarding override and seat them from their route's first
    -- academy (granular skill start) below. The chosen path is stored, not
    -- guessed per visit.
    if not public.can_access_pel(p_uid) then
    begin
      select s.student_prefs into v_pref from public.student_state s where s.user_id = p_uid;
      select coalesce(
        nullif(v_pref->>'active_academy',''),
        nullif(v_pref->>'academy',''),
        nullif(v_pref->>'path','')
      ) into v_goal;
      if v_goal is null and v_pref ? 'goals' and jsonb_typeof(v_pref->'goals')='array' then
        select x#>>'{}' into v_goal from jsonb_array_elements(v_pref->'goals') x limit 1;
      elsif v_goal is null and v_pref ? 'goal' then
        v_goal := v_pref->>'goal';
      end if;
      if v_goal is not null then
        select a.id into r.current_stage
        from public.academies a
        join public.academy_tags t on t.academy_id = a.id
          and lower(t.tag_type) in ('goal','context') and lower(t.tag_value) = lower(left(v_goal,40))
        where a.active
        order by public._prog_rank(a.level) desc, a.sort_order asc
        limit 1;
      end if;
      if r.current_stage is null and v_pref is not null and v_pref ? 'contexts' and jsonb_typeof(v_pref->'contexts')='array' then
        select a.id into r.current_stage
        from public.academies a
        join public.academy_tags t on t.academy_id = a.id
          and t.tag_type='context' and lower(t.tag_value) = any(array(select lower(y#>>'{}') from jsonb_array_elements_text(v_pref->'contexts') y))
        where a.active
        order by public._prog_rank(a.level) desc, a.sort_order asc
        limit 1;
      end if;
    exception when others then
      null;
    end;
    end if;
    if r.current_stage is null then
      -- Fall back to the first academy of the student's assigned route.
      -- student_route() orders granular skill lessons first for the level, so a
      -- new student is seated at their level's first guided lesson (a1 ->
      -- a1-core-words, a2 -> a2-past-simple, b1 -> b1-connectors-opinions,
      -- b2 -> b2-professional-comm, step -> step-exam-prep) instead of a
      -- sort_order-low thematic/overview academy.
      v_track := lower(coalesce(
        (select pr.assessed_track from public.profiles pr where pr.user_id = p_uid), ''));
      v_route := public.student_route(jsonb_build_object(
        'level', lower(coalesce(r.current_level,'A1')), 'track', v_track));
      if coalesce(jsonb_array_length(v_route), 0) > 0 then
        select x->>'id' into r.current_stage from jsonb_array_elements(v_route) x limit 1;
      end if;
    end if;
    if r.current_stage is null then
      select a.id into r.current_stage from public.academies a
        where a.active order by a.sort_order asc limit 1;
    end if;
  end if;

  -- TRACK RECONCILIATION (new + existing rows): make sure current_stage is a
  -- member of the student's track-filtered route. This is what enforces
  -- STEP-only placement at load time, not just at route listing.
  select lower(coalesce(pr.assessed_track, '')) into v_track
    from public.profiles pr where pr.user_id = p_uid;
  v_route := public.student_route(jsonb_build_object(
              'level', lower(coalesce(r.current_level, 'a1')),
              'track', v_track));
  select coalesce(array_agg(x->>'id'), '{}') into v_route_ids
    from jsonb_array_elements(v_route) x;
  if v_route_ids <> '{}' then
    if r.current_stage is null or not (r.current_stage = any(v_route_ids)) then
      select x->>'id' into r.current_stage from jsonb_array_elements(v_route) x limit 1;
    end if;
  end if;

  -- ensure current_lesson is valid for the (possibly new) current_stage
  if r.current_stage is not null then
    select l.id into v_first_lesson
      from public.academy_lessons al
      join public.lessons l on l.id = al.lesson_id and l.active
      where al.academy_id = r.current_stage
      order by al.sort_order asc limit 1;
    if v_first_lesson is not null
       and (r.current_lesson is null
            or not exists (select 1 from public.academy_lessons al
                            where al.academy_id = r.current_stage
                              and al.lesson_id = r.current_lesson)) then
      r.current_lesson := v_first_lesson;
    end if;
  end if;

  update public.student_progression
     set current_stage = r.current_stage,
         current_lesson = r.current_lesson,
         updated_at = now()
   where user_id = p_uid;
  return r;
end;
$function$;
