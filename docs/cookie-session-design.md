# httpOnly Cookie Session Architecture Design

## Problem
Currently, Supabase session tokens (access_token, refresh_token) are stored in
the browser's localStorage via the Supabase JS SDK. Any JavaScript running on
the page (including third-party scripts, browser extensions, or XSS payloads)
can read these tokens. If stolen, the tokens allow direct impersonation of the
student against the Supabase API.

## Solution
Move session tokens into `HttpOnly; Secure` cookies that JavaScript cannot
read. Route all authenticated database operations through Edge Functions that
read the cookies server-side.

## Architecture

### Two Edge Functions

#### 1. `pel-auth` (authentication: login, session, refresh, logout)
- `POST /functions/v2/pel-auth` with `{ action: "login", email, password }`
  → authenticates via Supabase Auth API server-side
  → sets `sb-access-token` and `sb-refresh-token` as HttpOnly cookies
  → returns `{ user, expiresAt }` (no tokens)
- `POST /functions/v2/pel-auth` with `{ action: "session" }`
  → reads cookies, verifies/refreshes session
  → returns `{ user, expiresAt }` or `{ user: null }`
- `POST /functions/v2/pel-auth` with `{ action: "logout" }`
  → clears cookies
  → returns `{ ok: true }`

#### 2. `pel-api` (allowlisted RPC proxy)
- `POST /functions/v2/pel-api` with `{ op, payload }`
  → reads session from cookies
  → validates against allowlist of operation names
  → calls Supabase REST API server-side with the user's JWT
  → returns the result to the frontend

### Cookie Settings
- `HttpOnly` - JavaScript cannot read
- `Secure` - HTTPS only
- `SameSite=None` - cross-origin (GitHub Pages → Supabase)
- `Path=/functions/v2` - scoped to Edge Functions path
- `Max-Age=3600` for access token (1 hour)
- `Max-Age=604800` for refresh token (7 days)

### CORS
- `Access-Control-Allow-Origin: https://personalizedenglishlessons.github.io`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Headers: content-type, x-pel-csrf`
- Frontend uses `fetch(url, { credentials: "include" })`

### CSRF Protection
- All mutation requests must include `x-pel-csrf` header
- The header value is a random token set by `pel-auth/login` as a readable
  (non-HttpOnly) cookie, and the Edge Function validates it matches
- GET requests (session check) don't need CSRF

## Frontend Migration Plan

### Phase 1: Auth layer
- Add `pelAuth(action, data)` helper in `lib/pel_config.js`
- Migrate `login.html` to use `pel-auth` instead of direct Supabase auth
- Migrate `app.html` session check to use `pel-auth/session`
- Migrate logout to use `pel-auth/logout`

### Phase 2: Student RPC calls
- Add `pelApi(op, payload)` helper
- Migrate all student-facing RPC calls in `app.html`:
  - student_curriculum, student_plan_status, student_effective_state
  - student_switch_academy, student_touch, complete_activity
  - student_announcements, student_my_classes, student_live_class_overview
  - student_mark_announcement_read, student_save_plan_draft
  - student_get_learning_state, student_save_assessment
  - issue_certificate, request_live_class, mark_welcome_seen

### Phase 3: Direct table reads/writes
- Migrate `student_data`, `student_state`, `pel_student_feedback_events`
  reads/writes through `pel-api`
- Migrate `pel_srs_state` sync in `lib/pel_lesson_stage.js`

### Phase 4: Admin panel
- Migrate all admin RPC calls and direct table reads through `pel-api`
- Admin uses the same cookie session (role checked server-side)

### Phase 5: Cleanup
- Remove Supabase JS client from pages (or keep with `persistSession: false`
  for anon-only reads like `verify_certificate`)
- Remove localStorage session storage
- Update CSP `connect-src` to only allow Edge Function URLs

## Cross-Origin Cookie Limitation
GitHub Pages and Supabase are different domains. Third-party cookies with
`SameSite=None` may be blocked by some browsers (Safari ITP, Firefox private
mode). If this becomes an issue, the long-term fix is to serve the app from
the same domain as the API (custom domain or reverse proxy).

## Allowlist (pel-api operations)
Student operations:
- student_curriculum, student_plan_status, student_effective_state
- student_switch_academy, student_touch, complete_activity
- student_announcements, student_my_classes, student_live_class_overview
- student_mark_announcement_read, student_save_plan_draft
- student_get_learning_state, student_save_assessment
- issue_certificate, request_live_class, mark_welcome_seen
- student_data_get, student_data_set, student_state_get, student_state_set
- pel_srs_state_get, pel_srs_state_set
- pel_student_feedback_event_insert

Admin operations (require admin/teacher role):
- admin_overview, admin_add_intervention, admin_add_student_note
- admin_upsert_student_profile, admin_add_learning_snapshot
- admin_save_group, admin_set_group_teacher, admin_create_live_class
- admin_create_program, admin_upsert_plan_pricing, admin_upsert_site_setting
- admin_toggle_assessment_question, admin_delete_assessment_question
- admin_save_assessment_question, admin_upsert_site_settings_batch
- certificates_list, programs_list, groups_list, academies_list
- lessons_list, assessment_questions_list, site_settings_list
- plan_pricing_list
