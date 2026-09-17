window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.compoundingGraphModal = String.raw`<div class="modal" id="compoundingGraphModal" onclick="if(event.target===this)closeModal('compoundingGraphModal')">
        <div class="modal-content" style="max-width:700px;">
            <div class="modal-header"><h3>Compounding Graph</h3><button class="modal-close" onclick="closeModal('compoundingGraphModal')">×</button></div>
            <div class="modal-body" style="min-height:400px;">
                <canvas id="compoundingGraphCanvas" width="660" height="400" style="width:100%;"></canvas>
            </div>
            <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal('compoundingGraphModal')">Close</button></div>
        </div>
    </div>`;
