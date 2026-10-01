#!/usr/bin/env python3
"""Fetch all lesson exercises, lesson items, and words from Supabase DB.
Saves to JSON files for local audit processing.
"""
import json
import urllib.request
import os
import sys

PAT = os.environ.get("SUPABASE_PAT", "")
if not PAT:
    print("Set SUPABASE_PAT env var first."); sys.exit(1)
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


def fetch_batch(table, columns, offset, limit):
    """Fetch a batch of rows."""
    sql = f"SELECT {columns} FROM {table} ORDER BY id OFFSET {offset} LIMIT {limit}"
    return run_sql(sql)


def fetch_all(table, columns, batch_size=200):
    all_rows = []
    offset = 0
    while True:
        batch = fetch_batch(table, columns, offset, batch_size)
        if not batch:
            break
        all_rows.extend(batch)
        print(f"  {table}: fetched {len(all_rows)} rows (batch at offset {offset})")
        if len(batch) < batch_size:
            break
        offset += batch_size
    return all_rows


def main():
    print("Fetching lesson_exercises...")
    exercises = fetch_all("lesson_exercises", "id, lesson_id, type, payload")
    print(f"  Total: {len(exercises)} exercises")

    print("\nFetching lesson_items...")
    items = fetch_all("lesson_items", "id, lesson_id, kind, en, ar_meaning, translit, example_en, example_ar, note_ar")
    print(f"  Total: {len(items)} items")

    print("\nFetching words...")
    words = fetch_all("words", "en, ar, translit, category, ipa")
    print(f"  Total: {len(words)} words")

    print("\nFetching lessons (for context)...")
    lessons = fetch_all("lessons", "id, title_en, title_ar, slug")
    print(f"  Total: {len(lessons)} lessons")

    # Save to files
    data_dir = os.path.join(os.path.dirname(__file__), "audit_data")
    os.makedirs(data_dir, exist_ok=True)

    with open(os.path.join(data_dir, "exercises.json"), "w", encoding="utf-8") as f:
        json.dump(exercises, f, ensure_ascii=False, indent=2)
    with open(os.path.join(data_dir, "items.json"), "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    with open(os.path.join(data_dir, "words.json"), "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    with open(os.path.join(data_dir, "lessons.json"), "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)

    print(f"\nAll data saved to {data_dir}/")


if __name__ == "__main__":
    main()
