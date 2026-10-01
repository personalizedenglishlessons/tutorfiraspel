-- Migration: 202610010002_fix_mistranslations_and_corruptions.sql
-- Fixes: doubled alif, mistranslations, misspellings, ta marbuta, Egyptian مش→مو

-- 1. DOUBLED ALIF (اا) CORRUPTIONS
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'السياره حمرا.', 'accept', ARRAY['السياره حمرا.']::text[]) WHERE id = 798;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'عندي سوال', 'accept', ARRAY['عندي سوال']::text[]) WHERE id = 654;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'انا احب القرايا.', 'accept', ARRAY['انا احب القرايا.']::text[]) WHERE id = 1126;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'تحب مويه', 'accept', ARRAY['تحب مويه']::text[]) WHERE id = 1424;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'ابحث عن الكلمه المفتاحيه في السوال.', 'accept', ARRAY['ابحث عن الكلمه المفتاحيه في السوال.']::text[]) WHERE id = 1180;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'ابحث عن الكلمات المفتاحيه بالسوال', 'accept', ARRAY['ابحث عن الكلمات المفتاحيه بالسوال']::text[]) WHERE id = 1522;

-- 2. MISTRANSLATIONS
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'ما لازم نتاخر.', 'accept', ARRAY['ما لازم نتاخر.']::text[]) WHERE id = 1028;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'وانا سعيد بلقائك', 'accept', ARRAY['وانا سعيد بلقائك','وانا بعد']::text[]) WHERE id = 709;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'افطر الصبح الساعه سبعة.', 'accept', ARRAY['افطر الصبح الساعه سبعة.']::text[]) WHERE id = 1000;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'في الصباح اصحى', 'accept', ARRAY['في الصباح اصحى']::text[]) WHERE id = 1481;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'لو تستعجل راح نلحق الباص', 'accept', ARRAY['لو تستعجل راح نلحق الباص','لو استعجلت راح نلحق الباص']::text[]) WHERE id = 789;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'الساعه خمسة ونص.', 'accept', ARRAY['الساعه خمسة ونص.']::text[]) WHERE id = 996;

-- 3. MISSPELLINGS AND GRAMMAR ERRORS
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'اقفلوا كتبكم', 'accept', ARRAY['اقفلوا كتبكم']::text[]) WHERE id = 759;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'ليش فرحان اليوم؟', 'accept', ARRAY['ليش فرحان اليوم؟']::text[]) WHERE id = 756;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'لف يسار.', 'accept', ARRAY['لف يسار.','لف يسار']::text[]) WHERE id = 1433;
UPDATE lesson_exercises SET payload = payload || jsonb_build_object('answer', 'هلا اشوفك بعدين', 'accept', ARRAY['هلا اشوفك بعدين']::text[]) WHERE id = 1304;

-- 4. TA MARBUTA in payload answer/source/question.ar
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'ة', 'ه'))) WHERE type = 'translate' AND payload->>'answer' ~ 'ة';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'ة', 'ه'))) WHERE payload->>'source' ~ 'ة';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', to_jsonb(replace(payload#>>'{question,ar}', 'ة', 'ه'))) WHERE payload#>>'{question,ar}' ~ 'ة';

-- 5. EGYPTIAN مش → SAUDI مو
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'مش', 'مو') WHERE ar_meaning LIKE '%مش%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'مش', 'مو') WHERE example_ar LIKE '%مش%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'مش', 'مو') WHERE note_ar LIKE '%مش%';
UPDATE lessons SET title_ar = replace(title_ar, 'مش', 'مو') WHERE title_ar LIKE '%مش%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'مش', 'مو') WHERE hint_ar LIKE '%مش%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'مش', 'مو'))) WHERE payload->>'answer' LIKE '%مش%';
UPDATE words SET example_ar = replace(example_ar, 'مش', 'مو') WHERE example_ar LIKE '%مش%';

-- 6. Fix "ماي" (Gulf for water) → "مويه" (Saudi)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'ماي', 'مويه'))) WHERE payload->>'answer' LIKE '%ماي%';
