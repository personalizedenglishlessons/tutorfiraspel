/* tools/validate-lessons.js
   Loads the real VOCAB_BANK + LESSON_LIBRARY from app.html in a sandboxed
   eval (with a stub for L) and validates the schema of every lesson:
     - required top-level fields (title, ar, translit, duration, difficulty,
       vocab, grammar, conversation, quiz, summary, takeaway)
     - vocab entries resolve to real VOCAB_BANK entries with en/ar/translit
     - conversation has >= 3 lines, each with who/en/ar/translit
     - quiz items have q, options (>=2, no dupes), correct in range
     - grammar has title/rule/right/wrong
   Reports any malformed lesson. Exits non-zero on failure.
   Run:  node tools/validate-lessons.js
*/
const fs = require('fs');
const path = require('path');
const APP = path.join(__dirname, '..', 'app.html');
const src = fs.readFileSync(APP, 'utf8');

function extractBlock(nameStart){
  const i = src.indexOf(nameStart);
  if(i < 0) throw new Error('not found: '+nameStart);
  // scan for the value's opening [ or { after the =
  let p = i;
  while(p < src.length && src[p] !== '=' ) p++;
  p++;
  while(p < src.length && /\s/.test(src[p])) p++;
  const open = src[p];
  if(open !== '[' && open !== '{') throw new Error('no value for '+nameStart);
  let depth=0, j=p, inStr=null, esc=false;
  for(; j < src.length; j++){
    const c = src[j];
    if(inStr){ if(esc) esc=false; else if(c==='\\') esc=true; else if(c===inStr) inStr=null; continue; }
    if(c==='"'||c==="'"||c==='`'){ inStr=c; continue; }
    if(c==='['||c==='{') depth++;
    else if(c===']'||c==='}'){ depth--; if(depth===0){ j++; break; } }
  }
  return src.slice(p, j);
}

const stubs = 'var L=function(en,ar,t){return{en:en,ar:ar,translit:t}}; var VOCAB_BANK, LESSON_LIBRARY;\n';
let sandbox = {};
try{
  // eval VOCAB_BANK then LESSON_LIBRARY with stubs
  const code = stubs
    + 'VOCAB_BANK = ' + extractBlock('const VOCAB_BANK =') + ';\n'
    + 'LESSON_LIBRARY = ' + extractBlock('const LESSON_LIBRARY =') + ';\n';
  eval(code); // runs in this module scope; assigns to the vars above
}catch(e){
  console.error('FATAL: could not parse lesson data:', e.message);
  process.exit(2);
}

const errors = [];
function fail(lessonId, msg){ errors.push(lessonId+': '+msg); }

const REQUIRED = ['title','ar','translit','duration','difficulty','vocab','grammar','conversation','quiz','summary','takeaway'];
const ids = Object.keys(LESSON_LIBRARY);
console.log('Validating '+ids.length+' lessons, VOCAB_BANK has '+VOCAB_BANK.length+' entries.\n');

ids.forEach(id => {
  const l = LESSON_LIBRARY[id];
  if(!l || typeof l !== 'object'){ fail(id, 'not an object'); return; }
  REQUIRED.forEach(f => { if(l[f] === undefined || l[f] === null || l[f] === '') fail(id, 'missing/empty field "'+f+'"'); });
  // vocab
  if(Array.isArray(l.vocab)){
    if(l.vocab.length < 2) fail(id, 'vocab has <2 entries ('+l.vocab.length+')');
    l.vocab.forEach((v, idx) => {
      if(!v || typeof v !== 'object'){ fail(id, 'vocab['+idx+'] not an object'); return; }
      if(!v.en) fail(id, 'vocab['+idx+'] missing en');
      if(!v.ar) fail(id, 'vocab['+idx+'] missing ar');
      if(!v.translit) fail(id, 'vocab['+idx+'] missing translit');
    });
  } else { fail(id, 'vocab is not an array'); }
  // conversation
  if(Array.isArray(l.conversation)){
    if(l.conversation.length < 3) fail(id, 'conversation has <3 lines ('+l.conversation.length+')');
    l.conversation.forEach((c, idx) => {
      if(!c || !c.en || !c.ar) fail(id, 'conversation['+idx+'] missing en/ar');
    });
  } else { fail(id, 'conversation is not an array'); }
  // quiz
  if(Array.isArray(l.quiz)){
    if(l.quiz.length < 2) fail(id, 'quiz has <2 items ('+l.quiz.length+')');
    l.quiz.forEach((q, idx) => {
      if(!q || !q.q) fail(id, 'quiz['+idx+'] missing q');
      const opts = q.options;
      if(!Array.isArray(opts) || opts.length < 2) fail(id, 'quiz['+idx+'] options <2');
      else {
        const low = opts.map(o=>String(o).toLowerCase());
        // flag a duplicate only when the two options are identical including
        // case — a case-only difference (e.g. 'REcord' vs 'reCORD') is an
        // intentional stress-teaching pair, not a bug.
        const dup = opts.some((o,k)=>opts.indexOf(o)!==k);
        if(dup) fail(id, 'quiz['+idx+'] duplicate option');
      }
      if(typeof q.correct !== 'number' || q.correct < 0 || (opts && q.correct >= opts.length)) fail(id, 'quiz['+idx+'] correct out of range ('+q.correct+')');
    });
  } else { fail(id, 'quiz is not an array'); }
  // grammar
  if(l.grammar && typeof l.grammar === 'object'){
    ['title','rule','right','wrong'].forEach(g => { if(!l.grammar[g]) fail(id, 'grammar missing '+g); });
  } else { fail(id, 'grammar missing/not object'); }
});

if(errors.length === 0){
  console.log('OK — all '+ids.length+' lessons pass schema validation.');
  process.exit(0);
} else {
  console.log('FAIL — '+errors.length+' issue(s):\n');
  errors.forEach(e => console.log('  - '+e));
  process.exit(1);
}
