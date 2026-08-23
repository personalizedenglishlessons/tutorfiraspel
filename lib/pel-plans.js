/* PEL platform - single authoritative pricing configuration.
   Mirrors the four canonical plans seeded in the Supabase `programs` table
   (see supabase/migrations/202608210001_plans_announcements.sql and
   202608220001_live_sessions_update.sql). The DB is the runtime source of
   truth for entitlements; this file is the static mirror used by pages that
   cannot query the database (public index.html, legal.html, and as a
   fallback in app.html). Keep both in sync.
   NOTE: plan-6m is temporarily unavailable (available:false) - shown as
   "Coming soon" and excluded from enrollment until it returns. */
(function (global) {
  'use strict';

  var PEL_PLANS = {
    currency: 'SAR',
    currencyAr: 'ريال',
    contact: '966557178070',
    plans: [
      {
        code: 'plan-30d',
        nameEn: '30 Days Starter',
        nameAr: 'مبتدئ 30 يوم',
        termEn: '30 Days · Quick start',
        termAr: '30 يوم · بداية سريعة',
        durationDays: 30,
        price: 180,
        weeklyLiveSessions: 1,
        includedLiveSessions: 4,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: '',
        badgeEn: '',
        liveNoteAr: '4 حصص مباشرة - حصة كل اسبوع مع الاستاذ فراس',
        liveNoteEn: '4 live sessions - one every week with Tutor Firas',
        perMonthAr: '',
        perMonthEn: '',
        featuresAr: [
          'وصول كامل لجميع الاكاديميات والدروس لمدة 30 يوم',
          '4 حصص مباشرة (اونلاين) مع الاستاذ فراس - حصة كل اسبوع',
          'لوحة تحكم تعرض تقدمك ومستواك',
          'ترجمة فورية مجانية بلا حدود',
          'مراجعة كتابة وتمارين تفاعلية'
        ],
        featuresEn: [
          'Full access to all academies and lessons for 30 days',
          '4 live online sessions with Tutor Firas - one every week',
          'Dashboard showing your progress and level',
          'Unlimited free instant translation',
          'Writing review & interactive exercises'
        ],
        waText: 'ابي اشترك بباقة مبتدئ 30 يوم (180 ريال)',
        waTextEn: 'I want the 30-Day Starter plan (180 SAR)'
      },
      {
        code: 'plan-2m',
        nameEn: '2 Months Standard',
        nameAr: 'قياسي شهران',
        termEn: '2 Months · Standard',
        termAr: 'شهران · قياسي',
        durationDays: 60,
        price: 230,
        weeklyLiveSessions: 0,
        includedLiveSessions: 6,
        platformAccess: true,
        available: true,
        featured: false,
        badgeAr: 'ثاني الاكثر بيعاً',
        badgeEn: '2nd Most Popular',
        liveNoteAr: '6 حصص مباشرة موزعة على طول مدة الشهرين',
        liveNoteEn: '6 live sessions spread across your 2 months',
        perMonthAr: 'يعادل 115 ريال شهرياً',
        perMonthEn: 'Equiv. 115 SAR / month',
        featuresAr: [
          'كل مزايا باقة 30 يوم',
          'وصول كامل للمنصة لمدة شهرين',
          '6 حصص مباشرة (اونلاين) موزعة على مدى الشهرين مع الاستاذ فراس',
          'ترجمة فورية ومراجعة كتابة وتمارين تفاعلية',
          'شهادة اتمام ععد كل مسار تكمله'
        ],
        featuresEn: [
          'All 30-day plan benefits',
          'Full platform access for 2 months',
          '6 live sessions spread across the 2 months with Tutor Firas',
          'Unlimited instant translation & writing review',
          'Completion certificate for every path'
        ],
        waText: 'ابي اشترك بباقة قياسي شهرين (230 ريال)',
        waTextEn: 'I want the 2-Month Standard plan (230 SAR)'
      },
      {
        code: 'plan-3m',
        nameEn: '3 Months Intensive',
        nameAr: 'مكثف 3 أشهر',
        termEn: '3 Months · Intensive',
        termAr: '3 أشهر · مكثف',
        durationDays: 90,
        price: 449,
        weeklyLiveSessions: 0,
        includedLiveSessions: 9,
        platformAccess: true,
        available: true,
        featured: true,
        badgeAr: 'الاكثر بيعاً',
        badgeEn: 'Most popular',
        liveNoteAr: '9 حصص مباشرة، ويمكن تزيد حسب تطورك',
        liveNoteEn: '9 live sessions, more added as you progress',
        perMonthAr: 'أقل من 150 ريال شهرياً',
        perMonthEn: 'Under 150 SAR / month',
        featuresAr: [
          'كل مزايا باقة الشهرين',
          'وصول كامل للمنصة لمدة 3 اشهر',
          '9 حصص مباشرة (اونلاين) مع الاستاذ فراس، وحصص اضافية ممكن تزيد حسب تطورك',
          'مواعيد الحصص تصلك كتنبيه داخل حسابك عشان تحضرها',
          'تتبع تقدمك وتحليلاتك + شهادة اتمام'
        ],
        featuresEn: [
          'All 2-month benefits',
          'Full platform access for 3 months',
          '9 live sessions with Tutor Firas - extra sessions may be added as you progress',
          'Session times arrive as announcements inside your account so you can join',
          'Progress analytics + completion certificate'
        ],
        waText: 'ابي اشترك بباقة مكثف 3 اشهر (449 ريال)',
        waTextEn: 'I want the 3-Month Intensive plan (449 SAR)'
      },
      {
        code: 'plan-6m',
        nameEn: '6 Months Premium',
        nameAr: 'بريميوم 6 أشهر',
        termEn: '6 Months · Premium',
        termAr: '6 أشهر · بريميوم',
        durationDays: 180,
        price: 799,
        weeklyLiveSessions: 0,
        includedLiveSessions: 0,
        platformAccess: true,
        available: false,
        featured: false,
        badgeAr: 'قريباً',
        badgeEn: 'Coming soon',
        liveNoteAr: 'الباقة غير متوفرة حالياً - ترجع قريباً',
        liveNoteEn: 'This plan is currently unavailable - returning soon',
        perMonthAr: 'افضل قيمة - يعادل 133 ريال شهرياً',
        perMonthEn: 'Best value · equiv. 133 SAR / month',
        featuresAr: [
          'كل مزايا باقة 3 اشهر المكثفة',
          'وصول كامل للمنصة لمدة 6 اشهر',
          'حصص مباشرة بنفس مستوى باقة 3 اشهر',
          'افضل سعر شهري لمن يبي الالتزام الطويل',
          'تتبع تقدمك وتحليلاتك + شهادة اتمام'
        ],
        featuresEn: [
          'All 3-Month Intensive benefits',
          'Full platform access for 6 months',
          'Live sessions at the same level as the 3-month plan',
          'Best monthly price for long commitment',
          'Progress analytics + completion certificate'
        ],
        waText: 'ابي اعرف متى تتوفر باقة بريميوم 6 اشهر',
        waTextEn: 'Please tell me when the 6-Month Premium plan becomes available'
      }
    ]
  };

  PEL_PLANS.getByCode = function (code) {
    for (var i = 0; i < PEL_PLANS.plans.length; i++) {
      if (PEL_PLANS.plans[i].code === code) return PEL_PLANS.plans[i];
    }
    return null;
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
    return 'https://wa.me/' + PEL_PLANS.contact +
      '?text=' + encodeURIComponent(text);
  };

  global.PEL_PLANS = PEL_PLANS;
})(window);
