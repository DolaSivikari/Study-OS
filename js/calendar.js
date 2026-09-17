// ==================== CALENDAR ====================
let currentCalendarDate = new Date();
let selectedCalendarDate = null;
let editingEventId = null;

function calendarEventsForDate(dateStr) {
    return window.COMMITMENTS ? COMMITMENTS.eventsForDate(dateStr) : arr(K.events).filter(function(event){ return event.date === dateStr; });
}

function calendarDatesBetween(startDate, endDate) {
    const dates = [];
    let cursor = startDate;
    let guard = 0;
    while (cursor <= endDate && guard < 370) {
        dates.push(cursor);
        cursor = window.COMMITMENTS ? COMMITMENTS.addDays(cursor, 1) : fmtDate(new Date(new Date(cursor + 'T12:00:00').getTime() + 86400000));
        guard++;
    }
    return dates;
}

function renderCalendar() {
    const tasks = arr(K.tasks);
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;
    
    // Calculate stats
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const monthEnd = fmtDate(new Date(year, month + 1, 0));
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const countItemsOn = dateStr => calendarEventsForDate(dateStr).length + tasks.filter(t => taskDueDate(t) === dateStr && !taskIsCompleted(t)).length;
    const thisMonthEvents = calendarDatesBetween(monthStart, monthEnd).reduce((sum, dateStr) => sum + countItemsOn(dateStr), 0);
    const thisWeekEvents = calendarDatesBetween(fmtDate(weekStart), fmtDate(weekEnd)).reduce((sum, dateStr) => sum + countItemsOn(dateStr), 0);
    const todayEvents = countItemsOn(today());
    
    document.getElementById('calEventsThisMonth').textContent = thisMonthEvents;
    document.getElementById('calEventsThisWeek').textContent = thisWeekEvents;
    document.getElementById('calEventsToday').textContent = todayEvents;
    
    // Build calendar grid
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = '<div class="calendar-grid">';
    
    // Header row
    dayNames.forEach(d => html += `<div class="calendar-header">${d}</div>`);
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevDays = prevMonth.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevDays - i;
        const dateStr = fmtDate(new Date(year, month - 1, day));
        html += `<div class="calendar-day other-month" onclick="selectCalendarDate('${dateStr}')"><div class="calendar-day-num">${day}</div></div>`;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === today();
        const dayEvents = calendarEventsForDate(dateStr);
        const dayTasks = tasks.filter(t => taskDueDate(t) === dateStr && !taskIsCompleted(t));
        const hasEvents = dayEvents.length > 0 || dayTasks.length > 0;
        const isSelected = selectedCalendarDate === dateStr;
        const dayIssues = window.COMMITMENTS ? COMMITMENTS.scanDay(dateStr, { includePast:true }).seriousIssues : [];
        const issueCountFor = (kind, id) => dayIssues.filter(issue => (issue.type === 'overlap' || issue.type === 'buffer') && (issue.entities || []).some(entity => entity.kind === kind && String(entity.id) === String(id))).length;
        
        html += `<div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''} ${dayIssues.length ? 'has-conflict' : ''}" onclick="selectCalendarDate('${dateStr}')">
            <div class="calendar-day-num">${day}</div>
            <div class="calendar-day-events">
                ${dayEvents.slice(0, 2).map(e => `<div class="calendar-event-dot ${e.type} ${issueCountFor('event', e.id) ? 'has-conflict' : ''}">${esc(e.title.substring(0, 10))}</div>`).join('')}
                ${dayTasks.slice(0, Math.max(0, 2 - dayEvents.length)).map(t => `<div class="calendar-event-dot task ${issueCountFor('task', t.id) ? 'has-conflict' : ''}">${esc(t.title.substring(0, 10))}</div>`).join('')}
            </div>
        </div>`;
    }
    
    // Next month days
    const totalCells = startDayOfWeek + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainingCells; i++) {
        const dateStr = fmtDate(new Date(year, month + 1, i));
        html += `<div class="calendar-day other-month" onclick="selectCalendarDate('${dateStr}')"><div class="calendar-day-num">${i}</div></div>`;
    }
    
    html += '</div>';
    document.getElementById('calendarGrid').innerHTML = html;
    
    // Render upcoming events
    renderUpcomingEvents();

    // Right rail panels (V7)
    renderCalendarDayPanel();
    renderCalendarNextMove();
    if (typeof renderCalendarConflictPanel === 'function') renderCalendarConflictPanel();
}

