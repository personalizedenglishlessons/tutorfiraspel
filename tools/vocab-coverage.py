#!/usr/bin/env python3
"""Diagnose vocab mismatch coverage: for each lesson, can we auto-match
its academy category to VOCAB_BANK entries of the same category?"""
import re, json

src = open('/home/user/workspace/tutorfiraspel/app.html', encoding='utf-8').read()

# --- 1. VOCAB_BANK -> list of (index, category, en) ---
vb_start = src.find('const VOCAB_BANK')
vb_text = src[vb_start:src.find('const LESSON_LIBRARY', vb_start)]
vocab = []
chunks = re.split(r'\{en:', vb_text)
for ch in chunks[1:]:
    en_m = re.match(r"([^']+)", ch)
    cat_m = re.search(r"category:'([^']+)'", ch)
    vocab.append({'en': en_m.group(1) if en_m else '?', 'category': cat_m.group(1) if cat_m else '?'})
print(f"VOCAB_BANK entries: {len(vocab)}")
cats = {}
for v in vocab:
    cats.setdefault(v['category'], []).append(v)
print("VOCAB categories:")
for c, lst in cats.items():
    print(f"  {c!r}: {len(lst)} entries -> {', '.join(v['en'] for v in lst[:6])}")

# --- 2. ACADEMIES -> {academyId: category} ---
am_start = src.find('const ACADEMIES')
am_text = src[am_start:src.find('const ACADEMY_LESSONS', am_start)]
academies = {}
for m in re.finditer(r"id:'([^']+)'[^}]*?cat:'([^']+)'", am_text, re.S):
    academies[m.group(1)] = m.group(2)
print(f"\nACADEMIES: {len(academies)}")
acad_cats = set(academies.values())
print("Academy categories:", sorted(acad_cats))

# --- 3. ACADEMY_LESSONS -> {academyId: [lessonIds]} ---
al_start = src.find('const ACADEMY_LESSONS')
al_text = src[al_start:src.find('];', al_start) + 1]
academy_lessons = {}
for m in re.finditer(r"('([a-z0-9-]+)':\s*\[([^\]]*)\])", al_text):
    academy_id = m.group(2)
    lesson_ids = [x.strip().strip("'") for x in m.group(3).split(',') if x.strip()]
    academy_lessons[academy_id] = lesson_ids
total_lessons = sum(len(v) for v in academy_lessons.values())
print(f"ACADEMY_LESSONS: {len(academy_lessons)} academies, {total_lessons} lessons")

# --- 4. For each academy, count vocab matches ---
print("\n=== COVERAGE PER ACADEMY ===")
matched = 0; unmatched_acads = []
for ac_id, lessons in academy_lessons.items():
    ac_cat = academies.get(ac_id, '?')
    # find vocab entries whose category contains a keyword from academy cat or id
    matches = [i for i, v in enumerate(vocab) if v['category'] == ac_cat or ac_cat in v['category'] or v['category'] in ac_cat]
    status = f"{len(matches)} vocab match" if matches else "NO MATCH"
    if not matches: unmatched_acads.append((ac_id, ac_cat, len(lessons)))
    else: matched += len(lessons)
    print(f"  {ac_id} ({ac_cat!r}, {len(lessons)} lessons): {status}")
print(f"\nLessons with auto-matchable vocab: {matched}/{total_lessons}")
print(f"Academies needing new themed vocab: {len(unmatched_acads)}")
for ac_id, cat, n in unmatched_acads:
    print(f"   {ac_id} ({cat!r}, {n} lessons)")
