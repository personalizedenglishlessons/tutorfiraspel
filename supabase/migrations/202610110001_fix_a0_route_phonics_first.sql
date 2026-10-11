-- Fix A0 route order: restore phonics-first sequence (regression from 202610070001)
--
-- Migration 202610060004 (Oct 6) correctly put a0-spelling-sounds (alphabet +
-- phonics) FIRST in the A0 granular_seq. Migration 202610070001 (Oct 7,
-- "enforce CEFR boundaries") rewrote student_route() and accidentally
-- reverted the A0 order to put a0-sentence-building first — a student
-- assigned the A0 English Starter plan was seated in "you are sentences"
-- instead of the alphabet lesson.
--
-- This restores the correct pedagogical order:
--   1. a0-spelling-sounds  (alphabet → letter sounds → vowels)
--   2. a0-social-english   (hello/goodbye survival)
--   3. a0-home-words       (I/you/me)
--   4. a0-sentence-building
--   5. a0-question-words
--   6. a0-error-clinic
--
-- The strict CEFR-boundary filter and STEP isolation from 202610070001
-- are preserved unchanged.

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
        -- A0: phonics first (alphabet → sounds → connecting letters), then words
        ('a0','a0-spelling-sounds',0),('a0','a0-social-english',1),('a0','a0-home-words',2),('a0','a0-sentence-building',3),('a0','a0-question-words',4),('a0','a0-error-clinic',5),
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
