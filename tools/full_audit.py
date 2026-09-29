#!/usr/bin/env python3
"""
Full audit: mistranslations, mistransliterations, mispronunciations, UI bugs.
Scans all HTML and JS files for known error patterns.
"""
import re, os, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# --- 1. MISPRONUNCIATION PATTERNS (PHON_DICT entries that are wrong) ---
# These are Arabic transliterations of English pronunciation that are incorrect
MISPRONUNCIATION_ISSUES = {
    # word: (current Arabic, correct Arabic, reason)
    'africa': ('افراكو', 'افريكا', 'Africa should be افريكا not افراكو'),
    'african': ('افراكان', 'افريكان', 'African should be افريكان not افراكان'),
    'agricultural': ('اقرأكالتشيرال', 'اكريكالتشيرال', 'agricultural - wrong'),
    'agriculture': ('اقريكالتشر', 'اكريكالتشر', 'agriculture - wrong'),
    'alcohol': ('الكاهول', 'الكحول', 'alcohol should be الكحول'),
    'ah': ('و', 'اه', 'ah should be اه not و'),
    'add': ('اد', 'اد', 'same as ad - ambiguous but OK'),
    'alan': ('الحين', 'الان', 'alan should be الان not الحين'),
    'allen': ('الحين', 'الين', 'allen should be الين not الحين'),
    'aluminum': ('الومانام', 'المنيوم', 'aluminum wrong translit'),
    'amd': ('اييمدي', 'امدي', 'amd overcomplicated'),
    'afghanistan': ('افقاناستان', 'افغانستان', 'afghanistan should use غ'),
}

# --- 2. MISTRANSLATION PATTERNS (Arabic translations that are wrong) ---
MISTRANSLATION_PATTERNS = [
    # (pattern, issue, fix)
    (r'فرصه مبسوطه', 'nice to meet you mistranslated as فرصه مبسوطه', 'تشرفنا'),
    (r'فرصه سعيده', 'nice to meet you mistranslated as فرصه سعيده', 'تشرفنا'),
    (r'\bمكن\b', 'قد mangled to مكن', 'ممكن'),
    (r'ببدون', 'بدون doubled', 'بدون'),
    (r'الاغيردات', 'settings mangled', 'الاعدادات'),
    (r'الوفكار', 'thoughts mangled', 'الافكار'),
    (r'الواحداث', 'events mangled', 'الاحداث'),
    (r'كيفك انت', 'should be كيف انت', 'كيف انت'),
    (r'الرايسية', 'should be الرئيسيه', 'الرئيسيه'),
    (r'عشان ج', 'should be كيف ج', 'كيف ج'),
]

# --- 3. MISTRANSLITERATION PATTERNS (translit field issues) ---
# Common English words whose Arabic transliteration is wrong
MISTRANSLIT_ISSUES = [
    # (wrong, correct, reason)
    (r'translit:\s*\'فويند\'', 'translit:\'فايند\'', 'find should be فايند not فويند'),
    (r'translit:\s*\'پراكسيس\'', 'translit:\'پراكتس\'', 'practice should be پراكتس not پراكسيس'),
    (r'translit:\s*\'بلد\'', 'translit:\'بيلد\'', 'build should be بيلد not بلد'),
    (r'translit:\s*\'بيرلت\'', 'translit:\'بيلد\'', 'build should be بيلد not بيرلت'),
]

# --- 4. UI/UX BUG PATTERNS ---
UI_BUG_PATTERNS = [
    (r'onclick="[^"]*"[^>]*onclick=', 'double onclick attribute'),
    (r'class="[^"]*"[^>]*class="', 'double class attribute'),
    (r'id="[^"]*"[^>]*id="', 'double id attribute'),
    (r'<div[^>]*>[^<]*</div>\s*<div[^>]*>[^<]*</div>\s*<div[^>]*>[^<]*</div>\s*<div[^>]*>[^<]*</div>\s*<div[^>]*>[^<]*</div>\s*<div[^>]*>[^<]*</div>\s*<div[^>]*>[^<]*</div>\s*<div[^>]*>[^<]*</div>', 'excessive nesting'),
    (r'undefined\b', 'undefined reference'),
    (r'NaN\b', 'NaN value'),
    (r'TODO|FIXME|HACK|XXX', 'unresolved todo/fixme'),
    (r'console\.(log|error|warn)\(', 'console statement left in production'),
    (r'document\.write\(', 'document.write usage'),
    (r'innerHTML\s*=\s*[^;]*\+', 'innerHTML with concatenation (XSS risk)'),
]

SCAN_GLOBS = ["*.html", "*.js"]
SKIP_DIRS = {"node_modules", ".git", "memory", "current_session_context", "downloads", "vendor"}
SKIP_FILES = {"full_audit.py", "audit_corruption.py"}

