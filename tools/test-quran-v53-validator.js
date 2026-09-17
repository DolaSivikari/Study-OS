#!/usr/bin/env node
'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(ROOT, '..', '..', 'studyos-v52-quran-audio', 'studyos');
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

function element(id) {
  return {
    id,
    innerHTML: '',
    textContent: '',
    className: '',
    value: '',
    play() { return Promise.resolve(); },
    scrollIntoView() { this.scrolled = true; },
    classList: { contains() { return false; }, add() {}, remove() {} },
    closest() { return null; }
  };
}

const elements = new Map();
[
  'quranReadRoot', 'quranSearchResults', 'quranSearchInput', 'quranListenRoot',
  'quranUnderstandRoot', 'quranAudioStatus', 'quranValidatorInput',
  'quranValidatorReference', 'quranValidatorResult'
].forEach(id => elements.set(id, element(id)));

const storage = new Map();
const K = {
  quranReadPreferences: 'studyos_quran_read_preferences_v48',
  quranAudioPreferences: 'studyos_quran_audio_preferences_v52'
};
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
  encodeURIComponent,
  document: { getElementById(id) { return elements.get(id) || null; } },
  setTimeout(fn) { fn(); return 1; },
  clearTimeout() {},
  goTab(page, tab) { sandbox.lastTab = { page, tab }; },
  lastTab: null
};
sandbox.window = sandbox;
vm.createContext(sandbox);

function run(relativePath) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
  new vm.Script(source, { filename: relativePath }).runInContext(sandbox);
}

function evaluate(code) {
  return vm.runInContext(code, sandbox);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

run('data/quran-verses.js');
run('data/quran-surahs.js');
run('js/quran-validator.js');
run('data/quran-audio.js');
run('data/quran-translations-tevhid.js');
run('data/quran-tevhid-meali-pages.js');
run('js/quran.js');
// V56 (audit R7): Listen/Understand split out of quran.js.
run('js/quran-listen.js');
run('js/quran-understand.js');

const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran-validator.validation.json'), 'utf8'));

test('Uploaded quran-validator data matches all 6,236 StudyOS verses exactly', () => {
  assert.strictEqual(report.checks.verseCountMatches, true);
  assert.strictEqual(report.checks.referenceOrderMatches, true);
  assert.strictEqual(report.checks.uthmaniExactMatches, 6236);
  assert.strictEqual(report.checks.simpleExactMatches, 6236);
  assert.strictEqual(report.checks.mismatchCount, 0);
  assert.strictEqual(report.source.referenceDataSha256, 'ddd89dcb757453fe93811cb2a745ef8ba7a0ce97cd7125fcf5ee8932cddfb653');
});

test('Browser validator builds a complete 6,236-verse reference index', () => {
  assert.strictEqual(sandbox.QURAN_VALIDATOR.isReady(), true);
  assert.strictEqual(sandbox.QURAN_VALIDATOR.verses.length, 6236);
  assert.strictEqual(sandbox.QURAN_VALIDATOR.getVerse(114, 6).text, sandbox.QURAN_VERSES[6235].text);
});

test('Exact stored Uthmani text returns an exact match', () => {
  const result = sandbox.QURAN_VALIDATOR.validate(sandbox.QURAN_VERSES[0].text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.matchType, 'exact');
  assert.strictEqual(result.reference, '1:1');
  assert.strictEqual(result.canonicalText, sandbox.QURAN_VERSES[0].text);
});

test('Common Arabic spelling is accepted only as a normalized full-verse match', () => {
  const result = sandbox.QURAN_VALIDATOR.validate('قل هو الله أحد');
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.matchType, 'normalized');
  assert.strictEqual(result.reference, '112:1');
});

test('Partial and fabricated Arabic are rejected', () => {
  const partial = sandbox.QURAN_VALIDATOR.validate('بسم الله');
  const fabricated = sandbox.QURAN_VALIDATOR.validate('مرحبا كيف حالك اليوم');
  assert.strictEqual(partial.isValid, false);
  assert.strictEqual(partial.matchType, 'none');
  assert.strictEqual(fabricated.isValid, false);
});

test('Specific-reference validation supports exact verse ranges', () => {
  const range = sandbox.QURAN_VALIDATOR.getVerseRange(112, 1, 4);
  const result = sandbox.QURAN_VALIDATOR.validateAgainst(range.text, '112:1-4');
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.matchType, 'exact');
  assert.strictEqual(result.reference, '112:1-4');
  assert.strictEqual(result.matchedVerses.length, 4);
});

test('Reference mismatch reports the canonical source without replacing input', () => {
  const result = sandbox.QURAN_VALIDATOR.validateAgainst('بسم الله', '1:1');
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.reference, '1:1');
  assert.strictEqual(result.canonicalText, sandbox.QURAN_VERSES[0].text);
  assert.ok(result.mismatchIndex >= 0);
});

