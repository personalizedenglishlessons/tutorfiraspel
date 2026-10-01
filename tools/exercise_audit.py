#!/usr/bin/env python3
"""Comprehensive audit of all lesson_exercises for wrong answers, mistranslations,
duplicate options, stringified payloads, and other data quality issues.

Usage: SUPABASE_PAT=... python3 tools/exercise_audit.py
"""
import json
import sys
import re
import urllib.request
import os

PAT = os.environ.get("SUPABASE_PAT", "")
if not PAT:
    print("Set SUPABASE_PAT env var first.")
    sys.exit(1)
PROJ = "lewoochehpiycocvfwtz"
URL = f"https://api.supabase.com/v1/projects/{PROJ}/database/query"
UA = "Mozilla/5.0"


def run_sql(sql):
    body = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": f"Bearer {PAT}", "User-Agent": UA,
        "Accept": "application/json", "Content-Type": "application/json"
    })
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())


def fetch_all_exercises():
    """Fetch all exercises with lesson context."""
    return run_sql("""
        SELECT 
            le.id, le.lesson_id, le.type, le.payload,
            l.title_en, l.title_ar, l.slug
        FROM lesson_exercises le
        JOIN lessons l ON l.id = le.lesson_id
        ORDER BY le.id
    """)


def fetch_lesson_items():
    """Fetch all lesson items for context checking."""
    return run_sql("""
        SELECT id, lesson_id, kind, en, ar_meaning, translit, example_en, example_ar
        FROM lesson_items
        ORDER BY lesson_id, idx
    """)


def fetch_words():
    return run_sql("""
        SELECT en, ar, translit, category, ipa
        FROM words
        ORDER BY en
    """)


def safe_get(obj, key, default=None):
    """Safely get a key from dict or JSON-parsed string."""
    if obj is None:
        return default
    if isinstance(obj, str):
        try:
            obj = json.loads(obj)
        except:
            return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return default


def parse_payload(payload):
    """Parse payload, handling stringified JSON."""
    if payload is None:
        return None
    if isinstance(payload, str):
        stripped = payload.strip()
        if stripped.startswith('{') or stripped.startswith('['):
            try:
                return json.loads(stripped)
            except:
                return {"_raw_string": stripped}
        return stripped
    return payload


def norm(s):
    """Normalize for comparison: lowercase, strip, collapse spaces."""
    if not s:
        return ""
    return re.sub(r'\s+', ' ', s.lower().strip())


def norm_ar(s):
    """Normalize Arabic for comparison."""
    if not s:
        return ""
    # Remove diacritics, normalize alef variants, strip
    s = re.sub(r'[\u064B-\u065F\u0670]', '', s)
    s = s.replace('\u0623', 'ا').replace('\u0625', 'ا').replace('\u0622', 'ا')
    s = re.sub(r'\s+', ' ', s.strip())
    return s


# Persian codepoints that should be Arabic
PERSIAN_CHARS = {
    '\u0698': 'ج',  # ژ
    '\u06AF': 'گ',  # گ
    '\u067E': 'پ',  # پ
    '\u0686': 'چ',  # چ
    '\u069A': 'ك',  # ۚ
    '\u06A9': 'ك',  # ک
    '\u06CC': 'ي',  # ی
}


def has_persian(s):
    if not s or not isinstance(s, str):
        return False
    return any(c in PERSIAN_CHARS for c in s)


def has_diacritics(s):
    if not s or not isinstance(s, str):
        return False
    return bool(re.search(r'[\u064B-\u065F\u0670]', s))


def has_doubled_alef(s):
    """Check for doubled alef sequences (corruption pattern)."""
    if not s or not isinstance(s, str):
        return False
    return bool(re.search(r'اا', s))


