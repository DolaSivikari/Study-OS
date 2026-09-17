// ==================== QURAN OFFLINE MANAGER (V62.4) ====================
//
// Bulk "download for offline" over the Quran.com layers, plus the panel that
// reports what is already stored.
//
// The point is control over timing. Automatic caching (js/quran-offline-cache.js)
// only protects surahs you happen to have opened while online. This lets you
// take a juz — or the whole Quran — once, on wifi, and keep it.
//
// What it downloads, per surah:
//   * word-by-word meanings + transliteration + word audio URLs (Quran.com v4)
//   * word timings for the selected follow-along reciter (QDC)
//
// What it does NOT download:
//   * scripture — the Uthmani text and Tevhid Meali already ship in the app
//   * recitation MP3s — 200-800 MB per reciter; out of scope by design
//
// Downloads are sequential and abortable. Hammering a free public API in
// parallel is how you get rate-limited, and this is someone else's
// infrastructure being used courteously.

(function () {
    'use strict';

    var state = {
        running: false,
        cancelled: false,
        done: 0,
        total: 0,
        failed: [],
        label: '',
        currentSurah: null
    };

    var JUZ_FIRST_SURAH = null; // built lazily from verse metadata

    function surahList() { return window.QURAN_SURAHS || []; }

    function surahsForScope(scope, value) {
        var all = surahList().map(function (s) { return s.number; });
        if (scope === 'all') return all;
        if (scope === 'surah') return [Number(value)];
        if (scope === 'juz') {
            var verses = window.QURAN_VERSES || [];
            var set = Object.create(null);
            for (var i = 0; i < verses.length; i++) {
                if (Number(verses[i].juz) === Number(value)) set[verses[i].surah] = true;
            }
            return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
        }
        return [];
    }

    function currentFollowReciterId() {
        var reg = window.QURAN_WORD_AUDIO || {};
        var slug = window.quranSession && window.quranSession.follow
            ? window.quranSession.follow.reciter : null;
        var list = reg.TIMED_RECITERS || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].slug === slug) return list[i].qdcId;
        }
        return reg.FALLBACK_RECITER_ID || 7;
    }

    function wbwLang() {
        return (window.quranSession && window.quranSession.read && window.quranSession.read.wbwLang) || 'tr';
    }

    // One surah = word meanings + timings. Resolves either way; a failure is
    // recorded, never thrown, so one bad surah cannot abort a 114-surah run.
    function downloadSurah(surah, reciterId, lang) {
        var wd = window.QURAN_WORD_DATA;
        if (!wd) return Promise.resolve(false);

        var jobs = [];

        jobs.push(new Promise(function (resolve) {
            wd.wbw.reset(surah, lang);
            wd.wbw.ensure(surah, lang);
            var tries = 0;
            var poll = setInterval(function () {
                var status = wd.wbw.status(surah, lang);
                if (status === 'ready') { clearInterval(poll); resolve(true); return; }
                if (status === 'error' || ++tries > 300) { clearInterval(poll); resolve(false); }
            }, 100);
        }));

        jobs.push(wd.timing.ensure(reciterId, surah)
            .then(function () { return true; })
            .catch(function () { return false; }));

        return Promise.all(jobs).then(function (results) {
            return results.every(Boolean);
        });
    }

    function start(scope, value) {
        if (state.running) return Promise.resolve(state);
        var surahs = surahsForScope(scope, value);
        if (!surahs.length) return Promise.resolve(state);

        var reciterId = currentFollowReciterId();
        var lang = wbwLang();

        state.running = true;
        state.cancelled = false;
        state.done = 0;
        state.total = surahs.length;
        state.failed = [];
        state.label = scope === 'all' ? 'Whole Quran'
            : (scope === 'juz' ? ('Juz ' + value) : ('Surah ' + value));
        render();

        var chain = Promise.resolve();
        surahs.forEach(function (s) {
            chain = chain.then(function () {
                if (state.cancelled) return null;
                state.currentSurah = s;
                render();
                return downloadSurah(s, reciterId, lang).then(function (ok) {
                    if (!ok) state.failed.push(s);
                    state.done++;
                    render();
                });
            });
        });

        return chain.then(function () {
            state.running = false;
            state.currentSurah = null;
            render();
            return state;
        });
    }

    function cancel() {
        if (!state.running) return;
        state.cancelled = true;
        state.running = false;
        render();
    }

    function formatBytes(n) {
        if (!n) return '0 KB';
        if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
        return (n / 1024 / 1024).toFixed(1) + ' MB';
    }

    function render() {
        var root = document.getElementById('quranOfflineRoot');
        if (!root) return;
        var cache = window.QURAN_OFFLINE_CACHE;

        if (!cache || !cache.isAvailable()) {
            root.innerHTML = '<div class="quran-offline-note">Offline storage is unavailable in this browser context '
                + '(private browsing blocks it). The Quran text and Tevhid Meali still work offline — they ship inside the app.</div>';
            return;
        }

        cache.stats().then(function (s) {
            var surahs = surahList();
            var surahOptions = surahs.map(function (item) {
                return '<option value="' + item.number + '">' + esc(item.number + '. ' + item.englishName) + '</option>';
            }).join('');
            var juzOptions = '';
            for (var j = 1; j <= 30; j++) juzOptions += '<option value="' + j + '">Juz ' + j + '</option>';

            var progress = '';
            if (state.running || state.done) {
                var pct = state.total ? Math.round((state.done / state.total) * 100) : 0;
                progress =
                    '<div class="quran-offline-progress">' +
                        '<div class="progress"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
                        '<div class="quran-offline-progress-meta">' +
                            '<span>' + esc(state.label) + ' — ' + state.done + '/' + state.total +
                                (state.currentSurah ? ' · downloading surah ' + state.currentSurah : '') + '</span>' +
                            (state.running
                                ? '<button class="btn btn-secondary btn-sm" type="button" onclick="quranOfflineCancel()">Cancel</button>'
                                : '') +
                        '</div>' +
                        (state.failed.length
                            ? '<div class="quran-offline-failed">' + state.failed.length +
                              ' surah(s) could not be downloaded (offline or rate-limited): ' +
                              esc(state.failed.slice(0, 12).join(', ')) + '. Run it again to retry just those.</div>'
                            : '') +
                    '</div>';
            }

            root.innerHTML =
                '<div class="quran-offline-stats">' +
                    '<div><strong>' + (s.byKind.wbw || 0) + '</strong><span>surahs with word meanings</span></div>' +
                    '<div><strong>' + (s.byKind.timing || 0) + '</strong><span>reciter/surah timings</span></div>' +
                    '<div><strong>' + esc(formatBytes(s.approxBytes)) + '</strong><span>stored on this device</span></div>' +
                '</div>' +
                '<div class="quran-offline-actions">' +
                    '<label><span>Download</span>' +
                        '<select class="form-select" id="quranOfflineScope" onchange="quranOfflineScopeChanged()">' +
                            '<option value="surah">A single surah</option>' +
                            '<option value="juz">A juz</option>' +
                            '<option value="all">The whole Quran</option>' +
                        '</select></label>' +
                    '<label id="quranOfflineValueWrap"><span>Which</span>' +
                        '<select class="form-select" id="quranOfflineValue">' + surahOptions + '</select></label>' +
                    '<button class="btn btn-primary" type="button" onclick="quranOfflineStart()" ' + (state.running ? 'disabled' : '') + '>Download for offline</button>' +
                '</div>' +
                progress +
                '<div class="quran-offline-note">' +
                    'Downloads word meanings, transliteration and word timings for your selected follow-along reciter. ' +
                    'Recitation MP3s are not included — a full recitation is 200–800 MB. ' +
                    'The Arabic text and Tevhid Meali already ship inside StudyOS and never needed a download.' +
                '</div>' +
                '<div class="quran-offline-footer">' +
                    '<button class="btn btn-secondary btn-sm" type="button" onclick="quranOfflineClear()">Clear downloaded data</button>' +
                    '<span>Stored separately from your StudyOS data — backups and Reset All Data do not touch it.</span>' +
                '</div>';

            var scopeEl = document.getElementById('quranOfflineScope');
            if (scopeEl && state._scope) scopeEl.value = state._scope;
            applyScopeOptions();
        });
    }

    function applyScopeOptions() {
        var scopeEl = document.getElementById('quranOfflineScope');
        var wrap = document.getElementById('quranOfflineValueWrap');
        var valueEl = document.getElementById('quranOfflineValue');
        if (!scopeEl || !wrap || !valueEl) return;
        var scope = scopeEl.value;
        state._scope = scope;
        if (scope === 'all') { wrap.hidden = true; return; }
        wrap.hidden = false;
        if (scope === 'juz') {
            var juz = '';
            for (var j = 1; j <= 30; j++) juz += '<option value="' + j + '">Juz ' + j + '</option>';
            valueEl.innerHTML = juz;
        } else {
            valueEl.innerHTML = surahList().map(function (item) {
                return '<option value="' + item.number + '">' + esc(item.number + '. ' + item.englishName) + '</option>';
            }).join('');
        }
    }

    window.quranOfflineScopeChanged = applyScopeOptions;

    window.quranOfflineStart = function () {
        var scopeEl = document.getElementById('quranOfflineScope');
        var valueEl = document.getElementById('quranOfflineValue');
        if (!scopeEl) return;
        start(scopeEl.value, valueEl ? valueEl.value : null);
    };

    window.quranOfflineCancel = cancel;

    window.quranOfflineClear = function () {
        if (!window.confirm('Delete all downloaded Quran word data from this device?\n\nYour StudyOS data, bookmarks, reflections and reading log are not affected. The Arabic text and Tevhid Meali stay — they ship inside the app.')) return;
        var cache = window.QURAN_OFFLINE_CACHE;
        if (!cache) return;
        cache.clear().then(function () {
            if (typeof showToast === 'function') showToast('Downloaded Quran data cleared.');
            render();
        });
    };

    window.renderQuranOffline = render;
    window.QURAN_OFFLINE_MANAGER = {
        start: start,
        cancel: cancel,
        state: function () { return state; },
        surahsForScope: surahsForScope
    };
})();
