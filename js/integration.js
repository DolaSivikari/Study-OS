// ==================== SYSTEM INTEGRATION LAYER (V15) ====================
// This file wires disconnected features into a unified operating system.
// It does NOT replace any existing render functions — it adds cross-system
// data flow so actions in one place ripple through the whole OS.

// ==================== OPERATOR SCORE ====================
// Combines protocol + discipline + habits into a single reliability metric

function getOperatorScore(dateStr) {
    const todayStr = dateStr || today();

    // Protocol: did you run it?
    const protocol = get(K.protocol) || {};
    const tp = protocol[todayStr];
    const protocolScore = tp && tp.completed ? 100 : tp && tp.morning ? 50 : 0;

    // Discipline: today's score as percentage
    const disc = get(K.discipline) || {};
    const todayDisc = disc[todayStr] || {};
    let discMax = 0, discActual = 0;
    if (typeof DISCIPLINES !== 'undefined') {
        DISCIPLINES.forEach(function(d) { discMax += d.max; discActual += (todayDisc[d.id] || 0); });
    }
    const disciplineScore = discMax > 0 ? Math.round((discActual / discMax) * 100) : 50;

    // Habits: percentage completed today
    const habits = arr(K.habits);
    const hlogs = arr(K.habitLogs);
    const doneSet = {};
    hlogs.forEach(function(l) { if (l.date === todayStr) doneSet[l.habitId] = true; });
    const habitsDone = habits.filter(function(h) { return doneSet[h.id]; }).length;
    const habitScore = habits.length > 0 ? Math.round((habitsDone / habits.length) * 100) : 50;

    // Composite: protocol 30%, discipline 35%, habits 35%
    const composite = Math.round(protocolScore * 0.30 + disciplineScore * 0.35 + habitScore * 0.35);

    return {
        composite: composite,
        protocol: protocolScore,
        discipline: disciplineScore,
        habits: habitScore,
        label: composite >= 80 ? 'STABLE' : composite >= 50 ? 'WATCH' : 'DRIFT'
    };
}

// Consecutive days with composite >= threshold, walking back from today.
// Mirrors calcDisciplineStreak's pattern: an unfinished "today" doesn't
// break a streak that hasn't started yet, so a fresh morning doesn't
// show 0 before you've had a chance to run today's protocol/habits.
function getOperatorStreak(threshold) {
    threshold = threshold || 50;
    let streak = 0;
    const d = new Date();
    const todayStr = today();
    while (true) {
        const ds = fmtDate(d);
        const composite = getOperatorScore(ds).composite;
        if (composite >= threshold) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else if (streak === 0 && ds === todayStr) {
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
        if (streak > 3650) break; // safety cap, ~10 years
    }
    return streak;
}

// ==================== JOURNAL → WEEKLY REVIEW BRIDGE ====================
// Reads journal entries for the current week so Weekly Review can reference them

function getJournalThisWeek() {
    const entries = arr(K.journal);
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const cutoff = fmtDate(weekAgo);
    return entries.filter(function(e) { return e.date && e.date >= cutoff; });
}

// V56: orphaned getJournalDoctrineEntries() removed (audit R3).

// ==================== STRATEGIC HORIZON → GOALS/TASKS BRIDGE ====================
// Creates task suggestions from 90-day actions

function getHorizonTaskSuggestions() {
    const sh = get(K.strategicHorizon) || {};
    const actions = sh.ninetyDay || [];
    const tasks = arr(K.tasks);
    const suggestions = [];

    actions.forEach(function(a) {
        if (a.done) return;
        // Check if a task already exists with similar title
        const exists = tasks.some(function(t) {
            return t.title && a.text && t.title.toLowerCase().indexOf(a.text.toLowerCase().substring(0, 20)) !== -1;
        });
        if (!exists) {
            suggestions.push({
                text: a.text || a.title || '',
                source: '90-Day Plan',
                priority: 'high'
            });
        }
    });
    return suggestions;
}

// ==================== DECISION JOURNAL → INTELLIGENCE BRIDGE ====================
// Finds unreviewed decisions that are overdue for review

function getOverdueDecisionReviews() {
    const decisions = get(K.decisions) || [];
    const todayStr = today();
    return decisions.filter(function(d) {
        return !d.reviewed && d.reviewDate && d.reviewDate <= todayStr;
    });
}

// Decisions that were logged with no review date set at all — these will
// never surface in getOverdueDecisionReviews() and never get reviewed, so
// they silently never contribute to LEARN.getDecisionCalibrationScore().
// A grace period avoids nagging about a decision logged five minutes ago.
function getUnscheduledDecisionReviews(graceDays) {
    graceDays = graceDays || 3;
    const decisions = get(K.decisions) || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - graceDays);
    const cutoffStr = fmtDate(cutoff);
    return decisions.filter(function(d) {
        return !d.reviewed && !d.reviewDate && d.date && d.date <= cutoffStr;
    });
}

