#!/usr/bin/env python3
"""
Seed real content for the 5 empty flagship lessons that are active but have
0 items / 0 exercises in Supabase (the "some lessons are just not there" bug).

Safe / idempotent: DELETEs existing rows for these 5 lesson_ids first, then
INSERTs. Each lesson: 6-8 short items (word/phrase/sentence) + 5-6 exercises
(choose/order/translate/correct/spell), every row carrying Arabic + translit.

Content rules:
  - A1 = functional survival phrases; short sentences, no grammar overload.
  - Arabic = natural Saudi explanatory Arabic.
  - English = globally understandable (not slang-heavy).
  - Transliteration = English pronunciation in Arabic script.
  - No alcohol / dating / awkward security phrasing.

Run with:  SB_SERVICE_KEY=<your-management-token> python3 tools/seed_flagship_lessons.py
(NOT committed; the key stays out of the repo.)
"""
import os, json, urllib.request, sys

REF = "lewoochehpiycocvfwtz"
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"
T = os.environ.get("SB_SERVICE_KEY")
if not T:
    print("Set SB_SERVICE_KEY env var first."); sys.exit(1)
H = {
    "Authorization": "Bearer " + T,
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Content-Type": "application/json",
}

def esc(s):
    """Escape a SQL string literal value (single quotes doubled)."""
    return "'" + (str(s) if s is not None else "").replace("'", "''") + "'"

def jq(o):
    """JSON payload as a SQL jsonb literal."""
    return esc(json.dumps(o, ensure_ascii=False))

def run(sql):
    req = urllib.request.Request(
        URL, data=json.dumps({"query": sql}).encode(), headers=H, method="POST")
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode())

# ---- lesson content -------------------------------------------------------

