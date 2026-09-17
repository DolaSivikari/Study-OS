# StudyOS V29 — Practice & Judgment

V29 turns PMP practice from a question viewer into an evidence-producing judgment loop. It asks you to commit confidence before feedback, identify why an answer failed, schedule the weak skill for another attempt, and carry the correction into the rest of StudyOS.

## The V29 loop

1. Choose an ECO-balanced case, with due weak skills prioritized.
2. Commit confidence before seeing the answer.
3. Answer and inspect the reasoning—not only the correct letter.
4. Classify the failure mode when wrong.
5. Save a transfer-to-work note or promote the correction to a flashcard.
6. Revisit the skill through the automatic queue and its linked Learning Path.
7. Review accumulated evidence in Judgment Insights and the Weekly Review.

## Scenario library and blueprint

- **61 original scenarios**: 33 normalized legacy cases plus 28 new construction, estimating, governance, procurement, finance, sustainability, AI, stakeholder, and delivery cases.
- Coverage for **all 26 tasks** in PMI's July 2026 Examination Content Outline.
- Sampling targets the published domain weights: **People 33%, Process 41%, Business Environment 26%**.
- Scenario metadata records ECO domain/task, applied skill, learning module, predictive/adaptive/hybrid approach, difficulty, topical source IDs, error interventions, and a transfer prompt.
- Legacy cases receive stable generated IDs and compatible metadata without rewriting past answers.

The scenario questions are original StudyOS practice material. They are not PMI exam questions and are not represented as official PMI content. The blueprint was checked against PMI's current PMP page and the official 2026 Examination Content Outline:

- https://www.pmi.org/certifications/project-management-pmp
- https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/new-pmp-examination-content-outline-2026.pdf?rev=b618cf45573e4276a54151e7636c97bf

## Calibration and error diagnosis

- Confidence is required before an answer: 25%, 45%, 65%, 80%, or 95%. The 25% floor reflects a four-choice guess; the 95% ceiling avoids false certainty.
- Scenario calibration uses a Brier-style score that rewards confidence aligned with correctness and penalizes confident errors.
- Migrated attempts that never recorded confidence are excluded from calibration rather than assigned invented values.
- Wrong answers can be classified as:
  - knowledge gap;
  - sequence error;
  - context misread;
  - governance bypass;
  - stakeholder misread;
  - calculation error;
  - overthinking;
  - careless execution.
- Each error class produces a specific next-repetition intervention.
- The weak-skill queue schedules another relevant case and prioritizes due skills without abandoning ECO-domain balance.

## Connected evidence

- **Learning Paths:** PMP modules show scenario attempts, accuracy, and calibration, with a direct route back to relevant practice.
- **Flashcards:** a correction can become a sourced card carrying scenario provenance.
- **Judgment Insights:** a ninth Insights tab shows skill evidence, recurring error types, due practice, scenario-versus-decision calibration, and domain exposure.
- **Weekly Review:** an eleventh prompt summarizes the week's observed accuracy, confidence calibration, dominant error, and weakest applied skill.
- **Strategic Horizon:** the live practice signal can become an evidence-based 12-month target or 90-day action. It is explicitly presented as observed performance, not a personality trait.
- **Decision Journal:** entries now capture decision type, reversibility, evidence quality, stakeholders, pre-mortem, disconfirming evidence, deadline, and confidence. Reviews separate process quality from outcome, record the dominant error, and capture surprise.

## Source-informed design

The new cases and prompts use topical patterns from the uploaded construction, estimating, engineering, and CEBOK materials: traceable assumptions, conceptual-estimate uncertainty, contract-document scope, contingency, delivery methods, codes, sustainability, sequencing, alternatives, and discretionary professional judgment. Source chips are provenance cues for further study—not claims that a scenario or explanation was copied from, endorsed by, or exhaustively verified against a textbook.

The learning design follows durable, testable principles: retrieval before feedback, confidence calibration, targeted correction, spacing, varied cases, explanation, and transfer. Self-ratings and composite scores remain internal reflection aids, not neurological measurements or validated psychometric assessments.

## Diagnostics rebuilt for V29

The diagnostic system now validates:

- 61 unique and stable scenario IDs;
- normalized scenario structure and all 26 ECO tasks;
- resolvable source-registry and PMP Learning Path mappings for every case;
- practice-queue shape, referential integrity, and due scheduling;
- confidence-calibration math and ECO-balanced sampler execution;
- required V29 routes, controls, functions, storage, and cross-system bridges;
- an injected orphan-queue failure that must be detected and exactly restored;
- a guarded end-to-end workflow: scenario answer → error classification → weak-skill queue → correction flashcard → Learning Path evidence.

The guarded test also flushes delayed cross-system listeners before restoring its storage snapshot. This fixes a real diagnostics defect in which a debounced backlink rebuild could fire after restoration and cause a false failure or leave test-era state behind.

The past-review renderer was also repaired to use the same prompt registry as the current Weekly Review, so newly added review sections are no longer silently omitted. The Decision Journal no longer depends on the browser's implicit global `event` object when selecting a judgment rating.

## Data safety and migration

- Storage schema: **20**.
- New additive key: `studyos_practice_queue_v1`.
- Existing scenario history remains in `hcc_scenarioHistory` and is enriched additively.
- The V19 → V20 migration initializes the queue and preserves legacy attempts without fabricating confidence evidence.
- IndexedDB remains `studyos_v16` / `kv`.
- Export, import, and reset include the V29 queue through the central storage registry.

Before replacing an older copy, export a backup from **System → Settings**. Open V29, import the backup if your browser/file location requires it, and run **System → Diagnostics → Run Core Suite**.

## Verification evidence

- Static source/contract verifier: **17/17 passed**.
- Runtime Health & Contracts: **138/138 passed**.
- Runtime Interaction Audit: **341/341 passed**.
- Runtime Navigation Stress Test: **149/149 passed**.
- Runtime Guarded Mutation Test: **18/18 passed**.
- Migration proof: **V18 → V20**, legacy V28 data preserved and the V29 queue initialized.
- Real Chromium pass: zero runtime/console errors.
- Responsive check: desktop 1440×1000 and mobile 390×844; mobile document width **390/390**, with no horizontal page overflow.

The figures above describe the final source tree before packaging. The same suites are rerun against the clean release archive before delivery.

## Intentional boundaries

- StudyOS remains local-first and does not synchronize across devices.
- It does not ingest or answer questions from textbook PDFs.
- It does not verify user-entered citations, transfer notes, or decision evidence automatically.
- Queue and weak-skill conclusions become more useful as real attempts accumulate; sparse evidence is shown as sparse rather than treated as certainty.
- Practice cases are preparation aids, not a score predictor or substitute for PMI's official materials.
