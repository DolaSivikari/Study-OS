#!/usr/bin/env node
'use strict';

const assert = require('assert');
const crypto = require('crypto');
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

const elements = new Map([
  ['dailyQuranVerseRoot', { innerHTML: '' }]
]);
const storage = new Map();
const navigation = [];
const jumps = [];
let randomValue = 0;

const sandbox = {
  console,
  Set,
  Map,
  Object,
  Array,
  JSON,
  Math,
  Number,
  String,
  Boolean,
  Date,
  Uint32Array,
  esc: htmlEscape,
  K: { dailyQuranLastReference: 'studyos_daily_quran_last_reference_v49' },
  get(key) { return storage.has(key) ? JSON.parse(storage.get(key)) : null; },
  set(key, value) { storage.set(key, JSON.stringify(value)); },
  document: {
    getElementById(id) { return elements.get(id) || null; }
  },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); }
  },
  crypto: {
    getRandomValues(values) {
      values[0] = randomValue >>> 0;
      return values;
    }
  },
  go(route) { navigation.push(route); },
  quranReadJumpTo(surah, ayah) { jumps.push([surah, ayah]); },
  setTimeout(fn) { fn(); return 1; }
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
runFile('js/daily-quran.js');

const verses = sandbox.QURAN_VERSES;
const translations = sandbox.QURAN_TRANSLATION_TEVHID;

function sha256(relativePath) {
  return crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(ROOT, relativePath)))
    .digest('hex');
}

test('Dashboard contains the Daily Quran Verse card and controls', () => {
  const page = fs.readFileSync(path.join(ROOT, 'pages/dashboard.page.js'), 'utf8');
  assert.match(page, /id="dailyQuranVerseRoot"/);
  assert.match(page, /onclick="dailyQuranNewVerse\(\)"/);
  assert.match(page, /onclick="dailyQuranOpenInReader\(\)"/);
});

test('Index loads the isolated V49 module', () => {
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(index, /<script defer src="js\/daily-quran\.js"><\/script>/);
});

test('Selection pool contains every standalone passage exactly once', () => {
  const pool = sandbox.DAILY_QURAN.buildPool();
  assert.strictEqual(pool.length, 6234);
  assert.strictEqual(new Set(pool.map(item => item.reference)).size, 6234);
});

test('The two source-combined passages remain single selectable records', () => {
  const pool = sandbox.DAILY_QURAN.buildPool();
  const taha = pool.find(item => item.reference === '20:27-28');
  const saffat = pool.find(item => item.reference === '37:22-23');
  assert.ok(taha);
  assert.ok(saffat);
  assert.strictEqual(JSON.stringify(taha.verses.map(v => v.ayah)), JSON.stringify([27, 28]));
  assert.strictEqual(JSON.stringify(saffat.verses.map(v => v.ayah)), JSON.stringify([22, 23]));
  assert.strictEqual(taha.translation, translations['20:27']);
  assert.strictEqual(saffat.translation, translations['37:22']);
});

test('First dashboard render displays exact stored Arabic and Tevhid wording', () => {
  randomValue = 0;
  sandbox.renderDailyQuranVerse();
  const selection = sandbox.DAILY_QURAN.getSelection();
  const html = elements.get('dailyQuranVerseRoot').innerHTML;
  selection.verses.forEach(verse => assert.ok(html.includes(htmlEscape(verse.text))));
  assert.ok(html.includes(htmlEscape(selection.translation)));
  assert.ok(html.includes('Tevhid Meali · Türkçe'));
});

test('Repeated dashboard render keeps the same passage during the open session', () => {
  const first = sandbox.DAILY_QURAN.getSelection().reference;
  randomValue = 1739;
  sandbox.renderDailyQuranVerse();
  assert.strictEqual(sandbox.DAILY_QURAN.getSelection().reference, first);
});

test('New Verse intentionally selects a different reference', () => {
  const before = sandbox.DAILY_QURAN.getSelection().reference;
  randomValue = 1;
  sandbox.dailyQuranNewVerse();
  const after = sandbox.DAILY_QURAN.getSelection().reference;
  assert.notStrictEqual(after, before);
});

test('Open in Quran routes to Read and jumps to the canonical first ayah', () => {
  navigation.length = 0;
  jumps.length = 0;
  const selection = sandbox.DAILY_QURAN.getSelection();
  sandbox.dailyQuranOpenInReader();
  assert.deepStrictEqual(navigation, ['quranread']);
  assert.deepStrictEqual(jumps, [[selection.surahNumber, selection.ayahStart]]);
});

test('Dashboard refresh invokes the daily Quran renderer without forcing a re-pick', () => {
  const dashboard = fs.readFileSync(path.join(ROOT, 'js/dashboard.js'), 'utf8');
  assert.match(dashboard, /if \(typeof renderDailyQuranVerse === 'function'\) renderDailyQuranVerse\(\);/);
  assert.doesNotMatch(dashboard, /renderDailyQuranVerse\(true\)/);
});

test('Sacred source datasets and the supplied source PDF remain byte-identical', () => {
  assert.strictEqual(sha256('data/quran-verses.js'), '15b8be2ad58a61f721e617663c0da069773e738dba35b5258c192a41db0f7baa');
  assert.strictEqual(sha256('data/quran-translations-tevhid.js'), '88102f1b4f40fbcbad16c846a53adafc865dee8014a5690e012fc6c5d6463097');
  assert.strictEqual(sha256('data/quran-surahs.js'), '6abc58cdd0fb05e5a0753362dc8a35fcdd0533c5442a01abb4a6af33178aeddb');
  assert.strictEqual(sha256('media/quran-reference/tevhid-meali.pdf'), 'b079c3d7aba62ae433528d962a9822d65be30183ca12ddb5c0ee96d4d7e456df');
});

if (process.exitCode) {
  console.error(`\n${passed} tests passed before failure.`);
  process.exit(process.exitCode);
}

console.log(`\nAll ${passed} Daily Quran V49 tests passed.`);
