// ==================== V31 ADAPTIVE PROFILE & EXECUTION ====================
// Personality assessments are treated as revisable prompts, never as
// neurological measurements, diagnoses, or fixed limits. Profile feedback and
// observed StudyOS behavior decide which prompts remain useful.

const PROFILE_ASSESSMENTS = [
  {
    id: 'clifton-2026',
    name: 'CliftonStrengths 34',
    date: '2026-02-01',
    scale: 'Rank order inside one person\'s 34 themes',
    summary: 'Top themes: Deliberative, Analytical, Restorative, Context, Command, Significance, Learner, Futuristic, Competition, and Intellection.',
    limit: 'A lower-ranked theme is not automatically a weakness or a competency score.'
  },
  {
    id: 'caliper-2026',
    name: 'Talogy Caliper Profile · Processing Specialist model',
    date: '2026-06-16',
    scale: 'Percentile scores plus job-model interpretations',
    summary: 'High urgency, risk-taking, skepticism, self-structure, sociability, and empathy; job-model strengths in time management, compliance investigation, and expert outreach.',
    limit: 'The two supplied reports interpret one assessment. Their job-model mapping is Processing Specialist, so it is not independent proof of construction-leadership performance.'
  }
];

const PROFILE_HYPOTHESES = [
  {
    id: 'decision_dual_mode',
    title: 'Decision pace may switch by context',
    category: 'Judgment',
    signal: 'Deliberative #1 and Analytical #2 coexist with Caliper Risk-Taking 97 and Urgency 95.',
    hypothesis: 'You may over-deliberate on reversible choices but move too quickly when pressure, opportunity, or control is salient.',
    test: 'Compare decision state, impact, reversibility, evidence depth, and later process quality.',
    design: 'Two-sided Decision Guardrail: decide when a reversible choice is sufficiently informed; slow down when consequence is high and evidence is weak.'
  },
  {
    id: 'evidence_depth',
    title: 'Analytical preference may need a depth check',
    category: 'Evidence',
    signal: 'Analytical #2 and Skepticism 88 coexist with Caliper Thoroughness 25 and a job-model warning about cursory information seeking.',
    hypothesis: 'Searching for reasons may not always produce sufficient, independent, or governing evidence.',
    test: 'Track source count, applicable standards, disconfirming evidence, expert checks, and reviewed process quality.',
    design: 'Evidence Depth Gate inside important decisions.'
  },
  {
    id: 'repair_prevent',
    title: 'Repair may be stronger than recurrence prevention',
    category: 'Quality',
    signal: 'Restorative #3 supports troubleshooting; Caliper flags mistake review and long-term process integrity.',
    hypothesis: 'The immediate fix may feel complete before a preventive control is owned and verified.',
    test: 'Track repeated issues, open verification dates, and whether preventive controls proved effective.',
    design: 'Fix → root cause → prevention → verification Quality Loop.'
  },
  {
    id: 'direct_listening',
    title: 'Direct communication may need receiver checks',
    category: 'Communication',
    signal: 'Command #5 and a direct Caliper style coexist with Active Listening marked as requiring focus.',
    hypothesis: 'Clarity and decisiveness may sometimes become forceful, solution-first, or insufficiently adapted to the receiver.',
    test: 'Track invited input, uninterrupted listening, paraphrasing, written follow-up, and communication outcome.',
    design: 'Communication Quality Loop instead of a volume-only streak.'
  },
  {
    id: 'self_directed_structure',
    title: 'Self-directed structure is likely an asset',
    category: 'Execution',
    signal: 'Caliper Self-Structure 76 and natural Time Management; External Structure 28.',
    hypothesis: 'You may work best with clear outcomes and personal control over the operating method.',
    test: 'Compare completion, re-planning, and quality under user-chosen versus externally imposed routines.',
    design: 'Keep guidance optional, concise, and easy to override.'
  },
  {
    id: 'applied_learning',
    title: 'Learning should end in applied evidence',
    category: 'Learning',
    signal: 'Learner #7, Context #4, Intellection #10, and Restorative #3.',
    hypothesis: 'Context, mechanisms, and problems are motivating, but knowledge acquisition can displace deliverable output.',
    test: 'Compare study time with retrieval results, transfer notes, calculations, checklists, and work artifacts.',
    design: 'Context → worked example → closed-book retrieval → jobsite transfer.'
  },
  {
    id: 'expert_network',
    title: 'Purpose-led relationships may fit better than broad networking',
    category: 'Relationships',
    signal: 'Woo #33 and Communication #34 coexist with Caliper Sociability 71, Empathy 71, and natural expert outreach.',
    hypothesis: 'Specific, useful one-to-one contact may be more natural than generic networking or public expression.',
    test: 'Track expert questions, follow-through, mutual value, and what changed after consultation.',
    design: 'Use Network as an expert-feedback system, not a popularity counter.'
  },
  {
    id: 'start_friction',
    title: 'Start friction is unresolved—not established',
    category: 'Execution',
    signal: 'Activator #24 and an earlier persistence score conflict with Caliper Urgency 95 and natural Time Management.',
    hypothesis: 'Starting difficulty may be task-specific rather than a stable personal bottleneck.',
    test: 'Use actual untouched-task age and start delay before offering a two-minute start.',
    design: 'Only show start prompts when task evidence indicates delay.'
  },
  {
    id: 'change_flexibility',
    title: 'Change response should be measured',
    category: 'Execution',
    signal: 'Adaptability #31 and Caliper Flexibility 37 suggest a preference question, not a fixed limitation.',
    hypothesis: 'Some plan changes may create re-planning friction, especially when control or clarity is lost.',
    test: 'Measure recovery time, alternative generation, priority churn, and stakeholder feedback after real changes.',
    design: 'Offer a recovery micro-plan after observed disruption, not a permanent warning.'
  }
];

