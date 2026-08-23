/* ============================================================================
   PEL CERTIFICATE SHEET - the ONE certificate renderer.
   Used by app.html (student certificates) and admin.js (issue + print), so the
   design, seal, QR and number logic live in a single place and stay identical.
   ============================================================================ */

var PEL_CERT_CSS = [
  '#certPrintRoot{ display:none; }',
  '@page{ size:A4 landscape; margin:0; }',
  '@media print{',
  '  body[data-printing] #appShell,',
  '  body[data-printing] #authGate,',
  '  body[data-printing] #toastStack,',
  '  body[data-printing] #sidebarOverlay,',
  '  body[data-printing] #qtPopup,',
  '  body[data-printing] #qtFab,',
  '  body[data-printing] #paletteOverlay{ display:none !important; }',
  '  body[data-printing] #certPrintRoot{ display:block !important; }',
  '}',
  '.cert-sheet{',
  '  width:297mm; height:210mm; margin:0 auto; position:relative; overflow:hidden;',
  '  background:',
  '    radial-gradient(55% 40% at 50% -6%, rgba(200,169,106,.16), transparent 70%),',
  '    radial-gradient(42% 32% at 0% 108%, rgba(63,140,114,.10), transparent 70%),',
  '    radial-gradient(38% 28% at 100% 104%, rgba(168,131,69,.10), transparent 70%),',
  '    linear-gradient(160deg,#121216 0%,#0E0E10 55%,#101014 100%);',
  '  color:#F7F4EF; box-sizing:border-box;',
  '  font-family:"Plus Jakarta Sans",-apple-system,sans-serif;',
  '  -webkit-print-color-adjust:exact; print-color-adjust:exact;',
  '}',
  '.cert-sheet *{ box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }',
  '/* layered document border: outer line, fine inner hairline, corner marks */',
  '.cert-sheet .cs-border-outer{ position:absolute; inset:7mm; border:0.9mm solid rgba(200,169,106,.9); }',
  '.cert-sheet .cs-border-inner{ position:absolute; inset:10.5mm; border:0.28mm solid rgba(200,169,106,.45); }',
  '.cert-sheet .cs-corner{ position:absolute; width:14mm; height:14mm; border:0.5mm solid #C8A96A; }',
  '.cert-sheet .cs-c-tl{ top:7mm; left:7mm; border-right:none; border-bottom:none; }',
  '.cert-sheet .cs-c-tr{ top:7mm; right:7mm; border-left:none; border-bottom:none; }',
  '.cert-sheet .cs-c-bl{ bottom:7mm; left:7mm; border-right:none; border-top:none; }',
  '.cert-sheet .cs-c-br{ bottom:7mm; right:7mm; border-left:none; border-top:none; }',
  '/* subtle PEL watermark */',
  '.cert-sheet .cs-watermark{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:.045; pointer-events:none; }',
  '.cert-sheet .cs-watermark .pel-logo{ width:190mm; height:auto; }',
  '/* content column */',
  '.cert-sheet .cs-page{ position:absolute; inset:0; padding:17mm 24mm 50mm; display:flex; flex-direction:column; justify-content:space-between; align-items:center; }',
  '/* header: logo + school identity */',
  '.cert-sheet .cs-head{ text-align:center; }',
  '.cert-sheet .cs-logo{ height:11mm; width:auto; }',
  '.cert-sheet .cs-school{ margin-top:4.5mm; font-size:9pt; letter-spacing:.36em; text-transform:uppercase; color:#C8A96A; font-weight:600; text-indent:.36em; }',
  '.cert-sheet .cs-school-ar{ font-family:"Tajawal","Cairo","Segoe UI",Tahoma,sans-serif; font-size:8pt; letter-spacing:.05em; color:#A88345; margin-top:1.2mm; direction:rtl; }',
  '/* main body */',
  '.cert-sheet .cs-main{ text-align:center; }',
  '.cert-sheet .cs-rule{ display:flex; align-items:center; gap:5mm; width:64mm; margin:5mm auto; }',
  '.cert-sheet .cs-rule::before, .cert-sheet .cs-rule::after{ content:""; flex:1; height:.32mm; background:linear-gradient(90deg,transparent,rgba(200,169,106,.7),transparent); }',
  '.cert-sheet .cs-rule .cs-diamond{ width:2.4mm; height:2.4mm; transform:rotate(45deg); border:0.35mm solid #C8A96A; }',
  '.cert-sheet .cs-title{ font-family:"Fraunces",serif; font-size:23pt; font-weight:500; color:#F1E8D6; letter-spacing:.04em; }',
  '.cert-sheet .cs-title-ar{ font-family:"Tajawal","Cairo","Segoe UI",Tahoma,sans-serif; font-size:12pt; color:#D8BD83; margin-top:1.2mm; direction:rtl; }',
  '.cert-sheet .cs-certifies{ font-size:9.5pt; color:#9B98A2; margin-top:4mm; letter-spacing:.03em; }',
  '.cert-sheet .cs-certifies-ar{ font-family:"Tajawal","Cairo","Segoe UI",Tahoma,sans-serif; font-size:7.5pt; color:#6E6B74; margin-top:.8mm; direction:rtl; }',
  '.cert-sheet .cs-name{ font-family:"Fraunces",serif; font-size:30pt; font-weight:600; color:#E8D5A8; margin-top:3.5mm; line-height:1.12; max-width:200mm; white-space:nowrap; }',
  '.cert-sheet .cs-name-rule{ width:66mm; height:.4mm; margin:3mm auto 0; background:linear-gradient(90deg,transparent,rgba(200,169,106,.85),transparent); }',
  '.cert-sheet .cs-completed{ font-size:9.5pt; color:#9B98A2; margin-top:3.2mm; }',
  '.cert-sheet .cs-completed-ar{ font-family:"Tajawal","Cairo","Segoe UI",Tahoma,sans-serif; font-size:7.5pt; color:#6E6B74; margin-top:.8mm; direction:rtl; }',
  '.cert-sheet .cs-academy{ font-family:"Fraunces",serif; font-size:15pt; font-weight:600; color:#D8BD83; margin-top:2.5mm; max-width:210mm; }',
  '.cert-sheet .cs-academy-ar{ font-family:"Tajawal","Cairo","Segoe UI",Tahoma,sans-serif; font-size:9.5pt; color:#A88345; margin-top:.8mm; direction:rtl; }',
  '.cert-sheet .cs-level{ font-size:8.5pt; letter-spacing:.14em; text-transform:uppercase; color:#8A8578; margin-top:2.2mm; }',
  '/* meta: completion / issue / program */',
  '.cert-sheet .cs-meta{ display:flex; justify-content:center; gap:16mm; margin-top:5mm; }',
  '.cert-sheet .cs-meta > div{ text-align:center; min-width:42mm; }',
  '.cert-sheet .cs-meta .cs-m-ar{ font-family:"Tajawal","Cairo","Segoe UI",Tahoma,sans-serif; font-size:6.5pt; color:#8A8578; direction:rtl; letter-spacing:.02em; }',
  '.cert-sheet .cs-meta .cs-m-lab{ font-size:6.5pt; text-transform:uppercase; letter-spacing:.14em; color:#8A8578; margin-top:1mm; }',
  '.cert-sheet .cs-meta b{ display:block; font-weight:700; color:#E8D5A8; margin-top:1.3mm; font-size:10pt; font-family:"Fraunces",serif; letter-spacing:.02em; }',
  '/* bottom: the seal sits alone, centered in its own band above the footer */',
  '.cert-sheet .cs-bottom{ width:100%; height:54mm; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; }',
  '.cert-sheet .cs-sign{ text-align:center; width:58mm; }',
  '.cert-sheet .cs-sign .cs-sign-name{ font-family:"Fraunces",serif; font-style:italic; font-size:12pt; color:#D8BD83; }',
  '.cert-sheet .cs-sign .cs-sign-line{ width:50mm; height:.35mm; background:linear-gradient(90deg,transparent,rgba(200,169,106,.85),transparent); margin:2.5mm auto 1.6mm; }',
  '.cert-sheet .cs-sign .cs-sign-cap{ font-size:7pt; text-transform:uppercase; letter-spacing:.13em; color:#8A8578; }',
  '.cert-sheet .cs-sign .cs-sign-cap .cs-cap-ar{ font-family:"Tajawal","Cairo",sans-serif; direction:rtl; font-size:6.5pt; letter-spacing:.02em; }',
  '/* PEL rosette seal */',
  '.cert-sheet .cs-seal{ width:52mm; height:52mm; }',
  '.cert-sheet .cs-seal svg{ width:100%; height:100%; display:block; }',
  '/* QR verification chip */',
  '.cert-sheet .cs-qr{ display:flex; align-items:center; gap:3mm; }',
  '.cert-sheet .cs-qr svg{ width:15mm; height:15mm; display:block; }',
  '.cert-sheet .cs-qr-cap{ font-size:6pt; letter-spacing:.12em; text-transform:uppercase; color:#8A8578; line-height:1.5; text-align:left; }',
  '.cert-sheet .cs-qr-cap .cs-qr-ar{ font-family:"Tajawal","Cairo",sans-serif; direction:rtl; font-size:6pt; letter-spacing:.02em; display:block; }',
  '/* footer strip: three stacked columns - left: PEL Academy + Certificate No., center: Issued, right: Program Director + QR */',
  '.cert-sheet .cs-footer{ position:absolute; left:24mm; right:24mm; bottom:12mm; display:flex; align-items:flex-start; justify-content:space-between; gap:8mm; border-top:0.25mm solid rgba(200,169,106,.35); padding-top:3mm; }',
  '.cert-sheet .cs-fcol{ flex:1; display:flex; flex-direction:column; align-items:center; gap:2.5mm; }',
  '.cert-sheet .cs-fno{ font-size:7.5pt; color:#9B98A2; letter-spacing:.06em; text-align:center; }',
  '.cert-sheet .cs-fno b{ font-family:"Fraunces",serif; color:#C8A96A; letter-spacing:.1em; }',
  '.cert-sheet .cs-fno .cs-fno-ar{ font-family:"Tajawal","Cairo",sans-serif; direction:rtl; font-size:6.5pt; color:#8A8578; letter-spacing:.02em; display:block; }',
  '.cert-sheet .cs-fiss{ font-size:7pt; color:#8A8578; letter-spacing:.06em; text-transform:uppercase; text-align:center; }',
  '.cert-sheet .cs-fiss .cs-fiss-ar{ font-family:"Tajawal","Cairo",sans-serif; direction:rtl; font-size:6.5pt; letter-spacing:.02em; }',
  '  /* PRINT MODE - light, ink-efficient certificate for paper. On-screen stays dark/elegant; when printing we swap to cream paper + dark text + thin gold strokes and use print-color-adjust:economy so no full-sheet dark ink. */',
  '@media print{',
  '  html,body{ background:#FFFCF6 !important; }',
  '  .cert-sheet{',
  '    background:#FFFCF6 !important;',
  '    color:#23232A !important;',
  '    -webkit-print-color-adjust:economy !important; print-color-adjust:economy !important;',
  '  }',
  '  .cert-sheet *{ -webkit-print-color-adjust:economy !important; print-color-adjust:economy !important; }',
  '  /* drop the faint watermark so we do not print a full-bleed logo */',
  '  .cert-sheet .cs-watermark{ display:none !important; }',
  '  /* borders + corner marks stay gold but slightly deeper for paper */',
  '  .cert-sheet .cs-border-outer{ border-color:#9A7B2E !important; }',
  '  .cert-sheet .cs-border-inner{ border-color:rgba(154,123,46,.55) !important; }',
  '  .cert-sheet .cs-corner{ border-color:#9A7B2E !important; }',
  '  .cert-sheet .cs-rule::before,.cert-sheet .cs-rule::after{ background:linear-gradient(90deg,transparent,rgba(154,123,46,.7),transparent) !important; }',
  '  .cert-sheet .cs-rule .cs-diamond{ border-color:#9A7B2E !important; }',
  '  .cert-sheet .cs-name-rule{ background:linear-gradient(90deg,transparent,rgba(154,123,46,.85),transparent) !important; }',
  '  .cert-sheet .cs-sign-line{ background:linear-gradient(90deg,transparent,rgba(154,123,46,.85),transparent) !important; }',
  '  /* text: dark charcoal for body, deep gold for accents */',
  '  .cert-sheet .cs-school{ color:#9A7B2E !important; }',
  '  .cert-sheet .cs-school-ar{ color:#8A6D2F !important; }',
  '  .cert-sheet .cs-title{ color:#23232A !important; }',
  '  .cert-sheet .cs-title-ar{ color:#9A7B2E !important; }',
  '  .cert-sheet .cs-certifies{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-certifies-ar{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-name{ color:#1A1A1F !important; }',
  '  .cert-sheet .cs-completed{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-completed-ar{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-academy{ color:#8A6D2F !important; }',
  '  .cert-sheet .cs-academy-ar{ color:#8A6D2F !important; }',
  '  .cert-sheet .cs-level{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-meta .cs-m-ar{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-meta .cs-m-lab{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-meta b{ color:#1A1A1F !important; }',
  '  .cert-sheet .cs-sign .cs-sign-name{ color:#8A6D2F !important; }',
  '  .cert-sheet .cs-sign .cs-sign-cap{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-fno{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-fno b{ color:#9A7B2E !important; }',
  '  .cert-sheet .cs-fno .cs-fno-ar{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-fiss{ color:#6B6862 !important; }',
  '  .cert-sheet .cs-footer{ border-top-color:rgba(154,123,46,.4) !important; }',
  '  /* seal: deepen the lightest gold fills so the monogram reads on cream */',
  '  .cert-sheet .cs-seal [fill="#E8D5A8"]{ fill:#8A6D2F !important; }',
  '  .cert-sheet .cs-seal [fill="#D8BD83"]{ fill:#9A7B2E !important; }',
  '  .cert-sheet .cs-seal [stroke="#C8A96A"]{ stroke:#9A7B2E !important; }',
  '  .cert-sheet .cs-qr-cap{ color:#6B6862 !important; }',
  '}'
].join('\n');

