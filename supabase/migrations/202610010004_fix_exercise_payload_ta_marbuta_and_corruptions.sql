-- Migration: 202610010004_fix_exercise_payload_ta_marbuta_and_corruptions.sql
-- Fixes: ta marbuta in spell meaning, order prompt.ar, correct why_ar
-- Plus: جزا→جزء, الماي→المويه, doubled alif corruptions

-- 1. TA MARBUTA in spell exercise meaning field
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{meaning}', to_jsonb(replace(payload->>'meaning', 'ة', 'ه')))
WHERE type = 'spell' AND payload->>'meaning' ~ 'ة';

-- 2. TA MARBUTA in order exercise prompt.ar field
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'ة', 'ه')))
WHERE type = 'order' AND payload#>>'{prompt,ar}' ~ 'ة';

-- 3. TA MARBUTA in correct exercise why_ar field
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'ة', 'ه')))
WHERE type = 'correct' AND payload->>'why_ar' ~ 'ة';

-- 4. CORRUPTIONS in correct exercise why_ar
-- ex#787: "جزا اف" → "جزء اف" (missing hamza — "part if")
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'جزا اف', 'جزء اف'))) WHERE id = 787;
-- ex#1076, 1080: "الماي" (Gulf for water) → "المويه" (Saudi)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'الماي', 'المويه'))) WHERE id = 1076;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'الماي', 'المويه'))) WHERE id = 1080;
-- ex#1181: "قرااة" doubled alif → "قرايه"
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'قرااة', 'قرايه'))) WHERE id = 1181;
-- ex#1556, 1571: "الساال" doubled alif → "السوال"
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'الساال', 'السوال'))) WHERE id = 1556;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'الساال', 'السوال'))) WHERE id = 1571;

-- 5. Also scan ALL why_ar for remaining doubled alif and Gulf words
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'الماي', 'المويه'))) WHERE type = 'correct' AND payload->>'why_ar' LIKE '%الماي%';
