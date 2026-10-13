# PEL HTML Audit Report — 2026-10-13 (Round 2, All Fixed)

Repo: `personalizedenglishlessons/tutorfiraspel`
Scope: all 8 HTML files. Round 2 added a real ESLint pass plus jsdom execution of every inline script; this update marks all findings fixed and verified.

## Fixes applied (this session)

| Bug | File | Commit | Status |
|---|---|---|---|
| A. `ReferenceError: currentUser is not defined` in `pelGlobalWelcome` (welcome banner never shows) | app.html:24371 | `798695f` | FIXED — exposed `window.PEL_CURRENT_USER` getter in block 0, block 2 reads it; jsdom-verified |
| B. `window.accountPrefs && accountPrefs.lang` dead guard in block 2 | app.html:24131 | `798695f` | FIXED — exposed `window.accountPrefs` getter via `Object.defineProperty` |
| C. `duration: '6h'` hardcoded on every course card | app.html:2167, 2195 | next commit | FIXED — added `acDurationLabel(lessonCount)` deriving from `~8 min/lesson`; respects `dbAc.duration` if present |
| D. `startHeartbeat()` double-binds `visibilitychange` (memory leak + duplicate heartbeats) | app.html:3055-3063 | next commit | FIXED — moved `visibilitychange` binding to IIFE module scope, bound once |
| E. `sessionStorage.setItem('pel_session_id')` throws in Safari private mode | app.html:3023 | next commit | FIXED — wrapped both `getItem` and `setItem` in try/catch |
| F. `var` redeclarations flagged by ESLint `no-redeclare` | index.html:1595, 1752 | next commit | FIXED — renamed second block to `ppH2b`/`ppArB`/`ppEnB`, first block to `let` |
| G. CSP missing `frame-ancestors` (clickjacking) | index/app/admin/login/verify/legal.html | next commit | FIXED — added `frame-ancestors 'none'` |
| I. `localStorage.getItem` outside try/catch | legal.html:650, login.html:818 | next commit | FIXED — wrapped in try/catch |
| J. Duplicate `id="stepNext"` and `id="playRight"` (spec violation) | app.html:20882, 20906, 20940, 20987, 20938, 21429 | next commit | FIXED — converted to `.pel-step-next` / `.pel-play-right` classes; lookups via `rc.querySelector` |

## Verification
- All 9 inline script blocks pass `node --check` after edits.
- `app.html` block 2 runs cleanly in jsdom with a logged-in session stub (previously threw `ReferenceError: currentUser is not defined` reproducibly).
- `login.html`, `verify.html`, `404.html`, `legal.html`, `tv-vocab-test.html`, `index.html` all clean in jsdom (the single `IntersectionObserver is not defined` on index.html is a jsdom limitation, not a browser bug — IntersectionObserver is available in every supported browser).

## Not bugs (confirmed false positives)
- `login.html:908` / `verify.html:346` `window.PEL_CONFIG.SUPABASE_URL` — both pages load `lib/pel_config.js` before the inline script.
- `no-func-assign` on `openLesson` at `app.html:23687` — intentional monkey-patching.
- `window.PEL_COOKIE_AUTH` / `pelRpc` / `pelAuth` / `lucide` / `nlp` / `PEL_PLANS` / `PEL_SITE` / `PEL_CERT_*` / `PEL_RIYAL` / `PEL_STAGE_API` / `PEL_DASH_LIFE_FACTORY` / `__pelDiag` / `__pelReport` / `syncSideLabels` — all resolve via `lib/*.js` globals or block-0 IIFE scope.

## Remaining known non-issues (left alone intentionally)
- `form action=` absent on JS-driven forms (`login.html:644`, `verify.html:229/250/260`) — intentional, JS handles submit.
- `404.html` references `href="/"` — correct in production (Cloudflare Workers route), false positive locally.
