// ==================== LEARN (V27 — textbook-grounded curriculum) ====================
var activeLearningPathway = null;

function learningPracticeEvidence(module) {
    if (!module || module.id.charAt(0) !== 'p' || typeof PRACTICE === 'undefined') return '';
    var evidence = PRACTICE.getModuleEvidence(module.id);
    if (!evidence.attempts) {
        return '<div class="pathway-practice-evidence"><span>No judgment evidence yet</span><button class="btn btn-secondary btn-sm" onclick="openPmpModulePractice(\'' + esc(module.id) + '\')">Practice mapped case</button></div>';
    }
    var calibration = evidence.calibration && evidence.calibration.score !== null ? evidence.calibration.score + '% calibrated' : 'calibration collecting';
    return '<div class="pathway-practice-evidence"><span class="is-signal">' + evidence.attempts + ' scenario' + (evidence.attempts === 1 ? '' : 's') + '</span><span>' + evidence.accuracy + '% accurate</span><span>' + calibration + '</span><button class="btn btn-secondary btn-sm" onclick="openPmpModulePractice(\'' + esc(module.id) + '\')">Practice again</button></div>';
}

function openPmpModulePractice(moduleId) {
    if (typeof PRACTICE === 'undefined') { toast('Practice engine unavailable'); return; }
    var scenario = PRACTICE.getScenarios().find(function(item){ return item.moduleId === moduleId; });
    go('pmptools');
    // V56 (audit R10): pmp-tools.js is lazy-loaded — mutate its module
    // state only after the module exists (see js/module-loader.js note).
    var run = function(){
        pmpToolView = 'scenario';
        renderPmpTools();
        if (scenario) practiceQueueScenario(scenario.skill);
    };
    setTimeout(function(){
        if (typeof studyosEnsureModule === 'function') studyosEnsureModule('pmptools', function(ok){ if (ok) run(); });
        else run();
    }, 0);
}

function learningSourceById(id) {
    var sources = Array.isArray(window.DOCTRINE_SOURCES) ? window.DOCTRINE_SOURCES : [];
    return sources.find(function(source) { return source.id === id; }) || null;
}

function learningSourceChips(sourceIds) {
    return (sourceIds || []).map(function(id) {
        var source = learningSourceById(id);
        return '<button class="source-chip" onclick="openCurriculumSource(\'' + esc(id) + '\')" title="Open source tracker">' + esc(source ? source.title : id) + '</button>';
    }).join('');
}

function openCurriculumSource(sourceId) {
    go('doctrine');
    if (typeof doctrineSetView === 'function') doctrineSetView('sources');
    setTimeout(function() {
        if (typeof doctrineOpenSource === 'function') doctrineOpenSource(sourceId);
    }, 0);
}

function renderFoundationSourceAtlas() {
    var host = document.getElementById('foundationSourceAtlas');
    if (!host) return;
    var atlas = Array.isArray(window.CURRICULUM_ATLAS) ? window.CURRICULUM_ATLAS : (typeof CURRICULUM_ATLAS !== 'undefined' ? CURRICULUM_ATLAS : []);
    host.innerHTML = '<div class="source-atlas-grid">' + atlas.map(function(item) {
        var source = learningSourceById(item.id);
        var progress = (typeof doctrineGetSourceProgress === 'function') ? doctrineGetSourceProgress(item.id) : { completedUnits: 0, totalUnits: source ? source.totalUnits : 0 };
        var pct = progress.totalUnits ? Math.min(100, Math.round((progress.completedUnits / progress.totalUnits) * 100)) : 0;
        return '<article class="source-atlas-item" style="--source-accent:' + item.accent + ';">' +
            '<div class="source-atlas-top"><span class="source-rung">' + esc(item.rung) + '</span><span class="source-lane">' + esc(item.lane) + '</span></div>' +
            '<h4>' + esc(item.title) + '</h4>' +
            '<div class="source-role">' + esc(item.role) + '</div>' +
            '<p>' + esc(item.coverage) + '</p>' +
            '<div class="source-practice"><strong>Practice:</strong> ' + esc(item.practice) + '</div>' +
            '<div class="source-atlas-progress"><div class="progress"><div class="progress-fill" style="width:' + pct + '%"></div></div><span>' + progress.completedUnits + '/' + progress.totalUnits + '</span></div>' +
            '<button class="btn btn-secondary btn-sm" onclick="openCurriculumSource(\'' + esc(item.id) + '\')">Open source tracker →</button>' +
        '</article>';
    }).join('') + '</div>';
}

