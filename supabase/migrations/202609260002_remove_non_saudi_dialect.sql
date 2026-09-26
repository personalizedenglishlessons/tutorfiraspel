-- ============================================================
-- Remove non-Saudi dialect words + "Saudis" attributions from DB
--
-- Per tutor's direction (2026-09-26):
-- 1. No Egyptian/Iraqi/Levantine/Kuwaiti words: مش (Egyptian),
--    بدي (Levantine), وايد (Gulf/Kuwaiti), خالص sign-off
-- 2. Never attribute mistakes/habits to Saudis — generic wording
--
-- Affected rows (verified by query):
--   lesson_exercises 763  question.ar  'مش كبير يعني:'     → 'مو كبير يعني:'
--   lesson_exercises 706  prompt.ar    'رتب: مشكور وايد.'   → 'رتب: مشكور مره.'
--   lesson_exercises 706  ar           'مشكور جدا'          → 'مشكور مره'
--   lesson_exercises 1561 payload why_ar '"a latte" مش'     → '"a latte" مو'
--   lesson_items 853      ar_meaning   'بدي الدجاج'         → 'ابي الدجاج'
--   lesson_items 1504     ar_meaning   'مشكور وايد'         → 'مشكور مره'
--   lesson_items 2681     ar_meaning   'مع خالص التحية'     → 'تحياتي'
-- All replacements are idempotent.
-- ============================================================

-- 1. Exercises: Egyptian مش → Saudi مو
UPDATE public.lesson_exercises
SET payload = replace(payload::text, 'مش كبير يعني:', 'مو كبير يعني:')::jsonb
WHERE id = 763 AND payload::text LIKE '%مش كبير%';

UPDATE public.lesson_exercises
SET payload = replace(payload::text, 'رتب: مشكور وايد.', 'رتب: مشكور مره.')::jsonb
WHERE id = 706 AND payload::text LIKE '%مشكور وايد%';

UPDATE public.lesson_exercises
SET payload = replace(payload::text, '"ar": "مشكور جدا"', '"ar": "مشكور مره"')::jsonb
WHERE id = 706 AND payload::text LIKE '%مشكور جدا%';

UPDATE public.lesson_exercises
SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', ' مش ', ' مو ')))
WHERE id = 1561 AND payload->>'why_ar' LIKE '% مش %';

-- 2. lesson_items
UPDATE public.lesson_items
SET ar_meaning = 'ايه، ابي الدجاج المشوي مع الرز لو سمحت.'
WHERE id = 853 AND ar_meaning LIKE '%بدي الدجاج%';

UPDATE public.lesson_items
SET ar_meaning = 'مشكور مره.'
WHERE id = 1504 AND ar_meaning LIKE '%مشكور وايد%';

UPDATE public.lesson_items
SET ar_meaning = 'تحياتي'
WHERE id = 2681 AND ar_meaning LIKE '%خالص%';

-- 3. Defensive sweep (idempotent no-ops if absent)
UPDATE public.lesson_items
SET ar_meaning = replace(ar_meaning, 'عند السعوديين', 'عند ناس كثيرين')
WHERE ar_meaning LIKE '%عند السعوديين%';

UPDATE public.lesson_items
SET note_ar = replace(replace(note_ar, 'عند السعوديين', 'عند ناس كثيرين'), 'السعوديين يقولون', 'نقول')
WHERE note_ar LIKE '%عند السعوديين%' OR note_ar LIKE '%السعوديين يقولون%';

UPDATE public.lesson_exercises
SET payload = replace(payload::text, 'عند السعوديين', 'عند ناس كثيرين')::jsonb
WHERE payload::text LIKE '%عند السعوديين%';

UPDATE public.lesson_exercises
SET hint_ar = replace(hint_ar, 'عند السعوديين', 'عند ناس كثيرين')
WHERE hint_ar LIKE '%عند السعوديين%';

UPDATE public.lessons
SET title_ar = replace(title_ar, 'عند السعوديين', 'عند ناس كثيرين')
WHERE title_ar LIKE '%عند السعوديين%';
