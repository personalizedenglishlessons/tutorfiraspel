#!/usr/bin/env python3
"""
Comprehensive fix script for PEL app.
Fixes: mispronunciations, hamza in PHON_DICT, doubled و, extra alef patterns, Arabic typos.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# === 1. SPECIFIC MISPRONUNCIATION FIXES (PHON_DICT) ===
# Format: 'word': 'correct_translit'
SPECIFIC_FIXES = {
    # Wrong transliterations
    'africa': 'افريكا',
    'african': 'افريكان',
    'agricultural': 'اكريكالتشيرال',
    'agriculture': 'اكريكالتشر',
    'alcohol': 'الكحول',
    'ah': 'اه',
    'alan': 'الان',
    'allen': 'الين',
    'aluminum': 'المنيوم',
    'amd': 'امدي',
    'afghanistan': 'افغانستان',
    'th': 'ذ',
    'world': 'ورلد',
    'worldwide': 'ورلدوايد',
    'foreign': 'فورن',
    'written': 'ريتن',
    'honest': 'اونست',
    'honor': 'اونر',
    'island': 'ايلند',
    'castle': 'كاسل',
    'column': 'كولم',
    'physical': 'فيزيكل',
    'psychology': 'سايكولوجي',
    'machine': 'ميشين',
    'ocean': 'اوشن',
    'ever': 'ايڤر',
    'many': 'ميني',
    'any': 'اني',
    'woman': 'ومان',
    'women': 'ويمين',
    'apple': 'اپل',
    'cable': 'كيبل',
    'stable': 'ستيبل',
    'available': 'اڤيلابل',
    'comfortable': 'كامفتبل',
    'cough': 'كاف',
    # Hamza removal in PHON_DICT
    'cancel': 'كانسل',
    'cancelled': 'كانسيلد',
    'consultant': 'كونسلتانت',
    'consultants': 'كونسلتانتس',
    'consultation': 'كونسليشان',
    'consulting': 'كونسلينج',
    'council': 'كاونسل',
    'counsel': 'كاونسل',
    'counseling': 'كاونسلينج',
    'expansion': 'اكسپانشان',
    'financial': 'فايننشال',
    'miscellaneous': 'ميسيلينياس',
    'muscle': 'ماسل',
    'paragraph': 'پاراقراف',
    'pennsylvania': 'پينسلوينيا',
    'russell': 'راسل',
    'substantial': 'سابستانشال',
    'viagra': 'ڤياقرا',
    # -le ending words with extra alef
    'angle': 'انقل',
    'article': 'ارتاكل',
    'circle': 'سيركل',
    'couple': 'كاپل',
    'eagle': 'ايقل',
    'example': 'اقزامپل',
    'google': 'قوقل',
    'handle': 'هاندل',
    'middle': 'ميدل',
    'multiple': 'مالتابل',
    'oracle': 'وراكل',
    'participle': 'پارتيسيپل',
    'principle': 'پرينساپل',
    'purple': 'پيرپل',
    'puzzle': 'پازل',
    'sample': 'سامپل',
    'simple': 'سيمپل',
    'single': 'سينقل',
    'temple': 'تيمپل',
    'uncle': 'انجكل',
    'vehicle': 'ڤيهيكل',
    # -en ending words with extra alef before ن
    'broken': 'بروكن',
    'citizen': 'سيتازن',
    'driven': 'دريڤن',
    'eaten': 'يتن',
    'forgotten': 'فيرقوتن',
    'garden': 'قاردن',
    'given': 'قيڤن',
    'golden': 'قولدن',
    'happen': 'هاپن',
    'haven': 'هيڤن',
    'heaven': 'هيڤن',
    'hidden': 'هيدن',
    'stephen': 'ستيڤن',
    'steven': 'ستيڤن',
    'strengthen': 'سترينجثن',
    'sweden': 'سويدن',
    'taken': 'تيكن',
    'wooden': 'ودن',
}

# Words where doubled و should be fixed (wo- words where وو is wrong)
# Exclude: wood, wool, woo (where doubled might be intentional for /ʊ/)
WO_DOUBLE_FIXES = {
    'walk': 'وك', 'walked': 'وكت', 'walker': 'وكر', 'walking': 'وكينج',
    'wall': 'ول', 'walls': 'ولز',
    'wallpaper': 'ولپيپر', 'wallpapers': 'ولپيپيرز',
    'war': 'ور', 'wards': 'وردز', 'wars': 'ورز',
    'warm': 'ورم', 'warmly': 'ورملي',
    'warning': 'ورنينج',
    'warranty': 'ورانتي',
    'water': 'وتر', 'waters': 'وتيرز',
    'wanted': 'ونتيد',
    'wind': 'ويند',
    'wine': 'وين',
    'woke': 'وك',
    'woman': 'ومان',
    'word': 'ورد', 'words': 'وردز',
    'work': 'ورك', 'workday': 'وركدي', 'worked': 'وركت', 'worker': 'وركر',
    'workers': 'وركيرز', 'working': 'وركينج', 'workplace': 'وركپليس',
    'works': 'وركس', 'workshop': 'وركشوپ', 'workshops': 'وركشوپس',
    'world': 'ورلد', 'worldwide': 'ورلدوايد',
    'worries': 'وريز',
    'worse': 'ورس', 'worst': 'ورست',
    'worship': 'ورشاپ',
    'worth': 'ورث',
    'would': 'ود',
    'woods': 'ودز',
}

def fix_phon_dict(content):
    """Fix PHON_DICT entries in app.html."""
    fixes_applied = 0
    
    # Find PHON_DICT block
    start = content.find('const PHON_DICT = {')
    if start == -1:
        return content, 0
    end = content.find('};', start) + 2
    phon_block = content[start:end]
    
    # Apply specific fixes
    for word, correct in SPECIFIC_FIXES.items():
        # Match the entry pattern: 'word':'old_value'
        pattern = rf"'{re.escape(word)}':'([^']+)'"
        match = re.search(pattern, phon_block)
        if match:
            old_val = match.group(1)
            if old_val != correct:
                phon_block = phon_block.replace(f"'{word}':'{old_val}'", f"'{word}':'{correct}'", 1)
                fixes_applied += 1
    
    # Apply wo- double fixes
    for word, correct in WO_DOUBLE_FIXES.items():
        pattern = rf"'{re.escape(word)}':'([^']+)'"
        match = re.search(pattern, phon_block)
        if match:
            old_val = match.group(1)
            if old_val != correct:
                phon_block = phon_block.replace(f"'{word}':'{old_val}'", f"'{word}':'{correct}'", 1)
                fixes_applied += 1
    
    # Reassemble
    content = content[:start] + phon_block + content[end:]
    return content, fixes_applied

def fix_arabic_typos(content):
    """Fix تلقايي → تلقائي."""
    count = content.count('تلقايي')
    content = content.replace('تلقايي', 'تلقائي')
    return content, count

def main():
    total_fixes = 0
    
    # Fix app.html
    app_path = ROOT / 'app.html'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content, phon_fixes = fix_phon_dict(content)
    content, typo_fixes = fix_arabic_typos(content)
    
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'app.html: {phon_fixes} PHON_DICT fixes, {typo_fixes} Arabic typo fixes')
    total_fixes += phon_fixes + typo_fixes
    
    # Fix pel_lesson_stage.js
    stage_path = ROOT / 'lib' / 'pel_lesson_stage.js'
    with open(stage_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content, typo_fixes = fix_arabic_typos(content)
    with open(stage_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'lib/pel_lesson_stage.js: {typo_fixes} Arabic typo fixes')
    total_fixes += typo_fixes
    
    # Fix legal.html
    legal_path = ROOT / 'legal.html'
    with open(legal_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content, typo_fixes = fix_arabic_typos(content)
    with open(legal_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'legal.html: {typo_fixes} Arabic typo fixes')
    total_fixes += typo_fixes
    
    # Fix admin/admin.js
    admin_path = ROOT / 'admin' / 'admin.js'
    with open(admin_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content, typo_fixes = fix_arabic_typos(content)
    with open(admin_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'admin/admin.js: {typo_fixes} Arabic typo fixes')
    total_fixes += typo_fixes
    
    print(f'\nTotal fixes applied: {total_fixes}')

if __name__ == '__main__':
    main()
