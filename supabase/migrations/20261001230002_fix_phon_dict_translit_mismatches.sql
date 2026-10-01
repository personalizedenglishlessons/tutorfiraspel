-- Migration: Fix PHON_DICT-related transliteration issues in DB
-- These are DB-side translit values that should match the corrected PHON_DICT entries

-- Fix 'luggage' translit in words table (لجيج → لاگيج)
UPDATE words SET translit = 'لاگيج' WHERE en = 'Luggage' AND translit = 'لجيج';
UPDATE words SET translit = 'لاگيج' WHERE en = 'luggage' AND translit = 'لجيج';

-- Fix 'luggage' translit in lesson_items (لجيج → لاگيج)
UPDATE lesson_items SET translit = 'لاگيج' WHERE en = 'luggage' AND translit = 'لجيج';

-- Fix 'water' translit in lesson_items (وتر → واتر)
UPDATE lesson_items SET translit = 'واتر' WHERE en = 'water' AND translit = 'وتر';

-- Fix 'nine' translit in lesson_items (نوين → ناين)
UPDATE lesson_items SET translit = 'ناين' WHERE en = 'nine' AND translit = 'نوين';

-- Fix 'hospital' translit in lesson_items (هاسبتل → هوسبيتال)
UPDATE lesson_items SET translit = 'هوسبيتال' WHERE en = 'hospital' AND translit = 'هاسبتل';

-- Fix 'opinion' translit in lesson_items (ابينيان → اپينيان)
UPDATE lesson_items SET translit = 'اپينيان' WHERE en = 'opinion' AND translit = 'ابينيان';
