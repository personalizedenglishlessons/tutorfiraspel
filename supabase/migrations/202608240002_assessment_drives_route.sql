create or replace function public.student_save_assessment(p_track text, p_level text)
returns void language plpgsql security definer set search_path to 'public' as $function$
declare
  v_uid uuid := auth.uid();
  v_lvl text := upper(coalesce(nullif(trim(p_level),''),'A1'));
  v_existing_stage text;
  v_stage_level text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  -- persist assessed track + CEFR level on the profile; default the tier if unset
  update public.profiles
     set assessed_track = p_track,
         assessed_cefr_level = v_lvl,
         subscription_tier = coalesce(subscription_tier, p_track),
         assessed_at = now(),
         updated_at = now()
   where user_id = v_uid;

  -- drive the lesson route by the assessed CEFR level: an A1 student starts at
  -- A1 lessons regardless of plan tier. reset the active academy only when its
  -- level no longer matches the assessed level, so in-progress progress inside
  -- a matching-level academy is preserved.
  select current_stage into v_existing_stage
    from public.student_progression where user_id = v_uid;
  if v_existing_stage is not null then
    select a.level into v_stage_level
      from public.academies a where a.id = v_existing_stage;
  end if;

  insert into public.student_progression (user_id, current_level)
  values (v_uid, v_lvl)
  on conflict (user_id) do update
    set current_level = excluded.current_level,
        current_stage = case when coalesce(lower(v_stage_level),'') = lower(v_lvl)
                             then student_progression.current_stage
                             else null end,
        updated_at = now();
end;
$function$;
