-- Fix 'could' mistransliteration in words.example_tr (same bug family as migration 202610090002)
UPDATE public.words SET example_tr = replace(example_tr, 'كود يو', 'كد يو') WHERE example_tr LIKE '%كود يو%';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.words WHERE example_tr LIKE '%كود يو%') THEN
    RAISE EXCEPTION 'migration 202610090004: كود يو still present in words.example_tr';
  END IF;
END $$;