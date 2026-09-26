#!/usr/bin/env python3
"""
Add Saudi Arabic translations for VOCAB_BANK metadata fields.
Patches app.html to add synonyms_ar, antonyms_ar, family_ar, collocations_ar, tip_ar
to each VOCAB_BANK entry. Saudi dialect, no hamzas, no em dashes.
"""
import re, json

# Arabic translations for each word's metadata fields
# Keyed by English word, values are dicts of _ar fields
TRANSLATIONS = {
"Reservation": {"syn_ar":"حجز","ant_ar":"الغاء","fam_ar":"ريزيرف، محجوز، يحجز","col_ar":"احجز، اكد الحجز","tip_ar":"ناس كثير يقولون booking بدل reservation، الاثنين صح بس reservation احلى"},
"Confident": {"syn_ar":"واثق، متاكد","ant_ar":"متوتر، غير متاكد","fam_ar":"ثقه، بثقه","col_ar":"تحس بثقه، يبان واثق","tip_ar":"شد على اول جزء: CON-fi-dent"},
"Appointment": {"syn_ar":"موعد، حجز","ant_ar":"-","fam_ar":"يعين، معين","col_ar":"احجز موعد، الغي موعد","tip_ar":"بالعربي نقول موعد لكل شي، اجتماع او دكتور"},
"Negotiate": {"syn_ar":"فاوض، ناقش","ant_ar":"تنازل","fam_ar":"تفاوض، مفاوض","col_ar":"فاوض على صفقه، فاوض على سعر","tip_ar":"كلمه شائعه في محادثات الراتب والاسعار"},
"Deadline": {"syn_ar":"موعد نهايي","ant_ar":"-","fam_ar":"-","col_ar":"حققت الموعد، فاتك الموعد","tip_ar":"كلمه مهمه جدا في بيئة العمل"},
"Itinerary": {"syn_ar":"خط سير، جدول","ant_ar":"-","fam_ar":"-","col_ar":"خط سير رحه، خط سير يومي","tip_ar":"كلمه شوي راقيه، شائعه مع وكلاء السفر والفنادق"},
"Refund": {"syn_ar":"استرجاع المبلغ","ant_ar":"رسوم","fam_ar":"مسترجع، يسترجع","col_ar":"اطلب استرجاع، استرجاع كامل","tip_ar":"الاسم تشديد على اول جزء، الفعل تشديد على ثاني جزء"},
"Layover": {"syn_ar":"توقف بين رحلتين","ant_ar":"رحله مباشره","fam_ar":"-","col_ar":"توقف قصير، توقف طويل","tip_ar":"كلمه شائعه عند كاونتر تسجيل الدخول"},
"Complimentary": {"syn_ar":"مجاني، هديه","ant_ar":"مدفوع","fam_ar":"مجامله","col_ar":"فطور مجاني، واي فاي مجاني","tip_ar":"لا تخلط بينها وبين complementary اللي معناها متكامل"},
"Symptom": {"syn_ar":"عَرَض، اشاره","ant_ar":"-","fam_ar":"عرضي","col_ar":"عَرَض رييسي، اعراض شائعه","tip_ar":"حرف p شبه ساكن: SIMP-tuhm"},
"Colleague": {"syn_ar":"زميل عمل","ant_ar":"-","fam_ar":"-","col_ar":"زميل مقرب، زميل سابق","tip_ar":"اكتر احترافيه من coworker"},
"Punctual": {"syn_ar":"دقيق بالوقت، ملتزم","ant_ar":"متاخر","fam_ar":"دقه","col_ar":"وصول دقيق","tip_ar":"مهمه جدا في ثقافه العمل الامريكيه"},
"Boarding Pass": {"syn_ar":"تذكره صعود","ant_ar":"-","fam_ar":"يصعد، صعود","col_ar":"تذكره الصعود، بوابه الصعود","tip_ar":"تعرضها مرتين، عند تسجيل الدخول وعند البوابه"},
"Gate": {"syn_ar":"بوابه","ant_ar":"-","fam_ar":"-","col_ar":"بوابه الصعود، رقم البوابه","tip_ar":"تابع الشاشات بعد الامن، البوابه ممكن تتغير"},
"Carry-on": {"syn_ar":"حقيبه يد","ant_ar":"امتع محقونه","fam_ar":"-","col_ar":"شنطه يد، امتعه يد","tip_ar":"خلي اللابتوب والسوائل هنا مو في الامتعه المحقونه"},
"Receipt": {"syn_ar":"ايصال، فاتوره","ant_ar":"-","fam_ar":"يستلم، مستلم","col_ar":"احتفظ بالايصال، خذ ايصال","tip_ar":"حرف p ساكن: ri-SEET"},
"Exchange Rate": {"syn_ar":"سعر الصرف","ant_ar":"-","fam_ar":"يصرف، مصروف","col_ar":"سعر الصرف، صرف فلوس","tip_ar":"كاونترات المطار عاده تعطي اسعار اقل من البنوك"},
"Currency": {"syn_ar":"عمله","ant_ar":"-","fam_ar":"-","col_ar":"عمله اجنبيه، عمله محليه","tip_ar":"اكثر ATM يسال عن نوع العمله، اختار المحليه"},
"Side Dish": {"syn_ar":"طبق جانبي","ant_ar":"طبق رييسي","fam_ar":"-","col_ar":"سلطه جانبيه، بطاطا جانبيه","tip_ar":"with a side of fries هي الطريقه الطبيعيه للطلب"},
"The Check": {"syn_ar":"الحساب","ant_ar":"-","fam_ar":"-","col_ar":"اطلب الحساب، ادفع الحساب","tip_ar":"في امريكا تقول the check وفي بريطانيا the bill"},
"Tip": {"syn_ar":"بقشيش","ant_ar":"-","fam_ar":"بقشيش، بقشيش","col_ar":"اعطي بقشيش، بقشيش كريم","tip_ar":"في امريكا 15 الى 20 بالميه عاده البقشيش بالمطاعم"},
"Allergy": {"syn_ar":"حساسيه","ant_ar":"-","fam_ar":"حساس، حساسيه","col_ar":"حساسيه طعام، حساس لـ","tip_ar":"دائما قول عندي حساسيه من... بوضوح، الحساسيه شي مهم"},
"Prescription": {"syn_ar":"روشته، وصفه طبيه","ant_ar":"-","fam_ar":"يوصف، موصوف","col_ar":"صرف روشته، دواء بروشته","tip_ar":"fill a prescription يعني تاخذ الدواء من الصيدليه"},
"Painkiller": {"syn_ar":"مسكن الم","ant_ar":"-","fam_ar":"-","col_ar":"خذ مسكن، مسكن قوي","tip_ar":"في الصيدليه اسال عن الماده الفعاله مثل ibuprofen"},
"Insurance": {"syn_ar":"تامين","ant_ar":"-","fam_ar":"يؤمن، مؤمن عليه","col_ar":"تامين صحي، بوليصه تامين","tip_ar":"Is this covered? هي الطريقه السريعه للسوال عن التامين"},
"Warranty": {"syn_ar":"ضمان","ant_ar":"-","fam_ar":"ضمان","col_ar":"تحت الضمان، فتره الضمان","tip_ar":"under warranty يعني لسه مغطى للتصليح"},
"Discount": {"syn_ar":"خصم","ant_ar":"رسوم اضافيه","fam_ar":"خصم، مخفّض","col_ar":"خذ خصم، خصم طالب","tip_ar":"on sale يعني السعر مخفوض الحين"},
"Fitting Room": {"syn_ar":"غرفه القياس","ant_ar":"-","fam_ar":"يصلح، مظبوط","col_ar":"جربها، غرفه القياس","tip_ar":"Can I try this on? هي العباره اللي تحتاجها قبل الغرفه"},
"Speed Limit": {"syn_ar":"السرعه القصوى","ant_ar":"-","fam_ar":"حد، محدود","col_ar":"لافره السرعه، تخطي السرعه المسموحه","tip_ar":"في طرق امريكا السرعه بالاميل مو الكيلومتر"},
"Detour": {"syn_ar":"تحويله","ant_ar":"طريق مباشر","fam_ar":"تحويله، محوّل","col_ar":"خذ تحويله، تحويله مرور","tip_ar":"غالبا تشوف لافته صفرا مكتوب عليها Detour"},
"Fire Escape": {"syn_ar":"مخرج حريق","ant_ar":"-","fam_ar":"يهرب، هارب","col_ar":"مسار مخرج الحريق، مخرج حريق","tip_ar":"الفنادق لازم تعرض مسار الهروب خلف الباب"},
"Fire Extinguisher": {"syn_ar":"طفاية حريق","ant_ar":"-","fam_ar":"يطفى، مطفى","col_ar":"استخدم طفاية الحريق","tip_ar":"كلمه طويله، قسمها: ex-TIN-gwi-sher"},
"Interviewer": {"syn_ar":"المقابل","ant_ar":"المقابل","fam_ar":"مقابله، قابل","col_ar":"عمليه المقابله، مقابله عمل","tip_ar":"اللي يجاوب هو المقابل، واللي يسال هو القابل"},
"Reference": {"syn_ar":"مرجع وظيفي","ant_ar":"-","fam_ar":"يحيل، محال","col_ar":"مرجع مهني، مرجع شخصي","tip_ar":"اسال قبل ما تحط احد كمرجع"},
"Overtime": {"syn_ar":"دوام اضافي","ant_ar":"-","fam_ar":"-","col_ar":"اشتغل اضافي، اجر الاضافي","tip_ar":"time and a half يعني اجر ونص زياده"},
"Raise": {"syn_ar":"زياده راتب","ant_ar":"تخفيض راتب","fam_ar":"يزيد، زايد","col_ar":"خذ زياده، اطلب زياده","tip_ar":"حاب اتناقش براتبي هي الطريقه المهذبه"},
"Agenda": {"syn_ar":"جدول اعمال","ant_ar":"-","fam_ar":"-","col_ar":"جدول الاجتماع، على الجدول","tip_ar":"اول بند على الجدول عباره شائعه بالاجتماعات"},
"Feedback": {"syn_ar":"ملاحظات، راي","ant_ar":"-","fam_ar":"-","col_ar":"اعطي ملاحظات، ملاحظات ايجابيه","tip_ar":"constructive feedback يعني نقد مفيد مو قاسي"},
"Follow Up": {"syn_ar":"متابعه","ant_ar":"-","fam_ar":"متابعه","col_ar":"تابع مع، ايميل متابعه","tip_ar":"بعد المقابلات والاجتماعات، ايميل متابعه متوقع"},
"Father": {"syn_ar":"اب","ant_ar":"-","fam_ar":"ابوه","col_ar":"ابوي، اب وابن","tip_ar":"حرف th خفيف زي the: FA-ther"},
"Mother": {"syn_ar":"ام","ant_ar":"-","fam_ar":"امومه","col_ar":"امي، لغه الام","tip_ar":"نفس حرف th الخفيف: MU-ther"},
"Brother": {"syn_ar":"اخ","ant_ar":"اخت","fam_ar":"اخوه","col_ar":"اخ اكبر، اخ اصغر","tip_ar":"شد على اول جزء: BRU-ther"},
"Sister": {"syn_ar":"اخت","ant_ar":"اخ","fam_ar":"اخوه","col_ar":"اخت اكبر، اخت اصغر","tip_ar":"قصيره وواضحه: SIS-ter"},
"Red": {"syn_ar":"احمر","ant_ar":"-","fam_ar":"محمّر","col_ar":"سياره حمرا، احمر فاتح","tip_ar":"مقطع واحد قصير، خليه سريع"},
"Blue": {"syn_ar":"ازرق","ant_ar":"-","fam_ar":"زرق","col_ar":"سما زرقا، ازرق غامق","tip_ar":"حرف متحرك واحد طويل: bloo"},
"Green": {"syn_ar":"اخضر","ant_ar":"-","fam_ar":"خضر","col_ar":"ضوء اخضر، اخضر غامق","tip_ar":"صوت ee طويل: green"},
"White": {"syn_ar":"ابيض","ant_ar":"اسود","fam_ar":"ابيض","col_ar":"قميص ابيض، ابيض نقي","tip_ar":"حرف h ساكن: wite"},
"Morning": {"syn_ar":"صباح","ant_ar":"مساء","fam_ar":"صباحات","col_ar":"بالصبح، صباح بدري","tip_ar":"شد على اول جزء: MORN-ing"},
"Coffee": {"syn_ar":"قهوه","ant_ar":"-","fam_ar":"قهوات","col_ar":"فنجان قهوه، سوّي قهوه","tip_ar":"مقطعين واضحين: COFF-ee"},
"Routine": {"syn_ar":"روتين","ant_ar":"-","fam_ar":"روتينات","col_ar":"روتين يومي، روتين صباحي","tip_ar":"شد على اخر جزء: rou-TINE"},
"Wake Up": {"syn_ar":"يصحى، يقوم","ant_ar":"ينام","fam_ar":"يصحى، يصحى","col_ar":"اصحى بدري، اصحى الساعه","tip_ar":"كلمتين، الاثنين مهمين: wake UP"},
"Catch up": {"syn_ar":"يلحق باخر الاخبار، يتكلم","ant_ar":"يفقد التواصل","fam_ar":"يلحق، يلحق","col_ar":"تكلم مع، لحق على","tip_ar":"استخدم catch up on للاخبار و catch up with للشخص"},
"Small talk": {"syn_ar":"ثرثره لطيفه","ant_ar":"حديث عميق، صمت","fam_ar":"يتكلم، يتكلم","col_ar":"سوي ثرثره، ابدأ ثرثره","tip_ar":"الثرثره تفتح ابواب قبل الكلام الجدي"},
"Hang out": {"syn_ar":"يقضي وقت مع، يتسكع","ant_ar":"يتجنب","fam_ar":"يتسكع، يتسكع","col_ar":"تسكع مع، تسكع في","tip_ar":"بالماضي تصير hung out"},
"By the way": {"syn_ar":"على فكره","ant_ar":"","fam_ar":"طريق، طرق","col_ar":"على فكره، فقط على فكره","tip_ar":"استخدمها عشان تضيف ملاحظه جانبيه بالكلام"},
"What's up": {"syn_ar":"ما الاخبار؟ كيف الحال؟","ant_ar":"","fam_ar":"فوق","col_ar":"ما الخبار مع، وش اخبارك","tip_ar":"هي تحيه مو سوال حقيقي عن المشاكل"},
"Fluency": {"syn_ar":"طلاقه، سلاسه","ant_ar":"تردد، تلعثم","fam_ar":"طليق، بطلاقه","col_ar":"تكلم بطلاقه، ابني طلاقتك","tip_ar":"الطلاقه عن الانسياب مو القواعد الممتازه"},
"Pronunciation": {"syn_ar":"النطق","ant_ar":"خطا نطق","fam_ar":"ينطق، منطوق","col_ar":"نطق واضح، حسّن نطقك","tip_ar":"الكلمه نفسها ما فيها o بعد n"},
"Pause": {"syn_ar":"وقفه، توقف قصير","ant_ar":"يكمل، يستعجل","fam_ar":"وقفه، توقف","col_ar":"خذ وقفه، وقفه للتاثير","tip_ar":"الوقفه تعطي قوه لكلامك"},
"Hesitate": {"syn_ar":"يتردد","ant_ar":"يقرر، يتصرف","fam_ar":"تردد، بتردد","col_ar":"يتردد في، يتردد قبل","tip_ar":"الثقه تكبر لما تتكلم على كل حال"},
"Express": {"syn_ar":"يعبّر، يوضح","ant_ar":"يخفي، يكتم","fam_ar":"تعبير، تعبيري","col_ar":"عبر عن نفسك، عبر عن راي","tip_ar":"الكلمات البسيطه تعبر عن الافكار احسن"},
"Vowel": {"syn_ar":"حرف متحرك","ant_ar":"حرف ساكن","fam_ar":"حرف متحرك","col_ar":"حرف متحرك طويل، حرف متحرك قصير","tip_ar":"الحروف المتحركه الامريكيه اطول لما عليها تشديد"},
"Consonant": {"syn_ar":"حرف ساكن","ant_ar":"حرف متحرك","fam_ar":"حرف ساكن","col_ar":"حرف ساكن مهموس، حرف ساكن مزدوج","tip_ar":"السواكن تحمل الايقاع والمتغيرات تحمل اللحن"},
"Stress": {"syn_ar":"النبر، التشديد","ant_ar":"بدون نبر","fam_ar":"نبر، مشدد","col_ar":"نبر الكلمه، شدد على مقطع","tip_ar":"النبر يغير المعنى: REcord مقابل reCORD"},
"Syllable": {"syn_ar":"مقطع لفظي","ant_ar":"","fam_ar":"مقطع، مقطعي","col_ar":"مقطع مشدد، عد المقاطع","tip_ar":"صفّق الكلمه عشان تعد مقاطعها"},
"Intonation": {"syn_ar":"التنغيم، نبره الجمله","ant_ar":"رتيب","fam_ar":"ينغّم، تنغيم","col_ar":"تنغيم صاعد، تنغيم هابط","tip_ar":"صوتك يطلع للاسئله وينزل للجمل"},
"Synonym": {"syn_ar":"مرادف","ant_ar":"ضد","fam_ar":"مرادف، مترادف","col_ar":"مرادف مطابق، مرادف قريب","tip_ar":"تعلّم المرادفات عشان ما تكرر كلمات"},
"Antonym": {"syn_ar":"ضد","ant_ar":"مرادف","fam_ar":"ضد، متضاد","col_ar":"ضد مطابق","tip_ar":"اربط الكلمات الجديده باضدادها عشان تحفظها"},
"Context": {"syn_ar":"السياق","ant_ar":"","fam_ar":"سياق، سياقي","col_ar":"في السياق، خارج السياق","tip_ar":"السياق يقولك اي معنى يناسب"},
"Definition": {"syn_ar":"تعريف، معنى","ant_ar":"غموض","fam_ar":"يعرّف، تعريف","col_ar":"تعريف واضح، بحكم التعريف","tip_ar":"التعريف الواضح يستخدم كلمات بسيطه"},
"Prefix": {"syn_ar":"باديه","ant_ar":"لاحقه","fam_ar":"باديه","col_ar":"ضيف باديه، باديه شائعه","tip_ar":"الباديات مثل un- غالبا تعكس المعنى"},
"Noun": {"syn_ar":"اسم","ant_ar":"","fam_ar":"اسم","col_ar":"اسم شائع، اسم علم","tip_ar":"الاسماء العلم مثل الرياض تكتب بحرف كبير"},
"Verb": {"syn_ar":"فعل","ant_ar":"","fam_ar":"فعل، فعلي","col_ar":"فعل رييسي، فعل مساعد","tip_ar":"كل جمله لازم فيها فعل واحد على الاقل"},
"Adjective": {"syn_ar":"نعت، صفه","ant_ar":"","fam_ar":"صفه","col_ar":"صفه مقارنه، صفه وصفيه","tip_ar":"الصفات تجي قبل الاسماء: a tall man"},
"Tense": {"syn_ar":"زمن الفعل","ant_ar":"","fam_ar":"زمن، ازمنه","col_ar":"زمن الماضي، زمن المضارع","tip_ar":"الزمن يبين متى صار الفعل"},
"Subject": {"syn_ar":"الفاعل","ant_ar":"المفعول","fam_ar":"فاعل، فاعلي","col_ar":"فاعل الجمله","tip_ar":"اسال من؟ عشان تلاقي الفاعل"},
"Accent": {"syn_ar":"لهجه، طريقه نطق","ant_ar":"","fam_ar":"لهجه، لكنون","col_ar":"لهجه قويه، لهجه خفيفه","tip_ar":"اللهجات طبيعيه؛ الوضوح اهم"},
"Audio": {"syn_ar":"صوت مسجل","ant_ar":"صمت","fam_ar":"صوتي، سمعي بصري","col_ar":"مقطع صوتي، شغّل الصوت","tip_ar":"الصوت الواضح يساعدك تلتقط كل كلمه"},
"Replay": {"syn_ar":"اعاده تشغيل","ant_ar":"تخطّي","fam_ar":"يعيد، معاد","col_ar":"اعد تشغيل مقطع، اضغط اعاده","tip_ar":"اعد الاجزاء الصعبه لين تصير سهله"},
"Mumble": {"syn_ar":"يهمس، يتكلم بغير وضوح","ant_ar":"ينطق بوضوح، يصرخ","fam_ar":"يهمس، مهموم","col_ar":"يهمس كلمات، يهمس لنفسه","tip_ar":"افتح فمك اكثر عشان ما تهمس"},
"Volume": {"syn_ar":"مستوى الصوت","ant_ar":"كتم","fam_ar":"مستوى الصوت","col_ar":"ارفع الصوت، خفّض الصوت","tip_ar":"الصوت الواضح يساعدك تلتقط التفاصيل"},
"Skim": {"syn_ar":"يقرا بسرعه","ant_ar":"يدرس بعمق","fam_ar":"يقرا بسرعه، تصفّح","col_ar":"تصفّح بسرعه، تصفّح نص","tip_ar":"التصفّح السريع للفكره العامه مو للتفاصيل"},
"Scan": {"syn_ar":"يبحث بسرعه","ant_ar":"يتصفّح","fam_ar":"يبحث، بحث","col_ar":"ابحث عن، امسح قائمه","tip_ar":"البحث السريع يدور على شي محدد"},
"Passage": {"syn_ar":"مقطع، فقره","ant_ar":"","fam_ar":"مقطع، مقاطع","col_ar":"مقطع قراءه، مقطع قصير","tip_ar":"المقطع قطعه قصيره من نص"},
"Headline": {"syn_ar":"عنوان رييسي","ant_ar":"تذييل","fam_ar":"عنوان، عناوين","col_ar":"عنوان الصفحه الاولى، اكتب عنوان","tip_ar":"العناوين تلخص القصه كامله"},
"Summarize": {"syn_ar":"يلخّص","ant_ar":"يوسّع، يفصّل","fam_ar":"ملخص، تلخيص","col_ar":"لخّص في، لخّص باختصار","tip_ar":"الملخص يبقي النقاط الرييسيه بس"},
"Essay": {"syn_ar":"مقال","ant_ar":"","fam_ar":"مقال، كاتب مقالات","col_ar":"اكتب مقال، سؤال مقال","tip_ar":"المقال فيه مقدمه وموضوع وخاتمه"},
"Thesis": {"syn_ar":"فكره رييسيه","ant_ar":"","fam_ar":"اطروحه","col_ar":"جمله الفكره، دافع عن الفكره","tip_ar":"جمله وحده تحمل المقال كله"},
"Draft": {"syn_ar":"مسوده","ant_ar":"نسخه نهائيه","fam_ar":"مسوده، مسوّد","col_ar":"مسوده اوليه، سوّد مقال","tip_ar":"المسوده مصممه للتحسين"},
"Revise": {"syn_ar":"يراجع ويعدّل","ant_ar":"يبقي","fam_ar":"يراجع، مراجعه","col_ar":"راجع من اجل، راجع مسوده","tip_ar":"راجع للافكار بعدين عدّل للقواعد"},
"Paragraph": {"syn_ar":"فقره","ant_ar":"","fam_ar":"فقره","col_ar":"فقره افتتاحيه، جمله موضوع","tip_ar":"ابدا الفقره بفكرتها الرييسيه"},
"Espresso": {"syn_ar":"اسبريسو","ant_ar":"","fam_ar":"اسبريسو","col_ar":"اسبريسو مضاعف، شوط اسبريسو","tip_ar":"الاسبريسو اساس لكثير مشروبات"},
"Latte": {"syn_ar":"لاتيه","ant_ar":"","fam_ar":"لاتيه","col_ar":"اطلب لاتيه، لاتيه مثلج","tip_ar":"شد على الجزء الثاني: la-TAY"},
"Barista": {"syn_ar":"باريستا","ant_ar":"","fam_ar":"باريستا","col_ar":"اسال الباريستا، باريستا محترف","tip_ar":"الباريستا يجهز ويقدم القهوه"},
"To Go": {"syn_ar":"للسفري","ant_ar":"للحضور","fam_ar":"يروح","col_ar":"طلب سفري، هنا ولا سفري","tip_ar":"to go يعني خذها معك"},
"Decaf": {"syn_ar":"قهوه منزوع الكافيين","ant_ar":"عادي","fam_ar":"منزوع الكافيين","col_ar":"اطلب ديكاف، قهوه ديكاف","tip_ar":"decaf اختصار ل decaffeinated"},
"Cool": {"syn_ar":"رايع، ممتاز","ant_ar":"سخيف","fam_ar":"كول، اروع","col_ar":"يبدو كول، كول مره","tip_ar":"cool تعني حلو او تمام بالعاميه"},
"Buck": {"syn_ar":"دولار","ant_ar":"","fam_ar":"دولار، دولارات","col_ar":"كم دولار، اصنع دولار","tip_ar":"buck عاميه تعني دولار واحد"},
"Hang Out": {"syn_ar":"يقضي وقت مع، يتسكع","ant_ar":"يتجنب","fam_ar":"يتسكع، يتسكع","col_ar":"تسكع مع، تسكع في","tip_ar":"بالماضي تصير hung out"},
"Rip Off": {"syn_ar":"يغش، سعر مبالغ فيه","ant_ar":"صفقه عادله","fam_ar":"يمزق، ممزوق","col_ar":"غش احد، غش","tip_ar":"rip off ممكن فعل او اسم"},
"Beat": {"syn_ar":"منهك، متعب","ant_ar":"نشيط","fam_ar":"منهك، مضروب","col_ar":"يحس تعبان، يبان تعبان","tip_ar":"بالعاميه beat تعني متعب مره"},
"Break a leg": {"syn_ar":"حظ سعيد","ant_ar":"حظ سيء","fam_ar":"يكسر، انكسر","col_ar":"قل حظ سعيد، قول لاحد حظ سعيد","tip_ar":"تعني حظ سعيد خاصة على المسرح"},
"Piece of cake": {"syn_ar":"امر سهل جدا","ant_ar":"صعب جدا","fam_ar":"كيك","col_ar":"كون قطعه كيك","tip_ar":"تصف شي سهل جدا"},
"Hit the books": {"syn_ar":"يذاكر بجد","ant_ar":"يتكاسل","fam_ar":"يضرب، كتب","col_ar":"يذاكر بجد من اجل","tip_ar":"تعني يذاكر بجد"},
"Under the weather": {"syn_ar":"متوعك","ant_ar":"صحي","fam_ar":"طقس","col_ar":"يحس بتوعك","tip_ar":"تعني يحس شوي مريض"},
"Once in a blue moon": {"syn_ar":"نادرا جدا","ant_ar":"غالبا","fam_ar":"قمر","col_ar":"يصير نادرا جدا","tip_ar":"تعني تقريبا ابدا"},
"Give up": {"syn_ar":"يستسلم","ant_ar":"يكمل","fam_ar":"يعطي، استسلم","col_ar":"استسلم على، توقف عن المحاوله","tip_ar":"give up تعني توقف عن المحاوله"},
"Look forward to": {"syn_ar":"يتطلع الى","ant_ar":"يخاف من","fam_ar":"ينظر، تطلع","col_ar":"يتطلع لعمل، يتطلع لرؤيه","tip_ar":"بعدها اسم او فعل ing"},
"Turn out": {"syn_ar":"ينتج، يتضح","ant_ar":"","fam_ar":"يقلب، اتضح","col_ar":"اتضح انه، طلع","tip_ar":"تبين كيف الموقف ينتهي"},
"Get along": {"syn_ar":"يتفق مع","ant_ar":"يتعارك","fam_ar":"يجيب، اتفق","col_ar":"يتفق مع، يتفقون","tip_ar":"استخدم get along with للشخص"},
"Figure out": {"syn_ar":"يفهم، يحل","ant_ar":"يتحيّر","fam_ar":"شكل، فهم","col_ar":"افهم كيف، افهم وش","tip_ar":"تعني يفهم او يحل"},
"Episode": {"syn_ar":"حلقه","ant_ar":"","fam_ar":"حلقه، عرضي","col_ar":"شاهد حلقه، حلقه جديده","tip_ar":"الموسم مجموعه من حلقات"},
"Season": {"syn_ar":"موسم","ant_ar":"","fam_ar":"موسم، مواسم","col_ar":"موسم جديد، موسم اخير","tip_ar":"الموسم يجمع حلقات كثيره"},
"Spoiler": {"syn_ar":"كاشف للاحداث","ant_ar":"تشويق","fam_ar":"يفسد، كواشف","col_ar":"تحذير حرق، انشر حرق","tip_ar":"السبويلر يكشف وش يصير بعدين"},
"Binge": {"syn_ar":"يشاهد حلقات متتاليه","ant_ar":"يوزّع","fam_ar":" binge, binge","col_ar":"شاهد متتالي، انهمك بـ","tip_ar":"binge تعني تشاهد كثير دفعه وحده"},
"Streaming": {"syn_ar":"بث، مشاهده اونلاين","ant_ar":"تنزيل","fam_ar":"يبث، بث","col_ar":"خدمه بث، بث مباشر","tip_ar":"streaming يعني تشاهد اونلاين"},
"Lyrics": {"syn_ar":"كلمات اغنيه","ant_ar":"لحن","fam_ar":"كلمات، غنائي","col_ar":"اكتب كلمات، غنّي الكلمات","tip_ar":"الكلمات هي كلام الاغنيه"},
"Chorus": {"syn_ar":"المقطع المتكرر","ant_ar":"مقطع","fam_ar":"كورس، كورسات","col_ar":"غنّي المقطع المتكرر، مقطع متكرر حلو","tip_ar":"المقطع المتكرر يتكرر طول الاغنيه"},
"Verse": {"syn_ar":"المقطع","ant_ar":"كورس","fam_ar":"مقطع، متمكن","col_ar":"اول مقطع، اكتب مقطع","tip_ar":"المقطع يحكي القصه بين الكورسات"},
"Melody": {"syn_ar":"لحن","ant_ar":"ضجيج","fam_ar":"لحن، لحني","col_ar":"اهلل لحن، لحن بسيط","tip_ar":"اللحن هو نغمه الاغنيه الرييسيه"},
"Beat": {"syn_ar":"ايقاع، نبض","ant_ar":"صمت","fam_ar":"نبض، نبضات","col_ar":"حافظ على الايقاع، ايقاع قوي","tip_ar":"الايقاع هو النبض المنتظم للاغنيه"},
"Nuance": {"syn_ar":"فرق دقيق","ant_ar":"وضوح","fam_ar":"فرق دقيق، دقيق","col_ar":"فرق دقيق، التقط فرق دقيق","tip_ar":"الفرق الدقيق هو اختلاف بسيط خفي"},
"Articulate": {"syn_ar":"يعبّر بوضوح","ant_ar":"يهمس","fam_ar":"ينطق، نطق","col_ar":"عبر بوضوح، عبر عن فكره","tip_ar":"articulate تعني يتكلم بوضوح"},
"Eloquence": {"syn_ar":"بلاغه، فصاحه","ant_ar":"رقابه","fam_ar":"بليغ، ببلاغه","col_ar":"تكلم ببلاغه","tip_ar":"البلاغه كلام واضح ومقنع"},
"Connotation": {"syn_ar":"المعنى الضمني","ant_ar":"المعنى الحرفي","fam_ar":"يدل، دلالي","col_ar":"معنى ضمني ايجابي، معنى ضمني سلبي","tip_ar":"المعنى الضمني هو الشعور اللي تحمله الكلمه"},
"Pragmatics": {"syn_ar":"استعمال اللغه في السياق","ant_ar":"قواعد","fam_ar":"عملي، عملي","col_ar":"ادرس البراغماتيك، معنى عملي","tip_ar":"البراغماتيك هو المعنى في السياق الحقيقي"},
"Immersion": {"syn_ar":"انغماس","ant_ar":"تجنّب","fam_ar":"يغمر، منغمس","col_ar":"انغماس لغوي، انغماس كامل","tip_ar":"الانغماس يعني تعيش اللغه كل يوم"},
"Instinct": {"syn_ar":"حدس، غريزه","ant_ar":"تفكير","fam_ar":"غريزه، غريزي","col_ar":"ثق بحدسك، بغريزه","tip_ar":"الغريزه تعرف بدون ما تفكر"},
"Converse": {"syn_ar":"يتكلم","ant_ar":"يسكت","fam_ar":"يتكلم، محادثه","col_ar":"تحدث مع، تحدث بـ","tip_ar":"converse تعني يتكلم مع احد"},
"Proficiency": {"syn_ar":"اتقان، كفايه","ant_ar":"ضعف","fam_ar":"متمكن، اتقان","col_ar":"كفايه لغويه، كفايه عاليه","tip_ar":"الكفايه هي مستوى مهارتك"},
"Tongue-tied": {"syn_ar":"عاجز عن الكلام","ant_ar":"بليغ","fam_ar":"لسان، ربط","col_ar":"يحس عاجز عن الكلام، يصير عاجز","tip_ar":"يعني ما تقدر تتكلم من التوتر"},
"Hello": {"syn_ar":"مرحبا","ant_ar":"وداعا","fam_ar":"مرحبا","col_ar":"قل مرحبا، مرحبا هناك","tip_ar":"hello تصلح اي وقت باليوم"},
"Goodbye": {"syn_ar":"مع السلامه","ant_ar":"مرحبا","fam_ar":"وداع","col_ar":"قل وداعا، لوّح وداعا","tip_ar":"goodbye تنهي اللقاء باحترام"},
"Welcome": {"syn_ar":"اهلا وسهلا","ant_ar":"وداعا","fam_ar":"اهلا وسهلا، مرحبا","col_ar":"اهلا في، اهلا وسهلا بكم","tip_ar":"welcome ترحب بلي يجي"},
"Good morning": {"syn_ar":"صباح الخير","ant_ar":"تصبح على خير","fam_ar":"صباح","col_ar":"قل صباح الخير، صباح الخير لك","tip_ar":"استخدمها قبل الظهر"},
"Thank you": {"syn_ar":"شكرا لك","ant_ar":"","fam_ar":"شكرا، شكر","col_ar":"قل شكرا، شكرا جزيلا","tip_ar":"شكرا تظهر الامتنان"},
"Invitation": {"syn_ar":"دعوه","ant_ar":"رفض","fam_ar":"يدعو، مدعو","col_ar":"اقبل دعوه، ابعت دعوه","tip_ar":"الدعوه تطلب من احد يجي"},
"Host": {"syn_ar":"مضيف","ant_ar":"ضيف","fam_ar":"مضيف، استضاف","col_ar":"استضاف، استضاف تجمع","tip_ar":"المضيف يستقبل الضيوف"},
"Guest": {"syn_ar":"ضيف","ant_ar":"مضيف","fam_ar":"ضيف، ضيوف","col_ar":"رحب بضيف، ضيف بالبيت","tip_ar":"الضيف هو احد مدعو"},
"Gathering": {"syn_ar":"تجمع، مجلس","ant_ar":"تفرق","fam_ar":"يجتمع، تجمع","col_ar":"تجمع عايلي، تجمع اجتماعي","tip_ar":"التجمع هو ناس يجتمعون مع بعض"},
"Hospitality": {"syn_ar":"كرم الضيافه","ant_ar":"برود","fam_ar":"ضيافي، ضيافه","col_ar":"اظهر ضيافه، ضيافه كريمه","tip_ar":"الضيافه هي استقبال الضيوف بحراره"},
"Meeting": {"syn_ar":"اجتماع","ant_ar":"تفرق","fam_ar":"يلتقي، اجتماع","col_ar":"جدول اجتماع، اجتماع فريق","tip_ar":"الاجتماع حديث عمل مخطط له"},
"Deadline": {"syn_ar":"موعد نهايي","ant_ar":"تمديد","fam_ar":"موعد نهائي، مواعيد نهائيه","col_ar":"حققت الموعد، فاتك الموعد","tip_ar":"الموعد النهائي هو اخر وقت للتسليم"},
"Colleague": {"syn_ar":"زميل عمل","ant_ar":"منافس","fam_ar":"زميل، زملاء","col_ar":"زميل مقرب، زميل عمل","tip_ar":"الزميل هو احد تشتغل معه"},
"Shift": {"syn_ar":"ورديه عمل","ant_ar":"اجازه","fam_ar":"ورديه، ورديات","col_ar":"ورديه ليل، ورديه نهار","tip_ar":"الورديه هي فتره عمل واحده"},
"Approve": {"syn_ar":"يوافق","ant_ar":"يرفض","fam_ar":"يوافق، موافقه","col_ar":"وافق على طلب، وافق على","tip_ar":"وافق على طلب يعني قبله رسميا"},
"Appointment": {"syn_ar":"موعد طبي","ant_ar":"الغاء","fam_ar":"يعين، موعد","col_ar":"احجز موعد، الغي موعد","tip_ar":"احجز موعد قبل ما تروح"},
"Symptom": {"syn_ar":"عَرَض مرضي","ant_ar":"","fam_ar":"عَرَض، عرضي","col_ar":"عَرَض خفيف، عَرَض شائع","tip_ar":"العَرَض اشاره على المرض"},
"Recovery": {"syn_ar":"تعافي","ant_ar":"انتكاسه","fam_ar":"يتعافى، تعافي","col_ar":"تعافي كامل، تسريع التعافي","tip_ar":"التعافي هو التحسن بعد المرض"},
"Insurance": {"syn_ar":"تامين صحي","ant_ar":"","fam_ar":"يؤمن، تامين","col_ar":"تامين صحي، بطاقه التامين","tip_ar":"التامين يساعد يدفع تكاليف العلاج"},
"Checkup": {"syn_ar":"فحص طبي دوري","ant_ar":"","fam_ar":"يفحص، فحص","col_ar":"فحص دوري، فحص طبي","tip_ar":"الفحص يكشف المشاكل بدري"},
"Ticket": {"syn_ar":"تذكره","ant_ar":"","fam_ar":"تذكره، تذاكر","col_ar":"احجز تذكره، تذكره طياره","tip_ar":"خلي تذكرتك جاهزه عند البوابه"},
"Passport": {"syn_ar":"جواز سفر","ant_ar":"","fam_ar":"جواز، جوازات","col_ar":"اعرض جوازك، جدد جواز","tip_ar":"تاكد من تاريخ انتهاء الجواز"},
"Luggage": {"syn_ar":"امتعه، حقايب","ant_ar":"","fam_ar":"امتعه","col_ar":"حزم الامتعه، وزن الامتعه المسموح","tip_ar":"luggage ما تعد؛ لا تقل luggages"},
"Boarding": {"syn_ar":"صعود الطايره","ant_ar":"نزول","fam_ar":"يصعد، صعود","col_ar":"تذكره الصعود، بوابه الصعود","tip_ar":"الصعود يعني تركب الطايره"},
"Departure": {"syn_ar":"مغادره، اقلاع","ant_ar":"وصول","fam_ar":"يغادر، مغادره","col_ar":"وقت المغادره، بوابه المغادره","tip_ar":"المغادره هي لما تروح"},
"Etiquette": {"syn_ar":"اداب، اتيكيت","ant_ar":"قله ادب","fam_ar":"اتيكيت","col_ar":"اتيكيت صحيح، اتيكيت لبس","tip_ar":"الاتيكيت هو تصرف مهذب في مكان"},
"Prayer": {"syn_ar":"صلاه، دعا","ant_ar":"","fam_ar":"يصلي، صلاه","col_ar":"وقت الصلاه، قاعه صلاه","tip_ar":"خلي هادي وقت الصلاه"},
"Respect": {"syn_ar":"احترام","ant_ar":"قله احترام","fam_ar":"احترام، محترم","col_ar":"اظهر احترام، عامل باحترام","tip_ar":"الاحترام يعني تعامل الناس حلو"},
"Modest": {"syn_ar":"محتشم، متواضع","ant_ar":"متباهي","fam_ar":"محتشم، حياء","col_ar":"لبس محتشم، تصرف متواضع","tip_ar":"اللبس المحتشم بسيط ويستر"},
"Quiet": {"syn_ar":"هادي، صامت","ant_ar":"صاخب","fam_ar":"هادي، بهدوء","col_ar":"خليك هادي، مكان هادي","tip_ar":"quiet مقطعين: qui-et"},
"Caller": {"syn_ar":"المتصل","ant_ar":"المستقبل","fam_ar":"يتصل، متصل","col_ar":"متصل مجهول، متصل دائم","tip_ar":"المتصل هو اللي يرفع السماعه"},
"Hold": {"syn_ar":"انتظار على الخط","ant_ar":"يغلق الخط","fam_ar":"يمسك، انتظار","col_ar":"على الانتظار، حط على الانتظار","tip_ar":"hold يعني انتظر على التلفون"},
"Voicemail": {"syn_ar":"بريد صوتي","ant_ar":"","fam_ar":"صوت، بريد","col_ar":"اترك رساله صوتيه، شيك على البريد الصوتي","tip_ar":"البريد الصوتي يسجل رسالتك"},
"Dial": {"syn_ar":"يطلب رقما","ant_ar":"يغلق الخط","fam_ar":"يطلب، طلب","col_ar":"اطلب رقم، اتصل","tip_ar":"dial تعني تدخل رقم"},
"Receptionist": {"syn_ar":"موظف الاستقبال","ant_ar":"","fam_ar":"استقبال، موظف استقبال","col_ar":"موظف الاستقبال، اتصل بموظف الاستقبال","tip_ar":"موظف الاستقبال يرحب ويوجّه المتصلين"},
"Scene": {"syn_ar":"مشهد","ant_ar":"","fam_ar":"مشهد، مشاهد","col_ar":"صوّر مشهد، قطع مشهد","tip_ar":"المشهد جزء واحد من الفيلم"},
"Sequel": {"syn_ar":"جز ثاني، تتمه","ant_ar":"بادئه","fam_ar":"تتمه، تتمات","col_ar":"تتمه لـ، سوي تتمه","tip_ar":"التتمه تجي بعد الفيلم الاول"},
"Plot": {"syn_ar":"حبكه، قصه","ant_ar":"","fam_ar":"حبكه، حبكات","col_ar":"لفه بالقصه، طوّر الحبكه","tip_ar":"الحبكه هي قصه الفيلم"},
"Trailer": {"syn_ar":"اعلان الفيلم","ant_ar":"فيلم كامل","fam_ar":"اعلان، اعلانات","col_ar":"شاهد الاعلان، اعلان فيلم","tip_ar":"الاعلان يعرض اهم المشاهد قبل الاصدار"},
"Cast": {"syn_ar":"طاقم الممثلين","ant_ar":"","fam_ar":"طاقم، اختيار ممثلين","col_ar":"عضو طاقم، طاقم كامل","tip_ar":"الطاقم هم كل الممثلين بالفيلم"},
}

