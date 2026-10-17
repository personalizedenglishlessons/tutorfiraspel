-- Lock-in: the alphabet is ALWAYS the first A0 lesson.
-- student_route() already puts academy a0-spelling-sounds first; this makes the lesson first inside it.
-- Idempotent.
update public.academy_lessons set sort_order = -10
where academy_id = 'a0-spelling-sounds' and lesson_id = 'a0ss-alphabet';
update public.academy_lessons set sort_order = -10
where academy_id = 'english-foundations' and lesson_id = 'the-alphabet';
