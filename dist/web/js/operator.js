// ==================== OPERATOR CONSOLE (V11) ====================
// Purpose: merge stabilization + compounding into one cockpit.

function renderOperator(){
  const root = document.getElementById('operatorRoot');
  if(!root) return;

  const proto = get(K.protocol) || {};
  const todayProto = proto[today()] || {};
  const hasMorning = !!todayProto.morning;
  const intention = typeof todayProto.intention === 'string' ? todayProto.intention.trim() : '';
  const energy = todayProto.energy || '—';

  const habits = arr(K.habits);
  const hlogs = arr(K.habitLogs);
  const doneToday = new Set(hlogs.filter(l => l.date === today()).map(l => l.habitId));
  const habitsDone = habits.length ? habits.filter(h => doneToday.has(h.id)).length : 0;

  const tasks = arr(K.tasks);
  const overdue = tasks.filter(t => !taskIsCompleted(t) && taskDueDate(t) && taskDueDate(t) < today()).length;
  const dueToday = tasks.filter(t => !taskIsCompleted(t) && taskDueDate(t) === today()).length;

  const integrity = (typeof LEARN !== 'undefined' && LEARN.getLearningIntegrityIndex) ? LEARN.getLearningIntegrityIndex() : null;
  const idx = integrity && integrity.index !== null ? integrity.index : '—';
  const balance = integrity ? integrity.balance : null;
  const alloc = integrity ? integrity.allocation : null;
  const mom = integrity ? integrity.momentum : null;

  const decays = (typeof LEARN !== 'undefined' && typeof LEARN.getSkillDecayWarnings==='function') ? LEARN.getSkillDecayWarnings(21) : [];
  const decayHtml = (decays && decays.length) ? renderOperatorDecay(decays) : '';

  const durTech = (typeof LEARN !== 'undefined' && typeof LEARN.recommendStudyBlockDuration==='function') ? LEARN.recommendStudyBlockDuration('technical') : 60;
  const durStrat = (typeof LEARN !== 'undefined' && typeof LEARN.recommendStudyBlockDuration==='function') ? LEARN.recommendStudyBlockDuration('strategic') : 60;
  const durLead = (typeof LEARN !== 'undefined' && typeof LEARN.recommendStudyBlockDuration==='function') ? LEARN.recommendStudyBlockDuration('leadership') : 60;

  const next = (typeof intelRecommendNextMove === 'function') ? intelRecommendNextMove() : null;

  // UI
  root.innerHTML = `
    <div class="summary-strip" style="margin-top:0;">
      <div class="summary-card">
        <div class="summary-kicker">Protocol</div>
        <div class="summary-value">${hasMorning ? '✅' : '⚠️'}</div>
        <div class="summary-hint">Energy: <span class="mono">${esc(String(energy))}</span></div>
      </div>
      <div class="summary-card">
        <div class="summary-kicker">Intention</div>
        <div class="summary-value" style="font-size:1.1rem;line-height:1.2;">${intention ? esc(intention) : '—'}</div>
        <div class="summary-hint">Set in Protocol</div>
      </div>
      <div class="summary-card">
        <div class="summary-kicker">Habits Today</div>
        <div class="summary-value">${habitsDone}/${habits.length || 0}</div>
        <div class="summary-hint">Stability reps</div>
      </div>
      <div class="summary-card">
        <div class="summary-kicker">Deadlines</div>
        <div class="summary-value">${overdue ? '⚠️' : '—'}</div>
        <div class="summary-hint">Overdue: ${overdue} · Due today: ${dueToday}</div>
      </div>
      <div class="summary-card">
        <div class="summary-kicker">Learning Integrity</div>
        <div class="summary-value">${idx}</div>
        <div class="summary-hint">Momentum + Calibration + Balance</div>
      </div>
    </div>

    <div class="board" style="grid-template-columns: 1.2fr 0.8fr;">
      <div>
        <div class="card" style="margin-bottom:12px;">
          <div class="card-header">
            <span class="card-title">🧭 Today Flow</span>
            <span class="badge">12h window</span>
          </div>
          <div style="display:grid;gap:10px;">
            <div class="list">
              <div class="list-item">
                <div>
                  <div style="font-weight:800;">${hasMorning ? 'Protocol complete' : 'Run protocol now'}</div>
                  <div class="muted">${hasMorning ? 'Good. You set the day.' : 'Sets intention, energy, and initial traction.'}</div>
                </div>
                <button class="btn btn-sm ${hasMorning ? 'btn-secondary' : 'btn-primary'}" onclick="go('protocol')">${hasMorning ? 'View' : 'Run'}</button>
              </div>
              <div class="list-item">
                <div>
                  <div style="font-weight:800;">Execution queue</div>
                  <div class="muted">Overdue: ${overdue} · Due today: ${dueToday}</div>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="go('tasks')">Open</button>
              </div>
              <div class="list-item">
                <div>
                  <div style="font-weight:800;">Study blocks</div>
                  <div class="muted">Schedule 60-min blocks. Track domains.</div>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="go('calendar')">Calendar</button>
              </div>
              <div class="list-item">
                <div>
                  <div style="font-weight:800;">Doctrine drill</div>
                  <div class="muted">Run one high-quality rep and log it.</div>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="go('doctrine')">Doctrine</button>
              </div>
              <div class="list-item">
                <div>
                  <div style="font-weight:800;">SRS review</div>
                  <div class="muted">Protect retention. Short, consistent.</div>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="go('flashcards')">Review</button>
              </div>
            </div>
          </div>
        </div>

        
        <div class="card" style="margin-bottom:12px;">
          <div class="card-header">
            <span class="card-title">🧱 Plan the Next 12 Hours</span>
            <span class="badge">adaptive</span>
          </div>
          <div class="muted" style="margin-bottom:10px;">Quick-add study blocks for today with domain tags. Keep it clean: 4× Technical, 4× Strategic, 4× Leadership.</div>
          <div class="plan-actions">
            <button class="btn btn-sm btn-secondary" onclick="operatorQuickAddStudyBlock('technical',{durationMin:durTech})">+${durTech}m Technical</button>
            <button class="btn btn-sm btn-secondary" onclick="operatorQuickAddStudyBlock('strategic',{durationMin:durStrat})">+${durStrat}m Strategic</button>
            <button class="btn btn-sm btn-secondary" onclick="operatorQuickAddStudyBlock('leadership',{durationMin:durLead})">+${durLead}m Leadership</button>
            <button class="btn btn-sm btn-primary" onclick="operatorBuild12hPlan()">Build 12h Plan</button>
          </div>
          <div id="operatorPlanPreview" class="plan-preview"></div>
        </div>

<div class="card" style="margin-bottom:12px;">
          <div class="card-header">
            <span class="card-title">📝 Operator Note</span>
            <span class="badge">Reflect → Action</span>
          </div>
          <div class="muted" style="margin-bottom:10px;">Short, structured. One insight + one tightening move.</div>
          <textarea class="form-textarea" id="operatorNote" placeholder="What improved? What resisted? What will you tighten next?" style="min-height:110px;"></textarea>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px;flex-wrap:wrap;">
            <button class="btn btn-secondary" onclick="document.getElementById('operatorNote').value=''">Clear</button>
            <button class="btn btn-primary" onclick="saveOperatorNote()">Save to Journal</button>
          </div>
        </div>
      </div>

      <div class="rail">
        ${decayHtml}

        <div class="card" style="padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="font-weight:800;">⚖️ Domain Balance</div>
            <span class="badge">7d</span>
          </div>
          ${alloc ? renderOperatorBalance(alloc, balance) : '<div class="muted">Log study time in ⏱️ Time to activate balance.</div>'}
        </div>

        <div class="card" style="padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="font-weight:800;">🔥 Skill Momentum</div>
            <span class="badge">14d</span>
          </div>
          ${mom ? `
            <div style="font-size:1.8rem;font-weight:900;">${mom.normalized}</div>
            <div class="muted">${mom.count} drill logs · depth-weighted</div>
          ` : '<div class="muted">Run a doctrine drill to start momentum.</div>'}
        </div>

        <div class="card" style="padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="font-weight:800;">Next Move</div>
            <span class="badge badge-blue">INTEL</span>
          </div>
          ${next ? `
            <div style="font-weight:900;">${esc(next.title || '—')}</div>
            <div class="muted" style="margin:6px 0 10px;">${esc(next.desc || '')}</div>
            ${next.ctaFn ? `<button class="btn btn-primary" onclick="${esc(next.ctaFn)}">${esc(next.ctaText || 'Do it')}</button>` : ''}
          ` : '<div class="muted">No recommendation available.</div>'}
        </div>

        <div class="card" style="padding:14px;">
          <div style="font-weight:800;margin-bottom:10px;">Quick Actions</div>
          <div style="display:grid;gap:8px;">
            <button class="btn btn-primary" onclick="startFocusMode()">🎯 Focus Mode</button>
            <button class="btn btn-secondary" onclick="go('tracker')">⏱️ Log Study Time</button>
            <button class="btn btn-secondary" onclick="go('discipline')">📊 Discipline</button>
            <button class="btn btn-secondary" onclick="go('habits')">🔄 Habits</button>
          </div>
        </div>
      </div>
    </div>
  `;
  operatorRenderPlanPreview();
  operatorRenderCharts();
}



