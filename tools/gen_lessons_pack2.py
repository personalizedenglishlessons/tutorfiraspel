#!/usr/bin/env python3
# Lesson pack 2: +4 lessons each to b2-complete-course, c1-advanced-english,
# c2-near-native, step-exam-prep (16 total).
# Arabic: Saudi/Abha casual, plain alef (no hamza), no em/en dashes.
# translit + example_tr are Arabic-script phonetic of the English.
import json, urllib.request, os

PAT = os.environ.get("SUPABASE_PAT", "")
if not PAT:
    raise SystemExit("Set SUPABASE_PAT env var before running.")
PROJ = "lewoochehpiycocvfwtz"
UA = "PelAdminScript/2.0"
URL = f"https://api.supabase.com/v1/projects/{PROJ}/database/query"

def esc(s):
    return str(s).replace("'", "''")

def sql_val(v):
    if v is None: return "null"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    return "'" + esc(v) + "'"

def arr_val(items):
    return "ARRAY[" + ",".join(sql_val(i) for i in items) + "]::text[]"

# item: {kind, en, ar(meaning), tr(translit ar-script), ex_en, ex_ar, ex_tr, note_en, note_ar}
def I(kind, en, ar, tr, ex_en, ex_ar, ex_tr, note_en, note_ar):
    return {"kind":kind,"en":en,"ar":ar,"tr":tr,"ex_en":ex_en,"ex_ar":ex_ar,"ex_tr":ex_tr,"note_en":note_en,"note_ar":note_ar}

# choose exercise: options=[{t,ok}], question {en,ar}
def CH(en, ar, opts):
    return {"type":"choose","payload":{"type":"choose","question":{"en":en,"ar":ar},"options":opts},"hint_en":None,"hint_ar":None,"hint_tr":None}

# translate exercise: en->ar
def TR(src, ans, accepts):
    return {"type":"translate","payload":{"type":"translate","dir":"en-ar","source":src,"answer":ans,"accept":accepts},"hint_en":None,"hint_ar":None,"hint_tr":None}

def L(id, ten, tar, level, academy, items, exs, skills, goals, contexts, prereqs=None, minutes=8, kind="core"):
    return {"id":id,"title_en":ten,"title_ar":tar,"level":level,"academy":academy,"items":items,"exercises":exs,
            "skills":skills,"goals":goals,"contexts":contexts,"prereqs":prereqs or [],"minutes":minutes,"kind":kind}

LESSONS = []

