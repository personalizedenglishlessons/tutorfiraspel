-- Fix /v/ sound transliteration in lesson_items and lesson_exercises
-- Replaces ف (U+0641) with ڤ (U+06A4) for words with /v/ sound:
--   'of course' (اوف كورس → اوڤ كورس) — /əv/ has /v/ sound
--   'have' (هاف → هاڤ) — /hæv/ has /v/ sound
-- Leaves ف for /f/ sound words: 'half', 'behalf', 'offer', etc.

-- Step 1: Fix lesson_items translit field
UPDATE lesson_items
SET translit = replace(translit, 'اوف كورس', 'اوڤ كورس')
WHERE translit LIKE '%اوف كورس%';

-- Step 2: Fix lesson_exercises payload (اوف كورس → اوڤ كورس)
UPDATE lesson_exercises
SET payload = replace(payload::text, 'اوف كورس', 'اوڤ كورس')::jsonb
WHERE payload::text LIKE '%اوف كورس%';

-- Step 3: Fix lesson_exercises payload (هاف → هاڤ) for 'have' only
-- Uses replace() on payload text — safe because:
--   - 'half past' exercises use هاف for /f/ sound (correct, won't match)
--   - All other هاف instances are 'have' transliterations
-- The 4 remaining هاف rows are 'half past' (correct /f/ sound)
UPDATE lesson_exercises
SET payload = replace(payload::text, 'هاف', 'هاڤ')::jsonb
WHERE payload::text LIKE '%هاف%'
  AND payload::text LIKE '%have%'  -- only exercises with 'have' in English
  AND payload::text NOT LIKE '%half past%';  -- exclude 'half past' exercises

-- Verification (should return 0 for first two, 4 for last):
-- SELECT count(*) FROM lesson_exercises WHERE payload::text LIKE '%اوف كورس%';
-- SELECT count(*) FROM lesson_items WHERE translit LIKE '%اوف كورس%';
-- SELECT count(*) FROM lesson_exercises WHERE payload::text LIKE '%هاف%';
