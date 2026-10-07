-- 202610070003_rebuild_alphabet_lesson.sql
-- Rebuild a0ss-alphabet lesson: teach ALL 26 letters first, then word-building
-- Each letter teaches capital + small + Arabic name + memory hook + writing instruction
-- Sentence items (A is for apple) come AFTER all 26 letters are taught
-- Structure: 26 word items (A-Z) → 2 explain items → 25 sentence items → 1 takeaway

DELETE FROM lesson_items WHERE lesson_id = 'a0ss-alphabet';

-- 26 letter items (idx 0-25): each teaches the letter itself
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar) VALUES
('a0ss-alphabet', 0, 'word', 'A', 'حرف A — الكبير A والصغير a. اسمه ا. شكله مثل الخيمه. اكتبه على ورقه.', 'اي', 'A is for apple.', 'A للتفاحه.'),
('a0ss-alphabet', 1, 'word', 'B', 'حرف B — الكبير B والصغير b. اسمه بي. شكله مثل ثمانيه مكسوره. اكتبه على ورقه.', 'بي', 'B is for book.', 'B للكتاب.'),
('a0ss-alphabet', 2, 'word', 'C', 'حرف C — الكبير C والصغير c. اسمه سي. شكله مثل نص القمر. اكتبه على ورقه.', 'سي', 'C is for cat.', 'C للقطه.'),
('a0ss-alphabet', 3, 'word', 'D', 'حرف D — الكبير D والصغير d. اسمه دي. شكله مثل نص دائره. اكتبه على ورقه.', 'دي', 'D is for dog.', 'D للكلب.'),
('a0ss-alphabet', 4, 'word', 'E', 'حرف E — الكبير E والصغير e. اسمه اي. شكله ثلاث خطوط. اكتبه على ورقه.', 'اي', 'E is for egg.', 'E للبيضه.'),
('a0ss-alphabet', 5, 'word', 'F', 'حرف F — الكبير F والصغير f. اسمه اف. شكله مثل E بس ناقص خط. اكتبه على ورقه.', 'اف', 'F is for fish.', 'F للسمكه.'),
('a0ss-alphabet', 6, 'word', 'G', 'حرف G — الكبير G والصغير g. اسمه جي. شكله مثل C ومعاه علامه. اكتبه على ورقه.', 'جي', 'G is for good.', 'G لكلمه زينه.'),
('a0ss-alphabet', 7, 'word', 'H', 'حرف H — الكبير H والصغير h. اسمه ايتش. شكله مثل السلم. اكتبه على ورقه.', 'ايتش', 'H is for house.', 'H للبيت.'),
('a0ss-alphabet', 8, 'word', 'I', 'حرف I — الكبير I والصغير i. اسمه اي. شكله خط مع نقطه. اكتبه على ورقه.', 'اي', 'I is for ice.', 'I للثلج.'),
('a0ss-alphabet', 9, 'word', 'J', 'حرف J — الكبير J والصغير j. اسمه جاي. شكله مثل علامه الاستفهام. اكتبه على ورقه.', 'جاي', 'J is for juice.', 'J للعصير.'),
('a0ss-alphabet', 10, 'word', 'K', 'حرف K — الكبير K والصغير k. اسمه كاي. شكله خط مع زاويه. اكتبه على ورقه.', 'كاي', 'K is for key.', 'K للمفتاح.'),
('a0ss-alphabet', 11, 'word', 'L', 'حرف L — الكبير L والصغير l. اسمه ال. شكله مثل زاويه قائمه. اكتبه على ورقه.', 'ال', 'L is for love.', 'L للحب.'),
('a0ss-alphabet', 12, 'word', 'M', 'حرف M — الكبير M والصغير m. اسمه ام. شكله مثل جبلين. اكتبه على ورقه.', 'ام', 'M is for man.', 'M للرجل.'),
('a0ss-alphabet', 13, 'word', 'N', 'حرف N — الكبير N والصغير n. اسمه ان. شكله مثل البرق. اكتبه على ورقه.', 'ان', 'N is for no.', 'N لكلمه لا.'),
('a0ss-alphabet', 14, 'word', 'O', 'حرف O — الكبير O والصغير o. اسمه او. شكله مثل الدائره. اكتبه على ورقه.', 'او', 'O is for orange.', 'O للبرتقاله.'),
('a0ss-alphabet', 15, 'word', 'P', 'حرف P — الكبير P والصغير p. اسمه بي. نفس اسم B بس شكله غير. اكتبه على ورقه.', 'بي', 'P is for pen.', 'P للقلم.'),
('a0ss-alphabet', 16, 'word', 'Q', 'حرف Q — الكبير Q والصغير q. اسمه كيو. شكله دائره مع ذيل. اكتبه على ورقه.', 'كيو', 'Q is for queen.', 'Q للملكه.'),
('a0ss-alphabet', 17, 'word', 'R', 'حرف R — الكبير R والصغير r. اسمه ار. شكله مثل P بس مع رجل. اكتبه على ورقه.', 'ار', 'R is for red.', 'R للاحمر.'),
('a0ss-alphabet', 18, 'word', 'S', 'حرف S — الكبير S والصغير s. اسمه اس. شكله مثل الثعبان. اكتبه على ورقه.', 'اس', 'S is for sun.', 'S للشمس.'),
('a0ss-alphabet', 19, 'word', 'T', 'حرف T — الكبير T والصغير t. اسمه تي. شكله مثل الصليب. اكتبه على ورقه.', 'تي', 'T is for time.', 'T للوقت.'),
('a0ss-alphabet', 20, 'word', 'U', 'حرف U — الكبير U والصغير u. اسمه يو. شكله مثل الفنجان. اكتبه على ورقه.', 'يو', 'U is for up.', 'U لفوق.'),
('a0ss-alphabet', 21, 'word', 'V', 'حرف V — الكبير V والصغير v. اسمه ڤي. شكله مثل زاويه مفتوحه. اكتبه على ورقه.', 'ڤي', 'V is for very.', 'V لكلمه جدا.'),
('a0ss-alphabet', 22, 'word', 'W', 'حرف W — الكبير W والصغير w. اسمه دبليو. شكله مثل حرفين V. اكتبه على ورقه.', 'دبليو', 'W is for water.', 'W للماء.'),
('a0ss-alphabet', 23, 'word', 'X', 'حرف X — الكبير X والصغير x. اسمه اكس. شكله مثل الصليب المتقاطع. اكتبه على ورقه.', 'اكس', 'X is for x-ray.', 'X للاشعه.'),
('a0ss-alphabet', 24, 'word', 'Y', 'حرف Y — الكبير Y والصغير y. اسمه واي. شكله مثل الشجره. اكتبه على ورقه.', 'واي', 'Y is for yes.', 'Y لكلمه ايه.'),
('a0ss-alphabet', 25, 'word', 'Z', 'حرف Z — الكبير Z والصغير z. اسمه زي. شكله مثل البرق المنكسر. اكتبه على ورقه.', 'زي', 'Z is for zoo.', 'Z لحديقه الحيوانات.');

