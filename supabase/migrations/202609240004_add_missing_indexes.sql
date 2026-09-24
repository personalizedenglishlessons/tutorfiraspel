-- ============================================================
-- Add missing indexes for admin queries and FK columns
--
-- Found via index audit: several columns queried by admin_overview,
-- admin_student_360, and other RPCs lack indexes, causing full table
-- scans. This migration adds the most impactful ones.
-- ============================================================

-- student_presence.status — used by admin_overview online count
-- (WHERE status = 'online' AND last_seen_at >= now() - 5 min)
CREATE INDEX IF NOT EXISTS idx_student_presence_status
  ON public.student_presence (status, last_seen_at);

-- subscriptions.status — used by admin_overview expiring count
-- (WHERE status IN ('active','expiring') AND end_date BETWEEN ...)
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_end
  ON public.subscriptions (status, end_date);

-- student_notes.user_id — FK column without index (admin student 360 view)
CREATE INDEX IF NOT EXISTS idx_student_notes_user
  ON public.student_notes (user_id);

-- interventions.status — admin queries filter by status
CREATE INDEX IF NOT EXISTS idx_interventions_status
  ON public.interventions (status);

-- live_classes.status — admin queries for scheduled classes
CREATE INDEX IF NOT EXISTS idx_live_classes_status_date
  ON public.live_classes (status, scheduled_date);

-- certificates.status — admin certificate queries
CREATE INDEX IF NOT EXISTS idx_certificates_status
  ON public.certificates (status);

-- student_activity_events.lesson_id — admin activity queries
CREATE INDEX IF NOT EXISTS idx_activity_events_lesson
  ON public.student_activity_events (lesson_id);

-- student_activity_events.academy_id — admin activity queries
CREATE INDEX IF NOT EXISTS idx_activity_events_academy
  ON public.student_activity_events (academy_id);
