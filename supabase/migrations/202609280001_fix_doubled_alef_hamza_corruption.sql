-- 202609280001_fix_doubled_alef_hamza_corruption.sql
-- Fix doubled اا (hamza→ا) corruption in lesson_exercises
-- The hamza was replaced with a plain ا, creating doubled-ا garbles.
-- 31 rows across 26 exercises affected. Also fixes hint_ar for exercise 1461.

-- اام → أم (I am)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{wrong_tr}', '"أم فاين."') WHERE id = 613;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{wrong_tr}', '"أم تايرد."') WHERE id = 685;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,1,tr}', '"أم فاين."') WHERE id = 686;

-- نبداا → نبدأ (we start)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{accept,0}', '"نبدأ من الثمانية"') WHERE id = 642;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', '"نبدأ الثمانية"') WHERE id = 642;

-- ماا → ماء (water)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{ar}', '"اشرب ماء"') WHERE id = 718;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{ar}', '"ابغى شوية ماء"') WHERE id = 780;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', '"___ ماء؟"') WHERE id = 1422;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{accept,1}', '"تحب ماء"') WHERE id = 1424;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', '"تحب ماء"') WHERE id = 1424;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{ar}', '"اشرب ماء"') WHERE id = 1489;

-- حمراا → حمراء (red)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{accept,0}', '"السيارة حمراء."') WHERE id = 798;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', '"السيارة حمراء."') WHERE id = 798;

-- دواا → دواء (medicine) — options[2] not [1]
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,2,t}', '"دواء"') WHERE id = 845;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,0,t}', '"دواء"') WHERE id = 959;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,2,t}', '"دواء"') WHERE id = 1058;

-- مساا → مساء (evening)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', '"مساء الخير. عندي حجز."') WHERE id = 957;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,en}', '"مساء الخير. عندي حجز."') WHERE id = 957;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{ar}', '"في المساء ارتاح"') WHERE id = 1480;

-- جاا → جاء (came)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,1,t}', '"جاء"') WHERE id = 1009;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,1,t}', '"جاء"') WHERE id = 1033;

-- قرااة → قراءة (reading) — multiple rows
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{accept,0}', '"انا احب القراءة"') WHERE id = 1126;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{accept,1}', '"احب القراءة"') WHERE id = 1126;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{answer}', '"انا احب القراءة."') WHERE id = 1126;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,0,t}', '"قراءة سريعة للفكرة العامة"') WHERE id = 1174;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,1,t}', '"قراءة كل كلمة ببطء"') WHERE id = 1174;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{ar}', '"استعمل ونس لقراءة سريعة مرة وحدة."') WHERE id = 1181;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,0,t}', '"قراءة سريعة للفكرة العامة"') WHERE id = 1521;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,1,t}', '"قراءة كل كلمة ببطء"') WHERE id = 1521;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', '"النص يوضح ان قراءة اول جملة من كل فقرة تساعدك تلقى الفكرة الرئيسيه. وش يساعد تلقى الفكرة الرئيسيه؟"') WHERE id = 1538;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', '"النص يشير الى ان القرايه السريعة تعني قراءة سريعة للفكرة العامة، مو كل كلمة. وش معنى القرايه السريعة؟"') WHERE id = 1540;

-- للاشياا → للأشياء (for things) — why_ar field, not ar
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{why_ar}', '"استعمل ويتش للأشياء وهو للناس."') WHERE id = 1217;
UPDATE lesson_exercises SET hint_ar = 'ذس للأشياء القريبة.' WHERE id = 1461;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{hint,ar}', '"ذس للأشياء القريبة."') WHERE id = 1461;

-- لاعطاا → لإعطاء (to give) — question.ar field
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', '"وش نستعمل لإعطاء الراي مهذبا؟"') WHERE id = 1226;

-- الادعاا → الادعاء (the claim)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{prompt,ar}', '"الدليل القوي يدعم الادعاء."') WHERE id = 1256;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,0,t}', '"لتحذير من تقييد الادعاء"') WHERE id = 1283;

-- عشوااية → عشوائية (random)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{options,1,t}', '"افكار كثيرة عشوائية"') WHERE id = 1262;

-- بانشاا → بإنشاء (by creating) — question.ar field
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', '"الفقرة تصف كيف تقلل المدن الزحمة بإنشاء خطوط المترو. وش الفكرة الرئيسيه؟"') WHERE id = 1537;

-- الصحراا → الصحراء (desert) — question.ar field, 2 occurrences
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', '"النص يقول ان نباتات الصحراء تخزن الما عشان تعيش في المواسم الجافة. كيف نباتات الصحراء تعيش؟"') WHERE id = 1539;

-- Verify: should return 0 rows (excluding id=1281 which is a transliteration)
-- SELECT id, payload::text FROM lesson_exercises WHERE payload::text LIKE '%اا%' AND id != 1281;