function profileDefaultState() {
  return { version:1, enabled:true, guidanceDensity:'balanced', hypotheses:{}, updatedAt:new Date().toISOString() };
}

function getAdaptiveProfile() {
  const raw = get(K.adaptiveProfile);
  const base = profileDefaultState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  return {
    version:1,
    enabled:raw.enabled !== false,
    guidanceDensity:['compact','balanced','coaching'].includes(raw.guidanceDensity) ? raw.guidanceDensity : 'balanced',
    hypotheses:raw.hypotheses && typeof raw.hypotheses === 'object' && !Array.isArray(raw.hypotheses) ? raw.hypotheses : {},
    updatedAt:raw.updatedAt || base.updatedAt
  };
}

function saveAdaptiveProfile(profile) {
  const next = Object.assign({}, getAdaptiveProfile(), profile || {}, { version:1, updatedAt:new Date().toISOString() });
  set(K.adaptiveProfile, next);
  return next;
}

function profileHypothesisState(id) {
  const profile = getAdaptiveProfile();
  const raw = profile.hypotheses[id] || {};
  const snoozedUntil = String(raw.snoozedUntil || '');
  let status = ['testing','useful','not-me','snoozed'].includes(raw.status) ? raw.status : 'testing';
  if (status === 'snoozed' && snoozedUntil && snoozedUntil < today()) status = 'testing';
  return {
    status,
    helpfulCount:Math.max(0, parseInt(raw.helpfulCount,10) || 0),
    notMeCount:Math.max(0, parseInt(raw.notMeCount,10) || 0),
    snoozedUntil,
    lastResponseAt:raw.lastResponseAt || ''
  };
}

function profileIsHypothesisEnabled(id) {
  const profile = getAdaptiveProfile();
  if (!profile.enabled) return false;
  const state = profileHypothesisState(id);
  return state.status !== 'not-me' && state.status !== 'snoozed';
}

function profileRecordFeedback(id, response, source) {
  const hypothesis = PROFILE_HYPOTHESES.find(item => item.id === id);
  if (!hypothesis) return;
  const profile = getAdaptiveProfile();
  const state = profileHypothesisState(id);
  if (response === 'helpful') {
    state.status = 'useful';
    state.helpfulCount += 1;
    state.snoozedUntil = '';
  } else if (response === 'not-me') {
    state.status = 'not-me';
    state.notMeCount += 1;
    state.snoozedUntil = '';
  } else if (response === 'testing') {
    state.status = 'testing';
    state.snoozedUntil = '';
  }
  state.lastResponseAt = new Date().toISOString();
  profile.hypotheses[id] = state;
  saveAdaptiveProfile(profile);
  const feedback = arr(K.profileFeedback);
  feedback.push({ id:uid(), hypothesisId:id, response, source:source || 'profile-lab', at:state.lastResponseAt });
  set(K.profileFeedback, feedback);
  if (typeof renderProfileLab === 'function') renderProfileLab();
  if (typeof refreshDashboard === 'function') refreshDashboard();
  if (typeof toast === 'function') toast(response === 'helpful' ? 'Prompt marked useful.' : response === 'not-me' ? 'Hypothesis disabled. You can restore it in Profile Lab.' : 'Hypothesis returned to testing.');
}

