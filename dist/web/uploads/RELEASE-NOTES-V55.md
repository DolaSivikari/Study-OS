# StudyOS V55 — Quran Reader Upgrades (Mahfuz port)

## Source reviewed

The open-source **Mahfuz** Quran platform (github.com/theilgaz/mahfuz, MIT)
was reverse-engineered from its full source archive. StudyOS ports its
framework-free mechanisms only: the word-level audio engine, the QDC timing
service with the Alafasy rescaling fallback, the waqf-aware word splitter,
the tajweed markup parser and color palette, the reading-mode model, and the
self-hosted verse fonts. Mahfuz's React/TanStack application layer, server
database, recitation ASR, spaced repetition, games, and social features were
NOT copied.

## Added

### Arabic verse fonts (offline, self-hosted)
- Scheherazade New (regular + bold), KFGQPC Uthmanic Script HAFS, and Noto
  Naskh Arabic in `media/fonts/` (~448 KB total), declared with
  `font-display: swap`. No external font requests.
- A **Font** option group in the reader: Scheherazade / Mushaf (KFGQPC) /
  Naskh / System, persisted per user. Because the app previously fell back to
  system fonts, every Arabic surface upgrades visually even at defaults.

### Reading modes
- New **Word by word** content mode: one card per word with the Quran.com
  Uthmani word form, transliteration, and word meaning, with the Tevhid Meali
  passage translation kept below. Meaning language toggles **Türkçe/English**
  (Turkish confirmed available from the live API).
- Existing modes (Verses only / Meaning only / Both × Full page / Verse by
  verse × Uthmani / Simple) are unchanged and still persisted under the same
  storage key.

### Word-by-word audio follow-along (Read tab)
- A transport bar streams one QDC chapter mp3 per surah with word-level
  timing segments: the active verse card highlights and auto-scrolls to
  center, and a **word indicator glides word by word** over the verse text.
- 15 word-timed reciters (Alafasy default), 0.75–1.5× speed, repeat
  off/verse/surah, prev/next verse, progress bar, MediaSession lock-screen
  controls, and a per-passage **▶ Follow** button to start from any verse.
- Reciters lacking segments get the Alafasy timing shape linearly rescaled
  to each verse's duration (Mahfuz Tier-2 fallback), labelled approximate.

### Listen-tab word highlight
- The existing validated per-verse streams are untouched; a toggleable
  overlay rescales QDC verse segments onto the playing element's real
  duration. Mapped editions (8 confident recording-family matches in
  `data/quran-word-audio.js`) use their own reciter's timing shape; other
  Arabic editions use the Alafasy shape; non-Arabic editions show no
  indicator. The overlay labels itself and its accuracy tier.

### Tajweed letter coloring
- Optional **Tajweed → Colors** toggle (Uthmani script only) renders the
  Quran.com tajweed-annotated text through a safe parser (whitelisted rule
  classes, escaped text, end-numeral spans stripped) with Mahfuz's 16-rule
  palette plus a dark-scheme variant. Word highlighting continues to work on
  colored text — an improvement over Mahfuz, which disables it there.

### Word tooltips
- Clicking any word in verse layouts (Read or Listen) opens a small card
  with that word's form, transliteration, and TR/EN meaning, labelled as
  Quran.com data.

## Sacred-text boundary

- Quran Arabic, Tevhid Meali, surah metadata, and audio references were not
  changed — all six data files are byte-identical to V54 (verified by hash).
- Word spans only **re-group** the stored verse string. A test proves the
  re-grouping reproduces all 12,472 stored strings (6,236 × Uthmani +
  simple) byte-for-byte; any string that cannot be re-grouped renders
  untouched with no spans. Unlike Mahfuz's splitter, no non-breaking-space
  substitution is performed.
- When tajweed coloring is ON, the letters shown come from the labelled
  Quran.com tajweed layer; a per-verse alignment check falls back to the
  stored letters whenever the layer does not tokenize identically. OFF
  returns to the stored text.
- Word meanings are per-word overlays and are never merged into the Tevhid
  Meali. The Quran-MD dataset remains excluded (V52 labelling reasons,
  restated in the Understand tab).

## Data & network boundary

