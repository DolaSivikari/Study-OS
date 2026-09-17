// ==================== QURAN (V58 — reader, Mushaf pages, study tools, audio, and validation) ====================
// Sacred-text integrity rule:
// - Arabic is displayed only from data/quran-verses.js.
// - Turkish meal is displayed only from data/quran-translations-tevhid.js,
//   deterministically extracted from the user-provided Tevhid Meali PDF.
// - This file never translates, paraphrases, corrects, or rewrites either text.
// - Search normalization operates on temporary copies only; displayed strings
//   always remain the stored source strings.
// - Audio paths are resolved only from data/quran-audio.js, extracted from the
//   user-provided Quran database. No recitation URL is guessed by the UI.
// - Quran quote validation compares temporary input against the stored QUL/
//   quran-validator reference data. It never overwrites input or source text.
// V55 optional online layers (adapted from Mahfuz, github.com/theilgaz/mahfuz,
// MIT; data from Quran.com — always labelled, never replacing stored sources):
// - Word spans only RE-GROUP the stored verse string; if the grouping cannot
//   reproduce it byte-for-byte, the untouched string is rendered instead.
// - Word-by-word meanings/transliteration, tajweed-annotated letters, and
//   word-level audio timing are fetched live, cached in memory, and labelled
//   "Quran.com" wherever shown. Registry: data/quran-word-audio.js.

// V56 (audit R6): reader state lives in the unified quranSession.read
// namespace (js/quran-session.js). The local name is kept so call sites are
// unchanged; the fallback literal only guards a failed session-script load.
const quranReadState = (window.quranSession && window.quranSession.read) || {
    surah: 1,
    ayah: null,
    script: 'uthmani', // display selection only; stored Arabic is never changed
    fontScale: 1,
    contentMode: 'both', // arabic | meaning | both | wbw (word by word)
    layoutMode: 'verse', // page (continuous) | verse; mushaf uses its own route
    standardLayoutMode: 'verse',
    font: 'scheherazade', // scheherazade | kfgqpc | naskh | system (V55)
    wbwLang: 'tr',       // tr | en — Quran.com word-meaning language (V55)
    showTajweed: false,  // tajweed letter coloring, Quran.com layer (V55)
    mushafPage: 1,
    mushafFitMode: 'fit',
    mushafAutoTurn: true,
    _scrollRestored: false
};

const QURAN_BASE_ARABIC_REM = 1.72;
const QURAN_BASE_TRANSLATION_REM = 1.02;
const QURAN_FONT_SCALE_MIN = 0.7;
const QURAN_FONT_SCALE_MAX = 2.0;
const QURAN_FONT_SCALE_STEP = 0.1;
const QURAN_MUSHAF_PAGE_MIN = 1;
const QURAN_MUSHAF_PAGE_MAX = 604;
const QURAN_PREFERENCE_KEY = K.quranReadPreferences;

let quranVersesByPage = null;
let quranMushafKeyboardBound = false;
let quranMushafTouchStart = null;

const QURAN_AUDIO_PREFERENCE_KEY = K.quranAudioPreferences;
const QURAN_AUDIO_DEFAULT_RECITER = 'ar.alafasy';
// V56 (audit R6): listen-tab state lives in quranSession.listen.
const quranAudioState = (window.quranSession && window.quranSession.listen) || {
    reciter: QURAN_AUDIO_DEFAULT_RECITER,
    surah: 1,
    ayah: 1,
    autoAdvance: true,
    repeat: false
};
let quranAudioGlobalMap = null;
let quranAudioPendingAutoplay = false;

(function quranLoadAudioPreferences() {
    const apply = function(saved) {
        const editions = window.QURAN_AUDIO_EDITIONS || [];
        if (editions.some(function(item) { return item.identifier === saved.reciter; })) {
            quranAudioState.reciter = saved.reciter;
        }
        const surah = parseInt(saved.surah, 10);
        const ayah = parseInt(saved.ayah, 10);
        if (surah >= 1 && surah <= 114) quranAudioState.surah = surah;
        if (ayah >= 1) quranAudioState.ayah = ayah;
        if (typeof saved.autoAdvance === 'boolean') quranAudioState.autoAdvance = saved.autoAdvance;
        if (typeof saved.repeat === 'boolean') quranAudioState.repeat = saved.repeat;
        // V62.2 memorisation controls.
        const listenSpeed = Number(saved.speed);
        if ([0.5, 0.75, 1, 1.25, 1.5].indexOf(listenSpeed) !== -1) quranAudioState.speed = listenSpeed;
        const repeatCount = Number(saved.repeatCount);
        if ([1, 3, 5, 7, 10, 0].indexOf(repeatCount) !== -1) quranAudioState.repeatCount = repeatCount;
    };
    try {
        if (typeof quranPrefsLoad === 'function') {
            quranPrefsLoad('listen', QURAN_AUDIO_PREFERENCE_KEY, apply);
        } else {
            apply(get(QURAN_AUDIO_PREFERENCE_KEY) || {});
        }
    } catch (_) {
        // Audio preferences are optional; source data is unaffected.
    }
})();

function quranSaveAudioPreferences() {
    const payload = {
        reciter: quranAudioState.reciter,
        surah: quranAudioState.surah,
        ayah: quranAudioState.ayah,
        autoAdvance: quranAudioState.autoAdvance,
        repeat: quranAudioState.repeat,
        // V62.2 memorisation controls.
        speed: quranAudioState.speed,
        repeatCount: quranAudioState.repeatCount
    };
    try {
        if (typeof quranPrefsSave === 'function') {
            quranPrefsSave('listen', QURAN_AUDIO_PREFERENCE_KEY, payload);
        } else {
            set(QURAN_AUDIO_PREFERENCE_KEY, payload);
        }
    } catch (_) {
        // Streaming remains usable when storage is unavailable.
    }
}

(function quranLoadPreferences() {
    const apply = function(saved) {
        if (saved.script === 'uthmani' || saved.script === 'simple') quranReadState.script = saved.script;
        if (saved.contentMode === 'arabic' || saved.contentMode === 'meaning' || saved.contentMode === 'both' || saved.contentMode === 'wbw') {
            quranReadState.contentMode = saved.contentMode;
        }
        if (saved.standardLayoutMode === 'page' || saved.standardLayoutMode === 'verse') {
            quranReadState.standardLayoutMode = saved.standardLayoutMode;
        }
        if (saved.layoutMode === 'page' || saved.layoutMode === 'verse') {
            quranReadState.layoutMode = saved.layoutMode;
            quranReadState.standardLayoutMode = saved.layoutMode;
        } else if (saved.layoutMode === 'mushaf') {
            // V58–V61 migration: Mushaf is now a dedicated route. Keep the
            // stored page but return the Quran tools page to its normal layout.
            quranReadState.layoutMode = quranReadState.standardLayoutMode || 'verse';
        }
        if (saved.font === 'scheherazade' || saved.font === 'kfgqpc' || saved.font === 'naskh' || saved.font === 'system') {
            quranReadState.font = saved.font;
        }
        if (saved.wbwLang === 'tr' || saved.wbwLang === 'en') quranReadState.wbwLang = saved.wbwLang;
        if (typeof saved.showTajweed === 'boolean') quranReadState.showTajweed = saved.showTajweed;
        const scale = Number(saved.fontScale);
        if (Number.isFinite(scale)) {
            quranReadState.fontScale = Math.max(QURAN_FONT_SCALE_MIN, Math.min(QURAN_FONT_SCALE_MAX, scale));
        }
        // V56 (audit R8): restore reading position (payload v2 fields).
        const surah = parseInt(saved.surah, 10);
        if (surah >= 1 && surah <= 114) quranReadState.surah = surah;
        const ayah = parseInt(saved.ayah, 10);
        if (ayah >= 1) quranReadState.ayah = ayah;
        const mushafPage = parseInt(saved.mushafPage, 10);
        if (mushafPage >= QURAN_MUSHAF_PAGE_MIN && mushafPage <= QURAN_MUSHAF_PAGE_MAX) {
            quranReadState.mushafPage = mushafPage;
        }
        if (saved.mushafFitMode === 'fit' || saved.mushafFitMode === 'readable') {
            quranReadState.mushafFitMode = saved.mushafFitMode;
        }
        if (typeof saved.mushafAutoTurn === 'boolean') quranReadState.mushafAutoTurn = saved.mushafAutoTurn;
        // V62.2: speak-word-on-tap.
        if (typeof saved.wordAudioOnTap === 'boolean') quranReadState.wordAudioOnTap = saved.wordAudioOnTap;
        if (quranReadState.contentMode === 'wbw' && quranReadState.layoutMode === 'mushaf') {
            quranReadState.contentMode = 'arabic';
        }
    };
    try {
        if (typeof quranPrefsLoad === 'function') {
            quranPrefsLoad('read', QURAN_PREFERENCE_KEY, apply);
        } else {
            apply(get(QURAN_PREFERENCE_KEY) || {});
        }
    } catch (_) {
        // Preferences are optional. Text data never depends on local storage.
    }
})();

function quranSavePreferences() {
    const payload = {
        script: quranReadState.script,
        fontScale: quranReadState.fontScale,
        contentMode: quranReadState.contentMode,
        layoutMode: quranReadState.layoutMode === 'mushaf' ? (quranReadState.standardLayoutMode || 'verse') : quranReadState.layoutMode,
        standardLayoutMode: quranReadState.standardLayoutMode || 'verse',
        font: quranReadState.font,
        wbwLang: quranReadState.wbwLang,
        showTajweed: quranReadState.showTajweed,
        // V56 (audit R8): persisted reading position.
        surah: quranReadState.surah,
        ayah: quranReadState.ayah,
        // V58: offline Mushaf page reader preferences.
        mushafPage: quranReadState.mushafPage,
        mushafFitMode: quranReadState.mushafFitMode,
        mushafAutoTurn: quranReadState.mushafAutoTurn,
        // V62.2: speak-word-on-tap.
        wordAudioOnTap: quranReadState.wordAudioOnTap
    };
    try {
        if (typeof quranPrefsSave === 'function') {
            quranPrefsSave('read', QURAN_PREFERENCE_KEY, payload);
        } else {
            set(QURAN_PREFERENCE_KEY, payload);
        }
    } catch (_) {
        // The reader remains fully usable when storage is unavailable.
    }
}

