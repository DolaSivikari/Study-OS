// ==================== QURAN DATA LOADER (V56, audit R9) ====================
// Lazy-loads the two heavy Quran datasets on first use instead of parsing
// ~3.8 MB at every app start:
//   data/quran-verses.js             (~2.66 MB — 6,236 verses)
//   data/quran-translations-tevhid.js (~1.13 MB — Tevhid Meali)
// The small metadata files (surahs, audio references, word-audio registry,
// Tevhid page map) stay eager — they are a few KB and other startup surfaces
// read them.
//
// Mechanism: classic <script> tag injection (NOT fetch(), NOT ES modules —
// both banned by CLAUDE.md; injection works from file://). Consumers call
// quranEnsureData(cb): cb(true) once both globals exist, cb(false) if a file
// fails to load. The quote-validator index is rebuilt after injection
// because js/quran-validator.js snapshots window.QURAN_VERSES at
// construction time.
//
// Sacred-text rule: this file changes WHEN the data files load, never what
// is in them.

(function(){
    'use strict';

    var QURAN_DATA_FILES = [
        'data/quran-verses.js',
        'data/quran-translations-tevhid.js'
    ];

    var state = {
        status: 'idle', // idle | loading | ready | error
        callbacks: []
    };

    function quranDataReady() {
        return Boolean(window.QURAN_VERSES && window.QURAN_VERSES.length &&
            window.QURAN_TRANSLATION_TEVHID && Object.keys(window.QURAN_TRANSLATION_TEVHID).length);
    }

    function quranDataStatus() {
        if (quranDataReady()) return 'ready';
        return state.status === 'ready' ? 'error' : state.status;
    }

    function flush(ok) {
        var callbacks = state.callbacks;
        state.callbacks = [];
        callbacks.forEach(function(cb) {
            try { cb(ok); } catch (err) { console.error('quran data callback failed', err); }
        });
    }

    function rebuildValidator() {
        // js/quran-validator.js instantiated its index before the data
        // existed; rebuild it now that QURAN_VERSES is present.
        try {
            if (typeof window.StudyOSQuranValidator === 'function') {
                window.QURAN_VALIDATOR = new window.StudyOSQuranValidator();
            }
        } catch (err) {
            console.error('Quran validator rebuild failed', err);
        }
    }

    function injectSequential(files, index, onDone) {
        if (index >= files.length) { onDone(true); return; }
        var script = document.createElement('script');
        script.src = files[index];
        script.onload = function() { injectSequential(files, index + 1, onDone); };
        script.onerror = function() { onDone(false); };
        document.head.appendChild(script);
    }

    // cb(ok:boolean). Safe to call repeatedly (renders while loading just
    // queue another idempotent re-render). A failed load leaves status
    // 'error'; calling again retries.
    function quranEnsureData(cb) {
        if (typeof cb !== 'function') cb = function() {};
        if (quranDataReady()) {
            if (state.status !== 'ready') { state.status = 'ready'; }
            cb(true);
            return;
        }
        state.callbacks.push(cb);
        if (state.status === 'loading') return;
        state.status = 'loading';
        injectSequential(QURAN_DATA_FILES, 0, function(ok) {
            var ready = ok && quranDataReady();
            state.status = ready ? 'ready' : 'error';
            if (ready) rebuildValidator();
            flush(ready);
        });
    }

    window.quranDataReady = quranDataReady;
    window.quranDataStatus = quranDataStatus;
    window.quranEnsureData = quranEnsureData;
})();
