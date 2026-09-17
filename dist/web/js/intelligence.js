// ==================== INTELLIGENCE (V8) ====================
// "Invisible" intelligence layer that recommends the next best action
// based on system state and currently active doctrine module.

const INTEL = {
    storageKey: K.intel,
    getState() {
        return get(INTEL.storageKey) || { version: 1, activeModuleId: null, lastSuggestionAt: null };
    },
    setState(patch) {
        const cur = INTEL.getState();
        const next = { ...cur, ...patch, version: 1 };
        set(INTEL.storageKey, next);
        return next;
    },
    setActiveModule(id) {
        INTEL.setState({ activeModuleId: id });
    },
    getActiveModule() {
        const st = INTEL.getState();
        if (!st.activeModuleId) return null;
        const mods = Array.isArray(window.DOCTRINE_MODULES) ? window.DOCTRINE_MODULES : [];
        return mods.find(m => m.id === st.activeModuleId) || null;
    }
};

function intelGetSystemSnapshot() {
    const todayStr = today();
    const tasks = arr(K.tasks);
    const openTasks = tasks.filter(t => !taskIsCompleted(t));
    const overdue = openTasks.filter(t => taskDueDate(t) && taskDueDate(t) < todayStr).length;
    const dueToday = openTasks.filter(t => taskDueDate(t) === todayStr).length;

    const cards = arr(K.flashcards);
    const dueCards = cards.filter(c => !c.nextReview || c.nextReview <= todayStr).length;

    const events = arr(K.events);
    const plannedMinutes = events
        .filter(e => e.date === todayStr)
        .reduce((sum, e) => sum + (parseInt(e.duration || 0, 10) || 0), 0);
    const plannedHours = plannedMinutes / 60;

    const protocol = get(K.protocol) || {};
    const todayProtocol = protocol[todayStr];

    return {
        todayStr,
        overdue,
        dueToday,
        dueCards,
        plannedHours,
        plannedMinutes,
        hasProtocol: !!todayProtocol,
        protocolDone: !!todayProtocol?.completed
    };
}

