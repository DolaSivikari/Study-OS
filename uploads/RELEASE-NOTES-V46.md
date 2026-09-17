# StudyOS V46 - Tevhid Meali Reference Links (Understand tab)

Release date: 2026-07-23

## Outcome

You uploaded two PDFs — `tevhid-meali.pdf` and `tevhid-kur-an-i-kerim-meali.pdf`
— and asked to add them as an alternative translation. Both turned out to be
the same translation (Tevhid Meali, by Halis Bayancuk / "Ebu Hanzala",
published by Tevhid Basım Yayın, ISBN 978-605-69350-5-3) — one text-only
edition, one full edition with the Arabic Mushaf pages embedded as images.
Both carry an explicit "all rights reserved" copyright notice from the
publisher on their imprint page.

That's a different situation from every other translation source in this
project. Diyanet's translation is an official body's freely-disseminated
text, already redistributed by several independent open projects I'd
cross-checked against earlier. This is a commercially published,
individually-authored book with no redistribution license anywhere in
either file. You mentioned you purchased a personal-use digital edition for
offline, internal use — that covers reading your own copy, but it isn't a
license to reproduce the book's text elsewhere, and staying offline doesn't
change that. So V46 does **not** extract or store any of this translation's
text in StudyOS's data files.

What it does instead: the Understand tab now links directly to your own two
local PDF files, so you can open either one from inside the app. No text
copied, nothing parsed, nothing added to search or the Read tab.

## What changed

- Your two PDF files copied into `media/quran-reference/` (verified
  byte-for-byte identical to the originals via md5sum). This folder is
  covered by the existing `media/` rule in `.gitignore` (added V41) — same
  as planned audio files, these never get committed or bundled into a
  release ZIP.
- `js/quran.js` — `renderQuranUnderstand()` only: added a new "Alternative
  translation (reference only)" section explaining what this is and why
  it's link-only, plus two links that open the local PDFs directly
  (`target="_blank"`, plain `<a href>` — works from `file://`, no fetch()
  involved). Everything else in the tab (translation-location note,
  not-built-yet note) is unchanged.
- No other file touched. No new routes, tabs, DOM IDs, or global functions
  — nothing needed contract registration.

## What was intentionally NOT changed

No verse-by-verse extraction of this translation. No search over it. No
inclusion in the Surah 3:177-178 discrepancy check (that only applies to
Diyanet, the one source actually parsed into StudyOS's data). No changes to
the Read tab. If you later get an explicit redistribution license from the
publisher, extracting it verse-by-verse the way Diyanet's translation was
handled would be straightforward — the data pipeline already exists.

## Verification

| Check | Result |
|---|---:|
| Both PDFs copied to `media/quran-reference/` | PASS |
| md5sum matches source exactly (both files) | PASS |
| `git status` / `git check-ignore` confirm both excluded from git | PASS |
| Understand tab still shows Diyanet-location + notes/tafsir text (regression) | PASS |
| New section renders with correct translator/publisher text | PASS |
| Both links have correct `href`, `target="_blank"`, `rel="noopener"` | PASS |
| Referenced relative paths resolve on disk from repo root | PASS |
| `renderQuranRead` unaffected (regression) | PASS |
| `node tools/verify.js` | 18/18 PASS |

## Start

Open `index.html` → Quran → Understand. Two new links at the bottom open
your local PDFs in a new tab.

## Next step

Whatever you'd like — Listen tab (once `media/quran-audio/alafasy/` exists
on your machine), personal notes in Understand, tafsir, or the word-by-word
decision from V45. Say which.
