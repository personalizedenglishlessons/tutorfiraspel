# NEXT STEPS — pick up here

## ✅ DONE (2026-09-10): SRS server sync + mastery-gated completion

1. **SRS server sync is LIVE** (commit `bc3a1a2`): `srsRecord()` now stamps
   `r.ts` and fire-and-forget upserts each answer to `pel_srs_state`
   (onConflict `user_id,en`); `srsSync()` (exported on the factory API) pulls
   ALL rows for the user (limit 2000), merges last-write-wins by
   `ts`/`updated_at`, then pushes the merged map back up in 200-row batches
   (idempotent — creates local-only rows server-side). app.html injects
   `supabase()`/`userId()` into the stage deps and calls
   `window.PEL_STAGE_API.srsSync()` in `revealApp()` right after
   `loadStudentState()`. Signed-out play stays purely local (guards hold in
   tests). Legacy local rows without `ts` LOSE to the server on first sync —
   deliberate first-sync behavior.
2. **Mastery-gated completion** (commits `ba16665` + fixup, audit item 5
   closed): with >= 3 production activities, >= 60% FIRST-ATTEMPT correct
   (`prodFirstOk`) is required to complete. `mark()` keeps eventual-correct
   counters (`prodOk`/`recOk`) for the done-screen display only — retry
   successes deliberately do NOT feed the gate, or re-clicking until green
   would void it. Gated lessons get an "Almost there" screen — Practice
   again (fresh state via Stage.open, first attempts count anew) or Back to
   path; no XP / markLessonComplete / server progression when gated.

---

## ✅ DONE (2026-09-08): "translit leaks the answers" — see git commit "fix: stop leaking answers"

Rule now enforced app-wide: **no secondary-language clue inside any graded
option before the student answers**; translit/Arabic appear in teaching screens,
explicit hints, or the post-check reveal only. Shipped:

1. `recognize`: options show the Arabic meaning ONLY; after Check, the correct
   button reveals "word · transliteration".
2. `identify_heard`: English-only options; Arabic meaning revealed on the
   correct option after Check.
3. `choose_natural_expression`: no subtitles during selection; the correct
   option gains its Arabic/translit subtitle in the reveal.
4. `db_correct` ("Fix the mistake" in app.html): removed the literal ✕ that was
   printed on the WRONG option before answering (worst leak found).
