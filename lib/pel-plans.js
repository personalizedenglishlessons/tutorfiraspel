/* PEL platform - single authoritative pricing configuration.
   Two tracks, six plans. Mirrors the `plan_pricing` rows in Supabase
   (start_from_zero + exam_prep x 1/2/3 months).
   The DB is the runtime source of truth (loaded into PEL_PLANS_DB by
   pel-settings.js); this file is the static mirror / first-paint
   fallback used by pages that cannot reach the DB yet (public
   index.html, and as a fallback in app.html). Keep both in sync.

   RULES (match the product, as of 2026-10-02):
   - Two tracks: "Start From 0" (absolute beginners) and "Exam Prep"
     (advanced students targeting STEP / TOEFL / IELTS).
   - Start From 0: 1 month 650 SAR (no live classes), 2 months 800 SAR
     (1 live class / week), 3 months 1300 SAR (2 live classes / week).
   - Exam Prep: 1 month 1000 SAR (1 in-person class / week), 2 months 1550 SAR
     (2 in-person classes / week), 3 months 2350 SAR (2 in-person + 1 Zoom / week).
   - Tutor Firas sets the schedule for all live classes and announces them
     to students' registered accounts.
   - Extra classes are bought as credits for in-person lessons. Prices may vary.
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
        price: 650,
        weeklyLiveSessions: 0,
        includedLiveSessions: 0,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: '',
        badgeEn: '',
        liveNoteAr: 'هالباقه ما فيها حصص مباشره. تبغى حصص اكثر؟ اشتري رصيد للحصص الشخصيه.',
        liveNoteEn: 'No live classes with this plan. Want classes? Buy credits for in-person lessons.',
        perMonthAr: 'يعادل 650 ريال شهريا',
        perMonthEn: 'about 650 SAR / month',
        featuresAr: [
          'تبدا من الحروف وتوصل للمحادثه',
          'مواقف حقيقيه: شغل، سفر، دوام',
          'نطق مسموع لكل كلمه جديده',
          'تشوف تقدمك يوم بيوم'
        ],
        featuresEn: [
          'From alphabet to your first real conversation',
          'Real situations: work, travel, daily life',
          'Audio pronunciation for every new word',
          'See your progress day by day'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه ابد من الصفر - شهر (650 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 1 month (650 SAR). How do I pay?'
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
        price: 800,
        weeklyLiveSessions: 1,
        includedLiveSessions: 8,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر طلبا',
        badgeEn: '2nd Most Popular',
        liveNoteAr: 'حصه مباشره كل اسبوع مشموله معاك. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. تبغى اكثر؟ اشتري رصيد للحصص الشخصيه.',
        liveNoteEn: '1 live class every week is included. Tutor Firas sets the schedule and announces it in your account. Want more? Buy credits for in-person lessons.',
        perMonthAr: 'يعادل 400 ريال شهريا',
        perMonthEn: 'about 400 SAR / month',
        featuresAr: [
          'تبدا من الحروف وتوصل للمحادثه',
          'مواقف حقيقيه: شغل، سفر، دوام',
          'حصه مباشره كل اسبوع مع الاستاذ فراس',
          'نطق مسموع لكل كلمه جديده'
        ],
        featuresEn: [
          'From alphabet to your first real conversation',
          'Real situations: work, travel, daily life',
          '1 live class every week with Tutor Firas',
          'Audio pronunciation for every new word'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه ابد من الصفر - شهرين (800 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 2 months (800 SAR). How do I pay?'
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
        price: 1300,
        weeklyLiveSessions: 2,
        includedLiveSessions: 24,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'افضل قيمه',
        badgeEn: 'Best value',
        liveNoteAr: 'حصتان مباشرتان كل اسبوع مشمولات معاك. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. تبغى اكثر؟ اشتري رصيد للحصص الشخصيه.',
        liveNoteEn: '2 live classes every week are included. Tutor Firas sets the schedule and announces it in your account. Want more? Buy credits for in-person lessons.',
        perMonthAr: 'يعادل 433 ريال شهريا',
        perMonthEn: 'about 433 SAR / month',
        featuresAr: [
          'تبدا من الحروف وتوصل للمحادثه',
          'مواقف حقيقيه: شغل، سفر، دوام',
          'حصتان مباشرتان كل اسبوع مع الاستاذ فراس',
          'نطق مسموع لكل كلمه جديده + شهاده اتمام'
        ],
        featuresEn: [
          'From alphabet to your first real conversation',
          'Real situations: work, travel, daily life',
          '2 live classes every week with Tutor Firas',
          'Audio pronunciation + completion certificate'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه ابد من الصفر - 3 اشهر (1300 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 3 months (1300 SAR). How do I pay?'
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
        price: 1000,
        weeklyLiveSessions: 1,
        includedLiveSessions: 4,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: '',
        badgeEn: '',
        liveNoteAr: 'حصه اسبوعيه حضوريه مشموله معاك. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. تبغى اكثر؟ اشتري رصيد للحصص الشخصيه.',
        liveNoteEn: '1 in-person class every week is included. Tutor Firas sets the schedule and announces it in your account. Want more? Buy credits for in-person lessons.',
        perMonthAr: 'يعادل 1000 ريال شهريا',
        perMonthEn: 'about 1000 SAR / month',
        featuresAr: [
          'تجهيز خاص للستب والتوفل والايلتس',
          'اسئله حقيقيه بنفس نظام الامتحان',
          'حصه اسبوعيه حضوريه مع الاستاذ فراس',
          'تصحيح كتابتك فورا'
        ],
        featuresEn: [
          'STEP, TOEFL, and IELTS, all three covered',
          'Real exam-style questions, same format as test day',
          '1 in-person class every week with Tutor Firas',
          'Writing corrected instantly'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه التجهيز للاختبارات - شهر (1000 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 1 month (1000 SAR). How do I pay?'
      },
      {
        code: 'exam_prep-2m',
        track: 'exam_prep',
        nameEn: 'Exam Prep',
        nameAr: 'التجهيز للاختبارات',
        termEn: '2 Months · 2 live classes / week',
        termAr: 'شهران · حصتان مباشرتان كل اسبوع',
        durationMonths: 2,
        durationDays: 60,
        price: 1550,
        weeklyLiveSessions: 2,
        includedLiveSessions: 16,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر طلبا',
        badgeEn: '2nd Most Popular',
        liveNoteAr: 'حصتان اسبوعيه حضوريه مشمولات معاك. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. تبغى اكثر؟ اشتري رصيد للحصص الشخصيه.',
        liveNoteEn: '2 in-person classes every week are included. Tutor Firas sets the schedule and announces it in your account. Want more? Buy credits for in-person lessons.',
        perMonthAr: 'يعادل 775 ريال شهريا',
        perMonthEn: 'about 775 SAR / month',
        featuresAr: [
          'تجهيز خاص للستب والتوفل والايلتس',
          'اسئله حقيقيه بنفس نظام الامتحان',
          'حصتان اسبوعيه حضوريه مع الاستاذ فراس',
          'تصحيح كتابتك فورا + نطق مسموع'
        ],
        featuresEn: [
          'STEP, TOEFL, and IELTS, all three covered',
          'Real exam-style questions, same format as test day',
          '2 in-person classes every week with Tutor Firas',
          'Writing corrected instantly + audio pronunciation'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه التجهيز للاختبارات - شهرين (1550 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 2 months (1550 SAR). How do I pay?'
      },
      {
        code: 'exam_prep-3m',
        track: 'exam_prep',
        nameEn: 'Exam Prep',
        nameAr: 'التجهيز للاختبارات',
        termEn: '3 Months · 3 live classes / week',
        termAr: '3 اشهر · 3 حصص مباشره كل اسبوع',
        durationMonths: 3,
        durationDays: 90,
        price: 2350,
        weeklyLiveSessions: 3,
        includedLiveSessions: 36,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'افضل قيمه',
        badgeEn: 'Best value',
        liveNoteAr: 'حصتان حضوريه + حصه زووم اسبوعيا مشمولات معاك. الاستاذ فراس يحدد الموعد ويعلنه في حسابك. تبغى اكثر؟ اشتري رصيد للحصص الشخصيه.',
        liveNoteEn: '2 in-person + 1 live Zoom class every week are included. Tutor Firas sets the schedule and announces it in your account. Want more? Buy credits for in-person lessons.',
        perMonthAr: 'يعادل 783 ريال شهريا',
        perMonthEn: 'about 783 SAR / month',
        featuresAr: [
          'تجهيز خاص للستب والتوفل والايلتس',
          'اسئله حقيقيه بنفس نظام الامتحان',
          'حصتان حضوريه + حصه زووم اسبوعيا',
          'تصحيح كتابتك فورا + نطق مسموع + شهاده اتمام'
        ],
        featuresEn: [
          'STEP, TOEFL, and IELTS, all three covered',
          'Real exam-style questions, same format as test day',
          '2 in-person + 1 Zoom class every week',
          'Writing corrected instantly + audio pronunciation + completion certificate'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطه التجهيز للاختبارات - 3 اشهر (2350 ريال). وش طريقه الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 3 months (2350 SAR). How do I pay?'
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
