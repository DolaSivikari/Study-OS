// ==================== QURAN FOLLOW-ALONG (V55) ====================
// UI glue between the vanilla Quran audio engine (js/quran-audio-engine.js),
// the timing/word data layer (js/quran-word-data.js), and the reader DOM.
// Adapted from Mahfuz's audio store + AyahBlock wiring
// (github.com/theilgaz/mahfuz, MIT), re-expressed as direct DOM updates.
//
// Read tab: a transport bar plays the whole surah (one QDC chapter mp3);
// the active verse card gets .verse-audio-active and auto-scrolls to
// center; the active word span gets .word-audio-active and glides word by
// word using the QDC segment data.
//
// Listen tab: the existing validated per-verse stream (data/quran-audio.js)
// is untouched; a rAF loop overlays an approximate word highlight by
// rescaling the QDC verse segments onto the playing element's duration
// (the same Tier-2 trick Mahfuz uses for reciters without timing).
//
// Preferences live under K.quranFollowAlong (registered in js/core.js).

var QURAN_FOLLOW_PREF_KEY = K.quranFollowAlong;
var QURAN_FOLLOW_SPEEDS = [0.75, 1, 1.25, 1.5];

// V56 (audit R6): follow-along state lives in quranSession.follow
// (js/quran-session.js); the local name is kept for unchanged call sites.
var quranFollowState = (window.quranSession && window.quranSession.follow) || {
    reciter: 'mishary-rashid-alafasy',
    speed: 1,
    repeat: 'none',          // none | verse | surah
    autoScroll: true,
    listenSync: true,        // Listen-tab word highlight on/off
    // Runtime (not persisted):
    surah: null,             // surah currently loaded into the engine
    loadedReciter: null,     // reciter slug the loaded chapter belongs to
    playback: 'idle',        // idle | loading | playing | paused | ended
    verseKey: null,
    wordPosition: null,
    approximate: false,
    timingQuality: '',      // V62.2: exact | blend | estimated | none
    statusMessage: '',
    statusIsError: false
};

var quranFollowEngine = null;

(function quranFollowLoadPreferences() {
    var apply = function(saved) {
        if (typeof saved.reciter === 'string' && quranFollowReciterBySlug(saved.reciter)) {
            quranFollowState.reciter = saved.reciter;
        }
        if (QURAN_FOLLOW_SPEEDS.indexOf(Number(saved.speed)) !== -1) {
            quranFollowState.speed = Number(saved.speed);
        }
        if (saved.repeat === 'none' || saved.repeat === 'verse' || saved.repeat === 'surah') {
            quranFollowState.repeat = saved.repeat;
        }
        if (typeof saved.autoScroll === 'boolean') quranFollowState.autoScroll = saved.autoScroll;
        if (typeof saved.listenSync === 'boolean') quranFollowState.listenSync = saved.listenSync;
    };
    try {
        if (typeof quranPrefsLoad === 'function') {
            quranPrefsLoad('follow', QURAN_FOLLOW_PREF_KEY, apply);
        } else {
            apply(get(QURAN_FOLLOW_PREF_KEY) || {});
        }
    } catch (_) {
        // Preferences are optional; playback works with defaults.
    }
})();

function quranFollowSavePreferences() {
    var payload = {
        reciter: quranFollowState.reciter,
        speed: quranFollowState.speed,
        repeat: quranFollowState.repeat,
        autoScroll: quranFollowState.autoScroll,
        listenSync: quranFollowState.listenSync
    };
    try {
        if (typeof quranPrefsSave === 'function') {
            quranPrefsSave('follow', QURAN_FOLLOW_PREF_KEY, payload);
        } else {
            set(QURAN_FOLLOW_PREF_KEY, payload);
        }
    } catch (_) {
        // Follow-along stays usable when storage is unavailable.
    }
}

function quranFollowReciters() {
    return (window.QURAN_WORD_AUDIO && window.QURAN_WORD_AUDIO.TIMED_RECITERS) || [];
}

function quranFollowReciterBySlug(slug) {
    var list = quranFollowReciters();
    for (var i = 0; i < list.length; i++) {
        if (list[i].slug === slug) return list[i];
    }
    return null;
}

