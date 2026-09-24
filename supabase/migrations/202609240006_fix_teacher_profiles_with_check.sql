-- ═══════════════════════════════════════════════════════════════
-- 202609240006_fix_teacher_profiles_with_check.sql
-- Add missing WITH CHECK clause to teacher_profiles_update policy.
--
-- SECURITY FIX: The UPDATE policy on teacher_profiles had a USING
-- clause but no WITH CHECK clause. This means a teacher could update
-- their own profile row but change the user_id column to point to
-- another user — effectively taking over their profile.
--
-- Best practice: Every INSERT and UPDATE policy should include both
-- USING and WITH CHECK clauses.
-- Reference: https://ubserve.com/platform-guides/supabase-security-checklist-ai-built-apps
-- ═══════════════════════════════════════════════════════════════

-- Drop and recreate with WITH CHECK (ALTER POLICY failed with 400;
-- DROP + CREATE works reliably)
DROP POLICY IF EXISTS teacher_profiles_update ON teacher_profiles;

CREATE POLICY teacher_profiles_update ON teacher_profiles
  FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id) OR has_permission('teachers.write'::text))
  WITH CHECK ((auth.uid() = user_id) OR has_permission('teachers.write'::text));
