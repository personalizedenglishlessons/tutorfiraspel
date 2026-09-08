# NEXT STEPS — pick up here

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

Last updated: 2026-09-08 (after commits `81944a5` refactor, `be21987`+`4a070e4` missing-elements,
`70e2b7c` answer-leak fixes, `90af3db` CEFR view crash + CSP cleanup).

NOTE on `90af3db`: the CEFR path view had been broken since it was written —
renderCefrPath called ar()/esc() that only existed inside the old dashboard/stage
IIFEs (never in its scope) and its L() resolved to a vocab builder. Fixed with local
helpers inside the function. If another view renderer ever throws 'X is not defined',
check which script block it lives in (block A = app.html lines ~1490-19387) and whether
the helper is actually in that block's top-level scope — the stage/dash factories'
helpers do NOT leak.
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

1. **Wire SRS server sync** (the only half-done piece): push `srsRecord()` updates
   to `pel_srs_state` and seed `srsDueList()` from it on login (Supabase client is
   already available in app.html; pattern: same as `pel_student_feedback_events`
   writes). Local-first stays the fallback.
2. **Browser QA** of the new activities (the integration test proves sequencing,
   not rendering): run `python3 -m http.server 8080`, open a lesson, check
   `listening_dictation` (TTS auto-plays, Enter submits), `guided_production`
   (blanking regex on real sentences), and the done-screen Recognition/Production
   line. Follow `tests/smoke-checklist.md`.
3. **Mastery-gated completion** (audit item 5, still open): `markLessonComplete`
   fires on activity completion with no mastery check. The rec/prod stats now
   exist on stage state — gate completion on e.g. Production >= 60%.
4. **Admin analytics**: surface Recognition-vs-Production per student (data now
   tracked per lesson; server-side persistence would go in
   `pel_student_feedback_events`-style rows or `learning_snapshots`).
5. **Content**: `tools/audit-lessons.js` still reports 1 generic-fallback lesson
   (`tools/audit-report.txt`); the transliteration/phase content pipelines
   (`tools/translit_phase*`, `tools/phase4_ielts`, `tools/phase5_abha`) suggest a
   phase 6 was planned — check with Tutor Firas what content comes next.

## Environment notes (for the next session)

- GitHub: push via `git push` (credential proxy already configured); GitHub Pages
  serves main automatically. Verify with:
  `gh api repos/personalizedenglishlessons/tutorfiraspel/pages --jq .status`
- Supabase: full postgres access via `python3 tools/sql.py "SQL"` (needs
  `SUPABASE_PAT` env var; project ref `lewoochehpiycocvfwtz`).
- Tests: `node tests/test_buildsequence_iam.js` (13 checks, loads the real
  factory + real DB fixture `tests/fixtures_iam_sentences.json`).
- Syntax gate (smoke checklist): `node --check` every `lib/*.js` + all inline
  `<script>` blocks in `app.html`.
