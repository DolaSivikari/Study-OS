#!/usr/bin/env node
'use strict';
// V62.6 — design-token consolidation.
//
// styles.css and design-system.css each declared a full palette with
// DIFFERENT values for the same names. design-system.css loaded second and
// silently won all 46 collisions, so any rule written against styles.css's
// intent rendered in a colour its author never chose. That is what made
// spacing and colour drift between pages.
//
// This suite enforces the invariant that replaced it: exactly one file
// declares tokens, and it declares the values that were already winning.

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let passed = 0;
function check(name, ok, detail = '') {
  if (!ok) { console.error(`FAIL — ${name}${detail ? ` (${detail})` : ''}`); process.exitCode = 1; return; }
  passed++; console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
}

const cssDir = path.join(root, 'css');
const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
const read = f => fs.readFileSync(path.join(cssDir, f), 'utf8');

// Enclosing @media for a position, or '' at top level.
function enclosingMedia(src, pos) {
  const before = src.slice(0, pos);
  let depth = 0, last = null;
  const re = /@media([^{]*)\{|\{|\}/g;
  let m;
  while ((m = re.exec(before)) !== null) {
    if (m[0].startsWith('@media')) { depth++; last = m[1].trim(); }
    else if (m[0] === '{') depth++;
    else { depth--; if (depth === 0) last = null; }
  }
  return last || '';
}

function rootDeclarations(f) {
  const src = read(f);
  const out = [];
  const re = /:root\b[^{]*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const end = src.indexOf('}', m.index);
    const body = src.slice(m.index + m[0].length, end);
    const media = enclosingMedia(src, m.index);
    for (const t of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      out.push({ media, name: t[1], value: t[2].trim() });
    }
  }
  return out;
}

// ---- one owner ----------------------------------------------------------
check('css/tokens.css exists', files.includes('tokens.css'));

const offenders = files.filter(f => f !== 'tokens.css' && rootDeclarations(f).length > 0);
check('No stylesheet other than tokens.css declares a token',
  offenders.length === 0,
  offenders.join(', '));

// ---- loaded first -------------------------------------------------------
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sheets = [...html.matchAll(/<link[^>]*href="css\/([\w.-]+)"/g)].map(m => m[1]);
check('tokens.css is the first stylesheet loaded',
  sheets[0] === 'tokens.css', sheets.join(' → '));
check('Every stylesheet in css/ is actually linked',
  files.every(f => sheets.includes(f)),
  files.filter(f => !sheets.includes(f)).join(', ') || 'all linked');

// ---- no duplicate declarations within tokens.css ------------------------
const tokens = rootDeclarations('tokens.css');
const seen = new Map();
const dupes = [];
for (const t of tokens) {
  const key = t.media + '|' + t.name;
  if (seen.has(key)) dupes.push(key);
  seen.set(key, t.value);
}
check('No token is declared twice in the same context', dupes.length === 0, dupes.slice(0, 6).join(', '));

// ---- light/dark parity --------------------------------------------------
const base = tokens.filter(t => t.media === '');
const dark = tokens.filter(t => /prefers-color-scheme:\s*dark/.test(t.media));
check('A base palette and a dark palette both exist',
  base.length > 40 && dark.length > 20, `${base.length} base / ${dark.length} dark`);

const baseNames = new Set(base.map(t => t.name));
const orphanDark = dark.filter(t => !baseNames.has(t.name)).map(t => t.name);
check('Every dark token overrides a token that exists in the base palette',
  orphanDark.length === 0, orphanDark.join(', '));

// ---- colour tokens must not be raw duplicates of each other -------------
const colourish = base.filter(t => /^#|rgba?\(/.test(t.value));
check('Base palette defines real colour values', colourish.length >= 15, `${colourish.length} colours`);

// ---- the drift that caused this ----------------------------------------
// --accent had two different values across two files. Assert it now has one.
const accentEverywhere = files.flatMap(f => rootDeclarations(f).filter(t => t.name === '--accent'));
const accentBase = accentEverywhere.filter(t => t.media === '');
check('--accent is declared exactly once in the base palette',
  accentBase.length === 1, `${accentBase.length} declarations`);

// ---- feature stylesheets consume, not define ----------------------------
for (const f of ['styles.css', 'design-system.css', 'mobile.css', 'unification-v60.css']) {
  if (!files.includes(f)) continue;
  check(`${f} consumes tokens without redefining them`,
    rootDeclarations(f).length === 0 && /var\(--/.test(read(f)));
}

if (!process.exitCode) console.log(`\n${passed} V62.6 design-token checks passed.`);
