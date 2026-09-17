// Split from legacy doctrine.js for V16 maintainability.

// ===== V11: Doctrine domain override persistence =====
const DOCTRINE_DOMAIN_OVERRIDES_KEY = K.doctrineDomainOverrides;
const DOCTRINE_MODEL_OVERRIDES_KEY = K.doctrineModelOverrides;

// ===== V13+ Phoenix: Source Registry + Builder + Links =====
// Tracks coverage of your books/textbooks and stores YOUR abstractions (no copyrighted text).
const DOCTRINE_SOURCES_STATE_KEY = K.doctrineSourcesState;
const DOCTRINE_CUSTOM_MODULES_KEY = K.doctrineCustomModules;
const DOCTRINE_LINKS_KEY = K.doctrineLinks;
const DOCTRINE_VIEW_KEY = K.doctrineView; // modules | sources | builder

function doctrineGetView(){
  const v = String(get(DOCTRINE_VIEW_KEY) || 'modules');
  return ['modules','sources','builder'].includes(v) ? v : 'modules';
}

function doctrineSetView(v){
  if(!['modules','sources','builder'].includes(v)) return;
  set(DOCTRINE_VIEW_KEY, v);
  renderDoctrine();
}

function doctrineBaseSources(){
  return Array.isArray(window.DOCTRINE_SOURCES) ? window.DOCTRINE_SOURCES : [];
}

function doctrineGetSourcesState(){
  const raw = get(DOCTRINE_SOURCES_STATE_KEY);
  return (raw && typeof raw === 'object') ? raw : {};
}

function doctrineSetSourcesState(state){
  set(DOCTRINE_SOURCES_STATE_KEY, state || {});
}

function doctrineGetSourceProgress(srcId){
  const base = doctrineBaseSources().find(s => s.id === srcId);
  const st = doctrineGetSourcesState();
  const row = st[srcId] || {};
  const total = Number.isFinite(row.totalUnits) ? row.totalUnits : Number(base?.totalUnits || 0);
  const done  = Number.isFinite(row.completedUnits) ? row.completedUnits : Number(base?.completedUnits || 0);
  return {
    totalUnits: Math.max(0, total),
    completedUnits: Math.max(0, Math.min(done, total || done)),
    notes: row.notes || '',
    pillarOverride: row.pillarOverride || ''
  };
}

function doctrineUpdateSourceProgress(srcId, patch){
  if(!srcId) return;
  const st = doctrineGetSourcesState();
  st[srcId] = { ...(st[srcId]||{}), ...(patch||{}) };
  doctrineSetSourcesState(st);
}

function doctrineCustomModules(){
  const raw = get(DOCTRINE_CUSTOM_MODULES_KEY);
  return Array.isArray(raw) ? raw : [];
}

function doctrineSaveCustomModules(mods){
  set(DOCTRINE_CUSTOM_MODULES_KEY, Array.isArray(mods) ? mods : []);
}

function doctrineAllModules(){
  const base = doctrineMods();
  const ext = doctrineCustomModules();
  // ensure no id collisions: custom overrides base if same id
  const map = {};
  base.forEach(m => map[m.id] = m);
  ext.forEach(m => map[m.id] = { ...map[m.id], ...m });
  return Object.values(map).map(x => { const enriched = {...x, primaryDomain: doctrineResolvePrimaryDomain(x)}; if (window.CAPABILITY_MAP && typeof window.CAPABILITY_MAP.resolveModule === 'function') enriched.capability = window.CAPABILITY_MAP.resolveModule(enriched); return enriched; });
}

function doctrineLinks(){
  const raw = get(DOCTRINE_LINKS_KEY);
  return Array.isArray(raw) ? raw : [];
}

function doctrineSaveLinks(list){
  set(DOCTRINE_LINKS_KEY, Array.isArray(list) ? list : []);
}

