-- Adjust plan prices to charm pricing (owner-approved, 2026-10-22):
--   start_from_zero: 650 -> 649, 800 -> 799, 1300 -> 1249
--   exam_prep:       1000 -> 949, 1550 -> 1499, 2350 -> 2249
-- Absolute updates keyed on tier + duration_months: idempotent, safe to
-- re-run, no row inserts or deletes. Mirrors lib/pel-plans.js and the
-- index.html fallback matrix (public_index_plans reads this table).
begin;

update public.plan_pricing set price = 649
  where tier = 'start_from_zero' and duration_months = 1;
update public.plan_pricing set price = 799
  where tier = 'start_from_zero' and duration_months = 2;
update public.plan_pricing set price = 1249
  where tier = 'start_from_zero' and duration_months = 3;
update public.plan_pricing set price = 949
  where tier = 'exam_prep' and duration_months = 1;
update public.plan_pricing set price = 1499
  where tier = 'exam_prep' and duration_months = 2;
update public.plan_pricing set price = 2249
  where tier = 'exam_prep' and duration_months = 3;

commit;
