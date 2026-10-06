-- Saudi Pronunciation Coach: dedicated lesson for sounds Saudi speakers struggle with
-- Covers: P vs B, V vs F, R vs L, final consonants (no extra vowel)
-- Content uses Saudi Arabic with physical descriptions (lips, teeth, tongue, air, voice)

-- 1. Create the lesson
INSERT INTO lessons (id, title_en, title_ar, minutes, level, active, kind)
VALUES ('a0ss-saudi-sounds', 'Saudi Pronunciation Coach', 'مدرب النطق', 10, 'A0', true, 'core');

-- 2. Add to academy_lessons at position 5 (after CVC lessons, before SH/CH)
-- First shift everything from position 5 onward up by 1
UPDATE academy_lessons SET sort_order = sort_order + 1
WHERE academy_id = 'a0-spelling-sounds' AND sort_order >= 5;

-- Insert the new lesson at position 5
INSERT INTO academy_lessons (academy_id, lesson_id, sort_order)
VALUES ('a0-spelling-sounds', 'a0ss-saudi-sounds', 5);

-- 3. Lesson items
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES
-- ===== P vs B =====
('a0ss-saudi-sounds', 0, 'explain',
 'P and B: same mouth position. P has air but no voice. B has voice but less air.',
 'P و B: نفس مكان الفم. الفرق: P فيه هوا بس ما فيه صوت. B فيه صوت بس ما فيه هوا كثير. سكر شفايفك، بعدين اطلع هوا خفيف بدون صوت — هذا P. الحين نفس الحركه بس قول صوت — هذا B.',
 'بي اند بي: سايم ماوس بوزيشن. بي هز اير بات نو ڤويس. بي هز ڤويس بات ليس اير.', null, null, null),

('a0ss-saudi-sounds', 1, 'word', 'pen', 'قلم', 'بن',
 'P has air. pen starts with P.', 'P فيه هوا. pen تبدا بـ P.', 'بي هز اير. بن ستارتز ويذ بي.'),
('a0ss-saudi-sounds', 2, 'word', 'ben', 'اسم شخص', 'بن',
 'B has voice. ben starts with B.', 'B فيه صوت. ben تبدا بـ B.', 'بي هز ڤويس. بن ستارتز ويذ بي.'),
('a0ss-saudi-sounds', 3, 'word', 'park', 'حديقه', 'بارك',
 'P has air. Say park with a puff of air.', 'P فيه هوا. قل park مع نفخه هوا.', 'بي هز اير. سي بارك ويذ ا بف اوف اير.'),
('a0ss-saudi-sounds', 4, 'word', 'book', 'كتاب', 'بوك',
 'B has voice. Say book with voice in your throat.', 'B فيه صوت. قل book مع صوت بحلقك.', 'بي هز ڤويس. سي بوك ويذ ڤويس ان يور ثروت.'),

-- P vs B contrast sentence
('a0ss-saudi-sounds', 5, 'sentence', 'Pen or ben? P has air.', 'قلم ولا بن؟ P فيه هوا.', 'بن اور بن؟ بي هز اير.', null, null, null),

-- ===== V vs F =====
('a0ss-saudi-sounds', 6, 'explain',
 'V and F: same mouth position — top teeth on lower lip. V has voice vibration. F has air but no voice.',
 'V و F: نفس مكان الفم — اسنانك الفوقيه على شفه تحت. الفرق: V فيه اهتزاز بالصوت، تحس رقبتك ترجف. F فيه هوا بس ما فيه صوت. العرب ما عندهم V، يستخدمون F بدالها. لا تسويها! حط اسنانك على شفه تحت واهتز.',
 'ڤي اند اف: سايم ماوس بوزيشن — توب تيث اون لوور ليب. ڤي هز ڤويس ڤايبريشن. اف هز اير بات نو ڤويس.', null, null, null),

('a0ss-saudi-sounds', 7, 'word', 'van', 'شاحنه', 'ڤان',
 'V has voice. van starts with V.', 'V فيه صوت. van تبدا بـ V.', 'ڤي هز ڤويس. ڤان ستارتز ويذ ڤي.'),
('a0ss-saudi-sounds', 8, 'word', 'fan', 'مروحه', 'فان',
 'F has air. fan starts with F.', 'F فيه هوا. fan تبدا بـ F.', 'اف هز اير. فان ستارتز ويذ اف.'),
('a0ss-saudi-sounds', 9, 'word', 'very', 'جدا', 'ڤري',
 'V has voice. Say very with vibration.', 'V فيه صوت. قل very مع اهتزاز.', 'ڤي هز ڤويس. سي ڤري ويذ ڤايبريشن.'),
