// ==================== LEARNING ENGINE (V11) ====================
// Balanced Mode: metrics + reflective notes
// Provides: domain balance, skill momentum, learning integrity index

const LEARN = {
  keys: {
    doctrineLogs: K.doctrineLogs,
  },
  domains: ['technical','strategic','leadership'],
  depthWeights: { surface: 1, structured: 2, teach: 3 },

  getDoctrineLogs() {
    const logs = get(LEARN.keys.doctrineLogs);
    return Array.isArray(logs) ? logs : [];
  },
  addDoctrineLog(entry) {
    const logs = LEARN.getDoctrineLogs();
    const source = entry && typeof entry === 'object' ? entry : {};
    const requestedDate = source.date || '';
    const parsedAt = typeof source.at === 'number' ? source.at : Date.parse(source.at || (requestedDate ? requestedDate + 'T12:00:00' : ''));
    const at = Number.isFinite(parsedAt) ? parsedAt : Date.now();
    const normalized = {
      ...source,
      id: source.id || uid(),
      at,
      date: requestedDate || fmtDate(new Date(at)),
      primaryDomain: normalizeLearningDomain(source.primaryDomain || source.domain) || 'strategic'
    };
    logs.unshift(normalized);
    set(LEARN.keys.doctrineLogs, logs);
    if (typeof EVENTS !== 'undefined') EVENTS.emit('drill:logged', { entry: normalized, count: logs.length });
    return logs;
  },

  // Uses Tracker time entries (K.time) where category='study' and domain in LEARN.domains
  getDomainAllocation(days=7) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days-1));
    return LEARN.getDomainAllocationRange(fmtDate(start), fmtDate(end));
  },

  // Inclusive range by date string YYYY-MM-DD
  getDomainAllocationRange(startStr, endStr) {
    const entries = arr(K.time);
    const buckets = { technical: 0, strategic: 0, leadership: 0 };
    let total = 0;

    entries
      .filter(e => (e.category || 'study') === 'study')
      .filter(e => {
        const d = (e.date || '');
        return d >= startStr && d <= endStr;
      })
      .forEach(e => {
        const dom = timeEntryLearningDomain(e);
        const h = parseFloat(e.duration) || 0;
        if (buckets[dom] !== undefined) {
          buckets[dom] += h;
          total += h;
        }
      });

    const pct = {};
    LEARN.domains.forEach(d => {
      pct[d] = total > 0 ? Math.round((buckets[d] / total) * 100) : 0;
    });

    return { startStr, endStr, hours: buckets, totalHours: total, pct };
  },

  // Drift guardrail: imbalance >15% from 33/33/33 for TWO consecutive weeks
  // Returns { isDrifting, weeks: { current, previous }, offenders: [ {domain,pctCurrent,pctPrev} ] }
  getDriftStatus() {
    const end = new Date();
    const endStr = fmtDate(end);

    // Current week: last 7 days inclusive
    const curStart = new Date();
    curStart.setDate(curStart.getDate() - 6);
    const cur = LEARN.getDomainAllocationRange(fmtDate(curStart), endStr);

    // Previous week: 7 days before current window
    const prevEnd = new Date(curStart);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - 6);
    const prev = LEARN.getDomainAllocationRange(fmtDate(prevStart), fmtDate(prevEnd));

    const target = 33;
    const threshold = 15;

    const minimumEvidenceHours = 1;
    if (cur.totalHours < minimumEvidenceHours || prev.totalHours < minimumEvidenceHours) {
      return { isDrifting: false, insufficientData: true, weeks: { current: cur, previous: prev }, offenders: [] };
    }

    const offenders = [];
    LEARN.domains.forEach(d => {
      const pctCur = cur.pct[d] || 0;
      const pctPrev = prev.pct[d] || 0;
      const badCur = Math.abs(pctCur - target) > threshold;
      const badPrev = Math.abs(pctPrev - target) > threshold;
      if (badCur && badPrev) offenders.push({ domain: d, pctCurrent: pctCur, pctPrevious: pctPrev });
    });

    return { isDrifting: offenders.length > 0, insufficientData: false, weeks: { current: cur, previous: prev }, offenders };
  },

  // Momentum computed from doctrine drill logs (weighted by depth + friction + recency)
  // Recency: exponential decay with half-life 10 days
  getSkillMomentum(days=14) {
    const logs = LEARN.getDoctrineLogs();
    const now = Date.now();
    const cutoff = now - days*86400000;

    let score = 0;
    let count = 0;
    const byDomain = { technical: 0, strategic: 0, leadership: 0 };

    logs
      .filter(l => (l.at || 0) >= cutoff)
      .forEach(l => {
        const depthW = LEARN.depthWeights[l.depth] || 1;
        const friction = Math.max(1, Math.min(5, parseInt(l.friction || 3, 10) || 3));
        const frictionW = 1 + (friction - 3) * 0.08; // mild

        const ageDays = (now - l.at) / 86400000;
        const recencyW = Math.pow(0.5, ageDays / 10);

        const s = depthW * frictionW * recencyW;
        score += s;
        count += 1;

        const dom = (l.primaryDomain || '').toLowerCase();
        if (byDomain[dom] !== undefined) byDomain[dom] += s;
      });

    // Normalize to 0-100, calibrated so ~10 structured drills in 14d ≈ 70
    const normalized = Math.max(0, Math.min(100, Math.round((score / 10) * 70)));
    return { days, raw: score, normalized, count, byDomain };
  },

  
  // Momentum time series (for charts). Uses doctrine logs by day and domain (no recency decay).
  // Returns [{date, total, technical, strategic, leadership, count}]
  getMomentumSeries(days=30) {
    const logs = LEARN.getDoctrineLogs();
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days-1));
    const startStr = fmtDate(start);
    const endStr = fmtDate(end);

    const series = {};
    // init days
    for (let i=0;i<days;i++){
      const d = new Date(start);
      d.setDate(start.getDate()+i);
      const ds = fmtDate(d);
      series[ds] = { date: ds, total: 0, technical: 0, strategic: 0, leadership: 0, count: 0 };
    }

    logs.forEach(l => {
      const ds = l.date || (l.at ? fmtDate(new Date(l.at)) : '');
      if (!ds || ds < startStr || ds > endStr) return;
      const dom = (l.primaryDomain || '').toLowerCase();
      const depthW = LEARN.depthWeights[l.depth] || 1;
      const friction = Math.max(1, Math.min(5, parseInt(l.friction || 3, 10) || 3));
      const rep = depthW * (1 + (friction - 3) * 0.06); // mild
      const day = series[ds];
      if (!day) return;
      day.total += rep;
      day.count += 1;
      if (day[dom] !== undefined) day[dom] += rep;
    });

    return Object.values(series);
  },

  // Drill quality score (Balanced Mode): rewards structured/teach reps.
  // Returns 0-100, or null if insufficient reps.
  getDrillQualityScore(days=14) {
    const logs = LEARN.getDoctrineLogs();
    const now = Date.now();
    const cutoff = now - days*86400000;
    const recent = logs.filter(l => (l.at||0) >= cutoff);
    if (recent.length < 6) return null;

    let surface=0, structured=0, teach=0;
    recent.forEach(l=>{
      if (l.depth === 'teach') teach++;
      else if (l.depth === 'structured') structured++;
      else surface++;
    });

    const total = recent.length;
    const score = ((structured*0.7 + teach*1.0 + surface*0.35) / total) * 100;
    return Math.max(0, Math.min(100, score));
  },

  // Decision calibration score: compares confidence-at-decision to reviewed outcome rating.
  // Requires decisions to store: confidence (1-5) and outcomeScore (1-5) on review.
  getDecisionCalibrationScore(days=180) {
    const decisions = arr(K.decisions);
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = fmtDate(cutoff);

    const reviewed = decisions
      .filter(d => d.reviewed)
      .filter(d => (d.date||'') >= cutoffStr || (d.reviewedAt||'') >= cutoffStr)
      .filter(d => d.confidence && d.outcomeScore);

    if (reviewed.length < 3) return null;

    let total = 0;
    reviewed.forEach(d=>{
      const c = Math.max(1, Math.min(5, parseInt(d.confidence,10) || 3));
      const o = Math.max(1, Math.min(5, parseInt(d.outcomeScore,10) || 3));
      const delta = Math.abs(c - o); // 0-4
      const s = 100 - delta*20; // 100,80,60,40,20
      total += s;
    });

    return total / reviewed.length;
  },

  // V29 scenario calibration: confidence is committed before feedback.
  // PRACTICE returns null until a rated attempt exists; no neutral score is
  // invented for a user who has not supplied evidence.
  getPracticeCalibrationScore() {
    try {
      if (typeof PRACTICE === 'undefined' || typeof PRACTICE.getCalibration !== 'function') return null;
      const result = PRACTICE.getCalibration();
      return result && result.score !== null ? result.score : null;
    } catch (e) {
      console.warn('Practice calibration score error:', e);
      return null;
    }
  },

  // Composite calibration: retrieval, drill quality, scenarios, and delayed
  // decision review. Only observed components contribute.
  getCalibrationComposite() {
    // SRS calibration from srs.js
    let srsCal = null;
    try { if (typeof getCalibrationScore === 'function') srsCal = getCalibrationScore(); } catch (e) {}
    const drillQ = LEARN.getDrillQualityScore(14);
    const decCal = LEARN.getDecisionCalibrationScore(180);
    const practiceCal = LEARN.getPracticeCalibrationScore();

    // Average only components supported by actual observations. V25 imputed
    // missing components as 70, which silently produced a positive score for
    // a new user with no calibration evidence.
    const candidates = [
      { value: srsCal, weight: 0.35 },
      { value: drillQ, weight: 0.25 },
      { value: practiceCal, weight: 0.20 },
      { value: decCal, weight: 0.20 }
    ].filter(x => x.value !== null && x.value !== undefined);
    const totalWeight = candidates.reduce((s, x) => s + x.weight, 0);
    const comp = totalWeight
      ? candidates.reduce((s, x) => s + Math.max(0, Math.min(100, x.value)) * x.weight, 0) / totalWeight
      : null;
    return {
      score: comp === null ? null : Math.round(comp),
      coverage: candidates.length,
      parts: { srs: srsCal, drillQuality: drillQ, practice: practiceCal, decision: decCal }
    };
  },

