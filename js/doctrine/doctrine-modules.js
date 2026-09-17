// Split from legacy doctrine.js for V16 maintainability.
// ==================== DOCTRINE (V8) ====================
// Explicit "modules" derived from your book + textbook stack.
// This is NOT a book summary system — it is an operating doctrine library:
// models, drills, prompts, flashcard templates, and integration hooks.

// window.DOCTRINE_MODULES is defined in data/doctrine-library.js
// You can extend it via window.DOCTRINE_EXTENSIONS.

// Always read modules from window to avoid scope/load-order edge cases.

function doctrineMods() {
  const m = window.DOCTRINE_MODULES;
  const mods = Array.isArray(m) ? m : [];
  // V11: derive primaryDomain if missing (technical/strategic/leadership)
  return mods.map(x => ({
    ...x,
    primaryDomain: doctrineResolvePrimaryDomain(x)
  }));
}

function doctrineModelOptions(mod){
  const models = Array.isArray(mod?.models) ? mod.models : [];
  if(!models.length) return '<option value="">(none)</option>';
  return models.map((x,i)=>`<option value="${esc(mod.id)}::m${i}">${esc(x)}</option>`).join('');
}

function doctrineModelLabel(mod, modelKey){
  const models = Array.isArray(mod?.models) ? mod.models : [];
  if(!modelKey) return null;
  const mm = /::m(\d+)$/.exec(modelKey);
  if(!mm) return null;
  const idx = parseInt(mm[1],10);
  return (idx>=0 && idx<models.length) ? models[idx] : null;
}

function doctrinePrimaryDomain(mod) {
  const d = String(mod?.domain || '').toLowerCase();
  // Technical mastery (includes operator craft: habits/execution/learning science)
  if (['engineering','construction','measurement','surveying','physics','math','materials','estimating','behavior','execution','learning'].some(k => d.includes(k))) return 'technical';
  // Strategic systems thinking
  if (['strategy','systems','economics','critical'].some(k => d.includes(k))) return 'strategic';
  // Leadership & influence
  if (['leadership','human','influence','communication'].some(k => d.includes(k))) return 'leadership';
  // Default: strategic (meta-learning)
  return 'strategic';
}

function doctrineGetSessionContext(){
  try {
    const ctx = get(K.sessionContext);
    return (ctx && typeof ctx === 'object') ? ctx : null;
  } catch(e) { return null; }
}

function doctrineGetDomainOverrides(){
  const o = get(DOCTRINE_DOMAIN_OVERRIDES_KEY);
  return (o && typeof o === 'object') ? o : {};
}

function doctrineSetDomainOverride(moduleId, domain){
  if(!moduleId) return;
  const d = String(domain || '').toLowerCase();
  if(!['technical','strategic','leadership'].includes(d)) return;
  const o = doctrineGetDomainOverrides();
  o[moduleId] = d;
  set(DOCTRINE_DOMAIN_OVERRIDES_KEY, o);
}

function doctrineResolvePrimaryDomain(mod){
  const o = doctrineGetDomainOverrides();
  return o[mod.id] || mod.primaryDomain || mod.pillar || doctrinePrimaryDomain(mod);
}

// ===== V11 v11: Model auto-suggest + override persistence =====

function doctrineGetModelOverrides(){
  const o = get(DOCTRINE_MODEL_OVERRIDES_KEY);
  return (o && typeof o === 'object') ? o : {};
}

function doctrineSetModelOverride(moduleId, modelId){
  if(!moduleId) return;
  const mid = String(modelId||'').trim();
  const o = doctrineGetModelOverrides();
  if(!mid){
    // clear
    delete o[moduleId];
    set(DOCTRINE_MODEL_OVERRIDES_KEY, o);
    return;
  }
  o[moduleId] = mid;
  set(DOCTRINE_MODEL_OVERRIDES_KEY, o);
}