function renderLearn() {
    var progress = get(K.learnProgress) || {};
    var sessions = arr(K.time).filter(function(entry) { return entry.date === today() && entry.category === 'study'; });
    var totalToday = sessions.reduce(function(sum, entry) { return sum + (parseFloat(entry.duration) || 0); }, 0);
    var pathwayEntries = Object.entries(PATHWAYS);
    var totalHours = 0;
    var doneHours = 0;
    var totalModules = 0;
    var completedModules = 0;

    pathwayEntries.forEach(function(entry) {
        entry[1].modules.forEach(function(module) {
            var done = Math.min(Number(progress[module.id] || 0), module.hours);
            totalHours += module.hours;
            doneHours += done;
            totalModules++;
            if (done >= module.hours) completedModules++;
        });
    });

    var overallPct = totalHours ? Math.round((doneHours / totalHours) * 100) : 0;
    var dueCards = arr(K.flashcards).filter(function(card) { return !card.nextReview || card.nextReview <= today(); }).length;
    var next = null;
    pathwayEntries.some(function(entry) {
        return entry[1].modules.some(function(module) {
            if (Number(progress[module.id] || 0) < module.hours) {
                next = { pathwayId: entry[0], pathway: entry[1], module: module, done: Number(progress[module.id] || 0) };
                return true;
            }
            return false;
        });
    });

    var summary = document.getElementById('todayLearning');
    if (summary) {
        summary.innerHTML = '<div class="learning-summary">' +
            '<div class="learning-summary-metrics">' +
                '<div><span>Overall map</span><strong>' + overallPct + '%</strong><small>' + Math.round(doneHours) + '/' + totalHours + ' hours</small></div>' +
                '<div><span>Capabilities</span><strong>' + completedModules + '/' + totalModules + '</strong><small>modules evidenced</small></div>' +
                '<div><span>Today</span><strong>' + totalToday.toFixed(1) + 'h</strong><small>' + sessions.length + ' session' + (sessions.length === 1 ? '' : 's') + '</small></div>' +
                '<div><span>Retrieval due</span><strong>' + dueCards + '</strong><small>flashcards</small></div>' +
            '</div>' +
            (next ? '<div class="learning-next">' +
                '<div class="learning-next-copy"><span class="badge badge-blue">NEXT · ' + esc(next.module.stage || 'Module') + '</span><h3>' + esc(next.module.name) + '</h3><p>' + esc(next.pathway.name) + ' · ' + next.done + '/' + next.module.hours + ' hours</p></div>' +
                '<div class="learning-next-actions"><button class="btn btn-secondary" onclick="showPathway(\'' + next.pathwayId + '\')">Open module</button><button class="btn btn-primary" onclick="openLogTimeModal(\'' + next.module.id + '\',' + next.module.hours + ',\'' + esc(next.module.name).replace(/'/g, "\\'") + '\')">Log study</button></div>' +
            '</div>' : '<div class="learning-next complete"><div><span class="badge badge-good">MAP COMPLETE</span><h3>Every pathway module is complete.</h3><p>Choose a weak outcome and begin a new evidence cycle.</p></div></div>') +
        '</div>';
    }

    var filters = document.getElementById('learnFilters');
    if (filters) {
        filters.innerHTML = pathwayEntries.map(function(entry) {
            var path = entry[1];
            return '<button class="filter-btn ' + (activeLearningPathway === entry[0] ? 'active' : '') + '" data-pathway="' + entry[0] + '" onclick="showPathway(\'' + entry[0] + '\')">' + (path.icon || '📘') + ' ' + esc(path.shortName || path.name) + '</button>';
        }).join('');
    }

    var pathwayHost = document.getElementById('learnPathways');
    if (pathwayHost) {
        pathwayHost.innerHTML = '<div class="pathway-overview-grid">' + pathwayEntries.map(function(entry) {
            var id = entry[0];
            var path = entry[1];
            var pathHours = path.modules.reduce(function(sum, module) { return sum + module.hours; }, 0);
            var pathDone = path.modules.reduce(function(sum, module) { return sum + Math.min(Number(progress[module.id] || 0), module.hours); }, 0);
            var pct = pathHours ? Math.round((pathDone / pathHours) * 100) : 0;
            var modulesDone = path.modules.filter(function(module) { return Number(progress[module.id] || 0) >= module.hours; }).length;
            var sources = new Set();
            path.modules.forEach(function(module) { (module.sourceIds || []).forEach(function(sourceId) { sources.add(sourceId); }); });
            return '<button class="pathway-overview-card" onclick="showPathway(\'' + id + '\')">' +
                '<span class="pathway-overview-icon">' + (path.icon || '📘') + '</span>' +
                '<span class="pathway-overview-copy"><span class="pathway-overview-title">' + esc(path.name) + '</span><span class="pathway-overview-desc">' + esc(path.desc) + '</span></span>' +
                '<span class="pathway-overview-score">' + pct + '%</span>' +
                '<span class="pathway-overview-progress"><span class="progress"><span class="progress-fill" style="width:' + pct + '%"></span></span><small>' + modulesDone + '/' + path.modules.length + ' modules · ' + sources.size + ' sources · ' + pathHours + 'h</small></span>' +
                '<span class="pathway-overview-arrow">→</span>' +
            '</button>';
        }).join('') + '</div>';
    }

    renderFoundationSourceAtlas();
    renderPMPProcesses();
    showTip('learn', 'learnTip');
}

function showAllPathways() {
    activeLearningPathway = null;
    renderLearn();
}

function showPathway(id) {
    var pathway = PATHWAYS[id];
    if (!pathway) return;
    activeLearningPathway = id;
    var progress = get(K.learnProgress) || {};
    var cards = arr(K.flashcards);
    var unreviewed = cards.filter(function(card) { return card.category === id && (!card.reviews || card.reviews === 0); }).length;
    var firstIncomplete = pathway.modules.findIndex(function(module) { return Number(progress[module.id] || 0) < module.hours; });

    document.querySelectorAll('#learnFilters .filter-btn').forEach(function(button) {
        button.classList.toggle('active', button.getAttribute('data-pathway') === id);
    });

    document.getElementById('learnPathways').innerHTML =
        '<div class="pathway-detail-head"><div><button class="btn btn-secondary btn-sm" onclick="showAllPathways()">← All pathways</button><div class="kicker">' + esc(pathway.desc) + '</div><h3>' + (pathway.icon || '📘') + ' ' + esc(pathway.name) + '</h3></div>' +
        (unreviewed > 0 ? '<button class="btn btn-secondary" onclick="startPreTest(\'' + id + '\')">🧪 Pre-test ' + unreviewed + ' cards</button>' : '') + '</div>' +
        '<div class="learning-module-list">' + pathway.modules.map(function(module, index) {
            var done = Number(progress[module.id] || 0);
            var pct = module.hours ? Math.min(100, Math.round((done / module.hours) * 100)) : 0;
            var complete = done >= module.hours;
            var current = !complete && (firstIncomplete === -1 || index === firstIncomplete);
            var status = complete ? 'complete' : (current ? 'current' : 'upcoming');
            return '<article class="learning-module ' + status + '">' +
                '<div class="learning-module-marker"><span>' + (complete ? '✓' : String(index + 1).padStart(2, '0')) + '</span><i></i></div>' +
                '<div class="learning-module-body">' +
                    '<div class="learning-module-head"><div><span class="badge ' + (complete ? 'badge-good' : (current ? 'badge-blue' : '')) + '">' + esc(module.stage || ('Module ' + (index + 1))) + '</span><h4>' + esc(module.name) + '</h4></div><strong>' + pct + '%</strong></div>' +
                    '<div class="topic-chip-row">' + module.topics.map(function(topic) { return '<span>' + esc(topic) + '</span>'; }).join('') + '</div>' +
                    '<div class="source-chip-row">' + learningSourceChips(module.sourceIds) + '</div>' +
                    '<div class="learning-module-progress"><div class="progress"><div class="progress-fill" style="width:' + pct + '%;' + (complete ? 'background:var(--success);' : '') + '"></div></div><span>' + done + '/' + module.hours + 'h</span></div>' +
                    learningPracticeEvidence(module) +
                    '<details class="module-method"><summary>Practice method & evidence</summary><div><p><strong>Practice:</strong> ' + esc(module.practice || 'Use retrieval, feedback, and spaced re-practice.') + '</p><p><strong>Evidence:</strong> ' + esc(module.evidence || 'Demonstrate the capability in an applied task.') + '</p></div></details>' +
                    '<div class="learning-module-actions"><button class="btn btn-sm ' + (complete ? 'btn-secondary' : 'btn-primary') + '" onclick="openLogTimeModal(\'' + module.id + '\',' + module.hours + ',\'' + esc(module.name).replace(/'/g, "\\'") + '\')">' + (complete ? 'Add practice' : 'Log study') + '</button></div>' +
                '</div>' +
            '</article>';
        }).join('') + '</div>';
}

function openLogTimeModal(moduleId, maxHours, moduleName) {
    var titleEl = document.getElementById('doctrineModalTitle');
    var bodyEl = document.getElementById('doctrineModalBody');
    var primaryBtn = document.getElementById('doctrineModalPrimary');
    var secondaryBtn = document.getElementById('doctrineModalSecondary');
    if (!titleEl || !bodyEl) { logLearning(moduleId, maxHours); return; }

    titleEl.textContent = 'Log Study Time';
    bodyEl.innerHTML =
        '<div style="margin-bottom:14px;"><div style="font-weight:600;margin-bottom:4px;">' + esc(moduleName || moduleId) + '</div>' +
        '<div style="font-size:0.85rem;color:var(--text-muted);">Current: ' + ((get(K.learnProgress)||{})[moduleId]||0) + '/' + maxHours + ' hrs</div></div>' +
        '<div style="margin-bottom:14px;"><div class="kicker" style="margin-bottom:6px;">Hours studied</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        ['0.25','0.5','1','1.5','2','3'].map(function(h) {
            return '<button class="btn btn-secondary btn-sm" onclick="document.getElementById(\'logTimeHours\').value=\'' + h + '\'" style="min-width:48px;">' + h + 'h</button>';
        }).join('') +
        '</div>' +
        '<input type="number" class="form-input" id="logTimeHours" value="1" min="0.25" max="8" step="0.25" style="margin-top:8px;" aria-label="Hours"></div>' +
        '<div><div class="kicker" style="margin-bottom:6px;">What did you work on? (optional)</div>' +
        '<input type="text" class="form-input" id="logTimeNote" placeholder="e.g., EVM practice problems, Chapter 5 review" aria-label="Session note"></div>';

    primaryBtn.textContent = 'Log Time';
    primaryBtn.onclick = function() {
        var hours = parseFloat(document.getElementById('logTimeHours').value);
        if (!hours || hours <= 0) { toast('Enter valid hours'); return; }
        logLearning(moduleId, maxHours, hours, (document.getElementById('logTimeNote')||{}).value);
        closeModal('doctrineModal');
    };
    secondaryBtn.textContent = 'Cancel';
    secondaryBtn.onclick = function() { closeModal('doctrineModal'); };
    openModal('doctrineModal');
}

