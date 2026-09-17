// Split from legacy doctrine.js for V16 maintainability.

let doctrineBuilderSelectedSourceId = '';

function doctrineRenderBuilderView(){
  const host = document.getElementById('doctrineView');
  if(!host) return;
  const sources = doctrineBaseSources();
  const mods = doctrineAllModules();
  const custom = doctrineCustomModules();

  host.innerHTML = `
    <div class="grid" style="grid-template-columns: 420px 1fr; gap:16px;">
      <div class="panel">
        <div class="card-title" style="margin-bottom:6px;">Doctrine Builder</div>
        <div class="muted" style="margin-bottom:12px;">Turn sources into executable modules. You define <b>models</b>, <b>drills</b>, and <b>templates</b>. No copyrighted text is stored.</div>

        <div class="form-label">Start from source</div>
        <select class="form-select" id="builderSourceSelect" onchange="doctrineBuilderSelectSource()">
          <option value="">(select)</option>
          ${sources.map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')}
        </select>

        <div style="margin-top:10px;" id="builderSourceHint" class="muted"></div>

        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="builderNewModuleBtn" type="button" data-diag-action="doctrineOpenModuleBuilder()">+ New Module</button>
          <button class="btn" id="builderLinkModelsBtn" type="button" data-diag-action="doctrineOpenLinkBuilder()">+ Link Models</button>
        </div>

        <div style="margin-top:14px;">
          <div class="muted" style="margin-bottom:8px;">Custom modules (${custom.length})</div>
          <div class="list" style="max-height:360px;overflow:auto;">
            ${custom.length ? custom.map(m=>`
              <div class="list-item" style="cursor:pointer;" onclick="doctrineEditCustomModule('${esc(m.id)}')">
                <div class="list-item-content">
                  <div class="list-item-title">${esc(m.title||m.id)}</div>
                  <div class="muted" style="font-size:0.85rem;">${esc(m.domain||'')} • models:${(m.models||[]).length} drills:${(m.drills||[]).length}</div>
                </div>
                <span class="badge">edit</span>
              </div>
            `).join('') : '<div class="empty">No custom modules yet.</div>'}
          </div>
        </div>
      </div>

      <div class="panel" id="builderWorkspace">
        <div class="empty">Select a source, or create a new module.</div>
      </div>
    </div>
  `;
  doctrineBindBuilderActions();
  if (doctrineBuilderSelectedSourceId && sources.some(source => source.id === doctrineBuilderSelectedSourceId)) {
    const selected = document.getElementById('builderSourceSelect');
    if (selected) {
      selected.value = doctrineBuilderSelectedSourceId;
      doctrineBuilderSelectSource();
    }
  }
}


function doctrineBindBuilderActions(){
  const newBtn = document.getElementById('builderNewModuleBtn');
  const linkBtn = document.getElementById('builderLinkModelsBtn');
  if(newBtn) newBtn.onclick = function(){
    const src = document.getElementById('builderSourceSelect')?.value || '';
    doctrineOpenModuleBuilder(src);
  };
  if(linkBtn) linkBtn.onclick = function(){
    doctrineOpenLinkBuilder();
  };
}

