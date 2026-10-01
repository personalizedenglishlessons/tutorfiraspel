-- Replace formal Arabic with Saudi dialect in lesson_items sentences and phrases
-- كيف حالك → كيفك (formal "how are you" → Saudi)
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'كيف حالك', 'كيفك') WHERE ar_meaning LIKE '%كيف حالك%' AND kind IN ('sentence', 'phrase');
UPDATE lesson_items SET example_ar = REPLACE(example_ar, 'كيف حالك', 'كيفك') WHERE example_ar LIKE '%كيف حالك%' AND kind IN ('sentence', 'phrase');

-- هذه → هذي (formal "this (f)" → Saudi)
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'هذه', 'هذي') WHERE ar_meaning LIKE '%هذه%' AND kind IN ('sentence', 'phrase');
UPDATE lesson_items SET example_ar = REPLACE(example_ar, 'هذه', 'هذي') WHERE example_ar LIKE '%هذه%' AND kind IN ('sentence', 'phrase');

-- نحن → احنا (formal "we" → Saudi)
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'نحن ', 'احنا ') WHERE ar_meaning LIKE '%نحن %' AND kind IN ('sentence', 'phrase');
UPDATE lesson_items SET example_ar = REPLACE(example_ar, 'نحن ', 'احنا ') WHERE example_ar LIKE '%نحن %' AND kind IN ('sentence', 'phrase');

-- ذلك → ذاك (formal "that" → Saudi) in sentences only
UPDATE lesson_items SET ar_meaning = REPLACE(ar_meaning, 'ذلك', 'ذاك') WHERE ar_meaning LIKE '%ذلك%' AND kind = 'sentence';
UPDATE lesson_items SET example_ar = REPLACE(example_ar, 'ذلك', 'ذاك') WHERE example_ar LIKE '%ذلك%' AND kind = 'sentence';

-- Verify
SELECT 'كيف حالك remaining' as check_col, COUNT(*) as c FROM lesson_items WHERE (ar_meaning LIKE '%كيف حالك%' OR example_ar LIKE '%كيف حالك%') AND kind IN ('sentence', 'phrase')
UNION ALL
SELECT 'هذه remaining', COUNT(*) FROM lesson_items WHERE (ar_meaning LIKE '%هذه%' OR example_ar LIKE '%هذه%') AND kind IN ('sentence', 'phrase')
UNION ALL
SELECT 'نحن remaining', COUNT(*) FROM lesson_items WHERE (ar_meaning LIKE '%نحن %' OR example_ar LIKE '%نحن %') AND kind IN ('sentence', 'phrase');
