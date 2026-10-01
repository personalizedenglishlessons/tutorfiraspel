-- Fix formal Arabic → Saudi dialect in lesson_items word entries and lesson_exercises

-- ذلك → ذاك (in word entries)
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'ذلك', 'ذاك') WHERE ar_meaning LIKE '%ذلك%' AND kind = 'word';
UPDATE lesson_items SET example_ar = REPLACE(example_ar, 'ذلك', 'ذاك') WHERE example_ar LIKE '%ذلك%' AND kind = 'word';

-- ماذا → وش (in word entries)
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'ماذا', 'وش') WHERE ar_meaning LIKE '%ماذا%' AND kind = 'word';

-- لماذا → ليش (in word entries)
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'لماذا', 'ليش') WHERE ar_meaning LIKE '%لماذا%' AND kind = 'word';

-- الذي → اللي (in word entries)
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'الذي', 'اللي') WHERE ar_meaning LIKE '%الذي%' AND kind = 'word';

-- التي → اللي (in word entries)
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'التي', 'اللي') WHERE ar_meaning LIKE '%التي%' AND kind = 'word';

-- نحن → احنا (in word entries example_ar)
UPDATE lesson_items SET example_ar = REPLACE(example_ar, 'نحن', 'احنا') WHERE example_ar LIKE '%نحن%' AND kind = 'word';
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'نحن', 'احنا') WHERE ar_meaning LIKE '%نحن%' AND kind = 'word';

-- نحن → احنا (in lesson_exercises payload)
UPDATE lesson_exercises SET payload = REPLACE(payload::text, 'نحن', 'احنا')::jsonb WHERE payload::text LIKE '%نحن%';

-- Verify
SELECT 'ذلك in words' as check_col, COUNT(*) as c FROM lesson_items WHERE ar_meaning LIKE '%ذلك%' AND kind = 'word'
UNION ALL
SELECT 'ماذا in words', COUNT(*) FROM lesson_items WHERE ar_meaning LIKE '%ماذا%' AND kind = 'word'
UNION ALL
SELECT 'لماذا in words', COUNT(*) FROM lesson_items WHERE ar_meaning LIKE '%لماذا%' AND kind = 'word'
UNION ALL
SELECT 'الذي in words', COUNT(*) FROM lesson_items WHERE ar_meaning LIKE '%الذي%' AND kind = 'word'
UNION ALL
SELECT 'التي in words', COUNT(*) FROM lesson_items WHERE ar_meaning LIKE '%التي%' AND kind = 'word'
UNION ALL
SELECT 'نحن in words', COUNT(*) FROM lesson_items WHERE (ar_meaning LIKE '%نحن%' OR example_ar LIKE '%نحن%') AND kind = 'word'
UNION ALL
SELECT 'نحن in exercises', COUNT(*) FROM lesson_exercises WHERE payload::text LIKE '%نحن%';
