#!/usr/bin/env python3
"""Run SQL against the PEL Supabase project via the Management API.
Usage: python3 tools/sql.py "SELECT ..."   (reads SQL from argv or stdin)
"""
import json, sys, urllib.request
import os
PAT = os.environ.get("SUPABASE_PAT", "")
if not PAT:
    import sys; print("Set SUPABASE_PAT env var first."); sys.exit(1)
PROJ = os.environ.get("SUPABASE_PROJECT_REF", "lewoochehpiycocvfwtz")
URL = f"https://api.supabase.com/v1/projects/{PROJ}/database/query"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def run_sql(sql):
    body = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": f"Bearer {PAT}", "User-Agent": UA,
        "Accept": "application/json", "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "msg": e.read().decode()[:500]}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    sql = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else sys.stdin.read()
    if not sql.strip():
        print("No SQL provided"); sys.exit(1)
    res = run_sql(sql)
    print(json.dumps(res, ensure_ascii=False, indent=2))
