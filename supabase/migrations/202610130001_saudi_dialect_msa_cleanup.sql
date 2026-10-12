-- Replace MSA wording with Saudi dialect (house style: no hamza, ه for ة) and fix the
-- doubled-alef "اايميل/اايرلي" transliteration. Found by the 2026-10-13 audit.
-- Every UPDATE is guarded (id + LIKE) so it is idempotent and never overwrites newer edits.

-- ===== lesson_items: ar_meaning / example_ar / note_ar =====
-- ينبغي -> المفروض (should)
UPDATE public.lesson_items SET ar_meaning = replace(ar_meaning, 'ينبغي', 'المفروض') WHERE id IN (2057, 2062) AND ar_meaning LIKE '%ينبغي%';
UPDATE public.lesson_items SET example_ar = replace(example_ar, 'ينبغي', 'المفروض') WHERE id IN (2057, 2062) AND example_ar LIKE '%ينبغي%';
-- هل (MSA question particle) -> dropped, as Saudis say it
UPDATE public.lesson_items SET ar_meaning = replace(ar_meaning, 'هل ', '') WHERE id IN (806, 1407, 1477, 1841, 2649) AND ar_meaning LIKE '%هل %';
UPDATE public.lesson_items SET note_ar = 'الخدمه (tip) داخله بالحساب؟' WHERE id = 875 AND note_ar = 'هل الخدمه (tip) موموله؟';
UPDATE public.lesson_items SET ar_meaning = 'اداة سؤال للماضي' WHERE id = 2647 AND ar_meaning = 'هل (للسوال)';
-- polite requests
UPDATE public.lesson_items SET ar_meaning = 'ممكن...؟', example_ar = 'ممكن لاتيه، لو سمحت؟' WHERE id = 2973 AND ar_meaning = 'هل يمكنني...؟';
UPDATE public.lesson_items SET ar_meaning = 'ابشر، بابعثهم لك الحين.' WHERE id = 823 AND ar_meaning = 'بالتاكيد، بابعثهم لك الحين.';
UPDATE public.lesson_items SET ar_meaning = replace(replace(ar_meaning, 'قادم', 'جاي'), 'الان', 'الحين') WHERE id = 1244 AND (ar_meaning LIKE '%قادم%' OR ar_meaning LIKE '%الان%');
UPDATE public.lesson_items SET ar_meaning = 'ايوه / اي' WHERE id = 2590 AND ar_meaning = 'نعم / اي';
UPDATE public.lesson_items SET ar_meaning = 'فيه' WHERE id = 2607 AND ar_meaning = 'في / يوجد';
UPDATE public.lesson_items SET ar_meaning = 'راح' WHERE id = 2660 AND ar_meaning = 'راح / سوف';
-- unless
UPDATE public.lesson_items SET ar_meaning = 'الا اذا', example_ar = 'ما بتنجح الا اذا تذاكر.' WHERE id = 2402 AND ar_meaning = 'ما لم';
-- not only ... but also
UPDATE public.lesson_items SET ar_meaning = 'مو بس... بعد', example_ar = 'مو بس غنت، بعد رقصت.' WHERE id = 2942 AND ar_meaning = 'ليس بس... بل بعد';
-- جدا -> مره (very)
UPDATE public.lesson_items SET note_ar = replace(note_ar, 'جدا', 'مره') WHERE id IN (2533, 2535, 2941, 3903) AND note_ar LIKE '%جدا%';
UPDATE public.lesson_items SET ar_meaning = replace(ar_meaning, 'جدا', 'مره') WHERE id = 3903 AND ar_meaning LIKE '%جدا%';

-- lesson title
UPDATE public.lessons SET title_ar = 'راح' WHERE id = 'a2fut-will' AND title_ar = 'سوف / راح';