function doctrineSuggestModelIds(mod, limit=3){
  const out = [];
  // If the user started a specific study block, prefer its context-based model suggestions.
  const ctx = doctrineGetSessionContext();
  if(ctx && ctx.kind === 'study_block' && ctx.moduleId && ctx.moduleId === mod.id){
    const ctxSug = Array.isArray(ctx.suggestedModelIds) ? ctx.suggestedModelIds : [];
    ctxSug.forEach(x=>{ if(x && !out.includes(x)) out.push(x); });
  }
  const overrides = doctrineGetModelOverrides();
  const ov = overrides[mod.id];
  if(ov) out.push(ov);
  try {
    if(typeof LEARN !== 'undefined' && typeof LEARN.suggestModelsForModule === 'function'){
      const sug = LEARN.suggestModelsForModule(mod.id, limit, 30);
      sug.forEach(x=>{ if(x && !out.includes(x)) out.push(x); });
    }
  } catch(e) {}
  // Fallback: first N models
  const models = Array.isArray(mod?.models) ? mod.models : [];
  for(let i=0;i<models.length && out.length<limit;i++){
    const id = `${mod.id}::m${i}`;
    if(!out.includes(id)) out.push(id);
  }
  return out.slice(0, limit);
}

function renderDoctrine() {
  const root = document.getElementById('doctrineRoot');
  if (!root) return;
  try {
    renderDoctrineInner(root);
  } catch(e) {
    const msgRaw = (e && (e.message || e.toString())) ? (e.message || e.toString()) : 'Unknown error';
    const msg = (typeof esc === 'function') ? esc(msgRaw) : String(msgRaw);

    root.innerHTML = `
      <div class="card" style="padding:16px;">
        <div class="card-title" style="color:var(--danger);">Doctrine render failed</div>
        <div style="margin-top:6px;color:var(--text-muted);font-size:0.9rem;">${msg}</div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="go('diagnostics')">Open Diagnostics</button>
          <button class="btn" onclick="renderDoctrine()">Retry</button>
        </div>
      </div>
    `;

    console.error('Doctrine render error:', e);
  }
}

