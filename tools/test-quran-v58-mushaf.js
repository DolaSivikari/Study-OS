#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
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

function makeSandbox(storedPrefs) {
  const storage = new Map();
  if (storedPrefs) storage.set('studyos_quran_read_preferences_v48', JSON.stringify(storedPrefs));
  const elements = new Map();
  const classes = new Map();
  const classListFor = id => ({
    add(name) { if (!classes.has(id)) classes.set(id, new Set()); classes.get(id).add(name); },
    remove(name) { if (classes.has(id)) classes.get(id).delete(name); },
    toggle(name, force) {
      if (!classes.has(id)) classes.set(id, new Set());
      const set = classes.get(id);
      const next = typeof force === 'boolean' ? force : !set.has(name);
      next ? set.add(name) : set.delete(name);
      return next;
    },
    contains(name) { return classes.has(id) && classes.get(id).has(name); }
  });
  const element = id => ({
    id, innerHTML: '', textContent: '', value: '', className: '', style: {}, hidden: false,
    tagName: 'DIV', checked: false, classList: classListFor(id),
    setAttribute() {}, getAttribute() { return null; }, appendChild() {}, contains() { return false; },
    scrollIntoView() {}, closest() { return null; }, addEventListener() {}, removeEventListener() {},
    replaceWith() {}, play() { return Promise.resolve(); }, pause() {}, load() {}, removeAttribute() {},
    focus() {}, getBoundingClientRect() { return { left: 0, top: 0, width: 10, height: 10, bottom: 10 }; }
  });
  ['quranReadRoot', 'quranMushafRoot', 'quranListenRoot', 'quranUnderstandRoot', 'quranSearchResults',
   'quranSearchInput', 'quranAudioStatus', 'quranAudioPlayer', 'tab-quranread', 'mushaf', 'mushafFocusToggle']
    .forEach(id => elements.set(id, element(id)));
  classes.set('mushaf', new Set());
  const body = element('body');

  const sandbox = {
    console, Set, Map, JSON, Math, Number, String, RegExp, Date, Intl, Object, Array, Promise, Error,
    Infinity, isFinite, Boolean, parseInt, parseFloat, encodeURIComponent,
    K: {
      quranReadPreferences: 'studyos_quran_read_preferences_v48',
      quranAudioPreferences: 'studyos_quran_audio_preferences_v52',
      quranStudyData: 'studyos_quran_study_v54',
      quranFollowAlong: 'studyos_quran_follow_along_v1'
    },
    get(key) { return storage.has(key) ? JSON.parse(storage.get(key)) : null; },
    set(key, value) { storage.set(key, JSON.stringify(value)); },
    esc(value) {
      return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },
    go(route) {
      if (route === 'mushaf') {
        classes.get('mushaf').add('active');
        if (typeof sandbox.renderQuranMushafReader === 'function') sandbox.renderQuranMushafReader();
      }
    },
    goTab() {}, fetch() { return new Promise(() => {}); },
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    setTimeout(fn) { if (typeof fn === 'function') fn(); return 1; }, clearTimeout() {},
    navigator: {}, Audio: function() { return element('audio'); },
    document: {
      body,
      getElementById(id) { return elements.get(id) || null; },
      querySelectorAll() { return []; }, querySelector() { return null; },
      addEventListener() {}, createElement() { return element('dynamic'); },
      head: { appendChild() {} }
    },
    IntersectionObserver: undefined
  };
  sandbox.window = sandbox;
  sandbox.__storage = storage;
  sandbox.__elements = elements;
  sandbox.__classes = classes;
  vm.createContext(sandbox);
  const load = rel => new vm.Script(read(rel), { filename: rel }).runInContext(sandbox);
  load('data/quran-verses.js');
  load('data/quran-surahs.js');
  load('data/quran-audio.js');
  load('data/quran-word-audio.js');
  load('data/quran-translations-tevhid.js');
  load('data/quran-tevhid-meali-pages.js');
  load('js/quran-session.js');
  load('js/quran-audio-engine.js');
  load('js/quran-word-data.js');
  load('js/quran-follow-along.js');
  load('js/quran-study.js');
  load('js/quran.js');
  return sandbox;
}

const evalIn = (sandbox, expression) => vm.runInContext(expression, sandbox);

test('All 604 Mushaf pages are indexed from the embedded verse data', () => {
  const sb = makeSandbox();
  assert.strictEqual(evalIn(sb, 'quranEnsurePageIndex().size'), 604);
  assert.strictEqual(evalIn(sb, 'quranVersesForPage(1).length'), 7);
  assert.ok(evalIn(sb, 'quranVersesForPage(604).length') > 0);
});

test('Dedicated Mushaf route opens Al-Baqarah on page 2', () => {
  const sb = makeSandbox();
  evalIn(sb, "quranReadState.surah = 2; quranReadState.contentMode = 'both'; quranOpenMushafReader();");
  assert.strictEqual(evalIn(sb, 'quranReadState.mushafPage'), 2);
  assert.strictEqual(evalIn(sb, 'quranReadState.layoutMode'), 'mushaf');
  assert.ok(sb.__elements.get('quranMushafRoot').innerHTML.includes('Page 2 of 604'));
});

