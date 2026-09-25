// supabase/functions/pel-api/index.ts
// Edge Function: allowlisted RPC + table proxy for authenticated app operations.
//
// Request:  { op: string, payload?: object }
// Response: { ok: true, data: ... } | { ok: false, error: string }
//
// Auth: reads sb-access-token cookie (set by pel-auth), sends it as
// Authorization: Bearer <token> to Supabase REST API. RLS policies
// enforce row-level security as before — this function just moves
// the token from localStorage (JS-readable) to a cookie (JS-hidden).
//
// CSRF: all requests must include x-pel-csrf header matching the
// pel-csrf cookie (double-submit pattern). Session checks are exempt.
//
// The allowlist maps operation names to either:
//   { type: "rpc", name: "rpc_name" }           → calls Supabase RPC
//   { type: "table_select", table, columns, ... } → selects from table
//   { type: "table_upsert", table, conflict }   → upserts to table
//
// No generic SQL proxy — only explicitly allowlisted operations.

const SUPABASE_URL = "https://lewoochehpiycocvfwtz.supabase.co";
const ALLOWED_ORIGIN = "https://personalizedenglishlessons.github.io";
const ACCESS_COOKIE = "sb-access-token";
const CSRF_COOKIE = "pel-csrf";

const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "content-type, x-pel-csrf",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

function cookieValue(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function parseJwt(token: string): { sub: string; email: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return {
      sub: payload.sub || "",
      email: payload.email || "",
      role: payload.role || "authenticated",
    };
  } catch {
    return null;
  }
}

