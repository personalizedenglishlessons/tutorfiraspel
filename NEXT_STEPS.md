# NEXT STEPS — pick up here

## ✅ DONE (2026-09-12): iPad/tablet/mobile responsive fix (`53a8557`)

Systematic cross-device fix across all 6 pages (app, index, admin,
login, verify, admin.css). The iPad screen was glitchy because of
10 separate issues, all now fixed:

1. **100vh → 100dvh** (with fallback) on sidebar, app-shell,
   context-panel, workspace-shell, auth-shell, admin modal — iOS/iPadOS
   address bar was cutting off content.
2. **-webkit-backdrop-filter** added to ALL backdrop-filter declarations
   (app.html had 7 missing, admin.css 3, login 2, verify 1) — blur now
   renders on Safari/iPad.
3. **-webkit-tap-highlight-color: transparent** — removes gray tap flash.
4. **touch-action: manipulation** — kills 300ms double-tap zoom delay.
5. **overscroll-behavior** — prevents scroll chaining in modals/sidebar.
6. **-webkit-overflow-scrolling: touch** — momentum scrolling on iOS.
7. **viewport-fit=cover** — safe-area inset support for notch devices.
8. **@media(hover:none) blocks** — neutralizes transform-based hover
   effects stuck after tap (the main visual glitch on iPad).
9. **height:100% → min-height:100%** — prevents viewport clipping.
10. **overflow-wrap:anywhere** on workspace-center — prevents text overflow.

