# Session Handoff — 2026-09-29 (Check-button free pass + content fixes)

## The reported bug
Student could click تحقق (Check) / متابعه (Continue) and skip through
lesson activities without solving anything ("kept clicking and it skipped").

## Root causes found and fixed (lib/pel_lesson_stage.js)
1. **Self-pass Check buttons** — pronunciation / speaking / minimal_pairs
   wired Check to `mark(ctx, true, true)` (unconditional self-pass). On a
   laptop where the mic errors instantly, every speaking activity was a
   one-click skip. Fix: Check now requires a REAL mic attempt first
   (`micAttempted` flag); mic-error fallback (self-check, excluded from
   the mastery gate) still works after an attempt, so broken mics never
   block a lesson.
2. **mark() armed Continue on wrong answers** — the button was set to
   Continue → next() first, then replaced by Try again for wrong answers.
   Continue is now armed ONLY on correct answers.
3. **No-answer guard in mark()** — correct === undefined (nothing
   selected/typed) now shows "اختر جواب اول وبعدين تحقق" and never counts
   or advances.
4. **next() invariant backstop** — next() refuses to advance any activity
   marked checked-and-wrong, no matter which code path calls it.

## Content fixes
- identify_heard sentence-variant distractors no longer substitute
  function words into sentence frames ("Happy is a please of glad" →
  nonsense). Only noun-like words fill frame slots now.
- login.html BiDi fix: English sentences in the RTL page no longer render
  their trailing period at line start (".For enrolled students").

## Verified live (GitHub Pages, student account, full 23-activity lesson)
- Force-clicking Check with no answer 80+ times: zero advance, nudge shown.
- Full walk of all 23 activity types in the STEP vocab lesson: every
  cheat attempt blocked, wrong answers loop through Try again, mastery
  gate holds at the end (self-check attempts excluded).
- Live testing caught and fixed a ReferenceError my first patch introduced
  in the speaking renderer (micAttempted scope) — always live-test.

## Arabic translations status
- Scanned all 2,559 lesson_items in the live DB for missing/latin-only/
  suspicious pairs: content is clean; the 2026-09-28 sweeps held up.
- STEP vocab spot-checked by hand (synonym/antonym/word form/equivalent,
  plus travel/medical/work sets) — no mistranslations found.

Cache-buster: lib/pel_lesson_stage.js?v=fixcheck04

## Addendum 2 — DB-side sweep + third-distractor migration (later on 2026-09-29)

Full database audit via the management API (SQL endpoint):
- `lesson_items` (2,559 rows): clean — 0 missing Arabic, 0 latin-only ar_meaning, 0 identical en/ar, 0 corrupted text.
- `lesson_exercises` (1,428 rows): all structurally valid (order answers buildable from tokens incl. phrase chunks; choose quizzes all have exactly 1 ok option).
- 45 gap-format spell exercises (options as `{t, ok}` letter objects, display like "C _ T"): data is valid — the STAGE `db_spell` activity handles them correctly (letter bank built from the answer, ignores options). The legacy workspace renderer `renderDbPractice` rendered them as "[object Object]" and could never grade them correct — fixed client-side in commit b0b43d6 (render label from `o.t`; gap format grades the single picked letter against the ok flag). No DB change needed for these.

One real DB-side flaw fixed (migration `supabase/migrations/20260929190000_choose_add_third_distractor.sql`, applied live + pushed as f926ed3):
- 10 choose exercises had only 2 options (50% blind-guess pass): ids 621, 627, 633, 641, 645, 652, 688, 691, 694, 782. Each got a third hand-written learner-error distractor with transliteration. Verified in live DB: 0 choose exercises with <3 options remain; each has exactly 1 correct.

Gotchas: the management-API `/database/query` runner executes one statement per call — inline `;`-terminated statements with trailing comments need careful splitting, and apostrophes in payloads need dollar-quoting (`$j$...$j$`).

## Addendum 3 — Mistranslation sweep 3 (evening 2026-09-29)

Semantic (not just missing-text) pass over all Arabic content:
- lesson_items (2,559): 3 real fixes — id 1430 'at' ar_meaning was translit (ات) → في / عند; id 2031 'used to + verb' ar_meaning was translit garbage → كان معتاد + فعل; id 2134 example_ar was translit → real Saudi translation. Loanwords (email/wifi/riyal/latte/December/letter names) are intentional, left as-is.
- lesson_exercises (1,428): all clean (prompt ar≠tr, translate answers real Arabic, why_ar/meaning Arabic).
- Hardcoded content: PEL_BEGINNER vocab (674 entries) + app.html lesson content (306 entries) — 0 issues.
- 68 explain items had note_ar NULL (English-only titles). All translated (migration 20260929220000, applied live + pushed as 3d72a51).
- Discovered note_en/note_ar were fetched by the student_curriculum RPC but dropped in dbToLesson and never rendered — so translated titles had no surface. Added a 'الفكره الاساسيه / Key idea' line to the stage concept activity + workspace notes section (commit f42ef91, cache-bust pel_lesson_stage.js?v=notekey01). Live-verified on writing-emails-polite.
