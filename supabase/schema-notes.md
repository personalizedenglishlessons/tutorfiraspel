# PEL Supabase Schema Notes

**Project ref:** `lewoochehpiycocvfwtz`
**Region:** configured in the Supabase dashboard.

The app connects with the **anon (public) key** + the logged-in student's session via
`@supabase/supabase-js@2`. RLS is enabled on every table so students can only read/write
their own rows.

## Tables (verified by what the app actually queries)

These are the tables the running code reads/writes via `supabase.from(...)`.

### Curriculum — queried by the admin console (`admin.js`)
- `lessons` — a lesson belongs to an academy (`id`, `academy_id`, `en`, `ar`, …).
  **41 beginner lessons** seeded for `english-foundations`.
- `lesson_items` — vocab + dialogue building blocks (`lesson_id`, `kind`, `en`, `ar`,
  `translit`, examples, notes). **287 items** seeded.
- `lesson_exercises` — practice questions per lesson. **203** seeded.

### Admin tables — queried by the admin console (`admin.js`)
`academies`, `academy_lessons`, `certificates`, `groups`, `programs`,
`student_profiles`, `student_data`, `student_state`, `site_settings`, `audit_log`,
`interventions`, `learning_snapshots`, `live_classes`, `student_notes`.

- `certificates` — issued certificates (student, academy, lesson/level, issue date,
  certificate code). The admin console issues & prints these; `verify.html` looks one up
  by its code (with the QR from `lib/cert-qr.js`).

### Student-facing — queried by `app.html`
- `student_data`, `student_state` — the logged-in student's own progress/state.
- `pel_student_feedback_events` — feedback on lessons/drills/writing
  (`user_id`, `lesson_slug`, `fit_type`, `score`, payload).
  **RLS:** a student can `insert` and `select` only their own rows
  (`auth.uid() = user_id`).

## How the app reads lessons

`app.html` loads a lesson from Supabase via the anon client and maps the DB rows into
the in-app lesson model (`dbToLesson`). If a seeded DB lesson comes back with thin
vocab, it falls back to the richer authored `PEL_BEGINNER` content so the student always
sees a complete lesson.

## One-time SQL / seeding

Seeding was done once via the **Supabase Management API** using a personal access
 token. That token is used **only** for one-time SQL — it is **not** stored in the app,
 the zip, or the deployed site. To re-run or extend SQL, use the Management API SQL
 endpoint or the Supabase dashboard SQL editor; never commit a token to source.

## Verifying feedback

```sql
select user_id, lesson_slug, fit_type, score, created_at
from pel_student_feedback_events
order by created_at desc
limit 50;
```