function quranFollowCurrentReciter() {
    return quranFollowReciterBySlug(quranFollowState.reciter) || quranFollowReciters()[0] || null;
}

// ---------- Engine lifecycle ----------

function quranFollowEnsureEngine() {
    if (quranFollowEngine || !window.QURAN_AUDIO_ENGINE) return quranFollowEngine;
    quranFollowEngine = new window.QURAN_AUDIO_ENGINE.QuranAudioEngine({
        onPlaybackStateChange: function(state) {
            quranFollowState.playback = state;
            if (state === 'ended') {
                quranFollowState.verseKey = null;
                quranFollowState.wordPosition = null;
                quranFollowClearHighlights();
                quranFollowSetStatus('Finished.');
            }
            quranFollowUpdateBar();
        },
        onTimeUpdate: function(currentMs, durationMs) {
            quranFollowUpdateProgress(currentMs, durationMs);
        },
        onWordPositionChange: function(position) {
            quranFollowState.wordPosition = position;
            quranFollowApplyWordHighlight();
        },
        onVerseChange: function(verseKey) {
            quranFollowState.verseKey = verseKey;
            if (quranReadState.layoutMode === 'mushaf' && quranReadState.mushafAutoTurn && typeof quranVerseByReference === 'function') {
                var parts = String(verseKey || '').split(':');
                var verse = quranVerseByReference(Number(parts[0]), Number(parts[1]));
                if (verse && verse.page !== quranReadState.mushafPage && typeof quranMushafGoToVerse === 'function') {
                    quranMushafGoToVerse(verse.surah, verse.ayah, { highlight: false });
                    return;
                }
            }
            quranFollowApplyVerseHighlight();
        },
        onVerseEnd: function() {},
        onError: function(err) {
            quranFollowSetStatus('Playback error: ' + (err && err.message ? err.message : 'audio failed') +
                '. Check the internet connection.', true);
            quranFollowUpdateBar();
        }
    });
    return quranFollowEngine;
}

// Load (or reuse) chapter audio for the current reciter + surah, then run fn.
function quranFollowWithChapter(surah, fn) {
    var reciter = quranFollowCurrentReciter();
    if (!reciter || !window.QURAN_WORD_DATA) {
        quranFollowSetStatus('Word-timed audio registry did not load.', true);
        return;
    }
    var engine = quranFollowEnsureEngine();
    if (!engine) {
        quranFollowSetStatus('Audio engine did not load.', true);
        return;
    }

    var cached = window.QURAN_WORD_DATA.timing.data(reciter.qdcId, surah);
    if (cached && quranFollowState.surah === surah && quranFollowState.loadedReciter === reciter.slug) {
        fn(engine, cached);
        return;
    }

    quranFollowSetStatus('Loading ' + reciter.name + ' — surah ' + surah + '…');
    quranFollowUpdateBar();
    window.QURAN_WORD_DATA.timing.ensure(reciter.qdcId, surah).then(function(data) {
        quranFollowState.surah = surah;
        quranFollowState.loadedReciter = reciter.slug;
        quranFollowState.approximate = data.verseTimings.some(function(t) { return t.approximate; });
        // V62.2: say exactly HOW the timing was derived, per reciter, instead
        // of one catch-all "approximated from Alafasy" message that was wrong
        // whenever the reference was unavailable and the estimate came from
        // the verse text.
        quranFollowState.timingQuality = quranFollowTimingQuality(data.verseTimings);
        engine.loadChapterAudio(data);
        engine.setSpeed(quranFollowState.speed);
        engine.setRepeatMode(quranFollowState.repeat);
        if (quranFollowState.repeat !== 'none') engine.setRepeatCount(Infinity);
        quranFollowSetStatus(quranFollowTimingMessage(quranFollowState.timingQuality, reciter));
        fn(engine, data);
    }).catch(function() {
        quranFollowSetStatus('Could not load word-timed audio. This layer streams from Quran.com infrastructure and needs internet access.', true);
        quranFollowUpdateBar();
    });
}

