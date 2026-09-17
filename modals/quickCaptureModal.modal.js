window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.quickCaptureModal = String.raw`<div class="modal" id="quickCaptureModal" onclick="if(event.target===this)closeModal('quickCaptureModal')">
    <div class="modal-content quick-capture-modal">
        <div class="modal-header">
            <div>
                <div class="kicker">Zero-friction inbox</div>
                <h3 id="quickCaptureModalTitle">Quick capture</h3>
            </div>
            <button class="modal-close" onclick="closeModal('quickCaptureModal')" aria-label="Close capture">×</button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="captureEditId">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="captureType">Capture type</label>
                    <select class="form-select" id="captureType">
                        <option value="thought">Thought</option>
                        <option value="question">Question</option>
                        <option value="source">Source note</option>
                        <option value="field">Field / site note</option>
                        <option value="meeting">Meeting note</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="capturePathway">Pathway</label>
                    <select class="form-select" id="capturePathway">
                        <option value="">General</option>
                        <option value="foundations">Foundations</option>
                        <option value="pmp">PMP</option>
                        <option value="mcmaster">McMaster</option>
                        <option value="smr">SMR</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="captureTitle">Title <span class="muted">(optional)</span></label>
                <input class="form-input" id="captureTitle" maxlength="160" placeholder="Name it now—or let StudyOS use the first line">
            </div>
            <div class="form-group">
                <label class="form-label" for="captureContent">What do you want to remember? *</label>
                <textarea class="form-textarea" id="captureContent" rows="7" placeholder="A thought, question, observation, quote, or next action…"></textarea>
                <div class="form-hint">Capture first. Organize when you process the inbox.</div>
            </div>
            <div class="form-group">
                <label class="form-label" for="captureUrl">Source URL <span class="muted">(optional)</span></label>
                <input class="form-input" id="captureUrl" type="url" placeholder="https://…">
            </div>
            <div class="form-group">
                <label class="form-label" for="captureTags">Tags</label>
                <input class="form-input" id="captureTags" placeholder="estimating, concrete, follow-up">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal('quickCaptureModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveQuickCapture()">Save to inbox</button>
        </div>
    </div>
</div>`;
