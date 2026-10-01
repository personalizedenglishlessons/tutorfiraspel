-- Fix incorrect transliterations from migration 202610010019
-- "air" was changed to "ار" but should be "اير" (matching airport/airline)
-- "exercise" was changed to "ايكسيرسايز" but should be "اكسيرسايز" (matching /ɛk/ → "اك")

-- Fix "air" standalone in lesson_items translit
UPDATE lesson_items SET translit = regexp_replace(translit, ' ار ', ' اير ', 'g') WHERE translit LIKE '% ار %';
UPDATE lesson_items SET translit = regexp_replace(translit, ' ار,', ' اير,', 'g') WHERE translit LIKE '% ار,%';

-- Fix "air" in exercise payloads
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, ' ار ', ' اير ', 'g')::jsonb WHERE payload::text LIKE '% ار %';

-- Fix "exercise" transliteration: ايكسيرسايز → اكسيرسايز
UPDATE lesson_items SET translit = regexp_replace(translit, 'ايكسيرسايز', 'اكسيرسايز', 'g') WHERE translit LIKE '%ايكسيرسايز%';
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, 'ايكسيرسايز', 'اكسيرسايز', 'g')::jsonb WHERE payload::text LIKE '%ايكسيرسايز%';

-- Fix "early" transliteration: ايرلي → ايرلي (correct, no change needed)
-- Fix "easy" transliteration: ايزي → ايزي (correct, no change needed)
-- Fix "eat" transliteration: ايت → ايت (correct, no change needed)
