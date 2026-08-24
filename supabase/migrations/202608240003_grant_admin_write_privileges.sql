-- Fix: grant write privileges to `authenticated` on admin tables.
--
-- Migration 202608240001 created plan_pricing, assessment_questions, and
-- credit_ledger with RLS policies allowing admin writes, but only granted
-- SELECT to `authenticated` (it ran `GRANT SELECT ... TO anon, authenticated`
-- and nothing else). As a result every admin write to these tables failed
-- with PostgreSQL error 42501 "permission denied for table <name>", which
-- surfaced in the admin Billing & Index screen as "6 fields failed".
--
-- This grants INSERT, UPDATE, DELETE to `authenticated` so the existing RLS
-- policies (pp_admin_write, aq_admin_write, cl_admin_all, and the programs
-- admin policy) can take effect. RLS still gates who can actually write —
-- only super_admin / admin roles holding the matching permission may write.
-- Anonymous users remain read-only (SELECT only).
--
-- programs is an older table but had the same gap (only SELECT granted), and
-- the admin console inserts new programs into it.

GRANT INSERT, UPDATE, DELETE ON public.plan_pricing TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.assessment_questions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.credit_ledger TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.programs TO authenticated;
