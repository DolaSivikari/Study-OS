# V60 Design Merge Map

## Design source → live implementation

| Claude Design pattern | Live modular implementation |
|---|---|
| One navigable shell | Existing `index.html`, `router.js`, sidebar, topbar, mobile nav retained |
| Standard primary page header | `page-header-primary` applied to the first header of every page |
| Standard sub-screen header | `page-header-section` applied to headers inside tab panels |
| Consistent page identity | `studyos-page` and `data-screen-label` added to all 11 page templates |
| Standard tab treatment | Existing `filter-bar` retained; explicit `data-tab` metadata added |
| Standard metric tiles | Static classes plus runtime annotation through `ui-unification.js` |
| Standard section rhythm | Existing `ux-section-head` upgraded through the V60 style layer |
| Consistent cards | V60 overlay normalizes borders, radii, surfaces, padding, and shadows |
| Unified responsive behavior | V60 overrides real inline grid declarations at desktop/tablet/phone breakpoints |
| Quran within same product shell | Existing live Quran roots and V58 page reader retained and styled |

## Why the prototype HTML was not used as the main application

`StudyOS.dc.html` contains representative hard-coded content and a small prototype router. It does not contain the full live render roots, storage workflows, module loaders, migrations, diagnostics, or all application interactions.

Replacing the modular pages with the prototype would have removed or disconnected live elements such as:

- `operatorRoot`
- `goalsContainer`
- `tasksContainer`
- `calendarGrid`
- `scienceCycleCard`
- `knowledgeContainer`
- `doctrineRoot`
- `strategicHorizonContainer`
- `journalContainer`
- `contactsList`
- `quranReadRoot`
- `systemHealthRoot`
- `diagnosticsRoot`

V60 instead ports the prototype's hierarchy into the real modular templates and annotates dynamic renderer output.

## Page-by-page application

### Home

- Existing live dashboard structure retained.
- Primary header activated.
- Summary metrics, section labels, dynamic cards, and responsive grids unified.

### Today

- Primary Today header activated.
- Command Center, Protocol, Scorecard, and Habits use one section-header system.
- Runtime stat cards use the unified metric treatment.

### Plan

- Primary Plan header activated.
- Goals, Tasks, Calendar, and Time Log headers standardized.
- Goal/task/calendar/time statistics use consistent metric cards.

### Study

- Primary Study header activated.
- Learning Paths, Science Coach, Study Techniques, PMP Practice, and Flashcards use one section hierarchy.
- The existing richer live curriculum and evidence systems were retained rather than replaced by prototype samples.

### Knowledge

- Primary Knowledge header activated.
- Vault, Capture Inbox, and Doctrine remain live.
- Knowledge statistics and cards inherit the unified system.

### Career Strategy

- Primary Career Strategy header activated.
- Horizon, Decisions, and Systems Lab share the section hierarchy.

### Journal

- Primary Journal header activated.
- Search, filters, stats, cards, and quality loop retain their live functionality.

### Review

- Primary Review header activated.
- Weekly Review and Insights share the section hierarchy and metric system.

### Network

- Primary Network header activated.
- Dynamic contact and follow-up cards retain live actions and storage.

### Quran

- Primary Quran header activated.
- Read, Listen, and Understand tabs retained.
- V58 Mushaf Page mode and all source datasets remain unchanged.

### System

- Primary System header activated.
- Guide, Profile Lab, Settings, Health, and Diagnostics use one section hierarchy.
- Backup, restore, settings, health, and diagnostic functions remain live.
