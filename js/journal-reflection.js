// ==================== JOURNAL REFLECTION UI (V63) ====================
//
// Binds the reflection formats (data/reflection-formats.js) and the writing
// coach (js/writing-coach.js) into the journal modal and the Journal page.
//
// BACKWARD COMPATIBILITY
// Structured entries still write the composed prose into `entry.content`, the
// field every existing surface reads — the journal list, the search index, the
// dashboard, export. Older free-text entries keep working untouched. The new
// fields (`formatId`, `sections`, `revisitAt`, `revisitCount`, `revisitClosed`)
// are purely additive, so no storage key changed and no migration was needed.

var journalActiveFormat = 'aar';

function journalFormatList() {
    return (window.STUDYOS_WRITING && window.STUDYOS_WRITING.formats()) || [];
}

function journalRenderFormatPicker() {
    var host = document.getElementById('journalFormatPicker');
    if (!host) return;
    host.innerHTML = journalFormatList().map(function (f) {
        var active = f.id === journalActiveFormat;
        return '<button type="button" class="journal-format-btn' + (active ? ' active' : '') + '"' +
            ' onclick="journalSetFormat(\'' + f.id + '\')" aria-pressed="' + active + '"' +
            ' title="' + esc(f.bestFor) + '"><span>' + f.icon + '</span>' + esc(f.short) + '</button>';
    }).join('');

    var fmt = window.STUDYOS_WRITING.format(journalActiveFormat);
    var why = document.getElementById('journalFormatWhy');
    if (why && fmt) {
        why.innerHTML = fmt.id === 'free' ? '<em>' + esc(fmt.why) + '</em>'
            : '<strong>' + esc(fmt.name) + '</strong> — ' + esc(fmt.bestFor) +
              '<span class="journal-format-origin">' + esc(fmt.why) + '</span>' +
              (fmt.origin && fmt.origin !== '—' ? '<span class="journal-format-source">Source: ' + esc(fmt.origin) + '</span>' : '');
    }
}

function journalSetFormat(id) {
    journalActiveFormat = id;
    journalRenderFormatPicker();
    journalRenderSections();
}

function journalRenderSections() {
    var host = document.getElementById('journalSections');
    var freeEditor = document.getElementById('journalFreeWrap');
    if (!host) return;
    var fmt = window.STUDYOS_WRITING.format(journalActiveFormat);

    if (!fmt || fmt.id === 'free') {
        host.innerHTML = '';
        host.hidden = true;
        if (freeEditor) freeEditor.hidden = false;
        return;
    }
    host.hidden = false;
    if (freeEditor) freeEditor.hidden = true;

    host.innerHTML = fmt.sections.map(function (sec) {
        var stems = (sec.stems || []).map(function (s) {
            return '<button type="button" class="journal-stem" onclick="journalInsertStem(\'' + sec.id + '\', this)">' + esc(s) + '…</button>';
        }).join('');
        return '<div class="journal-section" data-section="' + sec.id + '">' +
            '<div class="journal-section-head">' +
                '<label for="jsec-' + sec.id + '">' + esc(sec.label) +
                    (sec.required ? '<span class="journal-req" title="The step that makes the entry worth writing">core</span>' : '') +
                '</label>' +
                '<span class="journal-section-hint">' + esc(sec.hint || '') + '</span>' +
            '</div>' +
            (stems ? '<div class="journal-stems">' + stems + '</div>' : '') +
            '<textarea class="form-textarea journal-section-input" id="jsec-' + sec.id + '" rows="3" ' +
                'oninput="journalCoachRefresh(\'' + sec.id + '\')" placeholder="…"></textarea>' +
            '<div class="journal-coach" id="jcoach-' + sec.id + '"></div>' +
        '</div>';
    }).join('');
}

function journalInsertStem(sectionId, btn) {
    var el = document.getElementById('jsec-' + sectionId);
    if (!el) return;
    var stem = (btn.textContent || '').replace(/…$/, '');
    var cur = el.value;
    el.value = cur && !/\s$/.test(cur) ? cur + ' ' + stem + ' ' : cur + stem + ' ';
    el.focus();
    el.selectionStart = el.selectionEnd = el.value.length;
    journalCoachRefresh(sectionId);
}

function journalCoachRefresh(sectionId) {
    var W = window.STUDYOS_WRITING;
    var el = document.getElementById('jsec-' + sectionId);
    var host = document.getElementById('jcoach-' + sectionId);
    if (!W || !el || !host) return;

    var fmt = W.format(journalActiveFormat);
    var section = (fmt.sections || []).filter(function (s) { return s.id === sectionId; })[0];
    var review = W.reviewSection(el.value, section);

    if (!review.stats.words) { host.innerHTML = ''; journalUpdateEntryStats(); return; }

    var chips = review.findings.map(function (f) {
        var sugg = (f.suggestions || []).length
            ? '<span class="journal-coach-sugg">' + f.suggestions.slice(0, 4).map(esc).join(' · ') + '</span>'
            : '';
        return '<div class="journal-coach-item" data-type="' + f.type + '">' +
            '<strong>' + esc(f.message) + '</strong><span>' + esc(f.detail) + '</span>' + sugg +
        '</div>';
    }).join('');

    host.innerHTML =
        '<div class="journal-coach-stats">' + review.stats.words + ' words · ' +
            review.stats.sentences + ' sentence' + (review.stats.sentences === 1 ? '' : 's') +
            (review.stats.longestSentenceWords ? ' · longest ' + review.stats.longestSentenceWords + 'w' : '') +
        '</div>' + chips;
    journalUpdateEntryStats();
}

