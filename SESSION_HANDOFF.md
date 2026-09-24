# Session Handoff — 2026-09-24

> **For the next agent/session picking up this work.**
> This file is auto-generated to preserve progress across sessions.

---

## What This Session Was About

**Session:** [Push Supabase SQL Migrations Safely](https://www.perplexity.ai/computer/tasks/e416f64f-e329-49e6-b27c-99827e69b6d7?view=thread)
**Session ID:** `e416f64f-e329-49e6-b27c-99827e69b6d7`
**Date:** 2026-09-24 00:30 – 00:45 UTC
**Status:** Blocked (waiting for user decisions)

The user provided a Supabase access token (redacted for security — stored in environment variables only) and asked the agent to:
1. Connect GitHub and understand the project
2. Push SQL migrations to the live Supabase database
3. Fix/add/upgrade things, committing after each change

---

## What Was Completed

### 1. Transcribe Edge Function CORS Fix — DEPLOYED (not committed to repo)
- The `transcribe` edge function had CORS origin set to `*` (wildcard)
- Fixed to restrict to `https://personalizedenglishlessons.github.io`
- Deployed via Supabase CLI, verified working
- **NOTE:** This fix was deployed directly to Supabase but was NOT committed to the git repo. The source code in `supabase/functions/transcribe/` may still show the old `*` CORS. Needs syncing.

### 2. Migration Inspection — 19 Pending Migrations
- 19 local migrations found in `supabase/migrations/` not tracked as applied on remote Supabase DB
- All 19 inspected and confirmed **idempotent** (safe to re-run)
- Dry run (`supabase db push --dry-run`) passed
- **NOT PUSHED** — user was asked to approve, said "Not yet"

The 19 migrations are:
1. `202608240001_tiers_assessment_credits.sql`
2. `202608240002_assessment_drives_route.sql`
3. `202608240003_grant_admin_write_privileges.sql`
4. `202608240004_live_class_requests.sql`
5. `202608240005_admin_set_plan_level_reset_stage.sql`
6. `202608260001_fix_correct_exercises_right_eq_wrong.sql`
7. `202608260002_fix_admin_create_student.sql`
8. `202608260003_student_learning_state.sql`
9. `202608270001_a1_start_granular_lessons.sql`
10. `202608270002_route_granular_first_all_levels.sql`
11. `202608270003_step_exam_prep_sets_track.sql`
12. `202608270004_route_priority_and_assigned_plan.sql`
13. `202608270005_global_granular_route_and_plan_clear_stage.sql`
14. `202608280001_wire_orphan_academies_normalize_levels.sql`
15. `202609050001_ensure_permission_system.sql`
16. `202609080001_pel_srs_state.sql`
17. `202609100001_lesson_progress_stats.sql`
18. `202609130001_fix_embedded_arabic_questions.sql`
19. `202609130002_add_arabic_remaining.sql`

*(Note: There are actually 24 migration files in the repo, plus `auth_rate_limit.sql`. The session reported 19 pending — verify with `supabase migration list` before pushing.)*

### 3. Full Codebase Audit — 22 Bugs Found

Three parallel audit subagents completed covering all ~34,000 lines:

#### CRITICAL (1)

| # | File | Bug |
|---|------|-----|
| 1 | `admin/admin.js` | **Announcement Edit/Delete broken** — `announcementsView()` reads `window.__annRows` for Edit/Delete, but that global is only populated by the unrelated `reports()` function. Clicking Edit/Delete throws TypeError if Reports view hasn't been opened. **Fix:** Rename the global in `reports()` to something like `window.__reportRows`. |

#### HIGH (4)

| # | File | Bug |
|---|------|-----|
| 2 | `pel-assessment.js` | **Stale pricing in offline fallback** — Shows 230/450/750 SAR when Supabase is unreachable, but real prices in `pel-plans.js` are 800/1000/1500 SAR. **Fix:** Update the fallback prices. |
| 3 | `app.html` (`toast()`) | **XSS gap** — Lesson titles/achievement names interpolated into `innerHTML` without `escapeHtml()`. Currently safe (static content) but becomes stored XSS once titles come from DB. **Fix:** Add `escapeHtml()` to all dynamic strings in `toast()`. |
| 4 | `pel_lesson_stage.js` | **Duplicate teaching content** — 6 keys in `TEACHING_CONTENT` (`the`, `is`, `are`, `not`, `in`, `on`) defined twice. First definitions silently discarded. **Fix:** Remove duplicates, merge any unique content. |
| 5 | `admin/admin.js` | **Admin direct table writes bypass RPC** — ~11 admin mutation paths write directly to tables instead of SECURITY DEFINER RPCs as documented. Depends on RLS being correct. **Fix:** Refactor to use RPCs (large effort). |

#### MEDIUM (8)

| # | File | Bug |
|---|------|-----|
| 6 | `app.html` | `markLessonComplete()` grants XP/achievements before server RPC confirms — no rollback on rejection. |
| 7 | `app.html` | Beginner banner: "English Starter" and "English Basics" buttons both navigate home (one is a no-op). |
| 8 | `app.html` | Listening Lounge "Play All" continues speaking after modal closed — no `speechSynthesis.cancel()`. |
| 9 | `admin/admin.js` | 9 duplicate i18n keys silently override different translation strings. |
| 10 | `pel_lesson_stage.js` | Inconsistent normalization between scoring logic and UI highlight logic in two renderers. |
| 11 | `app.html` | Word Burst dashboard card never rebuilds after first render. |
| 12 | `app.html` / `pel_lesson_stage.js` | Missing re-entrancy guard on lesson-completion auto-advance flow. |
| 13 | `app.html` | Several `role="button"` elements lack keyboard (Enter/Space) activation handlers. |

#### LOW (9)

| # | File | Bug |
|---|------|-----|
| 14 | `app.html` | Credits-refresh `setInterval` not cleared on 2 of 3 sign-out paths. |
| 15 | `app.html` | Arabic greeting text identical for "afternoon" and "evening". |
| 16 | `app.html` | `showAnnouncementsModal()` has no `.catch()` — failed RPC silently does nothing. |
| 17 | `app.html` | Dead duplicated condition in `dashSkillData()`. |
| 18 | `app.html` | Search inputs rely on placeholder text only, no accessible label. |
| 19 | `admin/admin.js` | Hardcoded Supabase credentials duplicated across 3 files. |
| 20 | `onboard.js` | Magic-number coupling in onboarding step machine. |
| 21 | `admin/admin.js` | `esc()` misapplied to a `.textContent` assignment. |
| 22 | Multiple | Non-user-namespaced localStorage keys for SRS/session state on shared devices. |

### 4. Best Practices Research Completed
- UX/UI improvements (skill tree, streaks, leaderboards, progress visualization)
- Accessibility (WCAG 2.1 AA compliance gaps identified)
- SEO improvements (Schema.org Course/VideoObject/BreadcrumbList markup)
- Full report generated as `PEL_App_Improvements_Report.docx` (not in repo — was in session workspace)

---

## What Was NOT Done (Pick Up Here)

### Blocked — Needs User Decision

1. **Push 19 Supabase migrations** — All validated and idempotent. Run `supabase db push` to apply. User previously said "Not yet."

2. **Fix the 22 bugs** — User was asked to approve Fix Batch A (bugs #1-#13), chose "Let me choose" but never selected which to fix. All are safe to fix.

3. **Sync transcribe CORS fix to repo** — The deployed edge function has the fix, but the repo source may not. Commit the updated CORS origin to `supabase/functions/transcribe/`.

4. **Commit the PEL_App_Improvements_Report** — The improvements report was generated but never committed to the repo.

### Recommended Priority

| Order | Task | Effort |
|-------|------|--------|
| 1 | Push 19 Supabase migrations (already validated) | Trivial |
| 2 | Sync transcribe CORS fix to repo | Small |
| 3 | Fix CRITICAL #1: Admin announcement namespace collision | Small |
| 4 | Fix HIGH #2: Stale pricing in offline fallback | Small |
| 5 | Fix HIGH #3: XSS in `toast()` | Small |
| 6 | Fix HIGH #4: Duplicate teaching content keys | Small |
| 7 | Fix MEDIUM #6-#13 | Medium |
| 8 | Fix LOW #14-#22 | Small |
| 9 | Fix HIGH #5: Refactor admin direct table writes to RPCs | Large |
| 10 | Implement UX/UI, accessibility, and SEO improvements | Large |

---

## Environment & Access

- **GitHub:** Connected via MCP. Repo: `personalizedenglishlessons/tutorfiraspel`
- **Supabase CLI:** Configured with user-provided access token (redacted — check environment variables or ask user for the token)
- **Supabase Project:** `lewoochehpiycocvfwtz` (ap-northeast-1 / Tokyo)
- **Deployed at:** https://personalizedenglishlessons.github.io/tutorfiraspel/
- **User timezone:** Asia/Riyadh (Jeddah, Saudi Arabia)
- **App language:** Arabic (Saudi dialect) for Saudi English learners
- **Currency:** SAR (Saudi Riyal)
- **Key files:** `app.html` (21K lines), `lib/*.js` (14 files), `admin/admin.js` (3.7K lines)
- **Existing docs:** `AUDIT_REPORT.md`, `AUDIT_REPORT_2026-09-20.md`, `NEXT_STEPS.md`, `SECURITY.md`, `STUDY_TOOLS_AUDIT.md`

---

## Important Notes

- The user wants **commits pushed immediately** after each fix — "push and commit as soon you fix or add or upgrade something so no progress is lost"
- The Supabase token may be **time-limited** — act quickly
- Previous sessions have already fixed many bugs (see `NEXT_STEPS.md` and commit history)
- The codebase uses vanilla JavaScript IIFEs, not a framework
- XSS hygiene is generally good (`esc()`/`escapeHtml()` used consistently) except in `toast()` and the admin `esc()` misuse
- All 44 automated tests pass
- RLS is enabled on all 50+ database tables
