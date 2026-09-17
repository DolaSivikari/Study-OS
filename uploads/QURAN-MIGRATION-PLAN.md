# Quran Section — Current Plan and Integrity Rules

Updated through V54 on 2026-07-24.

## Non-negotiable text rule

StudyOS must not create, edit, paraphrase, correct, modernize, reconcile, or interpret Quran verses or meal wording. Display text must come from a named source file. Search normalization may operate on temporary copies for matching, but the displayed string must remain the stored source string.

## Current implementation

| Layer | Status |
|---|---|
| Arabic Quran | Complete: 6,236 ayahs, Uthmani and simple display forms from `data/quran-verses.js` |
| Surah metadata | Complete: 114 surahs from `data/quran-surahs.js` |
| Turkish meal | Complete: Tevhid Meali imported from the user-provided text-edition PDF into `data/quran-translations-tevhid.js` |
| Diyanet meal | Archived as `data/quran-translations-tr.js`; no longer loaded by `index.html` or displayed by the Quran reader |
| Source traceability | Complete: exact source page per ayah, source metadata, PDF SHA-256, and validation report |
| Read interface | Complete: surah navigation, Uthmani/simple toggle, Arabic + Tevhid search, text scaling from 70% to 200%, source links, and responsive reader styling |
| Combined source passages | Preserved as source blocks: 20:27-28 and 37:22-23 are not split by inference |
| Audio | Complete for streaming: 24 database editions × 6,236 ayahs validated and integrated; source contains URL references rather than MP3 bytes |
| Word-by-word | Pending a complete verified Turkish word-meaning source; no meanings will be generated or inferred |
| Personal notes and progress | Complete in V54: bookmarks, clearly labelled reflections, reading tracking, stats, streaks, and surah completion |

## Source files

- `media/quran-reference/tevhid-meali.pdf` — source text edition used for the V48 import.
- `media/quran-reference/tevhid-kur-an-i-kerim-meali.pdf` — additional Mushaf edition retained as a reference.
- `tools/extract-tevhid-meali.py` — deterministic importer.
- `data/quran-translations-tevhid.js` — imported meal text, page map, combined-range metadata, and source identity/hash.
- `data/quran-translations-tevhid.validation.json` — extraction and coverage report.
- `data/quran-tevhid-meali-pages.js` — legacy per-surah page-start fallback retained for compatibility.

## Extraction boundary

The importer is allowed only to reconstruct line wrapping created by PDF layout and to omit superscript footnote-reference numerals from the verse display. It must preserve the meal's punctuation, parenthetical explanations, spelling, and wording. It must not use language-model output or a second translation to fill, rewrite, or divide source text.

The source contains two combined passages that cannot be divided into separate verse translations without interpretation:

- 20:27-28, source page 334
- 37:22-23, source page 452

Each passage is stored unchanged for both verse keys for complete key coverage, while the reader renders it once as a combined block with both Arabic ayahs.

## Validation gate

A Quran release must not ship unless all of the following pass:

1. Arabic count is exactly 6,236 and surah count is exactly 114.
2. Tevhid meal key set exactly matches the Arabic ayah key set.
3. Every meal entry is non-empty and has a valid source page.
4. No replacement character or residual soft-hyphen marker exists in the imported meal data.
5. The generated data is deterministic from the same PDF hash.
6. The Diyanet runtime script is absent and the Tevhid runtime script is present in `index.html`.
7. Combined source passages render once and are not mechanically split.
8. Arabic/Turkish search, font clamping, and verse jumping pass the DOM-shim tests.
9. `tools/verify.js` and JavaScript syntax checks pass.

## Remaining work

### Audio

V52 extracts and validates the supplied `quran-database-main` audio records. The database contains 149,664 verse-level URL references rather than embedded MP3 bytes: 24 complete editions with 6,236 global ayah IDs each. StudyOS preserves the database identifiers and ayah mapping, streams through the current official Al Quran Cloud HTTPS CDN pattern, and retains the database URL as a transport fallback. The Listen tab includes reciter selection, surah/ayah selection, verse-by-verse playback, auto-advance, repeat, and exact links back to the reader. Offline bundling remains optional because audio bytes are not present in the supplied archive.

### Word-by-word

The referenced Quran-MD word dataset provides Arabic tokens, English glosses, transliteration, and word audio. Its transliteration field is not a Turkish word translation. StudyOS will not relabel it or synthesize Turkish meanings. A complete, attributable Turkish word-by-word dataset must be supplied and validated before that layer is enabled.

### Study records and tafsir

V54 adds personal bookmarks, reflections, reading logs, streaks, and surah
completion using the isolated `studyos_quran_study_v54` storage record.
Reflections are always labelled as personal notes and remain separate from
Quran Arabic, Tevhid Meali, and validator data.

Attributed tafsir remains future work. Tafsir must be stored separately from
Quran Arabic, meal text, and personal reflections so no commentary can be
confused with the source wording.

## V53 completed — Quran quote validation

- Imported the uploaded `quran-validator` reference as a verification source.
- Confirmed exact Arabic coverage for all 6,236 ayahs.
- Added a local, file-compatible quote validator in the Understand tab.
- Supports exact and normalized complete-verse matches and explicit ranges.
- Automatic correction is intentionally disabled; validation is read-only.
- Partial and fuzzy matches remain rejected to avoid presenting uncertain text as Quran.


## V54 completed — local Quran study tools

- Reviewed the uploaded `quran.sh` source and adapted its portable local study
  patterns to the existing browser architecture.
- Added bookmarks, personal reflections, browsing/reading tracking, manual
  read marking, reading statistics, streaks, and surah completion.
- Added direct navigation from saved records.
- Registered the data key in normal StudyOS backup/export and diagnostics.
- Did not import quran.sh translations or change any protected source text.
