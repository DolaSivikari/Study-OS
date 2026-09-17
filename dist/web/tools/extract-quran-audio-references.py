#!/usr/bin/env python3
"""Extract and validate Quran audio references from quran-database-main.

The source database stores URL references, not MP3 bytes. This tool validates
that every audio edition covers global ayah IDs 1..6236 and writes compact
StudyOS metadata instead of copying 149,664 repeated URL strings.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import shutil
import sqlite3
import tempfile
from pathlib import Path

CURRENT_CDN_TEMPLATE = "https://cdn.islamic.network/quran/audio/{bitrate}/{identifier}/{ayah}.mp3"
LEGACY_TEMPLATE = "http://cdn.alquran.cloud/media/audio/ayah/{identifier}/{ayah}"
BITRATES = [128, 64, 192, 48, 40, 32]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def materialize_database(source: Path) -> tuple[Path, tempfile.TemporaryDirectory[str] | None]:
    if source.suffix != ".gz":
        return source, None
    temp = tempfile.TemporaryDirectory(prefix="studyos-quran-audio-")
    target = Path(temp.name) / "quran.db"
    with gzip.open(source, "rb") as compressed, target.open("wb") as output:
        shutil.copyfileobj(compressed, output)
    return target, temp


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("database", type=Path, help="Path to quran.db or quran.db.gz")
    parser.add_argument("--output-dir", type=Path, default=Path("data"))
    args = parser.parse_args()

    database, temp = materialize_database(args.database)
    if not database.exists():
        raise SystemExit(f"Database not found: {database}")

    connection = sqlite3.connect(database)
    rows = connection.execute(
        """
        SELECT e.id, e.identifier, e.language, e.name, e.english_name,
               e.format, e.type, COUNT(*), MIN(ae.ayah_id), MAX(ae.ayah_id),
               COUNT(DISTINCT ae.ayah_id)
          FROM editions e
          JOIN ayah_edition ae ON e.id = ae.edition_id
         WHERE ae.is_audio = 1
         GROUP BY e.id
         ORDER BY CASE WHEN e.language = 'ar' THEN 0 ELSE 1 END, e.id
        """
    ).fetchall()

    editions = []
    checks = []
    for row in rows:
        edition_id, identifier, language, name, english_name, fmt, kind, count, minimum, maximum, distinct = row
        mismatches = connection.execute(
            """
            SELECT COUNT(*)
              FROM ayah_edition
             WHERE edition_id = ?
               AND data != 'http://cdn.alquran.cloud/media/audio/ayah/' || ? || '/' || ayah_id
            """,
            (edition_id, identifier),
        ).fetchone()[0]
        editions.append(
            {
                "databaseEditionId": edition_id,
                "identifier": identifier,
                "language": language,
                "name": name,
                "englishName": english_name,
                "format": fmt,
                "type": kind,
                "ayahCount": count,
            }
        )
        checks.append(
            {
                "databaseEditionId": edition_id,
                "identifier": identifier,
                "language": language,
                "name": name,
                "englishName": english_name,
                "format": fmt,
                "type": kind,
                "ayahCount": count,
                "minAyahId": minimum,
                "maxAyahId": maximum,
                "distinctAyahCount": distinct,
                "urlPatternMismatches": mismatches,
            }
        )
    connection.close()

    source = {
        "title": "Quran Database audio references",
        "databaseProject": "quran-database-main",
        "sourceFile": args.database.name,
        "sourceFileSha256": sha256(args.database),
        "audioEditionCount": len(editions),
        "arabicReciterCount": sum(item["language"] == "ar" for item in editions),
        "otherLanguageAudioCount": sum(item["language"] != "ar" for item in editions),
        "ayahsPerEdition": 6236,
        "audioReferenceCount": sum(item["ayahCount"] for item in editions),
        "containsAudioBytes": False,
        "originalUrlTemplate": LEGACY_TEMPLATE,
        "secureUrlTemplate": CURRENT_CDN_TEMPLATE,
        "legacySecureUrlTemplate": LEGACY_TEMPLATE.replace("http:", "https:"),
        "preferredBitrates": BITRATES,
        "note": "The database contains URL references, not embedded MP3 files.",
    }

    report = {
        "schemaVersion": 1,
        "generatedFrom": str(args.database),
        "source": source,
        "checks": {
            "editionCount": len(editions),
            "allEditionsHave6236Rows": all(item["ayahCount"] == 6236 for item in checks),
            "allEditionsCoverGlobalAyahIds1Through6236": all(
                item["minAyahId"] == 1 and item["maxAyahId"] == 6236 and item["distinctAyahCount"] == 6236
                for item in checks
            ),
            "allUrlsMatchDatabaseTemplate": all(item["urlPatternMismatches"] == 0 for item in checks),
        },
        "editions": checks,
    }

    if not all(report["checks"].values()):
        raise SystemExit("Audio validation failed; output was not written.")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    js = (
        "// Generated by tools/extract-quran-audio-references.py\n"
        "(function(){\n"
        f"  window.QURAN_AUDIO_SOURCE = {json.dumps(source, ensure_ascii=False, separators=(',', ':'))};\n"
        f"  window.QURAN_AUDIO_EDITIONS = {json.dumps(editions, ensure_ascii=False, separators=(',', ':'))};\n"
        "})();\n"
    )
    (args.output_dir / "quran-audio.js").write_text(js, encoding="utf-8")
    (args.output_dir / "quran-audio.validation.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Validated {source['audioReferenceCount']:,} references across {len(editions)} editions.")
    print(f"Wrote {args.output_dir / 'quran-audio.js'}")
    print(f"Wrote {args.output_dir / 'quran-audio.validation.json'}")
    if temp is not None:
        temp.cleanup()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
