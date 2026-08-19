/* ============================================================
   PEL — PUBLIC ONBOARDING + RETURNING-STUDENT HOME (index.html)
   Defer-loaded right after pel-personalization.js.

   A visitor answers a short questionnaire (+ optional placement),
   sees a matched plan and route preview, and saves it to this
   device (pel_plan). The app adopts that plan on first login.

   A returning student (plan + onboardingCompleted present) sees
   their live route + next lesson above the fold instead.
   ============================================================ */
(function(){
  'use strict';
  var E = window.PEL_ENGINE;
  if(!E) return;

  function $(id){ return document.getElementById(id); }
  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
  function lsJson(k){ try{ var s = localStorage.getItem(k); if(!s) return null; return JSON.parse(s); }catch(e){ return null; } }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function arNum(n){ return String(n).replace(/\d/g, function(d){ return '٠١٢٣٤٥٦٧٨٩'[d]; }); }
  function prefLang(){ var p = lsJson('pel_account_prefs'); return p && p.lang === 'ar' ? 'ar' : 'en'; }

  var overlay = $('onboardOverlay');
  var obBody = $('onboardBody');
  var planHome = $('planHome');
  if(!overlay || !obBody) return;

  var OB = { step:-1, lang:prefLang(), answers:{}, cur:[], profile:null, route:null, estimate:null, placeDone:false };

  var L = {
    langTitle:{en:'Let\'s build your path', ar:'نبني مسارك'},
    langSub:{en:'Pick the language you feel best in. Your lessons are English; this is just the interface.', ar:'اختر اللغة اللي تحس فيها. دروسك انجليزي، وهذي بس واجهة.'},
    langAr:{en:'Arabic interface', ar:'واجهة عربية'},
    langEn:{en:'English interface', ar:'واجهة انجليزية'},
    privacyNote:{en:'Your answers stay on this device until your teacher opens your account.', ar:'اجاباتك تبقى على جهازك لين ما يفتح لك المعلم حسابك.'},
    back:{en:'Back', ar:'رجوع'},
    next:{en:'Next', ar:'التالي'},
    of10:{en:'of 10', ar:'من ١٠'},
    of8:{en:'of 8', ar:'من ٨'},
    step:{en:'Step', ar:'خطوة'},
    placeIntroTitle:{en:'A quick placement check', ar:'فحص سريع لمستواك'},
    placeIntroSub:{en:'8 short questions. No pressure — this sharpens your starting point before we build the route.', ar:'٨ اسئلة قصيرة بدون ضغط — يحدد نقطة بدايتك بشكل ادق قبل ما نبني المسار.'},
    placeOptional:{en:'Optional · 2 minutes', ar:'اختياري · دقيقتين'},
    takePlace:{en:'Take the check', ar:'اسوي الفحص'},
    skipPlace:{en:'Skip — just give me my plan', ar:'تخطي — ابغى خطتي'},
    building:{en:'Matching your route…', ar:'نبني مسارك…'},
    buildingSub:{en:'PEL is matching your goals, level, real-life needs and available time.', ar:'PEL يطابق اهدافك ومستواك ومواقفك الحقيقية ووقتك المتاح.'},
    planReady:{en:'Your plan is ready', ar:'خطتك جاهزة'},
    planReadySub:{en:'This route comes from your answers and the placement check. Change your pace below — nothing is locked.', ar:'هذا المسار مبني على اجاباتك ونتيجة الفحص. غيّر ايقاعك بالاسفل — ما شيء مقفول.'},
    start:{en:'Starting point', ar:'نقطة البداية'},
    dest:{en:'Your destination', ar:'وجهتك'},
    focus:{en:'Early focus', ar:'التركيز الاولي'},
    track:{en:'Real-life track', ar:'المسار العملي'},
    route:{en:'Your route', ar:'مسارك'},
    seePreview:{en:'See what you\'ll learn', ar:'شوف وش بتتعلم'},
    youHere:{en:'You are here', ar:'انت هنا'},
    est:{en:'Estimated time', ar:'المدة المتوقعة'},
    paceHint:{en:'Change your daily pace to see the estimate update:', ar:'غيّر ايقاعك اليومي وشاهد المدة تتحدث:'},
    min:{en:'min', ar:'دقيقة'},
    weeks:{en:'weeks', ar:'اسابيع'},
    routeLen:{en:'Route length', ar:'طول المسار'},
    studyDays:{en:'Study days', ar:'ايام الدراسة'},
    weekly:{en:'Weekly load', ar:'العب الاسبوعي'},
    lessons:{en:'Lessons', ar:'الدروس'},
    why:{en:'Why this plan', ar:'ليش هالخطة'},
    first:{en:'Your first lesson', ar:'اول درس لك'},
    save:{en:'Save my plan & open the app', ar:'احفظ خطتي وافتح التطبيق'},
    wa:{en:'Ask about enrolling', ar:'اسال عن الانضمام'},
    saveNote:{en:'Saved on this device. After your teacher opens your account, the same plan waits for you inside the app.', ar:'محفوظة على جهازك. بعد ما يفتح لك المعلم حسابك، نفس الخطة تكون بانتظارك داخل التطبيق.'},
    myPlan:{en:'MY PLAN', ar:'خطتي'},
    nextLesson:{en:'Next lesson', ar:'الدرس الجاي'},
    openDash:{en:'Open your dashboard', ar:'افتح لوحتك'},
    adjust:{en:'Adjust my plan', ar:'عدّل خطتي'},
    milestone:{en:'Milestone:', ar:'نقطة الوصول:'},
    progress:{en:'progress through your route', ar:'من مسارك'},
    lessonsDone:{en:'lessons done', ar:'دروس منجزة'},
  };
  function T(k){ return (OB.lang === 'ar' && L[k] && L[k].ar) ? L[k].ar : (L[k] ? L[k].en : k); }

  var SKILL_NAMES = { Speaking:{en:'Speaking',ar:'المحادثة'}, Listening:{en:'Listening',ar:'الاستماع'}, Vocabulary:{en:'Vocabulary',ar:'المفردات'}, Grammar:{en:'Grammar',ar:'القواعد'}, Pronunciation:{en:'Pronunciation',ar:'النطق'}, Writing:{en:'Writing',ar:'الكتابة'} };
  function skillName(s, lng){ var x = SKILL_NAMES[s]; return x ? x[lng] : s; }
  function labelIn(qKey, id, lng){
    var q = E.QUESTIONS.find(function(x){ return x.key === qKey; });
    if(!q) return id;
    for(var i = 0; i < q.options.length; i++){ if(q.options[i].id === id) return lng === 'ar' ? q.options[i].ar : q.options[i].en; }
    return id;
  }
  function outLabel(id, lng){ return labelIn('q9', id, lng); }
  function ctxLabel(id, lng){ return labelIn('q3', id, lng); }
  function lvlInfo(id){ return E.levelInfo(id); }
  function mini(label, val, note){
    var n = note ? '<div class="ob-mini-note">' + esc(note) + '</div>' : '';
    return '<div class="ob-mini"><div class="ob-mini-label">' + esc(label) + '</div><div class="ob-mini-val">' + esc(val) + '</div>' + n + '</div>';
  }
  function estRow(label, value, hint){
    var h = hint ? '<div class="est-hint">' + hint + '</div>' : '';
    return '<div class="est-row"><span>' + label + '</span><b>' + value + '</b>' + h + '</div>';
  }
  function progressBar(pct, label){
    return '<div class="ob-progress"><div class="ob-pbar"><div class="ob-pfill" style="width:' + pct + '%"></div></div><div class="ob-count">' + label + '</div></div>';
  }
  function nav(showBack, nextDisabled, nextAction){
    var html = '<div class="ob-nav">';
    if(showBack) html += '<button class="ob-back" data-action="back">' + T('back') + '</button>';
    var dis = nextDisabled ? ' disabled' : '';
    html += '<button class="ob-next" data-action="' + (nextAction || 'next') + '"' + dis + '>' + T('next') + '</button>';
    html += '</div>';
    return html;
  }

  /* shared route timeline: current / complete / locked (+ preview) */
  function routeTimeline(route, un){
    var html = '';
    route.forEach(function(st, i){
      var cls = i === un.currentStageIndex ? 'current' : (un.completedStages.indexOf(st.key) !== -1 ? 'complete' : 'locked');
      var title = OB.lang === 'ar' ? st.title.ar : st.title.en;
      var n = 0; st.units.forEach(function(u){ n += u.lessonIds.length; });
      var meta = OB.lang === 'ar' ? arNum(n) + ' دروس · مستوى ' + st.level : n + ' lessons · Level ' + st.level;
      if(cls === 'current') meta += (OB.lang === 'ar' ? ' · ' + T('youHere') : ' · ' + T('youHere'));
      html += '<div class="stage-line ' + cls + '">';
      html += '<div class="stage-dot"></div><div class="stage-body">';
      html += '<div class="stage-name">' + esc(title) + '</div>';
      html += '<div class="stage-meta">' + meta + '</div>';
      if(cls === 'locked'){
        html += '<button class="stage-preview-btn" data-action="preview">' + T('seePreview') + '</button>';
        html += '<div class="stage-preview"><div class="stage-preview-links">';
        st.units.forEach(function(u){ u.lessonIds.forEach(function(lid){
          var m = E.lessonMeta(lid);
          if(m) html += '<span>· ' + esc(OB.lang === 'ar' ? m.a : m.t) + '</span>';
        }); });
        html += '</div></div>';
      }
      html += '</div></div>';
    });
    return html;
  }

  /* ---------------- onboarding steps ---------------- */
  function render(){
    if(OB.step === -1){ obBody.innerHTML = renderLang(); return; }
    if(OB.step <= 9){ obBody.innerHTML = renderQuestion(E.QUESTIONS[OB.step]); return; }
    if(OB.step === 10){ obBody.innerHTML = renderPlaceIntro(); return; }
    if(OB.step <= 18){ obBody.innerHTML = renderPlacement(OB.step - 11); return; }
    if(OB.step === 19){ obBody.innerHTML = renderBuilding(); return; }
    if(OB.step === 20){ obBody.innerHTML = renderPlan(); return; }
  }

  function renderLang(){
    return '<div class="ob-eyebrow">PEL · YOUR PATH</div>'
      + '<div class="ob-title">' + T('langTitle') + '</div>'
      + '<div class="ob-sub">' + T('langSub') + '</div>'
      + '<div class="ob-lang-grid">'
      + '<button class="ob-lang-btn" data-action="lang" data-lang="ar"><b>العربية</b><span>' + T('langAr') + '</span></button>'
      + '<button class="ob-lang-btn" data-action="lang" data-lang="en"><b>English</b><span>' + T('langEn') + '</span></button>'
      + '</div>'
      + '<div class="ob-note">' + T('privacyNote') + '</div>';
  }

  function renderQuestion(q){
    var i = OB.step;
    var title = OB.lang === 'ar' ? q.title.ar : q.title.en;
    var sub = OB.lang === 'ar' ? q.sub.ar : q.sub.en;
    var opts = q.options.map(function(o){
      var sel = OB.cur.indexOf(o.id) !== -1;
      return '<button class="ob-option' + (q.multi ? ' multi' : '') + (sel ? ' selected' : '') + '" data-action="option" data-id="' + o.id + '"><span class="ob-check">' + (sel ? '✓' : '') + '</span><span>' + esc(OB.lang === 'ar' ? o.ar : o.en) + '</span></button>';
    }).join('');
    var pct = ((i + 1) / 10) * 100;
    var count = T('step') + ' ' + (OB.lang === 'ar' ? arNum(i + 1) : (i + 1)) + ' ' + T('of10');
    var canNext = OB.cur.length > 0;
    return progressBar(pct, count)
      + '<div class="ob-title" style="margin-top:22px">' + esc(title) + '</div>'
      + '<div class="ob-sub">' + esc(sub) + '</div>'
      + '<div class="ob-options">' + opts + '</div>'
      + nav(i > 0, !canNext);
  }

  function renderPlaceIntro(){
    return '<div class="ob-eyebrow">' + T('placeOptional') + '</div>'
      + '<div class="ob-title">' + T('placeIntroTitle') + '</div>'
      + '<div class="ob-sub">' + T('placeIntroSub') + '</div>'
      + '<div class="ob-save-cta" style="margin-top:26px">'
      + '<button class="ob-next" data-action="placement-yes">' + T('takePlace') + '</button>'
      + '<button class="ob-back" data-action="placement-no" style="margin-left:0">' + T('skipPlace') + '</button>'
      + '</div>';
  }

  function renderPlacement(i){
    var item = E.PLACEMENT[i];
    if(!item) return '';
    var pct = ((i + 1) / 8) * 100;
    var count = T('step') + ' ' + (OB.lang === 'ar' ? arNum(i + 1) : (i + 1)) + ' ' + T('of8');
    var title = OB.lang === 'ar' ? item.q.ar : item.q.en;
    var opts = item.options.map(function(o, idx){
      var sel = OB.cur[0] === idx;
      return '<button class="ob-option' + (sel ? ' selected' : '') + '" data-action="place-option" data-id="' + idx + '"><span class="ob-check">' + (sel ? '✓' : '') + '</span><span>' + esc(OB.lang === 'ar' ? o.ar : o.en) + '</span></button>';
    }).join('');
    var showBack = true;
    return progressBar(pct, count)
      + '<div class="ob-title" style="margin-top:22px">' + esc(title) + '</div>'
      + '<div class="ob-options">' + opts + '</div>'
      + nav(showBack, OB.cur.length === 0, 'place-next');
  }

  function renderBuilding(){
    return '<div class="building"><div class="building-ring"></div><p>' + T('building') + '</p><div class="building-route">' + T('buildingSub') + '</div></div>';
  }

  function renderPlan(){
    var p = OB.profile, r = OB.route, e = OB.estimate, lng = OB.lang;
    if(!p || !r || !e) return '';
    var startLvl = lvlInfo(p.estimatedStartingLevel);
    var goalLvl = lvlInfo(p.targetLevel);
    var focusChips = (p.recommendedFocus || []).map(function(s){ return skillName(s, lng); }).join(' · ');
    var trackChips = (p.realLifeContexts || []).slice(0, 3).map(function(c){ return ctxLabel(c, lng); }).join(' · ');
    var un = E.unlockState(p, r, {});
    var rec = E.recommendNext(p, r, {});
    var why = E.whyPlan(p, r);

    var html = '<div class="ob-eyebrow">' + T('myPlan') + '</div>'
      + '<div class="ob-title">' + T('planReady') + '</div>'
      + '<div class="ob-sub">' + T('planReadySub') + '</div>';

    html += '<div class="ob-cols">';
    html += mini(T('start'), p.estimatedStartingLevel + ' · ' + (lng === 'ar' ? startLvl.ar : startLvl.en), lng === 'ar' ? startLvl.descAr : startLvl.descEn);
    html += mini(T('dest'), p.targetLevel + ' · ' + (lng === 'ar' ? goalLvl.ar : goalLvl.en), T('milestone') + ' ' + outLabel(p.targetOutcome, lng));
    html += mini(T('focus'), focusChips, '');
    html += mini(T('track'), trackChips, '');
    html += '</div>';

    html += '<div class="ob-route-head"><span class="eye">' + T('route') + '</span></div>';
    html += '<div class="path-stages">' + routeTimeline(r, un) + '</div>';

    html += '<div class="ob-route-head"><span class="eye">' + T('est') + '</span></div>';
    html += '<div class="ob-sub" style="margin-top:0">' + T('paceHint') + '</div>';
    html += '<div class="pace-chips">' + [5,10,15,20,30].map(function(m){
      var active = e.dailyMinutes === m ? ' active' : '';
      return '<button class="pace-chip' + active + '" data-action="pace" data-min="' + m + '">' + (lng === 'ar' ? arNum(m) : m) + ' ' + T('min') + '</button>';
    }).join('') + '</div>';
    html += '<div class="est-rows">'
      + estRow(T('routeLen'), '~' + (lng === 'ar' ? arNum(e.weeks) : e.weeks) + ' ' + T('weeks'), '')
      + estRow(T('studyDays'), lng === 'ar' ? arNum(e.days) : e.days, e.dailyMinutes + ' ' + T('min') + ' / ' + e.weeklyFrequency + ' ' + (e.weeklyFrequency === 1 ? 'day' : 'days'))
      + estRow(T('weekly'), e.weeklyMinutes + ' ' + T('min'), '')
      + estRow(T('lessons'), lng === 'ar' ? arNum(e.totalLessons) : e.totalLessons, '')
      + '</div>';

    html += '<div class="ob-first-lesson">'
      + '<div class="fl-label">' + T('first') + '</div>'
      + '<div class="fl-title">' + esc(rec.titleEn) + '</div>'
      + '<div class="fl-academy">' + esc((lng === 'ar' ? (rec.academyAr || '') : (rec.academyEn || '')) + ' · ' + rec.minutes + ' min') + '</div>'
      + '<div class="fl-why">' + esc(lng === 'ar' ? rec.whyAr : rec.whyEn) + '</div>'
      + '</div>';

    html += '<div class="ob-route-head"><span class="eye">' + T('why') + '</span></div>';
    var lines = lng === 'ar' ? why.linesAr : why.linesEn;
    html += '<div class="why-lines">' + lines.map(function(x){ return '<div><span class="why-dot">◆</span><span>' + esc(x) + '</span></div>'; }).join('') + '</div>';

    html += '<div class="ob-save-cta">'
      + '<button class="ob-next" data-action="save">' + T('save') + '</button>'
      + '<a class="btn-wa" target="_blank" rel="noopener" href="https://wa.me/966557178070?text=' + encodeURIComponent('أبي أسال عن الانضمام للمنصة') + '">' + T('wa') + '</a>'
      + '</div>'
      + '<div class="ob-save-note">' + T('saveNote') + '</div>';
    return html;
  }

  /* ---------------- onboarding controls ---------------- */
  function openOnboard(){
    OB.step = -1; OB.lang = prefLang(); OB.answers = {}; OB.cur = []; OB.profile = null; OB.route = null; OB.estimate = null; OB.placeDone = false;
    overlay.setAttribute('dir', OB.lang === 'ar' ? 'rtl' : 'ltr');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    render();
  }
  function closeOnboard(){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function startBuild(){
    OB.answers._placementDone = OB.placeDone;
    var profile = E.buildProfile(OB.answers, { lang: OB.lang, createdAt: new Date().toISOString() });
    var route = E.buildRoute(profile);
    OB.profile = profile; OB.route = route;
    OB.estimate = E.estimateDuration(profile, route);
    OB.step = 20; render();
  }
  function preloadBack(){
    var q = E.QUESTIONS[OB.step];
    var v = OB.answers[q.key];
    OB.cur = q.multi ? (Array.isArray(v) ? v.slice() : (v ? [v] : [])) : (v != null ? [v] : []);
  }
  function savePlan(){
    if(!OB.profile || !OB.route || !OB.estimate) return;
    var plan = { version: 1, onboardingCompleted: true, profile: OB.profile, route: OB.route, estimate: OB.estimate, createdAt: new Date().toISOString() };
    lsSet('pel_plan', JSON.stringify(plan));
    var prefs = lsJson('pel_account_prefs') || {};
    prefs.lang = OB.lang; prefs.learningDirection = 'en'; prefs.direction = 'en';
    lsSet('pel_account_prefs', JSON.stringify(prefs));
    renderPlanHome();
    window.location.href = 'login.html';
  }

  obBody.addEventListener('click', function(ev){
    var el = ev.target.closest ? ev.target.closest('[data-action]') : null;
    if(!el) return;
    var a = el.getAttribute('data-action');
    ev.preventDefault();
    if(a === 'lang'){
      OB.lang = el.getAttribute('data-lang') === 'ar' ? 'ar' : 'en';
      overlay.setAttribute('dir', OB.lang === 'ar' ? 'rtl' : 'ltr');
      OB.step = 0; render();
    } else if(a === 'option'){
      var q = E.QUESTIONS[OB.step];
      if(!q) return;
      var id = el.getAttribute('data-id');
      var idx = OB.cur.indexOf(id);
      if(q.multi){
        if(idx === -1){ if(OB.cur.length < q.max) OB.cur.push(id); }
        else OB.cur.splice(idx, 1);
      } else { OB.cur = [id]; }
      render();
    } else if(a === 'place-option'){
      OB.cur = [+el.getAttribute('data-id')]; render();
    } else if(a === 'next'){
      if(OB.step <= 9){
        var q2 = E.QUESTIONS[OB.step];
        OB.answers[q2.key] = q2.multi ? OB.cur.slice() : OB.cur[0];
        OB.cur = []; OB.step++; render();
      } else if(OB.step === 10){ OB.step = 11; OB.cur = []; render(); }
    } else if(a === 'place-next'){
      var pi = OB.step - 11;
      E.answerPlacement(OB.answers, pi, OB.cur[0]);
      OB.placeDone = true; OB.cur = [];
      if(pi === E.PLACEMENT.length - 1){ OB.step = 19; render(); setTimeout(startBuild, 900); }
      else { OB.step++; render(); }
    } else if(a === 'placement-yes'){ OB.step = 11; OB.cur = []; render(); }
    else if(a === 'placement-no'){ OB.step = 19; render(); setTimeout(startBuild, 900); }
    else if(a === 'back'){
      if(OB.step === 10){ OB.step = 9; }
      else if(OB.step > 0 && OB.step <= 9){ OB.step--; preloadBack(); }
      else if(OB.step === 0){ OB.step = -1; }
      else if(OB.step === 11){ OB.step = 10; }
      else if(OB.step > 11 && OB.step <= 18){ OB.step--; }
      render();
    } else if(a === 'pace'){
      OB.estimate = E.recalcEstimate(OB.profile, OB.route, +el.getAttribute('data-min'));
      render();
    } else if(a === 'save'){
      savePlan();
    }
  });

  /* ---------------- entry points + returning-student home ---------------- */
  overlay.querySelector('.onboard-scrim').addEventListener('click', closeOnboard);
  $('onboardClose').addEventListener('click', closeOnboard);
  document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape' && overlay.classList.contains('show')) closeOnboard(); });

  document.addEventListener('click', function(ev){
    var el = ev.target.closest ? ev.target.closest('[data-open-path]') : null;
    if(!el) return;
    ev.preventDefault();
    var plan = lsJson('pel_plan');
    if(plan && plan.onboardingCompleted){ window.location.href = 'app.html'; return; }
    openOnboard();
  });

  document.addEventListener('click', function(ev){
    var el = ev.target.closest ? ev.target.closest('[data-action="preview"]') : null;
    if(!el) return;
    ev.preventDefault();
    var line = el.closest('.stage-line');
    if(line) line.classList.toggle('open');
  });

  function renderPlanHome(){
    var plan = lsJson('pel_plan');
    if(!plan || !plan.onboardingCompleted || !planHome){ planHome.style.display = 'none'; return; }
    var p = plan.profile, r = plan.route, e = plan.estimate;
    if(!p || !r || !e || !r.length){ planHome.style.display = 'none'; return; }
    var lng = prefLang(); OB.lang = lng;
    var snap = lsJson('pel_plan_snapshot');
    var done = snap && Array.isArray(snap.completedLessons) ? snap.completedLessons : [];
    var un = E.unlockState(p, r, { completedLessons: done });
    var rec = E.recommendNext(p, r, { completedLessons: done });
    var total = e.totalLessons || r.reduce(function(s, st){ return s + st.units.reduce(function(s2, u){ return s2 + u.lessonIds.length; }, 0); }, 0);
    var doneN = Math.max(0, total - un.remainingLessons);
    var pct = total ? Math.round(doneN / total * 100) : 0;
    var startLvl = lvlInfo(p.estimatedStartingLevel);
    var goalLvl = lvlInfo(p.targetLevel);
    var curStage = r[un.currentStageIndex] || r[0];

    var chips = '<span class="ph-chip gold">' + esc(p.estimatedStartingLevel) + ' → ' + esc(p.targetLevel) + '</span>';
    chips += '<span class="ph-chip">' + (lng === 'ar' ? arNum(e.dailyMinutes) : e.dailyMinutes) + ' ' + T('min') + ' · ' + e.weeklyFrequency + '/7</span>';
    (p.recommendedFocus || []).forEach(function(f){ chips += '<span class="ph-chip">' + esc(skillName(f, lng)) + '</span>'; });
    (p.realLifeContexts || []).slice(0, 3).forEach(function(c){ chips += '<span class="ph-chip">' + esc(ctxLabel(c, lng)) + '</span>'; });

    var html = '<div class="plan-home-inner"><div class="ph-grid">';
    html += '<div class="ph-main">';
    html += '<div class="ph-eyebrow">' + T('myPlan') + '</div>';
    html += '<h2 class="ph-title">' + esc(lng === 'ar' ? curStage.title.ar : curStage.title.en) + '</h2>';
    html += '<div class="ph-sub">' + T('milestone') + ' ' + esc(outLabel(p.targetOutcome, lng)) + ' — ' + esc(lng === 'ar' ? goalLvl.descAr : goalLvl.descEn) + '</div>';
    html += '<div class="ph-row">' + chips + '</div>';
    html += '<div class="ph-progress"><div class="ph-pbar"><div class="ph-pfill" style="width:' + pct + '%"></div></div><div class="ph-plabel">' + (lng === 'ar' ? arNum(doneN) : doneN) + ' ' + T('lessonsDone') + ' · ' + (lng === 'ar' ? arNum(pct) : pct) + '% ' + T('progress') + '</div></div>';
    html += '<div class="ph-cta-row">';
    html += '<a class="btn-gold" href="app.html">' + T('openDash') + '</a>';
    html += '<a class="btn-outline" href="app.html#settings">' + T('adjust') + '</a>';
    html += '</div>';
    html += '</div>';

    html += '<div class="ph-side">';
    html += '<div class="ph-card"><div class="ph-eyebrow">' + T('route') + '</div><div class="path-stages">' + routeTimeline(r, un) + '</div></div>';
    html += '<div class="ph-card"><div class="ph-eyebrow">' + T('nextLesson') + '</div><div style="font-weight:700">' + esc(rec.titleEn) + '</div><div class="ph-sub">' + esc(lng === 'ar' ? rec.whyAr : rec.whyEn) + '</div></div>';
    html += '</div>';
    html += '</div></div>';

    planHome.innerHTML = html;
    planHome.style.display = 'block';
  }

  function updatePathLabels(){
    var plan = lsJson('pel_plan');
    if(plan && plan.onboardingCompleted){
      document.querySelectorAll('[data-open-path] span').forEach(function(s){ s.textContent = 'افتح مسارك'; });
    }
  }

  renderPlanHome();
  updatePathLabels();
})();