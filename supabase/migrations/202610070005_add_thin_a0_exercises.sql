-- 202610070005_add_thin_a0_exercises.sql
-- Add exercises to thin A0 phonics lessons

-- spell-digraph-th: add 5 exercises (3 → 8)
INSERT INTO lesson_exercises (lesson_id, idx, type, payload) VALUES
('spell-digraph-th', 3, 'spell', '{"type":"spell","answer":"THIS","display":"T _ I S","meaning":"هذا","options":[{"t":"H","ok":true},{"t":"R","ok":false},{"t":"T","ok":true},{"t":"B","ok":false}],"translit":"ذيس"}'),
('spell-digraph-th', 4, 'spell', '{"type":"spell","answer":"THAT","display":"T _ A T","meaning":"ذاك","options":[{"t":"H","ok":true},{"t":"R","ok":false},{"t":"T","ok":true},{"t":"B","ok":false}],"translit":"ذات"}'),
('spell-digraph-th', 5, 'choose', '{"type":"choose","options":[{"t":"this","ok":true,"tr":"ذيس"},{"t":"cat","ok":false,"tr":"كات"},{"t":"dog","ok":false,"tr":"دوق"}],"question":{"ar":"اي كلمه فيها صوت th؟","en":"Which word has the th sound?","tr":"ويتش وورد هز ذا تييتش ساوند؟"}}'),
('spell-digraph-th', 6, 'translate', '{"dir":"en-ar","type":"translate","accept":["هذا كتابي","ذيس از ماي بوك"],"answer":"هذا كتابي","source":"This is my book."}'),
('spell-digraph-th', 7, 'order', '{"type":"order","answer":["This","is","a","book"],"prompt":{"ar":"رتب: هذا كتاب.","en":"Build: This is a book.","tr":"بيلد: ذيس از ا بوك."},"tokens":["This","is","a","book"]});

-- spell-silent-e: add 4 exercises (2 → 6)
INSERT INTO lesson_exercises (lesson_id, idx, type, payload) VALUES
('spell-silent-e', 3, 'spell', '{"type":"spell","answer":"CAPE","display":"C A P E","meaning":"عبايه","options":[{"t":"C","ok":true},{"t":"A","ok":true},{"t":"P","ok":true},{"t":"E","ok":true},{"t":"B","ok":false}],"translit":"كايب"}'),
('spell-silent-e', 4, 'choose', '{"type":"choose","options":[{"t":"cape","ok":true,"tr":"كايب"},{"t":"cat","ok":false,"tr":"كات"},{"t":"hat","ok":false,"tr":"هات"}],"question":{"ar":"اي كلمه فيها حرف e ساكن بالنهايه؟","en":"Which word has a silent e at the end?","tr":"ويتش وورد هز ا سايلنت اي ات ذا ايند؟"}}'),
('spell-silent-e', 5, 'translate', '{"dir":"en-ar","type":"translate","accept":["عندي امل","اي هاڤ هوب"],"answer":"عندي امل","source":"I have hope."}'),
('spell-silent-e', 6, 'order', '{"type":"order","answer":["I","hope","so"],"prompt":{"ar":"رتب: انا امل.","en":"Build: I hope so.","tr":"بيلد: اي هوب سو."},"tokens":["I","hope","so"]');

-- spell-plurals: add 4 exercises (2 → 6)
INSERT INTO lesson_exercises (lesson_id, idx, type, payload) VALUES
('spell-plurals', 3, 'spell', '{"type":"spell","answer":"CATS","display":"C A T S","meaning":"قطط","options":[{"t":"C","ok":true},{"t":"A","ok":true},{"t":"T","ok":true},{"t":"S","ok":true},{"t":"B","ok":false}],"translit":"كاتس"}'),
('spell-plurals', 4, 'choose', '{"type":"choose","options":[{"t":"books","ok":true,"tr":"بوكس"},{"t":"bookes","ok":false,"tr":"بوكس"},{"t":"book","ok":false,"tr":"بوك"}],"question":{"ar":"اي جمع صحيح لكلمه book؟","en":"What is the correct plural of book?","tr":"وت از ذا كوركت بلورال اوف بوك؟"}}'),
('spell-plurals', 5, 'translate', '{"dir":"en-ar","type":"translate","accept":["عندي كتابين","اي هاڤ تو بوكس"],"answer":"عندي كتابين","source":"I have two books."}'),
('spell-plurals', 6, 'order', '{"type":"order","answer":["One","cat","two","cats"],"prompt":{"ar":"رتب: قطه واحد، قطتين.","en":"Build: One cat, two cats.","tr":"بيلد: وان كات تو كاتس."},"tokens":["One","cat","two","cats"]});

-- Fix english-foundations sort_order (had gaps 0,3,4,5,200-240)
WITH ranked AS (
  SELECT lesson_id, ROW_NUMBER() OVER (ORDER BY sort_order) - 1 as new_sort
  FROM academy_lessons WHERE academy_id = 'english-foundations'
)
UPDATE academy_lessons al
SET sort_order = ranked.new_sort
FROM ranked
WHERE al.lesson_id = ranked.lesson_id AND al.academy_id = 'english-foundations';
