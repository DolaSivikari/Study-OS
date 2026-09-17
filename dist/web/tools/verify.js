#!/usr/bin/env node
/* ============================================================
   StudyOS static verification — run before claiming any release done:

       node tools/verify.js

   Zero dependencies. Pure static analysis (no browser needed).
   Exit code 0 = all checks PASS. Non-zero = at least one FAIL.

   Checks:
     0. data/contracts.js (window.STUDYOS_CONTRACTS) loads — the single
        source of truth for routes/tabs/required IDs/functions, shared
        with js/diagnostics.js runContractAudit()
     1. All JS files parse (syntax check)
     2. No duplicate global function declarations
     3. All inline event handlers (onclick etc.) resolve to known functions
     4. No duplicate static DOM IDs in index.html
     5. All literal getElementById() targets exist somewhere (warn-level
        for dynamic IDs, fail-level for contract IDs)
     6. All go('...') route targets exist in router PAGE_MAP
     7. All PAGE_MAP pages have content: a pages/*.page.js STUDYOS_PAGES entry
        (V20+) or, as a fallback, an inline <template id="tpl-..."> in index.html
     7b. data/contracts.js routes match router.js PAGE_MAP exactly (drift check)
     8. All goTab() tab panels (id="tab-...") exist
     8b. data/contracts.js tabs match discovered tab keys exactly (drift check)
     9. All required (contract) DOM IDs exist
    10. All required (contract) global functions are declared
    11. No zombie/legacy compatibility targets introduced

   CONTRACT_IDS / CONTRACT_FUNCTIONS below come from data/contracts.js
   (window.STUDYOS_CONTRACTS), same as js/diagnostics.js runContractAudit().
   A hardcoded fallback is used only if that file is missing/broken — see
   the "data/contracts.js loaded" check output if that happens.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/* ---------------- CONTRACT ----------------
   Single source of truth: data/contracts.js (window.STUDYOS_CONTRACTS),
   the same file js/diagnostics.js runContractAudit() reads at runtime.
   Loaded here via vm with a stub `window` so this stays a plain script
   (no ES modules — must still work from file:// in the browser). Falls
   back to a hardcoded copy if data/contracts.js is missing or fails to
   parse, so verify.js never goes fully blind. ---------------- */

const FALLBACK_CONTRACT_IDS = [
  'pageContainer', 'commitmentHeadsUp', 'commitmentBell', 'commitmentBellCount',
  'operatorRoot', 'doctrineRoot', 'captureInboxRoot', 'focusOverlay',
  'doctrineModal', 'doctrineModalTitle', 'doctrineModalBody',
  'doctrineModalPrimary', 'doctrineModalSecondary',
  'modelGraphModal', 'modelGraphCanvas',
  'blindSpotCard', 'todayFocusTask', 'dashStrategic', 'dashMomentumChart',
  'momentumTrendCard', 'dashLearn', 'dashWisdom', 'dailyQuoteText',
  'disciplineSparkline', 'hoursSparkline',
  'v7Time', 'v7Risk', 'v7Momentum', 'habitsMomentum', 'habitsMomentumChart',
  'scienceSummary', 'scienceCycleCard', 'scienceCycleHistory', 'scienceEvidenceList',
  'profileLabRoot', 'qualityLoopRoot', 'commQualityBehaviors', 'commOutcome',
  'goalModal', 'taskModal', 'timeModal', 'timeLearningDomain', 'habitModal', 'flashcardModal',
  'contactModal', 'interactionModal', 'reviewDetailModal', 'eventModal',
  'journalModal', 'knowledgeModal', 'quickCaptureModal', 'decisionModal', 'qualityReviewModal',
  'commitmentCenterModal', 'commitmentModalBody', 'commitmentModalFooter'
];

