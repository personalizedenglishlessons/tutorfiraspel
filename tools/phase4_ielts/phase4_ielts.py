#!/usr/bin/env python3
"""Phase 4: STEP/IELTS.
(a) Wire 11 exam-relevant B2/C1 lessons into the STEP Exam Prep academy.
(b) Insert 24 IELTS-style exercises (choose/correct/order) across 6 STEP lessons,
    hand-authored, with Arabic hints (Abha, no hamza, no em dashes) + rule-based
    translit via PEL engine. No AI."""
import os, json, subprocess, urllib.request

REF = "lewoochehpiycocvfwtz"; TOKEN = os.environ["SUPABASE_PAT"]
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
DRV = os.path.dirname(os.path.abspath(__file__)) + "/translit_driver.js"
APP = os.path.dirname(os.path.abspath(__file__)) + "/app"
banned = set("أإآؤئء–—")

def sql_query(q):
    data = json.dumps({"query": q}).encode("utf-8")
    req = urllib.request.Request(URL, data=data, headers={"Authorization": f"Bearer {TOKEN}",
        "Content-Type":"application/json","Accept":"application/json","User-Agent":UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))
def esc(s): return str(s).replace("'", "''")
def ok(t): return t and any("\u0600"<=c<="\u06FF" for c in t) and not any(c in banned for c in t)

# ---- translit batch ----
def tr_batch(pairs):
    inp="/tmp/ielts_in.json"; out="/tmp/ielts_out.json"
    with open(inp,"w",encoding="utf-8") as f: json.dump(pairs, f, ensure_ascii=False)
    subprocess.run(["node", DRV, "--file", inp], check=True, stdout=open(out,"w"), cwd=APP)
    m={}; 
    for r in json.load(open(out,encoding="utf-8")):
        if ok(r["tr"]): m[r["id"]]=r["tr"]
    return m

# ---- exercise definitions (hand-authored) ----
# each: (lesson_id, type, hint_en, hint_ar, payload-builder-data)
EX = []
def choose(lid, hen, har, qen, qar, opts):
    EX.append({"lid":lid,"type":"choose","hen":hen,"har":har,"qen":qen,"qar":qar,"opts":opts})
def correct(lid, hen, har, right, wrong, why_en, why_ar):
    EX.append({"lid":lid,"type":"correct","hen":hen,"har":har,"right":right,"wrong":wrong,"why_en":why_en,"why_ar":why_ar})
def order(lid, hen, har, pen, par, tokens, answer):
    EX.append({"lid":lid,"type":"order","hen":hen,"har":har,"pen":pen,"par":par,"tokens":tokens,"answer":answer})

# step-reading-skim-scan: inference (IELTS reading)
choose("step-reading-skim-scan","Choose the correct answer.","اختار الاجابة الصح.",
 "The flight was delayed because of heavy fog over the airport. Why was the flight delayed?",
 "تاجلت الرحلة بسبب الضباب الكثيف فوق المطار. ليش تاجلت الرحلة؟",
 [("Heavy fog",True),("Heavy rain",False),("A strike",False),("A holiday",False)])
choose("step-reading-skim-scan","Choose the correct answer.","اختار الاجابة الصح.",
 "Tickets are cheaper when you book at least two weeks in advance. When are tickets cheaper?",
 "التذاكر ارخص لما تحجز قبلها اسبوعين على الاقل. متى التذاكر تكون ارخص؟",
 [("Two weeks in advance",True),("On the day",False),("At the gate",False),("In summer",False)])
choose("step-reading-skim-scan","Choose the correct answer.","اختار الاجابة الصح.",
 "The museum is closed on Mondays for maintenance. When is the museum closed?",
 "المتحف مغلق يوم الاثنين للصيانة. متى المتحف يكون مغلق؟",
 [("Mondays",True),("Fridays",False),("Weekends",False),("Holidays",False)])
choose("step-reading-skim-scan","Choose the correct answer.","اختار الاجابة الصح.",
 "She took a taxi since the bus was late. Why did she take a taxi?",
 "اخذت تاكسي لان الباص كان متاخر. ليش اخذت تاكسي؟",
 [("The bus was late",True),("She missed the bus",False),("The taxi was cheap",False),("She likes taxis",False)])

# step-vocab-synonyms: synonyms (IELTS vocab)
choose("step-vocab-synonyms","Choose the synonym.","اختار المرادف.",
 "Choose the synonym of 'happy'.","اختار مرادف كلمة happy.",
 [("Glad",True),("Sad",False),("Angry",False),("Tired",False)])
choose("step-vocab-synonyms","Choose the synonym.","اختار المرادف.",
 "Choose the synonym of 'begin'.","اختار مرادف كلمة begin.",
 [("Start",True),("End",False),("Stop",False),("Delay",False)])
