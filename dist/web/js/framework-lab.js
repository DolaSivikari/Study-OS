// ==================== FRAMEWORK LAB (Systems Strategy Laboratory) ====================
// Private, offline-first. Graph-ready schema: variables (nodes), relationships (edges), frameworks (graphs), scenarios (snapshots).

const FRAMEWORK_LAB_STORAGE_KEY = K.frameworkLab;
const FRAMEWORK_LAB_SCHEMA_VERSION = 1;

let frameworkLabUI = {
  selectedFrameworkId: null,
  activeTab: 'overview',
  search: '',
  scenarioEditor: {
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    scenarioId: null
  }
};

function nowTs() {
  return Date.now();
}

function flGenerateId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Math.random().toString(36).slice(2, 6)}`;
}

function flDefaultState() {
  return {
    version: FRAMEWORK_LAB_SCHEMA_VERSION,
    variables: {},
    relationships: {},
    frameworks: {},
    scenarios: {}
  };
}

function loadFrameworkLabState() {
  try {
    const parsed = get(FRAMEWORK_LAB_STORAGE_KEY);
    if (!parsed) return flDefaultState();
    if (!parsed || typeof parsed !== 'object') return flDefaultState();
    if (!parsed.version || parsed.version !== FRAMEWORK_LAB_SCHEMA_VERSION) {
      // Minimal forward-compat: keep what we can.
      return {
        ...flDefaultState(),
        ...parsed,
        version: FRAMEWORK_LAB_SCHEMA_VERSION
      };
    }
    return {
      ...flDefaultState(),
      ...parsed
    };
  } catch (e) {
    console.warn('Framework Lab state failed to load:', e);
    return flDefaultState();
  }
}

function saveFrameworkLabState(state) {
  try {
    set(FRAMEWORK_LAB_STORAGE_KEY, state);
  } catch (e) {
    console.warn('Framework Lab state failed to save:', e);
  }
}

function flUpsertFramework(state, fw) {
  const ts = nowTs();
  const exists = state.frameworks[fw.id];
  state.frameworks[fw.id] = {
    ...exists,
    ...fw,
    updatedAt: ts,
    createdAt: exists?.createdAt || ts
  };
}

function flComputeDegree(variableId, rels) {
  let degree = 0;
  rels.forEach(r => {
    if (r.fromVarId === variableId) degree++;
    if (r.toVarId === variableId) degree++;
  });
  return degree;
}

function renderFrameworkLab() {
  const page = document.getElementById('strategy');
  if (!page) return;

  const root = document.getElementById('frameworkLabRoot');
  if (!root) return;

  const state = loadFrameworkLabState();

  // Ensure there is a selected framework if any exist.
  const frameworkIds = Object.keys(state.frameworks);
  if (!frameworkLabUI.selectedFrameworkId || !state.frameworks[frameworkLabUI.selectedFrameworkId]) {
    frameworkLabUI.selectedFrameworkId = frameworkIds.length ? frameworkIds.sort((a, b) => (state.frameworks[b].updatedAt || 0) - (state.frameworks[a].updatedAt || 0))[0] : null;
  }

  // Build static shell once, then only update content.
  root.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;">
      <div>
        <h2 style="display:flex;align-items:center;gap:10px;"><span>🧩</span> Framework Lab</h2>
        <p>Systems + strategy models. Graph-ready. Private. Iterative.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <span class="badge" title="Local-only storage">OFFLINE</span>
        <span class="badge badge-warn" title="Schema version">v${FRAMEWORK_LAB_SCHEMA_VERSION}</span>
      </div>
    </div>
  `;
  root.appendChild(header);

  const shell = document.createElement('div');
  shell.className = 'fl-shell';
  root.appendChild(shell);

  // Left: Index
  const left = document.createElement('div');
  left.className = 'fl-panel';
  shell.appendChild(left);

  const leftCard = document.createElement('div');
  leftCard.className = 'card';
  leftCard.style.padding = '14px';
  left.appendChild(leftCard);

  const idxHeader = document.createElement('div');
  idxHeader.style.display = 'flex';
  idxHeader.style.justifyContent = 'space-between';
  idxHeader.style.alignItems = 'center';
  idxHeader.style.marginBottom = '10px';
  idxHeader.innerHTML = `<span style="font-weight:700;">Framework Index</span>`;
  leftCard.appendChild(idxHeader);

  const searchRow = document.createElement('div');
  searchRow.style.display = 'flex';
  searchRow.style.gap = '8px';
  searchRow.style.marginBottom = '10px';
  leftCard.appendChild(searchRow);

  const search = document.createElement('input');
  search.className = 'form-input';
  search.id = 'flFrameworkSearch';
  search.name = 'flFrameworkSearch';
  search.setAttribute('aria-label', 'Search frameworks');
  search.placeholder = 'Search frameworks…';
  search.value = frameworkLabUI.search;
  search.addEventListener('input', () => {
    frameworkLabUI.search = search.value;
    renderFrameworkLab();
  });
  searchRow.appendChild(search);

  const createBtn = document.createElement('button');
  createBtn.className = 'btn btn-primary btn-sm';
  createBtn.textContent = '＋ New';
  createBtn.setAttribute('onclick', 'frameworkCreateNew()');
  createBtn.setAttribute('data-diag-action', 'frameworkCreateNew()');
  searchRow.appendChild(createBtn);

  const list = document.createElement('div');
  list.className = 'fl-list';
  leftCard.appendChild(list);

  const frameworks = Object.values(state.frameworks)
    .filter(fw => (fw.name || '').toLowerCase().includes((frameworkLabUI.search || '').toLowerCase()))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (!frameworks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML = 'No frameworks yet. Create your first or load a starter template.';
    list.appendChild(empty);

    const starterWrap = document.createElement('div');
    starterWrap.style.display = 'grid';
    starterWrap.style.gap = '8px';
    starterWrap.style.marginTop = '10px';
    [
      { key:'smr', label:'Starter: SMR Program Map' },
      { key:'decision', label:'Starter: Decision Quality Loop' },
      { key:'stakeholder', label:'Starter: Stakeholder Influence Map' }
    ].forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = t.label;
      btn.setAttribute('onclick', `frameworkCreateStarter('${t.key}')`);
      btn.setAttribute('data-diag-action', `frameworkCreateStarter('${t.key}')`);
      starterWrap.appendChild(btn);
    });
    list.appendChild(starterWrap);
  } else {
    frameworks.forEach(fw => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'fl-item' + (fw.id === frameworkLabUI.selectedFrameworkId ? ' active' : '');
      studyosBindClick(item, () => {
        frameworkLabUI.selectedFrameworkId = fw.id;
        frameworkLabUI.activeTab = 'overview';
        renderFrameworkLab();
      });

      const title = document.createElement('div');
      title.className = 'fl-item-title';
      title.textContent = fw.name || '(untitled)';
      item.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'fl-item-meta';
      const dt = new Date(fw.updatedAt || fw.createdAt || nowTs());
      meta.textContent = `${fw.versionLabel || ''} • ${dt.toLocaleDateString()}`;
      item.appendChild(meta);

      list.appendChild(item);
    });
  }

  // Right: Workspace
  const right = document.createElement('div');
  right.className = 'fl-panel';
  shell.appendChild(right);

  const workspace = document.createElement('div');
  workspace.className = 'card';
  workspace.style.padding = '14px';
  right.appendChild(workspace);

  if (!frameworkLabUI.selectedFrameworkId || !state.frameworks[frameworkLabUI.selectedFrameworkId]) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML = '<div style="font-size:1.4rem;margin-bottom:8px;">🧩</div><div>Create a framework to begin.</div>';
    workspace.appendChild(empty);
    return;
  }

  const fw = state.frameworks[frameworkLabUI.selectedFrameworkId];

  // Workspace header
  const wHeader = document.createElement('div');
  wHeader.style.display = 'flex';
  wHeader.style.justifyContent = 'space-between';
  wHeader.style.alignItems = 'center';
  wHeader.style.gap = '10px';
  wHeader.style.flexWrap = 'wrap';
  workspace.appendChild(wHeader);

  const wTitle = document.createElement('div');
  wTitle.innerHTML = `<div style="font-weight:800;font-size:1.05rem;">${esc(fw.name || 'Framework')}</div><div style="font-size:0.75rem;color:var(--text-muted);">Structured model • variables + relationships + scenarios</div>`;
  wHeader.appendChild(wTitle);

  const wActions = document.createElement('div');
  wActions.style.display = 'flex';
  wActions.style.gap = '8px';
  wActions.style.flexWrap = 'wrap';
  wHeader.appendChild(wActions);

  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-secondary btn-sm';
  delBtn.textContent = 'Delete';
  studyosBindClick(delBtn, () => {
    if (!confirm('Delete this framework? This cannot be undone.')) return;
    // Keep variables/relationships global (reusable). Remove only framework + its scenarios.
    const id = fw.id;
    delete state.frameworks[id];
    Object.keys(state.scenarios).forEach(scId => {
      if (state.scenarios[scId]?.frameworkId === id) delete state.scenarios[scId];
    });
    saveFrameworkLabState(state);
    frameworkLabUI.selectedFrameworkId = null;
    renderFrameworkLab();
  });
  wActions.appendChild(delBtn);

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'fl-tabs';
  tabs.style.marginTop = '12px';
  workspace.appendChild(tabs);

  const tabIds = [
    { id: 'overview', label: 'Overview' },
    { id: 'variables', label: 'Variables' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'export', label: 'Export/Import' }
  ];
  tabIds.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fl-tab' + (frameworkLabUI.activeTab === t.id ? ' active' : '');
    btn.textContent = t.label;
    studyosBindClick(btn, () => {
      frameworkLabUI.activeTab = t.id;
      renderFrameworkLab();
    });
    tabs.appendChild(btn);
  });

  const content = document.createElement('div');
  content.style.marginTop = '14px';
  workspace.appendChild(content);

  if (frameworkLabUI.activeTab === 'overview') {
    renderFLOverview(content, state, fw);
  } else if (frameworkLabUI.activeTab === 'variables') {
    renderFLVariables(content, state, fw);
  } else if (frameworkLabUI.activeTab === 'relationships') {
    renderFLRelationships(content, state, fw);
  } else if (frameworkLabUI.activeTab === 'scenarios') {
    renderFLScenarios(content, state, fw);
  } else {
    renderFLExport(content, state);
  }

  // V8: recursive explorer refresh
  setTimeout(renderFrameworkExplorerUI, 0);
}

