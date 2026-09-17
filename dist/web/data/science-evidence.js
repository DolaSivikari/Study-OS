// ==================== STUDYOS SCIENCE EVIDENCE REGISTRY (V30) ====================
// Huberman Lab topic pages are used as discovery maps. Product decisions are
// graded against primary studies, systematic reviews, meta-analyses, and public
// health guidance. This is educational product guidance, not medical advice.

window.STUDYOS_SCIENCE = {
  reviewedAt: '2026-07-22',
  version: 1,
  grades: {
    strong: {
      label: 'Strong',
      meaning: 'Repeated experimental or synthesis evidence supports practical use, with normal boundary conditions.'
    },
    moderate: {
      label: 'Moderate',
      meaning: 'Useful evidence exists, but effects depend meaningfully on task, learner, timing, or study design.'
    },
    contextual: {
      label: 'Contextual',
      meaning: 'Plausible or promising for a narrow purpose; treat as an option to test, not a universal rule.'
    },
    excluded: {
      label: 'Not implemented',
      meaning: 'Evidence is too indirect, contested, medical, or easy to overstate for a default StudyOS instruction.'
    }
  },
  hubermanTopics: [
    { id:'memory', label:'Memory & learning', url:'https://www.hubermanlab.com/topics/memory-and-learning' },
    { id:'plasticity', label:'Brain & neuroplasticity', url:'https://www.hubermanlab.com/topics/brain-and-neuroplasticity' },
    { id:'health', label:'General health', url:'https://www.hubermanlab.com/topics/general-health' },
    { id:'focus', label:'Focus & concentration', url:'https://www.hubermanlab.com/topics/focus-and-concentration' },
    { id:'habits', label:'Goals & habits', url:'https://www.hubermanlab.com/topics/goals-and-habits' },
    { id:'routines', label:'Daily routines', url:'https://www.hubermanlab.com/topics/daily-routines' },
    { id:'regulation', label:'Regulate your nervous system', url:'https://www.hubermanlab.com/topics/regulate-your-nervous-system' },
    { id:'motivation', label:'Motivation & willpower', url:'https://www.hubermanlab.com/topics/motivation-and-willpower' },
    { id:'creativity', label:'Creativity', url:'https://www.hubermanlab.com/topics/creativity' },
    { id:'aging', label:'Aging & longevity', url:'https://www.hubermanlab.com/topics/aging-and-longevity' },
    { id:'relationships', label:'Emotional intelligence & relationships', url:'https://www.hubermanlab.com/topics/emotional-intelligence-and-relationships' }
  ],
  claims: [
    {
      id:'retrieval-practice', topic:'learning', grade:'strong',
      title:'Retrieve before re-reading',
      plain:'Trying to recall an answer strengthens later access and exposes gaps that passive review can hide.',
      use:'Pretest, close the source, retrieve, then compare against an answer and correct the gap.',
      boundary:'Retrieval needs corrective feedback. A feeling of difficulty is not proof that the answer was learned.',
      implemented:'Learning Cycle, Flashcards, PMP scenarios',
      sources:[
        { label:'Classroom retrieval-practice systematic review', url:'https://pdf.poojaagarwal.com/Agarwal_etal_2021_EDPR.pdf', kind:'Systematic review' },
        { label:'Retrieval practice in real primary-school classrooms', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12372469/', kind:'Applied study' }
      ]
    },
    {
      id:'spacing', topic:'learning', grade:'strong',
      title:'Distribute practice across time',
      plain:'Repeated study separated in time usually produces better delayed retention than the same practice massed together.',
      use:'Schedule a later retrieval check; shorten the gap after a failed recall and expand it after independent recall.',
      boundary:'There is no single perfect 1/3/7/14 schedule. The useful gap depends on current recall and how long knowledge must last.',
      implemented:'Adaptive Flashcards and retrieval follow-up tasks',
      sources:[
        { label:'Distributed-practice meta-analysis', url:'https://pubmed.ncbi.nlm.nih.gov/16719566/', kind:'Meta-analysis' },
        { label:'Spacing in real classrooms', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12189222/', kind:'Meta-analysis' }
      ]
    },
    {
      id:'feedback', topic:'learning', grade:'strong',
      title:'Correct the specific error',
      plain:'Feedback is most useful when it carries information about the task, strategy, or next correction—not only a grade or praise.',
      use:'Classify the gap, write the correction, and re-solve or retrieve again.',
      boundary:'Feedback effects vary. Vague praise and outcome-only scores can add little information.',
      implemented:'Learning Cycle error ledger and Practice & Judgment',
      sources:[
        { label:'Educational feedback meta-analysis', url:'https://pubmed.ncbi.nlm.nih.gov/32038429/', kind:'Meta-analysis' },
        { label:'The Power of Feedback', url:'https://conselhopedagogico.tecnico.ulisboa.pt/files/sites/32/hattie-and-timperley-2007.pdf', kind:'Evidence review' }
      ]
    },
    {
      id:'worked-example-fading', topic:'learning', grade:'moderate',
      title:'Match support to current expertise',
      plain:'Novices often benefit from worked examples and guided completion; as knowledge grows, excessive guidance can become redundant.',
      use:'Choose an example-first cycle for a new procedure, then fade steps and solve independently.',
      boundary:'Expertise is narrow and task-specific. Do not label yourself globally as a novice or expert.',
      implemented:'Learning Cycle method selector',
      sources:[
        { label:'Expertise-reversal review', url:'https://www.uky.edu/~gmswan3/EDC608/Kalyuga2007_Article_ExpertiseReversalEffectAndItsI.pdf', kind:'Review' },
        { label:'Expertise-reversal effect overview', url:'https://pubmed.ncbi.nlm.nih.gov/21443379/', kind:'Review' }
      ]
    },
    {
      id:'pretesting-generation', topic:'learning', grade:'moderate',
      title:'Attempt or predict before instruction',
      plain:'A prequestion or generation attempt can direct attention and improve learning of the tested material when the correct answer follows.',
      use:'Write a prediction or attempted solution before opening the source, then inspect why it was right or wrong.',
      boundary:'Benefits are strongest for targeted material and are not a license for unsupported discovery on every novice task.',
      implemented:'Learning Cycle pretest phase',
      sources:[
        { label:'Prequestioning review and framework', url:'https://link.springer.com/article/10.1007/s10648-023-09814-5', kind:'Systematic review' },
        { label:'Generation-effect meta-analysis', url:'https://link.springer.com/article/10.3758/s13423-020-01762-3', kind:'Meta-analysis' }
      ]
    },
    {
      id:'interleaving', topic:'learning', grade:'moderate',
      title:'Interleave when discrimination matters',
      plain:'Mixing related categories or problem types can improve later selection of the right method, especially when examples are confusable.',
      use:'Use Mixed Review for related categories; use Focused Review when first building one unfamiliar procedure.',
      boundary:'Interleaving is not universally better for every text, skill, or early learning stage.',
      implemented:'Flashcards Mixed and Focused modes',
      sources:[
        { label:'Interleaved-learning meta-analysis', url:'https://pubmed.ncbi.nlm.nih.gov/31556629/', kind:'Meta-analysis' }
      ]
    },
    {
      id:'sleep-readiness', topic:'readiness', grade:'strong',
      title:'Protect sleep; adapt today’s load',
      plain:'Sleep loss can impair attention, encoding, and consolidation. A rough night is context for adjusting work—not evidence that learning is impossible.',
      use:'Use a lighter retrieval/review block when self-rated sleep and energy are low; protect the next sleep opportunity.',
      boundary:'StudyOS does not diagnose sleep problems or prescribe treatment. Self-ratings are subjective and personal patterns are correlational.',
      implemented:'Readiness check and optional morning-energy link',
      sources:[
        { label:'Sleep deprivation and memory meta-analytic reviews', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8893218/', kind:'Meta-analysis' },
        { label:'CDC sleep guidance', url:'https://www.cdc.gov/sleep/about/index.html', kind:'Public-health guidance' }
      ]
    },
    {
      id:'breaks-rest', topic:'focus', grade:'moderate',
      title:'Use adjustable focus blocks and genuine breaks',
      plain:'Sustained attention can decline and breaks can support performance, but evidence does not establish one universal 90-minute human focus cycle.',
      use:'Choose a block you can execute well, observe recall quality and interruptions, then adjust the next block.',
      boundary:'A break is not another demanding task. Duration should reflect the task and your observed performance.',
      implemented:'25/45/60/90/custom session choices and post-session evidence',
      sources:[
        { label:'Micro-break systematic review and meta-analysis', url:'https://www.highperformanceroutines.com/wp-content/uploads/2023/10/Give-me-a-break-A-systematic-review.pdf', kind:'Meta-analysis' },
        { label:'Rest breaks and complex learning', url:'https://www.tandfonline.com/doi/full/10.1080/20590776.2023.2225700', kind:'Experiment' }
      ]
    },
    {
      id:'resume-plan', topic:'focus', grade:'moderate',
      title:'Leave a ready-to-resume note before switching',
      plain:'When interrupted, a brief note about where you stopped and the next action can reduce attention left on the unfinished task.',
      use:'Write one concrete next step before moving to a meeting, journal, task, or other commitment.',
      boundary:'Evidence comes mainly from work-task experiments; treat it as a low-cost continuity tool.',
      implemented:'Learning Cycle interruption note',
      sources:[
        { label:'Tasks Interrupted: ready-to-resume studies', url:'https://experts.umn.edu/en/publications/tasks-interrupted-how-anticipating-time-pressure-on-resumption-of/', kind:'Four studies' }
      ]
    },
    {
      id:'implementation-intentions', topic:'habits', grade:'strong',
      title:'Use an if–then execution cue',
      plain:'Specifying when and where an action will happen can help translate an existing goal into behavior.',
      use:'Write “If/after [cue], then I will [small behavior] at [place].”',
      boundary:'The plan supports follow-through; it does not create motivation or guarantee success by itself.',
      implemented:'Habit anchors, location, and two-minute versions',
      sources:[
        { label:'Implementation intentions and goal achievement', url:'https://cancercontrol.cancer.gov/sites/default/files/2020-06/goal_intent_attain.pdf', kind:'Meta-analysis and review' }
      ]
    },
    {
      id:'habit-automaticity', topic:'habits', grade:'moderate',
      title:'Build habits through repeated context-linked action',
      plain:'Habits develop through repetition in recurring contexts; automaticity grows at different rates for different people and behaviors.',
      use:'Track whether the cue occurred and the behavior followed instead of counting down to a magic day.',
      boundary:'There is no evidence-based fixed 21-day finish line. Missing once need not erase prior learning.',
      implemented:'Habit recipe and context tracking',
      sources:[
        { label:'Psychology of Habit', url:'https://dornsife.usc.edu/wendy-wood/wp-content/uploads/sites/183/2023/10/wood.runger.2016.pdf', kind:'Annual review' },
        { label:'Making health habitual', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC3505409/', kind:'Review' }
      ]
    },
    {
      id:'breathing-regulation', topic:'readiness', grade:'contextual',
      title:'Brief slow breathing can be an optional settling tool',
      plain:'A remote randomized study found that five minutes of daily structured breathing, especially exhale-emphasized breathing, improved mood and reduced respiratory rate over one month.',
      use:'If you feel overactivated, optionally use comfortable slow breathing with a longer exhale before studying.',
      boundary:'This is not proven to improve learning, is not a treatment, and should stop if uncomfortable or dizzy. StudyOS excludes hyperventilation and breath-hold protocols.',
      implemented:'Optional readiness suggestion only',
      sources:[
        { label:'Brief structured respiration randomized study', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/', kind:'Randomized remote study' }
      ]
    },
    {
      id:'wakeful-rest', topic:'learning', grade:'moderate',
      title:'A brief low-input rest can be a reasonable option after learning',
      plain:'Across laboratory studies, quiet wakeful rest after encoding often benefits later memory relative to an active distractor task, although effects and methods vary.',
      use:'After an effortful cycle, optionally take a few quiet minutes without new study material or another demanding task.',
      boundary:'This is an optional consolidation context, not a requirement or a substitute for sleep, retrieval, and feedback.',
      implemented:'Optional post-cycle rest record',
      sources:[
        { label:'Wakeful-rest memory systematic review', url:'https://link.springer.com/article/10.3758/s13423-025-02665-x', kind:'Systematic review' }
      ]
    },
    {
      id:'incubation', topic:'creativity', grade:'moderate',
      title:'Separate idea generation from evaluation',
      plain:'Setting a problem aside can modestly improve later problem solving, with larger average benefits in divergent-thinking tasks.',
      use:'Generate possibilities, record the unresolved question, take an undemanding break, then return to select and test.',
      boundary:'Incubation is not passive magic; effects vary by problem type and what happens during the break.',
      implemented:'Creative incubation cycle',
      sources:[
        { label:'Incubation meta-analysis', url:'https://pubmed.ncbi.nlm.nih.gov/19210055/', kind:'Meta-analysis' }
      ]
    },
    {
      id:'affect-labeling', topic:'regulation', grade:'contextual',
      title:'Name the state before choosing the response',
      plain:'Putting an emotion into words can change emotional reactivity in laboratory tasks.',
      use:'Use a neutral label—“I notice frustration” or “high activation”—then choose the smallest useful next action.',
      boundary:'Effects depend on intensity and timing; this is a reflection aid, not therapy or a substitute for care.',
      implemented:'Readiness language and journal prompt',
      sources:[
        { label:'Putting feelings into words', url:'https://pubmed.ncbi.nlm.nih.gov/17576282/', kind:'fMRI experiment' },
        { label:'Affect-labeling timing and intensity', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9799301/', kind:'Experiments' }
      ]
    },
    {
      id:'neuroplasticity', topic:'plasticity', grade:'strong',
      title:'Learning reflects task-specific change—not a brain hack',
      plain:'Adult nervous systems remain capable of experience-dependent change. The product evidence that matters is improved delayed retrieval, transfer, accuracy, and judgment.',
      use:'Repeat a defined skill, attend to feedback, correct errors, and test later in a relevant context.',
      boundary:'Brain-region stories rarely determine the best study method by themselves. Neurogenesis, neurotransmitter, and animal findings should not be translated directly into productivity rules.',
      implemented:'Outcome-first evidence standard across StudyOS',
      sources:[
        { label:'The persistence of neuromyths in education', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7835631/', kind:'Systematic review' },
        { label:'Adult human neurogenesis—current uncertainty', url:'https://www.nature.com/articles/s41586-026-10169-4', kind:'Human multiomic study' }
      ]
    },
    {
      id:'growth-mindset', topic:'motivation', grade:'contextual',
      title:'Praise strategies and correction—not a fixed identity',
      plain:'Process-focused feedback can be more actionable than labeling intelligence, but stand-alone growth-mindset programs show very small or unreliable academic effects in higher-quality analyses.',
      use:'Record the strategy tried, evidence produced, error found, and next adjustment.',
      boundary:'A mindset slogan cannot replace instruction, practice, opportunity, or feedback.',
      implemented:'Process language in session reviews',
      sources:[
        { label:'Growth-mindset intervention meta-analysis', url:'https://pubmed.ncbi.nlm.nih.gov/36326645/', kind:'Meta-analysis' },
        { label:'Intelligence versus effort praise experiments', url:'https://pubmed.ncbi.nlm.nih.gov/9686450/', kind:'Six experiments' }
      ]
    },
    {
      id:'fixed-21-day', topic:'excluded', grade:'excluded',
      title:'Fixed 21-day habit program',
      plain:'Habit automaticity does not arrive on one universal schedule.',
      use:'Use repeated context-linked behavior and observe your own automaticity instead.',
      boundary:'StudyOS will not promise that six habits become automatic in 21 days.',
      implemented:'Explicitly excluded', sources:[]
    },
    {
      id:'fixed-90-minute', topic:'excluded', grade:'excluded',
      title:'Universal 90-minute focus cycle',
      plain:'Ultradian rhythms do not establish a mandatory 90-minute cognitive work block for every person and task.',
      use:'Select and calibrate block length using task performance, recall quality, and interruption data.',
      boundary:'Ninety minutes remains an available user choice, not a biological prescription.',
      implemented:'Explicitly excluded as a rule', sources:[]
    },
    {
      id:'adrenaline-cold', topic:'excluded', grade:'excluded',
      title:'Cold or adrenaline after studying to lock in memory',
      plain:'The podcast inference is too indirect and potentially burdensome to recommend as a StudyOS learning protocol.',
      use:'Use retrieval, feedback, spacing, rest, and sleep instead.',
      boundary:'StudyOS does not prompt cold exposure, stimulant use, or deliberate stress for memory.',
      implemented:'Explicitly excluded', sources:[]
    },
    {
      id:'dopamine-willpower', topic:'excluded', grade:'excluded',
      title:'Dopamine stacking or a depleting willpower tank',
      plain:'Simple neurotransmitter stories and the classic limited-resource ego-depletion model do not support reliable scheduling rules.',
      use:'Reduce friction, define the next action, use cues, and adjust workload using observed behavior.',
      boundary:'Motivation fluctuates, but StudyOS does not calculate dopamine or a biological willpower reserve.',
      implemented:'Explicitly excluded',
      sources:[
        { label:'Preregistered ego-depletion replication', url:'https://pubmed.ncbi.nlm.nih.gov/27474142/', kind:'23-lab replication' },
        { label:'Multisite paradigmatic replication', url:'https://carlsonschool.umn.edu/sites/carlsonschool.umn.edu/files/2026-01/vohs-et-al-2021-psci-ego-depletion.pdf', kind:'36-lab replication' }
      ]
    },
    {
      id:'medical-performance-hacks', topic:'excluded', grade:'excluded',
      title:'Supplements, psychedelics, hyperventilation, and longevity protocols',
      plain:'These are outside the educational scope and introduce medical, safety, legal, and individual-risk questions.',
      use:'StudyOS stays with behavior, learning design, self-observation, and ordinary health-supporting context.',
      boundary:'Discuss personal medical questions with a qualified clinician.',
      implemented:'Explicitly excluded', sources:[]
    }
  ]
};
