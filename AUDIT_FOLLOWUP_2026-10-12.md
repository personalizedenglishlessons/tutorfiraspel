# Lesson Engine Audit Follow-Up — 2026-10-12

Scope: verification + fixes for the bugs and dialect flags found in the
2026-10-12 lesson-engine audit. All findings verified against live Supabase
DB (`lewoochehpiycocvfwtz`) and the production deployment at
`https://pel.personalizedenglishlessons.workers.dev`.

---

## Bugs fixed (commit `20ac98f`, pushed to `main`)

1. **`activityTouch` undefined in the stage factory.** Added to the
   destructuring in `lib/pel_lesson_stage.js:23-28`. Previously a silent
   `ReferenceError` swallowed by try/catch, so per-activity analytics
   never reached the server.
2. **Empty-sequence instant completion.** Added a guard in
   `lib/pel_lesson_stage.js:3691-3710` so a lesson with zero exercises
   shows an honest "no activities yet" message instead of awarding +50 XP
   and a fake completion.
3. **Duplicate notes on repeated save.** `app.html:19357-19365` now
   dedupes against existing note text+lesson before unshifting.
4. **MSA/tonal inconsistencies.** Fixed `app.html:16315/16348` ("اكتمل
   الدرس" → "خلصت درس"), `app.html:16377` (stiff streak-freeze toast →
   casual Saudi), `lib/pel_lesson_stage.js:3962` (done-screen header), and
   `lib/pel_lesson_stage.js:3965` (Recognition glossary "استرجاع" → "تذكر").

## Findings investigated and NOT bugs (no action needed)

- **Hamza "inconsistency" (`سؤال` vs `اسئله`).** Standard correct Arabic
  orthography — singular with hamza on و, plural without. The audit
  over-flagged this. No fix needed.
- **30s cache race in `c_rpc_effective_state()`.** Already mitigated in
  code: locked-lesson re-checks force-refresh the server state, and the
  completion RPC overwrites `PEL_EFFECTIVE_STATE` with the fresh response.
  No action needed.

## Data integrity verification (live Supabase DB)

All clean — zero rows returned for every check:

- `lesson_items` with null/empty `en`
- `lesson_exercises` with malformed payloads (choose with <2 options, order
  with <2 tokens, translate with empty answer)
- `lesson_exercises` where a `choose` exercise has no correct option
- `lesson_exercises` where `payload` is not a JSON object

## Production verification

- All 8 levels (A0, A1, A2, B1, B2, C1, C2, STEP) populated:
  65/134/38/60/22/25/12/12 lessons.
- 4 active students in `student_progression`.
- No orphan lessons (every active lesson has items AND exercises).
- Fixed content confirmed live on
  `https://pel.personalizedenglishlessons.workers.dev` (contains the
  "خلصت الدرس" string).

## Saudi-dialect verdict (unchanged)

Content is consistently Saudi colloquial, not MSA. No ta marbuta misuse
anywhere (deliberate house style). No MSA strings leaked into
`lesson_items`/`lesson_exercises` for any level (checked A0/C2/STEP
samples and scanned all levels for formal markers with no hits).
