-- STEP: simpler Saudi titles, tips and what-not-to-do notes, 3 extra correction exercises per lesson.
-- Hamza is written where the word needs it. Idempotent: items 100/101 and exercises 100-102 are replaced per lesson.
begin;
update public.lessons set title_ar = 'القواعد: a و the وكميات' where id = 'step-grammar-articles-quantifiers';
delete from public.lesson_items where lesson_id='step-grammar-articles-quantifiers' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-grammar-articles-quantifiers' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-articles-quantifiers',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• a و an قبل الشي اللي ما حددناه: I need a pen. (أي قلم)
• the قبل الشي المعروف عند الاثنين: The pen is on the desk.
• an قبل الصوت (مو الحرف): an hour، a university.
• much مع اللي ما نعدّه (water)، many مع اللي نعدّه (books).','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-articles-quantifiers',101,'explain','What not to do','لا تسوي كذا:
• لا تحط a قبل كلمة جمع: a books غلط.
• لا تحط a أو the قبل much و many.
• لا تحط the قبل اسم عام: Life is short، مو The life is short.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-articles-quantifiers',100,'correct','{"type": "correct", "mode": "pick", "right": "I drank a lot of water.", "wrong": "I drank many water.", "why_ar": "water ما نعدّه، فنستخدم a lot of أو much، مو many.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-articles-quantifiers',101,'correct','{"type": "correct", "mode": "pick", "right": "She is an honest girl.", "wrong": "She is a honest girl.", "why_ar": "حرف h في honest ما ينطق، فالكلمة تبدأ بصوت صوتي، نقول an.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-articles-quantifiers',102,'correct','{"type": "correct", "mode": "pick", "right": "How many students are here?", "wrong": "How much students are here?", "why_ar": "students نعدّهم، فنستخدم many.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'القواعد: can و must و should' where id = 'step-grammar-modals';
delete from public.lesson_items where lesson_id='step-grammar-modals' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-grammar-modals' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-modals',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• بعد can و must و should نكتب الفعل على طبيعته بدون to وبدون s.
• must = لازم (قوي)، should = المفروض (نصيحة).
• mustn''t = ممنوع، don''t have to = مو لازم. هذي بالذات تجي كثير في الاختبار.
• might = يمكن (احتمال ضعيف)، will = أكيد تقريباً.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-modals',101,'explain','What not to do','لا تسوي كذا:
• لا تقول She can sings. الصح She can sing.
• لا تحط to بعد can: can to go غلط.
• لا تخلط mustn''t مع don''t have to، معناهم مختلف.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-modals',100,'correct','{"type": "correct", "mode": "pick", "right": "He should see a doctor.", "wrong": "He should sees a doctor.", "why_ar": "بعد should الفعل بدون s.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-modals',101,'correct','{"type": "correct", "mode": "pick", "right": "You mustn''t smoke here.", "wrong": "You don''t have to smoke here.", "why_ar": "mustn''t معناها ممنوع، لكن don''t have to معناها مو لازم.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-modals',102,'correct','{"type": "correct", "mode": "pick", "right": "I can drive a car.", "wrong": "I can to drive a car.", "why_ar": "بعد can ما نحط to.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'القواعد: لما ما نذكر مين سوّى الشي (Passive)' where id = 'step-grammar-passive';
delete from public.lesson_items where lesson_id='step-grammar-passive' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-grammar-passive' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-passive',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• الشكل: be + الفعل بالشكل الثالث (written, done, made).
• ركّز على الزمن: is/are للحاضر، was/were للماضي، will be للمستقبل.
• نستخدم by فقط لو مهم نذكر مين سوّى الشي.
• اسأل نفسك: الشي هو اللي انعمل له الفعل؟ إذا إي، يعني Passive.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-passive',101,'explain','What not to do','لا تسوي كذا:
• لا تنسى be: The door painted غلط، الصح The door was painted.
• لا تستخدم الفعل الأول بعد be: was cancel غلط، الصح was cancelled.
• لا تحط by مع كل جملة، بس لو تبي تذكر الفاعل.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-passive',100,'correct','{"type": "correct", "mode": "pick", "right": "The letter was written yesterday.", "wrong": "The letter wrote yesterday.", "why_ar": "الرسالة انكتبت، فنحتاج was written.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-passive',101,'correct','{"type": "correct", "mode": "pick", "right": "English is spoken in many countries.", "wrong": "English speaks in many countries.", "why_ar": "اللغة تنتكلم، فنحتاج is spoken.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-passive',102,'correct','{"type": "correct", "mode": "pick", "right": "The food will be served at eight.", "wrong": "The food will serve at eight.", "why_ar": "بعد will be نحط الشكل الثالث served.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'القواعد: in و on و at وغيرها' where id = 'step-grammar-prepositions';
delete from public.lesson_items where lesson_id='step-grammar-prepositions' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-grammar-prepositions' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-prepositions',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• at للوقت المحدد (at 5) والمكان الصغير (at the door).
• on لليوم والتاريخ (on Monday) وللسطح (on the table).
• in للشهر والسنة (in May) وللمكان الكبير (in Riyadh).
• بعد بعض الأفعال نحفظ الحرف: depend on، listen to، arrive in.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-prepositions',101,'explain','What not to do','لا تسوي كذا:
• لا تترجم حرف الجر حرفياً من العربي، غالباً يختلف.
• لا تقول depend of، الصح depend on.
• لا تقول discuss about، الصح discuss وبس.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-prepositions',100,'correct','{"type": "correct", "mode": "pick", "right": "I will see you on Friday.", "wrong": "I will see you in Friday.", "why_ar": "مع الأيام نستخدم on.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-prepositions',101,'correct','{"type": "correct", "mode": "pick", "right": "She arrived in Jeddah.", "wrong": "She arrived to Jeddah.", "why_ar": "arrive in للمدينة، مو to.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-prepositions',102,'correct','{"type": "correct", "mode": "pick", "right": "We depend on him.", "wrong": "We depend of him.", "why_ar": "الصح depend on.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'القواعد: who و which و that' where id = 'step-grammar-relative-clauses';
delete from public.lesson_items where lesson_id='step-grammar-relative-clauses' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-grammar-relative-clauses' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-relative-clauses',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• who للشخص، which للشي، that للاثنين.
• whose = حقّه، وبعدها اسم دايماً.
• اللي بعد who أو which يكمّل المعنى، لا تكرر الفاعل.
• في الاختبار: شوف اللي قبل الفراغ، شخص ولا شي؟','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-grammar-relative-clauses',101,'explain','What not to do','لا تسوي كذا:
• لا تقول The man who he called، الصح The man who called.
• لا تستخدم which للشخص.
• لا تنسى الفعل بعد who: The girl who won.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-relative-clauses',100,'correct','{"type": "correct", "mode": "pick", "right": "The woman who lives here is kind.", "wrong": "The woman which lives here is kind.", "why_ar": "للشخص نستخدم who.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-relative-clauses',101,'correct','{"type": "correct", "mode": "pick", "right": "This is the book that I bought.", "wrong": "This is the book that I bought it.", "why_ar": "ما نكرر it، that تقوم مقامه.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-grammar-relative-clauses',102,'correct','{"type": "correct", "mode": "pick", "right": "He is the man whose car was stolen.", "wrong": "He is the man who car was stolen.", "why_ar": "نحتاج whose لأنها تعني حقّه.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'ستيب استماع: أرقام وتفاصيل' where id = 'step-listening-numbers-details';
delete from public.lesson_items where lesson_id='step-listening-numbers-details' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-listening-numbers-details' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-listening-numbers-details',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• اكتب الرقم بالأرقام بسرعة، لا تنتظر نهاية الجملة.
• 13 و 30 يتشابهون: thirteen الضغط على الآخر، thirty الضغط على الأول.
• انتبه لكلمات التغيير: actually, sorry, I mean. الرقم الأخير هو الصح.
• اقرأ الأسئلة قبل ما يبدأ الصوت.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-listening-numbers-details',101,'explain','What not to do','لا تسوي كذا:
• لا تعتمد على أول رقم تسمعه.
• لا تضيّع وقت على رقم فاتك، كمّل للسؤال الجاي.
• لا تغيّر جوابك بدون سبب واضح.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-listening-numbers-details',100,'correct','{"type": "correct", "mode": "pick", "right": "The stress is on the end of thirteen.", "wrong": "The stress is on the start of thirteen.", "why_ar": "في thirteen الضغط على آخر الكلمة، وفي thirty على أولها.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-listening-numbers-details',101,'correct','{"type": "correct", "mode": "pick", "right": "Fifteen ends with a clear teen sound.", "wrong": "Fifty ends with a clear teen sound.", "why_ar": "fifty ما فيها teen، بس fifteen فيها.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-listening-numbers-details',102,'correct','{"type": "correct", "mode": "pick", "right": "The meeting is at nine.", "wrong": "The meeting is at nineteen.", "why_ar": "انتبه للنهاية، nine بدون teen.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'ستيب استماع: طرق تجاوب صح' where id = 'step-listening-strategies';
delete from public.lesson_items where lesson_id='step-listening-strategies' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-listening-strategies' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-listening-strategies',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• اقرأ الأسئلة والخيارات قبل الصوت، وحدد وش تبحث عنه.
• ركّز على الكلمات المهمة: الاسم، الرقم، المكان، السبب.
• الجواب غالباً بكلمات مختلفة عن اللي في الصوت (نفس المعنى).
• لو ما عرفت الجواب، اختر أقرب خيار وكمّل، لا توقف.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-listening-strategies',101,'explain','What not to do','لا تسوي كذا:
• لا تحاول تفهم كل كلمة، يكفي الفكرة.
• لا تختار الخيار لأنه فيه نفس الكلمة اللي سمعتها، غالباً فخ.
• لا تتأخر على سؤال واحد.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-listening-strategies',100,'correct','{"type": "correct", "mode": "pick", "right": "Read the questions before the audio.", "wrong": "Read the questions after the audio.", "why_ar": "نقرأ الأسئلة قبل الصوت عشان نعرف وش نبحث عنه.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-listening-strategies',101,'correct','{"type": "correct", "mode": "pick", "right": "Choose the answer with the same meaning.", "wrong": "Choose the answer with the same word you heard.", "why_ar": "الخيار اللي فيه نفس الكلمة غالباً فخ.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-listening-strategies',102,'correct','{"type": "correct", "mode": "pick", "right": "Do not stop on one hard question.", "wrong": "Stop for five minutes on one question.", "why_ar": "ما نوقف على سؤال واحد، نكمل.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'ستيب اختبار تجريبي: الوقت والمراجعة' where id = 'step-mock-test-timing';
delete from public.lesson_items where lesson_id='step-mock-test-timing' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-mock-test-timing' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-mock-test-timing',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• قسّم الوقت: كم دقيقة لكل قسم، وراقب الساعة.
• ابدأ بالأسئلة السهلة وخلّ الصعبة لآخر.
• علّم على السؤال الصعب وارجع له بعدين.
• خلّ آخر دقيقتين للمراجعة، تأكد إنك جاوبت كل الأسئلة.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-mock-test-timing',101,'explain','What not to do','لا تسوي كذا:
• لا تترك سؤال بدون جواب، التخمين أحسن من الفراغ.
• لا تقعد أكثر من دقيقة على سؤال واحد.
• لا تغيّر الأجوبة في آخر لحظة إلا لو متأكد.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-mock-test-timing',100,'correct','{"type": "correct", "mode": "pick", "right": "Answer every question, even if you guess.", "wrong": "Leave a question empty if you are not sure.", "why_ar": "التخمين أحسن من ترك الفراغ.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-mock-test-timing',101,'correct','{"type": "correct", "mode": "pick", "right": "Move on from a hard question.", "wrong": "Spend ten minutes on one hard question.", "why_ar": "نتخطاه ونرجع له لو بقي وقت.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-mock-test-timing',102,'correct','{"type": "correct", "mode": "pick", "right": "Keep two minutes for review.", "wrong": "Use all the time on the first question.", "why_ar": "نخلي وقت آخر الاختبار للمراجعة.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'ستيب كتابة: كيف ترتب الجملة' where id = 'step-writing-sentence-structure';
delete from public.lesson_items where lesson_id='step-writing-sentence-structure' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-writing-sentence-structure' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-writing-sentence-structure',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• الترتيب الأساسي: الفاعل + الفعل + المفعول: She reads books.
• الصفة قبل الاسم: a big house، مو a house big.
• الظرف عادةً آخر الجملة: I study every day.
• الجملة الإنجليزية لازم فيها فعل دايماً، حتى مع is و are.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-writing-sentence-structure',101,'explain','What not to do','لا تسوي كذا:
• لا تبدأ بالفعل مثل العربي: Went I غلط، الصح I went.
• لا تحذف is أو are: She tall غلط، الصح She is tall.
• لا تحط الصفة بعد الاسم.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-writing-sentence-structure',100,'correct','{"type": "correct", "mode": "pick", "right": "I like coffee.", "wrong": "Like I coffee.", "why_ar": "الفاعل أول شي، وبعده الفعل.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-writing-sentence-structure',101,'correct','{"type": "correct", "mode": "pick", "right": "She is a good teacher.", "wrong": "She is a teacher good.", "why_ar": "الصفة قبل الاسم.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-writing-sentence-structure',102,'correct','{"type": "correct", "mode": "pick", "right": "He is very tired.", "wrong": "He very tired.", "why_ar": "الجملة تحتاج الفعل is.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'ستيب قراءة: كيف تقرأ القطعة بسرعة' where id = 'step-pack2-01';
delete from public.lesson_items where lesson_id='step-pack2-01' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-pack2-01' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-pack2-01',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• اقرأ السؤال أول، بعدين دوّر على الجواب في القطعة.
• أول جملة في الفقرة غالباً فيها الفكرة الأساسية.
• الكلمات المفتاحية في السؤال تساعدك تلقى مكان الجواب.
• لو كلمة صعبة، خمّن معناها من الجملة اللي حواليها.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-pack2-01',101,'explain','What not to do','لا تسوي كذا:
• لا تقرأ القطعة كلمة كلمة قبل الأسئلة.
• لا تقف عند كل كلمة ما تعرفها.
• لا تجاوب من خبرتك الشخصية، اعتمد على القطعة.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-01',100,'correct','{"type": "correct", "mode": "pick", "right": "Read the questions first.", "wrong": "Read every word slowly first.", "why_ar": "نبدأ بالأسئلة عشان نعرف وش ندور عليه.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-01',101,'correct','{"type": "correct", "mode": "pick", "right": "The main idea is in the first sentence.", "wrong": "The main idea is always at the end.", "why_ar": "غالباً الفكرة الأساسية بأول الفقرة.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-01',102,'correct','{"type": "correct", "mode": "pick", "right": "Guess the word from the context.", "wrong": "Stop and look up every word.", "why_ar": "السياق يعطيك معنى الكلمة بدون قاموس.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'ستيب قواعد: كلمات الزمن مع الأفعال' where id = 'step-pack2-02';
delete from public.lesson_items where lesson_id='step-pack2-02' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-pack2-02' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-pack2-02',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• since مع نقطة بداية: since 2020. for مع مدة: for two years.
• already في الجمل المثبتة، yet في النفي والأسئلة.
• yesterday و last week تعني ماضي بسيط، مو present perfect.
• مع since و for نستخدم have/has + الشكل الثالث للفعل.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-pack2-02',101,'explain','What not to do','لا تسوي كذا:
• لا تقول I live here since 2020، الصح I have lived here since 2020.
• لا تستخدم yesterday مع have: I have seen him yesterday غلط.
• لا تخلط since و for.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-02',100,'correct','{"type": "correct", "mode": "pick", "right": "I have lived here for five years.", "wrong": "I live here for five years.", "why_ar": "مع for ومدة نحتاج have lived.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-02',101,'correct','{"type": "correct", "mode": "pick", "right": "I saw him yesterday.", "wrong": "I have seen him yesterday.", "why_ar": "yesterday تعني ماضي بسيط.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-02',102,'correct','{"type": "correct", "mode": "pick", "right": "She has worked here since 2018.", "wrong": "She has worked here for 2018.", "why_ar": "2018 نقطة بداية، فنستخدم since.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'ستيب مفردات: كلمات بنفس المعنى' where id = 'step-pack2-03';
delete from public.lesson_items where lesson_id='step-pack2-03' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-pack2-03' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-pack2-03',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• large = big، start = begin، الاختبار يعطيك الكلمة وتختار المرادف.
• انتبه لنوع الكلمة: decision اسم، decide فعل، successful صفة.
• جرّب تحط الخيار مكان الكلمة في الجملة، إذا ضبط المعنى فهو الجواب.
• احفظ الكلمات في جمل، مو لحالها.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-pack2-03',101,'explain','What not to do','لا تسوي كذا:
• لا تختار الكلمة بس لأنها تشبه الكلمة بالشكل.
• لا تخلط الاسم بالفعل: a decide غلط.
• لا تتجاهل نوع الكلمة المطلوبة في الجملة.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-03',100,'correct','{"type": "correct", "mode": "pick", "right": "He made a good decision.", "wrong": "He made a good decide.", "why_ar": "بعد صفة نحتاج اسم، decision.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-03',101,'correct','{"type": "correct", "mode": "pick", "right": "The company was successful.", "wrong": "The company was success.", "why_ar": "نحتاج صفة بعد was، successful.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-03',102,'correct','{"type": "correct", "mode": "pick", "right": "We will begin at nine.", "wrong": "We will beginning at nine.", "why_ar": "بعد will الفعل على طبيعته begin.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lessons set title_ar = 'ستيب تمرين: اكتشف الأخطاء بالوقت' where id = 'step-pack2-04';
delete from public.lesson_items where lesson_id='step-pack2-04' and idx in (100,101); delete from public.lesson_exercises where lesson_id='step-pack2-04' and idx in (100,101,102);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-pack2-04',100,'explain','Tips for the exam','نصائح تساعدك في الاختبار:
• اقرأ الجملة كاملة وانتبه للفعل أول شي، هل يتطابق مع الفاعل؟
• بعدها شوف a و an و the، ثم حروف الجر.
• الخطأ غالباً في كلمة وحدة مظللة، لا تغيّر الجملة كلها.
• وقتك قصير: نص دقيقة للسؤال كحد أقصى.','');
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) values ('step-pack2-04',101,'explain','What not to do','لا تسوي كذا:
• لا تتأكد من كل شي بنفس الدرجة، ابدأ بالأشياء الشائعة.
• لا تختار خيار لأنه يبدو غريب، لازم تعرف السبب.
• لا تقعد طويل على سؤال صعب.','');
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-04',100,'correct','{"type": "correct", "mode": "pick", "right": "She goes to school every day.", "wrong": "She go to school every day.", "why_ar": "الفاعل مفرد، فالفعل يأخذ s.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-04',101,'correct','{"type": "correct", "mode": "pick", "right": "He gave me an apple.", "wrong": "He gave me a apple.", "why_ar": "apple يبدأ بصوت صوتي، فنقول an.", "why_en": "see the Arabic hint"}'::jsonb);
insert into public.lesson_exercises (lesson_id, idx, type, payload) values ('step-pack2-04',102,'correct','{"type": "correct", "mode": "pick", "right": "We arrived at the airport.", "wrong": "We arrived to the airport.", "why_ar": "arrive at للمكان المحدد.", "why_en": "see the Arabic hint"}'::jsonb);
update public.lesson_exercises set payload = replace(payload::text, 'التصريف الثالث', 'الشكل الثالث للفعل (زي written و done)')::jsonb where lesson_id like 'step-%' and payload::text like '%التصريف الثالث%';
update public.lesson_items set ar_meaning = replace(ar_meaning, 'التصريف الثالث', 'الشكل الثالث للفعل (زي written و done)'), example_ar = replace(example_ar, 'التصريف الثالث', 'الشكل الثالث للفعل (زي written و done)') where lesson_id like 'step-%' and (ar_meaning like '%التصريف الثالث%' or example_ar like '%التصريف الثالث%');
update public.lesson_exercises set payload = replace(payload::text, 'تطابق الفاعل والفعل', 'الفعل يمشي مع الفاعل')::jsonb where lesson_id like 'step-%' and payload::text like '%تطابق الفاعل والفعل%';
update public.lesson_items set ar_meaning = replace(ar_meaning, 'تطابق الفاعل والفعل', 'الفعل يمشي مع الفاعل'), example_ar = replace(example_ar, 'تطابق الفاعل والفعل', 'الفعل يمشي مع الفاعل') where lesson_id like 'step-%' and (ar_meaning like '%تطابق الفاعل والفعل%' or example_ar like '%تطابق الفاعل والفعل%');
update public.lesson_exercises set payload = replace(payload::text, 'المبني للمجهول', 'الجملة اللي ما تذكر الفاعل')::jsonb where lesson_id like 'step-%' and payload::text like '%المبني للمجهول%';
update public.lesson_items set ar_meaning = replace(ar_meaning, 'المبني للمجهول', 'الجملة اللي ما تذكر الفاعل'), example_ar = replace(example_ar, 'المبني للمجهول', 'الجملة اللي ما تذكر الفاعل') where lesson_id like 'step-%' and (ar_meaning like '%المبني للمجهول%' or example_ar like '%المبني للمجهول%');
update public.lesson_exercises set payload = replace(payload::text, 'الفعل المضارع', 'الفعل في الحاضر')::jsonb where lesson_id like 'step-%' and payload::text like '%الفعل المضارع%';
update public.lesson_items set ar_meaning = replace(ar_meaning, 'الفعل المضارع', 'الفعل في الحاضر'), example_ar = replace(example_ar, 'الفعل المضارع', 'الفعل في الحاضر') where lesson_id like 'step-%' and (ar_meaning like '%الفعل المضارع%' or example_ar like '%الفعل المضارع%');
update public.lesson_exercises set payload = replace(payload::text, 'الفعل الماضي', 'الفعل في الماضي')::jsonb where lesson_id like 'step-%' and payload::text like '%الفعل الماضي%';
update public.lesson_items set ar_meaning = replace(ar_meaning, 'الفعل الماضي', 'الفعل في الماضي'), example_ar = replace(example_ar, 'الفعل الماضي', 'الفعل في الماضي') where lesson_id like 'step-%' and (ar_meaning like '%الفعل الماضي%' or example_ar like '%الفعل الماضي%');
commit;
