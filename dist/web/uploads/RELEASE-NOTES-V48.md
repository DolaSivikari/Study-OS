# StudyOS V48 — Tevhid Meali Inline Reader

## Implemented

- Removed the Diyanet Turkish meal from the application runtime.
- Added the exact Tevhid Meali import from the supplied text-edition PDF.
- Added complete coverage for all 6,236 ayah keys across 114 surahs.
- Added exact per-ayah PDF page links, source metadata, and the source PDF SHA-256.
- Preserved the two source-combined passages, 20:27-28 and 37:22-23, as single meal blocks instead of inventing verse boundaries.
- Added Arabic and Tevhid Turkish search with display-safe normalization.
- Retained Uthmani/simple Arabic display selection.
- Added persistent A− / reset / A+ text scaling from 70% to 200%.
- Reworked the reader background, toolbar, verse panels, search results, mobile layout, and source attribution.
- Added an integrity explanation and direct links to the source editions and validation report.

## Integrity controls

`tools/extract-tevhid-meali.py` reads the PDF text layer deterministically. It only reconstructs layout line wrapping and removes superscript footnote-reference numerals from the verse display. It does not translate, paraphrase, correct, modernize, or interpret the source. Parenthetical wording and punctuation remain part of the imported text.

Generated artifacts:

- `data/quran-translations-tevhid.js`
- `data/quran-translations-tevhid.validation.json`

Source PDF SHA-256:

`b079c3d7aba62ae433528d962a9822d65be30183ca12ddb5c0ee96d4d7e456df`

## Word-by-word and audio

No Turkish word meanings were generated. The referenced word dataset distinguishes English meanings from transliteration, so the reader states that a verified Turkish word-by-word source is still required.

Audio is not bundled. `tools/fetch-alafasy-audio.py` remains available for importing a local reciter library on a computer with internet access.

## Verification

V48 includes `tools/test-quran-v48.js`, covering:

- 6,236 Arabic and Tevhid entries
- exact key-set equality
- 114 surahs
- valid page coverage
- forbidden-character checks
- both combined source ranges
- runtime script swap
- exact Surah 1 rendering
- combined-block rendering
- Arabic and Turkish search
- font-size clamping
- verse jump/highlight behavior

The standard `tools/verify.js` contract test and JavaScript syntax checks are also required before packaging.
