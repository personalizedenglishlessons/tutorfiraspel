-- Migration: Fix ق (qaf) → ج (jeem) for /ŋ/ sound in -ing endings (DB)
-- Global sweep of all lesson_items translit with ينق → ينج
-- 71 items fixed including: anything, bring, meeting, morning, evening,
-- going, doing, defining, according, happening, etc.

UPDATE lesson_items SET translit = REPLACE(translit, 'ينق', 'ينج') WHERE translit ~ 'ينق';
