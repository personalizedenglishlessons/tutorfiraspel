#!/usr/bin/env python3
"""Phase 5: Abha Expressions phrasebook. Insert ~30 everyday English expressions
into the words table (role='expression', level='A1') with Abha-dialect Arabic
meanings + rule-based translit + context. No AI. Abha style: no hamza, no dashes."""
import os, json, subprocess, urllib.request

REF="lewoochehpiycocvfwtz"; TOKEN=os.environ["SUPABASE_PAT"]
URL=f"https://api.supabase.com/v1/projects/{REF}/database/query"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
DRV=os.path.dirname(os.path.abspath(__file__))+"/translit_driver.js"
APP=os.path.dirname(os.path.abspath(__file__))+"/app"
HAMZA=set("أإآؤئء"); DASH=set("–—")
def clean(s):
    if not isinstance(s,str): return s
    return ''.join('ا' if c in HAMZA else (',' if c in DASH else c) for c in s)
def sql_query(q):
    data=json.dumps({"query":q}).encode("utf-8")
    req=urllib.request.Request(URL,data=data,headers={"Authorization":f"Bearer {TOKEN}",
        "Content-Type":"application/json","Accept":"application/json","User-Agent":UA})
    with urllib.request.urlopen(req,timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))
def esc(s): return str(s).replace("'", "''")

# (en, ar_abha, context_en, context_ar)  -- hand-authored, Abha dialect
EXPR=[
("How is it going?","وش اخبارك؟","Casual greeting.","تحية بين الاصحاب."),
("What is up?","وش عندك؟","Casual greeting between friends.","تحية ودية."),
("I am broke.","انا مفلس.","You have no money.","عندك ما معك فلوس."),
("No worries.","ما يهمك، عادي.","It is not a problem.","ما فيها مشكلة."),
("Take your time.","على راحتك.","Do not rush.","ما فيه استعجال."),
("Sounds good.","يمدي، كويس.","You agree.","انت موافق."),
("Hang on a second.","ثانية، انتظر.","Wait a moment.","استظر لحظة."),
("I will get back to you.","برد عليك بعدين.","I will reply later.","بارد بعدين."),
("It is up to you.","القرار بيدك.","Your choice.","الاختيار على راحتك."),
("Let me see.","خلني اشوف.","Let me check.","خلني اتاكد."),
("Just kidding.","امزح معك.","I am joking.","انا امزح."),
("I have no idea.","ما عندي علم.","I do not know.","ما عندي خبر."),
("Catch you later.","اشوفك بعدين.","Goodbye, casual.","وداع ودّي."),
("What do you mean?","وش تقصد؟","Asking to clarify.","تطلب توضيح."),
("Make up your mind.","حدد قرارك.","Decide now.","قرر بسرعة."),
("It slipped my mind.","طار من بالي.","I forgot.","نسيت بحكم."),
("Keep it up.","استمر، كمل.","Encouragement.","تشجيع."),
("Take it easy.","هدي، خذ راحتك.","Relax.","اهدى وارتاح."),
("I am in.","انا معكم.","I will join.","انت موافق تشارك."),
("Out of the blue.","فجاة من غير انذار.","Unexpectedly.","بغتة."),
("Give me a hand.","ساعدني.","Help me.","اطلب مساعدة."),
("It is a piece of cake.","شغلة بسيطة، سهلة.","Very easy.","سهل جدا."),
("Break a leg.","بالتوفيق، بالبركة.","Good luck.","دعوة بالتوفيق."),
("Long time no see.","مدة ما شفتك.","Haven't seen you in a while.","من زمان ما تقابلنا."),
("Spill the beans.","قول الصدق، افش السر.","Tell the secret.","افشي اللي تعرفه."),
("Bite the bullet","اصبر وتحمل.","Endure something hard.","تحمل المصاعب."),
("We are on the same page.","احنا متفقين.","In agreement.","نفس التفكير."),
("Under the weather.","مو متعافي، مريض.","Feeling sick.","ما تشوف صح."),
("Cost an arm and a leg.","غالي جدا.","Very expensive.","سعره مرتفع."),
("Call it a day.","خلصنا شغل اليوم.","Stop working for today.","ننهي العمل اليوم."),
]

# translit en + context_en via engine
pairs=[]
for i,(en,ar,cen,car) in enumerate(EXPR):
    pairs.append({"id":"p"+str(i)+"::en","text":en})
    pairs.append({"id":"p"+str(i)+"::cen","text":cen})
inp="/tmp/abha_in.json"; out="/tmp/abha_out.json"
with open(inp,"w",encoding="utf-8") as f: json.dump(pairs,f,ensure_ascii=False)
subprocess.run(["node",DRV,"--file",inp],check=True,stdout=open(out,"w"),cwd=APP)
tr={r["id"]:r["tr"] for r in json.load(open(out,encoding="utf-8"))}

ins=["BEGIN;"]; n=0
for i,(en,ar,cen,car) in enumerate(EXPR):
    en=clean(en); ar=clean(ar); cen=clean(cen); car=clean(car)
    tr_en=tr.get("p"+str(i)+"::en",""); tr_cen=tr.get("p"+str(i)+"::cen","")
    if not tr_en or not any("\u0600"<=c<="\u06FF" for c in tr_en): continue
    wid="abha-expr-%02d"%i
    arj=esc(json.dumps([ar],ensure_ascii=False))
    ins.append(f"INSERT INTO words(id,en,ar,translit,role,level,example_en,example_ar,example_tr,active) "
               f"VALUES('{wid}','{esc(en)}','{arj}'::jsonb,'{esc(tr_en)}','expression','A1','{esc(cen)}','{esc(car)}','{esc(tr_cen)}',true) ON CONFLICT(id) DO UPDATE SET en=EXCLUDED.en,ar=EXCLUDED.ar,translit=EXCLUDED.translit,example_en=EXCLUDED.example_en,example_ar=EXCLUDED.example_ar,example_tr=EXCLUDED.example_tr;")
    n+=1
ins.append("COMMIT;")
sql_query("\n".join(ins))
print(f"inserted {n} Abha expressions (role=expression, level=A1).")

# validate no banned chars
res=sql_query("SELECT count(*) AS c FROM words WHERE role='expression' AND (ar::text ~ '[أإآؤئء]' OR example_ar ~ '[أإآؤئء]' OR example_tr ~ '[أإآؤئء]' OR translit ~ '[أإآؤئء]' OR example_ar ~ '–' OR example_ar ~ '—')")
print("banned chars in abha expressions:", res[0]["c"] if res else "?")