# ===================== B2 COMPLETE COURSE =====================
LESSONS += [L("b2-pack2-01","Nuanced Opinions","الاراء المرموقة","B2","b2-complete-course",
  [
    I("word","I would argue that","اقول انه","ايد ارقو ذات",
      "I would argue that the plan needs more time.","اقول انه الخطة تحتاج وقت اكثر.","ايد ارقو ذات ذا بلان نيدز مور تايم.",
      "Soft way to give a strong opinion.","طريقة لطيفة تعطي رأي قوي."),
    I("phrase","to be fair","للقول الحق","تو بي فير",
      "To be fair, the idea is not bad.","للقول الحق، الفيده مو وينة.","تو بي فير، ذا ايدا از نات باد.",
      "Adds balance before a critique.","يضيف توازن قبل النقد."),
    I("phrase","on the other hand","من جهة ثانية","اون ذا ازر هاند",
      "On the other hand, the cost is high.","من جهة ثانية، التكلفة عالية.","اون ذا ازر هاند، ذا كوست از هاي.",
      "Introduces a contrast.","يقدم تباين."),
    I("sentence","I see your point, but I think","اشوف وجهة نظرك بس اشوف","اي سي يور بوينت بت اي ثنك",
      "I see your point, but I think we should wait.","اشوف وجهة نظرك بس اشوف لازم ننتظر.","اي سي يور بوينت بت اي ثنك وي شود ويت.",
      "Acknowledge then disagree politely.","اعترف ثم عارض بأدب."),
  ],
  [
    CH("What does 'to be fair' do?","وش تسوي 'تو بي فير'؟",[
      {"t":"يضيف توازن قبل النقد","ok":True},{"t":"تنهي الجملة","ok":False},{"t":"تسأل سؤال","ok":False}]),
    TR("On the other hand, the cost is high.","من جهة ثانية التكلفة عالية",["من جهة ثانية التكلفة عالية","من جهة ثانية تكلفة عالية"]),
  ],
  ["speaking","opinions"],["Express nuanced opinions politely"],["discussion","debate"],prereqs=["b2-complete-course"]),

 L("b2-pack2-02","Advanced Conditionals","الشرط المتقدم","B2","b2-complete-course",
  [
    I("pattern","If I had known","لو كنت عرفت","ايف اي هاد نون",
      "If I had known, I would have called.","لو كنت عرفت كنت اتصلت.","ايف اي هاد نون، اي وود هاف كولد.",
      "Third conditional: unreal past.","الشرط الثالث: ماضي غير حقيقي."),
    I("word","would have","كان كان","وود هاف",
      "I would have helped you.","كنت ساعدتك.","اي وود هاف هيلبت يو.",
      "Used for hypothetical past results.","لنتائج ماضية افتراضية."),
    I("phrase","unless","الا اذا","انليس",
      "I will go unless it rains.","بروح الا اذا ماطر.","اي ويل قو انليس ايت رينز.",
      "Means 'if not'.","تعني 'اذا ما'."),
    I("sentence","Were I in your place, I would wait","لو كنت مكانك انتظرت","ور اي ان يور بليس اي وود ويت",
      "Were I in your place, I would wait.","لو كنت مكانك انتظرت.","ور اي ان يور بليس اي وود ويت.",
      "Formal inversion for conditionals.","قلب رسمي للشرط."),
  ],
  [
    CH("Which is third conditional?","وشنو الشرط الثالث؟",[
      {"t":"If I had known, I would have called","ok":True},{"t":"If it rains, I will go","ok":False},{"t":"If I were rich, I would travel","ok":False}]),
    TR("I would have helped you.","كنت ساعدتك",["كنت ساعدتك","كان ساعدتك"]),
  ],
  ["grammar","conditionals"],["Use third and formal conditionals"],["writing","formal"],prereqs=["b2-pack2-01"]),

 L("b2-pack2-03","Formal vs Informal Register","الرسمي مقابل العادي","B2","b2-complete-course",
  [
    I("word","purchase","يشتري","بيرتشيس",
      "I will purchase the items.","بشتري الاغراض.","اي ويل بيرتشيس ذا ايتيمز.",
      "Formal for 'buy'.","رسمي لـ 'اشتري'."),
    I("phrase","obtain","يحصل","اوبتين",
      "Please obtain a receipt.","ابغى تحصل على وصل.","بليز اوبتين ا ريست.",
      "Formal for 'get'.","رسمي لـ 'خذ'."),
    I("phrase","kids","عياي","كيدز",
      "The kids are playing.","العيايل يلعبون.","ذا كيدز ار بلاينق.",
      "Informal for 'children'.","عامي لـ 'اطفال'."),
    I("sentence","I would like to inquire about","حاب اسال عن","اي وود لايك تو انكواير اباوت",
      "I would like to inquire about the course.","حاب اسال عن الكورس.","اي وود لايك تو انكواير اباوت ذا كورس.",
      "Formal request opener.","افتتاح طلب رسمي."),
  ],
  [
    CH("Which is formal?","وشنو الرسمي؟",[
      {"t":"I will purchase the items","ok":True},{"t":"I will buy the stuff","ok":False},{"t":"Gimme the things","ok":False}]),
    TR("The kids are playing.","العيايل يلعبون",["العيايل يلعبون","الاطفال يلعبون"]),
  ],
  ["register","speaking"],["Match register to context"],["work","social"],prereqs=["b2-pack2-01"]),

 L("b2-pack2-04","Reading Inference and Tone","الاستنتاج والنبرة","B2","b2-complete-course",
  [
    I("word","inference","استنتاج","انفرنس",
      "Make an inference from the text.","استنتج من النص.","ميك ان انفرنس فروم ذا تكست.",
      "A conclusion from evidence.","استنتاج من الادلة."),
    I("word","tone","نبرة","تون",
      "The tone is sarcastic.","النبرة سخرية.","ذا تون از ساركاستيك.",
      "The writer's attitude.","موقف الكاتب."),
    I("phrase","implies","يلمح","امبلايز",
      "She implies that it is late.","تلمح انه متاخر.","شي امبلايز ذات ايت از ليت.",
      "Suggests without saying.","تشير بدون تصريح."),
    I("sentence","The author suggests that","الكاتب يشير الى","ذا اذر ساجستس ذات",
      "The author suggests that time is short.","الكاتب يشير الى ان الوقت قصير.","ذا اذر ساجستس ذات تايم از شورت.",
      "Tone clue sentence.","جملة دلالة على النبرة."),
  ],
  [
    CH("What is an inference?","وش هو الاستنتاج؟",[
      {"t":"استنتاج من الادلة","ok":True},{"t":"نفس الكلمة","ok":False},{"t":"سؤال مباشر","ok":False}]),
    TR("The tone is sarcastic.","النبرة سخرية",["النبرة سخرية","النبرة فيها سخرية"]),
  ],
  ["reading","tone"],["Infer meaning and tone"],["reading","exam"],prereqs=["b2-pack2-01"])]