- New online layers (word timing, word-by-word text, tajweed text) come from
  Quran.com / Quran Foundation public APIs, documented endpoint-by-endpoint
  in `data/quran-word-audio.js` and the Understand tab, cached in memory for
  the session only, and always labelled in the UI.
- Failure behavior is explicit: sticky error states with a Retry control (no
  offline refetch loops), static text instead of a moving indicator, and the
  stored reader always fully functional offline. The Listen tab's streaming
  sources are exactly as in V52/V54.
- Malformed upstream timing rows (observed live: one-element segment arrays
  on 1:3) are sanitized before use. Live alignment was audited across all 30
  verses of surah 67: local token counts matched QDC word positions exactly,
  including a mid-verse phrase repeat (67:28) that the highlight tracks
  correctly.

## Files added

- `js/quran-audio-engine.js` (602) — vanilla port of the Mahfuz engine +
  segment sanitizer; pure helpers exposed for tests.
- `js/quran-word-data.js` (453) — WBW/tajweed/timing fetch + session caches
  + integrity-preserving word splitter + safe tajweed parser.
- `js/quran-follow-along.js` (502) — transport bar, DOM highlight/scroll
  glue, Listen-tab overlay, preferences under `K.quranFollowAlong`.
- `data/quran-word-audio.js` (89) — provenance registry: timed reciters,
  edition→QDC mapping, endpoints, fallback tiers.
- `media/fonts/` — 4 woff2 font files.
- `tools/test-quran-v55-follow.js` (400) — 18 checks.
- `RELEASE-NOTES-V55.md`.

## Files changed

- `js/quran.js` (974 → 1286) — word-span/tajweed/WBW rendering, new option
  groups, follow-along bar + per-passage Follow buttons, Listen overlay
  wiring, word tooltip, async layer re-render, Understand-tab provenance.
- `css/styles.css` (3657 → 3886) — @font-face, font classes, word/verse
  highlight, follow bar, WBW cards, tooltip, tajweed palettes (+dark),
  reduced-motion and mobile rules.
- `index.html` (271 → 280) — four script tags in the documented load order.
- `js/core.js` (710 → 712) — `K.quranFollowAlong` registration + export
  name (storage-scoped change only).
- `data/contracts.js` (88 → 93) + `CONTRACTS.md` (236 → 252) — four V55
  entry-point functions and the new storage key documented.
- `THIRD-PARTY-NOTICES.md` (74 → 121) — Mahfuz, font licenses, Quran.com
  attribution.

## Verification

| Check | Result |
|---|---|
| `node tools/verify.js` (18 checks: syntax, contracts, handlers, storage) | PASS 18/18 |
| `tools/test-quran-v55-follow.js` (18 checks incl. full-dataset byte-identity + combined render smoke) | PASS 18/18 |
| `tools/test-quran-v48.js` | PASS 17/17 |
| `tools/test-daily-quran-v49.js` | PASS 10/10 |
| `tools/test-quran-v51.js` | PASS 10/10 |
| `tools/test-quran-v52-audio.js` | PASS 12/12 |
| `tools/test-quran-v53-validator.js` | PASS 13/13 |
| `tools/test-quran-v54-study.js` | PASS 11/12* |
| Sacred data files vs V54 upload (sha256) | 6/6 identical |
| Live API contract probes (QDC timing 1 & 67, WBW TR 1, tajweed 1:1) | Verified |

\* The 12th V54 check compares against a `studyos-v53-quran-validator`
sibling folder that exists only on the original machine; the pristine V54
zip fails it identically, so this is environmental, not a regression.

## Known limitations

- The three new layers need internet; everything else works offline as
  before. In-browser checks (System → Diagnostics Core Suite, Navigation
  Stress, Workflow Mutation) still need one manual run on your machine, per
  the release checklist — this environment has no browser.
- Tier-2/Listen-tab word timing is proportional, not exact; the UI says so.
- Tajweed mode displays Quran.com letters (labelled); rule coloring cannot
  be byte-sourced from local data without a local tajweed dataset.
- Word tooltips need the WBW fetch to have completed for that surah.

## Intentionally not changed

Listen-tab audio sources and edition list; the quote validator; My Quran
study tools; daily Quran; search; all storage keys and schema version; the
protected engine files (core.js touched only for the documented key
registration); no SM-2/memorization, games, QCF page fonts, or recitation
ASR (candidate later releases per the teardown's sequence).
