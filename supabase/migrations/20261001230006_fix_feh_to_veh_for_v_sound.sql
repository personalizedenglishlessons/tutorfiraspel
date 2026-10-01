-- Migration: Fix ف (feh) → ڤ (veh) for /v/ sound in lesson_items translit
-- 156 items fixed: have(99), give(17), feedback(19), review(8), advice(3),
-- available(3), expensive(2), arrive(1), believe(1), vowels(1), achieve(1),
-- comparative(1)

UPDATE lesson_items SET translit = REPLACE(translit, 'هاف', 'هاڤ') WHERE translit LIKE '%هاف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'قيف', 'قيڤ') WHERE translit LIKE '%قيف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'ارايف', 'ارايڤ') WHERE translit LIKE '%ارايف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'افيلابل', 'اڤيلابل') WHERE translit LIKE '%افيلابل%';
UPDATE lesson_items SET translit = REPLACE(translit, 'افيلابول', 'اڤيلابول') WHERE translit LIKE '%افيلابول%';
UPDATE lesson_items SET translit = REPLACE(translit, 'بيليف', 'بيليڤ') WHERE translit LIKE '%بيليف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'ادفايس', 'ادڤايس') WHERE translit LIKE '%ادفايس%';
UPDATE lesson_items SET translit = REPLACE(translit, 'ريفيو', 'ريڤيو') WHERE translit LIKE '%ريفيو%';
UPDATE lesson_items SET translit = REPLACE(translit, 'فاولز', 'ڤاولز') WHERE translit LIKE '%فاولز%';
UPDATE lesson_items SET translit = REPLACE(translit, 'اتشيف', 'اتشيڤ') WHERE translit LIKE '%اتشيف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'اكسبنسيف', 'اكسبنسيڤ') WHERE translit LIKE '%اكسبنسيف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'كمباراتيف', 'كمباراتيڤ') WHERE translit LIKE '%كمباراتيف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'فيدباك', 'ڤيدباك') WHERE translit LIKE '%فيدباك%';
