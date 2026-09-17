// ==================== NAVIGATION (V10 — 10-page tabbed layout) ====================

var currentTabs = {};

// Legacy page → new page+tab mapping
var PAGE_MAP = {
    // Direct pages (no change needed)
    dashboard: { page: 'dashboard' },
    journal: { page: 'journal' },
    // Daily Ops
    operator: { page: 'dailyops', tab: 'operator' },
    protocol: { page: 'dailyops', tab: 'protocol' },
    discipline: { page: 'dailyops', tab: 'discipline' },
    habits: { page: 'dailyops', tab: 'habits' },
    dailyops: { page: 'dailyops' },
    // Planner
    goals: { page: 'planner', tab: 'goals' },
    tasks: { page: 'planner', tab: 'tasks' },
    calendar: { page: 'planner', tab: 'calendar' },
    tracker: { page: 'planner', tab: 'tracker' },
    planner: { page: 'planner' },
    // Study
    learn: { page: 'study', tab: 'learn' },
    sciencecoach: { page: 'study', tab: 'sciencecoach' },
    studylab: { page: 'study', tab: 'studylab' },
    pmptools: { page: 'study', tab: 'pmptools' },
    flashcards: { page: 'study', tab: 'flashcards' },
    study: { page: 'study' },
    // Knowledge
    knowledgevault: { page: 'knowledge', tab: 'knowledgevault' },
    capture: { page: 'knowledge', tab: 'capture' },
    inbox: { page: 'knowledge', tab: 'capture' },
    doctrine: { page: 'knowledge', tab: 'doctrine' },
    knowledge: { page: 'knowledge' },
    // Strategy
    horizon: { page: 'strategy', tab: 'horizon' },
    decisions: { page: 'strategy', tab: 'decisions' },
    frameworklab: { page: 'strategy', tab: 'frameworklab' },
    strategy: { page: 'strategy' },
    // Review
    review: { page: 'reviewhub', tab: 'review' },
    insights: { page: 'reviewhub', tab: 'insights' },
    reviewhub: { page: 'reviewhub' },
    // Network
    contacts: { page: 'network' },
    network: { page: 'network' },
    // System
    guide: { page: 'system', tab: 'guide' },
    profilelab: { page: 'system', tab: 'profilelab' },
    settings: { page: 'system', tab: 'settings' },
    health: { page: 'system', tab: 'health' },
    diagnostics: { page: 'system', tab: 'diagnostics' },
    system: { page: 'system' },
    // Quran (V42)
    quranread: { page: 'quran', tab: 'quranread' },
    quranlisten: { page: 'quran', tab: 'quranlisten' },
    quranunderstand: { page: 'quran', tab: 'quranunderstand' },
    quranmushaf: { page: 'mushaf' },
    mushaf: { page: 'mushaf' },
    quran: { page: 'quran' }
};

