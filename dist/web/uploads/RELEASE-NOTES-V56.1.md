# StudyOS V56.1 — Quran Listen Auto-Advance Repair

## Fixed

- Quran Listen now advances from one ayah to the next without rebuilding the `<audio>` element.
- The next ayah source is loaded into the same player, preserving browser playback authorization.
- Now-playing title, global ayah metadata, Arabic text, Tevhid meaning, ayah selector, transport buttons, active verse row, scrolling, and word-highlight attachment update in place.
- Playback promise errors now distinguish autoplay blocking, unsupported/unavailable audio, and aborted source changes.

## Root cause

V56 `quranAudioEnded()` called `quranAudioPlay()`. That function rendered the entire Listen tab again, replacing the authorized player with a new `<audio>` element. The subsequent `play()` call occurred outside the original user gesture and could be rejected by browser autoplay policy.

## Regression protection

`tools/test-quran-v52-audio.js` now verifies that auto-advance:

1. Keeps the exact same player object.
2. Changes its source to the next global ayah.
3. Calls `load()` and `play()` once.
4. Updates the displayed ayah and controls.

## Verification

- JavaScript syntax: all checked files pass.
- Quran V48: 17/17.
- Quran V49: 10/10.
- Quran V51: 10/10.
- Quran V52 audio: 13/13.
- Quran V53 validator: 13/13.
- Quran V54 study: 12/12 (baseline byte-comparison skipped because the separate V53 checkout is not included).
- Quran V55 follow-along: 18/18.
- Quran V56 hardening: 17/17.
- StudyOS verifier: 19/19.
