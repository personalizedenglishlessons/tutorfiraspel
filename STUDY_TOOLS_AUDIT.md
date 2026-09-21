# Study Tools Audit Report

**Date:** September 21, 2026
**Auditor:** Perplexity Computer
**Repository:** `personalizedenglishlessons/tutorfiraspel`
**Deployed at:** https://personalizedenglishlessons.github.io/tutorfiraspel/
**Method:** Live browser audit using test account (testmail1@gmail.com)

---

## Executive Summary

All 8 study tools (plus Bookmarks) were audited live in the deployed app. Every tool renders correctly with zero console errors and zero warnings. All tools are fully unlocked for all students regardless of CEFR level or lessons completed.

---

## Audit Results

| # | Tool | View ID | Content Rendered | Status | Notes |
|---|------|---------|-------------------|--------|-------|
| 1 | Vocabulary | `vocabulary` | 171 flashcards + A0 pronunciation cards + Abha expressions | PASS | Search, filter, flip, bookmark, speak all functional. A0 and Abha sections load async from Supabase. |
| 2 | Grammar | `grammar` | 16 grammar topic cards + 8 Saudi Mistake Coach cards | PASS | Each topic has quiz. Coach has 8 categories with patterns and practice questions. |
| 3 | Pronunciation | `pronunciation` | 15 topic tiles + 4 leveled drills | PASS | Topics clickable, drill selector functional, drill body renders with word→phrase→sentence progression. |
| 4 | Speaking | `speaking` | 18 persona cards | PASS | Roleplay simulator with typed + voice input. Smart reply engine + conversation fit checker. |
| 5 | Listening | `listening` | 7 audio tracks | PASS | Interactive transcripts with play-all, speed control, and comprehension quizzes. |
| 6 | Reading | `reading` | 6 timed articles | PASS | Articles with vocabulary, grammar notes, quizzes, and reading timer. |
| 7 | Writing | `writing` | 25 writing prompts | PASS | Free topic + structured prompts. Grammar check with multi-layer engine (LanguageTool + compromise + rule bank). |
| 8 | Review | `review` | SRS deck (2 due cards, 2 in queue) | PASS | Spaced repetition with reveal → knew/review flow. Mistakes tracking. Upcoming cards preview. |

---

## Issues Fixed (This Session)

### CRITICAL — `svgIcon` ReferenceError (FIXED)
**File:** `app.html`, line 17070
**Commit:** `46e8023`

`svgIcon(t.icon, 18)` was called in `renderLessonReader` but `svgIcon` was only defined locally inside the `PEL_DASH_LIFE_FACTORY` closure in `lib/pel_dashboard_life.js`. This threw a `ReferenceError` that broke the lesson tools strip rendering. Replaced with lucide `<i data-lucide>` icons.

### HIGH — Study tools gated by `minDone` (FIXED)
**Files:** `lib/pel_dashboard_life.js`, `lib/pel_curriculum_path.js`, `app.html`
**Commits:** `46e8023`, `067bdc8`

Three locations still locked study tools based on lessons completed:
1. Dashboard strip (`pel_dashboard_life.js`): vocabulary locked at 3, review at 4, bookmarks at 6 lessons
2. Curriculum path (`pel_curriculum_path.js`): only 3 of 9 tools shown, filtered by minDone
3. GUIDED_TOOL_RULES (`app.html`): unused minDone:3 on review tool

All gating removed. All 9 tools now unlocked for all students.

### HIGH — Transcribe CORS (VERIFIED FIXED)
**File:** `supabase/functions/transcribe/index.ts`

The deployed `transcribe` Edge Function (v2) now returns `Access-Control-Allow-Origin: https://personalizedenglishlessons.github.io` instead of `*`. Verified with `curl -X OPTIONS` from multiple origins — always returns the restricted origin, never reflects the requesting origin.

---

## Verification

- **Console errors:** 0 across all 8 tools
- **Console warnings:** 0 across all 8 tools
- **All 44 tests pass** (13 build-sequence + 31 teaching-flow)
- **All syntax checks pass** (lib files + app.html inline scripts)
- **All view containers exist** and render correctly
- **All data arrays populated** (VOCAB_BANK, GRAMMAR_TOPICS, PRONUNCIATION_TOPICS, SPEAKING_PERSONAS, LISTENING_TRACKS, READING_ARTICLES, WRITING_PROMPTS)
- **All helper functions defined** (checkGrammar, smartReply, freeTranslate, speak, recordAndScore, pronFeedback, canRecognize, savePelFeedbackEvent)
