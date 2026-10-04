# Transliteration Rules — PEL (Personalized English Lessons)

**Rule:** All English-to-Arabic transliteration in this app MUST use Arabic
codepoints only. No Persian (Farsi) or Urdu letters anywhere.

**This is an American English curriculum.** All transliterations must
follow American pronunciation, never British. For example:
- schedule → سكيدج-ول (American "sked-jool", NOT British "shed-yool")
- either → اذر (American "ee-ther", NOT British "eye-ther")
- neither → نيذر (American "nee-ther", NOT British "nye-ther")
- mobile → موبال (American "moh-bul", NOT British "moh-bile")
- privacy → برايڤاسي (American "pry-vuh-see", NOT British "priv-uh-see")
- garage → قيروج (American "guh-rahzh", NOT British "garr-idge")

## Arabic letter mapping for English sounds

| English sound | Arabic letter | Example        | Transliteration |
|---------------|---------------|-----------------|-----------------|
| a             | ا             | about           | اباوت           |
| b             | ب             | best            | بست             |
| p             | ب             | please          | بليز            |
| t             | ت             | table           | تيبل            |
| th (voiceless)| ث             | think           | ثينك            |
| j / soft g    | ج             | job             | جوب             |
| ch            | تش            | chair           | تشير            |
| h             | ح / ه         | hello           | هيلو            |
| k / hard ch   | ك             | check (ch=k)    | هايديك (headache)|
| d             | د             | door            | دور             |
| r             | ر             | red             | ريد             |
| z             | ز             | zoo             | زو              |
| s             | س             | sun             | سن              |
| sh            | ش             | she             | شي              |
| s (emphatic)  | ص             | (rare)          |                 |
| d (emphatic)  | ض             | (rare)          |                 |
| t (emphatic)  | ط             | (rare)          |                 |
| gh            | غ             | go (g sound)    | قو              |
| f             | ف             | fish            | فيش             |
| q / hard g    | ق             | go, give        | قو, قيڤ         |
| k             | ك             | cat             | كات             |
| l             | ل             | love            | لوڤ             |
| m             | م             | man             | مان             |
| n             | ن             | no              | نو              |
| w             | و             | water           | واتر            |
| v             | ڤ             | very            | ڤيري           |
| y             | ي             | yes             | يس              |

## Banned codepoints (Persian/Urdu — must never appear)

| Banned character | Unicode | Use instead |
|------------------|---------|-------------|
| ی (Persian Yeh)  | U+06CC  | ي (U+064A)  |
| ک (Persian Keheh)| U+06A9  | ك (U+0643)  |
| پ (Persian Pe)   | U+067E  | ب (U+0628)  |
| گ (Persian Gaf)  | U+06AF  | ق (U+0642)  |
| چ (Persian Che)  | U+0686  | تش or ك or ج|
| ٹ (Urdu Teh)     | U+0679  | ت (U+062A)  |
| ے (Persian Yeh)  | U+06D2  | ي (U+064A)  |

## Pronunciation clarity rules

1. Use hyphens in tricky words to show pronunciation breaks:
   - nervous → نر-وس
   - looking → لوك-ينق

2. Separate syllables with spaces where it aids reading:
   - I am a little → اي ام ا ليتل

3. The "ch" sound uses تش (two letters), the "k" sound uses ك:
   - chair → تشير (ch sound)
   - headache → هيداك (k sound, not هيداتش)

4. The "g" sound uses ق (most common) or ج (for soft g):
   - go → قو
   - gym → جيم

5. The "p" sound uses ب (same as b — Arabic has no separate p letter):
   - please → بليز
   - people → بيبال

6. **Pronunciation hyphens** — use hyphens to show syllable breaks in
   tricky words where the pronunciation is not obvious from the fused
   Arabic spelling. This is mandatory for:

   ### -ing words (the ending is a separate syllable)
   - looking → لوك-ينق
   - going → قو-ينق
   - doing → دو-ينق
   - speaking → سبيك-ينق
   - morning → مور-نينق
   - evening → ايڤ-نينق
   - training → تري-نينق

   ### -tion/-sion words
   - presentation → بريزن-تيشن
   - reservation → ريزر-ڤيشن
   - appointment → اب-وينت-منت
   - pronunciation → برونانسي-يشان

   ### Words with unclear syllable breaks
   - understand → اندر-ستاند
   - yourself → يور-سلف
   - available → اڤيل-ابل
   - comfortable → كمفور-تابل
   - important → امبور-تانت
   - different → ديف-رنت
   - second → سيك-اند
   - sentence → سن-تنس
   - support → سب-اورت
   - project → بروج-يكت
   - schedule → سكيدج-ول (American pronunciation)
   - hospital → هاسبي-تال
   - interview → انتر-ڤيو
   - describe → ديس-كرايب
   - explain → اكس-بلين
   - nervous → نر-وس
   - passport → باس-بورت
   - export → اكس-بورت
   - transport → ترانس-بورت

   ### Do NOT hyphenate:
   - Short single-syllable words (cat, dog, book)
   - Words where the Arabic spelling already makes the pronunciation clear
   - Every multi-syllable word — only add hyphens where ambiguity exists

## Verification

Run this command to check for banned codepoints:

```bash
python3 -c "
import re
banned = re.compile('[\u06CC\u06A9\u067E\u06AF\u0686\u0679\u06D2]')
with open('app.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if banned.search(line):
            print(f'L{i}: {line.strip()[:120]}')
"
```

This should return zero results.
