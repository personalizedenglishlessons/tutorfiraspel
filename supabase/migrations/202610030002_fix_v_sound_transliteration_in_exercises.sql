-- Fix /v/ sound transliteration in lesson_exercises payloads
-- Replaces هاف → هاڤ (have) and اوف كورس → اوڤ كورس (of course) in JSONB payload
-- Only affects exercises where the English text contains "have" or "of course"
-- Skips exercises with "half" (هاف is correct for /f/ sound in "half")

-- This migration updates transliteration fields in the JSONB payload of lesson_exercises.
-- It replaces:
--   1. 'هاف' → 'هاڤ' (have: /hæv/ has /v/ sound, should use ڤ not ف)
--      Only where the English text contains "have" but NOT "half" (mixed cases skipped)
--   2. 'اوف كورس' → 'اوڤ كورس' (of course: /əv/ has /v/ sound, should use ڤ not ف)

-- Note: Applied via Management API one statement at a time.
-- The actual UPDATE statements are generated and applied by tools/sql.py
-- because the payload is JSONB and the replacement needs context-aware filtering
-- (checking English text for "have" vs "half").

-- Verification queries (run after applying):
-- SELECT count(*) FROM lesson_exercises WHERE payload::text LIKE '%هاف%' AND payload::text LIKE '%have%';
-- SELECT count(*) FROM lesson_exercises WHERE payload::text LIKE '%اوف كورس%';
-- Both should return 0 (or only rows with "half" for the first query)
