#!/usr/bin/env python3
"""Extract Tevhid Meali verse text from the user-supplied PDF text layer.

This script is deterministic and does not translate, paraphrase, normalize,
or otherwise rewrite the source wording. It only reconstructs PDF line wraps:
- removes soft-hyphen line-break markers (U+00AD)
- joins the continuation without inserting a space
- joins ordinary wrapped lines with one space
- excludes superscript footnote reference numbers from verse text

Source expected: media/quran-reference/tevhid-meali.pdf
Output: data/quran-translations-tevhid.js
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

VERSE_SIZE_MIN = 12.45
VERSE_SIZE_MAX = 13.55
HEADER_Y_MAX = 60.0
LEFT_X_MAX = 85.0


def is_superscript(span: dict) -> bool:
    return bool(int(span.get("flags", 0)) & 1)


def is_verse_size(span: dict) -> bool:
    size = float(span.get("size", 0))
    return VERSE_SIZE_MIN <= size <= VERSE_SIZE_MAX


def clean_line_text(text: str) -> str:
    # Do not normalize typography or punctuation. Only remove surrounding
    # whitespace introduced by PDF layout extraction.
    return text.strip()


def append_wrapped(parts: list[str], line: str) -> None:
    line = clean_line_text(line)
    if not line:
        return
    if not parts:
        parts.append(line)
        return
    if parts[-1].endswith("\u00ad"):
        parts[-1] = parts[-1][:-1] + line
    else:
        parts.append(" " + line)


def load_surahs(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    m = re.search(r"const\s+SURAHS\s*=\s*(\[.*?\]);", text, flags=re.S)
    if not m:
        raise RuntimeError(f"Could not read SURAHS array from {path}")
    return json.loads(m.group(1))


def line_spans(page: fitz.Page):
    rows = []
    for block in page.get_text("dict").get("blocks", []):
        for line in block.get("lines", []):
            spans = line.get("spans", [])
            if not spans:
                continue
            bbox = line.get("bbox", (0, 0, 0, 0))
            rows.append((float(bbox[1]), float(bbox[0]), spans))
    rows.sort(key=lambda row: (round(row[0], 2), row[1]))
    return rows


def extract(pdf_path: Path, surahs: list[dict]):
    expected = []
    for s in surahs:
        for ayah in range(1, int(s["versesCount"]) + 1):
            expected.append((int(s["number"]), ayah))

    doc = fitz.open(pdf_path)
    translations: dict[str, str] = {}
    source_pages: dict[str, int] = {}
    combined_ranges: list[dict] = []
    errors: list[str] = []

    expected_index = 0
    current_key: str | None = None
    current_parts: list[str] = []
    current_open = False

    def finish_current():
        nonlocal current_key, current_parts, current_open
        if current_key is None:
            return
        text = "".join(current_parts).strip()
        if "\u00ad" in text:
            errors.append(f"Soft hyphen remains in {current_key}")
        if not text:
            errors.append(f"Empty verse text at {current_key}")
        keys = current_key.split("|")
        for key in keys:
            if key in translations:
                errors.append(f"Duplicate verse {key}")
            translations[key] = text
            source_pages.setdefault(key, source_pages.get(keys[0]))
        current_key = None
        current_parts = []
        current_open = False

    # The text-only edition's Quran translation begins on printed/PDF page 66.
    for page_index in range(65, len(doc)):
        page = doc[page_index]
        for y, x, spans in line_spans(page):
            if y < HEADER_Y_MAX:
                # Page number/running header. Do not close an ayah that wraps
                # across a page boundary.
                continue

            visible_spans = [s for s in spans if not is_superscript(s)]
            line_full = "".join(s.get("text", "") for s in visible_spans)
            line_full = clean_line_text(line_full)
            if not line_full:
                continue

            # Source-layout anomaly verified against rendered PDF page 452:
            # Saffat 37:22-23 are printed as one unnumbered meal block between
            # numbered ayahs 21 and 24. Preserve the block verbatim and map
            # the same combined wording to both ayah keys; do not invent a split.
            if (
                page_index + 1 == 452
                and expected_index < len(expected)
                and expected[expected_index] == (37, 22)
                and line_full.startswith("Zulmedenleri, (onlarla aynı amelleri yapan) eşlerini")
            ):
                finish_current()
                current_key = "37:22|37:23"
                source_pages["37:22"] = page_index + 1
                source_pages["37:23"] = page_index + 1
                combined_ranges.append({
                    "surah": 37,
                    "start": 22,
                    "end": 23,
                    "page": page_index + 1,
                    "sourceNumbering": "unnumbered between 21 and 24",
                })
                current_open = True
                expected_index += 2
                append_wrapped(current_parts, line_full)
                continue

            first = spans[0]
            start_match = re.match(r"^(\d{1,3})(?:[–-](\d{1,3}))?\.\s*", line_full)
            is_start = (
                start_match is not None
                and is_verse_size(first)
                and "Bold" in str(first.get("font", ""))
                and float(first.get("bbox", (999, 0, 0, 0))[0]) <= LEFT_X_MAX
            )

            if is_start:
                range_start = int(start_match.group(1))
                range_end = int(start_match.group(2) or range_start)
                if range_end < range_start:
                    errors.append(f"Descending verse range {range_start}-{range_end} on PDF page {page_index + 1}")
                    continue
                if expected_index >= len(expected):
                    errors.append(f"Unexpected extra verse start {range_start}-{range_end} on PDF page {page_index + 1}")
                    continue
                expected_surah, expected_ayah = expected[expected_index]
                if range_start != expected_ayah:
                    errors.append(
                        f"Sequence mismatch on PDF page {page_index + 1}: "
                        f"found {range_start}-{range_end}, expected {expected_surah}:{expected_ayah}; line={line_full!r}"
                    )
                    continue
                range_len = range_end - range_start + 1
                range_expected = expected[expected_index:expected_index + range_len]
                if len(range_expected) != range_len or any(s != expected_surah for s, _ in range_expected) or [a for _, a in range_expected] != list(range(range_start, range_end + 1)):
                    errors.append(f"Invalid cross-boundary verse range {range_start}-{range_end} on PDF page {page_index + 1}")
                    continue

                finish_current()
                body = line_full[start_match.end():]
                current_key = f"{expected_surah}:{range_start}"
                source_pages[current_key] = page_index + 1
                current_open = True
                expected_index += range_len
                append_wrapped(current_parts, body)

                if range_end > range_start:
                    combined_ranges.append({
                        "surah": expected_surah,
                        "start": range_start,
                        "end": range_end,
                        "page": page_index + 1,
                    })
                    # The source prints one unchanged meal sentence for this
                    # whole ayah range. Store that same source string under
                    # each key; do not invent a split. Finalization happens
                    # when the next verse start/non-verse style is reached.
                    current_key = "|".join(f"{expected_surah}:{a}" for a in range(range_start, range_end + 1))
                continue

            # A continuation line belongs to the current verse only while the
            # source remains in the 13 pt verse-text style. Explanatory notes
            # are 11 pt and close the verse; headings/intros are other sizes.
            has_verse_text = any(is_verse_size(s) and not is_superscript(s) for s in spans)
            if current_key is not None and current_open and has_verse_text:
                append_wrapped(current_parts, line_full)
            elif current_key is not None and current_open and y >= HEADER_Y_MAX:
                current_open = False

    finish_current()

    if expected_index != len(expected):
        errors.append(f"Only consumed {expected_index}/{len(expected)} expected verse starts")

    expected_keys = [f"{s}:{a}" for s, a in expected]
    missing = [k for k in expected_keys if k not in translations]
    extra = sorted(set(translations) - set(expected_keys))
    if missing:
        errors.append(f"Missing {len(missing)} verses; first: {missing[:20]}")
    if extra:
        errors.append(f"Extra {len(extra)} keys; first: {extra[:20]}")

    return translations, source_pages, combined_ranges, errors


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_js(
    output: Path,
    translations: dict[str, str],
    pages: dict[str, int],
    combined_ranges: list[dict],
    source_name: str,
    source_sha256: str,
):
    payload = json.dumps(translations, ensure_ascii=False, separators=(",", ":"))
    page_payload = json.dumps(pages, ensure_ascii=False, separators=(",", ":"))
    ranges_payload = json.dumps(combined_ranges, ensure_ascii=False, separators=(",", ":"))
    header = f"""// ==================== TEVHID MEALI (Turkish) ====================
