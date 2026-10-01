#!/usr/bin/env python3
"""Comprehensive audit: DB exercises + phonetic engine.
Reads from tools/audit_data/*.json (already fetched).
Outputs full report to tools/exercise_audit_report.txt
"""
import json
import re
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "audit_data")

# === Phonetic engine (mirrors app.html) ===
LETTER_NAMES = {'a':'اي','b':'بي','c':'سي','d':'دي','e':'اي','f':'اف','g':'جي','h':'ايتش','i':'اي','j':'جاي','k':'كي','l':'ال','m':'ام','n':'ان','o':'او','p':'بي','q':'كيو','r':'ار','s':'اس','t':'تي','u':'يو','v':'ڤي','w':'دبليو','x':'اكس','y':'واي','z':'زد'}

CONTRACTIONS = {
    "i'm":'ايم',"don't":'دونت',"can't":'كانت',"won't":'ونت',"isn't":'ازنت',
    "aren't":'ارنت',"wasn't":'وازنت',"weren't":'ويرنت',"didn't":'ديدنت',
    "doesn't":'دازنت',"couldn't":'كودنت',"shouldn't":'شودنت',"wouldn't":'ودنت',
    "haven't":'هاڤنت',"hasn't":'هازنت',"hadn't":'هادنت',"let's":'لتس',
    "it's":'اتس',"that's":'ذاتس',"what's":'واتس',"there's":'ذيرز',
    "you're":'يور',"we're":'وير',"they're":'ذير',"i'll":'ايل',"you'll":'يول',
    "he'll":'هيل',"she'll":'شيل',"we'll":'ويل',"they'll":'ذيل',"i've":'ايڤ',
    "you've":'يوڤ',"we've":'ويڤ',"they've":'ذيڤ',"i'd":'ايد',"you'd":'يود',
}

G2P_MULTI = [
    ['tion','SH AH N'],['sion','ZH AH N'],['ture','CH ER'],['sure','SH ER'],['ous','AH S'],
    ['ough','AH F'],['augh','AO'],['igh','AY'],['eigh','EY'],['aigh','EY'],
    ['th','TH'],['sh','SH'],['ch','CH'],['ph','F'],['ck','K'],['ng','NG'],
    ['qu','K W'],['wh','W'],['gh',''],
    ['ee','IY'],['ea','IY'],['oo','UW'],['oa','OW'],['ou','AW'],['ow','OW'],
    ['ai','EY'],['ay','EY'],['ey','EY'],['oy','OY'],['oi','OY'],['ie','IY'],
    ['ue','UW'],['ui','UW'],['au','AO'],['aw','AO'],['er','ER'],['ir','ER'],
    ['ur','ER'],['ar','AA R'],['or','AO R'],['air','EH R'],['are','EH R'],
    ['ear','IH R'],['oor','AO R'],['our','AO R'],['ere','IH R'],
]

G2P_SINGLE = {
    'a':'AE','b':'B','c':'K','d':'D','e':'EH','f':'F','g':'G','h':'HH','i':'IH','j':'JH',
    'k':'K','l':'L','m':'M','n':'N','o':'AA','p':'P','q':'K','r':'R','s':'S','t':'T',
    'u':'AH','v':'V','w':'W','x':'K S','y':'Y','z':'Z'
}

