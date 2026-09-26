-- Fix admin_student_progression permission check (2026-09-27).
--
-- The function guarded itself with has_permission('students.view'), but
-- 'students.view' does not exist in role_permissions (the table uses
-- students.read / students.write / students.manage). The RPC therefore
-- raised 'Insufficient permission: students.view' for EVERY caller,
-- including super_admin, so the student-360 header progression line
-- (current stage / level / lesson / completed count) never rendered.
--
-- Fix: check 'students.read', the same permission admin_student_360 and
-- the other admin_student_* RPCs use. Verified against the live DB before
-- shipping: students.view appeared in no role_permissions row.

CREATE OR REPLACE FUNCTION public.admin_student_progression(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare v_prog public.student_progression%rowtype;
begin
  if not public.has_permission('students.read') then
    raise exception 'Insufficient permission: students.read';
  end if;
  if not exists (select 1 from auth.users where id = p_user_id) then
    return jsonb_build_object('ok', false, 'reason', 'user not found');
  end if;
  perform public._prog_for(p_user_id);
  select * into v_prog from public.student_progression where user_id = p_user_id;
  return jsonb_build_object(
    'ok', true,
    'prog', jsonb_build_object(
      'current_level',   v_prog.current_level,
      'current_stage',   v_prog.current_stage,
      'current_lesson',  v_prog.current_lesson,
      'completed_lessons', coalesce((select jsonb_agg(e->>'id') from jsonb_array_elements(v_prog.completed_lessons) e), '[]'::jsonb),
      'checkpoints',     v_prog.checkpoint_results,
      'concepts_mastered', coalesce((select count(*) from jsonb_object_keys(v_prog.concept_mastery)), 0),
      'review_due',      coalesce(jsonb_array_length(v_prog.review_queue), 0),
      'updated_at',      v_prog.updated_at
    )
  );
end;
$function$;
