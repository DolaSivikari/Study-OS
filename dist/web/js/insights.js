// ==================== INSIGHTS ====================
// Enhanced with Phase 7: Calibration Insight + Learning Quality Insight

var currentInsightView = 'overview';
function showInsight(v){
    currentInsightView = v || 'overview';
    document.getElementById('insightTabs').innerHTML='<button class="filter-btn '+(v==='overview'?'active':'')+'" onclick="showInsight(\'overview\')">Overview</button><button class="filter-btn '+(v==='learning'?'active':'')+'" onclick="showInsight(\'learning\')">🧠 Learning</button><button class="filter-btn '+(v==='judgment'?'active':'')+'" onclick="showInsight(\'judgment\')">⚖️ Judgment</button><button class="filter-btn '+(v==='execution'?'active':'')+'" onclick="showInsight(\'execution\')">◇ Execution</button><button class="filter-btn '+(v==='calibration'?'active':'')+'" onclick="showInsight(\'calibration\')">🎯 Calibration</button><button class="filter-btn '+(v==='quality'?'active':'')+'" onclick="showInsight(\'quality\')">📊 Quality</button><button class="filter-btn '+(v==='study'?'active':'')+'" onclick="showInsight(\'study\')">Study</button><button class="filter-btn '+(v==='discipline'?'active':'')+'" onclick="showInsight(\'discipline\')">Discipline</button><button class="filter-btn '+(v==='energy'?'active':'')+'" onclick="showInsight(\'energy\')">Energy</button><button class="filter-btn '+(v==='pomodoro'?'active':'')+'" onclick="showInsight(\'pomodoro\')">Pomodoro</button>';
    const time=arr(K.time),goals=arr(K.goals),disc=get(K.discipline)||{},protocol=get(K.protocol)||{};
    const content=document.getElementById('insightsContent');
    
    if(v==='learning'){
        renderLearningInsight(content);
    }else if(v==='judgment'){
        renderJudgmentInsight(content);
    }else if(v==='execution'){
        renderExecutionInsight(content);
    }else if(v==='calibration'){
        renderCalibrationInsight(content);
    }else if(v==='quality'){
        renderQualityInsight(content, time);
    }else if(v==='overview'){
        const totalH=time.reduce((s,e)=>s+(parseFloat(e.duration)||0),0);
        const ws=new Date();ws.setDate(ws.getDate()-ws.getDay());
        const weekH=time.filter(e=>e.date>=fmtDate(ws)).reduce((s,e)=>s+(parseFloat(e.duration)||0),0);
        const cards = arr(K.flashcards);
        const contacts = arr(K.contacts);
        content.innerHTML=`
            <div class="grid grid-3" style="margin-bottom:16px;">
                <div class="stat"><div class="stat-value">${totalH.toFixed(0)}h</div><div class="stat-label">Total Hours</div></div>
                <div class="stat"><div class="stat-value">${weekH.toFixed(1)}h</div><div class="stat-label">This Week</div></div>
                <div class="stat"><div class="stat-value">${calcDisciplineStreak()}</div><div class="stat-label">Day Streak</div></div>
            </div>
            <div class="grid grid-4" style="margin-bottom:16px;">
                <div class="stat"><div class="stat-value">${goals.length}</div><div class="stat-label">Goals</div></div>
                <div class="stat"><div class="stat-value">${goals.filter(g=>g.completed).length}</div><div class="stat-label">Completed</div></div>
                <div class="stat"><div class="stat-value">${cards.length}</div><div class="stat-label">Flashcards</div></div>
                <div class="stat"><div class="stat-value">${contacts.length}</div><div class="stat-label">Contacts</div></div>
            </div>
        `;
    }else if(v==='study'){
        const studyH=time.filter(e=>e.category==='study').reduce((s,e)=>s+(parseFloat(e.duration)||0),0);
        const byDomain={};time.filter(e=>e.domain).forEach(e=>{byDomain[e.domain]=(byDomain[e.domain]||0)+(parseFloat(e.duration)||0);});
        content.innerHTML='<div class="stat" style="margin-bottom:16px;"><div class="stat-value">'+studyH.toFixed(1)+'h</div><div class="stat-label">Total Study</div></div>'+Object.entries(byDomain).sort((a,b)=>b[1]-a[1]).map(([d,h])=>'<div class="list-item"><div class="list-item-content"><div class="list-item-title">'+esc(d)+'</div></div><span style="color:var(--accent);font-weight:600;">'+h.toFixed(1)+'h</span></div>').join('');
    }else if(v==='discipline'){
        const last7=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);last7.push(fmtDate(d));}
        const scores=last7.map(ds=>{const day=disc[ds]||{};return {date:ds,score:DISCIPLINES.reduce((s,x)=>s+(day[x.id]||0),0)};});
        const avg=scores.reduce((s,x)=>s+x.score,0)/7;
        content.innerHTML=`
            <div class="stat" style="margin-bottom:16px;"><div class="stat-value">${avg.toFixed(0)}/50</div><div class="stat-label">7-Day Average</div></div>
            ${scores.map(s=>`
                <div class="list-item">
                    <span style="min-width:80px;font-size:0.8rem;">${new Date(s.date+'T12:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</span>
                    <div style="flex:1;"><div class="progress" style="height:8px;"><div class="progress-fill" style="width:${(s.score/50)*100}%"></div></div></div>
                    <span style="min-width:40px;text-align:right;font-weight:600;color:var(--accent);">${s.score}</span>
                </div>
            `).join('')}
        `;
    }else if(v==='energy'){
        // Energy / Mood Correlation Analysis
        const last14=[];for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);last14.push(fmtDate(d));}
        const energyData = last14.map(ds => {
            const proto = protocol[ds];
            const dayDisc = disc[ds] || {};
            const dayHours = time.filter(t => t.date === ds).reduce((s, t) => s + (parseFloat(t.duration) || 0), 0);
            const discScore = DISCIPLINES.reduce((s, x) => s + (dayDisc[x.id] || 0), 0);
            return {
                date: ds,
                energy: proto?.energy || null,
                hours: dayHours,
                discipline: discScore
            };
        }).filter(d => d.energy !== null);
        
        // Calculate correlations
        const avgEnergy = energyData.length ? (energyData.reduce((s, d) => s + d.energy, 0) / energyData.length).toFixed(1) : '-';
        const highEnergyDays = energyData.filter(d => d.energy >= 7);
        const lowEnergyDays = energyData.filter(d => d.energy <= 4);
        const avgHighHours = highEnergyDays.length ? (highEnergyDays.reduce((s, d) => s + d.hours, 0) / highEnergyDays.length).toFixed(1) : '-';
        const avgLowHours = lowEnergyDays.length ? (lowEnergyDays.reduce((s, d) => s + d.hours, 0) / lowEnergyDays.length).toFixed(1) : '-';
        
        content.innerHTML = `
            <div class="grid grid-3" style="margin-bottom:16px;">
                <div class="stat"><div class="stat-value">${avgEnergy}</div><div class="stat-label">Avg Energy (14d)</div></div>
                <div class="stat"><div class="stat-value">${avgHighHours}h</div><div class="stat-label">High Energy Avg</div></div>
                <div class="stat"><div class="stat-value">${avgLowHours}h</div><div class="stat-label">Low Energy Avg</div></div>
            </div>
            <div style="margin-bottom:16px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Energy vs Productivity (14 Days)</div>
                ${energyData.map(d => `
                    <div class="list-item" style="padding:8px 0;">
                        <span style="min-width:60px;font-size:0.75rem;">${new Date(d.date+'T12:00').toLocaleDateString('en-US',{weekday:'short'})}</span>
                        <span style="min-width:70px;font-weight:600;color:${d.energy >= 7 ? 'var(--success)' : d.energy <= 4 ? 'var(--danger)' : 'var(--warning)'};">⚡ ${d.energy}/10</span>
                        <div style="flex:1;display:flex;gap:8px;align-items:center;">
                            <div class="progress" style="flex:1;height:6px;"><div class="progress-fill" style="width:${Math.min(d.hours * 10, 100)}%;background:var(--accent);"></div></div>
                            <span style="font-size:0.75rem;color:var(--text-muted);min-width:35px;">${d.hours.toFixed(1)}h</span>
                        </div>
                        <span style="min-width:50px;text-align:right;font-size:0.8rem;color:${d.discipline >= 35 ? 'var(--success)' : 'var(--text-muted)'}">${d.discipline}/50</span>
                    </div>
                `).join('')}
            </div>
            <div class="card" style="background:var(--bg-tertiary);padding:14px;">
                <div style="font-weight:600;margin-bottom:8px;">💡 Insight</div>
                <div style="font-size:0.9rem;color:var(--text-secondary);">
                    ${avgHighHours !== '-' && avgLowHours !== '-' && parseFloat(avgHighHours) > parseFloat(avgLowHours) 
                        ? `You're ${((parseFloat(avgHighHours) / parseFloat(avgLowHours) - 1) * 100).toFixed(0)}% more productive on high-energy days. Protect your sleep and energy!` 
                        : 'Log more protocol data to see energy-productivity correlations.'}
                </div>
            </div>
        `;
    }else if(v==='pomodoro'){
        const stats = get(K.pomodoroStats) || {};
        const last7=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);last7.push(fmtDate(d));}
        const weekTotal = last7.reduce((s, d) => s + (stats[d] || 0), 0);
        const todayCount = stats[today()] || 0;
        
        content.innerHTML = `
            <div class="grid grid-3" style="margin-bottom:16px;">
                <div class="stat"><div class="stat-value">${todayCount}</div><div class="stat-label">Today</div></div>
                <div class="stat"><div class="stat-value">${weekTotal}</div><div class="stat-label">This Week</div></div>
                <div class="stat"><div class="stat-value">${(weekTotal * 25 / 60).toFixed(1)}h</div><div class="stat-label">Focus Time</div></div>
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Last 7 Days</div>
            ${last7.map(d => `
                <div class="list-item">
                    <span style="min-width:80px;font-size:0.8rem;">${new Date(d+'T12:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</span>
                    <div style="flex:1;display:flex;gap:4px;">
                        ${Array(stats[d] || 0).fill(0).map(() => '<div style="width:12px;height:12px;background:var(--accent);border-radius:3px;"></div>').join('')}
                        ${!stats[d] ? '<span style="color:var(--text-muted);font-size:0.8rem;">-</span>' : ''}
                    </div>
                    <span style="min-width:60px;text-align:right;font-weight:600;color:var(--accent);">${stats[d] || 0} 🍅</span>
                </div>
            `).join('')}
        `;
    }
}

function renderExecutionInsight(container) {
    const summary = typeof profileExecutionSummary === 'function' ? profileExecutionSummary(90) : { guardrails:0, slow:0, decide:0, balanced:0, quality:0, verified:0, repeats:0, commDays:0, qualityCommDays:0 };
    const quality = typeof qualityReviewSummary === 'function' ? qualityReviewSummary(90) : { open:0, overdue:0, verified:0, repeats:0 };
    const decisions = arr(K.decisions).filter(row => row.guardrail && row.guardrail.mode).slice().sort((a,b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0,8);
    const communication = get(K.commTracker) || {};
    const recentDate = sinceDaysAgo(90);
    const outcomeRows = Object.keys(communication).filter(date => date >= recentDate && Number(communication[date]?.outcome) >= 1).map(date => Number(communication[date].outcome));
    const averageOutcome = outcomeRows.length ? (outcomeRows.reduce((sum,value) => sum + value,0) / outcomeRows.length).toFixed(1) : '—';
    const profile = typeof getAdaptiveProfile === 'function' ? getAdaptiveProfile() : { enabled:false, hypotheses:{} };
    const useful = typeof PROFILE_HYPOTHESES !== 'undefined' ? PROFILE_HYPOTHESES.filter(item => profileHypothesisState(item.id).status === 'useful').length : 0;
    const disabled = typeof PROFILE_HYPOTHESES !== 'undefined' ? PROFILE_HYPOTHESES.filter(item => profileHypothesisState(item.id).status === 'not-me').length : 0;

    container.innerHTML = `
      <div class="card" style="margin-bottom:14px;background:linear-gradient(135deg,var(--accent-light),var(--surface-1));">
        <div class="practice-panel-head"><div><span class="kicker">Observed execution · 90 days</span><h3 style="margin-top:4px;">Personality prompts answer to behavior</h3><p class="muted" style="margin-top:5px;">These are workflow observations—not trait scores, neurological measurements, or performance grades.</p></div><button class="btn btn-secondary" onclick="go('profilelab')">Profile Lab</button></div>
      </div>
      <div class="practice-metric-grid">
        <div class="stat"><div class="stat-value">${summary.slow}</div><div class="stat-label">Slow-down signals</div></div>
        <div class="stat"><div class="stat-value">${summary.decide}</div><div class="stat-label">Decide-now signals</div></div>
        <div class="stat"><div class="stat-value">${quality.verified}</div><div class="stat-label">Controls verified</div><small>${quality.open} still open</small></div>
        <div class="stat"><div class="stat-value">${averageOutcome}</div><div class="stat-label">Communication outcome</div><small>${outcomeRows.length} rated day(s)</small></div>
      </div>
      <div class="grid grid-2" style="gap:14px;margin-top:14px;">
        <section class="card">
          <div class="practice-panel-head"><div><span class="kicker">Decision pace</span><h4>Consequence × evidence × reversibility</h4></div><button class="btn btn-primary btn-sm" onclick="go('decisions')">Open journal</button></div>
          ${decisions.length ? decisions.map(row => `<button class="quality-review-row" onclick="go('decisions');setTimeout(function(){editDecision('${esc(row.id)}')},0)"><span class="quality-review-mark ${row.guardrail.mode === 'slow-down' ? 'is-repeat' : ''}"></span><span><strong>${esc(row.title)}</strong><small>${esc(row.date || '')} · ${esc(row.impact || 'medium')} · ${esc(row.reversibility || 'two-way')}</small></span><span class="badge ${row.guardrail.mode === 'slow-down' ? 'badge-danger' : row.guardrail.mode === 'decide' ? 'badge-good' : ''}">${esc(row.guardrail.mode)}</span></button>`).join('') : '<div class="empty compact">No guardrail-rated decisions yet.</div>'}
        </section>
        <div style="display:grid;gap:14px;align-content:start;">
          <section class="card"><div class="practice-panel-head"><div><span class="kicker">Quality assurance</span><h4>Recurrence controls</h4></div><button class="btn btn-secondary btn-sm" onclick="go('journal');setTimeout(openQualityReviewModal,0)">New review</button></div><div class="list-item"><span>Open verification</span><strong>${quality.open}</strong></div><div class="list-item"><span>Overdue verification</span><strong>${quality.overdue}</strong></div><div class="list-item"><span>Repeat issues</span><strong>${quality.repeats}</strong></div></section>
          <section class="card"><div class="practice-panel-head"><div><span class="kicker">Adaptive profile</span><h4>User-controlled hypotheses</h4></div></div><div class="list-item"><span>Adaptive prompts</span><strong>${profile.enabled ? 'On' : 'Off'}</strong></div><div class="list-item"><span>Marked useful</span><strong>${useful}</strong></div><div class="list-item"><span>Disabled as “not me”</span><strong>${disabled}</strong></div><div class="list-item"><span>Communication quality days</span><strong>${summary.qualityCommDays}/${summary.commDays}</strong></div></section>
        </div>
      </div>`;
}

function openJudgmentPractice(skillKey) {
    go('pmptools');
    // V56 (audit R10): pmp-tools.js is lazy-loaded. Its top-level `let`
    // state (pmpToolView) does not exist until the module loads, so the
    // mutation must happen INSIDE the ensure callback.
    var run = function(){
        pmpToolView = 'scenario';
        renderPmpTools();
        if (skillKey) practiceQueueScenario(skillKey);
    };
    setTimeout(function(){
        if (typeof studyosEnsureModule === 'function') studyosEnsureModule('pmptools', function(ok){ if (ok) run(); });
        else run();
    }, 0);
}

function renderJudgmentInsight(container) {
    if (typeof PRACTICE === 'undefined') {
        container.innerHTML = '<div class="card">Practice engine unavailable. Run Diagnostics for the failing dependency.</div>';
        return;
    }
    const summary = PRACTICE.getSummary();
    const calibration = summary.calibration;
    const skills = summary.skills.slice(0, 10);
    const errors = Object.entries(summary.errors).sort((a,b) => b[1] - a[1]);
    const decisions = arr(K.decisions);
    const reviewedDecisions = decisions.filter(d => d.reviewed).length;
    const decisionCalibration = typeof LEARN !== 'undefined' && LEARN.getDecisionCalibrationScore ? LEARN.getDecisionCalibrationScore(180) : null;
    const coverage = summary.coverage;

    container.innerHTML = `
        <div class="card" style="margin-bottom:14px;background:linear-gradient(135deg,var(--accent-light),var(--surface-1));">
            <div class="practice-panel-head"><div><span class="kicker">Observed judgment</span><h3 style="margin-top:4px;">From answer → error pattern → next deliberate rep</h3><p class="muted" style="margin-top:5px;">Scenario confidence is committed before feedback. Decision Journal calibration remains separate and is evaluated only after delayed outcome review.</p></div><button class="btn btn-primary" onclick="openJudgmentPractice('')">Practice now</button></div>
        </div>
        <div class="practice-metric-grid">
            <div class="stat"><div class="stat-value">${summary.accuracy === null ? '—' : summary.accuracy + '%'}</div><div class="stat-label">Scenario accuracy</div></div>
            <div class="stat"><div class="stat-value">${calibration.score === null ? '—' : calibration.score + '%'}</div><div class="stat-label">Confidence calibration</div><small>${esc(calibration.label)}</small></div>
            <div class="stat"><div class="stat-value">${summary.due.length}</div><div class="stat-label">Weak skills due</div></div>
            <div class="stat"><div class="stat-value">${decisionCalibration === null ? '—' : Math.round(decisionCalibration) + '%'}</div><div class="stat-label">Decision calibration</div><small>${reviewedDecisions} reviewed</small></div>
        </div>
        <div class="judgment-insight-grid">
            <section class="card">
                <div class="practice-panel-head"><div><span class="kicker">Skill evidence</span><h4>Weakest first</h4></div><span class="badge">${skills.length} observed</span></div>
                ${skills.length ? `<div class="judgment-skill-table">${skills.map(item => `
                    <button class="judgment-skill-row" style="border-top:0;border-left:0;border-right:0;background:transparent;color:inherit;text-align:left;cursor:pointer;" onclick="openJudgmentPractice('${esc(item.skillKey)}')">
                        <div><strong>${esc(item.skillLabel)}</strong><small style="display:block;">${esc(item.task)} · ${esc(item.eco)}</small></div>
                        <div><strong>${Math.round(item.accuracy * 100)}%</strong><small style="display:block;">accuracy</small></div>
                        <div><div class="progress" style="height:7px;"><div class="progress-fill" style="width:${item.mastery}%;background:${item.mastery >= 75 ? 'var(--success)' : item.mastery >= 55 ? 'var(--warning)' : 'var(--danger)'};"></div></div><small>${item.attempts} rated attempt${item.attempts === 1 ? '' : 's'}</small></div>
                        <strong>${item.mastery}</strong>
                    </button>
                `).join('')}</div>` : '<div class="empty">No skill evidence yet. Complete confidence-rated scenarios first.</div>'}
            </section>
            <div style="display:grid;gap:14px;align-content:start;">
                <section class="card">
                    <div class="practice-panel-head"><div><span class="kicker">Error taxonomy</span><h4>What is causing misses</h4></div></div>
                    ${errors.length ? errors.map(([key,count]) => {
                        const item = PRACTICE.ERROR_TYPES[key] || { label:key, action:'' };
                        const totalErrors = errors.reduce((sum,row) => sum + row[1], 0);
                        const pct = totalErrors ? Math.round(count / totalErrors * 100) : 0;
                        return `<div class="list-item"><div class="list-item-content"><div class="list-item-title">${esc(item.label)}</div><div class="muted">${esc(item.action)}</div></div><span class="badge">${count} · ${pct}%</span></div>`;
                    }).join('') : '<div class="empty compact">No classified errors yet.</div>'}
                </section>
                <section class="card">
                    <div class="practice-panel-head"><div><span class="kicker">ECO exposure</span><h4>Actual / target</h4></div></div>
                    ${['People','Process','Business Environment'].map(domain => {
                        const item = coverage[domain];
                        const actual = Math.round((item.pct || 0) * 100);
                        const target = Math.round(item.target * 100);
                        return `<div style="display:grid;grid-template-columns:130px 1fr 72px;gap:8px;align-items:center;margin-bottom:9px;"><span style="font-size:.78rem;">${esc(domain)}</span><div class="progress" style="height:7px;"><div class="progress-fill" style="width:${actual}%;"></div></div><small class="muted">${actual}% / ${target}%</small></div>`;
                    }).join('')}
                    <div class="hint">Sampling corrects future exposure toward the official 33/41/26 domain mix; weak-skill practice takes priority when due.</div>
                </section>
            </div>
        </div>
    `;
}


// ==================== V11 v7: LEARNING INSIGHT ====================
function renderLearningInsight(container){
    if (typeof LEARN === 'undefined') {
        container.innerHTML = '<div class="card" style="padding:18px;"><div style="font-weight:700;">Learning engine not loaded.</div></div>';
        return;
    }

    const li = LEARN.getLearningIntegrityIndex();
    const drift = LEARN.getDriftStatus ? LEARN.getDriftStatus() : { isDrifting:false };
    const calib = (LEARN.getCalibrationComposite ? LEARN.getCalibrationComposite() : { score: null, parts:{} });
    const overdueDecisions = (typeof getOverdueDecisionReviews === 'function') ? getOverdueDecisionReviews().length : 0;
    const unscheduledDecisions = (typeof getUnscheduledDecisionReviews === 'function') ? getUnscheduledDecisionReviews().length : 0;

    container.innerHTML = `
        <div class="grid grid-3" style="margin-bottom:16px;">
            <div class="stat"><div class="stat-value">${li.index}</div><div class="stat-label">Integrity Index</div></div>
            <div class="stat"><div class="stat-value">${li.momentum.normalized}</div><div class="stat-label">Momentum (14d)</div></div>
            <div class="stat"><div class="stat-value">${calib.score===null?'—':calib.score+'%'}</div><div class="stat-label">Calibration</div></div>
        </div>

        <div class="card" style="padding:14px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <div style="font-weight:800;">📈 Momentum Trend (30d)</div>
                <span class="badge">stacked by domain</span>
            </div>
            <canvas id="insightsMomentumChart" style="width:100%;height:160px;display:block;"></canvas>
            <div class="hint" style="margin-top:10px;">Bars are weighted reps (depth + friction). Use this to see consistency, not perfection.</div>
        </div>

        <div class="grid grid-2" style="gap:16px;">
            <div class="card" style="padding:14px;">
                <div style="font-weight:800;margin-bottom:10px;">⚖️ Domain Balance (7d)</div>
                ${['technical','strategic','leadership'].map(d=>{
                    const pct = li.allocation.pct[d]||0;
                    const hrs = (li.allocation.hours[d]||0).toFixed(1);
                    const label = d.charAt(0).toUpperCase()+d.slice(1);
                    const badge = pct<25?'badge-warn':pct>45?'badge-danger':'badge-good';
                    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                        <div>${label}</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <span class="badge ${badge}">${pct}%</span>
                            <span class="muted" style="font-size:0.85rem;">${hrs}h</span>
                        </div>
                    </div>`;
                }).join('')}
                <div class="hint" style="margin-top:10px;">${drift.insufficientData ? 'Log at least 1 study hour in both 7-day windows before drift is assessed.' : drift.isDrifting ? 'Two-week drift detected. System will push corrective drills.' : 'Balance is stable.'}</div>
            </div>

            <div class="card" style="padding:14px;">
                <div style="font-weight:800;margin-bottom:10px;">🎯 Calibration Breakdown</div>
                <div class="list-item" style="padding:10px 0;">
                    <div class="list-item-content"><div class="list-item-title">SRS Calibration</div></div>
                    <span style="font-weight:700;color:var(--accent);">${calib.parts?.srs===null||calib.parts?.srs===undefined?'—':Math.round(calib.parts.srs)+'%'}</span>
                </div>
                <div class="list-item" style="padding:10px 0;">
                    <div class="list-item-content"><div class="list-item-title">Drill Quality (14d)</div></div>
                    <span style="font-weight:700;color:var(--accent);">${calib.parts?.drillQuality===null||calib.parts?.drillQuality===undefined?'—':Math.round(calib.parts.drillQuality)+'%'}</span>
                </div>
                <div class="list-item" style="padding:10px 0;">
                    <div class="list-item-content"><div class="list-item-title">Scenario Judgment</div></div>
                    <span style="font-weight:700;color:var(--accent);">${calib.parts?.practice===null||calib.parts?.practice===undefined?'—':Math.round(calib.parts.practice)+'%'}</span>
                </div>
                <div class="list-item" style="padding:10px 0;">
                    <div class="list-item-content"><div class="list-item-title">Decision Calibration</div></div>
                    <span style="font-weight:700;color:var(--accent);">${calib.parts?.decision===null||calib.parts?.decision===undefined?'—':Math.round(calib.parts.decision)+'%'}</span>
                </div>
                ${(overdueDecisions > 0 || unscheduledDecisions > 0) ? `
                <div class="hint" style="margin-top:6px;">
                    ${overdueDecisions > 0 ? `🎯 ${overdueDecisions} decision(s) due for outcome review. ` : ''}
                    ${unscheduledDecisions > 0 ? `${unscheduledDecisions} decision(s) have no review date set, so they'll never count toward Decision Calibration. ` : ''}
                </div>` : ''}
                <div style="margin-top:10px;display:flex;gap:10px;">
                    <button class="btn btn-secondary" style="flex:1;" onclick="go('doctrine')">Run Drill</button>
                    <button class="btn btn-secondary" style="flex:1;" onclick="openJudgmentPractice('')">Practice Judgment</button>
                    <button class="btn btn-primary" style="flex:1;" onclick="go('flashcards')">Review SRS</button>
                    ${(overdueDecisions > 0 || unscheduledDecisions > 0) ? `<button class="btn btn-primary" style="flex:1;" onclick="go('decisions')">Review Decisions</button>` : ''}
                </div>
            </div>
        </div>
    `;

    // Draw chart after DOM paints
    setTimeout(() => {
        const canvas = document.getElementById('insightsMomentumChart');
        if(!canvas || !LEARN.getMomentumSeries) return;

        const ctx = canvas.getContext('2d');
        const series = LEARN.getMomentumSeries(30);
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width || 420;
        const h = rect.height || 160;
        canvas.width = Math.max(320, Math.floor(w * dpr));
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(dpr,dpr);
        ctx.clearRect(0,0,w,h);

        const max = Math.max(1, ...series.map(d => d.total));
        const pad = 10;
        const innerW = w - pad*2;
        const innerH = h - pad*2;
        const barW = innerW / series.length;
        const doms = ['technical','strategic','leadership'];
        const css = getComputedStyle(document.documentElement);
        const colors = [
          css.getPropertyValue('--accent').trim() || '#4f8cff',
          css.getPropertyValue('--success').trim() || '#22c55e',
          css.getPropertyValue('--warning').trim() || '#f59e0b'
        ];

        ctx.globalAlpha = 0.25;
        ctx.fillStyle = css.getPropertyValue('--border').trim() || '#2a2a2a';
        for(let i=1;i<=3;i++){
          const y = pad + innerH*(i/4);
          ctx.fillRect(pad, y, innerW, 1);
        }
        ctx.globalAlpha = 1;

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
    }, 30);
}


// ==================== PHASE 7: CALIBRATION INSIGHT ====================

function renderCalibrationInsight(container) {
    const detailKey = K.cardReviewDetails;
    const reviews = get(detailKey) || [];
    const withConfidence = reviews.filter(r => r.confidence && r.confidence > 0);
    
    if (withConfidence.length < 5) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:40px;">
                <div style="font-size:2rem;margin-bottom:12px;">🎯</div>
                <div style="font-weight:600;margin-bottom:8px;">Calibration Tracking</div>
                <div style="color:var(--text-muted);font-size:0.9rem;max-width:400px;margin:0 auto;">
                    Rate your confidence before each flashcard review. After 5+ rated reviews, you'll see how well your confidence predicts your actual accuracy.
                    <br><br><strong>From "Make It Stick":</strong> Illusions of knowing are the biggest threat to real learning. This tracks the gap between what you think you know and what you actually know.
                </div>
            </div>
        `;
        return;
    }
    
    // Calculate per-confidence-level accuracy
    const bins = {};
    withConfidence.forEach(r => {
        const c = r.confidence;
        if (!bins[c]) bins[c] = { correct: 0, total: 0 };
        bins[c].total++;
        if (r.outcome !== 'hard') bins[c].correct++;
    });
    
    // Per-category analysis
    const catBins = {};
    withConfidence.forEach(r => {
        const cat = r.category || 'general';
        if (!catBins[cat]) catBins[cat] = { confident: 0, correct: 0, total: 0 };
        catBins[cat].total++;
        catBins[cat].confident += r.confidence;
        if (r.outcome !== 'hard') catBins[cat].correct++;
    });
    
    const calibScore = typeof getCalibrationScore === 'function' ? getCalibrationScore() : null;
    
    container.innerHTML = `
        <div class="grid grid-3" style="margin-bottom:16px;">
            <div class="stat">
                <div class="stat-value" style="color:${calibScore >= 80 ? 'var(--success)' : calibScore >= 60 ? 'var(--warning)' : 'var(--danger)'};">${calibScore !== null ? calibScore.toFixed(0) + '%' : '—'}</div>
                <div class="stat-label">Calibration Score</div>
            </div>
            <div class="stat"><div class="stat-value">${withConfidence.length}</div><div class="stat-label">Rated Reviews</div></div>
            <div class="stat"><div class="stat-value">${(withConfidence.filter(r => r.outcome !== 'hard').length / withConfidence.length * 100).toFixed(0)}%</div><div class="stat-label">Overall Accuracy</div></div>
        </div>
        
        <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><span class="card-title">Confidence vs Accuracy</span></div>
            ${[1,2,3,4,5].map(level => {
                const b = bins[level] || { correct: 0, total: 0 };
                const accuracy = b.total > 0 ? (b.correct / b.total * 100) : 0;
                const expected = level * 20;
                const gap = accuracy - expected;
                return `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                        <span style="min-width:80px;font-size:0.85rem;">Conf ${level}/5</span>
                        <div style="flex:1;position:relative;">
                            <div class="progress" style="height:20px;">
                                <div class="progress-fill" style="width:${accuracy}%;background:${gap >= -10 ? 'var(--success)' : 'var(--danger)'};"></div>
                            </div>
                            <div style="position:absolute;left:${expected}%;top:0;height:20px;width:2px;background:var(--accent);"></div>
                        </div>
                        <span style="min-width:60px;text-align:right;font-size:0.8rem;">
                            ${b.total > 0 ? accuracy.toFixed(0) + '%' : '—'}
                            <span style="font-size:0.7rem;color:var(--text-muted);">(${b.total})</span>
                        </span>
                    </div>
                `;
            }).join('')}
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;">Orange line = expected accuracy. Green = calibrated. Red = overconfident.</div>
        </div>
        
        <div class="card">
            <div class="card-header"><span class="card-title">By Category — Where Are You Overconfident?</span></div>
            ${Object.entries(catBins).sort((a,b) => b[1].total - a[1].total).map(([cat, data]) => {
                const avgConf = (data.confident / data.total).toFixed(1);
                const accuracy = (data.correct / data.total * 100).toFixed(0);
                const overconfident = (avgConf / 5 * 100) > parseFloat(accuracy) + 10;
                return `
                    <div class="list-item" style="padding:8px 0;">
                        <span style="min-width:80px;font-weight:500;">${cat.toUpperCase()}</span>
                        <span style="min-width:60px;font-size:0.85rem;">Conf: ${avgConf}</span>
                        <span style="min-width:70px;font-size:0.85rem;color:${overconfident ? 'var(--danger)' : 'var(--success)'};">Acc: ${accuracy}%</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">(${data.total} reviews)</span>
                        ${overconfident ? '<span style="color:var(--danger);font-size:0.75rem;">⚠️ Overconfident</span>' : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ==================== PHASE 7: LEARNING QUALITY INSIGHT ====================

function renderQualityInsight(container, time) {
    // Technique tags are a process signal, not a validated measure of learning.
    const techniqueTagged = time.filter(t => t.technique);
    const untaggedStudy = time.filter(t => t.category === 'study' && !t.technique);
    
    const taggedHours = techniqueTagged.reduce((s, t) => s + (parseFloat(t.duration) || 0), 0);
    const untaggedHours = untaggedStudy.reduce((s, t) => s + (parseFloat(t.duration) || 0), 0);
    const totalStudy = taggedHours + untaggedHours;
    const techniqueShare = totalStudy > 0 ? (taggedHours / totalStudy * 100) : 0;
    const ratedFocusCount = Object.values(get(K.practiceQuality) || {}).flat().length;
    
    // By technique
    const byTechnique = {};
    time.filter(t => t.technique).forEach(t => {
        const tech = t.technique;
        byTechnique[tech] = (byTechnique[tech] || 0) + (parseFloat(t.duration) || 0);
    });
    
    // Elaboration entries count
    const journal = arr(K.journal);
    const elaborations = journal.filter(j => j.type === 'elaboration').length;
    
    // Pre-tested cards
    const cards = arr(K.flashcards);
    const preTested = cards.filter(c => c.preTested).length;
    
    container.innerHTML = `
        <div class="card" style="background:var(--bg-tertiary);padding:14px;margin-bottom:16px;font-size:0.85rem;color:var(--text-muted);">
            <strong style="color:var(--accent);">📖 Evidence note:</strong> Retrieval practice, spacing, and interleaving often outperform restudy for durable learning. Technique use is a process signal; delayed retrieval, transfer, and calibrated feedback are stronger outcome signals.
        </div>
        
        <div class="grid grid-4" style="margin-bottom:16px;">
            <div class="stat">
                <div class="stat-value">${techniqueShare.toFixed(0)}%</div>
                <div class="stat-label">Technique-Tagged</div>
            </div>
            <div class="stat"><div class="stat-value">${taggedHours.toFixed(1)}h</div><div class="stat-label">Tagged Study</div></div>
            <div class="stat"><div class="stat-value">${untaggedHours.toFixed(1)}h</div><div class="stat-label">Untagged Study</div></div>
            <div class="stat"><div class="stat-value">${ratedFocusCount}</div><div class="stat-label">Rated Focus Sessions</div></div>
        </div>
        
        <div class="grid grid-3" style="margin-bottom:16px;">
            <div class="stat"><div class="stat-value">${elaborations}</div><div class="stat-label">Elaborations</div></div>
            <div class="stat"><div class="stat-value">${preTested}</div><div class="stat-label">Pre-Tested Cards</div></div>
            <div class="stat"><div class="stat-value">${arr(K.knowledge).filter(n => n.entryType === 'critical').length}</div><div class="stat-label">Critical Analyses</div></div>
        </div>
        
        <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><span class="card-title">Hours by Study Technique</span></div>
            ${Object.entries(byTechnique).sort((a,b) => b[1] - a[1]).map(([tech, hours]) => {
                const techData = typeof STUDY_TECHNIQUES !== 'undefined' ? STUDY_TECHNIQUES[tech] : null;
                const name = techData ? techData.name : tech;
                const icon = techData ? techData.icon : '📖';
                return `
                    <div class="list-item" style="padding:8px 0;">
                        <span style="min-width:30px;">${icon}</span>
                        <span style="flex:1;font-weight:500;">${name}</span>
                        <span style="color:var(--accent);font-weight:600;">${hours.toFixed(1)}h</span>
                    </div>
                `;
            }).join('') || '<div class="empty">No technique-tagged study sessions yet. Use the Study Lab!</div>'}
        </div>
        
        <div class="card" style="background:var(--bg-tertiary);padding:14px;">
            <div style="font-weight:600;margin-bottom:8px;">💡 Recommendation</div>
            <div style="font-size:0.9rem;color:var(--text-secondary);">
                ${totalStudy === 0 ? 'Log a study session, then test retention later rather than judging the session by fluency.' :
                  techniqueShare < 30 ? 'Much of your study time has no technique tag. For material that must be retained, add retrieval with feedback and schedule a later check.' :
                  'You are recording structured methods. Confirm they work by checking delayed recall, transfer to new problems, and confidence-versus-accuracy.'}
                ${elaborations < 5 ? ' Try writing more elaboration reflections after study sessions.' : ''}
                ${preTested === 0 ? ' Use the Pre-Test feature on learning pathways to prime your brain before studying new material.' : ''}
            </div>
        </div>
    `;
}