('a0ss-saudi-sounds', 10, 'word', 'five', 'خمسه', 'فايڤ',
 'F has air, V has voice. Both in one word: fi-ve.', 'F فيه هوا، V فيه صوت. الحرفين بكلمه وحده: fi-ve.', 'اف هز اير, ڤي هز ڤويس. بوث ان وان ورد: فاي-ڤي.'),

-- V vs F contrast sentence
('a0ss-saudi-sounds', 11, 'sentence', 'Van or fan? V has voice.', 'شاحنه ولا مروحه؟ V فيه صوت.', 'ڤان اور فان؟ ڤي هز ڤويس.', null, null, null),

-- ===== R vs L =====
('a0ss-saudi-sounds', 12, 'explain',
 'R and L: L touches the roof behind your teeth. R pulls the tongue back and does not touch.',
 'R و L: L يلمس سقف فمك ورا اسنانك الفوقيه. R يرجع اللسان لورا وما يلمس. السعوديين يخلطون بينهم. تمرين: قل لا لا لا — تحس لسانك يلمس. الحين قل را را را — لسانك يرجع لورا وما يلمس.',
 'ار اند ال: ال تاتشيز ذا روف بيهايند يور تيث. ار بولز ذا تانق بيك اند دوز نات تاتش.', null, null, null),

('a0ss-saudi-sounds', 13, 'word', 'red', 'احمر', 'ريد',
 'R does not touch. red starts with R.', 'R ما يلمس. red تبدا بـ R.', 'ار دوز نات تاتش. ريد ستارتز ويذ ار.'),
('a0ss-saudi-sounds', 14, 'word', 'led', 'لمبه', 'لد',
 'L touches behind teeth. led starts with L.', 'L يلمس ورا الاسنان. led تبدا بـ L.', 'ال تاتشيز بيهايند تيث. لد ستارتز ويذ ال.'),
('a0ss-saudi-sounds', 15, 'word', 'rice', 'رز', 'رايس',
 'R pulls back. rice starts with R.', 'R يرجع لورا. rice تبدا بـ R.', 'ار بولز بيك. رايس ستارتز ويذ ار.'),
('a0ss-saudi-sounds', 16, 'word', 'lice', 'قمل', 'لايس',
 'L touches. lice starts with L.', 'L يلمس. lice تبدا بـ L.', 'ال تاتشيز. لايس ستارتز ويذ ال.'),

-- R vs L contrast sentence
('a0ss-saudi-sounds', 17, 'sentence', 'Red or led? R goes back.', 'احمر ولا لمبه؟ R يرجع لورا.', 'ريد اور لد؟ ار قوز بيك.', null, null, null),

-- ===== Final consonants (no extra vowel) =====
('a0ss-saudi-sounds', 18, 'explain',
 'Do not add a vowel at the end of words. Say book, not booka. Say cat, not cata. Say big, not bigga.',
 'لا تضيف صوت بالاخر. قل book مو booka. قل cat مو cata. قل big مو bigga. العرب يضيفون صوت قصير بالنهايه لان العربي ما ينتهي بساكن. تمرن: قل الكلمه واطف الصوت فجاه — ما تطول.',
 'دو نات اد ا ڤاول ات ذا ايند اوف وردز. سي بوك, نات بوكا. سي كات, نات كاتا. سي بيق, نات بيقا.', null, null, null),

('a0ss-saudi-sounds', 19, 'word', 'book', 'كتاب', 'بوك',
 'Stop at k. Do not say booka.', 'قف عند k. لا تقل booka.', 'ستوب ات كاي. دو نات سي بوكا.'),
('a0ss-saudi-sounds', 20, 'word', 'cat', 'قطه', 'كات',
 'Stop at t. Do not say cata.', 'قف عند t. لا تقل cata.', 'ستوب ات تي. دو نات سي كاتا.'),
('a0ss-saudi-sounds', 21, 'word', 'big', 'كبير', 'بيق',
 'Stop at g. Do not say bigga.', 'قف عند g. لا تقل bigga.', 'ستوب ات جي. دو نات سي بيقا.'),
('a0ss-saudi-sounds', 22, 'word', 'hot', 'حار', 'هات',
 'Stop at t. Do not say hota.', 'قف عند t. لا تقل hota.', 'ستوب ات تي. دو نات سي هوتا.'),

-- Final consonant sentences
('a0ss-saudi-sounds', 23, 'sentence', 'The book is big. Stop at the end.', 'الكتاب كبير. قف بالنهايه.', 'ذا بوك از بيق. ستوب ات ذا ايند.', null, null, null),
('a0ss-saudi-sounds', 24, 'sentence', 'The cat is hot. No extra sound.', 'القطه حاره. ما فيه صوت زياده.', 'ذا كات از هات. نو اكسترا صاوند.', null, null, null),