function renderOperatorDecay(decays){
  // decays: [{domain, daysSince}]
  const rows = decays.slice().sort((a,b)=>b.daysSince-a.daysSince).map(d=>{
    const nm = d.domain.charAt(0).toUpperCase()+d.domain.slice(1);
    const since = d.daysSince>=9999 ? 'never' : (d.daysSince+'d');
    return `<div style="display:flex;justify-content:space-between;gap:10px;">
      <span>${esc(nm)}</span><span class="mono">${esc(since)}</span>
    </div>`;
  }).join('');
  const top = decays.slice().sort((a,b)=>b.daysSince-a.daysSince)[0];
  return `
    <div class="card" style="padding:14px;border:1px solid var(--warning);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-weight:900;">🧊 Skill Decay Watch</div>
        <span class="badge badge-warn">21d</span>
      </div>
      <div class="muted" style="margin-bottom:10px;">${rows}</div>
      <button class="btn btn-sm btn-primary" onclick="intelRunCorrectiveDrill('${esc(top.domain)}')">Run a decay-fix drill</button>
    </div>
  `;

  // Activate dynamic sections after DOM injection
  try {
    operatorRenderPlanPreview();
    if(typeof operatorRenderCharts === 'function') operatorRenderCharts();
  } catch(e){
    console.warn('Operator render post-hook failed', e);
  }
}


