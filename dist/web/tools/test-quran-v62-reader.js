#!/usr/bin/env node
'use strict';
// V62.5 — Mushaf reader ergonomics.
//
// Each check here corresponds to a reported reading problem, so a future
// redesign that reintroduces one fails loudly instead of quietly.

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let passed = 0;
function check(name, ok, detail = '') {
  if (!ok) { console.error(`FAIL — ${name}${detail ? ` (${detail})` : ''}`); process.exitCode = 1; return; }
  passed++; console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
}
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

const quranJs = read('js/quran.js');
const followJs = read('js/quran-follow-along.js');
const mushafPage = read('pages/mushaf.page.js');
const mushafCss = read('css/mushaf-reader-page.css');
const stylesCss = read('css/styles.css');

// ---- 1. recitation can be stopped in focus view --------------------------
check('Focus view exposes a recitation transport',
  /id="quranMushafFocusTransport"/.test(mushafPage));
check('Focus transport can start and pause',
  /id="quranMushafFocusPlay"[^>]*onclick="quranFollowAlongPlayPause\(\)"/.test(mushafPage));
check('Focus transport can STOP — the reported gap',
  /id="quranMushafFocusStop"[^>]*onclick="quranFollowAlongStop\(\)"/.test(mushafPage));
check('Transport is hidden outside focus view and shown inside it',
  /\.mushaf-focus-transport\s*\{[^}]*display:\s*none/.test(mushafCss)
  && /body\.mushaf-reading-focus \.mushaf-focus-transport \{[^}]*display:\s*inline-flex/.test(mushafCss));
check('Transport mirrors live playback state',
  /quranMushafFocusPlay/.test(followJs) && /quranMushafFocusStop/.test(followJs));
check('Opening focus view syncs the transport, so it cannot show a stale play icon',
  /quranFollowUpdateBar/.test(quranJs.slice(quranJs.indexOf('function quranMushafToggleFocus'))));
check('Transport does not collide with the Exit button',
  /\.mushaf-focus-transport\s*\{[^}]*left:/.test(mushafCss)
  && /\.mushaf-focus-exit\s*\{[^}]*right:/.test(mushafCss));

// ---- 2. last verse must be reachable -------------------------------------
check('Page turning no longer overlays the sheet',
  !/margin-top:\s*-\d+px/.test(mushafCss),
  'a negative-margin bar was covering the final lines');
check('Sheet reserves room below the text for the corner controls',
  /padding:\s*clamp\([^)]*\)\s+clamp\([^)]*\)\s+clamp\(96px/.test(mushafCss));
check('Phone layout reserves the same room',
  /padding:\s*22px 16px 88px/.test(mushafCss));
check('Page footer sits above the reserved area', /footer \{ bottom: clamp\(60px/.test(mushafCss));

// ---- 3. follow indicator must stay readable ------------------------------
check('Highlight no longer inverts the word to white',
  !/\.word-audio-active \* \{ color: #fff/.test(stylesCss)
  && !/\.word-audio-active\s*\{[^}]*color:\s*#fff/.test(stylesCss));
check('Highlight keeps tajweed colouring on the current word',
  /\.word-audio-active\s*\{[^}]*background:\s*color-mix/.test(stylesCss));
check('Current word is still unmistakable (underline retained)',
  /\.word-audio-active\s*\{[^}]*box-shadow:\s*inset[^}]*var\(--accent\)/.test(stylesCss));

// ---- 4. corner page turning ----------------------------------------------
check('Navigation renders two corner turn buttons',
  /quran-mushaf-turn quran-mushaf-turn-next/.test(quranJs)
  && /quran-mushaf-turn quran-mushaf-turn-prev/.test(quranJs));
check('Turn buttons are anchored to opposite bottom corners',
  /\.quran-mushaf-turn-next \{ inset-inline-start:/.test(mushafCss)
  && /\.quran-mushaf-turn-prev \{ inset-inline-end:/.test(mushafCss));
check('Arrows follow RTL reading order (next on the left)',
  /quran-mushaf-turn-next"[^>]*onclick="quranMushafNextPage\(\)"/.test(quranJs));
check('Turn buttons disable at the first and last page',
  /page >= QURAN_MUSHAF_PAGE_MAX \? 'disabled'/.test(quranJs)
  && /page <= QURAN_MUSHAF_PAGE_MIN \? 'disabled'/.test(quranJs));
check('Only the buttons are clickable, not the strip across the page',
  /\.quran-mushaf-navigation \{[^}]*pointer-events:\s*none/.test(mushafCss)
  && /\.quran-mushaf-turn \{[^}]*pointer-events:\s*auto/.test(mushafCss));
check('Turn buttons stay visible on touch, where there is no hover',
  /\.quran-mushaf-turn \{ opacity: 1;/.test(mushafCss));

// ---- 5. page jump survives every move ------------------------------------
// V62.5 moved it from the bottom bar to a page-meta strip; V63.2 deleted that
// strip and moved it into the command bar. What must hold across all of those
// is simply that it still exists, is reachable, and keeps its bounds.
check('Page jump lives in the command bar',
  /mushaf-reader-commandbar[\s\S]{0,900}mushaf-commandbar-jump/.test(quranJs));
check('The page-meta strip is gone',
  !/class="quran-mushaf-page-meta"/.test(quranJs),
  'it was a third copy of Juz/Hizb/Surah costing reading height');
check('Page jump keeps its bounds and keyboard handling',
  /min="1" max="604"/.test(quranJs)
  && /quranMushafSetPageFromInput/.test(quranJs)
  && /quranMushafHandlePageInputKey/.test(quranJs));

// ---- 6. one frame, not three ---------------------------------------------
check('Nested card chrome removed so the sheet is the frame',
  /#mushaf \.quran-surah-card \{[^}]*border:\s*0/.test(mushafCss)
  && /#mushaf \.quran-surah-card \{[^}]*background:\s*none/.test(mushafCss));
check('Sheet is centred rather than pinned to one edge',
  /#mushaf \.quran-mushaf-paper \{[^}]*margin-inline:\s*auto/.test(mushafCss));

if (!process.exitCode) console.log(`\n${passed} V62.5 Mushaf reader checks passed.`);
