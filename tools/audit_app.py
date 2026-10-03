#!/usr/bin/env python3
"""Static audit of app.html: find broken DOM references, dead handlers, accessibility gaps."""
import re, sys, json
from collections import defaultdict

FILE = "app.html"
content = open(FILE, encoding="utf-8").read()

issues = []

# 1. Collect all defined IDs
defined_ids = set(re.findall(r'id="([^"]+)"', content))
# Also check id='...' (single quotes)
defined_ids |= set(re.findall(r"id='([^']+)'", content))

# 2. Collect all getElementById references
get_by_id = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", content))
# Also querySelector('#id')
query_ids = set(re.findall(r"querySelector(?:All)?\(['\"]#([^'\"]+)['\"]\)", content))
# Also $('#id') jQuery-style if any
jquery_ids = set(re.findall(r"\$\(['\"]#([^'\"]+)['\"]\)", content))

referenced_ids = get_by_id | query_ids | jquery_ids

missing_ids = referenced_ids - defined_ids
for mid in sorted(missing_ids):
    issues.append({"type": "missing_id", "ref": mid, "msg": f"getElementById/querySelector('#{mid}') but no id='{mid}' in HTML"})

# 3. aria-controls / aria-labelledby / for= references
aria_controls = re.findall(r'aria-controls="([^"]+)"', content)
aria_labelledby = re.findall(r'aria-labelledby="([^"]+)"', content)
for_ = re.findall(r'\sfor="([^"]+)"', content)

for ref in aria_controls:
    # aria-controls can reference multiple space-separated IDs
    for rid in ref.split():
        if rid not in defined_ids:
            issues.append({"type": "aria_controls_missing", "ref": rid, "msg": f"aria-controls references #{rid} but no such id exists"})

for ref in aria_labelledby:
    for rid in ref.split():
        if rid not in defined_ids:
            issues.append({"type": "aria_labelledby_missing", "ref": rid, "msg": f"aria-labelledby references #{rid} but no such id exists"})

for ref in for_:
    if ref not in defined_ids:
        issues.append({"type": "label_for_missing", "ref": ref, "msg": f"<label for=\"{ref}\"> but no id=\"{ref}\" exists"})

# 4. Inline onclick handlers referencing undefined functions
inline_handlers = re.findall(r'on(?:click|change|input|submit|keydown|keyup|focus|blur|load|error)="([^"]*)"', content)
defined_funcs = set(re.findall(r'function\s+([a-zA-Z_$][\w$]*)\s*\(', content))
defined_funcs |= set(re.findall(r'(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s+)?\(?[^=]*=>', content))
# Also window.xxx = function
defined_funcs |= set(re.findall(r'window\.([a-zA-Z_$][\w$]*)\s*=', content))

for handler in inline_handlers:
    # Extract function name from handler
    fn_match = re.match(r'([a-zA-Z_$][\w$]*)\s*\(', handler.strip())
    if fn_match:
        fn = fn_match.group(1)
        if fn not in defined_funcs:
            issues.append({"type": "undefined_handler", "ref": fn, "msg": f"Inline onclick calls {fn}() but function not defined"})

# 5. data-view values in HTML vs JS switch statements
data_views_html = set(re.findall(r'data-view="([^"]+)"', content))
# Find data-view handling in JS
data_views_js = set()
for m in re.finditer(r'data-view["\']?\s*[=:]\s*["\']([^"\']+)["\']', content):
    data_views_js.add(m.group(1))
# Also check switch cases
for m in re.finditer(r"case\s+['\"]([^'\"]+)['\"]:", content):
    data_views_js.add(m.group(1))

# 6. Buttons/links without accessible names
# Match <button> or <a> with no text content and no aria-label
button_pattern = r'<(button|a)\s[^>]*>(?:\s*<svg[^>]*>[\s\S]*?</svg>\s*)</\1>'
for m in re.finditer(button_pattern, content):
    tag = m.group(1)
    full = m.group(0)
    # Check if it has aria-label or title
    if 'aria-label' not in full and 'title=' not in full and 'aria-labelledby' not in full:
        line = content[:m.start()].count('\n') + 1
        issues.append({"type": "no_accessible_name", "line": line, "msg": f"<{tag}> with only SVG icon, no aria-label/title"})

# 7. Inputs without labels
input_pattern = r'<input\s[^>]*>'
for m in re.finditer(input_pattern, content):
    full = m.group(0)
    if 'type="hidden"' in full or "type='hidden'" in full:
        continue
    # Check for id (which should have a matching <label for>)
    id_match = re.search(r'id="([^"]+)"', full)
    has_aria = 'aria-label' in full or 'aria-labelledby' in full
    if id_match and not has_aria:
        iid = id_match.group(1)
        # Check if there's a label for this id
        if not re.search(rf'for="{re.escape(iid)}"', content) and not re.search(rf"for='{re.escape(iid)}'", content):
            line = content[:m.start()].count('\n') + 1
            issues.append({"type": "input_no_label", "line": line, "ref": iid, "msg": f"<input id=\"{iid}\"> has no <label for> and no aria-label"})

# 8. Images without alt
img_pattern = r'<img\s[^>]*>'
for m in re.finditer(img_pattern, content):
    full = m.group(0)
    if 'alt=' not in full:
        line = content[:m.start()].count('\n') + 1
        issues.append({"type": "img_no_alt", "line": line, "msg": "<img> without alt attribute"})

# 9. CSS variables used but not defined in :root or any selector
css_vars_used = set(re.findall(r'var\(--([a-zA-Z][\w-]*)', content))
css_vars_defined = set(re.findall(r'--([a-zA-Z][\w-]*)\s*:', content))
missing_css_vars = css_vars_used - css_vars_defined
for v in sorted(missing_css_vars):
    issues.append({"type": "missing_css_var", "ref": v, "msg": f"var(--{v}) used but --{v} never defined"})

# Summary
print(f"=== Static Audit of {FILE} ===")
print(f"File size: {len(content):,} chars, {content.count(chr(10)):,} lines")
print(f"Defined IDs: {len(defined_ids)}")
print(f"Referenced IDs: {len(referenced_ids)}")
print(f"Missing IDs: {len(missing_ids)}")
print(f"Defined functions: {len(defined_funcs)}")
print(f"Inline handlers: {len(inline_handlers)}")
print(f"data-view values (HTML): {len(data_views_html)}")
print(f"data-view values (JS): {len(data_views_js)}")
print(f"CSS vars used: {len(css_vars_used)}, defined: {len(css_vars_defined)}, missing: {len(missing_css_vars)}")
print()
print(f"=== ISSUES FOUND: {len(issues)} ===")
for issue in issues:
    line = issue.get("line", "?")
    print(f"  [{issue['type']}] line {line}: {issue['msg']}")

# Save full report
with open("audit_report.json", "w") as f:
    json.dump(issues, f, indent=2, ensure_ascii=False)
print(f"\nFull report saved to audit_report.json")
