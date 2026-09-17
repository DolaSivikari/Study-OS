window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.decisionModal = String.raw`<div class="modal" id="decisionModal" onclick="if(event.target===this)closeModal('decisionModal')">
        <div class="modal-content" style="max-width:760px;max-height:88vh;overflow-y:auto;">
            <div class="modal-header"><h3>⚖️ Decision</h3><button class="modal-close" onclick="closeModal('decisionModal')">×</button></div>
            <div class="modal-body" id="decisionModalBody"></div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('decisionModal')">Cancel</button>
                <button class="btn btn-danger" id="decisionDeleteBtn" style="display:none" onclick="deleteDecision()">Delete</button>
                <button class="btn btn-primary" onclick="saveDecision()">Save</button>
            </div>
        </div>
    </div>`;
