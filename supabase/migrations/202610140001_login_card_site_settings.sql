-- Login card copy (names, notes, button, subscription-end lines) is editable
-- from Admin > Billing and read publicly by login.html. Keys use the lc_ prefix.
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
GRANT SELECT ON public.site_settings TO anon, authenticated;
CREATE POLICY "site_settings_public_read"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key IN ('banner','whatsapp_contact','maintenance_mode','plan_6m_available','faqs',
            'hero_headline_ar','hero_headline_en','hero_sub_ar','hero_sub_en',
            'pricing_note_ar','pricing_note_en')
    OR key LIKE 'lc\_%'
  );
