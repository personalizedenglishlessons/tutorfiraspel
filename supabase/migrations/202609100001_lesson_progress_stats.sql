-- 202609100001: persist Recognition-vs-Production stats per lesson completion
--
-- lesson_progress existed but was never written. complete_activity now
-- upserts one row per (user, lesson) carrying the lesson-stage counters:
--   rec_ok/rec_total       recognition exercises correct/attempted
--   prod_ok/prod_total     production exercises correct/attempted (eventual)
--   prod_first_ok          production correct on the FIRST attempt
--                          (the mastery-gate signal; denominator = prod_total)
-- admin_student_360 surfaces the aggregates + recent rows to the admin
-- Learning tab (admin/admin.js renderTabLearning).

alter table public.lesson_progress
  add column if not exists rec_ok int,
  add column if not exists rec_total int,
  add column if not exists prod_ok int,
  add column if not exists prod_total int,
  add column if not exists prod_first_ok int;

-- complete_activity: new optional p_stats jsonb param, upserts lesson_progress.
CREATE OR REPLACE FUNCTION public.complete_activity(
  p_lesson_id text,
  p_score integer DEFAULT NULL::integer,
  p_concepts jsonb DEFAULT NULL::jsonb,
  p_stats jsonb DEFAULT NULL::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  uid uuid := auth.uid();
  p public.student_progression%rowtype;
  rec record; done_set text[]; newconcepts jsonb; ck jsonb;
  nxt record; route text[]; idx int;
  passed boolean; k text; v jsonb;
begin
  if uid is null then return jsonb_build_object('ok',false,'reason','unauthenticated'); end if;
  if not (public._prog_is_admin() or coalesce(public.can_access_pel(uid), false)) then
    return jsonb_build_object('ok',false,'reason_en','No active plan.','reason_ar','لا يوجد خطة فعالة.');
  end if;

  select l.id, l.title_en, l.title_ar, l.minutes, l.level, l.active, l.kind,
         l.skills, l.goals, l.contexts, l.prereqs, l.version,
         al.sort_order, al.academy_id into rec
    from public.lessons l join public.academy_lessons al on al.lesson_id = l.id
    where l.id = p_lesson_id and l.active limit 1;
  if rec.id is null then return jsonb_build_object('ok',false,'reason','unknown lesson'); end if;

  p := public._prog_for(uid);

  -- record completion (dedupe, keep first score unless improved)
  if not exists (select 1 from jsonb_array_elements(p.completed_lessons) e where e->>'id' = p_lesson_id) then
    p.completed_lessons := p.completed_lessons || jsonb_build_array(
      jsonb_build_object('id',p_lesson_id,'at',to_char(now(),'YYYY-MM-DD'),'score',coalesce(p_score,100)));
  elsif p_score is not null then
    update public.student_progression s
       set completed_lessons = (select jsonb_agg(case when e->>'id'=p_lesson_id
             then jsonb_build_object('id',p_lesson_id,'at',e->>'at','score',greatest(coalesce(p_score,0),(e->>'score')::int))
             else e end order by ord)
           from jsonb_array_elements(s.completed_lessons) with ordinality t(e,ord))
     where s.user_id = uid;
    select * into p from public.student_progression where user_id = uid;
  end if;

  -- lesson_progress row with Recognition-vs-Production stats (analytics).
  -- One row per (user, lesson): latest completion wins, score keeps its best.
  insert into public.lesson_progress
    (user_id, lesson_id, academy_id, status, score, completed_at,
     rec_ok, rec_total, prod_ok, prod_total, prod_first_ok)
  values
    (uid, p_lesson_id, rec.academy_id, 'completed', coalesce(p_score,100), now(),
     coalesce((p_stats->>'recOk')::int,0), coalesce((p_stats->>'recTotal')::int,0),
     coalesce((p_stats->>'prodOk')::int,0), coalesce((p_stats->>'prodTotal')::int,0),
     coalesce((p_stats->>'prodFirstOk')::int,0))
  on conflict (user_id, lesson_id) do update set
    status = 'completed',
    score = greatest(coalesce(public.lesson_progress.score,0), coalesce(excluded.score,0)),
    completed_at = now(),
    rec_ok = excluded.rec_ok, rec_total = excluded.rec_total,
    prod_ok = excluded.prod_ok, prod_total = excluded.prod_total,
    prod_first_ok = excluded.prod_first_ok;

  -- concept mastery evidence
  if p_concepts is not null then
    newconcepts := p.concept_mastery;
    for k, v in select * from jsonb_each(p_concepts) loop
      newconcepts := jsonb_set(newconcepts, ARRAY[k],
        jsonb_build_object(
          'evidence', coalesce((newconcepts->k->>'evidence')::int,0)+1,
          'correct',  coalesce((newconcepts->k->>'correct')::int,0) + case when coalesce(v->>'ok')::boolean then 1 else 0 end));
    end loop;
    p.concept_mastery := newconcepts;
  end if;

  -- checkpoint evaluation
  if rec.kind = 'checkpoint' then
    passed := coalesce(p_score, 70) >= 70;
    ck := jsonb_build_object('passed', passed, 'score', coalesce(p_score,0),
                             'at', to_char(now(),'YYYY-MM-DD'));
    if passed then
      p.checkpoint_results := jsonb_set(p.checkpoint_results, ARRAY[rec.academy_id], ck);
    else
      p.checkpoint_results := jsonb_set(p.checkpoint_results, ARRAY[rec.academy_id], ck);
      p.review_queue := coalesce(p.review_queue,'[]'::jsonb) || coalesce(p_concepts,'[]'::jsonb);
    end if;
  end if;

  -- advance pointer within stage
  select l.id, l.title_en into nxt
  from public.academy_lessons al
  join public.lessons l on l.id = al.lesson_id and l.active
  where al.academy_id = rec.academy_id and al.sort_order > rec.sort_order
    and not exists (select 1 from jsonb_array_elements(p.completed_lessons) e where e->>'id' = l.id)
  order by al.sort_order limit 1;

  if nxt.id is not null then
    p.current_lesson := nxt.id;
    p.current_stage  := rec.academy_id;
  else
    -- stage exhausted -> move to next stage in route
    route := public._prog_route_ids(uid);
    idx := array_position(route, rec.academy_id);
    p.current_stage := coalesce(route[idx+1], rec.academy_id);
    select l.id into p.current_lesson
    from public.academy_lessons al join public.lessons l on l.id = al.lesson_id and l.active
    where al.academy_id = p.current_stage
      and not exists (select 1 from jsonb_array_elements(p.completed_lessons) e where e->>'id'=l.id)
    order by al.sort_order limit 1;
    -- earned level promotion when crossing into a higher band
    if exists (select 1 from public.academies a
               where a.id = p.current_stage and public._prog_rank(a.level) > public._prog_rank(p.current_level)) then
      select upper(a.level) into p.current_level from public.academies a where a.id = p.current_stage;
    end if;
  end if;

  update public.student_progression s set
    current_level = p.current_level, current_stage = p.current_stage,
    current_lesson = p.current_lesson, completed_lessons = p.completed_lessons,
    checkpoint_results = p.checkpoint_results, concept_mastery = p.concept_mastery,
    review_queue = p.review_queue, updated_at = now()
  where s.user_id = uid;

  return public.student_effective_state();
end;
$function$;

-- admin_student_360: new 'lesson_stats' key — aggregates + 12 most recent
-- per-lesson rows from lesson_progress, surfaced in the admin Learning tab.
-- (Function body change; see the deployed definition for the exact SQL.)
