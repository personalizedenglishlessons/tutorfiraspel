#!/usr/bin/env python3
"""Check + reconcile supabase/migrations against the live tracker.

Problem this solves (seen 2026-09-26..28): migrations applied directly via
the Management API but never recorded in supabase_migrations.schema_migrations.
A later `supabase db push` would then try to re-apply them.

Usage:
  SUPABASE_ACCESS_TOKEN=sbp_... python3 tools/check_migrations.py [ref]

Modes (env var MODE):
  check     (default) print repo-vs-tracker differences only. Read-only.
  record    additionally insert tracker rows for repo files verified as
            already applied. USE ONLY AFTER you have verified the changes
            are live (this tool cannot tell "applied" from "not applied").

The project ref defaults to lewoochehpiycocvfwtz (PEL Tokyo project).
"""
import json
import os
import re
import sys
import urllib.request

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'migrations')
DEFAULT_REF = 'lewoochehpiycocvfwtz'


def query(token: str, ref: str, sql: str):
    req = urllib.request.Request(
        f'https://api.supabase.com/v1/projects/{ref}/database/query',
        data=json.dumps({'query': sql}).encode(), method='POST',
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def main() -> int:
    token = (os.environ.get('SUPABASE_ACCESS_TOKEN') or '').strip()
    if not token:
        print('Set SUPABASE_ACCESS_TOKEN (sbp_... personal access token).')
        return 2
    ref = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_REF
    mode = os.environ.get('MODE', 'check')
    if mode not in ('check', 'record'):
        print(f'Unknown MODE={mode}; use check or record.')
        return 2

    applied = {r['version'] for r in
               query(token, ref, 'select version from supabase_migrations.schema_migrations')}

    repo = {}
    for fname in sorted(os.listdir(MIGRATIONS_DIR)):
        m = re.match(r'(\d{12})_([\w.]+)\.sql$', fname)
        if m:
            repo[m.group(1)] = (m.group(2), os.path.join(MIGRATIONS_DIR, fname))

    unrecorded = [v for v in sorted(repo) if v not in applied]
    orphan = [v for v in sorted(applied) if v not in repo]

    if not unrecorded and not orphan:
        print(f'OK: all {len(repo)} repo migrations recorded in tracker.')
        return 0

    if unrecorded:
        print(f'In repo but NOT in tracker ({len(unrecorded)}):')
        for v in unrecorded:
            print(f'  {v} {repo[v][0]}')
    if orphan:
        print(f'In tracker but NOT in repo ({len(orphan)}):')
        for v in orphan:
            print(f'  {v}')

    if mode == 'record' and unrecorded:
        for v in unrecorded:
            name, path = repo[v]
            text = open(path).read()
            sql = ("insert into supabase_migrations.schema_migrations (version, name, statements) "
                   f"select '{v}', '{name}', array[$mig${text}$mig$::text] "
                   f"where not exists (select 1 from supabase_migrations.schema_migrations "
                   f"where version='{v}')")
            query(token, ref, sql)
            print(f'recorded {v} {name}')
        print('\nIMPORTANT: this only writes tracker rows. Verify the SQL itself is '
              'already applied before/after using this mode.')
    else:
        print('\nRead-only check. Re-run with MODE=record to insert tracker rows '
              '(only after verifying the changes are live).')
    return 1


if __name__ == '__main__':
    sys.exit(main())
