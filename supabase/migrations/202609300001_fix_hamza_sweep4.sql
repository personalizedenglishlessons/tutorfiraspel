-- Fix missing hamzas in database content (source-side fixes already pushed)
-- التادب → التأدب (politeness), النهايي → النهائي (final), الجز → الجزء (part)
-- Applied to lesson_items and lesson_exercises payloads.

-- 1. Fix "التادب" → "التأدب" in lesson_items.ar_meaning and lesson_items.ar
UPDATE lesson_items
  SET ar_meaning = replace(ar_meaning, 'التادب', 'التأدب')
  WHERE ar_meaning LIKE '%التادب%';

UPDATE lesson_items
  SET ar = replace(ar, 'التادب', 'التأدب')
  WHERE ar LIKE '%التادب%';

-- 2. Fix "نهايي" → "نهائي" in lesson_items (Deadline meaning)
UPDATE lesson_items
  SET ar = replace(ar, 'نهايي', 'نهائي')
  WHERE ar LIKE '%نهايي%';

UPDATE lesson_items
  SET ar_meaning = replace(ar_meaning, 'نهايي', 'نهائي')
  WHERE ar_meaning LIKE '%نهايي%';

-- 3. Fix "الجز " → "الجزء " in lesson_items (section/part)
-- Only replace standalone "الجز " not "الجزء"
UPDATE lesson_items
  SET ar = replace(ar, 'الجز الثاني', 'الجزء الثاني')
  WHERE ar LIKE '%الجز الثاني%' AND ar NOT LIKE '%الجزء%';

UPDATE lesson_items
  SET ar = replace(ar, 'الجز الاول', 'الجزء الاول')
  WHERE ar LIKE '%الجز الاول%' AND ar NOT LIKE '%الجزء%';

UPDATE lesson_items
  SET ar = replace(ar, 'بالجز الثاني', 'بالجزء الثاني')
  WHERE ar LIKE '%بالجز الثاني%' AND ar NOT LIKE '%بالجزء%';

-- 4. Fix "بنا الجمل" → "بناء الجمل" in lessons.title_ar
UPDATE lessons
  SET title_ar = replace(title_ar, 'بنا الجمل', 'بناء الجمل')
  WHERE title_ar LIKE '%بنا الجمل%';

-- 5. Fix "بنا المفردات" → "بناء المفردات" in lessons.title_ar
UPDATE lessons
  SET title_ar = replace(title_ar, 'بنا المفردات', 'بناء المفردات')
  WHERE title_ar LIKE '%بنا المفردات%';

-- 6. Fix "بنا التقدير" → "بناء التقدير" in any text columns
UPDATE lesson_items
  SET ar = replace(ar, 'بنا التقدير', 'بناء التقدير')
  WHERE ar LIKE '%بنا التقدير%';

-- 7. Fix in lesson_exercises payloads (JSONB)
-- Fix ar_meaning inside payloads
UPDATE lesson_exercises
  SET payload = payload::jsonb
  WHERE payload::text LIKE '%التادب%' OR payload::text LIKE '%نهايي%' OR payload::text LIKE '%بنا الجمل%';

-- Note: JSONB payload fixes need to be done via jsonb_set for specific fields.
-- The above WHERE clause identifies affected rows; actual payload fixes below.

-- Fix ar_meaning in payload
UPDATE lesson_exercises
  SET payload = jsonb_set(payload, '{ar_meaning}', to_jsonb(replace(payload->>'ar_meaning', 'التادب', 'التأدب')))
  WHERE payload->>'ar_meaning' LIKE '%التادب%';

UPDATE lesson_exercises
  SET payload = jsonb_set(payload, '{ar_meaning}', to_jsonb(replace(payload->>'ar_meaning', 'نهايي', 'نهائي')))
  WHERE payload->>'ar_meaning' LIKE '%نهايي%';

-- Fix ar in payload
UPDATE lesson_exercises
  SET payload = jsonb_set(payload, '{ar}', to_jsonb(replace(payload->>'ar', 'التادب', 'التأدب')))
  WHERE payload->>'ar' LIKE '%التادب%';

UPDATE lesson_exercises
  SET payload = jsonb_set(payload, '{ar}', to_jsonb(replace(payload->>'ar', 'نهايي', 'نهائي')))
  WHERE payload->>'ar' LIKE '%نهايي%';

-- Fix question.ar in payload
UPDATE lesson_exercises
  SET payload = jsonb_set(payload, '{question,ar}', to_jsonb(replace(payload#>>'{question,ar}', 'التادب', 'التأدب')))
  WHERE payload#>>'{question,ar}' LIKE '%التادب%';

UPDATE lesson_exercises
  SET payload = jsonb_set(payload, '{question,ar}', to_jsonb(replace(payload#>>'{question,ar}', 'نهايي', 'نهائي')))
  WHERE payload#>>'{question,ar}' LIKE '%نهايي%';

-- Fix options array ar fields
UPDATE lesson_exercises
  SET payload = jsonb_set(
    payload,
    '{options}',
    (SELECT jsonb_agg(
      CASE
        WHEN elem ? 'ar' THEN jsonb_set(elem, '{ar}', to_jsonb(replace(elem->>'ar', 'التادب', 'التأدب')))
        WHEN elem ? 't' AND elem->>'t' LIKE '%التادب%' THEN jsonb_set(elem, '{t}', to_jsonb(replace(elem->>'t', 'التادب', 'التأدب')))
        ELSE elem
      END
    ) FROM jsonb_array_elements(payload->'options') AS elem)
  )
  WHERE payload->'options' IS NOT NULL
    AND payload::text LIKE '%التادب%';

UPDATE lesson_exercises
  SET payload = jsonb_set(
    payload,
    '{options}',
    (SELECT jsonb_agg(
      CASE
        WHEN elem ? 'ar' THEN jsonb_set(elem, '{ar}', to_jsonb(replace(elem->>'ar', 'نهايي', 'نهائي')))
        WHEN elem ? 't' AND elem->>'t' LIKE '%نهايي%' THEN jsonb_set(elem, '{t}', to_jsonb(replace(elem->>'t', 'نهايي', 'نهائي')))
        ELSE elem
      END
    ) FROM jsonb_array_elements(payload->'options') AS elem)
  )
  WHERE payload->'options' IS NOT NULL
    AND payload::text LIKE '%نهايي%';
