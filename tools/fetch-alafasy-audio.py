#!/usr/bin/env python3
"""
One-off, run-it-yourself script — NOT part of the StudyOS app or its build/
verify pipeline. Run this on your own computer (it needs real internet
access; it will NOT work inside the Cowork sandbox, which blocks
huggingface.co and every Quran-audio CDN at the network level).

What it does:
  1. Streams the "Buraaq/quran-md-ayahs" dataset from Hugging Face
     (no need to download the full ~35 GB up front).
  2. Auto-detects which column identifies the reciter and which columns
     are surah/ayah numbers, since the exact schema wasn't inspectable
     from inside the sandbox that generated this script.
  3. Filters for Alafasy only, and writes each ayah's audio bytes
     verbatim (no re-encoding) to:
         media/quran-audio/alafasy/<3-digit-surah>/<3-digit-ayah>.mp3
     relative to wherever you run this script from -- run it from your
     studyos folder so the media/ folder lands in the right place.

Setup (once):
    pip install datasets huggingface_hub

Run:
    python3 tools/fetch-alafasy-audio.py

If the auto-detection can't find a confident reciter/surah/ayah column,
it will print the first row's full schema and stop -- paste that back
so the column names can be fixed instead of guessing wrong.
"""

import os
import re
import sys

TARGET_RECITER_HINTS = ["alafasy", "al-afasy", "al_afasy", "mishary", "mishari"]
OUTPUT_ROOT = os.path.join("media", "quran-audio", "alafasy")

def die(msg):
    print("ERROR:", msg, file=sys.stderr)
    sys.exit(1)

def main():
    try:
        from datasets import load_dataset
    except ImportError:
        die("Missing dependency. Run: pip install datasets huggingface_hub")

    print("Connecting to Hugging Face and opening the dataset in streaming mode...")
    ds = load_dataset("Buraaq/quran-md-ayahs", split="train", streaming=True)

    # Peek at the first row to discover the schema.
    it = iter(ds)
    first = next(it)
    print("\nDiscovered columns:", list(first.keys()))
    for k, v in first.items():
        preview = v
        if isinstance(v, dict):
            preview = {kk: (f"<bytes len={len(vv)}>" if isinstance(vv, bytes) else vv) for kk, vv in v.items()}
        elif isinstance(v, bytes):
            preview = f"<bytes len={len(v)}>"
        print(f"  {k!r}: {type(v).__name__} = {preview!r}"[:200])

    # Auto-detect the reciter column: any string-valued field whose value
    # contains one of our target hints, checked across a few rows.
    reciter_col = None
    surah_col = None
    ayah_col = None
    audio_col = None

    def looks_like_reciter(key, val):
        if not isinstance(val, str):
            return False
        low = val.lower()
        return any(h in low for h in TARGET_RECITER_HINTS) or "reciter" in key.lower()

    def looks_like_audio(key, val):
        return isinstance(val, dict) and "bytes" in val
    def looks_like_surah(key):
        return re.search(r"surah|chapter", key, re.I) is not None
    def looks_like_ayah(key):
        return re.search(r"ayah|verse", key, re.I) is not None and not re.search(r"text|ar$|en$|tr$", key, re.I)

    for k, v in first.items():
        if reciter_col is None and ("reciter" in k.lower() or looks_like_reciter(k, v)):
            reciter_col = k
        if audio_col is None and looks_like_audio(k, v):
            audio_col = k
        if surah_col is None and looks_like_surah(k) and isinstance(v, int):
            surah_col = k
        if ayah_col is None and looks_like_ayah(k) and isinstance(v, int):
            ayah_col = k

    print(f"\nAuto-detected -> reciter: {reciter_col!r}, surah: {surah_col!r}, ayah: {ayah_col!r}, audio: {audio_col!r}")

    if not (reciter_col and surah_col and ayah_col and audio_col):
        die(
            "Could not confidently auto-detect all required columns. "
            "Copy the 'Discovered columns' printout above and share it "
            "so the script can be corrected instead of guessing wrong."
        )

    os.makedirs(OUTPUT_ROOT, exist_ok=True)
    saved = 0
    checked = 0

    def is_target_reciter(val):
        low = str(val).lower()
        return any(h in low for h in TARGET_RECITER_HINTS)

    # Re-check the first row, then continue through the rest of the stream.
    import itertools
    for row in itertools.chain([first], it):
        checked += 1
        if not is_target_reciter(row.get(reciter_col)):
            continue
        surah = row.get(surah_col)
        ayah = row.get(ayah_col)
        audio = row.get(audio_col)
        if not (isinstance(surah, int) and isinstance(ayah, int) and isinstance(audio, dict) and "bytes" in audio):
            continue
        surah_dir = os.path.join(OUTPUT_ROOT, f"{surah:03d}")
        os.makedirs(surah_dir, exist_ok=True)
        out_path = os.path.join(surah_dir, f"{ayah:03d}.mp3")
        with open(out_path, "wb") as f:
            f.write(audio["bytes"])
        saved += 1
        if saved % 200 == 0:
            print(f"  saved {saved} files so far (scanned {checked} rows)...")

    print(f"\nDone. Saved {saved} audio files to {OUTPUT_ROOT}/ (scanned {checked} total rows).")
    if saved != 6236:
        print(f"NOTE: expected 6236 ayahs for a complete Quran; got {saved}. "
              f"If this is short, the reciter-name matching above may need adjusting.")

if __name__ == "__main__":
    main()
