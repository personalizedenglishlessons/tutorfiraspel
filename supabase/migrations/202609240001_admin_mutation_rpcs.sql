-- ============================================================
-- Admin mutation RPCs — SECURITY DEFINER functions replacing direct table writes
--
-- Status: APPLIED — all RPCs deployed to live DB and admin.js switched to use them.
-- Previously admin.js had ~11 mutation paths writing directly to tables via
-- client().from(table).insert/update/upsert/delete, bypassing the documented
-- "RPC + RLS only" architecture. This migration created the missing RPCs.
-- Verified live: all functions present in information_schema.routines.
--
-- Tables affected: interventions, student_notes, student_profiles,
--   learning_snapshots, groups, live_classes, programs, plan_pricing,
--   site_settings, assessment_questions
-- ============================================================

-- 1. admin_add_intervention
CREATE OR REPLACE FUNCTION public.admin_add_intervention(p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row jsonb;
BEGIN
  IF NOT has_permission('students.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  INSERT INTO interventions (user_id, type, title_en, title_ar, reason_en, reason_ar, status, assignee_role, created_by)
  VALUES (
    (p_payload ->> 'user_id')::uuid,
    p_payload ->> 'type',
    p_payload ->> 'title_en',
    COALESCE(p_payload ->> 'title_ar', p_payload ->> 'title_en'),
    p_payload ->> 'reason_en',
    p_payload ->> 'reason_ar',
    'open',
    p_payload ->> 'assignee_role',
    auth.uid()
  )
  RETURNING to_jsonb(interventions.*) INTO v_row;
  RETURN jsonb_build_object('ok', true, 'data', v_row);
END;
$$;

-- 2. admin_add_student_note
CREATE OR REPLACE FUNCTION public.admin_add_student_note(
  p_user_id uuid, p_body text, p_category text DEFAULT 'note'
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row jsonb;
BEGIN
  IF NOT has_permission('students.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  INSERT INTO student_notes (user_id, author_user_id, category, body)
  VALUES (p_user_id, auth.uid(), p_category, p_body)
  RETURNING to_jsonb(student_notes.*) INTO v_row;
  RETURN jsonb_build_object('ok', true, 'data', v_row);
END;
$$;

-- 3. admin_upsert_student_profile
CREATE OR REPLACE FUNCTION public.admin_upsert_student_profile(p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row jsonb;
BEGIN
  IF NOT has_permission('students.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  INSERT INTO student_profiles (user_id, phone, whatsapp, status, intake, enrollment_date, notes, updated_at)
  VALUES (
    (p_payload ->> 'user_id')::uuid,
    p_payload ->> 'phone',
    p_payload ->> 'whatsapp',
    p_payload ->> 'status',
    p_payload ->> 'intake',
    NULLIF(p_payload ->> 'enrollment_date', '')::date,
    p_payload ->> 'notes',
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    phone = EXCLUDED.phone, whatsapp = EXCLUDED.whatsapp, status = EXCLUDED.status,
    intake = EXCLUDED.intake, enrollment_date = EXCLUDED.enrollment_date,
    notes = EXCLUDED.notes, updated_at = now()
  RETURNING to_jsonb(student_profiles.*) INTO v_row;
  RETURN jsonb_build_object('ok', true, 'data', v_row);
END;
$$;

-- 4. admin_add_learning_snapshot
CREATE OR REPLACE FUNCTION public.admin_add_learning_snapshot(p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row jsonb;
BEGIN
  IF NOT has_permission('students.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  INSERT INTO learning_snapshots (user_id, snapshot_date, level, skill_scores, xp, completed_lessons)
  VALUES (
    (p_payload ->> 'user_id')::uuid,
    COALESCE(p_payload ->> 'snapshot_date', now()::date::text),
    p_payload ->> 'level',
    p_payload -> 'skill_scores',
    COALESCE((p_payload ->> 'xp')::int, 0),
    COALESCE((p_payload ->> 'completed_lessons')::int, 0)
  )
  RETURNING to_jsonb(learning_snapshots.*) INTO v_row;
  RETURN jsonb_build_object('ok', true, 'data', v_row);
END;
$$;

-- 5. admin_save_group
CREATE OR REPLACE FUNCTION public.admin_save_group(p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row jsonb; v_id uuid;
BEGIN
  IF NOT has_permission('groups.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  v_id := NULLIF(p_payload ->> 'id', '')::uuid;
  IF v_id IS NOT NULL THEN
    UPDATE groups SET
      name = p_payload ->> 'name',
      teacher_id = NULLIF(p_payload ->> 'teacher_id', '')::uuid,
      status = p_payload ->> 'status',
      updated_at = now()
    WHERE id = v_id
    RETURNING to_jsonb(groups.*) INTO v_row;
  ELSE
    INSERT INTO groups (name, teacher_id, status, created_at, updated_at)
    VALUES (
      p_payload ->> 'name',
      NULLIF(p_payload ->> 'teacher_id', '')::uuid,
      COALESCE(p_payload ->> 'status', 'active'),
      now(), now()
    )
    RETURNING to_jsonb(groups.*) INTO v_row;
  END IF;
  RETURN jsonb_build_object('ok', true, 'data', v_row);
END;
$$;

-- 6. admin_set_group_teacher
CREATE OR REPLACE FUNCTION public.admin_set_group_teacher(
  p_group_id uuid, p_teacher_id uuid
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_permission('groups.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  UPDATE groups SET teacher_id = p_teacher_id, updated_at = now() WHERE id = p_group_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 7. admin_create_live_class
CREATE OR REPLACE FUNCTION public.admin_create_live_class(p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row jsonb;
BEGIN
  IF NOT has_permission('classes.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  INSERT INTO live_classes (group_id, topic, scheduled_date, start_time, duration_minutes, course_id)
  VALUES (
    NULLIF(p_payload ->> 'group_id', '')::uuid,
    p_payload ->> 'topic',
    COALESCE(p_payload ->> 'scheduled_date', now()::date::text),
    COALESCE(p_payload ->> 'start_time', '19:00'),
    COALESCE((p_payload ->> 'duration_minutes')::int, 60),
    NULLIF(p_payload ->> 'course_id', '')::uuid
  )
  RETURNING to_jsonb(live_classes.*) INTO v_row;
  RETURN jsonb_build_object('ok', true, 'data', v_row);
END;
$$;

-- 8. admin_create_program
CREATE OR REPLACE FUNCTION public.admin_create_program(p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row jsonb;
BEGIN
  IF NOT has_permission('curriculum.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  INSERT INTO programs (code, name_en, name_ar, price, description, created_at, updated_at)
  VALUES (
    p_payload ->> 'code',
    p_payload ->> 'name_en',
    p_payload ->> 'name_ar',
    NULLIF(p_payload ->> 'price', '')::numeric,
    p_payload ->> 'description',
    now(), now()
  )
  RETURNING to_jsonb(programs.*) INTO v_row;
  RETURN jsonb_build_object('ok', true, 'data', v_row);
END;
$$;

-- 9. admin_upsert_plan_pricing (batch)
CREATE OR REPLACE FUNCTION public.admin_upsert_plan_pricing(p_rows jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item jsonb;
BEGIN
  IF NOT has_permission('subscriptions.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_rows)
  LOOP
    INSERT INTO plan_pricing (tier, duration_months, price, weekly_live_classes, featured)
    VALUES (
      v_item ->> 'tier',
      (v_item ->> 'duration_months')::int,
      (v_item ->> 'price')::numeric,
      COALESCE((v_item ->> 'weekly_live_classes')::int, 1),
      COALESCE((v_item ->> 'featured')::boolean, false)
    )
    ON CONFLICT (tier, duration_months) DO UPDATE SET
      price = EXCLUDED.price,
      weekly_live_classes = EXCLUDED.weekly_live_classes,
      featured = EXCLUDED.featured;
  END LOOP;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 10. admin_upsert_site_setting
CREATE OR REPLACE FUNCTION public.admin_upsert_site_setting(
  p_key text, p_value jsonb
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_permission('settings.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  INSERT INTO site_settings (key, value, updated_at)
  VALUES (p_key, p_value, now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 11. admin_upsert_site_settings_batch
CREATE OR REPLACE FUNCTION public.admin_upsert_site_settings_batch(p_rows jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item jsonb;
BEGIN
  IF NOT has_permission('settings.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_rows)
  LOOP
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (v_item ->> 'key', v_item -> 'value', now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  END LOOP;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 12. admin_save_assessment_question
CREATE OR REPLACE FUNCTION public.admin_save_assessment_question(p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row jsonb; v_id uuid;
BEGIN
  IF NOT has_permission('curriculum.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  v_id := NULLIF(p_payload ->> 'id', '')::uuid;
  IF v_id IS NOT NULL THEN
    UPDATE assessment_questions SET
      code = p_payload ->> 'code', tier = p_payload ->> 'tier', level = p_payload ->> 'level',
      difficulty_rating = COALESCE((p_payload ->> 'difficulty_rating')::int, 1),
      question_en = p_payload ->> 'question_en', question_ar = p_payload ->> 'question_ar',
      options = p_payload -> 'options', correct_index = COALESCE((p_payload ->> 'correct_index')::int, 0),
      active = COALESCE((p_payload ->> 'active')::boolean, true),
      sort_order = COALESCE((p_payload ->> 'sort_order')::int, 0)
    WHERE id = v_id
    RETURNING to_jsonb(assessment_questions.*) INTO v_row;
  ELSE
    INSERT INTO assessment_questions (code, tier, level, difficulty_rating, question_en, question_ar, options, correct_index, active, sort_order)
    VALUES (
      p_payload ->> 'code', p_payload ->> 'tier', p_payload ->> 'level',
      COALESCE((p_payload ->> 'difficulty_rating')::int, 1),
      p_payload ->> 'question_en', p_payload ->> 'question_ar',
      p_payload -> 'options', COALESCE((p_payload ->> 'correct_index')::int, 0),
      COALESCE((p_payload ->> 'active')::boolean, true),
      COALESCE((p_payload ->> 'sort_order')::int, 0)
    )
    RETURNING to_jsonb(assessment_questions.*) INTO v_row;
  END IF;
  RETURN jsonb_build_object('ok', true, 'data', v_row);
END;
$$;

-- 13. admin_toggle_assessment_question
CREATE OR REPLACE FUNCTION public.admin_toggle_assessment_question(p_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_active boolean;
BEGIN
  IF NOT has_permission('curriculum.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  UPDATE assessment_questions SET active = NOT active WHERE id = p_id RETURNING active INTO v_active;
  RETURN jsonb_build_object('ok', true, 'data', jsonb_build_object('active', v_active));
END;
$$;

-- 14. admin_delete_assessment_question
CREATE OR REPLACE FUNCTION public.admin_delete_assessment_question(p_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_permission('curriculum.manage') THEN
    RETURN jsonb_build_object('ok', false, 'error', jsonb_build_object('message', 'Permission denied'));
  END IF;
  DELETE FROM assessment_questions WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Grant execute on only the new admin mutation functions to authenticated users.
-- (Permission checks happen inside each function via has_permission().)
GRANT EXECUTE ON FUNCTION public.admin_add_intervention(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_add_student_note(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_student_profile(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_add_learning_snapshot(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_group(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_group_teacher(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_live_class(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_program(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_plan_pricing(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_site_setting(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_site_settings_batch(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_assessment_question(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_assessment_question(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_assessment_question(uuid) TO authenticated;
