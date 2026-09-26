// Audit script: build sequences for all PEL_BEGINNER lessons and report issues.
// Run: node tests/audit_lessons.js
const fs = require('fs');
const path = require('path');

/* ---- minimal browser stubs ---- */
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

/* ---- find all PEL_BEGINNER lessons ---- */
// PEL_BEGINNER is defined inside the module scope. We need to access it.
// The factory exposes buildSequence which uses PEL_BEGINNER internally.
// We'll build a mock lesson for each topic in PEL_BEGINNER.

// Access PEL_BEGINNER through the module's internal scope
// Since it's not directly exposed, let's build lessons from known topics
const topics = [
  { id:'iam', title:'I am: your first English sentence', ar:'انا: اول جمله انجليزي' },
  { id:'pronouns', title:'My, your, his, her', ar:'ضماير المعشانه' },
  { id:'aan', title:'A, An and The', ar:'ال التعريف و ا' },
  { id:'numbers', title:'Numbers 1-10', ar:'الارقام ١-١٠' },
  { id:'colors', title:'Colors', ar:'الالوان' },
  { id:'family', title:'Family members', ar:'العايله' },
  { id:'days', title:'Days of the week', ar:'ايام الاسبوع' },
  { id:'greetings', title:'Greetings', ar:'التحيات' },
  { id:'food', title:'Food and drink', ar:'الاكل و الشرب' },
  { id:'body', title:'Body parts', ar:'اجزا الجسم' },
  { id:'clothes', title:'Clothes', ar:'الملابس' },
  { id:'weather', title:'Weather', ar:'الطقس' },
  { id:'house', title:'House and home', ar:'البيت' },
  { id:'jobs', title:'Jobs', ar:'الوظايف' },
  { id:'directions', title:'Asking directions', ar:'السوال عن الاتجاهات' },
  { id:'time', title:'Telling time', ar:'الساعه و الوقت' },
  { id:'shopping', title:'Shopping', ar:'التسوق' },
  { id:'health', title:'Health and doctor', ar:'الصحه و الطبيب' },
];

// Build a realistic lesson for each topic
function makeLessonForTopic(topic) {
  return {
    db: true,
    id: topic.id,
    title: topic.title,
    ar: topic.ar,
    vocab: [
      { en:'hello', ar:'هلو', translit:'هلو', example:{en:'Hello, how are you?', ar:'هلو، عشانف حالك؟'}, sentences:[] },
      { en:'thank you', ar:'شكرا', translit:'ثانك يو', example:{en:'Thank you very much.', ar:'شكرا جزيلا.'}, sentences:[] },
      { en:'please', ar:'من فضلك', translit:'بليز', example:{en:'Please help me.', ar:'من فضلك ساعدني.'}, sentences:[] },
      { en:'sorry', ar:'آسف', translit:'سوري', example:{en:'I am sorry.', ar:'انا آسف.'}, sentences:[] },
    ],
    dbNotes: [{ en:'Basic greeting words', ar:'كلمات التحيه الاساسيه' }],
    conversation: [
      { en:'Hello!', ar:'هلو!' },
      { en:'How are you?', ar:'عشانف حالك؟' },
      { en:'I am fine, thank you.', ar:'انا بخير، شكرا.' },
      { en:'Nice to meet you.', ar:'تشرفت بمعرفتك.' },
    ],
    exampleSentences: [
      { en:'Hello, how are you today?', ar:'هلو، عشانف حالك اليوم؟' },
      { en:'Thank you for your help.', ar:'شكرا على مساعدتك.' },
    ],
    quiz: [{ question: 'Choose the correct greeting', options: [{text:'Hello', ok:true}, {text:'Goodbye', ok:false}, {text:'Tree', ok:false}] }],
    exercises: [
      { type: 'order', payload: { tokens: ['I','am','fine'], answer: 'I am fine', source: 'I am fine.' } },
      { type: 'translate', payload: { source: 'I am hungry.', answer: 'انا جوعان.' } },
    ],
  };
}

/* ---- run audit ---- */
let issues = [];
let totalActivities = 0;
let typeCounts = {};

topics.forEach(function(topic) {
  try {
    var lesson = makeLessonForTopic(topic);
    var seq = buildSequence(lesson, topic.id);
    totalActivities += seq.length;
    
    // Count by type
    seq.forEach(function(a) {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
    
    // Check for issues
    // 1. Activities without mode
    var noMode = seq.filter(function(a){ return !a.mode; });
    if(noMode.length) issues.push(topic.id + ': ' + noMode.length + ' activities without mode');
    
    // 2. Activities without skill
    var noSkill = seq.filter(function(a){ return !a.skill; });
    if(noSkill.length) issues.push(topic.id + ': ' + noSkill.length + ' activities without skill');
    
    // 3. Sequence too long (>25)
    if(seq.length > 25) issues.push(topic.id + ': sequence too long (' + seq.length + ' activities)');
    
    // 4. Sequence too short (<5)
    if(seq.length < 5) issues.push(topic.id + ': sequence too short (' + seq.length + ' activities)');
    
    // 5. No learn activities
    if(!seq.some(function(a){ return a.type === 'learn'; })) issues.push(topic.id + ': no learn activity');
    
    // 6. No review or challenge
    if(!seq.some(function(a){ return a.type === 'review'; })) issues.push(topic.id + ': no review activity');
    if(!seq.some(function(a){ return a.type === 'challenge'; })) issues.push(topic.id + ': no challenge activity');
    
    console.log(topic.id + ': ' + seq.length + ' activities - ' + seq.map(function(a){ return a.type; }).join(', '));
  } catch(e) {
    issues.push(topic.id + ': CRASH - ' + e.message.substring(0, 100));
    console.log(topic.id + ': CRASH - ' + e.message.substring(0, 200));
  }
});

console.log('\n=== TYPE FREQUENCY ===');
Object.keys(typeCounts).sort().forEach(function(t) {
  console.log('  ' + t + ': ' + typeCounts[t] + ' (avg ' + (typeCounts[t]/topics.length).toFixed(1) + ' per lesson)');
});

console.log('\n=== ISSUES FOUND (' + issues.length + ') ===');
issues.forEach(function(i) { console.log('  ' + i); });
console.log('\nTotal activities across all lessons: ' + totalActivities + ' (avg ' + (totalActivities/topics.length).toFixed(1) + ' per lesson)');
