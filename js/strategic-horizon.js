// ==================== STRATEGIC HORIZON ====================
// 3-tier strategic planning: 5-Year Identity → 12-Month Targets → 90-Day War Plan

let editingWarPlanAction = null;
const SH_KEY = K.strategicHorizon;

function getStrategicData() { return get(SH_KEY) || { fiveYear: {}, twelveMonth: [], ninetyDay: [] }; }
function saveStrategicData(d) { set(SH_KEY, d); }

function renderStrategicHorizon() {
    const d = getStrategicData();
    const container = document.getElementById('strategicHorizonContainer');
    if (!container) return;

    // Calculate 90-day progress
    const actions = d.ninetyDay || [];
    const completed = actions.filter(a => a.done).length;
    const total = actions.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate days remaining in current 90-day cycle
    const cycleStart = d.ninetyDayCycleStart;
    let daysRemaining = 90;
    if (cycleStart) {
        const elapsed = Math.floor((Date.now() - new Date(cycleStart).getTime()) / 86400000);
        daysRemaining = Math.max(0, 90 - elapsed);
    }

    const judgmentSignal = typeof PRACTICE !== 'undefined' ? PRACTICE.getStrategicSignal() : { hasEvidence:false, title:'Judgment evidence unavailable', detail:'Run Diagnostics to verify the practice engine.', due:0 };

    container.innerHTML = `
        <div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,var(--accent-light),var(--surface-1));border-color:color-mix(in srgb,var(--accent) 35%,var(--border));">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
                <div style="max-width:760px;">
                    <div class="kicker">Observed capability signal</div>
                    <h3 style="margin:4px 0 5px;">🧭 ${esc(judgmentSignal.title)}</h3>
                    <p style="font-size:.86rem;color:var(--text-secondary);">${esc(judgmentSignal.detail)}</p>
                    <div style="margin-top:7px;font-size:.72rem;color:var(--text-muted);">This is based on your recorded practice—not a personality inference. ${judgmentSignal.due} weak-skill item(s) are currently due.</div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="addStrategicJudgmentTarget()">Add 12-month target</button>
                    <button class="btn btn-primary btn-sm" onclick="addStrategicJudgmentAction()">Add 90-day practice</button>
                </div>
            </div>
        </div>
        <!-- 5-YEAR IDENTITY -->
        <div class="card" style="margin-bottom:16px;border-left:3px solid var(--accent);">
            <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleSHSection('sh5yr')">
                <div>
                    <h3 style="font-size:1.1rem;margin-bottom:4px;">🏔️ 5-Year Identity</h3>
                    <span style="font-size:0.8rem;color:var(--text-muted);">Who are you becoming?</span>
                </div>
                <span style="font-size:1.2rem;" id="sh5yrArrow">▼</span>
            </div>
            <div id="sh5yr" style="margin-top:16px;">
                <div class="form-group">
                    <label class="form-label" for="sh5yrIdentity">🎯 Professional Identity</label>
                    <textarea class="form-textarea" id="sh5yrIdentity" rows="2" placeholder="e.g., SMR Construction Project Manager with nuclear clearance, leading modular reactor builds" onchange="saveSH5Year()">${esc(d.fiveYear.identity || '')}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="sh5yrCapabilities">⚡ Core Capabilities (what you'll be known for)</label>
                    <textarea class="form-textarea" id="sh5yrCapabilities" rows="2" placeholder="e.g., Technical depth + leadership presence + risk anticipation" onchange="saveSH5Year()">${esc(d.fiveYear.capabilities || '')}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="sh5yrPosition">🏗️ Career Position</label>
                    <textarea class="form-textarea" id="sh5yrPosition" rows="2" placeholder="e.g., PM at Aecon/SNC-Lavalin on Pickering or Darlington SMR project" onchange="saveSH5Year()">${esc(d.fiveYear.position || '')}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="sh5yrDomains">🧠 Knowledge Domains Mastered</label>
                    <textarea class="form-textarea" id="sh5yrDomains" rows="2" placeholder="e.g., Nuclear codes & standards, modular construction, project controls, stakeholder management" onchange="saveSH5Year()">${esc(d.fiveYear.domains || '')}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="sh5yrJudgment">🧭 Judgment Standard (how you will make consequential decisions)</label>
                    <textarea class="form-textarea" id="sh5yrJudgment" rows="2" placeholder="e.g., Define context, compare options, expose uncertainty, consult affected people, decide at the correct authority level, and review outcomes" onchange="saveSH5Year()">${esc(d.fiveYear.judgment || '')}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="sh5yrDecisionEvidence">📐 Evidence Standard (what will prove the capability)</label>
                    <textarea class="form-textarea" id="sh5yrDecisionEvidence" rows="2" placeholder="e.g., Calibrated case performance, reviewed decision logs, field artifacts, and mentor feedback" onchange="saveSH5Year()">${esc(d.fiveYear.decisionEvidence || '')}</textarea>
                </div>
            </div>
        </div>

        <!-- 12-MONTH TARGETS -->
        <div class="card" style="margin-bottom:16px;border-left:3px solid var(--warning);">
            <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleSHSection('sh12mo')">
                <div>
                    <h3 style="font-size:1.1rem;margin-bottom:4px;">📅 12-Month Targets</h3>
                    <span style="font-size:0.8rem;color:var(--text-muted);">${(d.twelveMonth || []).filter(t=>t.done).length}/${(d.twelveMonth || []).length} completed</span>
                </div>
                <span style="font-size:1.2rem;" id="sh12moArrow">▼</span>
            </div>
            <div id="sh12mo" style="margin-top:16px;">
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">Concrete, measurable outcomes for the next 12 months. Each target should be a stepping stone toward your 5-year identity.</p>
                <div id="sh12moList">
                    ${(d.twelveMonth || []).map((t, i) => `
                        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px;background:var(--bg-tertiary);border-radius:8px;margin-bottom:8px;">
                            <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleSH12Mo(${i})" style="margin-top:3px;width:18px;height:18px;accent-color:var(--accent);">
                            <div style="flex:1;">
                                <div style="font-weight:600;${t.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${esc(t.target)}</div>
                                ${t.metric ? '<div style="font-size:0.8rem;color:var(--text-muted);">📊 ' + esc(t.metric) + '</div>' : ''}
                                ${t.category ? '<span style="font-size:0.7rem;padding:2px 8px;background:var(--accent-light);color:var(--accent);border-radius:4px;">' + esc(t.category) + '</span>' : ''}
                            </div>
                            <button class="btn btn-sm btn-secondary" onclick="removeSH12Mo(${i})" style="font-size:0.7rem;">✕</button>
                        </div>
                    `).join('')}
                </div>
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <input type="text" class="form-input" id="sh12moTarget" placeholder="Target (e.g., PMP Certified)" style="flex:2;">
                    <input type="text" class="form-input" id="sh12moMetric" placeholder="Metric" style="flex:1;">
                    <select class="form-input" id="sh12moCat" style="flex:1;">
                        <option value="certification">Certification</option>
                        <option value="skill">Skill</option>
                        <option value="career">Career</option>
                        <option value="network">Network</option>
                        <option value="judgment">Judgment</option>
                        <option value="health">Health</option>
                    </select>
                    <button class="btn btn-primary btn-sm" onclick="addSH12Mo()">+</button>
                </div>
            </div>
        </div>

        <!-- 90-DAY WAR PLAN -->
        <div class="card" style="border-left:3px solid var(--danger);">
            <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleSHSection('sh90d')">
                <div>
                    <h3 style="font-size:1.1rem;margin-bottom:4px;">⚔️ 90-Day War Plan</h3>
                    <span style="font-size:0.8rem;color:var(--text-muted);">${pct}% complete · ${daysRemaining} days remaining</span>
                </div>
                <span style="font-size:1.2rem;" id="sh90dArrow">▼</span>
            </div>
            <div id="sh90d" style="margin-top:16px;">
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">
                        <span>${completed}/${total} actions done</span>
                        <span>${pct}%</span>
                    </div>
                    <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                        <div style="height:100%;width:${pct}%;background:${pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'};border-radius:4px;transition:width 0.3s;"></div>
                    </div>
                </div>
                ${!cycleStart ? '<div style="margin-bottom:12px;"><button class="btn btn-primary btn-sm" onclick="startNewCycle()">🚀 Start New 90-Day Cycle</button></div>' : ''}
                <div id="sh90dList">
                    ${actions.map((a, i) => `
                        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px;background:var(--bg-tertiary);border-radius:8px;margin-bottom:8px;">
                            <input type="checkbox" ${a.done ? 'checked' : ''} onchange="toggleSH90Day(${i})" style="margin-top:3px;width:18px;height:18px;accent-color:var(--accent);">
                            <div style="flex:1;">
                                <div style="font-weight:600;${a.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${esc(a.action)}</div>
                                ${a.category ? '<span style="font-size:0.7rem;padding:2px 8px;background:var(--bg-secondary);border-radius:4px;color:var(--text-muted);">' + esc(a.category) + '</span>' : ''}
                            </div>
                            <button class="btn btn-sm btn-secondary" onclick="removeSH90Day(${i})" style="font-size:0.7rem;">✕</button>
                        </div>
                    `).join('')}
                </div>
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <input type="text" class="form-input" id="sh90dAction" placeholder="Action item (e.g., Complete PMBOK Ch 5-8)" style="flex:2;">
                    <select class="form-input" id="sh90dCat" style="flex:1;">
                        <option value="skill-sprint">Skill Sprint</option>
                        <option value="career-leverage">Career Leverage</option>
                        <option value="network">Network</option>
                        <option value="communication">Communication</option>
                        <option value="judgment-practice">Judgment Practice</option>
                        <option value="health">Health</option>
                    </select>
                    <button class="btn btn-primary btn-sm" onclick="addSH90Day()">+</button>
                </div>
            </div>
        </div>
    `;
}

