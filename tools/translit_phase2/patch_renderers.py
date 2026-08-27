#!/usr/bin/env python3
"""Apply Phase 2 renderer edits to app.html: show stored translit in choose/correct
exercises + patch translitEn to use Arabic ؟. Idempotent: skips if already applied."""
import re, sys
p = "/home/user/workspace/app/app.html"
s = open(p, encoding="utf-8").read()
orig = s

def rep(old, new, label):
    global s
    if old in s:
        s = s.replace(old, new, 1)
        print(f"  [OK] {label}")
    elif new in s:
        print(f"  [skip] {label} (already applied)")
    else:
        print(f"  [MISS] {label} (anchor not found)"); sys.exit(1)

# Edit 4: patch translitEn to convert ASCII ? -> Arabic ؟ (matches stored DB style)
rep("    out += ar + (punct ? punct[0] : '');\n  }\n  return out;\n}",
    "    out += ar + (punct ? punct[0] : '');\n  }\n  return out.replace(/\\?/g, '؟');\n}",
    "translitEn ?->؟")

# Edit 1: choose quiz mapping — pass option {t,tr} + question translit line
old_choose = """  const quiz = (dbl.exercises || []).filter(x => x.type === 'choose').map(x => ({
    q: x.payload.question.en + '<div class="arabic" style="font-size:.8rem; font-weight:400; margin-top:4px;">' + x.payload.question.ar + '</div>',
    options: x.payload.options.map(o => o.t),
    correct: x.payload.options.findIndex(o => o.ok),
    _hint: x.hint_ar ? { en: x.hint_en, ar: x.hint_ar } : null
  }));"""
new_choose = """  const quiz = (dbl.exercises || []).filter(x => x.type === 'choose').map(x => {
    const qtr = x.payload.question.tr || translitEn(x.payload.question.en || '');
    return {
    q: x.payload.question.en + '<div class="arabic" style="font-size:.8rem; font-weight:400; margin-top:4px;">' + x.payload.question.ar + '</div>' + (qtr ? '<div class="arabic translit" style="font-size:.76rem; color:var(--gold-soft); margin-top:3px;">' + qtr + '</div>' : ''),
    options: x.payload.options.map(o => ({ t: o.t, tr: o.tr || translitEn(o.t || '') })),
    correct: x.payload.options.findIndex(o => o.ok),
    _hint: x.hint_ar ? { en: x.hint_en, ar: x.hint_ar } : null
    };
  });"""
rep(old_choose, new_choose, "choose quiz translit")

# Edit 2: renderQuiz — handle opt as string OR {t,tr}; show per-option translit
old_rq = """    q.options.forEach((opt,i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option'; btn.textContent = opt;"""
new_rq = """    q.options.forEach((opt,i) => {
      const isObj = (opt && typeof opt === 'object');
      const label = isObj ? opt.t : opt;
      const otr = isObj ? (opt.tr || '') : '';
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.innerHTML = label + (otr ? '<span class="arabic" style="display:block;font-size:.8rem;color:var(--gold-soft);margin-top:3px;">' + otr + '</span>' : '');"""
rep(old_rq, new_rq, "renderQuiz option translit")

# Edit 3: correct renderer — show right_tr / wrong_tr under each option
old_corr = """          <button class="quiz-option dbx-pick" data-ok="wrong" style="text-align:left;">✕ ${p.wrong}</button>
          <button class="quiz-option dbx-pick" data-ok="right" style="text-align:left;">${p.right}</button>"""
new_corr = """          <div><button class="quiz-option dbx-pick" data-ok="wrong" style="text-align:left;">✕ ${p.wrong}</button><div class="arabic" style="font-size:.78rem;color:var(--gold-soft);margin-top:2px;">${p.wrong_tr || translitEn(p.wrong || '')}</div></div>
          <div><button class="quiz-option dbx-pick" data-ok="right" style="text-align:left;">${p.right}</button><div class="arabic" style="font-size:.78rem;color:var(--gold-soft);margin-top:2px;">${p.right_tr || translitEn(p.right || '')}</div></div>"""
rep(old_corr, new_corr, "correct renderer translit")

if s != orig:
    open(p, "w", encoding="utf-8").write(s)
    print("app.html updated.")
else:
    print("no changes (all already applied).")
