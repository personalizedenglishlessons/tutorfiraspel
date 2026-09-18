# PEL — Comprehensive Audit Report

**Date:** September 18, 2026
**Auditor:** Perplexity Computer
**Repository:** `personalizedenglishlessons/tutorfiraspel`
**Supabase Project:** `lewoochehpiycocvfwtz` (ap-northeast-1 / Tokyo)
**Deployed at:** https://personalizedenglishlessons.github.io/tutorfiraspel/

---

## Executive Summary

PEL (Personalized English Lessons) is a Supabase-backed static web app for learning American English with Arabic (Saudi dialect) support. The codebase is functional — all 44 tests pass, the test student account works, and the site is deployed on GitHub Pages. The architecture is sound: RLS is enabled on all 50 tables, admin operations use a `has_permission()` function, and the auth flow is standard Supabase Auth.

However, there are several security gaps, maintainability concerns, and inconsistencies that should be addressed. The most critical issues are: (1) no server-side login rate limiting, (2) several INSERT RLS policies with no ownership checks, (3) a 20,941-line monolithic `app.html`, and (4) the Supabase project is in Tokyo (high latency for Saudi users).

---

## What Works (Strengths)

### Tests & Syntax
- All 44 tests pass (13 build-sequence + 31 teaching-flow)
- All `lib/*.js`, `admin/*.js`, and `tests/*.js` files pass `node --check`
- All inline `<script>` blocks in HTML files are syntactically valid (the `index.html` "failures" are JSON-LD structured data blocks, not JavaScript — false positive)
- No zero-byte files in the repository

### Database Security
- **RLS enabled on ALL 50 tables** — no table is unprotected
- Admin write policies use `has_permission()` function — properly checks `role_permissions` joined with `user_roles`
- Student data scoped to `auth.uid() = user_id` with subscription checks via `can_access_pel()`
- `has_permission()` function is well-designed: checks `role_permissions` joined with `user_roles` for the current `auth.uid()`
- `can_access_pel()` checks admin role OR active subscription (not suspended/cancelled, within date range)
- Admin console has dual-layer security: client-side role gate + database RLS
- Audit logging via `audit_action()` RPC for admin mutations

### Auth & Application
- Login works with test account (`testmail1@gmail.com` / `namas123`)
- Student has real progress: 12 completed lessons, 417 remaining, on STEP exam prep track
- SRS (spaced repetition) data is present and functional
- Auth flow uses standard Supabase `signInWithPassword` with session management
- Admin console properly gates access: checks session → fetches role via RPC → blocks non-admin/teacher users
- `onAuthStateChange` handler redirects to login on sign-out

### Code Hygiene
- No service-role keys or management tokens in source code
- No `eval()` in shipped code (only in dev tools)
- No `document.write()` in shipped code (only in admin certificate print window)
- Most `innerHTML` uses use `escapeHtml()` for user-provided content
- Security headers configured in `_headers` file (CSP, HSTS, X-Frame-Options, etc.)
- `.gitignore` properly excludes `.supabase/` local state

### Edge Functions
- `transcribe` function (v1) — deployed and active, provides Whisper-based speech-to-text
- `tutor-ai` function (v11) — deployed and active, AI tutor functionality
- `rate-limited-login` — source code exists but NOT deployed

---

## Issues Found

### CRITICAL — Security

#### 1. No Server-Side Login Rate Limiting
- **Severity:** CRITICAL
- **Details:** The `rate-limited-login` edge function exists in `supabase/functions/rate-limited-login/index.ts` but is NOT deployed. The `auth_attempts` table has zero records. Login goes directly through Supabase Auth's `signInWithPassword` with no brute-force protection.
- **Impact:** An attacker can brute-force student passwords with no rate limit. The function code is complete (5 attempts per IP per 15 minutes, honeypot check, email validation) but was never wired into the live frontend.
- **Fix:** Deploy the `rate-limited-login` function and update `login.html` to call it instead of `client.auth.signInWithPassword()` directly.

#### 2. INSERT RLS Policies With No Ownership Check
- **Severity:** HIGH
- **Details:** Several tables have INSERT policies with `None` as the `qual` (no restriction), meaning any authenticated user can insert rows for ANY user_id:
  - `certificates` — any authenticated user can issue certificates
  - `pel_student_feedback_events` — any user can insert feedback for any other user (contradicts schema-notes.md which claims `auth.uid() = user_id`)
  - `pel_srs_state` — any user can insert SRS state for any user (UPDATE/DELETE are properly scoped, but INSERT is not)
  - `student_learning_state` — any user can insert learning state for any user
  - `student_notes` — any user can insert notes (DELETE requires admin)
  - `subscriptions` — any user can create subscriptions
  - `teacher_profiles` — any user can create teacher profiles
  - `learning_snapshots` — any user can insert snapshots
  - `learning_timeline` — any user can insert timeline entries