def audit_exercise(ex):
    """Audit a single exercise. Returns list of issues."""
    issues = []
    ex_id = ex['id']
    ex_type = ex['type']
    payload = parse_payload(ex['payload'])

    if payload is None:
        issues.append(("EMPTY_PAYLOAD", f"ex#{ex_id} ({ex_type}): payload is null"))
        return issues

    if isinstance(payload, str):
        issues.append(("STRINGIFIED_PAYLOAD", f"ex#{ex_id} ({ex_type}): payload is string '{payload[:80]}'"))
        return issues

    if isinstance(payload, dict) and "_raw_string" in payload:
        issues.append(("MALFORMED_PAYLOAD", f"ex#{ex_id} ({ex_type}): malformed JSON '{payload['_raw_string'][:80]}'"))
        return issues

    # Type-specific audits
    if ex_type == 'choose':
        correct = payload.get('correct') or payload.get('answer')
        options = payload.get('options') or payload.get('choices') or []
        ar = payload.get('ar')
        tr = payload.get('tr') or payload.get('translate')

        if not correct:
            issues.append(("NO_CORRECT_ANSWER", f"ex#{ex_id} ({ex_type}): no 'correct' field"))
        if not options or len(options) < 2:
            issues.append(("TOO_FEW_OPTIONS", f"ex#{ex_id} ({ex_type}): only {len(options) if options else 0} options"))
        if correct and options:
            # Check correct is in options
            correct_norm = norm(correct)
            options_norm = [norm(o) for o in options]
            if correct_norm not in options_norm:
                # Try exact match
                if correct not in options:
                    issues.append(("CORRECT_NOT_IN_OPTIONS", f"ex#{ex_id} ({ex_type}): correct='{correct}' not in options={options}"))
            # Check for duplicate correct in options
            dup_count = sum(1 for o in options_norm if o == correct_norm)
            if dup_count > 1:
                issues.append(("DUPLICATE_CORRECT", f"ex#{ex_id} ({ex_type}): correct answer appears {dup_count} times in options"))
            # Check for duplicate options
            seen = {}
            for i, o in enumerate(options):
                on = norm(o)
                if on in seen:
                    issues.append(("DUPLICATE_OPTION", f"ex#{ex_id} ({ex_type}): option[{i}]='{o}' duplicates option[{seen[on]}]"))
                else:
                    seen[on] = i
            # Check for empty options
            for i, o in enumerate(options):
                if not o or not str(o).strip():
                    issues.append(("EMPTY_OPTION", f"ex#{ex_id} ({ex_type}): option[{i}] is empty"))

        # Check Arabic/Persian/diacritics in options
        for i, o in enumerate(options):
            if has_persian(str(o)):
                issues.append(("PERSIAN_CHARS", f"ex#{ex_id} ({ex_type}): option[{i}]='{o}' has Persian chars"))
            if has_diacritics(str(o)):
                issues.append(("DIACRITICS", f"ex#{ex_id} ({ex_type}): option[{i}]='{o}' has diacritics"))
            if has_doubled_alef(str(o)):
                issues.append(("DOUBLED_ALEF", f"ex#{ex_id} ({ex_type}): option[{i}]='{o}' has doubled alef"))

        if ar and has_persian(ar):
            issues.append(("PERSIAN_AR", f"ex#{ex_id} ({ex_type}): ar field has Persian chars: '{ar[:60]}'"))
        if tr and has_persian(str(tr)):
            issues.append(("PERSIAN_TR", f"ex#{ex_id} ({ex_type}): tr field has Persian chars"))

    elif ex_type == 'translate':
        correct = payload.get('correct') or payload.get('answer')
        ar = payload.get('ar')
        tr = payload.get('tr')
        options = payload.get('options') or []

        if not correct and not ar:
            issues.append(("NO_ANSWER", f"ex#{ex_id} ({ex_type}): no correct/answer field"))

        # If it has options, check them
        if options and correct:
            correct_norm = norm(correct)
            options_norm = [norm(o) for o in options]
            if correct_norm not in options_norm and correct not in options:
                issues.append(("CORRECT_NOT_IN_OPTIONS", f"ex#{ex_id} ({ex_type}): correct='{correct}' not in options"))
            dup_count = sum(1 for o in options_norm if o == correct_norm)
            if dup_count > 1:
                issues.append(("DUPLICATE_CORRECT", f"ex#{ex_id} ({ex_type}): correct appears {dup_count}x in options"))
            seen = {}
            for i, o in enumerate(options):
                on = norm(o)
                if on in seen:
                    issues.append(("DUPLICATE_OPTION", f"ex#{ex_id} ({ex_type}): option[{i}]='{o}' dup of [{seen[on]}]"))
                else:
                    seen[on] = i

        # Check Arabic fields for Persian/diacritics
        if ar and has_persian(ar):
            issues.append(("PERSIAN_AR", f"ex#{ex_id} ({ex_type}): ar has Persian chars"))
        if ar and has_diacritics(ar):
            issues.append(("DIACRITICS_AR", f"ex#{ex_id} ({ex_type}): ar has diacritics"))
        if tr and has_persian(str(tr)):
            issues.append(("PERSIAN_TR", f"ex#{ex_id} ({ex_type}): tr has Persian chars"))

    elif ex_type == 'fill_blank':
        correct = payload.get('correct') or payload.get('answer')
        sentence = payload.get('sentence') or payload.get('en')
        ar = payload.get('ar')

        if not correct:
            issues.append(("NO_CORRECT_ANSWER", f"ex#{ex_id} ({ex_type}): no correct answer"))
        if not sentence:
            issues.append(("NO_SENTENCE", f"ex#{ex_id} ({ex_type}): no sentence/en field"))

        if correct and has_persian(str(correct)):
            issues.append(("PERSIAN_CORRECT", f"ex#{ex_id} ({ex_type}): correct has Persian chars"))
        if sentence and has_persian(str(sentence)):
            issues.append(("PERSIAN_SENTENCE", f"ex#{ex_id} ({ex_type}): sentence has Persian chars"))

    elif ex_type == 'arrange_words':
        correct = payload.get('correct') or payload.get('answer')
        words = payload.get('words') or payload.get('pieces') or []

        if not correct:
            issues.append(("NO_CORRECT_ANSWER", f"ex#{ex_id} ({ex_type}): no correct answer"))
        if not words:
            issues.append(("NO_WORDS", f"ex#{ex_id} ({ex_type}): no words/pieces"))

    elif ex_type == 'db_correct':
        # db_correct exercises have a sentence with an error to find
        sentence = payload.get('sentence') or payload.get('en')
        correct = payload.get('correct') or payload.get('answer')
        options = payload.get('options') or payload.get('choices') or []

        if not sentence:
            issues.append(("NO_SENTENCE", f"ex#{ex_id} ({ex_type}): no sentence"))
        if not correct:
            issues.append(("NO_CORRECT_ANSWER", f"ex#{ex_id} ({ex_type}): no correct answer"))
        if options and correct:
            correct_norm = norm(correct)
            options_norm = [norm(o) for o in options]
            if correct_norm not in options_norm and correct not in options:
                issues.append(("CORRECT_NOT_IN_OPTIONS", f"ex#{ex_id} ({ex_type}): correct='{correct}' not in options"))
            dup_count = sum(1 for o in options_norm if o == correct_norm)
            if dup_count > 1:
                issues.append(("DUPLICATE_CORRECT", f"ex#{ex_id} ({ex_type}): correct appears {dup_count}x"))

    elif ex_type == 'spell':
        correct = payload.get('correct') or payload.get('answer')
        ar = payload.get('ar')

        if not correct:
            issues.append(("NO_CORRECT_ANSWER", f"ex#{ex_id} ({ex_type}): no correct answer"))

    elif ex_type == 'match':
        pairs = payload.get('pairs') or payload.get('items') or []
        if not pairs:
            issues.append(("NO_PAIRS", f"ex#{ex_id} ({ex_type}): no pairs/items"))

    # Generic checks on all types
    if isinstance(payload, dict):
        for k, v in payload.items():
            if isinstance(v, str):
                if has_persian(v) and k not in ('en', 'sentence'):
                    # Only flag Arabic fields with Persian, not English fields
                    if any(c >= '\u0600' and c <= '\u06FF' for c in v):
                        issues.append(("PERSIAN_FIELD", f"ex#{ex_id} ({ex_type}): field '{k}' has Persian chars: '{v[:50]}'"))
                if has_diacritics(v) and k not in ('en', 'sentence', 'ipa'):
                    if any(c >= '\u0600' and c <= '\u06FF' for c in v):
                        issues.append(("DIACRITICS_FIELD", f"ex#{ex_id} ({ex_type}): field '{k}' has diacritics"))
                if has_doubled_alef(v) and k not in ('en', 'sentence', 'ipa'):
                    if any(c >= '\u0600' and c <= '\u06FF' for c in v):
                        issues.append(("DOUBLED_ALEF_FIELD", f"ex#{ex_id} ({ex_type}): field '{k}' has doubled alef: '{v[:50]}'"))

    return issues