const FALLBACK_CONTRACT_FUNCTIONS = [
  'go', 'goTab', 'studyosIcon',
  'renderDiagnostics', 'renderDoctrine', 'renderOperator',
  'doctrineOpenModal', 'doctrineCreateFlashcardPack', 'doctrineOpenModelGraph',
  'startFocusMode', 'pauseFocusMode', 'exitFocusMode', 'completeFocusMode',
  'openTaskModal', 'openTimeModal', 'openJournalModal', 'openDecisionModal', 'openGoalModal',
  'openQuickCapture', 'renderCaptureInbox', 'studyosSearchContent', 'studyosOpenSearchResult',
  'loadScenario', 'renderJudgmentInsight', 'openPmpModulePractice',
  'renderScienceCoach', 'scienceStartFocus', 'scienceSaveCycle',
  'renderProfileLab', 'profileRecordFeedback', 'profileIsHypothesisEnabled',
  'profileSetGuidanceDensity', 'profileGuidanceDensity',
  'evaluateDecisionGuardrail', 'renderDecisionGuardrail',
  'renderQualityLoop', 'openQualityReviewModal', 'saveQualityReview',
  'toggleCommQualityBehavior', 'setCommOutcome', 'renderExecutionInsight',
  'openCommitmentCenter', 'closeCommitmentCenter', 'renderCommitmentHeadsUp',
  'commitmentRenderCandidatePreview', 'commitmentPromptForSave', 'commitmentGuardActivity',
  'taskDueDate', 'normalizeTaskRecord', 'goalProgress', 'timeEntryLearningDomain',
  'refreshActiveDataSurface', 'showReflectionActionBridge',
  'applySnapshotData', 'clearStudyOSData',
  'initV7UI', 'refreshDashboard'
];

let STUDYOS_CONTRACTS = null;
let contractsLoadError = null;
{
  const contractsPath = path.join(ROOT, 'data', 'contracts.js');
  if (fs.existsSync(contractsPath)) {
    try {
      const sandbox = { window: {}, console };
      vm.createContext(sandbox);
      new vm.Script(fs.readFileSync(contractsPath, 'utf8'), { filename: 'data/contracts.js' })
        .runInContext(sandbox);
      STUDYOS_CONTRACTS = sandbox.window.STUDYOS_CONTRACTS || null;
    } catch (e) {
      contractsLoadError = e.message;
    }
  } else {
    contractsLoadError = 'data/contracts.js not found';
  }
}

const CONTRACT_IDS = (STUDYOS_CONTRACTS && STUDYOS_CONTRACTS.requiredIds) || FALLBACK_CONTRACT_IDS;
const CONTRACT_FUNCTIONS = (STUDYOS_CONTRACTS && STUDYOS_CONTRACTS.requiredFunctions) || FALLBACK_CONTRACT_FUNCTIONS;

/* ---------------- helpers ---------------- */

function walk(dir, out) {
  out = out || [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      walk(p, out);
    } else if (name.endsWith('.js')) {
      out.push(p);
    }
  }
  return out;
}

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

const results = [];   // {name, ok, detail}
const warnings = [];  // strings

function check(name, ok, detail) { results.push({ name, ok, detail: detail || '' }); }

/* ---------------- gather sources ---------------- */

const indexPath = path.join(ROOT, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('FATAL: index.html not found at ' + indexPath);
  process.exit(2);
}
const html = fs.readFileSync(indexPath, 'utf8');

const jsFiles = []
  .concat(fs.existsSync(path.join(ROOT, 'js')) ? walk(path.join(ROOT, 'js')) : [])
  .concat(fs.existsSync(path.join(ROOT, 'data')) ? walk(path.join(ROOT, 'data')) : [])
  .concat(fs.existsSync(path.join(ROOT, 'pages')) ? walk(path.join(ROOT, 'pages')) : [])
  .concat(fs.existsSync(path.join(ROOT, 'modals')) ? walk(path.join(ROOT, 'modals')) : []);

const jsSources = jsFiles.map(f => ({ file: rel(f), code: fs.readFileSync(f, 'utf8') }));

// pages/*.page.js and modals/*.modal.js hold literal page/modal markup as JS
// string literals (window.STUDYOS_PAGES / window.STUDYOS_MODALS). Their IDs
// are just as "static" as index.html's — include them in ID scans below.
const pageModalSources = jsSources.filter(s => s.file.startsWith('pages/') || s.file.startsWith('modals/'));

