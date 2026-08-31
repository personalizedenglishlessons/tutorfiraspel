#!/usr/bin/env python3
"""Inject PEL_ACADEMY_VOCAB (academy id -> [matching VOCAB_BANK indices]) and
patch genericLesson to pick topic-matched vocab instead of length-based arbitrary."""
import re

PATH = '/home/user/workspace/tutorfiraspel/app.html'
src = open(PATH, encoding='utf-8').read()

# academy id -> VOCAB_BANK categories that match its topic
ACADEMY_VOCAB_CATS = {
    'restaurant-english': ['Restaurant English'],
    'hospital-english': ['Hospital English'],
    'business-english': ['Business English'],
    'workplace-communication': ['Workplace Communication'],
    'job-interview-academy': ['Job Interview Academy'],
    'airport-english': ['Airport English'],
    'shopping-english': ['Shopping English'],
    'travel-english': ['Travel English'],
    'hotel-english': ['Hotel English'],
    'driving-english': ['Driving English'],
    'emergency-english': ['Emergency English'],
    'english-foundations': ['Family', 'Colors', 'Daily Life'],
    'saudi-family': ['Family'],
    'saudi-daily-life': ['Daily Life'],
    'saudi-coffee-shop': ['Daily Life'],
    'everyday-english': ['Daily Life'],
}

# VOCAB_BANK -> category -> [indices]
vb_start = src.find('const VOCAB_BANK')
vb_text = src[vb_start:src.find('const LESSON_LIBRARY', vb_start)]
cat_indices = {}
idx = -1
i = vb_text.find('{en:')
while i != -1:
    depth = 0; j = i
    while j < len(vb_text):
        c = vb_text[j]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                break
        j += 1
    entry = vb_text[i:j + 1]
    idx += 1
    cm = re.search(r"category:'([^']+)'", entry)
    if cm:
        cat_indices.setdefault(cm.group(1), []).append(idx)
    i = vb_text.find('{en:', j + 1)

# Build PEL_ACADEMY_VOCAB JS object
entries = []
for ac_id, cats in ACADEMY_VOCAB_CATS.items():
    matched = sorted(set(i for c in cats for i in cat_indices.get(c, [])))
    if matched:
        entries.append("  '{}':[{}]".format(ac_id, ','.join(str(i) for i in matched)))
js_map = "const PEL_ACADEMY_VOCAB = {\n" + ',\n'.join(entries) + "\n};\n"

# Insert the map right before genericLesson (only once)
if 'PEL_ACADEMY_VOCAB' not in src:
    gl = src.find('function genericLesson(bankItem, academy){')
    assert gl != -1, 'genericLesson not found'
    src = src[:gl] + js_map + src[gl:]
    print('Inserted PEL_ACADEMY_VOCAB ({} academies).'.format(len(entries)))
else:
    print('PEL_ACADEMY_VOCAB already present, skipping insert.')

# Patch genericLesson's v1/v2 selection to use matched vocab
old = ("  const v1 = VOCAB_BANK[(bankItem.id.length * 3) % VOCAB_BANK.length];\n"
       "  const v2 = VOCAB_BANK[(bankItem.id.length * 7 + 2) % VOCAB_BANK.length];")
new = ("  const _m = PEL_ACADEMY_VOCAB[academy.id];\n"
       "  let v1, v2;\n"
       "  if(_m && _m.length){\n"
       "    v1 = VOCAB_BANK[_m[bankItem.id.length % _m.length]];\n"
       "    v2 = VOCAB_BANK[_m[(bankItem.id.length + 1) % _m.length]];\n"
       "  } else {\n"
       "    v1 = VOCAB_BANK[(bankItem.id.length * 3) % VOCAB_BANK.length];\n"
       "    v2 = VOCAB_BANK[(bankItem.id.length * 7 + 2) % VOCAB_BANK.length];\n"
       "  }")
assert old in src, 'genericLesson v1/v2 block not found verbatim'
src = src.replace(old, new)
print('Patched genericLesson vocab selection.')

open(PATH, 'w', encoding='utf-8').write(src)
