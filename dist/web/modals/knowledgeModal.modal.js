window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.knowledgeModal = String.raw`<div class="modal" id="knowledgeModal" onclick="if(event.target===this)closeModal('knowledgeModal')">
        <div class="modal-content" style="max-width:600px;max-height:85vh;overflow-y:auto;">
            <div class="modal-header"><h3>Knowledge Note</h3><button class="modal-close" onclick="closeModal('knowledgeModal')">×</button></div>
            <div class="modal-body" id="knowledgeModalBody">
                <input type="hidden" id="knowledgeEntryType" value="note">
                <div class="form-group"><label class="form-label" for="knowledgeTitle">Title *</label><input type="text" class="form-input" id="knowledgeTitle" aria-label="Knowledge title"></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="knowledgePathway">Pathway</label><select class="form-select" id="knowledgePathway"><option value="">— None —</option><option value="pmp">PMP</option><option value="mcmaster">McMaster</option><option value="smr">SMR</option></select></div>
                    <div class="form-group"><label class="form-label" for="knowledgeTags">Tags (comma separated)</label><input type="text" class="form-input" id="knowledgeTags" aria-label="Tags" placeholder="risk, evm, pmp"></div>
                </div>
                <div class="form-group"><label class="form-label" for="knowledgeContent">Content *</label><textarea class="form-textarea" id="knowledgeContent" style="min-height:150px" placeholder="Your notes, formulas, key concepts..."></textarea></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('knowledgeModal')">Cancel</button>
                <button class="btn btn-danger" id="knowledgeDeleteBtn" style="display:none" onclick="deleteKnowledge()">Delete</button>
                <button class="btn btn-primary" onclick="saveKnowledge()">Save</button>
            </div>
        </div>
    </div>`;