choose("step-vocab-synonyms","Choose the synonym.","اختار المرادف.",
 "Choose the synonym of 'difficult'.","اختار مرادف كلمة difficult.",
 [("Hard",True),("Easy",False),("Soft",False),("Light",False)])
choose("step-vocab-synonyms","Choose the synonym.","اختار المرادف.",
 "Choose the synonym of 'fast'.","اختار مرادف كلمة fast.",
 [("Quick",True),("Slow",False),("Late",False),("Heavy",False)])

# step-pack2-01: main idea (IELTS reading)
choose("step-pack2-01","Choose the main idea.","اختار الفكرة الرئيسية.",
 "The paragraph describes how cities reduce traffic by building metro lines. What is the main idea?",
 "الفقرة تصف كيف تقلل المدن الزحمة بانشاء خطوط المترو. وش الفكرة الرئيسية؟",
 [("Metro lines reduce traffic",True),("Cities are noisy",False),("Traffic is bad",False),("Metro lines are old",False)])
choose("step-pack2-01","Choose the main idea.","اختار الفكرة الرئيسية.",
 "The passage explains that reading the first sentence of each paragraph helps you find the main idea. What helps find the main idea?",
 "النص يوضح ان قراءة اول جملة من كل فقرة تساعدك تلقى الفكرة الرئيسية. وش يساعد تلقى الفكرة الرئيسية؟",
 [("The first sentence",True),("The last word",False),("The title only",False),("The conclusion",False)])
choose("step-pack2-01","Choose the main idea.","اختار الفكرة الرئيسية.",
 "The text says desert plants store water to survive dry seasons. How do desert plants survive?",
 "النص يقول ان نباتات الصحراء تخزن الماء عشان تعيش في المواسم الجافة. كيف نباتات الصحراء تعيش؟",
 [("They store water",True),("They grow tall",False),("They lose leaves",False),("They move",False)])
choose("step-pack2-01","Choose the main idea.","اختار الفكرة الرئيسية.",
 "The passage notes that skimming means reading fast for the gist, not every word. What does skimming mean?",
 "النص يشير الى ان القراءة السريعة تعني قراءة سريعة للفكرة العامة، مو كل كلمة. وش معنى القراءة السريعة؟",
 [("Reading for the gist",True),("Reading every word",False),("Reading slowly",False),("Reading aloud",False)])

# step-error-recognition: error recognition (STEP/IELTS)
correct("step-error-recognition","Fix the mistake.","صحح الغلط.",
 "I have lived here for five years.","I have lived here since five years.",
 "Use 'for' with a duration, 'since' with a point in time.","نستخدم 'for' مع المدة و 'since' مع نقطة زمنية.")
correct("step-error-recognition","Fix the mistake.","صحح الغلط.",
 "She goes to work by bus.","She go to work by bus.",
 "Add -es to the verb with she, he, it.","نضيف -es مع الفعل مع she و he و it.")
correct("step-error-recognition","Fix the mistake.","صحح الغلط.",
 "There are many people in the market.","There is many people in the market.",
 "Use 'are' with plural nouns.","نستخدم 'are' مع الاسماء الجمع.")
correct("step-error-recognition","Fix the mistake.","صحح الغلط.",
 "I am interested in history.","I am interested of history.",
 "The preposition after 'interested' is 'in'.","نستخدم 'in' بعد 'interested'.")

# step-pack2-04: timed error recognition
correct("step-pack2-04","Fix the mistake.","صحح الغلط.",
 "The report is due on Friday.","The report is due in Friday.",
 "Use 'on' with days.","نستخدم 'on' مع الايام.")
correct("step-pack2-04","Fix the mistake.","صحح الغلط.",
 "She has worked here since 2020.","She has worked here for 2020.",
 "Use 'since' with a year as a point in time.","نستخدم 'since' مع السنة كنقطة زمنية.")
correct("step-pack2-04","Fix the mistake.","صحح الغلط.",
 "I depend on my family.","I depend of my family.",
 "The preposition after 'depend' is 'on'.","نستخدم 'on' بعد 'depend'.")
correct("step-pack2-04","Fix the mistake.","صحح الغلط.",
 "He is good at math.","He is good in math.",
 "Use 'good at' for skills.","نستخدم 'good at' للمهارات.")

# step-grammar-tenses: sentence reorder (IELTS writing structure)
order("step-grammar-tenses","Reorder to make a sentence.","رتب الكلمات لتكوين جملة.",
 "Reorder: she / every / runs / morning","رتب: هي تجري كل صباح",
 ["she","runs","every","morning"],"she runs every morning")