function toggleSHSection(id) {
    const el = document.getElementById(id);
    const arrow = document.getElementById(id + 'Arrow');
    if (!el) return;
    if (el.style.display === 'none') { el.style.display = 'block'; if (arrow) arrow.textContent = '▼'; }
    else { el.style.display = 'none'; if (arrow) arrow.textContent = '▶'; }
}

function saveSH5Year() {
    const d = getStrategicData();
    d.fiveYear = {
        identity: (document.getElementById('sh5yrIdentity') || {}).value || '',
        capabilities: (document.getElementById('sh5yrCapabilities') || {}).value || '',
        position: (document.getElementById('sh5yrPosition') || {}).value || '',
        domains: (document.getElementById('sh5yrDomains') || {}).value || '',
        judgment: (document.getElementById('sh5yrJudgment') || {}).value || '',
        decisionEvidence: (document.getElementById('sh5yrDecisionEvidence') || {}).value || ''
    };
    saveStrategicData(d);
}

function addSH12Mo() {
    const target = document.getElementById('sh12moTarget').value.trim();
    if (!target) { toast('Enter target'); return; }
    const d = getStrategicData();
    if (!d.twelveMonth) d.twelveMonth = [];
    d.twelveMonth.push({
        target,
        metric: document.getElementById('sh12moMetric').value.trim(),
        category: document.getElementById('sh12moCat').value,
        done: false
    });
    saveStrategicData(d);
    renderStrategicHorizon();
    toast('Target added');
}

