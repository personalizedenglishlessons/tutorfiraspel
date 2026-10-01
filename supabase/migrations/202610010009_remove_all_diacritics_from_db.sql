-- Remove ALL Arabic diacritics (tashkeel: tanwin, fatha, damma, kasra, sukun, shadda)
-- from every Arabic text field in the database.
-- Unicode range: U+064B to U+0652

-- lesson_items: ar_meaning, example_ar, note_ar
UPDATE lesson_items SET ar_meaning = regexp_replace(ar_meaning, '[\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652]', '', 'g') WHERE ar_meaning ~ '[\u064b-\u0652]';
UPDATE lesson_items SET example_ar = regexp_replace(example_ar, '[\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652]', '', 'g') WHERE example_ar ~ '[\u064b-\u0652]';
UPDATE lesson_items SET note_ar = regexp_replace(note_ar, '[\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652]', '', 'g') WHERE note_ar ~ '[\u064b-\u0652]';

-- lesson_exercises: payload (JSON) — replace in the JSON text
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, '[\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652]', '', 'g')::jsonb WHERE payload::text ~ '[\u064b-\u0652]';

-- words: ar (text[] array) and example_ar
UPDATE words SET "ar" = array_agg(regexp_replace(x, '[\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652]', '', 'g')) FROM (SELECT id, unnest("ar") as x FROM words WHERE "ar"::text ~ '[\u064b-\u0652]') sub WHERE words.id = sub.id;
UPDATE words SET example_ar = regexp_replace(example_ar, '[\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652]', '', 'g') WHERE example_ar ~ '[\u064b-\u0652]';

-- lessons: title_ar
UPDATE lessons SET title_ar = regexp_replace(title_ar, '[\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652]', '', 'g') WHERE title_ar ~ '[\u064b-\u0652]';

-- Verify: count remaining diacritics
SELECT 'lesson_items' as tbl, count(*) FROM lesson_items WHERE ar_meaning ~ '[\u064b-\u0652]' OR example_ar ~ '[\u064b-\u0652]' OR note_ar ~ '[\u064b-\u0652]'
UNION ALL
SELECT 'exercises', count(*) FROM lesson_exercises WHERE payload::text ~ '[\u064b-\u0652]'
UNION ALL
SELECT 'words', count(*) FROM words WHERE "ar"::text ~ '[\u064b-\u0652]' OR example_ar ~ '[\u064b-\u0652]'
UNION ALL
SELECT 'lessons', count(*) FROM lessons WHERE title_ar ~ '[\u064b-\u0652]';
