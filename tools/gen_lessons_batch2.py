#!/usr/bin/env python3
# Batch 2: A0 spelling/sounds, A0 error-clinic, A1 daily-verbs, A1 vocab-context.
import json, urllib.request

PAT = "${SUPABASE_PAT}"
PROJ = "lewoochehpiycocvfwtz"
UA = "PelAdminScript/1.0"
URL = f"https://api.supabase.com/v1/projects/{PROJ}/database/query"

def esc(s): return str(s).replace("'", "''")
def sql_val(v):
    if v is None: return "null"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    return "'" + esc(v) + "'"
def arr_val(items): return "ARRAY[" + ",".join(sql_val(i) for i in items) + "]::text[]"

def W(en, ar, tr): return {"kind": "word", "en": en, "ar": ar, "tr": tr}
def E(en, ar): return {"kind": "explain", "en": en, "ar": ar, "tr": ""}
def S(en, ar, tr): return {"kind": "sentence", "en": en, "ar": ar, "tr": tr}
def CHO(q_en, q_ar, q_tr, opts, h_en, h_ar):
    return {"type": "choose", "hint_en": h_en, "hint_ar": h_ar,
            "payload": {"type": "choose", "question": {"en": q_en, "ar": q_ar, "tr": q_tr},
                        "options": opts, "hint": {"en": h_en, "ar": h_ar}}}
def ORD(tokens, pr_en, pr_tr, h_en, h_ar, ar):
    return {"type": "order", "hint_en": h_en, "hint_ar": h_ar,
            "payload": {"type": "order", "tokens": tokens, "answer": tokens,
                        "prompt": {"en": pr_en, "tr": pr_tr},
                        "hint": {"en": h_en, "ar": h_ar}, "ar": ar}}
def TR(src, ans, accepts):
    return {"type": "translate", "hint_en": None, "hint_ar": None,
            "payload": {"type": "translate", "dir": "en-ar", "source": src, "answer": ans, "accept": accepts}}
def ok(t): return {"t": t, "ok": True}
def no(t): return {"t": t, "ok": False}
def L(id, ten, tar, level, academy, items, exs, prereqs=None, minutes=6, skills=None):
    return {"id": id, "title_en": ten, "title_ar": tar, "level": level, "academy": academy,
            "minutes": minutes, "kind": "core", "skills": skills or ["speaking"],
            "prereqs": prereqs or [], "items": items, "exercises": exs}

LESSONS = []

