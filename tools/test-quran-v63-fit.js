#!/usr/bin/env node
'use strict';
// V63.1 — true page fit.
//
// "Fit" mode used to be a CSS clamp guessed from viewport width that never
// checked its own result, so a dense page still scrolled. It now measures and
// binary-searches the Arabic type size until the sheet fits the stage.
//
// The search is the part that has to be right: it must always return a size
// that FITS (never one that overflows), and it must return the LARGEST such
// size, or pages read smaller than they need to.

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let passed = 0;
function check(name, ok, detail = '') {
  if (!ok) { console.error(`FAIL — ${name}${detail ? ` (${detail})` : ''}`); process.exitCode = 1; return; }
  passed++; console.log(`PASS ${String(passed).padStart(2, '0')} — ${name}`);
}

const quranSrc = fs.readFileSync(path.join(root, 'js/quran.js'), 'utf8');

// Extract the pure search function and evaluate it in isolation.
const fnMatch = quranSrc.match(/function quranMushafFitScale\(fits, minScale, iterations\) \{[\s\S]*?\n\}/);
check('Fit search is a separable pure function', !!fnMatch);
const quranMushafFitScale = new Function(fnMatch[0] + '; return quranMushafFitScale;')();

const MIN = 0.55, ITER = 7;

// A page whose content overflows above `threshold`.
const pageNeeding = threshold => scale => scale <= threshold;

// ---- correctness ---------------------------------------------------------
check('A page that already fits stays at full size',
  quranMushafFitScale(pageNeeding(1), MIN, ITER) === 1);

check('Never returns a size that overflows', [0.6, 0.7, 0.8, 0.9, 0.95, 0.99].every(t => {
  const s = quranMushafFitScale(pageNeeding(t), MIN, ITER);
  return pageNeeding(t)(s);
}), 'a returned size that does not fit is the one unacceptable failure');

check('Returns close to the largest size that fits', [0.6, 0.75, 0.9].every(t => {
  const s = quranMushafFitScale(pageNeeding(t), MIN, ITER);
  return (t - s) < 0.01;   // 7 iterations over [0.55,1] ⇒ ~0.0035 precision
}), 'converging low would make every page read smaller than it needs to');

check('Respects the readable floor when nothing fits',
  quranMushafFitScale(() => false, MIN, ITER) === MIN,
  'the page then scrolls, which is better than unreadable type');

check('A page needing exactly the floor is handled',
  quranMushafFitScale(pageNeeding(MIN), MIN, ITER) === MIN);

check('Never returns above 1 — fit must not enlarge past a chosen size',
  [0.6, 1, 2].every(t => quranMushafFitScale(pageNeeding(t), MIN, ITER) <= 1));

check('Never returns below the floor',
  [0.1, 0.4, 0.56].every(t => quranMushafFitScale(pageNeeding(t), MIN, ITER) >= MIN));

// ---- cost ----------------------------------------------------------------
let calls = 0;
quranMushafFitScale(s => { calls++; return s <= 0.8; }, MIN, ITER);
check('Bounded measurement cost', calls <= ITER + 3, calls + ' layout measurements');

// ---- wiring --------------------------------------------------------------
check('Auto-fit runs after every page render',
  /function quranMushafAfterRender\(\)[\s\S]{0,220}quranMushafAutoFit\(\)/.test(quranSrc));
