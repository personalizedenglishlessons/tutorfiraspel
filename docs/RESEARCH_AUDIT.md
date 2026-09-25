# PEL App Research Audit: Pedagogy, Bugs, and Best Practices

*Web-based research conducted September 25, 2026. All claims cited to fetched sources.*

---

## Executive Summary

The PEL app is a well-architected English learning platform for Arabic (specifically Saudi) speakers that already implements many research-backed pedagogical principles. This audit compares the app's implementation against current research in second language acquisition, identifies potential bugs, and recommends improvements. The app's core strengths are its Arabic-speaker-specific pronunciation work, spaced repetition system, and mastery-based progression. The main areas for improvement are lesson length, feedback quality, streak forgiveness, and SRS data durability.

---

## 1. How It Should Teach

### 1.1 Spaced Repetition — App implementation is solid

**Research:** A meta-analysis of 48 experiments (N=3,411) found spaced practice has a "medium-to-large effect" on second language learning. Key findings: shorter spacing is as effective as longer spacing on immediate posttests, but longer spacing is more effective on delayed posttests. Equal and expanding spacing were statistically equivalent — there is no need to prefer one over the other ([Wiley, 2021](https://onlinelibrary.wiley.com/doi/full/10.1111/lang.12479)).

**App status:** The app implements SM-2-lite with expanding intervals (1d → 3d → 7d → 16d), ease factor starting at 2.5, capped at 3.0, with a 0.2 penalty on miss and 0.05 bonus on correct recall. The review activity resurfaces due items from previous lessons. This is well-aligned with the research — the meta-analysis found no significant difference between equal and expanding spacing.

**Potential issue:** SRS state lives in `localStorage` (`pel_srs_v1`) with server sync as a "mirror." If a student clears browser data or uses private mode, the local SRS state is lost. The server sync (`srsPush`/`srsSync`) is fire-and-forget and may not have completed before the local data was cleared. **FIXED:** On app load, `srsSync()` is now awaited (with a 5-second timeout) before the app is revealed, ensuring the review queue is always hydrated from the server. A `_srsSynced` flag is exposed via `PEL_STAGE_API.srsSynced()` so admin panels can distinguish hydrated vs. local-only data (commit 8bf7a96).

### 1.2 Mastery-Based Learning — App implementation is well-aligned

**Research:** A practical review of mastery learning found an average effect size of 0.59 (medium-to-large). Higher mastery thresholds produced larger effect sizes. Students who don't meet mastery should receive corrective activities and retake a separate assessment covering the same learning outcomes. Motivation, retrieval practice, and repeated feedback are the theoretical foundations ([PMC, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10159400/)).

**App status:** The app implements a mastery gate with `MASTERY_MIN_OK = 0.6` (60% first-try production accuracy) and `MASTERY_MIN_PROD = 3` (minimum 3 production activities before the gate activates). Students who don't meet mastery get a "not met" screen with a retry option. This aligns with mastery learning principles.

**Potential issue:** When `prodTotal < 3`, the gate passes automatically (`masteryMet = prodTotal < MASTERY_MIN_PROD`). This means a lesson with only 2 production activities always passes regardless of accuracy. This is intentional (can't penalize students for having too few production activities), but it means the mastery gate is effectively disabled for short lessons. **Recommendation:** Consider whether 3 is the right minimum — research suggests higher thresholds produce larger effect sizes, but too high can cause frustration.

### 1.3 Communicative Language Teaching — App balances fluency and accuracy

**Research:** A systematic review found CLT "effectively enhances speaking skills across diverse EFL contexts." However, the emphasis on fluency over accuracy can "fall short of the desired competency" — learners need both ([EJEDU, 2024](https://eu-opensci.org/index.php/ejedu/article/view/30763); [AOU, 2024](https://web.aou.edu.lb/research/Documents/CALR%207%20selected%20proceedings%204.pdf)).

**App status:** The app balances both — accuracy is enforced by the mastery gate, and fluency is encouraged through speaking activities, free_response, and conversation exercises. This is a good balance.

### 1.4 Computer-Assisted Pronunciation Training (CAPT) — App is above average

**Research:** A systematic review of 30 studies found optimal pronunciation outcomes require combining implicit feedback with explicit instruction. Both segmental (vowels, consonants) and suprasegmental (stress, intonation, rhythm) features matter. Feedback should prioritize errors most likely to affect intelligibility. Contemporary pronunciation teaching prioritizes "intelligibility and comprehensibility rather than L1-like pronunciation" ([Cambridge RECALL, 2024](https://www.cambridge.org/core/journals/recall/article/computerassisted-pronunciation-training-a-systematic-review/71E786F7DFC99727837909FDED7A2320)).

**App status:** The app addresses segmentals through minimal pairs (targeting Arabic-speaker-specific confusions: /p/ vs /b/, /v/ vs /f/, silent letters, consonant clusters). It addresses suprasegmentals through conditional intonation exercises (only shown for lessons about questions). The "How to Say It" feature (English word + Arabic transliteration + audio) is unique and valuable.

**Gap:** The CAPT review emphasizes that feedback should prioritize errors "most likely to affect intelligibility." The app's pronunciation feedback (`pronFeedback`) should be checked to ensure it provides specific, actionable feedback (not just "correct/incorrect") and prioritizes intelligibility-critical errors.

### 1.5 Feedback Quality — Needs improvement

**Research:** ACTFL recommends feedback should be specific, timely, relevant to learning goals, presented in student-friendly language, and should help learners identify areas of strength and improvement. Feedback should be provided in multiple forms (formative, summative, reflective) ([ACTFL](https://www.actfl.org/educator-resources/guiding-principles-for-language-learning/provide-effective-feedback)). A Reddit survey of language app users found the #1 complaint was "insufficient explanations of what they did wrong" — many apps provide only binary "correct/incorrect" ([Reddit r/languagelearning](https://www.reddit.com/r/languagelearning/comments/1lze50r/what_are_your_biggest_problems_with_language/)).

**App status:** The app provides immediate feedback on exercises (correct/incorrect indicators). The pronunciation hints are detailed (specific phoneme guidance with Arabic transliteration and "avoid" patterns). **FIXED:** Grammar exercises (fill_blank, spell, translate) now show the correct answer when the student gets it wrong — e.g., "Correct answer: am" or "Correct spelling: Thank you". The `mark()` function accepts an optional `feedbackMsg` parameter for explanatory feedback (backward compatible with existing renderers that don't pass it). Hints in speaking and free_response activities already require explicit user action (no auto-appearing hints) (commit b8906e3).

---

## 2. What to Teach

### 2.1 Arabic-Speaker-Specific Challenges — App already addresses most

**Research:** The British Council identifies specific difficulties for Arabic speakers learning English ([British Council](https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers)):

| Challenge | Research Finding | App Status |
|---|---|---|
| Writing system (RTL→LTR) | Arabic speakers find English "backwards"; mix uppercase/lowercase | App has writing_practice activity |
| Verb "to be" | Arabic speakers often omit it ("He happy") | App has lesson "I am" as first sentence |
| Present perfect | Arabic speakers use it for specific past time ("I have seen him yesterday") | Check curriculum coverage |
| Consonant clusters | Arabic speakers insert schwa ("espeak" instead of "speak") | App has pronunciation hints for s+stop clusters |
| /p/ vs /b/ | Egyptian Arabic speakers confuse these | App has minimal pairs |
| /v/ vs /f/ | Gulf Arabic speakers confuse these | App has pronunciation hints for v/f |
| Silent letters | Arabic has no silent letters; learners pronounce them | App has pronunciation hints (e.g., "island") |
| Intonation | Arabic intonation may sound "rude" to English speakers | App has conditional intonation exercises |
| Punctuation | Arabic learners may not use enough full stops; use commas instead | Check writing practice coverage |

**Gap:** Verify that the curriculum includes explicit instruction on the verb "to be" (present tense), present perfect vs. simple past, and punctuation differences. The British Council notes these as the most common grammar errors for Arabic speakers.

### 2.2 CEFR Alignment — App has levels but should verify coverage

**Research:** Cambridge recommends CEFR-informed curriculum design with clear can-do statements at each level ([Cambridge English](https://www.cambridgeenglish.org/Images/126011-using-cefr-principles-of-good-practice.pdf)). The CEFR Companion Volume emphasizes functional language use over structural knowledge.

**App status:** The app has CEFR levels (A0 through C1) and 14 academies mapped to levels. This is a strong foundation. The app's lesson progression (concept → examples → learn → practice → production → review → challenge) aligns with CEFR's action-oriented approach.

### 2.3 Saudi EFL Context — App is well-targeted

**Research:** A study of 175 Saudi undergraduate EFL learners found gamified MALL produces consistently positive perceptions across motivation, engagement, social interaction, autonomy, and confidence. Key drivers: rewards, competition, progress tracking, immediate feedback, and contextual flexibility. Minor technical challenges were noted ([Frontiers in Education, 2026](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1935767/full)).

**App status:** The app uses Saudi dialect (not MSA) for Arabic transliteration, targets Saudi learners specifically, and includes gamification elements (XP, streaks, progress tracking). This is well-aligned with the research.

---

## 3. When to Teach (Sequencing and Timing)

### 3.1 Lesson Length — Potentially too long

**Research:** EdTech research recommends the smallest completable learning unit should be around 5 minutes. Duolingo's core lesson takes less than 3 minutes. Products designed around 45-minute sessions fail to deliver a completion reward during natural available time windows (15-25 minute commute). A 5-minute lesson requires little motivation; a 45-minute lesson requires a high-motivation decision each time ([DigiA, 2024](https://www.digia.tech/post/edtech-app-engagement-why-85-percent-abandon-before-week-3/)).

**App status:** The app's lesson sequence has 23 activities (concept, examples, learn, learn_sentence, how_to_say, recognize x2, match, db_order, fill_blank, spell, db_translate, listen, identify_heard, listening_dictation, pronunciation, minimal_pairs, speaking, writing_practice, choose_natural_expression, guided_production, free_response, review, challenge). This is a comprehensive sequence but may take 15-25 minutes to complete — longer than the recommended 5-minute micro-lesson.

**App status:** **FIXED.** The app already saves and restores stage session state (activity index, stats, per-activity DOM state). The Exit button now reads "Save & Exit" to reassure students their progress is preserved. A toast notification ("Welcome back! Your progress was saved") appears when resuming a mid-lesson session. The `close()` function explicitly saves before clearing state, so the throttled 500ms save can't be lost (commit aad0394).

### 3.2 First Win Timing — Verify onboarding flow

**Research:** Products should get users to a completed unit or demonstrated skill within the first 10 minutes. Onboarding should be designed for "time-to-first-win" rather than "time-to-first-lesson" ([DigiA, 2024](https://www.digia.tech/post/edtech-app-engagement-why-85-percent-abandon-before-week-3/)).

**App status:** The app has an adaptive placement test (10-minute cap, max 20 questions) followed by a paywall. The first lesson ("I am: your first English sentence") is well-designed as a first win. However, the placement test + paywall before the first lesson may delay the first win beyond 10 minutes.

**Recommendation:** Consider allowing new users to try the first lesson immediately (before or during the placement test) to deliver a quick win, then use the placement test to personalize subsequent lessons.

### 3.3 Spacing Intervals — Well-calibrated

**Research:** The meta-analysis found that shorter spacing is as effective as longer spacing on immediate posttests, but longer spacing is more effective on delayed posttests. The optimal spacing depends on the retention interval — if you want students to remember something in 2 weeks, shorter intervals work; if you want them to remember in 6 months, longer intervals are better ([Wiley, 2021](https://onlinelibrary.wiley.com/doi/full/10.1111/lang.12479)).

**App status:** The app's SRS intervals (1d → 3d → 7d → 16d) are appropriate for medium-term retention (weeks to months). The expanding pattern is supported by research (equal and expanding were found equivalent, so expanding is a safe choice).

---

## 4. Potential Bugs and Issues

### 4.1 SRS localStorage Dependency

**Issue:** SRS state is stored in `localStorage` (`pel_srs_v1`) with server sync as a fire-and-forget mirror. If localStorage is cleared or unavailable, SRS state is lost. The server sync may not have completed before the data was cleared.

**Impact:** Students who clear browser data or use private mode lose their review schedule. Due items won't resurface, and the SRS intervals reset to zero.

**FIXED:** On app load, `srsSync()` is now awaited (with a 5-second timeout) before the app is revealed. The server is effectively the source of truth, with localStorage as a cache (commit 8bf7a96).

### 4.2 Mastery Gate Minimum Threshold

**Issue:** When `prodTotal < 3` (fewer than 3 production activities), the mastery gate passes automatically regardless of accuracy. This means short lessons or lessons where the mic is unavailable for all production activities (selfCheck-only) always pass.

**Impact:** A student could complete a lesson with 0% production accuracy if there are fewer than 3 production activities. This is intentional (can't penalize for missing mic), but it means the mastery gate is effectively disabled for some lessons.

**Recommendation:** This is acceptable for the self-check case (can't penalize for no mic). For non-self-check lessons, consider whether `MASTERY_MIN_PROD = 3` is the right threshold. If a lesson legitimately has only 2 production activities, the gate should perhaps still check accuracy.

### 4.3 Hint Timing and Accessibility

**Issue:** A Reddit survey found that easily accessible hints (appearing after 2-3 seconds) reduce motivation, discourage original responses, and make learners dependent on model answers. Learners interpret hint appearance as judgment that they were "too slow" ([Reddit r/languagelearning](https://www.reddit.com/r/languagelearning/comments/1lze50r/what_are_your_biggest_problems_with_language/)).

**Impact:** If the app shows hints too quickly, students may never attempt to produce language independently.

**VERIFIED:** Hints in speaking and free_response activities already require explicit user action (clicking "Hear it", "Speak now", or "Done"). No auto-appearing hints found. The model answer in free_response is revealed only after submission. No changes needed (commit b8906e3).

### 4.4 Streak Forgiveness Mechanics

**Research:** EdTech research recommends pairing streak systems with forgiveness mechanics (streak freeze, catch-up option, soft reset). Avoid resetting streaks to zero after a missed day. Avoid guilt-based messages. Duolingo's Streak Freeze increased daily active learners ([DigiA, 2024](https://www.digia.tech/post/edtech-app-engagement-why-85-percent-abandon-before-week-3/)).

**App status:** **FIXED.** The app has streak mechanics (XP, day streak, longest streak) with a new streak freeze system: students earn 1 freeze every 3 consecutive study days (capped at 2). When a streak would reset due to a missed day, a freeze is consumed to preserve the current streak. Toasts notify when freezes are earned or consumed. Stored in localStorage (no DB schema changes) (commit b06c5e3).

### 4.5 Progress Visibility

**Research:** Replace consumption metrics ("modules completed", "hours watched") with capability metrics ("You can now read 400 new characters", "Your accuracy improved from 48% to 71%"). Show progress before the Week-3 evaluation point when users decide whether to continue ([DigiA, 2024](https://www.digia.tech/post/edtech-app-engagement-why-85-percent-abandon-before-week-3/)).

**App status:** **FIXED.** The dashboard now shows capability metrics: words learned (from SRS store count), due reviews (from SRS due list), XP, and streak freezes. These appear in a stats row below the hero card on the home view (commit dacbf22, b06c5e3).

### 4.6 App Retention — Industry Context

**Research:** Only about 25% of language app users return by day 30. About 85% of EdTech app users abandon before Week 3. Duolingo reports ~50% new user drop-off within the first week. The 85% Week-3 dropout rate is "consistent across edtech apps, categories, and geographies" ([Quantumrun](https://www.quantumrun.com/consulting/language-learning-apps/); [DigiA, 2024](https://www.digia.tech/post/edtech-app-engagement-why-85-percent-abandon-before-week-3/)).

**Impact:** The app faces the same retention challenge as all EdTech products. The mastery gate and SRS are retention-positive features (they give students a reason to return), but the lesson length (23 activities) may be a retention risk.

### 4.7 Speech Recognition Reliability

**Issue:** The app uses a Whisper Edge Function for speech recognition. The CAPT systematic review found that ASR-based pronunciation training is effective but depends heavily on the quality of the speech recognition. If Whisper's accuracy is inconsistent (especially for Arabic-accented English), students may get frustrated and disengage.

**Recommendation:** Log speech recognition success/failure rates. If accuracy is below 80%, consider adding a fallback (e.g., "We couldn't hear you clearly. Try again or click 'I said it correctly' for self-check"). The app already has a self-check fallback, which is good.

---

## 5. What the App Does Well (Research-Backed)

1. **Arabic-speaker-specific pronunciation work** — Minimal pairs, phoneme contrast drills, "How to Say It" feature with Arabic transliteration. No other app offers this for Saudi learners. Aligned with British Council recommendations for Arabic speakers.

2. **Spaced repetition** — SM-2-lite with expanding intervals. Supported by meta-analysis showing medium-to-large effect on L2 learning.

3. **Mastery-based progression** — 60% first-try production accuracy gate with retry. Supported by mastery learning research (effect size 0.59).

4. **Saudi dialect (not MSA)** — Arabic transliteration uses conversational Saudi Arabic. Appropriate for the target audience.

5. **CEFR-aligned curriculum** — Levels A0-C1 with 14 academies. Aligned with Cambridge CEFR principles.

6. **Adaptive placement test** — Step-up/step-down with early termination. Well-designed for accurate placement.

7. **Self-check fallback** — When mic is unavailable, students can self-assess. This is pedagogically sound (better than blocking progress for hardware limitations).

8. **Production before free response** — Guided production always comes before free response. This is good scaffolding.

9. **Server-authoritative completion** — Lesson completion is tracked server-side, not in localStorage. Prevents cheating and data loss.

10. **Comprehensive skill coverage** — The 23-activity sequence covers vocabulary, grammar, spelling, translation, listening, pronunciation, speaking, writing, and conversation. This is more comprehensive than most apps.

---

## 6. Priority Recommendations

| Priority | Issue | Recommendation | Effort | Status |
|---|---|---|---|---|
| High | SRS localStorage dependency | Make server the source of truth; always srsSync() on load | Medium | **DONE** (commit 8bf7a96) |
| High | Lesson length (23 activities) | Allow resume mid-lesson; consider micro-sessions | Low (resume exists) | **DONE** (commit aad0394) |
| Medium | Feedback quality | Add explanatory feedback for grammar exercises | Medium | **DONE** (commit b8906e3) |
| Medium | Hint timing | Verify hints require explicit user action | Low | **DONE** — verified (commit b8906e3) |
| Medium | Streak forgiveness | Add streak freeze mechanic if streaks exist | Medium | **DONE** (commit b06c5e3) |
| Medium | Progress visibility | Show capability metrics on dashboard | Medium | **DONE** (commit dacbf22) |
| Low | Mastery gate minimum | Consider whether MASTERY_MIN_PROD=3 is right | Low | Documented |
| Low | Speech recognition logging | Log success/failure rates for monitoring | Low | Future work |

---

## Sources

- [British Council — Tips for teaching English to Arabic speakers](https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers)
- [Wiley — The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis](https://onlinelibrary.wiley.com/doi/full/10.1111/lang.12479)
- [PMC — A Practical Review of Mastery Learning](https://pmc.ncbi.nlm.nih.gov/articles/PMC10159400/)
- [Cambridge RECALL — Computer-assisted pronunciation training: A systematic review](https://www.cambridge.org/core/journals/recall/article/computerassisted-pronunciation-training-a-systematic-review/71E786F7DFC99727837909FDED7A2320)
- [Frontiers in Education — Motivation, engagement, and autonomy in gamified MALL (Saudi EFL learners)](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1935767/full)
- [DigiA — EdTech App Engagement: Why 85% Drop Off Before Week 3](https://www.digia.tech/post/edtech-app-engagement-why-85-percent-abandon-before-week-3/)
- [ACTFL — Provide Effective Feedback](https://www.actfl.org/educator-resources/guiding-principles-for-language-learning/provide-effective-feedback)
- [Reddit r/languagelearning — Biggest problems with language learning apps](https://www.reddit.com/r/languagelearning/comments/1lze50r/what_are_your_biggest_problems_with_language/)
- [Cambridge English — Using the CEFR: Principles of Good Practice](https://www.cambridgeenglish.org/Images/126011-using-cefr-principles-of-good-practice.pdf)
- [The Linguist — Does Duolingo Work?](https://blog.thelinguist.com/duolingo-review/)
- [Quantumrun — Language Learning Apps Statistics 2026](https://www.quantumrun.com/consulting/language-learning-apps/)
- [AppImp — What users complain about in language learning apps](https://appimp.app/markets/language-learning-apps)
- [EJEDU — Systematic Review of Communicative Language Teaching](https://eu-opensci.org/index.php/ejedu/article/view/30763)
