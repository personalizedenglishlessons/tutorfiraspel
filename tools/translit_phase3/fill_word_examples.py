#!/usr/bin/env python3
"""Phase 3 (data): fill example_en/ar/tr for the 153 A0 words via CORPUS derivation.
For each word, find the shortest lesson_items row (kind sentence/pattern, A0/A1
preferred) whose en contains the word as a whole word; use its en + ar_meaning as
the example pair. example_tr = translitEn(example_en) via PEL's own engine (no AI).
Leave blank if no corpus hit. Validate: no hamza, no em/en dashes."""
import os, re, json, subprocess, urllib.request

REF = "lewoochehpiycocvfwtz"
TOKEN = os.environ["SUPABASE_PAT"]
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
DRV = os.path.dirname(os.path.abspath(__file__)) + "/translit_driver.js"
APP = os.path.dirname(os.path.abspath(__file__)) + "/app"
banned = set("أإآؤئء–—")

def sql_query(q):
    data = json.dumps({"query": q}).encode("utf-8")
    req = urllib.request.Request(URL, data=data, headers={"Authorization": f"Bearer {TOKEN}",
        "Content-Type":"application/json","Accept":"application/json","User-Agent":UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def esc(s): return str(s).replace("'", "''")
def has_banned(s): return any(c in banned for c in str(s))
LVL_RANK = {"A0":0,"A1":1,"A2":2,"B1":3,"B2":4,"C1":5,"C2":6,"STEP":7}

# 1) pull words
words = sql_query("SELECT id, en FROM words WHERE active ORDER BY id")
print(f"words: {len(words)}")

# 2) pull paired sentence/pattern items with ar_meaning + level
sents = sql_query("""SELECT li.en, li.ar_meaning, l.level FROM lesson_items li
  JOIN lessons l ON li.lesson_id = l.id
  WHERE li.kind IN ('sentence','pattern') AND li.en IS NOT NULL AND li.en !~ '^\\s*$'
    AND li.ar_meaning IS NOT NULL AND li.ar_meaning !~ '^\\s*$'""")
print(f"corpus sentences: {len(sents)}")

# 3) for each word, find best matching sentence (whole-word, A0/A1 pref, shortest)
chosen = []
unmatched = []
for w in words:
    en = (w["en"] or "").strip()
    if not en: continue
    pat = re.compile(r'(?<![A-Za-z])' + re.escape(en) + r'(?![A-Za-z])', re.IGNORECASE)
    cands = [s for s in sents if pat.search(s["en"])]
    if not cands: unmatched.append(en); continue
    cands.sort(key=lambda s: (LVL_RANK.get(s["level"], 9), len(s["en"])))
    best = cands[0]
    chosen.append({"id": w["id"], "ex_en": best["en"], "ex_ar": best["ar_meaning"]})
print(f"matched: {len(chosen)} | unmatched: {len(unmatched)} -> {', '.join(unmatched[:12])}")

# 4) translit example_en via Node engine
inp="/tmp/w_in.json"; out="/tmp/w_out.json"
payload=[{"id":str(c["id"]),"text":c["ex_en"]} for c in chosen]
with open(inp,"w",encoding="utf-8") as f: json.dump(payload, f, ensure_ascii=False)
subprocess.run(["node", DRV, "--file", inp], check=True, stdout=open(out,"w"), cwd=APP)
with open(out,encoding="utf-8") as f: tr_arr = json.load(f)
tr_map = {r["id"]: r["tr"] for r in tr_arr}

# 5) build + apply UPDATE (validate no banned chars)
upd=["BEGIN;"]; n=0; skipped=0
for c in chosen:
    ex_en, ex_ar, ex_tr = c["ex_en"], c["ex_ar"], tr_map.get(str(c["id"]),"")
    if has_banned(ex_ar) or has_banned(ex_tr) or not ex_tr:
        skipped += 1; continue
    if not any("\u0600"<=ch<="\u06FF" for ch in ex_tr): skipped += 1; continue
    upd.append(f"UPDATE words SET example_en='{esc(ex_en)}', example_ar='{esc(ex_ar)}', example_tr='{esc(ex_tr)}' WHERE id='{esc(c['id'])}';"); n+=1
upd.append("COMMIT;")
if n: sql_query("\n".join(upd))
print(f"updated {n} words with examples (skipped {skipped}).")
