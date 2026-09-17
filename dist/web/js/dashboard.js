// ==================== DASHBOARD ====================
function refreshDashboard() {
    const s=getSettings(), tasks=arr(K.tasks), time=arr(K.time), disc=get(K.discipline)||{};
    const h=new Date().getHours();
    document.getElementById('greeting').textContent = h<12?'morning':h<17?'afternoon':'evening';
    document.getElementById('userName').textContent = s.name || 'Hebun';
    document.getElementById('heroVision').textContent = s.vision ? '— “'+s.vision+'”' : '';

    // ── V7 Summary Strip (scan-first) ─────────────────────────
    const streak = calcDisciplineStreak();

    const todayDisc = disc[today()] || {};
    const todayScore = DISCIPLINES.reduce((sum,d) => sum + (todayDisc[d.id] || 0), 0);
    const maxScore = DISCIPLINES.reduce((sum,d) => sum + d.max, 0);
    const disciplinePct = Math.round((todayScore/maxScore)*100);

    const overdue = tasks.filter(t=>!taskIsCompleted(t) && taskDueDate(t) && taskDueDate(t) < today()).length;
    const dueToday = tasks.filter(t=>!taskIsCompleted(t) && taskDueDate(t) === today()).length;

    const events = arr(K.events);
    const todaysEvents = events.filter(e => e.date === today());
    const plannedMinutes = todaysEvents.reduce((sum, e) => {
        const dur = parseInt(e.duration || 0, 10);
        return sum + (isNaN(dur) ? 0 : dur);
    }, 0);
    const plannedHours = plannedMinutes / 60;

    const protocol = get(K.protocol) || {};
    const todayProtocol = protocol[today()];
    const focusText = typeof todayProtocol?.intention === 'string' && todayProtocol.intention ? todayProtocol.intention : 'Set in Protocol';
    const protocolState = todayProtocol?.completed ? 'Complete ✓' : todayProtocol?.morning ? 'Morning ✓' : todayProtocol?.evening ? 'Evening only' : 'Pending';
    const focusMeta = focusText !== 'Set in Protocol' ? `Energy: ${todayProtocol.energy || '?'}/10 • Protocol: ${protocolState}` : 'Run Morning Protocol';

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setText('v7Focus', focusText);
    setText('v7FocusMeta', focusMeta);

    setText('v7Time', `${plannedHours.toFixed(1)}h`);
    setText('v7TimeMeta', `${todaysEvents.length} blocks planned`);

    setText('v7Risk', `${overdue + dueToday}`);
    setText('v7RiskMeta', `${overdue} overdue • ${dueToday} due today`);

    setText('v7Momentum', `${streak}d`);
    const bm7 = (typeof getBehaviorMomentumSeries==='function') ? Math.round(getBehaviorMomentumSeries(7).reduce((s,x)=>s+x.score,0)/7) : null;
    setText('v7MomentumMeta', `Discipline: ${disciplinePct}%${bm7!==null?` • Momentum: ${bm7}/100`:''}`);
    
    // V15: New dashboard sections
    renderDashGoals();
    renderDashStripStats();

    // V15 dashboard: goals preview + operator strip score
    if (typeof renderDashGoals === 'function') renderDashGoals();
    // Operator score in strip
    if (typeof getOperatorScore === 'function') {
        var op = window.METRICS?.getOperatorScore ? METRICS.getOperatorScore() : getOperatorScore();
        var opEl = document.getElementById('dashOperatorScore');
        var opHint = document.getElementById('dashOperatorHint');
        if (opEl) opEl.textContent = op.composite;
        if (opHint) opHint.textContent = op.label;
    }
    // System health badge
    if (typeof getSystemStatus === 'function') {
        var sys = window.METRICS?.getSystemStatus ? METRICS.getSystemStatus() : getSystemStatus();
        var badge = document.getElementById('systemHealthBadge');
        if (badge) {
            badge.textContent = sys.label;
            badge.className = 'badge ' + (sys.score >= 75 ? 'badge-good' : sys.score >= 50 ? 'badge-warn' : 'badge-danger');
        }
    }

    // Dashboard tip
    showTip('dashboard', 'dashboardTip');
    
    // V49: choose one Quran passage per full StudyOS opening. Navigating
    // away from and back to the dashboard keeps the same passage.
    if (typeof renderDailyQuranVerse === 'function') renderDailyQuranVerse();

    // Today's learning
    renderDashLearn();
    
    // Call enhanced dashboard features
    refreshDashboardEnhanced();

    renderDashboardCommandDeck();
    if (typeof renderCommitmentDashboard === 'function') renderCommitmentDashboard();
    if (typeof renderCommitmentHeadsUp === 'function') renderCommitmentHeadsUp();

    // Blind spot alert
    renderBlindSpot();
    // V17: Wisdom card is visible again — render it on refresh (was only reachable via the Next button)
    renderWisdom();
    renderStudyLoad();
    renderStrategicPulse();

    // V15: System integration cards
    if (typeof renderSystemStatusCard === 'function') renderSystemStatusCard();
    if (typeof renderOperatorScoreCard === 'function') renderOperatorScoreCard();

    // V7 widgets
    renderV7NextMove();
    renderV7TasksPreview();

    // V11 Balanced: learning integrity + domain balance
    renderLearningIntegrity();

    // V11 v7: momentum trend chart on dashboard
    renderDashMomentumTrend();
}

