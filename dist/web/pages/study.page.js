window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.study = String.raw`
<div class="page" id="study">
            <div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>📖 Study</h2>
                        <p style="color:var(--text-muted);">Learning paths, an evidence-graded science coach, study techniques, PMP practice, and flashcards.</p>
                    </div>
                    <button class="btn btn-primary" onclick="go('flashcards')">🎴 Review Flashcards</button>
                </div>
            </div>
        <div class="filter-bar" id="studyTabs">
            <button class="filter-btn active" onclick="goTab('study','learn')">📖 Learning Paths</button>
            <button class="filter-btn" onclick="goTab('study','sciencecoach')">🧠 Science Coach</button>
            <button class="filter-btn" onclick="goTab('study','studylab')">🧪 Study Techniques</button>
            <button class="filter-btn" onclick="goTab('study','pmptools')">🎓 PMP Practice</button>
            <button class="filter-btn" onclick="goTab('study','flashcards')">🎴 Flashcards</button>
        </div>
        <div class="tab-panel" id="tab-learn">
            <div class="page-header learning-page-head">
                <div>
                    <div class="kicker">Curriculum command center</div>
                    <h2><span>📚</span> Learning Paths</h2>
                    <p>Move from mathematical fluency to field-ready construction judgment—one evidenced capability at a time.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="go('studylab')">🧠 Choose a technique</button>
                    <button class="btn btn-primary" onclick="openTimeModal()">⚡ Quick log</button>
                </div>
            </div>

            <div id="todayLearning"></div>

            <section class="learning-ladder" aria-label="Learning progression">
                <div class="learning-ladder-step"><span>01</span><strong>Fluency</strong><small>Retrieve foundations</small></div>
                <div class="learning-ladder-arrow">→</div>
                <div class="learning-ladder-step"><span>02</span><strong>Application</strong><small>Solve field problems</small></div>
                <div class="learning-ladder-arrow">→</div>
                <div class="learning-ladder-step"><span>03</span><strong>Integration</strong><small>Connect systems</small></div>
                <div class="learning-ladder-arrow">→</div>
                <div class="learning-ladder-step"><span>04</span><strong>Evidence</strong><small>Teach and demonstrate</small></div>
            </section>

            <div class="learning-workspace">
                <section class="learning-main">
                    <div class="card learning-path-card">
                        <div class="section-heading-row">
                            <div>
                                <div class="kicker">Choose your track</div>
                                <h3>Pathways</h3>
                            </div>
                            <span class="badge badge-blue">Progress carries forward</span>
                        </div>
                        <div class="filter-bar learning-filters" id="learnFilters"></div>
                        <div id="learnPathways"></div>
                    </div>
                </section>
                <aside class="learning-rail">
                    <div class="card">
                        <div class="kicker">How to use this page</div>
                        <h3 class="learning-rail-title">Study for evidence</h3>
                        <ol class="learning-use-list">
                            <li>Attempt before reviewing.</li>
                            <li>Check and classify errors.</li>
                            <li>Re-solve after spacing.</li>
                            <li>Attach an artifact or teach-back.</li>
                        </ol>
                    </div>
                    <button class="card learning-action-card" onclick="go('flashcards')">
                        <span class="learning-action-icon">🎴</span>
                        <span><strong>Review due cards</strong><small>Retrieval before re-reading</small></span>
                        <span>→</span>
                    </button>
                    <button class="card learning-action-card" onclick="go('pmptools')">
                        <span class="learning-action-icon">🎓</span>
                        <span><strong>Practice PMP scenarios</strong><small>2026 ECO weighting</small></span>
                        <span>→</span>
                    </button>
                </aside>
            </div>

            <details class="card curriculum-atlas-card" open>
                <summary>
                    <span><span class="kicker">Your cornerstone library</span><strong>8-book curriculum atlas</strong></span>
                    <span class="badge">Source mapped</span>
                </summary>
                <div id="foundationSourceAtlas"></div>
            </details>

            <details class="card legacy-reference-card">
                <summary>
                    <span><span class="kicker">Reference only</span><strong>Legacy PMP 49-process map</strong></span>
                    <span><strong id="pmpProcessPct">0%</strong> · <span id="pmpProcessCount">0/49</span></span>
                </summary>
                <p class="muted">Useful vocabulary and historical process guidance; it is not the July 2026 exam blueprint.</p>
                <div id="pmpProcessGrid"></div>
            </details>
        </div>
        <div class="tab-panel" id="tab-sciencecoach" style="display:none;">
            <div class="page-header science-page-head">
                <div>
                    <div class="kicker">V30 · Evidence-guided learning</div>
                    <h2><span>🧠</span> Science Coach</h2>
                    <p>Turn neuroscience and learning research into observable practice—without brain hacks, medical advice, or false precision.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="go('studylab')">🧪 Technique library</button>
                    <button class="btn btn-primary" onclick="scienceScrollToCycle()">▶ Start a learning cycle</button>
                </div>
            </div>

            <div class="science-integrity-banner">
                <span data-icon="scale"></span>
                <div><strong>Evidence rule</strong><p>Huberman Lab is used to discover ideas. StudyOS implements a claim only after checking primary research or a research synthesis, and it labels important limits beside the recommendation.</p></div>
                <span class="badge badge-blue">Reviewed 2026-07-22</span>
            </div>

            <div class="summary-strip science-summary" id="scienceSummary"></div>

            <div class="science-coach-layout">
                <section class="science-coach-main">
                    <div class="card science-readiness-card">
                        <div class="section-heading-row">
                            <div><div class="kicker">Optional context</div><h3>Readiness check</h3></div>
                            <span class="badge">Self-report · not diagnostic</span>
                        </div>
                        <p class="muted science-card-intro">Rate how today feels. The coach changes the starting workload, but you remain in control and can override it.</p>
                        <div class="science-rating-grid">
                            <label><span>Sleep quality</span><select class="form-select" id="scienceSleep" onchange="scienceUpdateRecommendation()"><option value="">Not rated</option><option value="1">1 · Very poor</option><option value="2">2 · Poor</option><option value="3">3 · Okay</option><option value="4">4 · Good</option><option value="5">5 · Very good</option></select></label>
                            <label><span>Energy now</span><select class="form-select" id="scienceEnergy" onchange="scienceUpdateRecommendation()"><option value="">Not rated</option><option value="1">1 · Very low</option><option value="2">2 · Low</option><option value="3">3 · Moderate</option><option value="4">4 · High</option><option value="5">5 · Very high</option></select></label>
                            <label><span>Stress / activation</span><select class="form-select" id="scienceStress" onchange="scienceUpdateRecommendation()"><option value="">Not rated</option><option value="1">1 · Settled</option><option value="2">2 · Mild</option><option value="3">3 · Noticeable</option><option value="4">4 · High</option><option value="5">5 · Overloaded</option></select></label>
                            <label><span>Focus confidence</span><select class="form-select" id="scienceFocus" onchange="scienceUpdateRecommendation()"><option value="">Not rated</option><option value="1">1 · Very low</option><option value="2">2 · Low</option><option value="3">3 · Moderate</option><option value="4">4 · High</option><option value="5">5 · Very high</option></select></label>
                        </div>
                        <div id="scienceReadinessRecommendation" class="science-recommendation unrated"></div>
                    </div>

                    <div class="card science-cycle-card" id="scienceCycleCard">
                        <div class="section-heading-row">
                            <div><div class="kicker">Attempt → feedback → spacing</div><h3>Run a learning cycle</h3></div>
                            <span class="science-grade strong">Strong core</span>
                        </div>
                        <div class="science-form-grid two">
                            <label class="form-group science-span-2"><span class="form-label">Topic or skill *</span><input class="form-input" id="scienceTopic" placeholder="e.g. earned value forecast, differential equations, concrete durability"></label>
                            <label class="form-group"><span class="form-label">Learning domain</span><select class="form-select" id="scienceDomain"><option value="technical">Technical</option><option value="strategic">Strategic / PMP</option><option value="leadership">Leadership / communication</option></select></label>
                            <label class="form-group"><span class="form-label">Current task experience</span><select class="form-select" id="scienceExperience"><option value="new">New procedure</option><option value="developing" selected>Developing</option><option value="experienced">Experienced / transfer</option></select></label>
                            <label class="form-group"><span class="form-label">Learning method</span><select class="form-select" id="scienceMethod"><option value="retrieval">Retrieval + feedback</option><option value="worked-example">Worked example → faded steps</option><option value="mixed-discrimination">Mixed discrimination practice</option><option value="explain-check">Explain from memory → check</option><option value="creative-incubation">Generate → incubate → evaluate</option></select></label>
                            <label class="form-group"><span class="form-label">Focus block</span><select class="form-select" id="scienceDuration" onchange="scienceUpdateCustomDuration()"><option value="25">25 minutes</option><option value="45" selected>45 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes · user choice</option><option value="custom">Custom</option></select></label>
                            <label class="form-group science-span-2" id="scienceCustomDurationWrap" style="display:none;"><span class="form-label">Custom minutes (10–120)</span><input class="form-input" id="scienceCustomDuration" type="number" min="10" max="120" value="35"></label>
                        </div>

                        <div class="science-cycle-phase">
                            <div class="science-phase-number">1</div>
                            <div><strong>Generate before looking</strong><small>A prediction, attempted solution, or closed-book brain dump. Wrong is useful only when you inspect and correct it.</small></div>
                        </div>
                        <textarea class="form-textarea" id="sciencePretest" aria-label="Pre-study attempt or prediction" placeholder="What can you recall, predict, or attempt before opening the source?"></textarea>
                        <label class="form-group science-compact-field"><span class="form-label">Confidence before feedback</span><select class="form-select" id="scienceConfidenceBefore"><option value="">Not rated</option><option value="1">1 · Guessing</option><option value="2">2</option><option value="3">3 · Unsure</option><option value="4">4</option><option value="5">5 · Certain</option></select></label>

                        <div class="science-cycle-actions">
                            <button class="btn btn-primary" onclick="scienceStartFocus()">▶ Start selected focus block</button>
                            <span>Study or solve, then return here without your source open.</span>
                        </div>

                        <div class="science-cycle-phase">
                            <div class="science-phase-number">2</div>
                            <div><strong>Retrieve, compare, and correct</strong><small>Judge the answer against an external standard. Classify the gap so the next attempt targets a skill rather than “studying harder.”</small></div>
                        </div>
                        <div class="science-form-grid two">
                            <label class="form-group"><span class="form-label">Closed-book result *</span><select class="form-select" id="scienceOutcome" onchange="scienceUpdateReviewSuggestion()"><option value="">Choose result</option><option value="0">Blank or wrong</option><option value="1">Partial</option><option value="2">Correct with a cue</option><option value="3">Independent and correct</option></select></label>
                            <label class="form-group"><span class="form-label">Primary gap</span><select class="form-select" id="scienceGap"><option value="none">No clear gap</option><option value="fact">Missing fact / definition</option><option value="concept">Concept / mental model</option><option value="procedure">Procedure / sequence</option><option value="discrimination">Chose the wrong method</option><option value="transfer">Could not apply in context</option><option value="attention">Attention / interruption</option></select></label>
                            <label class="form-group science-span-2"><span class="form-label">Correction or next strategy *</span><textarea class="form-textarea" id="scienceCorrection" placeholder="What did the answer, standard, worked example, or feedback show?"></textarea></label>
                            <label class="form-group science-span-2"><span class="form-label">Ready-to-resume note</span><input class="form-input" id="scienceResumeNote" placeholder="If interrupted: where did you stop, and what exact action comes next?"></label>
                            <label class="form-group"><span class="form-label">Confidence after feedback</span><select class="form-select" id="scienceConfidenceAfter"><option value="">Not rated</option><option value="1">1 · Guessing</option><option value="2">2</option><option value="3">3 · Unsure</option><option value="4">4</option><option value="5">5 · Certain</option></select></label>
                            <label class="form-group"><span class="form-label">Next retrieval gap</span><select class="form-select" id="scienceReviewDays"><option value="">Use performance suggestion</option><option value="1">1 day</option><option value="2">2 days</option><option value="3">3 days</option><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></select><small id="scienceReviewSuggestion" class="form-help"></small></label>
                        </div>
                        <div class="science-options-row">
                            <label><input type="checkbox" id="scienceCreateTask" checked> Create a dated retrieval task</label>
                            <label><input type="checkbox" id="scienceQuietRest"> I took a brief low-input break afterward</label>
                        </div>
                        <div class="science-cycle-footer">
                            <button class="btn btn-secondary" onclick="scienceClearCycleForm(false)">Clear cycle</button>
                            <button class="btn btn-primary" onclick="scienceSaveCycle()">💾 Save evidence &amp; schedule retrieval</button>
                        </div>
                    </div>
                </section>

                <aside class="science-coach-rail">
                    <div class="card science-sequence-card">
                        <div class="kicker">What actually matters</div>
                        <h3>Learning evidence ladder</h3>
                        <ol>
                            <li><span>01</span><div><strong>Attempt</strong><small>Generate or retrieve before review.</small></div></li>
                            <li><span>02</span><div><strong>Check</strong><small>Use an answer, standard, or expert feedback.</small></div></li>
                            <li><span>03</span><div><strong>Correct</strong><small>Name the gap and change the strategy.</small></div></li>
                            <li><span>04</span><div><strong>Retrieve later</strong><small>Test retention after a meaningful delay.</small></div></li>
                            <li><span>05</span><div><strong>Transfer</strong><small>Apply it in a new problem or field context.</small></div></li>
                        </ol>
                    </div>
                    <div class="card">
                        <div class="section-heading-row"><div><div class="kicker">Recent evidence</div><h3>Your cycles</h3></div></div>
                        <div id="scienceCycleHistory"></div>
                    </div>
                    <div class="card science-neuromyth-card">
                        <div class="kicker">Neuroscience without myths</div>
                        <h3>Plasticity is a capacity, not a protocol</h3>
                        <p>Practice can change performance and neural processing, but a neurotransmitter story does not prove a teaching method. StudyOS judges methods by delayed recall, transfer, feedback, and calibration.</p>
                        <ul><li>No learning styles</li><li>No dopamine score</li><li>No fixed 21-day habit finish line</li><li>No universal 90-minute biological rule</li></ul>
                    </div>
                </aside>
            </div>

            <section class="science-evidence-section">
                <div class="section-heading-row">
                    <div><div class="kicker">Transparent source trail</div><h3>Evidence registry</h3><p>Open any item to see the practical rule, boundary conditions, and primary source trail.</p></div>
                    <div class="filter-bar" id="scienceEvidenceFilters"></div>
                </div>
                <div id="scienceEvidenceList" class="science-evidence-list"></div>
            </section>

            <section class="card science-source-trail">
                <div><div class="kicker">Discovery sources</div><h3>Huberman topic trail</h3><p>These official topic pages shaped the audit. Their claims were not automatically accepted; implementation follows the graded registry above.</p></div>
                <div id="scienceHubermanTopics"></div>
            </section>
        </div>
        <div class="tab-panel" id="tab-studylab" style="display:none;">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>🧠</span> Study Techniques
                        </h2>
                        <p>Evidence-based learning techniques from cognitive science</p>
                    </div>
                    <button class="btn btn-secondary" onclick="go('learn')">← Back to Learning Paths</button>
                </div>
            </div>
            
            <!-- Core Principle Banner -->
            <div class="card" style="background:linear-gradient(135deg, rgba(168,85,247,0.1), rgba(249,115,22,0.1));border:none;margin-bottom:20px;">
                <div style="text-align:center;padding:10px 0;">
                    <div style="font-size:1.1rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">💡 Core Principle</div>
                    <div style="color:var(--text-secondary);font-style:italic;max-width:600px;margin:0 auto;">"Learning is deeper and more durable when it's effortful. Easy learning is like writing in sand, here today and gone tomorrow."</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">— Make it Stick, Brown, Roediger & McDaniel</div>
                </div>
            </div>
            
            <!-- Technique Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:20px;">
                
                <!-- Active Recall -->
                <div class="card study-technique-card" onclick="openTechniqueModal('recall')">
                    <div style="display:flex;align-items:flex-start;gap:14px;">
                        <div style="font-size:2rem;">🎯</div>
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:1.05rem;margin-bottom:6px;color:var(--accent);">Active Recall</div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">Test yourself instead of only re-reading. Retrieval supports durable retention and exposes gaps so feedback can correct them.</div>
                            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
                                <span class="tag-chip" style="font-size:0.7rem;">Flashcards</span>
                                <span class="tag-chip" style="font-size:0.7rem;">Practice Tests</span>
                                <span class="tag-chip" style="font-size:0.7rem;">Blank Page</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Spaced Repetition -->
                <div class="card study-technique-card" onclick="openTechniqueModal('spaced')">
                    <div style="display:flex;align-items:flex-start;gap:14px;">
                        <div style="font-size:2rem;">📅</div>
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:1.05rem;margin-bottom:6px;color:var(--purple);">Spaced Repetition</div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">Distribute retrieval over time. Review sooner after a failed recall and expand the gap after an independent answer—there is no universal perfect interval sequence.</div>
                            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(168,85,247,0.15);color:var(--purple);">Anki</span>
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(168,85,247,0.15);color:var(--purple);">Schedule Reviews</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Interleaving -->
                <div class="card study-technique-card" onclick="openTechniqueModal('interleave')">
                    <div style="display:flex;align-items:flex-start;gap:14px;">
                        <div style="font-size:2rem;">🔀</div>
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:1.05rem;margin-bottom:6px;color:var(--success);">Interleaving</div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">Mix related, confusable problem types when selecting the correct method is part of the skill. Use focused examples first for a completely new procedure.</div>
                            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(34,197,94,0.15);color:var(--success);">Mixed Practice</span>
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(34,197,94,0.15);color:var(--success);">Vary Problems</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Feynman Technique -->
                <div class="card study-technique-card" onclick="openTechniqueModal('feynman')">
                    <div style="display:flex;align-items:flex-start;gap:14px;">
                        <div style="font-size:2rem;">👨‍🏫</div>
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:1.05rem;margin-bottom:6px;color:#58a6ff;">Feynman Technique</div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">Explain from memory in plain language, expose gaps, then verify the explanation against a source or example so fluency does not rehearse an error.</div>
                            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(88,166,255,0.15);color:#58a6ff;">Teach Others</span>
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(88,166,255,0.15);color:#58a6ff;">Simplify</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Elaboration -->
                <div class="card study-technique-card" onclick="openTechniqueModal('elaboration')">
                    <div style="display:flex;align-items:flex-start;gap:14px;">
                        <div style="font-size:2rem;">🔗</div>
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:1.05rem;margin-bottom:6px;color:var(--warning);">Elaboration</div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">Connect new information to what you already know. Ask "why" and "how" questions. Create mental models and analogies.</div>
                            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(245,158,11,0.15);color:var(--warning);">Mental Models</span>
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(245,158,11,0.15);color:var(--warning);">Analogies</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Generation -->
                <div class="card study-technique-card" onclick="openTechniqueModal('generation')">
                    <div style="display:flex;align-items:flex-start;gap:14px;">
                        <div style="font-size:2rem;">✏️</div>
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:1.05rem;margin-bottom:6px;color:var(--danger);">Generation Effect</div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">Predict or attempt before instruction when corrective feedback follows. For unfamiliar procedures, a worked example may be a better starting point.</div>
                            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(239,68,68,0.15);color:var(--danger);">Try First</span>
                                <span class="tag-chip" style="font-size:0.7rem;background:rgba(239,68,68,0.15);color:var(--danger);">Productive Failure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Learning support conditions -->
            <div class="card" style="margin-bottom:16px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">🧬 Learning Support Conditions</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
                    <div style="padding:14px;background:var(--bg-tertiary);border-radius:8px;">
                        <div style="font-weight:600;margin-bottom:6px;">😴 Sleep</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">Regular, sufficient sleep supports memory consolidation. Protect a schedule that leaves you alert enough to retrieve and apply what you studied.</div>
                    </div>
                    <div style="padding:14px;background:var(--bg-tertiary);border-radius:8px;">
                        <div style="font-weight:600;margin-bottom:6px;">🏃 Exercise</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">Regular physical activity supports general health and cognition; it complements, but does not replace, effective practice.</div>
                    </div>
                    <div style="padding:14px;background:var(--bg-tertiary);border-radius:8px;">
                        <div style="font-weight:600;margin-bottom:6px;">💧 Hydration</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">Avoid meaningful dehydration and keep water available. More water is not a learning technique by itself.</div>
                    </div>
                    <div style="padding:14px;background:var(--bg-tertiary);border-radius:8px;">
                        <div style="font-weight:600;margin-bottom:6px;">⏱️ Breaks</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">25/5 is one useful focus rhythm. Adjust block and break length to the task, fatigue, and the quality of your recall.</div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Study Session Launcher -->
            <div class="card" style="background:linear-gradient(135deg, var(--bg-secondary), rgba(249,115,22,0.1));border-color:var(--accent);">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">⚡ Quick Study Session</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">
                    <button class="btn btn-secondary" onclick="startStudySession('recall', 15)" style="display:flex;flex-direction:column;align-items:center;padding:16px;gap:6px;">
                        <span style="font-size:1.5rem;">🎯</span>
                        <span>15-min Recall</span>
                    </button>
                    <button class="btn btn-secondary" onclick="startStudySession('feynman', 20)" style="display:flex;flex-direction:column;align-items:center;padding:16px;gap:6px;">
                        <span style="font-size:1.5rem;">👨‍🏫</span>
                        <span>20-min Feynman</span>
                    </button>
                    <button class="btn btn-secondary" onclick="startStudySession('pomodoro', 25)" style="display:flex;flex-direction:column;align-items:center;padding:16px;gap:6px;">
                        <span style="font-size:1.5rem;">🍅</span>
                        <span>25-min Pomodoro</span>
                    </button>
                    <button class="btn btn-secondary" onclick="startStudySession('interleave', 30)" style="display:flex;flex-direction:column;align-items:center;padding:16px;gap:6px;">
                        <span style="font-size:1.5rem;">🔀</span>
                        <span>30-min Interleave</span>
                    </button>
                </div>
            </div>
            
            <!-- Study Log -->
            <div class="card" style="margin-top:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">📊 Technique Usage</span>
                </div>
                <div id="techniqueUsageStats"></div>
            </div>
        </div>
        <div class="tab-panel" id="tab-pmptools" style="display:none;">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>🎓</span> PMP Practice
                        </h2>
                        <p>PMP + CEBOK3 + Construction Estimating</p>
                    </div>
                </div>
            </div>
            <div class="filter-bar" id="pmpToolTabs" style="margin-bottom:20px;"></div>
            <div id="pmpToolContent"></div>
        </div>
        <div class="tab-panel" id="tab-flashcards" style="display:none;">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>🃏</span> Flashcards
                        </h2>
                        <p>Adaptive retrieval practice with performance-based spacing</p>
                    </div>
                    <button class="btn btn-primary" onclick="openFlashcardModal()" style="display:flex;align-items:center;gap:8px;">
                        <span>➕</span> New Card
                    </button>
                </div>
            </div>
            
            <!-- SRS Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;">
                <div class="card" style="text-align:center;padding:16px;background:linear-gradient(135deg, var(--bg-secondary), rgba(239,68,68,0.1));border-color:var(--danger);">
                    <div style="font-size:2rem;font-weight:700;color:var(--danger);" id="srsDueNow">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Due Now</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:2rem;font-weight:700;color:var(--accent);" id="srsDueToday">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Due Today</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:2rem;font-weight:700;color:var(--purple);" id="srsTotal">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Total Cards</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:2rem;font-weight:700;color:var(--success);" id="srsStreak">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Day Streak</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;background:linear-gradient(135deg, var(--bg-secondary), rgba(59,130,246,0.1));border-color:var(--info);">
                    <div style="font-size:2rem;font-weight:700;color:var(--info);" id="srsCalibration">—</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Calibration</div>
                </div>
            </div>
            
            <!-- Review Mode Toggle -->
            <div class="srs-mode-panel">
                <span class="srs-mode-title">Review mode</span>
                <div id="srsModeToggle"></div>
            </div>
            
            <!-- Start Review Button -->
            <div class="card" style="text-align:center;padding:24px;margin-bottom:20px;" id="srsStartReview">
                <div style="font-size:3rem;margin-bottom:12px;">🧠</div>
                <div style="font-size:1.1rem;margin-bottom:16px;" id="srsReviewPrompt">You have cards to review!</div>
                <button class="btn btn-primary" onclick="startSRSReview()" style="padding:14px 32px;font-size:1rem;">
                    ▶️ Start Review Session
                </button>
            </div>
            
            <!-- Active Review Area (hidden by default) -->
            <div id="srsReviewArea" style="display:none;">
                <div class="flashcard" id="currentFlashcard" onclick="flipCard()">
                    <div class="flashcard-meta" id="cardMeta">Card 1 of 10</div>
                    <div class="flashcard-front" id="cardFront">
                        <div class="flashcard-question" id="cardQuestion">Question goes here</div>
                        <div class="flashcard-hint">Click to reveal answer</div>
                    </div>
                    <div class="flashcard-back" id="cardBack" style="display:none;">
                        <div class="flashcard-answer" id="cardAnswer">Answer goes here</div>
                    </div>
                </div>
                <!-- Confidence Rating -->
                <div id="cardConfidence" style="display:none;text-align:center;margin-bottom:12px;"></div>
                <div class="flashcard-difficulty" id="cardDifficulty" style="display:none;">
                    <button class="difficulty-btn again" onclick="rateCard('again')"><strong>Again</strong><small>Blank or wrong · <span id="srsAgainInterval">1 day</span></small></button>
                    <button class="difficulty-btn hard" onclick="rateCard('hard')"><strong>Hard</strong><small>Correct with effort · <span id="srsHardInterval">2 days</span></small></button>
                    <button class="difficulty-btn good" onclick="rateCard('good')"><strong>Good</strong><small>Correct · <span id="srsGoodInterval">3 days</span></small></button>
                    <button class="difficulty-btn easy" onclick="rateCard('easy')"><strong>Easy</strong><small>Fast and certain · <span id="srsEasyInterval">7 days</span></small></button>
                </div>
            </div>
            
            <!-- Card List -->
            <div class="card" style="margin-top:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">📚 All Cards</span>
                    <div class="filter-bar" id="srsFilters" style="padding:0;margin:0;"></div>
                </div>
                <div id="flashcardsList"></div>
            </div>
        </div>
        </div>
    `;
