-- Migration: Remove hamza from lesson_exercises payload Arabic text
-- Exercise id=728 (conn-because-so) has "متأخر" (with hamza) in prompt.ar
-- Saudi dialect uses "متاخر" (with regular alef, no hamza)
-- Idempotent: only updates the specific exercise, safe to re-run

UPDATE lesson_exercises
SET payload = jsonb_set(
  payload,
  '{prompt,ar}',
  to_jsonb(replace(payload #>> '{prompt,ar}', 'متأخر', 'متاخر'))
)
WHERE id = 728
  AND payload #>> '{prompt,ar}' LIKE '%متأخر%';