function renderDashMomentumTrend(){
    const canvas = document.getElementById('dashMomentumChart');
    if(!canvas) return;
    if (typeof LEARN === 'undefined' || !LEARN.getMomentumSeries) {
        const card = document.getElementById('momentumTrendCard');
        if(card) card.style.display = 'none';
        return;
    }

    // Ensure visible
    const card = document.getElementById('momentumTrendCard');
    if(card) card.style.display = '';

    const ctx = canvas.getContext('2d');
    const series = LEARN.getMomentumSeries(30);

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 320;
    const h = 120;

    canvas.width = Math.max(300, Math.floor(w * dpr));
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

    // subtle grid
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
}

function renderLearningIntegrity() {
    const liCard = document.getElementById('learningIntegrityCard');
    const dbCard = document.getElementById('domainBalanceCard');
    if (!liCard && !dbCard) return;
    if (typeof LEARN === 'undefined') {
        if (liCard) liCard.innerHTML = '<div style="font-weight:800;">Learning Integrity</div><div class="empty" style="margin-top:8px;">Learning engine not loaded.</div>';
        if (dbCard) dbCard.innerHTML = '<div style="font-weight:800;">Domain Balance</div><div class="empty" style="margin-top:8px;">Learning engine not loaded.</div>';
        return;
    }

    const li = window.METRICS?.getLearningIntegrity ? METRICS.getLearningIntegrity() : LEARN.getLearningIntegrityIndex();
    const idx = li.index;
    const mood = idx === null ? { label:'NEEDS DATA', cls:'' } : idx >= 80 ? { label:'STRONG', cls:'badge-good' } : idx >= 60 ? { label:'OK', cls:'badge-warn' } : { label:'WATCH', cls:'badge-warn' };

    if (liCard) {
        liCard.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <div style="font-weight:800;">🧠 Learning Integrity</div>
                <span class="badge ${mood.cls}">${mood.label}</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:10px;">
                <div style="font-size:2rem;font-weight:900;font-family:var(--font-mono);color:var(--accent);">${idx === null ? '—' : idx}</div>
                <div style="color:var(--text-muted);font-size:0.85rem;">${idx === null ? 'log evidence first' : '/ 100'}</div>
            </div>
            <div style="margin-top:10px;display:grid;gap:8px;">
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;">
                    <span style="color:var(--text-muted);">Momentum (14d)</span>
                    <span style="font-weight:700;">${li.momentum.normalized}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;">
                    <span style="color:var(--text-muted);">Calibration</span>
                    <span style="font-weight:700;">${li.calibration===null?'—':Math.round(li.calibration)+'%'}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;">
                    <span style="color:var(--text-muted);">Balance</span>
                    <span style="font-weight:700;">${li.balance === null ? '—' : li.balance}</span>
                </div>
            </div>
            <div style="margin-top:10px;" class="hint">Balanced mode: metrics + short notes. Use Doctrine drills to raise momentum.</div>
        `;
    }

    if (dbCard) {
        const a = li.allocation;
        const rows = LEARN.domains.map(d => {
            const pct = a.pct[d] || 0;
            const label = d.charAt(0).toUpperCase() + d.slice(1);
            const warn = pct < 25 ? 'badge-warn' : pct > 45 ? 'badge-danger' : 'badge-good';
            return `
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                <div style="font-size:0.85rem;">${label}</div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="badge ${warn}">${pct}%</span>
                  <span style="font-size:0.8rem;color:var(--text-muted);">${(a.hours[d]||0).toFixed(1)}h</span>
                </div>
              </div>
            `;
        }).join('');

        dbCard.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <div style="font-weight:800;">⚖️ Domain Balance (7d)</div>
                <span class="badge">${a.totalHours.toFixed(1)}h study</span>
            </div>
            <div style="display:grid;gap:8px;">${rows}</div>
            <div style="margin-top:10px;display:flex;gap:8px;">
                <button class="btn btn-secondary" style="flex:1;" onclick="go('tracker')">Log Time</button>
                <button class="btn btn-primary" style="flex:1;" onclick="go('doctrine')">Run Drill</button>
            </div>
        `;
    }
}

function renderV7TasksPreview() {
    const container = document.getElementById('v7TasksPreview');
    if (!container) return;
    const tasks = arr(K.tasks).filter(t => !taskIsCompleted(t));
    const todayStr = today();
    const relevant = tasks
        .filter(t => taskDueDate(t) && taskDueDate(t) <= todayStr)
        .sort((a,b) => taskDueDate(a).localeCompare(taskDueDate(b)))
        .slice(0, 6);

    if (!relevant.length) {
        container.innerHTML = '<div class="empty">No urgent tasks. Keep execution clean.</div>';
        return;
    }

    container.innerHTML = relevant.map(t => {
        const due = taskDueDate(t);
        const isOverdue = due < todayStr;
        return `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
                <div style="margin-top:2px;">${isOverdue ? '⚠️' : '✅'}</div>
                <div style="flex:1;">
                    <div style="font-weight:600;">${esc(t.title)}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">Due ${due}${t.priority ? ` • ${esc(t.priority)}` : ''}</div>
                </div>
                <span class="badge ${isOverdue ? 'badge-danger' : 'badge-warn'}">${isOverdue ? 'OVERDUE' : 'TODAY'}</span>
            </div>
        `;
    }).join('');
}

