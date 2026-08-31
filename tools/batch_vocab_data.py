#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Themed VOCAB_BANK entries for the 24 academies that still fall back to
arbitrary vocab. Authored in stable order so indices are deterministic:
batch 1 = indices 142.., batch 2 = next, etc.

Each entry: (academy_id, category, difficulty, {en, ipa, ar, translit,
   ex_en, ex_ar, ex_tr, syn, ant, fam, coll, tip, mistake})
"""

B1='Beginner'; I1='Intermediate'; ADV='Advanced'

# CEFR -> difficulty: A1/A2=Beginner, B1/B2=Intermediate, C1/C2=Advanced
DATA = [
# ===================== BATCH 1 =====================
('american-conversations','American Conversations',I1,
  {'en':'Catch up','ipa':'/ˌkætʃ ˈʌp/','ar':'يلحق بآخر الأحداث، يتبادل الأخبار','translit':'كاتش أب',
   'ex_en':'Let\'s grab coffee and catch up.','ex_ar':'خلّنا ناخذ قهوة ونتحدث ونشوف آخر الأخبار.','ex_tr':'ليتس قراب كوفي آند كاتش أب.',
   'syn':'reconnect, update','ant':'lose touch','fam':'catch, catches, catching up','coll':'catch up with, catch up on','tip':'Use "catch up on" for news and "catch up with" for the person.','mistake':'Saying "catch up him" instead of "catch up with him."'}),

('american-conversations','American Conversations',I1,
  {'en':'Small talk','ipa':'/ˌsmɔːl ˈtɔːk/','ar':'حديث ودي مهذّب، ثرثرة لطيفة','translit':'سمول توك',
   'ex_en':'We made small talk about the weather.','ex_ar':'دار بيننا حديث ودي عن الطقس.','ex_tr':'وي ميد سمول توك اباوت ذا ويذر.',
   'syn':'chitchat, banter','ant':'deep talk, silence','fam':'talk, talking','coll':'make small talk, engage in small talk','tip':'Small talk opens doors before serious talk.','mistake':'Saying "do small talk" instead of "make small talk."'}),

('american-conversations','American Conversations',I1,
  {'en':'Hang out','ipa':'/ˈhæŋ ˌaʊt/','ar':'يقضي وقتًا مع، يتسكّع','translit':'هانق آوت',
   'ex_en':'We hang out at the mall on weekends.','ex_ar':'نتسكع في المول آخر الأسبوع.','ex_tr':'وي هانق آوت آت ذا مول أون ويك إندز.',
   'syn':'spend time, chill','ant':'avoid, stay away','fam':'hang, hanging out','coll':'hang out with, hang out at','tip':'In past tense it becomes "hung out."','mistake':'Saying "hangouted" instead of "hung out."'}),

('american-conversations','American Conversations',I1,
  {'en':'By the way','ipa':'/baɪ ðə ˈweɪ/','ar':'على فكرة، بالمناسبة','translit':'باي ذا وي',
   'ex_en':'By the way, did you call her?','ex_ar':'على فكرة، هل اتصلت بها؟','ex_tr':'باي ذا وي، ديد يو كول هر؟',
   'syn':'incidentally, speaking of which','ant':'','fam':'way, ways','coll':'by the way, just by the way','tip':'Use it to add a side note mid-conversation.','mistake':'Writing "bytheway" as one word instead of three.'}),

('american-conversations','American Conversations',I1,
  {'en':'What\'s up','ipa':'/ˈwɒts ʌp/','ar':'ما الأخبار؟ كيف الحال؟','translit':'واتس أب',
   'ex_en':'Hey, what\'s up?','ex_ar':'أهلًا، ما الأخبار؟','ex_tr':'هي، واتس أب؟',
   'syn':'how\'s it going, what\'s new','ant':'','fam':'up','coll':'what\'s up with, what\'s up man','tip':'It\'s a greeting, not a real question about problems.','mistake':'Answering with a long story instead of "not much, you?"'}),

('speaking-studio','Speaking Studio',I1,
  {'en':'Fluency','ipa':'/ˈfluːənsi/','ar':'طلاقة، سلاسة في الكلام','translit':'فلونسي',
   'ex_en':'Her fluency in English improved fast.','ex_ar':'تحسّنت طلاقتها في الإنجليزية بسرعة.','ex_tr':'هر فلونسي إن إنجلش امبروفد فاست.',
   'syn':'smoothness, flow','ant':'hesitation, stumbling','fam':'fluent, fluently','coll':'speak with fluency, build fluency','tip':'Fluency is about flow, not perfect grammar.','mistake':'Stopping at every small mistake kills fluency.'}),

('speaking-studio','Speaking Studio',I1,
  {'en':'Pronunciation','ipa':'/prəˌnʌnsiˈeɪʃən/','ar':'النطق، طريقة لفظ الكلمات','translit':'برنانسييهيشِن',
   'ex_en':'His pronunciation is very clear.','ex_ar':'نطقه واضح جدًا.','ex_tr':'هيز برنانسييهيشِن إز فيري كلير.',
   'syn':'articulation, diction','ant':'mispronunciation','fam':'pronounce, pronounced','coll':'clear pronunciation, improve pronunciation','tip':'The word itself has no "o" after the "n."','mistake':'Spelling it "pronounciation."'}),

('speaking-studio','Speaking Studio',I1,
  {'en':'Pause','ipa':'/pɔːz/','ar':'وقفة، توقف قصير','translit':'بوز',
   'ex_en':'Take a short pause to breathe.','ex_ar':'خذ وقفة قصيرة لتتنفس.','ex_tr':'تيك ا شورت بوز تو بريث.',
   'syn':'break, stop','ant':'continue, rush','fam':'pause, paused, pausing','coll':'take a pause, pause for effect','tip':'A pause adds power to your words.','mistake':'Filling every pause with "um" and "uh."'}),

('speaking-studio','Speaking Studio',I1,
  {'en':'Hesitate','ipa':'/ˈhezɪteɪt/','ar':'يتردد، يتوقف غير متأكد','translit':'هزيتيت',
   'ex_en':'Don\'t hesitate to ask questions.','ex_ar':'لا تتردد في طرح الأسئلة.','ex_tr':'دونت هزيتيت تو أسك كويستشنز.',
   'syn':'waver, falter','ant':'decide, act','fam':'hesitation, hesitantly','coll':'hesitate to, hesitate before','tip':'Confidence grows when you speak anyway.','mistake':'Saying "hestitate" and dropping a syllable.'}),

('speaking-studio','Speaking Studio',I1,
  {'en':'Express','ipa':'/ɪkˈsprɛs/','ar':'يعبّر، يوضّح','translit':'إكسبريس',
   'ex_en':'Express your idea simply.','ex_ar':'عبّر عن فكرتك ببساطة.','ex_tr':'إكسبريس يور آيديا سيمبلي.',
   'syn':'convey, state','ant':'hide, suppress','fam':'expression, expressive','coll':'express yourself, express an opinion','tip':'Simple words express ideas best.','mistake':'Saying "I am express" instead of "I express."'}),

('american-accent-lab','American Accent Lab',I1,
  {'en':'Vowel','ipa':'/ˈvaʊəl/','ar':'حرف متحرك (مثل a, e, i)','translit':'فاويل',
   'ex_en':'The word "beat" has a long vowel.','ex_ar':'كلمة "beat" بها حرف متحرك طويل.','ex_tr':'ذا وورد بيت هاز ا لونق فاويل.',
   'syn':'vowel sound','ant':'consonant','fam':'vowel, vowelled','coll':'long vowel, short vowel','tip':'American vowels are often longer when stressed.','mistake':'Confusing short "i" with long "ee."'}),

('american-accent-lab','American Accent Lab',I1,
  {'en':'Consonant','ipa':'/ˈkɒnsənənt/','ar':'حرف ساكن (مثل b, c, d)','translit':'كونسوننت',
   'ex_en':'"B" is a consonant letter.','ex_ar':'حرف "B" حرف ساكن.','ex_tr':'بي إز ا كونسوننت ليتر.',
   'syn':'consonant sound','ant':'vowel','fam':'consonant, consonantal','coll':'voiced consonant, double consonant','tip':'Consonants carry rhythm, vowels carry melody.','mistake':'Pronouncing silent consonants like the "k" in "knee."'}),

('american-accent-lab','American Accent Lab',I1,
  {'en':'Stress','ipa':'/strɛs/','ar':'النبر، التشديد على مقطع','translit':'سترِس',
   'ex_en':'Stress the second syllable.','ex_ar':'شدّد على المقطع الثاني.','ex_tr':'سترِس ذا سيكون سيلابَل.',
   'syn':'emphasis, accent','ant':'unstress','fam':'stress, stressed, stressing','coll':'word stress, stress a syllable','tip':'Stress changes meaning: REcord vs reCORD.','mistake':'Stressing every syllable equally.'}),

('american-accent-lab','American Accent Lab',I1,
  {'en':'Syllable','ipa':'/ˈsɪləbəl/','ar':'مقطع لفظي','translit':'سيلابَل',
   'ex_en':'"Water" has two syllables.','ex_ar':'كلمة "water" تتكون من مقطعين.','ex_tr':'واتر هاز تو سيلابَلز.',
   'syn':'beat, unit of sound','ant':'','fam':'syllable, syllabic','coll':'stressed syllable, count syllables','tip':'Clap the word to count its syllables.','mistake':'Saying "sy-lla-ble" as four parts; it is three.'}),

('american-accent-lab','American Accent Lab',I1,
  {'en':'Intonation','ipa':'/ˌɪntəˈneɪʃən/','ar':'التنغيم، نبرة الجملة','translit':'إنتونيهيشِن',
   'ex_en':'Rising intonation marks a question.','ex_ar':'التنغيم الصاعد يدل على سؤال.','ex_tr':'رايزينق إنتونيهيشِن ماركس ا كويستشن.',
   'syn':'pitch, melody','ant':'monotone','fam':'intonate, intonation','coll':'rising intonation, falling intonation','tip':'Your voice rises for questions, falls for statements.','mistake':'Speaking in a flat, robot-like tone.'}),

('vocabulary-vault','Vocabulary Vault',I1,
  {'en':'Synonym','ipa':'/ˈsɪnənɪm/','ar':'مرادف، كلمة بنفس المعنى','translit':'سينونيم',
   'ex_en':'"Happy" is a synonym of "glad."','ex_ar':'كلمة "happy" مرادف لكلمة "glad."','ex_tr':'هابي إز ا سينونيم أوف گلاد.',
   'syn':'equivalent, match','ant':'antonym','fam':'synonym, synonymous','coll':'exact synonym, near synonym','tip':'Learn synonyms to avoid repeating words.','mistake':'Thinking synonyms are always interchangeable in tone.'}),

('vocabulary-vault','Vocabulary Vault',I1,
  {'en':'Antonym','ipa':'/ˈæntənɪm/','ar':'ضد، كلمة بمعنى معاكس','translit':'أنتونيم',
   'ex_en':'"Hot" is an antonym of "cold."','ex_ar':'كلمة "hot" ضد لكلمة "cold."','ex_tr':'هوت إز أن أنتونيم أوف كولد.',
   'syn':'opposite','ant':'synonym','fam':'antonym, antonymous','coll':'exact antonym','tip':'Pair new words with their antonyms to remember both.','mistake':'Confusing antonym with "anonymous."'}),

('vocabulary-vault','Vocabulary Vault',I1,
  {'en':'Context','ipa':'/ˈkɒntɛkst/','ar':'السياق، القرينة','translit':'كونتيكست',
   'ex_en':'Guess the word from its context.','ex_ar':'خمّن الكلمة من سياقها.','ex_tr':'گيس ذا وورد فروم ايتس كونتيكست.',
   'syn':'setting, situation','ant':'','fam':'context, contextual','coll':'in context, out of context','tip':'Context tells you which meaning fits.','mistake':'Quoting a word "out of context" changes its sense.'}),

('vocabulary-vault','Vocabulary Vault',I1,
  {'en':'Definition','ipa':'/ˌdɛfɪˈnɪʃən/','ar':'تعريف، معنى الكلمة','translit':'ديفينيشِن',
   'ex_en':'Read the definition carefully.','ex_ar':'اقرأ التعريف بعناية.','ex_tr':'ريد ذا ديفينيشِن كيرفلي.',
   'syn':'meaning, explanation','ant':'ambiguity','fam':'define, defining','coll':'clear definition, by definition','tip':'A good definition uses simple words.','mistake':'Copying a definition without understanding it.'}),

('vocabulary-vault','Vocabulary Vault',I1,
  {'en':'Prefix','ipa':'/ˈpriːfɪks/','ar':'بادئة، جزء يضاف أول الكلمة','translit':'بريفيكس',
   'ex_en':'"Un-" is a prefix in "unhappy."','ex_ar':'"Un-" بادئة في "unhappy."','ex_tr':'أن إز ا بريفيكس إن أن هابي.',
   'syn':'starter','ant':'suffix','fam':'prefix, prefixed','coll':'add a prefix, common prefix','tip':'Prefixes like "un-" often reverse meaning.','mistake':'Confusing prefix with suffix.'}),

('grammar-academy','Grammar Academy',I1,
  {'en':'Noun','ipa':'/naʊn/','ar':'اسم، كلمة تدل على شخص أو شيء','translit':'ناون',
   'ex_en':'"Book" is a noun.','ex_ar':'"Book" اسم.','ex_tr':'بوك إز ا ناون.',
   'syn':'naming word','ant':'','fam':'noun','coll':'common noun, proper noun','tip':'Proper nouns like "Riyadh" are capitalized.','mistake':'Forgetting to capitalize proper nouns.'}),

('grammar-academy','Grammar Academy',I1,
  {'en':'Verb','ipa':'/vɜːb/','ar':'فعل، كلمة تدل على حدث','translit':'فِرب',
   'ex_en':'"Run" is an action verb.','ex_ar':'"Run" فعل حركة.','ex_tr':'رَن إز أن أكشن فِرب.',
   'syn':'action word','ant':'','fam':'verb, verbal','coll':'main verb, helping verb','tip':'Every sentence needs at least one verb.','mistake':'Writing a sentence with no verb.'}),

('grammar-academy','Grammar Academy',I1,
  {'en':'Adjective','ipa':'/ˈædʒɪktɪv/','ar':'نعت، صفة','translit':'أدجيكتيف',
   'ex_en':'"Tall" is an adjective.','ex_ar':'"Tall" صفة.','ex_tr':'تول إز أن أدجيكتيف.',
   'syn':'describing word','ant':'','fam':'adjective','coll':'comparative adjective, descriptive adjective','tip':'Adjectives come before nouns: "a tall man."','mistake':'Saying "a man tall" instead of "a tall man."'}),

('grammar-academy','Grammar Academy',I1,
  {'en':'Tense','ipa':'/tɛns/','ar':'زمن الفعل (ماضي/مضارع)','translit':'تينس',
   'ex_en':'Use the past tense for finished actions.','ex_ar':'استخدم زمن الماضي للأفعال المنتهية.','ex_tr':'يوز ذا باست تينس فور فينيشد أكشنز.',
   'syn':'verb form, time','ant':'','fam':'tense, tenses','coll':'past tense, present tense','tip':'Tense shows when an action happens.','mistake':'Mixing "went" and "go" in the same time frame.'}),

('grammar-academy','Grammar Academy',I1,
  {'en':'Subject','ipa':'/ˈsʌbdʒɪkt/','ar':'الفاعل، من يقوم بالفعل','translit':'سَبجيكت',
   'ex_en':'The subject comes before the verb.','ex_ar':'الفاعل يأتي قبل الفعل.','ex_tr':'ذا سَبجيكت كامز بي فور ذا فِرب.',
   'syn':'doer, agent','ant':'object','fam':'subject, subjective','coll':'subject of the sentence','tip':'Ask "who?" to find the subject.','mistake':'Confusing subject with object.'}),

('listening-lounge','Listening Lounge',I1,
  {'en':'Accent','ipa':'/ˈæksənt/','ar':'لهجة، طريقة نطق','translit':'أكسينت',
   'ex_en':'She has a strong American accent.','ex_ar':'لديها لهجة أمريكية واضحة.','ex_tr':'شي هاز ا سترونق أمريكان أكسينت.',
   'syn':'dialect, pronunciation','ant':'','fam':'accent, accented','coll':'strong accent, soft accent','tip':'Accents are normal; clarity matters more.','mistake':'Thinking an accent means bad English.'}),

('listening-lounge','Listening Lounge',I1,
  {'en':'Audio','ipa':'/ˈɔːdi.oʊ/','ar':'صوت مسجل','translit':'أوديو',
   'ex_en':'The audio is too quiet.','ex_ar':'الصوت المسجّل منخفض جدًا.','ex_tr':'ذا أوديو إز تو كوايت.',
   'syn':'sound, recording','ant':'silence','fam':'audio, audiovisual','coll':'audio clip, play the audio','tip':'Good audio helps you catch every word.','mistake':'Saying "the audios" as a plural noun.'}),

('listening-lounge','Listening Lounge',I1,
  {'en':'Replay','ipa':'/ˌriːˈpleɪ/','ar':'إعادة، يشغّل مرة أخرى','translit':'ري بلاي',
   'ex_en':'Replay the part you missed.','ex_ar':'أعد تشغيل الجزء الذي فاتك.','ex_tr':'ري بلاي ذا بارت يو ميست.',
   'syn':'play again, repeat','ant':'skip','fam':'replay, replayed','coll':'replay a clip, hit replay','tip':'Replay hard parts until they feel easy.','mistake':'Moving on without replaying unclear parts.'}),

('listening-lounge','Listening Lounge',I1,
  {'en':'Mumble','ipa':'/ˈmʌmbəl/','ar':'يهمس، يتكلم بغير وضوح','translit':'مَمبَل',
   'ex_en':'Don\'t mumble; speak clearly.','ex_ar':'لا تهمس؛ تحدث بوضوح.','ex_tr':'دونت مَمبَل؛ سبيك كليرلي.',
   'syn':'mutter, whisper','ant':'enunciate, shout','fam':'mumble, mumbled','coll':'mumble words, mumble to yourself','tip':'Open your mouth more to avoid mumbling.','mistake':'Mumbling from nervousness and losing the listener.'}),

('listening-lounge','Listening Lounge',I1,
  {'en':'Volume','ipa':'/ˈvɒljuːm/','ar':'مستوى الصوت، ارتفاعه','translit':'فوليوم',
   'ex_en':'Turn up the volume.','ex_ar':'ارفع مستوى الصوت.','ex_tr':'تيرن أب ذا فوليوم.',
   'syn':'loudness, level','ant':'mute','fam':'volume','coll':'turn up the volume, lower the volume','tip':'A clear volume helps you catch detail.','mistake':'Setting volume too high and missing soft sounds.'}),
]
