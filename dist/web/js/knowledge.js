// ==================== KNOWLEDGE VAULT ====================
let editingKnowledgeId = null;
let knowledgeFilter = 'all';
let knowledgeType = 'all'; // 'all', 'note', 'critical', 'model', 'book'
let selectedKnowledgeId = null;

function knowledgeEntryBody(n) {
    if (!n) return '';
    if (n.entryType === 'critical') {
        const analysis = n.analysis || {};
        return Object.keys(analysis).filter(k => analysis[k]).map(k => `
            <div style="margin-bottom:16px;">
                <div style="font-size:0.74rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;">${esc(k.replace(/_/g, ' '))}</div>
                <div style="white-space:pre-wrap;line-height:1.75;color:var(--text-primary);">${esc(analysis[k])}</div>
            </div>
        `).join('') || `<div style="white-space:pre-wrap;line-height:1.75;color:var(--text-primary);">${esc(n.conclusion || n.content || '')}</div>`;
    }
    if (n.entryType === 'book') {
        const bd = n.bookData || {};
        return `
            <div style="display:grid;gap:18px;">
                <div><div style="font-size:0.74rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;">Core Thesis</div><div style="white-space:pre-wrap;line-height:1.75;">${esc(bd.thesis || n.content || '')}</div></div>
                ${bd.models ? `<div><div style="font-size:0.74rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;">Key Models</div><div style="white-space:pre-wrap;line-height:1.75;">${esc(bd.models)}</div></div>` : ''}
                ${bd.implement ? `<div><div style="font-size:0.74rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;">Implementation</div><div style="white-space:pre-wrap;line-height:1.75;">${esc(bd.implement)}</div></div>` : ''}
                ${bd.disagree ? `<div><div style="font-size:0.74rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;">What I Disagreed With</div><div style="white-space:pre-wrap;line-height:1.75;">${esc(bd.disagree)}</div></div>` : ''}
                ${bd.changed ? `<div><div style="font-size:0.74rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;">What Changed</div><div style="white-space:pre-wrap;line-height:1.75;">${esc(bd.changed)}</div></div>` : ''}
            </div>
        `;
    }
    return `<div style="white-space:pre-wrap;line-height:1.8;color:var(--text-primary);font-size:0.98rem;">${esc(n.content || n.conclusion || '')}</div>`;
}

