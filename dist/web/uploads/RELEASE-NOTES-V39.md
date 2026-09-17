# StudyOS V39 - Quran Data Extraction (Step 1 of the Quran Migration Plan)

Release date: 2026-07-23

## Outcome

V39 is step 1 of the 8-step sequence in `QURAN-MIGRATION-PLAN.md`: extract
and verify Quran text/translation data from the three source projects in
`quran-validator-main/` and land it as plain data files, following the
same `window.X = [...]` pattern as `data/doctrine-library.js`. **No app
wiring** — no route, no page, no tab, no storage key, no DOM contract
changed. The three new files are not `<script>`-loaded by `index.html`
yet, so nothing in the running app changes this release. That's step 2.

## What changed

Three new files added under `data/`:

- **`data/quran-verses.js`** (2.66 MB) — `window.QURAN_VERSES`, 6,236
  entries: `{surah, ayah, text, textSimple, page, juz, hizb, sajda}`.
- **`data/quran-surahs.js`** (12 KB) — `window.QURAN_SURAHS`, 114
  entries: `{number, name, englishName, revelationType, versesCount}`.
- **`data/quran-translations-tr.js`** (1.06 MB) —
  `window.QURAN_TRANSLATION_DIYANET`, Diyanet Turkish translation keyed
  `"surah:ayah"`, 6,236 entries, with attribution fields (`id`, `name`,
  `language`) so the UI can display the source when it's built.

## Where the data came from, and the non-negotiable rule I followed

Per your instruction — *"under no circumstances you are not allowed to
change the verses, words or your own understanding, this are holy
scripts that can't be edited"* — every field above is a byte-for-byte
copy from a named source, never AI-generated, paraphrased, or
summarized:

- **Arabic verse text** (`text`, `textSimple`): copied verbatim from
  `quran-validator-main/quran-validator-main/data/quran-verses.json`.
  This is the *only* source used for verse text anywhere in this
  release.
- **Surah names/metadata**: copied verbatim from that same project's
  `data/quran-surahs.json`.
- **`page`/`juz`/`hizb`/`sajda`**: numeric metadata only, cross-joined
  from `quran-database-main`'s SQLite export (`ayahs` table) by
  surah+ayah number — verified 0 mismatches against the primary source
  before trusting the join (see verification below). No text of any
  kind was pulled from this source.
- **Diyanet Turkish translation**: copied verbatim from
  `mahfuz-main/apps/web/public/translations/diyanet.json`.

## A discrepancy I found and how I resolved it (without altering anything)

`quran-database-main`'s own `ayahs.text` column disagrees with
`quran-verses.json` on 4,885 of 6,236 verses. I did not blend, average,
or "fix" this — I traced the cause and avoided the conflict entirely
by never using that column:

1. **Harmless encoding variant** (most of the 4,885): some verses use
   tatweel+superscript-alef (`U+0640 U+0670`) where the other source
   uses superscript-alef alone (`U+0670`) — same rendered text, two
   valid Unicode representations of the same Uthmani convention.
2. **Real convention difference**: whether Bismillah is merged into
   ayah 1's text or kept separate (e.g. Surah 2, Ayah 1) differs
   between the two projects' digitization choices.

Since the plan always intended `quran-database-main` for numeric
metadata only, this discrepancy doesn't need resolving — I just want
you to know it exists and why I didn't touch verse text from that
source at all.

**Also found, not a scripture issue**: 56 of 114 surahs have a spelling/
transliteration variant on the English name only (e.g. "Al-Fatiha" vs.
db's "Al-Faatiha") — a romanization-style difference (single vs. double
vowel for the same Arabic long vowel), not a naming error. The
Arabic name, verse count, and Meccan/Medinan classification agree 100%
of the time. `quran-surahs.js` uses `quran-validator-main`'s spelling
consistently; no decision needed unless you want the other convention.

## Audio — a conflict worth flagging before the Listen release

Your locked-in decision was "use my own local audio files," and your
latest message said to move "verses audios etc" from the three
projects. I re-checked all three folders specifically for this: **none
of the three projects contain actual local recitation audio files** —
only external CDN streaming URLs (`audio.qurancdn.com`,
`cdn.alquran.cloud`) referenced in code/config. There's nothing audio
to "move" from them. This doesn't block this release (Listen is step 5
of 8), but it does mean the Listen tab will need either your own
reciter files placed into a `media/quran-audio/` folder later, or a
decision to use one of these streaming URLs instead (which would mean
StudyOS making network requests, a departure from its `file://`-only
design) — your call when we reach that step.

## What was intentionally NOT changed

No router, page, modal, or diagnostics/verify contract changes. No
`<script src="data/quran-*.js">` tag added to `index.html` — these
files are inert until step 2 wires them in. No tafsir or word-by-word
morphology data extracted yet (steps 6-7). No audio file or convention
created yet (step 5).

## Verification evidence

| Check | Result |
|---|---:|
| Byte-identical copy of all 4 source files (md5sum, source → `/tmp` working copy) | verified |
| Surah/ayah numbering: `quran-verses.json` vs. SQLite `ayahs` table | 0 mismatches |
| Every verse has db metadata match (page/juz/hizb/sajda join) | 0 missing (6,236/6,236) |
| Every verse has a Diyanet translation | 0 missing (6,236/6,236), 0 empty |
| Surah verse-count field vs. actual verse count per surah | 0 mismatches (114/114) |
| Sajda (prostration) verses flagged | 15 (matches the known count) |
| Known-verse spot checks (Al-Fatiha=7, Al-Baqarah=286, Al-Ikhlas=4, Al-Falaq=5, An-Nas=6 ayahs) | all correct |
| Meccan/Medinan classification: `quran-surahs.json` vs. SQLite | 0 mismatches (114/114) |
| `node --check` on all 3 new files | PASS |
| Runtime load test (Node, `window` stubbed): counts, sample verse, sample surah, sample translation all read back correctly | PASS |
| md5sum of files copied into `data/` vs. verified `/tmp` originals | identical |
| Static release verifier (`node tools/verify.js`), before and after adding the 3 files | 18/18 PASS both times (files are inert, unloaded) |

## Start

Open `index.html` — this release changes nothing visible; the new data
files aren't loaded by the app yet. As with every release, a Settings
export isn't required this time since no schema or storage key changed,
but it doesn't hurt.

## Next step

Step 2 of `QURAN-MIGRATION-PLAN.md`: router/page scaffolding — add the
`quran` route to `js/router.js` (protected file, its own scoped
release), a minimal `pages/quran.page.js` with Read/Listen/Understand
tab placeholders, and the required `CONTRACTS.md` /
`js/diagnostics.js` / `tools/verify.js` registration. Say go when
ready — and let me know your call on the audio question above before
we reach step 5.
