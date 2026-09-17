window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.commitmentCenterModal = String.raw`<div class="modal" id="commitmentCenterModal" onclick="if(event.target===this)closeCommitmentCenter()">
        <div class="modal-content commitment-modal-content">
            <div class="modal-header commitment-modal-header">
                <div>
                    <div class="kicker">Commitment Intelligence</div>
                    <h3 id="commitmentModalTitle">Schedule health</h3>
                </div>
                <button class="modal-close" onclick="closeCommitmentCenter()" aria-label="Close commitment intelligence">×</button>
            </div>
            <div class="modal-body" id="commitmentModalBody" aria-live="polite"></div>
            <div class="modal-footer commitment-modal-footer" id="commitmentModalFooter"></div>
        </div>
    </div>`;
