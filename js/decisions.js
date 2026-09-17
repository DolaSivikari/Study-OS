// ==================== DECISION JOURNAL ====================
const DJ_KEY = K.decisions;
let editingDecisionId = null;
let decisionFilter = 'all'; // 'all', 'pending', 'reviewed'

function getDecisions() { return get(DJ_KEY) || []; }

function decisionErrorOptions(selected) {
    const types = typeof PRACTICE !== 'undefined' ? PRACTICE.ERROR_TYPES : {};
    const rows = Object.entries(types);
    return '<option value="">No dominant error / not classified</option>' + rows.map(([key, value]) => `<option value="${esc(key)}" ${selected === key ? 'selected' : ''}>${esc(value.label)}</option>`).join('');
}

function renderDecisions() {
    const decisions = getDecisions();
    const todayStr = today();
    const pendingReviews = decisions.filter(d => !d.reviewed && d.reviewDate && d.reviewDate <= todayStr);
    const container = document.getElementById('decisionsContainer');
    if (!container) return;

    // Filter tabs
    document.getElementById('decisionFilterTabs').innerHTML = `
        <button class="filter-btn ${decisionFilter==='all'?'active':''}" onclick="decisionFilter='all';renderDecisions()">All (${decisions.length})</button>
        <button class="filter-btn ${decisionFilter==='pending'?'active':''}" onclick="decisionFilter='pending';renderDecisions()">⏰ Reviews Due (${pendingReviews.length})</button>
        <button class="filter-btn ${decisionFilter==='reviewed'?'active':''}" onclick="decisionFilter='reviewed';renderDecisions()">✅ Reviewed</button>
    `;

    let filtered = decisions;
    if (decisionFilter === 'pending') filtered = pendingReviews;
    else if (decisionFilter === 'reviewed') filtered = decisions.filter(d => d.reviewed);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty" style="padding:40px 20px;"><div style="font-size:2.5rem;margin-bottom:12px;">⚖️</div><div style="font-size:1rem;margin-bottom:8px;">No decisions logged yet</div><div style="color:var(--text-muted);font-size:0.85rem;">Every major decision is a chance to calibrate your judgment. Log decisions now, review outcomes in 30-90 days.</div></div>';
        return;
    }

    container.innerHTML = filtered.sort((a,b) => (b.date||'').localeCompare(a.date||'')).map(d => {
        const isPending = !d.reviewed && d.reviewDate && d.reviewDate <= todayStr;
        const domainColors = { career:'var(--accent)', project:'var(--success)', financial:'var(--warning)', technical:'var(--purple)', personal:'var(--text-muted)' };
        const bc = domainColors[d.domain] || 'var(--border)';
        return `
        <div class="card" style="margin-bottom:12px;border-left:3px solid ${bc};cursor:pointer;${isPending ? 'background:rgba(239,68,68,0.05);' : ''}" onclick="editDecision('${d.id}')">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                <div>
                    <div style="font-weight:600;">${esc(d.title)}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${esc(d.date)} · ${esc(d.domain || 'general')}</div>
                </div>
                <div style="display:flex;gap:6px;">
                    ${isPending ? '<span style="font-size:0.7rem;padding:2px 8px;background:var(--danger);color:white;border-radius:4px;font-weight:600;">REVIEW DUE</span>' : ''}
                    ${d.reviewed ? '<span style="font-size:0.7rem;padding:2px 8px;background:var(--success);color:white;border-radius:4px;">REVIEWED</span>' : ''}
                </div>
            </div>
            <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Choice:</strong> ${esc(d.choice || '')}</div>
            ${d.outcome ? '<div style="font-size:0.85rem;color:var(--success);"><strong>Outcome:</strong> ' + esc(d.outcome) + '</div>' : ''}
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                ${d.reversibility ? '<span style="font-size:0.65rem;padding:2px 6px;background:var(--accent-light);border-radius:4px;color:var(--accent);">' + esc(d.reversibility) + '</span>' : ''}
                ${d.decisionType ? '<span style="font-size:0.65rem;padding:2px 6px;background:var(--bg-tertiary);border-radius:4px;color:var(--text-muted);">' + esc(d.decisionType) + '</span>' : ''}
                ${d.guardrail && d.guardrail.mode ? '<span class="badge ' + (d.guardrail.mode === 'slow-down' ? 'badge-danger' : d.guardrail.mode === 'decide' ? 'badge-good' : '') + '">' + esc(d.guardrail.mode === 'slow-down' ? 'slow-down review' : d.guardrail.mode === 'decide' ? 'reversible — decide' : 'balanced') + '</span>' : ''}
                ${d.confidence ? '<span style="font-size:0.65rem;padding:2px 6px;background:var(--bg-tertiary);border-radius:4px;color:var(--text-muted);">confidence ' + esc(String(d.confidence)) + '/5</span>' : ''}
                ${(d.tags||[]).map(t => '<span style="font-size:0.65rem;padding:2px 6px;background:var(--bg-tertiary);border-radius:4px;color:var(--text-muted);">' + esc(t) + '</span>').join('')}
            </div>
        </div>`;
    }).join('');
}

