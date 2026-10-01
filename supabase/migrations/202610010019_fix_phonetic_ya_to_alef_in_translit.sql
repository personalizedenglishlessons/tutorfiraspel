-- Fix bad phonetic transliterations in DB: vowel-initial English words transliterated with ي instead of ا
-- These are pre-generated translit values in lesson_items and lesson_exercises payloads
-- The PHON_DICT in app.html has been fixed for future generation; this fixes existing stored values

-- === lesson_items.translit fixes ===

-- "email" → "يميل" should be "ايميل" (18 rows)
UPDATE lesson_items SET translit = regexp_replace(translit, ' يميل', ' ايميل', 'g') WHERE translit LIKE '% يميل%';
UPDATE lesson_items SET translit = regexp_replace(translit, 'يميل,', 'ايميل,', 'g') WHERE translit LIKE '%يميل,%';
UPDATE lesson_items SET translit = regexp_replace(translit, 'يميل.', 'ايميل.', 'g') WHERE translit LIKE '%يميل.%';
UPDATE lesson_items SET translit = regexp_replace(translit, 'يميل؟', 'ايميل؟', 'g') WHERE translit LIKE '%يميل؟%';
-- Fix "يميلز" (emails) as well
UPDATE lesson_items SET translit = regexp_replace(translit, ' يميلز', ' ايميلز', 'g') WHERE translit LIKE '% يميلز%';
UPDATE lesson_items SET translit = regexp_replace(translit, 'يميلز,', 'ايميلز,', 'g') WHERE translit LIKE '%يميلز,%';
UPDATE lesson_items SET translit = regexp_replace(translit, 'يميلز.', 'ايميلز.', 'g') WHERE translit LIKE '%يميلز.%';

-- "air" standalone → "ير" should be "ار" (1 row)
UPDATE lesson_items SET translit = regexp_replace(translit, ' ير ', ' ار ', 'g') WHERE translit LIKE '% ير %';
UPDATE lesson_items SET translit = regexp_replace(translit, ' ير,', ' ار,', 'g') WHERE translit LIKE '% ير,%';

-- "end" standalone → "يند" should be "ايند" (1 row)
UPDATE lesson_items SET translit = regexp_replace(translit, ' يند ', ' ايند ', 'g') WHERE translit LIKE '% يند %';
UPDATE lesson_items SET translit = regexp_replace(translit, ' يند.', ' ايند.', 'g') WHERE translit LIKE '% يند.%';

-- "easy" → "يزي" should be "ايزي" (1 row)
UPDATE lesson_items SET translit = regexp_replace(translit, ' يزي ', ' ايزي ', 'g') WHERE translit LIKE '% يزي %';
UPDATE lesson_items SET translit = regexp_replace(translit, ' يزي.', ' ايزي.', 'g') WHERE translit LIKE '% يزي.%';

-- "exercise" → starts with "يكس" should be "ايكس"
UPDATE lesson_items SET translit = regexp_replace(translit, ' يكسيرسايز', ' ايكسيرسايز', 'g') WHERE translit LIKE '% يكسيرسايز%';

-- === lesson_exercises.payload fixes ===

-- "email" in exercise payloads
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, ' يميل', ' ايميل', 'g')::jsonb WHERE payload::text LIKE '% يميل%';
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, 'يميل,', 'ايميل,', 'g')::jsonb WHERE payload::text LIKE '%يميل,%';
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, 'يميل.', 'ايميل.', 'g')::jsonb WHERE payload::text LIKE '%يميل.%';
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, 'يميلز', 'ايميلز', 'g')::jsonb WHERE payload::text LIKE '%يميلز%';

-- "air" standalone in exercise payloads
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, ' ير ', ' ار ', 'g')::jsonb WHERE payload::text LIKE '% ير %';

-- "exercise" in exercise payloads
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, ' يكسيرسايز', ' ايكسيرسايز', 'g')::jsonb WHERE payload::text LIKE '% يكسيرسايز%';

-- Also fix hint_tr fields for email
UPDATE lesson_exercises SET hint_tr = regexp_replace(hint_tr, ' يميل', ' ايميل', 'g') WHERE hint_tr LIKE '% يميل%';
UPDATE lesson_exercises SET hint_tr = regexp_replace(hint_tr, 'يميلز', 'ايميلز', 'g') WHERE hint_tr LIKE '%يميلز%';
