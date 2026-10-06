-- Reorder A0 route: Spelling & Sounds FIRST (alphabet + phonics before vocabulary)
-- Also create new "Letter Sounds" lesson and enhance vowels lesson

-- 1. Reorder the granular_seq in student_route to put phonics first
CREATE OR REPLACE FUNCTION public.student_route(p_profile jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_level text := lower(coalesce(p_profile->>'level', 'a1'));
  v_track text := lower(coalesce(p_profile->>'track', ''));
  v_goals text[] := (
    select coalesce(array_agg(lower(g)), '{}')
    from jsonb_array_elements_text(coalesce(p_profile->'goals', '[]'::jsonb)) g
  );
  v_contexts text[] := (
    select coalesce(array_agg(lower(c)), '{}')
    from jsonb_array_elements_text(coalesce(p_profile->'contexts', '[]'::jsonb)) c
  );
  v_skills text[] := (
    select coalesce(array_agg(lower(s)), '{}')
    from jsonb_array_elements_text(coalesce(p_profile->'skills', '[]'::jsonb)) s
  );
  v_level_rank int;
begin
  select min(x.rk) into v_level_rank
    from (values ('a0',0),('a1',1),('a2',2),('b1',3),('b2',4),('c1',5),('c2',6),('step',6)) x(lv, rk)
    where x.lv = v_level;
  v_level_rank := coalesce(v_level_rank, 1);

  return coalesce((
    with granular_seq(level_pref, academy_id, seq) as (
      values
        -- A0: phonics first (alphabet → sounds → connecting letters), then words
        ('a0','a0-spelling-sounds',0),('a0','a0-social-english',1),('a0','a0-home-words',2),('a0','a0-sentence-building',3),('a0','a0-question-words',4),('a0','a0-error-clinic',5),
        ('a1','a1-core-words',0),('a1','a1-present-simple',1),('a1','a1-daily-verbs',2),('a1','a1-can-requests',3),('a1','a1-place-time',4),('a1','a1-possession',5),('a1','a1-time-numbers',6),('a1','a1-vocab-context',7),
        ('a2','a2-past-simple',0),('a2','a2-future-plans',1),
        ('b1','b1-connectors-opinions',0),
        ('b2','b2-professional-comm',0),
        ('c1','c1-advanced-english',0),
        ('c2','c2-near-native',0),
        ('step','step-exam-prep',0)
    ),
    scored as (
      select a.id,
        greatest(0, 3 - abs(coalesce(
          (select x.rk from (values ('a0',0),('a1',1),('a2',2),('b1',3),('b2',4),('c1',5),('c2',6),('step',6)) x(lv, rk)
           where x.lv = lower(a.level)), 1) - v_level_rank)) as level_fit,
        (
          select count(*) from public.academy_tags t
          where t.academy_id = a.id
            and ((t.tag_type = 'goal' and lower(t.tag_value) = any(v_goals))
              or (t.tag_type = 'context' and lower(t.tag_value) = any(v_contexts))
              or (t.tag_type = 'skill' and lower(t.tag_value) = any(v_skills)))
        ) as tag_hits,
        a.sort_order, a.id as tiebreak,
        coalesce(gs.seq, 1000) as route_priority
      from public.academies a
      left join granular_seq gs on gs.academy_id = a.id and gs.level_pref = lower(a.level)
      where a.active = true
        and (
          (v_track = 'step' and exists (
            select 1 from public.track_academies ta
            where ta.track_id = 'track-step-exam' and ta.academy_id = a.id
          ))
          or
          (coalesce(v_track,'') <> 'step' and not exists (
            select 1 from public.track_academies ta
            where ta.track_id = 'track-step-exam' and ta.academy_id = a.id
          ))
        )
    )
    select jsonb_agg(jsonb_build_object('id', id, 'score', level_fit * 10 + tag_hits)
      order by level_fit desc, route_priority asc, tag_hits desc, sort_order asc, tiebreak asc)
    from scored
  ), '[]'::jsonb);
end;
$function$;

-- 2. Create new "Letter Sounds" lesson (a0ss-letter-sounds) in a0-spelling-sounds academy
-- This lesson teaches the SOUND each letter makes, not just its name
INSERT INTO lessons (id, title_en, title_ar, minutes, level, active, kind)
VALUES ('a0ss-letter-sounds', 'Letter Sounds', 'اصوات الحروف', 8, 'A0', true, 'core');

-- Add to academy_lessons (insert at position 1, after alphabet, before vowels)
INSERT INTO academy_lessons (academy_id, lesson_id, sort_order)
VALUES ('a0-spelling-sounds', 'a0ss-letter-sounds', 1);

-- Shift existing lessons' sort_order up by 1 (alphabet stays at 0)
UPDATE academy_lessons SET sort_order = sort_order + 1
WHERE academy_id = 'a0-spelling-sounds' AND lesson_id != 'a0ss-alphabet' AND lesson_id != 'a0ss-letter-sounds';

-- 3. Lesson items for Letter Sounds lesson
-- Teaching the SOUND each letter makes, with Arabic approximation
-- Consonants: the sound they make + a word example
-- Vowels: the short sound + a word example
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr) VALUES
-- Explanation
('a0ss-letter-sounds', 0, 'explain', 'Every letter has a name and a sound. The sound is what you hear in words.',
 'كل حرف له اسم وصوت. الصوت هو اللي تسمعه بالكلمات. الحرف اسمه شي وصوته شي ثاني. مثلا حرف B اسمه بي بس صوته بـ.',
 'يفري ليتر هز ا نيم اند ا صاوند. ذا صاوند از وت يو هير ان وردز.', null, null, null),

