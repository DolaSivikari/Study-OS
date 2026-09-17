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

function element(id) {
  return {
    id,
    innerHTML: '',
    textContent: '',
    className: '',
    value: '',
    currentTime: 9,
    playCount: 0,
    loadCount: 0,
    disabled: false,
    attributes: {},
    play() { this.playCount += 1; return Promise.resolve(); },
    load() { this.loadCount += 1; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    removeAttribute(name) { delete this.attributes[name]; },
    scrollIntoView() { this.scrolled = true; },
    querySelector() { return null; },
    classList: { contains() { return false; }, add() {}, remove() {} },
    closest() { return null; }
  };
}

const elements = new Map();
['quranReadRoot', 'quranSearchResults', 'quranSearchInput', 'quranListenRoot', 'quranUnderstandRoot', 'quranAudioStatus']
  .forEach(id => elements.set(id, element(id)));
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
  document: {
    getElementById(id) { return elements.get(id) || null; },
    querySelectorAll() { return []; }
  },
  setTimeout(fn) { fn(); return 1; },
  clearTimeout() {},
  goTab(page, tab) { sandbox.lastTab = { page, tab }; if (tab === 'quranlisten') sandbox.renderQuranListen(); },
  lastTab: null
};
sandbox.window = sandbox;
vm.createContext(sandbox);

function run(relativePath) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
  new vm.Script(source, { filename: relativePath }).runInContext(sandbox);
}

run('data/quran-verses.js');
run('data/quran-surahs.js');
run('data/quran-audio.js');
run('data/quran-translations-tevhid.js');
run('data/quran-tevhid-meali-pages.js');
run('js/quran.js');
// V56 (audit R7): Listen/Understand split out of quran.js.
run('js/quran-listen.js');
run('js/quran-understand.js');

function evaluate(code) {
  return vm.runInContext(code, sandbox);
}

const validation = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran-audio.validation.json'), 'utf8'));

test('Audio metadata contains 24 complete editions', () => {
  assert.strictEqual(sandbox.QURAN_AUDIO_EDITIONS.length, 24);
  assert.strictEqual(sandbox.QURAN_AUDIO_EDITIONS.filter(item => item.language === 'ar').length, 19);
  assert.strictEqual(sandbox.QURAN_AUDIO_EDITIONS.filter(item => item.language !== 'ar').length, 5);
  assert.ok(sandbox.QURAN_AUDIO_EDITIONS.every(item => item.ayahCount === 6236));
});

test('Audio validation confirms complete coverage and exact URL patterns', () => {
  assert.strictEqual(validation.checks.editionCount, 24);
  assert.strictEqual(validation.checks.allEditionsHave6236Rows, true);
  assert.strictEqual(validation.checks.allEditionsCoverGlobalAyahIds1Through6236, true);
  assert.strictEqual(validation.checks.allUrlsMatchDatabaseTemplate, true);
  assert.strictEqual(validation.source.audioReferenceCount, 149664);
  assert.strictEqual(validation.source.containsAudioBytes, false);
});

test('Global ayah numbering aligns with Quran verse order', () => {
  assert.strictEqual(evaluate('quranAudioGlobalNumber(1,1)'), 1);
  assert.strictEqual(evaluate('quranAudioGlobalNumber(1,7)'), 7);
  assert.strictEqual(evaluate('quranAudioGlobalNumber(2,1)'), 8);
  assert.strictEqual(evaluate('quranAudioGlobalNumber(114,6)'), 6236);
});

test('Audio URL uses the validated database path over HTTPS', () => {
  assert.strictEqual(
    evaluate("quranAudioUrl('ar.alafasy', 1)"),
    'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
  );
  assert.strictEqual(
    evaluate("quranAudioUrl('ar.husarymujawwad', 6236)"),
    'https://cdn.islamic.network/quran/audio/128/ar.husarymujawwad/6236.mp3'
  );
});

test('Listen tab renders the selected verse, exact Tevhid meaning, and audio source', () => {
  sandbox.renderQuranListen();
  const html = elements.get('quranListenRoot').innerHTML;
  assert.ok(html.includes('Reciter / audio edition'));
  assert.ok(html.includes('Arabic recitations'));
  assert.ok(html.includes('Other-language audio'));
  assert.ok(html.includes('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'));
  assert.ok(html.includes(esc(sandbox.QURAN_VERSES[0].text)));
  assert.ok(html.includes(esc(sandbox.QURAN_TRANSLATION_TEVHID['1:1'])));
  assert.ok(html.includes('149664 validated verse-level references'));
});

test('Read layouts expose play controls without altering verse text', () => {
  sandbox.renderQuranRead();
  const html = elements.get('quranReadRoot').innerHTML;
  assert.ok(html.includes('quran-inline-audio-btn'));
  assert.ok(html.includes('quranListenOpen(1,1)'));
  assert.ok(html.includes(esc(sandbox.QURAN_VERSES[0].text)));
  assert.ok(html.includes(esc(sandbox.QURAN_TRANSLATION_TEVHID['1:1'])));
});