function renderKnowledgeDetail(entry) {
    const detail = document.getElementById('knowledgeDetail');
    if (!detail) return;
    if (!entry) {
        detail.innerHTML = '<div class="empty" style="padding:28px;">Select a note to read it here.</div>';
        return;
    }
    const confidence = entry.confidence || 0;
    const confLabel = ['','Fuzzy','Developing','Solid','Strong','Teach'][confidence] || '';
    const meta = [entry.pathway ? String(entry.pathway).toUpperCase() : '', entry.entryType || 'note', entry.updated || entry.created || ''].filter(Boolean);
    detail.innerHTML = `
        <div class="card" style="padding:24px;min-height:520px;">
            <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px;flex-wrap:wrap;">
                <div style="max-width:780px;">
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
                        ${meta.map(m => `<span class="badge">${esc(m)}</span>`).join('')}
                        ${entry.entryType === 'model' ? `<span class="badge badge-blue">L${confidence} ${esc(confLabel)}</span>` : ''}
                    </div>
                    <h3 style="margin:0 0 8px 0;font-size:1.55rem;line-height:1.25;">${esc(entry.title || 'Untitled')}</h3>
                    <div style="color:var(--text-muted);font-size:0.9rem;">A connected reading view with claim-level evidence, explicit links, and backlinks.</div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-secondary" onclick="editKnowledge('${esc(entry.id)}')">Edit</button>
                    <button class="btn btn-primary" onclick="openKnowledgeModal('${entry.entryType || 'note'}')">New</button>
                </div>
            </div>

            ${(entry.tags || []).length ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">${(entry.tags || []).map(t => `<span style="font-size:0.72rem;padding:4px 10px;background:var(--bg-tertiary);border-radius:999px;color:var(--text-muted);">#${esc(t)}</span>`).join('')}</div>` : ''}

            <div style="border-top:1px solid var(--border);padding-top:18px;">${knowledgeEntryBody(entry)}</div>
            ${typeof studyosRenderEvidence === 'function' ? studyosRenderEvidence(entry) : ''}
            ${typeof studyosRenderConnections === 'function' ? studyosRenderConnections('knowledge', entry.id, entry.unresolvedLinks) : ''}
        </div>
    `;
}

function renderKnowledge() {
    const notes = arr(K.knowledge);
    const searchTerm = (document.getElementById('knowledgeSearch')?.value || '').trim().toLowerCase();

    var noteCount = notes.filter(function(n) { return !n.entryType || n.entryType === 'note' || n.type === 'template'; }).length;
    var criticalCount = notes.filter(function(n) { return n.entryType === 'critical'; }).length;
    var modelCount = notes.filter(function(n) { return n.entryType === 'model'; }).length;
    var bookCount = notes.filter(function(n) { return n.entryType === 'book'; }).length;
    var recentCount = notes.filter(function(n) { var d = n.updated || n.created || ''; var week = new Date(); week.setDate(week.getDate()-7); return d >= fmtDate(week); }).length;
    var citedCount = notes.filter(function(n) { var evidence = n.evidence || {}; return !!(evidence.sourceId || evidence.sourceLabel) && !!evidence.locator; }).length;

    var statsEl = document.getElementById('knowledgeStats');
    if (statsEl) {
        statsEl.innerHTML = '<div class="summary-strip" style="margin-bottom:12px;">' +
            '<div class="summary-card"><div class="summary-kicker">Total</div><div class="summary-value">' + notes.length + '</div><div class="summary-hint">entries</div></div>' +
            '<div class="summary-card"><div class="summary-kicker">📝 Notes</div><div class="summary-value">' + noteCount + '</div></div>' +
            '<div class="summary-card"><div class="summary-kicker">🧠 Models</div><div class="summary-value">' + modelCount + '</div></div>' +
            '<div class="summary-card"><div class="summary-kicker">📚 Books</div><div class="summary-value">' + bookCount + '</div></div>' +
            '<div class="summary-card"><div class="summary-kicker">Cited</div><div class="summary-value">' + citedCount + '/' + notes.length + '</div><div class="summary-hint">source + locator</div></div>' +
            '<div class="summary-card"><div class="summary-kicker">This Week</div><div class="summary-value">' + recentCount + '</div><div class="summary-hint">new/updated</div></div>' +
        '</div>';
    }

    const typeEl = document.getElementById('knowledgeTypeFilter');
    if (typeEl) {
        typeEl.innerHTML = `
            <button class="filter-btn ${knowledgeType==='all'?'active':''}" onclick="knowledgeType='all';renderKnowledge()">All (${notes.length})</button>
            <button class="filter-btn ${knowledgeType==='note'?'active':''}" onclick="knowledgeType='note';renderKnowledge()">📝 Notes (${noteCount})</button>
            <button class="filter-btn ${knowledgeType==='critical'?'active':''}" onclick="knowledgeType='critical';renderKnowledge()">🔍 Critical (${criticalCount})</button>
            <button class="filter-btn ${knowledgeType==='model'?'active':''}" onclick="knowledgeType='model';renderKnowledge()">🧠 Models (${modelCount})</button>
            <button class="filter-btn ${knowledgeType==='book'?'active':''}" onclick="knowledgeType='book';renderKnowledge()">📚 Books (${bookCount})</button>
        `;
    }
    const filterBar = document.getElementById('knowledgeFilters');
    if (filterBar) {
      filterBar.innerHTML = `
        <button class="filter-btn ${knowledgeFilter==='all'?'active':''}" onclick="filterKnowledge('all')">All</button>
        <button class="filter-btn ${knowledgeFilter==='pmp'?'active':''}" onclick="filterKnowledge('pmp')">PMP</button>
        <button class="filter-btn ${knowledgeFilter==='mcmaster'?'active':''}" onclick="filterKnowledge('mcmaster')">McMaster</button>
        <button class="filter-btn ${knowledgeFilter==='smr'?'active':''}" onclick="filterKnowledge('smr')">SMR</button>
      `;
    }

    let filtered = notes.filter(function(n) {
      const evidence = n.evidence || {};
      const blob = [n.title, n.content, n.conclusion, n.pathway, n.entryType, n.type, evidence.sourceLabel, evidence.locator, evidence.excerpt, evidence.interpretation, ...(n.tags || []), ...(n.relatedTitles || [])].filter(Boolean).join(' ').toLowerCase();
      return !searchTerm || blob.includes(searchTerm);
    });
    if (knowledgeFilter !== 'all') filtered = filtered.filter(n => n.pathway === knowledgeFilter);
    if (knowledgeType === 'note') filtered = filtered.filter(n => !n.entryType || n.entryType === 'note' || n.type === 'template');
    if (knowledgeType === 'critical') filtered = filtered.filter(n => n.entryType === 'critical');
    if (knowledgeType === 'model') filtered = filtered.filter(n => n.entryType === 'model');
    if (knowledgeType === 'book') filtered = filtered.filter(n => n.entryType === 'book');

    filtered = filtered.sort((a,b) => String(b.updated||b.created||'').localeCompare(String(a.updated||a.created||'')));
    if (!selectedKnowledgeId || !filtered.some(n => n.id === selectedKnowledgeId)) selectedKnowledgeId = filtered[0]?.id || null;

    const container = document.getElementById('knowledgeContainer');
    if (!container) return;
    if (filtered.length === 0) {
      const helper = notes.length ? `There are ${notes.length} total entries, but none match the current filters/search.` : 'No entries yet. Start building your knowledge vault.';
      container.innerHTML = '<div class="empty" style="grid-column:1/-1;">' + helper + '</div>';
      renderKnowledgeDetail(null);
      return;
    }

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(320px, 360px) minmax(0, 1fr);gap:18px;align-items:start;">
        <div class="card" style="padding:10px;max-height:760px;overflow:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 10px 14px 10px;border-bottom:1px solid var(--border);margin-bottom:6px;">
            <div>
              <div class="card-title" style="margin-bottom:4px;">Knowledge Index</div>
              <div class="muted">Browse and open entries in a reading pane.</div>
            </div>
            <span class="badge">${filtered.length}</span>
          </div>
          <div style="display:grid;gap:8px;">${filtered.map(n => {
            const preview = (n.content || n.conclusion || ((n.bookData||{}).thesis) || '').trim();
            const active = n.id === selectedKnowledgeId;
            const badge = n.entryType === 'book' ? '📚 Book' : n.entryType === 'model' ? `🧠 L${n.confidence || 3}` : n.entryType === 'critical' ? '🔍 Critical' : '📝 Note';
            return `
              <div class="card" onclick="selectKnowledge('${esc(n.id)}')" style="cursor:pointer;padding:14px;border:${active ? '1px solid var(--accent)' : '1px solid var(--border)'};box-shadow:${active ? '0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent)' : 'none'};background:${active ? 'color-mix(in srgb, var(--accent) 8%, var(--bg-secondary))' : 'var(--bg-secondary)'};">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px;">
                  <div style="font-weight:700;line-height:1.35;">${esc(n.title || 'Untitled')}</div>
                  <span class="badge">${badge}</span>
                </div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">${esc([n.pathway ? String(n.pathway).toUpperCase() : '', n.updated || n.created || ''].filter(Boolean).join(' • '))}</div>
                <div style="font-size:0.86rem;color:var(--text-secondary);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap;">${esc(preview || 'No preview yet.')}</div>
              </div>
            `;
          }).join('')}</div>
        </div>
        <div id="knowledgeDetail"></div>
      </div>
    `;

    renderKnowledgeDetail(filtered.find(n => n.id === selectedKnowledgeId) || filtered[0]);
}