test('Only the selected Mushaf page is rendered on the dedicated surface', () => {
  const sb = makeSandbox();
  evalIn(sb, "quranReadState.surah = 2; quranOpenMushafReader();");
  const html = sb.__elements.get('quranMushafRoot').innerHTML;
  assert.ok(html.includes('id="qv-2-1"'));
  assert.ok(html.includes('id="qv-2-5"'));
  assert.ok(!html.includes('id="qv-2-6"'), 'page 3 verse must not render on page 2');
  assert.ok(!html.includes('class="quran-verse-card"'));
});

test('A multi-surah page renders each new surah heading and Basmala', () => {
  const sb = makeSandbox();
  sb.__classes.get('mushaf').add('active');
  evalIn(sb, "quranReadState.layoutMode = 'mushaf'; quranReadState.contentMode = 'arabic'; quranReadState.mushafPage = 604; renderQuranMushafReader();");
  const html = sb.__elements.get('quranMushafRoot').innerHTML;
  assert.ok(html.includes('112. Al-Ikhlas'));
  assert.ok(html.includes('113. Al-Falaq'));
  assert.ok(html.includes('114. An-Nas'));
  assert.ok(html.includes('quran-mushaf-basmala'));
});

test('Page navigation, clamping, and verse jumps use page metadata', () => {
  const sb = makeSandbox();
  sb.__classes.get('mushaf').add('active');
  evalIn(sb, "quranReadState.layoutMode = 'mushaf'; quranReadState.mushafPage = 2; quranMushafNextPage();");
  assert.strictEqual(evalIn(sb, 'quranReadState.mushafPage'), 3);
  evalIn(sb, 'quranMushafPreviousPage();');
  assert.strictEqual(evalIn(sb, 'quranReadState.mushafPage'), 2);
  evalIn(sb, 'quranMushafGoToPage(999);');
  assert.strictEqual(evalIn(sb, 'quranReadState.mushafPage'), 604);
  evalIn(sb, 'quranMushafGoToVerse(2, 6, {highlight:false});');
  assert.strictEqual(evalIn(sb, 'quranReadState.mushafPage'), 3);
});

test('Mushaf page preferences persist while Quran Tools keeps its normal layout', () => {
  const sb = makeSandbox();
  evalIn(sb, "quranReadState.standardLayoutMode = 'page'; quranReadState.layoutMode = 'mushaf'; quranReadState.mushafPage = 49; quranReadState.mushafFitMode = 'readable'; quranReadState.mushafAutoTurn = false; quranSavePreferences();");
  const saved = JSON.parse(sb.__storage.get('studyos_quran_read_preferences_v48'));
  assert.strictEqual(saved._v, 3);
  assert.strictEqual(saved.layoutMode, 'page');
  assert.strictEqual(saved.standardLayoutMode, 'page');
  assert.strictEqual(saved.mushafPage, 49);
  const restored = makeSandbox(saved);
  assert.strictEqual(evalIn(restored, 'quranReadState.layoutMode'), 'page');
  assert.strictEqual(evalIn(restored, 'quranReadState.mushafPage'), 49);
  assert.strictEqual(evalIn(restored, 'quranReadState.mushafFitMode'), 'readable');
  assert.strictEqual(evalIn(restored, 'quranReadState.mushafAutoTurn'), false);
});

test('Follow-along audio turns dedicated Mushaf pages only when enabled', () => {
  const sb = makeSandbox();
  sb.__classes.get('mushaf').add('active');
  evalIn(sb, "quranReadState.layoutMode = 'mushaf'; quranReadState.mushafPage = 2; quranReadState.mushafAutoTurn = true; quranFollowEnsureEngine().callbacks.onVerseChange('2:6');");
  assert.strictEqual(evalIn(sb, 'quranReadState.mushafPage'), 3);
  evalIn(sb, "quranReadState.mushafPage = 2; quranReadState.mushafAutoTurn = false; quranFollowEnsureEngine().callbacks.onVerseChange('2:6');");
  assert.strictEqual(evalIn(sb, 'quranReadState.mushafPage'), 2);
});

test('Mushaf is a separate Faith destination and no longer a Quran layout toggle', () => {
  const index = read('index.html');
  const router = read('js/router.js');
  const quranPage = read('pages/quran.page.js');
  const quranSource = read('js/quran.js');
  assert.ok(index.includes('data-route="mushaf"'));
  assert.ok(index.includes('pages/mushaf.page.js'));
  assert.ok(router.includes("mushaf: { page: 'mushaf' }"));
  assert.ok(quranPage.includes("go('mushaf')"));
  assert.ok(!quranSource.includes("quranReadToggleButton('Mushaf Page'"));
  assert.ok(quranSource.includes("quranReadToggleButton('KFGQPC Medina'"));
});

test('Mobile swipe, desktop arrows, page jump, and focus mode are wired', () => {
  const js = read('js/quran.js');
  const css = read('css/mushaf-reader-page.css');
  assert.ok(js.includes("quranMushafHandleSwipe(dx < 0 ? 'next' : 'previous')"));
  assert.ok(js.includes("event.key === 'ArrowLeft'"));
  assert.ok(js.includes('quranMushafSetPageFromInput'));
  assert.ok(js.includes('quranMushafToggleFocus'));
  assert.ok(css.includes('body.mushaf-reading-focus'));
  assert.ok(css.includes('.mushaf-focus-exit'));
});

console.log(`\n${passed} dedicated Mushaf Reader checks passed${process.exitCode ? ' — WITH FAILURES' : ''}.`);
