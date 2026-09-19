# PEL — Fresh Audit & Smoke Test Report

**Date:** September 20, 2026
**Auditor:** Perplexity Computer
**Repository:** `personalizedenglishlessons/tutorfiraspel`
**Supabase Project:** `lewoochehpiycocvfwtz` (ap-northeast-1 / Tokyo)
**Deployed at:** https://personalizedenglishlessons.github.io/tutorfiraspel/
**Commit at audit:** `1c71a77` → fixed to `51b6ee9`

---

## Executive Summary

Fresh audit of the PEL (Personalized English Lessons) codebase. All 44 automated tests pass, all JS syntax checks pass, RLS is enabled on all 51 database tables, both edge functions are active, and the student test account works. However, I found one **critical bug** (syntax error breaking the landing page), several **security gaps** (missing CSP on 4 pages, unpinned CDN dependency, missing SRI), and infrastructure issues (transcribe function CORS not deployed).

**Fixes applied in this session:** 6 issues fixed and pushed to `main` (commit `51b6ee9`).

---

## Issues Found & Fixed (This Session)

### CRITICAL — Syntax Error Breaking Landing Page (FIXED)

**File:** `index.html`, line 1757
**Severity:** CRITICAL
**Status:** FIXED (commit `51b6ee9`)

The string `'...we'll help you choose.'` used an unescaped apostrophe (char code 39) inside a single-quoted JavaScript string. This caused a `SyntaxError` that prevented the entire 655-line IIFE from executing, which disabled:
- Theme toggle (light/dark mode)
- Language toggle (EN/AR button)
- FAQ rendering
- Bilingual content updates for the pricing section and footer

**Browser-verified:** Theme toggle button clicked → `data-theme` attribute remained `null` (handler never attached). Language toggle "EN" button present but non-functional.