# ===== A0 SPELLING AND SOUNDS (5 -> 10) =====
AC = "a0-spelling-sounds"
LESSONS += [
 L("a0ss-alphabet", "The English Alphabet", "الحروف الانجليزية", "A0", AC,
   [W("A", "اي", "اي"), W("B", "بي", "بي"), W("C", "سي", "سي"),
    E("Learn the letter names first.", "تعلم اسماء الحروف اول شي."),
    S("A is for apple.", "اي لحرف التفاحة.", "اي از فور ابل"),
    S("B is for book.", "بي لحرف الكتاب.", "بي از فور بوك")],
   [CHO("___ is for apple.", "___ لحرف التفاحة.", "___ از فور ابل",
        [ok("A"), no("B"), no("C")], "A starts apple.", "اي يبدا التفاحة."),
    ORD(["A", "is", "for", "apple"], "Build: A is for apple.", "بلد ات: اي از فور ابل",
        "Letter + is for + word.", "الحرف بعدين از فور بعدين الكلمة.", "اي لحرف التفاحة"),
    TR("B is for book.", "بي لحرف الكتاب", ["بي از فور بوك", "بي لحرف الكتاب"])],
   minutes=6, skills=["speaking"]),
 L("a0ss-vowels", "Vowels A E I O U", "حروف العلة", "A0", AC,
   [W("a", "ا", "ا"), W("e", "اي", "اي"), W("i", "اي", "اي"), W("o", "او", "او"), W("u", "يو", "يو"),
    E("Five vowels: a e i o u.", "خمسة حروف علة: اي ا ي او يو."),
    S("A E I O U are vowels.", "اي اي اي او يو حروف علة.", "اي اي اي او يو ار فاولز")],
   [CHO("How many vowels?", "كم حرف علة؟", "هاو ماني فاولز",
        [ok("5"), no("3"), no("6")], "Five vowels.", "خمسة حروف علة."),
    ORD(["A", "E", "I", "O", "U"], "Build: A E I O U.", "بلد ات: اي اي اي او يو",
        "Vowels in order.", "حروف العلة بالترتيب.", "اي اي اي او يو"),
    TR("A E I O U are vowels.", "حروف العلة خمسة", ["اي اي اي او يو ار فاولز", "حروف العلة خمسة"])],
   prereqs=["a0ss-alphabet"], minutes=6, skills=["speaking"]),
 L("a0ss-th-sound", "The TH Sound", "صوت الث", "A0", AC,
   [W("the", "الـ / ذا", "ذا"), W("this", "هذا", "ذس"), W("that", "ذلك", "ذات"),
    E("TH is a soft sound, not t or z.", "ذا صوت لين، مو ت ولا ز."),
    S("This is good.", "هذا زين.", "ذس از قود"),
    S("That is nice.", "ذلك حلو.", "ذات از نايس")],
   [CHO("___ is good.", "___ زين.", "___ از قود",
        [ok("This"), no("Dis"), no("Zis")], "This starts with TH.", "ذس يبدا بـذا."),
    ORD(["This", "is", "good"], "Build: This is good.", "بلد ات: ذس از قود",
        "This + is + adjective.", "ذس بعدين از بعدين الصفة.", "هذا زين"),
    TR("That is nice.", "ذلك حلو", ["ذات از نايس", "ذلك حلو"])],
   prereqs=["a0ss-alphabet"], minutes=6, skills=["speaking"]),
 L("a0ss-sh-ch", "SH and CH Sounds", "صوت الش والتش", "A0", AC,
   [W("she", "هي", "شي"), W("ship", "سفينة", "شيب"), W("chair", "كرسي", "تشير"), W("cheese", "جبن", "تشيز"),
    E("SH like shhh, CH like tch.", "ش مثل ششش، تش مثل تتش."),
    S("She has a chair.", "عندها كرسي.", "شي هز ا تشير"),
    S("The cheese is good.", "الجبن زين.", "ذا تشيز از قود")],
   [CHO("___ has a chair.", "___ كرسي.", "___ هز ا تشير",
        [ok("She"), no("See"), no("Zee")], "She starts with SH.", "شي يبدا بـش."),
    ORD(["The", "cheese", "is", "good"], "Build: The cheese is good.", "بلد ات: ذا تشيز از قود",
        "The + noun + is + adjective.", "ذا بعدين الاسم بعدين از بعدين الصفة.", "الجبن زين"),
    TR("She has a chair.", "عندها كرسي", ["شي هز ا تشير", "عندها كرسي"])],
   prereqs=["a0ss-alphabet"], minutes=6, skills=["speaking"]),
 L("a0ss-silent-letters", "Silent Letters", "الحروف الصامتة", "A0", AC,
   [W("knee", "ركبة", "ني"), W("write", "يكتب", "رايت"), W("know", "يعرف", "نو"),
    E("Some letters are silent, like k in knee.", "بعض الحروف صامتة، مثل ك في ني."),
    S("I know the answer.", "اعرف الجواب.", "اي نو ذا انسر"),
    S("Write your name.", "اكتب اسمك.", "رايت يور نيم")],
   [CHO("I ___ the answer.", "___ الجواب.", "___ ذا انسر",
        [ok("know"), no("now"), no("no")], "Know means to understand.", "نو يعني يفهم."),
    ORD(["Write", "your", "name"], "Build: Write your name.", "بلد ات: رايت يور نيم",
        "Verb + your + noun.", "الفعل بعدين يور بعدين الاسم.", "اكتب اسمك"),
    TR("I know the answer.", "اعرف الجواب", ["اي نو ذا انسر", "اعرف الجواب"])],
   prereqs=["a0ss-alphabet"], minutes=6, skills=["speaking"]),
]

