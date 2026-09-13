#!/usr/bin/env python3
"""Audit all lessons for teaching-quality issues.
Checks: vocab items with no context sentences, fake dialogues, thin lessons.
"""
import json, sys, urllib.request, os

PAT = os.environ.get("SUPABASE_PAT", "")
if not PAT:
    print("Set SUPABASE_PAT env var first."); sys.exit(1)
PROJ = "lewoochehpiycocvfwtz"
URL = f"https://api.supabase.com/v1/projects/{PROJ}/database/query"
UA = "Mozilla/5.0"

def run_sql(sql):
    body = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": f"Bearer {PAT}", "User-Agent": UA,
        "Accept": "application/json", "Content-Type": "application/json"
    })
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode())

# Get all lessons with their items
print("Querying all lessons and items...")
rows = run_sql("""
SELECT 
  l.id as lesson_id, l.title_en, l.title_ar,
  li.kind, li.en, li.ar_meaning, li.example_en, li.translit
FROM lessons l
LEFT JOIN lesson_items li ON li.lesson_id = l.id
ORDER BY l.id, li.idx
""")

# Group by lesson
lessons = {}
for r in rows:
    lid = r['lesson_id']
    if lid not in lessons:
        lessons[lid] = {'title': r['title_en'], 'items': []}
    if r['kind']:
        lessons[lid]['items'].append(r)

# Analyze
issues = {
    'no_vocab': [],          # lessons with no word/phrase items
    'no_sentences': [],       # vocab items with no context sentences
    'no_example': [],         # vocab items with no example_en
    'fake_dialogue': [],      # sentence items that aren't real dialogues
    'thin_lesson': [],        # < 4 items total
    'vocab_no_match': [],     # vocab word not in any sentence
}

import re
def norm(s):
    return re.sub(r'[^a-z0-9 ]', '', (s or '').lower()).strip()

def is_dialogue_marker(en):
    if not en: return False
    if '?' in en: return True
    return bool(re.match(r'^(how|what|where|when|who|why|do|can|are|is|would|could|will|hi|hey|hello|good\s|morning|evening)\b', en.strip(), re.I))

total = len(lessons)
print(f"Found {total} lessons, auditing...")

for lid, info in lessons.items():
    items = info['items']
    vocab = [i for i in items if i['kind'] in ('word', 'phrase')]
    sentences = [i for i in items if i['kind'] == 'sentence']
    explains = [i for i in items if i['kind'] in ('pattern', 'explain')]
    
    if not vocab:
        issues['no_vocab'].append(lid)
    if len(items) < 4:
        issues['thin_lesson'].append(f"{lid} ({len(items)} items)")
    
    # Check each vocab item
    for v in vocab:
        if not v.get('example_en'):
            issues['no_example'].append(f"{lid}/{v['en']}")
        
        # Check if vocab word appears in any sentence
        if sentences:
            vnorm = norm(v['en'])
            found = False
            for s in sentences:
                snorm = norm(s['en'])
                stokens = snorm.split()
                vtokens = vnorm.split()
                if vtokens and all(t in stokens for t in vtokens):
                    found = True
                    break
            if not found:
                issues['vocab_no_match'].append(f"{lid}/{v['en']}")
        else:
            issues['no_sentences'].append(f"{lid}/{v['en']}")
    
    # Check if sentences are a real dialogue
    if sentences and len(sentences) >= 3:
        has_real = any(is_dialogue_marker(s.get('en','')) for s in sentences)
        if not has_real:
            issues['fake_dialogue'].append(f"{lid} ({len(sentences)} sentences)")

# Print report
print(f"\n{'='*60}")
print(f"DB LESSON AUDIT REPORT ({total} lessons)")
print(f"{'='*60}")

for issue, desc in [
    ('no_vocab', 'Lessons with NO vocab items'),
    ('no_sentences', 'Vocab items with NO context sentences in lesson'),
    ('no_example', 'Vocab items with NO example_en'),
    ('vocab_no_match', 'Vocab words NOT found in any sentence'),
    ('fake_dialogue', 'Lessons with fake dialogue (standalone sentences)'),
    ('thin_lesson', 'Lessons with < 4 items'),
]:
    print(f"\n{desc}: {len(issues[issue])}")
    for item in issues[issue][:10]:
        print(f"  - {item}")
    if len(issues[issue]) > 10:
        print(f"  ... and {len(issues[issue])-10} more")

# Summary stats
print(f"\n{'='*60}")
print("SUMMARY")
print(f"  Total lessons: {total}")
print(f"  Lessons with vocab: {total - len(issues['no_vocab'])}")
print(f"  Lessons with sentences: {sum(1 for l in lessons.values() if any(i['kind']=='sentence' for i in l['items']))}")
print(f"  Vocab items missing example_en: {len(issues['no_example'])}")
print(f"  Vocab items with no matching sentence: {len(issues['vocab_no_match'])}")
print(f"  Lessons with fake dialogue: {len(issues['fake_dialogue'])}")
