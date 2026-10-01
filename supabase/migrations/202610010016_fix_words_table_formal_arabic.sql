-- Fix last remaining formal Arabic in words table
-- "ذلك او تلك" → "ذاك او تيك" in the word entry for "that"
UPDATE words SET ar = to_jsonb(REPLACE(ar::text, 'ذلك او تلك', 'ذاك او تيك')) WHERE ar::text LIKE '%ذلك او تلك%';

-- Verify
SELECT 'ذلك in words' as check_col, COUNT(*) as c FROM words WHERE ar::text LIKE '%ذلك%' OR example_ar LIKE '%ذلك%';
