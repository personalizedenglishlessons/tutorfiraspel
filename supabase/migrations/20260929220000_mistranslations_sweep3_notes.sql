-- =====================================================================
-- 2026-09-29 (evening) — Mistranslation sweep 3: missing note_ar,
-- transliteration-as-meaning fixes
--
-- Full semantic pass over lesson_items / lesson_exercises / hardcoded
-- engine content found:
--   1. 68 grammar notes with note_ar NULL (students saw English notes
--      in the Arabic UI). All translated in the app's Saudi-casual style.
--   2. id 1430 'at' — ar_meaning was the transliteration (ات) instead
--      of the meaning. Now في / عند.
--   3. id 2031 'used to + verb' — ar_meaning was translit garbage
--      (يوزد تو بلس فيرل). Now كان معتاد + فعل.
--   4. id 2134 (a2-travel) — example_ar was the transliteration of the
--      English example. Now a real Saudi-dialect translation.
--
-- Everything else verified clean: 2,559 lesson_items (no self-translit
-- meanings, no en/ar conflicts, all example_ar/note_ar Arabic where
-- present), 1,428 lesson_exercises (prompt ar != tr everywhere, all
-- translate answers real Arabic), hardcoded PEL_BEGINNER vocab (674
-- entries) and app.html lesson content (306 entries).
--
-- Legit loanwords intentionally left as-is (email ايميل, wifi واي فاي,
-- riyal ريال, latte لاتيه, December ديسمبر, alphabet letter names).
-- =====================================================================

BEGIN;

-- Transliteration-as-meaning fixes
UPDATE lesson_items SET ar_meaning = 'في / عند' WHERE id = 1430;              -- at
UPDATE lesson_items SET ar_meaning = 'كان معتاد + فعل' WHERE id = 2031;       -- used to + verb
UPDATE lesson_items SET example_ar = 'بالمطار. اظهر الجواز. وين الامتعه. اوصل بالوقت.' WHERE id = 2134;

