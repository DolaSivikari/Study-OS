window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.modelGraphModal = String.raw`<div class="modal" id="modelGraphModal" onclick="if(event.target===this)closeModal('modelGraphModal')">
        <div class="modal-content" style="max-width:700px;">
            <div class="modal-header"><h3 id="modelGraphModalTitle">Model Compounding Graph</h3><button class="modal-close" onclick="closeModal('modelGraphModal')">×</button></div>
            <div class="modal-body" style="min-height:400px;">
                <div class="hint" id="modelGraphHint" style="margin-bottom:10px;">Purpose: visualize which doctrine models reinforce each other. Larger nodes = more real-world applications logged. Focus mode shows one module plus immediate neighbors.</div>
                <canvas id="modelGraphCanvas" width="660" height="400" style="width:100%;"></canvas>
            </div>
            <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal('modelGraphModal')">Close</button></div>
        </div>
    </div>`;
