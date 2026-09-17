#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
  } catch (error) {
    console.error(`FAIL — ${name}`);
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  }
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const root = { innerHTML: '' };
const elements = new Map([
  ['quranReadRoot', root],
  ['quranSearchResults', { innerHTML: '' }],
  ['quranSearchInput', { value: '' }],
  ['quranListenRoot', { innerHTML: '' }],
  ['quranUnderstandRoot', { innerHTML: '' }]
]);
const storage = new Map();
const K = { quranReadPreferences: 'studyos_quran_read_preferences_v48' };
const sandbox = {
  window: null,
  K,
  get(key) { return storage.has(key) ? JSON.parse(storage.get(key)) : null; },
  set(key, value) { storage.set(key, JSON.stringify(value)); },
  esc,
  console,
  Set,
  Map,
  Object,
  Array,
  JSON,
  Math,
  Number,
  String,
  RegExp,
  Date,
  Intl,
  document: { getElementById(id) { return elements.get(id) || null; } },
  setTimeout(fn) { fn(); return 1; },
  clearTimeout() {}
};
sandbox.window = sandbox;
vm.createContext(sandbox);

function run(relativePath) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
  new vm.Script(source, { filename: relativePath }).runInContext(sandbox);
}

run('data/quran-verses.js');
run('data/quran-surahs.js');
run('data/quran-translations-tevhid.js');
run('data/quran-tevhid-meali-pages.js');
run('js/quran.js');

function evaluate(code) {
  return vm.runInContext(code, sandbox);
}

function renderWith(contentMode, layoutMode, surah = 1) {
  evaluate(`quranReadState.contentMode = ${JSON.stringify(contentMode)}; quranReadState.layoutMode = ${JSON.stringify(layoutMode)}; quranReadState.surah = ${surah}; renderQuranRead();`);
  return root.innerHTML;
}

test('Reader toolbar exposes all three content modes', () => {
  const html = renderWith('both', 'verse');
  assert.ok(html.includes('Verses only'));
  assert.ok(html.includes('Meaning only'));
  assert.ok(html.includes('Both'));
});

test('Reader toolbar exposes continuous and verse-by-verse layouts', () => {
  const html = renderWith('both', 'verse');
  // V56: label renamed "Full page" → "Continuous" (audit R2) — the mode
  // renders a continuous surah, not a real 604-page mushaf layout.
  assert.ok(html.includes('Continuous'));
  assert.ok(html.includes('Verse by verse'));
});

test('Verses-only mode renders stored Arabic and omits Tevhid meaning panels', () => {
  const html = renderWith('arabic', 'verse');
  assert.ok(html.includes(esc(sandbox.QURAN_VERSES[0].text)));
  assert.ok(html.includes('quran-arabic-panel'));
  assert.ok(!html.includes('quran-translation-panel'));
  assert.ok(!html.includes(esc(sandbox.QURAN_TRANSLATION_TEVHID['1:1'])));
});

test('Meaning-only mode renders exact Tevhid wording and omits Arabic panels', () => {
  const html = renderWith('meaning', 'verse');
  assert.ok(html.includes(esc(sandbox.QURAN_TRANSLATION_TEVHID['1:1'])));
  assert.ok(html.includes('quran-translation-panel'));
  assert.ok(!html.includes('quran-arabic-panel'));
  assert.ok(!html.includes(esc(sandbox.QURAN_VERSES[0].text)));
});

test('Both mode renders Arabic and exact Tevhid wording together', () => {
  const html = renderWith('both', 'verse');
  assert.ok(html.includes(esc(sandbox.QURAN_VERSES[0].text)));
  assert.ok(html.includes(esc(sandbox.QURAN_TRANSLATION_TEVHID['1:1'])));
  assert.ok(html.includes('quran-arabic-panel'));
  assert.ok(html.includes('quran-translation-panel'));
});

test('Full-page mode uses one continuous page surface instead of verse cards', () => {
  const html = renderWith('both', 'page');
  assert.ok(html.includes('quran-full-page'));
  assert.ok(html.includes('quran-page-passage'));
  assert.ok(!html.includes('class="quran-verse-card"'));
});

test('Verse-by-verse mode uses separate verse cards instead of the full-page surface', () => {
  const html = renderWith('both', 'verse');
  assert.ok(html.includes('class="quran-verse-card"'));
  assert.ok(!html.includes('quran-full-page quran-full-page-'));
});

test('Combined Tevhid source ranges remain one unsplit meaning block in full-page mode', () => {
  const html = renderWith('both', 'page', 20);
  const exact = esc(sandbox.QURAN_TRANSLATION_TEVHID['20:27']);
  assert.ok(html.includes('20:27-28'));
  assert.strictEqual(html.split(exact).length - 1, 1);
  assert.ok(html.includes(esc(sandbox.QURAN_VERSES.find(v => v.surah === 20 && v.ayah === 27).text)));
  assert.ok(html.includes(esc(sandbox.QURAN_VERSES.find(v => v.surah === 20 && v.ayah === 28).text)));
});

test('Content and layout selections persist in Quran reader preferences', () => {
  evaluate("quranReadState.surah = 1; quranReadSetContentMode('meaning'); quranReadSetLayoutMode('page');");
  const saved = JSON.parse(storage.get(K.quranReadPreferences));
  assert.strictEqual(saved.contentMode, 'meaning');
  assert.strictEqual(saved.layoutMode, 'page');
  assert.strictEqual(saved.script, 'uthmani');
  assert.strictEqual(saved.fontScale, 1);
});

test('Invalid content and layout modes are rejected without changing state', () => {
  const before = evaluate('JSON.stringify({ contentMode: quranReadState.contentMode, layoutMode: quranReadState.layoutMode })');
  evaluate("quranReadSetContentMode('invented'); quranReadSetLayoutMode('invented');");
  const after = evaluate('JSON.stringify({ contentMode: quranReadState.contentMode, layoutMode: quranReadState.layoutMode })');
  assert.strictEqual(after, before);
});

if (process.exitCode) {
  console.error(`\n${passed} tests passed before failure.`);
  process.exit(process.exitCode);
}

console.log(`\nAll ${passed} Quran V51 reading-mode tests passed.`);
