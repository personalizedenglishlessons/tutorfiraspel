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

   Design: dark + gold like the site on screen, light + ink-efficient
   when printed. The flip is driven by CSS variables on .cert-sheet
   overridden inside @media print, so a single source of truth swaps
   every colour at once. All Arabic text uses the Tajawal/Cairo web
   font (never the Latin Fraunces serif, which has no Arabic glyphs and
   rendered as broken disconnected letters). The QR box stays white in
   both modes so it always scans.
   ============================================================ */
(function () {
  var GOLD = '#C8A96A', GOLD_SOFT = '#D8BD83';

  var CSS =
    '.cert-sheet{' +
    '--bg:#0E0E10;--bg2:#17171B;--ink:#F7F4EF;--muted:#9B98A2;--sub:#D0CBC4;' +
    '--surface:#1E1F25;--line:#343744;--gold:' + GOLD + ';--gold-soft:' + GOLD_SOFT + ';' +
    '--wm:.035;--wm-ink:#FFFFFF;' +
    'position:relative;background:' +
    'radial-gradient(900px 420px at 80% -10%, rgba(200,169,106,.10), transparent 60%),' +
    'linear-gradient(160deg,#0E0E10,#17171B);' +
    'color:var(--ink);width:1000px;min-height:1414px;margin:0 auto;padding:74px 86px;' +
    'font-family:"Plus Jakarta Sans",system-ui,sans-serif;' +
    'box-sizing:border-box;overflow:hidden;border:1px solid var(--line);box-shadow:0 40px 120px -30px rgba(0,0,0,.8);}' +
    '.cert-sheet *{box-sizing:border-box;}' +
    // large faint PEL watermark behind everything
    '.cert-sheet::before{content:"PEL";position:absolute;left:0;right:0;top:46%;transform:translateY(-50%);' +
    'text-align:center;font-family:"Fraunces",serif;font-weight:700;font-size:520px;line-height:1;' +
    'color:var(--wm-ink);opacity:var(--wm);pointer-events:none;z-index:0;letter-spacing:-.04em;}' +
    '.cert-inner{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;}' +
    // double gold border + corner ornaments (notched frame look)
    '.cert-border{position:absolute;inset:26px;border:2px solid var(--gold);border-radius:3px;pointer-events:none;z-index:2;}' +
    '.cert-border::after{content:"";position:absolute;inset:6px;border:1px solid var(--gold-soft);border-radius:2px;opacity:.6;}' +
    '.cert-corner{position:absolute;width:16px;height:16px;border:2px solid var(--gold);z-index:3;}' +
    '.cert-corner.tl{left:18px;top:18px;border-right:none;border-bottom:none;}' +
    '.cert-corner.tr{right:18px;top:18px;border-left:none;border-bottom:none;}' +
    '.cert-corner.bl{left:18px;bottom:18px;border-right:none;border-top:none;}' +
    '.cert-corner.br{right:18px;bottom:18px;border-left:none;border-top:none;}' +
    // header brand
    '.cert-head{text-align:center;padding-top:6px;}' +
    '.cert-mark{font-family:"Fraunces",serif;font-weight:700;font-size:2.6rem;letter-spacing:.14em;color:var(--gold);line-height:1;}' +
    '.cert-brand-sub{margin-top:8px;font-size:.66rem;letter-spacing:.3em;text-transform:uppercase;color:var(--gold-soft);font-weight:600;}' +
    '.cert-brand-sub.ar{font-size:.8rem;letter-spacing:0;margin-top:3px;}' +
    // title
    '.cert-title{margin:30px 0 0;text-align:center;font-family:"Fraunces",serif;font-weight:600;font-size:2.9rem;line-height:1.05;color:var(--ink);}' +
    '.cert-title-ar{margin-top:6px;text-align:center;font-size:1.5rem;color:var(--gold-soft);}' +
    // diamond divider
    '.cert-div{display:flex;align-items:center;justify-content:center;gap:14px;margin:20px 0 30px;}' +
    '.cert-div::before,.cert-div::after{content:"";height:1px;width:120px;background:linear-gradient(90deg,transparent,var(--gold));}' +
    '.cert-div::after{background:linear-gradient(90deg,var(--gold),transparent);}' +
    '.cert-diamond{width:9px;height:9px;background:var(--gold);transform:rotate(45deg);}' +
    // recipient
    '.cert-certifies{text-align:center;font-size:.95rem;color:var(--muted);}' +
    '.cert-certifies-ar{text-align:center;font-size:.9rem;color:var(--muted);margin-top:2px;}' +
    '.cert-recipient{margin:16px auto 4px;text-align:center;font-family:"Fraunces",serif;font-weight:600;font-size:2.5rem;color:var(--ink);max-width:760px;word-break:break-word;line-height:1.15;}' +
    '.cert-recipient-rule{width:280px;max-width:62%;height:2px;margin:6px auto 0;background:var(--gold);box-shadow:0 0 14px -1px var(--gold);}' +
    // achievement
    '.cert-ach{text-align:center;max-width:680px;margin:6px auto 0;font-size:1.05rem;line-height:1.6;color:var(--sub);}' +
    '.cert-ach b{color:var(--gold-soft);font-weight:600;}' +
    '.cert-ach-ar{text-align:center;max-width:680px;margin:6px auto 0;font-size:.98rem;line-height:1.7;color:var(--sub);}' +
    // 3-column metadata
    '.cert-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:0;max-width:680px;margin:44px auto 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:18px 0;}' +
    '.cert-meta .cell{text-align:center;padding:0 8px;position:relative;}' +
    '.cert-meta .cell+.cell::before{content:"";position:absolute;left:0;top:14%;bottom:14%;width:1px;background:var(--line);}' +
    '.cert-meta .ar-lbl{font-size:.78rem;color:var(--muted);direction:rtl;}' +
    '.cert-meta .en-lbl{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-soft);margin-top:3px;}' +
    '.cert-meta .val{margin-top:7px;font-size:1.1rem;font-weight:600;color:var(--ink);}' +
    // footer row
    '.cert-foot{margin-top:auto;padding-top:30px;display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:20px;}' +
    '.cert-iss{padding-right:10px;border-right:0;text-align:center;}' +
    '.cert-iss .role{font-family:"Fraunces",serif;font-style:italic;font-size:1.15rem;color:var(--ink);}' +
    '.cert-iss .role-ar{font-size:.82rem;color:var(--muted);margin-top:1px;}' +
    '.cert-iss .meta-id{font-size:.66rem;letter-spacing:.1em;color:var(--gold-soft);margin-top:8px;text-transform:uppercase;}' +
    '.cert-iss .rule{height:1px;width:70%;margin:9px auto 0;background:var(--gold);opacity:.7;}' +
    '.cert-seal-wrap{display:flex;justify-content:center;}' +
    '.cert-seal{width:128px;height:128px;}' +
    '.cert-seal svg{width:100%;height:100%;display:block;}' +
    '.cert-sign{padding-left:10px;text-align:center;}' +
    '.cert-sign .role{font-family:"Fraunces",serif;font-style:italic;font-size:1.15rem;color:var(--ink);}' +
    '.cert-sign .role-ar{font-size:.82rem;color:var(--muted);margin-top:1px;}' +
    '.cert-sign .rule{height:1px;width:70%;margin:9px auto 0;background:var(--gold);opacity:.7;}' +
    '.cert-qr-wrap{margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:6px;}' +
    '.cert-qr{width:96px;height:96px;background:#fff;border:1px solid var(--line);border-radius:6px;padding:5px;' +
    'display:flex;align-items:center;justify-content:center;}' +
    '.cert-qr svg,.cert-qr img{width:100%;height:100%;display:block;}' +
    '.cert-scan{font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-soft);font-weight:600;}' +
    '.cert-scan-ar{font-size:.72rem;color:var(--muted);}' +
    '.cert-qr-url{font-size:.6rem;color:var(--muted);max-width:150px;text-align:center;word-break:break-all;line-height:1.3;}' +
    '.cert-verify-line{margin-top:22px;text-align:center;font-size:.66rem;color:var(--gold-soft);letter-spacing:.04em;}' +
    // Arabic font applied to every Arabic span
    '.cert-ar{font-family:"Tajawal","Cairo","Segoe UI","Tahoma",sans-serif;direction:rtl;unicode-bidi:isolate;line-height:1.7;letter-spacing:0;}' +
    '@media print{html,body{margin:0;padding:0;background:#fff;}' +
    '@page{size:A4 portrait;margin:0;}' +
    '.cert-sheet{--bg:#FBF8F1;--bg2:#FBF8F1;--ink:#241F18;--muted:#6E6450;--sub:#5C5343;--surface:#F4EFE2;--line:#E0D7C2;' +
    '--wm:.05;--wm-ink:#000;box-shadow:none;border:1px solid #E0D7C2;background:#FBF8F1;' +
    'width:210mm;min-height:297mm;padding:16mm 15mm;}' +
    '.cert-sheet::before{color:var(--wm-ink);opacity:var(--wm);font-size:430px;}' +
    '.cert-border{inset:6mm;}' +
    '.cert-corner{inset:auto;}' +
    '.cert-corner.tl{left:4mm;top:4mm;}.cert-corner.tr{right:4mm;top:4mm;}' +
    '.cert-corner.bl{left:4mm;bottom:4mm;}.cert-corner.br{right:4mm;bottom:4mm;}' +
    '.cert-mark,.cert-title,.cert-recipient,.cert-iss .role,.cert-sign .role{print-color-adjust:exact;-webkit-print-color-adjust:exact;}' +
    '.cert-seal,.cert-qr{print-color-adjust:exact;-webkit-print-color-adjust:exact;}' +
    '.cert-qr{background:#fff;}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>\"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ar(text) { return '<span class="cert-ar">' + esc(text) + '</span>'; }
  function parseDate(d) {
    // Date-only "YYYY-MM-DD" strings are parsed as UTC by the spec, which
    // shifts the displayed day back by one in negative-UTC timezones. Parse
    // them as local so the printed date matches the issued date.
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      var p = d.split('-');
      return new Date(+p[0], +p[1] - 1, +p[2]);
    }
    return new Date(d);
  }
  function fmtDate(d) {
    if (!d) return '—';
    try {
      var dt = parseDate(d);
      if (isNaN(dt)) return String(d);
      return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return String(d); }
  }
  function fmtShort(d) {
    if (!d) return '—';
    try { var dt = parseDate(d); if (isNaN(dt)) return String(d); return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(); } catch (e) { return String(d); }
  }

  // Circular gold seal with curved text (SVG textPath). Static except the
  // issued date which is passed in.
  function sealSVG(issuedShort, certId) {
    var id = certId ? String(certId).replace(/[^A-Z0-9\-]/gi, '').slice(0, 24) : '';
    return '<svg viewBox="0 0 128 128" role="img" aria-label="Official PEL seal">' +
      '<defs>' +
      '<path id="pel-seal-top" d="M 64,64 m -50,0 a 50,50 0 1 1 100,0" fill="none"/>' +
      '<path id="pel-seal-bot" d="M 64,64 m -46,0 a 46,46 0 1 0 92,0" fill="none"/>' +
      '</defs>' +
      '<circle cx="64" cy="64" r="60" fill="none" stroke="var(--gold)" stroke-width="1.5"/>' +
      '<circle cx="64" cy="64" r="55" fill="none" stroke="var(--gold-soft)" stroke-width="0.6" opacity=".7"/>' +
      '<circle cx="64" cy="64" r="44" fill="none" stroke="var(--gold)" stroke-width="0.8"/>' +
      '<text font-family="Plus Jakarta Sans,sans-serif" font-size="7.2" letter-spacing="2.4" fill="var(--gold)">' +
      '<textPath href="#pel-seal-top" startOffset="3%">PERSONALIZED ENGLISH LESSONS</textPath></text>' +
      '<text font-family="Plus Jakarta Sans,sans-serif" font-size="6.4" letter-spacing="2" fill="var(--gold-soft)">' +
      '<textPath href="#pel-seal-bot" startOffset="6%">CERTIFICATE OF COMPLETION</textPath></text>' +
      '<text x="64" y="56" text-anchor="middle" font-family="Fraunces,serif" font-size="20" font-weight="700" fill="var(--gold)">PEL</text>' +
      '<text x="64" y="70" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="5.2" letter-spacing="1.2" fill="var(--gold-soft)">ISSUED ' + esc(issuedShort) + '</text>' +
      '<text x="64" y="80" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="4.6" letter-spacing="0.5" fill="var(--muted)">' + esc(id) + '</text>' +
      '<circle cx="64" cy="64" r="62" fill="none" stroke="var(--gold-soft)" stroke-width="0.5" opacity=".4"/>' +
      '</svg>';
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
    var academyAr = o.academyAr ? ar(o.academyAr) : '';
    var level = o.level ? esc(o.level) : '';
    var program = o.programName ? esc(o.programName) : 'PEL Program';
    var completed = fmtDate(o.completedAt);
    var issued = fmtDate(o.issueDate || o.completedAt);
    var issuedShort = fmtShort(o.issueDate || o.completedAt);
    var certId = o.certId ? esc(o.certId) : '';
    var code = o.code ? esc(o.code) : '';

    var achEn = 'has successfully completed the <b>' + academyEn + '</b> curriculum' + (level ? ' at <b>' + level + '</b> level' : '') + ' at Personalized English Lessons.';
    var achAr = 'قد أتم بنجاح منهج ' + (o.academyAr ? o.academyAr : academyEn) + (level ? ' على مستوى ' + level : '') + ' لدروس الإنجليزي المخصصة.';

    var qrBlock = '';
    if (o.verifyUrl) {
      qrBlock = '<div class="cert-qr-wrap">' +
        '<div class="cert-qr" data-url="' + esc(o.verifyUrl) + '"></div>' +
        '<span class="cert-scan">Scan to verify</span>' +
        '<span class="cert-scan-ar cert-ar">امسح للتحقق</span>' +
        '</div>';
    } else if (o.code) {
      qrBlock = '<div class="cert-qr-url">Code: ' + code + '</div>';
    }

    return '<div class="cert-sheet" role="img" aria-label="PEL certificate of completion for ' + name + '">' +
      '<div class="cert-border"></div>' +
      '<span class="cert-corner tl"></span><span class="cert-corner tr"></span>' +
      '<span class="cert-corner bl"></span><span class="cert-corner br"></span>' +
      '<div class="cert-inner">' +
        // header
        '<div class="cert-head">' +
          '<div class="cert-mark">PEL</div>' +
          '<div class="cert-brand-sub">Personalized English Lessons</div>' +
          '<div class="cert-brand-sub ar cert-ar">دروس الإنجليزي المخصصة</div>' +
        '</div>' +
        // title
        '<h1 class="cert-title">Certificate of Completion</h1>' +
        '<div class="cert-title-ar cert-ar">شهادة إتمام</div>' +
        '<div class="cert-div"><span class="cert-diamond"></span></div>' +
        // recipient
        '<div class="cert-certifies">This certificate is proudly presented to</div>' +
        '<div class="cert-certifies-ar cert-ar">يُمنح هذا المستند بكل فخر إلى</div>' +
        '<div class="cert-recipient">' + name + '</div>' +
        '<div class="cert-recipient-rule"></div>' +
        // achievement
        '<p class="cert-ach">' + achEn + '</p>' +
        '<p class="cert-ach-ar cert-ar">' + esc(achAr) + '</p>' +
        // 3-column metadata
        '<div class="cert-meta">' +
          metaCell('تاريخ الإتمام', 'Completion Date', completed) +
          metaCell('تاريخ الإصدار', 'Issue Date', issued) +
          metaCell('البرنامج', 'Program', program + (level ? ' · ' + level : '')) +
        '</div>' +
        // footer
        '<div class="cert-foot">' +
          '<div class="cert-iss">' +
            '<div class="role">PEL Academy</div>' +
            '<div class="role-ar cert-ar">أكاديمية PEL</div>' +
            '<div class="rule"></div>' +
            '<div class="meta-id">Certificate No. ' + (certId || '—') + '</div>' +
          '</div>' +
          '<div class="cert-seal-wrap"><div class="cert-seal">' + sealSVG(issuedShort, certId) + '</div></div>' +
          '<div class="cert-sign">' +
            '<div class="role">Program Director</div>' +
            '<div class="role-ar cert-ar">مدير البرنامج</div>' +
            '<div class="rule"></div>' +
            qrBlock +
          '</div>' +
        '</div>' +
        '<div class="cert-verify-line">Verify at personalizedenglishlessons.github.io/tutorfiraspel/verify.html' + (code ? ' · Code ' + code : '') + '</div>' +
      '</div>' +
      '</div>';
  }

  function metaCell(arLabel, enLabel, val) {
    return '<div class="cell"><div class="ar-lbl cert-ar">' + esc(arLabel) + '</div>' +
      '<div class="en-lbl">' + esc(enLabel) + '</div>' +
      '<div class="val">' + esc(val) + '</div></div>';
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
