// ==================== V5: STRATEGIC COMPETENCY ENGINE ====================
const StrategicEngine = (() => {
    // Competency domains with keywords and target hours
    const COMPETENCIES = {
        // PMP Knowledge Areas
        pmp_integration: { name: 'Integration Mgmt', keywords: ['integration', 'charter', 'project plan', 'change control', 'close project'], target: 15, pathway: 'pmp', color: 'var(--accent)' },
        pmp_scope: { name: 'Scope Mgmt', keywords: ['scope', 'requirements', 'wbs', 'work breakdown', 'deliverables'], target: 12, pathway: 'pmp', color: 'var(--accent)' },
        pmp_schedule: { name: 'Schedule Mgmt', keywords: ['schedule', 'timeline', 'cpm', 'critical path', 'gantt', 'sequencing'], target: 15, pathway: 'pmp', color: 'var(--accent)' },
        pmp_cost: { name: 'Cost Mgmt', keywords: ['cost', 'budget', 'earned value', 'evm', 'ev', 'cpi', 'spi', 'estimate'], target: 15, pathway: 'pmp', color: 'var(--accent)' },
        pmp_quality: { name: 'Quality Mgmt', keywords: ['quality', 'qa', 'qc', 'inspection', 'audit'], target: 10, pathway: 'pmp', color: 'var(--accent)' },
        pmp_resource: { name: 'Resource Mgmt', keywords: ['resource', 'team', 'raci', 'conflict', 'staffing'], target: 12, pathway: 'pmp', color: 'var(--accent)' },
        pmp_comms: { name: 'Communications', keywords: ['communication', 'reporting', 'meeting'], target: 8, pathway: 'pmp', color: 'var(--accent)' },
        pmp_risk: { name: 'Risk Mgmt', keywords: ['risk', 'hazard', 'mitigation', 'contingency', 'probability'], target: 15, pathway: 'pmp', color: 'var(--accent)' },
        pmp_procurement: { name: 'Procurement', keywords: ['procurement', 'contract', 'vendor', 'rfp', 'bid', 'tender'], target: 10, pathway: 'pmp', color: 'var(--accent)' },
        pmp_stakeholder: { name: 'Stakeholder Mgmt', keywords: ['stakeholder', 'engagement', 'influence'], target: 8, pathway: 'pmp', color: 'var(--accent)' },
        // McMaster BTech Prep
        math: { name: 'Mathematics', keywords: ['math', 'calculus', 'derivative', 'integral', 'algebra', 'statistics'], target: 40, pathway: 'mcmaster', color: 'var(--info)' },
        structures: { name: 'Structures', keywords: ['statics', 'dynamics', 'beam', 'column', 'steel', 'load', 'moment', 'shear', 'structural'], target: 30, pathway: 'mcmaster', color: 'var(--info)' },
        geotech: { name: 'Geotechnical', keywords: ['soil', 'foundation', 'bearing', 'geotechnical', 'settlement'], target: 20, pathway: 'mcmaster', color: 'var(--info)' },
        construction_methods: { name: 'Construction Methods', keywords: ['heavy civil', 'infrastructure', 'sustainable', 'formwork', 'concrete pour'], target: 25, pathway: 'mcmaster', color: 'var(--info)' },
        // SMR Specialization
        nuclear_overview: { name: 'Nuclear Industry', keywords: ['nuclear', 'cnsc', 'regulatory', 'safety culture', 'reactor', 'radiation', 'smr'], target: 15, pathway: 'smr', color: 'var(--purple)' },
        nuclear_qaqc: { name: 'Nuclear QA/QC', keywords: ['csa n299', 'nuclear quality', 'nuclear grade', 'n-stamp'], target: 20, pathway: 'smr', color: 'var(--purple)' },
        modular_construction: { name: 'Modular Construction', keywords: ['modular', 'off-site', 'prefab', 'heavy lift', 'module assembly'], target: 15, pathway: 'smr', color: 'var(--purple)' },
        nuclear_concrete: { name: 'Nuclear Concrete', keywords: ['nuclear concrete', 'mass concrete', 'thermal control'], target: 15, pathway: 'smr', color: 'var(--purple)' },
        project_controls: { name: 'Project Controls', keywords: ['evm', 'earned value', 'project controls', 'schedule risk', 'cost control', 'baseline'], target: 20, pathway: 'smr', color: 'var(--purple)' }
    };

    // Calculate recency weight (30-day half-life)
    function recencyWeight(dateStr) {
        const entryDate = new Date(dateStr + 'T12:00:00');
        const now = new Date();
        const daysAgo = (now - entryDate) / (1000 * 60 * 60 * 24);
        return Math.exp(-daysAgo * Math.log(2) / 30);
    }

    // Analyze a single time entry for competency matches
    function analyzeEntry(entry) {
        const text = ((entry.title || '') + ' ' + (entry.notes || '') + ' ' + (entry.domain || '')).toLowerCase();
        const duration = parseFloat(entry.duration) || 0;
        const weight = recencyWeight(entry.date);
        const weightedHours = duration * weight;
        
        const matches = {};
        for (const [compId, comp] of Object.entries(COMPETENCIES)) {
            const hasMatch = comp.keywords.some(kw => text.includes(kw.toLowerCase()));
            if (hasMatch) {
                matches[compId] = weightedHours;
            }
        }
        
        // Map domain directly if no keyword matches
        if (Object.keys(matches).length === 0 && entry.domain) {
            const domainMap = {
                'pmp': 'pmp_integration',
                'math': 'math',
                'structures': 'structures',
                'geotech': 'geotech',
                'smr': 'nuclear_overview',
                'management': 'pmp_integration'
            };
            if (domainMap[entry.domain]) {
                matches[domainMap[entry.domain]] = weightedHours;
            }
        }
        
        return { matches, rawHours: duration };
    }

    // Compute all competency scores
    function computeScores() {
        const entries = arr(K.time);  // FIXED: Uses correct key
        const scores = {};
        let totalRawHours = 0;
        
        for (const compId of Object.keys(COMPETENCIES)) {
            scores[compId] = { raw: 0, weighted: 0 };
        }
        
        for (const entry of entries) {
            const analysis = analyzeEntry(entry);
            totalRawHours += analysis.rawHours;
            
            for (const [compId, hours] of Object.entries(analysis.matches)) {
                scores[compId].raw += parseFloat(entry.duration) || 0;
                scores[compId].weighted += hours;
            }
        }
        
        const results = {};
        for (const [compId, comp] of Object.entries(COMPETENCIES)) {
            const pct = Math.min(100, Math.round((scores[compId].weighted / comp.target) * 100));
            results[compId] = {
                ...comp,
                rawHours: scores[compId].raw,
                weightedHours: scores[compId].weighted,
                percentage: pct
            };
        }
        
        return { results, totalRawHours };
    }

    // Calculate pathway readiness scores
    function computeReadiness() {
        const { results, totalRawHours } = computeScores();
        
        const pathways = { pmp: [], mcmaster: [], smr: [] };
        for (const [compId, data] of Object.entries(results)) {
            if (pathways[data.pathway]) {
                pathways[data.pathway].push(data);
            }
        }
        
        const readiness = {};
        for (const [pathId, comps] of Object.entries(pathways)) {
            if (comps.length === 0) continue;
            const totalTarget = comps.reduce((s, c) => s + c.target, 0);
            const totalWeighted = comps.reduce((s, c) => s + c.weightedHours, 0);
            const pct = Math.min(100, Math.round((totalWeighted / totalTarget) * 100));
            readiness[pathId] = {
                percentage: pct,
                hoursLogged: comps.reduce((s, c) => s + c.rawHours, 0),
                hoursTarget: totalTarget,
                competencies: comps
            };
        }
        
        // Composite score (weighted: PMP 40%, McMaster 35%, SMR 25%)
        const composite = Math.round(
            (readiness.pmp?.percentage || 0) * 0.40 +
            (readiness.mcmaster?.percentage || 0) * 0.35 +
            (readiness.smr?.percentage || 0) * 0.25
        );
        
        return { readiness, composite, totalRawHours, competencies: results };
    }

    // Detect gaps (under-invested areas)
    function detectGaps() {
        const { competencies } = computeReadiness();
        const gaps = [];
        
        for (const [compId, data] of Object.entries(competencies)) {
            if (data.percentage < 25) {
                gaps.push({
                    id: compId,
                    name: data.name,
                    pathway: data.pathway,
                    percentage: data.percentage,
                    hoursNeeded: Math.max(0, data.target - data.weightedHours).toFixed(1),
                    severity: data.percentage < 10 ? 'critical' : 'warning'
                });
            }
        }
        
        gaps.sort((a, b) => a.percentage - b.percentage);
        return gaps.slice(0, 5);
    }

    // Generate insights
    function generateInsights() {
        const { readiness, competencies, totalRawHours } = computeReadiness();
        const insights = [];
        
        if (totalRawHours < 10) {
            insights.push({
                type: 'warning',
                title: 'Insufficient Data',
                text: 'Only ' + totalRawHours.toFixed(1) + ' hours tracked. Log more study sessions for accurate readiness scores.'
            });
        }
        
        const pmpHrs = readiness.pmp?.hoursLogged || 0;
        const mcmHrs = readiness.mcmaster?.hoursLogged || 0;
        
        if (pmpHrs > mcmHrs * 2 && mcmHrs > 0) {
            insights.push({
                type: 'info',
                title: 'PMP-Heavy Balance',
                text: 'PMP: ' + pmpHrs.toFixed(0) + 'h vs McMaster: ' + mcmHrs.toFixed(0) + 'h. Consider balancing—McMaster admission requires strong technical foundation.'
            });
        }
        
        const strongest = Object.entries(competencies)
            .filter(([,d]) => d.percentage >= 50)
            .sort((a,b) => b[1].percentage - a[1].percentage);
        
        if (strongest.length > 0) {
            insights.push({
                type: 'success',
                title: 'Your Strengths',
                text: 'Strong in: ' + strongest.slice(0,3).map(([,d]) => d.name).join(', ') + '. Build on these foundations.'
            });
        }
        
        const gaps = detectGaps();
        if (gaps.length > 0 && gaps[0].percentage < 10) {
            insights.push({
                type: 'warning',
                title: 'Critical Gap',
                text: gaps[0].name + ' at ' + gaps[0].percentage + '% - needs ' + gaps[0].hoursNeeded + ' more hours.'
            });
        }
        
        if (readiness.mcmaster?.percentage < 50 && totalRawHours > 20) {
            insights.push({
                type: 'warning',
                title: 'McMaster Admission Risk',
                text: 'McMaster BTech requires 80% GPA and strong technical foundation. Current prep readiness: ' + readiness.mcmaster?.percentage + '%'
            });
        }
        
        return insights;
    }

    return {
        computeReadiness,
        computeScores,
        detectGaps,
        generateInsights,
        COMPETENCIES
    };
})();

