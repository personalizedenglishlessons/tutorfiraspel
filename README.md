# PEL — Personalized English Lessons

A Supabase-backed static web app for learning American English (with Arabic support),
built by Tutor Firas. Served as a static site (e.g. GitHub Pages) from a subpath, so all
asset references are root-relative.

## Folder structure

```
PEL-App-GitHub-ready/
├── index.html          Landing page (entry point)
├── app.html            Main learning SPA (self-contained inline app logic)
├── login.html          Student login
├── verify.html         Certificate verification
├── admin.html          Admin console (entry)
├── legal.html          Privacy / Terms
├── e2e_sw.js           Service worker
├── brand/              Logos, favicons, manifest, OG image
├── admin/
│   ├── admin.js        Admin logic (issue + print certificates, etc.)
│   └── admin.css       Admin styles
├── lib/                Shared JS loaded by the pages above
│   ├── daily-lesson.js      Lesson of the Day data (PEL_DAILY.featured())
│   ├── pel-personalization.js  Personalization engine (PEL_ENGINE)
│   ├── pel-plans.js         Plans / WhatsApp links (PEL_PLANS)
│   ├── pel-settings.js      Settings
│   ├── onboard.js           Onboarding
│   ├── cert-qr.js           Certificate QR code renderer
│   ├── cert-sheet.js        Certificate sheet renderer + print styles
│   ├── pel_lesson_stage.js   Optional enhanced mirror of app.html's stage
│   ├── pel_curriculum_path.js Optional curriculum-path mirror
│   └── pel_dashboard_life.js Optional dashboard mirror
├── supabase/
│   └── schema-notes.md  DB schema & how the app connects
├── tests/
│   └── smoke-checklist.md
└── README.md
```

## How the app connects to Supabase

The app uses the **Supabase JS client** (`@supabase/supabase-js@2`) with the **anon key**
plus each logged-in student's session. No service-role key or management token is ever
embedded in the app source.

See [`supabase/schema-notes.md`](supabase/schema-notes.md) for the tables, RLS, and
how lessons / certificates / feedback are read.

## Optional stage modules (`lib/pel_lesson_stage.js` etc.)

`app.html` already defines `PEL_LESSON_STAGE`, `PEL_CURRICULUM_PATH`, and
`PEL_DASH_LIFE` inline (with guards so an external module can take precedence if loaded).
The three `lib/pel_*.js` modules are enhanced mirrors kept for a future refactor that
extracts app.html's inline logic. They are **not** force-loaded today to avoid
double-definition/guard conflicts; the app is fully functional via the inline fallbacks
(which include the Supabase feedback wiring).

## Certificate printing

`lib/cert-sheet.js` keeps the certificate dark/elegant on screen, but in `@media print`
switches to a **light cream paper with dark text and thin gold strokes** and uses
`print-color-adjust: economy`, so printing on paper no longer dumps a full sheet of
dark ink.

## Local dev

This is a static site — open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/
```

## Deploy to GitHub Pages

1. Push this folder to a repository (e.g. `tutorfiraspel`).
2. Settings → Pages → deploy from branch (root).
3. The site lives at `https://<user>.github.io/tutorfiraspel/`.

## License

© PEL — Personalized English Lessons. All rights reserved.
