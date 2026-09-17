# StudyOS V37 - onclick → data-action Migration (Step 1: Network/Contacts)

Release date: 2026-07-23

## Outcome

V37 starts the `onclick`→`data-action` migration that `js/action-registry.js`
(V25) built but nothing has adopted yet — CONTRACTS.md §6b explicitly
deferred this to "a deliberate future release, done one page at a time."
This is that release, starting with the smallest fully self-contained
page: Network (Contacts). No route, tab, storage key, or DOM contract
changed. No existing page or feature was removed.

## What changed

### 1. Prerequisite: taught `runInteractionAudit()` about `data-action`

Before converting a single button, I traced how the app's own runtime
Interaction Audit reads click wiring. `diagnosticsReadInlineAction()`
only ever read `onclick` / `data-diag-action` / `href`. A button wired
via `data-action` instead of `onclick` would read as having *no action
at all* — and the audit explicitly fails any `<button>`/`.btn`/`.nav-link`
with no readable action ("Interactive control has no action"). Migrating
even one button without fixing this would have turned the app's own
required verification suite red as a side effect.

Fixed `diagnosticsReadInlineAction()` (`js/diagnostics.js`) to also read
`data-action` (+ `data-action-arg`/`-arg2`) and synthesize the equivalent
`fn(...)` call string, so every downstream check (function-exists,
go/goTab routing) treats a `data-action` button exactly like an `onclick`
one. Also added `[data-action]` to the general interactive-controls
selector so an element with no other matching class/tag doesn't silently
drop out of audit coverage. Verified the synthesis logic against 6
realistic cases in an isolated Node script before relying on it.

Caught one self-inflicted issue along the way: an early comment I wrote
inside `diagnosticsReadInlineAction()` contained the literal text
`onclick="fn(...)"` as an example — `tools/verify.js`'s inline-handler
scanner is a plain-text regex over source, not aware of JS comments, and
matched it as if it were a real handler, flagging `fn` as an undefined
function. Reworded the comment. Also improved `tools/verify.js`'s
data-action check message, which previously always printed "ok (0 in use
so far)" whenever nothing was broken — it now reports the real usage
count; PASS/FAIL logic itself is unchanged.

### 2. First real migration: Network / Contacts (6 buttons)

- `pages/network.page.js`: "Add Contact" button → `data-action="openContactModal"`.
- `js/contacts.js`: the 4 contact-filter buttons (All/Industry/Recruiters/Mentors)
  each called `onclick="contactFilter='x';renderContacts()"` — two
  statements, which doesn't fit the action-registry's one-function-call
  model. Rather than force it, I gave it a real name: a new
  `setContactFilter(filter)` function does the assign-then-render, and
  the buttons use `data-action="setContactFilter" data-action-arg="x"`.
  The contact card's click-to-open-edit → `data-action="editContact"`
  with the contact's id as `data-action-arg`.
- `modals/contactModal.modal.js`: the modal's close (×), Cancel, Delete,
  and Save Contact buttons all converted the same way.

Left as `onclick`, on purpose: the modal's backdrop click-to-close. It
checks `event.target===this` to only close on a true backdrop click (not
a click anywhere inside the modal) — that needs the real event object,
which the action-registry's plain `fn()`/`fn(arg)` delegation doesn't
support. Converting it would either break that guard or require
extending the registry itself, which is out of scope for a page
migration. Documented inline with an HTML comment explaining why.

## What was intentionally NOT changed

535 `onclick=` occurrences remain across the rest of the app (541 before
this release). This was always going to be a many-release effort — the
next candidate pages are whichever have the simplest onclick signatures
(no `this`, no multi-statement, no conditionals), following the same
"trace the diagnostics/verify impact first" process used here.

The `var`→`const/let` cleanup, oversized-function splitting, and CSS
token reconciliation from the earlier audit are all still queued and
untouched. The white-on-white contrast complaint is still open.

## Preservation proof

| Contract surface | V36 | V37 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 10 | 0 |
| Routed tabs | 26 | 26 | 0 |
| Runtime modal elements | 20 | 20 | 0 |
| Storage keys | all | all | 0 |
| `data-action` usages that resolve | 0 | 13 | — |

No storage schema change. No migration needed.

## Verification evidence

| Suite | Result |
|---|---:|
| `node --check` / `Function()` parse on all 5 changed files | PASS |
| Isolated Node test: 6 data-action → synthesized-string cases, all parse as the correct function call | 6/6 |
| Full diff review of every changed file | clean, no unintended changes |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS |
| Runtime Health & Contracts, Interaction Audit, Navigation Stress Test, Workflow Mutation Test | **not run this session** — no live browser session was available. This release specifically touches how the Interaction Audit reads click wiring, so please run System → Diagnostics → Interaction Audit and click through the Network page (Add Contact, all 4 filters, opening/editing a contact, and the modal's close/cancel/delete/save buttons) before treating V37 as final. |

## Start

Open `index.html`. No data migration occurs — this release touches only
`js/diagnostics.js`, `tools/verify.js`, `pages/network.page.js`,
`js/contacts.js`, and `modals/contactModal.modal.js`. As with every
release, make a Settings export before replacing a working copy.
