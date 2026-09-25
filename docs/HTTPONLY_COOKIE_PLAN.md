# Session Security: httpOnly Cookie Migration Plan

## Status: Legacy auth is the safe default; cookie auth is progressive enhancement

The current auth flow stores Supabase session tokens (access_token + refresh_token)
in `localStorage` via `supabase.auth.setSession()`. This is the standard approach
for static sites but exposes tokens to JavaScript-based XSS attacks.

### Current safe state

- **`PEL_COOKIE_AUTH` defaults to `false`** — all users use legacy
  localStorage auth by default.
- **Cookie auth is opt-in only** — requires `pel_cookie_test=1` in
  localStorage or `?cookie_auth=1` URL parameter.
- **Third-party cookie verification** — after `pelAuth('login')` returns a
  user, the code immediately calls `pelAuth('session')` to verify the cookies
  were actually stored. If the browser blocked the `Set-Cookie` headers
  (Safari ITP, Firefox private mode), the session check returns no user and
  the login falls through to the legacy rate-limited-login path.
- **All `pelRpc`/`pelTableSelect`/`pelTableUpsert` wrappers** fall back to
  the Supabase JS client when `PEL_COOKIE_AUTH` is false.
- **Periodic session checks** (every 5 min) in app.html and admin.js detect
  cookie expiry and fall back to legacy auth.

## Why httpOnly cookies can't be safely added on the current architecture

### Cross-site cookie problem
The app is hosted on `personalizedenglishlessons.github.io` (GitHub Pages) and
the Supabase project is at `lewoochehpiycocvfwtz.supabase.co`. These are
**different sites** (different registrable domains).

For cookies to be sent cross-site, they require:
- `SameSite=None; Secure` (allows third-party cookies)
- `credentials: "include"` on every `fetch()` call
- `Access-Control-Allow-Credentials: true` + exact CORS origin on the server
- The browser must **not** be blocking third-party cookies

**Third-party cookie blocking** is now default in Safari (ITP), Firefox, and
is being progressively restricted in Chrome. A `SameSite=None` cookie set by
`supabase.co` would be silently dropped by these browsers, breaking login.

### Partial cookie mirror is worse than no cookies
Setting httpOnly cookies alongside localStorage tokens does **not** improve
security: XSS can still read tokens from localStorage. It creates a false
sense of security without eliminating the attack surface.

## What a full fix requires (deferred — not safe on GitHub Pages)

A real httpOnly solution means JavaScript **never** receives `access_token` or
`refresh_token`. All Supabase Data API calls must go through a server-side
proxy that reads httpOnly cookies and injects the Authorization header.

### Why the full migration is blocked

The app is hosted on `personalizedenglishlessons.github.io` (GitHub Pages) and
the Supabase project is at `lewoochehpiycocvfwtz.supabase.co`. These are
**different sites** (different registrable domains). A full httpOnly cookie
migration requires same-site hosting — it cannot be safely completed on GitHub
Pages because third-party cookies are being progressively blocked by all
major browsers (Safari ITP, Firefox Total Cookie Protection, Chrome Privacy
Sandbox). Forcing the migration now would break login in these browsers.

### Migration path
1. **Move to a same-site setup**: Deploy the app on a custom domain with a
   backend (e.g., Cloudflare Pages with Functions, Vercel with API routes,
   or a small Node/Deno server). The app and the auth proxy must be on the
   same registrable domain (e.g., `app.pel.com` + `api.pel.com` as subdomains
   with `SameSite=Lax` cookies).

2. **Create a BFF (Backend-for-Frontend) proxy**: All `supabase.from()`,
   `supabase.rpc()`, and `supabase.auth` calls are routed through the proxy.
   The proxy reads httpOnly cookies, refreshes tokens if needed, and forwards
   the request to the Supabase API with the Authorization header.

3. **Rewrite client data access**: Replace direct `supabase.from(...)` calls
   with proxy calls. Affected files:
   - `app.html`: `student_data`, `student_state`, `pel_srs_state`,
     `pel_student_feedback_events`, `words`
   - `admin/admin.js`: `academies`, `lessons`, `academy_lessons`,
     `lesson_items`, `lesson_exercises`, `groups`, `programs`, `plan_pricing`,
     `site_settings`, `assessment_questions`, `certificates`
   - `lib/pel_lesson_stage.js`: `student_data`, `pel_srs_state`
   - `login.html`: `rate-limited-login` Edge Function (already server-side)

4. **Handle token refresh server-side**: The proxy must detect expired
   access_tokens, use the refresh_token cookie to get a new session, update
   the cookies, and retry the original request.

5. **Update Edge Functions**: `transcribe` and `rate-limited-login` currently
   receive tokens in the request body or read them from the client. These
   must be updated to read tokens from cookies (if same-site) or from the
   proxy's forwarded headers.

## Current mitigations (already in place)

While the full migration is pending, the following measures reduce XSS risk:

1. **Content Security Policy (CSP)**: Strict CSP on all pages blocks
   inline scripts (except approved hashes), external script sources, and
   `connect-src` is restricted to the Supabase domain. See `_headers` file.

2. **Rate-limited login**: The `rate-limited-login` Edge Function enforces
   per-IP rate limiting (5 attempts per 15 minutes) and logs all attempts.

3. **RLS on all tables**: Row-Level Security ensures students can only
   access their own data, even if a token is compromised.

4. **No service-role key in client**: The app uses only the anon key + the
   student's session. The service-role key is never exposed.

5. **Honeypot on login**: A hidden honeypot field catches bot submissions.

## Recommendation

**Short-term (current):** Legacy localStorage auth with strict CSP, RLS, and
rate-limited login. Cookie auth is available as progressive enhancement with
third-party cookie verification — if cookies are blocked, the app automatically
falls back to legacy auth. **This is the safe state for GitHub Pages.**

**Medium-term:** When moving to a custom domain (e.g., for the Abha phase
or IELTS expansion), implement the BFF proxy pattern described above.
Same-site cookies (`SameSite=Lax`) will work without third-party cookie
blocking, and the full httpOnly migration becomes safe to complete.

**Long-term:** Consider migrating to Supabase SSR auth (`@supabase/ssr`)
with a server-side rendering framework (Next.js, SvelteKit, etc.) for
native httpOnly cookie support.
