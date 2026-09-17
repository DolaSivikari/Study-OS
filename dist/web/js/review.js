// ==================== WEEKLY REVIEW ====================
let currentReviewData = null;

function getWeekNumber(d) {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7) + 1;
}

function getCurrentWeekKey() {
    const now = new Date();
    return `${now.getFullYear()}-W${getWeekNumber(now).toString().padStart(2, '0')}`;
}

function renderWeeklyReview() {
    const weekKey = getCurrentWeekKey();
    const reviews = get(K.weeklyReviews) || {};
    const currentReview = reviews[weekKey];
    
    document.getElementById('reviewWeekLabel').textContent = `Week ${getWeekNumber(new Date())} of ${new Date().getFullYear()}`;
    
    // Calculate week stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const time = arr(K.time).filter(e => e.date >= fmtDate(weekStart) && e.date <= fmtDate(weekEnd));
    const tasks = arr(K.tasks).filter(t => t.completedAt && t.completedAt >= fmtDate(weekStart));
    const journals = arr(K.journal).filter(j => j.date >= fmtDate(weekStart) && j.date <= fmtDate(weekEnd));
    const disc = get(K.discipline) || {};
    
    const totalHours = time.reduce((s, e) => s + (parseFloat(e.duration) || 0), 0);
    let avgDisc = 0;
    let discDays = 0;
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dayDisc = disc[fmtDate(d)];
        if (dayDisc) {
            const dayTotal = Object.values(dayDisc).reduce((s, v) => s + v, 0);
            avgDisc += (dayTotal / 50) * 100;
            discDays++;
        }
    }
    avgDisc = discDays ? Math.round(avgDisc / discDays) : 0;
    
    document.getElementById('reviewHours').textContent = totalHours.toFixed(1) + 'h';
    document.getElementById('reviewTasks').textContent = tasks.length;
    document.getElementById('reviewDiscipline').textContent = avgDisc + '%';
    document.getElementById('reviewJournals').textContent = journals.length;
    
    // Update status
    const statusCard = document.getElementById('reviewStatusCard');
    const statusIcon = document.getElementById('reviewStatusIcon');
    const statusText = document.getElementById('reviewStatusText');
    const statusSub = document.getElementById('reviewStatusSub');
    const startBtn = document.getElementById('startReviewBtn');
    
    if (currentReview && currentReview.completed) {
        statusCard.style.background = 'linear-gradient(135deg, var(--bg-secondary), rgba(34,197,94,0.1))';
        statusCard.style.borderColor = 'var(--success)';
        statusIcon.textContent = '✅';
        statusText.textContent = 'Weekly review completed!';
        statusSub.textContent = `Completed on ${new Date(currentReview.completedAt).toLocaleDateString()}`;
        startBtn.textContent = 'View Review';
        startBtn.onclick = () => viewReview(weekKey);
    } else if (new Date().getDay() === 0) { // Sunday
        statusCard.style.background = 'linear-gradient(135deg, var(--bg-secondary), rgba(249,115,22,0.15))';
        statusCard.style.borderColor = 'var(--accent)';
        statusIcon.textContent = '📋';
        statusText.textContent = 'Time for your weekly review!';
        statusSub.textContent = 'Take 15 minutes to reflect on your week';
        startBtn.textContent = 'Start Review';
        startBtn.onclick = () => startWeeklyReview();
    } else {
        statusCard.style.background = 'var(--bg-secondary)';
        statusCard.style.borderColor = 'var(--border)';
        statusIcon.textContent = '📋';
        statusText.textContent = 'Weekly review not yet done';
        statusSub.textContent = 'Best done on Sunday evening';
        startBtn.textContent = 'Start Early';
        startBtn.onclick = () => startWeeklyReview();
    }
    
    // Render sections (if in-progress)
    if (currentReview && !currentReview.completed) {
        renderReviewSections(currentReview);
    } else {
        document.getElementById('reviewSections').innerHTML = '';
    }
    
    // Past reviews
    const pastKeys = Object.keys(reviews).filter(k => k !== weekKey && reviews[k].completed).sort().reverse().slice(0, 5);
    document.getElementById('pastReviews').innerHTML = pastKeys.length ? pastKeys.map(k => `
        <div class="list-item" onclick="viewReview('${k}')" style="cursor:pointer;">
            <span style="font-weight:500;">${k}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">${new Date(reviews[k].completedAt).toLocaleDateString()}</span>
        </div>
    `).join('') : '<div class="empty">No past reviews yet</div>';
}

