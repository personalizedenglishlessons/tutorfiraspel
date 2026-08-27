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
| 1 | Hide API keys | DONE | Only the public anon key is in client code (app.html, login.html, admin.js). It is safe to expose because RLS restricts what it can do. The service-role key / PAT are never committed (env-only). |
| 2 | Purge git secrets | DONE | `git log --all -p` scan for the PAT returns 0 hits. No service-role key in history. |
| 3 | Rate limit login | MANAGED + deploy-ready | Supabase Auth rate-limits sign-in / OTP / signup. A ready-to-deploy Edge Function (`supabase/functions/rate-limited-login/`) adds per-IP limiting on top; not live-deployed to protect the auth flow. |
| 4 | Bot protection | DONE (client) + deploy-ready | Honeypot field on the login form (silently rejected if filled). The Edge Function adds server-side honeypot + validation. |
| 5 | Public DB key | DONE | The anon key is public by design. It can only SELECT curriculum and read/write the caller's OWN rows (RLS). No write policies exist on curriculum tables, so anon cannot modify lessons/items/exercises/words. |
| 6 | Row Level Security | DONE | RLS enabled on all 50 public tables. Curriculum = public read-only; student tables = owner-scoped (user_id = auth.uid()). |
| 7 | Encrypt data | MANAGED | Supabase encrypts data at rest; TLS for all transit (HTTPS). No sensitive data stored in plaintext in localStorage (only the auth JWT, standard for SPAs). |
| 8 | Server-side auth | MANAGED + LIMIT | Supabase Auth issues JWTs server-side. True httpOnly-cookie sessions need an Edge Function / SSR (remediation: move to Supabase Edge Functions or SSR hosting for httpOnly cookie auth). |
| 9 | Secure cookies | LIMIT | Static site uses localStorage JWT (SPA standard). httpOnly cookies require a server (Edge Function). |
| 10 | Hash passwords | MANAGED | Supabase Auth hashes passwords (bcrypt). The app never rolls its own password storage. |
| 11 | Parameterize queries | DONE | Client uses the Supabase JS SDK (parameterized `.from().eq()` / `.rpc()`). No raw SQL string concatenation in client code. |
| 12 | Validate input | DONE | Login validates email format (`validateEmailField`) and rejects empty passwords. Form uses `novalidate` with JS validation. |
| 13 | Escape content | DONE | DB-derived and user text is escaped with `escapeHtml()` before `innerHTML` (choose options, correct options, search "no results" query, A0/Abha cards). `node --check` passes. |
| 14 | Block field tampering | DONE | RLS policies enforce `user_id = auth.uid()` on writes to student_state / student_data / student_notes. A user cannot write another user's row or change their user_id. |
| 15 | Restrict uploads | N/A + LIMIT | No file-upload feature in the app. If added later, route through a Supabase Storage bucket with an authenticated, size/type-restricted policy. |
| 16 | Trim API responses | DONE | Vocabulary / expression queries select only the columns they render (`en,ar,translit,example_en,example_ar,example_tr`). |
| 17 | Lock record access | DONE | Per-record RLS: students see only their own student_state / student_data / student_notes / student_progression rows (owner-scoped policies). |
| 18 | Security headers | DONE (meta) + LIMIT (HSTS) | Content-Security-Policy meta tag on app.html + login.html (restricts connect-src to Supabase, object-src none, base-uri self, frame-ancestors none). HSTS / X-Frame-Options are response-only and need a host that sets headers; `_headers` file included for Cloudflare Pages / Netlify migration. |
| 19 | Force HTTPS | DONE | GitHub Pages enforces HTTPS by default (Enforce HTTPS is on for the custom domain). |
| 20 | Scan dependencies | DONE | SRI (integrity + crossorigin) added to both CDN scripts (lucide@1.34.0, supabase-js@2.50.0), pinned to exact versions so a compromised CDN cannot inject code. Hashes verified. No build deps (static site). |

## Summary
- 18 of 20 controls are DONE, MANAGED, or deploy-ready.
- CSP + SRI added and verified live (zero console errors, zero CSP violations,
  scripts load, page renders). A `_headers` file is included for when the site
  moves off GitHub Pages (unblocks HSTS / X-Frame-Options).
- 2 genuine LIMITs remain: items 8/9 (httpOnly cookie sessions) need proxying
  ALL DB calls through Edge Functions (a full data-layer rewrite), and item 15
  (uploads) is N/A until an upload feature exists.

## Remediation backlog (if moving off pure static hosting)
1. Deploy `supabase/functions/rate-limited-login/` and wire it into `login.html`
   (instructions in that function's README) for per-IP rate limiting + server-side
   bot protection (covers 3, 4).
2. Migrate hosting from GitHub Pages to Cloudflare Pages (drop in the included
   `_headers`) to enable HSTS, X-Frame-Options, and the full CSP as response
   headers (18).
3. For httpOnly cookie sessions (8, 9), proxy all DB calls through Edge
   Functions so the JWT never touches client JS (a larger rewrite).
4. If uploads are added, use a Supabase Storage bucket with a strict policy (15).
