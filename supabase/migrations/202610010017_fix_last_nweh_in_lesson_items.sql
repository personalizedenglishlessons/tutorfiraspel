-- Fix last remaining 'نحن' in lesson_items note_ar
UPDATE lesson_items SET note_ar = REPLACE(note_ar, 'نحن', 'احنا') WHERE note_ar LIKE '%نحن%';

-- Verify
SELECT 'نحن in lesson_items' as check_col, COUNT(*) as c FROM lesson_items WHERE ar_meaning LIKE '%نحن%' OR example_ar LIKE '%نحن%' OR note_ar LIKE '%نحن%';
