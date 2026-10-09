-- Fix mistransliterations found in the 2026-10-09 bug hunt.
-- Each entry: (item id, WRONG old value, correct Saudi-style translit).
-- Wrong variants either read as a different Arabic word (جيب=jeep/pocket,
-- كم=how much, برد=cold, رد=reply, دوز=does, ذي=thee, ور=or, هز=Hz)
-- or contradict the app's own dominant convention (ق for English g;
-- آ for 'are'; هات for 'hot' matching the a0ss vowel lessons).

UPDATE public.lesson_items li
SET translit = v.new_tr
FROM (VALUES
(1796, 'صني', 'ساني'),
(1907, 'جيب', 'تشيب'),
(2181, 'ور', 'وير'),
(2019, 'ور', 'وير'),
(2194, 'ور', 'وير'),
(1340, 'ذي', 'ذاي'),
(4120, 'ذي', 'ذاي'),
(2603, 'هر', 'هير'),
(2595, 'هز', 'هاز'),
(2602, 'هز', 'هيز'),
(1824, 'ذيس', 'ذيز'),
(1479, 'دوز', 'ذوز'),
(1534, 'كم', 'كام'),
(1592, 'برد', 'بريد'),
(4086, 'دوق', 'دوغ'),
(1774, 'لفت', 'ليفت'),
(2634, 'بلييد', 'بليد'),
(2020, 'ونت', 'وينت'),
(2707, 'كون فورم', 'كونفيرم'),
(2144, 'فينش', 'فينيش'),
(1851, 'هوسبيتول', 'هوسبيتل'),
(2110, 'مديسن', 'ميديسن'),
(2158, 'ييسترداي', 'يسترداي'),
(2301, 'تينس', 'تنس'),
(2172, 'اف', 'ايف'),
(2888, 'جوب', 'جاب'),
(1710, 'رد', 'ريد'),
(2759, 'كود', 'كد'),
(2056, 'كود', 'كد'),
(2344, 'كود', 'كد'),
(1646, 'هوت', 'هات'),
(1794, 'هوت', 'هات'),
(2104, 'هوت', 'هات'),
(1899, 'غيت', 'قيت'),
(1704, 'غود باي', 'قود باي'),
(1804, 'هاو اير يو؟', 'هاو آر يو؟'),
(1502, 'هاو اير يو؟', 'هاو آر يو؟'),
(1628, 'هاو اير يو توداي؟', 'هاو آر يو توداي؟'),
(2586, 'هاو اير يو توداي', 'هاو آر يو توداي'),
(2723, 'هاو اير يو', 'هاو آر يو'),
(1705, 'هاو اير يو', 'هاو آر يو')
) AS v(id, old_tr, new_tr)
WHERE li.id = v.id AND li.translit = v.old_tr;

-- Sentence-level + exercise payloads: 'هاو اير يو' -> 'هاو آر يو' (are = آر)
UPDATE public.lesson_items
SET translit = replace(translit, 'هاو اير يو', 'هاو آر يو')
WHERE translit LIKE '%هاو اير يو%';

UPDATE public.lesson_exercises
SET payload = replace(payload::text, 'هاو اير يو', 'هاو آر يو')::jsonb
WHERE payload::text LIKE '%هاو اير يو%';

DO $$
DECLARE bad int;
BEGIN
  SELECT count(*) INTO bad FROM public.lesson_items
  WHERE translit IN ('جيب','كم','برد','رد','دوز','ذي','ور','هز','كود','هوت','غيت','غود باي')
     OR translit LIKE '%هاو اير يو%';
  IF bad > 0 THEN
    RAISE EXCEPTION 'migration 202610090002: % mistransliterations remain', bad;
  END IF;
END $$;