# ===================== C1 ADVANCED ENGLISH =====================
LESSONS += [L("c1-pack2-01","Advanced Collocations","التلازمات المتقدمة","C1","c1-advanced-english",
  [
    I("word","collocation","تلازم","كولوكيشن",
      "Heavy rain is a common collocation.","مطر غزير تلازم شائع.","هيفي رين از ا كومون كولوكيشن.",
      "Words that naturally go together.","كلمات تجي مع بعض طبيعي."),
    I("phrase","make a decision","يتخذ قرار","ميك ا ديسجن",
      "She made a difficult decision.","اتخذت قرار صعب.","شي ميد ا ديفيكالت ديسجن.",
      "Use 'make' not 'do' with decision.","استعمل 'make' مو 'do' مع decision."),
    I("phrase","take into account","ياخذ بعين الاعتبار","تيك انتو اكاونت",
      "Take the cost into account.","خذ التكلفة بعين الاعتبار.","تيك ذا كوست انتو اكاونت.",
      "Means 'consider'.","تعني 'اعتبر'."),
    I("word","commitment","التزام","كوميتمنت",
      "It shows real commitment.","يبين التزام حقيقي.","ات شووز ريل كوميتمنت.",
      "Strong collocation with 'show'.","تلازم قوي مع 'show'."),
  ],
  [
    CH("Which is correct?","وشنو الصح؟",[
      {"t":"make a decision","ok":True},{"t":"do a decision","ok":False},{"t":"take a decision","ok":True}]),
    TR("Take the cost into account.","خذ التكلفة بعين الاعتبار",["خذ التكلفة بعين الاعتبار","اعتبر التكلفة"]),
  ],
  ["vocabulary","collocations"],["Use advanced collocations"],["writing","academic"],prereqs=["c1-advanced-english"]),

 L("c1-pack2-02","Discourse Markers and Cohesion","روابط الخطاب والترابط","C1","c1-advanced-english",
  [
    I("word","moreover","بالاضافة","مور اوف",
      "Moreover, the data is clear.","بالاضافة، البيانات واضحة.","مور اوف، ذا ديتا از كلير.",
      "Adds a supporting point.","يضيف نقطة داعمة."),
    I("word","nevertheless","ومع ذلك","نيفر ذا ليس",
      "It rained; nevertheless, we went.","ماطرت؛ ومع ذلك، رحنا.","ات ريند؛ نيفر ذا ليس، وي وينت.",
      "Concedes then continues.","يسلم ثم يكمل."),
    I("phrase","in contrast","في المقابل","ان كونتراست",
      "In contrast, sales dropped.","في المقابل، المبيعات هبطت.","ان كونتراست، سيلز دروپت.",
      "Marks a difference.","يحدد تباين."),
    I("sentence","Having said that, we should","على الرغم من هذا، لازم","هافينق سيد ذات، وي شود",
      "Having said that, we should proceed.","على الرغم من هذا، لازم نكمل.","هافينق سيد ذات، وي شود بروسيد.",
      "Soft transition phrase.","عبارة انتقال لطيفة."),
  ],
  [
    CH("Which adds a supporting point?","وش يضيف نقطة داعمة؟",[
      {"t":"moreover","ok":True},{"t":"nevertheless","ok":False},{"t":"in contrast","ok":False}]),
    TR("It rained; nevertheless, we went.","ماطرت ومع ذلك رحنا",["ماطرت ومع ذلك رحنا","ماطرت ورحنا على الرغم من ذلك"]),
  ],
  ["cohesion","writing"],["Link ideas with discourse markers"],["essay","academic"],prereqs=["c1-pack2-01"]),

 L("c1-pack2-03","Critical Reading: Argument Analysis","قراءة نقدية: تحليل الحجة","C1","c1-advanced-english",
  [
    I("word","premise","مقدمة","بريميس",
      "Identify the premise of the argument.","حدد مقدمة الحجة.","ايدنتيفاي ذا بريميس اوف ذا ارقيومنت.",
      "The starting assumption.","الافتراض الاول."),
    I("word","flaw","خلل","فلور",
      "There is a flaw in the logic.","في خلل بالمنطق.","ذير از ا فلور ان ذا لوجك.",
      "A weakness in reasoning.","ضعف بالاستدلال."),
    I("phrase","counter-argument","حجة مضادة","كاونتر ارقيومنت",
      "Consider the counter-argument.","اعتبر الحجة المضادة.","كنسيدر ذا كاونتر ارقيومنت.",
      "An opposing point.","نقطة معارضة."),
    I("sentence","The evidence does not support","الادلة ما تدعم","ذا ايفيدنس دوز نات سبورت",
      "The evidence does not support the claim.","الادلة ما تدعم الادعاء.","ذا ايفيدنس دوز نات سبورت ذا كليم.",
      "Critical evaluation phrase.","عبارة تقييم نقدية."),
  ],
  [
    CH("What is a premise?","وش هي المقدمة؟",[
      {"t":"الافتراض الاول","ok":True},{"t":"النتيجة","ok":False},{"t":"الدليل","ok":False}]),
    TR("There is a flaw in the logic.","في خلل بالمنطق",["في خلل بالمنطق","في خطا بالمنطق"]),
  ],
  ["critical-reading","analysis"],["Analyze and evaluate arguments"],["academic","exam"],prereqs=["c1-pack2-01"]),

 L("c1-pack2-04","Sophisticated Vocabulary in Context","مفردات راقية بالسياق","C1","c1-advanced-english",
  [
    I("word","inevitable","حتمي","انيفتابل",
      "Change is inevitable.","التغيير حتمي.","تشانج از انيفتابل.",
      "Cannot be avoided.","ما يقدر يتجنب."),
    I("word","ambiguous","غامض","امبيغيوس",
      "The answer is ambiguous.","الجواب غامض.","ذا انسر از امبيغيوس.",
      "Has more than one meaning.","له اكثر من معنى."),
    I("phrase","scrutinize","يفحص بدقة","سكروتنايز",
      "Scrutinize the details.","افحص التفاصيل بدقة.","سكروتنايز ذا ديتيلز.",
      "Examine very carefully.","افحص بحذر شديد."),
    I("sentence","It is widely acknowledged that","من المعروف على نطاق واسع ان","ات از وايدي اكناوليدجد ذات",
      "It is widely acknowledged that exercise helps.","من المعروف ان الرياضة تساعد.","ات از وايدي اكناوليدجد ذات اكسرسايز هيلبس.",
      "Hedged general statement.","جملة عامة محسوبة."),
  ],
  [
    CH("What does inevitable mean?","وش معنى حتمي؟",[
      {"t":"ما يقدر يتجنب","ok":True},{"t":"نادر","ok":False},{"t":"غامض","ok":False}]),
    TR("The answer is ambiguous.","الجواب غامض",["الجواب غامض","الجواب غير واضح"]),
  ],
  ["vocabulary","context"],["Use sophisticated words precisely"],["academic","reading"],prereqs=["c1-pack2-01"])]

