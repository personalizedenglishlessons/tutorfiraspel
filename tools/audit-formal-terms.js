#!/usr/bin/env node
/**
 * audit-formal-terms.js
 *
 * Scans app files and lesson content for formal Arabic grammar terminology
 * that beginner Saudi students wouldn't understand.
 *
 * Run: node tools/audit-formal-terms.js
 *
 * Exit code 0 = clean, 1 = formal terms found
 */

const fs = require('fs');
const path = require('path');

// Formal terms that should NEVER appear in student-facing content
const BANNED_TERMS = [
  // The worst offenders (explicitly flagged by the user)
  'من فعل الكون',    // "from the verb of being" - completely incomprehensible to beginners
  'فعل الكون',       // "verb of being" - formal grammar term
  'خاصتي',           // formal possessive pronoun - use "حقتي" instead
  'خاصتك',           // formal possessive pronoun
  'خاصته',           // formal possessive pronoun
  'خاصتها',          // formal possessive pronoun
  'خاصتنا',          // formal possessive pronoun
  'خاصتهم',          // formal possessive pronoun

  // Other formal grammar terms
  'ضمير ملكية',      // "possessive pronoun" (formal)
  'ضماير الملكية',    // plural form
  'ضمائر الملكية',   // alternative spelling

  // Note: These are borderline - some are acceptable in lesson titles for teachers
  // but should not appear in student-facing teach panels or activity prompts.
  // We flag them as warnings, not errors.
];

const WARNING_TERMS = [
  'ضمير',            // "pronoun" - formal but sometimes needed in lesson metadata
  'ضماير',           // plural
  'فعل مساعد',       // "auxiliary verb" - use "كلمة مساعدة" instead
  'حرف جر',          // "preposition" - use "كلمة مكان/وقت" instead
  'حروف الجر',       // plural
  'حرف عطف',        // "conjunction" - use "كلمة وصل" instead
  'اداة تعريف',      // "article" (formal)
  'أداة تعريف',      // alternative spelling
  'ادوات التعريف',   // plural
  'أدوات التعريف',   // alternative
  'ظرف',             // "adverb" (formal) - but watch for false positives in common words
];

// Files to scan
const SCAN_DIRS = ['lib/', 'app.html', 'admin/', 'admin.html', 'index.html', 'login.html', 'verify.html'];
const SCAN_EXTS = ['.js', '.html', '.css', '.json'];

function scanFile(filePath) {
  const results = [];
  const ext = path.extname(filePath);
  if (!SCAN_EXTS.includes(ext)) return results;

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return results; // skip unreadable files
  }

  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;

    BANNED_TERMS.forEach(term => {
      if (line.includes(term)) {
        results.push({
          file: filePath,
          line: i + 1,
          term: term,
          severity: 'ERROR',
          text: line.trim().substring(0, 120)
        });
      }
    });

    WARNING_TERMS.forEach(term => {
      if (line.includes(term)) {
        // Skip false positives for ظرف (common word meaning "circumstance")
        if (term === 'ظرف' && (line.includes('ظروف') || line.includes('الظرف'))) return;
        results.push({
          file: filePath,
          line: i + 1,
          term: term,
          severity: 'WARNING',
          text: line.trim().substring(0, 120)
        });
      }
    });
  });

  return results;
}

function scanDir(dirPath) {
  const results = [];
  const items = fs.readdirSync(dirPath);
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (item.startsWith('.') || item === 'node_modules') return;
      results.push(...scanDir(fullPath));
    } else {
      results.push(...scanFile(fullPath));
    }
  });
  return results;
}

// Main
const root = path.resolve(__dirname, '..');
let allResults = [];

SCAN_DIRS.forEach(target => {
  const fullPath = path.join(root, target);
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      allResults.push(...scanDir(fullPath));
    } else {
      allResults.push(...scanFile(fullPath));
    }
  }
});

// Report
const errors = allResults.filter(r => r.severity === 'ERROR');
const warnings = allResults.filter(r => r.severity === 'WARNING');

if (allResults.length === 0) {
  console.log('✓ No formal Arabic grammar terms found. All clean!');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\n✗ ${errors.length} BANNED formal terms found (must fix):\n`);
  errors.forEach(r => {
    console.log(`  ${r.file}:${r.line} [${r.term}]`);
    console.log(`    ${r.text}`);
    console.log('');
  });
}

if (warnings.length > 0) {
  console.log(`\n⚠ ${warnings.length} WARNING terms found (review if student-facing):\n`);
  warnings.forEach(r => {
    console.log(`  ${r.file}:${r.line} [${r.term}]`);
    console.log(`    ${r.text}`);
    console.log('');
  });
}

process.exit(errors.length > 0 ? 1 : 0);
