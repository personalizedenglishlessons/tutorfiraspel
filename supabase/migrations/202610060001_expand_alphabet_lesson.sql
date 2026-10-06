-- Expand a0ss-alphabet lesson from 3 letters (A,B,C) to all 26 letters
-- Adds lesson_items for D-Z with example sentences and exercises

-- Add example sentences to existing A, B, C items
UPDATE lesson_items SET example_en = 'A is for apple.', example_ar = 'التفاحه تبدا بحرف A.', example_tr = 'اي از فور ابل' WHERE lesson_id = 'a0ss-alphabet' AND idx = 0;
UPDATE lesson_items SET example_en = 'B is for book.', example_ar = 'الكتاب يبدا بحرف B.', example_tr = 'بي از فور بوك' WHERE lesson_id = 'a0ss-alphabet' AND idx = 1;
UPDATE lesson_items SET example_en = 'C is for cat.', example_ar = 'القطه تبدا بحرف C.', example_tr = 'سي از فور كات' WHERE lesson_id = 'a0ss-alphabet' AND idx = 2;

-- Insert word items for D through Z (idx 6-28)
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES
('a0ss-alphabet', 6, 'word', 'D', 'دي', 'دي', 'D is for dog.', 'الكلب يبدا بحرف D', 'دي از فور دوق'),
('a0ss-alphabet', 7, 'word', 'E', 'اي', 'اي', 'E is for egg.', 'البيضه تبدا بحرف E', 'اي از فور اق'),
('a0ss-alphabet', 8, 'word', 'F', 'اف', 'اف', 'F is for fish.', 'السمكه تبدا بحرف F', 'اف از فور فيش'),
('a0ss-alphabet', 9, 'word', 'G', 'جي', 'جي', 'G is for good.', 'كلمه زينه تبدا بحرف G', 'جي از فور قود'),
('a0ss-alphabet', 10, 'word', 'H', 'ايتش', 'ايتش', 'H is for house.', 'البيت يبدا بحرف H', 'ايتش از فور هاوس'),
('a0ss-alphabet', 11, 'word', 'I', 'اي', 'اي', 'I is for ice.', 'الثلج يبدا بحرف I', 'اي از فور ايس'),
('a0ss-alphabet', 12, 'word', 'J', 'جاي', 'جاي', 'J is for juice.', 'العصير يبدا بحرف J', 'جاي از فور جوس'),
('a0ss-alphabet', 13, 'word', 'K', 'كاي', 'كاي', 'K is for key.', 'المفتاح يبدا بحرف K', 'كاي از فور كي'),
('a0ss-alphabet', 14, 'word', 'L', 'ال', 'ال', 'L is for love.', 'الحب يبدا بحرف L', 'ال از فور لاف'),
('a0ss-alphabet', 15, 'word', 'M', 'ام', 'ام', 'M is for man.', 'الرجل يبدا بحرف M', 'ام از فور مان'),
('a0ss-alphabet', 16, 'word', 'N', 'ان', 'ان', 'N is for no.', 'كلمه لا تبدا بحرف N', 'ان از فور نو'),
('a0ss-alphabet', 17, 'word', 'O', 'او', 'او', 'O is for orange.', 'البرتقاله تبدا بحرف O', 'او از فور اورنج'),
('a0ss-alphabet', 18, 'word', 'P', 'بي', 'بي', 'P is for pen.', 'القلم يبدا بحرف P', 'بي از فور بن'),
('a0ss-alphabet', 19, 'word', 'Q', 'كيو', 'كيو', 'Q is for queen.', 'الملكه تبدا بحرف Q', 'كيو از فور كوين'),
('a0ss-alphabet', 20, 'word', 'R', 'ار', 'ار', 'R is for red.', 'الاحمر يبدا بحرف R', 'ار از فور رد'),
('a0ss-alphabet', 21, 'word', 'S', 'اس', 'اس', 'S is for sun.', 'الشمس تبدا بحرف S', 'اس از فور سن'),
('a0ss-alphabet', 22, 'word', 'T', 'تي', 'تي', 'T is for time.', 'الوقت يبدا بحرف T', 'تي از فور تايم'),
('a0ss-alphabet', 23, 'word', 'U', 'يو', 'يو', 'U is for up.', 'فوق تبدا بحرف U', 'يو از فور اب'),
('a0ss-alphabet', 24, 'word', 'V', 'ڤي', 'ڤي', 'V is for very.', 'كلمه جدا تبدا بحرف V', 'ڤي از فور ڤري'),
('a0ss-alphabet', 25, 'word', 'W', 'دبليو', 'دبليو', 'W is for water.', 'الماء يبدا بحرف W', 'دبليو از فور واتر'),
('a0ss-alphabet', 26, 'word', 'X', 'اكس', 'اكس', 'X is for box.', 'الصندوق فيه حرف X', 'اكس از فور بوكس'),
('a0ss-alphabet', 27, 'word', 'Y', 'واي', 'واي', 'Y is for yes.', 'كلمه ايه تبدا بحرف Y', 'واي از فور يس'),
('a0ss-alphabet', 28, 'word', 'Z', 'زي', 'زي', 'Z is for zoo.', 'حديقه الحيوانات تبدا بحرف Z', 'زي از فور زو');

