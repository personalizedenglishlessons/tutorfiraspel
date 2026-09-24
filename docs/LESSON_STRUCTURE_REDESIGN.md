# PEL Lesson Structure Redesign — Saudi-First Approach

**Date:** September 24, 2026
**Goal:** Make lessons work the way they should — fewer buggy activities, Saudi dialect throughout, Arabic transliteration of English, unique structure no app on the market offers.

---

## What's Wrong Now

1. **Too many activities per lesson** — `buildSequence()` forces every lesson through up to 26 activity types. Many are generic, don't match the lesson content, or have empty/bad data. Students see too many steps, many of which feel repetitive or broken.

2. **Generic content not tied to lesson** — scenario_roleplay, intonation, writing_practice, and minimal_pairs rotate through fixed sets regardless of lesson topic. A lesson about "greetings" shouldn't have a random "at the airport" scenario.

3. **Missing or weak Saudi Arabic** — some activities use MSA or generic Arabic instead of Saudi spoken dialect. The tone is formal where it should be friendly and casual.

4. **Arabic transliteration underused** — the `translit` field exists on every vocab item but is only shown passively. It should be a prominent "How to Say It" feature.

5. **No cultural context** — lessons don't connect to Saudi daily life (workplace, family, prayer times, Saudi Vision 2030, common social situations).

6. **Speaking anxiety unaddressed** — 100% of Saudi EFL learners report fear of speaking. No encouragement messages, no low-pressure mode.

---

## Research Synthesis

### What the best apps do (and PEL should learn from)

