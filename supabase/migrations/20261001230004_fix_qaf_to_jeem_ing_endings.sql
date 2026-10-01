-- Migration: Fix ق (qaf) → ج (jeem) for /ŋ/ sound in -ing endings
-- The /ŋ/ sound (as in "morning", "meeting", "going") should use ج not ق
-- Also fix: bring (برينق→برينج), have (هاف→هاڤ)

UPDATE lesson_items SET translit = 'برينج' WHERE en ILIKE 'bring' AND translit = 'برينق';
UPDATE lesson_items SET translit = 'هاڤ' WHERE en ILIKE 'have' AND translit = 'هاف';
UPDATE lesson_items SET translit = REPLACE(translit, 'ينق', 'ينج') WHERE translit ~ 'ينق$' AND en ILIKE '%ing';
