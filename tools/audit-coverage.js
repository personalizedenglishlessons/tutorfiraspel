/* tools/audit-coverage.js
   Cross-references ACADEMY_LESSONS (academy -> lesson IDs shown to the
   student) against LESSON_LIBRARY (real authored lesson content) to find
   lessons that appear in an academy's list but have NO real content —
   these are the "some lessons are just not there" gaps.
   Run: node tools/audit-coverage.js
*/
const fs = require('fs');
const path = require('path');
const APP = path.join(__dirname, '..', 'app.html');
const src = fs.readFileSync(APP, 'utf8');

function extractBlock(nameStart){
  const i = src.indexOf(nameStart);
  if(i < 0) throw new Error('not found: '+nameStart);
  let p = i;
  while(p < src.length && src[p] !== '=') p++;
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

const stubs = 'var L=function(en,ar,t){return{en:en,ar:ar,translit:t}}; var VOCAB_BANK, LESSON_LIBRARY, ACADEMY_LESSONS, LESSON_TITLE_BANK;\n';
eval(stubs
  + 'VOCAB_BANK = ' + extractBlock('const VOCAB_BANK =') + ';\n'
  + 'LESSON_LIBRARY = ' + extractBlock('const LESSON_LIBRARY =') + ';\n'
  + 'LESSON_TITLE_BANK = ' + extractBlock('const LESSON_TITLE_BANK =') + ';\n'
  + 'ACADEMY_LESSONS = ' + extractBlock('const ACADEMY_LESSONS =') + ';\n');

const libIds = new Set(Object.keys(LESSON_LIBRARY));
const titleBankIds = new Set((LESSON_TITLE_BANK||[]).map(x=>x.id));

console.log('LESSON_LIBRARY lessons:', libIds.size);
console.log('LESSON_TITLE_BANK titles:', titleBankIds.size);
console.log('Academies mapped:', Object.keys(ACADEMY_LESSONS).length, '\n');

let totalListed=0, missingContent=[], titleOnly=[], okCount=0;
for(const [academy, ids] of Object.entries(ACADEMY_LESSONS)){
  for(const id of ids){
    totalListed++;
    if(libIds.has(id)){ okCount++; continue; }
    if(titleBankIds.has(id)){ titleOnly.push({academy, id}); }
    else { missingContent.push({academy, id}); }
  }
}
console.log('Total academy-listed lesson slots:', totalListed);
console.log('  with real LESSON_LIBRARY content:', okCount);
console.log('  title-only (no content, opens thin/synthesized):', titleOnly.length);
console.log('  no content AND no title (truly missing):', missingContent.length, '\n');

if(titleOnly.length){
  console.log('--- TITLE-ONLY (listed but no real lesson body) ---');
  const byAc={};
  titleOnly.forEach(x=>{ (byAc[x.academy]=byAc[x.academy]||[]).push(x.id); });
  for(const a of Object.keys(byAc)) console.log('  '+a+':', byAc[a].join(', '));
  console.log();
}
if(missingContent.length){
  console.log('--- TRULY MISSING (no content, no title) ---');
  const byAc={};
  missingContent.forEach(x=>{ (byAc[x.academy]=byAc[x.academy]||[]).push(x.id); });
  for(const a of Object.keys(byAc)) console.log('  '+a+':', byAc[a].join(', '));
}
