# NEXT STEPS — pick up here

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
- ✅ Stats restore (recTotal=1, recOk=1 preserved — mastery gate integrity)
- ✅ Per-activity flags restore (counted=true, okTracked=true)
- ✅ Feedback + button restore ("✓ Correct" + "Continue" painted without mark())
- ✅ DB sync confirmed (student_data has pel_stage_pos with v:2 format)
- ✅ v2 save captures: checked, correct, selected (data-i), counted, okTracked, stats
- ✅ 13/13 tests pass, syntax OK

### ❌ BLOCKERS — next AI must fix these in order

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
Option A is cleaner — search for `sel=` in each renderer and replace with
DOM lookup.

#### Blocker 4: correctOpts not captured (debug needed)
**Problem**: When the student checks a correct answer, the recognize renderer adds
`.correct` class to the right option BEFORE calling `mark()`. The `saveStageSession()`
inside `mark()` calls `captureActivityDOM()` which should find `.pel-option.correct`
elements. But the saved data has `checked:true, correct:true` but NO `correctOpts`.

**Debug steps** (MUST use clean state — see below):
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

## 🔜 SMOKE TEST — continue after v2 blockers are fixed

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
| `d8b0436` | docs: NEXT_STEPS breadcrumb — stage position persistence LIVE-TESTED |
| `dbc94d8` | feat(stage): full per-activity session persistence (v2) — every click saved |
| `fa7c7db` | fix(stage): restore selected options by data-i/text — v2 session restore |
| `052bfe4` | fix(stage): capture+restore correct/wrong option highlights after check |

### Latest lib cache buster
`pel_lesson_stage.js?v=ad49790f`

### Key files
- `lib/pel_lesson_stage.js` — Stage engine, ~3550 lines. Contains:
  - `saveStageSession()` / `saveStagePos()` (line ~2498) — full v2 save
  - `captureActivityDOM()` (line ~2453) — scans DOM for interaction state
  - `applySavedSession()` (line ~2556) — restores stats + per-activity flags
  - `restoreActivityDOM()` (line ~2592) — restores selections, text, feedback
  - `clearStagePos()` (line ~2642) — clears localStorage + Supabase
  - `Stage.mark()` (line ~2306) — calls `saveStageSession()` after updating counters
  - `Stage.next()` (line ~2342) — calls `saveStagePos()` (alias for `saveStageSession`)
  - `Stage.open()` (line ~2234) — calls `applySavedSession(saved)` to restore state
  - `Stage.render()` (line ~2278) — calls `restoreActivityDOM()` after renderer paints
  - Delegated click+input listener (line ~2219) — throttled 500ms save on every interaction
- `lib/pel-personalization.js` — PEL_ENGINE (setCurriculumOverride, dbLesson, etc.)
- `lib/pel_curriculum_path.js` — Curriculum view (self-wiring)
- `app.html` — Main SPA (~20016 lines)
- `tools/bust_lib_cache.py` — MUST run before committing lib/*.js changes
- `tools/sql.py` — Supabase DB query (needs `SUPABASE_PAT` env var)
- `tests/test_buildsequence_iam.js` — 13-check test suite

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
- **Supabase PAT**: `<ask_user>` (NEVER commit — repo is public)
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
- Run `node tests/test_buildsequence_iam.js` — must be 13/13 PASS
- Usage is tight: batch reads, no redundant calls, no brute-force retries

### 4 Feature/Fix Branches (not yet merged)
- `feat/admin-create-student` — admin can create student accounts
- `fix/client-academy-resolver` — fail-closed route guard, library rerender loop
- `fix/lesson-engine-phase1` — study tools + speech scoring in lesson structure
- `fix/server-plan-profile` — true-zero placement track, no-plan badge, plan hardening

### All bugs fixed across all sessions (18 total)
1-7. Round 1 (`ad884b2`): Arabic span leaks, textContent bugs, challenge improvements
8-10. Round 2 (`cc91c1b`): Arabic translate answer checking, concept var shadow, db_correct why
11-13. Round 3 (`2bf630a`): conversation_response leak, listen gate bypass, identify_heard dedup
14-16. This session (`0824c8a` + `cdcacbb` + `9bee3ee`): curriculum blank, dashboard undefined, stage position persistence
17-18. v2 session persistence (`dbc94d8` + `fa7c7db` + `052bfe4`): full per-activity state save/restore
