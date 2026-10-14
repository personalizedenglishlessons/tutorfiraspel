# Pending migrations (read this first, next agent)

Status as of 2026-10-14 11:35 +03, after live reconciliation against DB
`lewoochehpiycocvfwtz`. Read the caveats below — this is not a "clean" state.

## Current state (narrowly accurate)

```bash
SUPABASE_ACCESS_TOKEN=sbp_... python3 tools/check_migrations.py
# OK: all 111 repo migrations recorded in tracker.
```

The checker matches numeric versions only. It does **not** track files without
a numeric prefix (e.g. `auth_rate_limit.sql`) and does **not** prove a script
actually ran — it only shows tracker rows exist. Do not read "all 111 recorded"
as "all 111 verified applied".

### What was verified vs. applied this session (2026-10-14)

**Applied live:** `202610140001_login_card_site_settings.sql`.
The `site_settings_public_read` policy's `qual` in the live DB now contains
`OR (key ~~ 'lc\_%')`. Tracker row inserted.
No `lc_*` rows exist yet (verified via privileged + anon query — both return 0),
so there is no functional end-to-end read to test. Admin > Billing edits will
create the rows; then verify anon REST returns them.

**Already applied (spot-checked, not fully verified) but recorded in tracker:**
`202610070001` … `202610070007`. Each was written by a previous sandbox that
could not reach Supabase, so it ran them directly via Management API without
inserting tracker rows. Verified effects (read-only):

- `student_route()` returns the strict-CEFR definition with default `a0`
- `a0ss-alphabet` items are rebuilt (idx 0..2 = A/B/C, Saudi `حرف A:…` text)
- Letter X item has `example_en = 'X is for x-ray.'`
- 0 `translate` exercises with `payload->>'dir' = 'false'` or IS NULL
- `the-alphabet` renamed to 'Airport Check-in: Spelling Your Name'
- `spell-digraph-th` has 8 exercises (was 3) — other lessons in `005` NOT checked
- Exercise `id=309` prompt is Saudi `تكتبها` (no Iraqi `تهجي`)
- Letter A `translit = 'ايه'` (not the ambiguous `اي`)
- `auth_attempts` table exists, has 1 row, RLS `auth_attempts_insert` policy,
  `anon`/`authenticated` granted INSERT/TRUNCATE (per the file's design)

These are spot checks, not a full postcondition sweep. Do not re-run them
blindly; if you suspect a missed statement, write a NEW forward migration.

## Known unresolved issues (do NOT blindly "fix")

1. **`auth_rate_limit.sql` is invisible to the checker.** Its regex
   (`r'(\d+)_([\w.]+)\.sql$'`) requires a numeric prefix, so this file is never
   compared or recorded. It's applied (table + policy + grants verified above)
   but has no tracker row. If you want it tracked, either rename the file to
   `000000000001_auth_rate_limit.sql` (breaking change, needs commit) or add a
   manual tracker row — decide with the owner, do not do it silently.

2. **Duplicate version `202610070004`.** Two files share this version:
   `202610070004_db_data_quality_fixes.sql` and
   `202610070004_db_quality_batch_fix.sql`. Only `db_quality_batch_fix` is in
   the tracker; `db_data_quality_fixes` is applied live but not tracked. Also
   duplicates exist at `202610030001`, `202610030002`, `202610030003`,
   `202610110001`. A future `supabase db push --linked --dry-run` may error
   or skip these. **Do not rename historical files or insert duplicate
   tracker rows to "clean this up" without owner approval** — verify with
   `supabase --workdir <repo> db push --linked --dry-run` first.

3. **Oct-13 migrations (`202610130001`, `202610130002`) are in the tracker**
   but were applied by the previous session — not re-verified here.
   Do NOT re-run `wipe_activity_tracking`.

## How to apply future migrations

1. Owner provides a Supabase personal access token (`sbp_...`). Do not paste it
   into chat, files, commits, or logs — use a secure credential form. If it
   was already exposed in chat, rotate it in the Supabase dashboard first.
2. Check the API is reachable:
   `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SUPABASE_PAT" https://api.supabase.com/v1/projects`
3. Apply each file, in dependency order:
   `SUPABASE_PAT=sbp_... python3 tools/sql.py "$(cat supabase/migrations/<file>.sql)"`
4. Verify the change is live with a read-only query (RLS: `select policyname, qual from pg_policies where tablename='<table>'`).
5. Record in the tracker so a later `supabase db push` doesn't re-run it:
   `MODE=record SUPABASE_ACCESS_TOKEN=sbp_... python3 tools/check_migrations.py`
   ⚠️ `MODE=record` blindly inserts rows for EVERY untracked repo file.
   Verify each file's SQL effect is actually live FIRST, or you will mark
   unapplied files as applied. (This exact mistake was made once on
   `202610140001` and had to be undone.)
6. Update this file and commit promptly.

## Fallback without the API

Open Supabase dashboard > SQL Editor for project `lewoochehpiycocvfwtz`,
paste each file in order, run it.
