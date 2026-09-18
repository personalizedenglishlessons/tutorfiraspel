# NEXT STEPS - pick up here

## DONE: Live audit + bug fixes (2026-09-18 session)

### Bugs found and fixed
1. **mistake_coach titleEn class** (commit `4ab25f2`): `pattern.titleEn` (English text) had `class="arabic"` causing wrong text direction. Removed the class. Browser-verified.

2. **mistake_coach Check button enabled before selection** (commit `4ab25f2`): The `ready()` function sets `btn.disabled = false`, overriding the initial disable. Fixed by adding `ctx.btn.disabled = true` AFTER `ready()` call. Code-verified (could not browser-verify because activity state was already completed).

3. **Mobile FAB overlap** (commit `4ab25f2`): `.fab-qt` at `bottom:18px` overlapped the 58px mobile dock nav. Moved FAB to `bottom:72px` and `qt-popup` to `bottom:140px`. Browser-verified: FAB bottom at 740px, dock top at 754px, 14px gap.

4. **Greeting timezone bug** (commit `45cb563`): "Good morning" shown at 5 PM Riyadh time. Used `new Date().getHours()` (browser timezone) instead of user timezone. Fixed to use `Intl.DateTimeFormat` with `Asia/Riyadh`. Browser-verified: shows "Good evening" at 6 PM Riyadh.

5. **Formal Arabic in grammar quiz prompts** (commit `45cb563`): `ايهما صحيح؟` (MSA with hamza) and `الجملة الصحيحة:` (formal) replaced with Saudi dialect: `اي جملة صح؟` and `اي جملة صح:`. Browser-verified: no formal Arabic or hamza found in Grammar view.

6. **Disabled-button bug across 12 renderers** (commit pending): Pre-existing bug where `ctx.btn.disabled=true` before `ctx.self.ready()` was overridden by `ready()` setting `btn.disabled=false`. Fixed all 12 instances (recognize, match, arrange_words, fill_blank, spell, translate, correct, choose_natural_expression, guided_production, etc.) by adding `ctx.btn.disabled=true` after each `ready()` call.

### Audit coverage (live browser)
- Home/dashboard: 0 errors, greeting correct
- Lesson flow + mistake_coach: 0 errors, tip→practice→check→continue all work
- Smart Review: 0 errors, renders correctly
- Grammar Academy: 0 errors, no formal Arabic/hamza
- Bookmarks, Achievements, Study Calendar, Profile, Settings: 0 errors
- Light mode: 0 errors, 0 contrast issues
- Mobile (375px): sidebar hidden, FAB fixed, bottom nav present
- Total console errors: 0 across ALL views

### Known remaining issues
1. **360 order exercises missing Arabic translations** — needs human/LLM translation
2. **Duplicate exercises in grammar_db_challenges** (reported by codebase LLM)
3. **Best practices roadmap** still pending (schema fixes, error handling, etc.)

---

## DONE: Saudi Mistake Coach + expanded teaching content + pronunciation hints (2026-09-18 session)

### Shipped
1. **Saudi Mistake Coach (commit `39eee63`)** — Major new feature:
   - 8 categories, 29 interactive error patterns based on academic research
     (Al-Hattami 2010, Ahmad 2011, Al-Seghayer 2014)
   - Categories: articles, prepositions, verb-agreement, negation, word-order,
     confusing-words, idioms, pronunciation-traps
   - Each pattern: wrong sentence, correct sentence, Saudi dialect whyAr,
     ruleAr, 1-3 practice questions
   - Integrated into lesson flow as `mistake_coach` activity type — appears
     naturally within lessons, not as a separate section. Patterns are matched
     to lesson content (vocabulary, notes, exercises).
   - Two-phase renderer: Phase 1 shows wrong/correct pair + explanation,
     Phase 2 shows practice question with scoring
   - Browser verified: 2 patterns matched and inserted into STEP lesson at
     positions 23-24 ("Missing a/an", "Overusing the with plurals")
   - Data exposed on window.SAUDI_MISTAKE_COACH and wired via deps.saudiMistakeCoach

2. **Expanded TEACHING_CONTENT (commit `12cad61`)** — 18 new entries:
   - the, in, on, at, is, are, was, were, have, has, not, no, but, because,
     or, if, there
   - Each entry: meaning in Saudi dialect, useWhen, dontUseWhen,
     commonMistake, howToAvoid, remember

3. **Expanded PRON_HINTS (commit `12cad61`)** — 23 new pronunciation hints:
   - film, next, clothes, asked, text, stop, stand, story, price, print,
     parking, happy, open, happen, apple, place, play, put, spend, sport, spring
   - Covers research-identified trap words: consonant clusters, /p/ vs /b/
   - Fixed duplicates (paper, please) and print hint (was using ب instead of پ)

4. **Enhanced connectionNoteFor (commit `15fdb67`)** — 3 new grammar rules:
   - Adjective before noun (Arabic interference: noun-adjective → adjective-noun)
   - No vs not (Arabic uses لا for both)
   - Adverb position (always/usually/never before main verb, after is/are/am)
   - Total: 27 grammar patterns in connectionNoteFor

5. **All hamza removed** from user-facing Arabic text in pel_lesson_stage.js
   - اعادة→اعاده, exam→امتحان, شؤون→شون, etc.
   - All Arabic now uses Saudi spoken dialect

6. **PEL_ACTIVITY.touch integration (commit `12cad61`)**:
   - Stage.mark() and Stage.next() now call PEL_ACTIVITY.touch() with
     activity type, skill, and correct/total scores
   - Wired via deps.activityTouch in app.html

### Verification
- All 44 tests pass (13 buildsequence + 31 teaching flow)
- Browser smoke test: 0 errors, SAUDI_MISTAKE_COACH loaded with 8 categories
- mistake_coach activity type verified in lesson sequence
- Cache busters updated throughout session

### Next steps
1. **360 order exercises missing Arabic translations** — still needs human/LLM translation
2. **renderGrammar() could use SAUDI_MISTAKE_COACH data** in Grammar view for
   richer interactive content (currently only used in lesson flow)
3. **Duplicate exercises in grammar_db_challenges** (reported by codebase LLM)
4. **Best practices roadmap** still pending (schema fixes, error handling, etc.)

---

## DONE: Remove purposeless gold bar + DB audit + smoke test (2026-09-16 session)

### Shipped
1. **Removed gold 'كمل التعلم' bar** (commit `2dccd0b`):
   - The hero card was stripped to just a full-width gold button that said
     'كمل التعلم، Resume Learning' with 90% empty space. Served no purpose.
   - Removed `#heroResumeBtn` entirely. Added `#heroPathBody` div inside
     `#heroCard` so `renderActivePath()` can render the actual lesson path.
   - Hero card hidden by default (`display:none`); only shows when
     `renderActivePath()` or fallback has real content.
   - Updated `renderContinueLearning()`: removed `heroCard.style.display=''`
     from the else branch (was showing empty card). Added `heroCard.style.display=''`
     to the two fallback content paths (inProgress + planNext).
   - Cleaned up stale `heroResumeBtn` innerHTML reference in setup section.

2. **DB audit** (read-only, via Supabase Management API):
   - All 21 expected tables exist (student_presence, student_activity_events,
     auth_attempts, lessons, academies, etc.)
   - All 96 public functions exist and match RPC calls in app.html (16) +
     admin.js (60). No missing RPCs.
   - student_presence schema: all 12 expected columns present (user_id,
     session_id, status, last_seen_at, last_login_at, current_page,
     current_lesson_id, current_academy_id, last_action, last_action_at,
     session_started_at, updated_at)
   - student_activity_events schema: all 11 expected columns present
   - Data counts: 1428 exercises, 54 academies, 366 lessons, 2559 items
   - A0 Home Words: 20 lessons (correct)
   - 1 student_presence row, 1 activity_event row (test data exists)

3. **Browser smoke test** (cloud browser, logged in as testmail1):
   - 0 console errors, 0 uncaught exceptions
   - 0 [object Object] text leaks
   - Gold 'كمل التعلم' bar: GONE (heroResumeBtn not in DOM)
   - Hero card: visible, showing lesson path from renderActivePath()
     (English Middle / STEP Exam Prep / 0 of 23 lessons / Start button)
   - Login flow works, page renders correctly

