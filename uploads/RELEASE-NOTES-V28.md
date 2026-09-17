# StudyOS V28 — Connected

V28 turns StudyOS from a collection of useful pages into a connected personal knowledge system. It keeps the V27 textbook-grounded learning architecture and adds the four capabilities selected from the Obsidian, Notion, Evernote, and NotebookLM comparison: universal retrieval, low-friction capture, explicit relationships, and source-level evidence.

## What changed

### Find anything

- **Ctrl/⌘K now searches live data**, not only page destinations.
- The local index covers Knowledge, Capture Inbox, Tasks, Goals, Journal, Decisions, Contacts, Flashcards, Calendar events, Habits, Doctrine sources/modules, and learning-path modules.
- Results are ranked by exact title, title prefix, type, metadata, and body matches.
- Supported result types deep-open the exact editable record. Source and module results open the relevant Doctrine or Learning view.
- Search remains local, account-free, and compatible with `file://`.

### Capture Inbox

- A global **＋ Capture** action is available in the top bar and Knowledge page.
- Capture types: Thought, Question, Source note, Field/site note, and Meeting note.
- Optional pathway, URL, and tags can be attached without deciding the final destination.
- Inbox processing can create a Knowledge note, Task, Flashcard draft, or Decision draft without retyping.
- Processed captures retain a link to the created object; captures can also be archived, restored, edited, or deleted independently.
- The Inbox shows unprocessed/processed/archived counts and a bounded backlog-health cue.

### Evidence citations

Every Knowledge entry type can now store:

- a registered Doctrine source or another source label/URL;
- an exact page, chapter, section, figure, timestamp, or observation-date locator;
- a short excerpt, measurement, or observation;
- the user's interpretation and boundary conditions;
- a verification state: not checked, checked against source, or contested;
- the date checked/accessed.

The reading pane separates evidence from interpretation and visibly warns when a named source has no exact locator. The Knowledge summary reports how many entries have both a source and locator. Citations are user-entered provenance records; StudyOS does not claim to verify their truth automatically.

### Links, backlinks, and graph

- Add related exact titles in the Knowledge editor or write `[[Exact title]]` in an entry.
- Resolved links create explicit relationship records and automatic backlinks.
- Evidence attached to a registered source creates a typed **evidence source** relationship.
- Unresolved titles are shown clearly instead of silently disappearing.
- Knowledge Graph now prioritizes explicit links; shared tags/pathways remain secondary inferred edges so older notes retain useful structure.

### Interface and usability

- Knowledge now has three clear tabs: **Knowledge Vault**, **Capture Inbox**, and **Doctrine Library**.
- The Capture Inbox uses a two-pane processing workspace on desktop and a linear touch-friendly layout on mobile.
- Evidence and connection panels use a consistent visual hierarchy: source → locator → excerpt → interpretation → relationships.
- Responsive summary grids and a compact mobile Capture control prevent layout crowding.
- V28 retains the 10-page intent-based navigation introduced in V27.

## Diagnostics rebuilt for Find & Connect

The safe Health suite now executes and validates:

- every storage key and expected array/object shape;
- the V19 schema migration;
- universal-search index shape, uniqueness, and ranked execution;
- entity-link record shape, duplicate IDs, and resolvable endpoints;
- Knowledge evidence-envelope compatibility;
- all existing storage, engine, page, function, DOM, IndexedDB, and fault-injection checks.

The Interaction Audit now verifies Capture → Knowledge and Search → Open cooperation bridges. The guarded suite now creates a disposable capture, processes it into Knowledge, verifies both records and provenance, then proves exact restoration of Capture, Knowledge, and link storage alongside the existing doctrine, flashcard, framework, and journal workflows.

## Data safety and migration

- Storage schema: **19**.
- New additive keys: `studyos_capture_inbox_v1` and `studyos_entity_links_v1`.
- Existing Knowledge records gain only optional `evidence`, `relatedTitles`, and `unresolvedLinks` fields.
- The V18 → V19 migration preserves existing note content and repairs malformed new collection shapes to empty arrays.
- IndexedDB name/store remain unchanged: `studyos_v16` / `kv`.
- Export/import/reset automatically include both V28 keys because all data management derives from the central `K` registry.

Before replacing an older copy, export a backup from **System → Settings**. Open V28, import that backup if required by your browser/file location, then run **System → Diagnostics → Run core suite**.

## Verification evidence

- Static source/contract verifier: **17/17 passed**.
- Runtime Health & Contracts: **124/124 passed**.
- Runtime Interaction Audit: **303/303 passed**.
- Runtime Navigation Stress Test: **146/146 passed**.
- Runtime Guarded Mutation Test: **13/13 passed**.
- Migration proof: **V18 → V19**, legacy note preserved and new collection shapes repaired.
- Real Chromium visual/runtime pass: **124/124 health checks**, zero page/console errors.
- Responsive check: desktop 1440×1000 and mobile 390×844; mobile document width **390/390** with no horizontal page overflow.

## Intentional boundaries

V28 does not pretend to be a cloud collaboration suite or an AI research engine. It does not OCR PDFs, search inside attached textbook files, auto-generate citations, synchronize across devices, or answer questions from sources. Those would require a separate ingestion, privacy, and grounding design. This release establishes the trustworthy local substrate first: capture, retrieval, provenance, and explicit relationships.
