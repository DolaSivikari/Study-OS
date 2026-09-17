// ==================== GUIDE & MANUAL ====================
let guideSection = 'overview';

function renderGuide() {
    const sections = [
        { id: 'overview', icon: '🏠', label: 'Overview' },
        { id: 'features', icon: '⚡', label: 'Features' },
        { id: 'science', icon: '🧬', label: 'Science' },
        { id: 'profile', icon: '🧠', label: 'Your Profile' },
        { id: 'workflows', icon: '🔄', label: 'Workflows' }
    ];

    const container = document.getElementById('guideContainer');
    if (!container) return;

    document.getElementById('guideTabs').innerHTML = sections.map(s =>
        '<button class="filter-btn ' + (guideSection === s.id ? 'active' : '') + '" onclick="guideSection=\'' + s.id + '\';renderGuide()">' + s.icon + ' ' + s.label + '</button>'
    ).join('');

    container.innerHTML = getGuideContent(guideSection);

    // Make sections collapsible
    container.querySelectorAll('.guide-toggle').forEach(btn => {
        studyosBindClick(btn, function() {
            const target = this.nextElementSibling;
            const arrow = this.querySelector('.guide-arrow');
            if (target.style.display === 'none') {
                target.style.display = 'block';
                if (arrow) arrow.textContent = '▼';
            } else {
                target.style.display = 'none';
                if (arrow) arrow.textContent = '▶';
            }
        });
    });
}