// Which page keys are registered via window.STUDYOS_PAGES.xxx = ... in pages/*.page.js
const registeredPages = new Set();
{
  const re = /STUDYOS_PAGES(?:\.([A-Za-z_$][\w$]*)|\[\s*['"]([\w-]+)['"]\s*\])\s*=/g;
  for (const s of jsSources) {
    if (!s.file.startsWith('pages/')) continue;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(s.code)) !== null) registeredPages.add(m[1] || m[2]);
  }
}

// A page can still pass route/ID checks while leaking content outside its
// `.page` wrapper. Keep every page template balanced with exactly one root.
{
  const rootFindings = [];
  const voidTags = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
  for (const source of jsSources.filter(s => s.file.startsWith('pages/'))) {
    const markupMatch = source.code.match(/String\.raw`([\s\S]*)`\s*;\s*$/);
    if (!markupMatch) continue;
    let depth = 0;
    let roots = 0;
    const tagRe = /<\/?([A-Za-z][\w:-]*)\b[^>]*>/g;
    let match;
    while ((match = tagRe.exec(markupMatch[1])) !== null) {
      const tag = match[0];
      const name = match[1];
      if (tag.startsWith('</')) {
        depth--;
      } else if (!tag.endsWith('/>') && !voidTags.test(name)) {
        if (depth === 0) roots++;
        depth++;
      }
    }
    if (roots !== 1) {
      rootFindings.push(source.file + ' has ' + roots + ' root elements (final depth ' + depth + ')');
    }
  }
  check('Page templates have one root element', rootFindings.length === 0,
    rootFindings.join(' | ') || 'all page templates have one root');
}

// Inline <script> blocks (no src=) in index.html
const inlineScripts = [];
{
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1].trim()) inlineScripts.push(m[1]);
  }
}

/* ---------------- 1. syntax check ---------------- */
{
  const bad = [];
  for (const s of jsSources) {
    try { new vm.Script(s.code, { filename: s.file }); }
    catch (e) { bad.push(s.file + ' — ' + e.message); }
  }
  inlineScripts.forEach((code, i) => {
    try { new vm.Script(code, { filename: 'index.html<inline #' + (i + 1) + '>' }); }
    catch (e) { bad.push('index.html inline script #' + (i + 1) + ' — ' + e.message); }
  });
  check('JS syntax (' + jsSources.length + ' files + ' + inlineScripts.length + ' inline)',
    bad.length === 0, bad.join(' | ') || 'all parse');
}

/* ---------------- 0. shared contracts file loaded ---------------- */
check('data/contracts.js loaded (shared with js/diagnostics.js)',
  STUDYOS_CONTRACTS !== null,
  STUDYOS_CONTRACTS ? (CONTRACT_IDS.length + ' IDs, ' + CONTRACT_FUNCTIONS.length + ' functions')
    : 'FALLING BACK to hardcoded list — ' + contractsLoadError);

/* ---------------- 2. global functions + duplicates ---------------- */

const globalFns = new Set();
const fnDeclaredIn = new Map(); // name -> [files]
const declRe = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
const winRe = /window\.([A-Za-z_$][\w$]*)\s*=/g;
const topVarRe = /^(?:const|var|let)\s+([A-Za-z_$][\w$]*)\s*=/gm;

function collectGlobals(code, file) {
  let m;
  declRe.lastIndex = 0;
  while ((m = declRe.exec(code)) !== null) {
    // top-level only: declaration must start at column 0
    const lineStart = code.lastIndexOf('\n', m.index) + 1;
    if (m.index !== lineStart) continue;
    globalFns.add(m[1]);
    if (!fnDeclaredIn.has(m[1])) fnDeclaredIn.set(m[1], []);
    fnDeclaredIn.get(m[1]).push(file);
  }
  winRe.lastIndex = 0;
  while ((m = winRe.exec(code)) !== null) globalFns.add(m[1]);
  topVarRe.lastIndex = 0;
  while ((m = topVarRe.exec(code)) !== null) globalFns.add(m[1]);
}
jsSources.forEach(s => collectGlobals(s.code, s.file));
inlineScripts.forEach((c, i) => collectGlobals(c, 'index.html inline #' + (i + 1)));

