-- ============================================================
-- 202610130002_wipe_activity_tracking.sql
--
-- User directive 2026-10-13: "dont keep any activity for the admin, this is a fresh start"
-- Supabase log ingestion was at 20% of quota (0.20/1 GB) driven by
-- noisy writes. The client-side fix (same commit) stops the noise going
-- forward. This migration wipes the activity-tracking rows so the admin
-- dashboard starts clean.
--
-- Explicitly authorized wipe targets (only these):
--   student_activity_events - every activity row (login, page_view, activity)
--   student_presence         - per-student presence tracking rows
--   auth_attempts            - auth rate-limiting attempts log
--
-- NOT touched:
--   lesson_progress, student_progression, student_state, student_data,
--   audit_log, announcements, subscriptions, etc.
--
-- Idempotent and safe to re-run.
-- ============================================================

TRUNCATE TABLE public.student_activity_events;
TRUNCATE TABLE public.student_presence;
TRUNCATE TABLE public.auth_attempts;

-- Register this migration in supabase_migrations so future CLI runs
-- and the admin cleanup UI can track it.
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES ('202610130002', 'wipe_activity_tracking', ARRAY[
  'TRUNCATE student_activity_events',
  'TRUNCATE student_presence',
  'TRUNCATE auth_attempts'
])
ON CONFLICT (version) DO NOTHING;