function learningAxisForModule(moduleId, pathwayId) {
    var explicit = {
        f9:'leadership',
        p1:'leadership', p2:'leadership', p3:'leadership',
        p8:'strategic', p9:'strategic', p10:'strategic',
        m6:'strategic', m8:'leadership',
        s1:'strategic', s5:'strategic'
    };
    if (explicit[moduleId]) return explicit[moduleId];
    if (pathwayId === 'pmp' && /^p[4-7]$/.test(moduleId)) return 'technical';
    return 'technical';
}

function logLearning(moduleId, maxHours, hoursVal, note) {
    var hours = hoursVal || parseFloat(prompt('Hours studied:', '1'));
    if (!hours || isNaN(hours)) return;

    var progress = get(K.learnProgress) || {};
    progress[moduleId] = Math.min((progress[moduleId] || 0) + hours, maxHours);
    set(K.learnProgress, progress);

    var entries = arr(K.time);
    var pathwayEntry = Object.entries(PATHWAYS).find(function(entry) {
        return entry[1].modules.some(function(module) { return module.id === moduleId; });
    });
    var modInfo = pathwayEntry ? pathwayEntry[1].modules.find(function(module) { return module.id === moduleId; }) : null;
    var domainByPathway = { foundations: 'construction', pmp: 'pmp', mcmaster: 'math', smr: 'smr' };
    var pathwayId = pathwayEntry ? pathwayEntry[0] : '';
    entries.push({
        id: uid(),
        title: (note && note.trim()) ? note.trim() : (modInfo ? modInfo.name : 'Study session'),
        duration: hours,
        date: today(),
        category: 'study',
        domain: pathwayEntry ? (domainByPathway[pathwayId] || 'management') : 'management',
        learningDomain: learningAxisForModule(moduleId, pathwayId),
        pathway: pathwayId,
        moduleId: moduleId
    });
    set(K.time, entries);

    toast('Logged ' + hours + 'h!');
    var returnPathway = activeLearningPathway;
    renderLearn();
    if (returnPathway && PATHWAYS[returnPathway]) showPathway(returnPathway);
    refreshDashboard();
}