order("step-grammar-tenses","Reorder to make a sentence.","رتب الكلمات لتكوين جملة.",
 "Reorder: they / a new / bought / car","رتب: اشتروا سيارة جديدة",
 ["they","bought","a new","car"],"they bought a new car")
order("step-grammar-tenses","Reorder to make a sentence.","رتب الكلمات لتكوين جملة.",
 "Reorder: we / to the / went / beach","رتب: راحنا للشاطئ",
 ["we","went","to the","beach"],"we went to the beach")
order("step-grammar-tenses","Reorder to make a sentence.","رتب الكلمات لتكوين جملة.",
 "Reorder: he / his / finished / work","رتب: خلص شغله",
 ["he","finished","his","work"],"he finished his work")

# ---- collect English strings for translit ----
pairs=[]
for i,e in enumerate(EX):
    eid="e"+str(i)
    e["_eid"]=eid
    pairs.append({"id":eid+"::hen","text":e["hen"]})
    if e["type"]=="choose":
        pairs.append({"id":eid+"::qen","text":e["qen"]})
        for j,o in enumerate(e["opts"]): pairs.append({"id":eid+"::o"+str(j),"text":o[0]})
    elif e["type"]=="correct":
        pairs.append({"id":eid+"::right","text":e["right"]})
        pairs.append({"id":eid+"::wrong","text":e["wrong"]})
        pairs.append({"id":eid+"::why","text":e["why_en"]})
    elif e["type"]=="order":
        pairs.append({"id":eid+"::pen","text":e["pen"]})
tr=tr_batch(pairs)

# ---- max idx per lesson ----
maxidx={}
for r in sql_query("SELECT lesson_id, max(idx) AS m FROM lesson_exercises WHERE lesson_id IN ('step-reading-skim-scan','step-error-recognition','step-vocab-synonyms','step-grammar-tenses','step-pack2-01','step-pack2-04') GROUP BY lesson_id"):
    maxidx[r["lesson_id"]]=int(r["m"] or 0)

# ---- build INSERTs ----
ins=["BEGIN;"]; n=0
for e in EX:
    eid=e["_eid"]; lid=e["lid"]; idx=maxidx.get(lid,0)+1; maxidx[lid]=idx
    hen=e["hen"]; htr=tr.get(eid+"::hen",""); har=e["har"]
    if e["type"]=="choose":
        qtr=tr.get(eid+"::qen","")
        opts=[]
        for j,o in enumerate(e["opts"]):
            opts.append({"t":o[0],"ok":o[1],"tr":tr.get(eid+"::o"+str(j),"")})
        payload={"question":{"en":e["qen"],"ar":e["qar"],"tr":qtr},"options":opts,"hint":{"en":hen,"ar":har}}
    elif e["type"]=="correct":
        payload={"right":e["right"],"right_tr":tr.get(eid+"::right",""),
                 "wrong":e["wrong"],"wrong_tr":tr.get(eid+"::wrong",""),
                 "why_en":e["why_en"],"why_ar":e["why_ar"]}
    else: # order
        payload={"prompt":{"en":e["pen"],"ar":e["par"],"tr":tr.get(eid+"::pen","")},
                 "tokens":e["tokens"],"answer":e["answer"]}
    pj=esc(json.dumps(payload,ensure_ascii=False))
    ins.append(f"INSERT INTO lesson_exercises(lesson_id,idx,type,payload,hint_en,hint_ar,hint_tr) VALUES('{lid}',{idx},'{e['type']}','{pj}'::jsonb,'{esc(hen)}','{esc(har)}','{esc(htr)}');")
    n+=1
ins.append("COMMIT;")
sql_query("\n".join(ins))
print(f"inserted {n} IELTS-style exercises.")

# ---- (a) wire 11 B2/C1 academic lessons into STEP Exam Prep academy ----
B2C1=["b2-advanced-vocab","c1-register-vocab","c1-critical-reading","c1-academic-writing",
      "b2-pack2-02","b2-pack2-04","c1-pack2-01","c1-pack2-02","c1-pack2-03","c1-pack2-04","writing-emails-polite"]
so=sql_query("SELECT coalesce(max(sort_order),0) AS m FROM academy_lessons WHERE academy_id='step-exam-prep'")[0]
so=int(so["m"] or 0)
w=["BEGIN;"]
for i,lid in enumerate(B2C1):
    w.append(f"INSERT INTO academy_lessons(academy_id,lesson_id,sort_order) VALUES('step-exam-prep','{lid}',{so+1+i}) ON CONFLICT DO NOTHING;")
w.append("COMMIT;")
sql_query("\n".join(w))
print(f"wired {len(B2C1)} B2/C1 lessons into STEP Exam Prep academy (sort_order {so+1}..{so+len(B2C1)}).")
