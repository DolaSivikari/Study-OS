// Split from legacy doctrine.js for V16 maintainability.

function doctrineOpenModal(id) {
  const mods = doctrineAllModules();
  const m = mods.find(x => x.id === id);
  if (!m) return;

  const drill = (m.drills && m.drills.length) ? m.drills[0] : 'No drill available.';
  // StudyOS modal API expects an element id, not an object.
  const titleEl = document.getElementById('doctrineModalTitle');
  const bodyEl = document.getElementById('doctrineModalBody');
  const primaryBtn = document.getElementById('doctrineModalPrimary');
  const secondaryBtn = document.getElementById('doctrineModalSecondary');
  if (!titleEl || !bodyEl || !primaryBtn || !secondaryBtn) {
    toast('Doctrine modal missing.');
    return;
  }

  
  
  // Reset handlers to prevent leakage across modal reuse
  primaryBtn.onclick = null;
  secondaryBtn.onclick = null;
// Reset handlers to prevent leakage across modal reuse
  primaryBtn.onclick = null;
  secondaryBtn.onclick = null;
titleEl.textContent = `Doctrine Drill — ${m.title}`;
  bodyEl.innerHTML = `
    <div class="modal-section">
      <div class="kicker">Primary drill</div>
      <div class="muted" style="line-height:1.45;">${esc(drill)}</div>
    </div>

    <div class="modal-section" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
      <div>
        <div class="kicker">Depth</div>
        <select id="doctrineDepth" class="input">
          <option value="surface">Surface</option>
          <option value="structured" selected>Structured</option>
          <option value="teach">Teach-level</option>
        </select>
      </div>
      <div>
        <div class="kicker">Friction (1–5)</div>
        <select id="doctrineFriction" class="input">
          <option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option>
        </select>
      </div>
    </div>

    <div class="modal-section" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div>
        <div class="kicker">Primary domain</div>
        <select id="doctrinePrimaryDomain" class="input">
          <option value="technical" ${m.primaryDomain==='technical'?'selected':''}>Technical</option>
          <option value="strategic" ${m.primaryDomain==='strategic'?'selected':''}>Strategic</option>
          <option value="leadership" ${m.primaryDomain==='leadership'?'selected':''}>Leadership</option>
        </select>
      </div>

      <div>
        <div class="kicker">Model used</div>
        <div id="doctrineModelSuggestRow" style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 8px 0;"></div>
        <select id="doctrineModelUsed" class="input">
          ${doctrineModelOptions(m)}
        </select>
      </div>


      <div>
        <div class="kicker">Minutes spent</div>
        <input id="doctrineMinutesSpent" class="input" type="number" min="5" max="240" step="5" value="60" />
      </div>
      <div>
        <div class="kicker">Also log time</div>
        <label style="display:flex;align-items:center;gap:10px;margin-top:6px;">
          <input type="checkbox" id="doctrineAlsoLogTime" />
          <span class="muted">Add study entry</span>
        </label>
      </div>
    </div>

    <div class="modal-section">
      <div class="kicker">Application example</div>
      <input id="doctrineApplication" class="input" placeholder="Where will you apply this (today/this week)?" />
    </div>

    <div class="modal-section">
      <div class="kicker">Capture</div>
      <textarea id="doctrineCapture" class="textarea" placeholder="Write your answer / plan here…" rows="7"></textarea>
      <div class="hint">Balanced mode: log the drill + keep a short note. No essays.</div>
    </div>
  `;

  // Optional prefill hook (used by Intelligence for corrective drills)
  try {
    const pf = window.__DOCTRINE_PREFILL || null;
    if (pf) {
      if (pf.depth) {
        const sel = document.getElementById('doctrineDepth');
        if (sel) sel.value = pf.depth;
      }
      if (pf.primaryDomain) {
        const domSel = document.getElementById('doctrinePrimaryDomain');
        if (domSel) domSel.value = pf.primaryDomain;
      }
      if (pf.minutesSpent) {
        const ms = document.getElementById('doctrineMinutesSpent');
        if (ms) ms.value = String(pf.minutesSpent);
      }
      // one-shot
      window.__DOCTRINE_PREFILL = null;
    }
  } catch(e) {}

  // V11 v11: Model auto-suggest chips + default selection
  try {
    const suggestRow = document.getElementById('doctrineModelSuggestRow');
    const modelSel = document.getElementById('doctrineModelUsed');
    if(modelSel){
      const suggested = doctrineSuggestModelIds(m, 3);
      // default selection: override / most used
      if(suggested.length){
        modelSel.value = suggested[0];
      }
      if(suggestRow){
        const chips = suggested
          .map(id => {
            const lbl = doctrineModelLabel(m, id) || 'Model';
            return `<button class="chip" type="button" onclick="(function(){ const s=document.getElementById('doctrineModelUsed'); if(s) s.value='${esc(id)}'; })()">${esc(lbl)}</button>`;
          })
          .join('');
        suggestRow.innerHTML = chips ? `<div class="muted" style="font-size:0.78rem;align-self:center;margin-right:4px;">Suggested:</div>${chips}` : '';
      }
    }
  } catch(e) {}

  primaryBtn.textContent = 'Log Drill + Save Note';
  secondaryBtn.textContent = 'Close';

  primaryBtn.onclick = () => {
    const txt = (document.getElementById('doctrineCapture')?.value || '').trim();
    const depth = (document.getElementById('doctrineDepth')?.value || 'structured');
    const friction = parseInt(document.getElementById('doctrineFriction')?.value || '3', 10);
    const application = (document.getElementById('doctrineApplication')?.value || '').trim();
    const primaryDomain = (document.getElementById('doctrinePrimaryDomain')?.value || m.primaryDomain || 'strategic');
    const modelUsed = (document.getElementById('doctrineModelUsed')?.value || '').trim();
    const modelLabel = doctrineModelLabel(m, modelUsed);
    // Persist per-module override for faster future logging
    doctrineSetDomainOverride(m.id, primaryDomain);
    doctrineSetModelOverride(m.id, modelUsed);
    const alsoLogTime = !!document.getElementById('doctrineAlsoLogTime')?.checked;

    // 1) Log for momentum (V11)
    if (typeof LEARN !== 'undefined') {
      LEARN.addDoctrineLog({
        id: uid(),
        at: Date.now(),
        date: today(),
        moduleId: m.id,
        moduleTitle: m.title,
        domain: m.domain,
        primaryDomain,
        depth,
        friction,
        application: application || null,
        modelId: modelUsed || null,
        modelLabel: modelLabel || null
      });
    }

    // 2) Optional note to journal (short)
    if (txt) {
      const j = arr(K.journal);
      j.unshift({
        id: uid(),
        date: today(),
        title: `Doctrine: ${m.title}`,
        content: `<p>${esc(txt)}</p>`,
        tags: ['doctrine', primaryDomain, m.domain]
      });
      set(K.journal, j);
    }

    // Optional time log (uses minutes spent)
    if (alsoLogTime && typeof openTimeModalWithPrefill === 'function') {
      const mins = Math.max(5, Math.min(240, parseInt(document.getElementById('doctrineMinutesSpent')?.value || '60', 10) || 60));
      const hours = Math.round((mins / 60) * 4) / 4; // nearest 15 min
      openTimeModalWithPrefill(primaryDomain, `Doctrine — ${m.title}`, hours);
    }

    toast('Drill logged.' + (txt ? ' Note saved.' : ''));
    closeModal('doctrineModal');
    // Refresh dashboard indicators if present
    if (typeof refreshDashboard === 'function') refreshDashboard();
  };
  secondaryBtn.onclick = () => closeModal('doctrineModal');

  openModal('doctrineModal');
}

