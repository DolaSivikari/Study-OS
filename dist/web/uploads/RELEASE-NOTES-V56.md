# StudyOS V56 — Audit Remediation (hardening, structure, performance)

## Source reviewed

Two V55 review documents were implemented in full, per explicit user
direction ("full implementation of all the findings"): the **V55 Integrity
Validation** (V56 recommendations 1–6) and the **Full System Assessment**
(R1–R13). This release therefore deliberately bundles quick fixes,
structural refactors, and startup-performance work in one release — a
documented exception to the one-narrow-scope rule, at the owner's request.
Two assessment suggestions were adapted to CLAUDE.md's hard rules: the
module split uses plain scripts (ES modules are banned for file://) and all
lazy loading uses classic script-tag injection (no bundler — explicitly
rejected).

## Remediation matrix (finding → resolution)

| # | Audit finding | Resolution |
|---|---|---|
| R1 | Broken "Edition with Mushaf" PDF button | Button removed (PDF is not shipped); a code comment documents how to restore it if the file returns. Text-edition link kept. |
| R2 | "Full page" mislabel | Renamed **Continuous**; "Mushaf page" stays reserved for a real page mode. |
| R3 | 9 orphaned functions | 8 deleted (`renderTodayLearning`, `updateDisciplineScore`, `commandNavigate`, `filterGoals`, `filterTasks`, `getCalendarStudyHours`, `getJournalDoctrineEntries`, `operatorNextAvailableHour`); each site carries a dated removal comment. The 9th, `openInteractionModal`, was **wired instead of deleted** (user decision): every contact card now has a **Log** button that opens the existing interaction modal (`stopPropagation` so the card's edit action doesn't also fire). |
| R4 | Dead 1.04 MB Diyanet data file | **Deleted** (user decision over wiring it as a second meal). index.html comment updated; V48 suite now asserts the file is absent. |
| R5 | V54 suite crashes without sibling checkout | Byte-identity block now skips with a printed SKIP when the V53 baseline folder is absent; suite stays green on clean clones. |
| R6 | Three divergent Quran state objects | New `js/quran-session.js` owns one `quranSession` container; `quranReadState`/`quranAudioState`/`quranFollowState` are now aliases of its `read`/`listen`/`follow` namespaces (verified by identity test). Call sites unchanged. |
| R7 | Monolithic quran.js (1,286 lines) | Split into `js/quran.js` (869 — shared core + Read tab), `js/quran-listen.js` (341), `js/quran-understand.js` (186), loaded in documented order. Old test harnesses updated to load the split files. |
| R8 | No position persistence, no migration | Read payload v2 persists `surah` + `ayah`; restored once per session with a scroll-to-verse. `quranPrefsLoad/Save/Migrate` add a `_v` stamp + migration chain to all three Quran preference payloads (V48–V55 payloads = v1, migrate forward losslessly — tested). **Storage key names unchanged.** |
| R9 | ~3.8 MB Quran data parsed at every startup | `js/quran-data-loader.js` injects `quran-verses.js` + `quran-translations-tevhid.js` on first Quran use (file://-safe script injection). Reader/Listen/Understand/daily-verse all gate with loading + error/Retry states; the quote-validator index is rebuilt after data arrives. |
| R10 | 4 heavy modules eager (~360 KB) | `js/module-loader.js` defers `diagnostics`/`guide`/`framework-lab`/`pmp-tools` to first tab entry. The Diagnostics tab loads **all** lazy modules first so its runtime contract audit and navigation stress test always see the complete app. The two lazy-unsafe call sites (insights/learn mutate `pmpToolView`, a top-level `let` that doesn't exist pre-load) and the static "Run Core Suite" button are ensure-wrapped. |
| R12 | No dead-code guard | `tools/verify.js` check #19: any top-level `function NAME()` with zero references across all sources fails the build (IIFEs excluded; explicit allowlist for dynamic dispatch). Currently 757/757 referenced. |
| R13 | Quran absent from mobile quick nav | Added to the bottom bar (moon icon); grid widened to 6 columns. |

Report correction folded in: the assessment's "native ES modules are enough"
(R7) and bundler note conflict with CLAUDE.md rules 1–2; implemented with
plain scripts and runtime injection instead, same outcome.

## Startup impact

~4.05 MB no longer parses at boot (verses 2.66 MB + Tevhid 1.13 MB +
diagnostics 144 KB + guide 95 KB + framework-lab 63 KB + pmp-tools 57 KB),
plus the deleted 1.04 MB dead asset leaves the repo. First Quran open / first
tab entry pays its own cost once per session, with visible loading states.

## Sacred-text boundary

No Quran data file was modified: `quran-verses.js`, `quran-surahs.js`,
`quran-translations-tevhid.js`, `quran-tevhid-meali-pages.js`,
`quran-audio.js`, and the Tevhid source PDF are byte-identical to V55
(sha256-verified). The only data-directory change is the deletion of the
never-loaded Diyanet file. Lazy loading changes WHEN data loads, never what
is in it.

## Files added

- `js/quran-session.js` (127) — unified state + versioned pref migration.
- `js/quran-data-loader.js` (96) — lazy Quran datasets + validator rebuild.
- `js/module-loader.js` (106) — lazy feature modules.
- `js/quran-listen.js` (341), `js/quran-understand.js` (186) — split tabs.
- `tools/test-quran-v56-hardening.js` (324) — 17 checks, one per finding.
- `RELEASE-NOTES-V56.md`.

## Files changed

- `js/quran.js` (1286 → 869) — session wiring, position persistence, lazy
  gate, R1/R2 fixes, split-out sections.
- `js/quran-follow-along.js`, `js/daily-quran.js` — session/lazy wiring.
- `js/router.js` (protected, scoped) — 4 lazy renderForTab cases; orphan
  removal. PAGE_MAP/go/goTab untouched.
- `js/insights.js`, `js/learn.js`, `pages/system.page.js` — lazy-safe call
  sites. `js/contacts.js` — Log button. Orphan removals in `js/learn.js`,
  `js/discipline.js`, `js/goals.js`, `js/tasks.js`, `js/integration.js`,
  `js/operator.js`.
- `index.html` — mobile nav +Quran; 6 tags removed (2 data + 4 modules),
  3 loaders + 3 split/session modules added; comments updated.
- `css/styles.css` — 6-column mobile nav; V56 loading/log-button styles.
- `tools/verify.js` — dead-code guard (check #19).
- `data/contracts.js` + `CONTRACTS.md` — 3 new contract functions
  (`studyosLazyRender`, `quranEnsureData`, `openInteractionModal`), payload
  `_v` scheme, protected-file scope notes.
- Test harnesses (scoped updates, intent preserved): v48 (Tevhid-lazy
  assertion + split files), v51 (Continuous label), v52/v53 (split files;
  v53's tag-order check re-expressed as the loader-rebuild invariant), v54
  (graceful skip), v55 (session + split files).
- Deleted: `data/quran-translations-tr.js`.

## Verification

| Check | Result |
|---|---|
| `node tools/verify.js` (now 19 checks incl. dead-code guard) | PASS 19/19 |
| `tools/test-quran-v56-hardening.js` | PASS 17/17 |
| `tools/test-quran-v55-follow.js` | PASS 18/18 |
| `tools/test-quran-v48.js` | PASS 17/17 |
| `tools/test-daily-quran-v49.js` | PASS 10/10 |
| `tools/test-quran-v51.js` | PASS 10/10 |
| `tools/test-quran-v52-audio.js` | PASS 12/12 |
| `tools/test-quran-v53-validator.js` | PASS 13/13 |
| `tools/test-quran-v54-study.js` | PASS 12/12 (+ documented SKIP without the V53 baseline folder) |
| Sacred files vs V55 upload (sha256, 6 files incl. PDF) | 6/6 identical |

## Known limitations

- The three in-browser diagnostics (System → Diagnostics: Core Suite,
  Navigation Stress, Workflow Mutation) still need one manual run on your
  machine — no browser in this environment. Given the size of this release
  (lazy loading changes startup behavior), please do run them before
  tagging.
- Buttons inside a lazily rendered tab exist only after its module loads
  (ms-level on local disk). The one pre-render static button
  ("Run Core Suite") is ensure-wrapped; `flVarEditModal`'s save handler is
  reachable only from inside framework-lab, so it needs no wrap.
- Scroll restore targets the last explicitly opened verse (jump/bookmark/
  daily-verse), not free-scroll position — tracking free scroll would
  require persisting on every scroll event, deliberately avoided.

## Intentionally not changed

Storage key names; schema version; IndexedDB; the SRS/learning engines; all
sacred Quran data; the Listen tab's validated audio sources; the V55
word-level features. The Diyanet second-meal option (assessment R11) was
declined by the user in favor of deletion.