function renderOperatorBalance(alloc, balanceScore){
  const pct = alloc.pct || {technical:0, strategic:0, leadership:0};
  const hours = alloc.hours || {technical:0, strategic:0, leadership:0};
  const warn = balanceScore !== null && balanceScore < 70;
  let driftHtml = '';
  if (typeof LEARN !== 'undefined' && typeof LEARN.getDriftStatus === 'function') {
    const drift = LEARN.getDriftStatus();
    if (drift?.isDrifting) {
      const off = drift.offenders[0];
      const nm = (off?.domain || '').charAt(0).toUpperCase() + (off?.domain || '').slice(1);
      driftHtml = `<div class="card" style="margin-top:10px;border-left:3px solid var(--warn);padding:10px;">
        <div style="font-weight:900;">⚠️ Two-week drift detected</div>
        <div class="muted">${esc(nm)} has been imbalanced for two weeks (current ${off.pctCurrent}%, prev ${off.pctPrevious}%).</div>
        <div style="margin-top:8px;"><button class="btn btn-sm btn-secondary" onclick="go('tracker')">Rebalance</button></div>
      </div>`;
    }
  }
  return `
    <div style="display:grid;gap:10px;">
      <div class="kpi-row">
        <div><div class="kpi-label">Technical</div><div class="kpi-value">${pct.technical || 0}%</div><div class="kpi-sub">${(hours.technical||0).toFixed(1)}h</div></div>
        <div><div class="kpi-label">Strategic</div><div class="kpi-value">${pct.strategic || 0}%</div><div class="kpi-sub">${(hours.strategic||0).toFixed(1)}h</div></div>
        <div><div class="kpi-label">Leadership</div><div class="kpi-value">${pct.leadership || 0}%</div><div class="kpi-sub">${(hours.leadership||0).toFixed(1)}h</div></div>
      </div>
      <div class="muted">Balance score: <span class="mono">${balanceScore === null ? '—' : balanceScore}</span>${warn ? ' · <span style="color:var(--warn);font-weight:700;">drift risk</span>' : ''}</div>
      ${driftHtml}
    </div>
  `;
}