function doctrineTemplate(moduleId, type) {
  const mods = doctrineAllModules();
  const m = mods.find(x => x.id === moduleId);
  if (!m) return;

  // Create a Knowledge Vault entry scaffold (original abstraction, no source text).
  const templates = Array.isArray(m.templates) ? m.templates : [];
  const t = templates.find(x => (typeof x === 'object') && (String(x.type||x.id||'')===String(type))) || templates.find(x => (typeof x === 'object') && (String(x.name||x.title||'')===String(type)));
  const label = (typeof t === 'string') ? t : (t?.name || t?.title || type);

  const fields = (t && typeof t==='object' && Array.isArray(t.fields) && t.fields.length)
    ? t.fields
    : [
        { label:'Context', hint:'Where/when does this apply?' },
        { label:'Inputs', hint:'What info do you need?' },
        { label:'Decision / Action', hint:'What will you do?' },
        { label:'Risks / Failure modes', hint:'What could go wrong?' },
        { label:'Next step', hint:'Immediate next move' }
      ];

  const entries = arr(K.knowledge);
  const title = `${label} — ${m.title}`;
  const body = fields.map(f=>`- ${f.label}: ${f.hint||''}`).join('\n');
  const content = `TEMPLATE\nModule: ${m.title}\nType: ${label}\n\n${body}`;
  entries.unshift({ id: uid(), type: 'template', title, content, created: Date.now(), tags: ['template', String(type||'template'), m.domain, m.primaryDomain].filter(Boolean) });
  set(K.knowledge, entries);
  toast('Template added to Knowledge Vault.');
  go('knowledgevault');
}