function doctrineBuilderSelectSource(){
  const srcId = document.getElementById('builderSourceSelect')?.value || '';
  doctrineBuilderSelectedSourceId = srcId;
  const hint = document.getElementById('builderSourceHint');
  const workspace = document.getElementById('builderWorkspace');
  if(!hint) return;
  if(!srcId){
    hint.textContent = '';
    if (workspace) workspace.innerHTML = '<div class="empty">Select a source, or create a new module.</div>';
    return;
  }
  const s = doctrineBaseSources().find(x=>x.id===srcId);
  const p = doctrineGetSourceProgress(srcId);
  const linked = doctrineAllModules().filter(m => Array.isArray(m.sources) && m.sources.includes(srcId));
  hint.textContent = `Coverage: ${p.completedUnits}/${p.totalUnits}. Default pillar: ${(p.pillarOverride||s?.pillarDefault||s?.domain||'')}.`;
  if (workspace) {
    workspace.innerHTML = `
      <div class="card-title">Source Workspace</div>
      <div class="muted" style="margin-bottom:10px;">${esc(s?.title || srcId)}</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px;">
        <div class="summary-card"><div class="summary-kicker">Coverage</div><div class="summary-value">${p.completedUnits}/${p.totalUnits}</div></div>
        <div class="summary-card"><div class="summary-kicker">Linked Modules</div><div class="summary-value">${linked.length}</div></div>
        <div class="summary-card"><div class="summary-kicker">Default Pillar</div><div class="summary-value" style="font-size:1rem;">${esc((p.pillarOverride||s?.pillarDefault||s?.domain||'—').toString())}</div></div>
      </div>
      <div class="muted" style="margin-bottom:10px;">Purpose: convert this source into your own executable abstractions — models, drills, and templates.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <button class="btn btn-primary" id="builderBuildFromSourceBtn" type="button" data-source-id="${esc(srcId)}">Build module from this source</button>
        <button class="btn btn-secondary" id="builderOpenSourceBtn" type="button" data-source-id="${esc(srcId)}">Open source registry entry</button>
      </div>
      <div>
        <div class="card-title" style="font-size:0.95rem;">Existing linked modules</div>
        ${linked.length ? `<div class="list">${linked.map(m => `<div class=\"list-item\" style=\"cursor:pointer;\" onclick=\"doctrineSetView('modules');setTimeout(()=>doctrineRenderModulesView('${m.id}'),0)\"><div class=\"list-item-content\"><div class=\"list-item-title\">${esc(m.title || m.id)}</div><div class=\"muted\" style=\"font-size:0.85rem;\">${esc(m.domain || '')} • ${(m.models||[]).length} models • ${(m.drills||[]).length} drills</div></div></div>`).join('')}</div>` : '<div class="empty">No modules linked to this source yet.</div>'}
      </div>
    `;

    const buildBtn = document.getElementById('builderBuildFromSourceBtn');
    const openBtn = document.getElementById('builderOpenSourceBtn');
    if (buildBtn) buildBtn.onclick = function(){ doctrineBuilderBuildFromSelectedSource(this.getAttribute('data-source-id') || srcId); };
    if (openBtn) openBtn.onclick = function(){ doctrineBuilderOpenSelectedSourceRegistryEntry(this.getAttribute('data-source-id') || srcId); };
  }
}

function doctrineStartBuilderFromSource(srcId){
  doctrineBuilderSelectedSourceId = srcId || '';
  doctrineSetView('builder');
  // after render, set select
  setTimeout(()=>{
    const sel = document.getElementById('builderSourceSelect');
    if(sel){ sel.value = srcId; doctrineBuilderSelectSource(); }
    doctrineOpenModuleBuilder(srcId);
  }, 0);
}

