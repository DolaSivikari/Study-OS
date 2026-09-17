#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
let passed = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function pass(name) {
  passed++;
  console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
}
function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function esc(value) {
  return String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const storage = new Map();
const elements = new Map();
const document = {
  getElementById(id) { return elements.get(id) || null; },
  querySelectorAll() { return []; },
  createElement() { return { innerHTML: '', firstElementChild: null }; }
};
const K = {
  quranStudyData: 'studyos_quran_study_v54',
  quranReadPreferences: 'studyos_quran_read_preferences_v48',
  quranAudioPreferences: 'studyos_quran_audio_preferences_v52'
};
const windowObj = {
  QURAN_VERSES: [
    { surah: 1, ayah: 1 }, { surah: 1, ayah: 2 }, { surah: 1, ayah: 3 },
    { surah: 2, ayah: 1 }
  ]
};
const context = {
  console,
  Date,
  Set,
  Map,
  Object,
  Array,
  Number,
  String,
  Math,
  RegExp,
  JSON,
  clearTimeout,
  setTimeout,
  document,
  window: windowObj,
  K,
  esc,
  get: key => storage.has(key) ? JSON.parse(storage.get(key)) : null,
  set: (key, value) => storage.set(key, JSON.stringify(value))
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/quran-study.js'), 'utf8'), context, { filename: 'quran-study.js' });

assert(windowObj.quranStudyState.version === 1, 'default state version should be 1');
assert(windowObj.quranStudyState.trackingEnabled === false, 'tracking should default off');
pass('Study state starts in browsing mode with an empty local record');

context.quranStudyToggleBookmark('1:1', '1:1', 1, 1);
assert(windowObj.quranStudyState.bookmarks['1:1'], 'bookmark should be created');
context.quranStudyToggleBookmark('1:1', '1:1', 1, 1);
assert(!windowObj.quranStudyState.bookmarks['1:1'], 'bookmark should be removed on second toggle');
pass('Bookmarks toggle cleanly with one record per passage');

for (const [id, value] of Object.entries({
  quranReflectionKey: '1:2',
  quranReflectionLabel: '1:2',
  quranReflectionSurah: '1',
  quranReflectionAyah: '2',
  quranReflectionText: 'My personal note',
})) elements.set(id, { value, hidden: false });
elements.set('quranReflectionDialog', { hidden: false });
context.quranStudySaveReflection();
assert(windowObj.quranStudyState.reflections['1:2'].note === 'My personal note', 'reflection should save exact user note');
assert(windowObj.quranStudyState.reflections['1:2'].surah === 1, 'reflection should retain canonical navigation');
pass('Personal reflections save separately with canonical passage navigation');

context.quranStudyMarkPassageRead('1:1,1:2');
context.quranStudyMarkPassageRead('1:1,1:2');
const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
assert(windowObj.quranStudyState.readingLog[today].refs.length === 2, 'same-day reading refs should deduplicate');
assert(windowObj.quranStudyStats('today').versesRead === 2, 'today stats should count unique refs');
pass('Reading logs deduplicate verses and calculate unique daily progress');

const streak = windowObj.quranStudyCalculateStreaks(today);
assert(streak.current === 1 && streak.longest === 1, 'single active day should produce one-day streak');
pass('Streak calculation treats an active single reading day correctly');

context.quranStudyToggleTracking();
assert(windowObj.quranStudyState.trackingEnabled === true, 'tracking toggle should enable reading mode');
assert(JSON.parse(storage.get(K.quranStudyData)).trackingEnabled === true, 'tracking preference should persist');
pass('Browsing and reading-tracking modes persist locally');

context.quranStudyToggleSurahComplete(1);
assert(windowObj.quranStudyState.completedSurahs['1'], 'surah completion should be stored');
const completedDay = windowObj.quranStudyState.readingLog[today].refs;
assert(['1:1','1:2','1:3'].every(ref => completedDay.includes(ref)), 'completion should log supplied surah verses');
pass('Marking a surah complete records completion and its verses');

const passage = {
  canonicalKey: '1:1', label: '1:1',
  groupedVerses: [{ surah: 1, ayah: 1 }]
};
const actions = context.quranStudyRenderPassageActions(passage);
assert(actions.includes('data-quran-bookmark="1:1"'), 'bookmark action should target canonical key');
assert(actions.includes('Personal reflection'), 'reflection control should be explicitly personal');
assert(actions.includes('data-quran-read="1:1"'), 'read action should carry exact ref');
pass('Passage controls expose bookmark, personal reflection, and read actions');

const panel = context.quranStudyRenderPanel();
assert(panel.includes('Personal records are stored separately from Quran and meal text.'), 'panel should distinguish user data from source text');
assert(panel.includes('Reading tracking on'), 'panel should report tracking state');
assert(panel.includes('My personal note'), 'saved reflection should appear in activity panel');
pass('My Quran panel clearly separates personal records from sacred source text');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(index.indexOf('js/quran-study.js') !== -1, 'index should load quran-study module');
assert(index.indexOf('js/quran-study.js') < index.indexOf('js/quran.js'), 'study module must load before quran reader');
const quranJs = fs.readFileSync(path.join(root, 'js/quran.js'), 'utf8');
assert(quranJs.includes('data-quran-refs='), 'reader passages should expose tracking refs');
assert(quranJs.includes('quranStudyRenderPassageActions'), 'reader should integrate study actions');
assert(quranJs.includes('quranStudyAfterRender'), 'reader should initialize tracking after render');
pass('Quran reader loads and wires the isolated study module in the correct order');


const renderRoot = { innerHTML: '' };
elements.set('quranReadRoot', renderRoot);
elements.set('quranSearchResults', { innerHTML: '' });
elements.set('quranSearchInput', { value: '' });
elements.set('quranListenRoot', { innerHTML: '' });
elements.set('quranUnderstandRoot', { innerHTML: '' });
for (const rel of ['data/quran-verses.js','data/quran-surahs.js','data/quran-translations-tevhid.js','data/quran-tevhid-meali-pages.js','js/quran.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), context, { filename: rel });
}
vm.runInContext('quranReadState.surah = 1; quranReadState.layoutMode = "verse"; quranReadState.contentMode = "both"; renderQuranRead();', context);
assert(renderRoot.innerHTML.includes('My Quran ·'), 'rendered toolbar should expose My Quran');
assert(renderRoot.innerHTML.includes('data-quran-bookmark="1:1"'), 'rendered verse should include bookmark action');
assert(renderRoot.innerHTML.includes('data-quran-reflection="1:1"'), 'rendered verse should include reflection action');
assert(renderRoot.innerHTML.includes('data-quran-read="1:1"'), 'rendered verse should include read action');
assert(renderRoot.innerHTML.includes('Mark surah complete') || renderRoot.innerHTML.includes('Completed ✓'), 'surah header should expose completion control');
pass('Live Quran render includes My Quran, passage study controls, and surah completion');

const protectedFiles = [
  'data/quran-verses.js',
  'data/quran-translations-tevhid.js',
  'data/quran-translations-tevhid.validation.json',
  'media/quran-reference/tevhid-meali.pdf'
];
// V56 (audit R5): this cross-version check needs the V53 baseline checkout,
// which only exists on the original machine. Skip gracefully — instead of
// crashing with ENOENT — so the suite stays green on clean clones; the
// byte-identity of the sacred files is still enforced against the in-repo
// validation reports by the V53 suite and by tools/test-quran-v55-follow.js.
const baselineRoot = path.resolve(root, '..', '..', 'studyos-v53-quran-validator', 'studyos');
if (fs.existsSync(baselineRoot)) {
  for (const rel of protectedFiles) {
    const before = path.join(baselineRoot, rel);
    const after = path.join(root, rel);
    assert(sha(before) === sha(after), `${rel} changed unexpectedly`);
  }
  pass('Protected Arabic, Tevhid Meali, validation, and source PDF remain byte-identical');
} else {
  console.log('SKIP — V53 baseline checkout not present on this machine; byte-identity check not run.');
}

const notices = fs.readFileSync(path.join(root, 'THIRD-PARTY-NOTICES.md'), 'utf8');
assert(notices.includes('quran.sh'), 'third-party notice should name quran.sh');
assert(notices.includes('Copyright (c) 2026 smashah'), 'MIT copyright notice should be retained');
pass('quran.sh attribution and MIT notice are retained');

console.log(`\nAll ${passed} Quran V54 study-tool tests passed.`);
