-- Fix more bad phonetic transliterations: early, easy, eat in words table and lesson_items

-- Fix words table translit
UPDATE words SET translit = 'ايرلي' WHERE id = 'early' AND translit = 'يرلي';
UPDATE words SET translit = 'ايزي' WHERE id = 'easy' AND translit = 'يزي';
UPDATE words SET translit = 'ايت' WHERE id = 'eat' AND translit = 'يت';

-- Fix lesson_items translit containing "يرلي" (early)
UPDATE lesson_items SET translit = regexp_replace(translit, ' يرلي', ' ايرلي', 'g') WHERE translit LIKE '% يرلي%';
UPDATE lesson_items SET translit = regexp_replace(translit, 'يرلي$', 'ايرلي', 'g') WHERE translit LIKE '%يرلي';

-- Fix lesson_items translit containing standalone " يزي" (easy)
UPDATE lesson_items SET translit = regexp_replace(translit, ' يزي ', ' ايزي ', 'g') WHERE translit LIKE '% يزي %';
UPDATE lesson_items SET translit = regexp_replace(translit, ' يزي.', ' ايزي.', 'g') WHERE translit LIKE '% يزي.%';

-- Fix exercise payloads containing "يرلي" (early)
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, ' يرلي', ' ايرلي', 'g')::jsonb WHERE payload::text LIKE '% يرلي%';

-- Fix exercise payloads containing " يزي" (easy)
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, ' يزي ', ' ايزي ', 'g')::jsonb WHERE payload::text LIKE '% يزي %';
UPDATE lesson_exercises SET payload = regexp_replace(payload::text, ' يزي.', ' ايزي.', 'g')::jsonb WHERE payload::text LIKE '% يزي.%';