function renderUpcomingEvents() {
    const tasks = arr(K.tasks).filter(t => taskDueDate(t) && !taskIsCompleted(t));
    const td = today();
    const occurrenceHorizon = window.COMMITMENTS ? COMMITMENTS.addDays(td, 60) : td;
    const eventOccurrences = calendarDatesBetween(td, occurrenceHorizon).flatMap(dateStr => calendarEventsForDate(dateStr));
    const laterOneTimeEvents = arr(K.events).filter(e => !e.repeat && e.date > occurrenceHorizon);
    
    // Combine and sort
    const allItems = [
        ...eventOccurrences.concat(laterOneTimeEvents).map(e => ({ ...e, itemType: 'event' })),
        ...tasks.map(t => ({ ...t, date: taskDueDate(t), itemType: 'task', type: 'task' }))
    ].filter(e => e.date >= td)
     .sort((a, b) => a.date.localeCompare(b.date) || String(a.time || '99:99').localeCompare(String(b.time || '99:99')))
     .slice(0, 10);
    
    if (!allItems.length) {
        document.getElementById('upcomingEvents').innerHTML = '<div class="empty">No upcoming events</div>';
        return;
    }
    
    document.getElementById('upcomingEvents').innerHTML = allItems.map(e => {
        const dateObj = new Date(e.date + 'T12:00:00');
        const day = dateObj.getDate();
        const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const timeStr = e.time || '';
        const conflictCount = window.COMMITMENTS ? COMMITMENTS.issueCountFor(e.itemType === 'event' ? 'event' : 'task', e.id, e.date) : 0;
        
        return `
            <div class="event-item ${e.type || 'event'} ${conflictCount ? 'has-conflict' : ''}" onclick="${e.itemType === 'event' ? `editEvent('${e.id}')` : `editTask('${e.id}')`}">
                <div class="event-date">
                    <div class="event-date-day">${day}</div>
                    <div class="event-date-month">${monthShort}</div>
                </div>
                <div class="event-info">
                    <div class="event-title">${esc(e.title)}</div>
                    <div class="event-meta">${timeStr ? timeStr + ' • ' : ''}${e.repeat ? '↻ ' + esc(e.repeat) + ' • ' : ''}${e.notes ? esc(e.notes) : (e.type || '')}</div>
                </div>
                ${conflictCount ? `<span class="commitment-mini-warning">! ${conflictCount}</span>` : ''}
                <span class="event-type ${e.type || 'event'}">${e.type || 'event'}</span>
            </div>
        `;
    }).join('');
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar();
}

function goToToday() {
    currentCalendarDate = new Date();
    renderCalendar();
}

function selectCalendarDate(dateStr) {
    selectedCalendarDate = dateStr;
    // Selecting a date should be calm: show summary on the right rail.
    renderCalendar();
}

function openEventModal() {
    editingEventId = null;
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = selectedCalendarDate || today();
    document.getElementById('eventTime').value = '';
    document.getElementById('eventType').value = 'study';
    // Default to strict 60-min blocks in V7
    document.getElementById('eventDuration').value = '60';
    document.getElementById('eventNotes').value = '';
    document.getElementById('eventRepeat').value = '';
    document.getElementById('eventDeleteBtn').style.display = 'none';
    openModal('eventModal');
    refreshEventConflictPreview();
}

