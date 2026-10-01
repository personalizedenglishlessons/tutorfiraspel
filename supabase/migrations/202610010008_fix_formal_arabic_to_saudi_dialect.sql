-- Migration: 202610010008_fix_formal_arabic_to_saudi_dialect.sql
-- Replace formal Arabic words with Saudi dialect equivalents

-- 1. يجب → لازم (must)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'يجب', 'لازم') WHERE ar_meaning LIKE '%يجب%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'يجب', 'لازم') WHERE example_ar LIKE '%يجب%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'يجب', 'لازم') WHERE note_ar LIKE '%يجب%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'يجب', 'لازم') WHERE hint_ar LIKE '%يجب%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'يجب', 'لازم'))) WHERE payload->>'answer' LIKE '%يجب%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'يجب', 'لازم'))) WHERE payload->>'source' LIKE '%يجب%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'يجب', 'لازم'))) WHERE payload->>'why_ar' LIKE '%يجب%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'يجب', 'لازم'))) WHERE payload#>>'{prompt,ar}' LIKE '%يجب%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', to_jsonb(replace(payload#>>'{question,ar}', 'يجب', 'لازم'))) WHERE payload#>>'{question,ar}' LIKE '%يجب%';

-- 2. يستطيع → يقدر (can)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'يستطيع', 'يقدر') WHERE ar_meaning LIKE '%يستطيع%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'يستطيع', 'يقدر') WHERE example_ar LIKE '%يستطيع%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'يستطيع', 'يقدر') WHERE note_ar LIKE '%يستطيع%';

-- 3. فقط → بس (only) — careful: "فقط" appears in some compound phrases
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'فقط', 'بس') WHERE ar_meaning LIKE '%فقط%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'فقط', 'بس') WHERE example_ar LIKE '%فقط%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'فقط', 'بس') WHERE note_ar LIKE '%فقط%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'فقط', 'بس') WHERE hint_ar LIKE '%فقط%';

-- 4. كذلك → بعد (also)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'كذلك', 'بعد') WHERE ar_meaning LIKE '%كذلك%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'كذلك', 'بعد') WHERE example_ar LIKE '%كذلك%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'كذلك', 'بعد') WHERE note_ar LIKE '%كذلك%';

-- 5. حيث → وين (where — formal → Saudi)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'حيث', 'وين') WHERE ar_meaning LIKE '%حيث%';

-- 6. كما → مثل (as — formal → Saudi)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'كما', 'مثل') WHERE ar_meaning LIKE '%كما%';

-- 7. ليس فقط... بل ايضا → مو بس... بل بعد (not only... but also)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'ليس فقط', 'مو بس') WHERE ar_meaning LIKE '%ليس فقط%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'بل ايضا', 'بل بعد') WHERE ar_meaning LIKE '%بل ايضا%';

-- 8. بينما → بين (while — formal → simpler)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'بينما', 'بين') WHERE ar_meaning LIKE '%بينما%';