function selectKnowledge(id) {
    selectedKnowledgeId = id;
    renderKnowledge();
}

function toggleModelTest(id) {
    const content = document.getElementById('mc_' + id);
    const test = document.getElementById('mt_' + id);
    if (!content) return;
    if (content.style.display === 'none') { content.style.display = 'block'; test.innerHTML = '✅ Model revealed. <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();toggleModelTest(\'' + id + '\')" style="margin-left:8px;">Hide</button> <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();editKnowledge(\'' + id + '\')" style="margin-left:4px;">✏️</button>'; }
    else { content.style.display = 'none'; test.innerHTML = '🧪 Can you explain this model? <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();toggleModelTest(\'' + id + '\')" style="margin-left:8px;">Reveal</button> <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();editKnowledge(\'' + id + '\')" style="margin-left:4px;">✏️</button>'; }
}

function filterKnowledge(f) { knowledgeFilter = f; renderKnowledge(); }
window.selectKnowledge = selectKnowledge;

function setModelConfidence(level) {
    var el = document.getElementById('knowledgeConfidence');
    if (el) el.value = level;
    for (var i = 1; i <= 5; i++) {
        var btn = document.getElementById('mc' + i);
        if (btn) {
            btn.style.background = i <= level ? 'var(--accent)' : 'var(--bg-tertiary)';
            btn.style.color = i <= level ? 'white' : 'var(--text-primary)';
            btn.style.borderColor = i <= level ? 'var(--accent)' : 'var(--border)';
        }
    }
}

