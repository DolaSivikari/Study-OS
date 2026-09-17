// ==================== QURAN SESSION (V58) ====================
// Single source of truth for Quran-section state (audit R6) and the
// versioned preference persistence hook (audit R8).
//
// Before V56 the section kept three independent state objects
// (quranReadState in quran.js, quranAudioState in quran-listen.js,
// quranFollowState in quran-follow-along.js). They still exist as the
// module-local NAMES, but each is now a reference to a namespace of this
// one `quranSession` object, so state is inspectable and owned in one
// place and cannot silently diverge.
//
// Storage keys are UNCHANGED (CLAUDE.md rule 3):
//   read   → K.quranReadPreferences  ('studyos_quran_read_preferences_v48')
//   listen → K.quranAudioPreferences ('studyos_quran_audio_preferences_v52')
//   follow → K.quranFollowAlong      ('studyos_quran_follow_along_v1')
// What's new is a `_v` version stamp INSIDE each payload plus a migration
// chain, so future payload-shape changes get a real upgrade path instead of
// ad-hoc defensive reads. Payloads without `_v` (V48–V55) are treated as v1.
//
// V2 of the read payload adds persisted reading position (audit R8):
// `surah` (1–114) and `ayah` (last explicitly opened verse), restored on
// the first reader render of a session.
//
// V3 adds the offline Mushaf page reader preferences:
// `mushafPage` (1–604), `mushafFitMode` (fit | readable), and
// `mushafAutoTurn` (whether follow-along audio may turn pages).
//
// Fields prefixed with `_` are runtime-only and are never persisted.

(function(){
    'use strict';

    var quranSession = {
        read: {
            surah: 1,
            ayah: null,             // V56: last explicitly opened verse (persisted)
            script: 'uthmani',
            fontScale: 1,
            contentMode: 'both',    // arabic | meaning | both | wbw
            layoutMode: 'verse',    // page (continuous) | verse; mushaf is a dedicated route
            standardLayoutMode: 'verse',
            font: 'scheherazade',   // scheherazade | kfgqpc | naskh | system
            wbwLang: 'tr',
            showTajweed: false,
            mushafPage: 1,
            mushafFitMode: 'fit',   // fit | readable
            mushafAutoTurn: true,
            wordAudioOnTap: true,   // V62.2: tapping a word plays that word
            _scrollRestored: false  // runtime: one-time position restore flag
        },
        listen: {
            reciter: 'ar.alafasy',
            surah: 1,
            ayah: 1,
            autoAdvance: true,
            repeat: false,
            speed: 1,           // V62.2: 0.5 | 0.75 | 1 | 1.25 | 1.5
            repeatCount: 3,     // V62.2: repeats per verse; 0 = until stopped
            _repeatsDone: 0     // runtime
        },
        follow: {
            reciter: 'mishary-rashid-alafasy',
            speed: 1,
            repeat: 'none',
            autoScroll: true,
            listenSync: true,
            // Runtime (not persisted):
            surah: null,
            loadedReciter: null,
            playback: 'idle',
            verseKey: null,
            wordPosition: null,
            approximate: false,
            statusMessage: '',
            statusIsError: false
        }
    };

    var QURAN_PREF_VERSIONS = { read: 3, listen: 1, follow: 1 };

    // Migration steps: STEPS[ns][v] upgrades a payload FROM version v to v+1.
    // Keep steps additive and non-destructive; never invent user data.
    var QURAN_PREF_MIGRATIONS = {
        read: {
            // v1 (V48–V55 payload, no _v): position fields did not exist yet.
            // Nothing to transform — the new fields default in the loader —
            // but the step records the shape change explicitly.
            1: function(payload) { return payload; },
            // v2 (V56–V57): Mushaf-page preferences did not exist yet.
            2: function(payload) { return payload; }
        },
        listen: {},
        follow: {}
    };

    function quranPrefsMigrate(ns, payload) {
        var target = QURAN_PREF_VERSIONS[ns] || 1;
        var version = Number(payload && payload._v) || 1;
        var steps = QURAN_PREF_MIGRATIONS[ns] || {};
        var current = payload;
        while (version < target) {
            var step = steps[version];
            if (step) {
                try { current = step(current) || current; } catch (err) {
                    console.error('quran prefs migration failed', ns, version, err);
                    break;
                }
            }
            version++;
        }
        return current;
    }

    // Load + migrate a preference payload, then hand it to the module's own
    // field-whitelisting apply() function. Never throws.
    function quranPrefsLoad(ns, key, apply) {
        try {
            var saved = get(key);
            if (!saved || typeof saved !== 'object') return;
            apply(quranPrefsMigrate(ns, saved));
        } catch (_) {
            // Preferences are optional; defaults stay in effect.
        }
    }

    // Persist a payload with the current version stamp.
    function quranPrefsSave(ns, key, payload) {
        try {
            payload._v = QURAN_PREF_VERSIONS[ns] || 1;
            set(key, payload);
        } catch (_) {
            // The section stays usable when storage is unavailable.
        }
    }

    window.quranSession = quranSession;
    window.quranPrefsLoad = quranPrefsLoad;
    window.quranPrefsSave = quranPrefsSave;
    window.quranPrefsMigrate = quranPrefsMigrate;
    window.QURAN_PREF_VERSIONS = QURAN_PREF_VERSIONS;
})();