function openDecisionModal() {
    editingDecisionId = null;
    const body = document.getElementById('decisionModalBody');
    body.innerHTML = getDecisionFormHTML({});
    document.getElementById('decisionDeleteBtn').style.display = 'none';
    openModal('decisionModal');
    setTimeout(renderDecisionGuardrail, 0);
}

function editDecision(id) {
    const d = getDecisions().find(x => x.id === id);
    if (!d) return;
    editingDecisionId = id;
    const body = document.getElementById('decisionModalBody');
    body.innerHTML = getDecisionFormHTML(d);
    document.getElementById('decisionDeleteBtn').style.display = 'block';
    openModal('decisionModal');
    setTimeout(renderDecisionGuardrail, 0);
}

function getDecisionFormHTML(d) {
    const isPast = d.reviewDate && d.reviewDate <= today();
    const practiceSignal = typeof PRACTICE !== 'undefined' ? PRACTICE.getStrategicSignal() : null;
    return `
        ${practiceSignal ? `<div class="card" style="padding:12px;margin-bottom:14px;background:var(--accent-light);border-color:color-mix(in srgb,var(--accent) 35%,var(--border));"><div class="kicker">Current observed practice signal</div><strong>${esc(practiceSignal.title)}</strong><div style="font-size:.76rem;color:var(--text-secondary);margin-top:3px;">${esc(practiceSignal.detail)} Use this as a prompt, not a diagnosis.</div></div>` : ''}
        <div class="form-group"><label class="form-label" for="djTitle">Decision Title *</label><input type="text" class="form-input" id="djTitle" value="${esc(d.title || '')}" placeholder="e.g., Accept EllisDon interview vs wait for Aecon"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label" for="djDate">Date</label><input type="date" class="form-input" id="djDate" value="${d.date || today()}"></div>
            <div class="form-group"><label class="form-label" for="djDomain">Domain</label><select class="form-input" id="djDomain">
                <option value="career" ${d.domain==='career'?'selected':''}>Career</option>
                <option value="project" ${d.domain==='project'?'selected':''}>Project</option>
                <option value="financial" ${d.domain==='financial'?'selected':''}>Financial</option>
                <option value="technical" ${d.domain==='technical'?'selected':''}>Technical</option>
                <option value="personal" ${d.domain==='personal'?'selected':''}>Personal</option>
            </select></div>
        </div>

        <div class="form-row">
            <div class="form-group"><label class="form-label" for="djDecisionType">Decision Type</label><select class="form-input" id="djDecisionType">
                <option value="strategic" ${d.decisionType==='strategic'?'selected':''}>Strategic</option>
                <option value="operational" ${d.decisionType==='operational'?'selected':''}>Operational</option>
                <option value="technical" ${d.decisionType==='technical'?'selected':''}>Technical</option>
                <option value="people" ${d.decisionType==='people'?'selected':''}>People / Stakeholder</option>
                <option value="risk" ${d.decisionType==='risk'?'selected':''}>Risk / Governance</option>
            </select></div>
            <div class="form-group"><label class="form-label" for="djReversibility">Reversibility</label><select class="form-input" id="djReversibility" onchange="renderDecisionGuardrail()">
                <option value="two-way" ${!d.reversibility || d.reversibility==='two-way'?'selected':''}>Two-way — easy to reverse</option>
                <option value="costly" ${d.reversibility==='costly'?'selected':''}>Costly to reverse</option>
                <option value="one-way" ${d.reversibility==='one-way'?'selected':''}>One-way — hard to reverse</option>
            </select></div>
            <div class="form-group"><label class="form-label" for="djEvidenceQuality">Evidence Quality</label><select class="form-input" id="djEvidenceQuality" onchange="renderDecisionGuardrail()">
                ${[1,2,3,4,5].map(n => `<option value="${n}" ${parseInt(d.evidenceQuality || 3)===n?'selected':''}>${n}/5${n===1?' — weak':n===3?' — mixed':n===5?' — strong':''}</option>`).join('')}
            </select></div>
        </div>

        <div class="form-row">
            <div class="form-group"><label class="form-label" for="djImpact">Impact if wrong</label><select class="form-input" id="djImpact" onchange="renderDecisionGuardrail()"><option value="low" ${d.impact==='low'?'selected':''}>Low</option><option value="medium" ${!d.impact || d.impact==='medium'?'selected':''}>Medium</option><option value="high" ${d.impact==='high'?'selected':''}>High</option><option value="regulated" ${d.impact==='regulated'?'selected':''}>Regulated / safety-critical</option></select></div>
            <div class="form-group"><label class="form-label" for="djTimePressure">Time pressure</label><select class="form-input" id="djTimePressure" onchange="renderDecisionGuardrail()"><option value="calm" ${d.timePressure==='calm'?'selected':''}>Calm</option><option value="normal" ${!d.timePressure || d.timePressure==='normal'?'selected':''}>Normal</option><option value="urgent" ${d.timePressure==='urgent'?'selected':''}>Urgent</option></select></div>
            <div class="form-group"><label class="form-label" for="djDecisionState">Current decision state</label><select class="form-input" id="djDecisionState" onchange="renderDecisionGuardrail()"><option value="stuck" ${d.decisionState==='stuck'?'selected':''}>Stuck / over-deliberating</option><option value="balanced" ${!d.decisionState || d.decisionState==='balanced'?'selected':''}>Balanced</option><option value="rushing" ${d.decisionState==='rushing'?'selected':''}>Rushing / eager to close</option></select></div>
        </div>

        <div class="form-row">
            <div class="form-group"><label class="form-label" for="djSourceCount">Independent evidence sources</label><input type="number" min="0" max="20" class="form-input" id="djSourceCount" value="${Number.isFinite(Number(d.sourceCount)) ? esc(String(d.sourceCount)) : '0'}" oninput="renderDecisionGuardrail()"><div class="hint">Count independent sources—not repeated copies of one claim.</div></div>
            <label class="decision-expert-toggle"><input type="checkbox" id="djExpertConsulted" ${d.expertConsulted ? 'checked' : ''} onchange="renderDecisionGuardrail()"><span><strong>Qualified sounding board consulted</strong><small>Useful when consequence exceeds personal evidence.</small></span></label>
        </div>

        <div class="form-row">
            <div class="form-group"><label class="form-label" for="djConfidence">Confidence (at decision time)</label>
              <select class="form-input" id="djConfidence">
                <option value="1" ${parseInt(d.confidence||0)===1?'selected':''}>1 Low</option>
                <option value="2" ${parseInt(d.confidence||0)===2?'selected':''}>2</option>
                <option value="3" ${!d.confidence || parseInt(d.confidence||0)===3?'selected':''}>3</option>
                <option value="4" ${parseInt(d.confidence||0)===4?'selected':''}>4</option>
                <option value="5" ${parseInt(d.confidence||0)===5?'selected':''}>5 High</option>
              </select>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Used for calibration vs outcome review.</div>
            </div>
        </div>
        <div class="form-group"><label class="form-label" for="djContext">📋 Context (What's the situation?)</label><textarea class="form-textarea" id="djContext" rows="2" placeholder="Background, constraints, stakes...">${esc(d.context || '')}</textarea></div>
        <div class="form-group"><label class="form-label" for="djOptions">🔀 Options Considered</label><textarea class="form-textarea" id="djOptions" rows="2" placeholder="Option A: ... | Option B: ... | Option C: ... | What is the smallest REVERSIBLE step?">${esc(d.options || '')}</textarea><div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">If an option is reversible, it needs far less analysis. Deliberative (#1) treats everything as irreversible — most things aren\'t.</div></div>
        <div class="form-group"><label class="form-label" for="djStakeholders">👥 Stakeholder View</label><textarea class="form-textarea" id="djStakeholders" rows="2" placeholder="Who gains, loses, decides, implements, or sees evidence I do not?" oninput="renderDecisionGuardrail()">${esc(d.stakeholders || '')}</textarea></div>
        <div class="form-group"><label class="form-label" for="djRisks">⚠️ Risks & Assumptions</label><textarea class="form-textarea" id="djRisks" rows="2" placeholder="What could go wrong? What am I assuming to be true?">${esc(d.risks || '')}</textarea></div>
        <div class="form-group"><label class="form-label" for="djGovernance">📐 Governing requirement</label><input class="form-input" id="djGovernance" value="${esc(d.governance || '')}" placeholder="Applicable specification, policy, code, approval, or hold point" oninput="renderDecisionGuardrail()"></div>
        <div class="form-group"><label class="form-label" for="djPremortem">🧯 Pre-mortem</label><textarea class="form-textarea" id="djPremortem" rows="2" placeholder="It is 90 days later and this failed. What most plausibly caused the failure?">${esc(d.premortem || '')}</textarea></div>
        <div class="form-group"><label class="form-label" for="djDisconfirming">🔎 Disconfirming Evidence</label><textarea class="form-textarea" id="djDisconfirming" rows="2" placeholder="What fact would change my mind? What did I actively look for that argues against my preferred option?" oninput="renderDecisionGuardrail()">${esc(d.disconfirming || '')}</textarea></div>
        <div id="decisionGuardrailPanel" class="decision-guardrail" aria-live="polite"></div>
        <div class="form-group"><label class="form-label" for="djChoice">✅ Final Choice & Reasoning *</label><textarea class="form-textarea" id="djChoice" rows="2" placeholder="I chose to... because...">${esc(d.choice || '')}</textarea><div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Decision pace should be proportional to consequence, reversibility, and evidence. No universal information-percentage rule applies.</div></div>
        <div class="form-group"><label class="form-label" for="djTags">Tags</label><input type="text" class="form-input" id="djTags" value="${(d.tags || []).join(', ')}" placeholder="career, networking, risk"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label" for="djReviewDate">📅 Review Date</label><input type="date" class="form-input" id="djReviewDate" value="${d.reviewDate || ''}"><div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Set 30, 60, or 90 days out to review the outcome</div></div>
            <div class="form-group"><label class="form-label" for="djDecisionDeadline">⏱️ Decision Deadline</label><input type="datetime-local" class="form-input" id="djDecisionDeadline" value="${esc(d.decisionDeadline || '')}"><div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Especially useful when further analysis has diminishing returns.</div></div>
        </div>
        ${d.id ? `
            <div style="border-top:1px solid var(--border);margin-top:16px;padding-top:16px;">
                <h4 style="margin-bottom:8px;">📊 Outcome Review ${isPast ? '<span style="color:var(--danger);">(DUE)</span>' : ''}</h4>
                <div class="form-group"><label class="form-label" for="djOutcome">What actually happened?</label><textarea class="form-textarea" id="djOutcome" rows="2" placeholder="The actual result...">${esc(d.outcome || '')}</textarea></div>
                
                <div class="form-group"><label class="form-label" for="djOutcomeScore">Outcome Rating</label>
                  <select class="form-input" id="djOutcomeScore">
                    <option value="1" ${parseInt(d.outcomeScore||0)===1?'selected':''}>1 Poor</option>
                    <option value="2" ${parseInt(d.outcomeScore||0)===2?'selected':''}>2</option>
                    <option value="3" ${!d.outcomeScore || parseInt(d.outcomeScore||0)===3?'selected':''}>3</option>
                    <option value="4" ${parseInt(d.outcomeScore||0)===4?'selected':''}>4</option>
                    <option value="5" ${parseInt(d.outcomeScore||0)===5?'selected':''}>5 Excellent</option>
                  </select>
                </div>
<div class="form-group"><label class="form-label" for="djLearning">What did I learn? (calibration)</label><textarea class="form-textarea" id="djLearning" rows="2" placeholder="Where was I right? Where was I wrong? What would I do differently?">${esc(d.learning || '')}</textarea></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="djProcessQuality">Decision Process Quality</label><select class="form-input" id="djProcessQuality">${[1,2,3,4,5].map(n => `<option value="${n}" ${parseInt(d.processQuality || 3)===n?'selected':''}>${n}/5${n===1?' Poor':n===3?' Mixed':n===5?' Strong':''}</option>`).join('')}</select><div style="font-size:.72rem;color:var(--text-muted);margin-top:4px;">Judge the process separately from luck in the outcome.</div></div>
                    <div class="form-group"><label class="form-label" for="djReviewErrorType">Dominant Error Pattern</label><select class="form-input" id="djReviewErrorType">${decisionErrorOptions(d.reviewErrorType || '')}</select></div>
                </div>
                <div class="form-group"><label class="form-label" for="djSurprise">What surprised me?</label><textarea class="form-textarea" id="djSurprise" rows="2" placeholder="Which assumption, stakeholder response, or external event differed from the forecast?">${esc(d.surprise || '')}</textarea></div>
                <div class="form-group"><div class="form-label">Judgment Rating</div>
                    <div style="display:flex;gap:6px;" role="group" aria-label="Judgment rating">
                        <button type="button" class="btn btn-sm ${d.judgmentScore===1?'btn-primary':''}" onclick="setJudgment(1,this)" style="min-width:60px;">1 Bad</button>
                        <button type="button" class="btn btn-sm ${d.judgmentScore===2?'btn-primary':''}" onclick="setJudgment(2,this)" style="min-width:40px;">2</button>
                        <button type="button" class="btn btn-sm ${d.judgmentScore===3?'btn-primary':''}" onclick="setJudgment(3,this)" style="min-width:60px;">3 OK</button>
                        <button type="button" class="btn btn-sm ${d.judgmentScore===4?'btn-primary':''}" onclick="setJudgment(4,this)" style="min-width:40px;">4</button>
                        <button type="button" class="btn btn-sm ${d.judgmentScore===5?'btn-primary':''}" onclick="setJudgment(5,this)" style="min-width:60px;">5 Great</button>
                    </div>
                    <input type="hidden" id="djJudgment" value="${d.judgmentScore || ''}">
                </div>
            </div>
        ` : ''}
    `;
}

