/* ============================================================
   PEL CURRICULUM STAGE
   A focused, one-activity-at-a-time lesson player.

   FACTORY FORM: app.html calls window.PEL_STAGE_FACTORY(deps) inside its
   IIFE and passes the app helpers this module needs (translitEn, getLesson,
   speak, markLessonComplete, escapeHtml, toast, ACADEMIES, ...), so the
   module is the SINGLE SOURCE OF TRUTH loaded as a normal external script
   instead of a copy pasted inside app.html.
   It does NOT remove the workspace reader; it sits in front of it.
   The app rewires openLesson to launch this stage, with a clean
   fallback to the original workspace reader if anything is off.
   Progression stays server-authoritative: completion calls the
   existing markLessonComplete() which fires complete_activity()
   + XP + review queue + the pel-progress-updated event.
   ============================================================ */
window.PEL_STAGE_FACTORY = function (Deps) {
  'use strict';
  /* ---- 0. HOST DEPENDENCIES (injected by app.html / tests) ----
     Immutable helpers are destructured once. Mutable host state
     (accountPrefs, openLesson) is read through the Deps object at call
     time so the stage always sees the live binding. */
  const {
    ACADEMIES, academyLessonList, canRecognize, ensureRouteAllows, escapeHtml,
    getLesson, goToView, markLessonComplete, micErrorMessage, nextLesson,
    pronFeedback, recordAndScore, resolveAcademyById, speak, subBlocked, toast,
    translitEn
  } = Deps;

  /* ---- 1. BEGINNER CURRICULUM (enrichment for thin/generic lessons) ----
     Each teaching item follows the word -> sentence -> question ->
     real-life conversation progression, with consistent Arabic
     transliteration. Conversational Saudi Arabian Arabic, no MSA. */
  const PEL_BEGINNER = {
    'greetings-goodbye': {
      title: { en: 'Greetings & Goodbye', ar: 'التحية والوداع' },
      items: [
        {
          en: 'hello', ar: 'هلا', translit: 'هلو', pos: 'greeting',
          ipa: '/həˈloʊ/',
          example: { en: 'Hello, how are you?', ar: 'هلا، كيفك؟', translit: 'هلو، هاو ار يو؟' },
          usage: { en: 'Say "hello" any time of day to start a friendly conversation.', ar: 'قول "هلو" اي وقت باليوم عشان تفتح محادثة.' },
          sentences: [
            { en: 'Hello.', ar: 'هلا.', translit: 'هلو.' },
            { en: 'Hello, how are you?', ar: 'هلا، كيفك؟', translit: 'هلو، هاو ار يو؟' },
            { en: 'Hello, are you free today?', ar: 'هلا، انت فاضي اليوم؟', translit: 'هلو، ار يو فري توداي؟' },
          ],
        },
        {
          en: 'goodbye', ar: 'مع السلامة', translit: 'غود باي', pos: 'greeting',
          ipa: '/ɡʊdˈbaɪ/',
          example: { en: 'Goodbye, see you tomorrow.', ar: 'مع السلامة، اشوفك بكرة.', translit: 'غود باي، سي يو تومورو.' },
          usage: { en: 'Use "goodbye" when parting. "See you" is more casual.', ar: 'استخدم "غود باي" وقت الوداع. "سي يو" اخف.' },
          sentences: [
            { en: 'Goodbye.', ar: 'مع السلامة.', translit: 'غود باي.' },
            { en: 'Goodbye, see you tomorrow.', ar: 'مع السلامة، اشوفك بكرة.', translit: 'غود باي، سي يو تومورو.' },
            { en: 'Are you leaving? Goodbye!', ar: 'بتروح؟ مع السلامة!', translit: 'ار يو ليفينق؟ غود باي!' },
          ],
        },
        {
          en: 'how are you', ar: 'كيفك', translit: 'هاو ار يو', pos: 'phrase',
          ipa: '/haʊ ɑːr juː/',
          example: { en: 'Hi, how are you today?', ar: 'هلا، كيفك اليوم؟', translit: 'هاي، هاو ار يو توداي؟' },
          usage: { en: 'A friendly check-in. Reply with "I am fine, thank you."', ar: 'سوال ودّي. جاوب بـ "تمام، شكراً".' },
          sentences: [
            { en: 'How are you?', ar: 'كيفك؟', translit: 'هاو ار يو؟' },
            { en: 'How are you today?', ar: 'كيفك اليوم؟', translit: 'هاو ار يو توداي؟' },
            { en: 'Hello, how are you doing today?', ar: 'هلا، كيفك اليوم؟', translit: 'هلو، هاو ار يو دوينق توداي؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hello! How are you today?', ar: 'هلا! كيفك اليوم؟', translit: 'هلو! هاو ار يو توداي؟' },
        { who: 'B', en: 'I am fine, thank you. And you?', ar: 'تمام، شكراً. وانت؟', translit: 'اي ام فاين، ثانك يو. اند يو؟' },
        { who: 'A', en: 'I am good. See you tomorrow.', ar: 'بخير. اشوفك بكرة.', translit: 'اي ام غود. سي يو تومورو.' },
        { who: 'B', en: 'Goodbye!', ar: 'مع السلامة!', translit: 'غود باي!' },
      ],
    },
    'introducing-yourself': {
      title: { en: 'Introducing Yourself', ar: 'عن نفسك' },
      items: [
        {
          en: 'my name is', ar: 'اسمي', translit: 'ماي نيم ايز', pos: 'phrase',
          ipa: '/maɪ neɪm ɪz/',
          example: { en: 'My name is Firas.', ar: 'اسمي فراس.', translit: 'ماي نيم ايز فراس.' },
          usage: { en: 'Say your name. "I am Firas" is shorter and natural too.', ar: 'قول اسمك. "انا فراس" اقصر واطيب.' },
          sentences: [
            { en: 'My name is Firas.', ar: 'اسمي فراس.', translit: 'ماي نيم ايز فراس.' },
            { en: 'Hi, my name is Firas.', ar: 'هلا، اسمي فراس.', translit: 'هاي، ماي نيم ايز فراس.' },
            { en: 'What is your name?', ar: 'وش اسمك؟', translit: 'وات ايز يور نيم؟' },
          ],
        },
        {
          en: 'nice to meet you', ar: 'سعدت بلقياك', translit: 'نايس تو ميت يو', pos: 'phrase',
          ipa: '/naɪs tə miːt juː/',
          example: { en: 'Nice to meet you, Sara.', ar: 'سعدت بلقياك، سارة.', translit: 'نايس تو ميت يو، سارة.' },
          usage: { en: 'Say this right after you hear someone\'s name.', ar: 'قولها اول ما تسمع اسم الشخص.' },
          sentences: [
            { en: 'Nice to meet you.', ar: 'سعدت بلقياك.', translit: 'نايس تو ميت يو.' },
            { en: 'Nice to meet you too.', ar: 'سعدت بلقياك بعد.', translit: 'نايس تو ميت يو تو.' },
          ],
        },
        {
          en: 'I am from', ar: 'انا من', translit: 'اي ام فرام', pos: 'phrase',
          ipa: '/aɪ æm frʌm/',
          example: { en: 'I am from Saudi Arabia.', ar: 'انا من السعودية.', translit: 'اي ام فرام سعودي ارابيا.' },
          usage: { en: 'Say where you are from.', ar: 'قول من وين انت.' },
          sentences: [
            { en: 'I am from Jeddah.', ar: 'انا من جدة.', translit: 'اي ام فرام جدّة.' },
            { en: 'I am from Saudi Arabia.', ar: 'انا من السعودية.', translit: 'اي ام فرام سعودي ارابيا.' },
            { en: 'Where are you from?', ar: 'من وين انت؟', translit: 'وير ار يو فرام؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hi! My name is Firas. What is your name?', ar: 'هلا! اسمي فراس. وش اسمك؟', translit: 'هاي! ماي نيم ايز فراس. وات ايز يور نيم؟' },
        { who: 'B', en: 'My name is Sara. Nice to meet you.', ar: 'اسمي سارة. سعدت بلقياك.', translit: 'ماي نيم ايز سارة. نايس تو ميت يو.' },
        { who: 'A', en: 'Nice to meet you too. I am from Jeddah.', ar: 'سعدت بلقياك بعد. انا من جدة.', translit: 'نايس تو ميت يو تو. اي ام فرام جدّة.' },
        { who: 'B', en: 'I am from Riyadh. Welcome!', ar: 'انا من الرياض. اهلاً وسهلاً!', translit: 'اي ام فرام الرياض. ويلكم!' },
      ],
    },
    'doctor-appointment': {
      title: { en: 'Making an Appointment', ar: 'حجز موعد' },
      items: [
        {
          en: 'appointment', ar: 'موعد', translit: 'ابوينتمنت', pos: 'noun',
          ipa: '/əˈpɔɪntmənt/',
          example: { en: 'I have an appointment tomorrow.', ar: 'عندي موعد بكرة.', translit: 'اي هاف ان ابوينتمنت تومورو.' },
          usage: { en: 'A scheduled meeting with a doctor, office, or service.', ar: 'موعد مجدول مع دكتور او جهة.' },
          sentences: [
            { en: 'I have an appointment.', ar: 'عندي موعد.', translit: 'اي هاف ان ابوينتمنت.' },
            { en: 'I have an appointment tomorrow.', ar: 'عندي موعد بكرة.', translit: 'اي هاف ان ابوينتمنت تومورو.' },
            { en: 'Do you have an appointment tomorrow?', ar: 'عندك موعد بكرة؟', translit: 'دو يو هاف ان ابوينتمنت تومورو؟' },
          ],
        },
        {
          en: 'I would like to', ar: 'ابغى', translit: 'اي وود لايك تو', pos: 'phrase',
          ipa: '/aɪ wʊd laɪk tə/',
          example: { en: 'I would like to make an appointment.', ar: 'ابغى احجز موعد.', translit: 'اي وود لايك تو ميك ان ابوينتمنت.' },
          usage: { en: 'Polite way to say what you want. "I want" is more direct.', ar: 'طريقة مهذبة تبين اللي تبيه. "اي ونت" اكثر مباشرة.' },
          sentences: [
            { en: 'I would like to make an appointment.', ar: 'ابغى احجز موعد.', translit: 'اي وود لايك تو ميك ان ابوينتمنت.' },
            { en: 'I would like to see the doctor.', ar: 'ابغى اشوف الدكتور.', translit: 'اي وود لايك تو سي ذا دوكتور.' },
          ],
        },
        {
          en: 'available', ar: 'متاح', translit: 'افيلابول', pos: 'adjective',
          ipa: '/əˈveɪləbəl/',
          example: { en: 'Is the doctor available today?', ar: 'الدكتور متاح اليوم؟', translit: 'ايز ذا دوكتور افيلابول توداي؟' },
          usage: { en: 'Free, not busy. Use it to ask about times.', ar: 'فاضي، مو مشغول. استخدمها تسال عن الاوقات.' },
          sentences: [
            { en: 'Are you available today?', ar: 'انت متاح اليوم؟', translit: 'ار يو افيلابول توداي؟' },
            { en: 'Is the doctor available today?', ar: 'الدكتور متاح اليوم؟', translit: 'ايز ذا دوكتور افيلابول توداي؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hello, I would like to make an appointment.', ar: 'هلا، ابغى احجز موعد.', translit: 'هلو، اي وود لايك تو ميك ان ابوينتمنت.' },
        { who: 'B', en: 'Sure. Is the doctor available tomorrow?', ar: 'تمام. الدكتور متاح بكرة؟', translit: 'شر. ايز ذا دوكتور افيلابول تومورو؟' },
        { who: 'A', en: 'Yes. I have an appointment tomorrow at ten.', ar: 'ايه. عندي موعد بكرة الساعة عشر.', translit: 'يس. اي هاف ان ابوينتمنت تومورو ات تن.' },
        { who: 'B', en: 'Great. See you tomorrow!', ar: 'تمام. اشوفك بكرة!', translit: 'غريت. سي يو تومورو!' },
      ],
    },
    'numbers-1-10': {
      title: { en: 'One to Ten', ar: 'من واحد لعشرة' },
      items: [
        {
          en: 'one', ar: 'واحد', translit: 'ون', pos: 'number',
          ipa: '/wʌn/',
          example: { en: 'I have one brother.', ar: 'عندي اخ واحد.', translit: 'اي هاف ون برذر.' },
          usage: { en: 'The first number. Say it before a single thing.', ar: 'اول رقم. قولها قبل شي واحد.' },
          sentences: [
            { en: 'One.', ar: 'واحد.', translit: 'ون.' },
            { en: 'I have one book.', ar: 'عندي كتاب واحد.', translit: 'اي هاف ون بوك.' },
            { en: 'Give me one, please.', ar: 'عطني واحد، من فضلك.', translit: 'جيف مي ون، بليز.' },
          ],
        },
        {
          en: 'two', ar: 'اثنين', translit: 'تو', pos: 'number',
          ipa: '/tuː/',
          example: { en: 'I have two sisters.', ar: 'عندي اختين.', translit: 'اي هاف تو سيسترز.' },
          usage: { en: 'The number after one.', ar: 'الرقم اللي بعد واحد.' },
          sentences: [
            { en: 'Two.', ar: 'اثنين.', translit: 'تو.' },
            { en: 'I have two.', ar: 'عندي اثنين.', translit: 'اي هاف تو.' },
            { en: 'Two coffees, please.', ar: 'قهوتين، من فضلك.', translit: 'تو كوفيز، بليز.' },
          ],
        },
        {
          en: 'three', ar: 'ثلاثة', translit: 'ثري', pos: 'number',
          ipa: '/θriː/',
          example: { en: 'Three people are coming.', ar: 'ثلاثة اشخاص جايين.', translit: 'ثري بيبل ار كامينق.' },
          usage: { en: 'The number after two.', ar: 'الرقم اللي بعد اثنين.' },
          sentences: [
            { en: 'Three.', ar: 'ثلاثة.', translit: 'ثري.' },
            { en: 'I have three.', ar: 'عندي ثلاثة.', translit: 'اي هاف ثري.' },
            { en: 'Three days.', ar: 'ثلاثة ايام.', translit: 'ثري دايز.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'How many?', ar: 'كم؟', translit: 'هاو ماني؟' },
        { who: 'B', en: 'Three.', ar: 'ثلاثة.', translit: 'ثري.' },
        { who: 'A', en: 'Only three?', ar: 'ثلاثة بس؟', translit: 'اونلي ثري؟' },
        { who: 'B', en: 'Yes, three.', ar: 'ايه، ثلاثة.', translit: 'يس، ثري.' },
      ],
    },
    'colors': {
      title: { en: 'Colors', ar: 'الالوان' },
      items: [
        {
          en: 'red', ar: 'احمر', translit: 'رد', pos: 'color',
          ipa: '/red/',
          example: { en: 'The car is red.', ar: 'السيارة حمرا.', translit: 'ذا كار ايز رد.' },
          usage: { en: 'A common color. Also used for the traffic light that means stop.', ar: 'لون شايع. كمان يستخدم للاشارة اللي تعني قف.' },
          sentences: [
            { en: 'Red.', ar: 'احمر.', translit: 'رد.' },
            { en: 'I like red.', ar: 'يعجبني الاحمر.', translit: 'اي لايك رد.' },
            { en: 'Is it red?', ar: 'احمر؟', translit: 'ايز ات رد؟' },
          ],
        },
        {
          en: 'blue', ar: 'ازرق', translit: 'بلو', pos: 'color',
          ipa: '/bluː/',
          example: { en: 'The sky is blue.', ar: 'السما زرقا.', translit: 'ذا سكاي ايز بلو.' },
          usage: { en: 'The color of the sky and the sea.', ar: 'لون السما والبحر.' },
          sentences: [
            { en: 'Blue.', ar: 'ازرق.', translit: 'بلو.' },
            { en: 'I like blue.', ar: 'يعجبني الازرق.', translit: 'اي لايك بلو.' },
            { en: 'A blue shirt.', ar: 'قميص ازرق.', translit: 'ا بلو شيرت.' },
          ],
        },
        {
          en: 'green', ar: 'اخضر', translit: 'غرين', pos: 'color',
          ipa: '/ɡriːn/',
          example: { en: 'The grass is green.', ar: 'العشب اخضر.', translit: 'ذا غراس ايز غرين.' },
          usage: { en: 'The color of plants and the go light.', ar: 'لون النباتات والاشارة الخضرا.' },
          sentences: [
            { en: 'Green.', ar: 'اخضر.', translit: 'غرين.' },
            { en: 'Green light.', ar: 'اشارة خضرا.', translit: 'غرين لايت.' },
            { en: 'Do you like green?', ar: 'يعجبك الاخضر؟', translit: 'دو يو لايك غرين؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'What color?', ar: 'وش اللون؟', translit: 'وات كالر؟' },
        { who: 'B', en: 'Blue.', ar: 'ازرق.', translit: 'بلو.' },
        { who: 'A', en: 'Not red?', ar: 'مو احمر؟', translit: 'نات رد؟' },
        { who: 'B', en: 'No, blue.', ar: 'لا، ازرق.', translit: 'نو، بلو.' },
      ],
    },
    'days-and-months': {
      title: { en: 'Days & Months', ar: 'الايام والشهور' },
      items: [
        {
          en: 'today', ar: 'اليوم', translit: 'توداي', pos: 'time',
          ipa: '/təˈdeɪ/',
          example: { en: 'I am busy today.', ar: 'مشغول اليوم.', translit: 'اي ام بيزي توداي.' },
          usage: { en: 'The day that is happening now.', ar: 'اليوم اللي نحن فيه.' },
          sentences: [
            { en: 'Today.', ar: 'اليوم.', translit: 'توداي.' },
            { en: 'Today is good.', ar: 'اليوم زين.', translit: 'توداي ايز غود.' },
            { en: 'Are you free today?', ar: 'فاضي اليوم؟', translit: 'ار يو فري توداي؟' },
          ],
        },
        {
          en: 'tomorrow', ar: 'بكرة', translit: 'تومورو', pos: 'time',
          ipa: '/təˈmɔːroʊ/',
          example: { en: 'See you tomorrow.', ar: 'اشوفك بكرة.', translit: 'سي يو تومورو.' },
          usage: { en: 'The day after today.', ar: 'اليوم اللي بعد اليوم.' },
          sentences: [
            { en: 'Tomorrow.', ar: 'بكرة.', translit: 'تومورو.' },
            { en: 'Tomorrow morning.', ar: 'بكرة الصبح.', translit: 'تومورو مورنينق.' },
            { en: 'I will come tomorrow.', ar: 'بجي بكرة.', translit: 'اي ويل كام تومورو.' },
          ],
        },
        {
          en: 'week', ar: 'اسبوع', translit: 'ويك', pos: 'time',
          ipa: '/wiːk/',
          example: { en: 'A week has seven days.', ar: 'الاسبوع سبعة ايام.', translit: 'ا ويك هاف سيفن دايز.' },
          usage: { en: 'Seven days, from Sunday to Saturday.', ar: 'سبعة ايام، من الاحد للسبت.' },
          sentences: [
            { en: 'One week.', ar: 'اسبوع.', translit: 'ون ويك.' },
            { en: 'Next week.', ar: 'الاسبوع الجاي.', translit: 'نكست ويك.' },
            { en: 'This week.', ar: 'هذا الاسبوع.', translit: 'ذس ويك.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Today or tomorrow?', ar: 'اليوم ولا بكرة؟', translit: 'توداي اور تومورو؟' },
        { who: 'B', en: 'Tomorrow.', ar: 'بكرة.', translit: 'تومورو.' },
        { who: 'A', en: 'OK, see you tomorrow.', ar: 'تمام، اشوفك بكرة.', translit: 'اوكي، سي يو تومورو.' },
        { who: 'B', en: 'Goodbye!', ar: 'مع السلامة!', translit: 'غود باي!' },
      ],
    },
    'family-members': {
      title: { en: 'Family', ar: 'العايلة' },
      items: [
        {
          en: 'mother', ar: 'امي', translit: 'ماذر', pos: 'family',
          ipa: '/ˈmʌðər/',
          example: { en: 'My mother is kind.', ar: 'امي طيبة.', translit: 'ماي ماذر ايز كايند.' },
          usage: { en: 'Your female parent. Saudis say امي for my mother.', ar: 'والدتك. السعوديين يقولون امي.' },
          sentences: [
            { en: 'My mother.', ar: 'امي.', translit: 'ماي ماذر.' },
            { en: 'This is my mother.', ar: 'هذي امي.', translit: 'ذس ايز ماي ماذر.' },
            { en: 'I love my mother.', ar: 'احب امي.', translit: 'اي لاف ماي ماذر.' },
          ],
        },
        {
          en: 'father', ar: 'ابوي', translit: 'فاذر', pos: 'family',
          ipa: '/ˈfɑːðər/',
          example: { en: 'My father works.', ar: 'ابوي يشتغل.', translit: 'ماي فاذر ويركس.' },
          usage: { en: 'Your male parent. Saudis say ابوي for my father.', ar: 'والدك. السعوديين يقولون ابوي.' },
          sentences: [
            { en: 'My father.', ar: 'ابوي.', translit: 'ماي فاذر.' },
            { en: 'Where is my father?', ar: 'وين ابوي؟', translit: 'وير ايز ماي فاذر؟' },
            { en: 'My father is here.', ar: 'ابوي موجود.', translit: 'ماي فاذر ايز هير.' },
          ],
        },
        {
          en: 'brother', ar: 'اخوي', translit: 'برذر', pos: 'family',
          ipa: '/ˈbrʌðər/',
          example: { en: 'I have one brother.', ar: 'عندي اخ واحد.', translit: 'اي هاف ون برذر.' },
          usage: { en: 'Your male sibling. Saudis say اخوي for my brother.', ar: 'اخوك. السعوديين يقولون اخوي.' },
          sentences: [
            { en: 'My brother.', ar: 'اخوي.', translit: 'ماي برذر.' },
            { en: 'This is my brother.', ar: 'هذا اخوي.', translit: 'ذس ايز ماي برذر.' },
            { en: 'Your brother.', ar: 'اخوك.', translit: 'يور برذر.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Is this your brother?', ar: 'هذا اخوك؟', translit: 'ايز ذس يور برذر؟' },
        { who: 'B', en: 'Yes, my brother.', ar: 'ايه، اخوي.', translit: 'يس، ماي برذر.' },
        { who: 'A', en: 'Nice to meet you.', ar: 'سعدت بلقياك.', translit: 'نايس تو ميت يو.' },
        { who: 'B', en: 'Nice to meet you too.', ar: 'سعدت بلقياك بعد.', translit: 'نايس تو ميت يو تو.' },
      ],
    },
    'telling-time': {
      title: { en: 'Telling Time', ar: 'الساعة' },
      items: [
        {
          en: 'time', ar: 'وقت', translit: 'تايم', pos: 'noun',
          ipa: '/taɪm/',
          example: { en: 'What time is it?', ar: 'كم الساعة؟', translit: 'وات تايم ايز ات؟' },
          usage: { en: 'The hour of the day.', ar: 'ساعة اليوم.' },
          sentences: [
            { en: 'What time?', ar: 'كم الساعة؟', translit: 'وات تايم؟' },
            { en: 'The time is now.', ar: 'الوقت الحين.', translit: 'ذا تايم ايز ناو.' },
            { en: 'What time is it?', ar: 'كم الساعة؟', translit: 'وات تايم ايز ات؟' },
          ],
        },
        {
          en: 'o\'clock', ar: 'الساعة', translit: 'اكلوك', pos: 'time',
          ipa: '/əˈklɑːk/',
          example: { en: 'It is three o\'clock.', ar: 'الساعة ثلاثة.', translit: 'ات ايز ثري اكلوك.' },
          usage: { en: 'Used for exact hours, like three o\'clock.', ar: 'للساعات المضبوطة، مثل ثلاثة.' },
          sentences: [
            { en: 'One o\'clock.', ar: 'الساعة واحدة.', translit: 'ون اكلوك.' },
            { en: 'It is two o\'clock.', ar: 'الساعة اثنين.', translit: 'ات ايز تو اكلوك.' },
            { en: 'Three o\'clock.', ar: 'الساعة ثلاثة.', translit: 'ثري اكلوك.' },
          ],
        },
        {
          en: 'late', ar: 'متاخر', translit: 'ليت', pos: 'adjective',
          ipa: '/leɪt/',
          example: { en: 'I am late.', ar: 'تاخرت.', translit: 'اي ام ليت.' },
          usage: { en: 'After the agreed time. The opposite is early.', ar: 'بعد الوقت المتفق عليه. العكس مبكر.' },
          sentences: [
            { en: 'I am late.', ar: 'تاخرت.', translit: 'اي ام ليت.' },
            { en: 'Are you late?', ar: 'متاخر؟', translit: 'ار يو ليت؟' },
            { en: 'Sorry, I am late.', ar: 'المعذرة، تاخرت.', translit: 'سوري، اي ام ليت.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'What time is it?', ar: 'كم الساعة؟', translit: 'وات تايم ايز ات؟' },
        { who: 'B', en: 'It is two o\'clock.', ar: 'الساعة اثنين.', translit: 'ات ايز تو اكلوك.' },
        { who: 'A', en: 'I am late!', ar: 'تاخرت!', translit: 'اي ام ليت!' },
        { who: 'B', en: 'No, you are fine.', ar: 'لا، تمام.', translit: 'نو، يو ار فاين.' },
      ],
    },
    'food-and-drinks': {
      title: { en: 'Food & Drinks', ar: 'الاكل والشرب' },
      items: [
        {
          en: 'water', ar: 'ماي', translit: 'ووتر', pos: 'noun',
          ipa: '/ˈwɔːtər/',
          example: { en: 'I want water.', ar: 'ابغى ماي.', translit: 'اي وانت ووتر.' },
          usage: { en: 'What you drink when you are thirsty.', ar: 'اللي تشربه وقت العطش.' },
          sentences: [
            { en: 'Water.', ar: 'ماي.', translit: 'ووتر.' },
            { en: 'A glass of water.', ar: 'كاسة ماي.', translit: 'ا غلاس اوف ووتر.' },
            { en: 'Can I have water?', ar: 'ممكن ماي؟', translit: 'كان اي هاف ووتر؟' },
          ],
        },
        {
          en: 'bread', ar: 'خبز', translit: 'بريد', pos: 'noun',
          ipa: '/bred/',
          example: { en: 'I eat bread.', ar: 'اكل خبز.', translit: 'اي ايت بريد.' },
          usage: { en: 'A food made from flour, eaten every day.', ar: 'اكل من طحين، يتاكل كل يوم.' },
          sentences: [
            { en: 'Bread.', ar: 'خبز.', translit: 'بريد.' },
            { en: 'Fresh bread.', ar: 'خبز طازج.', translit: 'فريش بريد.' },
            { en: 'I like bread.', ar: 'يعجبني الخبز.', translit: 'اي لايك بريد.' },
          ],
        },
        {
          en: 'coffee', ar: 'قهوة', translit: 'كوفي', pos: 'noun',
          ipa: '/ˈkɔːfi/',
          example: { en: 'I drink coffee.', ar: 'اشرب قهوة.', translit: 'اي درينك كوفي.' },
          usage: { en: 'A hot drink, very common in Saudi Arabia.', ar: 'مشروب حار، شايع بالسعودية.' },
          sentences: [
            { en: 'Coffee.', ar: 'قهوة.', translit: 'كوفي.' },
            { en: 'A cup of coffee.', ar: 'فنجان قهوة.', translit: 'ا كب اوف كوفي.' },
            { en: 'Do you want coffee?', ar: 'تبغى قهوة؟', translit: 'دو يو وانت كوفي؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Do you want coffee?', ar: 'تبغى قهوة؟', translit: 'دو يو وانت كوفي؟' },
        { who: 'B', en: 'Yes, please.', ar: 'ايه، من فضلك.', translit: 'يس، بليز.' },
        { who: 'A', en: 'With water?', ar: 'مع ماي؟', translit: 'وذ ووتر؟' },
        { who: 'B', en: 'No, thank you.', ar: 'لا، شكراً.', translit: 'نو، ثانك يو.' },
      ],
    },
    'classroom-words': {
      title: { en: 'In Class', ar: 'في الفصل' },
      items: [
        {
          en: 'book', ar: 'كتاب', translit: 'بوك', pos: 'noun',
          ipa: '/bʊk/',
          example: { en: 'Open the book.', ar: 'افتح الكتاب.', translit: 'اوبن ذا بوك.' },
          usage: { en: 'You read it. The opposite action is close.', ar: 'تقراه. العكس يقفل.' },
          sentences: [
            { en: 'A book.', ar: 'كتاب.', translit: 'ا بوك.' },
            { en: 'This is my book.', ar: 'هذا كتابي.', translit: 'ذس ايز ماي بوك.' },
            { en: 'Where is the book?', ar: 'وين الكتاب؟', translit: 'وير ايز ذا بوك؟' },
          ],
        },
        {
          en: 'pen', ar: 'قلم', translit: 'بن', pos: 'noun',
          ipa: '/pen/',
          example: { en: 'I need a pen.', ar: 'محتاج قلم.', translit: 'اي نيد ا بن.' },
          usage: { en: 'You write with it.', ar: 'تكتب فيه.' },
          sentences: [
            { en: 'A pen.', ar: 'قلم.', translit: 'ا بن.' },
            { en: 'Give me a pen.', ar: 'عطني قلم.', translit: 'جيف مي ا بن.' },
            { en: 'Is this your pen?', ar: 'هذا قلمك؟', translit: 'ايز ذس يور بن؟' },
          ],
        },
        {
          en: 'teacher', ar: 'معلم', translit: 'تيتشر', pos: 'noun',
          ipa: '/ˈtiːtʃər/',
          example: { en: 'The teacher is good.', ar: 'المعلم زين.', translit: 'ذا تيتشر ايز غود.' },
          usage: { en: 'The person who teaches you.', ar: 'الشخص اللي يعلمك.' },
          sentences: [
            { en: 'The teacher.', ar: 'المعلم.', translit: 'ذا تيتشر.' },
            { en: 'My teacher.', ar: 'معلمي.', translit: 'ماي تيتشر.' },
            { en: 'Ask the teacher.', ar: 'اسال المعلم.', translit: 'اسك ذا تيتشر.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Do you have a pen?', ar: 'عندك قلم؟', translit: 'دو يو هاف ا بن؟' },
        { who: 'B', en: 'Yes, here.', ar: 'ايه، تفضل.', translit: 'يس، هير.' },
        { who: 'A', en: 'Open the book.', ar: 'افتح الكتاب.', translit: 'اوبن ذا بوك.' },
        { who: 'B', en: 'Which page?', ar: 'اي صفحة؟', translit: 'ويتش بيج؟' },
      ],
    },
    'asking-directions': {
      title: { en: 'Asking Directions', ar: 'السوال عن الاتجاهات' },
      items: [
        {
          en: 'where', ar: 'وين', translit: 'وير', pos: 'question',
          ipa: '/wer/',
          example: { en: 'Where is the school?', ar: 'وين المدرسة؟', translit: 'وير ايز ذا سكول؟' },
          usage: { en: 'Used to ask about a place.', ar: 'تسال بها عن مكان.' },
          sentences: [
            { en: 'Where?', ar: 'وين؟', translit: 'وير؟' },
            { en: 'Where are you?', ar: 'وين انت؟', translit: 'وير ار يو؟' },
            { en: 'Where is it?', ar: 'وين هو؟', translit: 'وير ايز ات؟' },
          ],
        },
        {
          en: 'left', ar: 'يسار', translit: 'لفت', pos: 'direction',
          ipa: '/left/',
          example: { en: 'Turn left.', ar: 'لف يسار.', translit: 'ترن لفت.' },
          usage: { en: 'The opposite of right.', ar: 'عكس يمين.' },
          sentences: [
            { en: 'Left.', ar: 'يسار.', translit: 'لفت.' },
            { en: 'Turn left.', ar: 'لف يسار.', translit: 'ترن لفت.' },
            { en: 'It is on the left.', ar: 'على اليسار.', translit: 'ات ايز اون ذا لفت.' },
          ],
        },
        {
          en: 'right', ar: 'يمين', translit: 'رايت', pos: 'direction',
          ipa: '/raɪt/',
          example: { en: 'Turn right.', ar: 'لف يمين.', translit: 'ترن رايت.' },
          usage: { en: 'The opposite of left.', ar: 'عكس يسار.' },
          sentences: [
            { en: 'Right.', ar: 'يمين.', translit: 'رايت.' },
            { en: 'Turn right.', ar: 'لف يمين.', translit: 'ترن رايت.' },
            { en: 'It is on the right.', ar: 'على اليمين.', translit: 'ات ايز اون ذا رايت.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Where is the school?', ar: 'وين المدرسة؟', translit: 'وير ايز ذا سكول؟' },
        { who: 'B', en: 'Turn right.', ar: 'لف يمين.', translit: 'ترن رايت.' },
        { who: 'A', en: 'Then left?', ar: 'وبعدين يسار؟', translit: 'ذن لفت؟' },
        { who: 'B', en: 'Yes, then left.', ar: 'ايه، بعدين يسار.', translit: 'يس، ذن لفت.' },
      ],
    },
    'shopping-and-money': {
      title: { en: 'Shopping & Money', ar: 'التسوق والفلوس' },
      items: [
        {
          en: 'how much', ar: 'كم', translit: 'هاو موتش', pos: 'phrase',
          ipa: '/haʊ mʌtʃ/',
          example: { en: 'How much is it?', ar: 'كم سعره؟', translit: 'هاو موتش ايز ات؟' },
          usage: { en: 'Ask this to know the price.', ar: 'اسال بها عشان تعرف السعر.' },
          sentences: [
            { en: 'How much?', ar: 'كم؟', translit: 'هاو موتش؟' },
            { en: 'How much is this?', ar: 'كم هذا؟', translit: 'هاو موتش ايز ذس؟' },
            { en: 'How much for two?', ar: 'كم لاثنين؟', translit: 'هاو موتش فور تو؟' },
          ],
        },
        {
          en: 'money', ar: 'فلوس', translit: 'ماني', pos: 'noun',
          ipa: '/ˈmʌni/',
          example: { en: 'I have money.', ar: 'عندي فلوس.', translit: 'اي هاف ماني.' },
          usage: { en: 'What you use to pay for things.', ar: 'اللي تدفعه عشان تشتري.' },
          sentences: [
            { en: 'Money.', ar: 'فلوس.', translit: 'ماني.' },
            { en: 'I need money.', ar: 'محتاج فلوس.', translit: 'اي نيد ماني.' },
            { en: 'Do you have money?', ar: 'عندك فلوس؟', translit: 'دو يو هاف ماني؟' },
          ],
        },
        {
          en: 'price', ar: 'سعر', translit: 'برايس', pos: 'noun',
          ipa: '/praɪs/',
          example: { en: 'What is the price?', ar: 'كم السعر؟', translit: 'وات ايز ذا برايس؟' },
          usage: { en: 'How much something costs.', ar: 'قدّيش شي يكلف.' },
          sentences: [
            { en: 'The price.', ar: 'السعر.', translit: 'ذا برايس.' },
            { en: 'What is the price?', ar: 'كم السعر؟', translit: 'وات ايز ذا برايس؟' },
            { en: 'Good price.', ar: 'سعر زين.', translit: 'غود برايس.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'How much is this?', ar: 'كم هذا؟', translit: 'هاو موتش ايز ذس؟' },
        { who: 'B', en: 'Ten riyals.', ar: 'عشرة ريالات.', translit: 'تن ريالز.' },
        { who: 'A', en: 'Too much!', ar: 'كثير!', translit: 'تو موتش!' },
        { who: 'B', en: 'OK, eight.', ar: 'تمام، ثمانية.', translit: 'اوكي، ايت.' },
      ],
    },
    'daily-routine': {
      title: { en: 'Daily Routine', ar: 'الروتين اليومي' },
      items: [
        {
          en: 'wake up', ar: 'اصحى', translit: 'ويك اب', pos: 'verb',
          ipa: '/weɪk ʌp/',
          example: { en: 'I wake up early.', ar: 'اصحى بدري.', translit: 'اي ويك اب ايرلي.' },
          usage: { en: 'To stop sleeping in the morning.', ar: 'تصحى من النوم بالصبح.' },
          sentences: [
            { en: 'I wake up.', ar: 'اصحى.', translit: 'اي ويك اب.' },
            { en: 'I wake up early.', ar: 'اصحى بدري.', translit: 'اي ويك اب ايرلي.' },
            { en: 'Do you wake up early?', ar: 'تصحى بدري؟', translit: 'دو يو ويك اب ايرلي؟' },
          ],
        },
        {
          en: 'eat', ar: 'اكل', translit: 'ايت', pos: 'verb',
          ipa: '/iːt/',
          example: { en: 'I eat breakfast.', ar: 'اكل الفطار.', translit: 'اي ايت بريكفاست.' },
          usage: { en: 'To put food in your mouth. The opposite is drink.', ar: 'تحط اكل بفمك. العكس تشرب.' },
          sentences: [
            { en: 'I eat.', ar: 'اكل.', translit: 'اي ايت.' },
            { en: 'I eat rice.', ar: 'اكل رز.', translit: 'اي ايت رايس.' },
            { en: 'Let\'s eat.', ar: 'يلا ناكل.', translit: 'لتس ايت.' },
          ],
        },
        {
          en: 'sleep', ar: 'انام', translit: 'سليب', pos: 'verb',
          ipa: '/sliːp/',
          example: { en: 'I sleep at night.', ar: 'انام بالليل.', translit: 'اي سليب ات نايت.' },
          usage: { en: 'To rest with your eyes closed. The opposite of wake up.', ar: 'ترتاح وعيونك مغمضة. عكس تصحى.' },
          sentences: [
            { en: 'I sleep.', ar: 'انام.', translit: 'اي سليب.' },
            { en: 'I sleep early.', ar: 'انام بدري.', translit: 'اي سليب ايرلي.' },
            { en: 'Time to sleep.', ar: 'وقت النوم.', translit: 'تايم تو سليب.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Do you wake up early?', ar: 'تصحى بدري؟', translit: 'دو يو ويك اب ايرلي؟' },
        { who: 'B', en: 'I wake up at six.', ar: 'اصحى الساعة ستة.', translit: 'اي ويك اب ات سيكس.' },
        { who: 'A', en: 'Do you eat breakfast?', ar: 'تفطر؟', translit: 'دو يو ايت بريكفاست؟' },
        { who: 'B', en: 'Yes, then I work.', ar: 'ايه، وبعدين اشتغل.', translit: 'يس، ذن اي ويرك.' },
      ],
    },
    'weather-words': {
      title: { en: 'Weather', ar: 'الطقس' },
      items: [
        {
          en: 'hot', ar: 'حار', translit: 'هوت', pos: 'adjective',
          ipa: '/hɑːt/',
          example: { en: 'It is hot today.', ar: 'اليوم حار.', translit: 'ات ايز هوت توداي.' },
          usage: { en: 'High temperature. The opposite is cold.', ar: 'حرارة عالية. العكس بارد.' },
          sentences: [
            { en: 'Hot.', ar: 'حار.', translit: 'هوت.' },
            { en: 'It is hot.', ar: 'حار.', translit: 'ات ايز هوت.' },
            { en: 'Too hot.', ar: 'حار كثير.', translit: 'تو هوت.' },
          ],
        },
        {
          en: 'cold', ar: 'بارد', translit: 'كولد', pos: 'adjective',
          ipa: '/koʊld/',
          example: { en: 'It is cold.', ar: 'الجو بارد.', translit: 'ات ايز كولد.' },
          usage: { en: 'Low temperature. The opposite is hot.', ar: 'حرارة منخفضة. العكس حار.' },
          sentences: [
            { en: 'Cold.', ar: 'بارد.', translit: 'كولد.' },
            { en: 'It is cold today.', ar: 'اليوم بارد.', translit: 'ات ايز كولد توداي.' },
            { en: 'I am cold.', ar: 'بردان.', translit: 'اي ام كولد.' },
          ],
        },
        {
          en: 'sunny', ar: 'مشمس', translit: 'صني', pos: 'adjective',
          ipa: '/ˈsʌni/',
          example: { en: 'It is sunny.', ar: 'الجو مشمس.', translit: 'ات ايز صني.' },
          usage: { en: 'When the sun is shining.', ar: 'وقت ما الشمس تطلع.' },
          sentences: [
            { en: 'Sunny.', ar: 'مشمس.', translit: 'صني.' },
            { en: 'It is sunny today.', ar: 'اليوم مشمس.', translit: 'ات ايز صني توداي.' },
            { en: 'A sunny day.', ar: 'يوم مشمس.', translit: 'ا صني داي.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Is it hot today?', ar: 'اليوم حار؟', translit: 'ايز ات هوت توداي؟' },
        { who: 'B', en: 'Yes, very hot.', ar: 'ايه، حار كثير.', translit: 'يس، فيري هوت.' },
        { who: 'A', en: 'I am cold.', ar: 'بردان.', translit: 'اي ام كولد.' },
        { who: 'B', en: 'Drink water.', ar: 'اشرب ماي.', translit: 'درينك ووتر.' },
      ],
    },
    'feelings-and-emotions': {
      title: { en: 'Feelings', ar: 'المشاعر' },
      items: [
        {
          en: 'happy', ar: 'مبسوط', translit: 'هابي', pos: 'adjective',
          ipa: '/ˈhæpi/',
          example: { en: 'I am happy.', ar: 'انا مبسوط.', translit: 'اي ام هابي.' },
          usage: { en: 'A good feeling. The opposite is sad.', ar: 'احساس زين. العكس حزين.' },
          sentences: [
            { en: 'Happy.', ar: 'مبسوط.', translit: 'هابي.' },
            { en: 'I am happy.', ar: 'انا مبسوط.', translit: 'اي ام هابي.' },
            { en: 'Are you happy?', ar: 'مبسوط؟', translit: 'ار يو هابي؟' },
          ],
        },
        {
          en: 'sad', ar: 'حزين', translit: 'ساد', pos: 'adjective',
          ipa: '/sæd/',
          example: { en: 'I am sad.', ar: 'انا حزين.', translit: 'اي ام ساد.' },
          usage: { en: 'A bad feeling. The opposite is happy.', ar: 'احساس مو زين. العكس مبسوط.' },
          sentences: [
            { en: 'Sad.', ar: 'حزين.', translit: 'ساد.' },
            { en: 'I am sad.', ar: 'انا حزين.', translit: 'اي ام ساد.' },
            { en: 'Why are you sad?', ar: 'ليش حزين؟', translit: 'واي ار يو ساد؟' },
          ],
        },
        {
          en: 'tired', ar: 'تعبان', translit: 'تايرد', pos: 'adjective',
          ipa: '/ˈtaɪərd/',
          example: { en: 'I am tired.', ar: 'انا تعبان.', translit: 'اي ام تايرد.' },
          usage: { en: 'When you need rest or sleep.', ar: 'وقت ما تحتاج راحة او نوم.' },
          sentences: [
            { en: 'Tired.', ar: 'تعبان.', translit: 'تايرد.' },
            { en: 'I am tired.', ar: 'انا تعبان.', translit: 'اي ام تايرد.' },
            { en: 'Are you tired?', ar: 'تعبان؟', translit: 'ار يو تايرد؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'How are you?', ar: 'كيفك؟', translit: 'هاو ار يو؟' },
        { who: 'B', en: 'I am tired.', ar: 'تعبان.', translit: 'اي ام تايرد.' },
        { who: 'A', en: 'Why?', ar: 'ليش؟', translit: 'واي؟' },
        { who: 'B', en: 'I did not sleep.', ar: 'ما نمت.', translit: 'اي ديد نات سليب.' },
      ],
    },
    'subject-pronouns': {
      title: { en: 'Subject Pronouns', ar: 'كلمات الاشخاص (I, you, he, she...)' },
      items: [
        {
          en: 'I', ar: 'انا', translit: 'اي', pos: 'pronoun',
          ipa: '/aɪ/',
          example: { en: 'I am a student.', ar: 'انا طالب.', translit: 'اي ام ا ستودنت.' },
          usage: { en: 'Used when you talk about yourself.', ar: 'تستخدمها وقت ما تتكلم عن نفسك.' },
          sentences: [
            { en: 'I am here.', ar: 'انا هنا.', translit: 'اي ام هير.' },
            { en: 'I am a student.', ar: 'انا طالب.', translit: 'اي ام ا ستودنت.' },
            { en: 'I like coffee.', ar: 'انا احب القهوة.', translit: 'اي لايك كوفي.' },
          ],
        },
        {
          en: 'you', ar: 'انت', translit: 'يو', pos: 'pronoun',
          ipa: '/juː/',
          example: { en: 'You are my friend.', ar: 'انت صديقي.', translit: 'يو ار ماي فرند.' },
          usage: { en: 'Used to talk to someone.', ar: 'تستخدمها وقت ما تكلم شخص.' },
          sentences: [
            { en: 'You are kind.', ar: 'انت طيب.', translit: 'يو ار كايند.' },
            { en: 'Are you okay?', ar: 'انت بخير؟', translit: 'ار يو اوكي؟' },
            { en: 'You speak English.', ar: 'انت تتكلم انجليزي.', translit: 'يو سبيك انقليش.' },
          ],
        },
        {
          en: 'he', ar: 'هو', translit: 'هي', pos: 'pronoun',
          ipa: '/hiː/',
          example: { en: 'He is my brother.', ar: 'هو اخوي.', translit: 'هي ايز ماي برذر.' },
          usage: { en: 'Used for a man or boy.', ar: 'تستخدمها لرجل او ولد.' },
          sentences: [
            { en: 'He is here.', ar: 'هو هنا.', translit: 'هي ايز هير.' },
            { en: 'He is a teacher.', ar: 'هو معلم.', translit: 'هي ايز ا تيتشر.' },
            { en: 'Where is he?', ar: 'وين هو؟', translit: 'وير ايز هي؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hello, who are you?', ar: 'هلا، من انت؟', translit: 'هلو، هو ار يو؟' },
        { who: 'B', en: 'I am Sara. And you?', ar: 'انا سارة. وانت؟', translit: 'اي ام سارة. اند يو؟' },
        { who: 'A', en: 'I am Firas. Is she your sister?', ar: 'انا فراس. هي اختك؟', translit: 'اي ام فراس. ايز شي يور سيستر؟' },
        { who: 'B', en: 'Yes, she is. They are my family.', ar: 'ايه، هي. هم اهلي.', translit: 'يس، شي ايز. ذاي ار ماي فاميلي.' },
      ],
    },
    'be-verb': {
      title: { en: 'The Be Verb', ar: 'كلمات الربط (am/is/are)' },
      items: [
        {
          en: 'am', ar: 'اكون', translit: 'ام', pos: 'verb',
          ipa: '/æm/',
          example: { en: 'I am a student.', ar: 'انا طالب.', translit: 'اي ام ا ستودنت.' },
          usage: { en: 'Used with the word I.', ar: 'تستخدمها مع كلمة اي.' },
          sentences: [
            { en: 'I am here.', ar: 'انا هنا.', translit: 'اي ام هير.' },
            { en: 'I am happy.', ar: 'انا مبسوط.', translit: 'اي ام هابي.' },
            { en: 'Am I late?', ar: 'جا متاخر؟', translit: 'ام اي ليت؟' },
          ],
        },
        {
          en: 'is', ar: 'يكون', translit: 'ايز', pos: 'verb',
          ipa: '/ɪz/',
          example: { en: 'He is my friend.', ar: 'هو صديقي.', translit: 'هي ايز ماي فرند.' },
          usage: { en: 'Used with he, she, and it.', ar: 'تستخدمها مع he وshe وit.' },
          sentences: [
            { en: 'She is here.', ar: 'هي هنا.', translit: 'شي ايز هير.' },
            { en: 'It is hot.', ar: 'الجو حار.', translit: 'ات ايز هوت.' },
            { en: 'Is he okay?', ar: 'هو بخير؟', translit: 'ايز هي اوكي؟' },
          ],
        },
        {
          en: 'are', ar: 'يكونون', translit: 'ار', pos: 'verb',
          ipa: '/ɑːr/',
          example: { en: 'You are my friend.', ar: 'انت صديقي.', translit: 'يو ار ماي فرند.' },
          usage: { en: 'Used with you, we, and they.', ar: 'تستخدمها مع يو وي وذاي.' },
          sentences: [
            { en: 'We are here.', ar: 'نحن هنا.', translit: 'وي ار هير.' },
            { en: 'They are students.', ar: 'هم طلاب.', translit: 'ذاي ار ستودنتس.' },
            { en: 'Are you free?', ar: 'انت فاضي؟', translit: 'ار يو فري؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Are you a student?', ar: 'انت طالب؟', translit: 'ار يو ا ستودنت؟' },
        { who: 'B', en: 'Yes, I am. Are you?', ar: 'ايه، انا. وانت؟', translit: 'يس، اي ام. ار يو؟' },
        { who: 'A', en: 'No, I am a teacher. Is she a student?', ar: 'لا، انا معلم. هي طالبة؟', translit: 'نو، اي ام ا تيتشر. ايز شي ا ستودنت؟' },
        { who: 'B', en: 'Yes, she is.', ar: 'ايه، هي.', translit: 'يس، شي ايز.' },
      ],
    },
    'this-and-that': {
      title: { en: 'This and That', ar: 'هذا وذاك' },
      items: [
        {
          en: 'this', ar: 'هذا', translit: 'ذس', pos: 'pronoun',
          ipa: '/ðɪs/',
          example: { en: 'This is my book.', ar: 'هذا كتابي.', translit: 'ذس ايز ماي بوك.' },
          usage: { en: 'Used for something close to you.', ar: 'تستخدمها لشي قريب منك.' },
          sentences: [
            { en: 'This is mine.', ar: 'هذا حقي.', translit: 'ذس ايز ماين.' },
            { en: 'What is this?', ar: 'وش هذا؟', translit: 'وات ايز ذس؟' },
            { en: 'This is good.', ar: 'هذا زين.', translit: 'ذس ايز غود.' },
          ],
        },
        {
          en: 'that', ar: 'ذاك', translit: 'ذات', pos: 'pronoun',
          ipa: '/ðæt/',
          example: { en: 'That is your bag.', ar: 'هذاك شنطتك.', translit: 'ذات ايز يور باق.' },
          usage: { en: 'Used for something far from you.', ar: 'تستخدمها لشي بعيد عنك.' },
          sentences: [
            { en: 'That is far.', ar: 'ذاك بعيد.', translit: 'ذات ايز فار.' },
            { en: 'What is that?', ar: 'وش ذاك؟', translit: 'وات ايز ذات؟' },
            { en: 'That is yours.', ar: 'ذاك حقك.', translit: 'ذات ايز يورز.' },
          ],
        },
        {
          en: 'these', ar: 'هذي', translit: 'ذيس', pos: 'pronoun',
          ipa: '/ðiːz/',
          example: { en: 'These are my books.', ar: 'هذي كتبي.', translit: 'ذيس ار ماي بوكس.' },
          usage: { en: 'Plural of this, for close things.', ar: 'جمع هذا، لاشيا قريبة.' },
          sentences: [
            { en: 'These are mine.', ar: 'هذي حقي.', translit: 'ذيس ار ماين.' },
            { en: 'Are these yours?', ar: 'هذي حقك؟', translit: 'ار ذيس يورز؟' },
            { en: 'These are good.', ar: 'هذي زينة.', translit: 'ذيس ار غود.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'What is this?', ar: 'وش هذا؟', translit: 'وات ايز ذس؟' },
        { who: 'B', en: 'This is my pen. And that?', ar: 'هذا قلمي. وذاك؟', translit: 'ذس ايز ماي بن. اند ذات؟' },
        { who: 'A', en: 'That is my book.', ar: 'ذاك كتابي.', translit: 'ذات ايز ماي بوك.' },
        { who: 'B', en: 'Are these yours too?', ar: 'هذي حقك بعد؟', translit: 'ار ذيس يورز تو؟' },
      ],
    },
    'a-an-the': {
      title: { en: 'A, An, The', ar: 'كلمات التعريف (a, an, the)' },
      items: [
        {
          en: 'a', ar: 'واحد', translit: 'ا', pos: 'article',
          ipa: '/eɪ/',
          example: { en: 'I have a dog.', ar: 'عندي كلب.', translit: 'اي هاف ا دوغ.' },
          usage: { en: 'Used before a word starting with a consonant sound.', ar: 'تستخدمها قبل كلمة تبدا بصوت ساكن.' },
          sentences: [
            { en: 'A cat.', ar: 'قط.', translit: 'ا كات.' },
            { en: 'I have a car.', ar: 'عندي سيارة.', translit: 'اي هاف ا كار.' },
            { en: 'It is a book.', ar: 'هذا كتاب.', translit: 'ات ايز ا بوك.' },
          ],
        },
        {
          en: 'an', ar: 'واحد', translit: 'ان', pos: 'article',
          ipa: '/æn/',
          example: { en: 'I have an apple.', ar: 'عندي تفاحة.', translit: 'اي هاف ان ابل.' },
          usage: { en: 'Used before a word starting with a vowel sound.', ar: 'تستخدمها قبل كلمة تبدا بصوت متحرك.' },
          sentences: [
            { en: 'An egg.', ar: 'بيضة.', translit: 'ان اوق.' },
            { en: 'I have an orange.', ar: 'عندي برتقالة.', translit: 'اي هاف ان اورنج.' },
            { en: 'It is an egg.', ar: 'هذي بيضة.', translit: 'ات ايز ان اوق.' },
          ],
        },
        {
          en: 'the', ar: 'الـ', translit: 'ذا', pos: 'article',
          ipa: '/ðə/',
          example: { en: 'The cat is here.', ar: 'القط هنا.', translit: 'ذا كات ايز هير.' },
          usage: { en: 'Used for a specific thing both people know.', ar: 'تستخدمها لشي معين يعرفه الطرفان.' },
          sentences: [
            { en: 'The door is open.', ar: 'الباب مفتوح.', translit: 'ذا دور ايز اوبن.' },
            { en: 'Close the door.', ar: 'قفل الباب.', translit: 'كلوز ذا دور.' },
            { en: 'The book is mine.', ar: 'الكتاب حقي.', translit: 'ذا بوك ايز ماين.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'I have a car and an idea.', ar: 'عندي سيارة وفكرة.', translit: 'اي هاف ا كار اند ان ايديا.' },
        { who: 'B', en: 'What is the idea?', ar: 'وش الفكرة؟', translit: 'وات ايز ذا ايديا؟' },
        { who: 'A', en: 'Let\'s buy a house.', ar: 'نشتري بيت.', translit: 'لتس باي ا هاوس.' },
        { who: 'B', en: 'The house near the sea?', ar: 'البيت اللي قريب البحر؟', translit: 'ذا هاوس نير ذا سي؟' },
      ],
    },
    'singular-plural': {
      title: { en: 'Singular and Plural', ar: 'المفرد والجمع' },
      items: [
        {
          en: 'book', ar: 'كتاب', translit: 'بوك', pos: 'noun',
          ipa: '/bʊk/',
          example: { en: 'I have two books.', ar: 'عندي كتابين.', translit: 'اي هاف تو بوكس.' },
          usage: { en: 'Add an s to make most words plural.', ar: 'تزيد حرف s عشان تجمع الكلمات.' },
          sentences: [
            { en: 'One book.', ar: 'كتاب.', translit: 'ون بوك.' },
            { en: 'Two books.', ar: 'كتابين.', translit: 'تو بوكس.' },
            { en: 'These books are mine.', ar: 'هذي الكتب حقي.', translit: 'ذيس بوكس ار ماين.' },
          ],
        },
        {
          en: 'cat', ar: 'قط', translit: 'كات', pos: 'noun',
          ipa: '/kæt/',
          example: { en: 'The cats are sleeping.', ar: 'القطط نايمة.', translit: 'ذا كاتس ار سليبينق.' },
          usage: { en: 'Regular plural adds an s.', ar: 'الجمع المنتظم يزيد حرف s.' },
          sentences: [
            { en: 'One cat.', ar: 'قط.', translit: 'ون كات.' },
            { en: 'Two cats.', ar: 'قطين.', translit: 'تو كاتس.' },
            { en: 'I love cats.', ar: 'احب القطط.', translit: 'اي لاف كاتس.' },
          ],
        },
        {
          en: 'man', ar: 'رجل', translit: 'مان', pos: 'noun',
          ipa: '/mæn/',
          example: { en: 'Two men are here.', ar: 'رجلين موجودين.', translit: 'تو من ار هير.' },
          usage: { en: 'Some words change inside for plural.', ar: 'كلمات تتغير من جوا للجمع.' },
          sentences: [
            { en: 'One man.', ar: 'رجل.', translit: 'ون مان.' },
            { en: 'Two men.', ar: 'رجلين.', translit: 'تو من.' },
            { en: 'The men are working.', ar: 'الرجال يشتغلون.', translit: 'ذا من ار ويركينق.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'I have one cat.', ar: 'عندي قط.', translit: 'اي هاف ون كات.' },
        { who: 'B', en: 'I have three cats.', ar: 'عندي ثلاث قطط.', translit: 'اي هاف ثري كاتس.' },
        { who: 'A', en: 'Are those men your friends?', ar: 'هل الرجال اصحابك؟', translit: 'ار ذوز من يور فرندز؟' },
        { who: 'B', en: 'Yes, they are.', ar: 'ايه، هم.', translit: 'يس، ذاي ار.' },
      ],
    },
    'common-verbs': {
      title: { en: 'Common Verbs', ar: 'افعال شايعة' },
      items: [
        {
          en: 'go', ar: 'روح', translit: 'قو', pos: 'verb',
          ipa: '/ɡoʊ/',
          example: { en: 'I go to work.', ar: 'اروح الشغل.', translit: 'اي قو تو ويرك.' },
          usage: { en: 'Used to move to a place.', ar: 'تستخدمها تنتقل لمكان.' },
          sentences: [
            { en: 'I go home.', ar: 'اروح البيت.', translit: 'اي قو هوم.' },
            { en: 'Where do you go?', ar: 'لمين تروح؟', translit: 'وير دو يو قو؟' },
            { en: 'Let\'s go.', ar: 'يلا نروح.', translit: 'لتس قو.' },
          ],
        },
        {
          en: 'eat', ar: 'كل', translit: 'ايت', pos: 'verb',
          ipa: '/iːt/',
          example: { en: 'I eat breakfast.', ar: 'اكل فطور.', translit: 'اي ايت بريكفاست.' },
          usage: { en: 'Used to put food in your mouth.', ar: 'تستخدمها تحط اكل بفمك.' },
          sentences: [
            { en: 'I eat rice.', ar: 'اكل رز.', translit: 'اي ايت رايس.' },
            { en: 'Do you eat fish?', ar: 'تاكل سمك؟', translit: 'دو يو ايت فيش؟' },
            { en: 'Let\'s eat.', ar: 'يلا ناكل.', translit: 'لتس ايت.' },
          ],
        },
        {
          en: 'work', ar: 'اشتغل', translit: 'ويرك', pos: 'verb',
          ipa: '/wɜːrk/',
          example: { en: 'I work in Jeddah.', ar: 'اشتغل بجدة.', translit: 'اي ويرك ان جدّة.' },
          usage: { en: 'Used for your job.', ar: 'تستخدمها لشغلك.' },
          sentences: [
            { en: 'I work here.', ar: 'اشتغل هنا.', translit: 'اي ويرك هير.' },
            { en: 'Where do you work?', ar: 'وين تشتغل؟', translit: 'وير دو يو ويرك؟' },
            { en: 'He works hard.', ar: 'يشتغل بجد.', translit: 'هي ويركس هارد.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Where do you work?', ar: 'وين تشتغل؟', translit: 'وير دو يو ويرك؟' },
        { who: 'B', en: 'I work in a school. And you?', ar: 'اشتغل بمدرسة. وانت؟', translit: 'اي ويرك ان ا سكول. اند يو؟' },
        { who: 'A', en: 'I go to an office. Do you eat there?', ar: 'اروح مكتب. تاكل هناك؟', translit: 'اي قو تو ان اوفيس. دو يو ايت ذير؟' },
        { who: 'B', en: 'No, I eat at home.', ar: 'لا، اكل بالبيت.', translit: 'نو، اي ايت ات هوم.' },
      ],
    },
    'places-in-town': {
      title: { en: 'Places in Town', ar: 'اماكن بالمدينة' },
      items: [
        {
          en: 'school', ar: 'مدرسة', translit: 'سكول', pos: 'place',
          ipa: '/skuːl/',
          example: { en: 'The school is near.', ar: 'المدرسة قريبة.', translit: 'ذا سكول ايز نير.' },
          usage: { en: 'Where children learn.', ar: 'مكان يتعلم فيه الاطفال.' },
          sentences: [
            { en: 'I go to school.', ar: 'اروح المدرسة.', translit: 'اي قو تو سكول.' },
            { en: 'The school is big.', ar: 'المدرسة كبيرة.', translit: 'ذا سكول ايز بيغ.' },
            { en: 'Where is the school?', ar: 'وين المدرسة؟', translit: 'وير ايز ذا سكول؟' },
          ],
        },
        {
          en: 'hospital', ar: 'مستشفى', translit: 'هوسبيتول', pos: 'place',
          ipa: '/ˈhɑːspɪtəl/',
          example: { en: 'The hospital is open.', ar: 'المستشفى مفتوح.', translit: 'ذا هوسبيتول ايز اوبن.' },
          usage: { en: 'Where sick people get help.', ar: 'مكان المرضى ياخذون فيه علاج ومساعدة.' },
          sentences: [
            { en: 'I go to the hospital.', ar: 'اروح المستشفى.', translit: 'اي قو تو ذا هوسبيتول.' },
            { en: 'Where is the hospital?', ar: 'وين المستشفى؟', translit: 'وير ايز ذا هوسبيتول؟' },
            { en: 'The hospital is far.', ar: 'المستشفى بعيد.', translit: 'ذا هوسبيتول ايز فار.' },
          ],
        },
        {
          en: 'market', ar: 'سوق', translit: 'ماركت', pos: 'place',
          ipa: '/ˈmɑːrkɪt/',
          example: { en: 'I buy food at the market.', ar: 'اشتري اكل بالسوق.', translit: 'اي باي فود ات ذا ماركت.' },
          usage: { en: 'Where you buy things.', ar: 'مكان تشتري فيه الاشيا.' },
          sentences: [
            { en: 'The market is busy.', ar: 'السوق مزدحم.', translit: 'ذا ماركت ايز بيزي.' },
            { en: 'I go to the market.', ar: 'اروح السوق.', translit: 'اي قو تو ذا ماركت.' },
            { en: 'Where is the market?', ar: 'وين السوق؟', translit: 'وير ايز ذا ماركت؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Where is the hospital?', ar: 'وين المستشفى؟', translit: 'وير ايز ذا هوسبيتول؟' },
        { who: 'B', en: 'It is near the school.', ar: 'قريب من المدرسة.', translit: 'ات ايز نير ذا سكول.' },
        { who: 'A', en: 'And the market?', ar: 'والسوق؟', translit: 'اند ذا ماركت؟' },
        { who: 'B', en: 'The market is far. Let\'s go.', ar: 'السوق بعيد. يلا نروح.', translit: 'ذا ماركت ايز فار. لتس قو.' },
      ],
    },
    'transport': {
      title: { en: 'Transport', ar: 'المواصلات' },
      items: [
        {
          en: 'car', ar: 'سيارة', translit: 'كار', pos: 'noun',
          ipa: '/kɑːr/',
          example: { en: 'I have a car.', ar: 'عندي سيارة.', translit: 'اي هاف ا كار.' },
          usage: { en: 'A vehicle you drive.', ar: 'مركبة تسوقها.' },
          sentences: [
            { en: 'My car is red.', ar: 'سيارتي حمرا.', translit: 'ماي كار ايز ريد.' },
            { en: 'Where is my car?', ar: 'وين سيارتي؟', translit: 'وير ايز ماي كار؟' },
            { en: 'I drive a car.', ar: 'اسوق سيارة.', translit: 'اي درايف ا كار.' },
          ],
        },
        {
          en: 'bus', ar: 'حافلة', translit: 'باص', pos: 'noun',
          ipa: '/bʌs/',
          example: { en: 'I take the bus.', ar: 'اركب الباص.', translit: 'اي تيك ذا باص.' },
          usage: { en: 'A big vehicle for many people.', ar: 'مركبة كبيرة لناس كثر.' },
          sentences: [
            { en: 'The bus is late.', ar: 'الباص متاخر.', translit: 'ذا باص ايز ليت.' },
            { en: 'Where is the bus?', ar: 'وين الباص؟', translit: 'وير ايز ذا باص؟' },
            { en: 'I wait for the bus.', ar: 'انتظر الباص.', translit: 'اي ويت فور ذا باص.' },
          ],
        },
        {
          en: 'train', ar: 'قطار', translit: 'ترين', pos: 'noun',
          ipa: '/treɪn/',
          example: { en: 'The train is fast.', ar: 'القطار سريع.', translit: 'ذا ترين ايز فاست.' },
          usage: { en: 'A long vehicle on tracks.', ar: 'مركبة طويلة على سكة.' },
          sentences: [
            { en: 'I take the train.', ar: 'اركب القطار.', translit: 'اي تيك ذا ترين.' },
            { en: 'The train is full.', ar: 'القطار مليان.', translit: 'ذا ترين ايز فول.' },
            { en: 'Where is the train?', ar: 'وين القطار؟', translit: 'وير ايز ذا ترين؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Do you have a car?', ar: 'عندك سيارة؟', translit: 'دو يو هاف ا كار؟' },
        { who: 'B', en: 'No, I take the bus. And you?', ar: 'لا، اركب الباص. وانت؟', translit: 'نو، اي تيك ذا باص. اند يو؟' },
        { who: 'A', en: 'I take the train. It is fast.', ar: 'اركب القطار. سريع.', translit: 'اي تيك ذا ترين. ات ايز فاست.' },
        { who: 'B', en: 'The bus is slow but cheap.', ar: 'الباص بطي بس رخيص.', translit: 'ذا باص ايز سلو بات تشيب.' },
      ],
    },
    'home-and-rooms': {
      title: { en: 'Home and Rooms', ar: 'البيت والغرف' },
      items: [
        {
          en: 'kitchen', ar: 'مطبخ', translit: 'كتشن', pos: 'room',
          ipa: '/ˈkɪtʃən/',
          example: { en: 'I cook in the kitchen.', ar: 'اطبخ بالمطبخ.', translit: 'اي كوك ان ذا كتشن.' },
          usage: { en: 'Where you cook food.', ar: 'مكان تطبخ فيه.' },
          sentences: [
            { en: 'The kitchen is small.', ar: 'المطبخ صغير.', translit: 'ذا كتشن ايز سمول.' },
            { en: 'I am in the kitchen.', ar: 'انا بالمطبخ.', translit: 'اي ام ان ذا كتشن.' },
            { en: 'Where is the kitchen?', ar: 'وين المطبخ؟', translit: 'وير ايز ذا كتشن؟' },
          ],
        },
        {
          en: 'bedroom', ar: 'غرفة نوم', translit: 'بيدروم', pos: 'room',
          ipa: '/ˈbedruːm/',
          example: { en: 'I sleep in my bedroom.', ar: 'انام بغرفتي.', translit: 'اي سليب ان ماي بيدروم.' },
          usage: { en: 'Where you sleep.', ar: 'مكان تنام فيه.' },
          sentences: [
            { en: 'My bedroom is quiet.', ar: 'غرفتي هادية.', translit: 'ماي بيدروم ايز كوايت.' },
            { en: 'Where is the bedroom?', ar: 'وين غرفة النوم؟', translit: 'وير ايز ذا بيدروم؟' },
            { en: 'I clean my bedroom.', ar: 'انضف غرفتي.', translit: 'اي كلين ماي بيدروم.' },
          ],
        },
        {
          en: 'bathroom', ar: 'دورة مياه', translit: 'باثروم', pos: 'room',
          ipa: '/ˈbæθruːm/',
          example: { en: 'The bathroom is here.', ar: 'الدورة هنا.', translit: 'ذا باثروم ايز هير.' },
          usage: { en: 'Where you wash.', ar: 'مكان تغتسل فيه.' },
          sentences: [
            { en: 'Where is the bathroom?', ar: 'وين الدورة؟', translit: 'وير ايز ذا باثروم؟' },
            { en: 'The bathroom is clean.', ar: 'الدورة نظيفة.', translit: 'ذا باثروم ايز كلين.' },
            { en: 'I need the bathroom.', ar: 'محتاج الدورة.', translit: 'اي نيد ذا باثروم.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Where is the kitchen?', ar: 'وين المطبخ؟', translit: 'وير ايز ذا كتشن؟' },
        { who: 'B', en: 'It is next to the bathroom.', ar: 'جنب الدورة.', translit: 'ات ايز ناكست تو ذا باثروم.' },
        { who: 'A', en: 'Is the bedroom upstairs?', ar: 'غرفة النوم فوق؟', translit: 'ايز ذا بيدروم ابستيرز؟' },
        { who: 'B', en: 'Yes, and it is quiet.', ar: 'ايه، وهي هادية.', translit: 'يس، اند ات ايز كوايت.' },
      ],
    },
    'clothes': {
      title: { en: 'Clothes', ar: 'الملابس' },
      items: [
        {
          en: 'shirt', ar: 'قميص', translit: 'شيرت', pos: 'clothing',
          ipa: '/ʃɜːrt/',
          example: { en: 'My shirt is white.', ar: 'قميصي ابيض.', translit: 'ماي شيرت ايز وايت.' },
          usage: { en: 'You wear it on your upper body.', ar: 'تلبسه بجسمك العلوي.' },
          sentences: [
            { en: 'I buy a shirt.', ar: 'اشتري قميص.', translit: 'اي باي ا شيرت.' },
            { en: 'This shirt is new.', ar: 'هذا القميص جديد.', translit: 'ذس شيرت ايز نيو.' },
            { en: 'Where is my shirt?', ar: 'وين قميصي؟', translit: 'وير ايز ماي شيرت؟' },
          ],
        },
        {
          en: 'shoes', ar: 'جزمة', translit: 'شوز', pos: 'clothing',
          ipa: '/ʃuːz/',
          example: { en: 'My shoes are black.', ar: 'جزمتي سود.', translit: 'ماي شوز ار بلاك.' },
          usage: { en: 'You wear them on your feet.', ar: 'تلبسها برجليك.' },
          sentences: [
            { en: 'I need new shoes.', ar: 'محتاج جزم جديدة.', translit: 'اي نيد نيو شوز.' },
            { en: 'These shoes are old.', ar: 'هذي الجزم قديمة.', translit: 'ذيس شوز ار اولد.' },
            { en: 'Where are my shoes?', ar: 'وين جزمي؟', translit: 'وير ار ماي شوز؟' },
          ],
        },
        {
          en: 'hat', ar: 'قبعة', translit: 'هات', pos: 'clothing',
          ipa: '/hæt/',
          example: { en: 'I wear a hat.', ar: 'البس قبعة.', translit: 'اي وير ا هات.' },
          usage: { en: 'You wear it on your head.', ar: 'تلبسها براسك.' },
          sentences: [
            { en: 'This hat is nice.', ar: 'هذي القبعة حلوة.', translit: 'ذس هات ايز نايس.' },
            { en: 'I buy a hat.', ar: 'اشتري قبعة.', translit: 'اي باي ا هات.' },
            { en: 'Where is my hat?', ar: 'وين قبعتي؟', translit: 'وير ايز ماي هات؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Is this shirt new?', ar: 'هذا القميص جديد؟', translit: 'ايز ذس شيرت نيو؟' },
        { who: 'B', en: 'Yes, and my shoes are new too.', ar: 'ايه، وجزمي جديدة بعد.', translit: 'يس، اند ماي شوز ار نيو تو.' },
        { who: 'A', en: 'Where is your hat?', ar: 'وين قبعتك؟', translit: 'وير ايز يور هات؟' },
        { who: 'B', en: 'I do not have a hat.', ar: 'ما عندي قبعة.', translit: 'اي دو نات هاف ا هات.' },
      ],
    },
    'body-parts': {
      title: { en: 'Body Parts', ar: 'اجزا الجسم' },
      items: [
        {
          en: 'head', ar: 'راس', translit: 'هيد', pos: 'body',
          ipa: '/hed/',
          example: { en: 'My head hurts.', ar: 'راسي يوجعني.', translit: 'ماي هيد هورتس.' },
          usage: { en: 'The top part of your body.', ar: 'اللي فوق من جسمك.' },
          sentences: [
            { en: 'I touch my head.', ar: 'المس راسي.', translit: 'اي تتش ماي هيد.' },
            { en: 'My head is hot.', ar: 'راسي حار.', translit: 'ماي هيد ايز هوت.' },
            { en: 'Where is your head?', ar: 'وين راسك؟', translit: 'وير ايز يور هيد؟' },
          ],
        },
        {
          en: 'hand', ar: 'يد', translit: 'هاند', pos: 'body',
          ipa: '/hænd/',
          example: { en: 'I wash my hands.', ar: 'اغسل يدي.', translit: 'اي واش ماي هاندز.' },
          usage: { en: 'You use it to hold things.', ar: 'تستخدمها تمسك الاشيا.' },
          sentences: [
            { en: 'My hand is small.', ar: 'يدي صغيرة.', translit: 'ماي هاند ايز سمول.' },
            { en: 'Give me your hand.', ar: 'عطني يدك.', translit: 'جيف مي يور هاند.' },
            { en: 'I have two hands.', ar: 'عندي يدين.', translit: 'اي هاف تو هاندز.' },
          ],
        },
        {
          en: 'eye', ar: 'عين', translit: 'اي', pos: 'body',
          ipa: '/aɪ/',
          example: { en: 'My eyes are tired.', ar: 'عيني تعبانة.', translit: 'ماي ايز ار تايرد.' },
          usage: { en: 'You see with them.', ar: 'تشوف بها.' },
          sentences: [
            { en: 'I close my eyes.', ar: 'اغمض عيني.', translit: 'اي كلوز ماي ايز.' },
            { en: 'My eye is red.', ar: 'عيني حمرا.', translit: 'ماي اي ايز ريد.' },
            { en: 'I have two eyes.', ar: 'عندي عينين.', translit: 'اي هاف تو ايز.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Does your head hurt?', ar: 'راسك يوجعك؟', translit: 'دز يور هيد هورت؟' },
        { who: 'B', en: 'Yes, and my eyes are tired.', ar: 'ايه، وعيني تعبانة.', translit: 'يس، اند ماي ايز ار تايرد.' },
        { who: 'A', en: 'Wash your hands and rest.', ar: 'اغسل يديك وارتاح.', translit: 'واش يور هاندز اند ريست.' },
        { who: 'B', en: 'Okay, thank you.', ar: 'تمام، شكراً.', translit: 'اوكي، ثانك يو.' },
      ],
    },
    'hobbies-likes': {
      title: { en: 'Hobbies and Likes', ar: 'الهوايات والاهتمامات' },
      items: [
        {
          en: 'read', ar: 'اقرا', translit: 'ريد', pos: 'verb',
          ipa: '/riːd/',
          example: { en: 'I read books.', ar: 'اقرا كتب.', translit: 'اي ريد بوكس.' },
          usage: { en: 'To look at words and understand them.', ar: 'تنظر للكلمات وتفهمها.' },
          sentences: [
            { en: 'I read at night.', ar: 'اقرا بالليل.', translit: 'اي ريد ات نايت.' },
            { en: 'Do you read?', ar: 'تقرا؟', translit: 'دو يو ريد؟' },
            { en: 'I like to read.', ar: 'احب اقرا.', translit: 'اي لايك تو ريد.' },
          ],
        },
        {
          en: 'play', ar: 'العب', translit: 'بلاي', pos: 'verb',
          ipa: '/pleɪ/',
          example: { en: 'I play football.', ar: 'العب كرة.', translit: 'اي بلاي فوتبول.' },
          usage: { en: 'To do a game for fun.', ar: 'تمارس لعبة للتسلية.' },
          sentences: [
            { en: 'I play with friends.', ar: 'العب مع اصحابي.', translit: 'اي بلاي ويث فرندز.' },
            { en: 'Do you play?', ar: 'تلعب؟', translit: 'دو يو بلاي؟' },
            { en: 'I like to play.', ar: 'احب العب.', translit: 'اي لايك تو بلاي.' },
          ],
        },
        {
          en: 'like', ar: 'احب', translit: 'لايك', pos: 'verb',
          ipa: '/laɪk/',
          example: { en: 'I like coffee.', ar: 'احب القهوة.', translit: 'اي لايك كوفي.' },
          usage: { en: 'Used to say what you enjoy.', ar: 'تستخدمها تقول وش يعجبك.' },
          sentences: [
            { en: 'I like it.', ar: 'يعجبني.', translit: 'اي لايك ات.' },
            { en: 'Do you like it?', ar: 'يعجبك؟', translit: 'دو يو لايك ات؟' },
            { en: 'I like to read.', ar: 'احب اقرا.', translit: 'اي لايك تو ريد.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'What do you like?', ar: 'وش يعجبك؟', translit: 'وات دو يو لايك؟' },
        { who: 'B', en: 'I like to read books. And you?', ar: 'احب اقرا كتب. وانت؟', translit: 'اي لايك تو ريد بوكس. اند يو؟' },
        { who: 'A', en: 'I play football. Do you play?', ar: 'العب كرة. تلعب؟', translit: 'اي بلاي فوتبول. دو يو بلاي؟' },
        { who: 'B', en: 'No, but I like to watch.', ar: 'لا، بس احب اتفرج.', translit: 'نو، بات اي لايك تو واتش.' },
      ],
    },
    /* ---- Phase 7 additions: daily life + southern Saudi flair ----
       Conversational southern Saudi Arabic (Jazan / Asir / Najran flavor):
       uses وش, ابغى, ترى, ايه, ماشي, خلك, زين. English is the target being
       taught; Arabic is the support translation so the learner understands. */
    'at-the-restaurant': {
      title: { en: 'At the Restaurant', ar: 'بالمطعم' },
      items: [
        {
          en: 'menu', ar: 'منيو', translit: 'مينيو', pos: 'noun',
          ipa: '/ˈmenjuː/',
          example: { en: 'Can I see the menu?', ar: 'ممكن اشوف المنيو؟', translit: 'كان اي سي ذا مينيو؟' },
          usage: { en: 'The list of food and prices. Ask for it when you sit down.', ar: 'قايمة الاكل والاسعار. اطلبها اول ما تقعد.' },
          sentences: [
            { en: 'The menu, please.', ar: 'المنيو، لو سمحت.', translit: 'ذا مينيو، بليز.' },
            { en: 'Can I see the menu?', ar: 'ممكن اشوف المنيو؟', translit: 'كان اي سي ذا مينيو؟' },
            { en: 'What is good on the menu?', ar: 'وش الزين بالمنيو؟', translit: 'وات ايز غود اون ذا مينيو؟' },
          ],
        },
        {
          en: 'order', ar: 'طلب', translit: 'اوردر', pos: 'verb',
          ipa: '/ˈɔːrdər/',
          example: { en: 'I want to order food.', ar: 'ابغى اطلب اكل.', translit: 'اي وانت تو اوردر فوود.' },
          usage: { en: 'To ask for your food. "I would like to order" is polite.', ar: 'عشان تطلب اكلك. "ابغى اطلب" مهذبة.' },
          sentences: [
            { en: 'I want to order.', ar: 'ابغى اطلب.', translit: 'اي وانت تو اوردر.' },
            { en: 'Are you ready to order?', ar: 'جاهز تطلب؟', translit: 'ار يو ريدي تو اوردر؟' },
            { en: 'I will order coffee.', ar: 'باطلب قهوة.', translit: 'اي ويل اوردر كوفي.' },
          ],
        },
        {
          en: 'bill', ar: 'الحساب', translit: 'بيل', pos: 'noun',
          ipa: '/bɪl/',
          example: { en: 'The bill, please.', ar: 'الحساب، لو سمحت.', translit: 'ذا بيل، بليز.' },
          usage: { en: 'The paper that shows what to pay. Also called the check.', ar: 'الورقة اللي تبين وش تدفع. كمان يسمونها تشيك.' },
          sentences: [
            { en: 'The bill, please.', ar: 'الحساب، لو سمحت.', translit: 'ذا بيل، بليز.' },
            { en: 'Can I have the bill?', ar: 'ممكن الحساب؟', translit: 'كان اي هاف ذا بيل؟' },
            { en: 'Is the bill correct?', ar: 'الحساب مضبوط؟', translit: 'ايز ذا بيل كوركت؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hello, can I see the menu?', ar: 'هلا، ممكن اشوف المنيو؟', translit: 'هلو، كان اي سي ذا مينيو؟' },
        { who: 'B', en: 'Of course. Are you ready to order?', ar: 'اكيد. جاهز تطلب؟', translit: 'اوف كورس. ار يو ريدي تو اوردر؟' },
        { who: 'A', en: 'Yes, I want coffee and bread.', ar: 'ايه، ابغى قهوة وخبز.', translit: 'يس، اي وانت كوفي اند بريد.' },
        { who: 'B', en: 'Great. I will bring the bill soon.', ar: 'تمام. بجيب الحساب بسرعة.', translit: 'غريت. اي ويل برينق ذا بيل سون.' },
      ],
    },
    'at-the-airport': {
      title: { en: 'At the Airport', ar: 'بالمطار' },
      items: [
        {
          en: 'gate', ar: 'بوابة', translit: 'غيت', pos: 'noun',
          ipa: '/ɡeɪt/',
          example: { en: 'My gate is number ten.', ar: 'بوابتي رقم عشرة.', translit: 'ماي غيت ايز نمبر تن.' },
          usage: { en: 'The door you go through to get on the plane.', ar: 'الباب اللي تدخله عشان تركب الطيارة.' },
          sentences: [
            { en: 'Where is the gate?', ar: 'وين البوابة؟', translit: 'وير ايز ذا غيت؟' },
            { en: 'Gate ten.', ar: 'بوابة عشرة.', translit: 'غيت تن.' },
            { en: 'My gate is open.', ar: 'بوابتي مفتوحة.', translit: 'ماي غيت ايز اوبن.' },
          ],
        },
        {
          en: 'boarding pass', ar: 'بطاقة الصعود', translit: 'بوردنق باس', pos: 'noun',
          ipa: '/ˈbɔːrdɪŋ pæs/',
          example: { en: 'Here is your boarding pass.', ar: 'هذي بطاقة صعودك.', translit: 'هير ايز يور بوردنق باس.' },
          usage: { en: 'The paper that lets you board the plane.', ar: 'الورقة اللي تخليك تركب الطيارة.' },
          sentences: [
            { en: 'My boarding pass.', ar: 'بطاقة صعودي.', translit: 'ماي بوردنق باس.' },
            { en: 'Do you have a boarding pass?', ar: 'عندك بطاقة صعود؟', translit: 'دو يو هاف ا بوردنق باس؟' },
            { en: 'Show your boarding pass.', ar: 'ورني بطاقة صعودك.', translit: 'شو يور بوردنق باس.' },
          ],
        },
        {
          en: 'luggage', ar: 'شنط', translit: 'لاقیج', pos: 'noun',
          ipa: '/ˈlʌɡɪdʒ/',
          example: { en: 'My luggage is heavy.', ar: 'شنطي ثقيلة.', translit: 'ماي لاگیج ايز هيفي.' },
          usage: { en: 'Your bags and suitcases. Saudis say شنط for bags.', ar: 'حقايبك. السعوديين يقولون شنط.' },
          sentences: [
            { en: 'My luggage.', ar: 'شنطي.', translit: 'ماي لاگیج.' },
            { en: 'Where is my luggage?', ar: 'وين شنطي؟', translit: 'وير ايز ماي لاگیج؟' },
            { en: 'The luggage is here.', ar: 'الشنط هنا.', translit: 'ذا لاگیج ايز هير.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Where is my gate?', ar: 'وين بوابتي؟', translit: 'وير ايز ماي غيت؟' },
        { who: 'B', en: 'Gate ten, on the left.', ar: 'بوابة عشرة، على اليسار.', translit: 'غيت تن، اون ذا لفت.' },
        { who: 'A', en: 'Here is my boarding pass.', ar: 'هذي بطاقة صعودي.', translit: 'هير ايز ماي بوردنق باس.' },
        { who: 'B', en: 'Thank you. Is your luggage checked?', ar: 'يعطيك العافية. سجلت شنطك؟', translit: 'ثانك يو. ايز يور لاگیج چکت؟' },
      ],
    },
    'at-the-market': {
      title: { en: 'At the Market', ar: 'بالسوق' },
      items: [
        {
          en: 'price', ar: 'سعر', translit: 'پرایس', pos: 'noun',
          ipa: '/praɪs/',
          example: { en: 'What is the price?', ar: 'كم السعر؟', translit: 'وات ايز ذا پرایس؟' },
          usage: { en: 'How much something costs.', ar: 'كم يكلف الشي.' },
          sentences: [
            { en: 'The price is high.', ar: 'السعر غالي.', translit: 'ذا پرایس ايز های.' },
            { en: 'What is the price?', ar: 'كم السعر؟', translit: 'وات ايز ذا پرایس؟' },
            { en: 'Good price.', ar: 'سعر زين.', translit: 'گود پرایس.' },
          ],
        },
        {
          en: 'cheap', ar: 'رخيص', translit: 'چیپ', pos: 'adjective',
          ipa: '/tʃiːp/',
          example: { en: 'This is cheap.', ar: 'هذا رخيص.', translit: 'ذس ايز چیپ.' },
          usage: { en: 'Low price. The opposite is expensive.', ar: 'سعره واطي. العكس غالي.' },
          sentences: [
            { en: 'It is cheap.', ar: 'رخيص.', translit: 'ات ایز چیپ.' },
            { en: 'Is it cheap?', ar: 'رخيص؟', translit: 'ايز ات چیپ؟' },
            { en: 'A cheap one, please.', ar: 'واحد رخيص، لو سمحت.', translit: 'ا چیپ وان، بلیز.' },
          ],
        },
        {
          en: 'expensive', ar: 'غالي', translit: 'اکسپنسیو', pos: 'adjective',
          ipa: '/ɪkˈspensɪv/',
          example: { en: 'This is too expensive.', ar: 'هذا غالي مرّة.', translit: 'ذس ایز تو اکسپنسیو.' },
          usage: { en: 'High price. Say "too expensive" to ask for less.', ar: 'سعره عالي. قول "غالی مرّة" عشان يتنازل.' },
          sentences: [
            { en: 'It is expensive.', ar: 'غالي.', translit: 'ات ایز اکسپنسیو.' },
            { en: 'Too expensive.', ar: 'غالي مرّة.', translit: 'تو اکسپنسیو.' },
            { en: 'Is it expensive?', ar: 'غالي؟', translit: 'ايز ات اکسپنسیو؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'How much is this?', ar: 'كم هذا؟', translit: 'هاو مچ ایز ذس؟' },
        { who: 'B', en: 'Fifty riyals.', ar: 'خمسين ريال.', translit: 'فیفتی ریالز.' },
        { who: 'A', en: 'That is too expensive.', ar: 'غالي مرّة.', translit: 'ذات ایز تو اکسپنسیو.' },
        { who: 'B', en: 'OK, forty for you.', ar: 'تمام، اربعين لك.', translit: 'اوکی، فورتی فور یو.' },
      ],
    },
    'weather-and-seasons': {
      title: { en: 'Weather & Seasons', ar: 'الطقس والفصول' },
      items: [
        {
          en: 'hot', ar: 'حار', translit: 'هات', pos: 'adjective',
          ipa: '/hɒt/',
          example: { en: 'It is hot today.', ar: 'الجو حار اليوم.', translit: 'ات ایز هات تودای.' },
          usage: { en: 'High temperature. Very common in Saudi summer.', ar: 'حرارته عالية. شايع بصيف السعودية.' },
          sentences: [
            { en: 'It is hot.', ar: 'حار.', translit: 'ات ایز هات.' },
            { en: 'Today is hot.', ar: 'اليوم حار.', translit: 'تودای ایز هات.' },
            { en: 'Is it hot outside?', ar: 'حار بره؟', translit: 'ايز ات هات اوتساید؟' },
          ],
        },
        {
          en: 'cold', ar: 'بارد', translit: 'کولد', pos: 'adjective',
          ipa: '/koʊld/',
          example: { en: 'It is cold in the morning.', ar: 'الجو بارد الصبح.', translit: 'ات ایز کولد ان ذا مورنینق.' },
          usage: { en: 'Low temperature. The opposite is hot.', ar: 'حرارته واطية. العكس حار.' },
          sentences: [
            { en: 'It is cold.', ar: 'بارد.', translit: 'ات ایز کولد.' },
            { en: 'The water is cold.', ar: 'الماي بارد.', translit: 'ذا واتر ایز کولد.' },
            { en: 'Is it cold today?', ar: 'بارد اليوم؟', translit: 'ایز ات کولد تودای؟' },
          ],
        },
        {
          en: 'rain', ar: 'مطر', translit: 'رین', pos: 'noun',
          ipa: '/reɪn/',
          example: { en: 'The rain is heavy.', ar: 'المطر غزير.', translit: 'ذا رین ایز هيفي.' },
          usage: { en: 'Water that falls from clouds.', ar: 'ماي ينزل من السحب.' },
          sentences: [
            { en: 'It is rain.', ar: 'مطر.', translit: 'ات ایز رین.' },
            { en: 'No rain today.', ar: 'ما في مطر اليوم.', translit: 'نو رین تودای.' },
            { en: 'Is there rain?', ar: 'في مطر؟', translit: 'ايز ذیر رین؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Is it hot today?', ar: 'حار اليوم؟', translit: 'ایز ات هات تودای؟' },
        { who: 'B', en: 'Yes, very hot.', ar: 'ايه، حار مرّة.', translit: 'یس، ویری هات.' },
        { who: 'A', en: 'Any rain?', ar: 'في مطر؟', translit: 'انی رین؟' },
        { who: 'B', en: 'No rain, just hot.', ar: 'ما في، حار بس.', translit: 'نو رین، جست هات.' },
      ],
    },
    'southern-saudi-phrases': {
      title: { en: 'Southern Saudi Phrases', ar: 'عبارات جنوبية' },
      items: [
        {
          en: 'how are things', ar: 'وش اخبارك', translit: 'هاو ار ثینقز', pos: 'phrase',
          ipa: '/haʊ ɑːr θɪŋz/',
          example: { en: 'How are things with you?', ar: 'وش اخبارك؟', translit: 'هاو ار ثینقز وذ یو؟' },
          usage: { en: 'A warm southern way to ask how someone is.', ar: 'طريقة جنوبية دافية تسال فيها عن حال الشخص.' },
          sentences: [
            { en: 'How are things?', ar: 'وش اخبارك؟', translit: 'هاو ار ثینقز؟' },
            { en: 'How are things at home?', ar: 'وش اخباركم بالبيت؟', translit: 'هاو ار ثینقز ات هوم؟' },
            { en: 'How are things today?', ar: 'وش اخبارك اليوم؟', translit: 'هاو ار ثینقز تودای؟' },
          ],
        },
        {
          en: 'it is fine', ar: 'ماشي', translit: 'ات ایز فاین', pos: 'phrase',
          ipa: '/ɪt ɪz faɪn/',
          example: { en: 'It is fine, no problem.', ar: 'ماشي، ما في مشكلة.', translit: 'ات ایز فاین، نو پرابلم.' },
          usage: { en: 'Southern "ماشي" means okay, it works, no worries.', ar: 'باللهجة الجنوبية "ماشي" يعني تمام، ما في مشكلة.' },
          sentences: [
            { en: 'It is fine.', ar: 'ماشي.', translit: 'ات ایز فاین.' },
            { en: 'It is fine, thank you.', ar: 'ماشي، شكراً.', translit: 'ات ایز فاین، ثانک یو.' },
            { en: 'Is it fine?', ar: 'ماشي؟', translit: 'ایز ات فاین؟' },
          ],
        },
        {
          en: 'by the way', ar: 'ترى', translit: 'بای ذا وای', pos: 'phrase',
          ipa: '/baɪ ðə weɪ/',
          example: { en: 'By the way, it is hot.', ar: 'ترى، الجو حار.', translit: 'بای ذا وای، ات ایز هات.' },
          usage: { en: 'Add something extra. Southern "ترى" softens a point.', ar: 'تضيف شي. "ترى" بالجنوب تلطف الكلام.' },
          sentences: [
            { en: 'By the way, I am Firas.', ar: 'ترى، انا فراس.', translit: 'بای ذا وای، ای ام فراس.' },
            { en: 'By the way, the price is high.', ar: 'ترى، السعر غالي.', translit: 'بای ذا وای، ذا پرایس ایز های.' },
            { en: 'By the way, are you free?', ar: 'ترى، فاضي؟', translit: 'بای ذا وای، ار یو فری؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'How are things?', ar: 'وش اخبارك؟', translit: 'هاو ار ثینقز؟' },
        { who: 'B', en: 'It is fine, thank you.', ar: 'ماشي، شكراً.', translit: 'ات ایز فاین، ثانک یو.' },
        { who: 'A', en: 'By the way, are you free today?', ar: 'ترى، فاضي اليوم؟', translit: 'بای ذا وای، ار یو فری تودای؟' },
        { who: 'B', en: 'Yes, see you later.', ar: 'ايه، اشوفك بعدين.', translit: 'یس، سی یو لیتر.' },
      ],
    },
    'work-and-jobs': {
      title: { en: 'Work & Jobs', ar: 'الشغل والوظايف' },
      items: [
        {
          en: 'job', ar: 'شغل', translit: 'جاب', pos: 'noun',
          ipa: '/dʒɒb/',
          example: { en: 'I have a new job.', ar: 'عندي شغل جديد.', translit: 'ای هاف ا نیو جاب.' },
          usage: { en: 'Your work. Saudis say شغل for job or work.', ar: 'شغلك. السعوديين يقولون شغل.' },
          sentences: [
            { en: 'My job.', ar: 'شغلي.', translit: 'ماي جاب.' },
            { en: 'I like my job.', ar: 'يعجبني شغلي.', translit: 'ای لایک ماي جاب.' },
            { en: 'Is the job hard?', ar: 'الشغل صعب؟', translit: 'ایز ذا جاب هارد؟' },
          ],
        },
        {
          en: 'office', ar: 'مكتب', translit: 'اوفیس', pos: 'noun',
          ipa: '/ˈɒfɪs/',
          example: { en: 'I am at the office.', ar: 'انا بالمكتب.', translit: 'ای ام ات ذا اوفیس.' },
          usage: { en: 'The place where people work at desks.', ar: 'المكان اللي يشتغلون فيه على المكاتب.' },
          sentences: [
            { en: 'The office.', ar: 'المكتب.', translit: 'ذا اوفیس.' },
            { en: 'I go to the office.', ar: 'اروح المكتب.', translit: 'ای قو تو ذا اوفیس.' },
            { en: 'Where is the office?', ar: 'وين المكتب؟', translit: 'ویر ایز ذا اوفیس؟' },
          ],
        },
        {
          en: 'meeting', ar: 'اجتماع', translit: 'میتینق', pos: 'noun',
          ipa: '/ˈmiːtɪŋ/',
          example: { en: 'I have a meeting.', ar: 'عندي اجتماع.', translit: 'ای هاف ا میتینق.' },
          usage: { en: 'When people talk about work together.', ar: 'لما يتكلمون عن الشغل سوا.' },
          sentences: [
            { en: 'A meeting.', ar: 'اجتماع.', translit: 'ا میتینق.' },
            { en: 'The meeting is long.', ar: 'الاجتماع طويل.', translit: 'ذا میتینق ایز لونق.' },
            { en: 'Is there a meeting?', ar: 'في اجتماع؟', translit: 'ایز ذیر ا میتینق؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'How is your job?', ar: 'وش اخبار شغلك؟', translit: 'هاو ایز یور جاب؟' },
        { who: 'B', en: 'Good. I am at the office.', ar: 'زين. انا بالمكتب.', translit: 'گود. ای ام ات ذا اوفیس.' },
        { who: 'A', en: 'Do you have a meeting?', ar: 'عندك اجتماع؟', translit: 'دو یو هاف ا میتینق؟' },
        { who: 'B', en: 'Yes, see you after the meeting.', ar: 'ايه، اشوفك بعد الاجتماع.', translit: 'یس، سی یو افتر ذا میتینق.' },
      ],
    },
    'at-the-hotel': {
      title: { en: 'At the Hotel', ar: 'في الفندق' },
      items: [
        { en: 'reservation', ar: 'حجز', translit: 'ريزيرفيشن', pos: 'noun', ipa: '/ˌrezərˈveɪʃən/',
          example: { en: 'I have a reservation.', ar: 'عندي حجز.', translit: 'اي هاف ا ريزيرفيشن.' },
          usage: { en: 'Say this at the front desk to confirm your booking.', ar: 'قولها في الاستقبال عشان تاكد حجزك.' },
          sentences: [
            { en: 'I have a reservation.', ar: 'عندي حجز.', translit: 'اي هاف ا ريزيرفيشن.' },
            { en: 'I have a reservation for tonight.', ar: 'عندي حجز الليلة.', translit: 'اي هاف ا ريزيرفيشن فور تونايت.' },
            { en: 'My reservation is under Firas.', ar: 'حجزي باسم فراس.', translit: 'ماي ريزيرفيشن از اندر فراس.' },
          ],
        },
        { en: 'check in', ar: 'تسجيل دخول', translit: 'تشيك ان', pos: 'phrase', ipa: '/tʃɛk ɪn/',
          example: { en: 'I would like to check in.', ar: 'ابغى اسجل دخول.', translit: 'اي وود لايك تو تشيك ان.' },
          usage: { en: 'Used when you arrive to get your room.', ar: 'تقولها اول ما توصل عشان تستلم غرفتك.' },
          sentences: [
            { en: 'I would like to check in.', ar: 'ابغى اسجل دخول.', translit: 'اي وود لايك تو تشيك ان.' },
            { en: 'Can I check in now?', ar: 'اقدر اسجل دخول الحين؟', translit: 'كان اي تشيك ان ناو؟' },
            { en: 'Check in is at two.', ar: 'التسجيل الساعة اثنين.', translit: 'تشيك ان ايز ات تو.' },
          ],
        },
        { en: 'room key', ar: 'مفتاح الغرفة', translit: 'روم كي', pos: 'phrase', ipa: '/ruːm kiː/',
          example: { en: 'Where is my room key?', ar: 'وين مفتاح غرفتي؟', translit: 'وير از ماي روم كي؟' },
          usage: { en: 'Ask for the card that opens your room.', ar: 'اطلب الكرت اللي يفتح غرفتك.' },
          sentences: [
            { en: 'Where is my room key?', ar: 'وين مفتاح غرفتي؟', translit: 'وير از ماي روم كي؟' },
            { en: 'I lost my room key.', ar: 'ضيعت مفتاح غرفتي.', translit: 'اي لوست ماي روم كي.' },
            { en: 'Can I have a new room key?', ar: 'تعطيني مفتاح جديد؟', translit: 'كان اي هاف ا نيو روم كي؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Good evening. I have a reservation.', ar: 'مسا الخير. عندي حجز.', translit: 'غود ايفنينق. اي هاف ا ريزيرفيشن.' },
        { who: 'B', en: 'Welcome. What is your name?', ar: 'اهلاً. وش اسمك؟', translit: 'ويلكم. وات ايز يور نيم؟' },
        { who: 'A', en: 'Firas. For two nights.', ar: 'فراس. ليلتين.', translit: 'فراس. فور تو نايتس.' },
        { who: 'B', en: 'Here is your room key. Enjoy your stay.', ar: 'هذا مفتاح غرفتك. نورت.', translit: 'هير از يور روم كي. انجوي يور ستاي.' },
      ],
    },
    'at-the-pharmacy': {
      title: { en: 'At the Pharmacy', ar: 'في الصيدلية' },
      items: [
        { en: 'headache', ar: 'صداع', translit: 'هيدايك', pos: 'noun', ipa: '/ˈhɛdˌeɪk/',
          example: { en: 'I have a headache.', ar: 'عندي صداع.', translit: 'اي هاف ا هيدايك.' },
          usage: { en: 'A pain in your head. Tell the pharmacist your symptom.', ar: 'وجع في الراس. خبر الصيدلي باعراضك.' },
          sentences: [
            { en: 'I have a headache.', ar: 'عندي صداع.', translit: 'اي هاف ا هيدايك.' },
            { en: 'I have a bad headache.', ar: 'عندي صداع قوي.', translit: 'اي هاف ا باد هيدايك.' },
            { en: 'My headache started today.', ar: 'الصداع بدا اليوم.', translit: 'ماي هيدايك ستارتد توداي.' },
          ],
        },
        { en: 'medicine', ar: 'دوا', translit: 'ميديسن', pos: 'noun', ipa: '/ˈmɛdɪsən/',
          example: { en: 'I need medicine for a cold.', ar: 'ابغى دوا للزكام.', translit: 'اي نيد ميديسن فور ا كولد.' },
          usage: { en: 'Something you take to feel better.', ar: 'شي ياخذه المريض عشان يتحسن.' },
          sentences: [
            { en: 'I need medicine.', ar: 'ابغى دوا.', translit: 'اي نيد ميديسن.' },
            { en: 'Do you have medicine for a fever?', ar: 'عندك دوا للحرارة؟', translit: 'دو يو هاف ميديسن فور ا فيفر؟' },
            { en: 'Take this medicine twice a day.', ar: 'خذ هذا الدوا مرتين باليوم.', translit: 'تيك ذس ميديسن تويس ا داي.' },
          ],
        },
        { en: 'prescription', ar: 'وصفة', translit: 'بريسكريبشن', pos: 'noun', ipa: '/prɪˈskrɪpʃən/',
          example: { en: 'I have a prescription.', ar: 'عندي وصفة.', translit: 'اي هاف ا بريسكريبشن.' },
          usage: { en: 'A paper from the doctor that lets you get medicine.', ar: 'ورقة من الطبيب تقدر تجيب منها الدوا.' },
          sentences: [
            { en: 'I have a prescription.', ar: 'عندي وصفة.', translit: 'اي هاف ا بريسكريبشن.' },
            { en: 'Here is my prescription.', ar: 'هذي وصفتي.', translit: 'هير از ماي بريسكريبشن.' },
            { en: 'Do I need a prescription?', ar: 'لازم وصفة؟', translit: 'دو اي نيد ا بريسكريبشن؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hello, I have a headache.', ar: 'هلا، عندي صداع.', translit: 'هلو، اي هاف ا هيدايك.' },
        { who: 'B', en: 'Since when?', ar: 'من وين؟', translit: 'سنس ون؟' },
        { who: 'A', en: 'Since this morning.', ar: 'من الصباح.', translit: 'سنس ذس مورنينق.' },
        { who: 'B', en: 'Take this medicine twice a day.', ar: 'خذ هذا الدوا مرتين باليوم.', translit: 'تيك ذس ميديسن تويس ا داي.' },
      ],
    },
    'at-the-bank': {
      title: { en: 'At the Bank', ar: 'في البنك' },
      items: [
        { en: 'deposit', ar: 'ايداع', translit: 'ديبوزيت', pos: 'noun', ipa: '/dɪˈpɒzɪt/',
          example: { en: 'I want to deposit money.', ar: 'ابغى اودع مبلغ.', translit: 'اي ونت تو ديبوزيت ماني.' },
          usage: { en: 'Put money into your account.', ar: 'تضيف مبلغ لحسابك.' },
          sentences: [
            { en: 'I want to deposit money.', ar: 'ابغى اودع مبلغ.', translit: 'اي ونت تو ديبوزيت ماني.' },
            { en: 'I want to deposit riyals.', ar: 'ابغى اودع ريالات.', translit: 'اي ونت تو ديبوزيت ريالز.' },
            { en: 'Can I deposit a cheque?', ar: 'اقدر اودع شيك؟', translit: 'كان اي ديبوزيت ا تشيك؟' },
          ],
        },
        { en: 'withdraw', ar: 'سحب', translit: 'ويذ درو', pos: 'verb', ipa: '/wɪθˈdrɔː/',
          example: { en: 'I want to withdraw money.', ar: 'ابغى اسحب مبلغ.', translit: 'اي ونت تو ويذ درو ماني.' },
          usage: { en: 'Take money out of your account.', ar: 'تسحب مبلغ من حسابك.' },
          sentences: [
            { en: 'I want to withdraw money.', ar: 'ابغى اسحب مبلغ.', translit: 'اي ونت تو ويذ درو ماني.' },
            { en: 'Withdraw five hundred riyals.', ar: 'اسحب خمسمية ريال.', translit: 'ويذ درو فايف هندرد ريالز.' },
            { en: 'Where can I withdraw cash?', ar: 'وين اقدر اسحب كاش؟', translit: 'وير كان اي ويذ درو كاش؟' },
          ],
        },
        { en: 'transfer', ar: 'تحويل', translit: 'ترانسفر', pos: 'verb', ipa: '/ˈtrænsfɜːr/',
          example: { en: 'I want to transfer money.', ar: 'ابغى احول مبلغ.', translit: 'اي ونت تو ترانسفر ماني.' },
          usage: { en: 'Send money to another account.', ar: 'ترسل مبلغ لحساب ثاني.' },
          sentences: [
            { en: 'I want to transfer money.', ar: 'ابغى احول مبلغ.', translit: 'اي ونت تو ترانسفر ماني.' },
            { en: 'Transfer it to this account.', ar: 'حوله لهذا الحساب.', translit: 'ترانسفر ات تو ذس اكونت.' },
            { en: 'How long does a transfer take?', ar: 'كم ياخذ التحويل؟', translit: 'هاو لونق داز ا ترانسفر تيك؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hello, I want to deposit money.', ar: 'هلا، ابغى اودع مبلغ.', translit: 'هلو، اي ونت تو ديبوزيت ماني.' },
        { who: 'B', en: 'Sure. How much?', ar: 'تمام. كم المبلغ؟', translit: 'شور. هاو ماتش؟' },
        { who: 'A', en: 'One thousand riyals.', ar: 'الف ريال.', translit: 'وان ثاوزند ريالز.' },
        { who: 'B', en: 'Please sign here. Done.', ar: 'وقّع هنا. تم.', translit: 'بليز ساين هير. دون.' },
      ],
    },
    'phone-calls': {
      title: { en: 'Phone Calls', ar: 'المكالمات' },
      items: [
        { en: 'call back', ar: 'اتصل لاحقاً', translit: 'كول باك', pos: 'phrase', ipa: '/kɔːl bæk/',
          example: { en: 'I will call you back.', ar: 'برد عليك.', translit: 'اي ويل كول يو باك.' },
          usage: { en: 'Say this when you cannot talk now.', ar: 'تقولها اذا ما تقدر ت تكلم الحين.' },
          sentences: [
            { en: 'I will call you back.', ar: 'برد عليك.', translit: 'اي ويل كول يو باك.' },
            { en: 'Can I call you back?', ar: 'اقدر ارد عليك؟', translit: 'كان اي كول يو باك؟' },
            { en: 'Please call me back later.', ar: 'رد عليّ بعدين.', translit: 'بليز كول مي باك ليتير.' },
          ],
        },
        { en: 'leave a message', ar: 'ترك رسالة', translit: 'ليف ا مسيج', pos: 'phrase', ipa: '/liːv ə ˈmɛsɪdʒ/',
          example: { en: 'Can I leave a message?', ar: 'اقدر اترك رسالة؟', translit: 'كان اي ليف ا مسيج؟' },
          usage: { en: 'Ask to leave words for someone who is busy.', ar: 'تطلب تترك كلام لشخص مشغول.' },
          sentences: [
            { en: 'Can I leave a message?', ar: 'اقدر اترك رسالة؟', translit: 'كان اي ليف ا مسيج؟' },
            { en: 'I will leave a message.', ar: 'بترك رسالة.', translit: 'اي ويل ليف ا مسيج.' },
            { en: 'Please leave a message after the beep.', ar: 'اترك رسالة بعد الصفير.', translit: 'بليز ليف ا مسيج افتر ذا بيب.' },
          ],
        },
        { en: 'the line is bad', ar: 'الاشارة ضعيفة', translit: 'ذا لاين ايز باد', pos: 'phrase', ipa: '/ðə laɪn ɪz bæd/',
          example: { en: 'Sorry, the line is bad.', ar: 'عذراً، الاشارة ضعيفة.', translit: 'سوري، ذا لاين ايز باد.' },
          usage: { en: 'Say this when you cannot hear well.', ar: 'تقولها اذا ما تسمع زين.' },
          sentences: [
            { en: 'Sorry, the line is bad.', ar: 'عذراً، الاشارة ضعيفة.', translit: 'سوري، ذا لاين ايز باد.' },
            { en: 'The line is bad, call me back.', ar: 'الاشارة ضعيفة، رد عليّ.', translit: 'ذا لاين ايز باد، كول مي باك.' },
            { en: 'Can you hear me? The line is bad.', ar: 'تسمعني؟ الاشارة ضعيفة.', translit: 'كان يو هير مي؟ ذا لاين ايز باد.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hello, is Firas there?', ar: 'هلا، فراس موجود؟', translit: 'هلو، از فراس ذير؟' },
        { who: 'B', en: 'He is busy. Can I leave a message?', ar: 'مشغول. اقدر اترك رسالة؟', translit: 'ه ايز بيزي. كان اي ليف ا مسيج؟' },
        { who: 'A', en: 'Yes, I will call back later.', ar: 'ايه، برد بعدين.', translit: 'یس، اي ويل كول باك ليتیر.' },
        { who: 'B', en: 'Sorry, the line is bad. Say that again.', ar: 'عذراً، الاشارة ضعيفة. كرر.', translit: 'سوری، ذا لاين ایز باد. سی ذات اقیین.' },
      ],
    },
    'at-the-barber': {
      title: { en: 'At the Barber', ar: 'عند الحلاق' },
      items: [
        { en: 'haircut', ar: 'قص', translit: 'هيركت', pos: 'noun', ipa: '/ˈhɛrˌkʌt/',
          example: { en: 'I need a haircut.', ar: 'ابغى قص.', translit: 'اي نيد ا هيركت.' },
          usage: { en: 'When your hair is long and you want it cut.', ar: 'اذا طال شعرك وابغى تقصه.' },
          sentences: [
            { en: 'I need a haircut.', ar: 'ابغى قص.', translit: 'اي نید ا هیرکت.' },
            { en: 'How much is a haircut?', ar: 'كم القص؟', translit: 'هاو ماتش از ا هیرکت؟' },
            { en: 'I want a short haircut.', ar: 'ابغى قص قصير.', translit: 'اي ونت ا شورت هيركت.' },
          ],
        },
        { en: 'just a trim', ar: 'تخفيف بس', translit: 'جاست ا ترم', pos: 'phrase', ipa: '/dʒʌst ə trɪm/',
          example: { en: 'Just a trim, please.', ar: 'تخفيف بس.', translit: 'جاست ا ترم، بليز.' },
          usage: { en: 'Cut only a little, not a big change.', ar: 'قص بسيط، بدون تغيير كبير.' },
          sentences: [
            { en: 'Just a trim, please.', ar: 'تخفيف بس.', translit: 'جاست ا ترم، بلیز.' },
            { en: 'I want just a trim.', ar: 'ابغى تخفيف بس.', translit: 'اي ونت جاست ا ترم.' },
            { en: 'Not too short, just a trim.', ar: 'مو قصير، تخفيف بس.', translit: 'نات تو شورت، جاست ا ترم.' },
          ],
        },
        { en: 'shorter on the sides', ar: 'قص الاطراف', translit: 'شورتر اون ذا سايدز', pos: 'phrase', ipa: '/ˈʃɔːrtər ɒn ðə saɪdz/',
          example: { en: 'Shorter on the sides, please.', ar: 'قص الاطراف.', translit: 'شورتر اون ذا سایدز، بلیز.' },
          usage: { en: 'Tell the barber where to cut more.', ar: 'قل للحلاق وين يقص اكثر.' },
          sentences: [
            { en: 'Shorter on the sides, please.', ar: 'قص الاطراف.', translit: 'شورتر اون ذا سایدز، بلیز.' },
            { en: 'Make it shorter on the sides.', ar: 'قص الاطراف اكثر.', translit: 'میک ات شورتر اون ذا سایدز.' },
            { en: 'Shorter on top, not the sides.', ar: 'قص الفوق، مو الاطراف.', translit: 'شورتر اون توب، نات ذا سایدز.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Hello, what would you like?', ar: 'هلا، وش تبي؟', translit: 'هلو، وت وود یو لایك؟' },
        { who: 'B', en: 'Just a trim, please.', ar: 'تخفیف بس.', translit: 'جاست ا ترم، بلیز.' },
        { who: 'A', en: 'Shorter on the sides too?', ar: 'نقص الاطراف بعد؟', translit: 'شورتر اون ذا سایدز تو؟' },
        { who: 'B', en: 'Yes, and short on top.', ar: 'ايه، وقص الفوق.', translit: 'یس، اند شورت اون توب.' },
      ],
    },
    'technology-and-phone': {
      title: { en: 'Phones & Internet', ar: 'الجوال والنت' },
      items: [
        { en: 'wifi', ar: 'واي فاي', translit: 'واي فاي', pos: 'noun', ipa: '/ˈwaɪ faɪ/',
          example: { en: 'What is the wifi password?', ar: 'وش رقم الواي فاي؟', translit: 'وات از ذا واي فاي باسوورد؟' },
          usage: { en: 'The wireless internet in a place.', ar: 'النت اللاسلكي في المكان.' },
          sentences: [
            { en: 'What is the wifi password?', ar: 'وش رقم الواي فاي؟', translit: 'وات از ذا واي فاي باسوورد؟' },
            { en: 'Do you have wifi?', ar: 'عندكم واي فاي؟', translit: 'دو يو هاف واي فاي؟' },
            { en: 'The wifi is not working.', ar: 'الواي فاي يعلّق.', translit: 'ذا واي فاي ايز نات ووركینق.' },
          ],
        },
        { en: 'password', ar: 'كلمة المرور', translit: 'باسوورد', pos: 'noun', ipa: '/ˈpæswɜːrd/',
          example: { en: 'I forgot my password.', ar: 'نسيت كلمة المرور.', translit: 'اي فورقوت ماي باسوورد.' },
          usage: { en: 'The secret word that unlocks your phone or account.', ar: 'الكلمة السر اللي يفتح جوالك او حسابك.' },
          sentences: [
            { en: 'I forgot my password.', ar: 'نسيت كلمة المرور.', translit: 'اي فورقوت ماي باسوورد.' },
            { en: 'What is the password?', ar: 'وش الرقم؟', translit: 'وات از ذا باسوورد؟' },
            { en: 'Reset your password here.', ar: 'اعادة ضبط الرقم هنا.', translit: 'ریست یور باسوورد هیر.' },
          ],
        },
        { en: 'charge my phone', ar: 'اشحن جوالي', translit: 'تشارج ماي فون', pos: 'phrase', ipa: '/tʃɑːrdʒ maɪ foʊn/',
          example: { en: 'I need to charge my phone.', ar: 'ابغى اشحن جوالي.', translit: 'اي نید تو تشارج ماي فون.' },
          usage: { en: 'When the battery is low and you need power.', ar: 'اذا البطارية ضعيفة وابغى كهربة.' },
          sentences: [
            { en: 'I need to charge my phone.', ar: 'ابغى اشحن جوالي.', translit: 'اي نید تو تشارج ماي فون.' },
            { en: 'Where can I charge my phone?', ar: 'وين اشحن جوالي؟', translit: 'ویر كان اي تشارج ماي فون؟' },
            { en: 'My phone needs to charge.', ar: 'جوالي يحتاج شحن.', translit: 'ماي فون نیدز تو تشارج.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Do you have wifi here?', ar: 'عندكم واي فاي؟', translit: 'دو يو هاف واي فاي هیر؟' },
        { who: 'B', en: 'Yes. What is the password?', ar: 'ايه. وش الرقم؟', translit: 'یس. وات از ذا باسوورد؟' },
        { who: 'A', en: 'I forgot my password too.', ar: 'نسيت رقمي بعد.', translit: 'اي فورقوت ماي باسوورد تو.' },
        { who: 'B', en: 'No problem. Charge my phone first.', ar: 'ولا يهمك. اشحن جوالي اول.', translit: 'نو پروبلم. تشارج ماي فون فیرست.' },
      ],
    },
    'job-interview': {
      title: { en: 'Job Interview', ar: 'مقابلة عمل' },
      items: [
        { en: 'experience', ar: 'خبرة', translit: 'اكسبيرينس', pos: 'noun', ipa: '/ɪkˈspɪriəns/',
          example: { en: 'I have two years of experience.', ar: 'عندي سنتين خبرة.', translit: 'اي هاف تو ييرز اوف اكسبيرينس.' },
          usage: { en: 'The work you have done before.', ar: 'الشغل اللي اشتغلته قبل.' },
          sentences: [
            { en: 'I have two years of experience.', ar: 'عندي سنتين خبرة.', translit: 'اي هاف تو يیرز اوف اكسبيرینس.' },
            { en: 'I have sales experience.', ar: 'عندي خبرة مبيعات.', translit: 'اي هاف سیلز اكسبيرینس.' },
            { en: 'Do you have experience?', ar: 'عندك خبرة؟', translit: 'دو يو هاف اكسبيرینس؟' },
          ],
        },
        { en: 'strengths', ar: 'نقاط قوة', translit: 'سترونقثس', pos: 'noun', ipa: '/strɛŋθs/',
          example: { en: 'What are your strengths?', ar: 'وش نقاط قوتك؟', translit: 'وات ار یور سترونقثس؟' },
          usage: { en: 'Things you do well.', ar: 'الاشيا اللي تبدع فيها.' },
          sentences: [
            { en: 'What are your strengths?', ar: 'وش نقاط قوتك؟', translit: 'وات ار یور سترونقثس؟' },
            { en: 'My strength is teamwork.', ar: 'قوتي الشغل الجماعي.', translit: 'ماي استرونقث ايز تیموورك.' },
            { en: 'I am good with people.', ar: 'تعامل مع الناس ممتاز.', translit: 'اي ام غود ویت پیبل.' },
          ],
        },
        { en: 'I am good at', ar: 'انا ممتاز في', translit: 'اي ام غود ات', pos: 'phrase', ipa: '/aɪ æm ɡʊd æt/',
          example: { en: 'I am good at English.', ar: 'ممتاز بالانجليزي.', translit: 'اي ام غود ات انقلیش.' },
          usage: { en: 'Say what skill you do well.', ar: 'قل وش المهارة اللي تبدع فيها.' },
          sentences: [
            { en: 'I am good at English.', ar: 'ممتاز بالانجليزي.', translit: 'اي ام غود ات انقلیش.' },
            { en: 'I am good at computers.', ar: 'ممتاز بالحاسب.', translit: 'اي ام غود ات كومپیوترز.' },
            { en: 'I am good at solving problems.', ar: 'ممتاز بحل المشاكل.', translit: 'اي ام غود ات سولفینق پروبلمز.' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Tell me about your experience.', ar: 'حدّثني عن خبرتك.', translit: 'تل مي اباوت یور اكسبيرینس.' },
        { who: 'B', en: 'I have two years of experience.', ar: 'عندي سنتين خبرة.', translit: 'اي هاف تو ییرز اوف اكسبيرینس.' },
        { who: 'A', en: 'What are your strengths?', ar: 'وش نقاط قوتك؟', translit: 'وات ار یور سترونقثس؟' },
        { who: 'B', en: 'I am good at teamwork and English.', ar: 'ممتاز بالشغل الجماعي والانجليزي.', translit: 'اي ام غود ات تیموورك اند انقلیش.' },
      ],
    },
    'emergency-and-help': {
      title: { en: 'Emergencies & Help', ar: 'الطواري والنجدة' },
      items: [
        { en: 'help', ar: 'نجدة', translit: 'هيلب', pos: 'phrase', ipa: '/hɛlp/',
          example: { en: 'I need help!', ar: 'ابغى مساعدة!', translit: 'اي نید هيلب!' },
          usage: { en: 'Call this when you are in danger.', ar: 'نادهيها اذا كنت بخطر.' },
          sentences: [
            { en: 'I need help!', ar: 'ابغى مساعدة!', translit: 'اي نید هیلب!' },
            { en: 'Can you help me?', ar: 'تقدر تساعدني؟', translit: 'كان يو هیلب مي؟' },
            { en: 'Help me, please.', ar: 'ساعدني، من فضلك.', translit: 'هیلب مي، بلیز.' },
          ],
        },
        { en: 'call an ambulance', ar: 'اتصل بالاسعاف', translit: 'كول ان امبولانس', pos: 'phrase', ipa: '/kɔːl ən ˈæmbjələns/',
          example: { en: 'Call an ambulance!', ar: 'اتصل بالاسعاف!', translit: 'كول ان امبولانس!' },
          usage: { en: 'When someone is badly hurt or sick.', ar: 'اذا في احد متوعك او مصاب.' },
          sentences: [
            { en: 'Call an ambulance!', ar: 'اتصل بالاسعاف!', translit: 'كول ان امبولانس!' },
            { en: 'We need an ambulance.', ar: 'محتاجين اسعاف.', translit: 'وي نید ان امبولانس.' },
            { en: 'Please call an ambulance now.', ar: 'اتصل بالاسعاف الحين.', translit: 'بلیز كول ان امبولانس ناو.' },
          ],
        },
        { en: 'where is the nearest', ar: 'وين اقرب', translit: 'وير از ذا نيرست', pos: 'phrase', ipa: '/wɛər ɪz ðə ˈnɪrəst/',
          example: { en: 'Where is the nearest hospital?', ar: 'وين اقرب مستشفى؟', translit: 'وير از ذا نیرست هاسبیتل؟' },
          usage: { en: 'Ask for the closest place you need.', ar: 'اسال عن اقرب مكان تبيه.' },
          sentences: [
            { en: 'Where is the nearest hospital?', ar: 'وين اقرب مستشفى؟', translit: 'ویر از ذا نیرست هاسپیطل؟' },
            { en: 'Where is the nearest pharmacy?', ar: 'وين اقرب صيدلية؟', translit: 'ویر از ذا نیرست فارماسی؟' },
            { en: 'Where is the nearest exit?', ar: 'وين اقرب مخرج؟', translit: 'ویر از ذا نیرست اكزیت؟' },
          ],
        },
      ],
      dialogue: [
        { who: 'A', en: 'Are you okay? You need help?', ar: 'انت بخير؟ تبغى مساعدة؟', translit: 'ار يو اوكاي؟ يو نید هیلب؟' },
        { who: 'B', en: 'Call an ambulance, please!', ar: 'اتصل بالاسعاف!', translit: 'كول ان امبولانس، بلیز!' },
        { who: 'A', en: 'Where is the nearest hospital?', ar: 'وين اقرب مستشفى؟', translit: 'ویر از ذا نیرست هاسبیطل؟' },
        { who: 'B', en: 'Two streets away. I will call now.', ar: 'شارعين بعيد. باتصل الحين.', translit: 'تو ستریټس اواي. اي ویل كول ناو.' },
      ],
    },
  };

  /* Beginner curriculum phases - read-only path metadata (no local progress).
     The path view / Supabase can mirror these to order lessons into a real progression. */
  const PEL_BEGINNER_PHASES = [
    { id:'phase-1', title:{en:'First Words', ar:'اول الكلمات'}, lessons:['greetings-goodbye','introducing-yourself','numbers-1-10','colors','days-and-months'] },
    { id:'phase-2', title:{en:'People & Family', ar:'الناس والعايلة'}, lessons:['family-members','feelings-and-emotions','subject-pronouns','be-verb','this-and-that'] },
    { id:'phase-3', title:{en:'Everyday Words', ar:'كلمات يومية'}, lessons:['food-and-drinks','classroom-words','body-parts','clothes','home-and-rooms'] },
    { id:'phase-4', title:{en:'Out & About', ar:'بره ولاسواق'}, lessons:['asking-directions','places-in-town','transport','shopping-and-money','telling-time'] },
    { id:'phase-5', title:{en:'Actions & Routine', ar:'افعال وروتين'}, lessons:['common-verbs','singular-plural','a-an-the','daily-routine','weather-words'] },
    { id:'phase-6', title:{en:'Hobbies & Talks', ar:'هوايات واحاديث'}, lessons:['hobbies-likes','doctor-appointment'] },
    { id:'phase-7', title:{en:'Daily Life & the South', ar:'حياتك والجنوب'}, lessons:['at-the-restaurant','at-the-airport','at-the-market','weather-and-seasons','southern-saudi-phrases','work-and-jobs'] },
    { id:'phase-8', title:{en:'Real-Life Situations', ar:'مواقف الحياة'}, lessons:['at-the-hotel','at-the-pharmacy','at-the-bank','phone-calls','at-the-barber','technology-and-phone','job-interview','emergency-and-help'] },
  ];

  /* Generic starter set used when a lesson has no vocab at all. */
  const PEL_STARTER_ITEMS = [
    {
      en: 'thank you', ar: 'شكراً', translit: 'ثانك يو', pos: 'phrase',
      example: { en: 'Thank you for your help.', ar: 'شكراً على مساعدتك.', translit: 'ثانك يو فور يور هيلب.' },
      usage: { en: 'Polite way to show gratitude.', ar: 'طريقة مهذبة تشكر فيها.' },
      sentences: [
        { en: 'Thank you.', ar: 'شكراً.', translit: 'ثانك يو.' },
        { en: 'Thank you very much.', ar: 'شكراً جزيلاً.', translit: 'ثانك يو فري موتش.' },
        { en: 'Are you saying thank you?', ar: 'تقول شكراً؟', translit: 'ار يو سيينق ثانك يو؟' },
      ],
    },
    {
      en: 'please', ar: 'من فضلك', translit: 'بليز', pos: 'phrase',
      example: { en: 'Please, can you help me?', ar: 'من فضلك، تقدر تساعدني؟', translit: 'بليز، كان يو هيلب مي؟' },
      usage: { en: 'Makes a request polite.', ar: 'تخلي الطلب مهذب.' },
      sentences: [
        { en: 'Please help me.', ar: 'ساعدني من فضلك.', translit: 'بليز هيلب مي.' },
        { en: 'Can you help me, please?', ar: 'تقدر تساعدني، من فضلك؟', translit: 'كان يو هيلب مي، بليز؟' },
      ],
    },
  ];

  /* ---- 2. CSS ---- */
  const STYLE = `
#pelLessonStage{position:fixed;inset:0;z-index:5200;display:none;background:var(--bg);color:var(--text);overflow:hidden;}
#pelLessonStage.open{display:flex;flex-direction:column;animation:pelStageIn .4s var(--ease);}
@keyframes pelStageIn{from{opacity:0;}to{opacity:1;}}
body.pel-lesson-mode .sidebar,body.pel-lesson-mode .topbar,body.pel-lesson-mode .context-panel{opacity:0;pointer-events:none;}
.pel-stage-top{display:flex;align-items:center;gap:14px;padding:16px 22px;border-bottom:1px solid var(--border);background:rgba(23,23,27,.92);backdrop-filter:blur(8px);flex-shrink:0;}
.pel-stage-back{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:.85rem;padding:6px 8px;border-radius:9px;transition:background .2s,color .2s;}
.pel-stage-back:hover{background:var(--card-elevated);color:var(--text);}
.pel-stage-crumb{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.pel-stage-crumb .e{font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;}
.pel-stage-crumb .t{font-size:.98rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pel-stage-count{font-size:.78rem;color:var(--text-muted);flex-shrink:0;font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:embed;}
.pel-stage-progress{height:4px;background:var(--border);flex-shrink:0;overflow:hidden;}
.pel-stage-progress > span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--gold-soft));transition:width .5s var(--ease);}
.pel-stage-body{flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:30px 20px 40px;}
.pel-activity-card{width:100%;max-width:680px;position:relative;margin:auto 0;}
.pel-act-head{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
.pel-act-type{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gold);background:rgba(200,169,106,.12);border:1px solid rgba(200,169,106,.25);padding:4px 10px;border-radius:999px;}
.pel-act-prompt{font-size:1.02rem;color:var(--text-secondary);margin-inline-start:auto;}
.pel-act-card-inner{background:var(--card);border:1px solid var(--border);border-radius:22px;padding:34px 34px 30px;box-shadow:var(--shadow-soft);}
.pel-act-en{font-size:2.1rem;font-weight:700;line-height:1.2;letter-spacing:-.01em;direction:ltr;}
.pel-act-translit{font-size:1.15rem;color:var(--gold-soft);margin-top:8px;font-weight:500;direction:rtl;text-align:start;}
/* Teaching panel - shown before every practice activity */
.pel-teach{padding:4px 0;}
.pel-teach-title{font-size:.95rem;color:var(--text-secondary);margin-bottom:14px;}
.pel-teach-section{font-size:.78rem;color:var(--text-muted);margin:16px 0 8px;text-transform:uppercase;letter-spacing:.04em;font-weight:600;}
.pel-teach-vocab{display:flex;flex-direction:column;gap:8px;}
.pel-teach-word{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:10px 14px;background:var(--card-elevated);border-radius:12px;border:1px solid var(--border);}
.pel-teach-en{font-size:1rem;font-weight:600;direction:ltr;}
.pel-teach-tr{font-size:.85rem;color:var(--gold-soft);direction:ltr;}
.pel-teach-ar{font-size:.95rem;direction:rtl;}
.pel-teach-grammar{font-size:.9rem;line-height:1.7;padding:12px 14px;background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.2);border-radius:12px;margin-top:8px;}
/* Concept step cards - structured explanation instead of wall of text */
.pel-concept-steps{display:flex;flex-direction:column;gap:10px;margin-top:16px;}
.pel-concept-step{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--card-elevated);border:1px solid var(--border);border-radius:14px;transition:border-color .2s;}
.pel-concept-step:hover{border-color:rgba(200,169,106,.3);}
.pel-concept-num{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-soft));color:#171412;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:700;}
.pel-concept-step-body{flex:1;min-width:0;}
.pel-concept-step-en{font-size:.98rem;font-weight:600;line-height:1.5;direction:ltr;}
.pel-concept-step-ar{font-size:.92rem;line-height:1.7;margin-top:4px;direction:rtl;text-align:start;}
.pel-concept-play{flex-shrink:0;background:rgba(200,169,106,.1);border:1px solid rgba(200,169,106,.25);color:var(--gold);border-radius:10px;padding:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
.pel-concept-play:hover{background:rgba(200,169,106,.2);}
.pel-concept-play:active{transform:scale(.95);}
.key-term{color:var(--gold);font-weight:700;}
.pel-concept-section-label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin:18px 0 8px;display:flex;align-items:center;gap:6px;}
.pel-concept-section-label:first-child{margin-top:2px;}
.pel-concept-examples{display:flex;flex-direction:column;gap:8px;margin-top:8px;}
.pel-concept-ex{padding:12px 14px;background:rgba(200,169,106,.06);border:1px solid rgba(200,169,106,.18);border-radius:12px;}
.pel-concept-ex .ex-en{font-size:.95rem;font-weight:600;direction:ltr;}
.pel-concept-ex .ex-ar{font-size:.86rem;color:var(--text-secondary);margin-top:4px;direction:rtl;text-align:start;}
.pel-teach-countdown{font-size:.82rem;color:var(--text-muted);margin-top:12px;text-align:center;}
.pel-teach-glossary{display:flex;flex-direction:column;gap:6px;}
.pel-teach-glossary-item{display:flex;flex-direction:column;gap:2px;padding:8px 12px;background:var(--card-elevated);border-radius:10px;border:1px solid var(--border);}
.pel-teach-glossary-term{font-size:.82rem;font-weight:700;color:var(--gold-soft);direction:rtl;}
.pel-teach-glossary-def{font-size:.85rem;color:var(--text-secondary);direction:rtl;line-height:1.6;}
.pel-teach-type{font-size:.7rem;font-weight:600;color:var(--text-muted);background:rgba(255,255,255,.06);padding:2px 8px;border-radius:6px;direction:rtl;}
.pel-act-ar{font-size:1.4rem;margin-top:6px;font-weight:600;direction:rtl;text-align:start;}
.pel-act-ipa{color:var(--text-muted);font-size:.9rem;margin-top:6px;direction:ltr;}
.pel-act-example{margin-top:22px;padding-top:20px;border-top:1px solid var(--border);}
.pel-act-example .ex-en{font-size:1.1rem;direction:ltr;}
.pel-act-example .ex-tr{color:var(--text-muted);font-size:.92rem;margin-top:4px;direction:rtl;text-align:start;}
.pel-act-example .ex-ar{color:var(--text-secondary);font-size:.95rem;margin-top:3px;direction:rtl;text-align:start;}
.pel-act-hint{margin-top:16px;font-size:.82rem;color:var(--text-muted);line-height:1.6;background:var(--card-elevated);border-radius:12px;padding:12px 14px;unicode-bidi:plaintext;}
.pel-act-play{display:inline-flex;align-items:center;gap:8px;margin-top:18px;background:rgba(200,169,106,.12);border:1px solid rgba(200,169,106,.3);color:var(--gold);border-radius:12px;padding:11px 18px;font-size:.9rem;font-weight:600;cursor:pointer;transition:background .2s,transform .1s;}
.pel-act-play:hover{background:rgba(200,169,106,.2);}
.pel-act-play:active{transform:scale(.97);}
.pel-act-play.speaking{background:rgba(210,92,92,.16);border-color:rgba(210,92,92,.4);color:var(--danger);}
.pel-options{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;}
.pel-options > .pel-option:nth-child(3):last-child{grid-column:1 / -1;}
.pel-option{background:var(--card-elevated);border:1px solid var(--border);border-radius:14px;padding:16px 18px;cursor:pointer;text-align:start;font-size:1rem;color:var(--text);transition:border-color .2s,background .2s,transform .1s;display:flex;flex-direction:column;gap:3px;}
.pel-option:hover{border-color:rgba(200,169,106,.5);background:var(--card);}
.pel-option:active{transform:scale(.985);}
.pel-option.selected{border-color:var(--gold);background:rgba(200,169,106,.1);}
.pel-option.correct{border-color:var(--success);background:rgba(66,163,106,.12);}
.pel-option.wrong{border-color:var(--danger);background:rgba(210,92,92,.1);}
.pel-option .o-en{font-weight:600;direction:ltr;}
.pel-option .o-en.arabic{direction:rtl;}
.pel-option .o-ar{font-size:.84rem;color:var(--text-muted);direction:rtl;text-align:start;}
.pel-hl{color:var(--gold);font-weight:700;background:rgba(212,175,55,.12);padding:1px 3px;border-radius:4px;}
.pel-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px;}
.pel-tile{background:var(--card-elevated);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer;text-align:center;transition:all .2s;}
.pel-tile:hover{border-color:rgba(200,169,106,.5);}
.pel-tile.matched{opacity:.35;pointer-events:none;text-decoration:line-through;}
.pel-tile.sel{border-color:var(--gold);background:rgba(200,169,106,.1);}
.pel-arrange-drop{min-height:54px;border:1.5px dashed var(--border);border-radius:12px;padding:8px;display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center;}
.pel-arrange-drop:empty::before{content:attr(data-ph);color:var(--text-muted);font-size:.85rem;}
.pel-token{background:var(--card-elevated);border:1px solid var(--border);border-radius:9px;padding:8px 13px;cursor:pointer;font-size:.95rem;transition:all .15s;}
.pel-token:hover{border-color:var(--gold);}
.pel-tokens{display:flex;flex-wrap:wrap;gap:8px;}
.pel-input{width:100%;background:var(--card-elevated);border:1px solid var(--border);border-radius:12px;padding:14px 16px;color:var(--text);font-size:1.05rem;outline:none;transition:border-color .2s;}
.pel-input:focus{border-color:var(--gold);}
.pel-conv{display:flex;flex-direction:column;gap:10px;margin-top:8px;}
.pel-conv-line{padding:11px 15px;border-radius:14px;max-width:80%;font-size:.98rem;line-height:1.5;}
.pel-conv-line.A{align-self:flex-start;background:var(--card-elevated);border-bottom-inline-start-radius:4px;}
.pel-conv-line.B{align-self:flex-end;background:rgba(200,169,106,.14);border:1px solid rgba(200,169,106,.25);border-bottom-inline-end-radius:4px;}
.pel-conv-line .tr{font-size:.78rem;color:var(--text-muted);margin-top:3px;}
.pel-conv-gap{align-self:flex-end;background:transparent;border:1.5px dashed var(--border);color:var(--text-muted);min-width:140px;}
.pel-feedback{margin-top:18px;min-height:24px;font-size:.88rem;font-weight:600;display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(4px);transition:opacity .3s,transform .3s;}
.pel-feedback.show{opacity:1;transform:none;}
.pel-feedback.ok{color:var(--success);}
.pel-feedback.no{color:var(--danger);}
.pel-stage-foot{flex-shrink:0;border-top:1px solid var(--border);background:rgba(23,23,27,.92);backdrop-filter:blur(8px);padding:16px 22px;display:flex;align-items:center;gap:14px;}
.pel-act-primary{margin-inline-start:auto;background:linear-gradient(135deg,var(--gold),var(--gold-soft));color:#171412;border:none;border-radius:14px;padding:15px 30px;font-size:1rem;font-weight:700;cursor:pointer;transition:transform .12s,opacity .2s,filter .2s;box-shadow:var(--gold-glow);}
.pel-act-primary:hover{filter:brightness(1.05);}
.pel-act-primary:active{transform:scale(.97);}
.pel-act-primary:disabled{opacity:.4;cursor:not-allowed;filter:none;}
.pel-act-primary.ghost{background:transparent;color:var(--text);border:1px solid var(--border);box-shadow:none;}
.pel-stage-done{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;}
.pel-stage-done .crown{font-size:2.6rem;}
.pel-stage-done h2{font-size:1.8rem;font-weight:700;margin:6px 0 2px;}
.pel-stage-done p{color:var(--text-secondary);font-size:.98rem;max-width:420px;}
.pel-stage-done .xp{color:var(--gold);font-weight:700;font-size:1.1rem;margin-top:8px;}
.pel-stage-done .pel-done-row{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap;justify-content:center;}
.pel-done-tools{margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
.pel-tool-link{background:none;border:1px solid var(--border);border-radius:10px;padding:8px 14px;font-size:.8rem;color:var(--text-secondary);cursor:pointer;transition:all .2s ease;}
.pel-tool-link:hover{border-color:var(--gold);color:var(--gold);background:rgba(200,169,106,.06);}
.pel-card-enter{animation:pelCardIn .35s var(--ease);}
@keyframes pelCardIn{from{opacity:0;transform:translateY(14px) scale(.99);}to{opacity:1;transform:none;}}
#pelLessonStage[dir="rtl"] .pel-act-prompt{margin-inline-start:0;margin-inline-end:auto;}
.pel-reveal.show{opacity:1 !important;max-height:500px !important;}
@media(max-width:900px){
  .pel-act-card-inner{padding:28px 22px 26px;}
  .pel-stage-body{padding:26px 16px 32px;}
  .pel-conv-line{max-width:92%;}
  .pel-act-en{font-size:1.8rem;}
}
@media(max-width:680px){
  .pel-stage-top{padding:12px 14px;}
  .pel-stage-crumb .t{font-size:.9rem;}
  .pel-act-card-inner{padding:24px 18px 22px;border-radius:18px;}
  .pel-act-en{font-size:1.6rem;}
  .pel-act-ar{font-size:1.2rem;}
  .pel-options,.pel-tiles{grid-template-columns:1fr;}
  .pel-conv-line{max-width:90%;}
  .pel-stage-foot{padding:12px 14px;}
  .pel-act-primary{padding:13px 22px;}
  .pel-stage-body{padding:22px 14px 30px;}
}`;

  /* ---- 3. HELPERS ---- */
  const $ = (s, r = document) => r.querySelector(s);
  // UI language = INTERFACE language, not the language being learned.
  // An Arabic user learning English still gets Arabic UI labels.
  const ar = () => {
    try { const _ap = (typeof Deps.accountPrefs === 'function') ? Deps.accountPrefs() : null; if (_ap && _ap.lang === 'ar') return true; } catch(e){}
    return document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
  };
  const L = (en, arab) => (ar() ? `<span class="arabic">${arab}</span>` : en);
  // Lt = text-only L for use inside HTML attributes (placeholder, data-ph, etc.)
  // where <span> tags would break attribute parsing with unescaped quotes.
  const Lt = (en, arab) => (ar() ? arab : en);
  function tr(t){ return (typeof translitEn === 'function' && t) ? translitEn(t) : ''; }
  function esc(s){ return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s==null?'':s); }
  // Split a block of explanation text into digestible step sentences.
  // Used by concept activity + teaching panel to avoid wall-of-text layout.
  function splitToSteps(text){
    if(!text || !text.trim()) return [];
    var raw = text.trim();
    // Split by sentence-ending punctuation (keep it simple, no regex lookbehind)
    var parts = raw.split(/([.!?؟]+)/);
    var steps = [];
    for(var i=0;i<parts.length;i+=2){
      var s = (parts[i] + (parts[i+1]||'')).trim();
      if(s) steps.push(s);
    }
    // If only 1 step or text is short, return as-is
    if(steps.length <= 1){
      // Still try to split long single sentences by comma/semicolon
      if(raw.length > 100){
        var sub = raw.split(/[,،;]/).map(function(x){ return x.trim(); }).filter(function(x){ return x.length > 8; });
        if(sub.length > 1) return sub;
      }
      return [raw];
    }
    // If any step is still very long, split it further by comma
    var final = [];
    steps.forEach(function(s){
      if(s.length > 140){
        s.split(/[,،;]/).forEach(function(sub){
          if(sub.trim().length > 8) final.push(sub.trim());
        });
      } else {
        final.push(s);
      }
    });
    return final;
  }
  // usage can be a plain string (English) or {en, ar}. Always show the Arabic meaning too.
  function usageHtml(u){
    if(!u) return '';
    if(typeof u==='string') return `<div class="pel-act-hint">${esc(u)}</div>`;
    const en = u.en?`<div class="pel-act-hint">${esc(u.en)}</div>`:'';
    const arh = u.ar?`<div class="pel-act-hint arabic">${esc(u.ar)}</div>`:'';
    return en+arh;
  }
  // resolve a stage-id OR academy-id to an academy object (so header + next-lesson work even when callers pass a level id)
  function resolveAcademy(academyId, lessonId){
    try{
      if(typeof ACADEMIES==='undefined') return null;
      let a = (typeof resolveAcademyById==='function') ? resolveAcademyById(academyId) : ACADEMIES.find(x=>x.id===academyId); if(a) return a;
      if(lessonId && typeof academyLessonList==='function'){
        for(const ac of ACADEMIES){ try{ if(academyLessonList(ac).some(l=>l.id===lessonId)) return ac; }catch(e){} }
      }
    }catch(e){}
    return null;
  }
  function play(text, lang){ try{ if(typeof speak==='function'){ speak(text); return; } }catch(e){} try{ if('speechSynthesis' in window){ window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang=lang||'en-US'; u.rate=.85; window.speechSynthesis.speak(u);} }catch(e){} }
  function shuffle(a){ const b=a.slice(); for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; }
  // Distractor words for fill_blank: pull from lesson vocab and starter items
  // that are NOT the correct answer.
  function itemsDistractor(act, it){
    var pool = [];
    var lesson = Stage.state && Stage.state.lesson ? Stage.state.lesson : {};
    var lv = lesson.vocab || [];
    lv.forEach(function(v){ if(v && v.en && norm(v.en) !== norm(it.en)) pool.push(v.en); });
    PEL_STARTER_ITEMS.forEach(function(s){ if(s && s.en && norm(s.en) !== norm(it.en)) pool.push(s.en); });
    return pool;
  }
  function norm(s){ return String(s||'').toLowerCase().replace(/[\u2018\u2019']/g,"'").replace(/[^a-z0-9'\s]/g,'').replace(/\s+/g,' ').trim(); }
  // Unicode-aware normalization for Arabic text (and any language).
  // norm() strips Arabic chars (only keeps a-z0-9), so Arabic answers
  // normalize to '' and always match. normAny() keeps all letters/digits.
  function normAny(s){ return String(s||'').toLowerCase().replace(/[\u2018\u2019']/g,"'").replace(/[^\p{L}\p{N}'\s]/gu,'').replace(/\s+/g,' ').trim(); }
  function sayOk(){ return L('Correct','صح'); }

  /* Build a list of vocabulary/grammar terms to highlight for a given activity.
     Pulls from the lesson vocab + activity's own item/sentence + a small
     grammar-particle whitelist for basic concept lessons (yes/no/not/is/am/are...). */
  function collectTerms(act, state){
    var out=[];
    var seen={};
    function add(en,ar){ if(!en) return; var k=String(en).toLowerCase().trim(); if(!k||seen[k]) return; seen[k]=1; out.push({en:k,ar:(ar||'').trim()}); }
    // lesson vocab (if available on the seq state)
    var st = state || null;
    if(st && st.lesson){
      var lv = (st.lesson.vocab||[]).concat(st.lesson.extraVocab||[]);
      lv.forEach(function(v){ add(v.en, v.ar); });
      if(st.lesson.grammar){
        if(st.lesson.grammar.wrong) add(st.lesson.grammar.wrong, st.lesson.grammar.wrong_ar||'');
        if(st.lesson.grammar.right) add(st.lesson.grammar.right, st.lesson.grammar.right_ar||'');
      }
      if(st.lesson.dbNotes) st.lesson.dbNotes.forEach(function(n){ if(n.en) add(n.en, n.ar||''); });
    }
    if(act.item){ add(act.item.en, act.item.ar); }
    if(act.sentence){ add(act.sentence.en, act.sentence.ar); }
    if(act.pool) act.pool.forEach(function(p){ add(p.en, p.ar); });
    var W = ['yes','no','not','am','is','are','this','that','these','those','please','thank you'];
    W.forEach(function(w){ add(w,''); });
    return out;
  }

  /* Escape first, then wrap occurrences of vocabulary terms in a highlight span.
     Handles both English (latin letters) and Arabic (\u0600-\u06FF) words
     without relying on \b (which doesn't work for Arabic in JS regex). */
  function highlightImportant(html, terms){
    if(!html || !terms || !terms.length) return html;
    // Sort longest-first so multi-word phrases match before single words
    var sorted = terms.slice().sort(function(a,b){ return (b.en||'').length - (a.en||'').length; });
    var result = html;
    sorted.forEach(function(t){
      if(!t.en) return;
      var term = t.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if(!term) return;
      // English/Latin boundary
      try{
        var re = new RegExp("(^|[^A-Za-z0-9'])(" + term + ")(?=$|[^A-Za-z0-9'])", 'gi');
        result = result.replace(re, function(m, pre, word){ return pre + '<span class="key-term">' + word + '</span>'; });
      }catch(e){}
      // Arabic boundary (if the term has Arabic letters)
      if(t.ar && /[\u0600-\u06FF]/.test(t.ar)){
        var arTerm = t.ar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try{
          var arRe = new RegExp('(^|[^\u0600-\u06FF])(' + arTerm + ')(?=$|[^\u0600-\u06FF])', 'g');
          result = result.replace(arRe, function(m, pre, word){ return pre + '<span class="key-term">' + word + '</span>'; });
        }catch(e){}
      }
    });
    return result;
  }

  /* Classify a single note's text into Rule / Meaning / When-to-use buckets
     using keyword heuristics. Returns {rule:[], meaning:[], whenToUse:[]}.
     Unmatched sentences stay in 'rule' so nothing is dropped. */
  function sectionNoteText(en, ar){
    var rule=[], meaning=[], whenToUse=[];
    var enSteps = splitToSteps(en);
    var arSteps = splitToSteps(ar);
    var meaningKw = /يعني|معناها|معنى|means|meaning/i;
    var whenKw = /اذا|لو|متى|تستخدم|تستعمل|قول|رد|when|if you|use this|say this|reply/i;
    enSteps.forEach(function(s){ if(whenKw.test(s)) whenToUse.push(s); else if(meaningKw.test(s)) meaning.push(s); else rule.push(s); });
    arSteps.forEach(function(s){ if(whenKw.test(s)) whenToUse.push(s); else if(meaningKw.test(s)) meaning.push(s); else rule.push(s); });
    return {rule:rule, meaning:meaning, whenToUse:whenToUse};
  }

  /* Pull real example sentences for a concept activity from the lesson state. */
  function collectExamples(act, state){
    var out=[];
    var st = state || null;
    if(!st || !st.lesson) return out;
    var pool = [];
    if(Array.isArray(st.lesson.exampleSentences)) pool = pool.concat(st.lesson.exampleSentences);
    if(Array.isArray(st.lesson.conversation)) pool = pool.concat(st.lesson.conversation);
    if(act.item && act.item.example && act.item.example.en) pool.push(act.item.example);
    var seen={};
    pool.forEach(function(s){
      if(!s || !s.en || seen[norm(s.en)]) return;
      seen[norm(s.en)]=1;
      if(out.length < 3) out.push(s);
    });
    return out;
  }
  // Build a single, reliable, pattern-relevant error for grammar_correction.
  // Returns null when no safe transformation applies, so the activity is
  // skipped instead of asking the student to "fix" a sentence with no mistake.
  function makeWrongSentence(it){
    const base = (it && it.sentences && it.sentences[0] && it.sentences[0].en) || (it && it.example && it.example.en) || (it && it.en) || '';
    if(!base || base.split(/\s+/).length < 2) return null;
    const w = base;
    const rules = [
      [/^i am\b/i, 'I is'],
      [/^i have\b/i, 'I has'],
      [/^(he|she|it) is\b/i, (m,p)=>p+' are'],
      [/^(he|she|it) has\b/i, (m,p)=>p+' have'],
      [/^(you|we|they) are\b/i, (m,p)=>p+' is'],
      [/^do you\b/i, 'Does you'],
      [/^does (he|she|it)\b/i, (m,p)=>'Do '+p],
      [/^there is\b/i, 'There are'],
      [/^there are\b/i, 'There is'],
      [/^(he|she|it) don't\b/i, (m,p)=>p+" doesn't"],
      [/^(i|you|we|they) doesn't\b/i, (m,p)=>p+" don't"],
      [/^a ([aeiou])/i, 'An $1'],
      [/^an ([^aeiou])/i, 'A $1']
    ];
    for(const [re, rep] of rules){
      if(re.test(w)){ const out = w.replace(re, rep); if(out !== w) return out; }
    }
    return null;
  }
  function sayNo(){ return L('Try again','حاول مرة ثانية'); }

  /* ---- 4. LESSON -> ACTIVITY SEQUENCE ----
     Pulls real content from getLesson(); falls back to PEL_BEGINNER
     / PEL_STARTER when a lesson is thin. Produces ~9-13 activities
     spanning the variety the curriculum asks for. */
  function buildItems(lesson, lessonId){
    let items = (lesson && Array.isArray(lesson.vocab) && lesson.vocab.length)
      ? lesson.vocab.map(v => ({
          en: v.en, ar: v.ar, translit: v.translit || tr(v.en), pos: v.pos||'',
          ipa: v.ipa||'', example: v.example || {},
          usage: v.tip || '', sentences: (v.sentences||[]).map(s=>({en:s.en||s, ar:s.ar||'', translit:s.translit||tr(s.en||s)})),
          pron_hint_ar: v.pron_hint_ar || '', avoid_ar: v.avoid_ar || '', beats: v.beats || 0,
        }))
      : null;
    // Safety net: if the DB lesson returned vocab but it's thin (no authored
    // example sentences) and the slug has a richer PEL_BEGINNER entry, prefer the
    // authored content. Only affects PEL_BEGINNER slugs (identical data), so it
    // never overrides curated DB-only lessons - and a rich DB lesson (with
    // example.en present) is left untouched.
    if(items && items.length && !items.some(it => it.example && it.example.en) && PEL_BEGINNER[lessonId]){
      items = null;
    }
    if((!items || !items.length) && PEL_BEGINNER[lessonId]){
      const u = PEL_BEGINNER[lessonId];
      items = u.items.map(v => ({...v, sentences: (v.sentences||[]).map(s=>({en:s.en,ar:s.ar,translit:s.translit||tr(s.en)}))}));
      if(!items.length) items = null;
    }
    if(!items || !items.length){ items = PEL_STARTER_ITEMS.map(v=>({...v, sentences:(v.sentences||[]).map(s=>({en:s.en,ar:s.ar,translit:s.translit||tr(s.en)}))})); }
    // ensure example + sentences exist
    items = items.map(it => {
      const ex = it.example && it.example.en ? it.example : { en: it.en, ar: it.ar, translit: it.translit };
      // Previously this invented a broken "Do you know <word>?" sentence with
      // empty Arabic when an item had no authored sentences - that leaked
      // placeholder gibberish like "Do you know don't?". Now we reuse the
      // item's own example so the sentence-based activities fall back
      // gracefully with real content.
      const sents = (it.sentences && it.sentences.length) ? it.sentences : [ex];
      return {...it, example: ex, sentences: sents.map(s=>({en:s.en, ar:s.ar||it.ar, translit:s.translit||tr(s.en||'')}))};
    });
    return items;
  }
  function buildConversation(lesson, lessonId){
    let conv = (lesson && Array.isArray(lesson.conversation) && lesson.conversation.length) ? lesson.conversation : null;
    if(!conv && PEL_BEGINNER[lessonId]) conv = PEL_BEGINNER[lessonId].dialogue;
    if(!conv) conv = [{who:'A',en:'Hello!',ar:'هلا!',translit:'هلو!'},{who:'B',en:'Hi, how are you?',ar:'هلا، كيفك؟',translit:'هاي، هاو ار يو؟'}];
    return conv.map(c=>({who:c.who||'A', en:c.en, ar:c.ar, translit:c.translit||tr(c.en)}));
  }

  // ---- Teaching validators ----
  // Check if a sentence object is valid for teaching (not empty, enough words).
  function goodSentence(s, minWords){
    minWords = minWords || 2;
    if(!s || !s.en) return false;
    var words = String(s.en).replace(/[^\w\s']/g,'').split(/\s+/).filter(Boolean);
    return words.length >= minWords;
  }
  // Check if a sentence contains a word/phrase as whole tokens (not substrings).
  // Prevents "is" matching inside "this".
  function tokensContain(sentenceEn, wordEn){
    var sentTokens = norm(sentenceEn).split(/\s+/).filter(Boolean);
    var wordTokens = norm(wordEn).split(/\s+/).filter(Boolean);
    return wordTokens.length>0 && wordTokens.every(function(wt){ return sentTokens.indexOf(wt)!==-1; });
  }
  // Check if conversation items form a real dialogue (not standalone examples).
  // Real dialogues have questions or conversational openers.
  function isRealDialogue(conv){
    if(!conv || conv.length < 3) return false;
    return conv.some(function(c){
      if(!c.en) return false;
      var hasQuestion = c.en.indexOf('?') !== -1;
      var hasOpener = /^(how|what|where|when|who|why|do|can|are|is|would|could|will|hi|hey|hello|good\s|morning|evening)\b/i.test(c.en.trim());
      return hasQuestion || hasOpener;
    });
  }

  // ---- Pronunciation hints ----
  // Arabic speakers often break English words into wrong syllables based on
  // the Arabic translit. This map provides targeted hints for common traps.
  // Shown inside learn/pronunciation activities - not a separate module.
  //
  // ---- Minimal Pair Data ----
  // Proactive phoneme contrast drills for Arabic speakers.
  // Research: /p/-/b/, /f/-/v/, /θ/-/s/, /ð/-/z/ are the most persistent
  // pronunciation errors for Arabic L1 speakers.
  // Ref: https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers
  const PEL_MIN_PAIRS = [
    { contrast:'/p/ vs /b/', target:'pen', confusion:'ben', ar:'قلم', tipAr:'صوت P يطلع بهوا من الشفايف، B صوتها من الحلق. جرب قول بن ثم پن.' },
    { contrast:'/p/ vs /b/', target:'park', confusion:'bark', ar:'متنزه', tipAr:'P فيها هواء، B ما فيها. حط يدك على شفايفك وحس بالفرق.' },
    { contrast:'/f/ vs /v/', target:'very', confusion:'fery', ar:'جدا', tipAr:'V فيها اهتزاز بالشفة، F ما فيها. حط يدك على حنجرتك حس الاهتزاز.' },
    { contrast:'/f/ vs /v/', target:'five', confusion:'fife', ar:'خمسة', tipAr:'اخرها V خفيفة مع اهتزاز، مو F قوية.' },
    { contrast:'/θ/ vs /s/', target:'think', confusion:'sink', ar:'افكر', tipAr:'TH يطلع من بين الاسنان، S من خلف الاسنان. حط لسانك بين اسنانك.' },
    { contrast:'/θ/ vs /s/', target:'thank', confusion:'sank', ar:'شكرا', tipAr:'نفس الفكرة، اللسان يطلع برا بين الاسنان.' },
    { contrast:'/ð/ vs /z/', target:'this', confusion:'zis', ar:'هذا', tipAr:'TH الصوت الثاني (ذ) يطلع من بين الاسنان، Z من خلفها.' },
    { contrast:'/t/ vs /d/', target:'time', confusion:'dime', ar:'وقت', tipAr:'T بدون صوت، D بصوت. حط يدك على حنجرتك.' },
    { contrast:'/ch/ vs /sh/', target:'chair', confusion:'share', ar:'كرسي', tipAr:'CH قوية مثل تش، SH ناعمة مثل ش.' },
    { contrast:'/r/ vs /l/', target:'red', confusion:'led', ar:'احمر', tipAr:'R يلف اللسان، L يلمس سقف الفم.' },
  ];

  // ---- Intonation Exercise Data ----
  // Research: Arabic speakers struggle with English intonation patterns.
  // Ref: https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf
  const PEL_INTONATION_EX = [
    { sentence:'Are you coming', question:'Are you coming?', statement:'You are coming.',
      ar:'انت جاي', questionMeaning:'سؤال', statementMeaning:'جملة خبرية' },
    { sentence:'Is she here', question:'Is she here?', statement:'She is here.',
      ar:'هي هنا', questionMeaning:'سؤال', statementMeaning:'جملة خبرية' },
    { sentence:'Do you like it', question:'Do you like it?', statement:'You like it.',
      ar:'يعجبك', questionMeaning:'سؤال', statementMeaning:'جملة خبرية' },
    { sentence:'Are they ready', question:'Are they ready?', statement:'They are ready.',
      ar:'هم جاهزين', questionMeaning:'سؤال', statementMeaning:'جملة خبرية' },
  ];

  // ---- Writing Practice Prompts ----
  // Research: Arabic speakers need writing practice (RTL→LTR, punctuation).
  // Ref: https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers
  const PEL_WRITING_PROMPTS = [
    { ar:'اكتب: اسمي احمد.', en:'My name is Ahmed.', answer:'My name is Ahmed.', hint:'Start with capital letter.', keywords:['name','اسم','احمد'] },
    { ar:'اكتب: انا من السعودية.', en:'I am from Saudi Arabia.', answer:'I am from Saudi Arabia.', hint:'Capitalize country name.', keywords:['saudi','arabia','السعودية','country','بلد'] },
    { ar:'اكتب: كيف حالك؟', en:'How are you?', answer:'How are you?', hint:'Question mark in English is ?', keywords:['how are you','كيف حالك','greeting','تحية'] },
    { ar:'اكتب: شكرا جزيلا.', en:'Thank you very much.', answer:'Thank you very much.', hint:'Capitalize the first letter.', keywords:['thank','شكرا','grateful'] },
    { ar:'اكتب: انا طالب.', en:'I am a student.', answer:'I am a student.', hint:'Use a before student.', keywords:['student','طالب','school','مدرسة'] },
    { ar:'اكتب: انا ابي قهوة.', en:'I want coffee.', answer:'I want coffee.', hint:'No need for please here.', keywords:['coffee','قهوة','want','ابي','order','طلب'] },
    { ar:'اكتب: وين الحمام؟', en:'Where is the bathroom?', answer:'Where is the bathroom?', hint:'Start with Where.', keywords:['bathroom','حمام','where','وين','direction'] },
    { ar:'اكتب: كم الساعة؟', en:'What time is it?', answer:'What time is it?', hint:'Question form.', keywords:['time','ساعة','clock','time is it'] },
  ];

  // ---- Scenario-Based Role-Play Data (TBLT) ----
  // Task-Based Language Teaching: students complete real-world tasks
  // (order food, make an appointment, ask directions) with branching
  // outcomes. Multiple-choice format (not free response) so no AI grading
  // is needed — but still TBLT because there's a real-world goal and
  // consequences for each choice.
  // Research: TBLT shows d=0.93 effect on fluency vs PPP.
  // Ref: https://onlinelibrary.wiley.com/doi/10.1111/ijal.12608
  //      https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf
  const PEL_SCENARIO_TASKS = [
    {
      id:'doctor',
      goal:{ en:'Make a doctor appointment by phone', ar:'احجز موعد عند الدكتور بالتلفون' },
      contextAr:'انت تتصل بعيادة الدكتور. الموظفة ردت على الاتصال. لازم تحجز موعد.',
      turns:[
        {
          npc:'Receptionist: "Hello, doctor office. How can I help you?"',
          promptAr:'وش تقول؟',
          options:[
            { text:'I want see doctor.', ok:false, whyAr:'ناقص فعل. قل: I want to see the doctor. لازم to قبل الفعل.', outcomeAr:'الموظفة: "Sorry? Can you say that again?"' },
            { text:'I would like to make an appointment, please.', ok:true, whyAr:'ممتاز! قلت would like to + فعل + please. مهذب وواضح.', outcomeAr:'الموظفة: "Sure! What day works for you?"' },
            { text:'Doctor. Me. Now.', ok:false, whyAr:'جملة غير مفهومة. الانجليزي يحتاج فاعل + فعل. قل: I need to see the doctor.', outcomeAr:'الموظفة: "Im sorry, I didnt understand."' },
          ],
        },
        {
          npc:'Receptionist: "We have Tuesday at 10 or Thursday at 2. Which do you prefer?"',
          promptAr:'اختار موعد:',
          options:[
            { text:'Tuesday is good for me.', ok:true, whyAr:'كويس! قلت اليوم + is good for me. طريقة طبيعية لاختيار الموعد.', outcomeAr:'الموظفة: "Great, Tuesday at 10. Whats your name?"' },
            { text:'I want Tuesday not Thursday I dont like Thursday.', ok:false, whyAr:'جملة طويلة بدون نقطة. قسمها: Tuesday, please. اسهل واوضح.', outcomeAr:'الموظفة: "So... Tuesday then?"' },
            { text:'Tuesday good.', ok:false, whyAr:'ناقص فعل. قل: Tuesday is good. لازم is.', outcomeAr:'الموظفة: "Im sorry, is Tuesday okay?"' },
          ],
        },
        {
          npc:'Receptionist: "Thank you. See you Tuesday at 10."',
          promptAr:'اختتم المكالمة:',
          options:[
            { text:'Thank you. Goodbye.', ok:true, whyAr:'ممتاز! شكرت وودعت. طريقة مهذبة لانهاء المكالمة.', outcomeAr:'تم حجز الموعد. احسنت!' },
            { text:'Bye.', ok:false, whyAr:'صح بس مو مهذب. زي رد بسرعة بدون شكر. قل: Thank you, goodbye.', outcomeAr:'الموظفة: "...Goodbye."' },
            { text:'Nothing.', ok:false, whyAr:'لازم ترد. الصمت مو مهذب في الانجليزي. قل: Thank you, goodbye.', outcomeAr:'الموظفة: "Hello? Are you there?"' },
          ],
        },
      ],
    },
    {
      id:'coffee',
      goal:{ en:'Order coffee at a cafe', ar:'اطلب قهوة في كافيه' },
      contextAr:'انت في كافيه. الكاشير سألك وش تبي. لازم تطلب قهوة.',
      turns:[
        {
          npc:'Barista: "Hi! What can I get you?"',
          promptAr:'وش تقول؟',
          options:[
            { text:'I would like a coffee, please.', ok:true, whyAr:'ممتاز! would like + a + اسم + please. طلب مهذب.', outcomeAr:'الباريستا: "Sure! What size?"' },
            { text:'Coffee.', ok:false, whyAr:'كلمة وحدة بدون فعل. قل: I want a coffee, please. اوضح واكثر مهذب.', outcomeAr:'الباريستا: "Sorry, one coffee?"' },
            { text:'Give me coffee.', ok:false, whyAr:'Give me مو مهذب. زي امر. قل: I would like a coffee, please.', outcomeAr:'الباريستا: "...Okay. One coffee."' },
          ],
        },
        {
          npc:'Barista: "What size would you like? We have small, medium, and large."',
          promptAr:'اختار الحجم:',
          options:[
            { text:'A medium, please.', ok:true, whyAr:'كويس! قلت a + حجم + please. طريقة طبيعية.', outcomeAr:'الباريستا: "Medium! Coming right up."' },
            { text:'Medium one yes.', ok:false, whyAr:'ترتيب الكلمات غلط. قل: A medium, please. فاعل + فعل + مفعول.', outcomeAr:'الباريستا: "Im sorry, medium?"' },
            { text:'I want big one.', ok:false, whyAr:'big غلط هنا. قل large. وقل: A large, please.', outcomeAr:'الباريستا: "We have small, medium, and large."' },
          ],
        },
        {
          npc:'Barista: "Here is your coffee. Have a nice day!"',
          promptAr:'رد على الباريستا:',
          options:[
            { text:'Thank you! You too.', ok:true, whyAr:'ممتاز! شكرت وردت على الدعوة. طريقة مهذبة جدا.', outcomeAr:'تم استلام القهوة. احسنت!' },
            { text:'OK.', ok:false, whyAr:'OK بس مو كافي. قل: Thank you. اظهر شكرك.', outcomeAr:'الباريستا: "...Thanks."' },
            { text:'Whatever.', ok:false, whyAr:'Whatever وقحة. قل: Thank you. مهذب دائما.', outcomeAr:'الباريستا: "...Have a nice day."' },
          ],
        },
      ],
    },
    {
      id:'directions',
      goal:{ en:'Ask for directions to the nearest pharmacy', ar:'اسأل عن طريق اقرب صيدلية' },
      contextAr:'انت في الشارع. راح لشخص وسألته عن الصيدلية. لازم تعرف الوين.',
      turns:[
        {
          npc:'Stranger: "Oh, there is one on this street."',
          promptAr:'عشان تكمل، وش تسال؟',
          options:[
            { text:'Where is it exactly?', ok:true, whyAr:'ممتاز! سؤال واضح ومهذب. where is + it + exactly.', outcomeAr:'الشخص: "Its next to the supermarket."' },
            { text:'Where?', ok:false, whyAr:'Where? وحدة قصيرة. قل: Where is it? اكمل السؤال.', outcomeAr:'الشخص: "Sorry? Where what?"' },
            { text:'You tell me where.', ok:false, whyAr:'مو مهذب. كانه امر. قل: Could you tell me where it is?', outcomeAr:'الشخص: "Um, its down the street."' },
          ],
        },
        {
          npc:'Stranger: "Its just down this street, next to the supermarket."',
          promptAr:'تاكدت من الفهم. وش تقول؟',
          options:[
            { text:'Thank you. Is it far from here?', ok:true, whyAr:'ممتاز! شكرت وسألت سؤال متابع. طريقة طبيعية للمحادثة.', outcomeAr:'الشخص: "No, just two minutes walk."' },
            { text:'How far?', ok:false, whyAr:'How far? قصيرة. قل: How far is it? كمل السؤال.', outcomeAr:'الشخص: "Not far."' },
            { text:'OK whatever close or far just tell me.', ok:false, whyAr:'جملة غير مفهومة وغير مهذبة. قل: How far is it from here?', outcomeAr:'الشخص: "...Its close."' },
          ],
        },
        {
          npc:'Stranger: "Just two minutes. You cant miss it!"',
          promptAr:'اختمن المحادثة:',
          options:[
            { text:'Thank you so much!', ok:true, whyAr:'ممتاز! شكرت بحرارة. طريقة ممتازة لانهاء المحادثة.', outcomeAr:'وصلت الصيدلية. احسنت!' },
            { text:'Bye.', ok:false, whyAr:'Bye بدون شكر. قل: Thank you. اظهر شكرك دائما.', outcomeAr:'الشخص: "...Bye."' },
            { text:'Yeah ok.', ok:false, whyAr:'مو مهذب. قل: Thank you. بسيط ومهذب.', outcomeAr:'الشخص: "...Okay."' },
          ],
        },
      ],
    },
    {
      id:'airport',
      goal:{ en:'Check in at the airport', ar:'سجل دخول في المطار' },
      contextAr:'انت في المطار. راح لكاونتر الطيران. الموظف سألك عن الجواز.',
      turns:[
        {
          npc:'Agent: "Good morning! May I have your passport, please?"',
          promptAr:'وش تقول وانت تعطيه الجواز؟',
          options:[
            { text:'Here you are.', ok:true, whyAr:'ممتاز! Here you are طريقة مهذبة وطبيعية لتقديم شيء.', outcomeAr:'الموظف: "Thank you. Where are you flying today?"' },
            { text:'Take.', ok:false, whyAr:'Take امر. مو مهذب. قل: Here you are. او Here it is.', outcomeAr:'الموظف: "...Thank you."' },
            { text:'This passport yes here take it now.', ok:false, whyAr:'جملة طويلة ومشتتة. قل: Here you are. بسيط وواضح.', outcomeAr:'الموظف: "Im sorry, your passport?"' },
          ],
        },
        {
          npc:'Agent: "Are you checking any bags today?"',
          promptAr:'عندك شنطة تشيك؟',
          options:[
            { text:'Yes, I have one bag to check.', ok:true, whyAr:'كويس! جملة كاملة ومفهومة. Yes + I have + عدد + bag.', outcomeAr:'الموظف: "Great. Please put it on the scale."' },
            { text:'Yes bag one.', ok:false, whyAr:'ترتيب غلط. قل: I have one bag. فاعل + فعل + مفعول.', outcomeAr:'الموظف: "One bag?"' },
            { text:'Bag yes check.', ok:false, whyAr:'كلمات مفككة. قل: Yes, I have one bag to check.', outcomeAr:'الموظف: "Im sorry, how many bags?"' },
          ],
        },
        {
          npc:'Agent: "All set! Here is your boarding pass. Gate 12. Have a safe flight!"',
          promptAr:'اختمن التسجيل:',
          options:[
            { text:'Thank you! Have a great day.', ok:true, whyAr:'ممتاز! شكرت وردت على الدعوة. طريقة مهذبة جدا.', outcomeAr:'تم تسجيل الدخول. احسنت!' },
            { text:'OK.', ok:false, whyAr:'OK بس. قل: Thank you. اظهر شكرك.', outcomeAr:'الموظف: "...Thanks."' },
            { text:'Gate 12 yes bye.', ok:false, whyAr:'مو مهذب. قل: Thank you. بس شكر كافي.', outcomeAr:'الموظف: "...Have a safe flight."' },
          ],
        },
      ],
    },
  ];
  // Categories covered:
  //   TH sounds (voiced/voiceless) - Arabic has no TH
  //   P vs B - Arabic has no P
  //   V vs F - Arabic has no V
  //   Consonant clusters (sp/st/sk/sm/str) - Arabic adds a vowel before
  //   Silent letters (kn/wr/wh/h)
  //   Diphthongs and long vowels
  //   Multi-syllable words often broken wrong
  var PRON_HINTS = {
    // --- TH sounds (voiceless: ث, voiced: ذ) ---
    'the': { beats:1, ar:'قول كذا: ذا - خفيفة وسريعة', avoid:'مو كذا لانه غلط: ده او ذي' },
    'this': { beats:1, ar:'قول كذا: ذس', avoid:'مو كذا لانه غلط: ديس' },
    'that': { beats:1, ar:'قول كذا: ذات', avoid:'مو كذا لانه غلط: دات' },
    'these': { beats:1, ar:'قول كذا: ذيز', avoid:'مو كذا لانه غلط: ديز' },
    'those': { beats:1, ar:'قول كذا: ذوز - تبدا بـ ذ مو د', avoid:'مو كذا لانه غلط: دوز او دو-ز' },
    'there': { beats:1, ar:'قول كذا: ذير - تبدا بـ ذ مو د', avoid:'مو كذا لانه غلط: دير' },
    'their': { beats:1, ar:'قول كذا: ذير - مثل there', avoid:'مو كذا لانه غلط: دير' },
    'then': { beats:1, ar:'قول كذا: ذِن - TH هنا صوتها ذ', avoid:'مو كذا لانه غلط: دِن' },
    'with': { beats:1, ar:'قول كذا: وِذ - اخرها TH ناعمة', avoid:'مو كذا لانه غلط: وِت' },
    'three': { beats:1, ar:'قول كذا: ثري - طرف اللسان بين الاسنان', avoid:'مو كذا لانه غلط: تري او سري' },
    'think': { beats:1, ar:'قول كذا: ثِنك - TH خفيفة من بين الاسنان', avoid:'مو كذا لانه غلط: تنك او سنك' },
    'thank': { beats:1, ar:'قول كذا: ثانك - TH مو T', avoid:'مو كذا لانه غلط: تانك' },
    'thought': { beats:1, ar:'قول كذا: ثوت', avoid:'مو كذا لانه غلط: ثو-ت' },
    'through': { beats:1, ar:'قول كذا: ثرو', avoid:'مو كذا لانه غلط: ثرو-و' },

    // --- P vs B (Arabic has no P) ---
    'pen': { beats:1, ar:'قول كذا: پِن - صوت P يطلع بهوا من الشفايف', avoid:'مو كذا لانه غلط: بِن' },
    'people': { beats:2, ar:'قول كذا: پي-پل - ركز على P في البداية', avoid:'مو كذا لانه غلط: بيبل' },
    'please': { beats:1, ar:'قول كذا: پليز - P مو B', avoid:'مو كذا لانه غلط: بليز' },
    'park': { beats:1, ar:'قول كذا: پارك - P قوية بهوا', avoid:'مو كذا لانه غلط: بارك' },
    'paper': { beats:2, ar:'قول كذا: پي-پر - فيها P مرتين', avoid:'مو كذا لانه غلط: بيبر' },
    'problem': { beats:2, ar:'قول كذا: پرا-بلم - P في البداية', avoid:'مو كذا لانه غلط: بروبلم' },
    'speak': { beats:1, ar:'قول كذا: سپيك - SP مع بعض و P مو B', avoid:'مو كذا لانه غلط: اسبيك او سبيك' },

    // --- V vs F (Arabic has no V) ---
    'very': { beats:2, ar:'قول كذا: ڤي-ري - V اهتزاز خفيف في الشفة', avoid:'مو كذا لانه غلط: فيري' },
    'visit': { beats:2, ar:'قول كذا: ڤي-زت - V مو F', avoid:'مو كذا لانه غلط: فيزت' },
    'have': { beats:1, ar:'قول كذا: هاڤ - اخرها V', avoid:'مو كذا لانه غلط: هاف' },
    'five': { beats:1, ar:'قول كذا: فايف - اخرها V خفيفة', avoid:'مو كذا لانه غلط: فايف بقوة F' },
    'seven': { beats:2, ar:'قول كذا: سِ-ڤن - V في النص', avoid:'مو كذا لانه غلط: سِفن' },

    // --- Consonant clusters (Arabic adds a vowel before s-clusters) ---
    'school': { beats:1, ar:'قول كذا: سكول - ابدا بـ S مباشرة', avoid:'مو كذا لانه غلط: اسكول' },
    'student': { beats:2, ar:'قول كذا: ستو-دنت - ابدا بـ ST مباشرة', avoid:'مو كذا لانه غلط: استودنت' },
    'street': { beats:1, ar:'قول كذا: ستريت - STR مع بعض', avoid:'مو كذا لانه غلط: استريت' },
    'small': { beats:1, ar:'قول كذا: سمال - SM مع بعض', avoid:'مو كذا لانه غلط: اسمال' },

    // --- CH sound ---
    'chair': { beats:1, ar:'قول كذا: چير - CH مثل تش خفيفة', avoid:'مو كذا لانه غلط: شير' },
    'cheap': { beats:1, ar:'قول كذا: چيپ - CH ثم P', avoid:'مو كذا لانه غلط: شيب' },
    'question': { beats:2, ar:'قول كذا: كوس-چن - اخرها چن', avoid:'مو كذا لانه غلط: كويستيون' },

    // --- Diphthongs and long vowels ---
    'name': { beats:1, ar:'قول كذا: نيم - A هنا مثل اي طويلة', avoid:'مو كذا لانه غلط: نام' },
    'day': { beats:1, ar:'قول كذا: ديي - طويلة شوي', avoid:'مو كذا لانه غلط: داي قصيرة' },
    'rain': { beats:1, ar:'قول كذا: رين - AI مثل اي طويلة', avoid:'مو كذا لانه غلط: راين' },
    'phone': { beats:1, ar:'قول كذا: فون - PH تنطق F', avoid:'مو كذا لانه غلط: پون' },
    'home': { beats:1, ar:'قول كذا: هوم - O طويلة', avoid:'مو كذا لانه غلط: هُم' },
    'go': { beats:1, ar:'قول كذا: قو/گو - O طويلة', avoid:'مو كذا لانه غلط: جُو قصيرة' },
    'about': { beats:2, ar:'قول كذا: ا-باوت - لا تضغط اول حرف', avoid:'مو كذا لانه غلط: ابَوت' },
    'house': { beats:1, ar:'قول كذا: هاوس - OU مثل او', avoid:'مو كذا لانه غلط: هوس' },

    // --- R/L clusters ---
    'work': { beats:1, ar:'قول كذا: وِرك - لا تمد الواو', avoid:'مو كذا لانه غلط: وورك' },
    'world': { beats:1, ar:'قول كذا: وِرلد - اربط RLD بسرعة', avoid:'مو كذا لانه غلط: وور-لد' },
    'girl': { beats:1, ar:'قول كذا: قِرل/گِرل - R خفيفة', avoid:'مو كذا لانه غلط: جيرل ' },

    // --- Silent letters ---
    'know': { beats:1, ar:'قول كذا: نو - K ساكت', avoid:'مو كذا لانه غلط: كنو' },
    'write': { beats:1, ar:'قول كذا: رايت - W ساكت', avoid:'مو كذا لانه غلط: ورايت' },
    'listen': { beats:2, ar:'قول كذا: لِ-سن - T ساكت', avoid:'مو كذا لانه غلط: لِستن' },
    'hour': { beats:1, ar:'قول كذا: اور - H ساكت', avoid:'مو كذا لانه غلط: هاور' },
    'walked': { beats:1, ar:'قول كذا: ووكت - ED هنا صوتها T', avoid:'مو كذا لانه غلط: ووكد او ووكدِد' },

    // --- Multi-syllable common traps ---
    'tired': { beats:1, ar:'قول كذا: تايرد - قلها بسرعة بدون ما توقف بين الحروف', avoid:'مو كذا لانه غلط: تاي-رِد' },
    'water': { beats:2, ar:'قول كذا: وا-تر (الواو والتر مربوطين)', avoid:'مو كذا لانه غلط: وا-تر بسكتة بينهم' },
    'better': { beats:2, ar:'قول كذا: بي-تر', avoid:'مو كذا لانه غلط: بي-ت-تر' },
    'father': { beats:2, ar:'قول كذا: فا-ذر', avoid:'مو كذا لانه غلط: فا-ت-ه-ر' },
    'mother': { beats:2, ar:'قول كذا: ما-ذر', avoid:'مو كذا لانه غلط: ما-ت-ه-ر' },
    'brother': { beats:2, ar:'قول كذا: برا-ذر', avoid:'مو كذا لانه غلط: برا-ت-ه-ر' },
    'daughter': { beats:2, ar:'قول كذا: دو-تر', avoid:'مو كذا لانه غلط: دو-ت-ه-ر' },
    'important': { beats:3, ar:'قول كذا: ام-بور-تننت', avoid:'مو كذا لانه غلط: ام-بور-تن-ت' },
    'comfortable': { beats:3, ar:'قول كذا: كام-فتر-بل', avoid:'مو كذا لانه غلط: كوم-فور-تبل (اربع)' },
    'every': { beats:2, ar:'قول كذا: اڤ-ري', avoid:'مو كذا لانه غلط: اڤ-ري-و' },
    'different': { beats:3, ar:'قول كذا: دي-فر-نت', avoid:'مو كذا لانه غلط: دي-ف-ر-نت' },
    'interesting': { beats:3, ar:'قول كذا: ان-تر-ستنج', avoid:'مو كذا لانه غلط: ان-تر-اس-تنج' },
    'restaurant': { beats:3, ar:'قول كذا: راس-تر-نت', avoid:'مو كذا لانه غلط: راس-تو-ران-ت' },
    'would': { beats:1, ar:'قول كذا: ود', avoid:'مو كذا لانه غلط: و-ول-د' },
    'should': { beats:1, ar:'قول كذا: شود', avoid:'مو كذا لانه غلط: شو-ول-د' },
    'could': { beats:1, ar:'قول كذا: كود', avoid:'مو كذا لانه غلط: كو-ول-د' },

    // --- Additional consonant cluster traps (research-identified) ---
    'film': { beats:1, ar:'قول كذا: فيلم - FL مع بعض بدون ما تضيف حرف', avoid:'مو كذا لانه غلط: في-لم او افيلم' },
    'next': { beats:1, ar:'قول كذا: نكست - XT مع بعض', avoid:'مو كذا لانه غلط: نك-ست' },
    'clothes': { beats:1, ar:'قول كذا: كلوذز - TH و Z مع بعض', avoid:'مو كذا لانه غلط: كلو-ذيز' },
    'asked': { beats:1, ar:'قول كذا: اسكت - SKD مع بعض وسريعة', avoid:'مو كذا لانه غلط: اس-كد' },
    'text': { beats:1, ar:'قول كذا: تكست - XT مع بعض', avoid:'مو كذا لانه غلط: تك-ست' },
    'stop': { beats:1, ar:'قول كذا: ستوب - ST مع بعض', avoid:'مو كذا لانه غلط: اس-توب' },
    'stand': { beats:1, ar:'قول كذا: ستاند - ST مع بعض', avoid:'مو كذا لانه غلط: اس-تاند' },
    'story': { beats:2, ar:'قول كذا: ستو-ري - ST مع بعض', avoid:'مو كذا لانه غلط: اس-توري' },
    'price': { beats:1, ar:'قول كذا: پرايس - P مو B', avoid:'مو كذا لانه غلط: برايس' },
    'print': { beats:1, ar:'قول كذا: پرنت - P مو B', avoid:'مو كذا لانه غلط: برنت بـ B' },
    'parking': { beats:2, ar:'قول كذا: پار-كينق - P في البداية', avoid:'مو كذا لانه غلط: باركينق' },
    'happy': { beats:2, ar:'قول كذا: ها-پي - P مو B', avoid:'مو كذا لانه غلط: ها-بي' },
    'open': { beats:2, ar:'قول كذا: او-پن - P مو B', avoid:'مو كذا لانه غلط: او-بن' },
    'happen': { beats:2, ar:'قول كذا: ها-پن - P مو B', avoid:'مو كذا لانه غلط: ها-بن' },
    'apple': { beats:2, ar:'قول كذا: ا-پل - P مو B', avoid:'مو كذا لانه غلط: ا-بل' },
    'place': { beats:1, ar:'قول كذا: پليس - P مو B', avoid:'مو كذا لانه غلط: بليس' },
    'play': { beats:1, ar:'قول كذا: پلي - P مو B', avoid:'مو كذا لانه غلط: بلي' },
    'put': { beats:1, ar:'قول كذا: پُت - P مو B', avoid:'مو كذا لانه غلط: بُت' },
    'spend': { beats:1, ar:'قول كذا: سپند - SP مع بعض', avoid:'مو كذا لانه غلط: اس-بند' },
    'sport': { beats:1, ar:'قول كذا: سپورت - SP مع بعض', avoid:'مو كذا لانه غلط: اس-بورت' },
    'spring': { beats:1, ar:'قول كذا: سپرينق - SPR مع بعض', avoid:'مو كذا لانه غلط: اس-برينق' }
  };

  // Pattern-based fallback hints for words not in the exact map.
  // Only high-confidence patterns - these cover common Arabic-speaker mistakes.
  // Order matters: STR before generic S+stop so STR words get the better cue.
  var PRON_PATTERNS = [
    // str cluster (more specific - must come before generic s+stop)
    { test:/^str\w/i, hint:{ beats:1, ar:'STR مع بعض - ابدا بـ S ثم T ثم R بسرعة', avoid:'مو كذا لانه غلط: تضيف ا قبل الـ S' } },
    // s + stop clusters: Arabic speakers add ا/ا before s
    { test:/^(sp|st|sk|sm|sn)\w/i, hint:{ beats:1, ar:'ابدا بحرف S مع الحرف اللي بعده مباشرة بدون ما تضيف صوت قبلها', avoid:'مو كذا لانه غلط: تضيف ا قبل الـ S' } },
    // ph → F
    { test:/^ph/i, hint:{ beats:1, ar:'PH تنطق F - لا تستخدم P', avoid:'مو كذا لانه غلط: تنطقها پ' } },
    // kn → silent K
    { test:/^kn/i, hint:{ beats:1, ar:'K ساكت - ابدا بالنون مباشرة', avoid:'مو كذا لانه غلط: تنطق الـ K' } },
    // wr → silent W
    { test:/^wr/i, hint:{ beats:1, ar:'W ساكت - ابدا بالرا مباشرة', avoid:'مو كذا لانه غلط: تنطق الـ W' } },
    // -tion ending → شن
    { test:/tion$/i, hint:{ beats:0, ar:'اخرها -tion تنطق شن مثل question', avoid:'مو كذا لانه غلط: تيون او سيون' } }
  ];

  // pronunciationHint: check DB item fields, then exact map, then pattern fallbacks.
  function pronunciationHint(item){
    if(!item) return null;
    var en = typeof item === 'string' ? item : (item.en || '');
    // 1. DB-authored hints (future use - items may carry pron_hint_ar, avoid_ar, beats)
    if(typeof item === 'object' && item.pron_hint_ar){
      return { beats:item.beats||0, ar:item.pron_hint_ar, avoid:item.avoid_ar||'' };
    }
    // 2. Exact word match in PRON_HINTS
    var key = norm(en);
    for(var k in PRON_HINTS){ if(norm(k)===key) return PRON_HINTS[k]; }
    // 3. Pattern-based fallback (only first match, only for single words)
    var words = en.split(/\s+/).filter(Boolean);
    if(words.length === 1){
      for(var i=0; i<PRON_PATTERNS.length; i++){
        if(PRON_PATTERNS[i].test.test(en)){ return PRON_PATTERNS[i].hint; }
      }
    }
    return null;
  }

  // Repair activities with missing data before they reach the renderer.
  // Returns the (possibly modified) activity, or null to drop it.
  function repairActivity(act, lesson, items){
    if(!act) return null;
    if(act.type === 'arrange_words'){
      if(!act.sentence || !act.sentence.en || act.sentence.en.split(/\s+/).filter(Boolean).length < 2){
        // Try to find a good sentence from the first item
        var it = items && items[0];
        if(it && it.sentences){
          var s = it.sentences.find(function(x){ return x && x.en && x.en.split(/\s+/).filter(Boolean).length >= 2; });
          if(s){ act.sentence = s; }
          else return null;
        } else return null;
      }
    }
    if(act.type === 'fill_blank'){
      if(!act.item || !act.item.en) return null;
      if(!act.sentence || !act.sentence.en || !tokensContain(act.sentence.en, act.item.en)){
        var fbIt2 = act.item;
        if(fbIt2.sentences){
          var goodS = fbIt2.sentences.find(function(s3){
            return s3 && s3.en && tokensContain(s3.en, fbIt2.en);
          });
          if(goodS) act.sentence = goodS;
          else return null;
        } else if(fbIt2.example && fbIt2.example.en && tokensContain(fbIt2.example.en, fbIt2.en)){
          act.sentence = fbIt2.example;
        } else return null;
      }
    }
    if(act.type === 'db_order'){
      if(!act.ex || !act.ex.payload) return null;
      var p = act.ex.payload;
      var hasTokens = p.tokens && p.tokens.filter(Boolean).length >= 2;
      var hasAnswer = p.answer && (Array.isArray(p.answer) ? p.answer.join(' ') : p.answer).trim();
      var hasSource = p.source && p.source.trim();
      var hasPrompt = p.prompt && p.prompt.en && p.prompt.en.trim();
      if(!hasTokens && !hasAnswer && !hasSource && !hasPrompt) return null;
    }
    if(act.type === 'speaking' || act.type === 'listening_dictation'){
      if(!act.sentence || !act.sentence.en || act.sentence.en.split(/\s+/).filter(Boolean).length < 2){
        // Try to find a sentence from items
        if(items && items.length){
          for(var si = 0; si < items.length; si++){
            var sit = items[si];
            if(sit && sit.sentences){
              var goodSent = sit.sentences.find(function(s2){ return s2 && s2.en && s2.en.split(/\s+/).filter(Boolean).length >= 2; });
              if(goodSent){ act.sentence = goodSent; break; }
            }
          }
        }
        if(!act.sentence || !act.sentence.en) return null;
      }
    }
    if(act.type === 'recognize'){
      if(!act.item || !act.item.en) return null;
      if(!act.pool || act.pool.length < 2) act.pool = items || [];
    }
    if(act.type === 'challenge'){
      if(!act.items || !act.items.length) return null;
    }
    if(act.type === 'spell' || act.type === 'translate' || act.type === 'pronunciation' || act.type === 'free_response' || act.type === 'how_to_say'){
      if(!act.item || !act.item.en) return null;
    }
    if(act.type === 'match'){
      if(!act.items || act.items.length < 2) return null;
    }
    // Activities that render empty UI without throwing - must be caught here
    if(act.type === 'choose_natural_expression'){
      if(!act.quiz || !act.quiz[0] || !act.quiz[0].options || act.quiz[0].options.length < 2) return null;
      var q = act.quiz[0];
      var opts = q.options;
      var ci = (typeof q.correct === 'number') ? q.correct : opts.findIndex(function(o){ return typeof o==='object' && o && o.ok; });
      if(ci < 0 || ci >= opts.length){
        // No valid correct index - try to find an ok option
        var okIdx = opts.findIndex(function(o){ return typeof o==='object' && o && o.ok; });
        if(okIdx >= 0){
          q.correct = okIdx;
        } else {
          // No ok option and no valid correct index - set first as correct
          q.correct = 0;
        }
      }
    }
    if(act.type === 'db_spell'){
      if(!act.ex || !act.ex.payload || !act.ex.payload.answer) return null;
    }
    if(act.type === 'db_translate'){
      if(!act.ex || !act.ex.payload || !act.ex.payload.source || !act.ex.payload.answer) return null;
    }
    if(act.type === 'db_correct'){
      if(!act.ex || !act.ex.payload || !act.ex.payload.right || !act.ex.payload.wrong) return null;
    }
    if(act.type === 'complete_dialogue'){
      if(!act.conv || !act.conv.length) return null;
      var gapIdx = act.gap || 0;
      if(!act.conv[gapIdx] || !act.conv[gapIdx].en) return null;
    }
    if(act.type === 'review'){
      if(!act.items || !act.items.length) return null;
    }
    if(act.type === 'identify_heard'){
      if(!act.item || !act.item.en) return null;
      if(!act.pool || !act.pool.length) act.pool = items || [];
    }
    if(act.type === 'listen'){
      if(!act.item || !act.item.en) return null;
    }
    if(act.type === 'concept'){
      if(!act.note || (!act.note.en && !act.note.ar)) return null;
    }
    if(act.type === 'concept_examples'){
      if(!act.sentences || !act.sentences.length) return null;
      if(!act.sentences[0] || !act.sentences[0].en) return null;
    }
    if(act.type === 'learn'){
      if(!act.item || !act.item.en) return null;
    }
    if(act.type === 'learn_sentence'){
      if(!act.item || !act.item.en) return null;
      if(!act.sentence || !act.sentence.en) return null;
    }
    if(act.type === 'minimal_pairs'){
      if(!act.pair || !act.pair.target) return null;
    }
    if(act.type === 'intonation'){
      if(!act.sentence) return null;
    }
    if(act.type === 'writing_practice'){
      if(!act.prompt || !act.prompt.en) return null;
    }
    if(act.type === 'scenario_roleplay'){
      if(!act.scenario || !act.scenario.turns || !act.scenario.turns.length) return null;
    }
    if(act.type === 'mistake_coach'){
      if(!act.pattern || !act.pattern.wrong || !act.pattern.correct) return null;
    }
    if(act.type === 'conversation_response'){
      if(!act.conv || !act.conv.length || act.conv.length < 2) return null;
    }
    if(act.type === 'guided_production'){
      if(!act.item || !act.item.en) return null;
      if(!act.sentence || !act.sentence.en) return null;
    }
    if(act.type === 'grammar_correction'){
      if(!act.item || !act.item.en) return null;
      if(!act.wrong) return null;
    }
    return act;
  }

  // Module-level rotation counters for new activity types.
  // These persist across lessons so students see variety.
  var _mpRotIdx = 0, _intRotIdx = 0, _wpRotIdx = 0, _scenarioRotIdx = 0;

  function buildSequence(lesson, lessonId){
    const items = buildItems(lesson, lessonId);
    const conv = buildConversation(lesson, lessonId);
    const quiz = (lesson && Array.isArray(lesson.quiz)) ? lesson.quiz : [];
    // Authored pattern content from the DB (dbToLesson). Without this, the
    // rule explanations (explain/pattern items) and the curated practice
    // exercises (order/spell/translate/correct) are silently dropped and the
    // student only ever sees auto-generated vocab drills.
    const notes = (lesson && Array.isArray(lesson.dbNotes)) ? lesson.dbNotes : [];
    const exs = (lesson && Array.isArray(lesson.exercises)) ? lesson.exercises : [];
    const exsByType = (t) => exs.filter(e => e && e.type === t);
    const orderExs = exsByType('order');
    const spellExs = exsByType('spell');
    const trExs = exsByType('translate');
    const correctExs = exsByType('correct');
    const seq = [];
    const main = items.slice(0, 2);

    // DAILY WARM-UP: Word/Phrase of the Day woven into the lesson start so
    // daily content is discovered naturally, not via a separate section.
    // Only shows if the student has done 1+ lessons (not on first lesson).
    try{
      var _warmup = (typeof Deps.dailyWarmup === 'function') ? Deps.dailyWarmup() : [];
      var _perf0 = (typeof Deps.recentPerformance === 'function') ? Deps.recentPerformance() : null;
      if(_warmup.length && _perf0 && _perf0.lessonsDone >= 1){
        var _w = _warmup[0]; // Word of the Day
        if(_w && _w.body){
          seq.push({ type:'learn', item:{ en:_w.body, ar:_w.sub||'', translit:'', example:{}, sentences:[] }, skill:'vocabulary', adaptive:'daily' });
        }
      }
    }catch(e){}

    // 0. Concept cards - SEE IT / UNDERSTAND IT. Teach the rule before any
    //    practice. Skipped for pure-vocab lessons that have no explanation.
    notes.forEach(n => seq.push({ type:'concept', note:n, skill:'grammar' }));

    // 0a. Concept examples - show real example sentences BEFORE any practice.
    //     Unified pool: DB sentence items + vocab examples + DB exercise answers.
    //     Teaches how the concept/pattern works in real sentences.
    var exPool = [];
    if(lesson && Array.isArray(lesson.exampleSentences)) exPool = exPool.concat(lesson.exampleSentences);
    if(Array.isArray(conv)) exPool = exPool.concat(conv);
    // Add vocab example sentences to the pool
    main.forEach(function(it){ if(it.example && it.example.en && goodSentence(it.example, 3)) exPool.push(it.example); });
    // Add DB exercise target sentences to the pool (order/translate/correct)
    exs.forEach(function(e){
      if(e && e.payload){
        if(e.type === 'order' && e.payload.answer){
          var ans = Array.isArray(e.payload.answer) ? e.payload.answer.join(' ') : e.payload.answer;
          if(e.payload.prompt && e.payload.prompt.ar) exPool.push({ en: ans, ar: e.payload.prompt.ar, translit: e.payload.prompt.tr || '' });
        }
        if(e.type === 'translate' && e.payload.source) exPool.push({ en: e.payload.source, ar: (e.payload.target||''), translit: '' });
        if(e.type === 'correct' && e.payload.right) exPool.push({ en: e.payload.right, ar: (e.payload.right_ar||''), translit: '' });
      }
    });
    // Deduplicate by normalized English text and filter for real sentences
    var _seen = {};
    var conceptExamples = exPool.filter(function(s){
      if(!goodSentence(s, 3)) return false;
      var key = norm(s.en);
      if(_seen[key]) return false;
      _seen[key] = true;
      return true;
    }).slice(0, 4);
    if(conceptExamples.length){
      seq.push({ type:'concept_examples', sentences:conceptExamples, skill:'grammar' });
    }

    // 0b. Match vocab items with real context sentences.
    //     DB lessons store example sentences as separate sentence-type items.
    //     dbToLesson exposes them as lesson.exampleSentences. Prefer that pool;
    //     fall back to conversation if exampleSentences is not available.
    var exSentPool = (lesson && Array.isArray(lesson.exampleSentences) && lesson.exampleSentences.length)
      ? lesson.exampleSentences : conv;
    if(Array.isArray(exSentPool) && exSentPool.length){
      main.forEach(function(it){
        var hasReal = it.sentences && it.sentences.some(function(s){ return goodSentence(s, 2); });
        if(!hasReal){
          var matches = exSentPool.filter(function(c){ return c.en && tokensContain(c.en, it.en); });
          if(matches.length){
            it.sentences = matches.map(function(c){ return {en:c.en, ar:c.ar, translit:c.translit}; });
            it.example = matches[0];
          }
        }
      });
    }

    // 1. Learn the key teaching items (word -> sentence -> question)
    // Progressive reveal: student sees the word, tries to recall, then reveals meaning.
    // For each main item: show the word, then show it IN A REAL SENTENCE so the
    // student understands how it's used before being tested on it.
    var taughtItems = []; // track what was taught - challenge/review only test these
    main.forEach((it, i) => {
      seq.push({ type:'learn', item:it, skill:'vocabulary' });
      taughtItems.push(it);
      // Prefer sentences[1] (question form), fall back to sentences[0] if
      // it's a real multi-word sentence (not just the word itself).
      // Choose a sentence for learn_sentence that is DIFFERENT from
      // it.example (which is shown in the learn step). This prevents
      // the student from seeing the same sentence twice in a row.
      var learnSent = null;
      if(it.sentences && it.sentences.length){
        for(var si2 = 0; si2 < it.sentences.length; si2++){
          var cand = it.sentences[si2];
          if(cand && cand.en && cand.en !== it.en && cand.en.split(/\s+/).filter(Boolean).length >= 2){
            // Skip if this is the same as the example shown in learn
            if(it.example && it.example.en && norm(cand.en) === norm(it.example.en)) continue;
            learnSent = cand;
            break;
          }
        }
        // If no different sentence found, fall back to any good sentence
        if(!learnSent){
          learnSent = it.sentences.find(function(s2){ return s2 && s2.en && s2.en !== it.en && s2.en.split(/\s+/).filter(Boolean).length >= 2; }) || null;
        }
      }
      if(learnSent && i === 0) seq.push({ type:'learn_sentence', item:it, sentence:learnSent, skill:'vocabulary' });
      // "How to Say It" card — the signature PEL feature: English word + Arabic
      // transliteration + audio. Shows the student exactly how to pronounce the
      // English word using Arabic letters. No app on the market offers this for
      // Saudi learners. Only for the first item to keep lessons concise.
      if(it.translit && i === 0){
        seq.push({ type:'how_to_say', item:it, skill:'pronunciation' });
      }
    });

    // 2. Recognize (multiple choice en -> ar) - test first 2 items
    if(main.length >= 2){
      main.slice(0, 2).forEach((it) => {
        seq.push({ type:'recognize', item:it, pool:main, skill:'vocabulary' });
      });
    }

    // 3. Match pairs - only use TAUGHT items, not all items.
    //    Testing items the student hasn't been taught violates the teaching flow.
    var matchPool = taughtItems.length >= 4 ? taughtItems : (main.length >= 4 ? main : []);
    if(matchPool.length >= 4){
      seq.push({ type:'match', items:shuffle(matchPool).slice(0, Math.min(5, matchPool.length)), skill:'vocabulary' });
    }

    // 4. Build a sentence - prefer the AUTHORED order exercise (correct tokens
    //    + real target sentence) over a synthetic one built from vocab words,
    //    which produces nonsense for pattern lessons (e.g. "Do you know I?").
    if(orderExs.length){
      orderExs.forEach(e => seq.push({ type:'db_order', ex:e, skill:'grammar' }));
    } else {
      const arrangeItem = main[0];
      const arrangeTarget = (arrangeItem && arrangeItem.sentences[0]) || {en:items[0].en, ar:items[0].ar, translit:items[0].translit};
      // Only create arrange_words if the sentence has 3+ words - arranging
      // a single word is meaningless.
      if(goodSentence(arrangeTarget, 3)){
        seq.push({ type:'arrange_words', sentence:arrangeTarget, skill:'grammar' });
      }
    }

    // 5. Fill the missing word - only if the sentence has enough context
    //    and actually contains the target word. Otherwise the student sees
    //    a blank with no sentence, which is nonsensical.
    const fbItem = main[1] || main[0] || items[0];
    const fbSentence = fbItem.sentences[1]||fbItem.sentences[0]||(fbItem.example&&fbItem.example.en?fbItem.example:null);
    if(goodSentence(fbSentence, 3) && fbSentence && tokensContain(fbSentence.en, fbItem.en)){
      seq.push({ type:'fill_blank', item:fbItem, sentence:fbSentence, skill:'grammar' });
    }

    // 6. Spell the word - prefer AUTHORED spell exercise, else generic.
    if(spellExs.length){
      spellExs.forEach(e => seq.push({ type:'db_spell', ex:e, skill:'spelling' }));
    } else {
      const spellItem = main[2] || main[0] || items[0];
      seq.push({ type:'spell', item:spellItem, skill:'spelling' });
    }

    // 7. Translate - prefer AUTHORED translate exercise, else generic.
    if(trExs.length){
      trExs.forEach(e => seq.push({ type:'db_translate', ex:e, skill:'translation' }));
    } else {
      seq.push({ type:'translate', item:fbItem, skill:'translation' });
    }

    // 8. Listen + identify - use main[2]
    const listenItem = main[2] || main[0] || items[0];
    seq.push({ type:'listen', item:listenItem, skill:'listening' });
    seq.push({ type:'identify_heard', item:listenItem, pool:main, skill:'listening' });
    // Listening DICTATION: real production from audio (was: passive "you'll
    // identify next" - the student just clicked Continue). Pick the best
    // real sentence available: the item's own sentences first, then any
    // dialogue line - never a bare single word.
    const dictCand = [];
    [main[1], listenItem, main[0]].forEach(function(it2){ if(it2 && it2.sentences){ dictCand.push(it2.sentences[1], it2.sentences[0]); } });
    if(Array.isArray(conv)) conv.forEach(function(c2){ dictCand.push(c2); });
    const dictSentence = dictCand.find(function(s2){ return goodSentence(s2, 2); })
      || { en:(main[1]||listenItem).en, ar:(main[1]||listenItem).ar, translit:(main[1]||listenItem).translit };
    seq.push({ type:'listening_dictation', sentence:dictSentence, skill:'listening' });

    // 9. Pronunciation - use main[0]
    seq.push({ type:'pronunciation', item:main[0]||items[0], skill:'pronunciation' });

    // 9b. Minimal Pair Drill — proactive phoneme contrast practice.
    //     Picks a pair that matches the lesson word when possible, otherwise
    //     rotates through the set. Only if the lesson word is in the dict.
    //     Research: Arabic speakers need dedicated phoneme contrast practice.
    if(typeof PEL_MIN_PAIRS !== 'undefined' && PEL_MIN_PAIRS.length){
      // Check ALL vocab items for a minimal pairs match, not just the first one
      var _mpMatch = null;
      for(var mpi = 0; mpi < main.length && !_mpMatch; mpi++){
        var _mpWord = (main[mpi]||{}).en || '';
        _mpMatch = PEL_MIN_PAIRS.find(function(p){ return p.target.toLowerCase() === _mpWord.toLowerCase(); });
      }
      if(_mpMatch){
        seq.push({ type:'minimal_pairs', pair:_mpMatch, skill:'pronunciation' });
      }
      // No rotation fallback — only show minimal pairs when they match the lesson vocab
    }

    // 10. Speaking - use main[1]'s sentence. Skip if sentence is too short
    //    (a single word is not a sentence to speak).
    const speakItem = main[1] || main[0] || items[0];
    const speakSentence = speakItem.sentences[1]||speakItem.sentences[0]||null;
    if(goodSentence(speakSentence, 2)){
      seq.push({ type:'speaking', sentence:speakSentence, skill:'speaking' });
    }

    // 10b. Intonation Exercise — only for lessons about questions or intonation.
    //      Research: Arabic speakers struggle with English intonation.
    //      Strictly conditional — only when lesson content matches.
    if(typeof PEL_INTONATION_EX !== 'undefined' && PEL_INTONATION_EX.length){
      var _lessonTextInt = (lesson.title||'') + ' ' + (lesson.ar||'') + ' ';
      _lessonTextInt += (notes||[]).map(function(n){ return (n.en||'')+' '+(n.ar||''); }).join(' ');
      main.forEach(function(it){ _lessonTextInt += ' ' + (it.en||'') + ' ' + (it.ar||'') + ' ' + (it.translit||'') + ' ' + (it.example&&it.example.en||'') + ' ' + (it.example&&it.example.ar||''); if(it.sentences) it.sentences.forEach(function(s){ _lessonTextInt += ' '+(s.en||'')+' '+(s.ar||''); }); });
      (lesson.exercises||[]).forEach(function(e){ _lessonTextInt += ' '+(e.prompt&&e.prompt.en||'')+' '+(e.prompt&&e.prompt.ar||''); });
      (lesson.conversation||[]).forEach(function(c){ _lessonTextInt += ' '+(c.en||'')+' '+(c.ar||''); });
      // Only show intonation exercise if the lesson is about questions
      if(/question|intonation|rise|fall|interrogat|سؤال|نبرة|استفهام/.test(_lessonTextInt)){
        var _intEx = PEL_INTONATION_EX[_intRotIdx % PEL_INTONATION_EX.length];
        _intRotIdx++;
        seq.push({ type:'intonation', sentence:_intEx.sentence, question:_intEx.question,
          statement:_intEx.statement, ar:_intEx.ar, questionMeaning:_intEx.questionMeaning,
          statementMeaning:_intEx.statementMeaning, skill:'listening' });
      }
    }

    // 11. Conversation response - only if the conversation is a real dialogue
    //     (not standalone example sentences mapped with fake A/B speakers).
    if(conv.length >= 3 && isRealDialogue(conv)){
      seq.push({ type:'conversation_response', conv, idx:1, skill:'speaking' });
    }

    // 12. Complete the dialogue - same check
    if(conv.length >= 4 && isRealDialogue(conv)){
      seq.push({ type:'complete_dialogue', conv, gap:3, pool:main, skill:'grammar' });
    }

    // 12b. Scenario-Based Role-Play (TBLT) — students complete a real-world
    //      task (order food, make an appointment, ask directions) with
    //      branching outcomes. One per lesson, rotates through the set.
    //      Research: TBLT shows d=0.93 effect on fluency vs PPP.
    //      Ref: https://onlinelibrary.wiley.com/doi/10.1111/ijal.12608
    if(typeof PEL_SCENARIO_TASKS !== 'undefined' && PEL_SCENARIO_TASKS.length){
      // Try to match scenario to lesson content by checking keywords
      var _lessonText = (lesson.title||'') + ' ' + (lesson.ar||'') + ' ';
      _lessonText += (notes||[]).map(function(n){ return (n.en||'')+' '+(n.ar||''); }).join(' ');
      main.forEach(function(it){ _lessonText += ' ' + (it.en||'') + ' ' + (it.ar||'') + ' ' + (it.example&&it.example.en||'') + ' ' + (it.example&&it.example.ar||''); if(it.sentences) it.sentences.forEach(function(s){ _lessonText += ' '+(s.en||'')+' '+(s.ar||''); }); });
      (lesson.conversation||[]).forEach(function(c){ _lessonText += ' '+(c.en||'')+' '+(c.ar||''); });
      var _scenarioMatch = PEL_SCENARIO_TASKS.find(function(s){
        return s.id === 'doctor' && /doctor|appointment|عيادة|دكتور|موعد/.test(_lessonText);
      }) || PEL_SCENARIO_TASKS.find(function(s){
        return s.id === 'coffee' && /coffee|cafe|قهوة|كافيه|باريستا/.test(_lessonText);
      }) || PEL_SCENARIO_TASKS.find(function(s){
        return s.id === 'directions' && /where|direction|pharmacy|صيدلية|شارع|طريق/.test(_lessonText);
      }) || PEL_SCENARIO_TASKS.find(function(s){
        return s.id === 'airport' && /airport|flight|boarding|مطار|طيران|جواز/.test(_lessonText);
      });
      var _scenario = _scenarioMatch; // No rotation fallback — strictly topic-conditional
      if(_scenario){
        _scenarioRotIdx++;
        seq.push({ type:'scenario_roleplay', scenario:_scenario, skill:'speaking', mode:'production' });
      }
    }

    // 13. Grammar correction - prefer AUTHORED 'correct' exercise (real
    //     wrong/right pair with a why). Otherwise use a guarded generator that
    //     only introduces a real, pattern-relevant error; if it cannot make
    //     one (wrong === correct) the activity is skipped instead of asking
    //     the student to "fix" a sentence that has no mistake.
    if(correctExs.length){
      correctExs.forEach(e => seq.push({ type:'db_correct', ex:e, skill:'grammar' }));
    } else if(!quiz.length){
      const grItem = main[2] || main[0] || items[0];
      const wrong = makeWrongSentence(grItem);
      if(wrong) seq.push({ type:'grammar_correction', item:grItem, wrong, skill:'grammar' });
    }

    // 13a. Writing Practice — guided short writing exercise.
    //      Research: Arabic speakers need writing practice (RTL→LTR,
    //      punctuation, capitalization). British Council recommends
    //      "activities in which students write their own materials."
    //      Strictly conditional — only when lesson topic matches a prompt.
    if(typeof PEL_WRITING_PROMPTS !== 'undefined' && PEL_WRITING_PROMPTS.length){
      var _lessonTextWp = (lesson.title||'') + ' ' + (lesson.ar||'') + ' ';
      _lessonTextWp += (notes||[]).map(function(n){ return (n.en||'')+' '+(n.ar||''); }).join(' ');
      main.forEach(function(it){ _lessonTextWp += ' ' + (it.en||'') + ' ' + (it.ar||'') + ' ' + (it.translit||'') + ' ' + (it.example&&it.example.en||'') + ' ' + (it.example&&it.example.ar||''); if(it.sentences) it.sentences.forEach(function(s){ _lessonTextWp += ' '+(s.en||'')+' '+(s.ar||''); }); });
      (lesson.conversation||[]).forEach(function(c){ _lessonTextWp += ' '+(c.en||'')+' '+(c.ar||''); });
      var _wpMatch = PEL_WRITING_PROMPTS.find(function(p){
        return p.keywords && p.keywords.some(function(k){ return _lessonTextWp.toLowerCase().indexOf(k.toLowerCase()) !== -1; });
      });
      if(_wpMatch){
        seq.push({ type:'writing_practice', prompt:_wpMatch, skill:'writing', mode:'production' });
      }
    }

    // 13b. Choose the natural expression - one activity PER authored question
    //      (previously only quiz[0] was ever shown; the rest were ignored).
    if(quiz.length){
      quiz.forEach(q => seq.push({ type:'choose_natural_expression', quiz:[q], skill:'grammar' }));
    }

    // 13c. Saudi Mistake Coach — common Saudi learner mistakes woven into
    //      the lesson flow. Patterns are matched to the lesson's content so
    //      they're always relevant. Up to 2 per lesson, never blocking.
    try{
      var _coachData = (typeof Deps.saudiMistakeCoach === 'function') ? Deps.saudiMistakeCoach() : (window.SAUDI_MISTAKE_COACH || []);
      if(Array.isArray(_coachData) && _coachData.length){
        var _lessonText = (notes||[]).map(function(n){return (n.en||'')+' '+(n.ar||'');}).join(' ');
        main.forEach(function(it){ _lessonText += ' ' + (it.en||'') + ' ' + (it.example&&it.example.en||''); });
        exs.forEach(function(e){ if(e&&e.payload){ _lessonText += ' ' + (e.payload.right||'') + ' ' + (e.payload.wrong||'') + ' ' + (e.payload.source||''); } });
        var _coachPicked = [];
        var _coachSeen = {};
        _coachData.forEach(function(cat){
          (cat.patterns||[]).forEach(function(p){
            if(_coachPicked.length >= 2) return;
            var _key = cat.id + ':' + p.id;
            if(_coachSeen[_key]) return;
            // Match: check if any word from wrong/correct appears in lesson text
            var _wrongWords = (p.wrong||'').toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
            var _correctWords = (p.correct||'').toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
            var _allWords = _wrongWords.concat(_correctWords);
            var _matched = false;
            for(var w=0; w<_allWords.length; w++){
              if(_allWords[w].length < 3) continue; // skip short words
              if(_lessonText.toLowerCase().indexOf(_allWords[w]) !== -1){ _matched = true; break; }
            }
            // Also match by category keywords in lesson notes
            if(!_matched && cat.id === 'articles' && /\b(a|an|the)\b/i.test(_lessonText)) _matched = true;
            if(!_matched && cat.id === 'prepositions' && /\b(in|on|at)\b/i.test(_lessonText)) _matched = true;
            if(!_matched && cat.id === 'verb-agreement' && /\b(he|she|it|go|goes|work|works|is|are)\b/i.test(_lessonText)) _matched = true;
            if(!_matched && cat.id === 'negation' && /\b(not|no|dont|doesnt)\b/i.test(_lessonText)) _matched = true;
            if(!_matched && cat.id === 'word-order' && /\b(always|never|usually)\b/i.test(_lessonText)) _matched = true;
            if(!_matched && cat.id === 'confusing-words' && /\b(your|youre|its|its|to|too|then|than)\b/i.test(_lessonText)) _matched = true;
            if(_matched){
              _coachSeen[_key] = true;
              _coachPicked.push({ type:'mistake_coach', pattern:p, skill:'grammar' });
            }
          });
        });
        // If nothing matched, add 1 pattern from the first category as a general tip
        if(!_coachPicked.length && _coachData[0] && _coachData[0].patterns && _coachData[0].patterns[0]){
          _coachPicked.push({ type:'mistake_coach', pattern:_coachData[0].patterns[0], skill:'grammar' });
        }
        _coachPicked.forEach(function(c){ seq.push(c); });
      }
    }catch(e){ /* coach is optional, never block the lesson */ }

    // 13d. Guided PRODUCTION: the bridge between controlled practice and
    // free response - Arabic meaning shown, English sentence with the key
    // word blanked, student picks the word from a small bank.
    // Skip if no real sentence available (single word = no context to blank).
    const gpItem = main[1] || main[0] || items[0];
    const gpSentence = gpItem.sentences[1]||gpItem.sentences[0]||null;
    if(goodSentence(gpSentence, 3)){
      seq.push({ type:'guided_production', item:gpItem, sentence:gpSentence, skill:'writing' });
    }

    // 14. Free response
    seq.push({ type:'free_response', item:main[0]||items[0], skill:'writing' });

    // 15. Review (active recall): today's TAUGHT items PLUS any spaced-repetition
    //     items that are due from previous lessons (most overdue first).
    //     Only reviews items the student was actually taught this session.
    const reviewItems = taughtItems.slice();
    const srsDue = srsDueList(4).filter(function(x){ return !taughtItems.some(function(m2){ return norm(m2.en)===norm(x.en); }); });
    if(srsDue.length) reviewItems.push.apply(reviewItems, srsDue);
    reviewItems.sort(function(a,b){ return (b.srs?1:0)-(a.srs?1:0); });
    seq.push({ type:'review', items:reviewItems, skill:'review' });

    // 16. Challenge (quick fire) - only test items that were TAUGHT this session.
    //     Previously tested ALL items including ones the student never saw.
    seq.push({ type:'challenge', items:taughtItems.length?taughtItems:items, skill:'mastery' });

    // 17. ADAPTIVE TOOL INJECTION
    //     Tools are built into the lesson, not scattered around the app.
    //     The engine checks recent performance and injects bonus or
    //     reinforcement activities accordingly:
    //       - Excelling (avgScore >= 0.8, 2+ lessons): bonus challenge from
    //         a higher-level tool the student has unlocked but not seen yet.
    //       - Struggling (avgScore < 0.5, 2+ lessons): extra reinforcement
    //         activity before the challenge to shore up weak spots.
    //     Also introduces tools at the right level: a student who just
    //     reached A1 gets a grammar micro-activity woven in naturally.
    var _perf = (typeof Deps.recentPerformance === 'function') ? Deps.recentPerformance() : null;
    var _unlocked = [];
    try{
      var _lvl = (typeof Deps.studentLevel === 'function') ? Deps.studentLevel() : 'A0';
      if(typeof Deps.guidedToolsForLevel === 'function') _unlocked = Deps.guidedToolsForLevel(_lvl);
    }catch(e){}

    if(_perf){
      // Student is excelling: inject a BONUS activity from a tool that
      // challenges them further. Priority: speaking > writing > pronunciation.
      // These are real activities the student completes, not links.
      if(_perf.excelling && _unlocked.length){
        var _bonusItems = taughtItems.length ? taughtItems : items;
        var _bonusSent = _bonusItems[0] ? (_bonusItems[0].sentences && _bonusItems[0].sentences[0]) : null;
        if(!_bonusSent && _bonusItems[0]) _bonusSent = _bonusItems[0].example || { en: _bonusItems[0].en, ar: _bonusItems[0].ar };
        if(_unlocked.indexOf('speaking') !== -1 && _bonusSent && goodSentence(_bonusSent, 3)){
          seq.push({ type:'speaking', sentence:_bonusSent, skill:'speaking', adaptive:'bonus' });
        } else if(_unlocked.indexOf('writing') !== -1 && _bonusItems[0]){
          seq.push({ type:'free_response', item:_bonusItems[0], skill:'writing', adaptive:'bonus' });
        } else if(_unlocked.indexOf('pronunciation') !== -1 && _bonusItems[0]){
          seq.push({ type:'pronunciation', item:_bonusItems[0], skill:'pronunciation', adaptive:'bonus' });
        }
      }
      // Student is struggling: inject a REINFORCEMENT activity before the
      // challenge to give them more practice with the lesson content.
      // Extra recognition practice on items they struggled with.
      if(_perf.struggling && main.length > 1){
        // Insert a reinforcement recognize activity BEFORE the challenge
        // so the student gets more exposure before being tested.
        var _reinforceItem = main[main.length - 1]; // last item, least practiced
        seq.splice(seq.length - 1, 0, { type:'recognize', item:_reinforceItem, pool:main, skill:'vocabulary', adaptive:'reinforcement' });
      }
      // Tool introduction: if the student just reached a new level and
      // has a newly unlocked tool, weave a micro-activity into this lesson
      // so the tool is discovered naturally, not via a sidebar link.
      if(_perf.lessonsDone >= 2 && _unlocked.length){
        var _hasGrammar = seq.some(function(a){ return a.skill === 'grammar'; });
        var _hasSpeaking = seq.some(function(a){ return a.skill === 'speaking'; });
        // If grammar is unlocked but not in this lesson's sequence, add a
        // light grammar micro-practice using the lesson's own sentences
        if(!_hasGrammar && _unlocked.indexOf('grammar') !== -1 && conv && conv.length >= 3){
          var _gapConv = conv[Math.min(2, conv.length - 1)];
          if(_gapConv && _gapConv.en){
            seq.push({ type:'complete_dialogue', conv:conv, gap:3, pool:main, skill:'grammar', adaptive:'intro' });
          }
        }
        // If speaking is unlocked but not in sequence, add a speaking micro-activity
        if(!_hasSpeaking && _unlocked.indexOf('speaking') !== -1 && main[0]){
          var _speakSent = (main[0].sentences && main[0].sentences[0]) || main[0].example || { en: main[0].en, ar: main[0].ar };
          if(goodSentence(_speakSent, 3)){
            seq.push({ type:'speaking', sentence:_speakSent, skill:'speaking', adaptive:'intro' });
          }
        }
      }
    }
    // the done screen can report both skills separately (recognizing an
    // answer is not the same as producing one).
    const MODE_BY_TYPE = {
      learn:'recognition', learn_sentence:'recognition', how_to_say:'recognition', recognize:'recognition', match:'recognition',
      listen:'recognition', identify_heard:'recognition', concept:'recognition', concept_examples:'recognition',
      choose_natural_expression:'recognition', db_correct:'recognition', review:'recognition', challenge:'recognition',
      intonation:'recognition',
      arrange_words:'production', fill_blank:'production', spell:'production', translate:'production',
      pronunciation:'production', speaking:'production', conversation_response:'production',
      complete_dialogue:'production', grammar_correction:'production', free_response:'production',
      guided_production:'production', listening_dictation:'production',
      db_order:'production', db_spell:'production', db_translate:'production',
      minimal_pairs:'production', scenario_roleplay:'production', writing_practice:'production',
      mistake_coach:'production'
    };
    seq.forEach(function(a){ a.mode = MODE_BY_TYPE[a.type] || 'recognition'; });
    // Repair activities with missing data, drop any that can't be salvaged
    var _repaired = seq.map(function(a){ return repairActivity(a, lesson, items); }).filter(Boolean);
    return _repaired;
  }

  /* ---- 5. STAGE ---- */
  const Stage = {
    el:null, state:null,
    ensure(){
      if(this.el) return this.el;
      const st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
      const el = document.createElement('div'); el.id='pelLessonStage'; el.className='pel-stage'; el.innerHTML = `
        <div class="pel-stage-top">
          <button class="pel-stage-back" id="pelStgBack"><i data-lucide="arrow-left" width="16" height="16"></i> <span></span></button>
          <div class="pel-stage-crumb"><span class="e" id="pelStgEye"></span><span class="t" id="pelStgTitle"></span></div>
          <span class="pel-stage-count" id="pelStgCount"></span>
        </div>
        <div class="pel-stage-progress"><span id="pelStgBar"></span></div>
        <div class="pel-stage-body" id="pelStgBody"></div>
        <div class="pel-stage-foot" id="pelStgFoot" style="display:none;">
          <div class="pel-feedback" id="pelStgFb"></div>
          <button class="pel-act-primary" id="pelStgBtn"></button>
        </div>`;
      document.body.appendChild(el);
      this.el = el;
      $('#pelStgBack').addEventListener('click', ()=>this.close());
      $('#pelStgBack').querySelector('span').innerHTML = L('Exit','خروج');
      // Delegated listener: save session on EVERY click and input within
      // the stage body so nothing is lost - selections, typing, reveals,
      // plays. The save is throttled to one per 500ms to avoid spamming.
      var _saveTimer = null;
      var _scheduleSave = function(){
        if(_saveTimer) return;
        _saveTimer = setTimeout(function(){ _saveTimer = null; saveStageSession(); }, 500);
      };
      el.addEventListener('click', function(e){
        if(e.target.closest('.pel-stage-back')) return; // Exit button
        _scheduleSave();
      });
      el.addEventListener('input', function(){ _scheduleSave(); });
      return el;
    },
    open(academyId, lessonId){
      const academy = resolveAcademy(academyId, lessonId);
      let lesson = (typeof getLesson==='function') ? getLesson(academyId, lessonId) : null;
      // If the backend has no lesson record for this slug yet, synthesize a thin
      // lesson from the PEL_BEGINNER curriculum so the stage can still open and
      // buildSequence can fall back to the authored items + dialogue.
      if(!lesson && PEL_BEGINNER[lessonId]){
        const u = PEL_BEGINNER[lessonId];
        lesson = { title: u.title.en, ar: u.title.ar, vocab: [], conversation: [], quiz: [] };
      }
      if(!lesson){ // graceful: nothing to render
        if(typeof toast==='function') toast(L('Lesson not available yet.','الدرس غير متاح بعد.'));
        return false;
      }
      const el = this.ensure();
      this.state = {
        academyId, lessonId, academy, lesson,
        seq: buildSequence(lesson, lessonId),
        idx:0, checked:false, correct:false,
      };
      // Resume mid-lesson: if the student was here before and left without
      // finishing, jump to the saved activity index and restore full state.
      try{
        var saved = loadStagePos(academyId, lessonId);
        if(saved){
          if(typeof saved.i==='number' && saved.i>0 && saved.i<this.state.seq.length){
            this.state.idx = saved.i;
          }
          applySavedSession(saved);
        }
      }catch(e){}
      const titleEn = lesson.title || (academy?academy.en:'Lesson');
      const titleAr = lesson.ar || (academy?academy.ar:'');
      $('#pelStgEye').innerHTML = academy ? (ar() ? `${esc(academy.en)} <span class="arabic">${esc(academy.ar)}</span>` : esc(academy.en)) : L('Lesson','درس');
      $('#pelStgTitle').textContent = ar() ? (titleAr || titleEn) : (titleEn || titleAr);
      const backLbl = $('#pelStgBack').querySelector('span'); if(backLbl) backLbl.innerHTML = L('Exit','خروج');
      el.setAttribute('dir', ar()?'rtl':'ltr');
      document.body.classList.add('pel-lesson-mode');
      el.classList.add('open');
      // Keyboard shortcuts: 1-9 select options, Enter clicks primary button
      this._keyHandler = (e) => {
        var tag = e.target.tagName;
        if(tag==='INPUT'||tag==='TEXTAREA'||e.target.isContentEditable) return;
        var s = this.state; if(!s) return;
        if(e.key>='1' && e.key<='9'){
          var idx = parseInt(e.key,10)-1;
          var opts = document.querySelectorAll('.pel-option, .pel-tile');
          if(idx<opts.length && !opts[idx].disabled){ opts[idx].click(); }
          return;
        }
        if(e.key==='Enter'){
          var foot = document.querySelector('#pelStgFoot, .pel-stage-foot, .pel-act-foot');
          if(foot){ var btn = foot.querySelector('button'); if(btn && !btn.disabled) btn.click(); }
          return;
        }
      };
      document.addEventListener('keydown', this._keyHandler);
      this.render();
      if(window.lucide) lucide.createIcons();
      return true;
    },
    close(){
      if(!this.state) return;
      // Clear auto-advance timer to prevent firing on detached DOM
      if(this.state._clearDoneTimers){ try{ this.state._clearDoneTimers(); }catch(e){} }
      // Remove keyboard shortcuts
      if(this._keyHandler){ document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; }
      this.el.classList.remove('open');
      document.body.classList.remove('pel-lesson-mode');
      this.state = null;
    },
    progress(){ const s=this.state; if(!s) return 0; const p = s.idx / s.seq.length; return Math.round(p*100); },
    updateChrome(){
      const s=this.state; if(!s) return;
      const shown = Math.min(s.idx + 1, s.seq.length);
      const pct = Math.min(100, Math.round((Math.min(s.idx, s.seq.length) / s.seq.length) * 100));
      if($('#pelStgCount')) $('#pelStgCount').textContent = `${shown} / ${s.seq.length}`;
      if($('#pelStgBar')) $('#pelStgBar').style.width = pct + '%';
    },
    render(){
      const s=this.state; if(!s) return;
      this.updateChrome();
      const body = $('#pelStgBody'); const foot = $('#pelStgFoot');
      if(s.idx >= s.seq.length){ this.renderDone(); return; }
      const act = s.seq[s.idx];
      s.checked=false; s.correct=false;
      foot.style.display='flex';
      $('#pelStgFb').className='pel-feedback'; $('#pelStgFb').innerHTML='';
      const btn = $('#pelStgBtn'); btn.disabled=false; btn.className='pel-act-primary';
      const card = document.createElement('div'); card.className='pel-activity-card pel-card-enter';
      body.innerHTML=''; body.appendChild(card);
      const ctx = { card, btn, fb:$('#pelStgFb'), s, self:this };
      const label = typeLabel(act.type);
      card.innerHTML = `<div class="pel-act-head"><span class="pel-act-type">${label}</span><span class="pel-act-prompt">${promptLabel(act.type)}</span></div><div class="pel-act-card-inner" id="pelActInner"></div>`;
      const inner = $('#pelActInner');
      const renderer = RENDERERS[act.type];
      if(renderer){
        // Teaching phase: show vocabulary + grammar in Arabic BEFORE practice
        var isTeachingAct = (act.type==='concept'||act.type==='concept_examples'||act.type==='learn'||act.type==='learn_sentence');
        if(!isTeachingAct && TEACH_BEFORE[act.type] && !act._taught){
          act._taught = true;
          try{
            inner.innerHTML = buildTeachHtml(act);
          }catch(e){
            console.error('[PEL] buildTeachHtml failed for', act.type, e);
            inner.innerHTML = '<div class="pel-act-prompt">' + L('Learn first then practice','تعلم اولا ثم تمرن') + '</div>';
          }
          var teachPlay = inner.querySelector('#pelTeachPlay');
          if(teachPlay){
            var tvocab = act._teachVocab || extractActivityVocab(act);
            var twIdx = 0;
            teachPlay.onclick = function(){
              if(tvocab.length && tvocab[twIdx] && tvocab[twIdx].en){
                play(tvocab[twIdx].en, 'en-US');
                twIdx = (twIdx+1) % tvocab.length;
              }
            };
          }
          if(window.lucide) lucide.createIcons();
          this.ready(ctx, L('Start practicing','ابدا التدريب'), ()=>{
            try{
              renderer(inner, act, ctx);
            }catch(e){
              console.error('[PEL] renderer failed for', act.type, e);
              inner.innerHTML = '<div class="pel-act-prompt">' + L('We need to fix this activity','نحتاج نصلح هذا التمرين') + '</div><div class="pel-act-hint arabic">هذا التمرين ناقص بيانات، بننتقل للتمرين التالي.</div>';
              this.ready(ctx, L('Continue','متابعة'), ()=>this.next());
            }
            try{ restoreActivityDOM(); }catch(e){}
            if(window.lucide) lucide.createIcons();
          });
        } else {
          try{
            renderer(inner, act, ctx);
          }catch(e){
            console.error('[PEL] renderer failed for', act.type, e);
            inner.innerHTML = '<div class="pel-act-prompt">' + L('We need to fix this activity','نحتاج نصلح هذا التمرين') + '</div><div class="pel-act-hint arabic">هذا التمرين ناقص بيانات، بننتقل للتمرين التالي.</div>';
            this.ready(ctx, L('Continue','متابعة'), ()=>this.next());
          }
          // Restore saved interaction state after render (selections, typed text,
          // feedback) - without re-calling mark() so mastery gate stays honest.
          try{ restoreActivityDOM(); }catch(e){}
          if(window.lucide) lucide.createIcons();
        }
      } else { inner.innerHTML = `<p>${esc(label)}</p>`; this.ready(ctx, L('Continue','متابعة'), ()=>this.next()); }
    },
    ready(ctx, label, onClick, opts){
      const btn = ctx.btn;
      btn.textContent = '';
      btn.innerHTML = label; // may contain arabic span
      btn.disabled = false;
      btn.className = 'pel-act-primary' + (opts&&opts.ghost?' ghost':'');
      btn.onclick = onClick;
    },
    mark(ctx, correct){
      const s=ctx.s;
      // Guard against double-marking (e.g., mic callback + "I said it" button)
      if(s.checked && s.correct !== undefined){ return; }
      s.checked=true; s.correct=correct;
      // Recognition vs production bookkeeping (reported on the done screen).
      // Counted once per activity (retries do not double-count).
      try{
        const act = s.seq && s.seq[s.idx];
        if(act && !act.counted){
          act.counted = true;
          if(act.mode==='production'){
            s.prodTotal=(s.prodTotal||0)+1;
            if(correct){ s.prodOk=(s.prodOk||0)+1; s.prodFirstOk=(s.prodFirstOk||0)+1; act.okTracked = true; }
          } else {
            s.recTotal=(s.recTotal||0)+1;
            if(correct){ s.recOk=(s.recOk||0)+1; act.okTracked = true; }
          }
        } else if(act && act.counted && correct && !act.okTracked){
          act.okTracked = true;
          if(act.mode==='production'){ s.prodOk=(s.prodOk||0)+1; }
          else { s.recOk=(s.recOk||0)+1; }
        }
      }catch(e){}
      saveStageSession(); // persist checked/correct/stats after every mark
      // Track per-activity interaction for admin presence/360
      try{ activityTouch('activity', { activityIdx: s.idx, action: correct ? 'correct' : 'wrong' }); }catch(e){}
      const fb=ctx.fb; fb.className='pel-feedback show '+(correct?'ok':'no');
      fb.innerHTML = correct ? '✓ '+sayOk() : '× '+sayNo();
      const btn=ctx.btn; btn.disabled=false;
      this.ready(ctx, L('Continue','متابعة'), ()=>this.next());
      if(!correct){ // allow retry
        btn.className='pel-act-primary ghost';
        btn.innerHTML = L('Try again','حاول ثانية');
        btn.onclick = ()=>{ this.render(); };
      }
    },
    next(){
      const s=this.state; if(!s) return;
      if(s.idx < s.seq.length){
        s.idx++; saveStagePos(); this.render();
        // Track activity advancement for admin presence/360
        try{ activityTouch('activity', { activityIdx: s.idx, action: 'next' }); }catch(e){}
      }
    },
    renderDone(){
      const s=this.state; const body=$('#pelStgBody'); const foot=$('#pelStgFoot');
      foot.style.display='none';
      if($('#pelStgCount')) $('#pelStgCount').textContent = `${s.seq.length} / ${s.seq.length}`;
      if($('#pelStgBar')) $('#pelStgBar').style.width = '100%';
      /* ---- Mastery-gated completion (audit item 5) ----
         A lesson only counts as complete when the student actually PRODUCED
         the language on FIRST ATTEMPT, not just clicked through: with at
         least 3 production activities, >= 60% must be correct on the first
         try (prodFirstOk - retry successes deliberately do NOT count, or
         re-clicking until green would void the gate). Below the bar the
         done screen becomes a "keep practicing" screen: no XP, no
         markLessonComplete, no server progression. The student can always
         leave via Back to path, so the gate can never trap anyone. */
      const MASTERY_MIN_OK = 0.6, MASTERY_MIN_PROD = 3;
      const prodTotal = s.prodTotal||0, prodFirstOk = s.prodFirstOk||0;
      // Design decision: if a lesson has fewer than 3 production activities,
      // we do not block completion on accuracy. This is intentional because
      // some lessons naturally have fewer production activities. The done
      // screen still shows accuracy stats so students can self-assess.
      const masteryMet = prodTotal < MASTERY_MIN_PROD || (prodFirstOk / prodTotal) >= MASTERY_MIN_OK;
      if(!masteryMet){
        body.innerHTML = `<div class="pel-stage-done pel-card-enter">
          <div class="crown">↻</div>
          <h2>${L('Almost there','قربت توصل')}</h2>
          <p>${L('Answer correctly on the production exercises - first try - to complete this lesson. Review the weak spots and try again.','جاوب صح على تمارين الانتاج من اول محاولة عشان تخلص الدرس. راجع نقاط ضعفك وحاول ثانية.')}</p>
          <div class="pel-act-hint" style="margin-top:10px;">${L('Production (first try)','الانتاج (اول محاولة)')}: <b>${prodFirstOk}/${prodTotal}</b> &nbsp;·&nbsp; ${L('Needed','المطلوب')}: <b>${Math.ceil(MASTERY_MIN_OK*prodTotal)}</b></div>
          <div class="pel-done-row">
            <button class="pel-act-primary" id="pelDoneRetry">${L('Practice again','تمرن ثانية')}</button>
            <button class="pel-act-primary ghost" id="pelDoneHome">${L('Back to path','ارجع للمسار')}</button>
          </div></div>`;
        s.done=true;
        const retryBtn=$('#pelDoneRetry'); const homeBtn=$('#pelDoneHome');
        homeBtn.onclick = ()=>{ this.close(); try{ if(typeof goToView==='function') goToView('home'); }catch(e){} };
        retryBtn.onclick = ()=>{ try{ this.close(); }catch(e){} try{ Deps.openLesson(s.academyId, s.lessonId); }catch(e){} };
        if(window.lucide) lucide.createIcons();
        return;
      }
      // Guided tools on completion screen: only show tools the student has
      // unlocked at their CEFR level. Tools are contextual, not scattered.
      var _unlockedTools = [];
      try{
        var _lvl = (typeof Deps.studentLevel==='function') ? Deps.studentLevel() : 'A0';
        if(typeof Deps.guidedToolsForLevel==='function') _unlockedTools = Deps.guidedToolsForLevel(_lvl);
      }catch(e){}
      var _toolBtns = '';
      if(_unlockedTools.length){
        var _isAr = (typeof Deps.accountPrefs==='function' && Deps.accountPrefs() && Deps.accountPrefs().lang==='ar') || document.documentElement.dir==='rtl';
        _toolBtns = '<div class="pel-done-tools">' + _unlockedTools.map(function(tid){
          var r = (Deps.GUIDED_TOOL_RULES && Deps.GUIDED_TOOL_RULES[tid]) || {en:tid,ar:tid};
          return '<button class="pel-tool-link" data-tool-view="'+tid+'">'+(_isAr?escapeHtml(r.ar):escapeHtml(r.en))+'</button>';
        }).join('') + '</div>';
      }
      body.innerHTML = `<div class="pel-stage-done pel-card-enter">
        <div class="crown">✦</div>
        <h2>${L('Lesson complete','اكتمل الدرس')}</h2>
        <p>${L('You finished '+((s.lesson&&s.lesson.title)||'the lesson')+'.','خلصت درس '+((s.lesson&&s.lesson.ar)||(s.lesson&&s.lesson.title)||'الدرس')+'.')}</p>
        <div class="xp">+50 XP</div>
        ${(s.recTotal||s.prodTotal)?`<div class="pel-act-hint" style="margin-top:10px;">${L('Recognition','استرجاع')}: <b>${s.recOk||0}/${s.recTotal||0}</b> &nbsp;·&nbsp; ${L('Production','انتاج')}: <b>${s.prodOk||0}/${s.prodTotal||0}</b></div>`:''}
        <div class="pel-done-row">
          <button class="pel-act-primary" id="pelDoneNext">${L('Next lesson','الدرس الجاي')}</button>
          <button class="pel-act-primary ghost" id="pelDoneHome">${L('Back to path','ارجع للمسار')}</button>
        </div>
        ${_toolBtns}</div>`;
      // record progression (server-authoritative via existing path). The
      // stats object feeds lesson_progress analytics (Recognition vs
      // Production per student) - see complete_activity(p_stats).
      try{ if(typeof markLessonComplete==='function') s.completionPromise = markLessonComplete(s.academyId, s.lessonId, {
        recOk: s.recOk||0, recTotal: s.recTotal||0,
        prodOk: s.prodOk||0, prodTotal: s.prodTotal||0,
        prodFirstOk: s.prodFirstOk||0
      }); }catch(e){}
      clearStagePos(); // lesson complete - clear saved position so next open starts fresh
      s.done=true;
      const next = $('#pelDoneNext'); const home = $('#pelDoneHome');
      home.onclick = ()=>{ this.close(); try{ if(typeof goToView==='function') goToView('home'); }catch(e){} };
      next.onclick = async ()=>{
        // Wait for the server to record completion + return the new route,
        // so "Next lesson" follows the plan/level-guided path (nextLesson),
        // not just the next lesson in the same academy.
        try{ if(s.completionPromise && typeof s.completionPromise.then==='function'){ await s.completionPromise; } }catch(e){}
        try{
          if(typeof nextLesson==='function'){
            const routed = nextLesson();
            if(routed && !(routed.academy===s.academyId && routed.lesson===s.lessonId)){
              this.close(); Deps.openLesson(routed.academy, routed.lesson); return;
            }
          }
        }catch(e){}
        // Fallback: next unlocked lesson in the same academy.
        try{
          if(typeof academyLessonList==='function' && typeof Deps.openLesson==='function'){
            const list = academyLessonList(s.academy);
            const ci = list.findIndex(l=>l.id===s.lessonId);
            const nx = ci>=0 ? list[ci+1] : null;
            if(nx && !nx.locked){ this.close(); Deps.openLesson(s.academyId, nx.id); return; }
          }
        }catch(e){}
        this.close(); try{ if(typeof goToView==='function') goToView('home'); }catch(e){}
      };
      // Contextual tool links: dynamic buttons based on student's CEFR level.
      // Only tools the student has unlocked appear, so discovery is guided.
      body.querySelectorAll('.pel-tool-link[data-tool-view]').forEach(function(btn){
        btn.onclick = function(){ try{ if(typeof goToView==='function') goToView(btn.getAttribute('data-tool-view')); }catch(e){} };
      });
      // Auto-advance to next lesson after 5 seconds (cancel on any click or navigation)
      var _autoAdv = setTimeout(function(){ try{ next.click(); }catch(e){} }, 5000);
      var _cdTimer = null;
      // Clear timers when stage closes (prevents auto-advance on detached DOM)
      if(s._clearDoneTimers){ try{ s._clearDoneTimers(); }catch(e){} }
      s._clearDoneTimers = function(){ clearTimeout(_autoAdv); if(_cdTimer) clearInterval(_cdTimer); };
      var _doneCard = body.querySelector('.pel-stage-done');
      if(_doneCard){
        var _cd = document.createElement('div');
        _cd.className = 'pel-teach-countdown';
        var _secs = 5;
        _cd.innerHTML = L('Auto-advancing in','الانتقال التلقايي خلال') + ' <b>' + _secs + '</b> ' + L('seconds','ثانية');
        _doneCard.appendChild(_cd);
        _cdTimer = setInterval(function(){
          _secs--;
          if(_secs <= 0){ clearInterval(_cdTimer); }
          else { _cd.innerHTML = L('Auto-advancing in','الانتقال التلقايي خلال') + ' <b>' + _secs + '</b> ' + L('seconds','ثانية'); }
        }, 1000);
        _doneCard.addEventListener('click', function(){
          clearTimeout(_autoAdv); if(_cdTimer) clearInterval(_cdTimer);
          if(_cd && _cd.parentNode) _cd.remove();
        }, { once: true });
      }
      if(window.lucide) lucide.createIcons();
    },
  };

  /* ---- 5a. STAGE SESSION PERSISTENCE (full per-activity resume, v2) ----
     Saves the complete lesson session: position cursor, per-activity
     interaction state (selections, typed text, revealed/played flags),
     check/correct status, and recognition/production stats. Everything
     the student did is saved on every click so a reload restores the
     exact same state - no lost answers, no cheatable mastery gate.

     Format (v2):
     { v:2, a:academyId, l:lessonId, i:idx, ts:Date.now(),
       stats:{ recTotal,recOk,prodTotal,prodOk,prodFirstOk },
       acts:{ "<idx>": { checked,correct,selected,typed,revealed,played,
                         attempts,firstCorrect,counted,okTracked, mode } }
     }
     Backward compatible: v1 {a,l,i,ts} loads fine (no acts/stats).

     Local-first: localStorage immediately on every save.
     Cross-device: fire-and-forget upsert to student_data (jsonb). */
  var STAGE_POS_KEY = 'pel_stage_pos';
  var _stageSession = null; // cached loaded session for this lesson

  /* Extract a stable choice key from an option element.
     Prefers data-choice-key (stable across shuffles), then text content.
     Never uses data-i (unstable shuffled index) or data-en (index in match). */
  function choiceKey(el){
    return el.getAttribute('data-choice-key') || el.textContent.trim().slice(0,120);
  }

  /* Capture the current activity's DOM interaction state.
     Scans the stage for selected options, typed text, revealed/played
     flags - without needing each renderer to cooperate. */
  function captureActivityDOM(){
    var s = Stage.state; if(!s || !Stage.el) return {};
    var act = s.seq && s.seq[s.idx]; if(!act) return {};
    var st = { type: act.type, mode: act.mode||'recognition' };
    if(s.checked) st.checked = true;
    if(s.correct) st.correct = true;
    try{
      // Selected options (pre-check state)
      var sel = [];
      Stage.el.querySelectorAll('.pel-option.selected, .pel-tile.selected, .pel-step-opt.selected').forEach(function(el){
        var k = choiceKey(el);
        if(k) sel.push(k);
      });
      if(sel.length) st.selected = sel;

      // Checked options (post-check state: correct/wrong classes persist)
      var correctOpts = [], wrongOpts = [];
      Stage.el.querySelectorAll('.pel-option.correct, .pel-tile.correct, .pel-step-opt.correct').forEach(function(el){
        var k = choiceKey(el);
        if(k) correctOpts.push(k);
      });
      if(correctOpts.length) st.correctOpts = correctOpts;
      Stage.el.querySelectorAll('.pel-option.wrong, .pel-tile.wrong, .pel-step-opt.wrong').forEach(function(el){
        var k = choiceKey(el);
        if(k) wrongOpts.push(k);
      });
      if(wrongOpts.length) st.wrongOpts = wrongOpts;

      // Typed text (input renderers)
      var inp = Stage.el.querySelector('input[type=text], input[type=input], textarea');
      if(inp && inp.value) st.typed = inp.value;

      // Ordered tokens (db_order / arrange_words / dictation / db_translate / free_response)
      // Renderers emit placed tokens as .pel-token[data-pi] inside the drop zone.
      var tokens = [];
      Stage.el.querySelectorAll('.pel-arrange-drop .pel-token, .pel-token[data-pi]').forEach(function(el){
        var k = el.getAttribute('data-key') || el.textContent.trim().slice(0,80);
        if(k) tokens.push(k);
      });
      if(tokens.length) st.ordered = tokens;

      // Matched pairs (match activity uses .matched class)
      var pairs = [];
      Stage.el.querySelectorAll('.pel-tile.matched').forEach(function(el){
        var k = el.getAttribute('data-en') || el.getAttribute('data-ar') || el.textContent.trim().slice(0,80);
        if(k) pairs.push(k);
      });
      if(pairs.length) st.pairs = pairs;

      // Reveal state (learn / learn_sentence)
      if(Stage.el.querySelector('.pel-reveal.show, #pelLearnReveal.show, #pelSenReveal.show')) st.revealed = true;

      // Played state (listen)
      if(Stage.el.querySelector('.pel-played')) st.played = true;
    }catch(e){}
    return st;
  }

  /* Save the full session: position + stats + per-activity state. */
  function saveStageSession(){
    try{
      var s = Stage.state; if(!s || !s.academyId || !s.lessonId) return;
      // Merge into existing session (don't rebuild from scratch - preserves
      // previous activities' DOM state like correctOpts/wrongOpts).
      var existing = loadStagePos(s.academyId, s.lessonId) || {};
      var acts = existing.acts || {};
      // Capture current activity's fresh DOM state
      var cur = captureActivityDOM();
      if(Object.keys(cur).length){
        // Clean stale DOM-state keys for the current activity before merging,
        // so a re-render (Try again) doesn't leave ghost correctOpts/wrongOpts.
        var staleKeys = ['selected','typed','ordered','pairs','revealed','played','checked','correct','correctOpts','wrongOpts'];
        var prev = acts[String(s.idx)] || {};
        staleKeys.forEach(function(sk){ delete prev[sk]; });
        acts[String(s.idx)] = Object.assign(prev, cur);
      }
      // Save per-activity flags from the seq (counted/okTracked for mastery gate)
      if(s.seq){
        for(var i=0; i<s.seq.length; i++){
          var a = s.seq[i];
          if(a && (a.counted || a.okTracked)){
            acts[String(i)] = acts[String(i)] || {};
            acts[String(i)].counted = !!a.counted;
            acts[String(i)].okTracked = !!a.okTracked;
            acts[String(i)].mode = a.mode || 'recognition';
          }
        }
      }
      var sess = {
        v:2, a:s.academyId, l:s.lessonId, i:s.idx, ts:Date.now(),
        stats:{
          recTotal:s.recTotal||0, recOk:s.recOk||0,
          prodTotal:s.prodTotal||0, prodOk:s.prodOk||0,
          prodFirstOk:s.prodFirstOk||0
        },
        acts: acts
      };
      var raw = JSON.stringify(sess);
      if(typeof localStorage!=='undefined') localStorage.setItem(STAGE_POS_KEY, raw);
      var c = srsSupabase(), uid = srsUserId();
      if(c && uid){
        c.from('student_data').upsert({ user_id: uid, key: STAGE_POS_KEY, value: raw }).then(function(){}).catch(function(e){ console.warn('[PEL] sync error:', e.message||e); });
      }
    }catch(e){}
  }

  /* Backward-compatible alias - mark() and next() call this. */
  function saveStagePos(){ saveStageSession(); }

  /* Load a saved session for the given lesson. Returns null if none. */
  function loadStagePos(academyId, lessonId){
    try{
      var raw = (typeof localStorage!=='undefined') ? localStorage.getItem(STAGE_POS_KEY) : null;
      if(!raw || raw==='[object Object]' || raw==='null') return null;
      var pos = JSON.parse(raw);
      if(typeof pos === 'string'){ pos = JSON.parse(pos); }
      if(pos && pos.a===academyId && pos.l===lessonId){
        return pos;
      }
    }catch(e){}
    return null;
  }

  /* Apply a saved session to the current Stage.state.
     Restores stats and per-activity flags WITHOUT calling mark() -
     the mastery gate reads these counters, so they must be set before
     the student interacts. */
  function applySavedSession(saved){
    try{
      var s = Stage.state; if(!s || !saved) return;
      // Restore stats
      if(saved.stats){
        s.recTotal = saved.stats.recTotal||0;
        s.recOk = saved.stats.recOk||0;
        s.prodTotal = saved.stats.prodTotal||0;
        s.prodOk = saved.stats.prodOk||0;
        s.prodFirstOk = saved.stats.prodFirstOk||0;
      }
      // Restore per-activity flags
      if(saved.acts && s.seq){
        var ks = Object.keys(saved.acts);
        for(var k=0;k<ks.length;k++){
          var idx = parseInt(ks[k],10);
          var as = saved.acts[ks[k]];
          if(s.seq[idx]){
            if(as.counted) s.seq[idx].counted = true;
            if(as.okTracked) s.seq[idx].okTracked = true;
            // Store the saved DOM state for the renderer to read
            s.seq[idx]._resume = as;
          }
        }
      }
      // Mark current activity as checked/correct if saved
      if(saved.acts && saved.acts[String(s.idx)]){
        var cur = saved.acts[String(s.idx)];
        if(cur.checked) s.checked = true;
        if(cur.correct) s.correct = true;
      }
    }catch(e){}
  }

  /* Restore the current activity's saved DOM state after render.
     Re-selects options, fills inputs, shows reveals - without calling mark(). */
  function restoreActivityDOM(){
    try{
      var s = Stage.state; if(!s || !Stage.el) return;
      var act = s.seq && s.seq[s.idx]; if(!act || !act._resume) return;
      // Only restore if saved activity index matches current (prevents cross-activity restoration)
      if(act._resume.idx !== undefined && act._resume.idx !== s.idx) return;
      var r = act._resume;
      // Restore selected options (match by data-key, data-en, data-i, or text)
      var optSel = '.pel-option, .pel-tile, .pel-step-opt';
      if(r.selected && r.selected.length){
        r.selected.forEach(function(key){
          Stage.el.querySelectorAll(optSel).forEach(function(el){
            var dk = choiceKey(el);
            if(dk === key){ el.classList.add('selected'); }
          });
        });
      }
      // Restore correct/wrong option highlights (post-check state)
      if(r.correctOpts && r.correctOpts.length){
        r.correctOpts.forEach(function(key){
          Stage.el.querySelectorAll(optSel).forEach(function(el){
            var dk = choiceKey(el);
            if(dk === key){ el.classList.add('correct'); }
          });
        });
      }
      if(r.wrongOpts && r.wrongOpts.length){
        r.wrongOpts.forEach(function(key){
          Stage.el.querySelectorAll(optSel).forEach(function(el){
            var dk = choiceKey(el);
            if(dk === key){ el.classList.add('wrong'); }
          });
        });
      }
      // Restore typed text
      if(r.typed){
        var inp = Stage.el.querySelector('input[type=text], input[type=input], textarea');
        if(inp) inp.value = r.typed;
      }
      // Restore played state on play buttons
      if(r.played){
        var playBtns = Stage.el.querySelectorAll('.pel-act-play, .pel-mic-btn');
        playBtns.forEach(function(b){ b.classList.add('pel-played'); });
      }
      // Enable Check button if selections/typed text/played were restored (pre-check state)
      if(!r.checked && (r.selected || r.typed || r.played)){
        var rbtn = Stage.el.querySelector('#pelStgBtn');
        if(rbtn) rbtn.disabled = false;
        // For typed-input renderers, dispatch input event so renderer validation fires
        if(r.typed){
          var tInp = Stage.el.querySelector('input[type=text], input[type=input], textarea');
          if(tInp) tInp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      // Restore revealed state
      if(r.revealed){
        var revealBtn = Stage.el.querySelector('#pelLearnShow, #pelSenShow');
        if(revealBtn) revealBtn.click();
      }
      // Restore checked/correct feedback (without calling mark)
      if(r.checked){
        // Preserve checked state so a later saveStageSession doesn't erase it
        s.checked = true;
        s.correct = !!r.correct;
        var fb = Stage.el.querySelector('#pelStgFb');
        if(fb){
          fb.className = 'pel-feedback show ' + (r.correct ? 'ok' : 'no');
          fb.innerHTML = r.correct ? '✓ '+sayOk() : '× '+sayNo();
        }
        var btn = Stage.el.querySelector('#pelStgBtn');
        if(btn){
          if(r.correct){
            btn.innerHTML = L('Continue','متابعة');
            btn.disabled = false;
            btn.className = 'pel-act-primary';
            btn.onclick = function(){ Stage.next(); };
          } else {
            btn.innerHTML = L('Try again','حاول ثانية');
            btn.className = 'pel-act-primary ghost';
            btn.disabled = false;
            btn.onclick = function(){ Stage.render(); };
          }
        }
      }
    }catch(e){}
  }

  function clearStagePos(){
    try{
      if(typeof localStorage!=='undefined') localStorage.removeItem(STAGE_POS_KEY);
      _stageSession = null;
      var c = srsSupabase(), uid = srsUserId();
      if(c && uid){
        c.from('student_data').upsert({ user_id: uid, key: STAGE_POS_KEY, value: null }).then(function(){}).catch(function(e){ console.warn('[PEL] sync error:', e.message||e); });
      }
    }catch(e){}
  }

  /* ---- 5b. SPACED REPETITION (SM-2-lite, local-first) ----
     Every recalled word gets a schedule: correct recalls stretch the
     interval (1d -> 3d -> 7d -> 16d...), a miss resets it and drops ease.
     The review activity resurfaces DUE items from previous lessons first,
     so old vocabulary comes back right when the student is about to
     forget it. State lives in localStorage (pel_srs_v1) keyed by the
     English word; a compact {en,ar,translit} snapshot is stored with each
     record so review can resurface old vocab without loading its lesson. */
  const SRS_KEY = 'pel_srs_v1';
  const SRS_MEM = {};
  function srsStore(){
    try{ if(typeof localStorage!=='undefined') return JSON.parse(localStorage.getItem(SRS_KEY)||'{}'); }catch(e){}
    return SRS_MEM;
  }
  function srsSave(m){
    try{ if(typeof localStorage!=='undefined'){ localStorage.setItem(SRS_KEY, JSON.stringify(m)); return; } }catch(e){}
    Object.keys(SRS_MEM).forEach(function(k){ delete SRS_MEM[k]; });
    Object.assign(SRS_MEM, m);
  }
  function srsRecord(it, knewIt){
    try{
      if(!it || !it.en) return;
      const m = srsStore();
      const r = m[it.en] || { ease:2.5, interval:0, streak:0, due:0, snap:null };
      if(knewIt){
        r.streak++;
        r.interval = r.streak===1 ? 1 : r.streak===2 ? 3 : Math.max(1, Math.round(r.interval * r.ease));
        r.ease = Math.min(3.0, r.ease + 0.05);
      } else {
        r.streak = 0; r.interval = 1;
        r.ease = Math.max(1.3, r.ease - 0.2);
      }
      r.due = Date.now() + r.interval * 86400000;
      r.snap = { en:it.en, ar:it.ar||'', translit:it.translit||'' };
      r.ts = Date.now();
      m[it.en] = r;
      srsSave(m);
      srsPush(it.en, r);
    }catch(e){}
  }

  /* ---- 5c. SRS SERVER SYNC (pel_srs_state, local-first) ----
     The schedule above is the source of truth for gameplay; this mirror
     makes it survive device switches. Rules:
     - srsPush(): fire-and-forget upsert of ONE row on every answer that
       calls srsRecord(). Skipped (no-op) when there is no logged-in user
       or no supabase client - offline/visitor play still works, purely local.
     - srsSync(): pull ALL rows for the user (not only due ones - future
       intervals must travel too), merge last-write-wins by timestamp
       (local r.ts vs server updated_at; legacy local rows without ts lose
       to the server on first sync), then push every merged row back up
       (idempotent: rows where the server was newer push back identical
       values; local-only rows get created server-side). Never throws;
     returns a promise so callers may await or ignore it.
     Deps injected by app.html: supabase() -> client or null, userId() ->
     auth uid or null. Tests inject neither; both guards must hold. */
  function srsSupabase(){
    try{ return (Deps && typeof Deps.supabase === 'function') ? Deps.supabase() : null; }catch(e){ return null; }
  }
  function srsUserId(){
    try{ return (Deps && typeof Deps.userId === 'function') ? Deps.userId() : null; }catch(e){ return null; }
  }
  function srsRow(uid, en, r){
    return {
      user_id: uid, en: en,
      ease: r.ease, interval_days: r.interval, streak: r.streak,
      due_at: new Date(r.due || Date.now()).toISOString(),
      snap: r.snap || { en: en, ar: '', translit: '' },
      updated_at: new Date(r.ts || Date.now()).toISOString()
    };
  }
  function srsPush(en, r){
    try{
      if(!en || !r) return;
      const c = srsSupabase(), uid = srsUserId();
      if(!c || !uid) return;
      c.from('pel_srs_state').upsert(srsRow(uid, en, r), { onConflict: 'user_id,en' }).then(function(){}).catch(function(e){ console.warn('[PEL] sync error:', e.message||e); });
    }catch(e){}
  }
  function srsPushAll(c, uid){
    try{
      const m = srsStore(); const keys = Object.keys(m);
      let batch = [];
      const flush = function(){
        if(!batch.length) return;
        c.from('pel_srs_state').upsert(batch, { onConflict: 'user_id,en' }).then(function(){}).catch(function(e){ console.warn('[PEL] sync error:', e.message||e); });
        batch = [];
      };
      keys.forEach(function(k){
        batch.push(srsRow(uid, k, m[k]));
        if(batch.length >= 200) flush();
      });
      flush();
      return keys.length;
    }catch(e){ return 0; }
  }
  function srsSync(){
    try{
      const c = srsSupabase(), uid = srsUserId();
      if(!c || !uid) return Promise.resolve(false);
      return c.from('pel_srs_state')
        .select('en,ease,interval_days,streak,due_at,snap,updated_at')
        .limit(2000)
        .then(function(res){
          const rows = (res && Array.isArray(res.data)) ? res.data : [];
          const m = srsStore(); let merged = 0;
          rows.forEach(function(row){
            if(!row || !row.en) return;
            const local = m[row.en];
            const serverTs = row.updated_at ? Date.parse(row.updated_at) : 0;
            if(!local || serverTs > (local.ts || 0)){
              m[row.en] = {
                ease: row.ease, interval: row.interval_days, streak: row.streak,
                due: row.due_at ? Date.parse(row.due_at) : 0,
                ts: serverTs,
                snap: row.snap || (local && local.snap) || null
              };
              merged++;
            }
          });
          if(merged) srsSave(m);
          const pushed = srsPushAll(c, uid);
          return { pulled: rows.length, merged: merged, pushed: pushed };
        })
        .catch(function(){ return false; });
    }catch(e){ return Promise.resolve(false); }
  }
  function srsDueList(limit){
    try{
      const now = Date.now();
      const m = srsStore();
      return Object.keys(m).map(function(k){ return m[k]; })
        .filter(function(r){ return r.due && r.due <= now && r.snap && r.snap.en; })
        .sort(function(a,b){ return a.due - b.due; })
        .slice(0, limit||5)
        .map(function(r){ return { en:r.snap.en, ar:r.snap.ar, translit:r.snap.translit, srs:true }; });
    }catch(e){ return []; }
  }

  /* Word-similarity for dictation scoring (local, no app dependency). */
  function levDist(a,b){
    const m=a.length, n=b.length;
    if(!m) return n; if(!n) return m;
    let prev=new Array(n+1), cur=new Array(n+1);
    for(let j=0;j<=n;j++) prev[j]=j;
    for(let i=1;i<=m;i++){ cur[0]=i;
      for(let j=1;j<=n;j++){ cur[j]=Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+(a[i-1]===b[j-1]?0:1)); }
      const t=prev; prev=cur; cur=t;
    }
    return prev[n];
  }
  function similarity(a,b){ if(!a&&!b) return 1; if(!a||!b) return 0; return 1 - levDist(a,b)/Math.max(a.length,b.length); }

  /* ---- 5b. TEACHING PANEL - shown before every practice activity ---- */
  // Activity types that get a teach-first panel (not the teaching activities themselves)
  var TEACH_BEFORE = {
    recognize:1, match:1, arrange_words:1, db_order:1, fill_blank:1,
    spell:1, db_spell:1, translate:1, db_translate:1, listen:1, identify_heard:1,
    listening_dictation:1, pronunciation:1, speaking:1, conversation_response:1,
    complete_dialogue:1, grammar_correction:1, db_correct:1,
    choose_natural_expression:1, guided_production:1, free_response:1, review:1, challenge:1
  };

  function extractActivityVocab(act){
    var vocab = [];
    if(act.item && act.item.en){
      vocab.push({en:act.item.en, ar:act.item.ar||'', translit:act.item.translit||tr(act.item.en), example:act.item.example||null});
    }
    if(act.sentence && act.sentence.en){
      vocab.push({en:act.sentence.en, ar:act.sentence.ar||'', translit:act.sentence.translit||tr(act.sentence.en)});
    }
    if(act.quiz && act.quiz[0]){
      var q = act.quiz[0];
      if(q.qEn) vocab.push({en:q.qEn, ar:q.qAr||'', translit:q.qTr||tr(q.qEn)});
      if(q.options){
        q.options.forEach(function(o){
          var text = optText(o);
          if(text) vocab.push({en:text, ar:optSub(o)||'', translit:(typeof o==='object'&&o.tr)?o.tr:tr(text)});
        });
      }
    }
    if(act.items){
      act.items.forEach(function(it){
        if(it && it.en) vocab.push({en:it.en, ar:it.ar||'', translit:it.translit||tr(it.en)});
      });
    }
    if(act.ex && act.ex.payload){
      var p = act.ex.payload;
      if(p.prompt && p.prompt.en) vocab.push({en:p.prompt.en, ar:p.prompt.ar||'', translit:p.prompt.tr||tr(p.prompt.en)});
      if(p.display) vocab.push({en:p.display, ar:p.meaning||'', translit:p.translit||''});
      if(p.source) vocab.push({en:p.source, ar:'', translit:p.source_tr||tr(p.source)});
      if(p.right) vocab.push({en:p.right, ar:'', translit:p.right_tr||tr(p.right)});
      if(p.wrong) vocab.push({en:p.wrong, ar:'', translit:p.wrong_tr||tr(p.wrong)});
    }
    var seen = {};
    return vocab.filter(function(v){
      var k = norm(v.en);
      if(!k || seen[k]) return false;
      seen[k] = true;
      return true;
    });
  }

  function extractActivitySentence(act){
    if(act.sentence && act.sentence.en){
      return {en:act.sentence.en, ar:act.sentence.ar||'', translit:act.sentence.translit||tr(act.sentence.en)};
    }
    if(act.question && act.statement){
      return {en:act.question, ar:act.ar||'', translit:tr(act.question)};
    }
    if(act.pair && act.pair.target){
      return {en:act.pair.target, ar:act.pair.ar||'', translit:tr(act.pair.target)};
    }
    if(act.prompt && act.prompt.en){
      return {en:act.prompt.en, ar:act.prompt.ar||'', translit:tr(act.prompt.en)};
    }
    if(act.scenario && act.scenario.goal && act.scenario.goal.en){
      return {en:act.scenario.goal.en, ar:act.scenario.goal.ar||'', translit:tr(act.scenario.goal.en)};
    }
    if(act.quiz && act.quiz[0]){
      var q = act.quiz[0];
      if(q.qEn) return {en:q.qEn, ar:q.qAr||'', translit:q.qTr||tr(q.qEn)};
      if(q.q) return {en:String(q.q).replace(/<[^>]*>/g,'').trim(), ar:'', translit:''};
    }
    if(act.ex && act.ex.payload){
      var p = act.ex.payload;
      if(p.prompt && p.prompt.en) return {en:p.prompt.en, ar:p.prompt.ar||'', translit:p.prompt.tr||tr(p.prompt.en)};
      if(p.source) return {en:p.source, ar:'', translit:p.source_tr||tr(p.source)};
      if(p.display) return {en:p.display, ar:p.meaning||'', translit:p.translit||''};
    }
    return null;
  }

  // Arabic grammar/connection notes - explains how words connect
  function connectionNoteFor(act){
    var s = extractActivitySentence(act);
    var text = s ? s.en : '';
    if(act.item && act.item.en) text += ' ' + act.item.en;
    if(act.quiz && act.quiz[0]){
      var q = act.quiz[0];
      if(q.qEn) text += ' ' + q.qEn;
      if(q.options) q.options.forEach(function(o){ text += ' ' + optText(o); });
    }
    text = text.toLowerCase();

    // 1. There is / There are - existence
    if(/\bthere\s+(is|are)\b/i.test(text)){
      return 'there is = فيه (لواحد) · there are = فيهم (للكثر). نستخدمها لما نقول ان شي موجود. الترتيب: There is/are + الشي + المكان. مثال: There is a book on the table = فيه كتاب على الطاولة';
    }
    // 2. Present continuous - am/is/are + -ing
    if(/\b(am|is|are)\s+\w+ing\b/i.test(text)){
      return 'هنا نستخدم am او is او are + كلمة تنتهي بـ ing. معناها شي يصير الحين هذي اللحظة. am مع I، is مع he/she/it، are مع we/you/they. الترتيب: الشخص + am/is/are + كلمة+ing. مثال: I am eating = انا اكل الحين';
    }
    // 3. Present perfect - have/has + past participle
    if(/\b(have|has|ve|s)\s+\w+(ed|en|wn|rd|t)\b/i.test(text) || /\bhave\s+been\b/i.test(text)){
      return 'هنا نستخدم have او has + كلمة فعل بصيغة الماضي (زي stopped او eaten). معناها شي صار في الماضي ولا زال مهم للحين. have مع I/we/you/they، has مع he/she/it. مثال: I have eaten = انا اكلت (ولا زال تاثيره موجود)';
    }
    // 4. Going to - future plans
    if(/\bgoing\s+to\b/i.test(text)){
      return 'going to = رايح (للمستقبل). نستخدمها لما يكون فيه خطة مسبقة. الترتيب: الشخص + am/is/are + going to + كلمة فعل. مثال: I am going to visit = انا رايح ازور';
    }
    // 5. Will - future
    if(/\bwill\b/i.test(text) && !/\b(would|william)\b/i.test(text)){
      return 'will = راح (للمستقبل). نستخدمها لشي راح يصير بدون خطة مسبقة. الترتيب: الشخص + will + كلمة فعل. مثال: I will call you = راح اتصل بك';
    }
    // 6. Can / can't - ability
    if(/\bcan('t|not)?\b/i.test(text)){
      return 'can = اقدر (للاستطاعة) · can\'t = ما اقدر. نستخدمها لما نقول اننا نقدر نسوي شي او ما نقدر. الترتيب: الشخص + can/can\'t + كلمة فعل. مثال: I can swim = اقدر اسبح';
    }
    // 7. Have / has - possession
    if(/\b(have|has)\b/i.test(text) && !/\b(have|has)\s+\w+(ed|en|wn|rd)\b/i.test(text)){
      return 'have/has = عندي/عنده. have مع I/we/you/they، has مع he/she/it. الترتيب: الشخص + have/has + الشي. مثال: I have a car = عندي سيارة. She has a phone = عندها جوال';
    }
    // 8. Would like - polite requests
    if(/\bwould\s+like\b/i.test(text)){
      return 'would like = ابي/احب (طلب مهذب). احسن من I want لانها اكثر تهذيبا. الترتيب: I + would like + to + كلمة فعل. مثال: I would like to order = ابي اطلب';
    }
    // 9. Could you / Would you mind - polite requests
    if(/\bcould\s+you\b/i.test(text)){
      return 'Could you = ممكن (طلب مهذب). اكثر تهذيبا من Can you. الترتيب: Could you + كلمة فعل. مثال: Could you help me = ممكن تساعدني';
    }
    if(/\bwould\s+you\s+mind\b/i.test(text)){
      return 'Would you mind = هل تمانع (اطلب تهذيب شديد). بعدها كلمة فعل + ing. مثال: Would you mind opening = هل تمانع تفتح';
    }
    // 10. How much / How many - countable/uncountable
    if(/\bhow\s+much\b/i.test(text)){
      return 'How much = كم (للشي اللي ما يعد والفلوس). الترتيب: How much + الشي + ... مثال: How much is it = كم سعره';
    }
    if(/\bhow\s+many\b/i.test(text)){
      return 'How many = كم (للشي اللي يعد). الترتيب: How many + الشي جمع + ... مثال: How many books = كم كتاب';
    }
    // 11. WH- question words
    if(/\bwhat\b/i.test(text)){
      return 'What = شنو/ايش. تبدا بيها السوال. بعدها كلمة مساعدة (do, are, is). الترتيب: What + كلمة مساعدة + الشخص + كلمة فعل. مثال: What do you want = شنو تبي';
    }
    if(/\bwhere\b/i.test(text)){
      return 'Where = وين. للسوال عن المكان. الترتيب: Where + كلمة مساعدة + الشخص + ... مثال: Where do you live = وين تسكن';
    }
    if(/\bwhen\b/i.test(text)){
      return 'When = متى. للسوال عن الوقت. الترتيب: When + كلمة مساعدة + الشخص + ... مثال: When do you work = متى تشتغل';
    }
    if(/\bwho\b/i.test(text)){
      return 'Who = من. للسوال عن الشخص. الترتيب: Who + كلمة مساعدة + الشخص + ... مثال: Who is he = من هذا';
    }
    if(/\bwhy\b/i.test(text)){
      return 'Why = ليش. للسوال عن السبب. الجواب يبدا بـ because (لان). الترتيب: Why + كلمة مساعدة + الشخص + ... مثال: Why are you happy = ليش انت مبسوط';
    }
    if(/\bhow\b/i.test(text) && !/\bhow\s+(much|many|old)\b/i.test(text)){
      return 'How = كيف. للسوال عن الطريقة او الحالة. الترتيب: How + كلمة مساعدة + الشخص + ... مثال: How are you = كيف حالك';
    }
    // 12. Comparatives
    if(/\b\w+er\s+than\b/i.test(text) || /\bmore\s+\w+\s+than\b/i.test(text)){
      return 'للمقارنة بين شييين: الكلمة القصيرة + er + than (bigger than = اكبر من). او more + كلمة وصف + than (more beautiful than = اجمل من). مثال: This is bigger than that = هذا اكبر من ذاك';
    }
    // 13. Demonstrative pronouns
    if(/\b(this|that|these|those)\b/i.test(text)){
      return 'this = ذس (قريب، واحد) · that = ذات (بعيد، واحد) · these = ذيز (قريب، كثر) · those = ذوز (بعيد، كثر). نشاور بها على الشي. الترتيب: this/that/these/those + الشي + كلمة فعل + باقي الجملة. مثال: This is a book = هذا كتاب';
    }
    // 14. Articles - a/an/the
    if(/\b\ba\s+[bcdfghjklmnpqrstvwxyz]\w*/i.test(text)){
      return 'a = واحد (قبل صوت ساكن). نحطها قبل الشي الواحد. الترتيب: a + الشي. مثال: a book = كتاب، a car = سيارة';
    }
    if(/\ban\s+[aeiou]\w*/i.test(text)){
      return 'an = واحد (قبل صوت متحرك a/e/i/o/u). نحطها قبل الشي الواحد اللي يبدا بحرف متحرك. الترتيب: an + الشي. مثال: an apple = تفاحة، an egg = بيضة';
    }
    if(/\bthe\b/i.test(text) && !/\bthere\b/i.test(text)){
      return 'the = الـ (للشي المحدد اللي يعرفه الكل). الترتيب: the + الشي. مثال: the book = الكتاب، the door = الباب';
    }
    // 15. Possessive adjectives
    if(/\b(my|your|his|her|our|their)\b/i.test(text)){
      return 'كلمات الملكية: my = حقتي · your = حقتك · his = حقه · her = حقها · our = حقنا · their = حقهم. تحطها قبل الشي. الترتيب: كلمة ملكية + الشي. مثال: my name = اسمي، your phone = جوالك';
    }
    // 16. Prepositions - in/on/at
    if(/\bin\s+(the\s+)?(morning|afternoon|evening|night|room|house|car|bag|box|school|work|bed)\b/i.test(text)){
      return 'in = في (للوقت الكبير والاماكن المغلقة). في الصباح، في الغرفة، في السيارة. الترتيب: in + وقت/مكان. مثال: in the morning = في الصباح، in the car = في السيارة';
    }
    if(/\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|table|desk|wall|floor|shelf)\b/i.test(text)){
      return 'on = على (ليوم الاسبوع والاسطح). على الطاولة، يوم الاثنين. الترتيب: on + يوم/سطح. مثال: on Monday = يوم الاثنين، on the table = على الطاولة';
    }
    if(/\bat\s+\d/i.test(text) || /\bat\s+(home|school|work|night|noon)\b/i.test(text)){
      return 'at = عند/في (للوقت المحدد والاماكن المحددة). الساعة 6، في البيت، في الليل. الترتيب: at + وقت/مكان محدد. مثال: at 6pm = الساعة 6، at home = في البيت';
    }
    // 17. So do I / Neither do I - agreement
    if(/\bso\s+do\s+i\b/i.test(text)){
      return 'So do I = وانا كمان (موافقة). نستخدمها لما نوافق على كلام احد. مثال: A: I like coffee. B: So do I = وانا كمان';
    }
    if(/\bneither\s+do\s+i\b/i.test(text)){
      return 'Neither do I = وانا لا (موافقة على النفي). نستخدمها لما نوافق على كلام منفي. مثال: A: I don\'t like tea. B: Neither do I = وانا لا';
    }
    // 18. It is + adjective (weather/descriptions)
    if(/^it\s+is\s+\w+/i.test(text) || /\bit\s+is\s+(hot|cold|rainy|sunny|windy|warm|cool|nice|beautiful|important)\b/i.test(text)){
      return 'It is + كلمة وصف: لوصف الجو او شي عام. الترتيب: It is + كلمة وصف. مثال: It is hot = الجو حار، It is rainy = الجو ممطر';
    }
    // 19. Subject + verb + to be (present)
    if(/\b(am|is|are)\b/i.test(text) && !/\b(was|were|will|can|could|should|would|have|has|had)\b/i.test(text)){
      return 'am/is/are = كلمة ربط (للمضارع). am مع I، is مع he/she/it، are مع we/you/they. الترتيب: الشخص + am/is/are + باقي الجملة. مثال: I am happy = انا مبسوط، She is tired = هي تعبانة';
    }
    // 20. Past simple was/were
    if(/\b(was|were)\b/i.test(text)){
      return 'was/were = كلمة ربط (للماضي). was مع I/he/she/it، were مع we/you/they. الترتيب: الشخص + was/were + باقي الجملة. مثال: I was happy = كنت مبسوط، They were tired = كانوا تعبانين';
    }
    // 21. Present simple (verb + s)
    if(/\b(plays|goes|eats|works|lives|likes|wants|needs|runs|walks|talks|looks|sees|hears|feels|comes|does|says|sits|stands|reads|writes|drives|rides|flies|takes|makes|gives|gets|lets|sets|hits|fits|puts|cuts|costs|bets|bids|shuts|bursts|casts)\b/i.test(text)){
      return 'في المضارع البسيط: اذا كان الشخص واحد (he/she/it) نزيد s على اخر كلمة الفعل. الترتيب: الشخص + كلمة فعل+s + باقي الجملة. مثال: He plays = هو يلعب، She works = هي تشتغل';
    }
    // 22. Questions with do/does
    if(/\b(do you|does he|does she|does it|do they|do we|does the)\b/i.test(text)){
      return 'للسوال في المضارع البسيط نستخدم Do او Does قبل الشخص. Does مع he/she/it، Do مع I/you/we/they. الترتيب: Do/Does + الشخص + كلمة فعل. مثال: Do you work = انت تشتغل؟، Does he like = هو يحب؟';
    }
    // 23. Negation with don't/doesn't
    if(/\b(don't|doesn't|do not|does not)\b/i.test(text)){
      return 'للنفي في المضارع البسيط نستخدم don\'t او doesn\'t. don\'t مع I/you/we/they، doesn\'t مع he/she/it. الترتيب: الشخص + don\'t/doesn\'t + كلمة فعل. مثال: I don\'t know = ما اعرف، She doesn\'t work = ما تشتغل';
    }
    // 24. Imperatives - commands
    if(/^(go|turn|take|stop|wait|listen|look|open|close|come|sit|stand|bring|give|show|tell|put|let|keep|try|make|check|read|write|say)\b/i.test(text)){
      return 'صيغة الامر: كلمة الفعل بدون شخص قبلها. نعطي تعليمات مباشرة. مثال: Go straight = امشي مستقيم، Turn left = لف يسار، Open the door = افتح الباب';
    }
    // 25. Adjective before noun (Arabic interference: noun-adjective → adjective-noun)
    if(/\b(a|an|the)\s+(big|small|red|blue|green|white|black|new|old|good|nice|beautiful|happy|sad|tired|hungry|good|great|long|short|tall|young|old|rich|poor|strong|weak|fast|slow|clean|dirty|empty|full|open|close|hot|cold|warm|cool|dry|wet|hard|soft|heavy|light|sharp|dull|smooth|rough|flat|round|square|deep|shallow|wide|narrow|thick|thin|bright|dark)\s+\w+/i.test(text)){
      return 'بالعربي الصفة تجي بعد الاسم: سيارة حمراء. بالانجليزي الصفة تجي قبل الاسم: a red car. الترتيب: a/an/the + كلمة وصف + الاسم. مثال: a big house = بيت كبير، the new car = السيارة الجديدة';
    }
    // 26. No vs not (Arabic uses لا for both)
    if(/\bno\b/i.test(text) && !/\bnot\b/i.test(text) && !/\bknow\b/i.test(text) && !/\bnow\b/i.test(text) && !/\bnoon\b/i.test(text) && !/\bsnow\b/i.test(text)){
      return 'no = لا (للرفض المستقل). not = ما/مو (للنفي داخل الجملة). العربي يستخدم لا للاثنين بس بالانجليزي مختلفين. مثال: No, thanks = لا، شكرا. I am not tired = انا مو تعبان';
    }
    // 27. Adverb position (always, usually, never)
    if(/\b(always|usually|sometimes|never|often|rarely|seldom)\b/i.test(text)){
      return 'كلمات التكرار (always, usually, never) تجي قبل الفعل الاساسي: I always go. بس بعد is/are/am: She is always late. مثال: I never drink coffee = ما اشرب قهوة ابدا، He is always happy = هو دايماً مبسوط';
    }
    return '';
  }

  // Arabic grammar glossary - explains grammar terms used in the notes
  function grammarGlossary(act){
    var connNote = connectionNoteFor(act);
    var terms = [];
    var used = {};
    function add(key, ar, explain){
      if(used[key]) return;
      used[key] = true;
      terms.push({ar: ar, explain: explain});
    }

    // Detect which terms are used in the connection note
    if(connNote){
      if(connNote.indexOf('كلمة فعل') >= 0 || connNote.indexOf('كلمة الفعل') >= 0){
        add('verb', 'كلمة الفعل', 'كلمة تدل على فعل او حركة. مثال: go (يروح)، eat (ياكل)، play (يلعب)، work (يشتغل)');
      }
      if(connNote.indexOf('الشخص') >= 0){
        add('subject', 'الشخص', 'اللي يسوي الفعل. الكلمات: I (انا)، you (انت)، he (هو)، she (هي)، it (للشي)، we (احنا)، they (هم)');
      }
      if(connNote.indexOf('الشي') >= 0){
        add('noun', 'الشي / الاسم', 'كلمة تدل على شي او اسم. مثال: book (كتاب)، car (سيارة)، name (اسم)، phone (جوال)');
      }
      if(connNote.indexOf('كلمة وصف') >= 0 || connNote.indexOf('كلمة الوصف') >= 0){
        add('adj', 'كلمة الوصف / الصفة', 'كلمة تصف الشي. مثال: big (كبير)، good (زين)، hot (حار)، happy (مبسوط)');
      }
      if(connNote.indexOf('كلمة مساعدة') >= 0){
        add('aux', 'كلمة مساعدة', 'كلمة تساعد نسوي بها سوال او نفي. مثال: do, does, am, is, are, was, were');
      }
      if(connNote.indexOf('كلمة ربط') >= 0){
        add('tobe', 'كلمة ربط (am/is/are)', 'كلمة تربط الشخص بالوصف او الشي. am مع I، is مع he/she/it، are مع we/you/they. مثال: I am happy = انا مبسوط');
      }
      if(connNote.indexOf('كلمة ملكية') >= 0){
        add('poss', 'كلمات الملكية', 'كلمات تدل على الملك. my = حقتي، your = حقتك، his = حقه، her = حقها، our = حقنا، their = حقهم');
      }
      if(connNote.indexOf('كلمة اشارة') >= 0 || connNote.indexOf('الاشارة') >= 0){
        add('dem', 'كلمات الاشارة', 'كلمات نشاور فيها على شي. this = ذس (قريب واحد)، that = ذات (بعيد واحد)، these = ذيز (قريب كثر)، those = ذوز (بعيد كثر)');
      }
    }

    // Also detect terms from the lesson grammar rule
    var lesson = Stage.state.lesson || {};
    if(lesson.grammar && lesson.grammar.rule){
      var r = lesson.grammar.rule.toLowerCase();
      if(/present simple|present tense/.test(r)) add('pressimple', 'المضارع البسيط', 'زمن يصف شي يصير عادة او دايم. مثال: I work = انا اشتغل، He plays = هو يلعب');
      if(/present continuous|present progressive/.test(r)) add('prescont', 'المضارع المستمر', 'زمن يوصف شي يصير الحين. am/is/are + فعل+ing. مثال: I am eating = انا اكل الحين');
      if(/present perfect/.test(r)) add('presperf', 'المضارع التام', 'زمن يربط الماضي بالحاضر. have/has + فعل ماضي. مثال: I have eaten = انا اكلت');
      if(/past simple|past tense/.test(r)) add('past', 'الماضي البسيط', 'زمن يصف شي صار وانتهى. مثال: I worked = اشتغلت، He played = لعب');
      if(/future/.test(r)) add('future', 'المستقبل', 'زمن يصف شي راح يصير. will + فعل او going to + فعل. مثال: I will go = راح اروح');
      if(/auxiliary/.test(r)) add('aux2', 'كلمة مساعدة', 'كلمة تساعد نسوي بها سوال او نفي. مثال: do, does, am, is, are, have, has');
      if(/article/.test(r)) add('article', 'كلمات التعريف', 'a = واحد (قبل ساكن)، an = واحد (قبل متحرك)، the = الـ (للمحدد)');
      if(/preposition/.test(r)) add('prep', 'كلمات المكان/الوقت', 'كلمات تدل على مكان او وقت. in = في، on = على، at = عند');
      if(/possessive/.test(r)) add('poss2', 'كلمات الملكية', 'my = حقتي، your = حقتك، his = حقه، her = حقها');
      if(/question/.test(r)) add('quest', 'كلمات السوال', 'What = شنو، Where = وين، When = متى، Who = من، Why = ليش، How = كيف');
      if(/imperative|command/.test(r)) add('imp', 'صيغة الامر', 'جملة تبدا بكلمة فعل مباشرة بدون شخص. مثال: Go straight = امشي مستقيم');
      if(/comparative/.test(r)) add('comp', 'المقارنة', 'نقارن بين شييين. القصير + er + than (bigger than). الطويل: more + صفة + than (more beautiful than)');
    }

    return terms;
  }

  // Detect word type for vocabulary labeling
  function wordTypeFor(word, lesson){
    var w = (word || '').toLowerCase().trim();
    if(!w) return null;

    // Check lesson vocab for part-of-speech info
    if(lesson && lesson.vocab){
      for(var i=0; i<lesson.vocab.length; i++){
        var v = lesson.vocab[i];
        if(v && v.en && norm(v.en) === norm(w)){
          if(v.pos) return posLabel(v.pos);
          break;
        }
      }
    }

    // Common pronouns
    if(/^(i|you|he|she|it|we|they|me|him|her|us|them)$/.test(w)) return 'كلمة شخص';
    // Common verbs
    if(/^(am|is|are|was|were|have|has|had|do|does|did|will|would|can|could|should|shall|may|might|must)$/.test(w)) return 'كلمة مساعدة';
    if(/^(go|goes|going|went|gone|eat|eats|ate|eaten|play|plays|played|work|works|worked|live|lives|lived|like|likes|liked|want|wants|wanted|need|needs|needed|run|runs|ran|walk|walks|walked|talk|talks|talked|look|looks|looked|see|sees|saw|seen|hear|hears|heard|come|comes|came|say|says|said|sit|sits|sat|stand|stands|stood|read|reads|write|writes|wrote|drive|drives|drove|take|takes|took|make|makes|made|give|gives|gave|get|gets|got|let|lets|set|sets|put|puts|hit|hits|cut|cuts|cost|costs|open|opens|opened|close|closes|closed|turn|turns|turned|stop|stops|stopped|wait|waits|waited|listen|listens|listened|bring|brings|brought|show|shows|showed|tell|tells|told|keep|keeps|kept|try|tries|tried|check|checks|checked|call|calls|called|swim|swims|swam|visit|visits|visited|order|orders|ordered|book|books|booked|ask|asks|asked|answer|answers|answered)$/.test(w)) return 'فعل';
    // Articles
    if(/^(a|an|the)$/.test(w)) return 'كلمة تعريف';
    // Prepositions
    if(/^(in|on|at|under|over|next to|near|behind|in front of|between|above|below|to|from|of|with|by|for|about|into|out of|through)$/.test(w)) return 'كلمة مكان/وقت';
    // Question words
    if(/^(what|where|when|who|why|how|which|whose)$/.test(w)) return 'كلمة سوال';
    // Demonstratives
    if(/^(this|that|these|those)$/.test(w)) return 'كلمة اشارة';
    // Possessive adjectives
    if(/^(my|your|his|her|its|our|their)$/.test(w)) return 'كلمة ملكية';
    // Common adjectives (by suffix or known list)
    if(/^(big|small|good|bad|hot|cold|happy|sad|tired|hungry|thirsty|ready|beautiful|nice|warm|cool|rainy|sunny|windy|important|new|old|young|fast|slow|clean|dirty|full|empty|open|closed|easy|hard|long|short|tall|high|low|deep|wide|narrow|thick|thin|heavy|light|dark|bright|red|blue|green|yellow|white|black|brown|orange|purple|pink|gray|grey|sweet|sour|bitter|salty|fresh|late|early|first|last|next|previous|right|wrong|free|busy|sure|glad|sorry|welcome|angry|afraid|bored|excited|nervous|proud|shy|brave|honest|kind|polite|rude|rich|poor|strong|weak|famous|quiet|loud|safe|dangerous)$/.test(w)) return 'صفة';

    return 'كلمة'; // default: just "word"
  }

  // Map POS tag to Arabic label
  function posLabel(pos){
    var p = (pos || '').toLowerCase().trim();
    if(/^(n|noun|nn|nnp|nnps|nns)$/.test(p)) return 'اسم';
    if(/^(v|verb|vb|vbd|vbg|vbn|vbp|vbz)$/.test(p)) return 'فعل';
    if(/^(adj|jj|jjr|jjs|adjective)$/.test(p)) return 'صفة';
    if(/^(adv|rb|rbr|rbs|adverb)$/.test(p)) return 'كلمة وصف';
    if(/^(pron|prp|pdt|poss|prp\$)$/.test(p)) return 'كلمة شخص';
    if(/^(det|dt|pdt)$/.test(p)) return 'كلمة تعريف';
    if(/^(in|prep|preposition)$/.test(p)) return 'كلمة مكان/وقت';
    if(/^(cc|conj|conjunction)$/.test(p)) return 'كلمة وصل';
    if(/^(num|cd)$/.test(p)) return 'رقم';
    if(/^(uh|intj|interjection)$/.test(p)) return 'تعبير';
    return 'كلمة';
  }

  function buildTeachHtml(act){
    var lesson = Stage.state.lesson || {};
    var vocab = extractActivityVocab(act);
    var lessonVocab = lesson.vocab || [];

    // For answer-sensitive activities, we must NOT reveal the exact
    // sentence, answer options, or the target word. Instead we teach
    // the prerequisite building blocks (function words, grammar rules).
    var sensitive = isAnswerSensitive(act.type);
    // Collect the answer strings that must be hidden from the teach panel.
    var hiddenWords = [];
    if(sensitive){
      // Hide all vocab extracted from the activity (these ARE the answers)
      vocab.forEach(function(v){ if(v.en) hiddenWords.push(v.en); });
      // Also hide right/wrong from db_correct
      if(act.ex && act.ex.payload){
        var p = act.ex.payload;
        if(p.right) hiddenWords.push(p.right);
        if(p.wrong) hiddenWords.push(p.wrong);
      }
    }

    var html = '<div class="pel-teach">' +
      '<div class="pel-act-prompt">' + L('Learn first then practice','تعلم اولا ثم تمرن') + '</div>';

    // Glossary: explain grammar terms used in this lesson — ONCE per lesson
    var taughtKeys = getTaughtKeys();
    var newKeys = {};
    var glossary = grammarGlossary(act);
    if(glossary.length && !taughtKeys['glossary']){
      newKeys['glossary'] = true;
      html += '<div class="pel-teach-section">' + L('Grammar terms','مصطلحات القواعد') + '</div>';
      html += '<div class="pel-teach-glossary">';
      glossary.forEach(function(t){
        html += '<div class="pel-teach-glossary-item">' +
          '<span class="pel-teach-glossary-term arabic">' + esc(t.ar) + '</span>' +
          '<span class="pel-teach-glossary-def arabic">' + esc(t.explain) + '</span>' +
          '</div>';
      });
      html += '</div>';
    }

    var actLabel = typeLabel(act.type);
    html += '<div class="pel-teach-title">' + L('You will practice','بتتمرن على') + ': ' + actLabel + '</div>';

    if(sensitive){
      // ---- Answer-sensitive mode: teach prerequisites, NOT the answer ----
      // Compute taught words FIRST so prereq filtering works (was undefined before)
      var taughtWords = getTaughtWords();
      var allHidden = hiddenWords.concat(taughtWords);

      // Show prerequisite function words that appear in the activity text
      var prereqs = prereqWordsFor(act, hiddenWords);
      // Filter out prereq words already shown in previous teach panels
      prereqs = prereqs.filter(function(p){
        return !taughtWords.some(function(t){ return norm(t) === norm(p.en); });
      });
      // Store shown prereqs so future panels don't repeat them
      if(prereqs.length) act._teachPrereqs = prereqs.map(function(p){ return p.en; });
      if(prereqs.length){
        html += '<div class="pel-teach-section">' + L('Before this question','قبل هذا السوال') + '</div>';
        html += '<div class="pel-teach-section" style="font-size:.78rem;color:var(--text-muted);margin-top:4px;">' + L('You need these pieces','تحتاج هذه الكلمات') + '</div>';
        html += '<div class="pel-teach-vocab">';
        prereqs.forEach(function(p){
          html += '<div class="pel-teach-word">' +
            '<span class="pel-teach-en">' + esc(p.en) + '</span>' +
            (p.translit ? '<span class="pel-teach-tr">' + esc(p.translit) + '</span>' : '') +
            '<span class="pel-teach-ar arabic">' + esc(p.ar) + '</span>' +
            '</div>';
        });
        html += '</div>';
      }

      // Find untaught words that are RELEVANT to the upcoming activity
      // (appear in the activity's text). Prioritize these over generic
      // "next lesson word" so the teach panel is always contextual.
      var actText = activityText(act);
      var relevantUntaught = lessonVocab.filter(function(v){
        if(!v || !v.en) return false;
        if(allHidden.some(function(h){ return norm(h) === norm(v.en); })) return false;
        // Check if this word appears in the activity text
        return containsTerm(actText, v.en);
      });

      // If no relevant untaught words, fall back to next untaught lesson word
      var nextWord = relevantUntaught.length ? relevantUntaught[0]
        : lessonVocab.find(function(v){
            return v && v.en && !allHidden.some(function(h){ return norm(h) === norm(v.en); });
          });

      if(nextWord){
        // Teach this word individually — rich Saudi/Abha dialect content
        act._teachNewWord = nextWord.en;
        html += '<div class="pel-teach-section">' + L('New word','كلمة جديدة') + '</div>';
        html += '<div class="pel-teach-word" style="flex-direction:column;align-items:flex-start;gap:6px;padding:14px 16px;">';
        var wtype = wordTypeFor(nextWord.en, lesson);
        if(wtype) html += '<span class="pel-teach-type">' + esc(wtype) + '</span>';
        html += '<span class="pel-teach-en" style="font-size:1.15rem;font-weight:700;">' + esc(nextWord.en) + '</span>';
        if(nextWord.translit) html += '<span class="pel-teach-tr arabic">' + esc(nextWord.translit) + '</span>';
        if(nextWord.ar) html += '<span class="pel-teach-ar arabic" style="font-size:1rem;">' + esc(nextWord.ar) + '</span>';
        // Rich teaching content (Saudi/Abha dialect)
        var tc = teachingContentForWord(nextWord.en);
        if(tc){
          html += '<div style="margin-top:10px;width:100%;display:flex;flex-direction:column;gap:8px;">';
          // Meaning
          html += '<div style="padding:8px 10px;background:rgba(212,175,55,.08);border-radius:8px;"><span class="arabic" style="font-size:.9rem;">' + esc(tc.meaning) + '</span></div>';
          // Where to use
          if(tc.useWhen) html += '<div style="padding:8px 10px;background:rgba(34,197,94,.08);border-radius:8px;border-right:3px solid var(--success);"><div style="font-size:.72rem;color:var(--success);margin-bottom:3px;">' + L('Where to use','متى تستخدمها') + '</div><span class="arabic" style="font-size:.85rem;line-height:1.6;">' + esc(tc.useWhen) + '</span></div>';
          // Where NOT to use
          if(tc.dontUseWhen) html += '<div style="padding:8px 10px;background:rgba(210,92,92,.08);border-radius:8px;border-right:3px solid var(--danger);"><div style="font-size:.72rem;color:var(--danger);margin-bottom:3px;">' + L('Where NOT to use','متى لا تستخدمها') + '</div><span class="arabic" style="font-size:.85rem;line-height:1.6;">' + esc(tc.dontUseWhen) + '</span></div>';
          // Common mistake
          if(tc.commonMistake) html += '<div style="padding:8px 10px;background:rgba(245,158,11,.08);border-radius:8px;border-right:3px solid var(--gold);"><div style="font-size:.72rem;color:var(--gold);margin-bottom:3px;">' + L('Common mistake','خطا شايع') + '</div><span class="arabic" style="font-size:.85rem;line-height:1.6;">' + esc(tc.commonMistake) + '</span></div>';
          // How to avoid
          if(tc.howToAvoid) html += '<div style="padding:8px 10px;background:rgba(99,102,241,.08);border-radius:8px;border-right:3px solid #6366f1;"><div style="font-size:.72rem;color:#6366f1;margin-bottom:3px;">' + L('How to avoid','كيف تتجنبه') + '</div><span class="arabic" style="font-size:.85rem;line-height:1.6;">' + esc(tc.howToAvoid) + '</span></div>';
          // What to remember
          if(tc.remember) html += '<div style="padding:8px 10px;background:rgba(212,175,55,.12);border-radius:8px;border:1px solid rgba(212,175,55,.25);"><div style="font-size:.72rem;color:var(--gold-soft);margin-bottom:3px;">' + L('Remember','احفظ') + '</div><span class="arabic" style="font-size:.9rem;font-weight:600;line-height:1.6;">' + esc(tc.remember) + '</span></div>';
          html += '</div>';
        } else {
          // No rich content — show basic info + example if available
          if(nextWord.example && nextWord.example.en){
            html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);width:100%;">';
            html += '<div class="pel-teach-en" style="font-size:.95rem;">' + esc(nextWord.example.en) + '</div>';
            if(nextWord.example.translit) html += '<div class="pel-teach-tr arabic">' + esc(nextWord.example.translit) + '</div>';
            if(nextWord.example.ar) html += '<div class="pel-teach-ar arabic">' + esc(nextWord.example.ar) + '</div>';
            html += '</div>';
          }
          if(nextWord.usage){
            html += '<div style="margin-top:6px;width:100%;">';
            if(nextWord.usage.en) html += '<div class="pel-teach-en" style="font-size:.85rem;color:var(--text-secondary);">' + esc(nextWord.usage.en) + '</div>';
            if(nextWord.usage.ar) html += '<div class="pel-teach-ar arabic" style="font-size:.85rem;">' + esc(nextWord.usage.ar) + '</div>';
            html += '</div>';
          }
        }
        html += '</div>';

        // Audio button for the new word
        act._teachVocab = [nextWord];
        html += '<button class="pel-act-play" id="pelTeachPlay" style="margin-top:14px;"><i data-lucide="volume-2" width="16" height="16"></i> ' + L('Hear the word','اسمع الكلمة') + '</button>';
      } else {
        // No new word to teach — show remaining safe vocab (non-answer, non-taught)
        var safeVocab = lessonVocab.filter(function(v){
          return v && v.en && !allHidden.some(function(h){ return norm(h) === norm(v.en); });
        }).slice(0, 5);
        if(safeVocab.length){
          html += '<div class="pel-teach-section">' + L('Lesson vocabulary','مفردات الدرس') + '</div>';
          html += '<div class="pel-teach-vocab">';
          safeVocab.forEach(function(v){
            var wtype2 = wordTypeFor(v.en, lesson);
            html += '<div class="pel-teach-word">' +
              (wtype2 ? '<span class="pel-teach-type">' + esc(wtype2) + '</span>' : '') +
              '<span class="pel-teach-en">' + esc(v.en) + '</span>' +
              (v.translit ? '<span class="pel-teach-tr arabic">' + esc(v.translit) + '</span>' : '') +
              (v.ar ? '<span class="pel-teach-ar arabic">' + esc(v.ar) + '</span>' : '') +
              '</div>';
          });
          html += '</div>';
          act._teachVocab = safeVocab;
          if(safeVocab.length && safeVocab[0].en){
            html += '<button class="pel-act-play" id="pelTeachPlay" style="margin-top:14px;"><i data-lucide="volume-2" width="16" height="16"></i> ' + L('Hear the words','اسمع الكلمات') + '</button>';
          }
        }
      }

    } else {
      // ---- Non-sensitive mode: original behaviour (show sentence + vocab) ----
      var taughtWords = getTaughtWords();

      // Full sentence/question with Arabic translation
      var sentence = extractActivitySentence(act);
      if(sentence){
        html += '<div class="pel-teach-section">' + L('Sentence / Question','الجمله / السوال') + '</div>';
        html += '<div class="pel-teach-word" style="flex-direction:column;align-items:flex-start;gap:4px;">';
        html += '<span class="pel-teach-en">' + esc(sentence.en) + '</span>';
        if(sentence.translit) html += '<span class="pel-teach-tr arabic">' + esc(sentence.translit) + '</span>';
        if(sentence.ar) html += '<span class="pel-teach-ar arabic">' + esc(sentence.ar) + '</span>';
        html += '</div>';
      }

      if(vocab.length){
        html += '<div class="pel-teach-section">' + L('Key words','الكلمات المفتاحية') + '</div>';
        html += '<div class="pel-teach-vocab">';
        vocab.forEach(function(v){
          var wtype = wordTypeFor(v.en, lesson);
          html += '<div class="pel-teach-word">' +
            (wtype ? '<span class="pel-teach-type">' + esc(wtype) + '</span>' : '') +
            '<span class="pel-teach-en">' + esc(v.en) + '</span>' +
            (v.translit ? '<span class="pel-teach-tr arabic">' + esc(v.translit) + '</span>' : '') +
            (v.ar ? '<span class="pel-teach-ar arabic">' + esc(v.ar) + '</span>' : '') +
            '</div>';
        });
        html += '</div>';
      }

      // Exclude words already taught in learn/learn_sentence from the extra vocab
      var extra = lessonVocab.filter(function(v){
        return v && v.en && !vocab.some(function(x){ return norm(x.en) === norm(v.en); })
          && !taughtWords.some(function(t){ return norm(t) === norm(v.en); });
      }).slice(0, 5);
      if(extra.length){
        html += '<div class="pel-teach-section">' + L('Lesson vocabulary','مفردات الدرس') + '</div>';
        html += '<div class="pel-teach-vocab">';
        extra.forEach(function(v){
          var wtype = wordTypeFor(v.en, lesson);
          html += '<div class="pel-teach-word">' +
            (wtype ? '<span class="pel-teach-type">' + esc(wtype) + '</span>' : '') +
            '<span class="pel-teach-en">' + esc(v.en) + '</span>' +
            (v.translit ? '<span class="pel-teach-tr arabic">' + esc(v.translit) + '</span>' : '') +
            (v.ar ? '<span class="pel-teach-ar arabic">' + esc(v.ar) + '</span>' : '') +
            '</div>';
        });
        html += '</div>';
      }

      if(vocab.length && vocab[0].en){
        act._teachVocab = vocab;
        html += '<button class="pel-act-play" id="pelTeachPlay" style="margin-top:14px;"><i data-lucide="volume-2" width="16" height="16"></i> ' + L('Hear the words','اسمع الكلمات') + '</button>';
      }
    }

    if(lesson.grammar && lesson.grammar.saudi && !taughtKeys['grammar_saudi']){
      newKeys['grammar_saudi'] = true;
      var _terms1 = collectTerms(act, Stage.state);
      html += '<div class="pel-teach-section">' + L('Grammar rule','القاعدة') + '</div>';
      html += '<div class="pel-concept-steps">' + splitToSteps(lesson.grammar.saudi).map(function(s,i){
        return '<div class="pel-concept-step"><span class="pel-concept-num">' + (i+1) + '</span><div class="pel-concept-step-body"><div class="pel-concept-step-ar arabic">' + highlightImportant(esc(s), _terms1) + '</div></div></div>';
      }).join('') + '</div>';
    }
    if(lesson.grammar && lesson.grammar.rule && !taughtKeys['grammar_rule']){
      newKeys['grammar_rule'] = true;
      var _terms2 = collectTerms(act, Stage.state);
      html += '<div class="pel-concept-steps">' + splitToSteps(lesson.grammar.rule).map(function(s,i){
        return '<div class="pel-concept-step"><span class="pel-concept-num">' + (i+1) + '</span><div class="pel-concept-step-body"><div class="pel-concept-step-en">' + highlightImportant(esc(s), _terms2) + '</div></div></div>';
      }).join('') + '</div>';
    }
    if(lesson.dbNotes && lesson.dbNotes.length){
      var _terms3 = collectTerms(act, Stage.state);
      lesson.dbNotes.forEach(function(n, ni){
        var noteText = n.ar || n.en || '';
        var noteKey = 'dbnote_' + ni;
        var isAr = !!n.ar;
        if(noteText && !taughtKeys[noteKey]){
          newKeys[noteKey] = true;
          html += '<div class="pel-concept-steps">' + splitToSteps(noteText).map(function(s,i){
            var cls = isAr ? 'pel-concept-step-ar arabic' : 'pel-concept-step-en';
            return '<div class="pel-concept-step"><span class="pel-concept-num">' + (i+1) + '</span><div class="pel-concept-step-body"><div class="' + cls + '">' + highlightImportant(esc(s), _terms3) + '</div></div></div>';
          }).join('') + '</div>';
        }
      });
    }

    // Connection note: how words connect — ONCE per lesson
    var connNote = connectionNoteFor(act);
    if(connNote && !taughtKeys['connection']){
      newKeys['connection'] = true;
      html += '<div class="pel-teach-section">' + L('How words connect','كيف تتصل الكلمات') + '</div>';
      html += '<div class="pel-concept-steps">' + splitToSteps(connNote).map(function(s,i){
        return '<div class="pel-concept-step"><span class="pel-concept-num">' + (i+1) + '</span><div class="pel-concept-step-body"><div class="pel-concept-step-ar arabic">' + esc(s) + '</div></div></div>';
      }).join('') + '</div>';
    }

    // Store keys on this activity so future panels know what's been shown
    act._teachKeys = newKeys;

    html += '</div>';
    return html;
  }

  /* ---- 6. ACTIVITY RENDERERS ---- */
  const RENDERERS = {
    learn(inner, act, ctx){
      const it=act.item;
      const terms = collectTerms(act, ctx.s);
      // Progressive reveal: show English word + audio first, then reveal
      // the meaning. This forces the student to attempt recall before
      // seeing the answer, instead of passively reading everything.
      let revealed = false;
      const reveal = () => {
        if(revealed) return; revealed = true;
        const revealEl = inner.querySelector('#pelLearnReveal');
        if(revealEl){
          // Build examples section: show the primary example, then any
          // additional sentences from it.sentences (excluding duplicates of
          // the primary example). This gives the student multiple contexts
          // for how the word is used, not just one example.
          var examplesHtml = '';
          var shownKeys = {};
          if(it.example && it.example.en){
            var k1 = norm(it.example.en);
            shownKeys[k1] = true;
            examplesHtml += '<div class="pel-act-example">' +
              '<div class="ex-en">' + highlightImportant(esc(it.example.en), terms) + '</div>' +
              (it.example.translit ? '<div class="ex-tr">' + esc(it.example.translit) + '</div>' : '') +
              (it.example.ar ? '<div class="ex-ar arabic">' + highlightImportant(esc(it.example.ar), terms) + '</div>' : '') +
              '</div>';
          }
          if(it.sentences && it.sentences.length){
            var addedCount = 0;
            for(var si = 0; si < it.sentences.length && addedCount < 3; si++){
              var sent = it.sentences[si];
              if(!sent || !sent.en || sent.en === it.en) continue;
              var sk = norm(sent.en);
              if(shownKeys[sk]) continue;
              shownKeys[sk] = true;
              addedCount++;
              examplesHtml += '<div class="pel-act-example" style="margin-top:10px;">' +
                '<div class="ex-en">' + highlightImportant(esc(sent.en), terms) + '</div>' +
                (sent.translit ? '<div class="ex-tr">' + esc(sent.translit) + '</div>' : '') +
                (sent.ar ? '<div class="ex-ar arabic">' + highlightImportant(esc(sent.ar), terms) + '</div>' : '') +
                '</div>';
            }
          }
          // Rich teaching content (Saudi/Abha dialect) for this word
          var tc = teachingContentForWord(it.en);
          var tcHtml = '';
          if(tc){
            tcHtml += '<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">';
            if(tc.useWhen) tcHtml += '<div style="padding:8px 10px;background:rgba(34,197,94,.08);border-radius:8px;border-right:3px solid var(--success);"><div style="font-size:.72rem;color:var(--success);margin-bottom:3px;">' + L('Where to use','متى تستخدمها') + '</div><span class="arabic" style="font-size:.85rem;line-height:1.6;">' + esc(tc.useWhen) + '</span></div>';
            if(tc.dontUseWhen) tcHtml += '<div style="padding:8px 10px;background:rgba(210,92,92,.08);border-radius:8px;border-right:3px solid var(--danger);"><div style="font-size:.72rem;color:var(--danger);margin-bottom:3px;">' + L('Where NOT to use','متى لا تستخدمها') + '</div><span class="arabic" style="font-size:.85rem;line-height:1.6;">' + esc(tc.dontUseWhen) + '</span></div>';
            if(tc.commonMistake) tcHtml += '<div style="padding:8px 10px;background:rgba(245,158,11,.08);border-radius:8px;border-right:3px solid var(--gold);"><div style="font-size:.72rem;color:var(--gold);margin-bottom:3px;">' + L('Common mistake','خطا شايع') + '</div><span class="arabic" style="font-size:.85rem;line-height:1.6;">' + esc(tc.commonMistake) + '</span></div>';
            if(tc.howToAvoid) tcHtml += '<div style="padding:8px 10px;background:rgba(99,102,241,.08);border-radius:8px;border-right:3px solid #6366f1;"><div style="font-size:.72rem;color:#6366f1;margin-bottom:3px;">' + L('How to avoid','كيف تتجنبه') + '</div><span class="arabic" style="font-size:.85rem;line-height:1.6;">' + esc(tc.howToAvoid) + '</span></div>';
            if(tc.remember) tcHtml += '<div style="padding:8px 10px;background:rgba(212,175,55,.12);border-radius:8px;border:1px solid rgba(212,175,55,.25);"><div style="font-size:.72rem;color:var(--gold-soft);margin-bottom:3px;">' + L('Remember','احفظ') + '</div><span class="arabic" style="font-size:.9rem;font-weight:600;line-height:1.6;">' + esc(tc.remember) + '</span></div>';
            tcHtml += '</div>';
          }
          revealEl.innerHTML = `
            ${it.translit?`<div class="pel-act-translit">${esc(it.translit)}</div>`:''}
            ${it.ar?`<div class="pel-act-ar arabic">${highlightImportant(esc(it.ar), terms)}</div>`:''}
            ${examplesHtml}
            ${usageHtml(it.usage)}
            ${tcHtml}`;
          revealEl.classList.add('show');
        }
        // Switch button to "Got it"
        ctx.btn.innerHTML = L('Got it','فهمت');
        ctx.btn.disabled = false;
      };
      inner.innerHTML = `
        <div class="pel-act-en" dir="ltr">${highlightImportant(esc(it.en), terms)}</div>
        ${it.ipa?`<div class="pel-act-ipa">${esc(it.ipa)}</div>`:''}
        <button class="pel-act-play" id="pelLearnPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
        ${(function(){ var ph=pronunciationHint(it); return ph?'<div class="pel-pron-hint" style="margin-top:10px;padding:10px 14px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.25);border-radius:10px;"><div style="font-size:.78rem;color:var(--gold-soft);margin-bottom:4px;">'+Lt('Pronunciation tip','نصيحة النطق')+'</div><div class="arabic" style="font-size:.85rem;line-height:1.6;">'+esc(ph.ar)+'</div>'+(ph.avoid?'<div class="arabic" style="font-size:.78rem;color:var(--danger);margin-top:4px;">'+esc(ph.avoid)+'</div>':'')+'</div>':''; })()}
        <div id="pelLearnReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
      $('#pelLearnPlay').onclick = ()=>play(it.en,'en-US');
      ctx.self.ready(ctx, L('Show meaning','اعرض المعنى'), ()=>{
        if(!revealed){ reveal(); }
        else { ctx.self.next(); }
      });
    },
    learn_sentence(inner, act, ctx){
      const s=act.sentence||{};
      const terms = collectTerms(act, ctx.s);
      // Progressive reveal: show English sentence + audio first, then meaning.
      let revealed = false;
      const reveal = () => {
        if(revealed) return; revealed = true;
        const r = inner.querySelector('#pelSenReveal');
        if(r){
          r.innerHTML = `${s.translit?`<div class="pel-act-translit">${esc(s.translit)}</div>`:''}${s.ar?`<div class="pel-act-ar arabic">${highlightImportant(esc(s.ar), terms)}</div>`:''}`;
          r.classList.add('show');
        }
        ctx.btn.innerHTML = L('Continue','متابعة');
        ctx.btn.disabled = false;
      };
      inner.innerHTML = `
        <div class="pel-act-en" dir="ltr">${highlightImportant(esc(s.en), terms)}</div>
        <button class="pel-act-play" id="pelSenPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
        <div id="pelSenReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
      $('#pelSenPlay').onclick = ()=>play(s.en,'en-US');
      ctx.self.ready(ctx, L('Show meaning','اعرض المعنى'), ()=>{
        if(!revealed){ reveal(); }
        else { ctx.self.next(); }
      });
    },
    how_to_say(inner, act, ctx){
      const it=act.item;
      // "How to Say It" — the signature PEL feature. Shows the English word,
      // Arabic transliteration (how to pronounce it using Arabic letters),
      // and an audio button. This is what no other app offers Saudi learners.
      inner.innerHTML = `
        <div style="text-align:center;padding:8px 0 4px;">
          <div style="font-size:.78rem;color:var(--gold-soft);margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em;">${L('How to say it','كيف تنطقها')}</div>
          <div class="pel-act-en" dir="ltr" style="font-size:2rem;font-weight:700;font-family:'Fraunces',serif;letter-spacing:-.01em;">${esc(it.en)}</div>
          ${it.ipa?`<div class="pel-act-ipa">${esc(it.ipa)}</div>`:''}
          <div class="pel-act-translit" style="font-size:1.4rem;color:var(--gold-soft);margin-top:8px;font-weight:600;">${esc(it.translit||'')}</div>
          <div class="pel-act-ar arabic" style="font-size:1.3rem;margin-top:6px;">${esc(it.ar||'')}</div>
          <button class="pel-act-play" id="pelSayPlay" style="margin-top:14px;"><i data-lucide="volume-2" width="18" height="18"></i> ${L('Hear it','اسمعها')}</button>
        </div>`;
      const playBtn = $('#pelSayPlay');
      if(playBtn) playBtn.onclick = ()=>play(it.en,'en-US');
      // Auto-play on load so the student hears the pronunciation immediately
      try{ play(it.en,'en-US'); }catch(e){}
      ctx.self.ready(ctx, L('Got it','فهمت'), ()=>{ ctx.self.next(); });
    },
    recognize(inner, act, ctx){
      const it=act.item; const pool=(act.pool && act.pool.length>=3)?act.pool:[...(act.pool||[]), ...PEL_STARTER_ITEMS];
      // Distractors must be distinct from the answer AND from each other;
      // padding with PEL_STARTER_ITEMS used to surface the same meaning twice
      // (e.g. two "please" options next to "thank you").
      const _dd = pickDistractors(pool, it.en, 3);
      const opts = shuffle([it, ..._dd]).slice(0,4);
      let sel=null;
      const prompt = ar() ? `<span class="arabic">وش معنى <b dir="ltr">${esc(it.en)}</b>؟</span>` : `What does <b>${esc(it.en)}</b> mean?`;
      inner.innerHTML = `<div class="pel-act-prompt">${prompt}</div>
        <div class="pel-options" id="pelRecOpts">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}" data-choice-key="${esc(o.en)}"><span class="o-ar arabic">${esc(o.ar||'')}</span></button>`).join('')}</div>`;
      const btns = inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{
        btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i;
        ctx.btn.disabled=false;
      });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        var _selBtn = inner.querySelector('.pel-option.selected');
        sel = _selBtn ? [...btns].indexOf(_selBtn) : -1;
        const correct = opts[sel] && opts[sel].en===it.en;
        btns.forEach((b,i)=>{
          b.classList.remove('selected');
          if(opts[i].en===it.en){
            b.classList.add('correct');
            // Reveal the English word + transliteration AFTER answering -
            // showing it in the option pre-answer let students sound-match
            // the answer instead of recalling the meaning.
            b.insertAdjacentHTML('beforeend', `<span class="o-ar">${esc(opts[i].en)} · ${esc(opts[i].translit||'')}</span>`);
          } else if(i===sel) b.classList.add('wrong');
        });
        ctx.self.mark(ctx, correct);
      });
      ctx.btn.disabled = true;
    },
    match(inner, act, ctx){
      const its=act.items; const en=shuffle(its); const ar=shuffle(its);
      let pickEn=null, pickAr=null, matched=0; const total=its.length;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Match the pairs','طابق الازواج')}</div>
        <div class="pel-tiles" style="grid-template-columns:1fr 1fr;">
          <div id="pelMatchEn">${en.map((o,i)=>`<div class="pel-tile" data-en="${i}">${esc(o.en)}</div>`).join('')}</div>
          <div id="pelMatchAr">${ar.map((o,i)=>`<div class="pel-tile" data-ar="${i}"><span class="arabic">${esc(o.ar||'')}</span></div>`).join('')}</div>
        </div>`;
      const ens=inner.querySelectorAll('[data-en]'); const ars=inner.querySelectorAll('[data-ar]');
      const tryMatch=()=>{ if(pickEn===null||pickAr===null) return;
        const a=en[pickEn], b=ar[pickAr];
        if(a.en===b.en){ ens[pickEn].classList.add('matched'); ars[pickAr].classList.add('matched'); matched++; pickEn=pickAr=null;
          if(matched>=total){ ctx.btn.disabled=false; ctx.self.mark(ctx,true); }
        }else{ ens[pickEn].classList.remove('sel'); ars[pickAr].classList.remove('sel'); pickEn=pickAr=null; }
      };
      ens.forEach((el,i)=>el.onclick=()=>{ if(el.classList.contains('matched'))return; ens.forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); pickEn=i; tryMatch(); });
      ars.forEach((el,i)=>el.onclick=()=>{ if(el.classList.contains('matched'))return; ars.forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); pickAr=i; tryMatch(); });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>ctx.self.mark(ctx, matched>=total));
      ctx.btn.disabled = true; // re-gate: only enable when all pairs matched
    },
    arrange_words(inner, act, ctx){
      const s=act.sentence||{}; const words = (s.en||'').replace(/[.?!]/g,'').split(/\s+/).filter(Boolean);
      // Guard: if no words to arrange, show a skip message instead of blank
      if(words.length < 2){
        inner.innerHTML = '<div class="pel-act-prompt">' + L('Not enough words to build','ما في كلمات كافية للترتيب') + '</div>';
        ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next());
        return;
      }
      const tokens = shuffle(words);
      let placed=[];
      inner.innerHTML = `<div class="pel-act-prompt">${L('Build the sentence','رتب الجملة')}</div>
        <div class="pel-arrange-drop" id="pelArrDrop" data-ph="${Lt('Tap words below','اضغط الكلمات تحت')}"></div>
        <div class="pel-tokens" id="pelArrTk">${tokens.map((t,i)=>`<button class="pel-token" data-i="${i}">${esc(t)}</button>`).join('')}</div>
        <button class="btn-outline" id="pelArrHint" style="margin-top:14px;width:100%;">${L('Show hint','اعرض تلميح')}</button>
        <div id="pelArrHintReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
      const drop=$('#pelArrDrop'); const tk=$('#pelArrTk');
      const renderDrop=()=>{ drop.innerHTML = placed.map((t,i)=>`<button class="pel-token" data-pi="${i}">${esc(t)}</button>`).join('') || '';
        drop.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{ const idx=+b.dataset.pi; const tok=placed[idx]; placed.splice(idx,1); addTokenBack(tok); renderDrop(); });
        // Button gating: only enable when all words are placed
        ctx.btn.disabled = placed.length !== words.length;
      };
      const hintBtn=$('#pelArrHint'); const hintRev=$('#pelArrHintReveal');
      const addTokenBack=(tok)=>{ const i=tokens.indexOf(tok); const btn=document.createElement('button'); btn.className='pel-token'; btn.dataset.i=i; btn.textContent=tok; btn.onclick=()=>{ if(btn.disabled)return; btn.remove(); placed.push(tok); renderDrop(); }; tk.appendChild(btn); };
      if(hintBtn) hintBtn.onclick = () => {
        if(hintRev){
          hintRev.innerHTML = `<div class="pel-act-hint arabic" style="margin-top:14px;">${esc(s.ar||'')}</div>`;
          hintRev.classList.add('show');
          hintBtn.style.display = 'none';
        }
      };
      tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.remove(); placed.push(tokens[+b.dataset.i]); renderDrop(); });
      ctx.btn.disabled = true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        const built = placed.join(' ').toLowerCase().replace(/\s+/g,' ').trim();
        const target = s.en.replace(/[.?!]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
        ctx.self.mark(ctx, built===target);
      });
      ctx.btn.disabled = true;
    },
    fill_blank(inner, act, ctx){
      const it=act.item; const s=act.sentence|| (it.sentences && it.sentences[0]) ||{en:((it.example&&it.example.en)||it.en),ar:((it.example&&it.example.ar)||it.ar)};
      const words=s.en.replace(/[.?!]/g,'').split(/\s+/).filter(Boolean);
      // Use phrase-safe replacement for multi-word targets
      const target=it.en;
      const blanked=replaceTerm(s.en, target, '_____')||s.en;
      const blankParts=blanked.split('_____');
      const before=blankParts[0]||''; const after=blankParts[1]||'';
      const distractors=dedupeOpts(pickDistractors(itemsDistractor(act,it).map(function(x){return {en:typeof x==='string'?x:x.en};}), target, 2), 2);
      const opts=dedupeOpts(shuffle([target, ...distractors.map(function(d){return d.en;})]), 3);
      inner.innerHTML = `<div class="pel-act-prompt">${L('Complete the sentence','كمل الجملة')}</div>
        <div style="font-size:1.15rem;line-height:1.9;" dir="ltr">${esc(before)} <span id="pelFillSlot" style="display:inline-block;min-width:90px;border-bottom:2px solid var(--gold);text-align:center;color:var(--gold);">?</span> ${esc(after)}</div>
        <div class="pel-options" style="margin-top:18px;">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}" data-choice-key="${esc(o)}"><span class="o-en">${esc(o)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option'); const slot=$('#pelFillSlot'); let sel=null;
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=b.textContent.trim(); slot.textContent=sel; ctx.btn.disabled=false; });
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ var _selBtn=inner.querySelector('.pel-option.selected'); sel=_selBtn?_selBtn.textContent.trim():''; btns.forEach((b,i)=>{ if(b.textContent.trim()===target) b.classList.add('correct'); else if(b.textContent.trim()===sel) b.classList.add('wrong'); }); ctx.self.mark(ctx, norm(sel)===norm(target)); });
      ctx.btn.disabled = true;
    },
    spell(inner, act, ctx){
      // Scrambled letters: student taps letters in order to spell the word.
      // No typing required — works for students who can't type on a keyboard.
      // Multi-word items (e.g. "Thank you"): spaces are dropped from the
      // letter tiles and from the target so the student spells the letters
      // only — "thankyou" === "thankyou" — no invisible space tile.
      const it=act.item;
      const letters = (it.en||'').replace(/\s+/g,'').split('');
      const scrambled = shuffle(letters);
      let placed = [];
      inner.innerHTML = `<div class="pel-act-prompt">${L('Spell the word','اهجّ الكلمة')}</div>
        <div class="pel-act-ar arabic" style="font-size:1.6rem;">${esc(it.ar||'')}</div>
        <div class="pel-act-hint">${L('Tap the letters in order','اضغط الحروف بالترتيب')}</div>
        <div id="pelSpellDrop" class="pel-arrange-drop" data-ph="${Lt('Tap letters below','اضغط الحروف تحت')}" style="margin-top:14px;min-height:50px;"></div>
        <div id="pelSpellTk" class="pel-tokens" style="margin-top:10px;">${scrambled.map((t,i)=>`<button class="pel-token" data-i="${i}" style="min-width:40px;font-size:1.2rem;text-transform:lowercase;">${esc(t)}</button>`).join('')}</div>
        <button class="btn-outline" id="pelSpellClear" style="margin-top:10px;width:100%;">${L('Clear','مسح')}</button>`;
      const drop=$('#pelSpellDrop'); const tk=$('#pelSpellTk');
      const renderDrop=()=>{ drop.innerHTML = placed.map((t,i)=>`<button class="pel-token" data-pi="${i}" style="min-width:40px;font-size:1.2rem;text-transform:lowercase;">${esc(t)}</button>`).join('')||''; 
        drop.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{ const idx=+b.dataset.pi; placed.splice(idx,1); renderDrop(); reEnable(); });
        // Button gating: only enable when all letters are placed
        ctx.btn.disabled = placed.length !== letters.length;
      };
      const reEnable=()=>{ 
        // Re-enable only tiles whose letter still has available copies.
        var usedCount={}; placed.forEach(function(c){ usedCount[c]=(usedCount[c]||0)+1; });
        var availCount={}; letters.forEach(function(c){ availCount[c]=(availCount[c]||0)+1; });
        tk.querySelectorAll('.pel-token').forEach(function(b){ 
          var letter = scrambled[+b.dataset.i];
          var used = usedCount[letter] || 0;
          var total = availCount[letter] || 0;
          if(used < total){ b.disabled=false; b.style.opacity='1'; }
        });
      };
      tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.disabled=true; b.style.opacity='0.3'; placed.push(scrambled[+b.dataset.i]); renderDrop(); });
      $('#pelSpellClear').onclick=()=>{ placed=[]; renderDrop(); reEnable(); ctx.btn.disabled=true; };
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        const built = placed.join('').toLowerCase();
        const target = it.en.toLowerCase().replace(/\s+/g,'');
        ctx.self.mark(ctx, built===target);
      });
      ctx.btn.disabled = true;
    },
    translate(inner, act, ctx){
      // Multiple choice: pick the English word for the Arabic meaning.
      // No typing required.
      const it=act.item;
      const distractors = dedupeOpts(shuffle(itemsDistractor(act, it)), 3);
      const opts = dedupeOpts(shuffle([it.en, ...distractors]), 4);
      let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('What is this in English?','وش هذا بالانجليزي؟')}</div>
        <div class="pel-act-ar arabic" style="font-size:1.5rem;">${esc(it.ar||'')}</div>
        <div class="pel-options" style="margin-top:18px;">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}" data-choice-key="${esc(o)}"><span class="o-en">${esc(o)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=b.textContent.trim(); ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        var _selBtn=inner.querySelector('.pel-option.selected'); sel=_selBtn?_selBtn.textContent.trim():'';
        btns.forEach(b=>{ if(norm(b.textContent)===norm(it.en)) b.classList.add('correct'); else if(norm(b.textContent)===norm(sel)) b.classList.add('wrong'); });
        ctx.self.mark(ctx, norm(sel)===norm(it.en));
      });
      ctx.btn.disabled = true;
    },
    listen(inner, act, ctx){
      const it=act.item;
      // Gate: the student must actually press Play before they can continue.
      // Otherwise this activity is a free pass that teaches nothing.
      let played=false;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Listen carefully','انصح باهتمام')}</div>
        <button class="pel-act-play" id="pelLsnPlay" style="font-size:1.1rem;padding:16px 26px;"><i data-lucide="volume-2" width="20" height="20"></i> ${L('Play','تشغيل')}</button>
        <div class="pel-act-hint">${L('Tap play and listen. You will identify it next.','اضغط تشغيل واصغي. بتحددها بعد.')}</div>`;
      var _heard = heardTargetFor(it);
      $('#pelLsnPlay').onclick=()=>{ played=true; $('#pelLsnPlay').classList.add('pel-played'); play(_heard.text,'en-US'); ctx.btn.disabled=false; };
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next());
      // ready() re-enables the button - re-gate it behind Play.
      ctx.btn.disabled = !played;
    },
    identify_heard(inner, act, ctx){
      const it=act.item; const pool=(act.pool && act.pool.length>=3)?act.pool:[...(act.pool||[]),...PEL_STARTER_ITEMS].slice(0,4);
      // Dedupe distractors by norm() - same as recognize, so we never show
      // the same meaning twice (e.g. two "please" options).
      const _dd = pickDistractors(pool, it.en, 3);
      // Determine the audio text using the shared helper (consistent with listen).
      var _heard = heardTargetFor(it);
      var audioText = _heard.text;
      var useSentenceMode = _heard.sentenceMode;
      // Build option objects: {display, key, ok, ar, translit}
      var opts;
      if(useSentenceMode){
        // Sentence-variant mode: substitute the target word with short distractors.
        var shortDistr = _dd.filter(function(d){ return isShortChoice(d.en); }).slice(0,3);
        // If not enough short distractors, pad from a common set.
        if(shortDistr.length < 2){
          var pads = ['yes','no','not','today','now'];
          pads.forEach(function(p){
            if(shortDistr.length < 3 && norm(p) !== norm(it.en)){ shortDistr.push({en:p, ar:'', translit:''}); }
          });
        }
        var variants = [{ display: audioText, key: it.en, ok: true, ar: (it.ar||''), translit: (it.translit||'') }];
        var _vseen = {}; _vseen[norm(audioText)] = true;
        shortDistr.forEach(function(d){
          var replaced = replaceTerm(audioText, it.en, d.en);
          if(replaced && !_vseen[norm(replaced)]){
            _vseen[norm(replaced)] = true;
            variants.push({ display: replaced, key: d.en, ok: false, ar: (d.ar||''), translit: (d.translit||'') });
          }
        });
        // If we couldn't build enough variants, fall back to word mode.
        if(variants.length >= 2){
          opts = shuffle(variants).slice(0, Math.min(4, variants.length));
        } else {
          useSentenceMode = false;
        }
      }
      if(!useSentenceMode){
        // Word mode: original behaviour — isolated vocab choices.
        opts = shuffle([it, ..._dd]).slice(0,4).map(function(o){
          return { display: o.en, key: o.en, ok: norm(o.en)===norm(it.en), ar: (o.ar||''), translit: (o.translit||'') };
        });
        audioText = it.en; // play the word, not a sentence we can't match
      }
      let sel=null;
      var optsHtml = opts.map(function(o, i){
        var hl = useSentenceMode ? highlightChoice(o.display, o.key) : esc(o.display);
        return '<button class="pel-option" data-i="'+i+'" data-choice-key="'+esc(o.key)+'"><span class="o-en">'+hl+'</span></button>';
      }).join('');
      inner.innerHTML = '<div class="pel-act-prompt">'+L('What did you hear?','وش سمعت؟')+'</div>'+
        '<button class="pel-act-play" id="pelIdPlay"><i data-lucide="volume-2" width="16" height="16"></i> '+L('Play again','شغل ثانية')+'</button>'+
        '<div class="pel-options" id="pelIdOpts" style="margin-top:16px;">'+optsHtml+'</div>';
      const _audio = audioText;
      $('#pelIdPlay').onclick=()=>play(_audio,'en-US');
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i; ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ var _selBtn=inner.querySelector('.pel-option.selected'); sel=_selBtn?[...btns].indexOf(_selBtn):-1; var correct=opts[sel]&&opts[sel].ok; btns.forEach((b,i)=>{ if(opts[i].ok){ b.classList.add('correct'); var sub=opts[i].ar||opts[i].translit||''; if(sub) b.insertAdjacentHTML('beforeend', '<span class="o-ar arabic">'+esc(sub)+'</span>'); } else if(i===sel) b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
      ctx.btn.disabled = true;
      // ready() re-enables the button - re-gate it behind selection.
      ctx.btn.disabled = true;
    },
    pronunciation(inner, act, ctx){
      const it=act.item;
      // Mic is the primary path. The "I said it" self-pass button was removed
      // because students could tap through without saying anything.
      // Check button stays disabled until the student actually uses the mic.
      // If speech recognition is unavailable, Check stays enabled as fallback.
      const canRec = (typeof canRecognize==='function') ? canRecognize() : false;
      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Pronounce the word','انطق الكلمة')}</div>
        <div class="pel-act-en" dir="ltr">${esc(it.en)}</div>
        <div class="pel-act-translit">${esc(it.translit||'')}</div>
        ${it.ipa?`<div class="pel-act-ipa">${esc(it.ipa)}</div>`:''}
        <button class="pel-act-play" id="pelProPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
        <div style="margin-top:10px;padding:10px 14px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.15);border-radius:10px;text-align:center;"><span class="arabic" style="font-size:.85rem;color:var(--success);line-height:1.6;">${L('Take your time — no one hears you but the app. Mistakes are how we learn.','خذ راحتك، محد يسمعك الا الموقع. الغلط عادي، هذا كيف نتعلم.')}</span></div>
        ${(function(){ var ph=pronunciationHint(it); return ph?'<div class="pel-pron-hint" style="margin-top:10px;padding:10px 14px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.25);border-radius:10px;"><div style="font-size:.78rem;color:var(--gold-soft);margin-bottom:4px;">'+Lt('Pronunciation tip','نصيحة النطق')+'</div><div class="arabic" style="font-size:.85rem;line-height:1.6;">'+esc(ph.ar)+'</div>'+(ph.avoid?'<div class="arabic" style="font-size:.78rem;color:var(--danger);margin-top:4px;">'+esc(ph.avoid)+'</div>':'')+'</div>':''; })()}
        <div id="pelProMicWrap" style="margin-top:16px;">
          ${canRec ? `<button class="pel-act-play pel-mic-btn" id="pelProMic" style="width:100%;background:rgba(210,92,92,.16);border-color:rgba(210,92,92,.4);color:var(--danger);"><i data-lucide="mic" width="16" height="16"></i> ${L('Speak now','انطق الحين')}</button>
            <div id="pelProFb" class="pel-mic-feedback" style="margin-top:12px;"></div>
            <div class="pel-act-hint">${L('Press the button and say the word clearly.','اضغط الزر وانطق الكلمة بوضوح.')}</div>`
          : `<div class="pel-act-hint">${L('Say it out loud, then tap Check.','نطقها بصوت عالي، بعدها اضغط تحقق.')}</div>`}
        </div>
        <div id="pelProReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
      $('#pelProPlay').onclick = ()=>play(it.en,'en-US');
      const revealAr = () => {
        const r = inner.querySelector('#pelProReveal');
        if(r){
          r.innerHTML = `<div class="pel-act-ar arabic" style="margin-top:12px;">${esc(it.ar||'')}</div>`;
          r.classList.add('show');
        }
      };
      if(canRec){
        const micBtn=$('#pelProMic'); const fb=$('#pelProFb');
        micBtn.onclick = () => {
          if(typeof recordAndScore !== 'function'){ ctx.btn.disabled=false; revealAr(); ctx.self.mark(ctx, true); return; }
          micBtn.classList.add('recording');
          fb.innerHTML = `<div class="pel-act-hint">${L('Listening...','استمع...')}</div>`;
          recordAndScore((heard, score, err)=>{
            micBtn.classList.remove('recording');
            revealAr();
            ctx.btn.disabled=false; // Enable Check after mic attempt
            if(err){
              fb.innerHTML = `<div class="pel-act-hint" style="color:var(--gold);">${typeof micErrorMessage==='function'?esc(micErrorMessage(err)):L('Mic error','خطا بالمايك')}</div><div class="pel-act-hint">${L('Try again, or tap Check to continue.','حاول ثانية، او اضغط تحقق للمتابعة.')}</div>`;
              return;
            }
            const pf = (typeof pronFeedback==='function') ? pronFeedback(heard, it.en) : {score};
            const sc = (pf.score != null ? pf.score : score);
            const ok = sc != null && sc >= 40;
            const tip = ar() ? pf.tipAr : pf.tipEn;
            // Encouragement messages based on score — reduces speaking anxiety
            // Research: 100% of Saudi EFL learners report speaking anxiety
            // Ref: https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf
            let enc = '';
            if(sc != null){
              if(sc < 40) enc = `<div class="pel-act-hint arabic" style="color:var(--text-muted);">الغلط عادي، هذا كيف نتعلم. حاول مرة ثانية.</div>`;
              else if(sc < 70) enc = `<div class="pel-act-hint arabic" style="color:var(--text-muted);">كويس! قربت من النطق الصح. حاول مرة ثانية.</div>`;
              else if(sc < 90) enc = `<div class="pel-act-hint arabic" style="color:var(--success);">احسنت! نطقك صار احسن. كمل.</div>`;
              else enc = `<div class="pel-act-hint arabic" style="color:var(--success);">ممتاز! نطقك طبيعي.</div>`;
            }
            fb.innerHTML = `<div style="font-size:1.25rem; font-weight:700; color:${ok?'var(--success)':'var(--gold)'};">${sc!=null?sc:'-'}% ${ok?'✓':'×'}</div>`
              + (heard?`<div class="pel-act-hint">${L('Heard','سمعت')}: ${esc(heard)}</div>`:'')
              + (tip?`<div class="pel-act-hint arabic">${esc(tip)}</div>`:'')
              + enc
              + (!ok?`<div class="pel-act-hint">${L('Try again, or tap Check to continue.','حاول ثانية، او اضغط تحقق للمتابعة.')}</div>`:'');
            ctx.self.mark(ctx, ok);
          }, it.en, micBtn);
        };
        ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ revealAr(); ctx.self.mark(ctx, true); });
        ctx.btn.disabled = true; // Must use mic first
      } else {
        ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ revealAr(); ctx.self.mark(ctx, true); });
      }
    },
    speaking(inner, act, ctx){
      const s=act.sentence||{};
      // Mic is the primary path. The "I said it" self-pass button was removed.
      // Check button stays disabled until the student actually uses the mic.
      const canRec = (typeof canRecognize==='function') ? canRecognize() : false;
      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Say the sentence','نطق الجملة')}</div>
        <div class="pel-act-en" dir="ltr">${esc(s.en||'')}</div>
        <div class="pel-act-translit">${esc(s.translit||'')}</div>
        <button class="pel-act-play" id="pelSpkPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
        <div style="margin-top:10px;padding:10px 14px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.15);border-radius:10px;text-align:center;"><span class="arabic" style="font-size:.85rem;color:var(--success);line-height:1.6;">${L('Take your time — no one hears you but the app. Mistakes are how we learn.','خذ راحتك، محد يسمعك الا الموقع. الغلط عادي، هذا كيف نتعلم.')}</span></div>
        <div id="pelSpkMicWrap" style="margin-top:16px;">
          ${canRec ? `<button class="pel-act-play pel-mic-btn" id="pelSpkMic" style="width:100%;background:rgba(210,92,92,.16);border-color:rgba(210,92,92,.4);color:var(--danger);"><i data-lucide="mic" width="16" height="16"></i> ${L('Speak now','انطق الحين')}</button>
            <div id="pelSpkFb" class="pel-mic-feedback" style="margin-top:12px;"></div>
            <div class="pel-act-hint">${L('Press the button and say the sentence clearly.','اضغط الزر وانطق الجملة بوضوح.')}</div>`
          : `<div class="pel-act-hint">${L('Say it out loud, then tap Check.','نطقها بصوت عالي، بعدها اضغط تحقق.')}</div>`}
        </div>
        <div id="pelSpkReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
      $('#pelSpkPlay').onclick = ()=>play(s.en,'en-US');
      const revealAr = () => {
        const r = inner.querySelector('#pelSpkReveal');
        if(r){
          r.innerHTML = `<div class="pel-act-ar arabic" style="margin-top:12px;">${esc(s.ar||'')}</div>`;
          r.classList.add('show');
        }
      };
      if(canRec){
        const micBtn=$('#pelSpkMic'); const fb=$('#pelSpkFb');
        micBtn.onclick = () => {
          if(typeof recordAndScore !== 'function'){ ctx.btn.disabled=false; revealAr(); ctx.self.mark(ctx, true); return; }
          micBtn.classList.add('recording');
          fb.innerHTML = `<div class="pel-act-hint">${L('Listening...','استمع...')}</div>`;
          recordAndScore((heard, score, err)=>{
            micBtn.classList.remove('recording');
            revealAr();
            ctx.btn.disabled=false; // Enable Check after mic attempt
            if(err){
              fb.innerHTML = `<div class="pel-act-hint" style="color:var(--gold);">${typeof micErrorMessage==='function'?esc(micErrorMessage(err)):L('Mic error','خطا بالمايك')}</div><div class="pel-act-hint">${L('Try again, or tap Check to continue.','حاول ثانية، او اضغط تحقق للمتابعة.')}</div>`;
              return;
            }
            const pf = (typeof pronFeedback==='function') ? pronFeedback(heard, s.en) : {score};
            const sc = (pf.score != null ? pf.score : score);
            const ok = sc != null && sc >= 40;
            const tip = ar() ? pf.tipAr : pf.tipEn;
            // Encouragement messages — reduces speaking anxiety
            // Research: 100% of Saudi EFL learners report speaking anxiety
            // Ref: https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf
            let enc = '';
            if(sc != null){
              if(sc < 40) enc = `<div class="pel-act-hint arabic" style="color:var(--text-muted);">الغلط عادي، هذا كيف نتعلم. حاول مرة ثانية.</div>`;
              else if(sc < 70) enc = `<div class="pel-act-hint arabic" style="color:var(--text-muted);">كويس! قربت من النطق الصح. حاول مرة ثانية.</div>`;
              else if(sc < 90) enc = `<div class="pel-act-hint arabic" style="color:var(--success);">احسنت! نطقك صار احسن. كمل.</div>`;
              else enc = `<div class="pel-act-hint arabic" style="color:var(--success);">ممتاز! نطقك طبيعي.</div>`;
            }
            fb.innerHTML = `<div style="font-size:1.25rem; font-weight:700; color:${ok?'var(--success)':'var(--gold)'};">${sc!=null?sc:'-'}% ${ok?'✓':'×'}</div>`
              + (heard?`<div class="pel-act-hint">${L('Heard','سمعت')}: ${esc(heard)}</div>`:'')
              + (tip?`<div class="pel-act-hint arabic">${esc(tip)}</div>`:'')
              + enc
              + (!ok?`<div class="pel-act-hint">${L('Try again, or tap Check to continue.','حاول ثانية، او اضغط تحقق للمتابعة.')}</div>`:'');
            ctx.self.mark(ctx, ok);
          }, s.en, micBtn);
        };
        ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ revealAr(); ctx.self.mark(ctx, true); });
        ctx.btn.disabled = true; // Must use mic first
      } else {
        ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ revealAr(); ctx.self.mark(ctx, true); });
      }
    },
    conversation_response(inner, act, ctx){
      const conv=act.conv||[]; const i=act.idx||0; const line=conv[i]; const reply=conv[i+1];
      // Defensive guard: short dialogue (no next line) would throw on reply.en.
      if(!line || !reply){ ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next()); return; }
      const distractors=dedupeOpts(pickDistractors(conv.filter(function(c,j){return j!==i&&j!==i+1;}).map(function(c){return {en:c.en};}), reply.en, 2).map(function(d){return d.en;}), 2);
      const opts=dedupeOpts(shuffle([reply.en, ...distractors]), 4); let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Reply naturally','رد بشكل طبيعي')}</div>
        <div class="pel-conv"><div class="pel-conv-line ${line.who}"><div dir="ltr">${esc(line.en)}</div><div class="tr arabic">${esc(line.ar)}</div></div></div>
        <div class="pel-options" style="margin-top:16px;">${opts.map((o,k)=>`<button class="pel-option" data-i="${k}" data-choice-key="${esc(o)}"><span class="o-en">${esc(o)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=b.textContent.trim(); ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ var _selBtn=inner.querySelector('.pel-option.selected'); sel=_selBtn?_selBtn.textContent.trim():''; const correct=norm(sel)===norm(reply.en); btns.forEach(b=>{ if(norm(b.textContent)===norm(reply.en))b.classList.add('correct'); else if(norm(b.textContent)===norm(sel))b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
      ctx.btn.disabled = true;
    },
    complete_dialogue(inner, act, ctx){
      const conv=act.conv||[]; const gap=act.gap||0; const target=conv[gap]||{};
      const pool=(act.pool&&act.pool.length)?act.pool:PEL_STARTER_ITEMS;
      const opts=dedupeOpts(shuffle([target.en, ...pickDistractors(pool, target.en, 2).map(function(p){return p.en;})]), 3); let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Complete the dialogue','كمل المحادثة')}</div>
        <div class="pel-conv">${conv.map((c,j)=> j===gap ? `<div class="pel-conv-line pel-conv-gap">${L('...','...')}</div>` : `<div class="pel-conv-line ${c.who||''}"><div dir="ltr">${esc(c.en||'')}</div><div class="tr arabic">${esc(c.ar||'')}</div></div>`).join('')}</div>
        <div class="pel-options" style="margin-top:16px;">${opts.map((o,k)=>`<button class="pel-option" data-i="${k}" data-choice-key="${esc(o)}"><span class="o-en">${esc(o)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=b.textContent.trim(); ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ var _selBtn=inner.querySelector('.pel-option.selected'); sel=_selBtn?_selBtn.textContent.trim():''; const correct=norm(sel)===norm(target.en); btns.forEach(b=>{ if(norm(b.textContent)===norm(target.en))b.classList.add('correct'); else if(norm(b.textContent)===norm(sel))b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
      ctx.btn.disabled = true;
    },
    grammar_correction(inner, act, ctx){
      // Multiple choice: pick the correct sentence from two options.
      // No typing required.
      const it=act.item; const correct=(it.sentences && it.sentences[0])||{en:((it.example&&it.example.en)||it.en),ar:((it.example&&it.example.ar)||it.ar)};
      const wrong=act.wrong||correct.en;
      const opts = shuffle([{text:wrong, ok:false}, {text:correct.en, ok:true}]);
      let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Which sentence is correct?','اي جملة صح؟')}</div>
        <div class="pel-act-hint arabic">${esc(correct.ar||'')}</div>
        <div class="pel-options" style="margin-top:14px;">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}" data-choice-key="${esc(o.text)}" dir="ltr"><span class="o-en">${esc(o.text)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i; ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        var _selBtn=inner.querySelector('.pel-option.selected'); sel=_selBtn?[...btns].indexOf(_selBtn):-1;
        var correctIdx = opts.findIndex(function(o){ return o.ok; });
        btns.forEach((b,i)=>{ if(opts[i].ok) b.classList.add('correct'); else if(i===sel) b.classList.add('wrong'); });
        ctx.self.mark(ctx, sel>=0 && opts[sel].ok);
      });
      ctx.btn.disabled = true;
    },
    choose_natural_expression(inner, act, ctx){
      const q=(act.quiz&&act.quiz[0])||{}; const opts=(q.options||[]);
      // DB choose exercises map options to objects {t,tr,ok}; authored ones
      // use plain strings with a numeric `correct`. Support both so we never
      // render "[object Object]" for the 319 DB lessons that have a quiz.
      let correctIdx = (typeof q.correct === 'number') ? q.correct : opts.findIndex(o => (typeof o==='object' && o && o.ok));
      if(correctIdx < 0) correctIdx = 0;
      let sel=null;
      // Render question explicitly from qEn/qAr/qTr (DB) or fallback to q.q (authored)
      var qHtml = q.qEn
        ? esc(q.qEn) + (q.qAr ? `<div class="pel-act-ar arabic" style="font-size:.9rem;font-weight:400;margin-top:4px;">${esc(q.qAr)}</div>` : '') + (q.qTr ? `<div class="pel-act-translit" style="font-size:.82rem;">${esc(q.qTr)}</div>` : '')
        : esc(q.q || '');

      // ---- Contextualize short options into full-sentence variants ----
      // If options are single words / short phrases, embed them into the
      // question sentence so the student sees them in context.
      var qPlain = plainQuizText(q);
      var contextualOpts = null; // array of {display, key, sub, idx}
      var allLong = opts.every(function(o){ return wordCount(optText(o)) >= 3; });
      if(!allLong && opts.length >= 2 && qPlain){
        // Case 1: question has a blank (___, ..., [blank])
        var blankMatch = qPlain.match(/^(.+?)\s*(?:___+|\.{3}|\u2026|\[blank\])\s*(.*)$/i);
        if(blankMatch){
          contextualOpts = opts.map(function(o, i){
            var text = optText(o);
            var filled = blankMatch[1] + ' ' + text + (blankMatch[2] ? ' ' + blankMatch[2] : '');
            return { display: filled.trim(), key: text, sub: optSub(o), idx: i };
          });
        } else {
          // Case 2: extract the first sentence before instruction text
          // ("Which...", "What...", "Pick...", "Choose...")
          var sentMatch = qPlain.match(/^([^.!?]+[.!?])/);
          if(sentMatch){
            var baseSentence = sentMatch[1].trim();
            // Only substitute if the correct option already appears in the sentence
            var correctText = optText(opts[correctIdx]);
            // Verify the correct text can actually be substituted (contiguous match)
            if(replaceTerm(baseSentence, correctText, correctText)){
              contextualOpts = opts.map(function(o, i){
                var text = optText(o);
                var variant = replaceTerm(baseSentence, correctText, text);
                if(!variant) variant = baseSentence; // fallback: show original
                return { display: variant, key: text, sub: optSub(o), idx: i };
              });
            }
          }
        }
      }

      // Build option buttons
      var optsHtml;
      if(contextualOpts){
        optsHtml = contextualOpts.map(function(co, i){
          return '<button class="pel-option" data-i="'+i+'" data-choice-key="'+esc(co.key)+'"><span class="o-en">'+highlightChoice(co.display, co.key)+'</span></button>';
        }).join('');
      } else {
        optsHtml = opts.map(function(o, i){
          var text = optText(o);
          return '<button class="pel-option" data-i="'+i+'" data-choice-key="'+esc(text)+'"><span class="o-en">'+esc(text)+'</span></button>';
        }).join('');
      }

      inner.innerHTML = `<div class="pel-act-prompt">${L('Choose the natural one','اختر الطبيعي')}</div>`+
        `<div style="font-size:1.1rem;margin-bottom:14px;">${qHtml}</div>`+
        `<div class="pel-options">${optsHtml}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i; ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        var _selBtn=inner.querySelector('.pel-option.selected');
        sel=_selBtn?[...btns].indexOf(_selBtn):-1;
        const correct=sel===correctIdx;
        btns.forEach((b,i)=>{
          if(i===correctIdx){
            b.classList.add('correct');
            var sub = contextualOpts ? (contextualOpts[i].sub||'') : optSub(opts[i]);
            if(sub) b.insertAdjacentHTML('beforeend', `<span class="o-ar arabic">${esc(sub)}</span>`);
          } else if(i===sel) b.classList.add('wrong');
        });
        ctx.self.mark(ctx,correct);
      });
      ctx.btn.disabled = true;
      // ready() re-enables the button - re-gate it behind selection.
      ctx.btn.disabled = true;
    },
    listening_dictation(inner, act, ctx){
      // LISTENING DICTATION - hear the sentence, then tap words in order.
      // No typing required — students arrange scrambled words.
      const s = act.sentence || {};
      const words = (s.en||'').replace(/[.?!]/g,'').split(/\s+/).filter(Boolean);
      const tokens = shuffle(words);
      let placed = [];
      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Listen and arrange','اسمع ورتب')}</div>
        <button class="pel-act-play" id="pelDicPlay" style="width:100%;"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Play the sentence','شغل الجملة')}</button>
        <div class="pel-arrange-drop" id="pelDicDrop" data-ph="${Lt('Tap words below','اضغط الكلمات تحت')}" style="margin-top:14px;"></div>
        <div class="pel-tokens" id="pelDicTk" style="margin-top:10px;">${tokens.map((t,i)=>`<button class="pel-token" data-i="${i}">${esc(t)}</button>`).join('')}</div>`;
      const drop=$('#pelDicDrop'); const tk=$('#pelDicTk');
      const renderDrop=()=>{ drop.innerHTML = placed.map((t,i)=>`<button class="pel-token" data-pi="${i}">${esc(t)}</button>`).join('')||'';
        drop.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{ const idx=+b.dataset.pi; const tok=placed[idx]; placed.splice(idx,1); addBack(tok); renderDrop(); });
        // Button gating: only enable when all words are placed
        ctx.btn.disabled = placed.length !== words.length;
      };
      const addBack=(tok)=>{ const btn=document.createElement('button'); btn.className='pel-token'; btn.textContent=tok; btn.onclick=()=>{ if(btn.disabled)return; btn.remove(); placed.push(tok); renderDrop(); }; tk.appendChild(btn); };
      tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.remove(); placed.push(tokens[+b.dataset.i]); renderDrop(); });
      let plays = 0;
      $('#pelDicPlay').onclick = ()=>{ plays++; play(s.en,'en-US'); };
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        const built = norm(placed.join(' '));
        const target = norm(s.en.replace(/[.?!]/g,''));
        ctx.self.mark(ctx, built===target);
      });
      ctx.btn.disabled = true;
      // auto-play once on entry so the student hears the task
      setTimeout(()=>{ if(plays===0 && s.en){
        play(s.en,'en-US');
        var playBtn = $('#pelDicPlay');
        if(playBtn){ playBtn.classList.add('pel-played'); plays = 1; }
      } }, 350);
    },
    guided_production(inner, act, ctx){
      // GUIDED PRODUCTION - the bridge between controlled practice
      // (arrange/fill_blank) and free_response: Arabic meaning shown, the
      // English sentence with the KEY WORD blanked, and the student must
      // pick the right word from a small bank to complete it.
      const s = act.sentence || {}; const it = act.item || {};
      if(!it || !it.en){ ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next()); return; }
      const key = (it && it.en && s.en && new RegExp('\\b'+it.en.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i').test(s.en)) ? it.en
        : (s.en ? (s.en.split(/\s+/).find(w=>w.replace(/[^a-zA-Z']/g,'').length>2) || s.en) : (it.en||''));
      const blanked = s.en ? s.en.replace(new RegExp('\\b'+key.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i'), '____') : '____';
      const vocabPool = ((Stage.state && Stage.state.lesson && Stage.state.lesson.vocab) || []).map(v=>v.en).filter(e=>e && norm(e)!==norm(key));
      // Pad with PEL_STARTER_ITEMS if vocab pool is too small
      var _gpDistractors = vocabPool.slice();
      if(_gpDistractors.length < 2){
        PEL_STARTER_ITEMS.forEach(function(s){ if(s && s.en && _gpDistractors.length < 3 && norm(s.en)!==norm(key) && _gpDistractors.indexOf(s.en)===-1) _gpDistractors.push(s.en); });
      }
      const bank = dedupeOpts(shuffle([key, ...pickDistractors(_gpDistractors.map(function(s){return {en:s};}), key, 2).map(function(d){return d.en;})]), 3);
      let sel=null;
      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Complete the sentence','كمل الجملة')}</div>
        <div class="pel-act-ar arabic" style="font-size:1.3rem;">${esc(s.ar||it.ar||'')}</div>
        <div class="pel-act-en" style="margin-top:12px;">${esc(blanked)}</div>
        <div class="pel-options" style="margin-top:14px;">${bank.map((w,i)=>`<button class="pel-option" data-i="${i}" data-choice-key="${esc(w)}">${esc(w)}</button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=b.textContent; ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        var _selBtn = inner.querySelector('.pel-option.selected');
        sel = _selBtn ? _selBtn.textContent : '';
        const ok = sel && norm(sel)===norm(key);
        btns.forEach(b=>{ if(norm(b.textContent)===norm(key)) b.classList.add('correct'); else if(b.textContent===sel) b.classList.add('wrong'); });
        const fb=document.createElement('div'); fb.className='pel-act-hint'; fb.style.marginTop='12px';
        fb.innerHTML = `<div class="pel-act-en" dir="ltr">${esc(s.en||key)}</div>${s.translit?`<div class="pel-act-translit">${esc(s.translit)}</div>`:''}`;
        inner.appendChild(fb);
        ctx.self.mark(ctx, ok);
      });
      ctx.btn.disabled = true;
    },
    free_response(inner, act, ctx){
      // WORD BANK: student taps words to build a sentence using the target word.
      // No typing required.
      const it=act.item||{};
      let revealed = false;
      // Build a word bank from the target word + its example sentence words
      // + a few distractor words from lesson vocab.
      var exampleWords = (it.example && it.example.en) ? it.example.en.replace(/[.?!]/g,'').split(/\s+/).filter(Boolean) : [];
      var bankWords = [it.en].concat(exampleWords.filter(function(w){ return norm(w) !== norm(it.en); }));
      // Add distractors from lesson vocab
      var lv = (Stage.state && Stage.state.lesson && Stage.state.lesson.vocab) || [];
      lv.forEach(function(v){ if(v && v.en && bankWords.length < 12 && !bankWords.some(function(b){ return norm(b)===norm(v.en); })) bankWords.push(v.en); });
      var bank = shuffle(bankWords.slice(0, 10));
      var placed = [];
      const prompt = ar() ? `كون جملة باستخدام كلمة <b>${esc(it.en)}</b>` : `Build a sentence using <b>${esc(it.en)}</b>`;
      inner.innerHTML = `<div class="pel-act-prompt">${prompt}</div>
        <div class="pel-act-ar arabic" style="font-size:1.4rem;">${esc(it.ar||'')}</div>
        <div class="pel-act-hint">${L('Tap words below to build your sentence','اضغط الكلمات تحت عشان تبني جملتك')}</div>
        <div class="pel-arrange-drop" id="pelFrDrop" data-ph="${Lt('Tap words below','اضغط الكلمات تحت')}" style="margin-top:14px;"></div>
        <div class="pel-tokens" id="pelFrTk" style="margin-top:10px;">${bank.map((w,i)=>`<button class="pel-token" data-i="${i}">${esc(w)}</button>`).join('')}</div>
        <button class="btn-outline" id="pelFrClear" style="margin-top:10px;width:100%;">${L('Clear','مسح')}</button>
        <div id="pelFrReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;"></div>`;
      const drop=$('#pelFrDrop'); const tk=$('#pelFrTk');
      const renderDrop=()=>{ drop.innerHTML = placed.map((t,i)=>`<button class="pel-token" data-pi="${i}">${esc(t)}</button>`).join('')||'';
        drop.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{ const idx=+b.dataset.pi; const tok=placed[idx]; placed.splice(idx,1); renderDrop(); addBack(tok); });
        // Button gating: require at least 2 words for a meaningful sentence
        ctx.btn.disabled = placed.length < 2;
      };
      const addBack=(tok)=>{ const btn=document.createElement('button'); btn.className='pel-token'; btn.textContent=tok; btn.onclick=()=>{ if(btn.disabled)return; btn.remove(); placed.push(tok); renderDrop(); }; tk.appendChild(btn); };
      tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.remove(); placed.push(bank[+b.dataset.i]); renderDrop(); });
      $('#pelFrClear').onclick=()=>{ placed=[]; renderDrop(); ctx.btn.disabled=true;
        // Re-enable all tokens
        tk.innerHTML = bank.map((w,i)=>`<button class="pel-token" data-i="${i}">${esc(w)}</button>`).join('');
        tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.remove(); placed.push(bank[+b.dataset.i]); renderDrop(); });
      };
      const revealModel = () => {
        if(revealed) return; revealed = true;
        const r = inner.querySelector('#pelFrReveal');
        if(r && it.example && it.example.en){
          r.innerHTML = `<div class="pel-act-hint">${L('Model answer','جواب نموذجي')}</div>
            <div class="pel-act-en" dir="ltr">${esc(it.example.en)}</div>
            ${it.example.ar?`<div class="pel-act-ar arabic">${esc(it.example.ar)}</div>`:''}`;
          r.style.opacity='1'; r.style.maxHeight='320px';
        }
      };
      ctx.self.ready(ctx, L('Done','تم'), ()=>{
        const built = placed.join(' ').toLowerCase();
        // Must use the target word and have 2+ words
        // Use token-safe check (not indexOf) so "he" doesn't match inside "the"
        const usesTarget = tokensContain(built, it.en);
        const wc = placed.length;
        const ok = usesTarget && wc >= 2;
        revealModel();
        ctx.self.mark(ctx, ok);
      });
      ctx.btn.disabled = true;
    },
    review(inner, act, ctx){
      // Active recall: show English, hide Arabic. Student must try to
      // remember the meaning before revealing it. This is real review,
      // not passive display.
      const items=act.items||[];
      let idx=0; let correctCount=0;
      const ask = () => {
        if(idx >= items.length){
          inner.innerHTML = `<div class="pel-act-prompt">${L('Review complete','المراجعة خلصت')}</div>
            <div class="pel-feedback show ok">${L('You recalled ','استرجعت ')}${correctCount}/${items.length}</div>`;
          ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next());
          return;
        }
        const it = items[idx];
        let revealed = false;
        inner.innerHTML = `<div class="pel-act-prompt">${L('What does this mean?','وش يعني هذا؟')} (${idx+1}/${items.length})</div>
          <div class="pel-act-en" dir="ltr">${esc(it.en)}</div>
          <button class="pel-act-play" id="pelRevPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
          <div id="pelRevReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>
          <div style="display:flex;gap:10px;margin-top:14px;">
            <button class="btn-outline" id="pelRevYes" style="flex:1;">${L('I knew it','عرفتها')}</button>
            <button class="btn-outline" id="pelRevNo" style="flex:1;">${L('Forgot','نسيتها')}</button>
          </div>`;
        $('#pelRevPlay').onclick = ()=>play(it.en,'en-US');
        const reveal = (gotIt) => {
          if(revealed) return; revealed = true;
          // Feed the spaced-repetition scheduler: 'I knew it' stretches the
          // interval, 'Forgot' resets it.
          try{ srsRecord(it, gotIt); }catch(e){}
          const r = inner.querySelector('#pelRevReveal');
          if(r){
            r.innerHTML = `<div class="pel-act-translit">${esc(it.translit||'')}</div><div class="pel-act-ar arabic">${esc(it.ar||'')}</div>`;
            r.classList.add('show');
          }
          if(gotIt) correctCount++;
          idx++;
          setTimeout(ask, 1200);
        };
        $('#pelRevYes').onclick = ()=>reveal(true);
        $('#pelRevNo').onclick = ()=>reveal(false);
        ctx.self.ready(ctx, L('Show answer','اعرض الجواب'), ()=>reveal(false));
      };
      ask();
    },
    challenge(inner, act, ctx){
      const items=shuffle(act.items||[]).slice(0,3); const it=items[0]||{};
      // Pad pool with starter items so we always get 4 options (not 3)
      const pool = items.length >= 4 ? items : [...items, ...PEL_STARTER_ITEMS];
      const opts=dedupeOpts(shuffle([it,...pickDistractors(pool, it.en, 3)]), 4); let sel=null;
      const prompt = ar() ? `<span class="arabic">سوال سريع: وش معنى <b dir="ltr">${esc(it.en)}</b>؟</span>` : `Quick check: what does <b>${esc(it.en)}</b> mean?`;
      inner.innerHTML = `<div class="pel-act-prompt">${prompt}</div>
        <div class="pel-options">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}" data-choice-key="${esc(o.en)}"><span class="o-ar arabic">${esc(o.ar||'')}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i; ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ var _selBtn=inner.querySelector('.pel-option.selected'); sel=_selBtn?[...btns].indexOf(_selBtn):-1; const correct=opts[sel]&&opts[sel].en===it.en; btns.forEach((b,i)=>{ if(opts[i].en===it.en){ b.classList.add('correct'); b.insertAdjacentHTML('beforeend', `<span class="o-ar">${esc(opts[i].en)} · ${esc(opts[i].translit||'')}</span>`); } else if(i===sel) b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
      ctx.btn.disabled = true;
    },
    concept(inner, act, ctx){
      // SEE IT / UNDERSTAND IT - a rule explanation from the DB.
      // Structured into labeled sections: Rule, Meaning, Examples, When to use.
      // Important vocabulary words are highlighted with gold styling.
      const n = act.note || {};
      const en = n.en || n.note_en || '';
      const arText = n.ar || '';
      const tr = n.tr || '';
      const terms = collectTerms(act, ctx.s);
      const sections = sectionNoteText(en, arText);
      const examples = collectExamples(act, ctx.s);

      // Helper to render a list of steps with highlighting
      function stepsHtml(steps, textClass){
        if(!steps || !steps.length) return '';
        return '<div class="pel-concept-steps">' + steps.map(function(s,i){
          return '<div class="pel-concept-step"><span class="pel-concept-num">' + (i+1) + '</span><div class="pel-concept-step-body"><div class="' + textClass + '">' + highlightImportant(esc(s), terms) + '</div></div></div>';
        }).join('') + '</div>';
      }

      var html = '<div class="pel-act-prompt">' + L('Read and understand','اقرا وفهم') + '</div>';

      // Rule section (English explanation)
      if(sections.rule.length){
        html += '<div class="pel-concept-section-label">' + L('The Rule','القاعدة') + '</div>';
        html += stepsHtml(sections.rule, 'pel-concept-step-en');
      }
      // Meaning section (Arabic explanation)
      if(sections.meaning.length){
        html += '<div class="pel-concept-section-label">' + L('What it means','المعنى') + '</div>';
        html += stepsHtml(sections.meaning, 'pel-concept-step-ar arabic');
      }
      // If no meaning-specific sentences were classified, show the Arabic text as meaning
      if(!sections.meaning.length && arText && sections.rule.length){
        html += '<div class="pel-concept-section-label">' + L('What it means','المعنى') + '</div>';
        html += stepsHtml(splitToSteps(arText), 'pel-concept-step-ar arabic');
      }
      // Examples section
      if(examples.length){
        html += '<div class="pel-concept-section-label"><i data-lucide="file-text" width="14" height="14"></i> ' + L('Examples','امثلة') + '</div>';
        html += '<div class="pel-concept-examples">';
        examples.forEach(function(ex){
          html += '<div class="pel-concept-ex"><div class="ex-en">' + highlightImportant(esc(ex.en), terms) + '</div>';
          if(ex.ar) html += '<div class="ex-ar arabic">' + highlightImportant(esc(ex.ar), terms) + '</div>';
          html += '</div>';
        });
        html += '</div>';
      }
      // When to use section
      if(sections.whenToUse.length){
        html += '<div class="pel-concept-section-label">' + L('When to use','متى تستخدمه') + '</div>';
        html += stepsHtml(sections.whenToUse, 'pel-concept-step-en');
      }
      if(tr) html += '<div class="pel-act-translit">' + esc(tr) + '</div>';
      html += '<button class="pel-act-play" id="pelCncPlay" style="margin-top:14px;"><i data-lucide="volume-2" width="16" height="16"></i> ' + L('Hear it','اسمعها') + '</button>';

      inner.innerHTML = html;
      const pb = $('#pelCncPlay'); if(pb) pb.onclick = ()=>play(en,'en-US');
      ctx.self.ready(ctx, L('Got it','فهمت'), ()=>ctx.self.next());
    },
    concept_examples(inner, act, ctx){
      // Show real example sentences BEFORE any practice - teaches how the
      // concept/pattern works in context. Student sees English + audio, then
      // reveals Arabic meaning. Not a test - just exposure.
      const sentences = act.sentences || [];
      const terms = collectTerms(act, ctx.s);
      let idx = 0;
      const renderOne = () => {
        if(idx >= sentences.length){ ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next()); return; }
        const s = sentences[idx];
        let revealed = false;
        const reveal = () => {
          if(revealed) return; revealed = true;
          const r = inner.querySelector('#pelCexReveal');
          if(r){
            var html = '';
            if(s.translit) html += '<div class="pel-act-translit">'+esc(s.translit)+'</div>';
            if(s.ar) html += '<div class="pel-act-ar arabic">'+highlightImportant(esc(s.ar), terms)+'</div>';
            r.innerHTML = html;
            r.classList.add('show');
          }
          ctx.btn.innerHTML = idx < sentences.length-1 ? L('Next example','المثال التالي') : L('Continue','متابعة');
          ctx.btn.disabled = false;
        };
        inner.innerHTML = `
          <div class="pel-act-prompt">${L('Example','مثال')} ${idx+1}/${sentences.length}</div>
          <div class="pel-act-en" dir="ltr">${highlightImportant(esc(s.en), terms)}</div>
          <button class="pel-act-play" id="pelCexPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
          <div id="pelCexReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
        const playBtn = $('#pelCexPlay'); if(playBtn) playBtn.onclick = ()=>play(s.en,'en-US');
        ctx.self.ready(ctx, L('Show meaning','اعرض المعنى'), ()=>{ if(!revealed){ reveal(); } else if(idx >= sentences.length - 1){ ctx.self.next(); } else { idx++; renderOne(); } });
      };
      renderOne();
    },
    db_order(inner, act, ctx){
      // Authored 'order' exercise - real tokens + target sentence from the DB.
      const ex = act.ex; const p = (ex && ex.payload) || {};
      // Derive tokens from answer/source/prompt if p.tokens is missing or empty
      var _rawTokens = (p.tokens||[]).slice();
      var _targetText = ''; // preserve unshuffled answer for the check
      if(_rawTokens.length < 2){
        var _ansText = Array.isArray(p.answer) ? p.answer.join(' ') : (p.answer||'');
        var _srcText = p.source || '';
        var _promptText = (p.prompt && p.prompt.en) ? p.prompt.en : '';
        var _base = _ansText || _srcText || _promptText;
        if(_base){
          _rawTokens = _base.replace(/[.?!]/g,'').split(/\s+/).filter(Boolean);
          _targetText = _base;
        }
      } else {
        _targetText = Array.isArray(p.answer) ? p.answer.join(' ') : (p.answer||_rawTokens.join(' '));
      }
      const tokens = shuffle(_rawTokens);
      let placed = [];
      inner.innerHTML = `<div class="pel-act-prompt">${L('Build the sentence','رتب الجملة')}</div>
        ${p.prompt&&p.prompt.en?`<div style="font-size:.95rem;margin-bottom:6px;" dir="ltr">${esc(p.prompt.en)}</div>`:''}
        ${p.prompt&&p.prompt.ar?`<div class="arabic" style="font-size:.8rem;color:var(--text-muted);margin-bottom:10px;">${esc(p.prompt.ar)}</div>`:''}
        <div class="pel-arrange-drop" id="pelDboDrop" data-ph="${Lt('Tap words below','اضغط الكلمات تحت')}"></div>
        <div class="pel-tokens" id="pelDboTk">${tokens.map((t,i)=>`<button class="pel-token" data-i="${i}">${esc(t)}</button>`).join('')}</div>`;
      const drop=$('#pelDboDrop'); const tk=$('#pelDboTk');
      const renderDrop=()=>{ drop.innerHTML = placed.map((t,i)=>`<button class="pel-token" data-pi="${i}">${esc(t)}</button>`).join('') || '';
        drop.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{ const idx=+b.dataset.pi; const tok=placed[idx]; placed.splice(idx,1); addBack(tok); renderDrop(); });
        // Button gating: only enable when all tokens are placed
        ctx.btn.disabled = placed.length !== tokens.length;
      };
      const addBack=(tok)=>{ const btn=document.createElement('button'); btn.className='pel-token'; btn.textContent=tok; btn.onclick=()=>{ if(btn.disabled)return; btn.remove(); placed.push(tok); renderDrop(); }; tk.appendChild(btn); };
      tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.remove(); placed.push(tokens[+b.dataset.i]); renderDrop(); });
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        var ansStr = _targetText || (Array.isArray(p.answer) ? p.answer.join(' ') : (p.answer||''));
        if(!ansStr) ansStr = _rawTokens.join(' ');
        // Use normAny() to preserve Arabic chars - norm() strips them.
        var _hasArabic = /[\u0600-\u06FF]/.test(ansStr) || /[\u0600-\u06FF]/.test(placed.join(' '));
        var _normFn = _hasArabic ? normAny : norm;
        const built = _normFn(placed.join(' '));
        const target = _normFn(ansStr);
        ctx.self.mark(ctx, built===target);
      });
      ctx.btn.disabled = true;
    },
    db_spell(inner, act, ctx){
      // Authored 'spell' exercise — LETTER BANK version (no typing required).
      // Student taps letters in order to spell the word.
      // Translit hidden behind a hint reveal.
      const ex = act.ex; const p = (ex && ex.payload) || {};
      const display = p.display || p.answer || '';
      const answer = p.answer || '';
      const terms = collectTerms(act, ctx.s);

      // Build letter bank from the answer (strip spaces for multi-word)
      const letters = answer.replace(/\s+/g, '').split('');
      const scrambled = shuffle(letters);
      let placed = [];

      inner.innerHTML = `<div class="pel-act-prompt">${L('Spell the word','اهجّ الكلمة')}</div>
        <div class="pel-act-ar arabic" style="font-size:1.15rem;font-weight:600;">${p.meaning?highlightImportant(esc(p.meaning), terms):''}</div>
        <div style="font-size:1.4rem;font-family:'Fraunces',serif;letter-spacing:.35em;margin-top:8px;color:var(--text-muted);" dir="ltr">${esc(display)}</div>
        <div id="pelDbsDrop" class="pel-arrange-drop" data-ph="${Lt('Tap letters below','اضغط الحروف تحت')}" style="margin-top:14px;min-height:50px;"></div>
        <div id="pelDbsTk" class="pel-tokens" style="margin-top:10px;">${scrambled.map((t,i)=>`<button class="pel-token" data-i="${i}" style="min-width:40px;font-size:1.2rem;text-transform:lowercase;">${esc(t)}</button>`).join('')}</div>
        <button class="btn-outline" id="pelDbsClear" style="margin-top:10px;width:100%;">${L('Clear','مسح')}</button>
        <button class="btn-outline" id="pelDbsHint" style="margin-top:10px;width:100%;">${L('Show hint','اعرض تلميح')}</button>
        <div id="pelDbsHintRev" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;

      const drop=$('#pelDbsDrop'); const tk=$('#pelDbsTk');
      const renderDrop=()=>{ drop.innerHTML = placed.map((t,i)=>`<button class="pel-token" data-pi="${i}" style="min-width:40px;font-size:1.2rem;text-transform:lowercase;">${esc(t)}</button>`).join('')||'';
        drop.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{ const idx=+b.dataset.pi; placed.splice(idx,1); renderDrop(); reEnable(); });
        // Button gating: only enable when all letters are placed
        ctx.btn.disabled = placed.length !== letters.length;
      };
      const reEnable=()=>{
        var usedCount={}; placed.forEach(function(c){ usedCount[c]=(usedCount[c]||0)+1; });
        var availCount={}; letters.forEach(function(c){ availCount[c]=(availCount[c]||0)+1; });
        tk.querySelectorAll('.pel-token').forEach(function(b){
          var letter = scrambled[+b.dataset.i];
          var used = usedCount[letter] || 0;
          var total = availCount[letter] || 0;
          if(used < total){ b.disabled=false; b.style.opacity='1'; }
        });
      };
      tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.disabled=true; b.style.opacity='0.3'; placed.push(scrambled[+b.dataset.i]); renderDrop(); });
      $('#pelDbsClear').onclick=()=>{ placed=[]; renderDrop(); reEnable(); ctx.btn.disabled=true; };

      const hb=$('#pelDbsHint'); const hr=$('#pelDbsHintRev');
      if(hb) hb.onclick=()=>{ if(hr){ hr.innerHTML=`<div class="pel-act-translit">${esc(p.translit||'')}</div>`; hr.classList.add('show'); hb.style.display='none'; } };

      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        // Use normAny() to preserve Arabic chars - norm() strips them.
        const accepted=[p.answer].concat(Array.isArray(p.accept)?p.accept:[]).map(function(s){ return normAny(s).replace(/\s+/g,''); });
        const built = normAny(placed.join('')).replace(/\s+/g,'');
        ctx.self.mark(ctx, accepted.indexOf(built)!==-1);
      });
      ctx.btn.disabled = true;
    },
    db_translate(inner, act, ctx){
      // Authored 'translate' exercise — WORD BANK version (no typing required).
      // Student taps words in order to build the translation.
      // Hint reveals only the source translit, never the answer.
      const ex = act.ex; const p = (ex && ex.payload) || {};
      const srcIsEn = !/[\u0600-\u06FF]/.test(p.source || '');
      const answer = p.answer || '';

      // Split answer into words (strip punctuation)
      const answerWords = answer.replace(/[.?!،؟]/g,'').split(/\s+/).filter(Boolean);

      // Build word bank: answer words + distractors from lesson vocab
      var bankWords = answerWords.slice();
      var lv = (Stage.state && Stage.state.lesson && Stage.state.lesson.vocab) || [];
      var maxBank = answerWords.length + 4;
      if(srcIsEn){
        // Answer is Arabic — add Arabic distractors
        lv.forEach(function(v){ if(v && v.ar && bankWords.length < maxBank){
          v.ar.replace(/[.?!،؟]/g,'').split(/\s+/).filter(Boolean).forEach(function(w){
            if(bankWords.length < maxBank && !bankWords.some(function(b){ return normAny(b)===normAny(w); })) bankWords.push(w);
          });
        } });
      } else {
        // Answer is English — add English distractors
        lv.forEach(function(v){ if(v && v.en && bankWords.length < maxBank){
          v.en.replace(/[.?!]/g,'').split(/\s+/).filter(Boolean).forEach(function(w){
            if(bankWords.length < maxBank && !bankWords.some(function(b){ return norm(b)===norm(w); })) bankWords.push(w);
          });
        } });
      }
      // Fallback: distractors from source text if still not enough
      if(bankWords.length <= answerWords.length){
        (p.source||'').replace(/[.?!،؟]/g,'').split(/\s+/).filter(Boolean).forEach(function(w){
          if(bankWords.length < maxBank && !bankWords.some(function(b){ return normAny(b)===normAny(w); })) bankWords.push(w);
        });
      }
      // Fallback: starter items for single-word answers
      if(srcIsEn){
        PEL_STARTER_ITEMS.forEach(function(s){ if(s && s.ar && bankWords.length < maxBank){
          s.ar.replace(/[.?!،؟]/g,'').split(/\s+/).filter(Boolean).forEach(function(w){
            if(bankWords.length < maxBank && !bankWords.some(function(b){ return normAny(b)===normAny(w); })) bankWords.push(w);
          });
        } });
      } else {
        PEL_STARTER_ITEMS.forEach(function(s){ if(s && s.en && bankWords.length < maxBank){
          s.en.replace(/[.?!]/g,'').split(/\s+/).filter(Boolean).forEach(function(w){
            if(bankWords.length < maxBank && !bankWords.some(function(b){ return norm(b)===norm(w); })) bankWords.push(w);
          });
        } });
      }

      var bank = shuffle(bankWords);
      var placed = [];
      var ansIsArabic = srcIsEn; // source English → answer Arabic

      inner.innerHTML = `<div class="pel-act-prompt">${srcIsEn?L('Translate to Arabic','ترجم للعربي'):L('Translate to English','ترجم للانجليزي')}</div>
        <div class="${srcIsEn?'':'arabic'}" dir="${srcIsEn?'ltr':'rtl'}" style="font-size:1.1rem;">${esc(p.source||'')}</div>
        <div class="pel-arrange-drop" id="pelDbtDrop" data-ph="${Lt('Tap words below','اضغط الكلمات تحت')}" style="margin-top:14px;"></div>
        <div class="pel-tokens" id="pelDbtTk" style="margin-top:10px;">${bank.map((w,i)=>`<button class="pel-token${ansIsArabic?' arabic':''}" data-i="${i}">${esc(w)}</button>`).join('')}</div>
        <button class="btn-outline" id="pelDbtHint" style="margin-top:10px;width:100%;">${L('Show hint','اعرض تلميح')}</button>
        <div id="pelDbtHintRev" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;

      const drop=$('#pelDbtDrop'); const tk=$('#pelDbtTk');
      const renderDrop=()=>{ drop.innerHTML = placed.map((t,i)=>`<button class="pel-token${ansIsArabic?' arabic':''}" data-pi="${i}">${esc(t)}</button>`).join('')||'';
        drop.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{ const idx=+b.dataset.pi; const tok=placed[idx]; placed.splice(idx,1); addBack(tok); renderDrop(); });
        // Button gating: only enable when all words are placed
        ctx.btn.disabled = placed.length !== answerWords.length;
      };
      const addBack=(tok)=>{ const btn=document.createElement('button'); btn.className='pel-token'+(ansIsArabic?' arabic':''); btn.textContent=tok; btn.onclick=()=>{ if(btn.disabled)return; btn.remove(); placed.push(tok); renderDrop(); }; tk.appendChild(btn); };
      tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.remove(); placed.push(bank[+b.dataset.i]); renderDrop(); });

      const hb=$('#pelDbtHint'); const hr=$('#pelDbtHintRev');
      if(hb) hb.onclick=()=>{ if(hr){ hr.innerHTML=`<div class="pel-act-translit">${esc(p.source_tr||'')}</div>`; hr.classList.add('show'); hb.style.display='none'; } };

      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        // normAny() keeps Arabic chars - norm() strips them, so Arabic
        // answers would normalize to '' and always match (free pass).
        const accepted=[p.answer].concat(Array.isArray(p.accept)?p.accept:[]).map(normAny);
        const built = normAny(placed.join(' '));
        ctx.self.mark(ctx, accepted.indexOf(built)!==-1);
      });
      ctx.btn.disabled = true;
    },
    db_correct(inner, act, ctx){
      // Authored 'correct' exercise - pick the right sentence from a wrong/right
      // pair, with a why explanation.
      const ex = act.ex; const p = (ex && ex.payload) || {};
      const wrong = p.wrong||''; const right = p.right||'';
      let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Which sentence is correct?','اي جملة صح؟')}</div>
        ${ex.hint_ar?`<div class="arabic" style="font-size:.84rem;color:var(--text-muted);margin-bottom:12px;">${esc(ex.hint_ar)}</div>`:`<div style="font-size:.84rem;color:var(--text-muted);margin-bottom:12px;">${esc(ex.hint_en||'')}</div>`}
        <div class="pel-options">
          <button class="pel-option" data-ok="0" data-choice-key="${esc(wrong)}" dir="ltr">${esc(wrong)}</button>
          <button class="pel-option" data-ok="1" data-choice-key="${esc(right)}" dir="ltr">${esc(right)}</button>
        </div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.ok; ctx.btn.disabled=false; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        var _selBtn = inner.querySelector('.pel-option.selected');
        sel = _selBtn ? +_selBtn.dataset.ok : null;
        const correct = sel===1;
        btns.forEach(b=>{ b.classList.remove('selected'); if(+b.dataset.ok===1) b.classList.add('correct'); else if(+b.dataset.ok===sel) b.classList.add('wrong'); });
        // Reveal the bilingual WHY so the student understands the rule,
        // not just the answer - shown regardless of correctness (most
        // valuable when the student got it wrong).
        const whyEn = p.why_en || ex.hint_en || '';
        const whyAr = p.why_ar || ex.hint_ar || '';
        if(whyEn || whyAr){
          const why=document.createElement('div');
          why.className='pel-act-hint';
          why.style.marginTop='12px';
          why.innerHTML = `${whyEn?`<div>${esc(whyEn)}</div>`:''}${whyAr?`<div class="arabic">${esc(whyAr)}</div>`:''}`;
          inner.appendChild(why);
        }
        ctx.self.mark(ctx, correct);
      });
      ctx.btn.disabled = true;
    },
    mistake_coach(inner, act, ctx){
      // Saudi Mistake Coach — shows a common Saudi learner mistake with
      // wrong/correct pair, explanation in Saudi dialect, and a practice
      // question. Flows naturally within the lesson sequence.
      const pattern = act.pattern || {};
      const practice = pattern.practice || [];
      const pIdx = act.pIdx || 0;
      const q = practice[pIdx] || practice[0] || {};
      let revealed = false;

      // Phase 1: Show wrong/correct pair + explanation
      const renderTip = () => {
        inner.innerHTML = `
          <div class="pel-act-prompt">${L('Common Saudi Mistake','غلطة شائعة عند السعوديين')}</div>
          <div style="margin-top:14px;">
            <div style="padding:12px 14px;background:rgba(161,44,123,.08);border-radius:10px;border-right:3px solid var(--error);margin-bottom:10px;">
              <div style="font-size:.72rem;color:var(--error);margin-bottom:4px;">${L('Wrong','غلط')} ✕</div>
              <div style="font-size:1rem;">${esc(pattern.wrong || '')}</div>
            </div>
            <div style="padding:12px 14px;background:rgba(67,122,34,.08);border-radius:10px;border-right:3px solid var(--success);margin-bottom:14px;">
              <div style="font-size:.72rem;color:var(--success);margin-bottom:4px;">${L('Correct','صح')} ✓</div>
              <div style="font-size:1rem;">${esc(pattern.correct || '')}</div>
            </div>
            <div style="padding:12px 14px;background:var(--surface-alt);border-radius:10px;">
              <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:6px;">${L('Why?','ليش؟')}</div>
              <div class="arabic" style="font-size:.88rem;line-height:1.7;">${esc(pattern.whyAr || '')}</div>
              <div class="arabic" style="font-size:.82rem;line-height:1.6;margin-top:8px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:8px;">${esc(pattern.ruleAr || '')}</div>
            </div>
          </div>`;
        ctx.self.ready(ctx, L('Practice','تمرن'), () => { renderPractice(); });
      };

      // Phase 2: Practice question
      const renderPractice = () => {
        if(!q.q || !q.options || !q.options.length){
          // No practice data — skip directly to next activity instead of
          // looping back to renderTip (which would show "Practice" again).
          ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next());
          return;
        }
        let sel = null;
        const opts = q.options.map((o, i) => ({ text: o, ok: i === q.correct }));
        const shuffled = shuffle(opts);
        inner.innerHTML = `
          <div class="pel-act-prompt">${L('Quick check','تحقق سريع')}</div>
          <div class="pel-act-hint" style="margin-bottom:14px;">${esc(pattern.titleEn || '')}</div>
          <div style="font-size:1rem;margin-bottom:14px;">${esc(q.q)}</div>
          <div class="pel-options">${shuffled.map((o,i)=>`<button class="pel-option" data-i="${i}"><span class="o-en">${esc(o.text)}</span></button>`).join('')}</div>`;
        const btns = inner.querySelectorAll('.pel-option');
        btns.forEach(b => b.onclick = () => {
          btns.forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          sel = +b.dataset.i;
          ctx.btn.disabled = false;
        });
        ctx.btn.disabled = true;
        ctx.self.ready(ctx, L('Check','تحقق'), () => {
          var _selBtn = inner.querySelector('.pel-option.selected');
          sel = _selBtn ? [...btns].indexOf(_selBtn) : -1;
          var correct = sel >= 0 && shuffled[sel].ok;
          btns.forEach((b,i) => {
            if(shuffled[i].ok) b.classList.add('correct');
            else if(i === sel) b.classList.add('wrong');
          });
          ctx.self.mark(ctx, correct);
        });
        ctx.btn.disabled = true;
      };

      renderTip();
    },

    // ---- Minimal Pair Drill: proactive phoneme contrast practice ----
    // Research: Arabic speakers need dedicated phoneme contrast practice
    // for /p/-/b/, /f/-/v/, /θ/-/s/, /ð/-/z/ before encountering words
    // in context. The app already has reactive tips in pronFeedback();
    // this is the proactive version.
    // Ref: https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers
    minimal_pairs(inner, act, ctx){
      const pair = act.pair || {};
      const target = pair.target || '';
      const confusion = pair.confusion || '';
      const meaningAr = pair.ar || '';
      const contrast = pair.contrast || '';
      // Use canRecognize() like the pronunciation exercise does —
      // showing the mic when speech recognition isn't available causes
      // the button to silently fail (recordAndScore falls back to
      // MediaRecorder+Whisper which may not be configured).
      const canRec = (typeof canRecognize==='function') ? canRecognize() : false;

      const tipAr = pair.tipAr || ('الفرق صوت واحد. اسمع الكلمتين زين، بعدين قول الكلمة الصح.');
      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Minimal Pair Drill','تمرين الاصوات المتقاربة')}</div>
        ${contrast?`<div class="pel-act-hint arabic" style="margin-bottom:14px;">${esc(contrast)}</div>`:''}
        <div style="display:flex;gap:12px;margin-bottom:16px;">
          <div style="flex:1;text-align:center;padding:16px;border:2px solid var(--success);border-radius:12px;background:rgba(46,204,113,.06);">
            <div style="font-size:1.5rem;font-weight:700;" dir="ltr">${esc(target)}</div>
            <div class="arabic" style="font-size:.85rem;color:var(--text-muted);">${esc(meaningAr)}</div>
            <button class="pel-act-play" id="mpPlayT"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear','اسمع')}</button>
          </div>
          <div style="flex:1;text-align:center;padding:16px;border:2px solid var(--danger);border-radius:12px;background:rgba(231,76,60,.06);">
            <div style="font-size:1.5rem;font-weight:700;" dir="ltr">${esc(confusion)}</div>
            <div class="arabic" style="font-size:.85rem;color:var(--text-muted);">${L('Common mistake','غلطة شائعة')}</div>
            <button class="pel-act-play" id="mpPlayC"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear','اسمع')}</button>
          </div>
        </div>
        <div class="pel-act-hint arabic" style="margin-bottom:14px;">${esc(tipAr)}</div>
        ${canRec?`
        <div style="text-align:center;margin-bottom:12px;">
          <button class="pel-act-play pel-mic-btn" id="mpMic" style="width:100%;background:rgba(210,92,92,.16);border-color:rgba(210,92,92,.4);color:var(--danger);">
            <i data-lucide="mic" width="16" height="16"></i> ${L('Speak now','انطق الحين')}
          </button>
        </div>
        <div id="mpFb" class="pel-mic-feedback" style="margin-top:12px;"></div>
        <div class="pel-act-hint">${L('Press the button and say the word clearly.','اضغط الزر وانطق الكلمة بوضوح.')}</div>
        `:`<div class="pel-act-hint">${L('Say it out loud, then tap Check.','نطقها بصوت عالي، بعدها اضغط تحقق.')}</div>`}`;

      const playT = inner.querySelector('#mpPlayT');
      const playC = inner.querySelector('#mpPlayC');
      if(playT) playT.onclick = ()=>play(target,'en-US');
      if(playC) playC.onclick = ()=>play(confusion,'en-US');

      if(canRec){
        const micBtn = inner.querySelector('#mpMic');
        const fb = inner.querySelector('#mpFb');
        if(micBtn){
          micBtn.onclick = ()=>{
            if(typeof recordAndScore !== 'function'){ ctx.btn.disabled=false; ctx.self.mark(ctx, true); return; }
            micBtn.classList.add('recording');
            if(fb) fb.innerHTML = `<div class="pel-act-hint">${L('Listening...','استمع...')}</div>`;
            recordAndScore((heard, score, err)=>{
              micBtn.classList.remove('recording');
              ctx.btn.disabled=false;
              if(err){
                if(fb) fb.innerHTML = `<div class="pel-act-hint" style="color:var(--gold);">${typeof micErrorMessage==='function'?esc(micErrorMessage(err)):L('Mic error','خطا بالمايك')}</div>`;
                return;
              }
              const pf = (typeof pronFeedback==='function') ? pronFeedback(heard, target) : {score};
              const sc = (pf.score != null ? pf.score : score);
              const ok = sc != null && sc >= 40;
              const tip = ar() ? pf.tipAr : pf.tipEn;
              // Encouragement messages — reduces speaking anxiety
              let enc = '';
              if(sc != null){
                if(sc < 40) enc = `<div class="pel-act-hint arabic" style="color:var(--text-muted);">الغلط عادي، هذا كيف نتعلم. حاول مرة ثانية.</div>`;
                else if(sc < 70) enc = `<div class="pel-act-hint arabic" style="color:var(--text-muted);">كويس! قربت من النطق الصح. حاول مرة ثانية.</div>`;
                else if(sc < 90) enc = `<div class="pel-act-hint arabic" style="color:var(--success);">احسنت! نطقك صار احسن. كمل.</div>`;
                else enc = `<div class="pel-act-hint arabic" style="color:var(--success);">ممتاز! نطقك طبيعي.</div>`;
              }
              if(fb) fb.innerHTML = `<div style="font-size:1.25rem;font-weight:700;color:${ok?'var(--success)':'var(--gold)'};">${sc!=null?sc:'-'}% ${ok?'✓':'×'}</div>`
                + (heard?`<div class="pel-act-hint">${L('Heard','سمعت')}: ${esc(heard)}</div>`:'')
                + (tip?`<div class="pel-act-hint arabic">${esc(tip)}</div>`:'')
                + enc;
              ctx.self.mark(ctx, ok);
            }, target, micBtn);
          };
        }
      }

      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ ctx.self.mark(ctx, true); });
      if(canRec) ctx.btn.disabled = true; // Must use mic first
      // When no mic available, Check stays enabled (pronunciation fallback)
    },

    // ---- Question vs Statement: identify sentence type ----
    // Research: Arabic speakers struggle with English intonation and word
    // order for questions. This exercise uses structurally different forms
    // (question word order vs statement word order) so the audio is
    // clearly different, not just punctuation.
    // Ref: https://www.e-iji.net/dosyalar/iji_2026_3_19.pdf
    intonation(inner, act, ctx){
      const sentence = act.sentence || '';
      const meaningAr = act.ar || '';
      const question = act.question || sentence + '?';
      const statement = act.statement || sentence + '.';
      const questionMeaning = act.questionMeaning || L('A question','سؤال');
      const statementMeaning = act.statementMeaning || L('A statement','جملة خبرية');
      let sel = null;
      // Randomize which audio button plays the question vs statement
      const questionFirst = Math.random() < 0.5;

      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Question or statement?','سؤال ولا جملة؟')}</div>
        <div class="pel-act-hint arabic" style="margin-bottom:14px;">${L('Hear both sentences, then pick which is the question.','اسمع الجملتين، بعدين اختر اي وحدة سؤال.')}</div>
        <div style="text-align:center;margin-bottom:16px;">
          <button class="pel-act-play" id="intPlayQ" style="margin:0 6px;"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Sentence 1','جملة 1')}</button>
          <button class="pel-act-play" id="intPlayS" style="margin:0 6px;"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Sentence 2','جملة 2')}</button>
        </div>
        ${meaningAr?`<div class="pel-act-hint arabic" style="margin-bottom:14px;">${esc(meaningAr)}</div>`:''}
        <div class="pel-options" id="intOpts">
          <button class="pel-option" data-i="0" data-choice-key="question"><span class="arabic">${esc(questionMeaning)}</span></button>
          <button class="pel-option" data-i="1" data-choice-key="statement"><span class="arabic">${esc(statementMeaning)}</span></button>
        </div>`;

      const playQ = inner.querySelector('#intPlayQ');
      const playS = inner.querySelector('#intPlayS');
      const opts = inner.querySelectorAll('.pel-option');

      if(playQ) playQ.onclick = ()=>{ playQ.classList.add('pel-played'); play(questionFirst ? question : statement,'en-US'); };
      if(playS) playS.onclick = ()=>{ playS.classList.add('pel-played'); play(questionFirst ? statement : question,'en-US'); };

      opts.forEach(b=>b.onclick=()=>{
        opts.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i;
        ctx.btn.disabled=false;
      });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        // Correct if student picked the button that played the question
        const correct = (sel === 0 && questionFirst) || (sel === 1 && !questionFirst);
        opts.forEach((b,i)=>{
          b.classList.remove('selected');
          // Highlight the button that played the question as correct
          const playedQuestion = (i === 0 && questionFirst) || (i === 1 && !questionFirst);
          if(playedQuestion) b.classList.add('correct');
          else if(i===sel) b.classList.add('wrong');
        });
        const why = correct
          ? Lt('Correct! ' + (questionFirst ? 'Sentence 1' : 'Sentence 2') + ' is the question: Are you...? Do you...?', 'صح! ' + (questionFirst ? 'جملة 1' : 'جملة 2') + ' هي السؤال: Are you...? Do you...?')
          : Lt('Questions use different word order: Are you...? Do you...? The question was ' + (questionFirst ? 'Sentence 1' : 'Sentence 2') + '.', 'الاسئلة بالانجليزي تغير ترتيب الكلمات: Are you...? Do you...? السؤال كان ' + (questionFirst ? 'جملة 1' : 'جملة 2') + '.');
        const hint=document.createElement('div');
        hint.className='pel-act-hint';
        hint.style.marginTop='12px';
        hint.innerHTML = `<div class="arabic">${esc(why)}</div>`;
        inner.appendChild(hint);
        ctx.self.mark(ctx, correct);
      });
    },

    // ---- Writing Practice: guided short writing ----
    // Research: Arabic speakers struggle with English writing (RTL→LTR,
    // upper/lower case, punctuation). British Council recommends
    // "activities in which students write their own materials."
    // Ref: https://www.britishcouncil.org/voices-magazine/tips-teaching-english-arabic-speakers
    writing_practice(inner, act, ctx){
      const prompt = act.prompt || {};
      const en = prompt.en || '';
      const promptAr = prompt.ar || '';
      const hint = prompt.hint || '';
      const answer = (prompt.answer || '').toLowerCase().trim();
      let submitted = false;

      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Write in English','اكتب بالانجليزي')}</div>
        <div class="pel-act-hint arabic" style="margin-bottom:14px;">${esc(promptAr)}</div>
        ${hint?`<div class="pel-act-hint" style="margin-bottom:14px;" dir="ltr">${esc(hint)}</div>`:''}
        <div style="margin-bottom:12px;">
          <input type="text" id="wpInput" dir="ltr" placeholder="${L('Type your sentence...','اكتب جملتك...')}"
            class="pel-input" />
        </div>
        <div id="wpFb"></div>`;

      const input = inner.querySelector('#wpInput');
      const fb = inner.querySelector('#wpFb');

      const check = ()=>{
        if(submitted) return;
        const val = (input.value||'').toLowerCase().trim();
        if(!val) return;
        submitted = true;
        // Flexible check: word-level match ignoring case/punctuation
        const norm = s => (s||'').toLowerCase().replace(/[^a-z0-9\s']/g,'').replace(/\s+/g,' ').trim();
        const correct = norm(val) === norm(answer);
        if(fb) fb.innerHTML = correct
          ? `<div style="color:var(--success);font-weight:700;">✓ ${L('Correct!','صح!')}</div>`
            + `<div class="pel-act-hint" dir="ltr">${esc(en)}</div>`
          : `<div style="color:var(--gold);font-weight:700;">× ${L('Try again','حاول ثانية')}</div>`
            + `<div class="pel-act-hint" dir="ltr">${esc(en)}</div>`
            + `<div class="pel-act-hint arabic">الغلط عادي، هذا كيف نتعلم.</div>`;
        ctx.self.mark(ctx, correct);
      };

      input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
      ctx.self.ready(ctx, L('Check','تحقق'), check);
      input.focus();
    },

    // ---- Scenario-Based Role-Play (TBLT) ----
    // Task-Based Language Teaching: students complete real-world tasks
    // (order food, make an appointment, ask directions) with branching
    // outcomes. Multiple-choice format — still TBLT because there's a
    // real-world goal and consequences for each choice.
    // Research: TBLT shows d=0.93 effect on fluency vs PPP.
    // Ref: https://onlinelibrary.wiley.com/doi/10.1111/ijal.12608
    scenario_roleplay(inner, act, ctx){
      const scenario = act.scenario || {};
      const turns = scenario.turns || [];
      const goal = scenario.goal || {};
      const contextAr = scenario.contextAr || '';
      let turnIdx = 0;
      let done = false;
      let hadRetry = false; // track if student retried any turn — mastery gate honesty

      const renderTurn = () => {
        if(turnIdx >= turns.length){
          // Scenario completed
          inner.innerHTML = `
            <div class="pel-act-prompt">${L('Task complete!','تمت المهمة!')}</div>
            <div class="pel-act-hint arabic" style="margin-top:14px;color:var(--success);font-weight:600;">${esc(goal.ar||'')}</div>
            <div class="pel-act-hint" dir="ltr" style="margin-top:8px;">${esc(goal.en||'')}</div>`;
          ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next());
          if(!done){ done = true; ctx.self.mark(ctx, !hadRetry); }
          return;
        }
        const t = turns[turnIdx];
        const opts = (t.options||[]).map((o, i) => ({ ...o, idx:i }));
        const shuffled = shuffle(opts);
        let sel = null;

        inner.innerHTML = `
          <div class="pel-act-prompt">${L('Role-play','موقف واقعي')}</div>
          ${turnIdx===0?`<div class="pel-act-hint arabic" style="margin-bottom:14px;color:var(--gold);font-weight:600;">${esc(contextAr)}</div>`:''}
          <div class="pel-act-hint arabic" style="margin-bottom:8px;">${esc(goal.ar||'')}</div>
          <div style="padding:14px 16px;background:var(--surface-alt);border-radius:12px;border-left:3px solid var(--gold);margin-bottom:16px;">
            <div class="pel-act-hint" dir="ltr" style="font-size:.95rem;">${esc(t.npc||'')}</div>
          </div>
          <div class="pel-act-hint arabic" style="margin-bottom:12px;">${esc(t.promptAr||'')}</div>
          <div class="pel-options" id="srOpts">${shuffled.map(o=>`<button class="pel-option" data-ok="${o.ok?1:0}" data-idx="${o.idx}" dir="ltr">${esc(o.text||'')}</button>`).join('')}</div>
          <div id="srFb"></div>`;

        const btns = inner.querySelectorAll('.pel-option');
        const fb = inner.querySelector('#srFb');
        btns.forEach(b=>b.onclick=()=>{
          btns.forEach(x=>x.classList.remove('selected'));
          b.classList.add('selected');
          sel = +b.dataset.idx;
          ctx.btn.disabled = false;
        });
        ctx.btn.disabled = true;
        ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
          const chosen = opts.find(o=>o.idx===sel);
          if(!chosen) return;
          btns.forEach(b=>{
            b.classList.remove('selected');
            if(+b.dataset.ok===1) b.classList.add('correct');
            else if(+b.dataset.idx===sel) b.classList.add('wrong');
          });
          if(fb) fb.innerHTML = `
            <div style="margin-top:14px;padding:12px 14px;background:var(--surface-alt);border-radius:10px;">
              <div class="arabic" style="margin-bottom:8px;">${esc(chosen.whyAr||'')}</div>
              <div class="arabic" style="color:var(--text-muted);border-top:1px solid var(--border);padding-top:8px;">${esc(chosen.outcomeAr||'')}</div>
            </div>`;
          if(chosen.ok){
            turnIdx++;
            ctx.self.ready(ctx, L('Continue','متابعة'), ()=>renderTurn());
          } else {
            hadRetry = true;
            ctx.self.ready(ctx, L('Try again','حاول ثانية'), ()=>renderTurn());
          }
        });
      };

      renderTurn();
    },
  };

  // Choose-exercise option helpers: DB rows are objects {t,tr,ok}, authored
  // content uses plain strings. Both must render correctly.
  function optText(o){ return (typeof o==='string') ? o : ((o && (o.t||o.text||o.en||o.label))||''); }
  function optSub(o){ return (typeof o==='string') ? '' : ((o && (o.tr||o.translit||o.ar))||''); }

  // Deduplicate options by norm() so we never show the same meaning twice.
  // Returns the first N unique items from opts.
  function dedupeOpts(opts, n){
    var seen = {}; var out = [];
    for(var i = 0; i < opts.length && out.length < n; i++){
      var o = opts[i]; var k = norm(typeof o==='string' ? o : (o && (o.t||o.text||o.en||o.label)) || '');
      if(k && !seen[k]){ seen[k] = 1; out.push(o); }
    }
    return out;
  }

  // Pick N unique distractors from pool (dedupe before slicing), padding from PEL_STARTER_ITEMS.
  // pool: array of {en,...} items. target: string to exclude. n: count needed.
  function pickDistractors(pool, target, n){
    var seen = {}; var dd = [];
    var tk = norm(target||'');
    if(tk) seen[tk] = 1;
    var shuffled = shuffle(pool.slice());
    for(var i = 0; i < shuffled.length && dd.length < n; i++){
      var d = shuffled[i];
      if(d && d.en){ var k = norm(d.en); if(!seen[k]){ seen[k] = 1; dd.push(d); } }
    }
    // Pad from PEL_STARTER_ITEMS if still short
    if(dd.length < n && typeof PEL_STARTER_ITEMS !== 'undefined'){
      var ps = shuffle(PEL_STARTER_ITEMS.slice());
      for(var j = 0; j < ps.length && dd.length < n; j++){
        if(ps[j] && ps[j].en){ var k2 = norm(ps[j].en); if(!seen[k2]){ seen[k2] = 1; dd.push(ps[j]); } }
      }
    }
    return dd;
  }

  // ---- Contextual-option helpers (sentence-variant generation) ----
  function wordCount(text){ return String(text||'').trim().split(/\s+/).filter(Boolean).length; }
  function isShortChoice(text){ return wordCount(text) <= 2; }
  function escapeRegExp(text){ return String(text).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

  // Token/phrase-safe contains check (prevents "is" matching inside "this").
  function containsTerm(sentenceEn, wordEn){
    if(!sentenceEn || !wordEn) return false;
    return tokensContain(sentenceEn, wordEn);
  }

  // Shared audio-target logic for listen + identify_heard so they always agree.
  // Returns {text, sentenceMode}. sentenceMode is true only when the example
  // sentence is a real multi-word sentence that contains the target word.
  function heardTargetFor(it){
    var ex = it && it.example && it.example.en;
    var sentenceOK = ex && goodSentence({en:ex}, 3) && containsTerm(ex, it.en);
    return {
      text: sentenceOK ? ex : (it ? it.en : ''),
      sentenceMode: !!sentenceOK
    };
  }

  // Collect lesson-level teach blocks already shown on previous teach panels.
  // This prevents grammar rules, glossary, notes, and connection explanations
  // from repeating on every single teach panel — they show ONCE then never again.
  function getTaughtKeys(){
    var s = Stage.state;
    var keys = {};
    if(!s || !s.seq || s.idx === undefined) return keys;
    for(var i = 0; i < s.idx; i++){
      var prev = s.seq[i];
      if(!prev) continue;
      if(prev._teachKeys){
        for(var k in prev._teachKeys) keys[k] = true;
      }
    }
    return keys;
  }

  // Collect words already taught in learn/learn_sentence steps AND teach
  // panels before the current activity. Used by buildTeachHtml to avoid
  // repeating vocabulary the student has already seen.
  function getTaughtWords(){
    var s = Stage.state;
    var taught = [];
    if(!s || !s.seq || s.idx === undefined) return taught;
    for(var i = 0; i < s.idx; i++){
      var prev = s.seq[i];
      if(!prev) continue;
      if(prev.type === 'learn' || prev.type === 'learn_sentence'){
        if(prev.item && prev.item.en) taught.push(prev.item.en);
      }
      // Track words taught in the teach panel's "New word" section
      if(prev._teachNewWord) taught.push(prev._teachNewWord);
      // Track prereq function words shown in previous teach panels
      if(prev._teachPrereqs){
        for(var j = 0; j < prev._teachPrereqs.length; j++){
          taught.push(prev._teachPrereqs[j]);
        }
      }
    }
    return taught;
  }

  // Collect all text from the upcoming activity to find relevant vocab
  function activityText(act){
    var text = '';
    var sent = extractActivitySentence(act);
    if(sent && sent.en) text = sent.en;
    if(act.item && act.item.en) text += ' ' + act.item.en;
    if(act.sentence && act.sentence.en) text += ' ' + act.sentence.en;
    if(act.quiz && act.quiz[0]){
      var q = act.quiz[0];
      if(q.qEn) text += ' ' + q.qEn;
      if(q.options) q.options.forEach(function(o){ text += ' ' + optText(o); });
    }
    if(act.ex && act.ex.payload){
      var p = act.ex.payload;
      if(p.right) text += ' ' + p.right;
      if(p.wrong) text += ' ' + p.wrong;
      if(p.source) text += ' ' + p.source;
      if(p.prompt && p.prompt.en) text += ' ' + p.prompt.en;
    }
    return text;
  }

  // Replace the first whole-token/phrase occurrence of `needle` in `text`
  // with `replacement`, using word boundaries. Returns null if not found.
  function replaceTerm(text, needle, replacement){
    if(!text || !needle) return null;
    var re = new RegExp('\\b'+escapeRegExp(needle)+'\\b','i');
    if(!re.test(text)) return null;
    return text.replace(re, replacement);
  }

  // Escape text, then wrap the `key` token/phrase in a highlight span.
  // Uses word boundaries so "is" doesn't highlight inside "this".
  function highlightChoice(text, key){
    if(!text || !key) return esc(text||'');
    var re = new RegExp('\\b'+escapeRegExp(key)+'\\b','i');
    var m = re.exec(text);
    if(!m) return esc(text);
    var prefix = text.substring(0, m.index);
    var match = m[0];
    var suffix = text.substring(m.index + match.length);
    return esc(prefix) + '<span class="pel-hl">' + esc(match) + '</span>' + esc(suffix);
  }

  // Get plain-text question from a quiz object (prefer qEn, fall back to stripped q).
  function plainQuizText(q){
    if(!q) return '';
    if(q.qEn) return q.qEn;
    if(q.q) return String(q.q).replace(/<[^>]*>/g,'').trim();
    return '';
  }

  // Common function words / grammar markers that appear in English sentences.
  // Used by the teach panel to show prerequisite pieces the student needs.
  // Rich teaching content in Saudi Arabian Arabic (Abha dialect).
  // Each entry provides: meaning, where to use, where NOT to use,
  // common mistakes, how to avoid them, and what to remember.
  var TEACHING_CONTENT = {
    'I': {
      meaning: 'انا',
      useWhen: 'تتكلم عن نفسك. مثال: I am a teacher = انا مدرس',
      dontUseWhen: 'لا تستخدمها لغيرك. ما تقول "I is" — دايماً I am',
      commonMistake: 'الطلاب يقولون I is بدل I am',
      howToAvoid: 'تذكر: I + am دايماً مع بعض. ما تجمع بين I و is او are',
      remember: 'I = انا، ودايماً تجي مع am'
    },
    'you': {
      meaning: 'انت / انتم',
      useWhen: 'تخاطب شخص او مجموعة. مثال: You are nice = انت لطيف',
      dontUseWhen: 'لا تستخدمها للحديث عن نفسك او عن شخص غايب',
      commonMistake: 'الطلاب يخلطون بين you are و you is',
      howToAvoid: 'you + are دايماً. ما تجمع you مع is',
      remember: 'you = انت/انتم، ودايماً تجي مع are'
    },
    'this': {
      meaning: 'هذا / هذي (للقريب)',
      useWhen: 'تشاور على شي قريب منك. مثال: This is my book = هذا كتابي',
      dontUseWhen: 'لا تستخدمها للشي البعيد — استخدم that',
      commonMistake: 'استخدام this للشي البعيد',
      howToAvoid: 'اسال: الشي قريب مني؟ this. بعيد؟ that',
      remember: 'this = قريب، that = بعيد'
    },
    'that': {
      meaning: 'ذاك / ذول (للبعيد)',
      useWhen: 'تشاور على شي بعيد عنك. مثال: That is my car = ذاك سيارتي',
      dontUseWhen: 'لا تستخدمها للشي القريب — استخدم this',
      commonMistake: 'خلط بين this و that',
      howToAvoid: 'قريب = this، بعيد = that',
      remember: 'that = بعيد، this = قريب'
    },
    'these': {
      meaning: 'هذي / هذول (جمع قريب)',
      useWhen: 'تشاور على اشيا قريبة وجمع. مثال: These are my books = هذي كتبي',
      dontUseWhen: 'لا تستخدمها للواحد ولا للبعيد',
      commonMistake: 'استخدام these للواحد بدل this',
      howToAvoid: 'جمع قريب = these، جمع بعيد = those',
      remember: 'these = جمع قريب'
    },
    'those': {
      meaning: 'ذول (جمع بعيد)',
      useWhen: 'تشاور على اشيا بعيدة وجمع. مثال: Those are nice = ذول حلوين',
      dontUseWhen: 'لا تستخدمها للواحد ولا للقريب',
      commonMistake: 'خلط بين these و those',
      howToAvoid: 'جمع قريب = these، جمع بعيد = those',
      remember: 'those = جمع بعيد'
    },
    'am': {
      meaning: 'تستخدم مع I فقط — مثل: I am = انا',
      useWhen: 'تتكلم عن نفسك في الحاضر. مثال: I am happy = انا سعيد',
      dontUseWhen: 'لا تستخدمها مع he/she/it/we/you/they',
      commonMistake: 'الطلاب يقولون I is بدل I am',
      howToAvoid: 'I + am = زوج ثابت. ما تفرقهم ابداً',
      remember: 'am تجي مع I فقط'
    },
    'do': {
      meaning: 'كلمة مساعدة للاساله والنفي في الحاضر',
      useWhen: 'تسال سوال في الحاضر. مثال: Do you like tea? = تحب الشاي؟',
      dontUseWhen: 'لا تستخدمها مع he/she/it — استخدم does',
      commonMistake: 'استخدام do مع he/she/it بدل does',
      howToAvoid: 'I/you/we/they = do، he/she/it = does',
      remember: 'do = مع I/you/we/they'
    },
    'does': {
      meaning: 'كلمة مساعدة مع he/she/it في الحاضر',
      useWhen: 'تسال عن شخص واحد غايب. مثال: Does he work? = هو يشتغل؟',
      dontUseWhen: 'لا تستخدمها مع I/you/we/they',
      commonMistake: 'نسيان does واستخدام do مع he/she/it',
      howToAvoid: 'he/she/it = does دايماً',
      remember: 'does = مع he/she/it'
    },
    'where': {
      meaning: 'وين / وين',
      useWhen: 'تسال عن المكان. مثال: Where is the book? = وين الكتاب؟',
      dontUseWhen: 'لا تستخدمها للسوال عن الزمان — استخدم when',
      commonMistake: 'خلط بين where و when',
      howToAvoid: 'where = مكان، when = زمان',
      remember: 'where = وين (مكان)'
    },
    'what': {
      meaning: 'وش / ايش',
      useWhen: 'تسال عن الشي. مثال: What is this? = وش هذا؟',
      dontUseWhen: 'لا تستخدمها للسوال عن المكان — استخدم where',
      commonMistake: 'خلط بين what و where',
      howToAvoid: 'what = للسوال عن الشي نفسه، where = للمكان',
      remember: 'what = وش (للشي)'
    },
    'can': {
      meaning: 'اقدر (للقدرة)',
      useWhen: 'تتكلم عن قدرتك على شي. مثال: I can drive = اقدر اسوق',
      dontUseWhen: 'لا تستخدمها للمستقبل — استخدم will',
      commonMistake: 'استخدام can للمستقبل',
      howToAvoid: 'can = قدرة الحين، will = مستقبل',
      remember: 'can = اقدر (الحين)'
    },
    'will': {
      meaning: 'راح (للمستقبل)',
      useWhen: 'تتكلم عن شي راح يصير. مثال: I will help you = راح اساعدك',
      dontUseWhen: 'لا تستخدمها للقدرة الحالية — استخدم can',
      commonMistake: 'خلط بين will و can',
      howToAvoid: 'will = مستقبل، can = قدرة',
      remember: 'will = راح (مستقبل)'
    },
    'my': {
      meaning: 'حقتي — تحطها قبل الشي اللي لك. مثل: my book = كتابي',
      useWhen: 'تتكلم عن شي يخصك. مثال: My book = كتابي',
      dontUseWhen: 'لا تستخدمها لغيرك — استخدم his/her/your',
      commonMistake: 'خلط بين my و I',
      howToAvoid: 'my = حقتي (للشي)، I = انا (للشخص)',
      remember: 'my = حقتي، I = انا'
    },
    'your': {
      meaning: 'حقتك — تحطها قبل الشي اللي للمخاطب. مثل: your name = اسمك',
      useWhen: 'تتكلم عن شي يخص المخاطب. مثال: Your name = اسمك',
      dontUseWhen: 'لا تستخدمها لنفسك — استخدم my',
      commonMistake: 'خلط بين your و you',
      howToAvoid: 'your = حقتك (للشي)، you = انت (للشخص)',
      remember: 'your = حقتك، you = انت'
    },
    'a': {
      meaning: 'تعريف للشي الواحد (غير محدد)',
      useWhen: 'تتكلم عن شي واحد غير محدد. مثال: a book = كتاب',
      dontUseWhen: 'لا تستخدمها قبل كلمة تبدا بحرف علة — استخدم an',
      commonMistake: 'استخدام a قبل كلمة تبدا بحرف علة',
      howToAvoid: 'a = قبل حرف ساكن، an = قبل حرف علة (a,e,i,o,u)',
      remember: 'a = واحد غير محدد، قبل الساكن'
    },
    'an': {
      meaning: 'تعريف للشي الواحد (قبل حرف علة)',
      useWhen: 'تتكلم عن شي واحد يبدا بحرف علة. مثال: an apple = تفاحة',
      dontUseWhen: 'لا تستخدمها قبل حرف ساكن — استخدم a',
      commonMistake: 'استخدام a بدل an قبل حرف علة',
      howToAvoid: 'a,e,i,o,u في البداية = an',
      remember: 'an = قبل حرف العلة'
    },
    // === Research-backed entries for common Saudi learner difficulties ===
    // Articles: #1 error category for Arabic speakers (Al-Hattami 2010, Ahmad 2011)
    'the': {
      meaning: 'الـ — تعريف للشي المحدد',
      useWhen: 'تتكلم عن شي محدد تعرفه انت والمستمع. مثال: The book = الكتاب',
      dontUseWhen: 'لا تستخدمها مع الجمع العام او غير المعدود. مثال: Dogs are loyal (مو the dogs)',
      commonMistake: 'نسيان the او زيادتها في اماكن غلط — العرب ما عندهم a/an فلازم تنتبه',
      howToAvoid: 'اذا انت والمستمع تعرفون اي شي هو = the. اذا شي عام بدون تحديد = بدون the',
      remember: 'the = شي محدد نعرفه، بدون = شي عام'
    },
    // Prepositions: #2 error category - direct translation causes errors
    'in': {
      meaning: 'في — للاماكن المغلقة والوقت',
      useWhen: 'تتكلم عن مكان محاط (in the room) او شهر/شهر (in Riyadh) او وقت (in the morning)',
      dontUseWhen: 'لا تستخدمها لل ايام — استخدم on. ولا للساعات — استخدم at',
      commonMistake: 'خلط in مع on بسبب الترجمة الحرفية من العربي',
      howToAvoid: 'in = جوّه (في غرفة، في مدينة)، on = فوق (على طاولة)، at = نقطة (عند الساعة 5)',
      remember: 'in = جوّه/في وقت، on = فوق، at = نقطة'
    },
    'on': {
      meaning: 'على — للسطح والايام',
      useWhen: 'تتكلم عن شي فوق سطح (on the table) او يوم (on Monday) او شغال (the TV is on)',
      dontUseWhen: 'لا تستخدمها للاماكن المغلقة — استخدم in. ولا للنقاط الزمنية — استخدم at',
      commonMistake: 'ترجمة على الحرفية من العربي في اماكن غلط',
      howToAvoid: 'on = فوق سطح، on + يوم، is on = شغال (تلفزيون، نور)',
      remember: 'on = فوق / يوم / شغال'
    },
    'at': {
      meaning: 'عند — لنقطة محددة وساعة',
      useWhen: 'تتكلم عن مكان محدد (at the door) او ساعة (at 5 oclock) او حدث (at a party)',
      dontUseWhen: 'لا تستخدمها للمدن او الدول — استخدم in. ولا للسطح — استخدم on',
      commonMistake: 'خلط at مع in للاماكن',
      howToAvoid: 'at = نقطة (باب، ساعة، عنوان)، in = فضاء (مدينة، غرفة)',
      remember: 'at = نقطة محددة، in = فضاء واسع'
    },
    // Subject-verb agreement: common Arabic interference error
    'is': {
      meaning: 'كلمة مساعدة — تستخدم مع he/she/it',
      useWhen: 'تتكلم عن شخص واحد غايب في الحاضر. مثال: He is tall = هو طويل',
      dontUseWhen: 'لا تستخدمها مع I — استخدم am. ولا مع we/you/they — استخدم are',
      commonMistake: 'استخدام is مع I او they (Arabic interference)',
      howToAvoid: 'I + am، he/she/it + is، we/you/they + are',
      remember: 'is = مع واحد غايب (he/she/it)'
    },
    'are': {
      meaning: 'كلمة مساعدة — تستخدم مع we/you/they',
      useWhen: 'تتكلم عن جمع او المخاطب. مثال: They are happy = هم مبسوطين',
      dontUseWhen: 'لا تستخدمها مع I — استخدم am. ولا مع he/she/it — استخدم is',
      commonMistake: 'استخدام is مع الجمع',
      howToAvoid: 'I + am، he/she/it + is، we/you/they + are',
      remember: 'are = مع الجمع والمخاطب'
    },
    'was': {
      meaning: 'كان — ماضي is',
      useWhen: 'تتكلم عن شي واحد غايب في الماضي. مثال: He was here = كان هنا',
      dontUseWhen: 'لا تستخدمها مع I — استخدم was ايضا. ولا مع الجمع — استخدم were',
      commonMistake: 'خلط was مع were',
      howToAvoid: 'I/he/she/it + was، we/you/they + were',
      remember: 'was = ماضي للواحد، were = ماضي للجمع'
    },
    'were': {
      meaning: 'كانوا — ماضي are',
      useWhen: 'تتكلم عن جمع في الماضي. مثال: They were here = كانوا هنا',
      dontUseWhen: 'لا تستخدمها مع الواحد — استخدم was',
      commonMistake: 'استخدام was مع الجمع',
      howToAvoid: 'I/he/she/it + was، we/you/they + were',
      remember: 'were = ماضي للجمع والمخاطب'
    },
    'have': {
      meaning: 'عندي / عندنا / عندك / عندهم — مع I/we/you/they',
      useWhen: 'تتكلم عن امتلاك شي. مثال: I have a car = عندي سيارة',
      dontUseWhen: 'لا تستخدمها مع he/she/it — استخدم has',
      commonMistake: 'استخدام have مع he/she/it',
      howToAvoid: 'I/we/you/they + have، he/she/it + has',
      remember: 'have = مع I/we/you/they، has = مع he/she/it'
    },
    'has': {
      meaning: 'عنده / عندها — مع he/she/it',
      useWhen: 'تتكلم عن امتلاك شي لواحد غايب. مثال: He has a car = عنده سيارة',
      dontUseWhen: 'لا تستخدمها مع I/we/you/they — استخدم have',
      commonMistake: 'استخدام has مع I او they',
      howToAvoid: 'he/she/it + has، I/we/you/they + have',
      remember: 'has = مع he/she/it فقط'
    },
    // Negation: Arabic uses لا for both no/not
    'not': {
      meaning: 'مو / ما — للنفي',
      useWhen: 'تنفي فعل او صفة. مثال: I am not tired = انا مو تعبان',
      dontUseWhen: 'لا تستخدمها بدل no للرفض',
      commonMistake: 'خلط not مع no — العرب تستخدم لا للاثنين',
      howToAvoid: 'not = نفي (is not, do not)، no = رفض (No, thanks)',
      remember: 'not = نفي الكلام، no = رفض الطلب'
    },
    'no': {
      meaning: 'لا — للرفض',
      useWhen: 'ترفض شي. مثال: No, thanks = لا، شكرا',
      dontUseWhen: 'لا تستخدمها بدل not لنفي الافعال',
      commonMistake: 'استخدام no بدل not في الجمل',
      howToAvoid: 'no = رفض (سؤال)، not = نفي (جملة)',
      remember: 'no = رفض، not = نفي'
    },
    // Connectors: essential for sentence building
    'but': {
      meaning: 'بس / لكن — للتعارض',
      useWhen: 'تربط جملتين متعارضتين. مثال: I am tired but happy = انا تعبان بس مبسوط',
      dontUseWhen: 'لا تستخدمها للموافقة — استخدم and',
      commonMistake: 'نسيان but وربط الجمل بدون رابط',
      howToAvoid: 'but = التعارض، and = الاضافة، so = النتيجة',
      remember: 'but = بس / لكن'
    },
    'because': {
      meaning: 'لان — للسبب',
      useWhen: 'تذكر سبب شي. مثال: I am happy because today is Friday = مبسوط لان اليوم الجمعة',
      dontUseWhen: 'لا تستخدمها للنتيجة — استخدم so',
      commonMistake: 'خلط because مع so — because = السبب، so = النتيجة',
      howToAvoid: 'because يجي قبل السبب، so يجي قبل النتيجة',
      remember: 'because = ليش، so = عشان كذا'
    },
    'or': {
      meaning: 'او — للاختيار',
      useWhen: 'تختار بين شيين. مثال: Tea or coffee? = شاي او قهوة؟',
      dontUseWhen: 'لا تستخدمها للتعارض — استخدم but',
      commonMistake: 'خلط or مع but',
      howToAvoid: 'or = اختيار، but = تعارض',
      remember: 'or = او / اختيار'
    },
    'if': {
      meaning: 'لو — للشرط',
      useWhen: 'تذكر شرط. مثال: If it rains, I will stay home = لو ماطر، ببقى في البيت',
      dontUseWhen: 'لا تستخدمها للسبب — استخدم because',
      commonMistake: 'خلط if مع when — if = شرط ممكن ما يصير، when = وقت متاكد',
      howToAvoid: 'if = احتمال، when = متاكد',
      remember: 'if = لو / شرط'
    },
    // Existential: there is / there are — Arabic has different structure
    'there': {
      meaning: 'في — لوجود شي (there is/are)',
      useWhen: 'تقول ان شي موجود. مثال: There is a book = في كتاب',
      dontUseWhen: 'لا تستخدمها بدل here — there = هناك، here = هنا',
      commonMistake: 'نسيان there is/are وقول it is بدلها',
      howToAvoid: 'there is = في واحد، there are = في جمع. مثال: There are books = في كتب',
      remember: 'there is/are = يوجد / في'
    }
  };

  // Get rich teaching content for a word. Returns null if not in the dictionary.
  function teachingContentForWord(en){
    if(!en) return null;
    var key = en.toLowerCase().trim();
    return TEACHING_CONTENT[key] || null;
  }

  var FUNCTION_WORDS = {
    'do':'كلمة مساعدة للاساله','does':'كلمة مساعدة مع he/she/it','did':'كلمة مساعدة للماضي',
    'am':'تستخدم مع I (I am)','is':'تستخدم مع he/she/it','are':'تستخدم مع we/you/they',
    'not':'نفي (مو)','no':'لا','yes':'ايه','please':'لو سمحت','thank':'شكر',
    'I':'انا','you':'انت/انتم','your':'حقتك','my':'حقتي','his':'حقه','her':'حقها','our':'حقنا','their':'حقهم',
    'where':'وين','what':'وش','who':'منو','when':'متى','why':'ليش','how':'كيف',
    'the':'الـ','a':'واحد','an':'واحد',
    'this':'هذا','that':'ذاك','these':'هذي','those':'ذول',
    'in':'في','on':'على','at':'عند','to':'الى','for':'لـ','with':'مع','from':'من',
    'can':'اقدر','will':'راح','have':'عندي/امتلك','has':'عنده/امتلك',
    'going':'رايح','to':'لـ'
  };

  // Activity types whose teach panel must NOT reveal the exact answer.
  function isAnswerSensitive(actType){
    var sensitive = {
      identify_heard:1, listening_dictation:1, choose_natural_expression:1,
      db_correct:1, grammar_correction:1, fill_blank:1, guided_production:1,
      db_spell:1, spell:1, db_translate:1, translate:1, db_order:1,
      arrange_words:1, free_response:1, challenge:1, recognize:1, match:1,
      review:1, conversation_response:1, complete_dialogue:1
    };
    return !!sensitive[actType];
  }

  // Build a list of prerequisite word explanations for the teach panel.
  // Only includes words that actually appear in the upcoming activity text
  // and are known function words. Does NOT include exact answer strings.
  function prereqWordsFor(act, hiddenWords){
    var text = '';
    var sent = extractActivitySentence(act);
    if(sent && sent.en) text = sent.en.toLowerCase();
    if(act.item && act.item.en) text += ' ' + act.item.en.toLowerCase();
    if(act.quiz && act.quiz[0]){
      var q = act.quiz[0];
      if(q.qEn) text += ' ' + q.qEn.toLowerCase();
      if(q.options) q.options.forEach(function(o){ text += ' ' + optText(o).toLowerCase(); });
    }
    if(act.ex && act.ex.payload){
      var p = act.ex.payload;
      if(p.right) text += ' ' + p.right.toLowerCase();
      if(p.wrong) text += ' ' + p.wrong.toLowerCase();
      if(p.source) text += ' ' + p.source.toLowerCase();
      if(p.prompt && p.prompt.en) text += ' ' + p.prompt.en.toLowerCase();
    }
    var hidden = {};
    (hiddenWords||[]).forEach(function(w){ hidden[norm(w)] = true; });
    var result = [];
    var seen = {};
    Object.keys(FUNCTION_WORDS).forEach(function(w){
      if(containsTerm(text, w) && !hidden[norm(w)] && !seen[norm(w)]){
        seen[norm(w)] = true;
        result.push({ en: w, ar: FUNCTION_WORDS[w] });
      }
    });
    return result.slice(0, 6);
  }


  const TYPE_LABELS_DEF = {
    learn:['Learn','تعلم'], learn_sentence:['Sentence','جملة'], recognize:['Recognize','تعرف'],
    match:['Match','طابق'], arrange_words:['Build','رتب'], fill_blank:['Fill','املا'],
    spell:['Spell','تهجى'], translate:['Translate','ترجم'], listen:['Listen','استمع'],
    identify_heard:['Identify','حدد'], pronunciation:['Pronounce','انطق'], speaking:['Speak','تحدث'],
    conversation_response:['Respond','رد'], complete_dialogue:['Dialogue','حوار'],
    grammar_correction:['Fix','صحح'], choose_natural_expression:['Choose','اختر'],
    free_response:['Write','اكتب'], review:['Review','راجع'], challenge:['Challenge','تحدّي'],
    listening_dictation:['Dictation','املا'], guided_production:['Build it','ركبها'],
    concept:['Concept','قاعدة'], concept_examples:['Examples','امثلة'], db_order:['Build','رتب'], db_spell:['Spell','تهجى'],
    db_translate:['Translate','ترجم'], db_correct:['Fix','صحح'],
    mistake_coach:['Saudi Tip','نصيحة سعودية'],
    minimal_pairs:['Sounds','اصوات'], intonation:['Question?','سؤال؟'],
    writing_practice:['Write','اكتب'], scenario_roleplay:['Role-play','موقف'],
  };
  const PROMPTS_DEF = {
    recognize:['Pick the meaning','اختر المعنى'], match:['Tap a pair','اضغط زوج'],
    arrange_words:['Tap words in order','اضغط الكلمات بالترتيب'], fill_blank:['Pick the missing word','اختر الكلمة الناقصة'],
    spell:['Type the word','اكتب الكلمة'], translate:['Type the English','اكتب الانجليزي'],
    listen:['Press play','اضغط تشغيل'], identify_heard:['Pick what you heard','اختر اللي سمعته'],
    pronunciation:['Say it aloud','نطقها بصوت عالي'], speaking:['Say the sentence','نطق الجملة'],
    conversation_response:['Pick the natural reply','اختر الرد الطبيعي'], complete_dialogue:['Fill the gap','املا الفراغ'],
    grammar_correction:['Type the correct sentence','اكتب الجملة الصحيحة'], choose_natural_expression:['Pick the natural one','اختر الطبيعي'],
    free_response:['Type your answer','اكتب جوابك'], review:['Recall','استرجع'], challenge:['Quick fire','سوال سريع'],
    listening_dictation:['Type what you hear','اكتب اللي تسمعه'], guided_production:['Complete the sentence','كمل الجملة'],
    concept:['Read the rule','اقرا القاعدة'], concept_examples:['See examples','شاهد الامثلة'], db_order:['Tap words in order','اضغط الكلمات بالترتيب'],
    db_spell:['Spell the English word','اهجّ الكلمة بالانجليزي'], db_translate:['Translate the sentence','ترجم الجملة'], db_correct:['Which sentence is correct?','اي جملة صح؟'],
    mistake_coach:['Fix the Saudi mistake','صلح الغلطة'],
    minimal_pairs:['Hear both, say the correct one','اسمع الكلمتين، قول الصح'],
    intonation:['Hear both, pick the question','اسمع الجملتين، اختر السؤال'],
    writing_practice:['Type the sentence in English','اكتب الجملة بالانجليزي'],
    scenario_roleplay:['Complete the real-life task','كمل المهمة الواقعية'],
  };
  function typeLabel(t){ const d=TYPE_LABELS_DEF[t]; return d?L(d[0],d[1]):esc(t); }
  function promptLabel(t){ const d=PROMPTS_DEF[t]; return d?L(d[0],d[1]):''; }

  /* ---- 7. PUBLIC API ----
     The app (app.html) calls PEL_STAGE_FACTORY(deps) inside its IIFE, gets
     this API back, exposes window.PEL_LESSON_STAGE + the curriculum data,
     and rewires openLesson itself (it owns the binding, and points
     deps.openLesson at the rewired version). */
  return {
    Stage, PEL_BEGINNER, PEL_BEGINNER_PHASES,
    buildSequence, buildItems, buildConversation,
    pronunciationHint, // exposed for regression tests
    // Exposed for tests + future dashboard integration (SRS state summary).
    srsRecord, srsDueList,
    // Server sync (app.html calls srsSync() at login; see section 5c).
    srsSync
  };
};
