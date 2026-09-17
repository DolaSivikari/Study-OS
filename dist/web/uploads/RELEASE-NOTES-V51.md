# StudyOS V51 — Quran Reading Modes

## Implemented

- Added three Quran content display modes:
  - **Verses only** — stored Arabic text only.
  - **Meaning only** — exact stored Tevhid Meali wording only.
  - **Both** — Arabic and Tevhid Meali together.
- Added two reading layouts:
  - **Full page** — the selected surah appears on one continuous reading surface.
  - **Verse by verse** — each passage remains in its own reading card.
- Kept the existing Uthmani/Simple Arabic selector available whenever Arabic is displayed.
- Kept text-size controls operational in every content and layout combination.
- Saved content mode, layout mode, Arabic script selection, and text size in the existing Quran reader preferences.
- Kept search and direct verse navigation functional in both layouts.
- Added responsive controls and a mobile-friendly continuous-page layout.

## Scripture integrity

No Quran or Tevhid Meali source data was edited. V51 changes presentation logic and CSS only.

The source-combined passages `20:27-28` and `37:22-23` remain combined in both reading layouts. StudyOS does not infer or create a translation boundary that is absent from the supplied source.

## Verification

Run:

```bash
node tools/test-quran-v48.js
node tools/test-quran-v51.js
node tools/test-daily-quran-v49.js
node tools/verify.js
```

Expected results:

- Quran source/integrity suite: **17/17**
- V51 reading-mode suite: **10/10**
- Daily Quran suite: **10/10**
- StudyOS static verification: **18/18**