var NAV_DESTINATIONS = [
    { route: 'dashboard', label: 'Home', group: 'Daily command', icon: '⌂', keywords: 'dashboard command center next move' },
    { route: 'protocol', label: 'Morning / Evening Protocol', group: 'Daily command', icon: '☀', keywords: 'routine intention energy gratitude' },
    { route: 'operator', label: 'Command Center', group: 'Daily command', icon: '🎯', keywords: 'operator focus execution' },
    { route: 'discipline', label: 'Discipline & Energy', group: 'Daily command', icon: '📊', keywords: 'scorecard communication energy' },
    { route: 'habits', label: 'Habits', group: 'Daily command', icon: '🔄', keywords: 'anchor tiny streak recipe' },
    { route: 'goals', label: 'Goals', group: 'Plan', icon: '🎯', keywords: 'milestones outcomes' },
    { route: 'tasks', label: 'Tasks', group: 'Plan', icon: '☑', keywords: 'priority due status' },
    { route: 'calendar', label: 'Calendar', group: 'Plan', icon: '📅', keywords: 'events deadlines month' },
    { route: 'tracker', label: 'Time Log', group: 'Plan', icon: '⏱️', keywords: 'hours study work category' },
    { route: 'learn', label: 'Learning Paths', group: 'Study', icon: '◫', keywords: 'curriculum textbooks foundations pathway' },
    { route: 'sciencecoach', label: 'Science Coach', group: 'Study', icon: '🧠', keywords: 'neuroscience neuroplasticity evidence learning cycle readiness retrieval feedback huberman myths' },
    { route: 'studylab', label: 'Study Techniques', group: 'Study', icon: '⚗', keywords: 'retrieval spacing interleave feynman generation' },
    { route: 'pmptools', label: 'PMP Practice', group: 'Study', icon: '🎓', keywords: '2026 exam scenarios evm itto cebok' },
    { route: 'flashcards', label: 'Flashcards', group: 'Study', icon: '🎴', keywords: 'srs review spaced repetition due cards' },
    { route: 'knowledgevault', label: 'Knowledge Vault', group: 'Knowledge', icon: '📝', keywords: 'notes analysis mental models books' },
    { route: 'capture', label: 'Capture Inbox', group: 'Knowledge', icon: '📨', keywords: 'quick capture inbox thought question source field note process' },
    { route: 'doctrine', label: 'Doctrine Library', group: 'Knowledge', icon: '📚', keywords: 'books modules drills templates source tracker' },
    { route: 'horizon', label: '5-Year / 90-Day Plan', group: 'Career strategy', icon: '△', keywords: 'identity targets war plan progress' },
    { route: 'decisions', label: 'Decision Journal', group: 'Career strategy', icon: '⚖', keywords: 'decision calibration outcome review' },
    { route: 'frameworklab', label: 'Systems Lab', group: 'Career strategy', icon: '🧩', keywords: 'framework variables edges scenarios graph' },
    { route: 'journal', label: 'Journal', group: 'Reflect & connect', icon: '📝', keywords: 'reflection action entry note' },
    { route: 'review', label: 'Weekly Review', group: 'Reflect & connect', icon: '↗', keywords: 'week strengths balance decision quality' },
    { route: 'insights', label: 'Insights', group: 'Reflect & connect', icon: '📊', keywords: 'analytics learning discipline energy calibration' },
    { route: 'network', label: 'Network', group: 'Reflect & connect', icon: '◎', keywords: 'contacts crm follow up communication' },
    { route: 'guide', label: 'User Guide', group: 'System', icon: '📖', keywords: 'manual science workflow directory' },
    { route: 'profilelab', label: 'Adaptive Profile Lab', group: 'System', icon: '◇', keywords: 'personality clifton caliper hypotheses behavior decision communication quality' },
    { route: 'settings', label: 'Settings & Backup', group: 'System', icon: '⚙', keywords: 'export import reset name vision data' },
    { route: 'health', label: 'System Health', group: 'System', icon: '🏥', keywords: 'storage schema runtime health' },
    { route: 'diagnostics', label: 'Diagnostics', group: 'System', icon: '⚡', keywords: 'checks tests contract interaction fault' },
    { route: 'mushaf', label: 'Mushaf Reader', group: 'Faith', icon: '📖', keywords: 'quran mushaf page reader focus one page arabic scripture' },
    { route: 'quranread', label: 'Quran — Read & Search', group: 'Faith', icon: '📚', keywords: 'quran read search arabic uthmani verses surah ayah scripture' },
    { route: 'quranlisten', label: 'Quran — Listen', group: 'Faith', icon: '🎧', keywords: 'quran listen audio recitation reciter alafasy' },
    { route: 'quranunderstand', label: 'Quran — Understand', group: 'Faith', icon: '🕌', keywords: 'quran understand translation diyanet turkish tafsir notes' }
];

var commandMatches = [];
var commandResultIndex = 0;

function navigationDestination(route) {
    return NAV_DESTINATIONS.find(function(item) { return item.route === route; }) || null;
}