function editEvent(id) {
    const e = arr(K.events).find(x => x.id === id);
    if (!e) return;
    
    editingEventId = id;
    document.getElementById('eventTitle').value = e.title || '';
    document.getElementById('eventDate').value = e.date || '';
    document.getElementById('eventTime').value = e.time || '';
    document.getElementById('eventType').value = e.type || 'event';
    document.getElementById('eventDuration').value = e.duration || '';
    document.getElementById('eventNotes').value = e.notes || '';
    document.getElementById('eventRepeat').value = e.repeat || '';
    document.getElementById('eventDeleteBtn').style.display = 'block';
    openModal('eventModal');
    refreshEventConflictPreview();
}

function eventCandidateFromForm() {
    return {
        id: editingEventId || 'candidate-event',
        kind: 'event',
        title: document.getElementById('eventTitle').value.trim() || 'New calendar block',
        date: document.getElementById('eventDate').value || '',
        time: document.getElementById('eventTime').value || '',
        type: document.getElementById('eventType').value || 'event',
        duration: document.getElementById('eventDuration').value || '60',
        repeat: document.getElementById('eventRepeat').value || ''
    };
}

function refreshEventConflictPreview() {
    if (typeof commitmentRenderCandidatePreview !== 'function') return null;
    return commitmentRenderCandidatePreview('eventConflictPreview', eventCandidateFromForm(), editingEventId ? { kind:'event', id:editingEventId } : null);
}

function saveEvent(force) {
    const candidate = eventCandidateFromForm();
    const title = document.getElementById('eventTitle').value.trim();
    const date = candidate.date;
    if (!title || !date) {
        toast('Title and date required');
        return;
    }
    if (candidate.time && !document.getElementById('eventDuration').value) candidate.duration = '60';
    if (!force && window.COMMITMENTS) {
        const evaluation = COMMITMENTS.evaluateCandidate(candidate, editingEventId ? { kind:'event', id:editingEventId } : null);
        if (commitmentPromptForSave(candidate, evaluation, function(){ saveEvent(true); }, { title:'Calendar block conflicts with the current plan', timeFieldId:'eventTime', sourceModalId:'eventModal', afterTime:refreshEventConflictPreview })) return;
    }
    
    const events = arr(K.events);
    const data = {
        title,
        date,
        time: candidate.time || null,
        type: candidate.type,
        duration: document.getElementById('eventDuration').value || (candidate.time ? '60' : null),
        notes: document.getElementById('eventNotes').value.trim() || null,
        repeat: candidate.repeat || null
    };
    
    if (editingEventId) {
        const i = events.findIndex(e => e.id === editingEventId);
        if (i !== -1) events[i] = { ...events[i], ...data };
    } else {
        events.push({ id: uid(), ...data });
    }
    
    set(K.events, events);
    closeModal('eventModal');
    renderCalendar();
    toast('Block saved');
}

