window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.timeModal = String.raw`<div class="modal" id="timeModal" onclick="if(event.target===this)closeModal('timeModal')">
        <div class="modal-content">
            <div class="modal-header"><h3>Log Time</h3><button class="modal-close" onclick="closeModal('timeModal')">×</button></div>
            <div class="modal-body">
                <div class="form-group"><label class="form-label" for="timeTitle">What? *</label><input type="text" class="form-input" id="timeTitle"></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="timeDuration">Hours *</label><input type="number" class="form-input" id="timeDuration" step="0.25" min="0.25"></div>
                    <div class="form-group"><label class="form-label" for="timeDate">Date</label><input type="date" class="form-input" id="timeDate"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="timeCategory">Category</label><select class="form-select" id="timeCategory"><option value="study">Study</option><option value="work">Work</option><option value="exercise">Exercise</option><option value="other">Other</option></select></div>
                    <div class="form-group"><label class="form-label" for="timeDomain">Subject / pathway</label><select class="form-select" id="timeDomain"><option value="">--</option><option value="construction">Construction</option><option value="math">Math</option><option value="structures">Structures</option><option value="management">Management</option><option value="pmp">PMP</option><option value="smr">SMR</option></select></div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="timeLearningDomain">Learning axis <span style="color:var(--text-muted);font-weight:400;">(used by Insights)</span></label>
                    <select class="form-select" id="timeLearningDomain"><option value="">Auto-detect</option><option value="technical">Technical</option><option value="strategic">Strategic</option><option value="leadership">Leadership</option></select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('timeModal')">Cancel</button>
                <button class="btn btn-primary" onclick="saveTimeEntry()">Log</button>
            </div>
        </div>
    </div>`;