function doctrineCreateFlashcardPack(moduleId) {
  const mods = typeof doctrineAllModules === 'function' ? doctrineAllModules() : [];
  const activeModuleId = moduleId || window.__doctrineActive || (typeof INTEL !== 'undefined' && INTEL.getState ? INTEL.getState().activeModuleId : '');
  const mod = mods.find(m => m.id === activeModuleId);

  const titleEl = document.getElementById('doctrineModalTitle');
  const bodyEl = document.getElementById('doctrineModalBody');
  const primaryBtn = document.getElementById('doctrineModalPrimary');
  const secondaryBtn = document.getElementById('doctrineModalSecondary');
  if (!titleEl || !bodyEl || !primaryBtn || !secondaryBtn) {
    toast('Doctrine modal missing.');
    return;
  }

  const suggestedTopic = mod ? (mod.title || '') : '';
  const suggestedPrompts = mod ? [
    ...((mod.models || []).map(x => `Explain: ${x}`)),
    ...((mod.drills || []).map(d => `When would you apply: ${typeof d === 'string' ? d : (d?.title || d?.name || '')}`))
  ].filter(Boolean).slice(0, 12).join('\n') : '';

  titleEl.textContent = 'Create Flashcard Pack';
  bodyEl.innerHTML = `
    ${mod ? `<div class="hint" style="margin-bottom:10px;">Building from doctrine module: <b>${esc(mod.title)}</b>.</div>` : ''}
    <div class="modal-section">
      <div class="kicker">Topic</div>
      <input id="fcTopic" class="form-input" placeholder="e.g., Concrete curing, Partial fractions, Habit anchors" value="${esc(suggestedTopic)}" />
    </div>
    <div class="modal-section">
      <div class="kicker">Prompts (one per line)</div>
      <textarea id="fcPrompts" class="form-textarea" placeholder="What is…?\nWhen do you use…?\nWhat is the failure mode of…?" rows="10">${esc(suggestedPrompts)}</textarea>
      <div class="hint">StudyOS will create cards with blank backs so you can answer them from memory later.</div>
    </div>
  `;

  primaryBtn.textContent = 'Create Cards';
  secondaryBtn.textContent = 'Cancel';

  primaryBtn.onclick = () => {
    const topic = (document.getElementById('fcTopic')?.value || '').trim();
    const lines = (document.getElementById('fcPrompts')?.value || '').split('\n').map(x=>x.trim()).filter(Boolean);
    if (!topic || !lines.length) { toast('Add a topic and at least one prompt.'); return; }

    const cards = arr(K.flashcards);
    lines.forEach(q => {
      cards.unshift({
        id: uid(),
        question: `${topic}: ${q}`,
        answer: '',
        category: mod?.primaryDomain || mod?.domain || 'doctrine',
        tags: ['doctrine', mod?.id || ''].filter(Boolean),
        topic,
        sourceModuleId: mod?.id || '',
        createdAt: new Date().toISOString(),
        reviews: 0,
        easeFactor: 2.5,
        interval: 0,
        nextReview: today()
      });
    });
    set(K.flashcards, cards);
    toast(`Created ${lines.length} cards.`);
    closeModal('doctrineModal');
    if (typeof goTab === 'function') goTab('study','flashcards'); else go('flashcards');
  };
  secondaryBtn.onclick = () => closeModal('doctrineModal');

  openModal('doctrineModal');
}

// ==================== MODEL-LEVEL COMPOUNDING GRAPH (V11 v10) ====================


// Back-compat alias: older UI used doctrineOpenCompoundingGraph()
