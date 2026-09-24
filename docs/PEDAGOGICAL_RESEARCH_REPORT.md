# PEL Pedagogical Research Report
## Web-Based Research on Lesson Activities, Learning Methods, and Upgrade Opportunities

**Date:** September 24, 2026
**Research basis:** British Council, Frontiers in Education, Nature, Cambridge, Wiley, Saudi EFL studies, Supabase best practices

---

## 1. What the App Currently Does (Audit)

### Lesson Architecture (13+ step progressive sequence)
The PEL lesson stage follows a well-structured progressive sequence:
1. **Learn** — Vocabulary introduction (word + example sentence)
2. **Learn sentence** — Word in a different context sentence
3. **Recognize** — Multiple choice (EN→AR)
4. **Match** — Vocabulary pair matching (taught items only)
5. **Build a sentence** — Word ordering (authored or synthetic)
6. **Fill the blank** — Cloze exercise
7. **Spell** — Spelling (authored or generic)
8. **Translate** — EN↔AR translation
9. **Listen** — Audio listening
10. **Identify heard** — Identify what you heard (multiple choice)
11. **Listening dictation** — Write what you hear
12. **Pronunciation** — Mic recording + Whisper on-device + scoring
13. **Speaking** — Sentence speaking with mic
14. **Conversation response** — Dialogue completion
15. **Complete dialogue** — Fill dialogue gaps
16. **Grammar correction** — Fix the error
17. **Choose natural expression** — Pragmatics
18. **Mistake coach** — Targeted Saudi-specific error correction
19. **Guided production** — Bridge to free response

