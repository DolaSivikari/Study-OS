#!/usr/bin/env node
'use strict';

// V55 verification — word-level follow-along, word splitting integrity,
// tajweed parsing, and timing math. Pure-logic tests run in a vm sandbox;
// no network, no DOM beyond minimal stubs.

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

// ---------- Sandbox loading (engine + word-data are framework-free) ----------

function makeSandbox() {
  const sandbox = {
    console,
    fetch() { return Promise.reject(new Error('network disabled in tests')); },
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    navigator: {},
    Audio: function() {
      return {
        preload: '', volume: 1, muted: false, playbackRate: 1,
        currentTime: 0, duration: 0, paused: true, src: '',
        addEventListener() {}, removeEventListener() {},
        removeAttribute() {}, load() {}, pause() {},
        play() { return Promise.resolve(); }
      };
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/quran-audio-engine.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/quran-word-audio.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/quran-word-data.js'), 'utf8'), sandbox);
  return sandbox;
}

const sb = makeSandbox();
const ENGINE = sb.window.QURAN_AUDIO_ENGINE;
const WD = sb.window.QURAN_WORD_DATA;
const REGISTRY = sb.window.QURAN_WORD_AUDIO;

// ---------- Segment sanitization + binary search ----------

test('sanitizeSegments drops malformed rows and sorts (observed 1:3 shape)', () => {
  // Real shape returned by the QDC API for 1:3 (Alafasy): stray 1-element rows.
  const raw = [[1, 11615, 12855], [1], [2, 12855, 16180], [2], [1]];
  const clean = ENGINE.sanitizeSegments(raw);
  assert.strictEqual(JSON.stringify(clean), JSON.stringify([[1, 11615, 12855], [2, 12855, 16180]]));
});

test('sanitizeSegments rejects non-numeric and inverted ranges', () => {
  const clean = ENGINE.sanitizeSegments([[1, 'x', 2], [2, 500, 400], [3, 100, 200], null, 'seg']);
  assert.strictEqual(JSON.stringify(clean), JSON.stringify([[3, 100, 200]]));
});

test('findWordPosition binary search hits exact containing segment', () => {
  const segments = [[1, 0, 580], [2, 580, 1409], [3, 1409, 2502], [4, 2502, 5840]];
  assert.strictEqual(ENGINE.findWordPosition(segments, 0), 1);
  assert.strictEqual(ENGINE.findWordPosition(segments, 579), 1);
  assert.strictEqual(ENGINE.findWordPosition(segments, 580), 2);
  assert.strictEqual(ENGINE.findWordPosition(segments, 2000), 3);
  assert.strictEqual(ENGINE.findWordPosition(segments, 5839), 4);
});

test('findWordPosition lingers on last passed segment in gaps and after end', () => {
  const segments = [[1, 0, 500], [2, 700, 900]];
  assert.strictEqual(ENGINE.findWordPosition(segments, 600), 1);  // gap → previous word
  assert.strictEqual(ENGINE.findWordPosition(segments, 1500), 2); // after end → last word
  assert.strictEqual(ENGINE.findWordPosition([[2, 100, 200]], 50), null); // before first
});

test('scaleSegments maps reference timing onto target verse window', () => {
  const ref = [[1, 1000, 1500], [2, 1500, 2000]]; // verse spans 1000..2000
  const scaled = ENGINE.scaleSegments(ref, 1000, 2000, 0, 2000); // 2x longer, from 0
  assert.strictEqual(JSON.stringify(scaled), JSON.stringify([[1, 0, 1000], [2, 1000, 2000]]));
  assert.strictEqual(JSON.stringify(ENGINE.scaleSegments(ref, 1000, 1000, 0, 500)), '[]'); // degenerate ref
});

// ---------- Word splitting: byte-identity across the full dataset ----------

test('splitArabicWords re-groups every stored verse byte-identically (12,472 strings)', () => {
  const verseSandbox = { window: {} };
  vm.createContext(verseSandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/quran-verses.js'), 'utf8'), verseSandbox);
  const verses = verseSandbox.window.QURAN_VERSES;
  assert.strictEqual(verses.length, 6236);
  let checked = 0;
  for (const verse of verses) {
    for (const text of [verse.text, verse.textSimple]) {
      const tokens = WD.splitArabicWords(text);
      assert.ok(tokens && tokens.length > 0, `null split for ${verse.surah}:${verse.ayah}`);
      assert.strictEqual(tokens.join(' '), text, `re-group mismatch at ${verse.surah}:${verse.ayah}`);
      checked += 1;
    }
  }
  assert.strictEqual(checked, 12472);
});

test('splitArabicWords attaches standalone waqf marks to the previous word', () => {
  const tokens = WD.splitArabicWords('كلمة ۖ أخرى');
  assert.strictEqual(JSON.stringify(tokens), JSON.stringify(['كلمة ۖ', 'أخرى'])); // original space preserved inside token
  assert.strictEqual(tokens.join(' '), 'كلمة ۖ أخرى');
});

test('splitArabicWords refuses irregular whitespace instead of altering it', () => {
  assert.strictEqual(WD.splitArabicWords('كلمة  أخرى'), null); // double space
  assert.strictEqual(WD.splitArabicWords(' كلمة'), null);      // leading space
  assert.strictEqual(WD.splitArabicWords(''), null);
});

// ---------- Tajweed parsing (real 1:1 payload shape) ----------

const TAJWEED_1_1 = 'بِسْمِ <tajweed class=ham_wasl>ٱ</tajweed>للَّهِ <tajweed class=ham_wasl>ٱ</tajweed><tajweed class=laam_shamsiyah>ل</tajweed>رَّحْمَ<tajweed class=madda_normal>ـٰ</tajweed>نِ <tajweed class=ham_wasl>ٱ</tajweed><tajweed class=laam_shamsiyah>ل</tajweed>رَّح<tajweed class=madda_permissible>ِي</tajweed>مِ <span class=end>١</span>';

test('tajweed parser strips the end-numeral span and yields aligned word count', () => {
  const words = WD.tajweedWordsToHtml(TAJWEED_1_1);
  assert.strictEqual(words.length, 4); // matches stored 1:1 tokenization
  assert.ok(words[0].indexOf('بِسْمِ') !== -1);
  assert.ok(words.join(' ').indexOf('span class=end') === -1);
});

test('tajweed plain text equals the stored verse letters for 1:1', () => {
  const plain = WD.tajweedPlainText(TAJWEED_1_1);
  assert.strictEqual(plain, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ');
});

test('tajweed markup output only contains whitelisted span classes', () => {
  const html = WD.tajweedToHtml(TAJWEED_1_1);
  const classes = [...html.matchAll(/class="([^"]+)"/g)].map(m => m[1]);
  assert.ok(classes.length >= 5);
  classes.forEach(cls => assert.ok(/^tajweed-[a-z_]+$/.test(cls), `unexpected class ${cls}`));
  assert.ok(html.indexOf('<tajweed') === -1);
});

test('tajweed parser escapes hostile text instead of injecting it', () => {
  const html = WD.tajweedToHtml('<tajweed class=ghunnah><img src=x onerror=alert(1)></tajweed> كلمة');
  assert.ok(html.indexOf('<img') === -1);
  assert.ok(html.indexOf('&lt;img') !== -1);
});

test('tajweed rules spanning a word boundary are reopened per word', () => {
  const words = WD.tajweedWordsToHtml('<tajweed class=ghunnah>اب جد</tajweed>');
  assert.strictEqual(words.length, 2);
  assert.ok(words[0].indexOf('tajweed-ghunnah') !== -1);
  assert.ok(words[1].indexOf('tajweed-ghunnah') !== -1);
  // Balanced spans in each word
  words.forEach(w => {
    const opens = (w.match(/<span/g) || []).length;
    const closes = (w.match(/<\/span>/g) || []).length;
    assert.strictEqual(opens, closes, `unbalanced spans in ${w}`);
  });
});

// ---------- Engine chapter-mode behavior (stubbed audio) ----------

test('engine loadChapterAudio sanitizes timings and playByKey targets the verse', () => {
  const events = [];
  const engine = new ENGINE.QuranAudioEngine({
    onPlaybackStateChange(s) { events.push(['state', s]); },
    onTimeUpdate() {},
    onWordPositionChange(p) { events.push(['word', p]); },
    onVerseChange(k) { events.push(['verse', k]); },
    onVerseEnd() {},
    onError(e) { events.push(['error', e.message]); }
  });
  engine.loadChapterAudio({
    audioUrl: 'https://example.test/1.mp3',
    verseTimings: [
      { verseKey: '1:1', from: 0, to: 6090, segments: [[1, 0, 580], [1], [2, 580, 1409]] },
      { verseKey: '1:2', from: 6090, to: 11680, segments: [] }
    ]
  });
  assert.strictEqual(engine.totalVerses, 2);
  assert.strictEqual(JSON.stringify(engine._chapterTimings[0].segments), JSON.stringify([[1, 0, 580], [2, 580, 1409]]));
  engine.playByKey('1:2'); // index + verse callback fire synchronously before the play() await
  assert.strictEqual(engine.currentVerseKey, '1:2');
  assert.ok(events.some(e => e[0] === 'verse' && e[1] === '1:2'));
  engine.destroy();
});

test('engine syncChapter advances verse and dedupes word callbacks', () => {
  const words = [];
  const verses = [];
  const engine = new ENGINE.QuranAudioEngine({
    onPlaybackStateChange() {}, onTimeUpdate() {},
    onWordPositionChange(p) { words.push(p); },
    onVerseChange(k) { verses.push(k); },
    onVerseEnd() {}, onError() {}
  });
  engine.loadChapterAudio({
    audioUrl: 'x.mp3',
    verseTimings: [
      { verseKey: '1:1', from: 0, to: 1000, segments: [[1, 0, 500], [2, 500, 1000]] },
      { verseKey: '1:2', from: 1000, to: 2000, segments: [[1, 1000, 2000]] }
    ]
  });
  engine.currentIndex = 0;
  engine.audio.currentTime = 0.1; engine.syncChapter(); engine.syncChapter();
  engine.audio.currentTime = 0.6; engine.syncChapter();
  engine.audio.currentTime = 1.2; engine.syncChapter(); // crosses into 1:2
  engine.syncChapter(); // word 1 of 1:2
  assert.strictEqual(JSON.stringify(verses), JSON.stringify(['1:2']));
  // Leading null comes from stop() inside loadChapterAudio (engine contract).
  assert.strictEqual(JSON.stringify(words), JSON.stringify([null, 1, 2, null, 1]));
  engine.destroy();
});

// ---------- Registry sanity ----------

test('word-audio registry lists timed reciters and safe edition mappings', () => {
  assert.ok(REGISTRY.TIMED_RECITERS.length >= 15);
  const slugs = new Set();
  REGISTRY.TIMED_RECITERS.forEach(r => {
    assert.ok(r.slug && r.name && Number.isInteger(r.qdcId), JSON.stringify(r));
    assert.ok(!slugs.has(r.slug), 'duplicate slug ' + r.slug);
    slugs.add(r.slug);
  });
  assert.strictEqual(REGISTRY.FALLBACK_RECITER_ID, 7);
  Object.keys(REGISTRY.EDITION_TO_QDC).forEach(id => {
    assert.ok(/^ar\./.test(id), 'Listen mapping must only cover Arabic editions: ' + id);
  });
});

// ---------- Follow-along preferences shape (quran-follow-along.js) ----------

test('follow-along module loads standalone, defaults sane, prefs round-trip', () => {
  const storage = new Map();
  const fa = {
    console,
    document: {
      getElementById() { return null; },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      addEventListener() {}, createElement() { return { style: {}, classList: { add() {}, remove() {} } }; },
      body: { appendChild() {} }
    },
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    K: { quranFollowAlong: 'studyos_quran_follow_along_v1' },
    get(key) { return storage.has(key) ? JSON.parse(storage.get(key)) : null; },
    set(key, value) { storage.set(key, JSON.stringify(value)); },
    esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  };
  fa.window = fa;
  vm.createContext(fa);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/quran-word-audio.js'), 'utf8'), fa);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/quran-follow-along.js'), 'utf8'), fa);

  assert.strictEqual(fa.quranFollowState.reciter, 'mishary-rashid-alafasy');
  assert.strictEqual(fa.quranFollowState.speed, 1);
  assert.strictEqual(fa.quranFollowState.repeat, 'none');
  assert.strictEqual(fa.quranFollowState.listenSync, true);

  fa.quranFollowAlongSetSpeed(1.25);
  fa.quranFollowAlongSetRepeat('verse');
  const saved = JSON.parse(storage.get('studyos_quran_follow_along_v1'));
  assert.strictEqual(saved.speed, 1.25);
  assert.strictEqual(saved.repeat, 'verse');
  assert.strictEqual(saved.reciter, 'mishary-rashid-alafasy');

  // Invalid values are rejected
  fa.quranFollowAlongSetSpeed(3);
  fa.quranFollowAlongSetRepeat('forever');
  assert.strictEqual(fa.quranFollowState.speed, 1.25);
  assert.strictEqual(fa.quranFollowState.repeat, 'verse');

  // Listen-tab QDC mapping tiers
  assert.strictEqual(fa.quranListenSyncQdcId('ar.alafasy', 'ar'), 7);
  assert.strictEqual(fa.quranListenSyncQdcId('ar.husary', 'ar'), 6);
  assert.strictEqual(fa.quranListenSyncQdcId('ar.hudhaify', 'ar'), 7); // unmapped Arabic → Alafasy shape
  assert.strictEqual(fa.quranListenSyncQdcId('en.walk', 'en'), null);  // non-Arabic → no sync
});

// ---------- Combined runtime smoke: all V55 modules + reader render ----------

test('reader renders with all V55 modules loaded (follow bar, word spans, wbw mode, listen sync)', () => {
  const storage = new Map();
  const elements = new Map();
  function el(id) {
    const node = {
      id, innerHTML: '', textContent: '', className: '', value: '', style: {},
      hidden: false,
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute() {}, getAttribute() { return null; },
      appendChild() {}, contains() { return false; },
      scrollIntoView() {}, closest() { return null; },
      play() { return Promise.resolve(); }, pause() {}, load() {},
      addEventListener() {}, removeEventListener() {}, removeAttribute() {},
      getBoundingClientRect() { return { left: 0, top: 0, width: 10, height: 10, bottom: 10 }; }
    };
    return node;
  }
  ['quranReadRoot', 'quranListenRoot', 'quranUnderstandRoot', 'quranSearchResults',
   'quranSearchInput', 'quranAudioStatus', 'quranAudioPlayer', 'tab-quranread']
    .forEach(id => elements.set(id, el(id)));

  const smoke = {
    console, Set, Map, JSON, Math, Number, String, RegExp, Date, Intl, Object, Array, Promise, Error, Infinity, isFinite, Boolean, parseInt, parseFloat, encodeURIComponent,
    K: {
      quranReadPreferences: 'studyos_quran_read_preferences_v48',
      quranAudioPreferences: 'studyos_quran_audio_preferences_v52',
      quranStudyData: 'studyos_quran_study_v54',
      quranFollowAlong: 'studyos_quran_follow_along_v1'
    },
    get(key) { return storage.has(key) ? JSON.parse(storage.get(key)) : null; },
    set(key, value) { storage.set(key, JSON.stringify(value)); },
    esc(v) {
      return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },
    goTab() {},
    fetch() { return new Promise(() => {}); }, // pending forever — loading states render
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    setTimeout(fn) { return 1; }, clearTimeout() {},
    navigator: {},
    Audio: function() { return el('audio'); },
    document: {
      getElementById(id) { return elements.get(id) || null; },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      addEventListener() {},
      createElement() { return el('dynamic'); },
      body: { appendChild() {} }
    },
    IntersectionObserver: undefined
  };
  smoke.window = smoke;
  vm.createContext(smoke);
  const load = rel => new vm.Script(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel }).runInContext(smoke);

  load('data/quran-verses.js');
  load('data/quran-surahs.js');
  load('data/quran-audio.js');
  load('data/quran-word-audio.js');
  load('data/quran-translations-tevhid.js');
  load('data/quran-tevhid-meali-pages.js');
  load('js/quran-audio-engine.js');
  load('js/quran-word-data.js');
  load('js/quran-follow-along.js');
  load('js/quran-session.js'); // V56: unified state container
  load('js/quran-study.js');
  load('js/quran.js');
  load('js/quran-listen.js');       // V56 (audit R7)
  load('js/quran-understand.js');   // V56 (audit R7)

  // Read tab — default modes
  smoke.renderQuranRead();
  const readHtml = elements.get('quranReadRoot').innerHTML;
  assert.ok(readHtml.includes('quran-follow-bar'), 'follow-along bar missing');
  assert.ok(readHtml.includes('data-qword="1"'), 'word spans missing');
  assert.ok(readHtml.includes('data-qverse="1:1"'), 'verse span container missing');
  assert.ok(readHtml.includes('Word by word'), 'wbw mode button missing');
  assert.ok(readHtml.includes('quran-font-scheherazade'), 'font class missing');
  assert.ok(readHtml.includes('quranFollowAlongPlayFrom(1,1)'), 'per-passage Follow button missing');

  // Word-by-word mode with pending fetch → loading state, meal still shown
  smoke.quranReadSetContentMode('wbw');
  const wbwHtml = elements.get('quranReadRoot').innerHTML;
  assert.ok(wbwHtml.includes('Loading word-by-word data'), 'wbw loading state missing');
  assert.ok(wbwHtml.includes('quran-translation-panel'), 'meal panel missing in wbw mode');
  assert.ok(wbwHtml.includes('Word-by-word text, transliteration'), 'wbw source label missing');

  // Tajweed toggle renders and labels the layer
  smoke.quranReadSetContentMode('both');
  smoke.quranReadToggleTajweed(true);
  const tajweedHtml = elements.get('quranReadRoot').innerHTML;
  assert.ok(tajweedHtml.includes('Tajweed letters'), 'tajweed source label missing');
  // Stored letters still shown while the tajweed layer is loading
  assert.ok(tajweedHtml.includes('data-qword="1"'), 'word spans should remain during tajweed load');

  // Listen tab — word spans + sync note + toggle present
  smoke.renderQuranListen();
  const listenHtml = elements.get('quranListenRoot').innerHTML;
  assert.ok(listenHtml.includes('quranListenSyncNote'), 'listen sync note missing');
  assert.ok(listenHtml.includes('Word highlight'), 'listen sync toggle missing');
  assert.ok(listenHtml.includes('data-qverse='), 'listen word spans missing');

  // Understand tab — V55 provenance card
  smoke.renderQuranUnderstand();
  const understandHtml = elements.get('quranUnderstandRoot').innerHTML;
  assert.ok(understandHtml.includes('Word-level layers (V55'), 'V55 provenance card missing');
  assert.ok(understandHtml.includes('does not relabel transliteration as Turkish'), 'V52 labelling guarantee missing');
});

console.log(`\n${passed} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}`);
