-- ============================================================
-- 202609150001 · A0 Home Words academy (كلمات البيت)
-- ------------------------------------------------------------
-- New A0 academy teaching the foundation function words one by
-- one, in Saudi home dialect, no hamza, no dashes. 19 lessons,
-- each with 3 main words + explain cards + home example
-- sentences + 8 exercises (3 choose + 2 order + 2 translate +
-- 1 spell = 4+ production activities, so the existing mastery
-- gate in pel_lesson_stage.js (>= 60 percent first try
-- production) engages for every lesson).
-- Lesson chain is also wired via prereqs so the path order is
-- explicit. Academy sits FIRST in the A0 route
-- (student_route granular_seq updated below).
-- Idempotent: safe to re run.
-- ============================================================
BEGIN;

insert into public.academies (id, name_en, name_ar, icon, color_from, color_to, difficulty, level, sort_order, active)
values ('a0-home-words', 'Home Words', 'كلمات البيت', 'home', '#C8A96A', '#A88345', 'Beginner', 'A0', 99, true)
on conflict (id) do update set name_en = excluded.name_en, name_ar = excluded.name_ar, icon = excluded.icon,
  color_from = excluded.color_from, color_to = excluded.color_to, difficulty = excluded.difficulty,
  level = excluded.level, sort_order = excluded.sort_order, active = excluded.active, updated_at = now();

insert into public.track_academies (track_id, academy_id, sort_order)
values ('track-a0-foundations', 'a0-home-words', -1)
on conflict (track_id, academy_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-01-yes-no', 'Yes, No, Not', 'ايه، لا، مو', 5, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-01-yes-no', 0)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-02-i-you-me', 'I, You, Me', 'انا، انت، لي', 5, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-01-yes-no}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-02-i-you-me', 10)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-03-my-mine', 'My, Mine, Your, Yours', 'تبعي وتبعك', 6, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-02-i-you-me}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-03-my-mine', 20)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-04-he-she-him', 'He, She, Him, Her', 'هو وهي', 7, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-03-my-mine}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-04-he-she-him', 30)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-05-they-them', 'They, Them, Their, Theirs', 'هم وتبعهم', 6, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-04-he-she-him}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-05-they-them', 40)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-06-this-these-those', 'This, These, Those', 'هذا، هذول، ذولك', 6, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-05-they-them}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-06-this-these-those', 50)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-07-in-on-under', 'In, On, Under, Above', 'جوا، على، تحت، فوق', 7, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-06-this-these-those}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-07-in-on-under', 60)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-08-on-off', 'On and Off: the Two Meanings', 'شغال ومطفي: معنى on الثاني', 6, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-07-in-on-under}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-08-on-off', 70)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-09-here-there', 'Here, There, Over There', 'هنا وهناك', 5, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-08-on-off}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-09-here-there', 80)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-10-up-down', 'Up and Down', 'فوق وتحت', 5, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-09-here-there}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-10-up-down', 90)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-11-inside-outside', 'Inside and Outside', 'جوا وبرا', 5, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-10-up-down}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-11-inside-outside', 100)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-12-left-right', 'Left, Right, Middle', 'يمين وشمال ووسط', 7, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-11-inside-outside}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-12-left-right', 110)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-13-the', 'The Word The', 'كلمة ذا: التعريف', 6, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-12-left-right}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-13-the', 120)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-14-come-go-bring', 'Come, Go, Bring', 'تعال، روح، جيب', 6, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-13-the}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-14-come-go-bring', 130)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-15-pick-drop-carry', 'Pick Up, Drop, Carry', 'ارفع، طرح، احمل', 7, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-14-come-go-bring}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-15-pick-drop-carry', 140)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-16-good-bad-fast-slow', 'Good, Bad, Fast, Slow', 'زين، خايب، سريع، بطي', 6, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-15-pick-drop-carry}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-16-good-bad-fast-slow', 150)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-17-er-ed', 'Er and Ed: Faster and Played', 'قاعدة ار واد: اسرع ولعب', 7, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-16-good-bad-fast-slow}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-17-er-ed', 160)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-18-if-will', 'If, Will and So', 'لو وراح وف', 7, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-17-er-ed}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-18-if-will', 170)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-19-like', 'Like: Two Meanings', 'لايك: زي واحب', 7, 'A0', true, 'core', '{vocabulary,grammar}', '{}', '{}', '{a0hw-18-if-will}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-19-like', 180)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


insert into public.lessons (id, title_en, title_ar, minutes, level, active, kind, skills, goals, contexts, prereqs, version)
values ('a0hw-19-cola-time', 'The Home Scene: Pour Me Some Cola', 'مشهد البيت: صب لي كولا', 8, 'A0', true, 'checkpoint', '{vocabulary,grammar,speaking}', '{}', '{}', '{a0hw-19-like}', 1)
on conflict (id) do update set title_en = excluded.title_en, title_ar = excluded.title_ar, minutes = excluded.minutes,
  kind = excluded.kind, skills = excluded.skills, prereqs = excluded.prereqs, active = true, version = excluded.version, updated_at = now();

insert into public.academy_lessons (academy_id, lesson_id, sort_order)
values ('a0-home-words', 'a0hw-19-cola-time', 190)
on conflict (academy_id, lesson_id) do update set sort_order = excluded.sort_order;


delete from public.lesson_items where lesson_id in ('a0hw-01-yes-no','a0hw-02-i-you-me','a0hw-03-my-mine','a0hw-04-he-she-him','a0hw-05-they-them','a0hw-06-this-these-those','a0hw-07-in-on-under','a0hw-08-on-off','a0hw-09-here-there','a0hw-10-up-down','a0hw-11-inside-outside','a0hw-12-left-right','a0hw-13-the','a0hw-14-come-go-bring','a0hw-15-pick-drop-carry','a0hw-16-good-bad-fast-slow','a0hw-17-er-ed','a0hw-18-if-will','a0hw-19-like','a0hw-19-cola-time');
delete from public.lesson_exercises where lesson_id in ('a0hw-01-yes-no','a0hw-02-i-you-me','a0hw-03-my-mine','a0hw-04-he-she-him','a0hw-05-they-them','a0hw-06-this-these-those','a0hw-07-in-on-under','a0hw-08-on-off','a0hw-09-here-there','a0hw-10-up-down','a0hw-11-inside-outside','a0hw-12-left-right','a0hw-13-the','a0hw-14-come-go-bring','a0hw-15-pick-drop-carry','a0hw-16-good-bad-fast-slow','a0hw-17-er-ed','a0hw-18-if-will','a0hw-19-like','a0hw-19-cola-time');

insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-01-yes-no', 0, 'word', 'yes', 'ايه', 'يس', 'Yes, please.', 'ايه، لو سمحت.', 'يس، بليز.', null, null),
  ('a0hw-01-yes-no', 1, 'word', 'no', 'لا', 'نو', 'No, thank you.', 'لا، مشكور.', 'نو، ثانك يو.', null, null),
  ('a0hw-01-yes-no', 2, 'word', 'not', 'مو', 'نات', 'I am not hungry.', 'انا مو جوعان.', 'اي ام نات هنقري.', null, null),
  ('a0hw-01-yes-no', 3, 'explain', 'Yes for yes, No for no, Not to deny. Not comes after am, is, are.', 'السالفة سهلة: Yes يعني ايه، No يعني لا. و Not معناها مو، وتجي بعد am او is او are: I am not يعني انا مو. اذا احد سولك تبغى قهوة وتبغىها قول Yes please، واذا ما تبغىها قول No thank you. كذا صرت ترد على الناس من اول درس.', '', null, null, null, null, null),
  ('a0hw-01-yes-no', 4, 'sentence', 'Yes, please.', 'ايه، لو سمحت.', 'يس، بليز.', null, null, null, null, null),
  ('a0hw-01-yes-no', 5, 'sentence', 'No, thank you.', 'لا، مشكور.', 'نو، ثانك يو.', null, null, null, null, null),
  ('a0hw-01-yes-no', 6, 'sentence', 'I am not hungry.', 'انا مو جوعان.', 'اي ام نات هنقري.', null, null, null, null, null),
  ('a0hw-01-yes-no', 7, 'sentence', 'It is not cold.', 'الجو مو بارد.', 'ات از نات كولد.', null, null, null, null, null),
  ('a0hw-01-yes-no', 8, 'sentence', 'This is not my cup.', 'هذا مو كوبي.', 'ذس از نات ماي كاب.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-01-yes-no', 0, 'choose', '{"type": "choose", "question": {"ar": "تبغى شاي؟ اذا تبغى تقول: ___", "en": "Do you want tea? You say: ___", "tr": "دو يو وانت تشاي؟ يو سي: ___"}, "options": [{"t": "Yes", "ok": true, "tr": "يس"}, {"t": "No", "ok": false, "tr": "نو"}, {"t": "Not", "ok": false, "tr": "نات"}], "hint": {"ar": "تبغى الشاي يعني ايه.", "en": "Wanting means yes."}}'::jsonb, null, null, null),
  ('a0hw-01-yes-no', 1, 'choose', '{"type": "choose", "question": {"ar": "الجو بارد. كيف تقول: الجو مو بارد؟", "en": "The weather is not cold. Which word denies?", "tr": "ذا ويذر از نات كولد. وتش وورد دينايز؟"}, "options": [{"t": "not", "ok": true, "tr": "نات"}, {"t": "no", "ok": false, "tr": "نو"}, {"t": "yes", "ok": false, "tr": "يس"}], "hint": {"ar": "مو تعني not.", "en": "Not denies the sentence."}}'::jsonb, null, null, null),
  ('a0hw-01-yes-no', 2, 'choose', '{"type": "choose", "question": {"ar": "امك نادتك على العشا، تبغى تقول ايه بادب: ___", "en": "Your mom calls you for dinner. You politely say: ___", "tr": "يور موم كولز يو فور دينر. يو بولايتلي سي: ___"}, "options": [{"t": "Yes, please", "ok": true, "tr": "يس بليز"}, {"t": "No", "ok": false, "tr": "نو"}, {"t": "Not", "ok": false, "tr": "نات"}], "hint": {"ar": "ايه بادب مع بليز.", "en": "Yes with please is polite."}}'::jsonb, null, null, null),
  ('a0hw-01-yes-no', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: انا مو جوعان.", "en": "Build: I am not hungry.", "tr": "بلد: اي ام نات هنقري"}, "tokens": ["I", "am", "not", "hungry"], "answer": ["I", "am", "not", "hungry"], "ar": "انا مو جوعان", "hint": {"ar": "اي بعدين ام بعدين not بعدين جوعان.", "en": "I + am + not + hungry."}}'::jsonb, null, null, null),
  ('a0hw-01-yes-no', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: لا، مشكور.", "en": "Build: No, thank you.", "tr": "بلد: نو، ثانك يو"}, "tokens": ["No", "thank", "you"], "answer": ["No", "thank", "you"], "ar": "لا، مشكور", "hint": {"ar": "نو بعدين ثانك يو.", "en": "No + thank you."}}'::jsonb, null, null, null),
  ('a0hw-01-yes-no', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "It is not cold.", "answer": "الجو مو بارد.", "accept": ["الجو مو بارد", "الجو مو بارد.", "جو مو بارد"]}'::jsonb, null, null, null),
  ('a0hw-01-yes-no', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "انا مو جوعان.", "answer": "I am not hungry.", "accept": ["I am not hungry", "I am not hungry.", "Im not hungry"]}'::jsonb, null, null, null),
  ('a0hw-01-yes-no', 7, 'spell', '{"type": "spell", "answer": "NO", "display": "N O", "meaning": "لا", "options": [{"t": "N", "ok": true}, {"t": "O", "ok": true}, {"t": "A", "ok": false}, {"t": "T", "ok": false}], "translit": "نو"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-02-i-you-me', 0, 'word', 'I', 'انا', 'اي', 'I am here.', 'انا هنا.', 'اي ام هير.', null, null),
  ('a0hw-02-i-you-me', 1, 'word', 'you', 'انت', 'يو', 'Can you help me?', 'تقدر تساعدني؟', 'كان يو هيلب مي؟', null, null),
  ('a0hw-02-i-you-me', 2, 'word', 'me', 'لي، ياي', 'مي', 'Give me the cup.', 'عطني الكوب.', 'قيف مي ذا كاب.', null, null),
  ('a0hw-02-i-you-me', 3, 'explain', 'I is always a big letter. You is the person in front of you. Me comes after the verb.', 'خلنا نتفق: I يعني انا ودايما نكتبها حرف كبير، لو كتبتها i صغيرة تعتبر غلطة. You يعني انت، الشخص اللي قدامك. اما Me فهي انا بعد الفعل: give me يعني عطني، help me ساعدني. يعني I تفتح الجملة و Me تجي بعدها.', '', null, null, null, null, null),
  ('a0hw-02-i-you-me', 4, 'sentence', 'I am here.', 'انا هنا.', 'اي ام هير.', null, null, null, null, null),
  ('a0hw-02-i-you-me', 5, 'sentence', 'Can you help me?', 'تقدر تساعدني؟', 'كان يو هيلب مي؟', null, null, null, null, null),
  ('a0hw-02-i-you-me', 6, 'sentence', 'Give me the cup.', 'عطني الكوب.', 'قيف مي ذا كاب.', null, null, null, null, null),
  ('a0hw-02-i-you-me', 7, 'sentence', 'I see you.', 'اشوفك.', 'اي سي يو.', null, null, null, null, null),
  ('a0hw-02-i-you-me', 8, 'sentence', 'Call me tonight.', 'كلمني الليلة.', 'كول مي تونايت.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-02-i-you-me', 0, 'choose', '{"type": "choose", "question": {"ar": "تبغى اخوك يعطيك الكوب، تقول: ___", "en": "You want the cup. You say: ___", "tr": "يو وانت ذا كاب. يو سي: ___"}, "options": [{"t": "Give me the cup", "ok": true, "tr": "قيف مي ذا كاب"}, {"t": "Give I the cup", "ok": false, "tr": "قيف اي ذا كاب"}, {"t": "Give you the cup", "ok": false, "tr": "قيف يو ذا كاب"}], "hint": {"ar": "بعد الفعل نستخدم me.", "en": "After the verb we use me."}}'::jsonb, null, null, null),
  ('a0hw-02-i-you-me', 1, 'choose', '{"type": "choose", "question": {"ar": "انا ابدا الجملة عن نفسي ب: ___", "en": "I start talking about myself with: ___", "tr": "اي ستارت توكينق اباوت مايسيلف ويذ: ___"}, "options": [{"t": "I", "ok": true, "tr": "اي"}, {"t": "Me", "ok": false, "tr": "مي"}, {"t": "My", "ok": false, "tr": "ماي"}], "hint": {"ar": "I في اول الجملة.", "en": "I starts the sentence."}}'::jsonb, null, null, null),
  ('a0hw-02-i-you-me', 2, 'choose', '{"type": "choose", "question": {"ar": "كيف تكتب انا بالانجليزي؟", "en": "How do you write I?", "tr": "هاو دو يو رايت اي؟"}, "options": [{"t": "I big", "ok": true, "tr": "اي كبيرة"}, {"t": "i small", "ok": false, "tr": "اي صغيرة"}, {"t": "ii", "ok": false, "tr": "اي مرتين"}], "hint": {"ar": "I دايما حرف كبير.", "en": "I is always a capital letter."}}'::jsonb, null, null, null),
  ('a0hw-02-i-you-me', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: عطني الكوب.", "en": "Build: Give me the cup.", "tr": "بلد: قيف مي ذا كاب"}, "tokens": ["Give", "me", "the", "cup"], "answer": ["Give", "me", "the", "cup"], "ar": "عطني الكوب", "hint": {"ar": "قيف بعدين مي بعدين ذا كاب.", "en": "Give + me + the cup."}}'::jsonb, null, null, null),
  ('a0hw-02-i-you-me', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: تقدر تساعدني؟", "en": "Build: Can you help me?", "tr": "بلد: كان يو هيلب مي"}, "tokens": ["Can", "you", "help", "me"], "answer": ["Can", "you", "help", "me"], "ar": "تقدر تساعدني؟", "hint": {"ar": "كان بعدين يو بعدين هيلب بعدين مي.", "en": "Can + you + help + me."}}'::jsonb, null, null, null),
  ('a0hw-02-i-you-me', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "I see you.", "answer": "اشوفك.", "accept": ["اشوفك", "اشوفك.", "اشوفك "]}'::jsonb, null, null, null),
  ('a0hw-02-i-you-me', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "كلمني الليلة.", "answer": "Call me tonight.", "accept": ["Call me tonight", "Call me tonight.", "Call me tonight ."]}'::jsonb, null, null, null),
  ('a0hw-02-i-you-me', 7, 'spell', '{"type": "spell", "answer": "ME", "display": "M E", "meaning": "لي، ياي", "options": [{"t": "M", "ok": true}, {"t": "E", "ok": true}, {"t": "A", "ok": false}, {"t": "I", "ok": false}], "translit": "مي"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-03-my-mine', 0, 'word', 'my', 'تبع... مثل جوالي', 'ماي', 'This is my phone.', 'هذا جوالي.', 'ذس از ماي فون.', null, null),
  ('a0hw-03-my-mine', 1, 'word', 'mine', 'تبعي لحالها', 'ماين', 'That cup is mine.', 'ذاك الكوب تبعي.', 'ذات كاب از ماين.', null, null),
  ('a0hw-03-my-mine', 2, 'word', 'your', 'تبعك', 'يور', 'Is this your bag?', 'هذا شنطتك؟', 'از ذس يور باق؟', null, null),
  ('a0hw-03-my-mine', 3, 'explain', 'My comes before the thing. Mine stands alone. Your before the thing, Yours alone.', 'شوف الفرق الحلو: My تجي قبل الشي، my phone جوالي. اما Mine تجي لحالها بدون الشي: its mine يعني تبعي. ونفس الشي للي قدامك: your bag شنطتك، والشي لحاله your bag is yours الشنطة تبعك. يعني My و Your قبل الشي، و Mine و Yours بعد ما نعرف الشي.', '', null, null, null, null, null),
  ('a0hw-03-my-mine', 4, 'explain', 'Ask whose is it: Whose cup is this? Answer: It is mine.', 'تقدر تسال عن صاحب الشي: Whose cup يعني كوب مين؟ تجاوب: Its mine تبعي. او Its yours تبعك. سهلة صح؟', '', null, null, null, null, null),
  ('a0hw-03-my-mine', 5, 'sentence', 'This is my phone.', 'هذا جوالي.', 'ذس از ماي فون.', null, null, null, null, null),
  ('a0hw-03-my-mine', 6, 'sentence', 'That cup is mine.', 'ذاك الكوب تبعي.', 'ذات كاب از ماين.', null, null, null, null, null),
  ('a0hw-03-my-mine', 7, 'sentence', 'Is this your bag?', 'هذا شنطتك؟', 'از ذس يور باق؟', null, null, null, null, null),
  ('a0hw-03-my-mine', 8, 'sentence', 'The car is yours.', 'السيارة تبعك.', 'ذا كار از يورز.', null, null, null, null, null),
  ('a0hw-03-my-mine', 9, 'sentence', 'My house is your house.', 'بيتي بيتك.', 'ماي هاوس از يور هاوس.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-03-my-mine', 0, 'choose', '{"type": "choose", "question": {"ar": "هذا الجوال جوالي. تقول: This is ___ phone.", "en": "This is my phone. Fill: This is ___ phone.", "tr": "ذس از ماي فون. فيل: ذس از فون."}, "options": [{"t": "my", "ok": true, "tr": "ماي"}, {"t": "me", "ok": false, "tr": "مي"}, {"t": "mine", "ok": false, "tr": "ماين"}], "hint": {"ar": "قبل الشي my.", "en": "Before the thing we use my."}}'::jsonb, null, null, null),
  ('a0hw-03-my-mine', 1, 'choose', '{"type": "choose", "question": {"ar": "ذاك الكوب تبعي لحاله: That cup is ___.", "en": "That cup is mine. Fill: That cup is ___.", "tr": "ذات كاب از ماين. فيل: ذات كاب از."}, "options": [{"t": "mine", "ok": true, "tr": "ماين"}, {"t": "my", "ok": false, "tr": "ماي"}, {"t": "me", "ok": false, "tr": "مي"}], "hint": {"ar": "الشي لحاله يعني mine.", "en": "Standing alone means mine."}}'::jsonb, null, null, null),
  ('a0hw-03-my-mine', 2, 'choose', '{"type": "choose", "question": {"ar": "الشنطة تبع اخوك، تقوله: The bag is ___.", "en": "The bag belongs to your brother. He says: The bag is ___.", "tr": "ذا باق بيلونقس تو يور برذر. هي سيز: ذا باق از."}, "options": [{"t": "mine", "ok": true, "tr": "ماين"}, {"t": "yours", "ok": false, "tr": "يورز"}, {"t": "my", "ok": false, "tr": "ماي"}], "hint": {"ar": "اذا الشي تبعك فانت تقول mine.", "en": "If it belongs to you, you say mine."}}'::jsonb, null, null, null),
  ('a0hw-03-my-mine', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: هذا جوالي.", "en": "Build: This is my phone.", "tr": "بلد: ذس از ماي فون"}, "tokens": ["This", "is", "my", "phone"], "answer": ["This", "is", "my", "phone"], "ar": "هذا جوالي", "hint": {"ar": "ذس بعدين از بعدين ماي بعدين فون.", "en": "This + is + my + phone."}}'::jsonb, null, null, null),
  ('a0hw-03-my-mine', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: ذاك الكوب تبعي.", "en": "Build: That cup is mine.", "tr": "بلد: ذات كاب از ماين"}, "tokens": ["That", "cup", "is", "mine"], "answer": ["That", "cup", "is", "mine"], "ar": "ذاك الكوب تبعي", "hint": {"ar": "ذات بعدين كاب بعدين از بعدين ماين.", "en": "That + cup + is + mine."}}'::jsonb, null, null, null),
  ('a0hw-03-my-mine', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Is this your bag?", "answer": "هذا شنطتك؟", "accept": ["هذا شنطتك؟", "هذي شنطتك؟", "هذا شنطتك"]}'::jsonb, null, null, null),
  ('a0hw-03-my-mine', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "السيارة تبعك.", "answer": "The car is yours.", "accept": ["The car is yours", "The car is yours.", "The car is yours ."]}'::jsonb, null, null, null),
  ('a0hw-03-my-mine', 7, 'spell', '{"type": "spell", "answer": "MY", "display": "M Y", "meaning": "تبع...", "options": [{"t": "M", "ok": true}, {"t": "Y", "ok": true}, {"t": "N", "ok": false}, {"t": "E", "ok": false}], "translit": "ماي"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-04-he-she-him', 0, 'word', 'he', 'هو', 'هي', 'He is my brother.', 'هو اخوي.', 'هي از ماي برذر.', null, null),
  ('a0hw-04-he-she-him', 1, 'word', 'she', 'هي', 'شي', 'She is my mom.', 'هي امي.', 'شي از ماي موم.', null, null),
  ('a0hw-04-he-she-him', 2, 'word', 'him', 'اياه، كلمه', 'هيم', 'Call him now.', 'كلمه الحين.', 'كول هيم ناو.', null, null),
  ('a0hw-04-he-she-him', 3, 'explain', 'He for the boy, She for the girl. Him and Her come after the verb.', 'He للولد والرجل، She للبنت والمراة. واذا جا الفعل بعدها نستخدم Him للولد و Her للبنت: call him كلمه، call her كلمها. مثل I و Me بالضبط: هو وهي يبدون الجملة، و اياه و اياها يجون بعدها.', '', null, null, null, null, null),
  ('a0hw-04-he-she-him', 4, 'explain', 'Her also comes before a thing she owns, like her bag.', 'Her لها استخدامين، مثل on بالضبط. الاول بعد الفعل: call her كلمها. والتاني قبل الشي اللي تبعها: her bag شنطتها، her car سيارتها. ونفس الشي His: his bag شنطته. القاعدة: اذا جات بعد الفعل فهي كلمة وحدة كلمها، واذا جات قبل الشي فهي تبع، زي ما تقول بالعربي شنطتها.', '', null, null, null, null, null),
  ('a0hw-04-he-she-him', 5, 'sentence', 'He is my brother.', 'هو اخوي.', 'هي از ماي برذر.', null, null, null, null, null),
  ('a0hw-04-he-she-him', 6, 'sentence', 'She is my mom.', 'هي امي.', 'شي از ماي موم.', null, null, null, null, null),
  ('a0hw-04-he-she-him', 7, 'sentence', 'Call him now.', 'كلمه الحين.', 'كول هيم ناو.', null, null, null, null, null),
  ('a0hw-04-he-she-him', 8, 'sentence', 'I love her.', 'احبها.', 'اي لاف هير.', null, null, null, null, null),
  ('a0hw-04-he-she-him', 9, 'sentence', 'Tell him the truth.', 'قوله الحق.', 'تيل هيم ذا تروث.', null, null, null, null, null),
  ('a0hw-04-he-she-him', 10, 'sentence', 'Her car is fast.', 'سيارتها سريعة.', 'هير كار از فاست.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-04-he-she-him', 0, 'choose', '{"type": "choose", "question": {"ar": "اخوك واقف هناك، تبدا الجملة عنه ب: ___", "en": "Your brother is there. You start with: ___", "tr": "يور برذر از ذير. يو ستارت ويذ:"}, "options": [{"t": "He", "ok": true, "tr": "هي"}, {"t": "Him", "ok": false, "tr": "هيم"}, {"t": "She", "ok": false, "tr": "شي"}], "hint": {"ar": "اول الجملة He.", "en": "He starts the sentence."}}'::jsonb, null, null, null),
  ('a0hw-04-he-she-him', 1, 'choose', '{"type": "choose", "question": {"ar": "تبغى امك تكلمها، تقول: Call ___.", "en": "You want your mom to be called. You say: Call ___.", "tr": "يو وانت يور موم تو بي كولد. يو سي: كول."}, "options": [{"t": "her", "ok": true, "tr": "هير"}, {"t": "him", "ok": false, "tr": "هيم"}, {"t": "she", "ok": false, "tr": "شي"}], "hint": {"ar": "بعد الفعل her للبنت.", "en": "After the verb, her for a girl."}}'::jsonb, null, null, null),
  ('a0hw-04-he-she-him', 2, 'choose', '{"type": "choose", "question": {"ar": "مين امي بالانجليزي؟ She is my ___.", "en": "Who is my mom in English? She is my ___.", "tr": "هو از ماي موم ان انقليش. شي از ماي."}, "options": [{"t": "mom", "ok": true, "tr": "موم"}, {"t": "brother", "ok": false, "tr": "برذر"}, {"t": "he", "ok": false, "tr": "هي"}], "hint": {"ar": "الام mom.", "en": "Mom means the mother."}}'::jsonb, null, null, null),
  ('a0hw-04-he-she-him', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: هو اخوي.", "en": "Build: He is my brother.", "tr": "بلد: هي از ماي برذر"}, "tokens": ["He", "is", "my", "brother"], "answer": ["He", "is", "my", "brother"], "ar": "هو اخوي", "hint": {"ar": "هي بعدين از بعدين ماي بعدين برذر.", "en": "He + is + my + brother."}}'::jsonb, null, null, null),
  ('a0hw-04-he-she-him', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: كلمه الحين.", "en": "Build: Call him now.", "tr": "بلد: كول هيم ناو"}, "tokens": ["Call", "him", "now"], "answer": ["Call", "him", "now"], "ar": "كلمه الحين", "hint": {"ar": "كول بعدين هيم بعدين ناو.", "en": "Call + him + now."}}'::jsonb, null, null, null),
  ('a0hw-04-he-she-him', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "I love her.", "answer": "احبها.", "accept": ["احبها", "احبها.", "انا احبها"]}'::jsonb, null, null, null),
  ('a0hw-04-he-she-him', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "هي امي.", "answer": "She is my mom.", "accept": ["She is my mom", "She is my mom.", "She is my mom ."]}'::jsonb, null, null, null),
  ('a0hw-04-he-she-him', 7, 'choose', '{"type": "choose", "question": {"ar": "شنطة اختك تبعها، تقول: ___ bag.", "en": "Your sister owns the bag: ___ bag.", "tr": "يور سيستر اونز ذا باق: باق."}, "options": [{"t": "her", "ok": true, "tr": "هير"}, {"t": "hers", "ok": false, "tr": "هيرز"}, {"t": "she", "ok": false, "tr": "شي"}], "hint": {"ar": "قبل الشي her مو hers.", "en": "Before the thing use her."}}'::jsonb, null, null, null),
  ('a0hw-04-he-she-him', 8, 'spell', '{"type": "spell", "answer": "SHE", "display": "S H E", "meaning": "هي", "options": [{"t": "S", "ok": true}, {"t": "H", "ok": true}, {"t": "E", "ok": true}, {"t": "A", "ok": false}], "translit": "شي"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-05-they-them', 0, 'word', 'they', 'هم', 'ذاي', 'They are my friends.', 'هم ربعي.', 'ذاي ار ماي فرندز.', null, null),
  ('a0hw-05-they-them', 1, 'word', 'them', 'اياهم', 'ذيم', 'I know them.', 'اعرفهم.', 'اي نوو ذيم.', null, null),
  ('a0hw-05-they-them', 2, 'word', 'their', 'تبعهم', 'ذير', 'Their house is big.', 'بيتهم كبير.', 'ذير هاوس از بيق.', null, null),
  ('a0hw-05-they-them', 3, 'explain', 'They for the group. Them after the verb. Their means it belongs to them.', 'اذا صاروا اكثر من واحد نقول They يعني هم. واذا جا الفعل نستخدم Them: I see them اشوفهم. و Their معناها تبعهم: their house يعني بيتهم. و Theirs لحالها: the house is theirs البيت تبعهم. نفس نظام My و Mine اللي اخذناه قبل.', '', null, null, null, null, null),
  ('a0hw-05-they-them', 4, 'sentence', 'They are my friends.', 'هم ربعي.', 'ذاي ار ماي فرندز.', null, null, null, null, null),
  ('a0hw-05-they-them', 5, 'sentence', 'I know them.', 'اعرفهم.', 'اي نوو ذيم.', null, null, null, null, null),
  ('a0hw-05-they-them', 6, 'sentence', 'Their house is big.', 'بيتهم كبير.', 'ذير هاوس از بيق.', null, null, null, null, null),
  ('a0hw-05-they-them', 7, 'sentence', 'Give them water.', 'عطهم ماي.', 'قيف ذيم ووتر.', null, null, null, null, null),
  ('a0hw-05-they-them', 8, 'sentence', 'The cars are theirs.', 'السيارات تبعهم.', 'ذا كارز ار ذيرز.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-05-they-them', 0, 'choose', '{"type": "choose", "question": {"ar": "ربعك واقفين هناك، تبدا عنهم ب: ___", "en": "Your friends are there. You start with: ___", "tr": "يور فرندز ار ذير. يو ستارت ويذ:"}, "options": [{"t": "They", "ok": true, "tr": "ذاي"}, {"t": "Them", "ok": false, "tr": "ذيم"}, {"t": "Their", "ok": false, "tr": "ذير"}], "hint": {"ar": "اول الجملة They.", "en": "They starts the sentence."}}'::jsonb, null, null, null),
  ('a0hw-05-they-them', 1, 'choose', '{"type": "choose", "question": {"ar": "تبغى تعطي ربعك ماي، تقول: Give ___ water.", "en": "You give your friends water: Give ___ water.", "tr": "يو قيف يور فرندز ووتر: قيف ووتر."}, "options": [{"t": "them", "ok": true, "tr": "ذيم"}, {"t": "they", "ok": false, "tr": "ذاي"}, {"t": "their", "ok": false, "tr": "ذير"}], "hint": {"ar": "بعد الفعل them.", "en": "After the verb, them."}}'::jsonb, null, null, null),
  ('a0hw-05-they-them', 2, 'choose', '{"type": "choose", "question": {"ar": "بيت ربعك كبير، تقول: ___ house is big.", "en": "Your friends have a big house: ___ house is big.", "tr": "يور فرندز هاف ا بيق هاوس: هاوس از بيق."}, "options": [{"t": "Their", "ok": true, "tr": "ذير"}, {"t": "They", "ok": false, "tr": "ذاي"}, {"t": "Them", "ok": false, "tr": "ذيم"}], "hint": {"ar": "تبعهم يعني their.", "en": "Their means it belongs to them."}}'::jsonb, null, null, null),
  ('a0hw-05-they-them', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: هم ربعي.", "en": "Build: They are my friends.", "tr": "بلد: ذاي ار ماي فرندز"}, "tokens": ["They", "are", "my", "friends"], "answer": ["They", "are", "my", "friends"], "ar": "هم ربعي", "hint": {"ar": "ذاي بعدين ار بعدين ماي بعدين فرندز.", "en": "They + are + my + friends."}}'::jsonb, null, null, null),
  ('a0hw-05-they-them', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: بيتهم كبير.", "en": "Build: Their house is big.", "tr": "بلد: ذير هاوس از بيق"}, "tokens": ["Their", "house", "is", "big"], "answer": ["Their", "house", "is", "big"], "ar": "بيتهم كبير", "hint": {"ar": "ذير بعدين هاوس بعدين از بعدين بيق.", "en": "Their + house + is + big."}}'::jsonb, null, null, null),
  ('a0hw-05-they-them', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "I know them.", "answer": "اعرفهم.", "accept": ["اعرفهم", "اعرفهم.", "انا اعرفهم"]}'::jsonb, null, null, null),
  ('a0hw-05-they-them', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "عطهم ماي.", "answer": "Give them water.", "accept": ["Give them water", "Give them water.", "Give them water ."]}'::jsonb, null, null, null),
  ('a0hw-05-they-them', 7, 'spell', '{"type": "spell", "answer": "THEM", "display": "T H E M", "meaning": "اياهم", "options": [{"t": "T", "ok": true}, {"t": "H", "ok": true}, {"t": "E", "ok": true}, {"t": "M", "ok": true}, {"t": "A", "ok": false}], "translit": "ذيم"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-06-this-these-those', 0, 'word', 'this', 'هذا، هاي للقريب', 'ذس', 'This is my room.', 'هذا غرفتي.', 'ذس از ماي روم.', null, null),
  ('a0hw-06-this-these-those', 1, 'word', 'these', 'هذول جمع القريب', 'ذيز', 'These are my books.', 'هذي كتبي.', 'ذيز ار ماي بوكس.', null, null),
  ('a0hw-06-this-these-those', 2, 'word', 'those', 'ذولك للبعيد', 'ذوز', 'Those are his shoes.', 'ذولك جزمته.', 'ذوز ار هيز شوز.', null, null),
  ('a0hw-06-this-these-those', 3, 'explain', 'This for one near thing. These for many near things. Those for far things.', 'خلها قاعدة وحدة: الشي القريب واحد This، هذي الكوب. والقريب جمع These، هذي الاكواب. والبعيد Those، ذولك السيارات. اذا تقدر تمد يدك وتاخذه فهو This او These، واذا تحتاج تمشي له فهو Those.', '', null, null, null, null, null),
  ('a0hw-06-this-these-those', 4, 'sentence', 'This is my room.', 'هذا غرفتي.', 'ذس از ماي روم.', null, null, null, null, null),
  ('a0hw-06-this-these-those', 5, 'sentence', 'These are my books.', 'هذي كتبي.', 'ذيز ار ماي بوكس.', null, null, null, null, null),
  ('a0hw-06-this-these-those', 6, 'sentence', 'Those are his shoes.', 'ذولك جزمته.', 'ذوز ار هيز شوز.', null, null, null, null, null),
  ('a0hw-06-this-these-those', 7, 'sentence', 'I like this one.', 'يعجبني هذا.', 'اي لايك ذس ون.', null, null, null, null, null),
  ('a0hw-06-this-these-those', 8, 'sentence', 'These cups are dirty.', 'هذي الاكواب وسخة.', 'ذيز كابز ار ديرتي.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-06-this-these-those', 0, 'choose', '{"type": "choose", "question": {"ar": "الكوب في يدك: ___ is my cup.", "en": "The cup is in your hand: ___ is my cup.", "tr": "ذا كاب از ان يور هاند: از ماي كاب."}, "options": [{"t": "This", "ok": true, "tr": "ذس"}, {"t": "These", "ok": false, "tr": "ذيز"}, {"t": "Those", "ok": false, "tr": "ذوز"}], "hint": {"ar": "الشي بيدك this.", "en": "In your hand means this."}}'::jsonb, null, null, null),
  ('a0hw-06-this-these-those', 1, 'choose', '{"type": "choose", "question": {"ar": "كتبي كلها قدامك على الطاولة: ___ are my books.", "en": "All your books are on the table: ___ are my books.", "tr": "ول يور بوكس ار اون ذا تيبل: ار ماي بوكس."}, "options": [{"t": "These", "ok": true, "tr": "ذيز"}, {"t": "This", "ok": false, "tr": "ذس"}, {"t": "Those", "ok": false, "tr": "ذوز"}], "hint": {"ar": "جمع قريب these.", "en": "Many near things are these."}}'::jsonb, null, null, null),
  ('a0hw-06-this-these-those', 2, 'choose', '{"type": "choose", "question": {"ar": "الجبال بعيدة عنك، تقول: ___ are far.", "en": "The far mountains: ___ are far.", "tr": "ذا فار ماونتنز: ار فار."}, "options": [{"t": "Those", "ok": true, "tr": "ذوز"}, {"t": "This", "ok": false, "tr": "ذس"}, {"t": "These", "ok": false, "tr": "ذيز"}], "hint": {"ar": "البعيد those.", "en": "Far things are those. Abha has beautiful mountains."}}'::jsonb, null, null, null),
  ('a0hw-06-this-these-those', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: هذا غرفتي.", "en": "Build: This is my room.", "tr": "بلد: ذس از ماي روم"}, "tokens": ["This", "is", "my", "room"], "answer": ["This", "is", "my", "room"], "ar": "هذا غرفتي", "hint": {"ar": "ذس بعدين از بعدين ماي بعدين روم.", "en": "This + is + my + room."}}'::jsonb, null, null, null),
  ('a0hw-06-this-these-those', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: ذولك جزمته.", "en": "Build: Those are his shoes.", "tr": "بلد: ذوز ار هيز شوز"}, "tokens": ["Those", "are", "his", "shoes"], "answer": ["Those", "are", "his", "shoes"], "ar": "ذولك جزمته", "hint": {"ar": "ذوز بعدين ار بعدين هيز بعدين شوز.", "en": "Those + are + his + shoes."}}'::jsonb, null, null, null),
  ('a0hw-06-this-these-those', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "These are my books.", "answer": "هذي كتبي.", "accept": ["هذي كتبي", "هذي كتبي.", "هذه كتبي"]}'::jsonb, null, null, null),
  ('a0hw-06-this-these-those', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "يعجبني هذا.", "answer": "I like this one.", "accept": ["I like this one", "I like this one.", "I like this"]}'::jsonb, null, null, null),
  ('a0hw-06-this-these-those', 7, 'spell', '{"type": "spell", "answer": "THIS", "display": "T H I S", "meaning": "هذا", "options": [{"t": "T", "ok": true}, {"t": "H", "ok": true}, {"t": "I", "ok": true}, {"t": "S", "ok": true}, {"t": "E", "ok": false}], "translit": "ذس"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-07-in-on-under', 0, 'word', 'in', 'جوا', 'ان', 'The milk is in the fridge.', 'الحليب بالثلاجة.', 'ذا ميلك از ان ذا فريج.', null, null),
  ('a0hw-07-in-on-under', 1, 'word', 'on', 'على، فوق الشي', 'اون', 'The cup is on the table.', 'الكوب على الطاولة.', 'ذا كاب از اون ذا تيبل.', null, null),
  ('a0hw-07-in-on-under', 2, 'word', 'under', 'تحت', 'اندر', 'The cat is under the bed.', 'القطوة تحت السرير.', 'ذا كات از اندر ذا بيد.', null, null),
  ('a0hw-07-in-on-under', 3, 'explain', 'In means inside a thing. On means on top of it. Under means below it. Above means over it without touching.', 'تخيل المطبخ: الحليب IN الثلاجة يعني جواها. والكوب ON الطاولة يعني فوقها ملاصقها. وقطتكم UNDER السرير يعني تحته. و Above يعني فوق بس مو ملاصق، مثل النور ABOVE راسك. اذا الشي محتوي الشي الثاني فهو in، واذا ملاصق من فوق فهو on.', '', null, null, null, null, null),
  ('a0hw-07-in-on-under', 4, 'explain', 'In also works with time: in the morning.', 'مثل on، كلمة In لها استخدامين. الاول للمكان: الحليب in the fridge يعني جوا الثلاجة. والتاني للوقت: in the morning يعني بالصباح، و in five minutes يعني بعد خمس دقايق. امك تقول لك قوم بالصباح؟ هذا in the morning. نفس الكلمة، مرة مكان ومرة وقت، والسياق هو اللي يفرق.', '', null, null, null, null, null),
  ('a0hw-07-in-on-under', 5, 'sentence', 'The milk is in the fridge.', 'الحليب بالثلاجة.', 'ذا ميلك از ان ذا فريج.', null, null, null, null, null),
  ('a0hw-07-in-on-under', 6, 'sentence', 'The cup is on the table.', 'الكوب على الطاولة.', 'ذا كاب از اون ذا تيبل.', null, null, null, null, null),
  ('a0hw-07-in-on-under', 7, 'sentence', 'The cat is under the bed.', 'القطوة تحت السرير.', 'ذا كات از اندر ذا بيد.', null, null, null, null, null),
  ('a0hw-07-in-on-under', 8, 'sentence', 'The light is above the door.', 'النور فوق الباب.', 'ذا لايت از اباوف ذا دور.', null, null, null, null, null),
  ('a0hw-07-in-on-under', 9, 'sentence', 'Your keys are in the car.', 'مفاتيحك بالسيارة.', 'يور كيز ار ان ذا كار.', null, null, null, null, null),
  ('a0hw-07-in-on-under', 10, 'sentence', 'I drink tea in the morning.', 'اشرب شاي بالصباح.', 'اي درينك تي ان ذا مورنينق.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-07-in-on-under', 0, 'choose', '{"type": "choose", "question": {"ar": "الحليب جوا الثلاجة: The milk is ___ the fridge.", "en": "The milk is inside the fridge: The milk is ___ the fridge.", "tr": "ذا ميلك از انسايد ذا فريج: ذا ميلك از ذا فريج."}, "options": [{"t": "in", "ok": true, "tr": "ان"}, {"t": "on", "ok": false, "tr": "اون"}, {"t": "under", "ok": false, "tr": "اندر"}], "hint": {"ar": "جوا يعني in.", "en": "Inside means in."}}'::jsonb, null, null, null),
  ('a0hw-07-in-on-under', 1, 'choose', '{"type": "choose", "question": {"ar": "الكوب فوق الطاولة ملاصقها: The cup is ___ the table.", "en": "The cup sits on the table: The cup is ___ the table.", "tr": "ذا كاب سيتس اون ذا تيبل: ذا كاب از ذا تيبل."}, "options": [{"t": "on", "ok": true, "tr": "اون"}, {"t": "in", "ok": false, "tr": "ان"}, {"t": "under", "ok": false, "tr": "اندر"}], "hint": {"ar": "فوق ملاصق يعني on.", "en": "On top means on."}}'::jsonb, null, null, null),
  ('a0hw-07-in-on-under', 2, 'choose', '{"type": "choose", "question": {"ar": "القطوة تحت السرير: The cat is ___ the bed.", "en": "The cat is below the bed: The cat is ___ the bed.", "tr": "ذا كات از بيلوو ذا بيد: ذا كات از ذا بيد."}, "options": [{"t": "under", "ok": true, "tr": "اندر"}, {"t": "on", "ok": false, "tr": "اون"}, {"t": "above", "ok": false, "tr": "اباوف"}], "hint": {"ar": "تحت يعني under.", "en": "Below means under."}}'::jsonb, null, null, null),
  ('a0hw-07-in-on-under', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: الكوب على الطاولة.", "en": "Build: The cup is on the table.", "tr": "بلد: ذا كاب از اون ذا تيبل"}, "tokens": ["The", "cup", "is", "on", "the", "table"], "answer": ["The", "cup", "is", "on", "the", "table"], "ar": "الكوب على الطاولة", "hint": {"ar": "ذا بعدين كاب بعدين از بعدين اون بعدين ذا بعدين تيبل.", "en": "The + cup + is + on + the table."}}'::jsonb, null, null, null),
  ('a0hw-07-in-on-under', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: القطوة تحت السرير.", "en": "Build: The cat is under the bed.", "tr": "بلد: ذا كات از اندر ذا بيد"}, "tokens": ["The", "cat", "is", "under", "the", "bed"], "answer": ["The", "cat", "is", "under", "the", "bed"], "ar": "القطوة تحت السرير", "hint": {"ar": "ذا بعدين كات بعدين از بعدين اندر بعدين ذا بعدين بيد.", "en": "The + cat + is + under + the bed."}}'::jsonb, null, null, null),
  ('a0hw-07-in-on-under', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "The milk is in the fridge.", "answer": "الحليب بالثلاجة.", "accept": ["الحليب بالثلاجة", "الحليب في الثلاجة", "الحليب جوا الثلاجة"]}'::jsonb, null, null, null),
  ('a0hw-07-in-on-under', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "النور فوق الباب.", "answer": "The light is above the door.", "accept": ["The light is above the door", "The light is above the door.", "The light above the door"]}'::jsonb, null, null, null),
  ('a0hw-07-in-on-under', 7, 'choose', '{"type": "choose", "question": {"ar": "دايم تشرب شاي بالصباح: I drink tea ___ the morning.", "en": "You drink tea every morning: I drink tea ___ the morning.", "tr": "يو درينك تي اڤري مورنينق: اي درينك تي ذا مورنينق."}, "options": [{"t": "in", "ok": true, "tr": "ان"}, {"t": "on", "ok": false, "tr": "اون"}, {"t": "under", "ok": false, "tr": "اندر"}], "hint": {"ar": "مع الوقت in the morning.", "en": "Time periods use in."}}'::jsonb, null, null, null),
  ('a0hw-07-in-on-under', 8, 'spell', '{"type": "spell", "answer": "ON", "display": "O N", "meaning": "على", "options": [{"t": "O", "ok": true}, {"t": "N", "ok": true}, {"t": "A", "ok": false}, {"t": "U", "ok": false}], "translit": "اون"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-08-on-off', 0, 'word', 'on', 'شغال', 'اون', 'The TV is on.', 'التلفزيون شغال.', 'ذا تي في از اون.', null, null),
  ('a0hw-08-on-off', 1, 'word', 'off', 'مطفي', 'اوف', 'The light is off.', 'النور مطفي.', 'ذا لايت از اوف.', null, null),
  ('a0hw-08-on-off', 2, 'word', 'turn on', 'شغل', 'تيرن اون', 'Turn on the AC.', 'شغل المكيف.', 'تيرن اون ذا ايه سي.', null, null),
  ('a0hw-08-on-off', 3, 'explain', 'On has two meanings: on the table means on top. The TV is on means it is working.', 'هنا سر صغير ينفعك دايما: كلمة on لها معنيين. اذا قلت the cup is on the table يعني الكوب فوق الطاولة، مكان. واذا قلت the TV is on يعني التلفزيون شغال! و off عكسها: مطفي. جهازك either on شغال or off مطفي. اذا احد قال لك turn it on يعني شغله، و turn it off يعني طفيه.', '', null, null, null, null, null),
  ('a0hw-08-on-off', 4, 'explain', 'Machines are on or off. Things are on a table or off the table.', 'خلها بمثال من البيت: التلفزيون on يعني شغال وانت تشوفه. الجوال on يعني مفتوح. المكيف off يعني مطفي والجو حار. بس الكوب on the table يعني مكانها فوق الطاولة. نفس الكلمة، بس السياق يفرق: مع الاجهزة on شغال، مع الاماكن on فوق.', '', null, null, null, null, null),
  ('a0hw-08-on-off', 5, 'sentence', 'The TV is on.', 'التلفزيون شغال.', 'ذا تي في از اون.', null, null, null, null, null),
  ('a0hw-08-on-off', 6, 'sentence', 'Turn it off.', 'طفيه.', 'تيرن ات اوف.', null, null, null, null, null),
  ('a0hw-08-on-off', 7, 'sentence', 'The light is off.', 'النور مطفي.', 'ذا لايت از اوف.', null, null, null, null, null),
  ('a0hw-08-on-off', 8, 'sentence', 'Put the cola on the table.', 'حط الكولا على الطاولة.', 'بوت ذا كولا اون ذا تيبل.', null, null, null, null, null),
  ('a0hw-08-on-off', 9, 'sentence', 'Turn on the AC.', 'شغل المكيف.', 'تيرن اون ذا ايه سي.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-08-on-off', 0, 'choose', '{"type": "choose", "question": {"ar": "التلفزيون شغال: The TV is ___.", "en": "The TV is working: The TV is ___.", "tr": "ذا تي في از وركينق: ذا تي في از."}, "options": [{"t": "on", "ok": true, "tr": "اون"}, {"t": "off", "ok": false, "tr": "اوف"}, {"t": "in", "ok": false, "tr": "ان"}], "hint": {"ar": "الجهاز الشغال on.", "en": "A working machine is on."}}'::jsonb, null, null, null),
  ('a0hw-08-on-off', 1, 'choose', '{"type": "choose", "question": {"ar": "النور مطفي: The light is ___.", "en": "The light is not working: The light is ___.", "tr": "ذا لايت از نات وركينق: ذا لايت از."}, "options": [{"t": "off", "ok": true, "tr": "اوف"}, {"t": "on", "ok": false, "tr": "اون"}, {"t": "under", "ok": false, "tr": "اندر"}], "hint": {"ar": "المطفي off.", "en": "Not working means off."}}'::jsonb, null, null, null),
  ('a0hw-08-on-off', 2, 'choose', '{"type": "choose", "question": {"ar": "الجو حار وتبغى المكيف، تقول: ___ the AC.", "en": "It is hot and you want the AC: ___ the AC.", "tr": "ات از هوت اند يو وانت ذا ايه سي: ذا ايه سي."}, "options": [{"t": "Turn on", "ok": true, "tr": "تيرن اون"}, {"t": "Turn off", "ok": false, "tr": "تيرن اوف"}, {"t": "Put", "ok": false, "tr": "بوت"}], "hint": {"ar": "شغل تعني turn on.", "en": "Turn on means make it work."}}'::jsonb, null, null, null),
  ('a0hw-08-on-off', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: حط الكولا على الطاولة.", "en": "Build: Put the cola on the table.", "tr": "بلد: بوت ذا كولا اون ذا تيبل"}, "tokens": ["Put", "the", "cola", "on", "the", "table"], "answer": ["Put", "the", "cola", "on", "the", "table"], "ar": "حط الكولا على الطاولة", "hint": {"ar": "بوت بعدين ذا بعدين كولا بعدين اون بعدين ذا بعدين تيبل.", "en": "Put + the cola + on + the table."}}'::jsonb, null, null, null),
  ('a0hw-08-on-off', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: شغل المكيف.", "en": "Build: Turn on the AC.", "tr": "بلد: تيرن اون ذا ايه سي"}, "tokens": ["Turn", "on", "the", "AC"], "answer": ["Turn", "on", "the", "AC"], "ar": "شغل المكيف", "hint": {"ar": "تيرن بعدين اون بعدين ذا بعدين ايه سي.", "en": "Turn + on + the AC."}}'::jsonb, null, null, null),
  ('a0hw-08-on-off', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Turn it off.", "answer": "طفيه.", "accept": ["طفيه", "طفيه.", "اطفيه"]}'::jsonb, null, null, null),
  ('a0hw-08-on-off', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "التلفزيون شغال.", "answer": "The TV is on.", "accept": ["The TV is on", "The TV is on.", "The TV is on ."]}'::jsonb, null, null, null),
  ('a0hw-08-on-off', 7, 'spell', '{"type": "spell", "answer": "OFF", "display": "O F F", "meaning": "مطفي", "options": [{"t": "O", "ok": true}, {"t": "F", "ok": true}, {"t": "F", "ok": true}, {"t": "N", "ok": false}], "translit": "اوف"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-09-here-there', 0, 'word', 'here', 'هنا', 'هير', 'Come here.', 'تعال هنا.', 'كام هير.', null, null),
  ('a0hw-09-here-there', 1, 'word', 'there', 'هناك، لقصي', 'ذير', 'The car is over there.', 'السيارة هناك.', 'ذا كار از اوفر ذير.', null, null),
  ('a0hw-09-here-there', 2, 'word', 'over there', 'هناك بعيد', 'اوفر ذير', 'Your phone is over there.', 'جوالك هناك.', 'يور فون از اوفر ذير.', null, null),
  ('a0hw-09-here-there', 3, 'explain', 'Here is near you. There is far. Over there is even farther.', 'Here يعني هنا، الشي قريب منك. There يعني هناك، بعيد شوي. و Over there يعني هناك بعيد، ابعد من there. اذا امك تقولها بالعربي تعال هنا فانت تقول come here. واذا سولت وين جوالك؟ احد يجاوبك its over there يعني هناك بعيد، دور شوي.', '', null, null, null, null, null),
  ('a0hw-09-here-there', 4, 'sentence', 'Come here.', 'تعال هنا.', 'كام هير.', null, null, null, null, null),
  ('a0hw-09-here-there', 5, 'sentence', 'The car is over there.', 'السيارة هناك.', 'ذا كار از اوفر ذير.', null, null, null, null, null),
  ('a0hw-09-here-there', 6, 'sentence', 'I live here.', 'انا ساكن هنا.', 'اي ليف هير.', null, null, null, null, null),
  ('a0hw-09-here-there', 7, 'sentence', 'Your phone is over there.', 'جوالك هناك.', 'يور فون از اوفر ذير.', null, null, null, null, null),
  ('a0hw-09-here-there', 8, 'sentence', 'Put it here.', 'حطه هنا.', 'بوت ات هير.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-09-here-there', 0, 'choose', '{"type": "choose", "question": {"ar": "اخوك الصغير يمك، تناديه: ___", "en": "Your little brother is next to you, you say: ___", "tr": "يور ليتل برذر از نكست تو يو، يو سي:"}, "options": [{"t": "Come here", "ok": true, "tr": "كام هير"}, {"t": "Go there", "ok": false, "tr": "قو ذير"}, {"t": "Come there", "ok": false, "tr": "كام ذير"}], "hint": {"ar": "تنادي القريب come here.", "en": "You call someone near with come here."}}'::jsonb, null, null, null),
  ('a0hw-09-here-there', 1, 'choose', '{"type": "choose", "question": {"ar": "السيارة بعيدة عنك، تقول: The car is over ___.", "en": "The car is far away: The car is over ___.", "tr": "ذا كار از فار اواي: ذا كار از اوفر."}, "options": [{"t": "there", "ok": true, "tr": "ذير"}, {"t": "here", "ok": false, "tr": "هير"}, {"t": "in", "ok": false, "tr": "ان"}], "hint": {"ar": "البعيد over there.", "en": "Far away is over there."}}'::jsonb, null, null, null),
  ('a0hw-09-here-there', 2, 'choose', '{"type": "choose", "question": {"ar": "انت ساكن بالبيت هذا، تقول: I live ___.", "en": "You live in this house: I live ___.", "tr": "يو ليف ان ذس هاوس: اي ليف."}, "options": [{"t": "here", "ok": true, "tr": "هير"}, {"t": "there", "ok": false, "tr": "ذير"}, {"t": "over", "ok": false, "tr": "اوفر"}], "hint": {"ar": "مكانك هنا here.", "en": "Your place is here."}}'::jsonb, null, null, null),
  ('a0hw-09-here-there', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: تعال هنا.", "en": "Build: Come here.", "tr": "بلد: كام هير"}, "tokens": ["Come", "here"], "answer": ["Come", "here"], "ar": "تعال هنا", "hint": {"ar": "كام بعدين هير.", "en": "Come + here."}}'::jsonb, null, null, null),
  ('a0hw-09-here-there', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: جوالك هناك.", "en": "Build: Your phone is over there.", "tr": "بلد: يور فون از اوفر ذير"}, "tokens": ["Your", "phone", "is", "over", "there"], "answer": ["Your", "phone", "is", "over", "there"], "ar": "جوالك هناك", "hint": {"ar": "يور بعدين فون بعدين از بعدين اوفر بعدين ذير.", "en": "Your + phone + is + over there."}}'::jsonb, null, null, null),
  ('a0hw-09-here-there', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "I live here.", "answer": "انا ساكن هنا.", "accept": ["انا ساكن هنا", "ساكن هنا", "انا ساكن هنا "]}'::jsonb, null, null, null),
  ('a0hw-09-here-there', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "حطه هنا.", "answer": "Put it here.", "accept": ["Put it here", "Put it here.", "put it here"]}'::jsonb, null, null, null),
  ('a0hw-09-here-there', 7, 'spell', '{"type": "spell", "answer": "HERE", "display": "H E R E", "meaning": "هنا", "options": [{"t": "H", "ok": true}, {"t": "E", "ok": true}, {"t": "R", "ok": true}, {"t": "E", "ok": true}, {"t": "A", "ok": false}], "translit": "هير"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-10-up-down', 0, 'word', 'up', 'لفوق', 'اب', 'Stand up.', 'قوم.', 'ستاند اب.', null, null),
  ('a0hw-10-up-down', 1, 'word', 'down', 'لتحت', 'داون', 'Sit down, please.', 'اقعد لو سمحت.', 'سيت داون، بليز.', null, null),
  ('a0hw-10-up-down', 2, 'word', 'stand up', 'قوم واقف', 'ستاند اب', 'Stand up and come here.', 'قوم وتعال هنا.', 'ستاند اب اند كام هير.', null, null),
  ('a0hw-10-up-down', 3, 'explain', 'Up is the direction to the sky. Down is the direction to the ground.', 'Up يعني لفوق، جهة السما. Down يعني لتحت، جهة الارض. بالبيت تستعملها كل شوي: sit down اقعد، stand up قوم، put the phone down نزل الجوال يعني خله لتحت. واذا قام احد من المجلس نقولوا قام، بالانجليزي he stands up.', '', null, null, null, null, null),
  ('a0hw-10-up-down', 4, 'sentence', 'Sit down, please.', 'اقعد لو سمحت.', 'سيت داون، بليز.', null, null, null, null, null),
  ('a0hw-10-up-down', 5, 'sentence', 'Stand up.', 'قوم.', 'ستاند اب.', null, null, null, null, null),
  ('a0hw-10-up-down', 6, 'sentence', 'Put the phone down.', 'نزل الجوال.', 'بوت ذا فون داون.', null, null, null, null, null),
  ('a0hw-10-up-down', 7, 'sentence', 'Look up at the sky.', 'شوف السما فوق.', 'ليك اب ات ذا سكاي.', null, null, null, null, null),
  ('a0hw-10-up-down', 8, 'sentence', 'The sun goes down.', 'الشمس تغرب.', 'ذا سن قووز داون.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-10-up-down', 0, 'choose', '{"type": "choose", "question": {"ar": "المعلم قال للطلاب اقعدوا: ___", "en": "The teacher says sit: ___", "tr": "ذا تيتشر سيز سيت:"}, "options": [{"t": "Sit down", "ok": true, "tr": "سيت داون"}, {"t": "Stand up", "ok": false, "tr": "ستاند اب"}, {"t": "Come here", "ok": false, "tr": "كام هير"}], "hint": {"ar": "اقعد sit down.", "en": "Sit down means take a seat."}}'::jsonb, null, null, null),
  ('a0hw-10-up-down', 1, 'choose', '{"type": "choose", "question": {"ar": "تخلي الجوال لتحت عن يدك: Put the phone ___.", "en": "You lower the phone: Put the phone ___.", "tr": "يو لوور ذا فون: بوت ذا فون."}, "options": [{"t": "down", "ok": true, "tr": "داون"}, {"t": "up", "ok": false, "tr": "اب"}, {"t": "here", "ok": false, "tr": "هير"}], "hint": {"ar": "لتحت down.", "en": "Down is the lower direction."}}'::jsonb, null, null, null),
  ('a0hw-10-up-down', 2, 'choose', '{"type": "choose", "question": {"ar": "وش معنى stand up؟", "en": "What does stand up mean?", "tr": "وات دوز ستاند اب مين؟"}, "options": [{"t": "قوم واقف", "ok": true, "tr": "ستاند اب"}, {"t": "اقعد", "ok": false, "tr": "سيت داون"}, {"t": "امش", "ok": false, "tr": "ووك"}], "hint": {"ar": "stand up يعني قوم واقف.", "en": "Stand up means rise to your feet."}}'::jsonb, null, null, null),
  ('a0hw-10-up-down', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: اقعد لو سمحت.", "en": "Build: Sit down, please.", "tr": "بلد: سيت داون، بليز"}, "tokens": ["Sit", "down", "please"], "answer": ["Sit", "down", "please"], "ar": "اقعد لو سمحت", "hint": {"ar": "سيت بعدين داون بعدين بليز.", "en": "Sit + down + please."}}'::jsonb, null, null, null),
  ('a0hw-10-up-down', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: نزل الجوال.", "en": "Build: Put the phone down.", "tr": "بلد: بوت ذا فون داون"}, "tokens": ["Put", "the", "phone", "down"], "answer": ["Put", "the", "phone", "down"], "ar": "نزل الجوال", "hint": {"ar": "بوت بعدين ذا بعدين فون بعدين داون.", "en": "Put + the phone + down."}}'::jsonb, null, null, null),
  ('a0hw-10-up-down', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Stand up.", "answer": "قوم.", "accept": ["قوم", "قوم.", "قوم واقف"]}'::jsonb, null, null, null),
  ('a0hw-10-up-down', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "الشمس تغرب.", "answer": "The sun goes down.", "accept": ["The sun goes down", "The sun goes down.", "The sun goes down ."]}'::jsonb, null, null, null),
  ('a0hw-10-up-down', 7, 'spell', '{"type": "spell", "answer": "UP", "display": "U P", "meaning": "لفوق", "options": [{"t": "U", "ok": true}, {"t": "P", "ok": true}, {"t": "A", "ok": false}, {"t": "D", "ok": false}], "translit": "اب"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-11-inside-outside', 0, 'word', 'inside', 'جوا', 'انسايد', 'Wait inside.', 'انتظر جوا.', 'وايت انسايد.', null, null),
  ('a0hw-11-inside-outside', 1, 'word', 'outside', 'برا', 'اوتسايد', 'The kids are outside.', 'العيال برا.', 'ذا كيدز ار اوتسايد.', null, null),
  ('a0hw-11-inside-outside', 2, 'word', 'come inside', 'ادخل', 'كام انسايد', 'Come inside, please.', 'ادخل لو سمحت.', 'كام انسايد، بليز.', null, null),
  ('a0hw-11-inside-outside', 3, 'explain', 'Inside means in the house. Outside means out of the house.', 'Inside يعني جوا، بالبيت. Outside يعني برا. اذا العيال يلعبون برا نقول the kids are outside. واذا الجو حار برا والاقارب على الباب نقول لهم come inside يعني ادخلوا. بسيطة: جوا inside و برا outside.', '', null, null, null, null, null),
  ('a0hw-11-inside-outside', 4, 'sentence', 'Wait inside.', 'انتظر جوا.', 'وايت انسايد.', null, null, null, null, null),
  ('a0hw-11-inside-outside', 5, 'sentence', 'The kids are outside.', 'العيال برا.', 'ذا كيدز ار اوتسايد.', null, null, null, null, null),
  ('a0hw-11-inside-outside', 6, 'sentence', 'It is hot outside.', 'الجو حار برا.', 'ات از هوت اوتسايد.', null, null, null, null, null),
  ('a0hw-11-inside-outside', 7, 'sentence', 'Come inside, please.', 'ادخل لو سمحت.', 'كام انسايد، بليز.', null, null, null, null, null),
  ('a0hw-11-inside-outside', 8, 'sentence', 'The car is outside.', 'السيارة برا.', 'ذا كار از اوتسايد.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-11-inside-outside', 0, 'choose', '{"type": "choose", "question": {"ar": "العيال يلعبون بحوش البيت: The kids are ___.", "en": "The kids play in the yard: The kids are ___.", "tr": "ذا كيدز بلاي ان ذا يارد: ذا كيدز ار."}, "options": [{"t": "outside", "ok": true, "tr": "اوتسايد"}, {"t": "inside", "ok": false, "tr": "انسايد"}, {"t": "down", "ok": false, "tr": "داون"}], "hint": {"ar": "برا outside.", "en": "Out of the house is outside."}}'::jsonb, null, null, null),
  ('a0hw-11-inside-outside', 1, 'choose', '{"type": "choose", "question": {"ar": "الجو حار بالشمس، تقول لضيوفك: Come ___, please.", "en": "It is hot in the sun, you tell your guests: Come ___, please.", "tr": "ات از هوت ان ذا صن، يو تيل يور قويستس: كام، بليز."}, "options": [{"t": "inside", "ok": true, "tr": "انسايد"}, {"t": "outside", "ok": false, "tr": "اوتسايد"}, {"t": "up", "ok": false, "tr": "اب"}], "hint": {"ar": "ادخل come inside.", "en": "Come inside means enter."}}'::jsonb, null, null, null),
  ('a0hw-11-inside-outside', 2, 'choose', '{"type": "choose", "question": {"ar": "وش معنى outside؟", "en": "What does outside mean?", "tr": "وات دوز اوتسايد مين؟"}, "options": [{"t": "برا", "ok": true, "tr": "اوتسايد"}, {"t": "جوا", "ok": false, "tr": "انسايد"}, {"t": "فوق", "ok": false, "tr": "اب"}], "hint": {"ar": "outside يعني برا.", "en": "Outside means out."}}'::jsonb, null, null, null),
  ('a0hw-11-inside-outside', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: العيال برا.", "en": "Build: The kids are outside.", "tr": "بلد: ذا كيدز ار اوتسايد"}, "tokens": ["The", "kids", "are", "outside"], "answer": ["The", "kids", "are", "outside"], "ar": "العيال برا", "hint": {"ar": "ذا بعدين كيدز بعدين ار بعدين اوتسايد.", "en": "The + kids + are + outside."}}'::jsonb, null, null, null),
  ('a0hw-11-inside-outside', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: ادخل لو سمحت.", "en": "Build: Come inside, please.", "tr": "بلد: كام انسايد، بليز"}, "tokens": ["Come", "inside", "please"], "answer": ["Come", "inside", "please"], "ar": "ادخل لو سمحت", "hint": {"ar": "كام بعدين انسايد بعدين بليز.", "en": "Come + inside + please."}}'::jsonb, null, null, null),
  ('a0hw-11-inside-outside', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "It is hot outside.", "answer": "الجو حار برا.", "accept": ["الجو حار برا", "الجو حار برا.", "حار برا"]}'::jsonb, null, null, null),
  ('a0hw-11-inside-outside', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "انتظر جوا.", "answer": "Wait inside.", "accept": ["Wait inside", "Wait inside.", "wait inside"]}'::jsonb, null, null, null),
  ('a0hw-11-inside-outside', 7, 'spell', '{"type": "spell", "answer": "OUT", "display": "O U T", "meaning": "برا (بداية الكلمة)", "options": [{"t": "O", "ok": true}, {"t": "U", "ok": true}, {"t": "T", "ok": true}, {"t": "E", "ok": false}], "translit": "اوت"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-12-left-right', 0, 'word', 'right', 'يمين', 'رايت', 'The bank is on the right.', 'البنك على اليمين.', 'ذا بانك از اون ذا رايت.', null, null),
  ('a0hw-12-left-right', 1, 'word', 'left', 'شمال، يسار', 'ليفت', 'Turn left.', 'لف يسار.', 'تيرن ليفت.', null, null),
  ('a0hw-12-left-right', 2, 'word', 'middle', 'وسط', 'ميدل', 'Sit in the middle.', 'اقعد بالوسط.', 'سيت ان ذا ميدل.', null, null),
  ('a0hw-12-left-right', 3, 'explain', 'Right is your strong hand side. Left is the other. Middle is the center.', 'Right يعني يمين، جهة يدك اليمنى. Left يعني يسار او شمال، الجهة الثانية. و Middle يعني الوسط، بين الاثنين. اذا رحت لمكان وسولت وين البنك؟ يقولون لك its on the right يعني على اليمين. واذا قالوا its in the middle يعني بالنص، بين الاثنين. نصيحة: امسك قلمك، اليد اللي كتبت بها هي right.', '', null, null, null, null, null),
  ('a0hw-12-left-right', 4, 'explain', 'Right also means صح, and left also means he left.', 'مثل on و like، كلمة Right لها معنيين: اليمين الجهة، و صح يعني الكلام الصح. اذا احد قال كلام زين تقول له You are right يعني انت الصح، كلامك مضبوط. و Left كذلك لها معنيين: يسار الجهة، واذا قلت He left the house يعني طلع من البيت وراح. مع الجهات right يمين و left يسار، ومع الكلام right صح.', '', null, null, null, null, null),
  ('a0hw-12-left-right', 5, 'sentence', 'The bank is on the right.', 'البنك على اليمين.', 'ذا بانك از اون ذا رايت.', null, null, null, null, null),
  ('a0hw-12-left-right', 6, 'sentence', 'Turn left.', 'لف يسار.', 'تيرن ليفت.', null, null, null, null, null),
  ('a0hw-12-left-right', 7, 'sentence', 'Sit in the middle.', 'اقعد بالوسط.', 'سيت ان ذا ميدل.', null, null, null, null, null),
  ('a0hw-12-left-right', 8, 'sentence', 'My right hand.', 'يدي اليمنى.', 'ماي رايت هاند.', null, null, null, null, null),
  ('a0hw-12-left-right', 9, 'sentence', 'The house on the left.', 'البيت اللي على اليسار.', 'ذا هاوس اون ذا ليفت.', null, null, null, null, null),
  ('a0hw-12-left-right', 10, 'sentence', 'You are right.', 'كلامك صح.', 'يو ار رايت.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-12-left-right', 0, 'choose', '{"type": "choose", "question": {"ar": "البنك على جهة يمينك: The bank is on the ___.", "en": "The bank is on your right side: The bank is on the ___.", "tr": "ذا بانك از اون يور رايت سايد: ذا بانك از اون ذا."}, "options": [{"t": "right", "ok": true, "tr": "رايت"}, {"t": "left", "ok": false, "tr": "ليفت"}, {"t": "middle", "ok": false, "tr": "ميدل"}], "hint": {"ar": "اليمين right.", "en": "Right is the right side."}}'::jsonb, null, null, null),
  ('a0hw-12-left-right', 1, 'choose', '{"type": "choose", "question": {"ar": "تبي تللف جهة اليسار، تقول: Turn ___.", "en": "You want the left direction: Turn ___.", "tr": "يو وانت ذا ليفت داريكشن: تيرن."}, "options": [{"t": "left", "ok": true, "tr": "ليفت"}, {"t": "right", "ok": false, "tr": "رايت"}, {"t": "up", "ok": false, "tr": "اب"}], "hint": {"ar": "اليسار left.", "en": "Left is the other side."}}'::jsonb, null, null, null),
  ('a0hw-12-left-right', 2, 'choose', '{"type": "choose", "question": {"ar": "تبغى تقعد بالنص بين ربعك: Sit in the ___.", "en": "You sit between your friends: Sit in the ___.", "tr": "يو سيت بيتوين يور فرندز: سيت ان ذا."}, "options": [{"t": "middle", "ok": true, "tr": "ميدل"}, {"t": "left", "ok": false, "tr": "ليفت"}, {"t": "right", "ok": false, "tr": "رايت"}], "hint": {"ar": "الوسط middle.", "en": "Middle is the center."}}'::jsonb, null, null, null),
  ('a0hw-12-left-right', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: البنك على اليمين.", "en": "Build: The bank is on the right.", "tr": "بلد: ذا بانك از اون ذا رايت"}, "tokens": ["The", "bank", "is", "on", "the", "right"], "answer": ["The", "bank", "is", "on", "the", "right"], "ar": "البنك على اليمين", "hint": {"ar": "ذا بعدين بانك بعدين از بعدين اون بعدين ذا بعدين رايت.", "en": "The + bank + is + on + the right."}}'::jsonb, null, null, null),
  ('a0hw-12-left-right', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: اقعد بالوسط.", "en": "Build: Sit in the middle.", "tr": "بلد: سيت ان ذا ميدل"}, "tokens": ["Sit", "in", "the", "middle"], "answer": ["Sit", "in", "the", "middle"], "ar": "اقعد بالوسط", "hint": {"ar": "سيت بعدين ان بعدين ذا بعدين ميدل.", "en": "Sit + in + the middle."}}'::jsonb, null, null, null),
  ('a0hw-12-left-right', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Turn left.", "answer": "لف يسار.", "accept": ["لف يسار", "لف يسار.", "لف شمال"]}'::jsonb, null, null, null),
  ('a0hw-12-left-right', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "يدي اليمنى.", "answer": "My right hand.", "accept": ["My right hand", "My right hand", "My right hand ."]}'::jsonb, null, null, null),
  ('a0hw-12-left-right', 7, 'choose', '{"type": "choose", "question": {"ar": "صديقك جاوب جواب صح، تقول له: You are ___.", "en": "Your friend answered correctly: You are ___.", "tr": "يور فرند انسرد كوركتلي: يو ار."}, "options": [{"t": "right", "ok": true, "tr": "رايت"}, {"t": "left", "ok": false, "tr": "ليفت"}, {"t": "middle", "ok": false, "tr": "ميدل"}], "hint": {"ar": "الصح right.", "en": "Right also means correct."}}'::jsonb, null, null, null),
  ('a0hw-12-left-right', 8, 'spell', '{"type": "spell", "answer": "LEFT", "display": "L E F T", "meaning": "يسار", "options": [{"t": "L", "ok": true}, {"t": "E", "ok": true}, {"t": "F", "ok": true}, {"t": "T", "ok": true}, {"t": "R", "ok": false}], "translit": "ليفت"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-13-the', 0, 'word', 'the', 'ال التعريف', 'ذا', 'Close the door.', 'اقفل الباب.', 'كلوز ذا دور.', null, null),
  ('a0hw-13-the', 1, 'word', 'a', 'واحد جديد ما نعرفه', 'ا', 'I have a car.', 'عندي سيارة.', 'اي هاف ا كار.', null, null),
  ('a0hw-13-the', 2, 'word', 'a car', 'سيارة، وحدة', 'ا كار', 'She wants a cola.', 'تبغى كولا.', 'شي وانتس ا كولا.', null, null),
  ('a0hw-13-the', 3, 'explain', 'The points to a thing we know. A points to any new thing.', 'كلمة the هي مثل ال بالعربي: the door يعني الباب، باب معين نعرفه كلنا. اما a فتجي لشي جديد اول مرة نذكره: I have a car عندي سيارة، اي سيارة. بعدها لما نذكرها ثاني نقول the car لان صرنا نعرفها. مثال من البيت: امك تقول close the door لان الباب معروف، و a cold cola اول مرة تطلبها، و بعدها the cola.', '', null, null, null, null, null),
  ('a0hw-13-the', 4, 'sentence', 'Close the door.', 'اقفل الباب.', 'كلوز ذا دور.', null, null, null, null, null),
  ('a0hw-13-the', 5, 'sentence', 'I have a car.', 'عندي سيارة.', 'اي هاف ا كار.', null, null, null, null, null),
  ('a0hw-13-the', 6, 'sentence', 'The cola is cold.', 'الكولا باردة.', 'ذا كولا از كولد.', null, null, null, null, null),
  ('a0hw-13-the', 7, 'sentence', 'Open the window.', 'افتح الشباك.', 'اوبن ذا ويندو.', null, null, null, null, null),
  ('a0hw-13-the', 8, 'sentence', 'She wants a cola.', 'تبغى كولا.', 'شي وانتس ا كولا.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-13-the', 0, 'choose', '{"type": "choose", "question": {"ar": "امك طلبت منك تقفل الباب المعروف: Close ___ door.", "en": "Your mom asks about the known door: Close ___ door.", "tr": "يور موم اكسك اباوت ذا نوون دور: كلوز دور."}, "options": [{"t": "the", "ok": true, "tr": "ذا"}, {"t": "a", "ok": false, "tr": "ا"}, {"t": "an", "ok": false, "tr": "ان"}], "hint": {"ar": "الباب المعروف the.", "en": "The known door takes the."}}'::jsonb, null, null, null),
  ('a0hw-13-the', 1, 'choose', '{"type": "choose", "question": {"ar": "اول مرة تذكر ان عندك سيارة: I have ___ car.", "en": "First time you mention your car: I have ___ car.", "tr": "فرست تايم يو منشن يور كار: اي هاف كار."}, "options": [{"t": "a", "ok": true, "tr": "ا"}, {"t": "the", "ok": false, "tr": "ذا"}, {"t": "an", "ok": false, "tr": "ان"}], "hint": {"ar": "الشي الجديد a.", "en": "A new thing takes a."}}'::jsonb, null, null, null),
  ('a0hw-13-the', 2, 'choose', '{"type": "choose", "question": {"ar": "الكولا اللي بالثلاجة باردة: ___ cola is cold.", "en": "The cola we know is cold: ___ cola is cold.", "tr": "ذا كولا وي نوو از كولد: كولا از كولد."}, "options": [{"t": "The", "ok": true, "tr": "ذا"}, {"t": "A", "ok": false, "tr": "ا"}, {"t": "An", "ok": false, "tr": "ان"}], "hint": {"ar": "بعد ما عرفناها تصير the.", "en": "Once we know it, it becomes the."}}'::jsonb, null, null, null),
  ('a0hw-13-the', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: اقفل الباب.", "en": "Build: Close the door.", "tr": "بلد: كلوز ذا دور"}, "tokens": ["Close", "the", "door"], "answer": ["Close", "the", "door"], "ar": "اقفل الباب", "hint": {"ar": "كلوز بعدين ذا بعدين دور.", "en": "Close + the door."}}'::jsonb, null, null, null),
  ('a0hw-13-the', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: عندي سيارة.", "en": "Build: I have a car.", "tr": "بلد: اي هاف ا كار"}, "tokens": ["I", "have", "a", "car"], "answer": ["I", "have", "a", "car"], "ar": "عندي سيارة", "hint": {"ar": "اي بعدين هاف بعدين ا بعدين كار.", "en": "I + have + a + car."}}'::jsonb, null, null, null),
  ('a0hw-13-the', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Open the window.", "answer": "افتح الشباك.", "accept": ["افتح الشباك", "افتح الشباك.", "افتح الشباك"]}'::jsonb, null, null, null),
  ('a0hw-13-the', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "الكولا باردة.", "answer": "The cola is cold.", "accept": ["The cola is cold", "The cola is cold.", "The cola is cold ."]}'::jsonb, null, null, null),
  ('a0hw-13-the', 7, 'spell', '{"type": "spell", "answer": "THE", "display": "T H E", "meaning": "ال التعريف", "options": [{"t": "T", "ok": true}, {"t": "H", "ok": true}, {"t": "E", "ok": true}, {"t": "A", "ok": false}], "translit": "ذا"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-14-come-go-bring', 0, 'word', 'come', 'تعال', 'كام', 'Come with me.', 'تعال معي.', 'كام ويذ مي.', null, null),
  ('a0hw-14-come-go-bring', 1, 'word', 'go', 'روح', 'قو', 'Go to the kitchen.', 'روح للمطبخ.', 'قو تو ذا كيتشن.', null, null),
  ('a0hw-14-come-go-bring', 2, 'word', 'bring', 'جيب', 'برينق', 'Bring me some cola.', 'جيب لي كولا.', 'برينق مي سوم كولا.', null, null),
  ('a0hw-14-come-go-bring', 3, 'explain', 'Come means move to me. Go means move away. Bring means carry something with you.', 'Come يعني تعال، تجي ناحيتي. Go يعني روح، تبتعد عني. و Bring يعني جيب شي معك: bring me the cola جيب لي الكولا. بالبيت: امك تقول لك come here تعال هنا، و go to your room روح لغرفتك. واذا قالت bring me a glass جيب لي كوب، معناها خذه وايبه معك.', '', null, null, null, null, null),
  ('a0hw-14-come-go-bring', 4, 'sentence', 'Come with me.', 'تعال معي.', 'كام ويذ مي.', null, null, null, null, null),
  ('a0hw-14-come-go-bring', 5, 'sentence', 'Go to the kitchen.', 'روح للمطبخ.', 'قو تو ذا كيتشن.', null, null, null, null, null),
  ('a0hw-14-come-go-bring', 6, 'sentence', 'Bring me some cola.', 'جيب لي كولا.', 'برينق مي سوم كولا.', null, null, null, null, null),
  ('a0hw-14-come-go-bring', 7, 'sentence', 'I go to work.', 'اروح الشغل.', 'اي قو تو وورك.', null, null, null, null, null),
  ('a0hw-14-come-go-bring', 8, 'sentence', 'Come here, please.', 'تعال هنا لو سمحت.', 'كام هير، بليز.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-14-come-go-bring', 0, 'choose', '{"type": "choose", "question": {"ar": "امك تبغاك تجي عندها: ___", "en": "Your mom wants you near her: ___", "tr": "يور موم وانتس يو نير هير:"}, "options": [{"t": "Come here", "ok": true, "tr": "كام هير"}, {"t": "Go there", "ok": false, "tr": "قو ذير"}, {"t": "Bring it", "ok": false, "tr": "برينق ات"}], "hint": {"ar": "تجي ناحيتها come here.", "en": "Moving to her means come."}}'::jsonb, null, null, null),
  ('a0hw-14-come-go-bring', 1, 'choose', '{"type": "choose", "question": {"ar": "تبغى اخوك يجيب لك كولا من الثلاجة: ___ me some cola.", "en": "You want a cola from the fridge: ___ me some cola.", "tr": "يو وانت ا كولا فروم ذا فريج: مي سوم كولا."}, "options": [{"t": "Bring", "ok": true, "tr": "برينق"}, {"t": "Go", "ok": false, "tr": "قو"}, {"t": "Come", "ok": false, "tr": "كام"}], "hint": {"ar": "جيب معك bring.", "en": "Carry it to me means bring."}}'::jsonb, null, null, null),
  ('a0hw-14-come-go-bring', 2, 'choose', '{"type": "choose", "question": {"ar": "ابوك قال لك روح نم: ___ to bed.", "en": "Your dad says go sleep: ___ to bed.", "tr": "يور داد سيز قو سليب: تو بيد."}, "options": [{"t": "Go", "ok": true, "tr": "قو"}, {"t": "Come", "ok": false, "tr": "كام"}, {"t": "Bring", "ok": false, "tr": "برينق"}], "hint": {"ar": "تبتعد go.", "en": "Move away means go."}}'::jsonb, null, null, null),
  ('a0hw-14-come-go-bring', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: جيب لي كولا.", "en": "Build: Bring me some cola.", "tr": "بلد: برينق مي سوم كولا"}, "tokens": ["Bring", "me", "some", "cola"], "answer": ["Bring", "me", "some", "cola"], "ar": "جيب لي كولا", "hint": {"ar": "برينق بعدين مي بعدين سوم بعدين كولا.", "en": "Bring + me + some cola."}}'::jsonb, null, null, null),
  ('a0hw-14-come-go-bring', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: روح للمطبخ.", "en": "Build: Go to the kitchen.", "tr": "بلد: قو تو ذا كيتشن"}, "tokens": ["Go", "to", "the", "kitchen"], "answer": ["Go", "to", "the", "kitchen"], "ar": "روح للمطبخ", "hint": {"ar": "قو بعدين تو بعدين ذا بعدين كيتشن.", "en": "Go + to + the kitchen."}}'::jsonb, null, null, null),
  ('a0hw-14-come-go-bring', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Come with me.", "answer": "تعال معي.", "accept": ["تعال معي", "تعال معي.", "تعال معي "]}'::jsonb, null, null, null),
  ('a0hw-14-come-go-bring', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "اروح الشغل.", "answer": "I go to work.", "accept": ["I go to work", "I go to work.", "I go to work ."]}'::jsonb, null, null, null),
  ('a0hw-14-come-go-bring', 7, 'spell', '{"type": "spell", "answer": "COME", "display": "C O M E", "meaning": "تعال", "options": [{"t": "C", "ok": true}, {"t": "O", "ok": true}, {"t": "M", "ok": true}, {"t": "E", "ok": true}, {"t": "A", "ok": false}], "translit": "كام"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-15-pick-drop-carry', 0, 'word', 'pick up', 'ارفع وخذ', 'بك اب', 'Pick up your shoes.', 'ارفع جزمتك.', 'بك اب يور شوز.', null, null),
  ('a0hw-15-pick-drop-carry', 1, 'word', 'drop', 'طرح، طاح', 'دروب', 'Don''t drop the phone.', 'لا تخلي الجوال يطيح.', 'دونت دروب ذا فون.', null, null),
  ('a0hw-15-pick-drop-carry', 2, 'word', 'carry', 'احمل وامش', 'كاري', 'I carry the bag.', 'احمل الشنطة.', 'اي كاري ذا باق.', null, null),
  ('a0hw-15-pick-drop-carry', 3, 'explain', 'Pick up means lift something from a low place. Drop means it falls. Carry means hold it while you walk.', 'Pick up يعني ترفع شي من تحت وتاخذه: pick up your shoes ارفع جزمتك من الارض. Drop يعني الشي يطيح من يدك: don''t drop the phone لا تخلي الجوال يطيح. Carry يعني تحمل شي وانت ماشي: carry the bag احمل الشنطة وامش. بالبيت: امك تقول pick up your toys ارفع العبك، و carry the bag for me احمل عني الشنطة.', '', null, null, null, null, null),
  ('a0hw-15-pick-drop-carry', 4, 'explain', 'Pick up the phone means answer it.', 'Pick up لها معنى تاني يمشي مع الجوال: pick up the phone يعني رد على الجوال، مو بس ترفعه. اذا الجوال يرن وابوك يقول لك pick up! يعني رد! خذها من بيتكم: pick up your shoes ارفع جزمتك، بس pick up the phone رد على الجوال. نفس الكلمة والسياق يفرق، مثل on بالضبط.', '', null, null, null, null, null),
  ('a0hw-15-pick-drop-carry', 5, 'sentence', 'Pick up your shoes.', 'ارفع جزمتك.', 'بك اب يور شوز.', null, null, null, null, null),
  ('a0hw-15-pick-drop-carry', 6, 'sentence', 'Don''t drop the phone.', 'لا تخلي الجوال يطيح.', 'دونت دروب ذا فون.', null, null, null, null, null),
  ('a0hw-15-pick-drop-carry', 7, 'sentence', 'I carry the bag.', 'احمل الشنطة.', 'اي كاري ذا باق.', null, null, null, null, null),
  ('a0hw-15-pick-drop-carry', 8, 'sentence', 'Carry it slowly.', 'احمله على مهلك.', 'كاري ات سلولي.', null, null, null, null, null),
  ('a0hw-15-pick-drop-carry', 9, 'sentence', 'He picked up the keys.', 'هو رفع المفاتيح.', 'هي بكت اب ذا كيز.', null, null, null, null, null),
  ('a0hw-15-pick-drop-carry', 10, 'sentence', 'Pick up the phone.', 'رد على الجوال.', 'بك اب ذا فون.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-15-pick-drop-carry', 0, 'choose', '{"type": "choose", "question": {"ar": "جزمتك على الارض وامك زعلانة: ___ your shoes.", "en": "Your shoes are on the floor: ___ your shoes.", "tr": "يور شوز ار اون ذا فلور: يور شوز."}, "options": [{"t": "Pick up", "ok": true, "tr": "بك اب"}, {"t": "Drop", "ok": false, "tr": "دروب"}, {"t": "Carry", "ok": false, "tr": "كاري"}], "hint": {"ar": "ترفعها من الارض pick up.", "en": "Lift from the floor is pick up."}}'::jsonb, null, null, null),
  ('a0hw-15-pick-drop-carry', 1, 'choose', '{"type": "choose", "question": {"ar": "الجوال بيدك وتبغى ما يطيح: Don''t ___ the phone.", "en": "You don''t want the phone to fall: Don''t ___ the phone.", "tr": "يو دونت وانت ذا فون تو فول: دونت ذا فون."}, "options": [{"t": "drop", "ok": true, "tr": "دروب"}, {"t": "pick up", "ok": false, "tr": "بك اب"}, {"t": "carry", "ok": false, "tr": "كاري"}], "hint": {"ar": "يطيح drop.", "en": "Fall from the hand is drop."}}'::jsonb, null, null, null),
  ('a0hw-15-pick-drop-carry', 2, 'choose', '{"type": "choose", "question": {"ar": "تبغى تحمل الشنطة عن امك: ___ the bag for me.", "en": "You hold the bag for your mom: ___ the bag for me.", "tr": "يو هولد ذا باق فور يور موم: ذا باق فور مي."}, "options": [{"t": "Carry", "ok": true, "tr": "كاري"}, {"t": "Drop", "ok": false, "tr": "دروب"}, {"t": "Go", "ok": false, "tr": "قو"}], "hint": {"ar": "تحملها وتمشي carry.", "en": "Hold while walking is carry."}}'::jsonb, null, null, null),
  ('a0hw-15-pick-drop-carry', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: ارفع جزمتك.", "en": "Build: Pick up your shoes.", "tr": "بلد: بك اب يور شوز"}, "tokens": ["Pick", "up", "your", "shoes"], "answer": ["Pick", "up", "your", "shoes"], "ar": "ارفع جزمتك", "hint": {"ar": "بك بعدين اب بعدين يور بعدين شوز.", "en": "Pick + up + your shoes."}}'::jsonb, null, null, null),
  ('a0hw-15-pick-drop-carry', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: احمل الشنطة.", "en": "Build: I carry the bag.", "tr": "بلد: اي كاري ذا باق"}, "tokens": ["I", "carry", "the", "bag"], "answer": ["I", "carry", "the", "bag"], "ar": "احمل الشنطة", "hint": {"ar": "اي بعدين كاري بعدين ذا بعدين باق.", "en": "I + carry + the bag."}}'::jsonb, null, null, null),
  ('a0hw-15-pick-drop-carry', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Carry it slowly.", "answer": "احمله على مهلك.", "accept": ["احمله على مهلك", "احمله على مهلك.", "حمله على مهلك"]}'::jsonb, null, null, null),
  ('a0hw-15-pick-drop-carry', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "لا تخلي الجوال يطيح.", "answer": "Don''t drop the phone.", "accept": ["Don''t drop the phone", "Dont drop the phone", "Do not drop the phone"]}'::jsonb, null, null, null),
  ('a0hw-15-pick-drop-carry', 7, 'spell', '{"type": "spell", "answer": "DROP", "display": "D R O P", "meaning": "طرح", "options": [{"t": "D", "ok": true}, {"t": "R", "ok": true}, {"t": "O", "ok": true}, {"t": "P", "ok": true}, {"t": "E", "ok": false}], "translit": "دروب"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-16-good-bad-fast-slow', 0, 'word', 'good', 'زين', 'قود', 'The food is good.', 'الاكل زين.', 'ذا فوود از قود.', null, null),
  ('a0hw-16-good-bad-fast-slow', 1, 'word', 'bad', 'خايب، مو زين', 'باد', 'The internet is bad today.', 'النت خايب اليوم.', 'ذا انترنت از باد تودي.', null, null),
  ('a0hw-16-good-bad-fast-slow', 2, 'word', 'fast', 'سريع', 'فاست', 'You speak fast.', 'تكلم بسرعة.', 'يو سبيك فاست.', null, null),
  ('a0hw-16-good-bad-fast-slow', 3, 'explain', 'Good means nice. Bad means not nice. Fast means quick. Slow means not quick.', 'Good يعني زين وحلو. Bad يعني خايب او مو زين. Fast يعني سريع. و Slow يعني بطي، عكس سريع. اذا اكلت شي لذيذ قلت its good زين، واذا النت قطع عليك قلت its bad خايب. واذا احد كلم بسرعة وما فهمت عليه قلت speak slowly يعني كلم على مهلك، ببطي.', '', null, null, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 4, 'sentence', 'The food is good.', 'الاكل زين.', 'ذا فوود از قود.', null, null, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 5, 'sentence', 'The internet is bad today.', 'النت خايب اليوم.', 'ذا انترنت از باد تودي.', null, null, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 6, 'sentence', 'You speak fast.', 'تكلم بسرعة.', 'يو سبيك فاست.', null, null, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 7, 'sentence', 'Drive slowly.', 'سوق على مهلك.', 'درايف سلولي.', null, null, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 8, 'sentence', 'A slow song.', 'اغنية على مهلها.', 'ا سلو سونق.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-16-good-bad-fast-slow', 0, 'choose', '{"type": "choose", "question": {"ar": "الاكل لذيذ، تقول: The food is ___.", "en": "The food is tasty: The food is ___.", "tr": "ذا فوود از تيستي: ذا فوود از."}, "options": [{"t": "good", "ok": true, "tr": "قود"}, {"t": "bad", "ok": false, "tr": "باد"}, {"t": "fast", "ok": false, "tr": "فاست"}], "hint": {"ar": "اللذيذ good.", "en": "Tasty means good."}}'::jsonb, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 1, 'choose', '{"type": "choose", "question": {"ar": "النت يقطع كل شوي، تقول: The internet is ___.", "en": "The internet keeps cutting: The internet is ___.", "tr": "ذا انترنت كيكس كاتينق: ذا انترنت از."}, "options": [{"t": "bad", "ok": true, "tr": "باد"}, {"t": "good", "ok": false, "tr": "قود"}, {"t": "slow", "ok": false, "tr": "سلو"}], "hint": {"ar": "الخايب bad.", "en": "Not working well is bad."}}'::jsonb, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 2, 'choose', '{"type": "choose", "question": {"ar": "تبغى السواق يهدا: Drive ___.", "en": "You want the driver to relax: Drive ___.", "tr": "يو وانت ذا درايفر تو ريلاكس: درايف."}, "options": [{"t": "slowly", "ok": true, "tr": "سلولي"}, {"t": "fast", "ok": false, "tr": "فاست"}, {"t": "up", "ok": false, "tr": "اب"}], "hint": {"ar": "على مهلك slowly.", "en": "Not fast means slowly."}}'::jsonb, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: الاكل زين.", "en": "Build: The food is good.", "tr": "بلد: ذا فوود از قود"}, "tokens": ["The", "food", "is", "good"], "answer": ["The", "food", "is", "good"], "ar": "الاكل زين", "hint": {"ar": "ذا بعدين فوود بعدين از بعدين قود.", "en": "The + food + is + good."}}'::jsonb, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: سوق على مهلك.", "en": "Build: Drive slowly.", "tr": "بلد: درايف سلولي"}, "tokens": ["Drive", "slowly"], "answer": ["Drive", "slowly"], "ar": "سوق على مهلك", "hint": {"ar": "درايف بعدين سلولي.", "en": "Drive + slowly."}}'::jsonb, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "You speak fast.", "answer": "تكلم بسرعة.", "accept": ["تكلم بسرعة", "تكلم بسرعة.", "انت تكلم بسرعة"]}'::jsonb, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "النت خايب اليوم.", "answer": "The internet is bad today.", "accept": ["The internet is bad today", "The internet is bad today.", "The internet is bad today ."]}'::jsonb, null, null, null),
  ('a0hw-16-good-bad-fast-slow', 7, 'spell', '{"type": "spell", "answer": "FAST", "display": "F A S T", "meaning": "سريع", "options": [{"t": "F", "ok": true}, {"t": "A", "ok": true}, {"t": "S", "ok": true}, {"t": "T", "ok": true}, {"t": "E", "ok": false}], "translit": "فاست"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-17-er-ed', 0, 'word', 'faster', 'اسرع', 'فاستر', 'The car is faster.', 'السيارة اسرع.', 'ذا كار از فاستر.', null, null),
  ('a0hw-17-er-ed', 1, 'word', 'slower', 'ابطا', 'سلوور', 'Walk slower.', 'امشي ابطا.', 'ووك سلوور.', null, null),
  ('a0hw-17-er-ed', 2, 'word', 'played', 'لعب، صار بالماضي', 'بليد', 'I played football.', 'لعبت كورة.', 'اي بليد فوتبول.', null, null),
  ('a0hw-17-er-ed', 3, 'explain', 'Add er to compare: fast becomes faster. Add ed for the past: play becomes played.', 'قاعدة ذهبية تنفعك طول عمرك: تبي تقارن بين شي وشي؟ ضيف er بالاخير. Fast سريع تصير faster اسرع. Slow بطي تصير slower ابطا. Good زين تصير better احسن. واذا تبي تتكلم عن شي صار وخلاص، بالماضي، ضيف ed: play يلعب تصير played لعب، pick up ترفع تصير picked up رفعت. امس لعبت كورة؟ I played football. سهلة صح؟', '', null, null, null, null, null),
  ('a0hw-17-er-ed', 4, 'explain', 'Drop means dropped, pick up means picked up. Yesterday uses ed.', 'كل الافعال اللي خذيناها تنفع معها القاعدة: yesterday امس I dropped the phone طرحت الجوال، يعني صار وخلاص. او I picked up my shoes رفعت جزمتي. اذا سمعت الكلمة فيها ed بالاخير اعرف انها قصة قديمة صارت قبل شوي او امس، مو الحين.', '', null, null, null, null, null),
  ('a0hw-17-er-ed', 5, 'sentence', 'The car is faster.', 'السيارة اسرع.', 'ذا كار از فاستر.', null, null, null, null, null),
  ('a0hw-17-er-ed', 6, 'sentence', 'Walk slower.', 'امشي ابطا.', 'ووك سلوور.', null, null, null, null, null),
  ('a0hw-17-er-ed', 7, 'sentence', 'I played football.', 'لعبت كورة.', 'اي بليد فوتبول.', null, null, null, null, null),
  ('a0hw-17-er-ed', 8, 'sentence', 'She picked up the phone.', 'هي رفعت الجوال.', 'شي بكت اب ذا فون.', null, null, null, null, null),
  ('a0hw-17-er-ed', 9, 'sentence', 'He dropped the glass.', 'هو طرح الكوب.', 'هي دروبد ذا قلاس.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-17-er-ed', 0, 'choose', '{"type": "choose", "question": {"ar": "تبي تقول اكبر سرعة، من fast تصير: ___", "en": "More speed than fast: ___", "tr": "مور سبيد ذان فاست:"}, "options": [{"t": "faster", "ok": true, "tr": "فاستر"}, {"t": "fasted", "ok": false, "tr": "فاستد"}, {"t": "fast", "ok": false, "tr": "فاست"}], "hint": {"ar": "المقارنة بالـ er.", "en": "Comparison uses er."}}'::jsonb, null, null, null),
  ('a0hw-17-er-ed', 1, 'choose', '{"type": "choose", "question": {"ar": "امس لعبت كورة، الفعل ماضي: I ___ football.", "en": "Yesterday you played: I ___ football.", "tr": "يسترداي يو بليد: اي فوتبول."}, "options": [{"t": "played", "ok": true, "tr": "بليد"}, {"t": "play", "ok": false, "tr": "بلاي"}, {"t": "playing", "ok": false, "tr": "بلاينق"}], "hint": {"ar": "الماضي بالـ ed.", "en": "The past uses ed."}}'::jsonb, null, null, null),
  ('a0hw-17-er-ed', 2, 'choose', '{"type": "choose", "question": {"ar": "هي رفعت الجوال بالامس: She ___ up the phone.", "en": "Yesterday she lifted the phone: She ___ up the phone.", "tr": "يسترداي شي ليفتد ذا فون: شي اب ذا فون."}, "options": [{"t": "picked", "ok": true, "tr": "بكت"}, {"t": "pick", "ok": false, "tr": "بك"}, {"t": "picks", "ok": false, "tr": "بكس"}], "hint": {"ar": "ماضي pick هي picked.", "en": "The past of pick is picked."}}'::jsonb, null, null, null),
  ('a0hw-17-er-ed', 3, 'order', '{"type": "order", "prompt": {"ar": "رتب: لعبت كورة.", "en": "Build: I played football.", "tr": "بلد: اي بليد فوتبول"}, "tokens": ["I", "played", "football"], "answer": ["I", "played", "football"], "ar": "لعبت كورة", "hint": {"ar": "اي بعدين بليد بعدين فوتبول.", "en": "I + played + football."}}'::jsonb, null, null, null),
  ('a0hw-17-er-ed', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: امشي ابطا.", "en": "Build: Walk slower.", "tr": "بلد: ووك سلوور"}, "tokens": ["Walk", "slower"], "answer": ["Walk", "slower"], "ar": "امشي ابطا", "hint": {"ar": "ووك بعدين سلوور.", "en": "Walk + slower."}}'::jsonb, null, null, null),
  ('a0hw-17-er-ed', 5, 'translate', '{"type": "translate", "dir": "en-ar", "source": "The car is faster.", "answer": "السيارة اسرع.", "accept": ["السيارة اسرع", "السيارة اسرع.", "السياره اسرع"]}'::jsonb, null, null, null),
  ('a0hw-17-er-ed', 6, 'translate', '{"type": "translate", "dir": "ar-en", "source": "هي رفعت الجوال.", "answer": "She picked up the phone.", "accept": ["She picked up the phone", "She picked up the phone", "She picked up the phone ."]}'::jsonb, null, null, null),
  ('a0hw-17-er-ed', 7, 'spell', '{"type": "spell", "answer": "ER", "display": "E R", "meaning": "حروف المقارنة", "options": [{"t": "E", "ok": true}, {"t": "R", "ok": true}, {"t": "A", "ok": false}, {"t": "D", "ok": false}], "translit": "ار"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-18-if-will', 0, 'word', 'if', 'لو، اذا', 'ايف', 'If you are hungry, eat.', 'لو انت جوعان، كل.', 'ايف يو ار هنقري، ايت.', null, null),
  ('a0hw-18-if-will', 1, 'word', 'will', 'راح، ب', 'ويل', 'I will call you.', 'راح اكلمك.', 'اي ويل كول يو.', null, null),
  ('a0hw-18-if-will', 2, 'word', 'so', 'ف، عشان كذا', 'سو', 'I am going to the mall so I will be late.', 'انا رايح المول ف بارجع متاخر.', 'ايم قووينق تو ذا مول سو ايل بي ليت.', null, null),
  ('a0hw-18-if-will', 3, 'word', 'tomorrow', 'بكرا', 'تومورو', 'She will come tomorrow.', 'راح تجي بكرا.', 'شي ويل كام تومورو.', null, null),
  ('a0hw-18-if-will', 4, 'explain', 'If starts a condition. Will makes the future.', 'If يعني لو او اذا، تجي بالاول وتعطيك شرط: if you are hungry لو انت جوعان. و Will معناها راح، تسوي الشي بالجاي مو الحين: I will call you راح اكلمك، يعني بعد شوي. اذا قلت لامك I will clean my room راح انضف غرفتي، تبتسم لانك وعدتها بالمستقبل.', '', null, null, null, null, null),
  ('a0hw-18-if-will', 5, 'explain', 'So links what happened to what comes next.', 'So معناها ف، تربط السبب بالنتيجة. تقول I am going to the mall انا رايح المول، وتبغى تضيف النتيجة بارجع متاخر، تحط so بالنص: I am going to the mall so I will be late يعني انا رايح المول ف بارجع متاخر. خذها سهلة: الشي اللي صار، بعدين so، بعدين النتيجة. مثل لما تقول لامك الجو حار، فشغل المكيف: It is hot so turn on the AC.', '', null, null, null, null, null),
  ('a0hw-18-if-will', 6, 'explain', 'So also means جدا, like so good.', 'So لها معنى تاني ثاني مثل on و like: تعني جدا. اذا قلت The cola is so good يعني الكولا زينة مره، مو بس زينة، زينة مره. اذا سمعت احد يقول she is so nice يعني هي طيبة حيل. الفرق من السياق: اذا جات بين جملتين فهي ف، واذا جات قبل الصفة فهي جدا.', '', null, null, null, null, null),
  ('a0hw-18-if-will', 7, 'sentence', 'If you are hungry, eat.', 'لو انت جوعان، كل.', 'ايف يو ار هنقري، ايت.', null, null, null, null, null),
  ('a0hw-18-if-will', 8, 'sentence', 'I will call you.', 'راح اكلمك.', 'اي ويل كول يو.', null, null, null, null, null),
  ('a0hw-18-if-will', 9, 'sentence', 'She will come tomorrow.', 'راح تجي بكرا.', 'شي ويل كام تومورو.', null, null, null, null, null),
  ('a0hw-18-if-will', 10, 'sentence', 'I am going to the mall so I will be late.', 'انا رايح المول ف بارجع متاخر.', 'ايم قووينق تو ذا مول سو ايل بي ليت.', null, null, null, null, null),
  ('a0hw-18-if-will', 11, 'sentence', 'She is tired so she will sleep.', 'هي تعبانة فراح تنام.', 'شي از تايرد سو شي ويل سليب.', null, null, null, null, null),
  ('a0hw-18-if-will', 12, 'sentence', 'If it is hot, turn on the AC.', 'لو الجو حار، شغل المكيف.', 'ايف ات از هوت، تيرن اون ذا ايه سي.', null, null, null, null, null),
  ('a0hw-18-if-will', 13, 'sentence', 'We will go tonight.', 'راح نروح الليلة.', 'وي ويل قو تونايت.', null, null, null, null, null),
  ('a0hw-18-if-will', 14, 'sentence', 'The cola is so good.', 'الكولا زينة مره.', 'ذا كولا از سو قود.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-18-if-will', 0, 'choose', '{"type": "choose", "question": {"ar": "تبدا الجملة الشرطية: ___ you are hungry, eat.", "en": "The condition start: ___ you are hungry, eat.", "tr": "ذا كانديشن ستارت: يو ار هنقري، ايت."}, "options": [{"t": "If", "ok": true, "tr": "ايف"}, {"t": "Will", "ok": false, "tr": "ويل"}, {"t": "Go", "ok": false, "tr": "قو"}], "hint": {"ar": "الشرط يبدا ب if.", "en": "A condition starts with if."}}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 1, 'choose', '{"type": "choose", "question": {"ar": "وعدتك اكلمك بالجاي: I ___ call you.", "en": "A future promise: I ___ call you.", "tr": "ا فيوتشر بروميس: اي كول يو."}, "options": [{"t": "will", "ok": true, "tr": "ويل"}, {"t": "if", "ok": false, "tr": "ايف"}, {"t": "am", "ok": false, "tr": "ام"}], "hint": {"ar": "المستقبل will.", "en": "The future uses will."}}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 2, 'choose', '{"type": "choose", "question": {"ar": "خالتك راح تجي بكرا: She ___ come tomorrow.", "en": "Your aunt comes tomorrow: She ___ come tomorrow.", "tr": "يور اونت كمز تومورو: شي كم تومورو."}, "options": [{"t": "will", "ok": true, "tr": "ويل"}, {"t": "if", "ok": false, "tr": "ايف"}, {"t": "is", "ok": false, "tr": "از"}], "hint": {"ar": "راح تعني will.", "en": "Will means she is going to."}}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 3, 'choose', '{"type": "choose", "question": {"ar": "رايح المول وبتتاخر: I am going to the mall ___ I will be late.", "en": "The mall trip makes you late: I am going to the mall ___ I will be late.", "tr": "ذا مول تريب ميكس يو ليت: ايم قووينق تو ذا مول سو ايل بي ليت."}, "options": [{"t": "so", "ok": true, "tr": "سو"}, {"t": "if", "ok": false, "tr": "ايف"}, {"t": "will", "ok": false, "tr": "ويل"}], "hint": {"ar": "ف اللي تربط تعني so.", "en": "So links the reason to the result."}}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: راح اكلمك.", "en": "Build: I will call you.", "tr": "بلد: اي ويل كول يو"}, "tokens": ["I", "will", "call", "you"], "answer": ["I", "will", "call", "you"], "ar": "راح اكلمك", "hint": {"ar": "اي بعدين ويل بعدين كول بعدين يو.", "en": "I + will + call + you."}}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 5, 'order', '{"type": "order", "prompt": {"ar": "رتب: لو الجو حار شغل المكيف.", "en": "Build: If it is hot, turn on the AC.", "tr": "بلد: ايف ات از هوت، تيرن اون ذا ايه سي"}, "tokens": ["If", "it", "is", "hot", "turn", "on", "the", "AC"], "answer": ["If", "it", "is", "hot", "turn", "on", "the", "AC"], "ar": "لو الجو حار، شغل المكيف", "hint": {"ar": "ايف بعدين ات بعدين از بعدين هوت، بعدين تيرن اون ذا ايه سي.", "en": "If + it is hot + turn on the AC."}}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 6, 'order', '{"type": "order", "prompt": {"ar": "رتب: انا رايح المول ف بارجع متاخر.", "en": "Build: I am going to the mall so I will be late.", "tr": "بلد: ايم قووينق تو ذا مول سو ايل بي ليت"}, "tokens": ["I", "am", "going", "to", "the", "mall", "so", "I", "will", "be", "late"], "answer": ["I", "am", "going", "to", "the", "mall", "so", "I", "will", "be", "late"], "ar": "انا رايح المول ف بارجع متاخر", "hint": {"ar": "ايم بعدين قووينق بعدين تو بعدين ذا بعدين مول، بعدين سو، بعدين ايل بي ليت.", "en": "I am going to the mall + so + I will be late."}}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 7, 'translate', '{"type": "translate", "dir": "en-ar", "source": "She will come tomorrow.", "answer": "راح تجي بكرا.", "accept": ["راح تجي بكرا", "راح تجي بكرا.", "بتجي بكرا"]}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 8, 'translate', '{"type": "translate", "dir": "ar-en", "source": "راح نروح الليلة.", "answer": "We will go tonight.", "accept": ["We will go tonight", "We will go tonight", "We will go tonight ."]}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 9, 'translate', '{"type": "translate", "dir": "en-ar", "source": "She is tired so she will sleep.", "answer": "هي تعبانة فراح تنام.", "accept": ["هي تعبانة فراح تنام", "تعبانة فراح تنام"]}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 10, 'choose', '{"type": "choose", "question": {"ar": "الكولا كذا زينة ما تصدق: The cola is ___ good.", "en": "The cola is amazing: The cola is ___ good.", "tr": "ذا كولا از امازينق: ذا كولا از قود."}, "options": [{"t": "so", "ok": true, "tr": "سو"}, {"t": "if", "ok": false, "tr": "ايف"}, {"t": "will", "ok": false, "tr": "ويل"}], "hint": {"ar": "جدا تعني so هنا.", "en": "So also means very."}}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 11, 'spell', '{"type": "spell", "answer": "WILL", "display": "W I L L", "meaning": "راح", "options": [{"t": "W", "ok": true}, {"t": "I", "ok": true}, {"t": "L", "ok": true}, {"t": "L", "ok": true}, {"t": "E", "ok": false}], "translit": "ويل"}'::jsonb, null, null, null),
  ('a0hw-18-if-will', 12, 'spell', '{"type": "spell", "answer": "SO", "display": "S O", "meaning": "ف", "options": [{"t": "S", "ok": true}, {"t": "O", "ok": true}, {"t": "E", "ok": false}, {"t": "A", "ok": false}], "translit": "سو"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-19-like', 0, 'word', 'like', 'زي، احب', 'لايك', 'I like this song.', 'يعجبني هذي الاغنية.', 'اي لايك ذس سونق.', null, null),
  ('a0hw-19-like', 1, 'word', 'love', 'احب حيل، اموت على', 'لاف', 'I love my mom.', 'احب امي.', 'اي لاف ماي موم.', null, null),
  ('a0hw-19-like', 2, 'word', 'want', 'ابغى', 'وانت', 'I want water.', 'ابغى ماي.', 'اي وانت ووتر.', null, null),
  ('a0hw-19-like', 3, 'explain', 'Like number one: it means زي, comparing two things.', 'مثل ما سوينا مع on، كلمة Like لها معنيين، خل ناخذهم واحد واحد. المعنى الاول: like تعني زي، تجي قبل الشي اللي يشبه شي ثاني. He is like my brother يعني هو زي اخوي، نفس الطول او نفس الكلام. This tea is like the coffee يعني الشاي زي القهوة، طعمهم قريب. القاعدة: شي + like + الشي اللي يشبهه.', '', null, null, null, null, null),
  ('a0hw-19-like', 4, 'explain', 'Like number two: it means احب. Love is stronger, want is now.', 'المعنى التاني: like تعني احب او يعجبني. I like cola احب الكولا. I like this song الاغنية تعجبني. و Love اقوى من like: I like my teacher احب معلمي، بس I love my mom اموت على امي. و Want غيرهم: تعني ابغى، شي تبغاه الحين: I want water ابغى ماي. لخصها بجملة: I like it يعجبني، I love it اموت عليه، I want it ابغيه الحين.', '', null, null, null, null, null),
  ('a0hw-19-like', 5, 'sentence', 'He is like my brother.', 'هو زي اخوي.', 'هي از لايك ماي برذر.', null, null, null, null, null),
  ('a0hw-19-like', 6, 'sentence', 'I like cola.', 'احب الكولا.', 'اي لايك كولا.', null, null, null, null, null),
  ('a0hw-19-like', 7, 'sentence', 'I love my mom.', 'احب امي.', 'اي لاف ماي موم.', null, null, null, null, null),
  ('a0hw-19-like', 8, 'sentence', 'I want water.', 'ابغى ماي.', 'اي وانت ووتر.', null, null, null, null, null),
  ('a0hw-19-like', 9, 'sentence', 'This tea is like the coffee.', 'هذا الشاي زي القهوة.', 'ذس تي از لايك ذا كوفي.', null, null, null, null, null),
  ('a0hw-19-like', 10, 'sentence', 'Do you like it?', 'يعجبك؟', 'دي يو لايك ات.', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-19-like', 0, 'choose', '{"type": "choose", "question": {"ar": "اخوك يشبه خالك، تقول: He is ___ my uncle.", "en": "Your brother resembles your uncle: He is ___ my uncle.", "tr": "يور برذر ريزيمبلز يور اونكل: هي از ماي اونكل."}, "options": [{"t": "like", "ok": true, "tr": "لايك"}, {"t": "love", "ok": false, "tr": "لاف"}, {"t": "want", "ok": false, "tr": "وانت"}], "hint": {"ar": "زي تعني like.", "en": "Like means similar to."}}'::jsonb, null, null, null),
  ('a0hw-19-like', 1, 'choose', '{"type": "choose", "question": {"ar": "البيتزا دايم تعجبك: I ___ pizza.", "en": "Pizza always makes you happy: I ___ pizza.", "tr": "بيتزا الويز ميكس يو هابي: اي بيتزا."}, "options": [{"t": "like", "ok": true, "tr": "لايك"}, {"t": "want", "ok": false, "tr": "وانت"}, {"t": "am", "ok": false, "tr": "ام"}], "hint": {"ar": "احب او يعجبني like.", "en": "Like means enjoy."}}'::jsonb, null, null, null),
  ('a0hw-19-like', 2, 'choose', '{"type": "choose", "question": {"ar": "عطشان وتبغى ماي الحين: I ___ water.", "en": "You are thirsty now: I ___ water.", "tr": "يو ار ثيرستي ناو: اي ووتر."}, "options": [{"t": "want", "ok": true, "tr": "وانت"}, {"t": "like", "ok": false, "tr": "لايك"}, {"t": "love", "ok": false, "tr": "لاف"}], "hint": {"ar": "ابغيه الحين want.", "en": "Want means need it now."}}'::jsonb, null, null, null),
  ('a0hw-19-like', 3, 'choose', '{"type": "choose", "question": {"ar": "اموت على امي، تقول: I ___ my mom.", "en": "Your mom is everything to you: I ___ my mom.", "tr": "يور موم از اڤريثينق تو يو: اي ماي موم."}, "options": [{"t": "love", "ok": true, "tr": "لاف"}, {"t": "like", "ok": false, "tr": "لايك"}, {"t": "want", "ok": false, "tr": "وانت"}], "hint": {"ar": "الاقوى love.", "en": "Love is the strongest."}}'::jsonb, null, null, null),
  ('a0hw-19-like', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: هو زي اخوي.", "en": "Build: He is like my brother.", "tr": "بلد: هي از لايك ماي برذر"}, "tokens": ["He", "is", "like", "my", "brother"], "answer": ["He", "is", "like", "my", "brother"], "ar": "هو زي اخوي", "hint": {"ar": "هي بعدين از بعدين لايك بعدين ماي بعدين برذر.", "en": "He + is + like + my brother."}}'::jsonb, null, null, null),
  ('a0hw-19-like', 5, 'order', '{"type": "order", "prompt": {"ar": "رتب: ابغى ماي.", "en": "Build: I want water.", "tr": "بلد: اي وانت ووتر"}, "tokens": ["I", "want", "water"], "answer": ["I", "want", "water"], "ar": "ابغى ماي", "hint": {"ar": "اي بعدين وانت بعدين ووتر.", "en": "I + want + water."}}'::jsonb, null, null, null),
  ('a0hw-19-like', 6, 'translate', '{"type": "translate", "dir": "en-ar", "source": "I love my mom.", "answer": "احب امي.", "accept": ["احب امي", "احب امي.", "اموت على امي"]}'::jsonb, null, null, null),
  ('a0hw-19-like', 7, 'translate', '{"type": "translate", "dir": "ar-en", "source": "هذا الشاي زي القهوة.", "answer": "This tea is like the coffee.", "accept": ["This tea is like the coffee", "This tea is like the coffee", "This tea is like the coffee ."]}'::jsonb, null, null, null),
  ('a0hw-19-like', 8, 'spell', '{"type": "spell", "answer": "LIKE", "display": "L I K E", "meaning": "زي، احب", "options": [{"t": "L", "ok": true}, {"t": "I", "ok": true}, {"t": "K", "ok": true}, {"t": "E", "ok": true}, {"t": "A", "ok": false}], "translit": "لايك"}'::jsonb, null, null, null);
insert into public.lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar, example_tr, note_en, note_ar) values
  ('a0hw-19-cola-time', 0, 'word', 'pour', 'صب', 'بور', 'Pour me some cola.', 'صب لي كولا.', 'بور مي سوم كولا.', null, null),
  ('a0hw-19-cola-time', 1, 'word', 'sit', 'اقعد', 'سيت', 'Sit down here.', 'اقعد هنا.', 'سيت داون هير.', null, null),
  ('a0hw-19-cola-time', 2, 'word', 'put', 'حط', 'بوت', 'Put it on the table.', 'حطه على الطاولة.', 'بوت ات اون ذا تيبل.', null, null),
  ('a0hw-19-cola-time', 3, 'explain', 'The final scene: use everything you learned in one home moment.', 'الحين وقت المشهد الاخير. تخيل انت قاعد بالصالة والتلفزيون شغال، واخوك الصغير داخل المطبخ. وش تقول له؟ Come here تعال هنا. Pick up the glass ارفع الكوب. Pour me some cola صب لي كولا. Put it on the table حطه على الطاولة. ثم تقول له Sit down اقعد معي، و The TV is on التلفزيون شغال. بهالكلام صرت تكلم بالانجليزي بمشهد كامل من البيت، وهذا انجاز كبير.', '', null, null, null, null, null),
  ('a0hw-19-cola-time', 4, 'explain', 'You now know: yes, no, I, you, me, my, he, she, they, this, these, those, in, on, under, here, there, up, down, inside, outside, left, right, the, come, go, bring, pick up, drop, carry, good, bad, fast, slow, faster, played, if, will, so, like, love, want, pour, sit, put.', 'عد الكلمات اللي تعلمتها: ايه، لا، مو، انا، انت، لي، تبعي، تبعك، هو، هي، اياهم، هذا، هذول، ذولك، جوا، على، تحت، فوق، هنا، هناك، لفوق، لتحت، برا، يمين، يسار، وسط، ال، تعال، روح، جيب، ارفع، طرح، احمل، زين، خايب، سريع، بطي، اسرع، لعب، لو، راح، ف، زي، احب، ابغى، صب، اقعد، حط. خمسين كلمة تقريبا، كلها كلمات تخدمك باي كلام. اكمل بعدها على باقي الاكاديميات وانت جاهز.', '', null, null, null, null, null),
  ('a0hw-19-cola-time', 5, 'sentence', 'Come here, please.', 'تعال هنا لو سمحت.', 'كام هير، بليز.', null, null, null, null, null),
  ('a0hw-19-cola-time', 6, 'sentence', 'Pick up the glass.', 'ارفع الكوب.', 'بك اب ذا قلاس.', null, null, null, null, null),
  ('a0hw-19-cola-time', 7, 'sentence', 'Pour me some cola.', 'صب لي كولا.', 'بور مي سوم كولا.', null, null, null, null, null),
  ('a0hw-19-cola-time', 8, 'sentence', 'Put it on the table.', 'حطه على الطاولة.', 'بوت ات اون ذا تيبل.', null, null, null, null, null),
  ('a0hw-19-cola-time', 9, 'sentence', 'Sit down. The TV is on.', 'اقعد. التلفزيون شغال.', 'سيت داون. ذا تي في از اون.', null, null, null, null, null),
  ('a0hw-19-cola-time', 10, 'sentence', 'Good job. You are fast!', 'زين عليك. انت سريع!', 'قود جوب. يو ار فاست!', null, null, null, null, null);
insert into public.lesson_exercises (lesson_id, idx, type, payload, hint_en, hint_ar, hint_tr) values
  ('a0hw-19-cola-time', 0, 'choose', '{"type": "choose", "question": {"ar": "الكوب فاضي وتبغى احد يعبيلك كولا: ___ me some cola.", "en": "You want cola in your glass: ___ me some cola.", "tr": "يو وانت كولا ان يور قلاس: مي سوم كولا."}, "options": [{"t": "Pour", "ok": true, "tr": "بور"}, {"t": "Drop", "ok": false, "tr": "دروب"}, {"t": "Go", "ok": false, "tr": "قو"}], "hint": {"ar": "صب تعني pour.", "en": "Pour means flow it in."}}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 1, 'choose', '{"type": "choose", "question": {"ar": "تبغى اخوك يحط الكوب فوق الطاولة: Put it ___ the table.", "en": "You want the cup on the table: Put it ___ the table.", "tr": "يو وانت ذا كاب اون ذا تيبل: بوت ات ذا تيبل."}, "options": [{"t": "on", "ok": true, "tr": "اون"}, {"t": "in", "ok": false, "tr": "ان"}, {"t": "under", "ok": false, "tr": "اندر"}], "hint": {"ar": "فوق الطاولة on.", "en": "On the table means on."}}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 2, 'choose', '{"type": "choose", "question": {"ar": "التلفزيون شغال وانت تبغى تشوف: The TV is ___.", "en": "The TV is working: The TV is ___.", "tr": "ذا تي في از وركينق: ذا تي في از."}, "options": [{"t": "on", "ok": true, "tr": "اون"}, {"t": "off", "ok": false, "tr": "اوف"}, {"t": "down", "ok": false, "tr": "داون"}], "hint": {"ar": "شغال on.", "en": "Working means on."}}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 3, 'choose', '{"type": "choose", "question": {"ar": "هذي الكولا تبعك: This cola is ___.", "en": "This cola belongs to you: This cola is ___.", "tr": "ذس كولا بيلونقس تو يو: ذس كولا از."}, "options": [{"t": "mine", "ok": true, "tr": "ماين"}, {"t": "my", "ok": false, "tr": "ماي"}, {"t": "me", "ok": false, "tr": "مي"}], "hint": {"ar": "تبعي لحالها mine.", "en": "Mine stands alone."}}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 4, 'order', '{"type": "order", "prompt": {"ar": "رتب: صب لي كولا.", "en": "Build: Pour me some cola.", "tr": "بلد: بور مي سوم كولا"}, "tokens": ["Pour", "me", "some", "cola"], "answer": ["Pour", "me", "some", "cola"], "ar": "صب لي كولا", "hint": {"ar": "بور بعدين مي بعدين سوم بعدين كولا.", "en": "Pour + me + some cola."}}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 5, 'order', '{"type": "order", "prompt": {"ar": "رتب: حطه على الطاولة.", "en": "Build: Put it on the table.", "tr": "بلد: بوت ات اون ذا تيبل"}, "tokens": ["Put", "it", "on", "the", "table"], "answer": ["Put", "it", "on", "the", "table"], "ar": "حطه على الطاولة", "hint": {"ar": "بوت بعدين ات بعدين اون بعدين ذا بعدين تيبل.", "en": "Put + it + on + the table."}}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 6, 'order', '{"type": "order", "prompt": {"ar": "رتب: تعال هنا لو سمحت.", "en": "Build: Come here, please.", "tr": "بلد: كام هير، بليز"}, "tokens": ["Come", "here", "please"], "answer": ["Come", "here", "please"], "ar": "تعال هنا لو سمحت", "hint": {"ar": "كام بعدين هير بعدين بليز.", "en": "Come + here + please."}}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 7, 'order', '{"type": "order", "prompt": {"ar": "رتب: ارفع الكوب.", "en": "Build: Pick up the glass.", "tr": "بلد: بك اب ذا قلاس"}, "tokens": ["Pick", "up", "the", "glass"], "answer": ["Pick", "up", "the", "glass"], "ar": "ارفع الكوب", "hint": {"ar": "بك بعدين اب بعدين ذا بعدين قلاس.", "en": "Pick + up + the glass."}}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 8, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Pour me some cola.", "answer": "صب لي كولا.", "accept": ["صب لي كولا", "صب لي كولا.", "اعبيلي كولا"]}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 9, 'translate', '{"type": "translate", "dir": "ar-en", "source": "حطه على الطاولة.", "answer": "Put it on the table.", "accept": ["Put it on the table", "Put it on the table", "Put it on the table ."]}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 10, 'translate', '{"type": "translate", "dir": "en-ar", "source": "Sit down. The TV is on.", "answer": "اقعد. التلفزيون شغال.", "accept": ["اقعد. التلفزيون شغال", "اقعد التلفزيون شغال", "اقعد. التلفزيون شغال."]}'::jsonb, null, null, null),
  ('a0hw-19-cola-time', 11, 'spell', '{"type": "spell", "answer": "POUR", "display": "P O U R", "meaning": "صب", "options": [{"t": "P", "ok": true}, {"t": "O", "ok": true}, {"t": "U", "ok": true}, {"t": "R", "ok": true}, {"t": "E", "ok": false}], "translit": "بور"}'::jsonb, null, null, null);

-- seat the new academy FIRST in the A0 route (live student_route,
-- a0 row added to granular_seq; everything else unchanged)
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
        ('a0','a0-home-words',0),('a0','a0-sentence-building',1),('a0','a0-question-words',2),('a0','a0-spelling-sounds',3),('a0','a0-error-clinic',4),('a0','a0-social-english',5),
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


-- Re seat existing A0 students parked at the old first academy so they
-- land on the new route start (a0-home-words). Same pattern as migration
-- 202608270001: completed_lessons is a separate set and is untouched.
update public.student_progression
   set current_stage = null, current_lesson = null, updated_at = now()
 where current_stage = 'a0-sentence-building';

COMMIT;