function saveOperatorNote(){
  const ta = document.getElementById('operatorNote');
  if(!ta) return;
  const txt = (ta.value || '').trim();
  if(!txt){ toast('Write a note first'); return; }
  const entries = arr(K.journal);
  entries.push({
    id: uid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: today(),
    type: 'reflection',
    title: 'Operator Note',
    content: `<p>${esc(txt)}</p>`,
    mood: '',
    icon: '🧭',
    tags: ['operator'],
    pathway: ''
  });
  set(K.journal, entries);
  ta.value = '';
  toast('Saved to Journal');
}


// ===== Operator planning helpers (V11 v4) =====
function operatorGetTodayStudyBlocks(){
  const events = arr(K.events);
  return events.filter(e => e.date === today() && (e.type || '') === 'study');
}

function operatorParseTime(t){
  if(!t) return null;
  const [hh,mm] = t.split(':').map(x=>parseInt(x,10));
  if(isNaN(hh)||isNaN(mm)) return null;
  return hh*60+mm;
}
function operatorEventRange(e){
  if(!e.time) return null;
  const start = operatorParseTime(e.time);
  if(start===null) return null;
  const dur = parseInt(e.duration||'60',10) || 60;
  return { start, end: start + dur };
}
function operatorHasConflict(dateStr, startMin, endMin){
  if(window.COMMITMENTS && typeof COMMITMENTS.hasIntervalConflict === 'function') {
    return COMMITMENTS.hasIntervalConflict(dateStr, startMin, endMin);
  }
  const events = arr(K.events).filter(e => e.date === dateStr && e.time);
  for(const e of events){
    const r = operatorEventRange(e);
    if(!r) continue;
    // overlap check
    if(startMin < r.end && endMin > r.start) return true;
  }
  return false;
}
function operatorFindNextSlot(dateStr, durationMin, windowHours=12){
  const now = new Date();
  now.setMinutes(0,0,0);
  now.setHours(now.getHours()+1);
  let startHour = now.getHours();
  let endHour = Math.min(23, startHour + (windowHours-1));
  for(let h=startHour; h<=endHour; h++){
    const t = String(h).padStart(2,'0') + ':00';
    const startMin = h*60;
    const endMin = startMin + durationMin;
    if(!operatorHasConflict(dateStr, startMin, endMin)) return t;
  }
  return null;
}

function operatorSuggestSlots(dateStr, durationMin){
  // Suggest nearest alternatives for conflict resolution.
  // Today: scan remaining hours; Tomorrow: scan 6am–10pm.
  const out = { today: [], tomorrow: [] };

  // Today scan from next hour through 23
  const now = new Date();
  now.setMinutes(0,0,0);
  now.setHours(now.getHours()+1);
  for(let h=now.getHours(); h<=23; h++){
    const startMin = h*60;
    const endMin = startMin + durationMin;
    if(endMin > 24*60) continue;
    if(!operatorHasConflict(dateStr, startMin, endMin)) out.today.push(String(h).padStart(2,'0')+':00');
    if(out.today.length>=6) break;
  }

  // Tomorrow scan
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate()+1);
  const tomorrowStr = fmtDate(d);
  for(let h=6; h<=22; h++){
    const startMin = h*60;
    const endMin = startMin + durationMin;
    if(!operatorHasConflict(tomorrowStr, startMin, endMin)) out.tomorrow.push(String(h).padStart(2,'0')+':00');
    if(out.tomorrow.length>=6) break;
  }

  return { ...out, tomorrowDate: tomorrowStr };
}

function operatorAddStudyEvent({dateStr, time, domain, durationMin, title, source}){
  const dom = (domain || 'technical').toLowerCase();
  const cap = dom.charAt(0).toUpperCase() + dom.slice(1);
  const events = arr(K.events);
  const t = time || null;
  const notes = `Domain: ${cap}\nSource: ${source || 'Operator Console'}`;

  events.push({
    id: uid(),
    title: title || `Study (${cap})`,
    date: dateStr,
    time: t,
    type: 'study',
    duration: String(durationMin || 60),
    notes
  });
  set(K.events, events);
  if (typeof renderCalendar === 'function') renderCalendar();
}

