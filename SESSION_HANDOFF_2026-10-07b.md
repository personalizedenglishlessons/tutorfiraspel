# Session Handoff — 2026-10-07b (CEFR Boundary Enforcement + Syntax Fix)

## Context

The owner's key requirement: A0's content strictly stays in A0's, A1's in A1's,
A2's in A2's, B1's in B1's, B2's in B2's, C1's in C1's, C2's in C2's, STEP's in STEP's.

## Issues Found and Fixed

### CRITICAL: Duplicate `const ACADEMY_CEFR` declaration in app.html (line 18959)
- `const ACADEMY_CEFR = {const ACADEMY_CEFR = {` — a syntax error that crashed the
  entire inline IIFE, preventing the Supabase client from initializing.
- The student dashboard was stuck on "Verifying your enrolment..." because the
  IIFE that creates `pelSupabaseClient()` never ran.
- **Fixed**: removed the duplicate declaration and the extra `};`.

### `english-foundations` mapped as A1 instead of A0
- In app.html `ACADEMY_CEFR`, `lib/pel-personalization.js` academy definitions, and
  the DB `academies` table.
- `english-foundations` contains A0 content (alphabet, greetings, numbers, etc.)
  and is the starting academy for `start_from_zero` students.
- **Fixed**: changed to A0 in all three locations (app.html, pel-personalization.js, DB).

### 18 missing academies in client-side ACADEMY_CEFR map
- Recent commits added new academies (a1-core-words, a1-present-simple,
  a2-complete-course, b1-complete-course, b2-professional-comm,
  c1-advanced-english, c2-near-native, step-exam-prep, etc.) to the DB but not
  to the client-side `ACADEMY_CEFR` map in app.html.
- **Fixed**: added all 18 missing academies with correct CEFR levels.

### student_route() RPC returned cross-CEFR academies
- The `student_route()` function returned ALL academies with a proximity score,
  meaning an A0 student would see A1, A2, B1, B2, C1, C2 academies in their route.
- A1 academies ranked HIGHER than A0 academies (score 30 vs 20) because the
  default level was 'a1' instead of 'a0'.
- **Fixed**: rewrote `student_route()` to strictly filter by `lower(a.level) = v_level`.
  A0 students now see only A0 academies. Default level changed from 'a1' to 'a0'.

### 10 cross-CEFR violations in DB (step-exam-prep sharing B2/C1 lessons)
- 10 lessons appeared in both `step-exam-prep` AND `b2-complete-course` or
  `c1-advanced-english` academies.
- **Fixed**: removed the 10 lessons from `step-exam-prep`. They remain in their
  canonical B2/C1 academies.

## Verification

### Database (student_route RPC)
- A0 student route returns only 7 A0 academies:
  a0-sentence-building, a0-question-words, a0-spelling-sounds, a0-error-clinic,
  a0-social-english, a0-home-words, english-foundations
- Zero cross-CEFR contamination (verified by audit script)

### Client-side (ACADEMY_LESSONS)
- 0 cross-CEFR violations in client-side ACADEMY_LESSONS map
- All 46 client-side academies have CEFR levels assigned

### Live site (browser test)
- Student (farazahmedshakil66@gmail.com) logged in successfully
- Dashboard shows level "انجليزي البدايه" (English Starter / A0)
- Current academy: الاملاء والاصوات (Spelling and Sounds) — a0-spelling-sounds
- Current lesson: الحروف الانجليزيه (The Alphabet) — a0ss-alphabet
- Route stages: all 7 A0 academies only
- Lesson content renders properly (alphabet, grammar terms, exercises)

## Commits shipped

### `38b11a8` — Enforce strict CEFR boundaries in student_route + fix duplicate ACADEMY_CEFR + A0 mapping
- Fixed duplicate `const ACADEMY_CEFR = {const ACADEMY_CEFR = {` syntax error in app.html
- Changed `english-foundations` from A1 to A0 in app.html ACADEMY_CEFR and pel-personalization.js
- Added 18 missing academies to client-side ACADEMY_CEFR map
- Rewrote `student_route()` RPC to strictly filter by student's CEFR level
- Changed default level from 'a1' to 'a0' for unassessed students
- Removed 10 cross-CEFR violations from step-exam-prep academy
- Updated `english-foundations` level from A1 to A0 in DB academies table

## DB migrations applied (live)

### student_route() function rewrite
- Applied directly via Supabase management API query endpoint
- Strict CEFR filtering: `where lower(a.level) = v_level`
- Default level: 'a0' (was 'a1')

### Cross-CEFR lesson cleanup
- 10 rows deleted from `academy_lessons` where `academy_id = 'step-exam-prep'`
  and `lesson_id in (b2-advanced-vocab, c1-register-vocab, c1-critical-reading,
  c1-academic-writing, b2-pack2-02, b2-pack2-04, c1-pack2-01, c1-pack2-02,
  c1-pack2-03, c1-pack2-04)`

### academies table update
- `english-foundations` level changed from 'A1' to 'A0'

## SQL migration file
- `supabase/migrations/202610070001_enforce_cefr_boundaries_student_route.sql`
  contains all three changes for reproducibility.

## Notes for next session
- Git identity: personalizedenglishlessons / 149332361+personalizedenglishlessons@users.noreply.github.com
- Use `api_credentials=["github"]` for all git/gh operations
- Rule: whenever a lib file changes, bump its `?v=` hash in ALL HTML files that load it
- Rule: do NOT write the Supabase access token into files/commits/logs
- GitHub Pages deploys from main branch automatically (takes ~2 min + CDN cache)
- The `student_route()` function is the authoritative routing function. The
  client-side `ACADEMY_LESSONS` and `ACADEMY_CEFR` maps are for offline fallback only.
- Both copies of `ACADEMY_LESSONS` exist in `app.html` and `lib/pel-personalization.js`
  — keep them in sync.
