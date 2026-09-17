#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const index = read('index.html');
const shell = read('js/app-shell.js');
const mobileCss = read('css/mobile.css');
const mobileJs = read('js/mobile.js');
const router = read('js/router.js');

let passed = 0;
let failed = 0;
function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`PASS ${String(passed + failed).padStart(2, '0')} — ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL ${String(passed + failed).padStart(2, '0')} — ${name}${detail ? `: ${detail}` : ''}`);
  }
}

check('Viewport supports safe areas', /viewport-fit=cover/.test(index));
check('Mobile compatibility stylesheet loads after the design system',
  index.indexOf('css/mobile.css') > index.indexOf('css/design-system.css'));
check('Mobile shell loads after the router',
  index.indexOf('js/mobile.js') > index.indexOf('js/router.js'));
check('Hamburger exposes drawer ARIA state',
  /aria-controls="primarySidebar"/.test(shell) && /aria-expanded="false"/.test(shell));
check('Primary sidebar has a stable controlled ID', /id="primarySidebar"/.test(shell));
check('Phone shell includes safe-area padding', /env\(safe-area-inset-(top|bottom|left|right)\)/.test(mobileCss));
check('Phone form fields use a 16px focus size', /font-size:\s*16px\s*!important/.test(mobileCss));
check('Touch controls establish a 44px baseline', /min-height:\s*44px/.test(mobileCss));
check('Long tab bars are horizontally scrollable',
  /\.filter-bar[\s\S]*overflow-x:\s*auto\s*!important/.test(mobileCss));
check('Doctrine desktop grids collapse on phones',
  /#doctrineView\s*>\s*\.grid/.test(mobileCss) && /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*!important/.test(mobileCss));
check('Bottom navigation accounts for the home indicator',
  /\.mobile-nav[\s\S]*safe-area-inset-bottom/.test(mobileCss));
check('Drawer state includes body scroll lock and ARIA updates',
  /mobile-drawer-open/.test(mobileJs) && /aria-expanded/.test(mobileJs) && /aria-hidden/.test(mobileJs));
check('Active tabs are centered horizontally without vertical page scrolling',
  /bar\.scrollTo\(\{\s*left:\s*target/.test(mobileJs) && !/active\.scrollIntoView/.test(mobileJs));
check('Dynamic viewport height follows visualViewport',
  /visualViewport/.test(mobileJs) && /--app-viewport-height/.test(mobileJs));
check('Router delegates drawer cleanup to the mobile shell', /closeMobileSidebar/.test(router));
check('Mobile bottom navigation still contains six destinations',
  (shell.match(/<nav class="mobile-nav"[\s\S]*?<\/nav>/) || [''])[0].match(/<button/g)?.length === 6);

console.log(`\n${passed} checks passed${failed ? `; ${failed} failed` : ''}.`);
if (failed) process.exit(1);
