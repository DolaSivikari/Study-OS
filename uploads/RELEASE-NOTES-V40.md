# StudyOS V40 - Diyanet Translation: Encoding Fix + Flagged Discrepancy

Release date: 2026-07-23

## Outcome

You sent me the `quran-database-main` README, which documents its
`editions`/`ayah_edition` tables in more detail than I'd explored. I used
it to cross-check V39's Diyanet translation file against an independent
second digitization of the same translation (edition `tr.diyanet`, id 56,
in that SQLite database) as an extra integrity pass — the kind of
cross-source check your scripture rule calls for. That check found one
real bug in what I'd already shipped, and one genuine discrepancy that I
am **not** resolving myself. Only `data/quran-translations-tr.js`
changed. No route, tab, storage key, or DOM contract touched.

## 1. Bug fixed: literal `&quot;` in translation text (2,018 verses)

`mahfuz-main`'s `diyanet.json` — the file V39's translation was built
from — has literal `&quot;` HTML entities in place of a plain `"`
character in 2,018 of 6,236 verses (e.g. verse 2:8 read `&quot;Allah'a ve
ahiret gününe inandık&quot;` instead of `"Allah'a ve ahiret gününe
inandık"`). That's how it would have rendered on screen — visibly
broken, not a translation error. I decoded the HTML entities losslessly
across all 6,236 verses. This is a character-encoding fix, the same
category as the tatweel/superscript-alef normalization noted in V39 —
no word, meaning, or translation choice changed. Verified: entry count
still 6,236, key order unchanged, zero entities of any kind remain,
zero verses became empty.

## 2. Flagged, NOT resolved: Surah 3, Ayahs 177-178 content mismatch

After the entity fix, I compared all 6,236 verses against the SQLite
db's independent `tr.diyanet` digitization. 6,234 now match exactly.
Two do not, and the pattern isn't a simple wording variance — it looks
like a verse-boundary shift in one of the two sources:

| | mahfuz-main (what's currently shipped) | quran-database-main (`tr.diyanet`) |
|---|---|---|
| **3:177** | "İmanı inkara değişenler, şüphesiz Allah'a bir zarar veremiyeceklerdir. Elem verici azab onlaradır." | "İmanı inkar edenler, kendilerine vermiş olduğumuz mühletin sakın kendileri için hayırlı olduğunu sanmasınlar." |
| **3:178** | "İnkar edenler, kendilerine vermiş olduğumuz mühletin sakın kendileri için hayırlı olduğunu sanmasınlar. Biz onlara ancak, günahları çoğalsın diye mühlet veriyoruz. Küçültücü azab onlaradır." | "Biz onlara ancak, günahları çoğalsın diye mühlet veriyoruz. Küçültücü azab onlaradır." |

Both sides agree on 3:176 and 3:179 (the surrounding verses), so this is
isolated to exactly this pair. mahfuz's 3:177 doesn't correspond to
either the db's 177 or 178 — it reads more like a paraphrase of 3:176.
The db's version looks like a cleaner one-ayah-per-verse split of the
same underlying sentence that mahfuz's 178 already contains in full.

**I have not changed either verse.** Per your rule — I don't resolve
scripture/translation conflicts by my own judgment. The shipped file
still contains mahfuz's original wording at both verses, unchanged, plus
a new `flaggedVerses: ['3:177', '3:178']` marker in the data file itself
so the Understand tab can visibly flag this to you in-app once it's
built, instead of silently presenting possibly-misaligned text as
settled. My suggestion, for when you're ready to decide: check these two
ayahs against Diyanet's own published text (their website or app) and
tell me which wording is correct for each verse number, or say to adopt
the db's split instead — either way I'll only change it on your
explicit instruction of which text goes where.

## What was intentionally NOT changed

`data/quran-verses.js` (Arabic text) and `data/quran-surahs.js` are
untouched — this release only touched the translation file. No other
translations (Ateş, Bulaç, Vakfı, Gölpınarlı, Öztürk, Yazır, Yıldırım,
Yüksel) or the `tr.transliteration` edition were pulled in; still out of
scope per the locked-in decision (Diyanet only). No audio-related change.

## Audio — confirmed, not just inferred

Your README's own roadmap lists "Add audio recitation references" as an
unchecked, planned item, and the `ayah_edition` rows with `is_audio=1`
that I checked all contain CDN URLs (`cdn.alquran.cloud/media/audio/...`),
never actual audio bytes. This fully confirms what I told you after
V39: no local recitation audio exists in any of the three source
projects. Still your call when we reach the Listen step: your own files,
or accept network calls to a CDN.

## Verification evidence

| Check | Result |
|---|---:|
| Entity decode: entry count preserved | 6,236 before and after |
| Entity decode: key order preserved | unchanged |
| Entity decode: no entities remain | 0/6,236 |
| Entity decode: no verse became empty | 0 |
| Cross-check vs. db `tr.diyanet` after decode | 6,234/6,236 exact match |
| Isolated mismatch confirmed contained to one location | 3:177, 3:178 only; 3:176 and 3:179 match exactly |
| `node --check` on rebuilt file | PASS |
| Runtime load test (Node, `window` stubbed) | PASS — count, flagged-verse marker, decoded sample verse all read back correctly |
| md5sum of file copied into `data/` vs. verified `/tmp` original | identical |
| Static release verifier (`node tools/verify.js`) | 18/18 PASS |

## Start

Open `index.html` — no visible change; the file still isn't loaded by
the app (that's step 2 of the migration plan). As with every release,
a Settings export isn't required since no schema/storage key changed.