5. Translit FAB deleted entirely (CSS + drag/toggle IIFE + pel-translit-hidden
   rule; orphaned localStorage keys left alone). Deliberately kept: learn/concept
   translits (teaching), fill_blank on-demand hint, dbx option translits (both
   options show theirs — doesn't reveal which is right), vocab reference lists.

---

Last updated: 2026-09-10 (after `bc3a1a2` SRS server sync, `ba16665` mastery-gated
completion; earlier: `81944a5` refactor, `be21987`+`4a070e4` missing-elements,
`70e2b7c` answer-leak fixes, `90af3db` CEFR view crash + CSP cleanup, `ba65868`
Live Classes client bridge).

NOTE on `90af3db`: the CEFR path view had been broken since it was written —
renderCefrPath called ar()/esc() that only existed inside the old dashboard/stage
IIFEs (never in its scope) and its L() resolved to a vocab builder. Fixed with local
helpers inside the function. If another view renderer ever throws 'X is not defined',
check which script block it lives in (block A = app.html lines ~1490-19387) and whether
the helper is actually in that block's top-level scope — the stage/dash factories'
helpers do NOT leak.

NOTE on `ba65868`: the Live Classes module could never see the shared supabase
client (scoped inside the main app IIFE). It now uses window.pelSupabaseClient
(bridged from inside the main IIFE right after client()). Any NEW satellite module
must go through window.pelSupabaseClient — never `typeof client`, and never
create a second GoTrueClient. Related known gap: ACADEMY_CEFR maps five a0-*
academy ids that were never added to ACADEMIES, so the A0 level on the Levels
(A0-C2) view shows 'Content for this level is coming' until those lessons exist.
Read this + `AUDIT_REPORT.md` first. Run `node tests/test_buildsequence_iam.js` before
and after any stage change — it loads the REAL `lib/pel_lesson_stage.js`.

## What just shipped (2026-09-08 session)

1. **Single source of truth refactor** — `app.html` no longer contains the stage
   engine. It loads `lib/pel_lesson_stage.js` + `lib/pel_dashboard_life.js` as
   dependency-injected factories (`PEL_STAGE_FACTORY(deps)` / `PEL_DASH_LIFE_FACTORY(deps)`),
   and `lib/pel_curriculum_path.js` (self-wiring). All app-only fixes were ported
   into the lib first, so nothing was lost. **Edit the lib, never paste engine code
   back into app.html.**
2. **Audit "missing elements" — all closed** in `lib/pel_lesson_stage.js`:
   - Spaced repetition (SM-2-lite): `srsRecord()` / `srsDueList()`, localStorage
     key `pel_srs_v1`. The `review` activity resurfaces due items from previous
     lessons (most overdue first) and feeds answers back into the schedule.
   - `listening_dictation` activity: hear a sentence, type it; scored by word
     similarity (>= 0.75 passes). Picks the best real sentence (item sentences,
     then dialogue lines — never a bare word).
   - `guided_production` activity: Arabic meaning + English sentence with the key
     word blanked + small word bank. Sits between controlled practice and
     `free_response`.
   - Recognition vs production: every activity is tagged `mode`, tracked once per
     activity in `mark()`, and reported on the done screen
     (Recognition X/Y · Production X/Y).
3. **Supabase**: migration `202609080001_pel_srs_state.sql` applied LIVE — table
   `pel_srs_state` (+4 RLS policies + due index) is ready for server-side SRS sync.

## Next, in priority order

1. **Browser QA** of the newer activities AND the two 2026-09-10 features (the
   integration test proves sequencing, not rendering): run
   `python3 -m http.server 8080`, open a lesson, check `listening_dictation`
   (TTS auto-plays, Enter submits), `guided_production` (blanking regex on
   real sentences), the done-screen Recognition/Production line, plus:
   (a) answer enough production items wrong (< 60%) and confirm the "Almost
   there" gate appears, Practice again re-runs fresh, Back to path exits;
   (b) log in on a second browser profile and confirm due SRS items follow
   the account (check `pel_srs_state` rows exist after a lesson).
   Follow `tests/smoke-checklist.md`.
2. **Admin analytics**: surface Recognition-vs-Production per student (data
   tracked per lesson in stage state; server-side persistence would go in
   `pel_student_feedback_events`-style rows or `learning_snapshots`). NOTE:
   the mastery gate means completion itself now signals >= 60% production —
   per-activity detail is still only local until this is built.
3. **Content**: `tools/audit-lessons.js` still reports 1 generic-fallback lesson
   (`tools/audit-report.txt`); the transliteration/phase content pipelines
   (`tools/translit_phase*`, `tools/phase4_ielts`, `tools/phase5_abha`) suggest a
   phase 6 was planned — check with Tutor Firas what content comes next.
4. **A0 gap**: ACADEMY_CEFR maps five a0-* academy ids that were never added to
   ACADEMIES, so the A0 level on the Levels (A0-C2) view shows 'Content for
   this level is coming' until those lessons exist.

## Environment notes (for the next session)

- GitHub: clone with `gh repo clone tutorfiraspel repo`; **pushing needs the
  session's GitHub credential injection on the push command** — plain
  `git push` without it fails with 'could not read Username'. GitHub Pages
  serves main automatically. Verify with:
  `gh api repos/personalizedenglishlessons/tutorfiraspel/pages --jq .status`
- Supabase: full postgres access via `python3 tools/sql.py "SQL"` (needs
  `SUPABASE_PAT` env var; project ref `lewoochehpiycocvfwtz`). The user
  supplies the PAT per session on request — NEVER commit it anywhere (repo
  is public). `pel_srs_state` exists and is live (0 rows as of 2026-09-10,
  RLS own-rows, granted to authenticated).
- Tests: `node tests/test_buildsequence_iam.js` (13 checks, loads the real
  factory + real DB fixture `tests/fixtures_iam_sentences.json`).
- Syntax gate (smoke checklist): `node --check` every `lib/*.js` + all inline
  `<script>` blocks in `app.html` (3 blocks, extract with the python regex in
  the 2026-09-10 session or equivalent).
- Session workflow (user's standing instruction): commit + push EVERY finished
  piece immediately, and update this file + commit it as a breadcrumb so the
  next session can pick up. Conventional breadcrumb commit:
  `docs: NEXT_STEPS breadcrumb for <feature> (<sha>)`.
- Usage is tight: batch reads, no redundant calls, no brute-force retries.
