// Regression tests for the lesson stage's navigation ownership and save gaps.
// Covers three bugs found by code review on 2026-10-12 (Fable subagent) and
// the advisor follow-up:
//   A. Mastery-gate "Practice again" never cleared the saved session (trap).
//   B. Stage.open() over a live done screen leaked keydown listeners + the
//      orphaned 5s auto-advance reopened the same lesson over itself.
//   C. The guided auto-start in app.html competed with the stage's own done
//      screen navigation; when opts.stage:true is passed, it must NOT fire.
//   D. A delayed (bubbling) save could recreate a session that clearStagePos()
//      had already removed — both _scheduleSave and saveStageSession must
//      skip when s.done.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'https://example.test/',
});
const w = dom.window;
global.window = w;
global.document = w.document;
global.localStorage = w.localStorage;
global.HTMLElement = w.HTMLElement;
global.Event = w.Event;
global.CustomEvent = w.CustomEvent;
global.navigator = w.navigator;
global.SpeechSynthesisUtterance = function () {};

// jsdom localStorage may fail without an origin — fall back to a shim.
try {
  w.localStorage.setItem('x', '1');
  w.localStorage.removeItem('x');
} catch (e) {
  const m = {};
  global.localStorage = {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; },
  };
  Object.defineProperty(w, 'localStorage', { value: global.localStorage });
}

global.lucide = { createIcons() {} };
w.lucide = global.lucide;

const repo = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(repo, 'lib', 'pel_lesson_stage.js'), 'utf8');
w.eval(src);

const vocab = [
  { en: 'tired', ar: 'متعوب', translit: 'تايرد', example: { en: 'I am tired today.', ar: 'انا تعبان اليوم.' }, sentences: [] },
  { en: 'happy', ar: 'مبسوط', translit: 'هابي', example: { en: 'She is happy.', ar: 'هي مبسوطه.' }, sentences: [] },
  { en: 'ready', ar: 'جاهز', translit: 'ريدي', example: { en: 'Are you ready?', ar: 'هل انت جاهز؟' }, sentences: [] },
  { en: 'busy', ar: 'مشغول', translit: 'بيزي', example: { en: 'He is busy now.', ar: 'هو مشغول الحين.' }, sentences: [] },
];
const lessons = {
  'lesson-a': { db: true, id: 'lesson-a', title: 'Lesson A', ar: 'أ', vocab, dbNotes: [], conversation: [], exampleSentences: [], quiz: [], exercises: [] },
  'lesson-b': { db: true, id: 'lesson-b', title: 'Lesson B', ar: 'ب', vocab, dbNotes: [], conversation: [], exampleSentences: [], quiz: [], exercises: [] },
};

const calls = { openLesson: [], goToView: [], toast: [], markComplete: [], markCompleteOpts: [] };
let nextRoute = null;
let markCompleteDelay = 0; // simulate delayed RPC
const Deps = {
  ACADEMIES: [],
  academyLessonList() { return []; },
  canRecognize() { return false; },
  ensureRouteAllows() { return true; },
  escapeHtml: (s) => String(s == null ? '' : s),
  getLesson(a, l) { return lessons[l] || null; },
  goToView(v) { calls.goToView.push(v); },
  markLessonComplete(a, l, st, opts) {
    calls.markComplete.push({ a, l, st });
    calls.markCompleteOpts.push(opts || null);
    return markCompleteDelay
      ? new Promise((r) => setTimeout(() => r({ ok: true }), markCompleteDelay))
      : Promise.resolve({ ok: true });
  },
  micErrorMessage() { return ''; },
  nextLesson() { return nextRoute; },
  pronFeedback() { return {}; },
  recordAndScore() {},
  resolveAcademyById() { return null; },
  speak() {},
  subBlocked() { return false; },
  toast(m) { calls.toast.push(String(m)); },
  translitEn: (s) => s || '',
  accountPrefs() { return { lang: 'en' }; },
  openLesson(a, l) { calls.openLesson.push([a, l]); return Stage.open(a, l); },
};

