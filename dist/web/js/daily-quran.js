// ==================== DAILY QURAN VERSE V49 ====================
// Selects one validated Quran passage for the dashboard when StudyOS opens.
// This module only reads and displays the existing source strings. It never
// edits, translates, paraphrases, normalizes, combines, or splits verse text.
(function () {
    'use strict';

    const LAST_REFERENCE_KEY = (typeof K !== 'undefined' && K.dailyQuranLastReference)
        ? K.dailyQuranLastReference
        : null;
    let currentSelection = null;

    function htmlEscape(value) {
        if (typeof esc === 'function') return esc(value);
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function combinedRangeFor(surah, ayah) {
        const ranges = window.QURAN_TRANSLATION_TEVHID_COMBINED_RANGES || [];
        return ranges.find(function (range) {
            return range.surah === surah && ayah >= range.start && ayah <= range.end;
        }) || null;
    }

    function canonicalReference(verse) {
        const range = combinedRangeFor(verse.surah, verse.ayah);
        return range
            ? verse.surah + ':' + range.start + '-' + range.end
            : verse.surah + ':' + verse.ayah;
    }

    function canonicalTranslationKey(verse) {
        const range = combinedRangeFor(verse.surah, verse.ayah);
        return range
            ? verse.surah + ':' + range.start
            : verse.surah + ':' + verse.ayah;
    }

    function buildDailyQuranPool() {
        const verses = window.QURAN_VERSES || [];
        const surahs = window.QURAN_SURAHS || [];
        const translations = window.QURAN_TRANSLATION_TEVHID || {};
        const sourcePages = window.QURAN_TRANSLATION_TEVHID_PAGES || {};
        const seen = new Set();
        const pool = [];

        verses.forEach(function (verse) {
            const reference = canonicalReference(verse);
            if (seen.has(reference)) return;

            const translationKey = canonicalTranslationKey(verse);
            const translation = translations[translationKey];
            if (typeof translation !== 'string' || !translation.trim()) return;

            const range = combinedRangeFor(verse.surah, verse.ayah);
            const passageVerses = range
                ? verses.filter(function (item) {
                    return item.surah === range.surah && item.ayah >= range.start && item.ayah <= range.end;
                })
                : [verse];

            if (!passageVerses.length) return;

            const surah = surahs.find(function (item) { return item.number === verse.surah; }) || null;
            pool.push(Object.freeze({
                reference: reference,
                translationKey: translationKey,
                surahNumber: verse.surah,
                ayahStart: range ? range.start : verse.ayah,
                ayahEnd: range ? range.end : verse.ayah,
                surah: surah,
                verses: passageVerses.slice(),
                translation: translation,
                sourcePage: sourcePages[translationKey] || null,
                isCombinedSourcePassage: Boolean(range)
            }));
            seen.add(reference);
        });

        return pool;
    }

    function randomIndex(length) {
        if (length <= 1) return 0;
        try {
            if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
                const values = new Uint32Array(1);
                window.crypto.getRandomValues(values);
                return values[0] % length;
            }
        } catch (_) {
            // Fall back to Math.random when secure randomness is unavailable.
        }
        return Math.floor(Math.random() * length);
    }

    function readLastReference() {
        try {
            return LAST_REFERENCE_KEY && typeof get === 'function' ? get(LAST_REFERENCE_KEY) : null;
        } catch (_) {
            return null;
        }
    }

    function saveLastReference(reference) {
        try {
            if (LAST_REFERENCE_KEY && typeof set === 'function') set(LAST_REFERENCE_KEY, reference);
        } catch (_) {
            // Selection still works when storage is blocked.
        }
    }

    function chooseDailyQuranVerse(forceNew) {
        if (currentSelection && !forceNew) return currentSelection;

        const pool = buildDailyQuranPool();
        if (!pool.length) {
            currentSelection = null;
            return null;
        }

        const previousReference = currentSelection
            ? currentSelection.reference
            : readLastReference();
        const candidates = pool.length > 1
            ? pool.filter(function (item) { return item.reference !== previousReference; })
            : pool;

        currentSelection = candidates[randomIndex(candidates.length)] || pool[0];
        saveLastReference(currentSelection.reference);
        return currentSelection;
    }

    function renderArabicPassage(selection) {
        return selection.verses.map(function (verse) {
            const label = selection.isCombinedSourcePassage
                ? '<div class="daily-quran-ayah-label">' + htmlEscape(verse.surah + ':' + verse.ayah) + '</div>'
                : '';
            return '<div class="daily-quran-arabic-unit">' +
                label +
                '<div class="daily-quran-arabic" dir="rtl" lang="ar">' + htmlEscape(verse.text) + '</div>' +
            '</div>';
        }).join('');
    }

    function renderDailyQuranVerse(forceNew) {
        const root = document.getElementById('dailyQuranVerseRoot');
        if (!root) return;

        // V56 (audit R9): heavy Quran datasets are lazy — show a quiet
        // placeholder on the dashboard and fill in when they arrive.
        if (typeof quranDataReady === 'function' && !quranDataReady()) {
            if (typeof quranDataStatus === 'function' && quranDataStatus() === 'error') {
                root.innerHTML = '<div class="daily-quran-error"><strong>Quran data did not load.</strong><span>The dashboard requires the validated Arabic and Tevhid Meali data files.</span></div>';
                return;
            }
            root.innerHTML = '<div class="daily-quran-loading">Loading the daily verse…</div>';
            quranEnsureData(function() { renderDailyQuranVerse(forceNew); });
            return;
        }

        const selection = chooseDailyQuranVerse(Boolean(forceNew));
        if (!selection) {
            root.innerHTML = '<div class="daily-quran-error"><strong>Quran data did not load.</strong><span>The dashboard requires the validated Arabic and Tevhid Meali data files.</span></div>';
            return;
        }

        const surahName = selection.surah
            ? selection.surah.number + '. ' + selection.surah.englishName
            : 'Surah ' + selection.surahNumber;
        const surahArabic = selection.surah ? selection.surah.name : '';
        const sourceHref = 'media/quran-reference/tevhid-meali.pdf' +
            (selection.sourcePage ? '#page=' + selection.sourcePage : '');

        root.innerHTML =
            '<div class="daily-quran-reference-row">' +
                '<div class="daily-quran-reference">' + htmlEscape(selection.reference) + '</div>' +
                '<div class="daily-quran-surah-name">' +
                    '<span>' + htmlEscape(surahName) + '</span>' +
                    (surahArabic ? '<span dir="rtl" lang="ar">' + htmlEscape(surahArabic) + '</span>' : '') +
                '</div>' +
            '</div>' +
            '<div class="daily-quran-arabic-stack">' + renderArabicPassage(selection) + '</div>' +
            '<div class="daily-quran-translation">' +
                '<div class="daily-quran-translation-label">Tevhid Meali · Türkçe</div>' +
                '<div lang="tr">' + htmlEscape(selection.translation) + '</div>' +
            '</div>' +
            '<div class="daily-quran-source-row">' +
                '<span>Source text displayed verbatim from the validated Quran library.</span>' +
                '<a href="' + htmlEscape(sourceHref) + '" target="_blank" rel="noopener">' +
                    'Tevhid Meali source' + (selection.sourcePage ? ' · p. ' + selection.sourcePage : '') +
                '</a>' +
            '</div>';
    }

    function dailyQuranNewVerse() {
        renderDailyQuranVerse(true);
    }

    function dailyQuranOpenInReader() {
        const selection = currentSelection || chooseDailyQuranVerse(false);
        if (!selection) return;

        if (typeof go === 'function') go('quranread');
        window.setTimeout(function () {
            if (typeof quranReadJumpTo === 'function') {
                quranReadJumpTo(selection.surahNumber, selection.ayahStart);
            }
        }, 0);
    }

    window.renderDailyQuranVerse = renderDailyQuranVerse;
    window.dailyQuranNewVerse = dailyQuranNewVerse;
    window.dailyQuranOpenInReader = dailyQuranOpenInReader;
    window.DAILY_QURAN = Object.freeze({
        buildPool: buildDailyQuranPool,
        choose: chooseDailyQuranVerse,
        getSelection: function () { return currentSelection; }
    });
})();
