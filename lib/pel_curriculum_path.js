/* =====================================================================
   PEL CURRICULUM PATH  -  student-facing structured-progression view.
   Non-destructive: adds one sidebar entry + one view (#view-curriculum).
   Renders PEL_BEGINNER_PHASES as a dark/gold roadmap. Completion is read
   ONLY from the real Supabase-backed completedLessons set (via lessonKey).
   No localStorage-as-truth, no fake locking, no fake completion.
   Opted out of the app's hide-arabic logic via the .pel-path class
   (registered in CONTENT_MARK_RE) so Arabic shows in both UI modes.
   ===================================================================== */
(function(){
  if(window.PEL_CURRICULUM_PATH) return;

  var ACADEMY = 'english-foundations';

  function isAr(){
    try{
      if(typeof accountPrefs!=='undefined' && accountPrefs && accountPrefs.lang==='ar') return true;
      if(document.documentElement.dir==='rtl') return true;
      if(document.documentElement.lang==='ar') return true;
    }catch(e){}
    return false;
  }
  function E(s){ return (typeof escapeHtml==='function') ? escapeHtml(s) : String(s==null?'':s); }
  // bilingual label: Arabic span in AR UI, plain English in EN UI
  function L(en, ar){ return isAr() ? '<span class="arabic">'+E(ar)+'</span>' : E(en); }

  function isDone(slug){
    try{
      var key = (typeof lessonKey==='function') ? lessonKey(ACADEMY, slug) : (ACADEMY+'::'+slug);
      return (typeof completedLessons!=='undefined') && completedLessons.has(key);
    }catch(e){ return false; }
  }
  function doneCount(){ try{ return (typeof completedLessons!=='undefined') ? completedLessons.size : 0; }catch(e){ return 0; } }
  function lessonTitle(slug){
    var u = (typeof PEL_BEGINNER_LESSONS!=='undefined') ? PEL_BEGINNER_LESSONS[slug] : null;
    if(u && u.title) return { en:u.title.en||slug, ar:u.title.ar||u.title.en||slug };
    return { en:slug, ar:slug };
  }
  function phases(){
    return (typeof PEL_BEGINNER_PHASES!=='undefined') ? PEL_BEGINNER_PHASES : [];
  }

  function statusLabel(done){
    return done ? L('Complete','تم') : L('Start','ابدأ');
  }

  var VIEW_ID = 'curriculum';
  var el = null;

  var STYLE = '#view-curriculum{padding:30px 22px 64px;max-width:860px;margin:0 auto;width:100%;box-sizing:border-box;}' +
    '.pel-path{color:var(--text);}' +
    '.pel-path-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:26px;padding-bottom:18px;border-bottom:1px solid var(--border);}' +
    '.pel-path-h{font-family:\'Fraunces\',serif;font-size:1.85rem;font-weight:600;margin:0;letter-spacing:-.01em;line-height:1.15;}' +
    '.pel-path-sub{color:var(--text-muted);font-size:.88rem;margin:6px 0 0;}' +
    '.pel-path-tools{display:flex;gap:8px;flex-wrap:wrap;}' +
    '.pel-tool{display:inline-flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--border);color:var(--text-secondary);border-radius:10px;padding:8px 12px;font-size:.8rem;font-weight:500;cursor:pointer;transition:border-color .2s,color .2s,background .2s;}' +
    '.pel-tool:hover{border-color:var(--gold);color:var(--gold);background:rgba(200,169,106,.08);}' +
    '.pel-phase{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px 18px 8px;margin-bottom:16px;}' +
    '.pel-phase-head{display:flex;align-items:center;gap:12px;margin-bottom:14px;}' +
    '.pel-phase-num{flex-shrink:0;width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(200,169,106,.18),rgba(200,169,106,.06));border:1px solid rgba(200,169,106,.3);color:var(--gold);font-size:.85rem;font-weight:700;}' +
    '.pel-phase.done .pel-phase-num{background:linear-gradient(135deg,var(--gold),var(--gold-soft));color:#16161a;border-color:transparent;}' +
    '.pel-phase-titles{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1;}' +
    '.pel-phase-en{font-size:1.02rem;font-weight:600;}' +
    '.pel-phase-ar{font-size:.88rem;color:var(--text-muted);}' +
    '.pel-phase-prog{flex-shrink:0;font-size:.76rem;color:var(--text-muted);background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:20px;padding:3px 10px;white-space:nowrap;direction:ltr;}' +
    '.pel-phase-lessons{display:flex;flex-direction:column;gap:2px;}' +
    '.pel-step{display:flex;align-items:center;gap:11px;width:100%;text-align:start;background:transparent;border:1px solid transparent;border-radius:11px;padding:9px 10px;cursor:pointer;color:var(--text);transition:background .18s,border-color .18s;}' +
    '.pel-step:hover{background:rgba(255,255,255,.035);border-color:var(--border);}' +
    '.pel-step-mark{flex-shrink:0;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--border);background:var(--bg);color:transparent;transition:all .2s;}' +
    '.pel-step.done .pel-step-mark{background:linear-gradient(135deg,var(--gold),var(--gold-soft));border-color:transparent;color:#16161a;}' +
    '.pel-step-body{display:flex;flex-direction:column;gap:0;min-width:0;flex:1;}' +
    '.pel-step-en{font-size:.94rem;font-weight:500;}' +
    '.pel-step-ar{font-size:.82rem;color:var(--text-muted);}' +
    '.pel-step-state{flex-shrink:0;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);}' +
    '.pel-step.done .pel-step-state{color:var(--gold);}' +
    '@media(max-width:640px){.pel-path-h{font-size:1.5rem;}.pel-path-tools{width:100%;}.pel-tool{flex:1;justify-content:center;}}';

  function injectStyle(){
    if(document.getElementById('pelCurriculumPathStyle')) return;
    var s = document.createElement('style'); s.id='pelCurriculumPathStyle'; s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function ensureView(){
    if(el) return el;
    var existing = document.getElementById('view-'+VIEW_ID);
    if(existing){ el = existing; return el; }
    var home = document.getElementById('view-home');
    var parent = home ? home.parentElement : document.querySelector('.view-stack') || document.querySelector('main') || document.body;
    var sec = document.createElement('section');
    sec.className = 'view';
    sec.id = 'view-'+VIEW_ID;
    parent.appendChild(sec);
    el = sec;
    return el;
  }

  function ensureSidebarEntry(){
    var nav = document.getElementById('sidebarNav');
    if(!nav) return;
    if(nav.querySelector('.side-link[data-view="'+VIEW_ID+'"]')) return;
    var a = document.createElement('button');
    a.className = 'side-link';
    a.dataset.view = VIEW_ID;
    a.innerHTML = '<span class="side-icon"><i data-lucide="route" width="18" height="18"></i></span>'+
      '<span class="side-text-wrap"><span class="en">Curriculum</span><span class="ar">المنهج</span></span>';
    // Place it first so the curriculum leads the navigation.
    if(nav.firstChild) nav.insertBefore(a, nav.firstChild);
    else nav.appendChild(a);
    if(typeof lucide!=='undefined' && lucide.createIcons){
      try{ lucide.createIcons({ nodes:[a] }); }catch(e){}
    }
  }

  function renderTools(){
    var dc = doneCount();
    var tools = [
      {view:'vocabulary', en:'Vocabulary', ar:'المفردات', icon:'book-open', minDone:3},
      {view:'review', en:'Smart Review', ar:'المراجعة الذكية', icon:'rotate-ccw', minDone:4},
      {view:'bookmarks', en:'Bookmarks', ar:'المفضلة', icon:'bookmark', minDone:6}
    ];
    var vis = tools.filter(function(t){ return dc >= t.minDone; });
    if(!vis.length) return '';
    return '<div class="pel-path-tools">'+vis.map(function(t){
      return '<button class="pel-tool" data-goto="'+t.view+'">'+
        '<i data-lucide="'+t.icon+'" width="15" height="15"></i> '+L(t.en,t.ar)+'</button>';
    }).join('')+'</div>';
  }

  function render(){
    var v = ensureView(); if(!v) return;
    var ph = phases();
    var totalDone = 0, totalLessons = 0;
    var html = '<div class="pel-path">';

    // Header
    var overall = 0;
    ph.forEach(function(p){ p.lessons.forEach(function(s){ totalLessons++; if(isDone(s)){ totalDone++; overall++; } }); });
    html += '<div class="pel-path-head">'+
      '<div class="pel-path-titles">'+
        '<h1 class="pel-path-h">'+L('Curriculum Path','مسار المنهج')+'</h1>'+
        '<p class="pel-path-sub">'+L(overall+' of '+totalLessons+' lessons complete', overall+' من '+totalLessons+' دروس مكتملة')+'</p>'+
      '</div>'+
      renderTools()+
    '</div>';

    // Roadmap
    html += '<div class="pel-path-road">';
    ph.forEach(function(p, pi){
      var done = 0; p.lessons.forEach(function(s){ if(isDone(s)) done++; });
      html += '<section class="pel-phase'+(done>=p.lessons.length?' done':'')+'">'+
        '<div class="pel-phase-head">'+
          '<span class="pel-phase-num">'+(pi+1)+'</span>'+
          '<div class="pel-phase-titles">'+
            '<span class="pel-phase-en">'+E(p.title.en)+'</span>'+
            '<span class="pel-phase-ar arabic">'+E(p.title.ar)+'</span>'+
          '</div>'+
          '<span class="pel-phase-prog">'+done+' / '+p.lessons.length+'</span>'+
        '</div>'+
        '<div class="pel-phase-lessons">';
      p.lessons.forEach(function(slug, li){
        var done2 = isDone(slug);
        var t = lessonTitle(slug);
        html += '<button class="pel-step'+(done2?' done':'')+'" data-slug="'+E(slug)+'">'+
          '<span class="pel-step-mark">'+(done2?'<svg class="pel-check" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>':'')+'</span>'+
          '<span class="pel-step-body">'+
            '<span class="pel-step-en">'+E(t.en)+'</span>'+
            '<span class="pel-step-ar arabic">'+E(t.ar)+'</span>'+
          '</span>'+
          '<span class="pel-step-state '+(done2?'done':'')+'">'+statusLabel(done2)+'</span>'+
        '</button>';
      });
      html += '</div></section>';
    });
    html += '</div></div>';

    v.innerHTML = html;
    v.classList.add('pel-path');
    v.classList.add('pel-path-root');

    // wire lesson clicks
    v.querySelectorAll('.pel-step[data-slug]').forEach(function(b){
      b.addEventListener('click', function(){
        var slug = b.getAttribute('data-slug');
        if(typeof openLesson==='function') openLesson(ACADEMY, slug);
      });
    });
    // wire tool links
    v.querySelectorAll('.pel-tool[data-goto]').forEach(function(b){
      b.addEventListener('click', function(){ if(typeof goToView==='function') goToView(b.getAttribute('data-goto')); });
    });
    // icons (tools only; checkmark is inline SVG so it never depends on lucide)
    if(typeof lucide!=='undefined' && lucide.createIcons){
      try{ lucide.createIcons({ nodes:[v] }); }catch(e){}
    }
  }

  function open(){
    if(typeof goToView==='function'){ goToView(VIEW_ID); }
    else { ensureView(); render(); }
  }

  // re-render on real progress changes (only if this view is active)
  document.addEventListener('pel-progress-updated', function(){
    try{
      var v = document.getElementById('view-'+VIEW_ID);
      if(v && v.classList.contains('active')) render();
    }catch(e){}
  });

  // register the view renderer + sidebar entry once the app shell is ready
  function wire(){
    injectStyle();
    try{
      if(typeof viewRenderers!=='undefined'){ viewRenderers[VIEW_ID] = render; }
    }catch(e){}
    ensureSidebarEntry();
    ensureView();
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', wire); }
  else { wire(); }

  window.PEL_CURRICULUM_PATH = { render:render, open:open, isDone:isDone };
})();
