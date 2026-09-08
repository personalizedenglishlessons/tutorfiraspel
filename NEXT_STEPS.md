# NEXT STEPS — pick up here

Last updated: 2026-09-08 (after commits `81944a5` refactor + this session's features).
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
