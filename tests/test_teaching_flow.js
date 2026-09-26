// Regression tests for teaching flow + pronunciation hints.
// Run: node tests/test_teaching_flow.js
const fs = require('fs');
const path = require('path');

/* ---- minimal browser stubs (same as test_buildsequence_iam.js) ---- */
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

/* ---- load the REAL module ---- */
const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'pel_lesson_stage.js'), 'utf8');
new Function(src)();
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

const pronunciationHint = api.pronunciationHint;
const buildSequence = api.buildSequence;

/* ---- helpers ---- */
function norm(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,'').trim(); }
function makeLesson(opts){
  opts = opts || {};
  const vocab = opts.vocab || [
    { en:'tired', ar:'متعوب', translit:'تايرد', example:{en:'I am tired today.', ar:'انا تعبان اليوم.'}, sentences:[] },
    { en:'happy', ar:'مبسوط', translit:'هابي', example:{en:'She is happy.', ar:'هي مبسوطه.'}, sentences:[] },
    { en:'ready', ar:'جاهز', translit:'ريدي', example:{en:'Are you ready?', ar:'هل انت جاهز؟'}, sentences:[] },
    { en:'busy', ar:'مشغول', translit:'بيزي', example:{en:'He is busy now.', ar:'هو مشغول الحين.'}, sentences:[] },
  ];
  return {
    db:true, id:opts.id||'test-lesson', title:opts.title||'Test', ar:opts.ar||'اختبار',
    vocab, dbNotes: opts.notes || [], conversation: opts.conversation || [],
    exampleSentences: opts.exampleSentences || [],
    quiz: opts.quiz || [], exercises: opts.exercises || [],
  };
}

let pass=0, fail=0;
function check(name, cond){ if(cond){ pass++; console.log('PASS  '+name); } else { fail++; console.log('FAIL  '+name); } }

/* ====== PRONUNCIATION HINT TESTS ====== */

// 6. pronunciationHint('tired') returns hint with correct content
var phTired = pronunciationHint({en:'tired'});
check('pron tired returns hint', phTired !== null);
check('pron tired has تايرد', phTired && phTired.ar && phTired.ar.indexOf('تايرد') !== -1);
check('pron tired has avoid تاي-رِد', phTired && phTired.avoid && phTired.avoid.indexOf('تاي-رِد') !== -1);

// 7. pronunciationHint('three') returns TH hint
var phThree = pronunciationHint({en:'three'});
check('pron three returns hint', phThree !== null);
check('pron three has ثري', phThree && phThree.ar && phThree.ar.indexOf('ثري') !== -1);

// 8. pronunciationHint('those') uses ذوز not دوز
var phThose = pronunciationHint({en:'those'});
check('pron those returns hint', phThose !== null);
check('pron those has ذوز', phThose && phThose.ar && phThose.ar.indexOf('ذوز') !== -1);
check('pron those avoid has دوز', phThose && phThose.avoid && phThose.avoid.indexOf('دوز') !== -1);

// 9. DB-authored hint wins over hardcoded
var phCustom = pronunciationHint({en:'tired', pron_hint_ar:'CUSTOM_HINT', avoid_ar:'CUSTOM_AVOID', beats:2});
check('pron DB field wins', phCustom && phCustom.ar === 'CUSTOM_HINT');
check('pron DB avoid wins', phCustom && phCustom.avoid === 'CUSTOM_AVOID');
check('pron DB beats wins', phCustom && phCustom.beats === 2);

// 10. Pattern fallback: 'school' (s+stop cluster) gets hint even though not in exact map
var phSchool = pronunciationHint({en:'school'});
check('pron school exact match', phSchool !== null);
check('pron school has S hint', phSchool && phSchool.ar && (phSchool.ar.indexOf('S') !== -1 || phSchool.ar.indexOf('س') !== -1));

// 11. Pattern fallback: 'photo' (ph → F)
var phPhoto = pronunciationHint({en:'photo'});
check('pron photo returns hint', phPhoto !== null);
check('pron photo has F hint', phPhoto && phPhoto.ar && phPhoto.ar.indexOf('F') !== -1);

// 12. Pattern fallback: 'know' (silent K)
var phKnow = pronunciationHint({en:'know'});
check('pron know returns hint', phKnow !== null);
check('pron know has K silent', phKnow && phKnow.ar && phKnow.ar.indexOf('K') !== -1);

