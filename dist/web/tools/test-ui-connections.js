#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const index = read('index.html');
const shell = read('js/app-shell.js');
const router = read('js/router.js');
const dashboard = read('pages/dashboard.page.js');
const failures = [];

function check(name, ok) {
  if (!ok) failures.push(name);
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}`);
}

for (const route of ['tasks', 'goals', 'calendar', 'tracker', 'review']) {
  check(`Sidebar exposes direct ${route} destination`,
    new RegExp(`class="nav-link nav-link-sub" data-route="${route}"`).test(shell));
}

check('Mobile navigation exposes Tasks directly',
  /<button data-route="tasks" onclick="go\('tasks'\)">/.test(shell));
check('Router distinguishes direct destinations from parent pages',
  /exactSidebarDestination/.test(router) && /route === target/.test(router));
check('Router keeps parent active for nested tab destinations',
  /!exactSidebarDestination && route === mapping\.page/.test(router));
check('Home keeps the primary action surface above dashboard folds',
  dashboard.indexOf('id="dashCommandDeck"') < dashboard.indexOf('<details class="dash-group"'));
check('Home folds secondary indicators without removing their targets',
  /class="dashboard-secondary-metrics"/.test(dashboard)
  && /id="dashHorizonPct"/.test(dashboard)
  && /id="dashOperatorScore"/.test(dashboard));

if (failures.length) {
  console.error(`\n${failures.length} UI connection check(s) failed.`);
  process.exit(1);
}
console.log('\nUI connection checks passed.');
