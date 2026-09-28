#!/usr/bin/env python3
"""
audit_corruption.py — exhaustive sweep for the 57f466b Arabic corruption.

The 2026-09-26 commit 57f466b ("deep Arabic simplification") rewrote 1,366
lines across 18 files. Most changes were intentional Saudi-dialect
simplification, but it also introduced garbage word-mangling. This tool
encodes every verified garbage pattern recovered since (source diffed
against 57f466b^, signature-anchored, majority-vote verified) so the whole
repo can be re-swept in seconds after any change.

Run:            python3 tools/audit_corruption.py
Exit code 1 if any hit. CI-safe: add to your pre-push routine.
DB check:       python3 tools/audit_corruption.py --sql   (prints the SQL)
                 -> paste into Supabase Management API / query tool.

House style (do NOT flag): عشانك؟ greeting, كيفك greetings, بعدين/بعدها,
ومثلن/مثلن, اغلط, پ/گ/چ/ڤ translit letters, ة->ه, no hamza, الانجليزي.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# --- verified garbage patterns ------------------------------------------
# (name, regex)  — Arabic chars are \w in Python re, so \b works for Arabic.
PATTERNS = [
    # substitution families (the majority-vote verified map)
    ("ببدون (بدون doubled)", r"\bببدون\b"),
    ("مكن standalone (قد mangled)", r"\bمكن\b"),
    ("الحينجليزي family", r"حينجليز"),
    ("الاغيردات", r"\bالاغيردات\b"),
    ("الوفكار (الافكار)", r"\bالوفكار\b"),
    ("الواحداث (الاحداث)", r"\bالواحداث\b"),
    ("كيفك انت (كيف انت)", r"كيفك انت"),
    # one-off garbles confirmed against the pre-corruption baseline
    ("يبانن (يبدون)", r"\bيبانن\b"),
    ("لازمون (لا بدون)", r"لازمون"),
    ("فعلايبك (شنطك)", r"فعلايبك"),
    ("يداخل (garbage)", r"\bيداخل\b"),
    ("ثمانانيه (ثمان)", r"ثمانانيه"),
    ("فومثلن (فمثلن)", r"فومثلن"),
    ("الكلًا (حياكم الكل)", r"الكلًا"),
    ("بكذا هذا (بكم ذا)", r"بكذا هذا"),
    ("بسط وقواعد (انماط)", r"بسط وقواعد"),
    # DB-side family: hamza replaced by plain alef -> doubled-ا garbles
    ("اضافه→ومثلن family", r"\bومثلن\b|\bفمثلن\b"),
    ("nice to meet you → فرصه مبسوطه (should be تشرفنا)", r"فرصه مبسوطه|فرصه سعيده"),
    ("translit garbles", r"انڤايربسنتس|انڤايرانمينتال|يپاسود"),
    ("truncated تصحيح", r"وتصح |\bتصحك\b"),
    ("doubled-ا garble (hamza->ا)", r"(الادعااات|الاربعاا|الرايسية|والاشياا|الثلاثاا|ادعاااتك|الحقااق|العاالة|الاسماا|القرااة|الخضراا|الاسااة|الاشياا|الضماار|القراان|الاجزاا|الادعاا|للاشياا|الاخطاا|النتااج|القاامة|للعاالة|بالشتاا|لاشياا|حقاابك|اخطااك|ومااين|الاراا|وحذااي|ادعااك|للوراا|لاجزاا|لاعطاا|المساا|الدواا|السماا|قاامة|وااكد|نهااي|زرقاا|قراان|اعطاا|اسماا|حقااق|نتااج|حذااي|عبااة|اخطاا|اجزاا|حمراا|دوااك|دااما|ادعاا|ااجر|وراا|شااع|رااح|مساا|حذاا|ساال|عشاا)"),
    ("الرايسية (الرئيسيه)", r"الرايسية"),
    ("ربط احداث (ربط بعدين)", r"ربط احداث"),
    ("عشان ج (كيف ج)", r"عشان ج"),
    # truncations (dropped trailing ي/يه)
    ("truncated الجا", r"\bالجا\b"),
    ("truncated الجاه", r"\bالجاه\b"),
    ("truncated التكي (التكيفي)", r"\bالتكي\b"),
    ("truncated ونتك (ونتكيف)", r"\bونتك\b"),
]

SCAN_GLOBS = ["*.html", "*.js", "*.py"]
SKIP_DIRS = {"node_modules", ".git", "memory", "current_session_context", "downloads"}
SKIP_FILES = {"audit_corruption.py"}

DB_SQL = (
    "-- Sweep every Arabic-bearing content column for the garbage families.\n"
    "-- Run via Supabase Management API (single statement per call).\n"
    "select 'lesson_items' t, id, kind, en, ar_meaning from lesson_items\n"
    " where ar_meaning ~ 'ببدون|^مكن$|حينجليز|الاغيردات|الوفكار|الواحداث|يبانن|لازمون|فعلايبك|يداخل|ثمانانيه|فومثلن|ومثلن|فمثلن|فرصه مبسوطه|فرصه سعيده|بكذا هذا'\n"
    "    or ar_meaning ~ 'ساال|وراا|عشاا|شااع|دااما|اخطاا|قراان|اسماا|حذاا|قاامة|اجزاا|حقااق|نتااج|نهااي|عبااة|الرايسية'\n"
    "    or example_ar ~ 'ببدون|حينجليز|الاغيردات|الوفكار|الواحداث|يبانن|لازمون|فعلايبك|يداخل|ثمانانيه|فومثلن|ومثلن|فمثلن|فرصه مبسوطه|فرصه سعيده|بكذا هذا'\n"
    "    or example_ar ~ 'ساال|وراا|عشاا|شااع|دااما|اخطاا|قراان|اسماا|حذاا|قاامة|اجزاا|حقااق|نتااج|نهااي|عبااة|الرايسية'\n"
    "    or note_ar ~ 'ساال|وراا|عشاا|شااع|دااما|اخطاا|قراان|الرايسية'\n"
    "union all\n"
    "select 'lessons', id, '', title_en, title_ar from lessons\n"
    " where title_ar ~ 'ببدون|حينجليز|الاغيردات|الوفكار|الواحداث|يبانن|لازمون|فعلايبك|يداخل|ثمانانيه|فومثلن|بكذا هذا|ساال|وراا|دااما|الرايسية';\n"
    "union all\n"
    "select 'lesson_exercises', id, type, lesson_id, payload->>'ar' from lesson_exercises\n"
    " where payload::text ~ 'ببدون|حينجليز|الوفكار|الواحداث|يبانن|لازمون|فعلايبك|يداخل|ثمانانيه|فومثلن|بكذا هذا|ساال|وراا|دااما|قراان|شااع|الرايسية'\n"
    "    or hint_ar ~ 'ساال|وراا|دااما|قراان|شااع|الرايسية|ببدون|ثمانانيه';\n"
)


def scan():
    hits = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lstrip(".") not in {g.lstrip("*.") for g in SCAN_GLOBS}:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name in SKIP_FILES:
            continue
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except (UnicodeDecodeError, OSError):
            continue
        for i, line in enumerate(lines, 1):
            for name, pat in PATTERNS:
                if re.search(pat, line):
                    hits.append(f"{path.relative_to(ROOT)}:{i}: [{name}] {line.strip()[:120]}")
    return hits


def main():
    if "--sql" in sys.argv:
        print(DB_SQL)
        return 0
    hits = scan()
    if hits:
        print(f"CORRUPTION: {len(hits)} hit(s) found:\n")
        print("\n".join(hits))
        print("\nFix before pushing. See NEXT_STEPS.md corruption notes for the map.")
        return 1
    print(f"CLEAN — {len(PATTERNS)} garbage patterns, 0 hits across the repo.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