- **Impact:** A malicious authenticated user could insert fraudulent data (fake certificates, fake progress, fake subscriptions) for other users.
- **Fix:** Add `auth.uid() = user_id` (or equivalent) to all INSERT policies. For tables without a `user_id` column, add appropriate checks.

### HIGH — Security

#### 3. CORS Wildcard on Edge Functions
- **Severity:** HIGH
- **Details:** Both `transcribe` and `rate-limited-login` functions use `Access-Control-Allow-Origin: *`. The `transcribe` function is deployed and active — anyone can call it from any origin.
- **Impact:** If `OPENAI_API_KEY` is set, anyone can abuse the transcription endpoint to run Whisper API calls at the project's expense.
- **Fix:** Restrict CORS to the GitHub Pages origin: `https://personalizedenglishlessons.github.io`

#### 4. Security Headers Not Enforced on GitHub Pages
- **Severity:** MEDIUM
- **Details:** The `_headers` file is configured for Cloudflare Pages / Netlify, but GitHub Pages ignores `_headers`. The CSP, HSTS, X-Frame-Options, and other security headers are NOT being served.
- **Impact:** No CSP enforcement, no clickjacking protection, no HSTS on the live site.
- **Fix:** Either migrate hosting to Cloudflare Pages/Netlify, or add a `<meta http-equiv="Content-Security-Policy">` tag to each HTML page (note: meta tags cannot enforce HSTS or X-Frame-Options).

### MEDIUM — Code Quality

#### 5. Anon Key Duplicated in 5 Files
- **Severity:** MEDIUM
- **Details:** The Supabase anon key is hardcoded in 5 files instead of being centralized:
  - `lib/pel_config.js` (canonical location)
  - `verify.html` (line 278)
  - `login.html` (line 602)
  - `lib/pel-settings.js` (line 20)
  - `lib/pel-assessment.js` (line 31)
- `app.html` and `admin/admin.js` correctly use `window.PEL_CONFIG`.
- **Impact:** If the anon key needs to be rotated, 5 files must be updated. Risk of inconsistency.
- **Fix:** Update `verify.html`, `login.html`, `pel-settings.js`, and `pel-assessment.js` to use `window.PEL_CONFIG.SUPABASE_URL` and `window.PEL_CONFIG.SUPABASE_ANON_KEY`.

#### 6. Monolithic `app.html` (20,941 lines / 1.4 MB)
- **Severity:** MEDIUM
- **Details:** `app.html` contains 333 function definitions and 21 console statements. The entire SPA logic is in a single file.
- **Impact:** Hard to maintain, difficult to review changes, slow to load, no code splitting.
- **Fix:** Extract logic into separate ES modules under `lib/`. The codebase already has `lib/pel_lesson_stage.js`, `lib/pel_dashboard_life.js`, etc. — continue this pattern.

#### 7. 21 Console Statements in Production
- **Severity:** LOW
- **Details:** `app.html` contains 21 `console.log/error/warn/debug` statements.
- **Impact:** Minor performance impact, potential information leakage in browser console.
- **Fix:** Remove or gate behind a `DEBUG` flag.

#### 8. Schema Documentation Outdated
- **Severity:** LOW
- **Details:** `supabase/schema-notes.md` documents ~15 tables, but the database has 50 tables. Missing tables include: `academy_tags`, `announcement_recipients`, `announcements`, `assessment_questions`, `attendance`, `auth_attempts`, `credit_ledger`, `group_members`, `group_waitlist`, `learning_timeline`, `lesson_progress`, `permissions`, `plan_history`, `plan_pricing`, `profiles`, `recommendations`, `role_permissions`, `roles`, `student_activity_events`, `student_learning_state`, `student_presence`, `student_progression`, `subscriptions`, `teacher_overrides`, `teacher_profiles`, `track_academies`, `tracks`, `user_roles`, `words`.
- **Impact:** Developers have an incomplete picture of the database schema.
- **Fix:** Update `schema-notes.md` with all 50 tables.

