-- Profile persistence: server-authoritative assessment blob + onboarding plan draft.
-- Replaces localStorage-only pel_assessment / pel_plan_draft so a student's
-- placement result and built plan follow them across devices; server wins on boot.
-- No em dashes anywhere in content.

create table if not exists public.student_learning_state (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  assessment  jsonb not null default '{}'::jsonb,
  plan_draft  jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.student_learning_state enable row level security;

drop policy if exists sls_owner_select on public.student_learning_state;
create policy sls_owner_select on public.student_learning_state
  for select to authenticated using (user_id = auth.uid());

drop policy if exists sls_owner_insert on public.student_learning_state;
create policy sls_owner_insert on public.student_learning_state
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists sls_owner_update on public.student_learning_state;
create policy sls_owner_update on public.student_learning_state
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Extend the existing assessment RPC to also persist the full result blob
-- (score, total, earlyStop, mode, completedAt, lang). Backward compatible:
-- the old 2-arg call still works (p_blob defaults to null, blob untouched).
-- Drop the old 2-arg overload first so only the default-arg version remains.
drop function if exists public.student_save_assessment(text, text);
create or replace function public.student_save_assessment(
  p_track text, p_level text, p_blob jsonb default null
) returns void
language plpgsql security definer set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_lvl text := upper(coalesce(nullif(trim(p_level),''),'A1'));
  v_existing_stage text;
  v_stage_level text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  update public.profiles
     set assessed_track = p_track,
         assessed_cefr_level = v_lvl,
         subscription_tier = coalesce(subscription_tier, p_track),
         assessed_at = now(),
         updated_at = now()
   where user_id = v_uid;

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

  if p_blob is not null then
    insert into public.student_learning_state (user_id, assessment, updated_at)
    values (v_uid, p_blob, now())
    on conflict (user_id) do update
      set assessment = excluded.assessment, updated_at = now();
  end if;
end;
$$;

-- Save the onboarding-built plan (the draft before or without an assigned
-- subscription). Called whenever the student builds or edits their plan.
create or replace function public.student_save_plan_draft(p_draft jsonb)
returns void
language plpgsql security definer set search_path to 'public'
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_draft is null then return; end if;
  insert into public.student_learning_state (user_id, plan_draft, updated_at)
  values (v_uid, p_draft, now())
  on conflict (user_id) do update
    set plan_draft = excluded.plan_draft, updated_at = now();
end;
$$;

-- Boot read: server-authoritative assessment + plan draft. Server wins over
-- localStorage on boot. has_subscription tells the frontend whether the
-- assigned plan (student_effective_state) should take priority over the draft.
create or replace function public.student_get_learning_state()
returns jsonb
language plpgsql security definer set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_row record;
  v_sub boolean;
begin
  if v_uid is null then return jsonb_build_object('ok',false,'reason','unauthenticated'); end if;
  select * into v_row from public.student_learning_state where user_id = v_uid;
  select exists(select 1 from public.subscriptions s
                 where s.user_id = v_uid and s.is_current = true) into v_sub;
  return jsonb_build_object(
    'ok', true,
    'assessment', coalesce(v_row.assessment, '{}'::jsonb),
    'plan_draft', coalesce(v_row.plan_draft, '{}'::jsonb),
    'has_subscription', coalesce(v_sub, false)
  );
end;
$$;
