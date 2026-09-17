# StudyOS Tools

## verify.js — pre-release verification

Run from the project root before claiming any change is complete:

```
node tools/verify.js
```

Exit code 0 = all checks pass. Non-zero = at least one FAIL (fix before committing).

### What it checks

| # | Check | Level |
|---|-------|-------|
| 1 | All JS files (js/, data/, pages/, modals/) + inline scripts parse | FAIL |
| 2 | No duplicate top-level function declarations across files | FAIL |
| 3 | No duplicate static DOM IDs in index.html | FAIL |
| 4 | Literal `getElementById()` targets that are contract IDs exist | FAIL |
| 5 | Every `go('...')` target exists in router PAGE_MAP | FAIL |
| 6 | Every routed page has content: `pages/*.page.js` entry or `<template id="tpl-*">` fallback | FAIL |
| 7 | Every `goTab()` tab panel (`id="tab-*"`) exists | FAIL |
| 8 | Inline event handlers (`onclick` etc.) resolve to known globals | FAIL |
| 9 | Contract DOM IDs and contract functions exist (mirror of diagnostics.js) | FAIL |
| 10 | No zombie/legacy/compat IDs introduced in index.html | FAIL |
| 11 | Storage access uses registered `K` keys; no derived one-off keys | FAIL |
| 12 | Feature modules write through event-aware storage helpers | FAIL |
| — | Non-contract `getElementById()` targets not found statically | WARN only |

### Known limitations (static analysis, no browser)

- **Cannot execute the app.** Runtime errors (null derefs, bad state, CSS issues,
  storage migrations) are not caught. The in-app Diagnostics page remains the
  runtime check. Use both: `node tools/verify.js` first, then open the app and
  run the Core Suite. Use Navigation Stress Test and Workflow Mutation Test
  for release-level confidence.
- **Dynamic IDs and dynamic function calls** (built via string concatenation,
  e.g. `'tab-' + name` or `window[fnName]()`) can't be resolved statically —
  they appear as warnings or are skipped.
- **Global detection is heuristic**: top-level `function` declarations at column 0,
  `window.x =` assignments, and top-level `const/var/let`. A function declared
  inside an IIFE but exposed some unusual way could be missed (false FAIL) —
  if that happens, expose it explicitly via `window.fnName = fnName`.
- **onclick parsing is regex-based**: extremely unusual quoting inside
  JS-template-literal HTML could be missed. Keep handlers simple
  (`onclick="fnName(args)"`).
- Route, tab, ID, and function contracts come from `data/contracts.js` and are
  consumed by both `verify.js` and the runtime contract audit. `CONTRACTS.md`
  remains the human-readable explanation and should be updated with new contracts.

### Pages/modals and V31 runtime coverage

`pages/*.page.js` and `modals/*.modal.js` are now the real source of page/modal
markup (window.STUDYOS_PAGES / window.STUDYOS_MODALS). verify.js scans both
directories for syntax, duplicate IDs, and route/page coverage the same way it
scans index.html — no separate check needed when editing an existing page or modal.

V29's scenario schema, 26-task ECO coverage, queue referential integrity,
calibration math, sampler, and Practice → Flashcard → Learning Path workflow are
executable runtime checks. V29.1 adds guarded Journal → Task → Calendar,
Learning Path → Time → Insights, Focus → Doctrine, Goal → Dashboard, Protocol →
Energy, backup migration, two-layer reset, and IndexedDB no-resurrection proofs.
V29.2 adds pure interval/recurrence checks plus a guarded Task + recurring
Calendar + Habit collision fixture that proves inline warnings, the advisory
Save-anyway path, live Calendar/top-bar refresh, and exact restoration.
V29.3 adds runtime checks for the final design stylesheet, local SVG icon
engine, complete route-navigation icon coverage, all 10 primary page headers,
and shared spacing/type/radius tokens. The release harness also walks every
route and tab, verifies dynamically inserted icons, and checks computed shell
dimensions before running all four diagnostic modes.
V30 adds the 25th tab without removing a route or prior tab; it executes the
Science Coach evidence/readiness self-test, adaptive Flashcards scheduling and
queue self-test, Learning Cycle schema and Task-link checks, and a disposable
Science Cycle → Retrieval Task → Planner workflow. The guarded workflow restores
both collections byte-for-byte before reporting success.
V31 adds the 26th tab and 20th runtime modal without removing a route, page,
tab, or prior modal. Safe checks validate the adaptive-profile, feedback,
quality-review, communication-outcome, and decision-guardrail schemas plus all
three branches of the two-sided decision evaluator. Guarded fixtures execute
Profile feedback → prompt state, Communication quality → receiver outcome,
Quality review → canonical verification Task, and Decision editor → live/saved
guardrail, then prove exact restoration of every touched key.
Run the in-app Core Suite, Navigation Stress Test, and Workflow Mutation Test after
the static verifier; static parsing alone cannot prove those data-flow contracts.


## Quran audio reference extraction (V52)

The supplied `quran-database-main` archive stores verse-level audio URLs, not MP3 bytes.
To regenerate the compact StudyOS audio metadata from its SQLite export:

```
python3 tools/extract-quran-audio-references.py /path/to/quran.db.gz --output-dir data
```

The extractor refuses to write output unless every discovered audio edition has
6,236 distinct global ayah IDs and every database URL matches the source template.
Run `node tools/test-quran-v52-audio.js` after regeneration.

## V53 Quran validator checks

```bash
node tools/test-quran-v53-validator.js
```

This verifies the uploaded `quran-validator` reference data against all 6,236
StudyOS Arabic verses, tests exact and normalized full-verse validation, checks
verse ranges, confirms that invalid input is never auto-corrected, and verifies
that protected Quran and Tevhid source files remain byte-identical to V52.


## Quran V54 study tools

Run:

```bash
node tools/test-quran-v54-study.js
```

This verifies bookmark toggling, reflection separation, reading-log
deduplication, streak calculations, tracking persistence, surah completion,
reader wiring, protected-source hashes, and quran.sh MIT attribution.
