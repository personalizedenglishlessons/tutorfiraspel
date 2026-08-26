/* ============================================================
   PEL ADMIN + TEACHER CONTROL SYSTEM
   Vanilla JS, same architecture as the student app. The browser
   is UNTRUSTED: every sensitive read/write goes through
   SECURITY DEFINER RPCs + RLS. These helpers are UX only.
   ============================================================ */
(function(){
'use strict';

/* ============================================================
   0. CONSTANTS + CLIENT
   ============================================================ */
var SUPABASE_URL = 'https://lewoochehpiycocvfwtz.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29vY2hlaHBpeWNvY3Zmd3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ3MzcsImV4cCI6MjA5OTY1MDczN30.sIWK6jwX7PW70fH0yPUuhOb25N1lBw2-Cvb3dtwDb9Y';
var supabase = null;
function client(){
  if(supabase) return supabase;
  if(window.supabase) supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

/* ============================================================
   1. STATE
   ============================================================ */
var me = { id:null, name:'', email:'', role:'student', perms:[] };
var lang = 'en';
var viewState = {};
var current360 = null;   // loaded admin_student_360 bundle
var current360Uid = null;

/* ============================================================
   2. I18N - single-language admin screens (ar RTL / en LTR)
   ============================================================ */
var I = {
  'overview':{en:'Overview', ar:'نظرة عامة'},
  'people':{en:'People', ar:'الاشخاص'},
  'learning':{en:'Learning', ar:'التعلم'},
  'operations':{en:'Operations', ar:'العمليات'},
  'trust':{en:'Trust', ar:'الموثوقية'},
  'students':{en:'Students', ar:'الطلاب'},
  'teachers':{en:'Teachers', ar:'المعلمين'},
  'groups':{en:'Groups', ar:'المجموعات'},
  'courses':{en:'Courses', ar:'المسارات'},
  'interventions':{en:'Interventions', ar:'التدخلات'},
  'classes':{en:'Live Classes', ar:'الدروس المباشرة'},
  'programs':{en:'Programs', ar:'البرامج'},
  'certificates':{en:'Certificates', ar:'الشهادات'},
  'audit':{en:'Audit Log', ar:'سجل التدقيق'},
  'roles':{en:'Access & Roles', ar:'الادوار والصلاحيات'},
  'health':{en:'System Health', ar:'صحة النظام'},
  'reports':{en:'Reports', ar:'التقارير'},
  'searchPlaceholder':{en:'Search name, email, phone, ID…', ar:'ابحث بالاسم او الايميل او الجوال…'},
  'status':{en:'Status', ar:'الحالة'},
  'level':{en:'Level', ar:'المستوى'},
  'program':{en:'Program', ar:'البرنامج'},
  'teacher':{en:'Teacher', ar:'المعلم'},
  'group':{en:'Group', ar:'المجموعة'},
  'certStatus':{en:'Certificate', ar:'الشهادة'},
  'all':{en:'All', ar:'الكل'},
  'sort':{en:'Sort', ar:'الترتيب'},
  'name':{en:'Name', ar:'الاسم'},
  'email':{en:'Email', ar:'البريد'},
  'xp':{en:'XP', ar:'نقاط'},
  'streak':{en:'Streak', ar:'الاستمرار'},
  'progress':{en:'Progress', ar:'التقدم'},
  'lastActive':{en:'Last active', ar:'اخر نشاط'},
  'certs':{en:'Certs', ar:'شهادات'},
  'attention':{en:'Attention', ar:'يحتاج انتباه'},
  'openStudent':{en:'Open student', ar:'فتح الطالب'},
  'noResults':{en:'No students match these filters.', ar:'لا يوجد طلاب مطابقين.'},
  'new':{en:'New', ar:'جديد'}, 'active':{en:'Active', ar:'نشط'}, 'stalled':{en:'Stalled', ar:'متوقف'}, 'inactive':{en:'Inactive', ar:'غير نشط'}, 'suspended':{en:'Suspended', ar:'موقوف'},
  'issued':{en:'Issued', ar:'مصدرة'}, 'revoked':{en:'Revoked', ar:'ملغاة'}, 'reissued':{en:'Reissued', ar:'اعيد اصدارها'}, 'draft':{en:'Draft', ar:'مسودة'},
  'present':{en:'Present', ar:'حاضر'}, 'absent':{en:'Absent', ar:'غايب'}, 'late':{en:'Late', ar:'متاخر'}, 'excused':{en:'Excused', ar:'بعذر'},
  'scheduled':{en:'Scheduled', ar:'مجدول'}, 'completed':{en:'Completed', ar:'مكتمل'}, 'cancelled':{en:'Cancelled', ar:'ملغي'}, 'rescheduled':{en:'Rescheduled', ar:'اعيدت جدولته'},
  'needsAttention':{en:'Needs attention', ar:'يحتاج انتباه'},
  'inactiveReason':{en:'No activity for %d days', ar:'لا نشاط منذ %d يوم'},
  'missedLiveReason':{en:'%d missed live sessions (30d)', ar:'%d دروس مباشرة مفقودة (٣٠ يوم)'},
  'expiringReason':{en:'Program ends in %d days', ar:'ينتهي البرنامج خلال %d يوم'},
  'whatShouldIDo':{en:'What should I do?', ar:'ماذا افعل الان؟'},
  'studentsTotal':{en:'Total students', ar:'اجمالي الطلاب'},
  'activeStudents':{en:'Active (7d)', ar:'نشط (٧ ايام)'},
  'newStudents':{en:'New (30d)', ar:'جدد (٣٠ يوم)'},
  'stalledStudents':{en:'Stalled', ar:'متوقفون'},
  'avgProgress':{en:'Avg lessons', ar:'متوسط الدروس'},
  'certsIssued':{en:'Certificates', ar:'الشهادات'},
  'teachersCount':{en:'Teachers', ar:'المعلمين'},
  'groupsCount':{en:'Active groups', ar:'المجموعات النشطة'},
  'upcomingClasses':{en:'Upcoming classes', ar:'الدروس القادمة'},
  'expiringPrograms':{en:'Programs expiring (14d)', ar:'برامج تنتهي (١٤ يوم)'},
  'recentCompletions':{en:'Recent completions', ar:'اخر الانجازات'},
  'recentCerts':{en:'Recent certificates', ar:'اخر الشهادات'},
  'courseDistribution':{en:'Current course distribution', ar:'توزيع المسارات الحالية'},
  'recentAudit':{en:'Recent admin actions', ar:'اخر اجراوات الادارة'},
  'noData':{en:'No data yet', ar:'لا توجد بيانات بعد'},
  'back':{en:'Back', ar:'رجوع'},
  'signOut':{en:'Sign out', ar:'تسجيل الخروج'},
  'forbiddenTitle':{en:'Access denied', ar:'الوصول مرفوض'},
  'forbiddenText':{en:'Your account does not have admin or teacher access.', ar:'حسابك ليس لديه صلاحية الادارة او التدريس.'},
  'today':{en:'today', ar:'اليوم'}, 'yesterday':{en:'yesterday', ar:'امس'}, 'daysAgo':{en:'%d days ago', ar:'قبل %d يوم'},
  'loading':{en:'Loading…', ar:'جارٍ التحميل…'},
  'saved':{en:'Saved', ar:'تم الحفظ'},
  'save':{en:'Save', ar:'حفظ'},
  'cancel':{en:'Cancel', ar:'الغا'},
  'close':{en:'Close', ar:'اغلاق'},
  'create':{en:'Create', ar:'انشا'},
  'edit':{en:'Edit', ar:'تعديل'},
  'errorGeneric':{en:'Something went wrong. Try again.', ar:'حدث خطا. حاول مرة اخرى.'},
  'noPermission':{en:'You do not have permission for this action.', ar:'ليس لديك صلاحية لهذا الاجرا.'},
  'verifyCode':{en:'Verify code', ar:'تحقق من الرمز'},
  'code':{en:'Code', ar:'الرمز'},
  'issuedAt':{en:'Issued', ar:'صدرت في'},
  'revokeReason':{en:'Reason for revocation', ar:'سبب الالغا'},
  'revoke':{en:'Revoke', ar:'الغا'},
  'reissue':{en:'Reissue', ar:'اعادة اصدار'},
  'issueCert':{en:'Issue certificate', ar:'اصدار شهادة'},
  'manualRecipient':{en:'Manual recipient (no account)', ar:'مستلم يدوي (بدون حساب)'},
  'existingStudent':{en:'Existing student', ar:'طالب مسجل'},
  'academy':{en:'Academy / course', ar:'الاكاديمية / المسار'},
  'completionDate':{en:'Completion date', ar:'تاريخ الاكمال'},
  'issueDate':{en:'Issue date', ar:'تاريخ الاصدار'},
  'studentName':{en:'Full name', ar:'الاسم الكامل'},
  'levelField':{en:'Level (A1-C1)', ar:'المستوى (A1-C1)'},
  'programName':{en:'Program name', ar:'اسم البرنامج'},
  'issue':{en:'Issue', ar:'اصدار'},
  'certIssued':{en:'Certificate issued', ar:'تم اصدار الشهادة'},
  'certPreview':{en:'Preview', ar:'معاينة'},
  'certRevoked':{en:'Certificate revoked', ar:'تم الغا الشهادة'},
  'certReissued':{en:'Certificate reissued', ar:'تمت اعادة اصدار الشهادة'},
  'verifyResult':{en:'Verification result', ar:'نتيجة التحقق'},
  'valid':{en:'Valid', ar:'صالحة'}, 'invalid':{en:'Invalid / revoked', ar:'غير صالحة / ملغاة'},
  'print':{en:'Print', ar:'طباعة'},
  'blocked':{en:'Popup blocked. Allow popups for this site to print.', ar:'تم حظر النافذة المنبثقة. اسمح بالنوافذ المنبثقة لهذا الموقع للطباعة.'},
  'student360':{en:'Student 360', ar:'ملف الطالب'},
  'profile':{en:'Profile', ar:'الملف'},
  'learningHealth':{en:'Learning health', ar:'صحة التعلم'},
  'skills':{en:'Skills', ar:'المهارات'},
  'personalization':{en:'Personalization', ar:'التخصيص'},
  'recommendations':{en:'Recommendations', ar:'التوصيات'},
  'timeline':{en:'Timeline', ar:'الخط الزمني'},
  'notes':{en:'Notes', ar:'ملاحظات'},
  'activity':{en:'Live & activity', ar:'النشاط والدروس المباشرة'},
  'interventionList':{en:'Interventions', ar:'التدخلات'},
  'addNote':{en:'Add note', ar:'اضافة ملاحظة'},
  'noteBody':{en:'Note…', ar:'الملاحظة…'},
  'assignIntervention':{en:'Assign intervention', ar:'اسناد تدخل'},
  'overrideRec':{en:'Override recommendation', ar:'تجاوز التوصية'},
  'overrideReason':{en:'Reason for override', ar:'سبب التجاوز'},
  'replacement':{en:'Replacement activity / lesson', ar:'البديل / الدرس البديل'},
  'whyPEL':{en:'Why PEL recommends this', ar:'لماذا يوصي بيل بهذا'},
  'todayRec':{en:'Current recommendation', ar:'التوصية الحالية'},
  'takeSnapshot':{en:'Save monthly snapshot', ar:'حفظ لقطة شهرية'},
  'snapshotSaved':{en:'Snapshot saved', ar:'تم حفظ اللقطة'},
  'preview':{en:'View student experience', ar:'معاينة تجربة الطالب'},
  'previewNote':{en:'Read-only preview - nothing on the student account changes.', ar:'معاينة للقراوة فقط - لا يحدث اي تغيير على حساب الطالب.'},
  'weakAreas':{en:'Weak areas', ar:'المواضع الضعيفة'},
  'strongAreas':{en:'Strong areas', ar:'المواضع القوية'},
  'mainDifficulty':{en:'Main difficulty', ar:'الاكثر صعوبة'},
  'mainStrength':{en:'Strength', ar:'نقطة القوة'},
  'currentConcern':{en:'Current concern', ar:'القلق الحالي'},
  'recommendedFocus':{en:'Recommended focus', ar:'التركيز الموصى به'},
  'whyRoute':{en:'Why PEL built this route', ar:'لماذا بنى بيل هذا المسار'},
  'routeDuration':{en:'Estimated route duration', ar:'المدة التقديرية للمسار'},
  'remainingStage':{en:'%d lessons left in current stage', ar:'باقي %d درس في المرحلة الحالية'},
  'goal':{en:'Learning goal', ar:'هدف التعلم'},
  'target':{en:'Target', ar:'الهدف'},
  'dailyMin':{en:'Daily minutes', ar:'الدقايق اليومية'},
  'weeklyFreq':{en:'Days per week', ar:'ايام في الاسبوع'},
  'outcome':{en:'Desired outcome', ar:'النتيجة المرغوبة'},
  'contexts':{en:'Real-life contexts', ar:'المواقف الحقيقية'},
  'weaknesses':{en:'Self-reported weaknesses', ar:'نقاط الضعف المذكورة'},
  'enrolled':{en:'Enrolled', ar:'التسجيل'},
  'phone':{en:'Phone', ar:'الجوال'},
  'whatsapp':{en:'WhatsApp', ar:'واتساب'},
  'enrollmentDate':{en:'Enrollment date', ar:'تاريخ التسجيل'},
  'intake':{en:'Intake', ar:'الدفعة'},
  'role':{en:'Role', ar:'الدور'},
  'programRemaining':{en:'Program time remaining', ar:'المدة المتبقية'},
  'sessionsIncluded':{en:'Included', ar:'المشمولة'},
  'sessionsUsed':{en:'Used', ar:'المستخدمة'},
  'sessionsRemaining':{en:'Remaining', ar:'المتبقية'},
  'daysLeft':{en:'%d days left', ar:'باقي %d يوم'},
  'expired':{en:'Expired', ar:'منتهي'}, 'expiring':{en:'Expiring', ar:'ينتهي قريبا'},
  'attendance':{en:'Attendance', ar:'الحضور'},
  'attendanceRate':{en:'Attendance rate', ar:'نسبة الحضور'},
  'sessionDate':{en:'Date', ar:'التاريخ'}, 'time':{en:'Time', ar:'الوقت'},
  'topic':{en:'Topic', ar:'الموضوع'},
  'groupName':{en:'Group', ar:'المجموعة'},
  'capacity':{en:'Capacity', ar:'السعة'},
  'roster':{en:'Roster', ar:'القايمة'},
  'waitlist':{en:'Waitlist', ar:'قايمة الانتظار'},
  'availableSeats':{en:'%d seats left', ar:'باقي %d مقاعد'},
  'groupFull':{en:'Group is full', ar:'المجموعة ممتلية'},
  'moveFromWaitlist':{en:'Move into group', ar:'نقل للمجموعة'},
  'addStudent':{en:'Add student', ar:'اضافة طالب'},
  'newStudent':{en:'New student', ar:'طالب جديد'},
  'createStudentAccount':{en:'Create student account', ar:'انشاء حساب طالب'},
  'password':{en:'Password', ar:'كلمة المرور'},
  'passwordHint':{en:'At least 8 characters', ar:'٨ احرف على الاقل'},
  'showPassword':{en:'Show', ar:'عرض'},
  'hidePassword':{en:'Hide', ar:'اخفاء'},
  'studentCreated':{en:'Student account created', ar:'تم انشاء حساب الطالب'},
  'removeStudent':{en:'Remove', ar:'ازالة'},
  'assignTeacher':{en:'Assign teacher', ar:'اسناد معلم'},
  'schedule':{en:'Schedule', ar:'الجدول'},
  'programCatalog':{en:'Programs & subscriptions', ar:'البرامج والاشتراكات'},
  'newProgram':{en:'New program', ar:'برنامج جديد'},
  'newSubscription':{en:'New subscription', ar:'اشتراك جديد'},
  'durationMonths':{en:'Duration (months)', ar:'المدة (شهور)'},
  'includedSessions':{en:'Included live sessions', ar:'الدروس المباشرة المشمولة'},
  'price':{en:'Price', ar:'السعر'},
  'startDate':{en:'Start date', ar:'تاريخ البداية'},
  'endDate':{en:'End date', ar:'تاريخ النهاية'},
  'subStatus':{en:'Subscription', ar:'الاشتراك'},
  'subscriptions':{en:'Subscriptions', ar:'الاشتراكات'},
  'newClass':{en:'New live class', ar:'درس مباشر جديد'},
  'markAttendance':{en:'Mark attendance', ar:'تسجيل الحضور'},
  'markClass':{en:'Mark class status', ar:'تحديث حالة الدرس'},
  'student':{en:'Student', ar:'الطالب'},
  'action':{en:'Action', ar:'الاجرا'},
  'actor':{en:'Actor', ar:'المنفذ'},
  'target':{en:'Target', ar:'الهدف'},
  'when':{en:'When', ar:'متى'},
  'check':{en:'Check', ar:'الفحص'},
  'healthy':{en:'Healthy', ar:'سليم'},
  'issues':{en:'Issues', ar:'مشاكل'},
  'report':{en:'Report', ar:'التقرير'},
  'exportCSV':{en:'Export CSV', ar:'تصدير CSV'},
  'selectedReport':{en:'Choose a report', ar:'اختر تقرير'},
  'generateSnapshot':{en:'Snapshot history', ar:'سجل اللقطات'},
  'noPlan':{en:'No learning plan yet', ar:'لا توجد خطة تعلم بعد'},
  'est':{en:'Est. %d min', ar:'تقريبا %d دقيقة'},
  'lessonsDone':{en:'%d lessons done', ar:'%d درس منجز'},
  'ofRoute':{en:'of route', ar:'من المسار'},
  'nextLesson':{en:'Next lesson', ar:'الدرس القادم'},
  'stage':{en:'Stage', ar:'المرحلة'},
  'totalLessons':{en:'Total lessons', ar:'اجمالي الدروس'},
  'completedCount':{en:'Completed lessons', ar:'الدروس المنجزة'},
  'lastStudy':{en:'Last study day', ar:'اخر يوم دراسة'},
  'longestStreak':{en:'Longest streak', ar:'اطول استمرار'},
  'permissionDenied':{en:'Permission denied.', ar:'صلاحية مرفوضة.'},
  'confirmAction':{en:'Confirm action', ar:'تاكيد الاجرا'},
  'createGroup':{en:'New group', ar:'مجموعة جديدة'},
  'editGroup':{en:'Edit group', ar:'تعديل المجموعة'},
  'newTeacher':{en:'New teacher', ar:'معلم جديد'},
  'youAreViewing':{en:'You are viewing', ar:'انت تشاهد'},
  'studentOf':{en:'Student', ar:'طالب'},
  'teacherOf':{en:'Teacher', ar:'معلم'},
  'adminOf':{en:'Administrator', ar:'ادمين'},
  'superAdminOf':{en:'Super admin', ar:'مشرف عام'},
  'langLabel':{en:'Interface', ar:'الواجهة'},
  'required':{en:'Required', ar:'مطلوب'},
  'noCertificates':{en:'No certificates yet', ar:'لا توجد شهادات بعد'},
  'noInterventions':{en:'No interventions yet', ar:'لا توجد تدخلات بعد'},
  'noNotes':{en:'No notes yet', ar:'لا توجد ملاحظات بعد'},
  'noSubscriptions':{en:'No program subscription yet', ar:'لا يوجد اشتراك برنامج بعد'},
  'noAttendance':{en:'No live class records yet', ar:'لا توجد سجلات دروس مباشرة بعد'},
  'noTimeline':{en:'No activity recorded yet', ar:'لا يوجد نشاط مسجل بعد'},
  'noRecommendations':{en:'No stored recommendations yet', ar:'لا توجد توصيات محفوظة بعد'},
  'attentionLabel':{en:'Only attention', ar:'الانتباه فقط'},
  'apply':{en:'Apply', ar:'تطبيق'},
  'reset':{en:'Reset', ar:'مسح'},
  'loadMore':{en:'Load more', ar:'المزيد'},
  'prev':{en:'Prev', ar:'السابق'},
  'next':{en:'Next', ar:'التالي'},
  'pageOf':{en:'Page %p of %t', ar:'صفحة %p من %t'},
  'totalRow':{en:'%n results', ar:'%n نتيجة'},
  'assign':{en:'Assign', ar:'اسناد'},
  'acceptRec':{en:'Accept & assign', ar:'قبول واسناد'},
  'dismissRec':{en:'Dismiss', ar:'تجاهل'},
  'replacementLesson':{en:'Replacement lesson', ar:'الدرس البديل'},
  'strengthWord':{en:'Strength', ar:'قوة'},
  'weekday_0':{en:'Sun',ar:'الاحد'},'weekday_1':{en:'Mon',ar:'الاثنين'},'weekday_2':{en:'Tue',ar:'الثلاثا'},'weekday_3':{en:'Wed',ar:'الاربعا'},'weekday_4':{en:'Thu',ar:'الخميس'},'weekday_5':{en:'Fri',ar:'الجمعة'},'weekday_6':{en:'Sat',ar:'السبت'},
  'course':{en:'Course', ar:'المسار'},
  'memberCount':{en:'Members', ar:'الاعضا'},
  'members':{en:'Members', ar:'الاعضا'},
  'paused':{en:'Paused', ar:'متوقف موقتا'},
  'archived':{en:'Archived', ar:'مورشف'},
  'startTime':{en:'Start', ar:'البداية'},
  'duration':{en:'Duration', ar:'المدة'},
  'sessionsUsed':{en:'Used', ar:'المستخدمة'},
  'sessionsRemaining':{en:'Remaining', ar:'المتبقية'},
  'changeRole':{en:'Change role', ar:'تغيير الدور'},
  'confirmChange':{en:'Are you sure? This is recorded in the audit log.', ar:'متاكد؟ سيتم تسجيل ذلك في سجل التدقيق.'},
  'refresh':{en:'Refresh', ar:'تحديث'},
  'checks':{en:'Checks', ar:'الفحوصات'},
  'type':{en:'Type', ar:'النوع'},
  'createdAt':{en:'Created', ar:'انشي في'},
  'date':{en:'Date', ar:'التاريخ'},
  'openStatus':{en:'Open', ar:'مفتوح'},
  'inProgress':{en:'In progress', ar:'قيد التنفيذ'},
  'pendingReview':{en:'Pending review', ar:'بانتظار المراجعة'},
  'roleStudent':{en:'Student', ar:'طالب'},
  'roleTeacher':{en:'Teacher', ar:'معلم'},
  'roleAdmin':{en:'Administrator', ar:'ادمين'},
  'roleSuperAdmin':{en:'Super admin', ar:'مشرف عام'},
  'report_students':{en:'Students roster', ar:'قايمة الطلاب'},
  'report_certificates':{en:'Certificates', ar:'الشهادات'},
  'report_attendance':{en:'Attendance', ar:'الحضور'},
  'report_programs':{en:'Program subscriptions', ar:'اشتراكات البرامج'},
  'report_classes':{en:'Live classes', ar:'الدروس المباشرة'},
  'report_atrisk':{en:'At-risk students', ar:'الطلاب المعرضون للخطر'},
  'atRisk':{en:'At risk', ar:'معرض للخطر'},
  'openGroup':{en:'Open group', ar:'فتح المجموعة'},
  'studentName':{en:'Student', ar:'الطالب'},
  'activePrograms':{en:'Active programs', ar:'البرامج النشطة'},
  'totalSubscriptions':{en:'Subscriptions', ar:'الاشتراكات'},
  'weeks':{en:'%d w', ar:'%d اسابيع'},
  'lessonCount':{en:'%d lessons', ar:'%d درس'},
  'minutes':{en:'%d min', ar:'%d دقيقة'},
  'levels':{en:'Level %s', ar:'المستوى %s'},
  'diffBeginner':{en:'Beginner', ar:'مبتدي'},
  'diffIntermediate':{en:'Intermediate', ar:'متوسط'},
  'diffAdvanced':{en:'Advanced', ar:'متقدم'},
  'diffAll':{en:'All levels', ar:'كل المستويات'},
'academyCount':{en:'%d academies', ar:'%d اكاديميات'},
  'lesson':{en:'Lesson', ar:'درس'},
  'noCourses':{en:'No course data available.', ar:'لا توجد بيانات مسارات.'},
  'lessonsManagerSub':{en:'Add, edit, reorder and hide lessons - changes reach every student instantly.', ar:'اضف وعدل ورتب واخفي الدروس - التغييرات توصل لكل طالب فوراً.'},
  'newAcademy':{en:'New academy', ar:'اكاديمية جديدة'},
  'newLesson':{en:'New lesson', ar:'درس جديد'},
  'editAcademy':{en:'Edit academy', ar:'تعديل الاكاديمية'},
  'editLesson':{en:'Edit lesson', ar:'تعديل الدرس'},
  'titleEn':{en:'Title (English)', ar:'العنوان (انجليزي)'},
  'titleAr':{en:'Title (Arabic)', ar:'العنوان (عربي)'},
  'minutesLabel':{en:'Minutes', ar:'الدقايق'},
  'difficulty':{en:'Difficulty', ar:'الصعوبة'},
  'iconLabel':{en:'Icon', ar:'الايقونة'},
  'colorFrom':{en:'Gradient from', ar:'التدرج من'},
  'colorTo':{en:'Gradient to', ar:'التدرج الى'},
  'hidden':{en:'Hidden', ar:'مخفي'},
  'show':{en:'Show', ar:'اظهار'},
  'hide':{en:'Hide', ar:'اخفا'},
  'unlink':{en:'Remove', ar:'ازالة'},
  'moveUp':{en:'Move up', ar:'لاعلى'},
  'moveDown':{en:'Move down', ar:'لاسفل'},
  'academy':{en:'Academy', ar:'الاكاديمية'},
  'confirmUnlink':{en:'Remove this lesson from this academy? Students lose access to it there.', ar:'ازالة هذا الدرس من الاكاديمية؟ الطلاب يفقدون الوصول له هنا.'},
  'lessonSaved':{en:'Lesson saved.', ar:'تم حفظ الدرس.'},
  'curriculumUpdated':{en:'Curriculum updated.', ar:'تم تحديث المنهج.'},
  'select':{en:'Select', ar:'اختيار'},
  'open':{en:'Open', ar:'مفتوح'},
  'in_progress':{en:'In progress', ar:'قيد التنفيذ'},
  'resolved':{en:'Resolved', ar:'محلول'},
'm':{en:'',ar:''},
  'plans':{en:'Plans', ar:'الباقات'},
  'announcements':{en:'Announcements', ar:'الاعلانات'},
  'plan':{en:'Plan & Access', ar:'الباقة والوصول'},
  'activePlans':{en:'Active plans', ar:'باقات نشطة'},
  'expiringSoon':{en:'Expiring soon (7d)', ar:'تنتهي قريباً (٧ ايام)'},
  'expiredPlans':{en:'Expired plans', ar:'باقات منتهية'},
  'scheduledPlans':{en:'Scheduled plans', ar:'باقات مجدولة'},
  'suspendedPlans':{en:'Suspended plans', ar:'باقات موقوفة'},
  'expired':{en:'Expired', ar:'منتهية'},
  'daysLeft':{en:'%d days left', ar:'متبقي %d يوم'},
  'noPlan':{en:'No plan', ar:'بدون باقة'},
  'assignPlan':{en:'Assign plan', ar:'اسناد باقة'},
  'newPlan':{en:'New plan', ar:'باقة جديدة'},
  'planCatalog':{en:'Plan catalog', ar:'كتالوج الباقات'},
  'perPlan':{en:'per plan', ar:'لكل باقة'},
  'savePlan':{en:'Save plan', ar:'حفظ الباقة'},
  'planHistory':{en:'Plan history', ar:'سجل الباقات'},
  'liveClasses':{en:'Live classes', ar:'الدروس المباشرة'},
  'upcoming':{en:'Upcoming', ar:'القادمة'},
  'recent':{en:'Recent', ar:'الاخيرة'},
  'durationDays':{en:'Duration (days)', ar:'المدة (ايام)'},
  'price':{en:'Price', ar:'السعر'},
  'currency':{en:'Currency', ar:'العملة'},
  'weeklyLive':{en:'Weekly live sessions', ar:'حصص مباشرة اسبوعياً'},
  'platformAccess':{en:'Platform access', ar:'وصول المنصة'},
  'extend':{en:'Extend', ar:'تمديد'},
  'extendDays':{en:'Extend +%d days', ar:'تمديد +%d يوم'},
  'suspend':{en:'Suspend', ar:'ايقاف'},
  'reactivate':{en:'Reactivate', ar:'اعادة تفعيل'},
  'reason':{en:'Reason', ar:'السبب'},
  'announcementDelivery':{en:'Delivery', ar:'الوصول'},
  'newAnnouncement':{en:'New announcement', ar:'اعلان جديد'},
  'title':{en:'Title', ar:'العنوان'},
  'message':{en:'Message', ar:'الرسالة'},
  'audience':{en:'Audience', ar:'الجمهور'},
  'everyone':{en:'All students', ar:'كل الطلاب'},
  'specificStudents':{en:'Specific students', ar:'طلاب محددون'},
  'selectStudents':{en:'Select students', ar:'اختر الطلاب'},
  'priority':{en:'Priority', ar:'الاولوية'},
  'important':{en:'Important', ar:'مهم'},
  'normal':{en:'Normal', ar:'عادي'},
  'send':{en:'Send', ar:'ارسال'},
  'deliveryStats':{en:'Delivery stats', ar:'احصاييات الوصول'},
  'deliveredTo':{en:'Delivered to %d students', ar:'وصل لـ %d طالب'},
  'readCount':{en:'Read', ar:'مقرو'},
  'unreadCount':{en:'Unread', ar:'غير مقرو'},
  'noAnnouncements':{en:'No announcements yet.', ar:'لا توجد اعلانات بعد.'},
  'link':{en:'Link', ar:'رابط'},
  'scheduleFor':{en:'Schedule for (optional)', ar:'جدولة (اختياري)'},
  'expiresAt':{en:'Expires at (optional)', ar:'انتها الصلاحية (اختياري)'},
  'choosePlan':{en:'Choose plan', ar:'اختر الباقة'},
  'sessionsUsed':{en:'Sessions used', ar:'الحصص المستخدمة'},
  'sessionsIncluded':{en:'included', ar:'مشمولة'},
  'searchStudents':{en:'Search students…', ar:'ابحث عن طلاب…'},
  'planChanges':{en:'Plan changes', ar:'تغييرات الباقة'},
  'reactivated':{en:'Reactivated', ar:'اعيد تفعيلها'},
  'assigned':{en:'Assigned', ar:'اسندت'},
  'extended':{en:'Extended', ar:'مددت'},
  'scheduledLbl':{en:'Scheduled', ar:'مجدولة'},
  'planNote':{en:'Access expires automatically on the end date (server-enforced). Renewing never resets progress.', ar:'ينتهي الوصول تلقايياً بتاريخ النهاية (تطبيق من الخادم). التجديد لا يمسّ تقدمك.'},
  'notificationSent':{en:'Announcement sent.', ar:'تم ارسال الاعلان.'},
  'planSaved':{en:'Plan saved.', ar:'تم حفظ الباقة.'},
  'planAssigned':{en:'Plan assigned.', ar:'تم اسناد الباقة.'},
  'planExtended':{en:'Plan extended.', ar:'تم تمديد الباقة.'},
  'planStatusChanged':{en:'Plan status updated.', ar:'تم تحديث حالة الباقة.'},
  'entLabel':{en:'Entitlement', ar:'الباقة'},
  'entAny':{en:'All entitlements', ar:'كل الحالات'},
  'entExpiring7':{en:'Expiring ≤7 days', ar:'ينتهي خلال ٧ ايام'},
  'entExpiring30':{en:'Expiring ≤30 days', ar:'ينتهي خلال ٣٠ يوم'},
  'entExpired':{en:'Expired', ar:'منتهية'},
  'entNoPlan':{en:'No plan', ar:'بدون باقة'},
  'entSuspended':{en:'Suspended', ar:'موقوفة'},
  'seeAll':{en:'See all', ar:'عرض الكل'},
};
function t(k){
  var e = I[k];
  return e ? (lang === 'ar' ? (e.ar || e.en) : (e.en || e.ar)) : k;
}

/* ============================================================
   3. LOW-LEVEL HELPERS
   ============================================================ */
function $(id){ return document.getElementById(id); }
function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmtDate(iso){
  if(!iso) return '-';
  var d = new Date(iso);
  if(isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {year:'numeric', month:'short', day:'numeric'});
}
function fmtDateShort(iso){
  if(!iso) return '-';
  var d = new Date(iso);
  if(isNaN(d.getTime())) return String(iso);
  return d.toISOString ? d.toISOString().slice(0,10) : iso;
}
function relTime(iso){
  if(!iso) return '-';
  var diff = (Date.now() - new Date(iso).getTime()) / 86400000;
  if(diff < 1) return t('today');
  if(diff < 2) return t('yesterday');
  return t('daysAgo').replace('%d', Math.floor(diff));
}
function rpcErrMsg(r){ var e = r && r.error; return (e && (e.message || String(e))) || t('errorGeneric'); }
function statusChip(status){
  var map = { active:'green', new:'gold', stalled:'warn', inactive:'muted', suspended:'red',
              issued:'green', revoked:'red', reissued:'gold', draft:'muted',
              present:'green', absent:'red', late:'warn', excused:'bronze',
              scheduled:'bronze', completed:'green', cancelled:'red', rescheduled:'warn',
              open:'warn', in_progress:'gold', resolved:'green', cancelled2:'muted' };
  var cls = map[status] || 'muted';
  var label = (I[status] || {en:status, ar:status});
  var text = lang === 'ar' ? (label.ar || label.en) : label.en;
  return '<span class="chip ' + cls + '"><span class="badge-dot ' + cls + '"></span>' + esc(text) + '</span>';
}
function chip(text, cls){
  return '<span class="chip ' + (cls||'') + '">' + esc(text) + '</span>';
}
function arNum(n){
  if(lang !== 'ar') return String(n);
  return String(n).replace(/[0-9]/g, function(d){ return '٠١٢٣٤٥٦٧٨٩'[+d]; });
}
function fmtN(n){ return arNum(n == null ? 0 : n); }
function relDays(n){
  if(n == null) return '-';
  return arNum(n);
}
function toast(msg, isErr){
  var stack = $('toastStack');
  var el = document.createElement('div');
  el.className = 'toast' + (isErr ? ' err' : '');
  var icon = isErr ? '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'
                    : '<path d="M4 12l6 6L20 6"/>';
  el.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + icon + '</svg><span>' + msg + '</span>';
  stack.appendChild(el);
  setTimeout(function(){ el.style.opacity = '0'; el.style.transition = 'opacity .4s ease'; setTimeout(function(){ el.remove(); }, 400); }, 3400);
}
function loadingBlock(){ return '<div class="loading-block"><div class="spinner"></div><p>' + esc(t('loading')) + '</p></div>'; }
function emptyBlock(text){ return '<div class="empty-state"><i data-lucide="inbox" width="34" height="34"></i><p>' + esc(text) + '</p></div>'; }
function errBlock(text){ return '<div class="notice danger"><i data-lucide="alert-triangle" width="16" height="16"></i><div>' + esc(text || t('errorGeneric')) + '</div></div>'; }
function pageHead(title, sub, crumb){
  $('topTitle').textContent = title;
  $('topCrumb').textContent = crumb || ('PEL Admin · ' + title);
  return '<div class="page-head"><span class="eyebrow">' + esc(t('overview') === title ? 'PEL' : '') + '</span><h1>' + esc(title) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>';
}
function modal(title, body, wide, footer){
  var s = document.createElement('div');
  s.className = 'modal-scrim';
  s.innerHTML = '<div class="modal' + (wide ? ' wide' : '') + '"><h3>' + title + '</h3>' +
    '<div class="modal-body">' + body + '</div>' + (footer || '') + '</div>';
  s.addEventListener('click', function(e){ if(e.target === s) s.remove(); });
  document.body.appendChild(s);
  return s;
}
function closeModal(s){ if(s) s.remove(); }
function loadIcons(){ if(window.lucide) lucide.createIcons(); }

/* RPC wrapper: returns {ok, data, error} */
async function rpc(name, args){
  var c = client();
  if(!c) return { ok:false, error:'no client' };
  try{
    var r = await c.rpc(name, args || {});
    if(r.error) return { ok:false, error:r.error };
    return { ok:true, data:r.data };
  }catch(e){
    return { ok:false, error:e };
  }
}
/* Audit every admin mutation. */
async function audit(action, targetType, targetId, metadata){
  try{ await rpc('audit_action', { p_action:action, p_target_type:targetType, p_target_id:targetId, p_metadata:metadata || {} }); }catch(e){}
}
function hasPerm(p){ return me.perms.indexOf(p) !== -1; }
function canTeacher(){ return me.role === 'teacher' || me.role === 'admin' || me.role === 'super_admin'; }

/* academy + lesson display names via PEL_ENGINE */
function academyName(id, lng){
  var m = (window.PEL_ENGINE && PEL_ENGINE.ACADEMY_META && PEL_ENGINE.ACADEMY_META[id]) || {};
  return (lng === 'ar' ? m.ar : m.en) || id;
}
function lessonName(id){
  var m = (window.PEL_ENGINE && PEL_ENGINE.lessonMeta) ? PEL_ENGINE.lessonMeta(id) : null;
  return m ? (lang === 'ar' ? m.a : m.t) : id;
}
function academyProgress(academyId, completed){
  var ids = (window.PEL_ENGINE && PEL_ENGINE.academyLessons) ? (PEL_ENGINE.academyLessons(academyId) || []) : [];
  if(!ids.length) return 0;
  var done = (completed || []).filter(function(k){ return k.indexOf(academyId + '::') === 0; }).length;
  return Math.min(100, Math.round(100 * done / ids.length));
}
function csvExport(rows, filename){
  if(!rows || !rows.length){ toast(t('noData'), true); return; }
  var headers = Object.keys(rows[0]);
  var lines = [headers.join(',')];
  rows.forEach(function(r){
    lines.push(headers.map(function(h){
      var v = r[h] == null ? '' : String(r[h]);
      return '"' + v.replace(/"/g, '""') + '"';
    }).join(','));
  });
  var blob = new Blob([lines.join('\n')], { type:'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (filename || 'report') + '.csv';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
}
function downloadJSON(obj, filename){
  var blob = new Blob([JSON.stringify(obj, null, 2)], { type:'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (filename || 'export') + '.json';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
}

/* ============================================================
   4. BOOT - auth guard + role gate (Phase 6)
   ============================================================ */
async function boot(){
  var c = client();
  if(!c){ authGateFail(t('errorGeneric')); return; }
  var sess;
  try{
    var r = await c.auth.getSession();
    sess = r.data && r.data.session;
  }catch(e){}
  if(!sess || !sess.user){ window.location.href = 'login.html'; return; }

  var roleRes = await rpc('current_user_role');
  var permRes = await rpc('my_permissions');
  me.id = sess.user.id;
  me.email = sess.user.email || '';
  me.name = (sess.user.user_metadata && sess.user.user_metadata.full_name) || me.email.split('@')[0];
  me.role = (roleRes.ok && roleRes.data) ? roleRes.data : 'student';
  me.perms = (permRes.ok && permRes.data) ? permRes.data : [];

  if(['teacher','admin','super_admin'].indexOf(me.role) === -1){
    $('authGate').style.display = 'none';
    $('adminShell').style.display = 'flex';
    $('viewArea').innerHTML =
      '<div class="empty-state" style="padding-top:14vh;">' +
      '<i data-lucide="shield-alert" width="46" height="46"></i>' +
      '<h2 style="font-size:1.4rem; margin-top:16px;">' + esc(t('forbiddenTitle')) + '</h2>' +
      '<p style="margin-top:8px; max-width:420px; margin-inline:auto;">' + esc(t('forbiddenText')) + '</p>' +
      '<div class="btn-row" style="justify-content:center; margin-top:22px;"><a class="btn btn-outline" href="app.html">' + esc(t('back')) + '</a></div></div>';
    loadIcons();
    return;
  }

  try{
    var acct = JSON.parse(localStorage.getItem('pel_account_prefs')||'null');
    var adm = JSON.parse(localStorage.getItem('pel_admin_prefs') || 'null');
    lang = (acct && acct.lang) || (adm && adm.lang) || 'en';
  }catch(e){ lang = 'en'; }
  applyLang(false);
  $('authGate').style.display = 'none';
  $('adminShell').style.display = 'flex';
  document.body.classList.add('ready');
  renderSidebar();
  goTo('overview');

  c.auth.onAuthStateChange(function(event, session){
    if(event === 'SIGNED_OUT' || !session){ window.location.href = 'login.html'; }
  });
}
function authGateFail(msg){
  $('authGate').innerHTML = '<div class="ring"><img class="pel-logo" src="brand/pel-wordmark.svg" alt="PEL"></div><p>' + esc(msg) + '</p>';
}
function applyLang(announce){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('ui-ar', lang === 'ar');
  document.body.classList.toggle('ui-en', lang === 'en');
  $('langBtn').textContent = lang === 'ar' ? 'EN' : 'ع';
  try{ localStorage.setItem('pel_admin_prefs', JSON.stringify({ lang: lang })); var acct=null; try{ acct=JSON.parse(localStorage.getItem('pel_account_prefs')||'null'); }catch(e){} if(!acct) acct={lang:'en',direction:'en'}; acct.lang=lang; localStorage.setItem('pel_account_prefs', JSON.stringify(acct)); }catch(e){}
  if(announce) toast(lang === 'ar' ? 'الواجهة بالعربية' : 'Interface switched to English');
}

/* ============================================================
   5. NAVIGATION
   ============================================================ */
var NAV = [
  { label:'overview', items:[ {id:'overview', en:'Overview', ar:'نظرة عامة', icon:'layout-dashboard'} ] },
  { label:'people', items:[
    {id:'students', en:'Students', ar:'الطلاب', icon:'users'},
    {id:'teachers', en:'Teachers', ar:'المعلمين', icon:'user-check'},
    {id:'groups', en:'Groups', ar:'المجموعات', icon:'layers'},
  ]},
  { label:'learning', items:[
    {id:'courses', en:'Courses', ar:'المسارات', icon:'book-open'},
    {id:'questions', en:'Test Questions', ar:'بنك الاختبار', icon:'help-circle', perm:'learning.manage'},
    {id:'interventions', en:'Interventions', ar:'التدخلات', icon:'activity'},
  ]},
{ label:'operations', items:[
    {id:'classes', en:'Live Classes', ar:'الدروس المباشرة', icon:'video'},
    {id:'programs', en:'Programs', ar:'البرامج', icon:'credit-card'},
    {id:'plans', en:'Plans', ar:'الباقات', icon:'badge-check', perm:'subscriptions.manage'},
    {id:'billing', en:'Billing & Index', ar:'الفوترة والبداية', icon:'wallet', perm:'subscriptions.manage'},
    {id:'liveClasses', en:'Class Requests', ar:'طلبات الحصص', icon:'ticket', perm:'subscriptions.manage'},
    {id:'settings', en:'Site Settings', ar:'اعدادات الموقع', icon:'settings', perm:'settings.manage'},
  ]},
  { label:'trust', items:[
    {id:'certificates', en:'Certificates', ar:'الشهادات', icon:'graduation-cap'},
    {id:'announcements', en:'Announcements', ar:'الاعلانات', icon:'megaphone', perm:'announcements.manage'},
    {id:'audit', en:'Audit Log', ar:'سجل التدقيق', icon:'scroll-text'},
    {id:'roles', en:'Access & Roles', ar:'الادوار والصلاحيات', icon:'shield', perm:'roles.manage'},
    {id:'health', en:'System Health', ar:'صحة النظام', icon:'heart-pulse', perm:'health.read'},
  ]},
  { label:'reports', items:[ {id:'reports', en:'Reports', ar:'التقارير', icon:'file-bar-chart'} ] },
];
function renderSidebar(){
  var nav = $('sidebarNav');
  nav.innerHTML = '';
  NAV.forEach(function(group){
    if(group.label === 'overview' && me.role === 'teacher'){ /* teachers get overview too */ }
    var items = group.items.filter(function(it){ return !it.perm || hasPerm(it.perm); });
    if(!items.length) return;
    var label = document.createElement('div');
    label.className = 'nav-group-label';
    label.textContent = t(group.label);
    nav.appendChild(label);
    items.forEach(function(it){
      var a = document.createElement('button');
      a.className = 'side-link';
      a.dataset.view = it.id;
      a.innerHTML = '<span class="side-icon"><i data-lucide="' + it.icon + '" width="18" height="18"></i></span>' +
        '<span>' + esc(lang === 'ar' ? it.ar : it.en) + '</span>';
      nav.appendChild(a);
    });
  });
  $('adminAvatar').textContent = me.name.charAt(0).toUpperCase();
  $('adminName').textContent = me.name;
  var roleLbl = (I[me.role + 'Of'] || {en:me.role, ar:me.role});
  $('adminRole').textContent = lang === 'ar' ? (roleLbl.ar || me.role) : me.role;
  loadIcons();
}
function goTo(id, arg){
  if(id === 'student' && arg){ viewState.student = { uid: arg }; id = 'student'; }
  document.querySelectorAll('.side-link').forEach(function(l){ l.classList.toggle('active', l.dataset.view === id); });
  $('sidebar').classList.remove('mobile-open');
  window.scrollTo({ top:0 });
  var fn = views[id];
  if(fn){ fn(arg); return; }
  $('viewArea').innerHTML = emptyBlock(t('noData'));
}

/* ============================================================
   6. VIEW REGISTRY
   ============================================================ */
var views = { overview, students, student, teachers, groups, groupDetail, courses, interventions, classes, programs, plans: plansView, billing: billingView, liveClasses: liveClassesView, questions: questionsView, announcements: announcementsView, settings: settingsView, certificates, audit: auditLog, roles, health, reports };

/* ============================================================
   7. OVERVIEW (Phase 10)
   ============================================================ */
async function overview(){
$('viewArea').innerHTML = pageHead(t('overview'), lang === 'ar' ? 'وش يصير الان؟ مين يحتاج انتباه؟' : 'What is happening? Who needs attention?') + loadingBlock();
  var [r, pov] = await Promise.all([ rpc('admin_overview'), rpc('admin_plans_overview') ]);
  if(!r.ok){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var d = r.data;
  var pv = pov.ok ? (pov.data || {}) : {};
  var tt = d.totals || {};

  /* "What should I do?" - from real conditions */
  var actions = [];
  if((tt.expiring || 0) > 0) actions.push({ warn:true, icon:'hourglass', txt: t('expiringReason').replace('%d', 0) });
  if(actions.length === 0){
    if((d.attention || []).length > 0) actions.push({ txt: lang === 'ar' ? (d.attention.length + ' طالب يحتاج انتباه') : (d.attention.length + ' students need attention') });
    if((d.upcoming_classes || []).length > 0) actions.push({ txt: lang === 'ar' ? (d.upcoming_classes.length + ' دروس مباشرة قادمة - سجل الحضور بعدها') : (d.upcoming_classes.length + ' upcoming live classes') });
    if((tt.certificates_30 || 0) > 0) actions.push({ txt: lang === 'ar' ? (tt.certificates_30 + ' شهادة صدرت هذا الشهر') : (tt.certificates_30 + ' certificates issued this month') });
    if((tt.stalled || 0) > 0) actions.push({ txt: lang === 'ar' ? (tt.stalled + ' طالب متوقف - افتح ملفاتهم وشوف السبب') : (tt.stalled + ' stalled students - open their profiles') });
  }
  var actionHtml = actions.length ? actions.map(function(a){
    return '<div class="reason-item"><span class="badge-dot ' + (a.warn ? 'warn' : 'gold') + '" style="margin-top:6px;"></span><div><div>' + esc(a.txt) + '</div></div></div>';
  }).join('') : '<div class="sub">' + esc(t('noData')) + '</div>';

  var kpi = [
    { label:t('studentsTotal'), v:fmtN(tt.students), cls:'accent' },
    { label:t('activeStudents'), v:fmtN(tt.active), cls:'' },
    { label:t('newStudents'), v:fmtN(tt.new_30), cls:'green' },
    { label:t('stalledStudents'), v:fmtN(tt.stalled), cls: tt.stalled > 0 ? 'danger' : '' },
    { label:t('avgProgress'), v:fmtN(tt.avg_progress), cls:'' },
    { label:t('certsIssued'), v:fmtN(tt.certificates), sub: '+' + fmtN(tt.certificates_30) + ' (30d)', cls:'' },
    { label:t('teachersCount'), v:fmtN(tt.teachers), cls:'' },
    { label:t('groupsCount'), v:fmtN(tt.groups), cls:'' },
{ label:t('upcomingClasses'), v:fmtN(tt.upcoming_classes), cls: tt.upcoming_classes ? 'warn' : '' },
    { label:t('expiringPrograms'), v:fmtN(tt.expiring), cls: tt.expiring ? 'warn' : '' },
    { label:t('activePlans'), v:fmtN(pv.active_count), cls:'' },
    { label:t('expiringSoon'), v:fmtN(pv.expiring_soon_count), cls: pv.expiring_soon_count ? 'warn' : '' },
    { label:t('expiredPlans'), v:fmtN(pv.expired_count), cls: pv.expired_count ? 'danger' : '' },
  ];
  var kpiHtml = kpi.map(function(k){
    return '<div class="kpi-card ' + k.cls + '"><div class="k-label">' + esc(k.label) + '</div><div class="k-value">' + k.v + '</div>' + (k.sub ? '<div class="k-sub">' + esc(k.sub) + '</div>' : '') + '</div>';
  }).join('');

  var attentionHtml = (d.attention || []).map(function(s){
    var reasons = (s.reasons || []).map(function(r){
      if(r === 'inactive') return t('inactiveReason').replace('%d', s.days_inactive);
      if(r === 'missed_live') return t('missedLiveReason').replace('%d', s.recent_absences);
      if(r === 'expiring') return t('expiringReason').replace('%d', s.expiring_days);
      return r;
    }).join(' · ');
    return '<div class="reason-item"><span class="badge-dot ' + (s.days_inactive >= 14 ? 'red' : 'warn') + '" style="margin-top:5px;"></span>' +
      '<div><a class="row-link" data-open-student="' + s.user_id + '">' + esc(s.full_name) + '</a>' +
      '<span class="why">' + esc(reasons) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var plansExpiringHtml = (pv.expiring_soon || []).map(function(s){
    return '<div class="reason-item"><span class="badge-dot warn" style="margin-top:5px;"></span><div style="flex:1;"><a class="row-link" data-open-student="' + s.user_id + '">' + esc(s.name) + '</a>' +
      '<span class="why">' + esc(s.plan) + ' · ' + t('daysLeft').replace('%d', fmtN(s.days_left)) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var completionsHtml = (d.recent_completions || []).map(function(c){
    return '<div class="reason-item"><span class="badge-dot green" style="margin-top:5px;"></span><div><div>' + esc(c.full_name) + '</div><span class="why">' + esc(c.lesson) + ' · ' + relTime(c.when) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var certsHtml = (d.recent_certificates || []).map(function(c){
    return '<div class="reason-item"><span class="badge-dot gold" style="margin-top:5px;"></span><div><div>' + esc(c.student_name) + ' - ' + esc(c.academy_en) + '</div><span class="why">' + esc(c.cert_id) + ' · ' + statusChip(c.status) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var classesHtml = (d.upcoming_classes || []).map(function(c){
    return '<div class="reason-item"><span class="badge-dot bronze" style="margin-top:5px;"></span><div><div>' + esc(c.topic || '-') + ' · ' + esc(c.group_name || '-') + '</div><span class="why">' + fmtDate(c.scheduled_date) + ' ' + esc(c.start_time || '') + ' · ' + esc(c.teacher_name || '-') + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var auditHtml = (d.recent_audit || []).map(function(a){
    return '<div class="reason-item"><span class="badge-dot muted" style="margin-top:5px;"></span><div><div>' + esc(a.action) + ' · ' + esc(a.actor || '-') + '</div><span class="why">' + esc(a.target_type || '') + ' ' + esc(a.target_id || '') + ' · ' + relTime(a.created_at) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var distHtml = (d.course_distribution || []).map(function(c){
    var max = d.course_distribution.length ? d.course_distribution[0].count : 1;
    var w = Math.round(100 * c.count / max);
    return '<div class="bar-row"><div class="bar-label">' + esc(academyName(c.academy, lang)) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + w + '%"></div></div><div class="bar-val">' + fmtN(c.count) + '</div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  $('viewArea').innerHTML = pageHead(t('overview'), lang === 'ar' ? 'نظرة عامة على المنصة.' : 'Platform overview.') +
    '<div class="kpi-grid">' + kpiHtml + '</div>' +
    '<div class="grid grid-2"><div>' +
    '<div class="section-title">' + esc(t('whatShouldIDo')) + '</div><div class="card"><div class="reason-list">' + actionHtml + '</div></div>' +
    '<div class="section-title">' + esc(t('attention')) + '</div><div class="card"><div class="reason-list">' + attentionHtml + '</div></div>' +
    '<div class="section-title">' + esc(t('expiringSoon')) + '</div><div class="card"><div class="reason-list">' + plansExpiringHtml + '</div></div>' +
    '<div class="section-title">' + esc(t('upcomingClasses')) + '</div><div class="card"><div class="reason-list">' + classesHtml + '</div></div>' +
    '<div class="section-title">' + esc(t('courseDistribution')) + '</div><div class="card">' + distHtml + '</div></div>' +
    '<div><div class="section-title">' + esc(t('recentCompletions')) + '</div><div class="card"><div class="reason-list">' + completionsHtml + '</div></div>' +
    '<div class="section-title">' + esc(t('recentCerts')) + '</div><div class="card"><div class="reason-list">' + certsHtml + '</div></div>' +
    '<div class="section-title">' + esc(t('recentAudit')) + '</div><div class="card"><div class="reason-list">' + auditHtml + '</div></div></div></div>';
  loadIcons();
  wireStudentLinks();
}

/* ============================================================
   8. STUDENT DIRECTORY (Phase 11)
   ============================================================ */
function defaultStudentFilters(){
  return { status:'', level:'', program_id:'', teacher_id:'', group_id:'', cert_status:'', needs_attention:false, entitlement:'' };
}
/* Deep-link from plans overview into the directory with an entitlement
   filter pre-applied (e.g. every student whose plan expires within 7d). */
function openStudentsFiltered(ent){
  viewState.students = { page:0, sort:'expiry:asc', search:'', filters:defaultStudentFilters() };
  viewState.students.filters.entitlement = ent;
  goTo('students');
}
function students(){
  var st = viewState.students || (viewState.students = { page:0, sort:'last_active:desc', search:'', filters:defaultStudentFilters() });
  $('viewArea').innerHTML = pageHead(t('students'), lang === 'ar' ? 'ابحث، فلتر، رتب. كل التحميل من الخادم.' : 'Search, filter, sort. Everything is loaded server-side.') +
    '<div class="filter-bar">' +
      '<div class="search-wrap"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="input" id="stSearch" placeholder="' + esc(t('searchPlaceholder')) + '" value="' + esc(st.search) + '"></div>' +
      sel('stStatus', t('status'), [['',''],['new','new'],['active','active'],['stalled','stalled'],['inactive','inactive'],['suspended','suspended']], st.filters.status) +
      sel('stLevel', t('level'), [['',''],['A1','A1'],['A2','A2'],['B1','B1'],['B2','B2'],['C1','C1']], st.filters.level) +
      '<div class="field" id="stProgramWrap"></div>' +
      '<div class="field" id="stTeacherWrap"></div>' +
      '<div class="field" id="stGroupWrap"></div>' +
      sel('stCert', t('certStatus'), [['',''],['issued','issued'],['none','none']], st.filters.cert_status) +
      sel('stEnt', t('entLabel'), [['','entAny'],['expiring7','entExpiring7'],['expiring30','entExpiring30'],['expired','entExpired'],['no_plan','entNoPlan'],['suspended','entSuspended']], st.filters.entitlement) +
      '<div class="field" style="flex-direction:row; align-items:center; gap:7px;"><input type="checkbox" id="stAttention"' + (st.filters.needs_attention ? ' checked' : '') + '><label>' + esc(t('attentionLabel')) + '</label></div>' +
      '<button class="btn btn-gold btn-sm" id="stApply">' + esc(t('apply')) + '</button>' +
      '<button class="btn btn-ghost btn-sm" id="stReset">' + esc(t('reset')) + '</button>' +
      (hasPerm('students.write') ? '<button class="btn btn-gold btn-sm" id="stCreateBtn">' + esc(t('newStudent')) + '</button>' : '') +
      '<div style="flex:1"></div>' +
      '<div class="field">' + sortSel(st.sort) + '</div>' +
    '</div>' +
    '<div id="stTable"></div>';
  loadStPrograms(st);
  loadStTeachers(st);
  loadStGroups(st);
  $('stSearch').addEventListener('keydown', function(e){ if(e.key === 'Enter'){ st.search = this.value.trim(); st.page = 0; loadStudents(st); } });
  $('stApply').addEventListener('click', function(){ st.search = $('stSearch').value.trim(); st.filters.status = $('stStatus').value; st.filters.level = $('stLevel').value; st.filters.cert_status = $('stCert').value; st.filters.needs_attention = $('stAttention').checked; st.filters.entitlement = $('stEnt') ? $('stEnt').value : ''; st.filters.program_id = $('stProgram') ? $('stProgram').value : ''; st.filters.teacher_id = $('stTeacher') ? $('stTeacher').value : ''; st.filters.group_id = $('stGroup') ? $('stGroup').value : ''; st.page = 0; loadStudents(st); });
  $('stReset').addEventListener('click', function(){ st.search=''; st.filters = defaultStudentFilters(); st.page = 0; st.sort='last_active:desc'; students(); });
  var stc = $('stCreateBtn'); if(stc) stc.addEventListener('click', function(){ createStudentModal(st); });
  loadStudents(st);
}
function sel(id, label, options, value){
  var o = options.map(function(opt){
    var label = opt[1];
    var l = (I[label] || {en:label, ar:label});
    return '<option value="' + esc(opt[0]) + '"' + (opt[0] === value ? ' selected' : '') + '>' + esc(lang === 'ar' ? (l.ar||l.en) : l.en) + '</option>';
  }).join('');
  return '<div class="field"><label>' + esc(label) + '</label><select class="input" id="' + id + '">' + o + '</select></div>';
}
function sortSel(current){
  var opts = [
    ['last_active:desc','lastActive'], ['name:asc','name'], ['enrolled:desc','enrolled'],
    ['progress:desc','progress'], ['xp:desc','xp'], ['streak:desc','streak'], ['expiry:asc','expiring']
  ];
  var o = opts.map(function(x){
    return '<option value="' + x[0] + '"' + (x[0] === current ? ' selected' : '') + '>' + esc(t(x[1])) + '</option>';
  }).join('');
  return '<label style="font-size:.66rem; color:var(--text-muted);">' + esc(t('sort')) + '</label><select class="input" id="stSort">' + o + '</select>';
}
async function loadStPrograms(st){
  var w = $('stProgramWrap'); if(!w) return;
  try{
    var c = client();
    var r = await c.from('programs').select('id,name_en,name_ar').order('name_en');
    var o = '<option value="">' + esc(t('all')) + '</option>' + (r.data || []).map(function(p){
      return '<option value="' + p.id + '">' + esc(lang === 'ar' ? (p.name_ar || p.name_en) : p.name_en) + '</option>';
    }).join('');
    w.innerHTML = '<label>' + esc(t('program')) + '</label><select class="input" id="stProgram">' + o + '</select>';
    $('stProgram').value = st.filters.program_id || '';
  }catch(e){ w.innerHTML = ''; }
}
async function loadStTeachers(st){
  var w = $('stTeacherWrap'); if(!w) return;
  var r = await rpc('admin_teachers');
  if(!r.ok || !r.data) { w.innerHTML = ''; return; }
  var o = '<option value="">' + esc(t('all')) + '</option>' + r.data.map(function(x){
    return '<option value="' + x.id + '">' + esc(x.full_name) + '</option>';
  }).join('');
  w.innerHTML = '<label>' + esc(t('teacher')) + '</label><select class="input" id="stTeacher">' + o + '</select>';
  $('stTeacher').value = st.filters.teacher_id || '';
}
async function loadStGroups(st){
  var w = $('stGroupWrap'); if(!w) return;
  try{
    var c = client();
    var r = await c.from('groups').select('id,name').eq('status','active').order('name');
    var o = '<option value="">' + esc(t('all')) + '</option>' + (r.data || []).map(function(g){
      return '<option value="' + g.id + '">' + esc(g.name) + '</option>';
    }).join('');
    w.innerHTML = '<label>' + esc(t('group')) + '</label><select class="input" id="stGroup">' + o + '</select>';
    $('stGroup').value = st.filters.group_id || '';
  }catch(e){ w.innerHTML = ''; }
}
async function loadStudents(st){
  var tbl = $('stTable');
  tbl.innerHTML = loadingBlock();
  var filters = {};
  Object.keys(st.filters).forEach(function(k){ if(st.filters[k]) filters[k] = String(st.filters[k]); });
  var [r, rn] = await Promise.all([
    rpc('admin_students', { p_limit: 25, p_offset: st.page * 25, p_search: st.search || null, p_filters: filters, p_sort: st.sort }),
    rpc('admin_students_count', { p_search: st.search || null, p_filters: filters })
  ]);
  if(!r.ok){ tbl.innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];
  var total = rn.ok ? rn.data : rows.length;
  var pages = Math.max(1, Math.ceil(total / 25));

  if(!rows.length){
    tbl.innerHTML = emptyBlock(t('noResults'));
    return;
  }
  var trs = rows.map(function(s){
    var attention = s.needs_attention ? '<span class="chip ' + (s.days_inactive >= 14 ? 'red' : 'warn') + '">' + esc(t('needsAttention')) + '</span>' : '<span class="chip muted">-</span>';
    return '<tr>' +
      '<td><span class="mobile-label">' + esc(t('name')) + '</span><a class="row-link" data-open-student="' + s.id + '">' + esc(s.full_name) + '</a>' + (s.email ? '<div style="font-size:.68rem; color:var(--text-muted);">' + esc(s.email) + '</div>' : '') + '</td>' +
      '<td><span class="mobile-label">' + esc(t('status')) + '</span>' + statusChip(s.status || 'new') + '</td>' +
      '<td><span class="mobile-label">' + esc(t('level')) + '</span>' + chip(s.level || 'A1', 'gold') + '</td>' +
      '<td class="num"><span class="mobile-label">XP</span>' + fmtN(s.xp) + '</td>' +
      '<td class="num"><span class="mobile-label">' + esc(t('streak')) + '</span>' + fmtN(s.streak) + 'd</td>' +
      '<td class="num"><span class="mobile-label">' + esc(t('progress')) + '</span>' + fmtN(s.completed_lessons) + '</td>' +
      '<td><span class="mobile-label">' + esc(t('lastActive')) + '</span>' + relTime(s.last_active) + '</td>' +
      '<td><span class="mobile-label">' + esc(t('program')) + '</span>' + (s.program_name ? '<div style="font-weight:600;">' + esc(s.program_name) + '</div>' : '-') + (s.plan_status ? '<div style="margin-top:4px;">' + planStatusChip(s.plan_status) + (s.plan_days_left != null && ['active','expiring'].indexOf(s.plan_status) !== -1 ? ' <span style="font-size:.68rem; color:var(--text-muted);">' + esc(t('daysLeft').replace('%d', arNum(s.plan_days_left))) + '</span>' : '') + '</div>' : '<div style="margin-top:4px;"><span class="chip muted">' + esc(lang==='ar'?'لا توجد باقة':'No plan') + '</span></div>') + '</td>' +
      '<td><span class="mobile-label">' + esc(t('certs')) + '</span>' + fmtN(s.cert_count) + '</td>' +
      '<td><span class="mobile-label">' + esc(t('attention')) + '</span>' + attention + '</td>' +
      '</tr>';
  }).join('');

  tbl.innerHTML =
    '<div class="table-wrap tbl-responsive"><table class="tbl"><thead><tr>' +
    '<th>' + esc(t('name')) + '</th><th>' + esc(t('status')) + '</th><th>' + esc(t('level')) + '</th><th>XP</th><th>' + esc(t('streak')) + '</th><th>' + esc(t('progress')) + '</th><th>' + esc(t('lastActive')) + '</th><th>' + esc(t('program')) + '</th><th>' + esc(t('certs')) + '</th><th>' + esc(t('attention')) + '</th>' +
    '</tr></thead><tbody>' + trs + '</tbody></table></div>' +
    '<div class="pager"><span class="pg-info">' + esc(t('totalRow').replace('%n', arNum(total))) + '</span>' +
    '<button class="pg-btn" id="pgPrev" ' + (st.page === 0 ? 'disabled' : '') + '>' + esc(t('prev')) + '</button>' +
    '<span class="pg-info">' + esc(t('pageOf').replace('%p', arNum(st.page + 1)).replace('%t', arNum(pages))) + '</span>' +
    '<button class="pg-btn" id="pgNext" ' + (st.page >= pages - 1 ? 'disabled' : '') + '>' + esc(t('next')) + '</button></div>';
  wireStudentLinks();
  $('pgPrev').addEventListener('click', function(){ if(st.page > 0){ st.page--; loadStudents(st); } });
  $('pgNext').addEventListener('click', function(){ if(st.page < pages - 1){ st.page++; loadStudents(st); } });
  var sort = $('stSort');
  if(sort) sort.value = st.sort;
}
function wireStudentLinks(){
  document.querySelectorAll('[data-open-student]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.stopPropagation();
      goTo('student', el.getAttribute('data-open-student'));
    });
  });
}

/* ============================================================
   9. STUDENT 360 (Phases 12-20)
   ============================================================ */
var s360Tab = 'learning';
async function student(uid){
  if(!uid && viewState.student) uid = viewState.student.uid;
  if(!uid){ $('viewArea').innerHTML = errBlock(); return; }
  s360Tab = 'learning';
  $('viewArea').innerHTML = pageHead(t('student360'), '') + loadingBlock();
  var r = await rpc('admin_student_360', { p_user_id: uid });
  if(!r.ok){
    $('viewArea').innerHTML = pageHead(t('student360'), '') + errBlock(r.error && r.error.message);
    return;
  }
  current360 = r.data;
  current360Uid = uid;
  render360();
}
function render360(){
  var d = current360;
  var p = d.profile || {};
  var plan = p.plan;
  var prof = plan && plan.profile;
  var route = plan && plan.route;
  var st = d.state || {};
  var completed = st.completed_lessons || [];
  var kv = d.kv || {};
  var prog = plan ? plan.estimate : null;

  var nextRec = computeNextRec(plan, st, kv);

  var header =
    '<div class="card s360-header" style="margin-bottom:18px;">' +
    '<span class="avatar-circle">' + esc((p.full_name || '?').charAt(0).toUpperCase()) + '</span>' +
    '<div style="flex:1; min-width:220px;">' +
    '<h2 style="font-size:1.3rem;">' + esc(p.full_name || '-') + '</h2>' +
    '<div class="s360-meta">' +
      statusChip(p.status || 'new') + chip(esc(p.level || (prof && prof.estimatedStartingLevel) || 'A1'), 'gold') +
      (p.role ? chip(esc(lang === 'ar' ? ((I[p.role+'Of']||{}).ar||p.role) : p.role), 'bronze') : '') +
      (prog ? chip(esc((lang === 'ar' ? prof.targetLevel : prof.targetLevel)) + ' → ' + esc(prof && prof.targetLevel), '') : '') +
      (p.program_name ? chip(esc(p.program_name), 'green') : '') +
      '<span class="chip muted">' + esc(relTime(st.updated_at || p.created_at)) + '</span>' +
    '</div>' +
    '<div class="s360-meta" style="color:var(--text-muted); font-size:.76rem;">' +
      '<span>' + esc(p.email || '') + '</span>' + (p.phone ? '<span>· ' + esc(p.phone) + '</span>' : '') +
    '</div></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-outline btn-sm" id="s360Preview">' + esc(t('preview')) + '</button>' +
    (hasPerm('students.manage') ? '<button class="btn btn-danger btn-sm" id="s360Delete">' + esc(lang === 'ar' ? 'حذف الطالب نهايياً' : 'Delete student permanently') + '</button>' : '') +
    '<button class="btn btn-ghost btn-sm" data-goback="">' + esc(t('back')) + '</button>' +
    '</div></div>';

var tabs = [
    ['plan', t('plan')], ['learning', t('learningHealth')], ['profile', t('profile')], ['personalization', t('personalization')],
    ['skills', t('skills')], ['recommendations', t('recommendations')], ['interventionList', t('interventionList')],
    ['activity', t('activity')], ['certificates', t('certificates')], ['timeline', t('timeline')],
    ['notes', t('notes')], ['audit', t('audit')]
  ];
  var tabHtml = '<div class="tabs">' + tabs.map(function(x){
    return '<button class="tab' + (x[0] === s360Tab ? ' active' : '') + '" data-tab="' + x[0] + '">' + esc(x[1]) + '</button>';
  }).join('') + '</div>';

  $('viewArea').innerHTML = pageHead(t('student360'), esc(p.full_name || '')) + header +
    '<div class="card" id="s360Billing" style="margin-bottom:18px;">' + loadingBlock() + '</div>' +
    tabHtml + '<div id="s360Body"></div>';
  renderTab(s360Tab);
  wireStudentLinks();

  /* Billing & live-class credit ledger (manual WhatsApp payments). */
  (async function(){
    var host = $('s360Billing'); if(!host) return;
    try{
      var r = await rpc('admin_student_billing', { p_user_id: current360Uid });
      if(!r.ok){ host.innerHTML = '<div class="notice">'+esc(rpcErrMsg(r))+'</div>'; return; }
      var b = (r.data && r.data.billing) || {};
      var ledger = (r.data && r.data.ledger) || [];
      var tierAr = b.tier==='exam_prep'?'التجهيز للاختبارات':(b.tier==='start_from_zero'?'ابد من الصفر':'-');
      var trackAr = b.assessed_track==='exam_prep'?'متقدم':(b.assessed_track==='start_from_zero'?'مبتدي':'-');
      host.innerHTML =
        '<div class="section-title" style="margin-top:0;">'+(lang==='ar'?'الباقة والرصيد':'Plan & credits')+'</div>' +
        '<div class="s360-meta" style="margin-bottom:10px;">' +
          (b.tier?chip(esc(lang==='ar'?tierAr:b.tier),'gold'):'') +
          (b.assessed_cefr_level?chip(esc((lang==='ar'?'مستوى ':'Level ')+b.assessed_cefr_level),''):'') +
          (b.assessed_track?chip(esc((lang==='ar'?'المسار ':'Track ')+(lang==='ar'?trackAr:b.assessed_track)),'bronze'):'') +
          (b.plan_duration_months?chip(esc(b.plan_duration_months+' '+(lang==='ar'?'اشهر':'mo')),''):'') +
          chip(esc((b.live_class_credits||0)+' '+(lang==='ar'?'رصيد حصص':'class credits')),'green') +
        '</div>' +
        (hasPerm('students.write') ?
        '<div class="reason-list" style="margin-bottom:10px;">' +
          '<div class="reason-item" style="flex-wrap:wrap;gap:8px;align-items:center;">' +
            '<div style="font-weight:700;min-width:110px;">'+esc(lang==='ar'?'تعديل الرصيد':'Adjust credits')+'</div>' +
            '<input class="input" type="number" id="credDelta" style="width:90px;" placeholder="+1 / -1">' +
            '<input class="input" id="credReason" style="flex:1;min-width:140px;" placeholder="'+esc(lang==='ar'?'السبب (دفع واتساب)':'Reason (WhatsApp payment)')+'">' +
            '<button class="btn btn-gold btn-sm" data-cred-add="1">'+esc(lang==='ar'?'+ اضافة':'+ Add')+'</button>' +
            '<button class="btn btn-outline btn-sm" data-cred-add="-1">'+esc(lang==='ar'?'- خصم':'- Deduct')+'</button>' +
          '</div></div>' : '') +
        (hasPerm('subscriptions.manage') ?
        '<div class="reason-list" style="margin-bottom:10px;">' +
          '<div class="reason-item" style="flex-wrap:wrap;gap:8px;align-items:center;">' +
            '<div style="font-weight:700;min-width:110px;">'+esc(lang==='ar'?'الخطة والمستوى':'Plan & level')+'</div>' +
            chip(esc(b.tier==='exam_prep'?(lang==='ar'?'التجهيز للاختبارات':'Exam Prep'):(lang==='ar'?'ابد من الصفر':'Start From Zero')), 'gold') +
            chip(esc(b.assessed_cefr_level||'A1'), '') +
            '<button class="btn btn-gold btn-sm" id="s360AssignPlan">'+esc(t('assignPlan'))+'</button>' +
            '<span style="font-size:.76rem;color:var(--text-muted);">'+esc(lang==='ar'?'يحدد البرنامج + المدة + نوع الخطة + المستوى اللي تاخذ منه الدروس':'Sets program + duration + plan type + level that drives their lessons')+'</span>' +
          '</div></div>' : '') +
        '<div class="reason-list" id="credLedger">' +
          (ledger.length ? ledger.map(function(l){
            var d = l.delta>=0?'+'+l.delta:l.delta;
            return '<div class="reason-item"><div style="flex:1;">'+esc(l.reason||'-')+'<div class="why">'+esc(fmtDate(l.created_at))+'</div></div>' +
              '<b style="color:'+(l.delta>=0?'var(--green, #437A22)':'var(--danger,#c0392b)')+';">'+esc(d)+'</b>' +
              '<span class="chip muted">'+esc(lang==='ar'?'الرصيد':'bal')+' '+esc(l.balance_after)+'</span></div>';
          }).join('') : emptyBlock(lang==='ar'?'لا يوجد عمليات بعد':'No transactions yet')) +
        '</div>';
      // wire +/- buttons
      host.querySelectorAll('[data-cred-add]').forEach(function(btn){
        btn.addEventListener('click', async function(){
          var dir = +btn.getAttribute('data-cred-add');
          var delta = parseInt($('credDelta').value, 10);
          if(!delta){ toast(lang==='ar'?'اكتب عدد':'Enter a number', true); return; }
          var adj = delta * dir;
          var reason = $('credReason').value.trim() || (lang==='ar'?'تعديل يدوي':'Manual adjustment');
          var r2 = await rpc('admin_adjust_credits', { p_user_id: current360Uid, p_delta: adj, p_reason: reason });
          if(!r2.ok){ toast(rpcErrMsg(r2), true); return; }
          await audit('credit.adjust', 'student', current360Uid, { delta: adj, reason: reason });
          toast(t('saved')); 
          var r3 = await rpc('admin_student_billing', { p_user_id: current360Uid });
          if(r3.ok){ b = r3.data.billing || {}; ledger = r3.data.ledger || []; }
          // re-render credits chip + ledger
          var chips = host.querySelector('.s360-meta');
          if(chips){ var lastChip = chips.querySelector('.chip.green'); if(lastChip) lastChip.textContent = (b.live_class_credits||0)+' '+(lang==='ar'?'رصيد حصص':'class credits'); }
          var led = $('credLedger');
          if(led){ led.innerHTML = ledger.length ? ledger.map(function(l){ var d=l.delta>=0?'+'+l.delta:l.delta; return '<div class="reason-item"><div style="flex:1;">'+esc(l.reason||'-')+'<div class="why">'+esc(fmtDate(l.created_at))+'</div></div><b style="color:'+(l.delta>=0?'var(--green, #437A22)':'var(--danger,#c0392b)')+';">'+esc(d)+'</b><span class="chip muted">'+esc(lang==='ar'?'الرصيد':'bal')+' '+esc(l.balance_after)+'</span></div>'; }).join('') : emptyBlock(lang==='ar'?'لا يوجد عمليات بعد':'No transactions yet'); }
          $('credDelta').value = '';
        });
      });
      // ONE assign-plan button -> consolidated modal (program + dates + tier + level)
      var assignPlanBtn = $('s360AssignPlan');
      if(assignPlanBtn) assignPlanBtn.addEventListener('click', function(){ openAssignPlanModal(current360Uid, reload360, b.tier||'', b.assessed_cefr_level||''); });
    }catch(e){ host.innerHTML = '<div class="notice">'+esc(t('errorGeneric'))+'</div>'; }
  })();

  $('s360Preview').addEventListener('click', renderPreview);
  /* Authoritative progression snapshot from the DB: academy, level,
     current lesson, completion count. Admin sees the real state. */
  (async function(){
    try{
      var pr = await rpc('admin_student_progression', { p_user_id: current360Uid });
      if(!pr.ok || !pr.data || !pr.data.ok || !pr.data.prog) return;
      var p = pr.data.prog;
      var host = document.querySelector('#viewArea .s360-header .s360-meta');
      if(host && host.isConnected){
        host.insertAdjacentHTML('beforeend',
          '<span>· <b>' + esc(p.current_stage || '-') + '</b></span>' +
          '<span>· ' + esc(p.current_level || '') + '</span>' +
          (p.current_lesson ? '<span>· ' + esc(p.current_lesson) + '</span>' : '') +
          '<span>· ' + ((p.completed_lessons || []).length) + ' ' + esc(t('completedLbl') || 'done') + '</span>');
      }
    }catch(e){}
  })();
  var delBtn = $('s360Delete');
  if(delBtn){
    delBtn.addEventListener('click', async function(){
      if(!confirm(lang === 'ar' ? 'سيتم حذف حساب الطالب وكل بياناته نهايياً (تبقى الشهادات فقط). متابعة؟' : 'This permanently deletes the student account and ALL their history (certificates are kept). Continue?')){ return; }
      if(!confirm(lang === 'ar' ? 'تاكيد اخير: هذا الاجرا لا يمكن التراجع عنه.' : 'Final confirmation: this cannot be undone.')){ return; }
      delBtn.disabled = true;
      var r = await rpc('admin_student_delete', { p_user_id: current360Uid });
      if(!r.ok){ delBtn.disabled = false; toast((r.error && r.error.message) || t('permissionDenied'), true); return; }
      toast(lang === 'ar' ? 'تم حذف الطالب. تبقت شهاداته للتحقق.' : 'Student deleted. Certificates remain verifiable.');
      current360 = null; current360Uid = null;
      if(typeof studentsView === 'function'){ studentsView(); } else { location.reload(); }
    });
  }
  document.querySelectorAll('[data-tab]').forEach(function(b){
    b.addEventListener('click', function(){ s360Tab = b.getAttribute('data-tab'); renderTab(s360Tab); });
  });
  var back = document.querySelector('[data-goback]');
  if(back) back.addEventListener('click', function(){ goTo('students'); });
}
function computeNextRec(plan, st, kv){
  var completed = st.completed_lessons || [];
  var out = { hasPlan: !!plan && plan.onboardingCompleted, rec:null, un:null };
  if(!out.hasPlan || !window.PEL_ENGINE || !plan.profile || !plan.route){ return out; }
  try{
    out.un = PEL_ENGINE.unlockState(plan.profile, plan.route, { completedLessons: completed });
    out.rec = PEL_ENGINE.recommendNext(plan.profile, plan.route, { completedLessons: completed });
  }catch(e){}
  return out;
}
function renderTab(tab){
  var d = current360;
  var p = d.profile || {};
  var plan = p.plan;
  var prof = plan && plan.profile;
  var route = plan && plan.route;
  var st = d.state || {};
  var kv = d.kv || {};
  var completed = st.completed_lessons || [];
  var body = $('s360Body');
  if(!body) return;

  if(tab === 'plan'){ renderTabPlan(d); }
  else if(tab === 'profile'){ body.innerHTML = renderTabProfile(p, d); }
  else if(tab === 'learning'){ body.innerHTML = renderTabLearning(plan, st, kv, d); }
  else if(tab === 'personalization'){ body.innerHTML = renderTabPersonalization(plan); }
  else if(tab === 'skills'){ body.innerHTML = renderTabSkills(plan, st, kv); }
  else if(tab === 'recommendations'){ body.innerHTML = renderTabRecommendations(plan, st, kv, d); }
  else if(tab === 'interventionList'){ body.innerHTML = renderTabInterventions(d); }
  else if(tab === 'activity'){ body.innerHTML = renderTabActivity(st, kv, d); }
  else if(tab === 'certificates'){ body.innerHTML = renderTabCertificates(d); }
  else if(tab === 'timeline'){ body.innerHTML = renderTabTimeline(p, st, kv, d); }
  else if(tab === 'notes'){ body.innerHTML = renderTabNotes(d); }
  else if(tab === 'audit'){ body.innerHTML = renderTabAudit(d); }
  else body.innerHTML = '';
  loadIcons();
  wire360Actions();
}
function renderTabProfile(p, d){
  var items = [
    ['email', p.email], ['phone', p.phone], ['whatsapp', p.whatsapp],
    ['status', p.status], ['role', p.role], ['enrollmentDate', p.enrollment_date],
    ['intake', p.intake], ['created_at', fmtDate(p.created_at)]
  ];
  var kv = items.map(function(i){
    var lbl = (I[i[0]] || {en:i[0], ar:i[0]});
    return '<div class="kv-item"><div class="kv-label">' + esc(lang === 'ar' ? (lbl.ar||lbl.en) : lbl.en) + '</div><div class="kv-value">' + esc(i[1] == null ? '-' : String(i[1])) + '</div></div>';
  }).join('');

  var editable = '';
  if(hasPerm('students.write')){
    editable = '<div class="card" style="margin-top:18px;"><h3>' + esc(t('edit')) + '</h3><div class="form-grid" style="margin-top:12px;">' +
      '<div class="field"><label>' + esc(t('phone')) + '</label><input class="input" id="prPhone" value="' + esc(p.phone || '') + '"></div>' +
      '<div class="field"><label>' + esc(t('whatsapp')) + '</label><input class="input" id="prWhatsapp" value="' + esc(p.whatsapp || '') + '"></div>' +
      '<div class="field"><label>' + esc(t('status')) + '</label><select class="input" id="prStatus">' +
        [['new','new'],['active','active'],['stalled','stalled'],['inactive','inactive'],['suspended','suspended']].map(function(x){
          var lbl = I[x[1]];
          return '<option value="' + x[1] + '"' + (p.status === x[1] ? ' selected' : '') + '>' + esc(lang === 'ar' ? lbl.ar : lbl.en) + '</option>';
        }).join('') + '</select></div>' +
      '<div class="field"><label>' + esc(t('intake')) + '</label><input class="input" id="prIntake" value="' + esc(p.intake || '') + '"></div>' +
      '<div class="field"><label>' + esc(t('enrollmentDate')) + '</label><input class="input" type="date" id="prEnr" value="' + esc(p.enrollment_date || '') + '"></div>' +
      '<div class="field full"><label>' + esc(t('notes')) + '</label><textarea class="input" id="prNotes" rows="2">' + esc(p.notes || '') + '</textarea></div>' +
      '</div><div class="btn-row" style="margin-top:14px;"><button class="btn btn-gold btn-sm" id="prSave">' + esc(t('save')) + '</button></div></div>';
  }
  return '<div class="card"><div class="kv-list">' + kv + '</div></div>' + editable;
}
function renderTabLearning(plan, st, kv, d){
  var completed = st.completed_lessons || [];
  var total = 0;
  var route = plan && plan.route;
  if(route){ route.forEach(function(sg){ sg.units.forEach(function(u){ total += (u.lessonIds || []).length; }); }); }
  var progPct = total ? Math.round(100 * completed.length / total) : 0;
  var compDates = kv['pel_completion_dates'] || {};
  var studyDays = kv['pel_study_days'] || [];
  var weekStart = weekStartKey();
  var weekCount = (studyDays || []).filter(function(k){ return k >= weekStart; }).length;

  var health = learningHealth(plan, st, kv);

  var stats = [
    [t('completedCount'), fmtN(completed.length)], [t('totalLessons'), fmtN(total)],
    [t('xp'), fmtN(st.xp)], [t('streak'), fmtN(st.streak) + 'd'],
    [t('longestStreak'), fmtN(st.longest_streak) + 'd'], [t('lastStudy'), fmtDate(st.last_study_date)],
    [t('progress'), progPct + '%'], [t('attendanceRate'), fmtN(attendanceRate(d)) + '%']
  ];
  var statsHtml = stats.map(function(s){
    return '<div class="kv-item"><div class="kv-label">' + s[0] + '</div><div class="kv-value">' + s[1] + '</div></div>';
  }).join('');

  var attention = (d.attendance || []).filter(function(a){ return a.status === 'absent'; });
  var concern = [];
  if(health.difficulty) concern.push(health.difficulty.txt);
  if(attention.length >= 2) concern.push(t('missedLiveReason').replace('%d', arNum(attention.length)));
  if(health.weak.length) concern.push(lang === 'ar' ? 'التركيز المطلوب: ' + health.weak[0].nameAr : 'Focus area: ' + health.weak[0].name);

  var whyHtml = '';
  if(window.PEL_ENGINE && plan && plan.profile && plan.route){
    try{
      var w = PEL_ENGINE.whyPlan(plan.profile, plan.route);
      whyHtml = (lang === 'ar' ? w.linesAr : w.linesEn).map(function(l){ return '<div class="reason-item"><span class="badge-dot gold" style="margin-top:5px;"></span><div>' + esc(l) + '</div></div>'; }).join('');
    }catch(e){}
  }

  var snapshotBtn = hasPerm('students.write') ? '<button class="btn btn-outline btn-sm" id="snapBtn">' + esc(t('takeSnapshot')) + '</button>' : '';
  var snapshots = (d.snapshots || []).slice(0, 8).map(function(s){
    var scores = s.skill_scores || {};
    var parts = Object.keys(scores).slice(0,4).map(function(k){ return esc(k) + ' ' + arNum(scores[k]); }).join(' · ');
    return '<div class="reason-item"><span class="badge-dot green" style="margin-top:5px;"></span><div><div>' + fmtDate(s.snapshot_date) + ' · ' + esc(s.level || '-') + '</div><span class="why">' + parts + ' · ' + fmtN(s.xp) + ' xp</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  return '<div class="card"><div class="kv-list">' + statsHtml + '</div>' +
    '<div style="margin-top:16px;"><div class="bar-row"><div class="bar-label">' + esc(t('progress')) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + progPct + '%"></div></div><div class="bar-val">' + fmtN(progPct) + '%</div></div></div></div>' +
    '<div class="section-title">' + esc(t('currentConcern')) + '</div><div class="card"><div class="reason-list">' +
    (concern.length ? concern.map(function(c){ return '<div class="reason-item"><span class="badge-dot warn" style="margin-top:5px;"></span><div>' + esc(c) + '</div></div>'; }).join('') : '<div class="sub">' + esc(t('noData')) + '</div>') +
    '</div></div>' +
    '<div class="section-title">' + esc(t('whyPEL')) + '</div><div class="card"><div class="reason-list">' + (whyHtml || '<div class="sub">' + esc(t('noPlan')) + '</div>') + '</div></div>' +
    '<div class="section-title">' + esc(t('generateSnapshot')) + ' ' + snapshotBtn + '</div><div class="card"><div class="reason-list">' + snapshots + '</div></div>';
}
function learningHealth(plan, st, kv){
  var completed = st.completed_lessons || [];
  var dates = kv['pel_completion_dates'] || {};
  var route = plan && plan.route;
  var out = { weak:[], strong:[], difficulty:null, strength:null, focus:null };
  if(!window.PEL_ENGINE) return out;
  var specs = [
    {key:'Speaking', ar:'المحادثة', academyId:'speaking-studio'},
    {key:'Listening', ar:'الاستماع', academyId:'listening-lounge'},
    {key:'Grammar', ar:'القواعد', academyId:'grammar-academy'},
    {key:'Vocabulary', ar:'المفردات', academyId:'vocabulary-vault'},
    {key:'Pronunciation', ar:'النطق', academyId:'american-accent-lab'},
    {key:'Writing', ar:'الكتابة', academyId:'writing-workshop'}
  ];
  var scored = specs.map(function(s){
    return { key:s.key, ar:s.ar, score:academyProgress(s.academyId, completed) };
  });
  out.weak = scored.filter(function(s){ return s.score > 0 && s.score < 40; });
  out.strong = scored.filter(function(s){ return s.score >= 70; });
  if(out.weak.length) out.difficulty = { txt: (lang === 'ar' ? out.weak[0].ar : out.weak[0].key) };
  if(out.strong.length) out.strength = { txt: (lang === 'ar' ? out.strong[0].ar : out.strong[0].key) };
  if(plan && plan.profile && plan.profile.recommendedFocus && plan.profile.recommendedFocus.length){
    out.focus = { txt: plan.profile.recommendedFocus[0] };
  }
  return out;
}
function attendanceRate(d){
  var att = d.attendance || [];
  if(!att.length) return 0;
  var present = att.filter(function(a){ return a.status === 'present' || a.status === 'late'; }).length;
  return Math.round(100 * present / att.length);
}
function weekStartKey(){
  var d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0,10);
}
function renderTabPersonalization(plan){
  if(!plan || !plan.profile){
    return '<div class="card"><div class="sub">' + esc(t('noPlan')) + '</div></div>';
  }
  var p = plan.profile, e = plan.estimate;
  var items = [
    [t('goal'), p.goalsEn || (p.goals || []).join(', '), p.goalsAr],
    [t('outcome'), p.targetOutcomeEn || p.targetOutcome, p.targetOutcomeAr],
    [t('target'), p.targetLevel, null],
    [t('dailyMin'), p.dailyMinutes, null],
    [t('weeklyFreq'), p.weeklyFrequency + '/7', null],
    [t('contexts'), (p.realLifeContexts || []).join(', '), null],
    [t('weaknesses'), (p.weaknesses || []).join(', '), null],
    [t('routeDuration'), (e ? e.totalWeeks : '') + 'w · ' + (e ? e.totalStudyDays : '') + 'd', null],
    [t('est'), e ? e.dailyMinutes + ' min/day' : '', null]
  ];
  var kv = items.filter(function(i){ return i[1] || i[2]; }).map(function(i){
    var v = lang === 'ar' ? (i[2] || i[1]) : i[1];
    return '<div class="kv-item"><div class="kv-label">' + i[0] + '</div><div class="kv-value">' + esc(v) + '</div></div>';
  }).join('');

  var routeHtml = '';
  if(plan.route){
    routeHtml = '<div class="section-title">' + esc(t('stage')) + '</div><div class="card"><div class="reason-list">' +
      plan.route.map(function(sg){
        var unitCount = sg.units.reduce(function(s,u){ return s + (u.lessonIds||[]).length; }, 0);
        return '<div class="reason-item"><span class="badge-dot gold" style="margin-top:5px;"></span><div><div>' + esc(lang === 'ar' ? sg.title.ar : sg.title.en) + '</div><span class="why">' + fmtN(unitCount) + ' ' + esc(t('totalLessons')) + '</span></div></div>';
      }).join('') + '</div></div>';
  }
  return '<div class="card"><div class="kv-list">' + kv + '</div></div>' + routeHtml;
}
function renderTabSkills(plan, st, kv){
  var completed = st.completed_lessons || [];
  var specs = [
    {key:'Speaking', ar:'المحادثة', academyId:'speaking-studio'},
    {key:'Listening', ar:'الاستماع', academyId:'listening-lounge'},
    {key:'Grammar', ar:'القواعد', academyId:'grammar-academy'},
    {key:'Vocabulary', ar:'المفردات', academyId:'vocabulary-vault'},
    {key:'Pronunciation', ar:'النطق', academyId:'american-accent-lab'},
    {key:'Writing', ar:'الكتابة', academyId:'writing-workshop'}
  ];
  var scored = specs.map(function(s){
    return { key:s.key, ar:s.ar, score:academyProgress(s.academyId, completed) };
  });
  var bars = scored.map(function(s){
    var cls = s.score >= 70 ? 'green' : s.score < 40 && s.score > 0 ? 'red' : '';
    return '<div class="bar-row"><div class="bar-label">' + esc(lang === 'ar' ? s.ar : s.key) + '</div><div class="bar-track"><div class="bar-fill ' + cls + '" style="width:' + s.score + '%"></div></div><div class="bar-val">' + fmtN(s.score) + '%</div></div>';
  }).join('');

  var health = learningHealth(plan, st, kv);
  var weak = health.weak.map(function(s){ return lang === 'ar' ? s.ar : s.key; }).join(', ') || '-';
  var strong = health.strong.map(function(s){ return lang === 'ar' ? s.ar : s.key; }).join(', ') || '-';

  var focusHtml = '';
  if(window.PEL_ENGINE && plan && plan.profile){
    try{
      var skillData = scored.map(function(s){ return { key:s.key, score:s.score, prior:false }; });
      var af = PEL_ENGINE.adaptiveFocus(plan.profile, skillData);
      focusHtml = '<div class="card"><h3>' + esc(t('recommendedFocus')) + '</h3><div class="reason-list" style="margin-top:10px;">' +
        af.focus.map(function(f){ return '<div class="reason-item"><span class="badge-dot gold" style="margin-top:5px;"></span><div>' + esc(f) + '</div></div>'; }).join('') +
        '</div></div>';
    }catch(e){}
  }
  return '<div class="card"><h3>' + esc(t('skills')) + '</h3><div style="margin-top:14px;">' + bars + '</div></div>' +
    '<div class="section-title">' + esc(t('weakAreas')) + ' / ' + esc(t('strongAreas')) + '</div>' +
    '<div class="grid grid-2"><div class="card"><div class="sub">' + esc(t('weakAreas')) + '</div><div style="margin-top:8px; color:var(--danger); font-weight:600;">' + esc(weak) + '</div></div>' +
    '<div class="card"><div class="sub">' + esc(t('strongAreas')) + '</div><div style="margin-top:8px; color:var(--success); font-weight:600;">' + esc(strong) + '</div></div></div>' +
    focusHtml;
}
function renderTabRecommendations(plan, st, kv, d){
  var rec = computeNextRec(plan, st, kv);
  var html = '<div class="card" style="margin-bottom:16px;"><div class="sub" style="letter-spacing:.08em; text-transform:uppercase;">' + esc(t('todayRec')) + '</div>';
  if(rec.rec){
    var meta = '';
    if(rec.un && rec.un.remainingLessons != null){
      meta = '<span class="chip">' + esc(t('remainingStage').replace('%d', arNum(rec.un.remainingLessons))) + '</span>';
    }
    html += '<h3 style="margin-top:8px;">' + esc(lang === 'ar' ? rec.rec.titleAr : rec.rec.titleEn) + '</h3>' +
      '<div class="s360-meta" style="margin-top:8px;">' + meta + chip(esc(rec.rec.minutes ? t('est').replace('%d', arNum(rec.rec.minutes)) : ''), 'bronze') + '</div>' +
      '<div class="notice info" style="margin-top:12px;"><i data-lucide="sparkles" width="15" height="15"></i><div><b>' + esc(t('whyPEL')) + ':</b> ' + esc(lang === 'ar' ? rec.rec.whyAr : rec.rec.whyEn) + '</div></div>' +
      '<div class="btn-row" style="margin-top:14px;">' +
      '<button class="btn btn-gold btn-sm" data-action="accept-rec">' + esc(t('acceptRec')) + '</button>' +
      '<button class="btn btn-outline btn-sm" data-action="override-rec">' + esc(t('overrideRec')) + '</button>' +
      '<button class="btn btn-ghost btn-sm" data-action="dismiss-rec">' + esc(t('dismissRec')) + '</button></div>';
  }else{
    html += '<div class="sub" style="margin-top:8px;">' + esc(t('noPlan')) + '</div>';
  }
  html += '</div>';

  var stored = (d.recommendations || []).map(function(r){
    return '<div class="reason-item"><span class="badge-dot ' + (r.status === 'overridden' ? 'warn' : r.status === 'completed' ? 'green' : 'gold') + '" style="margin-top:5px;"></span>' +
      '<div><div>' + esc(lessonName(r.lesson_id)) + ' · ' + esc(academyName(r.academy_id, lang)) + '</div>' +
      '<span class="why">' + statusChip(r.status) + ' · ' + fmtDate(r.created_at) + (r.reason_en ? ' · ' + esc(r.reason_en) : '') + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noRecommendations')) + '</div>';

  return html + '<div class="section-title">' + esc(t('recommendations')) + '</div><div class="card"><div class="reason-list">' + stored + '</div></div>';
}
function renderTabInterventions(d){
  var list = (d.interventions || []).map(function(i){
    return '<div class="reason-item"><span class="badge-dot ' + (i.status === 'open' ? 'warn' : i.status === 'resolved' ? 'green' : 'gold') + '" style="margin-top:5px;"></span>' +
      '<div><div>' + esc(lang === 'ar' ? i.title_ar : i.title_en) + '</div>' +
      '<span class="why">' + statusChip(i.status) + ' · ' + esc(t('studentOf')) + ' · ' + fmtDate(i.created_at) + '</span>' +
      (i.reason_en ? '<span class="why">' + esc(lang === 'ar' ? i.reason_ar : i.reason_en) + '</span>' : '') + '</div></div>';
  }).join('') || '<div class="sub">' + esc(t('noInterventions')) + '</div>';

  var form = '';
  if(hasPerm('interventions.manage')){
    form = '<div class="card" style="margin-top:16px;"><h3>' + esc(t('assignIntervention')) + '</h3><div class="form-grid" style="margin-top:12px;">' +
      '<div class="field"><label>Type</label><select class="input" id="invType">' +
        [['practice','practice'],['reassign','reassign'],['live_focus','live_focus'],['checkin','checkin'],['support','support']].map(function(x){
          return '<option value="' + x[1] + '">' + esc(x[1]) + '</option>';
        }).join('') + '</select></div>' +
      '<div class="field"><label>' + esc(t('topic')) + ' (EN)</label><input class="input" id="invTitleEn" placeholder="Workplace Response Practice"></div>' +
      '<div class="field"><label>' + esc(t('topic')) + ' (AR)</label><input class="input" id="invTitleAr" placeholder="تدريب الرد في الدوام"></div>' +
      '<div class="field full"><label>Reason (EN)</label><textarea class="input" id="invReasonEn" rows="2" placeholder="Speaking declined over the last 3 sessions…"></textarea></div>' +
      '<div class="field full"><label>Reason (AR)</label><textarea class="input" id="invReasonAr" rows="2" placeholder="المحادثة تراجعت باخر ثلاث جلسات…"></textarea></div>' +
      '</div><div class="btn-row" style="margin-top:14px;"><button class="btn btn-gold btn-sm" id="invSave">' + esc(t('assign')) + '</button></div></div>';
  }
  return '<div class="card"><div class="reason-list">' + list + '</div></div>' + form;
}
function renderTabActivity(st, kv, d){
  var studyDays = kv['pel_study_days'] || [];
  var compDates = kv['pel_completion_dates'] || {};
  var recent = Object.keys(compDates).sort().reverse().slice(0, 12).map(function(k){
    var parts = k.split('::');
    return '<div class="reason-item"><span class="badge-dot green" style="margin-top:5px;"></span><div><div>' + esc(lessonName(parts[1])) + ' · ' + esc(academyName(parts[0], lang)) + '</div><span class="why">' + fmtDate(compDates[k]) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var att = (d.attendance || []).map(function(a){
    return '<div class="reason-item"><span class="badge-dot ' + (a.status === 'present' ? 'green' : a.status === 'absent' ? 'red' : 'warn') + '" style="margin-top:5px;"></span>' +
      '<div><div>' + esc(a.topic || '-') + '</div><span class="why">' + fmtDate(a.date) + ' · ' + statusChip(a.status) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noAttendance')) + '</div>';

  return '<div class="grid grid-2"><div><div class="section-title">' + esc(t('recentCompletions')) + ' (' + fmtN(studyDays.length) + ' ' + esc(t('totalLessons')) + ')</div><div class="card"><div class="reason-list">' + recent + '</div></div></div>' +
    '<div><div class="section-title">' + esc(t('attendance')) + '</div><div class="card"><div class="reason-list">' + att + '</div></div></div></div>';
}
function renderTabCertificates(d){
  var certs = (d.certificates || []).map(function(c){
    return '<div class="reason-item"><span class="badge-dot ' + (c.status === 'issued' ? 'green' : c.status === 'revoked' ? 'red' : 'gold') + '" style="margin-top:5px;"></span>' +
      '<div><div>' + esc(c.academy_en) + ' · ' + esc(c.student_name) + '</div>' +
      '<span class="why">' + esc(c.cert_id) + ' · ' + statusChip(c.status) + (c.revoke_reason ? ' · ' + esc(c.revoke_reason) : '') + '</span>' +
      (hasPerm('certificates.revoke') || hasPerm('certificates.issue') ? '<div class="btn-row" style="margin-top:8px;">' +
        (c.status === 'issued' && hasPerm('certificates.revoke') ? '<button class="btn btn-danger btn-sm" data-action="revoke-cert" data-cert="' + esc(c.cert_id) + '">' + esc(t('revoke')) + '</button>' : '') +
        (c.status === 'issued' && hasPerm('certificates.issue') ? '<button class="btn btn-outline btn-sm" data-action="reissue-cert" data-cert="' + esc(c.cert_id) + '">' + esc(t('reissue')) + '</button>' : '') +
        '</div>' : '') +
      '</div></div>';
  }).join('') || '<div class="sub">' + esc(t('noCertificates')) + '</div>';

  var issueBtn = hasPerm('certificates.issue') ? '<button class="btn btn-gold btn-sm" id="issueCertBtn" style="margin-inline-start:12px;">' + esc(t('issueCert')) + '</button>' : '';
  return '<div class="card"><div class="reason-list">' + certs + '</div></div>' + (issueBtn ? '<div class="btn-row" style="margin-top:16px;">' + issueBtn + '</div>' : '');
}
function renderTabTimeline(p, st, kv, d){
  var events = [];
  if(p.created_at) events.push({ date: p.created_at, icon:'user-plus', txt: lang === 'ar' ? 'تسجيل الحساب' : 'Account created' });
  var plan = p.plan;
  if(plan && plan.onboardingCompleted){
    var planDate = plan.updatedAt || plan.onboardingCompletedAt || p.created_at;
    events.push({ date: planDate, icon:'map', txt: lang === 'ar' ? 'بنا خطة التعلم الشخصية' : 'Personalized plan built', sub: plan.profile && (lang === 'ar' ? plan.profile.goalsAr : plan.profile.goalsEn) });
  }
  var compDates = kv['pel_completion_dates'] || {};
  Object.keys(compDates).forEach(function(k){
    var parts = k.split('::');
    events.push({ date: compDates[k] + 'T00:00:00', icon:'check-circle-2', txt: lang === 'ar' ? 'درس مكتمل' : 'Lesson completed', sub: lessonName(parts[1]) + '، ' + academyName(parts[0], lang) });
  });
  (d.certificates || []).forEach(function(c){
    events.push({ date: c.created_at, icon:'graduation-cap', txt: lang === 'ar' ? 'اصدار شهادة' : 'Certificate issued', sub: c.academy_en + '، ' + c.cert_id, cls: c.status === 'revoked' ? 'red' : '' });
  });
  (d.interventions || []).forEach(function(i){
    events.push({ date: i.created_at, icon:'activity', txt: lang === 'ar' ? 'تدخل' : 'Intervention', sub: lang === 'ar' ? i.title_ar : i.title_en, cls:'warn' });
  });
  (d.overrides || []).forEach(function(o){
    events.push({ date: o.created_at, icon:'git-branch', txt: lang === 'ar' ? 'تجاوز توصية' : 'Recommendation overridden', sub: o.reason || '' , cls:'warn'});
  });
  (d.attendance || []).forEach(function(a){
    events.push({ date: a.date + 'T00:00:00', icon:'video', txt: lang === 'ar' ? 'درس مباشر' : 'Live class', sub: a.topic + '، ' + t(a.status) });
  });
  (d.subscriptions || []).forEach(function(s){
    events.push({ date: s.start_date + 'T00:00:00', icon:'credit-card', txt: lang === 'ar' ? 'اشتراك برنامج' : 'Program subscription', sub: lang === 'ar' ? s.program_ar : s.program_en });
  });
  (d.snapshots || []).forEach(function(s){
    events.push({ date: s.snapshot_date + 'T00:00:00', icon:'camera', txt: lang === 'ar' ? 'لقطة تعلم' : 'Learning snapshot', sub: s.level || '' });
  });
  events.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
  var html = events.slice(0, 60).map(function(e){
    return '<div class="tl-item"><div class="tl-time">' + fmtDate(e.date) + '</div><div class="tl-body">' + esc(e.txt) + '</div>' + (e.sub ? '<div class="tl-sub">' + esc(e.sub) + '</div>' : '') + '</div>';
  }).join('') || '<div class="sub">' + esc(t('noTimeline')) + '</div>';
  return '<div class="card"><div class="timeline">' + html + '</div></div>';
}
function renderTabNotes(d){
  var list = (d.notes || []).map(function(n){
    return '<div class="reason-item"><span class="badge-dot muted" style="margin-top:5px;"></span>' +
      '<div><div>' + esc(n.body) + '</div><span class="why">' + chip(n.category, 'bronze') + ' ' + esc(n.author_name || '-') + ' · ' + fmtDate(n.created_at) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noNotes')) + '</div>';

  var form = '';
  if(hasPerm('students.write')){
    form = '<div class="card" style="margin-top:16px;"><h3>' + esc(t('addNote')) + '</h3>' +
      '<div class="field" style="margin-top:10px;"><textarea class="input" id="noteBody" rows="3" placeholder="' + esc(t('noteBody')) + '"></textarea></div>' +
      '<div class="btn-row" style="margin-top:12px;"><button class="btn btn-gold btn-sm" id="noteSave">' + esc(t('addNote')) + '</button></div></div>';
  }
  return '<div class="card"><div class="reason-list">' + list + '</div></div>' + form;
}
function renderTabAudit(d){
  var list = (d.audit || []).map(function(a){
    return '<div class="reason-item"><span class="badge-dot muted" style="margin-top:5px;"></span>' +
      '<div><div>' + esc(a.action) + '</div><span class="why">' + esc(a.actor || '-') + ' · ' + fmtDate(a.created_at) + (a.target_id ? ' · ' + esc(a.target_id) : '') + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';
  return '<div class="card"><div class="reason-list">' + list + '</div></div>';
}
function wire360Actions(){
  /* accept / override / dismiss current recommendation */
  var accept = document.querySelector('[data-action="accept-rec"]');
  if(accept) accept.addEventListener('click', acceptRec);
  var override = document.querySelector('[data-action="override-rec"]');
  if(override) override.addEventListener('click', overrideRec);
  var dismiss = document.querySelector('[data-action="dismiss-rec"]');
  if(dismiss) dismiss.addEventListener('click', dismissRec);
  var invSave = $('invSave');
  if(invSave) invSave.addEventListener('click', saveIntervention);
  var noteSave = $('noteSave');
  if(noteSave) noteSave.addEventListener('click', saveNote);
  var prSave = $('prSave');
  if(prSave) prSave.addEventListener('click', saveProfile);
  var snap = $('snapBtn');
  if(snap) snap.addEventListener('click', saveSnapshot);
  var issue = $('issueCertBtn');
  if(issue) issue.addEventListener('click', function(){ openCertIssueModal(current360Uid); });
  document.querySelectorAll('[data-action="revoke-cert"]').forEach(function(b){
    b.addEventListener('click', function(){ revokeCert(b.getAttribute('data-cert')); });
  });
  document.querySelectorAll('[data-action="reissue-cert"]').forEach(function(b){
    b.addEventListener('click', function(){ reissueCert(b.getAttribute('data-cert')); });
  });
}
function currentPlan(){ return current360 && current360.profile && current360.profile.plan; }
async function acceptRec(){
  var rec = computeNextRec(currentPlan(), current360.state, current360.kv);
  if(!rec.rec){ return; }
  var { ok, error } = await rpc('accept_recommendation', { p_user_id: current360Uid, p_academy_id: rec.rec.academyId, p_lesson_id: rec.rec.lessonId, p_reason_en: rec.rec.whyEn, p_reason_ar: rec.rec.whyAr });
  if(!ok){ toast(t('permissionDenied'), true); return; }
  await audit('recommendation.accept', 'student', current360Uid, { academy_id: rec.rec.academyId, lesson_id: rec.rec.lessonId });
  toast(t('saved'));
  reload360();
}
async function dismissRec(){
  var rec = computeNextRec(currentPlan(), current360.state, current360.kv);
  if(!rec.rec){ return; }
  var { ok } = await rpc('store_recommendation', { p_user_id: current360Uid, p_academy_id: rec.rec.academyId, p_lesson_id: rec.rec.lessonId, p_reason_en: rec.rec.whyEn, p_reason_ar: rec.rec.whyAr, p_status: 'dismissed' });
  await audit('recommendation.dismiss', 'student', current360Uid, {});
  toast(t('saved'));
  reload360();
}
function overrideRec(){
  var rec = computeNextRec(currentPlan(), current360.state, current360.kv);
  if(!rec.rec){ return; }
  var s = modal(t('overrideRec'), '' +
    '<div class="field" style="margin-bottom:12px;"><label>' + esc(t('replacementLesson')) + '</label><input class="input" id="ovRepl" placeholder="conversation-practice / academy::lesson"></div>' +
    '<div class="field"><label>' + esc(t('overrideReason')) + '</label><textarea class="input" id="ovReason" rows="3" placeholder="' + esc(t('overrideReason')) + '"></textarea></div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="ovSave">' + esc(t('save')) + '</button><button class="btn btn-ghost btn-sm" data-close>Cancel</button></div>');
  $('ovSave').addEventListener('click', async function(){
    var repl = $('ovRepl').value.trim();
    var reason = $('ovReason').value.trim();
    if(!repl){ toast(t('required'), true); return; }
    var parts = repl.split('::');
    var academyId = parts.length === 2 ? parts[0] : rec.rec.academyId;
    var lessonId = parts.length === 2 ? parts[1] : repl;
    var r = await rpc('teacher_override', { p_user_id: current360Uid, p_original_academy_id: rec.rec.academyId, p_original_lesson_id: rec.rec.lessonId, p_replaced_academy_id: academyId, p_replaced_lesson_id: lessonId, p_reason: reason });
    if(!r.ok){ toast(rpcErrMsg(r), true); return; }
    await audit('recommendation.override', 'student', current360Uid, { original: rec.rec.lessonId, replaced: lessonId });
    closeModal(s);
    toast(t('saved'));
    reload360();
  });
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
}
async function saveIntervention(){
  var type = $('invType').value;
  var titleEn = $('invTitleEn').value.trim();
  var titleAr = $('invTitleAr').value.trim();
  var reasonEn = $('invReasonEn').value.trim();
  var reasonAr = $('invReasonAr').value.trim();
  if(!titleEn){ toast(t('required'), true); return; }
  var c = client();
  var { error } = await c.from('interventions').insert({
    user_id: current360Uid, type: type, title_en: titleEn, title_ar: titleAr || titleEn,
    reason_en: reasonEn, reason_ar: reasonAr, status: 'open', assignee_role: me.role, created_by: me.id
  });
  if(error){ toast((error && (error.message || String(error))) || t('permissionDenied'), true); return; }
  await audit('intervention.assign', 'student', current360Uid, { type: type, title: titleEn });
  toast(t('saved'));
  reload360();
}
async function saveNote(){
  var body = $('noteBody').value.trim();
  if(!body){ toast(t('required'), true); return; }
  var c = client();
  var { error } = await c.from('student_notes').insert({ user_id: current360Uid, author_user_id: me.id, category: 'note', body: body });
  if(error){ toast((error && (error.message || String(error))) || t('permissionDenied'), true); return; }
  await audit('student.note', 'student', current360Uid, {});
  toast(t('saved'));
  reload360();
}
async function saveProfile(){
  var c = client();
  var { error } = await c.from('student_profiles').upsert({
    user_id: current360Uid,
    phone: $('prPhone').value.trim(), whatsapp: $('prWhatsapp').value.trim(),
    status: $('prStatus').value, intake: $('prIntake').value.trim(),
    enrollment_date: $('prEnr').value || null, notes: $('prNotes').value.trim(),
    updated_at: new Date().toISOString()
  });
  if(error){ toast((error && (error.message || String(error))) || t('permissionDenied'), true); return; }
  await audit('student.edit', 'student', current360Uid, { status: $('prStatus').value });
  toast(t('saved'));
  reload360();
}
async function saveSnapshot(){
  var st = current360.state || {};
  var completed = st.completed_lessons || [];
  var route = currentPlan() && currentPlan().route;
  var level = currentPlan() && currentPlan().profile && currentPlan().profile.estimatedStartingLevel;
  var scores = {};
  var specs = ['speaking-studio','listening-lounge','grammar-academy','vocabulary-vault','american-accent-lab','writing-workshop'];
  specs.forEach(function(a){ scores[a] = academyProgress(a, completed); });
  var c = client();
  var { error } = await c.from('learning_snapshots').insert({
    user_id: current360Uid, snapshot_date: new Date().toISOString().slice(0,10),
    level: level, skill_scores: scores, xp: st.xp || 0, completed_lessons: completed.length
  });
  if(error){ toast((error && (error.message || String(error))) || t('permissionDenied'), true); return; }
  await audit('student.snapshot', 'student', current360Uid, {});
  toast(t('snapshotSaved'));
  reload360();
}
async function reload360(){
  var r = await rpc('admin_student_360', { p_user_id: current360Uid });
  if(r.ok){ current360 = r.data; render360(); }
}
async function revokeCert(certId){
  var s = modal(t('revoke'), '<div class="field"><label>' + esc(t('revokeReason')) + '</label><textarea class="input" id="revReason" rows="3"></textarea></div>' +
    '<div class="btn-row"><button class="btn btn-danger btn-sm" id="revGo">' + esc(t('revoke')) + '</button><button class="btn btn-ghost btn-sm" data-close>Cancel</button></div>');
  $('revGo').addEventListener('click', async function(){
    var r = await rpc('revoke_certificate', { p_cert_id: certId, p_reason: $('revReason').value.trim() });
    closeModal(s);
    if(!r.ok){ toast(r.error && r.error.message || t('permissionDenied'), true); return; }
    toast(t('certRevoked'));
    reload360();
  });
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
}
async function reissueCert(certId){
  var r = await rpc('reissue_certificate', { p_cert_id: certId });
  if(!r.ok){ toast(r.error && r.error.message || t('permissionDenied'), true); return; }
  toast(t('certReissued'));
  reload360();
}

/* ---- read-only student preview (Phase 42) ---- */
function renderPreview(){
  var d = current360;
  var p = d.profile || {};
  var plan = p.plan;
  var st = d.state || {};
  var completed = st.completed_lessons || [];
  var rec = computeNextRec(plan, st, d.kv);
  var prog = plan && plan.estimate;
  var total = 0;
  if(plan && plan.route){ plan.route.forEach(function(sg){ sg.units.forEach(function(u){ total += (u.lessonIds||[]).length; }); }); }
  var pct = total ? Math.round(100 * completed.length / total) : 0;

  var s = modal(t('preview'), '<div class="notice info">' + esc(t('previewNote')) + '</div>' +
    '<div class="card" style="margin-top:14px;">' +
    '<div class="sub" style="letter-spacing:.08em; text-transform:uppercase;">' + esc(t('student360')) + '</div>' +
    '<h3 style="margin-top:6px;">' + esc(p.full_name || '-') + '</h3>' +
    '<div class="s360-meta" style="margin-top:8px;">' +
      chip((plan && plan.profile && plan.profile.estimatedStartingLevel) || 'A1', 'gold') + ' → ' +
      chip((plan && plan.profile && plan.profile.targetLevel) || '-', '') +
      (rec.rec && rec.rec.minutes ? chip(esc(t('est').replace('%d', arNum(rec.rec.minutes))), 'bronze') : '') +
    '</div></div>' +
    '<div class="card" style="margin-top:12px;"><div class="sub">' + esc(t('todayRec')) + '</div>' +
    '<h3 style="margin-top:6px;">' + esc(rec.rec ? (lang === 'ar' ? rec.rec.titleAr : rec.rec.titleEn) : t('noPlan')) + '</h3>' +
    (rec.rec ? '<div class="sub" style="margin-top:6px;">' + esc(lang === 'ar' ? rec.rec.whyAr : rec.rec.whyEn) + '</div>' : '') + '</div>' +
    '<div class="card" style="margin-top:12px;"><div class="bar-row"><div class="bar-label">' + esc(t('progress')) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div><div class="bar-val">' + fmtN(pct) + '%</div></div>' +
    '<div style="margin-top:6px; color:var(--text-muted); font-size:.78rem;">' + esc(t('lessonsDone').replace('%d', arNum(completed.length))) + ' · ' + fmtN(st.xp) + ' XP</div></div>' +
    '<div class="btn-row" style="margin-top:16px;"><button class="btn btn-outline btn-sm" data-close>' + esc(t('close')) + '</button></div>', false);
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
}

/* ============================================================
   10. TEACHERS (Phase 21)
   ============================================================ */
async function teachers(){
  $('viewArea').innerHTML = pageHead(t('teachers'), '') + loadingBlock();
  var r = await rpc('admin_teachers');
  if(!r.ok){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];
  var list = rows.map(function(x){
    return '<div class="reason-item"><span class="avatar-circle" style="width:30px; height:30px; font-size:.78rem;">' + esc((x.full_name||'?').charAt(0).toUpperCase()) + '</span>' +
      '<div><div style="font-weight:600;">' + esc(x.full_name) + '</div>' +
      '<span class="why">' + esc(x.email) + ' · ' + statusChip(x.status) + '</span>' +
      '<span class="why">' + fmtN(x.groups) + ' ' + esc(t('groupsCount')) + ' · ' + fmtN(x.students) + ' ' + esc(t('students')) + '</span></div></div>';
  }).join('') || emptyBlock(t('noData'));
  $('viewArea').innerHTML = pageHead(t('teachers'), '') +
    '<div class="card"><div class="reason-list">' + list + '</div></div>' +
    (hasPerm('teachers.write') ? '<div class="card" style="margin-top:16px;"><h3>' + esc(t('newTeacher')) + '</h3><div class="form-grid" style="margin-top:12px;">' +
      '<div class="field"><label>' + esc(t('name')) + '</label><input class="input" id="tchName"></div>' +
      '<div class="field"><label>' + esc(t('email')) + '</label><input class="input" id="tchEmail" type="email"></div>' +
      '<div class="field"><label>' + esc(t('phone')) + '</label><input class="input" id="tchPhone"></div>' +
      '<div class="field"><label>' + esc(t('status')) + '</label><select class="input" id="tchStatus"><option value="active">' + esc(t('active')) + '</option><option value="inactive">' + esc(t('inactive')) + '</option></select></div>' +
      '</div><div class="btn-row" style="margin-top:14px;"><button class="btn btn-gold btn-sm" id="tchSave">' + esc(t('create')) + '</button></div></div>' : '');
  var btn = $('tchSave');
  if(btn) btn.addEventListener('click', async function(){
    var name = $('tchName').value.trim(), email = $('tchEmail').value.trim(), phone = $('tchPhone').value.trim();
    if(!name || !email){ toast(t('required'), true); return; }
    /* The teacher must already exist as an auth user (created via the Supabase
       Dashboard > Authentication > Add user). The RPC matches by email and
       records the teacher profile + role. */
    var r2 = await rpc('admin_create_teacher', { p_email: email, p_full_name: name, p_phone: phone || null, p_status: $('tchStatus').value });
    if(!r2.ok){ toast(r2.error && r2.error.message ? r2.error.message : t('errorGeneric'), true); return; }
    await audit('teacher.create', 'user', (r2.data && r2.data.id) || '', {});
    toast(t('saved'));
    teachers();
  });
}/* ============================================================
   11. GROUPS (Phases 22-26)
   ============================================================ */
async function groups(){
  $('viewArea').innerHTML = pageHead(t('groups'), lang === 'ar' ? 'المجموعات والصفوف' : 'Groups and classes') + loadingBlock();
  var r = await rpc('admin_groups');
  if(!r.ok){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];

  var cards = rows.map(function(g){
    var seats = g.capacity - g.member_count;
    var capChip = g.member_count >= g.capacity
      ? chip(t('groupFull'), 'warn')
      : chip(t('availableSeats').replace('%d', arNum(seats)), 'bronze');
    return '<div class="card" style="margin-bottom:14px;">' +
      '<div class="s360-meta" style="margin-top:0;">' +
        '<a class="row-link" data-open-group="' + g.id + '" style="font-weight:700;">' + esc(g.name) + '</a>' +
        statusChip(g.status) + capChip +
      '</div>' +
      '<div class="s360-meta" style="margin-top:10px;">' +
        chip(esc(g.course_id ? academyName(g.course_id, lang) : '-'), '') +
        (g.level ? chip(esc(g.level), 'gold') : '') +
        (g.teacher_name ? chip(esc(g.teacher_name), 'green') : '') +
      '</div>' +
      '<div class="s360-meta" style="margin-top:10px; color:var(--text-muted); font-size:.76rem;">' +
        '<span>' + fmtN(g.member_count) + ' ' + esc(t('members')) + '</span>' +
        '<span>· ' + fmtN(g.waitlist_count) + ' ' + esc(t('waitlist')) + '</span>' +
        (g.schedule ? '<span>· ' + esc(g.schedule) + '</span>' : '') +
      '</div>' +
      '<div class="btn-row" style="margin-top:14px;">' +
      '<button class="btn btn-outline btn-sm" data-open-group="' + g.id + '">' + esc(t('openGroup')) + '</button>' +
      (hasPerm('groups.manage') ? '<button class="btn btn-ghost btn-sm" data-edit-group="' + g.id + '">' + esc(t('edit')) + '</button>' : '') +
      '</div></div>';
  }).join('') || emptyBlock(t('noData'));

  var createBtn = hasPerm('groups.manage') ? '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-gold btn-sm" id="newGroupBtn">' + esc(t('createGroup')) + '</button></div>' : '';
  $('viewArea').innerHTML = pageHead(t('groups'), lang === 'ar' ? 'المجموعات والتسجيل' : 'Groups and registration') +
    createBtn + '<div class="grid grid-3">' + cards + '</div>';
  loadIcons();

  var nb = $('newGroupBtn');
  if(nb) nb.addEventListener('click', function(){ groupForm(null); });
  document.querySelectorAll('[data-open-group]').forEach(function(el){
    el.addEventListener('click', function(){ goTo('groupDetail', el.getAttribute('data-open-group')); });
  });
  document.querySelectorAll('[data-edit-group]').forEach(function(el){
    el.addEventListener('click', function(){
      var g = rows.find(function(x){ return x.id === el.getAttribute('data-edit-group'); });
      if(g) groupForm(g);
    });
  });
}
function groupForm(existing){
  var isEdit = !!existing;
  var s = modal(isEdit ? t('editGroup') : t('createGroup'), '' +
    '<div class="form-grid">' +
      '<div class="field"><label>' + esc(t('name')) + '</label><input class="input" id="grName" value="' + esc(existing ? existing.name : '') + '"></div>' +
      '<div class="field"><label>' + esc(t('course')) + '</label><input class="input" id="grCourse" value="' + esc(existing ? existing.course_id : '') + '" placeholder="speaking-studio"></div>' +
      '<div class="field"><label>' + esc(t('level')) + '</label><input class="input" id="grLevel" value="' + esc(existing ? existing.level : '') + '" placeholder="A2"></div>' +
      '<div class="field"><label>' + esc(t('capacity')) + '</label><input class="input" id="grCap" type="number" min="1" value="' + (existing ? existing.capacity : 8) + '"></div>' +
      '<div class="field"><label>' + esc(t('schedule')) + '</label><input class="input" id="grSched" value="' + esc(existing ? existing.schedule : '') + '" placeholder="Sun 7PM"></div>' +
      '<div class="field"><label>' + esc(t('status')) + '</label><select class="input" id="grStatus">' +
        [['active','active'],['paused','paused'],['archived','archived']].map(function(x){
          return '<option value="' + x[1] + '"' + (existing && existing.status === x[1] ? ' selected' : '') + '>' + esc(t(x[1])) + '</option>';
        }).join('') + '</select></div>' +
      '<div class="field full"><label>' + esc(t('teacher')) + '</label><select class="input" id="grTeacher"><option value="">-</option></select></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="grSave">' + esc(t('save')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  (async function(){
    var t = await rpc('admin_teachers');
    var tsel = $('grTeacher');
    if(t.ok) (t.data || []).forEach(function(x){
      var o = document.createElement('option');
      o.value = x.id; o.textContent = x.full_name;
      if(existing && existing.teacher_id === x.id) o.selected = true;
      tsel.appendChild(o);
    });
  })();
  $('grSave').addEventListener('click', async function(){
    var payload = {
      name: $('grName').value.trim(),
      course_id: $('grCourse').value.trim() || null,
      level: $('grLevel').value.trim() || null,
      capacity: Math.max(1, parseInt($('grCap').value, 10) || 1),
      schedule: $('grSched').value.trim() || null,
      status: $('grStatus').value,
      teacher_id: $('grTeacher').value || null
    };
    if(!payload.name){ toast(t('required'), true); return; }
    var c = client();
    if(isEdit){
      var r = await c.from('groups').update(Object.assign({}, payload, { updated_at: new Date().toISOString() })).eq('id', existing.id);
      if(r.error){ toast(t('permissionDenied'), true); return; }
      await audit('group.edit', 'group', existing.id, { name: payload.name });
    }else{
      var r2 = await c.from('groups').insert(payload);
      if(r2.error){ toast(t('permissionDenied'), true); return; }
      await audit('group.create', 'group', (r2.data && r2.data[0] && r2.data[0].id) || '', { name: payload.name });
    }
    closeModal(s);
    toast(t('saved'));
    groups();
  });
}

/* ============================================================
   12. GROUP DETAIL (roster + waitlist)
   ============================================================ */
async function groupDetail(id){
  $('viewArea').innerHTML = pageHead(t('group'), '') + loadingBlock();
  var r = await rpc('admin_group_detail', { p_group_id: id });
  if(!r.ok){ $('viewArea').innerHTML = errBlock(r.error && r.error.message); return; }
  var d = r.data;
  var g = d.group || {};
  var members = d.members || [];
  var waitlist = d.waitlist || [];

  var memberHtml = members.map(function(m){
    return '<div class="reason-item"><span class="avatar-circle" style="width:28px;height:28px;font-size:.72rem;">' + esc((m.full_name || '?').charAt(0).toUpperCase()) + '</span>' +
      '<div style="flex:1;"><div style="font-weight:600;">' + esc(m.full_name) + '</div><span class="why">' + esc(m.email || '') + '</span></div>' +
      statusChip(m.status) +
      (hasPerm('groups.manage') ? '<button class="btn btn-danger btn-sm" data-rm-member="' + m.id + '">' + esc(t('removeStudent')) + '</button>' : '') +
      '</div>';
  }).join('') || emptyBlock(t('noData'));

  var waitHtml = waitlist.map(function(m){
    return '<div class="reason-item"><span class="avatar-circle" style="width:28px;height:28px;font-size:.72rem;">' + esc((m.full_name || '?').charAt(0).toUpperCase()) + '</span>' +
      '<div style="flex:1;"><div style="font-weight:600;">' + esc(m.full_name) + '</div><span class="why">' + esc(m.email || '') + '</span></div>' +
      (hasPerm('groups.manage') ? '<button class="btn btn-gold btn-sm" data-move-in="' + m.id + '">' + esc(t('moveFromWaitlist')) + '</button>' : '') +
      '</div>';
  }).join('') || emptyBlock(t('noData'));

  var manageBar = hasPerm('groups.manage') ?
    '<div class="btn-row" style="margin-bottom:16px;">' +
    '<button class="btn btn-gold btn-sm" id="addMemberBtn">' + esc(t('addStudent')) + '</button>' +
    '<button class="btn btn-outline btn-sm" id="assignTeacherBtn">' + esc(t('assignTeacher')) + '</button>' +
    '</div>' : '';

  $('viewArea').innerHTML = pageHead(t('group'), esc(g.name || '')) +
    '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-ghost btn-sm" data-goback="">' + esc(t('back')) + '</button></div>' +
    '<div class="card" style="margin-bottom:18px;">' +
    '<div class="s360-meta" style="margin-top:0;">' + statusChip(g.status) +
      chip(esc(g.level || '-'), 'gold') + chip(esc(g.course_id ? academyName(g.course_id, lang) : '-'), '') +
      (g.teacher_name ? chip(esc(g.teacher_name), 'green') : '') + '</div>' +
    '<div class="s360-meta" style="margin-top:10px; color:var(--text-muted); font-size:.76rem;">' +
      '<span>' + fmtN(members.length) + ' / ' + fmtN(g.capacity) + ' ' + esc(t('members')) + '</span>' +
      (g.schedule ? '<span>· ' + esc(g.schedule) + '</span>' : '') +
      (g.program_name ? '<span>· ' + esc(g.program_name) + '</span>' : '') +
    '</div></div>' +
    manageBar +
    '<div class="grid grid-2"><div><div class="section-title">' + esc(t('roster')) + '</div><div class="card"><div class="reason-list">' + memberHtml + '</div></div></div>' +
    '<div><div class="section-title">' + esc(t('waitlist')) + '</div><div class="card"><div class="reason-list">' + waitHtml + '</div></div></div></div>';
  loadIcons();
  var back = document.querySelector('[data-goback]');
  if(back) back.addEventListener('click', function(){ goTo('groups'); });
  var ab = $('addMemberBtn');
  if(ab) ab.addEventListener('click', function(){ addMemberModal(id); });
  var at = $('assignTeacherBtn');
  if(at) at.addEventListener('click', function(){ assignTeacherModal(id); });
  document.querySelectorAll('[data-rm-member]').forEach(function(b){
    b.addEventListener('click', async function(){
      var uid = b.getAttribute('data-rm-member');
      var r = await rpc('admin_group_remove', { p_group_id: id, p_user_id: uid });
      if(!r.ok){ toast(rpcErrMsg(r), true); return; }
      toast(t('saved'));
      groupDetail(id);
    });
  });
  document.querySelectorAll('[data-move-in]').forEach(function(b){
    b.addEventListener('click', async function(){
      var uid = b.getAttribute('data-move-in');
      var r = await rpc('admin_group_move', { p_group_id: id, p_user_id: uid });
      if(!r.ok){ toast(r.error && r.error.message || t('groupFull'), true); return; }
      toast(t('saved'));
      groupDetail(id);
    });
  });
}
function addMemberModal(groupId){
  var s = modal(t('addStudent'), '' +
    '<div class="field" style="margin-bottom:12px;"><input class="input" id="amSearch" placeholder="' + esc(t('searchPlaceholder')) + '"></div>' +
    '<div id="amResults"></div>' +
    '<div class="btn-row"><button class="btn btn-ghost btn-sm" data-close>' + esc(t('close')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  var input = $('amSearch');
  var results = $('amResults');
  var timer = null;
  input.addEventListener('input', function(){
    clearTimeout(timer);
    timer = setTimeout(async function(){
      var q = input.value.trim();
      if(q.length < 2){ results.innerHTML = ''; return; }
      results.innerHTML = loadingBlock();
      var r = await rpc('admin_students', { p_limit: 8, p_offset: 0, p_search: q, p_filters: {}, p_sort: 'name:asc' });
      if(!r.ok){ results.innerHTML = errBlock(rpcErrMsg(r)); return; }
      results.innerHTML = (r.data || []).map(function(st){
        return '<div class="reason-item"><div style="flex:1;"><div style="font-weight:600;">' + esc(st.full_name) + '</div><span class="why">' + esc(st.email || '') + '</span></div>' +
          '<button class="btn btn-gold btn-sm" data-pick="' + st.id + '">' + esc(t('addStudent')) + '</button></div>';
      }).join('') || emptyBlock(t('noResults'));
      results.querySelectorAll('[data-pick]').forEach(function(b){
        b.addEventListener('click', async function(){
          var r2 = await rpc('admin_group_add', { p_group_id: groupId, p_user_id: b.getAttribute('data-pick') });
          if(!r2.ok){ toast(r2.error && r2.error.message || t('permissionDenied'), true); return; }
          closeModal(s);
          toast(t('saved'));
          groupDetail(groupId);
        });
      });
    }, 350);
  });
}
function createStudentModal(st){
  var s = modal(t('newStudent'), '' +
    '<div class="form-grid">' +
    '<div class="field" style="grid-column:1/-1;"><label>' + esc(t('name')) + '</label><input class="input" id="csName" placeholder="' + esc(t('name')) + '"></div>' +
    '<div class="field"><label>' + esc(t('email')) + '</label><input class="input" id="csEmail" type="email" placeholder="student@example.com"></div>' +
    '<div class="field"><label>' + esc(t('password')) + '</label><div style="display:flex; gap:6px;"><input class="input" id="csPass" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" style="flex:1;"><button type="button" class="btn btn-ghost btn-sm" id="csToggle" style="flex:0 0 auto;">' + esc(t('showPassword')) + '</button></div><span class="why">' + esc(t('passwordHint')) + '</span></div>' +
    '</div>' +
    '<div class="btn-row" style="margin-top:16px;"><button class="btn btn-gold btn-sm" id="csSave">' + esc(t('create')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  var tog = $('csToggle');
  if(tog) tog.addEventListener('click', function(){ var inp = $('csPass'); var show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; tog.textContent = show ? t('hidePassword') : t('showPassword'); });
  var save = $('csSave');
  if(save) save.addEventListener('click', async function(){
    var name = $('csName').value.trim(), email = $('csEmail').value.trim(), pass = $('csPass').value;
    if(!name || !email || !pass){ toast(t('required'), true); return; }
    save.disabled = true; save.textContent = '\u2026';
    var r = await rpc('admin_create_student', { p_email: email, p_password: pass, p_full_name: name });
    save.disabled = false; save.textContent = t('create');
    if(!r.ok){ toast((r.error && r.error.message) ? r.error.message : t('errorGeneric'), true); return; }
    await audit('student.create', 'user', (r.data && r.data.user_id) || '', { email: email, full_name: name });
    closeModal(s);
    toast(t('studentCreated'));
    st.page = 0; loadStudents(st);
  });
}
function assignTeacherModal(groupId){
  var s = modal(t('assignTeacher'), '<select class="input" id="atSel"><option value="">-</option></select>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="atSave">' + esc(t('assign')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  (async function(){
    var t = await rpc('admin_teachers');
    var sel = $('atSel');
    if(t.ok) (t.data || []).forEach(function(x){
      var o = document.createElement('option'); o.value = x.id; o.textContent = x.full_name; sel.appendChild(o);
    });
  })();
  $('atSave').addEventListener('click', async function(){
    var val = $('atSel').value;
    var c = client();
    var r = await c.from('groups').update({ teacher_id: val || null, updated_at: new Date().toISOString() }).eq('id', groupId);
    if(r.error){ toast(t('permissionDenied'), true); return; }
    await audit('group.teacher', 'group', groupId, { teacher_id: val });
    closeModal(s);
    toast(t('saved'));
    groupDetail(groupId);
  });
}

/* ============================================================
   13. LESSONS (DB-driven curriculum manager)
   Reads the full tree (incl. hidden) straight from the tables and
   mutates through the admin_* curriculum RPCs. Students get every
   change on their next app session via student_curriculum().
   ============================================================ */
var _cur = { academies: [], lessons: {}, links: {} };

async function courses(){
  var canManage = hasPerm('curriculum.manage');
  $('viewArea').innerHTML = pageHead(t('courses'), t('lessonsManagerSub')) + loadingBlock();
  var c = client();
  var res = await Promise.all([
    c.from('academies').select('*').order('sort_order').order('id'),
    c.from('lessons').select('*'),
    c.from('academy_lessons').select('academy_id,lesson_id,sort_order'),
    c.from('lesson_items').select('lesson_id'),
    c.from('lesson_exercises').select('lesson_id,type')
  ]);
  if(res[0].error || res[1].error || res[2].error){ $('viewArea').innerHTML = errBlock(rpcErrMsg({error: res[0].error || res[1].error || res[2].error})); return; }
  _cur.academies = res[0].data || [];
  _cur.lessons = {};
  var itemCounts = {}, exCounts = {};
  (res[3].data || []).forEach(function(r){ itemCounts[r.lesson_id] = (itemCounts[r.lesson_id] || 0) + 1; });
  (res[4].data || []).forEach(function(r){ if(!r.error) exCounts[r.lesson_id] = (exCounts[r.lesson_id] || 0) + 1; });
  (res[1].data || []).forEach(function(l){
    l.items_count = itemCounts[l.id] || 0;
    l.exercises_count = exCounts[l.id] || 0;
    _cur.lessons[l.id] = l;
  });
  _cur.links = {};
  (res[2].data || []).forEach(function(k){
    (_cur.links[k.academy_id] = _cur.links[k.academy_id] || []).push(k);
  });
  Object.keys(_cur.links).forEach(function(aid){
    _cur.links[aid].sort(function(x, y){ return x.sort_order - y.sort_order; });
  });

  var totalLessons = Object.keys(_cur.lessons).length;
  var activeAcads = _cur.academies.filter(function(a){ return a.active; }).length;
  var cards = _cur.academies.map(academyCard).join('') || emptyBlock(t('noCourses'));
  $('viewArea').innerHTML = pageHead(t('courses'), lang === 'ar' ? 'المنهج الكامل - يوصل للطلاب فوراً' : 'The full catalog - reaches students instantly') +
    '<div class="kpi-grid">' +
      '<div class="kpi-card accent"><div class="k-label">' + esc(t('academyCount')) + '</div><div class="k-value">' + fmtN(activeAcads) + '</div></div>' +
      '<div class="kpi-card"><div class="k-label">' + esc(lang === 'ar' ? 'اجمالي الدروس' : 'Total lessons') + '</div><div class="k-value">' + fmtN(totalLessons) + '</div></div>' +
    '</div>' +
    (canManage ? '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-gold btn-sm" id="newLessonBtn"><i data-lucide="plus" width="15" height="15"></i> ' + esc(t('newLesson')) + '</button><button class="btn btn-outline btn-sm" id="newAcademyBtn">' + esc(t('newAcademy')) + '</button></div>' : '') +
    '<div style="display:grid; gap:14px;">' + cards + '</div>';
  loadIcons();
  if(!canManage) return;
  var nlb = $('newLessonBtn');
  if(nlb) nlb.addEventListener('click', function(){ lessonForm(null, null); });
  var nab = $('newAcademyBtn');
  if(nab) nab.addEventListener('click', function(){ academyForm(null); });
}

function academyCard(a){
  var canManage = hasPerm('curriculum.manage');
  var links = _cur.links[a.id] || [];
  var mins = 0;
  links.forEach(function(k){ var l = _cur.lessons[k.lesson_id]; if(l) mins += l.minutes || 0; });
  var diffLabel = { 'Beginner':'diffBeginner', 'Intermediate':'diffIntermediate', 'Advanced':'diffAdvanced', 'All Levels':'diffAll' }[a.difficulty] || 'diffAll';
  var rows = links.map(function(k, i){
    var l = _cur.lessons[k.lesson_id];
    if(!l) return '';
    return '<div class="reason-item" data-lrow="' + esc(l.id) + '">' +
      '<span class="why" style="min-width:26px; text-align:center; color:var(--text-muted);">' + arNum(i + 1) + '</span>' +
      '<div style="flex:1;"><div style="font-weight:600;">' + esc(lang === 'ar' ? l.title_ar : l.title_en) + '</div>' +
      '<span class="why">' + esc(lang === 'ar' ? l.title_en : l.title_ar) + '</span></div>' +
      (l.kind && l.kind !== 'core' ? chip(esc(l.kind), 'bronze') + ' ' : '') +
      (l.items_count != null ? chip(arNum(l.items_count) + ' + ' + arNum(l.exercises_count || 0), '') + ' ' : '') +
      chip(esc(t('minutes').replace('%d', arNum(l.minutes || 0))), '') +
      (l.active ? '' : ' ' + chip(esc(t('hidden')), 'red')) +
      (canManage ?
        '<span style="display:flex; gap:4px; flex-wrap:wrap;">' +
        '<button class="btn btn-ghost btn-sm" data-move="up" data-ac="' + esc(a.id) + '" data-lid="' + esc(l.id) + '" title="' + esc(t('moveUp')) + '">↑</button>' +
        '<button class="btn btn-ghost btn-sm" data-move="down" data-ac="' + esc(a.id) + '" data-lid="' + esc(l.id) + '" title="' + esc(t('moveDown')) + '">↓</button>' +
        '<button class="btn btn-outline btn-sm" data-lesson-edit="' + esc(l.id) + '" data-ac="' + esc(a.id) + '">' + esc(t('edit')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-lesson-toggle="' + esc(l.id) + '">' + (l.active ? esc(t('hide')) : esc(t('show'))) + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-lesson-unlink-ac="' + esc(a.id) + '" data-lid="' + esc(l.id) + '" style="color:#c0392b;">' + esc(t('unlink')) + '</button>' +
        '</span>' : '') +
      '</div>';
  }).join('');

  return '<details class="card" style="padding:0;" data-academy="' + esc(a.id) + '">' +
    '<summary style="padding:18px 20px; cursor:pointer; display:flex; align-items:center; gap:12px; list-style:none;">' +
      '<span style="width:34px; height:34px; border-radius:10px; flex:none; background:linear-gradient(135deg,' + esc(a.color_from || '#C8A96A') + ',' + esc(a.color_to || '#A88345') + '); display:inline-flex; align-items:center; justify-content:center;"><i data-lucide="' + esc(a.icon || 'book-open') + '" width="17" height="17" style="color:#fff;"></i></span>' +
      '<span style="flex:1; min-width:140px;"><b>' + esc(lang === 'ar' ? a.name_ar : a.name_en) + '</b>' +
        '<span class="s360-meta" style="margin-top:4px;">' + chip(esc(t(diffLabel)), 'bronze') + ' ' + chip(esc(String(a.level || 'A1')), '') + (a.active ? '' : ' ' + chip(esc(t('inactive')), 'red')) + '</span></span>' +
      '<span class="s360-meta" style="margin:0;"><span>' + esc(t('lessonCount').replace('%d', arNum(links.length))) + '</span><span>· ' + esc(t('minutes').replace('%d', arNum(mins))) + '</span></span>' +
      (canManage ? '<span style="display:flex; gap:6px; flex-wrap:wrap;">' +
        '<button class="btn btn-outline btn-sm" data-ac-edit="' + esc(a.id) + '">' + esc(t('edit')) + '</button>' +
        '<button class="btn btn-gold btn-sm" data-ac-addlesson="' + esc(a.id) + '"><i data-lucide="plus" width="14" height="14"></i> ' + esc(t('lesson')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-ac-toggle="' + esc(a.id) + '">' + (a.active ? esc(t('hide')) : esc(t('show'))) + '</button></span>' : '') +
    '</summary>' +
    '<div style="padding:0 20px 18px; border-top:1px solid rgba(200,169,106,.25);">' +
      (rows || '<p style="color:var(--text-muted); font-size:.85rem; padding-top:12px;">' + esc(lang === 'ar' ? 'لا توجد دروس بعد.' : 'No lessons yet.') + '</p>') +
    '</div>' +
  '</details>';
}

/* Wire the manager's buttons after each render */
document.addEventListener('click', async function(ev){
  var b = ev.target.closest ? ev.target.closest('[data-move],[data-lesson-edit],[data-lesson-toggle],[data-lesson-unlink-ac],[data-ac-edit],[data-ac-addlesson],[data-ac-toggle]') : null;
  if(!b || !hasPerm('curriculum.manage')) return;
  ev.preventDefault();
  ev.stopPropagation();
  if(b.hasAttribute('data-move')){
    var r1 = await rpc('admin_lesson_move', { p_academy_id: b.getAttribute('data-ac'), p_lesson_id: b.getAttribute('data-lid'), p_dir: b.getAttribute('data-move') });
    if(r1.ok){ toast(t('saved')); courses(); } else toast(rpcErrMsg(r1), true);
  } else if(b.hasAttribute('data-lesson-edit')){
    lessonForm(b.getAttribute('data-ac'), b.getAttribute('data-lesson-edit'));
  } else if(b.hasAttribute('data-lesson-toggle')){
    var l = _cur.lessons[b.getAttribute('data-lesson-toggle')];
    if(!l) return;
    var r2 = await rpc('admin_lesson_toggle', { p_id: l.id, p_active: !l.active });
    if(r2.ok){ toast(t('curriculumUpdated')); courses(); } else toast(rpcErrMsg(r2), true);
  } else if(b.hasAttribute('data-lesson-unlink-ac')){
    if(!confirm(t('confirmUnlink'))) return;
    var r3 = await rpc('admin_lesson_unlink', { p_academy_id: b.getAttribute('data-lesson-unlink-ac'), p_lesson_id: b.getAttribute('data-lid') });
    if(r3.ok){ toast(t('curriculumUpdated')); courses(); } else toast(rpcErrMsg(r3), true);
  } else if(b.hasAttribute('data-ac-edit')){
    academyForm(b.getAttribute('data-ac-edit'));
  } else if(b.hasAttribute('data-ac-addlesson')){
    lessonForm(b.getAttribute('data-ac-addlesson'), null);
  } else if(b.hasAttribute('data-ac-toggle')){
    var a = _cur.academies.find(function(x){ return x.id === b.getAttribute('data-ac-toggle'); });
    if(!a) return;
    var r4 = await rpc('admin_academy_save', { p_id: a.id, p_name_en: a.name_en, p_name_ar: a.name_ar,
      p_icon: a.icon, p_color_from: a.color_from, p_color_to: a.color_to,
      p_difficulty: a.difficulty, p_level: a.level, p_sort_order: a.sort_order, p_active: !a.active });
    if(r4.ok){ toast(t('curriculumUpdated')); courses(); } else toast(rpcErrMsg(r4), true);
  }
});

function slugify(s){
  var v = String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return v || 'item-' + Math.floor(Math.random() * 9000 + 1000);
}

const LESSON_LEVELS = ['Beginner','Intermediate','Advanced'];

function academyForm(academyId){
  var a = academyId ? _cur.academies.find(function(x){ return x.id === academyId; }) : null;
  var s = modal(a ? t('editAcademy') : t('newAcademy'), '' +
    '<div class="form-grid">' +
      '<div class="field"><label>' + esc(t('titleEn')) + '</label><input class="input" id="acEn" value="' + esc(a ? a.name_en : '') + '"></div>' +
      '<div class="field"><label>' + esc(t('titleAr')) + '</label><input class="input" dir="rtl" id="acAr" value="' + esc(a ? a.name_ar : '') + '"></div>' +
      '<div class="field"><label>' + esc(t('iconLabel')) + '</label><input class="input" id="acIcon" value="' + esc(a ? (a.icon || 'book-open') : 'book-open') + '"></div>' +
      '<div class="field"><label>' + esc(t('difficulty')) + '</label><select class="input" id="acDiff">' +
        ['Beginner','Intermediate','Advanced','All Levels'].map(function(d){
          return '<option' + (a && a.difficulty === d ? ' selected' : '') + '>' + d + '</option>';
        }).join('') + '</select></div>' +
      '<div class="field"><label>' + esc(t('level')) + '</label><select class="input" id="acLevel">' +
        ['A1','A2','B1','B2','C1'].map(function(v){
          return '<option' + (a && a.level === v ? ' selected' : '') + '>' + v + '</option>';
        }).join('') + '</select></div>' +
      '<div class="field"><label>' + esc(t('colorFrom')) + '</label><input class="input" type="color" id="acFrom" value="' + esc(a ? (a.color_from || '#C8A96A') : '#C8A96A') + '"></div>' +
      '<div class="field"><label>' + esc(t('colorTo')) + '</label><input class="input" type="color" id="acTo" value="' + esc(a ? (a.color_to || '#A88345') : '#A88345') + '"></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="acSave">' + esc(t('save')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  s.querySelector('#acSave').addEventListener('click', async function(){
    var en = s.querySelector('#acEn').value.trim();
    var ar = s.querySelector('#acAr').value.trim();
    if(!en || !ar){ toast(lang === 'ar' ? 'العنوانان مطلوبان.' : 'Both titles are required.', true); return; }
    var r = await rpc('admin_academy_save', {
      p_id: a ? a.id : slugify(en),
      p_name_en: en, p_name_ar: ar,
      p_icon: s.querySelector('#acIcon').value.trim() || 'book-open',
      p_difficulty: s.querySelector('#acDiff').value,
      p_level: s.querySelector('#acLevel').value,
      p_color_from: s.querySelector('#acFrom').value,
      p_color_to: s.querySelector('#acTo').value,
      p_sort_order: a ? a.sort_order : null,
      p_active: a ? a.active : true
    });
    if(r.ok){ closeModal(s); toast(t('saved')); courses(); } else toast(rpcErrMsg(r), true);
  });
}

function lessonForm(academyId, lessonId){
  var l = lessonId ? _cur.lessons[lessonId] : null;
  var opts = _cur.academies.map(function(x){
    return '<option value="' + esc(x.id) + '"' + ((x.id === academyId) ? ' selected' : '') + '>' + esc(lang === 'ar' ? x.name_ar : x.name_en) + '</option>';
  }).join('');
  var s = modal(l ? t('editLesson') : t('newLesson'), '' +
    '<div class="form-grid">' +
      '<div class="field"><label>' + esc(t('academy')) + '</label><select class="input" id="lsAcademy"' + (l ? ' disabled' : '') + '>' + opts + '</select></div>' +
      '<div class="field"><label>' + esc(t('titleEn')) + '</label><input class="input" id="lsEn" value="' + esc(l ? l.title_en : '') + '"></div>' +
      '<div class="field"><label>' + esc(t('titleAr')) + '</label><input class="input" dir="rtl" id="lsAr" value="' + esc(l ? l.title_ar : '') + '"></div>' +
      '<div class="field"><label>' + esc(t('minutesLabel')) + '</label><input class="input" type="number" min="1" id="lsMin" value="' + (l ? (l.minutes || 8) : 8) + '"></div>' +
      '<div class="field"><label>' + esc(t('difficulty')) + '</label><select class="input" id="lsLevel">' +
        LESSON_LEVELS.map(function(v){ return '<option' + (l && l.level === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="lsSave">' + esc(t('save')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  s.querySelector('#lsSave').addEventListener('click', async function(){
    var en = s.querySelector('#lsEn').value.trim();
    var ar = s.querySelector('#lsAr').value.trim();
    if(!en || !ar){ toast(lang === 'ar' ? 'العنوانان مطلوبان.' : 'Both titles are required.', true); return; }
    var mins = parseInt(s.querySelector('#lsMin').value, 10);
    var r = await rpc('admin_lesson_save', {
      p_academy_id: s.querySelector('#lsAcademy').value,
      p_id: l ? l.id : null,
      p_title_en: en, p_title_ar: ar,
      p_minutes: isNaN(mins) ? null : mins,
      p_level: s.querySelector('#lsLevel').value
    });
    if(r.ok){ closeModal(s); toast(t('lessonSaved')); courses(); } else toast(rpcErrMsg(r), true);
  });
}

/* ============================================================
   14. INTERVENTIONS (cross-student feed)
   ============================================================ */
async function interventions(){
  $('viewArea').innerHTML = pageHead(t('interventions'), lang === 'ar' ? 'كل التدخلات' : 'All interventions') + loadingBlock();
  var r = await rpc('admin_interventions');
  if(!r.ok){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];
  var html = rows.map(function(i){
    var s = statusChip(i.status);
    return '<div class="reason-item"><span class="badge-dot ' + (i.status === 'open' ? 'warn' : i.status === 'resolved' ? 'green' : 'gold') + '" style="margin-top:5px;"></span>' +
      '<div style="flex:1;"><a class="row-link" data-open-student="' + i.user_id + '">' + esc(i.student_name) + '</a>' +
      '<div style="font-weight:600; margin-top:3px;">' + esc(lang === 'ar' ? i.title_ar : i.title_en) + '</div>' +
      '<span class="why">' + chip(esc(i.type), 'bronze') + ' ' + s + ' · ' + fmtDate(i.created_at) + '</span>' +
      (i.reason_en ? '<span class="why">' + esc(lang === 'ar' ? i.reason_ar : i.reason_en) + '</span>' : '') +
      '</div></div>';
  }).join('') || emptyBlock(t('noInterventions'));
  $('viewArea').innerHTML = pageHead(t('interventions'), lang === 'ar' ? 'تدخلات المعلمين والادارة' : 'Teacher and admin interventions') +
    '<div class="card"><div class="reason-list">' + html + '</div></div>';
  loadIcons();
  wireStudentLinks();
}

/* ============================================================
   15. LIVE CLASSES + ATTENDANCE (Phases 30-31)
   ============================================================ */
async function classes(){
  $('viewArea').innerHTML = pageHead(t('classes'), lang === 'ar' ? 'الدروس المباشرة والحضور' : 'Live classes and attendance') + loadingBlock();
  var [r, g] = await Promise.all([
    rpc('admin_classes'),
    client().from('groups').select('id,name,status').eq('status','active')
  ]);
  if(!r.ok){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];
  var groupsArr = (g.data || []);

  var html = rows.map(function(c){
    return '<div class="card" style="margin-bottom:14px;">' +
      '<div class="s360-meta" style="margin-top:0;">' +
        statusChip(c.status) + chip(esc(c.topic || '-'), '') +
        (c.group_name ? chip(esc(c.group_name), 'green') : '') +
        (c.teacher_name ? chip(esc(c.teacher_name), 'bronze') : '') +
      '</div>' +
      '<div class="s360-meta" style="margin-top:10px; color:var(--text-muted); font-size:.76rem;">' +
        '<span>' + fmtDate(c.scheduled_date) + ' ' + esc(String(c.start_time || '').slice(0,5)) + '</span>' +
        '<span>· ' + fmtN(c.duration_minutes) + ' min</span>' +
        '<span>· ' + fmtN(c.marked_count) + '/' + fmtN(c.roster_count) + ' ' + esc(t('attendance')) + '</span>' +
      '</div>' +
      '<div class="btn-row" style="margin-top:12px;">' +
      (hasPerm('attendance.manage') ? '<button class="btn btn-outline btn-sm" data-attend="' + c.id + '">' + esc(t('markAttendance')) + '</button>' : '') +
      (hasPerm('classes.manage') ? '<button class="btn btn-ghost btn-sm" data-class-status="' + c.id + '">' + esc(t('markClass')) + '</button>' : '') +
      '</div></div>';
  }).join('') || emptyBlock(t('noData'));

  var newBtn = hasPerm('classes.manage') ? '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-gold btn-sm" id="newClassBtn">' + esc(t('newClass')) + '</button></div>' : '';
  $('viewArea').innerHTML = pageHead(t('classes'), lang === 'ar' ? 'جدول الدروس المباشرة' : 'Live class schedule') +
    newBtn + '<div class="grid grid-3">' + html + '</div>';
  loadIcons();
  var nb = $('newClassBtn');
  if(nb) nb.addEventListener('click', function(){ classForm(groupsArr); });
  document.querySelectorAll('[data-attend]').forEach(function(b){
    b.addEventListener('click', function(){ attendanceSheet(b.getAttribute('data-attend')); });
  });
  document.querySelectorAll('[data-class-status]').forEach(function(b){
    b.addEventListener('click', function(){ classStatusModal(b.getAttribute('data-class-status')); });
  });
}
function classForm(groupsArr){
  var s = modal(t('newClass'), '' +
    '<div class="form-grid">' +
      '<div class="field"><label>' + esc(t('groupName')) + '</label><select class="input" id="clGroup">' +
        '<option value="">-</option>' + groupsArr.map(function(g){
          return '<option value="' + g.id + '">' + esc(g.name) + '</option>';
        }).join('') + '</select></div>' +
      '<div class="field"><label>' + esc(t('topic')) + '</label><input class="input" id="clTopic" placeholder="Workplace Response"></div>' +
      '<div class="field"><label>' + esc(t('date')) + '</label><input class="input" type="date" id="clDate"></div>' +
      '<div class="field"><label>' + esc(t('startTime')) + '</label><input class="input" type="time" id="clTime" value="19:00"></div>' +
      '<div class="field"><label>' + esc(t('duration')) + ' (min)</label><input class="input" type="number" id="clDur" value="60"></div>' +
      '<div class="field"><label>Course / lesson</label><input class="input" id="clCourse" placeholder="speaking-studio"></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="clSave">' + esc(t('create')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  $('clSave').addEventListener('click', async function(){
    var payload = {
      group_id: $('clGroup').value || null,
      topic: $('clTopic').value.trim() || null,
      scheduled_date: $('clDate').value || new Date().toISOString().slice(0,10),
      start_time: $('clTime').value || '19:00',
      duration_minutes: Math.max(1, parseInt($('clDur').value, 10) || 60),
      course_id: $('clCourse').value.trim() || null
    };
    var c = client();
    var r = await c.from('live_classes').insert(payload);
    if(r.error){ toast(t('permissionDenied'), true); return; }
    await audit('class.create', 'class', (r.data && r.data[0] && r.data[0].id) || '', { topic: payload.topic });
    closeModal(s);
    toast(t('saved'));
    classes();
  });
}
async function attendanceSheet(classId){
  var r = await rpc('admin_class_attendance', { p_class_id: classId });
  if(!r.ok){ toast(t('errorGeneric'), true); return; }
  var d = r.data;
  var cl = d.class || {};
  var roster = d.roster || [];
  var statuses = ['present','absent','late','excused'];
  var s = modal(t('markAttendance'), '' +
    '<div class="notice info" style="margin-bottom:14px;">' + esc(t('topic')) + ': ' + esc(cl.topic || '-') + ' · ' + fmtDate(cl.scheduled_date) + ' ' + esc(String(cl.start_time || '').slice(0,5)) + '</div>' +
    '<div class="reason-list">' +
    roster.map(function(m){
      return '<div class="reason-item"><div style="flex:1;"><div style="font-weight:600;">' + esc(m.full_name) + '</div></div>' +
        '<select class="input" style="width:130px;" data-att-status="' + m.id + '">' +
        statuses.map(function(st){
          return '<option value="' + st + '"' + (m.status === st ? ' selected' : '') + '>' + esc(t(st)) + '</option>';
        }).join('') + '</select></div>';
    }).join('') + (roster.length ? '' : emptyBlock(t('noData'))) +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="attSave">' + esc(t('save')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>', true);
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  $('attSave').addEventListener('click', async function(){
    var rows = roster.map(function(m){
      var sel = s.querySelector('[data-att-status="' + m.id + '"]');
      return { user_id: m.id, status: sel ? sel.value : 'absent' };
    });
    var r2 = await rpc('admin_attendance_save', { p_class_id: classId, p_rows: rows });
    if(!r2.ok){ toast(t('permissionDenied'), true); return; }
    closeModal(s);
    toast(t('saved'));
    classes();
  });
}
function classStatusModal(classId){
  var s = modal(t('markClass'), '<select class="input" id="csSel">' +
    [['scheduled','scheduled'],['completed','completed'],['cancelled','cancelled'],['rescheduled','rescheduled']].map(function(x){
      return '<option value="' + x[1] + '">' + esc(t(x[1])) + '</option>';
    }).join('') + '</select>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="csSave">' + esc(t('save')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  $('csSave').addEventListener('click', async function(){
    var r = await rpc('admin_class_status', { p_class_id: classId, p_status: $('csSel').value });
    if(!r.ok){ toast(rpcErrMsg(r), true); return; }
    closeModal(s);
    toast(t('saved'));
    classes();
  });
}

/* ============================================================
   16. PROGRAMS + SUBSCRIPTIONS (Phases 32-33)
   ============================================================ */
async function programs(){
  $('viewArea').innerHTML = pageHead(t('programs'), lang === 'ar' ? 'البرامج والاشتراكات' : 'Programs and subscriptions') + loadingBlock();
  var [p, sub] = await Promise.all([
    client().from('programs').select('*').order('created_at'),
    rpc('admin_subscriptions')
  ]);
  var prog = (p.data || []);
  var subs = sub.ok ? (sub.data || []) : [];

  var catalog = prog.map(function(x){
    return '<div class="card" style="margin-bottom:14px;">' +
      '<div class="s360-meta" style="margin-top:0;">' + chip(esc(lang === 'ar' ? x.name_ar : x.name_en), 'gold') + statusChip(x.active ? 'active' : 'inactive') + '</div>' +
      '<div class="s360-meta" style="margin-top:10px; color:var(--text-muted); font-size:.76rem;">' +
        '<span>' + fmtN(x.duration_months) + ' ' + esc(t('durationMonths')) + '</span>' +
        '<span>· ' + fmtN(x.included_live_sessions) + ' ' + esc(t('includedSessions')) + '</span>' +
        (x.price ? '<span>· ' + esc(x.price) + '</span>' : '') +
      '</div>' +
      (x.description ? '<div class="sub" style="margin-top:10px;">' + esc(x.description) + '</div>' : '') +
      '</div>';
  }).join('') || emptyBlock(t('noData'));

  var subRows = subs.map(function(s){
    return '<div class="reason-item"><div style="flex:1;"><a class="row-link" data-open-student="' + s.user_id + '">' + esc(s.student_name) + '</a>' +
      '<div style="font-weight:600; margin-top:3px;">' + esc(lang === 'ar' ? s.program_ar : s.program_en) + '</div>' +
      '<span class="why">' + fmtDate(s.start_date) + ' → ' + fmtDate(s.end_date) + ' · ' + fmtN(s.sessions_used) + '/' + fmtN(s.included) + ' ' + esc(t('sessionsIncluded')) + '</span></div>' +
      statusChip(s.status) + '</div>';
  }).join('') || emptyBlock(t('noSubscriptions'));

  var addBtn = hasPerm('subscriptions.manage') ? '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-gold btn-sm" id="newSubBtn">' + esc(t('newSubscription')) + '</button>' +
    '<button class="btn btn-outline btn-sm" id="newProgBtn">' + esc(t('newProgram')) + '</button></div>' : '';
  $('viewArea').innerHTML = pageHead(t('programs'), lang === 'ar' ? 'البرامج والاشتراكات' : 'Programs and subscriptions') +
    addBtn +
    '<div class="section-title">' + esc(t('programCatalog')) + '</div><div class="grid grid-3">' + catalog + '</div>' +
    '<div class="section-title">' + esc(t('subscriptions')) + '</div><div class="card"><div class="reason-list">' + subRows + '</div></div>';
  loadIcons();
  wireStudentLinks();
  var sb = $('newSubBtn');
  if(sb) sb.addEventListener('click', function(){ subForm(prog); });
  var pb = $('newProgBtn');
  if(pb) pb.addEventListener('click', function(){ programForm(); });
}
function programForm(){
  var s = modal(t('newProgram'), '' +
    '<div class="form-grid">' +
      '<div class="field"><label>Code</label><input class="input" id="pgCode"></div>' +
      '<div class="field"><label>Name (EN)</label><input class="input" id="pgEn"></div>' +
      '<div class="field"><label>Name (AR)</label><input class="input" id="pgAr"></div>' +
      '<div class="field"><label>' + esc(t('durationMonths')) + '</label><input class="input" type="number" id="pgMonths" value="3"></div>' +
      '<div class="field"><label>' + esc(t('includedSessions')) + '</label><input class="input" type="number" id="pgSess" value="8"></div>' +
      '<div class="field"><label>' + esc(t('price')) + '</label><input class="input" id="pgPrice" placeholder="SAR 1,299"></div>' +
      '<div class="field full"><label>Description</label><textarea class="input" id="pgDesc" rows="2"></textarea></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="pgSave">' + esc(t('create')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  $('pgSave').addEventListener('click', async function(){
    var payload = {
      code: $('pgCode').value.trim(), name_en: $('pgEn').value.trim(), name_ar: $('pgAr').value.trim() || $('pgEn').value.trim(),
      duration_months: Math.max(1, parseInt($('pgMonths').value, 10) || 3),
      included_live_sessions: Math.max(0, parseInt($('pgSess').value, 10) || 0),
      price: $('pgPrice').value.trim() || null,
      description: $('pgDesc').value.trim() || null
    };
    if(!payload.code || !payload.name_en){ toast(t('required'), true); return; }
    var c = client();
    var r = await c.from('programs').insert(payload);
    if(r.error){ toast(t('permissionDenied'), true); return; }
    await audit('program.create', 'program', (r.data && r.data[0] && r.data[0].id) || '', { code: payload.code });
    closeModal(s);
    toast(t('saved'));
    programs();
  });
}
function subForm(prog){
  var s = modal(t('newSubscription'), '' +
    '<div class="form-grid">' +
      '<div class="field full"><label>' + esc(t('student')) + '</label><div class="search-wrap"><input class="input" id="sfSearch" placeholder="' + esc(t('searchPlaceholder')) + '"><div id="sfResults"></div></div></div>' +
      '<div class="field full"><label>' + esc(t('program')) + '</label><select class="input" id="sfProg">' +
        prog.map(function(x){ return '<option value="' + x.id + '">' + esc(x.name_en) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>' + esc(t('startDate')) + '</label><input class="input" type="date" id="sfStart" value="' + new Date().toISOString().slice(0,10) + '"></div>' +
      '<div class="field"><label>' + esc(t('endDate')) + '</label><input class="input" type="date" id="sfEnd"></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="sfSave">' + esc(t('create')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  var picked = null;
  var input = $('sfSearch'), results = $('sfResults');
  var timer = null;
  input.addEventListener('input', function(){
    clearTimeout(timer);
    timer = setTimeout(async function(){
      var q = input.value.trim();
      if(q.length < 2){ results.innerHTML = ''; return; }
      var r = await rpc('admin_students', { p_limit: 6, p_offset: 0, p_search: q, p_filters: {}, p_sort: 'name:asc' });
      if(!r.ok){ return; }
      results.innerHTML = (r.data || []).map(function(st){
        return '<div class="reason-item" style="margin-top:6px;"><div style="flex:1;"><div style="font-weight:600;">' + esc(st.full_name) + '</div><span class="why">' + esc(st.email || '') + '</span></div>' +
          '<button class="btn btn-gold btn-sm" data-pick="' + st.id + '">' + esc(t('select')) + '</button></div>';
      }).join('') || '';
      results.querySelectorAll('[data-pick]').forEach(function(b){
        b.addEventListener('click', function(){
          picked = b.getAttribute('data-pick');
          input.value = b.closest('.reason-item').querySelector('div').textContent.trim();
          results.innerHTML = '';
        });
      });
    }, 350);
  });
  $('sfSave').addEventListener('click', async function(){
    if(!picked){ toast(t('required'), true); return; }
    var end = $('sfEnd').value || (new Date(Date.now() + 90*86400000).toISOString().slice(0,10));
    var r = await rpc('admin_subscription_add', { p_user_id: picked, p_program_id: $('sfProg').value, p_start_date: $('sfStart').value, p_end_date: end, p_sessions_used: 0 });
    if(!r.ok){ toast(rpcErrMsg(r), true); return; }
    closeModal(s);
    toast(t('saved'));
    programs();
  });
}

/* ============================================================
   16B. BILLING & INDEX EDITOR (Plans pricing matrix + index copy)
   --------------------------------------------------------------
   Admin-editable subscription plans that appear on /index.html.
   Writes to plan_pricing (public-read on index) and site_settings
   (hero / pricing copy). No payment gateway - CTAs are WhatsApp.
   ============================================================ */
async function billingView(){
  $('viewArea').innerHTML = pageHead(lang==='ar'?'الفوترة والبداية':'Billing & Index',
    lang==='ar'?'عدل اسعار الباقات ونص الصفحة البداية - التغييرات توصل لـ /index فوراً':'Edit plan prices and index copy - changes reach /index immediately') + loadingBlock();
  var c = client();
  var [pp, ss] = await Promise.all([
    c.from('plan_pricing').select('*').order('tier,duration_months'),
    c.from('site_settings').select('key,value').in('key', ['hero_headline_ar','hero_headline_en','hero_sub_ar','hero_sub_en','pricing_note_ar','pricing_note_en','faqs'])
  ]);
  var rows = pp.data || [];
  var kv = {}; (ss.data||[]).forEach(function(r){ kv[r.key] = r.value; });

  // ---- pricing matrix ----
  var tiers = [
    {k:'start_from_zero', en:'Start From 0', ar:'ابد من الصفر'},
    {k:'exam_prep', en:'Exam Prep', ar:'التجهيز للاختبارات'}
  ];
  var matrixHtml = '';
  tiers.forEach(function(tier){
    matrixHtml += '<div class="section-title">'+esc(lang==='ar'?tier.ar:tier.en)+' <span class="why">('+esc(tier.k)+')</span></div>';
    matrixHtml += '<div class="card" style="margin-bottom:16px;"><div class="reason-list">';
    [1,2,3].forEach(function(mo){
      var r = rows.find(function(x){ return x.tier===tier.k && x.duration_months===mo; }) || {tier:tier.k, duration_months:mo, price:0, weekly_live_classes:0, featured:false, active:true};
      matrixHtml += '<div class="reason-item" style="flex-wrap:wrap;gap:8px;">' +
        '<div style="font-weight:700;min-width:90px;">'+esc(mo+' '+(lang==='ar'?'اشهر':'months'))+'</div>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:.78rem;">'+esc(t('price'))+' <input class="input" type="number" style="width:90px" data-pp="price" data-tier="'+tier.k+'" data-mo="'+mo+'" value="'+(r.price||0)+'"></label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:.78rem;">'+(lang==='ar'?'حصص اسبوعياً':'Weekly classes')+' <input class="input" type="number" style="width:70px" data-pp="weekly_live_classes" data-tier="'+tier.k+'" data-mo="'+mo+'" value="'+(r.weekly_live_classes||0)+'"></label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:.78rem;"><input type="checkbox" data-pp="featured" data-tier="'+tier.k+'" data-mo="'+mo+'" '+(r.featured?'checked':'')+'> '+(lang==='ar'?'مميزة':'Featured')+'</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:.78rem;"><input type="checkbox" data-pp="active" data-tier="'+tier.k+'" data-mo="'+mo+'" '+(r.active!==false?'checked':'')+'> '+(lang==='ar'?'متاحة':'Active')+'</label>' +
        '</div>';
    });
    matrixHtml += '</div></div>';
  });

  // ---- index content ----
  function val(k){ var v = kv[k]; return (v && typeof v === 'string') ? v : (v && v.ar ? v.ar : ''); }
  var indexHtml = '<div class="section-title">'+(lang==='ar'?'نص الصفحة البداية':'Index copy')+'</div>' +
    '<div class="card" style="margin-bottom:16px;"><div class="form-grid">' +
    '<div class="field full"><label>'+(lang==='ar'?'عنوان البطل (عربي)':'Hero headline (AR)')+'</label><textarea class="input" rows="2" data-ix="hero_headline_ar">'+esc(val('hero_headline_ar'))+'</textarea></div>' +
    '<div class="field full"><label>'+(lang==='ar'?'عنوان البطل (انجليزي)':'Hero headline (EN)')+'</label><textarea class="input" rows="2" data-ix="hero_headline_en">'+esc(val('hero_headline_en'))+'</textarea></div>' +
    '<div class="field full"><label>'+(lang==='ar'?'العنوان الفرعي (عربي)':'Hero sub (AR)')+'</label><textarea class="input" rows="2" data-ix="hero_sub_ar">'+esc(val('hero_sub_ar'))+'</textarea></div>' +
    '<div class="field full"><label>'+(lang==='ar'?'العنوان الفرعي (انجليزي)':'Hero sub (EN)')+'</label><textarea class="input" rows="2" data-ix="hero_sub_en">'+esc(val('hero_sub_en'))+'</textarea></div>' +
    '<div class="field full"><label>'+(lang==='ar'?'ملاحظة الباقات (عربي)':'Pricing note (AR)')+'</label><textarea class="input" rows="2" data-ix="pricing_note_ar">'+esc(val('pricing_note_ar'))+'</textarea></div>' +
    '<div class="field full"><label>'+(lang==='ar'?'ملاحظة الباقات (انجليزي)':'Pricing note (EN)')+'</label><textarea class="input" rows="2" data-ix="pricing_note_en">'+esc(val('pricing_note_en'))+'</textarea></div>' +
    '</div></div>';

  // ---- FAQ editor (site_settings.faqs = JSON array of {qEn,qAr,aEn,aAr}) ----
  var faqArr = (function(){ try{ var v = kv['faqs']; return Array.isArray(v)?v:(typeof v==='string'?JSON.parse(v||'[]'):[]); }catch(e){ return []; } })();
  if(!faqArr.length){ faqArr = [{qEn:'',qAr:'',aEn:'',aAr:''}]; }
  function faqRowHtml(f, i){
    return '<div class="card" style="margin-bottom:12px;" data-faq-row="'+i+'"><div class="form-grid">' +
      '<div class="field full"><label>'+(lang==='ar'?'سوال (انجليزي)':'Question (EN)')+'</label><input class="input" data-faq="qEn" data-i="'+i+'" value="'+esc(f.qEn||'')+'"></div>' +
      '<div class="field full"><label>'+(lang==='ar'?'سوال (عربي)':'Question (AR)')+'</label><input class="input" data-faq="qAr" data-i="'+i+'" value="'+esc(f.qAr||'')+'"></div>' +
      '<div class="field full"><label>'+(lang==='ar'?'جواب (انجليزي)':'Answer (EN)')+'</label><textarea class="input" rows="2" data-faq="aEn" data-i="'+i+'">'+esc(f.aEn||'')+'</textarea></div>' +
      '<div class="field full"><label>'+(lang==='ar'?'جواب (عربي)':'Answer (AR)')+'</label><textarea class="input" rows="2" data-faq="aAr" data-i="'+i+'">'+esc(f.aAr||'')+'</textarea></div>' +
      '</div><div class="btn-row" style="margin-top:8px;"><button class="btn btn-ghost btn-sm" data-faq-del="'+i+'">'+esc(lang==='ar'?'حذف السوال':'Remove')+'</button></div></div>';
  }
  var faqHtml = '<div class="section-title">'+(lang==='ar'?'الاسيلة الشايعة':'FAQs (index)')+'</div>' +
    '<div id="faqList">'+faqArr.map(faqRowHtml).join('')+'</div>' +
    '<div class="btn-row" style="margin-bottom:8px;"><button class="btn btn-outline btn-sm" id="faqAdd">'+esc(lang==='ar'?'سوال جديد':'Add question')+'</button></div>';
  indexHtml += faqHtml;

  $('viewArea').innerHTML = pageHead(lang==='ar'?'الفوترة والبداية':'Billing & Index',
    lang==='ar'?'عدل اسعار الباقات ونص الصفحة البداية':'Edit plan prices and index copy') +
    '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-gold btn-sm" id="ppSave">'+esc(t('save'))+'</button>' +
    '<span class="why">'+(lang==='ar'?'الدفع عبر واتساب - ما في بوابة دفع':'WhatsApp checkout only - no payment gateway')+'</span></div>' +
    matrixHtml + indexHtml;

  // FAQ add/remove wiring
  function faqMaxI(){ var m=-1; document.querySelectorAll('[data-faq-row]').forEach(function(r){ var i=+r.getAttribute('data-faq-row'); if(i>m)m=i; }); return m; }
  var faqAddBtn = $('faqAdd');
  if(faqAddBtn) faqAddBtn.addEventListener('click', function(){ var ni=faqMaxI()+1; var wrap=document.createElement('div'); wrap.innerHTML=faqRowHtml({qEn:'',qAr:'',aEn:'',aAr:''}, ni); var node=wrap.firstElementChild; $('faqList').appendChild(node); wireFaqRow(node); });
  function wireFaqRow(node){
    var del=node.querySelector('[data-faq-del]');
    if(del) del.addEventListener('click', function(){ node.remove(); });
  }
  document.querySelectorAll('[data-faq-row]').forEach(wireFaqRow);

  $('ppSave').addEventListener('click', async function(){
    this.disabled = true; this.textContent = '...';
    var errs = 0; var firstMsg = '';
    function noteErr(e){ errs++; if(!firstMsg) firstMsg = String((e&&e.message)||e||'').slice(0,180); }
    // pricing matrix
    var cells = document.querySelectorAll('[data-pp]');
    var byKey = {};
    cells.forEach(function(inp){
      var k = inp.dataset.tier + ':' + inp.dataset.mo;
      (byKey[k] = byKey[k] || {tier:inp.dataset.tier, duration_months:+inp.dataset.mo});
      var f = inp.dataset.pp;
      if(f === 'price' || f === 'weekly_live_classes') byKey[k][f] = +inp.value || 0;
      else byKey[k][f] = inp.checked;
    });
    await Promise.all(Object.keys(byKey).map(function(k){
      return c.from('plan_pricing').upsert(byKey[k], {onConflict:'tier,duration_months'}).then(function(r){
        if(r.error){ console.error('plan_pricing save',byKey[k],r.error); noteErr(r.error); }
      }).catch(function(e){ console.error('plan_pricing save',byKey[k],e); noteErr(e); });
    }));
    // index content (awaited so failures are counted accurately)
    await Promise.all(Array.prototype.slice.call(document.querySelectorAll('[data-ix]')).map(function(ta){
      var key = ta.dataset.ix, v = ta.value.trim();
      return c.from('site_settings').upsert({key:key, value:v}, {onConflict:'key'}).then(function(r){
        if(r.error){ console.error('site_settings save',key,r.error); noteErr(r.error); }
      }).catch(function(e){ console.error('site_settings save',key,e); noteErr(e); });
    }));
    // FAQs (collect rows in DOM order, drop fully-blank ones)
    var faqOut = [];
    document.querySelectorAll('[data-faq-row]').forEach(function(row){
      var get = function(f){ var el = row.querySelector('[data-faq="'+f+'"]'); return el ? (el.value||'').trim() : ''; };
      var q = { qEn:get('qEn'), qAr:get('qAr'), aEn:get('aEn'), aAr:get('aAr') };
      if(q.qEn||q.qAr||q.aEn||q.aAr) faqOut.push(q);
    });
    try{
      var fr = await c.from('site_settings').upsert({key:'faqs', value:faqOut}, {onConflict:'key'});
      if(fr.error){ console.error('site_settings faqs save',fr.error); noteErr(fr.error); }
    }catch(e){ console.error('site_settings faqs save',e); noteErr(e); }
    await audit('billing.update', 'plan_pricing', '', { cells: Object.keys(byKey).length });
    this.disabled = false; this.textContent = esc(t('save'));
    toast(errs ? (errs+' '+(lang==='ar'?'حقول لم تحفظ':'fields failed')+(firstMsg?': '+firstMsg:'')) : t('saved'), !!errs);
  });
  loadIcons();
}

/* ============================================================
   ASSESSMENT QUESTIONS CRUD (admin): full edit of the adaptive
   placement-test question pool: list, add, edit, delete, toggle active.
   RLS: admin read/write gated by learning.manage (aq_admin_write policy).
   ============================================================ */
async function questionsView(){
  if(!hasPerm('learning.manage')){ $('viewArea').innerHTML = emptyBlock(lang==='ar'?'ما عندك صلاحية':'No access'); return; }
  var title = lang==='ar'?'بنك الاختبار':'Assessment Questions';
  var sub = lang==='ar'?'تعديل بنك الاختبار - التغييرات توصل للطلاب فوراً':'Edit the adaptive placement-test questions - changes reach students immediately';
  $('viewArea').innerHTML = pageHead(title, sub) + loadingBlock();
  var c = client();
  var ROWS = [];
  await loadList();

  async function loadList(){
    var r = await c.from('assessment_questions').select('*').order('tier,difficulty_rating,sort_order');
    ROWS = r.data || [];
    var addBtn = '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-gold btn-sm" id="aqAdd">'+esc(lang==='ar'?'سوال جديد':'New question')+'</button>'+
      '<span class="why">'+(lang==='ar'?'العدد: ':'Count: ')+ROWS.length+'</span></div>';
    if(!ROWS.length){ $('viewArea').innerHTML = pageHead(title, sub) + addBtn + emptyBlock(lang==='ar'?'لا توجد اساله بعد':'No questions yet'); wire(); return; }
    var tierLbl = function(t){ return t==='exam_prep'?(lang==='ar'?'تجهيز اختبارات':'Exam Prep'):(lang==='ar'?'البداية':'Beginner'); };
    var rowsHtml = ROWS.map(function(q){
      var opts = q.options || [];
      var correctTxt = opts[q.correct_index] ? (opts[q.correct_index].en||'') : '';
      return '<tr>'+
        '<td style="padding:8px;vertical-align:top;"><b>'+esc(q.code)+'</b><br><span class="why">'+esc(q.skill_type||'')+'</span></td>'+
        '<td style="padding:8px;vertical-align:top;">'+esc(tierLbl(q.tier))+'<br><span class="chip gold" style="font-size:.7rem">'+esc(q.level)+'</span> <span class="chip" style="font-size:.7rem">D'+esc(q.difficulty_rating)+'</span></td>'+
        '<td style="padding:8px;vertical-align:top;max-width:360px;">'+esc(q.question_en)+'<br><span class="arabic why">'+esc(q.question_ar||'')+'</span><br><span class="why">✓ '+esc(correctTxt)+'</span></td>'+
        '<td style="padding:8px;vertical-align:top;">'+(q.active!==false?'<span class="chip emerald" style="font-size:.7rem">'+esc(lang==='ar'?'متاح':'Active')+'</span>':'<span class="chip muted" style="font-size:.7rem">'+esc(lang==='ar'?'متوقف':'Off')+'</span>')+'</td>'+
        '<td style="padding:8px;vertical-align:top;white-space:nowrap;">'+
          '<button class="btn btn-ghost btn-sm" data-aq-edit="'+esc(q.id)+'">'+esc(t('edit'))+'</button> '+
          '<button class="btn btn-outline btn-sm" data-aq-toggle="'+esc(q.id)+'">'+esc(lang==='ar'?'حالة':'Toggle')+'</button> '+
          '<button class="btn btn-danger btn-sm" data-aq-del="'+esc(q.id)+'">'+esc(lang==='ar'?'حذف':'Delete')+'</button>'+
        '</td></tr>';
    }).join('');
    $('viewArea').innerHTML = pageHead(title, sub) + addBtn +
      '<div class="card" style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><thead><tr>'+
      '<th style="text-align:right;padding:8px;">'+esc(lang==='ar'?'الكود':'Code')+'</th>'+
      '<th style="text-align:right;padding:8px;">'+esc(lang==='ar'?'المستوى':'Level')+'</th>'+
      '<th style="text-align:right;padding:8px;">'+esc(lang==='ar'?'السوال':'Question')+'</th>'+
      '<th style="text-align:right;padding:8px;">'+esc(lang==='ar'?'الحالة':'Status')+'</th>'+
      '<th style="text-align:right;padding:8px;">'+esc(lang==='ar'?'اجراات':'Actions')+'</th>'+
      '</tr></thead><tbody>'+rowsHtml+'</tbody></table></div>';
    wire();
  }

  function wire(){
    loadIcons();
    var addBtn = $('aqAdd'); if(addBtn) addBtn.addEventListener('click', function(){ questionModal(null); });
    $('viewArea').querySelectorAll('[data-aq-edit]').forEach(function(b){ b.addEventListener('click', function(){ var q = ROWS.find(function(x){return x.id===b.getAttribute('data-aq-edit');}); questionModal(q||null); }); });
    $('viewArea').querySelectorAll('[data-aq-toggle]').forEach(function(b){ b.addEventListener('click', function(){ toggleQ(b.getAttribute('data-aq-toggle')); }); });
    $('viewArea').querySelectorAll('[data-aq-del]').forEach(function(b){ b.addEventListener('click', function(){ delQ(b.getAttribute('data-aq-del')); }); });
  }

  function toggleQ(id){
    var q = ROWS.find(function(x){return x.id===id;}); if(!q) return;
    c.from('assessment_questions').update({active: !q.active}).eq('id', id).then(function(r){
      if(r.error){ toast(rpcErrMsg(r), true); return; }
      audit('question.toggle','assessment_questions',q.code,{active:!q.active});
      toast(t('saved')); loadList();
    });
  }
  function delQ(id){
    var q = ROWS.find(function(x){return x.id===id;});
    if(!window.confirm(lang==='ar'?'حذف هذا السوال للابد؟':'Delete this question permanently?')) return;
    c.from('assessment_questions').delete().eq('id', id).then(function(r){
      if(r.error){ toast(rpcErrMsg(r), true); return; }
      audit('question.delete','assessment_questions',q?q.code:id,{});
      toast(t('saved')); loadList();
    });
  }

  function questionModal(q){
    var isEdit = !!q;
    var o = q ? (q.options||[]) : [];
    function opt(i, lng){ var x = o[i]||{}; return esc(x[lng]||''); }
    var body = '<div class="form-grid">'+
      '<div class="field"><label>'+esc(lang==='ar'?'الكود':'Code')+'</label><input class="input" id="qf_code" value="'+esc(q?q.code:'')+'" placeholder="q16"></div>'+
      '<div class="field"><label>'+esc(lang==='ar'?'المسار':'Tier')+'</label><select class="input" id="qf_tier"><option value="beginner"'+(q&&q.tier==='beginner'?' selected':'')+'>Beginner</option><option value="exam_prep"'+(q&&q.tier==='exam_prep'?' selected':'')+'>Exam Prep</option></select></div>'+
      '<div class="field"><label>'+esc(lang==='ar'?'المستوى':'Level')+'</label><select class="input" id="qf_level">'+['A1','A2','B1','B2','C1'].map(function(l){return '<option value="'+l+'"'+(q&&q.level===l?' selected':'')+'>'+l+'</option>';}).join('')+'</select></div>'+
      '<div class="field"><label>'+esc(lang==='ar'?'الصعوبة':'Difficulty')+'</label><select class="input" id="qf_diff">'+[1,2,3,4,5].map(function(d){return '<option value="'+d+'"'+(q&&q.difficulty_rating===d?' selected':'')+'>'+d+'</option>';}).join('')+'</select></div>'+
      '<div class="field"><label>'+esc(lang==='ar'?'النوع':'Skill')+'</label><select class="input" id="qf_skill">'+['grammar','vocab','reading','listening'].map(function(s){return '<option value="'+s+'"'+(q&&q.skill_type===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div>'+
      '<div class="field"><label><input type="checkbox" id="qf_active" '+(q?(q.active!==false?'checked':''):'checked')+'> '+esc(lang==='ar'?'متاح':'Active')+'</label></div>'+
      '<div class="field full"><label>'+esc(lang==='ar'?'السوال (عربي)':'Question (AR)')+'</label><textarea class="input" rows="2" id="qf_qar">'+esc(q?(q.question_ar||''):'')+'</textarea></div>'+
      '<div class="field full"><label>'+esc(lang==='ar'?'السوال (انجليزي)':'Question (EN)')+'</label><textarea class="input" rows="2" id="qf_qen">'+esc(q?(q.question_en||''):'')+'</textarea></div>'+
      '<div class="field full"><div class="section-title" style="margin:8px 0;">'+esc(lang==='ar'?'الخيارات (4)':'Options (4)')+'</div></div>'+
      [0,1,2,3].map(function(i){ return '<div class="field"><label>'+esc(lang==='ar'?'خيار '+(i+1)+' (عربي)':'Option '+(i+1)+' (AR)')+'</label><input class="input" id="qf_o'+i+'ar" value="'+opt(i,'ar')+'"></div><div class="field"><label>'+esc(lang==='ar'?'خيار '+(i+1)+' (انجليزي)':'Option '+(i+1)+' (EN)')+'</label><input class="input" id="qf_o'+i+'en" value="'+opt(i,'en')+'"></div>'; }).join('')+
      '<div class="field full"><label>'+esc(lang==='ar'?'الاجابة الصحيحة':'Correct option')+'</label><select class="input" id="qf_correct">'+[0,1,2,3].map(function(i){return '<option value="'+i+'"'+(q&&q.correct_index===i?' selected':'')+'>Option '+(i+1)+'</option>';}).join('')+'</select></div>'+
      '<div class="field full"><label>'+esc(lang==='ar'?'الترتيب':'Sort order')+'</label><input class="input" type="number" id="qf_sort" value="'+(q?(q.sort_order||0):0)+'"></div>'+
      '</div>';
    var scrim = modal((isEdit?(lang==='ar'?'تعديل سوال':'Edit question'):(lang==='ar'?'سوال جديد':'New question')), body, true,
      '<button class="btn btn-gold btn-sm" id="qfSave">'+esc(t('save'))+'</button>');
    $('qfSave').addEventListener('click', async function(){
      var code = $('qf_code').value.trim();
      if(!code){ toast(lang==='ar'?'الكود مطلوب':'Code required', true); return; }
      if(!$('qf_qen').value.trim()){ toast(lang==='ar'?'نص السوال الانجليزي مطلوب':'English question text required', true); return; }
      var opts = [0,1,2,3].map(function(i){ return { ar: $('qf_o'+i+'ar').value.trim(), en: $('qf_o'+i+'en').value.trim() }; });
      if(!opts[$('qf_correct').value].en){ toast(lang==='ar'?'الاجابة الصحيحة ما تنشاف':'Correct option has no text', true); return; }
      var row = {
        code: code,
        tier: $('qf_tier').value,
        level: $('qf_level').value,
        difficulty_rating: +$('qf_diff').value,
        skill_type: $('qf_skill').value,
        question_ar: $('qf_qar').value.trim(),
        question_en: $('qf_qen').value.trim(),
        options: opts,
        correct_index: +$('qf_correct').value,
        sort_order: +$('qf_sort').value||0,
        active: $('qf_active').checked
      };
      this.disabled = true; this.textContent = '...';
      // Edit existing row by id (so changing the code field updates in place
      // instead of orphaning the old row); insert a brand-new row otherwise.
      var r = isEdit
        ? await c.from('assessment_questions').update(row).eq('id', q.id)
        : await c.from('assessment_questions').insert(row);
      this.disabled = false; this.textContent = esc(t('save'));
      if(r.error){ toast(rpcErrMsg(r), true); return; }
      await audit('question.upsert','assessment_questions',code,{tier:row.tier,level:row.level,difficulty:row.difficulty_rating});
      closeModal(scrim);
      toast(t('saved')); loadList();
    });
    loadIcons();
  }
}

/* ============================================================
   17. CERTIFICATES DIRECTORY (Phase 34)
   ============================================================ */
async function certificates(){
  $('viewArea').innerHTML = pageHead(t('certificates'), lang === 'ar' ? 'الشهادات والتحقق' : 'Certificates and verification') + loadingBlock();
  var c = client();
  var r = await c.from('certificates').select('id,cert_id,code,student_name,academy_en,academy_ar,level,program_name,completed_at,created_at,status,revoke_reason,user_id,verification_count').order('created_at',{ascending:false}).limit(200);
  if(r.error){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];
  var html = rows.map(function(x){
    return '<div class="reason-item"><span class="badge-dot ' + (x.status === 'issued' ? 'green' : x.status === 'revoked' ? 'red' : 'gold') + '" style="margin-top:5px;"></span>' +
      '<div style="flex:1;"><div style="font-weight:600;">' + esc(x.student_name) + ' - ' + esc(x.academy_en) + '</div>' +
      '<span class="why">' + esc(x.cert_id) + ' · ' + fmtDate(x.created_at) + (x.level ? ' · ' + esc(x.level) : '') + (x.revoke_reason ? ' · ' + esc(x.revoke_reason) : '') + '</span></div>' +
statusChip(x.status) +
      (x.user_id ? '<a class="row-link" data-open-student="' + x.user_id + '" style="font-size:.72rem;">' + esc(t('student')) + '</a>' : '') +
      (x.status === 'issued' && hasPerm('certificates.revoke') ? '<button class="btn btn-danger btn-sm" data-revoke="' + esc(x.cert_id) + '">' + esc(t('revoke')) + '</button>' : '') +
      '<button class="btn btn-outline btn-sm" data-print-cert="' + esc(x.cert_id) + '">' + esc(t('print')) + '</button>' +
      '</div>';
  }).join('') || emptyBlock(t('noCertificates'));

  $('viewArea').innerHTML = pageHead(t('certificates'), lang === 'ar' ? 'اصدار والتحقق من الشهادات' : 'Issue and verify certificates') +
    '<div class="btn-row" style="margin-bottom:16px;">' +
    (hasPerm('certificates.issue') ? '<button class="btn btn-gold btn-sm" id="issueManualBtn">' + esc(t('issueCert')) + '</button>' : '') +
    '<button class="btn btn-outline btn-sm" id="verifyBtn">' + esc(t('verifyCode')) + '</button></div>' +
    '<div class="card"><div class="reason-list">' + html + '</div></div>';
  loadIcons();
  wireStudentLinks();
  var ib = $('issueManualBtn');
  if(ib) ib.addEventListener('click', function(){ openCertIssueModal(null); });
  var vb = $('verifyBtn');
  if(vb) vb.addEventListener('click', verifyCertModal);
document.querySelectorAll('[data-revoke]').forEach(function(b){
    b.addEventListener('click', function(){ revokeCert(b.getAttribute('data-revoke')); });
  });
  document.querySelectorAll('[data-print-cert]').forEach(function(b){
    b.addEventListener('click', function(){
      var id = b.getAttribute('data-print-cert');
      var row = rows.filter(function(x){ return x.cert_id === id; })[0];
      if(row) printCert(row);
    });
  });
}
function printCert(x){
  if(typeof PEL_CERT_SHEET === 'undefined'){
    toast(t('errorGeneric'), true);
    return;
  }
  var certData = {
    name: x.student_name || '',
    academyEn: x.academy_en || '',
    academyAr: x.academy_ar || '',
    level: x.level || '',
    programName: x.program_name || '',
    completedAt: x.completed_at || x.created_at,
    issueDate: x.created_at,
    certId: x.cert_id || '',
    code: x.code || ''
  };
  certData.verifyUrl = certData.code ? 'https://personalizedenglishlessons.github.io/tutorfiraspel/verify.html?code=' + encodeURIComponent(certData.code) : null;
  var payload = JSON.stringify(certData).replace(/<\//g, '<\\/');
  var html = '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(x.cert_id || 'PEL Certificate') + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700&family=Cairo:wght@400;500;700&display=swap" rel="stylesheet">' +
    '<style>' + PEL_CERT_CSS + ' body{margin:0;padding:0;background:#121216;} #certPrintRoot{display:block;}</style>' +
    '<script src="lib/cert-qr.js"><\/script>' +
    '<script src="lib/cert-sheet.js"><\/script>' +
    '</head>' +
    '<body><div id="certPrintRoot"></div>' +
    '<script>window.addEventListener("load", function(){' +
      'var root = document.getElementById("certPrintRoot");' +
      'root.innerHTML = PEL_CERT_SHEET(' + payload + ');' +
      'PEL_CERT_FIT(root);' +
      'setTimeout(function(){ window.print(); }, 350);' +
    '});<\/script></body></html>';
  var w = window.open('', '_blank', 'width=1200,height=850');
  if(!w){ toast(t('blocked'), true); return; }
  w.document.write(html);
  w.document.close();
}
function verifyCertModal(){
  var s = modal(t('verifyCode'), '<div class="field"><label>' + esc(t('code')) + '</label><input class="input" id="vfCode" placeholder="A1B2C3D4E5F6A7B8 / PEL-YYMMDD-SSS-C"></div>' +
    '<div id="vfResult"></div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="vfGo">' + esc(t('verifyCode')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('close')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  $('vfGo').addEventListener('click', async function(){
    var code = $('vfCode').value.trim();
    if(!code){ toast(t('required'), true); return; }
    var r = await rpc('verify_certificate', { p_code: code });
    var box = $('vfResult');
    if(!r.ok || !r.data || !r.data.length){
      box.innerHTML = '<div class="notice danger" style="margin-top:12px;">' + esc(t('invalid')) + '</div>';
      return;
    }
    var v = r.data[0];
    var ok = v.status === 'issued' || v.status === 'reissued';
    box.innerHTML = '<div class="notice ' + (ok ? 'green' : 'danger') + '" style="margin-top:12px;"><i data-lucide="' + (ok ? 'check-circle-2' : 'x-circle') + '" width="16" height="16"></i><div>' +
      '<b>' + esc(v.student_name) + '</b> - ' + esc(v.academy_en) + '<br>' +
      '<span class="why">' + esc(v.cert_id) + ' · ' + fmtDate(v.issued_at) + ' · ' + statusChip(v.status) + (v.revoke_reason ? ' · ' + esc(v.revoke_reason) : '') + '</span></div></div>';
    loadIcons();
  });
}
function openCertIssueModal(uid){
  var isManual = !uid;
  var s = modal(t('issueCert'), '' +
    '<div class="tabs" id="ciTabs" style="margin-bottom:16px;">' +
      '<button class="tab' + (isManual ? '' : ' active') + '" data-mode="student">' + esc(t('existingStudent')) + '</button>' +
      '<button class="tab' + (isManual ? ' active' : '') + '" data-mode="manual">' + esc(t('manualRecipient')) + '</button></div>' +
    '<div class="form-grid">' +
      '<div class="field full" id="ciStudentWrap"><label>' + esc(t('student')) + '</label><div class="search-wrap"><input class="input" id="ciSearch" placeholder="' + esc(t('searchPlaceholder')) + '"><div id="ciResults"></div></div></div>' +
      '<div class="field full"><label>' + esc(t('studentName')) + '</label><input class="input" id="ciName"></div>' +
      '<div class="field"><label>' + esc(t('academy')) + '</label><input class="input" id="ciAcad" placeholder="speaking-studio"></div>' +
      '<div class="field"><label>' + esc(t('levelField')) + '</label><input class="input" id="ciLevel" placeholder="B1"></div>' +
      '<div class="field"><label>' + esc(t('programName')) + '</label><input class="input" id="ciProg" placeholder="Intensive"></div>' +
      '<div class="field"><label>' + esc(t('completionDate')) + '</label><input class="input" type="date" id="ciCompleted"></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="ciGo">' + esc(t('issue')) + '</button>' +
    '<button class="btn btn-outline btn-sm" id="ciPreview">' + esc(t('certPreview')) + '</button>' +
    '<button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>' +
    '<div class="preview-wrap" id="ciPreviewWrap" style="display:none;margin-top:14px;overflow:auto;max-height:340px;background:#121216;border:1px solid #2A2826;border-radius:10px;"></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });

  var picked = uid;
  var nameInput = $('ciName');
  if(uid && current360 && current360.profile && current360.profile.full_name){
    nameInput.value = current360.profile.full_name;
    $('ciStudentWrap').style.display = 'none';
  }
  function setMode(mode){
    document.querySelectorAll('#ciTabs .tab').forEach(function(tab){ tab.classList.toggle('active', tab.getAttribute('data-mode') === mode); });
    $('ciStudentWrap').style.display = mode === 'manual' ? 'none' : '';
    if(mode === 'manual') picked = null;
  }
  document.querySelectorAll('#ciTabs .tab').forEach(function(tab){
    tab.addEventListener('click', function(){ setMode(tab.getAttribute('data-mode')); });
  });
  var input = $('ciSearch'), results = $('ciResults');
  var timer = null;
  input.addEventListener('input', function(){
    clearTimeout(timer);
    timer = setTimeout(async function(){
      var q = input.value.trim();
      if(q.length < 2){ results.innerHTML = ''; return; }
      var r = await rpc('admin_students', { p_limit: 6, p_offset: 0, p_search: q, p_filters: {}, p_sort: 'name:asc' });
      if(!r.ok){ return; }
      results.innerHTML = (r.data || []).map(function(st){
        return '<div class="reason-item" style="margin-top:6px;"><div style="flex:1;"><div style="font-weight:600;">' + esc(st.full_name) + '</div><span class="why">' + esc(st.email || '') + '</span></div>' +
          '<button class="btn btn-gold btn-sm" data-pick="' + st.id + '">' + esc(t('select')) + '</button></div>';
      }).join('') || '';
      results.querySelectorAll('[data-pick]').forEach(function(b){
        b.addEventListener('click', function(){
          picked = b.getAttribute('data-pick');
          input.value = b.closest('.reason-item').querySelector('div').textContent.trim();
          nameInput.value = b.closest('.reason-item').querySelector('div').textContent.trim();
          results.innerHTML = '';
        });
      });
    }, 350);
  });
var prevWrap = $('ciPreviewWrap');
  $('ciPreview').addEventListener('click', function(){
    var sheet = PEL_CERT_SHEET({
      name: nameInput.value.trim(),
      academyEn: $('ciAcad').value.trim() || 'speaking-studio',
      academyAr: academyName($('ciAcad').value.trim(), 'ar') || $('ciAcad').value.trim(),
      level: $('ciLevel').value.trim() || null,
      programName: $('ciProg').value.trim() || null,
      completedAt: $('ciCompleted').value || new Date().toISOString().slice(0,10),
      issueDate: new Date().toISOString().slice(0,10),
      certId: 'PREVIEW',
      code: 'PREVIEW',
      verifyUrl: null
    });
    prevWrap.style.display = 'block';
    prevWrap.innerHTML = sheet;
    var f = prevWrap.querySelector('.cert-sheet');
    if(f) f.style.transform = 'scale(0.42)';
    if(f) f.style.transformOrigin = 'top left';
    PEL_CERT_FIT(prevWrap);
    prevWrap.scrollIntoView({ behavior:'smooth', block:'nearest' });
  });
  $('ciGo').addEventListener('click', async function(){
    var payload = {
      p_student_name: nameInput.value.trim(),
      p_academy_en: $('ciAcad').value.trim() || 'speaking-studio',
      p_academy_ar: academyName($('ciAcad').value.trim(), 'ar') || $('ciAcad').value.trim(),
      p_level: $('ciLevel').value.trim() || null,
      p_program_name: $('ciProg').value.trim() || null,
      p_completed_at: $('ciCompleted').value || new Date().toISOString().slice(0,10),
      p_issue_date: new Date().toISOString().slice(0,10)
    };
    if(!payload.p_student_name){ toast(t('required'), true); return; }
    var r = picked
      ? await rpc('issue_certificate_admin', { p_user_id: picked, ...payload })
      : await rpc('issue_certificate_manual', payload);
    closeModal(s);
    if(!r.ok){ toast(r.error && r.error.message || t('permissionDenied'), true); return; }
    toast(t('certIssued'));
    if(uid && current360Uid === uid) reload360();
    else certificates();
  });
}

/* ============================================================
   18. AUDIT LOG (Phase 35)
   ============================================================ */
async function auditLog(){
  $('viewArea').innerHTML = pageHead(t('audit'), lang === 'ar' ? 'سجل كل اجراوات الادارة' : 'Full admin action history') + loadingBlock();
  var c = client();
  var r = await c.from('audit_log').select('id,actor_user_id,action,target_type,target_id,metadata,created_at').order('created_at',{ascending:false}).limit(300);
  if(r.error){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];
  var html = rows.map(function(a){
    return '<div class="reason-item"><span class="badge-dot muted" style="margin-top:5px;"></span>' +
      '<div style="flex:1;"><div><b>' + esc(a.action) + '</b> · ' + esc(a.actor_user_id || '-') + '</div>' +
      '<span class="why">' + esc(a.target_type || '') + ' ' + esc(a.target_id || '') + ' · ' + fmtDate(a.created_at) + '</span>' +
      (a.metadata ? '<span class="why">' + esc(JSON.stringify(a.metadata)) + '</span>' : '') +
      '</div></div>';
  }).join('') || emptyBlock(t('noData'));
  $('viewArea').innerHTML = pageHead(t('audit'), lang === 'ar' ? 'سجل التدقيق' : 'Audit log') +
    '<div class="card"><div class="reason-list">' + html + '</div></div>';
  loadIcons();
}

/* ============================================================
   19. ACCESS & ROLES (Phase 36)
   ============================================================ */
async function roles(){
  $('viewArea').innerHTML = pageHead(t('roles'), lang === 'ar' ? 'الفريق والادوار' : 'Team and roles') + loadingBlock();
  var r = await rpc('admin_team');
  if(!r.ok){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];
  var html = rows.map(function(u){
    var isSelf = me.id === u.id;
    var roleSel = '<select class="input" style="width:150px;" data-role-sel="' + u.id + '">' +
      [['student','roleStudent'],['teacher','roleTeacher'],['admin','roleAdmin'],['super_admin','roleSuperAdmin']].map(function(x){
        return '<option value="' + x[0] + '"' + (u.role === x[0] ? ' selected' : '') + '>' + esc(t(x[1])) + '</option>';
      }).join('') + '</select>';
    return '<div class="reason-item"><span class="avatar-circle" style="width:30px;height:30px;font-size:.76rem;">' + esc((u.full_name || '?').charAt(0).toUpperCase()) + '</span>' +
      '<div style="flex:1;"><div style="font-weight:600;">' + esc(u.full_name) + (isSelf ? ' <span class="chip gold">' + esc(t('youAreViewing')) + '</span>' : '') + '</div>' +
      '<span class="why">' + esc(u.email) + '</span></div>' +
      (u.role === 'super_admin' && !hasPerm('roles.manage') ? chip(t('roleSuperAdmin'), 'gold') : roleSel) +
      '</div>';
  }).join('') || emptyBlock(t('noData'));
  $('viewArea').innerHTML = pageHead(t('roles'), lang === 'ar' ? 'ادارة الادوار' : 'Role management') +
    '<div class="notice info" style="margin-bottom:16px;">' + esc(t('confirmChange')) + '</div>' +
    '<div class="card"><div class="reason-list">' + html + '</div></div>';
  loadIcons();
  document.querySelectorAll('[data-role-sel]').forEach(function(sel){
    sel.addEventListener('change', async function(){
      var uid = sel.getAttribute('data-role-sel');
      if(!confirm(t('confirmChange'))){ sel.value = rows.find(function(x){ return x.id === uid; }).role; return; }
      var r2 = await rpc('admin_set_role', { p_user_id: uid, p_role: sel.value });
      if(!r2.ok){ toast(r2.error && r2.error.message || t('permissionDenied'), true); return; }
      toast(t('saved'));
      if(uid === me.id && sel.value !== me.role){ window.location.reload(); }
    });
  });
}

/* ============================================================
   20. SYSTEM HEALTH (Phase 37)
   ============================================================ */
async function health(){
  $('viewArea').innerHTML = pageHead(t('health'), lang === 'ar' ? 'فحوصات صحة النظام' : 'System health checks') + loadingBlock();
  var r = await rpc('system_health');
  if(!r.ok){ $('viewArea').innerHTML = errBlock(rpcErrMsg(r)); return; }
  var checks = (r.data && r.data.checks) || [];
  var html = checks.map(function(c){
    var ok = (c.count || 0) === 0;
    return '<div class="reason-item"><span class="badge-dot ' + (ok ? 'green' : 'red') + '" style="margin-top:5px;"></span>' +
      '<div style="flex:1;"><div style="font-weight:600;">' + esc(c.label) + '</div>' +
      '<span class="why">' + esc(c.code) + '</span></div>' +
      chip(ok ? t('healthy') : t('issues') + ': ' + fmtN(c.count), ok ? 'green' : 'red') + '</div>';
  }).join('') || emptyBlock(t('noData'));
  $('viewArea').innerHTML = pageHead(t('health'), lang === 'ar' ? 'صحة النظام' : 'System health') +
    '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-outline btn-sm" id="healthRefresh">' + esc(t('refresh')) + '</button></div>' +
    '<div class="card"><div class="reason-list">' + html + '</div></div>';
  loadIcons();
  var rb = $('healthRefresh');
  if(rb) rb.addEventListener('click', health);
}

/* ============================================================
   21. REPORTS (Phase 38)
   ============================================================ */
function reports(){
  var types = [['students','report_students'],['certificates','report_certificates'],['attendance','report_attendance'],
               ['programs','report_programs'],['classes','report_classes'],['atrisk','report_atrisk']];
  $('viewArea').innerHTML = pageHead(t('reports'), lang === 'ar' ? 'تقارير قابلة للتصدير' : 'Exportable reports') +
    '<div class="filter-bar">' +
    '<div class="field"><label>' + esc(t('selectedReport')) + '</label><select class="input" id="repSel">' +
      types.map(function(x){ return '<option value="' + x[0] + '">' + esc(t(x[1])) + '</option>'; }).join('') + '</select></div>' +
    '<button class="btn btn-gold btn-sm" id="repGo">' + esc(t('report')) + '</button>' +
    '<button class="btn btn-outline btn-sm" id="repCsv">' + esc(t('exportCSV')) + '</button>' +
    '<div style="flex:1"></div></div>' +
    '<div id="repTable"></div>';
  var currentRows = [];
  var tbl = $('repTable');
  async function load(){
    tbl.innerHTML = loadingBlock();
    var r = await rpc('admin_reports', { p_report: $('repSel').value, p_params: {} });
    if(!r.ok){ tbl.innerHTML = errBlock(rpcErrMsg(r)); return; }
  var rows = r.data || [];
  window.__annRows = {};
  rows.forEach(function(a){ window.__annRows[a.id] = a; });
    currentRows = rows;
    if(!rows.length){ tbl.innerHTML = emptyBlock(t('noData')); return; }
    var headers = Object.keys(rows[0]);
    var trs = rows.slice(0, 500).map(function(row){
      return '<tr>' + headers.map(function(h){
        var v = row[h];
        return '<td>' + esc(v == null ? '-' : String(v)) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    tbl.innerHTML = '<div class="table-wrap tbl-responsive"><table class="tbl"><thead><tr>' +
      headers.map(function(h){ return '<th>' + esc(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + trs + '</tbody></table></div>' +
      '<div class="pager"><span class="pg-info">' + esc(t('totalRow').replace('%n', arNum(rows.length))) + '</span></div>';
  }
  $('repGo').addEventListener('click', load);
  $('repCsv').addEventListener('click', function(){ csvExport(currentRows, 'pel-' + $('repSel').value + '-' + new Date().toISOString().slice(0,10)); });
  load();
}

/* ============================================================
   22. PLANS VIEW (upgrade) - plan catalog + entitlement overview
   ============================================================ */
function planStatusChip(status){
  var map = { active:'green', expiring:'warn', expired:'red', suspended:'red', scheduled:'bronze', cancelled:'muted', none:'muted' };
  var cls = map[status] || 'muted';
  var key = status === 'scheduled' ? 'scheduledLbl' : status;
  var text = lang === 'ar' ? (key === 'expiring' ? 'تنتهي قريباً' : (I[key] || {ar:key}).ar || key) : (key === 'expiring' ? 'Expiring' : (I[key] || {en:key}).en || key);
  return '<span class="chip ' + cls + '"><span class="badge-dot ' + cls + '"></span>' + esc(text) + '</span>';
}
async function plansView(){
  $('viewArea').innerHTML = pageHead(t('plans'), lang === 'ar' ? 'الباقات، الاشتراكات، وانتها الوصول - كل شي من الخادم.' : 'Plans, entitlements and expiring access - all server-side.') + loadingBlock();
  var [ov, prog] = await Promise.all([
    rpc('admin_plans_overview'),
    client().from('programs').select('*').eq('active', true).order('sort_order,created_at')
  ]);
  if(!ov.ok){ $('viewArea').innerHTML = errBlock(ov.error && ov.error.message); return; }
  var d = ov.data || {};
  var catalog = (prog.data || []);

  var kpis = [
    { label:t('activePlans'), v:fmtN(d.active_count), cls: d.active_count ? 'green' : '' },
    { label:t('expiringSoon'), v:fmtN(d.expiring_soon_count), cls: d.expiring_soon_count ? 'warn' : '', ent:'expiring7' },
    { label:t('scheduledPlans'), v:fmtN(d.scheduled_count), cls:'' },
    { label:t('suspendedPlans'), v:fmtN(d.suspended_count), cls: d.suspended_count ? 'warn' : '', ent:'suspended' },
    { label:t('expiredPlans'), v:fmtN(d.expired_count), cls: d.expired_count ? 'danger' : '', ent:'expired' },
  ];
  var kpiHtml = kpis.map(function(k){
    return '<div class="kpi-card ' + k.cls + '"' + (k.ent ? ' data-ent="' + k.ent + '" style="cursor:pointer;" title="' + esc(t('seeAll')) + '"' : '') + '><div class="k-label">' + esc(k.label) + '</div><div class="k-value">' + k.v + '</div></div>';
  }).join('');

  var expiringHtml = (d.expiring_soon || []).map(function(s){
    return '<div class="reason-item"><span class="badge-dot warn" style="margin-top:5px;"></span>' +
      '<div style="flex:1;"><a class="row-link" data-open-student="' + s.user_id + '">' + esc(s.name) + '</a>' +
      '<span class="why">' + esc(s.plan) + ' · ' + t('daysLeft').replace('%d', fmtN(s.days_left)) + ' · ' + fmtDate(s.end_date) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';
  if((d.expiring_soon || []).length){
    expiringHtml += '<div style="margin-top:10px;"><button class="btn btn-ghost btn-sm" data-ent="expiring7">' + esc(t('seeAll')) + '</button></div>';
  }

  var activityHtml = (d.recent_activity || []).map(function(a){
    var act = lang === 'ar' ? ({assigned:'اسندت', extended:'مددت', suspended:'اوقفت', reactivated:'اعيد تفعيلها', renewed:'جددت'}[a.action] || a.action) : a.action;
    return '<div class="reason-item"><span class="badge-dot gold" style="margin-top:5px;"></span><div><div>' + esc(a.name) + ' - ' + esc(act) + '</div>' +
      '<span class="why">' + esc(a.plan || '') + (a.new_end_date ? ' · ' + fmtDate(a.new_end_date) : '') + (a.reason ? ' · ' + esc(a.reason) : '') + ' · ' + esc(a.actor || '-') + ' · ' + relTime(a.created_at) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var catalogHtml = catalog.map(function(x){
    return '<div class="card" style="margin-bottom:14px;">' +
      '<div class="s360-meta" style="margin-top:0;">' + chip(esc(lang === 'ar' ? x.name_ar : x.name_en), 'gold') + statusChip(x.active ? 'active' : 'inactive') + '</div>' +
      '<div class="s360-meta" style="margin-top:10px; color:var(--text-muted); font-size:.76rem;">' +
        '<span>' + fmtN(x.duration_days || (x.duration_months * 30)) + ' ' + esc(t('durationDays')) + '</span>' +
        '<span>· ' + fmtN(x.weekly_live_sessions || 0) + ' ' + esc(t('weeklyLive')) + '</span>' +
        (x.price ? '<span>· ' + esc(x.price) + ' ' + esc(x.currency || 'SAR') + '</span>' : '') +
      '</div>' +
      (x.description ? '<div class="sub" style="margin-top:10px;">' + esc(x.description) + '</div>' : '') +
      '</div>';
  }).join('') || emptyBlock(t('noData'));

  var perPlan = (d.per_plan || []).map(function(p){
    return '<div class="card" style="margin-bottom:14px;">' +
      '<div class="s360-meta" style="margin-top:0;">' + chip(esc(lang === 'ar' ? p.name_ar : p.name_en), 'gold') + '</div>' +
      '<div class="stat-row" style="display:flex; gap:14px; flex-wrap:wrap; margin-top:10px; font-size:.8rem;">' +
        '<span><b>' + fmtN(p.active_count) + '</b> ' + esc(t('activePlans')) + '</span>' +
        '<span><b>' + fmtN(p.expiring_count) + '</b> ' + esc(t('expiringSoon')) + '</span>' +
        '<span><b>' + fmtN(p.scheduled_count) + '</b> ' + esc(t('scheduledPlans')) + '</span>' +
        '<span><b>' + fmtN(p.suspended_count) + '</b> ' + esc(t('suspendedPlans')) + '</span>' +
        '<span><b>' + fmtN(p.expired_count) + '</b> ' + esc(t('expiredPlans')) + '</span>' +
      '</div></div>';
  }).join('') || emptyBlock(t('noData'));

  $('viewArea').innerHTML = pageHead(t('plans'), lang === 'ar' ? 'الباقات، الاشتراكات، وانتها الوصول.' : 'Plans, entitlements and expiring access.') +
    '<div class="kpi-grid">' + kpiHtml + '</div>' +
    '<div class="btn-row" style="margin:16px 0;"><button class="btn btn-gold btn-sm" id="plAssignBtn">' + esc(t('assignPlan')) + '</button>' +
    '<button class="btn btn-outline btn-sm" id="plNewBtn">' + esc(t('newPlan')) + '</button></div>' +
    '<div class="grid grid-2"><div>' +
    '<div class="section-title">' + esc(t('expiringSoon')) + '</div><div class="card"><div class="reason-list">' + expiringHtml + '</div></div>' +
    '<div class="section-title">' + esc(t('planChanges')) + '</div><div class="card"><div class="reason-list">' + activityHtml + '</div></div></div>' +
    '<div><div class="section-title">' + esc(t('activePlans')) + ' - ' + esc(t('perPlan')) + '</div><div>' + perPlan + '</div>' +
    '<div class="section-title">' + esc(t('planCatalog')) + '</div><div class="grid grid-3">' + catalogHtml + '</div></div></div>';
  loadIcons();
  wireStudentLinks();
  document.querySelectorAll('[data-ent]').forEach(function(el){
    el.addEventListener('click', function(){ openStudentsFiltered(this.getAttribute('data-ent')); });
  });
  $('plAssignBtn').addEventListener('click', function(){ assignPlanForm(catalog); });
  $('plNewBtn').addEventListener('click', function(){ savePlanForm(catalog); });
}
/* ONE consolidated 'Assign plan' action per student: program + dates +
   plan type (tier) + CEFR level, assigned together. Replaces the old
   scattered buttons (s360PlanSave tier/level-only + p360Assign program-only). */
async function openAssignPlanModal(uid, onDone, curTier, curLevel){
  var c = client();
  var pr = await c.from('programs').select('*').order('sort_order,created_at');
  var catalog = pr.data || [];
  if(!catalog.length){ toast(t('noData'), true); return; }
  var ms = modal(t('assignPlan'), '' +
    '<div class="form-grid">' +
      '<div class="field full"><label>' + esc(t('choosePlan')) + '</label><select class="input" id="apProg">' +
        catalog.map(function(x){ return '<option value="' + x.id + '" data-days="' + (x.duration_days || (x.duration_months||0)*30) + '">' + esc(x.name_en + (x.price?(' - '+x.price+' '+(x.currency||'SAR')):'')) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>' + esc(t('startDate')) + '</label><input class="input" type="date" id="apStart" value="' + new Date().toISOString().slice(0,10) + '"></div>' +
      '<div class="field"><label>' + esc(t('endDate')) + ' <span style="opacity:.6">(optional)</span></label><input class="input" type="date" id="apEnd"></div>' +
      '<div class="field"><label>' + esc(lang==='ar'?'نوع الخطة':'Plan type') + '</label><select class="input" id="apTier">' +
        '<option value="start_from_zero"' + (curTier==='exam_prep'?'':' selected') + '>' + esc(lang==='ar'?'ابد من الصفر':'Start From Zero') + '</option>' +
        '<option value="exam_prep"' + (curTier==='exam_prep'?' selected':'') + '>' + esc(lang==='ar'?'التجهيز للاختبارات':'Exam Prep') + '</option>' +
      '</select></div>' +
      '<div class="field"><label>' + esc(lang==='ar'?'المستوى':'Level') + '</label><select class="input" id="apLevel">' +
        ['A1','A2','B1','B2','C1','C2'].map(function(l){ return '<option value="'+l+'"'+(((curLevel||'A1')===l)?' selected':'')+'>'+l+'</option>'; }).join('') + '</select></div>' +
      '<div class="field full"><label>' + esc(t('reason')) + '</label><input class="input" id="apReason"></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="apSave">' + esc(t('save')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>' +
    '<div class="sub" style="margin-top:8px;color:var(--text-muted);">' + esc(lang==='ar'?'يحدد البرنامج + المدة + نوع الخطة + المستوى اللي تاخذ منه الدروس':'Sets program + duration + plan type + level that drives their lessons') + '</div>');
  ms.querySelector('[data-close]').addEventListener('click', function(){ closeModal(ms); });
  $('apSave').addEventListener('click', async function(){
    var btn = $('apSave'); btn.disabled = true; var orig = btn.textContent; btn.textContent = '...';
    var end = $('apEnd').value || (function(){ var days = +($('apProg').options[$('apProg').selectedIndex].getAttribute('data-days')||30); var d = new Date($('apStart').value); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); })();
    var r1 = await rpc('admin_assign_plan', { p_user_id: uid, p_program_id: $('apProg').value, p_start_date: $('apStart').value, p_end_date: end, p_reason: $('apReason').value.trim() || null });
    if(!r1.ok){ btn.disabled = false; btn.textContent = orig; toast(rpcErrMsg(r1), true); return; }
    var r2 = await rpc('admin_set_student_plan_level', { p_user_id: uid, p_tier: $('apTier').value, p_level: $('apLevel').value });
    if(!r2.ok){ btn.disabled = false; btn.textContent = orig; toast(rpcErrMsg(r2), true); closeModal(ms); if(onDone) onDone(); return; }
    await audit('student.assign_plan', 'student', uid, { program_id: $('apProg').value, tier: $('apTier').value, level: $('apLevel').value });
    closeModal(ms); toast(t('planAssigned')); if(onDone) onDone();
  });
}
function assignPlanForm(catalog){
  /* Plans-overview entry: pick a student by search, then open the ONE
     consolidated assign-plan modal (program + dates + tier + level). */
  var s = modal(t('assignPlan'), '' +
    '<div class="field full"><label>' + esc(t('student')) + '</label><div class="search-wrap"><input class="input" id="apSearch" placeholder="' + esc(t('searchStudents')) + '"><div id="apResults"></div></div></div>' +
    '<div class="btn-row"><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  var input = $('apSearch'), results = $('apResults');
  var timer = null;
  input.addEventListener('input', function(){
    clearTimeout(timer);
    timer = setTimeout(async function(){
      var q = input.value.trim();
      if(q.length < 2){ results.innerHTML = ''; return; }
      var r = await rpc('admin_students', { p_limit: 6, p_offset: 0, p_search: q, p_filters: {}, p_sort: 'name:asc' });
      if(!r.ok){ results.innerHTML = '<div class="sub">'+esc(rpcErrMsg(r))+'</div>'; return; }
      results.innerHTML = (r.data || []).map(function(st){
        return '<div class="reason-item" style="margin-top:6px;"><div style="flex:1;"><div style="font-weight:600;">' + esc(st.full_name) + '</div><span class="why">' + esc(st.email || '') + '</span></div>' +
          '<button class="btn btn-gold btn-sm" data-pick="' + st.id + '">' + esc(t('select')) + '</button></div>';
      }).join('') || '';
      results.querySelectorAll('[data-pick]').forEach(function(b){
        b.addEventListener('click', function(){
          var picked = b.getAttribute('data-pick');
          closeModal(s);
          openAssignPlanModal(picked, plansView);
        });
      });
    }, 350);
  });
  setTimeout(function(){ if(input) input.focus(); }, 50);
}
function savePlanForm(catalog){
  var s = modal(t('newPlan'), '' +
    '<div class="form-grid">' +
      '<div class="field"><label>Code</label><input class="input" id="pgCode"></div>' +
      '<div class="field"><label>Name (EN)</label><input class="input" id="pgEn"></div>' +
      '<div class="field"><label>Name (AR)</label><input class="input" id="pgAr"></div>' +
      '<div class="field"><label>' + esc(t('durationDays')) + '</label><input class="input" type="number" id="pgDays" value="30"></div>' +
      '<div class="field"><label>' + esc(t('price')) + '</label><input class="input" id="pgPrice" placeholder="89"></div>' +
      '<div class="field"><label>' + esc(t('currency')) + '</label><input class="input" id="pgCur" value="SAR"></div>' +
      '<div class="field"><label>' + esc(t('weeklyLive')) + '</label><input class="input" type="number" id="pgWeekly" value="0"></div>' +
      '<div class="field"><label>' + esc(t('platformAccess')) + '</label><select class="input" id="pgAccess"><option value="true">Yes</option><option value="false">No</option></select></div>' +
      '<div class="field full"><label>Description</label><textarea class="input" id="pgDesc" rows="2"></textarea></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="pgSave">' + esc(t('savePlan')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  $('pgSave').addEventListener('click', async function(){
    var btn = $('pgSave'); btn.disabled = true;
    var r = await rpc('admin_save_plan', {
      p_code: $('pgCode').value.trim(), p_name_en: $('pgEn').value.trim(), p_name_ar: $('pgAr').value.trim() || $('pgEn').value.trim(),
      p_duration_days: Math.max(1, parseInt($('pgDays').value,10) || 30),
      p_price: $('pgPrice').value.trim() || null,
      p_currency: $('pgCur').value.trim() || 'SAR',
      p_weekly_live_sessions: Math.max(0, parseInt($('pgWeekly').value,10) || 0),
      p_platform_access: $('pgAccess').value === 'true',
      p_description: $('pgDesc').value.trim() || null
    });
    if(!r.ok){ btn.disabled = false; toast((r.error && r.error.message) || t('permissionDenied'), true); return; }
    closeModal(s); toast(t('planSaved')); plansView();
  });
}

/* ============================================================
   23. ANNOUNCEMENTS VIEW (upgrade)
   ============================================================ */
async function announcementsView(){
  $('viewArea').innerHTML = pageHead(t('announcements'), lang === 'ar' ? 'ارسل اعلانات لكل الطلاب او لمجموعة مختارة، وتابع الوصول.' : 'Send announcements to everyone or a selection, and track delivery.') + loadingBlock();
  var r = await rpc('admin_announcements');
  if(!r.ok){ $('viewArea').innerHTML = errBlock(r.error && r.error.message); return; }
  var rows = r.data || [];
  var html = rows.map(function(a){
    return '<div class="card" style="margin-bottom:14px;">' +
      '<div class="s360-meta" style="margin-top:0;">' + statusChip(a.status) + chip(esc(lang === 'ar' ? (a.priority === 'important' ? 'مهم' : 'عادي') : a.priority), a.priority === 'important' ? 'red' : 'muted') +
      chip(esc(a.audience === 'all' ? (lang === 'ar' ? 'كل الطلاب' : 'All students') : (lang === 'ar' ? 'محدد' : 'Selected')), 'bronze') + '</div>' +
      '<div style="font-weight:600; margin-top:8px;">' + esc(a.title) + '</div>' +
      '<div class="sub" style="margin-top:6px;">' + esc(a.message) + '</div>' +
      '<div class="s360-meta" style="margin-top:8px; color:var(--text-muted); font-size:.76rem;">' +
        '<span>' + esc(a.created_by || '-') + '</span><span>· ' + fmtDate(a.created_at) + '</span>' +
        (a.scheduled_at ? '<span>· ' + esc(t('scheduledLbl')) + ': ' + fmtDate(a.scheduled_at) + '</span>' : '') +
        (a.expires_at ? '<span>· ' + esc(t('expiresAt')) + ': ' + fmtDate(a.expires_at) + '</span>' : '') +
      '</div>' +
      '<div class="btn-row" style="margin-top:10px;"><button class="btn btn-outline btn-sm" data-stats="' + a.id + '">' + esc(t('deliveryStats')) + ' · ' + fmtN(a.recipient_count) + '</button>' +
      (hasPerm('announcements.manage') ? '<button class="btn btn-outline btn-sm" data-edit="' + a.id + '">' + esc(lang === 'ar' ? 'تعديل' : 'Edit') + '</button>' +
      '<button class="btn btn-danger btn-sm" data-del="' + a.id + '">' + esc(lang === 'ar' ? 'حذف' : 'Delete') + '</button>' : '') +
      '</div>' +
      '</div>';
  }).join('') || emptyBlock(t('noAnnouncements'));

  $('viewArea').innerHTML = pageHead(t('announcements'), lang === 'ar' ? 'اعلانات المنصة وتتبع الوصول.' : 'Platform announcements and delivery tracking.') +
    '<div class="btn-row" style="margin-bottom:16px;"><button class="btn btn-gold btn-sm" id="annNewBtn">' + esc(t('newAnnouncement')) + '</button></div>' +
    '<div>' + html + '</div>';
  loadIcons();
  $('annNewBtn').addEventListener('click', function(){ createAnnouncementForm(); });
  document.querySelectorAll('[data-edit]').forEach(function(b){
    b.addEventListener('click', function(){
      var a = window.__annRows[b.getAttribute('data-edit')];
      if(a){ editAnnouncementForm(a); }
    });
  });
  document.querySelectorAll('[data-del]').forEach(function(b){
    b.addEventListener('click', async function(){
      var id = b.getAttribute('data-del');
      var a = window.__annRows[id] || {};
      if(!confirm(lang === 'ar' ? 'حذف هذا الاعلان نهايياً؟' : 'Permanently delete this announcement?')){ return; }
      var r = await rpc('admin_announcement_delete', { p_id: id });
      if(!r.ok){ toast((r.error && r.error.message) || t('permissionDenied'), true); return; }
      toast(lang === 'ar' ? 'تم حذف الاعلان.' : 'Announcement deleted.');
      announcementsView();
    });
  });
  document.querySelectorAll('[data-stats]').forEach(function(b){
    b.addEventListener('click', async function(){
      var r = await rpc('admin_announcement_stats', { p_announcement_id: b.getAttribute('data-stats') });
      if(!r.ok){ toast(t('errorGeneric'), true); return; }
      var st = r.data || {};
      toast(t('deliveredTo').replace('%d', fmtN(st.recipient_count)) + ' · ' + t('readCount') + ' ' + fmtN(st.read_count) + ' · ' + t('unreadCount') + ' ' + fmtN(st.unread_count));
    });
  });
}
function createAnnouncementForm(){
  var s = modal(t('newAnnouncement'), '' +
    '<div class="form-grid">' +
      '<div class="field full"><label>' + esc(t('title')) + '</label><input class="input" id="anTitle"></div>' +
      '<div class="field full"><label>' + esc(t('message')) + '</label><textarea class="input" id="anMsg" rows="3"></textarea></div>' +
      '<div class="field"><label>' + esc(t('audience')) + '</label><select class="input" id="anAud"><option value="all">' + esc(t('everyone')) + '</option><option value="selected">' + esc(t('specificStudents')) + '</option></select></div>' +
      '<div class="field"><label>' + esc(t('priority')) + '</label><select class="input" id="anPri"><option value="normal">' + esc(t('normal')) + '</option><option value="important">' + esc(t('important')) + '</option></select></div>' +
      '<div class="field"><label>' + esc(t('link')) + ' <span style="opacity:.6">(optional)</span></label><input class="input" id="anLink"></div>' +
      '<div class="field"><label>' + esc(t('scheduleFor')) + '</label><input class="input" type="datetime-local" id="anSched"></div>' +
      '<div class="field"><label>' + esc(t('expiresAt')) + '</label><input class="input" type="datetime-local" id="anExp"></div>' +
      '<div class="field full" id="anSelWrap" style="display:none;"><label>' + esc(t('selectStudents')) + '</label><div class="search-wrap"><input class="input" id="anSearch" placeholder="' + esc(t('searchStudents')) + '"><div id="anResults"></div></div><div id="anPicked" style="margin-top:8px; display:flex; flex-wrap:wrap; gap:6px;"></div></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="anSave">' + esc(t('send')) + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  var picked = {}; // uid -> label
  function renderPicked(){
    var ids = Object.keys(picked);
    $('anPicked').innerHTML = ids.map(function(id){
      return '<span class="chip gold">' + esc(picked[id]) + ' <b data-x="' + id + '" style="cursor:pointer; margin-left:6px;">×</b></span>';
    }).join('') || '<span class="chip muted">0</span>';
    document.querySelectorAll('[data-x]').forEach(function(b){
      b.addEventListener('click', function(){ delete picked[b.getAttribute('data-x')]; renderPicked(); });
    });
  }
  $('anAud').addEventListener('change', function(){ $('anSelWrap').style.display = this.value === 'selected' ? 'block' : 'none'; });
  var timer = null;
  $('anSearch').addEventListener('input', function(){
    clearTimeout(timer);
    timer = setTimeout(async function(){
      var q = $('anSearch').value.trim();
      var res = $('anResults');
      if(q.length < 2){ res.innerHTML = ''; return; }
      var r = await rpc('admin_students', { p_limit: 8, p_offset: 0, p_search: q, p_filters: {}, p_sort: 'name:asc' });
      if(!r.ok){ return; }
      res.innerHTML = (r.data || []).map(function(st){
        var done = picked[st.id] ? ' disabled' : '';
        return '<div class="reason-item" style="margin-top:6px;"><div style="flex:1;"><div style="font-weight:600;">' + esc(st.full_name) + '</div><span class="why">' + esc(st.email || '') + '</span></div>' +
          '<button class="btn btn-outline btn-sm" data-add="' + st.id + '"' + done + '>' + esc(t('select')) + '</button></div>';
      }).join('') || '';
      res.querySelectorAll('[data-add]').forEach(function(b){
        b.addEventListener('click', function(){
          var id = b.getAttribute('data-add');
          var name = b.closest('.reason-item').querySelector('div').textContent.trim();
          picked[id] = name; renderPicked(); res.innerHTML = ''; $('anSearch').value = '';
        });
      });
    }, 350);
  });
  $('anSave').addEventListener('click', async function(){
    var aud = $('anAud').value;
    if(aud === 'selected' && !Object.keys(picked).length){ toast(t('required'), true); return; }
    var btn = $('anSave'); btn.disabled = true;
    var sched = $('anSched').value ? new Date($('anSched').value).toISOString() : null;
    var exp = $('anExp').value ? new Date($('anExp').value).toISOString() : null;
    var r = await rpc('admin_create_announcement', {
      p_title: $('anTitle').value.trim(), p_message: $('anMsg').value.trim(),
      p_audience: aud, p_student_ids: Object.keys(picked),
      p_priority: $('anPri').value, p_link: $('anLink').value.trim() || null,
      p_class_id: null, p_scheduled_at: sched, p_expires_at: exp
    });
    if(!r.ok){ btn.disabled = false; toast((r.error && r.error.message) || t('permissionDenied'), true); return; }
    closeModal(s); toast(r.data && r.data.duplicate ? (lang === 'ar' ? 'تم الارسال مسبقاً - تم التخطي.' : 'Already sent - skipped.') : t('notificationSent'));
    announcementsView();
  });
}

/* ============================================================
   24b. SITE SETTINGS - homepage banner & site flags
   ============================================================ */
function editAnnouncementForm(a){
  var s = modal(lang === 'ar' ? 'تعديل الاعلان' : 'Edit announcement', '' +
    '<div class="form-grid">' +
      '<div class="field full"><label>' + esc(t('title')) + '</label><input class="input" id="anETitle" value="' + esc(a.title || '') + '"></div>' +
      '<div class="field full"><label>' + esc(t('message')) + '</label><textarea class="input" id="anEMsg" rows="3">' + esc(a.message || '') + '</textarea></div>' +
      '<div class="field"><label>' + esc(t('priority')) + '</label><select class="input" id="anEPri"><option value="normal"' + (a.priority !== 'important' ? ' selected' : '') + '>' + esc(t('normal')) + '</option><option value="important"' + (a.priority === 'important' ? ' selected' : '') + '>' + esc(t('important')) + '</option></select></div>' +
      '<div class="field"><label>' + esc(t('link')) + '</label><input class="input" id="anELink" value="' + esc(a.link || '') + '"></div>' +
      '<div class="field"><label>' + esc(t('scheduleFor')) + '</label><input class="input" type="datetime-local" id="anESched"></div>' +
      '<div class="field"><label>' + esc(t('expiresAt')) + '</label><input class="input" type="datetime-local" id="anEExp"></div>' +
      '<div class="field full"><label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="anEActive"' + (a.active !== false ? ' checked' : '') + '> ' + esc(lang === 'ar' ? 'ظاهر للطلاب' : 'Visible to students') + '</label></div>' +
    '</div>' +
    '<div class="btn-row"><button class="btn btn-gold btn-sm" id="anESave">' + esc(lang === 'ar' ? 'حفظ التغييرات' : 'Save changes') + '</button><button class="btn btn-ghost btn-sm" data-close>' + esc(t('cancel')) + '</button></div>');
  s.querySelector('[data-close]').addEventListener('click', function(){ closeModal(s); });
  $('anESave').addEventListener('click', async function(){
    var btn = $('anESave'); btn.disabled = true;
    var r = await rpc('admin_announcement_update', {
      p_id: a.id,
      p_title: $('anETitle').value.trim(), p_message: $('anEMsg').value.trim(),
      p_priority: $('anEPri').value, p_link: $('anELink').value.trim() || null,
      p_class_id: a.class_id || null,
      p_scheduled_at: $('anESched').value ? new Date($('anESched').value).toISOString() : (a.scheduled_at || null),
      p_expires_at: $('anEExp').value ? new Date($('anEExp').value).toISOString() : (a.expires_at || null),
      p_active: $('anEActive').checked
    });
    if(!r.ok){ btn.disabled = false; toast((r.error && r.error.message) || t('permissionDenied'), true); return; }
    closeModal(s); toast(lang === 'ar' ? 'تم حفظ التعديلات.' : 'Changes saved.');
    announcementsView();
  });
}

async function settingsView(){
  var head = pageHead(lang === 'ar' ? 'اعدادات الموقع' : 'Site Settings',
    lang === 'ar' ? 'شريط الاعلان الرييسي، الاسيلة الشايعة، رقم الواتساب، وخيارات الموقع - التغييرات تظهر للزوار فوراً.' : 'Homepage banner, FAQs, WhatsApp number and site flags - changes go live for visitors instantly.');
  $('viewArea').innerHTML = head + loadingBlock();
  var c = client();
  if(!c){ $('viewArea').innerHTML = errBlock('no client'); return; }
  var r = await c.from('site_settings').select('key,value');
  if(r.error){ $('viewArea').innerHTML = errBlock(r.error.message); return; }
  var map = {};
  (r.data || []).forEach(function(row){ map[row.key] = row.value; });
  var b = (map.banner && typeof map.banner === 'object') ? map.banner : {};
  var wa = typeof map.whatsapp_contact === 'string' ? map.whatsapp_contact : '';
  var maint = map.maintenance_mode === true;
  var p6 = map.plan_6m_available === true;
  var faqRows = Array.isArray(map.faqs) ? map.faqs : [];
  function faqLines(ar){
    return faqRows.map(function(f){
      return ((ar ? f.qAr : f.qEn) || '') + '|' + ((ar ? f.aAr : f.aEn) || '');
    }).join('\n');
  }

  function chk(id, labelAr, labelEn, checked){
    return '<div class="field" style="flex-direction:row; align-items:center; gap:8px;"><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '><label for="' + id + '" style="font-size:.78rem;">' + esc(lang === 'ar' ? labelAr : labelEn) + '</label></div>';
  }

  $('viewArea').innerHTML = head +
    '<div class="card" style="max-width:760px;">' +
      '<div class="s360-meta" style="margin-top:0;"><span class="chip gold">' + esc(lang === 'ar' ? 'شريط الاعلان الرييسي' : 'Homepage banner') + '</span></div>' +
      '<div class="form-grid" style="margin-top:14px;">' +
        '<div class="field full">' + chk('stBannerActive', 'تشغيل الشريط', 'Banner enabled', b.active !== false) + '</div>' +
        '<div class="field full"><label>' + esc(lang === 'ar' ? 'النص بالعربي' : 'Arabic text') + '</label><textarea class="input" id="stBannerAr" rows="2" dir="rtl">' + esc(b.ar || '') + '</textarea></div>' +
        '<div class="field full"><label>' + esc(lang === 'ar' ? 'النص بالانجليزي' : 'English text') + '</label><textarea class="input" id="stBannerEn" rows="2">' + esc(b.en || '') + '</textarea></div>' +
        '<div class="field full"><label>' + esc(t('link')) + '</label><input class="input" id="stBannerLink" value="' + esc(b.link || '') + '" placeholder="https://wa.me/9665XXXXXXXX" dir="ltr"></div>' +
      '</div>' +
      '<div class="s360-meta" style="margin-top:18px;"><span class="chip bronze">' + esc(lang === 'ar' ? 'خيارات' : 'Flags') + '</span></div>' +
      '<div class="form-grid" style="margin-top:12px;">' +
        chk('stMaint', 'وضع الصيانة (تنبيه في تسجيل الدخول والتطبيق)', 'Maintenance mode (notice on login & app)', maint) +
        chk('stP6', 'باقة 6 اشهر متوفرة', '6-Month plan available', p6) +
        '<div class="field"><label>' + esc(lang === 'ar' ? 'واتساب التواصل' : 'WhatsApp contact') + '</label><input class="input" id="stWa" value="' + esc(wa) + '" placeholder="9665XXXXXXXX" dir="ltr"></div>' +
      '</div>' +
    '</div>' +
    '<div class="card" style="max-width:760px; margin-top:16px;">' +
      '<div class="s360-meta" style="margin-top:0;"><span class="chip gold">' + esc(lang === 'ar' ? 'الاسيلة الشايعة - الصفحة البداية' : 'Homepage FAQs') + '</span></div>' +
      '<p style="margin:10px 0 0; font-size:.76rem; color:var(--text-muted); line-height:1.7;">' +
        esc(lang === 'ar'
          ? 'كل سطر = سوال|جواب. لازم نفس عدد الاسطر بالعربي والانجليزي وبنفس الترتيب.'
          : 'One FAQ per line, format question|answer. Arabic and English must have the same number of lines in the same order.') +
      '</p>' +
      '<div class="form-grid" style="margin-top:12px;">' +
        '<div class="field"><label>' + esc(lang === 'ar' ? 'عربي (' + faqRows.length + ' سطر)' : 'Arabic (' + faqRows.length + ' lines)') + '</label><textarea class="input" id="stFaqAr" rows="10" dir="rtl">' + esc(faqLines(true)) + '</textarea></div>' +
        '<div class="field"><label>' + esc(lang === 'ar' ? 'انجليزي' : 'English') + '</label><textarea class="input" id="stFaqEn" rows="10">' + esc(faqLines(false)) + '</textarea></div>' +
      '</div>' +
      '<div class="btn-row" style="margin-top:16px;"><button class="btn btn-gold btn-sm" id="stSave">' + esc(lang === 'ar' ? 'حفظ ونشر' : 'Save &amp; publish') + '</button></div>' +
    '</div>';
  loadIcons();

  $('stSave').addEventListener('click', async function(){
    var btn = $('stSave'); btn.disabled = true;
    var rows = [
      { key:'banner', value:{ active:$('stBannerActive').checked, ar:$('stBannerAr').value.trim(), en:$('stBannerEn').value.trim(), link:$('stBannerLink').value.trim() } },
      { key:'whatsapp_contact', value:$('stWa').value.replace(/[^0-9]/g, '') },
      { key:'maintenance_mode', value:$('stMaint').checked },
      { key:'plan_6m_available', value:$('stP6').checked }
    ];
    function faqParse(txt){
      return String(txt || '').split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    }
    var arL = faqParse($('stFaqAr').value), enL = faqParse($('stFaqEn').value);
    if(arL.length !== enL.length){
      btn.disabled = false;
      toast(lang === 'ar' ? 'عدد اسطر الاسيلة مختلف بين العربي والانجليزي - سوهم نفس العدد.' : 'FAQ line count differs between Arabic and English - make them match.', true);
      return;
    }
    var faqOut = [];
    for(var fi = 0; fi < arL.length; fi++){
      var pa = arL[fi].split('|'), pe = enL[fi].split('|');
      var fq = {
        qAr: (pa.shift() || '').trim(), aAr: pa.join('|').trim(),
        qEn: (pe.shift() || '').trim(), aEn: pe.join('|').trim()
      };
      if(fq.qAr || fq.qEn) faqOut.push(fq);
    }
    rows.push({ key:'faqs', value:faqOut });
    var r2 = await c.from('site_settings').upsert(rows);
    if(r2.error){ btn.disabled = false; toast((r2.error.message || t('errorGeneric')), true); return; }
    audit('settings.update', 'site_settings', 'site_settings', { banner_active: rows[0].value.active, plan_6m_available: rows[3].value, faq_count: faqOut.length });
    toast(lang === 'ar' ? 'تم النشر - يظهر للزوار الان' : 'Published - live for visitors now');
    btn.disabled = false;
  });
}

/* ============================================================
   24. STUDENT 360 - PLAN & ACCESS TAB
   ============================================================ */
async function renderTabPlan(d){
  var body = $('s360Body');
  if(!body) return;
  body.innerHTML = loadingBlock();
  var uid = current360Uid;
  var r = await rpc('admin_student_plan', { p_user_id: uid });
  if(!r.ok){ body.innerHTML = errBlock(r.error && r.error.message); return; }
  var x = r.data || {};
  var ps = x.plan || {};
  var plan = ps.plan || {};
  var has = !!ps.has_plan;

  var statusLine;
  if(!has){
    statusLine = '<div class="notice"><div>' + (lang === 'ar' ? 'هذا الطالب بدون باقة حالياً.' : 'This student has no active plan.') + '</div></div>';
  } else {
    var planName = lang === 'ar' ? (plan.name_ar || plan.name_en) : plan.name_en;
    statusLine = '<div class="s360-meta" style="margin-top:0;">' + planStatusChip(ps.status) + chip(esc(planName), 'gold') +
      (plan.price ? chip(esc(plan.price + ' ' + (plan.currency || 'SAR')), '') : '') + '</div>' +
      '<div class="s360-meta" style="margin-top:10px; color:var(--text-muted); font-size:.78rem;">' +
        (ps.start_date ? '<span>' + esc(t('startDate')) + ': ' + fmtDate(ps.start_date) + '</span>' : '') +
        (ps.end_date ? '<span>· ' + esc(t('endDate')) + ': ' + fmtDate(ps.end_date) + '</span>' : '') +
        (has ? '<span>· ' + t('daysLeft').replace('%d', fmtN(ps.days_remaining)) + '</span>' : '') +
        '<span>· ' + fmtN(ps.sessions_used) + '/' + fmtN(plan.included_live_sessions || 0) + ' ' + esc(t('sessionsIncluded')) + '</span>' +
      '</div>';
  }

  var actions = '';
  if(hasPerm('subscriptions.manage')){
    actions = '<div class="btn-row" style="margin-top:12px;">' +
      (has && ps.status !== 'suspended' && ps.status !== 'cancelled' ? '<button class="btn btn-outline btn-sm" id="p360Extend">' + esc(t('extendDays').replace('%d', 30)) + '</button>' : '') +
      (has && ps.status !== 'suspended' ? '<button class="btn btn-outline btn-sm" id="p360Suspend">' + esc(t('suspend')) + '</button>' : '') +
      (has && ps.status === 'suspended' ? '<button class="btn btn-outline btn-sm" id="p360React">' + esc(t('reactivate')) + '</button>' : '') +
      '</div>';
  }

  var history = (x.history || []).map(function(h){
    var act = lang === 'ar' ? ({assigned:'اسندت', extended:'مددت', suspended:'اوقفت', reactivated:'اعيد تفعيلها', renewed:'جددت', changed:'غيّرت'}[h.action] || h.action) : h.action;
    return '<div class="reason-item"><span class="badge-dot gold" style="margin-top:5px;"></span><div><div>' + esc(act) + ' - ' + esc(lang === 'ar' ? h.plan_ar : h.plan) + '</div>' +
      '<span class="why">' + (h.old_end_date ? fmtDate(h.old_end_date) + ' → ' : '') + fmtDate(h.new_end_date) + (h.reason ? ' · ' + esc(h.reason) : '') + ' · ' + relTime(h.created_at) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var classes = x.classes || {};
  var nextC = (classes.next || []).map(function(c){
    return '<div class="reason-item"><span class="badge-dot green" style="margin-top:5px;"></span><div><div>' + esc(c.topic || '-') + ' · ' + esc(c.group_name || '-') + '</div><span class="why">' + fmtDate(c.date) + ' ' + esc(c.time || '') + (c.teacher ? ' · ' + esc(c.teacher) : '') + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';
  var recentC = (classes.recent || []).map(function(c){
    return '<div class="reason-item"><span class="badge-dot ' + (c.status === 'completed' ? 'green' : 'muted') + '" style="margin-top:5px;"></span><div><div>' + esc(c.topic || '-') + '</div><span class="why">' + fmtDate(c.date) + ' · ' + statusChip(c.attendance_status || 'scheduled') + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noData')) + '</div>';

  var anns = (x.announcements || []).map(function(a){
    return '<div class="reason-item"><span class="badge-dot ' + (a.read ? 'green' : 'warn') + '" style="margin-top:5px;"></span><div><div>' + esc(a.title) + '</div><span class="why">' + fmtDate(a.created_at) + ' · ' + (a.read ? t('readCount') : t('unreadCount')) + '</span></div></div>';
  }).join('') || '<div class="sub">' + esc(t('noAnnouncements')) + '</div>';

  body.innerHTML =
    '<div class="card">' + statusLine + actions +
    '<div class="sub" style="margin-top:12px; color:var(--text-muted);">' + esc(t('planNote')) + '</div></div>' +
    '<div class="grid grid-2"><div>' +
    '<div class="section-title">' + esc(t('planHistory')) + '</div><div class="card"><div class="reason-list">' + history + '</div></div>' +
    '<div class="section-title">' + esc(t('announcementDelivery')) + '</div><div class="card"><div class="reason-list">' + anns + '</div></div></div>' +
    '<div><div class="section-title">' + esc(t('upcoming')) + ' - ' + esc(t('liveClasses')) + '</div><div class="card"><div class="reason-list">' + nextC + '</div></div>' +
    '<div class="section-title">' + esc(t('recent')) + ' - ' + esc(t('liveClasses')) + '</div><div class="card"><div class="reason-list">' + recentC + '</div></div></div></div>';
  loadIcons();

  var extBtn = $('p360Extend');
  if(extBtn) extBtn.addEventListener('click', async function(){
    var rr = await rpc('admin_extend_plan', { p_user_id: uid, p_days: 30, p_reason: 'Extend +30' });
    if(!rr.ok){ toast((rr.error && rr.error.message) || t('permissionDenied'), true); return; }
    toast(t('planExtended')); renderTabPlan(d);
  });
  var susBtn = $('p360Suspend');
  if(susBtn) susBtn.addEventListener('click', async function(){
    var rr = await rpc('admin_plan_status', { p_user_id: uid, p_status: 'suspended', p_reason: 'Suspended by admin' });
    if(!rr.ok){ toast((rr.error && rr.error.message) || t('permissionDenied'), true); return; }
    toast(t('planStatusChanged')); renderTabPlan(d);
  });
  var reBtn = $('p360React');
  if(reBtn) reBtn.addEventListener('click', async function(){
    var rr = await rpc('admin_plan_status', { p_user_id: uid, p_status: 'active', p_reason: 'Reactivated by admin' });
    if(!rr.ok){ toast((rr.error && rr.error.message) || t('permissionDenied'), true); return; }
    toast(t('planStatusChanged')); renderTabPlan(d);
  });
}

/* ============================================================
   25. INIT - boot + chrome wiring
   ============================================================ */
document.addEventListener('DOMContentLoaded', function(){
  var lg = $('langBtn');
  if(lg) lg.addEventListener('click', function(){ lang = lang === 'ar' ? 'en' : 'ar'; applyLang(true); renderSidebar(); var v = document.querySelector('.side-link.active'); if(v) goTo(v.dataset.view); });
  var lo = $('logoutBtn');
  if(lo) lo.addEventListener('click', async function(){ var c = client(); if(c) await c.auth.signOut(); window.location.href = 'login.html'; });
var mm = $('mobileMenuBtn');
  if(mm) mm.addEventListener('click', function(){ $('sidebar').classList.toggle('mobile-open'); });
  var nav = $('sidebarNav');
  if(nav) nav.addEventListener('click', function(e){
    var link = e.target.closest ? e.target.closest('.side-link') : null;
    if(link) goTo(link.dataset.view);
  });
  boot();
});

/* ============================================================
   24b. LIVE CLASS REQUESTS  (student credit requests -> admin approve/decline + city manager)
   ============================================================ */
var LC_SVC = {
  group_online_40:{en:'Group online (40m)', ar:'جماعية اونلاين (40د)'},
  private_online_40:{en:'Private online (40m)', ar:'خاصة اونلاين (40د)'},
  in_person_40:{en:'In-person (40m)', ar:'حضورية (40د)'}
};
var LC_ST = {pending:{en:'Pending',ar:'قيد الانتظار'},approved:{en:'Approved',ar:'مقبولة'},declined:{en:'Declined',ar:'مرفوضة'},cancelled:{en:'Cancelled',ar:'ملغية'}};
function lcSvcLabel(code){ var m=LC_SVC[code]||{}; return lang==='ar'?(m.ar||code):(m.en||code); }
function lcStLabel(st){ var m=LC_ST[st]||{en:st,ar:st}; return lang==='ar'?m.ar:m.en; }

var lcState = { filter:'pending', cities:[], reqs:[] };

async function liveClassesView(){
  $('viewArea').innerHTML = pageHead(t('liveClasses')||'Class Requests', lang==='ar'?'طلبات الحصص المباشرة والرصيد':'Live class credit requests and cities') + loadingBlock();
  await lcLoad();
}

async function lcLoad(){
  var host = $('viewArea'); if(!host) return;
  var r = await rpc('admin_live_class_requests', { p_status: lcState.filter==='pending' ? 'pending' : null });
  var c = await rpc('admin_list_live_class_cities');
  if(!r.ok){ host.innerHTML = pageHead('Class Requests', '') + errBlock(rpcErrMsg(r)); return; }
  lcState.reqs = r.data || [];
  lcState.cities = (c.ok && c.data) ? c.data : [];
  lcRender();
}

function lcRender(){
  var host = $('viewArea'); if(!host) return;
  var A = lang==='ar';
  var reqs = lcState.reqs;
  var pending = reqs.filter(function(r){ return r.status==='pending'; });
  var filtBtn = function(val){ return '<button class="btn '+(lcState.filter===val?'btn-gold':'btn-outline')+' btn-sm" data-lc-filter="'+val+'">'+esc(val==='pending'?(A?'المعلقة':'Pending'):(A?'الكل':'All'))+' ('+(val==='pending'?pending.length:reqs.length)+')</button>'; };

  var rows = reqs.length ? reqs.map(function(r){
    var pend = r.status==='pending';
    var stCls = r.status;
    return '<div class="card lc-row" style="margin-bottom:12px;">'+
      '<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start;">'+
        '<div style="flex:1;min-width:220px;">'+
          '<div style="font-weight:700;">'+esc(lcSvcLabel(r.service_code))+' <span class="chip muted">'+esc(r.credit_cost+' '+(A?'رصيد':'credits'))+'</span></div>'+
          '<div style="font-size:.82rem;color:var(--text-secondary);margin-top:3px;">'+esc(r.student_email||r.student_id)+'</div>'+
          '<div style="font-size:.8rem;color:var(--text-muted);margin-top:4px;line-height:1.6;">'+
            (r.city_raw?(esc((A?'المدينة: ':'City: ')+r.city_raw)+' - '):'')+
            (r.preferred_times?esc((A?'الوقت المناسب: ':'Preferred: ')+r.preferred_times):'')+
            (r.student_notes?('<br>'+(A?'ملاحظات: ':'Notes: ')+esc(r.student_notes)):'')+
          '</div>'+
          '<div style="font-size:.74rem;color:var(--text-muted);margin-top:6px;">'+esc(fmtDate(r.created_at))+(r.decision_note?(' - '+esc(r.decision_note)):'')+'</div>'+
        '</div>'+
        '<span class="chip lc-st '+stCls+'">'+esc(lcStLabel(r.status))+'</span>'+
      '</div>'+
      (pend ?
        '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center;">'+
          '<input class="input" data-lc-note="'+esc(r.id)+'" style="flex:1;min-width:160px;" placeholder="'+esc(A?'ملاحظة القرار (اختياري)':'Decision note (optional)')+'">'+
          '<button class="btn btn-gold btn-sm" data-lc-decide="'+esc(r.id)+'|1">'+esc(A?'قبول':'Approve')+'</button>'+
          '<button class="btn btn-outline btn-sm" data-lc-decide="'+esc(r.id)+'|0">'+esc(A?'رفض':'Decline')+'</button>'+
        '</div>' : '')+
    '</div>';
  }).join('') : '<div class="card" style="padding:24px;">'+emptyBlock(A?'لا توجد طلبات حاليا':'No requests right now')+'</div>';

  var cityRows = lcState.cities.length ? lcState.cities.map(function(c){
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">'+
      '<span>'+esc(c.city_name)+' <span class="chip '+(c.in_person_available?'green':'muted')+'">'+esc(c.in_person_available?(A?'متوفرة':'Available'):(A?'متوقفة':'Off'))+'</span></span>'+
      '<button class="btn btn-outline btn-sm" data-lc-city-toggle="'+esc(c.id)+'" data-on="'+(c.in_person_available?1:0)+'">'+esc(c.in_person_available?(A?'ايقاف':'Disable'):(A?'تفعيل':'Enable'))+'</button>'+
    '</div>';
  }).join('') : emptyBlock(A?'لا توجد مدن بعد':'No cities yet');

  host.innerHTML = pageHead(A?'طلبات الحصص':'Class Requests', A?'رصيد الحصص وطلبات الحصص المباشرة':'Live class credit requests and cities') +
    '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">'+filtBtn('pending')+filtBtn('all')+'</div>'+
    '<div class="section-title">'+esc(A?'الطلبات':'Requests')+'</div>'+
    rows +
    '<div class="section-title" style="margin-top:26px;">'+esc(A?'مدن الحصص الحضورية':'In-person cities')+'</div>'+
    '<div class="card" style="padding:6px 16px;margin-bottom:14px;">'+cityRows+'</div>'+
    '<div class="card" style="padding:16px;">'+
      '<div style="font-weight:700;margin-bottom:8px;">'+esc(A?'اضف مدينة':'Add a city')+'</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+
        '<input class="input" id="lcCityName" style="flex:1;min-width:160px;" placeholder="'+esc(A?'اكتب اسم المدينة':'Type city name')+'">'+
        '<label class="chip-input" style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="lcCityAvail" checked> '+esc(A?'متوفرة للحضور':'Available')+'</label>'+
        '<button class="btn btn-gold btn-sm" id="lcCityAdd">'+esc(A?'اضافة':'Add city')+'</button>'+
      '</div>'+
      '<div style="font-size:.78rem;color:var(--text-muted);margin-top:8px;">'+esc(A?'اكتب اسم المدينة يدويا، مثل: النماص، ابها، جدة. الحصص الحضورية متوفرة حاليا في النماص فقط.':'Type the city name freely, e.g. Al Namas, Abha, Jeddah. In-person classes are currently available in Al Namas only.')+'</div>'+
    '</div>';
  lcWire();
}

function lcWire(){
  var host = $('viewArea'); if(!host) return;
  host.querySelectorAll('[data-lc-filter]').forEach(function(b){ b.addEventListener('click', function(){ lcState.filter = b.getAttribute('data-lc-filter'); lcLoad(); }); });
  host.querySelectorAll('[data-lc-decide]').forEach(function(b){ b.addEventListener('click', async function(){
    var parts = b.getAttribute('data-lc-decide').split('|');
    var id = parts[0]; var approve = parts[1] === '1';
    var noteEl = host.querySelector('[data-lc-note="'+id+'"]');
    var note = noteEl ? noteEl.value.trim() : '';
    b.disabled = true; var orig = b.textContent; b.textContent = lang==='ar'?'...':'...';
    var r = await rpc('admin_decide_live_class_request', { p_request_id:id, p_approve:approve, p_note:note });
    b.disabled = false; b.textContent = orig;
    if(!r.ok){ toast(lang==='ar'?(approve?'ما قدرنا نقبل الطلب':'ما قدرنا نرفض الطلب'):(approve?'Could not approve':'Could not decline'), true); return; }
    await audit('liveclass.'+(approve?'approve':'decline'), 'live_class_request', id, { note:note });
    toast(lang==='ar'?(approve?'تم قبول الطلب':'تم رفض الطلب')+(approve?'':' - تم ارجاع الرصيد'):(approve?'Request approved':'Request declined - credit refunded'));
    await lcLoad();
  }); });
  host.querySelectorAll('[data-lc-city-toggle]').forEach(function(b){ b.addEventListener('click', async function(){
    var id = b.getAttribute('data-lc-city-toggle');
    var on = b.getAttribute('data-on') === '1';
    var city = (lcState.cities.find(function(c){ return c.id === id; })||{}).city_name || '';
    var r = await rpc('admin_manage_live_class_city', { p_city_name:city, p_available:!on });
    if(!r.ok){ toast(lang==='ar'?'ما قدرنا نحدث المدينة':'Could not update city', true); return; }
    await audit('liveclass.city.toggle', 'live_class_city', id, { city:city, available:!on });
    await lcLoad();
  }); });
  var addBtn = $('lcCityAdd');
  if(addBtn) addBtn.addEventListener('click', async function(){
    var name = $('lcCityName').value.trim();
    if(!name){ toast(lang==='ar'?'اكتب اسم المدينة':'Type a city name', true); return; }
    var avail = $('lcCityAvail').checked;
    var r = await rpc('admin_manage_live_class_city', { p_city_name:name, p_available:avail });
    if(!r.ok){ toast(lang==='ar'?'ما قدرنا نضيف المدينة':'Could not add city', true); return; }
    await audit('liveclass.city.add', 'live_class_city', null, { city:name, available:avail });
    $('lcCityName').value = '';
    toast(lang==='ar'?'تمت اضافة المدينة':'City added');
    await lcLoad();
  });
}

})();
