// ==================== QURAN STUDY TOOLS (V54) ====================
// Browser adaptation of selected quran.sh study patterns: bookmarks,
// reflections, browsing/reading tracking, completion, and streak statistics.
// User-created records are stored separately from Quran Arabic and Tevhid
// Meali source data and are always labelled as personal data.

const QURAN_STUDY_KEY = K.quranStudyData;
const QURAN_STUDY_VERSION = 1;
const QURAN_STUDY_PERIODS = ['today', 'week', 'month', 'all'];
let quranStudyObserver = null;
let quranStudyVisibilityTimers = new Map();
let quranStudyPanelOpen = false;
let quranStudyStatsPeriod = 'week';

function quranStudyDefaultState() {
    return {
        version: QURAN_STUDY_VERSION,
        trackingEnabled: false,
        bookmarks: {},
        reflections: {},
        readingLog: {},
        completedSurahs: {},
        lastReadAt: null
    };
}

function quranStudyNormalizeState(raw) {
    const base = quranStudyDefaultState();
    const state = raw && typeof raw === 'object' ? raw : {};
    base.trackingEnabled = state.trackingEnabled === true;
    base.bookmarks = state.bookmarks && typeof state.bookmarks === 'object' ? state.bookmarks : {};
    base.reflections = state.reflections && typeof state.reflections === 'object' ? state.reflections : {};
    base.readingLog = state.readingLog && typeof state.readingLog === 'object' ? state.readingLog : {};
    base.completedSurahs = state.completedSurahs && typeof state.completedSurahs === 'object' ? state.completedSurahs : {};
    base.lastReadAt = typeof state.lastReadAt === 'string' ? state.lastReadAt : null;
    return base;
}

let quranStudyState = quranStudyNormalizeState(get(QURAN_STUDY_KEY));

function quranStudySave() {
    quranStudyState.version = QURAN_STUDY_VERSION;
    set(QURAN_STUDY_KEY, quranStudyState);
}