function operatorShowConflictModal(pending){
  const titleEl = document.getElementById('operatorConflictTitle');
  const bodyEl = document.getElementById('operatorConflictBody');
  if(!titleEl || !bodyEl) {
    toast('No open slot. Open Calendar to resolve.');
    return;
  }

  const durationMin = pending.durationMin || 60;
  const dom = pending.domain || 'technical';
  const cap = dom.charAt(0).toUpperCase() + dom.slice(1);
  const suggestions = operatorSuggestSlots(today(), durationMin);

  titleEl.textContent = 'Schedule Conflict — no free slot found';

  const makeBtn = (dateStr, t) => {
    const safeT = esc(t);
    const safeD = esc(dateStr);
    return `<button class="btn btn-secondary" onclick="operatorResolveConflictAdd('${safeD}','${safeT}','${esc(dom)}',${durationMin})">Add ${safeT}</button>`;
  };

  const todayBtns = suggestions.today.length ? suggestions.today.map(t=>makeBtn(today(), t)).join(' ') : '<div class="muted">No openings left today.</div>';
  const tomorrowBtns = suggestions.tomorrow.length ? suggestions.tomorrow.map(t=>makeBtn(suggestions.tomorrowDate, t)).join(' ') : '<div class="muted">No suggested openings tomorrow.</div>';

  bodyEl.innerHTML = `
    <div class="modal-section">
      <div class="kicker">Pending block</div>
      <div style="font-weight:700;">Study (${cap}) — ${durationMin} min</div>
      <div class="hint">Your calendar is full inside the next 12 hours. Pick a nearest alternative below.</div>
    </div>
    <div class="modal-section">
      <div class="kicker">Today — nearest openings</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">${todayBtns}</div>
    </div>
    <div class="modal-section">
      <div class="kicker">Tomorrow — suggested openings</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">${tomorrowBtns}</div>
    </div>
  `;

  // Stash pending details for resolve handler
  window.__OPERATOR_PENDING_BLOCK = { ...pending, suggestions };
  openModal('operatorConflictModal');
}

function operatorResolveConflictAdd(dateStr, time, domain, durationMin){
  const pending = window.__OPERATOR_PENDING_BLOCK || {};
  operatorAddStudyEvent({
    dateStr,
    time,
    domain: domain || pending.domain,
    durationMin: durationMin || pending.durationMin || 60,
    title: pending.title,
    source: 'Operator Conflict Resolver'
  });
  closeModal('operatorConflictModal');
  toast('Scheduled');
  operatorRenderPlanPreview();
  operatorRenderCharts();
}

// V56: orphaned operatorNextAvailableHour() removed — slot search callers use
// operatorFindNextSlot() directly (audit R3).

function operatorQuickAddStudyBlock(domain, opts){
  opts = opts || {};
  const silent = !!opts.silent;
  const dom = (domain || 'technical').toLowerCase();
  const cap = dom.charAt(0).toUpperCase() + dom.slice(1);
  let durationMin;
  if(opts.durationMin && opts.durationMin !== 'auto') {
    durationMin = parseInt(opts.durationMin, 10) || 60;
  } else {
    durationMin = (window.LEARN && typeof LEARN.recommendStudyBlockDuration==='function') ? LEARN.recommendStudyBlockDuration(dom) : 60;
  }
  const time = operatorFindNextSlot(today(), durationMin, 12);
  const title = `Study (${cap})`;

  if(!time){
    if(!silent) operatorShowConflictModal({ domain: dom, durationMin, title });
    return false;
  }

  operatorAddStudyEvent({ dateStr: today(), time, domain: dom, durationMin, title, source: 'Operator Console' });
  if(!silent) toast('Study block added' + (time ? ` (${time})` : ''));
  operatorRenderPlanPreview();
  operatorRenderCharts();
  return true;
}

function operatorBuild12hPlan(){
  // Create 12 blocks (4 per domain) within the next 12 available hourly slots.
  const domains = ['technical','strategic','leadership'];
  let created = 0;
  let failed = 0;
  for(let round=0; round<4; round++){
    for(const d of domains){
      const ok = operatorQuickAddStudyBlock(d, {silent:true, durationMin:'auto'});
      if(ok) created++;
      else failed++;
    }
  }
  if(failed>0){
    toast(`Built ${created} blocks — ${failed} could not be scheduled`);
    // Show resolver for remaining one (represents capacity issue)
    operatorShowConflictModal({ domain: 'technical', durationMin: 60, title: 'Study (Technical)' });
  } else {
    toast('Built 12-hour plan (12 blocks)');
  }
}

