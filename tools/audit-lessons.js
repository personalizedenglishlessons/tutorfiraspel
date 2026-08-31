/* tools/audit-lessons.js
   Static content audit for app.html. Scans the lesson / exercise data for the
   systemic quality bugs that make the app "feel poor" — placeholder/leak
   strings, duplicate answer options, out-of-range correct indices, empty
   content fields, and genericLesson fallbacks. Prints a report and writes it
   to tools/audit-report.txt.

   Run:  node tools/audit-lessons.js
   No DOM, no network — pure static parse of the inline data.
*/
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'app.html');
const src = fs.readFileSync(APP, 'utf8');
const lines = src.split('\n');

const findings = [];
function add(cat, line, msg){ findings.push({ cat, line, msg }); }

/* ---------- 1. leak / placeholder tokens in content strings ----------
   We only flag content that would actually render as garbage to a learner.
   HTML markup (`<span class=...>`), `typeof X === 'undefined'` guards, code
   comments and the literal word "placeholder" in a UI attribute are all
   legitimate, so they are excluded to keep the report high-signal. */
function isCodeOrMarkup(l){
  const s = l.trim();
  return s.startsWith('//') || s.startsWith('*')
    || /<\s*span\b/.test(s)          // HTML span in markup
    || /typeof\s+\w+\s*===?\s*['"]undefined['"]/.test(s)
    || /===\s*['"]undefined['"]/.test(s)
    || /\bplaceholder=['"]/.test(s)   // input placeholder attr
    || /data-lucide=/.test(s);          // icon markup
}
const leakTokens = [
  /Do you know don/,        // the original placeholder leak
  /\[object\s+Object\]/,
  /\bNaN\b/,                  // NaN in text
  /\bTODO\b/, /\bFIXME\b/, /\bXXX\b/,
  /lorem\s+ipsum/i,
  /q:\s*(['"`])\s*\1/,       // truly empty q:'' (same quote back-to-back)
  /en:\s*(['"`])\s*\1/,      // truly empty en:''
  /options:\s*\[\s*\]/,       // empty options
];
leakTokens.forEach(re => {
  lines.forEach((l, i) => {
    if (re.test(l) && !isCodeOrMarkup(l)) add('leak', i + 1, l.trim().slice(0, 140));
  });
});

/* ---------- 2. exercise options: duplicates + correct index range ---------- */
// Match "options:[ ... ]" possibly across lines, with a trailing correct:N
// on the same or nearby line. We do a simple bracket scan per match start.
function parseArray(src, startIdx){
  // startIdx points at '['
  let depth = 0, i = startIdx, inStr = null, esc = false;
  for (; i < src.length; i++){
    const c = src[i];
    if (inStr){ if (esc) esc = false; else if (c === '\\') esc = true; else if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`'){ inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']'){ depth--; if (depth === 0) break; }
  }
  const arrText = src.slice(startIdx, i + 1);
  // crude item split on commas not inside quotes
  const items = [];
  let cur = '', s = null, e = false;
  for (const ch of arrText.slice(1, -1)){
    if (s){ cur += ch; if (e) e = false; else if (ch === '\\') e = true; else if (ch === s) s = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`'){ s = ch; cur += ch; continue; }
    if (ch === ','){ items.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) items.push(cur.trim());
  // strip wrappers
  const clean = items.map(x => x.replace(/^['"`]/, '').replace(/['"`]$/, '').trim()).filter(Boolean);
  return clean;
}

const optRe = /options\s*:\s*\[/g;
let m;
while ((m = optRe.exec(src)) !== null){
  const arrStart = m.index + m[0].length - 1; // at '['
  const opts = parseArray(src, arrStart);
  if (opts.length === 0) continue;
  const lineNo = src.slice(0, m.index).split('\n').length;
  // duplicates (case-insensitive) — but only when the options are not a
  // deliberate stress/capitalization teaching pair (e.g. 'REcord' vs 'reCORD').
  const lower = opts.map(o => o.toLowerCase());
  const seen = {};
  lower.forEach((o, idx) => {
    if (seen[o] !== undefined){
      // skip if the two differ only by letter case (intentional stress teaching)
      if (opts[idx] !== opts[seen[o]]) return;
      add('dup-option', lineNo, `duplicate option "${opts[idx]}" (also at #${seen[o]+1}) in [${opts.join(' | ')}]`);
    } else { seen[o] = idx; }
  });
  // find the matching correct:N for this options block (within next 400 chars)
  const after = src.slice(m.index, m.index + 600);
  const cMatch = after.match(/correct\s*:\s*(\d+)/);
  if (cMatch){
    const ci = parseInt(cMatch[1], 10);
    if (ci < 0 || ci >= opts.length){
      add('correct-range', lineNo, `correct:${ci} out of range for ${opts.length} options [${opts.join(' | ')}]`);
    }
  }
}

/* ---------- 3. genericLesson fallback references ---------- */
lines.forEach((l, i) => {
  if (/genericLesson\b/.test(l) && !/function genericLesson|genericLesson\s*=/.test(l)){
    add('generic-fallback', i + 1, l.trim().slice(0, 120));
  }
});

/* ---------- report ---------- */
const byCat = {};
findings.forEach(f => { (byCat[f.cat] = byCat[f.cat] || []).push(f); });
let out = `PEL lesson content audit — ${new Date().toISOString()}\n`;
out += `Source: app.html (${lines.length} lines)\n`;
out += `Total findings: ${findings.length}\n\n`;
for (const cat of Object.keys(byCat)){
  out += `## ${cat} (${byCat[cat].length})\n`;
  byCat[cat].slice(0, 40).forEach(f => { out += `  L${f.line}: ${f.msg}\n`; });
  if (byCat[cat].length > 40) out += `  ... +${byCat[cat].length - 40} more\n`;
  out += '\n';
}
fs.writeFileSync(path.join(__dirname, 'audit-report.txt'), out);
console.log(out);