getCalibrationScoreSafe() {
    try {
      if (typeof getCalibrationScore === 'function') return getCalibrationScore();
    } catch (e) {
      console.warn('Calibration score error:', e);
    }
    return null;
  },

  getLearningIntegrityIndex() {
    const allocation = LEARN.getDomainAllocation(7);
    const momentum = LEARN.getSkillMomentum(14);
    const compositeCalibration = LEARN.getCalibrationComposite ? LEARN.getCalibrationComposite() : { score: LEARN.getCalibrationScoreSafe(), parts:null };
    const calib = compositeCalibration.score;
    const calibParts = compositeCalibration.parts;

    // Domain balance is undefined until study hours exist.
    const target = 33;
    const dev = LEARN.domains.reduce((s,d)=>s+Math.abs((allocation.pct[d]||0)-target),0);
    const balance = allocation.totalHours > 0 ? Math.max(0, Math.min(100, Math.round(100 - dev * 1.2))) : null;

    // Use only observed components; do not award neutral points for missing data.
    const components = [];
    if (momentum.count > 0) components.push({ value: momentum.normalized, weight: 0.45 });
    if (calib !== null) components.push({ value: Math.max(0, Math.min(100, Math.round(calib))), weight: 0.30 });
    if (balance !== null) components.push({ value: balance, weight: 0.25 });
    const observedWeight = components.reduce((s, x) => s + x.weight, 0);
    const idx = observedWeight ? Math.round(components.reduce((s, x) => s + x.value * x.weight, 0) / observedWeight) : null;

    return {
      index: idx,
      momentum,
      calibration: calib,
      calibrationParts: calibParts,
      balance,
      allocation,
      evidenceComponents: components.length
    };
  },

  // --- V11 v9: Adaptive Block Sizing ---
  getRecentDrillStats(domain, days=14){
    const logs = this.getDoctrineLogs();
    const since = Date.now() - days*24*60*60*1000;
    const dom = (domain||'').toLowerCase();
    const rel = logs.filter(l => (l.at||0) >= since && (!dom || (l.domain||'').toLowerCase()===dom));
    if(!rel.length) return null;
    const avgFriction = rel.reduce((s,l)=> s + (parseFloat(l.friction)||0), 0) / rel.length;
    const avgDepth = rel.reduce((s,l)=> s + (this.depthWeights[(l.depth||'surface')]||1), 0) / rel.length;
    const teachPct = rel.filter(l => (l.depth||'')==='teach').length / rel.length;
    const surfacePct = rel.filter(l => (l.depth||'')==='surface').length / rel.length;
    const avgMinutes = rel.reduce((s,l)=> s + (parseFloat(l.minutes)||0), 0) / rel.length;
    return { n: rel.length, avgFriction, avgDepth, teachPct, surfacePct, avgMinutes };
  },

  recommendStudyBlockDuration(domain){
    // Returns minutes, rounded to nearest 15, clamped 30..90.
    const stats = this.getRecentDrillStats(domain, 14);
    let m = 60;
    if(stats){
      // If friction high or mostly surface reps => shorten to protect consistency.
      if(stats.avgFriction >= 4.0 || stats.avgDepth < 1.6 || stats.surfacePct >= 0.65) m = 45;
      // If quality high and friction low => lengthen to leverage capacity.
      if(stats.avgFriction <= 2.5 && stats.avgDepth >= 2.2) m = 75;
      if(stats.avgFriction <= 2.0 && stats.avgDepth >= 2.6 && stats.teachPct >= 0.25) m = 90;
      // If recent minutes naturally lower, respect it (but don't go below 30).
      if(stats.avgMinutes && stats.avgMinutes < m-10) m = Math.max(30, Math.round(stats.avgMinutes/15)*15);
    }
    m = Math.max(30, Math.min(90, m));
    m = Math.round(m/15)*15;
    return m || 60;
  },

  // --- V11 v9: Skill Decay Detection (21d) ---
  getSkillDecayWarnings(days=21){
    const logs = this.getDoctrineLogs();
    const now = Date.now();
    const lastByDomain = {};
    this.domains.forEach(d=> lastByDomain[d] = null);
    logs.forEach(l => {
      const d = (l.domain||'').toLowerCase();
      if(!this.domains.includes(d)) return;
      const t = l.at || 0;
      if(!lastByDomain[d] || t > lastByDomain[d]) lastByDomain[d] = t;
    });
    const out = [];
    this.domains.forEach(d => {
      const last = lastByDomain[d];
      if (!last) return; // never-started is not decay
      const daysSince = Math.floor((now-last)/(24*60*60*1000));
      if(daysSince >= days) out.push({ domain:d, lastAt:last, daysSince });
    });
    return out;
  },

  // --- V11 v9: Compounding Graph Data ---

  // --- V11 v11: Model auto-suggest (top 3) ---
  // Returns array of modelIds for a module, ranked by recent usage.
  // We weight:
  // - recency (last 30d)
  // - depth (surface/structured/teach)
  // - application presence
  suggestModelsForModule(moduleId, limit=3, days=30){
    const mid = String(moduleId||'').trim();
    if(!mid) return [];
    const since = Date.now() - days*24*60*60*1000;
    const logs = this.getDoctrineLogs().filter(l => (l.at||0) >= since && (l.moduleId||'') === mid && (l.modelId||'').trim());
    const scores = {}; // modelId -> score
    logs.forEach(l => {
      const id = String(l.modelId||'').trim();
      if(!id) return;
      const depthW = this.depthWeights[(l.depth||'surface')] || 1;
      const appW = (String(l.application||'').trim()) ? 0.75 : 0;
      // mild recency: newer logs slightly heavier
      const ageDays = Math.max(0, (Date.now() - (l.at||Date.now())) / (24*60*60*1000));
      const recW = Math.max(0.35, 1 - ageDays/45);
      const s = (1 * depthW + appW) * recW;
      scores[id] = (scores[id] || 0) + s;
    });
    const ranked = Object.entries(scores)
      .sort((a,b)=> b[1]-a[1])
      .map(([id])=>id);
    return ranked.slice(0, Math.max(0, limit|0));
  },
  
  getModelCompoundingGraph(){
    const mods = Array.isArray(window.DOCTRINE_MODULES) ? window.DOCTRINE_MODULES : [];
    const logs = this.getDoctrineLogs();

    // Count reps/apps per modelId
    const counts = {}; // modelId -> {reps, apps}
    logs.forEach(l=>{
      const mid = (l.modelId||'').trim();
      if(!mid) return;
      if(!counts[mid]) counts[mid] = {reps:0, apps:0};
      counts[mid].reps += 1;
      if((l.application||'').trim()) counts[mid].apps += 1;
    });

    // Build nodes for each model in each module
    const nodes = [];
    mods.forEach(m=>{
      const models = Array.isArray(m.models) ? m.models : [];
      models.forEach((label, idx)=>{
        const id = `${m.id}::m${idx}`;
        const c = counts[id] || {reps:0, apps:0};
        nodes.push({
          id,
          label: String(label),
          moduleId: m.id,
          moduleTitle: m.title || m.id,
          pillar: (m.pillar||'technical').toLowerCase(),
          reps: c.reps,
          apps: c.apps,
          tags: Array.isArray(m.tags) ? m.tags : []
        });
      });
    });

    // Links: within same module (chain) + cross-module via shared tags
    const links = [];
    const byModule = {};
    nodes.forEach(n=>{
      if(!byModule[n.moduleId]) byModule[n.moduleId] = [];
      byModule[n.moduleId].push(n);
    });
    Object.values(byModule).forEach(arr=>{
      // preserve m0.. order
      arr.sort((a,b)=>{
        const ai = parseInt((/::m(\d+)$/.exec(a.id)||['',0])[1],10);
        const bi = parseInt((/::m(\d+)$/.exec(b.id)||['',0])[1],10);
        return ai-bi;
      });
      for(let i=0;i<arr.length-1;i++){
        links.push({ source: arr[i].id, target: arr[i+1].id, weight: 2 });
      }
    });

    // Cross links: shared tags >= 2 (keeps graph readable)
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        if(a.moduleId===b.moduleId) continue;
        const setA = new Set(a.tags||[]);
        const shared = (b.tags||[]).filter(t=>setA.has(t));
        if(shared.length>=2){
          links.push({ source:a.id, target:b.id, weight: 1+shared.length*0.4 });
        }
      }
    }

    return { nodes, links };
  },