function getGuideContent(section) {
    const content = {

// ============================================================
// SECTION 1: OVERVIEW
// ============================================================
overview: `
<div class="guide-section">
    <div style="text-align:center;padding:20px 0;">
        <div style="font-size:2.5rem;margin-bottom:8px;">📖</div>
        <h2 style="font-size:1.5rem;margin-bottom:8px;">Welcome to StudyOS</h2>
        <p style="color:var(--text-muted);max-width:600px;margin:0 auto;">A personal learning operating system built primarily on evidence-based learning science, supported by health and behavior research, and tailored to your profile.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid #14b8a6;">
        <h3 style="margin-bottom:8px;">◇ V31 Adaptive Profile & Execution</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;"><strong>Science Coach:</strong> turns a study block into an observable learning cycle—attempt first, retrieve without the source, compare, classify the gap, correct it, and schedule another retrieval.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;"><strong>Evidence register:</strong> each recommendation shows its evidence grade, practical use, boundary conditions, and direct research sources. Huberman Lab topics are a discovery trail, not the final authority.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;"><strong>Adaptive Profile Lab:</strong> CliftonStrengths and Caliper results become user-controlled hypotheses. Mark prompts useful, not like you, or snooze them; observed behavior is shown separately from assessment language.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;"><strong>Execution guardrails:</strong> the Decision Journal now checks consequence, reversibility, time pressure, governing requirements, independent sources, and your current pace. It can recommend either slowing down or deciding.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>Quality and communication loops:</strong> after-action reviews verify recurrence controls, while communication practice measures listening, adaptation, and shared understanding—not only output volume.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--accent);">
        <h3 style="margin-bottom:8px;">🧬 Philosophy</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:8px;">StudyOS is designed around three principles:</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>1. Quality over quantity.</strong> Research on elite practice shows that high-effort, feedback-rich work is difficult to sustain indefinitely. StudyOS uses four hours as a personal reflection guardrail—not a biological ceiling or daily quota.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>2. Systems over goals.</strong> James Clear: "You do not rise to the level of your goals. You fall to the level of your systems." StudyOS is your system — habits, protocols, reviews, all interconnected.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>3. Know thyself without freezing thyself.</strong> CliftonStrengths, Caliper, Principles You, and type profiles can suggest questions. They are not neurological measurements, competency ceilings, or fixed limits. StudyOS lets behavior and your own feedback overrule them.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--accent);">
        <h3 style="margin-bottom:8px;">✨ V29.3 Unified Visual System</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;"><strong>One visual language:</strong> application controls now use a local SVG icon set instead of mixed emoji and text symbols. Content can remain expressive; navigation and actions stay precise.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;"><strong>Consistent hierarchy:</strong> page headers, section headers, tabs, cards, forms, tables, modals, spacing, type sizes, and radii share the same design tokens.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>Faster and clearer:</strong> the icon enhancer updates only the component that changed, while Diagnostics verifies the stylesheet, icon engine, navigation coverage, page hierarchy, and visual tokens.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid #8b5cf6;">
        <h3 style="margin-bottom:8px;">⌘ V29.2 Commitment Intelligence</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;"><strong>One shared plan:</strong> Calendar blocks, timed Tasks, recurring Habits, transition buffers, daily capacity, and planned study load are checked by the same local engine.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:6px;"><strong>Intelligent but explainable:</strong> every warning names the two commitments and their times. It can suggest an open slot, but it never silently moves work or blocks “Save anyway.”</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>Context protection:</strong> starting Focus, a Study Lab timer, or a Journal entry during a scheduled block produces a heads-up. Date-only tasks stay flexible and never receive an invented exact time.</p>
    </div>

    <div class="card" style="margin-bottom:16px;">
        <h3 style="margin-bottom:12px;">🗺️ System Map — 10 Navigation Groups (with tabs)</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🏠 Home (Dashboard)</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Command center. Blind spot alerts, study load, focus launcher.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🌅 Morning / Evening (Protocol)</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Morning/evening routine. Intention, energy, gratitude.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>📖 Learning Paths</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Foundations, PMP 2026, McMaster BTech, and SMR tracks with an 8-book source atlas.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🧭 Science Coach</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Readiness-aware learning cycles, retrieval evidence, error correction, resume notes, and adaptive follow-up.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🧪 Study Techniques (Study Lab)</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">6 evidence-based techniques with built-in timers.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🎓 PMP Practice (Pro Tools)</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">61 original cases across all 26 July 2026 ECO tasks, with confidence calibration and an automatic weak-skill queue.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🎴 Flashcards</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Adaptive performance-based spacing, true mixed/focused queues, pretesting, and confidence calibration.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>✦ Capture Inbox</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Collect thoughts, questions, sources, and field notes; process them into useful objects later.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>📚 Knowledge</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Notes, analyses, models, and books with citations, explicit links, backlinks, and graph view.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🧠 Doctrine Library</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">16 training modules from your book stack. Models, drills, templates, SRS pack builder.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🧩 Systems Lab (Framework Lab)</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Graph-ready systems models. Variables as nodes, relationships as edges, scenario snapshots.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🏔️ 5yr / 90-Day Plan (Strategic Horizon)</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Identity → targets → 90-day actions, guided by observed practice evidence rather than personality labels.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>⚖️ Decision Journal</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Record reversibility, evidence quality, pre-mortems, confidence, and later separate process quality from outcome luck.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>📊 Scorecard (Discipline)</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Daily scorecard, communication tracker, energy tracker.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🎯 Goals</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Goals with milestones, progress tracking, filtering.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>✅ Tasks</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Priority, due date, optional start time, estimate, category, and inline conflict preview.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>📅 Calendar</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Monthly view with real recurrence, cross-source collisions, capacity, and open-slot suggestions.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>⏱️ Time Log</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Time tracking by category, subject/pathway, and Technical/Strategic/Leadership learning axis.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🔄 Habits</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Anchor + tiny version + optional preferred time and time budget.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>📝 Journal + Quality Loop</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">8 entry types, Reflection→Action, and Fix → Learn → Prevent reviews with verification tasks.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🤝 Network</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Contacts, follow-up dates, networking CRM.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>📋 Weekly Review</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">12 evidence-fed prompts, including decision pace, communication quality, and preventive-control verification.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>📈 Insights</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">10 analytics tabs, including Judgment and Execution views.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>◇ Adaptive Profile Lab</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Assessment scales, competing hypotheses, observed behavior, and prompt controls.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>⚙️ Settings</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Name, vision, data export/import/reset.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>📖 User Guide</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">You're here. Manual, science, profile, workflows.</span></div>
            <div style="padding:10px;background:var(--bg-tertiary);border-radius:8px;"><strong>🧪 Diagnostics</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">Contracts, interactions, navigation, cross-page workflow tests, and localStorage/IndexedDB lifecycle proof.</span></div>
        </div>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--accent);">
        <h3 style="margin-bottom:8px;">🔎 Where Is Everything?</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:10px;">Plain-English directory. Click any row to jump straight there. The same directory lives on Home.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2px 16px;">
            <div class="ux-dir-row" onclick="go('review')"><span class="ux-dir-q">plan my week</span><span class="ux-dir-path">Review → Weekly Review</span></div>
            <div class="ux-dir-row" onclick="go('pmptools')"><span class="ux-dir-q">study PMP</span><span class="ux-dir-path">Study → PMP Practice</span></div>
            <div class="ux-dir-row" onclick="go('tracker')"><span class="ux-dir-q">log study/work hours</span><span class="ux-dir-path">Plan → Time Log</span></div>
            <div class="ux-dir-row" onclick="go('protocol')"><span class="ux-dir-q">run my morning/evening routine</span><span class="ux-dir-path">Today → Morning / Evening</span></div>
            <div class="ux-dir-row" onclick="go('operator')"><span class="ux-dir-q">build my daily plan</span><span class="ux-dir-path">Today → Command Center</span></div>
            <div class="ux-dir-row" onclick="go('flashcards')"><span class="ux-dir-q">review flashcards</span><span class="ux-dir-path">Study → Flashcards</span></div>
            <div class="ux-dir-row" onclick="go('sciencecoach')"><span class="ux-dir-q">run an evidence-guided study cycle</span><span class="ux-dir-path">Study → Science Coach</span></div>
            <div class="ux-dir-row" onclick="go('capture')"><span class="ux-dir-q">process something I captured</span><span class="ux-dir-path">Knowledge → Capture Inbox</span></div>
            <div class="ux-dir-row" onclick="go('doctrine')"><span class="ux-dir-q">train from my books</span><span class="ux-dir-path">Knowledge → Doctrine Library</span></div>
            <div class="ux-dir-row" onclick="go('journal')"><span class="ux-dir-q">write a reflection</span><span class="ux-dir-path">Journal</span></div>
            <div class="ux-dir-row" onclick="go('journal');setTimeout(openQualityReviewModal,0)"><span class="ux-dir-q">review a mistake or recurring issue</span><span class="ux-dir-path">Journal → Quality Loop</span></div>
            <div class="ux-dir-row" onclick="go('decisions')"><span class="ux-dir-q">record a decision</span><span class="ux-dir-path">Strategy → Decision Journal</span></div>
            <div class="ux-dir-row" onclick="go('horizon')"><span class="ux-dir-q">work on my 90-day plan</span><span class="ux-dir-path">Strategy → 90-Day Plan</span></div>
            <div class="ux-dir-row" onclick="go('health')"><span class="ux-dir-q">check system health</span><span class="ux-dir-path">System → System Health</span></div>
            <div class="ux-dir-row" onclick="go('profilelab')"><span class="ux-dir-q">review or disable a personality prompt</span><span class="ux-dir-path">System → Profile Lab</span></div>
            <div class="ux-dir-row" onclick="go('settings')"><span class="ux-dir-q">back up my data</span><span class="ux-dir-path">System → Settings</span></div>
        </div>
    </div>

    <div class="card" style="border-left:3px solid var(--warning);">
        <h3 style="margin-bottom:8px;">⚡ Quick Start</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;">Don't try to use everything at once. Start with this daily loop:</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>Morning:</strong> Protocol → Dashboard → Focus Mode</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>Before committing:</strong> read the Schedule heads-up; resolve a collision, use a suggested time, or deliberately keep it.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>During the day:</strong> use <strong>＋ Capture</strong> whenever an idea would interrupt your current task. Process the inbox later.</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>Study:</strong> Science Coach → attempt before opening the source → Focus Mode → retrieve → compare and correct → schedule a follow-up</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>Evening:</strong> Discipline check-in → Journal entry (use Reflection→Action) → Check tomorrow's calendar</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;"><strong>Weekly:</strong> Weekly Review → Insights → Update Goals</p>
    </div>
</div>
`,

// ============================================================
// SECTION 2: FEATURES
// ============================================================
features: `
<div class="guide-section">
    <h2 style="font-size:1.3rem;margin-bottom:16px;">⚡ Feature Guide</h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Every feature explained—what it does, when to use it, and whether it comes from research evidence, a book framework, or a personal reflection preference.</p>

    <!-- DASHBOARD -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🏠 Home (Dashboard)</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Your command center. Shows streak, discipline score, hours/week, tasks due, SRS cards due, upcoming events, and learning progress.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Key cards:</strong></p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Adaptive Prompt</strong> — Rotates through active profile hypotheses and construction applications. Mark a prompt Useful or Not me; disabled and snoozed hypotheses stop appearing without disabling the underlying StudyOS tool.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Study Load Monitor</strong> — Counts study entries only. Four hours is a fatigue/quality check-in, not a universal maximum. It also shows how you classified recent practice.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Focus Mode launcher</strong> — One-click to start a 25-min focused session with environment check.</p>
            <p style="font-size:0.9rem;color:var(--accent);margin-top:8px;"><em>For your profile:</em> Your Analytical #2 loves data — the sparklines and stats feed that strength. But watch your Deliberative #1: don't spend 20 minutes analyzing the dashboard when you should be doing the work.</p>
        </div>
    </div>

    <!-- SCIENCE COACH -->
    <div class="card" style="margin-bottom:12px;border-left:3px solid #14b8a6;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🧭 Science Coach & Learning Cycle</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> A guided sequence for a real topic: optional readiness context → prediction or pretest → focused work → closed-book retrieval → confidence/outcome comparison → error correction → resume note → next retrieval.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Adaptation:</strong> choose 25, 45, 60, 90, or a custom block. The coach suggests a lighter, standard, or deeper plan from your self-ratings, but you remain in control and 90 minutes is not presented as a universal brain cycle.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Connection:</strong> completed Focus time carries the learning domain into Time Log. Saving a cycle can create a canonical retrieval Task, so it appears in Tasks, Calendar intelligence, and backups without a separate shadow record.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);"><strong>Evidence:</strong> open the built-in register for plain-language claims, confidence grades, limits, and primary research links. Health inputs are optional, educational, non-diagnostic, and never used to prescribe treatment.</p>
        </div>
    </div>

    <!-- COMMITMENT INTELLIGENCE -->
    <div class="card" style="margin-bottom:12px;border-left:3px solid var(--warning);">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>◇ Commitment Intelligence</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> a deterministic, on-device schedule checker. It detects event/event, event/task, task/task, and scheduled-habit overlap; short transition gaps; daily overload; and planned study beyond your personal quality guardrail.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>How:</strong> add a date, optional start time, and realistic estimate to a Task. Add a preferred time only for Habits that truly need a protected slot. Calendar recurrence now participates on every actual occurrence.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Where:</strong> the top-bar Schedule indicator, Dashboard load view, Task/Habit summaries, Calendar rail, and inline modal previews all read the same engine. Open the center to change day boundaries, capacity, study guardrail, buffer, and default estimates.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>Operating rule:</em> warnings support judgment; they do not replace it. “Save anyway” remains available because some overlaps are intentional.</p>
        </div>
    </div>

    <!-- PROTOCOL -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🌅 Morning/Evening Protocol</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Structured morning routine: set your #1 intention, rate energy (1-10), check protocol steps.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>When:</strong> First thing every morning. Takes 2-3 minutes.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Science:</strong> Implementation intentions specify what you will do, when, and where. Meta-analytic evidence shows a useful average effect, but results vary by goal and context; a priority without a cue is not yet an implementation intention.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>For your profile:</em> Your energy rating feeds the Energy Tracker on the Discipline page. Over time, you'll see patterns (Analytical #2 loves this). The intention prevents your Intellection #10 from wandering without direction.</p>
        </div>
    </div>

    <!-- FOCUS MODE -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🎯 Focus Mode (25-min Timer)</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Full-screen focus timer with three phases: Environment Check → Timer → Post-Session Rating.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Phase 1 — Environment Check:</strong> 4 checkboxes (phone away, water ready, clear goal, distractions off). Based on Annie Murphy Paul's <em>Extended Mind</em>: your environment is part of your cognitive system. And Clear's 1st Law: make it obvious.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Phase 2 — Timer:</strong> 25-minute Pomodoro. Logs automatically to time tracker.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Phase 3 — Quality Rating:</strong> Rate your session as Naive (autopilot), Purposeful (had a goal), or Deliberate (targeted weakness). Also rate your comfort zone: Comfort, Stretch, or Panic.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Science:</strong> Accumulated time alone does not guarantee expertise. Practice is more useful when it targets a defined skill, makes success criteria visible, and includes feedback and correction. The comfort-zone label is a reflection prompt: use performance and error quality—not discomfort alone—to set difficulty.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>For your profile:</em> Use the rating diagnostically, not as a quota. "Deliberate" should mean a specific weakness plus feedback or correction—not merely that the session felt hard.</p>
        </div>
    </div>

    <!-- LEARNING PATHS -->
    <div class="card" style="margin-bottom:12px;border-left:3px solid #8b5cf6;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>📖 Learning Paths & Curriculum Atlas</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> 33 capability modules across four tracks: Construction & Engineering Foundations, PMP 2026, McMaster BTech readiness, and SMR construction specialization.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Cornerstone sequence:</strong> Bird's Basic Engineering Mathematics → Engineering Mathematics → Higher Engineering Mathematics → building systems → sustainable materials and methods → surveying and layout → estimating → CEBOK professional formation.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>How progress works:</strong> Move from Fluency → Application → Integration → Evidence. A module is not merely “read”; it asks for practice and an artifact, explanation, or field demonstration.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Learning rule:</strong> Attempt before reviewing, inspect and classify errors, re-solve after spacing, then attach evidence or teach the idea. This combines retrieval, feedback, spacing, and transfer without treating any one technique as universally best.</p>
            <p style="font-size:0.85rem;color:var(--text-muted);">The app contains original curriculum mappings and chapter-level progress trackers; it does not reproduce textbook chapters.</p>
        </div>
    </div>

    <!-- STUDY LAB -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🧪 Study Techniques (Study Lab)</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> 6 evidence-based study techniques with built-in timers and guidance:</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Active Recall</strong> — Retrieve without looking, check the answer, and correct errors. It often outperforms restudy for durable retention.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Spaced Repetition</strong> — Retrieve again after a delay, shortening or expanding the next gap from performance.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Interleaving</strong> — Mix related problem types when discrimination matters. It can feel harder while improving later selection and transfer.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Feynman Technique</strong> — Explain without the source, identify missing links, and verify them. A fluent explanation can still be wrong.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Elaboration</strong> — Connect new info to what you already know. Ask "why?" and "how?"</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Generation Effect</strong> — Attempt or predict before seeing the answer, then study corrective feedback. Effort without correction is not the goal.</p>
            <p style="font-size:0.9rem;color:var(--accent);margin-top:8px;"><em>Personalization prompt:</em> If explanation and elaboration feel natural, compare them with delayed retrieval and problem solving. Keep the method that produces better evidence for this subject.</p>
        </div>
    </div>

    <!-- FLASHCARDS -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🎴 Flashcards (SRS)</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Performance-based spacing with four unambiguous outcomes: Again (wrong/blank), Hard (correct with effort or cues), Good, and Easy. The next interval responds to the card’s prior interval and ease; confidence is recorded before feedback for calibration.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Modes:</strong> Mixed Review alternates due categories when possible and is useful when selecting among related methods. Focused Review now truly restricts the queue to one chosen category and is useful while building a new procedure.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>When:</strong> Use the due queue regularly, but prioritize answer quality and correction over protecting a streak.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Science:</strong> Memory accessibility changes over time. Spacing retrieval across days can improve durable retention, but intervals should respond to performance rather than being treated as a perfect biological schedule.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>Calibration:</em> This score compares confidence with correct versus incorrect retrieval. Treat it as feedback, not a grade; inspect overconfident errors rather than optimizing the percentage.</p>
        </div>
    </div>

    <!-- PRO TOOLS -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🎓 PMP Practice (PMP-Specific)</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;">Specialized tools for PMP certification prep:</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>2026 Exam</strong> — Current July 2026 domain weights, approach mix, format, and study priorities.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Legacy ITTO Explorer</strong> — 49-process reference; ITTO detail is loaded for 28 processes.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>PMBOK 7 Reference</strong> — 12 principles retained as reference material; PMBOK 8 has 6 core principles and 7 performance domains.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Scenario Practice</strong> — 61 original cases covering all 26 July 2026 ECO tasks. Commit confidence before feedback, classify why an answer failed, capture transfer to your work, and let the weak-skill queue schedule another case.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>EVM Calculator</strong> — Enter BAC, PV, EV, AC → get CPI, SPI, EAC, ETC, VAC instantly.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Cross-Reference</strong> — Maps processes across knowledge areas and process groups.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Process Map</strong> — Visual 10×5 process group/knowledge area matrix.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>CEBOK Tracker</strong> — Construction industry competency tracking.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Estimating Tools</strong> — Construction estimating calculators.</p>
        </div>
    </div>

    <!-- CAPTURE -->
    <div class="card" style="margin-bottom:12px;border-left:3px solid var(--purple);">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>✦ Capture Inbox & Universal Search</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Capture:</strong> use the global ＋ Capture button for a thought, question, source, field observation, or meeting note. It lands in one inbox without forcing you to decide where it belongs while you are focused.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Process:</strong> turn a capture into a Knowledge note, Task, Flashcard draft, or Decision draft. StudyOS records the processed destination so you can reopen it.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Search:</strong> Ctrl/⌘K searches both navigation and live records. Results deep-open the exact editable item when the destination supports it.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>Operating rule:</em> capture immediately; process in a bounded daily or weekly review. An inbox is useful only when it is trusted and emptied.</p>
        </div>
    </div>

    <!-- KNOWLEDGE -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>📚 Knowledge Vault</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Four types of knowledge entries:</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>📝 Notes</strong> — Standard notes, formulas, key concepts. Your reference library.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>🔍 Critical Analysis</strong> — 10-question framework from "Asking the Right Questions." Forces deep evaluation of any claim or material.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>🧠 Mental Models</strong> — Your understanding of how systems work. Rated by confidence (1-5: Fuzzy → Teach). Has a "Test Yourself" button that hides the explanation so you can practice recall.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>📕 Book Deconstructions</strong> — Claims, models, critiques, and actions extracted from a source.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Evidence citations</strong> — Attach a registered source or URL, exact page/chapter/section locator, short excerpt or observation, your interpretation, and a verification state.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Links & backlinks</strong> — Enter exact related titles or write <code>[[Exact title]]</code>. Resolved links appear in both directions and become primary edges in Graph View.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Learning rationale:</strong> Experts often organize domain knowledge into useful patterns and representations. Building, retrieving, applying, and correcting a model can strengthen that organization. The confidence rating is a self-report; verify it with explanation and transfer.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>For your profile:</em> Your Context #4 strength means you naturally build mental models by understanding history and origins. Use the Models section aggressively — it's built for your thinking style.</p>
        </div>
    </div>

    <!-- DISCIPLINE -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>📊 Discipline Page</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Three tracking systems in one page:</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Daily Scorecard</strong> — Rate 5 disciplines (wake time, protocol, deep work, learning, health) from 0-10. Builds a heatmap and streak over time.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>💬 Communication Quality</strong> — Tracks both what you practiced and how the receiver-side loop closed: invited input, uninterrupted listening, paraphrasing, adaptation, confirmation, and written follow-up.</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>⚡ Energy Tracker</strong> — Rate energy 1-5, tag activities (deep work, meetings, admin, networking, etc.). Over 30 days, shows which activities charge vs drain you.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>Interpretation:</em> Communication #34 is a relative Clifton theme rank, while Caliper describes a direct style and marks Active Listening for focus. StudyOS trains observable behaviors instead of declaring a communication deficit.</p>
        </div>
    </div>

    <!-- HABITS -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🔄 Habits</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Habit tracker with recipe format. Each habit can include:</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Anchor/Cue</strong> — "After I [existing habit]..." (from BJ Fogg's Tiny Habits)</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Two-Minute Version</strong> — The gateway habit. Smallest possible version. (from Atomic Habits)</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Location</strong> — Where you do it. (Implementation intentions research)</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• <strong>Preferred Time + Budget</strong> — Optional. Use these only when the habit needs a real calendar boundary; otherwise leave it flexible.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Behavior-design rationale:</strong> An anchor supplies a repeatable cue, and a tiny version reduces the effort required to start. Neither guarantees automaticity; track whether the cue is noticed and the behavior is actually repeated in context.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>Example recipe:</em> "After I pour my morning coffee (anchor), I will review 1 flashcard (two-minute version) at the kitchen table (location)."</p>
        </div>
    </div>

    <!-- JOURNAL -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>📝 Journal</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Rich-text journal with 8 entry types: Reflection, Gratitude, Learning, Win, Idea, Goal Check, Incident, Mood Log.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Key feature — Reflection→Action Bridge:</strong> After saving a new entry, a prompt appears: "What's one concrete action from this reflection?" with a button to auto-create a task. This converts thinking into doing.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Personalization rationale:</strong> Your Persistent score is 26% (Principles You) and Activator is #24 (CliftonStrengths). Treat those results as prompts to test—not diagnoses. The bridge helps you observe whether converting reflection into one action improves follow-through.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>Adaptive rule:</em> Use Reflection→Action when the reflection implies a change. Use Fix → Learn → Prevent when an error or recurring issue needs a root cause, preventive control, owner, and verification date.</p>
        </div>
    </div>

    <!-- WEEKLY REVIEW -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>📋 Weekly Review</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> 12 evidence-fed review prompts, including:</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 🏆 Wins — Where did Analytical/Restorative create value?</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 💪 Challenges — Did you over-deliberate? (Deliberative blind spot)</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 📖 Learning — Feed your Learner #7</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 💬 Communication Quality — Did input, listening, adaptation, and confirmation close the loop?</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 🔧 Fix → Learn → Prevent — Which control still needs verification?</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• ⚡ Command & Leadership — Where did you lead?</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 🎯 Reflection→Action — When reflection implied a change, did one concrete action improve follow-through?</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 📋 Next Week — Include one communication challenge</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 🙏 Gratitude</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• ⚖️ Balance & Calibration — Review domain drift and confidence accuracy</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• ⚖️ Decision Quality — Capture and later review consequential decisions</p>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">• 🧭 Practice & Judgment — Review this week's accuracy, confidence calibration, recurring error type, and weakest applied skill</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>When:</em> Sunday evening or Monday morning. Non-negotiable weekly ritual.</p>
        </div>
    </div>

    <!-- NETWORK -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🤝 Network / Contacts</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Professional networking CRM. Track contacts with company, role, notes, follow-up dates. Dashboard shows pending follow-ups.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>For your profile:</em> Lower Clifton ranks for Woo and Communication coexist with Caliper Sociability and Empathy at 71 plus a natural expert-outreach result. Test whether specific, useful one-to-one contact fits better than broad networking. Use follow-up dates to close real commitments, not as a popularity score.</p>
        </div>
    </div>

    <!-- INSIGHTS -->
    <div class="card" style="margin-bottom:12px;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>📈 Insights</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Analytics dashboard with 10 tabs: Overview, Learning, Judgment, Calibration, Quality, Study, Discipline, Energy, Pomodoro, and Execution. Judgment shows skill evidence, recurring error types, the due queue, scenario-versus-decision calibration, and ECO exposure. Execution shows decision-guardrail use, preventive-control verification, receiver outcomes, and profile feedback. Composite scores are internal self-management indicators, not validated neuroscience measures.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>For your profile:</em> This page IS your Analytical #2 in action. Use it weekly to identify patterns. But set a time limit — you can spend hours here without it improving anything. 15 minutes max, then act on what you find.</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid var(--accent);">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🧠 Doctrine Library</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Your OS training layer. 16 modules derived from your book stack and construction sources. Each module has models, drills, templates, and an SRS pack builder.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>How to use:</strong> Set one module as Active — the Intelligence layer will recommend its drills via Next Move on the dashboard. Run drills and save captures to Journal. Use the Flashcard Pack builder to turn models into SRS cards.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>For your profile:</em> Learner #7 may make knowledge acquisition attractive. Doctrine channels it into structured drills, retrieval, and applied artifacts instead of assuming reading equals competence.</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #06b6d4;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🧩 Systems Lab (Framework Lab)</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Systems modeling tool. Build frameworks as graphs: variables (nodes), relationships (edges with polarity/strength/delay), and test them with scenario snapshots (predicted vs actual outcomes → calibration scoring).</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>How to use:</strong> Start by modeling a system you know well (e.g., project schedule drivers). Add 3-5 variables, map their relationships, then create a scenario to test your predictions against reality.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>For your profile:</em> Analytical #2 and Deliberative #1 suggest this may be attractive. Versioning and scenario comparison test whether the model actually improves prediction.</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #8b5cf6;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🏔️ 5yr / 90-Day Plan (Strategic Horizon)</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Three-tier strategic planning: 5-Year Identity (who you are becoming), 12-Month Targets (concrete outcomes), and a 90-Day War Plan (checkable actions). V29 adds an observed capability signal drawn from your actual scenario attempts, accuracy, calibration, and weak-skill queue.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>How to use:</strong> Set an identity and an evidence standard, then convert the live judgment signal into a measurable 12-month target or a bounded 90-day practice action. Treat the signal as performance evidence—not a fixed trait.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>For your profile:</em> Context #4 and Futuristic #8 may support long-horizon thinking. Caliper urgency makes the 90-day evidence and priority-freeze steps equally important.</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #f97316;">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>⚖️ Decision Journal</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Log high-leverage decisions with type, reversibility, evidence quality, stakeholders, options, assumptions, risks, pre-mortem, disconfirming evidence, deadline, and confidence. At review time, record process quality separately from the result, plus the dominant error and biggest surprise.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>How to use:</strong> Log a consequential decision before the outcome is known. State what would change your mind and set a 30/90-day review. Later, judge whether the process was sound even when luck made the outcome good or bad.</p>
            <p style="font-size:0.9rem;color:var(--accent);"><em>V31 guardrail:</em> Deliberative #1 and Analytical #2 coexist with very high Caliper urgency and risk-taking. The tool can recommend slowing down or deciding, based on impact, reversibility, evidence, standards, stakeholder input, and current pace.</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid var(--success);">
        <div class="guide-toggle" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <strong>🧪 Diagnostics</strong><span class="guide-arrow">▶</span>
        </div>
        <div style="display:none;margin-top:12px;">
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>What:</strong> Four escalating test levels. Health & Contracts verifies every registered key, canonical cross-page records, localStorage/IndexedDB parity, pages/functions, engines, runtime structure, the Science Coach evidence registry, source/link integrity, all 26 ECO tasks, queue validity, and calibration math. Interaction Audit inspects routes, tabs, controls, and cross-system bridges.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Active tests:</strong> Navigation Stress Test visits every route and tab and executes safe probes. Workflow Mutation Test creates disposable fixtures for Science Cycle → Retrieval Task plus Journal → Task → Calendar, Task + recurring Calendar + Habit conflict warnings, Learning Path → Time → Insights, Focus → Doctrine, Goals → Dashboard, Protocol → Energy, backup migration/reset, Doctrine, Capture, and Practice & Judgment. It restores and compares exact localStorage and IndexedDB snapshots afterward.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>Failure proof:</strong> The safe health suite briefly injects malformed storage and a duplicate protected ID, confirms the detectors fail red, and restores the original state immediately.</p>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;"><strong>When to use:</strong> Run the Core Suite after an upgrade. Use the guarded workflow test when a workflow feels broken or before trusting a major release.</p>
        </div>
    </div>
</div>
`,

// ============================================================
// SECTION 3: SCIENCE PLAYBOOK
// ============================================================
science: `
<div class="guide-section">
    <h2 style="font-size:1.3rem;margin-bottom:8px;">🧬 Science Playbook</h2>
    <p style="color:var(--text-muted);margin-bottom:12px;">Condensed principles from 9 books, mapped to StudyOS features. Book frameworks are design heuristics; empirical learning claims are worded separately and should be judged by outcomes.</p>
    <div class="card" style="margin-bottom:16px;background:var(--bg-tertiary);"><strong>Evidence standard:</strong> Prefer delayed retrieval, transfer, feedback, and calibration over feelings of fluency. No single hour target, technique ratio, or book framework guarantees learning.</div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #f97316;">
        <h3 style="margin-bottom:8px;">📕 Peak — Anders Ericsson</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>Deliberate Practice</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 1:</strong> Practice differs in quality. Naive (autopilot) → Purposeful (clear goal) → Deliberate (specific weakness, representation of good performance, and feedback/correction). Deliberate practice is especially valuable for improving known weaknesses.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 2:</strong> Mental representations are the building blocks. Experts don't just know more facts — they have richer mental models of how things connect.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 3:</strong> Elite performers often distribute only a few hours of their most effortful practice across a day. This is an observed training pattern, not a universal four-hour biological ceiling.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 4:</strong> Difficulty should be desirable and correctable. Familiar practice can consolidate; overload can prevent useful feedback. Adjust using performance, not discomfort alone.</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: Focus Mode quality rating, comfort zone tracker, study load monitor, mental models library</p>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #3b82f6;">
        <h3 style="margin-bottom:8px;">📕 Atomic Habits — James Clear</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>The Four Laws of Behavior Change</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>1st Law — Make It Obvious:</strong> Design your environment and specify the behavior, time, and place. Implementation intentions show a useful average effect, with results varying across goals and contexts.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>2nd Law — Make It Attractive:</strong> Pair habits with things you enjoy. Temptation bundling.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>3rd Law — Make It Easy:</strong> Two-Minute Rule — scale any habit down to 2 minutes. "Read for 30 minutes" becomes "open the book." Reduce friction.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>4th Law — Make It Satisfying:</strong> Habit tracking provides visual proof. "Don't break the chain." Never miss twice.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Identity-based habits:</strong> Don't focus on what you want to achieve. Focus on who you want to become. "I'm the type of person who studies every day."</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: Habit recipes (anchor+behavior+location), two-minute versions, discipline streaks, environment check, habit grid tracking</p>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #22c55e;">
        <h3 style="margin-bottom:8px;">📕 Tiny Habits — BJ Fogg</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>Behavior = Motivation × Ability × Prompt</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 1:</strong> Design around prompts, not motivation. Motivation is unreliable. Anchor your new behavior to an existing habit.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 2:</strong> Start tiny. Absurdly tiny. "After I brush my teeth, I will floss ONE tooth." Success builds momentum.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 3:</strong> Immediate celebration is Fogg's design technique for making a tiny action satisfying. StudyOS treats it as an optional reinforcement cue, not proof of faster neural wiring than repetition.</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: Habit anchor field ("After I..."), two-minute version field, streak celebrations</p>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #a855f7;">
        <h3 style="margin-bottom:8px;">📕 Hidden Potential — Adam Grant</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>Character Skills + Scaffolding + Deliberate Play</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 1:</strong> The book emphasizes proactive, prosocial, and disciplined behavior as developable contributors to progress. StudyOS does not treat them as universally stronger predictors than cognitive ability.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 2:</strong> Growth can require awkward attempts, but discomfort is not the learning mechanism. Familiar practice can consolidate; difficulty is useful when it remains correctable and produces feedback.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 3:</strong> Deliberate play — structured activities that are fun but designed for learning. Turn the grind into a game when possible.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 4:</strong> When stuck, take the roundabout path. Backtracking and detours often lead to breakthroughs.</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: Comfort zone rating (stretch > comfort), scenario practice as deliberate play, discipline scorecard as character skill tracker</p>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #ef4444;">
        <h3 style="margin-bottom:8px;">📕 Mastery — Robert Greene</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>Three Phases: Apprenticeship → Creative-Active → Mastery</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 1:</strong> Find your Life's Task — the intersection of deep inclination and the work that needs doing. You've found yours: Construction PM → SMR/Nuclear.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 2:</strong> The Apprenticeship phase requires deep observation, skill acquisition, and experimentation. You're here now. Resist impatience.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 3:</strong> Expertise develops through extended, domain-specific practice and feedback. There is no universal 20,000-hour threshold at which mastery or intuition automatically appears.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 4:</strong> Social intelligence is as important as technical skill. Practice observable receiver-side behaviors; a Clifton rank alone does not measure communication competence.</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: Learning pathways (structured apprenticeship), communication tracker (social intelligence), knowledge vault (building the mental library for mastery)</p>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #06b6d4;">
        <h3 style="margin-bottom:8px;">📕 Livewired — David Eagleman</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>The brain is livewired, not hardwired</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 1:</strong> The nervous system remains plastic: repeated, task-specific experience can change representations and performance.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 2:</strong> Sleep supports memory consolidation and next-day attention. It complements practice; it does not preserve every memory automatically.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 3:</strong> Some neural and performance changes can begin quickly, while stable expertise requires repeated practice and feedback over time.</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: study-load reflection guardrail, spaced review, and recovery tracking</p>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #84cc16;">
        <h3 style="margin-bottom:8px;">📕 The Brain That Changes Itself — Norman Doidge</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>Neuroplasticity through targeted exercise</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 1:</strong> Repeated co-activation can change synaptic strength, but behavior depends on networks, context, prior knowledge, and feedback—not a single slogan.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 2:</strong> Attention and active engagement usually matter for explicit learning; passive exposure alone is often insufficient for the transfer you need.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 3:</strong> Communication is a trainable skill. Practice specific behaviors—briefing, listening, explaining, and feedback—and evaluate them in real situations.</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: Focus Mode (attention setup), communication tracker (targeted behavioral practice), active recall (retrieval practice)</p>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #ec4899;">
        <h3 style="margin-bottom:8px;">📕 The Extended Mind — Annie Murphy Paul</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>Thinking happens outside the brain too</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 1:</strong> The environment changes the cues, tools, and distractions available to you. Treat workspace design as a testable support for attention, not a diagnosis of cognitive ability.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 2:</strong> Gesture and external representations can support spatial and explanatory thinking for some tasks. Test whether drawing, pointing, or moving actually improves your explanation or solution.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rule 3:</strong> Explaining can organize knowledge and expose gaps, especially when done from memory and checked against feedback. Uncorrected explanation can also rehearse errors.</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: Environment check (pre-focus), Feynman technique in Study Lab, mental models "Teach" confidence level</p>
    </div>

    <div class="card" style="margin-bottom:12px;border-left:3px solid #64748b;">
        <h3 style="margin-bottom:8px;">📕 The Laws of Human Nature — Robert Greene</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Core concept: <strong>18 laws of human behavior for social intelligence</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Most relevant laws for your profile:</strong></p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">• Law of Irrationality — Master your emotional self (your Composed 76% helps here)</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">• Law of Role-playing — Test your reading of motives instead of treating Empathy #30 as a capacity score</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">• Law of Defensiveness — Pair directness with invited input and receiver confirmation</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">• Law of Shortsightedness — Elevate perspective (feeds your Futuristic #8)</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">• Law of Fickleness — Make them want to follow you (leadership development)</p>
        <p style="font-size:0.85rem;color:var(--accent);">→ StudyOS features: Blind spot alerts, communication tracker, network/contacts CRM, weekly review Command & Leadership prompt</p>
    </div>
</div>
`,

// ============================================================
// SECTION 4: YOUR PROFILE
// ============================================================
profile: `
<div class="guide-section">
    <h2 style="font-size:1.3rem;margin-bottom:8px;">🧠 Your Personality Profile</h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Assessment results can suggest useful questions, but StudyOS keeps their scales separate and lets observed behavior and your feedback overrule every prompt.</p>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--success);">
        <h3 style="margin-bottom:10px;">V31 interpretation rules</h3>
        <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:5px;"><strong>CliftonStrengths:</strong> ranks your themes against your other themes. #34 does not mean a low population percentile or inability.</p>
        <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:5px;"><strong>Caliper:</strong> reports percentiles against a norm group; its competency pages also interpret one profile against a Processing Specialist job model.</p>
        <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:10px;"><strong>Three PDFs, two assessments:</strong> the Caliper Developmental Guide and Coaching Report are two views of the same June 2026 assessment, not two independent confirmations.</p>
        <button class="btn btn-primary btn-sm" onclick="go('profilelab')">Open Adaptive Profile Lab</button>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--accent);">
        <h3 style="margin-bottom:12px;">CliftonStrengths Top 10</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">1.</strong> Deliberative <span style="font-size:0.75rem;color:var(--text-muted);">(Executing)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">2.</strong> Analytical <span style="font-size:0.75rem;color:var(--text-muted);">(Strategic)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">3.</strong> Restorative <span style="font-size:0.75rem;color:var(--text-muted);">(Executing)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">4.</strong> Context <span style="font-size:0.75rem;color:var(--text-muted);">(Strategic)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">5.</strong> Command <span style="font-size:0.75rem;color:var(--text-muted);">(Influencing)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">6.</strong> Significance <span style="font-size:0.75rem;color:var(--text-muted);">(Influencing)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">7.</strong> Learner <span style="font-size:0.75rem;color:var(--text-muted);">(Strategic)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">8.</strong> Futuristic <span style="font-size:0.75rem;color:var(--text-muted);">(Strategic)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">9.</strong> Competition <span style="font-size:0.75rem;color:var(--text-muted);">(Influencing)</span></div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--accent);">10.</strong> Intellection <span style="font-size:0.75rem;color:var(--text-muted);">(Strategic)</span></div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:12px;"><strong>Pattern:</strong> Strategic Thinking is strongly represented in your top 10. Relationship Building themes are less represented there, but that is not a relationship-skill score; Caliper separately reports Empathy and Sociability at 71.</p>
    </div>

    <div class="card" style="margin-bottom:16px;">
        <h3 style="margin-bottom:12px;">Middle Ranks 11–29 (full ALL-34 report)</h3>
        <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.8;">11 Belief · 12 Relator · 13 Focus · 14 Harmony · 15 Individualization · 16 Responsibility · 17 Connectedness · 18 Input · 19 Consistency · 20 Self-Assurance · 21 Developer · 22 Strategic · 23 Discipline · <strong style="color:var(--warning);">24 Activator</strong> · 25 Positivity · 26 Ideation · 27 Arranger · 28 Maximizer · 29 Achiever</p>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;"><strong>Reading the middle carefully:</strong> these are relative theme ranks, not proof of behavior. Activator #24 does not establish start difficulty, and Discipline #23 does not establish low organization. Caliper reports Urgency 95, Self-Structure 76, and natural Time Management, so StudyOS tests task behavior before prompting.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--info);">
        <h3 style="margin-bottom:12px;">Lower-Ranked Clifton Themes — Not Deficiencies</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--info);">34.</strong> Communication</div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--info);">33.</strong> Woo</div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--info);">32.</strong> Includer</div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--info);">31.</strong> Adaptability</div>
            <div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;"><strong style="color:var(--info);">30.</strong> Empathy</div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:12px;">Communication is #34 in your profile, not a fixed capacity. The tracker turns it into specific, repeatable workplace behaviors that can improve with practice and feedback.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--warning);">
        <h3 style="margin-bottom:12px;">⚠️ Blind Spots (from CliftonStrengths report)</h3>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>🔍 Deliberative:</strong> You appear distant, unapproachable, slow to act. Others may see caution as lack of confidence.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>🧪 Analytical:</strong> Your questioning comes across as skepticism or distrust. People feel interrogated, not engaged.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>🔧 Restorative:</strong> You focus on what's broken, not what's working. Others feel criticized, not supported.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>⚡ Command:</strong> Your decisiveness can feel intimidating. Others may comply rather than truly agree.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>🏆 Competition:</strong> Comparing performance can create friction with teammates.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>🌟 Significance:</strong> You may mask vulnerability or seem overly controlled.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>🧠 Intellection:</strong> Deep thinking may make you seem disengaged or isolated.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>📜 Context / 📚 Learner / 🔭 Futuristic:</strong> Precedent over-anchoring; study as procrastination; vision talk displacing today's step.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Lower-rank practice checks — 🚀 Activator #24, 🌊 Adaptability #31, 🤝 Woo #33, ✉️ Communication #34:</strong> these generate questions to test against real behavior. They do not assert slow starts, fragility, relationship avoidance, or low communication capacity.</p>
        <p style="font-size:0.85rem;color:var(--accent);margin-top:8px;">V31: Dashboard prompts can be marked Useful, Not me, or inspected in Profile Lab. Behavior evidence and your feedback take priority.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid #9333ea;">
        <h3 style="margin-bottom:12px;">Talogy Caliper Profile — June 2026</h3>
        <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:6px;"><strong>High signals:</strong> Risk-Taking 97 · Urgency 95 · Aggressiveness 89 · Skepticism 88 · Self-Structure 76 · Empathy 71 · Sociability 71.</p>
        <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Job-model natural behaviors:</strong> concurrent-task management, balancing requests with priorities, investigating potential violations, and reaching experts.</p>
        <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Behaviors to test:</strong> evidence depth, long-term process integrity, mistake review, personal compliance with procedures, and active listening.</p>
        <p style="font-size:0.85rem;color:var(--accent);"><strong>Central V31 tension:</strong> Deliberative/Analytical preferences coexist with high urgency/risk-taking and lower measured thoroughness. Decision pace must therefore be context-sensitive in both directions.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--purple);">
        <h3 style="margin-bottom:12px;">Principles You Profile (Ray Dalio)</h3>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;"><strong>Archetype:</strong> Growth Seeker (primary) + Coach + Quiet Leader</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;"><strong>Deliberative:</strong> 90% • <strong>Tough:</strong> 93% • <strong>Composed:</strong> 76%</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;"><strong>Autonomous:</strong> 67% • <strong>Determined:</strong> 69% • <strong>Persistent:</strong> 26%</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;"><strong>Open-Minded:</strong> 97% • <strong>Growth-Seeking:</strong> 96% • <strong>Curious:</strong> 76%</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;"><strong>Status-Seeking:</strong> 13% (very low) • <strong>Extraverted:</strong> 48%</p>
        <p style="font-size:0.9rem;color:var(--warning);margin-top:8px;"><strong>Hypothesis, not diagnosis:</strong> the earlier Persistent score suggests testing follow-through. Caliper's natural Time Management and Self-Structure results provide counterevidence. Reflection→Action remains available without declaring one score the truth.</p>
    </div>

    <div class="card" style="border-left:3px solid var(--success);">
        <h3 style="margin-bottom:12px;">ISTP Profile — Natural Rhythms</h3>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>What charges you:</strong> Deep learning, hands-on problem-solving, solitary deep work, strategic systems analysis, building/creating systems, understanding risk.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>What drains you:</strong> Large group social events, continuous admin tasks, emotional conversations wanting sympathy, superficial networking, constant interruptions, routine tasks once mastered.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:6px;"><strong>Rhythm hypothesis:</strong> You may prefer quiet, complex, hands-on work and smaller groups. Test 25–90 minute blocks against recall quality, errors, energy, and interruption data instead of treating the profile as a biological schedule.</p>
        <p style="font-size:0.85rem;color:var(--accent);">The Energy Tracker on the Discipline page measures these patterns in real data over time.</p>
    </div>
</div>
`,

// ============================================================
// SECTION 5: WORKFLOWS
// ============================================================
workflows: `
<div class="guide-section">
    <h2 style="font-size:1.3rem;margin-bottom:8px;">🔄 Recommended Workflows</h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Optimized routines for different contexts. Each workflow tells you exactly which pages to use and in what order.</p>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--warning);">
        <h3 style="margin-bottom:12px;">◇ When StudyOS Warns About a Conflict</h3>
        <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p style="margin-bottom:6px;"><strong>1. Read the reason</strong> → Confirm which two commitments overlap and by how many minutes.</p>
            <p style="margin-bottom:6px;"><strong>2. Choose intentionally</strong> → Apply one of the clear-time suggestions, keep editing, open Calendar, or Save anyway.</p>
            <p style="margin-bottom:6px;"><strong>3. Check capacity</strong> → A date-only task cannot collide at an exact minute, but its estimate still counts toward the day.</p>
            <p style="margin-bottom:6px;"><strong>4. Protect context</strong> → If Focus, Study Lab, or Journal interrupts a current block, decide whether the switch is worth it.</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--accent);">
        <h3 style="margin-bottom:12px;">🌅 Daily Morning Routine (10 min)</h3>
        <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p style="margin-bottom:6px;"><strong>1. Protocol page</strong> → Set intention, rate energy, complete morning steps</p>
            <p style="margin-bottom:6px;"><strong>2. Dashboard</strong> → Read blind spot alert, check study load, review cards due</p>
            <p style="margin-bottom:6px;"><strong>3. Flashcards</strong> → Review all due cards (even just 5 min matters)</p>
            <p style="margin-bottom:6px;"><strong>4. Calendar</strong> → Quick check of today's events</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--purple);">
        <h3 style="margin-bottom:12px;">🧠 Deep Study Session (60-90 min)</h3>
        <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p style="margin-bottom:6px;"><strong>1. Dashboard</strong> → Click "Focus Mode" (environment check appears)</p>
            <p style="margin-bottom:6px;"><strong>2. Environment Check</strong> → Phone away, water ready, goal clear, distractions off</p>
            <p style="margin-bottom:6px;"><strong>3. Focus Timer</strong> → 25 min focused work. When done, rate quality + comfort zone.</p>
            <p style="margin-bottom:6px;"><strong>4. Study Lab</strong> → Use active recall or interleaving for the topic you just studied</p>
            <p style="margin-bottom:6px;"><strong>5. Repeat</strong> → Do 2-3 focus sessions. Around four high-effort hours, reassess fatigue, feedback quality, and whether another block is useful.</p>
            <p style="margin-bottom:6px;"><strong>6. Knowledge Vault</strong> → Create a mental model or note for key concepts learned</p>
        </div>
        <p style="font-size:0.85rem;color:var(--accent);margin-top:8px;">Target: leave each session with evidence—retrieval accuracy, corrected errors, or transfer to a new problem. Do not optimize the self-rating percentage.</p>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--success);">
        <h3 style="margin-bottom:12px;">🎓 PMP Prep Session (90 min)</h3>
        <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p style="margin-bottom:6px;"><strong>1. Learning Paths</strong> → Check current module, note what to study</p>
            <p style="margin-bottom:6px;"><strong>2. Focus Mode</strong> → Study the module content (25 min)</p>
            <p style="margin-bottom:6px;"><strong>3. PMP Practice → 2026 Exam</strong> → Check the current blueprint; use legacy ITTOs only as supporting reference</p>
            <p style="margin-bottom:6px;"><strong>4. PMP Practice → Scenarios</strong> → Commit confidence, answer, classify any error, then write how the rule transfers to a project</p>
            <p style="margin-bottom:6px;"><strong>5. Flashcards</strong> → Create cards for new concepts, review due cards</p>
            <p style="margin-bottom:6px;"><strong>6. Knowledge → Mental Model</strong> → Create a model for any process group or knowledge area you can now explain</p>
            <p style="margin-bottom:6px;"><strong>7. Learning Paths</strong> → Log time against the module</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid var(--warning);">
        <h3 style="margin-bottom:12px;">🌙 Daily Evening Wrap-up (10 min)</h3>
        <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p style="margin-bottom:6px;"><strong>1. Discipline</strong> → Rate all 5 disciplines, check communication activities, log energy</p>
            <p style="margin-bottom:6px;"><strong>2. Journal</strong> → Write a reflection. USE the Reflection→Action bridge when prompted.</p>
            <p style="margin-bottom:6px;"><strong>3. Tasks</strong> → Check tomorrow's tasks, create any new ones</p>
            <p style="margin-bottom:6px;"><strong>4. Habits</strong> → Check off today's habits</p>
        </div>
    </div>

    <div class="card" style="margin-bottom:16px;border-left:3px solid #f97316;">
        <h3 style="margin-bottom:12px;">📋 Weekly Review Ritual (30 min, Sunday)</h3>
        <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p style="margin-bottom:6px;"><strong>1. Insights</strong> → Review all tabs (15 min max). Note patterns.</p>
            <p style="margin-bottom:6px;"><strong>2. Weekly Review</strong> → Complete all 12 prompts, including Practice & Judgment and Fix → Learn → Prevent</p>
            <p style="margin-bottom:6px;"><strong>3. Decision Journal</strong> → Check for reviews due. Rate past decisions.</p>
            <p style="margin-bottom:6px;"><strong>4. 5yr / 90-Day Plan</strong> → Check off 90-day actions completed. Note days remaining.</p>
            <p style="margin-bottom:6px;"><strong>5. Goals</strong> → Update milestones, check progress</p>
            <p style="margin-bottom:6px;"><strong>6. Network</strong> → Check follow-ups due this week</p>
            <p style="margin-bottom:6px;"><strong>7. Calendar</strong> → Plan next week's events and study blocks</p>
        </div>
    </div>

    <div class="card" style="border-left:3px solid var(--accent);">
        <h3 style="margin-bottom:12px;">🧠 Doctrine Training Session (30 min)</h3>
        <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p style="margin-bottom:6px;"><strong>1. Doctrine</strong> → Set your active module for this week's focus</p>
            <p style="margin-bottom:6px;"><strong>2. Run Drill</strong> → Open the primary drill, complete it, save capture to Journal</p>
            <p style="margin-bottom:6px;"><strong>3. SRS Pack</strong> → Create flashcards from the module's models and drill insights</p>
            <p style="margin-bottom:6px;"><strong>4. Framework Lab</strong> → If the module maps to a system, create or update a framework</p>
            <p style="margin-bottom:6px;"><strong>5. Dashboard</strong> → Next Move will now recommend doctrine-aligned actions</p>
        </div>
    </div>

    <div class="card" style="border-left:3px solid #ec4899;">
        <h3 style="margin-bottom:12px;">🤝 Networking Session (20 min)</h3>
        <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p style="margin-bottom:6px;"><strong>1. Network</strong> → Review contacts with upcoming follow-ups</p>
            <p style="margin-bottom:6px;"><strong>2. Write outreach</strong> → LinkedIn message or email (check "wrote professional email" on comm tracker)</p>
            <p style="margin-bottom:6px;"><strong>3. Discipline</strong> → Log communication activities</p>
            <p style="margin-bottom:6px;"><strong>4. Network</strong> → Update follow-up dates for contacts you reached out to</p>
        </div>
        <p style="font-size:0.85rem;color:var(--accent);margin-top:8px;">Use a specific work question, listen for the constraint you did not know, and record what changed. Purpose-led expert contact fits the Caliper evidence better than assuming broad networking avoidance.</p>
    </div>
</div>
`
    };
    return content[section] || '<div class="empty">Section not found.</div>';
}