### What the App Does Well (Research-Validated)
| Feature | Research support |
|---------|-----------------|
| Communicative approach (word→sentence→question→conversation) | CLT is the recommended approach for Saudi EFL learners ([e-iji.net](https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf)) |
| Spaced repetition (SRS) with cross-device sync | SRS produces medium-to-large effects on L2 learning ([Wiley meta-analysis](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479)) |
| Minimal pair pronunciation tips (/p/-/b/, /f/-/v/, /θ/-/s/) | These are the exact phoneme contrasts Arabic speakers struggle with ([British Council](https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers), [Taylor & Francis](https://www.tandfonline.com/doi/full/10.1080/23311983.2024.2390777)) |
| Saudi Arabic dialect (not MSA) | Culturally responsive pedagogy is a key recommendation ([sciedupress.com](https://www.sciedupress.com/journal/index.php/wjel/article/download/30288/17937)) |
| Gamification (XP, streaks, badges, confetti) | Gamification increases motivation, engagement, and autonomy ([Frontiers in Education](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1935767/full)) |
| Microlearning (one activity at a time) | Bite-sized lessons with spaced repetition are the most effective mobile learning pattern ([ACM](https://dl.acm.org/doi/pdf/10.1145/3098279.3098565)) |
| Mistake coach (Saudi-specific patterns) | Explicit pragmatic instruction and contrastive analysis are recommended ([macrothink.org](https://www.macrothink.org/journal/index.php/jsel/article/download/22438/17276)) |
| Real-life situations (doctor, greetings, family, numbers) | Authentic, meaning-focused activities are the top recommendation ([e-iji.net](https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf)) |
| Progressive difficulty | "Progressive difficulty, cognitive scaffolding, and systematic retrieval practice" are key to effectiveness ([Applied Research on English Language](https://are.ui.ac.ir/article_30531_667c8f8338ad34d21ba58738b1d761db.pdf)) |
| Immediate feedback | Mobile apps with immediate feedback increase learner autonomy and confidence ([Frontiers in Education](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1935767/full)) |

---

## 2. Research-Based Upgrade Recommendations

### HIGH PRIORITY

#### A. Proactive Minimal Pair Drills
**Current state:** The app has reactive minimal pair tips in `pronFeedback()` — shown after a pronunciation mistake is detected (e.g., "you said 'bencil' but target is 'pencil'").

**Research finding:** Arabic speakers need dedicated phoneme contrast practice before encountering words in context. The most persistent errors are /p/-/b/, /θ/-/s/, /ð/-/z/, /v/-/f/, and consonant clusters ([British Council](https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers), [Sage Journals](https://journals.sagepub.com/doi/10.1177/1362168820931888)).

**Upgrade:** Add a "Pronunciation Studio" activity type with dedicated minimal pair drills:
- Show two words (e.g., "pen" vs "ben")
- Student listens to both, then records themselves saying each
- Score each word, highlight the contrast
- Progress through: /p/-/b/ → /f/-/v/ → /θ/-/s/ → /ð/-/z/ → /t/-/d/ → consonant clusters

#### B. Scenario-Based Role-Play (TBLT)
**Current state:** The app has `conversation_response` and `complete_dialogue` activities, but these are structured fill-in-the-blank, not open-ended.

**Research finding:** Task-Based Language Teaching (TBLT) shows significantly larger effects on fluency and complexity than PPP ([Wiley](https://onlinelibrary.wiley.com/doi/10.1111/ijal.12608), effect size d=0.93 in [Columbia meta-analysis](https://academiccommons.columbia.edu/doi/10.7916/b47t-6w60/download)). Saudi learners specifically need "authentic speaking opportunities" and "role-plays, simulations, project-based learning" ([e-iji.net](https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf)).

**Upgrade:** Add a "Scenario Mode" with branching dialogues:
- Real-life situations: at the airport, ordering food, at the doctor, asking directions, phone call
- Student chooses what to say from 2-3 options
- Different choices lead to different outcomes (branching)
- No single "correct" answer — natural conversation flow

#### C. Speaking Anxiety Reduction
**Current state:** Pronunciation exercises show scores and error tips. No explicit anxiety reduction framing.

**Research finding:** 100% of Saudi EFL students reported fear and anxiety during speaking. Recommended: "normalize mistakes as part of language learning," "constructive, low-stakes feedback," "design tasks that gradually build confidence" ([e-iji.net](https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf)).

**Upgrade:**
- Add a "Practice Mode" toggle: no scoring, no streak impact, encouraging messages
- Add pre-speaking encouragement messages in Saudi Arabic: "خذ راحتك، محد يسمعك الا الموقع" (Take your time, no one hears you but the app)
- Add post-exercise framing: "الغلط عادي، هذا كيف نتعلم" (Mistakes are normal, that's how we learn)

### MEDIUM PRIORITY

#### D. Intonation and Stress Pattern Exercises
**Current state:** Pronunciation scoring uses word-level matching (`wordMatchScore`). No intonation or stress pattern exercises.

**Research finding:** "Incorrect intonation" and "incorrect application of stress patterns" are specifically identified as challenges for Saudi learners ([e-iji.net](https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf)). Intonation patterns can cause misunderstandings or sound rude to native speakers ([British Council](https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers)).

**Upgrade:** Add intonation exercises:
- Listen to the same sentence with rising vs falling intonation
- Identify: Is this a question or a statement?
- Listen to polite vs direct versions of the same request
- Match intonation to emotion (happy, angry, tired)

#### E. Writing Practice
**Current state:** The app has spelling and dictation exercises but no dedicated writing practice.

**Research finding:** Arabic speakers struggle with English writing: RTL→LTR direction, upper/lower case, punctuation. The British Council recommends "fun dictation activities" and "activities in which students write their own materials" ([British Council](https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers)).

**Upgrade:** Add short writing exercises:
- Sentence completion (type the missing word in a sentence)
- Message writing (write a short WhatsApp-style message)
- Sentence rearrangement with typing (not just drag-and-drop)

#### F. Vocabulary Depth (Collocations, Word Families)
**Current state:** The app teaches vocabulary in context with examples, sentences, and some synonyms/antonyms in the data model. The `COMMON_VERBS` list is comprehensive.

**Research finding:** 80% of Saudi students identified lack of vocabulary as their biggest barrier ([e-iji.net](https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf)). Research recommends teaching vocabulary in communicative contexts with collocations and word families.

**Upgrade:** Expand vocabulary metadata to include:
- Collocations (which words commonly go together)
- Word family (derive, derivation, derivative)
- Multiple meanings (bank = river bank / financial bank)
- Register (formal vs informal)

### LOWER PRIORITY

#### G. Pragmatic Competence Exercises
**Current state:** The app has `choose_natural_expression` exercises which touch on pragmatics.

**Research finding:** Saudi EFL learners need "explicit pragmatic instruction" and "culturally relevant contexts" ([macrothink.org](https://www.macrothink.org/journal/index.php/jsel/article/download/22438/17276)). Imperative translation should be taught as "multidimensional competence" ([acr-journal.com](https://acr-journal.com/article/download/pdf/3348/)).

**Upgrade:** Add exercises on:
- Polite vs direct requests ("Could you..." vs "Do...")
- Formal vs informal register (talking to a boss vs a friend)
- Appropriate responses in social situations (thanking, apologizing, refusing)

#### H. Grammar Transfer Error Targeting
**Current state:** The mistake coach targets Saudi-specific patterns, and grammar correction exercises exist.

**Research finding:** Common Arabic→English transfer errors: omitting verb "to be" ("He happy"), present perfect misuse ("I have seen him yesterday"), overuse of present continuous, adjective-noun word order ([British Council](https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers)).

**Upgrade:** Add dedicated grammar exercises that specifically target:
- Verb "to be" omission (present tense)
- Present perfect vs past simple
- Adjective-noun word order
- Article usage (a/an/the — Arabic has no articles)

---

## 3. Pedagogical Approach Comparison

| Approach | Research Recommendation | PEL Current State | Gap |
|----------|------------------------|-------------------|-----|
| CLT (Communicative Language Teaching) | Recommended for Saudi EFL | ✅ Implemented (word→sentence→conversation) | None |
| PPP (Presentation-Practice-Production) | Effective but less than TBLT | ✅ Used for vocabulary introduction | Consider TBLT hybrid |
| TBLT (Task-Based Language Teaching) | Significantly larger effects on fluency (d=0.93) | ⚠️ Partial (conversation exercises) | Add scenario-based tasks |
| SRS (Spaced Repetition) | Medium-to-large effect on L2 learning | ✅ Implemented with cross-device sync | None |
| Microlearning | Most effective mobile pattern | ✅ One activity at a time | None |
| Gamification | Increases motivation and engagement | ✅ XP, streaks, badges, confetti | None |
| Explicit pragmatic instruction | Recommended for Saudi learners | ⚠️ Partial (choose_natural_expression) | Add register/politeness exercises |
| Pronunciation (minimal pairs) | Key for Arabic speakers | ✅ Reactive tips in pronFeedback | Add proactive drills |
| Writing practice | Recommended by British Council | ❌ Missing | Add short writing exercises |
| Intonation/stress | Key challenge for Arabic speakers | ❌ Missing | Add intonation exercises |
| Anxiety reduction | 100% of Saudi students report fear | ⚠️ Not addressed | Add practice mode + encouragement |

---

## 4. Conclusion

The PEL app is **pedagogically sound and well-aligned with current research**. It implements CLT, SRS, microlearning, gamification, and Saudi-specific cultural adaptation — all of which are research-validated approaches. The minimal pair pronunciation tips and mistake coach are particularly well-designed for Arabic speakers.

The most impactful upgrades, in priority order:
1. **Proactive minimal pair drills** (addresses the #1 pronunciation challenge)
2. **Scenario-based role-play** (addresses TBLT research + authentic communication need)
3. **Speaking anxiety reduction** (addresses 100% anxiety rate in Saudi learners)
4. **Intonation exercises** (addresses a documented gap)
5. **Writing practice** (addresses a documented gap)

None of these are bug fixes — the app works correctly. They are feature enhancements grounded in peer-reviewed research on teaching English to Arabic speakers, specifically Saudi learners.

---

## Sources

- [British Council — Tips for teaching English to Arabic speakers](https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers)
- [e-iji.net — Barriers to English-Speaking Proficiency among Saudi EFL Learners](https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf)
- [Frontiers in Education — Gamified mobile-assisted language learning](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1935767/full)
- [Wiley — Spaced practice on second language learning (meta-analysis)](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479)
- [Wiley — Localized TBLT vs PPP](https://onlinelibrary.wiley.com/doi/10.1111/ijal.12608)
- [Columbia — TBLT meta-analysis (d=0.93)](https://academiccommons.columbia.edu/doi/10.7916/b47t-6w60/download)
- [Sage Journals — English pronunciation of Arabic speakers](https://journals.sagepub.com/doi/10.1177/1362168820931888)
- [Taylor & Francis — Phonetic challenges: /p/ for Saudi EFL learners](https://www.tandfonline.com/doi/full/10.1080/23311983.2024.2390777)
- [sciedupress.com — Saudi Vision 2030 ELT policies](https://www.sciedupress.com/journal/index.php/wjel/article/download/30288/17937)
- [macrothink.org — Pragmatic competence in Saudi EFL learners](https://www.macrothink.org/journal/index.php/jsel/article/download/22438/17276)
- [ACM — Mobile microlearning sessions](https://dl.acm.org/doi/pdf/10.1145/3098279.3098565)
- [Applied Research on English Language — Gamified mobile learning](https://are.ui.ac.ir/article_30531_667c8f8338ad34d21ba58738b1d761db.pdf)
- [Cambridge — Task-Based Language Teaching](https://www.cambridge.org/core/elements/taskbased-language-teaching/395B3D3B0F7078DF325579CC8314E38B)