function quranStudyLocalDate(date) {
    const d = date instanceof Date ? date : new Date(date || Date.now());
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function quranStudyDateFromLocalKey(key) {
    const parts = String(key || '').split('-').map(Number);
    return new Date(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1, 12, 0, 0, 0);
}

function quranStudyPassageKey(passage) {
    return passage && passage.canonicalKey ? passage.canonicalKey : '';
}

function quranStudyPassageRefs(passage) {
    return passage && Array.isArray(passage.groupedVerses)
        ? passage.groupedVerses.map(function(item) { return item.surah + ':' + item.ayah; })
        : [];
}

function quranStudyBookmark(key) {
    return quranStudyState.bookmarks[key] || null;
}

function quranStudyReflection(key) {
    return quranStudyState.reflections[key] || null;
}

function quranStudyToggleBookmark(key, label, surah, ayah) {
    if (!key) return;
    if (quranStudyState.bookmarks[key]) {
        delete quranStudyState.bookmarks[key];
    } else {
        quranStudyState.bookmarks[key] = {
            key: key,
            label: label || key,
            surah: Number(surah),
            ayah: Number(ayah),
            createdAt: new Date().toISOString()
        };
    }
    quranStudySave();
    quranStudyRefreshUI();
}

function quranStudyOpenReflection(key, label, surah, ayah) {
    const dialog = document.getElementById('quranReflectionDialog');
    const textarea = document.getElementById('quranReflectionText');
    const title = document.getElementById('quranReflectionTitle');
    const keyInput = document.getElementById('quranReflectionKey');
    const labelInput = document.getElementById('quranReflectionLabel');
    const surahInput = document.getElementById('quranReflectionSurah');
    const ayahInput = document.getElementById('quranReflectionAyah');
    const deleteButton = document.getElementById('quranReflectionDelete');
    if (!dialog || !textarea || !keyInput) return;

    const existing = quranStudyReflection(key);
    keyInput.value = key || '';
    labelInput.value = label || key || '';
    surahInput.value = String(surah || '');
    ayahInput.value = String(ayah || '');
    title.textContent = 'Personal reflection · ' + (label || key || 'Quran passage');
    textarea.value = existing ? existing.note : '';
    if (deleteButton) deleteButton.hidden = !existing;
    dialog.hidden = false;
    textarea.focus();
}

function quranStudyCloseReflection() {
    const dialog = document.getElementById('quranReflectionDialog');
    if (dialog) dialog.hidden = true;
}

function quranStudySaveReflection() {
    const keyInput = document.getElementById('quranReflectionKey');
    const labelInput = document.getElementById('quranReflectionLabel');
    const surahInput = document.getElementById('quranReflectionSurah');
    const ayahInput = document.getElementById('quranReflectionAyah');
    const textarea = document.getElementById('quranReflectionText');
    if (!keyInput || !textarea) return;

    const key = keyInput.value;
    const note = textarea.value.trim();
    if (!key) return;
    if (!note) {
        delete quranStudyState.reflections[key];
    } else {
        const previous = quranStudyState.reflections[key];
        const now = new Date().toISOString();
        quranStudyState.reflections[key] = {
            key: key,
            label: labelInput ? labelInput.value : key,
            surah: Number(surahInput ? surahInput.value : 0),
            ayah: Number(ayahInput ? ayahInput.value : 0),
            note: note,
            createdAt: previous ? previous.createdAt : now,
            updatedAt: now
        };
    }
    quranStudySave();
    quranStudyCloseReflection();
    quranStudyRefreshUI();
}

function quranStudyDeleteReflection() {
    const keyInput = document.getElementById('quranReflectionKey');
    if (!keyInput || !keyInput.value) return;
    delete quranStudyState.reflections[keyInput.value];
    quranStudySave();
    quranStudyCloseReflection();
    quranStudyRefreshUI();
}

function quranStudyEnsureDay(dateKey) {
    if (!quranStudyState.readingLog[dateKey] || typeof quranStudyState.readingLog[dateKey] !== 'object') {
        quranStudyState.readingLog[dateKey] = { refs: [], firstReadAt: null, lastReadAt: null };
    }
    const day = quranStudyState.readingLog[dateKey];
    if (!Array.isArray(day.refs)) day.refs = [];
    return day;
}

function quranStudyRecordRefs(refs) {
    const cleaned = Array.from(new Set((refs || []).filter(function(ref) {
        return /^\d{1,3}:\d{1,3}$/.test(String(ref));
    })));
    if (!cleaned.length) return false;

    const now = new Date();
    const dayKey = quranStudyLocalDate(now);
    const day = quranStudyEnsureDay(dayKey);
    const current = new Set(day.refs);
    let changed = false;
    cleaned.forEach(function(ref) {
        if (!current.has(ref)) {
            current.add(ref);
            changed = true;
        }
    });
    if (!changed) return false;

    day.refs = Array.from(current).sort(function(a, b) {
        const pa = a.split(':').map(Number);
        const pb = b.split(':').map(Number);
        return pa[0] - pb[0] || pa[1] - pb[1];
    });
    const stamp = now.toISOString();
    if (!day.firstReadAt) day.firstReadAt = stamp;
    day.lastReadAt = stamp;
    quranStudyState.lastReadAt = stamp;
    quranStudySave();
    quranStudyRefreshUI();
    return true;
}

function quranStudyMarkPassageRead(encodedRefs) {
    const refs = String(encodedRefs || '').split(',').map(function(ref) { return ref.trim(); }).filter(Boolean);
    quranStudyRecordRefs(refs);
}

function quranStudyIsRefReadToday(ref) {
    const day = quranStudyState.readingLog[quranStudyLocalDate()] || {};
    return Array.isArray(day.refs) && day.refs.indexOf(ref) !== -1;
}

function quranStudyAreRefsReadToday(refs) {
    return (refs || []).length > 0 && refs.every(quranStudyIsRefReadToday);
}

function quranStudyToggleTracking() {
    quranStudyState.trackingEnabled = !quranStudyState.trackingEnabled;
    quranStudySave();
    quranStudyRefreshUI();
    quranStudySetupObserver();
}

function quranStudyTogglePanel() {
    quranStudyPanelOpen = !quranStudyPanelOpen;
    const panel = document.getElementById('quranStudyPanel');
    if (panel) panel.hidden = !quranStudyPanelOpen;
    const button = document.getElementById('quranStudyPanelButton');
    if (button) button.setAttribute('aria-expanded', quranStudyPanelOpen ? 'true' : 'false');
}

function quranStudySetStatsPeriod(period) {
    if (QURAN_STUDY_PERIODS.indexOf(period) === -1) return;
    quranStudyStatsPeriod = period;
    quranStudyRefreshPanel();
}

function quranStudyPeriodStart(period, now) {
    const end = new Date(now || Date.now());
    end.setHours(0, 0, 0, 0);
    if (period === 'today') return end;
    if (period === 'week') {
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return start;
    }
    if (period === 'month') {
        const start = new Date(end);
        start.setDate(start.getDate() - 29);
        return start;
    }
    return null;
}

function quranStudyRefsForPeriod(period) {
    const start = quranStudyPeriodStart(period);
    const refs = new Set();
    Object.keys(quranStudyState.readingLog).forEach(function(dateKey) {
        if (start && quranStudyDateFromLocalKey(dateKey) < start) return;
        const day = quranStudyState.readingLog[dateKey];
        (day && Array.isArray(day.refs) ? day.refs : []).forEach(function(ref) { refs.add(ref); });
    });
    return refs;
}

function quranStudyCalculateStreaks(todayKey) {
    const dates = Object.keys(quranStudyState.readingLog).filter(function(dateKey) {
        const day = quranStudyState.readingLog[dateKey];
        return day && Array.isArray(day.refs) && day.refs.length > 0;
    }).sort();
    if (!dates.length) return { current: 0, longest: 0, totalDays: 0 };

    let longest = 1;
    let run = 1;
    for (let i = 1; i < dates.length; i++) {
        const diff = Math.round((quranStudyDateFromLocalKey(dates[i]) - quranStudyDateFromLocalKey(dates[i - 1])) / 86400000);
        run = diff === 1 ? run + 1 : 1;
        if (run > longest) longest = run;
    }

    const today = quranStudyDateFromLocalKey(todayKey || quranStudyLocalDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last = quranStudyDateFromLocalKey(dates[dates.length - 1]);
    const lastGap = Math.round((today - last) / 86400000);
    let current = 0;
    if (lastGap === 0 || lastGap === 1) {
        current = 1;
        for (let i = dates.length - 1; i > 0; i--) {
            const diff = Math.round((quranStudyDateFromLocalKey(dates[i]) - quranStudyDateFromLocalKey(dates[i - 1])) / 86400000);
            if (diff !== 1) break;
            current++;
        }
    }
    return { current: current, longest: longest, totalDays: dates.length };
}

function quranStudyStats(period) {
    const refs = quranStudyRefsForPeriod(period || quranStudyStatsPeriod);
    const surahs = new Set();
    refs.forEach(function(ref) { surahs.add(Number(ref.split(':')[0])); });
    const streaks = quranStudyCalculateStreaks();
    return {
        versesRead: refs.size,
        surahsTouched: surahs.size,
        completedSurahs: Object.keys(quranStudyState.completedSurahs).length,
        bookmarks: Object.keys(quranStudyState.bookmarks).length,
        reflections: Object.keys(quranStudyState.reflections).length,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        totalDays: streaks.totalDays
    };
}

function quranStudyToggleSurahComplete(surahNumber) {
    const key = String(Number(surahNumber));
    if (!key || key === '0') return;
    if (quranStudyState.completedSurahs[key]) {
        delete quranStudyState.completedSurahs[key];
    } else {
        quranStudyState.completedSurahs[key] = { completedAt: new Date().toISOString() };
        const refs = (window.QURAN_VERSES || []).filter(function(v) { return v.surah === Number(surahNumber); })
            .map(function(v) { return v.surah + ':' + v.ayah; });
        quranStudyRecordRefs(refs);
    }
    quranStudySave();
    if (typeof renderQuranRead === 'function') renderQuranRead();
}

function quranStudyIsSurahComplete(surahNumber) {
    return Boolean(quranStudyState.completedSurahs[String(Number(surahNumber))]);
}

function quranStudyOpenReference(surah, ayah) {
    quranStudyPanelOpen = false;
    if (typeof quranReadJumpTo === 'function') quranReadJumpTo(Number(surah), Number(ayah));
}

function quranStudyRemoveBookmark(key) {
    if (!key) return;
    delete quranStudyState.bookmarks[key];
    quranStudySave();
    quranStudyRefreshUI();
}

function quranStudyPanelPeriodLabel(period) {
    return { today: 'Today', week: '7 days', month: '30 days', all: 'All time' }[period] || '7 days';
}

function quranStudyRenderPanel() {
    const stats = quranStudyStats(quranStudyStatsPeriod);
    const bookmarks = Object.values(quranStudyState.bookmarks).sort(function(a, b) {
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
    const reflections = Object.values(quranStudyState.reflections).sort(function(a, b) {
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    });

    const periodButtons = QURAN_STUDY_PERIODS.map(function(period) {
        return '<button class="filter-btn ' + (period === quranStudyStatsPeriod ? 'active' : '') + '" type="button" onclick="quranStudySetStatsPeriod(\'' + period + '\')">' + esc(quranStudyPanelPeriodLabel(period)) + '</button>';
    }).join('');

    const bookmarkRows = bookmarks.length ? bookmarks.map(function(item) {
        return '<div class="quran-study-list-row">' +
            '<button type="button" class="quran-study-list-main" onclick="quranStudyOpenReference(' + Number(item.surah) + ',' + Number(item.ayah) + ')">' +
                '<strong>' + esc(item.label || item.key) + '</strong><span>Open passage</span>' +
            '</button>' +
            '<button type="button" class="quran-study-remove" onclick="quranStudyRemoveBookmark(\'' + esc(item.key) + '\')" aria-label="Remove bookmark">×</button>' +
        '</div>';
    }).join('') : '<p class="quran-study-empty">No bookmarks yet.</p>';

    const reflectionRows = reflections.length ? reflections.map(function(item) {
        const excerpt = item.note.length > 140 ? item.note.slice(0, 140) + '…' : item.note;
        return '<button type="button" class="quran-study-reflection-row" onclick="quranStudyOpenReference(' + Number(item.surah) + ',' + Number(item.ayah) + ')">' +
            '<strong>' + esc(item.label || item.key) + '</strong>' +
            '<span>' + esc(excerpt) + '</span>' +
        '</button>';
    }).join('') : '<p class="quran-study-empty">No personal reflections yet.</p>';

    return '<section class="card quran-study-panel" id="quranStudyPanel" ' + (quranStudyPanelOpen ? '' : 'hidden') + '>' +
        '<header class="quran-study-panel-head">' +
            '<div><h3>My Quran study</h3><p>Personal records are stored separately from Quran and meal text.</p></div>' +
            '<button class="btn btn-secondary btn-sm" type="button" onclick="quranStudyTogglePanel()">Close</button>' +
        '</header>' +
        '<div class="quran-study-tracking-row">' +
            '<div><strong>' + (quranStudyState.trackingEnabled ? 'Reading tracking on' : 'Browsing only') + '</strong><span>' + (quranStudyState.trackingEnabled ? 'Visible passages are logged after a brief pause.' : 'Nothing is logged automatically.') + '</span></div>' +
            '<button class="btn ' + (quranStudyState.trackingEnabled ? 'btn-primary' : 'btn-secondary') + ' btn-sm" type="button" onclick="quranStudyToggleTracking()">' + (quranStudyState.trackingEnabled ? 'Turn tracking off' : 'Turn tracking on') + '</button>' +
        '</div>' +
        '<div class="filter-bar quran-study-periods" role="group" aria-label="Reading statistics period">' + periodButtons + '</div>' +
        '<div class="quran-study-stat-grid">' +
            '<div><strong>' + stats.versesRead + '</strong><span>Verses read</span></div>' +
            '<div><strong>' + stats.surahsTouched + '</strong><span>Surahs touched</span></div>' +
            '<div><strong>' + stats.currentStreak + '</strong><span>Current streak</span></div>' +
            '<div><strong>' + stats.longestStreak + '</strong><span>Longest streak</span></div>' +
            '<div><strong>' + stats.completedSurahs + '</strong><span>Surahs completed</span></div>' +
            '<div><strong>' + stats.totalDays + '</strong><span>Total reading days</span></div>' +
        '</div>' +
        '<div class="quran-study-columns">' +
            '<section><h4>Bookmarks <span>' + stats.bookmarks + '</span></h4><div class="quran-study-list">' + bookmarkRows + '</div></section>' +
            '<section><h4>Personal reflections <span>' + stats.reflections + '</span></h4><div class="quran-study-list">' + reflectionRows + '</div></section>' +
        '</div>' +
    '</section>';
}

function quranStudyRenderReflectionDialog() {
    return '<section class="quran-reflection-dialog" id="quranReflectionDialog" hidden role="dialog" aria-modal="true" aria-labelledby="quranReflectionTitle">' +
        '<div class="quran-reflection-backdrop" onclick="quranStudyCloseReflection()"></div>' +
        '<div class="quran-reflection-card card">' +
            '<header><div><h3 id="quranReflectionTitle">Personal reflection</h3><p>This note is yours. It is not Quran text, translation, or tafsir.</p></div><button type="button" class="quran-study-remove" onclick="quranStudyCloseReflection()" aria-label="Close">×</button></header>' +
            '<input type="hidden" id="quranReflectionKey"><input type="hidden" id="quranReflectionLabel"><input type="hidden" id="quranReflectionSurah"><input type="hidden" id="quranReflectionAyah">' +
            '<textarea class="form-input quran-reflection-text" id="quranReflectionText" rows="8" maxlength="5000" placeholder="Write your personal reflection…"></textarea>' +
            '<footer><button type="button" class="btn btn-danger btn-sm" id="quranReflectionDelete" onclick="quranStudyDeleteReflection()">Delete</button><span></span><button type="button" class="btn btn-secondary" onclick="quranStudyCloseReflection()">Cancel</button><button type="button" class="btn btn-primary" onclick="quranStudySaveReflection()">Save reflection</button></footer>' +
        '</div>' +
    '</section>';
}

function quranStudyRenderPassageActions(passage) {
    const key = quranStudyPassageKey(passage);
    const refs = quranStudyPassageRefs(passage);
    const first = passage && passage.groupedVerses && passage.groupedVerses[0] ? passage.groupedVerses[0] : { surah: 0, ayah: 0 };
    const bookmarked = Boolean(quranStudyBookmark(key));
    const reflected = Boolean(quranStudyReflection(key));
    const readToday = quranStudyAreRefsReadToday(refs);
    const safeKey = String(key).replace(/'/g, "\\'");
    const safeLabel = String(passage.label || key).replace(/'/g, "\\'");
    const refsValue = refs.join(',');
    return '<button class="quran-study-action ' + (bookmarked ? 'is-active' : '') + '" data-quran-bookmark="' + esc(key) + '" type="button" onclick="quranStudyToggleBookmark(\'' + safeKey + '\',\'' + safeLabel + '\',' + first.surah + ',' + first.ayah + ')" aria-pressed="' + (bookmarked ? 'true' : 'false') + '" title="' + (bookmarked ? 'Remove bookmark' : 'Bookmark passage') + '">' + (bookmarked ? '★' : '☆') + '</button>' +
        '<button class="quran-study-action ' + (reflected ? 'is-active' : '') + '" data-quran-reflection="' + esc(key) + '" type="button" onclick="quranStudyOpenReflection(\'' + safeKey + '\',\'' + safeLabel + '\',' + first.surah + ',' + first.ayah + ')" title="Personal reflection">✎</button>' +
        '<button class="quran-study-action quran-read-action ' + (readToday ? 'is-read' : '') + '" data-quran-read="' + esc(refsValue) + '" type="button" onclick="quranStudyMarkPassageRead(\'' + refsValue + '\')" title="' + (readToday ? 'Read today' : 'Mark read today') + '">' + (readToday ? '✓' : 'Read') + '</button>';
}

function quranStudyRefreshPanel() {
    const panel = document.getElementById('quranStudyPanel');
    if (!panel) return;
    const holder = document.createElement('div');
    holder.innerHTML = quranStudyRenderPanel();
    const replacement = holder.firstElementChild;
    if (replacement) panel.replaceWith(replacement);
}

function quranStudyRefreshPassageButtons() {
    document.querySelectorAll('[data-quran-bookmark]').forEach(function(button) {
        const key = button.getAttribute('data-quran-bookmark');
        const active = Boolean(quranStudyBookmark(key));
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.textContent = active ? '★' : '☆';
        button.title = active ? 'Remove bookmark' : 'Bookmark passage';
    });
    document.querySelectorAll('[data-quran-reflection]').forEach(function(button) {
        const key = button.getAttribute('data-quran-reflection');
        button.classList.toggle('is-active', Boolean(quranStudyReflection(key)));
    });
    document.querySelectorAll('[data-quran-read]').forEach(function(button) {
        const refs = String(button.getAttribute('data-quran-read') || '').split(',').filter(Boolean);
        const read = quranStudyAreRefsReadToday(refs);
        button.classList.toggle('is-read', read);
        button.textContent = read ? '✓' : 'Read';
        button.title = read ? 'Read today' : 'Mark read today';
    });
}

function quranStudyRefreshUI() {
    quranStudyRefreshPanel();
    quranStudyRefreshPassageButtons();
    const tracking = document.getElementById('quranTrackingStatus');
    if (tracking) tracking.textContent = quranStudyState.trackingEnabled ? 'Reading' : 'Browse';
}

function quranStudyClearObserver() {
    if (quranStudyObserver && typeof quranStudyObserver.disconnect === 'function') quranStudyObserver.disconnect();
    quranStudyObserver = null;
    quranStudyVisibilityTimers.forEach(function(timer) { clearTimeout(timer); });
    quranStudyVisibilityTimers.clear();
}

function quranStudySetupObserver() {
    quranStudyClearObserver();
    if (!quranStudyState.trackingEnabled || typeof IntersectionObserver === 'undefined') return;
    const passages = document.querySelectorAll('.quran-verse-card[data-quran-refs], .quran-page-passage[data-quran-refs], .quran-mushaf-ayah[data-quran-refs]');
    if (!passages.length) return;

    quranStudyObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            const target = entry.target;
            const existing = quranStudyVisibilityTimers.get(target);
            if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                if (existing) return;
                const timer = setTimeout(function() {
                    const refs = String(target.getAttribute('data-quran-refs') || '').split(',').filter(Boolean);
                    quranStudyRecordRefs(refs);
                    quranStudyVisibilityTimers.delete(target);
                }, 1200);
                quranStudyVisibilityTimers.set(target, timer);
            } else if (existing) {
                clearTimeout(existing);
                quranStudyVisibilityTimers.delete(target);
            }
        });
    }, { threshold: [0.6] });

    passages.forEach(function(node) { quranStudyObserver.observe(node); });
}

function quranStudyAfterRender() {
    quranStudySetupObserver();
}

window.quranStudyState = quranStudyState;
window.quranStudyStats = quranStudyStats;
window.quranStudyCalculateStreaks = quranStudyCalculateStreaks;