# ===================== C2 NEAR-NATIVE =====================
LESSONS += [L("c2-pack2-01","Idiomatic Mastery and Nuance","اتقان الاصطلاحات والظلال","C2","c2-near-native",
  [
    I("phrase","to play devil's advocate","يجادل عكس رأيه","تو بلي ديفلز ادفوكيت",
      "Let me play devil's advocate here.","خلني اجادل عكس رأيي هنا.","لت مي بلي ديفلز ادفوكيت هير.",
      "Argue against to test an idea." ,"يجادل عكس لاختبار فكرة."),
    I("phrase","a double-edged sword","سيف ذو حدين","ا دابل ايجد سورد",
      "Technology is a double-edged sword.","التقنية سيف ذو حدين.","تكناولوجي از ا دابل ايجد سورد.",
      "Something with pros and cons.","شي فيه محاسن ومساوي."),
    I("phrase","to read between the lines","يفهم ما وراء النص","تو ريد بيتوين ذا لاينز",
      "You must read between the lines.","لازم تفهم ما وراء النص.","يو مست ريد بيتوين ذا لاينز.",
      "Grasp implied meaning.","يفهم المعنى الضمني."),
    I("sentence","It goes without saying that","من البديهي ان","ات قووز ويذاوت ساينق ذات",
      "It goes without saying that practice matters.","من البديهي ان التمرين مهم.","ات قووز ويذاوت ساينق ذات براكتيس ماترز.",
      "States the obvious formally.","يبدي البديه رسميا."),
  ],
  [
    CH("What does 'read between the lines' mean?","وش معنى 'فهم ما وراء النص'؟",[
      {"t":"يفهم المعنى الضمني","ok":True},{"t":"يقرا بسرعة","ok":False},{"t":"يكتب سطور","ok":False}]),
    TR("Technology is a double-edged sword.","التقنية سيف ذو حدين",["التقنية سيف ذو حدين","التكنولوجيا سيف ذو حدين"]),
  ],
  ["idioms","nuance"],["Use idioms with precise nuance"],["advanced","debate"],prereqs=["c2-near-native"]),

 L("c2-pack2-02","Stylistic Control and Register","التحكم الاسلوبي والسجل","C2","c2-near-native",
  [
    I("word","terse","موجز","ترس",
      "His reply was terse.","ردة كان موجز.","هز ربلاي ووز ترس.",
      "Brief and to the point.","موجز ومختصر."),
    I("word","verbose","مطنب","فيربوس",
      "The essay was verbose.","المقال كان مطنب.","ذا اساي ووز فيربوس.",
      "Using too many words." ,"يستخدم كلمات كثيرة."),
    I("phrase","to hedge","يقلل من حدة","تو هيج",
      "Hedge your claims.","قلل من حدة ادعاءاتك.","هيج يور كليمز.",
      "Soften a strong statement." ,"يخفف جملة قوية."),
    I("sentence","One could argue that","يمكن القول ان","وان كود ارقو ذات",
      "One could argue that the policy failed.","يمكن القول ان السياسة فشلت.","وان كود ارقو ذات ذا بوليسي فيلد.",
      "Highly hedged phrasing.","صياغة محسوبة جدا."),
  ],
  [
    CH("What is terse?","وش هو موجز؟",[
      {"t":"موجز ومختصر","ok":True},{"t":"مطنب","ok":False},{"t":"غامض","ok":False}]),
    TR("His reply was terse.","ردة كان موجز",["ردة كان موجز","رده كان موجز"]),
  ],
  ["style","register"],["Control style and register precisely"],["writing","rhetoric"],prereqs=["c2-pack2-01"]),

 L("c2-pack2-03","Complex Syntax and Inversion","تركيب معقد والقلب","C2","c2-near-native",
  [
    I("phrase","not only... but also","ليس فقط... بل ايضا","نات اونلي بت الكسو",
      "Not only did she sing, but she also danced.","ليست فقط غنت، بل رقصت ايضا.","نات اونلي ديد شي سنق، بت شي الكسو دانست.",
      "Emphatic parallel structure.","تركيب توكيد متوازي."),
    I("word","inversion","قلب","انفرشن",
      "Inversion adds emphasis.","القلب يضيف توكيد.","انفرشن اديز امفاسس.",
      "Reversing normal word order.","عكس الترتيب الطبيعي."),
    I("phrase","seldom have I","نادرا ما","سيلدم هاف اي",
      "Seldom have I seen such skill.","نادرا ما شفت مهارة مثل كذا.","سيلدم هاف اي سين ساتش سكيل.",
      "Negative-fronted inversion.","قلب مقدمة بالنفي."),
    I("sentence","Had I known, I would have acted differently","لو كنت عرفت، كنت تصرفت مختلف","هاد اي نون، اي وود هاف اكتد ديفيرنتلي",
      "Had I known, I would have acted differently.","لو كنت عرفت، كنت تصرفت مختلف.","هاد اي نون، اي وود هاف اكتد ديفيرنتلي.",
      "Inverted conditional past.","شرط ماضي مقلوب."),
  ],
  [
    CH("Which uses inversion?","وشنو يستخدم القلب؟",[
      {"t":"Seldom have I seen such skill","ok":True},{"t":"I have seldom seen such skill","ok":False},{"t":"Such skill is rare","ok":False}]),
    TR("Not only did she sing, but she also danced.","ليست فقط غنت بل رقصت ايضا",["ليست فقط غنت بل رقصت ايضا","ليس فقط غنت بل رقصت ايضا"]),
  ],
  ["syntax","grammar"],["Use inversion and complex structures"],["writing","formal"],prereqs=["c2-pack2-01"]),

 L("c2-pack2-04","Reading Between the Lines","فهم ما وراء النص","C2","c2-near-native",
  [
    I("phrase","implied meaning","المعنى الضمني","امبلايد مينينق",
      "Grasp the implied meaning.","افهم المعنى الضمني.","گراسپ ذا امبلايد مينينق.",
      "What is suggested, not stated.","ما يلمح اليه، لا ما يصرح."),
    I("word","subtext","ما وراء النص","سبتكست",
      "The subtext is clear.","ما وراء النص واضح.","ذا سبتكست از كلير.",
      "Hidden underlying meaning.","معنى خفي كامن."),
    I("phrase","to take something at face value","ياخذ الشيء على ظاهره","تو تيك سمثنق ات فيس فاليو",
      "Don't take it at face value.","ما تاخذه على ظاهره.","دونت تيك ات ات فيس فاليو.",
      "Accept as it appears.","تقبل كما يبدو."),
    I("sentence","What the author left unsaid is","ما تركه الكاتب غير مذكور هو","وات ذا اذر لفت انسيد از",
      "What the author left unsaid is telling.","ما تركه الكاتب غير مذكور دال.","وات ذا اذر لفت انسيد از تلنق.",
      "Focuses on omission as meaning.","يركز على المحذوف كمعنى."),
  ],
  [
    CH("What is subtext?","وش هو ما وراء النص؟",[
      {"t":"معنى خفي كامن","ok":True},{"t":"النص الظاهر","ok":False},{"t":"العنوان","ok":False}]),
    TR("Don't take it at face value.","ما تاخذه على ظاهره",["ما تاخذه على ظاهره","لا تاخذه على ظاهره"]),
  ],
  ["reading","inference"],["Detect implied meaning and subtext"],["literature","advanced"],prereqs=["c2-pack2-01"])]

