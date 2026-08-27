#!/usr/bin/env python3
"""Patch app.html for Phase 5: (1) filter A0 Pronunciation Cards to level='A0'
so Abha expressions don't appear there; (2) insert the Abha Expressions section."""
p = "/home/user/workspace/app/app.html"
s = open(p, encoding="utf-8").read()

# (1) filter A0 fetch to level='A0'
old_a0 = ".eq('active', true).order('en');\n      if (error || !data || !data.length) return;\n      const wrap = document.createElement('div');\n      wrap.style.cssText = 'margin-top:30px;';\n      wrap.innerHTML =\n        '<div class=\"page-head\" style=\"margin-bottom:14px;\">' +\n        '<span class=\"eyebrow\"><span class=\"arabic\" style=\"font-size:.95em;\">بطاقات النطق</span>"
new_a0 = ".eq('active', true).eq('level', 'A0').order('en');\n      if (error || !data || !data.length) return;\n      const wrap = document.createElement('div');\n      wrap.style.cssText = 'margin-top:30px;';\n      wrap.innerHTML =\n        '<div class=\"page-head\" style=\"margin-bottom:14px;\">' +\n        '<span class=\"eyebrow\"><span class=\"arabic\" style=\"font-size:.95em;\">بطاقات النطق</span>"
if ".eq('active', true).eq('level', 'A0').order('en');" in s:
    print("[skip] A0 level filter already applied")
elif old_a0 in s:
    s = s.replace(old_a0, new_a0, 1); print("[OK] A0 fetch filtered to level='A0'")
else:
    print("[MISS] A0 anchor not found"); raise SystemExit(1)

# (2) insert Abha Expressions block before the end of renderVocabulary
block = open("/tmp/abhablock.js", encoding="utf-8").read()
anchor = "    } catch (e) { /* fail silently */ }\n  })();\n}\nviewRenderers.vocabulary = renderVocabulary;"
if "Abha Expressions" in s:
    print("[skip] Abha block already present")
elif anchor not in s:
    print("[MISS] renderVocabulary end anchor not found"); raise SystemExit(1)
else:
    s = s.replace(anchor, "    } catch (e) { /* fail silently */ }\n  })();\n" + block + "\n}\nviewRenderers.vocabulary = renderVocabulary;", 1)
    print("[OK] Abha Expressions section inserted")

open(p, "w", encoding="utf-8").write(s)
