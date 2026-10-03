-- Fix 5 exercises missed by the initial /v/ transliteration scan (case-sensitivity gap)
-- These exercises had 'Have' (capitalized) or 'have' in fields not checked by the first scan
-- (answer, prompt.tr, option distractors), so LIKE '%have%' missed them.
UPDATE lesson_exercises
SET payload = replace(payload::text, 'هاف', 'هاڤ')::jsonb
WHERE id IN (581, 1104, 1145, 1161, 1170)
  AND payload::text LIKE '%هاف%';

-- Verification: remaining هاف should be exactly 4 (all 'half past' /f/ sound, correct)
-- SELECT count(*) FROM lesson_exercises WHERE payload::text LIKE '%هاف%';