# ===================== STEP EXAM PREP =====================
LESSONS += [L("step-pack2-01","STEP Reading: Skimming Long Passages","ستيب قراءة: تصفح القطع الطويلة","STEP","step-exam-prep",
  [
    I("word","skimming","تصفح سريع","سكيمينق",
      "Skimming means reading fast for the main idea.","التصفح السريع يعني تقرأ بسرعة عشان الفكرة العامة.","سكيمينق مينز ريدينق فاست فور ذا مين ايدا.",
      "Use on long passages first.","استعمله اول في القطع الطويلة."),
    I("word","key words","كلمات مفتاحية","كي ووردز",
      "Look for key words in the question.","ابحث عن الكلمات المفتاحية بالسؤال.","لوك فور كي ووردز ان ذا كويستشن.",
      "Match them in the passage.","طابقها بالقطعة."),
    I("phrase","main idea","الفكرة العامة","مين ايدا",
      "Find the main idea quickly.","للق الفكرة العامة بسرعة.","فاين ذا مين ايدا كويكلي.",
      "Usually in the first sentence.","عادة بالجملة الاولى."),
    I("sentence","The passage mainly discusses","القطعة تتحدث اساسا عن","ذا باسيج مينلي دسكاسس",
      "The passage mainly discusses time management.","القطعة تتحدث اساسا عن ادارة الوقت.","ذا باسيج مينلي دسكاسس تايم مانجمنت.",
      "Common main-idea question stem.","صيغة سؤال الفكرة العامة الشائعة."),
  ],
  [
    CH("What is skimming?","وش هو التصفح السريع؟",[
      {"t":"قراءة سريعة للفكرة العامة","ok":True},{"t":"قراءة كل كلمة ببطء","ok":False},{"t":"كتابة القطعة","ok":False}]),
    TR("Look for key words in the question.","ابحث عن الكلمات المفتاحية بالسؤال",["ابحث عن الكلمات المفتاحية بالسؤال","دور على الكلمات المفتاحية بالسؤال"]),
  ],
  ["reading","exam-strategy"],["Skim long passages for the main idea"],["exam-prep","reading"],prereqs=["step-exam-prep"]),

 L("step-pack2-02","STEP Grammar: Tense Consistency","ستيب قواعد: اتساق الازمنة","STEP","step-exam-prep",
  [
    I("word","tense","زمن","تنس",
      "Keep the tense consistent.","حافظ على اتساق الزمن.","كيب ذا تنس كونسيستنت.",
      "Match tense within a sentence.","طابق الزمن داخل الجملة."),
    I("phrase","present perfect","المضارع التام","بريزنت بيرفكت",
      "I have finished the work.","خلصت الشغل.","اي هاف فينشد ذا وورك.",
      "Links past to present." ,"يربط الماضي بالحاضر."),
    I("phrase","past simple","الماضي البسيط","باست سمبل",
      "She worked yesterday.","اشتغلت امس.","شي ووركت يستردي.",
      "A finished past action." ,"فعل ماضي منتهي."),
    I("sentence","The verb must agree with the subject","الفعل لازم يطابق الفاعل","ذا فيرب مست اقري ويث ذا سابجكت",
      "The verb must agree with the subject.","الفعل لازم يطابق الفاعل.","ذا فيرب مست اقري ويث ذا سابجكت.",
      "Subject-verb agreement rule.","قاعدة تطابق الفاعل والفعل."),
  ],
  [
    CH("Which is present perfect?","وشنو المضارع التام؟",[
      {"t":"I have finished the work","ok":True},{"t":"I finished the work","ok":False},{"t":"I will finish the work","ok":False}]),
    TR("She worked yesterday.","اشتغلت امس",["اشتغلت امس","اشتغلت امبارح"]),
  ],
  ["grammar","tenses"],["Keep tenses consistent in STEP items"],["exam-prep","grammar"],prereqs=["step-pack2-01"]),

 L("step-pack2-03","STEP Vocabulary: Synonyms and Word Forms","ستيب مفردات: مرادفات وصيغ الكلمات","STEP","step-exam-prep",
  [
    I("word","synonym","مرادف","سينونيم",
      "Happy is a synonym of glad.","هابي مرادف لـ جلاد.","هابي از ا سينونيم اوف جلاد.",
      "A word with the same meaning.","كلمة بنفس المعنى."),
    I("phrase","word form","صيغة الكلمة","ورد فورم",
      "Decide is a verb; decision is a noun.","ديسايد فعل؛ ديسجن اسم.","ديسايد ا فيرب؛ ديسجن ا ناون.",
      "Same root, different part." ,"نفس الجذر، جزء مختلف."),
    I("word","antonym","متضاد","انتونيم",
      "Hot is an antonym of cold.","هوت متضاد لـ كولد.","هوت از انتونيم اوف كولد.",
      "A word with opposite meaning.","كلمة بمعنى معاكس."),
    I("sentence","Choose the word closest in meaning to","اختر الكلمة الاقرب معنى لـ","چوز ذا وورد كلوزست ان مينينق تو",
      "Choose the word closest in meaning to large.","اختر الكلمة الاقرب معنى لـ large.","چوز ذا وورد كلوزست ان مينينق تو لارج.",
      "Common STEP vocabulary stem.","صيغة مفردات ستيب الشائعة."),
  ],
  [
    CH("What is a synonym of glad?","وش مرادف glad؟",[
      {"t":"happy","ok":True},{"t":"sad","ok":False},{"t":"angry","ok":False}]),
    TR("Choose the word closest in meaning to large.","اختر الكلمة الاقرب معنى لـ large",["اختر الكلمة الاقرب معنى لـ large","اختار الكلمة الاقرب معنى لـ large"]),
  ],
  ["vocabulary","exam-strategy"],["Match synonyms and word forms in STEP"],["exam-prep","vocabulary"],prereqs=["step-pack2-01"]),

 L("step-pack2-04","STEP Practice: Timed Error Recognition","ستيب تمرين: تمييز الاخطاء الموقوت","STEP","step-exam-prep",
  [
    I("word","error","خطا","ارور",
      "Find the error in the sentence.","لقي الخطا بالجملة.","فاين ذا ارور ان ذا سنتنس.",
      "STEP error-recognition item." ,"سؤال تمييز اخطاء ستيب."),
    I("phrase","eliminate","استبعد","اليمينيت",
      "Eliminate the wrong options first.","استبعد الخيارات الغلط اول.","اليمينيت ذا رونق اوبشنز فورست.",
      "Removes distractions." ,"يشيل التشتيت."),
    I("phrase","time limit","حد وقت","تايم ليميت",
      "Watch the time limit carefully." ,"راقب حد الوقت بحذر.","واتش ذا تايم ليميت كيرفلي.",
      "About one minute per question." ,"حوالي دقيقة لكل سؤال."),
    I("sentence","There is a mistake in the underlined part","في خطا بالجزء المسطر","ذير از ا مسطيك ان ذا اندرلايند بارت",
      "There is a mistake in the underlined part.","في خطا بالجزء المسطر.","ذير از ا مسطيك ان ذا اندرلايند بارت.",
      "Standard STEP error stem." ,"صيغة خطا ستيب القياسية."),
  ],
  [
    CH("Why eliminate wrong options first?","ليش تستبعد الخيارات الغلط اول؟",[
      {"t":"عشان تقلل الخيارات وتختار اسرع","ok":True},{"t":"عشان يختر عليك الوقت","ok":False},{"t":"عشان تستريح","ok":False}]),
    TR("Find the error in the sentence.","لقي الخطا بالجملة",["لقي الخطا بالجملة","جد الخطا بالجملة"]),
  ],
  ["exam-strategy","error-recognition"],["Spot errors quickly under time pressure"],["exam-prep","practice"],prereqs=["step-pack2-01"])]

