# StudyOS V45 - Adjustable Text Size, Reading Background

Release date: 2026-07-23

## Outcome

Two of your three asks, done. The third (word-by-word translation) needs
a decision from you first — see below, nothing shipped for it yet.

## What changed

`js/quran.js`:
- **Text size control**: "A−" / "A+" buttons next to the script toggle,
  showing the current scale as a percentage (100% default, range
  70%-200%, disabled at each end). Scales both the Arabic and the
  translation text together, proportionally. In-memory only — resets
  on reload, same as every other Read-tab setting so far.
- **Background**: each verse's Arabic text now sits in its own subtly
  tinted panel (a soft purple tint mixed into the existing card
  background via `color-mix()`, respecting whatever your light/dark
  mode already is — no new hardcoded color), and the whole reading card
  got a faint matching tint too, instead of sitting flat against the
  default card background.

I'm guessing at what "not the best" meant since I don't have a
screenshot — if this isn't the right direction (too subtle, wrong tone,
clashes in dark mode), tell me what's off and I'll adjust.

## Word-by-word translation: investigated, not built — needs your call

I checked what's actually available before building anything, since a
half-covered "translation" mislabeled as complete would be exactly the
kind of fake feature you didn't want from the start.

**What I have complete, locally, right now, no network needed:** the
Quranic Arabic Corpus morphological dataset (a well-known, established
academic resource) — 130,030 rows covering all 77,429 words of the
Quran, giving each word's root and lemma (dictionary form) and basic
grammar tags. 100% coverage. This isn't a meaning/translation, though —
it's grammatical analysis (e.g., knowing a word shares the root
ر-ح-م with "Rahman"/"Rahim", not what the word means in a sentence).

**What I have partial, locally:** a small Turkish word-meaning file in
your mahfuz-main folder — but it only covers 3,955 of the 77,429 words
(about 5%). It's explicitly named as a "patch" (corrections to a larger
set), not the full dataset.

**What I don't have:** a complete word-by-word English or Turkish
meaning gloss. The full version (with audio) lives in the Quran-MD
Hugging Face dataset already discussed, and a comparable web project
(quranwbw.com) — both blocked from this sandbox the same way the audio
was.

Three honest options, your call:
1. Ship what's complete now — root/lemma grammatical info per word
   (100% coverage), clearly labeled as grammar, not meaning.
2. Ship the partial Turkish meanings (5% coverage) clearly marked as
   incomplete, alongside the root/lemma info.
3. Hold off until a complete word-meaning source is actually reachable
   (e.g., you download one on your own machine, same pattern as the
   audio script).

## Verification

| Check | Result |
|---|---:|
| Default state shows 100%, Arabic at 1.60rem | PASS |
| A+ increases scale and font-size correctly (110% → 1.76rem) | PASS |
| Scale clamps at 200% max, button disables | PASS |
| Scale clamps at 70% min, button disables | PASS |
| Background tint (`color-mix`) present in output | PASS |
| Regression: all 114 surahs still render their exact verse count | PASS — 114/114 |
| `node tools/verify.js` | 18/18 PASS |

## What was intentionally NOT changed

No word-by-word data or UI (see above — awaiting your decision). No
persistence of font size/surah position. Listen/Understand tabs
unchanged.

## Start

Open `index.html` → Quran → Read. Try A−/A+ and look at the new verse
background treatment.