function doctrineOpenModuleBuilder(seedSourceId){
  const modalTitle = document.getElementById('doctrineModalTitle');
  const modalBody = document.getElementById('doctrineModalBody');
  const primaryBtn = document.getElementById('doctrineModalPrimary');
  const secondaryBtn = document.getElementById('doctrineModalSecondary');
  if(!modalTitle || !modalBody || !primaryBtn || !secondaryBtn) return;

  // reset handlers to prevent leakage
  primaryBtn.onclick = null;
  secondaryBtn.onclick = null;

  const srcId = seedSourceId || (document.getElementById('builderSourceSelect')?.value || '');
  const s = doctrineBaseSources().find(x=>x.id===srcId);
  const p = srcId ? doctrineGetSourceProgress(srcId) : null;
  const pillar = (p?.pillarOverride || s?.pillarDefault || s?.domain || '').toLowerCase();

  modalTitle.textContent = 'New Doctrine Module';
  modalBody.innerHTML = `
    <div class="modal-section">
      <div class="form-label">Module ID (unique)</div>
      <input class="form-input" id="dm_id" placeholder="e.g., smr_planning_basics" />
    </div>
    <div class="modal-section" style="margin-top:10px;">
      <div class="form-label">Title</div>
      <input class="form-input" id="dm_title" placeholder="e.g., SMR Planning Basics" />
    </div>
    <div class="modal-section" style="margin-top:10px;">
      <div class="form-label">Domain</div>
      <select class="form-select" id="dm_domain">
        <option value="technical" ${pillar==='technical'?'selected':''}>Technical</option>
        <option value="strategic" ${pillar==='strategic'?'selected':''}>Strategic</option>
        <option value="leadership" ${pillar==='leadership'?'selected':''}>Leadership</option>
      </select>
    </div>
    <div class="modal-section" style="margin-top:10px;">
      <div class="form-label">Source link (optional)</div>
      <input class="form-input" id="dm_source" value="${esc(srcId||'')}" placeholder="source id" />
      <div class="muted" style="margin-top:6px;">Use the Source Registry to track coverage. This links the module to a source for visibility.</div>
    </div>
    <div class="modal-section" style="margin-top:10px;">
      <div class="form-label">Models (one per line)</div>
      <textarea class="form-textarea" id="dm_models" rows="5" placeholder="e.g.,\nCue → Routine → Reward\nImplementation Intention"></textarea>
    </div>
    <div class="modal-section" style="margin-top:10px;">
      <div class="form-label">Drills (one per line)</div>
      <textarea class="form-textarea" id="dm_drills" rows="5" placeholder="e.g.,\nRun a 25-min deep work sprint\nWrite a pre-mortem"></textarea>
    </div>
    <div class="modal-section" style="margin-top:10px;">
      <div class="form-label">Templates (one per line)</div>
      <textarea class="form-textarea" id="dm_templates" rows="4" placeholder="e.g.,\nDecision Journal Entry\nWeekly Review Checklist"></textarea>
    </div>
  `;

  primaryBtn.textContent = 'Create Module';
  secondaryBtn.textContent = 'Cancel';
  secondaryBtn.onclick = function(){ closeModal('doctrineModal'); };
  primaryBtn.onclick = function(){
    const id = String(document.getElementById('dm_id')?.value||'').trim();
    const title = String(document.getElementById('dm_title')?.value||'').trim();
    const domain = String(document.getElementById('dm_domain')?.value||'').trim();
    const src = String(document.getElementById('dm_source')?.value||'').trim();
    if(!id || !title){ toast('Module ID + Title required'); return; }
    const models = String(document.getElementById('dm_models')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);
    const drills = String(document.getElementById('dm_drills')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean).map(t=>({ title:t, steps:[], defaultDepth:2 }));
    const templates = String(document.getElementById('dm_templates')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean).map(t=>({ title:t, fields:[] }));

    const custom = doctrineCustomModules();
    if(custom.some(m=>m.id===id)) { toast('Module ID already exists'); return; }
    custom.push({
      id,
      title,
      domain,
      sources: src ? [src] : [],
      models,
      drills,
      templates
    });
    doctrineSaveCustomModules(custom);
    toast('Module created');
    closeModal('doctrineModal');
    doctrineRenderBuilderView();
    // keep coverage moving
    if(src){ doctrineAddExtractionUnit(src); }
  };

  openModal('doctrineModal');
}

