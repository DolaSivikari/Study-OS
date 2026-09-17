// ==================== SYSTEM HEALTH PAGE (V16) ====================
function renderSystemHealth() {
  const root = document.getElementById('systemHealthRoot');
  if (!root) return;

  const usage = STORAGE.estimateUsage();
  const metrics = METRICS.snapshot();
  const drift = (typeof LEARN !== 'undefined' && LEARN.getDriftStatus) ? LEARN.getDriftStatus() : { isDrifting:false, offenders:[] };
  const quality = (typeof LEARN !== 'undefined' && LEARN.getDrillQualityScore) ? LEARN.getDrillQualityScore(14) : null;
  const decay = (typeof LEARN !== 'undefined' && LEARN.getSkillDecayWarnings) ? LEARN.getSkillDecayWarnings(21) : [];
  const journalEntries = arr(K.journal);
  const last7 = (() => { const d=new Date(); d.setDate(d.getDate()-6); return fmtDate(d); })();
  const journalCaptureRate = journalEntries.filter(e => (e.date || '') >= last7).length;
  const drillLogs = arr(K.doctrineLogs);
  const drillFrequency = drillLogs.filter(l => (l.date || '') >= last7).length;
  const adaptive = typeof profileExecutionSummary === 'function' ? profileExecutionSummary(90) : { guardrails:0, qualityCommDays:0, commDays:0 };
  const qualityLoop = typeof qualityReviewSummary === 'function' ? qualityReviewSummary(90) : { open:0, overdue:0, verified:0 };
  const profile = typeof getAdaptiveProfile === 'function' ? getAdaptiveProfile() : { enabled:false };
  const warnings = [];
  if (drift.isDrifting && drift.offenders?.length) warnings.push(`⚠ ${drift.offenders[0].domain} domain drift detected`);
  if (quality !== null && quality < 55) warnings.push('⚠ Drill depth skew detected (too many shallow drills)');
  if (metrics.operator.composite < 70) warnings.push(`⚠ Operator stability < 70 (${metrics.operator.composite})`);
  if (decay.length) warnings.push(`⚠ ${decay.length} capability domain(s) show skill decay`);
  if (qualityLoop.overdue > 0) warnings.push(`⚠ ${qualityLoop.overdue} quality-control verification(s) overdue`);

  root.innerHTML = `
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
      <div class="card"><div class="card-title">Storage Usage</div><div style="font-size:1.8rem;font-weight:800;">${usage.megabytes} MB</div><div class="muted">${usage.kilobytes} KB in local mirror · IndexedDB enabled for Journal + Drill Logs</div></div>
      <div class="card"><div class="card-title">Engine Health</div><div style="font-size:1.8rem;font-weight:800;">${metrics.systemStatus.score}</div><div class="muted">${esc(metrics.systemStatus.label)}</div></div>
      <div class="card"><div class="card-title">Learning Integrity</div><div style="font-size:1.8rem;font-weight:800;">${metrics.learningIntegrity.index ?? '—'}</div><div class="muted">Momentum ${metrics.learningIntegrity.momentum.normalized} · Balance ${metrics.learningIntegrity.balance ?? '—'} · internal indicator</div></div>
      <div class="card"><div class="card-title">Capability Coverage</div><div style="font-size:1.8rem;font-weight:800;">${metrics.capabilityCoverage.percent}%</div><div class="muted">${metrics.capabilityCoverage.covered}/${metrics.capabilityCoverage.total} mapped capabilities covered</div></div>
      <div class="card"><div class="card-title">Drill Frequency</div><div style="font-size:1.8rem;font-weight:800;">${drillFrequency}</div><div class="muted">doctrine logs in last 7 days</div></div>
      <div class="card"><div class="card-title">Journal Capture Rate</div><div style="font-size:1.8rem;font-weight:800;">${journalCaptureRate}</div><div class="muted">entries in last 7 days</div></div>
      <div class="card"><div class="card-title">Adaptive Profile</div><div style="font-size:1.8rem;font-weight:800;">${profile.enabled ? 'ON' : 'OFF'}</div><div class="muted">${adaptive.guardrails} guardrail-rated decisions · prompts remain user-controlled</div></div>
      <div class="card"><div class="card-title">Quality Controls</div><div style="font-size:1.8rem;font-weight:800;">${qualityLoop.verified}/${qualityLoop.verified + qualityLoop.open}</div><div class="muted">verified effective · ${qualityLoop.overdue} overdue</div></div>
    </div>
    <div class="card" style="margin-top:14px;">
      <div class="card-title">Domain Balance</div>
      <div style="display:grid;gap:8px;margin-top:10px;">
        ${['technical','strategic','leadership'].map(dom => `<div style="display:flex;justify-content:space-between;"><span>${esc(dom)}</span><span>${metrics.domainBalance.pct?.[dom] || 0}% · ${(metrics.domainBalance.hours?.[dom] || 0).toFixed(1)}h</span></div>`).join('')}
      </div>
    </div>
    <div class="card" style="margin-top:14px;">
      <div class="card-title">Diagnostics</div>
      <div style="display:grid;gap:8px;margin-top:10px;">${warnings.length ? warnings.map(w => `<div>${esc(w)}</div>`).join('') : '<div class="muted">No major system warnings right now.</div>'}</div>
    </div>
  `;
}
