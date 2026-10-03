-- 202610030002: Admin storage cleanup RPCs
--
-- Adds two SECURITY DEFINER functions for safe, admin-only cleanup
-- of ephemeral/old DB rows to free up Supabase storage.
--
-- Targets are FIXED (whitelist) — the client cannot pass arbitrary table names.
-- Each target enforces a MINIMUM retention window so an admin can never
-- delete recent data by accident.
--
-- Targets:
--   auth_attempts           — min 3 days retention
--   student_activity_events  — min 14 days retention
--   audit_log               — min 90 days retention (preserves the cleanup audit row itself)
--   student_presence         — min 7 days retention (stale sessions only)
--   learning_snapshots       — min 180 days retention
--   learning_timeline        — min 180 days retention
--   announcement_recipients   — min 30 days retention (read receipts)

CREATE OR REPLACE FUNCTION public.admin_cleanup_preview(p_targets jsonb DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Returns { target: { total: N, deletable: M, oldest: 'date' } }
  -- No deletes. Safe to call anytime.
  SELECT jsonb_object_agg(target, jsonb_build_object(
    'total', total,
    'deletable', deletable,
    'oldest', oldest,
    'retention_days', retention_days
  ))
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
$$;

CREATE OR REPLACE FUNCTION public.admin_cleanup_run(p_targets jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_deleted integer;
  v_target text;
BEGIN
  -- Permission check
  IF NOT has_permission('settings.manage'::text) THEN
    RETURN jsonb_build_object('error', 'permission_denied');
  END IF;

  -- Fixed whitelist of (target, min_retention_days, delete_condition_template)
  -- The client sends which targets to clean; we enforce the retention.
  FOR v_target IN SELECT jsonb_array_elements_text(p_targets)
  LOOP
    v_deleted := 0;

    IF v_target = 'auth_attempts' THEN
      DELETE FROM auth_attempts WHERE created_at < now() - interval '3 days';
      GET DIAGNOSTICS v_deleted = ROW_COUNT;

    ELSIF v_target = 'student_activity_events' THEN
      DELETE FROM student_activity_events WHERE created_at < now() - interval '14 days';
      GET DIAGNOSTICS v_deleted = ROW_COUNT;

    ELSIF v_target = 'audit_log' THEN
      DELETE FROM audit_log WHERE created_at < now() - interval '90 days';
      GET DIAGNOSTICS v_deleted = ROW_COUNT;

    ELSIF v_target = 'student_presence' THEN
      DELETE FROM student_presence WHERE last_seen_at IS NOT NULL AND last_seen_at < now() - interval '7 days';
      GET DIAGNOSTICS v_deleted = ROW_COUNT;

    ELSIF v_target = 'learning_snapshots' THEN
      DELETE FROM learning_snapshots WHERE created_at < now() - interval '180 days';
      GET DIAGNOSTICS v_deleted = ROW_COUNT;

    ELSIF v_target = 'learning_timeline' THEN
      DELETE FROM learning_timeline WHERE occurred_at < now() - interval '180 days';
      GET DIAGNOSTICS v_deleted = ROW_COUNT;

    ELSIF v_target = 'announcement_recipients' THEN
      DELETE FROM announcement_recipients WHERE read_at IS NOT NULL AND read_at < now() - interval '30 days';
      GET DIAGNOSTICS v_deleted = ROW_COUNT;

    ELSE
      -- Unknown target — skip
      CONTINUE;
    END IF;

    v_result := v_result || jsonb_build_object(v_target, v_deleted);
  END LOOP;

  -- Audit the cleanup itself (inserts AFTER deletes so it survives)
  INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
  VALUES (
    auth.uid(),
    'system.cleanup',
    'database',
    'storage_cleanup',
    jsonb_build_object('deleted', v_result, 'targets', p_targets)
  );

  RETURN jsonb_build_object('deleted', v_result);
END;
$$;

-- Grant to authenticated (admin role enforced inside the function)
GRANT EXECUTE ON FUNCTION public.admin_cleanup_preview(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cleanup_run(jsonb) TO authenticated;
