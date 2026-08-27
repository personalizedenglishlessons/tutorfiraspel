# Rate-Limited Login (Edge Function)

A Supabase Edge Function that wraps `auth.signInWithPassword` with per-IP
rate limiting, input validation, and a honeypot check. Implements security
items 3 (rate limit login) and 4 (bot protection, server-side).

## Why it's not live yet
The live frontend still calls `supabase.auth.signInWithPassword` directly.
Supabase already rate-limits auth endpoints and blocks abuse, so this
function is defense-in-depth, not a gap. It's provided ready-to-deploy so you
can enable it during a maintenance window without risking the live auth flow.

## Deploy
1. Apply the table migration (SQL editor or `supabase db push`):
   `supabase/migrations/auth_rate_limit.sql`
2. Set secrets (Dashboard > Edge Functions > Secrets):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy the function:
   ```bash
   supabase functions deploy rate-limited-login
   ```
   (or Dashboard > Edge Functions > Deploy from the `supabase/functions/rate-limited-login/` folder)

## Wire it into the frontend
In `login.html`, replace the direct sign-in call in the submit handler:

Before:
```js
const { data, error } = await client.auth.signInWithPassword({ email, password });
```
After:
```js
const fn = `${SUPABASE_URL}/functions/v1/rate-limited-login`;
const res = await fetch(fn, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email, password, hp: '' }), // hp = honeypot, keep empty
});
const j = await res.json();
const error = j.error ? new Error(j.error) : null;
const data = j.session ? { session: j.session } : null;
if (!error && data?.session) await client.auth.setSession(data.session);
```

Keep the honeypot field already in the form (`#loginWebsite`); send its value
as `hp` so bots are silently rejected server-side.

## Limits this closes
- 3 rate limit login (custom per-IP, on top of Supabase's built-in)
- 4 bot protection (server-side honeypot + validation)
- 8 / 9 server-side auth + secure cookies: this function returns the session
  to the SPA (stored in localStorage for RLS). Full httpOnly-cookie sessions
  still require proxying all DB calls through Edge Functions (a larger rewrite).
