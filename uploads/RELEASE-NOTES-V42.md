# StudyOS V42 - Quran Router/Page Scaffolding

Release date: 2026-07-23

## Outcome

V42 is step 2 of `QURAN-MIGRATION-PLAN.md`: a new top-level `quran` page
with Read/Listen/Understand tabs, wired into the router the same way
every other page is. Per the plan, this is scaffolding — the three tabs
are honest placeholders, not built-out features. No existing route, tab,
storage key, or page was removed or renamed.

## What changed

**New top-level page** (`quran`), sidebar link under a new "Faith"
section (its own group, not folded into Study/Knowledge — matches your
"new top-level page" decision). New sidebar icon (`moon`, a crescent —
added to `js/icon-system.js`, which isn't a protected file) so it's
visually distinct from Study's book icon.

**Three tabs**, following the exact same pattern as every other tabbed
page (`dailyops`, `study`, etc.):
- `quranread` (default) — placeholder for Arabic text, navigation, search.
- `quranlisten` — placeholder for the audio player.
- `quranunderstand` — placeholder for the Diyanet translation + notes.

**Protected files touched, additive only** (per CLAUDE.md, this is the
one release scoped to touch them): `js/router.js` (`PAGE_MAP`,
`NAV_DESTINATIONS`, the `pageFallback`/`defaults` objects, and a
`renderForTab` case for each new tab) and `js/page-loader.js`
(`PAGE_IDS`). Nothing renamed or removed — only additions.

**Contract registration** (per your own CLAUDE.md rule 7): `quran` added
to `data/contracts.js`'s `routes`, the three tab keys added to its
`tabs`, both hardcoded lists in `js/diagnostics.js` (`expectedPages` and
the per-tab `fnChecks` list) updated to match, and `CONTRACTS.md`'s
page/tab tables updated (10 pages → 11).

**The placeholders are honest, not fake.** This was the very first thing
you flagged in this whole project — "I don't want anything fake" — so
each tab's placeholder text says plainly what isn't built yet, and
proves the data pipeline actually works by reporting a real, live count
read from the already-verified V39-V41 data:

- Read tab reports the actual number of verses/surahs loaded.
- Understand tab reports the actual number of Diyanet translation
  entries loaded.
- Listen tab points at `tools/fetch-alafasy-audio.py` and explains it
  has to be run on your own computer first.

**Scope note**: I went slightly beyond pure scaffolding by also wiring
in the three already-built, already-verified Quran data files
(`data/quran-verses.js`, `data/quran-surahs.js`,
`data/quran-translations-tr.js`) via `<script defer>` tags, since they
were sitting inert and loading them costs nothing but proves the
pipeline end-to-end (the placeholder counts above are only possible
because of this). The Read/Listen/Understand tabs themselves are still
not built — that's steps 3-5, unchanged.

## What was intentionally NOT changed

No Arabic text display, no search, no translation display, no audio
player, no bookmarks/notes, no new storage keys. `media/quran-audio/`
still doesn't exist (waiting on you to run the fetch script). The
Surah 3:177-178 flag and the surah-name-spelling question from V40/V41
are both still open and unaffected by this release.

## Preservation proof

| Contract surface | V41 | V42 | Removed |
|---|---:|---:|---:|
| Top-level pages | 10 | 11 | 0 |
| Routed tabs | 26 | 29 | 0 |
| Runtime modal elements | 20 | 20 | 0 |
| Storage keys | all | all | 0 |

No storage schema change. No migration needed.

## Verification evidence

| Check | Result |
|---|---:|
| `git status` before commit — only the intended 9 files touched | confirmed via `git diff --stat` |
| IDs in `pages/quran.page.js` vs. `getElementById`/`goTab` calls in `js/quran.js`/the page template | all match (checked by hand, listed side by side) |
| Runtime data-load simulation (Node, `window`/`esc` stubbed): loads all 3 Quran data files, computes the exact counts the placeholders will show | 6,236 verses / 114 surahs / 6,236 translation entries — all correct |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS (was 18/18 before too — same check count, new page/tabs now included in the counts) |
| Runtime Health & Contracts, Interaction Audit, Navigation Stress Test, Workflow Mutation Test, and clicking through the new Quran page/tabs in a browser | **please run** — no live browser session was available this session; this release touches `js/router.js` and `js/page-loader.js` (protected files), so the in-app checks matter more than usual here |

## Start

Open `index.html`. You should see a new "Faith" section in the sidebar
with a "Quran" link (crescent-moon icon). Clicking it opens the Quran
page with Read/Listen/Understand tabs, each showing an honest "not built
yet" message plus a live count proving the underlying data loaded. As
with every release, make a Settings export before replacing a working
copy — this one doesn't touch storage, but the habit is good insurance.

## Next step

Step 3 of `QURAN-MIGRATION-PLAN.md`: the Read tab itself — Arabic text
display, surah/ayah navigation, Uthmani/simple script toggle, and a
diacritics-insensitive search (reimplementing the approach from
quran-validator-main's `normalizer.ts`, not its code). Say go when
ready.
