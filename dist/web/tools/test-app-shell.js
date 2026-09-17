#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const index = read('index.html');
const shell = read('js/app-shell.js');
const guard = read('css/startup-guard.css');
const failures = [];

function check(name, ok) {
  if (!ok) failures.push(name);
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}`);
}

check('Index is a bootstrap document, not a shell markup container',
  index.length < 16000 && !/<nav class="sidebar"/.test(index) && !/<div class="command-palette"/.test(index));
check('Index loads the external shell before page-loader',
  index.indexOf('js/app-shell.js') > 0 && index.indexOf('js/app-shell.js') < index.indexOf('js/page-loader.js'));
check('Startup guard CSS is external',
  index.includes('css/startup-guard.css') && !/<style[^>]*studyos-startup-guard-style/.test(index));
check('Shell owns the application mount points',
  ['primarySidebar', 'pageContainer', 'modalContainer', 'focusOverlay', 'commandPalette', 'studyTimer'].every(id => shell.includes(`id="${id}"`)));
check('Shell preserves priority navigation',
  ['tasks', 'goals', 'calendar', 'tracker', 'review'].every(route => shell.includes(`data-route="${route}"`)));
check('Shell remains a standalone classic script',
  !/import\s+|export\s+/.test(shell) && /insertAdjacentHTML\('beforebegin', shellMarkup\)/.test(shell));
check('Router explicitly exports the shell navigation API',
  /window\.go\s*=\s*go/.test(read('js/router.js'))
  && /window\.goTab\s*=\s*goTab/.test(read('js/router.js')));
check('Portable build can inline the shell source',
  read('tools/build-universal.js').includes("inlineScript(src, read(src))"));

if (failures.length) {
  console.error(`\n${failures.length} app-shell check(s) failed.`);
  process.exit(1);
}
console.log('\nApp-shell modularity checks passed.');
