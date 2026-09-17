#!/usr/bin/env node
'use strict';

// V56 verification — audit remediation (R1–R13). One check per finding,
// plus behavior tests for the unified session, position persistence,
// migration hook, and both lazy loaders.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const shell = fs.readFileSync(path.join(ROOT, 'js/app-shell.js'), 'utf8');
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

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ---------- R1 + R2: the two carried-over defects ----------

test('R1 — broken "Edition with Mushaf" PDF link removed everywhere', () => {
  const offenders = [];
  const scan = dir => fs.readdirSync(path.join(ROOT, dir)).forEach(f => {
    if (!f.endsWith('.js') && !f.endsWith('.html')) return;
    if (read(dir + '/' + f).includes('tevhid-kur-an-i-kerim-meali.pdf')) offenders.push(dir + '/' + f);
  });
  ['js', 'pages', 'modals'].forEach(scan);
  if (read('index.html').includes('tevhid-kur-an-i-kerim-meali.pdf')) offenders.push('index.html');
  // The Understand tab keeps only working links (the removal comment names
  // the missing PDF deliberately — js/quran-understand.js documents it).
  const filtered = offenders.filter(f => f !== 'js/quran-understand.js');
  assert.deepStrictEqual(filtered, []);
  const understand = read('js/quran-understand.js');
  assert.ok(!understand.includes('href="media/quran-reference/tevhid-kur-an-i-kerim-meali.pdf"'), 'dead link still rendered');
  assert.ok(understand.includes('tevhid-meali.pdf'), 'valid Text edition link must remain');
});

test('R2 — layout toggle renamed "Full page" → "Continuous"', () => {
  const quran = read('js/quran.js');
  assert.ok(quran.includes("quranReadToggleButton('Continuous'"), 'Continuous label missing');
  assert.ok(!quran.includes("quranReadToggleButton('Full page'"), 'old Full page label still present');
});

// ---------- R3: orphans deleted / wired ----------

test('R3 — the 8 dead orphan functions are gone from the codebase', () => {
  const gone = ['renderTodayLearning', 'updateDisciplineScore', 'commandNavigate',
    'filterGoals', 'filterTasks', 'getCalendarStudyHours',
    'getJournalDoctrineEntries', 'operatorNextAvailableHour'];
  const files = [];
  const walk = dir => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach(e => {
    if (e.isDirectory()) walk(dir + '/' + e.name);
    else if (e.name.endsWith('.js')) files.push(dir + '/' + e.name);
  });
  walk('js'); walk('pages'); walk('modals');
  const declRe = name => new RegExp('function\\s+' + name + '\\s*\\(');
  gone.forEach(name => {
    files.forEach(f => {
      assert.ok(!declRe(name).test(read(f)), name + ' still declared in ' + f);
    });
  });
});

test('R3 — openInteractionModal is wired: contact cards render a Log button', () => {
  const contacts = read('js/contacts.js');
  assert.ok(contacts.includes('contact-log-btn'), 'Log button markup missing');
  assert.ok(contacts.includes("openInteractionModal('${esc(contact.id)}')"), 'Log button must call openInteractionModal with the contact id');
  assert.ok(contacts.includes('event.stopPropagation()'), 'Log button must not also trigger the card edit action');
});

// ---------- R4: Diyanet file deleted ----------

test('R4 — dead Diyanet data file deleted and unreferenced', () => {
  assert.ok(!fs.existsSync(path.join(ROOT, 'data/quran-translations-tr.js')));
  assert.ok(!read('index.html').includes('src="data/quran-translations-tr.js"'));
  assert.ok(!read('js/quran-data-loader.js').includes('quran-translations-tr.js'));
});

// ---------- R5: V54 suite degrades gracefully ----------

test('R5 — V54 suite skips (not crashes) without the V53 baseline checkout', () => {
  const v54 = read('tools/test-quran-v54-study.js');
  assert.ok(v54.includes('fs.existsSync(baselineRoot)'), 'existence guard missing');
  assert.ok(v54.includes('SKIP'), 'skip message missing');
});

// ---------- R6 + R8: unified session, position persistence, migration ----------