function toggleSH12Mo(i) {
    const d = getStrategicData();
    if (d.twelveMonth && d.twelveMonth[i]) { d.twelveMonth[i].done = !d.twelveMonth[i].done; saveStrategicData(d); renderStrategicHorizon(); }
}

function removeSH12Mo(i) {
    if (!confirm('Remove target?')) return;
    const d = getStrategicData();
    if (d.twelveMonth) { d.twelveMonth.splice(i, 1); saveStrategicData(d); renderStrategicHorizon(); }
}

function startNewCycle() {
    const d = getStrategicData();
    d.ninetyDayCycleStart = new Date().toISOString();
    d.ninetyDay = [];
    saveStrategicData(d);
    renderStrategicHorizon();
    toast('New 90-day cycle started!');
}

function addSH90Day() {
    const action = document.getElementById('sh90dAction').value.trim();
    if (!action) { toast('Enter action'); return; }
    const d = getStrategicData();
    if (!d.ninetyDay) d.ninetyDay = [];
    d.ninetyDay.push({ action, category: document.getElementById('sh90dCat').value, done: false });
    saveStrategicData(d);
    renderStrategicHorizon();
    toast('Action added');
}

function toggleSH90Day(i) {
    const d = getStrategicData();
    if (d.ninetyDay && d.ninetyDay[i]) { d.ninetyDay[i].done = !d.ninetyDay[i].done; saveStrategicData(d); renderStrategicHorizon(); }
}

function removeSH90Day(i) {
    if (!confirm('Remove action?')) return;
    const d = getStrategicData();
    if (d.ninetyDay) { d.ninetyDay.splice(i, 1); saveStrategicData(d); renderStrategicHorizon(); }
}

function addStrategicJudgmentTarget() {
    if (typeof PRACTICE === 'undefined') { toast('Practice engine unavailable'); return; }
    const signal = PRACTICE.getStrategicSignal();
    if (!signal.hasEvidence) { toast('Complete a few scenarios before creating an evidence-based target'); return; }
    const d = getStrategicData();
    if (!d.twelveMonth) d.twelveMonth = [];
    const target = 'Build reliable judgment in ' + signal.title;
    if (d.twelveMonth.some(item => item.target === target)) { toast('That judgment target already exists'); return; }
    d.twelveMonth.push({ target, metric:'20+ rated cases, calibration reviewed monthly, transfer evidence logged', category:'judgment', done:false, practiceSkillKey:signal.skillKey || '' });
    saveStrategicData(d);
    renderStrategicHorizon();
    toast('Evidence-based judgment target added');
}

function addStrategicJudgmentAction() {
    if (typeof PRACTICE === 'undefined') { toast('Practice engine unavailable'); return; }
    const signal = PRACTICE.getStrategicSignal();
    if (!signal.hasEvidence) { toast('Complete a few scenarios before creating an evidence-based action'); return; }
    const d = getStrategicData();
    if (!d.ninetyDay) d.ninetyDay = [];
    const action = 'Complete 3 confidence-rated ' + signal.title + ' cases weekly; classify errors and review the decision rule';
    if (d.ninetyDay.some(item => item.action === action)) { toast('That practice action already exists'); return; }
    d.ninetyDay.push({ action, category:'judgment-practice', done:false, practiceSkillKey:signal.skillKey || '' });
    saveStrategicData(d);
    renderStrategicHorizon();
    toast('90-day judgment practice added');
}
