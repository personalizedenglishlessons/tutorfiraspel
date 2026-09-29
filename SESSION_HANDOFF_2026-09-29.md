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