# ---------------- SQL builder + runner ----------------
def lesson_sql(L):
    out = []
    lid = L["id"]
    out.append(
        "INSERT INTO lessons (id,title_en,title_ar,minutes,level,active,kind,skills,goals,contexts,prereqs,version) VALUES ("
        + sql_val(lid) + "," + sql_val(L["title_en"]) + "," + sql_val(L["title_ar"]) + ","
        + sql_val(L.get("minutes",8)) + "," + sql_val(L["level"]) + ",true," + sql_val(L.get("kind","core")) + ","
        + arr_val(L.get("skills",[])) + "," + arr_val(L.get("goals",[])) + "," + arr_val(L.get("contexts",[])) + ","
        + arr_val(L.get("prereqs",[])) + ",1) ON CONFLICT (id) DO NOTHING;"
    )
    out.append(
        "INSERT INTO academy_lessons (academy_id,lesson_id,sort_order) VALUES ("
        + sql_val(L["academy"]) + "," + sql_val(lid) + ",0) ON CONFLICT DO NOTHING;"
    )
    for i, it in enumerate(L["items"]):
        out.append(
            "INSERT INTO lesson_items (lesson_id,idx,kind,en,ar_meaning,translit,example_en,example_ar,example_tr,note_en,note_ar) VALUES ("
            + sql_val(lid) + "," + str(i) + "," + sql_val(it["kind"]) + "," + sql_val(it["en"]) + ","
            + sql_val(it["ar"]) + "," + sql_val(it["tr"]) + ","
            + sql_val(it.get("ex_en")) + "," + sql_val(it.get("ex_ar")) + "," + sql_val(it.get("ex_tr")) + ","
            + sql_val(it.get("note_en")) + "," + sql_val(it.get("note_ar")) + ");"
        )
    for j, ex in enumerate(L["exercises"]):
        out.append(
            "INSERT INTO lesson_exercises (lesson_id,idx,type,payload,hint_en,hint_ar,hint_tr) VALUES ("
            + sql_val(lid) + "," + str(j) + "," + sql_val(ex["type"]) + ","
            + "'" + esc(json.dumps(ex["payload"], ensure_ascii=False)) + "'::jsonb" + ","
            + sql_val(ex.get("hint_en")) + "," + sql_val(ex.get("hint_ar")) + "," + sql_val(ex.get("hint_tr")) + ");"
        )
    return "\n".join(out)

