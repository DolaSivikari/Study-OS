#!/usr/bin/env node
'use strict';
// V62.2 — text-derived word-timing estimator.
//
// Covers the pure functions added to js/quran-audio-engine.js for reciters
// that QDC publishes no word segments for. These are the functions that decide
// whether the follow-along indicator appears at all, and how far it drifts.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
let passed = 0;
function check(name, ok, detail = '') {
  if (!ok) { console.error(`FAIL — ${name}${detail ? ` (${detail})` : ''}`); process.exitCode = 1; return; }
  passed++; console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
}

const ctx = { window: {}, console, document: undefined, Audio: function () {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/quran-audio-engine.js'), 'utf8'), ctx);
const E = ctx.window.QURAN_AUDIO_ENGINE;

check('Engine exposes the V62.2 timing helpers',
  E && typeof E.wordDurationWeight === 'function'
    && typeof E.estimateSegmentsFromText === 'function'
    && typeof E.blendSegments === 'function');

// ---- weights -------------------------------------------------------------
const shortWord = 'قُمْ';            // qum — 2 letters, one sukun
const maddWord = 'ٱلضَّآلِّينَ';       // ad-daalleen — madd + shadda, audibly long
check('A madd/shadda word weighs more than a short closed syllable',
  E.wordDurationWeight(maddWord) > E.wordDurationWeight(shortWord),
  `${E.wordDurationWeight(maddWord).toFixed(2)} vs ${E.wordDurationWeight(shortWord).toFixed(2)}`);

check('Weight is always positive, even for empty or junk input',
  E.wordDurationWeight('') > 0 && E.wordDurationWeight(null) > 0 && E.wordDurationWeight('،') > 0);

// ---- estimateSegmentsFromText -------------------------------------------
const words = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَـٰنِ', 'ٱلرَّحِيمِ'];
const est = E.estimateSegmentsFromText(words, 1000, 5000);

check('Estimator returns one segment per word', est.length === words.length);
check('Segments are 1-indexed by word position',
  est.every((s, i) => s[0] === i + 1));
check('Segments exactly span the supplied verse window',
  est[0][1] === 1000 && est[est.length - 1][2] === 5000,
  `${est[0][1]}..${est[est.length - 1][2]}`);
check('Segments are strictly increasing and non-overlapping',
  est.every((s, i) => s[2] > s[1] && (i === 0 || s[1] >= est[i - 1][2])));
check('Longer words receive proportionally more time',
  (est[2][2] - est[2][1]) > (est[0][2] - est[0][1]),
  'ar-Rahmaan should outlast Bismi');

check('Estimator degrades safely on bad input',
  E.estimateSegmentsFromText([], 0, 100).length === 0
  && E.estimateSegmentsFromText(words, 500, 500).length === 0
  && E.estimateSegmentsFromText(words, 900, 100).length === 0
  && E.estimateSegmentsFromText(null, 0, 100).length === 0);

// ---- blendSegments -------------------------------------------------------
const ref = [[1, 0, 1000], [2, 1000, 2000], [3, 2000, 3000]];
const txt = [[1, 0, 500], [2, 500, 2500], [3, 2500, 3000]];

check('ratio 0 returns the reference unchanged',
  JSON.stringify(E.blendSegments(ref, txt, 0)) === JSON.stringify(ref));
check('ratio 1 returns the text estimate',
  JSON.stringify(E.blendSegments(ref, txt, 1)) === JSON.stringify(txt));

const mid = E.blendSegments(ref, txt, 0.5);
check('ratio 0.5 lands between the two inputs',
  mid[0][2] === 750 && mid[1][1] === 750 && mid[1][2] === 2250);
check('Blend keeps the sequence monotonic',
  mid.every((s, i) => s[2] > s[1] && (i === 0 || s[1] >= mid[i - 1][2])));
check('Blend preserves word positions', mid.every((s, i) => s[0] === ref[i][0]));

check('Blend falls back cleanly when one side is missing or mismatched',
  JSON.stringify(E.blendSegments([], txt, 0.5)) === JSON.stringify(txt)
  && JSON.stringify(E.blendSegments(ref, [], 0.5)) === JSON.stringify(ref)
  && JSON.stringify(E.blendSegments(ref, txt.slice(0, 2), 0.5)) === JSON.stringify(ref));
check('Blend clamps out-of-range ratios',
  JSON.stringify(E.blendSegments(ref, txt, -5)) === JSON.stringify(ref)
  && JSON.stringify(E.blendSegments(ref, txt, 9)) === JSON.stringify(txt));

// ---- the regression this whole change exists to prevent -------------------
// Every reciter must be able to produce a follow indicator from local data
// alone, with no reference reciter and no network.
const localOnly = E.estimateSegmentsFromText(
  ['يَـٰٓأَيُّهَا', 'ٱلْمُدَّثِّرُ'], 0, 4000);
check('A reciter with no QDC segments still gets a usable indicator offline',
  localOnly.length === 2 && localOnly[0][1] === 0 && localOnly[1][2] === 4000);

// The estimator must be usable by findWordPosition, which is what actually
// drives the highlight.
check('Estimated segments drive findWordPosition correctly',
  E.findWordPosition(localOnly, 0) === 1
  && E.findWordPosition(localOnly, 3999) === 2
  && E.findWordPosition(localOnly, localOnly[0][2]) === 2);

// ---- data integrity ------------------------------------------------------
const registry = {};
vm.runInContext(fs.readFileSync(path.join(root, 'data/quran-word-audio.js'), 'utf8'), ctx);
const WA = ctx.window.QURAN_WORD_AUDIO;
check('The reciters reported as having no indicator are all registered',
  ['maher-al-muaiqly', 'saad-al-ghamdi', 'minshawi-murattal', 'minshawi-mujawwad', 'fatih-seferagic']
    .every(slug => WA.TIMED_RECITERS.some(r => r.slug === slug)));
check('Every registered reciter has a numeric QDC id',
  WA.TIMED_RECITERS.every(r => Number.isFinite(r.qdcId) && r.qdcId > 0));

if (!process.exitCode) console.log(`\n${passed} V62.2 word-timing checks passed.`);
