/* PEL Practice Studio: puts the separate Listening, Reading, Speaking and
   Grammar tools into ONE guided loop around a real-life scenario.
   Hear it (listening) -> Read it (reading) -> Say it (speaking) -> Fix it (grammar).
   Each step deep-links into the existing tool and opens the exact item.
   A small bar on the tool page shows the step and a Next button. */
(function(){
'use strict';

var SCENARIOS = [
 {id:'airport',  en:'At the Airport', ar:'في المطار',   icon:'plane',        listen:'airport-announcement', read:'travel',          speak:'airport-officer', gram:'modal-verbs',
  why:{ar:'من الاعلان لين تكلم الموظف بثقه.', en:'From the announcement to talking to the officer.'}},
 {id:'hotel',    en:'Hotel Check-in', ar:'في الفندق',   icon:'bed',          listen:'hotel-checkin',        read:'new-city',        speak:'receptionist',    gram:'question-formation',
  why:{ar:'احجز وتسجل وتسال بدون ما ترتبك.', en:'Check in and ask questions without freezing.'}},
 {id:'restaurant',en:'At the Restaurant', ar:'في المطعم', icon:'utensils',   listen:'coffee-order',         read:'restaurant-visit',speak:'waiter',          gram:'some-any',
  why:{ar:'اطلب اكلك وتفهم الويتر.', en:'Order your food and understand the waiter.'}},
 {id:'coffee',   en:'Coffee Order', ar:'طلب قهوه',      icon:'coffee',       listen:'coffee-order',         read:'restaurant-visit',speak:'coffee-barista',  gram:'countable-uncountable',
  why:{ar:'اطلب قهوتك بالحجم والنوع.', en:'Order your coffee by size and type.'}},
 {id:'taxi',     en:'Taking a Taxi', ar:'في التاكسي',   icon:'car',          listen:'taxi-ride',            read:'new-city',        speak:'taxi-driver',     gram:'prepositions-place',
  why:{ar:'قل وين تبي تروح وتفهم الطريق.', en:'Say where you are going and follow directions.'}},
 {id:'doctor',   en:'Seeing a Doctor', ar:'عند الدكتور',icon:'stethoscope',  listen:'doctor-visit',         read:'health',          speak:'doctor',          gram:'present-simple',
  why:{ar:'اشرح وش تحس فيه بوضوح.', en:'Explain how you feel clearly.'}},
 {id:'job',      en:'Job Interview', ar:'مقابلة وظيفة', icon:'briefcase',    listen:'job-interview',        read:'first-job',       speak:'job-interviewer', gram:'past-simple',
  why:{ar:'جاوب على الاسئلة وانت واثق.', en:'Answer interview questions with confidence.'}}
];
var STEPS = [
 {k:'listen', view:'listening', icon:'headphones',      ar:'اسمعها', en:'Hear it',  whyAr:'ودرب اذنك على الجمل الحقيقية.',        whyEn:'Train your ear on real sentences.'},
 {k:'read',   view:'reading',   icon:'book-text',       ar:'اقراها', en:'Read it',  whyAr:'شوف نفس الكلمات مكتوبة.',                whyEn:'See the same words in writing.'},
 {k:'speak',  view:'speaking',  icon:'messages-square', ar:'قولها',  en:'Say it',   whyAr:'جرب الموقف بصوتك.',                     whyEn:'Try the situation with your voice.'},
 {k:'gram',   view:'grammar',   icon:'spell-check',     ar:'صححها',  en:'Fix it',   whyAr:'افهم القاعده اللي تغلط فيها.',           whyEn:'Understand the rule you usually miss.'}
];

var CSS = [
'.ps-wrap{max-width:1000px;margin:0 auto}',
'.ps-hero{padding:26px;border-radius:20px;border:1px solid rgba(200,169,106,.4);background:linear-gradient(160deg,rgba(200,169,106,.1),transparent 60%),var(--card);margin-bottom:26px}',
'.ps-eyebrow{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}',
'.ps-hero h2{font-size:1.7rem;margin-bottom:4px}',
'.ps-why{font-size:.88rem;color:var(--text-secondary);line-height:1.8;margin-bottom:20px}',
'.ps-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}',
'.ps-step{position:relative;padding:18px;border-radius:16px;border:1px solid var(--border);background:var(--card-elevated);cursor:pointer;text-align:start;color:var(--text);transition:border-color .25s ease,transform .25s ease}',
'.ps-step:hover{border-color:var(--gold);transform:translateY(-2px)}',
'.ps-step.done{border-color:var(--emerald)}',
'.ps-n{width:30px;height:30px;border-radius:50%;border:1px solid rgba(200,169,106,.5);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:var(--gold);margin-bottom:10px}',
'.ps-step.done .ps-n{background:var(--emerald);border-color:var(--emerald);color:#fff}',
'.ps-step h4{font-size:1.02rem;margin-bottom:2px}',
'.ps-step .a{font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;font-size:.82rem;line-height:1.7;color:var(--text);display:block;margin-top:6px}',
'.ps-step .e{font-size:.74rem;color:var(--text-muted);display:block;margin-top:4px;direction:ltr;text-align:left}',
'.ps-go{margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}',
'.ps-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;font-weight:700;font-size:.85rem;cursor:pointer;border:1px solid var(--gold);color:#1a1405;background:linear-gradient(135deg,var(--gold-soft),var(--gold))}',
'.ps-prog{font-size:.78rem;color:var(--text-muted)}',
'.ps-h{font-size:1.05rem;margin:0 0 14px}',
'.ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}',
'.ps-sc{padding:16px;border-radius:14px;border:1px solid var(--border);background:var(--card);cursor:pointer;text-align:start;color:var(--text);transition:.25s ease}',
'.ps-sc:hover,.ps-sc.on{border-color:var(--gold);background:rgba(200,169,106,.08)}',
'.ps-sc .ico{width:34px;height:34px;border-radius:10px;border:1px solid rgba(200,169,106,.4);display:flex;align-items:center;justify-content:center;color:var(--gold);margin-bottom:10px}',
'.ps-sc b{display:block;font-size:.92rem}',
'.ps-sc .a{font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;font-size:.8rem;color:var(--text-muted);display:block;margin-top:2px}',
'.ps-bar{position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:10px 16px;margin:0 0 18px;border-radius:14px;border:1px solid rgba(200,169,106,.45);background:var(--card-elevated);box-shadow:0 10px 24px -16px rgba(0,0,0,.6)}',
'.ps-bar .t{flex:1;min-width:160px;font-size:.82rem;color:var(--text-secondary)}',
'.ps-bar .t b{color:var(--gold-soft)}',
'.ps-bar button{padding:8px 16px;border-radius:999px;font-weight:700;font-size:.78rem;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--text)}',
'.ps-bar button.go{border-color:var(--gold);color:#1a1405;background:linear-gradient(135deg,var(--gold-soft),var(--gold))}',
'.ps-hl{outline:2px solid var(--gold);outline-offset:4px;border-radius:16px}'
].join('\n');

function css(){ if(document.getElementById('pelPracticeCss')) return; var s=document.createElement('style'); s.id='pelPracticeCss'; s.textContent=CSS; document.head.appendChild(s); }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function bi(a,e){ return '<span class="arabic">'+esc(a)+'</span>، '+esc(e); }
function icons(){ try{ if(window.lucide&&window.lucide.createIcons) window.lucide.createIcons(); }catch(e){} }
function today(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function dayIndex(){ return Math.floor(Date.now()/86400000); }
function load(){ try{ return JSON.parse(localStorage.getItem('pel_practice')||'{}'); }catch(e){ return {}; } }
function save(o){ try{ localStorage.setItem('pel_practice', JSON.stringify(o)); }catch(e){} }
function findSc(id){ return SCENARIOS.filter(function(s){return s.id===id;})[0]; }
function doneSet(scId){ var st=load(); return (st.day===today() && st.sc===scId && st.done) ? st.done : []; }
function markDone(scId,k){ var st=load(); if(st.day!==today()||st.sc!==scId){ st={day:today(),sc:scId,done:[],pick:st.pick}; } if(st.done.indexOf(k)<0) st.done.push(k); save(st); }

var ctx = { goToView:null, active:null };

function removeBars(){ document.querySelectorAll('.ps-bar').forEach(function(b){ b.remove(); }); }
function addBar(view, sc, idx){
  var host=document.getElementById('view-'+view); if(!host) return;
  removeBars();
  var step=STEPS[idx], last = idx===STEPS.length-1, bar=document.createElement('div');
  bar.className='ps-bar';
  bar.innerHTML='<div class="t"><b>'+esc(sc.en)+'</b> · Step '+(idx+1)+' of '+STEPS.length+': <span class="arabic">'+esc(step.ar)+'</span> ('+esc(step.en)+')</div>'+
    '<button type="button" data-a="studio">'+bi('الاستوديو','Studio')+'</button>'+
    '<button type="button" class="go" data-a="next">'+(last?bi('خلصت','Finish'):bi('الخطوه التالية','Next step'))+'</button>';
  host.insertBefore(bar, host.firstChild);
  bar.querySelector('[data-a=studio]').addEventListener('click', function(){ removeBars(); ctx.active=null; ctx.goToView('practice'); });
  bar.querySelector('[data-a=next]').addEventListener('click', function(){
    markDone(sc.id, step.k);
    if(last){ removeBars(); ctx.active=null; ctx.goToView('practice'); } else openStep(sc, idx+1);
  });
}
function openStep(sc, idx){
  var step=STEPS[idx]; ctx.active={sc:sc.id, idx:idx};
  ctx.goToView(step.view);
  var host=document.getElementById('view-'+step.view);
  setTimeout(function(){
    try{
      var id = sc[step.k], el=null;
      if(step.k==='listen') el=host.querySelector('[data-track="'+id+'"]');
      else if(step.k==='read') el=host.querySelector('[data-article="'+id+'"]');
      else if(step.k==='speak'){
        el=host.querySelector('[data-persona="'+id+'"]');
        if(!el){ var chips=host.querySelectorAll('[data-spk-group]'); for(var ci=0; ci<chips.length && !el; ci++){ chips[ci].click(); el=host.querySelector('[data-persona="'+id+'"]'); } }
      }
      else if(step.k==='gram') el=host.querySelector('[data-topic="'+id+'"]');
      if(el) el.click();
    }catch(e){}
    addBar(step.view, sc, idx);
  }, 60);
}

function render(root, opts){
  css(); if(opts && opts.goToView) ctx.goToView=opts.goToView;
  removeBars();
  var scId = (load().pick) || SCENARIOS[dayIndex() % SCENARIOS.length].id;
  var sc = findSc(scId) || SCENARIOS[0], done = doneSet(sc.id);
  root.dataset.rendered='1';
  root.innerHTML = '<div class="ps-wrap"><div class="page-head"><span class="eyebrow">'+bi('ملعب التدريب','Practice Studio')+'</span>'+
    '<h1 dir="ltr">One situation, four skills</h1>'+
    '<p><span class="arabic" style="display:block;margin-bottom:4px;">بدل ما تتنقل بين الادوات، خذ موقف واحد من الحياه وتدرب عليه بالترتيب: اسمع، اقرا، تكلم، صحح.</span>'+
    '<span dir="ltr">Instead of jumping between tools, take one real situation and practice it in order: hear, read, speak, fix.</span></p></div>'+
    '<div class="ps-hero"><div class="ps-eyebrow">'+bi('جلسة اليوم','Today\'s session')+'</div><h2 dir="ltr">'+esc(sc.en)+' <span class="arabic" style="font-size:.7em;color:var(--text-secondary)">'+esc(sc.ar)+'</span></h2>'+
    '<p class="ps-why"><span class="arabic" style="display:block">'+esc(sc.why.ar)+'</span><span dir="ltr">'+esc(sc.why.en)+'</span></p>'+
    '<div class="ps-steps">'+STEPS.map(function(s,i){ var d=done.indexOf(s.k)>=0;
      return '<button type="button" class="ps-step'+(d?' done':'')+'" data-i="'+i+'"><div class="ps-n">'+(d?'<i data-lucide="check" width="16" height="16"></i>':(i+1))+'</div><h4 dir="ltr">'+esc(s.en)+'</h4><span class="a">'+esc(s.ar)+': '+esc(s.whyAr)+'</span><span class="e">'+esc(s.whyEn)+'</span></button>';
    }).join('')+'</div>'+
    '<div class="ps-go"><button type="button" class="ps-btn" id="psStart"><i data-lucide="play" width="16" height="16"></i>'+bi(done.length?'كمل الجلسه':'ابدا الجلسه',done.length?'Continue session':'Start session')+'</button>'+
    '<span class="ps-prog">'+done.length+' / '+STEPS.length+' <span class="arabic">خطوات</span></span></div></div>'+
    '<h4 class="ps-h">'+bi('او اختر موقف ثاني','Or pick another situation')+'</h4>'+
    '<div class="ps-grid">'+SCENARIOS.map(function(s){
      return '<button type="button" class="ps-sc'+(s.id===sc.id?' on':'')+'" data-sc="'+s.id+'"><div class="ico"><i data-lucide="'+s.icon+'" width="18" height="18"></i></div><b dir="ltr">'+esc(s.en)+'</b><span class="a">'+esc(s.ar)+'</span></button>';
    }).join('')+'</div></div>';
  icons();
  root.querySelectorAll('[data-sc]').forEach(function(b){ b.addEventListener('click', function(){ var st=load(); st.pick=b.dataset.sc; save(st); render(root); }); });
  root.querySelectorAll('.ps-step').forEach(function(b){ b.addEventListener('click', function(){ openStep(sc, parseInt(b.dataset.i,10)); }); });
  root.querySelector('#psStart').addEventListener('click', function(){
    var next=0; for(var i=0;i<STEPS.length;i++){ if(done.indexOf(STEPS[i].k)<0){ next=i; break; } }
    openStep(sc, next);
  });
}

window.PELPracticeStudio = { render: render, scenarios: SCENARIOS, steps: STEPS };
})();
