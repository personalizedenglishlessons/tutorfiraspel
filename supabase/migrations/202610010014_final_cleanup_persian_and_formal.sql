-- Final cleanup: remaining Persian codepoints in exercise payload (all fields)
-- and formal Arabic in lessons.title_ar

-- Persian codepoints: translate entire payload text (پ→ب, گ→ج, چ→ج, ژ→ز, ک→ك, ی→ي)
UPDATE lesson_exercises SET payload = translate(payload::text, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي')::jsonb WHERE translate(payload::text, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') <> payload::text;

-- Formal Arabic in lessons.title_ar
UPDATE lessons SET title_ar = REPLACE(title_ar, 'كيف حالك', 'كيفك') WHERE title_ar LIKE '%كيف حالك%';
UPDATE lessons SET title_ar = REPLACE(title_ar, 'ذلك', 'ذاك') WHERE title_ar LIKE '%ذلك%';

-- Verify Persian codepoints (should all be 0)
SELECT 'lesson_exercises' as t, COUNT(*) as c FROM lesson_exercises WHERE translate(payload::text, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') <> payload::text
UNION ALL
SELECT 'lesson_items', COUNT(*) FROM lesson_items WHERE translate(ar_meaning, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') <> ar_meaning
UNION ALL
SELECT 'words', COUNT(*) FROM words WHERE translate(ar::text, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') <> ar::text
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons WHERE translate(title_ar, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') <> title_ar;
