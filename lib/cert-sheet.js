/* ============================================================
   cert-sheet.js  -  PEL Certificate of Completion sheet.
   Shared by app.html (student print), admin.js (issue/preview)
   and verify.html (public verification). Provides:
     PEL_CERT_CSS            - CSS string for the sheet + print rules
     PEL_CERT_INJECT_STYLE() - idempotently inject that CSS
     PEL_CERT_SHEET(opts)    - returns the sheet HTML string
     PEL_CERT_FIT(el)        - scales the sheet to fit its container
   opts: { name, academyEn, academyAr, level, programName,
           completedAt, issueDate, certId, code, verifyUrl }
   No payment, no tracking. QR is filled by cert-qr.js; if that
   script is absent the verifyUrl is shown as text instead.

   Design: dark like the site on screen, light + ink-efficient when
   printed. The flip is driven by CSS variables on .cert-sheet that
   are overridden inside @media print, so a single source of truth
   swaps every colour at once. The QR box stays white in both modes
   so it always scans.
   ============================================================ */
(function () {
  var GOLD = '#C8A96A', GOLD_SOFT = '#D8BD83';

  var CSS =
    '.cert-sheet{' +
    '--bg:#0E0E10;--bg2:#17171B;--ink:#F7F4EF;--muted:#9B98A2;--sub:#D0CBC4;' +
    '--surface:#1E1F25;--surface2:#262833;--line:#343744;--gold:' + GOLD + ';--gold-soft:' + GOLD_SOFT + ';' +
    'position:relative;background:' +
    'radial-gradient(900px 420px at 80% -10%, rgba(200,169,106,.10), transparent 60%),' +
    'linear-gradient(160deg,#0E0E10,#17171B);' +
    'color:var(--ink);width:1000px;min-height:1414px;margin:0 auto;padding:74px 86px;' +
    'font-family:"Plus Jakarta Sans","Tajawal",system-ui,sans-serif;' +
    'box-sizing:border-box;overflow:hidden;border:1px solid var(--line);box-shadow:0 40px 120px -30px rgba(0,0,0,.8);}' +
    '.cert-sheet *{box-sizing:border-box;}' +
    '.cert-border{position:absolute;inset:26px;border:2px solid var(--gold);border-radius:4px;pointer-events:none;}' +
    '.cert-border::after{content:"";position:absolute;inset:6px;border:1px solid var(--gold-soft);border-radius:3px;}' +
    '.cert-head{display:flex;align-items:center;justify-content:space-between;gap:24px;}' +
    '.cert-brand{display:flex;align-items:center;gap:12px;}' +
    '.cert-mark{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-soft));' +
    'display:flex;align-items:center;justify-content:center;color:#0E0E10;font-family:"Fraunces",serif;font-weight:700;font-size:1.25rem;}' +
    '.cert-brand b{font-size:1.35rem;letter-spacing:.02em;color:var(--ink);}' +
    '.cert-brand span{display:block;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gold-soft);}' +
    '.cert-seal{width:104px;height:104px;border-radius:50%;border:2px double var(--gold);display:flex;align-items:center;justify-content:center;' +
    'color:var(--gold);flex-direction:column;text-align:center;line-height:1.1;background:rgba(200,169,106,.06);}' +
    '.cert-seal svg{width:34px;height:34px;}' +
    '.cert-seal small{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;margin-top:3px;color:var(--gold-soft);}' +
    '.cert-eyebrow{margin-top:54px;text-align:center;font-size:.8rem;letter-spacing:.34em;text-transform:uppercase;color:var(--gold-soft);}' +
    '.cert-title{margin:14px 0 6px;text-align:center;font-family:"Fraunces",serif;font-weight:600;font-size:3.1rem;line-height:1.05;color:var(--ink);}' +
    '.cert-sub{margin:0 0 54px;text-align:center;font-size:1.05rem;color:var(--sub);}' +
    '.cert-presented{text-align:center;font-size:1rem;color:var(--muted);}' +
    '.cert-name{margin:10px 0 6px;text-align:center;font-family:"Fraunces",serif;font-weight:600;font-size:2.6rem;color:var(--gold-soft);word-break:break-word;}' +
    '.cert-arabic{font-family:"Tajawal","Cairo",sans-serif;direction:rtl;}' +
    '.cert-desc{text-align:center;max-width:680px;margin:0 auto 46px;font-size:1.1rem;line-height:1.7;color:var(--sub);}' +
    '.cert-desc b{color:var(--ink);}' +
    '.cert-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 40px;max-width:720px;margin:0 auto 50px;}' +
    '.cert-cell{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px 18px;}' +
    '.cert-cell label{display:block;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-soft);}' +
    '.cert-cell b{display:block;margin-top:5px;font-size:1.12rem;color:var(--ink);font-weight:600;}' +
    '.cert-foot{position:absolute;left:86px;right:86px;bottom:78px;display:flex;align-items:flex-end;justify-content:space-between;gap:30px;}' +
    '.cert-sign{flex:1;}' +
    '.cert-sign-line{height:0;border-top:1.5px solid var(--gold);margin-bottom:8px;}' +
    '.cert-sign small{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-soft);}' +
    '.cert-qr-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;}' +
    '.cert-qr{width:120px;height:120px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px;' +
    'display:flex;align-items:center;justify-content:center;}' +
    '.cert-qr svg,.cert-qr img{width:100%;height:100%;display:block;}' +
    '.cert-qr-url{font-size:.66rem;color:var(--muted);max-width:150px;text-align:center;word-break:break-all;line-height:1.3;}' +
    '.cert-verify{position:absolute;left:0;right:0;bottom:34px;text-align:center;font-size:.7rem;color:var(--gold-soft);letter-spacing:.04em;}' +
    '@media print{html,body{margin:0;padding:0;background:#fff;}' +
    '@page{size:A4 portrait;margin:0;}' +
    '.cert-sheet{--bg:#FBF8F1;--bg2:#FBF8F1;--ink:#2A2620;--muted:#6E6450;--sub:#5C5343;--surface:#F4EFE2;--surface2:#F4EFE2;--line:#E4DCC9;box-shadow:none;border:1px solid #E4DCC9;background:#FBF8F1;width:210mm;min-height:297mm;padding:18mm 16mm;}' +
    '.cert-border{inset:7mm;}' +
    '.cert-mark,.cert-seal,.cert-cell,.cert-qr{print-color-adjust:exact;-webkit-print-color-adjust:exact;}' +
    '.cert-seal{background:transparent;}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtDate(d) {
    if (!d) return '';
    try {
      var dt = new Date(d);
      if (isNaN(dt)) return String(d);
      return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return String(d); }
  }

  function PEL_CERT_INJECT_STYLE() {
    if (document.getElementById('pel-cert-style')) return;
    var s = document.createElement('style');
    s.id = 'pel-cert-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function PEL_CERT_SHEET(o) {
    o = o || {};
    PEL_CERT_INJECT_STYLE();
    var name = esc(o.name) || 'Student';
    var academyEn = esc(o.academyEn) || 'PEL Academy';
    var academyAr = esc(o.academyAr) || '';
    var level = o.level ? '<div class="cert-cell"><label>Level</label><b>' + esc(o.level) + '</b></div>' : '';
    var program = o.programName ? '<div class="cert-cell"><label>Program</label><b>' + esc(o.programName) + '</b></div>' : '';
    var completed = o.completedAt ? '<div class="cert-cell"><label>Completed</label><b>' + esc(fmtDate(o.completedAt)) + '</b></div>' : '';
    var issued = o.issueDate ? '<div class="cert-cell"><label>Issued</label><b>' + esc(fmtDate(o.issueDate)) + '</b></div>' : '';
    var certId = o.certId ? '<div class="cert-cell"><label>Certificate ID</label><b>' + esc(o.certId) + '</b></div>' : '';
    var cells = [level, program, completed, issued, certId].filter(Boolean).join('');
    if (cells) cells = '<div class="cert-grid">' + cells + '</div>';

    var qrBlock = '';
    if (o.verifyUrl) {
      qrBlock = '<div class="cert-qr-wrap">' +
        '<div class="cert-qr" data-url="' + esc(o.verifyUrl) + '"></div>' +
        '<span class="cert-qr-url">Scan to verify · ' + esc(o.code || o.verifyUrl) + '</span>' +
        '</div>';
    }

    return '<div class="cert-sheet" role="img" aria-label="PEL certificate of completion for ' + name + '">' +
      '<div class="cert-border"></div>' +
      '<div class="cert-head">' +
        '<div class="cert-brand"><div class="cert-mark">P</div><div><b>PEL</b><span>Personalized English Lessons</span></div></div>' +
        '<div class="cert-seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="6"/><path d="M9 13l-2 8 5-3 5 3-2-8"/></svg><small>Verified</small></div>' +
      '</div>' +
      '<div class="cert-eyebrow">Certificate of Completion</div>' +
      '<h1 class="cert-title">شهادة اتمام</h1>' +
      '<p class="cert-sub">This certifies that</p>' +
      '<div class="cert-presented">This certificate is proudly presented to</div>' +
      '<div class="cert-name">' + name + '</div>' +
      (academyAr ? '<div class="cert-arabic" style="text-align:center;font-size:1.15rem;color:var(--sub);margin-bottom:10px;">' + academyAr + '</div>' : '') +
      '<p class="cert-desc">has successfully completed the <b>' + academyEn + '</b> curriculum' + (o.level ? ' at ' + esc(o.level) + ' level' : '') +
      ' at Personalized English Lessons, demonstrating commitment and measurable progress in American English.</p>' +
      cells +
      '<div class="cert-foot">' +
        '<div class="cert-sign"><div class="cert-sign-line"></div><small>PEL Academy</small></div>' +
        qrBlock +
      '</div>' +
      '<div class="cert-verify">Verify at personalizedenglishlessons.github.io/tutorfiraspel/verify.html</div>' +
      '</div>';
  }

  function PEL_CERT_FIT(el) {
    if (!el) return;
    var sheet = el.querySelector('.cert-sheet');
    if (!sheet) return;
    var maxW = (el.clientWidth || 1000) - 2;
    var w = sheet.offsetWidth || 1000;
    var scale = Math.min(1, maxW / w);
    sheet.style.transformOrigin = 'top center';
    sheet.style.transform = 'scale(' + scale + ')';
    sheet.style.marginBottom = (-(sheet.offsetHeight * (1 - scale))) + 'px';
  }

  window.PEL_CERT_CSS = CSS;
  window.PEL_CERT_INJECT_STYLE = PEL_CERT_INJECT_STYLE;
  window.PEL_CERT_SHEET = PEL_CERT_SHEET;
  window.PEL_CERT_FIT = PEL_CERT_FIT;
})();