// ---------- Public controls (wired from the Read tab) ----------

function quranFollowAlongPlayPause() {
    var engine = quranFollowEnsureEngine();
    if (engine && quranFollowState.playback === 'playing') {
        engine.pause();
        return;
    }
    var surah = quranReadState.surah;
    if (engine && quranFollowState.playback === 'paused' && quranFollowState.surah === surah) {
        engine.play();
        return;
    }
    quranFollowWithChapter(surah, function(eng) { eng.play(0); });
}

function quranFollowAlongPlayFrom(surah, ayah) {
    if (quranReadState.layoutMode === 'mushaf' && typeof quranMushafGoToVerse === 'function') {
        quranMushafGoToVerse(surah, ayah, { highlight: false });
    } else if (surah !== quranReadState.surah && typeof quranReadGoSurah === 'function') {
        quranReadGoSurah(surah);
    }
    quranFollowWithChapter(surah, function(eng) {
        eng.playByKey(surah + ':' + ayah);
    });
}

function quranFollowAlongStop() {
    if (quranFollowEngine) quranFollowEngine.stop();
    quranFollowState.verseKey = null;
    quranFollowState.wordPosition = null;
    quranFollowClearHighlights();
    quranFollowSetStatus('');
    quranFollowUpdateBar();
}

function quranFollowAlongPrev() {
    if (quranFollowEngine) quranFollowEngine.prevVerse();
}

function quranFollowAlongNext() {
    if (quranFollowEngine) quranFollowEngine.nextVerse();
}

function quranFollowAlongSetReciter(slug) {
    if (!quranFollowReciterBySlug(slug)) return;
    var wasActive = quranFollowState.playback === 'playing' || quranFollowState.playback === 'paused';
    var resumeKey = quranFollowState.verseKey;
    quranFollowState.reciter = slug;
    quranFollowState.surah = null; // force reload with the new reciter
    quranFollowSavePreferences();
    if (quranFollowEngine) quranFollowEngine.stop();
    quranFollowClearHighlights();
    quranFollowUpdateBar();
    if (wasActive && resumeKey) {
        var parts = resumeKey.split(':');
        quranFollowAlongPlayFrom(Number(parts[0]), Number(parts[1]));
    }
}

function quranFollowAlongSetSpeed(value) {
    var speed = Number(value);
    if (QURAN_FOLLOW_SPEEDS.indexOf(speed) === -1) return;
    quranFollowState.speed = speed;
    quranFollowSavePreferences();
    if (quranFollowEngine) quranFollowEngine.setSpeed(speed);
    quranFollowUpdateBar();
}

function quranFollowAlongSetRepeat(mode) {
    if (mode !== 'none' && mode !== 'verse' && mode !== 'surah') return;
    quranFollowState.repeat = mode;
    quranFollowSavePreferences();
    if (quranFollowEngine) {
        quranFollowEngine.setRepeatMode(mode);
        quranFollowEngine.setRepeatCount(mode === 'none' ? 1 : Infinity);
    }
    quranFollowUpdateBar();
}

function quranFollowAlongToggleAutoScroll(checked) {
    quranFollowState.autoScroll = Boolean(checked);
    quranFollowSavePreferences();
}

// ---------- DOM: highlights, scroll, bar ----------

function quranFollowClearHighlights() {
    document.querySelectorAll('.word-audio-active').forEach(function(el) {
        el.classList.remove('word-audio-active');
    });
    document.querySelectorAll('.verse-audio-active').forEach(function(el) {
        el.classList.remove('verse-audio-active');
    });
}

