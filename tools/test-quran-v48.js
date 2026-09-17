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

function htmlEscape(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createClassList(initial = []) {
  const values = new Set(initial);
  const history = [];
  return {
    history,
    add(...items) { items.forEach(item => { values.add(item); history.push(['add', item]); }); },
    remove(...items) { items.forEach(item => { values.delete(item); history.push(['remove', item]); }); },
    contains(item) { return values.has(item); },
    toString() { return [...values].join(' '); }
  };
}

function createElement(id, classes = []) {
  const element = {
    id,
    innerHTML: '',
    value: '',
    scrolled: false,
    classList: createClassList(classes),
    scrollIntoView(options) { this.scrolled = true; this.scrollOptions = options; },
    closest(selector) { return selector === '.quran-verse-card' ? this : null; }
  };
  return element;
}

const elements = new Map();
['quranReadRoot', 'quranSearchResults', 'quranSearchInput', 'quranListenRoot', 'quranUnderstandRoot']
  .forEach(id => elements.set(id, createElement(id)));

const storage = new Map();
const K = { quranReadPreferences: 'studyos_quran_read_preferences_v48' };
const get = key => storage.has(key) ? JSON.parse(storage.get(key)) : null;
const set = (key, value) => storage.set(key, JSON.stringify(value));
const sandbox = {
  K,
  get,
  set,
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
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); }
  },
  document: {
    getElementById(id) { return elements.get(id) || null; }
  },
  setTimeout(fn) { fn(); return 1; },
  clearTimeout() {},
  esc: htmlEscape
};
sandbox.window = sandbox;
vm.createContext(sandbox);

function runFile(relativePath) {
  const filename = path.join(ROOT, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  new vm.Script(source, { filename: relativePath }).runInContext(sandbox);
}

runFile('data/quran-verses.js');
runFile('data/quran-surahs.js');
runFile('data/quran-translations-tevhid.js');
runFile('data/quran-tevhid-meali-pages.js');
runFile('js/quran.js');
// V56 (audit R7): the Listen and Understand tabs were split out of quran.js.
runFile('js/quran-listen.js');
runFile('js/quran-understand.js');

const verses = sandbox.QURAN_VERSES;
const surahs = sandbox.QURAN_SURAHS;
const translations = sandbox.QURAN_TRANSLATION_TEVHID;
const pages = sandbox.QURAN_TRANSLATION_TEVHID_PAGES;
const ranges = sandbox.QURAN_TRANSLATION_TEVHID_COMBINED_RANGES;
const validation = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran-translations-tevhid.validation.json'), 'utf8'));

const verseKeys = verses.map(v => `${v.surah}:${v.ayah}`).sort();
const translationKeys = Object.keys(translations).sort();

function evalInContext(expression) {
  return vm.runInContext(expression, sandbox);
}

test('Arabic dataset contains exactly 6,236 ayahs', () => {
  assert.strictEqual(verses.length, 6236);
});

test('Surah metadata contains exactly 114 surahs', () => {
  assert.strictEqual(surahs.length, 114);
});

test('Tevhid Meali contains exactly 6,236 ayah keys', () => {
  assert.strictEqual(translationKeys.length, 6236);
});

test('Tevhid key set exactly matches Arabic ayah key set', () => {
  assert.strictEqual(JSON.stringify(translationKeys), JSON.stringify(verseKeys));
});

test('Every Tevhid entry is non-empty and free of extraction replacement markers', () => {
  for (const [key, value] of Object.entries(translations)) {
    assert.ok(value.trim(), `${key} is empty`);
    assert.ok(!value.includes('\u00ad'), `${key} contains U+00AD`);
    assert.ok(!value.includes('�'), `${key} contains replacement character`);
  }
});

test('Every ayah has a valid source page between 66 and 607', () => {
  assert.strictEqual(JSON.stringify(Object.keys(pages).sort()), JSON.stringify(verseKeys));
  for (const [key, page] of Object.entries(pages)) {
    assert.ok(Number.isInteger(page), `${key} page is not an integer`);
    assert.ok(page >= 66 && page <= 607, `${key} page ${page} is outside source range`);
  }
});

test('Validation report is complete and error-free', () => {
  assert.strictEqual(validation.verseCount, 6236);
  assert.strictEqual(validation.surahCount, 114);
  assert.strictEqual(validation.combinedRangeCount, 2);
  assert.deepStrictEqual(validation.errors, []);
});

test('Only the two documented combined source ranges are registered', () => {
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ranges)), [
    { surah: 20, start: 27, end: 28, page: 334 },
    { surah: 37, start: 22, end: 23, page: 452, sourceNumbering: 'unnumbered between 21 and 24' }
  ]);
});