test('Validator UI preserves pasted text after successful validation', () => {
  const input = elements.get('quranValidatorInput');
  const reference = elements.get('quranValidatorReference');
  const result = elements.get('quranValidatorResult');
  input.value = 'قل هو الله أحد';
  reference.value = '';
  sandbox.quranValidatorRun();
  assert.strictEqual(input.value, 'قل هو الله أحد');
  assert.ok(result.innerHTML.includes('Valid after normalization'));
  assert.ok(result.innerHTML.includes('112:1'));
  assert.ok(result.innerHTML.includes(esc(sandbox.QURAN_VALIDATOR.getVerse(112, 1).text)));
});

test('Validator UI never auto-corrects an invalid pasted quote', () => {
  const input = elements.get('quranValidatorInput');
  const reference = elements.get('quranValidatorReference');
  const result = elements.get('quranValidatorResult');
  input.value = 'بسم الله الكريم الرحيم';
  reference.value = '1:1';
  sandbox.quranValidatorRun();
  assert.strictEqual(input.value, 'بسم الله الكريم الرحيم');
  assert.ok(result.innerHTML.includes('Text does not match 1:1'));
  assert.ok(result.innerHTML.includes('No automatic correction or replacement was applied'));
});

test('Understand tab exposes strict non-mutating validation and source reports', () => {
  sandbox.renderQuranUnderstand();
  const html = elements.get('quranUnderstandRoot').innerHTML;
  assert.ok(html.includes('Quran quote validator'));
  assert.ok(html.includes('6,236 of 6,236 ayahs matched exactly'));
  assert.ok(html.includes('auto-correction behavior is intentionally not enabled'));
  assert.ok(html.includes('quran-validator.validation.json'));
  assert.ok(html.includes('THIRD-PARTY-NOTICES.md'));
});

test('Validator reference data pipeline is intact under V56 lazy loading', () => {
  // V56 (audit R9): data/quran-verses.js no longer loads eagerly, so the
  // original "verses before validator" tag-order check no longer applies.
  // The invariant it protected — the validator index is built FROM the
  // reference data before any validation runs — is preserved differently:
  // the data loader rebuilds window.QURAN_VALIDATOR after injecting the
  // datasets, and every Understand-tab entry gates on quranEnsureData().
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const loader = fs.readFileSync(path.join(ROOT, 'js/quran-data-loader.js'), 'utf8');
  const understand = fs.readFileSync(path.join(ROOT, 'js/quran-understand.js'), 'utf8');
  const surahsPos = index.indexOf('data/quran-surahs.js');
  const loaderPos = index.indexOf('js/quran-data-loader.js');
  const validatorPos = index.indexOf('js/quran-validator.js');
  const quranPos = index.indexOf('js/quran.js');
  assert.ok(surahsPos !== -1 && loaderPos !== -1 && validatorPos !== -1 && quranPos !== -1);
  assert.ok(surahsPos < validatorPos, 'surah metadata (still eager) must precede the validator');
  assert.ok(validatorPos < quranPos, 'validator must precede the reader module');
  assert.ok(loader.includes('data/quran-verses.js'), 'loader must own the verses dataset');
  assert.ok(loader.includes('new window.StudyOSQuranValidator()'), 'loader must rebuild the validator index after data arrives');
  assert.ok(understand.includes('quranEnsureData'), 'Understand tab must gate on the data loader');
});

test('Runtime policy contains no automatic correction path', () => {
  const source = fs.readFileSync(path.join(ROOT, 'js/quran-validator.js'), 'utf8');
  assert.strictEqual(report.runtimePolicy.autoCorrectEnabled, false);
  assert.strictEqual(report.runtimePolicy.sourceMutationAllowed, false);
  assert.ok(!source.includes('correctedText'));
  assert.ok(!source.includes('autoCorrect: true'));
  assert.ok(!source.includes('window.QURAN_VERSES ='));
});

test('Protected Arabic and Tevhid source files remain byte-identical to V52', () => {
  if (!fs.existsSync(BASELINE)) return;
  const protectedFiles = [
    'data/quran-verses.js',
    'data/quran-translations-tevhid.js',
    'data/quran-translations-tevhid.validation.json',
    'data/quran-tevhid-meali-pages.js'
  ];
  protectedFiles.forEach(file => {
    assert.strictEqual(sha256(path.join(ROOT, file)), sha256(path.join(BASELINE, file)), file);
  });
});

if (process.exitCode) {
  console.error(`\n${passed} tests passed before failure.`);
  process.exit(process.exitCode);
}

console.log(`\nAll ${passed} Quran V53 validator tests passed.`);