function quranFollowApplyVerseHighlight() {
    document.querySelectorAll('.verse-audio-active').forEach(function(el) {
        el.classList.remove('verse-audio-active');
    });
    var key = quranFollowState.verseKey;
    if (!key) return;
    var parts = key.split(':');
    var anchor = document.getElementById('qv-' + parts[0] + '-' + parts[1]);
    var card = null;
    if (anchor) {
        card = anchor.classList && (anchor.classList.contains('quran-verse-card') || anchor.classList.contains('quran-page-passage') || anchor.classList.contains('quran-mushaf-ayah'))
            ? anchor
            : (anchor.closest ? anchor.closest('.quran-verse-card, .quran-page-passage, .quran-mushaf-ayah') : null);
    }
    if (card) {
        card.classList.add('verse-audio-active');
        if (quranFollowState.autoScroll && typeof card.scrollIntoView === 'function') {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    var barVerse = document.getElementById('quranFollowVerseLabel');
    if (barVerse) barVerse.textContent = key;
}

function quranFollowApplyWordHighlight() {
    document.querySelectorAll('.word-audio-active').forEach(function(el) {
        el.classList.remove('word-audio-active');
    });
    var key = quranFollowState.verseKey;
    var pos = quranFollowState.wordPosition;
    if (!key || pos == null) return;
    var span = document.querySelector('[data-qverse="' + key + '"] [data-qword="' + pos + '"]');
    if (span) span.classList.add('word-audio-active');
}

// Re-apply highlights after the reader re-renders (called from renderQuranRead).
function quranFollowAfterReaderRender() {
    if (quranFollowState.playback === 'playing' || quranFollowState.playback === 'paused') {
        quranFollowApplyVerseHighlight();
        quranFollowApplyWordHighlight();
    }
}

function quranFollowSetStatus(message, isError) {
    quranFollowState.statusMessage = message || '';
    quranFollowState.statusIsError = Boolean(isError);
    var el = document.getElementById('quranFollowStatus');
    if (el) {
        el.textContent = quranFollowState.statusMessage;
        el.className = 'quran-follow-status' + (isError ? ' is-error' : '');
    }
}

function quranFollowUpdateProgress(currentMs, durationMs) {
    var bar = document.getElementById('quranFollowProgressFill');
    if (bar) {
        var pct = durationMs > 0 ? Math.min(100, (currentMs / durationMs) * 100) : 0;
        bar.style.width = pct.toFixed(1) + '%';
    }
    var label = document.getElementById('quranFollowTimeLabel');
    if (label) {
        label.textContent = quranFollowFormatTime(currentMs) + ' / ' + quranFollowFormatTime(durationMs);
    }
}

function quranFollowFormatTime(ms) {
    if (!isFinite(ms) || ms <= 0) return '0:00';
    var totalSeconds = Math.floor(ms / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function quranFollowUpdateBar() {
    var playBtn = document.getElementById('quranFollowPlayButton');
    if (playBtn) {
        var state = quranFollowState.playback;
        playBtn.textContent = state === 'playing' ? '⏸ Pause' : (state === 'loading' ? '… Loading' : '▶ Play surah');
        playBtn.disabled = state === 'loading';
    }
    var stopBtn = document.getElementById('quranFollowStopButton');
    if (stopBtn) stopBtn.disabled = quranFollowState.playback === 'idle';

    // V62.5: focus-mode transport. In focus view the whole follow bar is
    // hidden, so starting recitation from a meaning row's "Follow" button
    // left no way to stop it. This mirrors the transport state onto the
    // floating focus control.
    var focusPlay = document.getElementById('quranMushafFocusPlay');
    if (focusPlay) {
        var s = quranFollowState.playback;
        focusPlay.textContent = s === 'playing' ? '❚❚' : (s === 'loading' ? '…' : '▶');
        focusPlay.setAttribute('aria-label', s === 'playing' ? 'Pause recitation' : 'Play recitation');
        focusPlay.disabled = s === 'loading';
        focusPlay.dataset.state = s;
    }
    var focusStop = document.getElementById('quranMushafFocusStop');
    if (focusStop) focusStop.disabled = quranFollowState.playback === 'idle';
    var focusBar = document.getElementById('quranMushafFocusTransport');
    if (focusBar) focusBar.dataset.playback = quranFollowState.playback;
    var statusEl = document.getElementById('quranFollowStatus');
    if (statusEl) {
        statusEl.textContent = quranFollowState.statusMessage;
        statusEl.className = 'quran-follow-status' + (quranFollowState.statusIsError ? ' is-error' : '');
    }
}

// ==================== V62.2 — timing provenance ====================
// Quran.com publishes true word-level segments for only some reciters. For
// the rest the app derives them. Users need to know which they are looking
// at, because an estimated indicator drifts inside long verses.
//
//   exact     — the reciter's own QDC segments
//   blend     — Alafasy's segment shape rescaled, mixed with a text estimate
//   estimated — derived from the verse text alone (no reference available)
//   none      — no word timing at all; verse-level highlight only

var QURAN_TIMING_QUALITY_LABEL = {
    exact: 'Exact word timing',
    blend: 'Estimated word timing',
    estimated: 'Estimated word timing',
    none: 'Verse-level only'
};

function quranFollowTimingQuality(verseTimings) {
    var list = verseTimings || [];
    if (!list.length) return 'none';
    var withSegments = list.filter(function(t) { return t.segments && t.segments.length; });
    if (!withSegments.length) return 'none';
    if (!withSegments.some(function(t) { return t.approximate; })) return 'exact';
    var textOnly = withSegments.every(function(t) { return t.estimateSource === 'text'; });
    return textOnly ? 'estimated' : 'blend';
}

function quranFollowTimingMessage(quality, reciter) {
    var who = reciter && reciter.name ? reciter.name : 'This reciter';
    if (quality === 'exact') return 'Word-timed audio ready — exact segments for ' + who + '.';
    if (quality === 'blend') return 'Quran.com publishes no word segments for ' + who + '. The highlight is estimated from the Alafasy reference blended with the verse text, so it may drift inside long verses.';
    if (quality === 'estimated') return 'Quran.com publishes no word segments for ' + who + ', and the reference was unavailable. The highlight is estimated from the verse text alone.';
    return 'Audio ready. No word-level timing is available for ' + who + ' — the highlight follows whole verses.';
}

function quranFollowTimingChip() {
    var q = quranFollowState.timingQuality;
    if (!q) return '';
    return '<span class="quran-follow-timing-chip" data-quality="' + esc(q) + '" title="' +
        esc(quranFollowTimingMessage(q, quranFollowCurrentReciter())) + '">' +
        esc(QURAN_TIMING_QUALITY_LABEL[q] || q) + '</span>';
}

function quranFollowToggleButton(label, active, onclick, aria) {
    return '<button class="filter-btn ' + (active ? 'active' : '') + '" type="button" onclick="' + onclick + '" aria-pressed="' + (active ? 'true' : 'false') + '" aria-label="' + esc(aria || label) + '">' + esc(label) + '</button>';
}

// Transport bar markup for the Read tab (rendered by renderQuranRead).
function quranFollowRenderBar() {
    var reciters = quranFollowReciters();
    if (!reciters.length || !window.QURAN_WORD_DATA) return '';
    var current = quranFollowCurrentReciter();
    var options = reciters.map(function(r) {
        return '<option value="' + esc(r.slug) + '" ' + (current && r.slug === current.slug ? 'selected' : '') + '>' + esc(r.name) + '</option>';
    }).join('');
    var speedButtons = QURAN_FOLLOW_SPEEDS.map(function(s) {
        return quranFollowToggleButton(s + '×', quranFollowState.speed === s, 'quranFollowAlongSetSpeed(' + s + ')', 'Playback speed ' + s + 'x');
    }).join('');

    return '<section class="card quran-follow-bar" aria-label="Word-by-word follow-along audio">' +
        '<div class="quran-follow-head">' +
            '<div><span class="quran-follow-kicker">Follow along · word by word</span>' +
            '<span class="quran-follow-verse" id="quranFollowVerseLabel">' + esc(quranFollowState.verseKey || '—') + '</span></div>' +
            '<span class="quran-follow-source">' + quranFollowTimingChip() +
                '<span class="quran-follow-source-text">Timing &amp; stream: Quran.com (QDC) · adapted from Mahfuz</span></span>' +
        '</div>' +
        '<div class="quran-follow-controls">' +
            '<label class="quran-follow-reciter"><span>Reciter</span>' +
                '<select class="form-select" onchange="quranFollowAlongSetReciter(this.value)">' + options + '</select></label>' +
            '<div class="quran-follow-transport">' +
                '<button class="btn btn-secondary btn-sm" type="button" onclick="quranFollowAlongPrev()" aria-label="Previous verse">⏮</button>' +
                '<button class="btn btn-primary" type="button" id="quranFollowPlayButton" onclick="quranFollowAlongPlayPause()">▶ Play surah</button>' +
                '<button class="btn btn-secondary btn-sm" type="button" onclick="quranFollowAlongNext()" aria-label="Next verse">⏭</button>' +
                '<button class="btn btn-secondary btn-sm" type="button" id="quranFollowStopButton" onclick="quranFollowAlongStop()" ' + (quranFollowState.playback === 'idle' ? 'disabled' : '') + '>Stop</button>' +
            '</div>' +
        '</div>' +
        '<div class="quran-follow-options">' +
            '<div class="quran-option-group"><span class="quran-option-label">Speed</span>' +
                '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Playback speed">' + speedButtons + '</div></div>' +
            '<div class="quran-option-group"><span class="quran-option-label">Repeat</span>' +
                '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Repeat mode">' +
                    quranFollowToggleButton('Off', quranFollowState.repeat === 'none', "quranFollowAlongSetRepeat('none')", 'Repeat off') +
                    quranFollowToggleButton('Verse', quranFollowState.repeat === 'verse', "quranFollowAlongSetRepeat('verse')", 'Repeat current verse') +
                    quranFollowToggleButton('Surah', quranFollowState.repeat === 'surah', "quranFollowAlongSetRepeat('surah')", 'Repeat whole surah') +
                '</div></div>' +
            '<label class="quran-follow-check"><input type="checkbox" ' + (quranFollowState.autoScroll ? 'checked' : '') + ' onchange="quranFollowAlongToggleAutoScroll(this.checked)"> Auto-scroll to verse</label>' +
        '</div>' +
        '<div class="quran-follow-progress" aria-hidden="true"><div class="quran-follow-progress-fill" id="quranFollowProgressFill"></div></div>' +
        '<div class="quran-follow-meta"><span id="quranFollowTimeLabel">0:00 / 0:00</span>' +
            '<span class="quran-follow-status' + (quranFollowState.statusIsError ? ' is-error' : '') + '" id="quranFollowStatus" aria-live="polite">' + esc(quranFollowState.statusMessage || 'Streams one mp3 per surah with word timings. Internet required; reader text stays the stored StudyOS source.') + '</span></div>' +
    '</section>';
}

// ==================== Listen-tab word sync (approximate overlay) ====================
// The Listen tab keeps streaming its validated per-verse URLs. This overlay
// rescales QDC verse segments onto the playing element's real duration:
//   scaled = scaleSegments(verseRelativeSegments, 0, verseDurMs, 0, elementDurMs)
// Mapped editions (EDITION_TO_QDC) use their own reciter's segment shape;
// other Arabic editions borrow the Alafasy shape; non-Arabic editions and
// missing data simply show no moving indicator.

var quranListenSyncState = { rafId: null, player: null, verseKey: null, segments: null, lastPos: null };

function quranListenSyncQdcId(editionIdentifier, editionLanguage) {
    var map = (window.QURAN_WORD_AUDIO && window.QURAN_WORD_AUDIO.EDITION_TO_QDC) || {};
    if (map[editionIdentifier]) return map[editionIdentifier];
    if (editionLanguage === 'ar') return (window.QURAN_WORD_AUDIO && window.QURAN_WORD_AUDIO.FALLBACK_RECITER_ID) || 7;
    return null; // non-Arabic audio edition — no word sync
}

function quranListenSyncToggle(checked) {
    quranFollowState.listenSync = Boolean(checked);
    quranFollowSavePreferences();
    if (!quranFollowState.listenSync) quranListenSyncDetach();
    else if (typeof renderQuranListen === 'function') renderQuranListen();
}

function quranListenSyncDetach() {
    if (quranListenSyncState.rafId !== null) {
        cancelAnimationFrame(quranListenSyncState.rafId);
        quranListenSyncState.rafId = null;
    }
    quranListenSyncState.player = null;
    quranListenSyncState.segments = null;
    quranListenSyncState.lastPos = null;
    document.querySelectorAll('#quranListenRoot .word-audio-active').forEach(function(el) {
        el.classList.remove('word-audio-active');
    });
}

// Called after renderQuranListen paints; wires the current player element.
function quranListenSyncAttach(surah, ayah, editionIdentifier, editionLanguage) {
    quranListenSyncDetach();
    if (!quranFollowState.listenSync || !window.QURAN_WORD_DATA || !window.QURAN_AUDIO_ENGINE) return;

    var player = document.getElementById('quranAudioPlayer');
    if (!player) return;
    var qdcId = quranListenSyncQdcId(editionIdentifier, editionLanguage);
    var noteEl = document.getElementById('quranListenSyncNote');
    if (!qdcId) {
        if (noteEl) noteEl.textContent = 'Word highlight is unavailable for this audio edition.';
        return;
    }

    var verseKey = surah + ':' + ayah;
    quranListenSyncState.player = player;
    quranListenSyncState.verseKey = verseKey;

    window.QURAN_WORD_DATA.timing.ensure(qdcId, surah).then(function(data) {
        if (quranListenSyncState.player !== player || quranListenSyncState.verseKey !== verseKey) return;
        var timing = null;
        for (var i = 0; i < data.verseTimings.length; i++) {
            if (data.verseTimings[i].verseKey === verseKey) { timing = data.verseTimings[i]; break; }
        }
        if (!timing || !timing.segments.length) {
            if (noteEl) noteEl.textContent = 'No word timing available for this verse.';
            return;
        }
        var engineHelpers = window.QURAN_AUDIO_ENGINE;
        // Chapter-relative → verse-relative
        var verseRelative = timing.segments.map(function(seg) {
            return [seg[0], seg[1] - timing.from, seg[2] - timing.from];
        });
        var mapped = (window.QURAN_WORD_AUDIO && window.QURAN_WORD_AUDIO.EDITION_TO_QDC && window.QURAN_WORD_AUDIO.EDITION_TO_QDC[editionIdentifier]);
        if (noteEl) {
            // V62.2: name the actual derivation instead of always crediting
            // the Alafasy reference, which was wrong for text-only estimates.
            noteEl.textContent = (mapped && !timing.approximate)
                ? 'Word highlight: exact QDC timing rescaled to this stream.'
                : (timing.estimateSource === 'text'
                    ? 'Word highlight: estimated from the verse text — may drift inside long verses.'
                    : 'Word highlight: estimated (Alafasy timing shape blended with the verse text).');
        }

        var syncLoop = function() {
            if (quranListenSyncState.player !== player) return;
            if (!player.paused && isFinite(player.duration) && player.duration > 0) {
                var scaled = quranListenSyncState.segments;
                if (!scaled || quranListenSyncState.scaledFor !== player.duration) {
                    scaled = engineHelpers.scaleSegments(
                        verseRelative, 0, timing.to - timing.from, 0, player.duration * 1000);
                    quranListenSyncState.segments = scaled;
                    quranListenSyncState.scaledFor = player.duration;
                }
                var pos = engineHelpers.findWordPosition(scaled, player.currentTime * 1000);
                if (pos !== quranListenSyncState.lastPos) {
                    quranListenSyncState.lastPos = pos;
                    document.querySelectorAll('#quranListenRoot .word-audio-active').forEach(function(el) {
                        el.classList.remove('word-audio-active');
                    });
                    if (pos != null) {
                        var span = document.querySelector('#quranListenRoot [data-qverse="' + verseKey + '"] [data-qword="' + pos + '"]');
                        if (span) span.classList.add('word-audio-active');
                    }
                }
            }
            quranListenSyncState.rafId = requestAnimationFrame(syncLoop);
        };
        quranListenSyncState.rafId = requestAnimationFrame(syncLoop);
    }).catch(function() {
        if (noteEl) noteEl.textContent = 'Word timing could not be loaded (internet required); audio is unaffected.';
    });
}
