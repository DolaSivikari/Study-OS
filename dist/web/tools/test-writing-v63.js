#!/usr/bin/env node
'use strict';
// V63 — structured reflection + writing coach.
//
// The coach makes claims about someone's writing, so its checks have to be
// right and they have to be conservative. A false "this is vague" on good
// prose is worse than a miss: it teaches you to ignore the panel.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
let passed = 0;
function check(name, ok, detail = '') {
  if (!ok) { console.error(`FAIL — ${name}${detail ? ` (${detail})` : ''}`); process.exitCode = 1; return; }
  passed++; console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
}

// Minimal DOM: the coach strips HTML via a detached div.
const ctx = {
  window: {}, console,
  document: {
    createElement: () => ({
      set innerHTML(v) { this._t = String(v).replace(/<[^>]*>/g, ' '); },
      get textContent() { return this._t || ''; }
    }),
    getElementById: () => null
  }
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'data/reflection-formats.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/writing-coach.js'), 'utf8'), ctx);
const W = ctx.window.STUDYOS_WRITING;

// ---- formats -------------------------------------------------------------
check('Writing coach is exported', !!W && typeof W.reviewEntry === 'function');

const formats = W.formats();
check('All five reflection formats are present',
  ['aar', 'wsw', 'star', 'gibbs', 'free'].every(id => formats.some(f => f.id === id)),
  formats.map(f => f.id).join(', '));

check('Every format states what it is for and why it works',
  formats.every(f => f.bestFor && f.why && f.sections.length > 0));

check('Every non-free format cites its origin',
  formats.filter(f => f.id !== 'free').every(f => f.origin && f.origin !== '—'));

const aar = W.format('aar');
check('AAR asks the four canonical questions in order',
  aar.sections.map(s => s.id).join(',') === 'intended,actual,gap,next');

check('Each format ends in a required, checkable step',
  ['aar', 'wsw', 'gibbs'].every(id => {
    const secs = W.format(id).sections;
    return secs[secs.length - 1].required === true && secs[secs.length - 1].actionable === true;
  }));

check('STAR requires a result — the part interviews score',
  W.format('star').sections.find(s => s.id === 'result').required === true);

check('Sections carry sentence stems for a second-language writer',
  formats.filter(f => f.id !== 'free')
    .every(f => f.sections.every(s => Array.isArray(s.stems) && s.stems.length > 0)));

// ---- stats ---------------------------------------------------------------
const sample = 'The plan was to pour slab B. In fact the pump arrived late.';
const stats = W.stats(sample);
check('Word and sentence counting works', stats.words === 13 && stats.sentences === 2, JSON.stringify(stats));
check('HTML is stripped before analysis', W.stats('<p>two <b>words</b></p>').words === 2);
check('Empty input is handled', W.stats('').words === 0 && W.stats(null).words === 0);

// ---- precision -----------------------------------------------------------
const vague = W.reviewSection('The thing was good but we had a lot of problems with the stuff.', null);
const precision = vague.findings.filter(f => f.type === 'precision');
check('Vague words are flagged', precision.length >= 3, precision.map(f => f.message).join(', '));
check('Each flag offers concrete alternatives',
  precision.every(f => f.suggestions.length > 0));
check('Construction-specific alternatives are offered, not generic synonyms',
  JSON.stringify(precision).includes('compliant') || JSON.stringify(precision).includes('non-compliant'));

const clean = W.reviewSection(
  'The pump arrived 90 minutes late, so we poured slab B at 14:20 instead of 12:50. ' +
  'I will confirm delivery windows with the supplier the day before each pour.', null);
check('Precise prose is NOT flagged for vagueness',
  clean.findings.filter(f => f.type === 'precision').length === 0,
  'false positives train you to ignore the panel');

// "late" is vague; "90 minutes late" is not. The check must tell them apart.
check('A quantity in the sentence cures a vague quantity word',
  W.reviewSection('The pump was 90 minutes late.', null)
    .findings.filter(f => f.type === 'precision').length === 0);
check('…but the same word without a quantity is still flagged',
  W.reviewSection('The pump was late again and the crew was slow.', null)
    .findings.some(f => f.type === 'precision' && /late/.test(f.message)));

// ---- hedging -------------------------------------------------------------
const hedged = W.reviewSection(
  'Maybe the crew was probably a bit behind and I think perhaps we sort of ' +
  'lost time, I guess, but possibly it was more or less fine in the end anyway.', null);