/* Scale the recipient name to never overflow its line.
   A4-landscape sheet is 297mm wide; the name line maxes out at 200mm
   (~756px at 96dpi), so use that as the default when the sheet is not yet
   laid out (e.g. inside a hidden print root). */
function PEL_CERT_FIT(root){
  var el = root.querySelector('.cs-name');
  if(!el) return;
  var avail = (el.clientWidth || el.parentNode && el.parentNode.clientWidth || 756) * 0.96;
  var inline = el.style.fontSize;
  var size = inline ? parseFloat(inline) || 30 : 30;
  while(size > 16){
    el.style.fontSize = size + 'pt';
    if(el.scrollWidth <= avail) break;
    size -= 0.5;
  }
  el.style.fontSize = size + 'pt';
}

/* Build the certificate sheet. cert:
     name, academyEn, academyAr, level, programName,
     completedAt ('YYYY-MM-DD'), issueDate ('YYYY-MM-DD' or null),
     certId, code, verifyUrl (optional; built from code if absent) */
function PEL_CERT_SHEET(cert){
  cert = cert || {};
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(d){
    if(!d) return '';
    var m = String(d).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if(!m) return String(d);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var y = +m[1], mo = +m[2], day = +m[3];
    if(mo < 1 || mo > 12 || day < 1 || day > 31) return String(d);
    return day + ' ' + months[mo - 1] + ' ' + y;
  }
  var verifyUrl = cert.verifyUrl || (cert.code ? 'https://personalizedenglishlessons.github.io/tutorfiraspel/verify.html?code=' + encodeURIComponent(cert.code) : '');
  var qr = '';
  if(verifyUrl && typeof PEL_CERT_QR !== 'undefined'){
    qr = PEL_CERT_QR.chip(verifyUrl, { capEn:'SCAN TO VERIFY', capAr:'امسح للتحقق' });
  }
  var nameStyle = /[\u0600-\u06FF]/.test(cert.name || '')
    ? " font-family:'Tajawal','Cairo','Segoe UI',Tahoma,sans-serif; direction:rtl; font-size:26pt;"
    : '';
  var seal = PEL_CERT_SEAL(cert.certId);

  var meta = '';
  if(cert.completedAt || cert.issueDate || cert.programName){
    meta = '<div class="cs-meta">' +
      (cert.completedAt ? '<div><span class="cs-m-ar">تاريخ الاتمام</span><div class="cs-m-lab">Completion Date</div><b>' + esc(fmt(cert.completedAt)) + '</b></div>' : '') +
      (cert.issueDate ? '<div><span class="cs-m-ar">تاريخ الاصدار</span><div class="cs-m-lab">Issue Date</div><b>' + esc(fmt(cert.issueDate)) + '</b></div>' : '') +
      (cert.programName ? '<div><span class="cs-m-ar">البرنامج</span><div class="cs-m-lab">Program</div><b>' + esc(cert.programName) + '</b></div>' : '') +
      '</div>';
  }

  return '' +
    '<div class="cert-sheet">' +
      '<div class="cs-border-outer"></div>' +
      '<div class="cs-border-inner"></div>' +
      '<div class="cs-corner cs-c-tl"></div><div class="cs-corner cs-c-tr"></div>' +
      '<div class="cs-corner cs-c-bl"></div><div class="cs-corner cs-c-br"></div>' +
      '<div class="cs-watermark"><img class="pel-logo" src="brand/pel-wordmark.svg" alt=""></div>' +
      '<div class="cs-page">' +
        '<div class="cs-head">' +
          '<img class="cs-logo" src="brand/pel-wordmark.svg" alt="PEL">' +
          '<div class="cs-school">Personalized English Lessons</div>' +
          '<div class="cs-school-ar">دروس انجليزي مخصصة، الاكاديمية</div>' +
        '</div>' +
        '<div class="cs-main">' +
          '<div class="cs-title">Certificate of Completion</div>' +
          '<div class="cs-title-ar">شهادة اتمام</div>' +
          '<div class="cs-rule"><span class="cs-diamond"></span></div>' +
          '<div class="cs-certifies">This certifies that</div>' +
          '<div class="cs-certifies-ar">تشهد هذه الشهادة بان</div>' +
          '<div class="cs-name" style="' + nameStyle + '">' + esc(cert.name || '') + '</div>' +
          '<div class="cs-name-rule"></div>' +
          '<div class="cs-completed">has successfully completed the academy</div>' +
          '<div class="cs-completed-ar">اكمل بنجاح اكاديمية</div>' +
          '<div class="cs-academy">' + esc(cert.academyEn || '') + '</div>' +
          (cert.academyAr ? '<div class="cs-academy-ar">' + esc(cert.academyAr) + '</div>' : '') +
          ((cert.level || cert.programName) ? '<div class="cs-level">' + esc([cert.level, cert.programName].filter(Boolean).join(' · ')) + '</div>' : '') +
          meta +
        '</div>' +
        '<div class="cs-bottom">' + seal + '</div>' +
      '</div>' +
      '<div class="cs-footer">' +
        '<div class="cs-fcol cs-fleft">' +
          '<div class="cs-sign"><div class="cs-sign-name">PEL Academy</div><div class="cs-sign-line"></div><div class="cs-sign-cap">The Academy <span class="cs-cap-ar">الاكاديمية</span></div></div>' +
          '<div class="cs-fno"><span class="cs-fno-ar">رقم الشهادة</span> Certificate No. <b>' + esc(cert.certId || '') + '</b></div>' +
        '</div>' +
        '<div class="cs-fcol cs-fcenter">' +
          '<div class="cs-fiss">' + (cert.issueDate ? 'Issued <span class="cs-fiss-ar">صدرت</span>، ' + esc(fmt(cert.issueDate)) : '') + '</div>' +
        '</div>' +
        '<div class="cs-fcol cs-fright">' +
          '<div class="cs-sign"><div class="cs-sign-name">Program Director</div><div class="cs-sign-line"></div><div class="cs-sign-cap">PEL <span class="cs-cap-ar">مدير البرنامج</span></div></div>' +
          qr +
        '</div>' +
      '</div>' +
    '</div>';
}

