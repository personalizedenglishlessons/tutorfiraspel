#!/usr/bin/env python3
"""Audit the PEL Supabase database for content bugs."""
import json
import os
import urllib.request

TOKEN = os.environ["SUPABASE_ACCESS_TOKEN"]
API = "https://api.supabase.com/v1/projects/lewoochehpiycocvfwtz/database/query"


def run(sql):
    body = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(
        API, data=body,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def count(sql):
    return run(sql)[0]["count"]


print("=== 1. Farsi codepoints (should be 0 — Arabic codepoints only) ===")
# Persian letters: ی U+06CC, ک U+06A9, گ U+06AF, پ U+067E, چ U+0686, ژ U+0698, ۀ U+06C0
for col, table, where in [
    ("payload::text", "lesson_exercises", "payload::text"),
    ("ar_meaning", "lesson_items", "ar_meaning"),
    ("translit", "lesson_items", "translit"),
    ("example_ar", "lesson_items", "example_ar"),
    ("note_ar", "lesson_items", "note_ar"),
    ("title_ar", "lessons", "title_ar"),
]:
    for cp_name, cp in [("ی", "\u06CC"), ("ک", "\u06A9"), ("گ", "\u06AF"), ("پ", "\u067E"), ("چ", "\u0686"), ("ژ", "\u0698")]:
        n = count(f"select count(*) from {table} where {where} like '%{cp}%'")
        if n > 0:
            print(f"  {table}.{col} has {n} rows with Persian {cp_name} ({cp})")

print()
print("=== 2. Arabic corruption patterns ===")
print("  Doubled وو in translit:", count("select count(*) from lesson_items where translit like '%وو%'"))
print("  Doubled هه in ar_meaning:", count("select count(*) from lesson_items where ar_meaning like '%هه%'"))
print("  Hamza أ/إ/آ in ar_meaning (house style removes these):", count("select count(*) from lesson_items where ar_meaning ~ '[أإآ]'"))
print("  Ta marbuta ة in ar_meaning (house style uses ه):", count("select count(*) from lesson_items where ar_meaning ~ 'ة'"))
print("  Ta marbuta ة in note_ar:", count("select count(*) from lesson_items where note_ar ~ 'ة'"))
print("  Ta marbuta ة in example_ar:", count("select count(*) from lesson_items where example_ar ~ 'ة'"))
print("  Ta marbuta ة in title_ar:", count("select count(*) from lessons where title_ar ~ 'ة'"))
print("  Ta marbuta ة in exercise payload:", count("select count(*) from lesson_exercises where payload::text ~ 'ة'"))

print()
print("=== 3. Missing required fields ===")
print("  lesson_items with empty translit:", count("select count(*) from lesson_items where translit is null or translit = ''"))
print("  lesson_items with empty ar_meaning:", count("select count(*) from lesson_items where ar_meaning is null or ar_meaning = ''"))
print("  lesson_items with empty en:", count("select count(*) from lesson_items where en is null or en = ''"))
print("  lesson_exercises with empty payload:", count("select count(*) from lesson_exercises where payload is null or payload = '{}'::jsonb"))
print("  words with empty ar:", count("select count(*) from words where ar is null or ar = ''"))
print("  words with empty translit:", count("select count(*) from words where translit is null or translit = ''"))

print()
print("=== 4. Exercise payload issues ===")
print("  translate exercises missing answer:", count("select count(*) from lesson_exercises where type='translate' and (payload->>'answer' is null or payload->>'answer' = '')"))
print("  translate exercises missing source:", count("select count(*) from lesson_exercises where type='translate' and (payload->>'source' is null or payload->>'source' = '')"))
print("  translate exercises missing source_tr (translit):", count("select count(*) from lesson_exercises where type='translate' and (payload->>'source_tr' is null or payload->>'source_tr' = '')"))
print("  choose exercises missing question.en:", count("select count(*) from lesson_exercises where type='choose' and (payload#>>'{question,en}' is null or payload#>>'{question,en}' = '')"))
print("  choose exercises with <3 options:", count("select count(*) from lesson_exercises where type='choose' and jsonb_array_length(payload->'options') < 3"))
print("  choose exercises with >4 options:", count("select count(*) from lesson_exercises where type='choose' and jsonb_array_length(payload->'options') > 4"))
print("  order exercises missing items:", count("select count(*) from lesson_exercises where type='order' and (payload->'items' is null or jsonb_array_length(payload->'items') = 0)"))
print("  correct exercises missing source:", count("select count(*) from lesson_exercises where type='correct' and (payload->>'source' is null or payload->>'source' = '')"))
print("  spell exercises missing word:", count("select count(*) from lesson_exercises where type='spell' and (payload->>'word' is null or payload->>'word' = '')"))

print()
print("=== 5. Options without translit (tr) field ===")
print("  choose options missing tr:", count("""select count(*) from lesson_exercises where type='choose' and exists (select 1 from jsonb_array_elements(payload->'options') opt where opt->>'tr' is null or opt->>'tr' = '')"""))
