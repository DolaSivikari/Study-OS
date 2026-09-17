window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.qualityReviewModal = String.raw`<div class="modal" id="qualityReviewModal" onclick="if(event.target===this)closeModal('qualityReviewModal')">
  <div class="modal-content" style="max-width:760px;max-height:88vh;overflow-y:auto;">
    <div class="modal-header"><h3>Fix → Learn → Prevent</h3><button class="modal-close" onclick="closeModal('qualityReviewModal')">×</button></div>
    <div class="modal-body">
      <input type="hidden" id="qualityReviewId">
      <div class="quality-loop-note"><strong>This is not a blame log.</strong><span>Capture the correction, build a recurrence control, and verify whether it worked.</span></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="qualityTitle">Issue / learning event *</label><input class="form-input" id="qualityTitle" placeholder="e.g., Formwork dimension discrepancy"></div>
        <div class="form-group"><label class="form-label" for="qualityDate">Date</label><input type="date" class="form-input" id="qualityDate"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="qualityArea">Area</label><select class="form-select" id="qualityArea"><option value="quality">Quality</option><option value="safety">Safety</option><option value="compliance">Compliance</option><option value="schedule">Schedule</option><option value="cost">Cost</option><option value="communication">Communication</option><option value="learning">Learning</option><option value="system">StudyOS / Process</option></select></div>
        <div class="form-group"><label class="form-label" for="qualityImpact">Impact</label><select class="form-select" id="qualityImpact"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="regulated">Regulated / safety-critical</option></select></div>
        <div class="form-group"><label class="form-label" for="qualityRecurrence">Occurrence</label><select class="form-select" id="qualityRecurrence"><option value="first">First observed</option><option value="repeat">Repeat / similar issue</option></select></div>
      </div>
      <div class="form-group"><label class="form-label" for="qualityWhat">What happened? *</label><textarea class="form-textarea" id="qualityWhat" rows="3" placeholder="Observable facts, sequence, and effect—separate from interpretation."></textarea></div>
      <div class="form-group"><label class="form-label" for="qualityFix">Immediate correction</label><textarea class="form-textarea" id="qualityFix" rows="2" placeholder="What restored the situation now?"></textarea></div>
      <div class="form-group"><label class="form-label" for="qualityCause">Root cause / contributing conditions *</label><textarea class="form-textarea" id="qualityCause" rows="3" placeholder="What in the system, handoff, method, assumption, or environment allowed this?"></textarea></div>
      <div class="form-group"><label class="form-label" for="qualityPrevention">Preventive control *</label><textarea class="form-textarea" id="qualityPrevention" rows="3" placeholder="What will make recurrence less likely or quickly detectable?"></textarea></div>
      <div class="form-group"><label class="form-label" for="qualityStandard">Governing source / requirement</label><input class="form-input" id="qualityStandard" placeholder="Specification, drawing, policy, code, checklist, or evidence source"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="qualityOwner">Owner</label><input class="form-input" id="qualityOwner" placeholder="Who owns the control?"></div>
        <div class="form-group"><label class="form-label" for="qualityVerifyDate">Verification date</label><input type="date" class="form-input" id="qualityVerifyDate"></div>
        <div class="form-group"><label class="form-label" for="qualityVerificationStatus">Control status</label><select class="form-select" id="qualityVerificationStatus"><option value="open">Open — not yet verified</option><option value="effective">Verified effective</option><option value="needs-work">Verified — needs improvement</option></select></div>
      </div>
      <div class="form-group"><label class="form-label" for="qualityVerificationNote">Verification evidence</label><textarea class="form-textarea" id="qualityVerificationNote" rows="2" placeholder="What evidence shows whether the control worked?"></textarea></div>
      <div class="form-group"><label class="form-label" for="qualityDecisionId">Related decision</label><select class="form-select" id="qualityDecisionId"><option value="">None</option></select></div>
      <label class="quality-task-toggle"><input type="checkbox" id="qualityCreateTask" checked><span><strong>Create or update a verification task</strong><small>Uses the canonical Tasks schema and appears on Calendar when a verification date is set.</small></span></label>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('qualityReviewModal')">Cancel</button>
      <button class="btn btn-danger" id="qualityDeleteBtn" style="display:none" onclick="deleteQualityReview()">Delete review</button>
      <button class="btn btn-primary" onclick="saveQualityReview()">Save quality loop</button>
    </div>
  </div>
</div>`;
