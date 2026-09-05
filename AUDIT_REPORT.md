# PEL Learning System Audit Report

## System Inventory

### Curriculum Architecture
- **Plans**: Two tracks (start_from_zero, exam_prep) × 3 durations (1/2/3 months)
- **Levels**: A0 (Absolute Beginner) → A1 → A2 → B1 → B2 → C1
- **Academies**: 31 academies mapped to CEFR levels (A0-C1)
- **Lessons**: 346 lessons in DB (A0-C2 + STEP), plus PEL_BEGINNER curriculum (32 lesson IDs with rich content)
- **Activities**: 16 activity types in buildSequence(): learn, learn_sentence, recognize, match, arrange_words, fill_blank, spell, translate, listen, identify_heard, pronunciation, speaking, conversation_response, complete_dialogue, grammar_correction/free_response, review, challenge

### Data Flow
1. Student assigned plan/level → `PEL_EFFECTIVE_STATE` from `complete_activity` RPC
2. `nextLesson()` checks: DB state → plan route → in-progress academy → first uncompleted
3. `getLesson()` checks: FLAGSHIP_LESSONS → DB lesson → LESSON_LIBRARY → genericLesson()
4. `buildSequence()` builds 9-13 activities from lesson vocab/conversation/quiz
5. `markLessonComplete()` → `complete_activity` RPC → advances DB state

## Critical Issues Found

### 1. ANSWER-REVEALING (Critical - defeats teaching purpose)

**`learn` activity (line 2215-2231):** Shows English + IPA + transliteration + Arabic + example sentence ALL AT ONCE. Pure display, not teaching. Student sees the answer before any recall.

**`learn_sentence` (line 2232-2241):** Shows English + translit + Arabic simultaneously.

**`pronunciation` (line 2354-2363):** Shows the word AND Arabic translation, then asks student to "say it aloud" and self-assess. Has speech recognition code (`canRecognize()`, `levenshtein()`) but doesn't use it.

**`speaking` (line 2365-2374):** Same as pronunciation - shows full answer, asks student to repeat.

**`review` (line 2449-2453):** Displays all items with both English AND Arabic. Passive display, not active recall.

### 2. SEQUENCING (Critical - tests immediately after teaching)

**`buildSequence` order:** learn → recognize. The `recognize` activity asks "What does X mean?" immediately after `learn` showed the answer. This tests short-term memory, not learning.

**All activities use `main[0]`:** arrange_words, fill_blank, spell, translate, listen, identify_heard, pronunciation, speaking ALL use `main[0]` - the first vocab item only. The other two items get minimal practice.

### 3. WEAK ACTIVITIES

**`listen` (line 2334-2340):** Just plays audio, says "you'll identify next." Student just clicks Continue - no action required.

**`pronunciation` (line 2354-2363):** Self-assessment only. System has speech recognition but doesn't use it.

**`review` (line 2449-2453):** Shows all answers. Should hide Arabic and test recall.

**`challenge` (line 2455-2463):** Single multiple-choice question. Too simple for a "challenge."

### 4. MISSING ELEMENTS

- No spaced repetition in review (queue exists but not used for active recall)
- No listening dictation (listen + type what you heard)
- No guided production step between controlled practice and free response
- No differentiation between recognition and production
- `arrange_words` shows Arabic hint (line 2288) - student can match without understanding

### 5. PROGRESSION

**`nextLesson()` logic is sound** - uses DB state → plan → in-progress → first uncompleted.
**`markLessonComplete`** marks complete on activity completion, no mastery check.
**Review queue** feeds vocab but `review` activity doesn't test it.

## Fix Priority

1. Fix `learn` activity → progressive reveal (intro → audio → meaning)
2. Fix `review` activity → active recall (hide Arabic, test, reveal)
3. Fix `buildSequence` → distribute activities across ALL vocab items
4. Fix `pronunciation` → use speech recognition instead of self-assessment
5. Fix `recognize` → add gap between learning and testing
6. Fix `listen` → require student action
7. Fix `arrange_words` → hide Arabic hint