// ==================== V7 RIGHT RAIL ====================
function renderCalendarDayPanel() {
    const panel = document.getElementById('calDayPanel');
    if (!panel) return;
    const dateStr = selectedCalendarDate || today();
    const dateObj = new Date(dateStr + 'T12:00:00');
    const nice = dateObj.toLocaleDateString('en-CA', { weekday:'long', year:'numeric', month:'short', day:'numeric' });

    const day = window.COMMITMENTS ? COMMITMENTS.scanDay(dateStr, { includePast:true }) : null;
    const events = calendarEventsForDate(dateStr);
    const tasks = arr(K.tasks).filter(t => !taskIsCompleted(t) && taskDueDate(t) === dateStr);
    const fallbackItems = [
        ...events.map(e => ({ kind:'event', kindLabel:'Calendar', title:e.title, time:e.time, category:e.type || 'event', duration:parseInt(e.duration || 60, 10), id:e.id, date:dateStr })),
        ...tasks.map(t => ({ kind:'task', kindLabel:'Task', title:t.title, time:t.time || '', category:t.category || 'general', duration:parseInt(t.duration || 30, 10), id:t.id, date:dateStr }))
    ];
    const items = day ? day.commitments : fallbackItems;
    const plannedMinutes = day ? day.load.totalMinutes : events.reduce((s,e) => s + (parseInt(e.duration || 0, 10) || 0), 0);
    const plannedHours = plannedMinutes / 60;

    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
            <div>
                <div style="font-weight:900;letter-spacing:-0.2px;">Selected Day</div>
                <div style="color:var(--text-muted);font-size:0.85rem;margin-top:2px;">${esc(nice)}</div>
            </div>
            <span class="badge badge-blue">${plannedHours.toFixed(1)}h planned</span>
        </div>

        <div style="margin-top:12px;display:grid;gap:8px;">
            <button class="btn btn-primary" onclick="openEventModal()">➕ Add 60-min Block</button>
            <button class="btn btn-secondary" onclick="goToToday()">Today</button>
        </div>

        <div style="margin-top:12px;font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Agenda</div>
        <div style="margin-top:8px;">
            ${items.length ? items.slice().sort((a,b)=>(a.start ?? 9999)-(b.start ?? 9999)).slice(0, 10).map(it => `
                <div onclick="commitmentOpenRecord('${it.kind}','${it.id}','${dateStr}')" style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;">
                    <div style="margin-top:2px;">${it.kind === 'task' ? '✅' : it.kind === 'habit' ? '↻' : '🧱'}</div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">${esc(it.title)}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">${it.time ? esc(it.time) + ' • ' : 'Flexible • '}${esc(it.category || it.kindLabel)} • ${window.COMMITMENTS ? COMMITMENTS.formatDuration(it.duration) : it.duration + 'm'}</div>
                    </div>
                    <span class="badge ${it.study ? 'badge-blue' : it.kind === 'task' ? 'badge-warn' : ''}">${esc(it.kind.toUpperCase())}</span>
                </div>
            `).join('') : '<div class="empty">No blocks, due tasks, or scheduled habits for this day.</div>'}
        </div>
    `;
}

function renderCalendarNextMove() {
    const panel = document.getElementById('calNextMovePanel');
    if (!panel) return;

    const todayStr = today();
    const tasks = arr(K.tasks).filter(t => !taskIsCompleted(t));
    const overdue = tasks.filter(t => taskDueDate(t) && taskDueDate(t) < todayStr).length;

    const commitmentDay = window.COMMITMENTS ? COMMITMENTS.scanDay(todayStr) : null;
    const eventsToday = calendarEventsForDate(todayStr);
    const plannedMinutes = commitmentDay ? commitmentDay.load.totalMinutes : eventsToday.reduce((s,e) => s + (parseInt(e.duration || 0, 10) || 0), 0);
    const plannedHours = plannedMinutes / 60;

    let title = 'Plan minimum viable day';
    let desc = 'Add two 60-minute blocks: one study, one execution.';
    let cta = 'Add Block';
    let fn = 'openEventModal()';

    if (commitmentDay && commitmentDay.seriousIssues.length > 0) {
        title = `Resolve schedule risk (${commitmentDay.seriousIssues.length})`;
        desc = commitmentDay.seriousIssues[0].title + '. Review the explanation or deliberately keep the overlap.';
        cta = 'Review Conflicts';
        fn = 'openCommitmentCenter()';
    } else if (overdue > 0) {
        title = `Clear overdue (${overdue})`;
        desc = 'Reduce schedule pressure first by closing one overdue item.';
        cta = 'Open Tasks';
        fn = "go('tasks')";
    } else if (plannedHours >= 2) {
        title = 'Protect the next block';
        desc = 'Your schedule is healthy. Execute the next committed block.';
        cta = 'Go to Today';
        fn = 'goToToday()';
    }

    panel.innerHTML = `
        <div class="next-move-title">Next Move</div>
        <div class="next-move-desc"><strong>${esc(title)}</strong><br>${esc(desc)}</div>
        <div class="next-move-cta"><button class="btn btn-primary" style="width:100%;" onclick="${fn}">${esc(cta)}</button></div>
    `;
}

function deleteEvent() {
    if (!editingEventId || !confirm('Delete this event?')) return;
    set(K.events, arr(K.events).filter(e => e.id !== editingEventId));
    closeModal('eventModal');
    renderCalendar();
    toast('Event deleted');
}
