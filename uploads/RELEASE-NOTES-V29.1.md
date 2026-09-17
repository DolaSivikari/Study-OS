# StudyOS V29.1 — Connection Integrity

V29.1 hardens the local-first application boundary: interface actions, feature logic, localStorage, IndexedDB, dependent pages, backup/import/reset, and diagnostics now follow the same contracts.

## Connected workflows repaired

| Workflow | V29 defect | V29.1 behavior |
|---|---|---|
| Journal → Reflection Action → Tasks | Saving a new entry replaced the permanent Journal modal; the generated task used incompatible fields | The action prompt is a separate disposable modal, the editor reopens reliably, and the task uses the canonical Planner schema |
| Tasks → Dashboard / Calendar / Operator / Intelligence | Writers used `due`; several consumers read only `dueDate`, so due and overdue work silently disappeared | One shared task boundary handles due date, completion, status, and priority everywhere |
| Goals → Dashboard | Milestones did not complete a goal and Dashboard read a nonexistent progress field | Milestones, explicit completion, goal cards, and Dashboard progress agree |
| Learning Paths → Time → Insights | Pathways stored subject labels where Insights expected Technical / Strategic / Leadership | Time records now retain both subject/pathway and an explicit learning axis |
| Operator → Focus → Time / Doctrine | Focus stored the learning domain as a time category and created incomplete Doctrine evidence | Focus records `category: study`, a valid learning axis, and normalized dated Doctrine evidence |
| Protocol → Discipline Energy | The visible saved energy and hidden form value could disagree, reverting a saved rating to 7 | The control is synchronized on every render; the 1–10 baseline maps into the 1–5 Energy Tracker without overwriting a later manual rating |
| SRS / Doctrine preferences → backup | Detailed review calibration and Doctrine view/override keys were outside the registry | These records participate in diagnostics, export, import, and reset |
| Framework Lab → application event bus | Direct storage writes did not notify dependent surfaces | Framework saves use the same event-aware boundary as the rest of StudyOS |
| Any write → current page | Only hidden Dashboard and Health surfaces refreshed | The active dependent page refreshes while preserving the selected Insights and Doctrine context |

## Storage lifecycle rebuilt

- Schema version is now **21**.
- localStorage is the synchronous source of truth; IndexedDB is a capacity mirror and fallback for Journal and Doctrine logs.
- A stale asynchronous IndexedDB value can no longer overwrite a newer local write during boot.
- Pending large-record writes are flushed before destructive storage operations.
- Import is an exact restore, validates collection shapes, reruns migrations, synchronizes IndexedDB, and rolls back if restoration fails.
- Reset clears both storage layers. Deleted Journal or Doctrine records cannot return after hydration or reload.
- V20 backups migrate Tasks, study-time learning axes, Doctrine evidence, Goals, tracker activity arrays, detailed card-review history, and Doctrine preferences.

## Diagnostics now test behavior

The safe suite validates:

- every registered storage key and the absence of orphan application keys;
- canonical Task, Goal, and study-time schemas;
- localStorage ↔ IndexedDB parity;
- routes, controls, engine shapes, search/link integrity, scenario mappings, calibration, and deliberate fault detection.

The guarded suite uses disposable records to execute:

- Journal → Action → Tasks → active Calendar;
- Learning Path → Time Log → Insights allocation;
- Operator context → Focus → Time + Doctrine evidence;
- milestone → Goal completion → Dashboard;
- Protocol energy → Discipline Energy Tracker;
- V20 backup → V21 migration → two-layer reset → no resurrection;
- Doctrine Builder, Doctrine flashcard packs, Framework Lab, Capture → Knowledge, and Practice & Judgment.

Every touched key is snapshotted before the test and compared after restoration, including the IndexedDB mirror.

## Release verification

- Static source and contract verifier: **18/18 passed**.
- Clean Chromium Health suite: **147/147 passed**.
- Clean Chromium Interaction audit: **272/272 passed**.
- Clean Chromium Navigation stress test: **147/147 passed**.
- Clean Chromium Guarded workflow test: **39/39 passed**.
- Data-bearing simulated-browser run: **147/147 health**, **341/341 interactions**, **149/149 navigation**, **39/39 guarded**.
- Desktop and 390 px mobile render checks passed with no horizontal overflow and no console/runtime errors.
- Real IndexedDB precedence, fallback, reset, reload, and no-resurrection checks passed.

## Upgrade

1. In the older copy, open **System → Settings** and export a backup.
2. Open V29.1 from its own folder.
3. Import the backup. Older schemas are migrated automatically.
4. Open **System → Diagnostics** and run **Core Suite**, then **Workflow Mutation Test**.

The release archive contains application code only; it does not contain your browser data or textbook PDFs.
