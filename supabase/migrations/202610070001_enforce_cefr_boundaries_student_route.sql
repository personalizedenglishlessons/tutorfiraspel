-- Enforce strict CEFR level boundaries in student_route()
--
-- The owner's requirement: A0's content strictly stays in A0's,
-- A1's in A1's, A2's in A2's, B1's in B1's, B2's in B2's,
-- C1's in C1's, C2's in C2's, STEP's in STEP's.
--
-- Previously, student_route() returned ALL academies with a proximity
-- score, meaning an A0 student would see A1, A2, B1+ academies in their
-- route. Now it strictly filters to ONLY academies at the student's
-- CEFR level (or STEP track for STEP students).
--
-- Also fixes: the default level was 'a1' when no level was passed.
-- Now defaults to 'a0' so unassessed start_from_zero students get A0 content.

create or replace function public.student_route(p_profile jsonb DEFAULT '{}'::jsonb)
returns jsonb language plpgsql stable security definer set search_path to 'public'
as $function$
declare
  v_level text := lower(coalesce(p_profile->>'level', 'a0'));
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
  v_level_rank := coalesce(v_level_rank, 0);

  return coalesce((
    with granular_seq(level_pref, academy_id, seq) as (
      values
        ('a0','a0-sentence-building',0),('a0','a0-question-words',1),('a0','a0-spelling-sounds',2),('a0','a0-error-clinic',3),('a0','a0-social-english',4),('a0','a0-home-words',5),
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
        -- STRICT CEFR BOUNDARY: only academies at the student's CEFR level
        and lower(a.level) = v_level
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
    select jsonb_agg(jsonb_build_object('id', id, 'score', tag_hits)
      order by route_priority asc, tag_hits desc, sort_order asc, tiebreak asc)
    from scored
  ), '[]'::jsonb);
end;
$function$;

-- Fix english-foundations level: it contains A0 content (alphabet, greetings, etc.)
-- but was marked as A1 in the DB, causing it to be excluded from A0 routes
update public.academies set level = 'A0', updated_at = now() where id = 'english-foundations';

-- Remove cross-CEFR violations: STEP academy sharing lessons with B2/C1 academies
-- These 10 lessons appear in both step-exam-prep AND b2-complete-course or c1-advanced-english
-- Per the owner's rule, each lesson stays strictly in its CEFR level.
-- STEP exam prep should have its own dedicated lessons, not reuse B2/C1 content.
-- The canonical level for these lessons is B2 or C1 (where they belong in the complete course),
-- so we remove them from step-exam-prep only if duplicates exist there.

delete from public.academy_lessons
where academy_id = 'step-exam-prep'
  and lesson_id in (
    'b2-advanced-vocab',
    'c1-register-vocab',
    'c1-critical-reading',
    'c1-academic-writing',
    'b2-pack2-02',
    'b2-pack2-04',
    'c1-pack2-01',
    'c1-pack2-02',
    'c1-pack2-03',
    'c1-pack2-04'
  );
