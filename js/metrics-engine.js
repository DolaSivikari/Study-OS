// ==================== CENTRAL METRICS ENGINE (V16) ====================
const METRICS = {
  cache: {},
  invalidate() { this.cache = {}; },
  remember(key, fn) {
    if (this.cache[key] !== undefined) return this.cache[key];
    const value = fn();
    this.cache[key] = value;
    return value;
  },
  getLearningIntegrity() {
    return this.remember('learningIntegrity', () => {
      if (typeof LEARN !== 'undefined' && typeof LEARN.getLearningIntegrityIndex === 'function') return LEARN.getLearningIntegrityIndex();
      return { index: 0, momentum: { normalized: 0 }, balance: 0, allocation: { totalHours: 0, pct: { technical: 0, strategic: 0, leadership: 0 }, hours: { technical: 0, strategic: 0, leadership: 0 } } };
    });
  },
  getMomentum() {
    return this.remember('momentum', () => {
      if (typeof LEARN !== 'undefined' && typeof LEARN.getSkillMomentum === 'function') return LEARN.getSkillMomentum(14);
      return { normalized: 0, raw: 0, count: 0, byDomain: { technical: 0, strategic: 0, leadership: 0 } };
    });
  },
  getDomainBalance() {
    return this.remember('domainBalance', () => this.getLearningIntegrity().allocation);
  },
  getOperatorScore() {
    return this.remember('operator', () => typeof getOperatorScore === 'function' ? getOperatorScore() : { composite: 0, protocol: 0, discipline: 0, habits: 0, label: 'UNKNOWN' });
  },
  getStrategicPulse() {
    return this.remember('strategicPulse', () => {
      const sh = get(K.strategicHorizon) || {};
      const decisions = arr(K.decisions);
      const openGoals = arr(K.goals).filter(g => !g.completed).length;
      const ninetyDay = Array.isArray(sh.ninetyDay) ? sh.ninetyDay : [];
      const active90 = ninetyDay.filter(x => !x.done).length;
      const overdueReviews = decisions.filter(d => !d.reviewed && d.reviewDate && d.reviewDate <= today()).length;
      const score = Math.max(0, Math.min(100, Math.round(100 - active90 * 4 - overdueReviews * 8 - Math.max(0, openGoals - 5) * 2)));
      return { score, active90, overdueReviews, openGoals };
    });
  },
  getSystemStatus() {
    return this.remember('systemStatus', () => typeof getSystemStatus === 'function' ? getSystemStatus() : { score: 0, label: 'UNKNOWN', warnings: [] });
  },
  getCapabilityCoverage() {
    return this.remember('capabilityCoverage', () => {
      if (window.CAPABILITY_MAP && typeof CAPABILITY_MAP.getCoverage === 'function') return CAPABILITY_MAP.getCoverage();
      return { total: 0, covered: 0, percent: 0, areas: [] };
    });
  },
  snapshot() {
    return {
      generatedAt: new Date().toISOString(),
      operator: this.getOperatorScore(),
      learningIntegrity: this.getLearningIntegrity(),
      momentum: this.getMomentum(),
      domainBalance: this.getDomainBalance(),
      strategicPulse: this.getStrategicPulse(),
      systemStatus: this.getSystemStatus(),
      capabilityCoverage: this.getCapabilityCoverage()
    };
  }
};
window.METRICS = METRICS;

EVENTS.on('*', (name) => {
  if (!name.startsWith('storage:') && !name.includes(':')) return;
  METRICS.invalidate();
});
