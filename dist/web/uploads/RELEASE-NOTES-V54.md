# StudyOS V54 — Quran Study and Progress Tools

## Source reviewed

The uploaded `quran.sh` project was reviewed as an implementation reference.
StudyOS adapts only features that fit an offline browser application. Its Bun,
OpenTUI, SQLite, microphone, recognition, WebGPU, external tafsir, and remote
image subsystems were not copied into StudyOS.

## Added

- **My Quran** panel in the Read tab.
- One bookmark per canonical passage.
- Personal reflections stored separately from Quran Arabic and Tevhid Meali.
- Browsing mode and optional reading-tracking mode.
- Automatic logging after a passage remains substantially visible for 1.2
  seconds when tracking is enabled.
- Manual **Read** control on every passage.
- Reading statistics for Today, 7 days, 30 days, and All time.
- Current streak, longest streak, reading days, verses read, surahs touched,
  and completed-surah totals.
- Mark/unmark the selected surah as complete.
- Bookmark and reflection lists with direct navigation to the passage.
- Local persistence and normal StudyOS backup/export support through the
  registered `K.quranStudyData` storage key.

## Sacred-text boundary

- Quran Arabic was not changed.
- Tevhid Meali was not changed.
- Combined source passages remain combined.
- Personal notes are labelled as user-created content and never displayed as
  Quran, meal, or tafsir.
- No quran.sh translation data was imported.

## Files added

- `js/quran-study.js`
- `tools/test-quran-v54-study.js`
- `RELEASE-NOTES-V54.md`

## Files updated

- `index.html`
- `pages/quran.page.js`
- `js/core.js`
- `js/quran.js`
- `css/styles.css`
- `THIRD-PARTY-NOTICES.md`
- `QURAN-MIGRATION-PLAN.md`
- `tools/README.md`

## Verification

```bash
node tools/test-quran-v48.js
node tools/test-daily-quran-v49.js
node tools/test-quran-v51.js
node tools/test-quran-v52-audio.js
node tools/test-quran-v53-validator.js
node tools/test-quran-v54-study.js
node tools/verify.js
node --check js/quran-study.js
node --check js/quran.js
```
