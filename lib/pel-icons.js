/* PEL custom icon and illustration set.
   Every shape uses chamfered corners and 45 degree cuts, the same construction as the PEL wordmark.
   UI icons: 24 grid. Pictograms: 64 grid. Illustrations: 96 grid. */
(function(){
  'use strict';
  function cr(x,y,w,h,c){ return 'M'+(x+c)+' '+y+'H'+(x+w-c)+'L'+(x+w)+' '+(y+c)+'V'+(y+h-c)+'L'+(x+w-c)+' '+(y+h)+'H'+(x+c)+'L'+x+' '+(y+h-c)+'V'+(y+c)+'Z'; }
  function oct(cx,cy,r,c){ return cr(cx-r,cy-r,r*2,r*2,c); }
  function P(d,extra){ return '<path d="'+d+'"'+(extra?' '+extra:'')+'/>'; }
  var ACC = 'class="acc"';

  /* ---------- UI icons (24) ---------- */
  var UI = {
    route:   P('M6 16.5L8.5 19L6 21.5L3.5 19Z')+P('M18 2.5L20.5 5L18 7.5L15.5 5Z')+P('M8.5 19H16L18 17V8')+P('M6 16.5V9L8 7H12.5'),
    user:    P('M9 6L10.5 4H13.5L15 6V8.5L13.5 10.5H10.5L9 8.5Z')+P('M4 21V18L7 14.5H17L20 18V21'),
    sun:     P('M10 8H14L16 10V14L14 16H10L8 14V10Z')+P('M12 2V5M12 19V22M2 12H5M19 12H22M5 5L7 7M17 17L19 19M5 19L7 17M17 7L19 5'),
    arrow:   P('M4 12H19M13 5L20 12L13 19'),
    back:    P('M20 12H5M11 5L4 12L11 19'),
    check:   P('M4 12.5L9.5 18L20 6.5'),
    close:   P('M5 5L19 19M19 5L5 19'),
    up:      P('M12 20V5M5 12L12 5L19 12'),
    chat:    P('M4 4H20L21 5V15L20 16H12L7 21V16H4L3 15V5Z')+P('M8.5 10.5H8.6M12 10.5H12.1M15.5 10.5H15.6','stroke-width="2.8"'),
    mic:     P(cr(9,3,6,10,1.5))+P('M5 11V12L9 17H15L19 12V11M12 17V21M8 21H16'),
    shield:  P('M12 2L20 5V12L16 18L12 22L8 18L4 12V5Z')+P('M8.5 11.5L11 14L15.5 9'),
    clock:   P(oct(12,12,9,3.5))+P('M12 7V12L15.5 14'),
    ok:      P(oct(12,12,9,3.5))+P('M8 12.5L11 15.5L16.5 9'),
    no:      P(oct(12,12,9,3.5))+P('M9 9L15 15M15 9L9 15'),
    eye:     P('M2 12L7 6.5H17L22 12L17 17.5H7Z')+P('M10 10H14V14H10Z'),
    eyeoff:  P('M2 12L7 6.5H17L22 12L17 17.5H7Z')+P('M10 10H14V14H10Z')+P('M4 4L20 20'),
    warn:    P('M12 3L22 20H2Z')+P('M12 10V14M12 17V17.5'),
    lock:    P(cr(4,10,16,11,2))+P('M8 10V7L10 4H14L16 7V10')+P('M12 14.5V17'),
    menu:    P('M4 7H20M4 12H20M4 17H14'),
    plus:    P('M12 5V19M5 12H19'),
    speaker: P('M4 9H8L13 5V19L8 15H4Z')+P('M16 9L18 12L16 15M19.5 6L22 12L19.5 18')
  };

  /* ---------- pictograms (64) ---------- */
  var PIC = {
    call:    '<path '+ACC.replace('class="acc"','class="acc"')+' d="M12 14L22 10L28 22L22 27L30 38L37 34L48 40L44 52L34 54L12 30Z"/>'+P('M12 14L22 10L28 22L22 27L30 38L37 34L48 40L44 52L34 54L12 30Z')+P('M40 12H52V24M40 20H46V26','class="wv"'),
    mail:    '<path class="acc" d="'+cr(8,16,48,34,4)+'"/>'+P(cr(8,16,48,34,4))+P('M10 20L32 38L54 20'),
    meeting: '<path class="acc" d="M20 32L24 28H28L32 32V36L28 40H24L20 36Z"/>'+P('M20 24L23 20H26L29 24V27L26 31H23L20 27Z')+P('M38 24L41 20H44L47 24V27L44 31H41L38 27Z')+P('M8 52V46L13 40H33L38 46V52')+P('M33 40H47L52 46V52H44'),
    job:     '<path class="acc" d="'+cr(12,10,40,46,4)+'"/>'+P(cr(12,10,40,46,4))+P('M24 6H40V12H24Z')+P('M20 28H44M20 36H44M20 44H34'),
    plane:   '<path class="acc" d="M6 32L58 8L42 56L30 38Z"/>'+P('M6 32L58 8L42 56L30 38Z')+P('M30 38L58 8'),
    cup:     '<path class="acc" d="M12 22H44V44L40 52H16L12 44Z"/>'+P('M12 22H44V44L40 52H16L12 44Z')+P('M44 28H50L54 32V38L50 42H44')+P('M20 8V16M28 6V16M36 8V16'),
    lecture: '<path class="acc" d="'+cr(6,10,52,34,3)+'"/>'+P(cr(6,10,52,34,3))+P('M16 20H34M16 28H28M40 26L46 20L52 26')+P('M32 44V56M22 56H42'),
    exam:    '<path class="acc" d="M14 6H40L50 16V58H14Z"/>'+P('M14 6H40L50 16V58H14Z')+P('M40 6V16H50')+P('M22 26L26 30L32 22M22 40L26 44L32 36')+P('M38 28H44M38 42H44')
  };

  /* ---------- illustrations (96) ---------- */
  var ILL = {
    student:
      '<path class="acc" d="M48 8L86 26L48 44L10 26Z"/>'+P('M48 8L86 26L48 44L10 26Z')+P('M26 36V48L48 58L70 48V36')+P('M86 26V46')+P('M82 46H90L86 54Z','class="solid"')+
      P(cr(14,62,68,26,4))+P('M48 62V88')+P('M22 71H40M22 79H40M56 71H74M56 79H74','class="ln"'),
    work:
      '<path class="acc" d="'+cr(10,38,68,46,5)+'"/>'+P(cr(10,38,68,46,5))+P('M30 38V28L34 24H54L58 28V38')+P('M10 58H78')+P(cr(38,53,12,10,2),'class="solid"')+
      '<g class="ping">'+P('M62 6H90L92 8V22L90 24H80L74 30V24H62L60 22V8Z')+P('M68 15H68.1M76 15H76.1M84 15H84.1','stroke-width="3"')+'</g>',
    exam:
      '<path class="acc" d="M20 6H60L76 22V90H20Z"/>'+P('M20 6H60L76 22V90H20Z')+P('M60 6V22H76')+P('M30 36L35 41L44 30M30 54L35 59L44 48')+P('M52 36H66M52 54H66','class="ln"')+
      '<g class="pencil">'+P('M64 70L82 52L90 60L72 78L62 82Z','class="solid-soft"')+P('M64 70L82 52L90 60L72 78L62 82Z')+'</g>',
    lesson:
      '<path class="acc" d="'+cr(26,4,44,88,9)+'"/>'+P(cr(26,4,44,88,9))+P('M42 12H54')+
      '<g class="bars"><rect x="34" y="42" width="4" height="12"/><rect x="41" y="34" width="4" height="28"/><rect x="48" y="38" width="4" height="20"/><rect x="55" y="30" width="4" height="36"/><rect x="62" y="44" width="4" height="8"/></g>'+P('M36 76H60','class="ln"')+P('M36 82H52','class="ln"'),
    tutor:
      '<path class="acc" d="'+cr(34,40,56,42,4)+'"/>'+P(cr(8,14,56,42,4))+P(cr(34,40,56,42,4))+
      P('M28 26L31 23H34L37 26V29L34 32H31L28 29Z')+P('M18 50V46L22 42H38')+P('M58 54L61 51H64L67 54V57L64 60H61L58 57Z')+P('M46 76V70L50 66H72L76 70V76')+P('M40 12L50 4M64 6L54 2','class="ln"'),
    life:
      '<path class="acc" d="M8 10H88L92 14V54L88 58H46L28 76V58H8L4 54V14Z"/>'+P('M8 10H88L92 14V54L88 58H46L28 76V58H8L4 54V14Z')+P('M30 34L42 46L66 22','stroke-width="4"')+P('M16 86H80M28 92H68','class="ln"'),
    before:
      '<path class="acc" d="'+cr(30,10,36,68,7)+'"/>'+P(cr(30,10,36,68,7))+P('M42 18H54')+P('M38 40L58 60M58 40L38 60','class="ln"')+
      '<g class="shake">'+P('M20 30V52M12 36V46M76 30V52M84 36V46')+'</g>'+P('M46 88H50','class="ln"'),
    after:
      '<path class="acc" d="'+cr(8,10,36,62,7)+'"/>'+P(cr(8,10,36,62,7))+P('M20 18H32')+P('M18 42L25 49L36 36')+
      '<g class="ping">'+P('M50 22H88L92 26V50L88 54H72L62 66V54H50L46 50V26Z')+P('M58 34H80M58 43H72','class="ln"')+'</g>'
  };

  function star(n,ro,ri,cx,cy){ var pts=[]; for(var i=0;i<n*2;i++){ var r=i%2?ri:ro, a=Math.PI*i/n-Math.PI/2; pts.push((cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1)); } return 'M'+pts.join('L')+'Z'; }

  var CSS = '.pel-i{fill:none;stroke:currentColor;stroke-width:1.9;stroke-linejoin:miter;stroke-linecap:square;overflow:visible}'+
    '.pel-p,.pel-ill{fill:none;stroke:currentColor;stroke-width:2.4;stroke-linejoin:miter;stroke-linecap:square;overflow:visible}'+
    '.pel-p .acc,.pel-ill .acc{fill:var(--gold);fill-opacity:.2;stroke:none}'+
    '.pel-ill .solid,.pel-p .solid{fill:var(--gold);stroke:var(--gold)}'+
    '.pel-ill .solid-soft{fill:var(--gold);fill-opacity:.55;stroke:none}'+
    '.pel-ill .ln,.pel-p .ln{stroke:var(--gold);opacity:.85}'+
    '.pel-ill .bars rect{fill:var(--gold);stroke:none;transform-box:fill-box;transform-origin:center;animation:pelBar 1.4s ease-in-out infinite}'+
    '.pel-ill .bars rect:nth-child(2){animation-delay:.15s}.pel-ill .bars rect:nth-child(3){animation-delay:.3s}.pel-ill .bars rect:nth-child(4){animation-delay:.45s}.pel-ill .bars rect:nth-child(5){animation-delay:.6s}'+
    '.pel-ill .ping{transform-box:fill-box;transform-origin:50% 100%;animation:pelPing 3.2s ease-in-out infinite}'+
    '.pel-ill .shake{transform-box:fill-box;transform-origin:center;animation:pelShake 2.4s ease-in-out infinite}'+
    '.pel-ill .pencil{transform-box:fill-box;transform-origin:20% 80%;animation:pelWrite 3s ease-in-out infinite}'+
    '.pel-p .wv{stroke:var(--gold);animation:pelBlink 1.6s ease-in-out infinite}'+
    '@keyframes pelBar{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(1.25)}}'+
    '@keyframes pelPing{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}'+
    '@keyframes pelShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-2px)}40%{transform:translateX(2px)}60%{transform:translateX(-1.5px)}80%{transform:translateX(1.5px)}}'+
    '@keyframes pelWrite{0%,100%{transform:rotate(0)}50%{transform:rotate(-7deg)}}'+
    '@keyframes pelBlink{0%,100%{opacity:1}50%{opacity:.35}}'+
    '@media(prefers-reduced-motion:reduce){.pel-ill *,.pel-p *{animation:none!important}}';
  var st=document.createElement('style'); st.textContent=CSS; (document.head||document.documentElement).appendChild(st);

  function hydrate(root){
    (root||document).querySelectorAll('svg[data-i],svg[data-p],svg[data-ill]').forEach(function(el){
      if(el.dataset.done) return;
      var n=el.dataset.i, k=el.dataset.p, g=el.dataset.ill, html='', vb='0 0 24 24', cls='pel-i';
      if(n && UI[n]) html=UI[n];
      else if(k && PIC[k]){ html=PIC[k]; vb='0 0 64 64'; cls='pel-p'; }
      else if(g && ILL[g]){ html=ILL[g]; vb='0 0 96 96'; cls='pel-ill'; }
      else return;
      el.setAttribute('viewBox',vb); el.setAttribute('aria-hidden','true'); el.setAttribute('focusable','false');
      ['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin'].forEach(function(a){ el.removeAttribute(a); });
      el.setAttribute('class',((el.getAttribute('class')||'')+' '+cls).trim());
      el.innerHTML=html; el.dataset.done='1';
    });
  }
  /* decorative: Sadu weaving band + eight point star */
  function sadu(){ return '<svg class="sadu" aria-hidden="true" preserveAspectRatio="none" width="100%" height="14"><defs><pattern id="saduP" width="28" height="14" patternUnits="userSpaceOnUse"><path d="M0 7L7 0L14 7L21 0L28 7L21 14L14 7L7 14Z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M12 5H16V9H12Z" fill="currentColor"/></pattern></defs><rect width="100%" height="14" fill="url(#saduP)"/></svg>'; }
  function starSvg(){ return '<svg class="pel-star" viewBox="0 0 200 200" aria-hidden="true"><path d="'+star(8,96,62,100,100)+'"/><path d="'+star(8,74,48,100,100)+'"/><path d="'+star(16,96,84,100,100)+'"/><path d="M100 4V196M4 100H196" stroke-dasharray="2 6"/></svg>'; }

  window.PELI = { hydrate:hydrate, UI:UI, PIC:PIC, ILL:ILL, sadu:sadu, star:starSvg, svg:function(kind,name,cls){ return '<svg data-'+kind+'="'+name+'"'+(cls?' class="'+cls+'"':'')+'></svg>'; } };
  function boot(){ hydrate(document); try{ new MutationObserver(function(ms){ for(var i=0;i<ms.length;i++){ if(ms[i].addedNodes.length){ hydrate(document); break; } } }).observe(document.documentElement,{childList:true,subtree:true}); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
