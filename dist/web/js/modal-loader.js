// ==================== MODAL LOADER ====================
// Extracts modal content from window.STUDYOS_MODALS (populated by the
// modals/*.modal.js <script> tags loaded just above this file in index.html)
// and injects them into #modalContainer.
// Works on file:// protocol (no XHR, no server needed, no ES modules).
// Each modal's HTML lives in its own modals/MODALNAME.modal.js file so it can
// be edited independently without touching index.html.
//
// Note: doctrineModal is intentionally nested inside flVarEditModal's markup
// (a pre-existing structure carried over as-is from before the split) — it is
// not a separate top-level entry here, but still exists in the DOM once
// flVarEditModal's HTML is injected, so getElementById('doctrineModal') works
// exactly as it did before.
//
// Back-compat: if a modal's file failed to load for some reason, fall back
// to an inline <div class="modal" id="..."> in index.html if one still exists.

(function() {
    var MODAL_IDS = [
        'goalModal','taskModal','timeModal','habitModal','flashcardModal',
        'contactModal','interactionModal','reviewDetailModal','eventModal',
        'journalModal','knowledgeModal','quickCaptureModal','decisionModal','qualityReviewModal','flVarEditModal',
        'compoundingGraphModal','operatorConflictModal','modelGraphModal','commitmentCenterModal'
    ];

    var container = document.getElementById('modalContainer');
    if (!container) {
        console.error('ModalLoader: #modalContainer not found');
        return;
    }

    var modals = window.STUDYOS_MODALS || {};
    var html = '';
    var loaded = 0;
    var failed = [];

    MODAL_IDS.forEach(function(mid) {
        if (typeof modals[mid] === 'string') {
            html += modals[mid] + '\n';
            loaded++;
            return;
        }
        var existing = document.getElementById(mid);
        if (existing) {
            loaded++; // already in the DOM via an inline fallback block
        } else {
            failed.push(mid);
        }
    });

    if (html) container.innerHTML = html;

    if (failed.length > 0) {
        console.warn('ModalLoader: Missing modal content (checked window.STUDYOS_MODALS and DOM):', failed);
    }

    console.log('ModalLoader: ' + loaded + '/' + MODAL_IDS.length + ' modals loaded');
})();
