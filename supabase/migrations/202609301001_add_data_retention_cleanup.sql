-- Migration: 202609301001_add_data_retention_cleanup.sql
--
-- Problem: several append-only tables grow indefinitely with no cleanup:
--   - student_activity_events: every page view + 60s heartbeat, never pruned
--   - auth_attempts: every login attempt, never pruned
--   - audit_log: every admin action, never pruned
--   - pel_student_feedback_events: writing feedback, never pruned
--
-- This migration:
--   1. Adds a pel_cleanup_old_data() SECURITY DEFINER function that prunes old rows
--   2. Tries to schedule it via pg_cron (if available)
--   3. Runs the cleanup once immediately
--
-- Retention windows (keep only recent data, old data is not useful):
--   - student_activity_events: 14 days (presence tracking only needs recent data)
--   - auth_attempts: 3 days (rate limiting only needs recent data)
--   - audit_log: 90 days (admin audit trail)
--   - pel_student_feedback_events: 30 days (writing feedback is ephemeral)
--
-- NOTE: VACUUM cannot run inside a PL/pgSQL function. If pg_cron is available,
--       the scheduled job runs the function, and VACUUM can be run separately.
--       Without pg_cron, an admin can call select pel_cleanup_old_data() from
--       the SQL editor and then run VACUUM ANALYZE on the affected tables.

-- ============================================================
-- 1. CLEANUP FUNCTION
-- ============================================================

create or replace function public.pel_cleanup_old_data()
returns text
language plpgsql
security definer
as $$
declare
  v_deleted_activity bigint;
  v_deleted_auth bigint;
  v_deleted_audit bigint;
  v_deleted_feedback bigint;
  v_total_deleted bigint := 0;
begin
  delete from public.student_activity_events
    where created_at < now() - interval '14 days';
  get diagnostics v_deleted_activity = row_count;
  v_total_deleted := v_total_deleted + v_deleted_activity;

  delete from public.auth_attempts
    where created_at < now() - interval '3 days';
  get diagnostics v_deleted_auth = row_count;
  v_total_deleted := v_total_deleted + v_deleted_auth;

  delete from public.audit_log
    where created_at < now() - interval '90 days';
  get diagnostics v_deleted_audit = row_count;
  v_total_deleted := v_total_deleted + v_deleted_audit;

  delete from public.pel_student_feedback_events
    where created_at < now() - interval '30 days';
  get diagnostics v_deleted_feedback = row_count;
  v_total_deleted := v_total_deleted + v_deleted_feedback;

  return 'cleanup_ok: activity=' || v_deleted_activity ||
         ' auth=' || v_deleted_auth ||
         ' audit=' || v_deleted_audit ||
         ' feedback=' || v_deleted_feedback ||
         ' total=' || v_total_deleted;
end;
$$;

-- Grant execute to service_role (admin can call it, anon cannot)
revoke all on function public.pel_cleanup_old_data() from public;
grant execute on function public.pel_cleanup_old_data() to service_role;

-- ============================================================
-- 2. RUN CLEANUP ONCE (immediately)
-- ============================================================

select public.pel_cleanup_old_data();

-- ============================================================
-- 3. SCHEDULE NIGHTLY CLEANUP VIA pg_cron (if available)
-- ============================================================

-- Try to enable pg_cron extension (may fail if not available on the plan)
do $do$
begin
  -- Check if pg_cron extension exists
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Schedule nightly cleanup at 3:00 AM UTC
    perform cron.schedule(
      'pel-nightly-cleanup',
      '0 3 * * *',
      $$select public.pel_cleanup_old_data()$$
    );
  end if;
exception when others then
  -- pg_cron not available — the function can be called manually
  -- via the admin panel or SQL editor when needed
  null;
end;
$do$;
