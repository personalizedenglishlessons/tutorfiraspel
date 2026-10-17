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

### Pending, authored 2026-10-17 (NOT applied, NOT pushed, awaiting owner review)

- `202610170001_fill_word_examples.sql`: fills 337 missing word example sentences from sentences already in the same lesson. Idempotent (only rows with null example_en).

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

2. **Duplicate versions — CONFIRMED via dry-run (2026-10-14).**
   `supabase db push --linked --dry-run` reports:
   ```
   Skipping migration auth_rate_limit.sql... (file name must match pattern "<timestamp>_name.sql")
   Found local migration files to be inserted before the last migration on remote database.
   Rerun the command with --include-all flag to apply these migrations:
     supabase/migrations/202610030001_update_plan_pricing.sql
     supabase/migrations/202610030002_fix_v_sound_transliteration_in_exercises.sql
     supabase/migrations/202610030003_record_v_sound_transliteration_sql.sql
     supabase/migrations/202610070004_db_quality_batch_fix.sql
     supabase/migrations/202610110001_fix_p_translit_pen_reference.sql
   ```
   These 5 files are applied live but only one file per duplicate version is
   in the tracker. Running `db push --include-all` would re-run them.
   Two files share version `202610070004`
   (`db_data_quality_fixes` + `db_quality_batch_fix`) — only
   `db_quality_batch_fix` is tracked; the other is applied but untracked.
   Same for `202610030001/2/3` and `202610110001`.
   **Do not rename historical files, insert duplicate tracker rows, or run
   `--include-all` without owner approval.** Prefer `tools/check_migrations.py`
   + `tools/sql.py` for future migrations until this is cleaned up.

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
