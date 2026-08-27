// Extracts PEL's own transliteration engine from app.html and exposes translitEn().
// No AI — runs the app's exact JS rules. Used to populate DB translit gaps server-side.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/app/app.html', 'utf8');

function sliceBalanced(s, startMarker, openCh, closeCh) {
  const start = s.indexOf(startMarker);
  if (start < 0) throw new Error('marker not found: ' + startMarker);
  const ob = s.indexOf(openCh, start);
  let depth = 0, inStr = false, esc = false;
  for (let i = ob; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === inStr) inStr = false;
    } else {
      if (c === "'" || c === '"' || c === '`') inStr = c;
      else if (c === openCh) depth++;
      else if (c === closeCh) { depth--; if (depth === 0) return s.slice(start, i + 1); }
    }
  }
  throw new Error('unbalanced braces for ' + startMarker);
}

const phonDictBlock = sliceBalanced(src, 'const PHON_DICT = {', '{', '}');

// Engine block: from `const LETTER_NAMES = {` through the end of translitEn().
const lm = src.indexOf('const LETTER_NAMES = {');
const teFn = src.indexOf('function translitEn(text){', lm);
// find end of translitEn: the closing } of the function. Locate the matching brace
// starting at the function body's opening brace.
const fnBodyOpen = src.indexOf('{', teFn);
let depth = 0, inStr = false, esc = false, fnEnd = -1;
for (let i = fnBodyOpen; i < src.length; i++) {
  const c = src[i];
  if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === inStr) inStr = false; }
  else {
    if (c === "'" || c === '"' || c === '`') inStr = c;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { fnEnd = i; break; } }
  }
}
const engineBlock = src.slice(lm, fnEnd + 1);

// Eval the two blocks to get translitEn.
const code = phonDictBlock + '\n' + engineBlock + '\n' +
  'globalThis.translitEn = translitEn; globalThis.translitWord = translitWord;';
eval(code);

// CLI: reads JSON array [{id,text}] from stdin (or --file), prints [{id,tr}]
function run() {
  let input;
  const argFile = process.argv[2];
  if (argFile === '--file' && process.argv[3]) {
    input = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  } else {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  }
  const out = input.map(r => {
    let tr = translitEn(r.text || '');
    // match existing DB Arabic style: ASCII ? -> Arabic ؟
    tr = tr.replace(/\?/g, '؟');
    return { id: r.id, tr };
  });
  process.stdout.write(JSON.stringify(out));
}
run();
