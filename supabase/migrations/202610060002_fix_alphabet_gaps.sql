-- Fix alphabet lesson gaps: add missing C sentence + fix X sentence

-- Add the missing "C is for cat" sentence item (idx 52)
INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) VALUES
('a0ss-alphabet', 52, 'sentence', 'C is for cat.', 'سي لحرف القطه', 'سي از فور كات');

-- Fix X: "box" doesn't start with X. Use "x-ray" instead (more natural for ESL).
UPDATE lesson_items SET
  en = 'X is for x-ray.',
  ar_meaning = 'اكس لحرف الاشعه',
  translit = 'اكس از فور اكس ري'
WHERE lesson_id = 'a0ss-alphabet' AND idx = 26;

UPDATE lesson_items SET
  en = 'X is for x-ray.',
  ar_meaning = 'اكس لحرف الاشعه',
  translit = 'اكس از فور اكس ري',
  example_en = 'X is for x-ray.',
  example_ar = 'الاشعه تبدا بحرف X',
  example_tr = 'اكس از فور اكس ري'
WHERE lesson_id = 'a0ss-alphabet' AND idx = 49;

-- Fix the X exercise to use x-ray instead of box
UPDATE lesson_exercises SET
  payload = '{"type":"choose","question":{"ar":"___ لحرف الاشعه.","en":"___ is for x-ray.","tr":"___ از فور اكس ري"},"options":[{"t":"X","ok":true,"tr":"اكس"},{"t":"K","ok":false,"tr":"كاي"},{"t":"Z","ok":false,"tr":"زي"}],"hint":{"ar":"الاشعه تبدا بحرف X.","en":"X-ray starts with X."}}'
WHERE lesson_id = 'a0ss-alphabet' AND payload::text LIKE '%box%';
