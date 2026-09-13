#!/usr/bin/env python3
"""Generate SQL migration for remaining Arabic translations.
Outputs SQL to stdout. Pipe to tools/sql.py to apply."""
import json

# 30 choose exercises: (id, arabic_question)
CHOOSE = [
    (763, "مش كبير يعني:"),
    (698, "احتاج ___ ساعة عشان اخلص."),
    (727, "كنت جوعان، ___ سويت ساندويتش."),
    (730, "___ هو صغير، يدير الفريق."),
    (688, "اي واحد مكتوب صح؟"),
    (686, "اختار الجملة المكتوبة صح:"),
    (691, "__ اخوانك بالبيت؟"),
    (762, "اكثر طلب مهذب:"),
    (770, "احد يسالك هل تحب السمك؟ تحبه:"),
    (734, "خفف الرفض باسلوب مهذب:"),
    (774, "هو ___ يجري."),
    (639, "اي طلب اكثر لطف؟"),
    (702, "علي نسي ___ مفاتيح."),
    (784, "انا ___ ما اكلت سوشي."),
    (670, "الاجتماع ___ الاثنين."),
    (752, "___ تتعلم انجليزي؟ عشان الشغل:"),
    (749, "___ جوالي؟ تسال عن المكان:"),
    (705, "احد يقول كيف حالك؟ تجاوب:"),
    (779, "ما عندي ___."),
    (674, "اي كلمة معناها قبعة؟"),
    (680, "اي كلمة تبدأ بصوت th في كلمة think؟"),
    (683, "جمع كلمة bus:"),
    (681, "Hop مع حرف e الصامت تصير:"),
    (736, "رتب علامات القصة:"),
    (694, "___ الجزمة هناك تبعي."),
    (712, "اي رقم هو 15؟"),
    (715, "9:30 بالانجليزي:"),
    (724, "اسال عن رغبة بادب:"),
    (747, "تطلع جواز سفرك عند:"),
    (739, "اسال عن تحديث الحالة:"),
]