// Allowlist of operations. Each entry maps an op name to a Supabase REST call.
const ALLOWLIST: Record<string, { type: string; description: string }> = {
  // Student RPCs (RLS-enforced, user JWT)
  "student_curriculum": { type: "rpc", description: "Get student curriculum" },
  "student_plan_status": { type: "rpc", description: "Get plan status" },
  "student_effective_state": { type: "rpc", description: "Get effective state" },
  "student_switch_academy": { type: "rpc", description: "Switch academy" },
  "student_touch": { type: "rpc", description: "Presence heartbeat" },
  "complete_activity": { type: "rpc", description: "Complete lesson activity" },
  "student_announcements": { type: "rpc", description: "Get announcements" },
  "student_my_classes": { type: "rpc", description: "Get my classes" },
  "student_live_class_overview": { type: "rpc", description: "Live class overview" },
  "student_mark_announcement_read": { type: "rpc", description: "Mark announcement read" },
  "student_save_plan_draft": { type: "rpc", description: "Save plan draft" },
  "student_get_learning_state": { type: "rpc", description: "Get learning state" },
  "student_save_assessment": { type: "rpc", description: "Save assessment" },
  "issue_certificate": { type: "rpc", description: "Issue certificate" },
  "request_live_class": { type: "rpc", description: "Request live class" },
  "mark_welcome_seen": { type: "rpc", description: "Mark welcome seen" },
  "pel_access_state": { type: "rpc", description: "Access state check" },

  // Table operations (RLS-enforced, user JWT)
  "student_data_get": { type: "table_select", description: "Read student_data" },
  "student_data_set": { type: "table_upsert", description: "Write student_data" },
  "student_state_get": { type: "table_select", description: "Read student_state" },
  "student_state_set": { type: "table_upsert", description: "Write student_state" },
  "pel_srs_state_get": { type: "table_select", description: "Read SRS state" },
  "pel_srs_state_set": { type: "table_upsert", description: "Write SRS state" },
  "pel_student_feedback_insert": { type: "table_insert", description: "Insert feedback" },

  // Admin operations (RLS-enforced, admin JWT)
  "admin_add_intervention": { type: "rpc", description: "Add intervention" },
  "admin_add_student_note": { type: "rpc", description: "Add student note" },
  "admin_upsert_student_profile": { type: "rpc", description: "Upsert student profile" },
  "admin_add_learning_snapshot": { type: "rpc", description: "Add learning snapshot" },
  "admin_save_group": { type: "rpc", description: "Save group" },
  "admin_set_group_teacher": { type: "rpc", description: "Set group teacher" },
  "admin_create_live_class": { type: "rpc", description: "Create live class" },
  "admin_create_program": { type: "rpc", description: "Create program" },
  "admin_upsert_plan_pricing": { type: "rpc", description: "Upsert plan pricing" },
  "admin_upsert_site_setting": { type: "rpc", description: "Upsert site setting" },
  "admin_toggle_assessment_question": { type: "rpc", description: "Toggle assessment Q" },
  "admin_delete_assessment_question": { type: "rpc", description: "Delete assessment Q" },
  "admin_save_assessment_question": { type: "rpc", description: "Save assessment Q" },
  "admin_upsert_site_settings_batch": { type: "rpc", description: "Batch upsert settings" },
  "audit_action": { type: "rpc", description: "Audit action" },
  "current_user_role": { type: "rpc", description: "Get current user role" },
  "my_permissions": { type: "rpc", description: "Get my permissions" },
  "admin_overview": { type: "rpc", description: "Admin overview" },
  "admin_students": { type: "rpc", description: "List students" },
  "admin_students_count": { type: "rpc", description: "Count students" },
  "admin_student_360": { type: "rpc", description: "Student 360 view" },
  "admin_student_billing": { type: "rpc", description: "Student billing" },
  "admin_student_delete": { type: "rpc", description: "Delete student" },
  "admin_student_plan": { type: "rpc", description: "Student plan" },
  "admin_student_progression": { type: "rpc", description: "Student progression" },
  "admin_set_student_plan_level": { type: "rpc", description: "Set student plan level" },
  "admin_set_role": { type: "rpc", description: "Set user role" },
  "admin_teachers": { type: "rpc", description: "List teachers" },
  "admin_team": { type: "rpc", description: "Team list" },
  "admin_groups": { type: "rpc", description: "List groups" },
  "admin_group_detail": { type: "rpc", description: "Group detail" },
  "admin_group_add": { type: "rpc", description: "Add to group" },
  "admin_group_move": { type: "rpc", description: "Move group" },
  "admin_group_remove": { type: "rpc", description: "Remove from group" },
  "admin_classes": { type: "rpc", description: "List classes" },
  "admin_class_attendance": { type: "rpc", description: "Class attendance" },
  "admin_class_status": { type: "rpc", description: "Class status" },
  "admin_attendance_save": { type: "rpc", description: "Save attendance" },
  "admin_decide_live_class_request": { type: "rpc", description: "Decide live class request" },
  "admin_live_class_requests": { type: "rpc", description: "Live class requests" },
  "admin_list_live_class_cities": { type: "rpc", description: "List live class cities" },
  "admin_manage_live_class_city": { type: "rpc", description: "Manage live class city" },
  "admin_plans_overview": { type: "rpc", description: "Plans overview" },
  "admin_plan_status": { type: "rpc", description: "Plan status" },
  "admin_save_plan": { type: "rpc", description: "Save plan" },
  "admin_assign_plan": { type: "rpc", description: "Assign plan" },
  "admin_extend_plan": { type: "rpc", description: "Extend plan" },
  "admin_subscriptions": { type: "rpc", description: "List subscriptions" },
  "admin_reports": { type: "rpc", description: "Reports" },
  "admin_interventions": { type: "rpc", description: "Interventions" },
  "admin_announcements": { type: "rpc", description: "Announcements" },
  "admin_create_announcement": { type: "rpc", description: "Create announcement" },
  "admin_announcement_update": { type: "rpc", description: "Update announcement" },
  "admin_announcement_delete": { type: "rpc", description: "Delete announcement" },
  "admin_announcement_stats": { type: "rpc", description: "Announcement stats" },
  "admin_lesson_save": { type: "rpc", description: "Save lesson" },
  "admin_lesson_move": { type: "rpc", description: "Move lesson" },
  "admin_lesson_toggle": { type: "rpc", description: "Toggle lesson" },
  "admin_lesson_unlink": { type: "rpc", description: "Unlink lesson" },
  "admin_academy_save": { type: "rpc", description: "Save academy" },
  "admin_create_student": { type: "rpc", description: "Create student" },
  "admin_create_teacher": { type: "rpc", description: "Create teacher" },
  "admin_adjust_credits": { type: "rpc", description: "Adjust credits" },
  "issue_certificate_admin": { type: "rpc", description: "Issue certificate (admin)" },
  "issue_certificate_manual": { type: "rpc", description: "Issue certificate (manual)" },
  "reissue_certificate": { type: "rpc", description: "Reissue certificate" },
  "revoke_certificate": { type: "rpc", description: "Revoke certificate" },
  "accept_recommendation": { type: "rpc", description: "Accept recommendation" },
  "store_recommendation": { type: "rpc", description: "Store recommendation" },
  "system_health": { type: "rpc", description: "System health" },
  "teacher_override": { type: "rpc", description: "Teacher override" },
  "verify_certificate": { type: "rpc", description: "Verify certificate" },

  // Admin table reads (RLS-enforced, admin JWT)
  "certificates_list": { type: "table_select", description: "List certificates" },
  "programs_list": { type: "table_select", description: "List programs" },
  "groups_list": { type: "table_select", description: "List groups" },
  "academies_list": { type: "table_select", description: "List academies" },
  "academies_get": { type: "table_select", description: "List academies" },
  "lessons_list": { type: "table_select", description: "List lessons" },
  "lessons_get": { type: "table_select", description: "List lessons" },
  "academy_lessons_get": { type: "table_select", description: "List academy lessons" },
  "lesson_items_get": { type: "table_select", description: "List lesson items" },
  "lesson_exercises_get": { type: "table_select", description: "List lesson exercises" },
  "assessment_questions_list": { type: "table_select", description: "List assessment Qs" },
  "assessment_questions_get": { type: "table_select", description: "List assessment Qs" },
  "site_settings_list": { type: "table_select", description: "List site settings" },
  "site_settings_get": { type: "table_select", description: "List site settings" },
  "plan_pricing_list": { type: "table_select", description: "List plan pricing" },
  "plan_pricing_get": { type: "table_select", description: "List plan pricing" },
  "programs_get": { type: "table_select", description: "List programs" },
  "groups_get": { type: "table_select", description: "List groups" },
  "certificates_get": { type: "table_select", description: "List certificates" },
};

