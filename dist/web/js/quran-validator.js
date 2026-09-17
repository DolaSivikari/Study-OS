// ==================== QURAN VALIDATOR (V53) ====================
// Conservative, non-mutating browser adaptation of quran-validator v1.3.0.
// Reference data: window.QURAN_VERSES, imported verbatim from the uploaded
// quran-validator QUL dataset. Validation never changes StudyOS source text,
// user input, Arabic verses, or Tevhid Meali wording.
(function(){
    'use strict';

    const BIDI_CONTROLS = /[\u200c\u200d\u200e\u200f\u061c]/g;
    const ARABIC_CHARS = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const ARABIC_SEGMENTS = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]*/g;
    const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u08D3-\u08FF]/g;
    const ARABIC_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g;
    const ARABIC_PUNCTUATION = /[\u0600-\u0605\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u06DD\u06DE]/g;

    function containsArabic(text) {
        return ARABIC_CHARS.test(String(text || ''));
    }

    function normalizeArabic(text, options) {
        const opts = options || {};
        let result = String(text || '').normalize('NFKC');
        result = result.replace(BIDI_CONTROLS, '');

        // Uthmani superscript alef represents an ordinary alef in imlaei text.
        // Convert it before removing the remaining Quranic marks.
        result = result.replace(/\u0670/g, 'ا');
        result = result.replace(DIACRITICS, '');
        result = result.replace(/ـ/g, '');
        result = result.replace(/[آٱ]/g, 'ا');

        if (opts.stripHamza) {
            result = result
                .replace(/[أإ]/g, 'ا')
                .replace(/[ؤئ]/g, 'ء')
                .replace(/ء(?=ا)/g, '')
                .replace(/\bء/g, '');
        }
        if (opts.normalizeMaqsura) result = result.replace(/ى/g, 'ي');

        // Common spelling/spacing forms accepted by quran-validator tests.
        result = result
            .replace(/اا+/g, 'ا')
            .replace(/بصط/g, 'بسط')
            .replace(/يبصط/g, 'يبسط')
            .replace(/مصيطر/g, 'مسيطر');

        result = result
            .replace(ARABIC_DIGITS, '')
            .replace(ARABIC_PUNCTUATION, ' ')
            .replace(/[\u2000-\u206F]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return result;
    }

    function normalizeLookup(text) {
        return normalizeArabic(text, { stripHamza: true, normalizeMaqsura: true });
    }

    function normalizeCompact(text) {
        return normalizeLookup(text).replace(/\s+/g, '');
    }

    function extractArabicSegments(text) {
        const source = String(text || '');
        const segments = [];
        ARABIC_SEGMENTS.lastIndex = 0;
        let match;
        while ((match = ARABIC_SEGMENTS.exec(source)) !== null) {
            const value = match[0].trim();
            if (!value) continue;
            segments.push({
                text: value,
                startIndex: match.index,
                endIndex: match.index + match[0].length
            });
        }
        return segments;
    }

    function mismatchIndex(input, expected) {
        const max = Math.min(input.length, expected.length);
        for (let i = 0; i < max; i++) {
            if (input[i] !== expected[i]) return i;
        }
        return input.length === expected.length ? -1 : max;
    }

    class StudyOSQuranValidator {
        constructor(options) {
            this.options = Object.assign({ maxSuggestions: 3, minDetectionLength: 10 }, options || {});
            this.verses = (window.QURAN_VERSES || []).map(function(verse, index) {
                return Object.assign({ id: index + 1 }, verse);
            });
            this.surahs = window.QURAN_SURAHS || [];
            this.exactVerseMap = new Map();
            this.verseByReference = new Map();
            this.normalizedVerseMap = new Map();
            this.compactVerseMap = new Map();
            this.normalizedCorpus = '';

            const corpus = [];
            this.verses.forEach((verse) => {
                const reference = verse.surah + ':' + verse.ayah;
                this.exactVerseMap.set(verse.text, verse);
                this.verseByReference.set(reference, verse);

                const keys = new Set([
                    normalizeLookup(verse.text),
                    normalizeLookup(verse.textSimple || '')
                ]);
                keys.forEach((key) => {
                    if (!key) return;
                    const list = this.normalizedVerseMap.get(key) || [];
                    list.push(verse);
                    this.normalizedVerseMap.set(key, list);
                    corpus.push(key);
                });

                const compactKeys = new Set([
                    normalizeCompact(verse.text),
                    normalizeCompact(verse.textSimple || '')
                ]);
                compactKeys.forEach((key) => {
                    if (!key) return;
                    const list = this.compactVerseMap.get(key) || [];
                    list.push(verse);
                    this.compactVerseMap.set(key, list);
                });
            });
            this.normalizedCorpus = corpus.join(' ');
        }

        isReady() {
            return this.verses.length === 6236 && this.verseByReference.size === 6236;
        }

        validate(text) {
            const trimmed = String(text || '').trim();
            const normalizedInput = normalizeArabic(trimmed);
            if (!trimmed || !containsArabic(trimmed)) return this.noMatch(normalizedInput);

            const exact = this.exactVerseMap.get(trimmed);
            if (exact) return this.createResult(exact, 'exact', normalizedInput);

            const lookup = normalizeLookup(trimmed);
            const normalizedMatches = this.normalizedVerseMap.get(lookup);
            if (normalizedMatches && normalizedMatches.length) {
                return this.createResultWithSuggestions(normalizedMatches, 'normalized', normalizedInput);
            }

            // Quran-validator accepts a small number of legitimate Uthmani/common
            // spelling and spacing variants. Compact comparison is used only after
            // full normalized matching, and still requires the complete verse.
            const compact = normalizeCompact(trimmed);
            const compactMatches = this.compactVerseMap.get(compact);
            if (compactMatches && compactMatches.length) {
                return this.createResultWithSuggestions(compactMatches, 'normalized', normalizedInput);
            }

            return this.noMatch(normalizedInput);
        }

        validateAgainst(text, reference) {
            const trimmed = String(text || '').trim();
            const normalizedInput = normalizeArabic(trimmed);
            const range = this.parseReference(reference);
            if (!range) return this.noMatch(normalizedInput);

            const expected = this.getVerseRange(range.surah, range.startAyah, range.endAyah);
            if (!expected) return this.noMatch(normalizedInput);

            if (trimmed === expected.text) {
                return {
                    isValid: true,
                    matchType: 'exact',
                    matchedVerse: expected.verses[0],
                    matchedVerses: expected.verses,
                    reference: range.label,
                    normalizedInput,
                    expectedNormalized: normalizeArabic(expected.text),
                    canonicalText: expected.text
                };
            }

            const inputLookup = normalizeLookup(trimmed);
            const expectedLookup = normalizeLookup(expected.text);
            const compactMatch = normalizeCompact(trimmed) === normalizeCompact(expected.text);
            if (inputLookup === expectedLookup || compactMatch) {
                return {
                    isValid: true,
                    matchType: 'normalized',
                    matchedVerse: expected.verses[0],
                    matchedVerses: expected.verses,
                    reference: range.label,
                    normalizedInput,
                    expectedNormalized: normalizeArabic(expected.text),
                    canonicalText: expected.text
                };
            }

            return {
                isValid: false,
                matchType: 'none',
                reference: range.label,
                matchedVerse: expected.verses[0],
                matchedVerses: expected.verses,
                normalizedInput,
                expectedNormalized: normalizeArabic(expected.text),
                mismatchIndex: mismatchIndex(inputLookup, expectedLookup),
                canonicalText: expected.text
            };
        }

        detectAndValidate(text) {
            const segments = extractArabicSegments(text)
                .filter((segment) => segment.text.length >= this.options.minDetectionLength)
                .map((segment) => Object.assign({}, segment, { validation: this.validate(segment.text) }));
            return {
                detected: segments.some((segment) => segment.validation && segment.validation.isValid),
                segments
            };
        }

        getVerse(surah, ayah) {
            return this.verseByReference.get(Number(surah) + ':' + Number(ayah));
        }

        getVerseRange(surah, startAyah, endAyah) {
            const s = Number(surah);
            const start = Number(startAyah);
            const end = Number(endAyah);
            if (!s || !start || !end || start > end) return undefined;
            const verses = [];
            for (let ayah = start; ayah <= end; ayah++) {
                const verse = this.getVerse(s, ayah);
                if (!verse) return undefined;
                verses.push(verse);
            }
            return {
                text: verses.map((verse) => verse.text).join(' '),
                textSimple: verses.map((verse) => verse.textSimple).join(' '),
                verses
            };
        }

        getSurah(surahNumber) {
            return this.surahs.find((surah) => surah.number === Number(surahNumber));
        }

        getAllSurahs() {
            return this.surahs.slice();
        }

        search(query, limit) {
            const normalizedQuery = normalizeLookup(String(query || '').trim());
            if (!normalizedQuery) return [];
            const maximum = Number(limit) > 0 ? Number(limit) : 10;
            const results = [];
            this.verses.forEach((verse) => {
                const normalizedVerse = normalizeLookup(verse.text);
                if (normalizedVerse.indexOf(normalizedQuery) !== -1) {
                    const ratio = normalizedQuery.length / Math.max(1, normalizedVerse.length);
                    results.push({ verse, similarity: 0.7 + ratio * 0.3 });
                } else if (normalizedQuery.indexOf(normalizedVerse) !== -1) {
                    const ratio = normalizedVerse.length / Math.max(1, normalizedQuery.length);
                    results.push({ verse, similarity: 0.5 + ratio * 0.3 });
                }
            });
            return results.sort((a, b) => b.similarity - a.similarity).slice(0, maximum);
        }

        analyzeFabrication(text) {
            const normalizedInput = normalizeArabic(text);
            const words = normalizedInput.split(/\s+/).filter(Boolean);
            const lookupWords = normalizeLookup(text).split(/\s+/).filter(Boolean);
            const results = [];
            lookupWords.forEach((word, index) => {
                const valid = this.normalizedCorpus.indexOf(word) !== -1;
                results.push({ word: words[index] || word, isFabricated: !valid });
            });
            const fabricatedWords = results.filter((word) => word.isFabricated).length;
            return {
                normalizedInput,
                words: results,
                stats: {
                    totalWords: results.length,
                    fabricatedWords,
                    fabricatedRatio: results.length ? fabricatedWords / results.length : 0
                }
            };
        }

        parseReference(reference) {
            const match = String(reference || '').trim().match(/^(\d+):(\d+)(?:-(\d+))?$/);
            if (!match) return null;
            const surah = parseInt(match[1], 10);
            const startAyah = parseInt(match[2], 10);
            const endAyah = match[3] ? parseInt(match[3], 10) : startAyah;
            if (surah < 1 || surah > 114 || startAyah < 1 || endAyah < startAyah) return null;
            if (!this.getVerse(surah, startAyah) || !this.getVerse(surah, endAyah)) return null;
            return {
                surah,
                startAyah,
                endAyah,
                label: surah + ':' + startAyah + (endAyah === startAyah ? '' : '-' + endAyah)
            };
        }

        createResult(verse, matchType, normalizedInput) {
            return {
                isValid: true,
                matchType,
                matchedVerse: verse,
                matchedVerses: [verse],
                reference: verse.surah + ':' + verse.ayah,
                normalizedInput,
                canonicalText: verse.text
            };
        }

        createResultWithSuggestions(matches, matchType, normalizedInput) {
            const result = this.createResult(matches[0], matchType, normalizedInput);
            if (matches.length > 1) {
                result.suggestions = matches.slice(0, this.options.maxSuggestions).map((verse) => ({
                    verse,
                    reference: verse.surah + ':' + verse.ayah
                }));
            }
            return result;
        }

        noMatch(normalizedInput) {
            return { isValid: false, matchType: 'none', normalizedInput: normalizedInput || '' };
        }
    }

    window.StudyOSQuranValidator = StudyOSQuranValidator;
    window.quranValidatorNormalizeArabic = normalizeArabic;
    window.quranValidatorContainsArabic = containsArabic;
    window.quranValidatorExtractArabicSegments = extractArabicSegments;
    window.QURAN_VALIDATOR = new StudyOSQuranValidator();
    window.QURAN_VALIDATOR_META = Object.freeze({
        package: 'quran-validator',
        version: '1.3.0',
        mode: 'non-mutating',
        referenceVerses: 6236,
        source: 'QUL / uploaded quran-validator dataset',
        datasetSha256: 'ddd89dcb757453fe93811cb2a745ef8ba7a0ce97cd7125fcf5ee8932cddfb653'
    });
})();
