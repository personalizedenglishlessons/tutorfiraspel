-- Migration: Fix remaining ف→ڤ for /v/ sound in lesson_items (58 items)
-- Covers: of, live, evening, ever, five, seven, eleven, twelve, fever,
-- however, travel, visit, drive, every, negative

UPDATE lesson_items SET translit = REPLACE(translit, ' اوف ', ' اوڤ ') WHERE translit LIKE '% اوف %';
UPDATE lesson_items SET translit = REPLACE(translit, ' اوف.', ' اوڤ.') WHERE translit LIKE '% اوف.%';
UPDATE lesson_items SET translit = REPLACE(translit, ' اوف؟', ' اوڤ؟') WHERE translit LIKE '% اوف؟%';
UPDATE lesson_items SET translit = REPLACE(translit, 'ليف هير', 'ليڤ هير') WHERE translit LIKE '%ليف هير%';
UPDATE lesson_items SET translit = REPLACE(translit, 'ايفنينج', 'ايڤنينج') WHERE translit LIKE '%ايفنينج%';
UPDATE lesson_items SET translit = REPLACE(translit, 'افر', 'اڤر') WHERE translit LIKE '%افر%';
UPDATE lesson_items SET translit = REPLACE(translit, 'فايف', 'فايڤ') WHERE translit LIKE '%فايف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'سيون', 'سيڤن') WHERE translit LIKE '%سيون%';
UPDATE lesson_items SET translit = REPLACE(translit, 'سفن', 'سيڤن') WHERE translit LIKE '%سفن%';
UPDATE lesson_items SET translit = REPLACE(translit, 'اليفن', 'اليڤن') WHERE translit LIKE '%اليفن%';
UPDATE lesson_items SET translit = REPLACE(translit, 'تويلف', 'تويلڤ') WHERE translit LIKE '%تويلف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'فيفر', 'فيڤر') WHERE translit LIKE '%فيفر%';
UPDATE lesson_items SET translit = REPLACE(translit, 'هاو افر', 'هاو اڤر') WHERE translit LIKE '%هاو افر%';
UPDATE lesson_items SET translit = REPLACE(translit, 'هاوففر', 'هاو اڤر') WHERE translit LIKE '%هاوففر%';
UPDATE lesson_items SET translit = REPLACE(translit, 'ترافل', 'تراڤال') WHERE translit LIKE '%ترافل%';
UPDATE lesson_items SET translit = REPLACE(translit, 'فيزيت', 'ڤيزيت') WHERE translit LIKE '%فيزيت%';
UPDATE lesson_items SET translit = REPLACE(translit, 'درايف', 'درايڤ') WHERE translit LIKE '%درايف%';
UPDATE lesson_items SET translit = REPLACE(translit, 'افري', 'ايڤري') WHERE translit LIKE '%افري%';
UPDATE lesson_items SET translit = REPLACE(translit, 'نيقاتف', 'نيقاتيڤ') WHERE translit LIKE '%نيقاتف%';
