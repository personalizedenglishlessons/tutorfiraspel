/* PEL platform - single authoritative pricing configuration.
   Two tracks, six plans. Mirrors the `plan_pricing` rows in Supabase
   (start_from_zero + exam_prep x 1/2/3 months).
   The DB is the runtime source of truth (loaded into PEL_PLANS_DB by
   pel-settings.js); this file is the static mirror / first-paint
   fallback used by pages that cannot reach the DB yet (public
   index.html, and as a fallback in app.html). Keep both in sync.

   RULES (match the product, as of 2026-10-22):
   - Two tracks: "Start From 0" (absolute beginners) and "Exam Prep"
     (advanced students targeting STEP / TOEFL / IELTS).
   - Start From 0: 1 month 649 SAR (no live classes), 2 months 799 SAR
     (1 online class / week), 3 months 1249 SAR (2 online classes / week).
   - Exam Prep: 1 month 1099 SAR (1 online class / week), 2 months 1699 SAR
     (2 online classes / week), 3 months 2499 SAR (3 online classes / week).
   - Classes included in the plans are ONLINE ONLY: Zoom, Teams, or
     Google Meet. Tutor Firas sets the schedule and announces it to
     students' registered accounts.
   - In-person classes are NOT included in any plan. They are bought
     separately as credits from Tutor Firas and requested from the
     student portal. Prices are shared when the student contacts
     the tutor.
   - Feature lists use real, concrete terms only. No vague claims,
     no litotes (no "instant translation" style wording).
   - Runs fully in-browser, no external services.
   Arabic: Saudi Southern (Abha), no hamzas, no em dashes.
   English: casual, direct, not formal. */