#### 9. README Folder Structure Outdated
- **Severity:** LOW
- **Details:** README.md references `e2e_sw.js` at root (it's in `lib/`), doesn't mention `admin.html`, `tools/`, or the `supabase/functions/` directory.
- **Fix:** Update README.md to match actual repository structure.

### MEDIUM — Infrastructure

#### 10. Supabase Project in Tokyo (ap-northeast-1)
- **Severity:** MEDIUM
- **Details:** The Supabase project is in `ap-northeast-1` (Tokyo). Users are in Saudi Arabia (Jeddah, Mecca Region).
- **Impact:** Network latency of ~200-300ms per database query from Saudi Arabia. The app makes multiple Supabase queries per page load, compounding latency.
- **Fix:** Migrate to a closer region (e.g., `ap-south-1` Mumbai or `me-central-1` UAE). Note: Supabase region migration requires creating a new project and migrating data.

#### 11. `tutor-ai` Edge Function — RESOLVED
- **Severity:** RESOLVED
- **Details:** The `tutor-ai` edge function (v11) was deployed but completely orphaned: not called anywhere in the app code, referenced 3 non-existent tables (`student_plans`, `tutor_usage`, `learning_history`), required a `GROQ_API_KEY` (paid third-party API), and had no source in the repo.
- **Action taken:** Deleted the function from Supabase. Source code archived in `supabase/functions/tutor-ai/index.ts` with a header explaining why it was removed. The app's built-in teaching content (Saudi Mistake Coach, Teaching Content, Pronunciation Hints, Grammar Rules, SRS) provides a complete, free, unlimited learning experience.
- **Status:** DONE

#### 12. No Migration Tool Tracking
- **Severity:** LOW
- **Details:** SQL migrations are stored as files in `supabase/migrations/` but there's no tracking of which migrations have been applied (no `supabase_migrations` table or Supabase CLI tracking).
- **Impact:** Risk of applying migrations twice or missing migrations when setting up a new environment.
- **Fix:** Use the Supabase CLI (`supabase migration list`) to track applied migrations.

---

## Smoke Test Results

### Automated Checks
| Check | Result |
|-------|--------|
| `node --check` on all `lib/*.js` | PASS (13 files) |
| `node --check` on `admin/admin.js` | PASS |
| `node --check` on `tests/*.js` | PASS (2 files) |
| Inline scripts in HTML | PASS (false positives in index.html are JSON-LD) |
| Zero-byte files | None found |
| Stale root-level `src=` references | None found |
| All local `src`/`href` targets resolve | PASS (7 "missing" are JS template literals, not file refs) |
| Service-role key in source | Not found |
| Management token in source | Not found |
| `eval()` in shipped code | Not found (only in dev tools) |
| `document.write()` in shipped code | Not found (only in admin print window) |

### Test Suite
| Suite | Result |
|-------|--------|
| `test_buildsequence_iam.js` | ALL PASS (13 tests) |
| `test_teaching_flow.js` | ALL PASS (31 tests) |
| **Total** | **44/44 PASS** |

### Student Account Test
| Check | Result |
|-------|--------|
| Login (testmail1@gmail.com / namas123) | SUCCESS |
| User ID | `1d68ead7-7ef4-407a-9138-a171fa693272` |
| Student data exists | Yes (plan snapshot, completion dates, study days, review queue, account prefs, stage position) |
| Completed lessons | 12 |
| Remaining lessons | 417 |
| Current track | STEP exam prep (step-pack2-04, activity 8) |
| SRS review queue | 2 items (overdue) |
| Language preference | English-first |

### Database
| Check | Result |
|-------|--------|
| Total tables | 50 |
| RLS enabled | All 50 tables |
| Tables with INSERT policies lacking ownership check | 9 |
| Triggers | 5 (updated_at, site_settings, tracks, words, student_state) |
| `has_permission()` function | Properly implemented |
| `can_access_pel()` function | Properly implemented (checks admin OR active subscription) |
| `auth_attempts` table | Empty (rate-limited-login not deployed) |

### Edge Functions
| Function | Status | Source in Repo |
|----------|--------|---------------|
| `transcribe` | ACTIVE (v1) | Yes |
| `tutor-ai` | DELETED (2026-09-18) | Archived in repo |
| `rate-limited-login` | NOT DEPLOYED | Yes |

### Deployment
| Check | Result |
|-------|--------|
| GitHub Pages | Built and accessible at https://personalizedenglishlessons.github.io/tutorfiraspel/ |
| `index.html` | HTTP 200 |
| `app.html` | HTTP 200 |
| Security headers | NOT served (GitHub Pages ignores `_headers`) |
| HSTS | Not enforced |
| CSP | Not enforced |

---

## Summary of Recommendations (Priority Order)

1. **Deploy the `rate-limited-login` edge function** and wire it into `login.html` — this is the most critical security gap
2. **Fix INSERT RLS policies** — add `auth.uid() = user_id` to all 9 tables with unrestricted INSERT
3. **Restrict CORS** on the `transcribe` edge function to the GitHub Pages origin
4. **Commit the `tutor-ai` function source** to the repository
5. **Centralize the anon key** — update `verify.html`, `login.html`, `pel-settings.js`, and `pel-assessment.js` to use `PEL_CONFIG`
6. **Consider migrating Supabase** to a closer region (UAE or Mumbai) for Saudi users
7. **Remove console statements** from production code
8. **Update documentation** — `schema-notes.md` and `README.md` are outdated
9. **Long-term: modularize `app.html`** — extract the 333 functions into separate modules
