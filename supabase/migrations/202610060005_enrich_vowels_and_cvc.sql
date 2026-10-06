-- Fix sort_order for a0-spelling-sounds academy (permanent record of manual fix)
-- AND enrich vowels lesson with real vowel SOUND teaching
-- AND enrich CVC lessons with blending drills

-- 1. Fix sort_order permanently
UPDATE academy_lessons SET sort_order = 0 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'a0ss-alphabet';
UPDATE academy_lessons SET sort_order = 1 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'a0ss-letter-sounds';
UPDATE academy_lessons SET sort_order = 2 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'a0ss-vowels';
UPDATE academy_lessons SET sort_order = 3 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'spell-cvc-at';
UPDATE academy_lessons SET sort_order = 4 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'spell-cvc-ig-og';
UPDATE academy_lessons SET sort_order = 5 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'a0ss-sh-ch';
UPDATE academy_lessons SET sort_order = 6 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'a0ss-th-sound';
UPDATE academy_lessons SET sort_order = 7 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'spell-digraph-th';
UPDATE academy_lessons SET sort_order = 8 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'a0ss-silent-letters';
UPDATE academy_lessons SET sort_order = 9 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'spell-silent-e';
UPDATE academy_lessons SET sort_order = 10 WHERE academy_id = 'a0-spelling-sounds' AND lesson_id = 'spell-plurals';

-- 2. Rebuild a0ss-vowels lesson: teach actual vowel SOUNDS not just letter names
-- Clear existing thin items and rebuild
DELETE FROM lesson_items WHERE lesson_id = 'a0ss-vowels';

INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES
-- Key concept
('a0ss-vowels', 0, 'explain', 'Five letters are vowels: A E I O U. They make different sounds in different words.',
 'خمسه حروف متحركه: A E I O U. كل حرف له اكثر من صوت حسب الكلمه. اسم الحرف شي وصوته شي ثاني.',
 'فايف ليترز اير ڤاولز: اي اي اي او يو. ذي ميك ديفيرانت صاوندز ان ديفيرانت وردز.', null, null, null),

-- Short a sound
('a0ss-vowels', 1, 'word', 'a says ah', 'صوت a القصير: آ', 'آ',
 'a says ah. Like in apple and cat.', 'صوت a هو آ. مثل تفاحه وقطه.', 'اي سايز آ. لايك ان ابل اند كات.'),
('a0ss-vowels', 2, 'word', 'cat', 'قطه', 'كات',
 'The a in cat says ah.', 'حرف a في cat صوته آ.', 'ذا اي ان كات سايز آ.'),
('a0ss-vowels', 3, 'word', 'hat', 'قبعه', 'هات',
 'The a in hat says ah.', 'حرف a في hat صوته آ.', 'ذا اي ان هات سايز آ.'),
('a0ss-vowels', 4, 'word', 'bat', 'خفاش', 'بات',
 'The a in bat says ah.', 'حرف a في bat صوته آ.', 'ذا اي ان بات سايز آ.'),

-- Short e sound
('a0ss-vowels', 5, 'word', 'e says eh', 'صوت e القصير: اِي', 'اِي',
 'e says eh. Like in egg and bed.', 'صوت e هو اِي. مثل البيضه والسرير.', 'اي سايز اِي. لايك ان اق اند بيد.'),
('a0ss-vowels', 6, 'word', 'egg', 'بيضه', 'اق',
 'The e in egg says eh.', 'حرف e في egg صوته اِي.', 'ذا اي ان اق سايز اِي.'),
('a0ss-vowels', 7, 'word', 'bed', 'سرير', 'بيد',
 'The e in bed says eh.', 'حرف e في bed صوته اِي.', 'ذا اي ان بيد سايز اِي.'),
('a0ss-vowels', 8, 'word', 'red', 'احمر', 'ريد',
 'The e in red says eh.', 'حرف e في red صوته اِي.', 'ذا اي ان ريد سايز اِي.'),

-- Short i sound
('a0ss-vowels', 9, 'word', 'i says ih', 'صوت i القصير: اِ', 'اِ',
 'i says ih. Like in ink and sit.', 'صوت i هو اِ. مثل الحبر واقعد.', 'اي سايز اِ. لايك ان انك اند سيت.'),
