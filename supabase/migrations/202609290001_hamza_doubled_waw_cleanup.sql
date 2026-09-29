-- Migration: 202609290001_hamza_doubled_waw_cleanup.sql
-- Clean hamza chars and doubled-و from all Arabic content columns
-- App house style: no hamza (أ→ا, إ→ا, آ→ا, ؤ→و, ئ→ي)
-- Also fix doubled-و pattern in translit fields (وو→و)

-- lesson_items: clean ar_meaning, example_ar, note_ar
UPDATE lesson_items
SET ar_meaning = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      ar_meaning, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي'),
    example_ar = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      example_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي'),
    note_ar = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      note_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي')
WHERE ar_meaning ~ '[أإآؤئ]'
   OR example_ar ~ '[أإآؤئ]'
   OR note_ar ~ '[أإآؤئ]';

-- lessons: clean title_ar, desc_ar
UPDATE lessons
SET title_ar = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      title_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي'),
    desc_ar = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      desc_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي')
WHERE title_ar ~ '[أإآؤئ]'
   OR desc_ar ~ '[أإآؤئ]';

-- lesson_exercises: clean payload->>'ar', payload->>'whyAr'
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{ar}',
      to_jsonb(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        payload->>'ar', 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي')))
WHERE payload ? 'ar' AND payload->>'ar' ~ '[أإآؤئ]';

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{whyAr}',
      to_jsonb(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        payload->>'whyAr', 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي')))
WHERE payload ? 'whyAr' AND payload->>'whyAr' ~ '[أإآؤئ]';

-- words: clean ar, ar_meaning, example_ar, tip_ar
UPDATE words
SET ar = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي'),
    ar_meaning = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      ar_meaning, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي'),
    example_ar = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      example_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي'),
    tip_ar = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      tip_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ؤ', 'و'), 'ئ', 'ي')
WHERE ar ~ '[أإآؤئ]'
   OR ar_meaning ~ '[أإآؤئ]'
   OR example_ar ~ '[أإآؤئ]'
   OR tip_ar ~ '[أإآؤئ]';

-- Fix doubled-و in translit columns (وو→و)
UPDATE lesson_items
SET example_translit = REPLACE(example_translit, 'وو', 'و')
WHERE example_translit LIKE '%وو%';

UPDATE words
SET translit = REPLACE(translit, 'وو', 'و'),
    example_translit = REPLACE(example_translit, 'وو', 'و')
WHERE translit LIKE '%وو%' OR example_translit LIKE '%وو%';
