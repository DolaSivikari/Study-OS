// ==================== GOALS ====================
let editingGoalId = null;
let goalFilter = 'all';

function renderGoals() {
    const goals = arr(K.goals);
    
    // Goal stats
    const active = goals.filter(g => !g.completed).length;
    const completed = goals.filter(g => g.completed).length;
    const avgProgress = goals.length ? Math.round(goals.reduce((s, g) => s + goalProgress(g), 0) / goals.length) : 0;
    
    document.getElementById('goalStats').innerHTML = `
        <div class="card" style="text-align:center;padding:14px;">
            <div style="font-size:1.6rem;font-weight:700;color:var(--accent);">${active}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Active</div>
        </div>
        <div class="card" style="text-align:center;padding:14px;">
            <div style="font-size:1.6rem;font-weight:700;color:var(--success);">${completed}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Completed</div>
        </div>
        <div class="card" style="text-align:center;padding:14px;">
            <div style="font-size:1.6rem;font-weight:700;color:var(--purple);">${avgProgress}%</div>
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Avg Progress</div>
        </div>
    `;
    
    // Filters
    document.getElementById('goalFilters').innerHTML = `
        <button class="filter-btn ${goalFilter==='all'?'active':''}" onclick="setGoalFilter('all')">All</button>
        <button class="filter-btn ${goalFilter==='education'?'active':''}" onclick="setGoalFilter('education')">🎓 Education</button>
        <button class="filter-btn ${goalFilter==='career'?'active':''}" onclick="setGoalFilter('career')">💼 Career</button>
        <button class="filter-btn ${goalFilter==='health'?'active':''}" onclick="setGoalFilter('health')">💪 Health</button>
        <button class="filter-btn ${goalFilter==='personal'?'active':''}" onclick="setGoalFilter('personal')">🌟 Personal</button>
    `;
    
    renderGoalsList(goalFilter === 'all' ? goals : goals.filter(g => g.area === goalFilter));
}

function setGoalFilter(f) {
    goalFilter = f;
    renderGoals();
}

function renderGoalsList(goals) {
    if (!goals.length) {
        document.getElementById('goalsContainer').innerHTML = `
            <div class="empty" style="padding:60px 20px;">
                <div style="font-size:3rem;margin-bottom:16px;">🎯</div>
                <div style="font-size:1.1rem;margin-bottom:8px;">No goals yet</div>
                <div style="color:var(--text-muted);margin-bottom:20px;">Define what you want to achieve</div>
                <button class="btn btn-primary" onclick="openGoalModal()">➕ Create First Goal</button>
            </div>
        `;
        return;
    }
    
    document.getElementById('goalsContainer').innerHTML = goals.map(g => {
        const pct = goalProgress(g);
        const areaIcons = { education: '🎓', career: '💼', health: '💪', personal: '🌟' };
        
        const milestonesHtml = g.milestones?.length ? `
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
                ${g.milestones.map(m => `
                    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;cursor:pointer;" 
                         onclick="event.stopPropagation();toggleMilestone('${g.id}','${m.id}')">
                        <div class="task-check ${m.done ? 'done' : ''}">${m.done ? '✓' : ''}</div>
                        <span style="font-size:0.9rem;${m.done ? 'text-decoration:line-through;opacity:0.5;' : ''}">${esc(m.title)}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';
        
        return `
            <div class="goal-card" onclick="editGoal('${g.id}')">
                <div class="goal-header">
                    <div>
                        <div class="goal-title" style="${g.completed ? 'text-decoration:line-through;opacity:0.6;' : ''}">
                            ${areaIcons[g.area] || '🎯'} ${esc(g.title)}
                        </div>
                        <div class="goal-target">
                            <span class="badge badge-${g.area}">${g.area}</span>
                            ${g.target ? ` • Target: ${g.target}` : ''}
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <button class="btn btn-sm ${g.completed ? 'btn-secondary' : 'btn-primary'}" onclick="event.stopPropagation();toggleGoalComplete('${g.id}')">${g.completed ? 'Reopen' : 'Mark complete'}</button>
                        <span style="font-size:1.2rem;font-weight:700;color:${pct >= 100 ? 'var(--success)' : 'var(--accent)'};">${pct}%</span>
                    </div>
                </div>
                <div class="progress" style="height:8px;"><div class="progress-fill" style="width:${pct}%;${pct >= 100 ? 'background:var(--success);' : ''}"></div></div>
                ${milestonesHtml}
            </div>
        `;
    }).join('');
}

function toggleMilestone(gid, mid) {
    const goals = arr(K.goals);
    const g = goals.find(x => x.id === gid);
    if (g && g.milestones) {
        const m = g.milestones.find(x => x.id === mid);
        if (m) {
            m.done = !m.done;
            g.completed = g.milestones.length > 0 && g.milestones.every(item => item.done);
            set(K.goals, goals);
            renderGoals();
            refreshDashboard();
        }
    }
}

function toggleGoalComplete(gid) {
    const goals = arr(K.goals);
    const g = goals.find(x => x.id === gid);
    if (!g) return;
    g.completed = !g.completed;
    if (g.completed && Array.isArray(g.milestones)) g.milestones.forEach(m => { m.done = true; });
    set(K.goals, goals);
    renderGoals();
    refreshDashboard();
}

// V56: orphaned wrapper filterGoals() removed — callers use setGoalFilter() (audit R3).
function openGoalModal() { editingGoalId=null; document.getElementById('goalTitle').value=''; document.getElementById('goalArea').value='education'; document.getElementById('goalTarget').value=''; document.getElementById('goalMilestones').value=''; document.getElementById('goalDeleteBtn').style.display='none'; openModal('goalModal'); }
function editGoal(id) {
    const g = arr(K.goals).find(x=>x.id===id); if(!g)return;
    editingGoalId=id;
    document.getElementById('goalTitle').value=g.title;
    document.getElementById('goalArea').value=g.area;
    document.getElementById('goalTarget').value=g.target||'';
    document.getElementById('goalMilestones').value=g.milestones?.map(m=>m.title).join('\n')||'';
    document.getElementById('goalDeleteBtn').style.display='block';
    openModal('goalModal');
}
function saveGoal() {
    const title=document.getElementById('goalTitle').value.trim(); if(!title){toast('Enter title');return;}
    const goals=arr(K.goals);
    const msText=document.getElementById('goalMilestones').value.trim();
    const ms=msText?msText.split('\n').filter(l=>l.trim()).map(l=>({id:uid(),title:l.trim(),done:false})):[];
    const data={title,area:document.getElementById('goalArea').value,target:document.getElementById('goalTarget').value||null,milestones:ms,completed:false};
    if(editingGoalId){const i=goals.findIndex(g=>g.id===editingGoalId);if(i!==-1){const old=goals[i].milestones||[];data.milestones=ms.map(m=>{const ex=old.find(o=>o.title===m.title);return ex?{...m,done:ex.done}:m;});data.completed=data.milestones.length?data.milestones.every(m=>m.done):goals[i].completed;goals[i]={...goals[i],...data};}}
    else{goals.push({id:uid(),...data});}
    set(K.goals,goals);closeModal('goalModal');renderGoals();refreshDashboard();toast('Saved!');
}
function deleteGoal(){if(!editingGoalId||!confirm('Delete?'))return;set(K.goals,arr(K.goals).filter(g=>g.id!==editingGoalId));closeModal('goalModal');renderGoals();refreshDashboard();toast('Deleted');}
