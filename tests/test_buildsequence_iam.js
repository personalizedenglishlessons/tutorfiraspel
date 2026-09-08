// Integration test: loads the REAL lib/pel_lesson_stage.js (factory form) and
// runs buildSequence against REAL DB rows for i-am-sentences, to prove the
// engine surfaces concept cards + authored exercises (previously dropped).
// The factory is dependency-injected, so no hand-copied engine code is needed
// anymore — this test exercises the exact code the live app ships.
const fs = require('fs');
const path = require('path');
// Test data captured from the live DB (i-am-sentences lesson) so this test
// is reproducible without database access. Regenerate with tools/sql.py.
const data = JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures_iam_sentences.json')));
const lessonRow = data.lesson;
const items = data.items;
const exercises = data.exercises;

/* ---- minimal browser stubs (the factory only touches DOM lazily) ---- */
global.window = global;
global.document = {
  readyState: 'complete',
  documentElement: { dir: 'ltr' },
  addEventListener(){}, removeEventListener(){},
  getElementById(){ return null; },
  querySelector(){ return null; },
  querySelectorAll(){ return []; },
  createElement(){ return { style:{}, classList:{add(){},remove(){},contains(){return false}}, setAttribute(){}, appendChild(){}, addEventListener(){}, dataset:{} }; },
  head: { appendChild(){} }, body: { appendChild(){} },
};
global.matchMedia = () => ({ matches: false, addEventListener(){} });
global.addEventListener = () => {};
global.setTimeout = setTimeout; global.clearTimeout = clearTimeout;
global.lucide = { createIcons(){} };

/* ---- load the REAL module (single source of truth) ---- */
const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'pel_lesson_stage.js'), 'utf8');
new Function(src)(); // sets window.PEL_STAGE_FACTORY
if (typeof window.PEL_STAGE_FACTORY !== 'function') { console.error('FAIL: PEL_STAGE_FACTORY not defined'); process.exit(1); }

const api = window.PEL_STAGE_FACTORY({
  ACADEMIES: [], academyLessonList(){ return []; }, canRecognize(){ return false; },
  ensureRouteAllows(){ return true; }, escapeHtml: (s) => String(s==null?'':s),
  getLesson(){ return null; }, goToView(){}, markLessonComplete(){},
  micErrorMessage(){ return ''; }, nextLesson(){ return null; }, pronFeedback(){ return {}; },
  recordAndScore(){}, resolveAcademyById(){ return null; }, speak(){},
  subBlocked(){ return false; }, toast(){}, translitEn: (s) => s ? '[tr:'+s+']' : '',
  accountPrefs(){ return {lang:'en'}; }, openLesson(){},
});
const buildSequence = api.buildSequence;
const buildItems = api.buildItems;
const PEL_BEGINNER = api.PEL_BEGINNER;

/* ---- dbToLesson (faithful copy from app.html — app-side mapping, not stage) ---- */
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
function translitEn(s){ return s ? '[tr:'+s+']' : ''; }

/* ---- run against real DB data ---- */
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

/* ---- assertions ---- */
const checks = {
  concept_card_present: seq.some(a=>a.type==='concept'),
  authored_order_used: seq.some(a=>a.type==='db_order'),
  authored_translate_used: seq.some(a=>a.type==='db_translate'),
  all_quiz_questions_used: seq.filter(a=>a.type==='choose_natural_expression').length === lesson.quiz.length,
  no_synthetic_arrange_for_pattern_lesson: !seq.some(a=>a.type==='arrange_words'),
  grammar_correction_has_real_wrong: !seq.some(a=>a.type==='grammar_correction' && !a.wrong),
  // regression guard for the sentence-fallback fix: no invented "Do you know X?" sentences
  no_invented_do_you_know_sentences: !buildItems(lesson).some(it => it.sentences.some(s => /^Do you (know|use) /.test(s.en))),
};
console.log('\nCHECKS:');
let pass = true;
for(const [k,v] of Object.entries(checks)){ console.log((v?'PASS':'FAIL').padEnd(5), k); if(!v) pass=false; }
console.log(pass ? '\nALL PASS' : '\nSOME FAILED');
process.exit(pass?0:1);
