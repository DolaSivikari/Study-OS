// ==================== V29 PRACTICE & JUDGMENT ENGINE ====================
// Scenario normalization, confidence calibration, error classification,
// weak-skill scheduling, Learning Path evidence, and correction promotion.

const PRACTICE = (function(){
  var DOMAIN_TARGETS = { 'People': 0.33, 'Process': 0.41, 'Business Environment': 0.26 };

  var TASKS = {
    'PPL-1': { eco:'People', label:'Develop a common vision', skill:'shared_vision', skillLabel:'Shared vision', moduleId:'p1' },
    'PPL-2': { eco:'People', label:'Manage conflicts', skill:'conflict_resolution', skillLabel:'Conflict resolution', moduleId:'p2' },
    'PPL-3': { eco:'People', label:'Lead the project team', skill:'team_leadership', skillLabel:'Team leadership', moduleId:'p1' },
    'PPL-4': { eco:'People', label:'Engage stakeholders', skill:'stakeholder_engagement', skillLabel:'Stakeholder engagement', moduleId:'p3' },
    'PPL-5': { eco:'People', label:'Align stakeholder expectations', skill:'expectations_alignment', skillLabel:'Expectation alignment', moduleId:'p3' },
    'PPL-6': { eco:'People', label:'Manage stakeholder expectations', skill:'customer_expectations', skillLabel:'Customer expectations', moduleId:'p3' },
    'PPL-7': { eco:'People', label:'Help ensure knowledge transfer', skill:'knowledge_transfer', skillLabel:'Knowledge transfer', moduleId:'p3' },
    'PPL-8': { eco:'People', label:'Plan and manage communication', skill:'communication_planning', skillLabel:'Communication planning', moduleId:'p3' },
    'PRC-1': { eco:'Process', label:'Develop an integrated plan and plan delivery', skill:'integrated_planning', skillLabel:'Integrated planning', moduleId:'p4' },
    'PRC-2': { eco:'Process', label:'Develop and manage scope', skill:'scope_definition', skillLabel:'Scope definition', moduleId:'p5' },
    'PRC-3': { eco:'Process', label:'Help ensure value-based delivery', skill:'value_delivery', skillLabel:'Value delivery', moduleId:'p4' },
    'PRC-4': { eco:'Process', label:'Plan and manage resources', skill:'resource_optimization', skillLabel:'Resource optimization', moduleId:'p5' },
    'PRC-5': { eco:'Process', label:'Plan and manage procurement', skill:'procurement_contracts', skillLabel:'Procurement & contracts', moduleId:'p6' },
    'PRC-6': { eco:'Process', label:'Plan and manage finance', skill:'project_finance', skillLabel:'Project finance & estimating', moduleId:'p5' },
    'PRC-7': { eco:'Process', label:'Plan and optimize quality', skill:'quality_management', skillLabel:'Quality management', moduleId:'p5' },
    'PRC-8': { eco:'Process', label:'Plan and manage schedule', skill:'schedule_management', skillLabel:'Schedule management', moduleId:'p5' },
    'PRC-9': { eco:'Process', label:'Evaluate project status', skill:'status_evaluation', skillLabel:'Status evaluation', moduleId:'p6' },
    'PRC-10': { eco:'Process', label:'Manage project closure', skill:'closure_transition', skillLabel:'Closure & transition', moduleId:'p4' },
    'BUS-1': { eco:'Business Environment', label:'Define and establish governance', skill:'governance', skillLabel:'Governance', moduleId:'p8' },
    'BUS-2': { eco:'Business Environment', label:'Plan and manage compliance', skill:'compliance', skillLabel:'Compliance', moduleId:'p8' },
    'BUS-3': { eco:'Business Environment', label:'Manage and control changes', skill:'change_control', skillLabel:'Change control', moduleId:'p6' },
    'BUS-4': { eco:'Business Environment', label:'Remove impediments and manage issues', skill:'issues_impediments', skillLabel:'Issues & impediments', moduleId:'p6' },
    'BUS-5': { eco:'Business Environment', label:'Plan and manage risk', skill:'risk_management', skillLabel:'Risk management', moduleId:'p6' },
    'BUS-6': { eco:'Business Environment', label:'Continuous improvement', skill:'continuous_improvement', skillLabel:'Continuous improvement', moduleId:'p8' },
    'BUS-7': { eco:'Business Environment', label:'Support organizational change', skill:'organizational_change', skillLabel:'Organizational change', moduleId:'p10' },
    'BUS-8': { eco:'Business Environment', label:'Evaluate external environment changes', skill:'external_environment', skillLabel:'External environment', moduleId:'p10' }
  };

  var ERROR_TYPES = {
    knowledge_gap: { label:'Knowledge gap', short:'Rule or concept missing', action:'Retrieve the governing rule, explain it in your own words, then answer a near-transfer case.' },
    sequence_error: { label:'Sequence error', short:'Right action, wrong order', action:'Write the decision sequence as assess → consult → authorize → act, then compare it with the case.' },
    context_misread: { label:'Context misread', short:'Ignored a key constraint', action:'Underline the delivery approach, authority, constraint, and outcome before choosing.' },
    governance_bypass: { label:'Governance bypass', short:'Acted without authority/control', action:'Identify the decision owner, threshold, notice, and approval evidence.' },
    stakeholder_misread: { label:'Stakeholder misread', short:'Escalated, blamed, or imposed too early', action:'Name the stakeholder interest and draft the first diagnostic question.' },
    calculation_error: { label:'Calculation / data error', short:'Misread or misused evidence', action:'Recalculate from units and definitions, then perform a reasonableness check.' },
    overthinking: { label:'Overthinking / false precision', short:'Delayed or overstated certainty', action:'State the minimum sufficient evidence, the reversible next step, and the decision deadline.' },
    careless: { label:'Careless execution', short:'Knew it but missed a cue', action:'Name the missed cue and add a five-second pre-submit check.' }
  };

  // A four-choice item has a 25% chance floor. The top level is capped below
  // 100% so the forecast remains honest about residual uncertainty. Explicit
  // probabilities make the Brier-style score interpretable instead of
  // pretending that an ordinal 1–5 label is already a probability.
  var CONFIDENCE_LEVELS = [
    { level:1, probability:0.25, label:'guess' },
    { level:2, probability:0.45, label:'lean' },
    { level:3, probability:0.65, label:'likely' },
    { level:4, probability:0.80, label:'strong' },
    { level:5, probability:0.95, label:'near certain' }
  ];

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
  function hashText(text){
    var h = 2166136261;
    var value = String(text || 'scenario');
    for (var i=0;i<value.length;i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  function addDays(dateString, days){
    var d = new Date((dateString || today()) + 'T12:00:00');
    d.setDate(d.getDate() + Number(days || 0));
    return fmtDate(d);
  }
  function textOf(s){ return [s.q, s.mindset, s.explain, s.weak].filter(Boolean).join(' ').toLowerCase(); }

  function inferTask(raw){
    if (raw.task && TASKS[raw.task]) return raw.task;
    var text = textOf(raw);
    var eco = raw.eco || '';

    if (/external|market|tariff|economic downturn|regulation changes|business needs/.test(text)) return 'BUS-8';
    if (/organizational change|adoption|rollout|resistance to the new|field-quality app/.test(text)) return 'BUS-7';
    if (/lesson|continuous improvement|recurr|root cause|repeat/.test(text)) return 'BUS-6';
    if (/risk register|risk response|catastrophic|cyber|threat/.test(text)) return 'BUS-5';
    if (/impediment|issue|creditor|blocker/.test(text)) return 'BUS-4';
    if (/change request|change control|integrated change|superseded|verbal.*change/.test(text)) return 'BUS-3';
    if (/compliance|permit|code|inspector|safety|fall-protection|notice requirement/.test(text)) return 'BUS-2';
    if (/governance|authority matrix|escalation path|decision threshold/.test(text)) return 'BUS-1';

    if (eco === 'People') {
      if (/vision|shared purpose|definition of success/.test(text)) return 'PPL-1';
      if (/conflict|hostility|disagree/.test(text)) return 'PPL-2';
      if (/knowledge transfer|hand.?over|leav(e|ing)|turnover/.test(text)) return 'PPL-7';
      if (/communication plan|report|time zone|email|feedback loop/.test(text)) return 'PPL-8';
      if (/customer satisfaction|customer expectation|owner expectation/.test(text)) return 'PPL-6';
      if (/align.*expectation|acceptance criteria/.test(text)) return 'PPL-5';
      if (/stakeholder|owner|consultant|municipal/.test(text)) return 'PPL-4';
      return 'PPL-3';
    }

    if (/close|turnover|transition|physical.*complete/.test(text)) return 'PRC-10';
    if (/status|forecast|percent.complete|metric|cpi|spi/.test(text)) return 'PRC-9';
    if (/schedule|critical path|sequence|gantt|productivity/.test(text)) return 'PRC-8';
    if (/quality|nonconform|deficien|specification|rework|material/.test(text)) return 'PRC-7';
    if (/estimate|contingency|reserve|finance|cost|budget|evm/.test(text)) return 'PRC-6';
    if (/vendor|procure|supplier|contract type|bid/.test(text)) return 'PRC-5';
    if (/resource|crane|manpower|crew/.test(text)) return 'PRC-4';
    if (/value|benefit|incremental|occupancy/.test(text)) return 'PRC-3';
    if (/scope|requirement|drawing.*conflict/.test(text)) return 'PRC-2';
    return 'PRC-1';
  }

  function inferApproach(raw){
    if (raw.approach) return raw.approach;
    var text = textOf(raw);
    if (/hybrid/.test(text)) return 'hybrid';
    if (/agile|sprint|backlog|iteration|adaptive/.test(text)) return 'adaptive';
    if (/construction|contract|baseline|tender|predictive/.test(text)) return 'predictive';
    return 'mixed';
  }

  function inferSources(raw, task){
    var ids = Array.isArray(raw.sourceIds) ? raw.sourceIds.slice() : ['pmp-eco-2026'];
    var text = textOf(raw);
    if (/estimate|cost|contingency|bid|takeoff/.test(text)) ids.push('delpico-estimating');
    if (/contract|notice|claim|vendor|supplier|procure/.test(text)) ids.push('contract-admin');
    if (/material|concrete|wall|envelope|construction method/.test(text)) ids.push('kultermann-cmmt');
    if (/ethic|professional|critical thinking|judgment/.test(text)) ids.push('cebok3');
    if (task === 'PRC-6') ids.push('practice-std-estimating');
    return Array.from(new Set(ids.filter(Boolean)));
  }

  function normalizeScenario(raw, index){
    raw = raw || {};
    var task = inferTask(raw);
    var meta = TASKS[task] || TASKS['PRC-1'];
    var question = String(raw.q || 'Untitled scenario');
    var id = raw.id || ('legacy-' + hashText(question));
    var answer = Number(raw.answer);
    var choices = Array.isArray(raw.choices) ? raw.choices.slice() : [];
    return Object.assign({}, raw, {
      id: id,
      q: question,
      choices: choices,
      answer: Number.isInteger(answer) ? answer : 0,
      task: task,
      taskLabel: meta.label,
      eco: meta.eco,
      skill: raw.skill || meta.skill,
      skillLabel: raw.skillLabel || meta.skillLabel,
      moduleId: raw.moduleId || inferModule(raw, meta.moduleId),
      approach: inferApproach(raw),
      difficulty: clamp(parseInt(raw.difficulty || 3, 10) || 3, 1, 5),
      sourceIds: inferSources(raw, task),
      transferPrompt: raw.transferPrompt || 'State the governing rule, the first action, and the evidence that would change your answer.',
      index: index
    });
  }

  function inferModule(raw, fallback){
    var text = textOf(raw);
    if (/artificial intelligence|\bai\b|cyber|data classification|forecasting tool/.test(text)) return 'p9';
    if (/sustainab|carbon|organizational change|external|market|tariff/.test(text)) return 'p10';
    if (/agile|hybrid|tailor/.test(text)) return 'p7';
    return fallback;
  }

  function getScenarios(){
    var source = typeof PMP_SCENARIOS !== 'undefined' && Array.isArray(PMP_SCENARIOS) ? PMP_SCENARIOS : [];
    return source.map(normalizeScenario);
  }

  function getHistory(){
    var rows = arr(K.scenarioHistory);
    return Array.isArray(rows) ? rows : [];
  }

  function getQueue(){
    var rows = arr(K.practiceQueue);
    return Array.isArray(rows) ? rows : [];
  }

  function confidenceProbability(value){
    var n = clamp(parseInt(value, 10) || 3, 1, 5);
    return CONFIDENCE_LEVELS[n - 1].probability;
  }

  function attemptProbability(row){
    var stored = row && row.predictedProbability;
    var numeric = Number(stored);
    return stored !== null && stored !== undefined && Number.isFinite(numeric) && numeric >= 0 && numeric <= 1
      ? numeric
      : confidenceProbability(row && row.confidence);
  }

  function suggestErrorType(scenario, choice){
    if (!scenario || Number(choice) === Number(scenario.answer)) return '';
    var mapped = scenario.errorMap && scenario.errorMap[choice];
    if (mapped && ERROR_TYPES[mapped]) return mapped;
    var selected = String((scenario.choices || [])[choice] || '').toLowerCase();
    if (/calculat|cpi|spi|percent|average|increase|decrease|benchmark/.test(textOf(scenario) + ' ' + selected)) return 'calculation_error';
    if (/immediately|start|implement|proceed|accept|release|replace/.test(selected)) return 'sequence_error';
    if (/escalat|sponsor|legal|executive|report .*management/.test(selected)) return 'governance_bypass';
    if (/ignore|wait|continue|no action|same hours/.test(selected)) return 'context_misread';
    if (/remove|blame|refuse|discipline|call out/.test(selected)) return 'stakeholder_misread';
    if (/more data|until|delay|permanently|all/.test(selected)) return 'overthinking';
    return 'knowledge_gap';
  }

  function upsertQueue(scenario, attempt){
    var queue = getQueue();
    var id = 'skill:' + scenario.skill;
    var i = queue.findIndex(function(item){ return item.id === id; });
    var existing = i >= 0 ? queue[i] : null;
    var correct = !!attempt.correct;
    var uncertain = correct && Number(attempt.confidence || 3) <= 3;
    if (!existing && correct && !uncertain) return null;

    var streak = existing ? Number(existing.correctStreak || 0) : 0;
    var interval = existing ? Number(existing.intervalDays || 1) : 1;
    var dueDate = today();
    var priority = existing ? Number(existing.priority || 50) : 50;

    if (!correct) {
      streak = 0;
      interval = 1;
      dueDate = today();
      priority = clamp(76 + Number(attempt.confidence || 3) * 5, 0, 100);
    } else {
      streak += 1;
      var intervals = [1, 3, 7, 14, 30];
      interval = uncertain ? 2 : intervals[Math.min(streak, intervals.length - 1)];
      dueDate = addDays(today(), interval);
      priority = uncertain ? 62 : clamp(60 - streak * 10, 15, 60);
    }

    var item = Object.assign({}, existing || {}, {
      id: id,
      skillKey: scenario.skill,
      skillLabel: scenario.skillLabel,
      task: scenario.task,
      taskLabel: scenario.taskLabel,
      eco: scenario.eco,
      moduleId: scenario.moduleId,
      sourceIds: scenario.sourceIds,
      dueDate: dueDate,
      intervalDays: interval,
      priority: priority,
      correctStreak: streak,
      attempts: Number(existing && existing.attempts || 0) + 1,
      correct: Number(existing && existing.correct || 0) + (correct ? 1 : 0),
      lastScenarioId: scenario.id,
      lastAttemptId: attempt.id,
      lastErrorType: attempt.errorType || '',
      lastAt: attempt.at,
      status: streak >= 4 && !uncertain ? 'stable' : 'active'
    });
    if (i >= 0) queue[i] = item; else queue.push(item);
    queue.sort(function(a,b){
      return String(a.dueDate || '').localeCompare(String(b.dueDate || '')) || Number(b.priority || 0) - Number(a.priority || 0);
    });
    set(K.practiceQueue, queue);
    return item;
  }

  function recordAttempt(scenarioInput, selectedIndex, confidence, responseTimeMs){
    var scenario = scenarioInput && scenarioInput.taskLabel ? scenarioInput : normalizeScenario(scenarioInput, -1);
    var selected = Number(selectedIndex);
    var correct = selected === Number(scenario.answer);
    var errorType = correct ? '' : suggestErrorType(scenario, selected);
    var attempt = {
      id: uid(),
      schemaVersion: 2,
      scenarioId: scenario.id,
      question: scenario.q,
      selectedIndex: selected,
      answerIndex: Number(scenario.answer),
      correct: correct,
      confidence: clamp(parseInt(confidence, 10) || 3, 1, 5),
      predictedProbability: confidenceProbability(confidence),
      responseTimeMs: Math.max(0, Number(responseTimeMs || 0)),
      eco: scenario.eco,
      task: scenario.task,
      taskLabel: scenario.taskLabel,
      skillKey: scenario.skill,
      skillLabel: scenario.skillLabel,
      moduleId: scenario.moduleId,
      approach: scenario.approach,
      difficulty: scenario.difficulty,
      sourceIds: scenario.sourceIds,
      principle: scenario.principle || '',
      process: scenario.process || '',
      errorType: errorType,
      errorSuggested: errorType,
      transferNote: '',
      date: today(),
      at: new Date().toISOString()
    };
    var history = getHistory();
    history.push(attempt);
    if (history.length > 500) history.splice(0, history.length - 500);
    set(K.scenarioHistory, history);
    upsertQueue(scenario, attempt);
    if (typeof EVENTS !== 'undefined') EVENTS.emit('practice:attempted', { attempt: attempt, scenario: scenario });
    return attempt;
  }

  function updateAttempt(attemptId, changes){
    var history = getHistory();
    var index = history.findIndex(function(row){ return row.id === attemptId; });
    if (index < 0) return null;
    history[index] = Object.assign({}, history[index], changes || {}, { updatedAt:new Date().toISOString() });
    set(K.scenarioHistory, history);
    var queue = getQueue();
    queue.forEach(function(item){
      if (item.lastAttemptId === attemptId && changes && changes.errorType !== undefined) item.lastErrorType = changes.errorType;
    });
    set(K.practiceQueue, queue);
    return history[index];
  }

  function getAttempt(attemptId){ return getHistory().find(function(row){ return row.id === attemptId; }) || null; }

  function promoteAttemptToFlashcard(attemptId){
    var attempt = getAttempt(attemptId);
    if (!attempt) return { created:false, reason:'Attempt not found' };
    var scenario = getScenarios().find(function(item){ return item.id === attempt.scenarioId; });
    if (!scenario) return { created:false, reason:'Scenario not found' };
    var cards = arr(K.flashcards);
    var existing = cards.find(function(card){ return card.sourceScenarioId === scenario.id; });
    if (existing) {
      updateAttempt(attemptId, { promotedCardId:existing.id });
      return { created:false, card:existing, reason:'Already in Flashcards' };
    }
    var card = {
      id: uid(),
      question: 'PMP judgment — ' + scenario.skillLabel + ': What rule should govern this situation?\n' + scenario.q,
      answer: (scenario.mindset ? scenario.mindset + '\n\n' : '') + scenario.explain,
      category: 'pmp',
      tags: ['pmp-2026','judgment',scenario.eco.toLowerCase().replace(/\s+/g,'-'),scenario.skill],
      sourceScenarioId: scenario.id,
      sourceIds: scenario.sourceIds,
      createdAt: new Date().toISOString(),
      reviews: 0,
      nextReview: today(),
      interval: 0,
      easeFactor: 2.5
    };
    cards.push(card);
    set(K.flashcards, cards);
    updateAttempt(attemptId, { promotedCardId:card.id });
    if (typeof EVENTS !== 'undefined') EVENTS.emit('practice:promoted', { attempt:attempt, card:card });
    return { created:true, card:card };
  }

  function getCalibration(historyInput){
    var rated = (historyInput || getHistory()).filter(function(row){ return Number(row.confidence) >= 1 && Number(row.confidence) <= 5 && typeof row.correct === 'boolean'; });
    if (!rated.length) return { score:null, count:0, brier:null, gap:null, avgConfidence:null, accuracy:null, label:'Collecting evidence' };
    var sumSquared = 0;
    var sumPredicted = 0;
    var correct = 0;
    rated.forEach(function(row){
      var p = attemptProbability(row);
      var outcome = row.correct ? 1 : 0;
      sumSquared += Math.pow(p - outcome, 2);
      sumPredicted += p;
      correct += outcome;
    });
    var brier = sumSquared / rated.length;
    var avg = sumPredicted / rated.length;
    var accuracy = correct / rated.length;
    var score = Math.round(clamp((1 - brier) * 100, 0, 100));
    var gap = avg - accuracy;
    var label = rated.length < 5 ? 'Early signal' : gap > 0.10 ? 'Overconfident' : gap < -0.10 ? 'Underconfident' : 'Well aligned';
    return { score:score, count:rated.length, brier:brier, gap:gap, avgConfidence:avg, accuracy:accuracy, label:label };
  }

  function getSkillStats(historyInput){
    var history = (historyInput || getHistory()).filter(function(row){ return row.skillKey && typeof row.correct === 'boolean'; });
    var map = {};
    history.forEach(function(row){
      if (!map[row.skillKey]) map[row.skillKey] = { skillKey:row.skillKey, skillLabel:row.skillLabel || row.skillKey, task:row.task || '', eco:row.eco || '', moduleId:row.moduleId || '', attempts:0, correct:0, confidenceTotal:0, confidenceCount:0, errors:{} };
      var item = map[row.skillKey];
      item.attempts += 1;
      if (row.correct) item.correct += 1;
      if (row.confidence) { item.confidenceTotal += attemptProbability(row); item.confidenceCount += 1; }
      if (row.errorType) item.errors[row.errorType] = (item.errors[row.errorType] || 0) + 1;
    });
    return Object.values(map).map(function(item){
      item.accuracy = item.attempts ? item.correct / item.attempts : 0;
      item.avgConfidence = item.confidenceCount ? item.confidenceTotal / item.confidenceCount : null;
      item.confidenceGap = item.avgConfidence === null ? null : item.avgConfidence - item.accuracy;
      var calibration = item.confidenceGap === null ? 0.5 : 1 - clamp(Math.abs(item.confidenceGap), 0, 1);
      item.mastery = Math.round((item.accuracy * 0.75 + calibration * 0.25) * 100);
      item.topError = Object.keys(item.errors).sort(function(a,b){ return item.errors[b] - item.errors[a]; })[0] || '';
      return item;
    }).sort(function(a,b){ return a.mastery - b.mastery || b.attempts - a.attempts; });
  }

  function getDueQueue(){
    return getQueue().filter(function(item){ return item.status !== 'archived' && (!item.dueDate || item.dueDate <= today()); })
      .sort(function(a,b){ return Number(b.priority || 0) - Number(a.priority || 0) || String(a.dueDate || '').localeCompare(String(b.dueDate || '')); });
  }

  function getDomainCoverage(historyInput){
    var history = (historyInput || getHistory()).filter(function(row){ return DOMAIN_TARGETS[row.eco] !== undefined; });
    var counts = { 'People':0, 'Process':0, 'Business Environment':0 };
    history.forEach(function(row){ counts[row.eco] += 1; });
    var total = history.length;
    var out = {};
    Object.keys(DOMAIN_TARGETS).forEach(function(domain){
      out[domain] = { count:counts[domain], pct:total ? counts[domain] / total : 0, target:DOMAIN_TARGETS[domain] };
    });
    return out;
  }

  function pickTargetDomain(history){
    if (!history.length || Math.random() < 0.18) {
      var roll = Math.random();
      return roll < 0.33 ? 'People' : roll < 0.74 ? 'Process' : 'Business Environment';
    }
    var coverage = getDomainCoverage(history);
    var nextTotal = history.length + 1;
    return Object.keys(DOMAIN_TARGETS).sort(function(a,b){
      var deficitA = DOMAIN_TARGETS[a] * nextTotal - coverage[a].count;
      var deficitB = DOMAIN_TARGETS[b] * nextTotal - coverage[b].count;
      return deficitB - deficitA;
    })[0];
  }

  function selectScenario(options){
    options = options || {};
    var scenarios = getScenarios();
    if (!scenarios.length) return null;
    if (options.scenarioId) return scenarios.find(function(item){ return item.id === options.scenarioId; }) || null;

    var history = getHistory();
    var recentIds = history.slice(-4).map(function(row){ return row.scenarioId; }).filter(Boolean);
    var skillKey = options.skillKey || '';
    if (!skillKey && options.mode !== 'random') {
      var due = getDueQueue();
      if (due.length) skillKey = due[0].skillKey;
    }

    var pool = skillKey ? scenarios.filter(function(item){ return item.skill === skillKey; }) : [];
    if (!pool.length) {
      var domain = options.eco || pickTargetDomain(history);
      pool = scenarios.filter(function(item){ return item.eco === domain; });
    }
    var fresh = pool.filter(function(item){ return recentIds.indexOf(item.id) === -1; });
    if (fresh.length) pool = fresh;
    return pool[Math.floor(Math.random() * pool.length)] || scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  function getSummary(){
    var history = getHistory().filter(function(row){ return typeof row.correct === 'boolean'; });
    var correct = history.filter(function(row){ return row.correct; }).length;
    var calibration = getCalibration(history);
    var skills = getSkillStats(history);
    var errors = {};
    history.forEach(function(row){ if (row.errorType) errors[row.errorType] = (errors[row.errorType] || 0) + 1; });
    return {
      attempts:history.length,
      correct:correct,
      accuracy:history.length ? Math.round(correct / history.length * 100) : null,
      calibration:calibration,
      due:getDueQueue(),
      queue:getQueue(),
      skills:skills,
      weakest:skills[0] || null,
      errors:errors,
      coverage:getDomainCoverage(history),
      scenarioCount:getScenarios().length
    };
  }

  function getModuleEvidence(moduleId){
    var rows = getHistory().filter(function(row){ return row.moduleId === moduleId && typeof row.correct === 'boolean'; });
    if (!rows.length) return { attempts:0, accuracy:null, calibration:null, weakSkills:[] };
    var correct = rows.filter(function(row){ return row.correct; }).length;
    return {
      attempts:rows.length,
      accuracy:Math.round(correct / rows.length * 100),
      calibration:getCalibration(rows),
      weakSkills:getSkillStats(rows).slice(0,2)
    };
  }

  function recentHistory(days){
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (Number(days || 7) - 1));
    var cutoffStr = fmtDate(cutoff);
    return getHistory().filter(function(row){ return (row.date || '') >= cutoffStr; });
  }

  function getReviewPrompt(){
    var rows = recentHistory(7);
    var all = getSummary();
    if (!rows.length) return 'No judgment scenarios were completed this week. Which PMP 2026 task needs one confidence-rated scenario before planning next week?';
    var correct = rows.filter(function(row){ return row.correct; }).length;
    var cal = getCalibration(rows);
    var weak = getSkillStats(rows)[0] || all.weakest;
    var gap = cal.gap === null ? 'no confidence evidence' : (Math.abs(cal.gap * 100).toFixed(0) + ' point ' + (cal.gap > 0 ? 'overconfidence' : cal.gap < 0 ? 'underconfidence' : 'confidence gap'));
    return 'This week: ' + rows.length + ' judgment scenario(s), ' + Math.round(correct / rows.length * 100) + '% accuracy, ' + gap + '. Weakest observed skill: ' + (weak ? weak.skillLabel : 'collecting evidence') + '. ' + all.due.length + ' weak-skill item(s) are due. What error pattern repeated, and what rule will you deliberately re-practice?';
  }

  function getStrategicSignal(){
    var summary = getSummary();
    if (!summary.attempts) return { hasEvidence:false, title:'Judgment evidence is not established yet', detail:'Complete confidence-rated PMP scenarios to identify a real capability target.', due:0 };
    var weak = summary.weakest;
    return {
      hasEvidence:true,
      title:weak ? weak.skillLabel : 'Judgment practice',
      detail:(weak ? ('Observed mastery ' + weak.mastery + '% across ' + weak.attempts + ' attempt(s). ') : '') + (summary.calibration.count >= 5 ? ('Calibration ' + summary.calibration.score + '% · ' + summary.calibration.label + '.') : 'Calibration is still an early signal.'),
      due:summary.due.length,
      skillKey:weak ? weak.skillKey : '',
      moduleId:weak ? weak.moduleId : ''
    };
  }

  function validate(){
    var scenarios = getScenarios();
    var ids = scenarios.map(function(item){ return item.id; });
    var duplicates = ids.filter(function(id, i){ return ids.indexOf(id) !== i; });
    var malformed = scenarios.filter(function(item){
      return !item.id || !item.q || item.choices.length < 3 || item.answer < 0 || item.answer >= item.choices.length || !TASKS[item.task] || !item.skill || !item.moduleId || !item.sourceIds.length || !item.explain || !item.mindset || !item.weak || !item.transferPrompt;
    });
    var taskCounts = {};
    scenarios.forEach(function(item){ taskCounts[item.task] = (taskCounts[item.task] || 0) + 1; });
    var missingTasks = Object.keys(TASKS).filter(function(task){ return !taskCounts[task]; });
    var queue = getQueue();
    var validSkills = new Set(Object.keys(TASKS).map(function(task){ return TASKS[task].skill; }));
    var malformedQueue = queue.filter(function(item){ return !item.id || !item.skillKey || !item.dueDate || !validSkills.has(item.skillKey); });
    var sourceCatalog = new Set((window.DOCTRINE_SOURCES || []).map(function(source){ return source.id; }));
    var unresolvedSources = [];
    scenarios.forEach(function(item){
      item.sourceIds.forEach(function(sourceId){ if (!sourceCatalog.has(sourceId)) unresolvedSources.push(item.id + ':' + sourceId); });
    });
    var pmpModules = typeof PATHWAYS !== 'undefined' && PATHWAYS.pmp && Array.isArray(PATHWAYS.pmp.modules) ? new Set(PATHWAYS.pmp.modules.map(function(module){ return module.id; })) : new Set();
    var unresolvedModules = scenarios.filter(function(item){ return !pmpModules.has(item.moduleId); }).map(function(item){ return item.id + ':' + item.moduleId; });
    return {
      ok:!duplicates.length && !malformed.length && !missingTasks.length && !malformedQueue.length && !unresolvedSources.length && !unresolvedModules.length,
      scenarioCount:scenarios.length,
      duplicates:duplicates,
      malformed:malformed,
      missingTasks:missingTasks,
      malformedQueue:malformedQueue,
      unresolvedSources:unresolvedSources,
      unresolvedModules:unresolvedModules,
      taskCounts:taskCounts
    };
  }

  return {
    DOMAIN_TARGETS:DOMAIN_TARGETS,
    TASKS:TASKS,
    ERROR_TYPES:ERROR_TYPES,
    CONFIDENCE_LEVELS:CONFIDENCE_LEVELS,
    normalizeScenario:normalizeScenario,
    getScenarios:getScenarios,
    getHistory:getHistory,
    getQueue:getQueue,
    getDueQueue:getDueQueue,
    getSummary:getSummary,
    getCalibration:getCalibration,
    getSkillStats:getSkillStats,
    getModuleEvidence:getModuleEvidence,
    getReviewPrompt:getReviewPrompt,
    getStrategicSignal:getStrategicSignal,
    selectScenario:selectScenario,
    recordAttempt:recordAttempt,
    updateAttempt:updateAttempt,
    getAttempt:getAttempt,
    promoteAttemptToFlashcard:promoteAttemptToFlashcard,
    suggestErrorType:suggestErrorType,
    validate:validate,
    confidenceProbability:confidenceProbability
  };
})();

window.PRACTICE = PRACTICE;
