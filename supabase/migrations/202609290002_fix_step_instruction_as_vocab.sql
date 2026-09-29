-- Fix: Replace instruction text with STEP vocabulary word in lesson step-pack2-03
-- Item id 2961 had "Choose the word closest in meaning to" (instruction) instead of a real word
-- Replaced with "equivalent" (مكافئ) - a STEP-relevant vocabulary word

-- Update lesson item
UPDATE lesson_items
SET en = 'equivalent',
    ar_meaning = 'مكافئ',
    translit = 'اكويفيلنت',
    kind = 'word',
    example_en = '$1,000 is equivalent to 3,750 riyals.',
    example_ar = 'الف دولار مكافئ لـ ٣٧٥٠ ريال.',
    note_en = 'Equal in value or meaning. Common in STEP synonym questions.',
    note_ar = 'مساوي في القيمه او المعنى. شائع في اسئله المرادفات في ستيب.'
WHERE id = 2961;

-- Update exercise that referenced the old instruction text
UPDATE lesson_exercises
SET payload = jsonb_build_object(
  'type', 'translate',
  'dir', 'en-ar',
  'source', '$1,000 is equivalent to 3,750 riyals.',
  'answer', 'الف دولار مكافئ لـ ٣٧٥٠ ريال',
  'accept', jsonb_build_array(
    'الف دولار مكافئ لـ ٣٧٥٠ ريال',
    'الف دولار مكافئ لـ 3750 ريال'
  )
)
WHERE id = 1526;