-- Vowels - short sounds (most common first for reading)
('a0ss-letter-sounds', 1, 'word', 'a says ah', 'صوت a: آ', 'آ',
 'a says ah. Like in apple.', 'صوت a هو آ. مثل تفاحه.', 'اي سايز آ. لايك ان ابل.'),
('a0ss-letter-sounds', 2, 'word', 'e says eh', 'صوت e: اي', 'اي',
 'e says eh. Like in egg.', 'صوت e هو اي. مثل البيضه.', 'اي سايز اي. لايك ان اق.'),
('a0ss-letter-sounds', 3, 'word', 'i says ih', 'صوت i: اِ', 'اِ',
 'i says ih. Like in ink.', 'صوت i هو اِ. مثل الحبر.', 'اي سايز اِ. لايك ان انك.'),
('a0ss-letter-sounds', 4, 'word', 'o says oh', 'صوت o: او', 'او',
 'o says oh. Like in orange.', 'صوت o هو او. مثل البرتقال.', 'او سايز او. لايك ان اورنج.'),
('a0ss-letter-sounds', 5, 'word', 'u says uh', 'صوت u: اَ', 'اَ',
 'u says uh. Like in up.', 'صوت u هو اَ. مثل فوق.', 'يو سايز اَ. لايك ان اب.'),

-- Consonants - the sound they make
('a0ss-letter-sounds', 6, 'word', 'b says buh', 'صوت b: بـ', 'بـ',
 'b says buh. Like in book.', 'صوت b هو بـ. مثل الكتاب.', 'بي سايز بـ. لايك ان بوك.'),
('a0ss-letter-sounds', 7, 'word', 'c says cah', 'صوت c: كـ', 'كـ',
 'c says cah. Like in cat.', 'صوت c هو كـ. مثل القطه.', 'سي سايز كـ. لايك ان كات.'),
('a0ss-letter-sounds', 8, 'word', 'd says duh', 'صوت d: دِ', 'دِ',
 'd says duh. Like in dog.', 'صوت d هو دِ. مثل الكلب.', 'دي سايز دِ. لايك ان دوق.'),
('a0ss-letter-sounds', 9, 'word', 'f says fff', 'صوت f: فـ', 'فـ',
 'f says fff. Like in fish.', 'صوت f هو فـ. مثل السمك.', 'اف سايز فـ. لايك ان فيش.'),
('a0ss-letter-sounds', 10, 'word', 'g says guh', 'صوت g: قـ', 'قـ',
 'g says guh. Like in good.', 'صوت g هو قـ. مثل زين.', 'جي سايز قـ. لايك ان قود.'),
('a0ss-letter-sounds', 11, 'word', 'h says huh', 'صوت h: هـ', 'هـ',
 'h says huh. Like in house.', 'صوت h هو هـ. مثل البيت.', 'ايتش سايز هـ. لايك ان هاوس.'),
