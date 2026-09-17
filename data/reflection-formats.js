// ==================== REFLECTION FORMATS (V63) ====================
//
// Structured reflection formats, the sentence stems that scaffold them, and a
// construction/PM precision vocabulary.
//
// WHY THIS EXISTS
// Journal was a free-text box with a placeholder reading "Start writing your
// thoughts...", plus tags and a streak counter. Every other domain in StudyOS
// has a doctrine, an evidence base and a drill; reflection — one of the stated
// reasons this system exists — had none of that. And for a writer whose first
// language is not English, a blank box is the hardest possible starting point.
//
// EVIDENCE BOUNDARY (same rule as data/science-evidence.js)
// These are established, documented reflective practice frameworks. They are
// structures for thinking, not clinical instruments, and none of them is
// claimed to improve writing on its own. What they reliably do is remove the
// blank page and force the step most people skip: naming the gap between what
// was expected and what happened.
//
// The stems are scaffolding, meant to be outgrown. They are not templates to
// submit — they are openings, so the first sentence is never the hard one.

window.STUDYOS_REFLECTION_FORMATS = [
  {
    id: 'aar',
    name: 'After-Action Review',
    short: 'AAR',
    icon: '🏗️',
    bestFor: 'A site day, a meeting, a coordination problem, anything that did not go to plan',
    origin: 'U.S. Army After-Action Review; standard practice in construction and aviation debriefs',
    why: 'Forces you to separate what you INTENDED from what HAPPENED before you explain anything. Most reflection collapses those two and learns the wrong lesson.',
    sections: [
      {
        id: 'intended',
        label: 'What was supposed to happen?',
        hint: 'The plan as it stood that morning. No hindsight.',
        stems: [
          'The plan was to',
          'We were scheduled to',
          'I expected the crew to',
          'The sequence was supposed to be',
          'By end of shift we should have'
        ]
      },
      {
        id: 'actual',
        label: 'What actually happened?',
        hint: 'Observable facts only. What a camera would have recorded.',
        stems: [
          'In fact,',
          'What actually happened was',
          'The crew instead',
          'By 2pm we had only',
          'The delivery arrived'
        ]
      },
      {
        id: 'gap',
        label: 'Why was there a difference?',
        hint: 'Causes, not blame. Look for the decision or the missing information.',
        stems: [
          'The gap came from',
          'The root cause was',
          'We did not know that',
          'The decision to ___ assumed',
          'Nobody had confirmed'
        ]
      },
      {
        id: 'next',
        label: 'What will I do differently?',
        hint: 'One specific, checkable action. If you cannot check it next week, it is too vague.',
        required: true,
        actionable: true,
        stems: [
          'Next time I will',
          'Before the next pour I will confirm',
          'I will ask ___ to verify',
          'I will raise this at',
          'I will document'
        ]
      }
    ]
  },
  {
    id: 'wsw',
    name: 'What / So What / Now What',
    short: 'WSW',
    icon: '📚',
    bestFor: 'A study session, a chapter, a drill, a lecture',
    origin: 'Rolfe, Freshwater & Jasper reflective model (from Borton)',
    why: 'The shortest format that still forces the middle step. Most study notes record WHAT and skip why it matters, which is the part that makes it stick.',
    sections: [
      {
        id: 'what',
        label: 'What?',
        hint: 'What did you study or encounter? Be concrete.',
        stems: [
          'I worked through',
          'The chapter covered',
          'I practised',
          'The problem set asked me to'
        ]
      },
      {
        id: 'sowhat',
        label: 'So what?',
        hint: 'Why does this matter? What changed in your understanding?',
        stems: [
          'This matters because',
          'It changes how I think about',
          'I had assumed ___, but',
          'This connects to',
          'The part I still cannot explain is'
        ]
      },
      {
        id: 'nowwhat',
        label: 'Now what?',
        hint: 'One next action or one question to resolve.',
        required: true,
        actionable: true,
        stems: [
          'Next I will',
          'I need to practise',
          'I will test whether',
          'I will ask'
        ]
      }
    ]
  },
  {
    id: 'star',
    name: 'STAR — evidence for interviews',
    short: 'STAR',
    icon: '🎯',
    bestFor: 'Anything you did well, or handled, that belongs on a resume or in an interview',
    origin: 'Behavioural interview standard; the format most hiring panels score against',
    why: 'You are moving toward Project Manager and Superintendent. Interviews for those roles are won on specific stories with measurable results — and those stories are impossible to reconstruct a year later. Capture them the day they happen.',
    sections: [
      { id: 'situation', label: 'Situation', hint: 'Project, phase, and the constraint. One or two sentences.',
        stems: ['On the ___ project,', 'During ___ phase,', 'We were ___ days behind on'] },
      { id: 'task', label: 'Task', hint: 'What were YOU responsible for? Not the team — you.',
        stems: ['I was responsible for', 'My job was to', 'I had to coordinate'] },
      { id: 'action', label: 'Action', hint: 'What you actually did, step by step. Use "I", not "we".',
        stems: ['I reviewed', 'I coordinated with', 'I escalated', 'I proposed', 'I documented'] },
      { id: 'result', label: 'Result', hint: 'The outcome, with a number if one exists. Days saved, rework avoided, cost, defects.',
        required: true,
        stems: ['As a result,', 'This saved', 'The inspection passed with', 'We recovered ___ days'] }
    ]
  },
  {
    id: 'gibbs',
    name: "Gibbs' Reflective Cycle",
    short: 'Gibbs',
    icon: '🔁',
    bestFor: 'Something that affected you — conflict, a hard conversation, a mistake that stuck with you',
    origin: 'Gibbs (1988), Learning by Doing',
    why: 'The only one of these formats that gives feelings their own step. That is deliberate: unexamined frustration distorts the analysis that follows it.',
    sections: [
      { id: 'description', label: 'Description', hint: 'What happened? Facts only.',
        stems: ['What happened was', 'The situation was'] },
      { id: 'feelings', label: 'Feelings', hint: 'What were you thinking and feeling? Nobody else reads this.',
        stems: ['I felt', 'At the time I was thinking', 'Afterwards I felt'] },
      { id: 'evaluation', label: 'Evaluation', hint: 'What was good and bad about the experience?',
        stems: ['What went well was', 'What did not work was'] },
      { id: 'analysis', label: 'Analysis', hint: 'What sense can you make of it? Bring in something you have read.',
        stems: ['This is an example of', 'The doctrine on ___ says', 'Looking at it now,'] },
      { id: 'conclusion', label: 'Conclusion', hint: 'What else could you have done?',
        stems: ['I could have', 'A better approach would have been'] },
      { id: 'action', label: 'Action plan', hint: 'If it happened again, what would you do?',
        required: true, actionable: true,
        stems: ['If this happens again I will', 'I will prepare by'] }
    ]
  },
  {
    id: 'free',
    name: 'Free writing',
    short: 'Free',
    icon: '✍️',
    bestFor: 'When you do not yet know what you think',
    origin: '—',
    why: 'Structure helps until it constrains. Some days the point is to write until the thought appears.',
    sections: [
      { id: 'body', label: 'Write', hint: 'No structure. Keep the hand moving.', stems: [] }
    ]
  }
];