// V56: dead stub renderTodayLearning() removed (audit R3).

function renderPMPProcesses() {
    var pmpProgress = get(K.pmpProgress) || {};
    var totalProcesses = PMP_KNOWLEDGE_AREAS.reduce(function(s, ka) { return s + ka.processes.length; }, 0);
    var completedProcesses = Object.values(pmpProgress).filter(function(v) { return v; }).length;

    var pctEl = document.getElementById('pmpProcessPct');
    var countEl = document.getElementById('pmpProcessCount');
    var gridEl = document.getElementById('pmpProcessGrid');

    if (pctEl) pctEl.textContent = Math.round((completedProcesses / totalProcesses) * 100) + '%';
    if (countEl) countEl.textContent = completedProcesses + '/' + totalProcesses + ' mastered';

    if (gridEl) {
        gridEl.innerHTML = PMP_KNOWLEDGE_AREAS.map(function(ka) {
            var kaDone = ka.processes.filter(function(p) { return pmpProgress[p.num]; }).length;
            var kaPct = Math.round((kaDone / ka.processes.length) * 100);
            return '<div class="pmp-area"><div class="pmp-area-header"><span class="pmp-area-name" style="color:' + ka.color + ';">' + ka.name + '</span><span class="pmp-area-pct" style="color:' + ka.color + ';">' + kaPct + '%</span></div>' +
                '<div class="pmp-processes">' + ka.processes.map(function(p) {
                    return '<div class="pmp-process ' + (pmpProgress[p.num] ? 'done' : '') + '" onclick="togglePMPProcess(\'' + p.num + '\')" title="' + p.name + '" style="' + (pmpProgress[p.num] ? 'background:' + ka.color : '') + '">' + p.num.split('.')[1] + '</div>';
                }).join('') + '</div></div>';
        }).join('');
    }
}

function togglePMPProcess(processNum) {
    var pmpProgress = get(K.pmpProgress) || {};
    pmpProgress[processNum] = !pmpProgress[processNum];
    set(K.pmpProgress, pmpProgress);
    renderPMPProcesses();
    var processName = processNum;
    for (var i = 0; i < PMP_KNOWLEDGE_AREAS.length; i++) {
        var p = PMP_KNOWLEDGE_AREAS[i].processes.find(function(p) { return p.num === processNum; });
        if (p) { processName = p.name; break; }
    }
    toast(pmpProgress[processNum] ? '✓ ' + processName + ' mastered!' : processName + ' unmarked');
}
