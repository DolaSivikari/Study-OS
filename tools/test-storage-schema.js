#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const core = read('js/core.js');
const dataManagement = read('js/data-mgmt.js');
const diagnostics = read('js/diagnostics.js');
const failures = [];

function check(name, ok) {
  if (!ok) failures.push(name);
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}`);
}

check('Core owns the storage shape registry', /const STORAGE_SHAPES = Object\.freeze\(\{/.test(core));
check('Knowledge records are protected as an array', /knowledge:'array'/.test(core));
check('Backup validation consumes the shared registry', /window\.STUDYOS_STORAGE_SHAPES/.test(dataManagement));
check('Diagnostics consumes the shared registry', /window\.STUDYOS_STORAGE_SHAPES/.test(diagnostics));
check('Backup validation has no private array registry', !/const arrays = new Set/.test(dataManagement));
check('Diagnostics has no private array or object registries', !/diagnostics(Array|Object)StorageNames/.test(diagnostics));
check('Storage writes catch persistence failures', /function serializeAndStore\(key, value\)[\s\S]*catch \(error\)/.test(core));
check('Failed storage writes do not emit change events', /if \(!serializeAndStore\(k, v\)\) return false/.test(core));

if (failures.length) {
  console.error(`\n${failures.length} storage-schema check(s) failed.`);
  process.exit(1);
}
console.log('\nStorage-schema checks passed.');