def patch_vocab_bank(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find VOCAB_BANK start and end
    start_marker = 'const VOCAB_BANK = ['
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print("ERROR: VOCAB_BANK not found")
        return

    # Find the closing ];
    search_start = start_idx + len(start_marker)
    end_idx = content.find('];', search_start)
    if end_idx == -1:
        print("ERROR: VOCAB_BANK end not found")
        return

    vocab_section = content[start_idx:end_idx + 2]

    # For each word in TRANSLATIONS, find the entry and add _ar fields
    for en_word, ar_fields in TRANSLATIONS.items():
        # Find the entry by looking for en:'Word'
        # We need to be careful with special characters
        en_pattern = "en:'" + en_word.replace("'", "\\'") + "'"
        en_pos = vocab_section.find(en_pattern)
        if en_pos == -1:
            print(f"WARNING: '{en_word}' not found in VOCAB_BANK")
            continue

        # Check if _ar fields already exist (skip if already patched)
        check_section = vocab_section[en_pos:en_pos + 500]
        if 'synonyms_ar' in check_section:
            continue

        # Find the 'mistake:' field to insert before it
        # We'll insert _ar fields before 'mistake:'
        mistake_pos = vocab_section.find(", mistake:'", en_pos)
        if mistake_pos == -1:
            # Try without comma
            mistake_pos = vocab_section.find("mistake:'", en_pos)
            if mistake_pos == -1:
                print(f"WARNING: 'mistake' field not found for '{en_word}'")
                continue
            insert_pos = mistake_pos
        else:
            insert_pos = mistake_pos + 1  # after the comma

        # Build the _ar fields string
        ar_insert = f" synonyms_ar:'{ar_fields['syn_ar']}', antonyms_ar:'{ar_fields['ant_ar']}', family_ar:'{ar_fields['fam_ar']}', collocations_ar:'{ar_fields['col_ar']}', tip_ar:'{ar_fields['tip_ar']}',"

        # Insert
        vocab_section = vocab_section[:insert_pos] + ar_insert + vocab_section[insert_pos:]

    # Reconstruct the file
    content = content[:start_idx] + vocab_section + content[end_idx + 2:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Patched {len(TRANSLATIONS)} entries in VOCAB_BANK")

if __name__ == '__main__':
    patch_vocab_bank('/home/user/workspace/tutorfiraspel/app.html')
