window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.taskModal = String.raw`<div class="modal" id="taskModal" onclick="if(event.target===this)closeModal('taskModal')">
        <div class="modal-content">
            <div class="modal-header"><h3>Task</h3><button class="modal-close" onclick="closeModal('taskModal')">×</button></div>
            <div class="modal-body">
                <div class="form-group"><label class="form-label" for="taskTitle">Task *</label><input type="text" class="form-input" id="taskTitle" aria-label="Task title" oninput="refreshTaskConflictPreview()"></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="taskDue">Due / planned date</label><input type="date" class="form-input" id="taskDue" aria-label="Task due date" onchange="refreshTaskConflictPreview()"></div>
                    <div class="form-group"><label class="form-label" for="taskPriority">Priority</label><select class="form-select" id="taskPriority"><option value="low">Low</option><option value="med">Medium</option><option value="high">High</option></select></div>
                </div>
                <div class="commitment-form-grid">
                    <div class="form-group"><label class="form-label" for="taskTime">Start time <span class="muted">(optional)</span></label><input type="time" class="form-input" id="taskTime" onchange="refreshTaskConflictPreview()"></div>
                    <div class="form-group"><label class="form-label" for="taskDuration">Estimate</label><select class="form-select" id="taskDuration" onchange="refreshTaskConflictPreview()"><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="240">4 hours</option></select></div>
                    <div class="form-group"><label class="form-label" for="taskCategory">Category</label><select class="form-select" id="taskCategory" onchange="refreshTaskConflictPreview()"><option value="general">General</option><option value="study">Study</option><option value="work">Work</option><option value="personal">Personal</option></select></div>
                </div>
                <div id="taskConflictPreview" class="commitment-inline is-neutral" aria-live="polite"></div>
                <div class="form-group"><label class="form-label" for="taskDescription">Notes / context</label><textarea class="form-textarea" id="taskDescription" rows="3" placeholder="Definition of done, source observation, or next physical action"></textarea></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('taskModal')">Cancel</button>
                <button class="btn btn-danger" id="taskDeleteBtn" style="display:none" onclick="deleteTask()">Delete</button>
                <button class="btn btn-primary" onclick="saveTask()">Save</button>
            </div>
        </div>
    </div>`;