// ==================== ENHANCED INTELLIGENCE (extends intelRecommendNextMove) ====================
// Wraps the existing intelligence to add operator score + decision reviews + horizon alignment

const _originalIntelRecommend = typeof intelRecommendNextMove === 'function' ? intelRecommendNextMove : null;

function intelRecommendNextMoveEnhanced() {
    const snap = intelGetSystemSnapshot();

    // V29.2: a real collision takes priority over adding more work. The
    // recommendation explains the schedule risk but never changes data.
    if (window.COMMITMENTS && typeof COMMITMENTS.scanHorizon === 'function') {
        const commitmentHorizon = COMMITMENTS.scanHorizon(7);
        if (commitmentHorizon.seriousIssues.length > 0) {
            const topConflict = commitmentHorizon.seriousIssues[0];
            return {
                title: 'Resolve ' + commitmentHorizon.seriousIssues.length + ' Schedule Risk' + (commitmentHorizon.seriousIssues.length === 1 ? '' : 's'),
                desc: topConflict.title + ' — ' + topConflict.detail,
                ctaText: 'Review Conflicts',
                ctaFn: 'openCommitmentCenter()'
            };
        }
    }

    // V31: an overdue control check outranks adding more work. A fix is not
    // complete until the preventive control has been verified.
    if (typeof qualityReviewSummary === 'function') {
        const qualityStatus = qualityReviewSummary(90);
        if (qualityStatus.overdue > 0) {
            return {
                title: 'Verify ' + qualityStatus.overdue + ' Quality Control' + (qualityStatus.overdue === 1 ? '' : 's'),
                desc: 'The immediate fix was recorded, but its preventive control is overdue for an effectiveness check.',
                ctaText: 'Open Quality Loop',
                ctaFn: "go('journal')"
            };
        }
    }

    // NEW: Check operator score first (stabilize before optimizing)
    const opScore = getOperatorScore();
    if (opScore.composite < 30 && new Date().getHours() < 12) {
        return {
            title: 'Stabilize the Operator (' + opScore.composite + '%)',
            desc: 'Protocol: ' + opScore.protocol + '% · Discipline: ' + opScore.discipline + '% · Habits: ' + opScore.habits + '%. Run your morning protocol and knock out one habit.',
            ctaText: 'Run Protocol',
            ctaFn: "go('protocol')"
        };
    }

    // NEW: Overdue decision reviews (judgment calibration)
    const overdueReviews = getOverdueDecisionReviews();
    if (overdueReviews.length > 0) {
        return {
            title: 'Review ' + overdueReviews.length + ' Decision(s)',
            desc: 'You have decisions due for outcome review. Reviewing calibrates your judgment over time.',
            ctaText: 'Open Decisions',
            ctaFn: "go('decisions')"
        };
    }

    // NEW: 90-day horizon alignment check (weekly)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 1) { // Monday
        const suggestions = getHorizonTaskSuggestions();
        if (suggestions.length > 0) {
            return {
                title: '90-Day Plan: ' + suggestions.length + ' untracked action(s)',
                desc: '"' + suggestions[0].text.substring(0, 60) + '…" — create tasks from your 90-day plan to keep strategic alignment.',
                ctaText: 'Open Horizon',
                ctaFn: "go('horizon')"
            };
        }
    }

    // Fall through to original intelligence
    if (_originalIntelRecommend) return _originalIntelRecommend();

    return {
        title: 'Execute the next block',
        desc: 'System is stable. Run the next scheduled block with full attention.',
        ctaText: 'Open Schedule',
        ctaFn: "go('calendar')"
    };
}

// Replace the global recommendation function
intelRecommendNextMove = intelRecommendNextMoveEnhanced;

// V56: orphaned getCalendarStudyHours() removed — domain balance reads study
// time from K.time records, not calendar-title heuristics (audit R3).

// ==================== CONTACTS → COMMUNICATION SCORE ====================
// Measures follow-up reliability for leadership domain

