# Session Handoff — 2026-10-06 (A0 Curriculum Restructure)

## Context

The owner is building PEL (Personalized English Lessons) — a Supabase-backed
English learning app for Saudi Arabian students. The A0 plan ("Start From Zero")
is expected to be the most sold plan, targeting students who speak zero English,
don't know the alphabet, and don't understand English phonetics.

The owner's vision: A0 must start with the **alphabet and phonetics first**,
then how to connect letters, before any vocabulary or sentences.

## Commits shipped (4 commits to main)

### `fc1ec5f` — Wire a0-home-words academy + route A0 students through foundational academies
- `a0-home-words` academy (20 lessons, 170 exercises) existed in DB but was missing from app.html entirely
- Added to ACADEMIES array, ACADEMY_LESSONS mapping, ACADEMY_CEFR mapping in app.html
- Added all 6 A0 academies to ACADEMY_META and ACADEMY_LESSONS in pel-personalization.js
- Fixed buildRoute() in pel-personalization.js: A0 students now go through A0 academies before A1

### `dcfe8a2` — Cache-bust bump for pel-personalization.js
- Bumped in app.html and admin.html

### `051b7f7` — Fix alphabet gaps + index.html cache-bust
- Added missing "C is for cat" sentence item
- Fixed X: "box" doesn't start with X → changed to "x-ray"
- Bumped cache-bust in index.html

### `55d2dc4` — Phonics-first A0 route + new Letter Sounds lesson
- Reordered A0 route: Spelling & Sounds (alphabet+phonics) FIRST, then Social English, Home Words, Sentence Building, Question Words, Error Clinic
- Updated student_route() DB function with new A0 order (migration 202610060003+004)
- Created new "Letter Sounds" lesson (a0ss-letter-sounds): teaches the SOUND each letter makes
  - 36 lesson items: 26 letter sounds (a says ah, b says buh, c says cah...) + 8 sentence items + 2 explain items
  - 15 exercises: 8 choose, 3 order, 2 translate, 2 spell
  - All content in Saudi dialect Arabic
- Fixed academy_lessons sort_order for a0-spelling-sounds

## DB Migrations applied (4)

1. `202610060001_expand_alphabet_lesson.sql` — Expand alphabet from 3 to 26 letters with examples + 12 exercises
2. `202610060002_fix_alphabet_gaps.sql` — Add missing C sentence, fix X (box→x-ray)
3. `202610060003_reorder_a0_route.sql` — Reorder student_route() A0 academies (phonics first)
4. `202610060004_phonics_first_route_and_letter_sounds.sql` — Final route reorder + Letter Sounds lesson creation

## A0 Curriculum Structure (after changes)

### Route order (server-side student_route function):
1. **a0-spelling-sounds** (phonics first) — alphabet, letter sounds, vowels, digraphs, CVC words
2. **a0-social-english** — hello/goodbye, how are you, name intro, polite words
3. **a0-home-words** — yes/no/not, I/you/me, pronouns, prepositions, the, verbs
4. **a0-sentence-building** — I am, you are, he/she is, negatives, questions, contractions
5. **a0-question-words** — when, where, who, how, why, what
6. **a0-error-clinic** — a/an, am/is/are, he/she, this/that, plurals, apostrophes, capital I

### a0-spelling-sounds lesson sequence (11 lessons):
0. The English Alphabet (a0ss-alphabet) — 26 letters + 25 example sentences + 15 exercises
1. Letter Sounds (a0ss-letter-sounds) — NEW: 26 letter sounds + 8 sentences + 15 exercises
2. Vowels A E I O U (a0ss-vowels)
3. SH and CH Sounds (a0ss-sh-ch)
4. The TH Sound (a0ss-th-sound)
5. Silent Letters (a0ss-silent-letters)
6. Spelling family -AT: cat, hat, bat (spell-cvc-at) — connecting letters
7. Spelling families -IG and -OG (spell-cvc-ig-og)
8. The th sound: this, that, three (spell-digraph-th)
9. Silent e: cap becomes cape (spell-silent-e)
10. Plural s: one cat, two cats (spell-plurals)

## Test student
- Email: farazahmedshakil66@gmail.com
- User ID: c6f7dc15-003f-434d-bbb8-32b2d2e24c56
- Plan: start_from_zero (A0)
- student_progression updated: current_stage='a0-spelling-sounds', current_lesson='a0ss-alphabet'
- Verified in browser: student logs in → lands on alphabet lesson (step 1/36)

## Tests
All 65 tests pass (13 buildsequence + 52 teaching flow).

## Notes for next session
- Git identity: personalizedenglishlessons / 149332361+personalizedenglishlessons@users.noreply.github.com
- gh auth setup-git already run on this checkout
- Rule: whenever a lib file changes, bump its ?v= hash in ALL HTML files that load it
- Rule: do NOT write the Supabase access token into files/commits/logs
- GitHub Pages deploys from main branch automatically
- The server-side route (student_route function) is the authoritative route. The client-side buildRoute() in pel-personalization.js is used for onboarding route preview only.
- To change a student's current lesson, update BOTH student_progression (current_stage, current_lesson) AND student_data (pel_stage_pos key)
