-- Fix remaining Persian codepoints in exercise payload _tr fields
-- پ(U+067E)→ب, گ(U+06AF)→ج, چ(U+0686)→ج, ژ(U+0698)→ز, ک(U+06A9)→ك, ی(U+06CC)→ي

UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source_tr}', to_jsonb(translate(payload->>'source_tr', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'source_tr' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{right_tr}', to_jsonb(translate(payload->>'right_tr', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'right_tr' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{wrong_tr}', to_jsonb(translate(payload->>'wrong_tr', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'wrong_tr' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- Also check any remaining fields
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{tr}', to_jsonb(translate(payload->>'tr', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'tr' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{example_tr}', to_jsonb(translate(payload->>'example_tr', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'example_tr' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{hint_tr}', to_jsonb(translate(payload->>'hint_tr', E'\u067E\u06AF\u0686\u0698\u06A9\u06CC', E'بججزكي'))) WHERE payload->>'hint_tr' ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';

-- Verify
SELECT COUNT(*) as remaining FROM lesson_exercises WHERE payload::text ~ '[\u067E\u06AF\u0686\u0698\u06A9\u06CC]';