function setJudgment(n, button) {
    document.getElementById('djJudgment').value = n;
    document.querySelectorAll('#decisionModalBody [onclick^="setJudgment"]') .forEach(b => b.classList.remove('btn-primary'));
    if (button) button.classList.add('btn-primary');
}

function decisionCandidateFromForm() {
    return {
        decisionType:document.getElementById('djDecisionType')?.value || 'strategic',
        reversibility:document.getElementById('djReversibility')?.value || 'two-way',
        evidenceQuality:parseInt(document.getElementById('djEvidenceQuality')?.value || '3',10),
        impact:document.getElementById('djImpact')?.value || 'medium',
        timePressure:document.getElementById('djTimePressure')?.value || 'normal',
        decisionState:document.getElementById('djDecisionState')?.value || 'balanced',
        sourceCount:parseInt(document.getElementById('djSourceCount')?.value || '0',10),
        expertConsulted:!!document.getElementById('djExpertConsulted')?.checked,
        stakeholders:document.getElementById('djStakeholders')?.value || '',
        governance:document.getElementById('djGovernance')?.value || '',
        disconfirming:document.getElementById('djDisconfirming')?.value || ''
    };
}

function renderDecisionGuardrail() {
    const panel = document.getElementById('decisionGuardrailPanel');
    if (!panel) return null;
    const result = typeof evaluateDecisionGuardrail === 'function'
        ? evaluateDecisionGuardrail(decisionCandidateFromForm())
        : { mode:'balanced', title:'Balanced: keep the process proportional', reasons:['Decision guardrail engine unavailable.'], actions:[] };
    const profileEnabled = typeof profileIsHypothesisEnabled === 'function' && profileIsHypothesisEnabled('decision_dual_mode');
    const density = typeof profileGuidanceDensity === 'function' ? profileGuidanceDensity() : 'balanced';
    const head = `<div class="decision-guardrail-head"><span class="decision-guardrail-icon">${result.mode === 'slow-down' ? '!' : result.mode === 'decide' ? '✓' : '◇'}</span><div><strong>${esc(result.title)}</strong><small>${profileEnabled ? 'Context-sensitive guardrail informed by the two-mode decision hypothesis.' : 'Risk-based decision-process check.'}</small></div></div>`;
    const compact = `<div class="decision-guardrail-compact-action">${esc(result.actions[0] || 'Keep the process proportional to consequence and reversibility.')}</div>`;
    const detail = `<div class="decision-guardrail-grid"><div><span>Why</span><ul>${result.reasons.map(reason => `<li>${esc(reason)}</li>`).join('')}</ul></div><div><span>Next check</span><ul>${result.actions.map(action => `<li>${esc(action)}</li>`).join('')}</ul></div></div>`;
    const coaching = density === 'coaching' && profileEnabled ? `<div class="decision-guardrail-coaching"><strong>Hypothesis under test:</strong> ${esc((PROFILE_HYPOTHESES.find(item => item.id === 'decision_dual_mode') || {}).hypothesis || '')}<br><strong>Observed so far:</strong> ${esc(profileObservedEvidence('decision_dual_mode'))}</div>` : '';
    panel.className = 'decision-guardrail is-' + result.mode + ' density-' + density;
    panel.innerHTML = head + (density === 'compact' ? compact : detail) + coaching;
    return result;
}

