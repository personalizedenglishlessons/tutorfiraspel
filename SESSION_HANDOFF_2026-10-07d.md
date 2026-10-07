# Session Handoff — 2026-10-07d (Alphabet Lesson Rebuild + DB Quality)

## Context

Owner noticed A0 students were seeing non-A0 content (First Words, Greetings)
and grammar terms (subject pronouns, am/is/are) in the alphabet lesson. The
student was routed to `english-foundations` academy instead of `a0-spelling-sounds`
(phonics-first A0 track). The alphabet lesson had grammar teaching injected by
the `buildTeachHtml` function.

## Commits shipped (4 commits to main)

### `6d6bb56` — fix: phonics lessons teach letters and pen+paper, not grammar terms
- Added `isPhonicsLesson()` guard for a0-spelling-sounds academy + phonics lesson IDs
- `grammarGlossary()`, `connectionNoteFor()`, `prereqWordsFor()` return empty for phonics
- `buildTeachHtml()` shows "Get a pen and paper" + letter pronunciation panel for phonics
- Fixed DB: X example "box" → "x-ray"
- Bumped `pel_lesson_stage.js?v=` to `a8c4f2e1`

### `08cb6d4` — feat: rebuild alphabet lesson — teach all 26 letters first, then word-building
- Restructured `a0ss-alphabet` lesson items:
  - 26 letter items (idx 0-25): each teaches the letter with capital + small,
    Arabic name, memory hook, writing instruction, example word
  - 2 explain items (idx 26-27): alphabet order + pen and paper reminder
  - 25 sentence items (idx 28-52): "A is for apple" word-building AFTER letters
  - 1 explain item (idx 53): takeaway (spell your name)
- Before: letters and sentences were interleaved — students saw word-building
  exercises before learning all 26 letters
- After: ALL 26 letters come first, THEN word-building sentences

### `3467de5` — feat: dynamic curriculum path + A0 phonics phases
- `pel_curriculum_path.js`: ACADEMY is now dynamic (reads from PEL_EFFECTIVE_STATE.stage)
  instead of hardcoded `english-foundations`. Filters PEL_BEGINNER_PHASES by academy.
- `pel_lesson_stage.js`: Added 12 A0 phonics lesson metadata entries to PEL_BEGINNER
  (titles for a0ss-alphabet, a0ss-letter-sounds, etc.)
- Added 4 A0 phonics phases to PEL_BEGINNER_PHASES:
  Letters & Sounds, Spelling Words, Digraphs & Silent Letters, Word Building

### `d4f2303` — fix: DB data quality — translate dir, mixed tr fields, lesson title
- Fixed 130+ translate exercises with `dir=false` → `dir=en-ar`
- Fixed 6 choose exercises with mixed Arabic+translit in question.tr field
- Renamed `the-alphabet` lesson to "Airport Check-in: Spelling Your Name"
- Added missing `type` field to the-alphabet exercise payloads

## DB changes applied (live)

### Student routing fix
- `profiles.current_academy_id` changed from `english-foundations` to `a0-spelling-sounds`
  for student `c6f7dc15-003f-434d-bbb8-32b2d2e24c56`

### Alphabet lesson rebuild (a0ss-alphabet)
- 54 items total: 26 letters → 2 explain → 25 sentences → 1 takeaway
- Each letter: capital + small + Arabic name + memory hook + writing instruction

### Data quality fixes
- 130+ translate exercises: `dir` field fixed from `false`/`null` to `"en-ar"`
- 6 choose exercises: mixed Arabic+translit in `tr` field cleaned
- `the-alphabet` lesson renamed to "Airport Check-in: Spelling Your Name"
- `the-alphabet` exercise payloads: missing `type` field added

## SQL migration files
- `supabase/migrations/202610070002_phonics_teach_panel.sql` — X example fix
- `supabase/migrations/202610070003_rebuild_alphabet_lesson.sql` — 54 items + student routing
- `supabase/migrations/202610070004_db_data_quality_fixes.sql` — translate dir, tr, lesson title

## Notes for next session
- Git identity: personalizedenglishlessons / 149332361+personalizedenglishlessons@users.noreply.github.com
- Use `api_credentials=["github"]` for all git/gh operations
- Rule: whenever a lib file changes, bump its `?v=` hash in ALL HTML files that load it
- Rule: do NOT write the Supabase access token into files/commits/logs
- GitHub Pages deploys from main branch automatically (takes ~2 min + CDN cache)
- The `isPhonicsLesson()` check uses `Stage.state.lessonId` and `Stage.state.academyId`
- The `#pelTeachPlay` click handler reads `act._teachVocab` and plays each letter
- A0 curriculum: alphabet → letter sounds → vowels → CVC words → digraphs → word building
- The `english-foundations` academy is a DIFFERENT track from `a0-spelling-sounds`
- Students who should learn phonics first should be routed to `a0-spelling-sounds`
- The `student_route()` RPC filters by CEFR level (A0 students see only A0 academies)
- The `db_translate` renderer determines direction by checking source text for Arabic chars,
  not by the `dir` field — but the `dir` field should still be correct for data quality
