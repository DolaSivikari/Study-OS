# StudyOS V44 - Combined Arabic+Translation View, Search

Release date: 2026-07-23

## Outcome

Per your instruction to fold the combined Arabic+translation view and
translation search into one release, V44 does both together: the Read
tab now shows the Diyanet Turkish translation directly under each
verse's Arabic text, and a search box finds verses by Arabic (diacritics
-insensitive) or Turkish text and jumps straight to them. No protected
files touched (`js/quran.js` only).

This also resolves what was still open from V40/V41: I cross-checked
the shipped translation against Tanzil.net's `tr.diyanet` edition (via
an independent project, risan/quran-json) and it matched exactly on
every verse checked — the data already in this app is the genuine
official Diyanet text. See the chat for the verse-by-verse comparison;
no data changed as a result, just confirmed.

## What changed

`js/quran.js`:
- Every verse block in the Read tab now shows, in order: the reference
  (`surah:ayah`), the Arabic text (respecting the Uthmani/Simple
  toggle, unchanged from V43), the Diyanet Turkish translation, and an
  attribution line ("Diyanet İşleri (Turkish)"). Nothing here alters
  either text — both come verbatim from their respective data files.
- **The Surah 3:177-178 flag is now visible, not deferred.** Since
  translation display moved into this release instead of waiting for a
  separate Understand-tab release, the visible warning it was always
  meant to carry moved with it: those two verses show an orange
  "unresolved cross-source discrepancy" notice inline, linking to
  RELEASE-NOTES-V40.md, with the original wording left untouched.
- **Search** (`quranReadSearch`): a single search box checks both
  fields per verse — Arabic matching runs through a new
  `quranNormalizeArabic()` function (strips diacritics/tatweel, unifies
  alef/ya/ta-marbuta/hamza variants — this is a normalization pass used
  only to decide what matches, never applied to what's displayed) and
  Turkish matching checks both plain and Turkish-locale-aware lowercasing
  (a query typed as plain ASCII "RAHIM" and one respecting Turkish's
  dotted/dotless I both correctly match "Rahim" in the text — this was
  a real bug caught by my own test, fixed before this shipped). Results
  are capped at 30 and clicking one switches surah and scrolls to the
  exact verse with a brief highlight.
- Understand tab's placeholder text updated to say translation now
  lives in Read, and to describe what's still actually missing (notes,
  tafsir) rather than repeating something now built.

## Verification

Extended the same Node DOM-shim approach from V43 with focused tests
for this release's actual behavior:

| Check | Result |
|---|---:|
| Translation text renders verbatim under Arabic, with attribution | PASS |
| Arabic text still renders verbatim (unaffected by the new translation row) | PASS |
| Surah 3:177 and 3:178 (and only those two, across all 114 surahs) show the flag | PASS — exactly 2 of 2 |
| Arabic search for "الرحيم" returns real, clickable results | PASS |
| Turkish search, uppercase ASCII query ("RAHIM") | **failed on first attempt** — traced to Turkish-locale lowercasing turning ASCII "I" into dotless "ı", not matching the text's dotted "i". Fixed by checking both plain and Turkish-locale lowercasing; re-ran, PASS |
| Turkish search, lowercase and mixed-case queries | PASS |
| Short query (<2 chars) clears results instead of erroring | PASS |
| Nonsense query shows "No matches" instead of a blank/broken state | PASS |
| Clicking a result switches surah, scrolls to the verse, clears the search box | PASS |
| All 114 surahs still render their exact declared verse count (regression check against V43) | PASS — 114/114 |
| `node tools/verify.js` | 18/18 PASS |

## What was intentionally NOT changed

No personal notes per verse yet (still Understand tab's job, not built).
No tafsir. No audio. No persisted reading position — state still resets
on reload, same as V43. Arabic search only checks `textSimple`
(normalized); it doesn't yet search word-by-word or phrase-boundary
aware — a plain substring match after normalization, which is the same
category of technique quran-validator-main's own normalizer uses, just
implemented independently here.

## Start

Open `index.html` → Quran → Read. Try the search box with either Arabic
or Turkish text, and look at Surah 3 (Al-i-Imran) verses 177-178 for the
flagged-discrepancy notice.

## Next step

Whatever you'd like — Listen tab (once `media/quran-audio/alafasy/`
exists on your machine), personal notes in Understand, or tafsir. Say
which.
