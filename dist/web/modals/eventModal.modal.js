window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.eventModal = String.raw`<div class="modal" id="eventModal" onclick="if(event.target===this)closeModal('eventModal')">
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3 style="display:flex;align-items:center;gap:8px;"><span>🧱</span> Schedule Block</h3>
                <button class="modal-close" onclick="closeModal('eventModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label" for="eventTitle">Title *</label>
                    <input type="text" class="form-input" id="eventTitle" placeholder="Meeting, deadline, etc." oninput="refreshEventConflictPreview()">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="eventDate">Date *</label>
                        <input type="date" class="form-input" id="eventDate" onchange="refreshEventConflictPreview()">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="eventTime">Time</label>
                        <input type="time" class="form-input" id="eventTime" onchange="refreshEventConflictPreview()">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="eventType">Type</label>
                        <select class="form-select" id="eventType" onchange="refreshEventConflictPreview()">
                            <option value="event">📅 Event</option>
                            <option value="task">✅ Task</option>
                            <option value="deadline">🔴 Deadline</option>
                            <option value="study">📚 Study Session</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="eventDuration">Duration</label>
                        <select class="form-select" id="eventDuration" onchange="refreshEventConflictPreview()">
                            <option value="">No duration</option>
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                            <option value="180">3 hours</option>
                            <option value="240">4 hours</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="eventNotes">Notes</label>
                    <textarea class="form-textarea" id="eventNotes" placeholder="Additional details..." style="min-height:80px;"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="eventRepeat">Repeat</label>
                    <select class="form-select" id="eventRepeat" onchange="refreshEventConflictPreview()">
                        <option value="">No repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div id="eventConflictPreview" class="commitment-inline is-neutral" aria-live="polite"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('eventModal')">Cancel</button>
                <button class="btn btn-danger" id="eventDeleteBtn" style="display:none" onclick="deleteEvent()">🗑️ Delete</button>
                <button class="btn btn-primary" onclick="saveEvent()">💾 Save Block</button>
            </div>
        </div>
    </div>`;