function updateNavigationContext(target, mapping) {
    var destination = navigationDestination(target);
    var pageFallback = {
        dashboard: ['Daily command', 'Home'], dailyops: ['Daily command', 'Today'], planner: ['Plan', 'Planner'],
        study: ['Learn & apply', 'Study'], knowledge: ['Learn & apply', 'Knowledge'], strategy: ['Learn & apply', 'Career Strategy'],
        journal: ['Reflect & connect', 'Journal'], reviewhub: ['Reflect & connect', 'Review'], network: ['Reflect & connect', 'Network'], system: ['System', 'Guide, data & health'],
        quran: ['Faith', 'Quran'], mushaf: ['Faith', 'Mushaf Reader']
    };
    var fallback = pageFallback[mapping.page] || ['StudyOS', mapping.page];
    var section = destination ? destination.group : fallback[0];
    var label = destination ? destination.label : fallback[1];
    var sectionEl = document.getElementById('topbarSection');
    var pageEl = document.getElementById('topbarPage');
    if (sectionEl) sectionEl.textContent = section;
    if (pageEl) pageEl.textContent = label;
    document.title = label + ' — StudyOS V62';

    document.querySelectorAll('[data-route]').forEach(function(control) {
        var active = control.getAttribute('data-route') === mapping.page;
        control.classList.toggle('active', active);
        if (active) control.setAttribute('aria-current', 'page');
        else control.removeAttribute('aria-current');
    });
}

function renderCommandResults() {
    var input = document.getElementById('commandSearch');
    var host = document.getElementById('commandResults');
    if (!host) return;
    var query = String(input ? input.value : '').trim().toLowerCase();
    var navigationMatches = NAV_DESTINATIONS.filter(function(item) {
        var haystack = (item.label + ' ' + item.group + ' ' + item.keywords).toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
    }).slice(0, query ? 8 : 14).map(function(item) {
        return Object.assign({ kind: 'navigation', typeLabel: 'Destination' }, item);
    });
    var contentMatches = query && typeof studyosSearchContent === 'function'
        ? studyosSearchContent(query, 14).map(function(item) { return Object.assign({ kind: 'content' }, item); })
        : [];
    commandMatches = navigationMatches.concat(contentMatches).slice(0, 20);
    commandResultIndex = Math.max(0, Math.min(commandResultIndex, commandMatches.length - 1));
    if (!commandMatches.length) {
        host.innerHTML = '<div class="command-empty"><strong>No match yet.</strong><span>Try a note title, source, task, decision, or pathway keyword.</span><button class="btn btn-primary btn-sm" onclick="closeCommandPalette();openQuickCapture()">Capture it instead</button></div>';
        return;
    }
    var lastKind = '';
    host.innerHTML = commandMatches.map(function(item, index) {
        var section = '';
        if (item.kind !== lastKind) {
            lastKind = item.kind;
            section = '<div class="command-result-section">' + (item.kind === 'navigation' ? 'Navigate' : 'Your content') + '</div>';
        }
        var label = item.label || item.title || 'Untitled';
        var detail = item.kind === 'navigation' ? item.group : [item.typeLabel, item.subtitle].filter(Boolean).join(' · ');
        return section + '<button class="command-result ' + (item.kind === 'content' ? 'command-result-content ' : '') + (index === commandResultIndex ? 'selected' : '') + '" data-command-index="' + index + '" onclick="commandSelect(' + index + ')"><span class="command-result-icon">' + esc(item.icon || '◇') + '</span><span><strong>' + esc(label) + '</strong><small>' + esc(detail) + '</small></span><span class="command-result-type">' + esc(item.kind === 'navigation' ? 'Open' : (item.typeLabel || 'Item')) + '</span></button>';
    }).join('');
}

function openCommandPalette() {
    var palette = document.getElementById('commandPalette');
    var input = document.getElementById('commandSearch');
    if (!palette) return;
    palette.classList.add('open');
    document.body.classList.add('command-open');
    commandResultIndex = 0;
    if (input) input.value = '';
    renderCommandResults();
    setTimeout(function() { if (input) input.focus(); }, 0);
}

function closeCommandPalette() {
    var palette = document.getElementById('commandPalette');
    if (palette) palette.classList.remove('open');
    document.body.classList.remove('command-open');
}

// V56: orphaned commandNavigate() removed — palette navigation goes through
// commandSelect()/go() (audit R3; router.js edit scoped to this release).

