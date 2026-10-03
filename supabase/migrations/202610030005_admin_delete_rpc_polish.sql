-- 202610030005: Polish admin delete RPCs
--
-- Found in review of 202610030003:
-- 1. admin_delete_entity inserted an audit row and returned success even
--    when the target row did not exist (0 rows affected) — the admin UI
--    then toasted "Deleted" for a no-op. Now returns {error:'not_found'}
--    and skips the audit insert when nothing was deleted/archived.
-- 2. admin_delete_preview certificate branch had a dead placeholder
--    (counted all attendance rows, result discarded) — removed.
-- 3. Header comment of 202610030003 claimed an 'attendance' hard-delete
--    branch that never existed — comment corrected there.

CREATE OR REPLACE FUNCTION public.admin_delete_preview(p_entity text, p_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_name text;
  v_count integer;
BEGIN
  IF NOT has_permission('settings.manage'::text) THEN
    RETURN jsonb_build_object('error', 'permission_denied');
  END IF;

  IF p_entity = 'group' THEN
    SELECT name INTO v_name FROM groups WHERE id = p_id::uuid;
    SELECT count(*) INTO v_count FROM group_members WHERE group_id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'delete',
      'dependencies', jsonb_build_object('members', v_count),
      'warning', v_count > 0);

  ELSIF p_entity = 'intervention' THEN
    SELECT title_en INTO v_name FROM interventions WHERE id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'delete', 'dependencies', '{}'::jsonb);

  ELSIF p_entity = 'note' THEN
    SELECT left(p_body, 60) INTO v_name FROM student_notes WHERE id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'delete', 'dependencies', '{}'::jsonb);

  ELSIF p_entity = 'snapshot' THEN
    SELECT 'Snapshot ' || to_char(snapshot_date, 'YYYY-MM-DD') INTO v_name FROM learning_snapshots WHERE id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'delete', 'dependencies', '{}'::jsonb);

  ELSIF p_entity = 'timeline' THEN
    SELECT event_type INTO v_name FROM learning_timeline WHERE id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'delete', 'dependencies', '{}'::jsonb);

  ELSIF p_entity = 'pricing' THEN
    SELECT tier || ' / ' || duration_months || 'mo' INTO v_name FROM plan_pricing WHERE id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'delete', 'dependencies', '{}'::jsonb);

  ELSIF p_entity = 'certificate' THEN
    SELECT student_name || ' - ' || level INTO v_name FROM certificates WHERE id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'delete', 'dependencies', '{}'::jsonb);

  ELSIF p_entity = 'live_class' THEN
    SELECT topic INTO v_name FROM live_classes WHERE id = p_id::uuid;
    SELECT count(*) INTO v_count FROM attendance WHERE live_class_id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'archive',
      'dependencies', jsonb_build_object('attendance_records', v_count),
      'warning', v_count > 0);

  ELSIF p_entity = 'program' THEN
    SELECT name_en INTO v_name FROM programs WHERE id = p_id::uuid;
    SELECT count(*) INTO v_count FROM groups WHERE program_id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'archive',
      'dependencies', jsonb_build_object('groups', v_count),
      'warning', v_count > 0);

  ELSIF p_entity = 'academy' THEN
    SELECT name_en INTO v_name FROM academies WHERE id = p_id::uuid;
    SELECT count(*) INTO v_count FROM academy_lessons WHERE academy_id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'archive',
      'dependencies', jsonb_build_object('lessons', v_count),
      'warning', v_count > 0);

  ELSIF p_entity = 'lesson' THEN
    SELECT en INTO v_name FROM lessons WHERE id = p_id::uuid;
    SELECT count(*) INTO v_count FROM lesson_items WHERE lesson_id = p_id::uuid;
    v_result := jsonb_build_object('name', v_name, 'action', 'archive',
      'dependencies', jsonb_build_object('items', v_count),
      'warning', v_count > 0);

  ELSE
    v_result := jsonb_build_object('error', 'unknown_entity');
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_entity(p_entity text, p_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_count integer;
BEGIN
  IF NOT has_permission('settings.manage'::text) THEN
    RETURN jsonb_build_object('error', 'permission_denied');
  END IF;

  IF p_entity = 'group' THEN
    SELECT name INTO v_name FROM groups WHERE id = p_id::uuid;
    DELETE FROM groups WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.delete', 'group', p_id, jsonb_build_object('name', v_name));

  ELSIF p_entity = 'intervention' THEN
    DELETE FROM interventions WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.delete', 'intervention', p_id, jsonb_build_object());

  ELSIF p_entity = 'note' THEN
    DELETE FROM student_notes WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.delete', 'note', p_id, jsonb_build_object());

  ELSIF p_entity = 'snapshot' THEN
    DELETE FROM learning_snapshots WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.delete', 'snapshot', p_id, jsonb_build_object());

  ELSIF p_entity = 'timeline' THEN
    DELETE FROM learning_timeline WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.delete', 'timeline', p_id, jsonb_build_object());

  ELSIF p_entity = 'pricing' THEN
    DELETE FROM plan_pricing WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.delete', 'plan_pricing', p_id, jsonb_build_object());

  ELSIF p_entity = 'certificate' THEN
    SELECT student_name INTO v_name FROM certificates WHERE id = p_id::uuid;
    DELETE FROM certificates WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.delete', 'certificate', p_id, jsonb_build_object('name', v_name));

  ELSIF p_entity = 'live_class' THEN
    SELECT topic INTO v_name FROM live_classes WHERE id = p_id::uuid;
    UPDATE live_classes SET status = 'cancelled' WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.cancel', 'live_class', p_id, jsonb_build_object('name', v_name));

  ELSIF p_entity = 'program' THEN
    SELECT name_en INTO v_name FROM programs WHERE id = p_id::uuid;
    UPDATE programs SET active = false WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.archive', 'program', p_id, jsonb_build_object('name', v_name));

  ELSIF p_entity = 'academy' THEN
    SELECT name_en INTO v_name FROM academies WHERE id = p_id::uuid;
    UPDATE academies SET active = false WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.archive', 'academy', p_id, jsonb_build_object('name', v_name));

  ELSIF p_entity = 'lesson' THEN
    SELECT en INTO v_name FROM lessons WHERE id = p_id::uuid;
    UPDATE lessons SET active = false WHERE id = p_id::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
    INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), 'admin.archive', 'lesson', p_id, jsonb_build_object('name', v_name));

  ELSE
    RETURN jsonb_build_object('error', 'unknown_entity');
  END IF;

  RETURN jsonb_build_object('deleted', v_count, 'action',
    CASE WHEN p_entity IN ('live_class','program','academy','lesson') THEN 'archived' ELSE 'deleted' END);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_preview(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_entity(text, text) TO authenticated;