-- Add sentence items for D-Z (interleaved with word items)
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) VALUES
('a0ss-alphabet', 29, 'sentence', 'D is for dog.', 'دي لحرف الكلب', 'دي از فور دوق'),
('a0ss-alphabet', 30, 'sentence', 'E is for egg.', 'اي لحرف البيضه', 'اي از فور اق'),
('a0ss-alphabet', 31, 'sentence', 'F is for fish.', 'اف لحرف السمك', 'اف از فور فيش'),
('a0ss-alphabet', 32, 'sentence', 'G is for good.', 'جي لحرف زين', 'جي از فور قود'),
('a0ss-alphabet', 33, 'sentence', 'H is for house.', 'ايتش لحرف البيت', 'ايتش از فور هاوس'),
('a0ss-alphabet', 34, 'sentence', 'I is for ice.', 'اي لحرف الثلج', 'اي از فور ايس'),
('a0ss-alphabet', 35, 'sentence', 'J is for juice.', 'جاي لحرف العصير', 'جاي از فور جوس'),
('a0ss-alphabet', 36, 'sentence', 'K is for key.', 'كاي لحرف المفتاح', 'كاي از فور كي'),
('a0ss-alphabet', 37, 'sentence', 'L is for love.', 'ال لحرف الحب', 'ال از فور لاف'),
('a0ss-alphabet', 38, 'sentence', 'M is for man.', 'ام لحرف الرجل', 'ام از فور مان'),
('a0ss-alphabet', 39, 'sentence', 'N is for no.', 'ان لحرف لا', 'ان از فور نو'),
('a0ss-alphabet', 40, 'sentence', 'O is for orange.', 'او لحرف البرتقال', 'او از فور اورنج'),
('a0ss-alphabet', 41, 'sentence', 'P is for pen.', 'بي لحرف القلم', 'بي از فور بن'),
('a0ss-alphabet', 42, 'sentence', 'Q is for queen.', 'كيو لحرف الملكه', 'كيو از فور كوين'),
('a0ss-alphabet', 43, 'sentence', 'R is for red.', 'ار لحرف الاحمر', 'ار از فور رد'),
('a0ss-alphabet', 44, 'sentence', 'S is for sun.', 'اس لحرف الشمس', 'اس از فور سن'),
('a0ss-alphabet', 45, 'sentence', 'T is for time.', 'تي لحرف الوقت', 'تي از فور تايم'),
('a0ss-alphabet', 46, 'sentence', 'U is for up.', 'يو لحرف فوق', 'يو از فور اب'),
('a0ss-alphabet', 47, 'sentence', 'V is for very.', 'ڤي لحرف جدا', 'ڤي از فور ڤري'),
('a0ss-alphabet', 48, 'sentence', 'W is for water.', 'دبليو لحرف الماء', 'دبليو از فور واتر'),
('a0ss-alphabet', 49, 'sentence', 'X is for box.', 'اكس لحرف الصندوق', 'اكس از فور بوكس'),
('a0ss-alphabet', 50, 'sentence', 'Y is for yes.', 'واي لحرف ايه', 'واي از فور يس'),
('a0ss-alphabet', 51, 'sentence', 'Z is for zoo.', 'زي لحرف حديقه الحيوان', 'زي از فور زو');

