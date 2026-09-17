// ==================== QURAN OFFLINE CACHE (V62.4) ====================
//
// Durable storage for the Quran layers StudyOS fetches from Quran.com:
// word-by-word meanings, word timings, and tajweed-annotated text.
//
// WHY THIS EXISTS
// Those three layers lived in plain in-memory objects (wbwCache, timingCache,
// tajweedCache in js/quran-word-data.js). They died on every reload, so the
// app re-fetched everything each session. That meant word meanings and
// follow-along did not work on a plane, during any API outage, or if the
// endpoints ever move — even for a surah studied yesterday. The dependency
// was on those services being UP RIGHT NOW, not merely on them existing.
//
// With this layer, anything fetched once keeps working forever.
//
// DELIBERATELY A SEPARATE DATABASE
// This uses its own IndexedDB database, NOT the app's `studyos_v16` store:
//   * the 54 registered storage keys, DATA_SCHEMA_VERSION and the migration
//     ladder in js/core.js are untouched — zero risk to user data;
//   * export/import stays user data only. This is derived cache; a backup
//     should not carry 10 MB of re-downloadable material;
//   * it can be cleared on its own without going near Reset All Data.
//
// Scripture itself is NOT cached here. The Uthmani text and the Tevhid Meali
// ship inside the app (data/quran-verses.js, data/quran-translations-tevhid.js)
// and are already permanent and offline.

(function () {
    'use strict';

    var DB_NAME = 'studyos_quran_cache_v1';
    var DB_VERSION = 1;
    var STORE = 'layers';

    var dbPromise = null;
    var unavailable = false;   // set if IndexedDB is blocked (private mode, etc.)

    function openDb() {
        if (unavailable) return Promise.resolve(null);
        if (dbPromise) return dbPromise;
        dbPromise = new Promise(function (resolve) {
            var req;
            try {
                req = indexedDB.open(DB_NAME, DB_VERSION);
            } catch (e) {
                unavailable = true;
                resolve(null);
                return;
            }
            req.onupgradeneeded = function () {
                var db = req.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    db.createObjectStore(STORE, { keyPath: 'key' });
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { unavailable = true; resolve(null); };
            req.onblocked = function () { resolve(null); };
        });
        return dbPromise;
    }

    function tx(mode) {
        return openDb().then(function (db) {
            if (!db) return null;
            try { return db.transaction(STORE, mode).objectStore(STORE); }
            catch (e) { return null; }
        });
    }

    function recordKey(kind, key) { return String(kind) + '::' + String(key); }

    // Every read and write resolves rather than rejects. A cache that throws
    // is worse than no cache — the live fetch path must always stay reachable.
    function get(kind, key) {
        return tx('readonly').then(function (store) {
            if (!store) return null;
            return new Promise(function (resolve) {
                var req = store.get(recordKey(kind, key));
                req.onsuccess = function () {
                    var row = req.result;
                    resolve(row && row.data !== undefined ? row.data : null);
                };
                req.onerror = function () { resolve(null); };
            });
        }).catch(function () { return null; });
    }

    function put(kind, key, data) {
        return tx('readwrite').then(function (store) {
            if (!store) return false;
            return new Promise(function (resolve) {
                var req = store.put({
                    key: recordKey(kind, key),
                    kind: String(kind),
                    ref: String(key),
                    savedAt: Date.now(),
                    data: data
                });
                req.onsuccess = function () { resolve(true); };
                req.onerror = function () { resolve(false); };
            });
        }).catch(function () { return false; });
    }

    function has(kind, key) {
        return get(kind, key).then(function (d) { return d !== null; });
    }

    function all() {
        return tx('readonly').then(function (store) {
            if (!store) return [];
            return new Promise(function (resolve) {
                var req = store.getAll ? store.getAll() : null;
                if (!req) { resolve([]); return; }
                req.onsuccess = function () { resolve(req.result || []); };
                req.onerror = function () { resolve([]); };
            });
        }).catch(function () { return []; });
    }

    // Approximate on-disk size. navigator.storage.estimate() covers the whole
    // origin, so it is reported separately rather than attributed to us.
    function stats() {
        return all().then(function (rows) {
            var byKind = Object.create(null);
            var bytes = 0;
            for (var i = 0; i < rows.length; i++) {
                var k = rows[i].kind || 'other';
                byKind[k] = (byKind[k] || 0) + 1;
                try { bytes += JSON.stringify(rows[i].data).length; } catch (e) {}
            }
            return {
                available: !unavailable,
                total: rows.length,
                byKind: byKind,
                approxBytes: bytes,
                surahs: rows.filter(function (r) { return r.kind === 'wbw'; }).length
            };
        });
    }

    function clear(kind) {
        return tx('readwrite').then(function (store) {
            if (!store) return 0;
            return new Promise(function (resolve) {
                if (!kind) {
                    var req = store.clear();
                    req.onsuccess = function () { resolve(-1); };
                    req.onerror = function () { resolve(0); };
                    return;
                }
                var cursorReq = store.openCursor();
                var removed = 0;
                cursorReq.onsuccess = function () {
                    var cursor = cursorReq.result;
                    if (!cursor) { resolve(removed); return; }
                    if (cursor.value && cursor.value.kind === kind) { cursor.delete(); removed++; }
                    cursor.continue();
                };
                cursorReq.onerror = function () { resolve(removed); };
            });
        }).catch(function () { return 0; });
    }

    window.QURAN_OFFLINE_CACHE = {
        DB_NAME: DB_NAME,
        get: get,
        put: put,
        has: has,
        stats: stats,
        clear: clear,
        isAvailable: function () { return !unavailable; }
    };
})();
