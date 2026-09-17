# StudyOS V57 — Mobile Compatibility Remediation

## Purpose

V57 converts the existing partial responsive implementation into a consolidated mobile shell for phones and tablets. The application remains modular; no feature code was merged back into `index.html`.

## Files changed

- `index.html`
  - Added `viewport-fit=cover` and mobile browser metadata.
  - Added stable drawer ARIA attributes.
  - Loads `css/mobile.css` after all existing styles.
  - Loads `js/mobile.js` after the router.
  - Updated visible shell version to V57.
- `css/mobile.css` — new final mobile authority.
- `js/mobile.js` — new phone/tablet shell controller.
- `js/router.js`
  - Clears drawer scroll lock and ARIA state through the mobile controller.
  - Keeps the selected horizontal tab visible without moving the page vertically.
  - Updates the browser title to V57.
- `tools/test-mobile-v57.js` — new mobile regression contract.

## Corrected mobile failures

1. Conflicting responsive rules are superseded by one stylesheet loaded last.
2. The Doctrine Modules workspace no longer forces an approximately 859 px document width on a 390 px phone.
3. Text inputs, selects, and textareas use a 16 px mobile font to prevent browser focus zoom.
4. Primary controls have a 44 px minimum touch target.
5. Long page and feature tab bars scroll horizontally, hide their scrollbars, and reveal the active tab automatically.
6. The mobile drawer now manages body scroll lock, focus, overlay visibility, Escape handling, and ARIA state as one operation.
7. The bottom navigation and page padding account for Android/iPhone safe areas and no longer cover the last content controls.
8. Modals become phone-width bottom sheets with dynamic viewport-height limits and keyboard-safe scrolling.
9. Wide tables, code, hashes, and generated content scroll locally instead of widening the entire application.
10. Quran Read, Listen, and Understand controls receive phone-width fields, touch-size toggles, and full-width audio controls.
11. Landscape phone layouts use a shorter top bar and bottom navigation.
12. 320 px, 390 px, and tablet breakpoints are explicitly covered.

## Verification

- `tools/verify.js`: 19/19 passed.
- Quran regression suites: all passed, including audio auto-advance reuse.
- Mobile V57 contract: 16/16 passed.
- Headless mobile rendering:
  - 390 px viewport: body width remained 390 px across all 11 main routes.
  - Doctrine route reduced from 859 px document width to 390 px.
  - 320 px Doctrine route remained exactly 320 px wide with `scrollY = 0` after navigation.
  - Drawer open/close and route-close state stayed synchronized.

## Deployment note

Use the application through an HTTP/HTTPS host for normal phone use. Some Android file managers open local HTML through a restricted `content://` document provider, which can prevent sibling JavaScript and data files from loading even when the code is valid. This is a browser/file-provider limitation, not a responsive-layout failure.
