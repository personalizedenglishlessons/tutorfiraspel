# PEL Supabase Schema Notes

**Project ref:** `lewoochehpiycocvfwtz`
**Region:** ap-northeast-1 (Tokyo)
**Migrations:** 46 applied (see `supabase/migrations/`)

The app connects with the **anon (public) key** + the logged-in student's session via
`@supabase/supabase-js@2`. RLS is enabled on every table so students can only read/write
their own rows. The service-role key / management token are never committed to source.

## All tables (51, all with RLS enabled)

### Curriculum (public read-only)
| Table | Rows | Description |
|-------|------|-------------|
| `lessons` | 366 | Lessons belonging to an academy (`id`, `academy_id`, `en`, `ar`, `title_ar`, …). |
| `lesson_items` | 2,559 | Vocab + dialogue building blocks (`lesson_id`, `kind`, `en`, `ar_meaning`, `translit`, `example_en/ar`, `note_en/ar`). |
| `lesson_exercises` | 1,428 | Practice questions per lesson (`lesson_id`, `type`, `payload` JSONB). Types: choose, translate, fill_blank, arrange_words, db_correct, etc. |
| `words` | 183 | Vocabulary bank entries (`en`, `ar`, `translit`, `category`, `ipa`, synonyms, antonyms, tip). |
| `academies` | — | Academy records. |
| `academy_lessons` | — | Academy ↔ lesson mapping. |
| `academy_tags` | — | Academy tags. |
| `programs` | — | Programs. |
| `tracks` | — | Learning tracks. |
| `track_academies` | — | Track ↔ academy mapping. |

### Student progress & state (owner-scoped)
| Table | Description |
|-------|-------------|
| `student_profiles` | Student profile info (3 rows). |
| `student_data` | Student app data / progress. |
| `student_state` | Student UI state. |
| `student_learning_state` | Learning state (granular routing). |
| `student_progression` | Progression tracking. |
| `lesson_progress` | Per-lesson progress. |
| `student_notes` | Student notes. |
| `student_activity_events` | Page views + 60s heartbeats (402 rows, pruned after 14 days). |
| `student_presence` | Presence tracking. |
| `pel_srs_state` | Spaced repetition state (1/3/7/14/30 day intervals). |
| `pel_student_feedback_events` | Lesson/drill/writing feedback (`user_id`, `lesson_slug`, `fit_type`, `score`, payload). RLS: student can insert/select only their own rows. |
| `learning_snapshots` | Periodic learning snapshots. |
| `learning_timeline` | Learning timeline events. |

### Certificates
| Table | Description |
|-------|-------------|
| `certificates` | Issued certificates (3 rows). Admin issues & prints; `verify.html` looks up by code. |

### Groups & live classes
| Table | Description |
|-------|-------------|
| `groups` | Student groups. |
| `group_members` | Group membership. |
| `group_waitlist` | Group waitlist. |
| `live_classes` | Live class sessions. |
| `live_class_requests` | Live class requests. |
| `live_class_cities` | Live class cities. |
| `live_class_services` | Live class services. |

### Auth, roles & billing
| Table | Description |
|-------|-------------|
| `profiles` | User profiles (auth.users mirror). |
| `user_roles` | User → role mapping. |
| `roles` | Role definitions. |
| `permissions` | Permission definitions. |
| `role_permissions` | Role ↔ permission mapping. |
| `subscriptions` | Active subscriptions. |
| `plan_history` | Plan change history. |
| `plan_pricing` | Plan pricing. |
| `credit_ledger` | Credit transactions. |
| `auth_attempts` | Login attempt log (26 rows, pruned after 3 days). Used by `check_auth_rate_limit()`. |

### Admin & system
| Table | Description |
|-------|-------------|
| `site_settings` | Site-wide settings (banners, WhatsApp contacts). |
| `audit_log` | Admin action audit trail (102 rows, pruned after 90 days). |
| `interventions` | Student interventions. |
| `teacher_profiles` | Teacher profiles. |
| `teacher_overrides` | Teacher overrides. |
| `announcements` | System announcements. |
| `announcement_recipients` | Announcement recipients. |
| `recommendations` | Recommendations. |
| `assessment_questions` | Assessment question bank. |
| `attendance` | Attendance records. |

## Key functions

- `has_permission()` — checks `role_permissions` joined with `user_roles`.
- `can_access_pel()` — checks admin role OR active subscription.
- `audit_action()` — RPC for audit logging.
- `check_auth_rate_limit()` — security-definer RPC for per-IP login rate limiting.
- `pel_cleanup_old_data()` — prunes old rows from `student_activity_events` (14d),
  `auth_attempts` (3d), `audit_log` (90d), `pel_student_feedback_events` (30d).
  Scheduled nightly at 3:00 AM UTC via pg_cron.

## Edge Functions

| Function | Version | CORS | Description |
|----------|---------|------|-------------|
| `transcribe` | v2 | GitHub Pages origin | Whisper speech-to-text for iOS Safari. Requires `OPENAI_API_KEY` secret. |
| `rate-limited-login` | v4 | GitHub Pages origin | Per-IP rate limiting (5/15min), honeypot, email/password validation. Deployed and wired into `login.html`. |

## How the app reads lessons

`app.html` loads a lesson from Supabase via the anon client and maps the DB rows into
the in-app lesson model (`dbToLesson`). If a seeded DB lesson comes back with thin
vocab, it falls back to the richer authored `PEL_BEGINNER` content so the student always
sees a complete lesson.

## One-time SQL / seeding

Seeding and ad-hoc SQL are run via the **Supabase Management API** SQL endpoint using a
personal access token. That token is used **only** for one-time SQL — it is **not** stored
in the app, the zip, or the deployed site. To re-run or extend SQL, use the Management API
SQL endpoint, the `supabase` CLI, or the Supabase dashboard SQL editor; never commit a
token to source. The `tools/push_migrations.py` script automates applying pending
migration files and recording them in `supabase_migrations.schema_migrations`.

## Verifying feedback

```sql
select user_id, lesson_slug, fit_type, score, created_at
from pel_student_feedback_events
order by created_at desc
limit 50;
```