function openKnowledgeModal(type) {
    editingKnowledgeId = null;
    const entryType = type || 'note';
    document.getElementById('knowledgeDeleteBtn').style.display = 'none';
    const bodyEl = document.getElementById('knowledgeModalBody');

    if (entryType === 'critical') {
        const questions = typeof CRITICAL_THINKING_QUESTIONS !== 'undefined' ? CRITICAL_THINKING_QUESTIONS : [];
        bodyEl.innerHTML = `
            <input type="hidden" id="knowledgeEntryType" value="critical">
            <div class="form-group"><label class="form-label" for="knowledgeTitle">Title *</label><input type="text" class="form-input" id="knowledgeTitle" placeholder="e.g., Analysis of PMBOK Chapter 4"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label" for="knowledgePathway">Pathway</label><select class="form-select" id="knowledgePathway"><option value="">— None —</option><option value="pmp">PMP</option><option value="mcmaster">McMaster</option><option value="smr">SMR</option></select></div>
                <div class="form-group"><label class="form-label" for="knowledgeTags">Tags</label><input type="text" class="form-input" id="knowledgeTags" placeholder="critical-thinking, chapter-4"></div>
            </div>
            <div style="background:var(--bg-tertiary);padding:12px;border-radius:8px;margin-bottom:14px;font-size:0.8rem;color:var(--text-muted);">
                <strong style="color:var(--purple);">📖 From "Asking the Right Questions":</strong> Use these 10 questions to critically evaluate any material.
            </div>
            ${questions.map(q => '<div class="form-group"><label class="form-label" for="ct_' + q.id + '">' + q.label + '</label><div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">' + q.hint + '</div><textarea class="form-textarea" id="ct_' + q.id + '" style="min-height:60px;" placeholder="Your analysis..."></textarea></div>').join('')}
        `;
    } else if (entryType === 'model') {
        bodyEl.innerHTML = `
            <input type="hidden" id="knowledgeEntryType" value="model">
            <div class="form-group"><label class="form-label" for="knowledgeTitle">Model Name *</label><input type="text" class="form-input" id="knowledgeTitle" placeholder="e.g., How EVM flows through a project"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label" for="knowledgePathway">Domain</label><select class="form-select" id="knowledgePathway"><option value="">General</option><option value="pmp">PMP</option><option value="construction">Construction</option><option value="smr">SMR</option><option value="mcmaster">McMaster</option></select></div>
                <div class="form-group"><label class="form-label" for="knowledgeTags">Connected to</label><input type="text" class="form-input" id="knowledgeTags" placeholder="e.g., cost-management, CPI"></div>
            </div>
            <div class="form-group"><label class="form-label" for="knowledgeContent">How it works (explain simply) *</label><textarea class="form-textarea" id="knowledgeContent" rows="4" placeholder="Explain this mental model as if teaching someone. If you can't explain it simply, you don't understand it well enough."></textarea></div>
            <div class="form-group"><div class="form-label">Confidence Level</div>
                <div style="display:flex;gap:6px;" role="group" aria-label="Confidence level">
                    <button type="button" class="btn btn-sm" onclick="setModelConfidence(1)" id="mc1" style="min-width:55px;">1 Fuzzy</button>
                    <button type="button" class="btn btn-sm" onclick="setModelConfidence(2)" id="mc2" style="min-width:40px;">2</button>
                    <button type="button" class="btn btn-sm" onclick="setModelConfidence(3)" id="mc3" style="min-width:55px;">3 Solid</button>
                    <button type="button" class="btn btn-sm" onclick="setModelConfidence(4)" id="mc4" style="min-width:40px;">4</button>
                    <button type="button" class="btn btn-sm" onclick="setModelConfidence(5)" id="mc5" style="min-width:55px;">5 Teach</button>
                </div>
                <input type="hidden" id="knowledgeConfidence" value="3">
            </div>
        `;
        setTimeout(function() { setModelConfidence(3); }, 50);
    } else if (entryType === 'book') {
        bodyEl.innerHTML = `
            <input type="hidden" id="knowledgeEntryType" value="book">
            <div class="form-group"><label class="form-label" for="knowledgeTitle">📚 Book Title + Author *</label><input type="text" class="form-input" id="knowledgeTitle" placeholder="e.g., Peak — Anders Ericsson"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label" for="knowledgePathway">Domain</label><select class="form-select" id="knowledgePathway"><option value="">General</option><option value="pmp">PMP</option><option value="construction">Construction</option><option value="smr">SMR</option><option value="systems">Systems</option><option value="strategy">Strategy</option><option value="psychology">Psychology</option></select></div>
                <div class="form-group"><label class="form-label" for="knowledgeTags">Tags</label><input type="text" class="form-input" id="knowledgeTags" placeholder="deliberate-practice, expertise"></div>
            </div>
            <div class="form-group"><label class="form-label" for="bookThesis">Core Thesis * (1-2 sentences)</label><textarea class="form-textarea" id="bookThesis" rows="2" placeholder="What is the book's central argument?"></textarea></div>
            <div class="form-group"><label class="form-label" for="bookModels">Key Models (up to 5)</label><textarea class="form-textarea" id="bookModels" rows="3" placeholder="1. Deliberate practice hierarchy&#10;2. Mental representations&#10;3. Fatigue and feedback guardrails"></textarea></div>
            <div class="form-group"><label class="form-label" for="bookDisagree">What I Disagreed With</label><textarea class="form-textarea" id="bookDisagree" rows="2" placeholder="Where does the argument break? What's missing?"></textarea></div>
            <div class="form-group"><label class="form-label" for="bookImplement">What I Will Implement *</label><textarea class="form-textarea" id="bookImplement" rows="2" placeholder="Concrete actions I'm taking from this book"></textarea></div>
            <div class="form-group"><label class="form-label" for="bookChanged">What Changed in My Thinking</label><textarea class="form-textarea" id="bookChanged" rows="2" placeholder="How did this shift my mental models?"></textarea></div>
        `;
    } else {
        bodyEl.innerHTML = `
            <input type="hidden" id="knowledgeEntryType" value="note">
            <div class="form-group"><label class="form-label" for="knowledgeTitle">Title *</label><input type="text" class="form-input" id="knowledgeTitle"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label" for="knowledgePathway">Pathway</label><select class="form-select" id="knowledgePathway"><option value="">— None —</option><option value="pmp">PMP</option><option value="mcmaster">McMaster</option><option value="smr">SMR</option></select></div>
                <div class="form-group"><label class="form-label" for="knowledgeTags">Tags</label><input type="text" class="form-input" id="knowledgeTags" placeholder="risk, evm, pmp"></div>
            </div>
            <div class="form-group"><label class="form-label" for="knowledgeContent">Content *</label><textarea class="form-textarea" id="knowledgeContent" style="min-height:150px" placeholder="Your notes, formulas, key concepts..."></textarea></div>
        `;
    }
    if (typeof studyosKnowledgeEvidenceFieldsHTML === 'function') {
        bodyEl.insertAdjacentHTML('beforeend', studyosKnowledgeEvidenceFieldsHTML());
    }
    openModal('knowledgeModal');
}

