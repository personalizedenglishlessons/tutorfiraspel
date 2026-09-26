#!/usr/bin/env python3
"""
Saudi dialect sweep — converts formal MSA Arabic to Saudi dialect across all source files.
- Ta marbuta (ة) → ه
- Hamza: أ→ا, إ→ا, ؤ→و, ئ→ي, ء→ (removed)
- MSA words → Saudi dialect equivalents
- Skips SAUDI_SWAPS array and saudiifyAr function (they need formal Arabic for runtime conversion)
"""
import re, os, sys

# MSA → Saudi word replacements (order matters: longest first)
WORD_SWAPS = [
    # Phrases first (longest)
    ['ماذا تريد ان تفعل', 'وش تبي تسوي'],
    ['تريد ان تفعل', 'تبي تسوي'],
    ['بت اذهب الى', 'بروح لـ'],
    ['اريد ان اذهب', 'ابي اروح'],
    ['اريد ان', 'ابي'],
    ['ماذا تريد', 'وش تبي'],
    ['ماذا تفعل', 'وش تسوي'],
    ['كيف حالكم', 'كيفكم'],
    ['كيف حالك', 'كيفك'],
    ['هذا صحيح', 'ايه صح'],
    ['بلد اخر', 'بلد ثاني'],
    ['شي اخر', 'شي ثاني'],
    ['مره اخرى', 'مره ثانية'],
    ['ان اذهب', 'اروح'],
    ['لازم ان', 'لازم'],
    ['بس', 'بس'],  # already Saudi
    ['ايضا', 'بسن'],
    ['كذلك', 'بسن'],
    ['الان', 'الحين'],
    ['غدا', 'بكرة'],
    ['اين', 'وين'],
    ['لماذا', 'ليش'],
    ['كيفما', 'كيف ما'],
    # Single words
    ['اريد', 'ابي'],
    ['نريد', 'نبغى'],
    ['تريد', 'تبي'],
    ['يريد', 'يبي'],
    ['ماذا', 'وش'],
    ['اذهب', 'اروح'],
    ['يذهب', 'يروح'],
    ['ذهبت', 'رحت'],
    ['ذهب', 'راح'],
    ['يتحدث', 'يتكلم'],
    ['تحدث', 'تكلم'],
    ['المتحدث', 'المتكلم'],
    ['يقوم', 'يسوي'],
    ['يجب', 'لازم'],
    ['ينبغي', 'لازم'],
    ['يمكن', 'يمكن'],  # same in Saudi
    ['ينبغي', 'لازم'],
    ['نعم', 'ايه'],
    ['الطعام', 'الاكل'],
    ['الشراب', 'الشرب'],
    ['العمل', 'الشغل'],
    ['المنزل', 'البيت'],
    ['المال', 'الفلوس'],
    ['النقود', 'الفلوس'],
    ['الهاتف', 'الجوال'],
    ['صديقي', 'صاحبي'],
    ['صديق', 'صاحب'],
    ['الاصدقا', 'الاصحاب'],
    ['اخي', 'اخوي'],
    ['عايلتي', 'اهلي'],
    ['اسرتي', 'اهلي'],
    ['جميله', 'حلوه'],
    ['جميل', 'حلو'],
    ['جيده', 'زينة'],
    ['جيد', 'زين'],
    ['سعيد', 'مبسوط'],
    ['حزين', 'زعلان'],
    ['غاضب', 'معصب'],
    ['متعب', 'تعبان'],
    ['جايع', 'جوعان'],
    ['مستيقظ', 'صاحي'],
    ['قريبا', 'قريب'],
    ['ربما', 'يمكن'],
    ['بالتاكيد', 'اكيد'],
    ['حسنا', 'طيب'],
    ['تماما', 'تمام'],
    ['اعتقد', 'اظن'],
    ['اشعر', 'احس'],
    ['ارى', 'اشوف'],
    ['نحن', 'احنا'],
    ['معي', 'معاي'],
    ['معك', 'معاك'],
    ['كثيرا', 'كثير'],
    ['قليلا', 'شوي'],
    ['اولا', 'اول شي'],
    ['ثم', 'بعدين'],
    ['عندما', 'لما'],
    ['اللى', 'اللي'],
    ['التي', 'اللي'],
    ['الذي', 'اللي'],
    ['الذين', 'اللي'],
    ['هذه', 'هذي'],
    ['هذا', 'ذا'],
    ['اولئك', 'هذول'],
    ['هؤلاء', 'هذول'],
    ['ذلك', 'ذاك'],
    ['كانت', 'كانت'],  # same
    ['يكون', 'يكون'],  # same
    ['تكون', 'تكون'],  # same
    ['لقد', 'قد'],  # simplify
    ['بسبب', 'سبب'],
    ['كما', 'مثل'],
    ['فقط', 'بس'],
    ['دائما', 'دائما'],  # same
    ['عادة', 'عادة'],  # same
    ['غالبا', 'غالبا'],  # same
]

