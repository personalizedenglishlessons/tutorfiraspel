-- 202610030001: Ensure public (anon) read access on safe site_settings keys.
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
-- Security: only safe public-config keys are exposed to anon. Admin-only
-- keys (if any are added later) are NOT automatically public.
--
-- Idempotent: DROP + CREATE ensures deterministic behavior even if a
-- broader policy with the same name already exists.

-- 0. Drop any existing policy with this name (could be a broader USING(true))
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;

-- 1. Table-level grant for anon + authenticated (PostgREST requires this
--    even with RLS — RLS further filters which rows are visible)
GRANT SELECT ON public.site_settings TO anon, authenticated;

-- 2. RLS policy: allow anon + authenticated to read only safe public keys.
--    Writes are gated by admin_upsert_site_setting RPCs (SECURITY DEFINER).
CREATE POLICY "site_settings_public_read"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key IN (
      'banner',
      'whatsapp_contact',
      'maintenance_mode',
      'plan_6m_available',
      'faqs',
      'hero_headline_ar',
      'hero_headline_en',
      'hero_sub_ar',
      'hero_sub_en',
      'pricing_note_ar',
      'pricing_note_en'
    )
  );
