// ==================== V28 FIND & CONNECT ====================
// Universal local search, frictionless capture, evidence citations, and
// explicit links/backlinks. Everything stays in StudyOS storage and works
// from file:// without a server or external account.

var captureStatusFilter = 'inbox';
var selectedCaptureId = null;

var STUDYOS_ENTITY_META = {
    knowledge: { label: 'Knowledge', icon: '◇', route: 'knowledgevault' },
    capture: { label: 'Capture', icon: '✦', route: 'capture' },
    task: { label: 'Task', icon: '☑', route: 'tasks' },
    goal: { label: 'Goal', icon: '◎', route: 'goals' },
    journal: { label: 'Journal', icon: '✎', route: 'journal' },
    decision: { label: 'Decision', icon: '⚖', route: 'decisions' },
    'quality-review': { label: 'Quality review', icon: '↺', route: 'journal' },
    contact: { label: 'Contact', icon: '◎', route: 'network' },
    flashcard: { label: 'Flashcard', icon: '▤', route: 'flashcards' },
    event: { label: 'Calendar', icon: '□', route: 'calendar' },
    habit: { label: 'Habit', icon: '↻', route: 'habits' },
    source: { label: 'Source', icon: '▦', route: 'doctrine' },
    'learning-module': { label: 'Learning module', icon: '◫', route: 'learn' },
    'doctrine-module': { label: 'Doctrine module', icon: '▦', route: 'doctrine' }
};

function studyosStripHtml(value) {
    var div = document.createElement('div');
    div.innerHTML = String(value || '');
    return String(div.textContent || div.innerText || '').trim();
}

