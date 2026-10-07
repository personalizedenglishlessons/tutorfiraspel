-- A/E/I letter-name disambiguation + em-dash cleanup (2026-10-07).
-- 1) A, E and I all had translit "اي" — the student saw the SAME Arabic name
--    for three different letters (A a اي / E e اي / I i اي), confusing and
--    breaking the letter test (identical distractors).
--    Distinct Saudi-style names: A = ايه (ay), E = اي (ee), I = آي (eye).
-- 2) Remove em dashes (—) from all 26 letter teaching texts: "حرف A — الكبير"
--    becomes "حرف A: الكبير" (plain punctuation, easier to read).

UPDATE public.lesson_items SET translit = 'ايه'
WHERE lesson_id = 'a0ss-alphabet' AND en = 'A' AND translit = 'اي';

UPDATE public.lesson_items
SET ar_meaning = 'حرف A: الكبير A والصغير a. اسمه ايه. شكله مثل الخيمه. اكتبه على ورقه.'
WHERE lesson_id = 'a0ss-alphabet' AND en = 'A';

UPDATE public.lesson_items
SET ar_meaning = 'حرف E: الكبير E والصغير e. اسمه اي، بدون ه (مو مثل A ايه). شكله ثلاث خطوط. اكتبه على ورقه.'
WHERE lesson_id = 'a0ss-alphabet' AND en = 'E';

UPDATE public.lesson_items SET translit = 'آي'
WHERE lesson_id = 'a0ss-alphabet' AND en = 'I' AND translit = 'اي';

UPDATE public.lesson_items
SET ar_meaning = 'حرف I: الكبير I والصغير i. اسمه آي، اي مع علامه فوقها (مو مثل E اي). شكله خط مع نقطه. اكتبه على ورقه.'
WHERE lesson_id = 'a0ss-alphabet' AND en = 'I';

-- em-dash cleanup for the remaining 23 letters
UPDATE public.lesson_items
SET ar_meaning = replace(ar_meaning, ' — ', ': ')
WHERE lesson_id = 'a0ss-alphabet' AND kind = 'word' AND ar_meaning LIKE '% — %';