-- Explain: alphabet order (idx 26)
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) VALUES
('a0ss-alphabet', 26, 'explain', 'The English alphabet has 26 letters. Learn them in order: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z.', 'الابجديه الانجليزيه فيها ٢٦ حرف. تعلم ترتيبها: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z. الكبير نستخدمه في بدايه الجمله والاسماء. الصغير نستخدمه في باقي الكلمات.', 'ذا انجلش الفابيت هز توينتي سيكس ليترز.');

-- Explain: pen and paper (idx 27)
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) VALUES
('a0ss-alphabet', 27, 'explain', 'Get a pen and paper. Write each letter as you learn it. Saying the letter and writing it together makes you remember it faster.', 'جيب قلم وورقه. اكتب كل حرف وانت تتعلمه. اذا نطقت الحرف وكتبته مع بعض بيخليك تحفظه اسرع.', 'قلم وورقه. رايت ايتش ليتر از يو ليرن ات.');

-- 25 sentence items (idx 28-52): word-building phase — AFTER all letters are taught
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) VALUES
('a0ss-alphabet', 28, 'sentence', 'A is for apple.', 'اي لحرف التفاحه.', 'اي از فور ابل'),
('a0ss-alphabet', 29, 'sentence', 'B is for book.', 'بي لحرف الكتاب.', 'بي از فور بوك'),
('a0ss-alphabet', 30, 'sentence', 'D is for dog.', 'دي لحرف الكلب.', 'دي از فور دوق'),
('a0ss-alphabet', 31, 'sentence', 'E is for egg.', 'اي لحرف البيضه.', 'اي از فور اق'),
('a0ss-alphabet', 32, 'sentence', 'F is for fish.', 'اف لحرف السمكه.', 'اف از فور فيش'),
('a0ss-alphabet', 33, 'sentence', 'G is for good.', 'جي لحرف زين.', 'جي از فور قود'),
('a0ss-alphabet', 34, 'sentence', 'H is for house.', 'ايتش لحرف البيت.', 'ايتش از فور هاوس'),
('a0ss-alphabet', 35, 'sentence', 'I is for ice.', 'اي لحرف الثلج.', 'اي از فور ايس'),
('a0ss-alphabet', 36, 'sentence', 'J is for juice.', 'جاي لحرف العصير.', 'جاي از فور جوس'),
('a0ss-alphabet', 37, 'sentence', 'K is for key.', 'كاي لحرف المفتاح.', 'كاي از فور كي'),
('a0ss-alphabet', 38, 'sentence', 'L is for love.', 'ال لحرف الحب.', 'ال از فور لاف'),
('a0ss-alphabet', 39, 'sentence', 'M is for man.', 'ام لحرف الرجل.', 'ام از فور مان'),
('a0ss-alphabet', 40, 'sentence', 'N is for no.', 'ان لحرف لا.', 'ان از فور نو'),
('a0ss-alphabet', 41, 'sentence', 'O is for orange.', 'او لحرف البرتقال.', 'او از فور اورنج'),
('a0ss-alphabet', 42, 'sentence', 'P is for pen.', 'بي لحرف القلم.', 'بي از فور بن'),
('a0ss-alphabet', 43, 'sentence', 'Q is for queen.', 'كيو لحرف الملكه.', 'كيو از فور كوين'),
('a0ss-alphabet', 44, 'sentence', 'R is for red.', 'ار لحرف الاحمر.', 'ار از فور رد'),
('a0ss-alphabet', 45, 'sentence', 'S is for sun.', 'اس لحرف الشمس.', 'اس از فور سن'),
('a0ss-alphabet', 46, 'sentence', 'T is for time.', 'تي لحرف الوقت.', 'تي از فور تايم'),
('a0ss-alphabet', 47, 'sentence', 'U is for up.', 'يو لحرف فوق.', 'يو از فور اب'),
('a0ss-alphabet', 48, 'sentence', 'V is for very.', 'ڤي لحرف جدا.', 'ڤي از فور ڤري'),
('a0ss-alphabet', 49, 'sentence', 'W is for water.', 'دبليو لحرف الماء.', 'دبليو از فور واتر'),
('a0ss-alphabet', 50, 'sentence', 'X is for x-ray.', 'اكس لحرف الاشعه.', 'اكس از فور اكس ري'),
('a0ss-alphabet', 51, 'sentence', 'Y is for yes.', 'واي لحرف ايه.', 'واي از فور يس'),
('a0ss-alphabet', 52, 'sentence', 'Z is for zoo.', 'زي لحرف حديقه الحيوان.', 'زي از فور زو');

-- Explain: takeaway (idx 53)
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) VALUES
('a0ss-alphabet', 53, 'explain', 'Practice spelling your name three times out loud. You will need this for every form and appointment.', 'تدرب على هجا اسمك ثلاث مرات بصوت عالي. تحتاجها في كل استماره وموعد.', 'براكتيس سبيلنج يور نيم ثري تايمز آوت لاود.');

-- Also fix: the-alphabet lesson in english-foundations had airport content, not alphabet
-- (addressed separately in client-side routing fix)

-- Update student routing: point A0 students to a0-spelling-sounds (phonics-first)
-- instead of english-foundations
UPDATE profiles SET current_academy_id = 'a0-spelling-sounds'
 WHERE user_id = 'c6f7dc15-003f-434d-bbb8-32b2d2e24c56'
   AND current_academy_id = 'english-foundations';
