# StudyOS V31 - Adaptive Profile & Execution

Release date: 2026-07-22

## Outcome

V31 turns the supplied CliftonStrengths and Caliper material into a
user-controlled learning and execution layer. Assessments now supply
hypotheses to test; actual decisions, communication outcomes, quality-control
verification, and explicit user feedback determine whether those prompts stay
useful.

No existing page or feature was removed.

## What changed

### 1. Adaptive Profile Lab

- Added System -> Profile Lab as the 26th tab.
- Registered the CliftonStrengths rank order and Caliper assessment with clear
  scale boundaries.
- Added nine cross-assessment hypotheses covering decision pace, evidence
  depth, repair versus prevention, receiver-side communication, self-directed
  structure, applied learning, expert networks, start friction, and response
  to change.
- Each hypothesis can be marked Useful, Not me, reset to Testing, snoozed for
  30 days, or disabled globally.
- Profile feedback is registered, migrated, exported, imported, reset, and
  inspected by Diagnostics.
- Prompt density now works: Compact shows the shortest actionable check,
  Balanced shows reasons and actions, and Coaching adds the hypothesis and
  observed evidence.

### 2. Two-sided Decision Guardrail

- Decision Journal now captures impact, reversibility, evidence quality,
  independent-source count, time pressure, current decision state, qualified
  sounding-board use, stakeholder input, governing requirement, and
  disconfirming evidence.
- The same evaluator drives the live form and the saved decision record.
- High-consequence choices with weak process evidence produce a Slow down
  check.
- Reversible, adequately informed choices explicitly marked Stuck produce a
  Decide check.
- Other combinations remain Balanced.
- Advice is proportional and advisory; it never blocks the user's save.

### 3. Evidence Depth Gate

- Analytical preference and skepticism are no longer treated as proof of
  sufficient research.
- Important decisions can now distinguish repeated claims from independent
  sources and record the applicable standard, policy, approval, or hold point.
- Delayed outcome review still separates decision-process quality from luck in
  the result.

### 4. Fix -> Learn -> Prevent Quality Loop

- Added a structured after-action review to Journal for mistakes, near misses,
  repeated learning errors, communication failures, and process defects.
- Captures observable facts, immediate correction, root cause, recurrence,
  preventive control, governing source, owner, verification date, status, and
  verification evidence.
- Can create or update a canonical Planner task with `source: quality-review`
  and a stable `sourceId` backlink.
- Overdue verification appears in System Health and execution analytics.
- Quality reviews are indexed by Find & Connect and open directly from search.

### 5. Communication Quality Loop

- Preserved all existing communication-practice activities.
- Added receiver-side behaviors: invite input, listen without interrupting,
  paraphrase, adapt, close the loop, and send written follow-up.
- Added a 1-5 receiver outcome from Missed through Changed action.
- Communication streaks now recognize receiver-side practice, not only
  activity volume.
- Weekly Review and Insights use behavior and outcome language rather than
  declaring Communication #34 a deficit.

### 6. Execution Insight and adaptive prompts

- Added an Execution view as the tenth Insights subview.
- Shows Slow down versus Decide guardrails, verified/open preventive controls,
  receiver outcomes, communication-quality days, and user profile feedback.
- Dashboard cards respect hypothesis state and prompt density.
- The Profile Lab shows observed StudyOS evidence separately from assessment
  wording.

### 7. Guide and interpretation corrections

- Corrected stale counts to 12 Weekly Review prompts and 10 Insights views.
- Corrected Learner to #7 and Deliberative to #1.
- Removed deterministic claims that Communication #34 proves poor
  communication, Activator #24 proves a starting bottleneck, or a lower theme
  rank is a measured weakness.
- Documented that the two Caliper reports interpret one 2026-06-16 assessment
  and use a Processing Specialist job model.
- Added `PROFILE-EVIDENCE-V31.md` as the audit trail for every V31
  assessment-to-feature connection.

### 8. Diagnostics rebuilt around executable proof

Health & Contracts now validates:

- profile registry, state, feedback, and summary invariants;
- Quality Loop schema and verification-task referential integrity;
- communication behavior and receiver-outcome schema;
- all Slow down, Decide, and Balanced decision-evaluator branches;
- schema version 24 and all registered storage types.

Interaction Audit now verifies the Profile -> Dashboard, Decision ->
Guardrail, Quality -> Planner, and Communication -> Insights bridges.

Guarded Mutation Test now executes and exactly restores:

- Profile feedback -> prompt state;
- Communication quality behavior -> receiver outcome;
- Quality review -> canonical verification task -> Journal surface;
- Decision editor -> Compact/Coaching display -> saved guardrail;
- legacy V20 backup -> V31 migrations -> both-layer reset/no-resurrection.

## Storage migration

Schema 23 -> 24 adds:

- `studyos_adaptive_profile_v1` - object;
- `studyos_profile_feedback_v1` - array;
- `studyos_quality_reviews_v1` - array.

Existing `hcc_commTracker` rows receive an empty `qualityBehaviors` array and a
null `outcome`. The migration does not invent personality conclusions,
communication outcomes, or quality-review evidence.

## Preservation proof

| Contract surface | V30 | V31 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 10 | 0 |
| Routed tabs | 25 | 26 | 0 |
| Runtime modal elements | 19 | 20 | 0 |
| Prior storage keys | all | all plus 3 | 0 |

V31 adds Profile Lab and the Quality Review modal. All previous route aliases,
pages, tabs, modals, learning tools, planning tools, journals, analytics,
storage keys, and import/export behavior remain present.

## Verification evidence

| Suite | Result |
|---|---:|
| Static release verifier | 18/18 PASS |
| Runtime Health & Contracts | 187/187 PASS |
| Runtime Interaction Audit | 297/297 PASS |
| Runtime Navigation Stress Test | 156/156 PASS |
| Guarded Mutation/Restoration | 60/60 PASS |
| Runtime errors captured | 0 |

Runtime verification executed the real `index.html`, deferred scripts,
schema migration, localStorage behavior, IndexedDB mirror, route and tab
renderers, modal workflows, and exact restoration in an isolated DOM runtime.
The workspace could not install a Chromium binary because the external browser
download certificate was rejected by the environment clock, so this pass does
not claim new pixel-rendered screenshot coverage. V31's new components use the
existing V29.3 design tokens and responsive breakpoints.

## Start

Open `index.html`. Existing data migrates automatically to schema 24. As with
every release, make a Settings export before replacing a working copy.