function doctrineEditCustomModule(id){
  const custom = doctrineCustomModules();
  const m = custom.find(x=>x.id===id);
  const ws = document.getElementById('builderWorkspace');
  if(!ws || !m) return;

  ws.innerHTML = `
    <div class="card-title">Edit Module</div>
    <div class="muted" style="margin-bottom:10px;">${esc(m.id)}</div>
    <div class="form-label">Title</div>
    <input class="form-input" id="edit_title" value="${esc(m.title||'')}" />
    <div style="margin-top:10px;" class="form-label">Domain</div>
    <select class="form-select" id="edit_domain">
      <option value="technical" ${(m.domain||'')==='technical'?'selected':''}>Technical</option>
      <option value="strategic" ${(m.domain||'')==='strategic'?'selected':''}>Strategic</option>
      <option value="leadership" ${(m.domain||'')==='leadership'?'selected':''}>Leadership</option>
    </select>
    <div style="margin-top:10px;" class="form-label">Models (one per line)</div>
    <textarea class="form-textarea" id="edit_models" rows="6">${esc((m.models||[]).join('\n'))}</textarea>
    <div style="margin-top:10px;" class="form-label">Sources (comma-separated source ids)</div>
    <input class="form-input" id="edit_sources" value="${esc((m.sources||[]).join(','))}" />
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="doctrineSaveCustomEdits('${esc(m.id)}')">Save</button>
      <button class="btn btn-secondary" onclick="doctrineDeleteCustomModule('${esc(m.id)}')">Delete</button>
      <button class="btn" onclick="doctrineSetView('modules'); setTimeout(()=>{ doctrineRenderModulesView('${esc(m.id)}'); },0);">Open in Modules</button>
    </div>
  `;
}

function doctrineSaveCustomEdits(id){
  const custom = doctrineCustomModules();
  const idx = custom.findIndex(x=>x.id===id);
  if(idx<0) return;
  custom[idx].title = String(document.getElementById('edit_title')?.value||'').trim();
  custom[idx].domain = String(document.getElementById('edit_domain')?.value||'').trim();
  custom[idx].models = String(document.getElementById('edit_models')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);
  custom[idx].sources = String(document.getElementById('edit_sources')?.value||'').split(',').map(x=>x.trim()).filter(Boolean);
  doctrineSaveCustomModules(custom);
  toast('Saved');
  doctrineRenderBuilderView();
  doctrineEditCustomModule(id);
}

function doctrineDeleteCustomModule(id){
  const custom = doctrineCustomModules().filter(x=>x.id!==id);
  doctrineSaveCustomModules(custom);
  toast('Deleted');
  doctrineRenderBuilderView();
}

// ==================== INTERCONNECTION (LINKS) ====================

function doctrineOpenLinkBuilder(){
  const modalTitle = document.getElementById('doctrineModalTitle');
  const modalBody = document.getElementById('doctrineModalBody');
  const primaryBtn = document.getElementById('doctrineModalPrimary');
  const secondaryBtn = document.getElementById('doctrineModalSecondary');
  if(!modalTitle || !modalBody || !primaryBtn || !secondaryBtn) return;
  primaryBtn.onclick = null; secondaryBtn.onclick = null;

  const mods = doctrineAllModules();
  const opt = mods.map(m=>`<option value="${esc(m.id)}">${esc(m.title||m.id)}</option>`).join('');

  modalTitle.textContent = 'Link Doctrine Models';
  modalBody.innerHTML = `
    <div class="muted" style="margin-bottom:10px;">Create explicit edges between models. These power the compounding graph and cross-module navigation.</div>
    <div class="form-label">From module</div>
    <select class="form-select" id="lk_from_mod" onchange="doctrineLinkRefreshModels('from')">${opt}</select>
    <div style="margin-top:10px;" class="form-label">From model</div>
    <select class="form-select" id="lk_from_model"></select>

    <div style="margin-top:10px;" class="form-label">To module</div>
    <select class="form-select" id="lk_to_mod" onchange="doctrineLinkRefreshModels('to')">${opt}</select>
    <div style="margin-top:10px;" class="form-label">To model</div>
    <select class="form-select" id="lk_to_model"></select>

    <div style="margin-top:10px;" class="form-label">Relation</div>
    <select class="form-select" id="lk_rel">
      <option value="supports">supports</option>
      <option value="depends_on">depends on</option>
      <option value="contrasts">contrasts</option>
      <option value="applies_to">applies to</option>
    </select>

    <div style="margin-top:10px;" class="form-label">Note (optional)</div>
    <textarea class="form-textarea" id="lk_note" rows="3" placeholder="Why are these linked?"></textarea>
  `;

  function init(){
    doctrineLinkRefreshModels('from');
    doctrineLinkRefreshModels('to');
  }
  setTimeout(init,0);

  primaryBtn.textContent = 'Save Link';
  secondaryBtn.textContent = 'Cancel';
  secondaryBtn.onclick = function(){ closeModal('doctrineModal'); };
  primaryBtn.onclick = function(){
    const fromMod = document.getElementById('lk_from_mod')?.value;
    const fromModel = document.getElementById('lk_from_model')?.value;
    const toMod = document.getElementById('lk_to_mod')?.value;
    const toModel = document.getElementById('lk_to_model')?.value;
    const rel = document.getElementById('lk_rel')?.value || 'supports';
    const note = document.getElementById('lk_note')?.value || '';
    if(!fromMod || !fromModel || !toMod || !toModel){ toast('Select both models'); return; }
    const links = doctrineLinks();
    links.push({ id: uid(), fromMod, fromModel, toMod, toModel, rel, note, ts: Date.now() });
    doctrineSaveLinks(links);
    toast('Link saved');
    closeModal('doctrineModal');
  };

  openModal('doctrineModal');
}

