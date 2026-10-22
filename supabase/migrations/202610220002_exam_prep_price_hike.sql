-- Exam Prep track price increase (owner-directed, 2026-10-22):
--   1 month: 949 -> 1099, 2 months: 1499 -> 1699, 3 months: 2249 -> 2499
-- Start From 0 tiers unchanged (649 / 799 / 1249).
-- Absolute updates keyed on tier + duration_months: idempotent, safe to
-- re-run, no row inserts or deletes. Mirrors lib/pel-plans.js and the
-- index.html fallback matrix (public_index_plans reads this table).
begin;

update public.plan_pricing set price = 1099
  where tier = 'exam_prep' and duration_months = 1;
update public.plan_pricing set price = 1699
  where tier = 'exam_prep' and duration_months = 2;
update public.plan_pricing set price = 2499
  where tier = 'exam_prep' and duration_months = 3;

commit;
