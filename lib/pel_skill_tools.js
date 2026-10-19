/* PEL simplified skill tools: Listening, Reading and Grammar.
   Each tool is one focused screen at a time with a short, fixed method,
   instead of long menus and everything shown at once.
   Usage: PELSkillTools.make({tracks, articles, topics}) returns
   {listening(el), reading(el), grammar(el)} renderers. */
(function(){
'use strict';

var CSS = [
'.sk-wrap{max-width:820px;margin:0 auto}',
'.sk-list{display:flex;flex-direction:column;gap:10px}',
'.sk-row{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:14px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer;text-align:start;transition:border-color .25s ease,background .25s ease}',
'.sk-row:hover{border-color:var(--gold);background:rgba(200,169,106,.06)}',
'.sk-row .ico{width:38px;height:38px;border-radius:12px;border:1px solid rgba(200,169,106,.4);display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0}',
'.sk-row b{display:block;font-size:.95rem}',
'.sk-row small{display:block;color:var(--text-muted);font-size:.76rem;margin-top:2px}',
'.sk-row .best{margin-inline-start:auto;font-size:.74rem;color:var(--emerald);font-weight:700}',
'.sk-back{margin-bottom:14px}',
'.sk-steps{display:flex;gap:8px;margin:0 0 20px}',
'.sk-step{flex:1;padding:10px 12px;border-radius:12px;border:1px solid var(--border);background:var(--card);font-size:.78rem;color:var(--text-muted);text-align:center}',
'.sk-step.on{border-color:var(--gold);color:var(--gold-soft);background:rgba(200,169,106,.08)}',
'.sk-step.done{border-color:var(--emerald);color:var(--emerald)}',
'.sk-card{padding:28px;border-radius:20px;border:1px solid var(--border);background:var(--card-elevated)}',
'.sk-card h3{font-size:1.35rem;margin-bottom:6px}',
'.sk-lead{font-size:.9rem;line-height:1.9;color:var(--text-secondary);margin-bottom:20px}',
'.sk-lead .arabic{display:block;color:var(--text)}',
'.sk-play{width:84px;height:84px;border-radius:50%;border:1px solid var(--gold);background:linear-gradient(135deg,var(--gold-soft),var(--gold));color:#1a1405;display:flex;align-items:center;justify-content:center;margin:6px auto 14px;cursor:pointer}',
'.sk-speed{display:flex;justify-content:center;gap:8px;margin-bottom:18px}',
'.sk-chip{padding:7px 14px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--text-muted);font-size:.76rem;font-weight:600;cursor:pointer}',
'.sk-chip.on{border-color:var(--gold);color:var(--gold-soft);background:rgba(200,169,106,.1)}',
'.sk-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 26px;border-radius:999px;font-weight:700;font-size:.86rem;cursor:pointer;border:1px solid var(--gold);color:#1a1405;background:linear-gradient(135deg,var(--gold-soft),var(--gold))}',
'.sk-btn.alt{background:transparent;color:var(--text);border-color:var(--border)}',
'.sk-center{text-align:center}',
'.sk-line{padding:14px 16px;border-radius:14px;border:1px solid var(--border);background:var(--card);margin-bottom:10px;cursor:pointer}',
'.sk-line.now{border-color:var(--gold);background:rgba(200,169,106,.1)}',
'.sk-line .en{font-size:1.08rem;line-height:1.7;direction:ltr;text-align:left}',
'.sk-line .tr{font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;color:var(--gold-soft);font-size:.92rem;margin-top:4px;display:none}',
'.sk-wrap.tr .sk-line .tr{display:block}',
'.sk-line .ar{font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;color:var(--text-secondary);font-size:.92rem;margin-top:4px;display:none}',
'.sk-line.show .ar{display:block}',
'.sk-hint{font-size:.76rem;color:var(--text-muted);margin:2px 0 14px}',
'.sk-q{font-weight:600;margin-bottom:12px;font-size:.95rem}',
'.sk-q small{display:block;font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;color:var(--text-muted);font-weight:400}',
'.sk-opt{display:block;width:100%;text-align:left;padding:13px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);margin-bottom:8px;cursor:pointer;font-size:.9rem;direction:ltr;line-height:1.6}',
'.sk-opt.ok{border-color:var(--emerald);background:rgba(63,140,114,.14)}',
'.sk-opt.no{border-color:var(--danger,#d25c5c);background:rgba(210,92,92,.12)}',
'.sk-score{font-family:Fraunces,serif;font-size:2.6rem;color:var(--gold-soft);margin:6px 0}',
'.sk-read{font-size:1.12rem;line-height:2;direction:ltr;text-align:left}',
'.sk-read p{margin:0 0 14px;padding:10px 12px;border-radius:12px;cursor:pointer;transition:background .2s ease}',
'.sk-read p:hover{background:rgba(200,169,106,.08)}',
'.sk-read .sub{display:none;font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;font-size:.9rem;line-height:1.8;color:var(--text-secondary);margin-top:6px}',
'.sk-read .sub i{display:block;font-style:normal;color:var(--gold-soft)}',
'.sk-read p.show .sub{display:block}',
'.sk-timer{display:inline-flex;gap:6px;align-items:center;font-size:.8rem;color:var(--text-muted);margin-bottom:12px}',
'.sk-tabs{display:flex;gap:8px;margin-bottom:18px}',
'.sk-rule{padding:14px 16px;border-radius:12px;background:rgba(200,169,106,.07);border:1px solid rgba(200,169,106,.25);margin-bottom:14px;line-height:1.8;font-size:.9rem}',
'.sk-rule .a{font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;display:block;color:var(--text)}',
'.sk-rule .e{display:block;color:var(--text-secondary);font-size:.84rem;margin-top:4px;direction:ltr;text-align:left}',
'.sk-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}',
'.sk-wrong{padding:14px;border-radius:12px;border:1px solid rgba(210,92,92,.4);background:rgba(210,92,92,.08);text-decoration:line-through;text-decoration-color:rgba(210,92,92,.6);direction:ltr;text-align:left;font-size:.92rem}',
'.sk-right{padding:14px;border-radius:12px;border:1px solid rgba(63,140,114,.5);background:rgba(63,140,114,.1);direction:ltr;text-align:left;font-size:.92rem}',
'.sk-lab{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);display:block;margin-bottom:6px;text-decoration:none}',
'.sk-nav{display:flex;justify-content:space-between;gap:10px;margin-top:20px;flex-wrap:wrap}',
'.sk-watch{margin:0 0 14px;padding:0;list-style:none;font-size:.82rem;color:var(--text-muted);line-height:1.8;direction:ltr;text-align:left}',
'@media(max-width:560px){.sk-card{padding:20px}.sk-pair{grid-template-columns:1fr}}'
].join('\n');

function css(){ if(document.getElementById('pelSkCss')) return; var s=document.createElement('style'); s.id='pelSkCss'; s.textContent=CSS; document.head.appendChild(s); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function bi(a,e){ return '<span class="arabic">'+esc(a)+'</span>، '+esc(e); }
function icons(){ try{ if(window.lucide&&window.lucide.createIcons) window.lucide.createIcons(); }catch(e){} }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function lsGet(k){ try{ return JSON.parse(localStorage.getItem(k)||'{}'); }catch(e){ return {}; } }
function lsSet(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
var gen = 0;
function stop(){ gen++; try{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }catch(e){} }
function say(text, rate, done){
  if(!('speechSynthesis' in window)){ if(done) done(); return; }
  var u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=rate||0.9;
  try{ var v=window.speechSynthesis.getVoices().filter(function(x){return /^en-US/i.test(x.lang);})[0]; if(v) u.voice=v; }catch(e){}
  var once=false, f=function(){ if(once) return; once=true; if(done) done(); }; u.onend=f; u.onerror=f; window.speechSynthesis.speak(u);
}
function head(eyebrowAr, eyebrowEn, h1, subAr, subEn){
  return '<div class="page-head"><span class="eyebrow">'+bi(eyebrowAr,eyebrowEn)+'</span><h1 dir="ltr">'+esc(h1)+'</h1>'+
   '<p><span class="arabic" style="display:block;margin-bottom:4px;">'+esc(subAr)+'</span><span dir="ltr">'+esc(subEn)+'</span></p></div>';
}
function stepper(labels, cur){
  return '<div class="sk-steps">'+labels.map(function(l,i){ return '<div class="sk-step'+(i===cur?' on':(i<cur?' done':''))+'">'+(i+1)+'. '+bi(l[0],l[1])+'</div>'; }).join('')+'</div>';
}
function backBtn(id){ return '<button type="button" class="btn-ghost sk-back" id="'+id+'">'+bi('رجوع','Back')+'</button>'; }
function words(s){ return String(s).trim().split(/\s+/).filter(Boolean).length; }

function make(data){
  css();
  var TR = data.tracks||[], AR = data.articles||[], TP = data.topics||[];

  /* ---------------- LISTENING ---------------- */
  function listening(el){
    el.dataset.rendered='1'; stop();
    var best = lsGet('pel_sk_listen');
    function list(){
      el.innerHTML='<div class="sk-wrap">'+head('ركن الاستماع','Listening Lounge','Listen first, read second','اسمع بدون ما تقرا، بعدين اقرا، بعدين اختبر نفسك.','Listen without reading, then read, then test yourself.')+
        '<div class="sk-list">'+TR.map(function(t){
          return '<button type="button" class="sk-row" data-track="'+esc(t.id)+'"><span class="ico"><i data-lucide="headphones" width="18" height="18"></i></span><span><b dir="ltr">'+esc(t.title)+'</b><small>'+t.lines.length+' lines</small></span>'+(best[t.id]!=null?'<span class="best">'+best[t.id]+'/3</span>':'')+'</button>';
        }).join('')+'</div></div>'; icons();
      el.querySelectorAll('[data-track]').forEach(function(b){ b.addEventListener('click', function(){ open(TR.filter(function(t){return t.id===b.dataset.track;})[0]); }); });
    }
    function open(t){
      var st={step:0, rate:0.85, tr:true};
      var LAB=[['اسمع','Listen'],['اقرا وكرر','Read and repeat'],['اختبر','Test']];
      function draw(){
        stop();
        var h=backBtn('skB')+'<div class="sk-wrap'+(st.tr?' tr':'')+'">'+stepper(LAB,st.step)+'<div class="sk-card"><h3 dir="ltr">'+esc(t.title)+'</h3>';
        if(st.step===0){
          h+='<p class="sk-lead"><span class="arabic">النص مخفي. اسمع وحاول تمسك الفكره العامه، مو كل كلمه.</span><span dir="ltr">The text is hidden on purpose. Catch the main idea, not every word.</span></p>'+
            '<button type="button" class="sk-play" id="skPlay" aria-label="Play"><i data-lucide="play" width="34" height="34"></i></button>'+
            '<div class="sk-speed">'+[[0.7,'Slow'],[0.85,'Normal'],[1,'Fast']].map(function(r){ return '<button type="button" class="sk-chip'+(st.rate===r[0]?' on':'')+'" data-r="'+r[0]+'">'+r[1]+'</button>'; }).join('')+'</div>'+
            '<div class="sk-center"><button type="button" class="sk-btn" id="skNext">'+bi('سمعتها','I listened')+'</button></div>';
        } else if(st.step===1){
          h+='<p class="sk-hint"><span class="arabic">اضغط اي جمله تسمعها. اضغط مرتين لاظهار المعنى.</span> <span dir="ltr">Tap a line to hear it. Double tap for the meaning.</span></p>'+
            '<div class="sk-speed" style="justify-content:flex-start"><button type="button" class="sk-chip'+(st.tr?' on':'')+'" id="skTr">'+bi('النطق بالعربي','Arabic sound')+'</button></div>'+
            t.lines.map(function(l,i){ return '<div class="sk-line" data-i="'+i+'"><div class="en">'+esc(l.en)+'</div><div class="tr">'+esc(l.translit||'')+'</div><div class="ar">'+esc(l.ar||'')+'</div></div>'; }).join('')+
            '<div class="sk-nav"><button type="button" class="sk-btn alt" id="skPlayAll">'+bi('شغل الكل','Play all')+'</button><button type="button" class="sk-btn" id="skNext">'+bi('ابدا الاختبار','Start the test')+'</button></div>';
        } else {
          h+='<div id="skQuiz"></div>';
        }
        h+='</div></div>';
        el.innerHTML=h; icons();
        document.getElementById('skB').addEventListener('click', list);
        var nx=document.getElementById('skNext'); if(nx) nx.addEventListener('click', function(){ st.step++; draw(); });
        if(st.step===0){
          document.getElementById('skPlay').addEventListener('click', function(){
            stop(); var my=gen, i=0; (function nxt(){ if(my!==gen||i>=t.lines.length) return; say(t.lines[i].en, st.rate, function(){ i++; setTimeout(nxt,350); }); })();
          });
          el.querySelectorAll('[data-r]').forEach(function(b){ b.addEventListener('click', function(){ st.rate=parseFloat(b.dataset.r); el.querySelectorAll('[data-r]').forEach(function(c){ c.classList.toggle('on', c===b); }); }); });
        } else if(st.step===1){
          var wrap=el.querySelector('.sk-wrap');
          document.getElementById('skTr').addEventListener('click', function(){ st.tr=!st.tr; wrap.classList.toggle('tr', st.tr); this.classList.toggle('on', st.tr); });
          el.querySelectorAll('.sk-line').forEach(function(ln){
            var last=0;
            ln.addEventListener('click', function(){
              var now=Date.now(); if(now-last<350){ ln.classList.toggle('show'); } last=now;
              el.querySelectorAll('.sk-line').forEach(function(x){ x.classList.toggle('now', x===ln); }); stop(); say(t.lines[parseInt(ln.dataset.i,10)].en, st.rate);
            });
          });
          document.getElementById('skPlayAll').addEventListener('click', function(){
            stop(); var my=gen, i=0, rows=el.querySelectorAll('.sk-line');
            (function nxt(){ if(my!==gen||i>=t.lines.length){ rows.forEach(function(x){x.classList.remove('now');}); return; } rows.forEach(function(x,j){ x.classList.toggle('now', j===i); }); say(t.lines[i].en, st.rate, function(){ i++; setTimeout(nxt,300); }); })();
          });
        } else { quiz(); }
      }
      function quiz(){
        var pool=[]; TR.forEach(function(x){ if(x!==t) x.lines.forEach(function(l){ pool.push(l.en); }); });
        var qs=shuffle(t.lines).slice(0,3).map(function(l){
          var ds=shuffle(pool.filter(function(p){return p!==l.en;})).slice(0,2);
          return {line:l.en, opts:shuffle([l.en].concat(ds))};
        });
        var qi=0, score=0, box=document.getElementById('skQuiz');
        function q(){
          if(qi>=qs.length){
            best=lsGet('pel_sk_listen'); if(best[t.id]==null||score>best[t.id]){ best[t.id]=score; lsSet('pel_sk_listen',best); }
            box.innerHTML='<div class="sk-center"><div class="sk-score">'+score+' / '+qs.length+'</div><p class="sk-lead"><span class="arabic">'+(score===qs.length?'ممتاز! اذنك ماسكه الجمل.':'كرر المرحله 1 و2 وجرب مرة ثانية.')+'</span></p>'+
              '<button type="button" class="sk-btn" id="skAgain">'+bi('جرب مرة ثانية','Try again')+'</button> <button type="button" class="sk-btn alt" id="skList">'+bi('مقاطع ثانية','More tracks')+'</button></div>';
            document.getElementById('skAgain').addEventListener('click', function(){ st.step=0; draw(); });
            document.getElementById('skList').addEventListener('click', list); return;
          }
          var cur=qs[qi];
          box.innerHTML='<div class="sk-q">'+bi('وش الجمله اللي سمعتها؟','Which sentence did you hear?')+' ('+(qi+1)+'/'+qs.length+')</div>'+
            '<div class="sk-center" style="margin-bottom:14px"><button type="button" class="sk-play" id="skQp" style="width:64px;height:64px" aria-label="Play"><i data-lucide="play" width="26" height="26"></i></button></div>'+
            cur.opts.map(function(o){ return '<button type="button" class="sk-opt" data-ok="'+(o===cur.line?1:0)+'">'+esc(o)+'</button>'; }).join('');
          icons(); say(cur.line, 0.85);
          document.getElementById('skQp').addEventListener('click', function(){ stop(); say(cur.line, 0.85); });
          box.querySelectorAll('.sk-opt').forEach(function(b){ b.addEventListener('click', function(){
            box.querySelectorAll('.sk-opt').forEach(function(x){ x.disabled=true; if(x.dataset.ok==='1') x.classList.add('ok'); });
            if(b.dataset.ok==='1') score++; else b.classList.add('no');
            setTimeout(function(){ qi++; q(); }, 1100);
          }); });
        }
        q();
      }
      draw();
    }
    list();
  }

  /* ---------------- READING ---------------- */
  function reading(el){
    el.dataset.rendered='1'; stop();
    var best = lsGet('pel_sk_read');
    function list(){
      el.innerHTML='<div class="sk-wrap">'+head('ركن القراءه','Reading Corner','Read, time yourself, check','اقرا بصوت هادي، شوف سرعتك، وبعدين اختبر فهمك.','Read quietly, see your speed, then check your understanding.')+
        '<div class="sk-list">'+AR.map(function(a){
          var n=0; a.body.forEach(function(b){ n+=words(b.en); });
          return '<button type="button" class="sk-row" data-article="'+esc(a.id)+'"><span class="ico"><i data-lucide="book-text" width="18" height="18"></i></span><span><b dir="ltr">'+esc(a.title)+'</b><small>'+esc(a.topic)+' · '+n+' words</small></span>'+(best[a.id]?'<span class="best">'+best[a.id].wpm+' wpm</span>':'')+'</button>';
        }).join('')+'</div></div>'; icons();
      el.querySelectorAll('[data-article]').forEach(function(b){ b.addEventListener('click', function(){ open(AR.filter(function(a){return a.id===b.dataset.article;})[0]); }); });
    }
    function open(a){
      var total=0; a.body.forEach(function(b){ total+=words(b.en); });
      var t0=Date.now(), LAB=[['اقرا','Read'],['اختبر','Check']];
      var h=backBtn('skB')+'<div class="sk-wrap">'+stepper(LAB,0)+'<div class="sk-card"><h3 dir="ltr">'+esc(a.title)+'</h3>'+
        '<p class="sk-hint"><span class="arabic">اقرا بالانجليزي اول. اذا وقفت، اضغط على الفقره تطلع لك الترجمه.</span> <span dir="ltr">Read the English first. If you get stuck, tap a paragraph for help.</span></p>'+
        '<div class="sk-timer"><i data-lucide="timer" width="14" height="14"></i><span id="skT">0:00</span></div>'+
        '<div class="sk-read">'+a.body.map(function(b){ return '<p>'+esc(b.en)+'<span class="sub"><i>'+esc(b.translit||'')+'</i>'+esc(b.ar||'')+'</span></p>'; }).join('')+'</div>'+
        '<div class="sk-center"><button type="button" class="sk-btn" id="skDone">'+bi('خلصت','I finished')+'</button></div></div></div>';
      el.innerHTML=h; icons();
      var tm=setInterval(function(){ var s=Math.floor((Date.now()-t0)/1000), l=document.getElementById('skT'); if(!l){ clearInterval(tm); return; } l.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); },1000);
      document.getElementById('skB').addEventListener('click', function(){ clearInterval(tm); list(); });
      el.querySelectorAll('.sk-read p').forEach(function(p){ p.addEventListener('click', function(){ p.classList.toggle('show'); }); });
      document.getElementById('skDone').addEventListener('click', function(){
        clearInterval(tm); var secs=Math.max(5,Math.round((Date.now()-t0)/1000)), wpm=Math.round(total/(secs/60)); check(a, wpm, secs);
      });
    }
    function check(a, wpm, secs){
      var pool=[]; AR.forEach(function(x){ if(x!==a) x.body.forEach(function(b){ pool.push(b.en); }); });
      var qs=shuffle(a.body).slice(0,3).map(function(b){ var ds=shuffle(pool).slice(0,2); return {line:b.en, opts:shuffle([b.en].concat(ds))}; });
      var qi=0, score=0;
      el.innerHTML=backBtn('skB')+'<div class="sk-wrap">'+stepper([['اقرا','Read'],['اختبر','Check']],1)+'<div class="sk-card" id="skQ"></div></div>';
      document.getElementById('skB').addEventListener('click', list);
      var box=document.getElementById('skQ');
      function q(){
        if(qi>=qs.length){
          best=lsGet('pel_sk_read'); if(!best[a.id]||wpm>best[a.id].wpm){ best[a.id]={wpm:wpm}; lsSet('pel_sk_read',best); }
          box.innerHTML='<div class="sk-center"><div class="sk-score">'+score+' / '+qs.length+'</div><p class="sk-lead"><span class="arabic">سرعتك: '+wpm+' كلمه بالدقيقه. القراءه الهادية الواضحه الي تفهم فيها اهم من السرعه.</span><span dir="ltr">Your speed: '+wpm+' words per minute. Understanding matters more than speed.</span></p>'+
            '<button type="button" class="sk-btn" id="skAgain">'+bi('اقرا مرة ثانية','Read again')+'</button> <button type="button" class="sk-btn alt" id="skList">'+bi('مقالات ثانية','More articles')+'</button></div>';
          document.getElementById('skAgain').addEventListener('click', function(){ open(a); });
          document.getElementById('skList').addEventListener('click', list); return;
        }
        var cur=qs[qi];
        box.innerHTML='<div class="sk-q">'+bi('وش الجمله اللي كانت بالمقال؟','Which sentence was in the article?')+' ('+(qi+1)+'/'+qs.length+')</div>'+
          cur.opts.map(function(o){ return '<button type="button" class="sk-opt" data-ok="'+(o===cur.line?1:0)+'">'+esc(o)+'</button>'; }).join('');
        box.querySelectorAll('.sk-opt').forEach(function(b){ b.addEventListener('click', function(){
          box.querySelectorAll('.sk-opt').forEach(function(x){ x.disabled=true; if(x.dataset.ok==='1') x.classList.add('ok'); });
          if(b.dataset.ok==='1') score++; else b.classList.add('no');
          setTimeout(function(){ qi++; q(); }, 1000);
        }); });
      }
      q();
    }
    list();
  }

  /* ---------------- GRAMMAR ---------------- */
  var SOUND_IDS=['p-vs-b','f-vs-v','th-sound','r-vs-l','silent-letters','word-stress','sentence-stress','connected-speech','american-reductions','short-vowels','long-vowels','g-vs-j','s-vs-sh','ed-endings','flap-t'];
  function grammar(el){
    el.dataset.rendered='1'; stop();
    var tab='rules', cur=null;
    function tabsHtml(){
      return '<div class="sk-tabs"><button type="button" class="sk-chip'+(tab==='rules'?' on':'')+'" data-tab="rules">'+bi('قواعد','Rules')+'</button><button type="button" class="sk-chip'+(tab==='sounds'?' on':'')+'" data-tab="sounds">'+bi('اصوات','Sounds')+'</button>'+
        (data.coach?'<button type="button" class="sk-chip'+(tab==='coach'?' on':'')+'" data-tab="coach">'+bi('مدرب الاغلاط','Mistake Coach')+'</button>':'')+'</div>';
    }
    function wireTabs(){ el.querySelectorAll('[data-tab]').forEach(function(b){ b.addEventListener('click', function(){ tab=b.dataset.tab; list(); }); }); }
    function list(){
      cur=null;
      if(tab==='coach' && data.coach){
        data.coach();
        var ph=el.querySelector('.page-head'); if(ph) ph.remove();
        var gg=el.querySelector('#grammarGrid'); if(gg) gg.remove();
        el.insertAdjacentHTML('afterbegin','<div class="sk-wrap">'+tabsHtml()+'</div>'); wireTabs(); return;
      }
      var items=TP.filter(function(g){ return (SOUND_IDS.indexOf(g.id)>=0)===(tab==='sounds'); });
      var done=lsGet('pel_sk_gram');
      el.innerHTML='<div class="sk-wrap">'+head('اكاديميه القواعد','Grammar Academy','One rule at a time','قاعده وحده كل مرة: اقراها، شوف الغلط والصح، وجاوب.','One rule at a time: read it, see wrong and right, answer.')+
        tabsHtml()+
        '<div class="sk-list">'+items.map(function(g,i){ return '<button type="button" class="sk-row" data-topic="'+esc(g.id)+'"><span class="ico">'+(i+1)+'</span><span><b dir="ltr">'+esc(g.title)+'</b></span>'+(done[g.id]?'<span class="best">Done</span>':'')+'</button>'; }).join('')+'</div></div>';
      wireTabs();
      el.querySelectorAll('[data-topic]').forEach(function(b){ b.addEventListener('click', function(){ open(b.dataset.topic); }); });
    }
    function open(id){
      var g=TP.filter(function(x){return x.id===id;})[0]; if(!g) return list();
      var group=TP.filter(function(x){ return (SOUND_IDS.indexOf(x.id)>=0)===(SOUND_IDS.indexOf(g.id)>=0); });
      var idx=group.indexOf(g), prev=group[idx-1], next=group[idx+1], answered=false;
      var opts=shuffle([{t:g.wrong,ok:0},{t:g.right,ok:1}]);
      el.innerHTML=backBtn('skB')+'<div class="sk-wrap"><div class="sk-card"><div class="sk-hint">'+(idx+1)+' / '+group.length+'</div><h3 dir="ltr">'+esc(g.title)+'</h3>'+
        '<div class="sk-rule"><span class="e" style="margin:0 0 6px">'+esc(g.rule)+'</span><span class="a">'+esc(g.saudi||'')+'</span></div>'+
        '<div class="sk-pair"><div class="sk-wrong"><span class="sk-lab">Wrong</span>'+esc(g.wrong)+'</div><div class="sk-right"><span class="sk-lab">Right</span>'+esc(g.right)+'</div></div>'+
        ((g.mistakes&&g.mistakes.length)?'<ul class="sk-watch">'+g.mistakes.slice(0,3).map(function(m){return '<li>'+esc(m)+'</li>';}).join('')+'</ul>':'')+
        '<div class="sk-q">'+bi('وش الجمله الصح؟','Which sentence is correct?')+'</div><div id="skO">'+opts.map(function(o){ return '<button type="button" class="sk-opt" data-ok="'+o.ok+'">'+esc(o.t)+'</button>'; }).join('')+'</div>'+
        '<div class="sk-nav"><button type="button" class="sk-btn alt" id="skPrev"'+(prev?'':' disabled style="opacity:.4"')+'>'+bi('السابق','Previous')+'</button><button type="button" class="sk-btn" id="skNx"'+(next?'':' disabled style="opacity:.4"')+'>'+bi('التالي','Next')+'</button></div></div></div>';
      document.getElementById('skB').addEventListener('click', list);
      if(prev) document.getElementById('skPrev').addEventListener('click', function(){ open(prev.id); });
      if(next) document.getElementById('skNx').addEventListener('click', function(){ open(next.id); });
      el.querySelectorAll('.sk-opt').forEach(function(b){ b.addEventListener('click', function(){
        if(answered) return; answered=true;
        el.querySelectorAll('.sk-opt').forEach(function(x){ if(x.dataset.ok==='1') x.classList.add('ok'); });
        if(b.dataset.ok!=='1') b.classList.add('no'); else { var d=lsGet('pel_sk_gram'); d[g.id]=1; lsSet('pel_sk_gram',d); }
      }); });
      window.scrollTo({top:0});
    }
    list();
  }

  return { listening:listening, reading:reading, grammar:grammar, stop:stop };
}
window.PELSkillTools = { make: make };
})();