// ==================== PRECISION VOCABULARY ====================
//
// Vague word → sharper alternatives, weighted toward construction and project
// management usage. This is a writing aid, NOT a grammar checker: it never
// rewrites your sentence and never claims something is wrong. It points at
// words that carry little information and offers more precise ones.
//
// Second-language writers usually have the vocabulary but reach for the
// general word under time pressure. Seeing the specific alternative next to
// the general one is what moves it into active use.

window.STUDYOS_PRECISION_VOCAB = {
  'thing': ['item', 'issue', 'component', 'deliverable', 'constraint'],
  'things': ['items', 'issues', 'components', 'deliverables'],
  'stuff': ['material', 'equipment', 'documentation', 'scope'],
  'good': ['compliant', 'within tolerance', 'on schedule', 'well-sequenced', 'defect-free'],
  'bad': ['non-compliant', 'out of tolerance', 'behind schedule', 'poorly sequenced', 'defective'],
  'nice': ['well-executed', 'clean', 'precise'],
  'big': ['significant', 'substantial', 'critical', 'large-scale'],
  'small': ['minor', 'localised', 'incidental'],
  'a lot': ['significant', 'substantial', 'a measurable amount of'],
  'lots of': ['numerous', 'substantial', 'repeated'],
  'get': ['obtain', 'receive', 'procure', 'secure'],
  'got': ['received', 'obtained', 'secured'],
  'do': ['perform', 'execute', 'carry out', 'complete'],
  'did': ['performed', 'executed', 'completed'],
  'make': ['produce', 'fabricate', 'prepare', 'issue'],
  'made': ['produced', 'fabricated', 'issued'],
  'said': ['confirmed', 'directed', 'noted', 'raised', 'instructed'],
  'told': ['instructed', 'notified', 'advised'],
  'talked': ['coordinated', 'consulted', 'escalated', 'briefed'],
  'problem': ['issue', 'non-conformance', 'clash', 'constraint', 'defect'],
  'fix': ['remediate', 'rectify', 'correct', 'repair'],
  'fixed': ['remediated', 'rectified', 'corrected'],
  'late': ['behind schedule', 'past the committed date', 'delayed by ___ days'],
  'fast': ['ahead of schedule', 'expedited'],
  'checked': ['verified', 'inspected', 'confirmed against'],
  'looked at': ['reviewed', 'examined', 'assessed'],
  'went': ['proceeded', 'attended', 'mobilised'],
  'ok': ['acceptable', 'compliant', 'approved'],
  'a bit': ['slightly', 'marginally'],
  'really': ['—', 'significantly', 'materially'],
  'very': ['—', 'significantly', 'substantially']
};

// Hedges. Useful in moderation — overuse makes a reflection unfalsifiable,
// which defeats the point of writing it down.
window.STUDYOS_HEDGE_WORDS = [
  'maybe', 'perhaps', 'kind of', 'sort of', 'i think', 'i guess',
  'probably', 'possibly', 'somewhat', 'a little bit', 'more or less'
];

// Verbs that signal a checkable commitment, used to tell a real next action
// from an intention.
window.STUDYOS_ACTION_VERBS = [
  'will', 'confirm', 'verify', 'ask', 'raise', 'document', 'schedule',
  'review', 'send', 'call', 'measure', 'check', 'draft', 'prepare',
  'escalate', 'coordinate', 'inspect', 'practise', 'practice', 'study', 'test'
];