# ===== A0 ERROR CLINIC (4 -> 9) =====
AC = "a0-error-clinic"
LESSONS += [
 L("a0ec-am-vs-is", "Am vs Is vs Are", "ام مقابل از مقابل ار", "A0", AC,
   [W("am", "مع انا", "ام"), W("is", "مع هو هي", "از"), W("are", "مع انت نحن", "ار"),
    E("I am, he/she/it is, you/we/they are.", "اي ام، وهي شي از، ويو وي ذي ار."),
    S("I am a student.", "انا طالب.", "اي ام ا ستودنت"),
    S("They are my friends.", "هم ربعي.", "ذاي ار ماي فرندز")],
   [CHO("He ___ a student.", "___ طالب.", "___ ا ستودنت",
        [ok("is"), no("am"), no("are")], "He takes is.", "هو يستخدم از."),
    ORD(["I", "am", "a", "student"], "Build: I am a student.", "بلد ات: اي ام ا ستودنت",
        "I + am + noun.", "اي بعدين ام بعدين الاسم.", "انا طالب"),
    TR("They are my friends.", "هم ربعي", ["ذاي ار ماي فرندز", "هم ربعي"])],
   minutes=6, skills=["grammar", "speaking"]),
 L("a0ec-a-vs-an", "A vs An", "ا مقابل ان", "A0", AC,
   [W("a", "قبل الحرف الساكن", "ا"), W("an", "قبل حرف العلة", "ان"),
    E("Use a before consonant sounds, an before vowel sounds.", "استخدم ا قبل الاصوات الساكنة، وان قبل حروف العلة."),
    S("a book", "كتاب", "ا بوك"),
    S("an apple", "تفاحة", "ان ابل")],
   [CHO("___ apple", "___ تفاحة", "___ ابل",
        [ok("an"), no("a"), no("the")], "An before vowel sounds.", "ان قبل حروف العلة."),
    ORD(["a", "book"], "Build: a book.", "بلد ات: ا بوك",
        "a + noun.", "ا بعدين الاسم.", "كتاب"),
    TR("an apple", "تفاحة", ["ان ابل", "تفاحة"])],
   minutes=6, skills=["grammar", "speaking"]),
 L("a0ec-he-she", "He vs She", "هو مقابل هي", "A0", AC,
   [W("he", "هو", "هي"), W("she", "هي", "شي"),
    E("He for a male, she for a female.", "هي للرجل، وشي للمرأة."),
    S("He is my brother.", "هو اخوي.", "هي از ماي براذر"),
    S("She is my sister.", "هي اختي.", "شي از ماي سيستر")],
   [CHO("___ is my brother.", "___ اخوي.", "___ از ماي براذر",
        [ok("He"), no("She"), no("It")], "He for a male.", "هي للرجل."),
    ORD(["She", "is", "my", "sister"], "Build: She is my sister.", "بلد ات: شي از ماي سيستر",
        "She + is + my + noun.", "شي بعدين از بعدين ماي بعدين الاسم.", "هي اختي"),
    TR("He is my brother.", "هو اخوي", ["هي از ماي براذر", "هو اخوي"])],
   minutes=6, skills=["speaking"]),
 L("a0ec-this-that", "This vs That", "هذا مقابل ذلك", "A0", AC,
   [W("this", "هذا (قريب)", "ذس"), W("that", "ذلك (بعيد)", "ذات"),
    E("This for near, that for far.", "ذس للقريب، وذا للبعيد."),
    S("This is my pen.", "هذا قلمي.", "ذس از ماي بن"),
    S("That is your bag.", "ذلك حقيبتك.", "ذات از يور باق")],
   [CHO("___ is my pen (here).", "___ قلمي (هنا).", "___ از ماي بن",
        [ok("This"), no("That"), no("Those")], "This for near things.", "ذس للاشياء القريبة."),
    ORD(["This", "is", "my", "pen"], "Build: This is my pen.", "بلد ات: ذس از ماي بن",
        "This + is + my + noun.", "ذس بعدين از بعدين ماي بعدين الاسم.", "هذا قلمي"),
    TR("That is your bag.", "ذلك حقيبتك", ["ذات از يور باق", "ذلك حقيبتك"])],
   prereqs=["a0ec-he-she"], minutes=6, skills=["speaking"]),
 L("a0ec-plurals", "Singular vs Plural", "المفرد مقابل الجمع", "A0", AC,
   [W("book", "كتاب", "بوك"), W("books", "كتب", "بوكس"), W("a book", "كتاب", "ا بوك"),
    E("Add s for most plurals.", "ضف اس لجمع الاسماء."),
    S("one book", "كتاب واحد", "ون بوك"),
    S("two books", "كتابين", "تو بوكس")],
   [CHO("two ___", "كتابين", "تو ___",
        [ok("books"), no("book"), no("bookes")], "Add s for plural.", "ضف اس للجمع."),
    ORD(["two", "books"], "Build: two books.", "بلد ات: تو بوكس",
        "number + plural noun.", "الرقم بعدين الاسم الجمع.", "كتابين"),
    TR("two books", "كتابين", ["تو بوكس", "كتابين"])],
   minutes=6, skills=["grammar", "speaking"]),
]