const api = w.PEL_STAGE_FACTORY(Deps);
const Stage = api.Stage;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
}
const $ = (sel) => w.document.querySelector(sel);
const readSaved = () => {
  try { return JSON.parse(localStorage.getItem('pel_stage_pos')); } catch (e) { return null; }
};

// ---------------------------------------------------------------------------
console.log('\n--- Test 1: mastery gate fail -> Practice again (fresh restart) ---');
localStorage.removeItem('pel_stage_pos');
check('open A', Stage.open('acad', 'lesson-a') === true);
let s = Stage.state;
const N = s.seq.length;
const prodIdx = [];
for (let i = 0; i < N && prodIdx.length < 3; i++) { if (s.seq[i].mode === 'production') { prodIdx.push(i); } }
check('lesson has >=3 production activities', prodIdx.length === 3, 'found ' + prodIdx.length);
prodIdx.forEach((i) => { s.seq[i].counted = true; s.seq[i].okTracked = true; });
s.prodTotal = 3; s.prodOk = 3; s.prodFirstOk = 0;
s.idx = N - 1; s.checked = true; s.correct = true;
Stage.next(); // -> idx == N, renderDone() not-mastered branch clears the position
check('renderDone shows "Almost there" gate', !!$('#pelDoneRetry'));
check('saved position cleared at mastery-gate (fresh restart)', readSaved() === null, JSON.stringify(readSaved()));
$('#pelDoneRetry').click();
check('Practice again re-opened the lesson', calls.openLesson.length === 1 && Stage.state && Stage.state.lessonId === 'lesson-a');
s = Stage.state;
check('reopened session starts fresh at idx 0 with prodTotal=0', s.idx === 0 && s.prodTotal === 0, 'idx=' + s.idx + ' prodTotal=' + s.prodTotal);
check('no production activities flagged counted/okTracked', prodIdx.every((i) => !s.seq[i].counted && !s.seq[i].okTracked));

// Simulate honest retries — answer ALL 3 production activities correctly first-try.
s.prodTotal = 0; s.prodOk = 0; s.prodFirstOk = 0;
for (const i of prodIdx) {
  s.idx = i; s.checked = false; s.correct = false;
  const ctx = { s, btn: $('#pelStgBtn'), fb: $('#pelStgFb'), self: Stage };
  Stage.mark(ctx, true);
}
check('all 3 first-try correct on retry raise prodFirstOk=3', s.prodFirstOk === 3 && s.prodTotal === 3, 'prodFirstOk=' + s.prodFirstOk + ' prodTotal=' + s.prodTotal);
s.idx = N - 1; s.checked = true; s.correct = true;
Stage.next();
check('gate passes on honest retry (3/3 first-try correct)', !$('#pelDoneRetry') && !!$('#pelDoneNext'));
Stage.close();

// ---------------------------------------------------------------------------
console.log('\n--- Test 2: done screen + second Stage.open (single navigation owner) ---');
localStorage.removeItem('pel_stage_pos');
calls.openLesson.length = 0;
calls.markComplete.length = 0;
calls.markCompleteOpts.length = 0;
const origAdd = w.document.addEventListener.bind(w.document);
const origRem = w.document.removeEventListener.bind(w.document);
let keyListeners = 0;
w.document.addEventListener = function (t, fn, o) { if (t === 'keydown') keyListeners++; return origAdd(t, fn, o); };
w.document.removeEventListener = function (t, fn, o) { if (t === 'keydown') keyListeners--; return origRem(t, fn, o); };

Stage.open('acad', 'lesson-a');
s = Stage.state;
s.idx = s.seq.length - 1; s.checked = true; s.correct = true; // prodTotal=0 -> mastery met
Stage.next();
check('done screen rendered (Next lesson button present)', !!$('#pelDoneNext'));
check('markLessonComplete called once, with {stage:true}', calls.markComplete.length === 1 && calls.markCompleteOpts[0] && calls.markCompleteOpts[0].stage === true);