# Ta marbuta and hamza replacements
TA_MARBUTA = '\u0629'  # ة
TA_MARBUTA_REPLACEMENT = '\u0647'  # ه

HAMZA_MAP = {
    '\u0623': '\u0627',  # أ → ا
    '\u0625': '\u0627',  # إ → ا
    '\u0624': '\u0648',  # ؤ → و
    '\u0626': '\u064a',  # ئ → ي
    '\u0621': '',         # ء → (removed)
}

FILES = [
    'app.html',
    'admin/admin.js',
    'lib/pel_config.js',
    'lib/daily-lesson.js',
    'lib/onboard.js',
    'lib/pel-personalization.js',
    'lib/pel-plans.js',
    'lib/pel-settings.js',
    'lib/pel-assessment.js',
    'lib/cert-qr.js',
    'lib/cert-sheet.js',
    'lib/e2e_sw.js',
    'lib/pel_lesson_stage.js',
    'lib/pel_dashboard_life.js',
    'lib/pel_curriculum_path.js',
    'index.html',
    'login.html',
    'admin.html',
    'verify.html',
    'legal.html',
]

def should_skip_line(line, in_swaps_block):
    """Skip lines in SAUDI_SWAPS array or saudiifyAr function"""
    if in_swaps_block:
        return True
    if 'SAUDI_SWAPS' in line and '[' in line:
        return True
    if 'saudiifyAr' in line:
        return True
    if line.strip().startswith('//') or line.strip().startswith('/*') or line.strip().startswith('*'):
        return True
    return False

def convert_text(text):
    """Convert formal Arabic to Saudi dialect in a text string"""
    # Apply word swaps (longest first)
    for msa, saudi in WORD_SWAPS:
        if msa != saudi:
            text = text.replace(msa, saudi)
    
    # Replace ta marbuta
    text = text.replace(TA_MARBUTA, TA_MARBUTA_REPLACEMENT)
    
    # Replace hamza
    for hamza, replacement in HAMZA_MAP.items():
        text = text.replace(hamza, replacement)
    
    return text

def process_file(filepath):
    """Process a single file, converting formal Arabic to Saudi dialect"""
    if not os.path.exists(filepath):
        return 0, 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    changes = 0
    in_swaps_block = False
    new_lines = []
    
    for line in lines:
        # Track if we're inside the SAUDI_SWAPS array
        if 'SAUDI_SWAPS' in line and '[' in line:
            in_swaps_block = True
        if in_swaps_block and line.strip() == '];':
            in_swaps_block = False
            new_lines.append(line)
            continue
        
        if should_skip_line(line, in_swaps_block):
            new_lines.append(line)
            continue
        
        # Check if line has Arabic text
        if not re.search(r'[\u0600-\u06FF]', line):
            new_lines.append(line)
            continue
        
        original = line
        converted = convert_text(line)
        
        if converted != original:
            changes += 1
        
        new_lines.append(converted)
    
    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
    
    return changes, len(lines)

def main():
    total_changes = 0
    for f in FILES:
        changes, total_lines = process_file(f)
        if changes > 0:
            print(f"  {f}: {changes} lines changed ({total_lines} total)")
            total_changes += changes
    
    print(f"\nTotal lines changed: {total_changes}")

if __name__ == '__main__':
    main()
