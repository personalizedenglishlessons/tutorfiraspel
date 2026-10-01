-- Fix formal Arabic → Saudi dialect in lesson_exercises payload and words table

-- lesson_exercises: كيف حالك → كيفك (in payload text)
UPDATE lesson_exercises SET payload = REPLACE(payload::text, 'كيف حالك', 'كيفك')::jsonb WHERE payload::text LIKE '%كيف حالك%';

-- lesson_exercises: ذلك → ذاك (in payload text)
UPDATE lesson_exercises SET payload = REPLACE(payload::text, 'ذلك', 'ذاك')::jsonb WHERE payload::text LIKE '%ذلك%';

-- lesson_exercises: هذه → هذي (in payload text, in accept arrays)
UPDATE lesson_exercises SET payload = REPLACE(payload::text, 'هذه', 'هذي')::jsonb WHERE payload::text LIKE '%هذه%';

-- words table: fix example_ar for "that" word entry
UPDATE words SET example_ar = 'ذاك حلو.' WHERE example_ar = 'ذلك حلو.';

-- Verify
SELECT 'كيف حالك in exercises' as check_col, COUNT(*) as c FROM lesson_exercises WHERE payload::text LIKE '%كيف حالك%'
UNION ALL
SELECT 'ذلك in exercises', COUNT(*) FROM lesson_exercises WHERE payload::text LIKE '%ذلك%'
UNION ALL
SELECT 'هذه in exercises', COUNT(*) FROM lesson_exercises WHERE payload::text LIKE '%هذه%'
UNION ALL
SELECT 'ذلك in words', COUNT(*) FROM words WHERE example_ar LIKE '%ذلك%';
