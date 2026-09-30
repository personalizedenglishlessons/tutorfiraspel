#!/usr/bin/env python3
"""Push pending SQL migrations to the live Supabase database via the Management API.

Reads each migration file, executes it, and records it in
supabase_migrations.schema_migrations so the DB stays in sync with the repo.

Usage:
    SUPABASE_ACCESS_TOKEN=... python3 tools/push_migrations.py [project_ref] [migrations_dir]
"""
import json
import os
import re
import sys
import urllib.request
import urllib.error

TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
if not TOKEN:
    sys.exit("SUPABASE_ACCESS_TOKEN env var is required")

PROJECT_REF = sys.argv[1] if len(sys.argv) > 1 else "lewoochehpiycocvfwtz"
MIGRATIONS_DIR = sys.argv[2] if len(sys.argv) > 2 else "supabase/migrations"

API = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"


def run_sql(sql: str, label: str = "") -> dict:
    """Execute SQL via the Management API. Returns parsed JSON response."""
    body = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(
        API,
        data=body,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw = resp.read().decode("utf-8")
            return {"status": resp.status, "body": raw}
    except urllib.error.HTTPError as e:
        return {"status": e.code, "body": e.read().decode("utf-8", errors="replace")}
    except Exception as e:
        return {"status": 0, "body": str(e)}


def already_applied(version: str) -> bool:
    res = run_sql(
        f"select count(*) as c from supabase_migrations.schema_migrations "
        f"where version = '{version}';",
        label=f"check {version}",
    )
    body = res.get("body", "")
    try:
        rows = json.loads(body)
        if isinstance(rows, list) and rows:
            first = rows[0]
            val = next(iter(first.values())) if first else 0
            return int(val) > 0
    except (json.JSONDecodeError, ValueError, StopIteration):
        pass
    return False


def record_migration(version: str, name: str, statements: str):
    safe_name = name.replace("'", "''")
    safe_stmts = statements.replace("'", "''")
    sql = (
        f"insert into supabase_migrations.schema_migrations (version, name, statements) "
        f"values ('{version}', '{safe_name}', array['{safe_stmts}']) "
        f"on conflict (version) do nothing;"
    )
    run_sql(sql, label=f"record {version}")


def main():
    files = sorted(f for f in os.listdir(MIGRATIONS_DIR) if f.endswith(".sql"))
    pending = []
    for fname in files:
        m = re.match(r"^(\d+)_(.+)\.sql$", fname)
        if not m:
            continue
        version, name = m.group(1), m.group(2)
        if not already_applied(version):
            pending.append((version, name, fname))

    if not pending:
        print("No pending migrations — DB is in sync with repo.")
        return

    print(f"Found {len(pending)} pending migration(s):")
    for v, n, f in pending:
        print(f"  {v} {n}")
    print()

    for version, name, fname in pending:
        path = os.path.join(MIGRATIONS_DIR, fname)
        with open(path, "r", encoding="utf-8") as fh:
            sql = fh.read()

        print(f"Applying {version} {name} ...")
        res = run_sql(sql, label=f"{version} {name}")
        status = res.get("status")
        body = res.get("body", "")
        # Management API returns 200 or 201 for successful queries.
        # An empty array body ([]) means a non-SELECT statement ran with no rows.
        if status not in (200, 201):
            print(f"  FAILED (HTTP {status}): {body[:800]}")
            sys.exit(1)

        # Check for error payload in a 2xx response (defensive)
        try:
            parsed = json.loads(body)
            if isinstance(parsed, dict) and ("error" in parsed or parsed.get("code")):
                print(f"  SQL ERROR: {body[:800]}")
                sys.exit(1)
        except json.JSONDecodeError:
            pass

        print(f"  applied OK ({len(sql)} bytes)")

        record_migration(version, name, sql)
        print(f"  recorded in schema_migrations")

    print("\nAll pending migrations applied successfully.")


if __name__ == "__main__":
    main()
