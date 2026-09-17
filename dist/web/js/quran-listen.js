// ==================== QURAN LISTEN (V56 — split from js/quran.js, audit R7) ====================
// Listen-tab: validated per-verse streaming (data/quran-audio.js references
// only), reciter/surah/ayah selection, auto-advance/repeat, and the V55
// word-highlight overlay attach. State lives in quranSession.listen
// (declared in js/quran.js as quranAudioState); shared helpers
// (quranVersesForSurah, quranSurahByNumber, quranTevhid*, esc, goTab) come
// from js/quran.js and core — call-time resolution, so file order among the
// Quran feature scripts does not matter.
// Sacred-text and audio-source rules are unchanged from V52/V54: no
// recitation URL is guessed; only stored references are used.

function quranAudioEditions() {
    return window.QURAN_AUDIO_EDITIONS || [];
}

function quranAudioEdition(identifier) {
    const editions = quranAudioEditions();
    return editions.find(function(item) { return item.identifier === identifier; }) ||
        editions.find(function(item) { return item.identifier === QURAN_AUDIO_DEFAULT_RECITER; }) ||
        editions[0] || null;
}

function quranAudioHasEdition(identifier) {
    return quranAudioEditions().some(function(item) { return item.identifier === identifier; });
}

function quranBuildAudioGlobalMap() {
    if (quranAudioGlobalMap) return quranAudioGlobalMap;
    quranAudioGlobalMap = Object.create(null);
    (window.QURAN_VERSES || []).forEach(function(verse, index) {
        quranAudioGlobalMap[verse.surah + ':' + verse.ayah] = index + 1;
    });
    return quranAudioGlobalMap;
}

function quranAudioGlobalNumber(surah, ayah) {
    return quranBuildAudioGlobalMap()[surah + ':' + ayah] || null;
}

function quranAudioUrl(identifier, globalAyah, bitrate) {
    const source = window.QURAN_AUDIO_SOURCE || {};
    const template = source.secureUrlTemplate || '';
    const selectedBitrate = parseInt(bitrate, 10) || 128;
    if (!identifier || !globalAyah || !template) return '';
    return template
        .replace('{bitrate}', String(selectedBitrate))
        .replace('{identifier}', encodeURIComponent(identifier))
        .replace('{ayah}', String(globalAyah));
}

function quranAudioLegacyUrl(identifier, globalAyah) {
    const source = window.QURAN_AUDIO_SOURCE || {};
    const template = source.legacySecureUrlTemplate || source.originalUrlTemplate || '';
    if (!identifier || !globalAyah || !template) return '';
    return template
        .replace(/^http:/, 'https:')
        .replace('{identifier}', encodeURIComponent(identifier))
        .replace('{ayah}', String(globalAyah));
}

function quranAudioSourceUrls(identifier, globalAyah) {
    const source = window.QURAN_AUDIO_SOURCE || {};
    const bitrates = Array.isArray(source.preferredBitrates) && source.preferredBitrates.length
        ? source.preferredBitrates
        : [128, 64, 192, 48, 40, 32];
    const urls = bitrates.map(function(bitrate) { return quranAudioUrl(identifier, globalAyah, bitrate); });
    const legacy = quranAudioLegacyUrl(identifier, globalAyah);
    if (legacy) urls.push(legacy);
    return urls.filter(function(url, index, all) {
        return Boolean(url) && all.indexOf(url) === index;
    });
}

function quranAudioSourceElements(identifier, globalAyah) {
    return quranAudioSourceUrls(identifier, globalAyah).map(function(url) {
        return '<source src="' + esc(url) + '" type="audio/mpeg">';
    }).join('');
}

function quranAudioCurrentVerse() {
    return (window.QURAN_VERSES || []).find(function(item) {
        return item.surah === quranAudioState.surah && item.ayah === quranAudioState.ayah;
    }) || null;
}

