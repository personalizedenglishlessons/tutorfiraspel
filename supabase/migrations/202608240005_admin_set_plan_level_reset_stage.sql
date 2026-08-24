-- ============================================================
-- 005 · admin_set_student_plan_level: reset current_stage on level change
-- Mirrors migration 002's routing reset so an admin reassignment to C1
-- (etc.) drops a stale current_stage from a different-level academy,
-- exactly like a fresh placement-test result would.
-- ============================================================
create or replace function public.admin_set_student_plan_level(
  p_user_id uuid, p_tier text, p_level text
) returns void language plpgsql security definer set search_path to 'public' as $$
declare
  v_existing_stage text;
  v_stage_level text;
begin
  if not has_permission('subscriptions.manage'::text) then
    raise exception 'Insufficient permission: subscriptions.manage';
  end if;
  -- upper-case the level so it matches the routing convention (C1, A2, ...)
  p_level := upper(coalesce(nullif(trim(p_level), ''), 'A1'));
  if p_level not in ('A1','A2','B1','B2','C1','C2') then
    raise exception 'Invalid CEFR level: %', p_level;
  end if;
  if p_tier is not null and not exists (select 1 from public.plan_pricing where tier = p_tier) then
    raise exception 'Unknown plan tier: %', p_tier;
  end if;

  update public.profiles
     set subscription_tier = p_tier,
         assessed_track = p_tier,
         assessed_cefr_level = p_level,
         assessed_at = coalesce(assessed_at, now()),
         updated_at = now()
   where user_id = p_user_id;

  -- mirror migration 002: if the student is parked in an academy whose
  -- level no longer matches the new level, clear current_stage so they
  -- land in a matching-level academy on next load.
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
$$;

-- keep the execute grant current
GRANT EXECUTE ON FUNCTION public.admin_set_student_plan_level(uuid,text,text) TO authenticated;
