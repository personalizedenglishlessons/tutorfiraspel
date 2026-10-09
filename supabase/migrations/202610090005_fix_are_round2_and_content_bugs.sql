-- Round 2 of the 'are' translit sweep (exercise payloads) + three content bugs
-- caught by advisor review: 'are' in list-valued answers, hint.ar prompts, source_tr,
-- and embedded prompt strings were missed by the first pass. اير kept where it means air.

UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "Weekend plans", "ok": true, "tr": "ويكيند بلانز"}, {"t": "Weekend job", "ok": false, "tr": "ويكيند جوب"}, {"t": "Weekend weather", "ok": false, "tr": "ويكيند ويذر"}], "question": {"ar": "وش معنى \"What are you doing this weekend?\"", "en": "The question asks about your...", "tr": "وش معنى \"وات ار يو دوينج ذيس ويكيند؟\"، ذا كويستشن اسكس اباوت يور..."}}'::jsonb WHERE id = 340;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "accept": ["وش الاعراض اللي عندك اليوم؟"], "answer": "وش الاعراض اللي عندك اليوم؟", "source": "What are your symptoms today?", "source_tr": "وات ار يور سمبتمز تودي؟"}'::jsonb WHERE id = 434;
UPDATE public.lesson_exercises SET payload = '{"answer": "Stay calm. Where are you exactly", "prompt": "{\"ar\": \"خلك هادي. وين انت بالضبط؟\", \"en\": \"Build this in English:\", \"tr\": \"ستي كام. وير ار يو اجزكتلي؟\"}", "tokens": ["Stay", "calm.", "Where", "are", "you", "exactly"]}'::jsonb WHERE id = 473;
UPDATE public.lesson_exercises SET payload = '{"answer": "Do not give up, you are doing great", "prompt": "{\"ar\": \"لا تستسلم، انت ممتاز.\", \"en\": \"Build this in English:\", \"tr\": \"دو نات قيف اب، يو ار دوينق قريت.\"}", "tokens": ["Do", "not", "give", "up,", "you", "are", "doing", "great"]}'::jsonb WHERE id = 577;
UPDATE public.lesson_exercises SET payload = '{"ar": "انت جاهز؟", "hint": {"ar": "بالسوال نقلب: ار قبل يو.", "en": "Questions flip: Are + you."}, "type": "order", "answer": ["Are", "you", "ready"], "prompt": {"ar": "رتب السوال: انت جاهز؟", "en": "Build the question: Are you ready?", "tr": "ار يو ريدي؟"}, "tokens": ["Are", "you", "ready"]}'::jsonb WHERE id = 598;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "accept": ["وش اخبارك؟"], "answer": "وش اخبارك؟", "source": "How are things with you?", "source_tr": "هاو ار ثينقز وذ يو؟"}'::jsonb WHERE id = 946;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "accept": ["احنا بالمطار", "احنا بالمطار."], "answer": "احنا بالمطار.", "source": "We are at the airport.", "source_tr": "وي ار ات ذا ايربورت."}'::jsonb WHERE id = 1081;
UPDATE public.lesson_exercises SET payload = '{"options": [{"t": "ام از ار + تصريف ثالث", "ok": true, "tr": "ام از ار + تصريف ثالث"}, {"t": "هاڤ + تصريف ثالث", "ok": false, "tr": "هاڤ + تصريف ثالث"}, {"t": "ويل + فعل", "ok": false, "tr": "ويل + فعل"}], "question": {"ar": "وش تركيب المبني للمجهول مضارع؟", "en": "What is the structure of present passive?", "tr": "وات از ذا ستراكتشر اوف بريزانت باسيڤ؟"}}'::jsonb WHERE id = 1104;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "type": "translate", "accept": ["ذير ار فايف ستودنتس", "في خمسة طلاب"], "answer": "في خمسه طلاب", "source": "There are five students."}'::jsonb WHERE id = 1325;
UPDATE public.lesson_exercises SET payload = '{"ar": "كيفك", "hint": {"ar": "هاو بعدين ار بعدين يو.", "en": "How + are + you."}, "type": "order", "answer": ["How", "are", "you"], "prompt": {"ar": "رتب: كيفك؟", "en": "Build: How are you?", "tr": "بيلد ات: هاو ار يو"}, "tokens": ["How", "are", "you"]}'::jsonb WHERE id = 1393;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "type": "translate", "accept": ["هاو ار يو", "كيفك"], "answer": "كيفك", "source": "How are you?"}'::jsonb WHERE id = 1394;
UPDATE public.lesson_exercises SET payload = '{"ar": "ليش تاخرت", "hint": {"ar": "واي بعدين ار بعدين يو بعدين الصفة.", "en": "Why + are + you + adjective."}, "type": "order", "answer": ["Why", "are", "you", "late"], "prompt": {"ar": "رتب: ليش تاخرت؟", "en": "Build: Why are you late?", "tr": "بيلد ات: واي ار يو ليت"}, "tokens": ["Why", "are", "you", "late"]}'::jsonb WHERE id = 1396;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "type": "translate", "accept": ["واي ار يو ليت", "ليش تاخرت"], "answer": "ليش تاخرت", "source": "Why are you late?"}'::jsonb WHERE id = 1397;
UPDATE public.lesson_exercises SET payload = '{"dir": "en-ar", "type": "translate", "accept": ["ذاي ار ماي فرندز", "هم ربعي"], "answer": "هم ربعي", "source": "They are my friends."}'::jsonb WHERE id = 1454;
UPDATE public.lesson_exercises SET payload = '{"ar": "هم ربعي", "hint": {"ar": "ذاي بعدين ار بعدين ماي بعدين فرندز.", "en": "They + are + my + friends."}, "type": "order", "answer": ["They", "are", "my", "friends"], "prompt": {"ar": "رتب: هم ربعي.", "en": "Build: They are my friends.", "tr": "بيلد: ذاي ار ماي فرندز"}, "tokens": ["They", "are", "my", "friends"]}'::jsonb WHERE id = 2259;
UPDATE public.lesson_exercises SET payload = '{"ar": "ذولك جزمته", "hint": {"ar": "ذوز بعدين ار بعدين هيز بعدين شوز.", "en": "Those + are + his + shoes."}, "type": "order", "answer": ["Those", "are", "his", "shoes"], "prompt": {"ar": "رتب: ذولك جزمته.", "en": "Build: Those are his shoes.", "tr": "بيلد: ذوز ار هيز شوز"}, "tokens": ["Those", "are", "his", "shoes"]}'::jsonb WHERE id = 2268;
UPDATE public.lesson_exercises SET payload = '{"ar": "العيال برا", "hint": {"ar": "ذا بعدين كيدز بعدين ار بعدين اوتسايد.", "en": "The + kids + are + outside."}, "type": "order", "answer": ["The", "kids", "are", "outside"], "prompt": {"ar": "رتب: العيال برا.", "en": "Build: The kids are outside.", "tr": "بيلد: ذا كيدز ار اوتسايد"}, "tokens": ["The", "kids", "are", "outside"]}'::jsonb WHERE id = 2308;
-- ex 509: 'Dear Ms. Sara' translit had مسترز (misters) — Ms. = مز
UPDATE public.lesson_exercises SET payload = replace(payload::text, 'دير مسترز سارا', 'دير مز سارا')::jsonb WHERE id = 509 AND payload::text LIKE '%مسترز%';
-- item 1084: المواكل (meals) typo for المشاكل (problems)
UPDATE public.lesson_items SET ar_meaning = 'حل المشاكل واسعاد العملاء.' WHERE id = 1084 AND ar_meaning = 'حل المواكل واسعاد العملاء.';
-- item 4071: vowel letter names — I = آي per the app's own alphabet lesson
UPDATE public.lesson_items SET translit = replace(translit, 'اي اي اي او يو', 'اي اي آي او يو') WHERE id = 4071 AND translit LIKE '%اي اي اي او يو%';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.lesson_exercises WHERE id IN (SELECT unnest(ARRAY[340,434,473,577,598,946,1081,1104,1325,1393,1394,1396,1397,1454,2259,2268,2308])) AND payload::text ~ '(^|[ ,.؟!:/"])اير([ ,.؟!:/"]|$)') THEN
    RAISE EXCEPTION 'migration 202610090005: standalone اير remains in target payloads';
  END IF;
  IF EXISTS (SELECT 1 FROM public.lesson_exercises WHERE payload::text LIKE '%مسترز%') THEN
    RAISE EXCEPTION 'migration 202610090005: مسترز remains';
  END IF;
  IF EXISTS (SELECT 1 FROM public.lesson_items WHERE id IN (1084, 4071) AND (ar_meaning LIKE '%المواكل%' OR translit LIKE '%اي اي اي او%')) THEN
    RAISE EXCEPTION 'migration 202610090005: item 1084/4071 fix did not apply';
  END IF;
END $$;