('a0ss-vowels', 10, 'word', 'ink', 'حبر', 'انك',
 'The i in ink says ih.', 'حرف i في ink صوته اِ.', 'ذا اي ان انك سايز اِ.'),
('a0ss-vowels', 11, 'word', 'sit', 'اقعد', 'سيت',
 'The i in sit says ih.', 'حرف i في sit صوته اِ.', 'ذا اي ان سيت سايز اِ.'),
('a0ss-vowels', 12, 'word', 'big', 'كبير', 'بيق',
 'The i in big says ih.', 'حرف i في big صوته اِ.', 'ذا اي ان بيق سايز اِ.'),

-- Short o sound
('a0ss-vowels', 13, 'word', 'o says ah', 'صوت o القصير: آ', 'آ',
 'o says ah. Like in orange and hot.', 'صوت o هو آ. مثل البرتقال وحار.', 'او سايز آ. لايك ان اورنج اند هات.'),
('a0ss-vowels', 14, 'word', 'hot', 'حار', 'هات',
 'The o in hot says ah.', 'حرف o في hot صوته آ.', 'ذا او ان هات سايز آ.'),
('a0ss-vowels', 15, 'word', 'dog', 'كلب', 'دوق',
 'The o in dog says ah.', 'حرف o في dog صوته آ.', 'ذا او ان دوق سايز آ.'),
('a0ss-vowels', 16, 'word', 'box', 'صندوق', 'بوكس',
 'The o in box says ah.', 'حرف o في box صوته آ.', 'ذا او ان بوكس سايز آ.'),

-- Short u sound
('a0ss-vowels', 17, 'word', 'u says uh', 'صوت u القصير: اَ', 'اَ',
 'u says uh. Like in up and cup.', 'صوت u هو اَ. مثل فوق وكوب.', 'يو سايز اَ. لايك ان اب اند كاب.'),
('a0ss-vowels', 18, 'word', 'up', 'فوق', 'اب',
 'The u in up says uh.', 'حرف u في up صوته اَ.', 'ذا يو ان اب سايز اَ.'),
('a0ss-vowels', 19, 'word', 'cup', 'كوب', 'كاب',
 'The u in cup says uh.', 'حرف u في cup صوته اَ.', 'ذا يو ان كاب سايز اَ.'),
('a0ss-vowels', 20, 'word', 'sun', 'شمس', 'سن',
 'The u in sun says uh.', 'حرف u في sun صوته اَ.', 'ذا يو ان سن سايز اَ.'),

-- Sentences using vowel sounds
('a0ss-vowels', 21, 'sentence', 'The cat is on the bed.', 'القطه على السرير.', 'ذا كات از اون ذا بيد.', null, null, null),
('a0ss-vowels', 22, 'sentence', 'The dog is hot.', 'الكلب حار.', 'ذا دوق از هات.', null, null, null),
('a0ss-vowels', 23, 'sentence', 'I sit in the sun.', 'اقعد بالشمس.', 'اي سيت ان ذا سن.', null, null, null),
('a0ss-vowels', 24, 'sentence', 'The cup is up.', 'الكوب فوق.', 'ذا كاب از اب.', null, null, null),
('a0ss-vowels', 25, 'sentence', 'The bat is big.', 'الخفاش كبير.', 'ذا بات از بيق.', null, null, null),

-- Summary
('a0ss-vowels', 26, 'explain', 'Vowels are the heart of every word. Without vowels there are no words.',
 'الحروف المتحركه هي قلب كل كلمه. بدونها ما فيه كلمات. كل كلمه انجليزيه لازم فيها حرف متحرك على الاقل.',
 'ڤاولز اير ذا هارت اوف افري ورد. ويذ آوت ڤاولز ذير اير نو وردز.', null, null, null);

-- Clear and rebuild vowels exercises
DELETE FROM lesson_exercises WHERE lesson_id = 'a0ss-vowels';

INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
-- Choose: which vowel makes this sound?
('a0ss-vowels', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته آ مثل cat؟","en":"Which vowel says ah like in cat?","tr":"ويتش ڤاول سايز آ لايك ان كات؟"},"options":[{"t":"a","ok":true,"tr":"آ"},{"t":"e","ok":false,"tr":"اِي"},{"t":"i","ok":false,"tr":"اِ"}],"hint":{"ar":"a يقول آ مثل تفاحه.","en":"a says ah like in apple."}}'),
('a0ss-vowels', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته اِي مثل egg؟","en":"Which vowel says eh like in egg?","tr":"ويتش ڤاول سايز اِي لايك ان اق؟"},"options":[{"t":"e","ok":true,"tr":"اِي"},{"t":"a","ok":false,"tr":"آ"},{"t":"o","ok":false,"tr":"آ"}],"hint":{"ar":"e يقول اِي مثل البيضه.","en":"e says eh like in egg."}}'),
('a0ss-vowels', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته اِ مثل ink؟","en":"Which vowel says ih like in ink?","tr":"ويتش ڤاول سايز اِ لايك ان انك؟"},"options":[{"t":"i","ok":true,"tr":"اِ"},{"t":"e","ok":false,"tr":"اِي"},{"t":"a","ok":false,"tr":"آ"}],"hint":{"ar":"i يقول اِ مثل الحبر.","en":"i says ih like in ink."}}'),
('a0ss-vowels', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته آ مثل hot؟","en":"Which vowel says ah like in hot?","tr":"ويتش ڤاول سايز آ لايك ان هات؟"},"options":[{"t":"o","ok":true,"tr":"آ"},{"t":"u","ok":false,"tr":"اَ"},{"t":"a","ok":false,"tr":"آ"}],"hint":{"ar":"o يقول آ مثل حار. نفس صوت a بس بحرف مختلف.","en":"o says ah like in hot. Same sound as a but different letter."}}'),
('a0ss-vowels', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته اَ مثل up؟","en":"Which vowel says uh like in up?","tr":"ويتش ڤاول سايز اَ لايك ان اب؟"},"options":[{"t":"u","ok":true,"tr":"اَ"},{"t":"o","ok":false,"tr":"آ"},{"t":"i","ok":false,"tr":"اِ"}],"hint":{"ar":"u يقول اَ مثل فوق.","en":"u says uh like in up."}}'),

-- Choose: which word has the same vowel sound?
('a0ss-vowels', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها نفس صوت a مثل cat؟","en":"Which word has the same a sound as cat?","tr":"ويتش ورد هز ذا سايم اي صاوند از كات؟"},"options":[{"t":"hat","ok":true,"tr":"هات"},{"t":"egg","ok":false,"tr":"اق"},{"t":"ink","ok":false,"tr":"انك"}],"hint":{"ar":"cat و hat نفس الصوت: آ.","en":"cat and hat have the same sound: ah."}}'),
('a0ss-vowels', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها نفس صوت e مثل bed؟","en":"Which word has the same e sound as bed?","tr":"ويتش ورد هز ذا سايم اي صاوند از بيد؟"},"options":[{"t":"red","ok":true,"tr":"ريد"},{"t":"dog","ok":false,"tr":"دوق"},{"t":"cup","ok":false,"tr":"كاب"}],"hint":{"ar":"bed و red نفس الصوت: اِي.","en":"bed and red have the same sound: eh."}}'),
('a0ss-vowels', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها نفس صوت o مثل dog؟","en":"Which word has the same o sound as dog?","tr":"ويتش ورد هز ذا سايم او صاوند از دوق؟"},"options":[{"t":"hot","ok":true,"tr":"هات"},{"t":"sit","ok":false,"tr":"سيت"},{"t":"cup","ok":false,"tr":"كاب"}],"hint":{"ar":"dog و hot نفس الصوت: آ.","en":"dog and hot have the same sound: ah."}}'),

-- Order: build sentences with vowel words
('a0ss-vowels', 'order', '{"type":"order","ar":"القطه على السرير","prompt":{"ar":"رتب: القطه على السرير.","en":"Build: The cat is on the bed.","tr":"بيلد: ذا كات از اون ذا بيد."},"answer":["The","cat","is","on","the","bed"],"tokens":["The","cat","is","on","the","bed"],"hint":{"ar":"الفاعل بعدين الفعل بعدين المكان.","en":"Subject then verb then place."}}'),
('a0ss-vowels', 'order', '{"type":"order","ar":"الكلب حار","prompt":{"ar":"رتب: الكلب حار.","en":"Build: The dog is hot.","tr":"بيلد: ذا دوق از هات."},"answer":["The","dog","is","hot"],"tokens":["The","dog","is","hot"],"hint":{"ar":"الفاعل بعدين الفعل بعدين الصفه.","en":"Subject then verb then adjective."}}'),

-- Spell: CVC words with short vowels
('a0ss-vowels', 'spell', '{"type":"spell","answer":"CAT","display":"C A T","meaning":"قطه","translit":"كات","options":[{"t":"C","ok":true},{"t":"A","ok":true},{"t":"T","ok":true},{"t":"E","ok":false}]}'),
('a0ss-vowels', 'spell', '{"type":"spell","answer":"BED","display":"B E D","meaning":"سرير","translit":"بيد","options":[{"t":"B","ok":true},{"t":"E","ok":true},{"t":"D","ok":true},{"t":"A","ok":false}]}'),
('a0ss-vowels', 'spell', '{"type":"spell","answer":"DOG","display":"D O G","meaning":"كلب","translit":"دوق","options":[{"t":"D","ok":true},{"t":"O","ok":true},{"t":"G","ok":true},{"t":"U","ok":false}]}'),
('a0ss-vowels', 'spell', '{"type":"spell","answer":"SUN","display":"S U N","meaning":"شمس","translit":"سن","options":[{"t":"S","ok":true},{"t":"U","ok":true},{"t":"N","ok":true},{"t":"O","ok":false}]}'),
('a0ss-vowels', 'spell', '{"type":"spell","answer":"HAT","display":"H A T","meaning":"قبعه","translit":"هات","options":[{"t":"H","ok":true},{"t":"A","ok":true},{"t":"T","ok":true},{"t":"I","ok":false}]}'),

-- Translate
('a0ss-vowels', 'translate', '{"type":"translate","dir":"en-ar","source":"a says ah.","accept":["صوت a هو آ","اي سايز آ"],"answer":"صوت a هو آ"}'),
('a0ss-vowels', 'translate', '{"type":"translate","dir":"en-ar","source":"e says eh.","accept":["صوت e هو اِي","اي سايز اِي"],"answer":"صوت e هو اِي"}');

-- 3. Enrich spell-cvc-at: add more words and blending explanation
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES
('spell-cvc-at', 4, 'word', 'rat', 'فار', 'رات',
 'c-a-t makes cat. r-a-t makes rat.', 'ك-ا-ت تصير cat. ر-ا-ت تصير rat.', 'سي اي تي ميك كات. ار اي تي ميك رات.'),
('spell-cvc-at', 5, 'word', 'mat', 'حصير', 'مات',
 'm-a-t makes mat.', 'م-ا-ت تصير mat.', 'ام اي تي ميك مات.'),
('spell-cvc-at', 6, 'explain', 'C-A-T: say each sound, then say them fast: cat.',
 'ك-ا-ت: انطق كل صوت لحاله، بعدين قلهم بسرعه: cat. هذي الطريقه تتعلم بيها تقرا اي كلمه.',
 'سي اي تي: سي ايتش ساوند, ذين سي ذيم فاست: كات.', null, null, null),
('spell-cvc-at', 7, 'sentence', 'The cat sat on the mat.', 'القطه جلست على الحصير.', 'ذا كات سات اون ذا مات.', null, null, null),
('spell-cvc-at', 8, 'sentence', 'The bat and the rat.', 'الخفاش والفار.', 'ذا بات اند ذا رات.', null, null, null);

INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
('spell-cvc-at', 'choose', '{"type":"choose","question":{"ar":"اي كلمه تقدر تسويها من م-ا-ت؟","en":"Which word can you make from m-a-t?","tr":"ويتش ورد كان يو ميك فروم ام اي تي؟"},"options":[{"t":"mat","ok":true,"tr":"مات"},{"t":"cat","ok":false,"tr":"كات"},{"t":"dog","ok":false,"tr":"دوق"}],"hint":{"ar":"م + آ + ت = mat.","en":"m + ah + t = mat."}}'),
('spell-cvc-at', 'spell', '{"type":"spell","answer":"RAT","display":"R A T","meaning":"فار","translit":"رات","options":[{"t":"R","ok":true},{"t":"A","ok":true},{"t":"T","ok":true},{"t":"E","ok":false}]}'),
('spell-cvc-at', 'spell', '{"type":"spell","answer":"MAT","display":"M A T","meaning":"حصير","translit":"مات","options":[{"t":"M","ok":true},{"t":"A","ok":true},{"t":"T","ok":true},{"t":"O","ok":false}]}'),
('spell-cvc-at', 'order', '{"type":"order","ar":"القطه جلست على الحصير","prompt":{"ar":"رتب: القطه جلست على الحصير.","en":"Build: The cat sat on the mat.","tr":"بيلد: ذا كات سات اون ذا مات."},"answer":["The","cat","sat","on","the","mat"],"tokens":["The","cat","sat","on","the","mat"],"hint":{"ar":"الفاعل بعدين الفعل بعدين المكان.","en":"Subject then verb then place."}}');

-- 4. Enrich spell-cvc-ig-og: add more words and blending
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES
('spell-cvc-ig-og', 4, 'word', 'dig', 'احفر', 'ديق',
 'd-i-g makes dig.', 'د-اِ-ق تصير dig.', 'دي اي قي ميك ديِق.'),
('spell-cvc-ig-og', 5, 'word', 'log', 'خشبه', 'لوق',
 'l-o-g makes log.', 'ل-آ-ق تصير log.', 'ال او قي ميك لوق.'),
('spell-cvc-ig-og', 6, 'explain', 'Short i and short o sound different: pig vs dog.',
 'صوت i القصير و o القصير يختلفون: pig فيها اِ و dog فيها آ. اسمع الفرق.',
 'شورت اي اند شورت او ساوند ديفيرانت: بيِق ڤس دوق.', null, null, null),
('spell-cvc-ig-og', 7, 'sentence', 'The pig is big.', 'الخنزير كبير.', 'ذا بيِق از بيق.', null, null, null),
('spell-cvc-ig-og', 8, 'sentence', 'The dog dug a log.', 'الكلب حفر خشبه.', 'ذا دوق داق ا لوق.', null, null, null);

INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
('spell-cvc-ig-og', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها صوت i القصير؟","en":"Which word has the short i sound?","tr":"ويتش ورد هز ذا شورت اي صاوند؟"},"options":[{"t":"pig","ok":true,"tr":"بيِق"},{"t":"dog","ok":false,"tr":"دوق"},{"t":"log","ok":false,"tr":"لوق"}],"hint":{"ar":"pig فيها صوت i: اِ.","en":"pig has the short i sound: ih."}}'),
('spell-cvc-ig-og', 'spell', '{"type":"spell","answer":"DIG","display":"D I G","meaning":"احفر","translit":"ديِق","options":[{"t":"D","ok":true},{"t":"I","ok":true},{"t":"G","ok":true},{"t":"O","ok":false}]}'),
('spell-cvc-ig-og', 'spell', '{"type":"spell","answer":"LOG","display":"L O G","meaning":"خشبه","translit":"لوق","options":[{"t":"L","ok":true},{"t":"O","ok":true},{"t":"G","ok":true},{"t":"I","ok":false}]}'),
('spell-cvc-ig-og', 'order', '{"type":"order","ar":"الخنزير كبير","prompt":{"ar":"رتب: الخنزير كبير.","en":"Build: The pig is big.","tr":"بيلد: ذا بيِق از بيق."},"answer":["The","pig","is","big"],"tokens":["The","pig","is","big"],"hint":{"ar":"الفاعل بعدين الفعل بعدين الصفه.","en":"Subject then verb then adjective."}}');
