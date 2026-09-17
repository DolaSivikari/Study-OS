# StudyOS V29.2 — Commitment Intelligence

V29.2 adds one explainable, local-first commitment model across Tasks, Calendar, Habits, Focus, Study Lab, Journal, Dashboard, Operator, System Status, and Diagnostics.

## What changed

- Tasks now support an optional planned start time, realistic duration estimate, and General / Study / Work / Personal category.
- Habits now support an optional preferred time, time budget, and category. Unscheduled habits remain flexible.
- Calendar recurrence now works as data, not decoration: daily, weekly, and monthly occurrences render, count, and participate in collision checks.
- One shared engine detects:
  - event ↔ event, event ↔ task, task ↔ task, and scheduled-habit overlaps;
  - short transition gaps against a configurable buffer;
  - daily commitment overload;
  - planned Study-category work above the personal quality guardrail.
- Task, Event, and Habit editors show a live explanation before save. Serious risks open an advisory review with nearby clear-time suggestions and an always-available **Save anyway** path.
- Starting Focus, a Study Lab timer, or a Journal entry during an active or imminent commitment produces a context-switch heads-up.
- The top bar, Dashboard, Task/Habit summaries, Calendar rail, Calendar day markers, System Status, and Next Move recommendation all read the same engine.
- Operator slot allocation now respects Calendar, timed Tasks, scheduled Habits, and transition buffers instead of checking Calendar events alone.

## Explainability and user control

Commitment Intelligence is deterministic and runs entirely in the browser. A warning names the records, time ranges, overlap duration, and date that produced it. It never silently moves, deletes, or reschedules user data.

Date-only Tasks count toward capacity using an explicit or clearly identified default estimate, but they do not create a fabricated minute-by-minute collision. Preferences in the intelligence center control:

- planning-day boundaries;
- daily commitment budget;
- study-quality guardrail;
- transition buffer;
- default Task and Habit estimates;
- proactive warning visibility.

The default four-hour Study guardrail is worded as a personal fatigue/quality check-in, not a biological cutoff or quota.

## Data and migration

- Schema version is now **22**.
- New registered key: `studyos_commitment_preferences_v1`.
- V21 Tasks, Calendar events, and Habits migrate additively.
- No migration invents a start time. Missing or malformed time values become flexible (`null`).
- Existing backup, import, reset, event-bus refresh, and two-layer storage behavior remain intact.

## Diagnostics

The safe suite now executes pure interval, boundary, recurrence, open-slot, live-plan-shape, and schedule-schema checks.

The guarded suite creates disposable meeting, timed Task, and scheduled Habit records to prove:

1. event/task and event/habit overlaps are detected;
2. a non-overlapping candidate does not produce a false positive;
3. the Task editor explains the conflict before mutation;
4. the first save pauses for review and **Save anyway** still writes the record;
5. Calendar and the global warning count refresh from the same change;
6. all Events, Tasks, Habits, Habit Logs, and preferences are restored exactly.

## Verification results

- Static architecture and contract verification: **18/18 passed**.
- Safe runtime health checks: **151/151 passed**.
- Interaction audit: **275/275 passed**.
- Active navigation and tool audit: **147/147 passed**.
- Guarded mutation and restoration checks: **45/45 passed**.
- Direct conflict checks passed for event/task, event/habit, and habit/task overlaps, recurrence, edit self-exclusion, inline explanations, advisory pause, explicit override, overlap/buffer context warnings, and planned-study alignment.
- No uncaught runtime or console errors were observed in the automated browser-DOM and IndexedDB harness.

## Known boundaries

- V29.2 checks commitments stored inside StudyOS. Google, Outlook, or device calendars are not synchronized in this local release.
- Exact collision checks require a time. Flexible/date-only records participate only in capacity calculations.
- Cross-midnight blocks are clamped to the end of their start day; split an overnight commitment into two blocks for exact checking.
- The engine advises; it does not auto-reschedule or infer hidden travel time.

## Upgrade

1. Export a backup from the older copy under **System → Settings**.
2. Open V29.2 from its own folder.
3. Import the backup; schema 22 migration runs automatically.
4. Open the top-bar **Schedule** center and review its default planning window and capacity.
5. Run **System → Diagnostics → Core Suite**, then **Workflow Mutation Test**.

The release archive contains application code only. It does not include browser data or textbook PDFs.
