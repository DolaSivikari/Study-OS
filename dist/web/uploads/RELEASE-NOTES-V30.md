# StudyOS V30 — Evidence-Guided Learning

Released: 2026-07-22

V30 turns the Huberman topic/transcript review into an evidence-graded learning workflow without removing or renaming any existing page, tab, modal, route, storage key, or feature.

## What is new

### Science Coach

Study → Science Coach guides one real topic through:

1. optional, non-diagnostic readiness context;
2. prediction or attempted retrieval before opening the source;
3. an adjustable 25/45/60/90/custom Focus block;
4. closed-book retrieval and pre-feedback confidence;
5. error classification and specific correction;
6. a ready-to-resume note;
7. performance-responsive follow-up spacing; and
8. an optional canonical retrieval Task.

Science-started Focus sessions carry their learning domain and technique into Time Log. The follow-up is a normal Planner Task—not a disconnected reminder—so commitment warnings, Tasks, backup/import/reset, and Diagnostics all see the same record.

### Transparent evidence register

- 11 requested Huberman Lab topic pages are retained as the discovery trail.
- 22 product claims are graded Strong, Moderate, Contextual, or Not Implemented.
- 30 direct research/source links are visible inside the app.
- Every implemented claim states a practical use and an important boundary.
- The full audit is in `SCIENCE-EVIDENCE-V30.md`.

V30 explicitly avoids presenting fixed 21-day habit formation, a universal 90-minute focus cycle, dopamine stacking, a depleting biological willpower tank, cold/adrenaline memory protocols, supplements, psychedelics, hyperventilation, or personality labels as StudyOS neuroscience.

### Adaptive Flashcards

- Replaced ambiguous Hard/Medium/Easy scoring with **Again / Hard / Good / Easy**.
- “Again” now means blank or wrong; “Hard” means correct but effortful or cued.
- Scheduling responds to the card’s prior interval and ease, capped to a safe local range.
- Old review logs keep their legacy calibration meaning; V30 logs use `ratingScale: 2`.
- Fixed a real bug where Focused Review did not filter a category.
- Mixed Review now alternates categories when possible; Focused Review selects one category or the largest due group.
- Added executable pure and live-storage tests for interval, queue, lapse, and calibration behavior.

## Diagnostics rebuilt around proof

The existing four levels remain and now cover V30:

- **Health & Contracts:** evidence shape/URLs, readiness boundaries, adaptive SRS, Learning Cycle schema, Task-link integrity, storage registry, migrations, and prior engines.
- **Interaction Audit:** all routes, tabs, static actions, and the Science Coach → Focus/Task bridge.
- **Navigation Stress Test:** visits all routes and all 25 tabs and runs safe execution probes.
- **Workflow Mutation Test:** creates disposable Science Cycle → Focus → Time Log → Retrieval Task data and a live Focused Flashcards rating, verifies the Planner/storage result, then restores exact prior values. All older fixture workflows remain.

The safe suite still injects malformed storage and a duplicate protected ID, proves the detectors fail red, and restores the original state.

## Preservation proof

| Inventory | V29.3 | V30 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 10 | 0 |
| Registered routes/pages | 10 | 10 | 0 |
| Tabs | 24 | 25 | 0 |
| Page source files | 10 | 10 | 0 |
| Modal source files | 18 | 18 | 0 |
| Runtime modal elements | 19 | 19 | 0 |

Every file in the packaged V29.3 baseline remains present in V30. The only tab addition is `sciencecoach`. Existing route and tab names are unchanged.

## Data compatibility

- Schema version: **23**.
- New additive key: `studyos_learning_cycles_v1`.
- Migration from schema 22 initializes the new collection without inventing sleep, stress, energy, confidence, or retrieval outcomes.
- Existing Tasks and Flashcards remain intact in the executable migration fixture.
- Export, import, reset, key registration, and diagnostics include Learning Cycles.

## Verification result

Executed in headless Chromium at 1440×1000 and 390×844:

| Verification | Result |
|---|---:|
| Static release verifier | 18/18 passed |
| Health & Contracts | 163/163 passed |
| Interaction Audit | 287/287 passed |
| Navigation Stress Test | 152/152 passed |
| Guarded Workflow Mutation | 52/52 passed |
| Runtime errors | 0 |
| Console errors | 0 |
| Failed local requests | 0 |
| Missing Science Coach labels | 0 |
| Desktop route overflow | 0 across all 10 pages |
| Mobile document/Science Coach overflow | 0 |

The mobile Knowledge Vault action/filter overflow found during testing was fixed before the final run.

## Start here

1. Back up the current system from System → Settings.
2. Open V30 from its own folder. If your browser does not show the prior data in the new local-file location, import the backup in System → Settings; schema migration runs during import.
3. Confirm Tasks, Calendar, Journal, and Flashcards, then run System → Diagnostics → Run core suite.
4. Go to Study → Science Coach.
5. Start with one real topic, attempt before review, run Focus, retrieve without the source, correct the gap, and create the follow-up Task.

StudyOS remains a local educational tool. Readiness inputs are optional self-reports and are not medical measurements or treatment advice.