-- ===== Summary =====
('a0ss-saudi-sounds', 25, 'explain',
 'Four sounds Saudi speakers must master: P with air, V with vibration, R pulled back, and clean endings without extra vowels.',
 'اربعه اصوات لازم السعودي يتقنها: P فيه هوا، V فيه اهتزاز، R يرجع اللسان لورا، والنهايات نظيفه بدون اصوات زياده. تمرن عليهم كل يوم دقيقتين.',
 'فور صاوندز سعودي سبيكرز مست ماستر: بي ويذ اير, ڤي ويذ ڤايبريشن, ار بولد بيك, اند كلين ايندنقس ويذ آوت اكسترا ڤاولز.', null, null, null);

-- 4. Exercises
INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
-- P vs B: choose
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف فيه هوا بدون صوت؟","en":"Which letter has air but no voice?","tr":"ويتش ليتر هز اير بات نو ڤويس؟"},"options":[{"t":"P","ok":true,"tr":"بي"},{"t":"B","ok":false,"tr":"بي"},{"t":"V","ok":false,"tr":"ڤي"}],"hint":{"ar":"P فيه هوا، B فيه صوت.","en":"P has air, B has voice."}}'),
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي كلمه تبدا بـ P مو B؟","en":"Which word starts with P not B?","tr":"ويتش ورد ستارتز ويذ بي نات بي؟"},"options":[{"t":"pen","ok":true,"tr":"بن"},{"t":"book","ok":false,"tr":"بوك"},{"t":"big","ok":false,"tr":"بيق"}],"hint":{"ar":"pen تبدا بـ P فيه هوا.","en":"pen starts with P which has air."}}'),
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف فيه اهتزاز بالصوت؟","en":"Which letter has voice vibration?","tr":"ويتش ليتر هز ڤويس ڤايبريشن؟"},"options":[{"t":"B","ok":true,"tr":"بي"},{"t":"P","ok":false,"tr":"بي"},{"t":"F","ok":false,"tr":"اف"}],"hint":{"ar":"B فيه صوت، تحس رقبتك ترجف.","en":"B has voice, you feel your throat vibrate."}}'),

-- V vs F: choose
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف فيه اهتزاز؟ V ولا F؟","en":"Which letter has vibration? V or F?","tr":"ويتش ليتر هز ڤايبريشن؟ ڤي اور اف؟"},"options":[{"t":"V","ok":true,"tr":"ڤي"},{"t":"F","ok":false,"tr":"اف"},{"t":"P","ok":false,"tr":"بي"}],"hint":{"ar":"V فيه اهتزاز، F فيه هوا بس.","en":"V has vibration, F has air only."}}'),
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي كلمه فيها V مو F؟","en":"Which word has V not F?","tr":"ويتش ورد هز ڤي نات اف؟"},"options":[{"t":"van","ok":true,"tr":"ڤان"},{"t":"fan","ok":false,"tr":"فان"},{"t":"fish","ok":false,"tr":"فيش"}],"hint":{"ar":"van تبدا بـ V فيه اهتزاز.","en":"van starts with V which has vibration."}}'),
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"كلمه five فيها حرفين: F و V. ايهم بالاول؟","en":"In the word five, which comes first: F or V?","tr":"ان ذا ورد فايڤ, ويتش كامز فيرست: اف اور ڤي؟"},"options":[{"t":"F first, V last","ok":true,"tr":"اف فيرست, ڤي لاست"},{"t":"V first, F last","ok":false,"tr":"ڤي فيرست, اف لاست"},{"t":"Both V","ok":false,"tr":"بوث ڤي"}],"hint":{"ar":"five = F + i + V. الاول F والاخير V.","en":"five = F + i + V. First is F, last is V."}}'),

-- R vs L: choose
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف يلمس سقف الفم؟","en":"Which letter touches the roof of the mouth?","tr":"ويتش ليتر تاتشيز ذا روف اوف ذا ماوس؟"},"options":[{"t":"L","ok":true,"tr":"ال"},{"t":"R","ok":false,"tr":"ار"},{"t":"P","ok":false,"tr":"بي"}],"hint":{"ar":"L يلمس، R ما يلمس.","en":"L touches, R does not touch."}}'),
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي كلمه تبدا بـ R مو L؟","en":"Which word starts with R not L?","tr":"ويتش ورد ستارتز ويذ ار نات ال؟"},"options":[{"t":"red","ok":true,"tr":"ريد"},{"t":"led","ok":false,"tr":"لد"},{"t":"lice","ok":false,"tr":"لايس"}],"hint":{"ar":"red تبدا بـ R اللي ما يلمس.","en":"red starts with R which does not touch."}}'),
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي كلمه تبدا بـ L مو R؟","en":"Which word starts with L not R?","tr":"ويتش ورد ستارتز ويذ ال نات ار؟"},"options":[{"t":"lice","ok":true,"tr":"لايس"},{"t":"rice","ok":false,"tr":"رايس"},{"t":"red","ok":false,"tr":"ريد"}],"hint":{"ar":"lice تبدا بـ L اللي يلمس.","en":"lice starts with L which touches."}}'),