function editKnowledge(id) {
    const n = arr(K.knowledge).find(x => x.id === id);
    if (!n) return;

    if (n.entryType === 'critical') {
        openKnowledgeModal('critical');
        editingKnowledgeId = id;
        document.getElementById('knowledgeTitle').value = n.title || '';
        document.getElementById('knowledgePathway').value = n.pathway || '';
        document.getElementById('knowledgeTags').value = (n.tags || []).join(', ');
        const questions = typeof CRITICAL_THINKING_QUESTIONS !== 'undefined' ? CRITICAL_THINKING_QUESTIONS : [];
        questions.forEach(q => { const el = document.getElementById('ct_' + q.id); if (el) el.value = (n.analysis && n.analysis[q.id]) || ''; });
    } else if (n.entryType === 'model') {
        openKnowledgeModal('model');
        editingKnowledgeId = id;
        document.getElementById('knowledgeTitle').value = n.title || '';
        document.getElementById('knowledgePathway').value = n.pathway || '';
        document.getElementById('knowledgeTags').value = (n.tags || []).join(', ');
        var ce = document.getElementById('knowledgeContent'); if (ce) ce.value = n.content || '';
        setTimeout(function() { setModelConfidence(n.confidence || 3); }, 60);
    } else if (n.entryType === 'book') {
        openKnowledgeModal('book');
        editingKnowledgeId = id;
        document.getElementById('knowledgeTitle').value = n.title || '';
        document.getElementById('knowledgePathway').value = n.pathway || '';
        document.getElementById('knowledgeTags').value = (n.tags || []).join(', ');
        var bd = n.bookData || {};
        var bt = document.getElementById('bookThesis'); if (bt) bt.value = bd.thesis || '';
        var bm = document.getElementById('bookModels'); if (bm) bm.value = bd.models || '';
        var bdis = document.getElementById('bookDisagree'); if (bdis) bdis.value = bd.disagree || '';
        var bi = document.getElementById('bookImplement'); if (bi) bi.value = bd.implement || '';
        var bc = document.getElementById('bookChanged'); if (bc) bc.value = bd.changed || '';
    } else {
        openKnowledgeModal('note');
        editingKnowledgeId = id;
        document.getElementById('knowledgeTitle').value = n.title || '';
        document.getElementById('knowledgePathway').value = n.pathway || '';
        document.getElementById('knowledgeTags').value = (n.tags || []).join(', ');
        var ce2 = document.getElementById('knowledgeContent'); if (ce2) ce2.value = n.content || '';
    }
    if (typeof studyosPopulateKnowledgeEvidenceFields === 'function') studyosPopulateKnowledgeEvidenceFields(n);
    document.getElementById('knowledgeDeleteBtn').style.display = 'block';
}

