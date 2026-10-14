-- Refresh index landing copy stored in site_settings.
-- pel-settings.js reads these keys and OVERRIDES the built-in copy in
-- index.html, so the generic "free level test / instant correction"
-- framing was what visitors actually saw. This migration puts the
-- owner's Saudi-dialect voice in the DB and keeps the static fallbacks
-- identical (see index.html applyIndexLang + const faqs).
--
-- Also corrects a factual error in the previous FAQ: the old answer
-- claimed EVERY plan includes at least 1 live class a week, which
-- contradicts the plan matrix (1-month Start From Zero has none).

insert into public.site_settings (key, value) values
  ('hero_headline_ar', to_jsonb('تعرف انجليزي اكثر مما تتكلم.'::text)),
  ('hero_headline_en', to_jsonb('You know more English than you speak.'::text)),
  ('hero_sub_ar', to_jsonb('درست انجليزي سنين، ويوم وقف قدامك احد رجعت للعربي. المكالمه ترن وتتجاهلها، والايميل ياخذ منك نص ساعه، والاجتماع يمر وانت ساكت. المشكله مو انك ما تعرف، المشكله انك ما نطقتها ولا مره. هنا كل درس موقف حقيقي: تسمعه، تقوله بصوتك، ويتصحح لك على طول، لين يجيك الرد بروحه.'::text)),
  ('hero_sub_en', to_jsonb('You studied English for years, then the moment someone stood in front of you, you went back to Arabic. The call rings and you dodge it, the email takes you half an hour, the meeting passes and you stay quiet. The problem is not that you do not know, it is that you have never said it out loud. Here every lesson is a real moment: hear it, say it in your voice, get corrected on the spot, until the reply comes on its own.'::text)),
  ('pricing_note_ar', to_jsonb('الدفع على واتساب، وحسابك يفتح بنفس اليوم. كل الباقات تفتح لك المنصه كامله.'::text)),
  ('pricing_note_en', to_jsonb('You pay on WhatsApp and your account opens the same day. Every plan unlocks the full platform.'::text)),
  ('faqs', '[
    {"qAr":"لمين هالمنصه؟","aAr":"لكل واحد حفظ انجليزي سنين ويبي يتكلمه فعلا: طالب، موظف، او واحد متجه لاختبار. نبدا من مستواك انت، ونبني على قد هدفك.","qEn":"Who is PEL for?","aEn":"For anyone who memorized English for years and actually wants to speak it: a student, an employee, or someone heading for an exam. We start from your level and build toward your goal."},
    {"qAr":"لازم اعرف انجليزي قبل؟","aAr":"لا. اذا ما تعرف ولا كلمه، نبدا معك من الحروف والاصوات، ونتدرج لين تسوي اول محادثه كامله.","qEn":"Do I need English first?","aEn":"No. If you do not know a single word, we start with the alphabet and sounds, and build up until you hold a full conversation."},
    {"qAr":"المنهج امريكي فعلا؟","aAr":"اي. كل درس، وكل تسجيل، وكل دليل نطق مبني على الانجليزي الامريكي.","qEn":"Is it really American English?","aEn":"Yes. Every lesson, recording and pronunciation guide is built on American English."},
    {"qAr":"الشرح بالعربي؟","aAr":"اي. القواعد والكلمات تنشرح بالعربي اول، وبجانب كل كلمه جديده نطقها مكتوب بحروف عربيه.","qEn":"Is the explanation in Arabic?","aEn":"Yes. Grammar and words are explained in Arabic first, and every new word has its pronunciation written in Arabic letters next to it."},
    {"qAr":"اقدر ادرس من الجوال؟","aAr":"اكيد. جوالك يصير فصلك، تفتحه اي وقت وتكمل من وين ما وقفت.","qEn":"Can I study on my phone?","aEn":"Of course. Your phone becomes your classroom, open it anytime and pick up where you left off."},
    {"qAr":"كم مده الاشتراك؟","aAr":"شهر، شهرين، او 3 اشهر، وانت تختار. وخلال المده كلها كل الدروس متاحه لك.","qEn":"How long is the subscription?","aEn":"One month, two months, or three months, you choose. All lessons are open to you for the whole period."},
    {"qAr":"اتابع تقدمي كيف؟","aAr":"لوحتك تعرض لك وين وصلت: محادثه، استماع، مفردات، اسبوع باسبوع.","qEn":"How do I track my progress?","aEn":"Your dashboard shows where you have gotten: speaking, listening, vocabulary, week by week."},
    {"qAr":"كم سعر الاشتراك؟","aAr":"مسارين. ابد من الصفر: شهر 650 ⃁، شهرين 800 ⃁، 3 اشهر 1300 ⃁ (افضل قيمه). التجهيز للاختبارات: شهر 1000 ⃁، شهرين 1550 ⃁، 3 اشهر 2350 ⃁ (افضل قيمه). الدفع على واتساب، ونفتح حسابك بنفس اليوم. التفاصيل فوق في الباقات.","qEn":"How much?","aEn":"Two tracks. Start From Zero: 1 month 650 ⃁, 2 months 800 ⃁, 3 months 1300 ⃁ (best value). Exam Prep: 1 month 1000 ⃁, 2 months 1550 ⃁, 3 months 2350 ⃁ (best value). Pay on WhatsApp and we open your account the same day. Full details in the plans above."},
    {"qAr":"الباقات فيها حصص مباشره؟","aAr":"باقات مختاره فيها حصص مباشره. باقه الشهر من ابد من الصفر بدون حصص، وباقه الشهرين حصه كل اسبوع، وباقه 3 اشهر حصتين. وباقات التجهيز للاختبارات فيها من حصه لـ 3 حصص بالاسبوع. الاستاذ فراس يحدد المواعيد.","qEn":"Do plans include live classes?","aEn":"Select plans include live classes. The 1-month Start From Zero plan has none, 2 months includes one a week, and 3 months includes two a week. Exam Prep plans include 1-3 a week. Tutor Firas sets the schedule."},
    {"qAr":"فيه استرجاع؟","aAr":"اي، خلال 3 ايام من الدفع. واذا استاذ فراس سوى لك الحساب وفعله بعد الدفع، تنخصم رسوم المنصه حسب باقتك. راسل استاذ فراس واتساب ونرتب لك.","qEn":"Is there a refund?","aEn":"Yes, within 3 days of payment. If Tutor Firas already created and activated your account after payment, platform fees are deducted depending on your plan. Message Tutor Firas on WhatsApp and we will sort it out."},
    {"qAr":"كيف اسجل؟","aAr":"راسل استاذ فراس واتساب، نرسل لك تفاصيل الدفع، ونفتح حسابك بنفس اليوم.","qEn":"How do I sign up?","aEn":"Message Tutor Firas on WhatsApp, we send the payment details, and open your account the same day."},
    {"qAr":"ايش يصير لما تخلص باقتي؟","aAr":"تقدمك وشهاداتك تبقى محفوظه، ويوقف الوصول للدروس بس. تجدد من لوحتك، او تراسل استاذ فراس ونفتح لك باقه جديده.","qEn":"What happens when my plan ends?","aEn":"Your progress and certificates stay saved, and only lesson access pauses. Renew from your dashboard, or message Tutor Firas and we open a new plan."}
  ]'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
