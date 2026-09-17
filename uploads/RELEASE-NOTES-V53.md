# StudyOS V53 — Quran Validator Integration

## What changed

- Integrated the uploaded `quran-validator` reference dataset and conservative validation approach into the Quran **Understand** tab.
- Added a Quran quote validator for complete Arabic ayahs and verse ranges.
- Added optional reference validation using formats such as `2:255` and `112:1-4`.
- Added exact and normalized full-verse matching.
- Added a read-only canonical source display for comparison.
- Added direct navigation from a validated reference to the Quran reader.
- Added `data/quran-validator.validation.json` with an exact 6,236-ayah dataset comparison.
- Added third-party attribution and the MIT license notice.

## Deliberate safety restrictions

The uploaded package supports automatic correction, but StudyOS does **not** enable it.

- No Arabic source text is modified.
- No Tevhid Meali wording is modified.
- Pasted user text is never replaced.
- Partial matches are not accepted as complete verses.
- Fuzzy matches are not accepted as valid Quran quotations.
- Normalization is used only on temporary comparison copies.

If text does not match a supplied reference, StudyOS reports the mismatch and displays the stored canonical source separately. It does not silently rewrite the input.

## Dataset verification

The StudyOS Arabic dataset was compared against the uploaded package's `data/quran-verses.min.json`:

- 6,236 / 6,236 references matched in order
- 6,236 / 6,236 Uthmani texts matched exactly
- 6,236 / 6,236 simplified texts matched exactly
- 0 mismatches
- Reference dataset SHA-256: `ddd89dcb757453fe93811cb2a745ef8ba7a0ce97cd7125fcf5ee8932cddfb653`

## Files added

- `js/quran-validator.js`
- `data/quran-validator.validation.json`
- `tools/test-quran-v53-validator.js`
- `THIRD-PARTY-NOTICES.md`
- `RELEASE-NOTES-V53.md`

## Files updated

- `index.html`
- `pages/quran.page.js`
- `js/quran.js`
- `css/styles.css`
- `tools/README.md`
- `QURAN-MIGRATION-PLAN.md`

## Verification commands

```bash
node tools/test-quran-v48.js
node tools/test-daily-quran-v49.js
node tools/test-quran-v51.js
node tools/test-quran-v52-audio.js
node tools/test-quran-v53-validator.js
node tools/verify.js
node --check js/quran-validator.js
node --check js/quran.js
```
