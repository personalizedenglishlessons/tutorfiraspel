#!/usr/bin/env python3
"""Re-point lesson vocab arrays to topic-matched VOCAB_BANK entries.
For academies whose themed vocab category exists in VOCAB_BANK, replace each
lesson's arbitrary `vocab:[VOCAB_BANK[x], VOCAB_BANK[y]]` with 2 matched entries
(rotated for variety). Leaves unmapped academies untouched (need new vocab)."""
import re, sys

PATH = '/home/user/workspace/tutorfiraspel/app.html'
src = open(PATH, encoding='utf-8').read()
orig = src

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
}

# --- VOCAB_BANK -> category -> [indices] ---
vb_start = src.find('const VOCAB_BANK')
vb_text = src[vb_start:src.find('const LESSON_LIBRARY', vb_start)]
cat_indices = {}
_idx = -1
_i = vb_text.find('{en:')
while _i != -1:
    depth = 0; _j = _i
    while _j < len(vb_text):
        c = vb_text[_j]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                break
        _j += 1
    entry = vb_text[_i:_j + 1]
    _idx += 1
    cm = re.search(r"category:'([^']+)'", entry)
    if cm:
        cat_indices.setdefault(cm.group(1), []).append(_idx)
    _i = vb_text.find('{en:', _j + 1)

# --- ACADEMY_LESSONS -> academy_id -> [lesson_ids] ---
al_start = src.find('const ACADEMY_LESSONS')
al_text = src[al_start:src.find('];', al_start) + 1]
academy_lessons = {}
for m in re.finditer(r"'([a-z0-9-]+)':\s*\[([^\]]*)\]", al_text):
    academy_lessons[m.group(1)] = [x.strip().strip("'") for x in m.group(2).split(',') if x.strip()]

def find_lesson_vocab_range(s, lid):
    """Return (start, end) of the vocab:[...] array for lesson id `lid`, or None.
    Tracks bracket depth so nested [..] inside VOCAB_BANK[x] don't fool us."""
    idpos = s.find("id:'{}'".format(lid))
    if idpos == -1:
        return None
    vpos = s.find('vocab:[', idpos)
    if vpos == -1:
        return None
    # scan from the '[' after 'vocab:' tracking depth
    i = vpos + len('vocab:')  # points at '['
    depth = 0
    for j in range(i, len(s)):
        c = s[j]
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                return vpos, j + 1
    return None

repointed = 0
for ac_id, cats in ACADEMY_VOCAB_CATS.items():
    matched = []
    for c in cats:
        matched.extend(cat_indices.get(c, []))
    matched = sorted(set(matched))
    if not matched:
        print("  [skip] {} — no themed vocab for {}".format(ac_id, cats))
        continue
    lessons = academy_lessons.get(ac_id, [])
    for li, lid in enumerate(lessons):
        rng = find_lesson_vocab_range(src, lid)
        if not rng:
            continue
        a, b = rng
        # pick 2 distinct matched indices, rotating per lesson for variety
        n = len(matched)
        i1 = matched[li % n]
        i2 = matched[(li + 1) % n]
        if n == 1:
            i2 = matched[0]
        new = "vocab:[VOCAB_BANK[{}], VOCAB_BANK[{}]]".format(i1, i2)
        src = src[:a] + new + src[b:]
        repointed += 1

if src == orig:
    print("No changes made.")
    sys.exit(0)

open(PATH, 'w', encoding='utf-8').write(src)
print("Re-pointed {} lessons' vocab to themed entries.".format(repointed))
print("Categories mapped:")
for c, idxs in cat_indices.items():
    print("  {} -> {} entries".format(c, len(idxs)))
