-- Fix "correct" exercises where payload.right === payload.wrong.
-- These were useless: both options were identical, so the student could not
-- tell the error from the correct sentence (and the "wrong" option was not
-- actually wrong). Give each a real error version + an Abha-dialect note.
--
-- Scope: exactly the three rows audited by:
--   select id, lesson_id, payload->>'right', payload->>'wrong'
--   from lesson_exercises
--   where type='correct' and btrim(payload->>'right') = btrim(payload->>'wrong')
--     and coalesce(payload->>'right','') <> '';
--   -> ids 1156, 1233, 1273
--
-- Uses || (jsonb merge) so existing keys (mode, right, etc.) are preserved;
-- only wrong / why_en / why_ar are overwritten.
-- No em-dashes, no hamzas, Saudi Southern/Abha dialect in the Arabic notes.

update lesson_exercises
set payload = payload || jsonb_build_object(
  'wrong',  'I will replies soon.',
  'why_en', 'After will use the base verb: reply, not replies.',
  'why_ar', 'بعد will نستخدم الفعل بدون s: reply مو replies.'
)
where id = 1156;

update lesson_exercises
set payload = payload || jsonb_build_object(
  'wrong',  'I look forward for your reply.',
  'why_en', 'The phrase is look forward to, not for.',
  'why_ar', 'العبارة look forward to مو for.'
)
where id = 1233;

update lesson_exercises
set payload = payload || jsonb_build_object(
  'wrong',  'She likes tea, and so does I.',
  'why_en', 'so do I with I uses do, not does.',
  'why_ar', 'مع I نستخدم do مو does في so do I.'
)
where id = 1273;
