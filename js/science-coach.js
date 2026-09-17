// ==================== SCIENCE COACH (V30) ====================
// Turns evidence into a retrieval -> feedback -> spacing workflow. Readiness
// inputs are optional self-reports used to adapt a study plan; they are not a
// medical assessment or a validated biological score.

var scienceEvidenceFilter = 'all';
var scienceCycleHistoryLimit = 6;

function scienceNumber(value, min, max) {
    var n = parseInt(value, 10);
    return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function scienceLocalDateAfter(days) {
    var date = new Date();
    date.setDate(date.getDate() + Math.max(1, parseInt(days, 10) || 1));
    return fmtDate(date);
}

function scienceSuggestedReviewDays(outcome) {
    var map = { 0:1, 1:2, 2:3, 3:7 };
    return map[parseInt(outcome, 10)] || 3;
}

function scienceReadinessFromControls() {
    function value(id) {
        var el = document.getElementById(id);
        return scienceNumber(el && el.value, 1, 5);
    }
    return {
        sleep: value('scienceSleep'),
        energy: value('scienceEnergy'),
        stress: value('scienceStress'),
        focus: value('scienceFocus')
    };
}

function scienceReadinessRecommendation(readiness) {
    readiness = readiness || {};
    var values = [readiness.sleep, readiness.energy, readiness.stress, readiness.focus];
    if (values.some(function(value){ return value === null || value === undefined; })) {
        return {
            tier:'unrated', label:'Complete the four ratings', minutes:null,
            method:'',
            message:'These ratings adapt the recommendation only. They are not a health or neuroscience score.'
        };
    }
    var score = (readiness.sleep + readiness.energy + readiness.focus + (6 - readiness.stress)) / 4;
    var result;
    if (score <= 2.25) {
        result = {
            tier:'light', label:'Light learning load', minutes:25, method:'retrieval',
            message:'Prefer a short retrieval or familiar worked example. Reduce scope, correct one gap, and protect recovery.'
        };
    } else if (score <= 3.5) {
        result = {
            tier:'standard', label:'Standard learning load', minutes:45, method:'retrieval',
            message:'Use one complete learning cycle: attempt, study, closed-book retrieval, feedback, and a later check.'
        };
    } else {
        result = {
            tier:'deep', label:'Higher-load option', minutes:60, method:'retrieval',
            message:'A longer problem-solving or transfer block is reasonable if recall quality remains high. Take a genuine break afterward.'
        };
    }
    if (readiness.stress >= 4) {
        result.message += ' If you feel overactivated, comfortable slow breathing with a longer exhale is an optional settling tool—not a learning booster.';
    }
    if (readiness.sleep <= 2) {
        result.message += ' Low sleep quality is context to scale the task; it does not mean learning is impossible.';
    }
    result.index = Math.round(score * 10) / 10;
    return result;
}

function sciencePrefillEnergy() {
    var control = document.getElementById('scienceEnergy');
    if (!control || control.value) return;
    var tracker = get(K.energyTracker) || {};
    var protocol = get(K.protocol) || {};
    var tracked = scienceNumber(tracker[today()] && tracker[today()].level, 1, 5);
    var morning = scienceNumber(protocol[today()] && protocol[today()].energy, 1, 10);
    if (tracked) control.value = String(tracked);
    else if (morning) control.value = String(Math.ceil(morning / 2));
}

function scienceUpdateRecommendation() {
    var readiness = scienceReadinessFromControls();
    var recommendation = scienceReadinessRecommendation(readiness);
    var host = document.getElementById('scienceReadinessRecommendation');
    if (!host) return recommendation;
    var grade = recommendation.tier === 'deep' ? 'strong' : recommendation.tier === 'standard' ? 'moderate' : recommendation.tier === 'light' ? 'contextual' : 'unrated';
    host.className = 'science-recommendation ' + recommendation.tier;
    host.innerHTML = '<div><span class="science-grade ' + grade + '">' + esc(recommendation.label) + '</span>' +
        (recommendation.minutes ? '<strong>' + recommendation.minutes + '-minute starting point</strong>' : '') + '</div>' +
        '<p>' + esc(recommendation.message) + '</p>' +
        (recommendation.minutes ? '<button class="btn btn-secondary btn-sm" onclick="scienceApplyRecommendation(' + recommendation.minutes + ',\'' + recommendation.method + '\')">Use this plan</button>' : '');
    return recommendation;
}

function scienceApplyRecommendation(minutes, method) {
    var duration = document.getElementById('scienceDuration');
    var methodEl = document.getElementById('scienceMethod');
    if (duration) duration.value = String(minutes);
    if (methodEl && method) methodEl.value = method;
    scienceUpdateCustomDuration();
    toast('Session plan updated');
}

function scienceUpdateCustomDuration() {
    var duration = document.getElementById('scienceDuration');
    var custom = document.getElementById('scienceCustomDurationWrap');
    if (custom) custom.style.display = duration && duration.value === 'custom' ? '' : 'none';
}

function scienceSessionMinutes() {
    var preset = document.getElementById('scienceDuration');
    if (!preset) return 25;
    if (preset.value !== 'custom') return Math.max(10, Math.min(120, parseInt(preset.value, 10) || 25));
    var custom = document.getElementById('scienceCustomDuration');
    return Math.max(10, Math.min(120, parseInt(custom && custom.value, 10) || 25));
}

function scienceScrollToCycle() {
    var form = document.getElementById('scienceCycleCard');
    if (form && form.scrollIntoView) form.scrollIntoView({ behavior:'smooth', block:'start' });
}

function scienceStartFocus() {
    var topicEl = document.getElementById('scienceTopic');
    var topic = String(topicEl && topicEl.value || '').trim();
    if (!topic) { toast('Name the topic or skill first'); if (topicEl) topicEl.focus(); return; }
    var domainEl = document.getElementById('scienceDomain');
    var methodEl = document.getElementById('scienceMethod');
    window.__scienceCycleFocusContext = {
        topic: topic,
        learningDomain: normalizeLearningDomain(domainEl && domainEl.value) || 'technical',
        method: String(methodEl && methodEl.value || 'retrieval'),
        launchedAt: new Date().toISOString()
    };
    startFocusMode(topic, scienceSessionMinutes());
}

function scienceCreateRetrievalTask(record) {
    var taskId = uid();
    var task = normalizeTaskRecord({
        id: taskId,
        title: 'Retrieval check: ' + record.topic,
        due: record.nextReviewDate,
        priority: 'med',
        category: 'study',
        duration: '15',
        completed: false,
        description: 'Closed-book retrieval before review. Prior gap: ' + (record.gapType || 'not classified') + '. Correction: ' + (record.correction || 'recheck the source after attempting.'),
        source: 'science-cycle',
        sourceId: record.id
    });
    var tasks = arr(K.tasks);
    tasks.push(task);
    set(K.tasks, tasks);
    return taskId;
}

function scienceSaveCycle() {
    var topicEl = document.getElementById('scienceTopic');
    var topic = String(topicEl && topicEl.value || '').trim();
    if (!topic) { toast('Name the topic or skill'); if (topicEl) topicEl.focus(); return; }

    var outcomeEl = document.getElementById('scienceOutcome');
    var outcome = scienceNumber(outcomeEl && outcomeEl.value, 0, 3);
    if (outcome === null) { toast('Record the closed-book retrieval result'); if (outcomeEl) outcomeEl.focus(); return; }

    var gapEl = document.getElementById('scienceGap');
    var correctionEl = document.getElementById('scienceCorrection');
    var gap = String(gapEl && gapEl.value || 'none');
    var correction = String(correctionEl && correctionEl.value || '').trim();
    if (gap !== 'none' && !correction) { toast('Write the correction or next strategy'); if (correctionEl) correctionEl.focus(); return; }

    var reviewEl = document.getElementById('scienceReviewDays');
    var reviewDays = reviewEl && reviewEl.value ? parseInt(reviewEl.value, 10) : scienceSuggestedReviewDays(outcome);
    reviewDays = Math.max(1, Math.min(90, reviewDays || 3));
    var domainEl = document.getElementById('scienceDomain');
    var experienceEl = document.getElementById('scienceExperience');
    var methodEl = document.getElementById('scienceMethod');
    var pretestEl = document.getElementById('sciencePretest');
    var resumeEl = document.getElementById('scienceResumeNote');
    var confidenceBeforeEl = document.getElementById('scienceConfidenceBefore');
    var confidenceAfterEl = document.getElementById('scienceConfidenceAfter');
    var restEl = document.getElementById('scienceQuietRest');
    var createTaskEl = document.getElementById('scienceCreateTask');
    var activeFocusContext = window.__scienceCycleFocusContext || window.__lastScienceCycleFocusContext;

    var record = {
        id: uid(), schemaVersion: 1, date: today(), at: new Date().toISOString(),
        topic: topic,
        learningDomain: normalizeLearningDomain(domainEl && domainEl.value) || 'technical',
        experience: String(experienceEl && experienceEl.value || 'developing'),
        method: String(methodEl && methodEl.value || 'retrieval'),
        plannedMinutes: scienceSessionMinutes(),
        readiness: scienceReadinessFromControls(),
        pretest: String(pretestEl && pretestEl.value || '').trim(),
        confidenceBefore: scienceNumber(confidenceBeforeEl && confidenceBeforeEl.value, 1, 5),
        retrievalOutcome: outcome,
        gapType: gap,
        correction: correction,
        resumeNote: String(resumeEl && resumeEl.value || '').trim(),
        confidenceAfter: scienceNumber(confidenceAfterEl && confidenceAfterEl.value, 1, 5),
        quietRest: !!(restEl && restEl.checked),
        reviewDays: reviewDays,
        nextReviewDate: scienceLocalDateAfter(reviewDays),
        focusLaunchedAt: activeFocusContext && activeFocusContext.topic === topic ? activeFocusContext.launchedAt : null,
        retrievalTaskId: null
    };

    if (createTaskEl && createTaskEl.checked) record.retrievalTaskId = scienceCreateRetrievalTask(record);
    var cycles = arr(K.learningCycles);
    cycles.push(record);
    set(K.learningCycles, cycles);
    window.__scienceCycleFocusContext = null;
    window.__lastScienceCycleFocusContext = null;
    scienceClearCycleForm(false);
    renderScienceCoach();
    toast(record.retrievalTaskId ? 'Cycle saved and retrieval task scheduled' : 'Learning cycle saved');
}

function scienceClearCycleForm(clearReadiness) {
    ['scienceTopic','sciencePretest','scienceCorrection','scienceResumeNote'].forEach(function(id){
        var el = document.getElementById(id); if (el) el.value = '';
    });
    ['scienceConfidenceBefore','scienceConfidenceAfter','scienceOutcome','scienceReviewDays'].forEach(function(id){
        var el = document.getElementById(id); if (el) el.value = '';
    });
    var gap = document.getElementById('scienceGap'); if (gap) gap.value = 'none';
    var task = document.getElementById('scienceCreateTask'); if (task) task.checked = true;
    var rest = document.getElementById('scienceQuietRest'); if (rest) rest.checked = false;
    if (clearReadiness) {
        ['scienceSleep','scienceEnergy','scienceStress','scienceFocus'].forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
    }
    scienceUpdateReviewSuggestion();
}

function scienceUpdateReviewSuggestion() {
    var outcome = scienceNumber(document.getElementById('scienceOutcome') && document.getElementById('scienceOutcome').value, 0, 3);
    var host = document.getElementById('scienceReviewSuggestion');
    if (!host) return;
    if (outcome === null) {
        host.textContent = 'Record retrieval first; the gap should respond to performance, not a fixed calendar rule.';
        return;
    }
    var days = scienceSuggestedReviewDays(outcome);
    host.innerHTML = 'Suggested starting gap: <strong>' + days + ' day' + (days === 1 ? '' : 's') + '</strong>. You can override it.';
    var select = document.getElementById('scienceReviewDays');
    if (select && !select.value) select.value = String(days);
}

function scienceRepeatCycle(id) {
    var record = arr(K.learningCycles).find(function(row){ return row.id === id; });
    if (!record) return;
    var map = {
        scienceTopic:record.topic,
        scienceDomain:record.learningDomain,
        scienceExperience:record.experience,
        scienceMethod:record.method,
        scienceDuration:String(record.plannedMinutes || 25)
    };
    Object.keys(map).forEach(function(key){ var el = document.getElementById(key); if (el) el.value = map[key] || ''; });
    scienceClearCycleForm(false);
    var topic = document.getElementById('scienceTopic'); if (topic) topic.value = record.topic || '';
    var correction = document.getElementById('scienceCorrection');
    if (correction) correction.placeholder = record.correction ? ('Prior correction: ' + record.correction) : 'What did the source, worked example, or feedback show?';
    scienceUpdateCustomDuration();
    scienceScrollToCycle();
    toast('Retrieval cycle prepared—attempt before reviewing the old correction');
}

function scienceOutcomeLabel(value) {
    return ['Blank / wrong','Partial','Correct with cue','Independent'][parseInt(value, 10)] || 'Unrated';
}

function scienceRenderHistory() {
    var host = document.getElementById('scienceCycleHistory');
    if (!host) return;
    var cycles = arr(K.learningCycles).slice().sort(function(a,b){ return String(b.at || '').localeCompare(String(a.at || '')); });
    if (!cycles.length) {
        host.innerHTML = '<div class="empty">No learning cycles yet. Use the form to turn a study block into observable evidence.</div>';
        return;
    }
    host.innerHTML = cycles.slice(0, scienceCycleHistoryLimit).map(function(row){
        var due = row.nextReviewDate && row.nextReviewDate <= today();
        return '<article class="science-cycle-row">' +
            '<div><strong>' + esc(row.topic) + '</strong><small>' + esc(scienceOutcomeLabel(row.retrievalOutcome)) + ' · ' + esc(row.method || 'retrieval') + ' · ' + esc(row.date || '') + '</small></div>' +
            '<span class="science-review-date ' + (due ? 'due' : '') + '">' + (due ? 'Due ' : 'Next ') + esc(row.nextReviewDate || '—') + '</span>' +
            '<button class="btn btn-secondary btn-sm" onclick="scienceRepeatCycle(\'' + esc(row.id) + '\')">Repeat</button>' +
        '</article>';
    }).join('');
}

function scienceRenderSummary() {
    var host = document.getElementById('scienceSummary');
    if (!host) return;
    var cycles = arr(K.learningCycles);
    var due = cycles.filter(function(row){ return row.nextReviewDate && row.nextReviewDate <= today(); }).length;
    var independent = cycles.filter(function(row){ return Number(row.retrievalOutcome) === 3; }).length;
    var corrected = cycles.filter(function(row){ return row.gapType && row.gapType !== 'none' && row.correction; }).length;
    host.innerHTML = '<div class="summary-card"><span class="summary-label">Cycles logged</span><strong class="summary-value">' + cycles.length + '</strong><small>Attempt → feedback → retest</small></div>' +
        '<div class="summary-card"><span class="summary-label">Retrieval checks due</span><strong class="summary-value">' + due + '</strong><small>Performance-adjusted follow-ups</small></div>' +
        '<div class="summary-card"><span class="summary-label">Independent recall</span><strong class="summary-value">' + independent + '</strong><small>Descriptive—not a trait score</small></div>' +
        '<div class="summary-card"><span class="summary-label">Corrections captured</span><strong class="summary-value">' + corrected + '</strong><small>Specific gaps with feedback</small></div>';
}

function scienceSetEvidenceFilter(filter) {
    scienceEvidenceFilter = filter;
    scienceRenderEvidence();
}

function scienceRenderEvidence() {
    var registry = window.STUDYOS_SCIENCE;
    var filters = document.getElementById('scienceEvidenceFilters');
    var host = document.getElementById('scienceEvidenceList');
    if (!registry || !host) return;
    var order = ['all','strong','moderate','contextual','excluded'];
    if (filters) filters.innerHTML = order.map(function(grade){
        var label = grade === 'all' ? 'All' : registry.grades[grade].label;
        var count = grade === 'all' ? registry.claims.length : registry.claims.filter(function(row){ return row.grade === grade; }).length;
        return '<button class="filter-btn ' + (scienceEvidenceFilter === grade ? 'active' : '') + '" onclick="scienceSetEvidenceFilter(\'' + grade + '\')">' + esc(label) + ' ' + count + '</button>';
    }).join('');
    var claims = registry.claims.filter(function(row){ return scienceEvidenceFilter === 'all' || row.grade === scienceEvidenceFilter; });
    host.innerHTML = claims.map(function(row){
        var grade = registry.grades[row.grade];
        var links = (row.sources || []).map(function(source){
            return '<a href="' + esc(source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(source.label) + '<small>' + esc(source.kind || 'Source') + '</small></a>';
        }).join('');
        return '<details class="science-evidence-card ' + row.grade + '">' +
            '<summary><span><span class="science-grade ' + row.grade + '">' + esc(grade.label) + '</span><strong>' + esc(row.title) + '</strong></span><span class="science-evidence-use">' + esc(row.implemented) + '</span></summary>' +
            '<div class="science-evidence-body"><p>' + esc(row.plain) + '</p><dl><div><dt>Use it</dt><dd>' + esc(row.use) + '</dd></div><div><dt>Boundary</dt><dd>' + esc(row.boundary) + '</dd></div></dl>' +
            (links ? '<div class="science-source-links">' + links + '</div>' : '') + '</div>' +
        '</details>';
    }).join('');
}

function scienceRenderHubermanTrail() {
    var host = document.getElementById('scienceHubermanTopics');
    var registry = window.STUDYOS_SCIENCE;
    if (!host || !registry) return;
    host.innerHTML = registry.hubermanTopics.map(function(topic){
        return '<a href="' + esc(topic.url) + '" target="_blank" rel="noopener noreferrer">' + esc(topic.label) + '</a>';
    }).join('');
}

function renderScienceCoach() {
    sciencePrefillEnergy();
    scienceUpdateCustomDuration();
    scienceUpdateRecommendation();
    scienceUpdateReviewSuggestion();
    scienceRenderSummary();
    scienceRenderHistory();
    scienceRenderEvidence();
    scienceRenderHubermanTrail();
}

window.SCIENCE_COACH = {
    version:1,
    recommendation:scienceReadinessRecommendation,
    suggestedReviewDays:scienceSuggestedReviewDays,
    selfTest:function(){
        var low = scienceReadinessRecommendation({ sleep:1, energy:2, stress:5, focus:2 });
        var high = scienceReadinessRecommendation({ sleep:5, energy:5, stress:1, focus:5 });
        var registry = window.STUDYOS_SCIENCE;
        var grades = registry ? Object.keys(registry.grades) : [];
        var validClaims = !!registry && registry.claims.every(function(row){
            return row.id && grades.indexOf(row.grade) !== -1 && row.title && row.plain && row.use && row.boundary;
        });
        var safeUrls = !!registry && registry.claims.every(function(row){
            return (row.sources || []).every(function(source){ return /^https:\/\//.test(source.url || ''); });
        });
        return {
            pass:low.tier === 'light' && high.tier === 'deep' && scienceSuggestedReviewDays(0) === 1 && scienceSuggestedReviewDays(3) === 7 && validClaims && safeUrls,
            checks:{ lowLoad:low.tier === 'light', highLoad:high.tier === 'deep', adaptiveGap:scienceSuggestedReviewDays(0) === 1 && scienceSuggestedReviewDays(3) === 7, claimShape:validClaims, secureSources:safeUrls }
        };
    }
};
window.renderScienceCoach = renderScienceCoach;
