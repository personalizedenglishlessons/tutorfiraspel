-- Migration: Sync lesson_items translit with PHON_DICT standard
-- Fixes diacritics, spaces, missing vowels, and wrong consonants

-- Remove remaining diacritics from translit (catch any missed)
UPDATE lesson_items SET translit = REGEXP_REPLACE(translit, '[\u064B-\u065F\u0670]', '', 'g')
WHERE translit ~ '[\u064B-\u065F\u0670]';

-- Fix spaces in translit (should be continuous)
UPDATE lesson_items SET translit = 'بينكيلر' WHERE en = 'Painkiller' AND translit = 'بين كيلر';
UPDATE lesson_items SET translit = 'لايوڤر' WHERE en = 'Layover' AND translit = 'لاي اوڤر';
UPDATE lesson_items SET translit = 'ديدلاين' WHERE en = 'Deadline' AND translit = 'دد لاين';

-- Fix missing vowels (sync with PHON_DICT)
UPDATE lesson_items SET translit = 'ريزرڤيشن' WHERE en = 'Reservation' AND translit LIKE 'ريزرڤي%';
UPDATE lesson_items SET translit = 'كونفادانت' WHERE en = 'Confident' AND translit = 'كانفدنت';
UPDATE lesson_items SET translit = 'كيرانسي' WHERE en = 'Currency' AND translit = 'كيرنسي';
UPDATE lesson_items SET translit = 'انشورانس' WHERE en = 'Insurance' AND translit = 'انشورنس';
UPDATE lesson_items SET translit = 'اجيندا' WHERE en = 'Agenda' AND translit = 'اجندا';
UPDATE lesson_items SET translit = 'سيمبتام' WHERE en = 'Symptom' AND translit = 'سمبتم';
UPDATE lesson_items SET translit = 'براسكريبشان' WHERE en = 'Prescription' AND translit = 'بريسكربشن';
UPDATE lesson_items SET translit = 'كوليق' WHERE en = 'Colleague' AND translit = 'كولييج';
UPDATE lesson_items SET translit = 'ايتينيريري' WHERE en = 'Itinerary' AND translit = 'ايتنراري';
UPDATE lesson_items SET translit = 'بانجكتشوال' WHERE en = 'Punctual' AND translit = 'بنكتشول';
UPDATE lesson_items SET translit = 'كومبلامينتيري' WHERE en = 'Complimentary' AND translit = 'كامبلمنتري';
UPDATE lesson_items SET translit = 'ورانتي' WHERE en = 'Warranty' AND translit = 'وارنتي';
UPDATE lesson_items SET translit = 'انتيرڤيور' WHERE en = 'Interviewer' AND translit LIKE 'انترڤيو%';
UPDATE lesson_items SET translit = 'ريفيرانس' WHERE en = 'Reference' AND translit LIKE 'ريف%رنس';
UPDATE lesson_items SET translit = 'وڤيرتايم' WHERE en = 'Overtime' AND translit = 'اوڤرتيم';
