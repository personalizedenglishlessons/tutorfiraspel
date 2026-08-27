#!/usr/bin/env python3
"""Add translit (tr) to choose + correct exercise payloads using PEL's own
translitEn engine (Node). No AI. Replaces the whole payload JSONB."""
import os, json, subprocess, urllib.request

REF = "lewoochehpiycocvfwtz"
TOKEN = os.environ["SUPABASE_PAT"]
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
DRV = os.path.dirname(os.path.abspath(__file__)) + "/translit_driver.js"
APP = os.path.dirname(os.path.abspath(__file__)) + "/app"

def sql_query(q):
    data = json.dumps({"query": q}).encode("utf-8")
    req = urllib.request.Request(URL, data=data, headers={"Authorization": f"Bearer {TOKEN}",
        "Content-Type":"application/json","Accept":"application/json","User-Agent":UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def esc(s): return str(s).replace("'", "''")
banned = "أإآؤئء–—"

def tr_batch(pairs):
    if not pairs: return {}
    inp = "/tmp/ex_in.json"; out = "/tmp/ex_out.json"
    with open(inp,"w",encoding="utf-8") as f: json.dump(pairs, f, ensure_ascii=False)
    subprocess.run(["node", DRV, "--file", inp], check=True, stdout=open(out,"w"), cwd=APP)
    with open(out,encoding="utf-8") as f: arr = json.load(f)
    res = {}
    for r in arr:
        t = r["tr"]
        if t and any("\u0600"<=c<="\u06FF" for c in t) and not any(c in banned for c in t):
            res[r["id"]] = t
    return res

# ---------- CHOOSE ----------
choose = sql_query("SELECT id, payload FROM lesson_exercises WHERE type='choose'")
pairs = []
for r in choose:
    rid = str(r["id"]); p = r["payload"]
    pairs.append({"id": rid+"::q", "text": (p.get("question") or {}).get("en","")})
    for i,o in enumerate(p.get("options") or []):
        pairs.append({"id": rid+"::o"+str(i), "text": o.get("t","")})
tr = tr_batch(pairs)
upd = ["BEGIN;"]; n=0
for r in choose:
    rid = str(r["id"]); p = dict(r["payload"]); q = dict(p.get("question") or {})
    qt = tr.get(rid+"::q","")
    if qt: q["tr"] = qt
    p["question"] = q
    opts = []
    for i,o in enumerate(p.get("options") or []):
        oo = dict(o); ot = tr.get(rid+"::o"+str(i),"")
        if ot: oo["tr"] = ot
        opts.append(oo)
    p["options"] = opts
    upd.append(f"UPDATE lesson_exercises SET payload='{esc(json.dumps(p, ensure_ascii=False))}'::jsonb WHERE id={r['id']};"); n+=1
upd.append("COMMIT;")
if n: sql_query("\n".join(upd))
print(f"choose: {n} payloads updated (translit added to question + options)")

# ---------- CORRECT ----------
correct = sql_query("SELECT id, payload FROM lesson_exercises WHERE type='correct'")
pairs = []
for r in correct:
    rid = str(r["id"]); p = r["payload"]
    pairs.append({"id": rid+"::r", "text": p.get("right","")})
    pairs.append({"id": rid+"::w", "text": p.get("wrong","")})
tr = tr_batch(pairs)
upd = ["BEGIN;"]; n=0
for r in correct:
    rid = str(r["id"]); p = dict(r["payload"])
    rt = tr.get(rid+"::r","")
    if rt: p["right_tr"] = rt
    wt = tr.get(rid+"::w","")
    if wt: p["wrong_tr"] = wt
    upd.append(f"UPDATE lesson_exercises SET payload='{esc(json.dumps(p, ensure_ascii=False))}'::jsonb WHERE id={r['id']};"); n+=1
upd.append("COMMIT;")
if n: sql_query("\n".join(upd))
print(f"correct: {n} payloads updated (right_tr + wrong_tr added)")
