-- 202610070002_phonics_teach_panel.sql
-- Fix: alphabet lesson was showing grammar terms (subject pronouns, am/is/are)
-- in the "Learn first then practice" teach panel. The grammar glossary detected
-- the word "is" in sentences like "A is for apple" and incorrectly taught
-- grammar concepts that belong in a0-sentence-building, not the alphabet lesson.
--
-- Fix applied in lib/pel_lesson_stage.js (client-side):
--   - Added isPhonicsLesson() guard for a0-spelling-sounds academy + phonics lesson IDs
--   - grammarGlossary() returns [] for phonics lessons
--   - connectionNoteFor() returns '' for phonics lessons
--   - prereqWordsFor() returns [] for phonics lessons
--   - buildTeachHtml() shows "Get a pen and paper" + letter pronunciation panel for phonics
--
-- DB fix: X letter example was "X is for box." (box doesn't start with X sound).
-- Changed to "X is for x-ray." to match the sentence item and be phonetically correct.

UPDATE lesson_items
   SET example_en = 'X is for x-ray.',
       example_ar = 'الاشعه تبدا بحرف X.'
 WHERE lesson_id = 'a0ss-alphabet'
   AND en = 'X'
   AND example_en = 'X is for box.';
