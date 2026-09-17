// ==================== QURAN WORD DATA (V55) ====================
// Data layer for the optional online word-level layers, adapted from Mahfuz
// (github.com/theilgaz/mahfuz, MIT): word-by-word meanings/transliteration,
// tajweed-annotated text, and QDC word timing data.
//
// Sacred-text integrity rules honoured here:
//   - quranSplitArabicWords() only ever RE-GROUPS the stored verse string.
//     It guarantees tokens.join(' ') === original text, character for
//     character, or returns null so the caller renders the untouched string.
//     Standalone waqf/secavend marks (U+06D6–U+06DC) are kept inside the
//     previous word's token with their ORIGINAL space, so nothing is
//     inserted, removed, or substituted. (Mahfuz's splitWords substitutes a
//     non-breaking space; StudyOS deliberately does not.)
//   - Word-by-word meanings and tajweed text are fetched from Quran.com and
//     are always labelled as that source in the UI. They never overwrite the
//     stored Arabic or the Tevhid Meali.
//   - Everything here is cached in memory for the session only.

(function(){
    'use strict';

    var WBW_API = 'https://api.quran.com/api/v4';
    var QDC_API = 'https://api.qurancdn.com/api/qdc';

    // ---------- Word splitting (integrity-preserving splitWords port) ----------

    var WAQF_ONLY_RE = /^[ۖ-ۜ]+$/;

    // Split verse text into word tokens for span rendering.
    // Returns null when the split cannot reproduce the original string
    // exactly (unusual whitespace) — callers must then render the plain text.
    function quranSplitArabicWords(text) {
        if (typeof text !== 'string' || !text.length) return null;
        var raw = text.split(' ');
        var tokens = [];
        for (var i = 0; i < raw.length; i++) {
            var part = raw[i];
            if (part === '') return null; // double/leading/trailing space — keep verbatim path
            if (WAQF_ONLY_RE.test(part) && tokens.length > 0) {
                // Keep the original U+0020 inside the previous token so the
                // pause mark cannot wrap to a new line (span is no-wrap) and
                // the joined string stays byte-identical.
                tokens[tokens.length - 1] += ' ' + part;
            } else {
                tokens.push(part);
            }
        }
        if (tokens.join(' ') !== text) return null;
        return tokens;
    }

    // ---------- Tajweed parser (Mahfuz tajweed-parser.tsx port, HTML-string output) ----------

    var TAJWEED_OPEN = '<tajweed class=';
    var TAJWEED_CLOSE = '</tajweed>';
    var TAJWEED_RULE_RE = /^[a-z_]+$/;

    function tajweedEsc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // The API wraps the verse-end numeral in <span class=end>…</span>.
    // StudyOS renders its own verse badges and its stored Arabic has no end
    // numeral, so strip it up front to keep word counts aligned.
    function quranTajweedStripEnd(html) {
        return String(html || '')
            .replace(/<span class=end>[\s\S]*?<\/span>/g, '')
            .replace(/\s+$/, '')
            .replace(/^\s+/, '');
    }

    function tajweedTokenize(html) {
        var tokens = [];
        var i = 0;
        while (i < html.length) {
            if (html.lastIndexOf(TAJWEED_OPEN, i) === i) {
                var gt = html.indexOf('>', i + TAJWEED_OPEN.length);
                if (gt === -1) { i++; continue; }
                var rule = html.slice(i + TAJWEED_OPEN.length, gt);
                tokens.push({ type: 'open', rule: TAJWEED_RULE_RE.test(rule) ? rule : 'unknown' });
                i = gt + 1;
                continue;
            }
            if (html.lastIndexOf(TAJWEED_CLOSE, i) === i) {
                tokens.push({ type: 'close' });
                i += TAJWEED_CLOSE.length;
                continue;
            }
            var j = i;
            while (j < html.length &&
                   html.lastIndexOf(TAJWEED_OPEN, j) !== j &&
                   html.lastIndexOf(TAJWEED_CLOSE, j) !== j) j++;
            var chunk = html.slice(i, j);
            var parts = chunk.split(/(\s+)/);
            for (var p = 0; p < parts.length; p++) {
                if (parts[p] === '') continue;
                if (/^\s+$/.test(parts[p])) tokens.push({ type: 'space' });
                else tokens.push({ type: 'text', text: parts[p] });
            }
            i = j;
        }
        return tokens;
    }

    // Tajweed HTML → array of per-word SAFE html strings, one per word.
    // Rules that straddle a word boundary are re-opened for the next word
    // (Mahfuz parseTajweedWords behavior). Standalone secavend marks are
    // attached to the previous word. Text is escaped; only span class
    // tajweed-<rule> markup is emitted.
    function quranTajweedWordsToHtml(rawHtml) {
        var html = quranTajweedStripEnd(rawHtml);
        var tokens = tajweedTokenize(html);
        var words = [];
        var currentWord = '';
        var currentText = '';
        var stack = [];

        function openTags() {
            var s = '';
            for (var i = 0; i < stack.length; i++) {
                s += '<span class="tajweed-' + stack[i] + '">';
            }
            return s;
        }

        function closeTags() {
            var s = '';
            for (var i = 0; i < stack.length; i++) s += '</span>';
            return s;
        }

        function finalizeWord() {
            var closed = currentWord + closeTags();
            if (currentText === '') {
                currentWord = openTags();
                return;
            }
            if (WAQF_ONLY_RE.test(currentText) && words.length > 0) {
                words[words.length - 1] += ' ' + closed;
            } else {
                words.push(closed);
            }
            currentWord = openTags();
            currentText = '';
        }

        currentWord = '';
        for (var t = 0; t < tokens.length; t++) {
            var tok = tokens[t];
            if (tok.type === 'open') {
                stack.push(tok.rule);
                currentWord += '<span class="tajweed-' + tok.rule + '">';
            } else if (tok.type === 'close') {
                if (stack.length > 0) {
                    stack.pop();
                    currentWord += '</span>';
                }
            } else if (tok.type === 'text') {
                currentWord += tajweedEsc(tok.text);
                currentText += tok.text;
            } else if (tok.type === 'space') {
                finalizeWord();
            }
        }
        finalizeWord();
        return words;
    }

    // Whole-verse tajweed HTML (safe) — join of the word pieces.
    function quranTajweedToHtml(rawHtml) {
        return quranTajweedWordsToHtml(rawHtml).join(' ');
    }

    // Plain text of a tajweed verse (markup stripped) — used for integrity
    // cross-checks in tests.
    function quranTajweedPlainText(rawHtml) {
        return quranTajweedStripEnd(rawHtml).replace(/<\/?tajweed[^>]*>/g, '');
    }

    // ---------- Session caches + async status ----------

    // status values: 'idle' | 'loading' | 'ready' | 'error'
    // V62.4 — durable cache bridge (js/quran-offline-cache.js).
    // Both helpers resolve rather than reject when the cache is unavailable,
    // so the live fetch path is never blocked by a storage problem.
    function quranCacheGet(kind, key) {
        var c = window.QURAN_OFFLINE_CACHE;
        if (!c) return Promise.resolve(null);
        return c.get(kind, key);
    }
    function quranCachePut(kind, key, data) {
        var c = window.QURAN_OFFLINE_CACHE;
        if (!c) return Promise.resolve(false);
        return c.put(kind, key, data);
    }

    var wbwCache = Object.create(null);      // 'surah:lang' -> {status, data: {verseKey: words[]}, error}
    var tajweedCache = Object.create(null);  // surah -> {status, data: {verseKey: html}, error}
    var timingCache = Object.create(null);   // 'reciterId:surah' -> {status, data: ChapterAudioData, error}
    var rawTimingCache = Object.create(null);// 'reciterId:surah' -> raw verse_timings (for the fallback scaler)
    var changeListeners = [];

    function notifyChange(kind, key) {
        for (var i = 0; i < changeListeners.length; i++) {
            try { changeListeners[i](kind, key); } catch (err) { console.error('quran-word-data listener failed', err); }
        }
    }

    function quranWordDataOnChange(listener) {
        if (typeof listener === 'function') changeListeners.push(listener);
    }

    function entryStatus(cache, key) {
        return cache[key] ? cache[key].status : 'idle';
    }

    // ---------- Word-by-word meanings (Quran.com v4, TR/EN) ----------

    function quranWbwStatus(surah, lang) {
        return entryStatus(wbwCache, surah + ':' + lang);
    }

    function quranWbwWords(surah, lang, verseKey) {
        var entry = wbwCache[surah + ':' + lang];
        if (!entry || entry.status !== 'ready') return null;
        return entry.data[verseKey] || null;
    }

    function quranWbwReset(surah, lang) {
        delete wbwCache[surah + ':' + lang];
    }

    // NOTE: a failed fetch stays 'error' until reset() — render paths may
    // call ensure() freely without triggering an offline refetch loop.
    function quranWbwEnsure(surah, lang) {
        var key = surah + ':' + lang;
        var existing = wbwCache[key];
        if (existing && existing.status !== 'idle') return;
        var entry = { status: 'loading', data: Object.create(null), error: null };
        wbwCache[key] = entry;
        notifyChange('wbw', key);

        var perPage = 50;

        function fetchPage(page) {
            var url = WBW_API + '/verses/by_chapter/' + surah +
                '?language=' + lang +
                // V62.2: audio_url added so a single word can be played on tap.
                '&words=true&word_fields=text_uthmani,translation,transliteration,audio_url' +
                '&word_translation_language=' + lang +
                '&per_page=' + perPage + '&page=' + page;
            return fetch(url).then(function(res) {
                if (!res.ok) throw new Error('Quran.com word API HTTP ' + res.status);
                return res.json();
            }).then(function(data) {
                var verses = data.verses || [];
                for (var v = 0; v < verses.length; v++) {
                    var verse = verses[v];
                    var words = [];
                    var apiWords = verse.words || [];
                    for (var w = 0; w < apiWords.length; w++) {
                        var word = apiWords[w];
                        if (word.char_type_name !== 'word') continue;
                        words.push({
                            position: Number(word.position),
                            textUthmani: word.text_uthmani || word.text || '',
                            translation: word.translation && word.translation.text ? word.translation.text : '',
                            translationLang: word.translation && word.translation.language_name ? String(word.translation.language_name).toLowerCase() : '',
                            transliteration: word.transliteration && word.transliteration.text ? word.transliteration.text : '',
                            audioUrl: word.audio_url || ''
                        });
                    }
                    entry.data[verse.verse_key] = words;
                }
                var totalPages = data.pagination && data.pagination.total_pages ? data.pagination.total_pages : 1;
                if (page < totalPages) return fetchPage(page + 1);
            });
        }

        // V62.4: durable cache first, network second. A surah fetched once
        // keeps working offline and survives the source API changing.
        quranCacheGet('wbw', key).then(function(cached) {
            if (cached) {
                entry.data = cached;
                entry.status = 'ready';
                entry.fromCache = true;
                notifyChange('wbw', key);
                return null;
            }
            return fetchPage(1).then(function() {
                entry.status = 'ready';
                notifyChange('wbw', key);
                quranCachePut('wbw', key, entry.data);
            });
        }).catch(function(err) {
            entry.status = 'error';
            entry.error = err && err.message ? err.message : String(err);
            notifyChange('wbw', key);
        });
    }

    // ---------- Tajweed text (Quran.com v4) ----------

    function quranTajweedStatus(surah) {
        return entryStatus(tajweedCache, String(surah));
    }

    function quranTajweedVerse(surah, verseKey) {
        var entry = tajweedCache[String(surah)];
        if (!entry || entry.status !== 'ready') return null;
        return entry.data[verseKey] || null;
    }

    function quranTajweedReset(surah) {
        delete tajweedCache[String(surah)];
    }

    // Same sticky-error rule as quranWbwEnsure (no offline refetch loops).
    function quranTajweedEnsure(surah) {
        var key = String(surah);
        var existing = tajweedCache[key];
        if (existing && existing.status !== 'idle') return;
        var entry = { status: 'loading', data: Object.create(null), error: null };
        tajweedCache[key] = entry;
        notifyChange('tajweed', key);

        var url = WBW_API + '/quran/verses/uthmani_tajweed?chapter_number=' + surah;
        // V62.4: durable cache first, network second.
        quranCacheGet('tajweed', key).then(function(cached) {
            if (cached) {
                entry.data = cached;
                entry.status = 'ready';
                entry.fromCache = true;
                notifyChange('tajweed', key);
                return null;
            }
            return fetch(url).then(function(res) {
                if (!res.ok) throw new Error('Quran.com tajweed API HTTP ' + res.status);
                return res.json();
            }).then(function(data) {
                var verses = data.verses || [];
                for (var i = 0; i < verses.length; i++) {
                    entry.data[verses[i].verse_key] = verses[i].text_uthmani_tajweed || '';
                }
                entry.status = 'ready';
                notifyChange('tajweed', key);
                quranCachePut('tajweed', key, entry.data);
            });
        }).catch(function(err) {
            entry.status = 'error';
            entry.error = err && err.message ? err.message : String(err);
            notifyChange('tajweed', key);
        });
    }

    // ---------- QDC timing data (chapter audio + word segments) ----------

    function registry() {
        return window.QURAN_WORD_AUDIO || {};
    }

    function fallbackReciterId() {
        return registry().FALLBACK_RECITER_ID || 7;
    }

    function fetchRawTimings(reciterId, surah) {
        var key = reciterId + ':' + surah;
        if (rawTimingCache[key]) return Promise.resolve(rawTimingCache[key]);
        var url = QDC_API + '/audio/reciters/' + reciterId + '/audio_files?chapter=' + surah + '&segments=true';
        return fetch(url).then(function(res) {
            if (!res.ok) throw new Error('QDC timing API HTTP ' + res.status);
            return res.json();
        }).then(function(data) {
            var file = data && data.audio_files && data.audio_files[0] ? data.audio_files[0] : null;
            if (!file) throw new Error('QDC timing API returned no audio file');
            rawTimingCache[key] = file;
            return file;
        });
    }

    // Tier-2 fallback: borrow the Alafasy segment shape, linearly rescaled to
    // each verse's duration (Mahfuz audio-service fillMissingSegments port).
    // V62.2 — how much to trust the text-derived estimate over the reference
    // reciter's proportions. Mujawwad recitation stretches madd far more than
    // murattal does, so its pacing diverges most from the Alafasy reference.
    var MUJAWWAD_QDC_IDS = { 1: true, 8: true };  // AbdulBaset & Minshawi (Mujawwad)
    function textBlendRatio(reciterId) {
        return MUJAWWAD_QDC_IDS[reciterId] ? 0.55 : 0.3;
    }

    // Split a verse into words for the text estimate. Uses the Quran.com word
    // layer when it is already cached, otherwise the local Uthmani verse text
    // — which ships with the app, so an estimate is always possible offline.
    function verseWordsForEstimate(surah, ayah) {
        var cachedLangs = ['tr', 'en'];
        for (var i = 0; i < cachedLangs.length; i++) {
            var words = quranWbwWords(surah, cachedLangs[i], surah + ':' + ayah);
            if (words && words.length) {
                return words.map(function(w) { return w.textUthmani || ''; });
            }
        }
        var verses = window.QURAN_VERSES || [];
        for (var v = 0; v < verses.length; v++) {
            if (verses[v].surah === surah && verses[v].ayah === ayah) {
                return quranSplitArabicWords(verses[v].text || '');
            }
        }
        return [];
    }

    // Guarantee every reciter can drive the follow indicator.
    //
    // Order of preference per verse:
    //   1. the reciter's own QDC segments (exact)
    //   2. the reference reciter's segments, rescaled and blended with a
    //      text-derived duration estimate (approximate)
    //   3. a pure text-derived estimate over the verse window (approximate)
    //
    // Step 3 is new: previously, if the reference fetch failed the verse ended
    // up with no segments at all and the indicator silently never appeared —
    // which is what users saw on Maher Al-Muaiqly, Saad Al-Ghamdi, both
    // Minshawi editions and Fatih Seferagic.
    function fillMissingSegments(timings, surah, reciterId) {
        var engine = window.QURAN_AUDIO_ENGINE;
        var hasSegments = timings.some(function(vt) { return vt.segments && vt.segments.length > 0; });
        if (hasSegments || reciterId === fallbackReciterId() || !engine) return Promise.resolve(timings);

        var ratio = textBlendRatio(reciterId);

        function estimateOnly(vt) {
            var parts = String(vt.verse_key || '').split(':');
            var words = verseWordsForEstimate(Number(parts[0]), Number(parts[1]));
            var segments = engine.estimateSegmentsFromText(words, vt.timestamp_from, vt.timestamp_to);
            if (!segments.length) return vt;
            return {
                verse_key: vt.verse_key,
                timestamp_from: vt.timestamp_from,
                timestamp_to: vt.timestamp_to,
                segments: segments,
                approximate: true,
                estimateSource: 'text'
            };
        }

        return fetchRawTimings(fallbackReciterId(), surah).then(function(refFile) {
            var refTimings = (refFile && refFile.verse_timings) || [];
            var refMap = Object.create(null);
            for (var i = 0; i < refTimings.length; i++) refMap[refTimings[i].verse_key] = refTimings[i];
            return timings.map(function(vt) {
                if (vt.segments && vt.segments.length > 0) return vt;
                var ref = refMap[vt.verse_key];
                if (!ref || !ref.segments || !ref.segments.length) return estimateOnly(vt);

                var scaled = engine.scaleSegments(
                    engine.sanitizeSegments(ref.segments),
                    ref.timestamp_from, ref.timestamp_to,
                    vt.timestamp_from, vt.timestamp_to
                );
                var parts = String(vt.verse_key || '').split(':');
                var words = verseWordsForEstimate(Number(parts[0]), Number(parts[1]));
                var estimated = engine.estimateSegmentsFromText(words, vt.timestamp_from, vt.timestamp_to);
                return {
                    verse_key: vt.verse_key,
                    timestamp_from: vt.timestamp_from,
                    timestamp_to: vt.timestamp_to,
                    segments: engine.blendSegments(scaled, estimated, ratio),
                    approximate: true,
                    estimateSource: estimated.length ? 'blend' : 'reference'
                };
            });
        }).catch(function() {
            // Reference unreachable — fall back to the local text estimate
            // rather than returning nothing.
            return timings.map(function(vt) {
                return (vt.segments && vt.segments.length > 0) ? vt : estimateOnly(vt);
            });
        });
    }

    function quranTimingStatus(reciterId, surah) {
        return entryStatus(timingCache, reciterId + ':' + surah);
    }

    function quranTimingData(reciterId, surah) {
        var entry = timingCache[reciterId + ':' + surah];
        return entry && entry.status === 'ready' ? entry.data : null;
    }

    // Resolves with ChapterAudioData {audioUrl, verseTimings:[{verseKey, from,
    // to, segments, approximate}]}; also cached for synchronous reads.
    function quranTimingEnsure(reciterId, surah) {
        var key = reciterId + ':' + surah;
        var existing = timingCache[key];
        if (existing && existing.status === 'loading') return existing.promise;
        if (existing && existing.status === 'ready') return Promise.resolve(existing.data);

        var entry = { status: 'loading', data: null, error: null, promise: null };
        timingCache[key] = entry;
        notifyChange('timing', key);

        // V62.4: durable cache first. Timings are the layer that makes the
        // follow-along indicator work, and they never change once published.
        entry.promise = quranCacheGet('timing', key).then(function(cached) {
            if (cached) {
                entry.status = 'ready';
                entry.data = cached;
                notifyChange('timing', key);
                return cached;
            }
            return quranTimingFetchAndStore(entry, key, reciterId, surah);
        }).catch(function(err) {
            entry.status = 'error';
            entry.error = err && err.message ? err.message : String(err);
            notifyChange('timing', key);
            throw err;
        });
        return entry.promise;
    }

    function quranTimingFetchAndStore(entry, key, reciterId, surah) {
        return fetchRawTimings(reciterId, surah).then(function(file) {
            return fillMissingSegments(file.verse_timings || [], surah, reciterId).then(function(timings) {
                var engine = window.QURAN_AUDIO_ENGINE;
                var data = {
                    audioUrl: file.audio_url,
                    // Raw duration as reported by the API (unit varies by
                    // reciter); playback duration always comes from the
                    // audio element itself, never from this field.
                    durationRaw: Number(file.duration) || 0,
                    verseTimings: timings.map(function(vt) {
                        return {
                            verseKey: vt.verse_key,
                            from: vt.timestamp_from,
                            to: vt.timestamp_to,
                            segments: engine ? engine.sanitizeSegments(vt.segments) : (vt.segments || []),
                            approximate: Boolean(vt.approximate),
                            // V62.2: how this verse's word timing was derived —
                            // '' exact | 'blend' | 'reference' | 'text'
                            estimateSource: vt.estimateSource || ''
                        };
                    })
                };
                entry.status = 'ready';
                entry.data = data;
                notifyChange('timing', key);
                quranCachePut('timing', key, data);
                return data;
            });
        });
    }

    function quranTimingError(reciterId, surah) {
        var entry = timingCache[reciterId + ':' + surah];
        return entry ? entry.error : null;
    }

    window.QURAN_WORD_DATA = {
        splitArabicWords: quranSplitArabicWords,
        tajweedWordsToHtml: quranTajweedWordsToHtml,
        tajweedToHtml: quranTajweedToHtml,
        tajweedPlainText: quranTajweedPlainText,
        tajweedStripEnd: quranTajweedStripEnd,
        onChange: quranWordDataOnChange,
        wbw: { ensure: quranWbwEnsure, status: quranWbwStatus, words: quranWbwWords, reset: quranWbwReset },
        tajweed: { ensure: quranTajweedEnsure, status: quranTajweedStatus, verse: quranTajweedVerse, reset: quranTajweedReset },
        timing: {
            ensure: quranTimingEnsure,
            status: quranTimingStatus,
            data: quranTimingData,
            error: quranTimingError
        }
    };
})();