| Source | Key insight | PEL application |
|--------|------------|-----------------|
| **Duolingo** ([blog.duolingo.com](https://blog.duolingo.com/duolingo-teaching-method/)) | Adaptive difficulty, bite-sized, pattern noticing, "at the edge" of ability | Cap lessons at 10-14 strong steps. Skip activities that don't match the lesson. |
| **Babbel** ([babbel.com](https://www.babbel.com/how-babbel-works)) | Real conversation focus, speaking from lesson 1, spaced repetition integrated into lessons (not separate) | SRS "due today" queue at lesson start. Speaking woven in naturally. |
| **Rosetta Stone** ([blog.rosettastone.com](https://blog.rosettastone.com/what-you-can-learn-with-just-one-lesson-of-rosetta-stone/)) | Dynamic Immersion — images, context, no translation. 8-12 activities per lesson, ~10 min each. | Keep lessons visual and contextual. Don't over-explain in Arabic — let students figure it out. |
| **Busuu** ([busuu.com](https://www.busuu.com/en/it-works/busuu-methodology)) | PPP: introduce → contextualize → controlled practice → free practice. Language in chunks, not isolated words. | Structure lessons as: See It → Practice It → Use It → Own It. |
| **PPP framework** ([theteflacademy.com](https://www.theteflacademy.com/blog/ppp-in-the-efl-classroom/)) | Presentation → Practice → Production. Start with warmer, end with delayed error correction. | Warm-up at start, Mistake Coach as delayed error correction near end. |
| **Koder guide** ([koder.ai](https://koder.ai/blog/build-mobile-app-language-learning-practice)) | Warm-up → Learn → Practice → Quick check. SRS as "due today" queue. 5-10 new items per lesson. 2-5 min core cycle. | Cap new vocab at 3-5 items. Quick check = Challenge activity. |
| **Anything.com** ([anything.com](https://www.anything.com/blog/how-to-build-a-language-learning-app)) | Mix formats. Require retrieval not just recognition. "3 correct in a row" progression. SRS in every interaction. | Mix recognition + production activities. Don't let students just tap through. |
| **Babbel SRS** ([babbel.com](https://www.babbel.com/spaced-repetition-language-learning)) | Review intervals: 1 day → 4 days → 7 days → 14 days → 60 days → 6 months. Review items in different order each time. | PEL already has SRS (1/3/7/14/30). Add shuffle to review. |

### What no app offers Saudi learners (the gap)

| Gap | Evidence | PEL's unique opportunity |
|-----|----------|-------------------------|
| **Saudi spoken dialect** (not MSA) | Mainstream apps use MSA or English-only. Even Duolingo's Arabic interface uses MSA. ([learnenglish.life](https://learnenglish.life/resources/best-english-app-for-arabic-speakers/)) | PEL already uses Saudi dialect. Make it the default everywhere, including instructions and feedback. |
| **Arabic transliteration of English** | No major app shows English words written in Arabic letters for pronunciation. ([learnenglish.life](https://learnenglish.life/resources/best-english-app-for-arabic-speakers/)) | PEL already has `translit` field. Make it a prominent "How to Say It" card. |
| **Friendly, casual Arabic tone** | No app uses informal/friendly Arabic. All use formal instructional tone. | Use Saudi casual phrasing: "يلا نتعلم", "ما عليك، حاول مرة ثانية", "تحاول؟" |
| **Saudi cultural context** | No app embeds Saudi daily life (workplace, family, prayer times, Vision 2030). | Add cultural notes tied to lesson topics. |
| **Saudi-specific error coaching** | No app has built-in Saudi error patterns (verb "to be" omission, article usage, word order). | PEL already has Mistake Coach. Make it more prominent and relevant. |
| **Speaking anxiety support** | 100% of Saudi EFL learners report speaking fear. No app addresses this. ([e-iji.net](https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf)) | Add encouragement messages in Saudi dialect before speaking activities. Add no-pressure practice mode. |

---

## The PEL Lesson Recipe — 5 Phases

### Phase 1: WARM-UP (1-2 steps)
- **Daily Word/Phrase** — word of the day in Saudi dialect, with transliteration
- **SRS Due Review** — 1-4 items from previous lessons that are due for review (most overdue first)
- Friendly Saudi greeting: "يلا نبدأ" (Let's start)

### Phase 2: SEE IT (2-4 steps)
- **Concept Card** — grammar rule explained in Saudi Arabic, step by step
- **Example Sentences** — real sentences showing the concept in context
- **"How to Say It" Card** — NEW: prominent card showing the English word + Arabic transliteration + audio. This is the unique PEL feature — English pronunciation written in Arabic letters.
- Only show concept cards if the lesson has real grammar notes. Skip for pure vocab lessons.

### Phase 3: PRACTICE IT (3-5 steps)
Difficulty ramps from recognition to production:
- **Recognize** — multiple choice (EN → Saudi Arabic meaning)
- **Match** — pair matching (taught items only)
- **Build a Sentence** — word ordering (authored exercise or good synthetic)
- **Fill the Blank** — cloze exercise
- **Spell** — spelling (authored or generic)
- **Translate** — EN ↔ AR translation
- Skip any activity that has no real data for this lesson. Don't force generic exercises.

### Phase 4: USE IT (3-5 steps)
- **Listen** — audio listening
- **Identify Heard** — what did you hear? (multiple choice)
- **Listening Dictation** — write what you hear
- **Pronunciation** — mic recording + Whisper scoring
- **Speaking** — sentence speaking with mic
- Pre-speaking encouragement: "خذ راحتك، محد يسمعك الا الموقع" (Take your time, no one hears you but the app)
- Post-exercise: "الغلط عادي، هذا كيف نتعلم" (Mistakes are normal, that's how we learn)
- **Conversation/Dialogue** — only if the lesson has a real dialogue (3+ lines)
- **Scenario Role-Play** — only if scenario matches lesson topic by keyword. Skip if no match.

### Phase 5: OWN IT (2-4 steps)
- **Saudi Mistake Coach** — common Saudi error patterns matched to lesson content (max 2, never blocking)
- **Writing Practice** — short writing exercise (only if lesson has real writing prompts)
- **Guided Production** — bridge from controlled to free practice
- **Free Response** — open-ended production
- **Review** — active recall of today's taught items + SRS due items
- **Challenge** — quick-fire test on taught items only

### Adaptive Injection (conditional)
- **Excelling** (avgScore ≥ 0.8, 2+ lessons): bonus activity from unlocked tool
- **Struggling** (avgScore < 0.5, 2+ lessons): extra reinforcement before challenge
- **New level reached**: introduce newly unlocked tool as micro-activity

---

## Key Design Principles

1. **Cap at 10-14 strong steps** — never force all 26 activity types. Skip activities with no real data.
2. **Saudi dialect everywhere** — instructions, feedback, encouragement, error messages. No MSA.
3. **"How to Say It" card** — the signature PEL feature. English word + Arabic transliteration + audio. Prominent, not hidden.
4. **Friendly tone** — "يلا", "ما عليك", "حلو", "عاش". Not formal textbook Arabic.
5. **Cultural context** — tie scenarios and examples to Saudi daily life.
6. **Anxiety-aware** — encouragement before speaking, normalize mistakes, optional no-pressure mode.
7. **SRS integrated** — due items at lesson start, not a separate feature.
8. **Retrieval over recognition** — mix production activities, not just multiple choice.
9. **Conditional activities** — scenario, intonation, writing, minimal pairs only when they match the lesson.
10. **Immediate feedback** — correct/incorrect + explanation in Saudi Arabic.

---

## Implementation Plan

### Step 1: Refactor `buildSequence()` 
- Group activities into 5 phases
- Add data quality checks — skip activities with empty/bad data
- Cap total at 14 steps max
- Make scenario, intonation, writing, minimal pairs conditional on topic match

### Step 2: Add "How to Say It" card
- New activity type: `how_to_say`
- Shows English word + Arabic transliteration + audio button
- Inserted after concept cards, before practice activities
- Uses existing `translit` field from vocab items

### Step 3: Add friendly Saudi Arabic messages
- Pre-speaking encouragement messages
- Post-exercise framing messages
- Error feedback in Saudi dialect
- Lesson start greeting: "يلا نتعلم"

### Step 4: Add cultural context notes
- Tie scenario selection to lesson keywords
- Add Saudi cultural context to concept cards
- Examples: workplace etiquette, family terms, prayer-time expressions

### Step 5: Add validation tests
- Generate lesson sequences for all lessons
- Flag: missing Saudi Arabic, missing translit, repeated sentences, generic prompts, empty data
- Broken lessons fail locally before reaching users
