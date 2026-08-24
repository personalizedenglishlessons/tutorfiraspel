/* =====================================================================
   PEL DASHBOARD LIFE  -  non-destructive animation + study-tools layer.
   Scoped under .pel-dash-* / .pel-life-*. Decorates the existing
   horizontal dashboard only: floating orbs, hover lift, shimmer sweep,
   animated count-up, streak flame, entrance stagger, one horizontal
   Study Tools strip, and a live Word Burst card. No fake progress/gates
   (tools reuse the app's real minDone gates; counts animate from real
   values already painted by the app). Respects prefers-reduced-motion
   AND the in-app Reduce Motion toggle (adds body.pel-life-off).
   Bilingual chrome authored as <span class="arabic">..</span>، EN so the
   existing localizeChrome engine can collapse it; content nodes use the
   .pel-path class (already in CONTENT_MARK_RE) so lesson vocab stays
   bilingual and is never collapsed.
   ===================================================================== */
(function () {
  if (window.PEL_DASH_LIFE) return;
  function ar() {
    try {
      if (typeof accountPrefs !== 'undefined' && accountPrefs && accountPrefs.lang === 'ar') return true;
      if (document.documentElement.dir === 'rtl') return true;
    } catch (e) {}
    return false;
  }
  function E(s) { return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s); }
  function L(en, a) { return ar() ? '<span class="arabic">' + E(a) + '</span>' : E(en); }
  function reduced() {
    var os = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var t = document.getElementById('reduceMotionToggle');
    return !!(os || (t && t.checked));
  }
  function syncQuiet() { document.body.classList.toggle('pel-life-off', reduced()); }

  var STYLE = '' +
    /* ---- quiet switch: kill infinite/decorative motion ---- */
    'body.pel-life-off .pel-dash-orb,body.pel-life-off .pel-dash-ember,body.pel-life-off .pel-dash-shimmer,body.pel-life-off .pel-dash-rise,body.pel-life-off .pel-dash-pulse,body.pel-life-off .pel-dash-burst-word{animation:none !important;}' +
    'body.pel-life-off .pel-dash-tilt{transform:none !important;}' +

    /* ---- hero floating orbs ---- */
    '#heroCard .pel-dash-orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(200,169,106,.20),transparent 70%);pointer-events:none;filter:blur(.5px);}' +
    '#heroCard .pel-dash-orb.o1{width:120px;height:120px;top:-30px;right:8%;animation:pelDashDrift1 11s ease-in-out infinite;}' +
    '#heroCard .pel-dash-orb.o2{width:70px;height:70px;bottom:-18px;left:18%;animation:pelDashDrift2 9s ease-in-out infinite;}' +
    '#heroCard .pel-dash-orb.o3{width:46px;height:46px;top:24px;left:42%;animation:pelDashDrift3 7.5s ease-in-out infinite;}' +
    '@keyframes pelDashDrift1{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-14px,12px) scale(1.08);}}' +
    '@keyframes pelDashDrift2{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(12px,-10px) scale(1.12);}}' +
    '@keyframes pelDashDrift3{0%,100%{transform:translate(0,0);}50%{transform:translate(8px,8px);}}' +

    /* ---- hover lift on dashboard cards/tiles ---- */
    '#view-home .card.hoverable,#view-home .academy-card,#view-home .topic-tile,#view-home .quiz-option,#view-home .pel-dash-tool{transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease);will-change:transform;}' +
    '#view-home .card.hoverable:hover,#view-home .academy-card:hover,#view-home .topic-tile:hover,#view-home .pel-dash-tool:hover{transform:translateY(-5px);box-shadow:0 18px 44px -18px rgba(200,169,106,.42);border-color:rgba(200,169,106,.5);}' +
    '#view-home .pel-dash-tool:active{transform:translateY(-1px) scale(.99);}' +

    /* ---- shimmer sweep on gold buttons ---- */
    '.btn-gold{position:relative;overflow:hidden;}' +
    '.btn-gold .pel-dash-shimmer{position:absolute;top:0;left:-130%;width:60%;height:100%;transform:skewX(-22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);pointer-events:none;animation:pelDashShimmer 3.2s ease-in-out infinite;}' +
    '@keyframes pelDashShimmer{0%{left:-130%;}60%,100%{left:140%;}}' +

    /* ---- streak flame ---- */
    '#heroStreakNum{position:relative;display:inline-block;}' +
    '#heroStreakNum .pel-dash-ember{position:absolute;top:-6px;right:-7px;width:6px;height:6px;border-radius:50%;background:var(--gold-soft);box-shadow:0 0 8px var(--gold);animation:pelDashEmber 1.8s ease-in-out infinite;}' +
    '@keyframes pelDashEmber{0%,100%{opacity:.35;transform:translateY(0) scale(.8);}50%{opacity:1;transform:translateY(-4px) scale(1.2);}}' +

    /* ---- ring pulse glow ---- */
    '.ring-wrap .prog{filter:drop-shadow(0 0 3px rgba(200,169,106,.0));animation:pelDashRingPulse 3.6s ease-in-out infinite;}' +
    '@keyframes pelDashRingPulse{0%,100%{filter:drop-shadow(0 0 2px rgba(200,169,106,.18));}50%{filter:drop-shadow(0 0 6px rgba(200,169,106,.4));}}' +

    /* ---- entrance stagger ---- */
    '#view-home .pel-dash-rise{opacity:0;transform:translateY(16px);animation:pelDashRise .6s var(--ease) forwards;}' +
    '@keyframes pelDashRise{to{opacity:1;transform:translateY(0);}}' +

    /* ---- study tools strip (horizontal, keeps the horizontal layout) ---- */
    '.pel-dash-strip{display:flex;gap:12px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x mandatory;margin-bottom:26px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 18px,#000 calc(100% - 30px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 18px,#000 calc(100% - 30px),transparent 100%);}' +
    '.pel-dash-strip::-webkit-scrollbar{height:6px;}' +
    '.pel-dash-strip::-webkit-scrollbar-thumb{background:rgba(200,169,106,.35);border-radius:6px;}' +
    '.pel-dash-strip::-webkit-scrollbar-thumb:hover{background:rgba(200,169,106,.55);}' +
    '.pel-dash-tool{flex:0 0 auto;width:140px;scroll-snap-align:start;display:flex;flex-direction:column;gap:6px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;cursor:pointer;text-align:start;color:var(--text);}' +
    '.pel-dash-tool .td-ico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(200,169,106,.18),rgba(200,169,106,.05));color:var(--gold);margin-bottom:6px;}' +
    '.pel-dash-tool .td-t{font-size:.86rem;font-weight:600;line-height:1.25;}' +
    '.pel-dash-tool .td-s{font-size:.72rem;color:var(--text-muted);}' +
    '.pel-dash-tool.locked{opacity:.6;cursor:not-allowed;}' +
    '.pel-dash-tool.locked .td-ico{background:rgba(255,255,255,.04);color:var(--text-muted);}' +

    /* ---- word burst card ---- */
    '.pel-dash-burst{position:relative;overflow:hidden;margin-bottom:90px;border:1px solid rgba(200,169,106,.16);}' +
    '.pel-dash-burst::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 120% at 80% 0%,rgba(200,169,106,.07),transparent 60%);pointer-events:none;}' +
    '.pel-dash-burst .pel-dash-burst-word{display:inline-block;animation:pelDashFlip .7s var(--ease);transform-origin:center bottom;}' +
    '@keyframes pelDashFlip{0%{opacity:0;transform:rotateX(-55deg) translateY(8px);}100%{opacity:1;transform:rotateX(0) translateY(0);}}' +
    /* ---- animated aurora glow inside the hero ---- */
    '#heroCard{position:relative;overflow:hidden;}' +
    '#heroCard .pel-dash-aurora{position:absolute;inset:-30%;background:conic-gradient(from 0deg,rgba(200,169,106,0),rgba(200,169,106,.12),rgba(63,140,114,.06),rgba(216,189,131,.10),rgba(200,169,106,0));filter:blur(22px);animation:pelDashAurora 16s linear infinite;pointer-events:none;z-index:0;}' +
    '#heroCard>*{position:relative;z-index:1;}' +
    '@keyframes pelDashAurora{to{transform:rotate(360deg);}}' +
    'body.pel-life-off #heroCard .pel-dash-aurora{animation:none !important;opacity:.4;}' +
    /* ---- 3D tilt + parallax on hover ---- */
    '#view-home .card.hoverable,#view-home .pel-dash-tool,#view-home .academy-card,#view-home .topic-tile{transform-style:preserve-3d;}' +
    '.pel-dash-tilt{transition:transform .3s var(--ease) !important;}' +
    'body.pel-life-off .pel-dash-tilt{transform:none !important;}' +
    /* ---- richer tool cards: accent bar + lift ---- */
    '.pel-dash-tool{overflow:hidden;}' +
    '.pel-dash-tool::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:0;transition:opacity .25s;}' +
    '.pel-dash-tool:hover::after{opacity:1;}' +
    '.pel-dash-tool .td-ico{width:38px;height:38px;}' +
    /* ---- magnetic gold buttons ---- */
    '#view-home .btn-gold{transition:transform .2s var(--ease),box-shadow var(--dur) var(--ease);}' +
    /* ---- clearance so the fixed Quick-Translate FAB never covers the tools strip ---- */
    '#view-home{padding-bottom:96px;}' +
    '#view-home .pel-dash-tools-wrap{padding-inline-end:clamp(96px,14vw,150px);box-sizing:border-box;}' +
    /* ---- lessonify: make the dashboard feel like the lesson player ---- */
    '#view-home.pel-dash-lessonify .card.hoverable,' +
    '#view-home.pel-dash-lessonify .pel-dash-burst{' +
      'border-radius:20px;background:rgba(23,23,27,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:var(--shadow-soft);border:1px solid var(--border);' +
    '}' +
    '#view-home.pel-dash-lessonify .pel-dash-tool{border-radius:16px;background:rgba(23,23,27,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:var(--shadow-soft);}' +
    /* gold pill chips like .pel-act-type */
    '#view-home.pel-dash-lessonify .chip.gold,' +
    '#view-home.pel-dash-lessonify .tag-gold{' +
      'text-transform:uppercase;letter-spacing:.06em;font-weight:700;font-size:.68rem;background:rgba(200,169,106,.12);border:1px solid rgba(200,169,106,.25);color:var(--gold);border-radius:999px;padding:4px 10px;' +
    '}' +
    /* gold gradient CTAs like .pel-act-primary */
    '#view-home.pel-dash-lessonify .btn-gold{' +
      'background:linear-gradient(135deg,var(--gold),var(--gold-soft));color:#171412;border:1px solid rgba(200,169,106,.4);border-radius:14px;font-weight:700;box-shadow:var(--gold-glow);' +
    '}' +
    '#view-home.pel-dash-lessonify .btn-gold:hover{filter:brightness(1.08);}' +
    /* recessed stat / mini boxes like .pel-act-hint */
    '#view-home.pel-dash-lessonify .stat-pill,' +
    '#view-home.pel-dash-lessonify .stat-box{' +
      'background:var(--card-elevated);border-radius:12px;border:1px solid var(--border);' +
    '}' +
    /* gold progress fills like the lesson progress bar */
    '#view-home.pel-dash-lessonify .progress-fill,' +
    '#view-home.pel-dash-lessonify .progress > span,' +
    '#view-home.pel-dash-lessonify .bar-fill{' +
      'background:linear-gradient(90deg,var(--gold),var(--gold-soft));' +
    '}' +
    /* hero animated gold gradient ring border */
    '#view-home.pel-dash-lessonify #heroCard::after{' +
      'content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;' +
      'background:conic-gradient(from 215deg,rgba(200,169,106,.55),rgba(63,140,114,.2),rgba(216,189,131,.5),rgba(200,169,106,.55));' +
      '-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;pointer-events:none;opacity:.75;animation:pelDashAurora 18s linear infinite;z-index:2;' +
    '}' +
    /* cursor-follow spotlight on big cards */
    '#view-home.pel-dash-lessonify .card.hoverable{position:relative;}' +
    '#view-home.pel-dash-lessonify .card.hoverable .pel-dash-spot{' +
      'position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .25s;' +
      'background:radial-gradient(220px circle at var(--mx,50%) var(--my,50%),rgba(200,169,106,.10),transparent 60%);' +
    '}' +
    '#view-home.pel-dash-lessonify .card.hoverable:hover .pel-dash-spot{opacity:1;}' +
    'body.pel-life-off #view-home.pel-dash-lessonify #heroCard::after{animation:none !important;opacity:.4;}' +
    '@media(max-width:720px){.pel-dash-tool{width:128px;}}' +
    '.cc-ring-prog{animation:ccRingDraw 1.2s cubic-bezier(.22,.61,.36,1) both;}' +
    '@keyframes ccRingDraw{from{stroke-dashoffset:352;}}' +
    '@media (prefers-reduced-motion:reduce){.cc-ring-prog{animation:none;}}';

  function injectStyle() {
    if (document.getElementById('pelDashLifeStyle')) return;
    var s = document.createElement('style'); s.id = 'pelDashLifeStyle'; s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function addOrbs() {
    var hero = document.getElementById('heroCard'); if (!hero || hero.querySelector('.pel-dash-orb')) return;
    ['o1', 'o2', 'o3'].forEach(function (c) {
      var d = document.createElement('div'); d.className = 'pel-dash-orb ' + c; hero.appendChild(d);
    });
  }
  function addShimmers() {
    document.querySelectorAll('#view-home .btn-gold:not(:has(.pel-dash-shimmer))').forEach(function (b) {
      if (b.querySelector('.pel-dash-shimmer')) return;
      var sp = document.createElement('span'); sp.className = 'pel-dash-shimmer'; b.appendChild(sp);
    });
  }
  function addFlame() {
    var s = document.getElementById('heroStreakNum'); if (!s || s.querySelector('.pel-dash-ember')) return;
    var e = document.createElement('span'); e.className = 'pel-dash-ember'; s.appendChild(e);
  }

  function countUp(el) {
    if (!el) return;
    var raw = (el.textContent || '').trim();
    var m = raw.match(/-?\d[\d.,]*/);
    if (!m) return;
    var target = parseFloat(m[0].replace(/[,]/g, ''));
    if (!isFinite(target) || target <= 0) return;
    var suffix = raw.slice(m.index + m[0].length);
    var prefix = raw.slice(0, m.index);
    if (el.dataset.pelCounted === '1') return;
    el.dataset.pelCounted = '1';
    if (reduced()) { return; }
    var dur = 900, t0 = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = prefix + v + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(tick);
  }

  function observeRise() {
    var root = document.getElementById('view-home'); if (!root) return;
    var cards = root.querySelectorAll('.card, .pel-dash-burst, .pel-dash-strip, .eyebrow');
    if (!('IntersectionObserver' in window)) { cards.forEach(function (c) { c.classList.add('pel-dash-rise'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          en.target.style.animationDelay = Math.min(i * 60, 360) + 'ms';
          en.target.classList.add('pel-dash-rise');
          io.unobserve(en.target);
        }
      });
    }, { root: null, threshold: 0.08 });
    cards.forEach(function (c) { if (!c.classList.contains('pel-dash-rise')) io.observe(c); });
  }

  /* ---- study tools strip: real views + real minDone gates ---- */
  function doneCount() { try { return (typeof completedLessons !== 'undefined') ? completedLessons.size : 0; } catch (e) { return 0; } }
  function go(view) { try { if (typeof goToView === 'function') goToView(view); } catch (e) {} }

  var TOOLS = [
    { view: 'curriculum', en: 'Curriculum', ar: 'المنهج', icon: 'route', subEn: 'Your path', subAr: 'مسارك', minDone: 0 },
    { view: 'vocabulary', en: 'Vocabulary', ar: 'المفردات', icon: 'book-open', subEn: 'Saved words', subAr: 'كلماتك', minDone: 3 },
    { view: 'review', en: 'Smart Review', ar: 'المراجعة', icon: 'rotate-ccw', subEn: 'Due cards', subAr: 'بطاقات مستحقة', minDone: 4 },
    { view: 'bookmarks', en: 'Bookmarks', ar: 'المفضلة', icon: 'bookmark', subEn: 'Marked lessons', subAr: 'دروس موشرة', minDone: 6 },
    { view: 'pronunciation', en: 'Pronunciation', ar: 'النطق', icon: 'mic', subEn: 'Speak & score', subAr: 'انطق وسجل', minDone: 0 },
    { view: 'grammar', en: 'Grammar', ar: 'القواعد', icon: 'spell-check', subEn: 'Fix mistakes', subAr: 'صحح الاخطا', minDone: 0 },
    { view: 'listening', en: 'Listening', ar: 'الاستماع', icon: 'headphones', subEn: 'Hear & answer', subAr: 'اسمع وجاوب', minDone: 0 },
    { view: 'reading', en: 'Reading', ar: 'القراة', icon: 'book-text', subEn: 'Read passages', subAr: 'اقرا النصوص', minDone: 0 },
    { view: 'writing', en: 'Writing', ar: 'الكتابة', icon: 'pen-line', subEn: 'Write & check', subAr: 'اكتب وتفحص', minDone: 0 },
    { view: 'speaking', en: 'Speaking', ar: 'المحادثة', icon: 'messages-square', subEn: 'Talk it out', subAr: 'تكلم', minDone: 0 }
  ];
  var ICON_SVG = {
    'route': '<path d="M6 3v12a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v0"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/>',
    'book-open': '<path d="M12 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 1 2 2 2 2 0 0 1 2-2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2z"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    'bookmark': '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    'mic': '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    'spell-check': '<path d="M6 16l3-9 3 9M7 13h4M15 16l2 2 4-4"/>',
    'headphones': '<path d="M3 16v-3a9 9 0 0 1 18 0v3M6 14h3v6H6zM15 14h3v6h-3z"/>',
    'book-text': '<path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 8h8M8 12h8M8 16h5"/>',
    'pen-line': '<path d="M12 20h9M16.5 3.5l4 4L7 21H3v-4z"/>',
    'messages-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
  };
  function svgIcon(name, w) {
    var p = ICON_SVG[name] || ICON_SVG['route'];
    return '<svg width="' + (w || 18) + '" height="' + (w || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  function buildToolsStrip() {
    var home = document.getElementById('view-home'); if (!home) return;
    var existing = home.querySelector('.pel-dash-tools-wrap'); if (existing) existing.remove();
    var hero = document.getElementById('heroCard');
    var anchor = hero ? hero.nextSibling : null;
    var dc = doneCount();
    var outer = document.createElement('div');
    outer.className = 'pel-dash-tools-wrap';
    var eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow pel-dash-rise';
    eyebrow.style.cssText = 'margin:2px 2px 6px;';
    eyebrow.innerHTML = L('Study Tools', 'ادوات الدراسة');
    var strip = document.createElement('div');
    strip.className = 'pel-dash-strip';
    strip.innerHTML = TOOLS.map(function (t) {
        var locked = dc < t.minDone;
        return '<button class="pel-dash-tool' + (locked ? ' locked' : '') + '" data-view="' + t.view + '" data-min="' + t.minDone + '">' +
          '<span class="td-ico">' + svgIcon(t.icon, 18) + '</span>' +
          '<span class="td-t">' + L(t.en, t.ar) + '</span>' +
          '<span class="td-s">' + L(locked ? ('Unlocks at ' + t.minDone + ' lessons') : t.subEn, locked ? ('يفتح عند ' + t.minDone + ' دروس') : t.subAr) + '</span>' +
        '</button>';
      }).join('');
    outer.appendChild(eyebrow);
    outer.appendChild(strip);
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(outer, anchor);
    else home.insertBefore(outer, home.firstChild);
    strip.querySelectorAll('.pel-dash-tool').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('locked')) {
          try { if (typeof toast === 'function') toast(ar() ? '<span class="arabic">كمل دروس اكثر عشان يفتح</span>، Complete more lessons to unlock this tool.' : 'Complete more lessons to unlock this tool.'); } catch (e) {}
          return;
        }
        go(b.getAttribute('data-view'));
      });
    });
  }

  /* ---- word burst: cycles real vocab (or beginner items) ---- */
  function burstPool() {
    var p = [];
    try { if (Array.isArray(window.vocabStore) && vocabStore.length) p = vocabStore.slice(); } catch (e) {}
    if (!p.length && typeof PEL_BEGINNER_LESSONS !== 'undefined') {
      Object.keys(PEL_BEGINNER_LESSONS).forEach(function (slug) {
        var L = PEL_BEGINNER_LESSONS[slug];
        (L.items || []).forEach(function (it) { p.push({ en: it.en, ar: it.ar, translit: it.translit, pos: it.pos }); });
      });
    }
    return p;
  }
  function buildWordBurst() {
    var home = document.getElementById('view-home'); if (!home) return;
    var old = home.querySelector('.pel-dash-burst'); if (old) return;
    var pool = burstPool(); if (!pool.length) return;
    var card = document.createElement('div');
    card.className = 'card hoverable pel-dash-burst';
    card.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<span class="td-ico" style="width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(200,169,106,.18),rgba(200,169,106,.05));color:var(--gold);">' + svgIcon('sparkles', 16) + '</span>' +
        '<span class="eyebrow" style="margin:0;">' + L('Word Burst', 'كلمة لحظية') + '</span>' +
        '<span class="pel-dash-next" style="margin-inline-start:auto;font-size:.72rem;color:var(--text-muted);cursor:pointer;">' + L('Next', 'التالي') + '</span>' +
      '</div>' +
      '<div class="pel-dash-burst-word" style="font-size:1.6rem;font-weight:700;font-family:\'Fraunces\',serif;letter-spacing:-.01em;"></div>' +
      '<div class="pel-dash-burst-ar arabic" style="font-size:1.2rem;margin-top:4px;"></div>' +
      '<div class="pel-dash-burst-tr" style="font-size:.82rem;color:var(--text-muted);margin-top:2px;direction:ltr;"></div>';
    var strip = home.querySelector('.pel-dash-strip');
    if (strip && strip.nextSibling) strip.parentNode.insertBefore(card, strip.nextSibling);
    else home.appendChild(card);
    var wEl = card.querySelector('.pel-dash-burst-word');
    var aEl = card.querySelector('.pel-dash-burst-ar');
    var trEl = card.querySelector('.pel-dash-burst-tr');
    var i = Math.floor(Math.random() * pool.length);
    function paint() {
      var it = pool[i % pool.length];
      wEl.textContent = it.en;
      aEl.textContent = it.ar || '';
      trEl.textContent = it.translit || '';
      // restart fade animation
      wEl.classList.remove('pel-dash-burst-word'); void wEl.offsetWidth; wEl.classList.add('pel-dash-burst-word');
    }
    paint();
    var timer = null;
    function start() { stop(); if (reduced()) return; timer = setInterval(function () { i++; paint(); }, 4200); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    card.querySelector('.pel-dash-next').addEventListener('click', function () { i++; paint(); });
    card._pelStart = start; card._pelStop = stop;
    if (!reduced()) start();
  }
  var ICON_EXTRA = { 'sparkles': '<path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4zM19 14l.7 2L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z"/>' };
  // merge extra icon
  for (var k in ICON_EXTRA) ICON_SVG[k] = ICON_EXTRA[k];

  /* ---- animated aurora glow inside the hero card ---- */
  function addAurora() {
    var h = document.getElementById('heroCard');
    if (!h || h.querySelector('.pel-dash-aurora')) return;
    var d = document.createElement('div');
    d.className = 'pel-dash-aurora';
    h.insertBefore(d, h.firstChild);
  }

  /* ---- 3D parallax tilt + cursor spotlight on hover ---- */
  var tiltRaf = null;
  function enableTilt() {
    if (reduced()) return;
    var sel = '#view-home .card.hoverable, #view-home .pel-dash-tool, #view-home .academy-card, #view-home .topic-tile';
    document.querySelectorAll(sel).forEach(function (c) {
      if (c.dataset.pelTilt === '1') return; c.dataset.pelTilt = '1';
      c.classList.add('pel-dash-tilt');
      if (c.matches && c.matches('.card.hoverable') && !c.querySelector('.pel-dash-spot')) {
        var sp = document.createElement('span'); sp.className = 'pel-dash-spot'; c.appendChild(sp);
      }
      c.addEventListener('mousemove', function (ev) {
        var r = c.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        c.style.setProperty('--my', (ev.clientY - r.top) + 'px');
        if (tiltRaf) cancelAnimationFrame(tiltRaf);
        tiltRaf = requestAnimationFrame(function () {
          c.style.transform = 'perspective(820px) rotateX(' + (y * -5) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-4px)';
        });
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  /* ---- re-collapse bilingual chrome after async dashboard content renders ---- */
  function relocalizeHomeSoon() {
    if (typeof localizeChrome !== 'function') return;
    var home = document.getElementById('view-home'); if (!home) return;
    [0, 350, 900, 1500].forEach(function (d) {
      setTimeout(function () { try { localizeChrome(home); } catch (e) {} }, d);
    });
  }

  /* ---- magnetic gold buttons ---- */
  function enableMagnetic() {
    if (reduced()) return;
    document.querySelectorAll('#view-home .btn-gold').forEach(function (b) {
      if (b.dataset.pelMag === '1') return; b.dataset.pelMag = '1';
      b.addEventListener('mousemove', function (ev) {
        var r = b.getBoundingClientRect();
        var x = (ev.clientX - r.left - r.width / 2) / r.width * 10;
        var y = (ev.clientY - r.top - r.height / 2) / r.height * 10;
        b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  function decorate() {
    if (!document.getElementById('view-home')) return;
    var home = document.getElementById('view-home');
    home.classList.add('pel-dash-lessonify');
    syncQuiet();
    addOrbs();
    addShimmers();
    addFlame();
    buildToolsStrip();
    buildWordBurst();
    addAurora();
    enableTilt();
    enableMagnetic();
    observeRise();
    relocalizeHomeSoon();
    ['heroStreakNum', 'heroLessonsNum', 'heroHoursNum', 'heroReviewDaysNum'].forEach(countUp);
    if (typeof lucide !== 'undefined' && lucide.createIcons) { try { lucide.createIcons({ nodes: [document.getElementById('view-home')] }); } catch (e) {} }
  }

  function wire() {
    injectStyle();
    syncQuiet();
    var t = document.getElementById('reduceMotionToggle');
    if (t) t.addEventListener('change', function () {
      syncQuiet();
      document.querySelectorAll('.pel-dash-burst').forEach(function (c) { if (reduced()) { c._pelStop && c._pelStop(); } else { c._pelStart && c._pelStart(); } });
    });
    // run when home becomes active or progress changes
    var run = function () { try { decorate(); } catch (e) {} };
    if (typeof viewRenderers !== 'undefined') {
      var prev = viewRenderers['home'] || viewRenderers['view-home'] || null;
      viewRenderers['view-home'] = function () { if (prev) try { prev(); } catch (e) {} run(); };
    }
    document.addEventListener('pel-progress-updated', run);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();

  window.PEL_DASH_LIFE = { decorate: decorate };
})();
