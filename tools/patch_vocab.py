#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Append themed VOCAB_BANK entries from batch_vocab_data.DATA and rebuild the
PEL_ACADEMY_VOCAB map for the academies in DATA. Idempotent.

String-aware: VOCAB_BANK is located by finding `const VOCAB_BANK =` then its
opening `[`, then scanning with string/escape awareness for the matching `]`.
Only that exact span is the array; entries are parsed within it. This avoids
miscounting `{en:` objects that live in OTHER consts (GRAMMAR_TOPICS, etc.)
between VOCAB_BANK and LESSON_LIBRARY.
"""
import re, sys
sys.path.insert(0, '/home/user/workspace/tutorfiraspel/tools')
import batch_vocab_data as BVD

PATH = '/home/user/workspace/tutorfiraspel/app.html'
src = open(PATH, encoding='utf-8').read()

# ---- find the VOCAB_BANK array span (string-aware bracket match) ----
def find_array_span(src, name):
    i = src.find(name)
    assert i != -1, name + ' not found'
    p = i
    while p < len(src) and src[p] != '=':
        p += 1
    p += 1
    while p < len(src) and src[p].isspace():
        p += 1
    assert src[p] == '[', name + ' value is not an array'
    start = p  # position of '['
    j = p
    depth = 0
    in_str = None
    esc = False
    while j < len(src):
        c = src[j]
        if in_str:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == in_str:
                in_str = None
        else:
            if c in ('"', "'", '`'):
                in_str = c
            elif c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    break
        j += 1
    return start, j  # span of the array incl. brackets

vb_start, vb_end = find_array_span(src, 'const VOCAB_BANK =')
vb_text = src[vb_start:vb_end + 1]
# inner content between [ and ]
inner_start = 1
inner_end = len(vb_text) - 1  # position of closing ]

# ---- parse existing entries within VOCAB_BANK only ----
def parse_entries(text):
    out = []
    idx = -1
    i = text.find('{en:')
    while i != -1:
        depth = 0
        j = i
        while j < len(text):
            c = text[j]
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    break
            j += 1
        entry = text[i:j + 1]
        idx += 1
        em = re.search(r"en:'((?:[^'\\]|\\.)*)'", entry)
        cm = re.search(r"category:'((?:[^'\\]|\\.)*)'", entry)
        out.append((idx, em.group(1) if em else '', cm.group(1) if cm else ''))
        i = text.find('{en:', j + 1)
    return out

existing = parse_entries(vb_text[inner_start:inner_end])
existing_keys = set((en, cat) for _, en, cat in existing)
print('Existing VOCAB_BANK entries:', len(existing))

# ---- which DATA entries are new? ----
new_entries = [d for d in BVD.DATA if (d[3]['en'], d[1]) not in existing_keys]
print('New entries to add this run:', len(new_entries))

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def entry_js(d):
    w = d[3]
    return (
      "{en:'%s', ipa:'%s', ar:'%s', translit:'%s', "
      "example:{en:'%s', ar:'%s', translit:'%s'}, "
      "synonyms:'%s', antonyms:'%s', family:'%s', collocations:'%s', "
      "category:'%s', difficulty:'%s', tip:'%s', mistake:'%s'}"
    ) % (
      esc(w['en']), esc(w['ipa']), esc(w['ar']), esc(w['translit']),
      esc(w['ex_en']), esc(w['ex_ar']), esc(w['ex_tr']),
      esc(w['syn']), esc(w['ant']), esc(w['fam']), esc(w['coll']),
      esc(d[1]), esc(d[2]), esc(w['tip']), esc(w['mistake']),
    )

if new_entries:
    # Insert right before the closing ']' of VOCAB_BANK.
    # Ensure preceding content ends with a comma+newline.
    block = ',\n' + ',\n'.join(entry_js(d) for d in new_entries)
    insert_at = vb_end  # absolute position of ']' in src; insert before it
    src = src[:insert_at] + block + src[insert_at:]
    print('Appended', len(new_entries), 'entries starting at index', len(existing))
    open(PATH, 'w', encoding='utf-8').write(src)
    src = open(PATH, encoding='utf-8').read()
    vb_start, vb_end = find_array_span(src, 'const VOCAB_BANK =')
    vb_text = src[vb_start:vb_end + 1]
    existing = parse_entries(vb_text[1:len(vb_text)-1])

# ---- rebuild PEL_ACADEMY_VOCAB map for academies in DATA ----
academies_in_data = []
for d in BVD.DATA:
    if d[0] not in academies_in_data:
        academies_in_data.append(d[0])

cat_idx = {}
for idx, en, cat in existing:
    cat_idx.setdefault(cat, []).append(idx)

map_start = src.find('const PEL_ACADEMY_VOCAB')
map_end = src.find('};', map_start) + 2
existing_map_text = src[map_start:map_end]
preserve_lines = []
for line in existing_map_text.splitlines():
    m = re.match(r"\s*'([^']+)':\[", line)
    if m and m.group(1) not in academies_in_data:
        preserve_lines.append(line.strip().rstrip(',').strip())

new_lines = list(preserve_lines)
for ac_id in academies_in_data:
    cats = sorted(set(d[1] for d in BVD.DATA if d[0] == ac_id))
    matched = sorted(set(i for c in cats for i in cat_idx.get(c, [])))
    new_lines.append("  '%s':[%s]" % (ac_id, ','.join(str(i) for i in matched)))
js_map = "const PEL_ACADEMY_VOCAB = {\n" + ',\n'.join(new_lines) + "\n};"
src = src[:map_start] + js_map + src[map_end:]
open(PATH, 'w', encoding='utf-8').write(src)
print('Rebuilt PEL_ACADEMY_VOCAB map with', len(academies_in_data), 'academies.')

print('\nAcademy vocab mapping:')
en_by_idx = {idx: en for idx, en, cat in existing}
for ac_id in academies_in_data:
    cats = sorted(set(d[1] for d in BVD.DATA if d[0] == ac_id))
    matched = sorted(set(i for c in cats for i in cat_idx.get(c, [])))
    words = [en_by_idx.get(i, '?') for i in matched]
    print('  %s -> %s' % (ac_id, words))
