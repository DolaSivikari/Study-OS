# StudyOS V27 — Fieldcraft

V27 turns the learning area into a textbook-grounded construction and engineering curriculum, reorganizes the interface around daily intent, and replaces the previous diagnostics screen with tests that execute real runtime behavior and prove that failures are detectable.

## Cornerstone curriculum

The ten uploaded PDFs were deduplicated into eight distinct cornerstone works. StudyOS stores original curriculum mappings and progress metadata only; textbook chapters and copyrighted PDF content are not bundled.

| Sequence | Cornerstone source | Tracked units | Curriculum role |
|---|---|---:|---|
| 1 | Bird's Basic Engineering Mathematics | 38 chapters | Arithmetic-to-algebra fluency |
| 2 | Bird's Engineering Mathematics | 67 chapters | Technician-to-engineering bridge |
| 3 | Bird's Higher Engineering Mathematics | 76 chapters | Advanced analysis and numerical methods |
| 4 | Building Construction: Principles, Materials, and Systems | 37 chapters | Building-science principles before assemblies |
| 5 | Construction Materials, Methods, and Techniques | 42 chapters | Material, method, installation, and inspection literacy |
| 6 | Surveying with Construction Applications | 17 chapters | Control, layout, calculation, and verification |
| 7 | Estimating Building Costs | 28 chapters | Scope, quantity, price, risk, and reconciliation |
| 8 | Civil Engineering Body of Knowledge, 3rd ed. | 21 outcomes | Competency and evidence map |

The Learning Paths page now contains 33 capability modules across four tracks:

- Construction & Engineering Foundations (10 modules)
- PMP 2026 Preparation (10 modules)
- McMaster BTech Readiness (8 modules)
- SMR Construction Specialization (5 modules)

Each module is assigned to a progression stage—Fluency, Application, Integration, or Evidence—and includes a practice method, source links, and an expected demonstration. The curriculum favors attempt-before-review, error classification, feedback, spaced re-solving, mixed practice where discrimination matters, and teach-back or work evidence. Difficulty and time are treated as diagnostic signals, not proof of learning.

## Interface and navigation

- Reorganized the sidebar into Daily Command, Learn & Apply, Reflect & Connect, and System.
- Added a sticky context bar with the current section and page.
- Added global command search with `Ctrl+K` / `⌘K`, keyboard navigation, and 26 direct destinations.
- Added a five-item mobile bottom bar and a clearer mobile navigation drawer.
- Kept Knowledge directly visible instead of hiding it under a secondary menu.
- Rebuilt Learning Paths as a command center with current next action, progress metrics, a four-stage ladder, track switcher, source atlas, evidence instructions, and contextual shortcuts.
- Moved the legacy PMP 49-process map into a collapsed reference section so it no longer dominates the current learning flow.
- Improved visual hierarchy, spacing, responsive behavior, passive-card behavior, sticky tabs, and source-workspace layouts.

## Diagnostics rebuilt

Diagnostics now has four explicit safety levels:

1. **Health & contracts** — checks every registered storage key and expected value shape, the schema version, an actual localStorage write/read/remove cycle, IndexedDB availability, pages, functions, engines, protected IDs, and runtime structure.
2. **Interaction audit** — checks routes, tabs, static click targets on routed and hidden panels, and cross-system bridges.
3. **Navigation stress test** — actively visits every route and tab, executes safe navigation controls, refreshes the dashboard, takes a metrics snapshot, and runs runtime contracts while capturing errors.
4. **Workflow mutation test** — uses disposable doctrine, flashcard, framework, and journal fixtures; verifies the resulting writes; restores localStorage and IndexedDB; and compares exact before/after snapshots.

The health suite also injects two temporary faults—malformed registered storage and a duplicate protected ID—to prove that the detectors fail red. Both are restored immediately. Reports persist after the test navigates away and returns, failures stay visible, and passing evidence is collapsed to keep the page readable.

## Bugs fixed

- Follow-up reliability used a nonexistent `nextFollowup` contact field. It now reads the stored `followupDate` field, so overdue communication warnings can fire.
- Morning Protocol energy and the Discipline Energy Tracker were disconnected. Morning energy is now synchronized into the daily tracker while retaining the original 1–10 value and a normalized 1–5 rating.
- Communication and energy tracker keys are now part of the central storage registry and diagnostics contract.
- Doctrine source titles did not match registry IDs, leaving linked-module counts at zero. Explicit source IDs and normalized-title fallback now connect them.
- Doctrine-created flashcards used `front`/`back`, while the SRS engine reads `question`/`answer`. New cards use the canonical schema, and the V18 migration repairs existing cards without discarding them.
- Behavior momentum treated the date-indexed card-review object as an array. It now reads the actual date-keyed review count.
- Deep diagnostics checked for a nonexistent metrics method and could pass without executing the metrics engine. It now runs `METRICS.snapshot()` and validates the returned domains.
- Diagnostic results were lost when active tests navigated between pages. Reports now persist and republish when Diagnostics is rendered again.

## Data compatibility

- Storage schema: **18**
- IndexedDB name/store remain unchanged: `studyos_v16` / `kv`
- The migration preserves legacy flashcards and adds canonical SRS defaults only where values are missing.
- Existing route keys and storage keys remain compatible.

Before replacing an older copy, export a backup from **System → Settings**. After opening V27, run **System → Diagnostics → Run core suite**.

## Verification performed

- Static verifier: **17/17 passed**
- Runtime Health & Contracts: **109/109 passed**
- Interaction Audit: **266/266 passed**
- Deep Active Test Mode: **141/141 passed**
- Guarded Mutation Test Mode: **10/10 passed**
- Injected missing-contract and malformed-JSON faults: detected
- V17 → V18 legacy flashcard migration: passed in a real headless browser
- Desktop (1440×1000) and mobile (390×844) visual QA: passed
- Browser console/runtime errors during navigation and screenshots: **0**