function studyosNormalize(value) {
    return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function studyosArray(value) {
    return Array.isArray(value) ? value : [];
}

function studyosKnowledgeText(entry) {
    var analysis = entry && entry.analysis && typeof entry.analysis === 'object' ? Object.values(entry.analysis) : [];
    var book = entry && entry.bookData && typeof entry.bookData === 'object' ? Object.values(entry.bookData) : [];
    var evidence = entry && entry.evidence && typeof entry.evidence === 'object' ? Object.values(entry.evidence) : [];
    return [entry && entry.content, entry && entry.conclusion].concat(analysis, book, evidence).filter(Boolean).join(' ');
}

function studyosBuildSearchIndex() {
    var items = [];
    function add(type, id, title, subtitle, text, extra) {
        if (!id || !title) return;
        var meta = STUDYOS_ENTITY_META[type] || { label: type, icon: '◇', route: 'dashboard' };
        items.push(Object.assign({
            key: type + ':' + id,
            type: type,
            id: String(id),
            title: String(title),
            label: String(title),
            subtitle: String(subtitle || ''),
            text: String(text || ''),
            typeLabel: meta.label,
            icon: meta.icon,
            route: meta.route
        }, extra || {}));
    }

    studyosArray(arr(K.knowledge)).forEach(function(entry) {
        add('knowledge', entry.id, entry.title || 'Untitled', [entry.entryType || 'note', entry.pathway].filter(Boolean).join(' · '),
            [studyosKnowledgeText(entry)].concat(entry.tags || [], entry.relatedTitles || []).join(' '), { date: entry.updated || entry.created || '' });
    });
    studyosArray(arr(K.captureInbox)).forEach(function(entry) {
        add('capture', entry.id, entry.title || 'Untitled capture', [entry.captureType || 'thought', entry.status || 'inbox'].join(' · '),
            [entry.content, entry.url, entry.pathway].concat(entry.tags || []).join(' '), { date: entry.createdAt || '' });
    });
    studyosArray(arr(K.tasks)).forEach(function(entry) {
        add('task', entry.id, entry.title || 'Untitled task', [entry.completed ? 'Complete' : 'Open', entry.due ? 'Due ' + entry.due : ''].filter(Boolean).join(' · '),
            [entry.description, entry.priority, entry.due].join(' '), { date: entry.due || '' });
    });
    studyosArray(arr(K.goals)).forEach(function(entry) {
        add('goal', entry.id, entry.title || 'Untitled goal', entry.area || entry.status || '',
            [entry.target, entry.description, entry.area, entry.status].concat(entry.milestones || []).join(' '), { date: entry.target || '' });
    });
    studyosArray(arr(K.journal)).forEach(function(entry) {
        add('journal', entry.id, entry.title || 'Untitled journal entry', [entry.type, entry.date].filter(Boolean).join(' · '),
            [studyosStripHtml(entry.content), entry.pathway].concat(entry.tags || []).join(' '), { date: entry.date || entry.createdAt || '' });
    });
    studyosArray(arr(K.decisions)).forEach(function(entry) {
        add('decision', entry.id, entry.title || 'Untitled decision', [entry.domain, entry.date].filter(Boolean).join(' · '),
            [entry.context, entry.options, entry.risks, entry.choice, entry.outcome, entry.learning].concat(entry.tags || []).join(' '), { date: entry.date || '' });
    });
    studyosArray(arr(K.qualityReviews)).forEach(function(entry) {
        add('quality-review', entry.id, entry.title || 'Untitled quality review', [entry.area, entry.verificationStatus, entry.date].filter(Boolean).join(' · '),
            [entry.whatHappened, entry.immediateFix, entry.rootCause, entry.prevention, entry.governingSource, entry.verificationNote].join(' '), { date: entry.date || '' });
    });
    studyosArray(arr(K.contacts)).forEach(function(entry) {
        add('contact', entry.id, entry.name || entry.title || 'Untitled contact', [entry.role, entry.company].filter(Boolean).join(' · '),
            [entry.email, entry.phone, entry.notes, entry.followupDate].join(' '), { date: entry.followupDate || '' });
    });
    studyosArray(arr(K.flashcards)).forEach(function(entry) {
        add('flashcard', entry.id, entry.question || 'Untitled flashcard', entry.category || 'general',
            [entry.answer].concat(entry.tags || []).join(' '), { date: entry.nextReview || entry.createdAt || '' });
    });
    studyosArray(arr(K.events)).forEach(function(entry) {
        add('event', entry.id, entry.title || 'Untitled event', [entry.date, entry.time].filter(Boolean).join(' · '),
            [entry.description, entry.type].join(' '), { date: entry.date || '' });
    });
    studyosArray(arr(K.habits)).forEach(function(entry) {
        add('habit', entry.id, entry.name || entry.title || entry.behavior || 'Untitled habit', entry.category || '',
            [entry.anchor, entry.behavior, entry.tiny, entry.location].join(' '));
    });

    if (typeof PATHWAYS !== 'undefined' && PATHWAYS) {
        Object.keys(PATHWAYS).forEach(function(pathwayId) {
            var pathway = PATHWAYS[pathwayId];
            studyosArray(pathway.modules).forEach(function(module) {
                add('learning-module', module.id, module.name, [pathway.shortName || pathway.name, module.stage].filter(Boolean).join(' · '),
                    [module.practice, module.evidence].concat(module.topics || [], module.sourceIds || []).join(' '), { pathwayId: pathwayId });
            });
        });
    }
    studyosArray(window.DOCTRINE_SOURCES).forEach(function(source) {
        add('source', source.id, source.title, [source.author, source.edition ? source.edition + ' ed.' : ''].filter(Boolean).join(' · '),
            [source.pillar].concat(source.tags || []).join(' '));
    });
    var doctrineModules = typeof doctrineAllModules === 'function'
        ? doctrineAllModules()
        : (Array.isArray(window.DOCTRINE_MODULES) ? window.DOCTRINE_MODULES : []);
    studyosArray(doctrineModules).forEach(function(module) {
        add('doctrine-module', module.id, module.title || module.name, (module.domain || module.pillar || 'Doctrine'),
            [module.summary, module.description].concat(module.sources || [], module.tags || []).join(' '));
    });

    return items;
}

function studyosSearchScore(item, query) {
    var q = studyosNormalize(query);
    if (!q) return 0;
    var title = studyosNormalize(item.title);
    var subtitle = studyosNormalize(item.subtitle);
    var type = studyosNormalize(item.typeLabel + ' ' + item.type);
    var body = studyosNormalize(item.text);
    var tokens = q.split(/\s+/).filter(Boolean);
    var haystack = [title, subtitle, type, body].join(' ');
    if (!tokens.every(function(token) { return haystack.indexOf(token) !== -1; })) return -1;
    var score = 0;
    if (title === q) score += 140;
    if (title.indexOf(q) === 0) score += 90;
    if (title.indexOf(q) !== -1) score += 55;
    if (subtitle.indexOf(q) !== -1) score += 22;
    if (type.indexOf(q) !== -1) score += 18;
    tokens.forEach(function(token) {
        if (title.split(' ').indexOf(token) !== -1) score += 16;
        else if (title.indexOf(token) !== -1) score += 9;
        else if (body.indexOf(token) !== -1) score += 3;
    });
    if (item.date) score += 1;
    return score;
}

function studyosSearchContent(query, limit) {
    return studyosBuildSearchIndex().map(function(item) {
        return Object.assign({}, item, { score: studyosSearchScore(item, query) });
    }).filter(function(item) { return item.score >= 0; }).sort(function(a, b) {
        return b.score - a.score || String(b.date || '').localeCompare(String(a.date || '')) || a.title.localeCompare(b.title);
    }).slice(0, limit || 20);
}

function studyosOpenSearchResult(result) {
    if (!result) return;
    if (typeof closeCommandPalette === 'function') closeCommandPalette();
    studyosOpenEntity(result.type, result.id, result);
}

function studyosOpenEntity(type, id, known) {
    var item = known || studyosBuildSearchIndex().find(function(row) { return row.type === type && row.id === String(id); });
    var meta = STUDYOS_ENTITY_META[type] || {};
    var route = (item && item.route) || meta.route || 'dashboard';
    if (typeof go === 'function') go(route);
    setTimeout(function() {
        try {
            if (type === 'knowledge') { selectedKnowledgeId = String(id); renderKnowledge(); }
            else if (type === 'capture') { selectedCaptureId = String(id); captureStatusFilter = 'all'; renderCaptureInbox(); }
            else if (type === 'task' && typeof editTask === 'function') editTask(String(id));
            else if (type === 'goal' && typeof editGoal === 'function') editGoal(String(id));
            else if (type === 'journal' && typeof editJournal === 'function') editJournal(String(id));
            else if (type === 'decision' && typeof editDecision === 'function') editDecision(String(id));
            else if (type === 'quality-review' && typeof openQualityReviewModal === 'function') openQualityReviewModal(String(id));
            else if (type === 'contact' && typeof editContact === 'function') editContact(String(id));
            else if (type === 'flashcard' && typeof editFlashcard === 'function') editFlashcard(String(id));
            else if (type === 'source') {
                if (typeof doctrineSetView === 'function') doctrineSetView('sources');
                if (typeof renderDoctrine === 'function') renderDoctrine();
                if (typeof doctrineOpenSource === 'function') doctrineOpenSource(String(id));
            } else if (type === 'doctrine-module') {
                if (typeof doctrineSetView === 'function') doctrineSetView('modules');
                if (typeof renderDoctrine === 'function') renderDoctrine();
                if (typeof doctrineSelect === 'function') doctrineSelect(String(id));
            } else if (type === 'learning-module' && typeof showPathway === 'function') {
                var pathwayId = item && item.pathwayId;
                if (!pathwayId && typeof PATHWAYS !== 'undefined') {
                    pathwayId = Object.keys(PATHWAYS).find(function(pid) { return (PATHWAYS[pid].modules || []).some(function(module) { return module.id === String(id); }); });
                }
                if (pathwayId) showPathway(pathwayId);
            }
        } catch (error) {
            console.error('Could not open search result', type, id, error);
            if (typeof toast === 'function') toast('Opened the section; the exact item could not be focused.');
        }
    }, 0);
}

// -------------------- Capture Inbox --------------------

function studyosCaptureTypeLabel(type) {
    var labels = { thought: 'Thought', question: 'Question', source: 'Source note', field: 'Field note', meeting: 'Meeting note' };
    return labels[type] || 'Capture';
}

function studyosCaptureTitle(data) {
    var explicit = String(data.title || '').trim();
    if (explicit) return explicit.slice(0, 160);
    var line = String(data.content || '').split(/\r?\n/).map(function(row) { return row.trim(); }).find(Boolean) || 'Untitled capture';
    return line.slice(0, 90);
}

function studyosCreateCapture(data) {
    data = data || {};
    var content = String(data.content || '').trim();
    if (!content && !String(data.url || '').trim()) return null;
    var captures = arr(K.captureInbox);
    var item = {
        id: data.id || uid(),
        title: studyosCaptureTitle(data),
        content: content,
        url: String(data.url || '').trim(),
        captureType: data.captureType || 'thought',
        pathway: data.pathway || '',
        tags: studyosArray(data.tags).map(function(tag) { return String(tag).trim(); }).filter(Boolean),
        status: data.status || 'inbox',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    captures.unshift(item);
    set(K.captureInbox, captures);
    selectedCaptureId = item.id;
    return item;
}

function openQuickCapture(id) {
    var existing = id ? arr(K.captureInbox).find(function(item) { return item.id === id; }) : null;
    var editId = document.getElementById('captureEditId');
    var title = document.getElementById('captureTitle');
    var content = document.getElementById('captureContent');
    var url = document.getElementById('captureUrl');
    var type = document.getElementById('captureType');
    var pathway = document.getElementById('capturePathway');
    var tags = document.getElementById('captureTags');
    var heading = document.getElementById('quickCaptureModalTitle');
    if (!editId || !content) return;
    editId.value = existing ? existing.id : '';
    title.value = existing ? existing.title || '' : '';
    content.value = existing ? existing.content || '' : '';
    url.value = existing ? existing.url || '' : '';
    type.value = existing ? existing.captureType || 'thought' : 'thought';
    pathway.value = existing ? existing.pathway || '' : '';
    tags.value = existing ? (existing.tags || []).join(', ') : '';
    if (heading) heading.textContent = existing ? 'Edit capture' : 'Quick capture';
    openModal('quickCaptureModal');
    setTimeout(function() { content.focus(); }, 60);
}

function saveQuickCapture() {
    var editId = String((document.getElementById('captureEditId') || {}).value || '');
    var data = {
        title: String((document.getElementById('captureTitle') || {}).value || '').trim(),
        content: String((document.getElementById('captureContent') || {}).value || '').trim(),
        url: String((document.getElementById('captureUrl') || {}).value || '').trim(),
        captureType: String((document.getElementById('captureType') || {}).value || 'thought'),
        pathway: String((document.getElementById('capturePathway') || {}).value || ''),
        tags: String((document.getElementById('captureTags') || {}).value || '').split(',').map(function(tag) { return tag.trim(); }).filter(Boolean)
    };
    if (!data.content && !data.url) { toast('Add a thought, question, note, or URL first.'); return; }

    if (editId) {
        var captures = arr(K.captureInbox);
        var index = captures.findIndex(function(item) { return item.id === editId; });
        if (index !== -1) {
            captures[index] = Object.assign({}, captures[index], data, { title: studyosCaptureTitle(data), updatedAt: new Date().toISOString() });
            set(K.captureInbox, captures);
            selectedCaptureId = editId;
        }
    } else {
        studyosCreateCapture(data);
    }
    closeModal('quickCaptureModal');
    if (document.getElementById('captureInboxRoot')) renderCaptureInbox();
    toast(editId ? 'Capture updated.' : 'Saved to Capture Inbox.');
}

function captureSetFilter(status) {
    captureStatusFilter = status || 'inbox';
    selectedCaptureId = null;
    renderCaptureInbox();
}

function selectCapture(id) {
    selectedCaptureId = id;
    renderCaptureInbox();
}

function studyosSafeUrl(value) {
    try {
        var parsed = new URL(String(value || ''));
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.href : '';
    } catch (error) { return ''; }
}

function studyosCaptureMarkProcessed(capture, type, entityId) {
    var captures = arr(K.captureInbox);
    var index = captures.findIndex(function(item) { return item.id === capture.id; });
    if (index === -1) return;
    captures[index] = Object.assign({}, captures[index], {
        status: 'processed',
        processedAt: new Date().toISOString(),
        processedAs: { type: type, id: entityId },
        updatedAt: new Date().toISOString()
    });
    set(K.captureInbox, captures);
}

function captureToKnowledge(id, options) {
    var capture = arr(K.captureInbox).find(function(item) { return item.id === id; });
    if (!capture) return null;
    var entry = {
        id: uid(), title: capture.title, content: capture.content || capture.url, tags: capture.tags || [],
        pathway: capture.pathway || null, entryType: 'note', created: today(), updated: today(),
        relatedTitles: [], unresolvedLinks: [],
        evidence: capture.url ? { sourceId: '', sourceLabel: capture.url, locator: capture.url, excerpt: '', interpretation: capture.content || '', verification: 'unverified', accessedDate: today() } : {}
    };
    var notes = arr(K.knowledge);
    notes.push(entry);
    if (typeof studyosSyncKnowledgeLinks === 'function') studyosSyncKnowledgeLinks(entry);
    set(K.knowledge, notes);
    studyosCaptureMarkProcessed(capture, 'knowledge', entry.id);
    if (!(options && options.navigate === false)) studyosOpenEntity('knowledge', entry.id);
    toast('Capture processed into Knowledge.');
    return entry;
}

function captureToTask(id, options) {
    var capture = arr(K.captureInbox).find(function(item) { return item.id === id; });
    if (!capture) return null;
    var task = normalizeTaskRecord({ id: uid(), title: capture.title, due: null, priority: 'med', completed: false, description: capture.content || '', createdAt: new Date().toISOString(), tags: capture.tags || [] });
    var tasks = arr(K.tasks); tasks.push(task); set(K.tasks, tasks);
    studyosCaptureMarkProcessed(capture, 'task', task.id);
    if (!(options && options.navigate === false)) studyosOpenEntity('task', task.id);
    toast('Capture processed into a task.');
    return task;
}

function captureToFlashcard(id, options) {
    var capture = arr(K.captureInbox).find(function(item) { return item.id === id; });
    if (!capture) return null;
    var card = { id: uid(), question: capture.title, answer: capture.content || capture.url, category: capture.pathway || 'general', tags: capture.tags || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), reviews: 0, nextReview: today(), interval: 0, easeFactor: 2.5 };
    var cards = arr(K.flashcards); cards.push(card); set(K.flashcards, cards);
    studyosCaptureMarkProcessed(capture, 'flashcard', card.id);
    if (!(options && options.navigate === false)) studyosOpenEntity('flashcard', card.id);
    toast('Capture processed into a flashcard draft.');
    return card;
}

function captureToDecision(id, options) {
    var capture = arr(K.captureInbox).find(function(item) { return item.id === id; });
    if (!capture) return null;
    var decision = { id: uid(), title: capture.title, date: today(), domain: 'project', context: capture.content || capture.url, options: '', risks: '', choice: 'Decision draft — define options and final choice.', tags: capture.tags || [], reviewDate: '', confidence: 3, created: today(), updated: today(), draft: true };
    var decisions = arr(K.decisions); decisions.push(decision); set(K.decisions, decisions);
    studyosCaptureMarkProcessed(capture, 'decision', decision.id);
    if (!(options && options.navigate === false)) studyosOpenEntity('decision', decision.id);
    toast('Capture processed into a decision draft.');
    return decision;
}

function archiveCapture(id) {
    var captures = arr(K.captureInbox);
    var item = captures.find(function(row) { return row.id === id; });
    if (!item) return;
    item.status = item.status === 'archived' ? 'inbox' : 'archived';
    item.updatedAt = new Date().toISOString();
    set(K.captureInbox, captures);
    selectedCaptureId = null;
    renderCaptureInbox();
    toast(item.status === 'archived' ? 'Capture archived.' : 'Capture returned to inbox.');
}

function deleteCapture(id) {
    if (!confirm('Delete this capture? Processed notes, tasks, or cards will remain.')) return;
    set(K.captureInbox, arr(K.captureInbox).filter(function(item) { return item.id !== id; }));
    selectedCaptureId = null;
    renderCaptureInbox();
    toast('Capture deleted.');
}

function renderCaptureInbox() {
    var root = document.getElementById('captureInboxRoot');
    if (!root) return;
    var all = arr(K.captureInbox).slice().sort(function(a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
    var search = String((document.getElementById('captureInboxSearch') || {}).value || '').trim().toLowerCase();
    var counts = {
        inbox: all.filter(function(item) { return (item.status || 'inbox') === 'inbox'; }).length,
        processed: all.filter(function(item) { return item.status === 'processed'; }).length,
        archived: all.filter(function(item) { return item.status === 'archived'; }).length
    };
    var filtered = all.filter(function(item) {
        var statusOk = captureStatusFilter === 'all' || (item.status || 'inbox') === captureStatusFilter;
        var blob = [item.title, item.content, item.url, item.captureType, item.pathway].concat(item.tags || []).join(' ').toLowerCase();
        return statusOk && (!search || blob.indexOf(search) !== -1);
    });
    if (!selectedCaptureId || !filtered.some(function(item) { return item.id === selectedCaptureId; })) selectedCaptureId = filtered.length ? filtered[0].id : null;
    var selected = filtered.find(function(item) { return item.id === selectedCaptureId; }) || null;

    root.innerHTML = '<div class="capture-shell">' +
        '<section class="capture-hero card"><div><div class="kicker">From fleeting thought to useful object</div><h2>Capture Inbox</h2><p>Collect first. Then turn each item into a note, task, flashcard, or decision without retyping it.</p></div><button class="btn btn-primary" onclick="openQuickCapture()">＋ New capture</button></section>' +
        '<div class="capture-metrics"><div><span>Unprocessed</span><strong>' + counts.inbox + '</strong></div><div><span>Processed</span><strong>' + counts.processed + '</strong></div><div><span>Archived</span><strong>' + counts.archived + '</strong></div><div><span>Capture health</span><strong>' + (counts.inbox <= 7 ? 'Clear' : counts.inbox <= 15 ? 'Review' : 'Backlog') + '</strong></div></div>' +
        '<div class="capture-toolbar card"><div class="capture-status-filters">' +
            '<button class="filter-btn ' + (captureStatusFilter === 'inbox' ? 'active' : '') + '" onclick="captureSetFilter(\'inbox\')">Inbox ' + counts.inbox + '</button>' +
            '<button class="filter-btn ' + (captureStatusFilter === 'processed' ? 'active' : '') + '" onclick="captureSetFilter(\'processed\')">Processed ' + counts.processed + '</button>' +
            '<button class="filter-btn ' + (captureStatusFilter === 'archived' ? 'active' : '') + '" onclick="captureSetFilter(\'archived\')">Archived ' + counts.archived + '</button>' +
            '<button class="filter-btn ' + (captureStatusFilter === 'all' ? 'active' : '') + '" onclick="captureSetFilter(\'all\')">All ' + all.length + '</button></div>' +
            '<input class="form-input" id="captureInboxSearch" aria-label="Search captures" placeholder="Filter this inbox…" value="' + esc(search) + '" oninput="renderCaptureInbox()"></div>' +
        (!filtered.length ? '<div class="card capture-empty"><div class="capture-empty-mark">✦</div><h3>' + (all.length ? 'Nothing matches this view' : 'Your inbox is clear') + '</h3><p>' + (all.length ? 'Change the status filter or search.' : 'Use Capture whenever a thought would otherwise interrupt your work.') + '</p><button class="btn btn-primary" onclick="openQuickCapture()">Capture something</button></div>' :
        '<div class="capture-workspace"><div class="capture-list card">' + filtered.map(function(item) {
            var active = item.id === selectedCaptureId;
            return '<button class="capture-list-item ' + (active ? 'active' : '') + '" onclick="selectCapture(\'' + item.id + '\')"><span class="capture-list-icon">' + (item.captureType === 'question' ? '?' : item.captureType === 'field' ? '⌖' : item.captureType === 'source' ? '↗' : '✦') + '</span><span><strong>' + esc(item.title) + '</strong><small>' + esc(studyosCaptureTypeLabel(item.captureType)) + ' · ' + esc(item.status || 'inbox') + '</small></span><time>' + esc(String(item.createdAt || '').slice(0, 10)) + '</time></button>';
        }).join('') + '</div>' + renderCaptureDetail(selected) + '</div>') + '</div>';
}

function renderCaptureDetail(item) {
    if (!item) return '<div class="card capture-detail"><div class="empty">Select a capture.</div></div>';
    var safeUrl = studyosSafeUrl(item.url);
    var processed = item.status === 'processed';
    var processedLabel = processed && item.processedAs ? ((STUDYOS_ENTITY_META[item.processedAs.type] || {}).label || item.processedAs.type) : '';
    return '<article class="card capture-detail"><div class="capture-detail-head"><div><div class="capture-badges"><span class="badge">' + esc(studyosCaptureTypeLabel(item.captureType)) + '</span>' + (item.pathway ? '<span class="badge badge-blue">' + esc(String(item.pathway).toUpperCase()) + '</span>' : '') + (processed ? '<span class="badge badge-good">Processed → ' + esc(processedLabel) + '</span>' : '') + '</div><h3>' + esc(item.title) + '</h3><small>Captured ' + esc(String(item.createdAt || '').replace('T', ' ').slice(0, 16)) + '</small></div><button class="btn btn-secondary btn-sm" onclick="openQuickCapture(\'' + item.id + '\')">Edit</button></div>' +
        '<div class="capture-content">' + esc(item.content || 'No written note.').replace(/\n/g, '<br>') + '</div>' +
        (safeUrl ? '<a class="capture-source-link" href="' + esc(safeUrl) + '" target="_blank" rel="noopener">↗ ' + esc(safeUrl) + '</a>' : '') +
        ((item.tags || []).length ? '<div class="capture-tag-row">' + item.tags.map(function(tag) { return '<span>#' + esc(tag) + '</span>'; }).join('') + '</div>' : '') +
        (processed && item.processedAs ? '<button class="connection-row" onclick="studyosOpenEntity(\'' + item.processedAs.type + '\',\'' + item.processedAs.id + '\')"><span>Open processed ' + esc(processedLabel.toLowerCase()) + '</span><strong>→</strong></button>' :
        '<div class="capture-process"><div><span class="kicker">Process into</span><p>Choose the object that makes this capture useful.</p></div><div class="capture-action-grid"><button onclick="captureToKnowledge(\'' + item.id + '\')"><span>◇</span><strong>Knowledge note</strong><small>Preserve and connect</small></button><button onclick="captureToTask(\'' + item.id + '\')"><span>☑</span><strong>Task</strong><small>Make it actionable</small></button><button onclick="captureToFlashcard(\'' + item.id + '\')"><span>▤</span><strong>Flashcard</strong><small>Retrieve it later</small></button><button onclick="captureToDecision(\'' + item.id + '\')"><span>⚖</span><strong>Decision draft</strong><small>Structure judgment</small></button></div></div>') +
        '<div class="capture-detail-footer"><button class="btn btn-secondary btn-sm" onclick="archiveCapture(\'' + item.id + '\')">' + (item.status === 'archived' ? 'Return to inbox' : 'Archive') + '</button><button class="btn btn-danger btn-sm" onclick="deleteCapture(\'' + item.id + '\')">Delete capture</button></div></article>';
}

// -------------------- Evidence citations --------------------

function studyosKnowledgeEvidenceFieldsHTML() {
    var sources = studyosArray(window.DOCTRINE_SOURCES).slice().sort(function(a, b) { return a.title.localeCompare(b.title); });
    return '<section class="knowledge-evidence-form"><div class="knowledge-form-section-head"><div><span class="kicker">Evidence & provenance</span><h4>Cite the claim, not just the book</h4></div><span class="badge">V28</span></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label" for="knowledgeSourceId">Registered source</label><select class="form-select" id="knowledgeSourceId"><option value="">— None / other —</option>' + sources.map(function(source) { return '<option value="' + esc(source.id) + '">' + esc(source.title + (source.author ? ' — ' + source.author : '')) + '</option>'; }).join('') + '</select></div><div class="form-group"><label class="form-label" for="knowledgeLocator">Exact locator</label><input class="form-input" id="knowledgeLocator" placeholder="p. 184 · Ch. 6 · §6.3 · Fig. 12"></div></div>' +
        '<div class="form-group"><label class="form-label" for="knowledgeSourceLabel">Other source label or URL</label><input class="form-input" id="knowledgeSourceLabel" placeholder="Article, lecture, standard, field observation, or URL"></div>' +
        '<div class="form-group"><label class="form-label" for="knowledgeEvidenceExcerpt">Evidence excerpt / observation</label><textarea class="form-textarea" id="knowledgeEvidenceExcerpt" rows="2" placeholder="A short exact excerpt, measurement, or observation supporting the claim"></textarea></div>' +
        '<div class="form-group"><label class="form-label" for="knowledgeInterpretation">Your interpretation</label><textarea class="form-textarea" id="knowledgeInterpretation" rows="2" placeholder="What does this evidence mean, and where might it not apply?"></textarea></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label" for="knowledgeVerification">Verification</label><select class="form-select" id="knowledgeVerification"><option value="unverified">Not checked yet</option><option value="checked">Checked against source</option><option value="contested">Contested / conflicting evidence</option></select></div><div class="form-group"><label class="form-label" for="knowledgeAccessedDate">Checked / accessed</label><input class="form-input" type="date" id="knowledgeAccessedDate" value="' + today() + '"></div></div>' +
        '<div class="knowledge-form-divider"></div><div class="form-group"><label class="form-label" for="knowledgeRelatedTitles">Explicit links</label><input class="form-input" id="knowledgeRelatedTitles" placeholder="Exact titles, comma separated"><div class="form-hint">You can also write <code>[[Exact title]]</code> anywhere in this entry. Resolved links create backlinks automatically.</div></div></section>';
}

function studyosReadKnowledgeEvidenceFields() {
    return {
        evidence: {
            sourceId: String((document.getElementById('knowledgeSourceId') || {}).value || ''),
            sourceLabel: String((document.getElementById('knowledgeSourceLabel') || {}).value || '').trim(),
            locator: String((document.getElementById('knowledgeLocator') || {}).value || '').trim(),
            excerpt: String((document.getElementById('knowledgeEvidenceExcerpt') || {}).value || '').trim(),
            interpretation: String((document.getElementById('knowledgeInterpretation') || {}).value || '').trim(),
            verification: String((document.getElementById('knowledgeVerification') || {}).value || 'unverified'),
            accessedDate: String((document.getElementById('knowledgeAccessedDate') || {}).value || '')
        },
        relatedTitles: String((document.getElementById('knowledgeRelatedTitles') || {}).value || '').split(',').map(function(title) { return title.trim(); }).filter(Boolean)
    };
}

function studyosPopulateKnowledgeEvidenceFields(entry) {
    var evidence = entry && entry.evidence && typeof entry.evidence === 'object' ? entry.evidence : {};
    var values = {
        knowledgeSourceId: evidence.sourceId || '', knowledgeSourceLabel: evidence.sourceLabel || '', knowledgeLocator: evidence.locator || '',
        knowledgeEvidenceExcerpt: evidence.excerpt || '', knowledgeInterpretation: evidence.interpretation || '',
        knowledgeVerification: evidence.verification || 'unverified', knowledgeAccessedDate: evidence.accessedDate || today(),
        knowledgeRelatedTitles: (entry && entry.relatedTitles || []).join(', ')
    };
    Object.keys(values).forEach(function(id) { var el = document.getElementById(id); if (el) el.value = values[id]; });
}

function studyosEvidenceSource(entry) {
    var evidence = entry && entry.evidence || {};
    var source = evidence.sourceId ? studyosArray(window.DOCTRINE_SOURCES).find(function(item) { return item.id === evidence.sourceId; }) : null;
    return { evidence: evidence, source: source, label: source ? source.title : (evidence.sourceLabel || '') };
}

function studyosRenderEvidence(entry) {
    var resolved = studyosEvidenceSource(entry);
    var evidence = resolved.evidence;
    var hasEvidence = !!(resolved.label || evidence.locator || evidence.excerpt || evidence.interpretation);
    if (!hasEvidence) return '<section class="knowledge-evidence empty-evidence"><div><span class="kicker">Evidence</span><h4>No citation attached</h4><p>Add an exact source and page/section locator when this note makes a factual claim.</p></div><button class="btn btn-secondary btn-sm" onclick="editKnowledge(\'' + entry.id + '\')">Add citation</button></section>';
    var status = evidence.verification || 'unverified';
    var statusLabel = status === 'checked' ? 'Checked against source' : status === 'contested' ? 'Contested evidence' : 'Not checked yet';
    var safeUrl = studyosSafeUrl(evidence.sourceLabel);
    var sourceCell = resolved.source
        ? '<button onclick="studyosOpenEntity(\'source\',\'' + resolved.source.id + '\')"><span>Source</span><strong>' + esc(resolved.label || 'Not specified') + '</strong></button>'
        : '<div><span>Source</span><strong>' + esc(resolved.label || 'Not specified') + '</strong></div>';
    return '<section class="knowledge-evidence"><div class="knowledge-panel-head"><div><span class="kicker">Evidence & provenance</span><h4>' + esc(resolved.label || 'Unlabelled source') + '</h4></div><span class="evidence-status ' + esc(status) + '">' + esc(statusLabel) + '</span></div>' +
        '<div class="citation-line">' + sourceCell + '<div><span>Locator</span><strong>' + esc(evidence.locator || 'Missing exact page / section') + '</strong></div><div><span>Checked</span><strong>' + esc(evidence.accessedDate || 'Not recorded') + '</strong></div></div>' +
        (evidence.excerpt ? '<blockquote><span>Evidence</span>“' + esc(evidence.excerpt) + '”</blockquote>' : '') +
        (evidence.interpretation ? '<div class="evidence-interpretation"><span>Your interpretation</span><p>' + esc(evidence.interpretation).replace(/\n/g, '<br>') + '</p></div>' : '') +
        (safeUrl ? '<a href="' + esc(safeUrl) + '" target="_blank" rel="noopener">Open source URL ↗</a>' : '') +
        ((resolved.label && !evidence.locator) ? '<div class="evidence-warning">Locator missing: add a page, chapter, section, figure, timestamp, or observation date.</div>' : '') + '</section>';
}

// -------------------- Explicit links & backlinks --------------------

function studyosExtractWikiLinks(value) {
    var matches = [];
    var regex = /\[\[([^\]]+)\]\]/g;
    var match;
    while ((match = regex.exec(String(value || ''))) !== null) {
        var title = String(match[1] || '').trim();
        if (title && matches.indexOf(title) === -1) matches.push(title);
    }
    return matches;
}

function studyosResolveEntityByTitle(title) {
    var normalized = studyosNormalize(title);
    if (!normalized) return null;
    var preference = { knowledge: 0, source: 1, 'learning-module': 2, 'doctrine-module': 3, goal: 4, task: 5, decision: 6, journal: 7, flashcard: 8, contact: 9, capture: 10 };
    return studyosBuildSearchIndex().filter(function(item) { return studyosNormalize(item.title) === normalized; }).sort(function(a, b) {
        return (preference[a.type] === undefined ? 99 : preference[a.type]) - (preference[b.type] === undefined ? 99 : preference[b.type]);
    })[0] || null;
}

function studyosLinkId(fromType, fromId, toType, toId, relation) {
    return [fromType, fromId, toType, toId, relation].join('::');
}

function studyosSyncKnowledgeLinks(entry) {
    if (!entry || !entry.id) return [];
    var links = arr(K.entityLinks).filter(function(link) {
        return !(link.fromType === 'knowledge' && link.fromId === entry.id && (link.source === 'wikilink' || link.source === 'evidence'));
    });
    var rawText = studyosKnowledgeText(entry);
    var titles = studyosExtractWikiLinks(rawText).concat(entry.relatedTitles || []);
    var uniqueTitles = [];
    titles.forEach(function(title) { if (title && !uniqueTitles.some(function(existing) { return studyosNormalize(existing) === studyosNormalize(title); })) uniqueTitles.push(title); });
    var unresolved = [];
    uniqueTitles.forEach(function(title) {
        var target = studyosResolveEntityByTitle(title);
        if (!target || (target.type === 'knowledge' && target.id === entry.id)) { unresolved.push(title); return; }
        var relation = 'references';
        var id = studyosLinkId('knowledge', entry.id, target.type, target.id, relation);
        if (!links.some(function(link) { return link.id === id; })) links.push({ id: id, fromType: 'knowledge', fromId: entry.id, toType: target.type, toId: target.id, relation: relation, source: 'wikilink', createdAt: new Date().toISOString() });
    });
    var evidence = entry.evidence || {};
    if (evidence.sourceId) {
        var sourceExists = studyosArray(window.DOCTRINE_SOURCES).some(function(source) { return source.id === evidence.sourceId; });
        if (sourceExists) {
            var evidenceId = studyosLinkId('knowledge', entry.id, 'source', evidence.sourceId, 'evidence');
            links.push({ id: evidenceId, fromType: 'knowledge', fromId: entry.id, toType: 'source', toId: evidence.sourceId, relation: 'evidence', source: 'evidence', createdAt: new Date().toISOString() });
        }
    }
    entry.unresolvedLinks = unresolved;
    var deduped = [];
    var seen = new Set();
    links.forEach(function(link) { if (!seen.has(link.id)) { seen.add(link.id); deduped.push(link); } });
    set(K.entityLinks, deduped);
    return deduped;
}

function studyosRebuildKnowledgeLinks() {
    var notes = arr(K.knowledge);
    notes.forEach(function(entry) { studyosSyncKnowledgeLinks(entry); });
    set(K.knowledge, notes);
    return arr(K.entityLinks);
}

function studyosRemoveEntityLinks(type, id) {
    set(K.entityLinks, arr(K.entityLinks).filter(function(link) {
        return !(link.fromType === type && link.fromId === id) && !(link.toType === type && link.toId === id);
    }));
}

function studyosEntityByTypeId(type, id) {
    return studyosBuildSearchIndex().find(function(item) { return item.type === type && item.id === String(id); }) || null;
}

function studyosFindOutgoing(type, id) {
    return arr(K.entityLinks).filter(function(link) { return link.fromType === type && link.fromId === String(id); });
}

function studyosFindBacklinks(type, id) {
    return arr(K.entityLinks).filter(function(link) { return link.toType === type && link.toId === String(id); });
}

function studyosRenderConnections(type, id, unresolved) {
    var outgoing = studyosFindOutgoing(type, id);
    var incoming = studyosFindBacklinks(type, id);
    var rows = [];
    outgoing.forEach(function(link) {
        var item = studyosEntityByTypeId(link.toType, link.toId);
        if (item) rows.push({ direction: link.relation === 'evidence' ? 'Evidence source' : 'Links to', item: item });
    });
    incoming.forEach(function(link) {
        var item = studyosEntityByTypeId(link.fromType, link.fromId);
        if (item) rows.push({ direction: 'Backlink from', item: item });
    });
    return '<section class="knowledge-connections"><div class="knowledge-panel-head"><div><span class="kicker">Connected thinking</span><h4>Links & backlinks</h4></div><span class="badge">' + rows.length + ' resolved</span></div>' +
        (rows.length ? '<div class="connection-list">' + rows.map(function(row) { return '<button class="connection-row" onclick="studyosOpenEntity(\'' + row.item.type + '\',\'' + row.item.id + '\')"><span><small>' + esc(row.direction) + ' · ' + esc(row.item.typeLabel) + '</small><strong>' + esc(row.item.title) + '</strong></span><b>→</b></button>'; }).join('') + '</div>' : '<p class="muted">No resolved links yet. Add an exact title or use <code>[[Title]]</code> in the entry.</p>') +
        (studyosArray(unresolved).length ? '<div class="unresolved-links"><strong>Unresolved</strong><span>' + unresolved.map(function(title) { return '[[' + esc(title) + ']]'; }).join(' · ') + '</span><small>Rename the target or match its exact title.</small></div>' : '') + '</section>';
}

document.addEventListener('DOMContentLoaded', function() {
    Promise.resolve(window.__storageReadyPromise).catch(function() {}).then(function() {
        try { studyosRebuildKnowledgeLinks(); } catch (error) { console.warn('V28 link index rebuild skipped', error); }
    });
    if (window.EVENTS && typeof EVENTS.on === 'function') {
        var rebuildTimer = null;
        var targetKeys = [K.tasks, K.goals, K.journal, K.decisions, K.contacts, K.flashcards, K.captureInbox];
        EVENTS.on('storage:changed', function(payload) {
            if (!payload || targetKeys.indexOf(payload.key) === -1) return;
            clearTimeout(rebuildTimer);
            rebuildTimer = setTimeout(function() {
                try { studyosRebuildKnowledgeLinks(); } catch (error) { console.warn('Link refresh skipped', error); }
            }, 40);
        });
    }
});

window.studyosBuildSearchIndex = studyosBuildSearchIndex;
window.studyosSearchContent = studyosSearchContent;
window.studyosOpenSearchResult = studyosOpenSearchResult;
window.studyosOpenEntity = studyosOpenEntity;
window.openQuickCapture = openQuickCapture;
window.saveQuickCapture = saveQuickCapture;
window.studyosCreateCapture = studyosCreateCapture;
window.renderCaptureInbox = renderCaptureInbox;
window.studyosSyncKnowledgeLinks = studyosSyncKnowledgeLinks;
window.studyosRebuildKnowledgeLinks = studyosRebuildKnowledgeLinks;
window.studyosFindBacklinks = studyosFindBacklinks;
window.studyosRemoveEntityLinks = studyosRemoveEntityLinks;
