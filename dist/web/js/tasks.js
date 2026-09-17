// ==================== TASKS ====================
let editingTaskId = null;
let taskFilter = 'all';

function renderTasks() {
    const tasks = arr(K.tasks);
    const td = today();
    
    // Stats
    const dueToday = tasks.filter(t => taskDueDate(t) === td && !taskIsCompleted(t)).length;
    const overdue = tasks.filter(t => taskDueDate(t) && taskDueDate(t) < td && !taskIsCompleted(t)).length;
    const completed = tasks.filter(taskIsCompleted).length;
    const total = tasks.length;
    
    document.getElementById('tasksDueToday').textContent = dueToday;
    document.getElementById('tasksOverdue').textContent = overdue;
    document.getElementById('tasksCompleted').textContent = completed;
    document.getElementById('tasksTotal').textContent = total;
    
    // Filters
    document.getElementById('taskFilters').innerHTML = `
        <button class="filter-btn ${taskFilter==='all'?'active':''}" onclick="setTaskFilter('all')">📋 All</button>
        <button class="filter-btn ${taskFilter==='today'?'active':''}" onclick="setTaskFilter('today')">📅 Today</button>
        <button class="filter-btn ${taskFilter==='overdue'?'active':''}" onclick="setTaskFilter('overdue')">🔴 Overdue</button>
        <button class="filter-btn ${taskFilter==='done'?'active':''}" onclick="setTaskFilter('done')">✅ Done</button>
    `;
    
    renderTasksList(taskFilter);
    if (typeof renderTaskConflictSummary === 'function') renderTaskConflictSummary();
}

function setTaskFilter(f) {
    taskFilter = f;
    renderTasks();
}