function startWeeklyReview() {
    const weekKey = getCurrentWeekKey();
    const reviews = get(K.weeklyReviews) || {};
    
    if (!reviews[weekKey]) {
        reviews[weekKey] = {
            startedAt: new Date().toISOString(),
            completed: false,
            sections: {}
        };
        set(K.weeklyReviews, reviews);
    }
    
    renderReviewSections(reviews[weekKey]);
}

function getWeeklyReviewSections() {
    const execution = typeof profileExecutionSummary === 'function' ? profileExecutionSummary(7) : { slow:0, decide:0, balanced:0, qualityCommDays:0, commDays:0 };
    const quality = typeof qualityReviewSummary === 'function' ? qualityReviewSummary(90) : { open:0, overdue:0, repeats:0 };
    return [
        { id: 'wins', icon: '🏆', title: 'Wins', question: 'What went well this week? Where did Analytical or Restorative create value — and did you claim the win out loud (Significance) or let it pass unrecorded?' },
        { id: 'challenges', icon: '💪', title: 'Challenges', question: `Which execution mode created friction: excessive analysis, rushed action, or neither? This week the Decision Guardrail recorded ${execution.slow} slow-down and ${execution.decide} decide-now signal(s). Describe the context rather than turning it into a personality label.` },
        { id: 'learning', icon: '📖', title: 'Learning (Learner)', question: 'What did you learn this week — and what APPLIED ARTIFACT proves it (a checklist, calculation, template, or note used on a real task)? Learning without an artifact is Learner (#7) procrastinating.' },
        { id: 'practice_judgment', icon: '🧭', title: 'Practice & Judgment', question: (() => {
            try { return typeof PRACTICE !== 'undefined' ? PRACTICE.getReviewPrompt() : 'Which decision skill needs deliberate practice next week?'; }
            catch (e) { return 'Which decision skill needs deliberate practice next week?'; }
        })() },
        { id: 'balance_calibration', icon: '⚖️', title: 'Balance & Calibration', question: (() => {
            try {
                const integrity = (typeof LEARN !== 'undefined' && LEARN.getLearningIntegrityIndex) ? LEARN.getLearningIntegrityIndex() : null;
                const drift = (typeof LEARN !== 'undefined' && LEARN.getDriftStatus) ? LEARN.getDriftStatus() : null;
                if (!integrity) return 'How balanced and calibrated was your learning this week?';
                const a = integrity.allocation;
                const p = a && a.pct ? a.pct : {technical:0,strategic:0,leadership:0};
                const m = integrity.momentum ? integrity.momentum.normalized : '—';
                const c = integrity.calibration === null ? '—' : Math.round(integrity.calibration);
                const b = integrity.balance;
                const driftLine = (drift && drift.isDrifting) ? `<div class="badge badge-warn" style="display:inline-block;margin-top:6px;">Two-week drift detected</div>` : `<div class="badge badge-good" style="display:inline-block;margin-top:6px;">No drift signal</div>`;
                return `Review the integrity of your learning system.<div class="muted" style="margin-top:6px;">7d balance: Tech ${p.technical}% · Strat ${p.strategic}% · Lead ${p.leadership}% · Balance score ${b}</div><div class="muted">Momentum (14d): ${m} · Calibration: ${c}</div>${driftLine}<div class="muted" style="margin-top:6px;">What caused imbalance? Where were you overconfident or under-testing?</div>`;
            } catch(e){
                return 'How balanced and calibrated was your learning this week?';
            }
        })() },
        { id: 'communication', icon: '💬', title: 'Communication Quality', question: `Communication #34 is a relative Clifton theme rank, not a capacity judgment. On ${execution.qualityCommDays}/${execution.commDays} logged communication day(s), you recorded receiver-side behaviors. Where did you invite input, paraphrase, adapt, and confirm shared understanding?` },
        { id: 'command', icon: '⚡', title: 'Command & Leadership', question: 'Where did directness create clarity? Where might it have become forceful, solution-first, or closed to input? Name what the other person said before you gave your conclusion.' },
        { id: 'reflection_action', icon: '🎯', title: 'Reflection → Action', question: 'Which reflection changed a real behavior, artifact, task, or decision? If nothing changed, choose one concrete next action now; use a two-minute start only if the task evidence shows actual start friction.' },
        { id: 'priorities', icon: '📋', title: 'Next Week Priorities', question: 'Choose three priorities. For each, define the evidence of completion, the first physical action, and the commitment that must not be displaced by something newer or louder.' },
        { id: 'decisions', icon: '⚖️', title: 'Decision Quality', question: `This week: ${execution.slow} slow-down · ${execution.decide} decide-now · ${execution.balanced} balanced guardrail result(s). Did the pace match consequence, reversibility, evidence depth, standards, and stakeholder input?` },
        { id: 'quality_assurance', icon: '🔧', title: 'Fix → Learn → Prevent', question: `Quality Loop: ${quality.open} open control(s), ${quality.overdue} overdue verification(s), and ${quality.repeats} repeat issue(s) in the 90-day view. Which fix still needs a root cause, prevention owner, or effectiveness check?` },
        { id: 'gratitude', icon: '🙏', title: 'Gratitude', question: 'What are you grateful for this week?' }
    ];
}

