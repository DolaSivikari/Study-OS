window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.reviewDetailModal = String.raw`<div class="modal" id="reviewDetailModal" onclick="if(event.target===this)closeModal('reviewDetailModal')">
        <div class="modal-content" style="max-width:600px;">
            <div class="modal-header">
                <h3 style="display:flex;align-items:center;gap:8px;"><span>📋</span> <span id="reviewDetailTitle">Review</span></h3>
                <button class="modal-close" onclick="closeModal('reviewDetailModal')">×</button>
            </div>
            <div class="modal-body" id="reviewDetailContent"></div>
        </div>
    </div>`;