function journalCollectSections() {
    var fmt = window.STUDYOS_WRITING.format(journalActiveFormat);
    var out = {};
    if (!fmt || fmt.id === 'free') return out;
    fmt.sections.forEach(function (sec) {
        var el = document.getElementById('jsec-' + sec.id);
        out[sec.id] = el ? el.value.trim() : '';
    });
    return out;
}

// Structured sections are composed into the same `content` HTML every other
// surface already reads, so nothing downstream needs to know about formats.
function journalComposeContent(formatId, sections) {
    var fmt = window.STUDYOS_WRITING.format(formatId);
    if (!fmt || fmt.id === 'free') return '';
    return fmt.sections.map(function (sec) {
        var text = (sections[sec.id] || '').trim();
        if (!text) return '';
        return '<h2>' + esc(sec.label) + '</h2><p>' + esc(text).replace(/\n/g, '<br>') + '</p>';
    }).filter(Boolean).join('');
}

function journalUpdateEntryStats() {
    var W = window.STUDYOS_WRITING;
    var el = document.getElementById('journalWordCount');
    if (!W || !el) return;
    var fmt = W.format(journalActiveFormat);
    if (!fmt || fmt.id === 'free') return;   // free mode keeps the original counter
    var all = Object.values(journalCollectSections()).join(' ');
    var stats = W.stats(all);
    var missing = W.missingRequired({ formatId: journalActiveFormat, sections: journalCollectSections() });
    el.textContent = stats.words + ' words' + (missing.length ? ' · still open: ' + missing.join(', ') : '');
    el.className = missing.length ? 'journal-count-open' : '';
}

// ---- revisit queue on the Journal page --------------------------------

function journalRenderRevisitQueue() {
    var host = document.getElementById('journalRevisitQueue');
    if (!host) return;
    var W = window.STUDYOS_WRITING;
    if (!W) { host.innerHTML = ''; return; }
    var due = W.dueForRevisit(arr(K.journal), today());
    if (!due.length) { host.innerHTML = ''; host.hidden = true; return; }
    host.hidden = false;
    host.innerHTML =
        '<div class="card journal-revisit-card">' +
            '<div class="journal-revisit-head">' +
                '<div><span class="journal-revisit-kicker">Come back to this</span>' +
                '<h3>' + due.length + ' reflection' + (due.length === 1 ? '' : 's') + ' due for revisit</h3>' +
                '<p>You committed to something. Does it still hold — and did you do it?</p></div>' +
            '</div>' +
            due.slice(0, 4).map(function (e) {
                var fmt = W.format(e.formatId);
                var action = '';
                if (fmt && e.sections) {
                    var actionable = fmt.sections.filter(function (s) { return s.actionable; })[0];
                    if (actionable) action = e.sections[actionable.id] || '';
                }
                return '<div class="journal-revisit-row">' +
                    '<div><strong>' + esc(e.title || 'Untitled') + '</strong>' +
                    '<span class="journal-revisit-date">' + esc(e.date || '') + ' · ' + esc((fmt && fmt.short) || '') + '</span>' +
                    (action ? '<p class="journal-revisit-action">“' + esc(action.slice(0, 160)) + '”</p>' : '') + '</div>' +
                    '<div class="journal-revisit-actions">' +
                        '<button class="btn btn-secondary btn-sm" type="button" onclick="journalRevisitDone(\'' + esc(e.id) + '\', true)">Held up</button>' +
                        '<button class="btn btn-secondary btn-sm" type="button" onclick="journalRevisitDone(\'' + esc(e.id) + '\', false)">Did not</button>' +
                        '<button class="btn btn-ghost btn-sm" type="button" onclick="editJournal(\'' + esc(e.id) + '\')">Open</button>' +
                    '</div>' +
                '</div>';
            }).join('') +
        '</div>';
}

// Answering a revisit is itself evidence — it feeds the same expanding
// schedule the flashcard engine uses, so your own words get spaced review.
function journalRevisitDone(id, heldUp) {
    var W = window.STUDYOS_WRITING;
    var entries = arr(K.journal);
    var i = entries.findIndex(function (e) { return e.id === id; });
    if (i === -1) return;
    var e = entries[i];
    e.revisitCount = (e.revisitCount || 0) + 1;
    e.revisitLog = (e.revisitLog || []).concat([{ at: today(), heldUp: !!heldUp }]);
    if (e.revisitCount >= W.REVISIT_DAYS.length) {
        e.revisitClosed = true;
    } else {
        e.revisitAt = W.nextRevisitDate(e, today());
    }
    entries[i] = e;
    set(K.journal, entries);
    if (typeof toast === 'function') toast(heldUp ? 'Logged — it held up.' : 'Logged. Worth asking why not.');
    journalRenderRevisitQueue();
    if (typeof renderJournal === 'function') renderJournal();
}
