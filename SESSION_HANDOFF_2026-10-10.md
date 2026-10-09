# Session Handoff — 2026-10-10 (CORS allowlist for Cloudflare Workers move)

## Context

Owner moved the site to Cloudflare Workers: production origin is now
`https://pel.personalizedenglishlessons.workers.dev` (in addition to the
GitHub Pages origin). Student reported:

```
Access to fetch at 'https://lewoochehpiycocvfwtz.supabase.co/functions/v1/rate-limited-login'
from origin 'https://pel.personalizedenglishlessons.workers.dev' has been blocked
by CORS policy: Response to preflight request doesn't pass access control check:
The 'Access-Control-Allow-Origin' header has a value
'https://personalizedenglishlessons.github.io' that is not equal to the supplied origin.
```

## Root cause

Four Supabase Edge Functions hard-coded
`Access-Control-Allow-Origin: https://personalizedenglishlessons.github.io`:

1. `supabase/functions/rate-limited-login/index.ts`
2. `supabase/functions/transcribe/index.ts`
3. `supabase/functions/pel-auth/index.ts`
4. `supabase/functions/pel-api/index.ts`

When the site loaded from `pel.personalizedenglishlessons.workers.dev`,
the preflight response only reflected the github.io origin, so the browser
rejected every fetch.

## Fix (commit `8d2fc5d`, pushed to main)

Each of the 4 functions now defines:

```ts
const ALLOWED_ORIGINS = [
  "https://personalizedenglishlessons.github.io",
  "https://pel.personalizedenglishlessons.workers.dev",
];
function allowedOrigin(req: Request): string {
  const o = req.headers.get("origin") || "";
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
}
```

- The value is only ever an allowlisted string (never reflects arbitrary
  origins — same protection as before).
- `pel-auth` and `pel-api` origin_not_allowed checks now allow any
  allowlisted origin, not just the github.io one.
- `json`/`jsonResp` helpers take an optional `req`; when omitted they
  fall back to the first allowlisted origin so CORS headers are always
  present.
- `rate-limited-login` had two pre-existing type-cleanliness bugs
  (`req` not in scope in `jsonResp`) — fixed with proper `Request` types.

## Deployment

Deployed all 4 functions live via the Supabase CLI with the management
token provided by owner (NOT stored in any file):

- `transcribe` → v6 (verify_jwt=true preserved, matches original)
- `rate-limited-login` → v5 (verify_jwt=false)
- `pel-auth` → v4 (verify_jwt=false)
- `pel-api` → v5 (verify_jwt=false)

Verified live with `curl -X OPTIONS` and `curl -X POST` from both
`https://pel.personalizedenglishlessons.workers.dev` and
`https://personalizedenglishlessons.github.io`:

```
access-control-allow-origin: https://pel.personalizedenglishlessons.workers.dev
access-control-allow-origin: https://personalizedenglishlessons.github.io
```

Both origins echo correctly. `POST` with wrong credentials returns
`{"error":"auth_failed"}` with 401 and correct CORS headers — flow
end-to-end works.

## Notes for next session

- Cloudflare Workers domain: `pel.personalizedenglishlessons.workers.dev`
- Do not hard-code the origin in `index.html`, `admin.html`, `app.html`,
  or `lib/*.js` — always allowlist both domains.
- `CNAME` in the repo root still points to the GitHub Pages domain; check
  whether Cloudflare DNS is needed for the workers.dev domain.
- `transcribe`'s CORS allowlist had to be added while preserving the
  original `verify_jwt=true` setting.

## Addendum

The `sbp_...` Supabase management token was used only in chat, never
written to files/commits/logs (per the rule in earlier handoffs).