('a0ss-letter-sounds', 12, 'word', 'j says juh', 'صوت j: جـ', 'جـ',
 'j says juh. Like in juice.', 'صوت j هو جـ. مثل العصير.', 'جاي سايز جـ. لايك ان جوس.'),
('a0ss-letter-sounds', 13, 'word', 'k says kuh', 'صوت k: كـ', 'كـ',
 'k says kuh. Like in key.', 'صوت k هو كـ. مثل المفتاح.', 'كاي سايز كـ. لايك ان كي.'),
('a0ss-letter-sounds', 14, 'word', 'l says luh', 'صوت l: لـ', 'لـ',
 'l says luh. Like in love.', 'صوت l هو لـ. مثل الحب.', 'ال سايز لـ. لايك ان لاف.'),
('a0ss-letter-sounds', 15, 'word', 'm says muh', 'صوت m: مـ', 'مـ',
 'm says muh. Like in man.', 'صوت m هو مـ. مثل الرجل.', 'ام سايز مـ. لايك ان مان.'),
('a0ss-letter-sounds', 16, 'word', 'n says nuh', 'صوت n: نـ', 'نـ',
 'n says nuh. Like in no.', 'صوت n هو نـ. مثل لا.', 'ان سايز نـ. لايك ان نو.'),
('a0ss-letter-sounds', 17, 'word', 'p says puh', 'صوت p: پـ', 'پـ',
 'p says puh. Like in pen.', 'صوت p هو پـ. مثل القلم.', 'بي سايز پـ. لايك ان بن.'),
('a0ss-letter-sounds', 18, 'word', 'q says quh', 'صوت q: كوو', 'كوو',
 'q says quh. Like in queen.', 'صوت q هو كوو. مثل الملكه.', 'كيو سايز كوو. لايك ان كوين.'),
('a0ss-letter-sounds', 19, 'word', 'r says ruh', 'صوت r: ر', 'ر',
 'r says ruh. Like in red.', 'صوت r هو ر. مثل الاحمر.', 'ار سايز ر. لايك ان رد.'),
('a0ss-letter-sounds', 20, 'word', 's says sss', 'صوت s: سـ', 'سـ',
 's says sss. Like in sun.', 'صوت s هو سـ. مثل الشمس.', 'اس سايز سـ. لايك ان سن.'),
('a0ss-letter-sounds', 21, 'word', 't says tuh', 'صوت t: تـ', 'تـ',
 't says tuh. Like in time.', 'صوت t هو تـ. مثل الوقت.', 'تي سايز تـ. لايك ان تايم.'),
('a0ss-letter-sounds', 22, 'word', 'v says vvv', 'صوت v: ڤـ', 'ڤـ',
 'v says vvv. Like in very.', 'صوت v هو ڤـ. مثل جدا.', 'ڤي سايز ڤـ. لايك ان ڤري.'),
('a0ss-letter-sounds', 23, 'word', 'w says wuh', 'صوت w: وو', 'وو',
 'w says wuh. Like in water.', 'صوت w هو وو. مثل الماء.', 'دبليو سايز وو. لايك ان واتر.'),
('a0ss-letter-sounds', 24, 'word', 'x says kss', 'صوت x: كـس', 'كـس',
 'x says kss. Like in box.', 'صوت x هو كـس. مثل الصندوق.', 'اكس سايز كـس. لايك ان بوكس.'),
('a0ss-letter-sounds', 25, 'word', 'y says yuh', 'صوت y: يـ', 'يـ',
 'y says yuh. Like in yes.', 'صوت y هو يـ. مثل ايه.', 'واي سايز يـ. لايك ان يس.'),
('a0ss-letter-sounds', 26, 'word', 'z says zzz', 'صوت z: ز', 'ز',
 'z says zzz. Like in zoo.', 'صوت z هو ز. مثل حديقه الحيوان.', 'زي سايز ز. لايك ان زو.'),

