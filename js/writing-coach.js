// ==================== WRITING COACH (V63) ====================
//
// Scaffolding and feedback for structured reflection, aimed at a writer whose
// first language is not English.
//
// WHAT THIS IS NOT
// Not a grammar checker, not a spell checker, and not an AI rewriter. StudyOS
// is offline-first with no model available, and a tool that silently rewrites
// your sentences would defeat the purpose anyway — the goal is that YOU write
// better, not that the app writes for you.
//
// WHAT IT ACTUALLY DOES
// Deterministic, explainable checks over what you wrote:
//   * flags words that carry little information, and offers precise
//     construction/PM alternatives next to them
//   * flags hedging that makes a reflection unfalsifiable
//   * flags sentences long enough to have lost their subject
//   * checks that a section marked `actionable` contains a real commitment
//   * reports length so you can see effort honestly
//
// Every finding names its reason and can be ignored. None of it blocks saving.
// It is a mirror, not a gate.

(function () {
    'use strict';

    var LONG_SENTENCE_WORDS = 32;
    var HEDGE_RATIO_LIMIT = 0.04;   // >4% of words hedging reads as evasive

    function formats() { return window.STUDYOS_REFLECTION_FORMATS || []; }
    function vocab() { return window.STUDYOS_PRECISION_VOCAB || {}; }
    function hedges() { return window.STUDYOS_HEDGE_WORDS || []; }
    function actionVerbs() { return window.STUDYOS_ACTION_VERBS || []; }

    function writingFormat(id) {
        var list = formats();
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
        return list[0] || null;
    }

    // Strip HTML so checks run on prose, not markup.
    function plainText(html) {
        if (!html) return '';
        var d = document.createElement('div');
        d.innerHTML = String(html);
        return (d.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function words(text) {
        return String(text || '').toLowerCase().match(/[a-zà-ÿ'’-]+/g) || [];
    }

    function sentences(text) {
        return String(text || '')
            .split(/(?<=[.!?])\s+|\n+/)
            .map(function (s) { return s.trim(); })
            .filter(Boolean);
    }

    function writingStats(text) {
        var t = plainText(text);
        var w = words(t);
        var s = sentences(t);
        var lengths = s.map(function (x) { return words(x).length; });
        var longest = lengths.length ? Math.max.apply(null, lengths) : 0;
        return {
            characters: t.length,
            words: w.length,
            sentences: s.length,
            avgSentenceWords: s.length ? Math.round((w.length / s.length) * 10) / 10 : 0,
            longestSentenceWords: longest
        };
    }

    // ---- checks --------------------------------------------------------
    // Each returns findings: {type, severity, message, detail, suggestions}
    // severity: 'info' | 'suggest' — never 'error'. Nothing here is wrong.

    // Terms whose vagueness is CURED by a number in the same sentence.
    // "late" is vague; "90 minutes late" is not. Flagging the second would be
    // a false positive on exactly the writing this tool is trying to produce,
    // and false positives are what teach you to ignore the panel.
    var QUANTIFIABLE = {
        'late': 1, 'fast': 1, 'big': 1, 'small': 1, 'a lot': 1, 'lots of': 1,
        'a bit': 1, 'really': 1, 'very': 1
    };
    var HAS_NUMBER = /\d/;

    function checkPrecision(text) {
        var plain = plainText(text);
        var t = ' ' + plain.toLowerCase() + ' ';
        var sents = sentences(plain).map(function (s) { return s.toLowerCase(); });
        var v = vocab();
        var found = [];
        Object.keys(v).forEach(function (term) {
            var escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            var re = new RegExp('(?:^|[^a-z])' + escaped + '(?![a-z])', 'g');
            var count = (t.match(re) || []).length;
            if (!count) return;
            if (QUANTIFIABLE[term]) {
                // Count only the occurrences in sentences with no quantity.
                var unquantified = sents.filter(function (s) {
                    return new RegExp('(?:^|[^a-z])' + escaped + '(?![a-z])').test(s) && !HAS_NUMBER.test(s);
                }).length;
                if (!unquantified) return;
                count = unquantified;
            }
            var suggestions = (v[term] || []).filter(function (s) { return s !== '—'; });
            found.push({ term: term, count: count, suggestions: suggestions });
        });
        found.sort(function (a, b) { return b.count - a.count; });
        return found.slice(0, 6).map(function (f) {
            return {
                type: 'precision',
                severity: 'suggest',
                message: '“' + f.term + '”' + (f.count > 1 ? ' ×' + f.count : ''),
                detail: f.suggestions.length
                    ? 'Carries little information here.'
                    : 'Adds emphasis but no information — the sentence is usually stronger without it.',
                suggestions: f.suggestions
            };
        });
    }

    function checkHedging(text) {
        var t = ' ' + plainText(text).toLowerCase() + ' ';
        var total = words(t).length;
        if (total < 25) return [];
        var hits = [];
        var count = 0;
        hedges().forEach(function (h) {
            var re = new RegExp('(?:^|[^a-z])' + h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z])', 'g');
            var n = (t.match(re) || []).length;
            if (n) { count += n; hits.push(h); }
        });
        if (!count || count / total < HEDGE_RATIO_LIMIT) return [];
        return [{
            type: 'hedging',
            severity: 'suggest',
            message: count + ' hedging phrase' + (count === 1 ? '' : 's'),
            detail: 'Found: ' + hits.slice(0, 4).join(', ') + '. A reflection you cannot be wrong about teaches you nothing later. State it plainly, or say what would settle it.',
            suggestions: []
        }];
    }

    function checkSentenceLength(text) {
        var long = sentences(plainText(text)).filter(function (s) {
            return words(s).length > LONG_SENTENCE_WORDS;
        });
        if (!long.length) return [];
        return [{
            type: 'length',
            severity: 'suggest',
            message: long.length + ' long sentence' + (long.length === 1 ? '' : 's'),
            detail: 'Over ' + LONG_SENTENCE_WORDS + ' words. Splitting at the first “and” or “because” usually makes the point sharper — and is the fastest way to sound more fluent in a second language.',
            suggestions: []
        }];
    }

    // A section flagged `actionable` should contain a commitment you could
    // check next week — not an intention.
    function checkActionable(text) {
        var t = plainText(text).toLowerCase();
        if (!t) return [];
        var hasVerb = actionVerbs().some(function (v) {
            return new RegExp('(?:^|[^a-z])' + v + '(?![a-z])').test(t);
        });
        if (hasVerb) return [];
        return [{
            type: 'actionable',
            severity: 'suggest',
            message: 'No checkable action yet',
            detail: 'This section is where the entry earns its keep. Name something you could tick off next week — who you will ask, what you will verify, what you will draft.',
            suggestions: ['Next time I will', 'I will confirm', 'I will ask', 'I will document']
        }];
    }

    // Full review of one section.
    function reviewSection(text, section) {
        var findings = [];
        var stats = writingStats(text);
        if (stats.words === 0) return { stats: stats, findings: findings };
        findings = findings
            .concat(checkPrecision(text))
            .concat(checkHedging(text))
            .concat(checkSentenceLength(text));
        if (section && section.actionable) findings = findings.concat(checkActionable(text));
        return { stats: stats, findings: findings };
    }

    // Review a whole entry: {formatId, sections:{id:text}}
    function reviewEntry(entry) {
        var fmt = writingFormat(entry && entry.formatId);
        var out = { formatId: fmt ? fmt.id : 'free', sections: {}, stats: null, findings: [] };
        var all = '';
        (fmt ? fmt.sections : []).forEach(function (sec) {
            var text = (entry && entry.sections && entry.sections[sec.id]) || '';
            all += ' ' + plainText(text);
            out.sections[sec.id] = reviewSection(text, sec);
        });
        out.stats = writingStats(all);
        Object.keys(out.sections).forEach(function (id) {
            out.sections[id].findings.forEach(function (f) {
                out.findings.push(Object.assign({ section: id }, f));
            });
        });
        return out;
    }

    // Missing required sections — reported, never enforced.
    function missingRequired(entry) {
        var fmt = writingFormat(entry && entry.formatId);
        if (!fmt) return [];
        return fmt.sections.filter(function (sec) {
            if (!sec.required) return false;
            var text = (entry && entry.sections && entry.sections[sec.id]) || '';
            return plainText(text).length === 0;
        }).map(function (sec) { return sec.label; });
    }

    // ---- resurfacing ---------------------------------------------------
    // Reflection without revisit is not learning. Entries carrying a
    // commitment get a revisit date; the Journal surfaces them when due.
    // Intervals are the same expanding schedule the flashcard engine uses.

    var REVISIT_DAYS = [7, 30, 90];

    function nextRevisitDate(entry, fromDate) {
        var done = (entry && entry.revisitCount) || 0;
        var days = REVISIT_DAYS[Math.min(done, REVISIT_DAYS.length - 1)];
        var base = fromDate ? new Date(fromDate) : new Date();
        base.setDate(base.getDate() + days);
        return base.toISOString().slice(0, 10);
    }

    function dueForRevisit(entries, todayStr) {
        var t = todayStr || new Date().toISOString().slice(0, 10);
        return (entries || []).filter(function (e) {
            return e && e.revisitAt && !e.revisitClosed && e.revisitAt <= t;
        }).sort(function (a, b) { return a.revisitAt < b.revisitAt ? -1 : 1; });
    }

    // Does an entry deserve a revisit? Only if it committed to something.
    function shouldSchedule(entry) {
        var fmt = writingFormat(entry && entry.formatId);
        if (!fmt) return false;
        var actionSections = fmt.sections.filter(function (s) { return s.actionable; });
        if (!actionSections.length) return false;
        return actionSections.some(function (s) {
            var text = (entry.sections && entry.sections[s.id]) || '';
            return plainText(text).length > 0;
        });
    }

    window.STUDYOS_WRITING = {
        formats: formats,
        format: writingFormat,
        plainText: plainText,
        stats: writingStats,
        sentences: sentences,
        words: words,
        reviewSection: reviewSection,
        reviewEntry: reviewEntry,
        missingRequired: missingRequired,
        nextRevisitDate: nextRevisitDate,
        dueForRevisit: dueForRevisit,
        shouldSchedule: shouldSchedule,
        REVISIT_DAYS: REVISIT_DAYS
    };
})();