def run_sql(sql):
    body = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": "Bearer " + PAT, "User-Agent": UA, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return r.status, r.read().decode("utf-8","replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8","replace")
    except Exception as e:
        return None, str(e)

# ---------------- VALIDATION (no dashes, no right===wrong, every item has ar+tr) ----------------
def validate():
    bad = []
    for L in LESSONS:
        lid = L["id"]
        for it in L["items"]:
            for fld in ["en","ar","tr","ex_en","ex_ar","ex_tr","note_en","note_ar"]:
                v = it.get(fld) or ""
                if ("\u2014" in v) or ("\u2013" in v):
                    bad.append(f"{lid}.{fld}: dash found")
            if not it.get("ar"): bad.append(f"{lid}.item.ar missing")
            if not it.get("tr"): bad.append(f"{lid}.item.tr missing")
        for ex in L["exercises"]:
            pl = ex["payload"]
            if pl.get("type") == "choose":
                opts = pl.get("options",[])
                oks = [o for o in opts if o.get("ok")]
                if len(oks) == 0 or len(oks) == len(opts):
                    bad.append(f"{lid}.ex.choose: no correct or all correct")
    return bad

if __name__ == "__main__":
    issues = validate()
    if issues:
        print("VALIDATION FAILED:")
        for x in issues: print("  -", x)
        raise SystemExit(1)
    print(f"Total lessons to insert: {len(LESSONS)}")
    ok = 0; fail = 0
    for b in range(0, len(LESSONS), 3):
        batch = LESSONS[b:b+3]
        sql = "\n".join(lesson_sql(L) for L in batch)
        code, resp = run_sql(sql)
        n = len(batch)
        if code in (200, 201):
            ok += n; print(f"  batch {b//3+1}: OK ({n} lessons)")
        else:
            fail += n; print(f"  batch {b//3+1}: FAIL code={code}"); print("  resp:", resp[:800])
    print(f"DONE: {ok} ok, {fail} fail")