function renderFLOverview(container, state, fw) {
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'fl-grid2';
  container.appendChild(grid);

  const left = document.createElement('div');
  grid.appendChild(left);
  const right = document.createElement('div');
  grid.appendChild(right);

  left.appendChild(flField('Name', fw.name || '', v => {
    fw.name = v;
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
    renderFrameworkLab();
  }));

  left.appendChild(flField('Problem it solves', fw.problemItSolves || '', v => {
    fw.problemItSolves = v;
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
  }, true));

  left.appendChild(flField('Description', fw.description || '', v => {
    fw.description = v;
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
  }, true));

  left.appendChild(flField('Assumptions', fw.assumptions || '', v => {
    fw.assumptions = v;
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
  }, true));

  left.appendChild(flField('Power implications', fw.powerImplications || '', v => {
    fw.powerImplications = v;
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
  }, true));

  left.appendChild(flField('Failure modes', fw.failureModes || '', v => {
    fw.failureModes = v;
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
  }, true));

  // Versioning
  const vCard = document.createElement('div');
  vCard.className = 'card';
  vCard.style.padding = '12px';
  vCard.style.marginTop = '12px';
  vCard.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
    <div><div style="font-weight:700;">Versioning</div><div style="font-size:0.75rem;color:var(--text-muted);">Track framework evolution</div></div>
  </div>`;
  left.appendChild(vCard);

  const vRow = document.createElement('div');
  vRow.style.display = 'flex';
  vRow.style.gap = '8px';
  vRow.style.marginTop = '10px';
  vRow.style.flexWrap = 'wrap';
  vCard.appendChild(vRow);

  const vLabel = document.createElement('input');
  vLabel.className = 'form-input';
  vLabel.id = 'flVersionLabel-' + fw.id;
  vLabel.name = vLabel.id;
  vLabel.setAttribute('aria-label', 'Version label');
  vLabel.placeholder = 'v0.2';
  vLabel.value = fw.versionLabel || 'v0.1';
  vLabel.style.maxWidth = '120px';
  vLabel.addEventListener('change', () => {
    fw.versionLabel = vLabel.value.trim() || fw.versionLabel;
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
    renderFrameworkLab();
  });
  vRow.appendChild(vLabel);

  const vNote = document.createElement('input');
  vNote.className = 'form-input';
  vNote.id = 'flVersionNote-' + fw.id;
  vNote.name = vNote.id;
  vNote.setAttribute('aria-label', 'Change note');
  vNote.placeholder = 'Change note (what changed?)';
  vNote.style.flex = '1';
  vRow.appendChild(vNote);

  const addLog = document.createElement('button');
  addLog.className = 'btn btn-primary btn-sm';
  addLog.textContent = 'Add Log';
  studyosBindClick(addLog, () => {
    const note = vNote.value.trim();
    if (!note) return;
    const label = vLabel.value.trim() || fw.versionLabel || 'v0.1';
    fw.versionLabel = label;
    fw.changeLog = Array.isArray(fw.changeLog) ? fw.changeLog : [];
    fw.changeLog.unshift({ at: nowTs(), label, note });
    vNote.value = '';
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
    renderFrameworkLab();
  });
  vRow.appendChild(addLog);

  const logList = document.createElement('div');
  logList.style.marginTop = '10px';
  vCard.appendChild(logList);
  (fw.changeLog || []).slice(0, 8).forEach(entry => {
    const row = document.createElement('div');
    row.className = 'fl-row';
    const dt = new Date(entry.at || nowTs()).toLocaleDateString();
    row.textContent = `${entry.label || ''} • ${dt} — ${entry.note || ''}`;
    logList.appendChild(row);
  });

  // Map placeholder
  const map = document.createElement('div');
  map.className = 'card';
  map.style.padding = '12px';
  map.innerHTML = `<div style="font-weight:800;display:flex;align-items:center;gap:8px;">
      <span style="color:var(--warning);">▣</span> System Map <span style="font-weight:600;color:var(--text-muted);">(Coming Later)</span>
    </div>
    <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:8px;">This framework is stored as a graph (nodes + edges). A visual causal map can be added later without changing your data.</div>`;
  right.appendChild(map);

  const rels = fw.relationshipIds
    .map(id => state.relationships[id])
    .filter(Boolean);
  const vars = fw.variableIds
    .map(id => state.variables[id])
    .filter(Boolean);

  const stats = document.createElement('div');
  stats.style.marginTop = '10px';
  stats.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
      <div class="fl-stat"><div class="fl-stat-val">${vars.length}</div><div class="fl-stat-lbl">Variables</div></div>
      <div class="fl-stat"><div class="fl-stat-val">${rels.length}</div><div class="fl-stat-lbl">Relationships</div></div>
    </div>
  `;
  right.appendChild(stats);

  const explorer = document.createElement('div');
  explorer.id = 'fwExplorer';
  explorer.style.marginTop = '12px';
  right.appendChild(explorer);

  // Top connected variables
  const degree = {};
  vars.forEach(v => { degree[v.id] = flComputeDegree(v.id, rels); });
  const top = vars
    .slice()
    .sort((a, b) => (degree[b.id] || 0) - (degree[a.id] || 0))
    .slice(0, 3);

  const topCard = document.createElement('div');
  topCard.className = 'card';
  topCard.style.padding = '12px';
  topCard.style.marginTop = '10px';
  topCard.innerHTML = `<div style="font-weight:700;">Most connected variables</div>`;
  right.appendChild(topCard);
  if (!top.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'Add variables + relationships to see structure.';
    topCard.appendChild(e);
  } else {
    top.forEach(v => {
      const row = document.createElement('div');
      row.className = 'fl-row';
      row.textContent = `${v.name || '(unnamed)'} • degree ${degree[v.id] || 0}`;
      topCard.appendChild(row);
    });
  }
}

function renderFLVariables(container, state, fw) {
  container.innerHTML = '';

  const form = document.createElement('div');
  form.className = 'card';
  form.style.padding = '12px';
  form.innerHTML = `<div style="font-weight:800;margin-bottom:8px;">Add Variable</div>`;
  container.appendChild(form);

  const name = flInput('Name');
  const tags = flInput('Tags (comma)', 'systems, strategy, power');
  const def = flTextarea('Definition');
  const indicators = flTextarea('Indicators (one per line)');
  const notes = flTextarea('Notes');

  form.appendChild(name.el);
  form.appendChild(tags.el);
  form.appendChild(def.el);
  form.appendChild(indicators.el);
  form.appendChild(notes.el);

  const add = document.createElement('button');
  add.className = 'btn btn-primary btn-sm';
  add.textContent = 'Add Variable';
  studyosBindClick(add, () => {
    const n = name.input.value.trim();
    if (!n) return;
    const id = flGenerateId('var');
    const ts = nowTs();
    const v = {
      id,
      name: n,
      domainTags: tags.input.value.split(',').map(s => s.trim()).filter(Boolean),
      definition: def.input.value.trim(),
      indicators: indicators.input.value.split('\n').map(s => s.trim()).filter(Boolean),
      notes: notes.input.value.trim(),
      createdAt: ts,
      updatedAt: ts
    };
    state.variables[id] = v;
    if (!fw.variableIds.includes(id)) fw.variableIds.push(id);
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
    renderFrameworkLab();
  });
  form.appendChild(add);

  const list = document.createElement('div');
  list.style.marginTop = '12px';
  container.appendChild(list);

  const vars = (fw.variableIds || []).map(id => state.variables[id]).filter(Boolean);
  if (!vars.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'No variables yet.';
    list.appendChild(e);
    return;
  }

  vars.forEach(v => {
    const row = document.createElement('div');
    row.className = 'card';
    row.style.padding = '12px';
    row.style.marginBottom = '10px';
    list.appendChild(row);

    const top = document.createElement('div');
    top.style.display = 'flex';
    top.style.justifyContent = 'space-between';
    top.style.gap = '10px';
    top.style.alignItems = 'center';
    row.appendChild(top);

    const title = document.createElement('div');
    title.innerHTML = `<div style="font-weight:800;">${esc(v.name || '(unnamed)')}</div><div style="font-size:0.75rem;color:var(--text-muted);">${(v.domainTags || []).join(', ')}</div>`;
    top.appendChild(title);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    top.appendChild(actions);

    const edit = document.createElement('button');
    edit.className = 'btn btn-secondary btn-sm';
    edit.textContent = 'Edit';
    studyosBindClick(edit, () => {
      flOpenVariableEditor(state, fw, v.id);
    });
    actions.appendChild(edit);

    const del = document.createElement('button');
    del.className = 'btn btn-secondary btn-sm';
    del.textContent = 'Remove';
    studyosBindClick(del, () => {
      if (!confirm('Remove variable from this framework? Relationships referencing it will also be removed from this framework.')) return;

      // Remove relationships in this framework referencing the variable
      const toRemoveRelIds = (fw.relationshipIds || []).filter(rid => {
        const r = state.relationships[rid];
        return r && (r.fromVarId === v.id || r.toVarId === v.id);
      });
      fw.relationshipIds = (fw.relationshipIds || []).filter(rid => !toRemoveRelIds.includes(rid));
      fw.variableIds = (fw.variableIds || []).filter(vid => vid !== v.id);

      flUpsertFramework(state, fw);
      saveFrameworkLabState(state);
      renderFrameworkLab();
    });
    actions.appendChild(del);
  });
}

function flOpenVariableEditor(state, fw, varId) {
  const v = state.variables[varId];
  if (!v) return;
  const modal = document.getElementById('flVarEditModal');
  if (!modal) return;
  document.getElementById('flVarEditName').value = v.name || '';
  document.getElementById('flVarEditTags').value = (v.domainTags || []).join(', ');
  document.getElementById('flVarEditDef').value = v.definition || '';
  document.getElementById('flVarEditIndicators').value = (v.indicators || []).join('\n');
  document.getElementById('flVarEditNotes').value = v.notes || '';
  window._flVarEditCtx = { state, fw, varId };
  openModal('flVarEditModal');
}

function flSaveVariableEdit() {
  const ctx = window._flVarEditCtx;
  if (!ctx) return;
  const v = ctx.state.variables[ctx.varId];
  if (!v) return;
  v.name = document.getElementById('flVarEditName').value.trim() || v.name;
  v.domainTags = document.getElementById('flVarEditTags').value.split(',').map(s => s.trim()).filter(Boolean);
  v.definition = document.getElementById('flVarEditDef').value.trim();
  v.indicators = document.getElementById('flVarEditIndicators').value.split('\n').map(s => s.trim()).filter(Boolean);
  v.notes = document.getElementById('flVarEditNotes').value.trim();
  v.updatedAt = nowTs();
  saveFrameworkLabState(ctx.state);
  closeModal('flVarEditModal');
  renderFrameworkLab();
}

function renderFLRelationships(container, state, fw) {
  container.innerHTML = '';

  const vars = (fw.variableIds || []).map(id => state.variables[id]).filter(Boolean);
  if (vars.length < 2) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'Add at least 2 variables to create relationships.';
    container.appendChild(e);
    return;
  }

  const form = document.createElement('div');
  form.className = 'card';
  form.style.padding = '12px';
  form.innerHTML = `<div style="font-weight:800;margin-bottom:8px;">Add Relationship</div>`;
  container.appendChild(form);

  const from = document.createElement('select');
  from.className = 'form-select';
  from.id = 'flRelFrom';
  from.name = 'flRelFrom';
  from.setAttribute('aria-label', 'From variable');
  vars.forEach(v => {
    const o = document.createElement('option');
    o.value = v.id;
    o.textContent = v.name;
    from.appendChild(o);
  });
  const to = document.createElement('select');
  to.className = 'form-select';
  to.id = 'flRelTo';
  to.name = 'flRelTo';
  to.setAttribute('aria-label', 'To variable');
  vars.forEach(v => {
    const o = document.createElement('option');
    o.value = v.id;
    o.textContent = v.name;
    to.appendChild(o);
  });

  const polarity = document.createElement('select');
  polarity.className = 'form-select';
  polarity.id = 'flRelPolarity';
  polarity.name = 'flRelPolarity';
  polarity.setAttribute('aria-label', 'Polarity');
  ['positive', 'negative'].forEach(p => {
    const o = document.createElement('option');
    o.value = p;
    o.textContent = p;
    polarity.appendChild(o);
  });

  const loopType = document.createElement('select');
  loopType.className = 'form-select';
  loopType.id = 'flRelLoopType';
  loopType.name = 'flRelLoopType';
  loopType.setAttribute('aria-label', 'Loop type');
  ['unknown', 'reinforcing', 'balancing'].forEach(t => {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    loopType.appendChild(o);
  });

  const strength = document.createElement('input');
  strength.type = 'range';
  strength.min = '1';
  strength.max = '5';
  strength.value = '3';
  strength.className = 'fl-range';
  strength.id = 'flRelStrength';
  strength.name = 'flRelStrength';
  strength.setAttribute('aria-label', 'Relationship strength');

  const delay = document.createElement('select');
  delay.className = 'form-select';
  delay.id = 'flRelDelay';
  delay.name = 'flRelDelay';
  delay.setAttribute('aria-label', 'Delay');
  ['0', '1', '2', '3'].forEach(d => {
    const o = document.createElement('option');
    o.value = d;
    o.textContent = d;
    delay.appendChild(o);
  });

  const notes = document.createElement('textarea');
  notes.className = 'form-textarea';
  notes.id = 'flRelNotes';
  notes.name = 'flRelNotes';
  notes.setAttribute('aria-label', 'Context notes');
  notes.placeholder = 'Context notes…';
  notes.style.minHeight = '70px';

  const row1 = document.createElement('div');
  row1.className = 'fl-form-row';
  row1.appendChild(flLabeled('From', from));
  row1.appendChild(flLabeled('To', to));
  form.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'fl-form-row';
  row2.appendChild(flLabeled('Polarity', polarity));
  row2.appendChild(flLabeled('Loop', loopType));
  row2.appendChild(flLabeled('Strength', strength));
  row2.appendChild(flLabeled('Delay', delay));
  form.appendChild(row2);

  form.appendChild(flLabeled('Notes', notes));

  const add = document.createElement('button');
  add.className = 'btn btn-primary btn-sm';
  add.textContent = 'Add Relationship';
  studyosBindClick(add, () => {
    if (from.value === to.value) {
      alert('From and To cannot be the same variable.');
      return;
    }
    const id = flGenerateId('rel');
    const ts = nowTs();
    const rel = {
      id,
      fromVarId: from.value,
      toVarId: to.value,
      polarity: polarity.value,
      loopType: loopType.value,
      strength: Number(strength.value),
      delay: Number(delay.value),
      contextNotes: notes.value.trim(),
      createdAt: ts,
      updatedAt: ts
    };
    state.relationships[id] = rel;
    if (!fw.relationshipIds.includes(id)) fw.relationshipIds.push(id);
    flUpsertFramework(state, fw);
    saveFrameworkLabState(state);
    renderFrameworkLab();
  });
  form.appendChild(add);

  const list = document.createElement('div');
  list.style.marginTop = '12px';
  container.appendChild(list);

  const rels = (fw.relationshipIds || []).map(id => state.relationships[id]).filter(Boolean);
  if (!rels.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'No relationships yet.';
    list.appendChild(e);
    return;
  }

  rels.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '12px';
    card.style.marginBottom = '10px';
    list.appendChild(card);

    const fromName = state.variables[r.fromVarId]?.name || r.fromVarId;
    const toName = state.variables[r.toVarId]?.name || r.toVarId;
    const line = document.createElement('div');
    line.style.fontWeight = '800';
    line.textContent = `${fromName} → ${toName}`;
    card.appendChild(line);

    const meta = document.createElement('div');
    meta.style.fontSize = '0.8rem';
    meta.style.color = 'var(--text-muted)';
    meta.textContent = `${r.polarity} • ${r.loopType} • strength ${r.strength} • delay ${r.delay}`;
    card.appendChild(meta);

    if (r.contextNotes) {
      const n = document.createElement('div');
      n.style.marginTop = '8px';
      n.style.fontSize = '0.9rem';
      n.style.color = 'var(--text-secondary)';
      n.textContent = r.contextNotes;
      card.appendChild(n);
    }

    const actions = document.createElement('div');
    actions.style.marginTop = '10px';
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    card.appendChild(actions);

    const del = document.createElement('button');
    del.className = 'btn btn-secondary btn-sm';
    del.textContent = 'Delete';
    studyosBindClick(del, () => {
      if (!confirm('Delete relationship from this framework?')) return;
      fw.relationshipIds = (fw.relationshipIds || []).filter(id => id !== r.id);
      flUpsertFramework(state, fw);
      saveFrameworkLabState(state);
      renderFrameworkLab();
    });
    actions.appendChild(del);
  });
}

function renderFLScenarios(container, state, fw) {
  container.innerHTML = '';

  const topRow = document.createElement('div');
  topRow.style.display = 'flex';
  topRow.style.justifyContent = 'space-between';
  topRow.style.alignItems = 'center';
  topRow.style.gap = '10px';
  topRow.style.flexWrap = 'wrap';
  container.appendChild(topRow);

  const title = document.createElement('div');
  title.innerHTML = `<div style="font-weight:800;">Scenario Log</div><div style="font-size:0.8rem;color:var(--text-muted);">Snapshots of variable states + calibration</div>`;
  topRow.appendChild(title);

  const create = document.createElement('button');
  create.className = 'btn btn-primary btn-sm';
  create.textContent = '＋ New Scenario';
  studyosBindClick(create, () => {
    flOpenScenarioEditor({ state, fw, mode: 'create' });
    renderFrameworkLab();
  });
  topRow.appendChild(create);

  // Scenario editor (inline form)
  if (frameworkLabUI.scenarioEditor.isOpen) {
    const editorWrap = document.createElement('div');
    editorWrap.style.marginTop = '12px';
    container.appendChild(editorWrap);
    renderFLScenarioEditor(editorWrap, state, fw);
  }

  const scenarios = Object.values(state.scenarios)
    .filter(sc => sc.frameworkId === fw.id)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const list = document.createElement('div');
  list.style.marginTop = '12px';
  container.appendChild(list);

  if (!scenarios.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'No scenarios yet.';
    list.appendChild(e);
    return;
  }

  scenarios.forEach(sc => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '12px';
    card.style.marginBottom = '10px';
    list.appendChild(card);

    const dt = new Date(sc.createdAt || nowTs()).toLocaleDateString();
    const head = document.createElement('div');
    head.style.display = 'flex';
    head.style.justifyContent = 'space-between';
    head.style.alignItems = 'center';
    head.style.gap = '10px';
    card.appendChild(head);

    const h = document.createElement('div');
    h.innerHTML = `<div style="font-weight:800;">${esc(sc.title || 'Scenario')}</div><div style="font-size:0.8rem;color:var(--text-muted);">${dt} • calibration ${sc.calibrationScore || '-'}</div>`;
    head.appendChild(h);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    head.appendChild(actions);

    const del = document.createElement('button');
    del.className = 'btn btn-secondary btn-sm';
    del.textContent = 'Delete';
    studyosBindClick(del, () => {
      if (!confirm('Delete this scenario?')) return;
      delete state.scenarios[sc.id];
      saveFrameworkLabState(state);
      renderFrameworkLab();
    });
    actions.appendChild(del);

    const edit = document.createElement('button');
    edit.className = 'btn btn-primary btn-sm';
    edit.textContent = 'Edit';
    studyosBindClick(edit, () => {
      flOpenScenarioEditor({ state, fw, mode: 'edit', scenarioId: sc.id });
      renderFrameworkLab();
    });
    actions.appendChild(edit);

    const body = document.createElement('div');
    body.style.marginTop = '10px';
    body.style.fontSize = '0.9rem';
    body.style.color = 'var(--text-secondary)';
    body.textContent = sc.situation || '';
    card.appendChild(body);

    // Quick variable state preview
    const vars = (fw.variableIds || []).map(id => state.variables[id]).filter(Boolean);
    if (vars.length) {
      const preview = document.createElement('div');
      preview.style.marginTop = '10px';
      preview.style.display = 'grid';
      preview.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))';
      preview.style.gap = '8px';
      card.appendChild(preview);
      vars.slice(0, 6).forEach(v => {
        const vs = (sc.variableStates || {})[v.id];
        const pill = document.createElement('div');
        pill.className = 'fl-pill';
        pill.textContent = `${v.name}: ${vs?.level ?? '-'}`;
        preview.appendChild(pill);
      });
    }
  });
}

function flOpenScenarioEditor({ state, fw, mode, scenarioId }) {
  const vars = (fw.variableIds || []).map(id => state.variables[id]).filter(Boolean);
  if (!vars.length) {
    alert('Add variables to the framework first.');
    return;
  }
  frameworkLabUI.scenarioEditor.isOpen = true;
  frameworkLabUI.scenarioEditor.mode = mode || 'create';
  frameworkLabUI.scenarioEditor.scenarioId = scenarioId || null;
}

function flCloseScenarioEditor() {
  frameworkLabUI.scenarioEditor.isOpen = false;
  frameworkLabUI.scenarioEditor.mode = 'create';
  frameworkLabUI.scenarioEditor.scenarioId = null;
}

function renderFLScenarioEditor(container, state, fw) {
  container.innerHTML = '';

  const vars = (fw.variableIds || []).map(id => state.variables[id]).filter(Boolean);
  if (!vars.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'Add variables to the framework first.';
    container.appendChild(e);
    return;
  }

  const mode = frameworkLabUI.scenarioEditor.mode;
  const existing = (mode === 'edit' && frameworkLabUI.scenarioEditor.scenarioId)
    ? state.scenarios[frameworkLabUI.scenarioEditor.scenarioId]
    : null;

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '12px';
  card.style.borderLeft = '3px solid var(--accent)';
  container.appendChild(card);

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';
  header.style.gap = '10px';
  header.style.flexWrap = 'wrap';
  card.appendChild(header);

  const h = document.createElement('div');
  h.innerHTML = `<div style="font-weight:900;">${mode === 'edit' ? 'Edit Scenario' : 'New Scenario'}</div><div style="font-size:0.85rem;color:var(--text-muted);">Capture variable states, predicted dynamics, and calibration.</div>`;
  header.appendChild(h);

  const headerActions = document.createElement('div');
  headerActions.style.display = 'flex';
  headerActions.style.gap = '8px';
  header.appendChild(headerActions);

  const cancel = document.createElement('button');
  cancel.className = 'btn btn-secondary btn-sm';
  cancel.textContent = 'Cancel';
  studyosBindClick(cancel, () => {
    flCloseScenarioEditor();
    renderFrameworkLab();
  });
  headerActions.appendChild(cancel);

  const form = document.createElement('div');
  form.className = 'fl-form';
  form.style.marginTop = '12px';
  card.appendChild(form);

  const grid = document.createElement('div');
  grid.className = 'fl-form-grid';
  form.appendChild(grid);

  const titleWrap = document.createElement('div');
  titleWrap.className = 'fl-field';
  grid.appendChild(titleWrap);
  titleWrap.innerHTML = `<label class="fl-label" for="flScenarioTitle">Title</label>`;
  const titleInput = document.createElement('input');
  titleInput.className = 'form-input';
  titleInput.id = 'flScenarioTitle';
  titleInput.name = 'flScenarioTitle';
  titleInput.placeholder = 'e.g., Subcontractor failure mid-project';
  titleInput.value = existing?.title || '';
  titleWrap.appendChild(titleInput);

  const calWrap = document.createElement('div');
  calWrap.className = 'fl-field';
  grid.appendChild(calWrap);
  calWrap.innerHTML = `<label class="fl-label" for="flScenarioCalibration">Calibration score (1–5)</label>`;
  const calRow = document.createElement('div');
  calRow.style.display = 'flex';
  calRow.style.alignItems = 'center';
  calRow.style.gap = '10px';
  calWrap.appendChild(calRow);
  const cal = document.createElement('input');
  cal.type = 'range';
  cal.min = '1';
  cal.max = '5';
  cal.step = '1';
  cal.value = String(existing?.calibrationScore || 3);
  cal.className = 'fl-range';
  cal.id = 'flScenarioCalibration';
  cal.name = 'flScenarioCalibration';
  calRow.appendChild(cal);
  const calVal = document.createElement('div');
  calVal.className = 'fl-range-val';
  calVal.textContent = cal.value;
  calRow.appendChild(calVal);
  cal.addEventListener('input', () => { calVal.textContent = cal.value; });

  const situationWrap = document.createElement('div');
  situationWrap.className = 'fl-field fl-span-2';
  grid.appendChild(situationWrap);
  situationWrap.innerHTML = `<label class="fl-label" for="flScenarioSituation">Situation / Context</label>`;
  const situation = document.createElement('textarea');
  situation.className = 'form-input';
  situation.id = 'flScenarioSituation';
  situation.name = 'flScenarioSituation';
  situation.rows = 3;
  situation.placeholder = 'Describe the situation clearly.';
  situation.value = existing?.situation || '';
  situationWrap.appendChild(situation);

  const predDynWrap = document.createElement('div');
  predDynWrap.className = 'fl-field fl-span-2';
  grid.appendChild(predDynWrap);
  predDynWrap.innerHTML = `<label class="fl-label" for="flScenarioPredictedDynamics">Predicted dynamics (loops, interactions)</label>`;
  const predictedDynamics = document.createElement('textarea');
  predictedDynamics.className = 'form-input';
  predictedDynamics.id = 'flScenarioPredictedDynamics';
  predictedDynamics.name = 'flScenarioPredictedDynamics';
  predictedDynamics.rows = 3;
  predictedDynamics.placeholder = 'What interactions do you expect? Reinforcing/balancing loops, delays, etc.';
  predictedDynamics.value = existing?.predictedDynamics || '';
  predDynWrap.appendChild(predictedDynamics);

  const predOutWrap = document.createElement('div');
  predOutWrap.className = 'fl-field fl-span-2';
  grid.appendChild(predOutWrap);
  predOutWrap.innerHTML = `<label class="fl-label" for="flScenarioPredictedOutcome">Predicted outcome</label>`;
  const predictedOutcome = document.createElement('textarea');
  predictedOutcome.className = 'form-input';
  predictedOutcome.id = 'flScenarioPredictedOutcome';
  predictedOutcome.name = 'flScenarioPredictedOutcome';
  predictedOutcome.rows = 2;
  predictedOutcome.placeholder = 'What do you think will happen?';
  predictedOutcome.value = existing?.predictedOutcome || '';
  predOutWrap.appendChild(predictedOutcome);

  const actOutWrap = document.createElement('div');
  actOutWrap.className = 'fl-field fl-span-2';
  grid.appendChild(actOutWrap);
  actOutWrap.innerHTML = `<label class="fl-label" for="flScenarioActualOutcome">Actual outcome (optional)</label>`;
  const actualOutcome = document.createElement('textarea');
  actualOutcome.className = 'form-input';
  actualOutcome.id = 'flScenarioActualOutcome';
  actualOutcome.name = 'flScenarioActualOutcome';
  actualOutcome.rows = 2;
  actualOutcome.placeholder = 'Fill after reality unfolds.';
  actualOutcome.value = existing?.actualOutcome || '';
  actOutWrap.appendChild(actualOutcome);

  const deltaWrap = document.createElement('div');
  deltaWrap.className = 'fl-field fl-span-2';
  grid.appendChild(deltaWrap);
  deltaWrap.innerHTML = `<label class="fl-label" for="flScenarioDeltaAnalysis">Delta analysis (optional)</label>`;
  const deltaAnalysis = document.createElement('textarea');
  deltaAnalysis.className = 'form-input';
  deltaAnalysis.id = 'flScenarioDeltaAnalysis';
  deltaAnalysis.name = 'flScenarioDeltaAnalysis';
  deltaAnalysis.rows = 2;
  deltaAnalysis.placeholder = 'Where was your model wrong/right? What variables mattered most?';
  deltaAnalysis.value = existing?.deltaAnalysis || '';
  deltaWrap.appendChild(deltaAnalysis);

  const vsTitle = document.createElement('div');
  vsTitle.style.marginTop = '14px';
  vsTitle.style.fontWeight = '800';
  vsTitle.textContent = 'Variable States (1–5)';
  form.appendChild(vsTitle);

  const vsHelp = document.createElement('div');
  vsHelp.style.fontSize = '0.85rem';
  vsHelp.style.color = 'var(--text-muted)';
  vsHelp.style.marginTop = '4px';
  vsHelp.textContent = 'Set the current state for each variable in this framework.';
  form.appendChild(vsHelp);

  const vsList = document.createElement('div');
  vsList.className = 'fl-var-list';
  vsList.style.marginTop = '10px';
  form.appendChild(vsList);

  const varControls = {};
  vars.forEach(v => {
    const row = document.createElement('div');
    row.className = 'fl-var-row';
    vsList.appendChild(row);

    const name = document.createElement('div');
    name.className = 'fl-var-name';
    name.textContent = v.name;
    row.appendChild(name);

    const rangeWrap = document.createElement('div');
    rangeWrap.className = 'fl-var-range';
    row.appendChild(rangeWrap);

    const rng = document.createElement('input');
    rng.type = 'range';
    rng.min = '1';
    rng.max = '5';
    rng.step = '1';
    const existingLevel = (existing?.variableStates || {})[v.id]?.level;
    rng.value = String(existingLevel || 3);
    rng.className = 'fl-range';
    rng.id = 'fl-var-level-' + v.id;
    rng.name = rng.id;
    rng.setAttribute('aria-label', v.name + ' level');
    rangeWrap.appendChild(rng);

    const val = document.createElement('div');
    val.className = 'fl-range-val';
    val.textContent = rng.value;
    rangeWrap.appendChild(val);
    rng.addEventListener('input', () => { val.textContent = rng.value; });

    const notes = document.createElement('input');
    notes.className = 'form-input';
    notes.id = 'fl-var-notes-' + v.id;
    notes.name = notes.id;
    notes.setAttribute('aria-label', v.name + ' notes');
    notes.placeholder = 'Notes (optional)';
    notes.value = (existing?.variableStates || {})[v.id]?.notes || '';
    row.appendChild(notes);

    varControls[v.id] = { rng, notes };
  });

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '14px';
  actions.style.flexWrap = 'wrap';
  form.appendChild(actions);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary btn-sm';
  saveBtn.textContent = mode === 'edit' ? 'Save Changes' : 'Create Scenario';
  actions.appendChild(saveBtn);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-secondary btn-sm';
  closeBtn.textContent = 'Close Editor';
  studyosBindClick(closeBtn, () => {
    flCloseScenarioEditor();
    renderFrameworkLab();
  });
  actions.appendChild(closeBtn);

  studyosBindClick(saveBtn, () => {
    const t = (titleInput.value || '').trim();
    if (!t) {
      alert('Please enter a scenario title.');
      titleInput.focus();
      return;
    }

    const variableStates = {};
    Object.keys(varControls).forEach(varId => {
      const level = Math.max(1, Math.min(5, Number(varControls[varId].rng.value) || 3));
      const notesVal = (varControls[varId].notes.value || '').trim();
      variableStates[varId] = { level, notes: notesVal };
    });

    const ts = nowTs();
    const id = (mode === 'edit' && existing?.id) ? existing.id : flGenerateId('sc');
    const createdAt = (mode === 'edit' && existing?.createdAt) ? existing.createdAt : ts;

    state.scenarios[id] = {
      id,
      frameworkId: fw.id,
      title: t,
      situation: (situation.value || '').trim(),
      variableStates,
      predictedDynamics: (predictedDynamics.value || '').trim(),
      predictedOutcome: (predictedOutcome.value || '').trim(),
      actualOutcome: (actualOutcome.value || '').trim(),
      deltaAnalysis: (deltaAnalysis.value || '').trim(),
      calibrationScore: Math.max(1, Math.min(5, Number(cal.value) || 3)),
      createdAt,
      updatedAt: ts
    };

    saveFrameworkLabState(state);
    if (mode === 'create') flCloseScenarioEditor();
    renderFrameworkLab();
  });
}

function renderFLExport(container, state) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '12px';
  container.appendChild(card);

  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.flexWrap = 'wrap';
  row.style.alignItems = 'center';
  card.appendChild(row);

  const exp = document.createElement('button');
  exp.className = 'btn btn-primary btn-sm';
  exp.textContent = 'Export JSON';
  studyosBindClick(exp, () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyos-framework-lab-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
  row.appendChild(exp);

  const reset = document.createElement('button');
  reset.className = 'btn btn-secondary btn-sm';
  reset.textContent = 'Reset Framework Lab';
  studyosBindClick(reset, () => {
    if (!confirm('Reset Framework Lab data? This cannot be undone.')) return;
    saveFrameworkLabState(flDefaultState());
    frameworkLabUI.selectedFrameworkId = null;
    frameworkLabUI.activeTab = 'overview';
    renderFrameworkLab();
  });
  row.appendChild(reset);

  const hr = document.createElement('div');
  hr.style.height = '1px';
  hr.style.background = 'var(--border)';
  hr.style.margin = '12px 0';
  card.appendChild(hr);

  const importTitle = document.createElement('div');
  importTitle.style.fontWeight = '800';
  importTitle.textContent = 'Import JSON';
  card.appendChild(importTitle);

  const ta = document.createElement('textarea');
  ta.className = 'form-textarea';
  ta.id = 'flImportJson';
  ta.name = 'flImportJson';
  ta.setAttribute('aria-label', 'Import Framework Lab JSON');
  ta.placeholder = 'Paste Framework Lab JSON here…';
  ta.style.minHeight = '160px';
  ta.style.marginTop = '8px';
  card.appendChild(ta);

  const importRow = document.createElement('div');
  importRow.style.display = 'flex';
  importRow.style.gap = '8px';
  importRow.style.flexWrap = 'wrap';
  importRow.style.marginTop = '10px';
  card.appendChild(importRow);

  const replaceBtn = document.createElement('button');
  replaceBtn.className = 'btn btn-primary btn-sm';
  replaceBtn.textContent = 'Import (Replace)';
  studyosBindClick(replaceBtn, () => {
    const parsed = flParseImport(ta.value);
    if (!parsed) return;
    saveFrameworkLabState(parsed);
    frameworkLabUI.selectedFrameworkId = null;
    renderFrameworkLab();
  });
  importRow.appendChild(replaceBtn);

  const mergeBtn = document.createElement('button');
  mergeBtn.className = 'btn btn-secondary btn-sm';
  mergeBtn.textContent = 'Import (Merge)';
  studyosBindClick(mergeBtn, () => {
    const parsed = flParseImport(ta.value);
    if (!parsed) return;
    const current = loadFrameworkLabState();
    const merged = {
      ...current,
      variables: { ...current.variables, ...parsed.variables },
      relationships: { ...current.relationships, ...parsed.relationships },
      frameworks: { ...current.frameworks, ...parsed.frameworks },
      scenarios: { ...current.scenarios, ...parsed.scenarios },
      version: FRAMEWORK_LAB_SCHEMA_VERSION
    };
    saveFrameworkLabState(merged);
    frameworkLabUI.selectedFrameworkId = null;
    renderFrameworkLab();
  });
  importRow.appendChild(mergeBtn);
}

function flParseImport(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');
    // minimal validation
    const safe = {
      ...flDefaultState(),
      ...parsed,
      version: FRAMEWORK_LAB_SCHEMA_VERSION
    };
    return safe;
  } catch (e) {
    alert('Invalid JSON import.');
    return null;
  }
}

function flField(label, value, onChange, textarea = false) {
  const wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.style.padding = '12px';
  wrap.style.marginBottom = '10px';

  const l = document.createElement('label');
  l.style.fontSize = '0.75rem';
  l.style.color = 'var(--text-muted)';
  l.style.textTransform = 'uppercase';
  l.style.letterSpacing = '0.5px';
  l.textContent = label;
  wrap.appendChild(l);

  const input = document.createElement(textarea ? 'textarea' : 'input');
  input.className = textarea ? 'form-textarea' : 'form-input';
  if (!textarea) input.type = 'text';
  input.value = value;
  if (textarea) input.style.minHeight = '90px';
  input.style.marginTop = '8px';
  input.addEventListener('change', () => onChange(input.value));
  wrap.appendChild(input);
  return wrap;
}

// Shared, always-unique id generator for the flInput()/flTextarea() label
// pairs below — fixes the "label isn't associated with a form field"
// warning at its one shared source instead of at each of their call sites.
let _flFieldIdCounter = 0;
function flFieldId(label) {
  const slug = String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '') || 'field';
  _flFieldIdCounter += 1;
  return 'fl-field-' + slug + '-' + _flFieldIdCounter;
}

function flInput(label, placeholder = '') {
  const el = document.createElement('div');
  el.style.marginBottom = '10px';
  const id = flFieldId(label);
  const l = document.createElement('label');
  l.style.fontSize = '0.75rem';
  l.style.color = 'var(--text-muted)';
  l.style.textTransform = 'uppercase';
  l.style.letterSpacing = '0.5px';
  l.textContent = label;
  l.setAttribute('for', id);
  const input = document.createElement('input');
  input.className = 'form-input';
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.style.marginTop = '8px';
  el.appendChild(l);
  el.appendChild(input);
  return { el, input };
}

function flTextarea(label) {
  const el = document.createElement('div');
  el.style.marginBottom = '10px';
  const id = flFieldId(label);
  const l = document.createElement('label');
  l.style.fontSize = '0.75rem';
  l.style.color = 'var(--text-muted)';
  l.style.textTransform = 'uppercase';
  l.style.letterSpacing = '0.5px';
  l.textContent = label;
  l.setAttribute('for', id);
  const input = document.createElement('textarea');
  input.className = 'form-textarea';
  input.id = id;
  input.name = id;
  input.style.minHeight = '80px';
  input.style.marginTop = '8px';
  el.appendChild(l);
  el.appendChild(input);
  return { el, input };
}

function flLabeled(label, control) {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.gap = '6px';
  wrap.style.minWidth = '140px';
  const l = document.createElement('div');
  l.style.fontSize = '0.75rem';
  l.style.color = 'var(--text-muted)';
  l.style.textTransform = 'uppercase';
  l.style.letterSpacing = '0.5px';
  l.textContent = label;
  wrap.appendChild(l);
  wrap.appendChild(control);
  return wrap;
}

// HTML escaping uses the shared esc() helper from js/core.js (dedup'd V32 —
// this file used to carry its own escapeHtml() with identical call-site
// behavior; see js/diagnostics.js diagnosticsEscape() for the other former
// duplicate, which already fell back to esc() and needs no change).

// ==================== FRAMEWORK EXPLORER (V8) ====================
// Text-first recursive explorer for variable interactions (upstream/downstream).


function frameworkCreateNew(){
  const state = getFrameworkLabState();
  const id = flGenerateId('fw');
  const ts = nowTs();
  const fw = {
    id,
    name: 'New Framework',
    problemItSolves: '',
    description: '',
    variableIds: [],
    relationshipIds: [],
    powerImplications: '',
    failureModes: '',
    assumptions: '',
    versionLabel: 'v0.1',
    changeLog: [{ at: ts, label: 'v0.1', note: 'Initial draft' }],
    createdAt: ts,
    updatedAt: ts
  };
  state.frameworks[id] = fw;
  saveFrameworkLabState(state);
  frameworkLabUI.selectedFrameworkId = id;
  frameworkLabUI.activeTab = 'overview';
  renderFrameworkLab();
}

function frameworkCreateStarter(kind){
  const state = loadFrameworkLabState();
  const ts = nowTs();
  const makeVar = (name, category, desc='') => ({ id: flGenerateId('var'), name, category, description: desc, createdAt: ts, updatedAt: ts });
  const makeRel = (fromVarId, toVarId, polarity, strength, note='') => ({ id: flGenerateId('rel'), fromVarId, toVarId, polarity, strength, note, createdAt: ts, updatedAt: ts });

  let spec = null;
  if (kind === 'smr') {
    const vars = [
      makeVar('Licensing readiness', 'regulatory', 'Regulatory submission quality and completeness'),
      makeVar('Design maturity', 'technical', 'Engineering completeness and configuration control'),
      makeVar('Supply chain readiness', 'execution', 'Qualified vendors and fabrication confidence'),
      makeVar('Schedule confidence', 'controls', 'Credible milestone predictability'),
      makeVar('Stakeholder trust', 'leadership', 'Owner, regulator, and partner confidence')
    ];
    spec = {
      name: 'SMR Program Map',
      problemItSolves: 'Helps you reason about what moves schedule confidence and execution readiness in nuclear/SMR delivery.',
      description: 'Starter framework for Small Modular Reactor program thinking.',
      vars,
      rels: [
        makeRel(vars[1].id, vars[0].id, 'positive', 4, 'Mature design improves licensing readiness.'),
        makeRel(vars[0].id, vars[4].id, 'positive', 4, 'Strong licensing readiness builds stakeholder trust.'),
        makeRel(vars[2].id, vars[3].id, 'positive', 5, 'Supply readiness improves schedule confidence.'),
        makeRel(vars[1].id, vars[3].id, 'positive', 4, 'Design maturity reduces schedule volatility.'),
        makeRel(vars[4].id, vars[2].id, 'positive', 3, 'Trust improves collaboration and procurement velocity.')
      ]
    };
  } else if (kind === 'decision') {
    const vars = [
      makeVar('Decision clarity', 'quality', ''),
      makeVar('Option quality', 'quality', ''),
      makeVar('Execution follow-through', 'execution', ''),
      makeVar('Review discipline', 'learning', ''),
      makeVar('Calibration quality', 'learning', '')
    ];
    spec = {
      name: 'Decision Quality Loop',
      problemItSolves: 'Tracks how better framing and review improve future judgment.',
      description: 'Starter framework for decision journaling and strategic calibration.',
      vars,
      rels: [
        makeRel(vars[0].id, vars[1].id, 'positive', 4, ''),
        makeRel(vars[1].id, vars[2].id, 'positive', 3, ''),
        makeRel(vars[2].id, vars[3].id, 'positive', 2, ''),
        makeRel(vars[3].id, vars[4].id, 'positive', 5, ''),
        makeRel(vars[4].id, vars[0].id, 'positive', 3, '')
      ]
    };
  } else {
    const vars = [
      makeVar('Stakeholder trust', 'influence', ''),
      makeVar('Communication frequency', 'influence', ''),
      makeVar('Issue visibility', 'execution', ''),
      makeVar('Escalation speed', 'execution', ''),
      makeVar('Project alignment', 'strategy', '')
    ];
    spec = {
      name: 'Stakeholder Influence Map',
      problemItSolves: 'Shows how communication and issue visibility affect alignment and trust.',
      description: 'Starter framework for leadership and coordination.',
      vars,
      rels: [
        makeRel(vars[1].id, vars[0].id, 'positive', 3, ''),
        makeRel(vars[2].id, vars[3].id, 'positive', 4, ''),
        makeRel(vars[3].id, vars[4].id, 'positive', 4, ''),
        makeRel(vars[0].id, vars[4].id, 'positive', 4, ''),
        makeRel(vars[2].id, vars[0].id, 'negative', 2, 'Unmanaged issues erode trust.')
      ]
    };
  }

  const fwId = flGenerateId('fw');
  state.frameworks[fwId] = {
    id: fwId,
    name: spec.name,
    problemItSolves: spec.problemItSolves,
    description: spec.description,
    variableIds: spec.vars.map(v => v.id),
    relationshipIds: spec.rels.map(r => r.id),
    powerImplications: '',
    failureModes: '',
    assumptions: '',
    versionLabel: 'v0.1',
    changeLog: [{ at: ts, label: 'v0.1', note: 'Starter template created' }],
    createdAt: ts,
    updatedAt: ts
  };
  spec.vars.forEach(v => state.variables[v.id] = v);
  spec.rels.forEach(r => state.relationships[r.id] = r);
  saveFrameworkLabState(state);
  frameworkLabUI.selectedFrameworkId = fwId;
  frameworkLabUI.activeTab = 'overview';
  renderFrameworkLab();
}
function frameworkBuildAdjacency(state){
    const adjOut={}, adjIn={};
    Object.values(state.relationships||{}).forEach(r=>{
        if(!r.fromVarId || !r.toVarId) return;
        (adjOut[r.fromVarId] ||= []).push(r);
        (adjIn[r.toVarId] ||= []).push(r);
    });
    return {adjOut, adjIn};
}

function frameworkExplore(state, varId, dir, depth){
    const {adjOut, adjIn}=frameworkBuildAdjacency(state);
    const seen=new Set([varId]);
    const layers=[];
    let frontier=[varId];
    for(let d=1; d<=depth; d++){
        const next=[];
        const rels=[];
        frontier.forEach(v=>{
            const edges = dir==='out' ? (adjOut[v]||[]) : (adjIn[v]||[]);
            edges.forEach(e=>{
                const other = dir==='out' ? e.toVarId : e.fromVarId;
                rels.push({edge:e, other});
                if(!seen.has(other)){
                    seen.add(other);
                    next.push(other);
                }
            });
        });
        layers.push({d, rels});
        frontier=next;
        if(!frontier.length) break;
    }
    return layers;
}

function renderFrameworkExplorerUI(){
    const rootEl=document.getElementById('fwExplorer');
    if(!rootEl) return;
    const state=loadFrameworkLabState();
    const fwId=frameworkLabUI.selectedFrameworkId;
    if(!fwId){ rootEl.innerHTML='<div class="empty">Select a framework to explore.</div>'; return; }
    const fw=state.frameworks[fwId];
    if(!fw){ rootEl.innerHTML='<div class="empty">Framework not found.</div>'; return; }

    const vars=(fw.variableIds||[]).map(id=>state.variables[id]).filter(Boolean);
    if(!vars.length){ rootEl.innerHTML='<div class="empty">Add variables to this framework first.</div>'; return; }

    // Controls
    const selected = frameworkLabUI.exploreVarId || vars[0].id;
    const depth = frameworkLabUI.exploreDepth || 2;

    const makeOpt = (v)=>`<option value="${v.id}" ${v.id===selected?'selected':''}>${esc(v.name)}</option>`;
    rootEl.innerHTML = `
        <div class="card" style="padding:14px;">
            <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;">
                <div style="font-weight:700;">Recursive Explorer</div>
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                    <label for="fwExploreVar" style="font-size:0.85rem;color:var(--text-muted);">Variable</label>
                    <select class="form-select" id="fwExploreVar" name="fwExploreVar">${vars.map(makeOpt).join('')}</select>
                    <label for="fwExploreDepth" style="font-size:0.85rem;color:var(--text-muted);">Depth</label>
                    <select class="form-select" id="fwExploreDepth" name="fwExploreDepth">
                        ${[1,2,3,4].map(n=>`<option value="${n}" ${n===depth?'selected':''}>${n}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                <div class="card" style="padding:12px;">
                    <div style="font-weight:700;margin-bottom:6px;">Downstream (effects)</div>
                    <div id="fwExploreOut"></div>
                </div>
                <div class="card" style="padding:12px;">
                    <div style="font-weight:700;margin-bottom:6px;">Upstream (causes)</div>
                    <div id="fwExploreIn"></div>
                </div>
            </div>
        </div>
    `;

    const sel=document.getElementById('fwExploreVar');
    const dep=document.getElementById('fwExploreDepth');
    sel.onchange=()=>{ frameworkLabUI.exploreVarId = sel.value; renderFrameworkExplorerUI(); };
    dep.onchange=()=>{ frameworkLabUI.exploreDepth = parseInt(dep.value,10); renderFrameworkExplorerUI(); };

    const out=frameworkExplore(state, selected, 'out', depth);
    const inn=frameworkExplore(state, selected, 'in', depth);

    const renderLayers=(layers, dir)=>{
        if(!layers.length) return '<div class="empty">No connections at this depth.</div>';
        return layers.map(layer=>{
            const items = layer.rels
                .filter(x => fw.variableIds.includes(x.other))
                .slice(0, 20)
                .map(x=>{
                    const v = state.variables[x.other];
                    const edge=x.edge;
                    const pol=edge.polarity==='negative' ? '−' : '+';
                    const str=edge.strength ? `S${edge.strength}` : '';
                    const del=edge.delay ? `D${edge.delay}` : '';
                    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);">
                        <div style="flex:1;">${v?esc(v.name):x.other}</div>
                        <div class="badge badge-muted">${pol} ${str} ${del}</div>
                    </div>`;
                }).join('');
            return `<div style="margin-bottom:10px;">
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px;">Depth ${layer.d}</div>
                <div>${items || '<div class="empty">No framework-connected variables.</div>'}</div>
            </div>`;
        }).join('');
    };

    document.getElementById('fwExploreOut').innerHTML = renderLayers(out,'out');
    document.getElementById('fwExploreIn').innerHTML = renderLayers(inn,'in');
}

window.frameworkCreateNew = frameworkCreateNew;
window.frameworkCreateStarter = frameworkCreateStarter;
