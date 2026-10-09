-- Fix 'are' transliteration: the app's canonical form is 'ار' (items 1817/1324/2830/2188).
-- Standalone 'اير' was used for 'are' in 77 sentences + 52 exercise payloads;
-- 'اير' is kept where it means 'air' (fire, airport, 'P has air', early, tired).
-- Also reverts the 'آر' variant introduced in migration 202610090002 to the canonical 'ار'.

UPDATE public.lesson_items li
SET translit = v.new_tr
FROM (VALUES
(1758, 'نو، يو اير فاين.', 'نو، يو ار فاين.'),
(1925, 'باي ذا واي، اير يو فري توداي؟', 'باي ذا واي، ار يو فري توداي؟'),
(1706, 'هلو! هاو آر يو توداي؟', 'هلو! هاو ار يو توداي؟'),
(1804, 'هاو آر يو؟', 'هاو ار يو؟'),
(2971, 'هاو آر يو', 'هاو ار يو'),
(1811, 'هلو، هو اير يو؟', 'هلو، هو ار يو؟'),
(1814, 'يس، شي ايز. ذاي اير ماي فاميلي.', 'يس، شي ايز. ذاي ار ماي فاميلي.'),
(1882, 'يس، اند ماي ايز اير تايرد.', 'يس، اند ماي ايز ار تايرد.'),
(1819, 'يس، اي ام. اير يو؟', 'يس، اي ام. ار يو؟'),
(1923, 'هاو اير ثينجز؟', 'هاو ار ثينجز؟'),
(1896, 'اوڤ كورس. اير يو ريدي تو اوردر؟', 'اوڤ كورس. ار يو ريدي تو اوردر؟'),
(1273, 'دو نات قيڤ اب، يو اير دوينج قريت.', 'دو نات قيڤ اب، يو ار دوينج قريت.'),
(652, 'وير اير يو فروم؟', 'وير ار يو فروم؟'),
(682, 'وات اير يو دوينج ذيس ويكيند؟', 'وات ار يو دوينج ذيس ويكيند؟'),
(684, 'ذات ساوندز نايس. اير يو درايڤنق؟', 'ذات ساوندز نايس. ار يو درايڤنق؟'),
(724, 'اي دساقرينج، ويكيندز اير بيرفكت فور مي.', 'اي دساقرينج، ويكيندز ار بيرفكت فور مي.'),
(1012, 'ستي كام. وير اير يو اجزكتلي؟', 'ستي كام. وير ار يو اجزكتلي؟'),
(908, 'وات اير يور سمبتمز تودي؟', 'وات ار يور سمبتمز تودي؟'),
(1326, 'يو اير بزي توداي', 'يو ار بزي توداي'),
(1290, 'وات كايند اوڤ ميوزك اير يو ان تو؟', 'وات كايند اوڤ ميوزك ار يو ان تو؟'),
(1325, 'يو اير ريدي', 'يو ار ريدي'),
(1341, 'وي اير ريدي', 'وي ار ريدي'),
(1342, 'ذي اير ليت', 'ذي ار ليت'),
(1343, 'وي اير نات تايرد', 'وي ار نات تايرد'),
(1349, 'ذي اير نات ريدي', 'ذي ار نات ريدي'),
(1359, 'يو اير ليت. يور ليت', 'يو ار ليت. يور ليت'),
(1433, 'وي اير ات ذا دور', 'وي ار ات ذا دور'),
(1423, 'وي اير قوينج تو ميت تومورو', 'وي ار قوينج تو ميت تومورو'),
(1475, 'هي از هير. ذي اير هير', 'هي از هير. ذي ار هير'),
(1482, 'ذيز اير ماي كيز', 'ذيز ار ماي كيز'),
(1505, 'يو اير ويلكم', 'يو ار ويلكم'),
(4071, 'فايف ليترز اير ڤاولز: اي اي اي او يو. ذي ميك ديفيرانت صاوندز ان ديفيرانت وردز.', 'فايف ليترز ار ڤاولز: اي اي اي او يو. ذي ميك ديفيرانت صاوندز ان ديفيرانت وردز.'),
(1502, 'هاو آر يو؟', 'هاو ار يو؟'),
(1617, 'وير اير يو فروم؟', 'وير ار يو فروم؟'),
(1630, 'واي اير يو ليت؟', 'واي ار يو ليت؟'),
(1657, 'ذي اير قود فرندز', 'ذي ار قود فرندز'),
(3799, 'يور كيز اير ان ذا كار.', 'يور كيز ار ان ذا كار.'),
(1675, 'ذي اير بلايينج اوتسايد', 'ذي ار بلايينج اوتسايد'),
(4097, 'ڤاولز اير ذا هارت اوف افري ورد. ويذ آوت ڤاولز ذير اير نو وردز.', 'ڤاولز ار ذا هارت اوف افري ورد. ويذ آوت ڤاولز ذير ار نو وردز.'),
(1981, 'وات اير يور سترونقثس؟', 'وات ار يور سترونقثس؟'),
(3834, 'ذا كيدز اير اوتسايد.', 'ذا كيدز ار اوتسايد.'),
(3848, 'يو اير رايت.', 'يو ار رايت.'),
(4117, 'اس ايتش اند سي ايتش اير تو ليترز ذات ميك وان صاوند. اس ايتش از لايك سيينق شه تو بي كوايت. سي ايتش از لايك ذا صاوند اوف ا ترين: تش تش تش.', 'اس ايتش اند سي ايتش ار تو ليترز ذات ميك وان صاوند. اس ايتش از لايك سيينق شه تو بي كوايت. سي ايتش از لايك ذا صاوند اوف ا ترين: تش تش تش.'),
(2142, 'ذر اير ثري ابلز.', 'ذر ار ثري ابلز.'),
(2147, 'وي اير ات ذا ايربورت.', 'وي ار ات ذا ايربورت.'),
(4124, 'ذي اير اوفر ذير.', 'ذي ار اوفر ذير.'),
(4125, 'ثري اوف ذيم اير هير.', 'ثري اوف ذيم ار هير.'),
(1093, 'اند ا ويكنس يو اير وركنق اون؟', 'اند ا ويكنس يو ار وركنق اون؟'),
(2568, 'هلو هاو آر يو', 'هلو هاو ار يو'),
(1435, 'ذا كيز اير ان ذا باغ', 'ذا كيز ار ان ذا باغ'),
(1485, 'ذير اير ايت رومز', 'ذير ار ايت رومز'),
(1575, 'توداي وي اير قوينج تو دسكاس ذا بدقت', 'توداي وي ار قوينج تو دسكاس ذا بدقت'),
(1628, 'هاو آر يو توداي؟', 'هاو ار يو توداي؟'),
(2586, 'هاو آر يو توداي', 'هاو ار يو توداي'),
(2609, 'يوس ذير از فور وان, ذير اير فور ماني.', 'يوس ذير از فور وان, ذير ار فور ماني.'),
(656, 'ا دبليو ايتش- كويستشن ستارتس وذ ذا كويستشن ورد, ذين ذا وكسيلياري, ذين ذا سابجيكت: وير اير يو؟ وات دو يو دو؟', 'ا دبليو ايتش- كويستشن ستارتس وذ ذا كويستشن ورد, ذين ذا وكسيلياري, ذين ذا سابجيكت: وير ار يو؟ وات دو يو دو؟'),
(2611, 'ذير اير فايڤ ستودنتس', 'ذير ار فايڤ ستودنتس'),
(2726, 'واي اير يو ليت', 'واي ار يو ليت'),
(2723, 'هاو آر يو', 'هاو ار يو'),
(2833, 'ذاي اير ماي فرندز', 'ذاي ار ماي فرندز'),
(1194, 'اناونسمانتس اير هيڤي وذ نامبيرز: قيت 12, فلايت 204, تن ميناتس ديلي.', 'اناونسمانتس ار هيڤي وذ نامبيرز: قيت 12, فلايت 204, تن ميناتس ديلي.'),
(1421, 'ام / از / اير + قوينج تو + ڤيرب', 'ام / از / ار + قوينج تو + ڤيرب'),
(1676, 'ام قوز وذ اي, از قوز وذ هي/شي/ات, اير قوز وذ يو/وي/ذي.', 'ام قوز وذ اي, از قوز وذ هي/شي/ات, ار قوز وذ يو/وي/ذي.'),
(1705, 'هاو آر يو', 'هاو ار يو'),
(1875, 'يس، اند ماي شوز اير نيو تو.', 'يس، اند ماي شوز ار نيو تو.'),
(3776, 'ذاي اير ماي فرندز.', 'ذاي ار ماي فرندز.'),
(3780, 'ذا كارز اير ذيرز.', 'ذا كارز ار ذيرز.'),
(3786, 'ذيز اير ماي بوكس.', 'ذيز ار ماي بوكس.'),
(3787, 'ذوز اير هيز شوز.', 'ذوز ار هيز شوز.'),
(3904, 'ايف يو اير هنقري، ايت.', 'ايف يو ار هنقري، ايت.'),
(3933, 'قود جوب. يو اير فاست!', 'قود جوب. يو ار فاست!'),
(806, 'اسك كليرلي: از ذا فلايت ديليد؟ هاو لونق از ذا ديلي؟ وات اير ماي وبشانز؟', 'اسك كليرلي: از ذا فلايت ديليد؟ هاو لونق از ذا ديلي؟ وات ار ماي وبشانز؟'),
(2825, 'سام ليتيرز اير سايلانت, لايك كي ان كني.', 'سام ليتيرز ار سايلانت, لايك كي ان كني.'),
(2761, 'كود اند ود اير مور بالايت ذان كان.', 'كود اند ود ار مور بالايت ذان كان.'),
(3789, 'ذيز كابز اير ديرتي.', 'ذيز كابز ار ديرتي.'),
(2969, 'وير اير يو فروم', 'وير ار يو فروم'),
(1920, 'هاو اير ثينجز', 'هاو ار ثينجز')
) AS v(id, old_tr, new_tr)
WHERE li.id = v.id AND li.translit = v.old_tr;