/* PEL rosette seal: fine rings, curved identity text, PEL monogram, and the
   certificate number in a quiet band. Original PEL vector mark (P/E/L) sits
   in the center. */
function PEL_CERT_SEAL(certId){
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var num = certId || '';
  return '' +
    '<div class="cs-seal" aria-label="PEL seal">' +
      '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img">' +
        '<defs>' +
          '<path id="pelSealTop" d="M 32,100 A 68,68 0 0 1 168,100"/>' +
          '<path id="pelSealBot" d="M 32,100 A 68,68 0 0 0 168,100"/>' +
        '</defs>' +
        '<circle cx="100" cy="100" r="96" fill="none" stroke="#C8A96A" stroke-width="1.1"/>' +
        '<circle cx="100" cy="100" r="80" fill="none" stroke="#C8A96A" stroke-width="0.4" stroke-dasharray="2 2.5"/>' +
        '<circle cx="100" cy="100" r="58" fill="none" stroke="#C8A96A" stroke-width="0.6"/>' +
        '<text font-family="Fraunces,serif" font-size="11.5" letter-spacing="3.2" fill="#C8A96A">' +
          '<textPath href="#pelSealTop" startOffset="50%" text-anchor="middle">PROPERTY_OF_PEL</textPath>' +
        '</text>' +
        '<text font-family="Fraunces,serif" font-size="10" letter-spacing="2.4" fill="#C8A96A">' +
          '<textPath href="#pelSealBot" startOffset="50%" text-anchor="middle">CERTIFICATE OF COMPLETION</textPath>' +
        '</text>' +
        '<path d="M2 4L6 4L6 36L2 36ZM6 4L11 4L15 8L6 8ZM15 8L15 12L11 16L11 8ZM6 12L11 12L11 16L6 16ZM17 4L21 4L21 36L17 36ZM21 4L25 4L29 8L21 8ZM21 18L24 18L28 22L21 22ZM21 32L25 32L29 36L21 36ZM31 4L35 4L35 32L31 32ZM31 32L34 32L38 36L31 36Z" transform="translate(79,52) scale(1.06)" fill="#E8D5A8"/>' +
        '<text x="100" y="104" text-anchor="middle" font-family="Fraunces,serif" font-size="9" letter-spacing="3" fill="#D8BD83">CERTIFICATE</text>' +
        '<rect x="40" y="112" width="120" height="26" rx="13" fill="rgba(200,169,106,.08)" stroke="#C8A96A" stroke-width="0.5"/>' +
        '<text x="100" y="124" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="6" letter-spacing="1.5" fill="#8A8578">CERTIFICATE No.</text>' +
        '<text x="100" y="135" text-anchor="middle" font-family="Fraunces,serif" font-size="8.5" letter-spacing="1.2" fill="#E8D5A8" textLength="108">' + esc(num) + '</text>' +
      '</svg>' +
    '</div>';
}

/* Inject the certificate CSS into the current document (idempotent). */
function PEL_CERT_INJECT_STYLE(){
  if(document.getElementById('pel-cert-style')) return;
  var st = document.createElement('style');
  st.id = 'pel-cert-style';
  st.textContent = PEL_CERT_CSS;
  document.head.appendChild(st);
}

window.PEL_CERT_CSS = PEL_CERT_CSS;
window.PEL_CERT_SHEET = PEL_CERT_SHEET;
window.PEL_CERT_SEAL = PEL_CERT_SEAL;
window.PEL_CERT_FIT = PEL_CERT_FIT;
window.PEL_CERT_INJECT_STYLE = PEL_CERT_INJECT_STYLE;