function renderV7NextMove() {
    const panel = document.getElementById('v7NextMovePanel');
    if (!panel) return;

    // V8: use intelligence layer if present; fallback to legacy heuristic
    const rec = (typeof intelRecommendNextMove === 'function') ? intelRecommendNextMove() : null;
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    if (!rec) {
        const todayStr = today();
        const cards = arr(K.flashcards);
        const dueCards = cards.filter(c => !c.nextReview || c.nextReview <= todayStr).length;

        const tasks = arr(K.tasks).filter(t => !taskIsCompleted(t));
        const overdue = tasks.filter(t => taskDueDate(t) && taskDueDate(t) < todayStr).length;

        const events = arr(K.events);
        const plannedMinutes = events
            .filter(e => e.date === todayStr)
            .reduce((sum, e) => sum + (parseInt(e.duration || 0, 10) || 0), 0);
        const plannedHours = plannedMinutes / 60;

        let title = 'Execute the next block';
        let desc = 'Run the next scheduled block with full attention. Keep it simple.';
        let ctaText = 'Open Schedule';
        let ctaFn = "go('calendar')";

        if (dueCards > 0) {
            title = `Review SRS (${dueCards})`;
            desc = 'Spaced repetition compounds fast. Clear your due cards to keep memory tight.';
            ctaText = 'Open Flashcards';
            ctaFn = "go('flashcards')";
        } else if (overdue > 0) {
            title = `Clear Overdue Tasks (${overdue})`;
            desc = 'Remove backlog pressure first. One overdue item cleared improves the whole system.';
            ctaText = 'Open Tasks';
            ctaFn = "go('tasks')";
        } else if (plannedHours < 2) {
            title = 'Schedule 2h Focus';
            desc = 'Your day needs committed blocks. Add two 60-min sessions to the calendar.';
            ctaText = 'Add Block';
            ctaFn = "go('calendar')";
        }

        panel.innerHTML = `
            <div class="next-move-title">Next Move</div>
            <div class="next-move-desc"><strong>${esc(title)}</strong><br>${esc(desc)}</div>
            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0;">
              <div class="summary-card"><div class="summary-kicker">SRS</div><div class="summary-value">${dueCards}</div></div>
              <div class="summary-card"><div class="summary-kicker">Overdue</div><div class="summary-value">${overdue}</div></div>
              <div class="summary-card"><div class="summary-kicker">Planned</div><div class="summary-value">${plannedHours.toFixed(1)}h</div></div>
            </div>
            <div class="next-move-cta" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <button class="btn btn-primary" style="width:100%;" onclick="${ctaFn}">${esc(ctaText)}</button>
                <button class="btn btn-secondary" style="width:100%;" onclick="go('protocol')">Protocol</button>
            </div>
        `;
        setText('v7NextMoveTitle', title);
        setText('v7NextMoveHint', desc);
        return;
    }

    const cards = arr(K.flashcards);
    const dueCards = cards.filter(c => !c.nextReview || c.nextReview <= today()).length;
    const overdue = arr(K.tasks).filter(t => !taskIsCompleted(t) && taskDueDate(t) && taskDueDate(t) < today()).length;
    const activeModuleId = (typeof INTEL !== 'undefined' && INTEL.getState) ? INTEL.getState().activeModuleId : '';
    panel.innerHTML = `
        <div class="next-move-title">Next Move</div>
        <div class="next-move-desc"><strong>${esc(rec.title)}</strong><br>${esc(rec.desc)}</div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0;">
          <div class="summary-card"><div class="summary-kicker">Priority</div><div class="summary-value">${rec.priority || '—'}</div></div>
          <div class="summary-card"><div class="summary-kicker">SRS</div><div class="summary-value">${dueCards}</div></div>
          <div class="summary-card"><div class="summary-kicker">Overdue</div><div class="summary-value">${overdue}</div></div>
        </div>
        <div class="next-move-cta" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <button class="btn btn-primary" style="width:100%;" onclick="${rec.ctaFn}">${esc(rec.ctaText)}</button>
            <button class="btn btn-secondary" style="width:100%;" onclick="${activeModuleId ? `go('doctrine')` : `go('planner')`}">${activeModuleId ? 'Doctrine' : 'Plan'}</button>
        </div>
    `;

    setText('v7NextMoveTitle', rec.title);
    setText('v7NextMoveHint', rec.desc);
}