// Returns: {title, desc, ctaText, ctaFn}
function intelScoreCandidates() {
    const snap = intelGetSystemSnapshot();
    const active = INTEL.getActiveModule();
    const operator = (window.METRICS?.getOperatorScore ? METRICS.getOperatorScore() : (typeof getOperatorScore === "function" ? getOperatorScore() : { composite: 50 }));
    const alloc = (typeof LEARN !== "undefined" && LEARN.getDomainAllocation) ? LEARN.getDomainAllocation(7) : { totalHours: 0, pct: { technical: 0, strategic: 0, leadership: 0 } };
    const drift = (typeof LEARN !== "undefined" && LEARN.getDriftStatus) ? LEARN.getDriftStatus() : { isDrifting:false, offenders:[] };
    const quality = (typeof LEARN !== "undefined" && LEARN.getDrillQualityScore) ? LEARN.getDrillQualityScore(14) : null;
    const decay = (typeof LEARN !== "undefined" && LEARN.getSkillDecayWarnings) ? LEARN.getSkillDecayWarnings(21) : [];

    const weakest = ['technical','strategic','leadership']
        .map(dom => ({ dom, pct: alloc.pct?.[dom] || 0, delta: Math.abs((alloc.pct?.[dom] || 0) - 33) }))
        .sort((a,b) => b.delta - a.delta)[0] || { dom: 'strategic', pct: 33, delta: 0 };

    const candidates = [];
    const push = (key, title, desc, ctaText, ctaFn, weights) => {
        const score = Math.round((weights.operator_stability || 0) * 0.30 + (weights.skill_decay || 0) * 0.25 + (weights.domain_drift || 0) * 0.20 + (weights.goal_deadline || 0) * 0.15 + (weights.backlog_pressure || 0) * 0.10);
        candidates.push({ key, title, desc, ctaText, ctaFn, score, weights });
    };

    push('protocol', 'Run Protocol', 'Stabilize the operator before optimization.', 'Open Protocol', "go('protocol')", {
        operator_stability: Math.max(0, 100 - operator.composite),
        skill_decay: 0,
        domain_drift: 0,
        goal_deadline: 25,
        backlog_pressure: 10
    });

    push('srs', `Review SRS (${snap.dueCards})`, 'Spaced repetition compounds fast. Clear due cards to keep memory tight.', 'Open Flashcards', "go('flashcards')", {
        operator_stability: 15,
        skill_decay: Math.min(100, snap.dueCards * 3),
        domain_drift: 0,
        goal_deadline: 30,
        backlog_pressure: 20
    });

    push('tasks', `Clear Overdue Tasks (${snap.overdue})`, 'Backlog creates cognitive drag. Remove one overdue item to restore control.', 'Open Tasks', "go('tasks')", {
        operator_stability: 20,
        skill_decay: 0,
        domain_drift: 0,
        goal_deadline: Math.min(100, snap.dueToday * 20 + snap.overdue * 25),
        backlog_pressure: Math.min(100, snap.overdue * 30)
    });

    push('calendar', snap.plannedHours < 2 ? 'Schedule 2h Focus' : 'Execute the next block', snap.plannedHours < 2 ? 'Your day needs committed blocks. Add two 60-min sessions to the calendar.' : 'System is stable. Run the next scheduled block with full attention.', snap.plannedHours < 2 ? 'Open Calendar' : 'Open Schedule', "go('calendar')", {
        operator_stability: 10,
        skill_decay: 0,
        domain_drift: 0,
        goal_deadline: snap.plannedHours < 2 ? 60 : 20,
        backlog_pressure: 25
    });

    if (drift.isDrifting) {
        const offender = drift.offenders?.[0] || weakest;
        const name = offender.domain ? offender.domain.charAt(0).toUpperCase() + offender.domain.slice(1) : weakest.dom;
        push('drift', `Drift Correction: ${name}`, `Two-week drift guardrail triggered. Run a corrective drill in ${name}.`, 'Run Corrective Drill', `intelRunCorrectiveDrill('${offender.domain || weakest.dom}')`, {
            operator_stability: 10,
            skill_decay: 35,
            domain_drift: 100,
            goal_deadline: 35,
            backlog_pressure: 5
        });
    }

    if (quality !== null && quality < 55) {
        const nm = weakest.dom.charAt(0).toUpperCase() + weakest.dom.slice(1);
        push('quality', `Upgrade Quality: Teach-level rep (${Math.round(quality)}%)`, `Your recent drills skew shallow. Run one teach-level drill in ${nm}.`, 'Run Teach-level Drill', `intelRunCorrectiveDrill('${weakest.dom}','teach')`, {
            operator_stability: 5,
            skill_decay: 40,
            domain_drift: weakest.delta * 2,
            goal_deadline: 30,
            backlog_pressure: 0
        });
    }

    if (decay.length) {
        const worst = decay.slice().sort((a,b)=>b.daysSince-a.daysSince)[0];
        const nm = worst.domain.charAt(0).toUpperCase() + worst.domain.slice(1);
        push('decay', `Skill Decay Risk: ${nm}`, `No reps logged in ${nm} for ${worst.daysSince >= 9999 ? 'a very long time' : worst.daysSince + ' days'}.`, 'Run Decay Fix Drill', `intelRunCorrectiveDrill('${worst.domain}')`, {
            operator_stability: 0,
            skill_decay: Math.min(100, worst.daysSince * 4),
            domain_drift: 30,
            goal_deadline: 25,
            backlog_pressure: 0
        });
    }

    if (active && active.drills && active.drills[0]) {
        push('active-module', `Doctrine Drill: ${active.title}`, typeof active.drills[0] === 'string' ? active.drills[0] : (active.drills[0].title || 'Run doctrine drill'), 'Open Doctrine', "go('doctrine')", {
            operator_stability: 0,
            skill_decay: 45,
            domain_drift: weakest.delta * 1.5,
            goal_deadline: 20,
            backlog_pressure: 0
        });
    }

    return candidates.sort((a,b) => b.score - a.score);
}

// Returns: {title, desc, ctaText, ctaFn}
function intelRecommendNextMove() {
    const ranked = intelScoreCandidates();
    return ranked[0] || {
        title: 'Execute the next block',
        desc: 'Run the next scheduled block with full attention. Keep it simple.',
        ctaText: 'Open Schedule',
        ctaFn: "go('calendar')"
    };
}


// ===== V11: corrective drill launcher (domain -> doctrine drill) =====
function intelRunCorrectiveDrill(domain, depthPref){
    const d = String(domain || 'strategic').toLowerCase();
    const mods = Array.isArray(window.DOCTRINE_MODULES) ? window.DOCTRINE_MODULES : [];
    // Prefer explicit pillar match
    let m = mods.find(x => String(x.pillar||'').toLowerCase() === d);
    if (!m) {
        // Fallback: match derived primaryDomain
        m = mods.find(x => (typeof doctrinePrimaryDomain==='function' ? doctrinePrimaryDomain(x) : '') === d);
    }
    if (!m && mods.length) m = mods[0];
    if (!m) { toast('No doctrine modules available'); return; }

    // Prefill doctrine modal fields (one-shot)
    try {
        window.__DOCTRINE_PREFILL = {
            depth: depthPref || null,
            primaryDomain: d || null,
            minutesSpent: 60
        };
    } catch(e) {}

    go('doctrine');
    // Delay to ensure DOM + page render
    setTimeout(() => {
        try {
            if (typeof renderDoctrine === 'function') renderDoctrine();
            if (typeof doctrineSelect === 'function') doctrineSelect(m.id);
            if (typeof doctrineOpenModal === 'function') doctrineOpenModal(m.id);
            else toast('Doctrine drill function missing');
        } catch(e) {
            console.error(e);
            toast('Failed to open drill');
        }
    }, 60);
}
