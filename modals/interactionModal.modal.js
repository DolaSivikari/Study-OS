window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.interactionModal = String.raw`<div class="modal" id="interactionModal" onclick="if(event.target===this)closeModal('interactionModal')">
        <div class="modal-content" style="max-width:450px;">
            <div class="modal-header">
                <h3 style="display:flex;align-items:center;gap:8px;"><span>📝</span> Log Interaction</h3>
                <button class="modal-close" onclick="closeModal('interactionModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label" for="interactionType">Type</label>
                    <select class="form-select" id="interactionType">
                        <option value="email">📧 Email</option>
                        <option value="call">📞 Call</option>
                        <option value="meeting">🤝 Meeting</option>
                        <option value="linkedin">💼 LinkedIn</option>
                        <option value="coffee">☕ Coffee Chat</option>
                        <option value="event">🎫 Event</option>
                        <option value="other">📝 Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="interactionNotes">Notes</label>
                    <textarea class="form-textarea" id="interactionNotes" placeholder="What did you discuss?" style="min-height:80px;"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="interactionFollowup">Next Follow-up</label>
                    <input type="date" class="form-input" id="interactionFollowup">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('interactionModal')">Cancel</button>
                <button class="btn btn-primary" onclick="saveInteraction()">Log Interaction</button>
            </div>
        </div>
    </div>`;