def g2p(word):
    w = word.lower().replace(r'[^a-z]', '')
    w = re.sub(r'[^a-z]', '', w)
    if not w: return []
    if len(w) > 3 and w.endswith('e') and not w.endswith('ee') and not w.endswith('oe'):
        w = w[:-1]
    w = re.sub(r'([bcdfghjklmnpqrstvxz])\1', r'\1', w)
    out = []
    i = 0
    while i < len(w):
        matched = False
        for pat, ph in G2P_MULTI:
            if w[i:i+len(pat)] == pat:
                out.extend([p for p in ph.split(' ') if p])
                i += len(pat)
                matched = True
                break
        if matched: continue
        ch = w[i]
        if ch == 'c':
            out.append('S' if (i+1 < len(w) and w[i+1] in 'eiy') else 'K')
            i += 1; continue
        if ch == 'g':
            out.append('JH' if (i+1 < len(w) and w[i+1] in 'eiy') else 'G')
            i += 1; continue
        if ch == 'y':
            prev_cons = i > 0 and w[i-1] not in 'aeiou'
            out.append('Y' if ((i == 0 or prev_cons) and i+1 < len(w) and w[i+1] in 'aeiou') else 'IY')
            i += 1; continue
        if ch == 'e' and i == len(w) - 1:
            i += 1; continue
        out.extend([p for p in G2P_SINGLE.get(ch, '').split(' ') if p])
        i += 1
    return out

def phon_to_ar(ph):
    phon = ph if isinstance(ph, list) else ph.split()
    out = ''
    for i, p in enumerate(phon):
        stress = re.search(r'\d$', p)
        base = re.sub(r'\d$', '', p)
        prev = re.sub(r'\d$', '', phon[i-1]) if i > 0 else ''
        nxt = re.sub(r'\d$', '', phon[i+1]) if i+1 < len(phon) else ''
        word_start = i == 0
        word_end = i == len(phon) - 1
        rep = ''
        if base == 'B': rep = 'ب'
        elif base == 'CH': rep = 'تش'
        elif base == 'D': rep = 'د'
        elif base == 'DH': rep = 'ذ'
        elif base == 'F': rep = 'ف'
        elif base == 'G': rep = 'ق'
        elif base == 'HH': rep = 'ه'
        elif base == 'JH': rep = 'ج'
        elif base == 'K': rep = 'ك'
        elif base == 'L': rep = 'ل'
        elif base == 'M': rep = 'م'
        elif base == 'N': rep = 'ن'
        elif base == 'NG': rep = 'نج'
        elif base == 'P': rep = 'ب'
        elif base == 'R': rep = 'ر'
        elif base == 'S': rep = 'س'
        elif base == 'SH': rep = 'ش'
        elif base == 'T': rep = 'ت'
        elif base == 'TH': rep = 'ث'
        elif base == 'V': rep = 'ڤ'
        elif base == 'W': rep = 'و'
        elif base == 'Y': rep = 'ي'
        elif base == 'Z': rep = 'ز'
        elif base == 'ZH': rep = 'ج'
        elif base == 'AA':
            if prev == 'W': rep = 'ا'
            elif nxt in ('R','DH','TH','S'): rep = 'ا'
            else: rep = 'و'
        elif base == 'AE': rep = 'ا'
        elif base == 'AH': rep = 'ا'
        elif base == 'AO': rep = 'و'
        elif base == 'AW': rep = 'او'
        elif base == 'AY': rep = 'اي'
        elif base == 'EH': rep = 'ا' if word_start else 'ي'
        elif base == 'ER':
            if prev == 'W': rep = 'ور'
            elif word_start: rep = 'اير'
            else: rep = 'ر' if (stress and stress.group() == '0' and word_end) else 'ير'
        elif base == 'EY': rep = 'اي' if (word_start or nxt in ('OW','IH','AH','ER','IY','EY','AE','EH')) else 'ي'
        elif base == 'IH': rep = 'ا' if (word_start and nxt != 'NG') else 'ي'
        elif base == 'IY': rep = 'اي' if word_start else 'ي'
        elif base == 'OW': rep = 'و'
        elif base == 'OY': rep = 'وي'
        elif base == 'UH': rep = 'و'
        elif base == 'UW': rep = 'و'
        if rep: out += rep
    return out

def translit_word(word):
    bare = re.sub(r'[^a-z\']', '', word.lower())
    if not bare: return ''
    if re.match(r"^[a-z][a-z']*$", bare):
        key = bare.replace("'", "")
        if CONTRACTIONS.get(bare): return CONTRACTIONS[bare]
        # PHON_DICT check done by caller
        return phon_to_ar(g2p(bare))
    return word

