#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let passed = 0;
function check(name, ok, detail='') {
  if (!ok) { console.error(`FAIL — ${name}${detail ? ` (${detail})` : ''}`); process.exitCode = 1; return; }
  passed++; console.log(`PASS ${String(passed).padStart(2,'0')} — ${name}`);
}
const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
const css = fs.readFileSync(path.join(root,'css/unification-v60.css'),'utf8');
const bridge = fs.readFileSync(path.join(root,'js/ui-unification.js'),'utf8');
const pages = ['dashboard','dailyops','planner','study','knowledge','strategy','journal','reviewhub','network','quran','system'];
const tabbedPages = ['dailyops','planner','study','knowledge','strategy','reviewhub','system'];
const pageSrc = id => fs.readFileSync(path.join(root,'pages',`${id}.page.js`),'utf8');
check('V60 stylesheet loads after the mobile compatibility stylesheet', index.indexOf('css/unification-v60.css') > index.indexOf('css/mobile.css'));
check('V60 live unification bridge loads after router and mobile shell', index.indexOf('js/ui-unification.js') > index.indexOf('js/router.js') && index.indexOf('js/ui-unification.js') > index.indexOf('js/mobile.js'));
// ---------------------------------------------------------------------------
// V62.1 — these four checks previously asserted that the design classes were
// present as literal text inside pages/*.page.js. That is the wrong assertion:
// js/ui-unification.js applies them at RUNTIME, to live and dynamically
// rendered markup alike. Requiring them statically is what motivated V61 to
// transplant a design prototype over the live page templates — which stripped
// 34 event handlers and buried 61 live render targets inside a hidden
// `.compatibility-roots` block, while every static test stayed green.
//
// They now assert the two things that actually have to be true:
//   1. the bridge applies each hook, for every routed page; and
//   2. the templates contain the structure the bridge needs to annotate.
// ---------------------------------------------------------------------------
check('Bridge applies the unified page hook and screen label to every routed page',
  /classList\.add\(\s*'studyos-page'/.test(bridge)
  && /setAttribute\(\s*'data-screen-label'/.test(bridge)
  && pages.concat('mushaf').every(id => new RegExp(`\\b${id}\\s*:\\s*'`).test(bridge.split('METRIC_ROOTS')[0]))
  && pages.every(id => new RegExp(`id="${id}"`).test(pageSrc(id))));

check('Bridge activates the primary header hierarchy and every page provides one',
  /annotateHeader\([^)]*directHeaders\[0\][^)]*,\s*true\s*\)/.test(bridge)
  && /classList\.add\(\s*primary\s*\?\s*'page-header-primary'\s*:\s*'page-header-section'\s*\)/.test(bridge)
  && pages.every(id => /class="[^"]*page-header/.test(pageSrc(id))));

check('Bridge activates the section header hierarchy inside tabbed sub-pages',
  /\.tab-panel > \.page-header/.test(bridge)
  && tabbedPages.every(id => /class="tab-panel"|class="[^"]*tab-panel/.test(pageSrc(id))));

// data-tab is metadata only — nothing in js/ or css/ reads it. The invariant
// that matters is that every goTab() control targets a panel that exists, and
// tools/verify.js already enforces that against data/contracts.js.
check('Every goTab() control targets a tab panel that exists',
  tabbedPages.every(id => {
    const text = pageSrc(id);
    const targets = [...text.matchAll(/goTab\(\s*'[^']+'\s*,\s*'([^']+)'\s*\)/g)].map(m => m[1]);
    return targets.length > 0 && targets.every(t => text.includes(`id="tab-${t}"`));
  }));
check('Dynamic metric content is annotated without replacing application content', bridge.includes('MutationObserver') && bridge.includes('classList.add') && !bridge.includes('.innerHTML ='));
check('Metric unification covers static and dynamically rendered cards', css.includes('.ui-metric-grid') && css.includes('.ui-metric-card') && bridge.includes('annotateMetricContainer'));
check('Desktop, tablet, and phone responsive layers are present', css.includes('@media (max-width: 1100px)') && css.includes('@media (max-width: 760px)') && css.includes('@media (max-width: 420px)'));
check('Quran live render roots remain in the modular page', ['quranReadRoot','quranListenRoot','quranUnderstandRoot'].every(id => fs.readFileSync(path.join(root,'pages/quran.page.js'),'utf8').includes(`id="${id}"`)));
check('Protected-data hash report confirms all sacred datasets unchanged', Object.values(JSON.parse(fs.readFileSync(path.join(root,'PROTECTED-DATA-HASHES.json'),'utf8'))).every(x => x.unchanged === true));
check('DOM-ID preservation report confirms page renderer contracts were retained', Object.values(JSON.parse(fs.readFileSync(path.join(root,'DOM-ID-PRESERVATION.json'),'utf8'))).every(x => x.same_multiset === true));
if (!process.exitCode) console.log(`\n${passed} V60 UI-unification checks passed.`);
