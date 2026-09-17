# StudyOS V43 - Quran Read Tab: Navigation + Script Toggle

Release date: 2026-07-23

## Outcome

V43 is the first half of step 3 in `QURAN-MIGRATION-PLAN.md`: the Read
tab now actually displays the Quran — surah selector with prev/next,
full verse-by-verse Arabic text, and a toggle between the Uthmani
(full-diacritic) and Simple (diacritics-stripped) scripts. No protected
files touched (`js/quran.js` only); no route, tab, or storage key
changed.

**Deliberately split in two, per "proceed with caution":** the
diacritics-insensitive search (also part of step 3 in the plan) is held
for a separate release (V44). Search needs a new Arabic-normalization
function — its own piece of logic with its own correctness risk — so
it gets verified on its own rather than shipped bundled with navigation.

## What changed

`js/quran.js`:
- `renderQuranRead()` rewritten from the V42 placeholder into a real
  reader: surah dropdown (all 114, showing number/English name/
  revelation type/verse count), Prev/Next surah buttons (disabled at
  the boundaries), and every verse of the selected surah rendered in
  order with its `surah:ayah` reference and a sajda marker where
  applicable.
- Script toggle (Uthmani / Simple) is a pure display choice — it
  switches which of the two already-verbatim fields (`text` vs.
  `textSimple`) gets shown. Nothing is computed, generated, or altered;
  both fields come from V39's extraction unchanged.
- Arabic text renders `dir="rtl" lang="ar"` with a serif Arabic font
  stack, through the same `esc()` helper every other feature file uses
  — this only escapes HTML-special characters (`<`, `>`, `&`, `"`),
  none of which occur in Arabic script, so the displayed text is
  byte-for-byte what's in `data/quran-verses.js`.
- Listen/Understand tabs are untouched, still V42's honest placeholders.

## Verification (this is the release where I actually tested behavior, not just static syntax)

Static checks aren't enough for a UI feature, so beyond `tools/verify.js`
I wrote a Node-based DOM shim to actually execute `renderQuranRead()`
and inspect its output — the closest to a real check I can run without
a browser in this environment.

| Check | Result |
|---|---:|
| Al-Fatiha renders exactly 7 verse blocks | PASS |
| Rendered `1:1` contains the real, unaltered Bismillah text from the data file | PASS |
| Script toggle: switching to "Simple" changes the displayed text to `textSimple` | PASS |
| Al-Baqarah renders exactly 286 verse blocks | PASS |
| Prev disabled at Surah 1, Next disabled at Surah 114 | PASS |
| Invalid surah numbers (0, 999) are silently ignored, state unchanged | PASS |
| **Every one of the 114 surahs renders exactly its declared `versesCount`** — the strongest check: it means all 6,236 verses are reachable and none are mis-attributed to the wrong surah | **114/114 match** |
| `node tools/verify.js` (onclick/onchange handlers now point at real functions: `quranReadSetSurah`, `quranReadGoSurah`, `quranReadSetScript`) | 18/18 PASS |

**Still needed from you**: open `index.html` and actually look at it —
the DOM-shim tests prove the logic is correct, but only a real browser
can confirm the Arabic font renders legibly, RTL layout looks right,
and nothing overflows or clips on your screen.

## What was intentionally NOT changed

No search yet (V44). No ayah-level deep-linking or bookmarking. No
"last-read position" persistence — this release keeps navigation state
in memory only (resets on reload); persisting it as
`studyos_quran_progress_v1` is a deliberately separate, later, narrowly
scoped release rather than bundled in here. Listen and Understand tabs
unchanged. The Surah 3:177-178 translation flag and surah-name-spelling
question from V40/V41 remain open and unaffected (this release is
Arabic text only, no translation involved).

## Start

Open `index.html` → Quran → Read tab. Try the surah dropdown, Prev/Next,
and the Uthmani/Simple toggle.

## Next step

V44: diacritics-insensitive search over the Arabic text (reimplementing
the approach from quran-validator-main's `normalizer.ts`, not its code),
completing step 3. Say go when ready.
