# StudyOS V47 - Tevhid Meali Replaces Diyanet in the Read Tab

Release date: 2026-07-23

## Outcome

You asked to swap Diyanet İşleri (Turkish) for Tevhid Meali. Tevhid Meali's
text still can't be extracted per-verse (same copyright reason as
RELEASE-NOTES-V46.md — swapping doesn't change that, it's still copying the
whole book). So the swap works like this: Diyanet's translation is no
longer displayed or searched in the Read tab at all. In its place, each
surah now shows a link that opens your own Tevhid Meali PDF directly at
the page where that surah starts.

## What changed

- **Page index built**: `data/quran-tevhid-meali-pages.js` — maps each of
  the 114 surahs to its starting page in `tevhid-meali.pdf` (the text-only
  edition). This is pagination metadata only (a structural fact about
  where content sits in the book), not a reproduction of the translation
  itself. Built by detecting each surah's heading + verse-count line in
  the PDF's own text layer, then verified: all 114 surahs found exactly
  once, page numbers non-decreasing, two manually-checked edge cases
  (Fatiha at page 66; Surah 40's parenthetical alt-name heading) confirmed
  correct against the actual PDF text.
- **Read tab** (`js/quran.js`):
  - Removed the per-verse Diyanet translation text and its attribution
    line.
  - Removed the Surah 3:177-178 flagged-discrepancy warning from this tab
    (it was specifically about Diyanet's text, which is no longer shown
    here — the flag itself is untouched in the data, see below).
  - Removed Turkish-text search (it searched Diyanet's now-hidden text —
    keeping it would let you search words you'd never see highlighted
    anywhere). Arabic search is unchanged.
  - Added a "Tevhid Meali (Turkish translation) — page N →" link under
    each surah's title, opening your local `tevhid-meali.pdf` at the right
    page in a new tab.
- **Understand tab**: updated the text that used to say Diyanet's
  translation "is now shown... in the Read tab" — that's no longer true,
  so it now explains the swap and still links both Tevhid Meali PDFs
  (unchanged from V46).
- `index.html`: added the one new data file's `<script defer>` tag.

## What was intentionally NOT changed

- **Diyanet's own data is untouched.** `data/quran-translations-tr.js`
  still loads, still has all 6,236 verses and the `flaggedVerses` marker —
  it's just not read by the Read tab anymore. Nothing was deleted.
  Reversible if you want it back.
- **The Mushaf edition (`tevhid-kur-an-i-kerim-meali.pdf`) has no
  per-surah page map.** It uses a two-column layout that produced
  unreliable, out-of-order page detection when I tried the same approach
  — rather than ship page numbers I couldn't verify, I left it as the
  whole-PDF link it already had (Understand tab, V46). Only the text-only
  edition gets per-surah jumps.
- No changes to Arabic text, script toggle, font-size control, or verse
  navigation.

## Verification

| Check | Result |
|---|---:|
| Page map: all 114 surahs detected, no gaps, no conflicts | PASS |
| Page numbers non-decreasing across surah order | PASS |
| Spot-checks (Fatiha p.66; Surah 40's parenthetical heading) match actual PDF text | PASS |
| Diyanet text/attribution no longer rendered per-verse | PASS |
| Old flagged-discrepancy warning no longer shown in Read tab | PASS |
| Tevhid Meali link renders with correct page, per surah (tested 1, 2, 18, 40, 96, 114 against real data) | PASS |
| Link opens in new tab safely (`target="_blank"`, `rel="noopener"`) | PASS |
| Arabic verse text still verbatim (regression) | PASS |
| Arabic search still works | PASS |
| Turkish-only search query now correctly returns "No matches" | PASS |
| All 114 real surahs still render their exact declared verse count | PASS |
| Diyanet's data file still loads intact (6,236 verses, flag present) — dormant, not deleted | PASS |
| Understand tab text updated, no longer makes a false claim | PASS |
| `node tools/verify.js` | 18/18 PASS |

## Start

Open `index.html` → Quran → Read. Each surah now shows a Tevhid Meali link
under its title instead of Diyanet's inline translation.

## Next step

Whatever you'd like — Listen tab (once `media/quran-audio/alafasy/` exists
on your machine), personal notes in Understand, tafsir, or the word-by-word
decision from V45.