**Fix:** Changed `we'll` to `we&rsquo;ll` (HTML entity, renders identically but doesn't break JS string).

### HIGH — Missing CSP on 4 HTML Pages (FIXED)

**Files:** `index.html`, `verify.html`, `admin.html`, `legal.html`
**Severity:** HIGH
**Status:** FIXED (commit `51b6ee9`)

Only `app.html` and `login.html` had CSP meta tags. The other 4 pages had no Content-Security-Policy, leaving them vulnerable to potential XSS and data injection.

**Fix:** Added appropriate CSP meta tags to all 4 pages, scoped to each page's actual resource requirements:
- `index.html`: self + Google Fonts only (no external scripts)
- `verify.html`: self + jsDelivr + Supabase connect
- `admin.html`: self + unpkg + jsDelivr + Supabase connect
- `legal.html`: self + Google Fonts only

### HIGH — Unpinned CDN Dependency in admin.html (FIXED)

**File:** `admin.html`, line 13
**Severity:** HIGH
**Status:** FIXED (commit `51b6ee9`)

`admin.html` loaded `lucide@latest` from unpkg.com — an unpinned version that could change at any time, making SRI impossible and introducing supply-chain risk.

**Fix:** Pinned to `lucide@1.34.0` (matching `app.html`) with SRI integrity hash.

### MEDIUM — Missing SRI on CDN Scripts (FIXED)

**Files:** `verify.html` (supabase-js), `admin.html` (supabase-js + lucide)
**Severity:** MEDIUM
**Status:** FIXED (commit `51b6ee9`)

CDN scripts in `verify.html` and `admin.html` lacked Subresource Integrity (SRI) hashes, meaning a compromised CDN could inject malicious code. Also, both used `@2` (unpinned) instead of `@2.50.0`.

**Fix:** Pinned to `@2.50.0` and added SRI integrity hashes (matching `app.html` and `login.html`).

### LOW — Python `__pycache__` Committed to Repo (FIXED)

**File:** `tools/__pycache__/batch_vocab_data.cpython-314.pyc`
**Severity:** LOW
**Status:** FIXED (commit `51b6ee9`)

Compiled Python bytecode was committed to the repository. Added `__pycache__/` and `*.pyc` to `.gitignore` and removed the file from git tracking.

---

## Issues Found — Pending Action

### HIGH — Transcribe Function CORS Not Deployed

**Severity:** HIGH
**Status:** PENDING (requires user authorization to deploy)

The `transcribe` edge function source code (`supabase/functions/transcribe/index.ts`) was updated in commit `d9ea275` to restrict CORS to `https://personalizedenglishlessons.github.io`, but the **deployed function (v2) still returns `Access-Control-Allow-Origin: *`**.

**Verification:** `curl -X OPTIONS` to the live function returns `access-control-allow-origin: *`.

**Impact:** Any website can call the transcribe function, potentially abusing the OpenAI Whisper API key.

**Fix needed:** Redeploy the transcribe function with the updated source code. This requires Supabase Management API access to deploy.

### MEDIUM — Security Headers Not Enforced on GitHub Pages

**Severity:** MEDIUM
**Status:** PARTIALLY MITIGATED

GitHub Pages ignores the `_headers` file, so HSTS, X-Frame-Options, and X-Content-Type-Options are not served. CSP is now enforced via meta tags on all pages (fixed this session), but HSTS and X-Frame-Options cannot be set via meta tags.

**Fix:** Either migrate hosting to Cloudflare Pages/Netlify (which respect `_headers`), or accept the limitation. The `_headers` file is already prepared for migration.

### MEDIUM — Supabase Project in Tokyo (ap-northeast-1)

**Severity:** MEDIUM
**Status:** UNCHANGED

The Supabase project is in Tokyo, while users are in Saudi Arabia (Jeddah). This adds ~200-300ms latency per database query.

**Fix:** Migrate to a closer region (UAE `me-central-1` or Mumbai `ap-south-1`). Requires creating a new Supabase project and migrating data.

### MEDIUM — Monolithic `app.html` (20,986 lines / 1.4 MB)

**Severity:** MEDIUM
**Status:** UNCHANGED

The entire SPA logic is in a single `app.html` file with 333 function definitions. Hard to maintain, difficult to review, slow to load.

**Fix:** Continue extracting logic into separate ES modules under `lib/` (the pattern already exists with `pel_lesson_stage.js`, `pel_dashboard_life.js`, etc.).

### LOW — Documentation Outdated

**Severity:** LOW
**Status:** UNCHANGED

- `supabase/schema-notes.md` documents ~15 tables, but the database has 51 tables
- `README.md` folder structure is outdated (doesn't mention `admin.html`, `tools/`, `supabase/functions/`)
- `SECURITY.md` says "50 tables" (now 51) and says rate-limited-login is "not live-deployed" (it IS deployed, v4)
- `AUDIT_REPORT.md` says `auth_attempts` table is empty (it now has data from rate-limited-login)

### LOW — No `robots.txt` or `sitemap.xml`

**Severity:** LOW
**Status:** UNCHANGED

No `robots.txt` or `sitemap.xml` for SEO. Consider adding both for better search engine indexing.

---

## What Works (Verified This Session)

### Tests & Syntax
- All 44 tests pass (13 build-sequence + 31 teaching-flow)
- All `lib/*.js`, `admin/*.js`, `tests/*.js` pass `node --check`
- All inline `<script>` blocks in all 6 HTML files pass `node --check` (after fix)
- No zero-byte files
- No stale root-level `src=` references

### Database Security
- **RLS enabled on ALL 51 tables** (up from 50 in previous audit)
- All INSERT policies have ownership checks (`auth.uid() = user_id`), except `auth_attempts` which intentionally allows `anon` INSERT for login attempt logging
- `has_permission()` function properly checks `role_permissions` joined with `user_roles`
- `can_access_pel()` checks admin role OR active subscription
- Audit logging via `audit_action()` RPC

### Edge Functions
| Function | Status | Version | CORS |
|----------|--------|---------|------|
| `transcribe` | ACTIVE | v2 | `*` (source updated, not deployed) |
| `rate-limited-login` | ACTIVE | v4 | Restricted to GitHub Pages origin |

### Auth & Application
- Login works with test account (`testmail1@gmail.com` / `namas123`)
- Rate-limited-login function returns valid session
- Student has real progress: 12 completed lessons, 417 remaining
- SRS (spaced repetition) data present and functional
- Admin console properly gates access (session → role RPC → block non-admin)

### Code Hygiene
- No service-role keys or management tokens in source code
- No `eval()` in shipped code
- No `document.write()` in shipped code (only in admin certificate print window)
- No `console.log` in shipped code (only `console.warn` in error handlers)
- SRI (integrity + crossorigin) on all CDN scripts (after fix)
- All 6 HTML pages have CSP meta tags (after fix)

### Deployment
- All 6 pages return HTTP 200 on GitHub Pages
- Site renders correctly (landing page, app, login, admin, verify, legal)

---

## Summary of Recommendations (Priority Order)

1. **Redeploy the `transcribe` edge function** with the updated source code (CORS restriction) — requires Management API deploy
2. **Migrate Supabase** to a closer region (UAE or Mumbai) for Saudi users
3. **Update documentation** — `schema-notes.md`, `README.md`, `SECURITY.md`, `AUDIT_REPORT.md` are all outdated
4. **Add `robots.txt` and `sitemap.xml`** for SEO
5. **Long-term: modularize `app.html`** — extract the 333 functions into separate modules
6. **Consider migrating hosting** from GitHub Pages to Cloudflare Pages for HSTS/X-Frame-Options enforcement
