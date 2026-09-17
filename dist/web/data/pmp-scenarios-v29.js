// ==================== V29 PRACTICE & JUDGMENT SCENARIOS ====================
// Original, source-mapped practice cases for the July 2026 PMP ECO.
// These cases teach transfer and judgment; they do not reproduce exam items
// or textbook questions. `task` uses the stable V29 ECO task identifiers.

(function(){
  if (typeof PMP_SCENARIOS === 'undefined' || !Array.isArray(PMP_SCENARIOS)) return;

  var cases = [
    {
      id: 'v29-ppl-vision-jv', eco: 'People', task: 'PPL-1', skill: 'shared_vision', moduleId: 'p1', approach: 'hybrid', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'cebok3', 'kerzner-cases'], principle: 'stakeholders', process: '2026:PPL-1',
      q: 'A joint-venture partner keeps optimizing for lowest installed cost while your owner measures success by safe turnover and low life-cycle cost. Coordination meetings keep reopening the same decisions. What should the project manager do FIRST?',
      choices: ['Ask the sponsor to impose the owner\'s priorities', 'Facilitate a shared success statement with decision criteria, then confirm it with key stakeholders', 'Let each workstream use its own definition of value', 'Freeze all disputed decisions until the next governance meeting'], answer: 1,
      mindset: 'Create a usable common vision before forcing individual decisions.',
      weak: 'A substitutes authority for alignment; C preserves the conflict; D pauses work without repairing the decision system.',
      explain: 'The repeated disagreement signals that stakeholders are using different definitions of success. Establish shared outcomes and decision criteria, confirm them, and use them to guide later trade-offs.',
      errorMap: {0:'governance_bypass',2:'context_misread',3:'sequence_error'},
      transferPrompt: 'Write the three decision criteria you would put into the shared success statement.'
    },
    {
      id: 'v29-ppl-conflict-design', eco: 'People', task: 'PPL-2', skill: 'conflict_resolution', moduleId: 'p2', approach: 'predictive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'bcp-systems', 'kerzner-cases'], principle: 'team', process: '2026:PPL-2',
      q: 'The structural engineer and steel detailer blame each other for a connection-design delay. Both have defensible contract interpretations, and fabrication is now at risk. What is the BEST next action?',
      choices: ['Issue a written direction assigning responsibility to the detailer', 'Escalate the dispute to legal counsel before discussing the technical issue', 'Bring the parties together to separate facts, interests, and decision authority, then agree on a resolution path', 'Ask fabrication to proceed using the detailer\'s assumption'], answer: 2,
      mindset: 'Diagnose the conflict and establish a collaborative resolution path before directing work.',
      weak: 'A decides disputed responsibility prematurely; B escalates before facilitated problem solving; D creates rework and liability exposure.',
      explain: 'Clarify the technical facts, contract interfaces, interests, and who has authority to decide. A facilitated resolution can protect the schedule while preserving the formal rights of all parties.',
      errorMap: {0:'governance_bypass',1:'sequence_error',3:'context_misread'},
      transferPrompt: 'List one fact, one interest, and one authority question you would surface in the meeting.'
    },
    {
      id: 'v29-ppl-lead-voice', eco: 'People', task: 'PPL-3', skill: 'team_leadership', moduleId: 'p1', approach: 'adaptive', difficulty: 2,
      sourceIds: ['pmp-eco-2026', 'cebok3'], principle: 'leadership', process: '2026:PPL-3',
      q: 'A highly experienced superintendent answers every question in planning sessions. Junior coordinators have stopped raising constraints, and missed information is appearing in the field. What should the project manager do?',
      choices: ['Ask the superintendent to continue because speed matters most', 'Replace the planning meeting with written status reports', 'Privately coach the superintendent, establish turn-taking and invite owners for each constraint', 'Tell the junior staff they must become more assertive'], answer: 2,
      mindset: 'Change the team environment so expertise does not suppress information.',
      weak: 'A reinforces the failure mode; B removes useful interaction; D treats a system and leadership issue as only a junior-person problem.',
      explain: 'The project needs the superintendent\'s expertise and the team\'s distributed knowledge. Coach privately and structure participation so constraints have named owners and every role can contribute.',
      errorMap: {0:'stakeholder_misread',1:'context_misread',3:'stakeholder_misread'},
      transferPrompt: 'Design one meeting rule that would make missing constraints visible without slowing every discussion.'
    },
    {
      id: 'v29-ppl-engage-community', eco: 'People', task: 'PPL-4', skill: 'stakeholder_engagement', moduleId: 'p3', approach: 'predictive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'cebok3'], principle: 'stakeholders', process: '2026:PPL-4',
      q: 'Nearby residents oppose planned night concrete pours because of noise and truck traffic. The permit allows the work, but public complaints could threaten later approvals. What should the project manager do FIRST?',
      choices: ['Proceed because the permit establishes the project\'s right to work', 'Cancel night work immediately', 'Analyze affected stakeholders and concerns, then co-design mitigations and a feedback channel', 'Ask the municipality to answer all complaints'], answer: 2,
      mindset: 'Legal permission does not replace stakeholder engagement.',
      weak: 'A ignores relationship and approval risk; B commits before understanding options; D outsources the project\'s engagement responsibility.',
      explain: 'Understand who is affected, what impacts matter, and what mitigations are feasible. Options may include routing, notice windows, monitoring, limited pour dates, or a direct issue channel.',
      errorMap: {0:'context_misread',1:'sequence_error',3:'governance_bypass'},
      transferPrompt: 'Name two mitigations and one feedback signal you would monitor.'
    },
    {
      id: 'v29-ppl-align-done', eco: 'People', task: 'PPL-5', skill: 'expectations_alignment', moduleId: 'p3', approach: 'hybrid', difficulty: 2,
      sourceIds: ['pmp-eco-2026', 'kerzner-cases'], principle: 'stakeholders', process: '2026:PPL-5',
      q: 'The sponsor says a floor is “done” when tenants can enter it. The construction team says it is done at substantial performance, while operations expects training and asset data first. What is the BEST action?',
      choices: ['Use the sponsor\'s definition because the sponsor has authority', 'Facilitate agreement on acceptance criteria, transition evidence, and the owner of each criterion', 'Track all three definitions in separate reports', 'Wait until turnover to resolve the difference'], answer: 1,
      mindset: 'Turn ambiguous expectations into shared, testable acceptance criteria.',
      weak: 'A ignores operational value; C records disagreement without resolving it; D defers a predictable turnover failure.',
      explain: 'Align the stakeholders on what outcome is being accepted, which evidence demonstrates it, and who approves each part. The agreed criteria should then appear in the plan and status reporting.',
      errorMap: {0:'stakeholder_misread',2:'context_misread',3:'sequence_error'},
      transferPrompt: 'Draft one acceptance criterion that includes evidence and an approver.'
    },
    {
      id: 'v29-ppl-manage-customer', eco: 'People', task: 'PPL-6', skill: 'customer_expectations', moduleId: 'p3', approach: 'adaptive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'kerzner-cases'], principle: 'stakeholders', process: '2026:PPL-6',
      q: 'User representatives praise each design review, but a short readiness survey shows that operations does not understand the new maintenance workflow. The sponsor still reports stakeholder satisfaction as green. What should the project manager do?',
      choices: ['Keep the green rating because meeting feedback is positive', 'Change the rating to red without speaking to stakeholders', 'Reconcile the conflicting evidence with users, clarify outcome expectations, and update engagement actions and reporting', 'Ask operations to attend more design meetings'], answer: 2,
      mindset: 'Manage expectations using outcome evidence and feedback, not polite meeting sentiment alone.',
      weak: 'A mistakes fluency and courtesy for readiness; B changes the signal before diagnosis; D prescribes attendance without locating the adoption gap.',
      explain: 'Validate what users expect to be able to do, compare that with readiness evidence, and adjust communication, training, design, or transition actions. Report the uncertainty transparently.',
      errorMap: {0:'context_misread',1:'sequence_error',3:'stakeholder_misread'},
      transferPrompt: 'Define one satisfaction signal and one operational-readiness signal for this stakeholder group.'
    },
    {
      id: 'v29-ppl-transfer-super', eco: 'People', task: 'PPL-7', skill: 'knowledge_transfer', moduleId: 'p3', approach: 'predictive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'cebok3', 'bcp-systems'], principle: 'team', process: '2026:PPL-7',
      q: 'Your general superintendent will leave in four weeks. Much of the phasing logic, inspector history, and trade knowledge exists only in his notebooks and memory. What should you do FIRST?',
      choices: ['Ask him to upload all notebooks on his last day', 'Identify critical knowledge and its future users, then schedule paired handovers around live work', 'Hire a replacement and let the two superintendents decide what matters', 'Create a lessons-learned meeting after he leaves'], answer: 1,
      mindset: 'Transfer starts by identifying critical knowledge, users, and opportunities to demonstrate it.',
      weak: 'A moves documents but not usable knowledge; C provides no transfer structure; D is too late and loses tacit context.',
      explain: 'Prioritize knowledge that is consequential and hard to reconstruct. Pair the departing superintendent with the people who will use it, capture artifacts, and test transfer through real decisions and field walks.',
      errorMap: {0:'knowledge_gap',2:'sequence_error',3:'sequence_error'},
      transferPrompt: 'Identify one tacit knowledge item and the observable task that would prove it transferred.'
    },
    {
      id: 'v29-ppl-report-signal', eco: 'People', task: 'PPL-8', skill: 'communication_planning', moduleId: 'p3', approach: 'hybrid', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'cebok3'], principle: 'systems', process: '2026:PPL-8',
      q: 'The owner wants a monthly executive dashboard, field leaders need daily constraints, and the design team needs weekly decisions. One long report is being sent to everyone and almost nobody uses it. What should the project manager do?',
      choices: ['Add more detail so every audience can find what it needs', 'Tailor information, cadence, owner, and feedback loop for each audience while maintaining one governed data source', 'Send the same report more frequently', 'Stop reporting until stakeholders agree on one format'], answer: 1,
      mindset: 'Design communication around decisions and feedback, not document volume.',
      weak: 'A increases search cost; C increases noise; D suspends necessary transparency.',
      explain: 'Different stakeholders make different decisions at different cadences. Tailor the view and channel while maintaining consistent definitions and a governed source of project data.',
      errorMap: {0:'context_misread',2:'context_misread',3:'sequence_error'},
      transferPrompt: 'For one audience, name the decision, signal, cadence, and feedback loop.'
    },

    {
      id: 'v29-prc-plan-hybrid-design', eco: 'Process', task: 'PRC-1', skill: 'integrated_planning', moduleId: 'p4', approach: 'hybrid', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'kultermann-cmmt', 'bcp-systems'], principle: 'tailoring', process: '2026:PRC-1',
      q: 'A hospital addition has fixed regulatory milestones, but clinical-room layouts will evolve through user mock-ups. Procurement needs early release packages. What delivery approach should the project manager recommend?',
      choices: ['Fully predictive planning with all layouts frozen before procurement', 'Pure agile delivery with no milestone baseline', 'A hybrid plan with governed milestones and early packages, plus iterative room design and controlled integration points', 'Start procurement immediately and choose the approach later'], answer: 2,
      mindset: 'Tailor the approach to uncertainty while preserving integration and governance.',
      weak: 'A ignores useful iteration; B ignores regulatory and procurement commitments; D acts before an integrated delivery strategy exists.',
      explain: 'Use predictive controls where commitments are fixed and iterative methods where user learning is valuable. Define interfaces, decision dates, configuration control, and how evolving layouts enter released packages.',
      errorMap: {0:'context_misread',1:'context_misread',3:'sequence_error'},
      transferPrompt: 'Name one predictive control and one adaptive loop, then identify their integration point.'
    },
    {
      id: 'v29-prc-scope-estimate-gap', eco: 'Process', task: 'PRC-2', skill: 'scope_definition', moduleId: 'p5', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'delpico-estimating', 'contract-admin'], principle: 'systems', process: '2026:PRC-2',
      q: 'While pricing a tender, the civil drawings show a retaining wall but the structural details and specification section are missing. Bid closing is in three days. What should the estimator-project manager do FIRST?',
      choices: ['Carry the cheapest likely wall and stay competitive', 'Exclude the wall without mentioning it', 'Define the scope gap, issue a clarification request, and document a traceable assumption or allowance if no answer arrives', 'Use the wall from the previous project without adjustment'], answer: 2,
      mindset: 'Make ambiguity visible and keep the estimate traceable to documents and assumptions.',
      weak: 'A hides uncertainty in a false point estimate; B creates an undisclosed scope gap; D assumes comparability without checking context.',
      explain: 'Identify the missing requirement, seek clarification, and preserve bid traceability. If an answer is unavailable, use an explicit basis, allowance, qualification, and risk treatment consistent with the procurement rules.',
      errorMap: {0:'overthinking',1:'governance_bypass',3:'context_misread'},
      transferPrompt: 'Write the estimate assumption with scope, quantity basis, cost treatment, and expiry condition.'
    },
    {
      id: 'v29-prc-value-early-use', eco: 'Process', task: 'PRC-3', skill: 'value_delivery', moduleId: 'p4', approach: 'hybrid', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'kerzner-cases'], principle: 'value', process: '2026:PRC-3',
      q: 'The full office renovation will finish in eight months, but the client could occupy two completed floors after month five if life-safety systems and operations readiness are addressed. What should the project manager do?',
      choices: ['Reject partial occupancy because it was not in the original sequence', 'Promise the earlier occupancy date immediately', 'Evaluate incremental value, approvals, interface risks, cost, and readiness, then present a governed option', 'Accelerate every trade on every floor'], answer: 2,
      mindset: 'Explore incremental value without bypassing safety, readiness, or change governance.',
      weak: 'A ignores a value opportunity; B commits before analysis; D spends broadly instead of designing a bounded option.',
      explain: 'Assess whether a safe, compliant, operationally ready partial release produces net value. Define the affected scope and controls, then take an evidence-backed recommendation through governance.',
      errorMap: {0:'context_misread',1:'sequence_error',3:'context_misread'},
      transferPrompt: 'List the minimum release criteria that would make partial occupancy valuable rather than disruptive.'
    },
    {
      id: 'v29-prc-resource-crane', eco: 'Process', task: 'PRC-4', skill: 'resource_optimization', moduleId: 'p5', approach: 'predictive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'kultermann-cmmt'], principle: 'systems', process: '2026:PRC-4',
      q: 'Three trades require the tower crane during the same two-week window. Each claims critical-path priority, but the current schedule models crane time as unlimited. What should the project manager do FIRST?',
      choices: ['Give priority to the trade with the largest contract', 'Add a second crane immediately', 'Model the constrained resource, validate dependencies and alternatives with the trades, then optimize the plan', 'Let the superintendent assign crane time day by day'], answer: 2,
      mindset: 'Make the constraint explicit before choosing a resource response.',
      weak: 'A uses contract size instead of project impact; B purchases a solution before analysis; D manages the collision reactively.',
      explain: 'Treat crane capacity as a real constraint, validate the work logic and lift needs, then compare resequencing, off-shift work, alternate means, and added capacity against value and risk.',
      errorMap: {0:'context_misread',1:'sequence_error',3:'overthinking'},
      transferPrompt: 'Name the data needed to compare resequencing with added crane capacity.'
    },
    {
      id: 'v29-prc-procurement-contract', eco: 'Process', task: 'PRC-5', skill: 'procurement_contracts', moduleId: 'p6', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'construction-law', 'contract-admin', 'delpico-estimating'], principle: 'tailoring', process: '2026:PRC-5',
      q: 'A specialized process package must be ordered now, but design is only 60% complete and the owner wants price certainty. Which procurement strategy is BEST?',
      choices: ['Use a fixed price with no allowances and transfer all design risk to the vendor', 'Delay all procurement until design is complete regardless of schedule impact', 'Define what is sufficiently complete, allocate remaining uncertainty explicitly, and select a contract/pricing mechanism with transparent assumptions and change rules', 'Buy from the lowest bidder using a purchase order'], answer: 2,
      mindset: 'Match contract strategy and risk allocation to the maturity of scope.',
      weak: 'A creates an unpriceable risk premium or disputes; B ignores schedule value; D reduces a complex risk decision to initial price.',
      explain: 'Separate defined from evolving scope, make assumptions and interfaces visible, and choose a commercial model that can govern remaining uncertainty. Evaluate capability, total value, risk allocation, and change mechanisms—not price alone.',
      errorMap: {0:'context_misread',1:'context_misread',3:'stakeholder_misread'},
      transferPrompt: 'Identify two uncertainties that must be allocated and the contract mechanism you would use for each.'
    },
    {
      id: 'v29-prc-finance-contingency', eco: 'Process', task: 'PRC-6', skill: 'project_finance', moduleId: 'p5', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'delpico-estimating', 'practice-std-estimating'], principle: 'risk', process: '2026:PRC-6',
      q: 'An estimate includes a flat 10% contingency, but the basis does not identify the risks it covers. The sponsor asks whether the amount is adequate. What is the BEST response?',
      choices: ['Confirm it because 10% is an industry norm', 'Remove contingency to make the estimate more competitive', 'Identify and quantify relevant uncertainty, distinguish contingency from management reserve, and show the confidence range and basis', 'Increase it to 15% to be safe'], answer: 2,
      mindset: 'Contingency must be traceable to uncertainty, not defended as an unexplained percentage.',
      weak: 'A treats a heuristic as evidence; B hides uncertainty; D changes the number without improving the basis.',
      explain: 'Connect contingency to identified risks and estimate uncertainty, document exclusions and confidence, and keep management reserve governed separately. The sponsor can then judge adequacy against risk tolerance.',
      errorMap: {0:'knowledge_gap',1:'governance_bypass',3:'overthinking'},
      transferPrompt: 'Create a four-column contingency basis: risk, probability/range, cost effect, response owner.'
    },
    {
      id: 'v29-prc-finance-conceptual', eco: 'Process', task: 'PRC-6', skill: 'project_finance', moduleId: 'p5', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'delpico-estimating', 'practice-std-estimating'], principle: 'value', process: '2026:PRC-6',
      q: 'At concept stage, an executive asks for a single construction cost accurate to within 2%. Only gross area, occupancy, and target performance are known. What should the project manager do?',
      choices: ['Provide the requested number using one cost-per-square-foot benchmark', 'Refuse to estimate until construction documents are complete', 'Provide a range-based conceptual estimate with basis, normalization, exclusions, uncertainty, and the decisions it can support', 'Average three unrelated project costs and present the result'], answer: 2,
      mindset: 'Match estimate precision and communication to information maturity.',
      weak: 'A implies false precision; B withholds useful early information; D ignores comparability and normalization.',
      explain: 'Conceptual estimates can support options and feasibility when their basis and uncertainty are explicit. Normalize benchmarks, adjust for context, show a range, and state what new information will narrow it.',
      errorMap: {0:'overthinking',1:'context_misread',3:'calculation_error'},
      transferPrompt: 'List four normalization factors you would check before using a benchmark project.'
    },
    {
      id: 'v29-prc-quality-low-carbon', eco: 'Process', task: 'PRC-7', skill: 'quality_management', moduleId: 'p10', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'kultermann-cmmt', 'bcp-systems'], principle: 'quality', process: '2026:PRC-7',
      q: 'A supplier proposes a lower-carbon concrete mix that meets specified 28-day strength, but early-strength and cold-weather placement data are limited. The pour sequence depends on rapid form cycling. What should the project manager do FIRST?',
      choices: ['Approve it because the sustainability benefit and 28-day strength are sufficient', 'Reject it because any new mix creates risk', 'Evaluate performance requirements, test data, placement conditions, schedule interfaces, and approval criteria before a controlled trial or decision', 'Use it only in hidden locations without telling the designer'], answer: 2,
      mindset: 'Evaluate sustainable alternatives as multi-constraint quality decisions.',
      weak: 'A ignores constructability and early performance; B blocks learning without analysis; D bypasses design and quality governance.',
      explain: 'Confirm all required performance—not one criterion—then define testing, acceptance, cold-weather controls, schedule impacts, and responsible approvals. A bounded trial may reduce uncertainty before broad use.',
      errorMap: {0:'context_misread',1:'overthinking',3:'governance_bypass'},
      transferPrompt: 'Name the test and acceptance evidence needed before the mix affects the critical sequence.'
    },
    {
      id: 'v29-prc-schedule-benchmark', eco: 'Process', task: 'PRC-8', skill: 'schedule_management', moduleId: 'p5', approach: 'predictive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'delpico-estimating', 'kultermann-cmmt'], principle: 'systems', process: '2026:PRC-8',
      q: 'The baseline assumes drywall productivity from a prior low-rise project. The current tower has restricted hoist access and smaller work zones, and actual production is 25% lower. What should the project manager do?',
      choices: ['Direct the trade to meet the baseline rate', 'Replace actual data with the benchmark to keep reports consistent', 'Validate the drivers, update the forecast and response options, and process any approved baseline change through governance', 'Wait another month because one reporting period is not enough'], answer: 2,
      mindset: 'Use historical data as a starting assumption, then learn from current constraints and actuals.',
      weak: 'A ignores system constraints; B hides the signal; D delays analysis despite a material variance.',
      explain: 'Analyze access, crew learning, area release, logistics, and quantity conditions. Forecast transparently, act on controllable constraints, and distinguish forecast updates from authorized baseline changes.',
      errorMap: {0:'context_misread',1:'governance_bypass',3:'overthinking'},
      transferPrompt: 'Separate two controllable productivity drivers from two planning assumptions.'
    },
    {
      id: 'v29-prc-status-ai-forecast', eco: 'Process', task: 'PRC-9', skill: 'status_evaluation', moduleId: 'p9', approach: 'hybrid', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'cebok3'], principle: 'systems', process: '2026:PRC-9',
      q: 'A new forecasting tool predicts on-time completion with 92% confidence, but its training data excludes projects with your regulatory constraints. Executives want the prediction on tomorrow\'s dashboard. What should the project manager do?',
      choices: ['Publish the 92% because the model is more objective than the team', 'Discard the tool permanently', 'Validate inputs and applicability, compare with independent forecast evidence, disclose limitations, and retain accountable human review', 'Lower the confidence to 75% without analysis'], answer: 2,
      mindset: 'Use tools as evidence inputs, not substitutes for validation and accountability.',
      weak: 'A confuses model output with validated truth; B rejects potential value without testing; D changes a number without a basis.',
      explain: 'Check data quality, representativeness, assumptions, and error. Compare the result to current project evidence and communicate limitations so decision-makers understand what the forecast can and cannot support.',
      errorMap: {0:'context_misread',1:'overthinking',3:'calculation_error'},
      transferPrompt: 'Write the one-sentence limitation note that should accompany the forecast.'
    },
    {
      id: 'v29-prc-close-turnover', eco: 'Process', task: 'PRC-10', skill: 'closure_transition', moduleId: 'p4', approach: 'predictive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'bcp-systems', 'contract-admin'], principle: 'value', process: '2026:PRC-10',
      q: 'Construction is physically complete, but operations has not accepted training records, asset data, or seasonal commissioning plans. The sponsor asks you to close the project to release the team. What should you do?',
      choices: ['Close because physical work is complete', 'Transfer every open item to operations without approval', 'Validate transition and closure criteria, assign and govern remaining obligations, then obtain appropriate acceptance before closure', 'Keep the entire construction team indefinitely'], answer: 2,
      mindset: 'Completion is a governed transition of value and obligations, not only physical finish.',
      weak: 'A ignores acceptance criteria; B transfers risk without agreement; D avoids a tailored closeout plan.',
      explain: 'Confirm contractual and operational criteria, acceptance authority, residual obligations, procurement and financial closure, lessons, and ownership of post-project work before releasing resources.',
      errorMap: {0:'knowledge_gap',1:'governance_bypass',3:'overthinking'},
      transferPrompt: 'List the evidence and named approver for one transition criterion.'
    },

    {
      id: 'v29-bus-governance-direction', eco: 'Business Environment', task: 'BUS-1', skill: 'governance', moduleId: 'p8', approach: 'predictive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'contract-admin', 'construction-law'], principle: 'stewardship', process: '2026:BUS-1',
      q: 'An executive who is not in the approved authority matrix directs the team to release a major equipment order today. The schedule benefit is real, but design approval is incomplete. What should the project manager do FIRST?',
      choices: ['Release it because executive direction overrides the matrix', 'Ignore the executive and continue normal work', 'Clarify authority and decision thresholds, assess the release impacts, and route the decision through the defined governance path', 'Ask procurement to place the order verbally so it can be cancelled later'], answer: 2,
      mindset: 'Use governance to make a fast, accountable decision—not to avoid one.',
      weak: 'A bypasses established authority; B ignores a legitimate value question; D creates an uncontrolled commitment.',
      explain: 'Make the required decision, authority, evidence, and escalation path explicit. Governance should enable timely, traceable authorization with understood risk and conditions.',
      errorMap: {0:'governance_bypass',1:'context_misread',3:'governance_bypass'},
      transferPrompt: 'Define the threshold, decision owner, and minimum evidence for the equipment release.'
    },
    {
      id: 'v29-bus-compliance-environment', eco: 'Business Environment', task: 'BUS-2', skill: 'compliance', moduleId: 'p8', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'kultermann-cmmt', 'cebok3'], principle: 'stewardship', process: '2026:BUS-2',
      q: 'Excavation water is cloudier than expected, and the discharge permit has a numeric limit. The field team says stopping the pumps could flood the work area. What should the project manager do FIRST?',
      choices: ['Continue because flooding is the greater project risk', 'Stop all site work for the rest of the week', 'Protect safety, verify compliance data and permit requirements, contain or treat the discharge, and escalate through the defined environmental path', 'Dilute the water so the visible cloudiness is lower'], answer: 2,
      mindset: 'Compliance and safety constraints are decision inputs that require immediate controlled action.',
      weak: 'A knowingly accepts possible noncompliance; B is broader than the evidence supports; D manipulates the symptom and may violate the permit.',
      explain: 'Prevent an uncontrolled discharge while protecting people and the work. Confirm measurements and requirements, use approved containment or treatment, document the event, and involve the accountable environmental and governance roles.',
      errorMap: {0:'context_misread',1:'overthinking',3:'governance_bypass'},
      transferPrompt: 'Write the first-hour action sequence with owner and evidence for each step.'
    },
    {
      id: 'v29-bus-change-verbal', eco: 'Business Environment', task: 'BUS-3', skill: 'change_control', moduleId: 'p6', approach: 'predictive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'contract-admin', 'ccdc-17', 'construction-law'], principle: 'stewardship', process: '2026:BUS-3',
      q: 'At a site walk, the owner verbally asks the team to relocate a service room and says paperwork can follow. The trade can start tomorrow, but the change affects coordination and cost. What should the project manager do?',
      choices: ['Start because the owner requested it', 'Refuse to discuss the change until a formal document arrives', 'Document the request, assess impacts and authority, preserve notice requirements, and obtain the required approval before changed work proceeds', 'Let the trade proceed at its own risk'], answer: 2,
      mindset: 'Convert informal direction into a traceable, authorized change without losing urgency.',
      weak: 'A commits without authority and impact analysis; B is rigid instead of managing the request; D shifts unmanaged risk to the supply chain.',
      explain: 'Capture the direction, clarify what is requested, assess impacts and interfaces, follow contractual notice and change procedures, and obtain authorization appropriate to the work and urgency.',
      errorMap: {0:'governance_bypass',1:'context_misread',3:'stakeholder_misread'},
      transferPrompt: 'Draft the contemporaneous record: request, assumptions, impact status, notice, and decision needed.'
    },
    {
      id: 'v29-bus-issue-supplier', eco: 'Business Environment', task: 'BUS-4', skill: 'issues_impediments', moduleId: 'p6', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'contract-admin', 'delpico-estimating'], principle: 'risk', process: '2026:BUS-4',
      q: 'A critical equipment supplier enters creditor protection. Delivery was previously a risk; it is now unlikely under the current contract. What should the project manager do FIRST?',
      choices: ['Keep it in the risk register until the delivery date is missed', 'Terminate the supplier immediately without reviewing rights or alternatives', 'Recognize and log the issue, assess impact and contractual options, activate responses, and engage the right stakeholders', 'Tell the sponsor the project will be late'], answer: 2,
      mindset: 'Recognize when uncertainty becomes an issue and move from monitoring to coordinated intervention.',
      weak: 'A fails to change response mode; B acts before legal/commercial and supply analysis; D reports an untested conclusion.',
      explain: 'Treat the event as an issue, verify facts and rights, assess schedule and cost impact, evaluate alternate supply and recovery options, and escalate decisions at defined thresholds.',
      errorMap: {0:'knowledge_gap',1:'sequence_error',3:'overthinking'},
      transferPrompt: 'Separate the facts known today from the three decisions that still require evidence.'
    },
    {
      id: 'v29-bus-risk-cyber', eco: 'Business Environment', task: 'BUS-5', skill: 'risk_management', moduleId: 'p9', approach: 'hybrid', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'cebok3'], principle: 'risk', process: '2026:BUS-5',
      q: 'A subcontractor wants to upload coordinated models containing security-sensitive facility data to an unapproved generative-AI service to speed clash review. What is the BEST response?',
      choices: ['Allow it if names are removed from the files', 'Ban all AI tools from the project permanently', 'Pause the upload, assess data classification and policy, involve security and accountable owners, then use an approved bounded workflow if risks are acceptable', 'Ask the subcontractor to accept the cyber risk in writing'], answer: 2,
      mindset: 'Govern sensitive data and AI use through risk ownership, approved controls, and human accountability.',
      weak: 'A assumes de-identification resolves all exposure; B rejects value without assessment; D cannot transfer organizational accountability by letter.',
      explain: 'Confirm classification, permitted use, retention, vendor terms, access, validation, and decision accountability. If an approved tool or sanitized workflow is viable, pilot it within defined controls.',
      errorMap: {0:'knowledge_gap',1:'overthinking',3:'governance_bypass'},
      transferPrompt: 'Write the five control questions required before any model data enters an AI system.'
    },
    {
      id: 'v29-bus-improve-rfi', eco: 'Business Environment', task: 'BUS-6', skill: 'continuous_improvement', moduleId: 'p8', approach: 'hybrid', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'bcp-systems', 'cebok3'], principle: 'quality', process: '2026:BUS-6',
      q: 'Three projects have each generated dozens of RFIs at structure-to-envelope interfaces. Teams close individual RFIs, but the same pattern returns on the next project. What should the program team do?',
      choices: ['Tell coordinators to write faster RFIs', 'Accept the pattern because every project is unique', 'Analyze the recurring interface failure, update reusable review criteria and organizational assets, and verify adoption on the next project', 'Add all old RFIs to the new project folder'], answer: 2,
      mindset: 'Convert repeated local fixes into an improved organizational process.',
      weak: 'A optimizes response rather than prevention; B rejects transferable learning; D stores information without changing practice.',
      explain: 'Identify the common failure mechanism, revise design/constructability checks and responsibilities, make the learning easy to apply, and test whether the next project\'s behavior and outcomes improve.',
      errorMap: {0:'context_misread',1:'context_misread',3:'knowledge_gap'},
      transferPrompt: 'Turn the recurring RFI pattern into one preventive checklist item and one adoption measure.'
    },
    {
      id: 'v29-bus-org-change-fieldapp', eco: 'Business Environment', task: 'BUS-7', skill: 'organizational_change', moduleId: 'p10', approach: 'adaptive', difficulty: 3,
      sourceIds: ['pmp-eco-2026', 'cebok3'], principle: 'change', process: '2026:BUS-7',
      q: 'The company launches a new field-quality app. Superintendents keep parallel paper logs because the mobile workflow adds time and does not match inspections. Leadership labels the problem “resistance.” What should the project manager do FIRST?',
      choices: ['Mandate immediate paperless use and discipline noncompliance', 'Return to paper permanently', 'Assess the work context and adoption barriers with users, then adapt the workflow, support, and rollout measures', 'Schedule more generic software training'], answer: 2,
      mindset: 'Treat adoption as a system change with user context, feedback, and measurable outcomes.',
      weak: 'A forces compliance without fixing work design; B abandons potential value too early; D assumes knowledge is the only barrier.',
      explain: 'Observe the real inspection workflow, identify ability, incentive, trust, and design barriers, then pilot improvements with users. Measure use and quality outcomes rather than training attendance alone.',
      errorMap: {0:'stakeholder_misread',1:'overthinking',3:'context_misread'},
      transferPrompt: 'Name one behavior measure and one outcome measure for the rollout.'
    },
    {
      id: 'v29-bus-external-tariff', eco: 'Business Environment', task: 'BUS-8', skill: 'external_environment', moduleId: 'p10', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'delpico-estimating', 'contract-admin'], principle: 'value', process: '2026:BUS-8',
      q: 'A new tariff may increase imported switchgear cost by 18%, but implementation details are not final. The package is unawarded and the design allows two approved manufacturers. What should the project manager do?',
      choices: ['Award immediately to avoid all possible tariff cost', 'Ignore it until the tariff is legally effective', 'Monitor the external change, assess exposure and options with procurement and design, and prepare trigger-based recommendations for governance', 'Add 18% to the whole project contingency'], answer: 2,
      mindset: 'Translate an external signal into bounded exposure, options, triggers, and accountable decisions.',
      weak: 'A acts before comparing total impacts; B waits until options may disappear; D applies an unscoped allowance.',
      explain: 'Determine affected origin, timing, alternate suppliers, redesign and schedule implications, contract terms, and decision deadlines. Present options with triggers as the external facts mature.',
      errorMap: {0:'sequence_error',1:'context_misread',3:'calculation_error'},
      transferPrompt: 'Write the trigger that would move the team from monitoring to an award or redesign decision.'
    },
    {
      id: 'v29-bus-compliance-notice', eco: 'Business Environment', task: 'BUS-2', skill: 'compliance', moduleId: 'p8', approach: 'predictive', difficulty: 4,
      sourceIds: ['pmp-eco-2026', 'ccdc-17', 'construction-law', 'contract-admin'], principle: 'stewardship', process: '2026:BUS-2',
      q: 'A potential differing-site-condition claim is developing. The contract appears to require notice within a short period, but field facts and cost impact are still incomplete. What should the project manager do FIRST?',
      choices: ['Wait for the final cost before sending anything', 'Submit a fully valued claim using rough numbers', 'Preserve rights with timely factual notice, document conditions and mitigation, and obtain appropriate contract or legal guidance while impacts develop', 'Tell the trade that notice requirements are only administrative'], answer: 2,
      mindset: 'Comply with notice and documentation duties while facts continue to mature.',
      weak: 'A may lose rights; B overstates unsupported impacts; D dismisses a potentially material contractual requirement.',
      explain: 'Follow the governing contract and applicable advice: give timely factual notice, preserve contemporaneous records, mitigate where required, and update the quantified impact as reliable evidence becomes available.',
      errorMap: {0:'sequence_error',1:'overthinking',3:'knowledge_gap'},
      transferPrompt: 'Draft the headings of a neutral notice that preserves facts without overstating entitlement.'
    }
  ];

  var existing = new Set(PMP_SCENARIOS.map(function(item){ return item && item.id; }).filter(Boolean));
  cases.forEach(function(item){ if (!existing.has(item.id)) PMP_SCENARIOS.push(item); });
})();
