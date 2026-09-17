window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.habitModal = String.raw`<div class="modal" id="habitModal" onclick="if(event.target===this)closeModal('habitModal')">
        <div class="modal-content">
            <div class="modal-header"><h3>Habit</h3><button class="modal-close" onclick="closeModal('habitModal')">×</button></div>
            <div class="modal-body">
                <div class="form-group"><label class="form-label" for="habitName">Habit Name *</label><input type="text" class="form-input" id="habitName" placeholder="e.g., Review 5 flashcards" oninput="refreshHabitConflictPreview()"></div>
                <div class="form-group"><label class="form-label" for="habitAnchor">🔗 After I... (Anchor/Cue)</label><input type="text" class="form-input" id="habitAnchor" placeholder="e.g., pour my morning coffee"></div>
                <div class="form-group"><label class="form-label" for="habitTiny">⏱️ Two-Minute Version</label><input type="text" class="form-input" id="habitTiny" placeholder="e.g., Open flashcard app and read 1 card"></div>
                <div class="form-group"><label class="form-label" for="habitLocation">📍 Location</label><input type="text" class="form-input" id="habitLocation" placeholder="e.g., Kitchen table, desk"></div>
                <div class="commitment-form-grid">
                    <div class="form-group"><label class="form-label" for="habitTime">Preferred time <span class="muted">(optional)</span></label><input type="time" class="form-input" id="habitTime" onchange="refreshHabitConflictPreview()"></div>
                    <div class="form-group"><label class="form-label" for="habitDuration">Time budget</label><select class="form-select" id="habitDuration" onchange="refreshHabitConflictPreview()"><option value="2">2 min</option><option value="5">5 min</option><option value="10">10 min</option><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">1 hour</option></select></div>
                    <div class="form-group"><label class="form-label" for="habitCategory">Category</label><select class="form-select" id="habitCategory" onchange="refreshHabitConflictPreview()"><option value="routine">Routine</option><option value="study">Study</option><option value="work">Work</option><option value="wellbeing">Wellbeing</option><option value="personal">Personal</option></select></div>
                </div>
                <div id="habitConflictPreview" class="commitment-inline is-neutral" aria-live="polite"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('habitModal')">Cancel</button>
                <button class="btn btn-danger" id="habitDeleteBtn" style="display:none" onclick="deleteHabit()">Delete</button>
                <button class="btn btn-primary" onclick="saveHabit()">Save</button>
            </div>
        </div>
    </div>`;
