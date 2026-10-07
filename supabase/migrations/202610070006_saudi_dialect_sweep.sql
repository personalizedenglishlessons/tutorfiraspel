-- Saudi-dialect-only sweep (2026-10-07): remove last تهجي (Iraqi spelling
-- verb) and a formal-Arabic phrase from live content.
-- Repo rule: Saudi dialect only — no Kuwaiti/Emirati/Iraqi/Levantine/Egyptian
-- words, no formal Arabic explanations. تهجي family is Iraqi per
-- 202609260001_fix_mangled_arabic_dialect.sql (convention: الاملاء / كيف تكتبها).

-- 1. the-alphabet order exercise: "تمام. تهجيها بحرف اس واحد؟" (Iraqi تهجيها)
--    → Saudi "تمام. تكتبها بحرف اس واحد؟"
UPDATE public.lesson_exercises
SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb('تمام. تكتبها بحرف اس واحد؟'::text))
WHERE id = 309
  AND payload->'prompt'->>'ar' = 'تمام. تهجيها بحرف اس واحد؟';

-- 2. c2-pack2-01 item: formal Arabic "من البديهي ان" → Saudi "واضح ان"
UPDATE public.lesson_items
SET ar_meaning = 'واضح ان'
WHERE id = 2937 AND ar_meaning = 'من البديهي ان';

UPDATE public.lesson_items
SET example_ar = 'واضح ان التمرين مهم.'
WHERE id = 2937 AND example_ar = 'من البديهي ان التمرين مهم.';
