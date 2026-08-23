# PEL Smoke-Test Checklist

Run after every change to the static app.

## Syntax (automated)
- [ ] `node --check` passes on every file in `lib/*.js`, `admin/*.js`, `e2e_sw.js`
- [ ] Inline `<script>` blocks in `app.html`, `index.html`, `login.html`,
      `verify.html`, `legal.html` pass `node --check`

## Static references (automated)
- [ ] No stale root-level `src="cert-qr.js"` / `src="pel-plans.js"` etc.
      (all shared JS lives under `lib/`)
- [ ] No zero-byte files in the repo
- [ ] Every local `src` / `href` target resolves to a real file

## Browser QA (per page)
Load each page from a local server (`python3 -m http.server 8080`) and check the
**Network** tab for 404s and the **Console** for errors:

- [ ] `index.html` — landing renders, "Lesson of the Day" strip populated, no 404s
- [ ] `login.html` — loads, favicon + brand render
- [ ] `app.html` — shell renders, lessons load from Supabase (or fall back), no 404s
- [ ] `verify.html` — loads cert-qr + cert-sheet
- [ ] `admin.html` — admin.css + admin.js load from `admin/`
- [ ] `legal.html` — brand assets load

## Certificate print QA
- [ ] On screen: certificate is dark/elegant (gold on near-black)
- [ ] Print preview (Ctrl+P): certificate is **cream paper + dark text + thin gold
      strokes** — no full-sheet dark background, light on the printer
- [ ] QR + seal + certificate number render correctly in print

## Security
- [ ] No management / service-role tokens anywhere in the repo (grep for the management-token prefix and the service-role key returns nothing)
