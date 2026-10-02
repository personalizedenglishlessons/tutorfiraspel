-- Migration: 202610030001_update_plan_pricing.sql
-- Update plan_pricing to match current pricing across index.html, legal.html, pel-plans.js
-- Old DB prices (89/139/169 SAR) were overriding the static fallback on the live site.

update public.plan_pricing
   set price = 650,  weekly_live_classes = 0, featured = false
 where tier = 'start_from_zero' and duration_months = 1;

update public.plan_pricing
   set price = 800,  weekly_live_classes = 1, featured = false
 where tier = 'start_from_zero' and duration_months = 2;

update public.plan_pricing
   set price = 1300, weekly_live_classes = 2, featured = true
 where tier = 'start_from_zero' and duration_months = 3;

update public.plan_pricing
   set price = 1000, weekly_live_classes = 1, featured = false
 where tier = 'exam_prep' and duration_months = 1;

update public.plan_pricing
   set price = 1550, weekly_live_classes = 2, featured = false
 where tier = 'exam_prep' and duration_months = 2;

update public.plan_pricing
   set price = 2350, weekly_live_classes = 3, featured = true
 where tier = 'exam_prep' and duration_months = 3;
