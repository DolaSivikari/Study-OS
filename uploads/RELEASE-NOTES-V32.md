# StudyOS V32 - Code Modernization Pass (Step 1)

Release date: 2026-07-23

## Outcome

V32 is a pure refactor release — no features added, removed, or changed.
It targets two of the concrete modernization items identified in a full
codebase audit: a legacy `var` file and a duplicated HTML-escaping helper.
No route, tab, storage key, or DOM contract was touched. No existing page
or feature was removed.

This is the first of several planned modernization releases. It deliberately
does **not** attempt the larger items from the same audit (see "What was
intentionally NOT changed" below) — those need their own scoped releases
per CLAUDE.md's "one release = one narrow scope" rule.

## What changed

### 1. `js/integration.js` — `var` to `const`/`let`

All 64 `var` declarations in this file converted: 61 to `const` (never
reassigned), 3 to `let` (`discMax`/`discActual` in `getOperatorScore`,
`streak` in `getOperatorStreak`, `score` in `getSystemStatus` — each
reassigned via `+=` or `=` later in the same function). Every conversion
was checked individually for block-scoping safety (loops, forEach
callbacks, reassignment) before applying. No other token in the file
changed — confirmed with a line-by-line diff against the pre-change copy.

### 2. Dedupe `escapeHtml()` / `esc()`

`js/framework-lab.js` carried its own private `escapeHtml()` doing the
same job as the shared `esc()` helper in `js/core.js` (which
`framework-lab.js` already called elsewhere in the same file). Confirmed
all 3 real call sites (rendering a framework title, a variable title, a
scenario title — none inside an HTML attribute, all inside `innerHTML`
text content) are behaviorally unaffected by the switch, since `esc()`'s
only difference from the removed `escapeHtml()` is that it doesn't escape
quote characters, which none of these call sites relied on.

`js/diagnostics.js`'s `diagnosticsEscape()` already had a defensive
fallback chain (`escapeHtml` → `esc` → manual replace) anticipating this;
no code change was needed there beyond correcting a comment that claimed
`escapeHtml` lived in `framework-lab.js`.

## What was intentionally NOT changed

Identified in the same audit, queued for future scoped releases, not part
of V32:

- `var` → `let`/`const` in the remaining legacy files (`diagnostics.js`
  274, `commitment-intelligence.js` 170, `practice-judgment.js` 116,
  `connect.js` 110, `science-coach.js` 92, `learn.js` 69, `dashboard.js`
  46, and others) — one file per release, per CLAUDE.md.
- Migrating `onclick="..."` handlers (257 uses) to the existing
  `data-action` registry (`js/action-registry.js`) — CONTRACTS.md §6b
  explicitly scopes this as its own future release, done one page at a
  time.
- Splitting oversized functions (`guide.js` `getGuideContent()` ~727
  lines, `framework-lab.js` `renderFLScenarioEditor()` ~263 lines,
  `diagnostics.js` `runInteractionAudit()` ~186 lines).
- A shared `safeRender()` try/catch wrapper around per-tab render calls.
- The white-on-white contrast risk (two unsynced `:root` token systems
  in `css/styles.css` and `css/design-system.css`) and the label/input
  accessibility warnings (207 `<label>` tags, only 8 using `for=`;
  Framework Lab's dynamically-created inputs missing `id`/`name`) — these
  were audited but are a separate release track (UI/accessibility), not
  code modernization.

## Preservation proof

| Contract surface | V31 | V32 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 10 | 0 |
| Routed tabs | 26 | 26 | 0 |
| Runtime modal elements | 20 | 20 | 0 |
| Storage keys | all | all | 0 |
| Global functions | 788 | 787 | 1 (`escapeHtml`, replaced by existing `esc`) |

No storage schema change. No migration needed.

## Verification evidence

| Suite | Result |
|---|---:|
| `node --check` on both changed files | PASS |
| Line-by-line diff review (integration.js) | only `var`->`const`/`let` tokens changed |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS |
| Runtime Health & Contracts, Interaction Audit, Navigation Stress Test, Workflow Mutation Test | **not run this session** — no live browser session was available. Please run System → Diagnostics → all four suites yourself before treating V32 as final; this is a low-risk mechanical refactor but the CLAUDE.md checklist calls for runtime confirmation, not just static checks. |

## Start

Open `index.html`. No data migration occurs — this release touches only
`js/integration.js`, `js/framework-lab.js`, and `js/diagnostics.js`
(a one-line comment). As with every release, make a Settings export before
replacing a working copy.

## Version control note

No git repository existed in this project folder before V32. One was
initialized this release (`git init`, baseline commit tagged
`v32-baseline`, per-step commits, final tag `v32`) so future releases have
the recoverable baseline CLAUDE.md assumes. If you've been managing
backups a different way (manual ZIPs, etc.), this git history is
additive, not a replacement for that.