function makeQuranSandbox(storedPrefs) {
  const storage = new Map();
  if (storedPrefs) storage.set('studyos_quran_read_preferences_v48', JSON.stringify(storedPrefs));
  const elements = new Map();
  const el = id => ({
    id, innerHTML: '', textContent: '', className: '', value: '', style: {}, hidden: false,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, appendChild() {}, contains() { return false; },
    scrollIntoView() { this.scrolled = true; }, closest() { return null; },
    play() { return Promise.resolve(); }, pause() {}, load() {},
    addEventListener() {}, removeEventListener() {}, removeAttribute() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 10, height: 10, bottom: 10 }; }
  });
  ['quranReadRoot', 'quranListenRoot', 'quranUnderstandRoot', 'quranSearchResults',
   'quranSearchInput', 'quranAudioStatus', 'quranAudioPlayer', 'tab-quranread']
    .forEach(id => elements.set(id, el(id)));
  const sandbox = {
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
    fetch() { return new Promise(() => {}); },
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    setTimeout(fn) { return 1; }, clearTimeout() {},
    navigator: {},
    Audio: function() { return el('audio'); },
    document: {
      getElementById(id) { return elements.get(id) || null; },
      querySelectorAll() { return []; }, querySelector() { return null; },
      addEventListener() {}, createElement() { return el('dynamic'); },
      head: { appendChild() {} }, body: { appendChild() {} }
    },
    IntersectionObserver: undefined
  };
  sandbox.window = sandbox;
  sandbox.__storage = storage;
  sandbox.__elements = elements;
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
  load('js/quran-listen.js');
  load('js/quran-understand.js');
  return sandbox;
}

// NOTE: top-level const/let in vm scripts live in the context's declarative
// environment, not on the context object — evaluate identity IN the context.
const evalIn = (sb, expr) => vm.runInContext(expr, sb);

test('R6 — quranReadState/quranAudioState/quranFollowState are the quranSession namespaces', () => {
  const sb = makeQuranSandbox();
  assert.strictEqual(evalIn(sb, 'quranReadState === quranSession.read'), true, 'read state not unified');
  assert.strictEqual(evalIn(sb, 'quranAudioState === quranSession.listen'), true, 'listen state not unified');
  assert.strictEqual(evalIn(sb, 'quranFollowState === quranSession.follow'), true, 'follow state not unified');
});

test('R8 — reading position persists (surah + ayah) and restores', () => {
  const sb = makeQuranSandbox();
  sb.quranReadJumpTo(36, 12);
  const saved = JSON.parse(sb.__storage.get('studyos_quran_read_preferences_v48'));
  assert.strictEqual(saved.surah, 36);
  assert.strictEqual(saved.ayah, 12);
  assert.strictEqual(saved._v, 3, 'payload must carry the current v3 version stamp');

  // Fresh session with that payload → position restored.
  const sb2 = makeQuranSandbox(saved);
  assert.strictEqual(evalIn(sb2, 'quranReadState.surah'), 36);
  assert.strictEqual(evalIn(sb2, 'quranReadState.ayah'), 12);
});

test('R8 — legacy V55 payload (no _v) migrates to the current schema without losing settings', () => {
  const legacy = { script: 'simple', fontScale: 1.3, contentMode: 'wbw', layoutMode: 'page', font: 'kfgqpc', wbwLang: 'en', showTajweed: true };
  const sb = makeQuranSandbox(legacy);
  assert.strictEqual(evalIn(sb, 'quranReadState.script'), 'simple');
  assert.strictEqual(evalIn(sb, 'quranReadState.contentMode'), 'wbw');
  assert.strictEqual(evalIn(sb, 'quranReadState.font'), 'kfgqpc');
  assert.strictEqual(evalIn(sb, 'quranReadState.wbwLang'), 'en');
  assert.strictEqual(evalIn(sb, 'quranReadState.showTajweed'), true);
  assert.strictEqual(evalIn(sb, 'quranReadState.surah'), 1, 'legacy payload has no position — default surah 1');
  sb.quranSavePreferences();
  const saved = JSON.parse(sb.__storage.get('studyos_quran_read_preferences_v48'));
  assert.strictEqual(saved._v, 3, 'saving must stamp the current version');
});

test('R7 — quran.js split: Listen/Understand live in their own modules and index loads them in order', () => {
  const quran = read('js/quran.js');
  assert.ok(!quran.includes('function renderQuranListen'), 'renderQuranListen must not remain in quran.js');
  assert.ok(!quran.includes('function renderQuranUnderstand'), 'renderQuranUnderstand must not remain in quran.js');
  assert.ok(read('js/quran-listen.js').includes('function renderQuranListen'));
  assert.ok(read('js/quran-understand.js').includes('function renderQuranUnderstand'));
  const index = read('index.html');
  const order = ['js/quran-session.js', 'js/quran-audio-engine.js', 'js/quran-word-data.js',
    'js/quran-follow-along.js', 'js/quran-study.js', 'js/quran.js', 'js/quran-listen.js', 'js/quran-understand.js'];
  let last = -1;
  order.forEach(src => {
    const pos = index.indexOf('src="' + src + '"');
    assert.ok(pos !== -1, src + ' missing from index.html');
    assert.ok(pos > last, src + ' out of order');
    last = pos;
  });
});

// ---------- R9: lazy Quran data ----------

