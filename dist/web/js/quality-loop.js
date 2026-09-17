// ==================== V31 FIX → LEARN → PREVENT ====================
let editingQualityReviewId = null;

function getQualityReviews() {
  return arr(K.qualityReviews);
}

function qualityStatusMeta(status) {
  if (status === 'effective') return { label:'Verified effective', cls:'badge-good' };
  if (status === 'needs-work') return { label:'Needs improvement', cls:'badge-warn' };
  return { label:'Open verification', cls:'badge-danger' };
}

function qualityReviewSummary(days) {
  const since = sinceDaysAgo(typeof days === 'number' ? days : 90);
  const rows = getQualityReviews().filter(row => (row.date || '') >= since);
  return {
    total:rows.length,
    open:rows.filter(row => row.verificationStatus !== 'effective').length,
    verified:rows.filter(row => row.verificationStatus === 'effective').length,
    repeats:rows.filter(row => row.recurrence === 'repeat').length,
    overdue:rows.filter(row => row.verificationStatus === 'open' && row.verifyDate && row.verifyDate < today()).length
  };
}

function renderQualityLoop() {
  const root = document.getElementById('qualityLoopRoot');
  if (!root) return;
  const rows = getQualityReviews().slice().sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
  const summary = qualityReviewSummary(90);
  root.innerHTML = `
    <section class="card quality-loop-shell">
      <div class="quality-loop-head"><div><span class="kicker">After-action learning</span><h3>Fix → Learn → Prevent</h3><p>Solving the immediate problem is step one. A control is complete only after its effectiveness is checked.</p></div><button class="btn btn-primary" onclick="openQualityReviewModal()">New quality review</button></div>
      <div class="quality-loop-stats"><div><strong>${summary.total}</strong><span>90-day reviews</span></div><div><strong>${summary.open}</strong><span>open controls</span></div><div><strong>${summary.verified}</strong><span>verified effective</span></div><div><strong>${summary.repeats}</strong><span>repeat issues</span></div></div>
      ${rows.length ? `<div class="quality-review-list">${rows.slice(0,6).map(row => {
        const status = qualityStatusMeta(row.verificationStatus);
        const overdue = row.verificationStatus === 'open' && row.verifyDate && row.verifyDate < today();
        return `<button class="quality-review-row" onclick="openQualityReviewModal('${esc(row.id)}')"><span class="quality-review-mark ${row.recurrence === 'repeat' ? 'is-repeat' : ''}"></span><span><strong>${esc(row.title)}</strong><small>${esc(row.date || '')} · ${esc(row.area || 'quality')} · ${esc(row.impact || 'medium')}${row.verifyDate ? ' · verify ' + esc(row.verifyDate) : ''}</small></span><span class="badge ${overdue ? 'badge-danger' : status.cls}">${overdue ? 'Overdue' : status.label}</span></button>`;
      }).join('')}</div>` : '<div class="empty compact">No structured quality reviews yet. Use this after a mistake, near miss, recurring study error, or process failure.</div>'}
    </section>`;
}

function populateQualityDecisionOptions(selectedId) {
  const select = document.getElementById('qualityDecisionId');
  if (!select) return;
  const decisions = arr(K.decisions).slice().sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
  select.innerHTML = '<option value="">None</option>' + decisions.map(row => `<option value="${esc(row.id)}" ${row.id === selectedId ? 'selected' : ''}>${esc(row.date || '')} · ${esc(row.title || 'Untitled decision')}</option>`).join('');
}

function openQualityReviewModal(id) {
  const row = id ? getQualityReviews().find(item => item.id === id) : null;
  editingQualityReviewId = row ? row.id : null;
  document.getElementById('qualityReviewId').value = row ? row.id : '';
  document.getElementById('qualityTitle').value = row ? row.title || '' : '';
  document.getElementById('qualityDate').value = row ? row.date || today() : today();
  document.getElementById('qualityArea').value = row ? row.area || 'quality' : 'quality';
  document.getElementById('qualityImpact').value = row ? row.impact || 'medium' : 'medium';
  document.getElementById('qualityRecurrence').value = row ? row.recurrence || 'first' : 'first';
  document.getElementById('qualityWhat').value = row ? row.whatHappened || '' : '';
  document.getElementById('qualityFix').value = row ? row.immediateFix || '' : '';
  document.getElementById('qualityCause').value = row ? row.rootCause || '' : '';
  document.getElementById('qualityPrevention').value = row ? row.prevention || '' : '';
  document.getElementById('qualityStandard').value = row ? row.governingSource || '' : '';
  document.getElementById('qualityOwner').value = row ? row.owner || '' : '';
  document.getElementById('qualityVerifyDate').value = row ? row.verifyDate || '' : '';
  document.getElementById('qualityVerificationStatus').value = row ? row.verificationStatus || 'open' : 'open';
  document.getElementById('qualityVerificationNote').value = row ? row.verificationNote || '' : '';
  document.getElementById('qualityCreateTask').checked = row ? !!row.taskId : true;
  document.getElementById('qualityDeleteBtn').style.display = row ? 'block' : 'none';
  populateQualityDecisionOptions(row ? row.decisionId || '' : '');
  openModal('qualityReviewModal');
  setTimeout(() => document.getElementById('qualityTitle')?.focus(), 60);
}

