-- 202609240007: Ensure Data API grants on all public tables and sequences.
--
-- Supabase is changing its default grant behavior on October 30, 2026:
-- new tables created in the public schema will no longer automatically get
-- Data API (PostgREST) grants. Existing tables retain their current grants,
-- but this migration ensures the live DB is fully covered AND that future
-- `supabase db reset` / preview branches won't have unreachable tables.
--
-- This migration is idempotent (GRANT is safe to re-run).

-- ============================================================
-- 1. service_role: grant ALL on every public table + sequences
--    (service_role bypasses RLS, but still needs table-level privileges
--     for the Data API / PostgREST to route requests.)
-- ============================================================

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('GRANT ALL ON public.%I TO service_role', r.table_name);
  END LOOP;
END $$;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I TO service_role', r.sequence_name);
  END LOOP;
END $$;

-- ============================================================
-- 2. Fix tables with RLS policies for authenticated but missing
--    table-level grants (RLS policies are checked AFTER table
--    privileges — no grant means no access even with a permissive RLS).
-- ============================================================

-- pel_student_feedback_events: client does supabase.from('pel_student_feedback_events').insert(...)
-- This was MISSING grants entirely — every feedback insert was silently failing.
-- UUID PK (gen_random_uuid), no sequence needed.
GRANT SELECT, INSERT ON public.pel_student_feedback_events TO authenticated;

-- student_learning_state: RLS allows authenticated SELECT/INSERT/UPDATE own rows
GRANT SELECT, INSERT, UPDATE ON public.student_learning_state TO authenticated;

-- student_presence: RLS allows authenticated SELECT own rows
GRANT SELECT ON public.student_presence TO authenticated;

-- student_activity_events: RLS allows authenticated SELECT own rows
GRANT SELECT ON public.student_activity_events TO authenticated;

-- user_roles: RLS allows authenticated SELECT own row (for role display)
GRANT SELECT ON public.user_roles TO authenticated;

-- ============================================================
-- 3. Verify: print a summary of any tables still missing service_role
--    (should be empty after this migration runs)
-- ============================================================

-- This block is informational only — it raises a NOTICE for any table
-- where service_role lacks ALL privileges. Safe to ignore in production.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND NOT has_table_privilege('service_role', t.table_name, 'SELECT, INSERT, UPDATE, DELETE')
  LOOP
    RAISE NOTICE 'WARNING: service_role missing privileges on table %', r.table_name;
  END LOOP;
END $$;
