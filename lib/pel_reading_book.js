/* PEL Reading Workshop: a book-style reading practice for Saudi learners.
   Teaches where to pause, word stress, rhythm, tone, shadowing, and how to
   think in Arabic and hold the idea in English. No network, no AI calls.
   Public API: window.PELReadingBook.render(containerElement) */
(function(){
'use strict';

var CHAPTERS = [
 { id:'rb-morning', n:1, level:'A1', en:'My Morning', ar:'صباحي', tr:'ماي مورنينق', from:'#A88345', to:'#2a2418',
  intro:{ar:'قصة قصيرة عن يوم عادي. ركز على وين تسكت وايش الكلمات اللي ترفع صوتك عليها.', en:'A short story about an ordinary day. Notice where you pause and which words get the beat.'},
  chunks:[
   {t:'I *wake* up at *six*,', ar:'اصحى الساعة ستة،', tr:'اي ويك اب ات سكس،'},
   {t:'and I *drink* *cof*fee.', ar:'واشرب قهوة.', tr:'اند اي درينك كوفي.'},
   {t:'Then I *drive* to *work*,', ar:'بعدين اروح الشغل بالسيارة،', tr:'ذن اي درايف تو وورك،'},
   {t:'but the *traf*fic is *bad*.', ar:'بس الزحمة تكون قوية.', tr:'بات ذا ترافيك ايز باد.'},
   {t:'I ar*rive* *late* *ev*ery *day*.', ar:'اوصل متاخر كل يوم.', tr:'اي ارايف ليت ايڤري دي.'}],
  bridge:[
   {ar:'بالعربي نقول (اصحى) بدون انا. بالانجليزي لازم نقول I كل مره: I wake up.', en:'Arabic can drop the subject. English cannot: say I wake up.'},
   {ar:'بالعربي (الزحمة قوية) بدون فعل. بالانجليزي لازم is: the traffic IS bad.', en:'Arabic has no is here. English needs it: the traffic is bad.'}],
  quiz:[
   {q:'What time does he wake up?', ar:'الساعة كم يصحى؟', o:[['Six',1],['Seven',0],['Five',0]]},
   {q:'Why is he late?', ar:'ليش يتاخر؟', o:[['The traffic is bad',1],['He wakes up late',0],['His car is old',0]]}]},
 { id:'rb-coffee', n:2, level:'A2', en:'At the Coffee Shop', ar:'في الكوفي', tr:'ات ذا كوفي شوب', from:'#3F8C72', to:'#14211c',
  intro:{ar:'حوار طلب قهوة. لاحظ ان السوال الطالب يرفع صوته، وان الجملة الخبرية تنزل.', en:'An ordering dialogue. Notice that yes/no questions rise and statements fall.'},
  chunks:[
   {t:'*Hi*, can I have a *large* *lat*te,', ar:'هلا، ممكن لاتيه كبير،', tr:'هاي، كان اي هاف ا لارج لاتيه،'},
   {t:'with *no* *su*gar, *please*?', ar:'بدون سكر لو سمحت؟', tr:'ويذ نو شوقر، بليز؟', tone:'r'},
   {t:'*Sure*. *An*ything *else*?', ar:'اكيد. تبي شي ثاني؟', tr:'شور. اني ثينق الس؟', tone:'f'},
   {t:'Yes, a *choc*olate *muf*fin.', ar:'ايه، مفن شوكولاتة.', tr:'يس، ا تشوكليت مفن.'},
   {t:'That is *twen*ty *ri*yals.', ar:'المجموع عشرين ريال.', tr:'ذات ايز توينتي ريالز.'}],
  bridge:[
   {ar:'بالعربي نطلب بكلمتين: لاتيه كبير. بالانجليزي الصفه قبل الاسم: a large latte.', en:'Arabic puts the adjective after the noun. English puts it before: a large latte.'},
   {ar:'لا تترجم (ممكن) كلمه كلمه. فكر بالفكره: can I have = ممكن اخذ.', en:'Do not translate ممكن word by word. Hold the idea: can I have.'}],
  quiz:[
   {q:'How much is the order?', ar:'كم الحساب؟', o:[['Twenty riyals',1],['Ten riyals',0],['Thirty riyals',0]]},
   {q:'Does he want sugar?', ar:'يبي سكر؟', o:[['No',1],['Yes',0],['A little',0]]}]},
 { id:'rb-call', n:3, level:'A2', en:'A Call to Work', ar:'اتصال للشغل', tr:'ا كول تو وورك', from:'#7a5c2e', to:'#1b1710',
  intro:{ar:'مكالمة مهذبة. اللغة الرسمية تحتاج نبرة هادية وتوقفات واضحة.', en:'A polite phone call. Formal English needs a calm tone and clear pauses.'},
  chunks:[
   {t:'*Good* *morn*ing, this is *Fa*ras.', ar:'صباح الخير، معك فراس.', tr:'قود مورنينق، ذس ايز فراس.'},
   {t:'I am *sor*ry, but I am *sick* to*day*.', ar:'اسف، بس انا تعبان اليوم.', tr:'اي ام سوري، بات اي ام سيك تودي.'},
   {t:'I *can*not *come* to the *of*fice.', ar:'ما اقدر اجي المكتب.', tr:'اي كانوت كام تو ذي اوفس.'},
   {t:'I will *send* the re*port* by *e*mail.', ar:'بارسل التقرير بالايميل.', tr:'اي ويل سند ذا ريبورت باي ايميل.'},
   {t:'*Thank* you for under*stand*ing.', ar:'شكرا على تفهمك.', tr:'ثانك يو فور اندرستاندنق.'}],
  bridge:[
   {ar:'بالعربي (معك فراس). بالانجليزي نقول this is Faras، مو with you Faras.', en:'Arabic says معك فراس. English says this is Faras.'},
   {ar:'will = بـ بالسعودي: بارسل = I will send. فكر بالمستقبل قبل الفعل.', en:'Saudi بـ equals will. Put the future marker before the verb.'}],
  quiz:[
   {q:'Why can he not come?', ar:'ليش ما يقدر يجي؟', o:[['He is sick',1],['He is busy',0],['He is late',0]]},
   {q:'How will he send the report?', ar:'كيف بيرسل التقرير؟', o:[['By email',1],['By phone',0],['By hand',0]]}]},
 { id:'rb-why', n:4, level:'B1', en:'Why I Study English', ar:'ليش ادرس انجليزي', tr:'واي اي ستادي انقلش', from:'#8B6212', to:'#17171B',
  intro:{ar:'فقرة اطول. الوقفة بعد الفاصلة قصيرة، وبعد النقطة اطول.', en:'A longer paragraph. A comma is a short pause, a full stop is a longer one.'},
  chunks:[
   {t:'I *study* *Eng*lish,', ar:'ادرس انجليزي،', tr:'اي ستادي انقلش،'},
   {t:'because I *want* a *bet*ter *job*.', ar:'لاني ابي وظيفة احسن.', tr:'بيكوز اي وانت ا بيتر جوب.'},
   {t:'My *com*pany works with *for*eign *cli*ents,', ar:'شركتي تتعامل مع عملا اجانب،', tr:'ماي كمباني ووركس ويذ فورن كلايانتس،'},
   {t:'so *good* *Eng*lish is *ver*y *im*portant.', ar:'عشان كذا الانجليزي الزين مهم مره.', tr:'سو قود انقلش ايز ڤيري امبورتنت.'},
   {t:'*Ev*ery *night*, I *prac*tice for *twen*ty *min*utes.', ar:'كل ليلة امارس عشرين دقيقة.', tr:'ايڤري نايت، اي براكتس فور توينتي مينتس.'}],
  bridge:[
   {ar:'بالعربي نربط بـ (و) و(عشان). بالانجليزي نكسر الفكره: because و so تعطي سبب ونتيجة.', en:'Arabic chains with و. English uses because for the reason and so for the result.'},
   {ar:'اقرا الجملة بالانجليزي، امسك الفكره بالعربي بدماغك، وبعدين اكمل. لا تترجم كل كلمه.', en:'Read the English chunk, hold the idea in Arabic, then move on. Do not translate every word.'}],
  quiz:[
   {q:'Why does he study English?', ar:'ليش يدرس انجليزي؟', o:[['To get a better job',1],['For a trip',0],['For a game',0]]},
   {q:'How long does he practice?', ar:'كم يمارس؟', o:[['Twenty minutes',1],['Two hours',0],['Ten minutes',0]]}]},
 { id:'rb-remote', n:5, level:'B2', en:'Working from Home', ar:'الشغل من البيت', tr:'وركنق فروم هوم', from:'#5b6b9a', to:'#14161f',
  intro:{ar:'رايك الشخصي بجمل متوسطة الطول. انتبه للكلمات اللي تحمل الفكرة بس.', en:'A personal opinion in medium sentences. Listen for the few words that carry the idea.'},
  chunks:[
   {t:'Some *peo*ple *think* that *work*ing from *home* is *eas*ier,', ar:'ناس يشوفون ان الشغل من البيت ارتاح،', tr:'سام بيبل ثينك ذات وركنق فروم هوم ايز ايزير،'},
   {t:'but I dis*a*gree.', ar:'بس انا ما اوافق.', tr:'بات اي ديساقري.'},
   {t:'At *home*, it is *hard* to *stay* *fo*cused,', ar:'بالبيت صعب تركز،', tr:'ات هوم، ات ايز هارد تو ستاي فوكسد،'},
   {t:'and you *miss* the *chat*s with your *col*leagues.', ar:'وتفتقد سوالف زملايك.', tr:'اند يو ميس ذا تشاتس ويذ يور كوليقز.'},
   {t:'In my o*pin*ion, a *mix* of *both* works *best*.', ar:'برايي الخليط من الاثنين احسن.', tr:'ان ماي اوبينيون، ا ميكس اوف بوث وركس بست.'}],
  bridge:[
   {ar:'بالعربي نبدا بالفعل: (اشوف). بالانجليزي نبدا بـ In my opinion او I think ثم الفكره.', en:'Arabic often starts with the verb. English opens with a frame: In my opinion, I think.'},
   {ar:'الصفه بالعربي بعد الاسم، بالانجليزي قبله: a mix of both. اقراها كتلة وحده.', en:'Read noun groups as one block: a mix of both.'}],
  quiz:[
   {q:'What is his opinion?', ar:'وش رايه؟', o:[['A mix of both is best',1],['Home is always best',0],['The office is always best',0]]},
   {q:'What does he miss at home?', ar:'وش يفتقد بالبيت؟', o:[['Chats with colleagues',1],['The traffic',0],['His computer',0]]}]},
 { id:'rb-family', n:6, level:'A1', en:'Family Dinner', ar:'عشا العايلة', tr:'فاميلي دينر', from:'#3F8C72', to:'#17171B',
  intro:{ar:'جمل قصيرة وواضحة. اسكت عند كل فاصلة وارفع صوتك على الكلمات الاساسية.', en:'Short, clear sentences. Pause at every comma and lift your voice on the key words.'},
  chunks:[
   {t:'My *fam*ily eats *din*ner at *eight*,', ar:'عايلتي تتعشى الساعة ثمانية،', tr:'ماي فاملي ايتس دينر ات ايت،'},
   {t:'and we *all* *sit* to*geth*er.', ar:'ونجلس كلنا مع بعض.', tr:'اند وي اول سيت توقذر.'},
   {t:'My *mo*ther *cooks* *ri*ce and *chic*ken.', ar:'امي تطبخ رز ودجاج.', tr:'ماي مذر كوكس رايس اند تشكن.'},
   {t:'I *help* her with the *sal*ad.', ar:'اساعدها بالسلطة.', tr:'اي هيلب هر ويذ ذا سالد.'},
   {t:'*Af*ter dinner, we drink *tea*.', ar:'بعد العشا نشرب شاي.', tr:'افتر دينر، وي درينك تي.'}],
  bridge:[
   {ar:'بالعربي (امي تطبخ) فعل ثم فاعل. بالانجليزي الفاعل اول: My mother cooks.', en:'Arabic can put the verb first. English puts the subject first: My mother cooks.'},
   {ar:'ارفع صوتك على اسم الاكل: rice، chicken، salad. هذي الكلمات تحمل المعنى.', en:'Lift your voice on the food words. They carry the meaning.'}],
  quiz:[
   {q:'What time does the family eat?', ar:'الساعة كم تتعشى العايلة؟', o:[['At eight',1],['At six',0],['At ten',0]]},
   {q:'What do they drink after dinner?', ar:'وش يشربون بعد العشا؟', o:[['Tea',1],['Juice',0],['Water only',0]]}]},
 { id:'rb-heat', n:7, level:'B1', en:'Summer Heat', ar:'حر الصيف', tr:'سامر هيت', from:'#a05a2c', to:'#1b1410',
  intro:{ar:'وصف الجو. لاحظ ان الجملة الطويلة تنقسم الى كتل قصيرة.', en:'Describing the weather. Notice how a long sentence breaks into short blocks.'},
  chunks:[
   {t:'In the *sum*mer, the *wea*ther in *Ri*yadh is *ver*y *hot*,', ar:'بالصيف جو الرياض حار مره،', tr:'ان ذا سامر، ذا ويذر ان رياض ايز ڤيري هوت،'},
   {t:'so most *peo*ple stay *in*side at *noon*.', ar:'عشان كذا اغلب الناس يجلسون داخل وقت الظهر.', tr:'سو موست بيبل ستاي انسايد ات نون.'},
   {t:'They go *out* in the *eve*ning,', ar:'يطلعون بالليل،', tr:'ذي قو اوت ان ذي ايڤنينق،'},
   {t:'when the *air* is *cool*er.', ar:'لما الجو يصير ابرد.', tr:'وين ذي اير ايز كولر.'},
   {t:'*Drink* a *lot* of *wa*ter and wear *light* *clothes*.', ar:'اشرب مويه كثير والبس ملابس خفيفة.', tr:'درينك ا لوت اوف ووتر اند وير لايت كلوذز.'}],
  bridge:[
   {ar:'when تربط الجملتين. اسكت قبلها: in the evening, / when the air is cooler.', en:'When joins two ideas. Pause before it.'},
   {ar:'الجملة الاخيرة امر: ابدا بالفعل Drink و Wear وارفع صوتك عليهم.', en:'The last sentence is a command. Stress the verbs Drink and Wear.'}],
  quiz:[
   {q:'When do people go out?', ar:'متى يطلعون الناس؟', o:[['In the evening',1],['At noon',0],['At night only',0]]},
   {q:'What does the writer advise?', ar:'وش ينصح الكاتب؟', o:[['Drink a lot of water',1],['Stay awake',0],['Wear heavy clothes',0]]}]},
 { id:'rb-mistakes', n:8, level:'B2', en:'Learning from Mistakes', ar:'نتعلم من الاغلاط', tr:'ليرنق فروم ميستيكس', from:'#5b6b9a', to:'#17171B',
  intro:{ar:'افكار اطول. اعتمد على الوقفات عشان تمسك الفكرة من اول مرة.', en:'Longer ideas. Rely on your pauses to catch the idea the first time.'},
  chunks:[
   {t:'Many *stud*ents *fear* making *mis*takes,', ar:'كثير من الطلاب يخافون من الاغلاط،', tr:'ميني ستيودنتس فير ميكنق ميستيكس،'},
   {t:'but *mis*takes are *part* of *learn*ing.', ar:'بس الاغلاط من ضمن التعلم.', tr:'بات ميستيكس ار بارت اوف ليرنق.'},
   {t:'Each *time* you *fix* an *er*ror,', ar:'كل مرة تصلح غلطة،', tr:'ايتش تايم يو فكس ان ايرر،'},
   {t:'your *brain* *builds* a *stron*ger *con*nection.', ar:'مخك يبني ربط اقوى.', tr:'يور برين بيلدز ا سترونقر كونكشن.'},
   {t:'So *speak* *first*, and *cor*rect your*self* *la*ter.', ar:'عشان كذا تكلم اول، وصحح نفسك بعدين.', tr:'سو سبيك فيرست، اند كوريكت يورسيلف ليتر.'}],
  bridge:[
   {ar:'كلمة but تقلب الفكرة. اسكت قبلها واخفض صوتك على الجزا الثاني.', en:'But flips the idea. Pause before it.'},
   {ar:'لا تترجم كل كلمة. امسك الفكرة: الاغلاط من ضمن التعلم، وكمل.', en:'Do not translate every word. Hold the idea and move on.'}],
  quiz:[
   {q:'What is the main message?', ar:'وش الفكرة الاساسية؟', o:[['Mistakes help you learn',1],['Never speak English',0],['Avoid hard words',0]]},
   {q:'What should you do first?', ar:'وش تسوي اول؟', o:[['Speak',1],['Wait',0],['Translate everything',0]]}]}
];

var STRATEGIES = [
 {ic:'scissors', ar:'اقرا بكتل مو بكلمات', en:'Read in chunks, not words',
  a:'الانجليزي ينقسم لمجموعات فكرية من 3 الى 6 كلمات. كل مجموعة تعطي فكرة. اسكت قصير عند الفاصلة، واسكت اطول عند النقطة.',
  e:'English splits into thought groups of 3 to 6 words. Pause briefly at a comma, longer at a full stop.'},
 {ic:'volume-2', ar:'ارفع صوتك على الكلمات المهمة', en:'Stress the content words',
  a:'الاسما والافعال والصفات تاخذ النبرة. كلمات مثل the و to و of تنقال خفيفه وسريعة. هذا اهم فرق عن العربي.',
  e:'Nouns, verbs and adjectives get the beat. Words like the, to and of are quick and light.'},
 {ic:'activity', ar:'الايقاع: الانجليزي مو متساوي', en:'Rhythm is uneven',
  a:'العربي تقريبا كل مقطع بنفس الوقت. الانجليزي ينتظر النبرة: الجمل بنفس الطول تاخذ نفس الوقت حتى لو عدد الكلمات مختلف، فتنضغط الكلمات الخفيفه.',
  e:'Arabic gives each syllable similar time. English keeps time on the stressed beats and squeezes the light words in between.'},
 {ic:'trending-down', ar:'النبرة تنزل بالجمل الخبرية', en:'Falling tone for statements',
  a:'الجملة الخبرية تنزل بالاخر. سوال نعم ولا يرتفع. السوال بكلمة وش او ليش ينزل. القايمه ترتفع وترتفع وتنزل بالاخير.',
  e:'Statements fall. Yes/no questions rise. Wh- questions fall. In a list, rise on each item and fall on the last.'},
 {ic:'ear', ar:'الشادوينق: كرر بعد الصوت مباشرة', en:'Shadowing',
  a:'1) اسمع الجملة مرة. 2) اسمعها وكرر معها بصوت واطي. 3) كررها وراها بدون ما تقرا. 4) كررها بنفس السرعة والنبرة. ابدا ببطي ثم زود السرعة.',
  e:'1) Listen. 2) Repeat quietly with the voice. 3) Repeat right after it without reading. 4) Match speed and tone. Start slow.'},
 {ic:'brain', ar:'فكر بالفكرة مو بالكلمات', en:'Think the idea, not the words',
  a:'لا تترجم كلمه كلمه. اقرا الكتلة الانجليزية، امسك معناها بالعربي بدماغك، وكمل. اذا وقفت تترجم، رجع للكتلة اللي قبلها واقراها مرة ثانية.',
  e:'Do not translate word by word. Read the chunk, hold the Arabic idea, move on. If you stall, reread the chunk.'},
 {ic:'arrow-left-right', ar:'الفروقات بين ترتيب العربي والانجليزي', en:'Arabic vs English order',
  a:'1) الانجليزي لازم له فاعل: I go. 2) is وare مطلوبة: He is tired. 3) الصفة قبل الاسم: a big house. 4) الفعل المساعد يجي قبل الفاعل بالاسيله: Do you like it?',
  e:'1) English needs a subject. 2) is and are are required. 3) Adjectives come before the noun. 4) In questions the helper comes first.'},
 {ic:'search', ar:'قبل ما تقرا: شوف العنوان والاسيله', en:'Preview before you read',
  a:'اقرا العنوان واسيله الفهم اول. بتعرف وش تدور عليه وبتقرا اسرع وبفهم احسن.',
  e:'Read the title and the questions first. You will know what to look for and read faster.'}
];

var CSS = [
'.rb-wrap{max-width:1100px;margin:0 auto}',
'.rb-tabs{display:flex;gap:8px;margin:0 0 22px;flex-wrap:wrap}',
'.rb-tab{padding:10px 20px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--text-secondary);font-weight:600;font-size:.84rem;cursor:pointer;transition:.25s ease}',
'.rb-tab.on{border-color:var(--gold);color:var(--gold-soft);background:rgba(200,169,106,.08)}',
'.rb-shelf{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:22px}',
'.rb-cover{position:relative;border-radius:6px 16px 16px 6px;min-height:270px;padding:26px 22px 22px 30px;color:#F7F4EF;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 14px 30px -14px rgba(0,0,0,.6),inset 6px 0 0 rgba(0,0,0,.28);transition:transform .3s ease,box-shadow .3s ease;overflow:hidden;text-align:left}',
'.rb-cover:hover{transform:translateY(-4px) rotate(-.6deg);box-shadow:0 22px 38px -16px rgba(0,0,0,.7),inset 6px 0 0 rgba(0,0,0,.28)}',
'.rb-cover:before{content:"";position:absolute;inset:12px 12px 12px 20px;border:1px solid rgba(247,244,239,.28);border-radius:3px 10px 10px 3px;pointer-events:none}',
'.rb-cover .rb-num{font-family:Fraunces,serif;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;opacity:.8}',
'.rb-cover h3{font-size:1.45rem;color:#F7F4EF;margin:8px 0 6px}',
'.rb-cover .rb-ar{font-family:Cairo,Tajawal,sans-serif;direction:rtl;font-size:.98rem;opacity:.9}',
'.rb-cover .rb-foot{display:flex;justify-content:space-between;align-items:center;font-size:.74rem;position:relative}',
'.rb-done{color:#d8bd83;font-weight:700}',
'.rb-book{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:0;border-radius:10px 20px 20px 10px;overflow:hidden;border:1px solid var(--border);background:var(--card-elevated);box-shadow:0 22px 50px -26px rgba(0,0,0,.65)}',
'.rb-page{padding:34px 36px;position:relative}',
'.rb-page.left{background:var(--card-elevated)}',
'.rb-page.right{background:var(--card);border-left:1px solid var(--border)}',
'.rb-page.left:after{content:"";position:absolute;top:0;right:0;bottom:0;width:26px;background:linear-gradient(to left,rgba(0,0,0,.18),transparent);pointer-events:none}',
'.rb-eyebrow{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}',
'.rb-title{font-size:2rem;margin-bottom:6px}',
'.rb-intro{font-size:.88rem;color:var(--text-secondary);line-height:1.8;margin-bottom:22px}',
'.rb-text{font-family:Fraunces,serif;font-size:1.32rem;line-height:2.25;color:var(--text);direction:ltr;text-align:left;letter-spacing:0}',
'.rb-text .rb-chunk{cursor:pointer;border-radius:6px;padding:2px 3px;transition:background .25s ease}',
'.rb-text .rb-chunk:hover{background:rgba(200,169,106,.1)}',
'.rb-text .rb-chunk.now{background:rgba(200,169,106,.22)}',
'.rb-text .rb-chunk:first-child:first-letter{font-size:1.7em;color:var(--gold-soft);font-weight:600}',
'.rb-pz{display:none;color:var(--gold);font-weight:700;margin:0 4px;opacity:.85;font-family:Plus Jakarta Sans,sans-serif;font-size:.85em}',
'.rb-wrap.pz .rb-pz{display:inline}',
'.rb-wrap.st .rb-text .w-s{font-weight:700;color:var(--gold-soft);text-decoration:underline;text-decoration-color:rgba(200,169,106,.5);text-underline-offset:5px}',
'.rb-wrap.st .rb-text .w-u{opacity:.62}',
'.rb-tone{display:none;vertical-align:middle;margin:0 2px}',
'.rb-wrap.tn .rb-tone{display:inline-block}',
'.rb-cap{margin-top:14px;padding:12px 16px;border-radius:12px;background:rgba(200,169,106,.06);border:1px dashed rgba(200,169,106,.3);min-height:64px}','.rb-sub{display:none;font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;font-size:.88rem;line-height:1.7;margin:-8px 0 8px;padding:0 4px}',
'.rb-wrap.tr .rb-sub.tr{display:block;color:var(--gold-soft)}',
'.rb-wrap.pk .rb-sub.ar{display:block;color:var(--text-secondary)}',
'.rb-tools{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}',
'.rb-tg{padding:8px 14px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--text-muted);font-size:.76rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:.2s ease}',
'.rb-tg.on{border-color:var(--gold);color:var(--gold-soft);background:rgba(200,169,106,.1)}',
'.rb-player{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:20px 0 4px;padding-top:18px;border-top:1px dashed var(--border)}',
'.rb-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;font-weight:700;font-size:.82rem;cursor:pointer;border:1px solid var(--gold);color:#1a1405;background:linear-gradient(135deg,var(--gold-soft),var(--gold));transition:.25s ease}',
'.rb-btn.alt{background:transparent;color:var(--text);border-color:var(--border)}',
'.rb-btn:hover{filter:brightness(1.07)}',
'.rb-speed{background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:999px;padding:9px 14px;font-size:.78rem}',
'.rb-turn{display:none;width:100%;margin-top:10px}',
'.rb-turn.on{display:block}',
'.rb-bar{height:6px;border-radius:999px;background:var(--border);overflow:hidden}',
'.rb-bar i{display:block;height:100%;width:0;background:var(--gold)}',
'.rb-turnlabel{font-size:.78rem;color:var(--gold-soft);margin-bottom:6px;font-weight:600}',
'.rb-h{font-size:1.05rem;margin:0 0 12px}',
'.rb-tip{padding:14px 16px;border-radius:12px;background:rgba(200,169,106,.07);border:1px solid rgba(200,169,106,.25);margin-bottom:12px;font-size:.84rem;line-height:1.8}',
'.rb-tip .a{font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;display:block;color:var(--text)}',
'.rb-tip .e{display:block;color:var(--text-muted);font-size:.78rem;margin-top:4px;direction:ltr;text-align:left}',
'.rb-q{margin-top:22px}',
'.rb-qq{font-weight:600;font-size:.9rem;margin-bottom:8px;direction:ltr;text-align:left}',
'.rb-qq small{display:block;font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;color:var(--text-muted);font-weight:400}',
'.rb-opt{display:block;width:100%;text-align:left;padding:11px 14px;border-radius:12px;border:1px solid var(--border);background:var(--card-elevated);color:var(--text);margin-bottom:8px;cursor:pointer;font-size:.86rem;direction:ltr;transition:.2s ease}',
'.rb-opt.ok{border-color:var(--emerald);background:rgba(63,140,114,.14)}',
'.rb-opt.no{border-color:var(--danger,#d25c5c);background:rgba(210,92,92,.12)}',
'.rb-back{margin-bottom:16px}',
'.rb-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:.72rem;color:var(--text-muted);margin-top:14px;direction:ltr}',
'.rb-strat{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}',
'.rb-sc{padding:22px;border-radius:16px;background:var(--card);border:1px solid var(--border)}',
'.rb-sc h4{font-size:1.05rem;margin:10px 0 2px}',
'.rb-sc .a{font-family:Cairo,Tajawal,sans-serif;direction:rtl;text-align:right;font-size:.88rem;line-height:1.9;color:var(--text);margin-top:10px}',
'.rb-sc .e{font-size:.78rem;line-height:1.7;color:var(--text-muted);margin-top:8px;direction:ltr;text-align:left}',
'.rb-sc .ico{width:38px;height:38px;border-radius:12px;border:1px solid rgba(200,169,106,.4);display:flex;align-items:center;justify-content:center;color:var(--gold)}',
'@media(max-width:820px){.rb-book{grid-template-columns:1fr;border-radius:12px}.rb-page{padding:24px 20px}.rb-page.right{border-left:none;border-top:1px solid var(--border)}.rb-page.left:after{display:none}.rb-text{font-size:1.18rem;line-height:2.1}.rb-title{font-size:1.6rem}}',
'@media(prefers-reduced-motion:reduce){.rb-cover,.rb-tab,.rb-tg,.rb-btn{transition:none}}'
].join('\n');

function injectCss(){
  if(document.getElementById('pelReadingBookCss')) return;
  var s = document.createElement('style'); s.id = 'pelReadingBookCss'; s.textContent = CSS; document.head.appendChild(s);
}
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function bi(ar, en){ return '<span class="arabic">'+esc(ar)+'</span>، '+esc(en); }
function plain(t){ return t.replace(/\*/g,''); }
function toneOf(c){
  if(c.tone) return c.tone;
  var e = c.t.trim().slice(-1);
  if(e==='?') return 'r'; if(e===',') return 'c'; return 'f';
}
var ARROW = {
  r:'<svg class="rb-tone" width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M2 12 L19 3" stroke="#C8A96A" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M13 3 H19 V9" stroke="#C8A96A" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  f:'<svg class="rb-tone" width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M2 2 L19 11" stroke="#C8A96A" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M13 11 H19 V5" stroke="#C8A96A" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  c:'<svg class="rb-tone" width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M3 7 H17" stroke="#C8A96A" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M13 3 L18 7 L13 11" stroke="#C8A96A" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
function chunkHtml(c){
  var words = c.t.replace(/\*([^*]+)\*/g, function(_, m){ return '\u0001'+m+'\u0002'; });
  var html = esc(words).replace(/\u0001([^\u0002]*)\u0002/g, '<span class="w-s">$1</span>');
  /* mark unstressed text segments */
  var parts = html.split(/(<span class="w-s">[^<]*<\/span>)/);
  html = parts.map(function(p){ return p.indexOf('<span class="w-s">')===0 ? p : (p ? '<span class="w-u">'+p+'</span>' : ''); }).join('');
  var t = toneOf(c), mark = c.t.trim().slice(-1)==='.' || c.t.trim().slice(-1)==='?' ? '//' : '/';
  return html + ARROW[t] + '<span class="rb-pz">'+mark+'</span>';
}
function getDone(){ try{ return JSON.parse(localStorage.getItem('pel_rb_done')||'[]'); }catch(e){ return []; } }
function setDone(id){ try{ var d = getDone(); if(d.indexOf(id)<0){ d.push(id); localStorage.setItem('pel_rb_done', JSON.stringify(d)); } }catch(e){} }
function stopSpeech(){ try{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }catch(e){} }
function icons(){ try{ if(window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }catch(e){} }

function render(root){
  injectCss();
  var state = {tab:'shelf', ch:null, pz:true, st:true, tn:false, tr:true, pk:false, rate:0.8, run:0};
  function shell(inner){
    root.innerHTML = '<div class="rb-wrap'+(state.pz?' pz':'')+(state.st?' st':'')+(state.tn?' tn':'')+(state.tr?' tr':'')+(state.pk?' pk':'')+'" id="rbWrap">'+inner+'</div>';
    icons();
  }
  function head(){
    return '<div class="page-head"><span class="eyebrow">'+bi('ورشه القرايه','Reading Workshop')+'</span>'+
      '<h1 dir="ltr">Read like a native, one thought at a time</h1>'+
      '<p><span class="arabic" style="display:block;margin-bottom:4px;">تعلم وين تسكت، وين ترفع صوتك، وكيف تفكر بالعربي وتقرا بالانجليزي بدون ما تترجم كلمه كلمه.</span>'+
      '<span dir="ltr">Learn where to pause, which words to stress, and how to read English without translating word by word.</span></p></div>';
  }
  function tabs(){
    return '<div class="rb-tabs"><button class="rb-tab'+(state.tab==='shelf'?' on':'')+'" data-tab="shelf">'+bi('المكتبه','Library')+'</button>'+
      '<button class="rb-tab'+(state.tab==='strat'?' on':'')+'" data-tab="strat">'+bi('استراتيجيات','Strategies')+'</button></div>';
  }
  function shelf(){
    var done = getDone();
    return head()+tabs()+'<div class="rb-shelf">'+CHAPTERS.map(function(c){
      return '<div class="rb-cover" data-ch="'+c.id+'" role="button" tabindex="0" style="background:linear-gradient(160deg,'+c.from+','+c.to+')">'+
        '<div><div class="rb-num">Chapter '+c.n+' · '+c.level+'</div><h3>'+esc(c.en)+'</h3><div class="rb-ar arabic">'+esc(c.ar)+'</div></div>'+
        '<div class="rb-foot"><span>'+c.chunks.length+' parts</span>'+(done.indexOf(c.id)>=0?'<span class="rb-done">Finished</span>':'<span>Open</span>')+'</div></div>';
    }).join('')+'</div>';
  }
  function strat(){
    return head()+tabs()+'<div class="rb-strat">'+STRATEGIES.map(function(s){
      return '<div class="rb-sc"><div class="ico"><i data-lucide="'+s.ic+'"></i></div><h4><span class="arabic">'+esc(s.ar)+'</span></h4><div class="e" style="margin-top:2px">'+esc(s.en)+'</div>'+
        '<div class="a">'+esc(s.a)+'</div><div class="e">'+esc(s.e)+'</div></div>';
    }).join('')+'</div>';
  }
  function reader(c){
    var toggles = [['pz','المسافات','Pauses','scissors'],['st','النبرة','Stress','volume-2'],['tn','الاتجاه','Tone','trending-down'],['tr','نطق بالعربي','Arabic sound','languages']];
    return '<button class="btn-ghost rb-back" id="rbBack"><span class="arabic">رجوع للمكتبه</span>، Back to library</button>'+
    '<div class="rb-book"><div class="rb-page left">'+
      '<div class="rb-eyebrow">Chapter '+c.n+' · '+c.level+'</div><h2 class="rb-title" dir="ltr">'+esc(c.en)+'</h2>'+
      '<p class="rb-intro"><span class="arabic" style="display:block">'+esc(c.intro.ar)+'</span><span dir="ltr">'+esc(c.intro.en)+'</span></p>'+
      '<div class="rb-tools">'+toggles.map(function(t){ return '<button class="rb-tg'+(state[t[0]]?' on':'')+'" data-tg="'+t[0]+'"><i data-lucide="'+t[3]+'"></i>'+bi(t[1],t[2])+'</button>'; }).join('')+
        '<button class="rb-tg" data-tg="peek"><i data-lucide="eye"></i>'+bi('معنى','Meaning')+'</button></div>'+
      '<div class="rb-text" id="rbText">'+c.chunks.map(function(k,i){
        return '<span class="rb-chunk" data-i="'+i+'" tabindex="0">'+chunkHtml(k)+'</span> ';
      }).join('')+'</div>'+
      '<div class="rb-cap" id="rbCap"><div class="rb-sub tr" id="rbCapTr"></div><div class="rb-sub ar" id="rbCapAr"></div></div>'+
      '<div class="rb-player"><button class="rb-btn" id="rbListen"><i data-lucide="play"></i>'+bi('استمع','Listen')+'</button>'+
        '<button class="rb-btn alt" id="rbShadow"><i data-lucide="repeat"></i>'+bi('شادوينق','Shadow')+'</button>'+
        '<button class="rb-btn alt" id="rbStop"><i data-lucide="square"></i>'+bi('وقف','Stop')+'</button>'+
        '<select class="rb-speed" id="rbRate" aria-label="Speed"><option value="0.6">0.6x</option><option value="0.8" selected>0.8x</option><option value="1">1x</option></select>'+
        '<div class="rb-turn" id="rbTurn"><div class="rb-turnlabel" id="rbTurnLabel"></div><div class="rb-bar"><i id="rbBarI"></i></div></div></div>'+
      '<div class="rb-leg"><span>/ short pause</span><span>// full stop</span><span>bold gold = stressed</span><span>arrow = voice direction</span></div>'+
    '</div><div class="rb-page right">'+
      '<h4 class="rb-h">'+bi('فكر بالعربي واقرا بالانجليزي','Think in Arabic, read in English')+'</h4>'+
      c.bridge.map(function(b){ return '<div class="rb-tip"><span class="a">'+esc(b.ar)+'</span><span class="e">'+esc(b.en)+'</span></div>'; }).join('')+
      '<div class="rb-tip"><span class="a">طريقة الشادوينق: اسمع جزا، ووقف، ثم كرر بنفس السرعة والنبرة قبل ما يخلص الشريط.</span><span class="e">Shadow mode plays one part, then gives you the same time to repeat it with the same speed and tone.</span></div>'+
      '<div class="rb-q"><h4 class="rb-h">'+bi('اسيله الفهم','Check understanding')+'</h4>'+
      c.quiz.map(function(q,qi){ return '<div data-qi="'+qi+'"><div class="rb-qq">'+esc(q.q)+'<small>'+esc(q.ar)+'</small></div>'+
        q.o.map(function(o,oi){ return '<button class="rb-opt" data-qi="'+qi+'" data-ok="'+o[1]+'">'+esc(o[0])+'</button>'; }).join('')+'</div>'; }).join('')+'</div>'+
    '</div></div>';
  }

  function go(){
    stopSpeech(); state.run++;
    if(state.tab==='strat') shell(strat());
    else if(state.ch) shell(reader(state.ch));
    else shell(shelf());
    wire();
  }
  function wire(){
    var w = document.getElementById('rbWrap');
    root.querySelectorAll('[data-tab]').forEach(function(b){ b.addEventListener('click', function(){ state.tab = b.dataset.tab; state.ch = null; go(); }); });
    root.querySelectorAll('[data-ch]').forEach(function(b){
      var open = function(){ state.ch = CHAPTERS.filter(function(c){ return c.id===b.dataset.ch; })[0]; go(); };
      b.addEventListener('click', open); b.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
    });
    var back = document.getElementById('rbBack');
    if(back) back.addEventListener('click', function(){ state.ch = null; state.tab = 'shelf'; go(); });
    if(!state.ch) return;
    var c = state.ch, chunks = w.querySelectorAll('.rb-chunk');
    root.querySelectorAll('[data-tg]').forEach(function(b){ b.addEventListener('click', function(){
      var k = b.dataset.tg;
      if(k==='peek'){ state.pk = !state.pk; b.classList.toggle('on', state.pk); w.classList.toggle('pk', state.pk); return; }
      state[k] = !state[k]; b.classList.toggle('on', state[k]);
      w.classList.toggle({pz:'pz',st:'st',tn:'tn',tr:'tr'}[k], state[k]);
    }); });
    var rate = document.getElementById('rbRate');
    rate.addEventListener('change', function(){ state.rate = parseFloat(rate.value) || 0.8; });
    function say(text, done){
      if(!('speechSynthesis' in window)){ done(); return; }
      var u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = state.rate;
      try{ var v = window.speechSynthesis.getVoices().filter(function(x){ return /^en-US/i.test(x.lang); })[0]; if(v) u.voice = v; }catch(e){}
      var once = false, fin = function(){ if(once) return; once = true; done(); };
      u.onend = fin; u.onerror = fin; window.speechSynthesis.speak(u);
    }
    function cap(i){ if(i<0) return; document.getElementById('rbCapTr').textContent = c.chunks[i].tr; document.getElementById('rbCapAr').textContent = c.chunks[i].ar; }
    function mark(i){ chunks.forEach(function(k,j){ k.classList.toggle('now', j===i); }); cap(i); }
    cap(0);
    function clear(){ mark(-1); var t = document.getElementById('rbTurn'); if(t) t.classList.remove('on'); }
    function playFrom(i, shadow, token){
      if(token !== state.run) return;
      if(i >= c.chunks.length){ clear(); setDone(c.id); return; }
      mark(i);
      var text = plain(c.chunks[i].t);
      stopSpeech();
      say(text, function(){
        if(token !== state.run) return;
        if(!shadow){ playFrom(i+1, false, token); return; }
        var words = text.split(/\s+/).length, ms = Math.max(1600, words * 520 / state.rate);
        var t = document.getElementById('rbTurn'), bar = document.getElementById('rbBarI'), lab = document.getElementById('rbTurnLabel');
        t.classList.add('on'); lab.innerHTML = bi('دورك: كرر الجزا', 'Your turn: repeat it now');
        bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth;
        bar.style.transition = 'width '+ms+'ms linear'; bar.style.width = '100%';
        setTimeout(function(){ t.classList.remove('on'); playFrom(i+1, true, token); }, ms);
      });
    }
    document.getElementById('rbListen').addEventListener('click', function(){ state.run++; playFrom(0, false, state.run); });
    document.getElementById('rbShadow').addEventListener('click', function(){ state.run++; playFrom(0, true, state.run); });
    document.getElementById('rbStop').addEventListener('click', function(){ state.run++; stopSpeech(); clear(); });
    chunks.forEach(function(k){
      var go1 = function(){ state.run++; var tok = state.run, i = parseInt(k.dataset.i,10); mark(i); stopSpeech(); say(plain(c.chunks[i].t), function(){ if(tok===state.run) clear(); }); };
      k.addEventListener('click', go1); k.addEventListener('keydown', function(e){ if(e.key==='Enter'){ go1(); } });
    });
    root.querySelectorAll('.rb-opt').forEach(function(b){ b.addEventListener('click', function(){
      var qi = b.dataset.qi, group = root.querySelectorAll('.rb-opt[data-qi="'+qi+'"]');
      group.forEach(function(g){ g.classList.remove('ok','no'); });
      b.classList.add(b.dataset.ok==='1' ? 'ok' : 'no');
      if(b.dataset.ok!=='1') group.forEach(function(g){ if(g.dataset.ok==='1') g.classList.add('ok'); });
    }); });
  }
  go();
}

window.PELReadingBook = { render: render, chapters: CHAPTERS, stop: stopSpeech };
})();
