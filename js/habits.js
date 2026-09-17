// ==================== HABITS ====================
let editingHabitId = null;

function renderHabits() {
    const habits = arr(K.habits);
    const logs = arr(K.habitLogs);
    if (typeof renderHabitConflictSummary === 'function') renderHabitConflictSummary();
    const commitmentHorizon = window.COMMITMENTS ? COMMITMENTS.scanHorizon(7) : null;
    const todayDone = habits.filter(h => logs.some(l => l.habitId === h.id && l.date === today())).length;
    let longestStreak = 0;
    habits.forEach(h => {
        let streak = 0, d = new Date();
        while (logs.some(l => l.habitId === h.id && l.date === fmtDate(d))) { streak++; d.setDate(d.getDate() - 1); }
        if (streak > longestStreak) longestStreak = streak;
    });
    document.getElementById('habitsActive').textContent = habits.length;
    document.getElementById('habitsTodayDone').textContent = todayDone;
    document.getElementById('habitsLongestStreak').textContent = longestStreak + '🔥';

    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push({ date: fmtDate(d), day: d.toLocaleDateString('en-US', { weekday: 'short' }), num: d.getDate() }); }

    if (!habits.length) {
        document.getElementById('habitsContainer').innerHTML = `<div class="empty" style="padding:60px 20px;"><div style="font-size:3rem;margin-bottom:16px;">✨</div><div style="font-size:1.1rem;margin-bottom:8px;">No habits yet</div><div style="color:var(--text-muted);margin-bottom:20px;">Start with just ONE habit</div><button class="btn btn-primary" onclick="openHabitModal()">➕ Create Habit</button></div>`;
        return;
    }
    document.getElementById('habitsContainer').innerHTML = habits.map(h => {
        let streak = 0, d = new Date();
        while (logs.some(l => l.habitId === h.id && l.date === fmtDate(d))) { streak++; d.setDate(d.getDate() - 1); }
        // Recipe display
        let recipe = '';
        if (h.anchor) recipe += '<div style="font-size:0.8rem;color:var(--accent);font-style:italic;margin-top:4px;">🔗 After I ' + esc(h.anchor) + ', I will ' + esc(h.name) + '</div>';
        if (h.tiny) recipe += '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">⏱️ 2-min: ' + esc(h.tiny) + '</div>';
        if (h.location) recipe += '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">📍 ' + esc(h.location) + '</div>';
        if (h.time) recipe += '<div class="habit-schedule">🕒 ' + esc(h.time) + ' · ' + (window.COMMITMENTS ? COMMITMENTS.formatDuration(parseInt(h.duration || 10, 10)) : esc(h.duration || '10') + 'm') + ' · ' + esc(h.category || 'routine') + '</div>';
        const conflictCount = commitmentHorizon ? commitmentHorizon.issues.filter(issue => (issue.entities || []).some(entity => entity.kind === 'habit' && String(entity.id) === String(h.id))).length : 0;
        return `
            <div class="habit-card">
                <div class="habit-header">
                    <div style="cursor:pointer;" onclick="editHabit('${h.id}')">
                        <span class="habit-name">${esc(h.name)}</span>
                        ${recipe}
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">${conflictCount ? `<span class="commitment-mini-warning">! ${conflictCount}</span>` : ''}<span class="habit-streak">${streak > 0 ? streak + '🔥' : ''}</span></div>
                </div>
                <div class="habit-grid">
                    ${days.map(day => {
                        const done = logs.some(l => l.habitId === h.id && l.date === day.date);
                        const isToday = day.date === today();
                        return '<div class="habit-day ' + (done ? 'done' : '') + ' ' + (isToday ? 'today' : '') + '" onclick="toggleHabitDay(\'' + h.id + '\',\'' + day.date + '\')" title="' + day.day + '">' + (done ? '✓' : day.num) + '</div>';
                    }).join('')}
                </div>
            </div>`;
    }).join('');
}


// V8: momentum
renderHabitsMomentum();

function toggleHabitDay(hid, dt) {
    const logs = arr(K.habitLogs);
    const i = logs.findIndex(l => l.habitId === hid && l.date === dt);
    if (i !== -1) logs.splice(i, 1); else logs.push({ id: uid(), habitId: hid, date: dt });
    set(K.habitLogs, logs); renderHabits(); refreshDashboard();
}

function openHabitModal() {
    editingHabitId = null;
    document.getElementById('habitName').value = '';
    var a = document.getElementById('habitAnchor'); if (a) a.value = '';
    var t = document.getElementById('habitTiny'); if (t) t.value = '';
    var l = document.getElementById('habitLocation'); if (l) l.value = '';
    document.getElementById('habitTime').value = '';
    document.getElementById('habitDuration').value = '10';
    document.getElementById('habitCategory').value = 'routine';
    document.getElementById('habitDeleteBtn').style.display = 'none';
    openModal('habitModal');
    refreshHabitConflictPreview();
}

function editHabit(id) {
    const h = arr(K.habits).find(x => x.id === id);
    if (!h) return;
    editingHabitId = id;
    document.getElementById('habitName').value = h.name;
    var a = document.getElementById('habitAnchor'); if (a) a.value = h.anchor || '';
    var t = document.getElementById('habitTiny'); if (t) t.value = h.tiny || '';
    var l = document.getElementById('habitLocation'); if (l) l.value = h.location || '';
    document.getElementById('habitTime').value = h.time || '';
    document.getElementById('habitDuration').value = h.duration || '10';
    document.getElementById('habitCategory').value = h.category || 'routine';
    document.getElementById('habitDeleteBtn').style.display = 'block';
    openModal('habitModal');
    refreshHabitConflictPreview();
}