function renderTasksList(f) {
    let tasks = arr(K.tasks);
    const td = today();
    
    if (f === 'today') tasks = tasks.filter(t => taskDueDate(t) === td && !taskIsCompleted(t));
    else if (f === 'overdue') tasks = tasks.filter(t => taskDueDate(t) && taskDueDate(t) < td && !taskIsCompleted(t));
    else if (f === 'done') tasks = tasks.filter(taskIsCompleted);
    else tasks = tasks.filter(t => !taskIsCompleted(t));
    
    // Sort by priority then due date
    const priorityOrder = { high: 0, med: 1, low: 2 };
    tasks.sort((a, b) => {
        if (taskIsCompleted(a) !== taskIsCompleted(b)) return taskIsCompleted(a) ? 1 : -1;
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
        return (taskDueDate(a) || '9999').localeCompare(taskDueDate(b) || '9999');
    });
    
    if (!tasks.length) {
        document.getElementById('tasksContainer').innerHTML = `<div class="empty" style="padding:40px;">No tasks in this view</div>`;
        return;
    }
    
    document.getElementById('tasksContainer').innerHTML = tasks.map(t => {
        const due = taskDueDate(t);
        const completed = taskIsCompleted(t);
        const isOverdue = due && due < td && !completed;
        const dueText = due ? (due === td ? 'Today' : new Date(due + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : '';
        const conflictCount = due && window.COMMITMENTS ? COMMITMENTS.issueCountFor('task', t.id, due) : 0;
        const timing = t.time ? t.time + (t.duration ? ' · ' + (window.COMMITMENTS ? COMMITMENTS.formatDuration(parseInt(t.duration, 10)) : parseInt(t.duration, 10) + 'm') : '') : '';
        
        return `
            <div class="task-item" onclick="editTask('${t.id}')">
                <div class="task-check ${completed ? 'done' : ''}" onclick="event.stopPropagation();toggleTask('${t.id}')">${completed ? '✓' : ''}</div>
                <div class="task-info">
                    <div class="task-title ${completed ? 'done' : ''}">${esc(t.title)}</div>
                    ${t.description ? `<div style="margin-top:3px;color:var(--text-muted);font-size:0.75rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(t.description)}</div>` : ''}
                    ${dueText || timing ? `<div class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️ ' : ''}${dueText}${dueText && timing ? ' · ' : ''}${timing}</div>` : ''}
                </div>
                ${conflictCount ? `<span class="commitment-mini-warning" title="${conflictCount} scheduling heads-up(s)">! ${conflictCount}</span>` : ''}
                <span class="task-priority ${t.priority}">${t.priority}</span>
            </div>
        `;
    }).join('');
}

function quickAddTask() {
    const input = document.getElementById('quickTaskInput');
    const title = input.value.trim();
    if (!title) return;
    
    const tasks = arr(K.tasks);
    tasks.push(normalizeTaskRecord({ id: uid(), title, priority: 'med', completed: false, due: null }));
    set(K.tasks, tasks);
    input.value = '';
    renderTasks();
    refreshDashboard();
    toast('Task added!');
}

// V56: orphaned wrapper filterTasks() removed — callers use setTaskFilter() (audit R3).
function openTaskModal(){
    editingTaskId=null;
    document.getElementById('taskTitle').value='';
    document.getElementById('taskDue').value='';
    document.getElementById('taskPriority').value='med';
    document.getElementById('taskTime').value='';
    document.getElementById('taskDuration').value='30';
    document.getElementById('taskCategory').value='general';
    document.getElementById('taskDescription').value='';
    document.getElementById('taskDeleteBtn').style.display='none';
    openModal('taskModal');
    refreshTaskConflictPreview();
}
function editTask(id){
    const t=arr(K.tasks).find(x=>x.id===id);if(!t)return;
    editingTaskId=id;
    document.getElementById('taskTitle').value=t.title;
    document.getElementById('taskDue').value=taskDueDate(t);
    document.getElementById('taskPriority').value=normalizeTaskRecord(t).priority;
    document.getElementById('taskTime').value=t.time||'';
    document.getElementById('taskDuration').value=t.duration||'30';
    document.getElementById('taskCategory').value=t.category||'general';
    document.getElementById('taskDescription').value=t.description||'';
    document.getElementById('taskDeleteBtn').style.display='block';
    openModal('taskModal');
    refreshTaskConflictPreview();
}
function taskCandidateFromForm(){
    return {
        id: editingTaskId || 'candidate-task',
        kind: 'task',
        title: document.getElementById('taskTitle').value.trim() || 'New task',
        date: document.getElementById('taskDue').value || '',
        time: document.getElementById('taskTime').value || '',
        duration: document.getElementById('taskDuration').value || '30',
        category: document.getElementById('taskCategory').value || 'general'
    };
}
function refreshTaskConflictPreview(){
    if(typeof commitmentRenderCandidatePreview!=='function')return null;
    return commitmentRenderCandidatePreview('taskConflictPreview',taskCandidateFromForm(),editingTaskId?{kind:'task',id:editingTaskId}:null);
}
function saveTask(force){
    const title=document.getElementById('taskTitle').value.trim();if(!title){toast('Enter task');return;}
    const candidate=taskCandidateFromForm();
    if(candidate.time&&!candidate.date){toast('Choose a date for the planned start time');return;}
    if(!force&&window.COMMITMENTS){
        const evaluation=COMMITMENTS.evaluateCandidate(candidate,editingTaskId?{kind:'task',id:editingTaskId}:null);
        if(commitmentPromptForSave(candidate,evaluation,function(){saveTask(true);},{title:'Task conflicts with the current plan',timeFieldId:'taskTime',sourceModalId:'taskModal',afterTime:refreshTaskConflictPreview}))return;
    }
    const tasks=arr(K.tasks);
    const data={title,due:candidate.date||null,time:candidate.time||null,duration:candidate.duration||null,category:candidate.category||'general',priority:document.getElementById('taskPriority').value,description:document.getElementById('taskDescription').value.trim(),completed:false,status:'pending'};
    if(editingTaskId){const i=tasks.findIndex(t=>t.id===editingTaskId);if(i!==-1){data.completed=taskIsCompleted(tasks[i]);data.status=data.completed?'done':'pending';tasks[i]=normalizeTaskRecord({...tasks[i],...data});}}
    else{tasks.push(normalizeTaskRecord({id:uid(),...data}));}
    set(K.tasks,tasks);closeModal('taskModal');renderTasks();refreshDashboard();toast('Saved!');
}
function deleteTask(){
    if(!editingTaskId||!confirm('Delete?'))return;
    set(K.tasks,arr(K.tasks).filter(t=>t.id!==editingTaskId));
    if(typeof studyosRemoveEntityLinks==='function')studyosRemoveEntityLinks('task',editingTaskId);
    closeModal('taskModal');renderTasks();refreshDashboard();toast('Deleted');
}
function toggleTask(id){
    const tasks=arr(K.tasks);
    const t=tasks.find(x=>x.id===id);
    if(t){
        t.completed=!taskIsCompleted(t);
        t.status=t.completed?'done':'pending';
        if(t.completed){ t.completedAt = today(); }
        else { delete t.completedAt; }
        set(K.tasks,tasks);
        renderTasks();
        refreshDashboard();
    }
}
