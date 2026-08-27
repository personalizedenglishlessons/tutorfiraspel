#!/usr/bin/env python3
"""Fill missing translit on lesson_items using PEL's own translitEn engine (Node).
No AI. Pulls rows with empty translit, computes translit for substantive English
sentences (skips short labels like 'Takeaway'), writes back to Supabase."""
import os, sys, json, subprocess, urllib.request, urllib.error

REF = "lewoochehpiycocvfwtz"
TOKEN = os.environ["SUPABASE_PAT"]
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
DRV = os.path.dirname(os.path.abspath(__file__)) + "/translit_driver.js"
APP = os.path.dirname(os.path.abspath(__file__)) + "/app"
IN = "/tmp/items_in.json"; OUT = "/tmp/items_out.json"

def sql_query(q):
    data = json.dumps({"query": q}).encode("utf-8")
    req = urllib.request.Request(URL, data=data, headers={"Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json", "Accept": "application/json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))

def esc(s):
    return str(s).replace("'", "''")

# 1) pull missing-translit items
rows = sql_query("""SELECT id, en FROM lesson_items
  WHERE translit IS NULL OR translit ~ '^\\s*$' OR translit = '-'""")
print(f"missing-translit items: {len(rows)}")

# 2) filter: only substantive English sentences (skip short labels)
keep = [r for r in rows if len(r["en"]) >= 20 and " " in r["en"]]
print(f"substantive sentences to translit: {len(keep)} (skipped {len(rows)-len(keep)} short labels)")
payload = [{"id": r["id"], "text": r["en"]} for r in keep]
with open(IN, "w", encoding="utf-8") as f: json.dump(payload, f, ensure_ascii=False)

# 3) compute translit via Node (PEL's own engine)
subprocess.run(["node", DRV, "--file", IN], check=True, stdout=open(OUT, "w"), cwd=APP)
with open(OUT, encoding="utf-8") as f: tr = json.load(f)

# 4) build + apply UPDATE SQL (validate: arabic-script present, no hamza, no em dash)
banned = "أإآؤئء–—"
stmts = ["BEGIN;"]
applied = 0
for r in tr:
    t = r["tr"]
    if not t or not any("\u0600" <= c <= "\u06FF" for c in t): 
        print(f"  SKIP (no arabic) id={r['id']} tr={t!r}"); continue
    if any(c in banned for c in t):
        print(f"  SKIP (banned char) id={r['id']} tr={t!r}"); continue
    stmts.append(f"UPDATE lesson_items SET translit='{esc(t)}' WHERE id='{esc(r['id'])}';")
    applied += 1
stmts.append("COMMIT;")
print(f"applying {applied} updates...")
res = sql_query("\n".join(stmts))
print("DB result:", json.dumps(res)[:200])
print(f"DONE: {applied} items transliterated.")