function doctrineNormalizeSourceLabel(value){
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function doctrineModuleSourceIds(mod, sources){
  const explicit = Array.isArray(mod?.sourceIds) ? mod.sourceIds.filter(Boolean) : [];
  if(explicit.length) return explicit;
  const labels = Array.isArray(mod?.sources) ? mod.sources.map(doctrineNormalizeSourceLabel) : [];
  return (sources || []).filter(source => {
    const title = doctrineNormalizeSourceLabel(source.title);
    return labels.some(label => label && title && (label.includes(title) || title.includes(label)));
  }).map(source => source.id);
}

// Active session context (Operator → Focus → Doctrine)

function doctrineRenderSourcesView(){
  const host = document.getElementById('doctrineView');
  if(!host) return;
  const sources = doctrineBaseSources();
  const mods = doctrineAllModules();
  const st = doctrineGetSourcesState();

  // Derive linkage from explicit sourceIds, with a normalized-title fallback
  // for older doctrine modules that predate the source registry.
  const bySrc = {};
  mods.forEach(m=>{
    doctrineModuleSourceIds(m, sources).forEach(sourceId=>{
      bySrc[sourceId] = bySrc[sourceId] || [];
      bySrc[sourceId].push(m);
    });
  });

  const rows = sources.map(s=>{
    const p = doctrineGetSourceProgress(s.id);
    const linked = bySrc[s.id] || [];
    const pct = p.totalUnits ? Math.round((p.completedUnits/p.totalUnits)*100) : 0;
    return { s, p, linkedCount: linked.length, pct };
  });

  host.innerHTML = `
    <div class="grid doctrine-source-layout">
      <div class="panel">
        <div class="card-title" style="margin-bottom:6px;">Source Registry</div>
        <div class="muted" style="margin-bottom:12px;">Track coverage: each source is decomposed into <b>units</b> (chapters/concepts). You only store abstractions (models/drills/templates) — not copyrighted text.</div>
        <div class="list" id="doctrineSourcesList"></div>
      </div>
      <div class="panel" id="doctrineSourceDetail">
        <div class="empty">Select a source to view or edit coverage.</div>
      </div>
    </div>
  `;

  const listEl = document.getElementById('doctrineSourcesList');
  if(!listEl) return;
  listEl.innerHTML = rows.map(r=>{
    const title = esc(r.s.title);
    const meta = [r.s.type, r.s.author].filter(Boolean).map(esc).join(' • ');
    return `
      <div class="list-item" onclick="doctrineOpenSource('${esc(r.s.id)}')" style="cursor:pointer;">
        <div class="list-item-content">
          <div class="list-item-title">${title}</div>
          <div class="muted" style="font-size:0.85rem;">${meta}</div>
          <div style="margin-top:8px;display:flex;align-items:center;gap:10px;">
            <div class="progress" style="flex:1;">
              <div class="progress-fill" style="width:${r.pct}%;"></div>
            </div>
            <div class="muted" style="min-width:64px;text-align:right;">${r.p.completedUnits}/${r.p.totalUnits}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
          <span class="badge badge-blue">${esc(r.s.pillar || r.s.domain || 'source')}</span>
          <span class="badge">mods: ${r.linkedCount}</span>
        </div>
      </div>
    `;
  }).join('');
}

function doctrineOpenSource(srcId){
  const host = document.getElementById('doctrineSourceDetail');
  if(!host) return;
  const s = doctrineBaseSources().find(x=>x.id===srcId);
  if(!s){ host.innerHTML = '<div class="empty">Source not found.</div>'; return; }

  const p = doctrineGetSourceProgress(srcId);
  const pct = p.totalUnits ? Math.round((p.completedUnits/p.totalUnits)*100) : 0;
  const pillar = (p.pillarOverride || s.pillar || s.pillarDefault || s.domain || '').toLowerCase();

  host.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
      <div>
        <div class="card-title">${esc(s.title)}</div>
        <div class="muted" style="margin-top:4px;">${esc([s.author, s.year ? String(s.year) : null, s.type].filter(Boolean).join(' • '))}</div>
      </div>
      <span class="badge badge-blue">${esc(s.pillar || s.domain || 'source')}</span>
    </div>

    <div style="margin-top:12px;">
      <div class="muted" style="margin-bottom:6px;">Coverage</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="progress" style="flex:1;"><div class="progress-fill" style="width:${pct}%;"></div></div>
        <div class="muted" style="min-width:86px;text-align:right;">${p.completedUnits}/${p.totalUnits}</div>
      </div>
    </div>

    <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div>
        <div class="form-label">Total units</div>
        <input class="form-input" id="srcTotalUnits" value="${esc(String(p.totalUnits||0))}" />
      </div>
      <div>
        <div class="form-label">Completed units</div>
        <input class="form-input" id="srcCompletedUnits" value="${esc(String(p.completedUnits||0))}" />
      </div>
    </div>

    <div style="margin-top:10px;">
      <div class="form-label">Pillar override (optional)</div>
      <select class="form-select" id="srcPillarOverride">
        <option value="">(use default)</option>
        <option value="technical" ${pillar==='technical'?'selected':''}>Technical</option>
        <option value="strategic" ${pillar==='strategic'?'selected':''}>Strategic</option>
        <option value="leadership" ${pillar==='leadership'?'selected':''}>Leadership</option>
      </select>
    </div>

    <div style="margin-top:10px;">
      <div class="form-label">Notes</div>
      <textarea class="form-textarea" id="srcNotes" rows="4" placeholder="What should Doctrine extract from this source? What gaps remain?">${esc(p.notes||'')}</textarea>
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="doctrineSaveSource('${esc(srcId)}')">Save</button>
      <button class="btn" onclick="doctrineAddExtractionUnit('${esc(srcId)}')">+1 Complete</button>
      <button class="btn btn-secondary" onclick="doctrineStartBuilderFromSource('${esc(srcId)}')">Build Module</button>
    </div>
  `;
}

function doctrineSaveSource(srcId){
  const total = parseInt(document.getElementById('srcTotalUnits')?.value||'0',10);
  const done  = parseInt(document.getElementById('srcCompletedUnits')?.value||'0',10);
  const pillarOverride = String(document.getElementById('srcPillarOverride')?.value||'').trim();
  const notes = String(document.getElementById('srcNotes')?.value||'');
  doctrineUpdateSourceProgress(srcId, {
    totalUnits: Number.isFinite(total) ? Math.max(0,total) : 0,
    completedUnits: Number.isFinite(done) ? Math.max(0,done) : 0,
    pillarOverride,
    notes
  });
  toast('Source saved');
  doctrineRenderSourcesView();
  doctrineOpenSource(srcId);
}

function doctrineAddExtractionUnit(srcId){
  const p = doctrineGetSourceProgress(srcId);
  doctrineUpdateSourceProgress(srcId, { completedUnits: Math.min(p.totalUnits||p.completedUnits+1, p.completedUnits+1) });
  doctrineRenderSourcesView();
  doctrineOpenSource(srcId);
}

// ==================== BUILDER VIEW ====================
