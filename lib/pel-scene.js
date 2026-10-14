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

  /* voice tunnel: wordmark octagons flying toward the viewer, drawn on one small canvas */
  function tunnel(root){
    var cv=root.querySelector('canvas.vt-cv'); if(!cv||!cv.getContext) return;
    var ctx=cv.getContext('2d'); var o=watch(root);
    var W=2,H=2,dpr=1,col=[200,169,106],N=(weak||coarse)?9:15,PN=(weak||coarse)?14:30;
    var tx=0,ty=0,cx=0,cy=0,ptr=0,last=0,t0=performance.now(),pulseAt=-9999,parts=[];
    for(var i=0;i<PN;i++) parts.push({a:Math.random()*Math.PI*2,s:.05+Math.random()*.09,o:Math.random()});
    function readCol(){ var v=getComputedStyle(document.documentElement).getPropertyValue('--gold').trim(); var m=/^#?([0-9a-f]{6})$/i.exec(v); if(m){ var n=parseInt(m[1],16); col=[n>>16,(n>>8)&255,n&255]; } }
    function size(){ var r=cv.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,1.5); W=Math.max(2,Math.round(r.width*dpr)); H=Math.max(2,Math.round(r.height*dpr)); cv.width=W; cv.height=H; if(RM) draw(2500); }
    function octPath(x,y,s,rot){ var c=s*.3,pts=[[-s+c,-s],[s-c,-s],[s,-s+c],[s,s-c],[s-c,s],[-s+c,s],[-s,s-c],[-s,-s+c]],ca=Math.cos(rot),sa=Math.sin(rot);
      ctx.beginPath(); for(var k=0;k<8;k++){ var px=pts[k][0]*ca-pts[k][1]*sa+x, py=pts[k][0]*sa+pts[k][1]*ca+y; if(k) ctx.lineTo(px,py); else ctx.moveTo(px,py); } ctx.closePath(); }
    function rgba(a){ return 'rgba('+col[0]+','+col[1]+','+col[2]+','+a.toFixed(3)+')'; }
    function draw(now){
      var t=(now-t0)/1000, base=Math.min(W,H)*.5, mx=W/2, my=H/2;
      ctx.clearRect(0,0,W,H);
      for(var k=0;k<N;k++){
        var p=((k/N)+t*.06)%1, e=p*p, s=base*(.04+1.04*e), al=Math.sin(Math.PI*Math.min(1,p*1.12))*(p<.5?1:1-(p-.5)*.6);
        octPath(mx+cx*p*dpr*2.2, my+cy*p*dpr*2.2, s, t*.1+p*.9);
        ctx.lineWidth=(.7+p*1.7)*dpr; ctx.strokeStyle=rgba(al*.8); ctx.stroke();
      }
      for(var i=0;i<parts.length;i++){ var q=parts[i], pp=(q.o+t*q.s)%1, d=base*(.1+1.25*pp*pp), sz=(1.2+pp*3.2)*dpr, aa=Math.sin(Math.PI*pp)*.9;
        ctx.fillStyle=rgba(aa); ctx.fillRect(mx+Math.cos(q.a+t*.05)*d+cx*pp*dpr*2.2-sz/2, my+Math.sin(q.a+t*.05)*d+cy*pp*dpr*2.2-sz/2, sz, sz); }
      var pa=(now-pulseAt)/1100; if(pa>=0&&pa<1){ var ps=base*(.1+1.3*pa); octPath(mx,my,ps,t*.1); ctx.lineWidth=(3.2-2.2*pa)*dpr; ctx.strokeStyle=rgba((1-pa)*.9); ctx.stroke(); }
    }
    readCol(); size();
    if('ResizeObserver' in window) new ResizeObserver(size).observe(cv); else window.addEventListener('resize',size);
    new MutationObserver(function(){ readCol(); if(RM) draw(2500); }).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    window.addEventListener('vt:pulse',function(){ pulseAt=performance.now(); });
    if(RM){ draw(2500); return; }
    root.addEventListener('pointermove',function(e){ var r=root.getBoundingClientRect(); cx=((e.clientX-r.left)/r.width-.5)*28; cy=((e.clientY-r.top)/r.height-.5)*22; ptr=performance.now(); },{passive:true});
    root.addEventListener('pointerleave',function(){ ptr=0; },{passive:true});
    var gap=(weak||coarse)?40:33;
    (function loop(now){ requestAnimationFrame(loop);
      if(!o.vis||document.hidden||now-last<gap) return; last=now;
      if(!ptr||now-ptr>3000){ var tt=(now-t0)/1000; cx+=(Math.sin(tt/4.1)*10-cx)*.05; cy+=(Math.cos(tt/5.3)*7-cy)*.05; }
      draw(now);
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