function operatorRenderPlanPreview(){
  const el = document.getElementById('operatorPlanPreview');
  if(!el) return;

  const blocks = operatorGetTodayStudyBlocks()
    .slice()
    .sort((a,b)=> (a.time||'99:99').localeCompare(b.time||'99:99'));

  if(!blocks.length){
    el.innerHTML = '<div class="muted">No study blocks scheduled today yet.</div>';
    return;
  }

  const rows = blocks.map(b => {
    const dom = (b.notes || '').match(/Domain:\s*(Technical|Strategic|Leadership)/i);
    const tag = dom ? dom[1].toLowerCase() : 'study';
    const time = b.time ? `<span class="mono">${esc(b.time)}</span>` : '<span class="mono muted">—</span>';
    return `<div class="plan-row" draggable="true" data-id="${esc(b.id)}">
      <div class="plan-handle" title="Drag to reorder">⠿</div>
      <div class="plan-time">${time}</div>
      <div class="plan-title">${esc(b.title || 'Study')}</div>
      <div class="plan-tag badge badge-blue">${esc(tag)}</div>
      <div class="plan-actions">
        <button class="btn btn-sm btn-primary" onclick="operatorStartStudyBlock('${esc(b.id)}'); event.stopPropagation();">Start</button>
        <button class="btn btn-sm btn-secondary" onclick="operatorMoveBlockTomorrow('${esc(b.id)}'); event.stopPropagation();">Move → Tomorrow</button>
      </div>
    </div>`;
  }).join('');

  el.innerHTML = `<div class="plan-grid" id="operatorPlanGrid">${rows}</div>
    <div class="muted" style="margin-top:8px;">Tip: drag blocks to change priority (time slots are reassigned).</div>`;
  operatorBindPlanDnD();
}

let __operatorDragId = null;

function operatorBindPlanDnD(){
  const grid = document.getElementById('operatorPlanGrid');
  if(!grid) return;
  const rows = Array.from(grid.querySelectorAll('.plan-row'));
  rows.forEach(r => {
    r.addEventListener('dragstart', (e) => {
      __operatorDragId = r.dataset.id;
      r.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', __operatorDragId); } catch {}
    });
    r.addEventListener('dragend', () => {
      r.classList.remove('dragging');
      rows.forEach(x=>x.classList.remove('drag-over'));
      __operatorDragId = null;
    });
    r.addEventListener('dragover', (e) => {
      e.preventDefault();
      r.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'move';
    });
    r.addEventListener('dragleave', () => r.classList.remove('drag-over'));
    r.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromId = __operatorDragId || (()=>{
        try { return e.dataTransfer.getData('text/plain'); } catch { return null; }
      })();
      const toId = r.dataset.id;
      if(!fromId || !toId || fromId === toId) return;
      operatorReorderPlan(fromId, toId);
    });
  });
}

// Reorder by moving fromId before toId, then reassigning time slots.
function operatorReorderPlan(fromId, toId){
  const grid = document.getElementById('operatorPlanGrid');
  if(!grid) return;
  const fromEl = grid.querySelector(`.plan-row[data-id="${(window.CSS&&CSS.escape?CSS.escape(fromId):fromId)}"]`);
  const toEl = grid.querySelector(`.plan-row[data-id="${(window.CSS&&CSS.escape?CSS.escape(toId):toId)}"]`);
  if(!fromEl || !toEl) return;
  grid.insertBefore(fromEl, toEl);
  operatorApplyPlanOrder();
}

function operatorApplyPlanOrder(){
  const grid = document.getElementById('operatorPlanGrid');
  if(!grid) return;
  const order = Array.from(grid.querySelectorAll('.plan-row')).map(r => r.dataset.id);
  if(!order.length) return;

  const events = arr(K.events);
  const todayBlocks = events
    .filter(e => e.date === today() && (e.type || '') === 'study' && order.includes(e.id));

  // Extract current time slots (sorted)
  const slots = todayBlocks
    .map(e => e.time || null)
    .filter(Boolean)
    .sort((a,b)=>a.localeCompare(b));

  // If some blocks have no time, keep them null at the end.
  const slotForIndex = (i) => i < slots.length ? slots[i] : null;

  const byId = new Map(todayBlocks.map(e => [e.id, e]));
  order.forEach((id, idx) => {
    const ev = byId.get(id);
    if(!ev) return;
    ev.time = slotForIndex(idx);
  });

  // Write back
  const updated = events.map(e => byId.has(e.id) ? byId.get(e.id) : e);
  set(K.events, updated);
  if (typeof renderCalendar === 'function') renderCalendar();
  toast('Plan reordered');
  // Re-render to ensure preview matches stored times
  operatorRenderPlanPreview();
  operatorRenderCharts();
}