function commandSelect(index) {
    var item = commandMatches[index];
    if (!item) return;
    closeCommandPalette();
    if (item.kind === 'content' && typeof studyosOpenSearchResult === 'function') {
        studyosOpenSearchResult(item);
        return;
    }
    go(item.route);
}

document.addEventListener('keydown', function(event) {
    var palette = document.getElementById('commandPalette');
    var isOpen = palette && palette.classList.contains('open');
    if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 'k') {
        event.preventDefault();
        isOpen ? closeCommandPalette() : openCommandPalette();
        return;
    }
    if (!isOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); closeCommandPalette(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!commandMatches.length) return;
        commandResultIndex = (commandResultIndex + (event.key === 'ArrowDown' ? 1 : -1) + commandMatches.length) % commandMatches.length;
        renderCommandResults();
        var selected = document.querySelector('.command-result.selected');
        if (selected && selected.scrollIntoView) selected.scrollIntoView({ block: 'nearest' });
        return;
    }
    if (event.key === 'Enter' && commandMatches[commandResultIndex]) {
        event.preventDefault();
        commandSelect(commandResultIndex);
    }
});

function go(target) {
    var mapping = PAGE_MAP[target];
    if (!mapping) { console.warn('Unknown page: ' + target); return; }
    
    var page = mapping.page;
    var tab = mapping.tab || null;

    if (page !== 'mushaf' && typeof window.quranMushafToggleFocus === 'function') {
        window.quranMushafToggleFocus(false, { silent: true });
    }
    if (page !== 'mushaf' && window.quranSession && window.quranSession.read && window.quranSession.read.layoutMode === 'mushaf') {
        window.quranSession.read.layoutMode = window.quranSession.read.standardLayoutMode || 'verse';
    }
    // The standard Quran reader and dedicated Mushaf reader reuse audio and
    // verse-tool IDs. Keep only the active surface mounted to avoid duplicate
    // IDs sending playback/highlight updates to a hidden page.
    var standardQuranRoot = document.getElementById('quranReadRoot');
    var dedicatedMushafRoot = document.getElementById('quranMushafRoot');
    if (page === 'mushaf' && standardQuranRoot) standardQuranRoot.innerHTML = '';
    if (page !== 'mushaf' && dedicatedMushafRoot) dedicatedMushafRoot.innerHTML = '';
    
    // Switch page
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-link').forEach(function(n) { n.classList.remove('active'); });
    
    var el = document.getElementById(page);
    if (el) el.classList.add('active');
    
    updateNavigationContext(target, mapping);
    
    // Auto-close sidebar on mobile. V57 delegates to the mobile shell so
    // body scroll-lock and ARIA state are cleared together.
    if (typeof window.closeMobileSidebar === 'function') {
        window.closeMobileSidebar({ skipFocus: true });
    } else {
        var sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            var overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.classList.remove('show');
        }
    }
    
    // If a specific tab was requested, switch to it
    if (tab) {
        goTab(page, tab);
    } else {
        // Render default or last-used tab
        renderForPage(page);
    }
    
    try { window.scrollTo(0, 0); } catch (e) {}
    if (typeof window.studyosMobileRevealActiveTab === 'function') {
        window.setTimeout(function() {
            window.studyosMobileRevealActiveTab(document.querySelector('.page.active') || document);
        }, 0);
    }
}

function goTab(page, tab) {
    currentTabs[page] = tab;
    
    var pageEl = document.getElementById(page);
    if (!pageEl) return;
    
    // Switch tab panels
    pageEl.querySelectorAll('.tab-panel').forEach(function(p) {
        p.style.display = 'none';
        p.setAttribute('aria-hidden', 'true');
    });
    var target = document.getElementById('tab-' + tab);
    if (target) {
        target.style.display = '';
        target.setAttribute('aria-hidden', 'false');
    }
    
    // Update tab bar active state
    var tabBar = document.getElementById(page + 'Tabs');
    if (tabBar) {
        tabBar.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.classList.remove('active');
            var selected = btn.getAttribute('onclick') && btn.getAttribute('onclick').indexOf("'" + tab + "'") !== -1;
            btn.setAttribute('aria-selected', selected ? 'true' : 'false');
            btn.setAttribute('tabindex', selected ? '0' : '-1');
            if (selected) {
                btn.classList.add('active');
            }
        });
    }
    
    renderForTab(tab);

    var matchingRoute = NAV_DESTINATIONS.find(function(item) {
        var route = PAGE_MAP[item.route];
        return route && route.page === page && route.tab === tab;
    });
    if (matchingRoute) updateNavigationContext(matchingRoute.route, PAGE_MAP[matchingRoute.route]);
}

