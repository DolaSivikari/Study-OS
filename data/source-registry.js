// ==================== DOCTRINE SOURCE REGISTRY ====================
// Maps every book/textbook to a trackable source with coverage metadata.
// totalUnits = approximate chapters or major sections.
// pillar = technical | strategic | leadership

(function(){
  window.DOCTRINE_SOURCES = [
    // ── Leadership & Behavior ──
    { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', pillar: 'leadership', totalUnits: 20, tags: ['habits','behavior','identity'] },
    { id: 'tiny-habits', title: 'Tiny Habits', author: 'BJ Fogg', pillar: 'leadership', totalUnits: 12, tags: ['habits','behavior','motivation'] },
    { id: 'deep-work', title: 'Deep Work', author: 'Cal Newport', pillar: 'technical', totalUnits: 14, tags: ['focus','execution','deliberate-practice'] },
    { id: 'peak', title: 'Peak', author: 'K. Anders Ericsson', pillar: 'technical', totalUnits: 10, tags: ['deliberate-practice','mastery','performance'] },
    { id: 'asking-right-questions', title: 'Asking the Right Questions', author: 'Browne & Keeley', pillar: 'strategic', totalUnits: 14, tags: ['critical-thinking','analysis','reasoning'] },

    // ── Learning Science ──
    { id: 'make-it-stick', title: 'Make It Stick', author: 'Brown, Roediger & McDaniel', pillar: 'strategic', totalUnits: 8, tags: ['learning','retention','retrieval'] },
    { id: 'how-we-learn', title: 'How We Learn', author: 'Benedict Carey', pillar: 'strategic', totalUnits: 13, tags: ['learning','memory','spacing'] },
    { id: 'livewired', title: 'Livewired', author: 'David Eagleman', pillar: 'strategic', totalUnits: 10, tags: ['neuroscience','neuroplasticity','adaptation'] },
    { id: 'extended-mind', title: 'The Extended Mind', author: 'Annie Murphy Paul', pillar: 'strategic', totalUnits: 10, tags: ['cognition','environment','embodied'] },

    // ── Construction & Engineering ──
    { id: 'ching-bci', title: 'Building Construction Illustrated', author: 'Francis D.K. Ching', pillar: 'technical', totalUnits: 12, tags: ['construction','illustration','systems'] },
    { id: 'kultermann-cmmt', title: 'Construction Materials, Methods, and Techniques', author: 'Kultermann & Spence', pillar: 'technical', totalUnits: 42, edition: '5th', isCornerstone: true, sequence: 5, tags: ['materials','methods','construction','sustainability'] },
    { id: 'delpico-estimating', title: 'Estimating Building Costs', author: 'Wayne J. Del Pico', pillar: 'technical', totalUnits: 28, isCornerstone: true, sequence: 7, tags: ['estimating','cost','takeoff','scope'] },
    { id: 'bird-math', title: "Bird's Higher Engineering Mathematics", author: 'John Bird', pillar: 'technical', totalUnits: 76, edition: '9th', isCornerstone: true, sequence: 3, tags: ['math','calculus','engineering','differential-equations'] },
    { id: 'bcp-systems', title: 'Building Construction: Principles, Materials, and Systems', author: 'Mehta, Scarborough & Armpriest', pillar: 'technical', totalUnits: 37, isCornerstone: true, sequence: 4, tags: ['construction','systems','principles','building-science'] },
    { id: 'ciqs-measurement', title: 'Method of Measurement of Construction Works', author: 'CIQS', pillar: 'technical', totalUnits: 15, tags: ['measurement','quantity','takeoff'] },
    { id: 'surveying', title: 'Surveying with Construction Applications', author: 'Kavanagh & Mastin', pillar: 'technical', totalUnits: 17, edition: '7th', isCornerstone: true, sequence: 6, tags: ['surveying','measurement','site','layout'] },
    { id: 'cebok3', title: 'Civil Engineering Body of Knowledge', author: 'ASCE CEBOK3 Task Committee', pillar: 'leadership', totalUnits: 21, edition: '3rd', isCornerstone: true, sequence: 8, tags: ['civil-engineering','competency','ethics','professional-practice'] },
    { id: 'construction-drawings', title: 'Understanding Construction Drawings', author: 'Huth & Ashton', pillar: 'technical', totalUnits: 14, tags: ['drawings','plans','reading'] },
    { id: 'physics-scientists', title: 'Physics for Scientists & Engineers', author: 'Various', pillar: 'technical', totalUnits: 25, tags: ['physics','engineering','mechanics'] },
    { id: 'physics-principles', title: 'Physics: Principles with Applications', author: 'Giancoli', pillar: 'technical', totalUnits: 20, tags: ['physics','applications','fundamentals'] },
    { id: 'microeconomics', title: 'How To Do Microeconomics', author: 'Various', pillar: 'strategic', totalUnits: 12, tags: ['economics','microeconomics','analysis'] },

    // ── V18: Contracts, Law & Leadership ──
    { id: 'laws-human-nature', title: 'The Laws of Human Nature', author: 'Robert Greene', pillar: 'leadership', totalUnits: 18, tags: ['leadership','influence','psychology','stakeholders'] },
    { id: 'ccdc-17', title: 'CCDC 17 — Stipulated Price Contract (Trade)', author: 'CCDC', pillar: 'technical', totalUnits: 10, tags: ['contract','changes','notices','canadian'] },
    { id: 'construction-law', title: 'Principles of Construction Law', author: 'Course materials', pillar: 'strategic', totalUnits: 12, tags: ['contract','law','claims','liability'] },
    { id: 'contract-admin', title: 'Project Management Contract Administration', author: 'Course slides', pillar: 'technical', totalUnits: 10, tags: ['contract','administration','changes','documentation'] },

    // ── V18: PMP & Estimating ──
    { id: 'kerzner-cases', title: 'Project Management Case Studies', author: 'Harold Kerzner', pillar: 'strategic', totalUnits: 15, tags: ['pmp','case-studies','scenarios','judgment'] },
    { id: 'pmp-eco-2021', title: 'PMP Exam Content Outline (2021 — legacy)', author: 'PMI', pillar: 'strategic', totalUnits: 3, tags: ['pmp','exam','legacy','people','process','business-environment'] },
    { id: 'pmp-eco-2026', title: 'PMP Examination Content Outline (July 2026)', author: 'PMI', pillar: 'strategic', totalUnits: 3, tags: ['pmp','exam','2026','people','process','business-environment'] },
    { id: 'practice-std-estimating', title: 'Practice Standard for Project Estimating (2nd ed.)', author: 'PMI', pillar: 'technical', totalUnits: 9, tags: ['estimating','basis-of-estimate','contingency'] },

    // ── V18: Math ladder & meta-learning ──
    { id: 'bird-basic-math', title: "Bird's Basic Engineering Mathematics", author: 'John Bird', pillar: 'technical', totalUnits: 38, edition: '7th', isCornerstone: true, sequence: 1, tags: ['math','foundations','engineering'] },
    { id: 'bird-eng-math', title: "Bird's Engineering Mathematics", author: 'John Bird', pillar: 'technical', totalUnits: 67, edition: '8th', isCornerstone: true, sequence: 2, tags: ['math','calculus','engineering','statistics'] },
    { id: 'math-study-major', title: 'How to Study as a Mathematics Major', author: 'Lara Alcock', pillar: 'strategic', totalUnits: 10, tags: ['meta-learning','math','proof','self-explanation'] }
  ];
})();
