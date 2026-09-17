# StudyOS V38 - Interaction Audit False Positive Fix

Release date: 2026-07-23

## Outcome

V38 fixes a real bug surfaced by the user actually running the live
Interaction Audit after V37 (exactly the reason CLAUDE.md requires
runtime checks, not just static ones). Two controls were reported as
"Interactive control has no action" and failing:

- `button#builderBuildFromSourceBtn.btn.btn-primary` — "Build module from this source"
- `button#builderOpenSourceBtn.btn.btn-secondary` — "Open source registry entry"

This is a pre-existing bug, unrelated to V37's onclick→data-action work
— confirmed by checking that these two buttons never had an `onclick`
attribute or a `data-action` attribute to begin with. No route, tab,
storage key, or DOM contract changed. No existing page or feature was
removed.

## Root cause

`js/doctrine/doctrine-builder.js` wires these two buttons (and, it turns
out, several others across the app) by assigning
`buildBtn.onclick = function(){...}` in JavaScript after rendering — a
DOM **property** assignment — rather than an `onclick="..."` HTML
**attribute**. `diagnosticsReadInlineAction()` only ever called
`el.getAttribute('onclick')`, which is always `null` for a
property-assigned handler even though the button genuinely works at
runtime. So `runInteractionAudit()` concluded the button had no action
at all and failed it — a false positive, not a real broken button.

This same wiring style (`.onclick = function(){...}` or `.onclick = () =>
{...}`) is used in at least 6 other places I found while tracing this:
`js/doctrine/doctrine-builder.js` (its own module-builder Cancel/Save
buttons), `js/doctrine/doctrine-drills.js` (drill modal primary/secondary
buttons), `js/learn.js`, `js/review.js` (weekly review start buttons),
and `js/srs.js` (flashcard review button). The fix addresses the root
cause, so it covers all of these, not just the 2 the user happened to
hit.

## What changed

In `runInteractionAudit()`'s "no action" branch (`js/diagnostics.js`),
added a third escape hatch alongside the existing "has an href" and
"looks passive" checks: `typeof el.onclick === 'function'`. If the live
DOM property is a real function, the control is genuinely wired,
regardless of how it got that way — this is the same level of rigor as
the existing checks (confirming wiring exists, not auditing behavior),
just extended to a wiring mechanism the audit couldn't previously see.

## Verification evidence

| Check | Result |
|---|---:|
| `node --check js/diagnostics.js` | PASS |
| Isolated Node test: exact reported button shape (`BUTTON` tag, `.btn` class, `onclick` property set, no `onclick`/`data-action` attribute) | now evaluates as wired, not dead |
| Isolated Node test: a genuinely dead button (same shape, no `onclick` property at all) | still correctly evaluates as dead |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS |
| Runtime Interaction Audit | **please re-run** — this is the exact suite this release fixes; confirm `builderBuildFromSourceBtn`/`builderOpenSourceBtn` (Study → Doctrine → a source's workspace) no longer fail, and check whether any of the other property-wired buttons listed above turn up clean too. |

## Start

Open `index.html`. No data migration occurs — this release touches only
`js/diagnostics.js`. As with every release, make a Settings export before
replacing a working copy.