test('R9 — heavy datasets are not eager; loader injects them and rebuilds the validator', () => {
  const index = read('index.html');
  assert.ok(!index.includes('src="data/quran-verses.js"'), 'quran-verses.js must not load eagerly');
  assert.ok(!index.includes('src="data/quran-translations-tevhid.js"'), 'tevhid must not load eagerly');
  assert.ok(index.includes('src="js/quran-data-loader.js"'));

  // Behavior: loader injects both files sequentially, then flushes callbacks.
  const injected = [];
  const sb = {
    console,
    window: null,
    document: {
      createElement() { return {}; },
      head: {
        appendChild(script) {
          injected.push(script.src);
          if (script.src === 'data/quran-verses.js') sb.window.QURAN_VERSES = [{ surah: 1, ayah: 1 }];
          if (script.src === 'data/quran-translations-tevhid.js') sb.window.QURAN_TRANSLATION_TEVHID = { '1:1': 'x' };
          script.onload();
        }
      }
    },
    StudyOSQuranValidator: function() { sb.__validatorRebuilt = true; this.isReady = () => true; }
  };
  sb.window = sb;
  vm.createContext(sb);
  new vm.Script(read('js/quran-data-loader.js'), { filename: 'js/quran-data-loader.js' }).runInContext(sb);
  assert.strictEqual(sb.quranDataReady(), false);
  let ok = null;
  sb.quranEnsureData(v => { ok = v; });
  assert.deepStrictEqual(injected, ['data/quran-verses.js', 'data/quran-translations-tevhid.js']);
  assert.strictEqual(ok, true);
  assert.strictEqual(sb.quranDataReady(), true);
  assert.strictEqual(sb.__validatorRebuilt, true, 'validator index must be rebuilt after data arrives');
});

test('R9 — reader, listen, understand, and daily verse all gate on the data loader', () => {
  ['js/quran.js', 'js/quran-listen.js', 'js/quran-understand.js', 'js/daily-quran.js'].forEach(f => {
    const code = read(f);
    assert.ok(code.includes('quranDataReady') && code.includes('quranEnsureData'), f + ' missing the lazy-data gate');
  });
});

// ---------- R10: lazy feature modules ----------

test('R10 — the four heavy modules are not eager and the router lazy-loads them', () => {
  const index = read('index.html');
  ['js/diagnostics.js', 'js/guide.js', 'js/framework-lab.js', 'js/pmp-tools.js'].forEach(src => {
    assert.ok(!index.includes('src="' + src + '"'), src + ' must not load eagerly');
  });
  assert.ok(index.includes('src="js/module-loader.js"'));
  const router = read('js/router.js');
  ['pmptools', 'frameworklab', 'guide', 'diagnostics'].forEach(tab => {
    assert.ok(new RegExp("case '" + tab + "':[^\\n]*studyosLazyRender").test(router), 'router case for ' + tab + ' not lazy');
  });
  const loader = read('js/module-loader.js');
  assert.ok(loader.includes("name === 'diagnostics' ? Object.keys(STUDYOS_LAZY_MODULES)"), 'diagnostics must load all lazy modules');
});

test('R10 — lazy-unsafe call sites are ensure-wrapped (pmpToolView let-shadowing hazard)', () => {
  ['js/insights.js', 'js/learn.js'].forEach(f => {
    const code = read(f);
    assert.ok(code.includes("studyosEnsureModule('pmptools'"), f + ' must ensure pmp-tools before mutating its state');
  });
  assert.ok(read('pages/system.page.js').includes("studyosLazyRender('diagnostics','runDiagnosticsSuite')"),
    'Run Core Suite button must be lazy-safe');
});

// ---------- R12 + R13 ----------

test('R12 — verify.js carries the dead-code guard', () => {
  const verify = read('tools/verify.js');
  assert.ok(verify.includes('dead-code guard'), 'guard missing');
  assert.ok(verify.includes('DEAD_CODE_ALLOWLIST'), 'allowlist missing');
});

test('R13 — Quran is in the mobile bottom nav with a 6-column grid', () => {
  const index = read('index.html');
  assert.ok(/mobile-nav[\s\S]*?data-route="quran"/.test(shell), 'Quran button missing from mobile nav');
  assert.ok(read('css/styles.css').includes('repeat(6, 1fr)'), 'mobile nav grid must have 6 columns');
});

// ---------- Regression guard: full render smoke with the final file set ----------

test('Reader + Listen + Understand render with the complete V56 module set', () => {
  const sb = makeQuranSandbox();
  sb.renderQuranRead();
  const readHtml = sb.__elements.get('quranReadRoot').innerHTML;
  assert.ok(readHtml.includes('quran-follow-bar'));
  assert.ok(readHtml.includes('Continuous'));
  assert.ok(readHtml.includes('data-qword="1"'));
  sb.renderQuranListen();
  assert.ok(sb.__elements.get('quranListenRoot').innerHTML.includes('quranListenSyncNote'));
  sb.renderQuranUnderstand();
  const understandHtml = sb.__elements.get('quranUnderstandRoot').innerHTML;
  assert.ok(understandHtml.includes('Word-level layers (V55'));
  assert.ok(!understandHtml.includes('href="media/quran-reference/tevhid-kur-an-i-kerim-meali.pdf"'));
});

console.log(`\n${passed} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}`);
