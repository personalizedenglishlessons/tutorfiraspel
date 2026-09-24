-- ============================================================
-- Drop orphaned old complete_activity(text, integer, jsonb) overload
--
-- Problem: Two overloads of complete_activity exist in the live DB:
--   1. complete_activity(text, integer, jsonb)           [OID 20308] — old, no p_stats
--   2. complete_activity(text, integer, jsonb, jsonb)    [OID 21097] — current, with p_stats
--
-- The app calls complete_activity with { p_lesson_id, p_stats } (named params),
-- which PostgREST routes to the 4-arg overload. The 3-arg overload is dead code
-- from an earlier migration that was superseded by CREATE OR REPLACE adding
-- the p_stats parameter — but CREATE OR REPLACE cannot change a function's
-- signature, so the old overload was left behind.
--
-- This migration drops the orphaned 3-arg overload. The 4-arg overload is
-- unaffected (DROP FUNCTION with explicit args only drops that signature).
-- ============================================================

DROP FUNCTION IF EXISTS public.complete_activity(text, integer, jsonb);
