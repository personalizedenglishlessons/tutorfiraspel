#!/usr/bin/env python3
"""Admin helper for the PEL Supabase project via the Management API.

Auth is injected by the credential proxy (HTTPS_PROXY) when run under
`pplx credentials run <handle> -- python3 tools/db_admin.py ...`.
Uses curl for transport (urllib does not work through the proxy). No token
value is ever read or stored here.

Usage:
  python3 tools/db_admin.py check              # repo files vs live tracker (read-only)
  python3 tools/db_admin.py apply <file>       # run a migration file (whole file, one query)
  python3 tools/db_admin.py record <ver>       # insert tracker row for version (same SQL as
                                               # check_migrations.py MODE=record)
  python3 tools/db_admin.py sql "SELECT ..."  # ad-hoc query, prints JSON
"""
import json
import os
import re
import subprocess
import sys

REF = 'lewoochehpiycocvfwtz'
URL = f'https://api.supabase.com/v1/projects/{REF}/database/query'
MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'migrations')


def query(sql: str):
    proc = subprocess.run(
        ['curl', '-sS', '--max-time', '300', '-X', 'POST', URL,
         '-H', 'Content-Type: application/json',
         '--data-binary', json.dumps({'query': sql})],
        capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f'curl failed: {proc.stderr}')
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        raise RuntimeError(f'non-JSON response: {proc.stdout[:500]}')


def repo_files():
    out = {}
    for fname in sorted(os.listdir(MIGRATIONS_DIR)):
        m = re.match(r'(\d+)([\w.]+)\.sql$', fname)
        if m:
            out[m.group(1)] = fname
    return out


def main() -> int:
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if cmd == 'check':
        rows = query('select version, name from supabase_migrations.schema_migrations')
        applied = {r['version']: r['name'] for r in rows}
        repo = repo_files()
        unrecorded = [v for v in sorted(repo) if v not in applied]
        orphan = [v for v in sorted(applied) if v not in repo]
        print(f'tracker rows: {len(applied)}; repo files: {len(repo)}')
        if unrecorded:
            print('In repo but NOT in tracker:')
            for v in unrecorded:
                print(f'  {v} {repo[v]}')
        if orphan:
            print('In tracker but NOT in repo:')
            for v in orphan:
                print(f'  {v} {applied[v]}')
        if not unrecorded and not orphan:
            print('OK: all repo migrations recorded in tracker.')
        return 0
    if cmd == 'sql':
        print(json.dumps(query(sys.argv[2]), ensure_ascii=False))
        return 0
    if cmd == 'apply':
        path = os.path.join(MIGRATIONS_DIR, sys.argv[2])
        text = open(path).read()
        res = query(text)
        print(json.dumps(res, ensure_ascii=False))
        return 0
    if cmd == 'record':
        v = sys.argv[2]
        repo = repo_files()
        fname = repo.get(v)
        if not fname:
            print(f'no repo file for version {v}')
            return 2
        text = open(os.path.join(MIGRATIONS_DIR, fname)).read()
        sql = ("insert into supabase_migrations.schema_migrations (version, name, statements) "
               f"select '{v}', '{fname[len(v)+1:-4]}', array[$mig${text}$mig$::text] "
               "where not exists (select 1 from supabase_migrations.schema_migrations "
               f"where version='{v}')")
        res = query(sql)
        print(json.dumps(res, ensure_ascii=False))
        rows = query(f"select version, name from supabase_migrations.schema_migrations where version='{v}'")
        print(f'verified tracker row: {json.dumps(rows)}')
        return 0
    print(__doc__)
    return 2


if __name__ == '__main__':
    sys.exit(main())