// ==================== V5: RENDER STRATEGIC DASHBOARD ====================
function renderDashStrategic() {
    const { composite, readiness } = StrategicEngine.computeReadiness();
    const gaps = StrategicEngine.detectGaps();
    
    let gapHtml = '';
    if (gaps.length > 0) {
        gapHtml = '<div style="margin-top:12px;padding:10px;background:rgba(239,68,68,0.15);border-radius:6px;font-size:0.8rem;"><strong style="color:#EF4444;">Gap:</strong> ' + gaps[0].name + ' needs attention (' + gaps[0].percentage + '%)</div>';
    }
    
    // Dashboard strategic container (exists in tpl-dashboard since V17 stabilization)
    const container = document.getElementById('dashStrategic');
    if (!container) return;
    
    container.innerHTML = '<div style="background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);border:1px solid #06B6D4;border-radius:12px;padding:20px;margin-bottom:16px;cursor:pointer;" onclick="showStrategicDetails()"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="color:#06B6D4;font-size:1rem;font-weight:600;">🎯 Strategic Readiness Index</div><div><div style="font-size:2rem;font-weight:700;color:white;">' + composite + '%</div></div></div><div style="display:flex;gap:20px;justify-content:center;font-size:0.8rem;color:#94A3B8;"><span>PMP: ' + (readiness.pmp?.percentage || 0) + '%</span><span>McMaster: ' + (readiness.mcmaster?.percentage || 0) + '%</span><span>SMR: ' + (readiness.smr?.percentage || 0) + '%</span></div>' + gapHtml + '<div style="text-align:center;margin-top:12px;font-size:0.75rem;color:#64748B;">Tap for full analysis →</div></div>';
}

