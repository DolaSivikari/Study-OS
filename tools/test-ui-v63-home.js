#!/usr/bin/env node
'use strict';
// V63.5 — Home reorganisation.
//
// Home carried 57 render targets across six equally-weighted sections, so
// everything competed for attention and nothing answered "what do I do now".
// Three metrics appeared twice, SRS three times, and one tile was a literal
// number that no code ever wrote.
//
// The rule this suite enforces: reorganising Home must never LOSE anything.
// Folding is fine; amputation is not. Every render target must survive, or a
// renderer starts writing into null.

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let passed = 0;
function check(name, ok, detail = '') {
  if (!ok) { console.error(`FAIL — ${name}${detail ? ` (${detail})` : ''}`); process.exitCode = 1; return; }
  passed++; console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
}

const dash = fs.readFileSync(path.join(root, 'pages/dashboard.page.js'), 'utf8');
const dashJs = fs.readFileSync(path.join(root, 'js/dashboard.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const ids = [...dash.matchAll(/id="([\w-]+)"/g)].map(m => m[1]);
const unique = new Set(ids);

// ---- nothing lost --------------------------------------------------------
check('Home still declares all 57 render targets', unique.size === 57, `${unique.size} found`);
check('No duplicate IDs introduced by the restructure',
  ids.length === unique.size, `${ids.length} declarations for ${unique.size} ids`);

// The targets that carry the answer must be present and OUTSIDE any fold.
const firstFold = dash.indexOf('<details class="dash-group"');
const aboveFold = dash.slice(0, firstFold);
for (const id of ['v7NextMovePanel', 'todayFocusTask', 'dashCommitmentIntelligence', 'blindSpotCard']) {
  check(`"${id}" is above the fold — it is the answer, not a detail`,
    aboveFold.includes(`id="${id}"`));
}

// ---- the structure -------------------------------------------------------
const groups = [...dash.matchAll(/<details class="dash-group"([^>]*)>[\s\S]*?<span class="dash-group-title">([^<]*)<\/span>/g)]
  .map(m => ({ open: m[1].includes('open'), title: m[2].trim() }));

check('Home folds into five groups', groups.length === 5, groups.map(g => g.title).join(' · '));
check('The navigator opens by default',
  groups[0] && groups[0].title === 'Go to…' && groups[0].open,
  'not knowing where a feature lives was the complaint');
check('The remaining four groups start closed',
  groups.slice(1).every(g => !g.open));
check('Groups are labelled by what is inside them',
  groups.map(g => g.title).join('|') ===
  'Go to…|Learning progress|Plans &amp; tasks|Operating system|System health');

check('Every group carries a one-line description',
  (dash.match(/dash-group-sub/g) || []).length === 5);

// ---- the fake number -----------------------------------------------------
check('The SRS tile is now written by code, not baked into the template',
  /getElementById\('dashSRSCount'\)/.test(dashJs) && /getElementById\('dashSRSHint'\)/.test(dashJs),
  'it shipped as a literal "12 cards" that never changed');
check('The SRS tile reports the same count as everywhere else',
  /dashSRSCount[\s\S]{0,80}dueCards/.test(dashJs));

// ---- styling -------------------------------------------------------------
check('Fold styling exists and hides the native marker',
  /\.dash-group > summary\b/.test(styles)
  && /::-webkit-details-marker \{ display: none/.test(styles));
check('Folds are keyboard- and screen-reader-reachable',
  /<details class="dash-group"/.test(dash) && /<summary>/.test(dash),
  'native details/summary keeps this accessible without JS');

// ---- section content survived intact -------------------------------------
const sectionTargets = {
  'Learning progress': ['dashLearn', 'learningIntegrityCard', 'dashSRSDue', 'domainBalanceCard', 'studyLoadCard', 'momentumTrendCard', 'dashMomentumChart'],
  'Plans &amp; tasks': ['dashStrategic', 'dashGoalsPreview', 'v7TasksPreview', 'dashCalendarPreview', 'strategicPulseCard'],
  'Operating system': ['v7Time', 'v7Risk', 'v7Momentum', 'disciplineSparkline', 'hoursSparkline', 'dashJournalQuick', 'dashWisdom'],
  'System health': ['systemStatusCard', 'operatorScoreCard']
};
for (const [title, targets] of Object.entries(sectionTargets)) {
  const i = dash.indexOf(`<span class="dash-group-title">${title}</span>`);
  const next = dash.indexOf('<details class="dash-group"', i);
  const body = dash.slice(i, next > 0 ? next : dash.length);
  check(`"${title.replace('&amp;', '&')}" kept all its content`,
    targets.every(t => body.includes(`id="${t}"`)),
    targets.filter(t => !body.includes(`id="${t}"`)).join(', '));
}

if (!process.exitCode) console.log(`\n${passed} V63.5 Home-organisation checks passed.`);
