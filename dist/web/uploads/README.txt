STUDYOS V62.1 — REPAIRED BUILD

BEFORE ANYTHING ELSE
  Open Settings -> Export JSON and save a backup.
  "Reset All Data" was one of 34 dead buttons. It works now.

QUICK USE
  Open OPEN_DIRECTLY_StudyOS_V62_Full_App.html in Chrome, Edge, or
  Samsung Internet. Single file, works offline, Arabic fonts included.

DEVELOPMENT
  Edit StudyOS/ directly.
  Verify:  node tools/verify.js          (22 checks)
  Build:   node tools/build-universal.js (-> dist/web + dist/portable)

  Never hand-edit the generated HTML. Rebuild it.

WHAT CHANGED
  See WHAT-CHANGED-V62.1.md.
  V61 had replaced every page template with a design-prototype snapshot and
  hidden the real markup behind display:none!important — 34 dead buttons and
  61 invisible render targets, with all tests still green. That is reversed.

  The Mushaf Reader is under the Faith section, directly below Quran.
  Unchanged and working.

FULL ANALYSIS
  STUDYOS-V62-ARCHITECTURE-AUDIT.md        the 20-section audit
  STUDYOS-AUDIT-PART-2-BASELINE-DIFF.md    V57 -> V62 diff and repair plan
  PHASE1-REPAIR-MAP.json                   machine-readable defect map

GIT
  git clone StudyOS-git-history.bundle StudyOS-git
  (3 commits. The synced folder blocks the file deletion git needs for lock
  files, so a live repo can't run there — use a local disk.)
