# StudyOS V33 - Accessibility Fixes (Step 1)

Release date: 2026-07-23

## Outcome

V33 is the first of a planned multi-release effort to clear the two
DevTools console warnings reported by the user (form fields missing
id/name; labels not associated with a form field — 89 resources) and to
investigate a separately reported white-on-white readability complaint.
No route, tab, storage key, or DOM contract was touched. No existing page
or feature was removed.

## What changed

### 1. `js/framework-lab.js` — every dynamic form field now has id/name

21 elements created via `document.createElement('input'|'select'|'textarea')`
in this file were missing both `id` and `name` — the framework search box,
version-editor fields, the "Add Relationship" form (5 selects + 1 range +
1 textarea), the scenario editor (7 fields), the per-variable state rows
(range + notes, one pair per variable, ids keyed to the variable's own id
to guarantee uniqueness), the Recursive Explorer's 2 selects, and the
Import JSON textarea. All 21 now have a unique `id` + `name`, and fields
without a visible label also got a matching `aria-label`.

### 2. `js/framework-lab.js` — label/field association

Every real `<label>` in this file is now correctly wired to its field via
`for=`/`id`: the scenario editor's 7 labeled fields and the explorer's
2 selects. The shared `flInput()`/`flTextarea()` helper (used by the
Name/Tags/Definition/Indicators/Notes fields) got a new `flFieldId()`
generator baked in, so this is fixed once at the source rather than at
each of its call sites — any future field built through this helper
inherits correct association automatically.

### 3. `js/framework-lab.js` — CSS class hygiene

The Recursive Explorer's 2 `<select>` elements used `class="select"`,
which isn't a defined CSS class anywhere in the app — it was silently
riding the bare `<select>` tag selector instead of the shared
`.form-select` contract (same color/background tokens either way today,
but no hover/focus polish, and a real risk if that bare-tag rule is ever
edited in isolation). Changed to `.form-select`.

### 4. `pages/dailyops.page.js` — the exact 2 labels from the user's report

"Today's Intention" now has `for="protocolIntention"`, a real
association with its textarea. "Energy Level" was changed from
`<label>` to `<div>` — deliberately, not an oversight: it heads a button
group (`#energySelector`), not one focusable field, and the field that
actually holds the value (`#protocolEnergy`) is `type="hidden"`, which a
visible label should never point to (hidden fields aren't meant to
receive focus via label click). Added `role="group"` and
`aria-label="Energy level"` to the button-group container instead, which
is the correct accessible pattern for a labeled control group. This will
also stop it from being miscounted alongside genuine label/field bugs
in future DevTools scans.

## Investigated, not fixed: the white-on-white readability complaint

I could not reproduce a literal white-text-on-white-background element
anywhere in the current code, after: re-checking the token contract
(`.form-input`/`.form-select`/`.form-textarea` in `css/design-system.css`
correctly pair `color`/`background`); re-examining `.review-textarea` and
`.energy-btn` (both correctly use paired, non-conflicting variables);
grepping the entire codebase for any hardcoded `background:#fff`/`white`
(found exactly one, `.learning-next-actions .btn-primary`, which pairs it
with a hardcoded dark navy text color, not a variable — not the bug); and
re-reading the exact "Today's Intention"/"Energy Level" section the user
quoted (its textarea uses the correctly-paired `.form-textarea` class).

I don't have live browser access from here to inspect your actual running
app, and static analysis has now run out of leads. **If this is still
happening, please tell me which page/tab it's on, or send a screenshot —
that will let me find the actual element instead of guessing.**

## What was intentionally NOT changed

The label/field association warning (89 resources) is systemic well
beyond these two files — 207 `<label>` tags exist repo-wide, only 8 use
`for=`, and V33 fixed the ones in the 2 files tied to concrete evidence
(the DevTools warning's exact example, and the file with the id/name
warning). Not yet touched, queued as V34+ (one file or small related
group per release, per CLAUDE.md's "one release = one narrow scope"):
`js/decisions.js` (~29 unlabeled fields), `js/knowledge.js` (~21),
`modals/qualityReviewModal.modal.js` (~15), `js/pmp-tools.js` (~12),
`modals/contactModal.modal.js` (~10), plus smaller counts across
`taskModal`, `habitModal`, `eventModal`, `timeModal`, `flVarEditModal`,
`quickCaptureModal`, `knowledgeModal`, `goalModal`, `flashcardModal`,
`interactionModal`, `js/connect.js`, `js/strategic-horizon.js`,
`js/pmp-tools.js` (already counted), `pages/system.page.js`,
`pages/study.page.js`.

## Preservation proof

| Contract surface | V32 | V33 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 10 | 0 |
| Routed tabs | 26 | 26 | 0 |
| Runtime modal elements | 20 | 20 | 0 |
| Storage keys | all | all | 0 |

No storage schema change. No migration needed. No route, tab, or
required contract ID/function was touched.

## Verification evidence

| Suite | Result |
|---|---:|
| `node --check` on both changed files | PASS |
| Script-verified: every dynamic input/select/textarea in framework-lab.js has an id | 21/21 |
| Repo-wide grep for id collisions on all new ids | none found |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS |
| Runtime Health & Contracts, Interaction Audit, Navigation Stress Test, Workflow Mutation Test | **not run this session** — no live browser session was available. Please run System → Diagnostics → all four suites, and re-open DevTools on the Framework Lab and Daily Ops pages specifically, before treating V33 as final. |

## Start

Open `index.html`. No data migration occurs — this release touches only
`js/framework-lab.js` and `pages/dailyops.page.js`. As with every
release, make a Settings export before replacing a working copy.
