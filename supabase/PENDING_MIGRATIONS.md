# Pending migrations (read this first, next agent)

Status as of 2026-10-14 (updated 11:30 +03 after live reconciliation).

## Nothing is pending right now

All 111 repo migrations are recorded in the live tracker and applied:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... python3 tools/check_migrations.py
# OK: all 111 repo migrations recorded in tracker.
```

### What was fixed this session (2026-10-14)

1. The 8 untracked Oct-7 migrations (`202610070001` … `202610070007`)
   plus `auth_rate_limit.sql` were verified applied live (via direct SQL in a
   previous sandbox) and recorded in `supabase_migrations.schema_migrations`.
   The duplicate `202610070004` version (two files) was reconciled — only
   `db_quality_batch_fix` was recorded; both files' effects were verified live.
2. `202610140001_login_card_site_settings.sql` was genuinely NOT applied
   (the `site_settings_public_read` RLS policy lacked the `lc\_%` clause).
   Applied live; policy now contains `OR (key ~~ 'lc\_%')`.
   Tracker row was inserted.
3. `202610130001_saudi_dialect_msa_cleanup.sql` and
   `202610130002_wipe_activity_tracking.sql` were already applied and
   recorded by the previous session.

## How to apply future migrations

1. The owner provides a Supabase personal access token (`sbp_...`) in chat. Never write it to any file, commit, log or memory. Pass it only as an environment variable for one command.
2. Check that the API is reachable: `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SUPABASE_PAT" https://api.supabase.com/v1/projects`. A code of 000 means the sandbox is blocked; stop and tell the owner to paste the file into the Supabase SQL Editor instead.
3. Apply each file, in the order above:
   `SUPABASE_PAT=sbp_... python3 tools/sql.py "$(cat supabase/migrations/<file>.sql)"`
4. Verify the change is live (for RLS: `select policyname, qual from pg_policies where tablename='<table>'`).
5. Record them in the tracker so a later `supabase db push` does not re-run them:
   `MODE=record SUPABASE_ACCESS_TOKEN=sbp_... python3 tools/check_migrations.py`
   (run without `MODE=record` first to see the differences).
   ⚠️ `MODE=record` blindly inserts rows for EVERY repo file not yet tracked —
   verify each one's SQL effect is actually live BEFORE running this, or you
   will mark unapplied files as applied.
6. Remove the applied rows from the table above and commit.

## Fallback without the API

Open Supabase dashboard > SQL Editor for project `lewoochehpiycocvfwtz`, paste each file in order, run it.
