# StudyOS V59 — Universal Desktop + Mobile

## Architecture

V59 keeps the complete application in one modular source tree. The build command creates two delivery targets from those same source files:

- `dist/web/` — modular, installable PWA for desktop and mobile browsers. It includes a manifest and offline service worker.
- `dist/portable/StudyOS-V59.html` — the complete application compiled into one direct-open HTML file for Android `content://` and desktop `file://` use.

The portable file is a generated build artifact, not a separate or reduced version. Pages, modals, feature modules, styles, Quran data, translation data, validation reports and the Quran page reader originate from the same source.

## Mobile correction

The V58.1 failure occurred because Android opened only `index.html` through a `content://` URI and denied access to sibling CSS, JavaScript, page and data files. V59 resolves this in two supported ways:

1. Install or open the PWA over HTTP(S).
2. Open the generated portable HTML directly.

Both run the full StudyOS system.

## Quran reader

The V58 Mushaf Page reader remains integrated into the normal Quran module:

- one Quran page at a time;
- previous, next and direct page navigation;
- mobile swipe and desktop arrow keys;
- saved reading position;
- Arabic, meaning and combined modes;
- audio page following when enabled.

## Development and build

```bash
npm run build
npm test
npm run serve
```

No external npm dependencies are required.
