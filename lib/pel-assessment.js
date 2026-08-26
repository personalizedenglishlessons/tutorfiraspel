/* ============================================================
   PEL ADAPTIVE PLACEMENT TEST - adaptive step-up / step-down engine.
   ------------------------------------------------------------
   Takes over [data-open-path] (capture phase, before onboard.js) and
   runs an adaptive placement test inside #onboardOverlay / #onboardBody.

   ENGINE RULES
   - Pool loaded once from assessment_questions (difficulty_rating 1..5).
   - Start at a Medium-Low baseline (target difficulty = 2).
   - Correct  -> internal score++ and STEP UP  (next item from a higher
                difficulty pool; target = min(5, target+1)).
   - Incorrect-> STEP DOWN (target = max(1, target-1)).
   - Early termination: 3 consecutive BASIC (difficulty <= 2) misses
                -> stop, tag "start_from_zero".
   - Hard caps: 10-minute countdown, max 15 questions.
   - On termination (time / 15 / 3-miss): freeze input, persist result
                to localStorage (+ student_save_assessment RPC if a
                session exists), then render a customized paywall from
                PEL_PLANS_DB with a WhatsApp checkout trigger.
   No payment gateway. Arabic copy: Saudi Southern (Abha), NO hamzas,
   NO em dashes. Index < 50ms per state change (in-memory selection).
   ============================================================ */
