-- 202610070004_db_data_quality_fixes.sql
-- Fix various data quality issues across the DB

-- Fix 1: Rename "the-alphabet" lesson in english-foundations to reflect actual content
-- (it teaches airport check-in + spelling your name, not the alphabet itself)
UPDATE lessons SET title_en = 'Airport Check-in: Spelling Your Name', title_ar = 'المطار: هجاء اسمك' WHERE id = 'the-alphabet';

-- Fix 2: Fix all translate exercises with dir=false (should be en-ar)
UPDATE lesson_exercises
SET payload = jsonb_set(payload, '{dir}', '"en-ar"')
WHERE type = 'translate'
  AND (payload->>'dir' = 'false' OR payload->>'dir' IS NULL);

-- Fix 3: Fix choose exercises with mixed Arabic+translit in question.tr field
-- (translit field should contain transliteration only, not Arabic words mixed in)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', '"وات داز تو بي فير دو؟"') WHERE lesson_id='b2-pack2-01' AND idx=0;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', '"وات داز ريد بيتوين ذا لاينز مين؟"') WHERE lesson_id='c2-pack2-01' AND idx=0;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', '"تشوز ذا سينونيم اوف هابي."') WHERE lesson_id='step-vocab-synonyms' AND idx=4;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', '"تشوز ذا سينونيم اوف بيجن."') WHERE lesson_id='step-vocab-synonyms' AND idx=5;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', '"تشوز ذا سينونيم اوف ديفيكلت."') WHERE lesson_id='step-vocab-synonyms' AND idx=6;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', '"تشوز ذا سينونيم اوف فاست."') WHERE lesson_id='step-vocab-synonyms' AND idx=7;

-- Fix 4: Add type field to the-alphabet exercise payloads (was NULL)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{type}', '"choose"') WHERE lesson_id='the-alphabet' AND type='choose' AND payload->>'type' IS NULL;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{type}', '"order"') WHERE lesson_id='the-alphabet' AND type='order' AND payload->>'type' IS NULL;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{type}', '"translate"') WHERE lesson_id='the-alphabet' AND type='translate' AND payload->>'type' IS NULL;