function profileSnoozeHypothesis(id, days) {
  const profile = getAdaptiveProfile();
  const state = profileHypothesisState(id);
  const until = new Date();
  until.setDate(until.getDate() + Math.max(1, parseInt(days,10) || 30));
  state.status = 'snoozed';
  state.snoozedUntil = fmtDate(until);
  state.lastResponseAt = new Date().toISOString();
  profile.hypotheses[id] = state;
  saveAdaptiveProfile(profile);
  if (typeof renderProfileLab === 'function') renderProfileLab();
  if (typeof refreshDashboard === 'function') refreshDashboard();
  if (typeof toast === 'function') toast('Prompt snoozed until ' + state.snoozedUntil + '.');
}

function profileToggleEnabled(enabled) {
  saveAdaptiveProfile({ enabled:!!enabled });
  renderProfileLab();
  if (typeof refreshDashboard === 'function') refreshDashboard();
}

function profileGuidanceDensity() {
  return getAdaptiveProfile().guidanceDensity;
}

function profileSetGuidanceDensity(value) {
  const density = ['compact','balanced','coaching'].includes(value) ? value : 'balanced';
  saveAdaptiveProfile({ guidanceDensity:density });
  renderProfileLab();
  if (typeof refreshDashboard === 'function') refreshDashboard();
  if (document.getElementById('decisionGuardrailPanel') && typeof renderDecisionGuardrail === 'function') renderDecisionGuardrail();
}

function profileExecutionSummary(days) {
  const horizon = new Date();
  horizon.setDate(horizon.getDate() - Math.max(1, parseInt(days,10) || 90));
  const since = fmtDate(horizon);
  const decisions = arr(K.decisions).filter(row => (row.date || '') >= since);
  const guardrails = decisions.map(row => row.guardrail).filter(Boolean);
  const slow = guardrails.filter(row => row.mode === 'slow-down').length;
  const decide = guardrails.filter(row => row.mode === 'decide').length;
  const balanced = guardrails.filter(row => row.mode === 'balanced').length;
  const quality = arr(K.qualityReviews).filter(row => (row.date || '') >= since);
  const verified = quality.filter(row => row.verificationStatus === 'effective').length;
  const repeats = quality.filter(row => row.recurrence === 'repeat').length;
  const communication = get(K.commTracker) || {};
  const commDays = Object.keys(communication).filter(date => {
    const row = communication[date];
    return date >= since && row && (((row.activities || []).length > 0) || ((row.qualityBehaviors || []).length > 0) || (Number(row.outcome) >= 1 && Number(row.outcome) <= 5));
  }).length;
  const qualityCommDays = Object.keys(communication).filter(date => date >= since && communication[date] && (communication[date].qualityBehaviors || []).length).length;
  const feedback = arr(K.profileFeedback).filter(row => String(row.at || '').slice(0,10) >= since);
  return { days:Math.max(1, parseInt(days,10) || 90), decisions:decisions.length, guardrails:guardrails.length, slow, decide, balanced, quality:quality.length, verified, repeats, commDays, qualityCommDays, feedback:feedback.length };
}

function profileObservedEvidence(id) {
  const summary = profileExecutionSummary(90);
  if (id === 'decision_dual_mode') return summary.guardrails ? `${summary.slow} slow-down · ${summary.decide} decide-now · ${summary.balanced} balanced guardrail results in 90 days` : 'No guardrail-rated decisions yet';
  if (id === 'evidence_depth') return summary.decisions ? `${summary.decisions} decisions logged; inspect source and process-quality fields as reviews mature` : 'No decision evidence yet';
  if (id === 'repair_prevent') return summary.quality ? `${summary.quality} quality reviews · ${summary.verified} controls verified · ${summary.repeats} repeat issues` : 'No structured quality reviews yet';
  if (id === 'direct_listening') return summary.commDays ? `${summary.qualityCommDays}/${summary.commDays} communication-practice days included receiver-side behaviors` : 'No communication-practice days yet';
  if (id === 'applied_learning') return `${arr(K.learningCycles).length} learning cycles · ${arr(K.doctrineLogs).length} doctrine drills recorded`;
  if (id === 'expert_network') return `${arr(K.contacts).length} contacts · ${summary.commDays} communication-practice days in 90 days`;
  if (id === 'start_friction') {
    const open = arr(K.tasks).filter(task => !taskIsCompleted(task));
    const old = open.filter(task => task.createdAt && String(task.createdAt).slice(0,10) < sinceDaysAgo(14)).length;
    return open.length ? `${old}/${open.length} open tasks are older than 14 days; age alone does not prove start friction` : 'No open tasks to test this hypothesis';
  }
  if (id === 'change_flexibility') return 'Recovery time is not yet captured consistently; keep this hypothesis tentative.';
  if (id === 'self_directed_structure') return `${arr(K.tasks).filter(taskIsCompleted).length} completed tasks recorded; compare future guidance-density settings with outcomes`;
  return 'Collect behavior before drawing a conclusion.';
}

function sinceDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return fmtDate(date);
}

function evaluateDecisionGuardrail(candidate) {
  candidate = candidate || {};
  const impact = String(candidate.impact || 'medium');
  const reversibility = String(candidate.reversibility || 'two-way');
  const state = String(candidate.decisionState || 'balanced');
  const pressure = String(candidate.timePressure || 'normal');
  const evidenceQuality = Math.max(1, Math.min(5, parseInt(candidate.evidenceQuality,10) || 3));
  const sourceCount = Math.max(0, parseInt(candidate.sourceCount,10) || 0);
  const highConsequence = impact === 'high' || impact === 'regulated' || reversibility === 'one-way';
  const costly = reversibility === 'costly';
  const weakEvidence = evidenceQuality <= 2 || sourceCount < (highConsequence ? 2 : 1);
  const missingCounter = !String(candidate.disconfirming || '').trim();
  const missingStakeholders = !String(candidate.stakeholders || '').trim();
  const missingGovernance = impact === 'regulated' && !String(candidate.governance || '').trim();
  const rushed = state === 'rushing' || pressure === 'urgent';
  const stuck = state === 'stuck';
  const reasons = [];
  const actions = [];
  let mode = 'balanced';

  if ((highConsequence || costly) && (weakEvidence || rushed || missingCounter || missingStakeholders || missingGovernance)) {
    mode = 'slow-down';
    if (highConsequence) reasons.push('The choice is high-impact or difficult to reverse.');
    if (costly) reasons.push('Reversal would be costly.');
    if (weakEvidence) reasons.push('Evidence quality or independent-source depth is low for the consequence.');
    if (rushed) reasons.push('Urgency or a self-reported rushing state can narrow the search.');
    if (missingCounter) reasons.push('No disconfirming evidence is recorded.');
    if (missingStakeholders) reasons.push('No stakeholder view is recorded.');
    if (missingGovernance) reasons.push('A governing standard, policy, or approval is missing.');
    actions.push('Verify the governing requirement and at least one independent source.');
    actions.push('Ask what evidence would change the preferred choice.');
    if (!candidate.expertConsulted) actions.push('Use a qualified sounding board before commitment.');
  } else if (stuck && reversibility === 'two-way' && impact !== 'high' && impact !== 'regulated' && evidenceQuality >= 3 && sourceCount >= 1) {
    mode = 'decide';
    reasons.push('The choice is reversible and has at least adequate evidence.');
    reasons.push('You identified the current state as stuck or over-deliberating.');
    actions.push('Choose the smallest reversible step and set its review point.');
    actions.push('Record the remaining uncertainty instead of trying to eliminate it.');
  } else {
    reasons.push('The current consequence, evidence, and pace do not trigger a directional warning.');
    actions.push('Proceed deliberately and schedule an outcome review if the result can teach you something.');
  }

  const title = mode === 'slow-down' ? 'Slow down: consequence exceeds evidence' : mode === 'decide' ? 'Decide: reversible and sufficiently informed' : 'Balanced: keep the process proportional';
  return { mode, title, reasons, actions, highConsequence, weakEvidence, evaluatedAt:new Date().toISOString() };
}

function profileStatusBadge(state) {
  if (state.status === 'useful') return '<span class="badge badge-good">Useful</span>';
  if (state.status === 'not-me') return '<span class="badge">Disabled</span>';
  if (state.status === 'snoozed') return '<span class="badge badge-warn">Snoozed to ' + esc(state.snoozedUntil) + '</span>';
  return '<span class="badge">Testing</span>';
}

function profilePromptControls(id, source) {
  const state = profileHypothesisState(id);
  return `<div class="profile-feedback-actions">
    <button class="btn btn-secondary btn-sm" onclick="profileRecordFeedback('${esc(id)}','helpful','${esc(source || 'profile-lab')}')">Useful</button>
    <button class="btn btn-secondary btn-sm" onclick="profileRecordFeedback('${esc(id)}','not-me','${esc(source || 'profile-lab')}')">Not me</button>
    <button class="btn btn-secondary btn-sm" onclick="profileSnoozeHypothesis('${esc(id)}',30)">Snooze 30d</button>
    ${state.status !== 'testing' ? `<button class="btn btn-ghost btn-sm" onclick="profileRecordFeedback('${esc(id)}','testing','${esc(source || 'profile-lab')}')">Reset</button>` : ''}
  </div>`;
}

