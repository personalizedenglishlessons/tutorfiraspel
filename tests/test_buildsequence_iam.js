// Integration test: replicates dbToLesson (app.html) + buildSequence (pel_lesson_stage.js)
// and runs them against REAL DB rows for i-am-sentences, to prove the engine
// now surfaces concept cards + authored exercises (previously dropped).
const fs = require('fs');
const path = require('path');
// Test data captured from the live DB (i-am-sentences lesson) so this test
// is reproducible without database access. Regenerate with tools/sql.py.
const data = JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures_iam_sentences.json')));
const lessonRow = data.lesson;
const items = data.items;
const exercises = data.exercises;
const L = (en/*, ar*/) => en;
const ar = () => false;
const translitEn = (s) => s ? '[tr:'+s+']' : '';
const tr = (t) => (typeof translitEn === 'function' && t) ? translitEn(t) : '';
const esc = (s) => String(s==null?'':s);
const shuffle = (a) => { const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
const norm = (s) => String(s||'').toLowerCase().replace(/[\u2018\u2019']/g,"'").replace(/[^a-z0-9'\s]/g,'').replace(/\s+/g,' ').trim();
function play(){} function usageHtml(){return '';}
const PEL_BEGINNER = {}; const PEL_STARTER_ITEMS = [];

// ---- dbToLesson (faithful copy from app.html) ----
function dbToLesson(dbl, academy){
  const items = dbl.items || [];
  const vocab = items.filter(i => i.kind === 'word' || i.kind === 'phrase').map(i => {
    const exEn = i.example_en || i.ex_en || i.exampleEn || '';
    const exAr = i.example_ar || i.ex_ar || i.exampleAr || '';
    const exTr = i.example_tr || i.ex_tr || i.exampleTr || '';
    return { en: i.en, ar: i.ar_meaning||i.ar, translit: i.translit || i.tr || '', pos: i.pos||'', ipa: i.ipa||'',
      example: exEn ? { en: exEn, ar: exAr, translit: exTr } : {}, tip: i.note_en || i.noteEn || i.note_ar || '', sentences: [] };
  });
  const notes = items.filter(i => i.kind === 'pattern' || i.kind === 'explain')
    .map(i => ({ en: i.en, ar: i.ar_meaning||i.ar, note_en: i.note_en || '', tr: i.translit || i.tr || '' }));
  let flip = false;
  const conversation = items.filter(i => i.kind === 'sentence').map(i => {
    flip = !flip; return { who: flip?'A':'B', en: i.en, ar: i.ar_meaning||i.ar, translit: i.translit || i.tr || translitEn(i.en) };
  });
  const quiz = (dbl.exercises || []).filter(x => x.type === 'choose').map(x => ({
    q: x.payload.question.en, options: x.payload.options.map(o => ({ t: o.t })), correct: x.payload.options.findIndex(o => o.ok),
  }));
  return { db:true, id:dbl.id, title:dbl.title_en, ar:dbl.title_ar, vocab, dbNotes: notes, conversation,
    quiz, exercises: (dbl.exercises || []).filter(x => x.type !== 'choose') };
}

// ---- buildItems / buildConversation (faithful copy) ----
function buildItems(lesson){
  let items = (lesson && Array.isArray(lesson.vocab) && lesson.vocab.length) ? lesson.vocab.map(v => ({
    en:v.en, ar:v.ar, translit:v.translit||tr(v.en), pos:v.pos||'', ipa:v.ipa||'', example:v.example||{},
    usage:v.tip||'', sentences:(v.sentences||[]).map(s=>({en:s.en||s,ar:s.ar||'',translit:s.translit||tr(s.en||s)})) })) : null;
  if(items && items.length && !items.some(it=>it.example&&it.example.en) && PEL_BEGINNER['x']) items=null;
  if((!items||!items.length) && PEL_BEGINNER['x']) items=null;
  if(!items||!items.length) items = PEL_STARTER_ITEMS.map(v=>({...v}));
  items = items.map(it => {
    const ex = it.example && it.example.en ? it.example : {en:it.en,ar:it.ar,translit:it.translit};
    const sents = (it.sentences && it.sentences.length) ? it.sentences : [ex, {en:'Do you '+(it.en.includes(' ')?'use ':'know ')+it.en+'?',ar:'',translit:''}];
    return {...it, example:ex, sentences:sents.map(s=>({en:s.en,ar:s.ar||it.ar,translit:s.translit||tr(s.en||'')}))};
  });
  return items;
}
function buildConversation(lesson){
  let conv = (lesson && Array.isArray(lesson.conversation) && lesson.conversation.length) ? lesson.conversation : null;
  if(!conv) conv = [{who:'A',en:'Hello!',ar:'?',translit:'?'},{who:'B',en:'Hi?',ar:'?',translit:'?'}];
  return conv.map(c=>({who:c.who||'A',en:c.en,ar:c.ar,translit:c.translit||tr(c.en)}));
}

// ---- makeWrongSentence (faithful copy of my new helper) ----
function makeWrongSentence(it){
  const base = (it && it.sentences && it.sentences[0] && it.sentences[0].en) || (it && it.example && it.example.en) || (it && it.en) || '';
  if(!base || base.split(/\s+/).length < 2) return null;
  const w = base;
  const rules = [
    [/^i am\b/i,'I is'],[/^i have\b/i,'I has'],[/^(he|she|it) is\b/i,(m,p)=>p+' are'],
    [/^(he|she|it) has\b/i,(m,p)=>p+' have'],[/^(you|we|they) are\b/i,(m,p)=>p+' is'],
    [/^do you\b/i,'Does you'],[/^does (he|she|it)\b/i,(m,p)=>'Do '+p],
    [/^there is\b/i,'There are'],[/^there are\b/i,'There is'],
    [/^(he|she|it) don't\b/i,(m,p)=>p+" doesn't"],[/^(i|you|we|they) doesn't\b/i,(m,p)=>p+" don't"],
    [/^a ([aeiou])/i,'An $1'],[/^an ([^aeiou])/i,'A $1']
  ];
  for(const [re,rep] of rules){ if(re.test(w)){ const out=w.replace(re,rep); if(out!==w) return out; } }
  return null;
}

// ---- buildSequence (faithful copy WITH MY CHANGES) ----
function buildSequence(lesson){
  const items = buildItems(lesson);
  const conv = buildConversation(lesson);
  const quiz = (lesson && Array.isArray(lesson.quiz)) ? lesson.quiz : [];
  const notes = (lesson && Array.isArray(lesson.dbNotes)) ? lesson.dbNotes : [];
  const exs = (lesson && Array.isArray(lesson.exercises)) ? lesson.exercises : [];
  const exsByType = (t) => exs.filter(e => e && e.type === t);
  const orderExs = exsByType('order'); const spellExs = exsByType('spell');
  const trExs = exsByType('translate'); const correctExs = exsByType('correct');
  const seq = []; const main = items.slice(0,3);
  notes.forEach(n => seq.push({type:'concept',note:n}));
  main.forEach((it) => { seq.push({type:'learn',item:it}); if(it.sentences[1]) seq.push({type:'learn_sentence',item:it,sentence:it.sentences[1]}); });
  if(main.length>=2){ main.slice(0,2).forEach(it=>seq.push({type:'recognize',item:it,pool:main})); }
  if(items.length>=4){ seq.push({type:'match',items:shuffle(items).slice(0,Math.min(5,items.length))}); }
  if(orderExs.length){ orderExs.forEach(e=>seq.push({type:'db_order',ex:e})); }
  else { seq.push({type:'arrange_words',sentence:main[0]&&main[0].sentences[0]}); }
  const fbItem = main[1]||main[0]||items[0];
  seq.push({type:'fill_blank',item:fbItem});
  if(spellExs.length){ spellExs.forEach(e=>seq.push({type:'db_spell',ex:e})); }
  else { seq.push({type:'spell',item:main[2]||main[0]||items[0]}); }
  if(trExs.length){ trExs.forEach(e=>seq.push({type:'db_translate',ex:e})); }
  else { seq.push({type:'translate',item:fbItem}); }
  const listenItem = main[2]||main[0]||items[0];
  seq.push({type:'listen',item:listenItem}); seq.push({type:'identify_heard',item:listenItem,pool:main});
  seq.push({type:'pronunciation',item:main[0]||items[0]});
  const speakItem = main[1]||main[0]||items[0];
  seq.push({type:'speaking',sentence:(speakItem.sentences[1]||speakItem.sentences[0]||{en:speakItem.en})});
  if(conv.length>=3) seq.push({type:'conversation_response',conv,idx:1});
  if(conv.length>=4) seq.push({type:'complete_dialogue',conv,gap:3,pool:main});
  if(correctExs.length){ correctExs.forEach(e=>seq.push({type:'db_correct',ex:e})); }
  else if(!quiz.length){ const grItem=main[2]||main[0]||items[0]; const wrong=makeWrongSentence(grItem); if(wrong) seq.push({type:'grammar_correction',item:grItem,wrong}); }
  if(quiz.length){ quiz.forEach(q=>seq.push({type:'choose_natural_expression',quiz:[q]})); }
  seq.push({type:'free_response',item:main[0]||items[0]});
  seq.push({type:'review',items:main});
  seq.push({type:'challenge',items});
  return seq;
}

// ---- run against real DB data ----
// ---- stubs for module-level helpers ----

const dbl = {...lessonRow, items, exercises};
const lesson = dbToLesson(dbl, null);
const seq = buildSequence(lesson);

console.log('Lesson:', lesson.title, '| vocab:', lesson.vocab.length, '| dbNotes:', lesson.dbNotes.length, '| exercises:', lesson.exercises.length, '| quiz:', lesson.quiz.length, '| conversation:', lesson.conversation.length);
console.log('\nSEQUENCE (' + seq.length + ' activities):');
seq.forEach((a,i) => {
  let extra = '';
  if(a.type==='concept') extra = ' -> "' + (a.note.en||'').slice(0,48) + '"';
  if(a.type==='db_order') extra = ' -> "' + (a.ex.payload.prompt&&a.ex.payload.prompt.en||'').slice(0,40) + '"';
  if(a.type==='db_translate') extra = ' -> "' + (a.ex.payload.source||'').slice(0,40) + '" ['+a.ex.payload.dir+']';
  if(a.type==='choose_natural_expression') extra = ' -> "' + (a.quiz[0].q||'').slice(0,40) + '"';
  if(a.type==='grammar_correction') extra = ' -> wrong="'+a.wrong+'"';
  console.log(String(i+1).padStart(2,' '), a.type.padEnd(24), extra);
});

// ---- assertions ----
const checks = {
  concept_card_present: seq.some(a=>a.type==='concept'),
  authored_order_used: seq.some(a=>a.type==='db_order'),
  authored_translate_used: seq.some(a=>a.type==='db_translate'),
  all_quiz_questions_used: seq.filter(a=>a.type==='choose_natural_expression').length === lesson.quiz.length,
  no_synthetic_arrange_for_pattern_lesson: !seq.some(a=>a.type==='arrange_words'),
  grammar_correction_has_real_wrong: !seq.some(a=>a.type==='grammar_correction' && !a.wrong),
};
console.log('\nCHECKS:');
let pass = true;
for(const [k,v] of Object.entries(checks)){ console.log((v?'PASS':'FAIL').padEnd(5), k); if(!v) pass=false; }
console.log(pass ? '\nALL PASS' : '\nSOME FAILED');
process.exit(pass?0:1);