// 13. No hint for random word without pattern
var phRandom = pronunciationHint({en:'cat'});
check('pron cat returns null (no trap)', phRandom === null);

/* ====== TEACHING FLOW TESTS ====== */

// 1. concept_examples appears before first practice activity
var lesson1 = makeLesson({
  notes: [{en:'Test rule', ar:'قاعده'}],
  exampleSentences: [{en:'This is a test sentence.', ar:'هذا اختبار.'}],
  conversation: [{en:'I am fine.', ar:'انا بخير.'}, {en:'I am ready.', ar:'انا جاهز.'}, {en:'I am tired.', ar:'انا تعبان.'}],
});
var seq1 = buildSequence(lesson1, 'test-lesson');
var cexIdx = seq1.findIndex(a => a.type === 'concept_examples');
var firstPracticeIdx = seq1.findIndex(a => ['recognize','match','fill_blank','arrange_words','spell'].indexOf(a.type) !== -1);
check('concept_examples present', cexIdx !== -1);
check('concept_examples before first practice', cexIdx !== -1 && firstPracticeIdx !== -1 && cexIdx < firstPracticeIdx);

// 2. First practice appears only after concept/learn activities
var learnIdx = seq1.findIndex(a => a.type === 'learn');
check('learn present', learnIdx !== -1);
check('learn before first practice', learnIdx !== -1 && firstPracticeIdx !== -1 && learnIdx < firstPracticeIdx);

// 3. match only uses taught items (check match items are subset of main vocab)
var matchAct = seq1.find(a => a.type === 'match');
if(matchAct){
  var matchEns = matchAct.items.map(function(i){ return norm(i.en); });
  var vocabEns = lesson1.vocab.map(function(i){ return norm(i.en); });
  var allTaught = matchEns.every(function(e){ return vocabEns.indexOf(e) !== -1; });
  check('match uses only vocab items', allTaught);
} else {
  check('match uses only vocab items', true); // match may be skipped if < 4 items
}

// 4. Fake sentence-list lesson: no conversation_response or complete_dialogue
var fakeLesson = makeLesson({
  conversation: [{en:'I am fine.'}, {en:'I am ready.'}, {en:'I am tired.'}, {en:'I am happy.'}],
  exampleSentences: [{en:'I am fine.'}, {en:'I am ready.'}, {en:'I am tired.'}, {en:'I am happy.'}],
});
var seqFake = buildSequence(fakeLesson, 'fake-dialogue');
var hasConvResp = seqFake.some(a => a.type === 'conversation_response');
var hasCompDlg = seqFake.some(a => a.type === 'complete_dialogue');
check('fake dialogue: no conversation_response', !hasConvResp);
check('fake dialogue: no complete_dialogue', !hasCompDlg);

// 5. Vocab-only lesson (no sentences at all): no fill_blank, arrange_words, speaking, guided_production
var vocabOnly = makeLesson({
  vocab: [
    { en:'cat', ar:'قطه', translit:'كات', example:{}, sentences:[] },
    { en:'dog', ar:'كلب', translit:'دوغ', example:{}, sentences:[] },
    { en:'fish', ar:'سمكه', translit:'فيش', example:{}, sentences:[] },
    { en:'bird', ar:'طاير', translit:'بيرد', example:{}, sentences:[] },
  ],
  conversation: [], exampleSentences: [], notes: [],
});
var seqVocab = buildSequence(vocabOnly, 'vocab-only');
check('vocab-only: no fill_blank', !seqVocab.some(a => a.type === 'fill_blank'));
check('vocab-only: no arrange_words', !seqVocab.some(a => a.type === 'arrange_words'));
check('vocab-only: no speaking', !seqVocab.some(a => a.type === 'speaking'));
check('vocab-only: no guided_production', !seqVocab.some(a => a.type === 'guided_production'));

// 14. challenge items are subset of taught items
var challengeAct = seq1.find(a => a.type === 'challenge');
if(challengeAct){
  var challengeEns = challengeAct.items.map(function(i){ return norm(i.en); });
  var taughtEns = lesson1.vocab.map(function(i){ return norm(i.en); });
  var allInTaught = challengeEns.every(function(e){ return taughtEns.indexOf(e) !== -1; });
  check('challenge uses only taught items', allInTaught);
} else {
  check('challenge uses only taught items', true);
}

