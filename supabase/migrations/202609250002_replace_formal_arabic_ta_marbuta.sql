-- ============================================================
-- Replace formal Arabic ta marbuta (ة→ه) in DB Arabic text
--
-- Saudi dialect writes ta marbuta as heh (ه) instead of (ة).
-- This migration updates Arabic text in lessons, lesson_items,
-- and lesson_exercises to match the Saudi dialect convention
-- already used in the app source code.
--
-- Idempotent: replace() is safe to re-run (no-op if already fixed).
-- ============================================================

-- Lessons: title_ar
UPDATE lessons SET title_ar = replace(title_ar, 'الكتابة', 'الكتابه') WHERE title_ar LIKE '%الكتابة%';
UPDATE lessons SET title_ar = replace(title_ar, 'المراجعة', 'المراجعه') WHERE title_ar LIKE '%المراجعة%';
UPDATE lessons SET title_ar = replace(title_ar, 'المحادثة', 'المحادثه') WHERE title_ar LIKE '%المحادثة%';
UPDATE lessons SET title_ar = replace(title_ar, 'القاعدة', 'القاعده') WHERE title_ar LIKE '%القاعدة%';
UPDATE lessons SET title_ar = replace(title_ar, 'الاجابة', 'الاجابه') WHERE title_ar LIKE '%الاجابة%';
UPDATE lessons SET title_ar = replace(title_ar, 'النتيجة', 'النتيجه') WHERE title_ar LIKE '%النتيجة%';
UPDATE lessons SET title_ar = replace(title_ar, 'القراءة', 'القرايه') WHERE title_ar LIKE '%القراءة%';
UPDATE lessons SET title_ar = replace(title_ar, 'المساعدة', 'المساعده') WHERE title_ar LIKE '%المساعدة%';
UPDATE lessons SET title_ar = replace(title_ar, 'التمرينة', 'التمرينه') WHERE title_ar LIKE '%التمرينة%';

-- Lesson items: ar_meaning, example_ar, note_ar
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'الكتابة', 'الكتابه') WHERE ar_meaning LIKE '%الكتابة%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'المراجعة', 'المراجعه') WHERE ar_meaning LIKE '%المراجعة%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'المحادثة', 'المحادثه') WHERE ar_meaning LIKE '%المحادثة%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'القاعدة', 'القاعده') WHERE ar_meaning LIKE '%القاعدة%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'الاجابة', 'الاجابه') WHERE ar_meaning LIKE '%الاجابة%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'النتيجة', 'النتيجه') WHERE ar_meaning LIKE '%النتيجة%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'القراءة', 'القرايه') WHERE ar_meaning LIKE '%القراءة%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'المساعدة', 'المساعده') WHERE ar_meaning LIKE '%المساعدة%';
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'التمرينة', 'التمرينه') WHERE ar_meaning LIKE '%التمرينة%';

UPDATE lesson_items SET example_ar = replace(example_ar, 'الكتابة', 'الكتابه') WHERE example_ar LIKE '%الكتابة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'المراجعة', 'المراجعه') WHERE example_ar LIKE '%المراجعة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'المحادثة', 'المحادثه') WHERE example_ar LIKE '%المحادثة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'القاعدة', 'القاعده') WHERE example_ar LIKE '%القاعدة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'الاجابة', 'الاجابه') WHERE example_ar LIKE '%الاجابة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'النتيجة', 'النتيجه') WHERE example_ar LIKE '%النتيجة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'القراءة', 'القرايه') WHERE example_ar LIKE '%القراءة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'المساعدة', 'المساعده') WHERE example_ar LIKE '%المساعدة%';
UPDATE lesson_items SET example_ar = replace(example_ar, 'التمرينة', 'التمرينه') WHERE example_ar LIKE '%التمرينة%';

UPDATE lesson_items SET note_ar = replace(note_ar, 'الكتابة', 'الكتابه') WHERE note_ar LIKE '%الكتابة%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'المراجعة', 'المراجعه') WHERE note_ar LIKE '%المراجعة%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'المحادثة', 'المحادثه') WHERE note_ar LIKE '%المحادثة%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'القاعدة', 'القاعده') WHERE note_ar LIKE '%القاعدة%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'الاجابة', 'الاجابه') WHERE note_ar LIKE '%الاجابة%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'النتيجة', 'النتيجه') WHERE note_ar LIKE '%النتيجة%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'القراءة', 'القرايه') WHERE note_ar LIKE '%القراءة%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'المساعدة', 'المساعده') WHERE note_ar LIKE '%المساعدة%';
UPDATE lesson_items SET note_ar = replace(note_ar, 'التمرينة', 'التمرينه') WHERE note_ar LIKE '%التمرينة%';

-- Lesson exercises: hint_ar
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'الكتابة', 'الكتابه') WHERE hint_ar LIKE '%الكتابة%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'المراجعة', 'المراجعه') WHERE hint_ar LIKE '%المراجعة%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'المحادثة', 'المحادثه') WHERE hint_ar LIKE '%المحادثة%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'القاعدة', 'القاعده') WHERE hint_ar LIKE '%القاعدة%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'الاجابة', 'الاجابه') WHERE hint_ar LIKE '%الاجابة%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'النتيجة', 'النتيجه') WHERE hint_ar LIKE '%النتيجة%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'القراءة', 'القرايه') WHERE hint_ar LIKE '%القراءة%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'المساعدة', 'المساعده') WHERE hint_ar LIKE '%المساعدة%';
UPDATE lesson_exercises SET hint_ar = replace(hint_ar, 'التمرينة', 'التمرينه') WHERE hint_ar LIKE '%التمرينة%';

-- Lesson exercises: payload (JSONB with Arabic text in prompt.ar, question.ar, etc.)
-- Replace in the JSONB text representation
UPDATE lesson_exercises SET payload = payload::text::jsonb
WHERE payload::text ~ 'الكتابة|المراجعة|المحادثة|القاعدة|الاجابة|النتيجة|القراءة|المساعدة|التمرينة';

-- For the payload, we need to do string replacement on the JSON text
-- This is done in a DO block to handle all patterns
DO $$
DECLARE
  r RECORD;
  new_payload JSONB;
BEGIN
  FOR r IN SELECT id, payload FROM lesson_exercises WHERE payload::text ~ 'الكتابة|المراجعة|المحادثة|القاعدة|الاجابة|النتيجة|القراءة|المساعدة|التمرينة' LOOP
    new_payload := r.payload::text::jsonb;
    -- The replacement was already done by the text cast above if the JSONB contained these strings
    -- But JSONB normalization may not apply replace. Let's do it explicitly:
    new_payload := replace(new_payload::text, 'الكتابة', 'الكتابه')::jsonb;
    new_payload := replace(new_payload::text, 'المراجعة', 'المراجعه')::jsonb;
    new_payload := replace(new_payload::text, 'المحادثة', 'المحادثه')::jsonb;
    new_payload := replace(new_payload::text, 'القاعدة', 'القاعده')::jsonb;
    new_payload := replace(new_payload::text, 'الاجابة', 'الاجابه')::jsonb;
    new_payload := replace(new_payload::text, 'النتيجة', 'النتيجه')::jsonb;
    new_payload := replace(new_payload::text, 'القراءة', 'القرايه')::jsonb;
    new_payload := replace(new_payload::text, 'المساعدة', 'المساعده')::jsonb;
    new_payload := replace(new_payload::text, 'التمرينة', 'التمرينه')::jsonb;
    UPDATE lesson_exercises SET payload = new_payload WHERE id = r.id;
  END LOOP;
END $$;