{
  const dups = [...fnDeclaredIn.entries()]
    .filter(([, files]) => files.length > 1)
    // same-file duplicates are also a problem; cross-file even more so
    .map(([name, files]) => name + ' (' + files.join(', ') + ')');
  check('No duplicate global function declarations', dups.length === 0,
    dups.slice(0, 8).join(' | ') || globalFns.size + ' globals found');
}

/* ---------------- 3. DOM IDs ---------------- */

// Static IDs in index.html + pages/*.page.js + modals/*.modal.js (all literal
// markup, whether it lives directly in index.html or in an extracted file).
const htmlIds = new Map(); // id -> count
{
  const re = /\bid\s*=\s*"([A-Za-z_][\w-]*)"/g;
  const scanIds = (code) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) htmlIds.set(m[1], (htmlIds.get(m[1]) || 0) + 1);
  };
  scanIds(html);
  pageModalSources.forEach(s => scanIds(s.code));
}

// IDs created at runtime inside JS-generated HTML strings or el.id = '...'
const jsIds = new Set();
{
  const patterns = [
    /\bid\s*=\s*\\?"([A-Za-z_][\w-]*)\\?"/g,
    /\bid\s*=\s*\\?'([A-Za-z_][\w-]*)\\?'/g,
    /\.id\s*=\s*['"]([A-Za-z_][\w-]*)['"]/g
  ];
  for (const s of jsSources) {
    for (const re of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(s.code)) !== null) jsIds.add(m[1]);
    }
  }
}

{
  const dups = [...htmlIds.entries()].filter(([, c]) => c > 1)
    .map(([id, c]) => '#' + id + ' x' + c);
  check('No duplicate static DOM IDs in index.html', dups.length === 0,
    dups.slice(0, 10).join(', ') || htmlIds.size + ' unique IDs');
}

const allKnownIds = new Set([...htmlIds.keys(), ...jsIds]);

/* ---------------- 4. getElementById literal targets ---------------- */
{
  const missingContract = [];
  const missingOther = new Set();
  const re = /getElementById\(\s*['"]([A-Za-z_][\w-]*)['"]\s*\)/g;
  const scan = (code) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      const id = m[1];
      if (!allKnownIds.has(id)) {
        if (CONTRACT_IDS.includes(id)) missingContract.push(id);
        else missingOther.add(id);
      }
    }
  };
  jsSources.forEach(s => scan(s.code));
  inlineScripts.forEach(scan);
  scan(html);
  check('getElementById contract targets resolve', missingContract.length === 0,
    missingContract.join(', ') || 'ok');
  if (missingOther.size > 0) {
    warnings.push('getElementById targets not found statically (may be dynamic): ' +
      [...missingOther].slice(0, 15).join(', ') + (missingOther.size > 15 ? ' …' : ''));
  }
}

/* ---------------- 5. routes ---------------- */

let pageMapKeys = [];
let pageMapPages = new Set();
{
  const routerPath = path.join(ROOT, 'js', 'router.js');
  const router = fs.existsSync(routerPath) ? fs.readFileSync(routerPath, 'utf8') : '';
  const blockMatch = router.match(/PAGE_MAP\s*=\s*\{([\s\S]*?)\n\};/);
  if (blockMatch) {
    const body = blockMatch[1];
    const keyRe = /^\s*([A-Za-z_$][\w$]*)\s*:\s*\{\s*page:\s*'([^']+)'/gm;
    let m;
    while ((m = keyRe.exec(body)) !== null) {
      pageMapKeys.push(m[1]);
      pageMapPages.add(m[2]);
    }
  }
  check('Router PAGE_MAP parsed', pageMapKeys.length > 0,
    pageMapKeys.length + ' route keys, ' + pageMapPages.size + ' pages');
}

// every go('x') literal resolves
{
  const missing = new Set();
  const re = /\bgo\(\s*\\?['"]([\w-]+)\\?['"]\s*\)/g;
  const scan = (code) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      if (!pageMapKeys.includes(m[1])) missing.add(m[1]);
    }
  };
  scan(html);
  jsSources.forEach(s => scan(s.code));
  check("All go('...') targets exist in PAGE_MAP", missing.size === 0,
    [...missing].join(', ') || 'ok');
}

