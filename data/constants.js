// ==================== PMP 49 PROCESSES ====================
const PMP_KNOWLEDGE_AREAS = [
    { id: 'integration', name: 'Integration', color: '#8b5cf6', processes: [
        { num: '4.1', name: 'Develop Project Charter' },
        { num: '4.2', name: 'Develop Project Management Plan' },
        { num: '4.3', name: 'Direct and Manage Project Work' },
        { num: '4.4', name: 'Manage Project Knowledge' },
        { num: '4.5', name: 'Monitor and Control Project Work' },
        { num: '4.6', name: 'Perform Integrated Change Control' },
        { num: '4.7', name: 'Close Project or Phase' }
    ]},
    { id: 'scope', name: 'Scope', color: '#3b82f6', processes: [
        { num: '5.1', name: 'Plan Scope Management' },
        { num: '5.2', name: 'Collect Requirements' },
        { num: '5.3', name: 'Define Scope' },
        { num: '5.4', name: 'Create WBS' },
        { num: '5.5', name: 'Validate Scope' },
        { num: '5.6', name: 'Control Scope' }
    ]},
    { id: 'schedule', name: 'Schedule', color: '#06b6d4', processes: [
        { num: '6.1', name: 'Plan Schedule Management' },
        { num: '6.2', name: 'Define Activities' },
        { num: '6.3', name: 'Sequence Activities' },
        { num: '6.4', name: 'Estimate Activity Durations' },
        { num: '6.5', name: 'Develop Schedule' },
        { num: '6.6', name: 'Control Schedule' }
    ]},
    { id: 'cost', name: 'Cost', color: '#10b981', processes: [
        { num: '7.1', name: 'Plan Cost Management' },
        { num: '7.2', name: 'Estimate Costs' },
        { num: '7.3', name: 'Determine Budget' },
        { num: '7.4', name: 'Control Costs' }
    ]},
    { id: 'quality', name: 'Quality', color: '#22c55e', processes: [
        { num: '8.1', name: 'Plan Quality Management' },
        { num: '8.2', name: 'Manage Quality' },
        { num: '8.3', name: 'Control Quality' }
    ]},
    { id: 'resource', name: 'Resource', color: '#84cc16', processes: [
        { num: '9.1', name: 'Plan Resource Management' },
        { num: '9.2', name: 'Estimate Activity Resources' },
        { num: '9.3', name: 'Acquire Resources' },
        { num: '9.4', name: 'Develop Team' },
        { num: '9.5', name: 'Manage Team' },
        { num: '9.6', name: 'Control Resources' }
    ]},
    { id: 'communications', name: 'Comms', color: '#eab308', processes: [
        { num: '10.1', name: 'Plan Communications Management' },
        { num: '10.2', name: 'Manage Communications' },
        { num: '10.3', name: 'Monitor Communications' }
    ]},
    { id: 'risk', name: 'Risk', color: '#f97316', processes: [
        { num: '11.1', name: 'Plan Risk Management' },
        { num: '11.2', name: 'Identify Risks' },
        { num: '11.3', name: 'Perform Qualitative Risk Analysis' },
        { num: '11.4', name: 'Perform Quantitative Risk Analysis' },
        { num: '11.5', name: 'Plan Risk Responses' },
        { num: '11.6', name: 'Implement Risk Responses' },
        { num: '11.7', name: 'Monitor Risks' }
    ]},
    { id: 'procurement', name: 'Procurement', color: '#ef4444', processes: [
        { num: '12.1', name: 'Plan Procurement Management' },
        { num: '12.2', name: 'Conduct Procurements' },
        { num: '12.3', name: 'Control Procurements' }
    ]},
    { id: 'stakeholder', name: 'Stakeholder', color: '#ec4899', processes: [
        { num: '13.1', name: 'Identify Stakeholders' },
        { num: '13.2', name: 'Plan Stakeholder Engagement' },
        { num: '13.3', name: 'Manage Stakeholder Engagement' },
        { num: '13.4', name: 'Monitor Stakeholder Engagement' }
    ]}
];