-- Missing note_ar (grammar tip titles) — Saudi-casual style
UPDATE lesson_items SET note_ar = 'الحروف المتحركه والساكنه (vowel / consonant)' WHERE id = 606;
UPDATE lesson_items SET note_ar = 'التاريخ: شهر ثم يوم او العكس' WHERE id = 636;
UPDATE lesson_items SET note_ar = 'كلمات الملكيه: my, your, his, her' WHERE id = 646;
UPDATE lesson_items SET note_ar = 'ترتيب سؤال الـ WH' WHERE id = 656;
UPDATE lesson_items SET note_ar = 'it is + صفه' WHERE id = 666;
UPDATE lesson_items SET note_ar = 'has / have مع العايله' WHERE id = 676;
UPDATE lesson_items SET note_ar = 'going to للتخطيط' WHERE id = 686;
UPDATE lesson_items SET note_ar = 'المضارع البسيط للعادات' WHERE id = 696;
UPDATE lesson_items SET note_ar = 'كيف تدعو احد' WHERE id = 706;
UPDATE lesson_items SET note_ar = 'المضارع التام للاخبار الجديده' WHERE id = 716;
UPDATE lesson_items SET note_ar = 'الاتفاق والرفض: so do I / neither do I' WHERE id = 726;
UPDATE lesson_items SET note_ar = 'الطلب المهذب: could you / would you mind' WHERE id = 736;
UPDATE lesson_items SET note_ar = 'عبارات التوضيح المهذبه' WHERE id = 746;
UPDATE lesson_items SET note_ar = 'الماضي البسيط للقصص' WHERE id = 756;
UPDATE lesson_items SET note_ar = 'الفرق بين how much و how many' WHERE id = 776;
UPDATE lesson_items SET note_ar = 'طلبات مهذبه' WHERE id = 786;
UPDATE lesson_items SET note_ar = 'الاوامر مع please' WHERE id = 796;
UPDATE lesson_items SET note_ar = 'السؤال عن المشاكل والتأخير' WHERE id = 806;
UPDATE lesson_items SET note_ar = 'المضارع التام للحجوزات' WHERE id = 816;
UPDATE lesson_items SET note_ar = 'could I / can you للطلب' WHERE id = 826;
UPDATE lesson_items SET note_ar = 'المضارع التام لوصف المشاكل' WHERE id = 836;
UPDATE lesson_items SET note_ar = 'صيغه المستقبل للحجوزات' WHERE id = 846;
UPDATE lesson_items SET note_ar = 'i would like / i will have للطلب' WHERE id = 856;
UPDATE lesson_items SET note_ar = 'التعبير عن الحساسيه: i am allergic to' WHERE id = 866;
UPDATE lesson_items SET note_ar = 'هل الخدمه (tip) مشموله؟' WHERE id = 875;
UPDATE lesson_items SET note_ar = 'صفات الحجم' WHERE id = 885;
UPDATE lesson_items SET note_ar = 'اضافه شروط على طلبك' WHERE id = 895;
UPDATE lesson_items SET note_ar = 'المضارع التام المستمر' WHERE id = 915;
UPDATE lesson_items SET note_ar = 'do you have anything for... للطلب' WHERE id = 925;
UPDATE lesson_items SET note_ar = 'طلبات عاجله وضروريه' WHERE id = 935;
UPDATE lesson_items SET note_ar = 'can I try it on? للقياس' WHERE id = 945;
UPDATE lesson_items SET note_ar = 'بكم ذا؟ (how much is this?)' WHERE id = 955;
UPDATE lesson_items SET note_ar = 'شرح المشكله' WHERE id = 965;
UPDATE lesson_items SET note_ar = 'اسئله مكتب تأجير السيارات' WHERE id = 975;
UPDATE lesson_items SET note_ar = 'الارقام والاسعار' WHERE id = 985;
UPDATE lesson_items SET note_ar = 'اعطاء الاتجاهات' WHERE id = 995;
UPDATE lesson_items SET note_ar = 'جمل الطواري' WHERE id = 1005;
UPDATE lesson_items SET note_ar = 'i need... / it hurts للتعبير' WHERE id = 1015;
UPDATE lesson_items SET note_ar = 'المقاطعه المهذبه' WHERE id = 1025;
UPDATE lesson_items SET note_ar = 'افتتاحيات وختوم الايميلات الرسميه' WHERE id = 1035;
UPDATE lesson_items SET note_ar = 'عبارات المكالمات' WHERE id = 1045;
UPDATE lesson_items SET note_ar = 'المضارع البسيط للحقائق الجديده' WHERE id = 1055;
UPDATE lesson_items SET note_ar = 'could you / would you للطلب' WHERE id = 1065;
UPDATE lesson_items SET note_ar = 'تخفيف النقد' WHERE id = 1075;
UPDATE lesson_items SET note_ar = 'المضارع التام للخبرات' WHERE id = 1085;
UPDATE lesson_items SET note_ar = 'اعطاء امثله' WHERE id = 1095;
UPDATE lesson_items SET note_ar = 'الشكر مع طلب' WHERE id = 1104;
UPDATE lesson_items SET note_ar = 'قاعده الـ s مع he / she / it' WHERE id = 1114;
UPDATE lesson_items SET note_ar = 'did + الفعل الاساسي' WHERE id = 1124;
UPDATE lesson_items SET note_ar = 'اختيار صيغه المستقبل' WHERE id = 1134;
UPDATE lesson_items SET note_ar = 'عائلات الكلمات' WHERE id = 1144;
UPDATE lesson_items SET note_ar = 'التلازمات القويه (كلمات دايم تجتمع)' WHERE id = 1154;
UPDATE lesson_items SET note_ar = 'الاختصارات (contractions)' WHERE id = 1164;
UPDATE lesson_items SET note_ar = 'النبر يغير المعنى' WHERE id = 1174;
UPDATE lesson_items SET note_ar = 'وصل الكلمات ببعض' WHERE id = 1184;
UPDATE lesson_items SET note_ar = 'الارقام والبوابات' WHERE id = 1194;
UPDATE lesson_items SET note_ar = 'التوضيح بالتلفون' WHERE id = 1204;
UPDATE lesson_items SET note_ar = 'القراءه السريعه عشان تلقى المطلوب' WHERE id = 1214;
UPDATE lesson_items SET note_ar = 'انجليزي اللافتات القصيره' WHERE id = 1224;
UPDATE lesson_items SET note_ar = 'could you please للطلب المهذب' WHERE id = 1234;
UPDATE lesson_items SET note_ar = 'انجليزي الرسايل القصيره' WHERE id = 1244;
UPDATE lesson_items SET note_ar = 'السلانج داخل السياق' WHERE id = 1254;
UPDATE lesson_items SET note_ar = 'التعبيرات ثابته ما تتغير' WHERE id = 1264;
UPDATE lesson_items SET note_ar = 'الافعال المركبه القابله للفصل' WHERE id = 1274;
UPDATE lesson_items SET note_ar = 'الترشيح والاقتراح' WHERE id = 1284;
UPDATE lesson_items SET note_ar = 'الحب والكراهيه مع فعل + ing' WHERE id = 1294;
UPDATE lesson_items SET note_ar = 'مراجعه اللي تعرفه' WHERE id = 1304;
UPDATE lesson_items SET note_ar = 'خطوات صغيره كل يوم' WHERE id = 1314;

COMMIT;

-- Verification:
-- SELECT count(*) FROM lesson_items WHERE note_en IS NOT NULL AND note_en <> ''
--  AND (note_ar IS NULL OR note_ar = '');   -- expected 0
