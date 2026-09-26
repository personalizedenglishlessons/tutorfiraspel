-- ============================================================
-- Remove remaining Gulf/Kuwaiti وايد from live content
-- Full-DB scan (215 columns, 49 tables) found 5 rows.
-- Idempotent, word-boundary guarded.
-- ============================================================

UPDATE public.lesson_exercises
SET payload = jsonb_set(payload, '{answer}', to_jsonb('احب التمر مره'::text))
WHERE id = 772 AND payload->>'answer' = 'اعشق التمر وايد';

UPDATE public.lesson_exercises
SET payload = jsonb_set(payload, '{accept}',
  to_jsonb('["احب التمر مره","احب التمر كثير"]'::jsonb))
WHERE id = 772 AND payload->'accept'->>0 = 'احب التمر وايد';

UPDATE public.lesson_exercises
SET payload = jsonb_set(payload, '{ar}', to_jsonb('هي مضحكة مره'::text))
WHERE id = 766 AND payload->>'ar' = 'هي مضحكة وايد';

UPDATE public.lesson_items
SET ar_meaning = 'هي مضحكة مره.'
WHERE id = 1656 AND ar_meaning = 'هي مضحكة وايد.';

UPDATE public.lesson_items
SET ar_meaning = 'يعشق او يحب كثير'
WHERE id = 1664 AND ar_meaning = 'يعشق او يحب وايد';

UPDATE public.words
SET example_ar = 'مشكور مره.'
WHERE id = 'so' AND example_ar = 'مشكور وايد.';