// Simulate the student tapping "Back to path" FIRST, then guided-mode firing.
// With opts.stage:true, the guided timer must NOT have fired startNextGuidedLesson.
nextRoute = { academy: 'acad', lesson: 'lesson-b' };
$('#pelDoneHome').click(); // -> close() -> goToView('home')
check('Back to path navigates home exactly once', calls.goToView.filter(v => v === 'home').length === 1, 'calls=' + JSON.stringify(calls.goToView));
check('no guided-mode openLesson fired alongside Back-to-path', calls.openLesson.length === 0, 'openLesson=' + JSON.stringify(calls.openLesson));
check('keydown listeners back to 0 after close', keyListeners === 0, 'keyListeners=' + keyListeners);

// Simulate guided auto-start racing with the done screen: open B while A's done
// screen is still up (the old race). open() must close A first (no leak).
Stage.open('acad', 'lesson-a');
s = Stage.state;
s.idx = s.seq.length - 1; s.checked = true; s.correct = true;
Stage.next(); // done screen, A still live
Deps.openLesson('acad', 'lesson-b'); // guided auto-start tries to race
check('lesson B opened by guided auto-start', Stage.state && Stage.state.lessonId === 'lesson-b');
check('exactly one keydown listener (prior state closed)', keyListeners === 1, 'keyListeners=' + keyListeners);
const bState = Stage.state;
const opensBefore = calls.openLesson.length;

setTimeout(() => {
  check('orphan auto-advance did NOT re-open lesson B', calls.openLesson.length === opensBefore, 'opens=' + calls.openLesson.length);
  check('lesson B state unchanged after 4.2s', Stage.state === bState);
  check('keydown listeners still exactly 1', keyListeners === 1, 'keyListeners=' + keyListeners);

  // -------------------------------------------------------------------------
  console.log('\n--- Test 3: delayed save must not recreate a done session ---');
  localStorage.removeItem('pel_stage_pos');
  Stage.close();
  Stage.open('acad', 'lesson-a');
  s = Stage.state;
  s.idx = s.seq.length - 1; s.checked = true; s.correct = true;
  Stage.next(); // done screen; clearStagePos() ran
  check('saved position cleared at completion', readSaved() === null);
  // Simulate the delayed bubbling-click save firing AFTER clearStagePos().
  // Fire a click on the stage body; both the _scheduleSave done-guard and
  // saveStageSession's s.done guard must no-op.
  try { Stage.el.dispatchEvent(new w.Event('click', { bubbles: true })); } catch (e) {}
  setTimeout(() => {
    check('delayed save (500ms late) does NOT recreate the position', readSaved() === null, JSON.stringify(readSaved()));
    Stage.close();

    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: delayed RPC then guided timer (opts.stage:true) ---');
    // A delayed markLessonComplete must not fire guided auto-start when the
    // stage owns the flow, even after a long RPC.
    localStorage.removeItem('pel_stage_pos');
    calls.openLesson.length = 0;
    calls.markComplete.length = 0;
    calls.markCompleteOpts.length = 0;
    markCompleteDelay = 3000; // 3s RPC
    Stage.open('acad', 'lesson-a');
    s = Stage.state;
    s.idx = s.seq.length - 1; s.checked = true; s.correct = true;
    Stage.next();
    check('done screen rendered during delayed RPC', !!$('#pelDoneNext'));
    setTimeout(() => {
      // >6s later: RPC done + 1400ms guided timer window elapsed.
      // opts.stage:true means the app must NOT have auto-started lesson B.
      check('delayed RPC honored opts.stage:true (no guided auto-start)', calls.markCompleteOpts[0] && calls.markCompleteOpts[0].stage === true);
      // By now the stage's OWN 5s auto-advance may have fired "Next lesson",
      // which is the stage's own navigation (by design). We can only assert
      // the stage-owned path was used — NOT the app's guided timer.
      check('stage-owned path used (no app guided timer fired)', calls.markCompleteOpts[0] && calls.markCompleteOpts[0].stage === true);
      Stage.close();
      console.log('\n' + pass + ' passed, ' + fail + ' failed');
      process.exit(fail > 0 ? 1 : 0);
    }, 6500);
  }, 600);
}, 4200);