check('Auto-fit re-runs on resize',
  /addEventListener\('resize'[\s\S]{0,160}quranMushafAutoFit\(\)/.test(quranSrc));
check('Measurement is batched into an animation frame',
  /requestAnimationFrame\(function \(\) \{[\s\S]{0,120}quranMushafAutoFitNow\(\)/.test(quranSrc));
// V63.4 — Readable mode must RESTORE the chosen size, never clear it.
//
// The renderer writes the Arabic size as an inline style. Auto-fit writes to
// the same inline property, so `fontSize = ''` deleted the renderer's size as
// well as the measured one. There is no CSS font-size for .quran-mushaf-arabic
// outside fit mode, so the text fell back to the inherited body size and
// "Readable" rendered SMALLER than "Fit page" — the opposite of its name.
// Assert against CODE, not prose — the comment above the fix necessarily
// quotes the broken line it replaced.
const quranCode = quranSrc
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');

check('Readable mode restores the chosen size rather than clearing it',
  /mushafFitMode !== 'fit'[\s\S]{0,120}fontSize = base\.toFixed/.test(quranCode)
  && !/fontSize = ''/.test(quranCode),
  'clearing the inline size drops it to the inherited body size');

check('Readable uses exactly the size the renderer computes',
  /const base = QURAN_BASE_ARABIC_REM \* quranReadState\.fontScale/.test(quranSrc)
  && /const arabicSize = \(QURAN_BASE_ARABIC_REM \* quranReadState\.fontScale\)/.test(quranSrc));

check('Readable is never smaller than a fitted page',
  /fontSize = base\.toFixed/.test(quranSrc) && /fontSize = \(base \* scale\)\.toFixed/.test(quranSrc),
  'fit scales base DOWN by <=1, so readable at base is always >= fit');

const stylesForArabic = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const arabicRule = stylesForArabic.match(/\n\.quran-mushaf-arabic \{[^}]*\}/);
check('There is still no CSS font-size to fall back on — so the JS must set it',
  arabicRule && !/font-size/.test(arabicRule[0]),
  'documents why clearing the inline size was fatal');
check('Measures the sheet height, which carries the padding',
  /paper\.scrollHeight <= available/.test(quranSrc));

// ---- the CSS conflict this had to survive --------------------------------
const styles = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const fitRule = styles.match(/\.quran-mushaf-reader\.quran-mushaf-fit-fit \.quran-mushaf-arabic \{[^}]*\}/);
check('Fit-mode font-size is no longer !important',
  fitRule && !/font-size:[^;]*!important/.test(fitRule[0]),
  'an !important rule beats the inline size, so fit could never fit');

const mushafCss = fs.readFileSync(path.join(root, 'css/mushaf-reader-page.css'), 'utf8');
check('Stage still scrolls, so a too-dense page is never clipped',
  !/quran-mushaf-fit-fit \.quran-mushaf-stage \{[^}]*overflow-y:\s*hidden/.test(mushafCss));

// ---- width ---------------------------------------------------------------
check('Route is widened for large screens',
  /#mushaf\.mushaf-focus-page \{[^}]*width: min\(100%, 1760px\)/.test(mushafCss));
// V63.2: the sheet is no longer edge-to-edge. It has a page-like maximum and
// is centred, so a wide screen reads as a page on a surface rather than text
// stretched across the whole monitor.
check('Sheet has a page-like maximum width and is centred',
  /#mushaf \.quran-mushaf-paper \{[^}]*width: min\(100%, 1180px\)/.test(mushafCss)
  && /#mushaf \.quran-mushaf-paper \{[^}]*margin-inline: auto/.test(mushafCss));
check('The workspace around it carries the extra width as a frame',
  /\.mushaf-reader-workspace \{[^}]*border: 1px solid/.test(mushafCss)
  && /#mushaf\.mushaf-focus-page \{[^}]*width: min\(100%, 1760px\)/.test(mushafCss));
check('Focus view keeps the corner page-turn buttons',
  /body\.mushaf-reading-focus \.quran-mushaf-turn \{[^}]*opacity: 1/.test(mushafCss),
  'focus view has no other control surface');

// ---- focus view must fill exactly 100dvh ---------------------------------
// The nav is absolutely positioned at the bottom of .quran-mushaf-reader. If
// anything in the chain above it overflows the page, `overflow:hidden` clips
// the bottom strip and the buttons go with it — rendered, but below the cut.
// That is exactly what happened: the block stack summed to 100dvh + 90px.
// These checks make the layout structural instead of arithmetic.
const focusCss = mushafCss.slice(mushafCss.indexOf('body.mushaf-reading-focus { overflow: hidden; }'));

check('Focus page is a flex column pinned to the viewport',
  /#mushaf\.page\.active \{[^}]*display: flex[^}]*flex-direction: column[^}]*height: 100dvh/s.test(focusCss));

const chain = focusCss.match(/(body\.mushaf-reading-focus #quranMushafRoot,[\s\S]*?)\{([^}]*)\}/);
check('Every element between page and sheet participates in that column',
  !!chain
  && ['quranMushafRoot', 'mushaf-reader-workspace', 'quran-surah-card', 'quran-mushaf-reader']
       .every(sel => chain[1].includes(sel))
  && /flex: 1/.test(chain[2]) && /min-height: 0/.test(chain[2]),
  'a missing min-height:0 makes a flex child refuse to shrink, which reintroduces the overflow');

check('No calc(100dvh − Npx) survives in focus view',
  !/calc\(100dvh - \d+px\)/.test(focusCss),
  'hard-coded height arithmetic is what pushed the nav off screen');

check('Command-bar clearance is padding inside the box, not margin added on top',
  /quran-mushaf-reader \{ padding-top: \d+px/.test(focusCss)
  && !/quran-mushaf-stage \{ margin-top: \d\d+px/.test(focusCss));

check('Focus view hides the card header so the sheet is the whole page',
  /quran-surah-header \{ display: none/.test(focusCss)
  || /quran-surah-header[^{]*\{[^}]*display: none/.test(focusCss));

check('The windowed workspace frame is dropped in focus',
  /\.mushaf-reader-workspace \{\s*padding: 0;\s*border: 0/.test(focusCss));

// ---- side-by-side meaning ------------------------------------------------
check('Wide screens place meaning beside the sheet, not under it',
  /@media \(min-width: 1100px\)[\s\S]{0,400}\.quran-mushaf-split \{[\s\S]{0,200}grid-template-columns/.test(mushafCss));
check('The sheet sits on the right, matching RTL reading',
  /\.quran-mushaf-split > \.quran-mushaf-split-page \{ order: 2; \}/.test(mushafCss));
check('Both-mode renders the split container',
  /quran-mushaf-split[\s\S]{0,200}quran-mushaf-split-page/.test(quranSrc));
check('Meaning drawer opens by default in both mode',
  /<details class="quran-mushaf-meaning-drawer" open>/.test(quranSrc));

if (!process.exitCode) console.log(`\n${passed} V63.1 page-fit checks passed.`);