-- Exercise payloads (full replacement, each verified against its English text):
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "ماي", "ok": false, "tr": "ماي"}, {"t": "كيفك", "ok": true, "tr": "كيفك"}, {"t": "دورة مياه", "ok": false, "tr": "دورة مياه"}], "question": {"ar": "وش معنى \"how are you\"؟", "en": "What does \"how are you\" mean?", "tr": "وات داز \"هاو ار يو\" مين؟"}}'::jsonb WHERE id = 792;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "accept": ["هلا، كيفك؟"], "answer": "هلا، كيفك؟", "source": "Hello, how are you?", "source_tr": "هلو، هاو ار يو؟"}'::jsonb WHERE id = 793;
UPDATE public.lesson_exercises SET payload = '{"right": "There are many people in the market.", "wrong": "There is many people in the market.", "why_ar": "نستخدم ''are'' مع الاسما الجمع.", "why_en": "Use ''are'' with plural nouns.", "right_tr": "ذير ار ماني بيبل ان ذا ماركات.", "wrong_tr": "ذير از ماني بيبل ان ذا ماركات."}'::jsonb WHERE id = 1543;
UPDATE public.lesson_exercises SET payload = '{"hint": null, "type": "choose", "options": [{"t": "You are wrong.", "ok": false, "tr": "يو ار رونج."}, {"t": "I see your point, but I disagree.", "ok": true, "tr": "اي سي يور بوينت, بات اي ديساقري."}, {"t": "No no no.", "ok": false, "tr": "نو نو نو."}], "question": {"ar": "خفف الرفض باسلوب مهذب:", "en": "Soften disagreement politely:", "tr": "سوفتين ديساقريمينت بالايتلي:"}}'::jsonb WHERE id = 734;
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "ذاك", "ok": false, "tr": "ذاك"}, {"t": "انا ممتاز في", "ok": false}, {"t": "وش اخبارك", "ok": true, "tr": "وش اخبارك"}], "question": {"ar": "وش معنى \"how are things\"؟", "en": "What does \"how are things\" mean?", "tr": "وات داز \"هاو ار ثينجز\" مين؟"}}'::jsonb WHERE id = 943;
UPDATE public.lesson_exercises SET payload = '{"ar": "هم ربعي", "hint": {"ar": "ذاي بعدين اير بعدين ماي بعدين فرندز.", "en": "They + are + my + friends."}, "type": "order", "answer": ["They", "are", "my", "friends"], "prompt": {"ar": "رتب: هم ربعي.", "en": "Build: They are my friends.", "tr": "بيلد: ذاي ار ماي فرندز"}, "tokens": ["They", "are", "my", "friends"]}'::jsonb WHERE id = 2259;
UPDATE public.lesson_exercises SET payload = '{"answer": "And a weakness you are working on", "prompt": {"ar": "ونقطه ضعف تشتغل عليها؟", "en": "Build this in English:", "tr": "اند ا ويكنس يو ار ووركنق اون؟"}, "tokens": ["And", "a", "weakness", "you", "are", "working", "on"]}'::jsonb WHERE id = 505;
UPDATE public.lesson_exercises SET payload = '{"mode": "pick", "type": "correct", "right": "She is ready.", "wrong": "She are ready.", "why_ar": "مع هي نستخدم از مو ار.", "why_en": "she takes is, not are.", "right_tr": "شي از ريدي.", "wrong_tr": "شي ار ريدي."}'::jsonb WHERE id = 602;
UPDATE public.lesson_exercises SET payload = '{"hint": null, "type": "choose", "options": [{"t": "How", "ok": false, "tr": "هاو"}, {"t": "Why", "ok": true, "tr": "واي"}, {"t": "Where", "ok": false, "tr": "وير"}], "question": {"ar": "___ تتعلم انجليزي؟ عشان الشغل:", "en": "___ are you learning English? For work:", "tr": "___ ار يو ليرنينج انجلش؟ فور وورك:"}}'::jsonb WHERE id = 752;
UPDATE public.lesson_exercises SET payload = '{"mode": "pick", "type": "correct", "right": "They are happy.", "wrong": "They is happy.", "why_ar": "مع هم نستخدم ار.", "why_en": "they takes are.", "right_tr": "ذي ار هابي.", "wrong_tr": "ذي از هابي."}'::jsonb WHERE id = 619;
UPDATE public.lesson_exercises SET payload = '{"mode": "pick", "type": "correct", "right": "They are waiting.", "wrong": "They is waiting.", "why_ar": "هم معها ار.", "why_en": "plural they pairs with are.", "right_tr": "ذي ار ويتينج.", "wrong_tr": "ذي از ويتينج."}'::jsonb WHERE id = 689;
UPDATE public.lesson_exercises SET payload = '{"mode": "pick", "type": "correct", "right": "My friends are late.", "wrong": "My friends is late.", "why_ar": "فرندز جمع فنستخدم ار.", "why_en": "friends is plural so are.", "right_tr": "ماي فريندز ار ليت.", "wrong_tr": "ماي فريندز از ليت."}'::jsonb WHERE id = 690;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "accept": ["كيفك؟", "كيفك"], "answer": "كيفك؟", "source": "How are you?", "source_tr": "هاو ار يو؟"}'::jsonb WHERE id = 1041;
UPDATE public.lesson_exercises SET payload = '{"mode": "pick", "right": "She is smart.", "wrong": "She are smart.", "why_ar": "مع هي نستخدم از مو ار.", "why_en": "she takes is, not are.", "right_tr": "شي از سمارت.", "wrong_tr": "شي ار سمارت."}'::jsonb WHERE id = 1140;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "جمع قريب these.", "en": "Many near things are these."}, "type": "choose", "options": [{"t": "These", "ok": true, "tr": "ذيز"}, {"t": "This", "ok": false, "tr": "ذيس"}, {"t": "Those", "ok": false, "tr": "ذوز"}], "question": {"ar": "كتبي كلها قدامك على الطاوله: ___ are my books.", "en": "All your books are on the table: ___ are my books.", "tr": "ول يور بوكس ار اون ذا تيبل: ار ماي بوكس."}}'::jsonb WHERE id = 2265;
UPDATE public.lesson_exercises SET payload = '{"answer": "How are you?", "prompt": {"ar": "كيفك؟", "en": "كيفك؟", "tr": "هاو ار يو؟"}, "tokens": ["How", "are", "you?"]}'::jsonb WHERE id = 862;
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "I disagree, I see it differently.", "ok": true, "tr": "اي ديساقري, اي سي ات ديفيرينتلي."}, {"t": "You are wrong, period.", "ok": false, "tr": "يو ار رونج, بيرياد."}, {"t": "No, no, no.", "ok": false, "tr": "نو, نو, نو."}], "question": {"ar": "كيف تخالف شخصا بادب؟", "en": "How do you disagree politely?", "tr": "كيف تخالف شخصا بادب؟، هاو دو يو ديساقري بالايتلي؟"}}'::jsonb WHERE id = 356;
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "I am sorry to bother you.", "ok": true, "tr": "اي ام سوري تو باذر يو."}, {"t": "You are bothered.", "ok": false, "tr": "يو ار باثيريد."}, {"t": "Sorry you.", "ok": false, "tr": "سوري يو."}], "question": {"ar": "كيف تعتذر عن الازعاج؟", "en": "How do you apologize for bothering someone?", "tr": "كيف تعتذر عن الازعاج؟، هاو دو يو ابولوجيز فور باذيرينج ساموان؟"}}'::jsonb WHERE id = 400;
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "It is fine, do not worry", "ok": true, "tr": "ات از فاين, دو نوت ووري"}, {"t": "There are no problems at all", "ok": false, "tr": "ذير ار نو بروبلامز ات اول"}, {"t": "I am worried", "ok": false, "tr": "اي ام ووريد"}], "question": {"ar": "وش معنى \"No worries\"؟", "en": "\"No worries\" means:", "tr": "وش معنى \"نو ووريز\"؟، \"نو ووريز\" مينز:"}}'::jsonb WHERE id = 364;
UPDATE public.lesson_exercises SET payload = '{"ar": "كيفك اليوم", "hint": {"ar": "هاو اول شي.", "en": "How first."}, "type": "order", "answer": ["How", "are", "you", "today"], "prompt": {"ar": "رتب: كيفك اليوم؟", "en": "Build: How are you today?", "tr": "بيلد ات: هاو ار يو توداي"}, "tokens": ["How", "are", "you", "today"]}'::jsonb WHERE id = 1311;
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "May I ask who is calling?", "ok": true, "tr": "مي اي اسك هو از كولينج؟"}, {"t": "Who are you?", "ok": false, "tr": "هو ار يو؟"}, {"t": "You who?", "ok": false, "tr": "يو هو؟"}], "question": {"ar": "تسال مع من تتكلم:", "en": "You ask who is calling:", "tr": "تسال مع من تتكلم:، يو اسك هو از كولينج:"}}'::jsonb WHERE id = 484;
UPDATE public.lesson_exercises SET payload = '{"ar": "كيفك", "hint": {"ar": "هاو بعدين اير بعدين يو.", "en": "How + are + you."}, "type": "order", "answer": ["How", "are", "you"], "prompt": {"ar": "رتب: كيفك؟", "en": "Build: How are you?", "tr": "بيلد ات: هاو ار يو"}, "tokens": ["How", "are", "you"]}'::jsonb WHERE id = 1393;
UPDATE public.lesson_exercises SET payload = '{"ar": "هذي كتبي", "hint": null, "type": "order", "answer": ["These", "are", "my", "books"], "prompt": {"ar": "رتب: هذي كتبي.", "en": "Build it: These are my books.", "tr": "ذيز ار ماي بوكس"}, "tokens": ["These", "are", "my", "books"]}'::jsonb WHERE id = 695;
UPDATE public.lesson_exercises SET payload = '{"ar": "هم متاخرين", "hint": null, "type": "order", "answer": ["They", "are", "late"], "prompt": {"ar": "رتب: تاخروا.", "en": "Build it: They are late.", "tr": "ذي ار ليت"}, "tokens": ["They", "are", "late"]}'::jsonb WHERE id = 604;
UPDATE public.lesson_exercises SET payload = '{"answer": "Where are you from?", "prompt": {"ar": "رتب: من وين انت؟", "en": "Build: where are you from?", "tr": "بيلد: وير ار يو فروم؟"}, "tokens": ["Where", "are", "you", "from", "?"]}'::jsonb WHERE id = 1554;
UPDATE public.lesson_exercises SET payload = '{"ar": "ليش تاخرت", "hint": {"ar": "واي بعدين اير بعدين يو بعدين الصفة.", "en": "Why + are + you + adjective."}, "type": "order", "answer": ["Why", "are", "you", "late"], "prompt": {"ar": "رتب: ليش تاخرت؟", "en": "Build: Why are you late?", "tr": "بيلد ات: واي ار يو ليت"}, "tokens": ["Why", "are", "you", "late"]}'::jsonb WHERE id = 1396;
UPDATE public.lesson_exercises SET payload = '{"hint": null, "type": "choose", "options": [{"t": "I am fine, thank you.", "ok": true, "tr": "اي ام فاين, ثانك يو."}, {"t": "You are fine.", "ok": false, "tr": "يو ار فاين."}, {"t": "Fine are you?", "ok": false, "tr": "فاين ار يو؟"}], "question": {"ar": "احد يقول كيفك؟ تجاوب:", "en": "Someone says How are you? You answer:", "tr": "ساموان سيز هاو ار يو؟ يو انسر:"}}'::jsonb WHERE id = 705;
UPDATE public.lesson_exercises SET payload = '{"type": "choose", "options": [{"t": "26", "ok": true}, {"t": "28", "ok": false}, {"t": "32", "ok": false}], "question": {"ar": "كم عدد الحروف الانجليزيه؟", "en": "How many letters are in the English alphabet?", "tr": "هاو ماني ليتيرز ار ان ذا انجلش الفابيت؟"}}'::jsonb WHERE id = 307;
UPDATE public.lesson_exercises SET payload = '{"mode": "pick", "type": "correct", "right": "There are many cars.", "wrong": "There is many cars.", "why_ar": "مع مني نستخدم ار.", "why_en": "many needs are.", "right_tr": "ذير ار ماني كارز.", "wrong_tr": "ذير از ماني كارز."}'::jsonb WHERE id = 696;
UPDATE public.lesson_exercises SET payload = '{"mode": "pick", "type": "correct", "right": "You and I are friends.", "wrong": "you and i are friends.", "why_ar": "ضمير اي كبير حتى وسط الجمله.", "why_en": "I stays capital anywhere in the sentence.", "right_tr": "يو اند اي ار فريندز.", "wrong_tr": "يو اند اي ار فريندز."}'::jsonb WHERE id = 693;
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "What I meant was...", "ok": true, "tr": "وات اي مينت واز..."}, {"t": "You are wrong!", "ok": false, "tr": "يو ار رونج!"}, {"t": "I already said that!", "ok": false, "tr": "اي ولريدي سيد ذات!"}], "question": {"ar": "احد فهمك غلط. وش تقول؟", "en": "Someone misunderstood you.", "tr": "احد فهمك غلط، وش تقول؟، ساموان ميسانديرستود يو, يو سي:"}}'::jsonb WHERE id = 363;
UPDATE public.lesson_exercises SET payload = '{"answer": "Hello! How are you today?", "prompt": {"ar": "هلا! كيفك اليوم؟", "en": "هلا! كيفك اليوم؟", "tr": "هلو! هاو ار يو توداي؟"}, "tokens": ["Hello!", "How", "are", "you", "today?"]}'::jsonb WHERE id = 794;
UPDATE public.lesson_exercises SET payload = '{"answer": "Hello, who are you?", "prompt": {"ar": "هلا، من انت؟", "en": "هلا، من انت؟", "tr": "هلو، هو ار يو؟"}, "tokens": ["Hello,", "who", "are", "you?"]}'::jsonb WHERE id = 867;
UPDATE public.lesson_exercises SET payload = '{"answer": "There are three apples.", "prompt": {"ar": "فيه ثلاث تفاحات.", "en": "There are three apples.", "tr": "ذر ار ثري ابلز."}, "tokens": ["There", "are", "three", "apples."]}'::jsonb WHERE id = 1075;
UPDATE public.lesson_exercises SET payload = '{"ar": "ذولك جزمته", "hint": {"ar": "ذوز بعدين اير بعدين هيز بعدين شوز.", "en": "Those + are + his + shoes."}, "type": "order", "answer": ["Those", "are", "his", "shoes"], "prompt": {"ar": "رتب: ذولك جزمته.", "en": "Build: Those are his shoes.", "tr": "بيلد: ذوز ار هيز شوز"}, "tokens": ["Those", "are", "his", "shoes"]}'::jsonb WHERE id = 2268;
UPDATE public.lesson_exercises SET payload = '{"ar": "العيال برا", "hint": {"ar": "ذا بعدين كيدز بعدين اير بعدين اوتسايد.", "en": "The + kids + are + outside."}, "type": "order", "answer": ["The", "kids", "are", "outside"], "prompt": {"ar": "رتب: العيال برا.", "en": "Build: The kids are outside.", "tr": "بيلد: ذا كيدز ار اوتسايد"}, "tokens": ["The", "kids", "are", "outside"]}'::jsonb WHERE id = 2308;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "ابغيه الحين want.", "en": "Want means need it now."}, "type": "choose", "options": [{"t": "want", "ok": true, "tr": "وانت"}, {"t": "like", "ok": false, "tr": "لايك"}, {"t": "love", "ok": false, "tr": "لاف"}], "question": {"ar": "عطشان وتبغى ماي الحين: I ___ water.", "en": "You are thirsty now: I ___ water.", "tr": "يو ار ثيرستي ناو: اي ووتر."}}'::jsonb WHERE id = 2377;
UPDATE public.lesson_exercises SET payload = '{"mode": "pick", "right": "The street is crowded.", "wrong": "The street are crowded.", "why_ar": "المفرد نستخدم معه از.", "why_en": "singular subject takes is.", "right_tr": "ذا ستريت از كراوداد.", "wrong_tr": "ذا ستريت ار كراوداد."}'::jsonb WHERE id = 1144;
UPDATE public.lesson_exercises SET payload = '{"ar": "هلا كيفك", "hint": {"ar": "السلام اول شي وبعدين السوال.", "en": "Greeting first, then the question."}, "type": "order", "answer": ["Hello", "how", "are", "you"], "prompt": {"ar": "رتب: هلو، كيفك؟", "en": "Build: Hello, how are you?", "tr": "بيلد ات: هلو هاو ار يو"}, "tokens": ["Hello", "how", "are", "you"]}'::jsonb WHERE id = 1302;
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "This is too small, I would like to return it.", "ok": true, "tr": "ذيس از تو سمول, اي وود لايك تو ريتيرن ات."}, {"t": "I want return.", "ok": false, "tr": "اي وانت ريتيرن."}, {"t": "This small, return.", "ok": false, "tr": "ذيس سمول, ريتيرن."}], "question": {"ar": "تشرح سبب الاسترجاع:", "en": "You explain why you are returning:", "tr": "تشرح سبب الاسترجاع:، يو اكسبلين واي يو ار ريتيرنينج:"}}'::jsonb WHERE id = 451;
UPDATE public.lesson_exercises SET payload = '{"answer": "How are things?", "prompt": {"ar": "وش اخبارك؟", "en": "وش اخبارك؟", "tr": "هاو ار ثينقز؟"}, "tokens": ["How", "are", "things?"]}'::jsonb WHERE id = 947;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "واي تسال عن السبب.", "en": "Why asks for a reason."}, "type": "choose", "options": [{"t": "Why", "ok": true, "tr": "واي"}, {"t": "Where", "ok": false, "tr": "وير"}, {"t": "When", "ok": false, "tr": "وين"}], "question": {"ar": "___ تاخرت؟", "en": "___ are you late?", "tr": "___ ار يو ليت؟"}}'::jsonb WHERE id = 1395;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "جمع بعيد معه دوز.", "en": "far plural = those."}, "type": "choose", "options": [{"t": "These", "ok": false, "tr": "ذيز"}, {"t": "Those", "ok": true, "tr": "ذوز"}, {"t": "That", "ok": false, "tr": "ذات"}, {"t": "This", "ok": false, "tr": "ذات"}], "question": {"ar": "___ الجزمه هناك تبعي.", "en": "___ shoes over there are mine.", "tr": "___ شوز وڤر ذير ار ماين."}}'::jsonb WHERE id = 694;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "اول الجملة They.", "en": "The sentence starts with They."}, "type": "choose", "options": [{"t": "They", "ok": true, "tr": "ذاي"}, {"t": "Them", "ok": false, "tr": "ذيم"}, {"t": "Their", "ok": false, "tr": "ذير"}], "question": {"ar": "ربعك واقفين هناك، تبدا عنهم ب: ___", "en": "Your friends are there. You start with: ___", "tr": "يور فرندز ار ذير. يو ستارت ويذ:"}}'::jsonb WHERE id = 2256;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "البعيد those.", "en": "Far things are those. Abha has beautiful mountains."}, "type": "choose", "options": [{"t": "Those", "ok": true, "tr": "ذوز"}, {"t": "This", "ok": false, "tr": "ذيس"}, {"t": "These", "ok": false, "tr": "ذيز"}], "question": {"ar": "الجبال بعيده عنك، تقول: ___ are far.", "en": "The far mountains: ___ are far.", "tr": "ذا فار ماونتنز: ار فار."}}'::jsonb WHERE id = 2266;
UPDATE public.lesson_exercises SET payload = '{"ar": "فيه كرسيين", "hint": null, "type": "order", "answer": ["There", "are", "two", "chairs"], "prompt": {"ar": "رتب: فيه كرسيين.", "en": "Build it: There are two chairs.", "tr": "ذير ار تو تشيرز"}, "tokens": ["There", "are", "two", "chairs"]}'::jsonb WHERE id = 697;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "الشرط يبدا ب if.", "en": "A condition starts with if."}, "type": "choose", "options": [{"t": "If", "ok": true, "tr": "ايف"}, {"t": "Will", "ok": false, "tr": "ويل"}, {"t": "Go", "ok": false, "tr": "قو"}], "question": {"ar": "تبدا الجمله الشرطيه: ___ you are hungry, eat.", "en": "Complete the condition: ___ you are hungry, eat.", "tr": "كمبليت ذا كانديشن: يو ار هنقري، ايت."}}'::jsonb WHERE id = 2362;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "اختار الاجابه الصح.", "en": "Choose the correct answer."}, "options": [{"t": "Two weeks in advance", "ok": true, "tr": "تو ويكس ان ادڤانس"}, {"t": "On the day", "ok": false, "tr": "اون ذا دي"}, {"t": "At the gate", "ok": false, "tr": "ات ذا قيت"}, {"t": "In summer", "ok": false, "tr": "ان سامر"}], "question": {"ar": "التذاكر ارخص لما تحجز قبلها اسبوعين على الاقل. متى التذاكر تكون ارخص؟", "en": "Tickets are cheaper when you book at least two weeks in advance. When are tickets cheaper?", "tr": "تيكاتس ار تشيبر وين يو بوك ات ليست تو ويكس ان ادڤانس. وين ار تيكاتس تشيبر؟"}}'::jsonb WHERE id = 1530;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "اختار الفكرة الرايسيه.", "en": "Choose the main idea."}, "options": [{"t": "Metro lines reduce traffic", "ok": true, "tr": "ميترو لاينز رادوس ترافيك"}, {"t": "Cities are noisy", "ok": false, "tr": "سيتيز ار نويسي"}, {"t": "Traffic is bad", "ok": false, "tr": "ترافيك از باد"}, {"t": "Metro lines are old", "ok": false, "tr": "ميترو لاينز ار اولد"}], "question": {"ar": "الفقره تصف كيف تقلل المدن الزحمه بانشا خطوط المترو. وش الفكره الرايسيه؟", "en": "The paragraph describes how cities reduce traffic by building metro lines. What is the main idea?", "tr": "ذا باراقراف ديسكرايبز هاو سيتيز رادوس ترافيك باي بيلدينج ميترو لاينز. وات از ذا مين ايديا؟"}}'::jsonb WHERE id = 1537;
UPDATE public.lesson_exercises SET payload = '{"hint": {"ar": "ترفعها من الارض pick up.", "en": "Lift from the floor is pick up."}, "type": "choose", "options": [{"t": "Pick up", "ok": true, "tr": "بيك اب"}, {"t": "Drop", "ok": false, "tr": "دروب"}, {"t": "Carry", "ok": false, "tr": "كاري"}], "question": {"ar": "جزمتك على الارض وامك زعلانه: ___ your shoes.", "en": "Your shoes are on the floor: ___ your shoes.", "tr": "يور شوز ار اون ذا فلور: يور شوز."}}'::jsonb WHERE id = 2338;
UPDATE public.lesson_exercises SET payload = '{"ar": "هم هناك", "hint": {"ar": "الفاعل بعدين الفعل بعدين المكان.", "en": "Subject then verb then place."}, "type": "order", "answer": ["They", "are", "over", "there"], "prompt": {"ar": "رتب: هم هناك.", "en": "Build: They are over there.", "tr": "بيلد: ذي ار اوفر ذير."}, "tokens": ["They", "are", "over", "there"]}'::jsonb WHERE id = 2495;
UPDATE public.lesson_exercises SET payload = '{"ar": "كيفك اليوم؟", "hint": null, "type": "order", "answer": ["How", "are", "you", "today"], "prompt": {"ar": "رتب بالانجليزي:", "en": "Build this in English:", "tr": "هاو ار يو توداي؟"}, "tokens": ["How", "are", "you", "today"]}'::jsonb WHERE id = 753;

DO $$
DECLARE bad int;
BEGIN
  SELECT count(*) INTO bad FROM public.lesson_items
  WHERE translit ~ '(^|[ ,.?!:/])اير([ ,.?!:/]|$)' AND en ~* 'are';
  IF bad > 0 THEN
    RAISE EXCEPTION 'migration 202610090003: % standalone اير for are remains', bad;
  END IF;
  IF EXISTS (SELECT 1 FROM public.lesson_items WHERE translit LIKE '%آر يو%') THEN
    RAISE EXCEPTION 'migration 202610090003: آر variant still present';
  END IF;
END $$;