function quranAudioClampAyah() {
    const verses = quranVersesForSurah(quranAudioState.surah);
    if (!verses.length) {
        quranAudioState.surah = 1;
        quranAudioState.ayah = 1;
        return;
    }
    if (quranAudioState.ayah < 1) quranAudioState.ayah = 1;
    if (quranAudioState.ayah > verses.length) quranAudioState.ayah = verses.length;
}

function quranAudioTranslation(verse) {
    if (!verse) return '';
    const translations = window.QURAN_TRANSLATION_TEVHID || {};
    return translations[quranTevhidCanonicalKey(verse.surah, verse.ayah)] || '';
}

function quranAudioMeaningLabel(verse) {
    if (!verse) return '';
    return quranTevhidLabel(verse.surah, verse.ayah);
}

function quranAudioSetStatus(message, isError) {
    const status = document.getElementById('quranAudioStatus');
    if (!status) return;
    status.textContent = message || '';
    status.className = 'quran-audio-status' + (isError ? ' is-error' : '');
}

function quranAudioPlaybackFailureMessage(error) {
    const name = error && error.name ? String(error.name) : '';
    if (name === 'AbortError') return '';
    if (name === 'NotAllowedError') {
        return 'The browser blocked automatic playback. Press Play once; auto-advance will continue on the same player.';
    }
    if (name === 'NotSupportedError') {
        return 'This audio source could not be decoded or loaded. Try another reciter or check the connection.';
    }
    return 'Playback could not start. Check the internet connection and press Play again.';
}

function quranAudioPlayElement() {
    const player = document.getElementById('quranAudioPlayer');
    if (!player || typeof player.play !== 'function') return;
    let result;
    try {
        result = player.play();
    } catch (error) {
        const message = quranAudioPlaybackFailureMessage(error);
        if (message) quranAudioSetStatus(message, true);
        return;
    }
    if (result && typeof result.catch === 'function') {
        result.catch(function(error) {
            const message = quranAudioPlaybackFailureMessage(error);
            if (message) quranAudioSetStatus(message, true);
        });
    }
}

function quranAudioPlay(surah, ayah) {
    const surahNumber = parseInt(surah, 10);
    const ayahNumber = parseInt(ayah, 10);
    if (!surahNumber || !ayahNumber) return;
    quranAudioState.surah = surahNumber;
    quranAudioState.ayah = ayahNumber;
    quranAudioClampAyah();
    quranSaveAudioPreferences();
    quranAudioPendingAutoplay = true;
    renderQuranListen();
}

function quranListenOpen(surah, ayah) {
    quranAudioState.surah = parseInt(surah, 10) || 1;
    quranAudioState.ayah = parseInt(ayah, 10) || 1;
    quranAudioClampAyah();
    quranSaveAudioPreferences();
    quranAudioPendingAutoplay = true;
    goTab('quran', 'quranlisten');
}

function quranAudioSetReciter(identifier) {
    if (!quranAudioHasEdition(identifier)) return;
    quranAudioState.reciter = identifier;
    quranSaveAudioPreferences();
    renderQuranListen();
}

function quranAudioSetSurah(value) {
    const surah = parseInt(value, 10);
    if (!surah || surah < 1 || surah > 114) return;
    quranAudioState.surah = surah;
    quranAudioState.ayah = 1;
    quranSaveAudioPreferences();
    renderQuranListen();
}

function quranAudioSetAyah(value) {
    const ayah = parseInt(value, 10);
    if (!ayah) return;
    quranAudioState.ayah = ayah;
    quranAudioClampAyah();
    quranSaveAudioPreferences();
    renderQuranListen();
}

function quranAudioToggleAutoAdvance(checked) {
    quranAudioState.autoAdvance = Boolean(checked);
    quranSaveAudioPreferences();
}

function quranAudioToggleRepeat(checked) {
    quranAudioState.repeat = Boolean(checked);
    quranAudioState._repeatsDone = 0;
    quranSaveAudioPreferences();
    renderQuranListen();
}

// ==================== V62.2 — memorisation controls ====================
// The Listen tab had no speed control (the follow-along bar did) and only an
// infinite "Repeat verse" toggle. Both matter for hifz: slowing a reciter down
// is the usual way to learn a phrase, and the standard drill is "repeat this
// verse N times, then move on" — not "repeat forever until I intervene".

