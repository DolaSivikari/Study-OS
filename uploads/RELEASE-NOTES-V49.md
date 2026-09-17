# StudyOS V49 — Daily Quran Verse

## Implemented

- Added a full-width **Daily Quran Verse** card near the top of the Home dashboard.
- Selects one random Quran passage when StudyOS is opened.
- Keeps that passage stable while navigating within the same open session.
- Avoids immediately repeating the passage selected during the previous opening when browser storage is available.
- Added **New Verse** for an intentional re-pick and **Open in Quran** to jump to the exact passage in the Quran reader.
- Displays the exact stored Uthmani Arabic and exact stored Tevhid Meali wording.
- Preserves source-combined passages `20:27-28` and `37:22-23` as combined passages rather than inventing translation boundaries.
- Added a direct source-PDF page link for every displayed passage.
- Added responsive dashboard styling for desktop and mobile.

## Scripture integrity

V49 does not modify any Quran data file. The dashboard module reads strings from:

- `data/quran-verses.js`
- `data/quran-translations-tevhid.js`
- `data/quran-surahs.js`
- `data/quran-tevhid-meali-pages.js`

All verse and meal strings are HTML-escaped only for safe display. They are not corrected, normalized, translated, paraphrased, interpreted, combined, or split by the feature.

## Random-selection behavior

- A passage is selected only on the first dashboard render of a full application opening.
- Returning to Home during the same session does not change it.
- Reloading or reopening StudyOS creates a new selection.
- The immediately previous reference is excluded when more than one passage is available.
- The two Tevhid Meali source-combined ranges count as one selectable passage each.

## Verification

Run:

```bash
node tools/test-quran-v48.js
node tools/test-daily-quran-v49.js
node tools/verify.js
```

Also run JavaScript syntax checks for the changed modules before packaging.
