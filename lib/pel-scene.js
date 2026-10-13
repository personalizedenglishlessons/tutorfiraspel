/* PEL scene controller: pointer/idle parallax for the voice tunnel, pause when hidden, speak button, tilt. */
(function(){
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
  var weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=2) || (navigator.deviceMemory && navigator.deviceMemory<=2);
  var stages = [];
  function watch(el){ if(!el) return; var o={el:el,vis:true}; stages.push(o);
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ o.vis=es[0].isIntersecting; el.classList.toggle('paused',!o.vis); },{rootMargin:'80px'}).observe(el); } return o; }
  document.addEventListener('visibilitychange',function(){ stages.forEach(function(o){ o.el.classList.toggle('paused',document.hidden||!o.vis); }); });

  /* voice tunnel parallax: one style write per frame, only while visible */
  function tunnel(root){
    var world=root.querySelector('.vt-world'); if(!world) return;
    var o=watch(root); if(weak||coarse) root.classList.add('lite');
    if(RM) return;
    var tx=0,ty=0,cx=0,cy=0,last=0,ptr=0,t0=performance.now(), gap=(weak||coarse)?33:16;
    root.addEventListener('pointermove',function(e){ var r=root.getBoundingClientRect(); ty=((e.clientX-r.left)/r.width-.5)*14; tx=-((e.clientY-r.top)/r.height-.5)*10; ptr=performance.now(); },{passive:true});
    root.addEventListener('pointerleave',function(){ ptr=0; },{passive:true});
    (function loop(now){ requestAnimationFrame(loop);
      if(!o.vis||document.hidden||now-last<gap) return; last=now;
      var t=(now-t0)/1000;
      if(!ptr||now-ptr>3500){ ty=Math.sin(t/4.3)*5; tx=Math.sin(t/3.1)*2.5; }
      cx+=(tx-cx)*.07; cy+=(ty-cy)*.07;
      world.style.setProperty('--rx',cx.toFixed(2)+'deg'); world.style.setProperty('--ry',cy.toFixed(2)+'deg');
    })(performance.now());
  }

  /* card tilt on hover (desktop only) */
  function tilt(el){ if(coarse||RM) return; el.classList.add('tilt');
    el.addEventListener('pointermove',function(e){ var r=el.getBoundingClientRect(); el.style.setProperty('--ty',(((e.clientX-r.left)/r.width-.5)*8).toFixed(2)+'deg'); el.style.setProperty('--tx',(-((e.clientY-r.top)/r.height-.5)*6).toFixed(2)+'deg'); },{passive:true});
    el.addEventListener('pointerleave',function(){ el.style.setProperty('--tx','0deg'); el.style.setProperty('--ty','0deg'); },{passive:true}); }

  /* speak */
  function say(text,btn){
    if(!('speechSynthesis' in window)) return;
    try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=.88;
      var v=speechSynthesis.getVoices().filter(function(x){ return /^en[-_]US/i.test(x.lang); })[0]; if(v) u.voice=v;
      if(btn){ btn.classList.add('on'); u.onend=u.onerror=function(){ btn.classList.remove('on'); }; }
      speechSynthesis.speak(u); }catch(e){}
  }
  document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-say]'); if(!b) return; e.preventDefault(); var t=b.getAttribute('data-say')||(document.getElementById(b.getAttribute('data-say-from'))||{}).textContent; if(t) say(t,b); });

  window.PELSCENE={ tunnel:tunnel, tilt:tilt, watch:watch, say:say };
  function boot(){ document.querySelectorAll('.vt').forEach(tunnel); document.querySelectorAll('.rc-stage').forEach(watch); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