// every routed page has content — either an inline <template id="tpl-*">
// still in index.html, or a window.STUDYOS_PAGES.<page> entry in pages/*.page.js
{
  const missing = [...pageMapPages].filter(p =>
    !html.includes('id="tpl-' + p + '"') && !registeredPages.has(p));
  check('All routed pages have page content (<template> or pages/*.page.js)', missing.length === 0,
    missing.join(', ') || pageMapPages.size + ' pages ok');
}

// data/contracts.js routes list must match router.js PAGE_MAP pages exactly —
// this is the drift check Phase 2 exists to catch (forgot to update one of
// two places). Only meaningful once STUDYOS_CONTRACTS actually loaded.
if (STUDYOS_CONTRACTS && Array.isArray(STUDYOS_CONTRACTS.routes)) {
  const contractRoutes = new Set(STUDYOS_CONTRACTS.routes);
  const extra = STUDYOS_CONTRACTS.routes.filter(r => !pageMapPages.has(r));
  const missing = [...pageMapPages].filter(p => !contractRoutes.has(p));
  const drift = extra.concat(missing.map(m => m + ' (missing from contracts.js)'));
  check('data/contracts.js routes match router.js PAGE_MAP', drift.length === 0,
    drift.join(', ') || contractRoutes.size + ' routes in sync');
}

/* ---------------- 6. tab panels ---------------- */
{
  const tabs = new Set();
  const re = /\bgoTab\(\s*\\?['"][\w-]+\\?['"]\s*,\s*\\?['"]([\w-]+)\\?['"]\s*\)/g;
  const scan = (code) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) tabs.add(m[1]);
  };
  scan(html);
  jsSources.forEach(s => scan(s.code));
  // default tabs from router.js renderForPage
  ['protocol','goals','learn','knowledgevault','horizon','review','guide'].forEach(t => tabs.add(t));
  const missing = [...tabs].filter(t => !allKnownIds.has('tab-' + t));
  check('All tab panels (id="tab-*") exist', missing.length === 0,
    missing.join(', ') || tabs.size + ' tabs ok');

  if (STUDYOS_CONTRACTS && Array.isArray(STUDYOS_CONTRACTS.tabs)) {
    const contractTabs = new Set(STUDYOS_CONTRACTS.tabs);
    const extra = STUDYOS_CONTRACTS.tabs.filter(t => !tabs.has(t));
    const missingFromContracts = [...tabs].filter(t => !contractTabs.has(t));
    const drift = extra.concat(missingFromContracts.map(m => m + ' (missing from contracts.js)'));
    check('data/contracts.js tabs match discovered tab keys', drift.length === 0,
      drift.join(', ') || contractTabs.size + ' tabs in sync');
  }
}

