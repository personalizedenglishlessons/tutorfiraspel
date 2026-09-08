-- 202609080001: pel_srs_state — server-side spaced-repetition scheduling.
-- The stage engine (lib/pel_lesson_stage.js) keeps an SM-2-lite schedule in
-- localStorage (pel_srs_v1). This table is the server mirror so schedules
-- survive device switches: the client pushes srsRecord() updates and pulls
-- due items with srsDueList(). RLS: a student can only read/write their own
-- rows (same pattern as pel_student_feedback_events).
-- NOTE: client-side sync wiring is the NEXT step (see NEXT_STEPS.md) — the
-- local-first engine works without it; this table is ready for when it lands.

create table if not exists public.pel_srs_state (
  user_id   uuid not null references auth.users (id) on delete cascade,
  en        text not null,
  ease      double precision not null default 2.5,
  interval_days integer not null default 0,
  streak    integer not null default 0,
  due_at    timestamptz not null default now(),
  snap      jsonb not null default '{}'::jsonb,  -- {en, ar, translit}
  updated_at timestamptz not null default now(),
  primary key (user_id, en)
);

alter table public.pel_srs_state enable row level security;

drop policy if exists "own srs rows select" on public.pel_srs_state;
create policy "own srs rows select" on public.pel_srs_state
  for select using (auth.uid() = user_id);

drop policy if exists "own srs rows upsert" on public.pel_srs_state;
create policy "own srs rows upsert" on public.pel_srs_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "own srs rows update" on public.pel_srs_state;
create policy "own srs rows update" on public.pel_srs_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own srs rows delete" on public.pel_srs_state;
create policy "own srs rows delete" on public.pel_srs_state
  for delete using (auth.uid() = user_id);

create index if not exists pel_srs_state_due_idx
  on public.pel_srs_state (user_id, due_at);