### Verification
- `node --check` on all lib/*.js + admin/admin.js: OK
- `node --check` on app.html script blocks: OK
- `node tests/test_buildsequence_iam.js`: 13/13 PASS
- `node tests/test_teaching_flow.js`: 31/31 PASS
- Browser smoke test: 0 errors, hero card renders lesson path correctly

### Next steps
1. **360 order exercises missing Arabic translations** (was 126 in prior
   session, now 360 - likely grew with A0 Home Words + new content).
   These need human/LLM translation work (content, not code).
2. **Activity touch in lesson stage**: Add `PEL_ACTIVITY.touch('activity', ...)`
   in pel_lesson_stage.js Stage.mark() and Stage.next() for per-activity tracking.
3. **Admin overview**: Add online student count to admin_overview RPC.
4. **Activity retention**: Consider periodic cleanup of
   student_activity_events (keep last 90 days).
5. **Live admin UI test**: Admin login + verify student table shows online
   badges, 360 header shows presence, activity tab shows events.
6. **student_route() needs auth context**: Cannot test via Management API
   (returns null without auth.uid()). Test via browser or authenticated
   Supabase client.

### Hotfix: heroCard ReferenceError (commit `92ac8b9`)
- After removing #heroCard from HTML and disabling renderActivePath(),
  forgot to keep `const heroCard` declaration in renderContinueLearning().
  Two `if(heroCard)` references at lines 18178+18196 threw ReferenceError
  on boot. Added declaration back (element is null, null checks skip safely).
- Also removed #heroPathBody entirely - #ccBlock (renderControlCenter)
  already shows the lesson card with progress ring + start button.
  The lesson path list from renderActivePath() was redundant.
- User confirmed app works after fix propagated to GitHub Pages.

---

## DONE: Restructure concept explanations into Rule / Meaning / Examples / When-to-use + highlight important words everywhere (2026-09-16 session)

### Problem
Concept activities, grammar sections, and lesson-reader dbNotes all dumped
explanations as a wall of text. User wanted:
- a ترتيب (ordering) — Rule, Meaning, Examples, When-to-use, clearly labelled
- important vocabulary words highlighted everywhere (lessons, courses, activities)

### What was done
#### `lib/pel_lesson_stage.js`
- Added `collectTerms(act, state)` — collects vocab + grammar wrong/right pairs
  + dbNotes terms + a small grammar-particle whitelist (yes/no/not/am/is/are/...)
  so concept lessons like Yes/No/Not get key words highlighted even when vocab
  is sparse.
- Added `highlightImportant(html, terms)` — wraps vocabulary words in
  `<span class="key-term">` with proper English (latin-letter) and Arabic
  (\u0600-\u06FF) boundaries (no reliance on `\b`, which doesn't work for
  Arabic in JS regex).
- Added `sectionNoteText(en, ar)` — classifies each note's sentences into
  Rule / Meaning / When-to-use buckets using keyword heuristics
  (يعني/معنى/means, اذا/متى/تستخدم/when/use). Unmatched sentences stay in Rule
  so nothing is dropped.
- Added `collectExamples(act, state)` — pulls real example sentences from
  `lesson.exampleSentences` / `lesson.conversation` (max 3) — no invented data.
- Rewrote `concept()` renderer: numbered step cards under labelled sections
  (📏 Rule, 💡 Meaning, 📝 Examples, 🎯 When to use). All text is highlighted.
- Applied highlighting to `learn()`, `learn_sentence()`, `concept_examples()`
  (English + Arabic reveal text).
- Teaching panel: grammar.rule/saudi and dbNotes step cards now use
  `highlightImportant()` via `_terms1/_terms2/_terms3` (collected from
  `Stage.state`).
- CSS: added `.key-term`, `.pel-concept-section-label`,
  `.pel-concept-examples`, `.pel-concept-ex` to STYLE.

#### `app.html` lesson reader
- Added global `collectLessonTerms(lesson)`, `highlightImportant(html, terms)`,
  `sectionNoteText(en, ar)` (mirroring the stage helpers).
- `renderStepsHtml(text, textClass, terms)` now accepts an optional `terms`
  arg and highlights inside.
- dbNotes section: rewritten as an IIFE that classifies each note into
  Rule / Meaning / When-to-use and renders labelled sections with highlighting.
- grammar section: rewritten as an IIFE with 📏 Rule / 💡 Meaning / 📝 Examples
  (drawn from `lesson.exampleSentences`) + wrong/right pair, all highlighted.
- conversation section: rewritten as an IIFE so English + Arabic text both get
  highlighted.
- CSS: added `.key-term`, `.concept-section-label`, `.concept-examples`,
  `.concept-ex` mirroring the stage engine's classes.

### Verification
- `node --check lib/pel_lesson_stage.js` ✓
- All three app.html inline script blocks pass `node --check` ✓
- `node tests/test_buildsequence_iam.js` → 13/13 PASS ✓
- `node tests/test_teaching_flow.js` → 31/31 PASS ✓
- `python3 tools/bust_lib_cache.py` → app.html now references
  `lib/pel_lesson_stage.js?v=f5653743`

### Notes for next session
- Data model is still a single text blob per dbNote (`{en, ar, note_en, tr}`);
  sectioning is heuristic-based, not authoritative. If a course has no
  `exampleSentences`/`conversation`, the Examples section is omitted (not
  fabricated).
- The grammar-particle whitelist is intentionally short — extend it if more
  concept lessons need extra coverage.
- If you see a concept activity where a section is empty, the note's sentences
  didn't match the keyword heuristics — the fallback (show Arabic text as
  Meaning) covers the common case.

---

## DONE: Fix SyntaxError at app.html:18245 (2026-09-16 session)

### Problem
`app.html:18245 Uncaught SyntaxError: Unexpected token 'else'` — the
`if(firstTime)` block in `renderContinueLearning()` had a duplicate closing
brace. Line 18244 `  }` closed the block, then line 18245 `  }else{` had an
extra `}` before the `else`, causing a fatal syntax error that broke the
entire app on load.

### Fix
Removed the duplicate closing brace. Now the structure is:
```
if(firstTime){
  ...code...
  if(card) card.style.display = 'none';
}else{            // single close + else
  ...code...
}
```

### Verified
- `node --check` on all 3 script blocks in app.html - OK
- `node --check` on all lib/*.js + admin/admin.js - OK
- `node tests/test_buildsequence_iam.js` - 13/13 PASS
- `node tests/test_teaching_flow.js` - 31/31 PASS
- Committed and pushed: `3f8769d`

### Notes
- Supabase Management API was under maintenance during this session
  (est. completion 21:45 UTC). DB operations deferred until API recovers.
- All 4 feature branches (feat/admin-create-student,
  fix/client-academy-resolver, fix/lesson-engine-phase1,
  fix/server-plan-profile) are already fully contained in main (0 commits
  ahead). No merge needed.
- The syntax error was likely introduced in commit `8ff5428` ("Remove Daily
  Burst + Continue Learning, move Word Burst to top, fix Focus card") where
  the `if(firstTime)`/`else` restructuring left a stale closing brace.

### Next steps
1. **Verify live site**: Load
   https://personalizedenglishlessons.github.io/tutorfiraspel/app.html
   and confirm the app loads without console errors (GitHub Pages caches
   for ~10 min, use `?fresh=<timestamp>` to bust cache).
2. **Supabase DB check**: Once API maintenance ends, verify no pending
   migrations need applying (`supabase/migrations/` — all were previously
   applied to live DB per NEXT_STEPS notes).
3. **Browser test**: Follow the verify checklists in the sections below
   (student presence tracking, admin overhaul, etc.).
4. **Remaining Arabic translation gaps**: 30 choose exercises + 126 order
   exercises still need Arabic translations (content work).
5. **Activity touch in lesson stage**: Add `PEL_ACTIVITY.touch('activity',
   ...)` in pel_lesson_stage.js Stage.mark() and Stage.next().
6. **Admin overview**: Add online student count to admin_overview RPC.
7. **Activity retention**: Consider periodic cleanup of
   student_activity_events (keep last 90 days).

---

## DONE: Student presence & activity tracking (2026-09-15 session)

### Shipped
1. **Migration 202609150003_student_presence_tracking.sql** (applied to live DB):
   - `student_presence` table: one row per user, upsertable summary
     (session_id, status, last_seen_at, last_login_at, current_page,
     current_lesson_id, current_academy_id, last_action, last_action_at,
     session_started_at, updated_at).
   - `student_activity_events` table: append-only log (event_type, page,
     academy_id, lesson_id, activity_idx, action_label, metadata).
   - `student_touch()` RPC (SECURITY DEFINER): student app calls this to
     upsert presence + log activity events. Heartbeats skip event insert
     to reduce volume. Login event sets last_login_at. Session ID change
     resets session_started_at.
   - `admin_students` updated: LEFT JOIN student_presence, returns
     is_online (computed: last_seen_at > now() - 2min), last_seen,
     last_login, current_page, current_lesson, current_academy,
     last_action, last_action_at, session_duration.
   - `admin_student_360` updated: adds `presence` object + `recent_activity`
     array (last 30 events from student_activity_events).
   - RLS: students can read own presence/events; all writes via RPC only.

2. **Student app wiring (app.html)**:
   - PEL_ACTIVITY module: generates session_id (sessionStorage),
     throttled touch() (heartbeats 45s min, other events 3s min).
   - Heartbeat every 60s while tab visible + on visibilitychange.
   - Touch on login (event_type='login'), page_view (goToView),
     open_lesson, logout (before signOut).
   - All calls fire-and-forget (never block UI).

3. **Admin UI (admin.js)**:
   - Student table: online/offline badge in Last Active column.
   - Student 360 header: presence badge + last login, last action,
     current lesson, session duration.
   - Activity tab: new "Recent Activity" section with color-coded
     event dots (green=login, red=logout, gold=open_lesson, warn=other).

### Verify checklist (needs browser testing)
- [ ] Log in as student (testmail1@gmail.com / namas123) → check DB
      has student_presence row with last_login_at set
- [ ] Open a lesson → check DB current_lesson_id updated
- [ ] Wait 60s → check last_seen_at updated (heartbeat)
- [ ] Log in as admin → student table shows Online badge for test student
- [ ] Open student 360 → header shows presence badge + last login + session
- [ ] Activity tab shows recent activity events
- [ ] Close student tab → wait 2min → student shows Offline in admin

### Next steps for future session
1. **Browser test**: follow verify checklist above (needs live testing).
2. **Activity touch in lesson stage**: currently touches on open_lesson but
   not on individual activity interactions (answer check, lesson complete).
   Could add `PEL_ACTIVITY.touch('activity', {activityIdx: idx, action: '...'})`
   in pel_lesson_stage.js Stage.mark() and Stage.next().
3. **Admin overview**: add online student count to admin_overview RPC.
4. **Auto-refresh**: admin student table could auto-refresh every 60s to
   update online/offline status in real-time.
5. **Activity retention**: student_activity_events will grow indefinitely.
   Consider a periodic cleanup (e.g., keep last 90 days).

---

## DONE: Admin overhaul round 1 (2026-09-16 session)

### Shipped
1. **Create student fixed** (migration 202609160001, applied to live DB):
   admin_create_student checked the dead legacy flag profiles.is_admin
   (0 rows true) instead of the real role system -> 'Permission denied'
   for every real admin. Now uses has_permission('students.manage') like
   every other admin RPC. Verified: super_admin simulation now passes the
   permission gate; student simulation still denied. Also synced
   profiles.is_admin=true for admin/super_admin user_roles rows.
2. **Level renaming** (display-only, internal codes A0..C2 unchanged in DB):
   A0 English Starter/انجليزي البداية, A1 English Basics/انجليزي الاساس,
   A2 English Daily/انجليزي اليومي, B1 English Middle/انجليزي الوسط,
   B2 English Strong/انجليزي قوي, C1 English High/انجليزي عالي,
   C2 English Pro/انجليزي محترف. Applied in admin.js (LVL_NAMES/lvlName/
   lvlOptions helper: student table chips, 360 header, filters, assign-plan
   modal, question bank, academy form), app.html CEFR_LEVELS + levels page
   (numbered circles 1-7 instead of code circles, no code chips), plan page
   chips/headers, lib/pel-personalization.js LEVELS, pel-assessment.js
   result screen + WhatsApp message (uses PEL_ENGINE.levelInfo).
3. **Audit trash removed from UI**: Audit Log nav view, overview 'recent
   audit' card, student-360 audit tab all removed; audit() DB writes kept
   (other actions still log silently).
4. **One assign-plan path**: removed Programs-view 'New subscription'
   (subForm/admin_subscription_add duplicate). Only openAssignPlanModal
   (program + dates + tier + level in one modal) remains, reachable from
   student 360 header and Plans view.
5. **Needs attention hardened**: null reasons filtered, null-safe day
   counts, explicit Open button per row (wireStudentLinks covers both
   link + button).
6. **Personalization tab explained**: bilingual helper card (data comes
   from the student's own onboarding answers; empty = student has not
   built a plan yet), clear empty state, friendly level names.

### Gotcha for future edits to admin.js
When deleting a function with a python 'find next function' pattern, the
boundary `'\nfunction '` skips `async function` declarations - an earlier
removal silently ate `async function roles` and `async function health`.
Caught by a Node DOM-stub load test (see below). ALWAYS re-run:
`grep -oP "^(async )?function \w+" admin/admin.js | sort` diff vs HEAD
after surgical deletions.

### Verify checklist (admin login required)
- [ ] Create student works (was: permission denied)
- [ ] Overview attention rows have Open buttons, reasons render
- [ ] No Audit Log in sidebar, no audit card on overview
- [ ] Levels show friendly names everywhere incl. assign-plan modal
- [ ] Programs view has only 'New program', no 'New subscription'
- [ ] Personalization tab shows helper text + empty state

---

## DONE: A0 Home Words academy + full hamza cleanup + dialect polish (2026-09-15 session)

### What shipped (all applied to live Supabase, migrations committed in supabase/migrations/)

1. **202609150001_a0_home_words.sql** - new academy `a0-home-words`
   (كلمات البيت, icon home, gold colors, sort_order 99 = FIRST in A0).
   20 mastery-gated lessons `a0hw-01-yes-no` .. `a0hw-19-cola-time`
   (checkpoint last, id stays `a0hw-19-cola-time` even though it is lesson 20 -
   lesson ids are cosmetic, `academy_lessons.sort_order` controls display).
   ~50 words the user picked (yes/no, pronouns, this/these, in/on/off, here/
   there, up/down, inside/outside, left/right/middle, the, come/go/bring,
   pick up/drop/carry, good/bad/fast/slow, er/ed, if/will/so, like/love/want,
   pour/sit/put). 201 items, 173 exercises. Every lesson has >= 3 production
   exercises (order/translate/spell) so the existing 60% first-try mastery
   gate in renderDone() engages - a student cannot finish a lesson until they
   really know it. `student_route()` granular_seq updated: a0-home-words is
   route priority 0, other A0 academies shifted 1-5. Existing A0 students
   parked at a0-sentence-building were re-seated (migration does the guarded
   UPDATE, same pattern as 202608270001).

2. **Two-meaning (polysemy) explain cards** - the user's "on = على AND شغال"
   pattern applied to every multi-meaning starter word:
   - on (place vs working) - a0hw-08
   - like (زي comparison vs احب) - a0hw-19, its own lesson
   - so (ف result vs جدا) - a0hw-18
   - in (place vs time: in the morning) - a0hw-07
   - right (يمين vs صح) + left (يسار vs he left) - a0hw-12
   - her/his (after verb vs before owned thing) - a0hw-04
   - pick up (lift vs answer the phone) - a0hw-15
   Each card comes with at least one new exercise testing the second meaning.

3. **202609150002_hamza_cleanup.sql** - 121 guarded updates removing all
   remaining hamza (ء أ إ آ ؤ ئ) from lessons/lesson_items/lesson_exercises/
   assessment_questions/academies/programs/tracks, hand-reviewed word by word
   into Saudi home dialect. Verified: zero hamza in all public text columns.

4. **Dialect polish in frontend** (app.html, lib/pel_lesson_stage.js):
   - All 134 pronunciation tips rewritten: `مقطع واحد/مقطعين: X` -> `قول كذا: X`
     and `لا تقول: X` -> `مو كذا لانه غلط: X` (user request, screenshot).
   - Also fixed: كمل من حيث توقفت -> كمل من وين وقفت, الذي/التي -> اللي,
     يجب ان -> لازم, وانا كذلك -> وانا كمان.
   - DB had zero مقطع/لا تقول hits (checked), frontend was the only source.
   - node --check + both test suites pass (13 + 31).

### Verified end state
- student_route({"level":"a0"}) -> a0-home-words first
- 20 lessons / 20 academy links / >= 3 prod exercises each / zero hamza
- track_a0_home_words... `track-a0-foundations` sort_order -1 = first

### Next steps for a future session
- Same two-meaning treatment could be extended to the OLDER academies
  (a0-sentence-building, a0-question-words, etc.) - starter words there
  (is/are, what, where) also have multiple meanings; user has not asked yet.
- The `so`/`like`/`in`/`right`/`her`/`pick up` second meanings are taught -
  consider adding them to the A0 placement assessment if it gates on them.
- Old stale sections below (unmerged branches, Arabic gaps, hamza in
  frontend) were all resolved and verified earlier this session.

---

## ✅ DONE: Whole-app runtime smoke test (this session, round 3) - no new bugs found

Ran a live smoke test against the deployed GitHub Pages site (not local, since
the cloud browser can't reach the sandbox's localhost) after the two fix
rounds below. Checked: index.html, login.html, app.html (dashboard + lesson
reader + Speaking Studio, logged in as the test account), verify.html,
legal.html, admin.html.

For each page: console.error hook, window.onerror/unhandledrejection hook,
and a DOM walk for any visible `[object Object]` text outside `<script>`
tags. Result: **zero console errors, zero uncaught exceptions, zero visible
object-leak text on any page.** Confirmed both `2ffd3ae` (Lesson Tools strip)
and `b7ec67d` (admin toast escaping) fixes are live and working correctly in
production.

Also completed before the browser pass (all clean, no fixes needed):
static broken-asset-reference scan (0 real issues - flagged items were
template-literal/CSS-filter false positives), full RPC cross-check (all 17
`.rpc()` calls in app.html + admin.js match live DB function signatures,
including 10 not in tracked migration files but deployed via dashboard), and
a duplicate-function-declaration scan (0 real top-level collisions).

**Conclusion:** the low-hanging bug classes (Arabic-leak/XSS/RPC-mismatch/
duplicate-declaration) are exhausted for now. If more issues turn up, they'll
need either a specific user-reported screen/action to reproduce, or a
different bug class entirely (e.g. mobile viewport, RTL layout edge cases,
timing/race conditions under real network latency - none of which a static
scan or a single-viewport smoke test can catch).

## ✅ DONE: Fixed 2 confirmed "[object Object]" / raw text leaks in app.html (this session)

### Context
User reported seeing broken text in the app ("spam something" / "span") - a
follow-up to the earlier Bug A fix (commit 268711e) where the global
`function L(en,ar,translit){return {en,ar,translit}}` in app.html (an object
builder for roleplay script data) gets accidentally called from a scope with
no local Arabic-aware `L()`/`ar()` override, then concatenated directly into
a string. Since it returns an OBJECT not a string, this always renders the
literal text `[object Object]` (not actually a `<span>` leak this time, but
the same root-cause class of bug: wrong-scope `L()` call).

### Audit method
Wrote a one-off static scan (`python3` script, not committed - see this
breadcrumb for the approach if needed again) that:
1. Found every function boundary and every local `const L = (en, arTxt) => ...`
   override in app.html.
2. For each of the 326 `L(` call sites, checked whether a local override was
   in scope between the enclosing function start and the call.
3. Of those, flagged the subset where the result is used directly in string
   interpolation (`${L(...)}`, `'+L(...)+'`) rather than stored as an
   `{en,ar,translit}` object for later `.en`/`.ar` field access (the roleplay
   script data pattern, which is correct/intentional).

This found exactly 2 real bugs (all other 324 call sites are either safe
local-scope overrides or legitimate object-construction uses):

1. **`renderLessonReader()` line ~16372** - the Lesson Tools button strip
   (Pronunciation/Grammar/Vocabulary/Review/Listening/Reading/Writing/
   Speaking/Bookmarks) called `L(t.en,t.ar)` with no local override in scope,
   so every button label rendered as `[object Object]`. **Fixed**: inline
   scope-safe `_isAr` check (`accountPrefs`/`dir==='rtl'` with try/catch) +
   `escapeHtml()` on both the label and the `t.why` field.
2. **`renderSpeaking()` line ~17171** - `_micBtn.title = L(...)` on the
   "typing available" mic-fallback hint had the same bug, would set the
   title attribute to the literal string `[object Object]`. **Fixed**:
   inline ternary on `accountPrefs.lang==='ar'`.

### Verification done
- ✅ Extracted and syntax-checked all `<script>` blocks from app.html
  (`node --check`) - OK
- ✅ `node --check lib/pel_lesson_stage.js` - OK
- ✅ `node tests/test_buildsequence_iam.js` - 13/13 PASS
- ✅ `node tests/test_teaching_flow.js` - 31/31 PASS
- ✅ Regression grep confirms no remaining `.title = L(` or direct `+L(...)+`
  string-concat pattern anywhere in app.html
- ❌ NOT LIVE-TESTED in browser (user has not confirmed the exact screen/flow
  where they saw the broken text - these were the only 2 matches found by
  the static scan, but if the user still sees leaked text after this fix,
  it may be a different, not-yet-found location - ask for a screenshot or
  the exact screen/lesson/button next time)

### Follow-up audit (same session, broader scope)
Ran a second pass per user's "audit the app and fix debug it" request, scoped to
static-only checks (no browser, no DB) across the files NOT yet covered above:
`admin/admin.js`, `admin.html`, `index.html`, `legal.html`, `login.html`,
`verify.html`.

- **`admin/admin.js` has zero `L(` calls** - the earlier breadcrumb note below
  ("admin/admin.js (5 `L(` calls - not yet re-audited")) was a false positive
  from a loose grep match (it was matching `insertAdjacentHTML(`/`ObjectURL(`,
  not an actual `L(` call). Confirmed with a precise regex
  (`rg -P '(?<![\w$.])L\('`) - corrected here so nobody wastes time chasing it
  again.
- **`index.html`, `legal.html`, `login.html`, `verify.html`, `admin.html`**:
  no `L(` pattern present at all - these files use a different, simpler i18n
  approach (a local `setLang(el, ar, en)` helper that sets `.innerHTML`
  directly). Checked their innerHTML sites for injection risk: all content
  passed in is either static owner-authored marketing copy/FAQ text hardcoded
  in the file, or comes from `window.PEL_SITE` (a site-config object only the
  site owner edits via `pel-settings.js`, not user-submitted data). No fix
  needed here.
- **Found and fixed 1 real bug in `admin/admin.js`**: the `toast(msg, isErr)`
  helper (used for all admin-panel notifications) injected `msg` directly into
  `innerHTML` with no escaping. Several call sites pass `rpcErrMsg(r)` /
  `r.error.message`, which originates from Supabase RPC error responses -
  these are server-controlled but could reflect back user-supplied input in
  some error paths (e.g. a validation exception echoing a name/email a user
  typed). **Fixed**: wrapped `msg` in the existing `esc()` helper before
  injection. Verified all ~40 other `toast(...)` callers pass either `t(...)`
  translation keys or static strings, so this is a strict hardening with zero
  behavior change for the common case.
- Reviewed all ~22 `modal(title, body, ...)` call sites in `admin/admin.js`
  for the same class of bug - every DB-derived field passed into a modal body
  is already wrapped in `esc()`; titles are always `t(...)` or static
  strings. No fix needed.
- Verification: `node --check admin/admin.js` clean; re-ran the 44 existing
  tests (unaffected, unrelated files) - all still pass.

### Next steps (breadcrumb for next session)
1. **If user still reports broken/leaked text after this fix**: ask for a
   screenshot or the exact screen + steps to reproduce (which view, which
   button, English or Arabic mode) - the static scan covered `app.html`'s
   ~326 `L(` call sites and 2 known-bug files
   (`lib/pel_curriculum_path.js`, `lib/pel_dashboard_life.js` have their own
   correctly-scoped local `L()` per earlier audits) but did NOT cover:
   - `admin/admin.js` (5 `L(` calls - not yet re-audited this session)
   - `verify.html`, `index.html`, `login.html`, `legal.html` (few `L(` calls
     each, likely inline i18n patterns different from app.html's)
   - Runtime/DB-driven values (e.g. `question.ar` being null) rather than a
     scope bug - these were the subject of the *older* null-guard audits
     already documented further down this file
2. **Stale sections below**: everything from the "✅ DONE: Deep audit"
   heading downward predates this entry and may already be superseded -
   treat the 4 unmerged feature branches, admin-panel hamza cleanup, and
   Arabic-translation content gaps (AUDIT_REPORT.md: 419 vocab items missing
   `example_en`/`ar`, 30 choose + 126 order exercises missing Arabic) as the
   longest-standing genuinely-open items once this leak report is resolved.
3. **Standing workflow reminder**: usage/credits are limited per the user -
   batch reads, avoid speculative live-browser QA without a concrete repro,
   commit+push every finished fix immediately.

---

## ✅ DONE: Deep audit - 20 issues fixed (commit 70728d0)

### HIGH severity (2 fixed)
- **Bookmark XSS**: `escapeHtml()` applied to `b.label` and `b.sub` in
  `renderBookmarks()` - prevented stored XSS via DB-sourced lesson titles
- **Double-mark race condition**: `mark()` now guards against double-calling
  (prevents pronunciation "I said it" from overriding speech recognition score)

### MEDIUM severity (8 fixed)
- **Personalization guards**: `ACADEMY_LESSONS[u.academyId]` and
  `route[currentStage].units[0]` now have null fallbacks
- **Daily lesson timezone**: uses Asia/Riyadh local date instead of UTC
  (was rotating at 3 AM Saudi time instead of midnight)
- **restoreActivityDOM**: activity index check prevents cross-activity restoration
- **markLessonComplete**: rolls back local state on RPC failure
- **openLesson**: checks if lesson is locked (prevents deep-link bypass)
- **renderBookmarks**: removeEventListener before addEventListener
- **speak()**: double-callback guard (onend + onerror in Chrome)
- **Assessment esc()**: escapes single quotes; open() clears stale timer

### LOW severity (10 fixed)
- estimateDuration meta.d guard, onboardClose null check, countUp
  re-animation, guided_production empty guard, levelInfo bounds,
  c_rpc_effective_state error handling, credits interval cleared on
  signOut, mastery gate comment, SRS interval documented

### Also fixed in this session
- **Standalone hamza (ء)**: 54 replacements (قراءة→قرايه, شيء→شي, etc.)
- **Incorrect word**: "اسيلة"→"اساله" (from hamza cleanup of اسئله)
- **Em dashes**: 145 replaced with hyphens
- **Empty catch blocks**: 9 critical ones now log console.warn
- **Console.error**: 7 replaced with console.warn
- **Supabase credentials**: centralized to lib/pel_config.js
- **Duplicate RPC**: refreshCredits + loadOverview now share cache
- **data-goto**: standardized to data-goto-view in curriculum_path.js

---

## ✅ DONE: Comprehensive audit fixes (commit f8ffd81)

### Critical bugs fixed
1. **Duplicate `studentName` i18n key** - was defined 3x in admin.js, last def
   won (showed "Student" instead of "Full name" on create-student form).
   Renamed reports key to `studentCol`, removed duplicate.
2. **Missing audit trail** in `openCreateStudent()` - added `audit()` call after
   successful RPC, restoring accountability lost during merge.
3. **Permission inconsistency** - standardized all student mutations to
   `students.manage` (was split across `students.manage` + `students.write`).

### Dead code removed
- `createStudentModal()` (already removed in prior commit)
- `renderStatStories()` call + function (already removed in prior commit)
- 3 dead `setRing()` calls for removed progress rings (already done)
- `quickActions` and `qaGrid` empty stubs
- `renderDailyGrid()` empty function + all callers (including 3 commented-out)
- `dailyGrid` null constant
- Duplicate `studentName` i18n definition

### Minor fixes
- Arabic typo: `القراوة` → `القراءة` (Reading Corner) in 4 locations
- Auto-advance timer now clears on `Stage.close()` (prevents detached DOM fire)
- Credit refresh `setInterval` skips when tab hidden (`document.hidden`)
- CSS hover states added for `pel-tool-link` buttons

### Feature branches merged
- `feat/admin-create-student` (commit 28d2692) - admin can create student accounts
- `fix/lesson-engine-phase1` (commit a7429e5) - CEFR Duolingo-style nesting,
  speech scoring, study tools in lessons
- `fix/client-academy-resolver` - already contained in main (0 commits ahead)
- `fix/server-plan-profile` - already contained in main (0 commits ahead)

### Arabic translations completed (commit 974ead7)
- 30 choose exercises + 126 order exercises now have Arabic translations
- All 1,255 lesson_exercises have Arabic translations (0 missing)

### Audit items NOT yet fixed (lower priority)
- `liveClasses` view relies on MutationObserver instead of viewRenderer (works
  but fragile - brief blank flash on navigation)
- `comingSoonCopy` entries for views that now have renderers (dead code, harmless)
- 120 empty catch blocks across codebase (would need individual review)
- Fire-and-forget SRS upserts with no error visibility
- Duplicate `student_live_class_overview` RPC calls (refreshCredits + loadOverview)
- 7 `console.error` statements in production code
- Hardcoded Supabase URL/anon key in 5 locations (centralize to single config)
- `data-goto` vs `data-goto-view` naming inconsistency in curriculum_path.js
- 10,858 lines with hamza characters (large cleanup, Saudi dialect preference)
- 24 em dashes in code comments (not user-facing, harmless)

---

## ✅ DONE: Home page consolidation + lesson tool integration (commits dc329c6, 76e8007, 035e135)

### Duplicate CTA fix (commit dc329c6)
- **Problem**: Home page showed two cards with "Start Lesson" buttons - the hero
  card (welcome/first lesson) AND the continue learning card (lesson path).
  Both had 0% progress rings. This happened because `renderActivePath()` ran
  after `renderContinueLearning()`, leaving the hero card populated with
  first-time text while the continue learning card showed the lesson path.
- **Fix**: When `renderActivePath()` returns true, it now hides the hero card.
  When it returns false, `renderContinueLearning()` shows the hero card as the
  primary CTA. Added `continueLearningLabel` ID to toggle the section header.

### Scattered tools removed from home page (commit 76e8007)
- **Removed**: Daily Experience grid (8 tiles linking to Vocabulary, Pronunciation,
  Speaking, Grammar, Writing) and Quick Actions grid (7 tiles with duplicate
  navigation). Also removed 4 redundant progress rings (Overall/Today/Weekly/
  Monthly - duplicated the hero card ring and continue learning progress bar).
  Removed statStories section.
- **Kept**: Hero card (primary CTA), announcements+live classes, smart review
  strip (contextual), continue learning card (lesson path), progress stats
  (streak/lessons/hours/review days), skill bars, level block.
- Tools (Vocabulary Vault, Smart Review, Grammar Academy, Writing Workshop) are
  still accessible via sidebar navigation.

### Contextual tool links in lesson completion (commit 035e135)
- Added three contextual tool buttons to the lesson completion screen:
  - "Review words" → Smart Review (spaced repetition)
  - "Vocabulary" → Vocabulary Vault
  - "Grammar" → Grammar Academy
- Students now discover tools naturally after finishing a lesson, instead of
  having to find them scattered on the home page.
- Cache buster updated: `pel_lesson_stage.js?v=97574306`

### Verification status
- All 44 tests pass (13 buildsequence + 31 teaching flow)
- NOT YET LIVE-TESTED in browser: duplicate CTA fix, home page consolidation,
  lesson completion tool links

### Breadcrumbs for next session
1. **Live-test all changes in browser**: Load `app.html?fresh=<timestamp>`,
   log in, verify:
   - Only ONE lesson CTA card shows (not two)
   - Home page is shorter (no Daily Experience or Quick Actions grids)
   - Progress section has stats but no rings
   - Complete a lesson → see Review/Vocabulary/Grammar tool links
2. **Remaining Arabic translation gaps** (from previous session):
   - 30 choose exercises with English-only questions
   - 126 order exercises with English-only prompts (pattern: "Build it: [sentence]"
     → Arabic: "رتب: [sentence_ar]")
3. **Merge 4 feature branches** (still deferred):
   - `feat/admin-create-student` - conflicts in admin/admin.js
   - `fix/client-academy-resolver` - fail-closed route guard
   - `fix/lesson-engine-phase1` - study tools + speech scoring
   - `fix/server-plan-profile` - true-zero placement track
4. **Admin panel hamza cleanup** (622 lines, low priority)
5. **Consider**: Moving Smart Review, Vocabulary, and Grammar tools even deeper
   into the lesson flow (e.g., vocabulary cards in lessons could link directly
   to the Vocabulary Vault for that word)

---

## ✅ DONE: escapeHtml TypeError fix + auth_rate_limit migration + Arabic question split (this session)

### Bug: escapeHtml crash on non-string input (FIXED)
`escapeHtml()` in app.html used `(s||'')` which returns the value as-is when
truthy. If `s` was a number (e.g., a duration like `15`), `.replace()` failed
with `TypeError: (s || "").replace is not a function`. This crashed the app at
boot via `renderContinueLearning` -> `clearStudentState` -> `loadStudentState`
-> `revealApp`.

**Fix**: Changed `(s||'')` to `String(s==null?'':s)` - coerces numbers,
booleans, and objects to string. `null`/`undefined` become empty string.
All other `esc()` functions in the codebase already used this pattern.

### Migration: auth_rate_limit.sql applied
The `auth_attempts` table (for server-side login rate limiting) was missing
from the DB. Applied the migration - table + index + RLS now exist.

### Migration: 202609130001_fix_embedded_arabic_questions.sql applied
Audited all 1,255 lesson_exercises for missing Arabic translations:

| Type | Total | Missing Arabic (before) | Missing Arabic (after) | Fixed |
|------|-------|------------------------|------------------------|-------|
| choose | 514 | 166 | 30 | 136 |
| correct | 105 | 5 | 0 | 5 |
| order | 317 | 126 | 126 | 0 (needs translation) |
| spell | 29 | 0 | 0 | - |
| translate | 290 | 0 | 0 | - |

**Choose fix**: 136 exercises had Arabic text embedded in `question.en`
(bilingual format: `"Arabic text، English text"`). Split on Arabic comma (U+060C)
into `question.ar` + `question.en`. Verified split quality on 10 samples - all
correct.

**Correct fix**: 5 grammar correction exercises were missing `why_ar` AND
`why_en`. Added Arabic grammar explanations + English explanations +
transliteration for all 5 (ids: 1556, 1561, 1566, 1571, 1576).

### Remaining Arabic gaps (content work - needs human/LLM translation)
- **30 choose exercises** with English-only questions (no embedded Arabic)
- **126 order exercises** with English-only prompts (e.g., `"Build it: I am ready."`)
  - Pattern: `"Build it: [sentence]"` -> Arabic: `"رتب: [sentence_ar]"`
  - Pattern: `"Build the question: [sentence]"` -> Arabic: `"رتب السوال: [sentence_ar]"`
  - These need the sentence translated to Arabic, not just the prompt prefix

### Verification status
- All 44 tests pass (13 buildsequence + 31 teaching flow)
- DB audit confirmed: 136 choose + 5 correct exercises fixed
- escapeHtml fix prevents crash for ANY non-string input

---

## ✅ DONE: App.html null-guard sweep + hamza/em dash cleanup (commits b8cf4c5, 758db0b, d05ada1, 83a4865, cea570f)

### Lesson view rendering hardened (commit b8cf4c5)
Added `escapeHtml()` + `||''` null guards to ALL user-facing template literals in
the lesson view rendering section of app.html:
- Lesson header: lesson.ar, lesson.title, lesson.translit
- Vocabulary cards: v.ar, v.en, v.translit, data-speak
- DB notes: n.en, n.ar
- Grammar section: title, rule, saudi, wrong, right, data-speak
- Conversation bubbles: c.ar, c.en, c.translit, data-speak
- Situation blocks (hear/say/recover): h.ar, h.en, h.translit, data-speak
- Next lesson: nextItem.en
- Academy headers: academy.ar, academy.en
- Lesson nav sidebar: l.en
- Vocab flashcards: v.en, v.ar, v.category, v.synonyms, v.antonyms, v.collocations,
  v.tip, v.example.en/ar/translit, wordKey, data-speak
- Search results: l.en/ar, v.en/ar labels
- Sidebar items: item.ar, item.en, item.icon
- Coming soon copy: copy.ar
- Word of the day: word.en/ar/translit

### renderQuiz + triplet null guards (commit 758db0b)
- `renderQuiz()`: Now properly escapes q.qEn/qAr/qTr, falls back to escaped q.q
  This was the ORIGINAL null bug the user reported - now properly fixed at the
  source function level, not just in individual renderers.
- `triplet()`: Added null guards + escapeHtml on all three fields (en, ar, translit)

### Hamza + em dash cleanup in UI labels (commit d05ada1)
- pel_lesson_stage.js: stripped hamzas from ALL UI labels:
  - 'Start practicing' label
  - 'Production (first try)' / 'Almost there' screen
  - 'Mic error' label (2 occurrences)
  - 'Read and understand' prompt
  - 'Dictation' / 'Examples' type labels
  - 'Read the rule' / 'See examples' prompts
- app.html: null-guarded academyCardHTML (a.from/to/icon/cat/translit/progress/difficulty/duration/lessons)
- admin/admin.js: removed em dash from recVsProdHint
- lib/cert-sheet.js: replaced em dashes with hyphens in date/cert placeholders
- Remaining hamzas in lib/pel_lesson_stage.js are only in lesson DATA (vocab
  examples, pronunciation engine) - NOT in UI labels. Per user instruction,
  existing lesson data should NOT be "corrected".

### Remaining app.html null guards (commits 83a4865, cea570f)
- Pronunciation drill card: drill.ar, drill.focusAr, tgt.ar, tgt.en, translit
- Pronunciation completion: drill.ar
- Pronunciation topic words: w.en, w.ar, translit, data-speak
- Drill select dropdown: d.title, d.ar
- Daily items: lesson.title, ac.ar/en, phrase.example.en/ar, word fields
- Sidebar group labels: group.label.ar/en
- Profile: inProgress.ar/en/progress, firstObj.ar/title/duration
- Profile level chip: levelInfo().ar
- Profile lesson chip: inProgress.ar/en
- Profile stat pills: s.ar, s.l
- Skill scores: s.en, s.ar
- Profile favorites: v.en, v.ar
- Profile notes: n.text
- Notifications: n.ar, n.en
- Continue learning: inProgress.en (chip)
- Hero level chip: levelInfo().ar/en
- Roadmap done/upcoming/next: a.en/ar, c.en/ar
- Plan settings frequency options: f.en/ar
- Quick win recommendation: cat.ar/en, weak.ar/key, inProgress.ar/en/progress
- Skill status chip: st.en/ar
- Stat stories: s.ar/en

**ALL user-facing .en/.ar accesses in app.html are now escapeHtml-guarded.**

### Additional fixes (commits 174493e, 42fe85b, 484407f)
- lesson.summary, lesson.takeaway, v.tip: escapeHtml + null guards
- nextItem.ar: escapeHtml
- renderFocusCard: rec.ctaAr/ctaEn/view escaped
- setHomeSubtitle: function-level escapeHtml for ar/en params
- estChip (nextObj.duration): escaped
- setHomeSubtitle calls: all callers now pass escaped values
- dbToLesson quiz construction: qEn/qAr/qtr escaped via escapeHtml (XSS fix)
- renderDbPractice order tokens: esc(t) added (XSS fix)

**Full audit complete: all user-facing template literals in app.html, lib/pel_lesson_stage.js, admin/admin.js, and lib/cert-sheet.js are now escapeHtml-guarded or use esc()/textContent.**

## NEXT: Live testing + remaining work

### 1. Live-test all fixes in browser
- Load `app.html?fresh=<timestamp>`, log in
- Open a lesson, verify no crashes on any activity type
- Check pronunciation drills, daily quiz, profile, vocabulary cards
- Verify no "null" or "undefined" appears anywhere in the UI
- Test with incomplete DB data (e.g., a lesson missing vocab)

### 2. Admin panel hamza cleanup (622 lines with hamzas)
- admin/admin.js has 622 lines with hamza characters in Arabic labels
- These are MSA/formal Arabic (e.g., "الادارة", "الموسسة")
- User said "literally anywhere in the app" - may need to address admin panel too
- LOW PRIORITY: admin panel is for teachers, not students

### 3. Merge feature branches (deferred)
- `feat/admin-create-student` - conflicts in admin/admin.js
- `fix/lesson-engine-phase1` - conflicts in app.html

### 4. DB quiz questions: ensure all DB choose exercises have Arabic translations

### 5. Teaching methods review
teach-before-test is at curriculum level (concept → concept_examples → learn → learn_sentence → practice).
Consider whether additional in-activity teaching hints are needed.

---

### Welcome screen null guards (commit 6b253b8)
- Added `escapeHtml` + `||''` to resume text rendering
- Added `||''` fallbacks to `setHomeSubtitle` calls

### Verification status
- ✅ `node --check lib/pel_lesson_stage.js` - syntax OK
- ✅ `node tests/test_buildsequence_iam.js` - 13/13 PASS
- ✅ `node tests/test_teaching_flow.js` - 31/31 PASS
- ✅ All commits pushed to main

### Commits this session
| Commit | Description |
|--------|-------------|
| `33680b9` | fix: null-guard all activity renderers against TypeError crashes |
| `b990413` | fix: null-guard dbToLesson quiz construction and renderDbPractice |
| `f6df47b` | fix: remove em dashes from user-facing text, fix ReferenceError in dbx-pick |
| `6b253b8` | fix: add escapeHtml + null guards to welcome screen text rendering |

### What still needs attention (breadcrumbs for next session)
1. **Live-test all fixes in browser** - load `app.html?fresh=<timestamp>`, log in,
   open a lesson, verify no crashes on any activity type
2. **Unguarded `.en`/`.ar` in app.html template literals** - ~30 locations in
   lesson view rendering (lines 15878, 16220, 16318, 16331, 16349, 16371, 16404-16406,
   16440, 16447, 16519-16533, 16811) where `v.en`, `v.ar`, `academy.ar`, `lesson.ar`,
   `h.ar`, `h.en` are used without `||''` or `escapeHtml`. Low risk (data is
   typically well-structured) but could show "undefined" if data is incomplete.
3. **Merge feature branches** (still deferred):
   - `feat/admin-create-student` - conflicts in `admin/admin.js`
   - `fix/lesson-engine-phase1` - conflicts in `app.html`
4. **DB quiz questions**: ensure all DB choose exercises have Arabic translations
5. **Teaching methods review**: the teach-before-test pattern is implemented at
   curriculum level (concept → concept_examples → learn → learn_sentence → practice).
   Consider whether additional in-activity teaching hints are needed.

---

## ✅ DONE: Teach-before-test + null bug fix + auto-advance (previous session)

### Audit round 2: Enhanced teaching panel + renderer fixes

#### Audit round 3: Expanded Arabic grammar connection notes
Expanded `connectionNoteFor()` from 5 to 24 grammar patterns covering all
beginner lesson topics:
1. There is / There are (existence)
2. Present continuous (am/is/are + -ing)
3. Present perfect (have/has + past participle)
4. Going to (future plans)
5. Will (future)
6. Can / can't (ability)
7. Have / has (possession)
8. Would like (polite requests)
9. Could you / Would you mind (polite requests)
10. How much / How many (countable/uncountable)
11. WH- question words (what/where/when/who/why/how)
12. Comparatives (-er than / more... than)
13. Demonstrative pronouns (this/that/these/those)
14. Articles (a/an/the)
15. Possessive adjectives (my/your/his/her/our/their)
16. Prepositions (in/on/at)
17. So do I / Neither do I (agreement)
18. It is + adjective (weather/descriptions)
19. Present tense to be (am/is/are)
20. Past tense to be (was/were)
21. Present simple (verb + s)
22. Questions with do/does
23. Negation with don't/doesn't
24. Imperatives (commands)

Each note explains the pattern in Saudi Arabic with examples and the sentence
structure (النمط). Patterns are ordered from most specific to most general
to avoid false matches (e.g., "there is" before "am/is/are").

#### choose_natural_expression renderer fixed
Was rendering raw `q.q` HTML (which included inline Arabic/translit divs from
`dbToLesson`). Now renders `q.qEn`/`q.qAr`/`q.qTr` explicitly with proper
escaping - no more raw HTML injection, no more "null".

#### Teaching panel enhanced with sentence + connection notes
- **Sentence/Question section**: Shows the full English sentence/question with
  transliteration and Arabic translation (from `extractActivitySentence()`)
- **How words connect section**: Arabic grammar explanation via
  `connectionNoteFor()` with pattern detection for:
  - Demonstrative pronouns (this/that/these/those = ذس/ذات/ذيز/ذوز)
  - Present tense to be (am/is/are)
  - Past tense to be (was/were)
  - Present simple (verb + s)
  - Questions with do/does

#### Unguarded field fixes in learn + learn_sentence renderers
- `learn` renderer: `it.translit`, `it.ar`, `it.example.*` now conditionally
  rendered (no empty divs when fields are null/missing)
- `learn_sentence` renderer: `s.translit`, `s.ar` now conditionally rendered

### Original fixes (round 1)

### Bug: "null" in choose_natural_expression question (FIXED)
`dbToLesson()` in `app.html` concatenated `x.payload.question.ar` directly into
HTML. When the DB quiz question had no Arabic translation, it rendered the
literal string "null". Fixed by guarding with `(qAr ? ... : '')`. Also added
`qEn`, `qAr`, `qTr` fields to the quiz object so the teaching panel can show
the question text with Arabic translation and transliteration.

### Feature: Teach-before-test panel (ADDED)
Every practice activity now shows a **teaching panel** first, with:
- Key vocabulary from the current activity (English + translit + Arabic)
- Additional lesson vocabulary (up to 5 words)
- Grammar rules (Saudi Arabic explanation + English rule + DB notes)
- Audio button to hear the key words
- "Start practicing" button that reveals the actual activity

The panel appears once per activity (tracked via `act._taught` flag). Teaching
activities (concept, concept_examples, learn, learn_sentence) do NOT get the
panel - they ARE the teaching. On retry (wrong answer → Try again), the panel
is skipped because `act._taught` is already true.

New functions in `lib/pel_lesson_stage.js`:
- `TEACH_BEFORE` - set of activity types that get the teaching panel
- `extractActivityVocab(act)` - extracts vocabulary from any activity type
- `buildTeachHtml(act)` - builds the teaching panel HTML

`Stage.render()` modified: if the activity is a practice type and hasn't been
taught yet, it renders the teaching panel first. When the student clicks
"Start practicing", the actual renderer is called.

### Feature: Auto-advance after lesson completion (ADDED)
`renderDone()` now auto-advances to the next lesson after a 5-second countdown.
The countdown is shown on the completion screen and cancels on any click.

### Verification status
- ✅ `node --check lib/pel_lesson_stage.js` - syntax OK
- ✅ `node tests/test_buildsequence_iam.js` - 13/13 PASS
- ✅ `node tests/test_teaching_flow.js` - 31/31 PASS
- ✅ Cache buster: `?v=87cec61d`
- ❌ NOT YET LIVE-TESTED: teaching panel rendering in browser
- ❌ NOT YET LIVE-TESTED: auto-advance after completion
- ❌ NOT YET LIVE-TESTED: null bug fix (choose_natural_expression with null ar)

### Clean test procedure
1. Load `app.html?fresh=<timestamp>` (GitHub Pages caches for 10 min)
2. Log in (testmail1@gmail.com / namas123)
3. Open a lesson with quiz questions (e.g., Past Simple → Was and Were)
4. Advance to `choose_natural_expression` activity
5. Verify: NO "null" text appears; Arabic translation shows if available
6. Verify: teaching panel appears before EVERY practice activity
7. Verify: teaching panel shows vocabulary with Arabic + translit
8. Verify: "Start practicing" button reveals the actual activity
9. Complete all activities → verify auto-advance countdown appears
10. Verify: clicking any button cancels the auto-advance

### Standing TODO
- **Merge feature branches** (deferred - focus was on bug fixes):
  - `feat/admin-create-student` - conflicts in `admin/admin.js`
  - `fix/lesson-engine-phase1` - conflicts in `app.html`
- **Live-test** all three fixes in browser
- **DB quiz questions**: ensure all DB choose exercises have Arabic translations
  (the null bug occurred because `question.ar` was null in the DB)
- Consider adding grammar-specific Arabic teaching content (e.g., demonstrative
  pronouns: this/that/these/those = ذس/ذات/ذيز/ذوز for near/far, singular/plural)

---

## ✅ DONE: v2 session persistence blockers 1-4 fixed (commit `268711e`)

### Blocker 1: Unstable answer keys - FIXED
Added stable `data-choice-key` attributes to ALL 9 multiple-choice renderers:
recognize, identify_heard, challenge, fill_blank, conversation_response,
complete_dialogue, choose_natural_expression, guided_production, db_correct.
Vocab-object renderers key on `o.en`; string renderers key on the string itself.
`captureActivityDOM()` and `restoreActivityDOM()` now use a `choiceKey()` helper
that prefers `data-choice-key` then text content - never `data-i` (unstable index).

### Blocker 2: Ledger merging - FIXED
`saveStageSession()` now loads the existing saved session and merges into the
existing `acts` map instead of rebuilding from scratch. Stale DOM-state keys
(selected, typed, correctOpts, wrongOpts, checked, correct, etc.) are cleaned
for the current activity before merging, so a re-render (Try again) doesn't
leave ghost highlights. Previous activities' state is preserved.

### Blocker 3: Closure state not updated on restore - FIXED
All 9 check handlers now read `sel` from the DOM at check time instead of
relying on closure variables. Index-based renderers use
`[...btns].indexOf(selectedBtn)`; text-based renderers use `textContent.trim()`;
db_correct uses `dataset.ok`. `restoreActivityDOM()` now enables the Check
button when selections/typed text are restored (pre-check state) and dispatches
an `input` event for typed-input renderers so their validation fires.

### Blocker 4: correctOpts not captured - FIXED (consequence of Blockers 1+2)
The merge in `saveStageSession()` preserves `correctOpts` captured by `mark()`'s
synchronous save, even when the throttled 500ms save fires after a re-render.
Stable `data-choice-key` ensures restore matches the correct option across shuffles.

### BONUS BUG FIXES (same commit)

#### Bug A: L() breaks HTML attributes in Arabic mode - CRITICAL FIX
`L()` returns `<span class="arabic">...</span>` in Arabic mode. When used inside
HTML attributes (placeholder, data-ph), the `"` in `class="arabic"` closes the
attribute, leaking raw HTML into the page. This broke spell, translate,
grammar_correction, listening_dictation, free_response, db_spell, db_translate
inputs, and arrange_words/db_order drop zones. Added `Lt()` text-only helper
and replaced all 9 attribute usages.

#### Bug B: fill_blank shows no sentence context - FIXED
When `fbItem.sentences` is empty, the fallback was `{en: fbItem.en}` (just the
word). Now falls back to `fbItem.example` first. Renderer also falls back to
`it.example.en` if the sentence has no `.en`.

#### Bug C: iPad/tablet responsive - IMPROVED
Added `@media(max-width:900px)` breakpoint for tablet sizes with adjusted
padding, conversation line width, and font sizes.

### Verification status
- ✅ `node --check lib/pel_lesson_stage.js` - syntax OK
- ✅ `node tests/test_buildsequence_iam.js` - 13/13 PASS
- ✅ Cache buster run - `app.html` updated to `?v=4d175721`
- ❌ NOT YET LIVE-TESTED: selection restore after reload (needs browser test)
- ❌ NOT YET LIVE-TESTED: correctOpts restore after reload
- ❌ NOT YET LIVE-TESTED: Arabic mode L() fix (needs browser test in Arabic)
- ❌ NOT YET LIVE-TESTED: iPad/tablet responsive

### Clean test procedure (MUST follow before testing v2 restore)
1. `export SUPABASE_PAT=sbp_... && python3 tools/sql.py "DELETE FROM student_data WHERE key='pel_stage_pos' AND user_id='1d68ead7-7ef4-407a-9138-a171fa693272'"`
2. Load `app.html?clean=<timestamp>` in browser
3. `localStorage.removeItem('pel_stage_pos')` in console
4. Log in (testmail1@gmail.com / namas123), open lesson, advance to recognize
5. Verify: `Stage.state.checked === false`, button says "Check", feedback empty
6. Select correct option, click Check
7. Verify saved: `JSON.parse(localStorage.getItem('pel_stage_pos'))?.acts?.['3']?.correctOpts`
8. Reload - verify selection + correct highlight restored
9. In Arabic mode: verify no HTML leaks in input placeholders

### DONE: Expanded pronunciation + flow fixes + regression tests (commit `d3abc33`)

#### Bug G: Fake dialogue - FIXED (commit `85f1352`)
#### Bug H: Substring matching - FIXED (commit `85f1352`)
#### Feature I: Pronunciation hints v1 - ADDED (commit `7d17bb8`)
#### Feature J: Teach-before-practice - ADDED (commit `7d17bb8`)
#### Feature K: Challenge/review taught items only - ADDED (commit `7d17bb8`)

#### Feature I-v2: Expanded pronunciation hints (this commit)
- Expanded from 22 to ~50 trap words covering: TH sounds, P vs B, V vs F,
  consonant clusters (sp/st/sk/sm/str), CH sound, diphthongs, R/L clusters,
  silent letters (kn/wr/wh/h), multi-syllable traps.
- Fixed `those`: now uses ذوز (voiced TH) not دوز (D).
- Added pattern-based fallbacks for words not in exact map:
  - STR cluster, generic s+stop clusters, ph→F, silent kn, silent wr, -tion→شن
  - STR pattern placed before generic s+stop for better matching.
- pronunciationHint() now accepts item objects (supports future DB fields:
  pron_hint_ar, avoid_ar, beats) - DB-authored hints override hardcoded map.
- Callers pass `it` (object) not `it.en` (string) so DB fields work.

#### Feature J-v2: Improved teaching flow (this commit)
- concept_examples pool expanded: now includes DB sentence items + vocab
  examples + DB exercise target sentences (order/translate answers).
- concept_examples dead-click fixed: last example advances immediately.
- match activity now uses taughtItems only (was using ALL items).
- `pronunciationHint` exported from factory for testing.

#### Regression tests added (tests/test_teaching_flow.js)
31 checks covering:
- pronunciationHint: tired, three, those (ذوز not دوز), DB field override,
  pattern fallbacks (school, photo, know), no false positives (cat)
- Teaching flow: concept_examples before practice, learn before practice,
  match uses taught items, fake dialogue filtered, vocab-only skips
  production activities, challenge/review use taught items

#### Advisor fixes (this commit - follow-up to d3abc33)
- Removed `live` (heteronym: verb /lɪv/ vs adjective /laɪv/) from PRON_HINTS
- concept_examples pool now deduplicates by normalized English text
- concept_examples pool now includes `correct` exercise right answers
- exercise-derived examples only added if they have Arabic translation
- concept_examples renderer suppresses empty Arabic/translit reveal rows
- DB pronunciation fields (pron_hint_ar, avoid_ar, beats) now carried through
  dbToLesson (app.html) and buildItems (pel_lesson_stage.js)

### Verification status (updated)
- ✅ `node --check` - syntax OK
- ✅ `node tests/test_buildsequence_iam.js` - 13/13 PASS
- ✅ `node tests/test_teaching_flow.js` - 31/31 PASS
- ❌ NOT YET LIVE-TESTED: pronunciation hints rendering
- ❌ NOT YET LIVE-TESTED: concept_examples activity
- ❌ NOT YET LIVE-TESTED: match using taughtItems

### Teaching flow (final)
1. concept (rule)
2. concept_examples (real sentences from unified pool)
3. learn (word + meaning + pronunciation hint)
4. learn_sentence (word in context)
5. recognize (MC quiz - taught items only)
6. match (taught items only)
7. arrange_words / db_order
8. fill_blank
9. spell / db_spell
10. translate / db_translate
11. listen + identify_heard
12. listening_dictation
13. pronunciation (+ pronunciation hint)
14. speaking
15. conversation_response (real dialogues only)
16. complete_dialogue (real dialogues only)
17. grammar_correction / db_correct
18. choose_natural_expression
19. guided_production
20. free_response
21. review (taught items only)
22. challenge (taught items only)

## ✅ DONE: v1 stage position persistence (commits `cdcacbb`, `9bee3ee`)

Saves `{a:academyId, l:lessonId, i:idx, ts}` to localStorage + Supabase `student_data`.
Restores position on reload. LIVE-TESTED: advanced 3 activities, reloaded, resumed at 3/19.
DB sync confirmed. Cleared on lesson completion and logout.

## ✅ SHIPPED (NOT FULLY VERIFIED): v2 full per-activity session persistence

Commits: `dbc94d8`, `fa7c7db`, `052bfe4` (all pushed to main).

### What v2 does
Upgrades `pel_stage_pos` from cursor-only (v1) to full session save/restore (v2):
- `saveStageSession()` saves position + stats + per-activity interaction state
- `captureActivityDOM()` scans the stage for selections, typed text, reveals,
  played state, ordered tokens, matched pairs, correct/wrong highlights
- `applySavedSession()` restores stats + per-activity flags (counted/okTracked)
  WITHOUT calling mark() so the mastery gate stays honest
- `restoreActivityDOM()` re-selects options, fills inputs, shows feedback + button
- Delegated click+input listener on stage body saves on EVERY interaction
  (throttled 500ms to avoid spamming DB)
- Backward compatible: v1 sessions load fine (no acts/stats)

### What IS verified working (live-tested 2026-09-12)
- ✅ Position restore across reload (idx=3 → reload → idx=3)
- ✅ Stats restore (recTotal=1, recOk=1 preserved - mastery gate integrity)
- ✅ Per-activity flags restore (counted=true, okTracked=true)
- ✅ Feedback + button restore ("✓ Correct" + "Continue" painted without mark())
- ✅ DB sync confirmed (student_data has pel_stage_pos with v:2 format)
- ✅ v2 save captures: checked, correct, selected (data-i), counted, okTracked, stats
- ✅ 13/13 tests pass, syntax OK

### ❌ BLOCKERS - next AI must fix these in order

#### Blocker 1: Unstable answer keys (CRITICAL)
**Problem**: `captureActivityDOM()` captures selected options by `data-i` (the option
index). But option order is SHUFFLED on every render. So `selected:["0"]` on one
load might restore the WRONG option on the next load.

**Fix**: Add stable `data-choice-key` attributes to option buttons in each renderer.
For `recognize`: `data-choice-key="${esc(o.en)}"` (the English word is stable).
Apply to all multiple-choice renderers: recognize, challenge, identify_heard,
choose_natural_expression, conversation_response, complete_dialogue, db_correct.
Then update `captureActivityDOM()` and `restoreActivityDOM()` to use
`data-choice-key` instead of `data-i`.

#### Blocker 2: Ledger merging drops previous activity state
**Problem**: `saveStageSession()` rebuilds `acts = {}` from scratch every save.
It captures the CURRENT activity's DOM state + per-activity flags from `s.seq`.
But if activity 3 had a saved `correctOpts` and the student is now on activity 4,
the save drops activity 3's `correctOpts` (only keeps `counted`/`okTracked`).

**Fix**: Load the existing saved session, merge the new capture into the existing
`acts` map (don't rebuild from scratch). Only patch the current activity's DOM
state + update counted/okTracked flags for all activities.

#### Blocker 3: Pre-check restore doesn't update renderer closure state
**Problem**: Adding `.selected` class via `restoreActivityDOM()` visually highlights
the option, but renderers like `recognize` store the selection in a closure variable
(`sel`). After restore, clicking Check may still behave as if nothing is selected
because `sel` is null.

**Fix options**:
A. Refactor Check handlers to read `inner.querySelector('.pel-option.selected')`
   at check time instead of relying on closure variables.
B. OR: Implement renderer-specific restore that sets the closure variable.
Option A is cleaner - search for `sel=` in each renderer and replace with
DOM lookup.

#### Blocker 4: correctOpts not captured (debug needed)
**Problem**: When the student checks a correct answer, the recognize renderer adds
`.correct` class to the right option BEFORE calling `mark()`. The `saveStageSession()`
inside `mark()` calls `captureActivityDOM()` which should find `.pel-option.correct`
elements. But the saved data has `checked:true, correct:true` but NO `correctOpts`.

**Debug steps** (MUST use clean state - see below):
1. SQL delete: `DELETE FROM student_data WHERE key='pel_stage_pos' AND user_id='1d68ead7-7ef4-407a-9138-a171fa693272'`
2. Clear localStorage: `localStorage.removeItem('pel_stage_pos')`
3. Load `app.html?clean=<timestamp>` (cache-busting URL)
4. Log in, open lesson, advance to recognize (4/19)
5. Verify fresh state: `Stage.state.checked === false`, button says "Check",
   feedback is empty (no "✓ Correct")
6. Select correct option, click Check
7. Check DOM: does `.pel-option.correct` exist?
8. Check saved: does `acts['3'].correctOpts` exist?
9. If DOM has `.correct` but saved lacks `correctOpts` → fix capture timing/selector
10. If DOM has no `.correct` → the check handler didn't run (Check click issue)

**Possible cause**: The throttled save (500ms after click) might fire AFTER the
renderer re-renders (e.g., on "Try again"), clearing the `.correct` class.
Or the `.correct` selector in `captureActivityDOM()` doesn't match the actual
class name used by the renderer.

**Debug snippet** (run in browser console after selecting + checking):
```javascript
const stage = document.getElementById('pelLessonStage');
const s = window.PEL_LESSON_STAGE.state;
const idx = s.idx;
const opt = [...stage.querySelectorAll('.pel-option')].find(el => el.textContent.trim() === 'كان');
opt.click();
const btn = stage.querySelector('#pelStgBtn');
btn.click();
const afterCheck = {
  checked: s.checked, correct: s.correct,
  stats: { recTotal: s.recTotal, recOk: s.recOk },
  options: [...stage.querySelectorAll('.pel-option')].map(el => ({
    text: el.textContent.trim().slice(0,30), cls: el.className, i: el.dataset.i
  })),
  saved: JSON.parse(localStorage.getItem('pel_stage_pos'))?.acts?.[String(idx)],
};
return afterCheck;
```
Interpretation:
- `checked: false` → Check click didn't fire, don't debug persistence yet
- DOM has `.correct` but saved lacks `correctOpts` → fix capture selector
- Saved has numeric `selected:["0"]` → fix stable keying (Blocker 1)

---

## 🔜 SMOKE TEST - continue after v2 blockers are fixed

### Verified working
- ✅ Login works (testmail1@gmail.com / namas123)
- ✅ Curriculum data loads (346 lessons, 53 academies via RPC)
- ✅ Lesson stage engine runs (19 activities, concept card renders)
- ✅ Dashboard renders (undefined bug fixed in `0824c8a`)
- ✅ Curriculum view (was blank, fixed in `0824c8a`)
- ✅ Stage position saves per-activity and resumes on reload
- ✅ DB sync confirmed (student_data has pel_stage_pos)
- ✅ Stats + per-activity flags restore across reload
- ✅ Feedback + button restore across reload

### NOT YET TESTED
- ❌ Arabic mode toggle (RTL layout, translations)
- ❌ Lesson stage end-to-end in Arabic mode
- ❌ All sidebar navigation items
- ❌ Study tools (Vocabulary Vault, Smart Review, Grammar, etc.)
- ❌ iPad/mobile responsive (fixed in `53a8557` but not verified)
- ❌ Completing a lesson clears saved position
- ❌ Selection restore after reload (blocked by Blocker 1+3)
- ❌ Wrong answer → reload → "Try again" state restored
- ❌ Typed text restore after reload (input renderers)
- ❌ Cross-device sync (position saved on one device, restored on another)

---

## 🔧 TECHNICAL DETAILS

### Commits this session (all pushed)
| Commit | Description |
|--------|-------------|
| `53a8557` | fix(responsive): iPad/tablet/mobile viewport + touch + backdrop-filter |
| `73c92a5` | docs: NEXT_STEPS breadcrumb for iPad responsive fix |
| `ad884b2` | fix(stage): Arabic span leaks + textContent bug + challenge improvements (7 bugs) |
| `d98eb60` | docs: NEXT_STEPS breadcrumb for round 1 |
| `cc91c1b` | fix(stage): Arabic translate answer checking + concept var shadow + db_correct why (3 bugs) |
| `67a3c53` | docs: NEXT_STEPS breadcrumb for round 2 |
| `2bf630a` | fix(stage): conversation_response question leak + listen gate bypass + identify_heard dedup (3 bugs) |
| `93b1068` | docs: NEXT_STEPS breadcrumb for round 3 |
| `0824c8a` | fix(app): curriculum view blank + dashboard 'undefined' skill names |
| `cdcacbb` | feat(stage): per-activity progress persistence + curriculum view fix |
| `6eece2f` | docs: NEXT_STEPS breadcrumb for stage position persistence |
| `9bee3ee` | fix(stage): use direct Supabase upsert for stage pos + fix jsonb restore |
| `d8b0436` | docs: NEXT_STEPS breadcrumb - stage position persistence LIVE-TESTED |
| `dbc94d8` | feat(stage): full per-activity session persistence (v2) - every click saved |
| `fa7c7db` | fix(stage): restore selected options by data-i/text - v2 session restore |
| `052bfe4` | fix(stage): capture+restore correct/wrong option highlights after check |

### Latest lib cache buster
`pel_lesson_stage.js?v=ad49790f`

### Key files
- `lib/pel_lesson_stage.js` - Stage engine, ~3550 lines. Contains:
  - `saveStageSession()` / `saveStagePos()` (line ~2498) - full v2 save
  - `captureActivityDOM()` (line ~2453) - scans DOM for interaction state
  - `applySavedSession()` (line ~2556) - restores stats + per-activity flags
  - `restoreActivityDOM()` (line ~2592) - restores selections, text, feedback
  - `clearStagePos()` (line ~2642) - clears localStorage + Supabase
  - `Stage.mark()` (line ~2306) - calls `saveStageSession()` after updating counters
  - `Stage.next()` (line ~2342) - calls `saveStagePos()` (alias for `saveStageSession`)
  - `Stage.open()` (line ~2234) - calls `applySavedSession(saved)` to restore state
  - `Stage.render()` (line ~2278) - calls `restoreActivityDOM()` after renderer paints
  - Delegated click+input listener (line ~2219) - throttled 500ms save on every interaction
- `lib/pel-personalization.js` - PEL_ENGINE (setCurriculumOverride, dbLesson, etc.)
- `lib/pel_curriculum_path.js` - Curriculum view (self-wiring)
- `app.html` - Main SPA (~20016 lines)
- `tools/bust_lib_cache.py` - MUST run before committing lib/*.js changes
- `tools/sql.py` - Supabase DB query (needs `SUPABASE_PAT` env var)
- `tests/test_buildsequence_iam.js` - 13-check test suite

### v2 session format
```json
{
  "v": 2,
  "a": "a2-past-simple",
  "l": "a2past-was-were",
  "i": 3,
  "ts": 1789240995120,
  "stats": { "recTotal": 1, "recOk": 1, "prodTotal": 0, "prodOk": 0, "prodFirstOk": 0 },
  "acts": {
    "3": {
      "type": "recognize",
      "mode": "recognition",
      "checked": true,
      "correct": true,
      "selected": ["0"],
      "counted": true,
      "okTracked": true
    }
  }
}
```

### Testing setup
- **Student account**: testmail1@gmail.com / namas123
- **User ID**: `1d68ead7-7ef4-407a-9138-a171fa693272`
- **Lesson**: Past Simple academy → "Was and Were" (19 activities)
- **Supabase PAT**: `<ask_user>` (NEVER commit - repo is public)
- **Live URL**: https://personalizedenglishlessons.github.io/tutorfiraspel/app.html
- **Cache-busting URL**: `app.html?fresh=<timestamp>` (GitHub Pages caches app.html for 10 min)

### Clean test procedure (MUST follow before testing v2 restore)
1. `export SUPABASE_PAT=<ask_user> && python3 tools/sql.py "DELETE FROM student_data WHERE key='pel_stage_pos' AND user_id='1d68ead7-...'"` 
2. Load `app.html?clean=<timestamp>` in browser
3. `localStorage.removeItem('pel_stage_pos')` in console
4. Log in, open lesson, advance to recognize
5. Verify: `Stage.state.checked === false`, button says "Check", feedback is empty
6. Only THEN start testing selection → check → reload → restore

### Standing workflow
- Commit + push EVERY finished piece immediately
- Update NEXT_STEPS.md as a breadcrumb after every commit
- Run `python3 tools/bust_lib_cache.py` before committing any lib/*.js change
- Run `node --check lib/pel_lesson_stage.js` before committing
- Run `node tests/test_buildsequence_iam.js` - must be 13/13 PASS
- Usage is tight: batch reads, no redundant calls, no brute-force retries

### 4 Feature/Fix Branches (not yet merged)
- `feat/admin-create-student` - admin can create student accounts
- `fix/client-academy-resolver` - fail-closed route guard, library rerender loop
- `fix/lesson-engine-phase1` - study tools + speech scoring in lesson structure
- `fix/server-plan-profile` - true-zero placement track, no-plan badge, plan hardening

### All bugs fixed across all sessions (18 total)
1-7. Round 1 (`ad884b2`): Arabic span leaks, textContent bugs, challenge improvements
8-10. Round 2 (`cc91c1b`): Arabic translate answer checking, concept var shadow, db_correct why
11-13. Round 3 (`2bf630a`): conversation_response leak, listen gate bypass, identify_heard dedup
14-16. This session (`0824c8a` + `cdcacbb` + `9bee3ee`): curriculum blank, dashboard undefined, stage position persistence
17-18. v2 session persistence (`dbc94d8` + `fa7c7db` + `052bfe4`): full per-activity state save/restore

### Session: Guided Tool Integration + A1 Fix (commits 59c0e35, 13b68df, 9175686)

**What was done:**
1. **A1 display fix** (59c0e35): Added `cefrDisplayName(code, isAr)` helper. Replaced raw CEFR codes (A0, A1, B1...) with friendly names (English Starter, English Basics...) in all student-facing displays: renderActivePath chips, stage previews.
2. **Removed scattered tool links** (59c0e35): Removed Skill Studios group from sidebar navGroups, removed 8 studio entries from search palette, removed studio-linked daily challenge cards (Pronunciation/Speaking/Grammar/Writing challenges). Kept viewRenderers as internal routes.
3. **GUIDED_TOOL_RULES** (13b68df): Added level-based tool gating config. Tools unlock by CEFR level: A0=Vocab+Pronunciation+Review, A1=+Grammar, A2=+Listening+Speaking, B1=+Reading+Writing. Lesson tools strip and dashboard skill data now filtered by level. Lesson completion screen shows dynamic tool buttons.
4. **Adaptive tool injection** (9175686): Added PEL_PERF tracker (last 5 lessons' production scores). In buildSequence step 17, injects adaptive activities: bonus speaking/writing for excelling students, reinforcement recognize for struggling students, tool intro micro-activities for newly unlocked tools. All are real activities the student completes, not links.

**Files modified:**
- `app.html` - cefrDisplayName, GUIDED_TOOL_RULES, guidedToolsForLevel, PEL_PERF tracker, filtered lesson tools strip, filtered dashboard skill data, Deps additions
- `lib/pel_lesson_stage.js` - dynamic tool buttons on completion screen, adaptive tool injection in buildSequence step 17
- `NEXT_STEPS.md` - this breadcrumb

**Next steps:**
1. Browser test: verify A1 shows "English Basics" on homepage, sidebar has no Skill Studios, lesson tools strip shows only level-appropriate tools
2. Browser test: complete a lesson as student, verify completion screen shows dynamic tool buttons
3. Test adaptive injection: complete 2+ lessons with high scores, verify bonus activities appear; complete with low scores, verify reinforcement appears
4. Activity touch in lesson stage: add `PEL_ACTIVITY.touch('activity', ...)` in pel_lesson_stage.js for per-activity tracking
5. Admin overview: add online student count to admin_overview RPC
6. Activity retention: periodic cleanup of old student_activity_events

### Session: Merge all sections into guided path (commit e44b819)

**What was done:**
1. **Simplified dock buttons**: Home, Levels, Profile (removed "Academies" and "Lesson of Day" - students won't navigate to separate sections)
2. **Simplified navGroups**: "Your Path" now only has "Levels" (removed "Academies" and "Lesson of Day")
3. **Redirected "paths" view**: Now renders the CEFR guided path (renderCefrPath) instead of the library grid (renderLibrary)
4. **Updated all references**: search palette, workspace back button, lesson next button, resume fallback all point to 'cefr'
5. **Daily warm-up in lessons**: Word/Phrase of the Day woven into the start of buildSequence as a 'learn' activity (after 1st lesson). Students discover daily content naturally within their lesson, not from a separate section.
6. **Daily content Deps**: Added `dailyWarmup` function to Deps that returns buildDailyItems() for the lesson engine to use.

**Result:**
- Student opens app → sees Homepage (single hub with active path, daily cards, review strip)
- Student clicks "Levels" → sees guided CEFR path with all academies organized by level
- Student opens a lesson → daily warm-up (Word of the Day) appears naturally at the start
- Student completes lesson → adaptive tool activities injected based on performance
- No more scattered sections: everything is in the guided path or woven into lessons

**Next steps:**
1. Browser test: verify dock shows 3 buttons, sidebar "Your Path" has only "Levels"
2. Browser test: open a lesson (2nd+ lesson), verify daily warm-up appears
3. Browser test: verify "Levels" dock button shows the CEFR guided path
4. Consider merging remaining homepage daily cards into the active path section
5. Activity touch in lesson stage: add PEL_ACTIVITY.touch('activity', ...) for per-activity tracking
6. Admin overview: add online student count to admin_overview RPC

### Session: Daily Burst section (commit c1c8f57)

**What was done:**
- Added prominent "Daily Burst" section at the top of the homepage, right below the hero card
- Three visually striking cards in a responsive grid:
  1. Word of the Day (gold theme): big serif English word, Arabic translation, transliteration, example sentence
  2. Quick Win (emerald theme): recommended action with time estimate and tap-to-start CTA
  3. Phrase of the Day (blue theme): English phrase with Arabic translation
- Quick Win moved UP from its buried position in the week/focus grid (now prominent)
- Click handlers on all three cards navigate to relevant views
- Section hidden for first-time students (shows after completing 1st lesson)

**Homepage layout now:**
1. Hero card (CTA)
2. Daily Burst (Word of the Day + Quick Win + Phrase of the Day) ← NEW, prominent
3. Continue Learning
4. Review Strip
5. Week + Focus cards
6. Learning Progress (stats + skill bars)

**Next steps:**
1. Browser test: verify Daily Burst cards appear below hero, Word/Phrase populated
2. Browser test: click cards navigate to vocabulary/recommended view
3. Consider adding pronunciation audio button on Word of the Day card
4. Consider adding Collocation of the Day as a 4th card

### Session: Remove Levels from student navigation (commit 0d0f1fe)

**Problem:** Levels view showed all CEFR levels (A0-C2) with locked academies. A beginner student could see B1, B2, C1, C2 content they can't access - confusing and demotivating. Served no purpose since the learning engine routes students automatically.

**What was done:**
- Removed "Levels" from dock buttons
- Replaced with "Smart Review" (SRS practice - actually useful for students)
- Removed "Your Path" group entirely from sidebar navGroups
- Added "Smart Review" to sidebar Progress group
- Redirected 'paths' and 'academies' views to home
- Updated search palette, beginner start buttons, workspace back, lesson next, resume fallback
- CEFR path view kept as internal route but not advertised in navigation

**Student navigation now:**
- Dock: Home, Smart Review, Profile, More
- Sidebar: Start (Home, Continue Learning) → Progress (Smart Review, Bookmarks, Achievements, Calendar, Certificates) → Account (Profile, Settings)
- Homepage is the single hub: Daily Burst + Continue Learning (guided path) + Review Strip + Week/Focus + Progress stats

**Next steps:**
1. Browser test: verify dock shows Home, Review, Profile, More (no Levels)
2. Browser test: verify sidebar has no "Your Path" group
3. Browser test: verify beginner student lands on home (no locked levels visible)
4. Consider: should the homepage show the student's current academy progress more prominently?

### Session: Daily Burst to top + fix empty progress (commit a2f52b9)

**Problems fixed:**
1. Daily Burst (Word of the Day, Quick Win, Phrase of the Day) was buried below hero card, announcements, and live classes - students had to scroll to see it
2. Progress skill bars showed 0% for all skills because dashSkillData() tracked specific academies (speaking-studio, listening-lounge, grammar-academy) - students doing STEP Exam Prep or other academies saw empty progress

**What was done:**
- Moved Daily Burst HTML section to be the FIRST section on the homepage (before hero card)
- Students now see Word of the Day, Quick Win, and Phrase of the Day immediately on every device
- Rewrote dashSkillData() to compute skill progress from ALL completed lessons across ALL academies
- Maps each academy to a primary skill type (speaking/listening/grammar/vocabulary)
- Aggregates completed + total lessons per skill type - student with 12 completed lessons now sees actual progress
- Week activity also tracked per skill type from completion dates

**Homepage layout now:**
1. Word Burst (cycling vocabulary card, from pel_dashboard_life.js) ← FIRST thing visible
2. Hero card (greeting + resume CTA + active path lesson list inside #heroPathBody)
3. Announcements + Live classes
4. Review strip
5. Week + Focus cards (Focus card now functional, connected to student profile)
6. Progress (stats + skill bars with real data)

**Next steps:**
1. Browser test: verify Word Burst is first section on all devices (phone, tablet, iPad, laptop)
2. Browser test: verify Focus card shows stage/level/progress chips and is clickable
3. Browser test: verify hero card shows active path lesson list inside it (no separate Continue Learning section)
4. Consider: make hero card more compact on mobile
5. Consider: add pronunciation audio button on Word Burst card

## DONE: Remove Daily Burst + Continue Learning, fix Focus card (commit 8ff5428)

**Problems fixed:**
1. Daily Burst section (Word of Day, Quick Win, Phrase of Day) was redundant with Word Burst - removed Daily Burst entirely, Word Burst now takes the top position
2. Continue Learning section was a separate card duplicating hero card info - removed it, moved useful props (stage name, progress bar, lesson list, resume CTA) into hero card via #heroPathBody
3. Focus card was hidden for first-time students and not connected to server state - now always visible for logged-in students, shows PEL_EFFECTIVE_STATE stage/level/progress chips, whole card clickable, dashRecommendation() checks server state first
4. Word Burst had 90px bottom margin - fixed to normal 22px
5. buildWordBurst() now repositions existing card to top instead of skipping if already exists

**Files changed:**
- app.html: Removed #dailyBurstSection HTML, #continueLearningLabel/#continueLearningCard/#continueLearningBody HTML, renderDailyBurst() function. Added #heroPathBody inside hero card. Updated renderActivePath() to render into heroPathBody. Updated renderContinueLearning() to reference heroPathBody. Rewrote renderFocusCard() to be always visible, server-connected, clickable. Updated dashRecommendation() to check PEL_EFFECTIVE_STATE first.
- lib/pel_dashboard_life.js: buildWordBurst() inserts before #heroCard (not after dailyBurstSection). Repositions existing card instead of returning. Fixed margin.
- lib/onboard.js: (from previous commit) cefrName() helper, singular/plural lesson fix, plan home only on app.html

**Homepage layout (final):**
1. Word Burst (cycling vocabulary) ← top of page, all devices
2. Hero card (greeting + resume CTA + lesson list inside #heroPathBody)
3. Subscription banner
4. Announcements + Live classes
5. Review strip
6. Week + Focus cards (functional, connected to profile)
7. Progress (stats + skill bars)
