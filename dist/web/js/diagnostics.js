// ==================== DIAGNOSTICS (V31) ====================
// Runtime checks to validate that routing, render functions, DOM roots, and storage keys are sane.
// This does not send data anywhere; it runs locally in your browser.

var diagnosticsReports = window.__diagnosticsReports || {};
window.__diagnosticsReports = diagnosticsReports;

function diagnosticsRunStamp(){
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function diagnosticsPublishReport(slotId, html){
  diagnosticsReports[slotId] = html || '';
  var slot = document.getElementById(slotId);
  if(slot) slot.innerHTML = diagnosticsReports[slotId];
  return slot;
}

function diagnosticsRestoreReports(){
  ['diagResults','diagInteractionResults','diagActiveTestResults','diagMutationTestResults','contractAuditBox'].forEach(function(slotId){
    var slot = document.getElementById(slotId);
    if(slot && diagnosticsReports[slotId]) slot.innerHTML = diagnosticsReports[slotId];
  });
}

var diagnosticsStorageShapes = window.STUDYOS_STORAGE_SHAPES || {};

function diagnosticsCheckStorageEntry(entry){
  var result = { ok: true, detail: 'OK' };
  try {
    var raw = localStorage.getItem(entry.key);
    if (!raw || !raw.length) return { ok: true, detail: 'Empty (fine if new)' };
    var parsed = JSON.parse(raw);
    if (parsed === null) return { ok: true, detail: 'Empty (fine if inactive)' };
    if (diagnosticsStorageShapes[entry.name] === 'array' && !Array.isArray(parsed)) {
      return { ok: false, detail: 'Expected an array, found ' + (parsed === null ? 'null' : typeof parsed) };
    }
    if (diagnosticsStorageShapes[entry.name] === 'object' && (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object')) {
      return { ok: false, detail: 'Expected an object, found ' + (parsed === null ? 'null' : Array.isArray(parsed) ? 'array' : typeof parsed) };
    }
  } catch (e) {
    result.ok = false;
    result.detail = 'Invalid JSON in localStorage';
  }
  return result;
}

async function runDiagnosticsSuite(){
  await runDiagnostics();
  runInteractionAudit();
}

function runContractAudit(){
  const issues = [];
  // Single source of truth: data/contracts.js (window.STUDYOS_CONTRACTS).
  // Falls back to this smaller hardcoded list only if that file failed to
  // load, so the audit still runs rather than throwing.
  const contracts = window.STUDYOS_CONTRACTS || {};
  const requireIds = contracts.requiredIds || [
    'operatorRoot','doctrineRoot','captureInboxRoot','focusOverlay',
    'doctrineModal','doctrineModalTitle','doctrineModalBody','doctrineModalPrimary','doctrineModalSecondary',
    'modelGraphModal','modelGraphCanvas',
    'blindSpotCard','todayFocusTask','dashStrategic','dashMomentumChart','momentumTrendCard',
    'dashLearn','dashWisdom','dailyQuoteText','disciplineSparkline','hoursSparkline',
    'v7Time','v7Risk','v7Momentum','habitsMomentumChart',
    'scienceSummary','scienceCycleCard','scienceCycleHistory','scienceEvidenceList',
    'profileLabRoot','qualityLoopRoot','commQualityBehaviors','commOutcome','qualityReviewModal'
  ];
  requireIds.forEach(id=>{
    if(!document.getElementById(id)) issues.push({type:'missing_id', id});
  });

  const requireFns = contracts.requiredFunctions || [
    'go','goTab','renderDiagnostics','renderDoctrine','renderOperator',
    'doctrineOpenModal','doctrineCreateFlashcardPack','doctrineOpenModelGraph',
    'startFocusMode','pauseFocusMode','exitFocusMode','completeFocusMode',
    'renderScienceCoach','scienceStartFocus','scienceSaveCycle',
    'renderProfileLab','profileRecordFeedback','profileIsHypothesisEnabled',
    'profileSetGuidanceDensity','profileGuidanceDensity',
    'evaluateDecisionGuardrail','renderDecisionGuardrail',
    'renderQualityLoop','openQualityReviewModal','saveQualityReview',
    'toggleCommQualityBehavior','setCommOutcome','renderExecutionInsight'
  ];
  requireFns.forEach(fn=>{
    if(typeof window[fn] !== 'function') issues.push({type:'missing_fn', fn});
  });

  // Duplicate IDs
  const seen = new Map();
  document.querySelectorAll('[id]').forEach(el=>{
    const id = el.id;
    seen.set(id, (seen.get(id)||0)+1);
  });
  [...seen.entries()].filter(([id,c])=>c>1).forEach(([id,c])=>{
    issues.push({type:'duplicate_id', id, count:c});
  });

  // Nested pages
  document.querySelectorAll('.page .page').forEach(el=>{
    issues.push({type:'nested_page', id: el.id || '(no id)'});
  });

  return issues;
}

function renderDiagnostics() {
  const root = document.getElementById('diagnosticsRoot');
  if (!root) return;
  root.innerHTML = `
    <div class="diagnostics-shell">
      <div class="card diagnostics-hero">
        <div>
          <div class="kicker">Runtime assurance</div>
          <h3>Diagnostics that prove failure detection</h3>
          <p>Start with the core suite. It validates both storage layers, cross-page schemas, Science Coach, Find & Connect, the scenario bank, adaptive profile state, decision guardrails, preventive controls, communication outcomes, calibration, and failure detection—not only whether pages exist.</p>
        </div>
        <button class="btn btn-primary" onclick="runDiagnosticsSuite()">Run core suite</button>
      </div>
      <div class="diagnostics-mode-grid">
        <button class="diagnostics-mode-card" onclick="runDiagnostics()"><span class="diagnostics-mode-level">01 · Safe</span><strong>Health & contracts</strong><small>Storage parse/write, schema, required IDs/functions, engines</small><span>Run →</span></button>
        <button class="diagnostics-mode-card" onclick="runInteractionAudit()"><span class="diagnostics-mode-level">02 · Safe</span><strong>Interaction audit</strong><small>Routes, tabs, every static click target, cross-system bridges</small><span>Run →</span></button>
        <button class="diagnostics-mode-card" onclick="runDeepActiveTestMode()"><span class="diagnostics-mode-level">03 · Active</span><strong>Navigation stress test</strong><small>Visits routes/tabs and executes low-risk runtime probes</small><span>Run →</span></button>
        <button class="diagnostics-mode-card guarded" onclick="runGuardedMutationTestMode()"><span class="diagnostics-mode-level">04 · Guarded</span><strong>Workflow mutation test</strong><small>Exercises profile feedback, judgment, quality, communication, conflict intelligence, import/reset, and both storage layers—then proves exact restoration</small><span>Run →</span></button>
      </div>
      <div id="diagResults"></div>
      <div id="diagInteractionResults"></div>
      <div id="diagActiveTestResults"></div>
      <div id="diagMutationTestResults"></div>
      <div id="contractAuditBox"></div>
    </div>
  `;
  diagnosticsRestoreReports();
}

async function runDiagnostics() {
  diagnosticsPublishReport('diagResults', '<div class="card diagnostics-running">Running health, storage, engine, and contract checks…</div>');
  const results = [];

  try {
    if (window.__storageReadyPromise) await window.__storageReadyPromise;
  } catch (e) {
    console.warn('Diagnostics storage readiness wait failed', e);
  }

  if (window.STUDYOS_ICONS && typeof window.STUDYOS_ICONS.enhance === 'function') {
    window.STUDYOS_ICONS.enhance(document);
  }

  // 1) Routes → page containers exist
  const pages = Array.from(document.querySelectorAll('.page')).map(p => p.id);
  // V62.1: derive from data/contracts.js rather than duplicating the list.
  // The hard-coded copy was never updated when the Mushaf route was added, so
  // the "direct children of pageContainer" assertion below compared 12 mounted
  // pages against a stale expectation of 11 and reported a false failure.
  const expectedPages = (window.STUDYOS_CONTRACTS && Array.isArray(window.STUDYOS_CONTRACTS.routes))
    ? window.STUDYOS_CONTRACTS.routes.slice()
    : ['dashboard','dailyops','planner','study','knowledge',
       'strategy','journal','reviewhub','network','system','quran','mushaf'];
  expectedPages.forEach(id => {
    results.push({
      name: `Page container #${id}`,
      ok: pages.includes(id),
      detail: pages.includes(id) ? 'OK' : 'Missing .page container'
    });
  });

  // V29.3+ visual-system integrity. A missing stylesheet or icon engine can
  // leave navigation usable but visually degraded without a JavaScript error.
  // V62.1: the portable build (tools/build-universal.js) inlines every
  // stylesheet into a style element carrying a data-source attribute, so a
  // link-only check reported the design system as missing in exactly the
  // build most likely to be running it. Accept either delivery form.
  const designStylesheetRe = /(?:^|\/)css\/design-system\.css(?:$|[?#])/;
  const designStylesheet =
    Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(function(link){
      return designStylesheetRe.test(link.getAttribute('href') || '');
    }) ||
    Array.from(document.querySelectorAll('style[data-source]')).some(function(style){
      return designStylesheetRe.test(style.getAttribute('data-source') || '');
    });
  results.push({ name: 'Design-system stylesheet', ok: designStylesheet, detail: designStylesheet ? 'Authoritative visual layer is linked' : 'css/design-system.css is not linked' });

  const iconEngineReady = !!window.STUDYOS_ICONS && typeof window.STUDYOS_ICONS.render === 'function' && typeof window.STUDYOS_ICONS.enhance === 'function';
  results.push({ name: 'Local SVG icon engine', ok: iconEngineReady, detail: iconEngineReady ? Object.keys(window.STUDYOS_ICONS.paths || {}).length + ' icon definitions available' : 'STUDYOS_ICONS is missing or incomplete' });

  const navControls = Array.from(document.querySelectorAll('.nav-link, .mobile-nav button[data-route]'));
  const navIcons = navControls.filter(function(control){ return !!control.querySelector('svg.ui-icon'); });
  results.push({ name: 'Navigation icon coverage', ok: navControls.length > 0 && navIcons.length === navControls.length, detail: navIcons.length + '/' + navControls.length + ' route controls use the unified SVG language' });

  const primaryHeaders = document.querySelectorAll('.page > .page-header.page-header-primary').length;
  results.push({ name: 'Primary page hierarchy', ok: primaryHeaders === expectedPages.length, detail: primaryHeaders + '/' + expectedPages.length + ' pages expose a standardized primary header' });

  const rootStyles = getComputedStyle(document.documentElement);
  const tokensReady = !!rootStyles.getPropertyValue('--space-4').trim() && !!rootStyles.getPropertyValue('--text-base').trim() && !!rootStyles.getPropertyValue('--radius-md').trim();
  results.push({ name: 'Spacing, type, and radius tokens', ok: tokensReady, detail: tokensReady ? 'Shared visual tokens are active' : 'One or more core visual tokens are missing' });

  // 2) Render function existence
  const fnChecks = [
    'go','goTab','refreshDashboard','renderProtocol','renderDiscipline','renderLearn','renderScienceCoach','renderStudyLab','renderPmpTools',
    'renderFlashcards','renderKnowledge','renderGoals','renderTasks','renderCalendar','refreshTracker',
    'renderHabits','renderContacts','renderJournal','renderWeeklyReview','showInsight','renderGuide',
    'renderStrategicHorizon','renderDecisions','renderDoctrine','renderFrameworkLab','renderCaptureInbox','renderJudgmentInsight','loadScenario','loadSettings','renderDiagnostics',
    'renderProfileLab','profileRecordFeedback','profileIsHypothesisEnabled','profileSetGuidanceDensity','profileGuidanceDensity',
    'evaluateDecisionGuardrail','renderDecisionGuardrail','renderQualityLoop','openQualityReviewModal','saveQualityReview','toggleCommQualityBehavior','setCommOutcome','renderExecutionInsight',
    'renderQuranRead','renderQuranListen','renderQuranUnderstand'
  ];
  fnChecks.forEach(fn => {
    results.push({
      name: `Function ${fn}()`,
      ok: typeof window[fn] === 'function',
      detail: (typeof window[fn] === 'function') ? 'OK' : 'Not found'
    });
  });

  // 3) Storage keys present / readable
  // V26: was a hand-picked list of 5 keys and silently drifted out of sync
  // with the K map (32 keys) as releases added new storage. Derive from K
  // itself so every registered key gets checked with no manual upkeep.
  const keyEntries = Object.keys(K).map(name => ({ name, key: K[name] }));
  keyEntries.forEach(entry => {
    const check = diagnosticsCheckStorageEntry(entry);
    results.push({ name: `Storage: ${entry.key}`, ok: check.ok, detail: check.detail });
  });

  const duplicateStorageKeys = keyEntries.reduce(function(map, entry){
    map[entry.key] = (map[entry.key] || []).concat(entry.name);
    return map;
  }, {});
  const duplicated = Object.keys(duplicateStorageKeys).filter(function(key){ return duplicateStorageKeys[key].length > 1; });
  results.push({ name: 'No duplicate storage-key registrations', ok: duplicated.length === 0, detail: duplicated.length ? duplicated.map(function(key){ return key + ' (' + duplicateStorageKeys[key].join(', ') + ')'; }).join(' · ') : keyEntries.length + ' unique registered keys' });

  // Every StudyOS-owned key must be in K so backup, reset, migrations, and
  // diagnostics all see the same data. This catches raw one-off storage keys.
  const registeredStorageValues = new Set(keyEntries.map(function(entry){ return entry.key; }).concat([STORAGE_SCHEMA_KEY]));
  const unregisteredAppKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    if ((key.startsWith('hcc_') || key.startsWith('studyos_')) && !registeredStorageValues.has(key) && key !== 'studyos_diagnostics_probe_v1') unregisteredAppKeys.push(key);
  }
  results.push({ name: 'No orphaned application storage keys', ok: unregisteredAppKeys.length === 0, detail: unregisteredAppKeys.length ? ('Unregistered: ' + unregisteredAppKeys.join(', ')) : 'Every StudyOS key participates in backup/reset/diagnostics' });

  // Prove localStorage can actually write/read/remove without touching user keys.
  const storageProbeKey = 'studyos_diagnostics_probe_v1';
  const storageProbeBefore = localStorage.getItem(storageProbeKey);
  try {
    const nonce = Date.now() + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem(storageProbeKey, JSON.stringify({ nonce }));
    const roundTrip = JSON.parse(localStorage.getItem(storageProbeKey) || '{}');
    results.push({ name: 'localStorage write/read round trip', ok: roundTrip.nonce === nonce, detail: roundTrip.nonce === nonce ? 'Temporary probe verified and removed' : 'Round-trip value mismatch' });
  } catch (e) {
    results.push({ name: 'localStorage write/read round trip', ok: false, detail: 'Threw: ' + e.message });
  } finally {
    if (storageProbeBefore === null) localStorage.removeItem(storageProbeKey);
    else localStorage.setItem(storageProbeKey, storageProbeBefore);
  }

  // Fault injection: prove the detector fails red on malformed registered
  // storage, then restore the exact original value before continuing.
  const faultKey = K.settings;
  const faultBefore = localStorage.getItem(faultKey);
  let storageFaultCaught = false;
  try {
    localStorage.setItem(faultKey, '{diagnostics-invalid-json');
    const faultResult = diagnosticsCheckStorageEntry({ name: 'settings', key: faultKey });
    storageFaultCaught = !faultResult.ok && faultResult.detail.indexOf('Invalid JSON') !== -1;
  } finally {
    if (faultBefore === null) localStorage.removeItem(faultKey);
    else localStorage.setItem(faultKey, faultBefore);
  }
  results.push({ name: 'Fault injection: malformed storage detected', ok: storageFaultCaught, detail: storageFaultCaught ? 'Detector failed red; original settings restored' : 'Detector did not catch injected invalid JSON' });

  // 4) Doctrine modules sanity
  const doctrineOk = Array.isArray(window.DOCTRINE_MODULES) && window.DOCTRINE_MODULES.length > 0;
  results.push({
    name: 'Doctrine modules loaded',
    ok: doctrineOk,
    detail: doctrineOk ? `${window.DOCTRINE_MODULES.length} modules` : 'DOCTRINE_MODULES missing/empty'
  });

  // 5) HTML structure: no nested .page inside .page
  const nestedPages = document.querySelectorAll('.page .page');
  results.push({
    name: 'No nested .page elements',
    ok: nestedPages.length === 0,
    detail: nestedPages.length === 0 ? 'OK' : nestedPages.length + ' nested pages found (CRITICAL)'
  });

  // 6) All runtime pages are direct children of #pageContainer
  const pageContainer = document.getElementById('pageContainer');
  const mountedPages = pageContainer ? Array.from(pageContainer.children).filter(el => el.classList && el.classList.contains('page')) : [];
  results.push({
    name: 'All pages direct children of pageContainer',
    ok: mountedPages.length === expectedPages.length,
    detail: mountedPages.length + '/' + expectedPages.length + ' pages mounted at runtime root'
  });

  // 7) No modals inside page containers
  const modalsInPages = document.querySelectorAll('.page .modal');
  results.push({
    name: 'No modals inside pages',
    ok: modalsInPages.length === 0,
    detail: modalsInPages.length === 0 ? 'OK' : modalsInPages.length + ' modals trapped inside pages'
  });

  // 8) Focus overlay not inside a page
  const ovl = document.getElementById('focusOverlay');
  const ovlInPage = ovl ? ovl.closest('.page') : null;
  results.push({
    name: 'Focus overlay at app level',
    ok: !ovlInPage,
    detail: ovlInPage ? 'WARN: inside #' + ovlInPage.id : 'OK'
  });

  results.push({ name: 'Schema version', ok: parseInt(localStorage.getItem(STORAGE_SCHEMA_KEY) || '0', 10) === DATA_SCHEMA_VERSION, detail: 'Stored ' + (localStorage.getItem(STORAGE_SCHEMA_KEY) || '0') + ' · Expected ' + DATA_SCHEMA_VERSION });
  let indexedDbOk = false;
  let indexedDbDetail = 'Missing STORAGE engine';
  try {
    if (window.STORAGE && typeof window.STORAGE.open === 'function') {
      const db = await window.STORAGE.open();
      indexedDbOk = !!db && db.objectStoreNames.contains(INDEXED_DB_STORE);
      indexedDbDetail = indexedDbOk ? ('Database ' + INDEXED_DB_NAME + ' / store ' + INDEXED_DB_STORE + ' opened') : 'Database opened without required object store';
    }
  } catch (e) {
    indexedDbDetail = 'Open failed: ' + e.message;
  }
  results.push({ name: 'IndexedDB mirror ready', ok: indexedDbOk, detail: indexedDbDetail });
  results.push({ name: 'Central metrics engine', ok: !!window.METRICS, detail: window.METRICS ? 'METRICS available' : 'METRICS missing' });
  results.push({ name: 'Capability map', ok: !!window.CAPABILITY_MAP, detail: window.CAPABILITY_MAP ? 'Capability map loaded' : 'Capability map missing' });
  const registeredTrackers = ['commTracker','energyTracker','principlesTracker','scenarioHistory','practiceQueue','learningCycles','cebokTracker','captureInbox','entityLinks','cardReviewDetails','doctrineDomainOverrides','doctrineModelOverrides','doctrineView','commitmentPrefs','adaptiveProfile','profileFeedback','qualityReviews'];
  const missingTrackers = registeredTrackers.filter(key => !K[key]);
  results.push({ name: 'Feature storage keys registered', ok: missingTrackers.length === 0, detail: missingTrackers.length ? ('Missing: ' + missingTrackers.join(', ')) : registeredTrackers.length + ' tracker keys in K' });
  const timer = document.getElementById('studyTimer');
  const momentum = document.getElementById('habitsMomentum');
  results.push({ name: 'Habit momentum outside study timer', ok: !!timer && !!momentum && !timer.contains(momentum), detail: !timer || !momentum ? 'Required element missing' : (timer.contains(momentum) ? 'Nested in floating timer' : 'OK') });
  results.push({ name: 'Local calendar day helper', ok: today() === fmtDate(new Date()), detail: today() + ' local day' });

  // V31 Adaptive Profile & Execution is deliberately schema-checked here.
  // A visible card is not enough: prompts, feedback, communication outcomes,
  // quality controls, and decision advice must remain machine-resolvable.
  try {
    if (!window.PROFILE || !Array.isArray(PROFILE.hypotheses)) throw new Error('PROFILE registry missing');
    const hypothesisIds = PROFILE.hypotheses.map(function(item){ return item && item.id; });
    const uniqueHypothesisIds = new Set(hypothesisIds);
    const hypothesisRegistryOk = hypothesisIds.length >= 8 && uniqueHypothesisIds.size === hypothesisIds.length && PROFILE.hypotheses.every(function(item){ return !!item.id && !!item.hypothesis && !!item.test && !!item.design; });
    results.push({ name: 'Adaptive-profile hypothesis registry', ok: hypothesisRegistryOk, detail: hypothesisRegistryOk ? hypothesisIds.length + ' unique, testable hypotheses' : 'Missing, duplicated, or incomplete hypothesis records' });

    const profile = getAdaptiveProfile();
    const profileStates = Object.keys(profile.hypotheses || {}).map(function(id){ return profileHypothesisState(id); });
    const profileSchemaOk = profile.version === 1 && typeof profile.enabled === 'boolean' && ['compact','balanced','coaching'].includes(profile.guidanceDensity) && profileStates.every(function(state){ return ['testing','useful','not-me','snoozed'].includes(state.status); });
    results.push({ name: 'Adaptive-profile state schema', ok: profileSchemaOk, detail: profileSchemaOk ? profile.guidanceDensity + ' guidance · ' + profileStates.length + ' personalized state(s)' : 'Profile state contains an invalid version, density, toggle, or status' });

    const feedback = arr(K.profileFeedback);
    const malformedFeedback = feedback.filter(function(row){ return !row || !row.id || !uniqueHypothesisIds.has(row.hypothesisId) || !['helpful','not-me','testing'].includes(row.response) || !row.at; });
    results.push({ name: 'Profile-feedback record schema', ok: malformedFeedback.length === 0, detail: malformedFeedback.length ? malformedFeedback.length + ' invalid feedback record(s)' : feedback.length + ' valid feedback record(s)' });
    const executionSummary = profileExecutionSummary(90);
    const executionShapeOk = executionSummary.qualityCommDays <= executionSummary.commDays && executionSummary.verified <= executionSummary.quality && executionSummary.slow + executionSummary.decide + executionSummary.balanced === executionSummary.guardrails;
    results.push({ name: 'Adaptive execution-summary invariants', ok: executionShapeOk, detail: executionShapeOk ? 'Decision modes, verified controls, and communication-quality days remain bounded by their totals' : 'One or more execution summary numerator exceeds or disagrees with its total' });
  } catch (e) {
    results.push({ name: 'Adaptive Profile engine', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    const reviews = arr(K.qualityReviews);
    const malformedReviews = reviews.filter(function(row){
      return !row || !row.id || !row.title || !row.date || !row.whatHappened || !row.rootCause || !row.prevention ||
        !['low','medium','high','regulated'].includes(row.impact) || !['first','repeat'].includes(row.recurrence) ||
        !['open','effective','needs-work'].includes(row.verificationStatus);
    });
    const reviewTaskIds = new Set(arr(K.tasks).map(function(task){ return task.id; }));
    const orphanedReviewTasks = reviews.filter(function(row){ return row.taskId && !reviewTaskIds.has(row.taskId); });
    results.push({ name: 'Quality-loop record schema', ok: malformedReviews.length === 0, detail: malformedReviews.length ? malformedReviews.length + ' malformed review(s)' : reviews.length + ' valid review(s)' });
    results.push({ name: 'Quality review → verification task links', ok: orphanedReviewTasks.length === 0, detail: orphanedReviewTasks.length ? orphanedReviewTasks.length + ' review(s) point to missing Tasks records' : 'Every linked verification task resolves' });
  } catch (e) {
    results.push({ name: 'Quality Loop schema', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    const tracker = get(K.commTracker) || {};
    const qualityIds = new Set((window.COMM_QUALITY_BEHAVIORS || []).map(function(item){ return item.id; }));
    const malformedCommRows = Object.keys(tracker).filter(function(date){
      const row = tracker[date];
      return !row || typeof row !== 'object' || !Array.isArray(row.activities) || !Array.isArray(row.qualityBehaviors) ||
        row.qualityBehaviors.some(function(id){ return !qualityIds.has(id); }) ||
        !(row.outcome === null || row.outcome === undefined || (Number(row.outcome) >= 1 && Number(row.outcome) <= 5));
    });
    results.push({ name: 'Communication quality/outcome schema', ok: malformedCommRows.length === 0 && qualityIds.size >= 5, detail: malformedCommRows.length ? malformedCommRows.length + ' invalid daily row(s)' : qualityIds.size + ' receiver-side behaviors · ' + Object.keys(tracker).length + ' daily row(s)' });
  } catch (e) {
    results.push({ name: 'Communication quality schema', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    if (typeof evaluateDecisionGuardrail !== 'function') throw new Error('evaluateDecisionGuardrail missing');
    const slow = evaluateDecisionGuardrail({ impact:'regulated', reversibility:'one-way', decisionState:'rushing', timePressure:'urgent', evidenceQuality:1, sourceCount:0 });
    const decide = evaluateDecisionGuardrail({ impact:'low', reversibility:'two-way', decisionState:'stuck', timePressure:'normal', evidenceQuality:4, sourceCount:1, disconfirming:'Alternative checked' });
    const balanced = evaluateDecisionGuardrail({ impact:'medium', reversibility:'two-way', decisionState:'balanced', timePressure:'normal', evidenceQuality:4, sourceCount:2, disconfirming:'Alternative checked', stakeholders:'Owner consulted' });
    const invariantOk = slow.mode === 'slow-down' && decide.mode === 'decide' && balanced.mode === 'balanced' && [slow,decide,balanced].every(function(row){ return row.title && row.reasons.length && row.actions.length; });
    results.push({ name: 'Two-sided Decision Guardrail invariants', ok: invariantOk, detail: invariantOk ? 'Slow down, decide, and balanced branches returned proportionate advice' : 'One or more synthetic decision states was misclassified' });
  } catch (e) {
    results.push({ name: 'Decision Guardrail engine', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    if (!window.COMMITMENTS || typeof COMMITMENTS.selfTest !== 'function') throw new Error('COMMITMENTS engine missing');
    const selfTest = COMMITMENTS.selfTest();
    const failedChecks = Object.keys(selfTest.checks || {}).filter(function(key){ return !selfTest.checks[key]; });
    results.push({ name: 'Commitment Intelligence interval/recurrence engine', ok: selfTest.pass, detail: selfTest.pass ? Object.keys(selfTest.checks).length + ' pure checks passed' : ('Failed: ' + failedChecks.join(', ')) });
    const dayShape = COMMITMENTS.scanDay(today());
    const shapeOk = !!dayShape && Array.isArray(dayShape.commitments) && Array.isArray(dayShape.issues) && !!dayShape.load && typeof dayShape.load.totalMinutes === 'number';
    results.push({ name: 'Commitment Intelligence live-plan shape', ok: shapeOk, detail: shapeOk ? dayShape.commitments.length + ' commitment(s) · ' + dayShape.issues.length + ' heads-up(s)' : 'scanDay returned an invalid shape' });
  } catch (e) {
    results.push({ name: 'Commitment Intelligence engine', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    if (!window.SCIENCE_COACH || typeof SCIENCE_COACH.selfTest !== 'function') throw new Error('SCIENCE_COACH.selfTest missing');
    const scienceTest = SCIENCE_COACH.selfTest();
    const failedScienceChecks = Object.keys(scienceTest.checks || {}).filter(function(key){ return !scienceTest.checks[key]; });
    results.push({ name: 'Science Coach evidence/readiness engine', ok: scienceTest.pass, detail: scienceTest.pass ? Object.keys(scienceTest.checks).length + ' pure checks passed' : ('Failed: ' + failedScienceChecks.join(', ')) });
    const evidenceRegistryOk = !!window.STUDYOS_SCIENCE && Array.isArray(STUDYOS_SCIENCE.claims) && STUDYOS_SCIENCE.claims.length >= 15;
    results.push({ name: 'Science evidence registry loaded', ok: evidenceRegistryOk, detail: evidenceRegistryOk ? STUDYOS_SCIENCE.claims.length + ' graded claims with boundaries' : 'Registry missing or unexpectedly small' });
  } catch (e) {
    results.push({ name: 'Science Coach engine', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    if (!window.SRS_ENGINE || typeof SRS_ENGINE.selfTest !== 'function') throw new Error('SRS_ENGINE.selfTest missing');
    const srsTest = SRS_ENGINE.selfTest();
    const failedSrsChecks = Object.keys(srsTest.checks || {}).filter(function(key){ return !srsTest.checks[key]; });
    results.push({ name: 'Adaptive Flashcards engine', ok: srsTest.pass, detail: srsTest.pass ? Object.keys(srsTest.checks).length + ' pure checks passed' : ('Failed: ' + failedSrsChecks.join(', ')) });
  } catch (e) {
    results.push({ name: 'Adaptive Flashcards engine', ok: false, detail: 'Threw: ' + e.message });
  }

  const learningCycles = arr(K.learningCycles);
  const malformedCycles = learningCycles.filter(function(row){
    return !row || !row.id || !row.date || !row.topic || !['technical','strategic','leadership'].includes(row.learningDomain) ||
      row.retrievalOutcome === null || row.retrievalOutcome === undefined || Number(row.retrievalOutcome) < 0 || Number(row.retrievalOutcome) > 3 ||
      !row.nextReviewDate || !row.readiness || typeof row.readiness !== 'object' || Array.isArray(row.readiness);
  });
  const taskIds = new Set(arr(K.tasks).map(function(task){ return task.id; }));
  const orphanedRetrievalTasks = learningCycles.filter(function(row){ return row.retrievalTaskId && !taskIds.has(row.retrievalTaskId); });
  results.push({ name: 'Learning Cycle record schema', ok: malformedCycles.length === 0, detail: malformedCycles.length ? malformedCycles.length + ' malformed cycle(s)' : learningCycles.length + ' valid cycle(s)' });
  results.push({ name: 'Learning Cycle → retrieval task links', ok: orphanedRetrievalTasks.length === 0, detail: orphanedRetrievalTasks.length ? orphanedRetrievalTasks.length + ' cycle(s) point to missing tasks' : 'Every scheduled retrieval task resolves' });

  const validScheduleTime = function(value){ return value === null || value === undefined || value === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value)); };
  const validScheduleDuration = function(value){ return value === null || value === undefined || value === '' || (Number.isFinite(parseInt(value, 10)) && parseInt(value, 10) > 0); };
  const invalidScheduledTasks = arr(K.tasks).filter(function(task){ return !validScheduleTime(task && task.time) || !validScheduleDuration(task && task.duration); });
  const invalidScheduledEvents = arr(K.events).filter(function(event){ return !validScheduleTime(event && event.time) || !validScheduleDuration(event && event.duration) || !['','daily','weekly','monthly'].includes(String(event && event.repeat || '')); });
  const invalidScheduledHabits = arr(K.habits).filter(function(habit){ return !validScheduleTime(habit && habit.time) || !validScheduleDuration(habit && habit.duration); });
  const invalidCommitments = invalidScheduledTasks.length + invalidScheduledEvents.length + invalidScheduledHabits.length;
  results.push({ name: 'Task / Calendar / Habit schedule schema', ok: invalidCommitments === 0, detail: invalidCommitments ? invalidScheduledTasks.length + ' task · ' + invalidScheduledEvents.length + ' event · ' + invalidScheduledHabits.length + ' habit invalid' : 'Optional times and durations are parseable; flexible records remain valid' });

  const tasks = arr(K.tasks);
  const malformedTasks = tasks.filter(function(task){
    return !task || !task.id || !task.title || Object.prototype.hasOwnProperty.call(task, 'dueDate') ||
      !['high','med','low'].includes(task.priority) || typeof task.completed !== 'boolean' ||
      task.status !== (task.completed ? 'done' : 'pending');
  });
  results.push({ name: 'Canonical task schema', ok: malformedTasks.length === 0, detail: malformedTasks.length ? malformedTasks.length + ' task(s) would disconnect Planner consumers' : tasks.length + ' task(s) share due/priority/completion fields' });

  const goals = arr(K.goals);
  const inconsistentGoals = goals.filter(function(goal){
    const milestones = Array.isArray(goal && goal.milestones) ? goal.milestones : [];
    return milestones.length > 0 && goal.completed !== milestones.every(function(m){ return !!m.done; });
  });
  results.push({ name: 'Goal completion ↔ milestone consistency', ok: inconsistentGoals.length === 0, detail: inconsistentGoals.length ? inconsistentGoals.length + ' goal(s) disagree with their milestones' : goals.length + ' goal(s) produce reliable progress summaries' });

  const timeEntries = arr(K.time);
  const disconnectedStudyTime = timeEntries.filter(function(entry){ return entry && entry.category === 'study' && !LEARN.domains.includes(timeEntryLearningDomain(entry)); });
  results.push({ name: 'Study time ↔ Insights learning axis', ok: disconnectedStudyTime.length === 0, detail: disconnectedStudyTime.length ? disconnectedStudyTime.length + ' study entry/entries are invisible to domain allocation' : timeEntries.filter(function(entry){ return entry && entry.category === 'study'; }).length + ' study entry/entries mapped' });

  try {
    if (window.STORAGE && typeof STORAGE.flush === 'function') await STORAGE.flush();
    const mirrorMismatches = [];
    for (const key of LARGE_STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      const localValue = raw === null ? null : JSON.parse(raw);
      const indexedValue = await STORAGE.readLarge(key);
      if (JSON.stringify(localValue) !== JSON.stringify(indexedValue === undefined ? null : indexedValue)) mirrorMismatches.push(key);
    }
    results.push({ name: 'localStorage ↔ IndexedDB mirror parity', ok: mirrorMismatches.length === 0, detail: mirrorMismatches.length ? ('Out of sync: ' + mirrorMismatches.join(', ')) : LARGE_STORAGE_KEYS.size + ' mirrored collection(s) agree' });
  } catch (e) {
    results.push({ name: 'localStorage ↔ IndexedDB mirror parity', ok: false, detail: 'Threw: ' + e.message });
  }

  // 9) Cross-system integration functions (js/integration.js and friends).
  // These glue separate engines together (operator score, decision review
  // nudges, knowledge graph) but aren't part of the page/route/modal
  // contract in data/contracts.js, so nothing else catches it if one of
  // them silently breaks after a refactor. Existence-check them here.
  const integrationFnChecks = [
    'getOperatorScore', 'getOperatorStreak', 'getSystemStatus',
    'getOverdueDecisionReviews', 'getUnscheduledDecisionReviews', 'getCommunicationScore',
    'getJournalThisWeek', 'getHorizonTaskSuggestions',
    'openKnowledgeGraph', 'buildKnowledgeGraphData',
    'renderSystemStatusCard', 'renderOperatorScoreCard',
    'studyosBuildSearchIndex', 'studyosSearchContent', 'studyosOpenSearchResult',
    'studyosCreateCapture', 'studyosSyncKnowledgeLinks', 'studyosFindBacklinks'
  ];
  integrationFnChecks.forEach(fn => {
    results.push({
      name: `Integration fn ${fn}()`,
      ok: typeof window[fn] === 'function',
      detail: (typeof window[fn] === 'function') ? 'OK' : 'Not found'
    });
  });

  const learnFnChecks = ['getLearningIntegrityIndex', 'getCalibrationComposite', 'getDecisionCalibrationScore', 'getPracticeCalibrationScore', 'getDriftStatus'];
  learnFnChecks.forEach(fn => {
    const ok = (typeof LEARN !== 'undefined') && typeof LEARN[fn] === 'function';
    results.push({ name: `LEARN.${fn}()`, ok, detail: ok ? 'OK' : 'Not found' });
  });

  // 10) Live smoke test: actually call the cross-system entry points rather
  // than just checking they exist — catches a function that exists but
  // throws or returns the wrong shape after an internal change.
  try {
    const status = getSystemStatus();
    const shapeOk = typeof status.score === 'number' && Array.isArray(status.warnings) && typeof status.label === 'string';
    results.push({ name: 'getSystemStatus() smoke test', ok: shapeOk, detail: shapeOk ? `score ${status.score}, ${status.warnings.length} warning(s)` : 'Unexpected return shape' });
  } catch (e) {
    results.push({ name: 'getSystemStatus() smoke test', ok: false, detail: 'Threw: ' + e.message });
  }
  try {
    const streak = getOperatorStreak();
    const ok = typeof streak === 'number' && streak >= 0;
    results.push({ name: 'getOperatorStreak() smoke test', ok, detail: ok ? streak + ' day(s)' : 'Unexpected return value' });
  } catch (e) {
    results.push({ name: 'getOperatorStreak() smoke test', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    if (!window.METRICS || typeof window.METRICS.snapshot !== 'function') throw new Error('METRICS.snapshot missing');
    const snapshot = window.METRICS.snapshot();
    const shapeOk = !!snapshot && typeof snapshot.generatedAt === 'string' && !!snapshot.operator && !!snapshot.learningIntegrity && !!snapshot.systemStatus;
    results.push({ name: 'METRICS.snapshot() execution', ok: shapeOk, detail: shapeOk ? 'Returned operator, learning, strategy, and system metrics' : 'Unexpected snapshot shape' });
  } catch (e) {
    results.push({ name: 'METRICS.snapshot() execution', ok: false, detail: 'Threw: ' + e.message });
  }

  // V28 Find & Connect executable checks. These validate record shape and
  // resolvability without writing to user data.
  try {
    if (typeof studyosBuildSearchIndex !== 'function') throw new Error('studyosBuildSearchIndex missing');
    const index = studyosBuildSearchIndex();
    const keys = index.map(function(item){ return item.key; });
    const unique = new Set(keys);
    const shapeOk = Array.isArray(index) && index.every(function(item){ return !!item.key && !!item.type && !!item.id && !!item.title && !!item.route; });
    results.push({ name: 'Universal search index shape', ok: shapeOk, detail: shapeOk ? index.length + ' live records indexed' : 'One or more records has an invalid search shape' });
    results.push({ name: 'Universal search keys unique', ok: unique.size === keys.length, detail: unique.size === keys.length ? keys.length + ' unique entity keys' : (keys.length - unique.size) + ' duplicate key(s)' });
    const probe = studyosSearchContent('source', 5);
    results.push({ name: 'Universal search execution', ok: Array.isArray(probe) && probe.length <= 5, detail: Array.isArray(probe) ? probe.length + ' ranked probe result(s)' : 'Search did not return an array' });
  } catch (e) {
    results.push({ name: 'Universal search engine', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    const links = arr(K.entityLinks);
    const catalog = typeof studyosBuildSearchIndex === 'function' ? studyosBuildSearchIndex() : [];
    const entityKeys = new Set(catalog.map(function(item){ return item.type + ':' + item.id; }));
    const malformed = links.filter(function(link){ return !link.id || !link.fromType || !link.fromId || !link.toType || !link.toId || !link.relation; });
    const orphaned = links.filter(function(link){ return !entityKeys.has(link.fromType + ':' + link.fromId) || !entityKeys.has(link.toType + ':' + link.toId); });
    const duplicateIds = links.length - new Set(links.map(function(link){ return link.id; })).size;
    results.push({ name: 'Entity-link record schema', ok: malformed.length === 0 && duplicateIds === 0, detail: malformed.length || duplicateIds ? (malformed.length + ' malformed · ' + duplicateIds + ' duplicate') : links.length + ' valid link record(s)' });
    results.push({ name: 'Backlink endpoint integrity', ok: orphaned.length === 0, detail: orphaned.length ? orphaned.length + ' link(s) point to missing records' : 'Every link endpoint resolves' });
  } catch (e) {
    results.push({ name: 'Link integrity engine', ok: false, detail: 'Threw: ' + e.message });
  }

  try {
    const knowledge = arr(K.knowledge);
    const invalidEvidence = knowledge.filter(function(entry){ return entry.evidence !== undefined && (entry.evidence === null || Array.isArray(entry.evidence) || typeof entry.evidence !== 'object'); });
    results.push({ name: 'Knowledge evidence schema', ok: invalidEvidence.length === 0, detail: invalidEvidence.length ? invalidEvidence.length + ' invalid evidence envelope(s)' : knowledge.length + ' knowledge record(s) compatible' });
  } catch (e) {
    results.push({ name: 'Knowledge evidence schema', ok: false, detail: 'Threw: ' + e.message });
  }

  // V29 Practice & Judgment executable checks. The normalizer is the
  // canonical schema boundary, so legacy V26 cases and V29 cases are checked
  // exactly as the user will practice them.
  try {
    if (!window.PRACTICE || typeof window.PRACTICE.validate !== 'function') throw new Error('PRACTICE.validate missing');
    const validation = window.PRACTICE.validate();
    results.push({ name: 'PMP scenario IDs unique', ok: validation.duplicates.length === 0, detail: validation.duplicates.length ? validation.duplicates.length + ' duplicate ID(s)' : validation.scenarioCount + ' stable scenario IDs' });
    results.push({ name: 'PMP scenario schema', ok: validation.malformed.length === 0, detail: validation.malformed.length ? validation.malformed.length + ' malformed normalized case(s)' : 'Question, answer, task, skill, feedback, transfer prompt, module, and sources present' });
    results.push({ name: '2026 ECO task coverage', ok: validation.missingTasks.length === 0, detail: validation.missingTasks.length ? ('Missing: ' + validation.missingTasks.join(', ')) : 'All 26 July 2026 ECO tasks represented' });
    results.push({ name: 'PMP scenario source mappings', ok: validation.unresolvedSources.length === 0, detail: validation.unresolvedSources.length ? validation.unresolvedSources.length + ' unresolved source mapping(s)' : 'Every scenario source chip resolves to the registry' });
    results.push({ name: 'PMP scenario learning mappings', ok: validation.unresolvedModules.length === 0, detail: validation.unresolvedModules.length ? validation.unresolvedModules.length + ' unresolved Learning Path mapping(s)' : 'Every scenario maps to a real PMP module' });
    results.push({ name: 'Weak-skill queue schema', ok: validation.malformedQueue.length === 0, detail: validation.malformedQueue.length ? validation.malformedQueue.length + ' malformed/orphaned queue item(s)' : window.PRACTICE.getQueue().length + ' valid queue item(s)' });
    const calibration = window.PRACTICE.getCalibration([
      { confidence:5, predictedProbability:1, correct:true },
      { confidence:1, predictedProbability:0, correct:false }
    ]);
    results.push({ name: 'Practice calibration execution', ok: calibration.score === 100 && calibration.count === 2, detail: 'Perfect synthetic predictions returned ' + calibration.score + '% across ' + calibration.count + ' observations' });
    const confidenceScale = window.PRACTICE.CONFIDENCE_LEVELS || [];
    const confidenceScaleOk = confidenceScale.length === 5 && window.PRACTICE.confidenceProbability(1) === 0.25 && window.PRACTICE.confidenceProbability(5) === 0.95 && confidenceScale.every(function(item, index){ return index === 0 || item.probability > confidenceScale[index - 1].probability; });
    results.push({ name: 'Practice confidence probability scale', ok: confidenceScaleOk, detail: confidenceScaleOk ? 'Five increasing forecasts bounded at 25–95%' : 'Confidence forecasts are missing, non-monotonic, or falsely absolute' });
    const selection = window.PRACTICE.selectScenario({ mode:'random' });
    results.push({ name: 'Practice sampler execution', ok: !!selection && !!selection.id && !!selection.task && !!selection.skill, detail: selection ? (selection.id + ' · ' + selection.task) : 'No scenario returned' });
  } catch (e) {
    results.push({ name: 'Practice & Judgment engine', ok: false, detail: 'Threw: ' + e.message });
  }

  // Semantic fault injection proves the queue validator catches an orphaned
  // skill and that the exact prior queue is restored before diagnostics exits.
  if (K.practiceQueue && window.PRACTICE) {
    const queueBefore = localStorage.getItem(K.practiceQueue);
    let queueFaultCaught = false;
    try {
      const fixtureQueue = arr(K.practiceQueue).slice();
      fixtureQueue.push({ id:'diagnostics-orphan', skillKey:'not-a-real-skill', dueDate:today() });
      localStorage.setItem(K.practiceQueue, JSON.stringify(fixtureQueue));
      queueFaultCaught = window.PRACTICE.validate().malformedQueue.some(function(item){ return item.id === 'diagnostics-orphan'; });
    } finally {
      if (queueBefore === null) localStorage.removeItem(K.practiceQueue);
      else localStorage.setItem(K.practiceQueue, queueBefore);
    }
    results.push({ name: 'Fault injection: orphaned practice queue detected', ok: queueFaultCaught, detail: queueFaultCaught ? 'Detector failed red; exact prior queue restored' : 'Detector did not catch the orphaned skill' });
  }

  const contractIssues = runContractAudit();
  results.push({ name: 'Runtime contract audit', ok: contractIssues.length === 0, detail: contractIssues.length ? contractIssues.length + ' missing/duplicate/nesting issue(s)' : 'Required IDs, functions, and structure verified' });

  // Fault injection: add a disposable duplicate of a required shell ID and
  // verify the same contract engine catches it.
  let contractFaultCaught = false;
  const duplicateProbe = document.createElement('div');
  duplicateProbe.id = 'pageContainer';
  duplicateProbe.hidden = true;
  document.body.appendChild(duplicateProbe);
  try {
    contractFaultCaught = runContractAudit().some(function(issue){ return issue.type === 'duplicate_id' && issue.id === 'pageContainer'; });
  } finally {
    duplicateProbe.remove();
  }
  results.push({ name: 'Fault injection: duplicate contract ID detected', ok: contractFaultCaught, detail: contractFaultCaught ? 'Detector failed red; disposable duplicate removed' : 'Detector did not catch injected duplicate ID' });

  const okCount = results.filter(r => r.ok).length;
  const total = results.length;
  const failures = results.filter(r => !r.ok);
  const passes = results.filter(r => r.ok);

  const reportHtml = `
    <div class="card diagnostics-report" style="margin-top:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:800;">Health: ${okCount}/${total} checks passed</div>
          <div style="color:var(--text-muted);margin-top:4px;">Completed ${diagnosticsRunStamp()} · failures stay visible until the next run.</div>
        </div>
        <div class="badge ${okCount===total?'badge-good':'badge-warn'}">${okCount===total?'STABLE':'ATTENTION'}</div>
      </div>
      ${failures.length ? `<div class="diagnostics-failure-block"><strong>Needs attention</strong>${diagnosticsRenderRows(failures)}</div>` : '<div class="diagnostics-clear-note">No failures detected. Passing evidence is available below.</div>'}
      <details class="diagnostics-pass-details">
        <summary>${passes.length} passing checks <span>View evidence</span></summary>
        <div class="diagnostics-row-grid">${diagnosticsRenderRows(passes)}</div>
      </details>
    </div>
  `;
  diagnosticsPublishReport('diagResults', reportHtml);
  diagnosticsRunContractAudit();
  return results;
}

// diagnosticsEscape() below falls back through esc() (js/core.js, shared
// HTML-escaping helper) — framework-lab.js's separate escapeHtml() was
// dedup'd away in V32, so this is now a plain fallback, not a live branch.



function diagnosticsRunContractAudit(){
  const issues = runContractAudit();
  if(!issues.length){
    diagnosticsPublishReport('contractAuditBox', '<div class="card diagnostics-contract"><div><span class="badge badge-good">CONTRACT PASS</span><strong>Runtime structure is intact</strong></div><p>No missing required IDs/functions, duplicate IDs, or nested pages detected.</p></div>');
    return issues;
  }
  const rows = issues.map(i=>{
    if(i.type==='missing_id') return `<div class="list-item"><div class="list-item-content"><div class="list-item-title">Missing ID</div><div class="muted">#${diagnosticsEscape(i.id)}</div></div></div>`;
    if(i.type==='missing_fn') return `<div class="list-item"><div class="list-item-content"><div class="list-item-title">Missing function</div><div class="muted">${diagnosticsEscape(i.fn)}()</div></div></div>`;
    if(i.type==='duplicate_id') return `<div class="list-item"><div class="list-item-content"><div class="list-item-title">Duplicate ID</div><div class="muted">#${diagnosticsEscape(i.id)} (${i.count}x)</div></div></div>`;
    if(i.type==='nested_page') return `<div class="list-item"><div class="list-item-content"><div class="list-item-title">Nested .page</div><div class="muted">${diagnosticsEscape(i.id)}</div></div></div>`;
    return `<div class="list-item"><div class="list-item-content"><div class="list-item-title">Issue</div><div class="muted">${diagnosticsEscape(JSON.stringify(i))}</div></div></div>`;
  }).join('');
  diagnosticsPublishReport('contractAuditBox', `<div class="card diagnostics-contract failed">
    <div class="badge badge-warn">CONTRACT FAIL</div>
    <div style="margin-top:10px" class="list">${rows}</div>
  </div>`);
  return issues;
}


function diagnosticsEscape(s){
  if (typeof escapeHtml === 'function') return escapeHtml(String(s));
  if (typeof esc === 'function') return esc(String(s));
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function diagnosticsRenderRows(rows){
  if (!rows || !rows.length) return '<div class="diagnostics-empty">No checks in this section.</div>';
  return rows.map(function(row){
    var title = row.name || row.title || 'Diagnostic check';
    return `
      <div class="diagnostics-result-row ${row.ok ? 'is-pass' : 'is-fail'}">
        <div>
          <div class="diagnostics-result-title">${diagnosticsEscape(title)}</div>
          <div class="diagnostics-result-detail">${diagnosticsEscape(row.detail || '')}</div>
        </div>
        <div class="badge ${row.ok ? 'badge-good' : 'badge-warn'}">${row.ok ? 'OK' : 'FAIL'}</div>
      </div>
    `;
  }).join('');
}

function diagnosticsShortLabel(el){
  if (!el) return '(unknown)';
  const tag = (el.tagName || 'node').toLowerCase();
  const id = el.id ? '#' + el.id : '';
  const cls = el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.')
    : '';
  const txt = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().replace(/\s+/g,' ').slice(0,50);
  return (tag + id + cls + (txt ? ' · ' + txt : '')).trim();
}

function diagnosticsParseAction(action){
  let text = String(action || '').trim().replace(/;\s*$/, '');
  const out = { raw: text, type: 'unknown' };
  if (!text) return out;

  if (text.indexOf('return ') === 0) text = text.slice(7).trim();

  // Compound actions like: x='a';renderX()
  if (text.indexOf(';') !== -1) {
    const parts = text.split(';').map(function(x){ return x.trim(); }).filter(Boolean);
    const last = parts.length ? parts[parts.length - 1] : '';
    const parsedLast = diagnosticsParseAction(last);
    if (parsedLast.type !== 'unknown') return parsedLast;
    const nonAssign = parts.find(function(part){ return !/^[-\w$.\[\]'"\s]+\s*=/.test(part); });
    if (nonAssign) {
      const parsedAny = diagnosticsParseAction(nonAssign);
      if (parsedAny.type !== 'unknown') return parsedAny;
    }
    return { raw: text, type: 'assignment' };
  }

  // Conditional wrappers: if (event.target===this) closeModal('x')
  let m = text.match(/^if\s*\((.*)\)\s*(.*)$/);
  if (m) {
    const remainder = String(m[2] || '').trim().replace(/^\{/, '').replace(/\}$/, '').trim();
    if (remainder) return diagnosticsParseAction(remainder);
    return { raw: text, type: 'conditional' };
  }

  m = text.match(/^go\('([^']+)'\)$/);
  if (m) return { raw: text, type: 'go', target: m[1] };
  m = text.match(/^goTab\('([^']+)'\s*,\s*'([^']+)'\)$/);
  if (m) return { raw: text, type: 'goTab', page: m[1], tab: m[2] };
  m = text.match(/^document\.getElementById\('([^']+)'\)\.click\(\)$/);
  if (m) return { raw: text, type: 'domclick', id: m[1] };
  m = text.match(/^document\.getElementById\('([^']+)'\)\.([A-Za-z_$][\w$]*)\s*=\s*(.*)$/);
  if (m) return { raw: text, type: 'domset', id: m[1], prop: m[2], value: m[3] };
  m = text.match(/^([A-Za-z_$][\w$]*)\((.*)\)$/);
  if (m) return { raw: text, type: 'fn', fn: m[1], args: m[2] };
  if (/^[-\w$.\[\]'"\s]+\s*=/.test(text)) return { raw: text, type: 'assignment' };
  return out;
}

function diagnosticsReadInlineAction(el){
  if (!el) return '';
  const onclick = el.getAttribute && el.getAttribute('onclick');
  if (onclick) return onclick.trim().replace(/;$/, '');
  // data-action (js/action-registry.js, V25) is a second, delegated way to
  // wire a click. Synthesize the equivalent plain function-call string below
  // so every check further down (function-exists, go/goTab routing, etc.)
  // treats a data-action button exactly like an inline-handler one, instead
  // of reporting a false "no action" for it.
  const dataAction = el.getAttribute && el.getAttribute('data-action');
  if (dataAction) {
    const arg = el.getAttribute('data-action-arg');
    const arg2 = el.getAttribute('data-action-arg2');
    const args = [arg, arg2]
      .filter(function(a){ return a !== null; })
      .map(function(a){ return "'" + String(a).replace(/'/g, "\\'") + "'"; });
    return dataAction.trim() + '(' + args.join(', ') + ')';
  }
  const diag = el.getAttribute && el.getAttribute('data-diag-action');
  if (diag) return diag.trim().replace(/;$/, '');
  const href = el.getAttribute && el.getAttribute('href');
  if (href) return 'href:' + href.trim();
  return '';
}

function diagnosticsIsHidden(el){
  if (!el || !el.closest) return false;
  if (el.closest('template')) return true;
  if (el.closest('.modal') && !el.closest('.modal.open')) return true;
  if (el.hidden) return true;
  const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
  // Hidden pages and tab panels still contain real static controls and must be
  // audited. Only skip computed-hidden controls outside those routed shells.
  const routedShell = el.closest('.page, .tab-panel');
  if (!routedShell && style && (style.display === 'none' || style.visibility === 'hidden')) return true;
  return false;
}

function runInteractionAudit(){
  diagnosticsPublishReport('diagInteractionResults', '<div class="card diagnostics-running">Auditing routes, tabs, controls, and cooperation bridges…</div>');

  const findings = [];
  const push = function(kind, ok, title, detail){
    findings.push({ kind: kind, ok: !!ok, title: title, detail: detail || '' });
  };

  const pageContainer = document.getElementById('pageContainer');
  const pageIds = new Set(Array.from(document.querySelectorAll('.page')).map(function(el){ return el.id; }).filter(Boolean));
  const tabsByPage = {};
  pageIds.forEach(function(pageId){
    const pageEl = document.getElementById(pageId);
    tabsByPage[pageId] = new Set(Array.from(pageEl ? pageEl.querySelectorAll('.tab-panel[id^="tab-"]') : []).map(function(el){ return el.id.replace(/^tab-/, ''); }));
  });

  // 1) Route map integrity
  if (window.PAGE_MAP) {
    Object.keys(window.PAGE_MAP).forEach(function(key){
      const mapping = window.PAGE_MAP[key] || {};
      const pageOk = !!mapping.page && pageIds.has(mapping.page);
      push('route', pageOk, 'Route ' + key + ' → page', pageOk ? ('#' + mapping.page) : ('Missing page #' + (mapping.page || '(none)')));
      if (mapping.tab) {
        const tabOk = pageOk && tabsByPage[mapping.page] && tabsByPage[mapping.page].has(mapping.tab);
        push('route', tabOk, 'Route ' + key + ' → tab', tabOk ? ('#tab-' + mapping.tab) : ('Missing tab #' + mapping.tab + ' on #' + mapping.page));
      }
    });
  } else {
    push('route', false, 'PAGE_MAP available', 'PAGE_MAP missing');
  }

  // 2) Tab buttons to panels
  Object.keys(tabsByPage).forEach(function(pageId){
    const pageEl = document.getElementById(pageId);
    const tabBar = document.getElementById(pageId + 'Tabs');
    if (!tabBar) return;
    const buttons = Array.from(tabBar.querySelectorAll('.filter-btn[onclick]'));
    const buttonTargets = new Set();
    buttons.forEach(function(btn){
      const parsed = diagnosticsParseAction((btn.getAttribute('onclick') || '').trim().replace(/;$/, ''));
      if (parsed.type === 'goTab') buttonTargets.add(parsed.tab);
    });
    tabsByPage[pageId].forEach(function(tab){
      const ok = buttonTargets.has(tab);
      push('tab', ok, 'Tab button for ' + pageId + '/' + tab, ok ? 'Button present' : 'Missing matching tab button');
    });
    buttonTargets.forEach(function(tab){
      const ok = tabsByPage[pageId].has(tab);
      push('tab', ok, 'Tab panel for ' + pageId + '/' + tab, ok ? 'Panel present' : 'Button points to missing panel');
    });
  });

  // 3) Inline clickable controls and hrefs
  const interactive = Array.from(document.querySelectorAll('[onclick], [data-action], [data-diag-action], a[href], button, .btn, .nav-link, [role="button"], .is-clickable'));
  const seen = new Set();
  interactive.forEach(function(el){
    if (!pageContainer && el.closest && el.closest('template')) return;
    if (diagnosticsIsHidden(el)) return;
    const key = diagnosticsShortLabel(el) + '|' + diagnosticsReadInlineAction(el);
    if (seen.has(key)) return;
    seen.add(key);

    const action = diagnosticsReadInlineAction(el);
    const label = diagnosticsShortLabel(el);

    if (!action) {
      const hasHref = el.tagName === 'A' && !!el.getAttribute('href');
      // Some controls are wired by assigning el.onclick = fn in JS (a DOM
      // property) after rendering, rather than any attribute this function
      // can read with getAttribute() — e.g. js/doctrine/doctrine-builder.js's
      // per-source Build/Open buttons. getAttribute('onclick') is always
      // null for these even though the button genuinely works, so check the
      // live property too before calling a control dead.
      const hasPropertyHandler = typeof el.onclick === 'function';
      const likelyPassive = el.tagName !== 'BUTTON' && !el.classList.contains('btn') && !el.classList.contains('nav-link');
      if (!hasHref && !hasPropertyHandler && !likelyPassive) {
        push('control', false, 'Interactive control has no action', label);
      }
      return;
    }

    if (action.indexOf('href:') === 0) {
      const href = action.slice(5);
      if (href.indexOf('#') === 0) {
        const id = href.slice(1);
        push('control', !!document.getElementById(id), 'Anchor target ' + href, document.getElementById(id) ? 'Target exists' : ('Missing target #' + id));
      } else {
        let ok = true;
        try { new URL(href, window.location.href); } catch(e) { ok = false; }
        push('control', ok, 'Link URL ' + href, ok ? 'URL syntax valid' : 'Invalid URL');
      }
      return;
    }

    const parsed = diagnosticsParseAction(action);
    if (parsed.type === 'go') {
      const ok = !!window.PAGE_MAP && !!window.PAGE_MAP[parsed.target];
      const map = ok ? window.PAGE_MAP[parsed.target] : null;
      const pageOk = map && map.page && pageIds.has(map.page);
      push('control', ok && pageOk, 'go(\'' + parsed.target + '\')', pageOk ? ('Resolves to #' + map.page + (map.tab ? ' / tab-' + map.tab : '')) : 'Broken route target');
      return;
    }
    if (parsed.type === 'goTab') {
      const pageOk = pageIds.has(parsed.page);
      const tabOk = pageOk && tabsByPage[parsed.page] && tabsByPage[parsed.page].has(parsed.tab);
      push('control', pageOk && tabOk, 'goTab(\'' + parsed.page + '\', \' ' + parsed.tab + '\')'.replace("\\' ", "\\'"), tabOk ? 'Page/tab exists' : 'Broken page/tab wiring');
      return;
    }
    if (parsed.type === 'fn') {
      const fnOk = typeof window[parsed.fn] === 'function';
      push('control', fnOk, parsed.fn + '()', fnOk ? 'Function available' : ('Missing function for ' + label));
      return;
    }
    if (parsed.type === 'domclick') {
      const target = document.getElementById(parsed.id);
      push('control', !!target, "document.getElementById('" + parsed.id + "').click()", target ? 'Target exists' : ('Missing target #' + parsed.id));
      return;
    }
    if (parsed.type === 'domset') {
      const target = document.getElementById(parsed.id);
      push('control', !!target, "document.getElementById('" + parsed.id + "')." + parsed.prop + ' = …', target ? 'Target exists' : ('Missing target #' + parsed.id));
      return;
    }
    if (parsed.type === 'assignment' || parsed.type === 'conditional') {
      push('control', true, 'Compound or conditional action', label + ' → ' + action);
      return;
    }

    push('control', false, 'Unparsed action', label + ' → ' + action);
  });

  // 4) Cross-page core cooperation checks
  const cooperationChecks = [
    { name: 'Dashboard quick journal → journal save', ok: typeof window.dashSaveQuickJournal === 'function' && typeof window.saveJournal === 'function', detail: (typeof window.dashSaveQuickJournal === 'function' && typeof window.saveJournal === 'function') ? 'Functions available' : 'Missing dashboard/journal bridge' },
    { name: 'Doctrine → flashcards bridge', ok: typeof window.doctrineCreateFlashcardPack === 'function' && (typeof window.createFlashcardPack === 'function' || typeof window.openFlashcardModal === 'function'), detail: (typeof window.doctrineCreateFlashcardPack === 'function' && (typeof window.createFlashcardPack === 'function' || typeof window.openFlashcardModal === 'function')) ? 'Doctrine can build flashcards' : 'Missing doctrine/flashcards bridge' },
    { name: 'Doctrine source workspace actions', ok: (typeof window.doctrineBuilderBuildFromSelectedSource === 'function' || typeof window.doctrineBuilderBuildSelectedSource === 'function') && (typeof window.doctrineBuilderOpenSelectedSourceRegistryEntry === 'function' || typeof window.doctrineBuilderOpenSelectedSource === 'function'), detail: ((typeof window.doctrineBuilderBuildFromSelectedSource === 'function' || typeof window.doctrineBuilderBuildSelectedSource === 'function') && (typeof window.doctrineBuilderOpenSelectedSourceRegistryEntry === 'function' || typeof window.doctrineBuilderOpenSelectedSource === 'function')) ? 'Builder/source actions exported' : 'Missing source workspace actions' },
    { name: 'Focus mode execution loop', ok: typeof window.startFocusMode === 'function' && typeof window.completeFocusMode === 'function', detail: (typeof window.startFocusMode === 'function' && typeof window.completeFocusMode === 'function') ? 'Start/complete loop present' : 'Focus loop incomplete' },
    { name: 'Metrics → dashboard', ok: !!window.METRICS && typeof window.refreshDashboard === 'function', detail: (!!window.METRICS && typeof window.refreshDashboard === 'function') ? 'Dashboard can consume metrics' : 'Missing metrics/dashboard integration' },
    { name: 'Event bus available', ok: !!window.EVENTS && typeof window.EVENTS.emit === 'function' && typeof window.EVENTS.on === 'function', detail: (!!window.EVENTS && typeof window.EVENTS.emit === 'function' && typeof window.EVENTS.on === 'function') ? 'EVENTS bus ready' : 'Missing EVENTS bus' },
    { name: 'Capture → knowledge bridge', ok: typeof window.studyosCreateCapture === 'function' && typeof window.captureToKnowledge === 'function' && typeof window.studyosSyncKnowledgeLinks === 'function', detail: (typeof window.studyosCreateCapture === 'function' && typeof window.captureToKnowledge === 'function' && typeof window.studyosSyncKnowledgeLinks === 'function') ? 'Capture can become connected knowledge' : 'Missing capture/knowledge/link bridge' },
    { name: 'Science Coach → Focus/Task bridge', ok: typeof window.scienceStartFocus === 'function' && typeof window.scienceSaveCycle === 'function' && typeof window.normalizeTaskRecord === 'function', detail: (typeof window.scienceStartFocus === 'function' && typeof window.scienceSaveCycle === 'function' && typeof window.normalizeTaskRecord === 'function') ? 'Learning Cycles can launch Focus and schedule canonical Tasks' : 'Missing Science Coach connection' },
    { name: 'Universal search → entity open', ok: typeof window.studyosSearchContent === 'function' && typeof window.studyosOpenSearchResult === 'function', detail: (typeof window.studyosSearchContent === 'function' && typeof window.studyosOpenSearchResult === 'function') ? 'Live records can be ranked and opened' : 'Missing search/open bridge' },
    { name: 'Profile feedback → contextual prompts', ok: !!window.PROFILE && typeof window.profileRecordFeedback === 'function' && typeof window.profileIsHypothesisEnabled === 'function' && typeof window.refreshDashboard === 'function', detail: (!!window.PROFILE && typeof window.profileRecordFeedback === 'function' && typeof window.profileIsHypothesisEnabled === 'function' && typeof window.refreshDashboard === 'function') ? 'Feedback can enable/disable profile-informed prompts and refresh their surfaces' : 'Missing adaptive-profile feedback bridge' },
    { name: 'Decision editor → two-sided guardrail', ok: typeof window.renderDecisionGuardrail === 'function' && typeof window.evaluateDecisionGuardrail === 'function' && typeof window.saveDecision === 'function', detail: (typeof window.renderDecisionGuardrail === 'function' && typeof window.evaluateDecisionGuardrail === 'function' && typeof window.saveDecision === 'function') ? 'Live advice and saved decision process share one evaluator' : 'Missing decision guardrail bridge' },
    { name: 'Quality review → Planner verification', ok: typeof window.saveQualityReview === 'function' && typeof window.normalizeTaskRecord === 'function' && typeof window.renderQualityLoop === 'function', detail: (typeof window.saveQualityReview === 'function' && typeof window.normalizeTaskRecord === 'function' && typeof window.renderQualityLoop === 'function') ? 'Preventive controls can create canonical Planner tasks and refresh Journal' : 'Missing quality/task bridge' },
    { name: 'Communication practice → Execution insight', ok: typeof window.toggleCommQualityBehavior === 'function' && typeof window.setCommOutcome === 'function' && typeof window.renderExecutionInsight === 'function', detail: (typeof window.toggleCommQualityBehavior === 'function' && typeof window.setCommOutcome === 'function' && typeof window.renderExecutionInsight === 'function') ? 'Receiver-side behaviors and outcomes can reach execution analytics' : 'Missing communication/insights bridge' }
  ];
  cooperationChecks.forEach(function(item){ push('cooperation', item.ok, item.name, item.detail); });

  const okCount = findings.filter(function(r){ return r.ok; }).length;
  const total = findings.length;
  const failCount = total - okCount;
  const groups = {
    route: findings.filter(function(r){ return r.kind === 'route'; }),
    tab: findings.filter(function(r){ return r.kind === 'tab'; }),
    control: findings.filter(function(r){ return r.kind === 'control'; }),
    cooperation: findings.filter(function(r){ return r.kind === 'cooperation'; })
  };
  const failures = findings.filter(function(r){ return !r.ok; });
  const passes = findings.filter(function(r){ return r.ok; });

  function renderRows(rows){
    return rows.map(function(r){
      return `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);">
          <div>
            <div style="font-weight:700;">${diagnosticsEscape(r.title)}</div>
            <div style="color:var(--text-muted);font-size:0.9rem;margin-top:2px;">${diagnosticsEscape(r.detail)}</div>
          </div>
          <div class="badge ${r.ok ? 'badge-good' : 'badge-warn'}">${r.ok ? 'OK' : 'FAIL'}</div>
        </div>
      `;
    }).join('');
  }

  const reportHtml = `
    <div class="card diagnostics-report" style="margin-top:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-weight:800;">Interaction Audit: ${okCount}/${total} checks passed</div>
          <div style="color:var(--text-muted);margin-top:4px;">Completed ${diagnosticsRunStamp()} · checks routed and currently hidden page controls.</div>
        </div>
        <div class="badge ${failCount === 0 ? 'badge-good' : 'badge-warn'}">${failCount === 0 ? 'CONNECTED' : (failCount + ' ISSUES')}</div>
      </div>
      ${failures.length ? `<div class="diagnostics-failure-block"><strong>Needs attention</strong>${renderRows(failures)}</div>` : '<div class="diagnostics-clear-note">Every route, tab, click target, and cross-system bridge is connected.</div>'}
      <details class="diagnostics-pass-details">
        <summary>${passes.length} passing interaction checks <span>View evidence</span></summary>
        <div class="diagnostics-row-grid">${renderRows(passes)}</div>
      </details>
    </div>
  `;
  diagnosticsPublishReport('diagInteractionResults', reportHtml);
  return findings;
}


function diagnosticsWait(ms){
  return new Promise(function(resolve){ setTimeout(resolve, ms || 0); });
}

async function diagnosticsSettleUI(){
  await diagnosticsWait(0);
  await new Promise(function(resolve){
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function(){ requestAnimationFrame(resolve); });
    } else {
      setTimeout(resolve, 16);
    }
  });
}

function diagnosticsGetActivePageId(){
  var active = document.querySelector('.page.active');
  return active ? active.id : null;
}

function diagnosticsGetVisibleTabId(pageId){
  var pageEl = pageId ? document.getElementById(pageId) : null;
  if (!pageEl) return null;
  var panels = Array.from(pageEl.querySelectorAll('.tab-panel[id^="tab-"]'));
  for (var i = 0; i < panels.length; i++) {
    var panel = panels[i];
    var hidden = panel.style.display === 'none' || panel.hidden || panel.getAttribute('aria-hidden') === 'true';
    if (!hidden) return panel.id.replace(/^tab-/, '');
  }
  return null;
}

function diagnosticsCollectPageTabs(){
  var pageIds = Array.from(document.querySelectorAll('.page')).map(function(el){ return el.id; }).filter(Boolean);
  var tabsByPage = {};
  pageIds.forEach(function(pageId){
    var pageEl = document.getElementById(pageId);
    tabsByPage[pageId] = Array.from(pageEl ? pageEl.querySelectorAll('.tab-panel[id^="tab-"]') : []).map(function(el){ return el.id.replace(/^tab-/, ''); });
  });
  return { pageIds: pageIds, tabsByPage: tabsByPage };
}

function diagnosticsClone(value){
  try { return JSON.parse(JSON.stringify(value)); } catch(e) { return value; }
}

async function diagnosticsSnapshotStorage(keys){
  var snapshot = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    snapshot[key] = {
      exists: localStorage.getItem(key) !== null,
      raw: localStorage.getItem(key)
    };
    if (window.STORAGE && typeof window.STORAGE.readLarge === 'function') {
      try {
        snapshot[key].indexedValue = await window.STORAGE.readLarge(key);
      } catch (e) {
        snapshot[key].indexedValue = null;
      }
    }
  }
  return snapshot;
}

async function diagnosticsRestoreStorage(snapshot){
  var keys = Object.keys(snapshot || {});
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var row = snapshot[key] || {};
    if (row.exists) {
      localStorage.setItem(key, row.raw);
    } else {
      localStorage.removeItem(key);
    }
    if (window.STORAGE && typeof window.STORAGE.writeLarge === 'function' && typeof window.STORAGE.deleteLarge === 'function') {
      if (row.indexedValue === null || row.indexedValue === undefined) {
        await window.STORAGE.deleteLarge(key);
      } else {
        await window.STORAGE.writeLarge(key, row.indexedValue);
      }
    }
  }
}

async function diagnosticsVerifyStorageSnapshot(snapshot){
  var mismatches = [];
  var keys = Object.keys(snapshot || {});
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var row = snapshot[key] || {};
    var currentRaw = localStorage.getItem(key);
    if ((row.exists ? row.raw : null) !== currentRaw) mismatches.push(key + ' localStorage');
    if (window.STORAGE && typeof window.STORAGE.readLarge === 'function') {
      try {
        var currentIndexed = await window.STORAGE.readLarge(key);
        if (JSON.stringify(currentIndexed === undefined ? null : currentIndexed) !== JSON.stringify(row.indexedValue === undefined ? null : row.indexedValue)) {
          mismatches.push(key + ' IndexedDB');
        }
      } catch (e) {
        mismatches.push(key + ' IndexedDB read');
      }
    }
  }
  return { ok: mismatches.length === 0, mismatches: mismatches };
}

async function diagnosticsWithGuardedFixture(keys, runner){
  var snapshot = await diagnosticsSnapshotStorage(keys);
  var result;
  var runError = null;
  try {
    result = await runner();
  } catch (e) {
    runError = e;
  } finally {
    // Flush debounced cross-system listeners (for example the V28 backlink
    // rebuild scheduled after a fixture flashcard/capture write) before the
    // snapshot is restored. Restoring first allowed a pending timer to mutate
    // the just-restored data and made guarded diagnostics report a false
    // restoration failure.
    await diagnosticsWait(80);
    await diagnosticsSettleUI();
    await diagnosticsRestoreStorage(snapshot);
    try { if (typeof renderJournal === 'function') renderJournal(); } catch(e) {}
    try { if (typeof renderFlashcards === 'function') renderFlashcards(); } catch(e) {}
    try { if (typeof renderScienceCoach === 'function') renderScienceCoach(); } catch(e) {}
    try { if (typeof renderFrameworkLab === 'function') renderFrameworkLab(); } catch(e) {}
    try { if (typeof renderDoctrine === 'function') renderDoctrine(); } catch(e) {}
    try { if (typeof renderCaptureInbox === 'function') renderCaptureInbox(); } catch(e) {}
    try { if (typeof renderPmpTools === 'function') renderPmpTools(); } catch(e) {}
    try { if (typeof renderLearn === 'function') renderLearn(); } catch(e) {}
    try { if (typeof refreshDashboard === 'function') refreshDashboard(); } catch(e) {}
    try { if (typeof renderSystemHealth === 'function') renderSystemHealth(); } catch(e) {}
    await diagnosticsSettleUI();
  }
  var restoration = await diagnosticsVerifyStorageSnapshot(snapshot);
  if (runError) throw runError;
  return { result: result, restoration: restoration };
}

function diagnosticsRenderMutationRows(rows){
  if (!rows.length) return '<div style="color:var(--text-muted);">No items in this section.</div>';
  return rows.map(function(r){
    return `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);">
        <div>
          <div style="font-weight:700;">${diagnosticsEscape(r.title)}</div>
          <div style="color:var(--text-muted);font-size:0.9rem;margin-top:2px;">${diagnosticsEscape(r.detail)}</div>
        </div>
        <div class="badge ${r.ok ? 'badge-good' : 'badge-warn'}">${r.ok ? 'OK' : 'FAIL'}</div>
      </div>
    `;
  }).join('');
}

async function runGuardedMutationTestMode(){
  diagnosticsPublishReport('diagMutationTestResults', '<div class="card diagnostics-running">Running guarded fixture workflows and preparing exact data restoration…</div>');

  var findings = [];
  function push(kind, ok, title, detail){ findings.push({ kind: kind, ok: !!ok, title: title, detail: detail || '' }); }

  var originalPage = diagnosticsGetActivePageId() || 'dashboard';
  var originalTab = diagnosticsGetVisibleTabId(originalPage);
  var capturedErrors = [];

  function onError(ev){
    var msg = ev && (ev.message || (ev.error && ev.error.message)) || 'Unknown runtime error';
    capturedErrors.push({ type: 'error', message: String(msg) });
  }
  function onUnhandled(ev){
    var reason = ev && ev.reason;
    var msg = reason && reason.message ? reason.message : String(reason || 'Unhandled promise rejection');
    capturedErrors.push({ type: 'rejection', message: msg });
  }

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onUnhandled);

  try {
    // 1) Doctrine Builder open/render with source fixture
    var doctrineFixture = await diagnosticsWithGuardedFixture([K.doctrineCustomModules, K.doctrineSourcesState, K.doctrineLinks], async function(){
      try {
        if (typeof go === 'function') go('doctrine');
        if (typeof doctrineSetView === 'function') doctrineSetView('builder');
        if (typeof renderDoctrine === 'function') renderDoctrine();
        await diagnosticsSettleUI();

        var sources = typeof doctrineBaseSources === 'function' ? doctrineBaseSources() : [];
        if (!sources.length) throw new Error('No doctrine sources available');
        var sourceId = sources[0].id;
        var select = document.getElementById('builderSourceSelect');
        if (!select) throw new Error('Builder source select missing');
        select.value = sourceId;
        if (typeof doctrineBuilderSelectSource === 'function') doctrineBuilderSelectSource();
        await diagnosticsSettleUI();

        var workspace = document.getElementById('builderWorkspace');
        var buildBtn = document.getElementById('builderBuildFromSourceBtn');
        var openBtn = document.getElementById('builderOpenSourceBtn');
        push('workflow', !!workspace && !!buildBtn && !!openBtn, 'Doctrine builder source workspace', (!!workspace && !!buildBtn && !!openBtn) ? ('Workspace rendered for source ' + sourceId) : 'Workspace controls missing');

        if (typeof doctrineBuilderBuildFromSelectedSource === 'function') doctrineBuilderBuildFromSelectedSource(sourceId);
        await diagnosticsSettleUI();
        var titleEl = document.getElementById('doctrineModalTitle');
        var idInput = document.getElementById('dm_id');
        push('workflow', !!idInput, 'Doctrine builder module modal', !!idInput ? ((titleEl && titleEl.textContent) || 'New Doctrine Module') : 'Module builder did not open');
        try { if (typeof closeModal === 'function') closeModal('doctrineModal'); } catch(e) {}
        await diagnosticsSettleUI();

        if (typeof doctrineOpenLinkBuilder === 'function') doctrineOpenLinkBuilder();
        await diagnosticsSettleUI();
        var fromSelect = document.getElementById('lk_from_mod');
        push('workflow', !!fromSelect, 'Doctrine link builder modal', !!fromSelect ? 'Link builder opened' : 'Link builder did not open');
        try { if (typeof closeModal === 'function') closeModal('doctrineModal'); } catch(e) {}
        await diagnosticsSettleUI();
      } catch (e) {
        push('workflow', false, 'Doctrine builder open/render workflow', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', doctrineFixture.restoration.ok, 'Doctrine fixture data restoration', doctrineFixture.restoration.ok ? 'Exact localStorage/IndexedDB snapshot restored' : doctrineFixture.restoration.mismatches.join(', '));

    // 2) Flashcard pack creation path with fixture
    var flashcardFixture = await diagnosticsWithGuardedFixture([K.flashcards], async function(){
      try {
        if (typeof go === 'function') go('doctrine');
        await diagnosticsSettleUI();
        var mods = typeof doctrineAllModules === 'function' ? doctrineAllModules() : [];
        if (!mods.length) throw new Error('No doctrine modules available');
        var mod = mods[0];
        var before = arr(K.flashcards).length;
        if (typeof doctrineCreateFlashcardPack !== 'function') throw new Error('doctrineCreateFlashcardPack missing');
        doctrineCreateFlashcardPack(mod.id);
        await diagnosticsSettleUI();
        var topic = document.getElementById('fcTopic');
        var prompts = document.getElementById('fcPrompts');
        var primary = document.getElementById('doctrineModalPrimary');
        if (!topic || !prompts || !primary) throw new Error('Flashcard pack modal controls missing');
        topic.value = 'Diagnostics Fixture';
        prompts.value = 'Explain the operating model\nDescribe the primary failure mode';
        if (typeof primary.onclick === 'function') primary.onclick();
        else primary.click();
        await diagnosticsSettleUI();
        var after = arr(K.flashcards).length;
        push('mutation', after === before + 2, 'Flashcard pack creation path', after === before + 2 ? 'Created 2 fixture flashcards and restored after test' : ('Expected ' + (before + 2) + ', saw ' + after));
      } catch (e) {
        push('mutation', false, 'Flashcard pack creation path', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', flashcardFixture.restoration.ok, 'Flashcard fixture data restoration', flashcardFixture.restoration.ok ? 'Exact storage snapshot restored' : flashcardFixture.restoration.mismatches.join(', '));

    // V30) Focused Flashcards queue → confidence/rating → adaptive persistence.
    var srsFixture = await diagnosticsWithGuardedFixture([K.flashcards, K.cardReviews, K.cardReviewDetails], async function(){
      var priorMode = srsMode;
      var priorCategory = srsFocusedCategory;
      try {
        set(K.flashcards, [
          { id:'diag-srs-a1', question:'Alpha one?', answer:'A1', category:'alpha', reviews:0, nextReview:today(), interval:0, easeFactor:2.5 },
          { id:'diag-srs-a2', question:'Alpha two?', answer:'A2', category:'alpha', reviews:0, nextReview:today(), interval:0, easeFactor:2.5 },
          { id:'diag-srs-b1', question:'Beta one?', answer:'B1', category:'beta', reviews:0, nextReview:today(), interval:0, easeFactor:2.5 }
        ]);
        set(K.cardReviews, {});
        set(K.cardReviewDetails, []);
        if (typeof go === 'function') go('flashcards');
        await diagnosticsSettleUI();
        setSRSMode('focused');
        setSRSFocusedCategory('alpha');
        startSRSReview();
        var focusedOk = currentReviewCards.length === 2 && currentReviewCards.every(function(card){ return card.category === 'alpha'; });
        push('workflow', focusedOk, 'Focused Flashcards category queue', focusedOk ? 'Only the selected due category entered the live review queue' : 'Focused mode leaked another category or selected no cards');

        var reviewedId = currentReviewCards[0] && currentReviewCards[0].id;
        setConfidence(5);
        flipCard();
        rateCard('again');
        await diagnosticsSettleUI();
        var reviewed = arr(K.flashcards).find(function(card){ return card.id === reviewedId; });
        var detail = arr(K.cardReviewDetails).slice(-1)[0];
        var ratingOk = !!reviewed && reviewed.interval === 1 && reviewed.lapses === 1 && reviewed.lastRating === 'again' && !!detail && detail.cardId === reviewedId && detail.outcome === 'again' && detail.ratingScale === 2 && detail.confidence === 5;
        push('mutation', ratingOk, 'Flashcard rating → adaptive storage + calibration', ratingOk ? 'Again scheduled one day, recorded a lapse, and retained pre-feedback confidence' : 'Live review did not persist the V30 rating contract');
      } catch (e) {
        push('workflow', false, 'Adaptive Flashcards workflow', e && e.message ? e.message : String(e));
      } finally {
        srsMode = priorMode;
        srsFocusedCategory = priorCategory;
        currentReviewCards = [];
        currentCardIndex = 0;
        cardFlipped = false;
        currentConfidence = 0;
      }
    });
    push('restoration', srsFixture.restoration.ok, 'Adaptive Flashcards fixture restoration', srsFixture.restoration.ok ? 'Cards, review counts, and calibration details restored exactly' : srsFixture.restoration.mismatches.join(', '));

    // 3) Framework starter insertion with fixture
    var frameworkFixture = await diagnosticsWithGuardedFixture([K.frameworkLab], async function(){
      try {
        if (typeof go === 'function') go('frameworklab');
        await diagnosticsSettleUI();
        if (typeof loadFrameworkLabState !== 'function') throw new Error('Framework Lab loader missing');
        var beforeState = diagnosticsClone(loadFrameworkLabState());
        var beforeCount = Object.keys((beforeState && beforeState.frameworks) || {}).length;
        if (typeof frameworkCreateStarter !== 'function') throw new Error('frameworkCreateStarter missing');
        frameworkCreateStarter('smr');
        await diagnosticsSettleUI();
        var afterState = diagnosticsClone(loadFrameworkLabState());
        var afterCount = Object.keys((afterState && afterState.frameworks) || {}).length;
        push('mutation', afterCount === beforeCount + 1, 'Framework template insertion', afterCount === beforeCount + 1 ? 'SMR starter inserted into fixture state' : ('Expected ' + (beforeCount + 1) + ', saw ' + afterCount));
      } catch (e) {
        push('mutation', false, 'Framework template insertion', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', frameworkFixture.restoration.ok, 'Framework fixture data restoration', frameworkFixture.restoration.ok ? 'Exact storage snapshot restored' : frameworkFixture.restoration.mismatches.join(', '));

    // 4) Dashboard quick journal save loop with fixture
    var journalFixture = await diagnosticsWithGuardedFixture([K.journal], async function(){
      try {
        if (typeof go === 'function') go('dashboard');
        if (typeof refreshDashboard === 'function') refreshDashboard();
        await diagnosticsSettleUI();
        var input = document.getElementById('dashJournalQuick');
        if (!input) throw new Error('Dashboard quick journal input missing');
        var before = arr(K.journal).length;
        input.value = 'Diagnostics fixture journal note';
        if (typeof dashSaveQuickJournal !== 'function') throw new Error('dashSaveQuickJournal missing');
        dashSaveQuickJournal();
        await diagnosticsSettleUI();
        var journal = arr(K.journal);
        var created = journal[0];
        var ok = journal.length === before + 1 && created && created.title === 'Quick note' && String(created.content || '').indexOf('Diagnostics fixture journal note') !== -1 && input.value === '';
        push('mutation', ok, 'Quick journal save loop', ok ? 'Quick journal entry saved, dashboard refreshed, input cleared' : 'Journal quick-save did not complete expected loop');
      } catch (e) {
        push('mutation', false, 'Quick journal save loop', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', journalFixture.restoration.ok, 'Journal fixture data restoration', journalFixture.restoration.ok ? 'Exact localStorage/IndexedDB snapshot restored' : journalFixture.restoration.mismatches.join(', '));

    // 5) Full Journal editor → Reflection Action → Tasks → Calendar workflow.
    // This specifically guards against replacing the permanent journal modal
    // DOM and against task writers using a schema other pages cannot read.
    var reflectionFixture = await diagnosticsWithGuardedFixture([K.journal, K.tasks], async function(){
      try {
        if (typeof go === 'function') go('journal');
        await diagnosticsSettleUI();
        openJournalModal(true);
        document.getElementById('journalTitle').value = 'Diagnostics reflection';
        document.getElementById('journalContent').innerHTML = 'Turn this reflection into a connected action.';
        saveJournal();
        await diagnosticsSettleUI();

        var editorPreserved = !!document.getElementById('journalDate') && !!document.getElementById('journalContent') && !!document.getElementById('reflectionActionModal');
        push('workflow', editorPreserved, 'Journal modal survives Reflection → Action', editorPreserved ? 'Permanent editor DOM preserved; action prompt opened separately' : 'Journal editor fields were destroyed or action prompt did not open');

        var actionInput = document.getElementById('reflectionAction');
        if (!actionInput) throw new Error('Reflection action field missing');
        actionInput.value = 'Diagnostics connected action';
        createActionFromReflection();
        await diagnosticsSettleUI();
        var task = arr(K.tasks).find(function(row){ return row.title === 'Diagnostics connected action'; });
        var taskOk = !!task && task.priority === 'med' && task.due === null && task.completed === false && task.status === 'pending' && !Object.prototype.hasOwnProperty.call(task, 'dueDate');
        push('mutation', taskOk, 'Reflection → canonical Task record', taskOk ? 'Action uses the shared Planner task schema' : 'Action task does not match the canonical schema');

        if (typeof go === 'function') go('tasks');
        await diagnosticsSettleUI();
        var taskVisible = String(document.getElementById('tasksContainer')?.textContent || '').indexOf('Diagnostics connected action') !== -1;
        push('workflow', taskVisible, 'Reflection action visible in Tasks', taskVisible ? 'Created action rendered through the Tasks page' : 'Created action was stored but not visible in Tasks');

        if (typeof go === 'function') go('calendar');
        await diagnosticsSettleUI();
        var taskRows = arr(K.tasks);
        var taskRow = taskRows.find(function(row){ return row.id === task.id; });
        taskRow.due = today();
        set(K.tasks, taskRows);
        await diagnosticsWait(100);
        await diagnosticsSettleUI();
        var calendarText = String(document.getElementById('calendarGrid')?.textContent || '') + ' ' + String(document.getElementById('upcomingEvents')?.textContent || '');
        var calendarVisible = calendarText.indexOf('Diagnostics connected action') !== -1 || calendarText.indexOf('Diagnostics') !== -1;
        push('workflow', calendarVisible, 'Task write refreshes active Calendar', calendarVisible ? 'Event bus re-rendered Calendar without navigation' : 'Calendar remained stale after the task due-date write');

        if (typeof go === 'function') go('journal');
        await diagnosticsSettleUI();
        openJournalModal(true);
        var reopenOk = !!document.getElementById('journalDate') && !!document.getElementById('journalContent');
        push('workflow', reopenOk, 'Journal editor reopens after save', reopenOk ? 'A second entry can be started without a runtime failure' : 'Journal editor cannot reopen');
        closeModal('journalModal');
      } catch (e) {
        push('workflow', false, 'Journal → Task → Calendar workflow', e && e.message ? e.message : String(e));
      } finally {
        try { closeReflectionActionBridge(); } catch(e) {}
        try { closeModal('journalModal'); } catch(e) {}
      }
    });
    push('restoration', reflectionFixture.restoration.ok, 'Journal/action fixture data restoration', reflectionFixture.restoration.ok ? 'Journal and Tasks restored across localStorage/IndexedDB' : reflectionFixture.restoration.mismatches.join(', '));

    // V30) Science Coach form → Learning Cycle → canonical retrieval Task.
    var scienceFixture = await diagnosticsWithGuardedFixture([K.learningCycles, K.tasks, K.time, K.pomodoroStats, K.practiceQuality, K.sessionContext], async function(){
      var focusOverlayBefore = document.getElementById('focusOverlay')?.innerHTML || '';
      var scienceContextBefore = window.__scienceCycleFocusContext;
      var lastScienceContextBefore = window.__lastScienceCycleFocusContext;
      try {
        if (typeof go === 'function') go('sciencecoach');
        await diagnosticsSettleUI();
        if (typeof renderScienceCoach === 'function') renderScienceCoach();
        var requiredControls = ['scienceTopic','scienceDomain','scienceMethod','scienceOutcome','scienceGap','scienceCorrection','scienceReviewDays','scienceCreateTask'];
        var missingControls = requiredControls.filter(function(id){ return !document.getElementById(id); });
        if (missingControls.length) throw new Error('Missing Science Coach controls: ' + missingControls.join(', '));

        document.getElementById('scienceTopic').value = 'Diagnostics retrieval connection';
        document.getElementById('scienceDomain').value = 'technical';
        document.getElementById('scienceMethod').value = 'retrieval';
        document.getElementById('scienceOutcome').value = '1';
        document.getElementById('scienceGap').value = 'concept';
        document.getElementById('scienceCorrection').value = 'Restate the governing concept, then solve without the source.';
        document.getElementById('scienceReviewDays').value = '2';
        document.getElementById('scienceCreateTask').checked = true;
        ['scienceSleep','scienceEnergy','scienceStress','scienceFocus'].forEach(function(id){
          var control = document.getElementById(id); if (control) control.value = '3';
        });

        var focusTimeBefore = arr(K.time).length;
        var launchedAt = new Date().toISOString();
        window.__scienceCycleFocusContext = { topic:'Diagnostics retrieval connection', learningDomain:'technical', method:'retrieval', launchedAt:launchedAt };
        focusTask = 'Diagnostics retrieval connection';
        focusTotalSeconds = 120;
        focusSeconds = 60;
        focusPaused = false;
        focusStartISO = new Date(Date.now() - 60000).toISOString();
        focusOverlayOriginalHTML = focusOverlayBefore;
        completeFocusSession(true);
        submitFocusRating();
        await diagnosticsSettleUI();
        var focusEntry = arr(K.time).slice(-1)[0];
        var focusOk = arr(K.time).length === focusTimeBefore + 1 && !!focusEntry && focusEntry.learningCycle === true && focusEntry.learningDomain === 'technical' && focusEntry.technique === 'retrieval';
        push('mutation', focusOk, 'Science Coach → Focus → Time Log', focusOk ? 'Focus evidence retained the technical domain and retrieval technique' : 'Science context was lost before reaching Time Log');

        scienceSaveCycle();
        await diagnosticsSettleUI();

        var cycle = arr(K.learningCycles).find(function(row){ return row.topic === 'Diagnostics retrieval connection'; });
        var task = cycle && arr(K.tasks).find(function(row){ return row.id === cycle.retrievalTaskId; });
        var recordOk = !!cycle && cycle.retrievalOutcome === 1 && cycle.gapType === 'concept' && cycle.nextReviewDate && cycle.readiness && cycle.readiness.sleep === 3 && cycle.focusLaunchedAt === launchedAt;
        var taskOk = !!task && task.source === 'science-cycle' && task.sourceId === cycle.id && task.due === cycle.nextReviewDate && task.category === 'study' && task.status === 'pending';
        push('mutation', recordOk && taskOk, 'Science Cycle → canonical retrieval Task', (recordOk && taskOk) ? 'Learning evidence and scheduled follow-up share a resolvable ID' : 'Cycle or Task failed its cross-page schema');

        if (typeof go === 'function') go('tasks');
        await diagnosticsSettleUI();
        var visible = String(document.getElementById('tasksContainer')?.textContent || '').indexOf('Retrieval check: Diagnostics retrieval connection') !== -1;
        push('workflow', visible, 'Science follow-up visible in Tasks', visible ? 'Science Coach write rendered through the Planner task surface' : 'Retrieval Task was stored but not visible in Planner');
      } catch (e) {
        push('workflow', false, 'Science Coach → Task workflow', e && e.message ? e.message : String(e));
      } finally {
        try {
          clearInterval(focusInterval); focusInterval = null;
          var focusOverlay = document.getElementById('focusOverlay');
          if (focusOverlay) focusOverlay.innerHTML = focusOverlayBefore;
          focusOverlay?.classList.remove('active');
          window.__scienceCycleFocusContext = scienceContextBefore;
          window.__lastScienceCycleFocusContext = lastScienceContextBefore;
        } catch(e) {}
      }
    });
    push('restoration', scienceFixture.restoration.ok, 'Science fixture data restoration', scienceFixture.restoration.ok ? 'Learning Cycles, Tasks, Focus, and Time records restored exactly' : scienceFixture.restoration.mismatches.join(', '));

    // 6) Learning Path → Time Log → Insights allocation.
    var learningFixture = await diagnosticsWithGuardedFixture([K.learnProgress, K.time], async function(){
      try {
        var before = arr(K.time).length;
        logLearning('p1', 15, 0.25, 'Diagnostics leadership practice');
        await diagnosticsSettleUI();
        var entries = arr(K.time);
        var entry = entries[entries.length - 1];
        var recordOk = entries.length === before + 1 && entry.moduleId === 'p1' && entry.category === 'study' && entry.learningDomain === 'leadership';
        push('mutation', recordOk, 'Learning Path → Time Log schema', recordOk ? 'P1 practice mapped to the Leadership learning axis' : 'Learning Path time record is disconnected from Insights');
        var allocation = LEARN.getDomainAllocationRange(today(), today());
        var insightOk = allocation.hours.leadership >= 0.25;
        push('workflow', insightOk, 'Time Log → Learning Insights allocation', insightOk ? 'Leadership practice contributes to domain balance' : 'Mapped study time was ignored by the learning engine');
      } catch (e) {
        push('mutation', false, 'Learning Path → Insights workflow', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', learningFixture.restoration.ok, 'Learning-time fixture data restoration', learningFixture.restoration.ok ? 'Progress and time records restored exactly' : learningFixture.restoration.mismatches.join(', '));

    // 7) Operator study context → Focus → Time + Doctrine evidence.
    var focusFixture = await diagnosticsWithGuardedFixture([K.time, K.doctrineLogs, K.pomodoroStats, K.sessionContext], async function(){
      var focusOverlayBefore = document.getElementById('focusOverlay')?.innerHTML || '';
      try {
        set(K.sessionContext, { kind:'study_block', domain:'strategic', moduleId:'p8', durationMin:2 });
        focusTask = 'Diagnostics governed focus';
        focusTotalSeconds = 120;
        focusSeconds = 60;
        focusStartISO = new Date(Date.now() - 60000).toISOString();
        completeFocusSession(true);
        await diagnosticsSettleUI();
        var timeEntry = arr(K.time).slice(-1)[0];
        var doctrineEntry = arr(K.doctrineLogs)[0];
        var focusOk = !!timeEntry && timeEntry.category === 'study' && timeEntry.learningDomain === 'strategic' && !!doctrineEntry && doctrineEntry.primaryDomain === 'strategic' && Number(doctrineEntry.at) > 0 && !!doctrineEntry.date;
        push('mutation', focusOk, 'Focus → Time + Doctrine evidence', focusOk ? 'Focus produced normalized strategic evidence in both engines' : 'Focus evidence is missing fields or invisible to learning analytics');
        submitFocusRating();
      } catch (e) {
        push('mutation', false, 'Operator context → Focus workflow', e && e.message ? e.message : String(e));
      } finally {
        try {
          clearInterval(focusInterval); focusInterval = null;
          var focusOverlay = document.getElementById('focusOverlay');
          if (focusOverlay) focusOverlay.innerHTML = focusOverlayBefore;
          focusOverlay?.classList.remove('active');
        } catch(e) {}
      }
    });
    push('restoration', focusFixture.restoration.ok, 'Focus fixture data restoration', focusFixture.restoration.ok ? 'Time, Doctrine, Pomodoro, and context restored exactly' : focusFixture.restoration.mismatches.join(', '));

    // 8) Goal milestone completion → Dashboard progress.
    var goalFixture = await diagnosticsWithGuardedFixture([K.goals], async function(){
      try {
        var goal = { id:'diagnostics-goal', title:'Diagnostics completion goal', area:'education', target:today(), completed:false, milestones:[{ id:'diagnostics-milestone', title:'Prove the connection', done:false }] };
        set(K.goals, [goal]);
        if (typeof go === 'function') go('goals');
        await diagnosticsSettleUI();
        toggleMilestone(goal.id, goal.milestones[0].id);
        await diagnosticsSettleUI();
        var stored = arr(K.goals)[0];
        var goalOk = stored.completed === true && goalProgress(stored) === 100;
        push('mutation', goalOk, 'Milestone → Goal completion', goalOk ? 'Final milestone completes the goal at 100%' : 'Goal completion state did not follow its milestones');
        if (typeof go === 'function') go('dashboard');
        await diagnosticsSettleUI();
        var dashOk = document.getElementById('dashGoalsPct')?.textContent === '100%';
        push('workflow', dashOk, 'Goal completion → Dashboard', dashOk ? 'Dashboard reports the completed fixture goal at 100%' : 'Dashboard progress disagrees with Goals');
      } catch (e) {
        push('mutation', false, 'Goal → Dashboard workflow', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', goalFixture.restoration.ok, 'Goal fixture data restoration', goalFixture.restoration.ok ? 'Goals restored exactly' : goalFixture.restoration.mismatches.join(', '));

    // 9) Protocol energy → Discipline Energy Tracker.
    var energyFixture = await diagnosticsWithGuardedFixture([K.protocol, K.energyTracker], async function(){
      try {
        set(K.protocol, { [today()]: { energy:9, intention:'Diagnostics energy bridge' } });
        set(K.energyTracker, {});
        if (typeof go === 'function') go('protocol');
        await diagnosticsSettleUI();
        var hiddenOk = document.getElementById('protocolEnergy')?.value === '9';
        completeProtocol();
        await diagnosticsSettleUI();
        var storedProtocol = (get(K.protocol) || {})[today()] || {};
        var storedEnergy = (get(K.energyTracker) || {})[today()] || {};
        var bridgeOk = hiddenOk && Number(storedProtocol.energy) === 9 && storedEnergy.protocolEnergy === 9 && storedEnergy.level === 5;
        push('mutation', bridgeOk, 'Protocol → Energy Tracker bridge', bridgeOk ? 'Saved 9/10 baseline maps to 5/5 without reverting to the old default' : 'Protocol energy and Discipline tracker disagree');
      } catch (e) {
        push('mutation', false, 'Protocol → Energy workflow', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', energyFixture.restoration.ok, 'Energy fixture data restoration', energyFixture.restoration.ok ? 'Protocol and Energy Tracker restored exactly' : energyFixture.restoration.mismatches.join(', '));

    // 10) Profile hypothesis → feedback → contextual prompt state.
    var profileFixture = await diagnosticsWithGuardedFixture([K.adaptiveProfile, K.profileFeedback], async function(){
      try {
        set(K.adaptiveProfile, profileDefaultState());
        set(K.profileFeedback, []);
        if (typeof go === 'function') go('profilelab');
        await diagnosticsSettleUI();
        if (typeof renderProfileLab === 'function') renderProfileLab();
        profileRecordFeedback('decision_dual_mode', 'helpful', 'diagnostics');
        await diagnosticsSettleUI();
        var usefulState = profileHypothesisState('decision_dual_mode');
        var usefulRecord = arr(K.profileFeedback).some(function(row){ return row.hypothesisId === 'decision_dual_mode' && row.response === 'helpful'; });
        var usefulUi = /Useful/.test(String(document.getElementById('profileLabRoot')?.textContent || ''));
        profileRecordFeedback('decision_dual_mode', 'not-me', 'diagnostics');
        await diagnosticsSettleUI();
        var disabledState = profileHypothesisState('decision_dual_mode');
        var disabledRecord = arr(K.profileFeedback).some(function(row){ return row.hypothesisId === 'decision_dual_mode' && row.response === 'not-me'; });
        profileToggleEnabled(false);
        await diagnosticsSettleUI();
        var globalOff = getAdaptiveProfile().enabled === false && /Adaptive prompts are quiet/.test(String(document.getElementById('blindSpotCard')?.textContent || ''));
        var stateOk = usefulState.status === 'useful' && usefulRecord && usefulUi && disabledState.status === 'not-me' && disabledRecord && profileIsHypothesisEnabled('decision_dual_mode') === false && globalOff;
        push('workflow', stateOk, 'Profile feedback → prompt state', stateOk ? 'Useful, Not me, and global Off updated state, history, Profile Lab, and Dashboard prompts' : 'Feedback did not propagate across profile state, history, and rendering');
      } catch (e) {
        push('workflow', false, 'Adaptive Profile feedback workflow', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', profileFixture.restoration.ok, 'Profile fixture data restoration', profileFixture.restoration.ok ? 'Adaptive state and feedback history restored exactly' : profileFixture.restoration.mismatches.join(', '));

    // 11) Communication quality behavior → receiver outcome → Discipline UI.
    var communicationFixture = await diagnosticsWithGuardedFixture([K.commTracker], async function(){
      try {
        set(K.commTracker, {});
        if (typeof go === 'function') go('discipline');
        await diagnosticsSettleUI();
        var behaviorId = (window.COMM_QUALITY_BEHAVIORS || [])[0]?.id;
        if (!behaviorId) throw new Error('No communication quality behaviors registered');
        toggleCommQualityBehavior(behaviorId);
        setCommOutcome(5);
        await diagnosticsSettleUI();
        var row = (get(K.commTracker) || {})[today()] || {};
        var behaviorButton = document.querySelector('#commQualityBehaviors button[aria-pressed="true"]');
        var outcomeButton = document.querySelector('#commOutcome button[aria-pressed="true"]');
        var commOk = Array.isArray(row.qualityBehaviors) && row.qualityBehaviors.includes(behaviorId) && row.outcome === 5 && !!behaviorButton && /Changed action/.test(String(outcomeButton?.textContent || ''));
        push('workflow', commOk, 'Communication quality → receiver outcome', commOk ? 'Receiver-side behavior and 5/5 outcome reached storage and the Discipline surface' : 'Communication storage and UI are out of sync');
      } catch (e) {
        push('workflow', false, 'Communication quality workflow', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', communicationFixture.restoration.ok, 'Communication fixture data restoration', communicationFixture.restoration.ok ? 'Communication tracker restored exactly' : communicationFixture.restoration.mismatches.join(', '));

    // 12) Quality review → canonical verification task → Journal surface.
    var qualityFixture = await diagnosticsWithGuardedFixture([K.qualityReviews, K.tasks, K.decisions], async function(){
      try {
        set(K.qualityReviews, []);
        set(K.tasks, []);
        set(K.decisions, []);
        if (typeof go === 'function') go('journal');
        await diagnosticsSettleUI();
        openQualityReviewModal();
        var verificationDate = typeof COMMITMENTS !== 'undefined' ? COMMITMENTS.addDays(today(), 7) : today();
        document.getElementById('qualityTitle').value = 'Diagnostics preventive control';
        document.getElementById('qualityWhat').value = 'A fixture check found a missed handoff.';
        document.getElementById('qualityFix').value = 'The handoff was completed.';
        document.getElementById('qualityCause').value = 'The process had no named verification owner.';
        document.getElementById('qualityPrevention').value = 'Assign an owner and verify the handoff at the hold point.';
        document.getElementById('qualityVerifyDate').value = verificationDate;
        document.getElementById('qualityOwner').value = 'Diagnostics owner';
        document.getElementById('qualityCreateTask').checked = true;
        saveQualityReview();
        await diagnosticsSettleUI();
        var review = arr(K.qualityReviews)[0];
        var verificationTask = review && arr(K.tasks).find(function(task){ return task.id === review.taskId; });
        var taskOk = verificationTask && verificationTask.title === 'Verify control: Diagnostics preventive control' && verificationTask.due === verificationDate && verificationTask.status === 'pending' && verificationTask.completed === false && verificationTask.priority === 'med' && verificationTask.source === 'quality-review' && verificationTask.sourceId === review.id;
        var qualityUi = /Diagnostics preventive control/.test(String(document.getElementById('qualityLoopRoot')?.textContent || ''));
        push('mutation', !!review && !!taskOk && qualityUi, 'Quality review → verification task', (review && taskOk && qualityUi) ? 'Structured review created a canonical scheduled Task and refreshed the Journal loop' : 'Review, task, or Journal surface failed to synchronize');
      } catch (e) {
        push('mutation', false, 'Quality Loop workflow', e && e.message ? e.message : String(e));
      } finally {
        try { closeModal('qualityReviewModal'); } catch(e) {}
      }
    });
    push('restoration', qualityFixture.restoration.ok, 'Quality fixture data restoration', qualityFixture.restoration.ok ? 'Quality reviews, Tasks, and Decisions restored exactly' : qualityFixture.restoration.mismatches.join(', '));

    // 13) Decision editor → live two-sided guardrail → saved journal record.
    var decisionFixture = await diagnosticsWithGuardedFixture([K.decisions, K.adaptiveProfile], async function(){
      try {
        set(K.decisions, []);
        if (typeof go === 'function') go('decisions');
        await diagnosticsSettleUI();
        openDecisionModal();
        document.getElementById('djTitle').value = 'Diagnostics governed decision';
        document.getElementById('djChoice').value = 'Pause and verify the governing requirement.';
        document.getElementById('djImpact').value = 'regulated';
        document.getElementById('djReversibility').value = 'one-way';
        document.getElementById('djTimePressure').value = 'urgent';
        document.getElementById('djDecisionState').value = 'rushing';
        document.getElementById('djEvidenceQuality').value = '1';
        document.getElementById('djSourceCount').value = '0';
        saveAdaptiveProfile({ guidanceDensity:'compact' });
        var compactGuardrail = renderDecisionGuardrail();
        var compactPanel = document.getElementById('decisionGuardrailPanel');
        var compactUi = compactPanel?.classList.contains('density-compact') && !!compactPanel.querySelector('.decision-guardrail-compact-action') && !compactPanel.querySelector('.decision-guardrail-grid');
        saveAdaptiveProfile({ guidanceDensity:'coaching' });
        var liveGuardrail = renderDecisionGuardrail();
        var livePanel = document.getElementById('decisionGuardrailPanel');
        var liveUi = livePanel?.classList.contains('is-slow-down') && livePanel?.classList.contains('density-coaching') && !!livePanel.querySelector('.decision-guardrail-grid') && !!livePanel.querySelector('.decision-guardrail-coaching');
        saveDecision();
        await diagnosticsSettleUI();
        var savedDecision = arr(K.decisions)[0];
        var decisionOk = compactGuardrail && compactGuardrail.mode === 'slow-down' && compactUi && liveGuardrail && liveGuardrail.mode === 'slow-down' && liveUi && savedDecision && savedDecision.guardrail && savedDecision.guardrail.mode === 'slow-down' && savedDecision.impact === 'regulated' && savedDecision.sourceCount === 0;
        push('mutation', decisionOk, 'Decision editor → density-aware stored guardrail', decisionOk ? 'Compact and Coaching guidance rendered differently; the same high-consequence result was preserved with the saved decision' : 'Density control, decision form, live advice, and saved record disagree');
      } catch (e) {
        push('mutation', false, 'Decision Guardrail workflow', e && e.message ? e.message : String(e));
      } finally {
        try { closeModal('decisionModal'); } catch(e) {}
      }
    });
    push('restoration', decisionFixture.restoration.ok, 'Decision fixture data restoration', decisionFixture.restoration.ok ? 'Decision Journal and prior guidance density restored exactly' : decisionFixture.restoration.mismatches.join(', '));

    // 14) Task + recurring Calendar + Habit → shared conflict engine →
    // inline warning → advisory save path → Calendar and global heads-up.
    var commitmentFixture = await diagnosticsWithGuardedFixture([K.events, K.tasks, K.habits, K.habitLogs, K.commitmentPrefs], async function(){
      try {
        if (!window.COMMITMENTS) throw new Error('COMMITMENTS engine missing');
        var fixtureDate = COMMITMENTS.addDays(today(), 1);
        set(K.commitmentPrefs, Object.assign({}, COMMITMENT_DEFAULTS, { warningsEnabled:true, bufferMinutes:10 }));
        set(K.events, [
          { id:'diagnostics-meeting', title:'Diagnostics project meeting', date:fixtureDate, time:'10:00', duration:'60', type:'event', repeat:'weekly' },
          { id:'diagnostics-clear-block', title:'Diagnostics clear block', date:fixtureDate, time:'14:00', duration:'30', type:'event', repeat:null }
        ]);
        set(K.tasks, [normalizeTaskRecord({ id:'diagnostics-timed-task', title:'Diagnostics timed task', due:fixtureDate, time:'10:30', duration:'60', category:'work', priority:'high', completed:false })]);
        set(K.habits, [{ id:'diagnostics-habit', name:'Diagnostics study habit', time:'10:45', duration:'10', category:'study', anchor:'finish breakfast', tiny:'open notes' }]);
        set(K.habitLogs, []);
        await diagnosticsSettleUI();

        var scan = COMMITMENTS.scanDay(fixtureDate, { includePast:true });
        var eventTaskOverlap = scan.issues.some(function(issue){ return issue.type === 'overlap' && issue.entities.some(function(entity){ return entity.kind === 'event'; }) && issue.entities.some(function(entity){ return entity.kind === 'task'; }); });
        var habitOverlap = scan.issues.some(function(issue){ return issue.type === 'overlap' && issue.entities.some(function(entity){ return entity.kind === 'habit'; }); });
        var recurrenceOk = COMMITMENTS.eventsForDate(COMMITMENTS.addDays(fixtureDate, 7)).some(function(event){ return event.id === 'diagnostics-meeting'; });
        push('workflow', eventTaskOverlap && habitOverlap && recurrenceOk, 'Cross-source collision + recurrence detection', (eventTaskOverlap && habitOverlap && recurrenceOk) ? 'Meeting, task, and habit overlaps detected; weekly occurrence expanded' : 'One or more commitment sources did not reach the shared engine');

        var clearCandidate = COMMITMENTS.evaluateCandidate({ id:'diagnostics-clear-task', kind:'task', title:'Clear candidate', date:fixtureDate, time:'12:00', duration:'30', category:'work' });
        var falsePositiveFree = !clearCandidate.issues.some(function(issue){ return issue.type === 'overlap'; });
        push('workflow', falsePositiveFree, 'Non-overlapping task remains clear', falsePositiveFree ? '12:00 candidate produced no overlap warning' : 'Engine reported a false positive for a clear interval');

        if (typeof go === 'function') go('tasks');
        await diagnosticsSettleUI();
        openTaskModal();
        document.getElementById('taskTitle').value = 'Diagnostics advisory save';
        document.getElementById('taskDue').value = fixtureDate;
        document.getElementById('taskTime').value = '10:15';
        document.getElementById('taskDuration').value = '30';
        document.getElementById('taskCategory').value = 'work';
        refreshTaskConflictPreview();
        var inlineText = String(document.getElementById('taskConflictPreview')?.textContent || '');
        var inlineOk = /overlap|conflict/i.test(inlineText);
        push('workflow', inlineOk, 'Task editor shows pre-save explanation', inlineOk ? 'Inline warning names the scheduling risk before mutation' : 'Task editor did not surface the detected collision');

        var beforeSave = arr(K.tasks).length;
        saveTask();
        await diagnosticsSettleUI();
        var heldForReview = arr(K.tasks).length === beforeSave && document.getElementById('commitmentCenterModal')?.classList.contains('show');
        commitmentContinuePending();
        await diagnosticsSettleUI();
        var savedAnyway = arr(K.tasks).length === beforeSave + 1 && arr(K.tasks).some(function(task){ return task.title === 'Diagnostics advisory save'; });
        push('mutation', heldForReview && savedAnyway, 'Advisory warning preserves user control', (heldForReview && savedAnyway) ? 'First save paused for review; Save anyway completed the exact task write' : 'Warning either failed to pause or blocked the override path');

        if (typeof go === 'function') go('calendar');
        if (typeof selectedCalendarDate !== 'undefined') selectedCalendarDate = fixtureDate;
        if (typeof currentCalendarDate !== 'undefined') currentCalendarDate = commitmentDateObject(fixtureDate);
        renderCalendar();
        renderCommitmentHeadsUp();
        await diagnosticsSettleUI();
        var railText = String(document.getElementById('calConflictPanel')?.textContent || '');
        var bellCount = parseInt(document.getElementById('commitmentBellCount')?.textContent || '0', 10);
        var surfaceOk = /warn|overlap|conflict/i.test(railText) && bellCount > 0;
        push('workflow', surfaceOk, 'Conflict write refreshes Calendar + global heads-up', surfaceOk ? 'Calendar rail and top-bar count reflect the same fixture conflicts' : 'A dependent warning surface remained stale');
      } catch (e) {
        push('workflow', false, 'Commitment Intelligence guarded workflow', e && e.message ? e.message : String(e));
      } finally {
        try { closeCommitmentCenter(); } catch(e) {}
        try { closeModal('taskModal'); } catch(e) {}
      }
    });
    push('restoration', commitmentFixture.restoration.ok, 'Commitment fixture data restoration', commitmentFixture.restoration.ok ? 'Events, Tasks, Habits, logs, and preferences restored exactly' : commitmentFixture.restoration.mismatches.join(', '));

    // 11) Capture creation → Knowledge processing with fixture
    var captureFixture = await diagnosticsWithGuardedFixture([K.captureInbox, K.knowledge, K.entityLinks], async function(){
      try {
        var beforeCaptures = arr(K.captureInbox).length;
        var beforeKnowledge = arr(K.knowledge).length;
        if (typeof studyosCreateCapture !== 'function') throw new Error('studyosCreateCapture missing');
        var created = studyosCreateCapture({ title: 'Diagnostics capture fixture', content: 'Evidence note created only inside guarded diagnostics.', captureType: 'source', pathway: 'foundations', tags: ['diagnostics'] });
        var afterCreate = arr(K.captureInbox);
        push('mutation', !!created && afterCreate.length === beforeCaptures + 1 && afterCreate[0].id === created.id, 'Capture inbox creation path', created ? 'Disposable capture stored and selected' : 'Capture was not created');
        if (typeof captureToKnowledge !== 'function') throw new Error('captureToKnowledge missing');
        var note = captureToKnowledge(created.id, { navigate: false });
        await diagnosticsSettleUI();
        var processed = arr(K.captureInbox).find(function(item){ return item.id === created.id; });
        var knowledge = arr(K.knowledge);
        var processOk = !!note && knowledge.length === beforeKnowledge + 1 && !!processed && processed.status === 'processed' && processed.processedAs && processed.processedAs.id === note.id;
        push('mutation', processOk, 'Capture → Knowledge processing path', processOk ? 'Capture became a knowledge note and retained provenance' : 'Capture processing did not complete the expected loop');
      } catch (e) {
        push('mutation', false, 'Capture processing workflow', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', captureFixture.restoration.ok, 'Capture fixture data restoration', captureFixture.restoration.ok ? 'Capture, Knowledge, and links restored exactly' : captureFixture.restoration.mismatches.join(', '));

    // 11) V29 scenario answer → classified error → weak-skill queue →
    // correction flashcard → Learning Path evidence, all in disposable data.
    var practiceFixture = await diagnosticsWithGuardedFixture([K.scenarioHistory, K.practiceQueue, K.flashcards], async function(){
      try {
        if (!window.PRACTICE) throw new Error('PRACTICE engine missing');
        localStorage.setItem(K.scenarioHistory, '[]');
        localStorage.setItem(K.practiceQueue, '[]');
        localStorage.setItem(K.flashcards, '[]');
        var scenario = window.PRACTICE.getScenarios()[0];
        if (!scenario) throw new Error('No normalized scenario available');
        var wrongChoice = (Number(scenario.answer) + 1) % scenario.choices.length;
        var attempt = window.PRACTICE.recordAttempt(scenario, wrongChoice, 5, 1200);
        var history = window.PRACTICE.getHistory();
        var queue = window.PRACTICE.getQueue();
        var answerOk = history.length === 1 && history[0].id === attempt.id && !attempt.correct && !!attempt.errorType;
        var queueOk = queue.length === 1 && queue[0].skillKey === scenario.skill && queue[0].lastAttemptId === attempt.id;
        push('mutation', answerOk, 'Judgment answer and error classification', answerOk ? ('Stored ' + attempt.errorType + ' with confidence 5/5') : 'Attempt record did not retain correction metadata');
        push('mutation', queueOk, 'Automatic weak-skill queue', queueOk ? (queue[0].skillLabel + ' scheduled ' + queue[0].dueDate) : 'Incorrect answer did not create a mapped queue item');

        var promoted = window.PRACTICE.promoteAttemptToFlashcard(attempt.id);
        var cards = arr(K.flashcards);
        var flashcardOk = promoted.created && cards.length === 1 && cards[0].sourceScenarioId === scenario.id;
        push('mutation', flashcardOk, 'Correction → Flashcards bridge', flashcardOk ? 'Correction card retained scenario provenance' : 'Correction card was not created as expected');

        var evidence = window.PRACTICE.getModuleEvidence(scenario.moduleId);
        var learningOk = evidence.attempts === 1 && evidence.accuracy === 0;
        push('mutation', learningOk, 'Scenario → Learning Path evidence', learningOk ? (scenario.moduleId.toUpperCase() + ' shows 1 applied attempt') : 'Mapped Learning Path evidence did not update');
      } catch (e) {
        push('mutation', false, 'Practice & Judgment workflow', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', practiceFixture.restoration.ok, 'Practice fixture data restoration', practiceFixture.restoration.ok ? 'History, queue, and Flashcards restored exactly' : practiceFixture.restoration.mismatches.join(', '));

    // 12) Old backup → migration → both-layer reset → no resurrection.
    var allStorageKeys = Array.from(new Set(Object.values(K).concat([STORAGE_SCHEMA_KEY])));
    var lifecycleFixture = await diagnosticsWithGuardedFixture(allStorageKeys, async function(){
      try {
        var tasksBeforeInvalidImport = localStorage.getItem(K.tasks);
        var malformedRejected = false;
        try {
          await applySnapshotData({ __schemaVersion:DATA_SCHEMA_VERSION, tasks:{ invalid:true } }, { emit:false });
        } catch (expectedError) {
          malformedRejected = /must be an array/.test(String(expectedError && expectedError.message || expectedError));
        }
        malformedRejected = malformedRejected && localStorage.getItem(K.tasks) === tasksBeforeInvalidImport;
        push('mutation', malformedRejected, 'Malformed backup rejected before mutation', malformedRejected ? 'Invalid collection shape failed safely and current Tasks remained unchanged' : 'Malformed import was accepted or changed current data');

        var legacy = {
          __schemaVersion: 20,
          tasks: [{ id:'legacy-task', title:'Legacy connected task', dueDate:today(), priority:'medium', status:'pending' }],
          events: [{ id:'legacy-event', title:'Legacy recurring block', date:today(), time:'08:00', duration:'60', type:'study', repeat:'weekly' }],
          habits: [{ id:'legacy-habit', name:'Legacy timed habit', preferredTime:'07:30', duration:'10', category:'study' }],
          time: [{ id:'legacy-time', title:'Legacy PMP study', duration:1, date:today(), category:'study', domain:'pmp' }],
          journal: [{ id:'legacy-journal', date:today(), title:'Legacy journal', content:'Migration fixture' }],
          doctrineLogs: [{ id:'legacy-drill', date:today(), domain:'strategy', depth:'structured', friction:3 }]
        };
        var restored = await applySnapshotData(legacy, { emit:false });
        var migratedTask = arr(K.tasks)[0];
        var migratedTime = arr(K.time)[0];
        var migratedEvent = arr(K.events)[0];
        var migratedHabit = arr(K.habits)[0];
        var migratedPrefs = get(K.commitmentPrefs);
        var migratedProfile = get(K.adaptiveProfile);
        var migrateOk = restored.ok && parseInt(localStorage.getItem(STORAGE_SCHEMA_KEY) || '0', 10) === DATA_SCHEMA_VERSION && migratedTask.due === today() && migratedTask.priority === 'med' && migratedTask.status === 'pending' && migratedTask.time === null && !Object.prototype.hasOwnProperty.call(migratedTask, 'dueDate') && migratedTime.learningDomain === 'strategic' && migratedEvent.repeat === 'weekly' && migratedHabit.time === '07:30' && migratedPrefs && migratedPrefs.warningsEnabled === true && migratedProfile && migratedProfile.version === 1 && Array.isArray(get(K.profileFeedback)) && Array.isArray(get(K.qualityReviews));
        push('mutation', migrateOk, 'Backup import reruns schema migrations', migrateOk ? 'V20 records reached current task, schedule, learning, and V31 profile/quality contracts' : 'Imported legacy records bypassed one or more migrations');

        await STORAGE.flush();
        var journalMirror = await STORAGE.readLarge(K.journal);
        var doctrineMirror = await STORAGE.readLarge(K.doctrineLogs);
        var mirrorOk = Array.isArray(journalMirror) && journalMirror.length === 1 && Array.isArray(doctrineMirror) && doctrineMirror.length === 1;
        push('mutation', mirrorOk, 'Backup restore synchronizes IndexedDB', mirrorOk ? 'Large collections agree in localStorage and IndexedDB' : 'Restore left the storage layers out of sync');

        await clearStudyOSData({ initialize:false, emit:false });
        var clearedLocal = Object.values(K).every(function(key){ return localStorage.getItem(key) === null; });
        var clearedIndexed = (await STORAGE.readLarge(K.journal)) === null && (await STORAGE.readLarge(K.doctrineLogs)) === null;
        await STORAGE.hydrateLargeKeys();
        var noResurrection = localStorage.getItem(K.journal) === null && localStorage.getItem(K.doctrineLogs) === null;
        push('mutation', clearedLocal && clearedIndexed && noResurrection, 'Reset clears both layers permanently', (clearedLocal && clearedIndexed && noResurrection) ? 'No Journal/Doctrine records resurrect after hydration' : 'Reset left data in localStorage or IndexedDB');
      } catch (e) {
        push('mutation', false, 'Backup/import/reset lifecycle', e && e.message ? e.message : String(e));
      }
    });
    push('restoration', lifecycleFixture.restoration.ok, 'Full lifecycle fixture restoration', lifecycleFixture.restoration.ok ? 'Every registered key, schema, and IndexedDB mirror restored exactly' : lifecycleFixture.restoration.mismatches.join(', '));

  } finally {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandled);
    try {
      if (typeof window.go === 'function' && originalPage) {
        window.go(originalPage);
        await diagnosticsSettleUI();
      }
      if (typeof window.goTab === 'function' && originalPage && originalTab) {
        var tabs = diagnosticsCollectPageTabs().tabsByPage[originalPage] || [];
        if (tabs.indexOf(originalTab) !== -1) {
          window.goTab(originalPage, originalTab);
          await diagnosticsSettleUI();
        }
      }
    } catch(e) {}
  }

  capturedErrors.forEach(function(err){
    push('runtime', false, 'Guarded test runtime ' + err.type, err.message);
  });

  var okCount = findings.filter(function(r){ return r.ok; }).length;
  var total = findings.length;
  var failCount = total - okCount;
  var groups = {
    workflow: findings.filter(function(r){ return r.kind === 'workflow'; }),
    mutation: findings.filter(function(r){ return r.kind === 'mutation'; }),
    restoration: findings.filter(function(r){ return r.kind === 'restoration'; }),
    runtime: findings.filter(function(r){ return r.kind === 'runtime'; })
  };

  var reportHtml = `
    <div class="card diagnostics-report" style="margin-top:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-weight:800;">Guarded Mutation Test Mode: ${okCount}/${total} checks passed</div>
          <div style="color:var(--text-muted);margin-top:4px;">Completed ${diagnosticsRunStamp()} · fixture writes verified and prior data restored.</div>
        </div>
        <div class="badge ${failCount === 0 ? 'badge-good' : 'badge-warn'}">${failCount === 0 ? 'GUARDED PASS' : (failCount + ' FAILURES')}</div>
      </div>
      <div style="margin-top:10px;color:var(--text-muted);font-size:0.92rem;line-height:1.6;">
        Fixture coverage: Science Cycle → Focus → Time + Retrieval Task, adaptive Flashcards queue/rating/calibration, Journal → Task → Calendar, Task + recurring Calendar + Habit → conflict warning → advisory override, Learning Path → Time → Insights, Operator → Focus → Doctrine, Goal → Dashboard, Protocol → Energy, Profile feedback → prompt state, Communication quality → receiver outcome, Quality review → verification Task, Decision editor → live/saved guardrail, backup migration/reset across localStorage + IndexedDB, Doctrine builder, flashcard packs, Framework Lab, Capture → Knowledge, and Practice & Judgment. Every workflow runs against disposable data and proves exact restoration.
      </div>
      <div style="display:grid;gap:14px;margin-top:14px;">
        <div>
          <div style="font-weight:800;margin-bottom:8px;">Workflow Opening & Rendering</div>
          <div style="display:grid;gap:8px;">${diagnosticsRenderMutationRows(groups.workflow)}</div>
        </div>
        <div>
          <div style="font-weight:800;margin-bottom:8px;">Guarded Mutations</div>
          <div style="display:grid;gap:8px;">${diagnosticsRenderMutationRows(groups.mutation)}</div>
        </div>
        <div>
          <div style="font-weight:800;margin-bottom:8px;">Data Restoration Proof</div>
          <div style="display:grid;gap:8px;">${diagnosticsRenderMutationRows(groups.restoration)}</div>
        </div>
        <div>
          <div style="font-weight:800;margin-bottom:8px;">Captured Runtime Errors</div>
          <div style="display:grid;gap:8px;">${diagnosticsRenderMutationRows(groups.runtime)}</div>
        </div>
      </div>
    </div>
  `;
  diagnosticsPublishReport('diagMutationTestResults', reportHtml);
  return findings;
}

async function runDeepActiveTestMode(){
  diagnosticsPublishReport('diagActiveTestResults', '<div class="card diagnostics-running">Actively visiting routes and tabs, then exercising read-only runtime probes…</div>');

  var findings = [];
  function push(kind, ok, title, detail){
    findings.push({ kind: kind, ok: !!ok, title: title, detail: detail || '' });
  }

  var state = diagnosticsCollectPageTabs();
  var pageIds = state.pageIds;
  var tabsByPage = state.tabsByPage;
  var originalPage = diagnosticsGetActivePageId() || 'dashboard';
  var originalTab = diagnosticsGetVisibleTabId(originalPage);
  var capturedErrors = [];

  function onError(ev){
    var msg = ev && (ev.message || (ev.error && ev.error.message)) || 'Unknown runtime error';
    capturedErrors.push({ type: 'error', message: String(msg) });
  }
  function onUnhandled(ev){
    var reason = ev && ev.reason;
    var msg = reason && reason.message ? reason.message : String(reason || 'Unhandled promise rejection');
    capturedErrors.push({ type: 'rejection', message: msg });
  }

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onUnhandled);

  try {
    // A) Route/page navigation tests
    if (window.PAGE_MAP && typeof window.go === 'function') {
      for (var route in window.PAGE_MAP) {
        if (!Object.prototype.hasOwnProperty.call(window.PAGE_MAP, route)) continue;
        var beforeErr = capturedErrors.length;
        try {
          window.go(route);
          await diagnosticsSettleUI();
          var activePage = diagnosticsGetActivePageId();
          var mapping = window.PAGE_MAP[route] || {};
          var pageOk = activePage === mapping.page;
          var tabOk = true;
          var visibleTab = diagnosticsGetVisibleTabId(mapping.page);
          if (mapping.tab) tabOk = visibleTab === mapping.tab;
          push('route-active', pageOk && tabOk, 'Navigate route ' + route, pageOk && tabOk ? ('Reached #' + mapping.page + (mapping.tab ? ' / tab-' + mapping.tab : '')) : ('Active page/tab mismatch. Saw #' + (activePage || '(none)') + (visibleTab ? ' / tab-' + visibleTab : '')));
        } catch (e) {
          push('route-active', false, 'Navigate route ' + route, e && e.message ? e.message : String(e));
        }
        if (capturedErrors.length > beforeErr) {
          var recent = capturedErrors[capturedErrors.length - 1];
          push('runtime', false, 'Runtime error after route ' + route, recent.message);
        }
      }
    } else {
      push('route-active', false, 'Deep navigation routes', 'PAGE_MAP or go() missing');
    }

    // B) Explicit tab render tests
    if (typeof window.goTab === 'function') {
      for (var p = 0; p < pageIds.length; p++) {
        var pageId = pageIds[p];
        var tabs = tabsByPage[pageId] || [];
        if (!tabs.length) continue;
        if (typeof window.go === 'function') {
          try { window.go(pageId); await diagnosticsSettleUI(); } catch(e){}
        }
        for (var t = 0; t < tabs.length; t++) {
          var tab = tabs[t];
          var beforeErr2 = capturedErrors.length;
          try {
            window.goTab(pageId, tab);
            await diagnosticsSettleUI();
            var activePage2 = diagnosticsGetActivePageId();
            var visibleTab2 = diagnosticsGetVisibleTabId(pageId);
            var targetPanel = document.getElementById('tab-' + tab);
            var rootChildren = targetPanel ? targetPanel.children.length : 0;
            var ok = activePage2 === pageId && visibleTab2 === tab && !!targetPanel;
            push('tab-active', ok, 'Render tab ' + pageId + '/' + tab, ok ? ('Visible with ' + rootChildren + ' child node(s)') : ('Mismatch after render. Active #' + (activePage2 || '(none)') + ' / tab-' + (visibleTab2 || '(none)')));
          } catch (e) {
            push('tab-active', false, 'Render tab ' + pageId + '/' + tab, e && e.message ? e.message : String(e));
          }
          if (capturedErrors.length > beforeErr2) {
            var recent2 = capturedErrors[capturedErrors.length - 1];
            push('runtime', false, 'Runtime error after tab ' + pageId + '/' + tab, recent2.message);
          }
        }
      }
    } else {
      push('tab-active', false, 'Deep tab navigation', 'goTab() missing');
    }

    // C) Safe click simulation for visible navigation controls only
    var clickedKeys = new Set();
    for (var p2 = 0; p2 < pageIds.length; p2++) {
      var pageId2 = pageIds[p2];
      try {
        if (typeof window.go === 'function') {
          window.go(pageId2);
          await diagnosticsSettleUI();
        }
      } catch(e){}
      var scope = document.getElementById(pageId2) || document;
      var controls = Array.from(scope.querySelectorAll('[onclick], a[href], .nav-link, .filter-btn'));
      for (var c = 0; c < controls.length; c++) {
        var el = controls[c];
        var action = diagnosticsReadInlineAction(el);
        var parsed = diagnosticsParseAction(action.replace(/^href:/, ''));
        var isSafe = false;
        if (action.indexOf('href:#') === 0) isSafe = true;
        if (parsed.type === 'go' || parsed.type === 'goTab') isSafe = true;
        if (!isSafe) continue;
        var key = diagnosticsShortLabel(el) + '|' + action;
        if (clickedKeys.has(key)) continue;
        clickedKeys.add(key);
        var beforeErr3 = capturedErrors.length;
        try {
          if (typeof el.click === 'function') el.click();
          else if (typeof el.dispatchEvent === 'function') el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          await diagnosticsSettleUI();
          push('click-safe', true, 'Safe click ' + diagnosticsShortLabel(el), action || 'Clicked');
        } catch (e) {
          push('click-safe', false, 'Safe click ' + diagnosticsShortLabel(el), e && e.message ? e.message : String(e));
        }
        if (capturedErrors.length > beforeErr3) {
          var recent3 = capturedErrors[capturedErrors.length - 1];
          push('runtime', false, 'Runtime error after safe click ' + diagnosticsShortLabel(el), recent3.message);
        }
      }
    }

    // D) Core cooperation execution probes (read-only / low-risk)
    var probes = [
      {
        name: 'Metrics snapshot probe',
        run: function(){
          if (!window.METRICS || typeof window.METRICS.snapshot !== 'function') throw new Error('METRICS.snapshot missing');
          var snapshot = window.METRICS.snapshot();
          if (!snapshot || !snapshot.operator || !snapshot.learningIntegrity || !snapshot.systemStatus) throw new Error('Metrics snapshot has unexpected shape');
          return 'Metrics snapshot returned all core domains';
        }
      },
      {
        name: 'Practice engine read-only probe',
        run: function(){
          if (!window.PRACTICE) throw new Error('PRACTICE engine missing');
          var validation = window.PRACTICE.validate();
          if (!validation.ok) throw new Error('Practice validation failed: ' + validation.malformed.length + ' malformed, ' + validation.missingTasks.length + ' missing tasks, ' + validation.malformedQueue.length + ' queue issues');
          var summary = window.PRACTICE.getSummary();
          if (!summary || !Array.isArray(summary.skills) || !Array.isArray(summary.due)) throw new Error('Practice summary has unexpected shape');
          return validation.scenarioCount + ' cases · ' + summary.due.length + ' due weak skill(s)';
        }
      },
      {
        name: 'Dashboard refresh probe',
        run: function(){
          if (typeof window.refreshDashboard !== 'function') throw new Error('refreshDashboard missing');
          window.refreshDashboard();
          return 'Dashboard refreshed';
        }
      },
      {
        name: 'Runtime contract probe',
        run: function(){
          if (typeof window.runContractAudit !== 'function') throw new Error('runContractAudit missing');
          var issues = window.runContractAudit();
          if (!Array.isArray(issues)) throw new Error('Contract audit returned unexpected shape');
          if (issues.length) throw new Error(issues.length + ' contract issue(s)');
          return 'Required IDs/functions and DOM structure passed';
        }
      }
    ];

    for (var pr = 0; pr < probes.length; pr++) {
      var probe = probes[pr];
      var beforeErr4 = capturedErrors.length;
      try {
        var detail = probe.run();
        await diagnosticsSettleUI();
        push('probe', true, probe.name, detail);
      } catch (e) {
        push('probe', false, probe.name, e && e.message ? e.message : String(e));
      }
      if (capturedErrors.length > beforeErr4) {
        var recent4 = capturedErrors[capturedErrors.length - 1];
        push('runtime', false, 'Runtime error after ' + probe.name, recent4.message);
      }
    }
  } finally {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandled);
    try {
      if (typeof window.go === 'function' && originalPage) {
        window.go(originalPage);
        await diagnosticsSettleUI();
      }
      if (typeof window.goTab === 'function' && originalPage && originalTab) {
        var tabs = tabsByPage[originalPage] || [];
        if (tabs.indexOf(originalTab) !== -1) {
          window.goTab(originalPage, originalTab);
          await diagnosticsSettleUI();
        }
      }
    } catch(e) {}
  }

  var okCount = findings.filter(function(r){ return r.ok; }).length;
  var total = findings.length;
  var failCount = total - okCount;
  var groups = {
    routeActive: findings.filter(function(r){ return r.kind === 'route-active'; }),
    tabActive: findings.filter(function(r){ return r.kind === 'tab-active'; }),
    clickSafe: findings.filter(function(r){ return r.kind === 'click-safe'; }),
    probe: findings.filter(function(r){ return r.kind === 'probe'; }),
    runtime: findings.filter(function(r){ return r.kind === 'runtime'; })
  };
  var failures = findings.filter(function(r){ return !r.ok; });
  var passes = findings.filter(function(r){ return r.ok; });

  function renderRows(rows){
    if (!rows.length) return '<div style="color:var(--text-muted);">No items in this section.</div>';
    return rows.map(function(r){
      return `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);">
          <div>
            <div style="font-weight:700;">${diagnosticsEscape(r.title)}</div>
            <div style="color:var(--text-muted);font-size:0.9rem;margin-top:2px;">${diagnosticsEscape(r.detail)}</div>
          </div>
          <div class="badge ${r.ok ? 'badge-good' : 'badge-warn'}">${r.ok ? 'OK' : 'FAIL'}</div>
        </div>
      `;
    }).join('');
  }

  var reportHtml = `
    <div class="card diagnostics-report" style="margin-top:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-weight:800;">Deep Active Test Mode: ${okCount}/${total} checks passed</div>
          <div style="color:var(--text-muted);margin-top:4px;">Completed ${diagnosticsRunStamp()} · routes, tabs, safe clicks, metrics, dashboard, and runtime contracts executed.</div>
        </div>
        <div class="badge ${failCount === 0 ? 'badge-good' : 'badge-warn'}">${failCount === 0 ? 'ACTIVE PASS' : (failCount + ' FAILURES')}</div>
      </div>
      ${failures.length ? `<div class="diagnostics-failure-block"><strong>Needs attention</strong>${renderRows(failures)}</div>` : '<div class="diagnostics-clear-note">Navigation, rendering, click simulation, and runtime probes completed without an error.</div>'}
      <details class="diagnostics-pass-details">
        <summary>${passes.length} passing active checks <span>View evidence</span></summary>
        <div class="diagnostics-row-grid">${renderRows(passes)}</div>
      </details>
    </div>
  `;
  diagnosticsPublishReport('diagActiveTestResults', reportHtml);
  return findings;
}

window.runGuardedMutationTestMode = runGuardedMutationTestMode;
