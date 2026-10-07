#!/usr/bin/env python3
"""Rebuild a0ss-alphabet lesson items: teach ALL 26 letters first, then words.

Each letter item teaches:
- Capital + small form
- Arabic letter name
- A visual memory hook Saudis relate to
- "Write it on paper" instruction
- Example word that starts with the letter

After all 26 letters, sentence items ("A is for apple") teach word-building.
"""

# (en, ar_meaning, translit, example_en, example_ar)
LETTERS = [
    ("A", "حرف A — الكبير A والصغير a. اسمه ا. شكله مثل الخيمه. اكتبه على ورقه.", "اي",
     "A is for apple.", "A للتفاحه."),
    ("B", "حرف B — الكبير B والصغير b. اسمه بي. شكله مثل رقم ثمانيه مكسور. اكتبه على ورقه.", "بي",
     "B is for book.", "B للكتاب."),
    ("C", "حرف C — الكبير C والصغير c. اسمه سي. شكله مثل نص القمر. اكتبه على ورقه.", "سي",
     "C is for cat.", "C للقطه."),
    ("D", "حرف D — الكبير D والصغير d. اسمه دي. شكله مثل نص دائره. اكتبه على ورقه.", "دي",
     "D is for dog.", "D للكلب."),
    ("E", "حرف E — الكبير E والصغير e. اسمه اي. شكله ثلاث خطوط متوازيه. اكتبه على ورقه.", "اي",
     "E is for egg.", "E للبيضه."),
    ("F", "حرف F — الكبير F والصغير f. اسمه اف. شكله مثل E بس ناقص خط. اكتبه على ورقه.", "اف",
     "F is for fish.", "F للسمكه."),
    ("G", "حرف G — الكبير G والصغير g. اسمه جي. شكله مثل C ومعاه علامه صغيره. اكتبه على ورقه.", "جي",
     "G is for good.", "G لكلمه زينه."),
    ("H", "حرف H — الكبير H والصغير h. اسمه ايتش. شكله مثل السلم. اكتبه على ورقه.", "ايتش",
     "H is for house.", "H للبيت."),
    ("I", "حرف I — الكبير I والصغير i. اسمه اي. شكله خط واحد مع نقطه. اكتبه على ورقه.", "اي",
     "I is for ice.", "I للثلج."),
    ("J", "حرف J — الكبير J والصغير j. اسمه جاي. شكله مثل علامه الاستفهام. اكتبه على ورقه.", "جاي",
     "J is for juice.", "J للعصير."),
    ("K", "حرف K — الكبير K والصغير k. اسمه كاي. شكله خط مع زاويه. اكتبه على ورقه.", "كاي",
     "K is for key.", "K للمفتاح."),
    ("L", "حرف L — الكبير L والصغير l. اسمه ال. شكله مثل زاويه قائمه. اكتبه على ورقه.", "ال",
     "L is for love.", "L للحب."),
    ("M", "حرف M — الكبير M والصغير m. اسمه ام. شكله مثل جبلين. اكتبه على ورقه.", "ام",
     "M is for man.", "M للرجل."),
    ("N", "حرف N — الكبير N والصغير n. اسمه ان. شكله مثل البرق. اكتبه على ورقه.", "ان",
     "N is for no.", "N لكلمه لا."),
    ("O", "حرف O — الكبير O والصغير o. اسمه او. شكله مثل الدائره. اكتبه على ورقه.", "او",
     "O is for orange.", "O للبرتقاله."),
    ("P", "حرف P — الكبير P والصغير p. اسمه بي. نفس اسم B بس شكله غير. اكتبه على ورقه.", "بي",
     "P is for pen.", "P للقلم."),
    ("Q", "حرف Q — الكبير Q والصغير q. اسمه كيو. شكله دائره مع ذيل. اكتبه على ورقه.", "كيو",
     "Q is for queen.", "Q للملكه."),
    ("R", "حرف R — الكبير R والصغير r. اسمه ار. شكله مثل P بس مع رجل. اكتبه على ورقه.", "ار",
     "R is for red.", "R للاحمر."),
    ("S", "حرف S — الكبير S والصغير s. اسمه اس. شكله مثل الثعبان. اكتبه على ورقه.", "اس",
     "S is for sun.", "S للشمس."),
    ("T", "حرف T — الكبير T والصغير t. اسمه تي. شكله مثل الصليب. اكتبه على ورقه.", "تي",
     "T is for time.", "T للوقت."),
    ("U", "حرف U — الكبير U والصغير u. اسمه يو. شكله مثل الفنجان. اكتبه على ورقه.", "يو",
     "U is for up.", "U لفوق."),
    ("V", "حرف V — الكبير V والصغير v. اسمه ڤي. شكله مثل زاويه مفتوحه. اكتبه على ورقه.", "ڤي",
     "V is for very.", "V لكلمه جدا."),
    ("W", "حرف W — الكبير W والصغير w. اسمه دبليو. شكله مثل حرفين V. اكتبه على ورقه.", "دبليو",
     "W is for water.", "W للماء."),
    ("X", "حرف X — الكبير X والصغير x. اسمه اكس. شكله مثل الصليب المتقاطع. اكتبه على ورقه.", "اكس",
     "X is for x-ray.", "X للاشعه."),
    ("Y", "حرف Y — الكبير Y والصغير y. اسمه واي. شكله مثل الشجره. اكتبه على ورقه.", "واي",
     "Y is for yes.", "Y لكلمه ايه."),
    ("Z", "حرف Z — الكبير Z والصغير z. اسمه زي. شكله مثل البرق المنكسر. اكتبه على ورقه.", "زي",
     "Z is for zoo.", "Z لحديقه الحيوانات."),
]

