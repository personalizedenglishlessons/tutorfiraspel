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

create or replace function public.student_route(p_profile jsonb)
returns jsonb language sql stable security definer set search_path to 'public'
as $$
with base as (
  select
    lower(coalesce(p_profile->>'assessed_cefr_level','')) as v_level,
    lower(coalesce(p_profile->>'assessed_track',''))     as v_track,
    coalesce(p_profile->'learning_goals','[]')          as v_goals,
    coalesce(p_profile->'learning_contexts','[]')        as v_contexts
),
granular_seq (level_pref, academy_id, seq) as (
  values
    ('a0','a0-sentence-building',0),('a0','a0-question-words',1),('a0','a0-spelling-sounds',2),
    ('a0','a0-error-clinic',3),('a0','a0-social-english',4),
    ('a1','a1-core-words',0),('a1','a1-present-simple',1),('a1','a1-daily-verbs',2),('a1','a1-can-requests',3),
    ('a1','a1-place-time',4),('a1','a1-possession',5),('a1','a1-time-numbers',6),('a1','a1-vocab-context',7),
    ('a2','a2-past-simple',0),('a2','a2-future-plans',1),
    ('b1','b1-connectors-opinions',0),
    ('b2','b2-professional-comm',0),
    ('c1','c1-advanced-english',0),
    ('c2','c2-near-native',0),
    ('step','step-exam-prep',0)
),
ranked as (
  select
    a.id, a.level, a.sort_order,
    case
      when lower(a.level) = v_level then 3
      when abs((select position(lower(a.level) in 'a0a1a2b1b2c1c2') - 1)/2::float - (select position(v_level in 'a0a1a2b1b2c1c2') - 1)/2::float) = 1 then 2
      else 1
    end as level_fit,
    (
      select count(*) from jsonb_array_elements_text(v_goals) g
      where g is not null and g <> '' and exists (select 1 from academies ax, jsonb_array_elements_text(ax.tags) t where ax.id = a.id and lower(t) = lower(g))
    ) +
    (
      select count(*) from jsonb_array_elements_text(v_contexts) c
      where c is not null and c <> '' and exists (select 1 from academies ax, jsonb_array_elements_text(ax.tags) t where ax.id = a.id and lower(t) = lower(c))
    ) as tag_hits,
    a.sort_order as tiebreak,
    coalesce(gs.seq, 1000) as route_priority
  from public.academies a
  left join granular_seq gs on gs.academy_id = a.id and gs.level_pref = lower(a.level)
  cross join base
  where a.active = true
    and (
      (v_track = 'step' and exists (
        select 1 from public.track_academies ta
        join public.tracks t on t.id = ta.track_id
        where ta.academy_id = a.id and lower(t.slug) = 'step'
      ))
      or (v_track <> 'step' and not exists (
        select 1 from public.track_academies ta
        join public.tracks t on t.id = ta.track_id
        where ta.academy_id = a.id and lower(t.slug) = 'step'
      ))
    )
)
select jsonb_build_array(jsonb_build_object('id', id, 'score', (level_fit * 1000 + tag_hits))) as result
from ranked
order by level_fit desc, route_priority asc, tag_hits desc, sort_order, tiebreak;
$$;

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