def scan_file(filepath):
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return issues
    
    lines = content.split('\n')
    rel_path = str(filepath.relative_to(ROOT))
    
    # Check mistranslation patterns
    for pattern, issue, fix in MISTRANSLATION_PATTERNS:
        for i, line in enumerate(lines, 1):
            if re.search(pattern, line):
                issues.append({
                    'category': 'MISTRANSLATION',
                    'file': rel_path,
                    'line': i,
                    'issue': issue,
                    'fix': fix,
                    'snippet': line.strip()[:120]
                })
    
    # Check transliteration issues
    for pattern, fix, issue in MISTRANSLIT_ISSUES:
        for i, line in enumerate(lines, 1):
            if re.search(pattern, line):
                issues.append({
                    'category': 'MISTRANSLITERATION',
                    'file': rel_path,
                    'line': i,
                    'issue': issue,
                    'fix': fix,
                    'snippet': line.strip()[:120]
                })
    
    # Check UI bug patterns
    for pattern, issue in UI_BUG_PATTERNS:
        for i, line in enumerate(lines, 1):
            if re.search(pattern, line):
                # Skip if it's in a comment or string that's describing the pattern
                if 'audit' in rel_path or 'test' in rel_path.lower():
                    continue
                issues.append({
                    'category': 'UI_BUG',
                    'file': rel_path,
                    'line': i,
                    'issue': issue,
                    'snippet': line.strip()[:120]
                })
    
    return issues

def scan_phon_dict(filepath):
    """Check PHON_DICT entries for mispronunciations."""
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return issues
    
    rel_path = str(filepath.relative_to(ROOT))
    
    for word, (wrong, correct, reason) in MISPRONUNCIATION_ISSUES.items():
        # Look for the entry in PHON_DICT format: 'word':'arabic'
        pattern = rf"'{word}':'{re.escape(wrong)}'"
        if re.search(pattern, content):
            line_num = content[:content.find(pattern)].count('\n') + 1
            issues.append({
                'category': 'MISPRONUNCIATION',
                'file': rel_path,
                'line': line_num,
                'issue': reason,
                'fix': f"'{word}':'{correct}'",
                'snippet': f"'{word}':'{wrong}'"
            })
    
    return issues

def main():
    all_issues = []
    
    for filepath in ROOT.rglob("*"):
        if not filepath.is_file():
            continue
        if filepath.suffix not in ['.html', '.js']:
            continue
        if any(skip in str(filepath) for skip in SKIP_DIRS):
            continue
        if filepath.name in SKIP_FILES:
            continue
        
        all_issues.extend(scan_file(filepath))
        
        # Check PHON_DICT specifically
        if filepath.name == 'app.html':
            all_issues.extend(scan_phon_dict(filepath))
    
    # Also check for Arabic text issues in lesson data
    # Check for common Arabic typos
    arabic_typos = [
        (r'الاستعراض', 'should be المراجعة in SRS context', 'review context'),
        (r'تصحك', 'truncated تصحيح', 'fix'),
    ]
    
    for filepath in ROOT.rglob("*"):
        if not filepath.is_file() or filepath.suffix not in ['.html', '.js']:
            continue
        if any(skip in str(filepath) for skip in SKIP_DIRS):
            continue
        if filepath.name in SKIP_FILES:
            continue
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        
        lines = content.split('\n')
        rel_path = str(filepath.relative_to(ROOT))
        
        for pattern, issue, fix in arabic_typos:
            for i, line in enumerate(lines, 1):
                if re.search(pattern, line):
                    all_issues.append({
                        'category': 'MISTRANSLATION',
                        'file': rel_path,
                        'line': i,
                        'issue': issue,
                        'fix': fix,
                        'snippet': line.strip()[:120]
                    })
    
    # Deduplicate and sort
    seen = set()
    unique_issues = []
    for issue in all_issues:
        key = f"{issue['file']}:{issue['line']}:{issue.get('issue','')}"
        if key not in seen:
            seen.add(key)
            unique_issues.append(issue)
    
    # Print results
    by_category = {}
    for issue in unique_issues:
        cat = issue['category']
        by_category.setdefault(cat, []).append(issue)
    
    print(f"\n{'='*60}")
    print(f"FULL AUDIT RESULTS — {len(unique_issues)} issues found")
    print(f"{'='*60}")
    
    for cat in ['MISTRANSLATION', 'MISTRANSLITERATION', 'MISPRONUNCIATION', 'UI_BUG']:
        issues = by_category.get(cat, [])
        print(f"\n--- {cat}: {len(issues)} issues ---")
        for issue in issues:
            print(f"  {issue['file']}:{issue['line']}")
            print(f"    Issue: {issue['issue']}")
            if 'fix' in issue:
                print(f"    Fix: {issue['fix']}")
            print(f"    Code: {issue['snippet']}")
            print()
    
    return unique_issues

if __name__ == '__main__':
    main()
