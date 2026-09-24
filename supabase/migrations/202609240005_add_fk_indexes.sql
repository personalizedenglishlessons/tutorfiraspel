-- ═══════════════════════════════════════════════════════════════
-- 202609240005_add_fk_indexes.sql
-- Add missing foreign key indexes for JOIN and CASCADE performance.
--
-- PostgreSQL does NOT auto-index foreign key columns. Every FK column
-- used in JOINs or that could be targeted by CASCADE operations needs
-- an explicit index. Without it, Postgres does a full table scan on
-- the child table for every join or cascade.
--
-- 21 FKs identified as missing indexes via:
--   SELECT con.conname, rel.relname, att.attname
--   FROM pg_constraint con
--   JOIN pg_class rel ON rel.oid = con.conrelid
--   JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = con.conkey[1]
--   WHERE con.contype = 'f' AND NOT EXISTS (...)
--
-- Reference: https://supabase.com/docs/guides/database/database-advisors
-- ═══════════════════════════════════════════════════════════════

-- announcements → class_id, created_by
CREATE INDEX IF NOT EXISTS idx_announcements_class_id ON announcements (class_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements (created_by);

-- attendance → marked_by
CREATE INDEX IF NOT EXISTS idx_attendance_marked_by ON attendance (marked_by);

-- group_waitlist → user_id
CREATE INDEX IF NOT EXISTS idx_group_waitlist_user_id ON group_waitlist (user_id);

-- groups → program_id, teacher_id
CREATE INDEX IF NOT EXISTS idx_groups_program_id ON groups (program_id);
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups (teacher_id);

-- lesson_items → word_id
CREATE INDEX IF NOT EXISTS idx_lesson_items_word_id ON lesson_items (word_id);

-- live_class_requests → service_code
CREATE INDEX IF NOT EXISTS idx_live_class_requests_service_code ON live_class_requests (service_code);

-- live_classes → group_id, teacher_id
CREATE INDEX IF NOT EXISTS idx_live_classes_group_id ON live_classes (group_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_teacher_id ON live_classes (teacher_id);

-- plan_history → created_by, old_program_id, program_id
CREATE INDEX IF NOT EXISTS idx_plan_history_created_by ON plan_history (created_by);
CREATE INDEX IF NOT EXISTS idx_plan_history_old_program_id ON plan_history (old_program_id);
CREATE INDEX IF NOT EXISTS idx_plan_history_program_id ON plan_history (program_id);

-- role_permissions → permission
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions (permission);

-- student_notes → author_user_id
CREATE INDEX IF NOT EXISTS idx_student_notes_author_user_id ON student_notes (author_user_id);

-- subscriptions → created_by, program_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_by ON subscriptions (created_by);
CREATE INDEX IF NOT EXISTS idx_subscriptions_program_id ON subscriptions (program_id);

-- teacher_overrides → recommendation_id, user_id
CREATE INDEX IF NOT EXISTS idx_teacher_overrides_recommendation_id ON teacher_overrides (recommendation_id);
CREATE INDEX IF NOT EXISTS idx_teacher_overrides_user_id ON teacher_overrides (user_id);

-- track_academies → academy_id
CREATE INDEX IF NOT EXISTS idx_track_academies_academy_id ON track_academies (academy_id);

-- user_roles → role
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);
