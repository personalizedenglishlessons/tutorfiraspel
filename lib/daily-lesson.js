/* ============================================================
   LESSON OF THE DAY - single source of truth.
   Loaded by both index.html (landing page) and app.html (the
   student platform) so the daily lesson is always the same
   everywhere. Mirrors the app's featuredLesson() algorithm:
   day index -> academy from the English pool -> lesson title.
   ============================================================ */
(function(){
  const DAY_MS = 86400000;

  // Real lesson titles, in the exact order used by the app.
  const BANK = [
    {id:'meeting-someone-new',   en:'Meeting Someone New',   ar:'التعرف على شخص جديد'},
    {id:'ordering-coffee',       en:'Ordering Coffee',       ar:'طلب قهوة'},
    {id:'talking-with-friends',  en:'Talking With Friends',  ar:'السوالف مع الاصحاب'},
    {id:'introducing-yourself',  en:'Introducing Yourself',  ar:'تعرف بنفسك'},
    {id:'going-to-airport',      en:'Going To The Airport',  ar:'الذهاب للمطار'},
    {id:'booking-hotel',         en:'Booking A Hotel',       ar:'حجز فندق'},
    {id:'calling-customer-service', en:'Calling Customer Service', ar:'الاتصال بخدمة العملا'},
    {id:'doctor-appointment',    en:'Making A Doctor Appointment', ar:'حجز موعد عند الدكتور'},
    {id:'shopping-clothes',      en:'Shopping For Clothes',  ar:'شرا ملابس'},
    {id:'first-day-work',        en:'First Day At Work',     ar:'اول يوم بالدوام'},
    {id:'talking-family',        en:'Talking About Your Family', ar:'تتكلم عن عايلتك'},
    {id:'weekend-plans',         en:'Weekend Plans',         ar:'خطط الويكند'},
  ];

  // English-track academies in app order (the pool the app uses for the
  // English learning direction). Only ids + display names are needed here.
  const EN_POOL = [
    {id:'english-foundations',      en:'English Foundations',        ar:'اساسيات الانجليزي'},
    {id:'everyday-english',         en:'Everyday English',           ar:'انجليزي الحياة اليومية'},
    {id:'american-conversations',   en:'American Conversations',     ar:'المحادثات الامريكية'},
    {id:'speaking-studio',          en:'Speaking Studio',            ar:'استوديو المحادثة'},
    {id:'american-accent-lab',      en:'American Accent Lab',        ar:'مختبر اللكنة الامريكية'},
    {id:'vocabulary-vault',         en:'Vocabulary Vault',           ar:'خزنة المفردات'},
    {id:'grammar-academy',          en:'Grammar Academy',            ar:'اكاديمية القواعد'},
    {id:'listening-lounge',         en:'Listening Lounge',           ar:'ركن الاستماع'},
    {id:'reading-corner',           en:'Reading Corner',             ar:'ركن القرايه'},
    {id:'writing-workshop',         en:'Writing Workshop',           ar:'ورشة الكتابة'},
    {id:'travel-english',           en:'Travel English',             ar:'انجليزي السفر'},
    {id:'business-english',         en:'Business English',           ar:'انجليزي الاعمال'},
    {id:'workplace-communication',  en:'Workplace Communication',    ar:'التواصل بالدوام'},
    {id:'job-interview-academy',    en:'Job Interview Academy',      ar:'اكاديمية مقابلات العمل'},
    {id:'airport-english',          en:'Airport English',            ar:'انجليزي المطار'},
    {id:'restaurant-english',       en:'Restaurant English',         ar:'انجليزي المطاعم'},
    {id:'coffee-shop-english',      en:'Coffee Shop English',        ar:'انجليزي الكوفي'},
    {id:'hotel-english',            en:'Hotel English',              ar:'انجليزي الفنادق'},
    {id:'hospital-english',         en:'Hospital English',           ar:'انجليزي المستشفى'},
    {id:'shopping-english',         en:'Shopping English',           ar:'انجليزي التسوق'},
    {id:'driving-english',          en:'Driving English',            ar:'انجليزي القيادة'},
    {id:'emergency-english',        en:'Emergency English',          ar:'انجليزي الطواري'},
    {id:'american-slang',           en:'American Slang',             ar:'السلانق الامريكي'},
    {id:'idioms-library',           en:'Idioms Library',             ar:'مكتبة العبارات'},
    {id:'phrasal-verbs-lab',        en:'Phrasal Verbs Lab',          ar:'مختبر الفريزل فيربز'},
    {id:'movie-english',            en:'Movie English',              ar:'تعلم من الافلام'},
    {id:'tv-series-english',        en:'TV Series English',          ar:'تعلم من المسلسلات'},
    {id:'music-english',            en:'Music English',              ar:'تعلم من الاغاني'},
    {id:'english-mastery',          en:'English Mastery',            ar:'اتقان الانجليزي'},
    {id:'fluency-journey',          en:'Fluency Journey',            ar:'رحلة الطلاقة'},
  ];

  // Same selection math as app.html's featuredLesson() for the English
  // direction: academy = pool[day % pool.length], then a lesson title
  // picked by (academy index + day % 6) over the bank. Rotates daily.
  function featured(){
    const dayIdx = Math.floor(Date.now() / DAY_MS);
    const academy = EN_POOL[dayIdx % EN_POOL.length];
    const ai = EN_POOL.indexOf(academy);
    const lesson = BANK[(ai + (dayIdx % 6)) % BANK.length];
    return { academy: academy, lesson: lesson };
  }

  window.PEL_DAILY = {
    BANK: BANK,
    EN_POOL: EN_POOL,
    featured: featured,
    lessonById: function(id){ return BANK.find(l => l.id === id) || null; },
    academyById: function(id){ return EN_POOL.find(a => a.id === id) || null; }
  };
})();