test('Reciter selection persists and invalid identifiers are rejected', () => {
  evaluate("quranAudioSetReciter('ar.husary')");
  let saved = JSON.parse(storage.get(K.quranAudioPreferences));
  assert.strictEqual(saved.reciter, 'ar.husary');
  evaluate("quranAudioSetReciter('invented.reciter')");
  saved = JSON.parse(storage.get(K.quranAudioPreferences));
  assert.strictEqual(saved.reciter, 'ar.husary');
  assert.strictEqual(evaluate('quranAudioState.reciter'), 'ar.husary');
});

test('Combined Tevhid ranges remain clearly labelled in Listen mode', () => {
  evaluate('quranAudioState.surah = 20; quranAudioState.ayah = 28; renderQuranListen();');
  const html = elements.get('quranListenRoot').innerHTML;
  assert.ok(html.includes('Tevhid Meali · 20:27-28'));
  assert.ok(html.includes(esc(sandbox.QURAN_TRANSLATION_TEVHID['20:27'])));
});

test('Auto-advance moves to the next verse and repeat keeps the same verse', () => {
  evaluate('quranAudioState.surah = 1; quranAudioState.ayah = 1; quranAudioState.autoAdvance = true; quranAudioState.repeat = false; quranAudioEnded();');
  assert.strictEqual(evaluate('quranAudioState.ayah'), 2);

  const player = element('quranAudioPlayer');
  elements.set('quranAudioPlayer', player);
  evaluate('quranAudioState.repeat = true; quranAudioState.ayah = 2; quranAudioEnded();');
  assert.strictEqual(evaluate('quranAudioState.ayah'), 2);
  assert.strictEqual(player.currentTime, 0);
  assert.strictEqual(player.playCount, 1);
});

test('Auto-advance reuses the same audio element and swaps it to the next ayah', () => {
  const player = element('quranAudioPlayer');
  const title = element('quranAudioNowTitle');
  const meta = element('quranAudioNowMeta');
  const arabic = element('quranAudioCurrentArabic');
  const meaning = element('quranAudioCurrentTranslation');
  const ayahSelect = element('quranAudioAyahSelect');
  const previous = element('quranAudioPreviousButton');
  const next = element('quranAudioNextButton');
  elements.set('quranAudioPlayer', player);
  elements.set('quranAudioNowTitle', title);
  elements.set('quranAudioNowMeta', meta);
  elements.set('quranAudioCurrentArabic', arabic);
  elements.set('quranAudioCurrentTranslation', meaning);
  elements.set('quranAudioAyahSelect', ayahSelect);
  elements.set('quranAudioPreviousButton', previous);
  elements.set('quranAudioNextButton', next);

  evaluate('quranAudioState.reciter = "ar.alafasy"; quranAudioState.surah = 1; quranAudioState.ayah = 1; quranAudioState.autoAdvance = true; quranAudioState.repeat = false; quranAudioEnded();');

  assert.strictEqual(elements.get('quranAudioPlayer'), player, 'player identity changed');
  assert.strictEqual(evaluate('quranAudioState.ayah'), 2);
  assert.strictEqual(player.loadCount, 1);
  assert.strictEqual(player.playCount, 1);
  assert.ok(player.innerHTML.includes('/ar.alafasy/2.mp3'));
  assert.strictEqual(title.textContent, '1. Al-Fatiha · 2');
  assert.strictEqual(ayahSelect.value, '2');
  assert.strictEqual(arabic.attributes['data-qverse'], '1:2');
  assert.strictEqual(previous.disabled, false);
});

test('Inline play opens Listen on the requested ayah', () => {
  evaluate('quranListenOpen(112,3)');
  assert.deepStrictEqual(sandbox.lastTab, { page: 'quran', tab: 'quranlisten' });
  assert.strictEqual(evaluate('quranAudioState.surah'), 112);
  assert.strictEqual(evaluate('quranAudioState.ayah'), 3);
});

test('Index loads audio metadata before the Quran feature module', () => {
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const dataPos = index.indexOf('data/quran-audio.js');
  const modulePos = index.indexOf('js/quran.js');
  assert.ok(dataPos !== -1);
  assert.ok(modulePos !== -1);
  assert.ok(dataPos < modulePos);
});

test('Understand tab states that the source contains URLs rather than MP3 bytes', () => {
  sandbox.renderQuranUnderstand();
  const html = elements.get('quranUnderstandRoot').innerHTML;
  assert.ok(html.includes('149,664 validated verse-level audio URL references'));
  assert.ok(html.includes('does not contain MP3 bytes'));
  assert.ok(html.includes('quran-audio.validation.json'));
});

if (process.exitCode) {
  console.error(`\n${passed} tests passed before failure.`);
  process.exit(process.exitCode);
}

console.log(`\nAll ${passed} Quran V52 audio tests passed.`);
