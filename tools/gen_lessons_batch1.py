#!/usr/bin/env python3
# Generates + inserts a batch of PEL lessons into live Supabase via the
# Management API /database/query endpoint.
# Arabic: Saudi/Abha casual, no hamza (ا only), no em dash.
import json, urllib.request

PAT = "${SUPABASE_PAT}"
PROJ = "lewoochehpiycocvfwtz"
UA = "PelAdminScript/1.0"
URL = f"https://api.supabase.com/v1/projects/{PROJ}/database/query"

def esc(s):
    return str(s).replace("'", "''")

def sql_val(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + esc(v) + "'"

def arr_val(items):
    return "ARRAY[" + ",".join(sql_val(i) for i in items) + "]::text[]"

# ---- content helpers ----
def W(en, ar, tr):
    return {"kind": "word", "en": en, "ar": ar, "tr": tr}

def E(en, ar):
    return {"kind": "explain", "en": en, "ar": ar, "tr": ""}

def S(en, ar, tr):
    return {"kind": "sentence", "en": en, "ar": ar, "tr": tr}

def CHO(q_en, q_ar, q_tr, opts, h_en, h_ar):
    return {"type": "choose", "hint_en": h_en, "hint_ar": h_ar,
            "payload": {"type": "choose",
                        "question": {"en": q_en, "ar": q_ar, "tr": q_tr},
                        "options": opts, "hint": {"en": h_en, "ar": h_ar}}}

def ORD(tokens, pr_en, pr_tr, h_en, h_ar, ar):
    return {"type": "order", "hint_en": h_en, "hint_ar": h_ar,
            "payload": {"type": "order", "tokens": tokens, "answer": tokens,
                        "prompt": {"en": pr_en, "tr": pr_tr},
                        "hint": {"en": h_en, "ar": h_ar}, "ar": ar}}

def TR(src, ans, accepts):
    return {"type": "translate", "hint_en": None, "hint_ar": None,
            "payload": {"type": "translate", "dir": "en-ar", "source": src,
                        "answer": ans, "accept": accepts}}

def ok(t):
    return {"t": t, "ok": True}

def no(t):
    return {"t": t, "ok": False}

def L(id, ten, tar, level, academy, items, exs, prereqs=None, minutes=7, skills=None):
    return {"id": id, "title_en": ten, "title_ar": tar, "level": level,
            "academy": academy, "minutes": minutes, "kind": "core",
            "skills": skills or ["speaking"], "prereqs": prereqs or [],
            "items": items, "exercises": exs}

LESSONS = []

# ===== A0 SOCIAL ENGLISH (3 -> 8) =====
AC = "a0-social-english"
LESSONS += [
 L("a0soc-hello-goodbye", "Hello and Goodbye", "سلام ووداع", "A0", AC,
   [W("hello", "سلام / هلا", "هلو"), W("goodbye", "مع السلامة", "قود باي"),
    W("see you", "اشوفك", "سي يو"),
    E("Say hello when you meet, goodbye when you leave.", "قول هلم وقت ما تقابل احد، وقود باي وقت ما تروح."),
    S("Hello, how are you?", "هلا، كيف حالك؟", "هلو هاو ار يو"),
    S("Goodbye, see you later.", "مع السلامة، اشوفك بعدين.", "قود باي سي يو ليتير")],
   [ORD(["Hello", "how", "are", "you"], "Build: Hello, how are you?", "بلد ات: هلو هاو ار يو",
        "Greeting first, then the question.", "السلام اول شي وبعدين السؤال.", "هلا كيف حالك"),
    CHO("Goodbye, ___ later.", "مع السلامة، ___ بعدين.", "قود باي ___ ليتير",
        [ok("see you"), no("hello"), no("thank you")], "Use see you when leaving.", "سي يو وقت الذهاب."),
    TR("Hello, see you later.", "هلو اشوفك بعدين", ["هلو سي يو ليتير", "هلا اشوفك بعدين", "هلو اشوفك بعدين"])],
   minutes=6, skills=["speaking"]),
 L("a0soc-thanks-sorry", "Thank You and Sorry", "شكرا واعتذر", "A0", AC,
   [W("thank you", "شكرا لك", "ثانك يو"), W("sorry", "اعتذر", "سوري"),
    W("you are welcome", "العفو", "يور ويلكم"),
    E("Thank you for help, sorry for a mistake.", "قول ثانك يو وقت المساعدة، وسوري وقت الغلط."),
    S("Thank you for your help.", "شكرا على مساعدتك.", "ثانك يو فور يور هلب"),
    S("Sorry, I am late.", "اعتذر، تأخرت.", "سوري اي ام ليت")],
   [ORD(["Sorry", "I", "am", "late"], "Build: Sorry, I am late.", "بلد ات: سوري اي ام ليت",
        "Sorry first, then the reason.", "سوري اول شي وبعدين السبب.", "اعتذر تأخرت"),
    CHO("Thank you. - You ___ welcome.", "شكرا. - انت ___ العفو.", "ثانك يو. - يو ___ ويلكم",
        [ok("are"), no("am"), no("is")], "You are welcome replies to thank you.", "يور ويلكم جواب ثانك يو."),
    TR("Thank you for your help.", "شكرا على مساعدتك", ["ثانك يو فور يور هلب", "شكرا على مساعدتك"])],
   prereqs=["a0soc-hello-goodbye"], minutes=6, skills=["speaking"]),
 L("a0soc-name-intro", "What is your name", "وش اسمك", "A0", AC,
   [W("what", "وش / ايش", "وات"), W("name", "اسم", "نيم"), W("my name is", "اسمي", "ماي نيم از"),
    E("Ask what is your name, answer my name is.", "اسال وات از يور نيم، وجاوب ماي نيم از."),
    S("What is your name?", "وش اسمك؟", "وات از يور نيم"),
    S("My name is Firas.", "اسمي فراس.", "ماي نيم از فراس")],
   [ORD(["What", "is", "your", "name"], "Build: What is your name?", "بلد ات: وات از يور نيم",
        "Question word first.", "كلمة السؤال اول شي.", "وش اسمك"),
    CHO("My name ___ Firas.", "اسمي ___ فراس.", "ماي نيم ___ فراس",
        [ok("is"), no("am"), no("are")], "My name is uses is.", "ماي نيم از تستخدم از."),
    TR("My name is Firas.", "اسمي فراس", ["ماي نيم از فراس", "اسمي فراس"])],
   prereqs=["a0soc-hello-goodbye"], minutes=6, skills=["speaking"]),
 L("a0soc-how-are-you", "How are you today", "كيف حالك اليوم", "A0", AC,
   [W("how", "كيف", "هاو"), W("fine", "زين / بخير", "فاين"), W("today", "اليوم", "توداي"),
    E("Reply I am fine, thanks.", "جاوب اي ام فاين ثانكس."),
    S("How are you today?", "كيف حالك اليوم؟", "هاو ار يو توداي"),
    S("I am fine, thank you.", "انا زين، شكرا.", "اي ام فاين ثانك يو")],
   [ORD(["How", "are", "you", "today"], "Build: How are you today?", "بلد ات: هاو ار يو توداي",
        "How first.", "هاو اول شي.", "كيف حالك اليوم"),
    CHO("I ___ fine.", "انا ___ زين.", "اي ___ فاين",
        [ok("am"), no("is"), no("are")], "I takes am.", "مع اي نستخدم ام."),
    TR("I am fine, thank you.", "انا زين شكرا", ["اي ام فاين ثانك يو", "انا زين شكرا"])],
   prereqs=["a0soc-hello-goodbye"], minutes=6, skills=["speaking"]),
 L("a0soc-polite-words", "Please and Excuse me", "لو سمحت وعذرا", "A0", AC,
   [W("please", "لو سمحت", "بليز"), W("excuse me", "عذرا", "اكسكيوز مي"), W("yes", "نعم / اي", "يس"),
    E("Add please to be polite.", "ضف بليز عشان تكون مهذب."),
    S("Excuse me, please.", "عذرا، لو سمحت.", "اكسكيوز مي بليز"),
    S("Yes, please.", "اي، لو سمحت.", "يس بليز")],
   [ORD(["Excuse", "me", "please"], "Build: Excuse me, please.", "بلد ات: اكسكيوز مي بليز",
        "Excuse me first.", "اكسكيوز مي اول شي.", "عذرا لو سمحت"),
    CHO("Yes, ___.", "اي، ___.", "يس ___",
        [ok("please"), no("goodbye"), no("sorry")], "Yes is the polite reply.", "يس الجواب المهذب."),
    TR("Excuse me, please.", "عذرا لو سمحت", ["اكسكيوز مي بليز", "عذرا لو سمحت"])],
   prereqs=["a0soc-thanks-sorry"], minutes=6, skills=["speaking"]),
]

# ===== A1 POSSESSION (2 -> 8) =====
AC = "a1-possession"
LESSONS += [
 L("a1pos-have-has", "Have and Has", "لديه وعنده", "A1", AC,
   [W("have", "عندي / لدي", "هاف"), W("has", "عنده / لديه", "هز"),
    E("I/you/we/they use have; he/she/it uses has.", "اي ويو وي ذي تستخدم هاف؛ وهي شي ات تستخدم هز."),
    S("I have a car.", "عندي سيارة.", "اي هاف ا كار"),
    S("She has a brother.", "عندها اخ.", "شي هز ا براذر"),
    S("We have time.", "عندنا وقت.", "وي هاف تايم")],
   [CHO("She ___ a car.", "عندها ___ سيارة.", "شي ___ ا كار",
        [ok("has"), no("have"), no("is")], "She takes has.", "شي تستخدم هز."),
    ORD(["I", "have", "a", "car"], "Build: I have a car.", "بلد ات: اي هاف ا كار",
        "Subject then have then object.", "الفاعل بعدين هاف بعدين المفعول.", "عندي سيارة"),
    TR("We have time.", "عندنا وقت", ["وي هاف تايم", "عندنا وقت"])],
   minutes=7, skills=["grammar", "speaking"]),
 L("a1pos-my-your", "My, Your, His, Her", "ملكي وملكك وملكه وملكها", "A1", AC,
   [W("my", "ملكي / تاعي", "ماي"), W("your", "ملكك / تاعك", "يور"),
    W("his", "ملكه", "هز"), W("her", "ملكها", "هر"),
    E("Possessives show who owns something.", "الملكيات تبين مين مالك الشيء."),
    S("This is my book.", "هذا كتابي.", "ذس از ماي بوك"),
    S("Her name is Sara.", "اسمها سارة.", "هر نيم از سارة")],
   [CHO("This is ___ book (Ali).", "هذا كتاب ___ (علي).", "ذس از ___ بوك",
        [ok("his"), no("her"), no("my")], "His for a boy, her for a girl.", "هز للولد، هر للبنت."),
    ORD(["This", "is", "my", "book"], "Build: This is my book.", "بلد ات: ذس از ماي بوك",
        "This is + possessive + noun.", "ذس از بعدين الملكية بعدين الاسم.", "هذا كتابي"),
    TR("Her name is Sara.", "اسمها سارة", ["هر نيم از سارة", "اسمها سارة"])],
   prereqs=["a1pos-have-has"], minutes=7, skills=["grammar", "speaking"]),
 L("a1pos-there-is", "There is and There are", "في وهناك", "A1", AC,
   [W("there is", "في / يوجد", "ذير از"), W("there are", "في / يوجدون", "ذير ار"),
    E("Use there is for one, there are for many.", "استخدم ذير از للواحد، وذير ار للكثير."),
    S("There is a problem.", "في مشكلة.", "ذير از ا بروبلم"),
    S("There are five students.", "في خمسة طلاب.", "ذير ار فايف ستودنتس")],
   [CHO("There ___ three books.", "في ___ ثلاثة كتب.", "ذير ___ ثري بوكس",
        [ok("are"), no("is"), no("has")], "One takes is, many take are.", "الواحد از، والكثير ار."),
    ORD(["There", "is", "a", "problem"], "Build: There is a problem.", "بلد ات: ذير از ا بروبلم",
        "There is + a + noun.", "ذير از بعدين ا بعدين الاسم.", "في مشكلة"),
    TR("There are five students.", "في خمسة طلاب", ["ذير ار فايف ستودنتس", "في خمسة طلاب"])],
   prereqs=["a1pos-have-has"], minutes=7, skills=["grammar", "speaking"]),
 L("a1pos-whose", "Whose is it", "لمين هذا", "A1", AC,
   [W("whose", "لمين", "هوز"), W("mine", "مالي / تاعي", "ماين"), W("yours", "مالك / تاعك", "يورز"),
    E("Whose asks who owns it; mine means it is mine.", "هوز تسال لمين المالك؛ وماين يعني تاعي."),
    S("Whose pen is this?", "لمين هذا القلم؟", "هوز بن از ذس"),
    S("It is mine.", "تاعي.", "ات از ماين")],
   [CHO("Whose pen? - It is ___.", "لمين القلم؟ - ___.", "هوز بن؟ - ___",
        [ok("mine"), no("my"), no("I")], "Mine means it belongs to me.", "ماين يعني تاعي."),
    ORD(["Whose", "pen", "is", "this"], "Build: Whose pen is this?", "بلد ات: هوز بن از ذس",
        "Whose + noun + is this.", "هوز بعدين الاسم بعدين از ذس.", "لمين هذا القلم"),
    TR("Whose pen is this?", "لمين هذا القلم", ["هوز بن از ذس", "لمين هذا القلم"])],
   prereqs=["a1pos-my-your"], minutes=7, skills=["grammar", "speaking"]),
 L("a1pos-family", "Talking about family", "نتكلم عن العائلة", "A1", AC,
   [W("father", "ابوي", "فاذر"), W("mother", "امي", "ماذر"), W("brother", "اخ", "براذر"), W("sister", "اخت", "سيستر"),
    S("My father is a teacher.", "ابوي معلم.", "ماي فاذر از ا تيتشر"),
    S("Her brother is young.", "اخوها صغير.", "هر براذر از يونق")],
   [CHO("___ father is a teacher.", "___ ابوي معلم.", "___ فاذر از ا تيتشر",
        [ok("My"), no("Mine"), no("Me")], "My shows it is mine.", "ماي تبين انه تاعي."),
    ORD(["My", "father", "is", "a", "teacher"], "Build: My father is a teacher.", "بلد ات: ماي فاذر از ا تيتشر",
        "My + noun + is + job.", "ماي بعدين الاسم بعدين از بعدين الوظيفة.", "ابوي معلم"),
    TR("Her brother is young.", "اخوها صغير", ["هر براذر از يونق", "اخوها صغير"])],
   prereqs=["a1pos-my-your"], minutes=7, skills=["speaking"]),
 L("a1pos-have-to", "Have to (must)", "لازم / مضطر", "A1", AC,
   [W("have to", "لازم / مضطر", "هاف تو"), W("has to", "لازم عليه", "هز تو"),
    E("Have to means you must do something.", "هاف تو معناها لازم تسوي الشيء."),
    S("I have to go now.", "لازم اروح الحين.", "اي هاف تو قو ناو"),
    S("She has to study.", "لازم عليها تذاكر.", "شي هز تو ستادي")],
   [CHO("She ___ study.", "لازم ___ تذاكر.", "شي ___ ستادي",
        [ok("has to"), no("have to"), no("is")], "She takes has to.", "شي تستخدم هز تو."),
    ORD(["I", "have", "to", "go"], "Build: I have to go.", "بلد ات: اي هاف تو قو",
        "I have to + verb.", "اي هاف تو بعدين الفعل.", "لازم اروح"),
    TR("I have to go now.", "لازم اروح الحين", ["اي هاف تو قو ناو", "لازم اروح الحين"])],
   prereqs=["a1pos-have-has"], minutes=7, skills=["grammar", "speaking"]),
]

# ===== A2 PAST SIMPLE (3 -> 8) =====
AC = "a2-past-simple"
LESSONS += [
 L("a2past-was-were", "Was and Were", "كان وكانوا", "A2", AC,
   [W("was", "كان", "واز"), W("were", "كانوا", "وير"),
    E("I/he/she/it use was; you/we/they use were.", "اي وهي شي ات تستخدم واز؛ ويو وي ذي تستخدم وير."),
    S("I was at home.", "كنت في البيت.", "اي واز ات هوم"),
    S("They were happy.", "كانوا فرحانين.", "ذاي وير هابي")],
   [CHO("They ___ happy.", "كانوا ___ فرحانين.", "ذاي ___ هابي",
        [ok("were"), no("was"), no("is")], "They takes were.", "ذي تستخدم وير."),
    ORD(["I", "was", "at", "home"], "Build: I was at home.", "بلد ات: اي واز ات هوم",
        "Subject + was + place.", "الفاعل بعدين واز بعدين المكان.", "كنت في البيت"),
    TR("They were happy.", "كانوا فرحانين", ["ذاي وير هابي", "كانوا فرحانين"])],
   minutes=8, skills=["grammar", "speaking"]),
 L("a2past-regular", "Regular Past Verbs", "الافعال المنتظمة", "A2", AC,
   [W("played", "لعب", "بلييد"), W("worked", "اشتغل", "ويركد"), W("watched", "شاف", "واتشدم"),
    E("Add ed for regular past verbs.", "ضف ايد للفعل الماضي المنتظم."),
    S("I played football.", "لعبت كرة.", "اي بلييد فوت بول"),
    S("She worked yesterday.", "اشتغلت امبارح.", "شي ويركد ييستردي")],
   [CHO("Yesterday I ___ football.", "امبارح ___ كرة.", "ييستردي اي ___ فوت بول",
        [ok("played"), no("play"), no("plays")], "Past of play is played.", "ماضي بلاي هو بلييد."),
    ORD(["She", "worked", "yesterday"], "Build: She worked yesterday.", "بلد ات: شي ويركد ييستردي",
        "Subject + past verb + object.", "الفاعل بعدين الفعل الماضي بعدين المفعول.", "اشتغلت امبارح"),
    TR("I played football.", "لعبت كرة", ["اي بلييد فوت بول", "لعبت كرة"])],
   prereqs=["a2past-was-were"], minutes=8, skills=["grammar", "speaking"]),
 L("a2past-irregular", "Irregular Past Verbs", "الافعال الشاذة", "A2", AC,
   [W("went", "راح", "وينت"), W("had", "كان عنده", "هاد"), W("ate", "اكل", "ايت"), W("saw", "شاف", "سو"),
    E("Irregular verbs change completely in the past.", "الافعال الشاذة تتغير تماما في الماضي."),
    S("I went to Mecca.", "رحت مكة.", "اي وينت تو مكة"),
    S("She ate dinner.", "اكلت عشاء.", "شي ايت دينر")],
   [CHO("I ___ to Mecca.", "___ مكة.", "اي ___ تو مكة",
        [ok("went"), no("go"), no("goed")], "Past of go is went.", "ماضي قو هو وينت."),
    ORD(["I", "went", "to", "Mecca"], "Build: I went to Mecca.", "بلد ات: اي وينت تو مكة",
        "Subject + went + to + place.", "الفاعل بعدين وينت بعدين تو بعدين المكان.", "رحت مكة"),
    TR("She ate dinner.", "اكلت عشاء", ["شي ايت دينر", "اكلت عشاء"])],
   prereqs=["a2past-regular"], minutes=8, skills=["grammar", "speaking"]),
 L("a2past-questions", "Past Questions (Did)", "اسئلة الماضي", "A2", AC,
   [W("did", "هل (للسؤال)", "ديد"),
    E("Use did + base verb for past questions.", "استخدم ديد بعدين الفعل الاصلي للسؤال الماضي."),
    S("Did you go?", "هل رحت؟", "ديد يو قو"),
    S("Where did you go?", "وين رحت؟", "وير ديد يو قو")],
   [CHO("Did you ___?", "هل ___؟", "ديد يو ___",
        [ok("go"), no("went"), no("going")], "Use did + base verb.", "استخدم ديد بعدين الفعل الاصلي."),
    ORD(["Did", "you", "go"], "Build: Did you go?", "بلد ات: ديد يو قو",
        "Did + subject + base verb.", "ديد بعدين الفاعل بعدين الفعل الاصلي.", "هل رحت"),
    TR("Where did you go?", "وين رحت", ["وير ديد يو قو", "وين رحت"])],
   prereqs=["a2past-regular"], minutes=8, skills=["grammar", "speaking"]),
 L("a2past-negatives", "Past Negatives", "نفي الماضي", "A2", AC,
   [W("did not", "ما (نفي)", "ديد نوت"), W("didn't", "ما", "ديدنت"),
    E("Use did not + base verb to negate the past.", "استخدم ديد نوت بعدين الفعل الاصلي لنفي الماضي."),
    S("I did not go.", "ما رحت.", "اي ديد نوت قو"),
    S("She didn't call.", "ما اتصلت.", "شي ديدنت كول")],
   [CHO("She didn't ___.", "ما ___ شي.", "شي ديدنت ___",
        [ok("call"), no("called"), no("calls")], "Didn't + base verb.", "ديدنت بعدين الفعل الاصلي."),
    ORD(["I", "didn't", "go"], "Build: I didn't go.", "بلد ات: اي ديدنت قو",
        "Subject + didn't + base verb.", "الفاعل بعدين ديدنت بعدين الفعل الاصلي.", "ما رحت"),
    TR("She didn't call.", "ما اتصلت", ["شي ديدنت كول", "ما اتصلت"])],
   prereqs=["a2past-regular"], minutes=8, skills=["grammar", "speaking"]),
]

# ===== A2 FUTURE PLANS (2 -> 8) =====
AC = "a2-future-plans"
LESSONS += [
 L("a2fut-going-to", "Going to (plans)", "نويته / رايح", "A2", AC,
   [W("going to", "رايح / ناوي", "قوينق تو"),
    E("Use be + going to + verb for plans.", "استخدم بي بعدين قوينق تو بعدين الفعل للنوايا."),
    S("I am going to study.", "ناوي اذاكر.", "اي ام قوينق تو ستادي"),
    S("She is going to travel.", "رايحة تسافر.", "شي از قوينق تو ترافيل")],
   [CHO("She ___ going to travel.", "___ رايحة تسافر.", "شي ___ قوينق تو ترافيل",
        [ok("is"), no("are"), no("am")], "She takes is going to.", "شي تستخدم از قوينق تو."),
    ORD(["I", "am", "going", "to", "study"], "Build: I am going to study.", "بلد ات: اي ام قوينق تو ستادي",
        "I am going to + verb.", "اي ام قوينق تو بعدين الفعل.", "ناوي اذاكر"),
    TR("I am going to study.", "ناوي اذاكر", ["اي ام قوينق تو ستادي", "ناوي اذاكر"])],
   minutes=8, skills=["grammar", "speaking"]),
 L("a2fut-will", "Will (decisions)", "سوف / راح", "A2", AC,
   [W("will", "راح / سوف", "ويل"),
    E("Use will + verb for quick decisions or promises.", "استخدم ويل بعدين الفعل للقرارات السريعة او الوعود."),
    S("I will help you.", "راح اساعدك.", "اي ويل هلب يو"),
    S("She will come.", "رايحة تجي.", "شي ويل كم")],
   [CHO("I ___ help you.", "___ اساعدك.", "اي ___ هلب يو",
        [ok("will"), no("wills"), no("went")], "Will + base verb.", "ويل بعدين الفعل الاصلي."),
    ORD(["I", "will", "help", "you"], "Build: I will help you.", "بلد ات: اي ويل هلب يو",
        "Subject + will + base verb.", "الفاعل بعدين ويل بعدين الفعل الاصلي.", "راح اساعدك"),
    TR("I will help you.", "راح اساعدك", ["اي ويل هلب يو", "راح اساعدك"])],
   prereqs=["a2fut-going-to"], minutes=8, skills=["grammar", "speaking"]),
 L("a2fut-will-vs-going", "Will vs Going to", "ويل مقابل رايح", "A2", AC,
   [E("Will for instant choices, going to for plans.", "ويل للقرارات اللحظية، وقوينق تو للخطط."),
    S("I think it will rain.", "احس انه راح يمطر.", "اي ثينك ات ويل راين"),
    S("Look! It is going to rain.", "شوف! راح يمطر.", "لوك ات از قوينق تو راين")],
   [CHO("Look! It ___ going to rain.", "شوف! ___ راح يمطر.", "لوك! ___ قوينق تو راين",
        [ok("is"), no("will"), no("was")], "Plan with evidence uses going to.", "الخطة مع دليل تستخدم قوينق تو."),
    ORD(["I", "think", "it", "will", "rain"], "Build: I think it will rain.", "بلد ات: اي ثينك ات ويل راين",
        "I think + will + verb.", "اي ثينك بعدين ويل بعدين الفعل.", "احس انه راح يمطر"),
    TR("I will help you.", "راح اساعدك", ["اي ويل هلب يو", "راح اساعدك"])],
   prereqs=["a2fut-will"], minutes=8, skills=["grammar", "speaking"]),
 L("a2fut-tomorrow", "Tomorrow and Next week", "بكرة واسبوع الجاي", "A2", AC,
   [W("tomorrow", "بكرة", "تومورو"), W("next week", "اسبوع الجاي", "نكست وييك"), W("tonight", "الليلة", "تونايت"),
    S("I will travel tomorrow.", "راح اسافر بكرة.", "اي ويل ترافيل تومورو"),
    S("Next week is busy.", "اسبوع الجاي مليان.", "نكست وييك از بيزي")],
   [CHO("I will travel ___.", "راح اسافر ___.", "اي ويل ترافيل ___",
        [ok("tomorrow"), no("yesterday"), no("last night")], "Tomorrow means the day after today.", "تومورو يعني اليوم الجاي بعد اليوم."),
    ORD(["I", "will", "travel", "tomorrow"], "Build: I will travel tomorrow.", "بلد ات: اي ويل ترافيل تومورو",
        "Subject + will + verb + time.", "الفاعل بعدين ويل بعدين الفعل بعدين الوقت.", "راح اسافر بكرة"),
    TR("Next week is busy.", "اسبوع الجاي مليان", ["نكست وييك از بيزي", "اسبوع الجاي مليان"])],
   prereqs=["a2fut-going-to"], minutes=8, skills=["speaking"]),
 L("a2fut-plans-life", "My future plans", "خططي المستقبلية", "A2", AC,
   [W("study", "ذاكر / ادرس", "ستادي"), W("work", "اشتغل", "ويرك"), W("marry", "اتزوج", "ماري"),
    S("I am going to study medicine.", "ناوي ادرس طب.", "اي ام قوينق تو ستادي مديسين"),
    S("She will work in Jeddah.", "راح تشغل في جدة.", "شي ويل ويرك ان جدة")],
   [CHO("I ___ going to study.", "___ ناوي اذاكر.", "اي ___ قوينق تو ستادي",
        [ok("am"), no("is"), no("are")], "Going to for plans.", "قوينق تو للخطط."),
    ORD(["I", "am", "going", "to", "study", "medicine"], "Build: I am going to study medicine.", "بلد ات: اي ام قوينق تو ستادي مديسين",
        "Subject + going to + verb + object.", "الفاعل بعدين قوينق تو بعدين الفعل بعدين المفعول.", "ناوي ادرس طب"),
    TR("She will work in Jeddah.", "راح تشغل في جدة", ["شي ويل ويرك ان جدة", "راح تشغل في جدة"])],
   prereqs=["a2fut-going-to"], minutes=8, skills=["speaking"]),
 L("a2fut-promises", "Promises and Offers", "وعود وعروض", "A2", AC,
   [W("promise", "اوعد", "بروميس"), W("offer", "عرض", "اوفير"),
    S("I will call you.", "راح اتصل فيك.", "اي ويل كول يو"),
    S("Will you help me?", "تساعدني؟", "ويل يو هلب مي")],
   [CHO("___ you help me?", "___ تساعدني؟", "___ يو هلب مي",
        [ok("Will"), no("Did"), no("Was")], "Will for offers.", "ويل للعروض."),
    ORD(["Will", "you", "help", "me"], "Build: Will you help me?", "بلد ات: ويل يو هلب مي",
        "Will + subject + base verb.", "ويل بعدين الفاعل بعدين الفعل الاصلي.", "تساعدني"),
    TR("I will be there.", "راح اكون موجود", ["اي ويل بي ثير", "راح اكون موجود"])],
   prereqs=["a2fut-will"], minutes=8, skills=["speaking"]),
]

# ===== B2 PROFESSIONAL COMM (2 -> 8) =====
AC = "b2-professional-comm"
LESSONS += [
 L("b2pro-email-tone", "Professional Email Tone", "نبرة الايميل المهني", "B2", AC,
   [W("regards", "مع خالص التحية", "ريقاردز"), W("attached", "مرفق", "اتا تشد"),
    E("Keep emails short, polite, and clear.", "خلي الايميلات قصيرة ومهذبة وواضحة."),
    S("Please find the report attached.", "تجد التقرير مرفق.", "بليز فايند ذا ريبورت اتا تشد"),
    S("I look forward to your reply.", "بانتظار ردك.", "اي لوك فوروورد تو يور ريبلاي")],
   [CHO("Please find the report ___.", "تجد التقرير ___.", "بليز فايند ذا ريبورت ___",
        [ok("attached"), no("detached"), no("deleted")], "Attached means included with the email.", "اتا تشد يعني مرفق مع الايميل."),
    ORD(["Please", "find", "the", "report", "attached"], "Build: Please find the report attached.", "بلد ات: بليز فايند ذا ريبورت اتا تشد",
        "Please find + object + attached.", "بليز فايند بعدين المفعول بعدين اتا تشد.", "تجد التقرير مرفق"),
    TR("I look forward to your reply.", "بانتظار ردك", ["اي لوك فوروورد تو يور ريبلاي", "بانتظار ردك"])],
   minutes=9, skills=["writing"]),
 L("b2pro-meetings", "Leading a Meeting", "قيادة اجتماع", "B2", AC,
   [W("agenda", "جدول الاعمال", "اجندا"), W("minutes", "محضر الاجتماع", "مينيتس"),
    E("State the goal, then the agenda items.", "اذكر الهدف بعدين بنود جدول الاعمال."),
    S("Let us start with the agenda.", "نبدا بجدول الاعمال.", "لت اس ستارت ويذ ذا اجندا"),
    S("Could you summarize that?", "تقدر تلخصها؟", "كود يو سمرايز ذات")],
   [CHO("Let us start with the ___.", "نبدا بـ ___.", "لت اس ستارت ويذ ذا ___",
        [ok("agenda"), no("absence"), no("accident")], "Agenda is the list of topics.", "اجندا هي قائمة المواضيع."),
    ORD(["Could", "you", "summarize", "that"], "Build: Could you summarize that?", "بلد ات: كود يو سمرايز ذات",
        "Could you + verb + that.", "كود يو بعدين الفعل بعدين ذات.", "تقدر تلخصها"),
    TR("Could you summarize that?", "تقدر تلخصها", ["كود يو سمرايز ذات", "تقدر تلخصها"])],
   minutes=9, skills=["speaking"]),
 L("b2pro-feedback", "Constructive Feedback", "ملاحظات بناءة", "B2", AC,
   [W("improve", "حسّن", "ام بروف"), W("suggest", "اقترح", "سوجست"),
    E("Praise first, then suggest improvements.", "امدح اول شي بعدين اقترح التحسينات."),
    S("I suggest we improve the process.", "اقترح نحسن العملية.", "اي سوجست وي ام بروف ذا بروسيس"),
    S("This is good, but we can improve it.", "هذا زين، بس نقدر نحسنه.", "ذس از قود بت وي كان ام بروف ات")],
   [CHO("I ___ we improve it.", "___ نحسنه.", "اي ___ وي ام بروف ات",
        [ok("suggest"), no("refuse"), no("cancel")], "Suggest means to propose.", "سوجست يعني يقترح."),
    ORD(["I", "suggest", "we", "improve", "the", "process"], "Build: I suggest we improve the process.", "بلد ات: اي سوجست وي ام بروف ذا بروسيس",
        "I suggest + we + verb + object.", "اي سوجست بعدين وي بعدين الفعل بعدين المفعول.", "اقترح نحسن العملية"),
    TR("I suggest we improve the process.", "اقترح نحسن العملية", ["اي سوجست وي ام بروف ذا بروسيس", "اقترح نحسن العملية"])],
   prereqs=["b2pro-meetings"], minutes=9, skills=["speaking"]),
 L("b2pro-negotiation", "Negotiating Terms", "التفاوض على الشروط", "B2", AC,
   [W("negotiate", "تفاوض", "نيقوشييت"), W("deadline", "الموعد النهائي", "ديد لاين"), W("compromise", "حل وسط", "كوم برومايز"),
    S("We can negotiate the deadline.", "نقدر نتفاوض على الموعد.", "وي كان نيقوشييت ذا ديد لاين"),
    S("Let us find a compromise.", "نلقى حل وسط.", "لت اس فايند ا كوم برومايز")],
   [CHO("Let us find a ___.", "نلقى ___.", "لت اس فايند ا ___",
        [ok("compromise"), no("conflict"), no("cancel")], "Compromise is a middle solution.", "كوم برومايز حل وسط."),
    ORD(["We", "can", "negotiate", "the", "deadline"], "Build: We can negotiate the deadline.", "بلد ات: وي كان نيقوشييت ذا ديد لاين",
        "We can + verb + the + noun.", "وي كان بعدين الفعل بعدين ذا بعدين الاسم.", "نقدر نتفاوض على الموعد"),
    TR("Let us find a compromise.", "نلقى حل وسط", ["لت اس فايند ا كوم برومايز", "نلقى حل وسط"])],
   prereqs=["b2pro-meetings"], minutes=9, skills=["speaking"]),
 L("b2pro-presentations", "Opening a Presentation", "افتتاح عرض تقديمي", "B2", AC,
   [W("presentation", "عرض تقديمي", "بريزنتيشن"), W("audience", "الجمهور", "اوديانس"),
    E("Greet, state the topic, then the plan.", "سلم، اذكر الموضوع بعدين الخطة."),
    S("Thank you for coming today.", "شكرا على حضوركم اليوم.", "ثانك يو فور كومينق توداي"),
    S("Today I will present our results.", "اليوم راح اعرض نتائجنا.", "توداي اي ويل بريزنت اور ريزلتس")],
   [CHO("Welcome to the ___ today.", "اهلا بـ ___ اليوم.", "ويلكم تو ذا ___ توداي",
        [ok("audience"), no("absence"), no("accident")], "Audience is the people listening.", "اوديانس هم الناس اللي يستمعون."),
    ORD(["Today", "I", "will", "present", "our", "results"], "Build: Today I will present our results.", "بلد ات: توداي اي ويل بريزنت اور ريزلتس",
        "Today + I will + verb + object.", "توداي بعدين اي ويل بعدين الفعل بعدين المفعول.", "اليوم راح اعرض نتائجنا"),
    TR("Thank you for coming today.", "شكرا على حضوركم اليوم", ["ثانك يو فور كومينق توداي", "شكرا على حضوركم اليوم"])],
   prereqs=["b2pro-meetings"], minutes=9, skills=["speaking"]),
 L("b2pro-clarifying", "Clarifying and Confirming", "توضيح وتاكيد", "B2", AC,
   [W("clarify", "وضح", "كلاريفاي"), W("confirm", "اكد", "كون فورم"),
    E("Repeat back to confirm understanding.", "اعد عشان تاكد الفهم."),
    S("Let me clarify the point.", "خلني اوضح النقطة.", "لت مي كلاريفاي ذا بوينت"),
    S("Just to confirm, you mean Monday?", "عشان تاكد، قصدك الاثنين؟", "جاست تو كون فورم يو مين ماندي")],
   [CHO("Let me ___ the point.", "خلني ___ النقطة.", "لت مي ___ ذا بوينت",
        [ok("clarify"), no("confuse"), no("cancel")], "Clarify means to make clear.", "كلاريفاي يعني يوضح."),
    ORD(["Let", "me", "clarify", "the", "point"], "Build: Let me clarify the point.", "بلد ات: لت مي كلاريفاي ذا بوينت",
        "Let me + verb + the + noun.", "لت مي بعدين الفعل بعدين ذا بعدين الاسم.", "خلني اوضح النقطة"),
    TR("Let me clarify the point.", "خلني اوضح النقطة", ["لت مي كلاريفاي ذا بوينت", "خلني اوضح النقطة"])],
   prereqs=["b2pro-feedback"], minutes=9, skills=["speaking"]),
]

# ===== A0 QUESTION WORDS (4 -> 8) =====
AC = "a0-question-words"
LESSONS += [
 L("a0qw-where", "Where", "وين", "A0", AC,
   [W("where", "وين", "وير"),
    E("Where asks about a place.", "وير تسال عن مكان."),
    S("Where is the bank?", "وين البنك؟", "وير از ذا بانك"),
    S("Where do you live?", "وين ساكن؟", "وير دو يو ليف")],
   [CHO("___ is the bank?", "___ البنك؟", "___ از ذا بانك",
        [ok("Where"), no("What"), no("When")], "Where asks about place.", "وير تسال عن المكان."),
    ORD(["Where", "is", "the", "bank"], "Build: Where is the bank?", "بلد ات: وير از ذا بانك",
        "Where + is + the + noun.", "وير بعدين از بعدين ذا بعدين الاسم.", "وين البنك"),
    TR("Where do you live?", "وين ساكن", ["وير دو يو ليف", "وين ساكن"])],
   prereqs=["a0qw-what"], minutes=5, skills=["speaking"]),
 L("a0qw-when", "When", "متى", "A0", AC,
   [W("when", "متى", "وين"),
    E("When asks about time.", "وين تسال عن وقت."),
    S("When is the meeting?", "متى الاجتماع؟", "وين از ذا ميتينق"),
    S("When do you work?", "متى تشتغل؟", "وين دو يو ويرك")],
   [CHO("___ is the meeting?", "___ الاجتماع؟", "___ از ذا ميتينق",
        [ok("When"), no("Where"), no("What")], "When asks about time.", "وين تسال عن الوقت."),
    ORD(["When", "is", "the", "meeting"], "Build: When is the meeting?", "بلد ات: وين از ذا ميتينق",
        "When + is + the + noun.", "وين بعدين از بعدين ذا بعدين الاسم.", "متى الاجتماع"),
    TR("When is the meeting?", "متى الاجتماع", ["وين از ذا ميتينق", "متى الاجتماع"])],
   prereqs=["a0qw-what"], minutes=5, skills=["speaking"]),
 L("a0qw-who-how", "Who and How", "مين وكيف", "A0", AC,
   [W("who", "مين", "هو"), W("how", "كيف", "هاو"),
    E("Who asks about a person, how asks about manner.", "هو تسال عن شخص، وهاو تسال عن الطريقة."),
    S("Who is he?", "مين هذا؟", "هو از هي"),
    S("How are you?", "كيف حالك؟", "هاو ار يو")],
   [CHO("___ is he?", "___ هذا؟", "___ از هي",
        [ok("Who"), no("Where"), no("When")], "Who asks about a person.", "هو تسال عن شخص."),
    ORD(["How", "are", "you"], "Build: How are you?", "بلد ات: هاو ار يو",
        "How + are + you.", "هاو بعدين ار بعدين يو.", "كيف حالك"),
    TR("How are you?", "كيف حالك", ["هاو ار يو", "كيف حالك"])],
   prereqs=["a0qw-what"], minutes=5, skills=["speaking"]),
 L("a0qw-why", "Why", "ليش", "A0", AC,
   [W("why", "ليش", "واي"),
    E("Why asks for a reason.", "واي تسال عن السبب."),
    S("Why are you late?", "ليش تأخرت؟", "واي ار يو ليت"),
    S("Why did you go?", "ليش رحت؟", "واي ديد يو قو")],
   [CHO("___ are you late?", "___ تأخرت؟", "___ ار يو ليت",
        [ok("Why"), no("Where"), no("When")], "Why asks for a reason.", "واي تسال عن السبب."),
    ORD(["Why", "are", "you", "late"], "Build: Why are you late?", "بلد ات: واي ار يو ليت",
        "Why + are + you + adjective.", "واي بعدين ار بعدين يو بعدين الصفة.", "ليش تأخرت"),
    TR("Why are you late?", "ليش تأخرت", ["واي ار يو ليت", "ليش تأخرت"])],
   prereqs=["a0qw-what"], minutes=5, skills=["speaking"]),
]

# ===== A1 TIME NUMBERS (3 -> 8) =====
AC = "a1-time-numbers"
LESSONS += [
 L("a1tn-numbers-1-10", "Numbers 1 to 10", "الارقام 1 الى 10", "A1", AC,
   [W("one", "واحد", "ون"), W("two", "اثنين", "تو"), W("three", "ثلاثة", "ثري"),
    W("ten", "عشرة", "تن"),
    S("I have two brothers.", "عندي اخوين.", "اي هاف تو براذرز"),
    S("Three books.", "ثلاثة كتب.", "ثري بوكس")],
   [CHO("I have ___ brothers.", "عندي ___ اخوين.", "اي هاف ___ براذرز",
        [ok("two"), no("too"), no("to")], "Two is the number.", "تو هو الرقم."),
    ORD(["Three", "books"], "Build: Three books.", "بلد ات: ثري بوكس",
        "Number + noun.", "الرقم بعدين الاسم.", "ثلاثة كتب"),
    TR("I have two brothers.", "عندي اخوين", ["اي هاف تو براذرز", "عندي اخوين"])],
   minutes=6, skills=["speaking"]),
 L("a1tn-telling-time", "Telling the Time", "قراءة الساعة", "A1", AC,
   [W("o'clock", "تماما الساعة", "ا كلوك"), W("half past", "والنصف", "هاف باست"),
    E("Use o'clock for exact hours, half past for 30.", "استخدم ا كلوك للساعات المضبوطة، وهاف باست لـ30."),
    S("It is three o'clock.", "الساعة ثلاثة.", "ات از ثري ا كلوك"),
    S("It is half past six.", "الساعة ستة ونص.", "ات از هاف باست سكس")],
   [CHO("It is three ___.", "الساعة ثلاثة ___.", "ات از ثري ___",
        [ok("o'clock"), no("half past"), no("past")], "o'clock for exact hours.", "ا كلوك للساعات المضبوطة."),
    ORD(["It", "is", "three", "o'clock"], "Build: It is three o'clock.", "بلد ات: ات از ثري ا كلوك",
        "It is + number + o'clock.", "ات از بعدين الرقم بعدين ا كلوك.", "الساعة ثلاثة"),
    TR("It is half past six.", "الساعة ستة ونص", ["ات از هاف باست سكس", "الساعة ستة ونص"])],
   prereqs=["a1tn-numbers-1-10"], minutes=6, skills=["speaking"]),
 L("a1tn-days", "Days of the Week", "ايام الاسبوع", "A1", AC,
   [W("Sunday", "الاحد", "صنداي"), W("Monday", "الاثنين", "ماندي"), W("Friday", "الجمعة", "فرايدي"),
    S("Today is Monday.", "اليوم الاثنين.", "توداي از ماندي"),
    S("We rest on Friday.", "نرتاح يوم الجمعة.", "وي ريست اون فرايدي")],
   [CHO("We rest on ___.", "نرتاح يوم ___.", "وي ريست اون ___",
        [ok("Friday"), no("Yesterday"), no("Tomorrow")], "Friday is the rest day.", "الجمعة يوم الراحة."),
    ORD(["Today", "is", "Monday"], "Build: Today is Monday.", "بلد ات: توداي از ماندي",
        "Today is + day.", "توداي از بعدين اليوم.", "اليوم الاثنين"),
    TR("We rest on Friday.", "نرتاح يوم الجمعة", ["وي ريست اون فرايدي", "نرتاح يوم الجمعة"])],
   minutes=6, skills=["speaking"]),
 L("a1tn-months", "Months of the Year", "شهور السنة", "A1", AC,
   [W("January", "يناير", "جانواري"), W("June", "يونيو", "جون"), W("December", "ديسمبر", "ديسمبر"),
    S("School starts in September.", "المدرسة تبدا في سبتمبر.", "سكول ستارتس ان سبتمبر"),
    S("My birthday is in June.", "عيد ميلادي في يونيو.", "ماي بيرثدي از ان جون")],
   [CHO("My birthday is in ___.", "عيد ميلادي في ___.", "ماي بيرثدي از ان ___",
        [ok("June"), no("Friday"), no("Today")], "June is a month.", "جون شهر."),
    ORD(["School", "starts", "in", "September"], "Build: School starts in September.", "بلد ات: سكول ستارتس ان سبتمبر",
        "Subject + verb + in + month.", "الفاعل بعدين الفعل بعدين ان بعدين الشهر.", "المدرسة تبدا في سبتمبر"),
    TR("My birthday is in June.", "عيد ميلادي في يونيو", ["ماي بيرثدي از ان جون", "عيد ميلادي في يونيو"])],
   prereqs=["a1tn-days"], minutes=6, skills=["speaking"]),
 L("a1tn-money", "Money and Prices", "النقود والاسعار", "A1", AC,
   [W("how much", "بكذا", "هاو متش"), W("price", "السعر", "برايس"), W("riyal", "ريال", "ريال"),
    S("How much is it?", "بكذا هذا؟", "هاو متش از ات"),
    S("The price is ten riyals.", "السعر عشرة ريالات.", "ذا برايس از تن ريالز")],
   [CHO("___ is it?", "___ هذا؟", "___ از ات",
        [ok("How much"), no("Where"), no("Who")], "How much asks the price.", "هاو متش تسال عن السعر."),
    ORD(["How", "much", "is", "it"], "Build: How much is it?", "بلد ات: هاو متش از ات",
        "How much + is + it.", "هاو متش بعدين از بعدين ات.", "بكذا هذا"),
    TR("The price is ten riyals.", "السعر عشرة ريالات", ["ذا برايس از تن ريالز", "السعر عشرة ريالات"])],
   minutes=6, skills=["speaking"]),
]

# ===== A1 CAN REQUESTS (4 -> 8) =====
AC = "a1-can-requests"
LESSONS += [
 L("a1can-ability", "Can for Ability", "كان للقدرة", "A1", AC,
   [W("can", "اقدر / اقدر", "كان"), W("cannot", "ما اقدر", "كان نوت"),
    E("Can shows ability; cannot shows no ability.", "كان تبين القدرة؛ وكان نوت تبين عدم القدرة."),
    S("I can swim.", "اقدر اسبح.", "اي كان سويم"),
    S("She cannot drive.", "ما تقدر تسوق.", "شي كان نوت درايف")],
   [CHO("I ___ swim.", "___ اسبح.", "اي ___ سويم",
        [ok("can"), no("is"), no("was")], "Can shows ability.", "كان تبين القدرة."),
    ORD(["I", "can", "swim"], "Build: I can swim.", "بلد ات: اي كان سويم",
        "Subject + can + verb.", "الفاعل بعدين كان بعدين الفعل.", "اقدر اسبح"),
    TR("She cannot drive.", "ما تقدر تسوق", ["شي كان نوت درايف", "ما تقدر تسوق"])],
   minutes=6, skills=["grammar", "speaking"]),
 L("a1can-requests", "Polite Requests", "طلبات مهذبة", "A1", AC,
   [W("could", "تقدر (مهذب)", "كود"), W("would", "تقدر / تحب", "وود"),
    E("Could and would are more polite than can.", "كود ووود اكثر مهذبة من كان."),
    S("Could you help me?", "تقدر تساعدني؟", "كود يو هلب مي"),
    S("Would you like tea?", "تحب شاي؟", "وود يو لايك تاي")],
   [CHO("___ you help me?", "___ تساعدني؟", "___ يو هلب مي",
        [ok("Could"), no("Did"), no("Was")], "Could is polite.", "كود مهذب."),
    ORD(["Could", "you", "help", "me"], "Build: Could you help me?", "بلد ات: كود يو هلب مي",
        "Could + subject + base verb.", "كود بعدين الفاعل بعدين الفعل الاصلي.", "تقدر تساعدني"),
    TR("Would you like tea?", "تحب شاي", ["وود يو لايك تاي", "تحب شاي"])],
   prereqs=["a1can-ability"], minutes=6, skills=["speaking"]),
 L("a1can-permission", "Asking Permission", "طلب الاذن", "A1", AC,
   [W("may", "تقدر ( رسمي )", "ماي"),
    E("May is the most polite way to ask permission.", "ماي اكثر طريقة مهذبة لطلب الاذن."),
    S("May I come in?", "اقدر ادخل؟", "ماي اي كم ان"),
    S("May I sit here?", "اقدر اجلس هنا؟", "ماي اي سيت هير")],
   [CHO("___ I come in?", "___ ادخل؟", "___ اي كم ان",
        [ok("May"), no("Did"), no("Was")], "May asks permission.", "ماي تطلب الاذن."),
    ORD(["May", "I", "come", "in"], "Build: May I come in?", "بلد ات: ماي اي كم ان",
        "May + subject + base verb.", "ماي بعدين الفاعل بعدين الفعل الاصلي.", "اقدر ادخل"),
    TR("May I sit here?", "اقدر اجلس هنا", ["ماي اي سيت هير", "اقدر اجلس هنا"])],
   prereqs=["a1can-requests"], minutes=6, skills=["speaking"]),
 L("a1can-offers", "Making Offers", "تقديم عروض", "A1", AC,
   [W("would you like", "تحب", "وود يو لايك"), W("here you are", "تفضل", "هير يو ار"),
    E("Offer with would you like, hand over with here you are.", "اعرض بـوود يو لايك، وسلم بـهير يو ار."),
    S("Would you like water?", "تحب ماء؟", "وود يو لايك واتر"),
    S("Here you are.", "تفضل.", "هير يو ار")],
   [CHO("___ you like water?", "___ ماء؟", "___ يو لايك واتر",
        [ok("Would"), no("Did"), no("Was")], "Would you like for offers.", "وود يو لايك للعروض."),
    ORD(["Here", "you", "are"], "Build: Here you are.", "بلد ات: هير يو ار",
        "Here + you + are.", "هير بعدين يو بعدين ار.", "تفضل"),
    TR("Would you like water?", "تحب ماء", ["وود يو لايك واتر", "تحب ماء"])],
   prereqs=["a1can-requests"], minutes=6, skills=["speaking"]),
]

# ===== A1 PLACE TIME (4 -> 8) =====
AC = "a1-place-time"
LESSONS += [
 L("a1pt-in-on-at", "In, On, At (place)", "في / على / عند", "A1", AC,
   [W("in", "في", "ان"), W("on", "على", "اون"), W("at", "عند", "ات"),
    E("In for cities/countries, on for streets, at for points.", "ان للمدن والدول، اون للشوارع، ات للنقاط."),
    S("I live in Jeddah.", "اسكن في جدة.", "اي ليف ان جدة"),
    S("The shop is on King Street.", "المحل في شارع الملك.", "ذا شوب از اون كينق ستريت")],
   [CHO("I live ___ Jeddah.", "اسكن ___ جدة.", "اي ليف ___ جدة",
        [ok("in"), no("on"), no("at")], "In for cities.", "ان للمدن."),
    ORD(["I", "live", "in", "Jeddah"], "Build: I live in Jeddah.", "بلد ات: اي ليف ان جدة",
        "Subject + live + in + city.", "الفاعل بعدين ليف بعدين ان بعدين المدينة.", "اسكن في جدة"),
    TR("I live in Jeddah.", "اسكن في جدة", ["اي ليف ان جدة", "اسكن في جدة"])],
   minutes=6, skills=["grammar", "speaking"]),
 L("a1pt-in-on-at-time", "In, On, At (time)", "في / على / عند (الوقت)", "A1", AC,
   [W("in the morning", "في الصباح", "ان ذا مورنينق"), W("on Monday", "يوم الاثنين", "اون ماندي"), W("at 7", "الساعة 7", "ات سيون"),
    E("In for parts of day, on for days, at for clock times.", "ان لاجزاء اليوم، اون للايام، ات للساعات."),
    S("I work in the morning.", "اشتغل في الصباح.", "اي ويرك ان ذا مورنينق"),
    S("The meeting is at 7.", "الاجتماع الساعة 7.", "ذا ميتينق از ات سيون")],
   [CHO("I work ___ the morning.", "اشتغل ___ الصباح.", "اي ويرك ___ ذا مورنينق",
        [ok("in"), no("on"), no("at")], "In for parts of day.", "ان لاجزاء اليوم."),
    ORD(["I", "work", "in", "the", "morning"], "Build: I work in the morning.", "بلد ات: اي ويرك ان ذا مورنينق",
        "Subject + verb + in + the morning.", "الفاعل بعدين الفعل بعدين ان بعدين ذا مورنينق.", "اشتغل في الصباح"),
    TR("The meeting is at 7.", "الاجتماع الساعة 7", ["ذا ميتينق از ات سيون", "الاجتماع الساعة 7"])],
   prereqs=["a1pt-in-on-at"], minutes=6, skills=["grammar", "speaking"]),
 L("a1pt-directions", "Asking Directions", "السؤال عن الاتجاهات", "A1", AC,
   [W("left", "يسار", "ليفت"), W("right", "يمين", "رايت"), W("straight", "دق", "ستريت"),
    E("Left, right, straight for directions.", "ليفت، رايت، ستريت للاتجاهات."),
    S("Turn left.", "لِف يسار.", "ترن ليفت"),
    S("Go straight.", "روح دق.", "قو ستريت")],
   [CHO("Turn ___.", "لِف ___.", "ترن ___",
        [ok("left"), no("straight"), no("come")], "Turn uses left or right.", "ترن يستخدم ليفت او رايت."),
    ORD(["Go", "straight"], "Build: Go straight.", "بلد ات: قو ستريت",
        "Go + direction.", "قو بعدين الاتجاه.", "روح دق"),
    TR("Turn left.", "لِف يسار", ["ترن ليفت", "لف يسار"])],
   minutes=6, skills=["speaking"]),
 L("a1pt-locations", "Common Places", "اماكن مشهورة", "A1", AC,
   [W("hospital", "مستشفى", "هوسبيتل"), W("school", "مدرسة", "سكول"), W("market", "سوق", "ماركت"),
    S("The hospital is near.", "المستشفى قريب.", "ذا هوسبيتل از نير"),
    S("I go to school.", "اروح المدرسة.", "اي قو تو سكول")],
   [CHO("The ___ is near.", "___ قريب.", "ذا ___ از نير",
        [ok("hospital"), no("swim"), no("can")], "Hospital is a place.", "هوسبيتل مكان."),
    ORD(["I", "go", "to", "school"], "Build: I go to school.", "بلد ات: اي قو تو سكول",
        "Subject + go + to + place.", "الفاعل بعدين قو بعدين تو بعدين المكان.", "اروح المدرسة"),
    TR("The hospital is near.", "المستشفى قريب", ["ذا هوسبيتل از نير", "المستشفى قريب"])],
   minutes=6, skills=["speaking"]),
]

# ============= SQL builder =============
def lesson_sql(L):
    out = []
    lid = L["id"]
    out.append(
        "INSERT INTO lessons (id,title_en,title_ar,minutes,level,active,kind,skills,goals,contexts,prereqs,version) VALUES ("
        + sql_val(lid) + "," + sql_val(L["title_en"]) + "," + sql_val(L["title_ar"]) + ","
        + sql_val(L.get("minutes", 8)) + "," + sql_val(L["level"]) + ",true," + sql_val(L.get("kind", "core")) + ","
        + arr_val(L.get("skills", [])) + ",ARRAY[]::text[],ARRAY[]::text[],"
        + arr_val(L.get("prereqs", [])) + ",1) ON CONFLICT (id) DO NOTHING;"
    )
    out.append(
        "INSERT INTO academy_lessons (academy_id,lesson_id,sort_order) VALUES ("
        + sql_val(L["academy"]) + "," + sql_val(lid) + ",0) ON CONFLICT DO NOTHING;"
    )
    for i, it in enumerate(L["items"]):
        out.append(
            "INSERT INTO lesson_items (lesson_id,idx,kind,en,ar_meaning,translit,example_en,example_ar,example_tr,note_en,note_ar) VALUES ("
            + sql_val(lid) + "," + str(i) + "," + sql_val(it["kind"]) + "," + sql_val(it["en"]) + ","
            + sql_val(it["ar"]) + "," + sql_val(it.get("tr", "")) + ","
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
        "Authorization": "Bearer " + PAT, "User-Agent": UA, "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return None, str(e)

if __name__ == "__main__":
    total = len(LESSONS)
    print(f"Total lessons to insert: {total}")
    ok = 0; fail = 0
    for b in range(0, total, 3):
        batch = LESSONS[b:b + 3]
        sql = "\n".join(lesson_sql(L) for L in batch)
        code, resp = run_sql(sql)
        n = len(batch)
        if code == 200:
            ok += n
            print(f"  batch {b//3+1}: OK ({n} lessons)")
        else:
            fail += n
            print(f"  batch {b//3+1}: FAIL code={code}")
            print("  resp:", resp[:800])
    print(f"DONE: {ok} ok, {fail} fail")
