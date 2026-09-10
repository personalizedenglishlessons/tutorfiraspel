#!/usr/bin/env python3
"""Bust lib script cache: rewrite <script src="lib/x.js"> -> lib/x.js?v=HASH.

HASH = first 8 hex chars of sha256 of the CURRENT file content, so the
query string changes exactly when the file changes. Idempotent: running
twice produces no diff. Handles any same-origin relative script src
(lib/*.js and admin/admin.js). CDN URLs and integrity-tagged scripts are
left untouched.

Run this before committing changes to any lib/*.js file, e.g.:
    python3 tools/bust_lib_cache.py && git add -A && git commit -m "..."
"""
import hashlib
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TAG_RE = re.compile(
    r'(<script\b[^>]*\bsrc=")((?:lib|admin)/[A-Za-z0-9._-]+\.js)(\?v=[0-9a-f]+)?("[^>]*>)'
)


def file_hash(rel: str) -> str | None:
    p = REPO / rel
    if not p.is_file():
        return None
    return hashlib.sha256(p.read_bytes()).hexdigest()[:8]


def bust(html_path: Path) -> bool:
    src = html_path.read_text(encoding="utf-8")
    changed = []

    def repl(m):
        head, rel, old_v, tail = m.group(1), m.group(2), m.group(3), m.group(4)
        # never touch scripts with integrity/SRI (query would break the hash)
        if "integrity=" in head + tail:
            return m.group(0)
        h = file_hash(rel)
        if h is None:
            print(f"  ! {html_path.name}: {rel} not found, skipped", file=sys.stderr)
            return m.group(0)
        new = f"{head}{rel}?v={h}{tail}"
        if new != m.group(0):
            changed.append(rel)
        return new

    out = TAG_RE.sub(repl, src)
    if out != src:
        html_path.write_text(out, encoding="utf-8")
        for rel in changed:
            print(f"  {html_path.name}: {rel} -> ?v={file_hash(rel)}")
    return bool(changed)


def main() -> int:
    any_changed = False
    for html in sorted(REPO.glob("*.html")):
        if bust(html):
            any_changed = True
    print("updated" if any_changed else "already busted — no changes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