-- Final consonants: choose
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي نطق صح لكلمه book؟","en":"Which is the correct pronunciation of book?","tr":"ويتش از ذا كاريكت برونونسييشن اوف بوك؟"},"options":[{"t":"book","ok":true,"tr":"بوك"},{"t":"booka","ok":false,"tr":"بوكا"},{"t":"booki","ok":false,"tr":"بوكي"}],"hint":{"ar":"قف عند k. ما تضيف صوت.","en":"Stop at k. Do not add a sound."}}'),
('a0ss-saudi-sounds', 'choose', '{"type":"choose","question":{"ar":"اي نطق صح لكلمه cat؟","en":"Which is the correct pronunciation of cat?","tr":"ويتش از ذا كاريكت برونونسييشن اوف كات؟"},"options":[{"t":"cat","ok":true,"tr":"كات"},{"t":"cata","ok":false,"tr":"كاتا"},{"t":"cati","ok":false,"tr":"كاتي"}],"hint":{"ar":"قف عند t. ما تضيف صوت.","en":"Stop at t. Do not add a sound."}}'),

-- Spell: practice the hard sounds
('a0ss-saudi-sounds', 'spell', '{"type":"spell","answer":"PEN","display":"P E N","meaning":"قلم","translit":"بن","options":[{"t":"P","ok":true},{"t":"E","ok":true},{"t":"N","ok":true},{"t":"B","ok":false}]}'),
('a0ss-saudi-sounds', 'spell', '{"type":"spell","answer":"VAN","display":"V A N","meaning":"شاحنه","translit":"ڤان","options":[{"t":"V","ok":true},{"t":"A","ok":true},{"t":"N","ok":true},{"t":"F","ok":false}]}'),
('a0ss-saudi-sounds', 'spell', '{"type":"spell","answer":"RED","display":"R E D","meaning":"احمر","translit":"ريد","options":[{"t":"R","ok":true},{"t":"E","ok":true},{"t":"D","ok":true},{"t":"L","ok":false}]}'),
('a0ss-saudi-sounds', 'spell', '{"type":"spell","answer":"FIVE","display":"F I V E","meaning":"خمسه","translit":"فايڤ","options":[{"t":"F","ok":true},{"t":"I","ok":true},{"t":"V","ok":true},{"t":"E","ok":true}]}'),
('a0ss-saudi-sounds', 'spell', '{"type":"spell","answer":"RICE","display":"R I C E","meaning":"رز","translit":"رايس","options":[{"t":"R","ok":true},{"t":"I","ok":true},{"t":"C","ok":true},{"t":"E","ok":true},{"t":"L","ok":false}]}'),

-- Order: build sentences with hard sounds
('a0ss-saudi-sounds', 'order', '{"type":"order","ar":"الشاحنه كبيره جدا","prompt":{"ar":"رتب: الشاحنه كبيره جدا.","en":"Build: The van is very big.","tr":"بيلد: ذا ڤان از ڤري بيق."},"answer":["The","van","is","very","big"],"tokens":["The","van","is","very","big"],"hint":{"ar":"الفاعل بعدين الفعل بعدين الصفه.","en":"Subject then verb then adjective."}}'),
('a0ss-saudi-sounds', 'order', '{"type":"order","ar":"الكتاب كبير قف بالنهايه","prompt":{"ar":"رتب: الكتاب كبير قف بالنهايه.","en":"Build: The book is big.","tr":"بيلد: ذا بوك از بيق."},"answer":["The","book","is","big"],"tokens":["The","book","is","big"],"hint":{"ar":"الفاعل بعدين الفعل بعدين الصفه.","en":"Subject then verb then adjective."}}'),
('a0ss-saudi-sounds', 'order', '{"type":"order","ar":"القطه حاره ما فيه صوت زياده","prompt":{"ar":"رتب: القطه حاره.","en":"Build: The cat is hot.","tr":"بيلد: ذا كات از هات."},"answer":["The","cat","is","hot"],"tokens":["The","cat","is","hot"],"hint":{"ar":"الفاعل بعدين الفعل بعدين الصفه.","en":"Subject then verb then adjective."}}'),

-- Translate
('a0ss-saudi-sounds', 'translate', '{"type":"translate","dir":"en-ar","source":"P has air but no voice.","accept":["P فيه هوا بس ما فيه صوت","بي هز اير بات نو ڤويس"],"answer":"P فيه هوا بس ما فيه صوت"}'),
('a0ss-saudi-sounds', 'translate', '{"type":"translate","dir":"en-ar","source":"V has voice vibration.","accept":["V فيه اهتزاز بالصوت","ڤي هز ڤويس ڤايبريشن"],"answer":"V فيه اهتزاز بالصوت"}');