(function (global) {
  'use strict';

  var PEL_PLANS = {
    currency: 'SAR',
    currencyAr: 'ريال',
    contact: '966557178070',

    plans: [
      /* ---------- Start From 0 ---------- */
      {
        code: 'start_from_zero-1m',
        track: 'start_from_zero',
        nameEn: 'Start From 0',
        nameAr: 'ابد من الصفر',
        termEn: '1 Month · Quick start',
        termAr: 'شهر · بدايه سريعه',
        durationMonths: 1,
        durationDays: 30,
        price: 649,
        weeklyLiveSessions: 0,
        includedLiveSessions: 0,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: '',
        badgeEn: '',
        liveNoteAr: 'هالباقه ما فيها حصص. الحصص المشموله بالباقات اونلاين عبر زووم او تيمز او جوجل ميت. تبغى حصص حضوريه؟ اشتري رصيد من الاستاذ فراس وتطلب الحصه من بوابه الطالب.',
        liveNoteEn: 'No classes with this plan. Classes included in plans are online on Zoom, Teams or Google Meet. Want in-person classes? Buy credits from Tutor Firas and request the class from the student portal.',
        perMonthAr: 'يعادل 649 ريال شهريا',
        perMonthEn: 'about 649 SAR / month',
        featuresAr: [
          'منصه تحس فيها انك بالبيت: كل كلمه انجليزيه ومعها معناها بالعربي',
          'تبدا من الحروف وتوصل لاول محادثه حقيقيه',
          'مواقف من حياتك: الشغل، السفر، الدوام',
          'تسمع نطق كل كلمه وتكرره، وتشوف تقدمك يوم بيوم'
        ],
        featuresEn: [
          'A platform that feels like home: every English word explained in Arabic',
          'From the alphabet to your first real conversation',
          'Situations from your life: work, travel, daily routine',
          'Hear and repeat every word, and see your progress day by day'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه ابد من الصفر - شهر (649 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 1 month (649 SAR). How do I pay?'
      },
      {
        code: 'start_from_zero-2m',
        track: 'start_from_zero',
        nameEn: 'Start From 0',
        nameAr: 'ابد من الصفر',
        termEn: '2 Months · Standard',
        termAr: 'شهران · قياسي',
        durationMonths: 2,
        durationDays: 60,
        price: 799,
        weeklyLiveSessions: 1,
        includedLiveSessions: 8,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر طلبا',
        badgeEn: '2nd Most Popular',
        liveNoteAr: 'حصه اونلاين كل اسبوع مشموله معاك عبر زووم او تيمز او جوجل ميت. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. الحصص الحضوريه مو مشموله بالباقات: اشتري رصيد من الاستاذ وتطلب الحصه من بوابه الطالب.',
        liveNoteEn: '1 online class every week is included, on Zoom, Teams or Google Meet. Tutor Firas sets the schedule and announces it in your account. In-person classes are not included in plans: buy credits from the tutor and request the class from the student portal.',
        perMonthAr: 'يعادل 400 ريال شهريا',
        perMonthEn: 'about 400 SAR / month',
        featuresAr: [
          'منصه تحس فيها انك بالبيت: كل كلمه انجليزيه ومعها معناها بالعربي',
          'تبدا من الحروف وتوصل لاول محادثه حقيقيه',
          'حصه اونلاين كل اسبوع مع الاستاذ فراس (زووم / تيمز / جوجل ميت)',
          'تسمع نطق كل كلمه وتكرره، وتشوف تقدمك يوم بيوم'
        ],
        featuresEn: [
          'A platform that feels like home: every English word explained in Arabic',
          'From the alphabet to your first real conversation',
          '1 online class every week with Tutor Firas (Zoom / Teams / Google Meet)',
          'Hear and repeat every word, and see your progress day by day'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه ابد من الصفر - شهرين (799 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 2 months (799 SAR). How do I pay?'
      },
      {
        code: 'start_from_zero-3m',
        track: 'start_from_zero',
        nameEn: 'Start From 0',
        nameAr: 'ابد من الصفر',
        termEn: '3 Months · Best value',
        termAr: '3 اشهر · افضل قيمه',
        durationMonths: 3,
        durationDays: 90,
        price: 1249,
        weeklyLiveSessions: 2,
        includedLiveSessions: 24,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'افضل قيمه',
        badgeEn: 'Best value',
        liveNoteAr: 'حصتان اونلاين كل اسبوع مشمولات معاك عبر زووم او تيمز او جوجل ميت. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. الحصص الحضوريه مو مشموله بالباقات: اشتري رصيد من الاستاذ وتطلب الحصه من بوابه الطالب.',
        liveNoteEn: '2 online classes every week are included, on Zoom, Teams or Google Meet. Tutor Firas sets the schedule and announces it in your account. In-person classes are not included in plans: buy credits from the tutor and request the class from the student portal.',
        perMonthAr: 'توفير 698 ريال + 24 حصه اونلاين مشموله',
        perMonthEn: 'Save 698 SAR + 24 online classes included',
        featuresAr: [
          'منصه تحس فيها انك بالبيت: كل كلمه انجليزيه ومعها معناها بالعربي',
          'تبدا من الحروف وتوصل لاول محادثه حقيقيه',
          'حصتان اونلاين كل اسبوع مع الاستاذ فراس (زووم / تيمز / جوجل ميت)',
          'تسمع نطق كل كلمه وتكرره + شهاده اتمام'
        ],
        featuresEn: [
          'A platform that feels like home: every English word explained in Arabic',
          'From the alphabet to your first real conversation',
          '2 online classes every week with Tutor Firas (Zoom / Teams / Google Meet)',
          'Hear and repeat every word + completion certificate'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه ابد من الصفر - 3 اشهر (1249 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 3 months (1249 SAR). How do I pay?'
      },

      /* ---------- Exam Prep (STEP / TOEFL / IELTS) ---------- */
      {
        code: 'exam_prep-1m',
        track: 'exam_prep',
        nameEn: 'Exam Prep',
        nameAr: 'التجهيز للاختبارات',
        termEn: '1 Month · STEP / TOEFL / IELTS',
        termAr: 'شهر · STEP و TOEFL و IELTS',
        durationMonths: 1,
        durationDays: 30,
        price: 1099,
        weeklyLiveSessions: 1,
        includedLiveSessions: 4,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: '',
        badgeEn: '',
        liveNoteAr: 'حصه اونلاين اسبوعيه مشموله معاك عبر زووم او تيمز او جوجل ميت. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. الحصص الحضوريه مو مشموله بالباقات: اشتري رصيد من الاستاذ وتطلب الحصه من بوابه الطالب.',
        liveNoteEn: '1 online class every week is included, on Zoom, Teams or Google Meet. Tutor Firas sets the schedule and announces it in your account. In-person classes are not included in plans: buy credits from the tutor and request the class from the student portal.',
        perMonthAr: 'يعادل 1099 ريال شهريا',
        perMonthEn: 'about 1099 SAR / month',
        featuresAr: [
          'تجهيز STEP و IELTS و TOEFL مبني على تجارب طلابنا، مو منهج جاهز',
          'اسئله تدريب بنفس صيغه الاختبار الحقيقي',
          'حصه اونلاين كل اسبوع مع الاستاذ فراس (زووم / تيمز / جوجل ميت)',
          'تصحيح كتابتك مع ملاحظات الاستاذ فراس'
        ],
        featuresEn: [
          'STEP, IELTS and TOEFL prep built from our students, not a ready-made course',
          'Practice questions in the real exam format',
          '1 online class every week with Tutor Firas (Zoom / Teams / Google Meet)',
          'Your writing corrected with Tutor Firas notes'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه التجهيز للاختبارات - شهر (1099 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 1 month (1099 SAR). How do I pay?'
      },
      {
        code: 'exam_prep-2m',
        track: 'exam_prep',
        nameEn: 'Exam Prep',
        nameAr: 'التجهيز للاختبارات',
        termEn: '2 Months · 2 online classes / week',
        termAr: 'شهران · حصتان اونلاين كل اسبوع',
        durationMonths: 2,
        durationDays: 60,
        price: 1699,
        weeklyLiveSessions: 2,
        includedLiveSessions: 16,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر طلبا',
        badgeEn: '2nd Most Popular',
        liveNoteAr: 'حصتان اونلاين كل اسبوع مشمولات معاك عبر زووم او تيمز او جوجل ميت. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. الحصص الحضوريه مو مشموله بالباقات: اشتري رصيد من الاستاذ وتطلب الحصه من بوابه الطالب.',
        liveNoteEn: '2 online classes every week are included, on Zoom, Teams or Google Meet. Tutor Firas sets the schedule and announces it in your account. In-person classes are not included in plans: buy credits from the tutor and request the class from the student portal.',
        perMonthAr: 'يعادل 850 ريال شهريا',
        perMonthEn: 'about 850 SAR / month',
        featuresAr: [
          'تجهيز STEP و IELTS و TOEFL مبني على تجارب طلابنا، مو منهج جاهز',
          'اسئله تدريب بنفس صيغه الاختبار الحقيقي',
          'حصتان اونلاين كل اسبوع مع الاستاذ فراس (زووم / تيمز / جوجل ميت)',
          'تصحيح كتابتك مع ملاحظات الاستاذ فراس + نطق مسموع لكل كلمه'
        ],
        featuresEn: [
          'STEP, IELTS and TOEFL prep built from our students, not a ready-made course',
          'Practice questions in the real exam format',
          '2 online classes every week with Tutor Firas (Zoom / Teams / Google Meet)',
          'Your writing corrected with Tutor Firas notes + audio pronunciation for every word'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه التجهيز للاختبارات - شهرين (1699 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 2 months (1699 SAR). How do I pay?'
      },
      {
        code: 'exam_prep-3m',
        track: 'exam_prep',
        nameEn: 'Exam Prep',
        nameAr: 'التجهيز للاختبارات',
        termEn: '3 Months · 3 online classes / week',
        termAr: '3 اشهر · 3 حصص اونلاين كل اسبوع',
        durationMonths: 3,
        durationDays: 90,
        price: 2499,
        weeklyLiveSessions: 3,
        includedLiveSessions: 36,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'افضل قيمه',
        badgeEn: 'Best value',
        liveNoteAr: '3 حصص اونلاين كل اسبوع مشموله معاك عبر زووم او تيمز او جوجل ميت. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. الحصص الحضوريه مو مشموله بالباقات: اشتري رصيد من الاستاذ وتطلب الحصه من بوابه الطالب.',
        liveNoteEn: '3 online classes every week are included, on Zoom, Teams or Google Meet. Tutor Firas sets the schedule and announces it in your account. In-person classes are not included in plans: buy credits from the tutor and request the class from the student portal.',
        perMonthAr: 'توفير 798 ريال + 36 حصه اونلاين مشموله',
        perMonthEn: 'Save 798 SAR + 36 online classes included',
        featuresAr: [
          'تجهيز STEP و IELTS و TOEFL مبني على تجارب طلابنا، مو منهج جاهز',
          'اسئله تدريب بنفس صيغه الاختبار الحقيقي',
          '3 حصص اونلاين كل اسبوع مع الاستاذ فراس (زووم / تيمز / جوجل ميت)',
          'تصحيح كتابتك مع ملاحظات الاستاذ فراس + شهاده اتمام'
        ],
        featuresEn: [
          'STEP, IELTS and TOEFL prep built from our students, not a ready-made course',
          'Practice questions in the real exam format',
          '3 online classes every week with Tutor Firas (Zoom / Teams / Google Meet)',
          'Your writing corrected with Tutor Firas notes + completion certificate'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه التجهيز للاختبارات - 3 اشهر (2499 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 3 months (2499 SAR). How do I pay?'
      }
    ]
  };

  /* Legacy code aliases: if anything still references the old single-tier
     codes, map them to the closest new plan so nothing breaks. */
  var LEGACY = {
    'plan-30d': 'start_from_zero-1m',
    'plan-2m': 'start_from_zero-2m',
    'plan-3m': 'start_from_zero-3m',
    'plan-6m': 'exam_prep-3m'
  };

  PEL_PLANS.getByCode = function (code) {
    if (LEGACY[code]) code = LEGACY[code];
    for (var i = 0; i < PEL_PLANS.plans.length; i++) {
      if (PEL_PLANS.plans[i].code === code) return PEL_PLANS.plans[i];
    }
    return null;
  };

  PEL_PLANS.byTrack = function (track) {
    return PEL_PLANS.plans.filter(function (p) { return p.track === track; });
  };

  PEL_PLANS.waLink = function (plan, lang) {
    if (!lang) {
      try {
        var prefs = JSON.parse(localStorage.getItem('pel_account_prefs') || 'null');
        lang = prefs && prefs.lang === 'ar' ? 'ar' : 'en';
      } catch (e) { lang = 'en'; }
      if (document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl') lang = 'ar';
    }
    var text = lang === 'ar' ? plan.waText : (plan.waTextEn || plan.waText);
    return 'https://wa.me/' + PEL_PLANS.contact + '?text=' + encodeURIComponent(text);
  };

  global.PEL_PLANS = PEL_PLANS;
})(window);
