#!/usr/bin/env python3
"""Clean banned chars (hamza forms -> alef, em/en dashes -> comma) from my 24 new
IELTS exercises. Walks the payload JSON + hint_ar/hint_tr and rewrites any string
containing a banned char, then UPDATEs. Abha style: ا only, no dashes."""
import os, json, urllib.request

REF="lewoochehpiycocvfwtz"; TOKEN=os.environ["SUPABASE_PAT"]
URL=f"https://api.supabase.com/v1/projects/{REF}/database/query"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
HAMZA=set("أإآؤئء"); DASH=set("–—")
MY_HINTS=('اختار الاجابة الصح.','اختار المرادف.','اختار الفكرة الرئيسية.','صحح الغلط.','رتب الكلمات لتكوين جملة.')

def sql_query(q):
    data=json.dumps({"query":q}).encode("utf-8")
    req=urllib.request.Request(URL,data=data,headers={"Authorization":f"Bearer {TOKEN}",
        "Content-Type":"application/json","Accept":"application/json","User-Agent":UA})
    with urllib.request.urlopen(req,timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))
def esc(s): return str(s).replace("'", "''")

def clean(s):
    if not isinstance(s,str): return s
    out=[]
    for c in s:
        if c in HAMZA: out.append('ا')
        elif c in DASH: out.append(',')
        else: out.append(c)
    return ''.join(out)

def walk(o):
    changed=False
    if isinstance(o,dict):
        for k,v in o.items():
            n=walk(v)
            if n is not v: o[k]=n; changed=True
    elif isinstance(o,list):
        for i,v in enumerate(o):
            n=walk(v)
            if n is not v: o[i]=n; changed=True
    elif isinstance(o,str):
        if any(c in HAMZA or c in DASH for c in o):
            return clean(o)
    return o if not changed or not isinstance(o,str) else o

rows=sql_query("SELECT id, payload, hint_ar, hint_tr FROM lesson_exercises WHERE lesson_id IN ('step-reading-skim-scan','step-error-recognition','step-vocab-synonyms','step-grammar-tenses','step-pack2-01','step-pack2-04')")
print(f"exercises to scan: {len(rows)}")
upd=["BEGIN;"]; n=0
import copy as _copy
for r in rows:
    p=json.loads(r["payload"]) if isinstance(r["payload"],str) else r["payload"]
    before=json.dumps(p,ensure_ascii=False,sort_keys=True)
    walk(p)  # mutates p in place
    after=json.dumps(p,ensure_ascii=False,sort_keys=True)
    ha=clean(r["hint_ar"] or "")
    ht=clean(r["hint_tr"] or "")
    changed = (after != before) or (ha != (r["hint_ar"] or "")) or (ht != (r["hint_tr"] or ""))
    if changed:
        pj=esc(json.dumps(p,ensure_ascii=False))
        upd.append(f"UPDATE lesson_exercises SET payload='{pj}'::jsonb, hint_ar='{esc(ha)}', hint_tr='{esc(ht)}' WHERE id={r['id']};")
        n+=1
upd.append("COMMIT;")
if n: sql_query("\n".join(upd))
print(f"cleaned {n} exercises (hamza->ا, dashes->comma).")
