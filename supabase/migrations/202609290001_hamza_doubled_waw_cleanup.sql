-- Migration: 202609290001_hamza_doubled_waw_cleanup.sql
-- Clean unnecessary hamza chars and doubled-و from all Arabic content columns
-- App house style: remove beginning-of-word hamzas (أ→ا, إ→ا, آ→ا)
-- PRESERVE root hamzas (ؤ, ئ, standalone ء) - they are part of word roots
-- Also fix doubled-و pattern in translit fields (وو→و)

-- lesson_items: clean ar_meaning, example_ar, note_ar (only أ/إ/آ → ا)
UPDATE lesson_items
SET ar_meaning = REPLACE(REPLACE(REPLACE(
      ar_meaning, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'),
    example_ar = REPLACE(REPLACE(REPLACE(
      example_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'),
    note_ar = REPLACE(REPLACE(REPLACE(
      note_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا')
WHERE ar_meaning ~ '[أإآ]'
   OR example_ar ~ '[أإآ]'
   OR note_ar ~ '[أإآ]';

-- lessons: clean title_ar (only أ/إ/آ → ا)
UPDATE lessons
SET title_ar = REPLACE(REPLACE(REPLACE(
      title_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا')
WHERE title_ar ~ '[أإآ]';

-- lesson_exercises: clean payload->>'ar', payload->>'whyAr' (only أ/إ/آ → ا)
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{ar}',
      to_jsonb(REPLACE(REPLACE(REPLACE(
        payload->>'ar', 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا')))
WHERE payload ? 'ar' AND payload->>'ar' ~ '[أإآ]';

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{whyAr}',
      to_jsonb(REPLACE(REPLACE(REPLACE(
        payload->>'whyAr', 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا')))
WHERE payload ? 'whyAr' AND payload->>'whyAr' ~ '[أإآ]';

-- lesson_exercises: clean hint_ar (only أ/إ/آ → ا)
UPDATE lesson_exercises
SET hint_ar = REPLACE(REPLACE(REPLACE(
      hint_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا')
WHERE hint_ar ~ '[أإآ]';

-- words: clean ar (jsonb), example_ar (only أ/إ/آ → ا)
-- Note: words.ar is jsonb, need special handling
UPDATE words
SET example_ar = REPLACE(REPLACE(REPLACE(
      example_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا')
WHERE example_ar ~ '[أإآ]';

-- Fix doubled-و in translit columns (وو→و)
UPDATE lesson_items
SET example_tr = REPLACE(example_tr, 'وو', 'و')
WHERE example_tr LIKE '%وو%';

UPDATE lesson_items
SET translit = REPLACE(translit, 'وو', 'و')
WHERE translit LIKE '%وو%';

UPDATE words
SET translit = REPLACE(translit, 'وو', 'و'),
    example_tr = REPLACE(example_tr, 'وو', 'و')
WHERE translit LIKE '%وو%' OR example_tr LIKE '%وو%';

-- NOTE: Root hamzas (ؤ, ئ, standalone ء) are PRESERVED.
-- Words like سؤال (question), مسؤول (responsible), نتائج (results),
-- نهائيا (finally), تلقائي (automatic), أسئلة (questions), شيئين (two things)
-- keep their root hamza characters intact.
