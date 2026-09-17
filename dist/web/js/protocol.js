// ==================== PROTOCOL ====================
function renderProtocol() {
    const h = new Date().getHours();
    const m = new Date().getMinutes();
    const isEvening = h >= 18;
    const proto = get(K.protocol) || {};
    const todayProto = proto[today()] || {};
    
    // Update time display
    const timeEl = document.getElementById('protocolTime');
    if (timeEl) timeEl.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
    
    // Update title
    const titleEl = document.getElementById('protocolTitle');
    if (titleEl) titleEl.innerHTML = isEvening ? '<span>🌙</span> Evening Debrief' : '<span>🌅</span> Morning Protocol';
    
    const steps = isEvening ? [
        { id: 'review', title: 'Review the day', desc: 'What got done? What didn\'t?', icon: '📋' },
        { id: 'wins', title: 'Capture wins', desc: 'What went well? What did you learn?', icon: '🏆' },
        { id: 'tomorrow', title: 'Plan tomorrow', desc: 'What\'s the #1 priority for tomorrow?', icon: '📅' },
        { id: 'gratitude', title: 'Gratitude', desc: 'Name one thing you\'re grateful for today', icon: '🙏' }
    ] : [
        { id: 'wake', title: 'Wake with purpose', desc: 'No phone for first 30 minutes', icon: '⏰' },
        { id: 'hydrate', title: 'Hydrate + Move', desc: 'Water, stretch, or short walk', icon: '💧' },
        { id: 'intentionStep', title: 'Set intention', desc: 'Specify what, when, and where', icon: '🎯' },
        { id: 'plan', title: 'Review plan', desc: 'Check tasks, calendar, learning goals', icon: '📋' },
        { id: 'start', title: 'Start hardest task', desc: 'Begin before checking email/messages', icon: '🚀' }
    ];
    
    // Calculate progress
    const completed = steps.filter(s => todayProto[s.id]).length;
    const progressPct = Math.round((completed / steps.length) * 100);
    
    const progressEl = document.getElementById('protocolProgress');
    const progressBar = document.getElementById('protocolProgressBar');
    if (progressEl) progressEl.textContent = `${completed}/${steps.length}`;
    if (progressBar) progressBar.style.width = `${progressPct}%`;
    
    // Render steps
    document.getElementById('protocolSteps').innerHTML = steps.map((s, i) => `
        <div class="protocol-step-card ${todayProto[s.id] ? 'done' : ''}" onclick="toggleProtocolStep('${s.id}')">
            <div class="protocol-step-num">${todayProto[s.id] ? '✓' : i + 1}</div>
            <div class="protocol-step-content">
                <div class="protocol-step-title">${s.icon} ${s.title}</div>
                <div class="protocol-step-desc">${s.desc}</div>
            </div>
        </div>
    `).join('');
    
    // Energy selector
    const energySel = document.getElementById('energySelector');
    if (energySel) {
        const currentEnergy = parseInt(todayProto.energy || 7, 10);
        const energyInput = document.getElementById('protocolEnergy');
        if (energyInput) energyInput.value = String(currentEnergy);
        energySel.innerHTML = [1,2,3,4,5,6,7,8,9,10].map(n => {
            const level = n <= 3 ? 'low' : n <= 6 ? 'mid' : 'high';
            const selected = n === parseInt(currentEnergy) ? 'selected' : '';
            return `<button type="button" class="energy-btn ${level} ${selected}" onclick="setProtocolEnergy(${n})">${n}</button>`;
        }).join('');
    }
    
    document.getElementById('protocolIntention').value = typeof todayProto.intention === 'string' ? todayProto.intention : '';
}

function toggleProtocolStep(stepId) {
    const proto = get(K.protocol) || {};
    if (!proto[today()]) proto[today()] = {};
    proto[today()][stepId] = !proto[today()][stepId];
    set(K.protocol, proto);
    renderProtocol();
}

function setProtocolEnergy(val) {
    const proto = get(K.protocol) || {};
    if (!proto[today()]) proto[today()] = {};
    proto[today()].energy = val;
    document.getElementById('protocolEnergy').value = val;
    set(K.protocol, proto);
    syncProtocolEnergyToTracker(val);
    renderProtocol();
}

function syncProtocolEnergyToTracker(val) {
    const protocolEnergy = Math.max(1, Math.min(10, parseInt(val, 10) || 0));
    if (!protocolEnergy) return;
    const tracker = get(K.energyTracker) || {};
    const current = tracker[today()] || { level: 0, activities: [] };
    const hasManualRating = current.source === 'manual' || (current.source === undefined && current.level > 0);
    // A manual Discipline rating is an in-day/end-of-day observation. Keep it,
    // while retaining the Protocol value as the morning baseline.
    const next = {
        ...current,
        activities: Array.isArray(current.activities) ? current.activities : [],
        protocolEnergy,
        level: hasManualRating ? current.level : Math.ceil(protocolEnergy / 2),
        source: hasManualRating ? 'manual' : 'protocol'
    };
    tracker[today()] = next;
    set(K.energyTracker, tracker);
}

function completeProtocol() {
    const proto = get(K.protocol) || {};
    const h = new Date().getHours();
    const isEvening = h >= 18;
    
    const current = proto[today()] || {};
    const energy = Math.max(1, Math.min(10, parseInt(document.getElementById('protocolEnergy').value, 10) || 7));
    const intention = document.getElementById('protocolIntention').value.trim();
    const phaseUpdate = isEvening
        ? { evening: true, review: true, wins: true, tomorrow: true, gratitude: true }
        : { morning: true, wake: true, hydrate: true, intentionStep: true, plan: true, start: true };
    const next = { ...current, ...phaseUpdate, intention, energy };
    next.completed = !!(next.morning && next.evening);
    proto[today()] = next;
    set(K.protocol, proto);
    syncProtocolEnergyToTracker(energy);
    toast('Protocol complete! 🌟');
    renderProtocol();
    refreshDashboard();
}
