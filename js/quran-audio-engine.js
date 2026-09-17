// ==================== QURAN AUDIO ENGINE (V55) ====================
// Vanilla-JS port of the Mahfuz audio engine
// (github.com/theilgaz/mahfuz — packages/audio-engine/src/index.ts, MIT).
// Framework-free: wraps two HTMLAudioElements and fires plain callbacks.
//
// Modes:
//   - Chapter mode: one mp3 for the whole surah + verseTimings
//     [{ verseKey, from, to, segments: [[wordPos, startMs, endMs], ...] }]
//     (chapter-relative milliseconds, from the QDC API).
//   - Verse mode: playlist of per-verse files [{ verseKey, url, segments }].
//
// The word indicator is driven by a requestAnimationFrame loop that binary-
// searches the segment array for the word containing audio.currentTime.
// Callbacks fire only when the value actually changes (word) or ~4x/sec
// (time), so DOM work stays tiny.
//
// StudyOS additions over the Mahfuz original:
//   - sanitizeSegments(): the live QDC API can return malformed rows
//     (observed on 1:3: one-element arrays like [1]); these are dropped and
//     the rest sorted, so the binary search always sees clean triples.
//   - Pure helpers exposed on window.QURAN_AUDIO_ENGINE for node tests.

(function(){
    'use strict';

    var AUDIO_CDN = 'https://audio.qurancdn.com/';

    function normalizeUrl(url) {
        if (!url) return '';
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return url;
        return AUDIO_CDN + String(url).replace(/^\//, '');
    }

    // Drop malformed segment rows, coerce to numeric triples, sort by start.
    function sanitizeSegments(segments) {
        if (!Array.isArray(segments)) return [];
        var clean = [];
        for (var i = 0; i < segments.length; i++) {
            var s = segments[i];
            if (!Array.isArray(s) || s.length < 3) continue;
            var pos = Number(s[0]);
            var start = Number(s[1]);
            var end = Number(s[2]);
            if (!isFinite(pos) || !isFinite(start) || !isFinite(end)) continue;
            if (end <= start) continue;
            clean.push([pos, start, end]);
        }
        clean.sort(function(a, b) { return a[1] - b[1]; });
        return clean;
    }

    // Binary search: word position whose [startMs, endMs) contains timeMs.
    // Falls back to the last passed segment (Mahfuz behavior) so the
    // indicator lingers on the previous word through short gaps.
    function findWordPosition(segments, timeMs) {
        var lo = 0;
        var hi = segments.length - 1;
        var result = null;
        while (lo <= hi) {
            var mid = (lo + hi) >>> 1;
            var seg = segments[mid];
            if (timeMs >= seg[1] && timeMs < seg[2]) return seg[0];
            if (timeMs < seg[1]) {
                hi = mid - 1;
            } else {
                result = seg[0];
                lo = mid + 1;
            }
        }
        return result;
    }

    // Linearly rescale reference segments onto a target verse window.
    // (Mahfuz audio-service scaleSegments — the Tier-2 fallback.)
    function scaleSegments(referenceSegments, refFrom, refTo, targetFrom, targetTo) {
        var refDuration = refTo - refFrom;
        var targetDuration = targetTo - targetFrom;
        if (refDuration <= 0 || targetDuration <= 0) return [];
        var ratio = targetDuration / refDuration;
        var out = [];
        for (var i = 0; i < referenceSegments.length; i++) {
            var seg = referenceSegments[i];
            out.push([
                seg[0],
                Math.round(targetFrom + (seg[1] - refFrom) * ratio),
                Math.round(targetFrom + (seg[2] - refFrom) * ratio)
            ]);
        }
        return out;
    }

    // ============ V62.2 — text-derived word timing ============
    //
    // Why this exists. Quran.com (QDC) only publishes word-level segments for
    // a subset of reciters. For the rest, the app borrowed Mishary Alafasy's
    // segments and linearly rescaled them (scaleSegments above). That has two
    // failure modes, both of which users see as "the follow indicator doesn't
    // work for this reciter":
    //
    //   1. If the reference fetch fails there are NO segments at all, so the
    //      indicator simply never appears.
    //   2. Linear rescaling preserves Alafasy's RELATIVE pacing. That is a
    //      reasonable prior for another murattal reciter, but a poor one for
    //      mujawwad recitation, which stretches madd (elongation) far more
    //      than it stretches ordinary syllables. The indicator drifts within
    //      the verse even though it is correct at the verse boundaries.
    //
    // estimateSegmentsFromText derives a per-word duration weight from the
    // Arabic text itself, so every reciter can get an indicator, and
    // blendSegments mixes that weight with the reference reciter's observed
    // proportions. Both are pure functions — see tools/test-quran-v62-timing.js.

    // Arabic letters that carry elongation; these dominate duration variance
    // between reciters far more than plain letters do.
    var MADD_LETTERS = /[اويىٰۥۦ]/g;      // alif waw ya alif-maqsura + superscript
    var MADDA_MARKS = /[ٕٓٔ]/g;                                // maddah / hamza above-below
    var SHADDA = /ّ/g;
    var SUKUN = /ْ/g;
    var DIACRITICS = /[ً-ِْٰۖ-ۭ]/g;

    // Relative duration weight for one Arabic word. Tuned so that a bare
    // three-letter word ≈ 1.0 and a long madd word ≈ 2.5–3.0, which matches
    // the spread observed in QDC's own Alafasy segments.
    function wordDurationWeight(text) {
        var raw = String(text || '');
        if (!raw) return 1;
        var madd = (raw.match(MADD_LETTERS) || []).length;
        var madda = (raw.match(MADDA_MARKS) || []).length;
        var shadda = (raw.match(SHADDA) || []).length;
        var sukun = (raw.match(SUKUN) || []).length;
        var letters = raw.replace(DIACRITICS, '').replace(/\s/g, '').length;
        var weight = 0.55            // per-word onset/offset cost
            + letters * 0.28         // base articulation
            + madd * 0.42            // elongation
            + madda * 0.95           // obligatory/permissible madd is long
            + shadda * 0.30          // gemination
            + sukun * 0.10;          // closed syllable
        return weight > 0.2 ? weight : 0.2;
    }

    // Distribute [fromMs, toMs] across `words` proportionally to their text
    // weight. Returns segments in QDC shape: [position, startMs, endMs].
    function estimateSegmentsFromText(words, fromMs, toMs) {
        var list = Array.isArray(words) ? words : [];
        var span = Number(toMs) - Number(fromMs);
        if (!list.length || !isFinite(span) || span <= 0) return [];
        var weights = [];
        var total = 0;
        for (var i = 0; i < list.length; i++) {
            var w = wordDurationWeight(typeof list[i] === 'string' ? list[i] : (list[i] && list[i].textUthmani));
            weights.push(w);
            total += w;
        }
        if (total <= 0) return [];
        var out = [];
        var cursor = Number(fromMs);
        for (var j = 0; j < list.length; j++) {
            var slice = span * (weights[j] / total);
            var start = Math.round(cursor);
            var end = (j === list.length - 1) ? Math.round(Number(toMs)) : Math.round(cursor + slice);
            if (end <= start) end = start + 1;
            out.push([j + 1, start, end]);
            cursor += slice;
        }
        return out;
    }

    // Blend reference-derived segments with text-derived segments.
    // ratio 0 = pure reference (previous behaviour), 1 = pure text estimate.
    // Both inputs must cover the same window and the same word count.
    function blendSegments(referenceSegments, textSegments, ratio) {
        var refs = Array.isArray(referenceSegments) ? referenceSegments : [];
        var texts = Array.isArray(textSegments) ? textSegments : [];
        if (!refs.length) return texts;
        if (!texts.length) return refs;
        if (refs.length !== texts.length) return refs;
        var r = Math.max(0, Math.min(1, Number(ratio) || 0));
        var out = [];
        for (var i = 0; i < refs.length; i++) {
            var a = refs[i];
            var b = texts[i];
            var start = Math.round(a[1] * (1 - r) + b[1] * r);
            var end = Math.round(a[2] * (1 - r) + b[2] * r);
            if (end <= start) end = start + 1;
            // keep the sequence monotonic after rounding
            if (out.length && start < out[out.length - 1][2]) start = out[out.length - 1][2];
            if (end <= start) end = start + 1;
            out.push([a[0], start, end]);
        }
        return out;
    }

    function noop() {}

    // callbacks: { onPlaybackStateChange(state), onTimeUpdate(ms, durMs),
    //              onWordPositionChange(pos|null), onVerseChange(key, idx),
    //              onVerseEnd(key, idx), onError(err) }
    function QuranAudioEngine(callbacks) {
        var cb = callbacks || {};
        this.callbacks = {
            onPlaybackStateChange: cb.onPlaybackStateChange || noop,
            onTimeUpdate: cb.onTimeUpdate || noop,
            onWordPositionChange: cb.onWordPositionChange || noop,
            onVerseChange: cb.onVerseChange || noop,
            onVerseEnd: cb.onVerseEnd || noop,
            onError: cb.onError || noop
        };

        this.audio = new Audio();
        this.preloadAudio = new Audio();
        this.preloadAudio.preload = 'auto';
        this.preloadAudio.volume = 0;

        this.playlist = [];
        this._chapterMode = false;
        this._chapterTimings = [];
        this.currentIndex = -1;
        this.rafId = null;

        this._speed = 1;
        this._volume = 1;
        this._muted = false;
        this._repeatMode = 'none'; // none | verse | surah
        this._repeatCount = 1;
        this._repeatCounter = 0;
        this._destroyed = false;
        this._lastWordPosition = null;
        this._lastTimeUpdateMs = 0;

        var self = this;
        this._onEnded = function() { self.handleEnded(); };
        this._onError = function() {
            var mediaError = self.audio.error;
            self.callbacks.onError(new Error(mediaError && mediaError.message ? mediaError.message : 'Audio playback error'));
            self.callbacks.onPlaybackStateChange('idle');
        };
        this._onWaiting = function() { self.callbacks.onPlaybackStateChange('loading'); };
        this._onCanPlay = function() {
            if (!self.audio.paused) self.callbacks.onPlaybackStateChange('playing');
        };

        this.audio.addEventListener('ended', this._onEnded);
        this.audio.addEventListener('error', this._onError);
        this.audio.addEventListener('waiting', this._onWaiting);
        this.audio.addEventListener('canplay', this._onCanPlay);
    }

    // --- Loading ---

    QuranAudioEngine.prototype.loadPlaylist = function(verses) {
        this.stop();
        this._chapterMode = false;
        this._chapterTimings = [];
        this.playlist = (verses || []).map(function(v) {
            return { verseKey: v.verseKey, url: v.url, segments: sanitizeSegments(v.segments) };
        });
        this.currentIndex = -1;
        this._repeatCounter = 0;
    };

    QuranAudioEngine.prototype.loadChapterAudio = function(data) {
        this.stop();
        this._chapterMode = true;
        this._chapterTimings = ((data && data.verseTimings) || []).map(function(t) {
            return {
                verseKey: t.verseKey,
                from: Number(t.from) || 0,
                to: Number(t.to) || 0,
                segments: sanitizeSegments(t.segments)
            };
        });
        this.playlist = [];

        this.audio.src = normalizeUrl(data && data.audioUrl);
        this.audio.playbackRate = this._speed;
        this.audio.volume = this._volume;
        this.audio.muted = this._muted;
        this.audio.load();

        this.currentIndex = -1;
        this._repeatCounter = 0;
    };

    // --- Playback controls ---

    Object.defineProperty(QuranAudioEngine.prototype, 'totalVerses', {
        get: function() {
            return this._chapterMode ? this._chapterTimings.length : this.playlist.length;
        }
    });

    Object.defineProperty(QuranAudioEngine.prototype, 'currentVerseKey', {
        get: function() {
            if (this._chapterMode) {
                if (this.currentIndex >= 0 && this.currentIndex < this._chapterTimings.length) {
                    return this._chapterTimings[this.currentIndex].verseKey;
                }
                return null;
            }
            if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) {
                return this.playlist[this.currentIndex].verseKey;
            }
            return null;
        }
    });

    Object.defineProperty(QuranAudioEngine.prototype, 'currentVerseIndex', {
        get: function() { return this.currentIndex; }
    });

    QuranAudioEngine.prototype.play = function(startIndex) {
        if (this._chapterMode) {
            if (this.totalVerses === 0 && !this.audio.src) return Promise.resolve();
            return this.playChapterMode(startIndex);
        }
        if (this.totalVerses === 0) return Promise.resolve();
        return this.playVerseMode(startIndex);
    };

    QuranAudioEngine.prototype._resume = function() {
        var self = this;
        return this.audio.play().then(function() {
            self.callbacks.onPlaybackStateChange('playing');
            self.startWordSync();
        }).catch(function(err) {
            self.callbacks.onError(err instanceof Error ? err : new Error(String(err)));
        });
    };

    QuranAudioEngine.prototype.playChapterMode = function(startIndex) {
        var self = this;

        // No verse timings — raw playback, no verse/word sync (Tier 3).
        if (this._chapterTimings.length === 0) {
            if (!this.audio.src) return Promise.resolve();
            if (this.audio.paused && this.audio.currentTime > 0 && startIndex === undefined) {
                return this._resume();
            }
            this.audio.currentTime = 0;
            this.callbacks.onPlaybackStateChange('loading');
            return this._resume();
        }

        var idx = (startIndex !== undefined && startIndex !== null)
            ? startIndex
            : (this.currentIndex >= 0 ? this.currentIndex : 0);

        // Resuming the same verse without an explicit index → just resume.
        if (startIndex === undefined && idx === this.currentIndex && this.audio.paused && this.audio.src) {
            return this._resume();
        }

        var timing = this._chapterTimings[idx];
        if (!timing) return Promise.resolve();

        if (idx !== this.currentIndex) {
            this.currentIndex = idx;
            this.stopWordSync();
            this.callbacks.onWordPositionChange(null);
            this.callbacks.onVerseChange(timing.verseKey, idx);
            this.updateMediaSession(timing.verseKey);
        }

        this.audio.currentTime = timing.from / 1000;
        this.callbacks.onPlaybackStateChange('loading');
        return this._resume();
    };

    QuranAudioEngine.prototype.playVerseMode = function(startIndex) {
        var self = this;
        if (this.playlist.length === 0) return Promise.resolve();

        var idx = (startIndex !== undefined && startIndex !== null)
            ? startIndex
            : (this.currentIndex >= 0 ? this.currentIndex : 0);

        if (startIndex === undefined && idx === this.currentIndex && this.audio.src) {
            return this._resume();
        }

        if (idx !== this.currentIndex) this.loadVerse(idx);

        this.callbacks.onPlaybackStateChange('loading');
        return this._resume();
    };

    QuranAudioEngine.prototype.playByKey = function(verseKey) {
        var list = this._chapterMode ? this._chapterTimings : this.playlist;
        for (var i = 0; i < list.length; i++) {
            if (list[i].verseKey === verseKey) return this.play(i);
        }
        return Promise.resolve();
    };

    QuranAudioEngine.prototype.pause = function() {
        this.audio.pause();
        this.stopWordSync();
        this.callbacks.onPlaybackStateChange('paused');
    };

    QuranAudioEngine.prototype.stop = function() {
        this.audio.pause();
        try { this.audio.currentTime = 0; } catch (_) {}
        this.audio.removeAttribute('src');
        this.stopWordSync();
        this.currentIndex = -1;
        this._repeatCounter = 0;
        this.callbacks.onPlaybackStateChange('idle');
        this.callbacks.onWordPositionChange(null);
        this.callbacks.onTimeUpdate(0, 0);
    };

    QuranAudioEngine.prototype.seekTo = function(timeMs) {
        try { this.audio.currentTime = timeMs / 1000; } catch (_) {}
    };

    QuranAudioEngine.prototype.nextVerse = function() {
        if (this.currentIndex < this.totalVerses - 1) {
            this._repeatCounter = 0;
            return this.play(this.currentIndex + 1);
        }
        return Promise.resolve();
    };

    QuranAudioEngine.prototype.prevVerse = function() {
        if (this._chapterMode) {
            var timing = this._chapterTimings[this.currentIndex];
            var sinceStart = timing
                ? this.audio.currentTime - timing.from / 1000
                : this.audio.currentTime;
            if (sinceStart > 2 && this.currentIndex >= 0 && timing) {
                this.audio.currentTime = timing.from / 1000;
                return Promise.resolve();
            }
            if (this.currentIndex > 0) {
                this._repeatCounter = 0;
                return this.play(this.currentIndex - 1);
            }
            if (this.currentIndex === 0 && timing) {
                this.audio.currentTime = timing.from / 1000;
            }
            return Promise.resolve();
        }
        if (this.audio.currentTime > 2 && this.currentIndex >= 0) {
            this.audio.currentTime = 0;
            return Promise.resolve();
        }
        if (this.currentIndex > 0) {
            this._repeatCounter = 0;
            return this.play(this.currentIndex - 1);
        }
        if (this.currentIndex === 0) this.audio.currentTime = 0;
        return Promise.resolve();
    };

    // --- Settings ---

    QuranAudioEngine.prototype.setSpeed = function(speed) {
        this._speed = speed;
        this.audio.playbackRate = speed;
    };

    QuranAudioEngine.prototype.setVolume = function(volume) {
        this._volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this._volume;
    };

    QuranAudioEngine.prototype.setMuted = function(muted) {
        this._muted = Boolean(muted);
        this.audio.muted = this._muted;
    };

    QuranAudioEngine.prototype.setRepeatMode = function(mode) {
        this._repeatMode = mode === 'verse' || mode === 'surah' ? mode : 'none';
        this._repeatCounter = 0;
    };

    QuranAudioEngine.prototype.setRepeatCount = function(count) {
        this._repeatCount = Math.max(1, Number(count) || 1);
        this._repeatCounter = 0;
    };

    // --- Verse mode internals ---

    QuranAudioEngine.prototype.loadVerse = function(index) {
        if (index < 0 || index >= this.playlist.length) return;
        this.currentIndex = index;
        var verse = this.playlist[index];

        this.stopWordSync();
        this.callbacks.onWordPositionChange(null);
        this.callbacks.onVerseChange(verse.verseKey, index);

        this.audio.src = normalizeUrl(verse.url);
        this.audio.playbackRate = this._speed;
        this.audio.volume = this._volume;
        this.audio.muted = this._muted;
        this.audio.load();

        // Gapless-ish: preload the next verse while this one plays.
        if (index + 1 < this.playlist.length) {
            this.preloadAudio.src = normalizeUrl(this.playlist[index + 1].url);
            this.preloadAudio.load();
        }
        this.updateMediaSession(verse.verseKey);
    };

    // --- Ended handling ---

    QuranAudioEngine.prototype.handleEnded = function() {
        if (this._chapterMode) return this.handleChapterEnded();
        return this.handleVerseEnded();
    };

    QuranAudioEngine.prototype.handleChapterEnded = function() {
        this.stopWordSync();
        var idx = this.currentIndex;
        if (idx >= 0 && idx < this._chapterTimings.length) {
            this.callbacks.onVerseEnd(this._chapterTimings[idx].verseKey, idx);
        }
        if (this._repeatMode === 'surah') {
            this._repeatCounter++;
            if (this._repeatCounter < this._repeatCount || this._repeatCount === Infinity) {
                this.audio.currentTime = 0;
                this.currentIndex = 0;
                var first = this._chapterTimings[0];
                if (first) this.callbacks.onVerseChange(first.verseKey, 0);
                var self = this;
                this.audio.play().then(function() { self.startWordSync(); }).catch(noop);
                return;
            }
            this._repeatCounter = 0;
        }
        this.callbacks.onPlaybackStateChange('ended');
    };

    QuranAudioEngine.prototype.handleVerseEnded = function() {
        var idx = this.currentIndex;
        if (idx < 0 || idx >= this.playlist.length) return;

        this.stopWordSync();
        this.callbacks.onVerseEnd(this.playlist[idx].verseKey, idx);

        var self = this;
        if (this._repeatMode === 'verse') {
            this._repeatCounter++;
            if (this._repeatCounter < this._repeatCount) {
                this.audio.currentTime = 0;
                this.audio.play().then(function() { self.startWordSync(); }).catch(noop);
                return;
            }
            this._repeatCounter = 0;
        }

        if (idx < this.playlist.length - 1) {
            this.play(idx + 1);
        } else if (this._repeatMode === 'surah') {
            this._repeatCounter++;
            if (this._repeatCounter < this._repeatCount) {
                this.play(0);
                return;
            }
            this._repeatCounter = 0;
            this.callbacks.onPlaybackStateChange('ended');
        } else {
            this.callbacks.onPlaybackStateChange('ended');
        }
    };

    // --- Word-level sync (rAF loop) ---

    QuranAudioEngine.prototype.startWordSync = function() {
        this.stopWordSync();
        this._lastWordPosition = null;
        this._lastTimeUpdateMs = 0;
        var self = this;
        var tick = function() {
            if (self._destroyed) return;
            if (self._chapterMode) {
                self.syncChapter();
            } else {
                self.syncWord();
            }
            var nowMs = self.audio.currentTime * 1000;
            if (Math.abs(nowMs - self._lastTimeUpdateMs) >= 250) {
                self._lastTimeUpdateMs = nowMs;
                self.callbacks.onTimeUpdate(nowMs, self.audio.duration * 1000 || 0);
            }
            self.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
    };

    QuranAudioEngine.prototype.stopWordSync = function() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    };

    QuranAudioEngine.prototype.syncChapter = function() {
        if (this.currentIndex < 0 || this._chapterTimings.length === 0) return;

        var timeMs = this.audio.currentTime * 1000;
        var currentTiming = this._chapterTimings[this.currentIndex];

        if (timeMs >= currentTiming.to) {
            this.callbacks.onVerseEnd(currentTiming.verseKey, this.currentIndex);

            if (this._repeatMode === 'verse') {
                this._repeatCounter++;
                if (this._repeatCounter < this._repeatCount || this._repeatCount === Infinity) {
                    this.audio.currentTime = currentTiming.from / 1000;
                    return;
                }
                this._repeatCounter = 0;
            }

            if (this.currentIndex < this._chapterTimings.length - 1) {
                this.currentIndex++;
                var next = this._chapterTimings[this.currentIndex];
                this._lastWordPosition = null;
                this.callbacks.onWordPositionChange(null);
                this.callbacks.onVerseChange(next.verseKey, this.currentIndex);
                this.updateMediaSession(next.verseKey);
            }
            return;
        }

        if (currentTiming.segments && currentTiming.segments.length > 0) {
            var position = findWordPosition(currentTiming.segments, timeMs);
            if (position !== this._lastWordPosition) {
                this._lastWordPosition = position;
                this.callbacks.onWordPositionChange(position);
            }
        } else if (this._lastWordPosition !== null) {
            this._lastWordPosition = null;
            this.callbacks.onWordPositionChange(null);
        }
    };

    QuranAudioEngine.prototype.syncWord = function() {
        if (this.currentIndex < 0) return;
        var verse = this.playlist[this.currentIndex];
        if (!verse || !verse.segments || verse.segments.length === 0) {
            if (this._lastWordPosition !== null) {
                this._lastWordPosition = null;
                this.callbacks.onWordPositionChange(null);
            }
            return;
        }
        var timeMs = this.audio.currentTime * 1000;
        var position = findWordPosition(verse.segments, timeMs);
        if (position !== this._lastWordPosition) {
            this._lastWordPosition = position;
            this.callbacks.onWordPositionChange(position);
        }
    };

    // --- MediaSession (lock-screen / headset controls) ---

    QuranAudioEngine.prototype.updateMediaSession = function(verseKey) {
        if (!('mediaSession' in navigator)) return;
        var parts = String(verseKey || '').split(':');
        var self = this;
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Ayah ' + (parts[1] || ''),
                artist: 'StudyOS Quran',
                album: 'Surah ' + (parts[0] || '')
            });
            navigator.mediaSession.setActionHandler('play', function() { self.play(); });
            navigator.mediaSession.setActionHandler('pause', function() { self.pause(); });
            navigator.mediaSession.setActionHandler('previoustrack', function() { self.prevVerse(); });
            navigator.mediaSession.setActionHandler('nexttrack', function() { self.nextVerse(); });
        } catch (_) {
            // MediaSession is progressive enhancement only.
        }
    };

    // --- Cleanup ---

    QuranAudioEngine.prototype.destroy = function() {
        this._destroyed = true;
        this.stop();
        this.audio.removeEventListener('ended', this._onEnded);
        this.audio.removeEventListener('error', this._onError);
        this.audio.removeEventListener('waiting', this._onWaiting);
        this.audio.removeEventListener('canplay', this._onCanPlay);
        this.preloadAudio.removeAttribute('src');
        this.playlist = [];
        this._chapterTimings = [];
    };

    window.QURAN_AUDIO_ENGINE = {
        QuranAudioEngine: QuranAudioEngine,
        // Pure helpers, exposed for tools/test-quran-v55-follow.js.
        sanitizeSegments: sanitizeSegments,
        findWordPosition: findWordPosition,
        scaleSegments: scaleSegments,
        normalizeUrl: normalizeUrl,
        // V62.2 text-derived timing — see tools/test-quran-v62-timing.js
        wordDurationWeight: wordDurationWeight,
        estimateSegmentsFromText: estimateSegmentsFromText,
        blendSegments: blendSegments
    };
})();