const QURAN_LISTEN_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];
const QURAN_LISTEN_REPEAT_COUNTS = [1, 3, 5, 7, 10, 0]; // 0 = until stopped

function quranAudioSetSpeed(value) {
    const speed = Number(value);
    if (!QURAN_LISTEN_SPEEDS.includes(speed)) return;
    quranAudioState.speed = speed;
    quranAudioApplySpeed();
    quranSaveAudioPreferences();
    renderQuranListen();
}

function quranAudioApplySpeed() {
    const player = document.getElementById('quranAudioPlayer');
    if (!player) return;
    const speed = Number(quranAudioState.speed) || 1;
    try { player.playbackRate = speed; } catch (_) {}
}

function quranAudioSetRepeatCount(value) {
    const count = Number(value);
    if (!QURAN_LISTEN_REPEAT_COUNTS.includes(count)) return;
    quranAudioState.repeatCount = count;
    quranAudioState._repeatsDone = 0;
    quranSaveAudioPreferences();
    renderQuranListen();
}

function quranAudioRepeatLabel(count) {
    if (count === 0) return 'Until stopped';
    return count + '×';
}

function quranAudioPrevious() {
    if (quranAudioState.ayah <= 1) return;
    quranAudioPlay(quranAudioState.surah, quranAudioState.ayah - 1);
}

function quranAudioNext() {
    const verses = quranVersesForSurah(quranAudioState.surah);
    if (quranAudioState.ayah >= verses.length) return;
    quranAudioPlay(quranAudioState.surah, quranAudioState.ayah + 1);
}