# 126 order exercises: (id, arabic_prompt)
# Pattern translations:
# "Build it: X" -> "رتب: X_ar"
# "Build: X" -> "رتب: X_ar"
# "Build this in English:" -> "رتب بالانجليزي:"
# "Build the question: X" -> "رتب السوال: X_ar"
# "Build it politely: X" -> "رتب باسلوب مهذب: X_ar"
# "Build it with contractions: X" -> "رتب بالاختصارات: X_ar"
ORDER = [
    (1456, "رتب: كتاب."),  # Build: a book.
    (1453, "رتب: انا طالب."),  # Build: I am a student.
    (1459, "رتب: هي اختي."),  # Build: She is my sister.
    (1465, "رتب: كتابين."),  # Build: two books.
    (1462, "رتب: هذا قلمي."),  # Build: This is my pen.
    (1390, "رتب: متى الاجتماع؟"),  # Build: When is the meeting?
    (1387, "رتب: وين البنك؟"),  # Build: Where is the bank?
    (1393, "رتب: كيف حالك؟"),  # Build: How are you?
    (1396, "رتب: ليش تأخرت؟"),  # Build: Why are you late?
    (1302, "رتب: هلو، كيف حالك؟"),  # Build: Hello, how are you?
    (1311, "رتب: كيف حالك اليوم؟"),  # Build: How are you today?
    (1308, "رتب: وش اسمك؟"),  # Build: What is your name?
    (1314, "رتب: لو سمحت، بليز."),  # Build: Excuse me, please.
    (1305, "رتب: اسف، تأخرت."),  # Build: Sorry, I am late.
    (1438, "رتب: A حرف apple."),  # Build: A is for apple.
    (1447, "رتب: الجبن حلو."),  # Build: The cheese is good.
    (1450, "رتب: اكتب اسمك."),  # Build: Write your name.
    (1444, "رتب: هذا حلو."),  # Build: This is good.
    (1441, "رتب: A E I O U."),  # Build: A E I O U.
    (1414, "رتب: اقدر اسبح."),  # Build: I can swim.
    (1423, "رتب: تفضل."),  # Build: Here you are.
    (1420, "رتب: ممكن ادخل؟"),  # Build: May I come in?
    (1417, "رتب: ممكن تساعدني؟"),  # Build: Could you help me?
    (1480, "رتب: بالليل ارتاح."),  # Build: In the evening I rest.
    (1471, "رتب: هي تشرب قهوة."),  # Build: She drinks coffee.
    (1474, "رتب: اروح الشغل الساعة ثمان."),  # Build: I go to work at eight.
    (1477, "رتب: انام الساعة عشر."),  # Build: I sleep at ten.
    (1468, "رتب: اصحى الساعة ست."),  # Build: I wake up at six.
    (1330, "رتب: ابوي مدرس."),  # Build: My father is a teacher.
    (1318, "رتب: عندي سيارة."),  # Build: I have a car.
    (1333, "رتب: لازم اروح."),  # Build: I have to go.
    (1321, "رتب: هذا كتابي."),  # Build: This is my book.
    (1324, "رتب: فيه مشكلة."),  # Build: There is a problem.
    (1327, "رتب: قلم مين هذا؟"),  # Build: Whose pen is this?
    (1432, "رتب: روح طول."),  # Build: Go straight.
    (1426, "رتب: ساكن بجدة."),  # Build: I live in Jeddah.
    (1429, "رتب: اشتغل بالصبح."),  # Build: I work in the morning.
    (1435, "رتب: اروح المدرسة."),  # Build: I go to school.
    (1405, "رتب: اليوم الاثنين."),  # Build: Today is Monday.
    (1411, "رتب: كم سعره؟"),  # Build: How much is it?
    (1408, "رتب: المدرسة تبدأ سبتمبر."),  # Build: School starts in September.
    (1399, "رتب: ثلاثة كتب."),  # Build: Three books.
    (1402, "رتب: الساعة ثلاثة."),  # Build: It is three o'clock.
    (1483, "رتب: اهلي ساكنين بجدة."),  # Build: My parents live in Jeddah.
    (1495, "رتب: هي حزينة."),  # Build: She is sad.
    (1489, "رتب: اشرب ماي."),  # Build: I drink water.
    (1492, "رتب: سكر الباب."),  # Build: Close the door.
    (1486, "رتب: مديري طيب."),  # Build: My boss is kind.
    (1351, "رتب: بادررس."),  # Build: I am going to study.
    (1363, "رتب: بادررس طب."),  # Build: I am going to study medicine.
    (1366, "رتب: بتساعدني؟"),  # Build: Will you help me?
    (1360, "رتب: بأسافر بكرا."),  # Build: I will travel tomorrow.
    (1354, "رتب: بساعدك."),  # Build: I will help you.
    (1357, "رتب: اظن بتطول."),  # Build: I think it will rain.
    (1342, "رتب: رحت مكة."),  # Build: I went to Mecca.
    (1348, "رتب: ما رحت."),  # Build: I didn't go.
    (1345, "رتب: رحت؟"),  # Build: Did you go?
    (1339, "رتب: هي اشتغلت امبارح."),  # Build: She worked yesterday.
    (1336, "رتب: كنت بالبيت."),  # Build: I was at home.
    (766, "رتب بالانجليزي:"),  # Build this in English:
    (764, "رتب بالانجليزي:"),  # Build this in English:
    (700, "رتب: اعطني القلم."),  # Build it: Give me the pen.
    (1384, "رتب: خلني اوضح النقطة."),  # Build: Let me clarify the point.
    (1369, "رتب: مرفق التقرير."),  # Build: Please find the report attached.
    (1375, "رتب: اقترح نحسن الطريقة."),  # Build: I suggest we improve the process.
    (1372, "رتب: ممكن تلخصها؟"),  # Build: Could you summarize that?
    (1378, "رتب: نقدر نتفاوض على الموعد."),  # Build: We can negotiate the deadline.
    (1381, "رتب: اليوم بصور نتايجنا."),  # Build: Today I will present our results.
    (615, "رتب بالاختصارات: احنا جاهزين."),  # Build it with contractions: We're ready.
    (608, "رتب: هي مشغولة."),  # Build it: She is not busy.
    (610, "رتب السوال: هي بالبيت؟"),  # Build the question: Is she at home?
    (632, "رتب: تقدر تساعدني؟"),  # Build it: Can you help me?
    (634, "رتب: ما اقدر اجي بكرا."),  # Build it: I can't come tomorrow.
    (618, "رتب: هو مو بالشغل اليوم."),  # Build it: He is not at work today.
    (628, "رتب: كان مشغول امبارح؟"),  # Build it: Was he busy last night?
    (788, "رتب بالانجليزي:"),  # Build this in English:
    (728, "رتب: طلعنا لان وقت متأخر."),  # Build it: We left because it was late.
    (649, "رتب: تحب قهوة؟"),  # Build it: Do you like coffee?
    (647, "رتب: ما نشتغل الجمعة."),  # Build it: We don't work on Friday.
    (658, "رتب: بنام بدري."),  # Build it: I am going to sleep early.
    (653, "رتب: عندهم بيت كبير."),  # Build it: They have a big house.
    (657, "رتب: لازم تتصل عليه."),  # Build it: She has to call him.
    (603, "رتب: الجو حار اليوم."),  # Build it: It is hot today.
    (783, "رتب بالانجليزي:"),  # Build this in English:
    (595, "رتب: انا جاهز."),  # Build it: I am ready.
    (757, "رتب بالانجليزي:"),  # Build this in English:
    (760, "رتب بالانجليزي:"),  # Build this in English:
    (771, "رتب بالانجليزي:"),  # Build this in English:
    (732, "رتب: اظن فكرة حلوة."),  # Build it: I think it is a good idea.
    (773, "رتب بالانجليزي:"),  # Build this in English:
    (740, "رتب: ممكن اخذ رسالة؟"),  # Build it: Could I take a message?
    (637, "رتب باسلوب مهذب: ممكن تفتح الباب؟"),  # Build it politely: Could you open the door?
    (701, "رتب: هذا كتابها."),  # Build it: This is her book.
    (785, "رتب بالانجليزي:"),  # Build this in English:
    (664, "رتب: هو عند البنك."),  # Build it: He is at the bank.
    (667, "رتب: كتابك على المكتب."),  # Build it: Your book is on the desk.
    (668, "رتب: الكرة تحت السرير."),  # Build it: The ball is under the bed.
    (644, "رتب: هي تروح المدرسة."),  # Build it: She goes to school.
    (640, "رتب: اروح الشغل كل يوم."),  # Build it: I go to work every day.
    (755, "رتب بالانجليزي:"),  # Build this in English:
    (753, "رتب بالانجليزي:"),  # Build this in English:
    (748, "رتب بالانجليزي:"),  # Build this in English:
    (750, "رتب بالانجليزي:"),  # Build this in English:
    (703, "رتب: صباح الخير."),  # Build it: Good morning.
    (708, "رتب: اسمي سارة."),  # Build it: My name is Sara.
    (706, "رتب: مشكور وايد."),  # Build it: Thank you very much.
    (780, "رتب بالانجليزي:"),  # Build this in English:
    (735, "رتب: الاسبوع اللي راح رحت جدة."),  # Build it: Last week I went to Jeddah.
    (697, "رتب: فيه كرسيين."),  # Build it: There are two chairs.
    (695, "رتب: هذي كتبي."),  # Build it: These are my books.
    (713, "رتب: نلتقي الاثنين."),  # Build it: We meet on Monday.
    (716, "رتب: الساعة سبعة."),  # Build it: It is seven oclock.
    (718, "رتب: اشرب ماي."),  # Build it: I drink water.
    (720, "رتب: اروح البيت الحين."),  # Build it: I go home now.
    (725, "رتب: اتصل علي بعدين."),  # Build it: Please call me later.
    (722, "رتب: ابغى شاي، بليز."),  # Build it: I want tea, please.
    (742, "رتب: هذي امي."),  # Build it: This is my mother.
    (744, "رتب: شاي واحد، بليز."),  # Build it: One tea, please.
    (746, "رتب: ابعتلي التقرير."),  # Build it: Send me the report.
    (622, "رتب: تأخروا."),  # Build it: They were late.
    (624, "رتب السوال: كنت بالبيت؟"),  # Build the question: Were you at home?
    (604, "رتب: تأخروا."),  # Build it: They are late.
    (768, "رتب بالانجليزي:"),  # Build this in English:
    (661, "رتب: بساعدك."),  # Build it: I will help you.
    (737, "رتب: خلنا نبدأ."),  # Build it: Let us get started.
    (598, "رتب السوال: انت جاهز؟"),  # Build the question: Are you ready?
]

print("-- Migration 202609130002: Add Arabic to remaining 30 choose + 126 order exercises")
print("-- No hamza, no em dashes. Saudi dialect.")
print()

# Generate choose UPDATEs
for ex_id, ar_text in CHOOSE:
    safe = ar_text.replace("'", "''")
    print(f"UPDATE lesson_exercises SET payload = jsonb_set(payload, '{{question,ar}}', to_jsonb('{safe}'::text)) WHERE id = {ex_id};")

print()

# Generate order UPDATEs
for ex_id, ar_text in ORDER:
    safe = ar_text.replace("'", "''")
    print(f"UPDATE lesson_exercises SET payload = jsonb_set(payload, '{{prompt,ar}}', to_jsonb('{safe}'::text)) WHERE id = {ex_id};")
