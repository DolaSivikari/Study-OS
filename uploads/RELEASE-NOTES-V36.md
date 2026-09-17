# StudyOS V36 - Accessibility Sweep Complete + Dead File Cleanup

Release date: 2026-07-23

## Outcome

V36 closes out the multi-release label/field accessibility sweep started
in V33, and removes one confirmed-dead file. No logic, storage, route,
or DOM contract changed. No existing page or feature was removed.

## What changed

### 1. Label/field association — final batch (12 files, 63 labels scripted + 4 hand-fixed)

Same scripted approach as V34/V35: match a `<label class="form-label">`
immediately followed by its own field, insert `for="<that field's id>"`.

Scripted: `modals/taskModal.modal.js` (6), `habitModal.modal.js` (6),
`eventModal.modal.js` (7), `timeModal.modal.js` (5),
`flVarEditModal.modal.js` (5), `knowledgeModal.modal.js` (4),
`goalModal.modal.js` (4), `flashcardModal.modal.js` (4),
`interactionModal.modal.js` (3), `js/connect.js` (8),
`js/strategic-horizon.js` (6), `pages/system.page.js` (3).

Hand-fixed (4) — the script correctly declined these because the label
text itself contained a nested `<span>`, which broke its "no `<` between
tags" match: `taskModal`'s "Start time (optional)" → `taskTime`;
`habitModal`'s "Preferred time (optional)" → `habitTime`; `timeModal`'s
"Learning axis (used by Insights)" → `timeLearningDomain`;
`system.page.js`'s "Spacing Stretch: `<span>10%</span>`" →
`settingSpacingStretch` (the actual field sits two elements below, past
a hint div).

Already correct, confirmed untouched: `modals/quickCaptureModal.modal.js`
(all 6 labels already had `for=` from earlier work) and
`pages/study.page.js` (19 labels, all using the other valid HTML
association pattern — the field is nested directly inside its own
`<label>`, which needs no `for=`).

**A repo-wide grep for `<label class="form-label">` with no `for=` now
returns nothing.** This closes the original 89-resource DevTools warning.

### 2. Removed dead `js/compat-layer.js`

An empty, retired stub from the V17 stabilization era — not loaded by
`index.html`, and its own header comment said "safe to delete." Confirmed
zero references anywhere in the repo before removing it.

## What was intentionally NOT changed

The id/name-reuse pattern across the 4 knowledge entry-type templates
(`knowledgeTitle`/`knowledgePathway`/`knowledgeTags` appearing in both
`js/knowledge.js` and `modals/knowledgeModal.modal.js`) is pre-existing
and safe — only one template is ever in the DOM at a time — not
something V36 introduced or needed to fix.

The white-on-white contrast complaint is still open — still waiting on a
page name or screenshot.

Still queued from the earlier code-quality audit, not part of this
release: the remaining `var`→`const/let` files (`diagnostics.js` 274,
`commitment-intelligence.js` 170, `practice-judgment.js` 116,
`connect.js` 110, `science-coach.js` 92, `learn.js` 69, `dashboard.js`
46, `focus.js` 40), the `onclick`→`data-action` migration (541 vs. 0
real adoption), splitting oversized functions, and reconciling the two
CSS token systems.

## Preservation proof

| Contract surface | V35 | V36 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 10 | 0 |
| Routed tabs | 26 | 26 | 0 |
| Runtime modal elements | 20 | 20 | 0 |
| Storage keys | all | all | 0 |
| Files scanned by verify.js | 87 | 86 | 1 (dead compat-layer.js) |

No storage schema change. No migration needed.

## Verification evidence

| Suite | Result |
|---|---:|
| `node --check` / `Function()` parse on all 12 changed files | PASS |
| Repo-wide grep: 0 remaining `<label class="form-label">` without `for=` | 0 |
| Repo-wide grep: 0 references to `compat-layer` anywhere | 0 |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS |
| Runtime Health & Contracts, Interaction Audit, Navigation Stress Test, Workflow Mutation Test | **not run this session** — no live browser session was available. Please run System → Diagnostics, and click through Tasks, Habits, Calendar, Time Log, Framework Lab's variable editor, Knowledge, Goals, Flashcards, Contacts (interaction log), Find & Connect, Strategic Horizon, and Settings before treating V36 as final. |

## Start

Open `index.html`. No data migration occurs. As with every release, make
a Settings export before replacing a working copy.
