-- ============================================================
-- 202608270001 · A1 starts at granular skill lessons, not the Foundations overview
-- ------------------------------------------------------------
-- Before: student_route() orders A1 academies by sort_order, and
-- `english-foundations` had sort_order = 0, so it was always the FIRST
-- A1 academy in the route -> it became the starting stage for every A1
-- student. A brand-new A1 student therefore landed on the English
-- Foundations overview course (whose lessons include "Making an
-- Appointment" / reservations), instead of the granular A1 skill
-- academies (a1-core-words, a1-present-simple, ...).
--
-- After: `english-foundations` is moved AFTER the granular A1 academies
-- (sort_order 200 > a1-vocab-context 117), so a1-core-words is now the
-- first A1 academy in the route and becomes the starting stage. The
-- Foundations overview remains reachable as a later stage in the route
-- (a capstone), it is just no longer the start.
--
-- Existing students parked at english-foundations are re-homed:
-- current_stage/current_lesson are cleared so _prog_for re-seats them at
-- the new first route academy (a1-core-words) on next load. completed_lessons
-- is a SEPARATE set and is untouched, so no lesson progress is lost.
-- ============================================================

update public.academies set sort_order = 200 where id = 'english-foundations';

update public.student_progression
   set current_stage = null,
       current_lesson = null,
       updated_at = now()
 where current_stage = 'english-foundations';