function getCommunicationScore() {
    const contacts = arr(K.contacts);
    if (contacts.length === 0) return null;
    const withFollowups = contacts.filter(function(c) { return c.followupDate; });
    const overdueFollowups = withFollowups.filter(function(c) { return c.followupDate < today(); });
    return {
        total: contacts.length,
        tracked: withFollowups.length,
        overdue: overdueFollowups.length,
        reliability: withFollowups.length > 0 ? Math.round(((withFollowups.length - overdueFollowups.length) / withFollowups.length) * 100) : 100
    };
}

// ==================== UNIFIED SYSTEM STATUS ====================
// One function that returns the health of the entire OS

function getSystemStatus() {
    const op = getOperatorScore();
    const integrity = (typeof LEARN !== 'undefined' && LEARN.getLearningIntegrityIndex) ? LEARN.getLearningIntegrityIndex() : null;
    const snap = intelGetSystemSnapshot();
    const comms = getCommunicationScore();
    const overdueDecisions = getOverdueDecisionReviews().length;
    const unscheduledDecisions = getUnscheduledDecisionReviews().length;
    const commitmentStatus = window.COMMITMENTS && typeof COMMITMENTS.scanHorizon === 'function' ? COMMITMENTS.scanHorizon(7) : null;

    const warnings = [];
    if (op.composite < 50) warnings.push('Operator unstable (' + op.composite + '%)');
    if (integrity && integrity.index !== null && integrity.index < 40) warnings.push('Learning integrity low (' + integrity.index + ')');
    if (snap.overdue > 3) warnings.push(snap.overdue + ' overdue tasks');
    if (snap.dueCards > 20) warnings.push(snap.dueCards + ' SRS cards due');
    if (overdueDecisions > 0) warnings.push(overdueDecisions + ' decisions need review');
    if (unscheduledDecisions > 0) warnings.push(unscheduledDecisions + ' decision(s) missing a review date');
    if (comms && comms.overdue > 2) warnings.push(comms.overdue + ' overdue follow-ups');
    if (commitmentStatus && commitmentStatus.seriousIssues.length > 0) warnings.push(commitmentStatus.seriousIssues.length + ' schedule conflict/overload warning(s)');

    let score = 100;
    warnings.forEach(function() { score -= 12; });
    score = Math.max(0, score);

    return {
        score: score,
        label: score >= 75 ? 'OPERATIONAL' : score >= 50 ? 'WATCH' : 'AT RISK',
        operator: op,
        learning: integrity,
        execution: snap,
        communications: comms,
        commitments: commitmentStatus,
        warnings: warnings
    };
}


// ==================== EVENT BUS SUBSCRIPTIONS (V29.1) ====================
// Re-render the data surface the user is actually looking at. Previously a
// cross-page write refreshed only the hidden Dashboard/Health pages, leaving
// Calendar, Operator, Insights, and other consumers stale until navigation.
function refreshActiveDataSurface(){
    const active = document.querySelector('#pageContainer > .page.active') || document.querySelector('.page.active');
    if (!active) return;
    if (active.id === 'dashboard') { if (typeof refreshDashboard === 'function') refreshDashboard(); return; }
    if (active.id === 'journal') { if (typeof renderJournal === 'function') renderJournal(); return; }
    if (active.id === 'network') { if (typeof renderContacts === 'function') renderContacts(); return; }

    const visible = Array.from(active.querySelectorAll('.tab-panel')).find(function(panel){
        return panel.style.display !== 'none';
    });
    const tab = visible && visible.id.indexOf('tab-') === 0 ? visible.id.slice(4) : (window.currentTabs && currentTabs[active.id]);
    if (!tab || tab === 'diagnostics') return;
    if (tab === 'insights' && typeof showInsight === 'function') { showInsight(typeof currentInsightView === 'string' ? currentInsightView : 'overview'); return; }
    if (typeof renderForTab === 'function') renderForTab(tab);
}
window.refreshActiveDataSurface = refreshActiveDataSurface;

(function(){
    let refreshTimer = null;
    function scheduleRefresh(){
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(function(){
            try { refreshActiveDataSurface(); } catch(e) { console.error(e); }
        }, 30);
    }
    if (typeof EVENTS !== 'undefined') {
        ['storage:changed','system:restored','system:reset'].forEach(function(evt){
            EVENTS.on(evt, scheduleRefresh);
        });
    }
})();