function habitCandidateFromForm() {
    return {
        id: editingHabitId || 'candidate-habit',
        kind: 'habit',
        title: document.getElementById('habitName').value.trim() || 'New habit',
        date: today(),
        time: document.getElementById('habitTime').value || '',
        duration: document.getElementById('habitDuration').value || '10',
        category: document.getElementById('habitCategory').value || 'routine'
    };
}

function refreshHabitConflictPreview() {
    if (typeof commitmentRenderCandidatePreview !== 'function') return null;
    return commitmentRenderCandidatePreview('habitConflictPreview', habitCandidateFromForm(), editingHabitId ? { kind:'habit', id:editingHabitId } : null);
}

function saveHabit(force) {
    const name = document.getElementById('habitName').value.trim();
    if (!name) { toast('Enter name'); return; }
    const candidate = habitCandidateFromForm();
    if (!force && window.COMMITMENTS) {
        const evaluation = COMMITMENTS.evaluateCandidate(candidate, editingHabitId ? { kind:'habit', id:editingHabitId } : null);
        if (commitmentPromptForSave(candidate, evaluation, function(){ saveHabit(true); }, { title:'Habit time conflicts with the current plan', timeFieldId:'habitTime', sourceModalId:'habitModal', afterTime:refreshHabitConflictPreview })) return;
    }
    const habits = arr(K.habits);
    const anchor = (document.getElementById('habitAnchor') || {}).value?.trim() || '';
    const tiny = (document.getElementById('habitTiny') || {}).value?.trim() || '';
    const location = (document.getElementById('habitLocation') || {}).value?.trim() || '';
    const time = candidate.time || null;
    const duration = candidate.duration || '10';
    const category = candidate.category || 'routine';
    if (editingHabitId) {
        const i = habits.findIndex(h => h.id === editingHabitId);
        if (i !== -1) { habits[i].name = name; habits[i].anchor = anchor; habits[i].tiny = tiny; habits[i].location = location; habits[i].time = time; habits[i].duration = duration; habits[i].category = category; }
    } else {
        habits.push({ id: uid(), name, anchor, tiny, location, time, duration, category });
    }
    set(K.habits, habits); closeModal('habitModal'); renderHabits(); toast('Saved!');
}

function deleteHabit() {
    if (!editingHabitId || !confirm('Delete?')) return;
    set(K.habits, arr(K.habits).filter(h => h.id !== editingHabitId));
    set(K.habitLogs, arr(K.habitLogs).filter(l => l.habitId !== editingHabitId));
    closeModal('habitModal'); renderHabits(); toast('Deleted');
}


function renderHabitsMomentum(){
    const el=document.getElementById('habitsMomentum');
    if(el){
        const series=getBehaviorMomentumSeries(7);
        const avg=Math.round(series.reduce((s,x)=>s+x.score,0)/series.length);
        el.textContent = avg;
    }
    drawHabitsMomentumChart();
}

function drawHabitsMomentumChart(){
    const canvas=document.getElementById('habitsMomentumChart');
    if(!canvas || typeof getBehaviorMomentumSeries!=='function') return;
    const ctx=canvas.getContext('2d');
    const series=getBehaviorMomentumSeries(30);
    const w=canvas.width = canvas.clientWidth * (window.devicePixelRatio||1);
    const h=canvas.height = 120 * (window.devicePixelRatio||1);
    ctx.clearRect(0,0,w,h);

    // Grid
    ctx.globalAlpha=0.35;
    ctx.lineWidth=1;
    ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--border') || '#2a2f3a';
    for(let i=0;i<=4;i++){
        const y = (h/4)*i;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    }
    ctx.globalAlpha=1;

    // Line
    const max=100, min=0;
    const pad=12*(window.devicePixelRatio||1);
    const innerW=w-pad*2, innerH=h-pad*2;
    const step=innerW/(series.length-1 || 1);

    const toY = (score)=> pad + (1-((score-min)/(max-min)))*innerH;

    ctx.lineWidth=2*(window.devicePixelRatio||1);
    ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#3b82f6';
    ctx.beginPath();
    series.forEach((pt,i)=>{
        const x=pad + i*step;
        const y=toY(pt.score);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();

    // Points (last point)
    const last=series[series.length-1];
    const lx=pad + (series.length-1)*step;
    const ly=toY(last.score);
    ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#3b82f6';
    ctx.beginPath(); ctx.arc(lx,ly,3*(window.devicePixelRatio||1),0,Math.PI*2); ctx.fill();

    // Label
    ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text-muted') || '#a7b0c3';
    ctx.font=`${12*(window.devicePixelRatio||1)}px system-ui`;
    ctx.fillText(`Today: ${last.score}/100`, pad, h - 8*(window.devicePixelRatio||1));
}

// Ensure chart redraw on resize
window.addEventListener('resize', ()=>{ 
    // V17 fix: 'habits' page id no longer exists — habits lives in the dailyops page, tab-habits panel
    const panel = document.getElementById('tab-habits');
    if(panel && panel.style.display !== 'none' && document.getElementById('dailyops')?.classList.contains('active')) drawHabitsMomentumChart();
});