function qualityUpsertVerificationTask(review, shouldCreate) {
  if (!shouldCreate || !review.verifyDate) return review.taskId || '';
  const tasks = arr(K.tasks);
  let task = review.taskId ? tasks.find(item => item.id === review.taskId) : null;
  const values = normalizeTaskRecord({
    id:task ? task.id : uid(),
    title:'Verify control: ' + review.title,
    description:'Quality Loop verification for "' + review.title + '". Evidence required: ' + (review.prevention || 'confirm preventive control effectiveness'),
    due:review.verifyDate,
    priority:review.impact === 'high' || review.impact === 'regulated' ? 'high' : 'med',
    category:'work',
    status:review.verificationStatus === 'effective' ? 'done' : 'pending',
    completed:review.verificationStatus === 'effective',
    source:'quality-review',
    sourceId:review.id,
    tags:['quality-verification', review.area || 'quality'],
    createdAt:task ? task.createdAt : new Date().toISOString()
  });
  if (task) Object.assign(task, values);
  else tasks.push(values);
  set(K.tasks, tasks);
  return values.id;
}

function saveQualityReview() {
  const title = document.getElementById('qualityTitle').value.trim();
  const whatHappened = document.getElementById('qualityWhat').value.trim();
  const rootCause = document.getElementById('qualityCause').value.trim();
  const prevention = document.getElementById('qualityPrevention').value.trim();
  if (!title || !whatHappened || !rootCause || !prevention) {
    toast('Issue, what happened, root cause, and preventive control are required.');
    return;
  }
  const rows = getQualityReviews();
  const existing = editingQualityReviewId ? rows.find(item => item.id === editingQualityReviewId) : null;
  const review = Object.assign({}, existing || {}, {
    id:existing ? existing.id : uid(),
    schemaVersion:1,
    title,
    date:document.getElementById('qualityDate').value || today(),
    area:document.getElementById('qualityArea').value,
    impact:document.getElementById('qualityImpact').value,
    recurrence:document.getElementById('qualityRecurrence').value,
    whatHappened,
    immediateFix:document.getElementById('qualityFix').value.trim(),
    rootCause,
    prevention,
    governingSource:document.getElementById('qualityStandard').value.trim(),
    owner:document.getElementById('qualityOwner').value.trim(),
    verifyDate:document.getElementById('qualityVerifyDate').value || '',
    verificationStatus:document.getElementById('qualityVerificationStatus').value,
    verificationNote:document.getElementById('qualityVerificationNote').value.trim(),
    decisionId:document.getElementById('qualityDecisionId').value || '',
    createdAt:existing ? existing.createdAt : new Date().toISOString(),
    updatedAt:new Date().toISOString()
  });
  review.taskId = qualityUpsertVerificationTask(review, document.getElementById('qualityCreateTask').checked);
  if (existing) Object.assign(existing, review);
  else rows.unshift(review);
  set(K.qualityReviews, rows);
  closeModal('qualityReviewModal');
  renderQualityLoop();
  if (typeof refreshDashboard === 'function') refreshDashboard();
  if (typeof refreshActiveDataSurface === 'function') refreshActiveDataSurface();
  toast(review.verificationStatus === 'effective' ? 'Quality control recorded as effective.' : 'Quality loop saved' + (review.taskId ? ' with a verification task.' : '.'));
}

function deleteQualityReview() {
  if (!editingQualityReviewId || !confirm('Delete this quality review? Any linked verification task will remain in Tasks.')) return;
  set(K.qualityReviews, getQualityReviews().filter(item => item.id !== editingQualityReviewId));
  closeModal('qualityReviewModal');
  renderQualityLoop();
  toast('Quality review deleted; linked tasks were preserved.');
}

window.QUALITY_LOOP = { summary:qualityReviewSummary, reviews:getQualityReviews };
