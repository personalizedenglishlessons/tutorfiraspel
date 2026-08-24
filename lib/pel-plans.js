/* PEL platform - single authoritative pricing configuration.
   Two tracks, six plans. Mirrors the `plan_pricing` rows seeded in the
   Supabase migration (start_from_zero + exam_prep x 1/2/3 months).
   The DB is the runtime source of truth (loaded into PEL_PLANS_DB by
   pel-settings.js); this file is the static mirror / first-paint
   fallback used by pages that cannot reach the DB yet (public
   index.html, and as a fallback in app.html). Keep both in sync.

   RULES (match the product):
   - Two tracks: "Start From 0" (absolute beginners) and "Exam Prep"
     (advanced students targeting STEP / TOEFL / IELTS).
   - Each track: 1 month 89 SAR, 2 months 139 SAR, 3 months 169 SAR.
   - ONLY Exam Prep 3-Month includes 1 live class / week. Every other
     plan has no included live class.
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
        price: 89,
        weeklyLiveSessions: 0,
        includedLiveSessions: 0,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: '',
        badgeEn: '',
        liveNoteAr: 'ما فيها حصص مباشرة. تبغى حصص؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: 'No live classes. Want some? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 89 ريال شهرياً',
        perMonthEn: 'Equiv. 89 SAR / month',
        featuresAr: [
          'وصول كامل للوحة التحكم والدروس لمدة شهر',
          'دروس اساسية من الصفر، خطوة بخطوة',
          'سيناريوهات يومية واقعية من حياتك',
          'ترجمة فورية وشرح بالعربي'
        ],
        featuresEn: [
          'Full dashboard & lesson access for a month',
          'Baseline lessons from scratch, step by step',
          'Real daily-life scenarios',
          'Instant translation & Arabic support'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة ابد من الصفر - شهر (89 ريال). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 1 month (89 SAR). How do I pay?'
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
        price: 139,
        weeklyLiveSessions: 0,
        includedLiveSessions: 0,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر طلباً',
        badgeEn: '2nd Most Popular',
        liveNoteAr: 'ما فيها حصص مباشرة. تبغى حصص؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: 'No live classes. Want some? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 70 ريال شهرياً',
        perMonthEn: 'Equiv. 70 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهر',
          'وصول كامل للمنصة لمدة شهرين',
          'دروس اساسية متدرجة من الصفر',
          'ترجمة فورية ومراجعة كتابة وتمارين تفاعلية'
        ],
        featuresEn: [
          'All 1-month benefits',
          'Full platform access for 2 months',
          'Graduated baseline lessons from scratch',
          'Instant translation, writing review & interactive exercises'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة ابد من الصفر - شهرين (139 ريال). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 2 months (139 SAR). How do I pay?'
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
        price: 169,
        weeklyLiveSessions: 0,
        includedLiveSessions: 0,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'افضل قيمة',
        badgeEn: 'Best value',
        liveNoteAr: 'ما فيها حصص مباشرة. تبغى حصص؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: 'No live classes. Want some? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 57 ريال شهرياً',
        perMonthEn: 'Equiv. 57 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهرين',
          'وصول كامل للمنصة لمدة 3 اشهر',
          'دروس اساسية متدرجة + متابعة تقدمك',
          'ترجمة فورية ومراجعة كتابة وتمارين تفاعلية + شهادة اتمام'
        ],
        featuresEn: [
          'All 2-month benefits',
          'Full platform access for 3 months',
          'Graduated baseline lessons + progress tracking',
          'Instant translation, writing review, exercises + completion certificate'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة ابد من الصفر - 3 اشهر (169 ريال). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Start From 0 plan - 3 months (169 SAR). How do I pay?'
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
        price: 89,
        weeklyLiveSessions: 0,
        includedLiveSessions: 0,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: '',
        badgeEn: '',
        liveNoteAr: 'ما فيها حصص مباشرة بهالمدة. تبغى؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: 'No live classes at this duration. Want some? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 89 ريال شهرياً',
        perMonthEn: 'Equiv. 89 SAR / month',
        featuresAr: [
          'مسارات التجهيز لـ STEP و TOEFL و IELTS',
          'اسيلة محاكاة للامتحان',
          'وحدات مصطلحات مستهدفة',
          'ترجمة فورية ومراجعة كتابة'
        ],
        featuresEn: [
          'STEP / TOEFL / IELTS prep tracks',
          'Mock exam simulator questions',
          'Targeted vocabulary modules',
          'Instant translation & writing review'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة التجهيز للاختبارات - شهر (89 ريال). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 1 month (89 SAR). How do I pay?'
      },
      {
        code: 'exam_prep-2m',
        track: 'exam_prep',
        nameEn: 'Exam Prep',
        nameAr: 'التجهيز للاختبارات',
        termEn: '2 Months · STEP / TOEFL / IELTS',
        termAr: 'شهران · STEP و TOEFL و IELTS',
        durationMonths: 2,
        durationDays: 60,
        price: 139,
        weeklyLiveSessions: 0,
        includedLiveSessions: 0,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر طلباً',
        badgeEn: '2nd Most Popular',
        liveNoteAr: 'ما فيها حصص مباشرة بهالمدة. تبغى؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: 'No live classes at this duration. Want some? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 70 ريال شهرياً',
        perMonthEn: 'Equiv. 70 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهر للتجهيز',
          'وصول كامل لمسارات الاختبارات لمدة شهرين',
          'اسيلة محاكاة + وحدات مصطلحات مستهدفة',
          'ترجمة فورية ومراجعة كتابة + تمارين تفاعلية'
        ],
        featuresEn: [
          'All 1-month Exam Prep benefits',
          'Full prep-track access for 2 months',
          'Mock questions + targeted vocabulary modules',
          'Instant translation, writing review & interactive exercises'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة التجهيز للاختبارات - شهرين (139 ريال). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 2 months (139 SAR). How do I pay?'
      },
      {
        code: 'exam_prep-3m',
        track: 'exam_prep',
        nameEn: 'Exam Prep',
        nameAr: 'التجهيز للاختبارات',
        termEn: '3 Months · 1 live class / week',
        termAr: '3 اشهر · حصة مباشرة كل اسبوع',
        durationMonths: 3,
        durationDays: 90,
        price: 169,
        weeklyLiveSessions: 1,
        includedLiveSessions: 12,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'افضل قيمة',
        badgeEn: 'Best value',
        liveNoteAr: 'حصة مباشرة كل اسبوع مشمولة معك. تبغى حصص اكثر؟ اشتري رصيد عن طريق واتساب.',
        liveNoteEn: '1 live class every week is included. Want more? Buy credits via WhatsApp.',
        perMonthAr: 'يعادل 57 ريال شهرياً',
        perMonthEn: 'Equiv. 57 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهرين للتجهيز',
          'وصول كامل لمسارات الاختبارات لمدة 3 اشهر',
          'حصة مباشرة كل اسبوع مشمولة معك',
          'اسيلة محاكاة + مصطلحات مستهدفة + شهادة اتمام'
        ],
        featuresEn: [
          'All 2-month Exam Prep benefits',
          'Full prep-track access for 3 months',
          '1 live class every week included',
          'Mock questions + targeted vocabulary + completion certificate'
        ],
        waText: 'السلام عليكم، ابي اشترك بخطة التجهيز للاختبارات - 3 اشهر (169 ريال، فيها حصة مباشرة كل اسبوع). وش طريقة الدفع؟',
        waTextEn: 'Hello, I want the Exam Prep plan - 3 months (169 SAR, includes 1 live class per week). How do I pay?'
      }
    ]
  };

  /* Legacy code aliases: if anything still references the old single-tier
     codes, map them to the closest new plan so nothing breaks. */
  var LEGACY = {
    'plan-30d': 'start_from_zero-1m',
    'plan-2m': 'start_from_zero-2m',
    'plan-3m': 'exam_prep-3m',
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