function renderBlindSpot() {
    const available = typeof BLIND_SPOTS !== 'undefined' ? BLIND_SPOTS : [];
    const adaptiveEnabled = typeof getAdaptiveProfile !== 'function' || getAdaptiveProfile().enabled;
    const spots = adaptiveEnabled ? available.filter(function(spot){
        return !spot.hypothesisId || typeof profileIsHypothesisEnabled !== 'function' || profileIsHypothesisEnabled(spot.hypothesisId);
    }) : [];
    const card = document.getElementById('blindSpotCard');
    if (!card) return;
    if (spots.length === 0) {
        card.style.borderLeft = '3px solid var(--border)';
        card.style.background = 'var(--surface-2)';
        card.innerHTML = '<div style="font-weight:700;margin-bottom:5px;">Adaptive prompts are quiet</div><div style="font-size:.82rem;color:var(--text-muted);">Every profile hypothesis is disabled or snoozed. Core StudyOS tools remain fully available. Restore prompts in Profile Lab.</div><button class="btn btn-secondary btn-sm" style="margin-top:9px;" onclick="go(\'profilelab\')">Open Profile Lab</button>';
        return;
    }

    // Rotate daily based on day-of-year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / 86400000);
    const spot = spots[dayOfYear % spots.length];
    const density = typeof profileGuidanceDensity === 'function' ? profileGuidanceDensity() : 'balanced';
    const hypothesis = spot.hypothesisId && typeof PROFILE_HYPOTHESES !== 'undefined' ? PROFILE_HYPOTHESES.find(function(item){ return item.id === spot.hypothesisId; }) : null;

    card.style.borderLeft = '3px solid ' + spot.color;
    card.style.background = spot.color + '11';
    card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div style="font-weight:700;font-size:0.9rem;">${spot.icon} Blind Spot Check: ${esc(spot.strength)}${spot.rank ? ` <span style="font-size:0.7rem;color:var(--text-muted);">#${spot.rank}</span>` : ''}</div>
            <span style="font-size:0.7rem;padding:2px 8px;background:${spot.color}22;color:${spot.color};border-radius:4px;">Hypothesis</span>
        </div>
        <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">${esc(spot.alert)}</div>
        ${density !== 'compact' && spot.why ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;"><strong>Why it matters:</strong> ${esc(spot.why)}</div>` : ''}
        <div style="font-size:0.85rem;color:var(--accent);font-weight:500;">→ ${esc(spot.action)}</div>
        ${density === 'coaching' && spot.field ? `<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:6px;">🏗️ <em>${esc(spot.field)}</em></div>` : ''}
        ${density === 'coaching' && hypothesis ? `<div class="profile-observed"><strong>Behavioral test:</strong> ${esc(hypothesis.test)}<br><strong>Observed so far:</strong> ${esc(profileObservedEvidence(hypothesis.id))}</div>` : ''}
        ${spot.hypothesisId ? `<div class="profile-feedback-actions" style="margin-top:10px;"><button class="btn btn-secondary btn-sm" onclick="profileRecordFeedback('${esc(spot.hypothesisId)}','helpful','dashboard')">Useful</button><button class="btn btn-secondary btn-sm" onclick="profileRecordFeedback('${esc(spot.hypothesisId)}','not-me','dashboard')">Not me</button><button class="btn btn-ghost btn-sm" onclick="go('profilelab')">Inspect evidence</button></div>` : ''}
    `;
}

function renderDashLearn() {
    const progress = get(K.learnProgress) || {};
    let next = null;
    for (const [pathId, path] of Object.entries(PATHWAYS)) {
        for (const mod of path.modules) {
            if (!progress[mod.id] || progress[mod.id] < mod.hours) {
                next = { pathId, path, mod, done: progress[mod.id] || 0 };
                break;
            }
        }
        if (next) break;
    }
    if (next) {
        const pct = Math.round((next.done / next.mod.hours) * 100);
        document.getElementById('dashLearn').innerHTML = `
            <div class="pathway-card active">
                <div class="pathway-header">
                    <span class="pathway-title">${next.mod.name}</span>
                    <span class="pathway-badge">${next.path.name}</span>
                </div>
                <div class="pathway-desc">${next.mod.topics.slice(0,3).join(', ')}</div>
                <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">${next.done}/${next.mod.hours} hours</div>
            </div>
        `;
    } else {
        document.getElementById('dashLearn').innerHTML = '<div class="empty">All pathways complete! 🎉</div>';
    }
}

function renderWisdom() {
    const idx = Math.floor(Math.random() * WISDOM.length);
    const w = WISDOM[idx];
    document.getElementById('dashWisdom').innerHTML = `
        <div class="wisdom-card">
            <div class="wisdom-quote">"${w.quote}"</div>
            <div class="wisdom-source">— ${w.source}</div>
        </div>
    `;
}
function nextWisdom() { renderWisdom(); }

function showTip(page, containerId) {
    const tips = TIPS[page];
    if (!tips || !tips.length) return;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="tip-banner ${tip.type}">
                <div class="tip-icon">${tip.type==='warning'?'⚠️':tip.type==='success'?'💪':'💡'}</div>
                <div class="tip-text"><strong>${tip.title}</strong>${tip.text}</div>
            </div>
        `;
    }
}