-- Sentence items: using the sounds in words
('a0ss-letter-sounds', 27, 'sentence', 'a says ah. Apple starts with ah.', 'صوت a هو آ. التفاحه تبدا بآ.', 'اي سايز آ. ابل ستارتز ويذ آ.', null, null, null),
('a0ss-letter-sounds', 28, 'sentence', 'b says buh. Book starts with buh.', 'صوت b هو بـ. الكتاب يبدا ببـ.', 'بي سايز بـ. بوك ستارتز ويذ بـ.', null, null, null),
('a0ss-letter-sounds', 29, 'sentence', 'c says cah. Cat starts with cah.', 'صوت c هو كـ. القطه تبدا بكـ.', 'سي سايز كـ. كات ستارتز ويذ كـ.', null, null, null),
('a0ss-letter-sounds', 30, 'sentence', 'd says duh. Dog starts with duh.', 'صوت d هو دِ. الكلب يبدا بدِ.', 'دي سايز دِ. دوق ستارتز ويذ دِ.', null, null, null),
('a0ss-letter-sounds', 31, 'sentence', 's says sss. Sun starts with sss.', 'صوت s هو سـ. الشمس تبدا بسـ.', 'اس سايز سـ. سن ستارتز ويذ سـ.', null, null, null),
('a0ss-letter-sounds', 32, 'sentence', 't says tuh. Time starts with tuh.', 'صوت t هو تـ. الوقت يبدا بتـ.', 'تي سايز تـ. تايم ستارتز ويذ تـ.', null, null, null),
('a0ss-letter-sounds', 33, 'sentence', 'm says muh. Man starts with muh.', 'صوت m هو مـ. الرجل يبدا بمـ.', 'ام سايز مـ. مان ستارتز ويذ مـ.', null, null, null),
('a0ss-letter-sounds', 34, 'sentence', 'n says nuh. No starts with nuh.', 'صوت n هو نـ. لا تبدا بنـ.', 'ان سايز نـ. نو ستارتز ويذ نـ.', null, null, null),

-- Summary explanation
('a0ss-letter-sounds', 35, 'explain', 'The letter name is for spelling. The letter sound is for reading and speaking.',
 'اسم الحرف للاملاء. صوت الحرف للقراءه والكلام. اذا سولك احد: كيف تهجي اسمك؟ تقول اسماء الحروف. اذا تبغى تقرا كلمه؟ تستخدم اصوات الحروف.',
 'ذا ليتر نيم از فور سبيلنج. ذا ليتر صاوند از فور ريدنج اند سبيكنق.', null, null, null);

-- 4. Exercises for Letter Sounds lesson
INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
-- Choose: which letter makes this sound?
('a0ss-letter-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته بـ؟","en":"Which letter says buh?","tr":"ويتش ليتر سايز بـ؟"},"options":[{"t":"B","ok":true,"tr":"بي"},{"t":"D","ok":false,"tr":"دي"},{"t":"P","ok":false,"tr":"بي"}],"hint":{"ar":"B يقول بـ مثل book.","en":"B says buh like in book."}}'),
('a0ss-letter-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته كـ؟","en":"Which letter says cah?","tr":"ويتش ليتر سايز كـ؟"},"options":[{"t":"C","ok":true,"tr":"سي"},{"t":"K","ok":false,"tr":"كاي"},{"t":"S","ok":false,"tr":"اس"}],"hint":{"ar":"C يقول كـ مثل cat.","en":"C says cah like in cat."}}'),
('a0ss-letter-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته سـ؟","en":"Which letter says sss?","tr":"ويتش ليتر سايز سـ؟"},"options":[{"t":"S","ok":true,"tr":"اس"},{"t":"Z","ok":false,"tr":"زي"},{"t":"C","ok":false,"tr":"سي"}],"hint":{"ar":"S يقول سـ مثل sun.","en":"S says sss like in sun."}}'),
('a0ss-letter-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته آ؟","en":"Which letter says ah?","tr":"ويتش ليتر سايز آ؟"},"options":[{"t":"A","ok":true,"tr":"اي"},{"t":"O","ok":false,"tr":"او"},{"t":"E","ok":false,"tr":"اي"}],"hint":{"ar":"A يقول آ مثل apple.","en":"A says ah like in apple."}}'),
('a0ss-letter-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته مـ؟","en":"Which letter says muh?","tr":"ويتش ليتر سايز مـ؟"},"options":[{"t":"M","ok":true,"tr":"ام"},{"t":"N","ok":false,"tr":"ان"},{"t":"L","ok":false,"tr":"ال"}],"hint":{"ar":"M يقول مـ مثل man.","en":"M says muh like in man."}}'),
('a0ss-letter-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته دِ؟","en":"Which letter says duh?","tr":"ويتش ليتر سايز دِ؟"},"options":[{"t":"D","ok":true,"tr":"دي"},{"t":"B","ok":false,"tr":"بي"},{"t":"T","ok":false,"tr":"تي"}],"hint":{"ar":"D يقول دِ مثل dog.","en":"D says duh like in dog."}}'),
('a0ss-letter-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته تـ؟","en":"Which letter says tuh?","tr":"ويتش ليتر سايز تـ؟"},"options":[{"t":"T","ok":true,"tr":"تي"},{"t":"D","ok":false,"tr":"دي"},{"t":"P","ok":false,"tr":"بي"}],"hint":{"ar":"T يقول تـ مثل time.","en":"T says tuh like in time."}}'),
('a0ss-letter-sounds', 'choose', '{"type":"choose","question":{"ar":"اي حرف صوته نـ؟","en":"Which letter says nuh?","tr":"ويتش ليتر سايز نـ؟"},"options":[{"t":"N","ok":true,"tr":"ان"},{"t":"M","ok":false,"tr":"ام"},{"t":"R","ok":false,"tr":"ار"}],"hint":{"ar":"N يقول نـ مثل no.","en":"N says nuh like in no."}}'),

