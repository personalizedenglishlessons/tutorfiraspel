-- Migration: 202610010006_fix_words_table_mistranslations.sql
-- Fixes: Gulf ماي in word examples, doubled alif, wrong translit, misspelling

-- 1. Fix "ماي" (Gulf) → "مويه" (Saudi) in words example_ar
UPDATE words SET example_ar = replace(example_ar, 'ماي', 'مويه') WHERE example_ar LIKE '%ماي%';

-- 2. Fix doubled alif "اثناا" → "اثناء" in words ar (JSONB)
UPDATE words SET ar = replace(ar::text, 'اثناا', 'اثناء')::jsonb WHERE ar::text LIKE '%اثناا%';

-- 3. Fix translit "يوجولي" → "يوجوالي" (usually)
UPDATE words SET translit = 'يوجوالي' WHERE en = 'usually' AND translit = 'يوجولي';

-- 4. Fix "استظر" → "انتظر" (wait) in words example_ar
UPDATE words SET example_ar = replace(example_ar, 'استظر', 'انتظر') WHERE example_ar LIKE '%استظر%';

-- 5. Fix tanwin "احيانًا" → "احيانا" in words example_ar
UPDATE words SET example_ar = replace(example_ar, 'احيانًا', 'احيانا') WHERE example_ar LIKE '%احيانًا%';

-- 6. Also scan lesson_items for "استظر" and fix to "انتظر"
UPDATE lesson_items SET example_ar = replace(example_ar, 'استظر', 'انتظر') WHERE example_ar LIKE '%استظر%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'استظر', 'انتظر') WHERE ar_meaning LIKE '%استظر%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'استظر', 'انتظر') WHERE note_ar LIKE '%استظر%';
