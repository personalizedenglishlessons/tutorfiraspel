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
   ============================================================ */
(function () {
  var GOLD = '#C8A96A', GOLD_SOFT = '#D8BD83', INK = '#2A2620', CREAM = '#FBF8F1';

  var CSS =
    '.cert-sheet{position:relative;background:' + CREAM + ';color:' + INK + ';' +
    'width:1000px;min-height:1414px;margin:0 auto;padding:74px 86px;' +
    'font-family:"Plus Jakarta Sans","Tajawal",system-ui,sans-serif;' +
    'box-sizing:border-box;overflow:hidden;border:1px solid #E4DCC9;}' +
    '.cert-sheet *{box-sizing:border-box;}' +
    '.cert-border{position:absolute;inset:26px;border:2px solid ' + GOLD + ';border-radius:4px;pointer-events:none;}' +
    '.cert-border::after{content:"";position:absolute;inset:6px;border:1px solid ' + GOLD_SOFT + ';border-radius:3px;}' +
    '.cert-head{display:flex;align-items:center;justify-content:space-between;gap:24px;}' +
    '.cert-brand{display:flex;align-items:center;gap:12px;}' +
    '.cert-mark{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,' + GOLD + ',' + GOLD_SOFT + ');' +
    'display:flex;align-items:center;justify-content:center;color:' + CREAM + ';font-family:"Fraunces",serif;font-weight:700;font-size:1.25rem;}' +
    '.cert-brand b{font-size:1.35rem;letter-spacing:.02em;}' +
    '.cert-brand span{display:block;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:#8A7A4A;}' +
    '.cert-seal{width:104px;height:104px;border-radius:50%;border:2px double ' + GOLD + ';display:flex;align-items:center;justify-content:center;' +
    'color:' + GOLD + ';flex-direction:column;text-align:center;line-height:1.1;}' +
    '.cert-seal svg{width:34px;height:34px;}' +
    '.cert-seal small{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;margin-top:3px;}' +
    '.cert-eyebrow{margin-top:54px;text-align:center;font-size:.8rem;letter-spacing:.34em;text-transform:uppercase;color:#9A8A52;}' +
    '.cert-title{margin:14px 0 6px;text-align:center;font-family:"Fraunces",serif;font-weight:600;font-size:3.1rem;line-height:1.05;color:' + INK + ';}' +
    '.cert-sub{margin:0 0 54px;text-align:center;font-size:1.05rem;color:#6E6450;}' +
    '.cert-presented{text-align:center;font-size:1rem;color:#7A6F55;}' +
    '.cert-name{margin:10px 0 6px;text-align:center;font-family:"Fraunces",serif;font-weight:600;font-size:2.6rem;color:' + INK + ';word-break:break-word;}' +
    '.cert-arabic{font-family:"Tajawal","Cairo",sans-serif;direction:rtl;}' +
    '.cert-desc{text-align:center;max-width:680px;margin:0 auto 46px;font-size:1.1rem;line-height:1.7;color:#5C5343;}' +
    '.cert-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 40px;max-width:720px;margin:0 auto 50px;}' +
    '.cert-cell{background:#F4EFE2;border:1px solid #E7DECA;border-radius:10px;padding:14px 18px;}' +
    '.cert-cell label{display:block;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:#9A8A52;}' +
    '.cert-cell b{display:block;margin-top:5px;font-size:1.12rem;color:' + INK + ';font-weight:600;}' +
    '.cert-foot{position:absolute;left:86px;right:86px;bottom:78px;display:flex;align-items:flex-end;justify-content:space-between;gap:30px;}' +
    '.cert-sign{flex:1;}' +
    '.cert-sign-line{height:0;border-top:1.5px solid #B9A86A;margin-bottom:8px;}' +
    '.cert-sign small{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:#9A8A52;}' +
    '.cert-qr-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;}' +
    '.cert-qr{width:120px;height:120px;background:#fff;border:1px solid #E0D7C2;border-radius:8px;padding:6px;' +
    'display:flex;align-items:center;justify-content:center;}' +
    '.cert-qr svg,.cert-qr img{width:100%;height:100%;display:block;}' +
    '.cert-qr-url{font-size:.66rem;color:#8A7A4A;max-width:150px;text-align:center;word-break:break-all;line-height:1.3;}' +
    '.cert-verify{position:absolute;left:0;right:0;bottom:34px;text-align:center;font-size:.7rem;color:#9A8A52;letter-spacing:.04em;}' +
    '@media print{html,body{margin:0;padding:0;background:#fff;}' +
    '@page{size:A4 portrait;margin:0;}' +
    '.cert-sheet{box-shadow:none;border:none;width:210mm;min-height:297mm;padding:18mm 16mm;}' +
    '.cert-border{inset:7mm;}}';

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
    // fill the 2-col grid to an even count so layout is balanced
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
      (academyAr ? '<div class="cert-arabic" style="text-align:center;font-size:1.15rem;color:#6E6450;margin-bottom:10px;">' + academyAr + '</div>' : '') +
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