function renderProfileLab() {
  const root = document.getElementById('profileLabRoot');
  if (!root) return;
  const profile = getAdaptiveProfile();
  const summary = profileExecutionSummary(90);
  root.innerHTML = `
    <section class="card profile-lab-hero">
      <div>
        <div class="kicker">V31 · Adaptive Profile & Execution</div>
        <h3>Use assessments as hypotheses. Let behavior decide.</h3>
        <p>Clifton rankings, Caliper percentiles, and job-model interpretations measure different constructs. StudyOS will not convert any of them into a fixed capacity, neurological claim, or automatic limitation.</p>
      </div>
      <label class="profile-master-toggle"><input type="checkbox" ${profile.enabled ? 'checked' : ''} onchange="profileToggleEnabled(this.checked)"><span><strong>Adaptive prompts</strong><small>${profile.enabled ? 'On — active hypotheses may surface in context' : 'Off — tools still work without personality prompts'}</small></span></label>
    </section>

    <div class="profile-scale-grid">
      ${PROFILE_ASSESSMENTS.map(item => `<article class="card"><div class="profile-card-head"><div><span class="kicker">${esc(item.date)}</span><h4>${esc(item.name)}</h4></div></div><p>${esc(item.summary)}</p><div class="profile-scale-note"><strong>Scale:</strong> ${esc(item.scale)}</div><div class="profile-limit-note"><strong>Limit:</strong> ${esc(item.limit)}</div></article>`).join('')}
    </div>

    <section class="card profile-controls-card">
      <div><div class="kicker">Prompt density</div><h4>How much explanation should StudyOS show?</h4></div>
      <div class="profile-density-wrap">
        <div class="profile-density-control">
          ${['compact','balanced','coaching'].map(value => `<button class="filter-btn ${profile.guidanceDensity === value ? 'active' : ''}" onclick="profileSetGuidanceDensity('${value}')">${value.charAt(0).toUpperCase() + value.slice(1)}</button>`).join('')}
        </div>
        <small>${profile.guidanceDensity === 'compact' ? 'Action and the shortest useful warning.' : profile.guidanceDensity === 'coaching' ? 'Reasons, actions, the hypothesis under test, and observed evidence.' : 'Reasons and actions without the extended coaching layer.'}</small>
      </div>
    </section>

    <div class="profile-observation-grid">
      <div class="stat"><div class="stat-value">${summary.guardrails}</div><div class="stat-label">Guardrail-rated decisions</div></div>
      <div class="stat"><div class="stat-value">${summary.quality}</div><div class="stat-label">Quality reviews</div></div>
      <div class="stat"><div class="stat-value">${summary.qualityCommDays}/${summary.commDays}</div><div class="stat-label">Communication days with quality behaviors</div></div>
      <div class="stat"><div class="stat-value">${summary.feedback}</div><div class="stat-label">Profile responses</div></div>
    </div>

    <div class="profile-hypothesis-list">
      ${PROFILE_HYPOTHESES.map(item => {
        const state = profileHypothesisState(item.id);
        return `<article class="card profile-hypothesis ${state.status === 'not-me' ? 'is-disabled' : ''}">
          <div class="profile-card-head"><div><span class="kicker">${esc(item.category)}</span><h4>${esc(item.title)}</h4></div>${profileStatusBadge(state)}</div>
          <div class="profile-hypothesis-grid"><div><strong>Assessment signal</strong><p>${esc(item.signal)}</p></div><div><strong>Hypothesis to test</strong><p>${esc(item.hypothesis)}</p></div><div><strong>Behavioral test</strong><p>${esc(item.test)}</p></div><div><strong>StudyOS response</strong><p>${esc(item.design)}</p></div></div>
          <div class="profile-observed"><strong>Observed so far:</strong> ${esc(profileObservedEvidence(item.id))}</div>
          ${profilePromptControls(item.id, 'profile-lab')}
        </article>`;
      }).join('')}
    </div>`;
}

window.PROFILE = {
  version:1,
  assessments:PROFILE_ASSESSMENTS,
  hypotheses:PROFILE_HYPOTHESES,
  get:getAdaptiveProfile,
  enabled:profileIsHypothesisEnabled,
  density:profileGuidanceDensity,
  evaluateDecision:evaluateDecisionGuardrail,
  summary:profileExecutionSummary,
  feedback:profileRecordFeedback
};