LESSONS = [
 # 1. meeting-someone-new (A1, everyday-english)
 dict(id="meeting-someone-new", items=[
   ("word","Hello","مرحبًا","هالو","Hello, nice to meet you.","مرحبًا، سعيد بلقائك.","هالو، نايس تو ميت يو."),
   ("word","Nice to meet you","سعيد بلقائك","نايس تو ميت يو","I'm Sara. Nice to meet you.","أنا سارة. سعيد بلقائك.","ايم سارة. نايس تو ميت يو."),
   ("phrase","My name is...","اسمي...","ماي نيم از","My name is Ahmed.","اسمي أحمد.","ماي نيم از احمد."),
   ("sentence","Where are you from?","من أين أنت؟","وير آر يو فروم","Where are you from? I'm from Saudi Arabia.","من أين أنت؟ أنا من السعودية.","وير آر يو فروم؟ ايم فروم سعودي عربيا."),
   ("phrase","See you later","أراك لاحقًا","سي يو ليتر","See you later, bye!","أراك لاحقًا، مع السلامة!","سي يو ليتر، باي!"),
   ("phrase","How are you?","كيف حالك؟","هاو آر يو","How are you? I'm fine, thanks.","كيف حالك؟ أنا بخير، شكرًا.","هاو آر يو؟ ايم فاين، ثانكس."),
 ], exs=[
   ("choose", {"question":{"en":"Which is a greeting?","ar":"أيُّها تحية؟","tr":"ويش از ا گرتنق؟"},
     "options":[{"t":"Hello","ok":True,"tr":"هالو"},{"t":"Goodbye","ok":False,"tr":"قودباي"},{"t":"Yesterday","ok":False,"tr":"يستردي"}]}),
   ("order", {"prompt":{"en":"Build: where are you from?","ar":"رتّب: من أين أنت؟","tr":"بيرلت: وير آر يو فروم؟"},
     "tokens":["Where","are","you","from","?"],"answer":"Where are you from?"}),
   ("translate", {"source":"Nice to meet you.","source_tr":"نايس تو ميت يو.","dir":"en2ar","answer":"سعيد بلقائك","accept":["سعيد بلقائك","تشرفنا"]}),
   ("correct", {"wrong":"What your name?","wrong_tr":"وات يور نيم؟","right":"What is your name?","right_tr":"وات از يور نيم؟"}),
   ("spell", {"display":"H E L L O","meaning":"مرحبًا","translit":"هالو","options":["H","E","L","O","X"],"answer":"HELLO"}),
 ]),
 # 2. ordering-coffee (A1, coffee-shop-english)
 dict(id="ordering-coffee", items=[
   ("word","coffee","قهوة","كوفي","A coffee, please.","قهوة، من فضلك.","ا كوفي، بليز."),
   ("phrase","Can I have...?","هل يمكنني...؟","كان اي هاف","Can I have a latte, please?","هل يمكنني لاتيه، من فضلك؟","كان اي هاف ا لاتيه، بليز؟"),
   ("word","latte","لاتيه","لاتيه","I'd like a latte.","أريد لاتيه.","ايد لايك ا لاتيه."),
   ("word","iced","مثلّج","ايسد","An iced coffee, please.","قهوة مثلّجة، من فضلك.","ان ايسد كوفي، بليز."),
   ("phrase","to go","للسفري","تو قو","Coffee to go, please.","قهوة للسفري، من فضلك.","كوفي تو قو، بليز."),
   ("phrase","How much is it?","كم السعر؟","هاو متش از ات؟","How much is it? It's twelve riyals.","كم السعر؟ اثنا ريالًا.","هاو متش از ات؟ اتس تويلف ريالز."),
 ], exs=[
   ("choose", {"question":{"en":"Which means 'مثلّج'?","ar":"أيُّها تعني «مثلّج»؟","tr":"ويش مينز مثلج؟"},
     "options":[{"t":"Iced","ok":True,"tr":"ايسد"},{"t":"Hot","ok":False,"tr":"هوت"},{"t":"Sweet","ok":False,"tr":"سويت"}]}),
   ("order", {"prompt":{"en":"Build: can I have a latte?","ar":"رتّب: هل يمكنني لاتيه؟","tr":"بيرلت: كان اي هاف ا لاتيه؟"},
     "tokens":["Can","I","have","a","latte","?"],"answer":"Can I have a latte?"}),
   ("translate", {"source":"Coffee to go, please.","source_tr":"كوفي تو قو، بليز.","dir":"en2ar","answer":"قهوة للسفري، من فضلك.","accept":["قهوة للسفري من فضلك","قهوة للسفري، من فضلك"]}),
   ("correct", {"wrong":"I want latte.","wrong_tr":"اي وانت لاتيه.","right":"I'd like a latte.","right_tr":"ايد لايك ا لاتيه."}),
   ("spell", {"display":"C O F F E E","meaning":"قهوة","translit":"كوفي","options":["C","O","F","E","Z"],"answer":"COFFEE"}),
 ]),
 # 3. booking-hotel (A1, hotel-english)
 dict(id="booking-hotel", items=[
   ("word","room","غرفة","روم","I'd like a room, please.","أريد غرفة، من فضلك.","ايد لايك ا روم، بليز."),
   ("phrase","I'd like to book...","أود حجز...","ايد لايك تو بوك","I'd like to book a double room.","أود حجز غرفة مزدوجة.","ايد لايك تو بوك ا دابل روم."),
   ("word","double room","غرفة مزدوجة","دابل روم","A double room for two nights.","غرفة مزدوجة لليلتين.","ا دابل روم فور تو نايتس."),
   ("phrase","How much per night?","كم لليلة؟","هاو متش بير نايت","How much per night? It's 300 riyals.","كم لليلة؟ ثلاثمائة ريال.","هاو متش بير نايت؟ اتس ثري هاندرد ريالز."),
   ("word","check-in","تسجيل الوصول","تشك-إن","Check-in is at 3 p.m.","تسجيل الوصول الساعة الثالثة عصرًا.","تشك-إن از ات ثري پي إم."),
   ("word","check-out","تسجيل المغادرة","تشك-اوت","Check-out is before noon.","تسجيل المغادرة قبل الظهر.","تشك-اوت از بي فور نون."),
 ], exs=[
   ("choose", {"question":{"en":"Which means 'غرفة مزدوجة'?","ar":"أيُّها تعني «غرفة مزدوجة»؟","tr":"ويش مينز غرفة مزدوجة؟"},
     "options":[{"t":"Double room","ok":True,"tr":"دابل روم"},{"t":"Single room","ok":False,"tr":"سينقل روم"},{"t":"Key card","ok":False,"tr":"كي كارد"}]}),
   ("order", {"prompt":{"en":"Build: I'd like to book a room","ar":"رتّب: أود حجز غرفة","tr":"بيرلت: اود حجز غرفة"},
     "tokens":["I'd","like","to","book","a","room"],"answer":"I'd like to book a room"}),
   ("translate", {"source":"How much per night?","source_tr":"هاو متش بير نايت؟","dir":"en2ar","answer":"كم لليلة؟","accept":["كم لليلة","كم سعر الليلة"]}),
   ("correct", {"wrong":"I want book room.","wrong_tr":"اي وانت بوك روم.","right":"I'd like to book a room.","right_tr":"ايد لايك تو بوك ا روم."}),
   ("spell", {"display":"R O O M","meaning":"غرفة","translit":"روم","options":["R","O","M","S"],"answer":"ROOM"}),
 ]),
 # 4. going-to-airport (A1, travel-english)
 dict(id="going-to-airport", items=[
   ("word","airport","مطار","ايربورت","Where is the airport?","أين المطار؟","وير از ذا ايربورت؟"),
   ("phrase","Where is the gate?","أين البوابة؟","وير از ذا قيت","Excuse me, where is the gate?","عفوًا، أين البوابة؟","اكسكيوز مي، وير از ذا قيت؟"),
   ("phrase","boarding pass","بطاقة الصعود","بوردنق باس","Here is my boarding pass.","هذه بطاقة صعودي.","هير از ماي بوردنق باس."),
   ("word","passport","جواز السفر","باسبورت","Show your passport, please.","أرِ جواز سفرك، من فضلك.","شو يور باسبورت، بليز."),
   ("phrase","My flight is at...","رحلتي الساعة...","ماي فلايت از ات","My flight is at 6 p.m.","رحلتي الساعة السادسة عصرًا.","ماي فلايت از ات سيكس پي إم."),
   ("phrase","I'm looking for...","أبحث عن...","ايم لوكنق فور","I'm looking for gate 12.","أبحث عن البوابة 12.","ايم لوكنق فور قيت تويلف."),
 ], exs=[
   ("choose", {"question":{"en":"Which means 'جواز السفر'?","ar":"أيُّها تعني «جواز السفر»؟","tr":"ويش مينز جواز السفر؟"},
     "options":[{"t":"Passport","ok":True,"tr":"باسبورت"},{"t":"Boarding pass","ok":False,"tr":"بوردنق باس"},{"t":"Luggage","ok":False,"tr":"لاگيج"}]}),
   ("order", {"prompt":{"en":"Build: where is the gate?","ar":"رتّب: أين البوابة؟","tr":"بيرلت: وير از ذا قيت؟"},
     "tokens":["Where","is","the","gate","?"],"answer":"Where is the gate?"}),
   ("translate", {"source":"My flight is at 6 p.m.","source_tr":"ماي فلايت از ات سيكس پي إم.","dir":"en2ar","answer":"رحلتي الساعة السادسة عصرًا.","accept":["رحلتي الساعة السادسة","رحلتي الساعة 6 مساءً"]}),
   ("correct", {"wrong":"Where gate?","wrong_tr":"وير قيت؟","right":"Where is the gate?","right_tr":"وير از ذا قيت؟"}),
   ("spell", {"display":"G A T E","meaning":"بوابة","translit":"قيت","options":["G","A","T","E","B"],"answer":"GATE"}),
 ]),
 # 5. talking-with-friends (B1, american-conversations)
 dict(id="talking-with-friends", items=[
   ("phrase","How's it going?","كيف الأحوال؟","هاوز ات قوينق","Hey, how's it going?","أهلًا، كيف الأحوال؟","هاي، هاوز ات قوينق؟"),
   ("phrase","Long time no see","من زمان ما شفتك","لونق تايم نو سي","Long time no see! How have you been?","من زمان ما شفتك! كيف حالك؟","لونق تايم نو سي! هاو هاف يو بين؟"),
   ("phrase","What have you been up to?","وش صار معك؟","وات هاف يو بين اپ تو","So, what have you been up to lately?","إذن، وش صار معك هالأيام؟","سو، وات هاف يو بين اپ تو ليتلي؟"),
   ("phrase","That sounds great","يبدو رائعًا","ذات ساوندز قرايت","A trip to Riyadh? That sounds great!","رحلة للرياض؟ يبدو رائعًا!","ا تريب تو الرياض؟ ذات ساوندز قرايت!"),
   ("phrase","By the way","على فكرة","با ذا وي","By the way, did you call Ali?","على فكرة، اتصلت بعلي؟","با ذا وي، ديد يو كول علي؟"),
   ("phrase","Let's catch up","خلنا نطولح","ليتس كاتش اپ","Let's grab coffee and catch up.","خلنا ناخذ قهوة ونطولح.","ليتس قراب كوفي اند كاتش اپ."),
 ], exs=[
   ("choose", {"question":{"en":"Which means 'من زمان ما شفتك'?","ar":"أيُّها تعني «من زمان ما شفتك»؟","tr":"ويش مينز من زمان ما شفتك؟"},
     "options":[{"t":"Long time no see","ok":True,"tr":"لونق تايم نو سي"},{"t":"See you later","ok":False,"tr":"سي يو ليتر"},{"t":"Nice to meet you","ok":False,"tr":"نايس تو ميت يو"}]}),
   ("order", {"prompt":{"en":"Build: what have you been up to?","ar":"رتّب: وش صار معك؟","tr":"بيرلت: وات هاف يو بين اپ تو؟"},
     "tokens":["What","have","you","been","up","to","?"],"answer":"What have you been up to?"}),
   ("translate", {"source":"That sounds great!","source_tr":"ذات ساوندز قرايت!","dir":"en2ar","answer":"يبدو رائعًا!","accept":["يبدو رائعا","يبدو رائعًا!","رائع"]}),
   ("correct", {"wrong":"How it going?","wrong_tr":"هاو ات قوينق؟","right":"How's it going?","right_tr":"هاوز ات قوينق؟"}),
   ("spell", {"display":"G R E A T","meaning":"رائع","translit":"قرايت","options":["G","R","E","A","T","Z"],"answer":"GREAT"}),
 ]),
]

