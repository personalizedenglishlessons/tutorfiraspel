-- Fix word corruptions found in the 2026-10-09 bug hunt
-- 1) lesson_items id=2357 (step-error-recognition): translit had Latin "iment"
--    mixed into Arabic script ("اقرiment") — corrupted "agreement" transliteration.
-- 2) lesson_items id=2907 (b2-pack2-02): ar_meaning "كان كان" is a corrupted
--    duplication — "would have" in Saudi Arabic is "كان راح".

UPDATE public.lesson_items
SET translit = 'سبجكت فيرب اقريمنت'
WHERE id = 2357
  AND translit = 'سبجكت فيرب اقرiment';

UPDATE public.lesson_items
SET ar_meaning = 'كان راح'
WHERE id = 2907
  AND ar_meaning = 'كان كان';

-- Verify: both guards are transactional; if either matched 0 rows the
-- migration fails loudly instead of silently passing.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.lesson_items WHERE id = 2357 AND translit = 'سبجكت فيرب اقريمنت') THEN
    RAISE EXCEPTION 'migration 202610090001: item 2357 fix did not apply';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lesson_items WHERE id = 2907 AND ar_meaning = 'كان راح') THEN
    RAISE EXCEPTION 'migration 202610090001: item 2907 fix did not apply';
  END IF;
END $$;