test('Combined range source strings are preserved without inferred splits', () => {
  assert.strictEqual(translations['20:27'], translations['20:28']);
  assert.strictEqual(translations['37:22'], translations['37:23']);
});

test('Tevhid Meali is the runtime meal (lazy-loaded) and Diyanet is not loaded', () => {
  // V56 (audit R9): the heavy Tevhid dataset now lazy-loads through
  // js/quran-data-loader.js instead of an eager <script> tag; the intent of
  // this check is unchanged — Tevhid is the app's meal, Diyanet is not
  // loaded (and as of V56 the archived Diyanet file is deleted entirely).
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const loader = fs.readFileSync(path.join(ROOT, 'js/quran-data-loader.js'), 'utf8');
  assert.match(index, /<script defer src="js\/quran-data-loader\.js"><\/script>/);
  assert.match(loader, /data\/quran-translations-tevhid\.js/);
  assert.doesNotMatch(index, /quran-translations-tr\.js/);
  assert.doesNotMatch(loader, /quran-translations-tr\.js/);
  assert.ok(!fs.existsSync(path.join(ROOT, 'data/quran-translations-tr.js')), 'Diyanet file should be deleted (V56 audit R4)');
});

test('Surah 1 renders exact Arabic and exact Tevhid source wording', () => {
  evalInContext('quranReadState.surah = 1; renderQuranRead();');
  const html = elements.get('quranReadRoot').innerHTML;
  assert.ok(html.includes(htmlEscape(verses[0].text)));
  assert.ok(html.includes(htmlEscape(validation.samples['1:1'])));
  assert.ok(html.includes('Tevhid Meali'));
  assert.ok(html.includes('Source · p. 66'));
});

test('Surah 20 renders the 20:27-28 source passage once as one combined block', () => {
  evalInContext('quranReadState.surah = 20; renderQuranRead();');
  const html = elements.get('quranReadRoot').innerHTML;
  const exact = htmlEscape(translations['20:27']);
  assert.ok(html.includes('20:27-28'));
  assert.ok(html.includes('Combined in source'));
  assert.strictEqual(html.split(exact).length - 1, 1);
  assert.ok(html.includes(htmlEscape(verses.find(v => v.surah === 20 && v.ayah === 27).text)));
  assert.ok(html.includes(htmlEscape(verses.find(v => v.surah === 20 && v.ayah === 28).text)));
});

test('Turkish search normalization makes RAHIM match Rahîm', () => {
  elements.get('quranSearchResults').innerHTML = '';
  sandbox.quranReadSearch('RAHIM');
  const html = elements.get('quranSearchResults').innerHTML;
  assert.ok(html.includes('quran-search-result'));
  assert.ok(html.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').includes('rahim'));
});

test('Arabic search finds Arabic source text', () => {
  elements.get('quranSearchResults').innerHTML = '';
  sandbox.quranReadSearch('الله');
  assert.ok(elements.get('quranSearchResults').innerHTML.includes('quran-search-result'));
});

test('Font scale clamps at 70% and 200%', () => {
  assert.strictEqual(evalInContext('quranReadState.fontScale = 0.7; quranReadAdjustFontSize(-0.1); quranReadState.fontScale;'), 0.7);
  assert.strictEqual(evalInContext('quranReadState.fontScale = 2.0; quranReadAdjustFontSize(0.1); quranReadState.fontScale;'), 2.0);
  assert.strictEqual(evalInContext('quranReadResetFontSize(); quranReadState.fontScale;'), 1);
});

test('Verse jump scrolls to and highlights the requested verse card', () => {
  const target = createElement('qv-112-1', ['quran-verse-card']);
  elements.set(target.id, target);
  sandbox.quranReadJumpTo(112, 1);
  assert.strictEqual(target.scrolled, true);
  assert.strictEqual(target.scrollOptions.behavior, 'smooth');
  assert.strictEqual(target.scrollOptions.block, 'center');
  assert.ok(target.classList.history.some(([action, value]) => action === 'add' && value === 'is-highlighted'));
});

test('Understand tab reports integrity and does not claim generated Turkish word meanings', () => {
  sandbox.renderQuranUnderstand();
  const html = elements.get('quranUnderstandRoot').innerHTML;
  assert.ok(html.includes('does not generate, paraphrase, correct, modernize, or interpret'));
  assert.ok(html.includes('does not relabel transliteration as Turkish'));
  assert.ok(html.includes(sandbox.QURAN_TRANSLATION_TEVHID_SOURCE.sha256));
});

if (process.exitCode) {
  console.error(`\n${passed} tests passed before failure.`);
  process.exit(process.exitCode);
}

console.log(`\nAll ${passed} Quran V48 tests passed.`);
