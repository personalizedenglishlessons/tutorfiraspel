# NEXT STEPS - pick up here

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