# ===== A1 DAILY VERBS (5 -> 10) =====
AC = "a1-daily-verbs"
LESSONS += [
 L("a1dv-wake-up", "Wake up and Get up", "اصح وانزل", "A1", AC,
   [W("wake up", "اصح", "ويك اب"), W("get up", "انزل من السرير", "قت اب"),
    E("Wake up is to open your eyes, get up is to leave the bed.", "ويك اب تفتح عيونك، وقت اب تترك السرير."),
    S("I wake up at six.", "اصح الساعة ستة.", "اي ويك اب ات سكس"),
    S("I get up at six.", "انزل الساعة ستة.", "اي قت اب ات سكس")],
   [CHO("I ___ up at six (leave bed).", "___ الساعة ستة (اترك السرير).", "اي ___ اب ات سكس",
        [ok("get"), no("wake"), no("go")], "Get up is to leave bed.", "قت اب ترك السرير."),
    ORD(["I", "wake", "up", "at", "six"], "Build: I wake up at six.", "بلد ات: اي ويك اب ات سكس",
        "I + wake up + at + time.", "اي بعدين ويك اب بعدين ات بعدين الوقت.", "اصح الساعة ستة"),
    TR("I get up at six.", "انزل الساعة ستة", ["اي قت اب ات سكس", "انزل الساعة ستة"])],
   minutes=6, skills=["speaking"]),
 L("a1dv-eat-drink", "Eat and Drink", "اكل وشرب", "A1", AC,
   [W("eat", "اكل", "ايت"), W("drink", "شرب", "درينك"), W("breakfast", "فطار", "بريك فاست"),
    S("I eat breakfast at seven.", "افطر الساعة سبعة.", "اي ايت بريك فاست ات سيون"),
    S("She drinks coffee.", "تشرب قهوة.", "شي درينكس كوفي")],
   [CHO("I ___ breakfast.", "___ الفطار.", "اي ___ بريك فاست",
        [ok("eat"), no("drink"), no("sleep")], "You eat breakfast.", "تاكل الفطار."),
    ORD(["She", "drinks", "coffee"], "Build: She drinks coffee.", "بلد ات: شي درينكس كوفي",
        "Subject + verb + object.", "الفاعل بعدين الفعل بعدين المفعول.", "تشرب قهوة"),
    TR("I eat breakfast at seven.", "افطر الساعة سبعة", ["اي ايت بريك فاست ات سيون", "افطر الساعة سبعة"])],
   prereqs=["a1dv-wake-up"], minutes=6, skills=["speaking"]),
 L("a1dv-go-work", "Go to Work", "تروح الشغل", "A1", AC,
   [W("go to work", "تروح الشغل", "قو تو ويرك"), W("come home", "ترجع البيت", "كم هوم"),
    S("I go to work at eight.", "اروح الشغل الساعة ثمانية.", "اي قو تو ويرك ات ايت"),
    S("I come home at five.", "ارجع البيت الساعة خمسة.", "اي كم هوم ات فايف")],
   [CHO("I ___ to work at eight.", "___ الشغل الساعة ثمانية.", "اي ___ تو ويرك ات ايت",
        [ok("go"), no("come"), no("eat")], "Go to work means leave for job.", "قو تو ويرك يعني تروح للشغل."),
    ORD(["I", "go", "to", "work", "at", "eight"], "Build: I go to work at eight.", "بلد ات: اي قو تو ويرك ات ايت",
        "I + go to work + at + time.", "اي بعدين قو تو ويرك بعدين ات بعدين الوقت.", "اروح الشغل الساعة ثمانية"),
    TR("I come home at five.", "ارجع البيت الساعة خمسة", ["اي كم هوم ات فايف", "ارجع البيت الساعة خمسة"])],
   prereqs=["a1dv-wake-up"], minutes=6, skills=["speaking"]),
 L("a1dv-sleep-rest", "Sleep and Rest", "نام ورتاح", "A1", AC,
   [W("sleep", "نام", "سليب"), W("rest", "رتاح", "ريست"), W("tired", "تعبان", "تايرد"),
    S("I sleep at ten.", "انام الساعة عشرة.", "اي سليب ات تن"),
    S("I am tired.", "انا تعبان.", "اي ام تايرد")],
   [CHO("I ___ at ten.", "___ الساعة عشرة.", "اي ___ ات تن",
        [ok("sleep"), no("eat"), no("work")], "Sleep at night.", "سليب بالليل."),
    ORD(["I", "sleep", "at", "ten"], "Build: I sleep at ten.", "بلد ات: اي سليب ات تن",
        "I + sleep + at + time.", "اي بعدين سليب بعدين ات بعدين الوقت.", "انام الساعة عشرة"),
    TR("I am tired.", "انا تعبان", ["اي ام تايرد", "انا تعبان"])],
   prereqs=["a1dv-wake-up"], minutes=6, skills=["speaking"]),
 L("a1dv-daily-routine", "My Daily Routine", "روتيني اليومي", "A1", AC,
   [W("morning", "الصباح", "مورنينق"), W("evening", "المساء", "ايفنينق"),
    S("In the morning I wake up.", "في الصباح اصح.", "ان ذا مورنينق اي ويك اب"),
    S("In the evening I rest.", "في المساء ارتاح.", "ان ذا ايفنينق اي ريست")],
   [CHO("In the ___ I wake up.", "في ___ اصح.", "ان ذا ___ اي ويك اب",
        [ok("morning"), no("evening"), no("night")], "Wake up in the morning.", "تصح في الصباح."),
    ORD(["In", "the", "evening", "I", "rest"], "Build: In the evening I rest.", "بلد ات: ان ذا ايفنينق اي ريست",
        "In the + time + subject + verb.", "ان ذا بعدين الوقت بعدين الفاعل بعدين الفعل.", "في المساء ارتاح"),
    TR("In the morning I wake up.", "في الصباح اصح", ["ان ذا مورنينق اي ويك اب", "في الصباح اصح"])],
   prereqs=["a1dv-wake-up"], minutes=6, skills=["speaking"]),
]