getCompoundingGraph(){
    const mods = Array.isArray(window.DOCTRINE_MODULES) ? window.DOCTRINE_MODULES : [];
    const logs = this.getDoctrineLogs();
    const appCountByModule = {};
    logs.forEach(l => {
      const mid = l.moduleId || l.module || null;
      if(!mid) return;
      if(!appCountByModule[mid]) appCountByModule[mid] = { reps:0, apps:0 };
      appCountByModule[mid].reps += 1;
      if((l.application||'').trim()) appCountByModule[mid].apps += 1;
    });

    const nodes = mods.map(m => {
      const c = appCountByModule[m.id] || {reps:0, apps:0};
      return {
        id: m.id,
        label: m.title || m.name || m.id,
        pillar: (m.pillar||m.domain||'').toLowerCase() || 'technical',
        reps: c.reps,
        apps: c.apps,
        tags: Array.isArray(m.tags) ? m.tags : []
      };
    });

    // Edges: shared tags (>=1) or same pillar. Weight stronger for more shared tags.
    const links = [];
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a = nodes[i], b = nodes[j];
        const setA = new Set(a.tags||[]);
        const shared = (b.tags||[]).filter(t => setA.has(t));
        const samePillar = a.pillar && b.pillar && a.pillar===b.pillar;
        const w = shared.length;
        if(w>0 || samePillar){
          links.push({ source:a.id, target:b.id, weight: Math.max(1, w + (samePillar?0.5:0)) });
        }
      }
    }
    return { nodes, links };
  },

};
