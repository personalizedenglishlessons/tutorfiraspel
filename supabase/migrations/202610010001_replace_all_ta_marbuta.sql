-- ============================================================
-- Migration: 202610010001_replace_all_ta_marbuta.sql
--
-- Problem: The previous migration (202609250002) only replaced 9 specific
-- word patterns. There are still ~1273 instances of formal Arabic ta
-- marbuta (ة) across all Arabic text columns. Saudi dialect consistently
-- writes ta marbuta as heh (ه), and the app source code already uses
-- this convention.
--
-- This migration does a comprehensive blanket replacement of ة→ه across:
--   - lessons.title_ar (111 rows)
--   - lesson_items.ar_meaning (657 rows)
--   - lesson_items.example_ar (262 rows)
--   - lesson_items.note_ar (176 rows)
--   - lesson_exercises.hint_ar (28 rows)
--   - lesson_exercises.payload->>'ar' (39 rows)
--   - words.example_ar (if any)
--
-- Idempotent: replace() is safe to re-run (no-op if already fixed).
-- ============================================================

BEGIN;

-- Lessons: title_ar
UPDATE lessons SET title_ar = replace(title_ar, 'ة', 'ه') WHERE title_ar ~ 'ة';

-- Lesson items: ar_meaning, example_ar, note_ar
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'ة', 'ه') WHERE ar_meaning ~ 'ة';
UPDATE lesson_items SET example_ar = replace(example_ar, 'ة', 'ه') WHERE example_ar ~ 'ة';
UPDATE lesson_items SET note_ar = replace(note_ar, 'ة', 'ه') WHERE note_ar ~ 'ة';

-- Lesson exercises: hint_ar
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'ة', 'ه') WHERE hint_ar ~ 'ة';

-- Lesson exercises: payload->>'ar' (JSONB field inside payload)
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{ar}', to_jsonb(replace(payload->>'ar', 'ة', 'ه')))
WHERE payload->>'ar' ~ 'ة';

-- Lesson exercises: payload->>'whyAr' (JSONB field inside payload, if any)
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{whyAr}', to_jsonb(replace(payload->>'whyAr', 'ة', 'ه')))
WHERE payload->>'whyAr' ~ 'ة';

-- Lesson exercises: hint_ar in payload (some exercises store hint in payload)
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{hint_ar}', to_jsonb(replace(payload->>'hint_ar', 'ة', 'ه')))
WHERE payload->>'hint_ar' ~ 'ة';

-- Words: example_ar
UPDATE words SET example_ar = replace(example_ar, 'ة', 'ه') WHERE example_ar ~ 'ة';

-- Also fix doubled هه that might result from ة→ه next to existing ه
-- (e.g., if ة was followed by ه, we'd get هه — but this is rare)
-- Clean up any doubled هه in Arabic text columns
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'هه', 'ه') WHERE ar_meaning LIKE '%هه%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'هه', 'ه') WHERE example_ar LIKE '%هه%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'هه', 'ه') WHERE note_ar LIKE '%هه%';
UPDATE lessons SET title_ar = replace(title_ar, 'هه', 'ه') WHERE title_ar LIKE '%هه%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'هه', 'ه') WHERE hint_ar LIKE '%هه%';

COMMIT;

-- Verification:
-- SELECT count(*) FROM lesson_items WHERE ar_meaning ~ 'ة';  -- expected 0
-- SELECT count(*) FROM lessons WHERE title_ar ~ 'ة';          -- expected 0
-- SELECT count(*) FROM lesson_exercises WHERE hint_ar ~ 'ة';  -- expected 0
