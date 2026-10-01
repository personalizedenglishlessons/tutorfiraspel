-- Migration: 202610010007_fix_remaining_doubled_alif.sql
-- Fixes: ساال→سوال, القرااه→القرايه, العملاا→العملاء, حذااي→حذايي, ماي→مويه

-- 1. "ساال" → "سوال" (question) — most common doubled alif corruption
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'ساال', 'سوال') WHERE ar_meaning LIKE '%ساال%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'ساال', 'سوال') WHERE example_ar LIKE '%ساال%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'ساال', 'سوال') WHERE note_ar LIKE '%ساال%';
UPDATE lessons SET title_ar = replace(title_ar, 'ساال', 'سوال') WHERE title_ar LIKE '%ساال%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'ساال', 'سوال') WHERE hint_ar LIKE '%ساال%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'ساال', 'سوال'))) WHERE payload->>'answer' LIKE '%ساال%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'ساال', 'سوال'))) WHERE payload->>'source' LIKE '%ساال%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'ساال', 'سوال'))) WHERE payload->>'why_ar' LIKE '%ساال%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'ساال', 'سوال'))) WHERE payload#>>'{prompt,ar}' LIKE '%ساال%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', to_jsonb(replace(payload#>>'{question,ar}', 'ساال', 'سوال'))) WHERE payload#>>'{question,ar}' LIKE '%ساال%';

-- 2. "القرااه" → "القرايه" (reading)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'القرااه', 'القرايه') WHERE ar_meaning LIKE '%القرااه%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'القرااه', 'القرايه') WHERE example_ar LIKE '%القرااه%';

-- 3. "العملاا" → "العملاء" (customers)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'العملاا', 'العملاء'))) WHERE payload#>>'{prompt,ar}' LIKE '%العملاا%';

-- 4. "حذااي" → "حذايي" (my shoes)
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'حذااي', 'حذايي') WHERE ar_meaning LIKE '%حذااي%';

-- 5. "ماي" (Gulf water) → "مويه" (Saudi) in exercise payloads
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'ماي', 'مويه'))) WHERE payload#>>'{prompt,ar}' LIKE '%ماي%';

-- 6. Check choose exercise question.ar for doubled alif
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', to_jsonb(replace(payload#>>'{question,ar}', 'ساال', 'سوال'))) WHERE payload#>>'{question,ar}' LIKE '%ساال%';

-- 7. Also fix "القرااة" → "القرايه" if any remain
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'القرااة', 'القرايه') WHERE ar_meaning LIKE '%القرااة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'القرااة', 'القرايه') WHERE example_ar LIKE '%القرااة%';

-- 8. Fix "جزاا" → "جزء" (part) if any remain
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'جزاا', 'جزء') WHERE ar_meaning LIKE '%جزاا%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'جزاا', 'جزء') WHERE example_ar LIKE '%جزاا%';