-- Add exercises for the new letters
INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
('a0ss-alphabet', 'choose', '{"type":"choose","question":{"ar":"___ لحرف الكلب.","en":"___ is for dog.","tr":"___ از فور دوق"},"options":[{"t":"D","ok":true,"tr":"دي"},{"t":"B","ok":false,"tr":"بي"},{"t":"P","ok":false,"tr":"بي"}],"hint":{"ar":"الكلب يبدا بحرف D.","en":"Dog starts with D."}}'),
('a0ss-alphabet', 'choose', '{"type":"choose","question":{"ar":"___ لحرف السمك.","en":"___ is for fish.","tr":"___ از فور فيش"},"options":[{"t":"G","ok":false,"tr":"جي"},{"t":"F","ok":true,"tr":"اف"},{"t":"T","ok":false,"tr":"تي"}],"hint":{"ar":"السمك يبدا بحرف F.","en":"Fish starts with F."}}'),
('a0ss-alphabet', 'choose', '{"type":"choose","question":{"ar":"___ لحرف البيت.","en":"___ is for house.","tr":"___ از فور هاوس"},"options":[{"t":"H","ok":true,"tr":"ايتش"},{"t":"N","ok":false,"tr":"ان"},{"t":"M","ok":false,"tr":"ام"}],"hint":{"ar":"البيت يبدا بحرف H.","en":"House starts with H."}}'),
('a0ss-alphabet', 'choose', '{"type":"choose","question":{"ar":"___ لحرف العصير.","en":"___ is for juice.","tr":"___ از فور جوس"},"options":[{"t":"G","ok":false,"tr":"جي"},{"t":"J","ok":true,"tr":"جاي"},{"t":"D","ok":false,"tr":"دي"}],"hint":{"ar":"العصير يبدا بحرف J.","en":"Juice starts with J."}}'),
('a0ss-alphabet', 'choose', '{"type":"choose","question":{"ar":"___ لحرف الماء.","en":"___ is for water.","tr":"___ از فور واتر"},"options":[{"t":"W","ok":true,"tr":"دبليو"},{"t":"M","ok":false,"tr":"ام"},{"t":"V","ok":false,"tr":"ڤي"}],"hint":{"ar":"الماء يبدا بحرف W.","en":"Water starts with W."}}'),
('a0ss-alphabet', 'choose', '{"type":"choose","question":{"ar":"___ لحرف ايه.","en":"___ is for yes.","tr":"___ از فور يس"},"options":[{"t":"Y","ok":true,"tr":"واي"},{"t":"N","ok":false,"tr":"ان"},{"t":"U","ok":false,"tr":"يو"}],"hint":{"ar":"ايه تبدا بحرف Y.","en":"Yes starts with Y."}}'),
('a0ss-alphabet', 'order', '{"type":"order","ar":"دي لحرف الكلب","prompt":{"ar":"رتب: D حرف dog.","en":"Build: D is for dog.","tr":"بيلد: دي از فور دوق"},"answer":["D","is","for","dog"],"tokens":["D","is","for","dog"],"hint":{"ar":"الحرف بعدين از فور بعدين الكلمه.","en":"Letter + is for + word."}}'),
('a0ss-alphabet', 'order', '{"type":"order","ar":"اف لحرف السمك","prompt":{"ar":"رتب: F حرف fish.","en":"Build: F is for fish.","tr":"بيلد: اف از فور فيش"},"answer":["F","is","for","fish"],"tokens":["F","is","for","fish"],"hint":{"ar":"الحرف بعدين از فور بعدين الكلمه.","en":"Letter + is for + word."}}'),
('a0ss-alphabet', 'translate', '{"type":"translate","dir":"en-ar","source":"H is for house.","accept":["ايتش لحرف البيت","ايتش از فور هاوس"],"answer":"ايتش لحرف البيت"}'),
('a0ss-alphabet', 'translate', '{"type":"translate","dir":"en-ar","source":"W is for water.","accept":["دبليو لحرف الماء","دبليو از فور واتر"],"answer":"دبليو لحرف الماء"}'),
('a0ss-alphabet', 'spell', '{"type":"spell","answer":"CAT","display":"C A T","meaning":"قطه","translit":"كات","options":[{"t":"C","ok":true},{"t":"A","ok":true},{"t":"T","ok":true},{"t":"B","ok":false}]}'),
('a0ss-alphabet', 'spell', '{"type":"spell","answer":"DOG","display":"D O G","meaning":"كلب","translit":"دوق","options":[{"t":"D","ok":true},{"t":"O","ok":true},{"t":"G","ok":true},{"t":"F","ok":false}]}');