function renderDoctrineInner(root) {
  const view = doctrineGetView();
  const mods = doctrineAllModules();
  if (!mods.length) {
    root.innerHTML = `<div class="empty-state"><div class="empty-title">No doctrine modules loaded</div><div class="empty-sub">The doctrine library did not load. Open Diagnostics to see details.</div></div>`;
    return;
  }
  const intelState = (typeof INTEL !== 'undefined') ? INTEL.getState() : { activeModuleId: null };
  const activeId = intelState.activeModuleId;

  const groups = {};
  mods.forEach(m => {
    groups[m.domain] = groups[m.domain] || [];
    groups[m.domain].push(m);
  });

  const active = mods.find(m => m.id === activeId) || mods[0];

  root.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Doctrine</h1>
        <div class="page-subtitle">Explicit modules + invisible intelligence. Choose what the system should optimize right now.</div>
      </div>
      <div class="page-actions">
        <button class="btn" onclick="doctrineCreateFlashcardPack(window.__doctrineActive)">+ Flashcard Pack</button>
        <button class="btn btn-primary" onclick="doctrineSetActive('${active.id}')">Set Active</button>
      </div>
    </div>

    <div class="filter-bar" style="margin-bottom:12px;">
      <button class="filter-btn ${view==='modules'?'active':''}" onclick="doctrineSetView('modules')">📚 Modules</button>
      <button class="filter-btn ${view==='sources'?'active':''}" onclick="doctrineSetView('sources')">📖 Sources</button>
      <button class="filter-btn ${view==='builder'?'active':''}" onclick="doctrineSetView('builder')">🧱 Builder</button>
    </div>

    <div id="doctrineView"></div>
  `;

  window.__doctrineActive = active.id;
  if(view==='modules') {
    doctrineRenderModulesView(activeId || active.id);
  } else if(view==='sources') {
    doctrineRenderSourcesView();
  } else {
    doctrineRenderBuilderView();
  }
}

function doctrineRenderModulesView(focusId){
  const host = document.getElementById('doctrineView');
  if(!host) return;
  const mods = doctrineAllModules();
  const intelState = (typeof INTEL !== 'undefined') ? INTEL.getState() : { activeModuleId: null };
  const activeId = intelState.activeModuleId;
  const active = mods.find(m=>m.id===focusId) || mods.find(m=>m.id===activeId) || mods[0];
  host.innerHTML = `
    <div class="grid" style="grid-template-columns: 340px 1fr; gap:16px;">
      <div class="panel">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-weight:700;">Module Index</div>
          <span class="badge badge-blue">ACTIVE: ${esc(activeId ? 'YES' : 'NO')}</span>
        </div>
        <input id="doctrineSearch" class="input" placeholder="Search modules…" oninput="renderDoctrineIndex()" />
        <div id="doctrineIndex" style="margin-top:10px;"></div>
      </div>

      <div class="panel" id="doctrineDetail"></div>
    </div>
  `;
  window.__doctrineActive = active.id;
  renderDoctrineIndex();
  renderDoctrineDetail(active.id);
}

function renderDoctrineIndex() {
  const el = document.getElementById('doctrineIndex');
  if (!el) return;
  const q = (document.getElementById('doctrineSearch')?.value || '').trim().toLowerCase();

  
  const mods = doctrineAllModules();
  if (!mods.length) {
    el.innerHTML = `<div class="empty">No doctrine modules loaded.</div>`;
    return;
  }
  const intelState = (typeof INTEL !== 'undefined') ? INTEL.getState() : { activeModuleId: null };
  const activeId = intelState.activeModuleId;

  const filtered = mods.filter(m => {
    if (!q) return true;
    const blob = (m.title + ' ' + m.domain + ' ' + (m.sources||[]).join(' ') + ' ' + (m.models||[]).join(' ')).toLowerCase();
    return blob.includes(q);
  });

  // Render grouped list
  const byDomain = {};
  filtered.forEach(m => {
    byDomain[m.domain] = byDomain[m.domain] || [];
    byDomain[m.domain].push(m);
  });

  el.innerHTML = Object.keys(byDomain).sort().map(domain => {
    const items = byDomain[domain].map(m => {
      const isSel = window.__doctrineActive === m.id;
      const isActive = activeId === m.id;
      return `
        <div class="list-item ${isSel ? 'active' : ''}" onclick="doctrineSelect('${m.id}')">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
              <div style="font-weight:700;">${esc(m.title)}</div>
              <div style="font-size:0.78rem;color:var(--text-muted);">${esc(m.sources.join(' • '))}</div>
            </div>
            ${isActive ? '<span class="badge badge-blue">ACTIVE</span>' : ''}
          </div>
        </div>
      `;
    }).join('');
    return `
      <div style="margin-top:12px;">
        <div style="font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin:10px 0 6px;">${esc(domain)}</div>
        <div class="list">${items}</div>
      </div>
    `;
  }).join('');
}

function doctrineSelect(id) {
  window.__doctrineActive = id;
  renderDoctrineIndex();
  renderDoctrineDetail(id);
}

function doctrineSetActive(id) {
  if (typeof INTEL !== 'undefined') {
    INTEL.setActiveModule(id);
  }
  toast('Active module set. Intelligence will bias Next Move toward this doctrine.');
  renderDoctrineIndex();
}

function renderDoctrineDetail(id) {
  const panel = document.getElementById('doctrineDetail');
  if (!panel) return;
  const mods = doctrineAllModules();
  const m = mods.find(x => x.id === id);
  if (!m) {
    panel.innerHTML = '<div class="empty">Select a module.</div>';
    return;
  }

  const drillItems = (Array.isArray(m.drills)?m.drills:[]).map(d=>{
    if(typeof d === 'string') return d;
    if(d && typeof d === 'object') return d.title || d.name || '';
    return '';
  }).filter(Boolean);
  const templateItems = (Array.isArray(m.templates)?m.templates:[]).map(t=>{
    if(typeof t === 'string') return { label:t, key:t };
    if(t && typeof t === 'object') return { label: t.name || t.title || 'Template', key: t.type || t.id || (t.name||t.title||'template') };
    return null;
  }).filter(Boolean);

  const links = doctrineLinks();
  const linked = links.filter(l=>String(l.fromMod||'')===m.id || String(l.toMod||'')===m.id);

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
      <div>
        <div class="kicker">${esc(m.domain)}</div>
        <h2 style="margin:6px 0 4px;">${esc(m.title)}</h2>
        <div style="color:var(--text-muted);font-size:0.9rem;">Sources: ${esc(m.sources.join(' • '))}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
          <span class="badge badge-blue">${esc(m.primaryDomain.toUpperCase())}</span>
          ${m.capability ? `<span class="badge">${esc(m.capability.capabilityTitle)}</span>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn" onclick="doctrineOpenModal('${m.id}')">Open Drill</button>
        <button class="btn" onclick="doctrineOpenModelGraph('${m.id}')">Model Graph</button>
        <button class="btn" onclick="doctrineCreateFlashcardPack('${m.id}')">Flashcards</button>
        <button class="btn btn-primary" onclick="doctrineSetActive('${m.id}')">Set Active</button>
      </div>
    </div>

    <div class="hr"></div>

    <div class="grid" style="grid-template-columns: 1fr 1fr; gap:14px;">
      <div class="card">
        <div class="card-title">Models</div>
        <ul class="bullets">${m.models.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <div class="card-title">Drills</div>
        <ul class="bullets">${drillItems.map(x=>`<li>${esc(x)}</li>`).join('') || '<li class="muted">No drills yet.</li>'}</ul>
      </div>
    </div>

    <div class="card" style="margin-top:14px;">
      <div class="card-title">Templates</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;">
        ${templateItems.map(t=>`<button class="chip" onclick="doctrineTemplate('${esc(m.id)}','${esc(t.key)}')">${esc(t.label)}</button>`).join('')}
        ${(!templateItems.length) ? '<div class="empty">No templates for this module yet.</div>' : ''}
      </div>
    </div>

    <div class="card" style="margin-top:14px;">
      <div class="card-title">Links</div>
      <div class="muted" style="margin-top:6px;">Explicit edges between models. These are the backbone of compounding and cross-domain thinking.</div>
      <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn" onclick="doctrineOpenLinkBuilder()">+ Add Link</button>
      </div>
      <div style="margin-top:10px;">
        ${linked.length ? linked.slice(0,8).map(l=>{
          const a = doctrineModelLabel(mods.find(mm=>mm.id===l.fromMod), l.fromModel) || l.fromModel;
          const b = doctrineModelLabel(mods.find(mm=>mm.id===l.toMod), l.toModel) || l.toModel;
          return `<div class="list-item"><div class="list-item-content"><div class="list-item-title">${esc(a)} <span class="muted">${esc(l.rel||'')}</span> ${esc(b)}</div><div class="muted" style="font-size:0.85rem;">${esc(l.note||'')}</div></div></div>`;
        }).join('') : '<div class="empty">No links for this module yet.</div>'}
      </div>
    </div>

    <div class="card" style="margin-top:14px;">
      <div class="card-title">Compounding Graph</div>
      <div style="color:var(--text-muted);font-size:0.9rem;">
        Purpose: show how your doctrine modules connect so you can spot reinforcing concepts, isolated models, and where one idea should trigger another. Node size reflects real applications logged in drills.
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
        <button class="btn" onclick="doctrineOpenModelGraph('${m.id}')">Open Graph</button>
        <button class="btn btn-secondary" onclick="doctrineOpenCompoundingGraph(null)">Open Full Graph</button>
      </div>
    </div>
  `;
}
