-- Fix grammar terms used as word translations + bad "يني" transliteration of "any"
-- Issue 1: "نفي" (grammar term) appearing in learner-facing ar_meaning fields
-- Issue 2: "يني" (bad phonetic) used instead of "اني" for "any" in translit and exercise payloads

-- lesson_items: remove grammar term from ar_meaning (learner-facing word meaning)
UPDATE lesson_items SET ar_meaning = 'مو / ما' WHERE id = 1345 AND ar_meaning = 'مو او ما للنفي';
UPDATE lesson_items SET ar_meaning = 'ما' WHERE id = 2651 AND ar_meaning = 'ما (نفي)';

-- lesson_items: fix "يني" → "اني" in translit fields (only the "any" word, not rainy/windy)
UPDATE lesson_items SET translit = REPLACE(translit, 'يني تشينجاز', 'اني تشينجاز') WHERE id = 856;
UPDATE lesson_items SET translit = REPLACE(translit, 'يني ان', 'اني ان') WHERE id = 1686;

-- lesson_exercises: fix "يني" → "اني" in payload (JSONB)
-- Exercise 336: "Do you have any siblings?" tr field
UPDATE lesson_exercises
SET payload = REPLACE(payload::text, 'يني سيبلينجز', 'اني سيبلينجز')::jsonb
WHERE id = 336;

-- Exercise 779: option tr "يني" → "اني" AND fix hint_ar grammar term in payload
UPDATE lesson_exercises
SET payload = REPLACE(payload::text, 'يني', 'اني')::jsonb
WHERE id = 779;

UPDATE lesson_exercises
SET payload = REPLACE(payload::text, 'النفي ياخذ اني.', 'بالنفي نستخدم اني.')::jsonb
WHERE id = 779;

UPDATE lesson_exercises
SET hint_ar = 'بالنفي نستخدم اني.'
WHERE id = 779 AND hint_ar = 'النفي ياخذ اني.';
