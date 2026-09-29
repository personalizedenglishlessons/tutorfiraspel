-- =====================================================================
-- 2026-09-29 — Add a third distractor to the ten 2-option 'choose' exercises
--
-- Ten multiple-choice exercises had only 2 options, so a student who
-- guessed had a 50% chance of passing without knowing the answer.
-- Each gets one more plausible learner-error distractor (wrong, with
-- transliteration, matching the existing payload style {t, ok, tr}).
-- All renderers (stage choose activity + mini quiz) map options
-- generically, so adding an option needs no client change.
-- =====================================================================

BEGIN;

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"is","ok":false,"tr":"ايز"}]'::jsonb)
WHERE id = 621;  -- was-affirmative: "Yesterday I ___ sick." (was/were) -> is (tense error)

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"is","ok":false,"tr":"ايز"}]'::jsonb)
WHERE id = 627;  -- checkpoint-past-be: "We ___ at the meeting yesterday." (was/were) -> is

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"is","ok":false,"tr":"ايز"}]'::jsonb)
WHERE id = 633;  -- can-ability: "He ___ speak English." (can/cans) -> is (common learner error)

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"drinking","ok":false,"tr":"درينكينج"}]'::jsonb)
WHERE id = 641;  -- present-simple-i-you: "They ___ tea every morning." (drink/drinks) -> drinking

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"watching","ok":false,"tr":"واتشينج"}]'::jsonb)
WHERE id = 645;  -- present-simple-he-she: "My father ___ TV at night." (watch/watches) -> watching

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"having","ok":false,"tr":"هافينج"}]'::jsonb)
WHERE id = 652;  -- have-has-basics: "My sister ___ a new phone." (have/has) -> having

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"She don''t care.","ok":false,"tr":"شي دونت كير."}]'::jsonb)
WHERE id = 688;  -- err-dont-apostrophe: "Which is written correctly?" -> "She don't care." (classic learner error)

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"Am","ok":false,"tr":"ام"}]'::jsonb)
WHERE id = 691;  -- err-is-are-mix: "__ your brothers home?" (Is/Are) -> Am

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"That","ok":false,"tr":"ذات"}]'::jsonb)
WHERE id = 694;  -- this-that-these-those: "___ shoes over there are mine." (These/Those) -> That

UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options}', (payload->'options') || '[{"t":"How","ok":false,"tr":"هاو"}]'::jsonb)
WHERE id = 782;  -- how-much-many: "___ sugar do you want?" (How many/How much) -> How

COMMIT;

-- Verification: no 'choose' exercise should have fewer than 3 options.
-- SELECT id, lesson_id FROM lesson_exercises
-- WHERE type='choose' AND jsonb_array_length(payload->'options') < 3;
