-- ============================================================
-- PEL Migration 202609130001 — Fix embedded Arabic in choose/correct exercises
-- ------------------------------------------------------------
-- Problem: 136 choose exercises have Arabic text embedded in question.en
--   (bilingual format: "Arabic text، English text") but question.ar is NULL.
--   This caused the null bug where the app showed "null" for Arabic quiz text.
--
-- Fix 1: Split bilingual question.en into question.ar + question.en
--   Pattern: "Arabic text، English text" → ar = "Arabic text", en = "English text"
--   Only splits on Arabic comma (، U+060C) to avoid breaking English commas.
--
-- Fix 2: Add why_ar + why_en for 5 correct exercises that are missing both.
--
-- Safe: only touches rows that match the exact patterns. Idempotent (won't
-- re-split rows that already have question.ar set).
-- Arabic/Abha dialect; no hamza; no em/en dashes.
-- ============================================================

-- Fix 1: Split bilingual choose questions
UPDATE lesson_exercises
SET payload = jsonb_set(
  jsonb_set(
    payload,
    '{question,ar}',
    to_jsonb(split_part(payload->'question'->>'en', '، ', 1))
  ),
  '{question,en}',
  to_jsonb(split_part(payload->'question'->>'en', '، ', 2))
)
WHERE type = 'choose'
  AND (payload->'question'->>'ar' IS NULL OR payload->'question'->>'ar' = '')
  AND payload->'question'->>'en' ~ '[\u0600-\u06FF]'
  AND payload->'question'->>'en' LIKE '%، %';

-- Fix 2: Add grammar explanations for 5 correct exercises missing why_ar/why_en
UPDATE lesson_exercises
SET payload = jsonb_set(
  jsonb_set(
    jsonb_set(
      payload,
      '{why_ar}',
      to_jsonb('نستخدم "is" بعد "What" في السؤال. صح: What is your name?'::text)
    ),
    '{why_en}',
    to_jsonb('Use "is" after "What" in questions. Correct: What is your name?'::text)
  ),
  '{why_tr}',
  to_jsonb('ريس "ايز" افتر "وات" إن ذا كويستشن. كوريكت: وات ايز يور نيم?'::text)
)
WHERE id = 1556;

UPDATE lesson_exercises
SET payload = jsonb_set(
  jsonb_set(
    jsonb_set(
      payload,
      '{why_ar}',
      to_jsonb('"Would like" اكثر ادب من "want". ونقول "a latte" مش "latte".'::text)
    ),
    '{why_en}',
    to_jsonb('"Would like" is more polite than "want". Also use "a latte" not "latte".'::text)
  ),
  '{why_tr}',
  to_jsonb('"وود لايك" از مور پولايت ذان "وانت". اولسو يوز "ا لاتيه" نات "لاتيه".'::text)
)
WHERE id = 1561;

UPDATE lesson_exercises
SET payload = jsonb_set(
  jsonb_set(
    jsonb_set(
      payload,
      '{why_ar}',
      to_jsonb('"Would like to" اكثر ادب. ونحتاج "a" قبل "room" و "to" قبل الفعل.'::text)
    ),
    '{why_en}',
    to_jsonb('"Would like to" is more polite. Need "a" before "room" and "to" before the verb.'::text)
  ),
  '{why_tr}',
  to_jsonb('"وود لايك تو" از مور پولايت. نيد "ا" بيفور "روم" اند "تو" بيفور ذا ڤيرب.'::text)
)
WHERE id = 1566;

UPDATE lesson_exercises
SET payload = jsonb_set(
  jsonb_set(
    jsonb_set(
      payload,
      '{why_ar}',
      to_jsonb('نستخدم "is the" في السؤال. صح: Where is the gate?'::text)
    ),
    '{why_en}',
    to_jsonb('Use "is the" in the question. Correct: Where is the gate?'::text)
  ),
  '{why_tr}',
  to_jsonb('يوز "ايز ذا" إن ذا كويستشن. كوريكت: وير ايز ذا قيت?'::text)
)
WHERE id = 1571;

UPDATE lesson_exercises
SET payload = jsonb_set(
  jsonb_set(
    jsonb_set(
      payload,
      '{why_ar}',
      to_jsonb('"How is it going?" = اختصار "How is". صح: How is it going?'::text)
    ),
    '{why_en}',
    to_jsonb('"How is it going?" — "How is" is the correct form. Correct: How is it going?'::text)
  ),
  '{why_tr}',
  to_jsonb('"هاو ايز ات قوينق؟" — "هاو ايز" از ذا كوريكت فورم. كوريكت: هاو ايز ات قوينق?'::text)
)
WHERE id = 1576;
