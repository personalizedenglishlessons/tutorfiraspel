-- Migration: Fix duplicate distractor options, doubled-alef, and diacritics in exercises + lesson_items
-- Date: 2026-10-01

-- === 1. Fix doubled-alef in lesson_exercises (translate type) ===
-- اايميل → ايميل (email)
UPDATE lesson_exercises
SET payload = REPLACE(payload::text, 'اايميل', 'ايميل')::jsonb
WHERE payload::text LIKE '%اايميل%';

-- === 2. Fix doubled-alef in lesson_items translit ===
UPDATE lesson_items
SET translit = REPLACE(translit, 'اايميل', 'ايميل')
WHERE translit LIKE '%اايميل%';

-- اايرلي → ايرلي (early)
UPDATE lesson_items
SET translit = REPLACE(translit, 'اايرلي', 'ايرلي')
WHERE translit LIKE '%اايرلي%';

-- اام → ام (I'm wrong form in explain item)
UPDATE lesson_items
SET translit = REPLACE(translit, 'اام', 'ام')
WHERE translit LIKE '%اام%' AND kind = 'explain';

-- === 3. Remove ALL Arabic diacritics from lesson_items translit ===
-- Diacritics: U+064B-U+065F (tanwin/harakat/shadda), U+0670 (superscript alef), U+0652 (sukun)
UPDATE lesson_items
SET translit = REGEXP_REPLACE(translit, '[\u064B-\u065F\u0670]', '', 'g')
WHERE translit ~ '[\u064B-\u065F\u0670]';

-- === 4. Fix duplicate distractor options in choose exercises ===
-- These exercises have a 4th option that duplicates the 3rd. Replace with a different distractor.

-- ex#621: "is" duplicated → replace 4th option "is" with "am"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"am"')::jsonb
WHERE id = 621;

-- ex#627: "is" duplicated → replace 4th option "is" with "am"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"am"')::jsonb
WHERE id = 627;

-- ex#633: "is" duplicated → replace 4th option "is" with "am"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"am"')::jsonb
WHERE id = 633;

-- ex#641: "drinking" duplicated → replace 4th option with "drank"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"drank"')::jsonb
WHERE id = 641;

-- ex#645: "watching" duplicated → replace 4th option with "watched"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"watched"')::jsonb
WHERE id = 645;

-- ex#652: "having" duplicated → replace 4th option with "had"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"had"')::jsonb
WHERE id = 652;

-- ex#688: "She don't care." duplicated → replace 4th option with "She doesn't cares."
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"She doesn''t cares."')::jsonb
WHERE id = 688;

-- ex#691: "Am" duplicated → replace 4th option with "Was"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"Was"')::jsonb
WHERE id = 691;

-- ex#694: "That" duplicated → replace 4th option with "This"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"This"')::jsonb
WHERE id = 694;

-- ex#782: "How" duplicated → replace 4th option with "What"
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{options,3,t}', '"What"')::jsonb
WHERE id = 782;