// Auto-advance must keep the same HTMLAudioElement. Rebuilding the Listen DOM
// creates a fresh player outside the original click gesture and browsers may
// reject its play() call under autoplay policy. This helper swaps only the
// sources and now-playing content, preserving the already-authorized player.
function quranAudioAdvanceInPlace(surah, ayah) {
    const player = document.getElementById('quranAudioPlayer');
    const surahNumber = parseInt(surah, 10);
    const ayahNumber = parseInt(ayah, 10);
    const verses = quranVersesForSurah(surahNumber);
    const verse = verses.find(function(item) { return item.ayah === ayahNumber; }) || null;

    if (!player || !verse) {
        quranAudioPlay(surahNumber, ayahNumber);
        return false;
    }

    const edition = quranAudioEdition(quranAudioState.reciter);
    const surahMeta = quranSurahByNumber(surahNumber);
    const globalAyah = quranAudioGlobalNumber(surahNumber, ayahNumber);
    if (!edition || !globalAyah) {
        quranAudioSetStatus('The next ayah audio reference could not be resolved.', true);
        return false;
    }

    quranAudioState.surah = surahNumber;
    quranAudioState.ayah = ayahNumber;
    quranSaveAudioPreferences();

    if (typeof quranListenSyncDetach === 'function') quranListenSyncDetach();

    // Keep the element identity; replace only its source children.
    if (typeof player.removeAttribute === 'function') player.removeAttribute('src');
    player.innerHTML = quranAudioSourceElements(edition.identifier, globalAyah);
    if (typeof player.load === 'function') player.load();

    const verseKey = verse.surah + ':' + verse.ayah;
    const meaningLabel = quranAudioMeaningLabel(verse);
    const translation = quranAudioTranslation(verse);
    const title = document.getElementById('quranAudioNowTitle');
    const meta = document.getElementById('quranAudioNowMeta');
    const arabic = document.getElementById('quranAudioCurrentArabic');
    const meaning = document.getElementById('quranAudioCurrentTranslation');
    const ayahSelect = document.getElementById('quranAudioAyahSelect');
    const previousButton = document.getElementById('quranAudioPreviousButton');
    const nextButton = document.getElementById('quranAudioNextButton');

    if (title) title.textContent = (surahMeta ? surahMeta.number + '. ' + surahMeta.englishName : String(surahNumber)) + ' · ' + ayahNumber;
    if (meta) meta.textContent = edition.englishName + ' · global ayah ' + globalAyah;
    if (arabic) {
        if (typeof arabic.setAttribute === 'function') arabic.setAttribute('data-qverse', verseKey);
        arabic.innerHTML = typeof quranRenderArabicWordsHtml === 'function'
            ? quranRenderArabicWordsHtml(verse, { script: 'uthmani', tajweed: false, clickable: true })
            : esc(verse.text);
    }
    if (meaning) {
        meaning.innerHTML = '<span>Tevhid Meali' + (meaningLabel !== verseKey ? ' · ' + esc(meaningLabel) : '') + '</span>' + esc(translation);
    }
    if (ayahSelect) ayahSelect.value = String(ayahNumber);
    if (previousButton) previousButton.disabled = ayahNumber <= 1;
    if (nextButton) nextButton.disabled = ayahNumber >= verses.length;

    if (document && typeof document.querySelectorAll === 'function') {
        document.querySelectorAll('#quranListenRoot .quran-audio-verse-row').forEach(function(row) {
            if (row.classList) row.classList.remove('is-current');
            const button = row.querySelector ? row.querySelector('.quran-audio-row-play') : null;
            if (button) button.textContent = '▷';
        });
    }
    const currentRow = document.getElementById('qa-' + verse.surah + '-' + verse.ayah);
    if (currentRow) {
        if (currentRow.classList) currentRow.classList.add('is-current');
        const currentButton = currentRow.querySelector ? currentRow.querySelector('.quran-audio-row-play') : null;
        if (currentButton) currentButton.textContent = '▶';
        if (typeof currentRow.scrollIntoView === 'function') {
            setTimeout(function() { currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80);
        }
    }

    if (typeof quranListenSyncAttach === 'function') {
        quranListenSyncAttach(verse.surah, verse.ayah, edition.identifier, edition.language);
    }

    quranAudioSetStatus('Loading ' + verseKey + '…', false);
    quranAudioPlayElement();
    return true;
}

function quranAudioEnded() {
    const player = document.getElementById('quranAudioPlayer');
    if (quranAudioState.repeat && player) {
        // V62.2: honour a finite repeat count, then fall through to the
        // normal auto-advance so a drill ends by moving on rather than
        // looping until the user notices.
        const target = Number(quranAudioState.repeatCount) || 0;
        quranAudioState._repeatsDone = (quranAudioState._repeatsDone || 0) + 1;
        if (target === 0 || quranAudioState._repeatsDone < target) {
            try { player.currentTime = 0; } catch (_) {}
            quranAudioSetStatus(target === 0
                ? 'Repeating ' + quranAudioState.surah + ':' + quranAudioState.ayah + ' (until stopped)'
                : 'Repeat ' + (quranAudioState._repeatsDone + 1) + ' of ' + target + ' · ' + quranAudioState.surah + ':' + quranAudioState.ayah, false);
            quranAudioPlayElement();
            return;
        }
        quranAudioState._repeatsDone = 0;
    }
    const verses = quranVersesForSurah(quranAudioState.surah);
    if (quranAudioState.autoAdvance && quranAudioState.ayah < verses.length) {
        quranAudioAdvanceInPlace(quranAudioState.surah, quranAudioState.ayah + 1);
        return;
    }
    quranAudioSetStatus(quranAudioState.ayah >= verses.length ? 'End of surah.' : 'Playback finished.', false);
}

function quranAudioHandlePlay() {
    // playbackRate resets whenever the element's source changes, so re-apply
    // it on every play rather than only when the speed control is used.
    quranAudioApplySpeed();
    const speed = Number(quranAudioState.speed) || 1;
    quranAudioSetStatus('Playing ' + quranAudioState.surah + ':' + quranAudioState.ayah +
        (speed !== 1 ? ' · ' + speed + '×' : ''), false);
}

function quranAudioHandleError() {
    quranAudioSetStatus('Audio could not be loaded from the source server. This release contains validated streaming references, not embedded MP3 files.', true);
}

function quranAudioOpenInReader() {
    goTab('quran', 'quranread');
    quranReadJumpTo(quranAudioState.surah, quranAudioState.ayah);
}

function quranRenderAudioEditionOptions(selected) {
    const editions = quranAudioEditions();
    const groups = [
        { label: 'Arabic recitations', items: editions.filter(function(item) { return item.language === 'ar'; }) },
        { label: 'Other-language audio', items: editions.filter(function(item) { return item.language !== 'ar'; }) }
    ];
    return groups.map(function(group) {
        if (!group.items.length) return '';
        return '<optgroup label="' + esc(group.label) + '">' + group.items.map(function(item) {
            const suffix = item.language === 'ar' ? '' : ' · ' + item.language.toUpperCase();
            return '<option value="' + esc(item.identifier) + '" ' + (item.identifier === selected ? 'selected' : '') + '>' + esc(item.englishName + suffix) + '</option>';
        }).join('') + '</optgroup>';
    }).join('');
}

function quranRenderAudioVerseRow(verse, currentVerse, translation) {
    const isCurrent = currentVerse && verse.surah === currentVerse.surah && verse.ayah === currentVerse.ayah;
    const combinedLabel = quranAudioMeaningLabel(verse);
    return '<article class="quran-audio-verse-row ' + (isCurrent ? 'is-current' : '') + '" id="qa-' + verse.surah + '-' + verse.ayah + '">' +
        '<button class="quran-audio-row-play" type="button" onclick="quranAudioPlay(' + verse.surah + ',' + verse.ayah + ')" aria-label="Play ' + verse.surah + ':' + verse.ayah + '">' + (isCurrent ? '▶' : '▷') + '</button>' +
        '<div class="quran-audio-row-content">' +
            '<div class="quran-audio-row-meta"><strong>' + esc(verse.surah + ':' + verse.ayah) + '</strong>' + (combinedLabel !== verse.surah + ':' + verse.ayah ? '<span>Meaning: ' + esc(combinedLabel) + '</span>' : '') + '</div>' +
            '<div class="quran-audio-row-arabic" dir="rtl" lang="ar">' + esc(verse.text) + '</div>' +
            '<div class="quran-audio-row-translation" lang="tr">' + esc(translation) + '</div>' +
        '</div>' +
    '</article>';
}

function renderQuranListen() {
    const root = document.getElementById('quranListenRoot');
    if (!root) return;

    // V56 (audit R9): heavy datasets lazy-load on first Quran use.
    if (typeof quranDataReady === 'function' && !quranDataReady()) {
        if (typeof quranDataStatus === 'function' && quranDataStatus() === 'error') {
            root.innerHTML = '<div class="card quran-load-error"><strong>Quran data files could not be loaded.</strong><p>Required files: data/quran-verses.js and data/quran-translations-tevhid.js. <button class="btn btn-secondary btn-sm" type="button" onclick="quranEnsureData(function(){renderQuranListen();})">Retry</button></p></div>';
            return;
        }
        root.innerHTML = '<div class="card quran-load-pending"><strong>Loading the Quran library…</strong><p>The verse and meal datasets load on first use so app startup stays fast.</p></div>';
        quranEnsureData(function() { renderQuranListen(); });
        return;
    }

    const editions = quranAudioEditions();
    const source = window.QURAN_AUDIO_SOURCE || {};
    const surahs = window.QURAN_SURAHS || [];
    const translations = window.QURAN_TRANSLATION_TEVHID || {};
    if (!editions.length || !(window.QURAN_VERSES || []).length || !surahs.length) {
        root.innerHTML = '<div class="card quran-load-error"><strong>Quran audio references did not load.</strong><p>Required file: data/quran-audio.js.</p></div>';
        return;
    }

    if (!quranAudioHasEdition(quranAudioState.reciter)) quranAudioState.reciter = QURAN_AUDIO_DEFAULT_RECITER;
    quranAudioClampAyah();
    const edition = quranAudioEdition(quranAudioState.reciter);
    const surah = quranSurahByNumber(quranAudioState.surah) || surahs[0];
    const surahVerses = quranVersesForSurah(surah.number);
    const verse = quranAudioCurrentVerse() || surahVerses[0];
    const globalAyah = quranAudioGlobalNumber(verse.surah, verse.ayah);
    const audioSources = quranAudioSourceElements(edition.identifier, globalAyah);
    const translation = quranAudioTranslation(verse);
    const meaningLabel = quranAudioMeaningLabel(verse);

    const surahOptions = surahs.map(function(item) {
        return '<option value="' + item.number + '" ' + (item.number === surah.number ? 'selected' : '') + '>' + esc(item.number + '. ' + item.englishName + ' (' + item.versesCount + ')') + '</option>';
    }).join('');
    const ayahOptions = surahVerses.map(function(item) {
        return '<option value="' + item.ayah + '" ' + (item.ayah === verse.ayah ? 'selected' : '') + '>' + item.ayah + '</option>';
    }).join('');
    const rows = surahVerses.map(function(item) {
        return quranRenderAudioVerseRow(item, verse, translations[quranTevhidCanonicalKey(item.surah, item.ayah)] || '');
    }).join('');

    root.innerHTML =
        '<div class="quran-audio-shell">' +
            '<section class="card quran-audio-toolbar" aria-label="Quran audio controls">' +
                '<div class="quran-audio-selectors">' +
                    '<label><span>Reciter / audio edition</span><select class="form-select" onchange="quranAudioSetReciter(this.value)">' + quranRenderAudioEditionOptions(edition.identifier) + '</select></label>' +
                    '<label><span>Surah</span><select class="form-select" onchange="quranAudioSetSurah(this.value)">' + surahOptions + '</select></label>' +
                    '<label class="quran-audio-ayah-select"><span>Ayah</span><select id="quranAudioAyahSelect" class="form-select" onchange="quranAudioSetAyah(this.value)">' + ayahOptions + '</select></label>' +
                '</div>' +
                '<div class="quran-audio-toggles">' +
                    '<label><input type="checkbox" ' + (quranAudioState.autoAdvance ? 'checked' : '') + ' onchange="quranAudioToggleAutoAdvance(this.checked)"> Auto-advance</label>' +
                    '<label><input type="checkbox" ' + (quranAudioState.repeat ? 'checked' : '') + ' onchange="quranAudioToggleRepeat(this.checked)"> Repeat verse</label>' +
                    (typeof quranListenSyncToggle === 'function' ? '<label><input type="checkbox" ' + (quranFollowState.listenSync ? 'checked' : '') + ' onchange="quranListenSyncToggle(this.checked)"> Word highlight</label>' : '') +
                '</div>' +
                // V62.2 memorisation row: playback speed + finite repeat count.
                '<div class="quran-audio-drill">' +
                    '<div class="quran-option-group"><span class="quran-option-label">Speed</span>' +
                        '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Playback speed">' +
                            QURAN_LISTEN_SPEEDS.map(function(s) {
                                return '<button class="filter-btn ' + ((Number(quranAudioState.speed) || 1) === s ? 'active' : '') + '" type="button" onclick="quranAudioSetSpeed(' + s + ')" aria-pressed="' + ((Number(quranAudioState.speed) || 1) === s ? 'true' : 'false') + '">' + s + '×</button>';
                            }).join('') +
                        '</div></div>' +
                    '<label class="quran-audio-repeat-count' + (quranAudioState.repeat ? '' : ' is-disabled') + '"><span>Repeat</span>' +
                        '<select class="form-select" onchange="quranAudioSetRepeatCount(this.value)" ' + (quranAudioState.repeat ? '' : 'disabled') + ' aria-label="How many times to repeat each verse">' +
                            QURAN_LISTEN_REPEAT_COUNTS.map(function(c) {
                                return '<option value="' + c + '" ' + ((Number(quranAudioState.repeatCount) || 0) === c ? 'selected' : '') + '>' + esc(quranAudioRepeatLabel(c)) + '</option>';
                            }).join('') +
                        '</select></label>' +
                '</div>' +
            '</section>' +
            '<section class="card quran-audio-now-playing">' +
                '<header class="quran-audio-now-head">' +
                    '<div><span class="quran-audio-kicker">Now playing</span><h3 id="quranAudioNowTitle">' + esc(surah.number + '. ' + surah.englishName + ' · ' + verse.ayah) + '</h3><p id="quranAudioNowMeta">' + esc(edition.englishName) + ' · global ayah ' + globalAyah + '</p></div>' +
                    '<button class="btn btn-secondary btn-sm" type="button" onclick="quranAudioOpenInReader()">Open in reader</button>' +
                '</header>' +
                '<div id="quranAudioCurrentArabic" class="quran-audio-current-arabic" dir="rtl" lang="ar" data-qverse="' + esc(verse.surah + ':' + verse.ayah) + '">' +
                    (typeof quranRenderArabicWordsHtml === 'function'
                        ? quranRenderArabicWordsHtml(verse, { script: 'uthmani', tajweed: false, clickable: true })
                        : esc(verse.text)) +
                '</div>' +
                (typeof quranListenSyncAttach === 'function' ? '<div class="quran-listen-sync-note" id="quranListenSyncNote" aria-live="polite"></div>' : '') +
                '<div id="quranAudioCurrentTranslation" class="quran-audio-current-translation" lang="tr"><span>Tevhid Meali' + (meaningLabel !== verse.surah + ':' + verse.ayah ? ' · ' + esc(meaningLabel) : '') + '</span>' + esc(translation) + '</div>' +
                '<audio id="quranAudioPlayer" class="quran-audio-player" controls preload="none" onended="quranAudioEnded()" onerror="quranAudioHandleError()" onplay="quranAudioHandlePlay()" onpause="quranAudioSetStatus(\'Paused\',false)">' + audioSources + '</audio>' +
                '<div class="quran-audio-transport">' +
                    '<button id="quranAudioPreviousButton" class="btn btn-secondary" type="button" onclick="quranAudioPrevious()" ' + (verse.ayah <= 1 ? 'disabled' : '') + '>← Previous</button>' +
                    '<button class="btn btn-primary" type="button" onclick="quranAudioPlayElement()">▶ Play</button>' +
                    '<button id="quranAudioNextButton" class="btn btn-secondary" type="button" onclick="quranAudioNext()" ' + (verse.ayah >= surahVerses.length ? 'disabled' : '') + '>Next →</button>' +
                '</div>' +
                '<div class="quran-audio-status" id="quranAudioStatus" aria-live="polite">Streaming with the database edition identifier through the official Al Quran Cloud CDN. Internet connection required.</div>' +
            '</section>' +
            '<section class="card quran-audio-source-note">' +
                '<strong>Audio source</strong><span>' + esc(String(source.audioReferenceCount || 0)) + ' validated verse-level references · ' + esc(String(source.audioEditionCount || editions.length)) + ' editions. The uploaded database contains URLs, not embedded MP3 files.</span>' +
                '<a href="data/quran-audio.validation.json" target="_blank" rel="noopener">Validation report</a>' +
            '</section>' +
            '<section class="card quran-audio-surah-list">' +
                '<header><div><h3>' + esc(surah.number + '. ' + surah.englishName) + '</h3><p>Select any verse to play it.</p></div><button class="btn btn-secondary btn-sm" type="button" onclick="quranAudioPlay(' + surah.number + ',1)">Play surah from start</button></header>' +
                '<div class="quran-audio-verse-list">' + rows + '</div>' +
            '</section>' +
        '</div>';

    if (quranAudioPendingAutoplay) {
        quranAudioPendingAutoplay = false;
        quranAudioPlayElement();
        const current = document.getElementById('qa-' + verse.surah + '-' + verse.ayah);
        if (current && typeof current.scrollIntoView === 'function') {
            setTimeout(function() { current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80);
        }
    }

    // V55: overlay the approximate word highlight onto the unchanged stream.
    if (typeof quranListenSyncAttach === 'function') {
        quranListenSyncAttach(verse.surah, verse.ayah, edition.identifier, edition.language);
    }
}
