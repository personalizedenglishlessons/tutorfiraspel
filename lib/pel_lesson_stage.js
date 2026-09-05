/* ============================================================
   PEL CURRICULUM STAGE
   A focused, one-activity-at-a-time lesson player. Placed INSIDE
   the app IIFE so it reuses translitEn, getLesson, speak,
   markLessonComplete, escapeHtml, toast, ACADEMIES, etc.
   It does NOT remove the workspace reader; it sits in front of
   it. openLesson is rewired to launch this stage, with a clean
   fallback to the original workspace reader if anything is off.
   Progression stays server-authoritative: completion calls the
   existing markLessonComplete() which fires complete_activity()
   + XP + review queue + the pel-progress-updated event.
   ============================================================ */
(function () {
  'use strict';

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
          example: { en: 'I eat bread.', ar: 'آكل خبز.', translit: 'اي ايت بريد.' },
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
          en: 'eat', ar: 'آكل', translit: 'ايت', pos: 'verb',
          ipa: '/iːt/',
          example: { en: 'I eat breakfast.', ar: 'آكل الفطار.', translit: 'اي ايت بريكفاست.' },
          usage: { en: 'To put food in your mouth. The opposite is drink.', ar: 'تحط اكل بفمك. العكس تشرب.' },
          sentences: [
            { en: 'I eat.', ar: 'آكل.', translit: 'اي ايت.' },
            { en: 'I eat rice.', ar: 'آكل رز.', translit: 'اي ايت رايس.' },
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
      title: { en: 'Subject Pronouns', ar: 'ضماير الفاعل' },
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
      title: { en: 'The Be Verb', ar: 'فعل الكون' },
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
      title: { en: 'A, An, The', ar: 'ادوات التعريف' },
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
.pel-stage-body{flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 20px 40px;}
.pel-activity-card{width:100%;max-width:680px;position:relative;}
.pel-act-head{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
.pel-act-type{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gold);background:rgba(200,169,106,.12);border:1px solid rgba(200,169,106,.25);padding:4px 10px;border-radius:999px;}
.pel-act-prompt{font-size:1.02rem;color:var(--text-secondary);margin-inline-start:auto;}
.pel-act-card-inner{background:var(--card);border:1px solid var(--border);border-radius:22px;padding:34px 34px 30px;box-shadow:var(--shadow-soft);}
.pel-act-en{font-size:2.1rem;font-weight:700;line-height:1.2;letter-spacing:-.01em;direction:ltr;}
.pel-act-translit{font-size:1.15rem;color:var(--gold-soft);margin-top:8px;font-weight:500;direction:rtl;text-align:start;}
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
.pel-option{background:var(--card-elevated);border:1px solid var(--border);border-radius:14px;padding:16px 18px;cursor:pointer;text-align:start;font-size:1rem;color:var(--text);transition:border-color .2s,background .2s,transform .1s;display:flex;flex-direction:column;gap:3px;}
.pel-option:hover{border-color:rgba(200,169,106,.5);background:var(--card);}
.pel-option:active{transform:scale(.985);}
.pel-option.selected{border-color:var(--gold);background:rgba(200,169,106,.1);}
.pel-option.correct{border-color:var(--success);background:rgba(66,163,106,.12);}
.pel-option.wrong{border-color:var(--danger);background:rgba(210,92,92,.1);}
.pel-option .o-en{font-weight:600;direction:ltr;}
.pel-option .o-ar{font-size:.84rem;color:var(--text-muted);direction:rtl;text-align:start;}
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
.pel-card-enter{animation:pelCardIn .35s var(--ease);}
@keyframes pelCardIn{from{opacity:0;transform:translateY(14px) scale(.99);}to{opacity:1;transform:none;}}
#pelLessonStage[dir="rtl"] .pel-act-prompt{margin-inline-start:0;margin-inline-end:auto;}
.pel-reveal.show{opacity:1 !important;max-height:500px !important;}
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
    try { if (typeof accountPrefs !== 'undefined' && accountPrefs && accountPrefs.lang === 'ar') return true; } catch(e){}
    return document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
  };
  const L = (en, arab) => (ar() ? `<span class="arabic">${arab}</span>` : en);
  function tr(t){ return (typeof translitEn === 'function' && t) ? translitEn(t) : ''; }
  function esc(s){ return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s==null?'':s); }
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
      let a = ACADEMIES.find(x=>x.id===academyId); if(a) return a;
      if(lessonId && typeof academyLessonList==='function'){
        for(const ac of ACADEMIES){ try{ if(academyLessonList(ac).some(l=>l.id===lessonId)) return ac; }catch(e){} }
      }
    }catch(e){}
    return null;
  }
  function play(text, lang){ try{ if(typeof speak==='function'){ speak(text); return; } }catch(e){} try{ if('speechSynthesis' in window){ window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang=lang||'en-US'; u.rate=.85; window.speechSynthesis.speak(u);} }catch(e){} }
  function shuffle(a){ const b=a.slice(); for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; }
  function norm(s){ return String(s||'').toLowerCase().replace(/[\u2018\u2019']/g,"'").replace(/[^a-z0-9'\s]/g,'').replace(/\s+/g,' ').trim(); }
  function sayOk(){ return L('Correct','صح'); }
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
      const sents = (it.sentences && it.sentences.length) ? it.sentences : [ex, {en:'Do you '+(it.en.includes(' ')?'use ':'know ')+it.en+'?', ar:'', translit:''}];
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

  function buildSequence(lesson, lessonId){
    const items = buildItems(lesson, lessonId);
    const conv = buildConversation(lesson, lessonId);
    const quiz = (lesson && Array.isArray(lesson.quiz)) ? lesson.quiz : [];
    const seq = [];
    const main = items.slice(0, 3);

    // 1. Learn the key teaching items (word -> sentence -> question)
    // Progressive reveal: student sees the word, tries to recall, then reveals meaning.
    main.forEach((it, i) => {
      seq.push({ type:'learn', item:it, skill:'vocabulary' });
      if(it.sentences[1]) seq.push({ type:'learn_sentence', item:it, sentence:it.sentences[1], skill:'vocabulary' });
    });

    // 2. Recognize (multiple choice en -> ar) — test first 2 items
    if(main.length >= 2){
      main.slice(0, 2).forEach((it) => {
        seq.push({ type:'recognize', item:it, pool:main, skill:'vocabulary' });
      });
    }

    // 3. Match pairs
    if(items.length >= 4){
      seq.push({ type:'match', items:shuffle(items).slice(0, Math.min(5, items.length)), skill:'vocabulary' });
    }

    // 4. Build a sentence (arrange words) — one item
    const arrangeItem = main[0];
    const arrangeTarget = (arrangeItem && arrangeItem.sentences[0]) || {en:items[0].en, ar:items[0].ar, translit:items[0].translit};
    seq.push({ type:'arrange_words', sentence:arrangeTarget, skill:'grammar' });

    // 5. Fill the missing word — use main[1]
    const fbItem = main[1] || main[0] || items[0];
    seq.push({ type:'fill_blank', item:fbItem, sentence:(fbItem.sentences[1]||fbItem.sentences[0]||{en:fbItem.en,ar:fbItem.ar,translit:fbItem.translit}), skill:'grammar' });

    // 6. Spell the word — use main[2]
    const spellItem = main[2] || main[0] || items[0];
    seq.push({ type:'spell', item:spellItem, skill:'spelling' });

    // 7. Translate ar -> en — use main[1]
    seq.push({ type:'translate', item:fbItem, skill:'translation' });

    // 8. Listen + identify — use main[2]
    const listenItem = main[2] || main[0] || items[0];
    seq.push({ type:'listen', item:listenItem, skill:'listening' });
    seq.push({ type:'identify_heard', item:listenItem, pool:main, skill:'listening' });

    // 9. Pronunciation — use main[0]
    seq.push({ type:'pronunciation', item:main[0]||items[0], skill:'pronunciation' });

    // 10. Speaking — use main[1]'s sentence
    const speakItem = main[1] || main[0] || items[0];
    seq.push({ type:'speaking', sentence:(speakItem.sentences[1]||speakItem.sentences[0]||{en:speakItem.en,ar:speakItem.ar,translit:speakItem.translit}), skill:'speaking' });

    // 11. Conversation response
    if(conv.length >= 3){
      seq.push({ type:'conversation_response', conv, idx:1, skill:'speaking' });
    }

    // 12. Complete the dialogue
    if(conv.length >= 4){
      seq.push({ type:'complete_dialogue', conv, gap:3, pool:main, skill:'grammar' });
    }

    // 13. Grammar correction or choose natural
    if(quiz.length){
      seq.push({ type:'choose_natural_expression', quiz, skill:'grammar' });
    }else{
      const grItem = main[2] || main[0] || items[0];
      seq.push({ type:'grammar_correction', item:grItem, skill:'grammar' });
    }

    // 14. Free response
    seq.push({ type:'free_response', item:main[0]||items[0], skill:'writing' });

    // 15. Review (active recall)
    seq.push({ type:'review', items:main, skill:'review' });

    // 16. Challenge (quick fire)
    seq.push({ type:'challenge', items, skill:'mastery' });

    return seq;
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
      const titleEn = lesson.title || (academy?academy.en:'Lesson');
      const titleAr = lesson.ar || (academy?academy.ar:'');
      $('#pelStgEye').innerHTML = academy ? `${esc(academy.en)} <span class="arabic">${esc(academy.ar)}</span>` : L('Lesson','درس');
      $('#pelStgTitle').textContent = ar() ? (titleAr || titleEn) : (titleEn || titleAr);
      const backLbl = $('#pelStgBack').querySelector('span'); if(backLbl) backLbl.innerHTML = L('Exit','خروج');
      el.setAttribute('dir', ar()?'rtl':'ltr');
      document.body.classList.add('pel-lesson-mode');
      el.classList.add('open');
      this.render();
      if(window.lucide) lucide.createIcons();
      return true;
    },
    close(){
      if(!this.state) return;
      if(!this.state.done){
        // confirm exit
      }
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
      if(renderer){ renderer(inner, act, ctx); } else { inner.innerHTML = `<p>${esc(label)}</p>`; this.ready(ctx, L('Continue','متابعة'), ()=>this.next()); }
      if(window.lucide) lucide.createIcons();
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
      const s=ctx.s; s.checked=true; s.correct=correct;
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
      if(s.idx < s.seq.length){ s.idx++; this.render(); }
    },
    renderDone(){
      const s=this.state; const body=$('#pelStgBody'); const foot=$('#pelStgFoot');
      foot.style.display='none';
      if($('#pelStgCount')) $('#pelStgCount').textContent = `${s.seq.length} / ${s.seq.length}`;
      if($('#pelStgBar')) $('#pelStgBar').style.width = '100%';
      body.innerHTML = `<div class="pel-stage-done pel-card-enter">
        <div class="crown">✦</div>
        <h2>${L('Lesson complete','اكتمل الدرس')}</h2>
        <p>${L('You finished '+((s.lesson&&s.lesson.title)||'the lesson')+'.','خلصت درس '+((s.lesson&&s.lesson.ar)||(s.lesson&&s.lesson.title)||'الدرس')+'.')}</p>
        <div class="xp">+50 XP</div>
        <div class="pel-done-row">
          <button class="pel-act-primary" id="pelDoneNext">${L('Next lesson','الدرس الجاي')}</button>
          <button class="pel-act-primary ghost" id="pelDoneHome">${L('Back to path','ارجع للمسار')}</button>
        </div></div>`;
      // record progression (server-authoritative via existing path)
      try{ if(typeof markLessonComplete==='function') markLessonComplete(s.academyId, s.lessonId); }catch(e){}
      s.done=true;
      const next = $('#pelDoneNext'); const home = $('#pelDoneHome');
      home.onclick = ()=>{ this.close(); try{ if(typeof goToView==='function') goToView('home'); }catch(e){} };
      next.onclick = ()=>{
        // open the next unlocked lesson if available
        try{
          if(typeof academyLessonList==='function' && typeof openLesson==='function'){
            const list = academyLessonList(s.academy);
            const ci = list.findIndex(l=>l.id===s.lessonId);
            const nx = ci>=0 ? list[ci+1] : null;
            if(nx && !nx.locked){ this.close(); openLesson(s.academyId, nx.id); return; }
          }
        }catch(e){}
        this.close(); try{ if(typeof goToView==='function') goToView('home'); }catch(e){}
      };
      if(window.lucide) lucide.createIcons();
    },
  };

  /* ---- 6. ACTIVITY RENDERERS ---- */
  const RENDERERS = {
    learn(inner, act, ctx){
      const it=act.item;
      // Progressive reveal: show English word + audio first, then reveal
      // the meaning. This forces the student to attempt recall before
      // seeing the answer, instead of passively reading everything.
      let revealed = false;
      const reveal = () => {
        if(revealed) return; revealed = true;
        const revealEl = inner.querySelector('#pelLearnReveal');
        if(revealEl){
          revealEl.innerHTML = `
            <div class="pel-act-translit">${esc(it.translit)}</div>
            <div class="pel-act-ar arabic">${esc(it.ar)}</div>
            <div class="pel-act-example">
              <div class="ex-en">${esc(it.example.en)}</div>
              <div class="ex-tr">${esc(it.example.translit)}</div>
              <div class="ex-ar arabic">${esc(it.example.ar)}</div>
            </div>
            ${usageHtml(it.usage)}`;
          revealEl.classList.add('show');
        }
        // Switch button to "Got it"
        ctx.btn.textContent = L('Got it','فهمت');
        ctx.btn.disabled = false;
      };
      inner.innerHTML = `
        <div class="pel-act-en">${esc(it.en)}</div>
        ${it.ipa?`<div class="pel-act-ipa">${esc(it.ipa)}</div>`:''}
        <button class="pel-act-play" id="pelLearnPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
        <div id="pelLearnReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>
        <div id="pelLearnShowWrap" style="margin-top:14px;">
          <button class="btn-outline" id="pelLearnShow" style="width:100%;">${L('Show meaning','اعرض المعنى')}</button>
        </div>`;
      $('#pelLearnPlay').onclick = ()=>play(it.en,'en-US');
      $('#pelLearnShow').onclick = ()=>{ reveal(); };
      ctx.self.ready(ctx, L('Show meaning','اعرض المعنى'), ()=>{
        if(!revealed){ reveal(); }
        else { ctx.self.next(); }
      });
    },
    learn_sentence(inner, act, ctx){
      const s=act.sentence;
      // Progressive reveal: show English sentence + audio first, then meaning.
      let revealed = false;
      const reveal = () => {
        if(revealed) return; revealed = true;
        const r = inner.querySelector('#pelSenReveal');
        if(r){
          r.innerHTML = `<div class="pel-act-translit">${esc(s.translit)}</div><div class="pel-act-ar arabic">${esc(s.ar)}</div>`;
          r.classList.add('show');
        }
        ctx.btn.textContent = L('Continue','متابعة');
        ctx.btn.disabled = false;
      };
      inner.innerHTML = `
        <div class="pel-act-en">${esc(s.en)}</div>
        <button class="pel-act-play" id="pelSenPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
        <div id="pelSenReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>
        <div id="pelSenShowWrap" style="margin-top:14px;">
          <button class="btn-outline" id="pelSenShow" style="width:100%;">${L('Show meaning','اعرض المعنى')}</button>
        </div>`;
      $('#pelSenPlay').onclick = ()=>play(s.en,'en-US');
      $('#pelSenShow').onclick = ()=>{ reveal(); };
      ctx.self.ready(ctx, L('Show meaning','اعرض المعنى'), ()=>{
        if(!revealed){ reveal(); }
        else { ctx.self.next(); }
      });
    },
    recognize(inner, act, ctx){
      const it=act.item; const pool=act.pool.length>=3?act.pool:[...act.pool, ...PEL_STARTER_ITEMS].slice(0,4);
      const opts = shuffle([it, ...shuffle(pool.filter(x=>x.en!==it.en)).slice(0,3)]).slice(0,4);
      let sel=null;
      const prompt = ar() ? `<span class="arabic">وش معنى <b>${esc(it.en)}</b>؟</span>` : `What does <b>${esc(it.en)}</b> mean?`;
      inner.innerHTML = `<div class="pel-act-prompt">${prompt}</div>
        <div class="pel-options" id="pelRecOpts">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}"><span class="o-en arabic">${esc(o.ar)}</span><span class="o-ar">${esc(o.translit||'')}</span></button>`).join('')}</div>`;
      const btns = inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{
        btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i;
        ctx.btn.disabled=false;
      });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        const correct = opts[sel] && opts[sel].en===it.en;
        btns.forEach((b,i)=>{ b.classList.remove('selected'); if(opts[i].en===it.en) b.classList.add('correct'); else if(i===sel) b.classList.add('wrong'); });
        ctx.self.mark(ctx, correct);
      });
    },
    match(inner, act, ctx){
      const its=act.items; const en=shuffle(its); const ar=shuffle(its);
      let pickEn=null, pickAr=null, matched=0; const total=its.length;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Match the pairs','طابق الازواج')}</div>
        <div class="pel-tiles" style="grid-template-columns:1fr 1fr;">
          <div id="pelMatchEn">${en.map((o,i)=>`<div class="pel-tile" data-en="${i}">${esc(o.en)}</div>`).join('')}</div>
          <div id="pelMatchAr">${ar.map((o,i)=>`<div class="pel-tile" data-ar="${i}"><span class="arabic">${esc(o.ar)}</span></div>`).join('')}</div>
        </div>`;
      const ens=inner.querySelectorAll('[data-en]'); const ars=inner.querySelectorAll('[data-ar]');
      const tryMatch=()=>{ if(pickEn===null||pickAr===null) return;
        const a=en[pickEn], b=ar[pickAr];
        if(a.en===b.en){ ens[pickEn].classList.add('matched'); ars[pickAr].classList.add('matched'); matched++; pickEn=pickAr=null;
          if(matched>=total) ctx.self.mark(ctx,true);
        }else{ ens[pickEn].classList.remove('sel'); ars[pickAr].classList.remove('sel'); pickEn=pickAr=null; }
      };
      ens.forEach((el,i)=>el.onclick=()=>{ if(el.classList.contains('matched'))return; ens.forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); pickEn=i; tryMatch(); });
      ars.forEach((el,i)=>el.onclick=()=>{ if(el.classList.contains('matched'))return; ars.forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); pickAr=i; tryMatch(); });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>ctx.self.mark(ctx, matched>=total));
    },
    arrange_words(inner, act, ctx){
      const s=act.sentence; const words = s.en.replace(/[.?!]/g,'').split(/\s+/).filter(Boolean);
      const tokens = shuffle(words);
      let placed=[];
      inner.innerHTML = `<div class="pel-act-prompt">${L('Build the sentence','رتب الجملة')}</div>
        <div class="pel-arrange-drop" id="pelArrDrop" data-ph="${L('Tap words below','اضغط الكلمات تحت')}"></div>
        <div class="pel-tokens" id="pelArrTk">${tokens.map((t,i)=>`<button class="pel-token" data-i="${i}">${esc(t)}</button>`).join('')}</div>
        <button class="btn-outline" id="pelArrHint" style="margin-top:14px;width:100%;">${L('Show hint','اعرض تلميح')}</button>
        <div id="pelArrHintReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
      const drop=$('#pelArrDrop'); const tk=$('#pelArrTk');
      const renderDrop=()=>{ drop.innerHTML = placed.map((t,i)=>`<button class="pel-token" data-pi="${i}">${esc(t)}</button>`).join('') || '';
        drop.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{ const idx=+b.dataset.pi; const tok=placed[idx]; placed.splice(idx,1); addTokenBack(tok); renderDrop(); });
      };
      const hintBtn=$('#pelArrHint'); const hintRev=$('#pelArrHintReveal');
      const addTokenBack=(tok)=>{ const i=tokens.indexOf(tok); const btn=document.createElement('button'); btn.className='pel-token'; btn.dataset.i=i; btn.textContent=tok; btn.onclick=()=>{ if(btn.disabled)return; btn.remove(); placed.push(tok); renderDrop(); }; tk.appendChild(btn); };
      if(hintBtn) hintBtn.onclick = () => {
        if(hintRev){
          hintRev.innerHTML = `<div class="pel-act-hint arabic" style="margin-top:14px;">${esc(s.ar)}</div>`;
          hintRev.classList.add('show');
          hintBtn.style.display = 'none';
        }
      };
      tk.querySelectorAll('.pel-token').forEach(b=>b.onclick=()=>{ b.remove(); placed.push(tokens[+b.dataset.i]); renderDrop(); });
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        const built = placed.join(' ').toLowerCase().replace(/\s+/g,' ').trim();
        const target = s.en.replace(/[.?!]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
        ctx.self.mark(ctx, built===target);
      });
    },
    fill_blank(inner, act, ctx){
      const it=act.item; const s=act.sentence||it.sentences[0];
      const words=s.en.replace(/[.?!]/g,'').split(/\s+/).filter(Boolean);
      const blankIdx=Math.max(0, words.findIndex(w=>norm(w)===norm(it.en)));
      const target=blankIdx>=0?words[blankIdx]:it.en;
      const before=words.slice(0,blankIdx).join(' '); const after=words.slice(blankIdx+1).join(' ');
      const distractors=shuffle([target, ...shuffle(itemsDistractor(act,it)).slice(0,2)]).slice(0,3);
      inner.innerHTML = `<div class="pel-act-prompt">${L('Complete the sentence','كمل الجملة')}</div>
        <div style="font-size:1.15rem;line-height:1.9;">${esc(before)} <span id="pelFillSlot" style="display:inline-block;min-width:90px;border-bottom:2px solid var(--gold);text-align:center;color:var(--gold);">?</span> ${esc(after)}</div>
        <div class="pel-options" style="margin-top:18px;">${distractors.map((o,i)=>`<button class="pel-option" data-i="${i}"><span class="o-en">${esc(o)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option'); const slot=$('#pelFillSlot'); let sel=null;
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=b.textContent.trim(); slot.textContent=sel; });
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ btns.forEach((b,i)=>{ if(b.textContent.trim()===target) b.classList.add('correct'); else if(b.textContent.trim()===sel) b.classList.add('wrong'); }); ctx.self.mark(ctx, norm(sel)===norm(target)); });
    },
    spell(inner, act, ctx){
      const it=act.item;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Spell the English for','املك الانجليزي لـ')}:</div>
        <div class="pel-act-ar arabic" style="font-size:1.6rem;">${esc(it.ar)}</div>
        <div class="pel-act-hint arabic">${esc(it.translit)}</div>
        <input class="pel-input" id="pelSpellIn" style="margin-top:16px;" placeholder="${L('Type the word...','اكتب الكلمة...')}" autocomplete="off" autocapitalize="off" />`;
      const inp=$('#pelSpellIn'); setTimeout(()=>inp.focus(),50);
      inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); ctx.btn.click(); } });
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>ctx.self.mark(ctx, norm(inp.value)===norm(it.en)));
    },
    translate(inner, act, ctx){
      const it=act.item;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Translate to English','ترجم للانجليزي')}:</div>
        <div class="pel-act-ar arabic" style="font-size:1.5rem;">${esc(it.ar)}</div>
        <input class="pel-input" id="pelTrIn" style="margin-top:16px;" placeholder="${L('Type in English...','اكتب بالانجليزي...')}" autocomplete="off" autocapitalize="off" />`;
      const inp=$('#pelTrIn'); setTimeout(()=>inp.focus(),50);
      inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); ctx.btn.click(); } });
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>ctx.self.mark(ctx, norm(inp.value)===norm(it.en)));
    },
    listen(inner, act, ctx){
      const it=act.item;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Listen carefully','انصح باهتمام')}</div>
        <button class="pel-act-play" id="pelLsnPlay" style="font-size:1.1rem;padding:16px 26px;"><i data-lucide="volume-2" width="20" height="20"></i> ${L('Play','تشغيل')}</button>
        <div class="pel-act-hint">${L('Tap play and listen. You will identify it next.','اضغط تشغيل واصغي. بتحددها بعد.')}</div>`;
      $('#pelLsnPlay').onclick=()=>play(it.example.en||it.en,'en-US');
      ctx.self.ready(ctx, L('Continue','متابعة'), ()=>ctx.self.next());
    },
    identify_heard(inner, act, ctx){
      const it=act.item; const pool=act.pool.length>=3?act.pool:[...act.pool,...PEL_STARTER_ITEMS].slice(0,4);
      const opts=shuffle([it,...shuffle(pool.filter(x=>x.en!==it.en)).slice(0,3)]).slice(0,4); let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('What did you hear?','وش سمعت؟')}</div>
        <button class="pel-act-play" id="pelIdPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Play again','شغل ثانية')}</button>
        <div class="pel-options" id="pelIdOpts" style="margin-top:16px;">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}"><span class="o-en">${esc(o.en)}</span><span class="o-ar arabic">${esc(o.ar)}</span></button>`).join('')}</div>`;
      $('#pelIdPlay').onclick=()=>play(it.example.en||it.en,'en-US');
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ const correct=opts[sel]&&opts[sel].en===it.en; btns.forEach((b,i)=>{ if(opts[i].en===it.en)b.classList.add('correct'); else if(i===sel)b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
    },
    pronunciation(inner, act, ctx){
      const it=act.item;
      // Use the existing recordAndScore/pronFeedback flow for speech recognition.
      // Show the word and translit but NOT the Arabic meaning during the
      // pronunciation attempt.
      const canRec = (typeof canRecognize==='function') ? canRecognize() : false;
      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Pronounce the word','انطق الكلمة')}</div>
        <div class="pel-act-en">${esc(it.en)}</div>
        <div class="pel-act-translit">${esc(it.translit)}</div>
        ${it.ipa?`<div class="pel-act-ipa">${esc(it.ipa)}</div>`:''}
        <button class="pel-act-play" id="pelProPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
        <div id="pelProMicWrap" style="margin-top:16px;">
          ${canRec ? `<button class="pel-act-play pel-mic-btn" id="pelProMic" style="width:100%;background:rgba(210,92,92,.16);border-color:rgba(210,92,92,.4);color:var(--danger);"><i data-lucide="mic" width="16" height="16"></i> ${L('Speak now','انطق الحين')}</button>
            <div id="pelProFb" class="pel-mic-feedback" style="margin-top:12px;"></div>
            <div class="pel-act-hint">${L('Press the button and say the word clearly.','اضغط الزر وانطق الكلمة بوضوح.')}</div>`
          : `<div class="pel-act-hint">${L('Say it out loud, then mark yourself.','نطقها بصوت عالي، بعدها قيّم نفسك.')}</div>
            <button class="pel-act-play" id="pelProSelf" style="width:100%;"><i data-lucide="check" width="16" height="16"></i> ${L('I said it','نطقتها')}</button>`}
        </div>
        <div id="pelProReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
      $('#pelProPlay').onclick = ()=>play(it.en,'en-US');
      const revealAr = () => {
        const r = inner.querySelector('#pelProReveal');
        if(r){
          r.innerHTML = `<div class="pel-act-ar arabic" style="margin-top:12px;">${esc(it.ar)}</div>`;
          r.classList.add('show');
        }
      };
      if(canRec){
        const micBtn=$('#pelProMic'); const fb=$('#pelProFb');
        micBtn.onclick = () => {
          if(typeof recordAndScore !== 'function'){ ctx.self.ready(ctx, L('I said it','نطقتها'), ()=>ctx.self.mark(ctx,true)); return; }
          micBtn.classList.add('recording');
          fb.innerHTML = `<div class="pel-act-hint">${L('Listening...','استمع...')}</div>`;
          recordAndScore((heard, score, err)=>{
            micBtn.classList.remove('recording');
            revealAr();
            if(err){
              fb.innerHTML = `<div class="pel-act-hint" style="color:var(--danger);">${typeof micErrorMessage==='function'?esc(micErrorMessage(err)):L('Mic error','خطأ بالمايك')}</div>`;
              ctx.self.ready(ctx, L('Try again','حاول ثانية'), ()=>ctx.self.render());
              return;
            }
            const pf = (typeof pronFeedback==='function') ? pronFeedback(heard, it.en) : {score};
            const sc = (pf.score != null ? pf.score : score);
            const ok = sc != null && sc >= 60;
            const tip = ar() ? pf.tipAr : pf.tipEn;
            fb.innerHTML = `<div style="font-size:1.25rem; font-weight:700; color:${ok?'var(--success)':'var(--gold)'};">${sc!=null?sc:'—'}% ${ok?'✓':'×'}</div>`
              + (heard?`<div class="pel-act-hint">${L('Heard','سمعت')}: ${esc(heard)}</div>`:'')
              + (tip?`<div class="pel-act-hint arabic">${esc(tip)}</div>`:'');
            ctx.self.mark(ctx, ok);
          }, it.en, micBtn);
        };
        ctx.self.ready(ctx, L('I said it','نطقتها'), ()=>{ revealAr(); ctx.self.mark(ctx, true); });
      } else {
        $('#pelProSelf').onclick = ()=>{ revealAr(); ctx.btn.disabled=false; ctx.self.mark(ctx, true); };
        ctx.self.ready(ctx, L('I said it','نطقتها'), ()=>{ revealAr(); ctx.self.mark(ctx, true); });
      }
    },
    speaking(inner, act, ctx){
      const s=act.sentence;
      // Use the existing recordAndScore/pronFeedback flow for speech recognition.
      // Hide the Arabic translation during the attempt.
      const canRec = (typeof canRecognize==='function') ? canRecognize() : false;
      inner.innerHTML = `
        <div class="pel-act-prompt">${L('Say the sentence','نطق الجملة')}</div>
        <div class="pel-act-en">${esc(s.en)}</div>
        <div class="pel-act-translit">${esc(s.translit)}</div>
        <button class="pel-act-play" id="pelSpkPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
        <div id="pelSpkMicWrap" style="margin-top:16px;">
          ${canRec ? `<button class="pel-act-play pel-mic-btn" id="pelSpkMic" style="width:100%;background:rgba(210,92,92,.16);border-color:rgba(210,92,92,.4);color:var(--danger);"><i data-lucide="mic" width="16" height="16"></i> ${L('Speak now','انطق الحين')}</button>
            <div id="pelSpkFb" class="pel-mic-feedback" style="margin-top:12px;"></div>
            <div class="pel-act-hint">${L('Press the button and say the sentence clearly.','اضغط الزر وانطق الجملة بوضوح.')}</div>`
          : `<div class="pel-act-hint">${L('Say it out loud, then mark yourself.','نطقها بصوت عالي، بعدها قيّم نفسك.')}</div>
            <button class="pel-act-play" id="pelSpkSelf" style="width:100%;"><i data-lucide="check" width="16" height="16"></i> ${L('I said it','نطقتها')}</button>`}
        </div>
        <div id="pelSpkReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>`;
      $('#pelSpkPlay').onclick = ()=>play(s.en,'en-US');
      const revealAr = () => {
        const r = inner.querySelector('#pelSpkReveal');
        if(r){
          r.innerHTML = `<div class="pel-act-ar arabic" style="margin-top:12px;">${esc(s.ar)}</div>`;
          r.classList.add('show');
        }
      };
      if(canRec){
        const micBtn=$('#pelSpkMic'); const fb=$('#pelSpkFb');
        micBtn.onclick = () => {
          if(typeof recordAndScore !== 'function'){ ctx.self.ready(ctx, L('I said it','نطقتها'), ()=>ctx.self.mark(ctx,true)); return; }
          micBtn.classList.add('recording');
          fb.innerHTML = `<div class="pel-act-hint">${L('Listening...','استمع...')}</div>`;
          recordAndScore((heard, score, err)=>{
            micBtn.classList.remove('recording');
            revealAr();
            if(err){
              fb.innerHTML = `<div class="pel-act-hint" style="color:var(--danger);">${typeof micErrorMessage==='function'?esc(micErrorMessage(err)):L('Mic error','خطأ بالمايك')}</div>`;
              ctx.self.ready(ctx, L('Try again','حاول ثانية'), ()=>ctx.self.render());
              return;
            }
            const pf = (typeof pronFeedback==='function') ? pronFeedback(heard, s.en) : {score};
            const sc = (pf.score != null ? pf.score : score);
            const ok = sc != null && sc >= 60;
            const tip = ar() ? pf.tipAr : pf.tipEn;
            fb.innerHTML = `<div style="font-size:1.25rem; font-weight:700; color:${ok?'var(--success)':'var(--gold)'};">${sc!=null?sc:'—'}% ${ok?'✓':'×'}</div>`
              + (heard?`<div class="pel-act-hint">${L('Heard','سمعت')}: ${esc(heard)}</div>`:'')
              + (tip?`<div class="pel-act-hint arabic">${esc(tip)}</div>`:'');
            ctx.self.mark(ctx, ok);
          }, s.en, micBtn);
        };
        ctx.self.ready(ctx, L('I said it','نطقتها'), ()=>{ revealAr(); ctx.self.mark(ctx, true); });
      } else {
        $('#pelSpkSelf').onclick = ()=>{ revealAr(); ctx.btn.disabled=false; ctx.self.mark(ctx, true); };
        ctx.self.ready(ctx, L('I said it','نطقتها'), ()=>{ revealAr(); ctx.self.mark(ctx, true); });
      }
    },
    conversation_response(inner, act, ctx){
      const conv=act.conv; const i=act.idx; const line=conv[i]; const reply=conv[i+1];
      // Defensive guard: short dialogue (no next line) would throw on reply.en.
      if(!line || !reply){ ctx.self.next && ctx.self.next(); return; }
      const distractors=shuffle(conv.filter((c,j)=>j!==i+1).map(c=>c.en).filter(e=>e&&norm(e)!==norm(reply.en))).slice(0,2);
      const opts=shuffle([reply.en, ...distractors]); let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Reply naturally','رد بشكل طبيعي')}</div>
        <div class="pel-conv"><div class="pel-conv-line ${line.who}"><div>${esc(line.en)}</div><div class="tr arabic">${esc(line.ar)}</div></div></div>
        <div class="pel-options" style="margin-top:16px;">${opts.map((o,k)=>`<button class="pel-option" data-i="${k}"><span class="o-en">${esc(o)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=b.textContent.trim(); });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ const correct=norm(sel)===norm(reply.en); btns.forEach(b=>{ if(norm(b.textContent)===norm(reply.en))b.classList.add('correct'); else if(norm(b.textContent)===norm(sel))b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
    },
    complete_dialogue(inner, act, ctx){
      const conv=act.conv; const gap=act.gap; const target=conv[gap];
      const pool=act.pool.length?act.pool:PEL_STARTER_ITEMS;
      const opts=shuffle([target.en, ...shuffle(pool).slice(0,2).map(p=>p.en)]).slice(0,3); let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Complete the dialogue','كمل المحادثة')}</div>
        <div class="pel-conv">${conv.map((c,j)=> j===gap ? `<div class="pel-conv-line pel-conv-gap">${L('...','...')}</div>` : `<div class="pel-conv-line ${c.who}"><div>${esc(c.en)}</div><div class="tr arabic">${esc(c.ar)}</div></div>`).join('')}</div>
        <div class="pel-options" style="margin-top:16px;">${opts.map((o,k)=>`<button class="pel-option" data-i="${k}"><span class="o-en">${esc(o)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=b.textContent.trim(); });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ const correct=norm(sel)===norm(target.en); btns.forEach(b=>{ if(norm(b.textContent)===norm(target.en))b.classList.add('correct'); else if(norm(b.textContent)===norm(sel))b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
    },
    grammar_correction(inner, act, ctx){
      const it=act.item; const correct=it.sentences[0]||{en:it.example.en,ar:it.ar};
      const wrong=correct.en.replace(/^I /, 'I is ');
      inner.innerHTML = `<div class="pel-act-prompt">${L('Fix the mistake','صحح الخطا')}</div>
        <div class="pel-act-en" style="font-size:1.5rem;">${esc(wrong)}</div>
        <input class="pel-input" id="pelGrIn" style="margin-top:16px;" placeholder="${L('Type the correct sentence...','اكتب الجملة الصحيحة...')}" autocomplete="off" autocapitalize="off" />
        <div class="pel-act-hint arabic">${esc(correct.ar)}</div>
        <div id="pelGrFb" class="pel-grammar-fb" style="margin-top:14px;"></div>`;
      const inp=$('#pelGrIn'); setTimeout(()=>inp.focus(),50);
      inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); ctx.btn.click(); } });
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{
        const ok = norm(inp.value)===norm(correct.en);
        ctx.self.mark(ctx, ok);
        // Free local grammar feedback (async, non-blocking): shows WHY the
        // answer is off and a better version. Only for real sentences.
        if(window.pelReviewWriting && inp.value.trim().split(/\s+/).length>1){
          window.pelReviewWriting(inp.value, document.getElementById('pelGrFb'));
        }
      });
    },
    choose_natural_expression(inner, act, ctx){
      const q=act.quiz[0]; const opts=(q.options||[]); const correctIdx=q.correct;
      let sel=null;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Choose the natural one','اختر الطبيعي')}</div>
        <div style="font-size:1.1rem;margin-bottom:14px;">${q.q}</div>
        <div class="pel-options">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}"><span class="o-en">${esc(o)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ const correct=sel===correctIdx; btns.forEach((b,i)=>{ if(i===correctIdx)b.classList.add('correct'); else if(i===sel)b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
    },
    free_response(inner, act, ctx){
      const it=act.item;
      inner.innerHTML = `<div class="pel-act-prompt">${L('Write your own answer','اكتب جوابك')}</div>
        <div class="pel-act-en">${esc(it.example.en)}</div>
        <div class="pel-act-ar arabic">${esc(it.example.ar)}</div>
        <textarea class="pel-input" id="pelFrIn" style="margin-top:16px;min-height:90px;" placeholder="${L('Write in English...','اكتب بالانجليزي...')}"></textarea>
        <button class="btn-outline" id="pelFrReview" style="margin-top:10px;"><span class="arabic">راجع كتابتي</span>، Review my writing</button>
        <div id="pelFrFb" class="pel-grammar-fb" style="margin-top:12px;"></div>`;
      const inp=$('#pelFrIn'); setTimeout(()=>inp.focus(),50);
      const reviewBtn=$('#pelFrReview');
      if(reviewBtn) reviewBtn.onclick = function(){
        const v = inp.value.trim();
        if(v.length < 3){ if(typeof toast==='function') toast('<span class="arabic">اكتب جملة اولا</span>، Write a sentence first.'); return; }
        if(window.pelReviewWriting) window.pelReviewWriting(v, document.getElementById('pelFrFb'), {botLine: it.example.en});
      };
      ctx.self.ready(ctx, L('Done','تم'), ()=>ctx.self.mark(ctx, inp.value.trim().length>2));
    },
    review(inner, act, ctx){
      // Active recall: show English, hide Arabic. Student must try to
      // remember the meaning before revealing it. This is real review,
      // not passive display.
      const items=act.items;
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
          <div class="pel-act-en">${esc(it.en)}</div>
          <button class="pel-act-play" id="pelRevPlay"><i data-lucide="volume-2" width="16" height="16"></i> ${L('Hear it','اسمعها')}</button>
          <div id="pelRevReveal" class="pel-reveal" style="opacity:0;max-height:0;overflow:hidden;transition:opacity .4s,max-height .4s;"></div>
          <div style="display:flex;gap:10px;margin-top:14px;">
            <button class="btn-outline" id="pelRevYes" style="flex:1;">${L('I knew it','عرفتها')}</button>
            <button class="btn-outline" id="pelRevNo" style="flex:1;">${L('Forgot','نسيتها')}</button>
          </div>`;
        $('#pelRevPlay').onclick = ()=>play(it.en,'en-US');
        const reveal = (gotIt) => {
          if(revealed) return; revealed = true;
          const r = inner.querySelector('#pelRevReveal');
          if(r){
            r.innerHTML = `<div class="pel-act-translit">${esc(it.translit)}</div><div class="pel-act-ar arabic">${esc(it.ar)}</div>`;
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
      const items=shuffle(act.items).slice(0,3); const it=items[0]; const pool=items;
      const opts=shuffle([it,...shuffle(pool.filter(x=>x.en!==it.en)).slice(0,3)]).slice(0,4); let sel=null;
      const prompt = ar() ? `<span class="arabic">سوال سريع: وش معنى <b>${esc(it.en)}</b>؟</span>` : `Quick check: what does <b>${esc(it.en)}</b> mean?`;
      inner.innerHTML = `<div class="pel-act-prompt">${prompt}</div>
        <div class="pel-options">${opts.map((o,i)=>`<button class="pel-option" data-i="${i}"><span class="o-en arabic">${esc(o.ar)}</span></button>`).join('')}</div>`;
      const btns=inner.querySelectorAll('.pel-option');
      btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); sel=+b.dataset.i; });
      ctx.btn.disabled=true;
      ctx.self.ready(ctx, L('Check','تحقق'), ()=>{ const correct=opts[sel]&&opts[sel].en===it.en; btns.forEach((b,i)=>{ if(opts[i].en===it.en)b.classList.add('correct'); else if(i===sel)b.classList.add('wrong'); }); ctx.self.mark(ctx,correct); });
    },
  };

  function itemsDistractor(act, it){
    // build a small pool of wrong word strings from the lesson vocab
    const lesson = (Stage.state&&Stage.state.lesson)||{};
    const pool = (lesson.vocab||[]).map(v=>v.en).filter(e=>e&&norm(e)!==norm(it.en));
    return pool.length?pool:['yes','no','today','tomorrow'];
  }

  const TYPE_LABELS_DEF = {
    learn:['Learn','تعلم'], learn_sentence:['Sentence','جملة'], recognize:['Recognize','تعرف'],
    match:['Match','طابق'], arrange_words:['Build','رتب'], fill_blank:['Fill','املا'],
    spell:['Spell','تهجى'], translate:['Translate','ترجم'], listen:['Listen','استمع'],
    identify_heard:['Identify','حدد'], pronunciation:['Pronounce','انطق'], speaking:['Speak','تحدث'],
    conversation_response:['Respond','رد'], complete_dialogue:['Dialogue','حوار'],
    grammar_correction:['Fix','صحح'], choose_natural_expression:['Choose','اختر'],
    free_response:['Write','اكتب'], review:['Review','راجع'], challenge:['Challenge','تحدّي'],
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
  };
  function typeLabel(t){ const d=TYPE_LABELS_DEF[t]; return d?L(d[0],d[1]):t; }
  function promptLabel(t){ const d=PROMPTS_DEF[t]; return d?L(d[0],d[1]):''; }

  /* ---- 7. WIRE INTO THE APP ---- */
  // Expose + rewire openLesson so the focused stage leads, with a clean
  // fallback to the original workspace reader.
  window.PEL_LESSON_STAGE = Stage;
  // Read-only curriculum phase metadata (no local progress). The path view / Supabase
  // can mirror these slugs to render a real progression. Kept here so it ships with the module.
  window.PEL_BEGINNER_PHASES = PEL_BEGINNER_PHASES;
  window.PEL_BEGINNER_LESSONS = PEL_BEGINNER;
  if(typeof openLesson==='function'){
    const _origOpenLesson = openLesson;
    openLesson = function(academyId, lessonId){
      try{
        if(typeof subBlocked==='function' && subBlocked()){ return _origOpenLesson(academyId, lessonId); }
        const ok = Stage.open(academyId, lessonId);
        if(ok) return;
      }catch(e){ /* fall through to original */ }
      return _origOpenLesson(academyId, lessonId);
    };
  }

  // When the server reports progression changed, refresh nothing here;
  // the existing renderControlCenter / renderActivePath already react.
  // Re-render the stage only if it is open and the lesson was completed
  // elsewhere (handled inside renderDone via markLessonComplete).
})();