/* ---------------- 7. inline event handlers resolve ---------------- */
{
  const BUILTINS = new Set([
    'if','else','for','while','switch','return','function','typeof','new','in','of',
    'JSON','String','Number','Boolean','Array','Object','Date','Math','parseInt','parseFloat',
    'alert','confirm','prompt','setTimeout','setInterval','requestAnimationFrame',
    'encodeURIComponent','decodeURIComponent','isNaN','fetch','print'
  ]);
  const missing = new Map(); // fn -> where
  const handlerRe = /\bon(?:click|change|input|submit|keyup|keydown|keypress|blur|focus)\s*=\s*(\\?)(["'])((?:(?!\2)[\s\S]|\\\2)*?)\2/g;
  const callRe = /(^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g;

  const scan = (code, where) => {
    handlerRe.lastIndex = 0;
    let m;
    while ((m = handlerRe.exec(code)) !== null) {
      const body = m[3];
      callRe.lastIndex = 0;
      let c;
      while ((c = callRe.exec(body)) !== null) {
        const fn = c[2];
        if (BUILTINS.has(fn)) continue;
        if (globalFns.has(fn)) continue;
        if (!missing.has(fn)) missing.set(fn, where);
      }
    }
  };
  scan(html, 'index.html');
  jsSources.forEach(s => scan(s.code, s.file));
  const list = [...missing.entries()].map(([fn, where]) => fn + '() [' + where + ']');
  check('All inline event handlers resolve to known functions', list.length === 0,
    list.slice(0, 10).join(', ') || 'ok');
}

/* ---------------- 7b. data-action targets resolve (V25 action registry) ---------------- */
{
  const missing = new Map(); // fn -> where
  let total = 0; // every data-action="..." attribute seen, resolved or not
  const dataActionRe = /\bdata-action\s*=\s*(["'])([\w$]+)\1/g;
  const scan = (code, where) => {
    dataActionRe.lastIndex = 0;
    let m;
    while ((m = dataActionRe.exec(code)) !== null) {
      total++;
      const fn = m[2];
      if (!globalFns.has(fn) && !missing.has(fn)) missing.set(fn, where);
    }
  };
  scan(html, 'index.html');
  jsSources.forEach(s => scan(s.code, s.file));
  const list = [...missing.entries()].map(([fn, where]) => fn + '() [' + where + ']');
  check('All data-action targets resolve to known functions', list.length === 0,
    list.slice(0, 10).join(', ') || (total === 0 ? 'ok (0 in use so far)' : total + ' usage(s), all resolve'));
}

/* ---------------- 8. contract IDs + functions ---------------- */
{
  const missingIds = CONTRACT_IDS.filter(id => !allKnownIds.has(id));
  check('Required contract DOM IDs present', missingIds.length === 0,
    missingIds.join(', ') || CONTRACT_IDS.length + ' IDs ok');

  const missingFns = CONTRACT_FUNCTIONS.filter(fn => !globalFns.has(fn));
  check('Required contract functions declared', missingFns.length === 0,
    missingFns.join(', ') || CONTRACT_FUNCTIONS.length + ' functions ok');
}

/* ---------------- 9. zombie / legacy compat targets ---------------- */
{
  const re = /\bid\s*=\s*"((?:compat|legacy|zombie|old)[\w-]*)"/gi;
  const found = [];
  let m;
  while ((m = re.exec(html)) !== null) found.push(m[1]);
  check('No zombie/legacy compat IDs in index.html', found.length === 0,
    found.join(', ') || 'ok');
}

/* ---------------- 10. storage accesses use the K registry ---------------- */
{
  const raw = [];
  const accessRe = /\b(?:get|set|arr)\(\s*(['"])((?:hcc_|studyos_)[^'"]+)\1/g;
  const derivedRe = /\b(?:get|set|arr)\(\s*K\.[A-Za-z_$][\w$]*\s*\+/g;
  jsSources.forEach(s => {
    if (s.file === 'js/core.js') return;
    let m;
    accessRe.lastIndex = 0;
    while ((m = accessRe.exec(s.code)) !== null) raw.push(m[2] + ' [' + s.file + ']');
    derivedRe.lastIndex = 0;
    while ((m = derivedRe.exec(s.code)) !== null) raw.push('derived K key [' + s.file + ']');
  });
  check('Storage accesses use K registry', raw.length === 0,
    raw.slice(0, 10).join(', ') || 'ok');
}

/* ---------------- 11. feature modules use the storage/event boundary ---------------- */
{
  const bypasses = [];
  const directRe = /\blocalStorage\.(?:getItem|setItem|removeItem|clear)\s*\(/g;
  const allowed = new Set(['js/core.js', 'js/data-mgmt.js', 'js/diagnostics.js']);
  jsSources.forEach(s => {
    if (allowed.has(s.file)) return;
    directRe.lastIndex = 0;
    if (directRe.test(s.code)) bypasses.push(s.file);
  });
  check('Feature storage writes use event-aware helpers', bypasses.length === 0,
    bypasses.join(', ') || 'ok');
}

/* ---------------- 12. dead-code guard (V56, audit R12) ---------------- */
/* Any top-level `function NAME()` whose name never appears anywhere else in
   the app (all js sources + index.html, including string-built onclick
   handlers and data-action attributes) is dead code. IIFEs are excluded
   automatically: `(function name(){…})()` is not at column 0, and functions
   nested inside IIFEs are indented. Names invoked ONLY via dynamic
   dispatch (window[name]) must be listed in the allowlist with a reason. */
{
  const DEAD_CODE_ALLOWLIST = new Set([
    // (empty — add 'fnName', with a comment naming the dynamic call site)
  ]);
  const topLevelFns = new Map(); // name -> file
  jsSources.forEach(s => {
    let m;
    declRe.lastIndex = 0;
    while ((m = declRe.exec(s.code)) !== null) {
      const lineStart = s.code.lastIndexOf('\n', m.index) + 1;
      if (m.index !== lineStart) continue; // top-level only (column 0)
      if (!topLevelFns.has(m[1])) topLevelFns.set(m[1], s.file);
    }
  });
  // Count whole-word occurrences across every source, including index.html.
  const corpus = jsSources.map(s => s.code).join('\n') + '\n' + html;
  const counts = new Map();
  const idRe = /[A-Za-z_$][\w$]*/g;
  let t;
  while ((t = idRe.exec(corpus)) !== null) {
    const name = t[0];
    if (topLevelFns.has(name)) counts.set(name, (counts.get(name) || 0) + 1);
  }
  const dead = [];
  topLevelFns.forEach((file, name) => {
    if (DEAD_CODE_ALLOWLIST.has(name)) return;
    if ((counts.get(name) || 0) <= 1) dead.push(name + '() [' + file + ']');
  });
  check('No orphaned top-level functions (dead-code guard)', dead.length === 0,
    dead.slice(0, 10).join(', ') || topLevelFns.size + ' top-level functions all referenced');
}

/* ---------------- 13. V62.1 UI-integrity guards ----------------
   Added after the V61 regression. V61 transplanted a design prototype over
   pages/*.page.js and preserved the "DOM ID multiset" by moving the original
   markup into a `.compatibility-roots` wrapper styled display:none!important.
   Every existing check passed — 19/19 here, 194/196 at runtime — while 34
   controls had no handler and 61 live render targets were invisible.

   These three guards assert what those checks could not: that the user can
   see the output and that the buttons are connected. Do not weaken them to
   make a redesign pass; fix the redesign. */
{
  const pageFiles = fs.readdirSync(path.join(ROOT, 'pages')).filter(f => f.endsWith('.page.js'));
  const pageSrc = new Map(pageFiles.map(f => [f, fs.readFileSync(path.join(ROOT, 'pages', f), 'utf8')]));
  const cssAll = fs.readdirSync(path.join(ROOT, 'css')).filter(f => f.endsWith('.css'))
    .map(f => fs.readFileSync(path.join(ROOT, 'css', f), 'utf8')).join('\n');

  // 13a) No page markup inside an UNCONDITIONALLY hidden wrapper.
  //
  // The signature we are hunting is exactly the `.compatibility-roots` shape:
  //   * CSS hides the class with display:none AND !important, so no renderer
  //     can reveal it by setting element.style.display; and
  //   * no JavaScript ever references the class, so nothing toggles it; yet
  //   * page templates put real markup inside it.
  //
  // Classes the app toggles at runtime (.page, .tab-panel, .modal, overlays,
  // conditional buttons) are legitimately hidden and are excluded because JS
  // references them.
  // Behaviour corpus only: js/**. pages/** and modals/** are markup that
  // happens to live in .js files — including them would let a hidden wrapper
  // exclude itself just by appearing in its own template.
  const jsForClasses = jsSources
    .filter(s => /^js[\\/]/.test(s.file))
    .map(s => s.code).join('\n');
  const hidden = [];
  const hideRe = /\.([\w-]+)\s*\{([^}]*)\}/gi;
  let hm;
  while ((hm = hideRe.exec(cssAll)) !== null) {
    const [, cls, body] = hm;
    if (!/display\s*:\s*none\s*!important/i.test(body)) continue;
    if (new RegExp(`['"\`][^'"\`]*\\b${cls}\\b`).test(jsForClasses)) continue; // JS toggles it
    for (const [f, src] of pageSrc) {
      if (new RegExp(`class="[^"]*\\b${cls}\\b`).test(src)) hidden.push(`${f}: .${cls}`);
    }
  }
  check('No page markup inside an unconditionally hidden wrapper', hidden.length === 0,
    hidden.slice(0, 6).join(', ') || 'ok');

  // 13b) No render target buried in hidden markup, and none missing entirely.
  const jsCorpus = jsSources.map(s => s.code).join('\n');
  const referenced = new Set();
  const refRe = /getElementById\(\s*['"]([\w-]+)['"]\s*\)|querySelector(?:All)?\(\s*['"]#([\w-]+)/g;
  let rm;
  while ((rm = refRe.exec(jsCorpus)) !== null) referenced.add(rm[1] || rm[2]);
  const allMarkup = [...pageSrc.values()].join('\n') + '\n' + html + '\n' +
    fs.readdirSync(path.join(ROOT, 'modals')).filter(f => f.endsWith('.modal.js'))
      .map(f => fs.readFileSync(path.join(ROOT, 'modals', f), 'utf8')).join('\n');
  const declaredIds = new Set([...allMarkup.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
  const runtimeCreated = /\bid\s*=\s*['"`]/.test(jsCorpus); // many roots are built in JS
  const missingTargets = runtimeCreated ? [] :
    [...referenced].filter(id => !declaredIds.has(id));
  check('Every JS render target resolves to declared markup', missingTargets.length === 0,
    missingTargets.slice(0, 8).join(', ') || referenced.size + ' targets referenced');

  // 13c) No dead static controls.
  const dead = [];
  for (const [f, src] of pageSrc) {
    for (const m of src.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
      const attrs = m[1];
      if (/\bonclick=|\bdata-action=|\bdata-diag-action=|\btype="submit"/.test(attrs)) continue;
      const label = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      dead.push(`${f.replace('.page.js', '')}:"${label.slice(0, 24)}"`);
    }
  }
  check('No static control without an action', dead.length === 0,
    dead.slice(0, 8).join(', ') || 'all page buttons wired');

  // 13d) Dynamic controls must bind in a way the runtime audit can see.
  //
  // There is no DOM API to enumerate addEventListener listeners, so
  // js/diagnostics.js physically cannot detect them — it checks the onclick
  // attribute, data-action, and the .onclick property. Framework Lab bound 19
  // buttons with addEventListener and every one reported "has no action"
  // despite working. Use studyosBindClick(el, fn) (js/action-registry.js).
  const listenerBound = [];
  for (const s of jsSources) {
    if (!/^js[\\/]/.test(s.file)) continue;
    if (/action-registry\.js$/.test(s.file)) continue;   // defines the helper
    for (const m of s.code.matchAll(/(\w+)\.addEventListener\(\s*['"]click['"]/g)) {
      const target = m[1];
      // Delegated document/window/body listeners are the correct tool and
      // are not per-control bindings.
      if (/^(document|window|body|root|overlay|el)$/.test(target)) continue;
      listenerBound.push(`${s.file}: ${target}.addEventListener('click')`);
    }
  }
  check('Dynamic controls bind via studyosBindClick, not addEventListener',
    listenerBound.length === 0,
    listenerBound.slice(0, 6).join(', ') || 'no audit-invisible click bindings');
}

/* ---------------- report ---------------- */

const failCount = results.filter(r => !r.ok).length;
const pad = (s, n) => (s + ' '.repeat(n)).slice(0, Math.max(n, s.length));

console.log('\nStudyOS verification — ' + new Date().toISOString());
console.log('='.repeat(78));
for (const r of results) {
  console.log(pad(r.ok ? 'PASS' : 'FAIL', 6) + pad(r.name, 52) + (r.detail || ''));
}
console.log('='.repeat(78));
if (warnings.length) {
  console.log('\nWarnings (non-blocking):');
  warnings.forEach(w => console.log('  ! ' + w));
}
console.log('\n' + (results.length - failCount) + '/' + results.length + ' checks passed' +
  (failCount ? ' — ' + failCount + ' FAILED' : ' — OK'));
process.exit(failCount ? 1 : 0);