function operatorMoveBlockTomorrow(eventId){
  const events = arr(K.events);
  const i = events.findIndex(e => e.id === eventId);
  if(i === -1) return;
  const e = events[i];
  const d = new Date(today() + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  const tomorrowStr = fmtDate(d);
  events[i] = { ...e, date: tomorrowStr };
  set(K.events, events);
  if (typeof renderCalendar === 'function') renderCalendar();
  toast('Moved to tomorrow');
  operatorRenderPlanPreview();
  operatorRenderCharts();
}

// Start a scheduled study block: set session context for Doctrine suggestions, then launch Focus Mode.
function operatorStartStudyBlock(eventId){
  const events = arr(K.events);
  const ev = events.find(e => e.id === eventId);
  if(!ev){ toast('Block not found'); return; }

  const durationMin = parseInt(ev.duration || '60', 10) || 60;

  // Domain from notes
  let domain = 'technical';
  const m = String(ev.notes||'').match(/Domain:\s*(Technical|Strategic|Leadership)/i);
  if(m) domain = m[1].toLowerCase();

  // Use current active doctrine module as the default module context.
  let moduleId = null;
  try {
    const st = (typeof INTEL !== 'undefined' && INTEL.getState) ? INTEL.getState() : null;
    moduleId = st?.activeModuleId || null;
  } catch(e) {}

  // Precompute suggested models for this module so Doctrine can prefill from the active block context.
  let suggestedModelIds = [];
  try {
    if(moduleId && typeof LEARN !== 'undefined' && typeof LEARN.suggestModelsForModule === 'function'){
      suggestedModelIds = LEARN.suggestModelsForModule(moduleId, 3, 30) || [];
    }
  } catch(e) {}

  const ctx = {
    kind: 'study_block',
    eventId,
    domain,
    moduleId,
    suggestedModelIds,
    durationMin,
    startedAt: new Date().toISOString()
  };
  set(K.sessionContext, ctx);

  // Launch focus timer
  if(typeof startFocusMode === 'function'){
    startFocusMode(ev.title || `Study (${domain})`, Math.max(5, Math.round(durationMin)));
  } else {
    toast('Focus mode not available');
  }
}


// ---- Charts (V11 v6) ----
function operatorRenderCharts(){
  const canvas = document.getElementById('momentumChart');
  if(!canvas || typeof LEARN === 'undefined' || !LEARN.getMomentumSeries) return;

  const ctx = canvas.getContext('2d');
  const series = LEARN.getMomentumSeries(30);

  // HiDPI
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 320;
  const h = 120;

  canvas.width = Math.max(300, Math.floor(w * dpr));
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  // compute max total
  const max = Math.max(1, ...series.map(d => d.total));
  const pad = 10;
  const innerW = w - pad*2;
  const innerH = h - pad*2;
  const barW = innerW / series.length;

  // domain ordering & colors using CSS vars
  const doms = ['technical','strategic','leadership'];
  const css = getComputedStyle(document.documentElement);
  const colors = [
    css.getPropertyValue('--accent').trim() || '#4f8cff',
    css.getPropertyValue('--success').trim() || '#22c55e',
    css.getPropertyValue('--warning').trim() || '#f59e0b'
  ];

  // background grid
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = css.getPropertyValue('--border').trim() || '#2a2a2a';
  for(let i=1;i<=3;i++){
    const y = pad + innerH*(i/4);
    ctx.fillRect(pad, y, innerW, 1);
  }
  ctx.globalAlpha = 1;

  // draw stacked bars
  for(let i=0;i<series.length;i++){
    const day = series[i];
    let yBase = pad + innerH;
    for(let j=0;j<doms.length;j++){
      const dom = doms[j];
      const v = day[dom] || 0;
      if(v<=0) continue;
      const barH = (v / max) * innerH;
      yBase -= barH;
      ctx.fillStyle = colors[j];
      ctx.fillRect(pad + i*barW + 0.5, yBase, Math.max(1, barW-1), barH);
    }
  }
}
