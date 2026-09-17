window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.goalModal = String.raw`<div class="modal" id="goalModal" onclick="if(event.target===this)closeModal('goalModal')">
        <div class="modal-content">
            <div class="modal-header"><h3>Goal</h3><button class="modal-close" onclick="closeModal('goalModal')">×</button></div>
            <div class="modal-body">
                <div class="form-group"><label class="form-label" for="goalTitle">Title *</label><input type="text" class="form-input" id="goalTitle" aria-label="Goal title"></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="goalArea">Area</label><select class="form-select" id="goalArea"><option value="education">Education</option><option value="career">Career</option><option value="health">Health</option><option value="finance">Finance</option><option value="personal">Personal</option></select></div>
                    <div class="form-group"><label class="form-label" for="goalTarget">Target Date</label><input type="date" class="form-input" id="goalTarget" aria-label="Goal target date"></div>
                </div>
                <div class="form-group"><label class="form-label" for="goalMilestones">Milestones (one per line)</label><textarea class="form-textarea" id="goalMilestones"></textarea></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('goalModal')">Cancel</button>
                <button class="btn btn-danger" id="goalDeleteBtn" style="display:none" onclick="deleteGoal()">Delete</button>
                <button class="btn btn-primary" onclick="saveGoal()">Save</button>
            </div>
        </div>
    </div>`;
