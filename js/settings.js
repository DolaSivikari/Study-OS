// ==================== SETTINGS ====================
// Enhanced with Phase 6: Learning Science Settings

function getSettings() { 
    return get(K.settings) || { 
        name:'Hebun', 
        vision:'Architect of Critical Infrastructure', 
        values:'Discipline, Excellence, Growth',
        spacingStretch: 10,
        interleaveDefault: true,
        requireElaboration: false
    }; 
}

function loadSettings() { 
    const s = getSettings(); 
    document.getElementById('settingName').value = s.name || ''; 
    document.getElementById('settingVision').value = s.vision || ''; 
    document.getElementById('settingValues').value = s.values || '';
    
    // Learning Science settings (Phase 6)
    const stretchEl = document.getElementById('settingSpacingStretch');
    if (stretchEl) {
        stretchEl.value = s.spacingStretch || 10;
        const label = document.getElementById('stretchLabel');
        if (label) label.textContent = (s.spacingStretch || 10) + '%';
    }
    const interleaveEl = document.getElementById('settingInterleave');
    if (interleaveEl) interleaveEl.checked = s.interleaveDefault !== false;
    const elaborateEl = document.getElementById('settingElaboration');
    if (elaborateEl) elaborateEl.checked = !!s.requireElaboration;
    
    // Show last backup date from the registered storage contract.
    const lastBackup = get(K.lastBackup);
    const backupText = document.getElementById('lastBackupText');
    if (backupText) {
        if (lastBackup) {
            const days = Math.floor((Date.now() - new Date(lastBackup)) / (1000 * 60 * 60 * 24));
            backupText.textContent = `Last backup: ${days === 0 ? 'Today' : days + ' days ago'}`;
            const reminder = document.getElementById('backupReminder');
            if (days >= 7 && reminder) {
                reminder.style.borderColor = 'var(--danger)';
                reminder.style.background = 'linear-gradient(135deg, var(--bg-secondary), rgba(239,68,68,0.15))';
            }
        } else {
            backupText.textContent = 'Last backup: Never - please backup your data!';
        }
    }
    
    renderProgressSummary();
}

function markBackup() {
    set(K.lastBackup, new Date().toISOString());
    loadSettings();
}

function renderProgressSummary() {
    const time = arr(K.time);
    const goals = arr(K.goals);
    const cards = arr(K.flashcards);
    const contacts = arr(K.contacts);
    const pmpProgress = get(K.pmpProgress) || {};
    
    const totalHours = time.reduce((s, t) => s + (parseFloat(t.duration) || 0), 0);
    const studyHours = time.filter(t => t.category === 'study').reduce((s, t) => s + (parseFloat(t.duration) || 0), 0);
    const pmpProcesses = Object.values(pmpProgress).filter(v => v).length;
    const streak = calcDisciplineStreak();
    
    const summaryEl = document.getElementById('progressSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div style="background:var(--bg-tertiary);padding:14px;border-radius:8px;font-size:0.85rem;line-height:1.8;" id="summaryContent">
                <div><strong>Self-Development Progress:</strong></div>
                <div>• Total Learning: ${totalHours.toFixed(0)}h (${studyHours.toFixed(0)}h focused study)</div>
                <div>• PMP Process Mastery: ${pmpProcesses}/49 (${Math.round(pmpProcesses/49*100)}%)</div>
                <div>• Goals: ${goals.filter(g => !g.completed).length} active, ${goals.filter(g => g.completed).length} completed</div>
                <div>• Flashcards Created: ${cards.length}</div>
                <div>• Professional Network: ${contacts.length} contacts</div>
                <div>• Current Streak: ${streak} consecutive days</div>
            </div>
        `;
    }
}

function copyProgressSummary() {
    const content = document.getElementById('summaryContent');
    if (content) {
        navigator.clipboard.writeText(content.innerText).then(() => toast('Summary copied!')).catch(() => toast('Could not copy'));
    }
}

function saveSettings() { 
    const stretchEl = document.getElementById('settingSpacingStretch');
    const interleaveEl = document.getElementById('settingInterleave');
    const elaborateEl = document.getElementById('settingElaboration');
    
    set(K.settings, { 
        name: document.getElementById('settingName').value.trim() || 'Hebun', 
        vision: document.getElementById('settingVision').value.trim(),
        values: document.getElementById('settingValues').value.trim(),
        spacingStretch: stretchEl ? parseInt(stretchEl.value) || 10 : 10,
        interleaveDefault: interleaveEl ? interleaveEl.checked : true,
        requireElaboration: elaborateEl ? elaborateEl.checked : false
    }); 
    toast('Saved!'); 
    refreshDashboard(); 
}