function renderForPage(page) {
    // Pages without tabs
    if (page === 'dashboard') { refreshDashboard(); return; }
    if (page === 'journal') { renderJournal(); return; }
    if (page === 'network') { renderContacts(); return; }
    if (page === 'mushaf') { if (typeof renderQuranMushafReader === 'function') renderQuranMushafReader(); return; }
    
    // Pages with tabs — use last tab or default
    var defaults = {
        dailyops: 'protocol',
        planner: 'goals',
        study: 'learn',
        knowledge: 'knowledgevault',
        strategy: 'horizon',
        reviewhub: 'review',
        system: 'guide',
        quran: 'quranread'
    };
    
    var activeTab = currentTabs[page] || defaults[page];
    if (activeTab) goTab(page, activeTab);
}

function renderForTab(tab) {
    switch(tab) {
        case 'operator': if(typeof renderOperator==='function') renderOperator(); break;
        case 'protocol': renderProtocol(); break;
        case 'discipline': renderDiscipline(); break;
        case 'habits': renderHabits(); break;
        case 'goals': renderGoals(); break;
        case 'tasks': renderTasks(); break;
        case 'calendar': renderCalendar(); break;
        case 'tracker': refreshTracker(); break;
        case 'learn': renderLearn(); break;
        case 'sciencecoach': if(typeof renderScienceCoach==='function') renderScienceCoach(); break;
        case 'studylab': renderStudyLab(); break;
        case 'pmptools': if (typeof studyosLazyRender === 'function') studyosLazyRender('pmptools', 'renderPmpTools'); else if (typeof renderPmpTools === 'function') renderPmpTools(); break; /* V56 audit R10 */
        case 'flashcards': renderFlashcards(); break;
        case 'knowledgevault': renderKnowledge(); break;
        case 'capture': if(typeof renderCaptureInbox==='function') renderCaptureInbox(); break;
        case 'doctrine': renderDoctrine(); break;
        case 'horizon': renderStrategicHorizon(); break;
        case 'decisions': renderDecisions(); break;
        case 'frameworklab': if (typeof studyosLazyRender === 'function') studyosLazyRender('frameworklab', 'renderFrameworkLab'); else if (typeof renderFrameworkLab === 'function') renderFrameworkLab(); break; /* V56 audit R10 */
        case 'review': renderWeeklyReview(); break;
        case 'insights': showInsight('overview'); break;
        case 'guide': if (typeof studyosLazyRender === 'function') studyosLazyRender('guide', 'renderGuide'); else if (typeof renderGuide === 'function') renderGuide(); break; /* V56 audit R10 */
        case 'profilelab': if(typeof renderProfileLab==='function') renderProfileLab(); break;
        case 'settings': loadSettings(); break;
        case 'health': if(typeof renderSystemHealth==='function') renderSystemHealth(); break;
        case 'diagnostics': if (typeof studyosLazyRender === 'function') studyosLazyRender('diagnostics', 'renderDiagnostics'); else if (typeof renderDiagnostics === 'function') renderDiagnostics(); break; /* V56 audit R10 — diagnostics loads ALL lazy modules first (integrity surface) */
        case 'quranread': if(typeof renderQuranRead==='function') renderQuranRead(); break;
        case 'quranlisten': if(typeof renderQuranListen==='function') renderQuranListen(); break;
        case 'quranunderstand': if(typeof renderQuranUnderstand==='function') renderQuranUnderstand(); break;
    }
}
