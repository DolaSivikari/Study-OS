window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.contactModal = String.raw`<!-- Backdrop click-to-close stays onclick on purpose: it needs the real
     event object to check event.target===this, which js/action-registry.js's
     data-action delegation doesn't support (only plain fn()/fn(arg) calls). -->
<div class="modal" id="contactModal" onclick="if(event.target===this)closeModal('contactModal')">
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3 style="display:flex;align-items:center;gap:8px;"><span>🤝</span> <span id="contactModalTitle">Add Contact</span></h3>
                <button class="modal-close" data-action="closeModal" data-action-arg="contactModal">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label" for="contactName">Name *</label>
                    <input type="text" class="form-input" id="contactName" placeholder="Full name">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label class="form-label" for="contactCompany">Company</label>
                        <input type="text" class="form-input" id="contactCompany" placeholder="Company/Organization">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="contactRole">Role</label>
                        <input type="text" class="form-input" id="contactRole" placeholder="Job title">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label class="form-label" for="contactEmail">Email</label>
                        <input type="email" class="form-input" id="contactEmail" placeholder="email@example.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="contactPhone">Phone</label>
                        <input type="tel" class="form-input" id="contactPhone" placeholder="Phone number">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="contactLinkedIn">LinkedIn</label>
                    <input type="url" class="form-input" id="contactLinkedIn" placeholder="LinkedIn URL">
                </div>
                <div class="form-group">
                    <label class="form-label" for="contactCategory">Category</label>
                    <select class="form-select" id="contactCategory">
                        <option value="industry">Industry Contact</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="mentor">Mentor</option>
                        <option value="colleague">Former Colleague</option>
                        <option value="academic">Academic</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="contactMet">How did you meet?</label>
                    <input type="text" class="form-input" id="contactMet" placeholder="e.g. LinkedIn, TCA event, Madison Group">
                </div>
                <div class="form-group">
                    <label class="form-label" for="contactNotes">Notes</label>
                    <textarea class="form-textarea" id="contactNotes" placeholder="Any relevant details about this connection..." style="min-height:60px;"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="contactFollowup">Follow-up Reminder</label>
                    <input type="date" class="form-input" id="contactFollowup">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="closeModal" data-action-arg="contactModal">Cancel</button>
                <button class="btn btn-danger" data-action="deleteContact" id="deleteContactBtn" style="display:none;">Delete</button>
                <button class="btn btn-primary" data-action="saveContact">Save Contact</button>
            </div>
        </div>
    </div>`;