// Source: {source_name}
// Edition: 3rd edition, March 2024; prepared by Halis Bayancuk (Ebu Hanzala),
// Tevhid Basım Yayın. Imported from the user-provided PDF text layer.
//
// Integrity rule: the source wording is not translated, paraphrased, corrected,
// modernized, or interpreted here. The extraction only reconstructs PDF line
// wrapping and omits superscript footnote-reference numbers. Parenthetical
// wording inside the meal is preserved as source text.
(function() {{
  const TRANSLATION = {payload};
  const SOURCE_PAGES = {page_payload};
  const COMBINED_RANGES = {ranges_payload};
  const SOURCE = Object.freeze({{
    title: "Tevhid Meali",
    preparer: "Halis Bayancuk (Ebu Hanzala)",
    edition: "3. Baskı, Mart 2024",
    publisher: "Tevhid Basım Yayın",
    file: "{source_name}",
    sha256: "{source_sha256}"
  }});
  window.QURAN_TRANSLATION_TEVHID = TRANSLATION;
  window.QURAN_TRANSLATION_TEVHID_PAGES = SOURCE_PAGES;
  window.QURAN_TRANSLATION_TEVHID_COMBINED_RANGES = COMBINED_RANGES;
  window.QURAN_TRANSLATION_TEVHID_SOURCE = SOURCE;
}})();
"""
    output.write_text(header, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, default=Path("media/quran-reference/tevhid-meali.pdf"))
    parser.add_argument("--surahs", type=Path, default=Path("data/quran-surahs.js"))
    parser.add_argument("--output", type=Path, default=Path("data/quran-translations-tevhid.js"))
    parser.add_argument("--report", type=Path, default=Path("data/quran-translations-tevhid.validation.json"))
    args = parser.parse_args()

    surahs = load_surahs(args.surahs)
    translations, pages, combined_ranges, errors = extract(args.pdf, surahs)

    source_sha256 = sha256_file(args.pdf)
    report = {
        "source": str(args.pdf),
        "sourceSha256": source_sha256,
        "verseCount": len(translations),
        "expectedVerseCount": sum(int(s["versesCount"]) for s in surahs),
        "surahCount": len(surahs),
        "combinedRanges": combined_ranges,
        "combinedRangeCount": len(combined_ranges),
        "errors": errors,
        "samples": {k: translations.get(k) for k in ["1:1", "1:7", "2:1", "2:286", "3:177", "3:178", "112:1", "114:6"]},
        "samplePages": {k: pages.get(k) for k in ["1:1", "1:7", "2:1", "2:286", "3:177", "3:178", "112:1", "114:6"]},
    }
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    if errors:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 1

    write_js(args.output, translations, pages, combined_ranges, args.pdf.name, source_sha256)
    print(f"Wrote {args.output}: {len(translations)} verses; validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
