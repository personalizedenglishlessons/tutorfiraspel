-- auth_attempts: server-side login rate limiting for the rate-limited-login Edge Function.
-- Only the service role (used inside the Edge Function) reads/writes this table.
-- RLS is enabled with NO policies, so the anon/public key cannot read or write it.
-- (The service role bypasses RLS, so the Edge Function can count + insert.)

create table if not exists public.auth_attempts (
  id          bigint generated always as identity primary key,
  ip          text not null,
  email       text,
  ok          boolean not null,
  created_at  timestamptz not null default now()
);

create index if not exists auth_attempts_ip_created_idx
  on public.auth_attempts (ip, created_at desc);

alter table public.auth_attempts enable row level security;
-- no policies => anon/authenticated cannot access; service role (Edge Function) can.

-- optional: prune old attempts nightly so the table stays small.
-- run once in the SQL editor or schedule via pg_cron if available:
-- delete from public.auth_attempts where created_at < now() - interval '24 hours';
