#!/usr/bin/env python3
"""Insert the A0 Pronunciation Cards block into renderVocabulary (after renderGrid())."""
p = "/home/user/workspace/app/app.html"
s = open(p, encoding="utf-8").read()
block = open("/tmp/a0block.js", encoding="utf-8").read()
anchor = "  renderGrid();\n}\nviewRenderers.vocabulary = renderVocabulary;"
if "A0 Pronunciation Cards" in s:
    print("[skip] A0 block already present")
elif anchor not in s:
    print("[MISS] anchor not found"); raise SystemExit(1)
else:
    s = s.replace(anchor, "  renderGrid();\n" + block + "\n}\nviewRenderers.vocabulary = renderVocabulary;", 1)
    open(p, "w", encoding="utf-8").write(s)
    print("[OK] A0 Pronunciation Cards block inserted")
