# PEL - Personalized English Lessons

A Supabase-backed static web app for learning American English (with Arabic support),
built by Tutor Firas. Served as a static site (e.g. GitHub Pages) from a subpath, so all
asset references are root-relative.

## Live deployment

- **App:** https://personalizedenglishlessons.github.io/tutorfiraspel/
- **Supabase project:** `lewoochehpiycocvfwtz` (ap-northeast-1 / Tokyo)
- **Hosting:** GitHub Pages (static)

## Folder structure

```
tutorfiraspel/
├── index.html              Landing page (entry point)
├── app.html                Main learning SPA (self-contained inline app logic)
├── login.html              Student login (rate-limited via Edge Function)
├── verify.html             Certificate verification
├── admin.html              Admin console (entry)
├── legal.html              Privacy / Terms
├── _headers                Security headers (for Cloudflare Pages / Netlify migration)
├── robots.txt              Search engine directives
├── AUDIT_REPORT.md         Full audit report (Sept 18, 2026)
├── AUDIT_REPORT_2026-09-20.md  Fresh audit report (Sept 20, 2026)
├── SECURITY.md             Security hardening matrix
├── NEXT_STEPS.md           Development log and pending items
├── brand/                  Logos, favicons, manifest, OG image, build-assets script
├── admin/
│   ├── admin.js            Admin logic (certificates, student management, etc.)
│   └── admin.css           Admin styles
├── lib/                    Shared JS loaded by the pages above
│   ├── pel_config.js       Supabase URL + anon key (single source of truth)
│   ├── daily-lesson.js     Lesson of the Day data (PEL_DAILY.featured())
│   ├── pel-personalization.js  Personalization engine (PEL_ENGINE)
│   ├── pel-plans.js        Plans / WhatsApp links (PEL_PLANS)
│   ├── pel-settings.js     Settings
│   ├── pel-assessment.js   Assessment engine
│   ├── onboard.js          Onboarding
│   ├── cert-qr.js          Certificate QR code renderer
│   ├── cert-sheet.js       Certificate sheet renderer + print styles
│   ├── e2e_sw.js           Service worker
│   ├── pel_lesson_stage.js Enhanced lesson stage (factory, loaded by app.html)
│   ├── pel_dashboard_life.js  Dashboard animation + study tools strip (factory)
│   └── pel_curriculum_path.js  Curriculum roadmap view (self-contained)
├── supabase/
│   ├── schema-notes.md     DB schema & how the app connects
│   ├── functions/
│   │   ├── transcribe/     Whisper speech-to-text Edge Function (v2, CORS restricted)
│   │   ├── rate-limited-login/  Per-IP login rate limiting Edge Function (v4, deployed)
│   │   └── tutor-ai/       Archived (was orphaned, deleted from Supabase)
│   └── migrations/         SQL migration files (32 migrations)
├── tests/
│   ├── test_buildsequence_iam.js  Build sequence tests (13 tests)
│   ├── test_teaching_flow.js     Teaching flow tests (31 tests)
│   └── smoke-checklist.md        Manual smoke test checklist
└── tools/                  Dev/maintenance scripts
    ├── batch_vocab_data.py     Vocabulary data generation
    ├── gen_lessons_batch1.py   Lesson generation (batch 1)
    ├── gen_lessons_batch2.py   Lesson generation (batch 2)
    ├── gen_lessons_pack2.py    Lesson generation (pack 2)
    ├── gen_arabic_remaining.py Arabic content generation
    ├── seed_flagship_lessons.py Flagship lesson seeding
    ├── audit-*.js / audit_*.py  Audit scripts
    ├── patch_*.py               Data patch scripts
    └── bug_sweep/               Bug sweep scripts
```

## How the app connects to Supabase

The app uses the **Supabase JS client** (`@supabase/supabase-js@2.50.0`) with the **anon key**
plus each logged-in student's session. No service-role key or access token is ever
embedded in the app source. The anon key is centralized in `lib/pel_config.js`.

See [`supabase/schema-notes.md`](supabase/schema-notes.md) for the tables, RLS, and
how lessons / certificates / feedback are read.

## Study tools

All study tools are unlocked for all students regardless of CEFR level or lessons
completed. They appear on the dashboard strip and inside each lesson:

| Tool | View | Description |
|------|------|-------------|
| Vocabulary | `vocabulary` | Flashcard vault with 170+ words, A0 pronunciation cards, Abha expressions |
| Grammar | `grammar` | 16 grammar topics + Saudi Mistake Coach (8 categories, 22 patterns) |
| Pronunciation | `pronunciation` | 15 topic tiles + 4 leveled drills (word → phrase → sentence) |
| Speaking | `speaking` | Roleplay simulator with 18 personas |
| Listening | `listening` | 7 interactive audio tracks with transcripts |
| Reading | `reading` | 6 timed articles with vocabulary and quizzes |
| Writing | `writing` | 25 writing prompts with free grammar check feedback |
| Review | `review` | Spaced repetition system (1, 3, 7, 14, 30 day intervals) |
| Bookmarks | `bookmarks` | Saved lessons, vocabulary, and favourites |

## Stage modules (`lib/pel_lesson_stage.js` etc.) - SINGLE SOURCE OF TRUTH

`lib/pel_lesson_stage.js`, `lib/pel_dashboard_life.js`, and
`lib/pel_curriculum_path.js` ARE the live engine - loaded as synchronous
scripts in `app.html` (no longer optional mirrors). The stage and dashboard
modules are **factories** (`window.PEL_STAGE_FACTORY(deps)` /
`window.PEL_DASH_LIFE_FACTORY(deps)`): `app.html` calls them inside its main
script and injects the app helpers they need (`getLesson`, `markLessonComplete`,
`ACADEMIES`, `toast`, ... plus getters for mutable state like `accountPrefs`).
`lib/pel_curriculum_path.js` is self-contained and wires itself.

**Never paste engine code back into `app.html`** - edit the lib module and the
whole app picks it up. `tests/test_buildsequence_iam.js` loads the REAL
factory file (not hand-copies) so it always tests the shipped code.

## Edge Functions

| Function | Version | Status | CORS |
|----------|---------|--------|------|
| `transcribe` | v2 | Active | Restricted to GitHub Pages origin |
| `rate-limited-login` | v4 | Active | Restricted to GitHub Pages origin |
| `tutor-ai` | - | Deleted | Archived in repo (was orphaned) |

## Certificate printing

`lib/cert-sheet.js` keeps the certificate dark/elegant on screen, but in `@media print`
switches to a **light cream paper with dark text and thin gold strokes** and uses
`print-color-adjust: economy`, so printing on paper no longer dumps a full sheet of
dark ink.

## Local dev

This is a static site - open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/
```

## Deploy to GitHub Pages

1. Push this folder to a repository (e.g. `tutorfiraspel`).
2. Settings → Pages → deploy from branch (root).
3. The site lives at `https://<user>.github.io/tutorfiraspel/`.

## Tests

```bash
node tests/test_buildsequence_iam.js   # 13 tests
node tests/test_teaching_flow.js       # 52 tests
# Total: 65/65 PASS
```

## License

© PEL - Personalized English Lessons. All rights reserved.
