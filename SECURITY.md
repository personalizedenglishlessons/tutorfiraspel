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
| 3 | Rate limit login | MANAGED + LIMIT | Supabase Auth has built-in rate limiting on sign-in / OTP / signup endpoints. Custom per-IP limiting needs an Edge Function (remediation: add a Supabase Edge Function in front of auth). |
| 4 | Bot protection | DONE (client) + LIMIT | Honeypot field on the login form (silently rejected if filled). Supabase Auth blocks disposable-email/abuse patterns. Server-side bot detection needs an Edge Function. |
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
| 18 | Security headers | LIMIT | GitHub Pages does not allow custom response headers (CSP, HSTS, X-Frame-Options). Remediation: put Cloudflare in front, or move hosting to a platform that sets headers. |
| 19 | Force HTTPS | DONE | GitHub Pages enforces HTTPS by default (Enforce HTTPS is on for the custom domain). |
| 20 | Scan dependencies | DONE (review) | No package.json build deps (static site). CDN libraries (Supabase JS, Lucide) are loaded from official CDNs. Review and pin versions when adding new libs. |

## Summary
- 14 of 20 controls are DONE or MANAGED in the current static + Supabase setup.
- 6 are LIMIT items that need a server component (Edge Function or Cloudflare in
  front of GitHub Pages) to fully satisfy. The single highest-impact next step is
  adding a Supabase Edge Function for auth, which would unblock items 3, 8, 9 and
  part of 4.

## Remediation backlog (if moving off pure static hosting)
1. Add a Supabase Edge Function that wraps sign-in and sets an httpOnly session
   cookie (covers 3, 8, 9, and strengthens 4).
2. Serve through Cloudflare to inject CSP / HSTS / X-Frame-Options headers (18).
3. If uploads are added, use a Supabase Storage bucket with a strict policy (15).
