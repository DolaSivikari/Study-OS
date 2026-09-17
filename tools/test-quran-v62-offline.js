#!/usr/bin/env node
'use strict';
// V62.4 — durable Quran layer cache + bulk download.
//
// The safety property that matters most here: this cache must be incapable of
// touching the 54 registered StudyOS storage keys, the schema version, the
// migration ladder, or backup/restore. It is derived data — re-downloadable,
// and deliberately excluded from exports.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
let passed = 0;
function check(name, ok, detail = '') {
  if (!ok) { console.error(`FAIL — ${name}${detail ? ` (${detail})` : ''}`); process.exitCode = 1; return; }
  passed++; console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
}
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
// These checks are about what the CODE touches. Comments legitimately name
// the things the cache is designed to stay away from, so strip them first
// rather than letting documentation trip its own assertion.
const codeOnly = src => src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');

const cacheSrc = read('js/quran-offline-cache.js');
const managerSrc = read('js/quran-offline-manager.js');
const wordDataSrc = read('js/quran-word-data.js');
const coreSrc = read('js/core.js');
const dataMgmtSrc = read('js/data-mgmt.js');
const indexSrc = read('index.html');

// ---- isolation from user data -------------------------------------------
const appDb = (coreSrc.match(/INDEXED_DB_NAME\s*=\s*'([^']+)'/) || [])[1];
const cacheDb = (cacheSrc.match(/DB_NAME\s*=\s*'([^']+)'/) || [])[1];
check('Cache uses its own IndexedDB database', !!appDb && !!cacheDb && appDb !== cacheDb,
  `app=${appDb} cache=${cacheDb}`);

check('Cache never touches the K storage registry or localStorage',
  !/\bK\./.test(codeOnly(cacheSrc)) && !/localStorage/.test(codeOnly(cacheSrc)));

check('Cache never touches the schema version or migrations',
  !/STORAGE_SCHEMA_KEY|DATA_SCHEMA_VERSION|runSchemaMigrations/.test(codeOnly(cacheSrc) + codeOnly(managerSrc)));

check('Backup/restore is untouched — cache is not exported',
  !/QURAN_OFFLINE_CACHE|quran_cache/.test(dataMgmtSrc));

check('Reset All Data does not reach into the cache',
  !/QURAN_OFFLINE_CACHE/.test(dataMgmtSrc + coreSrc));

// ---- resilience ----------------------------------------------------------
check('Every cache read and write resolves rather than rejects',
  /\.catch\(function\s*\(\)\s*\{\s*return null;\s*\}\)/.test(cacheSrc)
  && /\.catch\(function\s*\(\)\s*\{\s*return false;\s*\}\)/.test(cacheSrc),
  'a throwing cache must never block the live fetch path');

check('Cache degrades to a no-op when IndexedDB is blocked',
  /unavailable\s*=\s*true/.test(cacheSrc) && /isAvailable/.test(cacheSrc));

check('The word-data bridge tolerates the cache being absent',
  /if \(!c\) return Promise\.resolve\(null\)/.test(wordDataSrc)
  && /if \(!c\) return Promise\.resolve\(false\)/.test(wordDataSrc));

// ---- read-through wiring -------------------------------------------------
for (const layer of ['wbw', 'tajweed', 'timing']) {
  check(`${layer} layer reads the cache before the network`,
    new RegExp(`quranCacheGet\\('${layer}'`).test(wordDataSrc));
  check(`${layer} layer writes to the cache after a successful fetch`,
    new RegExp(`quranCachePut\\('${layer}'`).test(wordDataSrc));
}

// ---- load order ----------------------------------------------------------
check('Cache loads before the module that reads through it',
  indexSrc.indexOf('js/quran-offline-cache.js') < indexSrc.indexOf('js/quran-word-data.js')
  && indexSrc.indexOf('js/quran-offline-cache.js') > 0);
check('Offline manager is registered in index.html',
  indexSrc.includes('js/quran-offline-manager.js'));

// ---- scope resolution ----------------------------------------------------
const ctx = { window: { QURAN_SURAHS: [], QURAN_VERSES: [] }, document: { getElementById: () => null }, console };
vm.createContext(ctx);
ctx.esc = s => String(s);
vm.runInContext(managerSrc, ctx);
const M = ctx.window.QURAN_OFFLINE_MANAGER;
check('Manager exposes its scope resolver', M && typeof M.surahsForScope === 'function');

ctx.window.QURAN_SURAHS = Array.from({ length: 114 }, (_, i) => ({ number: i + 1, englishName: 'S' + (i + 1) }));
ctx.window.QURAN_VERSES = [
  { surah: 78, ayah: 1, juz: 30 }, { surah: 79, ayah: 1, juz: 30 },
  { surah: 114, ayah: 1, juz: 30 }, { surah: 2, ayah: 1, juz: 1 }
];
check('scope=all covers every surah', M.surahsForScope('all').length === 114);
check('scope=surah resolves to exactly one', JSON.stringify(M.surahsForScope('surah', 36)) === '[36]');
const juz30 = M.surahsForScope('juz', 30);
check('scope=juz resolves from verse metadata and is sorted',
  JSON.stringify(juz30) === '[78,79,114]', JSON.stringify(juz30));
check('Unknown scope resolves to nothing rather than everything',
  M.surahsForScope('nonsense').length === 0);

// ---- courtesy to a free public API --------------------------------------
check('Bulk download is sequential, not parallel',
  /chain = chain\.then/.test(managerSrc) && !/Promise\.all\(surahs/.test(managerSrc));
check('Bulk download is cancellable', /state\.cancelled/.test(managerSrc) && /function cancel/.test(managerSrc));
check('One failed surah does not abort the run',
  /state\.failed\.push/.test(managerSrc) && /\.catch\(function \(\) \{ return false; \}\)/.test(managerSrc));

// ---- honesty -------------------------------------------------------------
check('Panel states that recitation MP3s are not included',
  /not included/.test(managerSrc) && /200–800 MB|200-800 MB/.test(managerSrc));
check('Panel states scripture already ships in the app',
  /already ship/.test(managerSrc));
check('Clear action warns that it is separate from StudyOS data',
  /not affected/.test(managerSrc));

if (!process.exitCode) console.log(`\n${passed} V62.4 offline-cache checks passed.`);