Tests: all 12 lib/*.js pass `node --check`, both app.html inline blocks
pass, `test_buildsequence_iam.js` 13/13 PASS.

---

## ✅ DONE (2026-09-10, later session): QA + A0 fix + fallback removal + analytics + e2e

All four items from the previous "Next, in priority order" list are DONE and
pushed. Commits: `d1c5d6e` (A0 academies), `fef45e4` (fallback removal),
`0deaa27` (analytics persist + surface), this breadcrumb commit (QA results).

1. **Browser QA complete** (happy path + gate): 20-activity lesson
   `a1pos-have-has` run end-to-end in a real browser — done screen showed
   "Recognition: 5/5 · Production: 10/10", SRS rows landed in `pel_srs_state`,
   completion recorded server-side. Gate verified on a second run with 5
   deliberate first-attempt production failures (prodFirst 4/10 < 0.6) →
   "Almost there" screen, no server completion, Practice again resets fresh.
   Cross-device SRS verified: cleared localStorage → reload → rows re-seeded
   from server.
2. **A0 gap fixed** (`d1c5d6e`): five a0-* academies added to the ACADEMIES
   const in app.html with DB-mirrored metadata (sentence-building, question
   words, spelling-sounds, error-clinic, social-english). A0 level on the
   Levels view now populates (43 active a0 lessons in DB).
3. **Generic-fallback lesson removed** (`fef45e4`): getLesson now returns null
   instead of fabricating a generic lesson; renderWorkspace shows a bilingual
   "Lesson not available" empty state; static ACADEMY_LESSONS a0 entries now
   list REAL DB lesson ids. `tools/audit-lessons.js` → 0 findings.
4. **Recognition-vs-Production analytics** (`0deaa27`): `lesson_progress` gained
   rec_ok/rec_total/prod_ok/prod_total/prod_first_ok; `complete_activity`
   accepts `p_stats` jsonb (latest stats win, score keeps best); stage
   renderDone passes real counters through markLessonComplete →
   rpc('complete_activity', {p_lesson_id, p_stats}); `admin_student_360`
   returns `lesson_stats` {totals, recent[12]}; admin Learning tab renders a
   "Recognition vs Production" card + recent lessons list (badge green ≥ 60%
   first-try). Migration file: `supabase/migrations/202609100001_lesson_progress_stats.sql`
   (also applied LIVE).
5. **E2E verified with real data**: browser completed A0 lesson
   `i-am-sentences` (rec 5/5 · prod 11/11 · first 11/11) and the EXACT stats
   landed in `lesson_progress` via the real client RPC; `admin_student_360`
   returns correct totals + recent rows. QA coverage in this session also
   completed have-to-obligation, a1tn-numbers-1-10, a1tn-telling-time,
   a1tn-days, a1tn-months, a1tn-money from the browser.

### Gotchas learned this session (READ BEFORE TESTING)

- **GitHub Pages CDN lag on lib/*.js**: `<script src="lib/...">` has no
  cache-buster and Pages sends max-age=600. During QA the browser kept the
  pre-analytics `pel_lesson_stage.js` for ~10 min after push, which made
  completions record with all-zero stats (old lib never passed p_stats).
  Symptom: rows land but rec/prod = 0/0. Fix for testing: hard-reload with
  cache disabled. Consider adding `?v=<sha>` busters to the lib script tags
  in a future commit.
- **PostgREST schema-cache window**: right after CREATE OR REPLACE FUNCTION,
  browser RPCs to that function may silently fail (supabase-js swallows the
  error; the completion promise resolves null). Waits itself out in a few
  minutes. Don't e2e-test an RPC immediately after replacing it.
- **markLessonComplete is an early-return no-op** if the lesson is already in
  the local completedLessons set (restored from server state) — during QA a
  re-run of a lesson the server already knew produced no RPC. Not a bug, but
  it looks like one.
- **QA-driver notes** (driver lives OUTSIDE the repo at the session workspace,
  `/home/user/workspace/qa_driver.js` — rewrite from this breadcrumb if lost):
  handles concept/learn, learn_sentence, listen, review, pronunciation,
  db_order/arrange_words, inputs, options, challenge, match (brute-force
  pairing via `#pelMatchEn/#pelMatchAr .pel-tile`), and quiz-format
  `choose_natural_expression` (match DOM options to `a.quiz[i].options`
  by `t+tr` text, pick `options[correct]`). Supabase-js does NOT go through
  window.fetch — patching it captures nothing; use CDP Network events
  (drain_events) to trace RPCs. Long runs exceed the CDP evaluate timeout —
  poll `PEL_LESSON_STAGE.state` instead of assuming a wedge.

### QA artifacts on the test account (intentional, known)

- Student `testmail1@gmail.com` (user id 1d68ead7-7ef4-407a-9138-a171fa693272)
  now has 9 lesson_progress rows; its route advanced to a1-time-numbers.
  Stats were repaired via SQL to match the real runs (5/5, 10/10, first 8 for
  have-to-obligation etc.). One earlier probe row (a1pos-my-your 1/1, 2/2)
  was a REST probe with dummy-but-plausible stats.
- `qa.agent@tutorfiraspel.test` was deleted (cascade) after QA.

---

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

1. **Content**: the transliteration/phase content pipelines
   (`tools/translit_phase*`, `tools/phase4_ielts`, `tools/phase5_abha`) suggest
   a phase 6 was planned — check with Tutor Firas what content comes next.
2. **Live Classes**: client bridge landed (`ba65868`) but end-to-end class
   scheduling/attendance flow is still unverified in a browser.

## ✅ DONE (2026-09-10): lib cache-busters (`c0d4642`)

All same-origin `<script src>` tags in app/index/admin/login/verify.html now
 carry `?v=<sha256[:8]>` of the file's content (admin/admin.js included; CDN
 and SRI-tagged scripts untouched). `tools/bust_lib_cache.py` is idempotent
 — **run `python3 tools/bust_lib_cache.py` before committing any lib/*.js
 change** and include the HTML diff in the same commit, or students keep the
 stale engine for up to 10 min (Pages max-age=600). Verified live: served
 app.html carries the ?v= tags and the busted stage URL returns the current
 code. Stray junk files accidentally committed with it were removed in
 `a390491`.

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
