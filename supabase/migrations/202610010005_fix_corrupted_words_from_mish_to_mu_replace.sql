-- Migration: 202610010005_fix_corrupted_words_from_mish_to_mu_replace.sql
--
-- CRITICAL FIX: The مش→مو migration corrupted words where "مش" is a root,
-- not the negation. These specific corruptions must be reversed:
--   موغول → مشغول (busy)
--   موكله → مشكله (problem)
--   موكور → مشكور (thank you)
--   موروع → مشروع (project)
--   مومس → مشمس (sunny)
--   موهد → مشهد (scene)
--   مووي → مشوي (grilled)

-- lesson_items: ar_meaning, example_ar, note_ar
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'موغول', 'مشغول') WHERE ar_meaning LIKE '%موغول%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'موكله', 'مشكله') WHERE ar_meaning LIKE '%موكله%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'موكور', 'مشكور') WHERE ar_meaning LIKE '%موكور%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'موروع', 'مشروع') WHERE ar_meaning LIKE '%موروع%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'مومس', 'مشمس') WHERE ar_meaning LIKE '%مومس%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'موهد', 'مشهد') WHERE ar_meaning LIKE '%موهد%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'مووي', 'مشوي') WHERE ar_meaning LIKE '%مووي%';

UPDATE lesson_items SET example_ar = replace(example_ar, 'موغول', 'مشغول') WHERE example_ar LIKE '%موغول%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'موكله', 'مشكله') WHERE example_ar LIKE '%موكله%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'موكور', 'مشكور') WHERE example_ar LIKE '%موكور%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'موروع', 'مشروع') WHERE example_ar LIKE '%موروع%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'مومس', 'مشمس') WHERE example_ar LIKE '%مومس%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'موهد', 'مشهد') WHERE example_ar LIKE '%موهد%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'مووي', 'مشوي') WHERE example_ar LIKE '%مووي%';

UPDATE lesson_items SET note_ar = replace(note_ar, 'موغول', 'مشغول') WHERE note_ar LIKE '%موغول%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'موكله', 'مشكله') WHERE note_ar LIKE '%موكله%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'موكور', 'مشكور') WHERE note_ar LIKE '%موكور%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'موروع', 'مشروع') WHERE note_ar LIKE '%موروع%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'مومس', 'مشمس') WHERE note_ar LIKE '%مومس%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'موهد', 'مشهد') WHERE note_ar LIKE '%موهد%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'مووي', 'مشوي') WHERE note_ar LIKE '%مووي%';

-- lessons: title_ar
UPDATE lessons SET title_ar = replace(title_ar, 'موغول', 'مشغول') WHERE title_ar LIKE '%موغول%';
UPDATE lessons SET title_ar = replace(title_ar, 'موكله', 'مشكله') WHERE title_ar LIKE '%موكله%';
UPDATE lessons SET title_ar = replace(title_ar, 'موكور', 'مشكور') WHERE title_ar LIKE '%موكور%';
UPDATE lessons SET title_ar = replace(title_ar, 'موروع', 'مشروع') WHERE title_ar LIKE '%موروع%';
UPDATE lessons SET title_ar = replace(title_ar, 'مومس', 'مشمس') WHERE title_ar LIKE '%مومس%';
UPDATE lessons SET title_ar = replace(title_ar, 'موهد', 'مشهد') WHERE title_ar LIKE '%موهد%';
UPDATE lessons SET title_ar = replace(title_ar, 'مووي', 'مشوي') WHERE title_ar LIKE '%مووي%';

-- lesson_exercises: hint_ar
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'موغول', 'مشغول') WHERE hint_ar LIKE '%موغول%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'موكله', 'مشكله') WHERE hint_ar LIKE '%موكله%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'موكور', 'مشكور') WHERE hint_ar LIKE '%موكور%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'موروع', 'مشروع') WHERE hint_ar LIKE '%موروع%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'مومس', 'مشمس') WHERE hint_ar LIKE '%مومس%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'موهد', 'مشهد') WHERE hint_ar LIKE '%موهد%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'مووي', 'مشوي') WHERE hint_ar LIKE '%مووي%';

-- lesson_exercises: payload answer, source, why_ar, prompt.ar
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'موغول', 'مشغول'))) WHERE payload->>'answer' LIKE '%موغول%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'موكله', 'مشكله'))) WHERE payload->>'answer' LIKE '%موكله%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'موكور', 'مشكور'))) WHERE payload->>'answer' LIKE '%موكور%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'موروع', 'مشروع'))) WHERE payload->>'answer' LIKE '%موروع%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'مومس', 'مشمس'))) WHERE payload->>'answer' LIKE '%مومس%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'موهد', 'مشهد'))) WHERE payload->>'answer' LIKE '%موهد%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', to_jsonb(replace(payload->>'answer', 'مووي', 'مشوي'))) WHERE payload->>'answer' LIKE '%مووي%';

UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'موغول', 'مشغول'))) WHERE payload->>'source' LIKE '%موغول%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'موكله', 'مشكله'))) WHERE payload->>'source' LIKE '%موكله%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'موكور', 'مشكور'))) WHERE payload->>'source' LIKE '%موكور%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'مومس', 'مشمس'))) WHERE payload->>'source' LIKE '%مومس%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'مووي', 'مشوي'))) WHERE payload->>'source' LIKE '%مووي%';

UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'موغول', 'مشغول'))) WHERE payload->>'why_ar' LIKE '%موغول%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'موكله', 'مشكله'))) WHERE payload->>'why_ar' LIKE '%موكله%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'موكور', 'مشكور'))) WHERE payload->>'why_ar' LIKE '%موكور%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', to_jsonb(replace(payload->>'why_ar', 'موروع', 'مشروع'))) WHERE payload->>'why_ar' LIKE '%موروع%';

UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'موغول', 'مشغول'))) WHERE payload#>>'{prompt,ar}' LIKE '%موغول%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'موكله', 'مشكله'))) WHERE payload#>>'{prompt,ar}' LIKE '%موكله%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'موكور', 'مشكور'))) WHERE payload#>>'{prompt,ar}' LIKE '%موكور%';
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', to_jsonb(replace(payload#>>'{prompt,ar}', 'مووي', 'مشوي'))) WHERE payload#>>'{prompt,ar}' LIKE '%مووي%';

-- words: example_ar
UPDATE words SET example_ar = replace(example_ar, 'موغول', 'مشغول') WHERE example_ar LIKE '%موغول%';
UPDATE words SET example_ar = replace(example_ar, 'موكله', 'مشكله') WHERE example_ar LIKE '%موكله%';
UPDATE words SET example_ar = replace(example_ar, 'موكور', 'مشكور') WHERE example_ar LIKE '%موكور%';
UPDATE words SET example_ar = replace(example_ar, 'موروع', 'مشروع') WHERE example_ar LIKE '%موروع%';
UPDATE words SET example_ar = replace(example_ar, 'مومس', 'مشمس') WHERE example_ar LIKE '%مومس%';
UPDATE words SET example_ar = replace(example_ar, 'موهد', 'مشهد') WHERE example_ar LIKE '%موهد%';
UPDATE words SET example_ar = replace(example_ar, 'مووي', 'مشوي') WHERE example_ar LIKE '%مووي%';
