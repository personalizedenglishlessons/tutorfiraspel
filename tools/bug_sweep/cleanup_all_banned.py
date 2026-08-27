#!/usr/bin/env python3
"""App-wide banned-char cleanup, batched. 'no hamza, no em/en dashes anywhere':
hamza forms (أإآؤئء) -> ا ; em/en dashes (– —) -> ', '. Across lesson_items,
lesson_exercises (payload jsonb walked), words (ar jsonb walked). No AI."""
import os, json, urllib.request

REF="lewoochehpiycocvfwtz"; TOKEN=os.environ["SUPABASE_PAT"]
URL=f"https://api.supabase.com/v1/projects/{REF}/database/query"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
HAMZA=set("أإآؤئء"); DASH=set("–—")
def clean(s):
    if not isinstance(s,str): return s
    return ''.join('ا' if c in HAMZA else (', ' if c in DASH else c) for c in s)
def has_bad(s): return isinstance(s,str) and any(c in HAMZA or c in DASH for c in s)
def sql_query(q):
    data=json.dumps({"query":q}).encode("utf-8")
    req=urllib.request.Request(URL,data=data,headers={"Authorization":f"Bearer {TOKEN}",
        "Content-Type":"application/json","Accept":"application/json","User-Agent":UA})
    try:
        with urllib.request.urlopen(req,timeout=180) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"error": f"{e.code} {e.reason}: {e.read().decode('utf-8','ignore')[:300]}"}
def esc(s): return str(s).replace("'", "''")
def walk(o):
    if isinstance(o,dict):
        for k in list(o.keys()):
            n=walk(o[k])
            if n is not o[k]: o[k]=n
    elif isinstance(o,list):
        for i in range(len(o)):
            n=walk(o[i])
            if n is not o[i]: o[i]=n
    elif isinstance(o,str):
        if has_bad(o): return clean(o)
    return o
def ban(f): return f"({f}::text ~ '[أإآؤئء]' OR {f}::text ~ '–' OR {f}::text ~ '—')"

def clean_text_fields(table, idcol, fields, batch=40):
    rows=sql_query(f"SELECT {idcol} AS id, {','.join(fields)} FROM {table} WHERE "+" OR ".join(ban(f) for f in fields))
    if isinstance(rows,dict): print(f"{table}: QUERY ERROR {rows.get('error')}"); return 0
    print(f"{table}: {len(rows)} rows with banned chars")
    total=0
    for i in range(0,len(rows),batch):
        chunk=rows[i:i+batch]
        stmts=["BEGIN;"]
        for r in chunk:
            sets=[]
            for f in fields:
                v=r[f]
                if v is None: continue
                if isinstance(v,(dict,list)):
                    v2=json.loads(json.dumps(v)); walk(v2)
                    if json.dumps(v2,ensure_ascii=False)!=json.dumps(v,ensure_ascii=False):
                        sets.append(f"{f}='{esc(json.dumps(v2,ensure_ascii=False))}'::jsonb")
                else:
                    c=clean(str(v))
                    if c!=str(v): sets.append(f"{f}='{esc(c)}'")
            if sets: stmts.append(f"UPDATE {table} SET {','.join(sets)} WHERE {idcol}='{esc(str(r['id']))}';")
        stmts.append("COMMIT;")
        if len(stmts)>2:
            res=sql_query("\n".join(stmts))
            if isinstance(res,dict): print(f"  batch {i}: ERROR {res.get('error')}"); 
            else: total+=len(chunk)
    print(f"  cleaned ~{total} rows.")
    return total

n=0
n+=clean_text_fields("lesson_items","id",["translit","en","example_en","example_ar","example_tr","ar_meaning","note_ar"])
n+=clean_text_fields("lesson_exercises","id",["payload","hint_en","hint_ar","hint_tr"])
n+=clean_text_fields("words","id",["translit","example_en","example_ar","example_tr"])
# words.ar jsonb
rows=sql_query("SELECT id, ar FROM words WHERE ar::text ~ '[أإآؤئء]' OR ar::text ~ '–' OR ar::text ~ '—'")
if isinstance(rows,list):
    print(f"words.ar: {len(rows)} rows")
    m=0
    for i in range(0,len(rows),40):
        chunk=rows[i:i+40]; stmts=["BEGIN;"]
        for r in chunk:
            v=r["ar"]; v2=json.loads(json.dumps(v)) if isinstance(v,(dict,list)) else v
            walk(v2)
            if isinstance(v2,(dict,list)) and json.dumps(v2,ensure_ascii=False)!=json.dumps(v,ensure_ascii=False):
                stmts.append(f"UPDATE words SET ar='{esc(json.dumps(v2,ensure_ascii=False))}'::jsonb WHERE id='{esc(str(r['id']))}';")
        stmts.append("COMMIT;")
        if len(stmts)>2:
            res=sql_query("\n".join(stmts))
            if not isinstance(res,dict): m+=len(chunk)
    print(f"  cleaned ~{m} words.ar rows.")
    n+=m
print(f"DONE: ~{n} rows cleaned app-wide.")