# Sentence items (word-building phase — after all letters are taught)
SENTENCES = [
    ("A is for apple.", "اي لحرف التفاحه.", "اي از فور ابل"),
    ("B is for book.", "بي لحرف الكتاب.", "بي از فور بوك"),
    ("D is for dog.", "دي لحرف الكلب.", "دي از فور دوق"),
    ("E is for egg.", "اي لحرف البيضه.", "اي از فور اق"),
    ("F is for fish.", "اف لحرف السمك.", "اف از فور فيش"),
    ("G is for good.", "جي لحرف زين.", "جي از فور قود"),
    ("H is for house.", "ايتش لحرف البيت.", "ايتش از فور هاوس"),
    ("I is for ice.", "اي لحرف الثلج.", "اي از فور ايس"),
    ("J is for juice.", "جاي لحرف العصير.", "جاي از فور جوس"),
    ("K is for key.", "كاي لحرف المفتاح.", "كاي از فور كي"),
    ("L is for love.", "ال لحرف الحب.", "ال از فور لاف"),
    ("M is for man.", "ام لحرف الرجل.", "ام از فور مان"),
    ("N is for no.", "ان لحرف لا.", "ان از فور نو"),
    ("O is for orange.", "او لحرف البرتقال.", "او از فور اورنج"),
    ("P is for pen.", "بي لحرف القلم.", "بي از فور بن"),
    ("Q is for queen.", "كيو لحرف الملكه.", "كيو از فور كوين"),
    ("R is for red.", "ار لحرف الاحمر.", "ار از فور رد"),
    ("S is for sun.", "اس لحرف الشمس.", "اس از فور سن"),
    ("T is for time.", "تي لحرف الوقت.", "تي از فور تايم"),
    ("U is for up.", "يو لحرف فوق.", "يو از فور اب"),
    ("V is for very.", "ڤي لحرف جدا.", "ڤي از فور ڤري"),
    ("W is for water.", "دبليو لحرف الماء.", "دبليو از فور واتر"),
    ("X is for x-ray.", "اكس لحرف الاشعه.", "اكس از فور اكس ري"),
    ("Y is for yes.", "واي لحرف ايه.", "واي از فور يس"),
    ("Z is for zoo.", "زي لحرف حديقه الحيوان.", "زي از فور زو"),
]