check('Heavy hedging is flagged', hedged.findings.some(f => f.type === 'hedging'));
check('A single hedge in a long passage is not flagged',
  W.reviewSection('The pour finished at 15:00. Rebar inspection passed. ' +
    'Maybe the afternoon crew can start earlier tomorrow, which would save an hour ' +
    'of standing time and let the finishers begin before the light goes.', null)
    .findings.filter(f => f.type === 'hedging').length === 0);
check('Short text is not judged for hedging', W.reviewSection('Maybe.', null)
  .findings.filter(f => f.type === 'hedging').length === 0);

// ---- sentence length -----------------------------------------------------
const runOn = W.reviewSection(
  'We started the pour at seven in the morning and the pump was late because the ' +
  'supplier had another job in the east end and then the inspector arrived early ' +
  'which meant we had to stop and walk him through the rebar before we could ' +
  'continue with anything else at all that day.', null);
check('Run-on sentences are flagged', runOn.findings.some(f => f.type === 'length'));
check('Normal sentences are not flagged',
  W.reviewSection('The pump arrived late. We poured at 14:20.', null)
    .findings.filter(f => f.type === 'length').length === 0);

// ---- actionable ----------------------------------------------------------
const actionSec = { id: 'next', actionable: true };
check('A vague intention is flagged as not checkable',
  W.reviewSection('Things should be better organised.', actionSec)
    .findings.some(f => f.type === 'actionable'));
check('A real commitment passes',
  W.reviewSection('I will confirm the delivery window with Metro Ready-Mix on Thursday.', actionSec)
    .findings.filter(f => f.type === 'actionable').length === 0);

// ---- required sections ---------------------------------------------------
check('Missing core sections are reported',
  W.missingRequired({ formatId: 'aar', sections: { intended: 'x', actual: 'y', gap: 'z', next: '' } }).length === 1);
check('A complete entry reports nothing missing',
  W.missingRequired({ formatId: 'aar', sections: { intended: 'x', actual: 'y', gap: 'z', next: 'I will ask' } }).length === 0);

// ---- resurfacing ---------------------------------------------------------
check('Revisit intervals expand', JSON.stringify(W.REVISIT_DAYS) === '[7,30,90]');
check('First revisit is scheduled a week out',
  W.nextRevisitDate({ revisitCount: 0 }, '2026-07-01') === '2026-07-08');
check('Later revisits use the longer intervals',
  W.nextRevisitDate({ revisitCount: 1 }, '2026-07-01') === '2026-07-31'
  && W.nextRevisitDate({ revisitCount: 2 }, '2026-07-01') === '2026-09-29');
check('Revisit count beyond the schedule does not crash',
  typeof W.nextRevisitDate({ revisitCount: 99 }, '2026-07-01') === 'string');

check('Only entries that committed to something get scheduled',
  W.shouldSchedule({ formatId: 'aar', sections: { next: 'I will confirm' } }) === true
  && W.shouldSchedule({ formatId: 'aar', sections: { next: '' } }) === false
  && W.shouldSchedule({ formatId: 'free', sections: { body: 'lots of text' } }) === false);

const entries = [
  { id: 'a', revisitAt: '2026-07-01' },
  { id: 'b', revisitAt: '2026-12-01' },
  { id: 'c', revisitAt: '2026-06-01', revisitClosed: true },
  { id: 'd' }
];
const due = W.dueForRevisit(entries, '2026-07-24');
check('Only open, due entries resurface', due.length === 1 && due[0].id === 'a');

// ---- backward compatibility ---------------------------------------------
const journalJs = fs.readFileSync(path.join(root, 'js/journal.js'), 'utf8');
check('Structured entries still populate `content` for every existing surface',
  /journalComposeContent\(journalActiveFormat, sections\)/.test(journalJs));
check('Older free-text entries reopen unchanged',
  /journalSetFormat\(e\.formatId \|\| 'free'\)/.test(journalJs));

const coreJs = fs.readFileSync(path.join(root, 'js/core.js'), 'utf8');
check('No new storage key and no migration were needed',
  !/reflection|writingCoach/i.test(coreJs.slice(coreJs.indexOf('const K = {'), coreJs.indexOf('};', coreJs.indexOf('const K = {')))));

if (!process.exitCode) console.log(`\n${passed} V63 writing-coach checks passed.`);