# ===== A1 VOCAB CONTEXT (6 -> 11) =====
AC = "a1-vocab-context"
LESSONS += [
 L("a1vc-family", "Family Words in Context", "كلمات العائلة في جمل", "A1", AC,
   [W("parents", "الابوين", "بارنتس"), W("children", "الاطفال", "تشيلدرن"),
    S("My parents live in Jeddah.", "ابوي وامي يسكنون جدة.", "ماي بارنتس ليف ان جدة"),
    S("They have three children.", "عندهم ثلاثة اطفال.", "ذاي هاف ثري تشيلدرن")],
   [CHO("My ___ live in Jeddah.", "___ يسكنون جدة.", "ماي ___ ليف ان جدة",
        [ok("parents"), no("parent"), no("child")], "Parents is plural.", "بارنتس جمع."),
    ORD(["My", "parents", "live", "in", "Jeddah"], "Build: My parents live in Jeddah.", "بلد ات: ماي بارنتس ليف ان جدة",
        "My + noun + live + in + city.", "ماي بعدين الاسم بعدين ليف بعدين ان بعدين المدينة.", "ابوي وامي يسكنون جدة"),
    TR("They have three children.", "عندهم ثلاثة اطفال", ["ذاي هاف ثري تشيلدرن", "عندهم ثلاثة اطفال"])],
   minutes=6, skills=["speaking"]),
 L("a1vc-work", "Work Words in Context", "كلمات العمل في جمل", "A1", AC,
   [W("job", "وظيفة", "جوب"), W("office", "مكتب", "اوفيس"), W("boss", "المدير", "بوس"),
    S("My job is in an office.", "وظيفتي في مكتب.", "ماي جوب از ان اوفيس"),
    S("My boss is kind.", "مديري طيب.", "ماي بوس از كايند")],
   [CHO("My ___ is in an office.", "وظيفتي في ___.", "ماي ___ از ان اوفيس",
        [ok("job"), no("boss"), no("office")], "Job is your work.", "جوب عملك."),
    ORD(["My", "boss", "is", "kind"], "Build: My boss is kind.", "بلد ات: ماي بوس از كايند",
        "My + boss + is + adjective.", "ماي بعدين بوس بعدين از بعدين الصفة.", "مديري طيب"),
    TR("My job is in an office.", "وظيفتي في مكتب", ["ماي جوب از ان اوفيس", "وظيفتي في مكتب"])],
   prereqs=["a1vc-family"], minutes=6, skills=["speaking"]),
 L("a1vc-food", "Food Words in Context", "كلمات الاكل في جمل", "A1", AC,
   [W("rice", "رز", "رايس"), W("bread", "خبز", "بريد"), W("water", "ماء", "واتر"),
    S("I eat rice every day.", "اكل رز كل يوم.", "اي ايت رايس ايفري دي"),
    S("I drink water.", "اشرب ماء.", "اي درينك واتر")],
   [CHO("I eat ___ every day.", "اكل ___ كل يوم.", "اي ايت ___ ايفري دي",
        [ok("rice"), no("water"), no("sleep")], "You eat rice.", "تاكل الرز."),
    ORD(["I", "drink", "water"], "Build: I drink water.", "بلد ات: اي درينك واتر",
        "I + drink + noun.", "اي بعدين درينك بعدين الاسم.", "اشرب ماء"),
    TR("I eat rice every day.", "اكل رز كل يوم", ["اي ايت رايس ايفري دي", "اكل رز كل يوم"])],
   prereqs=["a1vc-family"], minutes=6, skills=["speaking"]),
 L("a1vc-home", "Home Words in Context", "كلمات البيت في جمل", "A1", AC,
   [W("room", "غرفة", "روم"), W("door", "باب", "دور"), W("window", "نافذة", "ويندو"),
    S("My room is big.", "غرفتي كبيرة.", "ماي روم از بي ق"),
    S("Close the door.", "اقفل الباب.", "كلوز ذا دور")],
   [CHO("My ___ is big.", "___ كبيرة.", "ماي ___ از بي ق",
        [ok("room"), no("door"), no("water")], "Room is a place at home.", "روم مكان في البيت."),
    ORD(["Close", "the", "door"], "Build: Close the door.", "بلد ات: كلوز ذا دور",
        "Verb + the + noun.", "الفعل بعدين ذا بعدين الاسم.", "اقفل الباب"),
    TR("My room is big.", "غرفتي كبيرة", ["ماي روم از بي ق", "غرفتي كبيرة"])],
   prereqs=["a1vc-family"], minutes=6, skills=["speaking"]),
 L("a1vc-feelings", "Feelings Words", "كلمات المشاعر", "A1", AC,
   [W("happy", "فرحان", "هابي"), W("sad", "حزين", "ساد"), W("angry", "معصب", "انقري"),
    S("I am happy today.", "انا فرحان اليوم.", "اي ام هابي توداي"),
    S("She is sad.", "هي حزينة.", "شي از ساد")],
   [CHO("I am ___ today.", "انا ___ اليوم.", "اي ام ___ توداي",
        [ok("happy"), no("happily"), no("happiness")], "Happy is a feeling.", "هابي شعور."),
    ORD(["She", "is", "sad"], "Build: She is sad.", "بلد ات: شي از ساد",
        "Subject + is + feeling.", "الفاعل بعدين از بعدين الشعور.", "هي حزينة"),
    TR("I am happy today.", "انا فرحان اليوم", ["اي ام هابي توداي", "انا فرحان اليوم"])],
   prereqs=["a1vc-family"], minutes=6, skills=["speaking"]),
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
        + arr_val(L.get("prereqs", [])) + ",1) ON CONFLICT (id) DO NOTHING;")
    out.append("INSERT INTO academy_lessons (academy_id,lesson_id,sort_order) VALUES ("
        + sql_val(L["academy"]) + "," + sql_val(lid) + ",0) ON CONFLICT DO NOTHING;")
    for i, it in enumerate(L["items"]):
        out.append(
            "INSERT INTO lesson_items (lesson_id,idx,kind,en,ar_meaning,translit,example_en,example_ar,example_tr,note_en,note_ar) VALUES ("
            + sql_val(lid) + "," + str(i) + "," + sql_val(it["kind"]) + "," + sql_val(it["en"]) + ","
            + sql_val(it["ar"]) + "," + sql_val(it.get("tr", "")) + ","
            + sql_val(it.get("ex_en")) + "," + sql_val(it.get("ex_ar")) + "," + sql_val(it.get("ex_tr")) + ","
            + sql_val(it.get("note_en")) + "," + sql_val(it.get("note_ar")) + ");")
    for j, ex in enumerate(L["exercises"]):
        out.append(
            "INSERT INTO lesson_exercises (lesson_id,idx,type,payload,hint_en,hint_ar,hint_tr) VALUES ("
            + sql_val(lid) + "," + str(j) + "," + sql_val(ex["type"]) + ","
            + "'" + esc(json.dumps(ex["payload"], ensure_ascii=False)) + "'::jsonb" + ","
            + sql_val(ex.get("hint_en")) + "," + sql_val(ex.get("hint_ar")) + "," + sql_val(ex.get("hint_tr")) + ");")
    return "\n".join(out)

def run_sql(sql):
    body = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": "Bearer " + PAT, "User-Agent": UA, "Content-Type": "application/json"})
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
        if code in (200, 201):
            ok += n
            print(f"  batch {b//3+1}: OK ({n} lessons)")
        else:
            fail += n
            print(f"  batch {b//3+1}: FAIL code={code}")
            print("  resp:", resp[:800])
    print(f"DONE: {ok} ok, {fail} fail")
