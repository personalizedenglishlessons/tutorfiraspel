/* ============================================================
   PEL PERSONALIZATION ENGINE - shared by index.html (public
   onboarding) and app.html (the living curriculum).

   ONE system. The visitor builds a plan on the index; the same
   engine serves the student's route, daily recommendations,
   unlocks and adaptive focus inside the application.

   The engine is dependency-free and works on plain data objects.
   Hosts pass in their own state (completed lessons, review due,
   measured skill data) and resolve lesson content themselves.

   Lesson metadata embedded here is a compact REFERENCE TABLE
   (ids + bilingual titles + duration only) so the public index
   can render a matched plan without the app's lesson library.
   Actual lesson content stays in app.html (LESSON_LIBRARY).
   ============================================================ */
(function(){
  'use strict';

  /* ---------------- CEFR LEVELS (learner-friendly) ---------------- */
  const LEVELS = [
    { id:'A1', en:'Starting Out', ar:'تبدا من الصفر',
      descEn:'Building the basics: sounds, simple words, short sentences.',
      descAr:'تبني الاساس: الاصوات، الكلمات البسيطة، والجمل القصيرة.' },
    { id:'A2', en:'Getting Comfortable', ar:'تبني اساسك',
      descEn:'Handling simple real situations: ordering, asking, introducing.',
      descAr:'تتعامل مع مواقف بسيطة: تطلب، تسال، تعرف بنفسك.' },
    { id:'B1', en:'Gaining Confidence', ar:'توصل للثقة',
      descEn:'Communicating through real conversations, mistakes and all.',
      descAr:'تتواصل بمحادثات حقيقية، مع اخطايك عادي.' },
    { id:'B2', en:'Working It', ar:'تشغلها بجدية',
      descEn:'Handling work, meetings and everyday life with less effort.',
      descAr:'تدير الدوام والاجتماعات وحياتك اليومية بدون تعب.' },
    { id:'C1', en:'Nearly Natural', ar:'قريب من الطبيعي',
      descEn:'Speaking naturally and handling almost anything with ease.',
      descAr:'تتكلم بشكل طبيعي وتدير اغلب المواقف بسهولة.' },
  ];

  /* ---------------- ACADEMY REFERENCE (English track) --------------
     Compact copy of app.html ACADEMIES metadata so the index can
     render plans and route previews. Content stays in app.html. */
  const ACADEMY_META = {
    'english-foundations':     { en:'English Foundations', ar:'اساسيات الانجليزي', icon:'graduation-cap', from:'#C8A96A', to:'#A88345', diff:'Beginner', level:'A1' },
    'everyday-english':        { en:'Everyday English', ar:'انجليزي الحياة اليومية', icon:'sun', from:'#D8BD83', to:'#C8A96A', diff:'Beginner', level:'A2' },
    'american-conversations':  { en:'American Conversations', ar:'المحادثات الامريكية', icon:'message-circle', from:'#3F8C72', to:'#276b53', diff:'Intermediate', level:'B1' },
    'speaking-studio':         { en:'Speaking Studio', ar:'استوديو المحادثة', icon:'mic-2', from:'#3F8C72', to:'#C8A96A', diff:'Intermediate', level:'B1' },
    'american-accent-lab':     { en:'American Accent Lab', ar:'مختبر اللكنة الامريكية', icon:'mic', from:'#C8A96A', to:'#D8BD83', diff:'Intermediate', level:'B1' },
    'vocabulary-vault':        { en:'Vocabulary Vault', ar:'خزنة المفردات', icon:'book-open', from:'#A88345', to:'#C8A96A', diff:'All Levels', level:'A2' },
    'grammar-academy':         { en:'Grammar Academy', ar:'اكاديمية القواعد', icon:'spell-check', from:'#343744', to:'#262833', diff:'All Levels', level:'A2' },
    'listening-lounge':        { en:'Listening Lounge', ar:'ركن الاستماع', icon:'headphones', from:'#3F8C72', to:'#17171B', diff:'Intermediate', level:'B1' },
    'reading-corner':          { en:'Reading Corner', ar:'ركن القرايه', icon:'book', from:'#C8A96A', to:'#17171B', diff:'Intermediate', level:'B1' },
    'writing-workshop':        { en:'Writing Workshop', ar:'ورشة الكتابة', icon:'pen-line', from:'#A88345', to:'#17171B', diff:'Advanced', level:'B2' },
    'travel-english':          { en:'Travel English', ar:'انجليزي السفر', icon:'plane', from:'#3F8C72', to:'#C8A96A', diff:'Intermediate', level:'B1' },
    'business-english':        { en:'Business English', ar:'انجليزي الاعمال', icon:'briefcase', from:'#343744', to:'#C8A96A', diff:'Advanced', level:'B2' },
    'workplace-communication': { en:'Workplace Communication', ar:'التواصل بالدوام', icon:'building-2', from:'#262833', to:'#A88345', diff:'Advanced', level:'B2' },
    'job-interview-academy':   { en:'Job Interview Academy', ar:'اكاديمية مقابلات العمل', icon:'user-check', from:'#C8A96A', to:'#343744', diff:'Advanced', level:'B2' },
    'airport-english':         { en:'Airport English', ar:'انجليزي المطار', icon:'plane-takeoff', from:'#3F8C72', to:'#17171B', diff:'Beginner', level:'A2' },
    'restaurant-english':      { en:'Restaurant English', ar:'انجليزي المطاعم', icon:'utensils', from:'#C8A96A', to:'#A88345', diff:'Beginner', level:'A2' },
    'coffee-shop-english':     { en:'Coffee Shop English', ar:'انجليزي الكوفي', icon:'coffee', from:'#A88345', to:'#D8BD83', diff:'Beginner', level:'A2' },
    'hotel-english':           { en:'Hotel English', ar:'انجليزي الفنادق', icon:'bed', from:'#343744', to:'#C8A96A', diff:'Beginner', level:'A2' },
    'hospital-english':        { en:'Hospital English', ar:'انجليزي المستشفى', icon:'cross', from:'#3F8C72', to:'#343744', diff:'Intermediate', level:'B1' },
    'shopping-english':        { en:'Shopping English', ar:'انجليزي التسوق', icon:'shopping-bag', from:'#C8A96A', to:'#3F8C72', diff:'Beginner', level:'A2' },
    'driving-english':         { en:'Driving English', ar:'انجليزي القيادة', icon:'car', from:'#262833', to:'#D8BD83', diff:'Beginner', level:'A2' },
    'emergency-english':       { en:'Emergency English', ar:'انجليزي الطواري', icon:'siren', from:'#D25C5C', to:'#343744', diff:'Intermediate', level:'B1' },
    'american-slang':          { en:'American Slang', ar:'السلانق الامريكي', icon:'sparkles', from:'#C8A96A', to:'#17171B', diff:'Advanced', level:'B2' },
    'idioms-library':          { en:'Idioms Library', ar:'مكتبة العبارات', icon:'quote', from:'#A88345', to:'#17171B', diff:'Advanced', level:'B2' },
    'phrasal-verbs-lab':       { en:'Phrasal Verbs Lab', ar:'مختبر الفريزل فيربز', icon:'shuffle', from:'#3F8C72', to:'#A88345', diff:'Advanced', level:'B2' },
    'movie-english':           { en:'Movie English', ar:'تعلم من الافلام', icon:'film', from:'#343744', to:'#17171B', diff:'Advanced', level:'B2' },
    'tv-series-english':       { en:'TV Series English', ar:'تعلم من المسلسلات', icon:'tv', from:'#17171B', to:'#343744', diff:'Advanced', level:'B2' },
    'music-english':           { en:'Music English', ar:'تعلم من الاغاني', icon:'music', from:'#A88345', to:'#3F8C72', diff:'Intermediate', level:'B1' },
    'english-mastery':         { en:'English Mastery', ar:'اتقان الانجليزي', icon:'crown', from:'#C8A96A', to:'#D8BD83', diff:'Advanced', level:'C1' },
    'fluency-journey':         { en:'Fluency Journey', ar:'رحلة الطلاقة', icon:'compass', from:'#D8BD83', to:'#A88345', diff:'All Levels', level:'C1' },
  };

  /* ---------------- LESSON REFERENCE TABLE ----------------
     id -> { t:title(en), a:title(ar), d:duration, v:difficulty } */
  const LESSON_META = {"the-alphabet":{"t":"The Alphabet & Letter Sounds","a":"الحروف الانجليزية ونطقها","d":"7 min","v":"Beginner"},"greetings-goodbye":{"t":"Greetings and Goodbyes","a":"التحية والوداع","d":"7 min","v":"Beginner"},"introducing-yourself":{"t":"Introducing Yourself","a":"تعريف نفسك","d":"8 min","v":"Beginner"},"numbers-dates":{"t":"Numbers, Prices and Dates","a":"الارقام والاسعار والتواريخ","d":"8 min","v":"Beginner"},"personal-information":{"t":"Personal Information Forms","a":"تعبي استمارة بياناتك","d":"7 min","v":"Beginner"},"basic-questions":{"t":"Basic Questions With What, Where, When","a":"الاسيلة الاساسية: وش، وين، متى","d":"8 min","v":"Beginner"},"small-talk-weather":{"t":"Small Talk: The Weather","a":"سوالف خفيفة: الجو","d":"7 min","v":"Beginner"},"talking-family":{"t":"Talking About Your Family","a":"تحكي عن عايلتك","d":"8 min","v":"Beginner"},"weekend-plans":{"t":"Weekend Plans","a":"خطط الويكند","d":"8 min","v":"Beginner"},"daily-routines":{"t":"Daily Routines","a":"روتينك اليومي","d":"8 min","v":"Beginner"},"inviting-friends":{"t":"Inviting Friends Out","a":"تدعي اصحابك تطلعون","d":"8 min","v":"Beginner"},"catching-up":{"t":"Catching Up With Friends","a":"نسولف مع اصحابك","d":"8 min","v":"Intermediate"},"opinions-agreeing":{"t":"Opinions, Agreeing and Disagreeing","a":"الراي والموافقة والاختلاف","d":"9 min","v":"Intermediate"},"asking-favors":{"t":"Asking for Favors","a":"تطلب خدمة","d":"8 min","v":"Intermediate"},"clarifying-misunderstandings":{"t":"Clarifying Misunderstandings","a":"توضيح سو الفهم","d":"9 min","v":"Intermediate"},"talking-past-events":{"t":"Talking About Past Events","a":"تحكي عن احداث سابقة","d":"9 min","v":"Intermediate"},"asking-directions":{"t":"Asking for Directions","a":"تسال عن الاتجاهات","d":"8 min","v":"Beginner"},"currency-exchanging":{"t":"Exchanging Money","a":"تصريف العملة","d":"8 min","v":"Intermediate"},"check-in-desk":{"t":"Airport Check-in","a":"الكاونتر بالمطار","d":"8 min","v":"Beginner"},"security-checks":{"t":"Security Checks","a":"التفتيش بالامن","d":"8 min","v":"Beginner"},"delays-cancellations":{"t":"Delays and Cancellations","a":"التاخير والالغا","d":"9 min","v":"Intermediate"},"checking-in":{"t":"Hotel Check-in","a":"تسجيل الدخول بالفندق","d":"8 min","v":"Beginner"},"hotel-requests":{"t":"Hotel Requests","a":"طلباتك بالفندق","d":"8 min","v":"Beginner"},"hotel-problems":{"t":"Hotel Problems","a":"مشاكل الفندق","d":"9 min","v":"Intermediate"},"booking-table":{"t":"Booking A Table","a":"حجز طاولة","d":"8 min","v":"Beginner"},"ordering-food":{"t":"Ordering Food","a":"تطلب اكل","d":"9 min","v":"Beginner"},"dietary-requests":{"t":"Dietary Requests and Allergies","a":"الطلبات الغذايية والحساسية","d":"8 min","v":"Intermediate"},"paying-bill":{"t":"Paying The Bill","a":"تدفع الحساب","d":"8 min","v":"Beginner"},"coffee-sizes":{"t":"Coffee Sizes and Types","a":"مقاسات القهوة وانواعها","d":"7 min","v":"Beginner"},"customizing-order":{"t":"Customizing Your Coffee","a":"تعديل طلب القهوة","d":"7 min","v":"Beginner"},"doctor-appointment":{"t":"Making A Doctor Appointment","a":"حجز موعد عند الدكتور","d":"8 min","v":"Beginner"},"describing-symptoms":{"t":"Describing Symptoms","a":"تصف الاعراض","d":"9 min","v":"Intermediate"},"pharmacy-requests":{"t":"At The Pharmacy","a":"بالصيدلية","d":"8 min","v":"Intermediate"},"emergency-room":{"t":"Emergency Room","a":"الطواري","d":"9 min","v":"Intermediate"},"shopping-clothes":{"t":"Shopping For Clothes","a":"شرا ملابس","d":"8 min","v":"Beginner"},"asking-prices":{"t":"Asking Prices","a":"تسال عن الاسعار","d":"7 min","v":"Beginner"},"refunds-exchanges":{"t":"Refunds and Exchanges","a":"الاسترجاع والاستبدال","d":"9 min","v":"Intermediate"},"renting-car":{"t":"Renting A Car","a":"تاجير سيارة","d":"8 min","v":"Intermediate"},"gas-station":{"t":"At The Gas Station","a":"محطة البنزين","d":"7 min","v":"Beginner"},"directions-driving":{"t":"Directions While Driving","a":"الاتجاهات اثنا القيادة","d":"8 min","v":"Intermediate"},"calling-911":{"t":"Calling For Help","a":"الاتصال بالطواري","d":"8 min","v":"Intermediate"},"medical-emergency":{"t":"Medical Emergency Help","a":"مساعدة طبية طارية","d":"9 min","v":"Intermediate"},"meeting-etiquette":{"t":"Meeting Etiquette","a":"اداب الاجتماعات","d":"9 min","v":"Advanced"},"email-phrases-business":{"t":"Business Email Phrases","a":"عبارات الايميلات الرسمية","d":"9 min","v":"Advanced"},"phone-calls-business":{"t":"Business Phone Calls","a":"مكالمات العمل","d":"9 min","v":"Advanced"},"first-day-work":{"t":"First Day At Work","a":"اول يوم بالدوام","d":"9 min","v":"Intermediate"},"asking-for-help-work":{"t":"Asking For Help At Work","a":"تطلب مساعدة بالدوام","d":"8 min","v":"Intermediate"},"giving-feedback":{"t":"Giving And Receiving Feedback","a":"تعطي وتاخذ ملاحظات","d":"9 min","v":"Advanced"},"interview-self-intro":{"t":"Interview: Tell Me About Yourself","a":"المقابلة: عرفني عن نفسك","d":"10 min","v":"Advanced"},"interview-strengths":{"t":"Interview: Strengths and Weaknesses","a":"المقابلة: نقاط القوة والضعف","d":"10 min","v":"Advanced"},"interview-follow-up":{"t":"Interview Follow-up","a":"متابعة بعد المقابلة","d":"8 min","v":"Advanced"},"present-simple-lesson":{"t":"Present Simple Mastery","a":"اتقان المضارع البسيط","d":"9 min","v":"Intermediate"},"past-simple-lesson":{"t":"Past Simple Mastery","a":"اتقان الماضي البسيط","d":"9 min","v":"Intermediate"},"future-forms-lesson":{"t":"Future Forms: Will and Going To","a":"المستقبل: will و going to","d":"9 min","v":"Intermediate"},"learning-words-effectively":{"t":"How To Learn Words Effectively","a":"كيف تتعلم الكلمات بفعالية","d":"9 min","v":"All Levels"},"collocations-basics":{"t":"Collocations: Words That Go Together","a":"الكلمات اللي تجي مع بعض","d":"8 min","v":"Intermediate"},"sounding-natural":{"t":"Sounding Natural: Contractions","a":"كلام طبيعي: الاختصارات","d":"8 min","v":"Intermediate"},"word-stress-basics":{"t":"Word Stress Basics","a":"اساسيات التشديد","d":"8 min","v":"Intermediate"},"linking-words":{"t":"Linking Words Together","a":"وصل الكلمات ببعض","d":"8 min","v":"Advanced"},"listening-announcements":{"t":"Listening To Announcements","a":"تستمع للاعلانات","d":"9 min","v":"Intermediate"},"listening-phone-calls":{"t":"Listening On Phone Calls","a":"الاستماع بالمكالمات","d":"9 min","v":"Intermediate"},"reading-emails":{"t":"Reading Emails Quickly","a":"قرايه الايميلات بسرعة","d":"8 min","v":"Intermediate"},"reading-signs":{"t":"Reading Signs and Notices","a":"قرايه اللوحات والاشارات","d":"7 min","v":"Beginner"},"writing-emails-polite":{"t":"Polite Email Writing","a":"كتابة ايميل مهذب","d":"9 min","v":"Advanced"},"writing-messages":{"t":"Writing WhatsApp-Style Messages","a":"كتابة رسايل قصيرة","d":"7 min","v":"Intermediate"},"slang-basics":{"t":"Everyday American Slang","a":"السلانق الامريكي اليومي","d":"8 min","v":"Advanced"},"idioms-basics":{"t":"Idioms You Hear Every Day","a":"تعابير تسمعها كل يوم","d":"9 min","v":"Advanced"},"phrasal-basics":{"t":"Phrasal Verbs: Look, Give, Call","a":"الافعال المركبة الشايعة","d":"9 min","v":"Advanced"},"movie-talk":{"t":"Talking About Movies","a":"تحكي عن الافلام","d":"8 min","v":"Intermediate"},"music-talk":{"t":"Talking About Music","a":"تحكي عن الاغاني","d":"8 min","v":"Intermediate"},"mastery-review":{"t":"Mastery Review: Build Your Own Lesson","a":"مراجعة الاتقان","d":"10 min","v":"Advanced"},"fluency-habit":{"t":"Building The Daily Habit","a":"بنا عادة التعلم اليومية","d":"8 min","v":"All Levels"},"calling-customer-service":{"t":"Calling Customer Service","a":"الاتصال بخدمة العملا","d":"9 min","v":"Intermediate"},"sa-hello-hala":{"t":"Hala: The Saudi Hello","a":"هلا والله","d":"6 min","v":"Beginner"},"sa-how-are-you":{"t":"Asking How Someone Is","a":"كيف حالك","d":"7 min","v":"Beginner"},"sa-bye-inshallah":{"t":"Saying Goodbye","a":"مع السلامة","d":"6 min","v":"Beginner"},"sa-thank-you":{"t":"Thanking Someone","a":"شكرا ويعطيك العافية","d":"6 min","v":"Beginner"},"sa-introducing-name":{"t":"Saying Your Name","a":"اسمي","d":"6 min","v":"Beginner"},"sa-meeting-new":{"t":"Meeting Someone New","a":"التعرف على شخص جديد","d":"7 min","v":"Beginner"},"sa-taxi-driver":{"t":"Taking a Taxi","a":"اخذ تاكسي","d":"8 min","v":"Beginner"},"sa-market-shopping":{"t":"Shopping at the Market","a":"تسوق بالسوق","d":"8 min","v":"Beginner"},"sa-family-talk":{"t":"Talking About Family","a":"سوالف العايلة","d":"8 min","v":"Beginner"},"sa-plans-weekend":{"t":"Weekend Plans","a":"خطط الويكند","d":"7 min","v":"Beginner"},"sa-restaurant-order":{"t":"Ordering at a Restaurant","a":"طلب بالمطعم","d":"8 min","v":"Beginner"},"sa-clarifying-again":{"t":"When You Do Not Understand","a":"اذا ما فهمت","d":"6 min","v":"Beginner"},"sa-coffee-order":{"t":"Ordering Coffee the Saudi Way","a":"طلب قهوة سعودي","d":"7 min","v":"Beginner"},"sa-coffee-sizes":{"t":"Coffee Sizes and Types","a":"انواع القهوة","d":"7 min","v":"Beginner"},"sa-coffee-smalltalk":{"t":"Small Talk at the Coffee Shop","a":"سوالف الكوفي","d":"7 min","v":"Intermediate"},"sa-coffee-pay":{"t":"Paying at the Coffee Shop","a":"الدفع بالكوفي","d":"6 min","v":"Beginner"},"sa-smalltalk-work":{"t":"Small Talk at Work","a":"سوالف الدوام","d":"7 min","v":"Intermediate"},"sa-inviting-friend":{"t":"Inviting a Friend","a":"دعوة صديق","d":"7 min","v":"Intermediate"},"sa-opinions":{"t":"Giving Your Opinion","a":"ابدا رايك","d":"7 min","v":"Intermediate"},"sa-apologizing":{"t":"Apologizing the Saudi Way","a":"الاعتذار","d":"6 min","v":"Intermediate"},"sa-saying-no-politely":{"t":"Saying No Politely","a":"رفض مودب","d":"7 min","v":"Intermediate"},"sa-describing-day":{"t":"Describing Your Day","a":"وصف يومك","d":"8 min","v":"Intermediate"},"sa-work-greeting":{"t":"Greetings at the Office","a":"تحية المكتب","d":"6 min","v":"Intermediate"},"sa-meeting-talk":{"t":"Speaking in a Meeting","a":"الكلام بالاجتماع","d":"8 min","v":"Intermediate"},"sa-asking-help":{"t":"Asking for Help","a":"طلب المساعدة","d":"7 min","v":"Intermediate"},"sa-deadline-talk":{"t":"Deadlines and Timing","a":"المواعيد النهايية","d":"7 min","v":"Intermediate"},"sa-feedback-saudi":{"t":"Giving Feedback at Work","a":"اعطا ملاحظات","d":"8 min","v":"Intermediate"},"sa-phone-work":{"t":"Work Phone Calls","a":"مكالمات الدوام","d":"8 min","v":"Intermediate"},"sa-family-parents":{"t":"Talking to Parents Respectfully","a":"الكلام مع الوالدين","d":"7 min","v":"Beginner"},"sa-family-gathering":{"t":"The Family Gathering","a":"اللمة العايلية","d":"7 min","v":"Beginner"},"sa-family-meals":{"t":"Family Meals","a":"وجبات العايلة","d":"7 min","v":"Beginner"},"sa-family-marriage":{"t":"Wedding Talk","a":"سوالف العرس","d":"8 min","v":"Intermediate"},"sa-family-kids":{"t":"Talking About Children","a":"الكلام عن الاطفال","d":"7 min","v":"Intermediate"},"sa-family-visit":{"t":"Visiting Relatives","a":"زيارة الاقارب","d":"7 min","v":"Beginner"},"sa-hospital-appointment":{"t":"Booking a Doctor Appointment","a":"حجز موعد طبيب","d":"8 min","v":"Intermediate"},"sa-hospital-symptoms":{"t":"Describing Symptoms","a":"وصف الاعراض","d":"8 min","v":"Intermediate"},"sa-hospital-pharmacy":{"t":"At the Pharmacy","a":"عند الصيدلية","d":"7 min","v":"Intermediate"},"sa-hospital-reception":{"t":"At Hospital Reception","a":"استقبال المستشفى","d":"7 min","v":"Intermediate"},"sa-hospital-visit":{"t":"Visiting a Patient","a":"زيارة مريض","d":"7 min","v":"Intermediate"},"sa-hospital-emergency":{"t":"In an Emergency","a":"في الطواري","d":"8 min","v":"Intermediate"},"sa-travel-booking":{"t":"Booking a Flight","a":"حجز رحلة طيران","d":"8 min","v":"Beginner"},"sa-travel-airport":{"t":"At the Airport","a":"في المطار","d":"8 min","v":"Beginner"},"sa-travel-hotel":{"t":"Checking Into a Hotel","a":"تسجيل الفندق","d":"8 min","v":"Beginner"},"sa-travel-directions":{"t":"Asking for Directions","a":"سوال عن الاتجاهات","d":"7 min","v":"Beginner"},"sa-travel-lost":{"t":"When You Get Lost","a":"لما تضيع","d":"7 min","v":"Beginner"},"sa-travel-flight-delay":{"t":"Flight Delays and Changes","a":"تاخير الرحلات","d":"7 min","v":"Intermediate"},"sa-mosque-greeting":{"t":"The Mosque Greeting","a":"تحية المسجد","d":"7 min","v":"Intermediate"},"sa-mosque-wudu":{"t":"Ablution at the Mosque","a":"الوضو بالمسجد","d":"7 min","v":"Intermediate"},"sa-mosque-time":{"t":"Prayer Times","a":"مواقيت الصلاة","d":"7 min","v":"Intermediate"},"sa-mosque-after-prayer":{"t":"After the Prayer","a":"بعد الصلاة","d":"6 min","v":"Intermediate"},"sa-mosque-eid":{"t":"Eid Greetings","a":"تهاني العيد","d":"7 min","v":"Intermediate"},"sa-mosque-ramadan":{"t":"Ramadan Phrases","a":"عبارات رمضان","d":"7 min","v":"Intermediate"},"sa-phone-answer":{"t":"Answering the Phone","a":"الرد على الاتصال","d":"7 min","v":"Intermediate"},"sa-phone-wrong-number":{"t":"Wrong Number","a":"رقم غلط","d":"6 min","v":"Intermediate"},"sa-phone-message":{"t":"Leaving a Message","a":"ترك رسالة","d":"7 min","v":"Intermediate"},"sa-phone-callback":{"t":"Calling Back","a":"اعادة الاتصال","d":"6 min","v":"Intermediate"},"sa-phone-busy":{"t":"When Someone Is Busy","a":"لما يكون مشغول","d":"6 min","v":"Intermediate"},"sa-phone-end":{"t":"Ending a Call","a":"انها المكالمة","d":"6 min","v":"Intermediate"},"meeting-someone-new":{"t":"Meeting Someone New","a":"التعرف على شخص جديد","d":"7 min","v":"Beginner"},"ordering-coffee":{"t":"Ordering Coffee","a":"طلب قهوة","d":"9 min","v":"Beginner"},"talking-with-friends":{"t":"Talking With Friends","a":"السوالف مع الاصحاب","d":"8 min","v":"Intermediate"},"going-to-airport":{"t":"Going To The Airport","a":"الذهاب للمطار","d":"8 min","v":"Beginner"},"booking-hotel":{"t":"Booking A Hotel","a":"حجز فندق","d":"9 min","v":"Beginner"}};

  /* Ordered curated lesson ids per academy (mirrors app.html
     ACADEMY_LESSONS so the route points at real content). */
  const ACADEMY_LESSONS = {
    'english-foundations': ['the-alphabet','greetings-goodbye','introducing-yourself','numbers-dates','personal-information','basic-questions'],
    'everyday-english': ['meeting-someone-new','small-talk-weather','talking-family','weekend-plans','daily-routines','inviting-friends'],
    'american-conversations': ['talking-with-friends','catching-up','opinions-agreeing','asking-favors','clarifying-misunderstandings','talking-past-events'],
    'speaking-studio': ['sounding-natural','linking-words','asking-favors','clarifying-misunderstandings','daily-routines','catching-up'],
    'american-accent-lab': ['word-stress-basics','linking-words','sounding-natural','introducing-yourself','daily-routines','catching-up'],
    'vocabulary-vault': ['learning-words-effectively','collocations-basics','numbers-dates','personal-information','basic-questions','introducing-yourself'],
    'grammar-academy': ['present-simple-lesson','past-simple-lesson','future-forms-lesson','numbers-dates','daily-routines','basic-questions'],
    'listening-lounge': ['listening-announcements','listening-phone-calls','asking-directions','delays-cancellations','check-in-desk','currency-exchanging'],
    'reading-corner': ['reading-emails','reading-signs','writing-emails-polite','writing-messages','meeting-etiquette','email-phrases-business'],
    'writing-workshop': ['writing-emails-polite','writing-messages','email-phrases-business','giving-feedback','reading-emails','meeting-etiquette'],
    'travel-english': ['going-to-airport','asking-directions','currency-exchanging','check-in-desk','security-checks','hotel-requests'],
    'business-english': ['meeting-etiquette','email-phrases-business','phone-calls-business','giving-feedback','asking-for-help-work','future-forms-lesson'],
    'workplace-communication': ['first-day-work','asking-for-help-work','giving-feedback','meeting-etiquette','phone-calls-business','email-phrases-business'],
    'job-interview-academy': ['interview-self-intro','interview-strengths','interview-follow-up','first-day-work','giving-feedback','email-phrases-business'],
    'airport-english': ['going-to-airport','check-in-desk','security-checks','delays-cancellations','asking-directions','currency-exchanging'],
    'restaurant-english': ['booking-table','ordering-food','dietary-requests','paying-bill','coffee-sizes','customizing-order'],
    'coffee-shop-english': ['ordering-coffee','coffee-sizes','customizing-order','small-talk-weather','inviting-friends','daily-routines'],
    'hotel-english': ['booking-hotel','checking-in','hotel-requests','hotel-problems','asking-directions','currency-exchanging'],
    'hospital-english': ['doctor-appointment','describing-symptoms','pharmacy-requests','emergency-room','medical-emergency','personal-information'],
    'shopping-english': ['shopping-clothes','asking-prices','refunds-exchanges','numbers-dates','greetings-goodbye','personal-information'],
    'driving-english': ['renting-car','gas-station','directions-driving','asking-directions','delays-cancellations','asking-favors'],
    'emergency-english': ['calling-911','medical-emergency','emergency-room','describing-symptoms','asking-directions','pharmacy-requests'],
    'american-slang': ['slang-basics','idioms-basics','phrasal-basics','movie-talk','music-talk','sounding-natural'],
    'idioms-library': ['idioms-basics','slang-basics','phrasal-basics','movie-talk','music-talk','collocations-basics'],
    'phrasal-verbs-lab': ['phrasal-basics','idioms-basics','slang-basics','collocations-basics','learning-words-effectively','movie-talk'],
    'movie-english': ['movie-talk','music-talk','talking-past-events','opinions-agreeing','catching-up','sounding-natural'],
    'tv-series-english': ['movie-talk','music-talk','catching-up','talking-past-events','opinions-agreeing','inviting-friends'],
    'music-english': ['music-talk','movie-talk','sounding-natural','linking-words','daily-routines','catching-up'],
    'english-mastery': ['mastery-review','fluency-habit','learning-words-effectively','collocations-basics','sounding-natural','linking-words'],
    'fluency-journey': ['fluency-habit','mastery-review','learning-words-effectively','daily-routines','sounding-natural','catching-up'],
  };

  /* ---------------- QUESTIONNAIRE CATALOG (bilingual) ---------------- */
  const QUESTIONS = [
    { key:'q1', multi:true, max:4, id:'goals',
      title:{ en:'Why do you want English?', ar:'ليش تبي تتعلم انجليزي؟' },
      sub:{ en:'Pick everything that matters. You can change this later.', ar:'اختر كل شي يهمك. تقدر تغيره بعدين.' },
      options:[
        { id:'work', en:'Work', ar:'شغل' },
        { id:'new-job', en:'A new job', ar:'وظيفة جديدة' },
        { id:'interviews', en:'Interviews', ar:'مقابلات' },
        { id:'travel', en:'Travel', ar:'سفر' },
        { id:'everyday', en:'Everyday life', ar:'حياتك اليومية' },
        { id:'study', en:'Study', ar:'دراسة' },
        { id:'university', en:'University', ar:'جامعة' },
        { id:'business', en:'Business', ar:'بيزنس' },
        { id:'people', en:'Talking to people', ar:'تتكلم مع الناس' },
        { id:'friends', en:'Making friends', ar:'تتعرف على اصحاب' },
        { id:'media', en:'Understanding movies and shows', ar:'تفهم الافلام والمسلسلات' },
        { id:'customers', en:'Customer service', ar:'خدمة عملا' },
        { id:'abroad', en:'Living abroad', ar:'تعيش برا' },
        { id:'confidence', en:'Confidence', ar:'ثقة بالنفس' },
        { id:'improve', en:'Personal improvement', ar:'تطوير نفسك' },
      ]},
    { key:'q2', multi:true, max:4, id:'abilities',
      title:{ en:'What do you want to be able to do?', ar:'وش تبي توصل له؟' },
      sub:{ en:'These become your learning targets.', ar:'هذي تتحول لاهدافك التعلمية.' },
      options:[
        { id:'speak-no-freeze', en:'Speak without freezing', ar:'تتكلم بدون ما تجمد' },
        { id:'understand', en:'Understand people more easily', ar:'تفهم الناس اسهل' },
        { id:'stop-translating', en:'Stop translating in my head', ar:'توقف الترجمة براسك' },
        { id:'write-messages', en:'Write better messages', ar:'تكتب رسايل افضل' },
        { id:'work-convos', en:'Handle work conversations', ar:'تدير محادثات الدوام' },
        { id:'handle-interviews', en:'Handle interviews', ar:'تدير المقابلات' },
        { id:'order-confidently', en:'Order things confidently', ar:'تطلب بثقة' },
        { id:'ask-help', en:'Ask for help', ar:'تطلب مساعدة' },
        { id:'small-talk', en:'Make small talk', ar:'تسولف سوالف خفيفة' },
        { id:'media', en:'Understand English media', ar:'تفهم المحتوى الانجليزي' },
        { id:'natural', en:'Speak more naturally', ar:'تتكلم بشكل طبيعي' },
        { id:'customers', en:'Communicate with customers', ar:'تتواصل مع العملا' },
      ]},
    { key:'q3', multi:true, max:5, id:'contexts',
      title:{ en:'Where will you actually use English?', ar:'وين بتستخدم الانجليزي فعليا؟' },
      sub:{ en:'This shapes which real-life lessons come first.', ar:'هذا يحدد وش الدروس العملية اللي تبدا فيها.' },
      options:[
        { id:'workplace', en:'Workplace', ar:'بالدوام' },
        { id:'meetings', en:'Meetings', ar:'اجتماعات' },
        { id:'customers', en:'Customers', ar:'عملا' },
        { id:'restaurants', en:'Restaurants', ar:'مطاعم' },
        { id:'coffee', en:'Coffee shops', ar:'كوفيهات' },
        { id:'shopping', en:'Shopping', ar:'تسوق' },
        { id:'airport', en:'Airport', ar:'مطار' },
        { id:'travel', en:'Travel', ar:'سفر' },
        { id:'phone', en:'Phone calls', ar:'مكالمات' },
        { id:'school', en:'School', ar:'مدرسة' },
        { id:'university', en:'University', ar:'جامعة' },
        { id:'interviews', en:'Interviews', ar:'مقابلات' },
        { id:'friends', en:'Friends', ar:'اصحاب' },
        { id:'everyday', en:'Everyday conversations', ar:'محادثات يومية' },
        { id:'online', en:'Online', ar:'اونلاين' },
      ]},
    { key:'q4', multi:true, max:4, id:'weaknesses',
      title:{ en:'What feels hardest right now?', ar:'وش اصعب شي عليك الحين؟' },
      sub:{ en:'This tells us where to focus early practice.', ar:'هذا يحدد وين نركز في بداية التدريب.' },
      options:[
        { id:'speaking', en:'Speaking', ar:'المحادثة' },
        { id:'listening', en:'Listening', ar:'الاستماع' },
        { id:'vocabulary', en:'Vocabulary', ar:'المفردات' },
        { id:'grammar', en:'Grammar', ar:'القواعد' },
        { id:'pronunciation', en:'Pronunciation', ar:'النطق' },
        { id:'writing', en:'Writing', ar:'الكتابة' },
        { id:'finding-words', en:'Finding the right words', ar:'تلاقي الكلمة الصح' },
        { id:'building-sentences', en:'Building sentences', ar:'تبني جمل' },
        { id:'fast-speech', en:'Understanding fast speech', ar:'تفهم الكلام السريع' },
        { id:'confidence', en:'Confidence', ar:'الثقة' },
      ]},
    { key:'q5', multi:false, id:'comfort',
      title:{ en:'How comfortable are you with English right now?', ar:'وين تقف مع الانجليزي الحين؟' },
      sub:{ en:'There is no wrong answer. We start where you are.', ar:'ما فيه جواب غلط. نبدا من وين انت.' },
      options:[
        { id:'none', en:'I know almost no English', ar:'ما اعرف شي تقريبا' },
        { id:'basic-words', en:'I know basic words but struggle to make sentences', ar:'اعرف كلمات بس ما اقدر اكمل جملة' },
        { id:'simple-convos', en:'I can handle very simple conversations', ar:'اقدر احكي محادثات بسيطة' },
        { id:'understand-more', en:'I understand more than I can speak', ar:'افهم اكثر مما اتكلم' },
        { id:'communicate-mistakes', en:'I can communicate, but I make a lot of mistakes', ar:'اتواصل بس اخطايي كثيرة' },
        { id:'fairly-comfortable', en:'I can speak fairly comfortably', ar:'اتكلم بشكل مريح نوعا ما' },
        { id:'regular', en:'I use English regularly and want to become more natural', ar:'استخدمه باستمرار وابي اكون اكثر طبيعية' },
      ]},
    { key:'q6', multi:true, max:3, id:'style',
      title:{ en:'How do you like to learn?', ar:'كيف تحب تتعلم؟' },
      sub:{ en:'This shapes lesson length and format, not what you skip.', ar:'هذا يحدد طول الدروس وشكلها، مو اللي تتخطاه.' },
      options:[
        { id:'short-daily', en:'Short daily practice', ar:'تمرين يومي قصير' },
        { id:'long-sessions', en:'Longer sessions', ar:'جلسات اطول' },
        { id:'conversation-first', en:'Conversation first', ar:'المحادثة اولا' },
        { id:'listening-first', en:'Listening first', ar:'الاستماع اولا' },
        { id:'step-by-step-grammar', en:'Step-by-step grammar', ar:'القواعد خطوة خطوة' },
        { id:'vocabulary-first', en:'Vocabulary first', ar:'المفردات اولا' },
        { id:'real-life', en:'Real-life situations', ar:'مواقف حقيقية' },
        { id:'speaking-practice', en:'Speaking practice', ar:'تمرين محادثة' },
        { id:'balanced', en:'A balanced mix', ar:'خليط متوازن' },
        { id:'repetition', en:'Repetition and review', ar:'تكرار ومراجعة' },
        { id:'quick-challenges', en:'Quick challenges', ar:'تحديات سريعة' },
      ]},
    { key:'q7', multi:false, id:'dailyMinutes',
      title:{ en:'How much time can you realistically study each day?', ar:'كم تقدر تدرس فعليا باليوم؟' },
      sub:{ en:'Be honest. Consistency beats big promises.', ar:'كن صادق مع نفسك. الاستمرارية اهم من الوعود الكبيرة.' },
      options:[
        { id:'5', en:'5 minutes', ar:'٥ دقايق' },
        { id:'10', en:'10 minutes', ar:'١٠ دقايق' },
        { id:'15', en:'15 minutes', ar:'١٥ دقيقة' },
        { id:'20', en:'20 minutes', ar:'٢٠ دقيقة' },
        { id:'30', en:'30 minutes', ar:'٣٠ دقيقة' },
        { id:'45', en:'45+ minutes', ar:'٤٥+ دقيقة' },
      ]},
    { key:'q8', multi:false, id:'frequency',
      title:{ en:'How often will you practice?', ar:'كم مرة بتتدرب بالاسبوع؟' },
      sub:{ en:'This sets your route pacing.', ar:'هذا يحدد ايقاع مسارك.' },
      options:[
        { id:'daily', en:'Every day', ar:'كل يوم', days:7 },
        { id:'5', en:'5 days a week', ar:'٥ ايام بالاسبوع', days:5 },
        { id:'4', en:'4 days a week', ar:'٤ ايام', days:4 },
        { id:'3', en:'3 days a week', ar:'٣ ايام', days:3 },
        { id:'2', en:'2 days a week', ar:'يومين', days:2 },
        { id:'whenever', en:'Whenever I have time', ar:'متى ما اقدر', days:3 },
      ]},
    { key:'q9', multi:false, id:'targetOutcome',
      title:{ en:'What would make you feel you have actually improved?', ar:'وش يخليك تحس انك فعلا تطورت؟' },
      sub:{ en:'This is your destination. We build toward it.', ar:'هذا وجهتك. نبني نحوه.' },
      options:[
        { id:'everyday-convos', en:'Handle everyday conversations', ar:'تدير محادثاتك اليومية' },
        { id:'work-confident', en:'Speak confidently at work', ar:'تتكلم بثقة بالدوام' },
        { id:'travel-comfortable', en:'Travel comfortably', ar:'تسافر براحة' },
        { id:'handle-interview', en:'Handle an interview', ar:'تدير مقابلة' },
        { id:'understand-easier', en:'Understand conversations more easily', ar:'تفهم المحادثات اسهل' },
        { id:'speak-natural', en:'Speak naturally', ar:'تتكلم طبيعي' },
        { id:'write-confident', en:'Write confidently', ar:'تكتب بثقة' },
        { id:'customers', en:'Communicate with customers', ar:'تتواصل مع العملا' },
        { id:'longer-convos', en:'Hold longer conversations', ar:'تكمل محادثات اطول' },
        { id:'professional', en:'Reach strong professional communication', ar:'توصل لتواصل مهني قوي' },
      ]},
    { key:'q10', multi:false, id:'deadline',
      title:{ en:'Do you have a real deadline?', ar:'عندك موعد محدد؟' },
      sub:{ en:'Optional. We never promise a guaranteed result by a date.', ar:'اختياري. ما نعدك بنتيجة مضمونة بتاريخ معين.' },
      options:[
        { id:'none', en:'No deadline', ar:'بدون موعد' },
        { id:'trip', en:'Upcoming trip', ar:'رحلة قريبة' },
        { id:'interview', en:'Interview coming up', ar:'مقابلة قريبة' },
        { id:'new-job', en:'New job', ar:'وظيفة جديدة' },
        { id:'school', en:'Starting school', ar:'دراسة قريبة' },
        { id:'moving', en:'Moving abroad', ar:'انتقال لبرا' },
        { id:'work-req', en:'Work requirement', ar:'مطلوب بالدوام' },
      ]},
  ];

  /* ---------------- PLACEMENT (short, non-intimidating) ---------------- */
  const PLACEMENT = [
    { band:'A1', q:{ en:'What is a "book"?', ar:'وش يعني "book"؟' },
      options:[ { en:'Something you read', ar:'شي تقراه' }, { en:'Something you eat', ar:'شي تاكله' }, { en:'A kind of car', ar:'نوع سيارة' } ], correct:0 },
    { band:'A1', q:{ en:'She ___ to work every day.', ar:'هي ___ للدوام كل يوم.' },
      options:[ { en:'goes', ar:'goes' }, { en:'going', ar:'going' }, { en:'go', ar:'go' } ], correct:0 },
    { band:'A1', q:{ en:'A friend says "Thank you". You reply...', ar:'صاحبك قال "Thank you". ترد عليه...' },
      options:[ { en:'You\'re welcome', ar:'You\'re welcome' }, { en:'I am you', ar:'I am you' }, { en:'No problem me', ar:'No problem me' } ], correct:0 },
    { band:'B1', q:{ en:'I ___ lived here since 2015.', ar:'انا ___ عايش هنا من 2015.' },
      options:[ { en:'have', ar:'have' }, { en:'has', ar:'has' }, { en:'am', ar:'am' } ], correct:0 },
    { band:'B1', q:{ en:'"Could you run that by me again?" means...', ar:'"Could you run that by me again?" يعني...' },
      options:[ { en:'Say it again', ar:'اعيدها لك' }, { en:'Run to me', ar:'اركض لي' }, { en:'Pass me something', ar:'مرر لي شي' } ], correct:0 },
    { band:'B1', q:{ en:'Your manager asks: "Can you handle the client call?" You say...', ar:'مديرك سالك: "Can you handle the client call?" تقول...' },
      options:[ { en:'Yes, I\'ll take it and do my best', ar:'ايه، انا باخذه وببذل قصارى جهدي' }, { en:'Give me client', ar:'اعطيني العميل' }, { en:'What is client', ar:'وش هو العميل' } ], correct:0 },
    { band:'B2', q:{ en:'"Despite the delay, we delivered." means...', ar:'"Despite the delay, we delivered." يعني...' },
      options:[ { en:'Even though we were late, we finished', ar:'رغم التاخير انهينا الشغل' }, { en:'Because we were late, we stopped', ar:'لاننا تاخرنا وقفنا' }, { en:'We replaced the delay', ar:'استبدلنا التاخير' } ], correct:0 },
    { band:'B2', q:{ en:'A client complains about a mistake. You say...', ar:'عميل اشتكى من غلط. تقول له...' },
      options:[ { en:'I take full responsibility and here is how I\'ll fix it', ar:'اتحمل المسوولية وهذي طريقة حلها' }, { en:'It is not my fault', ar:'مو غلطتي' }, { en:'Sorry maybe', ar:'اسف يمكن' } ], correct:0 },
  ];

  /* ---------------- CONTEXT -> ACADEMY PRIORITIES ---------------- */
  const CONTEXT_ACADEMIES = {
    workplace:  ['workplace-communication','business-english'],
    meetings:   ['business-english','workplace-communication'],
    customers:  ['workplace-communication','business-english'],
    interviews: ['job-interview-academy','workplace-communication'],
    phone:      ['business-english','workplace-communication'],
    university: ['vocabulary-vault','grammar-academy','reading-corner'],
    school:     ['english-foundations','vocabulary-vault','grammar-academy'],
    online:     ['vocabulary-vault','reading-corner'],
    travel:     ['airport-english','travel-english','hotel-english'],
    airport:    ['airport-english','travel-english'],
    restaurants:['restaurant-english'],
    coffee:     ['coffee-shop-english'],
    shopping:   ['shopping-english'],
    everyday:   ['everyday-english','american-conversations'],
    friends:    ['american-conversations','everyday-english'],
  };

  const WEAKNESS_ACADEMIES = {
    speaking: 'speaking-studio',
    listening: 'listening-lounge',
    vocabulary: 'vocabulary-vault',
    grammar: 'grammar-academy',
    pronunciation: 'american-accent-lab',
    writing: 'writing-workshop',
    'finding-words': 'vocabulary-vault',
    'building-sentences': 'grammar-academy',
    'fast-speech': 'listening-lounge',
    confidence: 'speaking-studio',
  };

  const ABILITY_ACADEMIES = {
    'speak-no-freeze': 'speaking-studio',
    'stop-translating': 'speaking-studio',
    natural: 'american-conversations',
    'small-talk': 'american-conversations',
    'work-convos': 'workplace-communication',
    'handle-interviews': 'job-interview-academy',
    customers: 'workplace-communication',
    understand: 'listening-lounge',
    media: 'listening-lounge',
    'write-messages': 'writing-workshop',
    'order-confidently': 'coffee-shop-english',
    'ask-help': 'everyday-english',
  };

  const LEVEL_IDX = { A1:0, A2:1, B1:2, B2:3, C1:4 };
  const COMFORT_LEVEL = ['A1','A1','A2','A2','B1','B2','B2'];

  /* ---------------- helpers ---------------- */
  function opt(id){ const q = QUESTIONS.find(x => x.key === id); return q ? q.options.find(o => o.id === id) : null; }
  function optEn(id, fallback){ const o = opt(id); return o ? o.en : (fallback || id); }
  function optAr(id, fallback){ const o = opt(id); return o ? o.ar : (fallback || id); }
  function arr(v){ return Array.isArray(v) ? v : (v ? [v] : []); }
  function levelOf(id){ const a = ACADEMY_META[id]; return a ? a.level : 'B1'; }
  function minutesOf(dur){ const n = parseInt(String(dur||'8').replace(/[^0-9]/g,''), 10); return isNaN(n) ? 8 : n; }
  function cefrBand(comfortId){ const i = QUESTIONS.find(q => q.key === 'q5').options.findIndex(o => o.id === comfortId); return COMFORT_LEVEL[Math.max(0, i)] || 'A1'; }
  function ctxOpt(id){ const q = QUESTIONS.find(x => x.key === 'q3'); if(!q) return null; return q.options.find(o => o.id === id) || null; }

  /* ---------------- PUBLIC API ---------------- */
  /* Curriculum override: the live DB catalog (academies + lessons + items +
     exercises) fetched once via the student_curriculum RPC. When present, DB
     content leads; the static ACADEMY_LESSONS mirror stays as the offline
     fallback. Stored as module-private state so the engine stays generic and
     never depends on app.html's lexical ACADEMIES array. */
  let _db = null;
  function _dbAcademy(id){ return (_db && _db.academies) ? _db.academies.find(a => a.id === id) : null; }
  function _dbLesson(id){
    if(!_db || !_db.academies) return null;
    for(const ac of _db.academies){
      const l = (ac.lessons || []).find(x => x.id === id);
      if(l) return {
        id: l.id, t: l.title_en, a: l.title_ar, d: l.minutes, level: l.level, v: l.level,
        kind: l.kind, skills: l.skills, goals: l.goals, contexts: l.contexts,
        prereqs: l.prereqs, version: l.version,
        items: l.items || [], exercises: l.exercises || []
      };
    }
    return null;
  }
  const API = {
    LEVELS, QUESTIONS, PLACEMENT, ACADEMY_META,
    lessonMeta: function(id){ return LESSON_META[id] || null; },
    academyLessons: function(id){
      // DB curriculum leads when an override is loaded; returns lesson IDs.
      if(_db){ const ac = _dbAcademy(id); if(ac && ac.lessons && ac.lessons.length) return ac.lessons.map(l => l.id); }
      return ACADEMY_LESSONS[id] || [];
    },
    setCurriculumOverride: function(data){ _db = data || null; },
    hasCurriculumOverride: function(){ return !!(_db && _db.academies && _db.academies.length); },
    dbLesson: _dbLesson,
    dbAcademy: function(id){ const a = _dbAcademy(id); return a ? { id:a.id, name_en:a.name_en, name_ar:a.name_ar, icon:a.icon, color_from:a.color_from, color_to:a.color_to, difficulty:a.difficulty, level:a.level, sort_order:a.sort_order, lessons:(a.lessons||[]) } : null; },
    curriculumAcademies: function(){ return (_db && _db.academies) ? _db.academies.slice() : []; },
    levelOf, minutesOf, optEn, optAr,

    /* Comfort (q5 id) -> estimated CEFR band, before placement. */
    comfortBand: cefrBand,

    /* Placement: run the short assessment. Returns score 0-10 + band. */
    runPlacement: function(answers){
      const base = cefrBand(answers.q5);
      const baseIdx = LEVEL_IDX[base] || 1;
      let correct = 0;
      const total = PLACEMENT.length;
      PLACEMENT.forEach(item => { if(answers['p_' + item.q.en] === item.correct) correct++; });
      const pct = correct / total;
      const placementScore = Math.round(pct * 10);
      let bandIdx = pct < 0.4 ? baseIdx - 1 : pct < 0.7 ? baseIdx : baseIdx + 1;
      bandIdx = Math.max(0, Math.min(4, bandIdx));
      return { score: placementScore, band: LEVELS[bandIdx].id, correct, total };
    },

    /* Build the structured learner profile from questionnaire answers. */
    buildProfile: function(answers, opts){
      opts = opts || {};
      const comfortBand = cefrBand(answers.q5);
      const placement = answers._placementDone
        ? API.runPlacement(answers)
        : null;
      const starting = placement
        ? LEVELS[Math.max(0, Math.min(4, Math.round(LEVEL_IDX[comfortBand] + (LEVEL_IDX[placement.band] - LEVEL_IDX[comfortBand]) * 0.5)))].id
        : comfortBand;
      const goals = arr(answers.q1);
      const primaryGoals = goals.slice(0, Math.min(2, goals.length));
      const secondaryGoals = goals.slice(2);
      const abilities = arr(answers.q2);
      const contexts = arr(answers.q3);
      const weaknesses = arr(answers.q4);
      const style = arr(answers.q6);
      const dailyMinutes = parseInt(answers.q7, 10) || 15;
      const freqOpt = QUESTIONS.find(q => q.key === 'q8').options.find(o => o.id === answers.q8) ||
        QUESTIONS.find(q => q.key === 'q8').options[0];
      const weeklyDays = freqOpt.days || 5;
      const targetOutcome = answers.q9;
      const deadline = answers.q10;

      const profile = {
        interfaceLanguage: opts.lang || 'en',
        learningLanguage: 'en',
        learningDirection: 'en',
        primaryGoals, secondaryGoals,
        desiredAbilities: abilities,
        realLifeContexts: contexts,
        selfReportedWeaknesses: weaknesses,
        selfReportedConfidence: answers.q5 || 'basic-words',
        learningPreferences: style,
        dailyMinutes, weeklyFrequency: weeklyDays,
        targetOutcome, targetLevel: levelForOutcome(targetOutcome, starting),
        deadline,
        placementScore: placement ? placement.score : null,
        estimatedStartingLevel: starting,
        recommendedFocus: API.recommendedFocus({ primaryGoals, abilities, weaknesses, contexts }),
        onboardingCompleted: true,
        planVersion: 1,
        createdAt: opts.createdAt || new Date().toISOString(),
      };
      return profile;
    },

    /* Which skills this learner should prioritize. */
    recommendedFocus: function(p){
      const focus = [];
      (arr(p.weaknesses)).forEach(w => {
        const map = { speaking:'Speaking', listening:'Listening', vocabulary:'Vocabulary', grammar:'Grammar', pronunciation:'Pronunciation', writing:'Writing', 'finding-words':'Vocabulary', 'building-sentences':'Grammar', 'fast-speech':'Listening', confidence:'Speaking' };
        if(map[w] && focus.indexOf(map[w]) === -1) focus.push(map[w]);
      });
      (arr(p.abilities)).forEach(a => {
        const map = { 'speak-no-freeze':'Speaking', 'stop-translating':'Speaking', 'natural':'Speaking', 'small-talk':'Speaking', 'work-convos':'Speaking', 'handle-interviews':'Speaking', customers:'Speaking', understand:'Listening', media:'Listening', 'write-messages':'Writing' };
        if(map[a] && focus.indexOf(map[a]) === -1) focus.push(map[a]);
      });
      if(!focus.length) focus.push('Speaking');
      return focus.slice(0, 3);
    },

    /* Build the ordered learning route from a profile.
       Returns an array of stages: { key, title:{en,ar}, level,
       theme, units:[{academyId, lessonIds, level}] }. */
    buildRoute: function(profile){
      const startIdx = typeof LEVEL_IDX[profile.estimatedStartingLevel] === 'number' ? LEVEL_IDX[profile.estimatedStartingLevel] : 1;
      const stages = [];

      // 1) Start here (real beginners) or warm up (a step up).
      if(startIdx === 0){
        stages.push({ key:'start-here', title:{ en:'Start Here', ar:'ابدا من هنا' }, level:'A1', theme:'foundation', units:[ { academyId:'english-foundations', lessonIds:ACADEMY_LESSONS['english-foundations'].slice(0,6), level:'A1' } ] });
      } else {
        stages.push({ key:'warm-up', title:{ en:'Warm Up', ar:'تسخين' }, level: profile.estimatedStartingLevel, theme:'foundation', units:[ { academyId:'everyday-english', lessonIds:ACADEMY_LESSONS['everyday-english'].slice(0,6), level:'A2' } ] });
      }

      // 2) Real-life theme academies from chosen contexts.
      const orderedContexts = profile.realLifeContexts.slice();
      const ctxPriority = ['workplace','interviews','meetings','customers','phone','travel','airport','university','school','restaurants','coffee','shopping','everyday','friends','online'];
      orderedContexts.sort((a, b) => ctxPriority.indexOf(a) - ctxPriority.indexOf(b));
      const seen = { 'english-foundations':1, 'everyday-english':1 };
      const themeUnits = [];
      orderedContexts.forEach(ctx => {
        (CONTEXT_ACADEMIES[ctx] || []).forEach(aid => {
          if(seen[aid]) return;
          seen[aid] = 1;
          themeUnits.push({ academyId: aid, level: levelOf(aid) });
        });
      });

      // 3) Focus academies from weaknesses + abilities (their priority).
      const focusUnits = [];
      profile.recommendedFocus.forEach(skill => {
        const wKey = Object.keys(WEAKNESS_ACADEMIES).find(k => {
          const map = { speaking:'Speaking', listening:'Listening', vocabulary:'Vocabulary', grammar:'Grammar', pronunciation:'Pronunciation', writing:'Writing', 'finding-words':'Vocabulary', 'building-sentences':'Grammar', 'fast-speech':'Listening', confidence:'Speaking' };
          return map[k] === skill;
        });
        if(wKey && !seen[WEAKNESS_ACADEMIES[wKey]]){
          seen[WEAKNESS_ACADEMIES[wKey]] = 1;
          focusUnits.push({ academyId: WEAKNESS_ACADEMIES[wKey], level: levelOf(WEAKNESS_ACADEMIES[wKey]) });
        }
      });

      // 4) A finishing conversational stage.
      const finishers = ['american-conversations','speaking-studio','vocabulary-vault'];
      let finishAdded = false;
      for(const f of finishers){ if(!seen[f]){ seen[f] = 1; focusUnits.push({ academyId: f, level: levelOf(f) }); finishAdded = true; break; } }

      // Sort theme units easier -> harder so the route flows upward,
      // while keeping the learner's chosen contexts as the set.
      themeUnits.sort((a, b) => (LEVEL_IDX[a.level] || 2) - (LEVEL_IDX[b.level] || 2));

      // Build stages: group each unit into its own stage (6 lessons each).
      const maxUnits = 5;
      const pick = themeUnits.concat(focusUnits);
      pick.slice(0, maxUnits).forEach((u, i) => {
        const meta = ACADEMY_META[u.academyId];
        stages.push({
          key: 's' + (i + 2),
          title: { en: meta.en, ar: meta.ar },
          level: u.level,
          theme: i < themeUnits.length ? 'context' : 'focus',
          units: [ { academyId: u.academyId, lessonIds: ACADEMY_LESSONS[u.academyId].slice(0, 6), level: u.level } ],
        });
      });

      return stages;
    },

    /* Transparent duration estimate. Everything adjustable. */
    estimateDuration: function(profile, route, overrides){
      overrides = overrides || {};
      const daily = overrides.dailyMinutes != null ? overrides.dailyMinutes : profile.dailyMinutes;
      const daysPerWeek = overrides.weeklyFrequency != null ? overrides.weeklyFrequency : profile.weeklyFrequency;
      const lessons = [];
      route.forEach(st => st.units.forEach(u => u.lessonIds.forEach(lid => lessons.push({ academyId: u.academyId, lessonId: lid }))));
      let workloadMin = 0;
      lessons.forEach(l => {
        const meta = LESSON_META[l.lessonId];
        workloadMin += minutesOf(meta ? meta.d : '8');
      });
      const reviewFactor = 0.4;   // spaced repetition + review time
      const totalMin = workloadMin * (1 + reviewFactor);
      const weeklyMin = Math.max(1, daily * daysPerWeek);
      const weeks = Math.ceil(totalMin / weeklyMin);
      const days = Math.ceil(totalMin / Math.max(1, daily));
      const target = profile.targetLevel || 'B1';
      return {
        totalLessons: lessons.length,
        workloadMinutes: Math.round(workloadMin),
        totalMinutes: Math.round(totalMin),
        weeklyMinutes: Math.round(weeklyMin),
        weeks, days,
        dailyMinutes: daily,
        weeklyFrequency: daysPerWeek,
        targetLevel: target,
      };
    },

    /* Current position + unlock state from real progress. */
    unlockState: function(profile, route, state){
      state = state || {};
      const done = state.completedLessons || [];
      const doneSet = {};
      done.forEach(k => doneSet[k] = 1);
      let currentStage = 0, currentLesson = null, currentUnit = null, remaining = 0;
      for(let s = 0; s < route.length; s++){
        const st = route[s];
        let unitHasNext = false;
        st.units.forEach(u => {
          u.lessonIds.forEach(lid => {
            const key = u.academyId + '::' + lid;
            if(!doneSet[key]){ remaining++; if(!currentLesson && !unitHasNext){ currentStage = s; currentUnit = u; currentLesson = { academyId: u.academyId, lessonId: lid }; } }
          });
        });
      }
      if(!currentLesson){
        currentStage = Math.max(0, route.length - 1);
        const last = route[currentStage].units[0];
        currentLesson = { academyId: last.academyId, lessonId: last.lessonIds[last.lessonIds.length - 1] };
      }
      const unlocked = [];
      const completedStages = [];
      route.forEach((st, i) => {
        if(i <= currentStage) unlocked.push(st.key);
        const stDone = st.units.every(u => u.lessonIds.every(lid => doneSet[u.academyId + '::' + lid]));
        if(stDone) completedStages.push(st.key);
      });
      return {
        currentStageIndex: currentStage,
        currentStageKey: route[currentStage].key,
        currentStageTitle: route[currentStage].title,
        currentUnit,
        currentLesson,
        remainingLessons: remaining,
        unlockedStages: unlocked,
        completedStages,
        routeLength: route.length,
      };
    },

    /* Daily recommendation: the best next step, with a real reason. */
    recommendNext: function(profile, route, state){
      state = state || {};
      const un = API.unlockState(profile, route, state);
      const lesson = un.currentLesson;
      const meta = LESSON_META[lesson.lessonId] || { t:'Lesson', a:'درس' };
      const ac = ACADEMY_META[lesson.academyId] || { en:'', ar:'' };
      const durMin = minutesOf(meta.d);
      const fit = profile.dailyMinutes >= durMin;

      // Fit the learner's pace: if the full lesson is too long for a
      // short day, recommend a short practice item instead.
      if(!fit && profile.dailyMinutes <= 10){
        const short = { view:'lessonOfDay', academyId: lesson.academyId, lessonId: lesson.lessonId,
          titleEn: meta.t, titleAr: meta.a, minutes: durMin,
          whyEn: 'This lesson takes about ' + durMin + ' minutes, a little long for a ' + profile.dailyMinutes + '-minute day. Start it when you have time, or do a quick review today.',
          whyAr: 'هذا الدرس ياخذ ' + durMin + ' دقايق، اطول شوي من يومك (' + profile.dailyMinutes + ' دقيقة). ابدا فيه وقت ما يكون عندك وقت، او سو مراجعة سريعة اليوم.' };
        return short;
      }

      // Reason derived from real profile data.
      let whyEn = '', whyAr = '';
      const stage = route[un.currentStageIndex] || route[0];
      const stageUnits = stage ? stage.units : [];
      const unit = stageUnits.find(u => u.academyId === lesson.academyId);
      if(unit){
        if(stage.theme === 'foundation' && stage.key === 'start-here'){
          whyEn = 'Chosen because everything builds on these basics. Once they feel easy, real situations open up.';
          whyAr = 'اخترناه لان كل شي يبني على هذي الاساسيات. اول ما تصير سهلة، تنفتح المواقف الحقيقية.';
        } else if(stage.theme === 'foundation' && stage.key === 'warm-up'){
          whyEn = 'Chosen as a quick warm-up to settle into a comfortable rhythm before the route really starts.';
          whyAr = 'اخترناه كتسخين سريع تاخذ فيه الراحة قبل ما يبدا المسار فعليا.';
        } else if(stage.theme === 'context'){
          const ctx = profile.realLifeContexts.find(c => (CONTEXT_ACADEMIES[c] || []).indexOf(lesson.academyId) !== -1);
          const cOpt = ctxOpt(ctx);
          whyEn = 'Chosen because ' + (cOpt ? cOpt.en.toLowerCase() : 'real-life situations') + ' is where you want to use English.';
          whyAr = 'اخترناه لان ' + (cOpt ? cOpt.ar : 'المواقف الحقيقية') + ' هي المكان اللي تبي تستخدم فيه الانجليزي.';
        } else if(stage.theme === 'focus'){
          const wKey = Object.keys(WEAKNESS_ACADEMIES).find(k => WEAKNESS_ACADEMIES[k] === lesson.academyId);
          const wOpt = opt(wKey);
          whyEn = 'Chosen because ' + (wOpt ? wOpt.en.toLowerCase() : 'this skill') + ' is one of the things you want to strengthen.';
          whyAr = 'اخترناه لان ' + (wOpt ? wOpt.ar : 'هذي المهارة') + ' من الاشيا اللي تبي تقويها.';
        }
      }
      if(!whyEn){
        whyEn = 'Chosen because it is the next step in your route.';
        whyAr = 'اخترناه لانه الخطوة التالية في مسارك.';
      }
      const progressText = un.remainingLessons > 1
        ? (un.remainingLessons + ' lesson' + (un.remainingLessons === 1 ? '' : 's') + ' left in your current stage.')
        : (un.remainingLessons === 1 ? 'One lesson left in this stage, then you unlock the next one.' : '');
      return {
        view:'lessonOfDay', academyId: lesson.academyId, lessonId: lesson.lessonId,
        titleEn: meta.t, titleAr: meta.a, academyEn: ac.en, academyAr: ac.ar, minutes: durMin,
        progressEn: progressText,
        whyEn, whyAr, remainingLessons: un.remainingLessons,
      };
    },

    /* Adaptive focus: shift attention using real measured performance.
       Skills that improved leave the active focus; skills that are
       measurably weak rise into it. The plan itself never changes. */
    adaptiveFocus: function(profile, skillData){
      skillData = skillData || [];
      const prior = (profile.recommendedFocus || []).slice();
      const focus = prior.slice();
      const weak = [], improving = [];
      skillData.forEach(s => {
        if(s.score == null) return;
        if(s.score < 60) weak.push(s);
        if(s.score >= 70 && prior.indexOf(s.key) !== -1) improving.push(s);
      });
      // Improved skills step out of the active focus.
      improving.forEach(s => { const i = focus.indexOf(s.key); if(i !== -1) focus.splice(i, 1); });
      // Measured weak skills rise into it.
      weak.sort((a, b) => a.score - b.score).slice(0, 2).forEach(s => {
        if(focus.indexOf(s.key) === -1) focus.push(s.key);
      });
      const weakest = weak.length ? weak[0].key : null;
      return { focus: focus.slice(0, 3), weak, improving, priorFocus: prior, weakest };
    },

    /* Human explanation of why this plan looks the way it does. */
    whyPlan: function(profile, route){
      const linesEn = [], linesAr = [];
      const foc = profile.recommendedFocus || [];
      if(foc.length){
        linesEn.push('Your plan leads with ' + foc.join(' and ') + ' because that is what you told us matters most, and your placement agrees.');
        linesAr.push('خطتك تركز على ' + foc.map(f => ({Speaking:'المحادثة',Listening:'الاستماع',Vocabulary:'المفردات',Grammar:'القواعد',Pronunciation:'النطق',Writing:'الكتابة'})[f] || f).join(' و ') + ' لانك اخترتها كاولوية ونتيجة التقييم تاكدها.');
      }
      const ctx = profile.realLifeContexts.slice(0, 3).map(c => (ctxOpt(c) || {}).en || c).join(', ');
      if(ctx){
        linesEn.push('Your early lessons use ' + ctx + ' because you chose those real-life situations.');
        linesAr.push('دروسك الاولى تغطي ' + profile.realLifeContexts.slice(0, 3).map(c => (ctxOpt(c) || {}).ar || c).join('، ') + ' لانك اخترت هذي المواقف الحقيقية.');
      }
      linesEn.push('Your pace is built on ' + profile.dailyMinutes + ' minutes a day, ' + profile.weeklyFrequency + ' days a week.');
      linesAr.push('ايقاعك مبني على ' + profile.dailyMinutes + ' دقيقة باليوم، ' + profile.weeklyFrequency + ' ايام بالاسبوع.');
      return { linesEn, linesAr };
    },

    /* Estimate adjusted by an interactive pace change. */
    recalcEstimate: function(profile, route, dailyMinutes){
      return API.estimateDuration(profile, route, { dailyMinutes, weeklyFrequency: profile.weeklyFrequency });
    },

    levelInfo: function(id){
      const l = LEVELS.find(x => x.id === id) || LEVELS[1];
      return l;
    },
  };

  function levelForOutcome(outcomeId, start){
    const map = {
      'everyday-convos': ['A1','A2','B1','B2','B2'],
      'work-confident': ['A2','B1','B2','B2','C1'],
      'travel-comfortable': ['A1','A2','B1','B2','B2'],
      'handle-interview': ['B1','B1','B2','B2','C1'],
      'understand-easier': ['A1','A2','B1','B2','B2'],
      'speak-natural': ['A2','B1','B1','B2','C1'],
      'write-confident': ['B1','B1','B2','B2','C1'],
      'customers': ['B1','B1','B2','B2','C1'],
      'longer-convos': ['A1','A2','B1','B2','B2'],
      'professional': ['B1','B2','B2','C1','C1'],
    };
    const arr = map[outcomeId] || ['B1','B1','B2','B2','B2'];
    const startIdx = LEVEL_IDX[start] || 1;
    return arr[Math.min(4, Math.max(0, startIdx))];
  }

  /* ---------------- placement answer recording ---------------- */
  API.answerPlacement = function(answers, index, chosen){
    const item = PLACEMENT[index];
    if(item) answers['p_' + item.q.en] = chosen;
    return answers;
  };

  window.PEL_ENGINE = API;
})();