-- Order: build the sound sentence
('a0ss-letter-sounds', 'order', '{"type":"order","ar":"صوت a هو آ","prompt":{"ar":"رتب: a says ah.","en":"Build: a says ah.","tr":"بيلد: اي سايز آ."},"answer":["a","says","ah"],"tokens":["a","says","ah"],"hint":{"ar":"الحرف بعدين says بعدين الصوت.","en":"Letter + says + sound."}}'),
('a0ss-letter-sounds', 'order', '{"type":"order","ar":"صوت b هو بـ","prompt":{"ar":"رتب: b says buh.","en":"Build: b says buh.","tr":"بيلد: بي سايز بـ."},"answer":["b","says","buh"],"tokens":["b","says","buh"],"hint":{"ar":"الحرف بعدين says بعدين الصوت.","en":"Letter + says + sound."}}'),
('a0ss-letter-sounds', 'order', '{"type":"order","ar":"صوت s هو سـ","prompt":{"ar":"رتب: s says sss.","en":"Build: s says sss.","tr":"بيلد: اس سايز سـ."},"answer":["s","says","sss"],"tokens":["s","says","sss"],"hint":{"ar":"الحرف بعدين says بعدين الصوت.","en":"Letter + says + sound."}}'),

-- Translate: sound to Arabic
('a0ss-letter-sounds', 'translate', '{"type":"translate","dir":"en-ar","source":"b says buh.","accept":["صوت b هو بـ","بي سايز بـ","ب يقول بـ"],"answer":"صوت b هو بـ"}'),
('a0ss-letter-sounds', 'translate', '{"type":"translate","dir":"en-ar","source":"a says ah.","accept":["صوت a هو آ","اي سايز آ","a يقول آ"],"answer":"صوت a هو آ"}'),

-- Spell: spell the word that starts with this sound
('a0ss-letter-sounds', 'spell', '{"type":"spell","answer":"CAT","display":"C A T","meaning":"قطه","translit":"كات","options":[{"t":"C","ok":true},{"t":"A","ok":true},{"t":"T","ok":true},{"t":"B","ok":false}]}'),
('a0ss-letter-sounds', 'spell', '{"type":"spell","answer":"DOG","display":"D O G","meaning":"كلب","translit":"دوق","options":[{"t":"D","ok":true},{"t":"O","ok":true},{"t":"G","ok":true},{"t":"B","ok":false}]}');

-- 5. Update the academy_lessons sort_order for a0-spelling-sounds to include the new lesson
-- alphabet=0, letter-sounds=1, vowels=2, sh-ch=3, th-sound=4, silent-letters=5, spell-cvc-at=6, ...
-- (sort_order was already shifted in step 2, but let's verify the new lesson is at position 1)
