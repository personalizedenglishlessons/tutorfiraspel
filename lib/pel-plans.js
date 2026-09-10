/* PEL platform - single authoritative pricing configuration.
   Two tracks, six plans. Mirrors the `plan_pricing` rows in Supabase
   (start_from_zero + exam_prep x 1/2/3 months).
   The DB is the runtime source of truth (loaded into PEL_PLANS_DB by
   pel-settings.js); this file is the static mirror / first-paint
   fallback used by pages that cannot reach the DB yet (public
   index.html, and as a fallback in app.html). Keep both in sync.

   RULES (match the product, as of 2026-09-10):
   - Two tracks: "Start From 0" (absolute beginners) and "Exam Prep"
     (advanced students targeting STEP / TOEFL / IELTS).
   - Start From 0: 1 month 230 SAR, 2 months 450 SAR, 3 months 750 SAR.
     Every plan includes 1 live class / week.
   - Exam Prep: 1 month 1000 SAR (1 live class / week), 2 months 1300 SAR
     (2 live classes / week), 3 months 2200 SAR (3 live classes / week).
   - Extra live classes are bought as credits, paid manually through
     WhatsApp (no mada / no online payment). Admin can also grant
     credits to a student profile (admin_adjust_credits).
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
        termAr: 'شهر · بداية سريعة',
        durationMonths: 1,
        durationDays: 30,
        price: 230,
        weeklyLiveSessions: 1,
        includedLiveSessions: 4,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: '',
        badgeEn: '',
        liveNoteAr: 'حصة مباشرة كل اسبوع مشمولة معك. تبغى حصص اكثر؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: '1 live class every week is included. Want more? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 230 ريال شهرياً',
        perMonthEn: 'Equiv. 230 SAR / month',
        featuresAr: [
          'وصول كامل للوحة التحكم والدروس لمدة شهر',
          'دروس اساسية من الصفر، خطوة بخطوة',
          'حصة مباشرة كل اسبوع مع الاستاذ فراس',
          'ترجمة فورية وشرح بالعربي'
        ],
        featuresEn: [
          'Full dashboard & lesson access for a month',
          'Baseline lessons from scratch, step by step',
          '1 live class every week with Tutor Firas',
          'Instant translation & Arabic support'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة ابد من الصفر - شهر (230 ريال). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 1 month (230 SAR). How do I pay?'
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
        price: 450,
        weeklyLiveSessions: 1,
        includedLiveSessions: 8,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر طلباً',
        badgeEn: '2nd Most Popular',
        liveNoteAr: 'حصة مباشرة كل اسبوع مشمولة معك. تبغى حصص اكثر؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: '1 live class every week is included. Want more? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 225 ريال شهرياً',
        perMonthEn: 'Equiv. 225 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهر',
          'وصول كامل للمنصة لمدة شهرين',
          'حصة مباشرة كل اسبوع مع الاستاذ فراس',
          'ترجمة فورية ومراجعة كتابة وتمارين تفاعلية'
        ],
        featuresEn: [
          'All 1-month benefits',
          'Full platform access for 2 months',
          '1 live class every week with Tutor Firas',
          'Instant translation, writing review & interactive exercises'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة ابد من الصفر - شهرين (450 ريال). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 2 months (450 SAR). How do I pay?'
      },
      {
        code: 'start_from_zero-3m',
        track: 'start_from_zero',
        nameEn: 'Start From 0',
        nameAr: 'ابد من الصفر',
        termEn: '3 Months · Best value',
        termAr: '3 اشهر · افضل قيمة',
        durationMonths: 3,
        durationDays: 90,
        price: 750,
        weeklyLiveSessions: 1,
        includedLiveSessions: 12,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'افضل قيمة',
        badgeEn: 'Best value',
        liveNoteAr: 'حصة مباشرة كل اسبوع مشمولة معك. تبغى حصص اكثر؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: '1 live class every week is included. Want more? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 250 ريال شهرياً',
        perMonthEn: 'Equiv. 250 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهرين',
          'وصول كامل للمنصة لمدة 3 اشهر',
          'حصة مباشرة كل اسبوع + متابعة تقدمك',
          'ترجمة فورية ومراجعة كتابة وتمارين تفاعلية + شهادة اتمام'
        ],
        featuresEn: [
          'All 2-month benefits',
          'Full platform access for 3 months',
          '1 live class every week + progress tracking',
          'Instant translation, writing review, exercises + completion certificate'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة ابد من الصفر - 3 اشهر (750 ريال). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 3 months (750 SAR). How do I pay?'
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
        liveNoteAr: 'حصة مباشرة كل اسبوع مشمولة معك. تبغى حصص اكثر؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: '1 live class every week is included. Want more? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 1000 ريال شهرياً',
        perMonthEn: 'Equiv. 1000 SAR / month',
        featuresAr: [
          'مسارات التجهيز لـ STEP و TOEFL و IELTS',
          'اسيلة محاكاة للامتحان',
          'حصة مباشرة كل اسبوع مع الاستاذ فراس',
          'وحدات مصطلحات مستهدفة وترجمة فورية'
        ],
        featuresEn: [
          'STEP / TOEFL / IELTS prep tracks',
          'Mock exam simulator questions',
          '1 live class every week with Tutor Firas',
          'Targeted vocabulary modules & instant translation'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة التجهيز للاختبارات - شهر (1000 ريال). وش طريقة الدفع؟',
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
        price: 1300,
        weeklyLiveSessions: 2,
        includedLiveSessions: 16,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر طلباً',
        badgeEn: '2nd Most Popular',
        liveNoteAr: 'حصتان مباشرتان كل اسبوع مشمولات معك. تبغى حصص اكثر؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: '2 live classes every week are included. Want more? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 650 ريال شهرياً',
        perMonthEn: 'Equiv. 650 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهر للتجهيز',
          'وصول كامل لمسارات الاختبارات لمدة شهرين',
          'حصتان مباشرتان كل اسبوع مع الاستاذ فراس',
          'اسيلة محاكاة + وحدات مصطلحات مستهدفة'
        ],
        featuresEn: [
          'All 1-month Exam Prep benefits',
          'Full prep-track access for 2 months',
          '2 live classes every week with Tutor Firas',
          'Mock questions + targeted vocabulary modules'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة التجهيز للاختبارات - شهرين (1300 ريال، فيها حصتان مباشرتان كل اسبوع). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 2 months (1300 SAR, includes 2 live classes per week). How do I pay?'
      },
      {
        code: 'exam_prep-3m',
        track: 'exam_prep',
        nameEn: 'Exam Prep',
        nameAr: 'التجهيز للاختبارات',
        termEn: '3 Months · 3 live classes / week',
        termAr: '3 اشهر · 3 حصص مباشرة كل اسبوع',
        durationMonths: 3,
        durationDays: 90,
        price: 2200,
        weeklyLiveSessions: 3,
        includedLiveSessions: 36,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'افضل قيمة',
        badgeEn: 'Best value',
        liveNoteAr: '3 حصص مباشرة كل اسبوع مشمولة معك. تبغى اكثر؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: '3 live classes every week are included. Want more? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 733 ريال شهرياً',
        perMonthEn: 'Equiv. 733 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهرين للتجهيز',
          'وصول كامل لمسارات الاختبارات لمدة 3 اشهر',
          '3 حصص مباشرة كل اسبوع مع الاستاذ فراس',
          'اسيلة محاكاة + مصطلحات مستهدفة + شهادة اتمام'
        ],
        featuresEn: [
          'All 2-month Exam Prep benefits',
          'Full prep-track access for 3 months',
          '3 live classes every week with Tutor Firas',
          'Mock questions + targeted vocabulary + completion certificate'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة التجهيز للاختبارات - 3 اشهر (2200 ريال، فيها 3 حصص مباشرة كل اسبوع). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 3 months (2200 SAR, includes 3 live classes per week). How do I pay?'
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