-- ===== lesson_exercises: prompts / options =====
UPDATE public.lesson_exercises SET payload = replace(payload::text, 'ينبغي', 'المفروض')::jsonb WHERE id IN (1029, 1030, 1037) AND payload::text LIKE '%ينبغي%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, 'ايها', 'اي وحده')::jsonb WHERE id IN (1553, 1558, 1563, 1568, 1573) AND payload::text LIKE '%ايها%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, 'هل يمكنني', 'ممكن')::jsonb WHERE id = 1559 AND payload::text LIKE '%هل يمكنني%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, 'هل تحب السمك', 'تحب السمك')::jsonb WHERE id = 770 AND payload::text LIKE '%هل تحب السمك%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, '"هل ___؟"', '"انت ___؟"')::jsonb WHERE id = 1344 AND payload::text LIKE '%"هل ___؟"%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, '"هل رحت"', '"رحت"')::jsonb WHERE id = 1345 AND payload::text LIKE '%"هل رحت"%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, '"ايضا"', '"كمان"')::jsonb WHERE id = 1246 AND payload::text LIKE '%"ايضا"%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, 'جدا', 'مره')::jsonb WHERE id IN (1286, 2372) AND payload::text LIKE '%جدا%';

-- translate exercises: Saudi answer first, keep old answers accepted so nobody is marked wrong
UPDATE public.lesson_exercises
SET payload = jsonb_set(payload, '{accept}', '["عندنا خبز", "عندنا خبز؟", "هل عندنا خبز"]'::jsonb)
WHERE id = 781 AND payload->'accept' = '["هل عندنا خبز"]'::jsonb;
UPDATE public.lesson_exercises
SET payload = jsonb_set(jsonb_set(payload, '{answer}', '"مو بس غنت بعد رقصت"'::jsonb), '{accept}',
  '["مو بس غنت بعد رقصت", "مو بس غنت بل رقصت بعد", "ليست بس غنت بل رقصت بعد", "ليس بس غنت بل رقصت بعد"]'::jsonb)
WHERE id = 1518 AND payload->>'answer' = 'ليست بس غنت بل رقصت بعد';

-- ===== doubled-alef transliteration (email / early) =====
UPDATE public.lesson_items SET translit = replace(translit, 'اايميل', 'ايميل') WHERE translit LIKE '%اايميل%';
UPDATE public.lesson_items SET translit = replace(translit, 'اايرلي', 'ايرلي') WHERE translit LIKE '%اايرلي%';
UPDATE public.lesson_items SET example_tr = replace(example_tr, 'اايميل', 'ايميل') WHERE example_tr LIKE '%اايميل%';
UPDATE public.lesson_items SET example_tr = replace(example_tr, 'اايرلي', 'ايرلي') WHERE example_tr LIKE '%اايرلي%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, 'اايميل', 'ايميل')::jsonb WHERE payload::text LIKE '%اايميل%';
UPDATE public.lesson_exercises SET payload = replace(payload::text, 'اايرلي', 'ايرلي')::jsonb WHERE payload::text LIKE '%اايرلي%';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.lesson_items WHERE id IN (2057, 2062) AND (ar_meaning LIKE '%ينبغي%' OR example_ar LIKE '%ينبغي%')) THEN
    RAISE EXCEPTION 'migration 202610130001: ينبغي still present in a2-could-should items';
  END IF;
  IF EXISTS (SELECT 1 FROM public.lesson_exercises WHERE id IN (1553, 1558, 1563, 1568, 1573) AND payload::text LIKE '%ايها%') THEN
    RAISE EXCEPTION 'migration 202610130001: ايها still present in exercises';
  END IF;
  IF EXISTS (SELECT 1 FROM public.lesson_items WHERE translit LIKE '%اايميل%' OR example_tr LIKE '%اايميل%') THEN
    RAISE EXCEPTION 'migration 202610130001: اايميل still present in lesson_items';
  END IF;
  IF EXISTS (SELECT 1 FROM public.lesson_exercises WHERE payload::text LIKE '%اايميل%') THEN
    RAISE EXCEPTION 'migration 202610130001: اايميل still present in lesson_exercises';
  END IF;
END $$;
