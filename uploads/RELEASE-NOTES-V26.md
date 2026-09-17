# StudyOS V26 — Science & Data Integrity Upgrade

Release date: 2026-07-21

## What changed

### Data-integrity and runtime fixes

- Fixed communication reliability: contact follow-ups now read the stored `followupDate` field, so overdue follow-ups no longer report a false 100% score.
- Fixed a protocol field collision that replaced intention text with `true`. The checklist step now uses `intentionStep`.
- Added schema migration V17. Existing records keep recoverable intention text, the checklist flag is migrated, and `completed` is derived from morning + evening completion. Text already destroyed by the old bug cannot be reconstructed.
- Fixed protocol completion: morning and evening update only their own steps; the day becomes complete only after both phases.
- Connected Protocol energy (1–10) to Discipline energy (1–5) without conflating two signals. Protocol supplies a morning baseline; a manual Discipline rating remains the current/in-day rating.
- Fixed calendar-day storage to use local dates. Toronto evening records no longer roll into tomorrow because of UTC conversion. Existing ambiguous historical dates are not shifted automatically.
- Fixed Study Load so work hours no longer count as study. Four hours is now a reflection guardrail, not a universal maximum.
- Moved Habit Momentum out of the floating Study Timer DOM.
- Registered Communication, Energy, Principles, Scenario History, and CEBOK trackers in the central storage registry.
- Fixed Communication note rendering so literal `&`, `<`, and similar characters are not shown as HTML entities in the input.

### Honest metrics and diagnostics

- Missing calibration components are no longer imputed as 70%. Calibration shows no score until evidence exists.
- Learning Integrity uses observed components only and shows “needs data” when none exist.
- New/unused domains no longer generate false skill-decay warnings.
- Domain drift requires at least one tracked study hour in each of the two comparison windows.
- “Quality-weighted hours” (the arbitrary 2× multiplier) was removed. Insights now distinguishes technique-tagged and untagged study and points to delayed recall, transfer, and confidence-vs-accuracy as outcome evidence.
- Static verification now includes a storage-registry guard. Runtime Diagnostics checks the newly registered keys, local-date helper, and Habit Momentum placement.

### PMP — July 2026 alignment

- PMP Practice now opens on a current-exam overview.
- Updated ECO weights: People 33%, Process 41%, Business Environment 26%.
- Scenario sampling follows those weights.
- Added Business Environment scenarios for governed AI use, sustainability-driven change, and strategic revalidation.
- Added the 40% predictive / 60% adaptive-agile + hybrid approach mix and current 180-question / 240-minute format.
- Added PMBOK Guide Eighth Edition context: six core principles, seven performance domains, and expanded AI/PMO/procurement coverage.
- Kept the 49-process, ITTO, process-map, and PMBOK 7 tools, but labeled them as legacy/reference material. ITTO detail remains loaded for 28 of 49 processes.

### Learning-science corrections

- Reworded “neuroscience-based” claims as evidence-based learning science where appropriate.
- Removed unsupported universal claims such as “3× retention,” “2–3× more likely,” a hard 4–5-hour ceiling, a 20,000-hour mastery threshold, and a required 60% deliberate-practice ratio.
- Focus Mode defines deliberate practice as a specific weakness plus feedback/correction.
- Reframed the comfort/panic scale as perceived difficulty: Familiar / Stretch / Overload.
- Updated sleep, exercise, hydration, breaks, retrieval, spacing, interleaving, explanation, and neuroplasticity wording to avoid biological overclaiming.
- Morning intention now prompts for behavior, time, and place—the actual structure of an implementation intention.

## Verification

- `node tools/verify.js`: 17/17 static checks passed.
- Browser-like runtime smoke test: schema migration, local dates, both protocol phases, energy sync, communication score, study-load filtering, no-evidence metrics, PMP 2026 view, all routes, and all tabs passed without runtime errors.
- Scenario bank: 33 total (People 13, Process 14, Business Environment 6), sampled by the official 33/41/26 exam weighting rather than raw library counts.

## Evidence used for this release

- PMI, 2026 PMP exam update: https://www.pmi.org/certifications/project-management-pmp/new-exam
- PMI, PMP Examination Content Outline — July 2026: https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/new-pmp-examination-content-outline-2026.pdf
- PMI, PMBOK Guide Eighth Edition: https://www.pmi.org/standards/pmbok
- Agarwal, Nunes & Blunt (2021), classroom retrieval-practice systematic review: https://pdf.poojaagarwal.com/Agarwal_etal_2021_EDPR.pdf
- Gollwitzer & Sheeran (2006), implementation-intentions meta-analysis: https://kops.uni-konstanz.de/entities/publication/2e749bfb-8533-437c-8203-7e788c910c5f

## Use and upgrade

1. Back up your current StudyOS data from Settings.
2. Extract this release and open `index.html` in a modern browser.
3. Import your backup if you are using a new folder/browser origin.
4. On first launch, schema migration V17 runs automatically. The IndexedDB name remains `studyos_v16` intentionally so existing large-data mirrors are preserved.
5. Open System → Diagnostics and run both checks after importing data.

StudyOS is a self-management and learning tool, not a medical device or a validated psychometric assessment. Its composite scores are internal heuristics; use real performance and feedback to judge learning.
