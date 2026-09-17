window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.operatorConflictModal = String.raw`<div class="modal" id="operatorConflictModal" onclick="if(event.target===this)closeModal('operatorConflictModal')">
        <div class="modal-content" style="max-width:480px;">
            <div class="modal-header"><h3 id="operatorConflictTitle">Schedule Conflict</h3><button class="modal-close" onclick="closeModal('operatorConflictModal')">×</button></div>
            <div class="modal-body" id="operatorConflictBody"></div>
            <div class="modal-footer">
                <button class="btn btn-secondary" style="flex:1;" onclick="go('calendar'); closeModal('operatorConflictModal');">Open Calendar</button>
                <button class="btn btn-primary" style="flex:1;" onclick="closeModal('operatorConflictModal')">Got it</button>
            </div>
        </div>
    </div>`;
