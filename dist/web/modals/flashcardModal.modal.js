window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.flashcardModal = String.raw`<div class="modal" id="flashcardModal" onclick="if(event.target===this)closeModal('flashcardModal')">
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3 style="display:flex;align-items:center;gap:8px;"><span>🃏</span> <span id="flashcardModalTitle">New Flashcard</span></h3>
                <button class="modal-close" onclick="closeModal('flashcardModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label" for="cardQuestionInput">Question / Front *</label>
                    <textarea class="form-textarea" id="cardQuestionInput" placeholder="What do you want to remember?" style="min-height:80px;"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cardAnswerInput">Answer / Back *</label>
                    <textarea class="form-textarea" id="cardAnswerInput" placeholder="The answer or explanation" style="min-height:100px;"></textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label class="form-label" for="cardCategory">Category</label>
                        <select class="form-select" id="cardCategory">
                            <option value="pmp">PMP</option>
                            <option value="mcmaster">McMaster Prep</option>
                            <option value="construction">Construction</option>
                            <option value="smr">SMR/Nuclear</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="cardTags">Tags</label>
                        <input type="text" class="form-input" id="cardTags" placeholder="e.g. scope, wbs">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('flashcardModal')">Cancel</button>
                <button class="btn btn-danger" onclick="deleteFlashcard()" id="deleteCardBtn" style="display:none;">Delete</button>
                <button class="btn btn-primary" onclick="saveFlashcard()">Save Card</button>
            </div>
        </div>
    </div>`;
