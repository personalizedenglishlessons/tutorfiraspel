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
  // Every entry carries the academy it actually belongs to (verified against
  // ACADEMY_LESSONS in app.html) so the daily card can never pair a lesson
  // with an academy that does not contain it. 'calling-customer-service'
  // was replaced by 'booking-table' because no academy's lesson list
  // contains the former, so it could never open.
  const BANK = [
    {id:'meeting-someone-new',   en:'Meeting Someone New',   ar: 'التعرف على شخص جديد', academy:'everyday-english'},
    {id:'ordering-coffee',       en:'Ordering Coffee',       ar: 'طلب قهوه',             academy:'coffee-shop-english'},
    {id:'talking-with-friends',  en:'Talking With Friends',  ar: 'السؤالف مع الاصحاب',   academy:'american-conversations'},
    {id:'introducing-yourself',  en:'Introducing Yourself',  ar: 'تعرف بنفسك',           academy:'english-foundations'},
    {id:'going-to-airport',      en:'Going To The Airport',  ar: 'الذهاب للمطار',        academy:'airport-english'},
    {id:'booking-hotel',         en:'Booking A Hotel',       ar: 'حجز فندق',             academy:'hotel-english'},
    {id:'booking-table',         en:'Booking A Table',        ar: 'حجز طاوله',            academy:'restaurant-english'},
    {id:'doctor-appointment',    en:'Making A Doctor Appointment', ar: 'حجز موعد عند الدكتور', academy:'hospital-english'},
    {id:'shopping-clothes',      en:'Shopping For Clothes',  ar: 'شرا ملابس',            academy:'shopping-english'},
    {id:'first-day-work',        en:'First Day At Work',     ar: 'اول يوم بالدوام',       academy:'workplace-communication'},
    {id:'talking-family',        en:'Talking About Your Family', ar: 'تتكلم عن عايلتك',   academy:'everyday-english'},
    {id:'weekend-plans',         en:'Weekend Plans',          ar: 'خطط الويكند',           academy:'everyday-english'},
  ];

  // English-track academies in app order (the pool the app uses for the
  // English learning direction). Only ids + display names are needed here.
  const EN_POOL = [
    {id:'english-foundations',      en:'English Foundations',        ar: 'اساسيات الانجليزي'},
    {id:'everyday-english',         en:'Everyday English',           ar: 'انجليزي الحياه اليوميه'},
    {id:'american-conversations',   en:'American Conversations',     ar: 'المحادثات الامريكيه'},
    {id:'speaking-studio',          en:'Speaking Studio',            ar: 'استوديو المحادثه'},
    {id:'american-accent-lab',      en:'American Accent Lab',        ar: 'مختبر اللكنه الامريكيه'},
    {id:'vocabulary-vault',         en:'Vocabulary Vault',           ar: 'خزنه المفردات'},
    {id:'grammar-academy',          en:'Grammar Academy',            ar: 'اكاديميه القواعد'},
    {id:'listening-lounge',         en:'Listening Lounge',           ar: 'ركن الاستماع'},
    {id:'reading-corner',           en:'Reading Corner',             ar: 'ركن القراءه'},
    {id:'writing-workshop',         en:'Writing Workshop',           ar: 'ورشه الكتابه'},
    {id:'travel-english',           en:'Travel English',             ar: 'انجليزي السفر'},
    {id:'business-english',         en:'Business English',           ar: 'انجليزي الاعمال'},
    {id:'workplace-communication',  en:'Workplace Communication',    ar: 'التواصل بالدوام'},
    {id:'job-interview-academy',    en:'Job Interview Academy',      ar: 'اكاديميه مقابلات الشغل'},
    {id:'airport-english',          en:'Airport English',            ar: 'انجليزي المطار'},
    {id:'restaurant-english',       en:'Restaurant English',         ar: 'انجليزي المطاعم'},
    {id:'coffee-shop-english',      en:'Coffee Shop English',        ar: 'انجليزي الكوفي'},
    {id:'hotel-english',            en:'Hotel English',              ar: 'انجليزي الفنادق'},
    {id:'hospital-english',         en:'Hospital English',           ar: 'انجليزي المستشفى'},
    {id:'shopping-english',         en:'Shopping English',           ar: 'انجليزي التسوق'},
    {id:'driving-english',          en:'Driving English',            ar: 'انجليزي القياده'},
    {id:'emergency-english',        en:'Emergency English',          ar: 'انجليزي الطواري'},
    {id:'american-slang',           en:'American Slang',             ar: 'السلانق الامريكي'},
    {id:'idioms-library',           en:'Idioms Library',             ar: 'مكتبه العبارات'},
    {id:'phrasal-verbs-lab',        en:'Phrasal Verbs Lab',          ar: 'مختبر الفرايزل فيربز'},
    {id:'movie-english',            en:'Movie English',              ar: 'تعلم من الافلام'},
    {id:'tv-series-english',        en:'TV Series English',          ar: 'تعلم من المسلسلات'},
    {id:'music-english',            en:'Music English',              ar: 'تعلم من الاغاني'},
    {id:'english-mastery',          en:'English Mastery',            ar: 'اتقان الانجليزي'},
    {id:'fluency-journey',          en:'Fluency Journey',            ar: 'رحله الطلاقه'},
  ];

  // Same selection math as app.html's featuredLesson() for the English
  // direction: academy = pool[day % pool.length], then a lesson title
  // picked by (academy index + day % 6) over the bank. Rotates daily.
  function featured(){
    // Use Saudi local date (not UTC) so the daily lesson rotates at Saudi midnight
    const _d = new Date();
    const dayIdx = parseInt(new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Riyadh'}).format(_d).replace(/-/g,'')) % 100000;
    // Pick the lesson first, then resolve ITS academy: the old math picked
    // academy and lesson independently, so the daily card regularly paired a
    // lesson with an academy that never contained it (dead link / blank
    // lesson). With academy-tagged BANK entries the pair is always real.
    const lesson = BANK[dayIdx % BANK.length];
    const academy = EN_POOL.find(a => a.id === lesson.academy) || EN_POOL[0];
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
