# Security Hardening Matrix

App: PEL (Personalized English Lessons), static GitHub Pages front end + Supabase backend.
Static-site constraint: there is no application server we control, so anything that
requires a server (rate limiting, httpOnly cookies, security headers, server-side
bot detection) cannot be done in repo code alone. Those are marked LIMIT and paired
with the realistic remediation.

## Status legend
- DONE: implemented and verified in this repo / Supabase config.
- MANAGED: handled by Supabase (verified, not in repo code).
- LIMIT: cannot be done on static GitHub Pages; remediation noted.

| # | Control | Status | Detail |
|---|---------|--------|--------|
| 1 | Hide API keys | DONE | Only the public anon key is in client code (centralized in `lib/pel_config.js`, referenced via `window.PEL_CONFIG`). It is safe to expose because RLS restricts what it can do. The service-role key / access token are never committed (env-only). |
| 2 | Purge git secrets | DONE | `git log --all -p` scan for the PAT returns 0 hits. No service-role key in history. |
| 3 | Rate limit login | DONE | The `rate-limited-login` Edge Function (v4) is deployed and wired into `login.html`. It provides per-IP rate limiting (5 attempts per 15 minutes), honeypot bot detection, and email/password validation. Uses the `check_auth_rate_limit()` security-definer RPC for safe counting. `auth_attempts` table has INSERT policy for `anon` role. |
| 4 | Bot protection | DONE | Honeypot field on the login form (silently rejected if filled). The deployed Edge Function adds server-side honeypot + validation. |
| 5 | Public DB key | DONE | The anon key is public by design. It can only SELECT curriculum and read/write the caller's OWN rows (RLS). No write policies exist on curriculum tables, so anon cannot modify lessons/items/exercises/words. |
| 6 | Row Level Security | DONE | RLS enabled on all 51 public tables. Curriculum = public read-only; student tables = owner-scoped (`auth.uid() = user_id`). All INSERT policies have ownership checks, except `auth_attempts` which intentionally allows `anon` INSERT for login attempt logging. |
| 7 | Encrypt data | MANAGED | Supabase encrypts data at rest; TLS for all transit (HTTPS). No sensitive data stored in plaintext in localStorage (only the auth JWT, standard for SPAs). |
| 8 | Server-side auth | MANAGED + LIMIT | Supabase Auth issues JWTs server-side. True httpOnly-cookie sessions need an Edge Function / SSR (remediation: move to Supabase Edge Functions or SSR hosting for httpOnly cookie auth). |
| 9 | Secure cookies | LIMIT | Static site uses localStorage JWT (SPA standard). httpOnly cookies require a server (Edge Function). |
| 10 | Hash passwords | MANAGED | Supabase Auth hashes passwords (bcrypt). The app never rolls its own password storage. |
| 11 | Parameterize queries | DONE | Client uses the Supabase JS SDK (parameterized `.from().eq()` / `.rpc()`). No raw SQL string concatenation in client code. |
| 12 | Validate input | DONE | Login validates email format (`validateEmailField`) and rejects empty passwords. Form uses `novalidate` with JS validation. |
| 13 | Escape content | DONE | DB-derived and user text is escaped with `escapeHtml()` before `innerHTML` (choose options, correct options, search "no results" query, A0/Abha cards). `node --check` passes. |
| 14 | Block field tampering | DONE | RLS policies enforce `user_id = auth.uid()` on writes to student_state / student_data / student_notes / subscriptions / certificates / pel_srs_state / student_learning_state / learning_snapshots / learning_timeline / pel_student_feedback_events / teacher_profiles. A user cannot write another user's row or change their user_id. |
| 15 | Restrict uploads | N/A + LIMIT | No file-upload feature in the app. If added later, route through a Supabase Storage bucket with an authenticated, size/type-restricted policy. |
| 16 | Trim API responses | DONE | Vocabulary / expression queries select only the columns they render (`en,ar,translit,example_en,example_ar,example_tr`). |
| 17 | Lock record access | DONE | Per-record RLS: students see only their own student_state / student_data / student_notes / student_progression rows (owner-scoped policies). |
| 18 | Security headers | DONE (meta) + LIMIT (HSTS) | Content-Security-Policy meta tag on ALL 6 HTML pages (app.html, login.html, index.html, admin.html, verify.html, legal.html), each scoped to its actual resource requirements. `frame-ancestors` removed from meta CSP (ignored by browsers in `<meta>` — causes console errors); clickjacking protection relies on `X-Frame-Options: DENY` + `frame-ancestors 'none'` in the `_headers` file for Cloudflare/Netlify migration. HSTS is response-only and needs a host that sets headers. |
| 19 | Force HTTPS | DONE | GitHub Pages enforces HTTPS by default (Enforce HTTPS is on for the custom domain). |
| 20 | Scan dependencies | DONE | SRI (integrity + crossorigin) added to ALL CDN scripts (lucide@1.34.0, supabase-js@2.50.0), pinned to exact versions so a compromised CDN cannot inject code. Hashes verified. No build deps (static site). |
| 21 | CORS on Edge Functions | DONE | Both deployed Edge Functions (`transcribe` v2, `rate-limited-login` v4) restrict CORS to `https://personalizedenglishlessons.github.io`. No wildcard origins. |

## Summary
- 19 of 21 controls are DONE or MANAGED.
- CSP (meta tags on all 6 pages) + SRI (on all CDN scripts) + CORS restriction (on both Edge Functions) verified live.
- 2 genuine LIMITs remain: items 8/9 (httpOnly cookie sessions) need proxying
  ALL DB calls through Edge Functions (a full data-layer rewrite), and item 15
  (uploads) is N/A until an upload feature exists.
- A `_headers` file is included for when the site moves off GitHub Pages (unblocks
  HSTS / X-Frame-Options).

## Remediation backlog (if moving off pure static hosting)
1. Migrate hosting from GitHub Pages to Cloudflare Pages (drop in the included
   `_headers`) to enable HSTS, X-Frame-Options, and the full CSP as response
   headers (18).
2. For httpOnly cookie sessions (8, 9), proxy all DB calls through Edge
   Functions so the JWT never touches client JS (a larger rewrite).
3. If uploads are added, use a Supabase Storage bucket with a strict policy (15).
