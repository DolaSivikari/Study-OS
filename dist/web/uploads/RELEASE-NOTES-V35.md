# StudyOS V35 - Accessibility Fixes (Step 3)

Release date: 2026-07-23

## Outcome

V35 continues the accessibility cleanup into the next 3 files by
unlabeled-field count: `modals/qualityReviewModal.modal.js` (~15),
`js/pmp-tools.js` (~12), `modals/contactModal.modal.js` (~10). Pure
markup fix — no logic, storage, route, or DOM contract changed. No
existing page or feature was removed.

## What changed

Same scripted approach as V34: matched each `<label class="form-label">`
immediately followed by its own field, captured that field's existing
`id`, and inserted the matching `for=`. Verified with a full diff before
committing in every case.

- **`modals/qualityReviewModal.modal.js`** — 15 labels wired (Issue/
  learning event, Date, Area, Impact, Occurrence, What happened,
  Immediate correction, Root cause, Preventive control, Governing
  source, Owner, Verification date, Control status, Verification
  evidence, Related decision). `qualityCreateTask`'s toggle left alone —
  already valid via nesting (input inside its own label), same pattern
  as V34's `djExpertConsulted`.
- **`js/pmp-tools.js`** — 12 labels wired (BAC/PV/EV/AC for the earned-
  value calculator; Quantity, Unit, Waste, Labor, Material, Equipment,
  OH, Profit for the estimator). Two labels in this file
  (`scenarioErrorType`, `scenarioTransferNote`) already had `for=` from
  earlier work — confirmed untouched, not double-modified.
- **`modals/contactModal.modal.js`** — 10 labels wired (Name, Company,
  Role, Email, Phone, LinkedIn, Category, How did you meet, Notes,
  Follow-up Reminder). This file uses multi-line markup instead of the
  single-line style in the other files — confirmed the script's
  whitespace-tolerant matching (it allows a newline between `</label>`
  and the next tag, not just same-line) handled it correctly.

No button-group-style special case this batch — every label in these 3
files points at exactly one real field, so nothing needed the div+role
conversion used in V33/V34.

## What was intentionally NOT changed

Still queued: smaller counts across `taskModal`, `habitModal`,
`eventModal`, `timeModal`, `flVarEditModal`, `quickCaptureModal`,
`knowledgeModal`, `goalModal`, `flashcardModal`, `interactionModal`,
`js/connect.js`, `js/strategic-horizon.js`, `pages/system.page.js`,
`pages/study.page.js`. These are smaller individually; V36 will likely
cover several at once since the per-file counts are lower.

The white-on-white contrast complaint is still unresolved — still
waiting on a page name or screenshot.

## Preservation proof

| Contract surface | V34 | V35 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 10 | 0 |
| Routed tabs | 26 | 26 | 0 |
| Runtime modal elements | 20 | 20 | 0 |
| Storage keys | all | all | 0 |

No storage schema change. No migration needed.

## Verification evidence

| Suite | Result |
|---|---:|
| `node --check` (pmp-tools.js) / `Function()` parse (the two `.modal.js` template files) | PASS |
| Scripted check: 0 form fields missing `id` across all 3 files | 0 |
| Scripted check: 0 remaining unassociated `form-label` labels | 0 |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS |
| Runtime Health & Contracts, Interaction Audit, Navigation Stress Test, Workflow Mutation Test | **not run this session** — no live browser session was available. Please run System → Diagnostics, and re-check the Quality Review modal, PMP Tools (EVM + Estimator), and Add Contact modal specifically, before treating V35 as final. |

## Start

Open `index.html`. No data migration occurs — this release touches only
`modals/qualityReviewModal.modal.js`, `js/pmp-tools.js`, and
`modals/contactModal.modal.js`. As with every release, make a Settings
export before replacing a working copy.
