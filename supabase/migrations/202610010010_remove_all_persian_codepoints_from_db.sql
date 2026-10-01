-- Remove ALL Persian codepoints from DB text columns
-- پ(U+067E)→ب, گ(U+06AF)→ج, چ(U+0686)→ج, ژ(U+0698)→ز, ک(U+06A9)→ك, ی(U+06CC)→ي

-- lesson_items text columns
UPDATE lesson_items SET translit = translate(translit, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') WHERE translit ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_items SET ar_meaning = translate(ar_meaning, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') WHERE ar_meaning ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_items SET example_ar = translate(example_ar, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') WHERE example_ar ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_items SET note_ar = translate(note_ar, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') WHERE note_ar ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- words.translit (text)
UPDATE words SET translit = translate(translit, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') WHERE translit ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- words.ar is jsonb
UPDATE words SET ar = to_jsonb(translate(ar::text, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي')) WHERE ar::text ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- words.example_ar (text)
UPDATE words SET example_ar = translate(example_ar, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') WHERE example_ar ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- lessons.title_ar (text)
UPDATE lessons SET title_ar = translate(title_ar, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') WHERE title_ar ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- lesson_exercises.payload (jsonb) - fix text fields
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question}', to_jsonb(translate(payload->>'question', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'question' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt}', to_jsonb(translate(payload->>'prompt', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'prompt' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(translate(payload->>'answer', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'answer' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{ar}', to_jsonb(translate(payload->>'ar', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'ar' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(translate(payload->>'why_ar', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'why_ar' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why}', to_jsonb(translate(payload->>'why', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'why' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- Fix hint_ar
UPDATE lesson_exercises SET hint_ar = translate(hint_ar, E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي') WHERE hint_ar ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- Fix options array
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options}', (SELECT jsonb_agg(to_jsonb(translate(opt#>>'{}', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) FROM jsonb_array_elements(payload->'options') AS opt)) WHERE payload ? 'options' AND (payload->'options')::text ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- Fix distractors array
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{distractors}', (SELECT jsonb_agg(to_jsonb(translate(d#>>'{}', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) FROM jsonb_array_elements(payload->'distractors') AS d)) WHERE payload ? 'distractors' AND (payload->'distractors')::text ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- Verify
SELECT 'lesson_items.translit' as col, COUNT(*) as remaining FROM lesson_items WHERE translit ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]'
UNION ALL
SELECT 'words.translit', COUNT(*) FROM words WHERE translit ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]'
UNION ALL
SELECT 'lessons.title_ar', COUNT(*) FROM lessons WHERE title_ar ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]'
UNION ALL
SELECT 'lesson_exercises.payload', COUNT(*) FROM lesson_exercises WHERE payload::text ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