// ==================== QUOTES & MOTIVATION ====================
function getMotivationalQuotes() {
    return [
        { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
        { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
        { text: "Excellence is not a destination but a continuous journey.", author: "Brian Tracy" },
        { text: "Small disciplines repeated with consistency lead to great achievements.", author: "John Maxwell" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
        { text: "The future belongs to those who prepare for it today.", author: "Malcolm X" },
        { text: "Strive for progress, not perfection.", author: "Unknown" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
        { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
        { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
        { text: "The difference between try and triumph is just a little umph!", author: "Marvin Phillips" },
        { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
        { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
        { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" }
    ];
}

function getDailyQuote() {
    const quotes = getMotivationalQuotes();
    // Use day of year to get consistent daily quote
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return quotes[dayOfYear % quotes.length];
}

// ==================== ENHANCED DASHBOARD ====================
function refreshDashboardEnhanced() {
    // SRS due count
    const cards = arr(K.flashcards);
    const todayStr = today();
    const dueCards = cards.filter(c => !c.nextReview || c.nextReview <= todayStr).length;
    
    const srsEl = document.getElementById('dashSRSDue');
    if (srsEl) srsEl.textContent = dueCards;

    const statSRS = document.getElementById('statSRS');
    if (statSRS) statSRS.textContent = `${dueCards} cards due`;

    // V63.5: the SRS tile in the Home metric strip was never written by any
    // code — it shipped as a literal "12 / cards" in the template and never
    // changed. It is now the same number as everywhere else.
    const dashSRSCount = document.getElementById('dashSRSCount');
    if (dashSRSCount) dashSRSCount.textContent = dueCards;
    const dashSRSHint = document.getElementById('dashSRSHint');
    if (dashSRSHint) {
        dashSRSHint.textContent = dueCards === 0
            ? 'nothing due'
            : (dueCards === 1 ? '1 card due' : dueCards + ' cards due');
    }
    
    // Weekly review status
    const weekKey = getCurrentWeekKey();
    const reviews = get(K.weeklyReviews) || {};
    const reviewStatus = document.getElementById('dashReviewStatus');
    if (reviewStatus) {
        reviewStatus.textContent = reviews[weekKey]?.completed ? '✓ Done' : 'Pending';
        reviewStatus.style.color = reviews[weekKey]?.completed ? 'var(--success)' : 'var(--warning)';
    }
    
    // Follow-ups
    const contacts = arr(K.contacts);
    const followups = contacts.filter(c => c.followupDate && c.followupDate <= todayStr).length;
    const followupEl = document.getElementById('dashFollowups');
    if (followupEl) followupEl.textContent = followups;
    
    // Today's focus from protocol
    const protocol = get(K.protocol) || {};
    const todayProtocol = protocol[todayStr];
    const focusTask = document.getElementById('todayFocusTask');
    const focusMeta = document.getElementById('todayFocusMeta');
    if (focusTask && todayProtocol?.intention) {
        focusTask.textContent = todayProtocol.intention;
        const state = todayProtocol.completed ? 'Complete ✓' : todayProtocol.morning ? 'Morning ✓' : todayProtocol.evening ? 'Evening only' : 'Pending';
        focusMeta.textContent = `Energy: ${todayProtocol.energy || '?'}/10 • Protocol: ${state}`;
    }
    
    // Calendar preview
    const events = arr(K.events);
    const tasks = arr(K.tasks).filter(t => taskDueDate(t) && !taskIsCompleted(t));
    const upcoming = [...events, ...tasks.map(t => ({ ...t, date: taskDueDate(t), type: 'task' }))]
        .filter(e => e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3);
    
    const calPreview = document.getElementById('dashCalendarPreview');
    if (calPreview) {
        calPreview.innerHTML = upcoming.length ? upcoming.map(e => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
                <div style="width:45px;text-align:center;">
                    <div style="font-size:1.1rem;font-weight:700;color:var(--accent);">${new Date(e.date + 'T00:00').getDate()}</div>
                    <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;">${new Date(e.date + 'T00:00').toLocaleDateString('en', {month:'short'})}</div>
                </div>
                <div style="flex:1;">
                    <div style="font-weight:500;">${esc(e.title)}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${e.time || 'All day'} ${e.type ? `• ${e.type}` : ''}</div>
                </div>
            </div>
        `).join('') : '<div class="empty">No upcoming events</div>';
    }
    
    // Daily quote
    const quote = getDailyQuote();
    const quoteText = document.getElementById('dailyQuoteText');
    const quoteAuthor = document.getElementById('dailyQuoteAuthor');
    if (quoteText) quoteText.textContent = `"${quote.text}"`;
    if (quoteAuthor) quoteAuthor.textContent = `— ${quote.author}`;
    
    // Sparklines
    renderSparklines();
}

function renderSparklines() {
    const disc = get(K.discipline) || {};
    const time = arr(K.time);
    
    // Get last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(fmtDate(d));
    }
    
    // Discipline sparkline
    const discData = days.map(d => {
        const dayDisc = disc[d];
        if (!dayDisc) return 0;
        return Object.values(dayDisc).reduce((s, v) => s + v, 0);
    });
    
    const discSparkline = document.getElementById('disciplineSparkline');
    if (discSparkline) {
        const max = Math.max(...discData, 1);
        discSparkline.innerHTML = discData.map(v => `<div class="sparkline-bar" style="height:${(v/max)*100}%;background:${v > 30 ? 'var(--success)' : 'var(--accent)'};"></div>`).join('');
    }
    
    // Hours sparkline
    const hoursData = days.map(d => time.filter(t => t.date === d).reduce((s, t) => s + (parseFloat(t.duration) || 0), 0));
    
    const hoursSparkline = document.getElementById('hoursSparkline');
    if (hoursSparkline) {
        const max = Math.max(...hoursData, 1);
        hoursSparkline.innerHTML = hoursData.map(v => `<div class="sparkline-bar" style="height:${(v/max)*100}%;"></div>`).join('');
    }
}


// ==================== STUDY LOAD MONITOR ====================
function renderStudyLoad() {
    const card = document.getElementById('studyLoadCard');
    if (!card) return;
    const isStudyEntry = t => t.category === 'study' || !!t.technique || !!t.learningPath ||
        (t.type === 'focus' && ['technical','strategic','leadership'].includes(String(t.category || '').toLowerCase()));
    const timeEntries = arr(K.time).filter(isStudyEntry);
    const todayEntries = timeEntries.filter(t => t.date === today());
    const todayHours = todayEntries.reduce((sum, t) => sum + (t.duration || 0), 0);
    const pomStats = get(K.pomodoroStats) || {};
    const todayPoms = pomStats[today()] || 0;
    const weekHours = [];
    for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); weekHours.push(timeEntries.filter(t => t.date === fmtDate(d)).reduce((s, t) => s + (t.duration || 0), 0)); }
    const weekAvg = weekHours.reduce((a, b) => a + b, 0) / 7;
    const reflectionGuardrail = 4;
    const pct = Math.min((todayHours / reflectionGuardrail) * 100, 100);
    const isOver = todayHours > reflectionGuardrail;
    const qualityLog = get(K.practiceQuality) || {};
    const todayQuality = qualityLog[today()] || [];
    const deliberateCount = todayQuality.filter(q => q.quality === 'deliberate').length;
    const totalRated = todayQuality.length;
    let statusColor = 'var(--success)', statusIcon = '🟢', statusText = 'Good pace';
    if (isOver) { statusColor = 'var(--danger)'; statusIcon = '🔴'; statusText = 'Past reflection guardrail — check fatigue and learning quality'; }
    else if (todayHours >= 3.5) { statusColor = 'var(--warning)'; statusIcon = '🟡'; statusText = 'Near reflection guardrail — quality and recovery matter'; }
    else if (todayHours < 1 && new Date().getHours() >= 18) { statusColor = 'var(--text-muted)'; statusIcon = '⚪'; statusText = 'Low study day'; }
    card.style.borderLeft = '3px solid ' + statusColor;
    card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-weight:600;font-size:0.9rem;">${statusIcon} Study Load</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${todayPoms} pomodoros | Avg ${weekAvg.toFixed(1)} hrs/day</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
            <div style="font-size:1.5rem;font-weight:700;color:${statusColor};">${todayHours.toFixed(1)}h</div>
            <div style="flex:1;"><div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${statusColor};border-radius:4px;transition:width 0.3s;"></div></div></div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${reflectionGuardrail}h check-in</div>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);">${statusText}${totalRated > 0 ? ' · ' + deliberateCount + '/' + totalRated + ' sessions deliberate' : ''}</div>
    `;
}

// ==================== STRATEGIC PULSE ====================
function renderStrategicPulse() {
    const card = document.getElementById('strategicPulseCard');
    if (!card) return;
    const pulseMetrics = window.METRICS?.getStrategicPulse ? METRICS.getStrategicPulse() : null;
    const sh = get(K.strategicHorizon) || {};
    const decisions = get(K.decisions) || [];
    const fwState = get(K.frameworkLab) || {};
    const frameworks = Object.keys(fwState.frameworks || {});
    const books = arr(K.knowledge).filter(n => n.entryType === 'book');
    const models = arr(K.knowledge).filter(n => n.entryType === 'model');
    const todayStr = today();

    const actions = sh.ninetyDay || [];
    const completed = actions.filter(a => a.done).length;
    const total = actions.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    let daysLeft = 90;
    if (sh.ninetyDayCycleStart) {
        daysLeft = Math.max(0, 90 - Math.floor((Date.now() - new Date(sh.ninetyDayCycleStart).getTime()) / 86400000));
    }
    const reviewsDue = decisions.filter(d => !d.reviewed && d.reviewDate && d.reviewDate <= todayStr).length;

    card.style.borderLeft = '3px solid var(--accent)';
    card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="font-weight:600;font-size:0.9rem;">🎯 Strategic Pulse</div>
            <div style="font-size:0.75rem;color:var(--text-muted);cursor:pointer;" onclick="go('horizon')">Open Plan →</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:8px;">
            <div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:6px;">
                <div style="font-size:1.2rem;font-weight:700;color:${pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'};">${total > 0 ? pct + '%' : '—'}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">90-Day Plan</div>
            </div>
            <div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:6px;">
                <div style="font-size:1.2rem;font-weight:700;color:${reviewsDue > 0 ? 'var(--danger)' : 'var(--success)'};">${reviewsDue}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Reviews Due</div>
            </div>
            <div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:6px;">
                <div style="font-size:1.2rem;font-weight:700;">${frameworks.length}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Frameworks</div>
            </div>
            <div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:6px;">
                <div style="font-size:1.2rem;font-weight:700;">${models.length + books.length}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Models+Books</div>
            </div>
        </div>
        ${total > 0 ? '<div style="font-size:0.8rem;color:var(--text-muted);">' + completed + '/' + total + ' actions · ' + daysLeft + ' days remaining</div>' : '<div style="font-size:0.8rem;color:var(--text-muted);">No active 90-day cycle. <span style="color:var(--accent);cursor:pointer;" onclick="go(\'horizon\')">Start one →</span></div>'}
    `;
}


// ==================== V15: SYSTEM STATUS CARD ====================
function renderSystemStatusCard() {
    var card = document.getElementById('systemStatusCard');
    if (!card) return;
    if (typeof getSystemStatus !== 'function') { card.style.display = 'none'; return; }

    var status = getSystemStatus();
    var color = status.score >= 75 ? 'var(--success)' : status.score >= 50 ? 'var(--warning)' : 'var(--danger)';

    card.style.borderLeft = '3px solid ' + color;
    card.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
            '<div style="font-weight:800;">⚡ System Status</div>' +
            '<span class="badge" style="background:' + color + '22;color:' + color + ';">' + status.label + '</span>' +
        '</div>' +
        (status.warnings.length > 0 ?
            status.warnings.map(function(w) {
                return '<div style="font-size:0.8rem;color:var(--danger);margin-bottom:4px;">⚠ ' + esc(w) + '</div>';
            }).join('') :
            '<div style="font-size:0.85rem;color:var(--success);">All systems nominal.</div>'
        );
}

// ==================== V15: OPERATOR SCORE CARD ====================
function renderOperatorScoreCard() {
    var card = document.getElementById('operatorScoreCard');
    if (!card) return;
    if (typeof getOperatorScore !== 'function') { card.style.display = 'none'; return; }

    var op = getOperatorScore();
    var streak = (typeof getOperatorStreak === 'function') ? getOperatorStreak(50) : 0;
    var color = op.composite >= 80 ? 'var(--success)' : op.composite >= 50 ? 'var(--warning)' : 'var(--danger)';

    card.style.borderLeft = '3px solid ' + color;
    card.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
            '<div style="font-weight:800;">🧭 Operator Score</div>' +
            '<span style="font-size:1.4rem;font-weight:900;color:' + color + ';">' + op.composite + '</span>' +
        '</div>' +
        (streak > 0 ?
            '<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;">🔥 ' + streak + ' day' + (streak === 1 ? '' : 's') + ' stable streak</div>' :
            ''
        ) +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">' +
            '<div style="text-align:center;padding:6px;background:var(--bg-tertiary);border-radius:6px;">' +
                '<div style="font-weight:700;">' + op.protocol + '%</div>' +
                '<div style="font-size:0.65rem;color:var(--text-muted);">Protocol</div>' +
            '</div>' +
            '<div style="text-align:center;padding:6px;background:var(--bg-tertiary);border-radius:6px;">' +
                '<div style="font-weight:700;">' + op.discipline + '%</div>' +
                '<div style="font-size:0.65rem;color:var(--text-muted);">Discipline</div>' +
            '</div>' +
            '<div style="text-align:center;padding:6px;background:var(--bg-tertiary);border-radius:6px;">' +
                '<div style="font-weight:700;">' + op.habits + '%</div>' +
                '<div style="font-size:0.65rem;color:var(--text-muted);">Habits</div>' +
            '</div>' +
        '</div>';
}


// ==================== V15 DASHBOARD: Goals Preview ====================
function renderDashGoals() {
    var goals = arr(K.goals);
    var preview = document.getElementById('dashGoalsPreview');
    var pctEl = document.getElementById('dashGoalsPct');
    var hintEl = document.getElementById('dashGoalsHint');

    var completed = goals.filter(function(g) { return g.completed; }).length;
    var total = goals.length;
    var pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (pctEl) pctEl.textContent = total > 0 ? pct + '%' : '—';
    if (hintEl) hintEl.textContent = completed + '/' + total + ' done';

    if (!preview) return;
    if (goals.length === 0) {
        preview.innerHTML = '<div class="empty">No goals yet. <span style="color:var(--accent);cursor:pointer;" onclick="go(\'goals\')">Set one →</span></div>';
        return;
    }

    // Show top 4 goals with progress
    var top = goals.slice(0, 4);
    preview.innerHTML = top.map(function(g) {
        var prog = goalProgress(g);
        var done = g.completed;
        return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
            '<div style="flex:1;font-size:0.85rem;' + (done ? 'text-decoration:line-through;color:var(--text-muted);' : '') + '">' + esc(g.title || 'Untitled') + '</div>' +
            '<div style="width:50px;text-align:right;font-weight:700;font-size:0.8rem;color:' + (done ? 'var(--success)' : 'var(--accent)') + ';">' + (done ? '✓' : prog + '%') + '</div>' +
        '</div>';
    }).join('') +
    (goals.length > 4 ? '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">+' + (goals.length - 4) + ' more</div>' : '');
}

// ==================== V15 DASHBOARD: Strip Stats ====================
function renderDashStripStats() {
    var tasks = arr(K.tasks);
    var overdue = tasks.filter(function(t) { return !taskIsCompleted(t) && taskDueDate(t) && taskDueDate(t) < today(); }).length;
    var dueToday = tasks.filter(function(t) { return !taskIsCompleted(t) && taskDueDate(t) === today(); }).length;

    var el = document.getElementById('dashTaskCount');
    if (el) el.textContent = (overdue + dueToday) || '0';
    var hint = document.getElementById('dashTaskHint');
    if (hint) hint.textContent = overdue > 0 ? overdue + ' overdue · ' + dueToday + ' today' : dueToday + ' due today';

    // Study hours today
    var time = arr(K.time);
    var todayHours = time.filter(function(e) { return e.date === today(); })
        .reduce(function(s, e) { return s + (parseFloat(e.duration) || 0); }, 0);
    var studyEl = document.getElementById('dashStudyHours');
    if (studyEl) studyEl.textContent = todayHours.toFixed(1) + 'h';
    var studyHint = document.getElementById('dashStudyHint');
    if (studyHint) studyHint.textContent = 'hours today';

    // 90-day horizon
    var sh = get(K.strategicHorizon) || {};
    var actions = sh.ninetyDay || [];
    var done = actions.filter(function(a) { return a.done; }).length;
    var horizonPct = actions.length > 0 ? Math.round((done / actions.length) * 100) : 0;
    var hzEl = document.getElementById('dashHorizonPct');
    if (hzEl) hzEl.textContent = actions.length > 0 ? horizonPct + '%' : '—';
    var hzHint = document.getElementById('dashHorizonHint');
    if (hzHint) hzHint.textContent = done + '/' + actions.length + ' actions';

    // SRS
    var cards = arr(K.flashcards);
    var dueCards = cards.filter(function(c) { return !c.nextReview || c.nextReview <= today(); }).length;
    var srsEl = document.getElementById('statSRS');
    if (srsEl) srsEl.textContent = dueCards || '0';
    var srsEl2 = document.getElementById('dashSRSDue');
    if (srsEl2) srsEl2.textContent = dueCards;
}

// ==================== V15 DASHBOARD: Quick Journal ====================
function dashSaveQuickJournal() {
    var el = document.getElementById('dashJournalQuick');
    if (!el) return;
    var text = el.value.trim();
    if (!text) { toast('Write something first'); return; }

    var entries = arr(K.journal);
    entries.unshift({
        id: uid(),
        date: today(),
        title: 'Quick note',
        content: text,
        tags: ['quick']
    });
    set(K.journal, entries);
    el.value = '';
    toast('Saved to journal!');
    if (typeof refreshDashboard === 'function') refreshDashboard();
}


function renderDashboardCommandDeck() {
    const host = document.getElementById('dashCommandDeck');
    if (!host) return;
    const tasks = arr(K.tasks);
    const todayStr = today();
    const overdue = tasks.filter(t => !taskIsCompleted(t) && taskDueDate(t) && taskDueDate(t) < todayStr).length;
    const dueToday = tasks.filter(t => !taskIsCompleted(t) && taskDueDate(t) === todayStr).length;
    const dueSoon = tasks.filter(t => !taskIsCompleted(t) && taskDueDate(t) && taskDueDate(t) > todayStr).sort((a,b)=>taskDueDate(a).localeCompare(taskDueDate(b))).slice(0,3);
    const learn = window.METRICS?.getLearningIntegrity ? METRICS.getLearningIntegrity() : (typeof LEARN !== 'undefined' && LEARN.getLearningIntegrityIndex ? LEARN.getLearningIntegrityIndex() : null);
    const operator = window.METRICS?.getOperatorScore ? METRICS.getOperatorScore() : (typeof getOperatorScore === 'function' ? getOperatorScore() : null);
    const system = window.METRICS?.getSystemStatus ? METRICS.getSystemStatus() : (typeof getSystemStatus === 'function' ? getSystemStatus() : null);
    const nextMove = typeof intelRecommendNextMove === 'function' ? intelRecommendNextMove() : null;
    const reason = nextMove?.reason || nextMove?.desc || nextMove?.description || 'System is ready. Execute the highest-value block.';
    const title = nextMove?.title || nextMove?.label || nextMove?.action || 'Primary recommendation';
    const actions = [];
    const commitmentHorizon = window.COMMITMENTS ? COMMITMENTS.scanHorizon(7) : null;
    if (commitmentHorizon?.seriousIssues?.length) actions.push({ label:`Review ${commitmentHorizon.seriousIssues.length} schedule warning${commitmentHorizon.seriousIssues.length === 1 ? '' : 's'}`, target:'commitments' });
    if (overdue || dueToday) actions.push({ label:`Clear ${overdue + dueToday} urgent task${overdue + dueToday === 1 ? '' : 's'}`, target:'tasks' });
    if (learn?.index !== null && learn?.index !== undefined && learn.index < 70) actions.push({ label:'Raise learning integrity with a doctrine drill', target:'doctrine' });
    if ((operator?.composite || 100) < 70) actions.push({ label:'Stabilize operator system', target:'protocol' });
    if ((arr(K.flashcards).filter(c => !c.nextReview || c.nextReview <= todayStr).length) > 0) actions.push({ label:'Review due flashcards', target:'flashcards' });
    if (!actions.length) actions.push({ label:'Open dashboard next move', target:'dashboard' });

    host.innerHTML = `
        <div style="display:grid;grid-template-columns:1.3fr 0.9fr;gap:16px;align-items:start;">
            <div style="padding:16px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg, color-mix(in srgb, var(--accent) 7%, var(--bg-secondary)), var(--bg-secondary));">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                    <div style="font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);">Primary system recommendation</div>
                    <span class="badge badge-blue">Visible upgrade</span>
                </div>
                <div style="font-size:1.2rem;font-weight:800;margin-bottom:8px;">${esc(title)}</div>
                <div style="color:var(--text-secondary);line-height:1.7;margin-bottom:12px;">${esc(reason)}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">${actions.slice(0,3).map(a => `<button class="btn btn-sm btn-secondary" onclick="${a.target === 'commitments' ? 'openCommitmentCenter()' : `go('${a.target}')`}">${esc(a.label)} →</button>`).join('')}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="summary-card"><div class="summary-kicker">Urgent</div><div class="summary-value">${overdue + dueToday}</div><div class="summary-hint">${overdue} overdue • ${dueToday} today</div></div>
                <div class="summary-card"><div class="summary-kicker">Learning</div><div class="summary-value">${learn?.index ?? '—'}</div><div class="summary-hint">integrity index</div></div>
                <div class="summary-card"><div class="summary-kicker">Operator</div><div class="summary-value">${operator?.composite ?? '—'}</div><div class="summary-hint">${esc(operator?.label || 'readiness')}</div></div>
                <div class="summary-card"><div class="summary-kicker">System</div><div class="summary-value">${system?.score ?? '—'}</div><div class="summary-hint">${esc(system?.label || 'status')}</div></div>
            </div>
        </div>
        <div style="margin-top:12px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--bg-secondary);">
            <div style="font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;">Near-term pressure scan</div>
            ${dueSoon.length ? dueSoon.map(t => `<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--border);"><div style="font-weight:600;">${esc(t.title || 'Untitled task')}</div><div style="color:var(--text-muted);font-size:0.85rem;">${esc(taskDueDate(t))}</div></div>`).join('') : '<div class="muted">No dated tasks coming up.</div>'}
        </div>
    `;
}

// ==================== V23: Find What You Need — simple live filter ====================
// Plain substring match over the existing static directory rows on the
// dashboard. No search engine, no dependencies — matches CLAUDE.md's
// "vanilla JS only" rule and the plan's "no AI needed" note.
function filterFindWhatYouNeed(val) {
    var q = String(val || '').toLowerCase().trim();
    document.querySelectorAll('.ux-dir-row').forEach(function(row) {
        var text = row.textContent.toLowerCase();
        row.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
    });
}
