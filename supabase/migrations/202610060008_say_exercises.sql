-- Add audio recording practice (say exercises) to Saudi Pronunciation Coach
-- Each exercise shows a word, student speaks it, gets scored by Whisper
-- Payload format: { target, meaning, translit, tip_ar, contrast_ar }

INSERT INTO lesson_exercises (lesson_id, type, payload) VALUES
-- ===== P vs B: say each word with the correct sound =====
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"pen","meaning":"قلم","translit":"بن","tip_ar":"P فيه هوا بدون صوت. سكر شفايفك واطلع هوا خفيف.","contrast_ar":"لا تقل ben — B فيه صوت مو هوا."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"book","meaning":"كتاب","translit":"بوك","tip_ar":"B فيه صوت. قلها مع صوت بحلقك.","contrast_ar":"لا تقل P — P فيه هوا مو صوت."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"park","meaning":"حديقه","translit":"بارك","tip_ar":"P فيه هوا. اطلع نفخه هوا مع P.","contrast_ar":"لا تقل bark — B فيه صوت."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"big","meaning":"كبير","translit":"بيق","tip_ar":"B فيه صوت. حس رقبتك ترجف مع B."}'),

-- ===== V vs F: say each word with the correct sound =====
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"van","meaning":"شاحنه","translit":"ڤان","tip_ar":"V فيه اهتزاز. حط اسنانك على شفه تحت واهتز.","contrast_ar":"لا تقل fan — F فيه هوا بس ما فيه صوت."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"fan","meaning":"مروحه","translit":"فان","tip_ar":"F فيه هوا بس. نفس مكان V بس ما فيه اهتزاز.","contrast_ar":"لا تقل van — V فيه صوت."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"very","meaning":"جدا","translit":"ڤري","tip_ar":"V فيه اهتزاز. حس رقبتك ترجف."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"five","meaning":"خمسه","translit":"فايڤ","tip_ar":"F فيه هوا، V فيه اهتزاز. الحرفين بكلمه وحده: فاي-ڤ."}'),

-- ===== R vs L: say each word with the correct tongue position =====
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"red","meaning":"احمر","translit":"ريد","tip_ar":"R يرجع اللسان لورا وما يلمس. قل را را را اول.","contrast_ar":"لا تقل led — L يلمس سقف الفم."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"led","meaning":"لمبه","translit":"لد","tip_ar":"L يلمس سقف الفم ورا الاسنان. قل لا لا لا اول.","contrast_ar":"لا تقل red — R ما يلمس."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"rice","meaning":"رز","translit":"رايس","tip_ar":"R يرجع لورا. لسانك ما يلمس."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"lice","meaning":"قمل","translit":"لايس","tip_ar":"L يلمس سقف الفم. لسانك يلمس ورا الاسنان."}'),

-- ===== Final consonants: say the word, stop cleanly =====
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"book","meaning":"كتاب","translit":"بوك","tip_ar":"قف عند k. ما تضيف صوت. قل الكلمه واطف الصوت فجاه.","contrast_ar":"لا تقل booka — ما فيه صوت بالاخر."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"cat","meaning":"قطه","translit":"كات","tip_ar":"قف عند t. ما تضيف صوت. اطف الصوت فجاه.","contrast_ar":"لا تقل cata — ما فيه صوت بالاخر."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"big","meaning":"كبير","translit":"بيق","tip_ar":"قف عند g. ما تضيف صوت.","contrast_ar":"لا تقل bigga — ما فيه صوت بالاخر."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"hot","meaning":"حار","translit":"هات","tip_ar":"قف عند t. اطف الصوت فجاه.","contrast_ar":"لا تقل hota — ما فيه صوت بالاخر."}'),

-- ===== Sentence practice: combine the hard sounds =====
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"The van is very big.","meaning":"الشاحنه كبيره جدا","translit":"ذا ڤان از ڤري بيق","tip_ar":"V فيه اهتزاز، B فيه صوت. قف عند g بدون صوت زياده."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"Pen or book?","meaning":"قلم ولا كتاب؟","translit":"بن اور بوك","tip_ar":"P فيه هوا، B فيه صوت. قف عند k."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"Red and light.","meaning":"احمر وضوء","translit":"ريد اند لايت","tip_ar":"R يرجع لورا، L يلمس. انتبه للفرق."}'),
('a0ss-saudi-sounds', 'say', '{"type":"say","target":"Five fans.","meaning":"خمس مراوح","translit":"فايڤ فانز","tip_ar":"F فيه هوا، V فيه اهتزاز، قف عند s."}');
