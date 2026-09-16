-- Fix formal Arabic grammar terminology in DB content
-- Replace formal terms with simple, student-friendly Saudi Arabic
-- These terms confuse beginner students who don't understand formal Arabic grammar

-- Round 2: Additional formal terms found in deeper audit
update public.lessons
  set title_ar = 'اختبار: كلمات السوال'
  where id = 'qw-checkpoint'
  and title_ar = 'اختبار: ادوات الاستفهام';

update public.lesson_items
  set ar_meaning = 'ترتيب السوال: كلمة السوال، ثم كلمة مساعدة، ثم الشخص. مو مثل العربي اللي يبدا بالشخص.'
  where id = 656
  and ar_meaning like '%كلمة الاستفهام%';

update public.lesson_items
  set ar_meaning = 'ذول سيارته.'
  where id = 1497
  and ar_meaning = 'تلك سيارته.';

-- Round 1: Original formal terms
-- Fix assessment question explanation (was: المضارع مع الضمير المفرد الغائب ياخذ s)
update public.assessment_questions
  set explanation_ar = 'مع he/she/it نضيف s للفعل في الحاضر: she goes.'
  where id = '87d1a445-5f69-4b06-afe3-01db20e558db'
  and explanation_ar like '%الضمير المفرد الغائب%';

-- Fix lesson title (was: ضمير اي دايما كبير)
update public.lessons
  set title_ar = 'عياده الاغلاط: كلمة I دايما كبيرة'
  where id = 'err-capital-i'
  and title_ar = 'عياده الاغلاط: ضمير اي دايما كبير';

-- Fix lesson title (was: ضماير الفاعل)
update public.lessons
  set title_ar = 'كلمات الاشخاص (I, you, he, she...)'
  where id = 'subject-pronouns'
  and title_ar = 'ضماير الفاعل';

-- Fix any lesson content that uses formal grammar terms in lesson_items
update public.lesson_items
  set ar = replace(ar, 'من فعل الكون', 'كلمة ربط')
  where ar like '%من فعل الكون%';

update public.lesson_items
  set ar = replace(ar, 'خاصتي', 'حقتي')
  where ar like '%خاصتي%';

update public.lesson_items
  set ar = replace(ar, 'خاصتك', 'حقتك')
  where ar like '%خاصتك%';

update public.lesson_items
  set ar = replace(ar, 'خاصته', 'حقه')
  where ar like '%خاصته%';

update public.lesson_items
  set ar = replace(ar, 'خاصتها', 'حقها')
  where ar like '%خاصتها%';

update public.lesson_items
  set ar = replace(ar, 'خاصتنا', 'حقنا')
  where ar like '%خاصتنا%';

update public.lesson_items
  set ar = replace(ar, 'خاصتهم', 'حقهم')
  where ar like '%خاصتهم%';

-- Fix lesson_exercises that use formal terms
update public.lesson_exercises
  set prompt_ar = replace(prompt_ar, 'من فعل الكون', 'كلمة ربط')
  where prompt_ar like '%من فعل الكون%';

update public.lesson_exercises
  set prompt_ar = replace(prompt_ar, 'خاصتي', 'حقتي')
  where prompt_ar like '%خاصتي%';

-- Fix lesson notes/grammar fields
update public.lessons
  set grammar_note_ar = replace(grammar_note_ar, 'من فعل الكون', 'كلمة ربط')
  where grammar_note_ar like '%من فعل الكون%';

update public.lessons
  set grammar_note_ar = replace(grammar_note_ar, 'خاصتي', 'حقتي')
  where grammar_note_ar like '%خاصتي%';
