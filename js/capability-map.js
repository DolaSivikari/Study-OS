// ==================== CAPABILITY MAP (V16) ====================
const CAPABILITY_MAP = {
  domains: [
    {
      id: 'smr-construction',
      title: 'SMR Construction',
      capabilities: [
        { id: 'reactor-systems', title: 'Reactor Systems', match: ['reactor', 'nuclear', 'systems', 'smr'] },
        { id: 'nuclear-safety-culture', title: 'Nuclear Safety Culture', match: ['safety', 'quality', 'risk', 'culture'] },
        { id: 'project-controls', title: 'Project Controls', match: ['controls', 'schedule', 'cost', 'earned value', 'planning'] },
        { id: 'contract-strategy', title: 'Contract Strategy', match: ['contract', 'procurement', 'commercial', 'delivery'] },
        { id: 'stakeholder-governance', title: 'Stakeholder Governance', match: ['stakeholder', 'governance', 'leadership', 'communication'] }
      ]
    }
  ],
  resolveModule(module) {
    if (!module) return null;
    const blob = [module.id, module.title, module.domain, ...(module.tags || []), ...(module.models || []), ...(module.sources || [])].join(' ').toLowerCase();
    for (const area of this.domains) {
      for (const capability of area.capabilities) {
        if (capability.match.some(term => blob.includes(term))) {
          return { areaId: area.id, areaTitle: area.title, capabilityId: capability.id, capabilityTitle: capability.title };
        }
      }
    }
    return { areaId: 'smr-construction', areaTitle: 'SMR Construction', capabilityId: 'project-controls', capabilityTitle: 'Project Controls' };
  },
  getCoverage() {
    const modules = typeof doctrineAllModules === 'function' ? doctrineAllModules() : [];
    const assigned = modules.map(m => ({ moduleId: m.id, ...(m.capability || this.resolveModule(m)) }));
    const capabilities = this.domains.flatMap(d => d.capabilities.map(c => ({ areaTitle: d.title, capabilityId: c.id, capabilityTitle: c.title })));
    const coveredSet = new Set(assigned.map(x => x.capabilityId));
    return {
      total: capabilities.length,
      covered: coveredSet.size,
      percent: capabilities.length ? Math.round((coveredSet.size / capabilities.length) * 100) : 0,
      areas: capabilities.map(c => ({ ...c, covered: coveredSet.has(c.capabilityId) })),
      assigned
    };
  }
};
window.CAPABILITY_MAP = CAPABILITY_MAP;
