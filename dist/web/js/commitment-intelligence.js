// ==================== COMMITMENT INTELLIGENCE (V29.2) ====================
// A local, explainable scheduling layer shared by Tasks, Calendar, Habits,
// Focus, Study Lab, Journal, Dashboard, Operator, and Diagnostics.
// Warnings are advisory: the user can always continue or save anyway.

var COMMITMENT_DEFAULTS = Object.freeze({
    version: 1,
    warningsEnabled: true,
    dayStart: '06:00',
    dayEnd: '22:00',
    dailyBudgetMinutes: 720,
    maxStudyMinutes: 240,
    bufferMinutes: 10,
    defaultTaskMinutes: 30,
    defaultHabitMinutes: 10
});

var commitmentPendingAction = null;
var commitmentDismissedSignature = '';
var commitmentRefreshTimer = null;

function commitmentClampNumber(value, fallback, min, max) {
    var n = Number(value);
    if (!Number.isFinite(n)) n = fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
}

function commitmentParseTime(value) {
    var match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    var hours = Number(match[1]);
    var minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
}

function commitmentFormatTime(minutes) {
    var total = Math.max(0, Math.min(1439, Math.round(Number(minutes) || 0)));
    return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

function commitmentFormatDuration(minutes) {
    var n = Math.max(0, Math.round(Number(minutes) || 0));
    if (n < 60) return n + 'm';
    var hours = Math.floor(n / 60);
    var remainder = n % 60;
    return hours + 'h' + (remainder ? ' ' + remainder + 'm' : '');
}

function commitmentDateObject(dateStr) {
    return new Date(String(dateStr || today()) + 'T12:00:00');
}

function commitmentAddDays(dateStr, days) {
    var date = commitmentDateObject(dateStr);
    date.setDate(date.getDate() + Number(days || 0));
    return fmtDate(date);
}

function commitmentDateDistance(startDate, endDate) {
    return Math.round((commitmentDateObject(endDate) - commitmentDateObject(startDate)) / 86400000);
}

function commitmentNiceDate(dateStr) {
    try {
        return commitmentDateObject(dateStr).toLocaleDateString('en-CA', { weekday:'short', month:'short', day:'numeric' });
    } catch (e) {
        return String(dateStr || '');
    }
}

function commitmentEscape(value) {
    return typeof esc === 'function' ? esc(String(value == null ? '' : value)) : String(value == null ? '' : value);
}

function commitmentGetPreferences() {
    var raw = get(K.commitmentPrefs);
    raw = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    var prefs = Object.assign({}, COMMITMENT_DEFAULTS, raw);
    if (commitmentParseTime(prefs.dayStart) === null) prefs.dayStart = COMMITMENT_DEFAULTS.dayStart;
    if (commitmentParseTime(prefs.dayEnd) === null) prefs.dayEnd = COMMITMENT_DEFAULTS.dayEnd;
    if (commitmentParseTime(prefs.dayEnd) <= commitmentParseTime(prefs.dayStart)) {
        prefs.dayStart = COMMITMENT_DEFAULTS.dayStart;
        prefs.dayEnd = COMMITMENT_DEFAULTS.dayEnd;
    }
    prefs.warningsEnabled = prefs.warningsEnabled !== false;
    prefs.dailyBudgetMinutes = commitmentClampNumber(prefs.dailyBudgetMinutes, COMMITMENT_DEFAULTS.dailyBudgetMinutes, 240, 960);
    prefs.maxStudyMinutes = commitmentClampNumber(prefs.maxStudyMinutes, COMMITMENT_DEFAULTS.maxStudyMinutes, 60, 480);
    prefs.bufferMinutes = commitmentClampNumber(prefs.bufferMinutes, COMMITMENT_DEFAULTS.bufferMinutes, 0, 60);
    prefs.defaultTaskMinutes = commitmentClampNumber(prefs.defaultTaskMinutes, COMMITMENT_DEFAULTS.defaultTaskMinutes, 5, 240);
    prefs.defaultHabitMinutes = commitmentClampNumber(prefs.defaultHabitMinutes, COMMITMENT_DEFAULTS.defaultHabitMinutes, 2, 120);
    prefs.version = 1;
    return prefs;
}

function commitmentSetPreferences(patch) {
    var next = Object.assign({}, commitmentGetPreferences(), patch || {}, { version:1 });
    set(K.commitmentPrefs, next);
    return commitmentGetPreferences();
}

function commitmentEventOccursOn(event, dateStr) {
    if (!event || !event.date || !dateStr || dateStr < event.date) return false;
    if (event.date === dateStr) return true;
    var repeat = String(event.repeat || '').toLowerCase();
    if (!repeat) return false;
    var distance = commitmentDateDistance(event.date, dateStr);
    if (distance < 0) return false;
    if (repeat === 'daily') return true;
    if (repeat === 'weekly') return distance % 7 === 0;
    if (repeat === 'monthly') return commitmentDateObject(event.date).getDate() === commitmentDateObject(dateStr).getDate();
    return false;
}

function commitmentEventOccurrencesForDate(dateStr) {
    return arr(K.events).filter(function(event){ return commitmentEventOccursOn(event, dateStr); }).map(function(event){
        return Object.assign({}, event, {
            date: dateStr,
            occurrenceDate: dateStr,
            seriesStartDate: event.date,
            recurring: !!event.repeat
        });
    });
}

function commitmentDurationFor(kind, raw, prefs) {
    var parsed = parseInt(raw && raw.duration, 10);
    if (Number.isFinite(parsed) && parsed > 0) return { minutes:Math.min(parsed, 720), estimated:false };
    if (kind === 'habit') return { minutes:prefs.defaultHabitMinutes, estimated:true };
    if (kind === 'task') return { minutes:prefs.defaultTaskMinutes, estimated:true };
    return { minutes:60, estimated:true };
}

function commitmentKindLabel(kind) {
    return ({ event:'Calendar', task:'Task', habit:'Habit', activity:'Activity', focus:'Focus', journal:'Journal', study:'Study' })[kind] || 'Commitment';
}

function commitmentRouteFor(kind) {
    if (kind === 'event') return 'calendar';
    if (kind === 'task') return 'tasks';
    if (kind === 'habit') return 'habits';
    return 'calendar';
}

function commitmentIsStudy(kind, raw) {
    var category = String(raw && (raw.category || raw.type || raw.activityType) || '').toLowerCase();
    return category === 'study' || kind === 'study' || kind === 'focus';
}

function commitmentNormalize(kind, raw, dateStr, options) {
    raw = raw && typeof raw === 'object' ? raw : {};
    options = options || {};
    var prefs = options.preferences || commitmentGetPreferences();
    var duration = commitmentDurationFor(kind, raw, prefs);
    var time = String(raw.time || raw.scheduledTime || raw.preferredTime || '');
    var start = commitmentParseTime(time);
    var id = String(raw.id || options.id || ('temporary-' + kind));
    var date = String(dateStr || raw.date || raw.due || raw.dueDate || '');
    var title = String(raw.title || raw.name || options.title || commitmentKindLabel(kind));
    var category = String(raw.category || raw.type || (kind === 'habit' ? 'routine' : 'general'));
    return {
        key: kind + ':' + id + ':' + date,
        entityKey: kind + ':' + id,
        id: id,
        kind: kind,
        kindLabel: commitmentKindLabel(kind),
        route: commitmentRouteFor(kind),
        title: title,
        date: date,
        time: start === null ? '' : commitmentFormatTime(start),
        start: start,
        end: start === null ? null : Math.min(1440, start + duration.minutes),
        duration: duration.minutes,
        durationEstimated: duration.estimated,
        category: category,
        study: commitmentIsStudy(kind, raw),
        repeat: raw.repeat || '',
        completed: !!options.completed,
        raw: raw
    };
}

function commitmentGetDayCommitments(dateStr, options) {
    options = options || {};
    var prefs = options.preferences || commitmentGetPreferences();
    var rows = [];
    commitmentEventOccurrencesForDate(dateStr).forEach(function(event){
        rows.push(commitmentNormalize('event', event, dateStr, { preferences:prefs }));
    });
    arr(K.tasks).forEach(function(task){
        if (taskIsCompleted(task) || taskDueDate(task) !== dateStr) return;
        rows.push(commitmentNormalize('task', task, dateStr, { preferences:prefs }));
    });
    var logs = arr(K.habitLogs);
    arr(K.habits).forEach(function(habit){
        if (habit && (habit.archived || habit.active === false)) return;
        var completed = logs.some(function(log){ return log.habitId === habit.id && log.date === dateStr; });
        if (completed && options.includeCompletedHabits !== true) return;
        rows.push(commitmentNormalize('habit', habit, dateStr, { preferences:prefs, completed:completed }));
    });
    return rows;
}

function commitmentOverlapMinutes(a, b) {
    if (!a || !b || a.start === null || b.start === null || a.end === null || b.end === null) return 0;
    return Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
}

function commitmentSeverityForPair(a, b) {
    var kinds = [a.kind, b.kind];
    if (kinds.every(function(kind){ return kind === 'event'; })) return 'critical';
    if (kinds.indexOf('activity') !== -1 || kinds.indexOf('focus') !== -1 || kinds.indexOf('study') !== -1 || kinds.indexOf('journal') !== -1) return 'warning';
    if (kinds.indexOf('event') !== -1 && (kinds.indexOf('task') !== -1 || kinds.indexOf('habit') !== -1)) return 'warning';
    if (kinds.every(function(kind){ return kind === 'task'; })) return 'warning';
    return 'notice';
}

function commitmentRangeLabel(record) {
    if (!record || record.start === null) return 'Flexible time';
    return commitmentFormatTime(record.start) + '–' + commitmentFormatTime(Math.min(1439, record.end));
}

function commitmentPairIssue(a, b, dateStr, options) {
    options = options || {};
    var overlap = commitmentOverlapMinutes(a, b);
    if (overlap <= 0) return null;
    var keys = [a.key, b.key].sort();
    return {
        id: 'overlap:' + dateStr + ':' + keys.join('|'),
        type: 'overlap',
        severity: commitmentSeverityForPair(a, b),
        date: dateStr,
        title: a.title + ' overlaps ' + b.title,
        detail: commitmentRangeLabel(a) + ' and ' + commitmentRangeLabel(b) + ' · ' + overlap + ' min overlap',
        minutes: overlap,
        entities: [a, b],
        candidate: options.candidate || null
    };
}

function commitmentTransitionIssue(previous, next, dateStr, prefs) {
    if (!previous || !next || previous.end === null || next.start === null) return null;
    var gap = next.start - previous.end;
    if (gap < 0 || gap >= prefs.bufferMinutes || prefs.bufferMinutes <= 0) return null;
    if (previous.kind === 'habit' && next.kind === 'habit') return null;
    return {
        id: 'buffer:' + dateStr + ':' + previous.key + '|' + next.key,
        type: 'buffer',
        severity: 'notice',
        date: dateStr,
        title: 'No transition buffer between ' + previous.title + ' and ' + next.title,
        detail: commitmentRangeLabel(previous) + ' → ' + commitmentRangeLabel(next) + ' · ' + gap + ' min gap (preference: ' + prefs.bufferMinutes + ' min)',
        minutes: gap,
        entities: [previous, next]
    };
}

function commitmentSeverityRank(value) {
    return ({ critical:0, warning:1, notice:2, clear:3 })[value] == null ? 4 : ({ critical:0, warning:1, notice:2, clear:3 })[value];
}

function commitmentSortIssues(issues) {
    return (issues || []).slice().sort(function(a, b){
        return commitmentSeverityRank(a.severity) - commitmentSeverityRank(b.severity) || String(a.date).localeCompare(String(b.date)) || String(a.title).localeCompare(String(b.title));
    });
}

function commitmentNowMinutes() {
    var now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

function commitmentScanDay(dateStr, options) {
    options = options || {};
    var prefs = options.preferences || commitmentGetPreferences();
    var commitments = options.commitments || commitmentGetDayCommitments(dateStr, { preferences:prefs, includeCompletedHabits:options.includeCompletedHabits });
    var timed = commitments.filter(function(row){ return row.start !== null && !row.completed; }).sort(function(a,b){ return a.start - b.start || a.end - b.end; });
    var nowMin = dateStr === today() ? commitmentNowMinutes() : null;
    var issues = [];

    for (var i = 0; i < timed.length; i++) {
        for (var j = i + 1; j < timed.length; j++) {
            if (timed[j].start >= timed[i].end) break;
            if (options.includePast !== true && nowMin !== null && Math.max(timed[i].end, timed[j].end) <= nowMin) continue;
            var issue = commitmentPairIssue(timed[i], timed[j], dateStr);
            if (issue) issues.push(issue);
        }
    }

    for (var k = 1; k < timed.length; k++) {
        var previous = timed[k - 1];
        var next = timed[k];
        if (options.includePast !== true && nowMin !== null && previous.end <= nowMin) continue;
        var transition = commitmentTransitionIssue(previous, next, dateStr, prefs);
        if (transition) issues.push(transition);
    }

    var loadRows = commitments.filter(function(row){
        if (row.completed) return false;
        if (dateStr !== today() || options.remainingOnly !== true) return true;
        return row.end === null || row.end > nowMin;
    });
    var totalMinutes = loadRows.reduce(function(sum, row){ return sum + row.duration; }, 0);
    var studyMinutes = loadRows.filter(function(row){ return row.study; }).reduce(function(sum, row){ return sum + row.duration; }, 0);
    var estimatedCount = loadRows.filter(function(row){ return row.durationEstimated; }).length;
    var untimedCount = loadRows.filter(function(row){ return row.start === null; }).length;
    var loadRatio = prefs.dailyBudgetMinutes ? totalMinutes / prefs.dailyBudgetMinutes : 0;

    if (totalMinutes > prefs.dailyBudgetMinutes) {
        issues.push({
            id: 'capacity:' + dateStr,
            type: 'capacity',
            severity: totalMinutes > prefs.dailyBudgetMinutes * 1.2 ? 'critical' : 'warning',
            date: dateStr,
            title: 'Daily commitment budget exceeded',
            detail: commitmentFormatDuration(totalMinutes) + ' planned against a ' + commitmentFormatDuration(prefs.dailyBudgetMinutes) + ' budget',
            minutes: totalMinutes - prefs.dailyBudgetMinutes,
            entities: loadRows
        });
    } else if (loadRatio >= 0.85) {
        issues.push({
            id: 'capacity-near:' + dateStr,
            type: 'capacity',
            severity: 'notice',
            date: dateStr,
            title: 'Daily commitment budget is nearly full',
            detail: Math.round(loadRatio * 100) + '% allocated · protect recovery and transition time',
            minutes: prefs.dailyBudgetMinutes - totalMinutes,
            entities: loadRows
        });
    }

    if (studyMinutes > prefs.maxStudyMinutes) {
        issues.push({
            id: 'study-load:' + dateStr,
            type: 'study-load',
            severity: 'warning',
            date: dateStr,
            title: 'Planned study crosses your quality guardrail',
            detail: commitmentFormatDuration(studyMinutes) + ' planned · use ' + commitmentFormatDuration(prefs.maxStudyMinutes) + ' as a fatigue and quality check-in, not a biological cutoff',
            minutes: studyMinutes - prefs.maxStudyMinutes,
            entities: loadRows.filter(function(row){ return row.study; })
        });
    }

    issues = commitmentSortIssues(issues);
    return {
        date: dateStr,
        commitments: commitments,
        timed: timed,
        issues: issues,
        seriousIssues: issues.filter(function(issue){ return issue.severity === 'critical' || issue.severity === 'warning'; }),
        load: {
            totalMinutes: totalMinutes,
            studyMinutes: studyMinutes,
            budgetMinutes: prefs.dailyBudgetMinutes,
            ratio: loadRatio,
            estimatedCount: estimatedCount,
            untimedCount: untimedCount,
            timedCount: loadRows.length - untimedCount
        },
        preferences: prefs
    };
}

function commitmentScanRange(startDate, endDate, options) {
    options = options || {};
    var days = [];
    var cursor = startDate;
    var guard = 0;
    while (cursor <= endDate && guard < 370) {
        days.push(commitmentScanDay(cursor, options));
        cursor = commitmentAddDays(cursor, 1);
        guard++;
    }
    var issues = commitmentSortIssues(days.reduce(function(all, day){ return all.concat(day.issues); }, []));
    return {
        startDate: startDate,
        endDate: endDate,
        days: days,
        issues: issues,
        seriousIssues: issues.filter(function(issue){ return issue.severity === 'critical' || issue.severity === 'warning'; }),
        criticalCount: issues.filter(function(issue){ return issue.severity === 'critical'; }).length,
        warningCount: issues.filter(function(issue){ return issue.severity === 'warning'; }).length,
        noticeCount: issues.filter(function(issue){ return issue.severity === 'notice'; }).length
    };
}

function commitmentScanHorizon(days, startDate, options) {
    var count = Math.max(1, Number(days || 7));
    var start = startDate || today();
    return commitmentScanRange(start, commitmentAddDays(start, count - 1), options || {});
}

function commitmentCandidateDates(candidate) {
    var firstDate = candidate.date || today();
    if (candidate.kind === 'habit') {
        return Array.from({ length:7 }, function(_, index){ return commitmentAddDays(firstDate, index); });
    }
    if (candidate.kind === 'event' && candidate.repeat) {
        var dates = [];
        for (var i = 0; i < 30; i++) {
            var date = commitmentAddDays(firstDate, i);
            var raw = Object.assign({}, candidate.raw, { date:firstDate, repeat:candidate.repeat });
            if (commitmentEventOccursOn(raw, date)) dates.push(date);
        }
        return dates.length ? dates : [firstDate];
    }
    return [firstDate];
}

function commitmentExcludeMatch(record, exclude) {
    if (!exclude || !record) return false;
    return record.kind === exclude.kind && String(record.id) === String(exclude.id);
}

function commitmentEvaluateCandidate(rawCandidate, exclude, options) {
    options = options || {};
    var kind = rawCandidate.kind || 'task';
    var baseDate = rawCandidate.date || (kind === 'habit' ? today() : '');
    var base = commitmentNormalize(kind, rawCandidate, baseDate, { preferences:commitmentGetPreferences(), id:rawCandidate.id || 'candidate' });
    base.raw = Object.assign({}, rawCandidate);
    base.repeat = rawCandidate.repeat || '';
    if (!base.date) return { candidate:base, dates:[], issues:[], seriousIssues:[], suggestions:[], hasSerious:false };

    var issues = [];
    var dates = commitmentCandidateDates(base);
    dates.forEach(function(dateStr){
        var candidate = commitmentNormalize(kind, Object.assign({}, rawCandidate, { date:dateStr }), dateStr, { preferences:commitmentGetPreferences(), id:rawCandidate.id || 'candidate' });
        candidate.raw = Object.assign({}, rawCandidate);
        var existing = commitmentGetDayCommitments(dateStr).filter(function(record){ return !commitmentExcludeMatch(record, exclude); });
        existing.forEach(function(record){
            var pair = commitmentPairIssue(candidate, record, dateStr, { candidate:candidate });
            if (pair) issues.push(pair);
            else if (candidate.start !== null && record.start !== null) {
                var ordered = [candidate, record].sort(function(a,b){ return a.start - b.start; });
                var transition = commitmentTransitionIssue(ordered[0], ordered[1], dateStr, commitmentGetPreferences());
                if (transition) {
                    transition.candidate = candidate;
                    issues.push(transition);
                }
            }
        });

        var loadRows = existing.filter(function(row){ return !row.completed; });
        var total = loadRows.reduce(function(sum, row){ return sum + row.duration; }, 0) + candidate.duration;
        var prefs = commitmentGetPreferences();
        if (total > prefs.dailyBudgetMinutes) {
            issues.push({
                id: 'candidate-capacity:' + dateStr + ':' + candidate.key,
                type: 'capacity',
                severity: total > prefs.dailyBudgetMinutes * 1.2 ? 'critical' : 'warning',
                date: dateStr,
                title: 'This addition exceeds the daily commitment budget',
                detail: commitmentFormatDuration(total) + ' would be planned against ' + commitmentFormatDuration(prefs.dailyBudgetMinutes),
                minutes: total - prefs.dailyBudgetMinutes,
                entities: [candidate],
                candidate: candidate
            });
        }
        var study = loadRows.filter(function(row){ return row.study; }).reduce(function(sum, row){ return sum + row.duration; }, 0) + (candidate.study ? candidate.duration : 0);
        if (candidate.study && study > prefs.maxStudyMinutes) {
            issues.push({
                id: 'candidate-study:' + dateStr + ':' + candidate.key,
                type: 'study-load',
                severity: 'warning',
                date: dateStr,
                title: 'This addition crosses your study-quality guardrail',
                detail: commitmentFormatDuration(study) + ' of planned study on ' + commitmentNiceDate(dateStr),
                minutes: study - prefs.maxStudyMinutes,
                entities: [candidate],
                candidate: candidate
            });
        }
    });

    var seen = new Set();
    issues = commitmentSortIssues(issues).filter(function(issue){
        if (seen.has(issue.id)) return false;
        seen.add(issue.id);
        return true;
    });
    var serious = issues.filter(function(issue){ return issue.severity === 'critical' || issue.severity === 'warning'; });
    var suggestions = base.start === null ? [] : commitmentFindOpenSlots(base.date, base.duration, { exclude:exclude, limit:4 });
    return {
        candidate: base,
        dates: dates,
        issues: issues,
        seriousIssues: serious,
        suggestions: suggestions,
        hasSerious: serious.length > 0
    };
}

function commitmentHasIntervalConflict(dateStr, startMin, endMin, options) {
    options = options || {};
    var prefs = options.preferences || commitmentGetPreferences();
    var buffer = options.includeBuffer === false ? 0 : prefs.bufferMinutes;
    return commitmentGetDayCommitments(dateStr).filter(function(row){ return row.start !== null && !commitmentExcludeMatch(row, options.exclude); }).some(function(row){
        return startMin < row.end + buffer && endMin > row.start - buffer;
    });
}

function commitmentFindOpenSlots(dateStr, durationMinutes, options) {
    options = options || {};
    var prefs = options.preferences || commitmentGetPreferences();
    var duration = commitmentClampNumber(durationMinutes, 30, 5, 720);
    var step = commitmentClampNumber(options.stepMinutes, 15, 5, 60);
    var start = commitmentParseTime(options.dayStart || prefs.dayStart);
    var end = commitmentParseTime(options.dayEnd || prefs.dayEnd);
    if (dateStr === today() && options.allowPast !== true) {
        var roundedNow = Math.ceil((commitmentNowMinutes() + 5) / step) * step;
        start = Math.max(start, roundedNow);
    }
    var slots = [];
    for (var minute = start; minute + duration <= end; minute += step) {
        if (!commitmentHasIntervalConflict(dateStr, minute, minute + duration, { exclude:options.exclude, preferences:prefs })) {
            slots.push(commitmentFormatTime(minute));
            if (slots.length >= (options.limit || 5)) break;
        }
    }
    return slots;
}

function commitmentIssueCountFor(kind, id, dateStr) {
    return commitmentScanDay(dateStr || today()).issues.filter(function(issue){
        return (issue.type === 'overlap' || issue.type === 'buffer') && (issue.entities || []).some(function(entity){ return entity.kind === kind && String(entity.id) === String(id); });
    }).length;
}

function commitmentStatusLabel(scan) {
    if (scan.criticalCount > 0) return { label:'CONFLICT', severity:'critical' };
    if (scan.warningCount > 0) return { label:'WATCH', severity:'warning' };
    if (scan.noticeCount > 0) return { label:'HEADS-UP', severity:'notice' };
    return { label:'CLEAR', severity:'clear' };
}

function commitmentSeverityIcon(severity) {
    return ({ critical:'!', warning:'!', notice:'i', clear:'✓' })[severity] || 'i';
}

function commitmentIssueMarkup(issue, compact) {
    var entityNames = (issue.entities || []).slice(0, 2).map(function(entity){ return entity.kindLabel; }).join(' + ');
    return '<div class="commitment-issue is-' + commitmentEscape(issue.severity) + '">' +
        '<span class="commitment-issue-icon">' + commitmentSeverityIcon(issue.severity) + '</span>' +
        '<div><strong>' + commitmentEscape(issue.title) + '</strong>' +
        '<small>' + commitmentEscape(commitmentNiceDate(issue.date) + (entityNames ? ' · ' + entityNames : '')) + '</small>' +
        (compact ? '' : '<p>' + commitmentEscape(issue.detail) + '</p>') + '</div>' +
        '</div>';
}

function renderCommitmentHeadsUp() {
    var banner = document.getElementById('commitmentHeadsUp');
    var bell = document.getElementById('commitmentBell');
    var countEl = document.getElementById('commitmentBellCount');
    if (!banner || !bell || !countEl) return;
    var prefs = commitmentGetPreferences();
    var horizon = commitmentScanHorizon(7);
    var status = commitmentStatusLabel(horizon);
    var actionableCount = horizon.criticalCount + horizon.warningCount;
    countEl.textContent = String(actionableCount);
    bell.classList.toggle('is-alert', actionableCount > 0);
    bell.classList.toggle('is-notice', actionableCount === 0 && horizon.noticeCount > 0);
    bell.setAttribute('aria-label', 'Commitment intelligence: ' + actionableCount + ' warning' + (actionableCount === 1 ? '' : 's'));

    if (!prefs.warningsEnabled || !horizon.issues.length) {
        banner.hidden = true;
        return;
    }
    var top = horizon.issues[0];
    var signature = top.id + ':' + horizon.issues.length;
    if (signature === commitmentDismissedSignature) {
        banner.hidden = true;
        return;
    }
    banner.hidden = false;
    banner.className = 'commitment-headsup is-' + status.severity;
    banner.innerHTML = '<span class="commitment-headsup-icon">' + commitmentSeverityIcon(status.severity) + '</span>' +
        '<div><strong>' + commitmentEscape(top.title) + '</strong><span>' + commitmentEscape(top.detail) + '</span></div>' +
        '<div class="commitment-headsup-actions"><button class="btn btn-sm btn-secondary" onclick="openCommitmentCenter()">Review</button>' +
        '<button class="commitment-dismiss" onclick="dismissCommitmentHeadsUp()" aria-label="Dismiss this heads-up">×</button></div>';
    banner.dataset.signature = signature;
}

function dismissCommitmentHeadsUp() {
    var banner = document.getElementById('commitmentHeadsUp');
    if (!banner) return;
    commitmentDismissedSignature = banner.dataset.signature || '';
    banner.hidden = true;
}

function commitmentLoadMarkup(day) {
    var ratio = Math.max(0, day.load.ratio || 0);
    var width = Math.min(100, Math.round(ratio * 100));
    var severity = ratio > 1 ? 'critical' : ratio >= 0.85 ? 'warning' : 'clear';
    return '<div class="commitment-load">' +
        '<div class="commitment-load-head"><strong>Daily load</strong><span>' + commitmentFormatDuration(day.load.totalMinutes) + ' / ' + commitmentFormatDuration(day.load.budgetMinutes) + '</span></div>' +
        '<div class="commitment-load-track"><i class="is-' + severity + '" style="width:' + width + '%"></i></div>' +
        '<small>' + day.load.timedCount + ' timed · ' + day.load.untimedCount + ' flexible' + (day.load.estimatedCount ? ' · ' + day.load.estimatedCount + ' estimated' : '') + '</small>' +
        '</div>';
}

function renderCommitmentDashboard() {
    var host = document.getElementById('dashCommitmentIntelligence');
    if (!host) return;
    var day = commitmentScanDay(today());
    var horizon = commitmentScanHorizon(7);
    var status = commitmentStatusLabel(horizon);
    var nowMin = commitmentNowMinutes();
    var agenda = day.commitments.filter(function(row){ return row.start === null || row.end > nowMin; }).sort(function(a,b){
        if (a.start === null && b.start !== null) return 1;
        if (a.start !== null && b.start === null) return -1;
        return (a.start || 0) - (b.start || 0);
    }).slice(0, 5);
    host.className = 'card commitment-dashboard is-' + status.severity;
    host.innerHTML = '<div class="commitment-panel-head"><div><span class="kicker">Commitment Intelligence</span><h3>Can today actually fit?</h3><p>Calendar blocks, timed tasks, recurring habits, transition buffers, and study load use one shared plan.</p></div>' +
        '<div class="commitment-panel-actions"><span class="commitment-status is-' + status.severity + '">' + status.label + '</span><button class="btn btn-sm btn-secondary" onclick="openCommitmentCenter()">Review 7 days</button></div></div>' +
        '<div class="commitment-overview-grid"><div>' + commitmentLoadMarkup(day) +
        '<div class="commitment-metric-row"><div><strong>' + horizon.criticalCount + '</strong><span>hard conflicts</span></div><div><strong>' + horizon.warningCount + '</strong><span>warnings</span></div><div><strong>' + commitmentFormatDuration(day.load.studyMinutes) + '</strong><span>planned study</span></div></div></div>' +
        '<div><div class="commitment-subhead">Next commitments</div><div class="commitment-agenda">' + (agenda.length ? agenda.map(function(row){
            return '<button onclick="commitmentOpenRecord(\'' + row.kind + '\',\'' + commitmentEscape(row.id) + '\',\'' + commitmentEscape(row.date) + '\')"><span>' + (row.time || 'Flexible') + '</span><strong>' + commitmentEscape(row.title) + '</strong><small>' + commitmentEscape(row.kindLabel) + ' · ' + commitmentFormatDuration(row.duration) + '</small></button>';
        }).join('') : '<div class="empty compact">No remaining commitments today.</div>') + '</div></div></div>' +
        (horizon.issues.length ? '<div class="commitment-dashboard-issues">' + horizon.issues.slice(0, 2).map(function(issue){ return commitmentIssueMarkup(issue, true); }).join('') + '</div>' : '<div class="commitment-clear-note">✓ No collision or overload detected in the next seven days.</div>');
}

function renderCalendarConflictPanel() {
    var host = document.getElementById('calConflictPanel');
    if (!host) return;
    var dateStr = (typeof selectedCalendarDate !== 'undefined' && selectedCalendarDate) || today();
    var day = commitmentScanDay(dateStr, { includePast:true });
    var serious = day.seriousIssues;
    host.className = 'card commitment-rail-card ' + (serious.length ? 'has-warning' : 'is-clear');
    host.innerHTML = '<div class="commitment-rail-head"><div><span class="kicker">Schedule check</span><strong>' + commitmentEscape(commitmentNiceDate(dateStr)) + '</strong></div><span class="commitment-status is-' + (serious.length ? 'warning' : 'clear') + '">' + (serious.length ? serious.length + ' WARN' : 'CLEAR') + '</span></div>' +
        commitmentLoadMarkup(day) +
        (day.issues.length ? day.issues.slice(0, 3).map(function(issue){ return commitmentIssueMarkup(issue, true); }).join('') : '<div class="commitment-clear-note">No overlap detected for this day.</div>') +
        '<button class="btn btn-sm btn-secondary" style="width:100%;margin-top:10px;" onclick="openCommitmentCenter()">Open intelligence center</button>';
}

function renderTaskConflictSummary() {
    var host = document.getElementById('taskConflictSummary');
    if (!host) return;
    var horizon = commitmentScanHorizon(7);
    var taskIssues = horizon.issues.filter(function(issue){ return (issue.entities || []).some(function(entity){ return entity.kind === 'task'; }); });
    host.innerHTML = taskIssues.length ? '<div class="commitment-summary-strip is-warning"><div><strong>' + taskIssues.length + ' task scheduling heads-up' + (taskIssues.length === 1 ? '' : 's') + '</strong><span>' + commitmentEscape(taskIssues[0].title) + '</span></div><button class="btn btn-sm btn-secondary" onclick="openCommitmentCenter()">Review</button></div>' : '<div class="commitment-summary-strip is-clear"><div><strong>Tasks fit the current plan</strong><span>Date-only tasks count toward capacity; add a start time for exact collision checks.</span></div></div>';
}

function renderHabitConflictSummary() {
    var host = document.getElementById('habitConflictSummary');
    if (!host) return;
    var horizon = commitmentScanHorizon(7);
    var habitIssues = horizon.issues.filter(function(issue){ return (issue.entities || []).some(function(entity){ return entity.kind === 'habit'; }); });
    host.innerHTML = habitIssues.length ? '<div class="commitment-summary-strip is-warning"><div><strong>' + habitIssues.length + ' habit timing heads-up' + (habitIssues.length === 1 ? '' : 's') + '</strong><span>' + commitmentEscape(habitIssues[0].title) + '</span></div><button class="btn btn-sm btn-secondary" onclick="openCommitmentCenter()">Review</button></div>' : '<div class="commitment-summary-strip is-clear"><div><strong>Habit timing is clear</strong><span>Preferred times are optional; unscheduled habits remain flexible.</span></div></div>';
}

function renderCommitmentSurfaces() {
    renderCommitmentHeadsUp();
    renderCommitmentDashboard();
    renderCalendarConflictPanel();
    renderTaskConflictSummary();
    renderHabitConflictSummary();
}

function commitmentRenderCandidatePreview(containerId, candidate, exclude) {
    var host = document.getElementById(containerId);
    if (!host) return null;
    if (candidate.kind !== 'habit' && !candidate.date) {
        host.className = 'commitment-inline is-neutral';
        host.innerHTML = '<strong>Add a date to check the plan.</strong><span>A start time enables exact overlap detection.</span>';
        return null;
    }
    var evaluation = commitmentEvaluateCandidate(candidate, exclude);
    var issues = evaluation.issues;
    if (!candidate.time) {
        var loadIssue = issues.find(function(issue){ return issue.type === 'capacity' || issue.type === 'study-load'; });
        host.className = 'commitment-inline ' + (loadIssue ? 'is-warning' : 'is-neutral');
        host.innerHTML = loadIssue ? commitmentIssueMarkup(loadIssue, false) : '<strong>Capacity checked; exact time is still flexible.</strong><span>Add a start time to detect minute-by-minute collisions.</span>';
        return evaluation;
    }
    if (!issues.length) {
        host.className = 'commitment-inline is-clear';
        host.innerHTML = '<strong>✓ No conflict detected.</strong><span>' + (evaluation.suggestions.length ? 'This time fits the current plan and transition buffer.' : 'This time fits the current plan.') + '</span>';
        return evaluation;
    }
    host.className = 'commitment-inline is-warning';
    host.innerHTML = issues.slice(0, 3).map(function(issue){ return commitmentIssueMarkup(issue, false); }).join('') + (issues.length > 3 ? '<small>+' + (issues.length - 3) + ' more recurring or capacity heads-up(s)</small>' : '');
    return evaluation;
}

function commitmentModalIssueList(issues, limit) {
    var rows = (issues || []).slice(0, limit || 8);
    return rows.length ? rows.map(function(issue){ return '<button class="commitment-modal-issue" onclick="commitmentOpenIssue(\'' + encodeURIComponent(issue.id) + '\')">' + commitmentIssueMarkup(issue, false) + '<span>Open →</span></button>'; }).join('') : '<div class="commitment-empty"><strong>No conflicts detected.</strong><span>Your current dates, times, buffers, and capacity settings fit.</span></div>';
}

function openCommitmentCenter() {
    commitmentPendingAction = null;
    var modal = document.getElementById('commitmentCenterModal');
    var title = document.getElementById('commitmentModalTitle');
    var body = document.getElementById('commitmentModalBody');
    var footer = document.getElementById('commitmentModalFooter');
    if (!modal || !title || !body || !footer) return;
    var prefs = commitmentGetPreferences();
    var horizon = commitmentScanHorizon(7);
    var todayScan = horizon.days[0] || commitmentScanDay(today());
    var status = commitmentStatusLabel(horizon);
    title.textContent = 'Schedule health · next 7 days';
    body.innerHTML = '<div class="commitment-modal-summary"><span class="commitment-status is-' + status.severity + '">' + status.label + '</span><div><strong>' + horizon.criticalCount + ' hard · ' + horizon.warningCount + ' warning · ' + horizon.noticeCount + ' notice</strong><span>Explanations are deterministic and stay in this browser.</span></div></div>' +
        commitmentLoadMarkup(todayScan) +
        '<div class="commitment-modal-section"><div class="commitment-subhead">What needs attention</div>' + commitmentModalIssueList(horizon.issues, 10) + (horizon.issues.length > 10 ? '<div class="muted">+' + (horizon.issues.length - 10) + ' additional heads-up(s)</div>' : '') + '</div>' +
        '<details class="commitment-preferences"><summary>Warning preferences</summary><div class="commitment-preference-grid">' +
        '<label>Planning day starts<input type="time" id="commitmentPrefStart" value="' + commitmentEscape(prefs.dayStart) + '"></label>' +
        '<label>Planning day ends<input type="time" id="commitmentPrefEnd" value="' + commitmentEscape(prefs.dayEnd) + '"></label>' +
        '<label>Daily budget (hours)<input type="number" id="commitmentPrefBudget" min="4" max="16" step="0.5" value="' + (prefs.dailyBudgetMinutes / 60) + '"></label>' +
        '<label>Study guardrail (hours)<input type="number" id="commitmentPrefStudy" min="1" max="8" step="0.5" value="' + (prefs.maxStudyMinutes / 60) + '"></label>' +
        '<label>Transition buffer (min)<input type="number" id="commitmentPrefBuffer" min="0" max="60" step="5" value="' + prefs.bufferMinutes + '"></label>' +
        '<label>Default task estimate (min)<input type="number" id="commitmentPrefTask" min="5" max="240" step="5" value="' + prefs.defaultTaskMinutes + '"></label>' +
        '<label>Default habit estimate (min)<input type="number" id="commitmentPrefHabit" min="2" max="120" step="1" value="' + prefs.defaultHabitMinutes + '"></label>' +
        '<label class="commitment-toggle"><input type="checkbox" id="commitmentPrefEnabled" ' + (prefs.warningsEnabled ? 'checked' : '') + '><span>Show proactive warnings</span></label></div>' +
        '<div class="commitment-preference-actions"><button class="btn btn-sm btn-secondary" onclick="resetCommitmentPreferences()">Reset defaults</button><button class="btn btn-sm btn-primary" onclick="saveCommitmentPreferences()">Save preferences</button></div>' +
        '<p>Daily capacity includes explicit durations plus clearly marked defaults. The four-hour study value is a personal quality check-in, not a biological cutoff.</p></details>';
    footer.innerHTML = '<button class="btn btn-secondary" onclick="closeCommitmentCenter()">Close</button><button class="btn btn-primary" onclick="closeCommitmentCenter();go(\'calendar\')">Open Calendar</button>';
    openModal('commitmentCenterModal');
}

function closeCommitmentCenter() {
    commitmentPendingAction = null;
    var modal = document.getElementById('commitmentCenterModal');
    if (modal) modal.classList.remove('show');
}

function saveCommitmentPreferences() {
    var start = document.getElementById('commitmentPrefStart');
    var end = document.getElementById('commitmentPrefEnd');
    var budget = document.getElementById('commitmentPrefBudget');
    var study = document.getElementById('commitmentPrefStudy');
    var buffer = document.getElementById('commitmentPrefBuffer');
    var task = document.getElementById('commitmentPrefTask');
    var habit = document.getElementById('commitmentPrefHabit');
    var enabled = document.getElementById('commitmentPrefEnabled');
    commitmentSetPreferences({
        dayStart: start ? start.value : COMMITMENT_DEFAULTS.dayStart,
        dayEnd: end ? end.value : COMMITMENT_DEFAULTS.dayEnd,
        dailyBudgetMinutes: Math.round(Number(budget ? budget.value : 12) * 60),
        maxStudyMinutes: Math.round(Number(study ? study.value : 4) * 60),
        bufferMinutes: Number(buffer ? buffer.value : 10),
        defaultTaskMinutes: Number(task ? task.value : 30),
        defaultHabitMinutes: Number(habit ? habit.value : 10),
        warningsEnabled: !!(enabled && enabled.checked)
    });
    toast('Commitment preferences saved');
    openCommitmentCenter();
}

function resetCommitmentPreferences() {
    commitmentSetPreferences(Object.assign({}, COMMITMENT_DEFAULTS));
    toast('Commitment preferences reset');
    openCommitmentCenter();
}

function commitmentOpenIssue(encodedId) {
    var id = decodeURIComponent(String(encodedId || ''));
    var issue = commitmentScanHorizon(30).issues.find(function(row){ return row.id === id; });
    if (!issue) {
        closeCommitmentCenter();
        go('calendar');
        return;
    }
    if (issue.type === 'capacity' || issue.type === 'study-load') {
        closeCommitmentCenter();
        go('calendar');
        if (typeof selectedCalendarDate !== 'undefined') selectedCalendarDate = issue.date || today();
        if (typeof currentCalendarDate !== 'undefined') currentCalendarDate = commitmentDateObject(issue.date || today());
        if (typeof renderCalendar === 'function') renderCalendar();
        return;
    }
    var preferred = (issue.entities || []).find(function(entity){ return entity.kind === 'event'; }) || (issue.entities || [])[0];
    if (preferred) commitmentOpenRecord(preferred.kind, preferred.id, issue.date);
}

function commitmentOpenRecord(kind, id, dateStr) {
    closeCommitmentCenter();
    if (kind === 'event') {
        go('calendar');
        if (typeof selectedCalendarDate !== 'undefined') selectedCalendarDate = dateStr || today();
        if (typeof currentCalendarDate !== 'undefined') currentCalendarDate = commitmentDateObject(dateStr || today());
        if (typeof renderCalendar === 'function') renderCalendar();
        setTimeout(function(){ if (typeof editEvent === 'function') editEvent(String(id)); }, 0);
        return;
    }
    if (kind === 'task') {
        go('tasks');
        setTimeout(function(){ if (typeof editTask === 'function') editTask(String(id)); }, 0);
        return;
    }
    if (kind === 'habit') {
        go('habits');
        setTimeout(function(){ if (typeof editHabit === 'function') editHabit(String(id)); }, 0);
        return;
    }
    go('calendar');
}

function commitmentOpenPrompt(options) {
    options = options || {};
    var modal = document.getElementById('commitmentCenterModal');
    var title = document.getElementById('commitmentModalTitle');
    var body = document.getElementById('commitmentModalBody');
    var footer = document.getElementById('commitmentModalFooter');
    if (!modal || !title || !body || !footer) return false;
    commitmentPendingAction = options;
    title.textContent = options.title || 'This conflicts with the current plan';
    var suggestions = options.suggestions || [];
    body.innerHTML = '<div class="commitment-prompt-note"><strong>' + commitmentEscape(options.message || 'StudyOS found a scheduling risk before saving.') + '</strong><span>Nothing is blocked. Review the reason, adjust the time, or continue intentionally.</span></div>' +
        '<div class="commitment-modal-section">' + (options.issues || []).slice(0, 6).map(function(issue){ return commitmentIssueMarkup(issue, false); }).join('') + '</div>' +
        (suggestions.length ? '<div class="commitment-modal-section"><div class="commitment-subhead">Clear times on ' + commitmentEscape(commitmentNiceDate(options.date || today())) + '</div><div class="commitment-slot-row">' + suggestions.map(function(time){ return '<button class="btn btn-sm btn-secondary" onclick="commitmentApplySuggestedTime(\'' + time + '\')">' + time + '</button>'; }).join('') + '</div></div>' : '');
    footer.innerHTML = '<button class="btn btn-secondary" onclick="closeCommitmentCenter()">' + commitmentEscape(options.backLabel || 'Back') + '</button>' +
        '<button class="btn btn-secondary" onclick="commitmentOpenScheduleFromPrompt()">Open Calendar</button>' +
        '<button class="btn btn-primary" onclick="commitmentContinuePending()">' + commitmentEscape(options.continueLabel || 'Continue anyway') + '</button>';
    openModal('commitmentCenterModal');
    return true;
}

function commitmentPromptForSave(candidate, evaluation, onContinue, options) {
    options = options || {};
    var prefs = commitmentGetPreferences();
    if (!prefs.warningsEnabled || !evaluation || !evaluation.hasSerious) return false;
    return commitmentOpenPrompt({
        title: options.title || 'Check this commitment before saving',
        message: options.message || 'The proposed time or daily load conflicts with your current plan.',
        issues: evaluation.seriousIssues,
        suggestions: candidate.time ? evaluation.suggestions : [],
        date: candidate.date || today(),
        timeFieldId: options.timeFieldId || '',
        sourceModalId: options.sourceModalId || '',
        afterTime: options.afterTime || null,
        onContinue: onContinue,
        continueLabel: options.continueLabel || 'Save anyway',
        backLabel: options.backLabel || 'Keep editing'
    });
}

function commitmentApplySuggestedTime(time) {
    var pending = commitmentPendingAction;
    if (!pending) return;
    var field = pending.timeFieldId ? document.getElementById(pending.timeFieldId) : null;
    if (field) field.value = time;
    var afterTime = pending.afterTime;
    closeCommitmentCenter();
    if (typeof afterTime === 'function') afterTime(time);
    toast('Suggested time applied: ' + time);
}

function commitmentContinuePending() {
    var pending = commitmentPendingAction;
    if (!pending) return;
    var onContinue = pending.onContinue;
    commitmentPendingAction = null;
    var modal = document.getElementById('commitmentCenterModal');
    if (modal) modal.classList.remove('show');
    if (typeof onContinue === 'function') onContinue();
}

function commitmentOpenScheduleFromPrompt() {
    var pending = commitmentPendingAction;
    commitmentPendingAction = null;
    var modal = document.getElementById('commitmentCenterModal');
    if (modal) modal.classList.remove('show');
    if (pending && pending.sourceModalId) {
        var sourceModal = document.getElementById(pending.sourceModalId);
        if (sourceModal) sourceModal.classList.remove('show');
    }
    go('calendar');
}

function commitmentGuardActivity(options) {
    options = options || {};
    if (!commitmentGetPreferences().warningsEnabled || options.bypass) return false;
    var now = new Date();
    var minutes = commitmentClampNumber(options.minutes, 15, 1, 480);
    var candidate = {
        id: 'live-activity',
        kind: 'activity',
        activityType: options.activityType || 'general',
        title: options.title || 'New activity',
        date: today(),
        time: commitmentFormatTime(now.getHours() * 60 + now.getMinutes()),
        duration: String(minutes)
    };
    var evaluation = commitmentEvaluateCandidate(candidate, null);
    var collisions = evaluation.issues.filter(function(issue){
        if (issue.type !== 'overlap' && issue.type !== 'buffer') return false;
        var existing = (issue.entities || []).find(function(entity){ return entity.id !== 'live-activity'; });
        // Starting a study tool inside an already planned Study commitment is
        // execution of the plan, not a context switch. Journal/reflection and
        // non-study meetings still produce the warning.
        if (options.activityType === 'study' && existing && existing.study) return false;
        return true;
    });
    if (!collisions.length) return false;
    return commitmentOpenPrompt({
        title: options.promptTitle || 'Before you switch context',
        message: (options.title || 'This activity') + ' overlaps a commitment or leaves too little transition time.',
        issues: collisions,
        suggestions: [],
        date: today(),
        onContinue: options.onContinue,
        continueLabel: options.continueLabel || 'Continue anyway',
        backLabel: options.backLabel || 'Stay on plan'
    });
}

function commitmentSelfTest() {
    var prefs = commitmentGetPreferences();
    var a = commitmentNormalize('event', { id:'a', title:'A', time:'09:00', duration:'60' }, today(), { preferences:prefs });
    var b = commitmentNormalize('task', { id:'b', title:'B', time:'09:30', duration:'60' }, today(), { preferences:prefs });
    var c = commitmentNormalize('task', { id:'c', title:'C', time:'10:00', duration:'30' }, today(), { preferences:prefs });
    var checks = {
        overlap: commitmentOverlapMinutes(a, b) === 30,
        boundary: commitmentOverlapMinutes(a, c) === 0,
        dailyRepeat: commitmentEventOccursOn({ date:today(), repeat:'daily' }, commitmentAddDays(today(), 3)),
        weeklyRepeat: commitmentEventOccursOn({ date:today(), repeat:'weekly' }, commitmentAddDays(today(), 7)),
        noEarlyRepeat: !commitmentEventOccursOn({ date:today(), repeat:'daily' }, commitmentAddDays(today(), -1)),
        slotSearch: Array.isArray(commitmentFindOpenSlots(commitmentAddDays(today(), 1), 30, { limit:2 }))
    };
    return { pass:Object.keys(checks).every(function(key){ return checks[key]; }), checks:checks };
}

var COMMITMENTS = {
    defaults: COMMITMENT_DEFAULTS,
    getPreferences: commitmentGetPreferences,
    setPreferences: commitmentSetPreferences,
    parseTime: commitmentParseTime,
    formatTime: commitmentFormatTime,
    formatDuration: commitmentFormatDuration,
    addDays: commitmentAddDays,
    eventOccursOn: commitmentEventOccursOn,
    eventsForDate: commitmentEventOccurrencesForDate,
    getDayCommitments: commitmentGetDayCommitments,
    scanDay: commitmentScanDay,
    scanRange: commitmentScanRange,
    scanHorizon: commitmentScanHorizon,
    evaluateCandidate: commitmentEvaluateCandidate,
    findOpenSlots: commitmentFindOpenSlots,
    hasIntervalConflict: commitmentHasIntervalConflict,
    issueCountFor: commitmentIssueCountFor,
    guardActivity: commitmentGuardActivity,
    selfTest: commitmentSelfTest
};
window.COMMITMENTS = COMMITMENTS;

(function(){
    function scheduleRefresh(){
        clearTimeout(commitmentRefreshTimer);
        commitmentRefreshTimer = setTimeout(function(){
            try { renderCommitmentSurfaces(); } catch (error) { console.error('Commitment intelligence render failed', error); }
        }, 40);
    }
    if (typeof EVENTS !== 'undefined') {
        EVENTS.on('storage:changed', function(payload){
            if (!payload || [K.tasks, K.events, K.habits, K.habitLogs, K.commitmentPrefs].indexOf(payload.key) !== -1) scheduleRefresh();
        });
        EVENTS.on('system:restored', scheduleRefresh);
        EVENTS.on('system:reset', scheduleRefresh);
    }
    document.addEventListener('DOMContentLoaded', function(){
        Promise.resolve(window.__storageReadyPromise).catch(function(){}).then(scheduleRefresh);
        setInterval(function(){ try { renderCommitmentHeadsUp(); } catch (e) {} }, 60000);
    });
})();