def main():
    print("Fetching all exercises...")
    exercises = fetch_all_exercises()
    print(f"  {len(exercises)} exercises found")

    print("Fetching lesson items for context...")
    items = fetch_lesson_items()
    print(f"  {len(items)} lesson items found")

    print("Fetching words table...")
    words = fetch_words()
    print(f"  {len(words)} words found")

    print("\nRunning audit validators...\n")

    all_issues = []
    for ex in exercises:
        issues = audit_exercise(ex)
        all_issues.extend(issues)

    # Group by issue type
    by_type = {}
    for issue_type, desc in all_issues:
        by_type.setdefault(issue_type, []).append(desc)

    print("=" * 70)
    print(f"EXERCISE AUDIT REPORT — {len(exercises)} exercises audited")
    print("=" * 70)
    print(f"\nTotal issues found: {len(all_issues)}\n")

    severity_order = [
        "CORRECT_NOT_IN_OPTIONS", "DUPLICATE_CORRECT", "DUPLICATE_OPTION",
        "NO_CORRECT_ANSWER", "NO_ANSWER", "EMPTY_OPTION", "EMPTY_PAYLOAD",
        "STRINGIFIED_PAYLOAD", "MALFORMED_PAYLOAD", "TOO_FEW_OPTIONS",
        "NO_SENTENCE", "NO_WORDS", "NO_PAIRS",
        "PERSIAN_CHARS", "PERSIAN_AR", "PERSIAN_TR", "PERSIAN_CORRECT",
        "PERSIAN_SENTENCE", "PERSIAN_FIELD",
        "DIACRITICS", "DIACRITICS_AR", "DIACRITICS_FIELD",
        "DOUBLED_ALEF", "DOUBLED_ALEF_FIELD",
    ]

    for issue_type in severity_order:
        if issue_type in by_type:
            print(f"\n{issue_type} ({len(by_type[issue_type])} issues):")
            for desc in by_type[issue_type][:30]:
                print(f"  {desc}")
            if len(by_type[issue_type]) > 30:
                print(f"  ... and {len(by_type[issue_type]) - 30} more")

    # Print any types not in our severity list
    for issue_type in sorted(by_type.keys()):
        if issue_type not in severity_order:
            print(f"\n{issue_type} ({len(by_type[issue_type])} issues):")
            for desc in by_type[issue_type][:30]:
                print(f"  {desc}")

    print("\n" + "=" * 70)
    print("SUMMARY")
    print(f"  Total exercises: {len(exercises)}")
    print(f"  Total issues: {len(all_issues)}")
    print(f"  Exercises with issues: {len(set(i[0] for i in all_issues))} types")

    # Save full report
    with open("tools/exercise_audit_report.txt", "w", encoding="utf-8") as f:
        f.write(f"Exercise Audit Report — {len(exercises)} exercises\n")
        f.write(f"Total issues: {len(all_issues)}\n\n")
        for issue_type, desc in all_issues:
            f.write(f"[{issue_type}] {desc}\n")
    print(f"\nFull report saved to tools/exercise_audit_report.txt")


if __name__ == "__main__":
    main()
