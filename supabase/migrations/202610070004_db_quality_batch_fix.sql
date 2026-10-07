-- 202610070004_db_quality_batch_fix.sql
-- Fix translate dir=false, rename misleading lesson, fix exercise payloads

-- Fix ALL translate exercises with dir=false → dir=en-ar (all sources are English)
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{dir}', '"en-ar"')
WHERE type = 'translate'
  AND (payload->>'dir' = 'false' OR payload->>'dir' IS NULL);

-- Rename "the-alphabet" lesson (english-foundations) to reflect actual content
-- (it teaches airport check-in + spelling your name, not the alphabet itself)
UPDATE lessons SET title_en = 'Airport Check-in: Spelling Your Name', title_ar = 'المطار: هجاء اسمك' WHERE id = 'the-alphabet';

-- Add missing type field to the-alphabet exercise payloads
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{type}', '"choose"') WHERE lesson_id='the-alphabet' AND type='choose' AND payload->>'type' IS NULL;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{type}', '"order"') WHERE lesson_id='the-alphabet' AND type='order' AND payload->>'type' IS NULL;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{type}', '"translate"') WHERE lesson_id='the-alphabet' AND type='translate' AND payload->>'type' IS NULL;

-- Fix translate exercise idx 3: add proper source_tr field
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source_tr}', '"اي هاڤ ا ريزرڤيشن فور تو."') WHERE lesson_id='the-alphabet' AND idx=3 AND type='translate';

-- Fix choose exercise idx 0: question.tr had Arabic mixed with translit
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', '"هاو ماني ليتيرز اير ان ذا انجلش الفابيت؟"') WHERE lesson_id='the-alphabet' AND idx=0 AND type='choose';

-- Fix order exercise idx 2: prompt.en was wrong
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,en}', '"Got it. Do you spell it with one S?"') WHERE lesson_id='the-alphabet' AND idx=2 AND type='order';

-- Fix choose exercise idx 1: question.tr had Arabic mixed with translit
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', '"هاو دو يو ريبلاي وين اسكت تو سبيل يور نيم؟"') WHERE lesson_id='the-alphabet' AND idx=1 AND type='choose';