function quranReadAdjustFontSize(delta) {
    const next = Math.round((quranReadState.fontScale + delta) * 10) / 10;
    quranReadState.fontScale = Math.max(QURAN_FONT_SCALE_MIN, Math.min(QURAN_FONT_SCALE_MAX, next));
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranReadResetFontSize() {
    quranReadState.fontScale = 1;
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranVersesForSurah(surahNumber) {
    return (window.QURAN_VERSES || []).filter(function(v) { return v.surah === surahNumber; });
}

function quranEnsurePageIndex() {
    const verses = window.QURAN_VERSES || [];
    if (quranVersesByPage && (quranVersesByPage.size || !verses.length)) return quranVersesByPage;
    quranVersesByPage = new Map();
    verses.forEach(function(verse) {
        if (!quranVersesByPage.has(verse.page)) quranVersesByPage.set(verse.page, []);
        quranVersesByPage.get(verse.page).push(verse);
    });
    return quranVersesByPage;
}

function quranVersesForPage(pageNumber) {
    return quranEnsurePageIndex().get(pageNumber) || [];
}

function quranVerseByReference(surah, ayah) {
    return (window.QURAN_VERSES || []).find(function(verse) {
        return verse.surah === Number(surah) && verse.ayah === Number(ayah);
    }) || null;
}

function quranFirstPageForSurah(surahNumber) {
    const firstVerse = quranVerseByReference(surahNumber, 1) || quranVersesForSurah(surahNumber)[0];
    return firstVerse && firstVerse.page ? firstVerse.page : QURAN_MUSHAF_PAGE_MIN;
}

function quranSurahByNumber(surahNumber) {
    return (window.QURAN_SURAHS || []).find(function(s) { return s.number === surahNumber; }) || null;
}

function quranReadSetSurah(value) {
    const num = parseInt(value, 10);
    if (!num || num < 1 || num > 114) return;
    quranReadState.surah = num;
    quranReadState.ayah = null; // new surah — clear the verse anchor
    if (quranReadState.layoutMode === 'mushaf') quranReadState.mushafPage = quranFirstPageForSurah(num);
    quranSavePreferences();     // V56 (audit R8): persist position
    quranRenderReaderSurface();
}

function quranReadGoSurah(num) {
    if (num < 1 || num > 114) return;
    quranReadState.surah = num;
    quranReadState.ayah = null;
    if (quranReadState.layoutMode === 'mushaf') quranReadState.mushafPage = quranFirstPageForSurah(num);
    quranSavePreferences();     // V56 (audit R8): persist position
    quranRenderReaderSurface();
}

function quranReadSetScript(script) {
    if (script !== 'uthmani' && script !== 'simple') return;
    quranReadState.script = script;
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranReadSetContentMode(mode) {
    if (mode !== 'arabic' && mode !== 'meaning' && mode !== 'both' && mode !== 'wbw') return;
    if (quranReadState.layoutMode === 'mushaf' && mode === 'wbw') return;
    quranReadState.contentMode = mode;
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranReadSetFont(font) {
    if (font !== 'scheherazade' && font !== 'kfgqpc' && font !== 'naskh' && font !== 'system') return;
    quranReadState.font = font;
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranReadSetWbwLang(lang) {
    if (lang !== 'tr' && lang !== 'en') return;
    quranReadState.wbwLang = lang;
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranReadToggleTajweed(enabled) {
    quranReadState.showTajweed = Boolean(enabled);
    // Re-enabling after a failed fetch is an explicit retry.
    if (enabled && window.QURAN_WORD_DATA &&
        window.QURAN_WORD_DATA.tajweed.status(quranReadState.surah) === 'error') {
        window.QURAN_WORD_DATA.tajweed.reset(quranReadState.surah);
    }
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranReadSetLayoutMode(mode) {
    if (mode === 'mushaf') {
        quranOpenMushafReader();
        return;
    }
    if (mode !== 'page' && mode !== 'verse') return;
    quranReadState.layoutMode = mode;
    quranReadState.standardLayoutMode = mode;
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranMushafClampPage(page) {
    const number = parseInt(page, 10);
    if (!Number.isFinite(number)) return quranReadState.mushafPage || QURAN_MUSHAF_PAGE_MIN;
    return Math.max(QURAN_MUSHAF_PAGE_MIN, Math.min(QURAN_MUSHAF_PAGE_MAX, number));
}

function quranMushafGoToPage(page, options) {
    const opts = options || {};
    const nextPage = quranMushafClampPage(page);
    const verses = quranVersesForPage(nextPage);
    if (!verses.length) return;
    quranReadState.mushafPage = nextPage;
    quranReadState.surah = verses[0].surah;
    if (!opts.keepAyah) quranReadState.ayah = null;
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranMushafNextPage() {
    quranMushafGoToPage(quranReadState.mushafPage + 1);
}

function quranMushafPreviousPage() {
    quranMushafGoToPage(quranReadState.mushafPage - 1);
}

function quranMushafGoToVerse(surah, ayah, options) {
    const verse = quranVerseByReference(surah, ayah);
    if (!verse) return;
    quranReadState.layoutMode = 'mushaf';
    quranReadState.mushafPage = verse.page;
    quranReadState.surah = verse.surah;
    quranReadState.ayah = verse.ayah;
    if (quranReadState.contentMode === 'wbw') quranReadState.contentMode = 'arabic';
    quranSavePreferences();
    if (!quranDedicatedMushafActive() && typeof go === 'function') go('mushaf');
    else quranRenderReaderSurface();
    if (!options || options.highlight !== false) {
        setTimeout(function() { quranReadHighlightCurrentVerse('smooth'); }, 50);
    }
}

function quranMushafSetPageFromInput(value) {
    quranMushafGoToPage(value);
}

function quranMushafHandlePageInputKey(event) {
    if (event && event.key === 'Enter') {
        event.preventDefault();
        quranMushafSetPageFromInput(event.currentTarget.value);
    }
}

function quranMushafFitToViewport(mode) {
    if (mode !== 'fit' && mode !== 'readable') return;
    quranReadState.mushafFitMode = mode;
    quranSavePreferences();
    quranRenderReaderSurface();
}

function quranMushafToggleAutoTurn(enabled) {
    quranReadState.mushafAutoTurn = Boolean(enabled);
    quranSavePreferences();
}

function quranMushafHandleSwipe(direction) {
    if (direction === 'next') quranMushafNextPage();
    if (direction === 'previous') quranMushafPreviousPage();
}

// Arabic normalization for matching only. Never used for display.
function quranNormalizeArabic(str) {
    if (!str) return '';
    return String(str)
        .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, '')
        .replace(/ـ/g, '')
        .replace(/[آأإٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[ؤئ]/g, 'ء')
        .trim();
}

// Turkish/Latin normalization for matching only. This deliberately makes
// RAHIM match Rahîm by removing combining marks and folding I/İ/ı/i to i.
function quranNormalizeTurkish(str) {
    if (!str) return '';
    return String(str)
        .toLocaleLowerCase('tr-TR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ı/g, 'i')
        .trim();
}

function quranTevhidCombinedRange(surah, ayah) {
    const ranges = window.QURAN_TRANSLATION_TEVHID_COMBINED_RANGES || [];
    return ranges.find(function(range) {
        return range.surah === surah && ayah >= range.start && ayah <= range.end;
    }) || null;
}

function quranTevhidCanonicalKey(surah, ayah) {
    const range = quranTevhidCombinedRange(surah, ayah);
    return range ? range.surah + ':' + range.start : surah + ':' + ayah;
}

function quranTevhidLabel(surah, ayah) {
    const range = quranTevhidCombinedRange(surah, ayah);
    return range ? range.surah + ':' + range.start + '-' + range.end : surah + ':' + ayah;
}

function quranReadSearch(query) {
    const box = document.getElementById('quranSearchResults');
    if (!box) return;

    const raw = String(query || '').trim();
    if (raw.length < 2) {
        box.innerHTML = '';
        return;
    }

    const verses = window.QURAN_VERSES || [];
    const translations = window.QURAN_TRANSLATION_TEVHID || {};
    const qArabic = quranNormalizeArabic(raw);
    const qTurkish = quranNormalizeTurkish(raw);
    const seen = new Set();
    const matches = [];

    for (let i = 0; i < verses.length && matches.length < 40; i++) {
        const verse = verses[i];
        const key = verse.surah + ':' + verse.ayah;
        const canonicalKey = quranTevhidCanonicalKey(verse.surah, verse.ayah);
        if (seen.has(canonicalKey)) continue;

        const translation = translations[key] || '';
        const arabicMatch = qArabic && (
            quranNormalizeArabic(verse.text).indexOf(qArabic) !== -1 ||
            quranNormalizeArabic(verse.textSimple).indexOf(qArabic) !== -1
        );
        const turkishMatch = qTurkish && quranNormalizeTurkish(translation).indexOf(qTurkish) !== -1;

        if (arabicMatch || turkishMatch) {
            const range = quranTevhidCombinedRange(verse.surah, verse.ayah);
            const firstAyah = range ? range.start : verse.ayah;
            const firstVerse = verses.find(function(item) {
                return item.surah === verse.surah && item.ayah === firstAyah;
            }) || verse;
            matches.push({
                surah: verse.surah,
                ayah: verse.ayah,
                label: quranTevhidLabel(verse.surah, verse.ayah),
                arabic: firstVerse.text,
                translation: translations[canonicalKey] || translation
            });
            seen.add(canonicalKey);
        }
    }

    if (!matches.length) {
        box.innerHTML = '<div class="quran-search-empty">No matches in Arabic or Tevhid Meali.</div>';
        return;
    }

    box.innerHTML = '<div class="quran-search-results" role="list">' + matches.map(function(match) {
        const arabicSnippet = match.arabic.length > 110 ? match.arabic.slice(0, 110) + '…' : match.arabic;
        const translationSnippet = match.translation.length > 150 ? match.translation.slice(0, 150) + '…' : match.translation;
        return '<button class="quran-search-result" role="listitem" onclick="quranReadJumpTo(' + match.surah + ',' + match.ayah + ')">' +
            '<span class="quran-search-result-key">' + esc(match.label) + '</span>' +
            '<span class="quran-search-result-arabic" dir="rtl" lang="ar">' + esc(arabicSnippet) + '</span>' +
            '<span class="quran-search-result-translation" lang="tr">' + esc(translationSnippet) + '</span>' +
        '</button>';
    }).join('') + '</div>';
}

function quranReadJumpTo(surah, ayah) {
    const verse = quranVerseByReference(surah, ayah);
    if (!verse) return;
    quranReadState.surah = verse.surah;
    quranReadState.ayah = verse.ayah; // V56 (audit R8): remember the opened verse
    if (quranReadState.layoutMode === 'mushaf') quranReadState.mushafPage = verse.page;
    quranSavePreferences();
    quranRenderReaderSurface();

    const input = document.getElementById('quranSearchInput');
    if (input) input.value = '';
    const resultsBox = document.getElementById('quranSearchResults');
    if (resultsBox) resultsBox.innerHTML = '';

    setTimeout(function() { quranReadHighlightCurrentVerse('smooth'); }, 30);
}

function quranReadHighlightCurrentVerse(behavior) {
    if (!quranReadState.ayah) return;
    const target = document.getElementById('qv-' + quranReadState.surah + '-' + quranReadState.ayah);
    if (target) {
        target.scrollIntoView({ behavior: behavior || 'auto', block: 'center' });
        const card = target.classList && (target.classList.contains('quran-verse-card') || target.classList.contains('quran-page-passage') || target.classList.contains('quran-mushaf-ayah'))
            ? target
            : (target.closest ? target.closest('.quran-verse-card, .quran-page-passage, .quran-mushaf-ayah') : null);
        if (card && card.classList) {
            card.classList.add('is-highlighted');
            setTimeout(function() { card.classList.remove('is-highlighted'); }, 1800);
        }
    }
}

// V55: render the stored verse string as per-word spans so the follow-along
// indicator and word tooltips can target individual words. The split only
// RE-GROUPS the stored string; if the grouping is not byte-identical to the
// source, the untouched escaped string is rendered instead (integrity rule).
// opts: { script: 'uthmani'|'simple', tajweed: boolean, clickable: boolean }
function quranRenderArabicWordsHtml(verse, opts) {
    const options = opts || {};
    const script = options.script || quranReadState.script;
    const text = script === 'simple' ? verse.textSimple : verse.text;
    const wd = window.QURAN_WORD_DATA;
    if (!wd) return esc(text);

    const tokens = wd.splitArabicWords(text);
    if (!tokens) return esc(text);

    // Optional tajweed letter layer (Quran.com). Only used when the per-word
    // grouping aligns 1:1 with the stored tokenization; otherwise the stored
    // letters are shown and tajweed is silently skipped for this verse.
    let tajweedWords = null;
    if (options.tajweed && script === 'uthmani') {
        const raw = wd.tajweed.verse(verse.surah, verse.surah + ':' + verse.ayah);
        if (raw) {
            const parsed = wd.tajweedWordsToHtml(raw);
            if (parsed.length === tokens.length) tajweedWords = parsed;
        }
    }

    return tokens.map(function(token, i) {
        const inner = tajweedWords ? tajweedWords[i] : esc(token);
        const click = options.clickable
            ? ' onclick="quranWordTooltipShow(event,' + verse.surah + ',' + verse.ayah + ',' + (i + 1) + ')"'
            : '';
        return '<span class="quran-word' + (options.clickable ? ' quran-word-clickable' : '') + '" data-qword="' + (i + 1) + '"' + click + '>' + inner + '</span>';
    }).join(' ');
}

function quranRenderArabicBlock(verse, arabicSize, showOwnLabel) {
    const verseKey = verse.surah + ':' + verse.ayah;
    const wordsHtml = quranRenderArabicWordsHtml(verse, {
        script: quranReadState.script,
        tajweed: quranReadState.showTajweed,
        clickable: true
    });
    return '<div class="quran-arabic-panel">' +
        (showOwnLabel ? '<div class="quran-combined-ayah-label">' + esc(verseKey) + '</div>' : '') +
        '<div class="quran-arabic-text" dir="rtl" lang="ar" data-qverse="' + esc(verseKey) + '" style="font-size:' + arabicSize + 'rem;">' + wordsHtml + '</div>' +
    '</div>';
}

// V55: word-by-word reading mode — one card per word with the Quran.com
// Uthmani word form, transliteration, and TR/EN meaning. Clearly labelled;
// the stored StudyOS Arabic and Tevhid Meali remain untouched elsewhere.
function quranRenderWbwBlock(verse, arabicSize, translationSize, showOwnLabel) {
    const verseKey = verse.surah + ':' + verse.ayah;
    const wd = window.QURAN_WORD_DATA;
    const label = showOwnLabel ? '<div class="quran-combined-ayah-label">' + esc(verseKey) + '</div>' : '';
    if (!wd) {
        return '<div class="quran-arabic-panel">' + label +
            '<div class="quran-wbw-note is-error">Word data module did not load.</div></div>';
    }
    const lang = quranReadState.wbwLang;
    const status = wd.wbw.status(verse.surah, lang);
    if (status === 'loading' || status === 'idle') {
        return '<div class="quran-arabic-panel">' + label +
            '<div class="quran-wbw-note">Loading word-by-word data from Quran.com…</div></div>';
    }
    if (status === 'error') {
        return '<div class="quran-arabic-panel">' + label +
            '<div class="quran-wbw-note is-error">Word-by-word data could not be loaded (internet required). ' +
            '<button class="btn btn-secondary btn-sm" type="button" onclick="quranWbwRetry()">Retry</button></div></div>';
    }
    const words = wd.wbw.words(verse.surah, lang, verseKey);
    if (!words || !words.length) {
        return '<div class="quran-arabic-panel">' + label +
            '<div class="quran-wbw-note">No word-by-word entry for ' + esc(verseKey) + ' in the Quran.com dataset.</div></div>';
    }
    const cards = words.map(function(word) {
        return '<span class="quran-wbw-card" data-qword="' + word.position + '">' +
            '<span class="quran-wbw-arabic" lang="ar">' + esc(word.textUthmani) + '</span>' +
            (word.transliteration ? '<span class="quran-wbw-translit">' + esc(word.transliteration) + '</span>' : '') +
            '<span class="quran-wbw-meaning">' + (word.translation ? esc(word.translation) : '—') + '</span>' +
        '</span>';
    }).join('');
    return '<div class="quran-arabic-panel quran-wbw-panel">' + label +
        '<div class="quran-wbw-words" dir="rtl" data-qverse="' + esc(verseKey) + '" style="--quran-wbw-arabic-size:' + arabicSize + 'rem;--quran-wbw-meaning-size:' + translationSize + 'rem;">' + cards + '</div>' +
    '</div>';
}

function quranWbwRetry() {
    const wd = window.QURAN_WORD_DATA;
    if (wd) wd.wbw.reset(quranReadState.surah, quranReadState.wbwLang);
    quranRenderReaderSurface(); // render kicks off a fresh ensure()
}

function quranBuildSurahPassages(surahVerses, translations, sourcePages) {
    const renderedRanges = new Set();
    const passages = [];

    surahVerses.forEach(function(verse) {
        const range = quranTevhidCombinedRange(verse.surah, verse.ayah);
        const rangeId = range ? range.surah + ':' + range.start + '-' + range.end : null;
        if (rangeId && renderedRanges.has(rangeId)) return;
        if (rangeId) renderedRanges.add(rangeId);

        const groupedVerses = range
            ? surahVerses.filter(function(item) { return item.surah === range.surah && item.ayah >= range.start && item.ayah <= range.end; })
            : [verse];
        const canonicalKey = range ? range.surah + ':' + range.start : verse.surah + ':' + verse.ayah;
        const label = range ? range.surah + ':' + range.start + '-' + range.end : canonicalKey;
        const sourcePage = sourcePages[canonicalKey];
        const sourceHref = 'media/quran-reference/tevhid-meali.pdf' + (sourcePage ? '#page=' + sourcePage : '');

        passages.push({
            range: range,
            groupedVerses: groupedVerses,
            canonicalKey: canonicalKey,
            label: label,
            translation: translations[canonicalKey],
            sourcePage: sourcePage,
            sourceHref: sourceHref,
            sajda: groupedVerses.some(function(item) { return item.sajda; })
        });
    });

    return passages;
}

function quranRenderPassageAnchors(passage) {
    return passage.groupedVerses.slice(1).map(function(item) {
        return '<span class="quran-verse-anchor" id="qv-' + item.surah + '-' + item.ayah + '" aria-hidden="true"></span>';
    }).join('');
}

function quranRenderPassageBadges(passage) {
    return '<div><span class="quran-verse-key">' + esc(passage.label) + '</span>' +
        (passage.range ? '<span class="quran-combined-badge">Combined in source</span>' : '') +
        (passage.sajda ? '<span class="quran-sajda-badge">Sajda</span>' : '') + '</div>';
}

function quranRenderPassageActions(passage) {
    const first = passage.groupedVerses[0];
    const audioButtons = passage.groupedVerses.map(function(item) {
        const label = passage.groupedVerses.length > 1 ? 'Play ' + item.surah + ':' + item.ayah : 'Play verse';
        return '<button class="quran-inline-audio-btn" type="button" onclick="quranListenOpen(' + item.surah + ',' + item.ayah + ')" aria-label="' + esc(label) + '" title="' + esc(label) + '">▶' + (passage.groupedVerses.length > 1 ? ' ' + item.ayah : '') + '</button>';
    }).join('');
    const followButton = typeof quranFollowAlongPlayFrom === 'function' && first
        ? '<button class="quran-inline-audio-btn quran-follow-from-btn" type="button" onclick="quranFollowAlongPlayFrom(' + first.surah + ',' + first.ayah + ')" aria-label="Follow along from ' + first.surah + ':' + first.ayah + '" title="Follow along from here (word-by-word highlight)">▶ Follow</button>'
        : '';
    const studyButtons = typeof quranStudyRenderPassageActions === 'function'
        ? quranStudyRenderPassageActions(passage)
        : '';
    return '<div class="quran-passage-actions">' + audioButtons + followButton + studyButtons +
        '<a class="quran-source-link" href="' + passage.sourceHref + '" target="_blank" rel="noopener">Source' + (passage.sourcePage ? ' · p. ' + passage.sourcePage : '') + '</a>' +
    '</div>';
}

function quranRenderTranslation(passage, translationSize, className) {
    return '<div class="' + className + '" lang="tr" style="font-size:' + translationSize + 'rem;">' +
        (passage.translation ? esc(passage.translation) : '<span class="quran-missing-translation">Missing source text for ' + esc(passage.canonicalKey) + '</span>') +
    '</div>';
}

function quranRenderVerseLayout(passages, arabicSize, translationSize, showArabic, showMeaning) {
    const wbwMode = quranReadState.contentMode === 'wbw';
    return '<div class="quran-verse-list">' + passages.map(function(passage) {
        const firstVerse = passage.groupedVerses[0];
        const passageRefs = passage.groupedVerses.map(function(item) { return item.surah + ':' + item.ayah; }).join(',');
        return '<article class="quran-verse-card" id="qv-' + firstVerse.surah + '-' + firstVerse.ayah + '" data-quran-canonical="' + esc(passage.canonicalKey) + '" data-quran-refs="' + esc(passageRefs) + '">' +
            quranRenderPassageAnchors(passage) +
            '<header class="quran-verse-meta">' +
                quranRenderPassageBadges(passage) +
                quranRenderPassageActions(passage) +
            '</header>' +
            (wbwMode ? '<div class="quran-arabic-stack">' + passage.groupedVerses.map(function(item) {
                return quranRenderWbwBlock(item, arabicSize, translationSize, Boolean(passage.range));
            }).join('') + '</div>' : '') +
            (!wbwMode && showArabic ? '<div class="quran-arabic-stack">' + passage.groupedVerses.map(function(item) {
                return quranRenderArabicBlock(item, arabicSize, Boolean(passage.range));
            }).join('') + '</div>' : '') +
            (showMeaning ? quranRenderTranslation(passage, translationSize, 'quran-translation-panel') : '') +
        '</article>';
    }).join('') + '</div>';
}

function quranRenderPageLayout(passages, arabicSize, translationSize, showArabic, showMeaning) {
    const wbwMode = quranReadState.contentMode === 'wbw';
    return '<div class="quran-full-page quran-full-page-' + esc(quranReadState.contentMode) + '">' + passages.map(function(passage) {
        const firstVerse = passage.groupedVerses[0];
        const passageRefs = passage.groupedVerses.map(function(item) { return item.surah + ':' + item.ayah; }).join(',');
        return '<article class="quran-page-passage" id="qv-' + firstVerse.surah + '-' + firstVerse.ayah + '" data-quran-canonical="' + esc(passage.canonicalKey) + '" data-quran-refs="' + esc(passageRefs) + '">' +
            quranRenderPassageAnchors(passage) +
            '<header class="quran-page-passage-meta">' +
                quranRenderPassageBadges(passage) +
                quranRenderPassageActions(passage) +
            '</header>' +
            (wbwMode ? '<div class="quran-page-arabic-stack">' + passage.groupedVerses.map(function(item) {
                return quranRenderWbwBlock(item, arabicSize, translationSize, Boolean(passage.range));
            }).join('') + '</div>' : '') +
            (!wbwMode && showArabic ? '<div class="quran-page-arabic-stack">' + passage.groupedVerses.map(function(item) {
                return quranRenderArabicBlock(item, arabicSize, Boolean(passage.range));
            }).join('') + '</div>' : '') +
            (showMeaning ? quranRenderTranslation(passage, translationSize, 'quran-page-translation') : '') +
        '</article>';
    }).join('') + '</div>';
}

function quranMushafPageSummary(pageVerses) {
    const surahNumbers = [];
    const juzNumbers = [];
    const hizbNumbers = [];
    pageVerses.forEach(function(verse) {
        if (surahNumbers.indexOf(verse.surah) === -1) surahNumbers.push(verse.surah);
        if (juzNumbers.indexOf(verse.juz) === -1) juzNumbers.push(verse.juz);
        const rawHizb = Number(verse.hizb);
        const hizbNumber = rawHizb > 60 ? Math.ceil(rawHizb / 4) : rawHizb;
        if (hizbNumbers.indexOf(hizbNumber) === -1) hizbNumbers.push(hizbNumber);
    });
    const surahNames = surahNumbers.map(function(number) {
        const item = quranSurahByNumber(number);
        return item ? item.englishName : 'Surah ' + number;
    });
    return {
        surahNumbers: surahNumbers,
        surahNames: surahNames,
        juzLabel: juzNumbers.length > 1 ? juzNumbers[0] + '–' + juzNumbers[juzNumbers.length - 1] : String(juzNumbers[0] || '—'),
        hizbLabel: hizbNumbers.length > 1 ? hizbNumbers[0] + '–' + hizbNumbers[hizbNumbers.length - 1] : String(hizbNumbers[0] || '—')
    };
}

function quranMushafRenderSurahHeading(surahNumber, arabicSize) {
    const surah = quranSurahByNumber(surahNumber);
    if (!surah) return '';
    const basmalaSource = quranVerseByReference(1, 1);
    const basmala = basmalaSource
        ? (quranReadState.script === 'simple' ? basmalaSource.textSimple : basmalaSource.text)
        : '';
    return '<header class="quran-mushaf-surah-heading">' +
        '<span>' + esc(surah.number + '. ' + surah.englishName) + '</span>' +
        '<strong dir="rtl" lang="ar">' + esc(surah.name) + '</strong>' +
        (surahNumber !== 1 && surahNumber !== 9 && basmala
            ? '<div class="quran-mushaf-basmala" dir="rtl" lang="ar" style="font-size:' + Math.max(1.05, Number(arabicSize) * 0.76).toFixed(2) + 'rem;">' + esc(basmala) + '</div>'
            : '') +
    '</header>';
}

function quranMushafVerseTap(event, surah, ayah) {
    const now = Date.now();
    const key = surah + ':' + ayah;
    const last = quranReadState._mushafLastTap || { key: null, at: 0 };
    quranReadState._mushafLastTap = { key: key, at: now };
    if (last.key === key && now - last.at < 430) {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();
        quranMushafOpenVerseTools(surah, ayah);
    }
}

function quranMushafOpenVerseTools(surah, ayah) {
    quranReadState._mushafSelectedVerse = surah + ':' + ayah;
    quranReadState.surah = Number(surah);
    quranReadState.ayah = Number(ayah);
    quranSavePreferences();
    quranRenderReaderSurface();
    setTimeout(function() {
        const panel = document.getElementById('quranMushafVerseTools');
        if (panel && typeof panel.scrollIntoView === 'function') panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 30);
}

function quranMushafCloseVerseTools() {
    quranReadState._mushafSelectedVerse = null;
    quranRenderReaderSurface();
}

function quranRenderMushafArabicPage(pageVerses, arabicSize) {
    let previousSurah = null;
    const selected = quranReadState._mushafSelectedVerse;
    const content = pageVerses.map(function(verse) {
        let heading = '';
        if (verse.surah !== previousSurah && verse.ayah === 1) heading = quranMushafRenderSurahHeading(verse.surah, arabicSize);
        previousSurah = verse.surah;
        const key = verse.surah + ':' + verse.ayah;
        const wordsHtml = quranRenderArabicWordsHtml(verse, {
            script: quranReadState.script,
            tajweed: quranReadState.showTajweed,
            clickable: true
        });
        return heading + '<span class="quran-mushaf-ayah' + (selected === key ? ' is-selected' : '') + '" id="qv-' + verse.surah + '-' + verse.ayah + '" data-quran-refs="' + key + '" onclick="quranMushafVerseTap(event,' + verse.surah + ',' + verse.ayah + ')">' +
            '<span class="quran-mushaf-ayah-text" dir="rtl" lang="ar" data-qverse="' + key + '">' + wordsHtml + '</span>' +
            '<span class="quran-mushaf-ayah-number" aria-label="Verse ' + verse.ayah + '">﴿' + verse.ayah + '﴾</span>' +
        '</span>';
    }).join(' ');
    return '<div class="quran-mushaf-arabic" dir="rtl" lang="ar" style="font-size:' + arabicSize + 'rem;">' + content + '</div>';
}

function quranRenderMushafMeaning(passages, translationSize) {
    return '<div class="quran-mushaf-meaning-list">' + passages.map(function(passage) {
        const first = passage.groupedVerses[0];
        const refs = passage.groupedVerses.map(function(item) { return item.surah + ':' + item.ayah; }).join(',');
        return '<article class="quran-mushaf-meaning-row" id="qv-' + first.surah + '-' + first.ayah + '-meaning" data-quran-refs="' + esc(refs) + '">' +
            '<header>' + quranRenderPassageBadges(passage) + quranRenderPassageActions(passage) + '</header>' +
            quranRenderTranslation(passage, translationSize, 'quran-mushaf-translation') +
        '</article>';
    }).join('') + '</div>';
}

function quranRenderMushafVerseTools(pagePassages) {
    const selected = quranReadState._mushafSelectedVerse;
    if (!selected) return '';
    const parts = selected.split(':');
    const passage = pagePassages.find(function(item) {
        return item.groupedVerses.some(function(verse) {
            return verse.surah === Number(parts[0]) && verse.ayah === Number(parts[1]);
        });
    });
    if (!passage) return '';
    return '<aside class="quran-mushaf-verse-tools" id="quranMushafVerseTools" aria-label="Verse tools">' +
        '<div><strong>' + esc(selected) + '</strong><span>Verse tools</span></div>' +
        quranRenderPassageActions(passage) +
        '<button class="btn btn-secondary btn-sm" type="button" onclick="quranMushafCloseVerseTools()">Close</button>' +
    '</aside>';
}

function quranRenderMushafNavigation() {
    const page = quranReadState.mushafPage;
    // V62.5: page turning moved to the two bottom corners of the sheet, the
    // way you would actually turn a printed Mushaf. Nothing sits across the
    // middle of the page any more, so the last line of a page is never
    // covered. The page-jump field lives in the meta bar at the top.
    //
    // In RTL reading order the NEXT page is on the left and the PREVIOUS page
    // on the right, so the arrows are placed to match the script rather than
    // Latin convention.
    return '<nav class="quran-mushaf-navigation" aria-label="Mushaf page navigation">' +
        '<button class="quran-mushaf-turn quran-mushaf-turn-next" type="button" onclick="quranMushafNextPage()" aria-label="Next page" title="Next page (→)" ' + (page >= QURAN_MUSHAF_PAGE_MAX ? 'disabled' : '') + '>‹</button>' +
        '<button class="quran-mushaf-turn quran-mushaf-turn-prev" type="button" onclick="quranMushafPreviousPage()" aria-label="Previous page" title="Previous page (←)" ' + (page <= QURAN_MUSHAF_PAGE_MIN ? 'disabled' : '') + '>›</button>' +
    '</nav>';
}

function quranRenderMushafPage(pageVerses, pagePassages, arabicSize, translationSize) {
    const summary = quranMushafPageSummary(pageVerses);
    const mode = quranReadState.contentMode === 'meaning' ? 'meaning' : (quranReadState.contentMode === 'both' ? 'both' : 'arabic');
    const arabicPage = quranRenderMushafArabicPage(pageVerses, arabicSize);
    const meaningPage = quranRenderMushafMeaning(pagePassages, translationSize);
    let body = arabicPage;
    if (mode === 'meaning') body = meaningPage;
    if (mode === 'both') {
        // V63.1: on a wide screen the meaning sits BESIDE the sheet rather than
        // under it, so the Arabic keeps a whole page to itself. Below the
        // breakpoint the same markup stacks and behaves as the old drawer.
        body = '<div class="quran-mushaf-split">' +
            '<div class="quran-mushaf-split-page">' + arabicPage + '</div>' +
            '<details class="quran-mushaf-meaning-drawer" open><summary>Tevhid Meali for this page</summary>' + meaningPage + '</details>' +
        '</div>';
    }
    return '<div class="quran-mushaf-reader quran-mushaf-fit-' + esc(quranReadState.mushafFitMode) + '" data-mushaf-page="' + quranReadState.mushafPage + '">' +
        // V63.2: the page-meta strip is gone. Juz/Hizb/Surah already appear in
        // the card header above, and the page-jump moved into the command bar,
        // so this row was a third copy of the same information costing ~46px
        // of reading height on every page.
        '<div class="quran-mushaf-stage" id="quranMushafStage" tabindex="0" aria-label="Mushaf page ' + quranReadState.mushafPage + '">' +
            '<article class="quran-mushaf-paper quran-mushaf-mode-' + mode + '">' + body + '<footer>' + quranReadState.mushafPage + '</footer></article>' +
        '</div>' +
        quranRenderMushafVerseTools(pagePassages) +
        quranRenderMushafNavigation() +
    '</div>';
}

// ==================== V63.1 — true page fit ====================
//
// A printed Mushaf page always fits its sheet. "Fit" mode used to be a CSS
// clamp that guessed a size from viewport width and never checked the result,
// so a dense page still scrolled and the page feeling was lost.
//
// This measures. It binary-searches the Arabic type size until the sheet's
// content height fits the stage, so the whole page is visible at once — which
// is the entire point of reading by page rather than by scroll.
//
// Bounds are deliberate: never below 0.55× (unreadable) and never above the
// user's chosen size (fit should never enlarge past a deliberate preference).

const QURAN_MUSHAF_FIT_MIN_SCALE = 0.55;
const QURAN_MUSHAF_FIT_ITERATIONS = 7;   // ~0.4% precision over the range
let quranMushafFitPending = false;

function quranMushafAutoFit() {
    if (quranMushafFitPending) return;
    if (typeof requestAnimationFrame !== 'function') { quranMushafAutoFitNow(); return; }
    quranMushafFitPending = true;
    requestAnimationFrame(function () {
        quranMushafFitPending = false;
        quranMushafAutoFitNow();
    });
}

function quranMushafAutoFitNow() {
    const stage = document.getElementById('quranMushafStage');
    if (!stage) return;
    const paper = stage.querySelector('.quran-mushaf-paper');
    const arabic = stage.querySelector('.quran-mushaf-arabic');
    if (!paper || !arabic) return;

    const base = QURAN_BASE_ARABIC_REM * quranReadState.fontScale;

    // Readable mode keeps the user's chosen size and allows scrolling.
    //
    // V63.4: this used to do `arabic.style.fontSize = ''`. But the RENDERER
    // also writes the size as an inline style — the element ships as
    // style="font-size:1.72rem" — so clearing the property deleted the
    // renderer's size too, not just the measured one. There is no CSS
    // font-size for .quran-mushaf-arabic outside fit mode, so the text fell
    // all the way back to the inherited body size (~1rem) and Readable came
    // out SMALLER than Fit. Restore the intended size explicitly instead.
    if (quranReadState.mushafFitMode !== 'fit') {
        arabic.style.fontSize = base.toFixed(3) + 'rem';
        paper.classList.remove('is-auto-fitted');
        return;
    }
    const available = stage.clientHeight;
    if (!available) return;

    const fits = function (scale) {
        arabic.style.fontSize = (base * scale).toFixed(3) + 'rem';
        // scrollHeight of the sheet, not the stage: the sheet carries the
        // padding that has to fit too.
        return paper.scrollHeight <= available;
    };

    paper.classList.add('is-auto-fitted');
    const scale = quranMushafFitScale(fits, QURAN_MUSHAF_FIT_MIN_SCALE, QURAN_MUSHAF_FIT_ITERATIONS);
    fits(scale);   // leave the element at the chosen size
}

// Pure: given a monotonic predicate `fits(scale)`, return the largest scale in
// [minScale, 1] that fits. Separated from the DOM so the search itself is
// testable — see tools/test-quran-v63-fit.js.
//
// `fits` is assumed monotonic (smaller type never overflows more than larger),
// which holds for text reflow.
function quranMushafFitScale(fits, minScale, iterations) {
    if (fits(1)) return 1;
    if (!fits(minScale)) return minScale;   // even the floor overflows; stay readable and scroll
    let lo = minScale;
    let hi = 1;
    for (let i = 0; i < iterations; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) lo = mid; else hi = mid;
    }
    return lo;
}

// Guarded the same way as the keyboard binding below: the Node test harness
// supplies a minimal `window`/`document`, and quran.js must stay loadable
// there — that is how these suites verify the reader at all.
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function'
    && !window.__studyosMushafFitBound) {
    window.__studyosMushafFitBound = true;
    window.addEventListener('resize', function () {
        if (typeof document !== 'undefined' && document.getElementById
            && document.getElementById('quranMushafStage')) quranMushafAutoFit();
    });
}

function quranMushafAfterRender() {
    const stage = document.getElementById('quranMushafStage');
    if (!stage) return;
    quranMushafAutoFit();
    stage.addEventListener('touchstart', function(event) {
        const touch = event.changedTouches && event.changedTouches[0];
        if (touch) quranMushafTouchStart = { x: touch.clientX, y: touch.clientY, at: Date.now() };
    }, { passive: true });
    stage.addEventListener('touchend', function(event) {
        const touch = event.changedTouches && event.changedTouches[0];
        if (!touch || !quranMushafTouchStart) return;
        const dx = touch.clientX - quranMushafTouchStart.x;
        const dy = touch.clientY - quranMushafTouchStart.y;
        const elapsed = Date.now() - quranMushafTouchStart.at;
        quranMushafTouchStart = null;
        if (elapsed > 800 || Math.abs(dx) < 55 || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
        quranMushafHandleSwipe(dx < 0 ? 'next' : 'previous');
    }, { passive: true });
    if (!quranMushafKeyboardBound) {
        quranMushafKeyboardBound = true;
        document.addEventListener('keydown', function(event) {
            if (quranReadState.layoutMode !== 'mushaf' || !document.getElementById('quranMushafStage')) return;
            const target = event.target;
            if (target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName || '')) return;
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                quranMushafNextPage();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                quranMushafPreviousPage();
            }
        });
    }
}

function quranReadToggleButton(label, active, onclick, ariaLabel) {
    return '<button class="filter-btn ' + (active ? 'active' : '') + '" onclick="' + onclick + '" aria-pressed="' + (active ? 'true' : 'false') + '" aria-label="' + esc(ariaLabel || label) + '">' + esc(label) + '</button>';
}

function quranDedicatedMushafActive() {
    const page = document.getElementById('mushaf');
    return Boolean(page && page.classList.contains('active') && document.getElementById('quranMushafRoot'));
}

function quranRenderReaderSurface() {
    if (quranDedicatedMushafActive()) {
        renderQuranMushafReader();
        return;
    }
    renderQuranRead();
}

function quranOpenMushafReader(options) {
    const opts = options || {};
    const anchoredVerse = quranReadState.ayah
        ? quranVerseByReference(quranReadState.surah, quranReadState.ayah)
        : null;
    if (opts.page) quranReadState.mushafPage = quranMushafClampPage(opts.page);
    else if (opts.keepPage !== true && quranReadState.layoutMode !== 'mushaf') {
        quranReadState.mushafPage = (anchoredVerse && anchoredVerse.page) || quranFirstPageForSurah(quranReadState.surah);
    }
    quranReadState.layoutMode = 'mushaf';
    if (quranReadState.contentMode === 'wbw') quranReadState.contentMode = 'arabic';
    quranSavePreferences();
    if (typeof go === 'function') go('mushaf');
    else quranRenderReaderSurface();
}

function quranMushafToggleFocus(force, options) {
    const opts = options || {};
    const body = document.body;
    if (!body) return;
    const next = typeof force === 'boolean' ? force : !body.classList.contains('mushaf-reading-focus');
    body.classList.toggle('mushaf-reading-focus', next);
    const button = document.getElementById('mushafFocusToggle');
    if (button) {
        button.textContent = next ? 'Exit focus' : 'Focus view';
        button.setAttribute('aria-pressed', next ? 'true' : 'false');
    }
    // V62.5: sync the floating focus transport with current playback the
    // moment focus view opens, so it never shows a stale ▶ over live audio.
    if (typeof quranFollowUpdateBar === 'function') {
        try { quranFollowUpdateBar(); } catch (e) {}
    }
    if (!opts.silent && next) {
        const stage = document.getElementById('quranMushafStage');
        if (stage && typeof stage.focus === 'function') setTimeout(function() { stage.focus({ preventScroll: true }); }, 30);
    }
}

if (!window.__studyosMushafFocusKeyBound && document && typeof document.addEventListener === 'function') {
    window.__studyosMushafFocusKeyBound = true;
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && document.body && document.body.classList.contains('mushaf-reading-focus')) {
            event.preventDefault();
            quranMushafToggleFocus(false);
        }
    });
}

function renderQuranMushafReader() {
    const root = document.getElementById('quranMushafRoot');
    if (!root) return;

    quranReadState.layoutMode = 'mushaf';
    if (quranReadState.contentMode === 'wbw') quranReadState.contentMode = 'arabic';

    if (typeof quranDataReady === 'function' && !quranDataReady()) {
        if (typeof quranDataStatus === 'function' && quranDataStatus() === 'error') {
            root.innerHTML = '<div class="card quran-load-error"><strong>Quran data files could not be loaded.</strong><p>Required files: data/quran-verses.js and data/quran-translations-tevhid.js. <button class="btn btn-secondary btn-sm" type="button" onclick="quranEnsureData(function(){renderQuranMushafReader();})">Retry</button></p></div>';
            return;
        }
        root.innerHTML = '<div class="card quran-load-pending"><strong>Loading the Mushaf reader…</strong><p>The verbatim Arabic and Tevhid Meali datasets load on first use.</p></div>';
        quranEnsureData(function() { renderQuranMushafReader(); });
        return;
    }

    const verses = window.QURAN_VERSES || [];
    const surahs = window.QURAN_SURAHS || [];
    const translations = window.QURAN_TRANSLATION_TEVHID || {};
    const sourcePages = window.QURAN_TRANSLATION_TEVHID_PAGES || {};
    if (!verses.length || !surahs.length || !Object.keys(translations).length) {
        root.innerHTML = '<div class="card quran-load-error"><strong>Quran data did not load.</strong><p>The Mushaf reader requires the embedded Arabic, surah, and Tevhid Meali datasets.</p></div>';
        return;
    }

    quranReadState.mushafPage = quranMushafClampPage(quranReadState.mushafPage);
    const pageVerses = quranVersesForPage(quranReadState.mushafPage);
    if (!pageVerses.length) {
        root.innerHTML = '<div class="card quran-load-error"><strong>This Mushaf page is unavailable.</strong><p>Choose another page between 1 and 604.</p></div>';
        return;
    }

    const anchored = quranReadState.ayah
        ? pageVerses.find(function(verse) { return verse.surah === quranReadState.surah && verse.ayah === quranReadState.ayah; })
        : null;
    quranReadState.surah = anchored ? anchored.surah : pageVerses[0].surah;
    const surah = quranSurahByNumber(quranReadState.surah) || surahs[0];
    const surahOptions = surahs.map(function(item) {
        return '<option value="' + item.number + '" ' + (item.number === quranReadState.surah ? 'selected' : '') + '>' +
            esc(item.number + '. ' + item.englishName) + '</option>';
    }).join('');

    const arabicSize = (QURAN_BASE_ARABIC_REM * quranReadState.fontScale).toFixed(2);
    const translationSize = (QURAN_BASE_TRANSLATION_REM * quranReadState.fontScale).toFixed(2);
    const passages = quranBuildSurahPassages(pageVerses, translations, sourcePages);
    const summary = quranMushafPageSummary(pageVerses);
    const showArabic = quranReadState.contentMode !== 'meaning';

    if (window.QURAN_WORD_DATA && quranReadState.showTajweed && quranReadState.script === 'uthmani') {
        Array.from(new Set(pageVerses.map(function(verse) { return verse.surah; }))).forEach(function(number) {
            window.QURAN_WORD_DATA.tajweed.ensure(number);
        });
    }

    root.innerHTML =
        '<div class="mushaf-reader-workspace quran-reader-shell quran-font-' + esc(quranReadState.font) + '" style="--quran-arabic-size:' + arabicSize + 'rem;--quran-translation-size:' + translationSize + 'rem;">' +
            '<section class="mushaf-reader-commandbar" aria-label="Mushaf reader controls">' +
                '<div class="quran-surah-controls">' +
                    '<button class="btn btn-secondary btn-sm" type="button" onclick="quranReadGoSurah(' + (surah.number - 1) + ')" ' + (surah.number <= 1 ? 'disabled' : '') + '>← Surah</button>' +
                    '<select class="form-select quran-surah-select" onchange="quranReadSetSurah(this.value)" aria-label="Open surah first page">' + surahOptions + '</select>' +
                    '<button class="btn btn-secondary btn-sm" type="button" onclick="quranReadGoSurah(' + (surah.number + 1) + ')" ' + (surah.number >= 114 ? 'disabled' : '') + '>Surah →</button>' +
                '</div>' +
                // V63.2: page jump lives here now that the meta strip is gone.
                '<label class="quran-mushaf-page-jump mushaf-commandbar-jump"><span>Page</span>' +
                    '<input class="form-input" type="number" min="1" max="604" inputmode="numeric" value="' + quranReadState.mushafPage + '" onchange="quranMushafSetPageFromInput(this.value)" onkeydown="quranMushafHandlePageInputKey(event)" aria-label="Jump to Mushaf page">' +
                    '<em>/ 604</em></label>' +
                '<div class="mushaf-reader-compact-options">' +
                    '<select class="form-select" onchange="quranReadSetContentMode(this.value)" aria-label="Mushaf display mode">' +
                        '<option value="arabic" ' + (quranReadState.contentMode === 'arabic' ? 'selected' : '') + '>Arabic page</option>' +
                        '<option value="meaning" ' + (quranReadState.contentMode === 'meaning' ? 'selected' : '') + '>Meaning</option>' +
                        '<option value="both" ' + (quranReadState.contentMode === 'both' ? 'selected' : '') + '>Arabic + meaning</option>' +
                    '</select>' +
                    '<select class="form-select" onchange="quranMushafFitToViewport(this.value)" aria-label="Mushaf page sizing">' +
                        '<option value="fit" ' + (quranReadState.mushafFitMode === 'fit' ? 'selected' : '') + '>Fit page</option>' +
                        '<option value="readable" ' + (quranReadState.mushafFitMode === 'readable' ? 'selected' : '') + '>Readable</option>' +
                    '</select>' +
                '</div>' +
                '<div class="mushaf-reader-command-actions">' +
                    '<div class="quran-font-controls" role="group" aria-label="Text size">' +
                        '<button class="btn btn-secondary btn-sm" type="button" onclick="quranReadAdjustFontSize(-' + QURAN_FONT_SCALE_STEP + ')" ' + (quranReadState.fontScale <= QURAN_FONT_SCALE_MIN ? 'disabled' : '') + '>A−</button>' +
                        '<button class="quran-font-percent" type="button" onclick="quranReadResetFontSize()">' + Math.round(quranReadState.fontScale * 100) + '%</button>' +
                        '<button class="btn btn-secondary btn-sm" type="button" onclick="quranReadAdjustFontSize(' + QURAN_FONT_SCALE_STEP + ')" ' + (quranReadState.fontScale >= QURAN_FONT_SCALE_MAX ? 'disabled' : '') + '>A+</button>' +
                    '</div>' +
                    '<button class="btn btn-primary btn-sm" type="button" onclick="quranMushafToggleFocus()">Focus</button>' +
                '</div>' +
            '</section>' +
            '<details class="card mushaf-reader-options-card">' +
                '<summary>Reading options</summary>' +
                '<div class="mushaf-reader-options-grid">' +
                    '<div class="quran-option-group"><span class="quran-option-label">Show</span><div class="filter-bar quran-mode-toggle">' +
                        quranReadToggleButton('Arabic page', quranReadState.contentMode === 'arabic', "quranReadSetContentMode('arabic')") +
                        quranReadToggleButton('Meaning', quranReadState.contentMode === 'meaning', "quranReadSetContentMode('meaning')") +
                        quranReadToggleButton('Both', quranReadState.contentMode === 'both', "quranReadSetContentMode('both')") +
                    '</div></div>' +
                    '<div class="quran-option-group"><span class="quran-option-label">Page fit</span><div class="filter-bar quran-mode-toggle">' +
                        quranReadToggleButton('Fit page', quranReadState.mushafFitMode === 'fit', "quranMushafFitToViewport('fit')") +
                        quranReadToggleButton('Readable', quranReadState.mushafFitMode === 'readable', "quranMushafFitToViewport('readable')") +
                    '</div></div>' +
                    '<div class="quran-option-group"><span class="quran-option-label">Arabic script</span><div class="filter-bar quran-mode-toggle">' +
                        quranReadToggleButton('Uthmani', quranReadState.script === 'uthmani', "quranReadSetScript('uthmani')") +
                        quranReadToggleButton('Simple', quranReadState.script === 'simple', "quranReadSetScript('simple')") +
                    '</div></div>' +
                    '<div class="quran-option-group"><span class="quran-option-label">Font</span><div class="filter-bar quran-mode-toggle">' +
                        quranReadToggleButton('Scheherazade', quranReadState.font === 'scheherazade', "quranReadSetFont('scheherazade')") +
                        quranReadToggleButton('KFGQPC Medina', quranReadState.font === 'kfgqpc', "quranReadSetFont('kfgqpc')") +
                        quranReadToggleButton('Naskh', quranReadState.font === 'naskh', "quranReadSetFont('naskh')") +
                    '</div></div>' +
                    (showArabic && quranReadState.script === 'uthmani' ? '<div class="quran-option-group"><span class="quran-option-label">Tajweed</span><div class="filter-bar quran-mode-toggle">' +
                        quranReadToggleButton('Off', !quranReadState.showTajweed, 'quranReadToggleTajweed(false)') +
                        quranReadToggleButton('Colors', quranReadState.showTajweed, 'quranReadToggleTajweed(true)') +
                    '</div></div>' : '') +
                    '<div class="quran-option-group"><span class="quran-option-label">Playback</span><label class="quran-mushaf-auto-turn"><input type="checkbox" ' + (quranReadState.mushafAutoTurn ? 'checked ' : '') + 'onchange="quranMushafToggleAutoTurn(this.checked)"> Auto-turn pages with audio</label></div>' +
                '</div>' +
            '</details>' +
            (typeof quranFollowRenderBar === 'function' ? quranFollowRenderBar() : '') +
            '<section class="quran-surah-card card quran-layout-mushaf" aria-label="Mushaf page ' + quranReadState.mushafPage + '">' +
                '<header class="quran-surah-header"><div><h3>Page ' + quranReadState.mushafPage + ' of 604</h3><p>' + esc(summary.surahNames.join(' · ')) + ' · Juz ' + esc(summary.juzLabel) + ' · Hizb ' + esc(summary.hizbLabel) + '</p></div>' +
                '<div class="quran-surah-header-actions"><button class="btn btn-secondary btn-sm" type="button" onclick="go(\'quranlisten\')">Open Listen tools</button></div></header>' +
                quranRenderMushafPage(pageVerses, passages, arabicSize, translationSize) +
            '</section>' +
            (typeof quranStudyRenderReflectionDialog === 'function' ? quranStudyRenderReflectionDialog() : '') +
        '</div>';

    quranSavePreferences();
    if (typeof quranStudyAfterRender === 'function') quranStudyAfterRender();
    if (typeof quranFollowAfterReaderRender === 'function') quranFollowAfterReaderRender();
    if (typeof quranWordTooltipHide === 'function') quranWordTooltipHide();
    quranMushafAfterRender();

    const focusButton = document.getElementById('mushafFocusToggle');
    if (focusButton) {
        const focused = document.body.classList.contains('mushaf-reading-focus');
        focusButton.textContent = focused ? 'Exit focus' : 'Focus view';
        focusButton.setAttribute('aria-pressed', focused ? 'true' : 'false');
    }
}

function renderQuranRead() {
    if (quranReadState.layoutMode === 'mushaf') quranReadState.layoutMode = quranReadState.standardLayoutMode || 'verse';
    const root = document.getElementById('quranReadRoot');
    if (!root) return;

    // V56 (audit R9): the heavy datasets lazy-load on first Quran use.
    if (typeof quranDataReady === 'function' && !quranDataReady()) {
        if (typeof quranDataStatus === 'function' && quranDataStatus() === 'error') {
            root.innerHTML = '<div class="card quran-load-error"><strong>Quran data files could not be loaded.</strong><p>Required files: data/quran-verses.js and data/quran-translations-tevhid.js. <button class="btn btn-secondary btn-sm" type="button" onclick="quranEnsureData(function(){quranRenderReaderSurface();})">Retry</button></p></div>';
            return;
        }
        root.innerHTML = '<div class="card quran-load-pending"><strong>Loading the Quran library…</strong><p>The verbatim Arabic and Tevhid Meali datasets (~3.8 MB) load on first use so app startup stays fast.</p></div>';
        quranEnsureData(function() { quranRenderReaderSurface(); });
        return;
    }

    const verses = window.QURAN_VERSES || [];
    const surahs = window.QURAN_SURAHS || [];
    const translations = window.QURAN_TRANSLATION_TEVHID || {};
    const sourcePages = window.QURAN_TRANSLATION_TEVHID_PAGES || {};
    const source = window.QURAN_TRANSLATION_TEVHID_SOURCE || {};

    if (!verses.length || !surahs.length || !Object.keys(translations).length) {
        root.innerHTML = '<div class="card quran-load-error"><strong>Quran data did not load.</strong><p>Required files: data/quran-verses.js, data/quran-surahs.js, and data/quran-translations-tevhid.js.</p></div>';
        return;
    }

    quranReadState.mushafPage = quranMushafClampPage(quranReadState.mushafPage);
    const mushafPageVerses = quranReadState.layoutMode === 'mushaf'
        ? quranVersesForPage(quranReadState.mushafPage)
        : [];
    if (quranReadState.layoutMode === 'mushaf' && mushafPageVerses.length) {
        const anchored = quranReadState.ayah
            ? mushafPageVerses.find(function(verse) { return verse.surah === quranReadState.surah && verse.ayah === quranReadState.ayah; })
            : null;
        quranReadState.surah = anchored ? anchored.surah : mushafPageVerses[0].surah;
    }

    const surah = quranSurahByNumber(quranReadState.surah) || surahs[0];
    const surahVerses = quranVersesForSurah(surah.number);
    const sourceAnchorVerse = quranReadState.layoutMode === 'mushaf' && mushafPageVerses.length
        ? mushafPageVerses[0]
        : (surahVerses[0] || { surah: surah.number, ayah: 1 });
    const firstKey = quranTevhidCanonicalKey(sourceAnchorVerse.surah, sourceAnchorVerse.ayah);
    const surahSourcePage = sourcePages[firstKey] || (window.QURAN_TEVHID_MEALI_PAGES || {})[surah.number];
    const surahSourceHref = 'media/quran-reference/tevhid-meali.pdf' + (surahSourcePage ? '#page=' + surahSourcePage : '');

    const surahOptions = surahs.map(function(item) {
        return '<option value="' + item.number + '" ' + (item.number === surah.number ? 'selected' : '') + '>' +
            esc(item.number + '. ' + item.englishName + ' (' + item.revelationType + ', ' + item.versesCount + ')') +
        '</option>';
    }).join('');

    const arabicSize = (QURAN_BASE_ARABIC_REM * quranReadState.fontScale).toFixed(2);
    const translationSize = (QURAN_BASE_TRANSLATION_REM * quranReadState.fontScale).toFixed(2);
    const wbwMode = quranReadState.contentMode === 'wbw';
    const showArabic = quranReadState.contentMode === 'arabic' || quranReadState.contentMode === 'both';
    const showMeaning = quranReadState.contentMode === 'meaning' || quranReadState.contentMode === 'both' || wbwMode;

    // V55: kick off the optional Quran.com layers needed by the current view
    // BEFORE building the markup so loading states render immediately. The
    // change listener at the bottom of this file re-renders when data lands.
    if (window.QURAN_WORD_DATA) {
        if (wbwMode) window.QURAN_WORD_DATA.wbw.ensure(surah.number, quranReadState.wbwLang);
        if (quranReadState.showTajweed && quranReadState.script === 'uthmani' && !wbwMode) {
            const layerSurahs = quranReadState.layoutMode === 'mushaf'
                ? Array.from(new Set(mushafPageVerses.map(function(verse) { return verse.surah; })))
                : [surah.number];
            layerSurahs.forEach(function(number) { window.QURAN_WORD_DATA.tajweed.ensure(number); });
        }
    }

    const passageVerses = quranReadState.layoutMode === 'mushaf' ? mushafPageVerses : surahVerses;
    const passages = quranBuildSurahPassages(passageVerses, translations, sourcePages);
    const readingContent = quranReadState.layoutMode === 'mushaf'
        ? quranRenderMushafPage(mushafPageVerses, passages, arabicSize, translationSize)
        : (quranReadState.layoutMode === 'page'
            ? quranRenderPageLayout(passages, arabicSize, translationSize, showArabic, showMeaning)
            : quranRenderVerseLayout(passages, arabicSize, translationSize, showArabic, showMeaning));

    const sourceTitle = source.title || 'Tevhid Meali';
    const sourcePreparer = source.preparer || 'Halis Bayancuk (Ebu Hanzala)';
    const sourceEdition = source.edition || '3. Baskı, Mart 2024';
    const mushafSummary = quranReadState.layoutMode === 'mushaf' ? quranMushafPageSummary(mushafPageVerses) : null;

    root.innerHTML =
        '<div class="quran-reader-shell quran-font-' + esc(quranReadState.font) + '" style="--quran-arabic-size:' + arabicSize + 'rem;--quran-translation-size:' + translationSize + 'rem;">' +
            '<section class="quran-reader-toolbar card" aria-label="Quran reader controls">' +
                '<div class="quran-toolbar-row">' +
                    '<div class="quran-surah-controls">' +
                        '<button class="btn btn-secondary btn-sm" onclick="quranReadGoSurah(' + (surah.number - 1) + ')" ' + (surah.number <= 1 ? 'disabled' : '') + '>← Prev</button>' +
                        '<select class="form-select quran-surah-select" id="quranSurahSelect" onchange="quranReadSetSurah(this.value)">' + surahOptions + '</select>' +
                        '<button class="btn btn-secondary btn-sm" onclick="quranReadGoSurah(' + (surah.number + 1) + ')" ' + (surah.number >= 114 ? 'disabled' : '') + '>Next →</button>' +
                    '</div>' +
                    '<div class="quran-toolbar-actions">' +
                        '<div class="quran-font-controls" role="group" aria-label="Text size">' +
                            '<button class="btn btn-secondary btn-sm" onclick="quranReadAdjustFontSize(-' + QURAN_FONT_SCALE_STEP + ')" aria-label="Decrease text size" ' + (quranReadState.fontScale <= QURAN_FONT_SCALE_MIN ? 'disabled' : '') + '>A−</button>' +
                            '<button class="quran-font-percent" onclick="quranReadResetFontSize()" title="Reset text size" aria-label="Reset text size">' + Math.round(quranReadState.fontScale * 100) + '%</button>' +
                            '<button class="btn btn-secondary btn-sm" onclick="quranReadAdjustFontSize(' + QURAN_FONT_SCALE_STEP + ')" aria-label="Increase text size" ' + (quranReadState.fontScale >= QURAN_FONT_SCALE_MAX ? 'disabled' : '') + '>A+</button>' +
                        '</div>' +
                        (typeof quranStudyRenderPanel === 'function' ? '<button class="btn btn-secondary btn-sm" id="quranStudyPanelButton" type="button" onclick="quranStudyTogglePanel()" aria-expanded="' + (quranStudyPanelOpen ? 'true' : 'false') + '">My Quran · <span id="quranTrackingStatus">' + (quranStudyState.trackingEnabled ? 'Reading' : 'Browse') + '</span></button>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="quran-reading-options">' +
                    '<div class="quran-option-group">' +
                        '<span class="quran-option-label">Show</span>' +
                        '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Choose Quran text display">' +
                            quranReadToggleButton(quranReadState.layoutMode === 'mushaf' ? 'Arabic Page' : 'Verses only', quranReadState.contentMode === 'arabic', "quranReadSetContentMode('arabic')", 'Show Arabic verses only') +
                            quranReadToggleButton(quranReadState.layoutMode === 'mushaf' ? 'Meaning' : 'Meaning only', quranReadState.contentMode === 'meaning', "quranReadSetContentMode('meaning')", 'Show Tevhid Meali meaning only') +
                            quranReadToggleButton('Both', quranReadState.contentMode === 'both', "quranReadSetContentMode('both')", 'Show Arabic verses and Tevhid Meali together') +
                            (quranReadState.layoutMode !== 'mushaf' ? quranReadToggleButton('Word by word', wbwMode, "quranReadSetContentMode('wbw')", 'Show each word with its meaning and transliteration (Quran.com layer)') : '') +
                        '</div>' +
                    '</div>' +
                    '<div class="quran-option-group">' +
                        '<span class="quran-option-label">Layout</span>' +
                        '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Choose Quran reading layout">' +
                            quranReadToggleButton('Verse by verse', quranReadState.layoutMode === 'verse', "quranReadSetLayoutMode('verse')", 'Read each verse in a separate card') +
                            quranReadToggleButton('Continuous', quranReadState.layoutMode === 'page', "quranReadSetLayoutMode('page')", 'Read the selected surah on one continuous page') +
                        '</div>' +
                    '</div>' +
                    (quranReadState.layoutMode === 'mushaf' ? '<div class="quran-option-group">' +
                        '<span class="quran-option-label">Page fit</span>' +
                        '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Mushaf page fit">' +
                            quranReadToggleButton('Fit page', quranReadState.mushafFitMode === 'fit', "quranMushafFitToViewport('fit')", 'Fit the Mushaf page to the reading viewport') +
                            quranReadToggleButton('Readable', quranReadState.mushafFitMode === 'readable', "quranMushafFitToViewport('readable')", 'Use a larger readable page with internal scrolling') +
                        '</div>' +
                        '<label class="quran-mushaf-auto-turn"><input type="checkbox" ' + (quranReadState.mushafAutoTurn ? 'checked ' : '') + 'onchange="quranMushafToggleAutoTurn(this.checked)"> Auto-turn with audio</label>' +
                    '</div>' : '') +
                    (showArabic ? '<div class="quran-option-group">' +
                        '<span class="quran-option-label">Arabic</span>' +
                        '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Arabic script style">' +
                            quranReadToggleButton('Uthmani', quranReadState.script === 'uthmani', "quranReadSetScript('uthmani')", 'Use stored Uthmani Arabic text') +
                            quranReadToggleButton('Simple', quranReadState.script === 'simple', "quranReadSetScript('simple')", 'Use stored simple Arabic text') +
                        '</div>' +
                    '</div>' : '') +
                    (showArabic || wbwMode ? '<div class="quran-option-group">' +
                        '<span class="quran-option-label">Font</span>' +
                        '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Arabic font">' +
                            quranReadToggleButton('Scheherazade', quranReadState.font === 'scheherazade', "quranReadSetFont('scheherazade')", 'Scheherazade New (SIL) verse font') +
                            quranReadToggleButton('KFGQPC Medina', quranReadState.font === 'kfgqpc', "quranReadSetFont('kfgqpc')", 'KFGQPC Uthmanic Script HAFS (Medina mushaf) font') +
                            quranReadToggleButton('Naskh', quranReadState.font === 'naskh', "quranReadSetFont('naskh')", 'Noto Naskh Arabic font') +
                            quranReadToggleButton('System', quranReadState.font === 'system', "quranReadSetFont('system')", 'Default system Arabic font stack') +
                        '</div>' +
                    '</div>' : '') +
                    (showArabic && quranReadState.script === 'uthmani' ? '<div class="quran-option-group">' +
                        '<span class="quran-option-label">Tajweed</span>' +
                        '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Tajweed letter coloring">' +
                            quranReadToggleButton('Off', !quranReadState.showTajweed, 'quranReadToggleTajweed(false)', 'Show stored letters without tajweed coloring') +
                            quranReadToggleButton('Colors', quranReadState.showTajweed, 'quranReadToggleTajweed(true)', 'Color tajweed rules using the Quran.com tajweed text layer') +
                        '</div>' +
                    '</div>' : '') +
                    (wbwMode ? '<div class="quran-option-group">' +
                        '<span class="quran-option-label">Word meaning</span>' +
                        '<div class="filter-bar quran-mode-toggle" role="group" aria-label="Word-by-word meaning language">' +
                            quranReadToggleButton('Türkçe', quranReadState.wbwLang === 'tr', "quranReadSetWbwLang('tr')", 'Turkish word meanings from Quran.com') +
                            quranReadToggleButton('English', quranReadState.wbwLang === 'en', "quranReadSetWbwLang('en')", 'English word meanings from Quran.com') +
                        '</div>' +
                    '</div>' : '') +
                '</div>' +
                '<div class="quran-search-wrap">' +
                    '<input type="search" class="form-input" id="quranSearchInput" placeholder="Search Arabic or Tevhid Meali…" oninput="quranReadSearch(this.value)" autocomplete="off">' +
                    '<div id="quranSearchResults" aria-live="polite"></div>' +
                '</div>' +
            '</section>' +
            (typeof quranFollowRenderBar === 'function' ? quranFollowRenderBar() : '') +
            (typeof quranStudyRenderPanel === 'function' ? quranStudyRenderPanel() : '') +
            '<section class="quran-surah-card card quran-layout-' + esc(quranReadState.layoutMode) + '">' +
                '<header class="quran-surah-header">' +
                    '<div>' +
                        (quranReadState.layoutMode === 'mushaf'
                            ? '<h3>Mushaf Page ' + quranReadState.mushafPage + ' of 604</h3><p>' + esc(mushafSummary.surahNames.join(' · ')) + ' · Juz ' + esc(mushafSummary.juzLabel) + ' · Hizb ' + esc(mushafSummary.hizbLabel) + '</p>'
                            : '<h3>' + esc(surah.number + '. ' + surah.name + ' — ' + surah.englishName) + '</h3><p>' + esc(surah.revelationType) + ' · ' + surah.versesCount + ' verses</p>') +
                    '</div>' +
                    '<div class="quran-surah-header-actions">' +
                        (typeof quranStudyToggleSurahComplete === 'function' ? '<button class="btn ' + (quranStudyIsSurahComplete(surah.number) ? 'btn-primary' : 'btn-secondary') + ' btn-sm" type="button" onclick="quranStudyToggleSurahComplete(' + surah.number + ')">' + (quranStudyIsSurahComplete(surah.number) ? 'Completed ✓' : 'Mark surah complete') + '</button>' : '') +
                        '<a class="btn btn-secondary btn-sm" href="' + surahSourceHref + '" target="_blank" rel="noopener">Open source PDF' + (surahSourcePage ? ' · p. ' + surahSourcePage : '') + '</a>' +
                    '</div>' +
                '</header>' +
                '<div class="quran-source-attribution"><strong>' + esc(sourceTitle) + '</strong> · ' + esc(sourcePreparer) + ' · ' + esc(sourceEdition) +
                    (quranReadState.showTajweed && showArabic && quranReadState.script === 'uthmani' ? ' <span class="quran-layer-label">· Tajweed letters &amp; colors: Quran.com layer</span>' : '') +
                    (wbwMode ? ' <span class="quran-layer-label">· Word-by-word text, transliteration &amp; meanings: Quran.com layer (' + (quranReadState.wbwLang === 'tr' ? 'Türkçe' : 'English') + ')</span>' : '') +
                '</div>' +
                readingContent +
            '</section>' +
            (typeof quranStudyRenderReflectionDialog === 'function' ? quranStudyRenderReflectionDialog() : '') +
        '</div>';

    if (typeof quranStudyAfterRender === 'function') quranStudyAfterRender();
    if (typeof quranFollowAfterReaderRender === 'function') quranFollowAfterReaderRender();
    if (typeof quranWordTooltipHide === 'function') quranWordTooltipHide();
    if (quranReadState.layoutMode === 'mushaf') quranMushafAfterRender();

    // V56 (audit R8): one-time restore of the persisted reading position.
    if (!quranReadState._scrollRestored) {
        quranReadState._scrollRestored = true;
        if (quranReadState.ayah) setTimeout(function() { quranReadHighlightCurrentVerse('auto'); }, 60);
    }
}

// ==================== V58 section map ====================
// The Listen tab moved to js/quran-listen.js and the Understand tab to
// js/quran-understand.js. This file keeps the shared core: session state
// wiring, verse/surah lookups, normalization, Tevhid passage building,
// the Read tab (all V55 word-level rendering), and the word tooltip.

// ==================== V55 — word tooltip + async layer re-render ====================

let quranWordTooltipTarget = null; // {surah, ayah, position}

function quranWordTooltipElement() {
    let tip = document.getElementById('quranWordTooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'quranWordTooltip';
        tip.className = 'quran-word-tooltip';
        tip.hidden = true;
        document.body.appendChild(tip);
        document.addEventListener('click', function(event) {
            if (tip.hidden) return;
            if (tip.contains(event.target)) return;
            if (event.target && event.target.closest && event.target.closest('.quran-word-clickable')) return;
            quranWordTooltipHide();
        });
    }
    return tip;
}

function quranWordTooltipHide() {
    const tip = document.getElementById('quranWordTooltip');
    if (tip) tip.hidden = true;
    quranWordTooltipTarget = null;
    quranWordAudioStop();
}

// ==================== V62.2 — single-word audio ====================
// Tapping an Arabic word plays that word alone. Audio comes from the same
// Quran.com word layer already used for meanings (word_fields=audio_url), so
// this adds no new provider and no new licence surface. It runs on its own
// Audio element so it never disturbs verse playback or follow-along.
//
// Offline/portable builds: the word layer needs the network. When it is
// unavailable the tooltip says so instead of failing silently.

let quranWordAudioEl = null;
let quranWordAudioToken = 0;

function quranWordAudioElement() {
    if (!quranWordAudioEl) {
        quranWordAudioEl = new Audio();
        quranWordAudioEl.preload = 'none';
    }
    return quranWordAudioEl;
}

function quranWordAudioStop() {
    quranWordAudioToken++;
    if (!quranWordAudioEl) return;
    try { quranWordAudioEl.pause(); quranWordAudioEl.currentTime = 0; } catch (e) {}
    quranWordAudioSetState('idle');
}

function quranWordAudioSetState(state) {
    const btn = document.getElementById('quranWordTooltipPlay');
    if (!btn) return;
    btn.dataset.state = state;
    btn.textContent = state === 'playing' ? '❚❚' : (state === 'loading' ? '…' : '▶');
    btn.setAttribute('aria-label', state === 'playing' ? 'Stop word audio' : 'Play this word');
}

// Deterministic Quran.com word-audio path, used when the API response did
// not carry audio_url for this word: wbw/SSS_AAA_WWW.mp3
function quranWordAudioFallbackPath(surah, ayah, position) {
    const pad = n => String(n).padStart(3, '0');
    return 'wbw/' + pad(surah) + '_' + pad(ayah) + '_' + pad(position) + '.mp3';
}

function quranWordAudioUrl(surah, ayah, position) {
    const wd = window.QURAN_WORD_DATA;
    const engine = window.QURAN_AUDIO_ENGINE;
    let raw = '';
    if (wd) {
        const words = wd.wbw.words(surah, quranReadState.wbwLang, surah + ':' + ayah) || [];
        for (let i = 0; i < words.length; i++) {
            if (words[i].position === position) { raw = words[i].audioUrl || ''; break; }
        }
    }
    if (!raw) raw = quranWordAudioFallbackPath(surah, ayah, position);
    return engine ? engine.normalizeUrl(raw) : raw;
}

function quranWordAudioPlay(surah, ayah, position) {
    const audio = quranWordAudioElement();
    const url = quranWordAudioUrl(surah, ayah, position);
    if (!url) { quranWordAudioSetState('idle'); return; }

    // Second tap on a playing word stops it.
    if (!audio.paused && audio.dataset && audio.dataset.key === surah + ':' + ayah + ':' + position) {
        quranWordAudioStop();
        return;
    }

    const token = ++quranWordAudioToken;
    try { audio.pause(); } catch (e) {}
    audio.dataset.key = surah + ':' + ayah + ':' + position;
    audio.src = url;
    quranWordAudioSetState('loading');

    audio.onended = function() { if (token === quranWordAudioToken) quranWordAudioSetState('idle'); };
    audio.onerror = function() {
        if (token !== quranWordAudioToken) return;
        quranWordAudioSetState('idle');
        const note = document.getElementById('quranWordTooltipAudioNote');
        if (note) { note.textContent = 'Word audio unavailable offline.'; note.hidden = false; }
    };

    const played = audio.play();
    if (played && typeof played.then === 'function') {
        played.then(function() {
            if (token === quranWordAudioToken) quranWordAudioSetState('playing');
        }).catch(function() {
            if (token === quranWordAudioToken) quranWordAudioSetState('idle');
        });
    } else {
        quranWordAudioSetState('playing');
    }
}

// Tooltip play button + the "speak on tap" preference toggle.
function quranWordTooltipPlay() {
    const t = quranWordTooltipTarget;
    if (t) quranWordAudioPlay(t.surah, t.ayah, t.position);
}

function quranWordAudioToggleOnTap() {
    quranReadState.wordAudioOnTap = !quranReadState.wordAudioOnTap;
    if (typeof quranSavePreferences === 'function') quranSavePreferences();
    quranWordTooltipRender();
    if (quranReadState.wordAudioOnTap) quranWordTooltipPlay();
}

function quranWordTooltipRender() {
    const tip = quranWordTooltipElement();
    const target = quranWordTooltipTarget;
    if (!target) return;
    const wd = window.QURAN_WORD_DATA;
    const lang = quranReadState.wbwLang;
    const verseKey = target.surah + ':' + target.ayah;
    let body = '';
    if (!wd) {
        body = '<span class="quran-word-tooltip-note">Word data module did not load.</span>';
    } else {
        const status = wd.wbw.status(target.surah, lang);
        if (status === 'ready') {
            const words = wd.wbw.words(target.surah, lang, verseKey) || [];
            let match = null;
            for (let i = 0; i < words.length; i++) {
                if (words[i].position === target.position) { match = words[i]; break; }
            }
            body = match
                ? '<span class="quran-word-tooltip-arabic" dir="rtl" lang="ar">' + esc(match.textUthmani) + '</span>' +
                  (match.transliteration ? '<span class="quran-word-tooltip-translit">' + esc(match.transliteration) + '</span>' : '') +
                  '<span class="quran-word-tooltip-meaning">' + (match.translation ? esc(match.translation) : '—') + '</span>'
                : '<span class="quran-word-tooltip-note">No entry for this word in the Quran.com dataset.</span>';
        } else if (status === 'error') {
            body = '<span class="quran-word-tooltip-note">Word meanings could not be loaded (internet required).</span>';
        } else {
            body = '<span class="quran-word-tooltip-note">Loading word meaning…</span>';
        }
    }
    const speakOn = quranReadState.wordAudioOnTap !== false;
    tip.innerHTML = '<div class="quran-word-tooltip-head">' +
            '<span>' + esc(verseKey) + ' · word ' + target.position + '</span>' +
            '<span class="quran-word-tooltip-tools">' +
                '<button type="button" class="quran-word-tooltip-play" id="quranWordTooltipPlay" data-state="idle" onclick="quranWordTooltipPlay()" aria-label="Play this word" title="Play this word">▶</button>' +
                '<button type="button" class="quran-word-tooltip-speak' + (speakOn ? ' is-on' : '') + '" onclick="quranWordAudioToggleOnTap()" aria-pressed="' + (speakOn ? 'true' : 'false') + '" title="' + (speakOn ? 'Speaking each word on tap' : 'Tap-to-speak is off') + '">🔊</button>' +
                '<button type="button" class="quran-study-remove" onclick="quranWordTooltipHide()" aria-label="Close">×</button>' +
            '</span>' +
        '</div>' +
        body +
        '<span class="quran-word-tooltip-note" id="quranWordTooltipAudioNote" hidden></span>' +
        '<span class="quran-word-tooltip-source">Quran.com word data (' + (lang === 'tr' ? 'Türkçe' : 'English') + ')</span>';
    tip.hidden = false;
}

function quranWordTooltipShow(event, surah, ayah, position) {
    if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
    const sameTarget = quranWordTooltipTarget &&
        quranWordTooltipTarget.surah === surah &&
        quranWordTooltipTarget.ayah === ayah &&
        quranWordTooltipTarget.position === position;
    if (sameTarget) { quranWordTooltipHide(); return; }

    quranWordTooltipTarget = { surah: surah, ayah: ayah, position: position };
    if (window.QURAN_WORD_DATA) window.QURAN_WORD_DATA.wbw.ensure(surah, quranReadState.wbwLang);
    quranWordTooltipRender();
    // V62.2: speak the tapped word. The word-audio path is deterministic, so
    // this does not wait on the meaning layer to finish loading.
    if (quranReadState.wordAudioOnTap !== false) quranWordAudioPlay(surah, ayah, position);

    const tip = quranWordTooltipElement();
    const anchor = event && event.currentTarget && event.currentTarget.getBoundingClientRect
        ? event.currentTarget.getBoundingClientRect()
        : null;
    if (anchor) {
        const margin = 8;
        tip.style.visibility = 'hidden';
        tip.hidden = false;
        const tipRect = tip.getBoundingClientRect();
        let left = anchor.left + anchor.width / 2 - tipRect.width / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - tipRect.width - margin));
        let top = anchor.bottom + margin;
        if (top + tipRect.height > window.innerHeight - margin) top = anchor.top - tipRect.height - margin;
        tip.style.left = Math.round(left) + 'px';
        tip.style.top = Math.round(top + window.scrollY) + 'px';
        tip.style.visibility = '';
    }
}

// Re-render the visible Quran views when an online layer finishes loading.
if (window.QURAN_WORD_DATA) {
    window.QURAN_WORD_DATA.onChange(function(kind, key) {
        // Skip the 'loading' notification; only repaint on ready/error.
        if (kind === 'wbw' && window.QURAN_WORD_DATA.wbw.status.apply(null, String(key).split(':')) === 'loading') return;
        if (kind === 'tajweed' && window.QURAN_WORD_DATA.tajweed.status(key) === 'loading') return;
        if (kind === 'timing') return; // timing consumers handle their own promises

        const readPanel = document.getElementById('tab-quranread');
        const dedicatedPage = document.getElementById('mushaf');
        const standardVisible = readPanel && readPanel.style.display !== 'none' && document.getElementById('quranReadRoot');
        const mushafVisible = dedicatedPage && dedicatedPage.classList.contains('active') && document.getElementById('quranMushafRoot');
        if (standardVisible || mushafVisible) quranRenderReaderSurface();
        if (quranWordTooltipTarget) quranWordTooltipRender();
    });
}