function renderReviewSections(review) {
    const sections = getWeeklyReviewSections();
    
    document.getElementById('reviewSections').innerHTML = `
        ${sections.map(s => `
            <div class="review-section">
                <div class="review-section-title">${s.icon} ${s.title}</div>
                <div class="review-prompt">
                    <div class="review-prompt-question">${s.question}</div>
                </div>
                <textarea class="review-textarea" id="review_${s.id}" placeholder="Your thoughts..." oninput="autoSaveReview('${s.id}', this.value)">${review.sections?.[s.id] || ''}</textarea>
            </div>
        `).join('')}
        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-primary" onclick="completeWeeklyReview()">✅ Complete Review</button>
        </div>
    `;
}

function autoSaveReview(sectionId, value) {
    const weekKey = getCurrentWeekKey();
    const reviews = get(K.weeklyReviews) || {};
    if (!reviews[weekKey]) reviews[weekKey] = { sections: {} };
    if (!reviews[weekKey].sections) reviews[weekKey].sections = {};
    reviews[weekKey].sections[sectionId] = value;
    set(K.weeklyReviews, reviews);
}

function completeWeeklyReview() {
    const weekKey = getCurrentWeekKey();
    const reviews = get(K.weeklyReviews) || {};
    if (!reviews[weekKey]) return;
    
    reviews[weekKey].completed = true;
    reviews[weekKey].completedAt = new Date().toISOString();
    set(K.weeklyReviews, reviews);
    
    toast('🎉 Weekly review completed!');
    renderWeeklyReview();
}

function viewReview(weekKey) {
    const reviews = get(K.weeklyReviews) || {};
    const review = reviews[weekKey];
    if (!review) return;
    
    // Use the same section registry as the live review. Older versions kept
    // a stale seven-item list here, so completed prompts silently vanished
    // when a past review was opened.
    const sections = getWeeklyReviewSections();
    
    document.getElementById('reviewDetailTitle').textContent = `Review: ${weekKey}`;
    document.getElementById('reviewDetailContent').innerHTML = sections.map(s => `
        <div style="margin-bottom:16px;">
            <div style="font-weight:600;margin-bottom:8px;">${s.icon} ${s.title}</div>
            <div style="background:var(--bg-tertiary);padding:12px;border-radius:8px;color:var(--text-secondary);white-space:pre-wrap;">${esc(review.sections?.[s.id] || '(No entry)')}</div>
        </div>
    `).join('');
    
    openModal('reviewDetailModal');
}