// 15. review items are subset of taught items
var reviewAct = seq1.find(a => a.type === 'review');
if(reviewAct){
  var reviewEns = reviewAct.items.map(function(i){ return norm(i.en); });
  var allReviewTaught = reviewEns.every(function(e){ return taughtEns.indexOf(e) !== -1 || reviewAct.items.some(function(i){ return norm(i.en) === e && i.srs; }); });
  check('review uses taught or SRS items', allReviewTaught);
} else {
  check('review uses taught or SRS items', true);
}

/* ====== how_to_say ACTIVITY TESTS ====== */

// 16. how_to_say appears in sequence for lessons with vocab
var seqTest = buildSequence(makeLesson({}), 'how-to-say-test');
var howToSayAct = seqTest.find(a => a.type === 'how_to_say');
check('how_to_say present in sequence', !!howToSayAct);
check('how_to_say has item.en', howToSayAct && howToSayAct.item && howToSayAct.item.en);
check('how_to_say item has translit', howToSayAct && howToSayAct.item && howToSayAct.item.translit);

// 17. how_to_say appears after learn activities
var learnIdx2 = seqTest.findIndex(a => a.type === 'learn');
var howToSayIdx = seqTest.findIndex(a => a.type === 'how_to_say');
check('how_to_say after learn', learnIdx2 !== -1 && howToSayIdx !== -1 && learnIdx2 < howToSayIdx);

// 18. how_to_say appears before first practice activity
var firstPracticeIdx2 = seqTest.findIndex(a => ['recognize','match','fill_blank','arrange_words','spell'].indexOf(a.type) !== -1);
check('how_to_say before first practice', howToSayIdx !== -1 && firstPracticeIdx2 !== -1 && howToSayIdx < firstPracticeIdx2);

/* ====== SELF-CHECK MASTERY GATE TESTS ====== */

// 19. Self-check mark does not count toward mastery gate stats
var mockSeq = [
  { type: 'pronunciation', mode: 'production', item: {en:'test', ar:'اختبار', translit:''} },
  { type: 'speaking', mode: 'production', sentence: {en:'test', ar:'اختبار', translit:''} },
  { type: 'fill_blank', mode: 'production' },
];
var mockState = {
  seq: mockSeq, idx: 0, checked: false, correct: undefined,
  prodTotal: 0, prodOk: 0, prodFirstOk: 0, recTotal: 0, recOk: 0,
  academyId: 'test', lessonId: 'test-lesson'
};
var mockCtx = {
  s: mockState, self: api.Stage,
  fb: { className: '', innerHTML: '' },
  btn: { disabled: false, className: '', innerHTML: '', onclick: null, textContent: '' }
};

// Mark first activity as self-check (fallback)
api.Stage.mark(mockCtx, true, true);
check('self-check does not count prodTotal', mockState.prodTotal === 0);
check('self-check does not count prodFirstOk', mockState.prodFirstOk === 0);
check('self-check sets act.selfCheck', mockSeq[0].selfCheck === true);
check('self-check sets act.counted', mockSeq[0].counted === true);

// Move to next activity and mark as real production
mockState.idx = 1; mockState.checked = false; mockState.correct = undefined;
api.Stage.mark(mockCtx, true, false);
check('real mark counts prodTotal', mockState.prodTotal === 1);
check('real mark counts prodFirstOk', mockState.prodFirstOk === 1);

// Move to next and mark as real production (incorrect)
mockState.idx = 2; mockState.checked = false; mockState.correct = undefined;
api.Stage.mark(mockCtx, false, false);
check('real wrong counts prodTotal', mockState.prodTotal === 2);
check('real wrong does not count prodFirstOk', mockState.prodFirstOk === 1);

