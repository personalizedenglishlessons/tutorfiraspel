-- Saudi-dialect/pronunciation sweep (2026-10-11): lesson_items 3998 was using
-- the Persian letter پ (pee) as a visual reference for the English /p/ sound,
-- and its Arabic example used القلم (pen) instead of the English word "pen".
-- Saudi users expect Saudi Arabic only, and pronunciation teaching should
-- reference the actual English example word for sound anchoring.
--
-- English (unchanged): p says puh. Like in pen.
-- Arabic before:      صوت p: پـ / صوت p هو پـ. مثل القلم.
-- Arabic after:       صوت p: بـ / صوت p هو بـ. مثل pen.

UPDATE public.lesson_items
SET ar_meaning = 'صوت p: بـ',
    example_ar = 'صوت p هو بـ. مثل pen.'
WHERE id = 3998
  AND ar_meaning = 'صوت p: پـ';
