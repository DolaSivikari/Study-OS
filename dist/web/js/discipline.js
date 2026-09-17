// ==================== DISCIPLINE ====================
function renderDiscipline() {
    const disc = get(K.discipline) || {};
    const todayDisc = disc[today()] || {};

    // Update date header
    const dateEl = document.getElementById('disciplineDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    // Calculate scores
    const score = DISCIPLINES.reduce((s, d) => s + (todayDisc[d.id] || 0), 0);
    const max = DISCIPLINES.reduce((s, d) => s + d.max, 0);
    const streak = calcDisciplineStreak();
    const weekAvg = calcWeeklyAverage();

    // Update stats
    document.getElementById('disciplineStreak').textContent = streak;
    document.getElementById('disciplineAvg').textContent = weekAvg + '%';
    document.getElementById('disciplineTodayScore').textContent = `${score}/${max}`;
    document.getElementById('disciplineProgress').style.width = `${(score / max) * 100}%`;

    // Render discipline items with dots
    document.getElementById('disciplineItems').innerHTML = DISCIPLINES.map(d => {
        const itemScore = todayDisc[d.id] || 0;
        return `
            <div class="discipline-item">
                <div class="discipline-info">
                    <div class="discipline-name">${d.name}</div>
                    <div class="discipline-desc">${d.desc}</div>
                </div>
                <div class="discipline-dots">
                    ${[2, 4, 6, 8, 10].map(v => `
                        <div class="discipline-dot ${itemScore >= v ? 'filled' : ''}"
                             onclick="setDiscipline('${d.id}', ${itemScore >= v ? v - 2 : v})"
                             title="${v}/10">${itemScore >= v ? '✓' : ''}</div>
                    `).join('')}
                </div>
                <div class="discipline-score">${itemScore}</div>
            </div>
        `;
    }).join('');

    // Render 7-day heatmap
    renderDisciplineHeatmap();

    // Render new sections
    renderCommTracker();
    renderEnergyTracker();
}

// ==================== COMMUNICATION PRACTICE TRACKER ====================
function renderCommTracker() {
    const tracker = get(K.commTracker) || {};
    const todayData = tracker[today()] || { activities: [], qualityBehaviors: [], outcome: null, note: '' };
    const todayActivities = Array.isArray(todayData.activities) ? todayData.activities : [];
    const todayQuality = Array.isArray(todayData.qualityBehaviors) ? todayData.qualityBehaviors : [];

    // Calculate streak: consecutive days going back from yesterday with ≥1 activity
    let streak = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (true) {
        const ds = fmtDate(d);
        const day = tracker[ds];
        if (day && ((day.activities && day.activities.length > 0) || (day.qualityBehaviors && day.qualityBehaviors.length > 0))) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }

    const streakEl = document.getElementById('commStreak');
    if (streakEl) streakEl.textContent = streak + ' day streak';

    const container = document.getElementById('commActivities');
    if (!container) return;

    container.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
        COMM_ACTIVITIES.map(act => {
            const checked = todayActivities.includes(act.id);
            const bg    = checked ? 'var(--accent-light)' : 'var(--bg-tertiary)';
            const border = checked ? 'var(--accent)' : 'var(--border)';
            const color  = checked ? 'var(--accent)' : 'var(--text-secondary)';
            return `<button onclick="toggleCommActivity('${act.id}')" style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:20px;background:${bg};border:1px solid ${border};color:${color};cursor:pointer;font-size:0.82rem;">${act.icon}${checked ? ' ✓ ' : ' '}${esc(act.name)}</button>`;
        }).join('') + '</div>';

    const qualityEl = document.getElementById('commQualityBehaviors');
    if (qualityEl) {
        const behaviors = Array.isArray(window.COMM_QUALITY_BEHAVIORS) ? window.COMM_QUALITY_BEHAVIORS : [];
        qualityEl.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + behaviors.map(act => {
            const checked = todayQuality.includes(act.id);
            return `<button onclick="toggleCommQualityBehavior('${act.id}')" class="communication-quality-chip ${checked ? 'is-selected' : ''}" aria-pressed="${checked}">${act.icon}${checked ? ' ✓ ' : ' '}${esc(act.name)}</button>`;
        }).join('') + '</div>';
    }

    const outcomeEl = document.getElementById('commOutcome');
    if (outcomeEl) {
        const labels = ['Missed','Partial','Clear','Confirmed','Changed action'];
        outcomeEl.innerHTML = [1,2,3,4,5].map(level => `<button onclick="setCommOutcome(${level})" class="${Number(todayData.outcome) === level ? 'is-selected' : ''}" aria-pressed="${Number(todayData.outcome) === level}"><strong>${level}</strong><span>${labels[level-1]}</span></button>`).join('');
    }

    const noteEl = document.getElementById('commNote');
    if (noteEl) {
        noteEl.value = todayData.note || '';
        noteEl.onblur = saveCommNote;
    }
}

function ensureTodayCommunicationRow(tracker) {
    if (!tracker[today()] || typeof tracker[today()] !== 'object') tracker[today()] = {};
    if (!Array.isArray(tracker[today()].activities)) tracker[today()].activities = [];
    if (!Array.isArray(tracker[today()].qualityBehaviors)) tracker[today()].qualityBehaviors = [];
    if (!Object.prototype.hasOwnProperty.call(tracker[today()], 'outcome')) tracker[today()].outcome = null;
    if (typeof tracker[today()].note !== 'string') tracker[today()].note = '';
    return tracker[today()];
}

function toggleCommActivity(actId) {
    const tracker = get(K.commTracker) || {};
    const row = ensureTodayCommunicationRow(tracker);
    const activities = row.activities;
    const idx = activities.indexOf(actId);
    if (idx !== -1) activities.splice(idx, 1);
    else activities.push(actId);
    set(K.commTracker, tracker);
    renderCommTracker();
}

function toggleCommQualityBehavior(actId) {
    const tracker = get(K.commTracker) || {};
    const row = ensureTodayCommunicationRow(tracker);
    const behaviors = row.qualityBehaviors;
    const idx = behaviors.indexOf(actId);
    if (idx !== -1) behaviors.splice(idx, 1);
    else behaviors.push(actId);
    set(K.commTracker, tracker);
    renderCommTracker();
}

function setCommOutcome(level) {
    const tracker = get(K.commTracker) || {};
    const row = ensureTodayCommunicationRow(tracker);
    const next = Math.max(1, Math.min(5, parseInt(level,10) || 0));
    row.outcome = row.outcome === next ? null : next;
    set(K.commTracker, tracker);
    renderCommTracker();
}

function saveCommNote() {
    const noteEl = document.getElementById('commNote');
    if (!noteEl) return;
    const tracker = get(K.commTracker) || {};
    const row = ensureTodayCommunicationRow(tracker);
    row.note = noteEl.value.trim();
    set(K.commTracker, tracker);
}

// ==================== ENERGY MANAGEMENT TRACKER ====================
function renderEnergyTracker() {
    const tracker = get(K.energyTracker) || {};
    const protocol = get(K.protocol) || {};
    const protocolEnergy = parseInt(protocol[today()]?.energy || 0, 10);
    if (protocolEnergy && !tracker[today()]?.protocolEnergy && typeof syncProtocolEnergyToTracker === 'function') {
        syncProtocolEnergyToTracker(protocolEnergy);
    }
    const currentTracker = get(K.energyTracker) || {};
    const todayData = currentTracker[today()] || { level: 0, activities: [] };
    const todayActivities = Array.isArray(todayData.activities) ? todayData.activities : [];

    // Energy level buttons
    const levelColors = ['', 'var(--danger)', '#f97316', 'var(--warning)', 'var(--success)', '#16a34a'];
    const ratingEl = document.getElementById('energyRating');
    if (ratingEl) {
        ratingEl.innerHTML = [1, 2, 3, 4, 5].map(level => {
            const selected = todayData.level === level;
            const color = levelColors[level];
            return `<button onclick="setEnergyLevel(${level})" style="width:40px;height:40px;border-radius:50%;cursor:pointer;font-weight:700;font-size:0.95rem;background:${selected ? color : 'var(--bg-tertiary)'};border:2px solid ${selected ? color : 'var(--border)'};color:${selected ? 'white' : 'var(--text-secondary)'};">${level}</button>`;
        }).join('');
    }

    // Activity tags
    const actEl = document.getElementById('energyActivities');
    if (actEl) {
        actEl.innerHTML = ENERGY_ACTIVITIES.map(act => {
            const checked = todayActivities.includes(act.id);
            const bg     = checked ? (act.type === 'charge' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)') : 'var(--bg-tertiary)';
            const border = checked ? (act.type === 'charge' ? 'var(--success)' : 'var(--danger)') : 'var(--border)';
            const color  = checked ? (act.type === 'charge' ? 'var(--success)' : 'var(--danger)') : 'var(--text-secondary)';
            return `<button onclick="toggleEnergyActivity('${act.id}')" style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:20px;background:${bg};border:1px solid ${border};color:${color};cursor:pointer;font-size:0.8rem;">${act.icon} ${esc(act.name)}</button>`;
        }).join('');
    }

    // Insight block
    const insightEl = document.getElementById('energyInsight');
    if (insightEl) {
        const baseline = todayData.protocolEnergy
            ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Morning baseline: <strong style="color:var(--text-primary);">${todayData.protocolEnergy}/10 → ${Math.ceil(todayData.protocolEnergy/2)}/5</strong>${todayData.source === 'manual' ? ' · current rating set manually' : ''}</div>`
            : '';
        insightEl.innerHTML = baseline + getEnergyInsight();
    }
}

function setEnergyLevel(level) {
    const tracker = get(K.energyTracker) || {};
    if (!tracker[today()]) tracker[today()] = { level: 0, activities: [] };
    if (!Array.isArray(tracker[today()].activities)) tracker[today()].activities = [];
    tracker[today()].level = level;
    tracker[today()].source = 'manual';
    set(K.energyTracker, tracker);
    renderEnergyTracker();
}

function toggleEnergyActivity(actId) {
    const tracker = get(K.energyTracker) || {};
    if (!tracker[today()]) tracker[today()] = { level: 0, activities: [] };
    if (!Array.isArray(tracker[today()].activities)) tracker[today()].activities = [];
    const activities = tracker[today()].activities;
    const idx = activities.indexOf(actId);
    if (idx !== -1) activities.splice(idx, 1);
    else activities.push(actId);
    set(K.energyTracker, tracker);
    renderEnergyTracker();
}

function getEnergyInsight() {
    const tracker = get(K.energyTracker) || {};

    // Last 30 days avg
    const days = [];
    for (let i = 1; i <= 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(fmtDate(d));
    }

    const rated = days.filter(ds => tracker[ds] && tracker[ds].level > 0);
    if (rated.length < 3) {
        return '<div style="font-size:0.8rem;color:var(--text-muted);">Log energy for 3+ days to see insights.</div>';
    }

    const avg = (rated.reduce((s, ds) => s + tracker[ds].level, 0) / rated.length).toFixed(1);

    // Per-activity average energy
    const actStats = {};
    days.forEach(ds => {
        const day = tracker[ds];
        if (!day || !day.level) return;
        (day.activities || []).forEach(actId => {
            if (!actStats[actId]) actStats[actId] = { total: 0, count: 0 };
            actStats[actId].total += day.level;
            actStats[actId].count++;
        });
    });

    const sorted = Object.entries(actStats)
        .filter(([, v]) => v.count >= 2)
        .map(([id, v]) => ({ id, avg: v.total / v.count }))
        .sort((a, b) => b.avg - a.avg);

    const chargers = sorted.slice(0, 3).map(x => {
        const act = ENERGY_ACTIVITIES.find(a => a.id === x.id);
        return act ? act.icon + ' ' + act.name : x.id;
    });
    const drainers = sorted.slice(-3).reverse().map(x => {
        const act = ENERGY_ACTIVITIES.find(a => a.id === x.id);
        return act ? act.icon + ' ' + act.name : x.id;
    });

    return `
        <div style="font-size:0.8rem;color:var(--text-muted);background:var(--bg-tertiary);padding:10px 12px;border-radius:8px;">
            <span style="color:var(--text-primary);font-weight:600;">30-day avg: ${avg}/5</span>
            ${chargers.length ? `<div style="margin-top:6px;">⚡ Chargers: <span style="color:var(--success);">${chargers.join(', ')}</span></div>` : ''}
            ${drainers.length && drainers[0] !== chargers[0] ? `<div style="margin-top:4px;">🪫 Drainers: <span style="color:var(--danger);">${drainers.join(', ')}</span></div>` : ''}
        </div>
    `;
}

function renderDisciplineHeatmap() {
    const disc = get(K.discipline) || {};
    const max = DISCIPLINES.reduce((s, d) => s + d.max, 0);
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = fmtDate(d);
        const dayScore = disc[ds] ? DISCIPLINES.reduce((s, x) => s + (disc[ds][x.id] || 0), 0) : 0;
        const pct = Math.round((dayScore / max) * 100);
        const level = pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low';
        days.push({
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            score: pct,
            level: dayScore > 0 ? level : ''
        });
    }
    
    const heatmapEl = document.getElementById('disciplineHeatmap');
    if (heatmapEl) {
        heatmapEl.innerHTML = days.map(d => `
            <div class="heatmap-day ${d.level}">
                <div class="heatmap-day-name">${d.name}</div>
                <div class="heatmap-day-score">${d.score}%</div>
            </div>
        `).join('');
    }
}

function calcWeeklyAverage() {
    const disc = get(K.discipline) || {};
    const max = DISCIPLINES.reduce((s, d) => s + d.max, 0);
    let total = 0, count = 0;
    
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = fmtDate(d);
        if (disc[ds]) {
            const dayScore = DISCIPLINES.reduce((s, x) => s + (disc[ds][x.id] || 0), 0);
            total += dayScore;
            count++;
        }
    }
    return count > 0 ? Math.round((total / (count * max)) * 100) : 0;
}

function setDiscipline(id, val) {
    const disc = get(K.discipline) || {};
    if (!disc[today()]) disc[today()] = {};
    disc[today()][id] = Math.max(0, val);
    set(K.discipline, disc);
    renderDiscipline();
    refreshDashboard();
}

// V56: orphaned updateDisciplineScore() removed — scoring is rendered by
// renderDiscipline() (audit R3).

function calcDisciplineStreak() {
    const disc = get(K.discipline) || {};
    let streak = 0;
    let d = new Date();
    const max = DISCIPLINES.reduce((s, x) => s + x.max, 0);
    const threshold = max * 0.5;
    
    while (true) {
        const ds = fmtDate(d);
        const dayScore = disc[ds] ? DISCIPLINES.reduce((s, x) => s + (disc[ds][x.id] || 0), 0) : 0;
        if (dayScore >= threshold) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else if (streak === 0 && ds === today()) {
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}