function doctrineLinkRefreshModels(side){
  const modId = document.getElementById(side==='from' ? 'lk_from_mod' : 'lk_to_mod')?.value;
  const sel = document.getElementById(side==='from' ? 'lk_from_model' : 'lk_to_model');
  if(!sel) return;
  const mod = doctrineAllModules().find(m=>m.id===modId);
  if(!mod){ sel.innerHTML = '<option value="">(none)</option>'; return; }
  const models = Array.isArray(mod.models) ? mod.models : [];
  sel.innerHTML = models.map((x,i)=>`<option value="${esc(mod.id)}::m${i}">${esc(x)}</option>`).join('') || '<option value="">(none)</option>';
}



function doctrineBuilderBuildSelectedSource(srcId){
  const resolved = srcId || document.getElementById('builderSourceSelect')?.value || '';
  if(!resolved){ toast('Choose a source first'); return; }
  doctrineOpenModuleBuilder(resolved);
}

function doctrineBuilderOpenSelectedSource(srcId){
  const resolved = srcId || document.getElementById('builderSourceSelect')?.value || '';
  if(!resolved){ toast('Choose a source first'); return; }
  doctrineSetView('sources');
  setTimeout(function(){
    renderDoctrine();
    setTimeout(function(){
      if(typeof doctrineOpenSource === 'function') doctrineOpenSource(resolved);
      const detail = document.getElementById('doctrineSourceDetail');
      if(detail && detail.scrollIntoView) detail.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 0);
  }, 0);
}


window.doctrineRenderBuilderView = doctrineRenderBuilderView;
window.doctrineBuilderSelectSource = doctrineBuilderSelectSource;
window.doctrineStartBuilderFromSource = doctrineStartBuilderFromSource;
window.doctrineOpenModuleBuilder = doctrineOpenModuleBuilder;
window.doctrineEditCustomModule = doctrineEditCustomModule;
window.doctrineSaveCustomEdits = doctrineSaveCustomEdits;
window.doctrineDeleteCustomModule = doctrineDeleteCustomModule;
window.doctrineOpenLinkBuilder = doctrineOpenLinkBuilder;
window.doctrineLinkRefreshModels = doctrineLinkRefreshModels;
window.doctrineBuilderBuildSelectedSource = doctrineBuilderBuildSelectedSource;
window.doctrineBuilderOpenSelectedSource = doctrineBuilderOpenSelectedSource;


function doctrineBuilderBuildFromSelectedSource(srcId){
  return doctrineBuilderBuildSelectedSource(srcId);
}

function doctrineBuilderOpenSelectedSourceRegistryEntry(srcId){
  return doctrineBuilderOpenSelectedSource(srcId);
}

window.doctrineBuilderBuildFromSelectedSource = doctrineBuilderBuildFromSelectedSource;
window.doctrineBuilderOpenSelectedSourceRegistryEntry = doctrineBuilderOpenSelectedSourceRegistryEntry;
