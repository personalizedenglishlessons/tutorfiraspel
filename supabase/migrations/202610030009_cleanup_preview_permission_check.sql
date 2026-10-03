-- 202610030009: Add permission check to admin_cleanup_preview
--
-- Bug: admin_cleanup_preview was LANGUAGE sql SECURITY DEFINER with
-- GRANT EXECUTE TO authenticated, but had NO permission check — unlike
-- admin_cleanup_run (which checks has_permission('settings.manage')).
-- Any authenticated student could call it and see row counts of
-- auth_attempts, audit_log, student_presence, learning_snapshots,
-- learning_timeline, announcement_recipients, student_activity_events.
--
-- Fix: convert to plpgsql and add the same has_permission('settings.manage')
-- guard that admin_cleanup_run and all other admin RPCs use.

CREATE OR REPLACE FUNCTION public.admin_cleanup_preview(p_targets jsonb DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT has_permission('settings.manage'::text) THEN
    RETURN jsonb_build_object('error', 'permission_denied');
  END IF;

  SELECT jsonb_object_agg(target, jsonb_build_object(
    'total', total,
    'deletable', deletable,
    'oldest', oldest,
    'retention_days', retention_days
  ))
  INTO v_result
  FROM (
    VALUES
      ('auth_attempts', 3,
        (SELECT count(*) FROM auth_attempts),
        (SELECT count(*) FROM auth_attempts WHERE created_at < now() - interval '3 days'),
        (SELECT to_char(min(created_at), 'YYYY-MM-DD') FROM auth_attempts)
      ),
      ('student_activity_events', 14,
        (SELECT count(*) FROM student_activity_events),
        (SELECT count(*) FROM student_activity_events WHERE created_at < now() - interval '14 days'),
        (SELECT to_char(min(created_at), 'YYYY-MM-DD') FROM student_activity_events)
      ),
      ('audit_log', 90,
        (SELECT count(*) FROM audit_log),
        (SELECT count(*) FROM audit_log WHERE created_at < now() - interval '90 days'),
        (SELECT to_char(min(created_at), 'YYYY-MM-DD') FROM audit_log)
      ),
      ('student_presence', 7,
        (SELECT count(*) FROM student_presence),
        (SELECT count(*) FROM student_presence WHERE last_seen_at IS NOT NULL AND last_seen_at < now() - interval '7 days'),
        (SELECT to_char(min(last_seen_at), 'YYYY-MM-DD') FROM student_presence WHERE last_seen_at IS NOT NULL)
      ),
      ('learning_snapshots', 180,
        (SELECT count(*) FROM learning_snapshots),
        (SELECT count(*) FROM learning_snapshots WHERE created_at < now() - interval '180 days'),
        (SELECT to_char(min(created_at), 'YYYY-MM-DD') FROM learning_snapshots)
      ),
      ('learning_timeline', 180,
        (SELECT count(*) FROM learning_timeline),
        (SELECT count(*) FROM learning_timeline WHERE occurred_at < now() - interval '180 days'),
        (SELECT to_char(min(occurred_at), 'YYYY-MM-DD') FROM learning_timeline)
      ),
      ('announcement_recipients', 30,
        (SELECT count(*) FROM announcement_recipients),
        (SELECT count(*) FROM announcement_recipients WHERE read_at IS NOT NULL AND read_at < now() - interval '30 days'),
        (SELECT to_char(min(read_at), 'YYYY-MM-DD') FROM announcement_recipients WHERE read_at IS NOT NULL)
      )
  ) AS t(target, retention_days, total, deletable, oldest)
  WHERE p_targets IS NULL OR p_targets ? target;

  RETURN v_result;
END;
$$;

-- Re-grant (idempotent)
GRANT EXECUTE ON FUNCTION public.admin_cleanup_preview(jsonb) TO authenticated;
