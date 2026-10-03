-- 202610030001: Ensure public (anon) read access on site_settings.
--
-- site_settings stores the homepage banner, WhatsApp contact, FAQs,
-- hero/pricing copy, and maintenance flag — all read by pel-settings.js
-- on the public landing page (index.html) via the anon key.
--
-- The table was created in an early migration (not in repo) with a
-- "public read policy" comment, but no explicit GRANT SELECT TO anon
-- exists in any tracked migration. Supabase changes its default grant
-- behavior on Oct 30 2026, so this ensures the landing page keeps working.
--
-- Idempotent: GRANT and CREATE POLICY IF NOT EXISTS are safe to re-run.

-- 1. Table-level grant for anon (PostgREST requires this even with RLS)
GRANT SELECT ON public.site_settings TO anon, authenticated;

-- 2. RLS policy: allow anon + authenticated to read all site_settings rows
--    (writes are gated by admin_upsert_site_setting RPCs — SECURITY DEFINER)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings'
      AND policyname = 'site_settings_public_read'
  ) THEN
    CREATE POLICY "site_settings_public_read"
      ON public.site_settings
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