def gen_sql():
    lines = []
    lines.append("-- Delete existing items")
    lines.append("DELETE FROM lesson_items WHERE lesson_id = 'a0ss-alphabet';")
    lines.append("")

    # 26 letter word items (idx 0-25)
    for i, (en, ar, tr, ex_en, ex_ar) in enumerate(LETTERS):
        # Escape single quotes
        en_e = en.replace("'", "''")
        ar_e = ar.replace("'", "''")
        tr_e = tr.replace("'", "''")
        ex_en_e = ex_en.replace("'", "''")
        ex_ar_e = ex_ar.replace("'", "''")
        lines.append(
            f"INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit, example_en, example_ar) "
            f"VALUES ('a0ss-alphabet', {i}, 'word', '{en_e}', '{ar_e}', '{tr_e}', '{ex_en_e}', '{ex_ar_e}');"
        )

    # Explain: alphabet overview (idx 26)
    lines.append(
        "INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) "
        "VALUES ('a0ss-alphabet', 26, 'explain', "
        "'The English alphabet has 26 letters. Learn them in order: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z.', "
        "'الابجديه الانجليزيه فيها ٢٦ حرف. تعلم ترتيبها: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z. "
        "كل حرف له اسم وشكل. الكبير نستخدمه في بدايه الجمله والاسماء. الصغير نستخدمه في باقي الكلمات.', "
        "'ذا انجلش الفابيت هز توينتي سيكس ليترز. ليرن ذم ان اوردر.');"
    )

    # Explain: pen and paper reminder (idx 27)
    lines.append(
        "INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) "
        "VALUES ('a0ss-alphabet', 27, 'explain', "
        "'Get a pen and paper. Write each letter as you learn it.', "
        "'جيب قلم وورقه. اكتب كل حرف وانت تتعلمه. اذا نطقت الحرف وكتبته مع بعض بيخليك تحفظه اسرع.', "
        "'قلم وورقه. رايت ايتش ليتر از يو ليرن ات.');"
    )

    # 25 sentence items (idx 28-52) — word building phase
    for j, (en, ar, tr) in enumerate(SENTENCES):
        en_e = en.replace("'", "''")
        ar_e = ar.replace("'", "''")
        tr_e = tr.replace("'", "''")
        idx = 28 + j
        lines.append(
            f"INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) "
            f"VALUES ('a0ss-alphabet', {idx}, 'sentence', '{en_e}', '{ar_e}', '{tr_e}');"
        )

    # Explain: takeaway (idx 53)
    lines.append(
        "INSERT INTO lesson_items (lesson_id, idx, kind, en, ar_meaning, translit) "
        "VALUES ('a0ss-alphabet', 53, 'explain', "
        "'Practice spelling your name three times out loud.', "
        "'تدرب على هجا اسمك ثلاث مرات بصوت عالي. تحتاجها في كل استماره وموعد.', "
        "'براكتيس سبيلنج يور نيم ثري تايمز آوت لاود.');"
    )

    return "\n".join(lines)

if __name__ == "__main__":
    sql = gen_sql()
    with open("/home/user/workspace/repo/supabase/migrations/202610070003_rebuild_alphabet_lesson.sql", "w") as f:
        f.write("-- Rebuild a0ss-alphabet lesson: teach ALL 26 letters first, then word-building\n")
        f.write("-- Each letter teaches capital + small + Arabic name + memory hook + writing\n")
        f.write("-- Sentence items (A is for apple) come AFTER all letters are taught\n\n")
        f.write(sql)
    print(f"Generated {len(LETTERS)} letter items + 2 explain + {len(SENTENCES)} sentences + 1 takeaway = {len(LETTERS)+2+len(SENTENCES)+1} total")
    print("Migration file written to supabase/migrations/202610070003_rebuild_alphabet_lesson.sql")
