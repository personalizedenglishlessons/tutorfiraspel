# Session Handoff — 2026-10-07 (CEFR Boundaries + Login UI Fixes)

## Context

The owner is building PEL (Personalized English Lessons) — a Supabase-backed
English learning app for Saudi Arabian students. The A0 plan ("Start From Zero")
is expected to be the most sold plan, targeting students who speak zero English.

The owner's vision: A0 must start with the alphabet and phonetics first,
then how to connect letters, before any vocabulary or sentences.

## Owner's requirements this session

1. **CEFR boundary enforcement**: No academy should fall into different
   academies like A0's content strictly stays in A0's, A1's in A1's, A2's in
   A2's, B1's in B1's, B2's in B2's, C1's in C1's, C2's in C2's, STEP's in STEP.
   Then make sure it follows that rule.

2. **Login UI bugs**: The login section of the site has UI interface bugs — fix them.
   Also make the login card bigger.

## Commits shipped (5 commits to main)

### `ff5ebce` — Fix login UI bugs: password/eye overlap, bilingual error messages, brand text visibility, bigger card
- Added `padding-right:48px` to inputs with toggle-eye so password text doesn't overlap the eye icon
- Fixed backwards `brand-arabic` display rule (was hiding Arabic in Arabic mode, showing in English)
- Hide `brand-heading-ar` greeting in English mode
- Made error messages language-aware (show only selected interface language, not both)
- Increased auth-card max-width 480px→540px, padding 40px→48px
- Increased input font-size .94rem→1rem, padding 18px→20px top
- Added bottom padding on mobile panel-side to prevent error banner cutoff
- Added top padding on mobile brand-side to prevent header overlap
- Bumped pel-settings.js cache-bust

### `df73e44` — Enforce strict CEFR level boundaries — remove 61 cross-level lessons
- Removed 61 lessons that appeared across multiple CEFR levels
- Each shared lesson assigned a canonical CEFR level based on its natural difficulty
- Reclassified travel-english: B1 → A2 (all its lessons are A2-level travel situations)
- Added hospital-english to ACADEMY_CEFR mapping (was missing, now B1)
- 0 cross-CEFR contamination remaining (verified by audit script)
- 13 academies now have < 4 client-side lessons and need level-appropriate content created in the DB

### `355eff5` — Fix: error message doesn't update when switching languages on login page
- Store ar/en message pair in PEL_LAST_MSG global
- Added refreshFormMessages() to re-render visible messages in new language
- Call refreshFormMessages() at end of applyLoginLang()
- Bumped pel-settings.js cache-bust

### `0f760b0` — Fix: mobile menu ghosting, untranslated hero link, stale pel_config.js version
- Added `visibility:hidden` to mobile menu when closed (prevents ghost text bleeding through)
- Added language switch handler for 'استكشف المنصه' / 'Explore the platform' hero link
- Fixed verify.html pel_config.js cache-bust version (a25efd62 → 7d1f4a36, matching all other pages)

### `93e1657` — Sync ACADEMY_LESSONS CEFR cleanup to pel-personalization.js
- The onboarding route preview (pel-personalization.js) had a stale copy of ACADEMY_LESSONS
  with all 61 cross-CEFR contamination that was already fixed in app.html. Now both copies are in sync.
- Bumped pel-personalization.js cache-bust in all 3 HTML files

## A0 Curriculum Structure (unchanged from 2026-10-06 session)

### Route order (server-side student_route function):
1. a0-spelling-sounds (phonics first) — alphabet, letter sounds, vowels, digraphs, CVC words
2. a0-social-english — hello/goodbye, how are you, name intro, polite words
3. a0-home-words — yes/no/not, I/you/me, pronouns, prepositions, the, verbs
4. a0-sentence-building — I am, you are, he/she is, negatives, questions, contractions
5. a0-question-words — when, where, who, how, why, what
6. a0-error-clinic — a/an, am/is/are, he/she, this/that, plurals, apostrophes, capital I

## CEFR Boundary Enforcement Details

### Canonical lesson assignments (shared lessons → their canonical CEFR level):
- A1: greetings-goodbye, introducing-yourself, numbers-dates, personal-information, basic-questions
- A2: asking-directions, check-in-desk, currency-exchanging, daily-routines, delays-cancellations,
  going-to-airport, hotel-requests, inviting-friends, security-checks
- B1: asking-favors, catching-up, collocations-basics, describing-symptoms, emergency-room,
  future-forms-lesson, learning-words-effectively, linking-words, medical-emergency,
  opinions-agreeing, pharmacy-requests, sounding-natural, talking-past-events
- B2: email-phrases-business, meeting-etiquette, reading-emails, writing-emails-polite, writing-messages
- C1: movie-talk, music-talk

### Academies reclassified:
- travel-english: B1 → A2 (all its lessons are A2-level travel situations)

### Academies with < 4 lessons after CEFR cleanup (need DB content):
- american-accent-lab (B2): 1 lesson
- business-english (C1): 3 lessons
- emergency-english (B2): 1 lesson
- english-mastery (C2): 2 lessons
- fluency-journey (C2): 2 lessons
- grammar-academy (B1): 3 lessons
- listening-lounge (B2): 2 lessons
- movie-english (C1): 2 lessons
- music-english (B1): 3 lessons
- shopping-english (A2): 3 lessons
- tv-series-english (C1): 2 lessons
- vocabulary-vault (B1): 2 lessons
- writing-workshop (C1): 1 lesson

## Login UI Bugs Fixed

1. **Password text overlapping eye toggle icon** — added `padding-right:48px` via `:has()` selector
2. **Error messages showing both languages** — now shows only the selected interface language
3. **Error message not updating on language switch** — added `PEL_LAST_MSG` global + `refreshFormMessages()`
4. **`brand-heading-ar` always visible** — now hidden in English mode
5. **`brand-arabic` display rule backwards** — was hiding Arabic in Arabic mode, showing in English; fixed
6. **Login card too small** — increased max-width 480px→540px, padding 40px→48px
7. **Mobile menu ghost text** — added `visibility:hidden` when closed
8. **Untranslated hero link** — added language switch for 'استكشف المنصه' / 'Explore the platform'
9. **Stale pel_config.js version in verify.html** — synced to match all other pages

## Test student
- Email: (see prior handoff docs)
- User ID: (see prior handoff docs)
- Plan: start_from_zero (A0)

## Notes for next session
- Git identity: personalizedenglishlessons / 149332361+personalizedenglishlessons@users.noreply.github.com
- gh auth setup-git already run on this checkout
- Rule: whenever a lib file changes, bump its ?v= hash in ALL HTML files that load it
- Rule: do NOT write the Supabase access token into files/commits/logs
- GitHub Pages deploys from main branch automatically
- The server-side route (student_route function) is the authoritative route. The client-side buildRoute() in pel-personalization.js is used for onboarding route preview only.
- To change a student's current lesson, update BOTH student_progression (current_stage, current_lesson) AND student_data (pel_stage_pos key)
- The ACADEMY_LESSONS mapping exists in BOTH app.html and lib/pel-personalization.js — keep them in sync
- 13 academies need level-appropriate DB content created to fill gaps left by CEFR cleanup