function saveDecision() {
    const title = document.getElementById('djTitle').value.trim();
    const choice = document.getElementById('djChoice').value.trim();
    if (!title || !choice) { toast('Title and choice required'); return; }
    const tagsStr = document.getElementById('djTags').value.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

    const guardrailCandidate = decisionCandidateFromForm();
    const guardrail = typeof evaluateDecisionGuardrail === 'function' ? evaluateDecisionGuardrail(guardrailCandidate) : null;
    const entry = {
        title,
        date: document.getElementById('djDate').value || today(),
        domain: document.getElementById('djDomain').value,
        decisionType: document.getElementById('djDecisionType').value,
        reversibility: document.getElementById('djReversibility').value,
        evidenceQuality: parseInt(document.getElementById('djEvidenceQuality').value || '3', 10),
        impact: guardrailCandidate.impact,
        timePressure: guardrailCandidate.timePressure,
        decisionState: guardrailCandidate.decisionState,
        sourceCount: guardrailCandidate.sourceCount,
        expertConsulted: guardrailCandidate.expertConsulted,
        context: document.getElementById('djContext').value.trim(),
        options: document.getElementById('djOptions').value.trim(),
        stakeholders: document.getElementById('djStakeholders').value.trim(),
        risks: document.getElementById('djRisks').value.trim(),
        governance: document.getElementById('djGovernance').value.trim(),
        premortem: document.getElementById('djPremortem').value.trim(),
        disconfirming: document.getElementById('djDisconfirming').value.trim(),
        choice,
        tags,
        reviewDate: document.getElementById('djReviewDate').value || '',
        decisionDeadline: document.getElementById('djDecisionDeadline').value || '',
        confidence: parseInt(document.getElementById('djConfidence')?.value || '3',10),
        guardrail,
        updated: today()
    };

    // Outcome fields (only if editing)
    const outcomeEl = document.getElementById('djOutcome');
    if (outcomeEl) {
        entry.outcome = outcomeEl.value.trim();
        entry.outcomeScore = parseInt(document.getElementById('djOutcomeScore')?.value || '3',10);
        entry.reviewedAt = today();
        entry.learning = (document.getElementById('djLearning') || {}).value?.trim() || '';
        entry.processQuality = parseInt(document.getElementById('djProcessQuality')?.value || '3', 10);
        entry.reviewErrorType = document.getElementById('djReviewErrorType')?.value || '';
        entry.surprise = (document.getElementById('djSurprise') || {}).value?.trim() || '';
        const jv = document.getElementById('djJudgment')?.value;
        if (jv) { entry.judgmentScore = parseInt(jv); entry.reviewed = true; }
    }

    const decisions = getDecisions();
    if (editingDecisionId) {
        const i = decisions.findIndex(x => x.id === editingDecisionId);
        if (i !== -1) Object.assign(decisions[i], entry);
    } else {
        decisions.push({ id: uid(), ...entry, created: today() });
    }
    set(DJ_KEY, decisions);
    closeModal('decisionModal');
    renderDecisions();
    toast('Decision saved'); if(typeof refreshDashboard==='function') refreshDashboard();
}

function deleteDecision() {
    if (!editingDecisionId || !confirm('Delete decision?')) return;
    set(DJ_KEY, getDecisions().filter(d => d.id !== editingDecisionId));
    closeModal('decisionModal');
    renderDecisions();
    toast('Deleted');
}
