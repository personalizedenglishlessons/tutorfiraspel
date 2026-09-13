# DB Lesson Audit Report

## Scope
346 lessons audited against lesson_items table.

## Findings

### Critical: Vocab items with no context (419 items, 233 with zero sentences)
419 vocab items have no `example_en` field. 233 have no context sentences
in their lesson at all. 313 vocab words don't appear in any sentence item.

**Code mitigation**: buildSequence now matches vocab with conversation/example
sentences that contain the word. Activities that require sentence context
(fill_blank, arrange_words, speaking, guided_production) are SKIPPED when no
valid sentence exists. The student sees a shorter lesson but everything shown
makes sense.

**Content fix needed**: Add `example_en`/`example_ar` to vocab items, or add
sentence items that contain the vocab words.

### 33 lessons with fake dialogue
These lessons have `kind: 'sentence'` items that are standalone examples
(e.g., "I am fine.", "I am ready."), not real dialogues. dbToLesson maps them
to conversation with fake A/B speakers, which made conversation_response and
complete_dialogue activities nonsensical.

**Code fix applied**: `isRealDialogue()` now checks for questions or
conversational openers. Dialogue activities are only generated for real
dialogues. Affected lessons:
- a1pos-have-has, a2-checkpoint-1, adj-describing, articles-a-an-the
- b1-agreeing-disagreeing, b1-checkpoint-communication, b1-checkpoint-grammar
- b1-modals-deduction, b2-expressing-opinions, be-contractions
- (and 23 more)

### 31 lessons with no vocab items
Pure grammar/pattern lessons (e.g., be-contractions, do-questions, articles).
These rely on dbNotes (concept cards) and exercises. The engine handles them
via concept cards + authored exercises.

### 9 lessons with < 4 items
Very thin lessons (checkpoint-be has 1 item). These will have very short
sequences. Consider merging or enriching.

## Code fixes applied (all lessons benefit)

1. **Teach before test**: learn_sentence shown for all items with real sentences
2. **Sentence matching**: vocab items matched with example sentences from lesson
3. **Activity guards**: fill_blank/arrange_words/speaking/guided_production
   skipped when sentence is too short or target word not in sentence
4. **isRealDialogue**: dialogue activities only for real conversations
5. **goodSentence/tokensContain**: proper validators prevent substring false
   matches (e.g., "is" inside "this")
6. **exampleSentences pool**: dbToLesson exposes sentence items as a flat pool
   separate from the fake A/B conversation mapping
