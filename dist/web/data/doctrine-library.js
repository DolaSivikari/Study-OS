// ==================== DOCTRINE LIBRARY (V9) ====================
// This file is the "training substrate" for StudyOS.
// It stores operational doctrine: models, drills, templates, and hooks.
// No copyrighted book text is stored here; only original abstractions and procedures.

(function(){
  const BASE = [
  {
    id: 'habits-behavior-change',
    domain: 'Behavior',
    pillar: 'leadership',
    title: 'Behavior Change: Habits as Systems',
    sources: ['Atomic Habits (James Clear)', 'Tiny Habits (BJ Fogg)'],
    models: [
      'Four Laws of Behavior Change (obvious/attractive/easy/satisfying)',
      'Identity-based habits: become the type of person who…',
      'B=MAP: Behavior = Motivation × Ability × Prompt'
    ],
    drills: [
      'Write ONE identity statement for today ("I am the type of person who…") then choose ONE 2-minute action that proves it.',
      'Pick one habit you failed. Diagnose: Prompt missing? Ability too low? Motivation unstable? Fix one lever only.'
    ],
    templates: [
      { type: 'habit-recipe', name: 'Habit Recipe', fields: ['After I… (anchor)', 'I will… (tiny action)', 'Where/when', 'Celebrate', 'Friction to remove'] }
    ]
  },
  {
    id: 'deep-work-execution',
    domain: 'Execution',
    pillar: 'technical',
    title: 'Deep Work: Focus Block Doctrine',
    sources: ['Deep Work (Cal Newport)', 'Peak (K. Anders Ericsson)'],
    models: [
      'Focus blocks are a scarce resource: protect them with rituals + environment control',
      'Deliberate practice: specific goal, feedback, stretch, repetition',
      'Use accumulated high-effort time as a fatigue reflection signal—not a universal quota or hard biological ceiling'
    ],
    drills: [
      'Plan 2×60-min blocks. For each: define success condition, failure modes, and a shutdown ritual.',
      'After the block: rate Quality (0–10) and Stretch (Comfort/Learning/Panic). Adjust tomorrow.'
    ],
    templates: [
      { type: 'focus-block', name: '60-min Focus Block', fields: ['Objective', 'Constraints', 'Start ritual', 'Stop rule', 'Quality rating', 'Stretch rating'] }
    ]
  },
  {
    id: 'learning-science-retrieval',
    domain: 'Learning',
    pillar: 'technical',
    title: 'Learning Science: Retrieval & Spacing',
    sources: ['Make It Stick', 'How We Learn', 'Livewired', 'The Extended Mind'],
    models: [
      'Retrieval practice > rereading (desirable difficulty)',
      'Spacing + interleaving build durable learning',
      'External scaffolds (notes, environment, tools) extend cognition'
    ],
    drills: [
      'Before you study: write 5 questions you expect to answer. After study: answer from memory, then correct.',
      'Interleave: mix 2 topics in one session; end with a 2-minute “teach it simply” explanation.'
    ],
    templates: [
      { type: 'flashcard-pack', name: 'Flashcard Pack', fields: ['Topic', '10 Q→A prompts', 'Trick cases', 'Common errors'] }
    ]
  },
  {
    id: 'critical-thinking-questions',
    domain: 'Thinking',
    pillar: 'strategic',
    title: 'Critical Thinking: Question Discipline',
    sources: ['Asking the Right Questions'],
    models: [
      'Turn claims into questions; separate evidence from conclusion',
      'Spot assumptions, ambiguity, and missing information',
      'Consider alternative explanations and counterexamples'
    ],
    drills: [
      'Run the 10-question critique on one claim you believe. Write the strongest counterargument, then refine your view.',
      'Rewrite one paragraph from a textbook into: Claim → Evidence → Assumptions → What would change my mind?'
    ],
    templates: [
      { type: 'critique', name: '10-Question Critique', fields: ['Issue', 'Conclusion', 'Reasons', 'Assumptions', 'Evidence quality', 'Alternatives', 'Implications'] }
    ]
  },
  {
    id: 'construction-systems-atlas',
    domain: 'Construction',
    pillar: 'technical',
    title: 'Building Systems: Site→Structure→Envelope',
    sources: ['Building Construction Illustrated (Ching)'],
    models: [
      'Think in systems and assemblies: foundation/floor/wall/roof as interfaces',
      'Context forces: climate, code, utilities, life-cycle',
      'Sustainable development lens: phases, resources, principles'
    ],
    drills: [
      'Pick one building element (e.g., roof). Map interfaces: structure, moisture, thermal, openings, maintenance.',
      'Create a one-page assembly sheet: purpose, loads, failure modes, inspection checklist.'
    ],
    templates: [
      { type: 'assembly-sheet', name: 'Assembly Sheet', fields: ['Element', 'Purpose', 'Interfaces', 'Failure modes', 'QA checks', 'Maintenance'] }
    ]
  },
  {
    id: 'construction-materials-methods',
    domain: 'Construction',
    pillar: 'technical',
    title: 'Materials & Methods: Code, Testing, Sustainability',
    sources: ['Construction Materials, Methods, and Techniques (Kultermann & Spence)'],
    models: [
      'Regulatory constraints: zoning + codes + standards ecosystems',
      'Material properties: mechanical/thermal/acoustical/chemical',
      'Process literacy: RFIs, submittals, closeout, safety'
    ],
    drills: [
      'For a chosen material: list properties, failure risks, installation constraints, and inspection tests.',
      'Practice a “spec read”: identify scope, exclusions, submittals, and acceptance criteria.'
    ],
    templates: [
      { type: 'material-card', name: 'Material Card', fields: ['Material', 'Properties', 'Standards', 'Install constraints', 'QA tests', 'Sustainability'] }
    ]
  },
  {
    id: 'estimating-cost-engine',
    domain: 'Construction',
    pillar: 'technical',
    title: 'Estimating: Takeoff → Unit Price → Risk',
    sources: ['Estimating Building Costs (Del Pico)'],
    models: [
      'Estimate workflow: study docs → takeoff → pricing → bid',
      'Unit price = materials + labor + equipment + overhead + profit',
      'Organize by CSI MasterFormat to stay consistent'
    ],
    drills: [
      'Choose one scope. Write: quantities, unit, waste factor, production rate, and the 5 cost elements.',
      'Create an RFI list: 5 ambiguity points in drawings/specs that change cost materially.'
    ],
    templates: [
      { type: 'estimate-line', name: 'Estimate Line Item', fields: ['Scope', 'Qty', 'Unit', 'Waste', 'Labor hours', 'Unit cost', 'Risk note'] }
    ]
  },
  {
    id: 'engineering-math-foundations',
    domain: 'Math',
    pillar: 'technical',
    title: 'Engineering Math: From Algebra to Calculus',
    sources: ["Bird's Basic Engineering Mathematics", "Bird's Engineering Mathematics", "Bird's Higher Engineering Mathematics"],
    models: [
      'Mathematics as the toolchain for engineering reasoning (dimensions, limits, variation, proof)',
      'Progressive ladder: fluency → engineering methods → higher analysis; drop one rung when prerequisite errors dominate',
      'Build capability by generation, worked-example fading, mixed problem practice, feedback, and spaced re-solving'
    ],
    drills: [
      'Pick one topic. Do 5 problems cold. Mark error type: concept, algebra, setup, or arithmetic.',
      'Convert formulas into flashcards: when to use, constraints, and a worked micro-example.'
    ],
    templates: [
      { type: 'problem-log', name: 'Problem Log', fields: ['Topic', 'Problem', 'Mistake type', 'Fix', 'Next drill'] }
    ]
  },
  {
    id: 'cebok-professional-formation',
    domain: 'Engineering',
    pillar: 'leadership',
    title: 'CEBOK3: Competency Through Evidence & Mentored Experience',
    sources: ['Civil Engineering Body of Knowledge, 3rd ed.'],
    models: [
      'Professional readiness spans 21 outcomes: foundational, engineering fundamentals, technical, and professional',
      'Competency is demonstrated by evidence and increasing responsibility—not by confidence ratings alone',
      'Formal study, self-development, and progressively complex mentored experience form one development system',
      'Cognitive capability (what you can do) and affective commitment (what you consistently value and enact) both matter'
    ],
    drills: [
      'Choose one CEBOK outcome. Attach one real artifact or observed behavior, then name the missing evidence for the next level.',
      'Ask a mentor for one stretch assignment that increases complexity, quality, or responsibility in a targeted outcome.',
      'TEACH-BACK: explain one technical decision to both an engineer and a nontechnical stakeholder; note what changed.'
    ],
    templates: [
      { type: 'competency-evidence', name: 'CEBOK Evidence Record', fields: ['Outcome', 'Current evidence', 'Context and responsibility', 'Feedback received', 'Gap', 'Next mentored experience'] },
      { type: 'professional-brief', name: 'Professional Decision Brief', fields: ['Issue', 'Technical basis', 'Risk and uncertainty', 'Stakeholders', 'Ethical duties', 'Recommendation', 'Communication plan'] }
    ]
  },
  {
    id: 'construction-systems-core',
    domain: 'Construction',
    pillar: 'technical',
    title: 'Construction Systems: Principles → Materials → Assemblies',
    sources: ['Building Construction: Principles, Materials, and Systems', 'Building Construction Illustrated', 'Construction Materials, Methods'],
    models: [
      'Systems hierarchy: site → structure → envelope → interiors → MEP (interfaces are where failures happen)',
      'Material selection is a trade space: performance, constructability, durability, cost, safety, schedule, sustainability',
      'Quality = standards + inspection points + feedback loops (catch defects upstream)'
    ],
    drills: [
      'Pick one building system (e.g., roof). Write: function, main components, typical failure modes, inspection checkpoints.',
      'From a real drawing set: identify 10 coordination interfaces (structure↔MEP, envelope↔structure) and list risks.'
    ],
    templates: [
      { type: 'system-brief', name: 'System Brief', fields: ['System', 'Function', 'Components', 'Interfaces', 'Top risks', 'QC checkpoints', 'Common failures'] },
      { type: 'site-walk', name: 'Site Walk Log', fields: ['Area', 'Observation', 'Spec/drawing reference', 'Risk', 'Action', 'Owner', 'Due date'] }
    ]
  },
  {
    id: 'measurement-quantity-surveying',
    domain: 'Construction',
    pillar: 'technical',
    title: 'Measurement Doctrine: Quantify Work Without Ambiguity',
    sources: ['Method of Measurement of Construction Works (CIQS)', 'Estimating Building Costs'],
    models: [
      'Measurement is a language: define scope, units, and inclusions/exclusions consistently',
      'Estimate accuracy depends on clarity of quantities + assumptions + risk allowances',
      'Takeoff discipline: traceable quantity → unit rate → extensions → checks'
    ],
    drills: [
      'Create a measurement “assumption sheet” before takeoff: what is included/excluded, units, and referencing.',
      'Do a mini takeoff: quantify one trade item and run a 3-step check (sanity check, cross-check, peer check).'
    ],
    templates: [
      { type: 'takeoff-sheet', name: 'Takeoff Sheet', fields: ['Item', 'Drawing ref', 'Unit', 'Quantity', 'Assumptions', 'Waste factor', 'Notes'] },
      { type: 'estimate-risk', name: 'Estimate Risk Register', fields: ['Risk', 'Likelihood', 'Impact', 'Allowance', 'Mitigation', 'Owner'] }
    ]
  },
  {
    id: 'surveying-construction-applications',
    domain: 'Construction',
    pillar: 'technical',
    title: 'Surveying for Construction: Control → Layout → Verification',
    sources: ['Surveying with Construction Applications'],
    models: [
      'Control precedes production: establish reliable control points before layout',
      'Error propagates: small measurement errors become large layout issues; verify early and often',
      'Field workflow: plan → measure → record → check → adjust'
    ],
    drills: [
      'Write the layout plan for one element (gridline, footing, wall): inputs needed, instruments, checks, tolerances.',
      'Post-layout verification: define acceptance criteria and a recheck procedure.'
    ],
    templates: [
      { type: 'layout-plan', name: 'Layout Plan', fields: ['Element', 'Control points', 'Method', 'Tolerances', 'Checks', 'Crew', 'Time'] },
      { type: 'survey-check', name: 'Survey Check Log', fields: ['Date', 'Element', 'Measured', 'Expected', 'Delta', 'Decision', 'Signed by'] }
    ]
  },
  {
    id: 'construction-drawings-literacy',
    domain: 'Construction',
    pillar: 'technical',
    title: 'Construction Drawings: Sheet Navigation & Coordination',
    sources: ['Understanding Construction Drawings'],
    models: [
      'Drawings are an information graph: plan ↔ section ↔ detail ↔ schedule ↔ spec',
      'Coordination is risk control: conflicts hide in interfaces and dimension chains',
      'Reading order: general → specific; locate scope, then constraints, then details'
    ],
    drills: [
      'Pick one sheet: list every cross-reference it points to and open each; build a “reference chain.”',
      'Identify 5 ambiguity points and draft RFI questions that are specific, testable, and reference-driven.'
    ],
    templates: [
      { type: 'sheet-map', name: 'Sheet Map', fields: ['Sheet', 'Scope', 'Key notes', 'References', 'Schedules used', 'Open questions'] },
      { type: 'rfi', name: 'RFI Draft', fields: ['Issue', 'Drawing refs', 'Constraint', 'Options', 'Recommendation', 'Impact (cost/schedule)'] }
    ]
  },
  {
    id: 'engineering-physics-foundations',
    domain: 'Engineering',
    pillar: 'technical',
    title: 'Physics Foundations: Modeling, Units, Forces, Energy, Fluids',
    sources: ['Physics for Scientists & Engineers', 'Physics: Principles with Applications'],
    models: [
      'Model first: define system boundary, assumptions, units, and known/unknowns',
      'Dimensional analysis catches errors early; units are part of the equation',
      'Conservation laws (energy/momentum) reduce complexity and reveal invariants'
    ],
    drills: [
      'For any problem: write Givens/Unknowns/Assumptions/Diagram/Equation plan before solving.',
      'After solving: run a unit check + order-of-magnitude check + limiting-case check.'
    ],
    templates: [
      { type: 'problem-solve', name: 'Problem-Solving Sheet', fields: ['Boundary', 'Assumptions', 'Diagram', 'Knowns', 'Unknowns', 'Plan', 'Solve', 'Checks'] },
      { type: 'error-log', name: 'Error Log', fields: ['Problem type', 'Mistake', 'Root cause', 'Fix', 'Prevention rule'] }
    ]
  },
  {
    id: 'microeconomics-incentives',
    domain: 'Strategy',
    pillar: 'strategic',
    title: 'Microeconomics: Incentives, Tradeoffs, Elasticity',
    sources: ['How To Do Microeconomics'],
    models: [
      'Everything is a tradeoff: opportunity cost is the hidden constraint',
      'Incentives drive behavior (often more than stated goals)',
      'Elasticity identifies leverage: where small changes create large effects'
    ],
    drills: [
      'For any decision: list opportunity costs explicitly (time, money, optionality, reputation).',
      'Map incentives for a situation: who benefits, who pays, and where misalignment creates friction.'
    ],
    templates: [
      { type: 'incentive-map', name: 'Incentive Map', fields: ['Actors', 'Goals', 'Incentives', 'Constraints', 'Levers', 'Likely moves'] },
      { type: 'tradeoff', name: 'Tradeoff Sheet', fields: ['Option', 'Pros', 'Cons', 'Opportunity cost', 'Second-order effects', 'Decision'] }
    ]
  },
  {
    id: 'contracts-changes-claims',
    domain: 'Contracts',
    pillar: 'technical',
    title: 'Contracts, Changes & Claims Discipline',
    sources: ['CCDC 17 (stipulated price, trade contracts)', 'Principles of Construction Law', 'Contract Administration course materials'],
    models: [
      'The contract is the project\'s operating system: every direction, delay, and dollar routes through its clauses — know YOUR notice periods before you need them',
      'Paper hierarchy: Contract > Change Order > Site Instruction > RFI response > meeting minute > email > conversation. Work only moves UP the hierarchy, never down',
      'Verbal direction is a liability transfer: whoever proceeds on a verbal instruction just accepted its cost risk — confirm in writing same day or don\'t proceed',
      'Notice is a right-preserver, not an aggression: a timely, neutral notice keeps options open; a late notice extinguishes entitlement no matter how valid the claim',
      'Every change has FOUR impacts to price before signing: direct cost, schedule/sequence, cumulative disruption, and trailing risk (warranty, access, coordination)',
      'Claims are prevented in daily records: the party with contemporaneous documentation wins; the party reconstructing from memory settles'
    ],
    drills: [
      'Take one live change/extra on your project. Trace its paper trail end-to-end (who directed it, in what form, priced when, approved by whom). Mark every gap in the chain.',
      'Write a practice notice letter for a delay event: neutral tone, facts only, clause reference, impact reservation, no blame. 10 minutes, timer on.',
      'RFI discipline drill: rewrite one vague RFI so it contains — the exact drawing/spec conflict, the cost/schedule consequence of a late answer, and a required-by date.',
      'TEACH-BACK: explain to a new coordinator in 90 seconds why "just do it, we\'ll paper it later" is the most expensive sentence on a jobsite.',
      'JOBSITE APPLICATION: next time you receive any verbal direction this week, send a same-day written confirmation ("Confirming our discussion today, we will proceed with…"). Log how it felt and how it was received.',
      'REFLECTION: where on your current project would you be unable to prove entitlement if the relationship went bad tomorrow? What record starts today?'
    ],
    templates: [
      { type: 'change-event-log', name: 'Change Event Log', fields: ['Event/direction', 'Received how (verbal/SI/CO/RFI)', 'Written confirmation sent (date)', 'Cost impact', 'Schedule impact', 'Notice required? (clause/deadline)', 'Status'] },
      { type: 'notice-letter', name: 'Notice Letter Skeleton', fields: ['Event + date discovered', 'Contract clause invoked', 'Facts (neutral, no blame)', 'Impact (known/unknown yet)', 'Rights reserved', 'Info requested', 'Required-by date'] }
    ]
  },
  {
    id: 'field-leadership-human-nature',
    domain: 'Leadership',
    pillar: 'leadership',
    title: 'Field Leadership: Human Nature on Site',
    sources: ['The Laws of Human Nature (Robert Greene)', 'CliftonStrengths ALL-34 profile', 'Construction PM career analyses'],
    models: [
      'Influence without authority: on site you command almost no one — you get performance through credibility (know your file), reciprocity (solve their problems first), and consistency (same person every day)',
      'Read the person behind the position: a foreman\'s resistance is rarely about your request — it\'s schedule pressure, crew politics, or saving face. Address the real driver',
      'Emotional regulation is a professional skill: the first person to get angry loses information — people stop telling the truth to volatile leaders',
      'De-escalation sequence: lower your voice → name their legitimate interest out loud → move from positions ("you must") to problems ("we both need this slab poured Friday — what\'s blocking you?")',
      'Accountability without ego: attack the gap between plan and reality, never the person — "the pour was 2 days late, walk me through what happened" beats "you\'re behind"',
      'Presence is a choice: walk the site at the same time daily, learn names, ask one real question per trade — leadership presence is compound interest paid in small daily deposits',
      'Profile hypothesis to test: Command #5 may support directness, while lower Clifton ranks for Empathy and Communication do not measure skill. Verify how the message landed through invited input, paraphrase, and receiver action'
    ],
    drills: [
      'Stakeholder read: pick one difficult person on your project. Write their pressures (boss, schedule, money, pride), their definition of a good week, and one thing you could do this week that costs you little and helps them a lot.',
      'Conflict rehearsal: take a real disagreement and script both sides — write their strongest argument BETTER than they would make it, then your response to that version.',
      'Emotional log: for 3 days, note every moment you felt irritation on site or in a meeting. What triggered it, what did your face/voice do, what did it cost you in information?',
      'TEACH-BACK: explain to a new coordinator in 90 seconds why the trade who argues with you openly is more valuable than the one who agrees and does nothing.',
      'JOBSITE APPLICATION: this week, have one accountability conversation using gap-not-person framing. Write down the exact sentence you opened with and what happened next.',
      'JOBSITE APPLICATION: learn two new names on site this week (Woo #33 counter-drill). Use each name in a question about THEIR work, and note one fact about each person.',
      'REFLECTION: whose silent compliance are you currently mistaking for agreement? What question would surface what they actually think?'
    ],
    templates: [
      { type: 'stakeholder-read', name: 'Stakeholder Read Sheet', fields: ['Person/role', 'Their pressures', 'Their win condition', 'Their fear', 'What I can offer cheaply', 'Relationship action this week'] },
      { type: 'tough-conversation', name: 'Tough Conversation Plan', fields: ['The gap (plan vs reality)', 'Opening sentence (gap, not person)', 'Their likely story', 'My non-negotiable', 'My flexible items', 'Follow-up in writing'] }
    ]
  }
];
  // Allow future extensions to append/override without editing this file:
  // window.DOCTRINE_EXTENSIONS = [...];
  let mods = BASE;
  if (Array.isArray(window.DOCTRINE_EXTENSIONS)) mods = mods.concat(window.DOCTRINE_EXTENSIONS);
  window.DOCTRINE_MODULES = mods;
})();
