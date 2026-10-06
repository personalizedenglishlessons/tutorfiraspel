-- Enrich SH/CH and TH digraph lessons with contrast drills and more content

-- 1. Enrich a0ss-sh-ch: add more words, contrast drills, explanation
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES
('a0ss-sh-ch', 7, 'word', 'fish', 'سمك', 'فيش',
 'SH sounds like shhh. Fish ends with sh.', 'صوت SH مثل ششش. كلمه fish تنتهي بـ sh.', 'اس ايتش صاوندز لايك شه. فيش اندز ويذ ايتش.'),
('a0ss-sh-ch', 8, 'word', 'shop', 'محل', 'شوب',
 'SH at the start: shop.', 'SH بدايه الكلمه: shop.', 'اس ايتش ات ذا ستارت: شوب.'),
('a0ss-sh-ch', 9, 'word', 'wash', 'اغسل', 'واش',
 'SH at the end: wash.', 'SH نهايه الكلمه: wash.', 'اس ايتش ات ذا ايند: واش.'),
('a0ss-sh-ch', 10, 'word', 'chair', 'كرسي', 'تشير',
 'CH sounds like tch. Chair starts with ch.', 'صوت CH مثل تتش. كلمه chair تبدا بـ ch.', 'سي ايتش صاوندز لايك تتش. تشير ستارتز ويذ ايتش.'),
('a0ss-sh-ch', 11, 'word', 'lunch', 'غدا', 'لنتش',
 'CH at the end: lunch.', 'CH نهايه الكلمه: lunch.', 'سي ايتش ات ذا ايند: لنتش.'),
('a0ss-sh-ch', 12, 'word', 'watch', 'ساعه او يشاهد', 'واتش',
 'CH in the middle: watch.', 'CH بوسط الكلمه: watch.', 'سي ايتش ان ذا ميدل: واتش.'),
('a0ss-sh-ch', 13, 'sentence', 'She washed the fish.', 'غسلت السمك.', 'شي واشت ذا فيش.', null, null, null),
('a0ss-sh-ch', 14, 'sentence', 'The chair is in the shop.', 'الكرسي بالمحل.', 'ذا تشير از ان ذا شوب.', null, null, null),
('a0ss-sh-ch', 15, 'sentence', 'I eat lunch and watch TV.', 'اغدا واشاهد التلفزيون.', 'اي ايت لنتش اند واتش تي في.', null, null, null),
('a0ss-sh-ch', 16, 'explain', 'SH and CH are two letters that make one sound. SH is like saying shhh to be quiet. CH is like the sound of a train: ch-ch-ch.',
 'SH و CH حرفين يجتمعون ويسوون صوت واحد. SH مثل ما تقول ششش عشان تسكت. CH مثل صوت القطر: تش تش تش.',
 'اس ايتش اند سي ايتش اير تو ليترز ذات ميك وان صاوند. اس ايتش از لايك سيينق شه تو بي كوايت. سي ايتش از لايك ذا صاوند اوف ا ترين: تش تش تش.', null, null, null);

INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
('a0ss-sh-ch', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها صوت SH؟","en":"Which word has the SH sound?","tr":"ويتش ورد هز ذا اس ايتش صاوند؟"},"options":[{"t":"fish","ok":true,"tr":"فيش"},{"t":"chair","ok":false,"tr":"تشير"},{"t":"dog","ok":false,"tr":"دوق"}],"hint":{"ar":"fish تنتهي بـ SH.","en":"fish ends with SH."}}'),
('a0ss-sh-ch', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها صوت CH؟","en":"Which word has the CH sound?","tr":"ويتش ورد هز ذا سي ايتش صاوند؟"},"options":[{"t":"chair","ok":true,"tr":"تشير"},{"t":"fish","ok":false,"tr":"فيش"},{"t":"cat","ok":false,"tr":"كات"}],"hint":{"ar":"chair تبدا بـ CH.","en":"chair starts with CH."}}'),
('a0ss-sh-ch', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها SH واي كلمه فيها CH؟","en":"Which word has SH and which has CH?","tr":"ويتش ورد هز اس ايتش اند ويتش هز سي ايتش؟"},"options":[{"t":"she = SH, cheese = CH","ok":true,"tr":"شي = اس ايتش, تشيز = سي ايتش"},{"t":"she = CH, cheese = SH","ok":false,"tr":"شي = سي ايتش, تشيز = اس ايتش"},{"t":"both = SH","ok":false,"tr":"بوث = اس ايتش"}],"hint":{"ar":"she فيها SH و cheese فيها CH.","en":"she has SH and cheese has CH."}}'),
('a0ss-sh-ch', 'spell', '{"type":"spell","answer":"FISH","display":"F I S H","meaning":"سمك","translit":"فيش","options":[{"t":"F","ok":true},{"t":"I","ok":true},{"t":"S","ok":true},{"t":"H","ok":true}]}'),
('a0ss-sh-ch', 'spell', '{"type":"spell","answer":"SHOP","display":"S H O P","meaning":"محل","translit":"شوب","options":[{"t":"S","ok":true},{"t":"H","ok":true},{"t":"O","ok":true},{"t":"P","ok":true}]}'),
('a0ss-sh-ch', 'order', '{"type":"order","ar":"غسلت السمك","prompt":{"ar":"رتب: غسلت السمك.","en":"Build: She washed the fish.","tr":"بيلد: شي واشت ذا فيش."},"answer":["She","washed","the","fish"],"tokens":["She","washed","the","fish"],"hint":{"ar":"الفاعل بعدين الفعل بعدين المفعول.","en":"Subject then verb then object."}}'),
('a0ss-sh-ch', 'order', '{"type":"order","ar":"الكرسي بالمحل","prompt":{"ar":"رتب: الكرسي بالمحل.","en":"Build: The chair is in the shop.","tr":"بيلد: ذا تشير از ان ذا شوب."},"answer":["The","chair","is","in","the","shop"],"tokens":["The","chair","is","in","the","shop"],"hint":{"ar":"الفاعل بعدين الفعل بعدين المكان.","en":"Subject then verb then place."}}');

-- 2. Enrich a0ss-th-sound: add more words, voiced/voiceless distinction
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES
('a0ss-th-sound', 6, 'word', 'think', 'افكر', 'ثينك',
 'TH in think is voiceless, like ث.', 'صوت TH في think ساكن، مثل ث.', 'تي ايتش ان ثينك از ڤويسليس, لايك ث.'),
('a0ss-th-sound', 7, 'word', 'three', 'ثلاثه', 'ثري',
 'TH in three is voiceless, like ث.', 'صوت TH في three ساكن، مثل ث.', 'تي ايتش ان ثري از ڤويسليس, لايك ث.'),
('a0ss-th-sound', 8, 'word', 'they', 'هم', 'ذي',
 'TH in they is voiced, like ذ.', 'صوت TH في they حي، مثل ذ.', 'تي ايتش ان ذي از ڤويسد, لايك ذ.'),
('a0ss-th-sound', 9, 'word', 'there', 'هناك', 'ذير',
 'TH in there is voiced, like ذ.', 'صوت TH في there حي، مثل ذ.', 'تي ايتش ان ذير از ڤويسد, لايك ذ.'),
('a0ss-th-sound', 10, 'word', 'then', 'بعدين', 'ذين',
 'TH in then is voiced, like ذ.', 'صوت TH في then حي، مثل ذ.', 'تي ايتش ان ذين از ڤويسد, لايك ذ.'),
('a0ss-th-sound', 11, 'sentence', 'I think this is good.', 'اعتقد هذا زين.', 'اي ثينك ذيس از قود.', null, null, null),
('a0ss-th-sound', 12, 'sentence', 'They are over there.', 'هم هناك.', 'ذي اير اوفر ذير.', null, null, null),
('a0ss-th-sound', 13, 'sentence', 'Three of them are here.', 'ثلاثه منهم هنا.', 'ثري اوف ذيم اير هير.', null, null, null),
('a0ss-th-sound', 14, 'explain', 'TH has two sounds: voiceless like ث (think, three, thank) and voiced like ذ (this, that, they, there). Put your tongue between your teeth and blow.',
 'صوت TH له صورتين: ساكن مثل ث (think, three, thank) وحي مثل ذ (this, that, they, there). حط لسانك بين اسنانك ونفخ.',
 'تي ايتش هز تو صاوندز: ڤويسليس لايك ث (ثينك, ثري, ثانك) اند ڤويسد لايك ذ (ذيس, ذات, ذي, ذير). بوت يور تانق بين يور تيث اند بلو.', null, null, null);

INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
('a0ss-th-sound', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها صوت TH مثل ث؟","en":"Which word has the voiceless TH like ث?","tr":"ويتش ورد هز ذا ڤويسليس تي ايتش لايك ث؟"},"options":[{"t":"think","ok":true,"tr":"ثينك"},{"t":"this","ok":false,"tr":"ذيس"},{"t":"they","ok":false,"tr":"ذي"}],"hint":{"ar":"think فيها صوت ث الساكن.","en":"think has the voiceless TH sound."}}'),
('a0ss-th-sound', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها صوت TH مثل ذ؟","en":"Which word has the voiced TH like ذ?","tr":"ويتش ورد هز ذا ڤويسد تي ايتش لايك ذ؟"},"options":[{"t":"this","ok":true,"tr":"ذيس"},{"t":"think","ok":false,"tr":"ثينك"},{"t":"three","ok":false,"tr":"ثري"}],"hint":{"ar":"this فيها صوت ذ الحي.","en":"this has the voiced TH sound."}}'),
('a0ss-th-sound', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها صوت ث؟","en":"Which word has the ث sound?","tr":"ويتش ورد هز ذا ث صاوند؟"},"options":[{"t":"three","ok":true,"tr":"ثري"},{"t":"there","ok":false,"tr":"ذير"},{"t":"then","ok":false,"tr":"ذين"}],"hint":{"ar":"three فيها صوت ث الساكن.","en":"three has the voiceless ث sound."}}'),
('a0ss-th-sound', 'spell', '{"type":"spell","answer":"THIS","display":"T H I S","meaning":"هذا","translit":"ذيس","options":[{"t":"T","ok":true},{"t":"H","ok":true},{"t":"I","ok":true},{"t":"S","ok":true}]}'),
('a0ss-th-sound', 'spell', '{"type":"spell","answer":"THEY","display":"T H E Y","meaning":"هم","translit":"ذي","options":[{"t":"T","ok":true},{"t":"H","ok":true},{"t":"E","ok":true},{"t":"Y","ok":true}]}'),
('a0ss-th-sound', 'order', '{"type":"order","ar":"اعتقد هذا زين","prompt":{"ar":"رتب: اعتقد هذا زين.","en":"Build: I think this is good.","tr":"بيلد: اي ثينك ذيس از قود."},"answer":["I","think","this","is","good"],"tokens":["I","think","this","is","good"],"hint":{"ar":"الفاعل بعدين الفعل بعدين الفاعل الثاني.","en":"Subject then verb then complement."}}'),
('a0ss-th-sound', 'order', '{"type":"order","ar":"هم هناك","prompt":{"ar":"رتب: هم هناك.","en":"Build: They are over there.","tr":"بيلد: ذي اير اوفر ذير."},"answer":["They","are","over","there"],"tokens":["They","are","over","there"],"hint":{"ar":"الفاعل بعدين الفعل بعدين المكان.","en":"Subject then verb then place."}}');
