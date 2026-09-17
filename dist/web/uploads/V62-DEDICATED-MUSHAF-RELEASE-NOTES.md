# StudyOS V62 — Dedicated Mushaf Reader

## Purpose
The page-by-page Mushaf experience has been removed from the crowded Quran Tools page and promoted to its own Faith navigation destination.

## Navigation
Faith now contains:
- Quran — search, Listen, Understand, validation, notes, bookmarks, and study tools
- Mushaf Reader — focused one-page-at-a-time Quran reading

## Dedicated reader
- One Mushaf page at a time, pages 1–604
- Previous/next, direct page jump, Surah jump
- Mobile swipe and desktop arrow navigation
- Arabic, meaning, or both
- Fit-page and readable sizing
- Text-size controls
- Persistent page and reader preferences
- Audio follow-along with optional automatic page turning
- Multi-Surah page headings and Basmala handling
- Focus view that hides the StudyOS shell and leaves the reading surface
- Escape exits focus view on desktop

## Architecture
The feature remains part of the same modular StudyOS source. The dedicated route reuses the existing Quran state, datasets, audio engine, bookmarks, reading log, and preference storage. No Quran source text or Tevhid Meali data was altered.
