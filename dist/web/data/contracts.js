// ==================== STUDYOS CONTRACTS ====================
// Single source of truth for the invariants the app depends on:
// routes, tab keys, required DOM IDs, required global functions.
//
// Consumed by:
//   - js/diagnostics.js  (runContractAudit, runtime check in the browser)
//   - tools/verify.js    (static check, Node, run before every release)
//
// If you add a route, tab, required ID, or required function: add it here
// ONLY. Both diagnostics.js and verify.js read from this file, so there is
// nothing else to keep in sync by hand. Also update CONTRACTS.md (the
// human-readable description of why each one matters).
//
// Plain global (window.STUDYOS_CONTRACTS), no ES modules — must work from
// file://. Loaded early (with data/constants.js), before diagnostics.js.

window.STUDYOS_CONTRACTS = {
  // The 10 pages routed via js/router.js PAGE_MAP. Adding is fine; renaming
  // or removing breaks saved user habits and inline handlers (see CLAUDE.md).
  routes: [
    'dashboard', 'dailyops', 'planner', 'study', 'knowledge',
    'strategy', 'journal', 'reviewhub', 'network', 'system', 'quran', 'mushaf'
  ],

  // Tab keys -> each requires a panel id="tab-<key>" inside its page, and a
  // case in js/router.js renderForTab().
  tabs: [
    'operator', 'protocol', 'discipline', 'habits',
    'goals', 'tasks', 'calendar', 'tracker',
    'learn', 'sciencecoach', 'studylab', 'pmptools', 'flashcards',
    'knowledgevault', 'capture', 'doctrine',
    'horizon', 'decisions', 'frameworklab',
    'review', 'insights',
    'guide', 'profilelab', 'settings', 'health', 'diagnostics',
    'quranread', 'quranlisten', 'quranunderstand'
  ],

  // DOM IDs the app depends on existing somewhere (index.html, a
  // pages/*.page.js template, or a modals/*.modal.js template).
  requiredIds: [
    // Shell
    'pageContainer', 'commitmentHeadsUp', 'commitmentBell', 'commitmentBellCount',
    'quranMushafRoot',
    // Runtime roots / overlays
    'operatorRoot', 'doctrineRoot', 'captureInboxRoot', 'focusOverlay',
    'doctrineModal', 'doctrineModalTitle', 'doctrineModalBody',
    'doctrineModalPrimary', 'doctrineModalSecondary',
    'modelGraphModal', 'modelGraphCanvas',
    // V17 dashboard contract
    'blindSpotCard', 'todayFocusTask', 'dashStrategic', 'dashMomentumChart',
    'momentumTrendCard', 'dashLearn', 'dashWisdom', 'dailyQuoteText',
    'disciplineSparkline', 'hoursSparkline',
    'v7Time', 'v7Risk', 'v7Momentum', 'habitsMomentum', 'habitsMomentumChart',
    // V30 science-coach contract
    'scienceSummary', 'scienceCycleCard', 'scienceCycleHistory', 'scienceEvidenceList',
    // V31 adaptive-profile / execution contract
    'profileLabRoot', 'qualityLoopRoot', 'commQualityBehaviors', 'commOutcome',
    // Core modals
    'goalModal', 'taskModal', 'timeModal', 'timeLearningDomain', 'habitModal', 'flashcardModal',
    'contactModal', 'interactionModal', 'reviewDetailModal', 'eventModal',
    'journalModal', 'knowledgeModal', 'quickCaptureModal', 'decisionModal', 'qualityReviewModal',
    'commitmentCenterModal', 'commitmentModalBody', 'commitmentModalFooter'
  ],

  // Global functions the app depends on existing (router, boot, diagnostics
  // contract, modal openers, per-tab render functions are checked separately
  // via router.js renderForTab() parsing in tools/verify.js).
  requiredFunctions: [
    'go', 'goTab', 'studyosIcon',
    'renderDiagnostics', 'renderDoctrine', 'renderOperator',
    'doctrineOpenModal', 'doctrineCreateFlashcardPack', 'doctrineOpenModelGraph',
    'startFocusMode', 'pauseFocusMode', 'exitFocusMode', 'completeFocusMode',
    'openTaskModal', 'openTimeModal', 'openJournalModal', 'openDecisionModal', 'openGoalModal',
    'openQuickCapture', 'renderCaptureInbox', 'studyosSearchContent', 'studyosOpenSearchResult',
    'loadScenario', 'renderJudgmentInsight', 'openPmpModulePractice',
    'renderScienceCoach', 'scienceStartFocus', 'scienceSaveCycle',
    'renderProfileLab', 'profileRecordFeedback', 'profileIsHypothesisEnabled',
    'profileSetGuidanceDensity', 'profileGuidanceDensity',
    'evaluateDecisionGuardrail', 'renderDecisionGuardrail',
    'renderQualityLoop', 'openQualityReviewModal', 'saveQualityReview',
    'toggleCommQualityBehavior', 'setCommOutcome', 'renderExecutionInsight',
    'initV7UI', 'refreshDashboard',
    'taskDueDate', 'normalizeTaskRecord', 'goalProgress', 'timeEntryLearningDomain',
    'openCommitmentCenter', 'closeCommitmentCenter', 'renderCommitmentHeadsUp',
    'commitmentRenderCandidatePreview', 'commitmentPromptForSave', 'commitmentGuardActivity',
    'refreshActiveDataSurface', 'showReflectionActionBridge',
    'applySnapshotData', 'clearStudyOSData',
    // V55 Quran word-level entry points (follow-along transport, listen-tab
    // word-sync toggle, word tooltip) — wired from inline handlers in the
    // Quran reader markup.
    'quranFollowAlongPlayPause', 'quranFollowAlongPlayFrom',
    'quranListenSyncToggle', 'quranWordTooltipShow',
    // V56 audit remediation entry points:
    // - studyosLazyRender: router → lazy feature modules (js/module-loader.js)
    // - quranEnsureData: lazy Quran datasets + retry buttons (js/quran-data-loader.js)
    // - openInteractionModal: contact "Log" buttons (previously an orphan; now wired)
    'studyosLazyRender', 'quranEnsureData', 'openInteractionModal',
    'renderQuranMushafReader', 'quranMushafToggleFocus'
  ]
};