// 20. Mixed real + self-check: mastery gate uses only real attempts
// Need prodTotal >= 3 to test the accuracy ratio. Add 2 more real production
// activities (one correct, one wrong) -> prodTotal=4, prodFirstOk=2 -> 50% < 60%
var moreSeq = [
  { type: 'pronunciation', mode: 'production', item: {en:'a',ar:'',translit:''} },
  { type: 'speaking', mode: 'production', sentence: {en:'b',ar:'',translit:''} },
  { type: 'fill_blank', mode: 'production' },
  { type: 'translate', mode: 'production' },
  { type: 'arrange_words', mode: 'production' },
];
var moreState = {
  seq: moreSeq, idx: 0, checked: false, correct: undefined,
  prodTotal: 0, prodOk: 0, prodFirstOk: 0, recTotal: 0, recOk: 0,
  academyId: 'test', lessonId: 'mixed-test'
};
var moreCtx = { s: moreState, self: api.Stage, fb: {className:'',innerHTML:''}, btn: {disabled:false,className:'',innerHTML:'',onclick:null,textContent:''} };
// Activity 0: self-check (should NOT count)
api.Stage.mark(moreCtx, true, true);
// Activity 1: real correct
moreState.idx = 1; moreState.checked = false; moreState.correct = undefined;
api.Stage.mark(moreCtx, true, false);
// Activity 2: real correct
moreState.idx = 2; moreState.checked = false; moreState.correct = undefined;
api.Stage.mark(moreCtx, true, false);
// Activity 3: real wrong
moreState.idx = 3; moreState.checked = false; moreState.correct = undefined;
api.Stage.mark(moreCtx, false, false);
// Activity 4: real wrong
moreState.idx = 4; moreState.checked = false; moreState.correct = undefined;
api.Stage.mark(moreCtx, false, false);
// prodTotal=4 (4 real, self-check excluded), prodFirstOk=2 -> 2/4 = 50% < 60%
check('mixed: prodTotal excludes self-check', moreState.prodTotal === 4);
check('mixed: prodFirstOk is 2', moreState.prodFirstOk === 2);
var mixedMastery = moreState.prodTotal < 3 || (moreState.prodFirstOk / moreState.prodTotal) >= 0.6;
check('mastery gate not met with 50% real (excl self-check)', !mixedMastery);

// 21. Self-check only (no real production): prodTotal < 3 -> gate passes
var scState = {
  seq: [{type:'pronunciation',mode:'production'},{type:'speaking',mode:'production'},{type:'minimal_pairs',mode:'production'}],
  idx: 0, checked: false, correct: undefined,
  prodTotal: 0, prodOk: 0, prodFirstOk: 0, recTotal: 0, recOk: 0,
  academyId: 'test', lessonId: 'sc-only'
};
var scCtx = { s: scState, self: api.Stage, fb: {className:'',innerHTML:''}, btn: {disabled:false,className:'',innerHTML:'',onclick:null,textContent:''} };
for(var si=0; si<3; si++){
  scState.idx = si; scState.checked = false; scState.correct = undefined;
  api.Stage.mark(scCtx, true, true);
}
check('self-check only: prodTotal stays 0', scState.prodTotal === 0);
check('self-check only: prodFirstOk stays 0', scState.prodFirstOk === 0);
var scMastery = scState.prodTotal < 3 || (scState.prodFirstOk / scState.prodTotal) >= 0.6;
check('self-check only: mastery gate passes (prodTotal < 3)', scMastery);

// 22. Retry after self-check: self-check flag prevents retry counting
// (self-check sets counted=true but not okTracked, so retry-success branch
// must skip it via !act.selfCheck)
var retryState = {
  seq: [{type:'pronunciation',mode:'production'},{type:'fill_blank',mode:'production'}],
  idx: 0, checked: false, correct: undefined,
  prodTotal: 0, prodOk: 0, prodFirstOk: 0, recTotal: 0, recOk: 0,
  academyId: 'test', lessonId: 'retry-test'
};
var retryCtx = { s: retryState, self: api.Stage, fb: {className:'',innerHTML:''}, btn: {disabled:false,className:'',innerHTML:'',onclick:null,textContent:''} };
// First: self-check mark
api.Stage.mark(retryCtx, true, true);
// Simulate retry: render() resets checked, then mark again with correct=true
retryState.checked = false; retryState.correct = undefined;
api.Stage.mark(retryCtx, true, false);
check('retry after self-check: prodTotal still 0', retryState.prodTotal === 0);
check('retry after self-check: prodFirstOk still 0', retryState.prodFirstOk === 0);

console.log('\n' + (fail === 0 ? 'ALL PASS' : (fail + ' FAILED')) + ' (' + pass + ' passed, ' + fail + ' failed)');
process.exit(fail === 0 ? 0 : 1);