def translit_en(text, phon_dict=None):
    if not text: return ''
    tokens = re.findall(r"[A-Za-z']+|[^A-Za-z']+", text)
    out = ''
    for tok in tokens:
        if not re.search(r'[A-Za-z]', tok):
            out += tok; continue
        punct = re.search(r"[^A-Za-z']+$", tok)
        word = tok[:-len(punct.group())] if punct else tok
        is_acronym = bool(re.match(r'^[A-Z]{2,4}$', word))
        if is_acronym:
            ar = ' '.join(LETTER_NAMES.get(ch, ch) for ch in word.lower())
        else:
            bare = re.sub(r'[^a-z\']', '', word.lower())
            key = bare.replace("'", "")
            if CONTRACTIONS.get(bare):
                ar = CONTRACTIONS[bare]
            elif phon_dict and phon_dict.get(key):
                ar = phon_dict[key]
            else:
                ar = translit_word(word)
        out += ar + (punct.group() if punct else '')
    return out.replace('?', '؟')

# === Load PHON_DICT from app.html ===
def load_phon_dict(filepath):
    """Extract PHON_DICT from app.html."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find the PHON_DICT block
    match = re.search(r"const PHON_DICT = \{(.*?)\};", content, re.DOTALL)
    if not match:
        print("WARNING: Could not find PHON_DICT in app.html")
        return {}
    body = match.group(1)
    phon_dict = {}
    # Parse key:'value' pairs
    for m in re.finditer(r"'([^']+)':'([^']*)'", body):
        phon_dict[m.group(1)] = m.group(2)
    return phon_dict

# === Persian codepoint check ===
PERSIAN_CHARS = {'\u0698','\u06AF','\u067E','\u0686','\u069A','\u06A9','\u06CC'}

def has_persian(s):
    if not s or not isinstance(s, str): return False
    return any(c in PERSIAN_CHARS for c in s)

def has_diacritics(s):
    if not s or not isinstance(s, str): return False
    return bool(re.search(r'[\u064B-\u065F\u0670]', s))

def has_doubled_alef(s):
    if not s or not isinstance(s, str): return False
    return 'اا' in s

def norm(s):
    if not s: return ''
    return re.sub(r'\s+', ' ', s.lower().strip())

# === Exercise audit ===
def audit_exercises(exercises, phon_dict):
    issues = []
    
    for ex in exercises:
        ex_id = ex['id']
        ex_type = ex['type']
        payload = ex['payload']
        
        # Parse payload
        if payload is None:
            issues.append(("EMPTY_PAYLOAD", f"ex#{ex_id} ({ex_type}): payload is null"))
            continue
        
        if isinstance(payload, str):
            stripped = payload.strip()
            if stripped.startswith('{') or stripped.startswith('['):
                try:
                    payload = json.loads(stripped)
                except:
                    issues.append(("STRINGIFIED_PAYLOAD", f"ex#{ex_id} ({ex_type}): payload is stringified JSON"))
                    continue
            else:
                issues.append(("STRINGIFIED_PAYLOAD", f"ex#{ex_id} ({ex_type}): payload is plain string '{stripped[:80]}'"))
                continue
        
        if not isinstance(payload, dict):
            issues.append(("MALFORMED_PAYLOAD", f"ex#{ex_id} ({ex_type}): payload is {type(payload).__name__}"))
            continue
        
        # Type-specific checks
        if ex_type == 'choose':
            correct = payload.get('correct') or payload.get('answer')
            options = payload.get('options') or payload.get('choices') or []
            ar = payload.get('ar')
            tr = payload.get('tr') or payload.get('translate')
            
            if not correct:
                issues.append(("NO_CORRECT", f"ex#{ex_id} ({ex_type}): no correct answer"))
            if not options or len(options) < 2:
                issues.append(("TOO_FEW_OPTIONS", f"ex#{ex_id} ({ex_type}): {len(options) if options else 0} options"))
            if correct and options:
                cn = norm(correct)
                ons = [norm(o) for o in options]
                if cn not in ons and correct not in options:
                    issues.append(("CORRECT_NOT_IN_OPTIONS", f"ex#{ex_id} ({ex_type}): correct='{correct}' not in {options}"))
                dup = sum(1 for o in ons if o == cn)
                if dup > 1:
                    issues.append(("DUP_CORRECT", f"ex#{ex_id} ({ex_type}): correct appears {dup}x in options"))
                seen = {}
                for i, o in enumerate(options):
                    on = norm(o)
                    if on in seen:
                        issues.append(("DUP_OPTION", f"ex#{ex_id} ({ex_type}): option[{i}]='{o}' dup of [{seen[on]}]"))
                    else:
                        seen[on] = i
                for i, o in enumerate(options):
                    if not o or not str(o).strip():
                        issues.append(("EMPTY_OPTION", f"ex#{ex_id} ({ex_type}): option[{i}] is empty"))
        
        elif ex_type == 'translate':
            correct = payload.get('correct') or payload.get('answer')
            ar = payload.get('ar')
            tr = payload.get('tr')
            options = payload.get('options') or []
            
            if not correct and not ar:
                issues.append(("NO_ANSWER", f"ex#{ex_id} ({ex_type}): no correct/answer"))
            
            if options and correct:
                cn = norm(correct)
                ons = [norm(o) for o in options]
                if cn not in ons and correct not in options:
                    issues.append(("CORRECT_NOT_IN_OPTIONS", f"ex#{ex_id} ({ex_type}): correct='{correct}' not in options"))
                dup = sum(1 for o in ons if o == cn)
                if dup > 1:
                    issues.append(("DUP_CORRECT", f"ex#{ex_id} ({ex_type}): correct appears {dup}x"))
                seen = {}
                for i, o in enumerate(options):
                    on = norm(o)
                    if on in seen:
                        issues.append(("DUP_OPTION", f"ex#{ex_id} ({ex_type}): option[{i}]='{o}' dup of [{seen[on]}]"))
                    else:
                        seen[on] = i
        
        elif ex_type == 'order':
            correct = payload.get('correct') or payload.get('answer')
            words = payload.get('words') or payload.get('pieces') or payload.get('options') or []
            
            if not correct:
                issues.append(("NO_CORRECT", f"ex#{ex_id} ({ex_type}): no correct answer"))
            if not words:
                issues.append(("NO_WORDS", f"ex#{ex_id} ({ex_type}): no words/pieces"))
        
        elif ex_type == 'correct':
            sentence = payload.get('sentence') or payload.get('en')
            correct = payload.get('correct') or payload.get('answer')
            options = payload.get('options') or payload.get('choices') or []
            
            if not sentence:
                issues.append(("NO_SENTENCE", f"ex#{ex_id} ({ex_type}): no sentence"))
            if not correct:
                issues.append(("NO_CORRECT", f"ex#{ex_id} ({ex_type}): no correct answer"))
            if options and correct:
                cn = norm(correct)
                ons = [norm(o) for o in options]
                if cn not in ons and correct not in options:
                    issues.append(("CORRECT_NOT_IN_OPTIONS", f"ex#{ex_id} ({ex_type}): correct='{correct}' not in options"))
                dup = sum(1 for o in ons if o == cn)
                if dup > 1:
                    issues.append(("DUP_CORRECT", f"ex#{ex_id} ({ex_type}): correct appears {dup}x"))
        
        elif ex_type == 'spell':
            correct = payload.get('correct') or payload.get('answer')
            if not correct:
                issues.append(("NO_CORRECT", f"ex#{ex_id} ({ex_type}): no correct answer"))
        
        # Persian/diacritics/doubled-alef checks on all Arabic fields
        if isinstance(payload, dict):
            for k, v in payload.items():
                if isinstance(v, str) and any('\u0600' <= c <= '\u06FF' for c in v):
                    if has_persian(v):
                        issues.append(("PERSIAN", f"ex#{ex_id} ({ex_type}): field '{k}' has Persian chars: '{v[:60]}'"))
                    if has_diacritics(v):
                        issues.append(("DIACRITICS", f"ex#{ex_id} ({ex_type}): field '{k}' has diacritics"))
                    if has_doubled_alef(v):
                        issues.append(("DOUBLED_ALEF", f"ex#{ex_id} ({ex_type}): field '{k}' has doubled alef: '{v[:60]}'"))
    
    return issues

# === Phonetic audit: check PHON_DICT entries and g2p output ===
def audit_phonetics(phon_dict):
    issues = []
    
    # 1. Check PHON_DICT entries for Persian/diacritics/doubled-alef
    for key, val in phon_dict.items():
        if has_persian(val):
            issues.append(("PHON_PERSIAN", f"PHON_DICT['{key}']='{val}' has Persian chars"))
        if has_diacritics(val):
            issues.append(("PHON_DIACRITICS", f"PHON_DICT['{key}']='{val}' has diacritics"))
        if has_doubled_alef(val):
            issues.append(("PHON_DOUBLED_ALEF", f"PHON_DICT['{key}']='{val}' has doubled alef"))
    
    # 2. Check for PHON_DICT entries where the key is a common word and the
    #    transliteration is obviously wrong (heuristic checks)
    # Known house-style patterns that are CORRECT (do NOT flag):
    # - پال endings (sample, simple, example) — systematic PHON_DICT style
    # - اقز convention (exact, exam) — Saudi ق=g reading
    # - Loanwords with native Arabic spellings
    HOUSE_STYLE_OK = {
        # These are known-good house style transliterations
    }
    
    # 3. Check g2p fallback for common words against PHON_DICT
    #    (where they disagree, the PHON_DICT wins, but if the g2p output
    #     is obviously wrong, the fallback rules need fixing)
    test_words = [
        'hello', 'world', 'water', 'father', 'mother', 'brother', 'sister',
        'house', 'school', 'teacher', 'student', 'book', 'pen', 'desk',
        'chair', 'table', 'door', 'window', 'light', 'night', 'day', 'morning',
        'afternoon', 'evening', 'yesterday', 'tomorrow', 'today', 'week',
        'month', 'year', 'time', 'hour', 'minute', 'second',
        'food', 'drink', 'breakfast', 'lunch', 'dinner',
        'red', 'blue', 'green', 'white', 'black', 'yellow',
        'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty',
        'work', 'job', 'office', 'company', 'business', 'meeting',
        'doctor', 'hospital', 'medicine', 'health', 'sick', 'well',
        'car', 'bus', 'train', 'plane', 'airport', 'ticket',
        'money', 'price', 'buy', 'sell', 'pay', 'cost',
        'love', 'like', 'want', 'need', 'have', 'get',
        'go', 'come', 'see', 'hear', 'speak', 'listen', 'read', 'write',
        'eat', 'drink', 'sleep', 'wake', 'run', 'walk', 'drive',
        'think', 'know', 'understand', 'remember', 'forget',
        'big', 'small', 'good', 'bad', 'new', 'old', 'hot', 'cold',
        'fast', 'slow', 'easy', 'hard', 'right', 'wrong',
        'open', 'close', 'start', 'stop', 'continue', 'finish',
        'question', 'answer', 'problem', 'solution', 'idea', 'plan',
    ]
    
    for word in test_words:
        g2p_result = translit_word(word)
        dict_val = phon_dict.get(word)
        if dict_val:
            # PHON_DICT has this word — check if g2p fallback matches
            if g2p_result and g2p_result != dict_val:
                # This is expected for many words (PHON_DICT overrides g2p)
                # But flag if g2p output is suspiciously wrong
                pass  # PHON_DICT wins, don't flag mismatches
        else:
            # Word not in PHON_DICT — g2p fallback handles it
            # Check for obvious g2p bugs
            if g2p_result:
                if has_doubled_alef(g2p_result):
                    issues.append(("G2P_DOUBLED_ALEF", f"g2p('{word}') = '{g2p_result}' has doubled alef"))
                if has_persian(g2p_result):
                    issues.append(("G2P_PERSIAN", f"g2p('{word}') = '{g2p_result}' has Persian chars"))
    
    # 4. Specific g2p rule checks — test known problem patterns
    # Vowel-initial words: EH, IY, ER at word start
    vowel_initial_tests = {
        'eat': 'اي',
        'each': 'ايچ',
        'ear': 'اير',
        'east': 'ايست',
        'easy': 'ايزي',
        'end': 'اند',
        'enter': 'انتر',
        'every': 'اڤري',
        'eye': 'اي',
        'is': 'ايز',
        'it': 'ات',
        'in': 'ان',
        'if': 'اف',
        'of': 'اڤ',
        'on': 'اون',
        'or': 'اور',
        'out': 'اوت',
        'old': 'اولد',
        'open': 'اوپن',
        'over': 'اوڤر',
        'own': 'اون',
    }
    
    for word, expected_start in vowel_initial_tests.items():
        result = translit_word(word)
        if result and not result.startswith(expected_start):
            # Only flag if the PHON_DICT doesn't already have it
            if word not in phon_dict:
                issues.append(("G2P_VOWEL_INITIAL", f"g2p('{word}') = '{result}', expected to start with '{expected_start}'"))
    
    return issues

# === Lesson items audit ===
def audit_items(items):
    issues = []
    for item in items:
        item_id = item['id']
        kind = item.get('kind', '')
        en = item.get('en', '')
        ar = item.get('ar_meaning', '')
        translit = item.get('translit', '')
        example_en = item.get('example_en', '')
        example_ar = item.get('example_ar', '')
        note_ar = item.get('note_ar', '')
        
        # Check for Persian/diacritics in Arabic fields
        for field, val in [('ar_meaning', ar), ('example_ar', example_ar), ('note_ar', note_ar), ('translit', translit)]:
            if val and isinstance(val, str):
                if has_persian(val):
                    issues.append(("ITEM_PERSIAN", f"item#{item_id} ({kind}): {field}='{val[:60]}' has Persian chars"))
                if has_diacritics(val):
                    issues.append(("ITEM_DIACRITICS", f"item#{item_id} ({kind}): {field} has diacritics"))
                if has_doubled_alef(val):
                    issues.append(("ITEM_DOUBLED_ALEF", f"item#{item_id} ({kind}): {field}='{val[:60]}' has doubled alef"))
    
    return issues

# === Words table audit ===
def audit_words(words):
    issues = []
    for w in words:
        en = w.get('en', '')
        ar = w.get('ar', '')
        translit = w.get('translit', '')
        
        # ar is JSONB — might be a string or dict
        if isinstance(ar, str):
            ar_str = ar
        elif isinstance(ar, dict):
            ar_str = json.dumps(ar, ensure_ascii=False)
        else:
            ar_str = str(ar) if ar else ''
        
        for field, val in [('ar', ar_str), ('translit', translit)]:
            if val and isinstance(val, str):
                if has_persian(val):
                    issues.append(("WORD_PERSIAN", f"word '{en}': {field}='{val[:60]}' has Persian chars"))
                if has_diacritics(val):
                    issues.append(("WORD_DIACRITICS", f"word '{en}': {field} has diacritics"))
                if has_doubled_alef(val):
                    issues.append(("WORD_DOUBLED_ALEF", f"word '{en}': {field}='{val[:60]}' has doubled alef"))
    
    return issues


def main():
    print("Loading PHON_DICT from app.html...")
    phon_dict = load_phon_dict('/home/user/workspace/repo/tutorfiraspel/app.html')
    print(f"  {len(phon_dict)} entries loaded")
    
    print("Loading exercises...")
    with open(os.path.join(DATA_DIR, 'exercises.json'), 'r', encoding='utf-8') as f:
        exercises = json.load(f)
    print(f"  {len(exercises)} exercises")
    
    print("Loading lesson items...")
    with open(os.path.join(DATA_DIR, 'items.json'), 'r', encoding='utf-8') as f:
        items = json.load(f)
    print(f"  {len(items)} items")
    
    print("Loading words...")
    with open(os.path.join(DATA_DIR, 'words.json'), 'r', encoding='utf-8') as f:
        words = json.load(f)
    print(f"  {len(words)} words")
    
    print("\nRunning exercise audit...")
    ex_issues = audit_exercises(exercises, phon_dict)
    
    print("Running phonetic audit...")
    phon_issues = audit_phonetics(phon_dict)
    
    print("Running lesson items audit...")
    item_issues = audit_items(items)
    
    print("Running words audit...")
    word_issues = audit_words(words)
    
    all_issues = ex_issues + phon_issues + item_issues + word_issues
    
    # Group by type
    by_type = {}
    for itype, desc in all_issues:
        by_type.setdefault(itype, []).append(desc)
    
    report = []
    report.append("=" * 70)
    report.append(f"COMPREHENSIVE AUDIT REPORT")
    report.append(f"  Exercises: {len(exercises)}")
    report.append(f"  Lesson items: {len(items)}")
    report.append(f"  Words: {len(words)}")
    report.append(f"  PHON_DICT entries: {len(phon_dict)}")
    report.append(f"  Total issues: {len(all_issues)}")
    report.append("=" * 70)
    
    severity_order = [
        "CORRECT_NOT_IN_OPTIONS", "DUP_CORRECT", "DUP_OPTION", "EMPTY_OPTION",
        "NO_CORRECT", "NO_ANSWER", "NO_SENTENCE", "NO_WORDS", "EMPTY_PAYLOAD",
        "STRINGIFIED_PAYLOAD", "TOO_FEW_OPTIONS", "MALFORMED_PAYLOAD",
        "PERSIAN", "DIACRITICS", "DOUBLED_ALEF",
        "ITEM_PERSIAN", "ITEM_DIACRITICS", "ITEM_DOUBLED_ALEF",
        "WORD_PERSIAN", "WORD_DIACRITICS", "WORD_DOUBLED_ALEF",
        "PHON_PERSIAN", "PHON_DIACRITICS", "PHON_DOUBLED_ALEF",
        "G2P_DOUBLED_ALEF", "G2P_PERSIAN", "G2P_VOWEL_INITIAL",
    ]
    
    for itype in severity_order:
        if itype in by_type:
            report.append(f"\n{itype} ({len(by_type[itype])} issues):")
            for desc in by_type[itype][:50]:
                report.append(f"  {desc}")
            if len(by_type[itype]) > 50:
                report.append(f"  ... and {len(by_type[itype]) - 50} more")
    
    # Print any types not in severity list
    for itype in sorted(by_type.keys()):
        if itype not in severity_order:
            report.append(f"\n{itype} ({len(by_type[itype])} issues):")
            for desc in by_type[itype][:50]:
                report.append(f"  {desc}")
    
    report_text = '\n'.join(report)
    print('\n' + report_text)
    
    # Save full report
    with open(os.path.join(os.path.dirname(__file__), 'exercise_audit_report.txt'), 'w', encoding='utf-8') as f:
        f.write(report_text + '\n')
        f.write('\n\n=== ALL ISSUES (detailed) ===\n')
        for itype, desc in all_issues:
            f.write(f"[{itype}] {desc}\n")
    
    print(f"\nFull report saved to tools/exercise_audit_report.txt")
    print(f"\nSummary: {len(all_issues)} total issues across {len(by_type)} categories")


if __name__ == "__main__":
    main()
