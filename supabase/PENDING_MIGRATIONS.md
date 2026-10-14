# Pending migrations (read this first, next agent)

Status as of 2026-10-14. These files are committed in `supabase/migrations/` but were NOT applied to the live database, because the sandbox that wrote them cannot reach `api.supabase.com` or `*.supabase.co`.

| Order | File | What it does | Risk |
|---|---|---|---|
| 1 | `202610130001_saudi_dialect_msa_cleanup.sql` | Rewrites DB text (FAQs, hero copy) to Saudi dialect and removes banned words | Updates rows only |
| 2 | `202610140001_login_card_site_settings.sql` | Lets anon read `lc_*` site_settings keys (login card texts edited in Admin > Billing) | Policy swap, idempotent |
| 3 | `202610130002_wipe_activity_tracking.sql` | Wipes activity tracking data | DESTRUCTIVE. Ask the owner before running |

Until #2 is applied, edits to the login card texts in Admin save fine but visitors do not see them (the page falls back to built-in text). Prices and WhatsApp number already work.

## How to apply (when the network allows api.supabase.com)

1. The owner provides a Supabase personal access token (`sbp_...`) in chat. Never write it to any file, commit, log or memory. Pass it only as an environment variable for one command.
2. Check that the API is reachable: `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SUPABASE_PAT" https://api.supabase.com/v1/projects`. A code of 000 means the sandbox is blocked; stop and tell the owner to paste the file into the Supabase SQL Editor instead.
3. Apply each file, in the order above:
   `SUPABASE_PAT=sbp_... python3 tools/sql.py "$(cat supabase/migrations/<file>.sql)"`
4. Verify the change is live (for #2: `select policyname from pg_policies where tablename='site_settings'` and confirm the policy text contains `lc\_%`).
5. Record them in the tracker so a later `supabase db push` does not re-run them:
   `MODE=record SUPABASE_ACCESS_TOKEN=sbp_... python3 tools/check_migrations.py`
   (run without `MODE=record` first to see the differences).
6. Remove the applied rows from the table above and commit.

## Fallback without the API
Open Supabase dashboard > SQL Editor for project `lewoochehpiycocvfwtz`, paste each file in order, run it.
