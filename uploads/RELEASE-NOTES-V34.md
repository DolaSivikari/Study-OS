# StudyOS V34 - Accessibility Fixes (Step 2)

Release date: 2026-07-23

## Outcome

V34 continues the accessibility cleanup from V33 into the two next
biggest files by unlabeled-field count: `js/decisions.js` (~29) and
`js/knowledge.js` (~21). Pure markup fix — no logic, storage, route, or
DOM contract changed. No existing page or feature was removed.

## What changed

### `js/decisions.js` — 28 labels wired to their fields

Every `<label class="form-label">` in the Decision Journal form now has
a matching `for=` pointing at its field's existing `id` (Decision Title,
Date, Domain, Decision Type, Reversibility, Evidence Quality, Impact if
wrong, Time pressure, Decision state, Source count, Confidence, Context,
Options, Stakeholders, Risks, Governance, Pre-mortem, Disconfirming
Evidence, Final Choice, Tags, Review Date, Deadline, Outcome, Outcome
Rating, Learning, Process Quality, Error Pattern, Surprise).

Two left alone, correctly: `djExpertConsulted`'s label already nests its
checkbox (the other valid HTML association pattern — no `for=` needed).
"Judgment Rating" heads a 5-button rating row with no single field to
point a label at (same shape as V33's Energy Level) — converted the
label to a `div` and added `role="group"`/`aria-label="Judgment rating"`
to the button row instead of forcing a misleading association.

### `js/knowledge.js` — 19 scripted + 2 hand-fixed

19 labels across all 4 entry-type templates (note, model, book,
critical-thinking) wired the same way. These templates reuse the same
ids (`knowledgeTitle`, `knowledgePathway`, `knowledgeTags`) across
different types — safe, since only one type's template is ever in the
DOM at once (existing app pattern, not something V34 introduced).

Two required hand-fixing because the script's pattern (label immediately
followed by its field) didn't match: the critical-thinking questions
loop, where a hint `<div>` sits between the label and its textarea and
the id is built via string concatenation (`'ct_' + q.id`) — fixed with a
matching `for="ct_' + q.id + '"`. And "Confidence Level", same
button-group shape as Judgment Rating above — same fix (div + role=group).

## How this was done

Both files follow one consistent markup pattern:
`<div class="form-group"><label class="form-label">TEXT</label><input/select/textarea id="X">`.
Rather than hand-editing 47 individual spots (higher risk of a stray
mismatch), I wrote a small script that matched a label immediately
followed by its field, captured the field's real `id`, and inserted the
matching `for=` — verified against a full diff before committing, and
confirmed it correctly declined to touch the 3 spots that didn't fit the
simple pattern (handled those by hand, above).

## What was intentionally NOT changed

Still queued, in descending size: `modals/qualityReviewModal.modal.js`
(~15), `js/pmp-tools.js` (~12), `modals/contactModal.modal.js` (~10),
plus smaller counts across `taskModal`, `habitModal`, `eventModal`,
`timeModal`, `flVarEditModal`, `quickCaptureModal`, `knowledgeModal`,
`goalModal`, `flashcardModal`, `interactionModal`, `js/connect.js`,
`js/strategic-horizon.js`, `pages/system.page.js`, `pages/study.page.js`.

The white-on-white contrast complaint from earlier is still unresolved —
static analysis hasn't found it; still waiting on a page name or
screenshot to chase the actual element.

## Preservation proof

| Contract surface | V33 | V34 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 10 | 0 |
| Routed tabs | 26 | 26 | 0 |
| Runtime modal elements | 20 | 20 | 0 |
| Storage keys | all | all | 0 |

No storage schema change. No migration needed.

## Verification evidence

| Suite | Result |
|---|---:|
| `node --check` on both changed files | PASS |
| Scripted check: 0 form fields missing `id` in either file (pre-existing, confirmed unchanged) | 0 |
| Scripted check: 0 remaining unassociated `form-label` labels | 0 |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS |
| Runtime Health & Contracts, Interaction Audit, Navigation Stress Test, Workflow Mutation Test | **not run this session** — no live browser session was available. Please run System → Diagnostics, and re-check the Decision Journal and Knowledge Vault forms specifically, before treating V34 as final. |

## Start

Open `index.html`. No data migration occurs — this release touches only
`js/decisions.js` and `js/knowledge.js`. As with every release, make a
Settings export before replacing a working copy.
