-- ============================================================
-- Fix mangled Arabic + Iraqi/Kuwaiti dialect words in DB text
--
-- A previous automated replacement script corrupted words via
-- ف→ين substitutions and left Iraqi/Kuwaiti vocabulary behind.
-- This migration sweeps the same word list fixed in source
-- (commit "fix: 224 mangled Arabic words") across DB text:
--   شنو/وشنو (Iraqi "what")        → وش
--   تهجي / التهجية (Iraqi spelling) → الاملاء / كيف تكتبها؟
--   يختر عليك الوقت (corruption)    → يخلص عليك الوقت
--   سوالين (corruption of سوالف)    → سوالف
--   الينعل→الفعل, الينرق→الفرق, الينهم→الفهم,
--   الينندق→الفندق, اليننادق→الفنادق, الوفلام→الافلام,
--   الوفعال→الافعال, التاخوير→التاخير, تحعشان→تكلم عن,
--   خدمه الشغلا→خدمه العملاء, تصريف الشغله→تغيير الفلوس
--
-- Verified pre-state (2026-09-26): 9 payload rows (شنو / يختر),
-- 2 lesson_items rows (شنو / تهجي), 1 lesson title (التهجية),
-- 1 academy name (التهجيه والاصوات).
-- All replacements are idempotent.
-- ============================================================

-- 1. Academy name: a0-spelling-sounds
UPDATE public.academies
SET name_ar = 'الاملاء والاصوات'
WHERE id = 'a0-spelling-sounds'
  AND name_ar LIKE '%تهجي%';

-- 2. Lesson titles (spell-cvc-at: عيلة التهجية ات)
UPDATE public.lessons
SET title_ar = replace(title_ar, 'التهجية', 'الاملاء')
WHERE title_ar LIKE '%تهجي%';

-- 3. lesson_items Arabic columns
UPDATE public.lesson_items
SET ar_meaning = replace(replace(ar_meaning, 'وشنو', 'وش'), 'شنو', 'وش')
WHERE ar_meaning LIKE '%شنو%';

UPDATE public.lesson_items
SET ar_meaning = replace(ar_meaning, 'ممكن تهجي؟', 'كيف تكتبها؟')
WHERE ar_meaning LIKE '%تهجي%';

-- Defensive sweep for the remaining corruption patterns (no-op if absent)
UPDATE public.lesson_items
SET ar_meaning = replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
        ar_meaning,
        'الينعل','الفعل'), 'الينرق','الفرق'), 'الينهم','الفهم'),
        'الينندق','الفندق'), 'اليننادق','الفنادق'),
        'الوفلام','الافلام'), 'الوفعال','الافعال'),
        'التاخوير','التاخير'), 'سوالين','سوالف'),
        'خدمه الشغلا','خدمه العملاء')
WHERE ar_meaning ~ '(الينعل|الينرق|الينهم|الينندق|اليننادق|الوفلام|الوفعال|التاخوير|سوالين|خدمه الشغلا)';

UPDATE public.lesson_items
SET example_ar = replace(replace(example_ar, 'وشنو', 'وش'), 'شنو', 'وش')
WHERE example_ar LIKE '%شنو%';

UPDATE public.lesson_items
SET note_ar = replace(replace(note_ar, 'وشنو', 'وش'), 'شنو', 'وش')
WHERE note_ar LIKE '%شنو%';

-- 4. lesson_exercises hints
UPDATE public.lesson_exercises
SET hint_ar = replace(replace(hint_ar, 'وشنو', 'وش'), 'شنو', 'وش')
WHERE hint_ar LIKE '%شنو%';

UPDATE public.lesson_exercises
SET hint_tr = replace(replace(hint_tr, 'وشنو', 'وش'), 'شنو', 'وش')
WHERE hint_tr LIKE '%شنو%';

-- 5. lesson_exercises payloads (question.ar, options[].t/.tr, etc.)
DO $$
DECLARE
  r RECORD;
  new_payload JSONB;
BEGIN
  FOR r IN SELECT id, payload FROM public.lesson_exercises
           WHERE payload::text LIKE '%شنو%'
              OR payload::text LIKE '%يختر%'
              OR payload::text LIKE '%تهجي%'
              OR payload::text LIKE '%سوالين%'
              OR payload::text LIKE '%الينعل%'
              OR payload::text LIKE '%الينرق%'
  LOOP
    new_payload := r.payload;
    new_payload := replace(new_payload::text, 'وشنو', 'وش')::jsonb;
    new_payload := replace(new_payload::text, 'شنو', 'وش')::jsonb;
    new_payload := replace(new_payload::text, 'يختر عليك', 'يخلص عليك')::jsonb;
    new_payload := replace(new_payload::text, 'التهجية', 'الاملاء')::jsonb;
    new_payload := replace(new_payload::text, 'سوالين', 'سوالف')::jsonb;
    new_payload := replace(new_payload::text, 'الينعل', 'الفعل')::jsonb;
    new_payload := replace(new_payload::text, 'الينرق', 'الفرق')::jsonb;
    UPDATE public.lesson_exercises SET payload = new_payload WHERE id = r.id;
  END LOOP;
END $$;