function saveKnowledge() {
    const title = document.getElementById('knowledgeTitle').value.trim();
    if (!title) { toast('Title required'); return; }
    const entryTypeEl = document.getElementById('knowledgeEntryType');
    const entryType = entryTypeEl ? entryTypeEl.value : 'note';
    const tagsStr = document.getElementById('knowledgeTags').value.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
    const pathway = document.getElementById('knowledgePathway').value || null;
    const notes = arr(K.knowledge);

    if (entryType === 'critical') {
        const questions = typeof CRITICAL_THINKING_QUESTIONS !== 'undefined' ? CRITICAL_THINKING_QUESTIONS : [];
        const analysis = {}; let hasContent = false;
        questions.forEach(q => { const el = document.getElementById('ct_' + q.id); if (el && el.value.trim()) { analysis[q.id] = el.value.trim(); hasContent = true; } });
        if (!hasContent) { toast('Fill in at least one field'); return; }
        const entry = { title, tags, pathway, entryType: 'critical', analysis, conclusion: analysis.conclusion || '', updated: today() };
        if (editingKnowledgeId) { const n = notes.find(x => x.id === editingKnowledgeId); if (n) Object.assign(n, entry); }
        else notes.push({ id: uid(), ...entry, created: today() });
    } else if (entryType === 'model') {
        const content = (document.getElementById('knowledgeContent') || {}).value || '';
        if (!content.trim()) { toast('Explanation required'); return; }
        const confidence = parseInt((document.getElementById('knowledgeConfidence') || {}).value) || 3;
        const entry = { title, content: content.trim(), tags, pathway, entryType: 'model', confidence, lastTested: new Date().toISOString(), updated: today() };
        if (editingKnowledgeId) { const n = notes.find(x => x.id === editingKnowledgeId); if (n) Object.assign(n, entry); }
        else notes.push({ id: uid(), ...entry, created: today() });
    } else if (entryType === 'book') {
        const thesis = (document.getElementById('bookThesis') || {}).value?.trim() || '';
        const implement = (document.getElementById('bookImplement') || {}).value?.trim() || '';
        if (!thesis) { toast('Core thesis required'); return; }
        if (!implement) { toast('Implementation actions required'); return; }
        const bookData = {
            thesis,
            models: (document.getElementById('bookModels') || {}).value?.trim() || '',
            disagree: (document.getElementById('bookDisagree') || {}).value?.trim() || '',
            implement,
            changed: (document.getElementById('bookChanged') || {}).value?.trim() || ''
        };
        const entry = { title, content: thesis, tags, pathway, entryType: 'book', bookData, updated: today() };
        if (editingKnowledgeId) { const n = notes.find(x => x.id === editingKnowledgeId); if (n) Object.assign(n, entry); }
        else notes.push({ id: uid(), ...entry, created: today() });
    } else {
        const content = (document.getElementById('knowledgeContent') || {}).value || '';
        if (!content.trim()) { toast('Content required'); return; }
        const entry = { title, content: content.trim(), tags, pathway, entryType: 'note', updated: today() };
        if (editingKnowledgeId) { const n = notes.find(x => x.id === editingKnowledgeId); if (n) Object.assign(n, entry); }
        else notes.push({ id: uid(), ...entry, created: today() });
    }
    const savedEntry = editingKnowledgeId ? notes.find(x => x.id === editingKnowledgeId) : notes[notes.length - 1];
    if (savedEntry && typeof studyosReadKnowledgeEvidenceFields === 'function') {
        Object.assign(savedEntry, studyosReadKnowledgeEvidenceFields());
    }
    if (savedEntry && typeof studyosSyncKnowledgeLinks === 'function') studyosSyncKnowledgeLinks(savedEntry);
    set(K.knowledge, notes); selectedKnowledgeId = savedEntry?.id || selectedKnowledgeId; closeModal('knowledgeModal'); renderKnowledge(); toast('Saved!');
}

