/* ============================================================================
   PEL DAILY LESSON - shared "Lesson of the Day" data.
   Loaded (deferred) by index.html (landing strip) and app.html (featured pick).
   Both pages always show the SAME daily lesson, so the rotation lives here
   in one place and is keyed off the real UTC day index.

   Every academy id and lesson slug below was extracted from app.html
   (ACADEMIES + the academy->lesson order map + LESSON_TITLE_BANK), so
   openLesson(academy, lesson) always resolves to a real lesson, and every
   featured lesson carries a real bilingual (en/ar) title.

   API:  window.PEL_DAILY.featured()
   -> { academy:{id,en,ar}, lesson:{id,en,ar} }   (or null)
   ============================================================================ */
(function () {
  'use strict';

  var ACADEMIES = {
  "english-foundations": {
    "id": "english-foundations",
    "en": "English Foundations",
    "ar": "اساسيات الانجليزي"
  },
  "everyday-english": {
    "id": "everyday-english",
    "en": "Everyday English",
    "ar": "انجليزي الحياة اليومية"
  },
  "american-conversations": {
    "id": "american-conversations",
    "en": "American Conversations",
    "ar": "المحادثات الامريكية"
  },
  "american-accent-lab": {
    "id": "american-accent-lab",
    "en": "American Accent Lab",
    "ar": "مختبر اللكنة الامريكية"
  },
  "vocabulary-vault": {
    "id": "vocabulary-vault",
    "en": "Vocabulary Vault",
    "ar": "خزنة المفردات"
  },
  "travel-english": {
    "id": "travel-english",
    "en": "Travel English",
    "ar": "انجليزي السفر"
  },
  "workplace-communication": {
    "id": "workplace-communication",
    "en": "Workplace Communication",
    "ar": "التواصل بالدوام"
  },
  "job-interview-academy": {
    "id": "job-interview-academy",
    "en": "Job Interview Academy",
    "ar": "اكاديمية مقابلات العمل"
  },
  "airport-english": {
    "id": "airport-english",
    "en": "Airport English",
    "ar": "انجليزي المطار"
  },
  "coffee-shop-english": {
    "id": "coffee-shop-english",
    "en": "Coffee Shop English",
    "ar": "انجليزي الكوفي"
  },
  "hotel-english": {
    "id": "hotel-english",
    "en": "Hotel English",
    "ar": "انجليزي الفنادق"
  },
  "hospital-english": {
    "id": "hospital-english",
    "en": "Hospital English",
    "ar": "انجليزي المستشفى"
  },
  "shopping-english": {
    "id": "shopping-english",
    "en": "Shopping English",
    "ar": "انجليزي التسوق"
  }
};

  var ACADEMY_LESSONS = {
  "english-foundations": [
    "introducing-yourself"
  ],
  "everyday-english": [
    "meeting-someone-new",
    "talking-family",
    "weekend-plans"
  ],
  "american-conversations": [
    "talking-with-friends"
  ],
  "american-accent-lab": [
    "introducing-yourself"
  ],
  "vocabulary-vault": [
    "introducing-yourself"
  ],
  "travel-english": [
    "going-to-airport"
  ],
  "workplace-communication": [
    "first-day-work"
  ],
  "job-interview-academy": [
    "first-day-work"
  ],
  "airport-english": [
    "going-to-airport"
  ],
  "coffee-shop-english": [
    "ordering-coffee"
  ],
  "hotel-english": [
    "booking-hotel"
  ],
  "hospital-english": [
    "doctor-appointment"
  ],
  "shopping-english": [
    "shopping-clothes"
  ]
};

  var TITLES = {
  "meeting-someone-new": {
    "en": "Meeting Someone New",
    "ar": "التعرف على شخص جديد"
  },
  "ordering-coffee": {
    "en": "Ordering Coffee",
    "ar": "طلب قهوة"
  },
  "talking-with-friends": {
    "en": "Talking With Friends",
    "ar": "السوالف مع الاصحاب"
  },
  "introducing-yourself": {
    "en": "Introducing Yourself",
    "ar": "تعرف بنفسك"
  },
  "going-to-airport": {
    "en": "Going To The Airport",
    "ar": "الذهاب للمطار"
  },
  "booking-hotel": {
    "en": "Booking A Hotel",
    "ar": "حجز فندق"
  },
  "calling-customer-service": {
    "en": "Calling Customer Service",
    "ar": "الاتصال بخدمة العملا"
  },
  "doctor-appointment": {
    "en": "Making A Doctor Appointment",
    "ar": "حجز موعد عند الدكتور"
  },
  "shopping-clothes": {
    "en": "Shopping For Clothes",
    "ar": "شرا ملابس"
  },
  "first-day-work": {
    "en": "First Day At Work",
    "ar": "اول يوم بالدوام"
  },
  "talking-family": {
    "en": "Talking About Your Family",
    "ar": "تتكلم عن عايلتك"
  },
  "weekend-plans": {
    "en": "Weekend Plans",
    "ar": "خطط الويكند"
  }
};

  var ORDER = ["english-foundations", "everyday-english", "american-conversations", "american-accent-lab", "vocabulary-vault", "travel-english", "workplace-communication", "job-interview-academy", "airport-english", "coffee-shop-english", "hotel-english", "hospital-english", "shopping-english"];

  function dayIndex(){ return Math.floor(Date.now() / 86400000); }

  function featured(){
    if(!ORDER.length) return null;
    var d = dayIndex();
    var aid = ORDER[d % ORDER.length];
    var list = ACADEMY_LESSONS[aid] || [];
    if(!list.length) return null;
    var slug = list[d % list.length];
    var ac = ACADEMIES[aid] || { id: aid, en: aid, ar: aid };
    var t = TITLES[slug];
    if(!t){
      var pretty = slug.replace(/-/g, ' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      t = { en: pretty, ar: pretty };
    }
    return {
      academy: { id: aid, en: ac.en, ar: ac.ar },
      lesson:  { id: slug, en: t.en, ar: t.ar }
    };
  }

  window.PEL_DAILY = { featured: featured, count: ORDER.length, version: '3.1' };
})();