// Table configurations for table operations
const TABLE_CONFIG: Record<string, { table: string; columns?: string; conflict?: string }> = {
  "student_data_get": { table: "student_data", columns: "key,value" },
  "student_data_set": { table: "student_data", conflict: "user_id,key" },
  "student_state_get": { table: "student_state", columns: "*" },
  "student_state_set": { table: "student_state", conflict: "user_id" },
  "pel_srs_state_get": { table: "pel_srs_state", columns: "en,ease,interval_days,streak,due_at,snap,updated_at" },
  "pel_srs_state_set": { table: "pel_srs_state", conflict: "user_id,en" },
  "pel_student_feedback_insert": { table: "pel_student_feedback_events" },
  "certificates_list": { table: "certificates", columns: "id,cert_id,code,student_name,academy_en,academy_ar,level,program_name,completed_at,created_at,status,revoke_reason,user_id,verification_count" },
  "certificates_get": { table: "certificates", columns: "id,cert_id,code,student_name,academy_en,academy_ar,level,program_name,completed_at,created_at,status,revoke_reason,user_id,verification_count" },
  "programs_list": { table: "programs", columns: "*" },
  "programs_get": { table: "programs", columns: "*" },
  "groups_list": { table: "groups", columns: "id,name,status" },
  "groups_get": { table: "groups", columns: "id,name,status" },
  "academies_list": { table: "academies", columns: "*" },
  "academies_get": { table: "academies", columns: "*" },
  "lessons_list": { table: "lessons", columns: "*" },
  "lessons_get": { table: "lessons", columns: "*" },
  "academy_lessons_get": { table: "academy_lessons", columns: "academy_id,lesson_id,sort_order" },
  "lesson_items_get": { table: "lesson_items", columns: "lesson_id" },
  "lesson_exercises_get": { table: "lesson_exercises", columns: "lesson_id,type" },
  "assessment_questions_list": { table: "assessment_questions", columns: "*" },
  "assessment_questions_get": { table: "assessment_questions", columns: "*" },
  "site_settings_list": { table: "site_settings", columns: "key,value" },
  "site_settings_get": { table: "site_settings", columns: "key,value" },
  "plan_pricing_list": { table: "plan_pricing", columns: "*" },
  "plan_pricing_get": { table: "plan_pricing", columns: "*" },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  // Origin check
  const origin = req.headers.get("origin") || "";
  if (origin && origin !== ALLOWED_ORIGIN) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  // CSRF check (double-submit)
  const csrfHeader = req.headers.get("x-pel-csrf");
  const csrfCookie = cookieValue(req, CSRF_COOKIE);
  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return json({ ok: false, error: "csrf_failed" }, 403);
  }

  // Read access token from cookie
  const accessToken = cookieValue(req, ACCESS_COOKIE);
  if (!accessToken) return json({ ok: false, error: "no_session" }, 401);

  const jwt = parseJwt(accessToken);
  if (!jwt) return json({ ok: false, error: "invalid_token" }, 401);

  // Check token expiry
  const now = Math.floor(Date.now() / 1000);
  if (jwt.exp && jwt.exp < now) {
    return json({ ok: false, error: "token_expired" }, 401);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad_body" }, 400); }

  const op = String(body.op || "");
  const payload = body.payload || {};

  const config = ALLOWLIST[op];
  if (!config) return json({ ok: false, error: "op_not_allowed" }, 403);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_URL, // placeholder, replaced below
    "Authorization": `Bearer ${accessToken}`,
  };

  // Use the anon key as apikey (needed for Supabase REST API access)
  // The user JWT in Authorization header enforces RLS.
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29vY2hlaHBpeWNvY3Zmd3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ3MzcsImV4cCI6MjA5OTY1MDczN30.sIWK6jwX7PW70fH0yPUuhOb25N1lBw2-Cvb3dtwDb9Y";
  headers["apikey"] = ANON_KEY;

  try {
    if (config.type === "rpc") {
      // Call Supabase RPC
      const rpcName = op;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${rpcName}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return json({ ok: false, error: data.error || data.message || "rpc_failed" }, res.status);
      return json({ ok: true, data });
    }

    if (config.type === "table_select") {
      const tc = TABLE_CONFIG[op];
      if (!tc) return json({ ok: false, error: "table_config_missing" }, 500);

      let url = `${SUPABASE_URL}/rest/v1/${tc.table}?select=${tc.columns || "*"}`;

      // Apply filters from payload
      if (payload.eq) {
        for (const [col, val] of Object.entries(payload.eq)) {
          url += `&${col}=eq.${encodeURIComponent(String(val))}`;
        }
      }
      if (payload.in) {
        for (const [col, vals] of Object.entries(payload.in)) {
          if (Array.isArray(vals)) {
            url += `&${col}=in.(${vals.map(v => encodeURIComponent(String(v))).join(',')})`;
          }
        }
      }
      if (payload.order) {
        url += `&order=${payload.order}`;
      }
      if (payload.limit) {
        url += `&limit=${payload.limit}`;
      }

      const res = await fetch(url, { method: "GET", headers });
      const data = await res.json();
      if (!res.ok) return json({ ok: false, error: data.error || data.message || "select_failed" }, res.status);
      return json({ ok: true, data });
    }

    if (config.type === "table_upsert") {
      const tc = TABLE_CONFIG[op];
      if (!tc) return json({ ok: false, error: "table_config_missing" }, 500);

      let url = `${SUPABASE_URL}/rest/v1/${tc.table}`;
      const upsertHeaders: Record<string, string> = { ...headers, "Prefer": `resolution=merge-duplicates,return=representation` };
      if (tc.conflict) {
        url += `?on_conflict=${tc.conflict}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: upsertHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return json({ ok: false, error: data.error || data.message || "upsert_failed" }, res.status);
      return json({ ok: true, data });
    }

    if (config.type === "table_insert") {
      const tc = TABLE_CONFIG[op];
      if (!tc) return json({ ok: false, error: "table_config_missing" }, 500);

      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tc.table}`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=representation" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return json({ ok: false, error: data.error || data.message || "insert_failed" }, res.status);
      return json({ ok: true, data });
    }

    return json({ ok: false, error: "unknown_op_type" }, 500);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