function deleteKnowledge() {
    if (!editingKnowledgeId || !confirm('Delete?')) return;
    set(K.knowledge, arr(K.knowledge).filter(n => n.id !== editingKnowledgeId));
    if (typeof studyosRemoveEntityLinks === 'function') studyosRemoveEntityLinks('knowledge', editingKnowledgeId);
    selectedKnowledgeId = null;
    closeModal('knowledgeModal'); renderKnowledge(); toast('Deleted');
}

// ==================== KNOWLEDGE GRAPH (reuses doctrine's model graph renderer) ====================
// V28 treats explicit links as the primary graph signal. Shared tags/pathways
// remain useful secondary suggestions, so old entries keep their structure.
function buildKnowledgeGraphData() {
    const notes = arr(K.knowledge);
    const nodes = notes.map(n => ({ id: n.id, label: n.title || 'Untitled', moduleId: n.entryType || 'note', apps: 0 }));
    const noteIds = new Set(notes.map(n => n.id));
    const links = arr(K.entityLinks).filter(link => link.fromType === 'knowledge' && link.toType === 'knowledge' && noteIds.has(link.fromId) && noteIds.has(link.toId)).map(link => ({ source: link.fromId, target: link.toId, weight: link.relation === 'evidence' ? 3 : 2, kind: 'explicit' }));
    for (let i = 0; i < notes.length; i++) {
        for (let j = i + 1; j < notes.length; j++) {
            const a = notes[i], b = notes[j];
            const aTags = (a.tags || []).map(t => String(t).toLowerCase());
            const bTags = (b.tags || []).map(t => String(t).toLowerCase());
            const shared = aTags.filter(t => bTags.indexOf(t) !== -1);
            let weight = shared.length;
            if (a.pathway && a.pathway === b.pathway) weight += 1;
            const alreadyLinked = links.some(link => (link.source === a.id && link.target === b.id) || (link.source === b.id && link.target === a.id));
            if (weight > 0 && !alreadyLinked) links.push({ source: a.id, target: b.id, weight, kind: 'inferred' });
        }
    }
    const degree = {};
    links.forEach(l => { degree[l.source] = (degree[l.source] || 0) + 1; degree[l.target] = (degree[l.target] || 0) + 1; });
    nodes.forEach(n => { n.apps = degree[n.id] || 0; });
    return { nodes, links };
}

function openKnowledgeGraph() {
    if (typeof doctrineRenderModelGraph !== 'function') { toast('Graph view unavailable.'); return; }
    const { nodes, links } = buildKnowledgeGraphData();
    if (!nodes.length) { toast('No knowledge entries yet.'); return; }

    const titleEl = document.getElementById('modelGraphModalTitle');
    if (titleEl) titleEl.textContent = 'Knowledge Graph';
    const hintEl = document.getElementById('modelGraphHint');
    if (hintEl) hintEl.textContent = 'Purpose: visualize your connected knowledge. Explicit [[links]] and related titles are primary; shared tags/pathways provide secondary inferred edges. Node size = number of connections.';

    doctrineRenderModelGraph(nodes, links, null);
    openModal('modelGraphModal');
}