# ---- build + run SQL -------------------------------------------------------

def sql_for(lesson):
    lid = lesson["id"]
    items = lesson["items"]; exs = lesson["exs"]
    stmts = [f"DELETE FROM lesson_items WHERE lesson_id='{lid}';",
             f"DELETE FROM lesson_exercises WHERE lesson_id='{lid}';"]
    for i, (kind, en, ar, tr, ex_en, ex_ar, ex_tr) in enumerate(items, 1):
        stmts.append(
            "INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES ("
            f"{esc(lid)},{i},{esc(kind)},{esc(en)},{esc(ar)},{esc(tr)},{esc(ex_en)},{esc(ex_ar)},{esc(ex_tr)});")
    for i, (typ, payload) in enumerate(exs, 1):
        stmts.append(
            "INSERT INTO lesson_exercises (lesson_id, idx, type, payload) VALUES ("
            f"{esc(lid)},{i},{esc(typ)},{jq(payload)});")
    return "\n".join(stmts)

# Preview / dry-run: print statement counts
if "--dry" in sys.argv:
    for L in LESSONS:
        s = sql_for(L)
        print(f"{L['id']}: {s.count('INSERT INTO lesson_items')} items, {s.count('INSERT INTO lesson_exercises')} exercises")
    print(f"\nTotal lessons: {len(LESSONS)}")
    sys.exit(0)

# Live run (needs confirmation first)
print("Seeding", len(LESSONS), "lessons into Supabase project", REF, "...")
for L in LESSONS:
    sql = sql_for(L)
    res = run(sql)
    errs = [r for r in res if r.get("error")]
    cnt_items = len(L["items"]); cnt_ex = len(L["exs"])
    status = "OK" if not errs else "ERR: " + errs[0].get("message","")[:120]
    print(f"  {L['id']:24} -> {cnt_items} items, {cnt_ex} exercises | {status}")
    if errs:
        print("    full error:", errs[0]); sys.exit(2)

# Verify
print("\nVerification:")
for L in LESSONS:
    v = run(f"select (select count(*) from lesson_items where lesson_id='{L['id']}') as items, (select count(*) from lesson_exercises where lesson_id='{L['id']}') as exs;")
    row = v[0] if v else {}
    print(f"  {L['id']:24} items={row.get('items')} exs={row.get('exs')}")
print("\nDone.")