// ==================== WISDOM & PRINCIPLES ====================
const WISDOM = [
    { quote: "The successful warrior is the average man, with laser-like focus.", source: "Bruce Lee" },
    { quote: "We are what we repeatedly do. Excellence is not an act, but a habit.", source: "Aristotle" },
    { quote: "The impediment to action advances action. What stands in the way becomes the way.", source: "Marcus Aurelius" },
    { quote: "Discipline equals freedom.", source: "Jocko Willink" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", source: "Chinese Proverb" },
    { quote: "Hard choices, easy life. Easy choices, hard life.", source: "Jerzy Gregorek" },
    { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", source: "James Clear" },
    { quote: "The man who moves a mountain begins by carrying away small stones.", source: "Confucius" },
    { quote: "Be not afraid of going slowly, be afraid only of standing still.", source: "Chinese Proverb" },
    { quote: "First, master the fundamentals.", source: "Larry Bird" },
    { quote: "A project manager's job is not to know everything, but to know who knows.", source: "Construction PM Wisdom" },
    { quote: "In nuclear, there are no small mistakes. Attention to detail is not optional.", source: "Nuclear Industry Principle" },
    { quote: "Schedule drives budget. Understand the schedule, control the project.", source: "Construction Management" },
    { quote: "The amateur practices until they get it right. The professional practices until they can't get it wrong.", source: "Unknown" },
    { quote: "Think in decades. Act in days.", source: "Shreyas Doshi" }
];

const TIPS = {
    dashboard: [
        { type: 'info', title: 'Morning Routine', text: 'Start each day with the Protocol. It takes 5 minutes and sets your direction.' },
        { type: 'info', title: 'Compound Effect', text: '1% better daily = 37x better in a year. Small consistent actions beat sporadic big efforts.' }
    ],
    protocol: [
        { type: 'info', title: 'Why This Matters', text: 'A short morning cue can reduce decision friction. Keep the routine useful and adaptable to the day.' },
        { type: 'success', title: 'Your Strength', text: 'Deliberative (#1): Use this time to think carefully about what truly matters today.' }
    ],
    discipline: [
        { type: 'info', title: 'The Scorecard', text: 'Rate yourself honestly. The goal isn\'t perfection—it\'s awareness and gradual improvement.' },
        { type: 'warning', title: 'Consistency > Intensity', text: 'A 70% day every day beats a 100% day once a week.' }
    ],
    learn: [
        { type: 'info', title: 'Active Recall', text: 'Don\'t just read. Test yourself. Write from memory. Explain concepts out loud.' },
        { type: 'info', title: 'Spaced Repetition', text: 'Review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month.' }
    ],
    goals: [
        { type: 'info', title: 'Break It Down', text: 'If a goal feels overwhelming, it\'s not broken down enough. Add more milestones.' },
        { type: 'success', title: 'Your Strength', text: 'Analytical (#2): Use this to identify the critical path to each goal.' }
    ],
    tasks: [
        { type: 'info', title: 'Eat the Frog', text: 'Do your most important (often hardest) task first when energy is highest.' },
        { type: 'warning', title: 'Urgent vs Important', text: 'Important tasks build your future. Urgent tasks manage the present. Prioritize important.' }
    ],
    tracker: [
        { type: 'info', title: 'What Gets Measured', text: 'Tracking time reveals truth. You\'ll discover where hours actually go.' },
        { type: 'info', title: 'Deep Work Guardrail', text: 'Use focused blocks that fit your workday. Around 4 hours is a reflection point, not a quota or universal limit.' }
    ],
    habits: [
        { type: 'info', title: 'Habit Stacking', text: 'Attach new habits to existing ones: "After I [CURRENT HABIT], I will [NEW HABIT]."' },
        { type: 'info', title: 'Never Miss Twice', text: 'Missing once is an accident. Missing twice is the start of a new (bad) habit.' }
    ],
    journal: [
        { type: 'info', title: 'Reflection Compounds', text: 'Weekly reviews are where real learning happens. Patterns become visible.' },
        { type: 'success', title: 'Your Strength', text: 'Context (#4): Use journaling to see how past patterns inform future decisions.' }
    ]
};

// ==================== DISCIPLINE SYSTEM ====================
const DISCIPLINES = [
    { id: 'wake', name: 'Wake on time', desc: 'Started day at planned time', max: 10 },
    { id: 'protocol', name: 'Morning Protocol', desc: 'Completed morning routine', max: 10 },
    { id: 'focus', name: 'Deep Work', desc: '3+ hours focused study/work', max: 10 },
    { id: 'learn', name: 'Learning', desc: 'Studied something new', max: 10 },
    { id: 'health', name: 'Health', desc: 'Exercise, nutrition, sleep', max: 10 }
];

// ==================== CLIFTONSTRENGTHS: COMMUNICATION ACTIVITIES ====================
const COMM_ACTIVITIES = [
    { id: 'presented',     icon: '🎤', name: 'Presented / spoke to a group' },
    { id: 'explained',     icon: '🧑‍🏫', name: 'Explained a technical concept to someone' },
    { id: 'wrote_email',   icon: '✉️',  name: 'Wrote a professional email or message' },
    { id: 'asked_question',icon: '❓', name: 'Asked a thoughtful question in a meeting' },
    { id: 'gave_feedback', icon: '💬', name: 'Gave someone constructive feedback' },
    { id: 'small_talk',    icon: '🤝', name: 'Initiated casual conversation (small talk)' },
    { id: 'phone_call',    icon: '📞', name: 'Made a professional phone call' },
    { id: 'linkedin',      icon: '💼', name: 'Wrote a LinkedIn post or outreach message' }
];

// Communication quality is distinct from communication volume. These
// behaviors close the loop with the receiver and are the V31 deliberate-
// practice targets suggested by the combined CliftonStrengths/Caliper review.
const COMM_QUALITY_BEHAVIORS = [
    { id: 'invited_input', icon: '↪', name: 'Asked for input before giving my conclusion' },
    { id: 'listened', icon: '◉', name: 'Let the other person finish without interrupting' },
    { id: 'paraphrased', icon: '↺', name: 'Paraphrased what I heard before responding' },
    { id: 'adapted', icon: '◇', name: 'Adapted the message to the receiver' },
    { id: 'closed_loop', icon: '✓', name: 'Confirmed shared understanding and next action' },
    { id: 'written_followup', icon: '□', name: 'Confirmed an important verbal decision in writing' }
];
window.COMM_QUALITY_BEHAVIORS = COMM_QUALITY_BEHAVIORS;

// ==================== CLIFTONSTRENGTHS: BLIND SPOT ALERTS (V18 — full-profile, 14 cards) ====================
// High strengths (overuse risks) + low strengths (counter-drills). Rotates daily on the Dashboard.
// Fields: alert = the blind spot · why = why it matters for construction PM · action = 2-minute counter-action · field = jobsite application prompt
const BLIND_SPOTS = [
    { strength: 'Decision pace', rank: 1, icon: '⚖', hypothesisId: 'decision_dual_mode',
      alert: 'Your two risks are opposite: over-deliberating when a choice is reversible, or moving too fast when urgency rises.',
      why: 'Your reports combine Deliberative #1 with very high Caliper urgency and risk-taking. The consequence and reversibility—not a personality label—should set the pace.',
      action: 'Open the Decision Journal. If it is reversible with sufficient evidence, decide; if it is high-impact with weak evidence, slow down.',
      field: 'On site: state whether the call is reversible, what standard applies, and when the remaining uncertainty will be checked.',
      color: '#f97316' },
    { strength: 'Evidence depth', rank: 2, icon: '🧪', hypothesisId: 'evidence_depth',
      alert: 'Enjoying analysis does not guarantee that the evidence search was complete.',
      why: 'CliftonStrengths highlights Analytical while Caliper flags convenient sources, low thoroughness, and premature conclusions as behaviors to test.',
      action: 'Name the governing source, one independent check, and the fact that would change your mind.',
      field: 'Next RFI or inspection call: separate the observed fact, the applicable requirement, and your interpretation.',
      color: '#3b82f6' },
    { strength: 'Repair → prevention', rank: 3, icon: '🔧', hypothesisId: 'repair_prevent',
      alert: 'Fixing the immediate problem can feel complete before the recurrence control is built.',
      why: 'Restorative supports live troubleshooting; Caliper separately flags formal mistake review and process integrity as development targets.',
      action: 'For one repaired issue, record the root cause, prevention owner, and verification date in the Quality Loop.',
      field: 'After the fix, ask: what will make this impossible—or quickly detectable—next time?',
      color: '#22c55e' },
    { strength: 'Context', rank: 4, icon: '📜',
      alert: 'You might over-anchor on how it was done before.',
      why: 'Precedent is a starting point, not an answer — new specs, methods, and contract terms change the right move.',
      action: 'For one active task, ask out loud: "What is different this time?" Write the one difference that changes the plan.',
      field: 'Compare a current detail against how your last project did it. If you can\'t name a difference, you haven\'t looked hard enough.',
      color: '#94a3b8' },
    { strength: 'Command', rank: 5, icon: '⚡', hypothesisId: 'direct_listening',
      alert: 'Your decisiveness might feel intimidating to others.',
      why: 'Intimidated crews comply instead of agreeing — and silent compliance hides risk until it\'s expensive.',
      action: 'Ask for someone else\'s input BEFORE sharing your conclusion today.',
      field: 'In the next coordination meeting, poll two foremen for their read before giving direction.',
      color: '#a855f7' },
    { strength: 'Significance', rank: 6, icon: '🌟',
      alert: 'You might mask vulnerability or seem overly controlled.',
      why: 'A PM who can\'t say "I don\'t know" ships errors downstream. Credibility on site comes from owned unknowns, not polish.',
      action: 'Ask someone for help with something small today. It builds trust.',
      field: 'Admit one unknown openly in your next meeting — then assign yourself the follow-up with a date.',
      color: '#ef4444' },
    { strength: 'Learner', rank: 7, icon: '📚',
      alert: 'Learning might quietly become your form of procrastination.',
      why: 'Another chapter finished is not another deliverable finished. Careers advance on applied output.',
      action: 'Convert 15 minutes of today\'s study into one applied artifact (checklist, template, calculation, note to file).',
      field: 'Take today\'s study topic and apply it to a live project document before end of day.',
      color: '#10b981' },
    { strength: 'Futuristic', rank: 8, icon: '🔭',
      alert: 'Vision talk might be displacing today\'s concrete step.',
      why: 'The 5-year SMR vision doesn\'t pour Friday\'s slab. The path is built from unglamorous daily increments.',
      action: 'Pick tomorrow\'s single concrete step toward the long-term goal. Schedule it.',
      field: 'Link one 90-Day War Plan action to something you will physically do on a project this week.',
      color: '#06b6d4' },
    { strength: 'Competition', rank: 9, icon: '🏆',
      alert: 'Comparing performance might create friction with teammates.',
      why: 'Outperforming peers is not the same as leading them — the next role requires people to want to work for you.',
      action: 'Celebrate someone else\'s win today without comparing it to your own.',
      field: 'Credit another coordinator\'s solution by name in front of the PM.',
      color: '#eab308' },
    { strength: 'Intellection', rank: 10, icon: '🧠',
      alert: 'Deep thinking might make you seem disengaged or isolated.',
      why: 'Field teams trust visible presence. Thinking that happens only in your head earns you zero influence.',
      action: 'Share one interesting thought or idea with someone today — out loud, not in writing.',
      field: 'During the site walk, voice one observation in the moment instead of saving it for an email.',
      color: '#8b5cf6' },
    { strength: 'Start-friction check', rank: 24, icon: '🚀', hypothesisId: 'start_friction',
      alert: 'Activator #24 is not proof that starting is a weakness. Check the task evidence before applying a start prompt.',
      why: 'Caliper reports very high urgency and natural time management, so initiation may vary by task rather than define you globally.',
      action: 'If a meaningful task has remained untouched, use a two-minute start. If not, dismiss this hypothesis in Profile Lab.',
      field: 'Use the prompt only on an actually stalled RFI, notice, or change item—not as a permanent identity label.',
      color: '#f43f5e' },
    { strength: 'Change-response check', rank: 31, icon: '🌊', hypothesisId: 'change_flexibility',
      alert: 'A lower-ranked Adaptability theme is a hypothesis about preference, not proof that change destabilizes you.',
      why: 'Use actual schedule changes, recovery time, and stakeholder feedback to decide whether this needs practice.',
      action: 'After the next plan change, note how long re-planning took and whether you considered a credible alternative.',
      field: 'If the schedule slips, produce a recovery micro-plan and compare it with the original before judging the response.',
      color: '#0ea5e9' },
    { strength: 'Relationship approach', rank: 33, icon: '🤝', hypothesisId: 'expert_network',
      alert: 'Woo #33 does not mean low sociability or relationship capacity.',
      why: 'Caliper reports sociability and empathy at the 71st percentile and identifies expert outreach as a natural behavior. Structured, purpose-led connection may fit better than broad networking.',
      action: 'Ask one relevant expert a specific question, then record what changed in your understanding.',
      field: 'Introduce yourself to a foreman or inspector through a real work question and listen for the constraint you did not know.',
      color: '#d946ef' },
    { strength: 'Communication loop', rank: 34, icon: '✉️', hypothesisId: 'direct_listening',
      alert: 'Communication #34 is a relative theme rank—not evidence that you cannot communicate.',
      why: 'Caliper describes a direct, candid style; the more useful practice target is listening, adaptation, and confirming what the receiver understood.',
      action: 'Ask for input, paraphrase it, then close one decision with what / why / next.',
      field: 'After verbal direction, confirm it in writing and ask the receiver to flag any mismatch before work proceeds.',
      color: '#f59e0b' }
];

// ==================== ENERGY MANAGEMENT ACTIVITIES ====================
const ENERGY_ACTIVITIES = [
    { id: 'deep_work',   icon: '🧠', name: 'Deep Work',           type: 'charge' },
    { id: 'meetings',    icon: '👥', name: 'Meetings',             type: 'drain'  },
    { id: 'hands_on',   icon: '🔧', name: 'Hands-On Work',        type: 'charge' },
    { id: 'admin',       icon: '📋', name: 'Admin / Paperwork',    type: 'drain'  },
    { id: 'networking',  icon: '🤝', name: 'Networking',           type: 'drain'  },
    { id: 'studying',    icon: '📖', name: 'Studying',             type: 'charge' },
    { id: 'mentorship',  icon: '🎓', name: '1-on-1 Mentorship',    type: 'charge' },
    { id: 'site_work',   icon: '🏗️', name: 'Site Work',            type: 'charge' },
    { id: 'presenting',  icon: '🎤', name: 'Presenting',           type: 'drain'  },
    { id: 'creative',    icon: '💡', name: 'Creative/Building',    type: 'charge' }
];

// ==================== TEXTBOOK-GROUNDED CURRICULUM ====================
// These are original study maps built from the structure of the user's eight
// distinct cornerstone texts. They intentionally store no textbook prose.
const CURRICULUM_ATLAS = [
    { id: 'bird-basic-math', rung: '01', lane: 'Mathematics', title: "Bird's Basic Engineering Mathematics", role: 'Fluency before abstraction', coverage: 'Arithmetic, units, algebra, graphs, trigonometry, mensuration, vectors, statistics, introductory calculus', practice: 'Worked examples → closed-book problems → mixed retrieval', accent: 'var(--accent)' },
    { id: 'bird-eng-math', rung: '02', lane: 'Mathematics', title: "Bird's Engineering Mathematics", role: 'Technician-to-engineer bridge', coverage: 'Functions, complex numbers, vectors, differentiation, integration, matrices, differential equations, statistics', practice: 'Interleave symbolic, graphical, and applied problems', accent: 'var(--info)' },
    { id: 'bird-math', rung: '03', lane: 'Mathematics', title: "Bird's Higher Engineering Mathematics", role: 'Advanced analysis', coverage: 'Multivariable calculus, ODE/PDE, Laplace and Fourier methods, numerical methods, probability and inference', practice: 'Select methods from mixed problem sets; explain assumptions', accent: 'var(--purple)' },
    { id: 'bcp-systems', rung: '04', lane: 'Building science', title: 'Building Construction: Principles, Materials, and Systems', role: 'Principles before assemblies', coverage: 'Delivery, codes, loads, structural behavior, heat, air, moisture, fire, acoustics, joints, sustainability, systems', practice: 'Predict failure modes at interfaces; draw system sections from memory', accent: 'var(--success)' },
    { id: 'kultermann-cmmt', rung: '05', lane: 'Construction', title: 'Construction Materials, Methods, and Techniques', role: 'Material and method literacy', coverage: 'Site and soils, concrete, masonry, metals, wood, envelope, finishes, specialties, MEP and conveying systems', practice: 'Material cards + installation sequence + inspection hold points', accent: 'var(--warning)' },
    { id: 'surveying', rung: '06', lane: 'Field application', title: 'Surveying with Construction Applications', role: 'Control → layout → verification', coverage: 'Leveling, distance, total stations, traverses, positioning, geomatics, control, construction layout, quantity and as-built surveys', practice: 'Field-note calculations, closure checks, layout scenarios', accent: 'var(--accent)' },
    { id: 'delpico-estimating', rung: '07', lane: 'Commercial practice', title: 'Estimating Building Costs', role: 'Documents → quantity → price → risk', coverage: 'Drawings/specifications, takeoff, unit-price elements, CSI divisions, sitework, MEP, profit, contingency, digital and conceptual estimating', practice: 'Take off one assembly; price it; reconcile scope and uncertainty', accent: 'var(--warning)' },
    { id: 'cebok3', rung: '08', lane: 'Professional formation', title: 'Civil Engineering Body of Knowledge, 3rd ed.', role: 'Competency and evidence map', coverage: '21 foundational, engineering-fundamentals, technical, and professional outcomes using cognitive and affective development', practice: 'Attach work evidence to outcomes; identify the next mentored stretch assignment', accent: 'var(--success)' }
];
window.CURRICULUM_ATLAS = CURRICULUM_ATLAS;

// ==================== LEARNING PATHWAYS ====================
// Existing module IDs are preserved where possible so V26 progress carries
// forward. The new f* modules are additive.
const PATHWAYS = {
    foundations: {
        name: 'Construction & Engineering Foundations',
        shortName: 'Foundations',
        icon: '🏗️',
        desc: 'A progressive curriculum built from your eight cornerstone textbooks',
        modules: [
            { id: 'f1', stage: 'Math I', name: 'Engineering Math Fluency', topics: ['Units and engineering notation', 'Algebra and formulae', 'Graphs and trigonometry', 'Areas, volumes, and vectors'], hours: 24, sourceIds: ['bird-basic-math'], practice: 'Solve short sets without notes, classify each error, then re-solve after spacing.', evidence: '80%+ on a mixed closed-book set and a one-page formula map.' },
            { id: 'f2', stage: 'Math II', name: 'Engineering Math Methods', topics: ['Functions and complex numbers', 'Vectors and matrices', 'Differentiation and integration', 'Differential equations and statistics'], hours: 36, sourceIds: ['bird-eng-math'], practice: 'Mix problem types so method selection—not chapter order—drives the solution.', evidence: 'Explain why a method applies, solve it, and check units/limiting behavior.' },
            { id: 'f3', stage: 'Math III', name: 'Higher Mathematical Analysis', topics: ['Multivariable calculus', 'ODE/PDE methods', 'Laplace and Fourier methods', 'Numerical methods and inference'], hours: 42, sourceIds: ['bird-math'], practice: 'Use pretesting, mixed derivations, and computational checks after manual setup.', evidence: 'Complete an unfamiliar applied problem and defend assumptions and error bounds.' },
            { id: 'f4', stage: 'Science', name: 'Building Science & Structural Principles', topics: ['Codes and loads', 'Material structural behavior', 'Heat, air, moisture, and fire', 'Acoustics, joints, and sustainability'], hours: 30, sourceIds: ['bcp-systems'], practice: 'Sketch load and environmental control layers; predict failures at interfaces.', evidence: 'Produce a system brief with loads, control layers, risks, and inspection points.' },
            { id: 'f5', stage: 'Materials', name: 'Materials, Methods & Assemblies', topics: ['Site, soils, and foundations', 'Concrete, masonry, metals, and wood', 'Envelope and interior systems', 'MEP and special construction'], hours: 36, sourceIds: ['kultermann-cmmt', 'bcp-systems'], practice: 'Compare material properties, installation sequence, standards, and QA checks.', evidence: 'Create four material cards and teach one complete assembly from substrate outward.' },
            { id: 'f6', stage: 'Field', name: 'Surveying, Control & Layout', topics: ['Leveling and distance', 'Total stations and traverses', 'Positioning, geomatics, and control', 'Layout, quantities, and as-builts'], hours: 28, sourceIds: ['surveying'], practice: 'Calculate closures and corrections before checking; rehearse layout decisions as scenarios.', evidence: 'Complete a field-note package with independent arithmetic and reasonableness checks.' },
            { id: 'f7', stage: 'Cost', name: 'Quantity Takeoff & Estimating', topics: ['Drawing/specification scope', 'Measurement and waste', 'Labor, equipment, overhead, and profit', 'Contingency and conceptual estimating'], hours: 32, sourceIds: ['delpico-estimating', 'bird-basic-math'], practice: 'Take off one system, price it, identify exclusions, then reconcile against the documents.', evidence: 'Issue a traceable estimate with basis, assumptions, risks, and a scope-gap RFI list.' },
            { id: 'f8', stage: 'Systems', name: 'Construction Systems Integration', topics: ['Structure–envelope interfaces', 'MEP coordination', 'Sequence and constructability', 'Quality hold points and commissioning'], hours: 24, sourceIds: ['bcp-systems', 'kultermann-cmmt', 'delpico-estimating'], practice: 'Map dependencies and failure paths; run a constructability review from drawings.', evidence: 'Deliver an interface matrix and a coordinated installation/inspection sequence.' },
            { id: 'f9', stage: 'Profession', name: 'CEBOK3 Professional Formation', topics: ['Critical thinking and design', 'Project management, economics, and risk', 'Communication and leadership', 'Ethics, responsibility, and lifelong learning'], hours: 20, sourceIds: ['cebok3'], practice: 'Rate outcomes with evidence—not confidence—and request a mentored stretch task.', evidence: 'Link a real artifact or observed behavior to each selected CEBOK outcome.' },
            { id: 'f10', stage: 'Capstone', name: 'Integrated Construction Package', topics: ['Survey/control plan', 'System and material brief', 'Quantity and cost estimate', 'Risk, sustainability, and teach-back'], hours: 30, sourceIds: ['surveying', 'bcp-systems', 'kultermann-cmmt', 'delpico-estimating', 'cebok3'], practice: 'Build the package in weekly retrieval-and-feedback cycles; revise from critique.', evidence: 'A reviewable package plus a 10-minute teach-back and written error/decision log.' }
        ]
    },
    pmp: {
        name: 'PMP 2026 Preparation',
        shortName: 'PMP 2026',
        icon: '🎓',
        desc: 'Scenario-led preparation aligned to the July 2026 ECO; legacy process tools remain references',
        modules: [
            { id: 'p1', stage: 'People', name: 'Team Formation & Leadership', topics: ['Shared purpose', 'Inclusive teams', 'Servant leadership', 'Performance agreements'], hours: 15, sourceIds: ['pmp-eco-2026'], practice: 'Answer scenarios, state the first action, then explain why the distractors fail.', evidence: 'Stable accuracy with an explicit leadership principle for each answer.' },
            { id: 'p2', stage: 'People', name: 'Conflict, Negotiation & Emotional Intelligence', topics: ['Conflict diagnosis', 'Collaborative problem solving', 'Negotiation', 'Self-awareness'], hours: 12, sourceIds: ['pmp-eco-2026'], practice: 'Rehearse private-first, diagnose-before-escalate responses.', evidence: 'Explain the response sequence under stakeholder pressure.' },
            { id: 'p3', stage: 'People', name: 'Stakeholders, Communication & Coaching', topics: ['Engagement strategy', 'Communication systems', 'Coaching', 'Knowledge transfer'], hours: 15, sourceIds: ['pmp-eco-2026', 'cebok3'], practice: 'Translate ambiguous people problems into a communication or coaching plan.', evidence: 'Score and explain mixed People-domain scenarios.' },
            { id: 'p4', stage: 'Process', name: 'Value, Delivery & Tailoring', topics: ['Benefits and value', 'Development approaches', 'Life-cycle tailoring', 'Delivery cadence'], hours: 15, sourceIds: ['pmp-eco-2026'], practice: 'Choose predictive, agile, or hybrid responses from context—not labels.', evidence: 'Defend a tailored approach using constraints and value.' },
            { id: 'p5', stage: 'Process', name: 'Scope, Schedule, Cost & Quality', topics: ['Requirements and scope', 'CPM and compression', 'EVM', 'Prevention and quality control'], hours: 14, sourceIds: ['pmp-eco-2026', 'delpico-estimating'], practice: 'Combine short calculations with scenario decisions.', evidence: 'Correctly interpret EVM and choose the governing next action.' },
            { id: 'p6', stage: 'Process', name: 'Risk, Procurement, Measurement & Change', topics: ['Risk responses', 'Procurement controls', 'Objective measurement', 'Integrated change control'], hours: 14, sourceIds: ['pmp-eco-2026'], practice: 'Identify whether to assess, authorize, act, or escalate first.', evidence: 'A calibrated mixed set with written decision rules.' },
            { id: 'p7', stage: 'Process', name: 'Agile & Hybrid Delivery', topics: ['Backlogs and increments', 'Flow and impediments', 'Adaptive planning', 'Hybrid governance'], hours: 12, sourceIds: ['pmp-eco-2026'], practice: 'Contrast adaptive and predictive options within the same scenario.', evidence: 'Explain what changes—and what governance remains—in hybrid work.' },
            { id: 'p8', stage: 'Business', name: 'Governance, Compliance & Benefits', topics: ['Strategic alignment', 'Compliance', 'Benefits realization', 'Organizational governance'], hours: 12, sourceIds: ['pmp-eco-2026', 'cebok3'], practice: 'Revalidate value when external or strategic conditions change.', evidence: 'Choose governance actions without confusing compliance with preference.' },
            { id: 'p9', stage: 'Business', name: 'AI, Data & Digital Governance', topics: ['Approved-use policy', 'Privacy and security', 'Bias and validation', 'Human accountability'], hours: 8, sourceIds: ['pmp-eco-2026'], practice: 'Apply assess → govern → pilot → validate to AI scenarios.', evidence: 'Produce a bounded AI-use decision checklist.' },
            { id: 'p10', stage: 'Business', name: 'Sustainability & Organizational Change', topics: ['Sustainability targets', 'Change adoption', 'Business-environment scanning', 'Value trade-offs'], hours: 10, sourceIds: ['pmp-eco-2026', 'cebok3', 'bcp-systems'], practice: 'Convert strategic change into options with cost, schedule, risk, and adoption impacts.', evidence: 'Explain an informed recommendation and its governance path.' }
        ]
    },
    mcmaster: {
        name: 'McMaster BTech Readiness',
        shortName: 'BTech',
        icon: '🧮',
        desc: 'Civil Engineering Infrastructure Technology readiness mapped to the textbook ladder and CEBOK3',
        modules: [
            { id: 'm1', stage: 'Foundation', name: 'Engineering Mathematics Ladder', topics: ['Algebra and trigonometry', 'Calculus', 'Linear algebra', 'Differential equations and statistics'], hours: 40, sourceIds: ['bird-basic-math', 'bird-eng-math', 'bird-math'], practice: 'Use the lowest rung that exposes the gap, then return to mixed application.', evidence: 'Solve representative prerequisite problems and explain method selection.' },
            { id: 'm2', stage: 'Fundamentals', name: 'Engineering Mechanics & Data', topics: ['Statics and dynamics', 'Strength behavior', 'Experimental methods', 'Critical problem solving'], hours: 35, sourceIds: ['cebok3', 'bcp-systems'], practice: 'Draw free-body/load paths before equations; compare predictions with data.', evidence: 'A checked solution showing assumptions, units, and interpretation.' },
            { id: 'm3', stage: 'Technical', name: 'Materials Science & Construction Behavior', topics: ['Concrete and masonry', 'Steel and wood', 'Durability and testing', 'Material selection'], hours: 24, sourceIds: ['kultermann-cmmt', 'bcp-systems', 'cebok3'], practice: 'Contrast materials by property, failure mode, constructability, and test.', evidence: 'A defensible material selection matrix.' },
            { id: 'm4', stage: 'Technical', name: 'Site, Soils, Foundations & Survey Control', topics: ['Site investigation', 'Soil behavior', 'Foundation systems', 'Control and layout'], hours: 28, sourceIds: ['surveying', 'bcp-systems', 'kultermann-cmmt'], practice: 'Connect field observations and control data to design/construction decisions.', evidence: 'A site-control and foundation-risk brief.' },
            { id: 'm5', stage: 'Technical', name: 'Construction Methods & Estimating', topics: ['Construction sequencing', 'Quantity takeoff', 'Cost estimating', 'Bid and scope control'], hours: 28, sourceIds: ['delpico-estimating', 'kultermann-cmmt'], practice: 'Read documents, quantify, price, and surface ambiguity in one loop.', evidence: 'A traceable estimate and constructability note.' },
            { id: 'm6', stage: 'Analysis', name: 'Engineering Economics, Risk & Decisions', topics: ['Time value of money', 'Life-cycle value', 'Risk and uncertainty', 'Evidence-based decisions'], hours: 18, sourceIds: ['cebok3'], practice: 'Compare options under explicit assumptions and uncertainty.', evidence: 'A decision memo with sensitivity and risk discussion.' },
            { id: 'm7', stage: 'Technical', name: 'Sustainability & Building Performance', topics: ['Thermal/moisture control', 'Embodied impacts', 'Life-cycle thinking', 'Climate resilience'], hours: 18, sourceIds: ['bcp-systems', 'kultermann-cmmt', 'cebok3'], practice: 'Treat sustainability as a multi-constraint engineering decision.', evidence: 'An option comparison with performance and life-cycle trade-offs.' },
            { id: 'm8', stage: 'Integration', name: 'Design Breadth & Professional Practice', topics: ['Design process', 'Civil breadth and depth', 'Communication and teamwork', 'Ethics and responsibility'], hours: 22, sourceIds: ['cebok3'], practice: 'Integrate technical work with communication, ethics, and mentored feedback.', evidence: 'A portfolio map linking artifacts to CEBOK3 outcomes.' }
        ]
    },
    smr: {
        name: 'SMR Construction Specialization',
        shortName: 'SMR',
        icon: '⚛️',
        desc: 'Small Modular Reactor construction readiness built on the foundations pathway',
        modules: [
            { id: 's1', stage: 'Context', name: 'Nuclear Industry & Safety Culture', topics: ['Regulatory framework', 'CNSC', 'Defense in depth', 'Safety culture'], hours: 15, sourceIds: ['cebok3'], practice: 'Use high-consequence scenarios to rehearse stop-work and escalation decisions.', evidence: 'Explain the safety case and decision authority in a field scenario.' },
            { id: 's2', stage: 'Quality', name: 'Nuclear-Grade QA/QC', topics: ['CSA N299', 'Quality programs', 'Traceability', 'Documentation'], hours: 20, sourceIds: ['bcp-systems', 'kultermann-cmmt'], practice: 'Map every hold point to evidence and configuration control.', evidence: 'A traceable inspection and turnover package outline.' },
            { id: 's3', stage: 'Delivery', name: 'Modular Construction & Logistics', topics: ['Off-site fabrication', 'Interface control', 'Heavy-lift logistics', 'Sequencing'], hours: 18, sourceIds: ['bcp-systems', 'surveying'], practice: 'Model interfaces, tolerances, survey control, and lift constraints together.', evidence: 'An interface-and-lift readiness review.' },
            { id: 's4', stage: 'Technical', name: 'Nuclear Concrete & Civil Works', topics: ['Specifications', 'Placement', 'Testing requirements', 'Nonconformance control'], hours: 18, sourceIds: ['kultermann-cmmt', 'bcp-systems'], practice: 'Trace material, placement, testing, and acceptance as one quality chain.', evidence: 'A concrete work package with risks and hold points.' },
            { id: 's5', stage: 'Controls', name: 'Project Controls & Change', topics: ['EVM', 'Schedule risk', 'Change control', 'Turnover readiness'], hours: 20, sourceIds: ['pmp-eco-2026', 'delpico-estimating'], practice: 'Interpret control signals, then choose a governed response.', evidence: 'A control narrative linking data, forecast, decision, and owner.' }
        ]
    }
};


// ==================== LEARNING SCIENCE ENHANCEMENTS ====================

// Phase 4: Elaboration Prompts (from Make It Stick)
const ELABORATION_PROMPTS = [
    "Explain what you just studied as if teaching a new intern on a construction site.",
    "What real-world example from your experience illustrates this concept?",
    "How does this connect to something you already knew before today?",
    "If this concept is true, what else must also be true?",
    "What would happen if the opposite of this were true?",
    "How does this relate to another subject you're studying?",
    "Can you create an analogy using something from everyday life?",
    "What surprised you about this material? Why?",
    "How would you apply this in a nuclear construction project?",
    "What questions does this material raise that you can't yet answer?",
    "How does this challenge or confirm what you previously believed?",
    "Describe a scenario where getting this wrong would have real consequences.",
    "What's the most important takeaway, and why does it matter?",
    "How would you explain this to someone who disagrees with it?",
    "Connect this to one of the PMP knowledge areas. Which one, and how?"
];

// Phase 5: Critical Thinking Questions (from Asking the Right Questions)
const CRITICAL_THINKING_QUESTIONS = [
    { id: 'issue', label: 'What is the issue or topic?', hint: 'State the core question or controversy.' },
    { id: 'conclusion', label: 'What is the conclusion or claim?', hint: 'What is the author/source trying to convince you of?' },
    { id: 'reasons', label: 'What are the reasons?', hint: 'What evidence or arguments support the conclusion?' },
    { id: 'ambiguity', label: 'What words or phrases are ambiguous?', hint: 'Are key terms defined clearly, or could they mean different things?' },
    { id: 'valueAssumptions', label: 'What are the value assumptions?', hint: 'What unstated values or priorities underlie the argument?' },
    { id: 'descriptiveAssumptions', label: 'What are the descriptive assumptions?', hint: 'What beliefs about how the world works are taken for granted?' },
    { id: 'fallacies', label: 'Are there any fallacies in the reasoning?', hint: 'Look for: ad hominem, straw man, false dilemma, slippery slope, appeal to authority.' },
    { id: 'evidence', label: 'How good is the evidence?', hint: 'Is it based on research, anecdote, authority, or intuition? How reliable?' },
    { id: 'rivalCauses', label: 'Are there rival causes or alternative explanations?', hint: 'Could something else explain the same outcome?' },
    { id: 'omitted', label: 'What significant information is omitted?', hint: 'What would you need to know to fully evaluate this claim?' }
];

// ==================== PMBOK 7TH EDITION: 12 PRINCIPLES ====================
const PMP_PRINCIPLES = [
    { id: 'stewardship', num: 1, name: 'Be a Diligent, Respectful, and Caring Steward', icon: '🏛️', domain: 'Stakeholder', desc: 'Act with integrity, care, trustworthiness, and compliance. Consider financial, social, technical, and environmental impacts.' },
    { id: 'team', num: 2, name: 'Create a Collaborative Project Team Environment', icon: '👥', domain: 'Team', desc: 'Foster team agreements, shared ownership, and diverse perspectives. Support individual and team learning.' },
    { id: 'stakeholders', num: 3, name: 'Effectively Engage with Stakeholders', icon: '🤝', domain: 'Stakeholder', desc: 'Proactively identify, analyze, and engage stakeholders throughout the project lifecycle.' },
    { id: 'value', num: 4, name: 'Focus on Value', icon: '💎', domain: 'Delivery', desc: 'Align project with business objectives. Continuously evaluate and adjust to maximize value delivery.' },
    { id: 'systems', num: 5, name: 'Recognize, Evaluate, and Respond to System Interactions', icon: '🔄', domain: 'Project Work', desc: 'Think holistically. Recognize that projects operate within larger systems and respond to internal/external factors.' },
    { id: 'leadership', num: 6, name: 'Demonstrate Leadership Behaviors', icon: '🌟', domain: 'Team', desc: 'Effective leadership is not limited to a single person. Adapt leadership style to context and motivate the team.' },
    { id: 'tailoring', num: 7, name: 'Tailor Based on Context', icon: '✂️', domain: 'Planning', desc: 'Design the project approach based on the unique context — goals, stakeholders, governance, and environment.' },
    { id: 'quality', num: 8, name: 'Build Quality into Processes and Deliverables', icon: '✅', domain: 'Delivery', desc: 'Quality is planned in, not inspected in. Focus on prevention over inspection.' },
    { id: 'complexity', num: 9, name: 'Navigate Complexity', icon: '🧩', domain: 'Uncertainty', desc: 'Continuously evaluate and navigate project complexity driven by human behavior, system interactions, and ambiguity.' },
    { id: 'risk', num: 10, name: 'Optimize Risk Responses', icon: '⚖️', domain: 'Uncertainty', desc: 'Assess both threats and opportunities. Select and implement optimal risk responses.' },
    { id: 'adaptability', num: 11, name: 'Embrace Adaptability and Resiliency', icon: '🌊', domain: 'Project Work', desc: 'Build adaptability and resiliency into approaches. Be prepared to adapt when conditions change.' },
    { id: 'change', num: 12, name: 'Enable Change to Achieve the Envisioned Future State', icon: '🚀', domain: 'Delivery', desc: 'Prepare impacted stakeholders for adoption and sustained change. Address change fatigue.' }
];

// ==================== PMBOK 7TH EDITION: 8 PERFORMANCE DOMAINS ====================
const PMP_DOMAINS = [
    { id: 'stakeholder', name: 'Stakeholder', icon: '🤝', principles: ['stewardship','stakeholders'], desc: 'Activities related to stakeholders. Outcomes: productive working relationship, stakeholder agreement, stakeholder satisfaction.' },
    { id: 'team', name: 'Team', icon: '👥', principles: ['team','leadership'], desc: 'Activities related to the project team. Outcomes: shared ownership, high-performing team, applicable leadership.' },
    { id: 'devapproach', name: 'Development Approach & Life Cycle', icon: '🔄', principles: ['tailoring'], desc: 'Activities related to development approach, cadence, and project life cycle phases.' },
    { id: 'planning', name: 'Planning', icon: '📋', principles: ['tailoring','systems'], desc: 'Activities for organizing, elaborating, and coordinating project work. Evolves throughout the project.' },
    { id: 'projectwork', name: 'Project Work', icon: '⚙️', principles: ['systems','adaptability'], desc: 'Activities for establishing processes, managing resources, and fostering a learning environment.' },
    { id: 'delivery', name: 'Delivery', icon: '📦', principles: ['value','quality','change'], desc: 'Activities for delivering the scope, quality, and outcomes the project was undertaken to achieve.' },
    { id: 'measurement', name: 'Measurement', icon: '📊', principles: ['value','quality'], desc: 'Activities for assessing project performance and taking appropriate responsive actions (EVM, KPIs, dashboards).' },
    { id: 'uncertainty', name: 'Uncertainty', icon: '🎲', principles: ['complexity','risk'], desc: 'Activities for understanding and managing risk, ambiguity, and complexity.' }
];

// ==================== ITTO DATA (Key ITTOs per Process) ====================
const PMP_ITTOS = {
    '4.1': { inputs: ['Business documents','Agreements','Enterprise environmental factors','Organizational process assets'], tools: ['Expert judgment','Data gathering (brainstorming, focus groups)','Interpersonal skills (conflict mgmt, facilitation)','Meetings'], outputs: ['Project charter','Assumption log'] },
    '4.2': { inputs: ['Project charter','Outputs from other processes','Enterprise environmental factors','Organizational process assets'], tools: ['Expert judgment','Data gathering','Interpersonal skills','Meetings'], outputs: ['Project management plan'] },
    '4.3': { inputs: ['Project management plan','Project documents','Approved change requests','Enterprise environmental factors'], tools: ['Expert judgment','Project management information system (PMIS)','Meetings'], outputs: ['Deliverables','Work performance data','Issue log','Change requests','Project plan updates'] },
    '4.4': { inputs: ['Project management plan','Project documents','Deliverables','Enterprise environmental factors'], tools: ['Expert judgment','Knowledge management','Information management','Interpersonal skills'], outputs: ['Lessons learned register','Project plan updates'] },
    '4.5': { inputs: ['Project management plan','Project documents','Work performance information','Agreements'], tools: ['Expert judgment','Data analysis (alternatives, cost-benefit, EVM, trend)','Decision making','Meetings'], outputs: ['Work performance reports','Change requests','Project plan updates'] },
    '4.6': { inputs: ['Project management plan','Project documents','Work performance reports','Change requests'], tools: ['Expert judgment','Change control tools','Data analysis','Decision making','Meetings'], outputs: ['Approved change requests','Project plan updates','Project document updates'] },
    '4.7': { inputs: ['Project charter','Project management plan','Project documents','Accepted deliverables','Agreements'], tools: ['Expert judgment','Data analysis','Meetings'], outputs: ['Project documents updates','Final product/service/result transition','Final report','Organizational process assets updates'] },
    '5.1': { inputs: ['Project charter','Project management plan','Enterprise environmental factors'], tools: ['Expert judgment','Data analysis','Meetings'], outputs: ['Scope management plan','Requirements management plan'] },
    '5.2': { inputs: ['Project charter','Project management plan','Project documents','Agreements','Enterprise environmental factors'], tools: ['Expert judgment','Data gathering (brainstorming, interviews, questionnaires)','Data analysis','Decision making','Interpersonal skills','Context diagram','Prototypes'], outputs: ['Requirements documentation','Requirements traceability matrix'] },
    '5.3': { inputs: ['Project charter','Project management plan','Project documents','Enterprise environmental factors'], tools: ['Expert judgment','Data analysis','Decision making','Interpersonal skills'], outputs: ['Project scope statement','Project document updates'] },
    '5.4': { inputs: ['Project management plan','Project documents','Enterprise environmental factors'], tools: ['Expert judgment','Decomposition'], outputs: ['Scope baseline (scope statement + WBS + WBS dictionary)','Project document updates'] },
    '5.5': { inputs: ['Project management plan','Project documents','Verified deliverables','Work performance data'], tools: ['Inspection','Decision making'], outputs: ['Accepted deliverables','Work performance information','Change requests'] },
    '5.6': { inputs: ['Project management plan','Project documents','Work performance data'], tools: ['Data analysis (variance, trend)'], outputs: ['Work performance information','Change requests','Project plan updates'] },
    '6.1': { inputs: ['Project charter','Project management plan','Enterprise environmental factors'], tools: ['Expert judgment','Data analysis','Meetings'], outputs: ['Schedule management plan'] },
    '6.2': { inputs: ['Project management plan','Enterprise environmental factors'], tools: ['Expert judgment','Decomposition','Rolling wave planning','Meetings'], outputs: ['Activity list','Activity attributes','Milestone list'] },
    '6.3': { inputs: ['Project management plan','Project documents','Enterprise environmental factors'], tools: ['Precedence diagramming method (PDM)','Dependency determination','Leads and lags','PMIS'], outputs: ['Project schedule network diagrams','Project document updates'] },
    '6.4': { inputs: ['Project management plan','Project documents','Enterprise environmental factors'], tools: ['Expert judgment','Analogous estimating','Parametric estimating','Three-point estimating (PERT)','Bottom-up estimating','Data analysis','Decision making','Meetings'], outputs: ['Duration estimates','Basis of estimates','Project document updates'] },
    '6.5': { inputs: ['Project management plan','Project documents','Agreements','Enterprise environmental factors'], tools: ['Schedule network analysis','Critical path method (CPM)','Resource optimization','Data analysis (what-if, simulation)','Leads and lags','Schedule compression (crashing, fast tracking)','PMIS','Agile release planning'], outputs: ['Schedule baseline','Project schedule','Schedule data','Project calendars','Change requests'] },
    '6.6': { inputs: ['Project management plan','Project documents','Work performance data'], tools: ['Data analysis (EVM, iteration burndown, variance, trend, what-if)','Critical path method','PMIS','Resource optimization','Leads and lags','Schedule compression'], outputs: ['Work performance information','Schedule forecasts','Change requests','Project plan updates'] },
    '7.1': { inputs: ['Project charter','Project management plan','Enterprise environmental factors'], tools: ['Expert judgment','Data analysis','Meetings'], outputs: ['Cost management plan'] },
    '7.2': { inputs: ['Project management plan','Project documents','Enterprise environmental factors'], tools: ['Expert judgment','Analogous estimating','Parametric estimating','Bottom-up estimating','Three-point estimating','Data analysis','PMIS','Decision making'], outputs: ['Cost estimates','Basis of estimates','Project document updates'] },
    '7.3': { inputs: ['Project management plan','Project documents','Business documents','Agreements'], tools: ['Expert judgment','Cost aggregation','Data analysis (reserve analysis)','Historical information review','Funding limit reconciliation','Financing'], outputs: ['Cost baseline','Project funding requirements','Project document updates'] },
    '7.4': { inputs: ['Project management plan','Project documents','Project funding requirements','Work performance data'], tools: ['Expert judgment','Data analysis (EVM: PV, EV, AC, SV, CV, SPI, CPI, EAC, ETC, TCPI, VAC)','To-complete performance index','PMIS'], outputs: ['Work performance information','Cost forecasts','Change requests','Project plan updates'] },
    '8.1': { inputs: ['Project charter','Project management plan','Project documents','Enterprise environmental factors'], tools: ['Expert judgment','Data gathering','Data analysis (cost-benefit, cost of quality)','Decision making','Data representation (flowcharts, matrix diagrams, mind maps)','Test and inspection planning','Meetings'], outputs: ['Quality management plan','Quality metrics','Project plan updates','Project document updates'] },
    '11.1': { inputs: ['Project charter','Project management plan','Project documents','Enterprise environmental factors'], tools: ['Expert judgment','Data analysis (stakeholder analysis)','Meetings'], outputs: ['Risk management plan'] },
    '11.2': { inputs: ['Project management plan','Project documents','Agreements','Procurement documentation','Enterprise environmental factors'], tools: ['Expert judgment','Data gathering (brainstorming, checklists, interviews)','Data analysis (root cause, assumptions, SWOT)','Interpersonal skills','Prompt lists','Meetings'], outputs: ['Risk register','Risk report','Project document updates'] },
    '11.5': { inputs: ['Project management plan','Project documents','Enterprise environmental factors'], tools: ['Expert judgment','Data gathering','Interpersonal skills','Strategies for threats (escalate, avoid, transfer, mitigate, accept)','Strategies for opportunities (escalate, exploit, share, enhance, accept)','Contingent response strategies','Data analysis','Decision making'], outputs: ['Change requests','Project plan updates','Project document updates'] },
    '13.1': { inputs: ['Project charter','Business documents','Project management plan','Agreements','Enterprise environmental factors'], tools: ['Expert judgment','Data gathering','Data analysis (stakeholder analysis, document analysis)','Data representation (stakeholder mapping: power/interest grid, salience model)','Meetings'], outputs: ['Stakeholder register','Change requests','Project plan updates'] }
};

// ==================== EVM FORMULAS ====================
const EVM_FORMULAS = [
    { abbr: 'CV', name: 'Cost Variance', formula: 'EV - AC', interp: 'Positive = under budget' },
    { abbr: 'SV', name: 'Schedule Variance', formula: 'EV - PV', interp: 'Positive = ahead of schedule' },
    { abbr: 'CPI', name: 'Cost Performance Index', formula: 'EV / AC', interp: '>1 = under budget' },
    { abbr: 'SPI', name: 'Schedule Performance Index', formula: 'EV / PV', interp: '>1 = ahead of schedule' },
    { abbr: 'EAC₁', name: 'Estimate at Completion (atypical)', formula: 'AC + (BAC - EV)', interp: 'If current variance is atypical' },
    { abbr: 'EAC₂', name: 'Estimate at Completion (typical)', formula: 'BAC / CPI', interp: 'If current CPI will continue' },
    { abbr: 'EAC₃', name: 'Estimate at Completion (CPI+SPI)', formula: 'AC + (BAC - EV) / (CPI × SPI)', interp: 'Considers both cost and schedule' },
    { abbr: 'ETC', name: 'Estimate to Complete', formula: 'EAC - AC', interp: 'How much more will it cost' },
    { abbr: 'VAC', name: 'Variance at Completion', formula: 'BAC - EAC', interp: 'Positive = under budget at end' },
    { abbr: 'TCPI', name: 'To-Complete Performance Index (BAC)', formula: '(BAC - EV) / (BAC - AC)', interp: '<1 = easier, >1 = harder to meet BAC' },
    { abbr: 'TCPI₂', name: 'To-Complete Performance Index (EAC)', formula: '(BAC - EV) / (EAC - AC)', interp: 'Efficiency needed to meet new EAC' }
];

// ==================== PMP SCENARIO QUESTIONS (V26 — 2026 ECO-aligned bank) ====================
// eco: 'People' | 'Process' | 'Business Environment' (July 2026 target mix: 33/41/26)
// mindset: the PM instinct being tested · weak: why the other options are weaker
const PMP_SCENARIOS = [
    { q: 'You are the PM on a construction project. The sponsor requests adding a new building wing not in the original scope. What should you do FIRST?', choices: ['Start planning the new wing immediately','Evaluate the impact through integrated change control','Tell the sponsor it cannot be done','Add it to the risk register'], answer: 1, principle: 'systems', process: '4.6', eco: 'Process', mindset: 'Assess before acting — no scope moves without impact analysis.', weak: 'A executes without authorization; C refuses without analysis; D treats a change request as a risk.', explain: 'All scope changes must go through Perform Integrated Change Control (4.6). Evaluate impact on schedule, cost, quality, and risk before making decisions.' },
    { q: 'During project execution, two team members have a persistent conflict about technical approach. As PM, what should you do?', choices: ['Escalate to the sponsor','Ignore it — they will resolve it themselves','Address it directly using conflict resolution techniques','Remove both team members'], answer: 2, principle: 'team', process: '9.5', eco: 'People', mindset: 'Conflict is the PM\'s job, addressed early and directly.', weak: 'A skips your responsibility; B lets conflict fester; D destroys capability to avoid a conversation.', explain: 'Manage Team (9.5) includes conflict management. The PM should address conflict directly. Collaboration/problem-solving is the preferred approach.' },
    { q: 'Your project CPI is 0.85 and SPI is 0.92. What does this tell you?', choices: ['The project is under budget and ahead of schedule','The project is over budget and behind schedule','The project is under budget and behind schedule','The project is over budget and ahead of schedule'], answer: 1, principle: 'value', process: '7.4', eco: 'Process', mindset: 'Read performance data correctly before reacting to it.', weak: 'All other options misread the indices: <1 is unfavourable for both CPI and SPI.', explain: 'CPI < 1 means over budget (getting less value per dollar). SPI < 1 means behind schedule. Both indices below 1 indicate trouble.' },
    { q: 'A key stakeholder is resistant to the project and actively blocking progress. What should you do FIRST?', choices: ['Remove the stakeholder from the project','Escalate to the sponsor immediately','Analyze the stakeholder\'s concerns and engagement level','Proceed without the stakeholder\'s input'], answer: 2, principle: 'stakeholders', process: '13.3', eco: 'People', mindset: 'Understand resistance before responding to it.', weak: 'A and D create enemies; B escalates before you\'ve done your own job.', explain: 'Manage Stakeholder Engagement (13.3) requires understanding why stakeholders resist. Analyze their concerns first, then develop an engagement strategy.' },
    { q: 'You discover that a deliverable completed last week does not meet the quality requirements. What is the BEST course of action?', choices: ['Accept it and move on to save schedule','Log it as a lesson learned','Create a change request to rework the deliverable','Blame the team member who produced it'], answer: 2, principle: 'quality', process: '8.3', eco: 'Process', mindset: 'Nonconformance gets corrected through process, not tolerated or personalized.', weak: 'A ships a defect; B documents without fixing; D attacks the person, not the gap.', explain: 'Control Quality (8.3) identifies nonconformance. A change request for corrective action (rework) is the proper process. Quality cannot be compromised.' },
    { q: 'You are starting a new agile project. Stakeholders want a detailed 18-month Gantt chart. What is the BEST approach?', choices: ['Create the detailed Gantt chart as requested','Explain agile uses only a product backlog, no schedule','Create a high-level roadmap with progressive elaboration at iteration level','Refuse to plan beyond the current sprint'], answer: 2, principle: 'tailoring', process: '6.5', eco: 'Process', mindset: 'Tailor the planning approach; educate stakeholders instead of complying or refusing.', weak: 'A produces fiction; B and D are dogmatic instead of tailored.', explain: 'Tailor based on context (Principle 7). For agile, use rolling wave planning — high-level roadmap for the long term, detailed planning for near-term iterations.' },
    { q: 'During risk identification, a team member identifies a risk with very low probability but catastrophic impact (nuclear safety incident). How should this be handled?', choices: ['Ignore it due to low probability','Add it to the watch list','Develop a detailed risk response plan including avoidance strategy','Accept the risk passively'], answer: 2, principle: 'risk', process: '11.5', eco: 'Process', mindset: 'Impact severity, not probability alone, drives response depth.', weak: 'A, B, and D all under-respond to a catastrophic-severity safety risk.', explain: 'In nuclear construction, catastrophic-impact risks require active response plans regardless of probability. Safety risks demand avoidance or mitigation strategies.' },
    { q: 'Halfway through the project, you realize the original requirements no longer align with business needs due to market changes. What should you do?', choices: ['Continue with original requirements — a change will increase costs','Initiate change control to re-evaluate and realign scope with current business value','Stop the project immediately','Ask the sponsor to decide everything'], answer: 1, principle: 'value', process: '4.6', eco: 'Business Environment', mindset: 'Projects exist to deliver value in the CURRENT business environment.', weak: 'A delivers an obsolete output; C overreacts without analysis; D abdicates the PM role.', explain: 'Focus on Value (Principle 4). Projects must deliver value. If business needs change, use integrated change control to realign the project with current value targets.' },
    { q: 'Your project team is distributed across 3 time zones. Communication is breaking down. What is the MOST effective action?', choices: ['Require everyone to work the same hours','Create a communications management plan with agreed protocols','Send more emails','Reduce team size'], answer: 1, principle: 'team', process: '10.1', eco: 'People', mindset: 'Fix the communication SYSTEM, not the symptoms.', weak: 'A punishes people for a system problem; C adds volume, not clarity; D removes capability.', explain: 'Plan Communications Management (10.1) defines who needs what info, when, and how. For distributed teams, establish communication protocols, tools, and overlapping hours.' },
    { q: 'A vendor delivers materials that are 10% cheaper than contracted but have lower specifications. What should you do?', choices: ['Accept the materials to save money','Reject the materials and request contract compliance','Use them for non-critical components','Renegotiate the contract for the lower specification'], answer: 1, principle: 'quality', process: '12.3', eco: 'Process', mindset: 'The contract defines what conforming means; enforce it.', weak: 'A and C accept nonconforming goods; D rewards the vendor for under-delivering.', explain: 'Control Procurements (12.3) ensures contract compliance. The vendor must deliver what was contracted. Lower specs could compromise quality and safety.' },

    // ── V18 additions: original ECO-weighted situational scenarios ──
    { q: 'A formwork foreman has missed his three-week lookahead commitments twice in a row. Other trades are starting to stack behind him. What should you do FIRST?', choices: ['Report his performance to his company\'s management','Have a private conversation focused on the gap between commitments and results, and ask what\'s driving it','Re-sequence other trades around him permanently','Call out the misses in the next all-hands coordination meeting'], answer: 1, principle: 'team', process: '9.5', eco: 'People', mindset: 'Accountability without ego: attack the gap, not the person, and privately first.', weak: 'A escalates before understanding; C hides the problem instead of solving it; D humiliates publicly, which buys compliance and kills honesty.', explain: 'Address performance directly, privately, and diagnostically first. The commitment gap may be caused by something you can fix (drawings, access, manpower). Escalation is a later step, not a first move.' },
    { q: 'Your team\'s steel shop drawings have sat unapproved with the consultant for three weeks, and the delay is about to hit the critical path. Your coordinator has sent two reminder emails. What is the BEST action?', choices: ['Tell the coordinator to keep following up weekly','Personally intervene: contact the consultant, understand the blocker, and remove the impediment','Log the delay and prepare a claim','Escalate directly to the owner'], answer: 1, principle: 'leadership', process: '9.4', eco: 'People', mindset: 'Servant leadership: the PM\'s job is removing the team\'s biggest impediment.', weak: 'A repeats what has already failed; C papers the problem without solving it (do it in parallel, not instead); D burns a relationship level you haven\'t used yet.', explain: 'When routine follow-up fails and the critical path is threatened, the PM removes the impediment personally — while still documenting the delay contemporaneously.' },
    { q: 'A municipal inspector and your superintendent have developed open hostility, and inspections are getting slower and pickier. What should you do?', choices: ['Request a different inspector from the city','Coach the super to be more polite','Meet the inspector yourself, listen to their concerns, and reset the relationship around shared interests (safe, compliant work)','Document every inspection delay for a future claim'], answer: 2, principle: 'stakeholders', process: '13.3', eco: 'People', mindset: 'Move from positions to interests; regulators are stakeholders to engage, not obstacles to fight.', weak: 'A escalates and may backfire badly; B treats a relationship failure as an etiquette problem; D prepares for war instead of preventing it.', explain: 'The inspector\'s cooperation is worth more than any claim. Understand their concerns, reset the relationship, then support the super-inspector interface deliberately.' },
    { q: 'You receive a furious email from the owner\'s representative accusing your team of hiding schedule slippage, copied to your executive. You believe the accusation is mostly wrong. What should you do FIRST?', choices: ['Reply immediately with a detailed point-by-point rebuttal, copied to everyone','Call or meet the owner\'s rep to understand what triggered the email before responding in writing','Forward it to your executive with your side of the story','Ignore it and let the schedule data speak for itself'], answer: 1, principle: 'stakeholders', process: '13.3', eco: 'People', mindset: 'Emotional regulation: never negotiate a relationship by reply-all. Seek the trigger first.', weak: 'A escalates a public fight; C plays politics before understanding; D reads as confirmation of the accusation.', explain: 'Angry escalations usually have a trigger event. Meet, listen, find the trigger, then respond in writing calmly with facts. You keep the relationship AND the record.' },
    { q: 'Your mechanical subcontractor\'s design team is overseas and keeps delivering coordination models that ignore agreed clash-resolution rules. What is the MOST effective response?', choices: ['Add penalty language to the next contract','Establish a working agreement: a short live session each cycle where rules, examples, and acceptance criteria are walked through together','Reject each submission with a list of violations','Ask their local PM to "manage his people"'], answer: 1, principle: 'team', process: '9.4', eco: 'People', mindset: 'Distributed teams need explicit working agreements, not stricter rejection.', weak: 'A fixes the NEXT project; C creates a rejection loop without shared understanding; D delegates your communication problem.', explain: 'Misaligned remote teams usually lack shared context, not motivation. A recurring working session builds the shared standard faster than any rejection cycle.' },
    { q: 'Your junior coordinator made a takeoff error that caused a $40k over-order of rebar. He comes to you and admits it before anyone notices. What should you do?', choices: ['Thank him for the disclosure, fix the problem together, and turn the error into a checked process step','Quietly fix it yourself so he doesn\'t get in trouble','Report it to your manager with his name attached','Tell him to find a way to cancel the order himself — he made the mess'], answer: 0, principle: 'team', process: '9.4', eco: 'People', mindset: 'Protect the behaviour you want repeated: early disclosure of bad news.', weak: 'B hides information from the project; C punishes honesty; D abandons a developing team member at the exact teaching moment.', explain: 'If admitting an error gets punished, your next error will be hidden until it\'s catastrophic. Fix it together, then convert the failure mode into a process control (peer check on takeoffs).' },
    { q: 'Two senior foremen (concrete and mechanical) disagree about level-2 sequencing, and both are technically credible. You have an opinion. What should you do?', choices: ['Make the call yourself — that\'s what PMs do','Get them both at the plan table, define the constraint each is protecting, and let them build a joint sequence you ratify','Side with the trade that\'s on the critical path','Ask the superintendent to decide'], answer: 1, principle: 'team', process: '9.5', eco: 'People', mindset: 'Influence without authority: the people executing the sequence should co-own it.', weak: 'A wins the decision and loses the ownership; C picks a winner and creates a loser; D delegates a facilitation you should lead.', explain: 'A jointly-built sequence gets executed with commitment from both trades. Facilitate, surface constraints, ratify the result — command is for when facilitation fails.' },
    { q: 'The owner asks you to accelerate. Your drywall sub says a premium is needed for overtime. The owner\'s rep calls it "extortion." What is the BEST next step?', choices: ['Direct the sub to accelerate and argue money later','Facilitate: quantify the real acceleration options (shifts, manpower, re-sequencing) with costs, and present the owner a decision package','Refuse the acceleration request as unreasonable','Threaten the sub with backcharges'], answer: 1, principle: 'stakeholders', process: '12.2', eco: 'People', mindset: 'Convert an emotional standoff into a priced decision for the party who owns it.', weak: 'A creates an unpriced change (a future claim); C refuses the client instead of informing them; D poisons a relationship over legitimate premium costs.', explain: 'Acceleration is a legitimate change with legitimate cost. The PM\'s job is turning a blame conversation into an options-and-prices conversation, then letting the owner decide with eyes open.' },
    { q: 'After three brutal months of schedule recovery, the team hit the milestone — but morale is visibly low and two coordinators mention burnout. What should you do?', choices: ['Push on — the next milestone is already at risk','Mark the win specifically and publicly, tie recognition to the exact behaviours that achieved it, and rebalance workloads before the next push','Give everyone a day off and resume the same pace','Ask HR to run a wellness survey'], answer: 1, principle: 'team', process: '9.4', eco: 'People', mindset: 'Recognition is specific, timely, and tied to behaviour; recovery paces are not sustainable paces.', weak: 'A spends people like contingency; C treats a structural workload problem as fatigue; D outsources leadership to a survey.', explain: 'Sustainable performance needs the win acknowledged (specifically, not generically) and the workload actually rebalanced. Recognition that names real behaviours also teaches the team what good looks like.' },
    { q: 'You notice the night-shift crew poured a wall to the superseded drawing revision. The day-shift super swears he posted the new revision. What should you do FIRST?', choices: ['Discipline whoever failed to communicate the revision','Contain the immediate problem, then examine the document-control SYSTEM that allowed a superseded drawing on site','Send a memo requiring everyone to check revisions daily','Add a revision-check line to the pour checklist'], answer: 1, principle: 'systems', process: '10.2', eco: 'People', mindset: 'Communication failures are system failures first, people failures second.', weak: 'A finds a scapegoat and keeps the broken system; C and D are partial fixes chosen before the root cause is known.', explain: 'First contain (engineering assessment of the as-built wall), then fix the system: how do superseded drawings survive on site? The checklist line (D) may be PART of the fix — after analysis, not instead of it.' },
    { q: 'The owner demands the building envelope complete three weeks earlier to hit a leasing date. What should you do FIRST?', choices: ['Commit the team to the new date — the client is always right','Analyze compression options (crash, fast-track, scope re-sequencing) with cost/risk impacts, and process the acceleration as a change','Explain that the schedule is already optimized and decline','Instruct all envelope trades to add overtime immediately'], answer: 1, principle: 'value', process: '6.6', eco: 'Process', mindset: 'Schedule pressure is answered with analysis and change control, not heroics or refusal.', weak: 'A commits without knowing the cost; C refuses without analysis; D spends money before anyone approved it.', explain: 'Control Schedule (6.6): model the compression options with their cost and risk, then run the acceleration through change control so the party requesting it owns its price.' },
    { q: 'The geotechnical report for the next building in your program shows significantly worse soil than the completed buildings had. Excavation starts in six weeks. What should you do?', choices: ['Wait for the excavation contractor to raise it','Quantify the impact now, develop response options (redesign, dewatering, revised shoring), update the risk register and reserves, and brief the owner','Add a note to the risk register and proceed','Order the shoring redesign immediately'], answer: 1, principle: 'risk', process: '11.5', eco: 'Process', mindset: 'A materialized risk trigger demands response planning NOW, while options are still cheap.', weak: 'A outsources your risk management; C documents without acting; D picks a response before evaluating alternatives.', explain: 'Plan Risk Responses (11.5): six weeks of float is a gift — use it to price options and pre-approve the response, not to wait for the problem to arrive in the excavation.' },
    { q: 'The architect issues a "clarification" sketch that adds blocking, backing, and access panels not shown anywhere in contract documents. Your drywall sub says it\'s an extra. What should you do?', choices: ['Direct the sub to proceed — it\'s only a clarification','Assess scope against contract documents; if it adds scope, process it as a change with cost/schedule impact before proceeding','Refuse to implement the sketch','Tell the sub to price it after installation'], answer: 1, principle: 'systems', process: '4.6', eco: 'Process', mindset: 'The label on the paper ("clarification") doesn\'t determine whether it\'s a change — the contract documents do.', weak: 'A absorbs unpriced scope; C is obstruction, not administration; D destroys your negotiating position and the record.', explain: 'Scope disguised as clarification is the classic leak. Compare against contract documents, and if scope grew, it goes through change control BEFORE the work, with the paper trail intact.' },
    { q: 'Rebar cover deficiencies have now been caught on three consecutive suspended-slab inspections, each fixed on the spot. What is the BEST response?', choices: ['Keep catching them at inspection — the system is working','Investigate the root cause in the placing process (chair spacing, bar schedules, crew training) and fix the process','Backcharge the rebar sub for re-inspection costs','Increase inspection frequency'], answer: 1, principle: 'quality', process: '8.2', eco: 'Process', mindset: 'Repeated defects are a process signal; quality is built in, not inspected in.', weak: 'A and D scale up inspection instead of prevention; C prices the symptom without curing it.', explain: 'Manage Quality (8.2): three identical catches means the process, not the crew\'s luck, is broken. Root-cause the placement process; inspection intensity is the fallback, not the fix.' },
    { q: 'The finish schedule in the specs conflicts with the drawings for the lobby flooring, and the sub\'s price was based on the cheaper one. Installation is in two weeks. What should you do?', choices: ['Tell the sub to install the better finish and argue later','Issue an RFI now citing both documents, request a ruling per the contract\'s order-of-precedence clause, and flag the potential cost/schedule impact','Let the owner\'s interior designer choose on a site walk','Install what the sub priced'], answer: 1, principle: 'systems', process: '12.3', eco: 'Process', mindset: 'Document conflicts get resolved through the contract\'s own precedence mechanism — in writing, before the work.', weak: 'A and D pick a side without authority; C gets a verbal decision that will be disputed the day the invoice arrives.', explain: 'The contract\'s order-of-precedence clause exists exactly for this. An RFI two weeks out, with impact flagged, turns a future dispute into a routine administration item.' },
    { q: 'Phase 2 layout is starting, and you watch the same underground-utilities coordination clash that cost Phase 1 three weeks begin to repeat. What should you do?', choices: ['Let the team handle it — they solved it last time','Run a focused lessons-learned session on the Phase 1 clash NOW, and change the coordination procedure before Phase 2 repeats it','Note it for the end-of-project lessons-learned register','Assign your best coordinator to babysit the issue'], answer: 1, principle: 'systems', process: '4.4', eco: 'Process', mindset: 'Lessons are learned when the process changes — mid-project, not at closeout.', weak: 'A re-buys the same three weeks; C archives the lesson instead of using it; D solves it with a hero instead of a process.', explain: 'Manage Project Knowledge (4.4): knowledge that isn\'t converted into a changed procedure before the repeat event is just documentation of how you lost three weeks twice.' },
    { q: 'Your project is a predictive structural build, but the owner wants to iterate on interior fit-out design while construction proceeds. What is the BEST approach?', choices: ['Insist all design is frozen before construction starts','Run a hybrid approach: predictive baseline for structure/envelope, iterative design windows with decision deadlines for fit-out packages','Let fit-out design stay open-ended and price changes as they come','Run the whole project as agile sprints'], answer: 1, principle: 'tailoring', process: '4.2', eco: 'Process', mindset: 'Tailor the life cycle per component; late-decision freedom needs explicit deadlines.', weak: 'A fights the owner\'s legitimate need; C is a change-order faucet with no control; D applies the wrong model to structural work.', explain: 'Hybrid tailoring: lock what must be sequential, and give iterative components defined decision windows tied to procurement deadlines — flexibility with a fence around it.' },
    { q: 'Your coordinators report percent-complete numbers that consistently turn out optimistic, making your EV data useless. What should you do?', choices: ['Apply a standard 20% haircut to all reported progress','Define objective completion rules per work package (installed quantities, milestone gates like "inspected", 0/50/100 rules) and measure against those','Replace self-reporting with your own weekly walkdown estimates','Report the optimistic numbers with a disclaimer'], answer: 1, principle: 'value', process: '7.4', eco: 'Process', mindset: 'Measurement quality comes from objective rules, not from adjusting subjective ones.', weak: 'A corrects bias with a guess; C substitutes one subjective read for another and doesn\'t scale; D knowingly reports bad data.', explain: 'Control Costs (7.4) is only as good as its inputs. Quantity-based and gate-based progress rules remove the optimism at the source instead of massaging it downstream.' },
    { q: 'Mid-project, the municipality adopts a new energy code amendment that applies to permits issued after a date that catches your Building C. What should you do FIRST?', choices: ['Build Building C to the same standard as A and B for consistency','Assess the compliance impact with the design team, quantify cost/schedule effects, process the change, and brief the owner on obligations and options','Apply for an exemption and continue as planned meanwhile','Ask the owner if they want to comply'], answer: 1, principle: 'stewardship', process: '4.6', eco: 'Business Environment', mindset: 'External regulatory change → assess, comply, and convert into managed project change.', weak: 'A knowingly builds non-compliant work; C gambles the schedule on an exemption; D asks the client whether to follow the law.', explain: 'Compliance isn\'t optional (Stewardship). Scan → assess impact → change control → informed owner. If an exemption path exists, pursue it in parallel, never as the plan of record.' },
    { q: 'To protect the pour date, your superintendent proposes skipping the fall-protection re-certification for a crew whose cards expired yesterday: "They\'ve done this a hundred times." What should you do?', choices: ['Allow it this once and schedule re-certification for next week','Refuse: no current certification, no work at height — re-sequence today\'s work, get the training done, and record the decision','Allow it with extra supervision as a compensating control','Let the sub\'s safety officer make the call'], answer: 1, principle: 'stewardship', process: '8.2', eco: 'Business Environment', mindset: 'Safety and compliance are constraints, not trade-offs — and there are no small exceptions in high-consequence work.', weak: 'A and C price a life against a pour date; D delegates YOUR legal and moral accountability.', explain: 'A schedule recovered by breaking safety compliance isn\'t recovered — it\'s mortgaged against a fatality. The nuclear-grade habit: comply, re-sequence, document. This one is also who you are.' }
    ,{ q: 'Your organization proposes an AI assistant to draft risk responses using confidential project records. What should the project manager do FIRST?', choices: ['Use it immediately because faster analysis improves value','Ban all AI from the project','Assess approved-use policy, privacy, security, bias, human-validation, and accountability requirements before a controlled pilot','Upload anonymized records to a personal AI account'], answer: 2, principle: 'stewardship', process: '4.3', eco: 'Business Environment', mindset: 'Adopt technology through governance and validation, not enthusiasm or blanket refusal.', weak: 'A skips governance; B rejects potential value without assessment; D bypasses organizational controls.', explain: 'AI adoption is a business-environment and governance decision. Confirm authorized tools and data controls, define human review and accountability, then test on a bounded use case.' }
    ,{ q: 'A new corporate sustainability commitment changes the embodied-carbon target for a project already in design. What is the BEST response?', choices: ['Ignore it because it was not in the original scope','Replace all materials immediately','Evaluate value, compliance, cost, schedule, procurement, and stakeholder impacts, then process the recommended change through governance','Ask the design team to meet it without changing budget or schedule'], answer: 2, principle: 'value', process: '4.6', eco: 'Business Environment', mindset: 'Translate strategic change into an evidence-backed project decision.', weak: 'A disconnects the project from strategy; B selects a solution before analysis; D hides real trade-offs.', explain: 'Assess how the new strategic target affects benefits and constraints, develop options, and use change governance so sponsors make an informed value decision.' }
    ,{ q: 'An economic downturn causes the sponsor to question whether the project still supports the organization\'s strategy. What should the project manager do?', choices: ['Defend the original business case','Continue until formally told to stop','Revalidate expected benefits and strategic alignment, present updated options, and support a governance decision','Reduce quality to protect the schedule'], answer: 2, principle: 'value', process: '4.5', eco: 'Business Environment', mindset: 'Protect value, not sunk cost.', weak: 'A anchors on the past; B delays necessary governance; D sacrifices outcomes without authorization.', explain: 'Changes in the business environment require benefits and strategic alignment to be reassessed. Give governance current evidence and options, including change, pause, or termination.' }
];

// ==================== 6TH ↔ 7TH CROSS-REFERENCE ====================
const PMP_CROSS_REF = {
    'integration': { domain: 'projectwork', principles: ['systems','leadership','adaptability'], pg6: ['4.1','4.2','4.3','4.4','4.5','4.6','4.7'] },
    'scope': { domain: 'planning', principles: ['tailoring','value'], pg6: ['5.1','5.2','5.3','5.4','5.5','5.6'] },
    'schedule': { domain: 'planning', principles: ['tailoring','value'], pg6: ['6.1','6.2','6.3','6.4','6.5','6.6'] },
    'cost': { domain: 'measurement', principles: ['value','stewardship'], pg6: ['7.1','7.2','7.3','7.4'] },
    'quality': { domain: 'delivery', principles: ['quality','value'], pg6: ['8.1','8.2','8.3'] },
    'resource': { domain: 'team', principles: ['team','leadership'], pg6: ['9.1','9.2','9.3','9.4','9.5','9.6'] },
    'communications': { domain: 'stakeholder', principles: ['stakeholders','team'], pg6: ['10.1','10.2','10.3'] },
    'risk': { domain: 'uncertainty', principles: ['risk','complexity'], pg6: ['11.1','11.2','11.3','11.4','11.5','11.6','11.7'] },
    'procurement': { domain: 'projectwork', principles: ['stewardship','systems'], pg6: ['12.1','12.2','12.3'] },
    'stakeholder': { domain: 'stakeholder', principles: ['stakeholders','stewardship','change'], pg6: ['13.1','13.2','13.3','13.4'] }
};

// ==================== CEBOK3: 21 CIVIL ENGINEERING OUTCOMES ====================
// Bloom's Taxonomy Levels: 1=Remember, 2=Understand, 3=Apply, 4=Analyze, 5=Evaluate, 6=Create
const CEBOK3_OUTCOMES = {
    foundational: {
        name: 'Foundational', icon: '📐', outcomes: [
            { id: 'math', name: 'Mathematics', bloomTarget: 4, desc: 'Calculus, linear algebra, differential equations, probability, statistics for engineering analysis.' },
            { id: 'natSci', name: 'Natural Sciences', bloomTarget: 4, desc: 'Physics, chemistry, earth sciences as foundation for engineering problem solving.' },
            { id: 'socSci', name: 'Social Sciences', bloomTarget: 3, desc: 'Economics, sociology, political science — understanding forces shaping infrastructure decisions.' },
            { id: 'humanities', name: 'Humanities', bloomTarget: 2, desc: 'History, philosophy, cultural awareness informing ethical and societal engineering decisions.' }
        ]
    },
    engFundamentals: {
        name: 'Engineering Fundamentals', icon: '⚙️', outcomes: [
            { id: 'materials', name: 'Materials Science', bloomTarget: 4, desc: 'Properties of steel, concrete, timber, composites. Material selection and behavior under load.' },
            { id: 'mechanics', name: 'Engineering Mechanics', bloomTarget: 4, desc: 'Statics, dynamics, strength of materials, structural analysis. Force systems and equilibrium.' },
            { id: 'experiments', name: 'Experimental Methods & Data Analysis', bloomTarget: 4, desc: 'Lab testing, field measurement, statistical analysis, data interpretation for engineering decisions.' },
            { id: 'critThinking', name: 'Critical Thinking & Problem Solving', bloomTarget: 5, desc: 'Systematic approaches to complex problems. Identifying assumptions, evaluating evidence, synthesizing solutions.' }
        ]
    },
    technical: {
        name: 'Technical', icon: '🏗️', outcomes: [
            { id: 'projMgmt', name: 'Project Management', bloomTarget: 4, desc: 'Planning, scheduling, cost control, resource management, risk management for civil engineering projects.' },
            { id: 'engEcon', name: 'Engineering Economics', bloomTarget: 4, desc: 'Time value of money, cost-benefit analysis, life-cycle costing, economic decision making.' },
            { id: 'riskUncert', name: 'Risk & Uncertainty', bloomTarget: 4, desc: 'Risk identification, assessment, quantification, and management in civil engineering context.' },
            { id: 'breadth', name: 'Breadth in CE Areas', bloomTarget: 3, desc: 'Exposure across structural, geotech, water resources, environmental, transportation, construction.' },
            { id: 'design', name: 'Design', bloomTarget: 5, desc: 'Engineering design process including problem definition, alternatives, analysis, and optimization.' },
            { id: 'depth', name: 'Depth in a CE Area', bloomTarget: 5, desc: 'Advanced competency in at least one CE specialization (e.g., nuclear construction, heavy civil).' },
            { id: 'sustainability', name: 'Sustainability', bloomTarget: 4, desc: 'Environmental stewardship, resource efficiency, social equity in engineering decisions.' }
        ]
    },
    professional: {
        name: 'Professional', icon: '💼', outcomes: [
            { id: 'communication', name: 'Communication', bloomTarget: 5, desc: 'Written, oral, graphical, and digital communication for technical and non-technical audiences.' },
            { id: 'teamLead', name: 'Teamwork & Leadership', bloomTarget: 4, desc: 'Collaborative work, conflict resolution, mentoring, leading diverse teams on complex projects.' },
            { id: 'lifelong', name: 'Lifelong Learning', bloomTarget: 5, desc: 'Self-directed learning, professional development, staying current with technology and standards.' },
            { id: 'profAttitudes', name: 'Professional Attitudes', bloomTarget: 4, desc: 'Commitment to quality, safety, public welfare, and the profession. Creativity, curiosity, persistence.' },
            { id: 'profRespons', name: 'Professional Responsibilities', bloomTarget: 5, desc: 'Licensure, codes, standards, regulations, business practices, public policy engagement.' },
            { id: 'ethics', name: 'Ethical Responsibilities', bloomTarget: 5, desc: 'ASCE/PEO code of ethics, moral reasoning, resolving ethical dilemmas in practice.' }
        ]
    }
};

const BLOOMS_LEVELS = [
    { level: 1, name: 'Remember', verb: 'Recall', desc: 'Retrieve relevant knowledge from memory', color: '#94a3b8' },
    { level: 2, name: 'Understand', verb: 'Explain', desc: 'Construct meaning from information', color: '#60a5fa' },
    { level: 3, name: 'Apply', verb: 'Use', desc: 'Carry out a procedure in a given situation', color: '#34d399' },
    { level: 4, name: 'Analyze', verb: 'Differentiate', desc: 'Break material into parts and determine relationships', color: '#fbbf24' },
    { level: 5, name: 'Evaluate', verb: 'Judge', desc: 'Make judgments based on criteria and standards', color: '#f97316' },
    { level: 6, name: 'Create', verb: 'Design', desc: 'Put elements together to form a novel, coherent whole', color: '#ef4444' }
];

// ==================== CONSTRUCTION ESTIMATING REFERENCE ====================
const ESTIMATING_PROCESS = [
    { step: 1, name: 'Review Bid Documents', desc: 'Study drawings, specs, addenda. Create query list. Visit site.', icon: '📋' },
    { step: 2, name: 'Quantity Takeoff', desc: 'Measure all work items from drawings. Net in-place quantities. Organize by trade/CSI division.', icon: '📐' },
    { step: 3, name: 'Price Labor', desc: 'Crew composition × hourly rates × productivity factors. Include burden (benefits, taxes, insurance).', icon: '👷' },
    { step: 4, name: 'Price Materials', desc: 'Unit costs × quantities + waste factors. Get supplier quotes. Include delivery and taxes.', icon: '🧱' },
    { step: 5, name: 'Price Equipment', desc: 'Rental/ownership costs + operating costs (fuel, maintenance). Match to production rates.', icon: '🚜' },
    { step: 6, name: 'Subcontractor Pricing', desc: 'Obtain minimum 3 quotes per trade. Evaluate scope coverage. Check exclusions.', icon: '🤝' },
    { step: 7, name: 'General Expenses / Site Overhead', desc: 'Temp facilities, supervision, site office, utilities, insurance, permits, cleanup.', icon: '🏢' },
    { step: 8, name: 'Head Office Overhead', desc: 'Company overhead allocated to project as percentage of total cost.', icon: '🏛️' },
    { step: 9, name: 'Markup & Profit', desc: 'Risk assessment drives markup percentage. Consider competition, project complexity, bonding.', icon: '💰' },
    { step: 10, name: 'Bid Closing', desc: 'Final sub quotes, last-minute adjustments, management review, bid submission.', icon: '📨' }
];

const ESTIMATING_FORMULAS = [
    { name: 'Swell Factor', formula: 'Swell Volume = Bank Volume × (1 + Swell %)', example: '100 m³ bank × 1.25 = 125 m³ loose' },
    { name: 'Compaction Factor', formula: 'Compacted Volume = Bank Volume × (1 - Shrinkage %)', example: '100 m³ bank × 0.90 = 90 m³ compacted' },
    { name: 'Labor Cost', formula: 'Labor = (Quantity / Productivity) × Crew Rate', example: '100 m² formwork / 3.5 m²/hr × $45/hr = $1,286' },
    { name: 'Unit Cost', formula: 'Unit Cost = (Labor + Material + Equipment) / Quantity', example: 'Total $50,000 / 200 m³ = $250/m³' },
    { name: 'Waste Factor', formula: 'Order Qty = Net Qty × (1 + Waste %)', example: '1000 bricks × 1.05 = 1050 bricks ordered' },
    { name: 'Markup', formula: 'Bid Price = Direct Cost + OH + Profit', example: '$100K + 10% OH + 8% Profit = $118,000' },
    { name: 'Productivity Rate', formula: 'Hours = Quantity / (Crew Size × Output/hr)', example: '500 m² / (4 workers × 2 m²/hr) = 62.5 hrs' },
    { name: 'Life-Cycle Cost', formula: 'LCC = Initial Cost + PV(Operating) + PV(Maintenance) - PV(Salvage)', example: 'Compare options over 25-year life using discount rate' }
];
