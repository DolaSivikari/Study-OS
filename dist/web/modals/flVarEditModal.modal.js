window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

// NOTE: doctrineModal is intentionally nested inside this modal's
// markup below (pre-existing structure, not a bug introduced here).
// It still works: .modal is position:fixed and getElementById does
// not care about DOM nesting. Preserved exactly as it was in index.html.
window.STUDYOS_MODALS.flVarEditModal = String.raw`<div class="modal" id="flVarEditModal" onclick="if(event.target===this)closeModal('flVarEditModal')">

    <!-- Doctrine Drill Modal -->
    <div class="modal" id="doctrineModal" onclick="if(event.target===this)closeModal('doctrineModal')">
        <div class="modal-content" style="max-width:560px;">
            <div class="modal-header"><h3 id="doctrineModalTitle">Doctrine Drill</h3><button class="modal-close" onclick="closeModal('doctrineModal')">×</button></div>
            <div class="modal-body" id="doctrineModalBody"></div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="doctrineModalSecondary" onclick="closeModal('doctrineModal')">Close</button>
                <button class="btn btn-primary" id="doctrineModalPrimary">Save</button>
            </div>
        </div>
    </div>
        <div class="modal-content">
            <div class="modal-header"><h3>Edit Variable</h3><button class="modal-close" onclick="closeModal('flVarEditModal')">×</button></div>
            <div class="modal-body">
                <div class="form-group"><label class="form-label" for="flVarEditName">Name *</label><input type="text" class="form-input" id="flVarEditName" aria-label="Variable name"></div>
                <div class="form-group"><label class="form-label" for="flVarEditTags">Tags (comma-separated)</label><input type="text" class="form-input" id="flVarEditTags" aria-label="Variable tags" placeholder="systems, strategy, power"></div>
                <div class="form-group"><label class="form-label" for="flVarEditDef">Definition</label><textarea class="form-textarea" id="flVarEditDef" rows="3"></textarea></div>
                <div class="form-group"><label class="form-label" for="flVarEditIndicators">Observable Indicators (one per line)</label><textarea class="form-textarea" id="flVarEditIndicators" rows="3"></textarea></div>
                <div class="form-group"><label class="form-label" for="flVarEditNotes">Notes</label><textarea class="form-textarea" id="flVarEditNotes" rows="2"></textarea></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('flVarEditModal')">Cancel</button>
                <button class="btn btn-primary" onclick="flSaveVariableEdit()">Save</button>
            </div>
        </div>
    </div>`;