(function () {
  'use strict';

  var overlay = document.getElementById('onboardOverlay');
  var body = document.getElementById('onboardBody');
  if (!overlay || !body) return;

  var SB_URL = 'https://lewoochehpiycocvfwtz.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29vY2hlaHBpeWNvY3Zmd3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ3MzcsImV4cCI6MjA5OTY1MDczN30.sIWK6jwX7PW70fH0yPUuhOb25N1lBw2-Cvb3dtwDb9Y';
  var CONTACT = (window.PEL_PLANS && PEL_PLANS.contact) || '966557178070';
  var HARD_CAP = 15;            // max questions per session
  var TIME_LIMIT = 10 * 60;     // 10-minute hard cap (seconds)
  var EARLY_MISS = 3;          // consecutive basic misses -> early stop

  var ST = {
    lang: 'ar',
    pool: [],            // all loaded questions
    seen: {},            // code -> true (avoid repeats)
    asked: [],          // {code, correct, level, difficulty, tier}
    target: 2,          // current target difficulty (start medium-low)
    score: 0,
    consecBasicMiss: 0,
    current: null,       // the question currently displayed (scored on Next)
    timerInt: null,
    secsLeft: TIME_LIMIT,
    frozen: false
  };

  /* ---------------- copy (casual EN / Abha AR, no hamza, no em dash) ---- */
  var L = {
    intro: { en: 'Find your level', ar: 'اعرف مستواك' },
    introSub: { en: 'Ready to see your level? Let us jump straight in. 10 minutes, up to 15 questions, and we adapt to you as you go.', ar: 'جاهز تشوف مستواك؟ خلنا نبدا علطول. 10 دقايق، حتى 15 سوال، ونتكيف معك وانت جاي.' },
    start: { en: 'Jump straight in', ar: 'نبدا علطول' },
    gate: { en: 'Can you read and pronounce English letters?', ar: 'تقدر تقرا وتنطق حروف انجليزي؟' },
    gateSub: { en: 'Be honest. This picks the right test for you.', ar: 'كون صريح. عشان نختار الاختبار المناسب لك.' },
    gateYes: { en: 'Yes, I can', ar: 'اي، اقدر' },
    gateNo: { en: 'No, not really', ar: 'لا، مو فعلا' },
    q: { en: 'Question', ar: 'سوال' },
    of: { en: 'of', ar: 'من' },
    next: { en: 'Next', ar: 'التالي' },
    back: { en: 'Back', ar: 'رجوع' },
    timeWarn: { en: 'Hurry up, time is almost up', ar: 'سرع، الوقت خلص' },
    timeUp: { en: 'Time is up', ar: 'خلص الوقت' },
    evaluating: { en: 'Reading your answers', ar: 'نقرا اجاباتك' },
    evaluatingSub: { en: 'Matching you to the right plan', ar: 'نطابقك مع الباقة المناسبة' },
    resultBeginner: { en: 'You are starting from zero. The Start From 0 plan takes you from the very first letter, step by step.', ar: 'مستواك يبدا من الصفر. خطة ابد من الصفر تاخذك من اول حرف خطوة بخطوة.' },
    resultExam: { en: 'You are advanced. The Exam Prep plan fits you (STEP, TOEFL, IELTS).', ar: 'مستواك متقدم. خطة التجهيز للاختبارات تناسبك (STEP و TOEFL و IELTS).' },
    earlyStop: { en: 'No worries, we got your level. Starting from zero is the fastest way up.', ar: 'عادي، عرفنا مستواك. تبدا من الصفر اسرع طريق للطلوع.' },
    yourLevel: { en: 'Your level', ar: 'مستواك' },
    recommended: { en: 'Recommended plan', ar: 'الباقة المناسبة' },
    chooseOther: { en: 'Or pick the other track', ar: 'او اختر المسار الثاني' },
    bestValue: { en: 'Best value', ar: 'افضل قيمة' },
    classesWeek: { en: '1 live class / week', ar: 'حصة مباشرة كل اسبوع' },
    classesWeekNote: { en: 'Only on the 3-Month Exam Prep package', ar: 'بس بباقة 3 اشهر للتجهيز للاختبارات' },
    enroll: { en: 'Enroll via WhatsApp', ar: 'سجل عن طريق واتساب' },
    activatedNote: { en: 'Activation within minutes after manual confirmation.', ar: 'التنشيط خلال دقايق بعد التاكيد اليدوي.' },
    buyCredits: { en: 'Want extra live classes?', ar: 'تبغى حصص اضافية؟' },
    buyCreditsCta: { en: 'Buy class credits via WhatsApp', ar: 'اشتر رصيد حصص عن طريق واتساب' },
    close: { en: 'Close', ar: 'اغلاق' },
    retake: { en: 'Retake test', ar: 'اعد الاختبار' }
  };
  function T(k) { return (ST.lang === 'ar' && L[k] && L[k].ar) ? L[k].ar : (L[k] ? L[k].en : k); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------------- load pool ---------------- */
  function ensureQuestions() {
    return new Promise(function (resolve) {
      if (window.PEL_QUESTIONS && PEL_QUESTIONS.length) { resolve(PEL_QUESTIONS); return; }
      fetch(SB_URL + '/rest/v1/assessment_questions?select=*&order=difficulty_rating,sort_order&limit=60', {
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
      }).then(function (r) { return r.ok ? r.json() : []; }).then(resolve).catch(function () { resolve([]); });
    });
  }

  /* ---------------- lifecycle ---------------- */
  function open() {
    try { var p = JSON.parse(localStorage.getItem('pel_account_prefs') || 'null'); ST.lang = (p && p.lang === 'en') ? 'en' : 'ar'; } catch (e) { ST.lang = 'ar'; }
    ST.pool = []; ST.seen = {}; ST.asked = []; ST.target = 2; ST.score = 0; ST.consecBasicMiss = 0;
    ST.mode = 'adaptive';
    ST.current = null; ST.secsLeft = TIME_LIMIT; ST.frozen = false;
    overlay.setAttribute('dir', ST.lang === 'ar' ? 'rtl' : 'ltr');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    ensureQuestions().then(function (qs) {
      // Defensive: if the learner already entered the true-zero track while the
      // async question load was in flight, do not clobber their pool.
      ST.pool = (ST.mode === 'true_zero') ? ST.pool : ((qs && qs.length) ? qs : FALLBACK_QUESTIONS);
      renderIntro();
    });
  }
  function close() {
    if (ST.timerInt) { clearInterval(ST.timerInt); ST.timerInt = null; }
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ---------------- intro ---------------- */
  function renderIntro() {
    body.innerHTML =
      '<div class="ob-title" style="font-size:1.5rem;">' + esc(T('intro')) + '</div>' +
      '<div class="ob-sub" style="margin-top:10px;line-height:1.8;">' + esc(T('introSub')) + '</div>' +
      '<div class="ob-save-cta" style="margin-top:24px;">' +
        '<button class="ob-next" data-a="start">' + esc(T('start')) + '</button>' +
      '</div>';
  }

  /* ---------------- pre-gate: true-zero detection ---------------- */
  /* A learner who cannot read English letters gets a transliteration track:
     Arabic meaning shown, pick the matching English pronunciation written in
     Arabic script (e.g. كيف حالك -> هاو ار يو). Tests pronunciation/recognition,
     not meaning or grammar, so true-zero Saudi learners can be placed. */
  function renderGate() {
    body.innerHTML =
      '<div class="ob-title" style="font-size:1.3rem;">' + esc(T('gate')) + '</div>' +
      '<div class="ob-sub" style="margin-top:10px;line-height:1.8;">' + esc(T('gateSub')) + '</div>' +
      '<div class="ob-save-cta" style="margin-top:24px;display:flex;flex-direction:column;gap:10px;">' +
        '<button class="ob-next" data-a="gate-no">' + esc(T('gateNo')) + '</button>' +
        '<button class="ob-back" data-a="gate-yes">' + esc(T('gateYes')) + '</button>' +
      '</div>';
  }

  /* ---------------- adaptive selection (<50ms, in-memory) ---------------- */
  function pickNext() {
    // unseen items closest to the current target difficulty (prefer exact, then +-1, ...)
    var unseen = ST.pool.filter(function (q) { return !ST.seen[q.code]; });
    if (!unseen.length) return null;
    var best = null, bestDist = 99;
    for (var i = 0; i < unseen.length; i++) {
      var d = unseen[i].difficulty_rating || 3;
      var dist = Math.abs(d - ST.target);
      if (dist < bestDist) { best = unseen[i]; bestDist = dist; }
    }
    return best;
  }

  /* ---------------- question screen ---------------- */
  function renderQuestion() {
    if (ST.frozen) return;
    var q = pickNext();
    if (!q) { renderEvaluating(); return; }
    ST.current = q;
    ST.seen[q.code] = true;
    var opts = q.options || [];
    var pct = Math.round((ST.asked.length / HARD_CAP) * 100);
    var mins = Math.floor(ST.secsLeft / 60), secs = ST.secsLeft % 60;
    var warn = ST.secsLeft <= 60;
    body.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;font-size:.78rem;color:var(--text-muted);margin-bottom:14px;">' +
        '<span>' + esc(T('q')) + ' ' + (ST.asked.length + 1) + ' ' + esc(T('of')) + ' ' + HARD_CAP + '</span>' +
        '<span style="color:' + (warn ? 'var(--danger,#c0392b)' : 'var(--text-muted)') + ';font-weight:700;" id="asmTimer">' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs + '</span>' +
      '</div>' +
      '<div class="progress-track" style="height:6px;border-radius:3px;background:var(--border);overflow:hidden;margin-bottom:22px;"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--gold-soft,var(--gold)),var(--gold));transition:width .4s;"></div></div>' +
      (warn ? '<div style="text-align:center;color:var(--danger,#c0392b);font-weight:700;font-size:.8rem;margin-bottom:12px;">' + esc(T('timeWarn')) + '</div>' : '') +
      '<div class="ob-title" style="font-size:1.12rem;line-height:1.7;">' + esc(ST.lang === 'ar' ? q.question_ar : q.question_en) + '</div>' +
      '<div style="margin-top:18px;display:grid;gap:10px;">' +
        opts.map(function (o, i) {
          var mark = ST.mode === 'true_zero' ? ['١','٢','٣','٤'][i] : String.fromCharCode(65 + i);
          return '<button class="ob-option" data-a="opt" data-i="' + i + '" style="text-align:' + (ST.lang === 'ar' ? 'right' : 'left') + ';">' +
            '<span style="font-weight:700;margin-inline-end:8px;color:var(--gold);">' + mark + '</span>' +
            esc(ST.lang === 'ar' ? o.ar : o.en) + '</button>';
        }).join('') +
      '</div>' +
      '<div class="ob-save-cta" style="margin-top:22px;display:flex;gap:10px;">' +
        '<button class="ob-next" data-a="next" disabled>' + esc(T('next')) + '</button>' +
      '</div>';
    if (!ST.timerInt) ST.timerInt = setInterval(tick, 1000);
  }
  function tick() {
    ST.secsLeft = Math.max(0, ST.secsLeft - 1);
    var el = document.getElementById('asmTimer');
    if (el) {
      var mins = Math.floor(ST.secsLeft / 60), secs = ST.secsLeft % 60;
      el.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
      el.style.color = ST.secsLeft <= 60 ? 'var(--danger,#c0392b)' : 'var(--text-muted)';
    }
    if (ST.secsLeft <= 0) { ST.frozen = true; if (ST.timerInt) { clearInterval(ST.timerInt); ST.timerInt = null; } finish(); }
  }

  /* ---------------- answering + adaptive step ---------------- */
  function answer(q, chosenIdx) {
    var correct = chosenIdx === q.correct_index;
    var diff = q.difficulty_rating || 3;
    var tier = q.tier === 'exam_prep' ? 'exam_prep' : 'start_from_zero';
    ST.asked.push({ code: q.code, correct: correct, level: q.level, difficulty: diff, tier: tier });
    if (correct) {
      ST.score++; ST.consecBasicMiss = 0;
      ST.target = Math.min(5, ST.target + 1);   // STEP UP
    } else {
      ST.target = Math.max(1, ST.target - 1);   // STEP DOWN
      if (diff <= 2) ST.consecBasicMiss++; else ST.consecBasicMiss = 0;
    }
  }

  function renderEvaluating() {
    body.innerHTML = '<div class="ob-title" style="text-align:center;">' + esc(T('evaluating')) + '</div>' +
      '<div style="text-align:center;color:var(--text-muted);margin-top:8px;font-size:.85rem;">' + esc(T('evaluatingSub')) + '</div>' +
      '<div style="text-align:center;margin-top:18px;"><div class="spinner" style="width:34px;height:34px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:ob-spin 1s linear infinite;margin:0 auto;"></div></div>' +
      '<style>@keyframes ob-spin{to{transform:rotate(360deg)}}</style>';
    setTimeout(finish, 900);
  }

  /* ---------------- termination + evaluation ---------------- */
  function shouldStop() {
    if (ST.consecBasicMiss >= EARLY_MISS) return true;   // 3 basic misses
    if (ST.asked.length >= HARD_CAP) return true;        // 15 questions
    return false;
  }
  function finish() {
    if (ST.timerInt) { clearInterval(ST.timerInt); ST.timerInt = null; }
    ST.frozen = true;

    var correct = 0, examCorrect = 0, highestDiff = 0;
    ST.asked.forEach(function (a) {
      if (a.correct) {
        correct++;
        if (a.tier === 'exam_prep') examCorrect++;
        if (a.difficulty > highestDiff) highestDiff = a.difficulty;
      }
    });
    var earlyStop = ST.consecBasicMiss >= EARLY_MISS;

    // tier decision
    var track;
    if (earlyStop) {
      track = 'start_from_zero';
    } else {
      var examQs = ST.asked.filter(function (a) { return a.tier === 'exam_prep'; }).length;
      track = (examCorrect >= 4 && examCorrect >= Math.max(1, Math.round(examQs / 2))) ? 'exam_prep' : 'start_from_zero';
    }
    if (correct === 0) { track = 'start_from_zero'; highestDiff = 0; }
    if (correct === ST.asked.length && ST.asked.length >= 10) { track = 'exam_prep'; highestDiff = 5; }

    // CEFR from highest difficulty answered correctly
    var cefrByDiff = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1' };
    var level = cefrByDiff[highestDiff] || 'A1';
    if (track === 'start_from_zero' && (highestDiff <= 2)) level = highestDiff <= 1 ? 'A1' : 'A2';

    var result = { track: track, level: level, score: correct, total: ST.asked.length, earlyStop: earlyStop, completedAt: new Date().toISOString(), lang: ST.lang };
    if (ST.mode === 'true_zero') {
      track = 'start_from_zero';
      level = ST.score >= 7 ? 'A1' : 'A0';
      result.track = track; result.level = level; result.mode = 'true_zero'; result.score = ST.score;
    }
    try { localStorage.setItem('pel_assessment', JSON.stringify(result)); } catch (e) {}
    saveAssessmentRpc(track, level, result);
    renderPaywall(result, earlyStop);
  }
  function saveAssessmentRpc(track, level, blob) {
    try {
      fetch(SB_URL + '/rest/v1/rpc/student_save_assessment', {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY },
        body: JSON.stringify({ p_track: track, p_level: level, p_blob: blob || null })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------------- paywall ---------------- */
  function plansByTier() {
    var rows = (window.PEL_PLANS_DB && PEL_PLANS_DB.length) ? PEL_PLANS_DB : FALLBACK_PLANS;
    var byTier = {};
    rows.forEach(function (r) { (byTier[r.tier] = byTier[r.tier] || []).push(r); });
    return byTier;
  }
  function tierMeta(t) {
    return t === 'exam_prep' ? {
      nameAr: 'التجهيز للاختبارات', nameEn: 'Exam Prep',
      targetAr: 'للمتقدمين المستعدين لـ STEP و TOEFL و IELTS', targetEn: 'Advanced students targeting STEP, TOEFL, IELTS',
      featAr: ['مسارات التجهيز للاختبارات', 'اسيلة محاكاة للامتحان', 'وحدات مصطلحات مستهدفة', 'ترجمة فورية ومراجعة كتابة'],
      featEn: ['Exam prep tracks', 'Mock exam simulator questions', 'Targeted vocabulary modules', 'Instant translation & writing review']
    } : {
      nameAr: 'ابد من الصفر', nameEn: 'Start From 0',
      targetAr: 'للمبتديين من الصفر خطوة بخطوة', targetEn: 'Absolute beginners starting from scratch',
      featAr: ['وصول كامل للوحة التحكم والدروس', 'دروس اساسية غير متقدمة', 'سيناريوهات يومية واقعية', 'ترجمة فورية وشرح بالعربي'],
      featEn: ['Full dashboard & lesson access', 'Baseline non-advanced lessons', 'Daily real-world scenarios', 'Instant translation & Arabic support']
    };
  }
  function durLabel(m) { return m === 1 ? { ar: 'شهر', en: '1 Month' } : (m === 2 ? { ar: 'شهران', en: '2 Months' } : { ar: '3 اشهر', en: '3 Months' }); }
  function perMonthOf(price, m) { return Math.round(price / m); }
  function waLink(text) {
    var c = (window.PEL_SITE && PEL_SITE.whatsapp) || CONTACT;
    return 'https://wa.me/' + c + '?text=' + encodeURIComponent(text);
  }
  function cardHtml(r, tier, level) {
    var ar = ST.lang === 'ar';
    var m = tierMeta(tier); var dl = durLabel(r.duration_months);
    var featured = !!r.featured;
    var pm = perMonthOf(r.price, r.duration_months);
    var html = '<div class="price-card reveal' + (featured ? ' highlight' : '') + '">';
    if (featured) html += '<span class="price-badge">' + (ar ? T('bestValue') : 'Best value') + '</span>';
    html += '<div class="price-name ' + (ar ? 'arabic-h' : '') + '">' + esc(ar ? m.nameAr : m.nameEn) + '</div>';
    html += '<div class="price-term">' + esc(ar ? dl.ar : dl.en) + '</div>';
    html += '<div class="price-desc" style="min-height:42px;">' + esc(ar ? m.targetAr : m.targetEn) + '</div>';
    html += '<div class="price-value"><span class="amount">' + r.price + '<small>' + (ar ? 'ريال' : 'SAR') + '</small></span><span class="per">/ ' + r.duration_months + (ar ? ' اشهر' : ' mo') + '</span></div>';
    html += '<div class="price-save">' + (ar ? 'يعادل' : 'equiv.') + ' ' + pm + ' ' + (ar ? 'ريال شهرياً' : 'SAR / mo') + '</div>';
    if (r.weekly_live_classes > 0) {
      html += '<div style="margin:10px 0;padding:10px 12px;border:1px solid rgba(200,169,106,.35);border-radius:12px;background:rgba(200,169,106,.08);">'
        + '<b style="color:var(--gold);">' + esc(T('classesWeek')) + '</b><br>'
        + '<span style="font-size:.74rem;color:var(--text-muted);">' + esc(T('classesWeekNote')) + '</span></div>';
    } else if (tier === 'exam_prep') {
      html += '<div style="margin:10px 0;font-size:.76rem;color:var(--text-muted);">' + esc(ar ? 'ما فيها حصص مباشرة بهالمدة' : 'No live classes at this duration') + '</div>';
    }
    html += '<ul class="price-list">';
    var feats = ar ? m.featAr : m.featEn;
    for (var f = 0; f < feats.length; f++) html += '<li class="' + (ar ? 'arabic' : '') + '">' + esc(feats[f]) + '</li>';
    html += '</ul>';
    var waText = ar
      ? 'السلام عليكم، اختبرت مستواي بمنصة PEL وطلع لي ' + level + ' (' + (tier === 'exam_prep' ? 'متقدم' : 'مبتدي') + '). ابي اشترك بباقة ' + dl.ar + ' بـ ' + r.price + ' ريال. وش طريقة الدفع؟'
      : 'Hello, I took the PEL assessment and my level is ' + level + ' (' + (tier === 'exam_prep' ? 'advanced' : 'beginner') + '). I want the ' + dl.en + ' plan (' + r.price + ' SAR). How do I pay?';
    html += '<a href="' + waLink(waText) + '" target="_blank" rel="noopener" class="' + (featured ? 'btn-gold' : 'btn-outline') + ' magnetic" data-magnetic>' + esc(T('enroll')) + '</a>';
    html += '<div style="margin-top:10px;font-size:.72rem;color:var(--text-muted);">' + esc(T('activatedNote')) + '</div>';
    html += '</div>';
    return html;
  }
  function renderPaywall(result, earlyStop) {
    var ar = ST.lang === 'ar';
    var byTier = plansByTier();
    var rec = result.track;
    var other = rec === 'exam_prep' ? 'start_from_zero' : 'exam_prep';
    var recRows = (byTier[rec] || []).slice().sort(function (a, b) { return a.duration_months - b.duration_months; });
    var otherRows = (byTier[other] || []).slice().sort(function (a, b) { return a.duration_months - b.duration_months; });

    body.innerHTML =
      '<div style="text-align:center;">' +
        '<div class="ob-title" style="font-size:1.4rem;">' + esc(ar ? 'خطتك جاهزة' : 'Your plan is ready') + '</div>' +
        '<div style="margin:10px 0 4px;font-size:.9rem;color:var(--text-muted);">' + esc(T('yourLevel')) + ': <b style="color:var(--gold);">' + result.level + '</b></div>' +
        '<div style="font-size:.86rem;color:var(--text-secondary);max-width:520px;margin:0 auto;">' + esc(rec === 'exam_prep' ? T('resultExam') : (earlyStop ? T('earlyStop') : T('resultBeginner'))) + '</div>' +
      '</div>' +
      '<div style="margin:22px 0 6px;font-size:.8rem;font-weight:700;color:var(--gold);">' + esc(T('recommended')) + '</div>' +
      '<div class="pricing-grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:16px;" dir="' + (ar ? 'rtl' : 'ltr') + '">' + recRows.map(function (r) { return cardHtml(r, rec, result.level); }).join('') + '</div>' +
      (otherRows.length ? '<div style="margin:26px 0 6px;font-size:.8rem;font-weight:700;color:var(--text-muted);">' + esc(T('chooseOther')) + '</div><div class="pricing-grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:16px;" dir="' + (ar ? 'rtl' : 'ltr') + '">' + otherRows.map(function (r) { return cardHtml(r, other, result.level); }).join('') + '</div>' : '') +
      '<div style="margin:26px 0 0;padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;">' +
        '<div style="font-weight:700;">' + esc(T('buyCredits')) + '</div>' +
        '<a href="' + waLink(ar ? 'السلام عليكم، ابي اشتري رصيد حصص مباشرة اضافية. وش المتوفر؟' : 'Hello, I want to buy extra live class credits. What is available?') + '" target="_blank" rel="noopener" class="btn-outline magnetic" data-magnetic style="margin-top:10px;display:inline-block;">' + esc(T('buyCreditsCta')) + '</a>' +
      '</div>' +
      '<div class="ob-save-cta" style="margin-top:22px;display:flex;gap:10px;justify-content:center;">' +
        '<button class="ob-back" data-a="retake">' + esc(T('retake')) + '</button>' +
        '<button class="ob-next" data-a="close">' + esc(T('close')) + '</button>' +
      '</div>';
  }

  /* ---------------- fallback data (offline / DB down) ---------------- */
  var FALLBACK_PLANS = [
    { tier: 'start_from_zero', duration_months: 1, price: 89, weekly_live_classes: 0, featured: false },
    { tier: 'start_from_zero', duration_months: 2, price: 139, weekly_live_classes: 0, featured: false },
    { tier: 'start_from_zero', duration_months: 3, price: 169, weekly_live_classes: 0, featured: true },
    { tier: 'exam_prep', duration_months: 1, price: 89, weekly_live_classes: 0, featured: false },
    { tier: 'exam_prep', duration_months: 2, price: 139, weekly_live_classes: 0, featured: false },
    { tier: 'exam_prep', duration_months: 3, price: 169, weekly_live_classes: 1, featured: true }
  ];
  var FALLBACK_QUESTIONS = [
    { code: 'q01', tier: 'beginner', level: 'A1', difficulty_rating: 1, question_en: 'She ___ to school every day.', question_ar: 'هي ___ للمدرسة كل يوم.', options: [{ en: 'go', ar: 'go' }, { en: 'goes', ar: 'goes' }, { en: 'going', ar: 'going' }, { en: 'gone', ar: 'gone' }], correct_index: 1 },
    { code: 'q09', tier: 'exam_prep', level: 'B1', difficulty_rating: 3, question_en: 'Choose: I ___ to London last year.', question_ar: 'اختار: I ___ to London last year.', options: [{ en: 'have been', ar: 'have been' }, { en: 'went', ar: 'went' }, { en: 'go', ar: 'go' }, { en: 'going', ar: 'going' }], correct_index: 1 }
  ];

  /* True-zero track: Arabic meaning -> pick the correct English pronunciation
     written in Arabic transliteration (Saudi/Abha casual, no hamza, no em
     dash). Options are transliterations in Arabic script so a learner who
     cannot read English letters can still be placed by ear. */
  var TRUE_ZERO_QUESTIONS = [
    { code: 'tz01', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'Good morning - pick the correct pronunciation',
      question_ar: '«صباح الخير» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'قود مورنينق', ar: 'قود مورنينق' }, { en: 'قود نايت', ar: 'قود نايت' }, { en: 'هلو ثير', ar: 'هلو ثير' }, { en: 'سي يو', ar: 'سي يو' }], correct_index: 0 },
    { code: 'tz02', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'How are you - pick the correct pronunciation',
      question_ar: '«كيف حالك» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'هاو اولد ار يو', ar: 'هاو اولد ار يو' }, { en: 'هاو ار يو', ar: 'هاو ار يو' }, { en: 'وات ار يو', ar: 'وات ار يو' }, { en: 'هاو از يور', ar: 'هاو از يور' }], correct_index: 1 },
    { code: 'tz03', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'Thank you - pick the correct pronunciation',
      question_ar: '«شكرا لك» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'سوري يو', ar: 'سوري يو' }, { en: 'هلو يو', ar: 'هلو يو' }, { en: 'ثانك يو', ar: 'ثانك يو' }, { en: 'باي باي', ar: 'باي باي' }], correct_index: 2 },
    { code: 'tz04', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'What is your name - pick the correct pronunciation',
      question_ar: '«وش اسمك» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'وات از يور نيم', ar: 'وات از يور نيم' }, { en: 'وير از يور نيم', ar: 'وير از يور نيم' }, { en: 'هوز يور نيم', ar: 'هوز يور نيم' }, { en: 'وات يو نيم', ar: 'وات يو نيم' }], correct_index: 0 },
    { code: 'tz05', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'Nice to meet you - pick the correct pronunciation',
      question_ar: '«فرصة سعيدة» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'نايس تو سي يو', ar: 'نايس تو سي يو' }, { en: 'نايس تو ايت يو', ar: 'نايس تو ايت يو' }, { en: 'نايس تو ميت هيم', ar: 'نايس تو ميت هيم' }, { en: 'نايس تو ميت يو', ar: 'نايس تو ميت يو' }], correct_index: 3 },
    { code: 'tz06', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'Where is the bathroom - pick the correct pronunciation',
      question_ar: '«وين الحمام» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'وير از ذا بدروم', ar: 'وير از ذا بدروم' }, { en: 'وير از ذا باثروم', ar: 'وير از ذا باثروم' }, { en: 'وات از ذا باثروم', ar: 'وات از ذا باثروم' }, { en: 'وين از ذا باثروم', ar: 'وين از ذا باثروم' }], correct_index: 1 },
    { code: 'tz07', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'How much - pick the correct pronunciation',
      question_ar: '«بكذا» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'هاو مني', ar: 'هاو مني' }, { en: 'هاو لونق', ar: 'هاو لونق' }, { en: 'هاو متش', ar: 'هاو متش' }, { en: 'هاو ار يو', ar: 'هاو ار يو' }], correct_index: 2 },
    { code: 'tz08', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'I do not understand - pick the correct pronunciation',
      question_ar: '«ما فهمت» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'اي دونت اندرستاند', ar: 'اي دونت اندرستاند' }, { en: 'اي كان اندرستاند', ar: 'اي كان اندرستاند' }, { en: 'اي دونت نو', ar: 'اي دونت نو' }, { en: 'اي دونت لايك', ar: 'اي دونت لايك' }], correct_index: 0 },
    { code: 'tz09', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'Can you help me - pick the correct pronunciation',
      question_ar: '«تقدر تساعدني» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'دو يو هلب مي', ar: 'دو يو هلب مي' }, { en: 'كان يو هلب مي', ar: 'كان يو هلب مي' }, { en: 'ويل يو هلب مي', ar: 'ويل يو هلب مي' }, { en: 'كان يو سي مي', ar: 'كان يو سي مي' }], correct_index: 1 },
    { code: 'tz10', tier: 'true_zero', level: 'A0', difficulty_rating: 1,
      question_en: 'See you later - pick the correct pronunciation',
      question_ar: '«اشوفك بعدين» - اختار النطق الصح بالانجليزي',
      options: [{ en: 'سي يو ناو', ar: 'سي يو ناو' }, { en: 'سي يو توداي', ar: 'سي يو توداي' }, { en: 'سي يو يستردي', ar: 'سي يو يستردي' }, { en: 'سي يو ليتير', ar: 'سي يو ليتير' }], correct_index: 3 }
  ];

  /* ---------------- delegation ---------------- */
  body.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-a]') : null;
    if (!el) return;
    var a = el.getAttribute('data-a');
    ev.preventDefault();
    if (ST.frozen && a !== 'close' && a !== 'retake') return;
    if (a === 'start') { renderGate(); return; }
    if (a === 'gate-yes') { ST.mode = 'adaptive'; ST.pool = (window.PEL_QUESTIONS && PEL_QUESTIONS.length) ? PEL_QUESTIONS : FALLBACK_QUESTIONS; renderQuestion(); return; }
    if (a === 'gate-no') { ST.mode = 'true_zero'; ST.lang = 'ar'; overlay.setAttribute('dir','rtl'); ST.pool = TRUE_ZERO_QUESTIONS; ST.target = 1; renderQuestion(); return; }
    if (a === 'opt') {
      var i = +el.getAttribute('data-i');
      body.querySelectorAll('.ob-option').forEach(function (b) { b.style.borderColor = ''; b.style.background = ''; });
      el.style.borderColor = 'var(--gold)'; el.style.background = 'rgba(200,169,106,.1)';
      var nb = body.querySelector('[data-a="next"]');
      if (nb) { nb.disabled = false; nb.dataset.chosen = i; }
      return;
    }
    if (a === 'next') {
      var cur = ST.current;
      if (!cur) { renderEvaluating(); return; }
      var chosen = el.dataset.chosen;
      if (chosen == null || chosen === '') {
        var hl = body.querySelector('.ob-option[style*="rgba(200,169,106"]');
        chosen = hl ? hl.getAttribute('data-i') : null;
      }
      if (chosen == null) return; // require a selection
      answer(cur, +chosen);
      ST.current = null;
      if (shouldStop()) { renderEvaluating(); }
      else { renderQuestion(); }
      return;
    }
    if (a === 'retake') { open(); return; }
    if (a === 'close') { close(); return; }
  });
  overlay.querySelector('.onboard-scrim').addEventListener('click', close);
  var oc = document.getElementById('onboardClose');
  if (oc) oc.addEventListener('click', close);

  // CAPTURE-phase interceptor: runs before onboard.js bubble handler.
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-open-path]') : null;
    if (!el) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    open();
  }, true);
})();