function showStrategicDetails() {
    const { readiness, composite, totalRawHours, competencies } = StrategicEngine.computeReadiness();
    const gaps = StrategicEngine.detectGaps();
    const insights = StrategicEngine.generateInsights();
    
    const sortedComps = Object.entries(competencies).sort((a,b) => b[1].percentage - a[1].percentage);
    
    let html = '<div style="background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);border:1px solid #06B6D4;border-radius:12px;padding:20px;margin-bottom:16px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><div style="color:#06B6D4;font-size:1rem;font-weight:600;">🎯 Strategic Readiness Index</div><div><div style="font-size:2.5rem;font-weight:700;color:white;">' + composite + '%</div><div style="font-size:0.75rem;color:#64748B;">Composite Score</div></div></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">';
    html += '<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:14px;text-align:center;"><div style="font-size:1.8rem;font-weight:700;color:' + (readiness.pmp?.percentage >= 50 ? '#22C55E' : readiness.pmp?.percentage >= 25 ? '#EAB308' : '#EF4444') + ';">' + (readiness.pmp?.percentage || 0) + '%</div><div style="font-size:0.75rem;color:#64748B;margin-top:4px;">PMP Readiness</div></div>';
    html += '<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:14px;text-align:center;"><div style="font-size:1.8rem;font-weight:700;color:' + (readiness.mcmaster?.percentage >= 50 ? '#22C55E' : readiness.mcmaster?.percentage >= 25 ? '#EAB308' : '#EF4444') + ';">' + (readiness.mcmaster?.percentage || 0) + '%</div><div style="font-size:0.75rem;color:#64748B;margin-top:4px;">McMaster Prep</div></div>';
    html += '<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:14px;text-align:center;"><div style="font-size:1.8rem;font-weight:700;color:' + (readiness.smr?.percentage >= 50 ? '#22C55E' : readiness.smr?.percentage >= 25 ? '#EAB308' : '#EF4444') + ';">' + (readiness.smr?.percentage || 0) + '%</div><div style="font-size:0.75rem;color:#64748B;margin-top:4px;">SMR Specialist</div></div>';
    html += '</div>';
    html += '<div style="font-size:0.75rem;color:#64748B;text-align:center;">Based on ' + totalRawHours.toFixed(1) + ' hours tracked • Weighted by recency (30-day half-life)</div>';
    html += '</div>';
    
    // Gap Alerts
    html += '<div class="card"><div class="card-header"><span class="card-title">⚠️ Gap Detection</span></div>';
    if (gaps.length === 0) {
        html += '<div class="empty">No critical gaps detected. Keep building momentum!</div>';
    } else {
        html += gaps.map(g => '<div style="background:rgba(239,68,68,0.15);border:1px solid #EF4444;border-radius:8px;padding:12px;margin-bottom:8px;"><div style="font-weight:600;font-size:0.85rem;color:#EF4444;margin-bottom:4px;">⚠️ ' + g.name + ' — ' + g.percentage + '%</div><div style="font-size:0.8rem;color:#94A3B8;">Pathway: ' + g.pathway.toUpperCase() + ' • Needs ~' + g.hoursNeeded + ' more hours</div></div>').join('');
    }
    html += '</div>';
    
    // Competency Bars
    html += '<div class="card"><div class="card-header"><span class="card-title">📊 Competency Coverage</span></div>';
    html += sortedComps.map(([id, c]) => '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-primary);border-radius:8px;margin-bottom:6px;"><span style="min-width:120px;font-size:0.8rem;">' + c.name + '</span><div style="flex:1;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;"><div style="height:100%;border-radius:4px;width:' + c.percentage + '%;background:' + c.color + ';"></div></div><span style="min-width:50px;text-align:right;font-size:0.75rem;color:var(--text-muted);">' + c.rawHours.toFixed(1) + 'h</span></div>').join('');
    html += '</div>';
    
    // Insights
    html += '<div class="card"><div class="card-header"><span class="card-title">🧠 Strategic Insights</span></div>';
    if (insights.length === 0) {
        html += '<div class="empty">Log more hours to generate strategic insights.</div>';
    } else {
        html += insights.map(i => '<div style="background:var(--bg-tertiary);border-left:3px solid #06B6D4;padding:14px;border-radius:0 8px 8px 0;margin-bottom:12px;"><div style="font-weight:600;font-size:0.85rem;margin-bottom:6px;color:#06B6D4;">' + (i.type === 'warning' ? '⚠️' : i.type === 'success' ? '💪' : '💡') + ' ' + i.title + '</div><div style="font-size:0.85rem;color:#94A3B8;">' + i.text + '</div></div>').join('');
    }
    html += '</div>';
    
    html += '<button class="btn btn-secondary btn-lg" onclick="renderDashStrategic();window.scrollTo(0,0);">← Collapse</button>';

    // V17 stabilization: render details in-place inside #dashStrategic.
    // (Previously this overwrote #dashboard's innerHTML, permanently destroying
    // the dashboard DOM — templates are only injected once at boot.)
    const container = document.getElementById('dashStrategic');
    if (container) container.innerHTML = html;
}

// Hook into dashboard refresh
const originalRefreshDashboard = refreshDashboard;
refreshDashboard = function() {
    originalRefreshDashboard();
    renderDashStrategic();
};

